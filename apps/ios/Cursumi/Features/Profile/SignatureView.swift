import SwiftUI

/// Firma del usuario para los certificados: muestra la actual, permite dibujar
/// una nueva con el dedo, guardarla (PNG) o eliminarla.
struct SignatureView: View {
    @State private var current: String?
    @State private var loading = true
    @State private var saving = false
    @State private var deleting = false
    @State private var error: String?
    @State private var done: String?
    @State private var strokes: [[CGPoint]] = []
    @State private var confirmDelete = false
    private let api = StudentAPI()

    private var hasDrawing: Bool { strokes.contains { $0.count > 1 } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if loading {
                    ProgressView().frame(maxWidth: .infinity).padding(.top, 40)
                } else {
                    currentSection
                    drawSection
                }
                if let error { Text(error).foregroundStyle(Brand.danger).font(.subheadline) }
                if let done { Text(done).foregroundStyle(Brand.success).font(.subheadline) }
            }
            .padding(16)
        }
        .navigationTitle("Mi firma")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load(); loading = false }
        .confirmationDialog("¿Eliminar tu firma?", isPresented: $confirmDelete, titleVisibility: .visible) {
            Button("Eliminar", role: .destructive) { Task { await remove() } }
            Button("Cancelar", role: .cancel) {}
        } message: {
            Text("Los certificados nuevos saldrán sin firma hasta que subas otra.")
        }
    }

    @ViewBuilder
    private var currentSection: some View {
        Text("Firma actual").font(.headline)
        if let current {
            SignatureImage(source: current)
                .frame(maxWidth: .infinity).frame(height: 140)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.25)))
            Button(role: .destructive) { confirmDelete = true } label: {
                HStack {
                    Label("Eliminar firma", systemImage: "trash")
                    if deleting { Spacer(); ProgressView() }
                }
            }
            .disabled(deleting || saving)
        } else {
            Text("Aún no tienes firma. Dibújala abajo: aparecerá en los certificados que emitas.")
                .font(.subheadline).foregroundStyle(.secondary)
        }
    }

    @ViewBuilder
    private var drawSection: some View {
        Text(current == nil ? "Dibuja tu firma" : "Dibujar una nueva").font(.headline).padding(.top, 8)
        SignaturePad(strokes: $strokes)
            .frame(height: 220)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.35), style: StrokeStyle(lineWidth: 1, dash: [6])))
        Text("Usa el dedo sobre el recuadro blanco. Trazo negro, fondo blanco.")
            .font(.caption).foregroundStyle(.secondary)
        HStack(spacing: 12) {
            Button("Limpiar") { strokes = []; done = nil }
                .buttonStyle(.bordered)
                .disabled(strokes.isEmpty || saving)
            PrimaryButton(title: current == nil ? "Guardar firma" : "Reemplazar firma", loading: saving, disabled: !hasDrawing || deleting) {
                Task { await save() }
            }
        }
    }

    private func load() async {
        error = nil
        do { current = try await api.signature().url } catch { self.error = "No se pudo cargar tu firma." }
    }

    @MainActor
    private func save() async {
        error = nil; done = nil
        let renderer = ImageRenderer(content: SignaturePadCanvas(strokes: strokes).frame(width: 600, height: 240).background(Color.white))
        renderer.scale = 2
        guard let png = renderer.uiImage?.pngData() else { error = "No se pudo generar la imagen de la firma."; return }
        guard png.count <= 4 * 1024 * 1024 else { error = "La firma pesa más de 4 MB; simplifícala."; return }
        saving = true
        defer { saving = false }
        do {
            let url = try await api.uploadSignature(png: png)
            current = url
            if url == nil { await load() }
            strokes = []
            done = "Firma guardada ✓"
        } catch { self.error = error.localizedDescription }
    }

    private func remove() async {
        error = nil; done = nil; deleting = true
        defer { deleting = false }
        do {
            try await api.deleteSignature()
            current = nil
            done = "Firma eliminada."
        } catch { self.error = error.localizedDescription }
    }
}

/// Lienzo que captura trazos con el dedo.
private struct SignaturePad: View {
    @Binding var strokes: [[CGPoint]]

    var body: some View {
        SignaturePadCanvas(strokes: strokes)
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0, coordinateSpace: .local)
                    .onChanged { value in
                        if value.translation == .zero || strokes.isEmpty {
                            strokes.append([value.location])
                        } else {
                            strokes[strokes.count - 1].append(value.location)
                        }
                    }
                    .onEnded { value in
                        // Un toque sin arrastre deja un punto: lo dibujamos como trazo mínimo.
                        if let last = strokes.last, last.count == 1 { strokes[strokes.count - 1].append(value.location) }
                    }
            )
    }
}

/// Dibujo de los trazos (también se usa para renderizar el PNG).
private struct SignaturePadCanvas: View {
    let strokes: [[CGPoint]]

    var body: some View {
        Canvas { context, _ in
            for stroke in strokes where !stroke.isEmpty {
                var path = Path()
                path.move(to: stroke[0])
                for point in stroke.dropFirst() { path.addLine(to: point) }
                if stroke.count == 1 { path.addLine(to: stroke[0]) }
                context.stroke(path, with: .color(.black), style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
            }
        }
    }
}

/// Imagen de la firma desde una URL https o un `data:image/png;base64,…`.
struct SignatureImage: View {
    let source: String

    var body: some View {
        if let image = Self.inlineImage(source) {
            Image(uiImage: image).resizable().scaledToFit().padding(8)
        } else if let url = URL(string: source) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image): image.resizable().scaledToFit().padding(8)
                case .failure: Image(systemName: "exclamationmark.triangle").foregroundStyle(.secondary)
                default: ProgressView()
                }
            }
        } else {
            Image(systemName: "signature").foregroundStyle(.secondary)
        }
    }

    /// Decodifica un data URL base64; nil si no lo es.
    static func inlineImage(_ source: String) -> UIImage? {
        guard source.hasPrefix("data:"), let comma = source.firstIndex(of: ",") else { return nil }
        let header = source[source.startIndex..<comma]
        guard header.contains(";base64") else { return nil }
        let payload = String(source[source.index(after: comma)...])
        return Data(base64Encoded: payload, options: .ignoreUnknownCharacters).flatMap(UIImage.init)
    }
}
