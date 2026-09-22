import PhotosUI
import SwiftUI

/// Alta de un curso (queda como borrador; se publica desde el panel).
struct CourseCreatorView: View {
    private static let levels = ["Principiante", "Intermedio", "Avanzado"]

    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var description = ""
    @State private var category = ""
    @State private var level = "Principiante"
    @State private var modality = "virtual"
    @State private var duration = ""
    @State private var price = ""
    @State private var imageUrl = ""
    @State private var sections: [NewSection] = []
    @State private var categories: [Category] = []
    @State private var saving = false
    @State private var error: String?
    @State private var done = false
    private let api = InstructorAPI()

    var body: some View {
        Form {
            if done {
                Section {
                    Text("¡Curso creado! 🎉").font(.headline)
                    Text("Se guardó como borrador. Publícalo desde Panel de instructor → Cursos.").foregroundStyle(.secondary)
                    Button("Listo") { dismiss() }
                }
            } else {
                Section("Datos") {
                    TextField("Título", text: $title)
                    TextField("Descripción", text: $description, axis: .vertical).lineLimit(3...6)
                    Picker("Categoría", selection: $category) {
                        Text("—").tag("")
                        ForEach(categories) { Text($0.name).tag($0.name) }
                    }
                    Picker("Nivel", selection: $level) { ForEach(Self.levels, id: \.self) { Text($0) } }
                    Picker("Tipo de curso", selection: $modality) {
                        Text("En video").tag("virtual")
                        Text("Por evento").tag("evento")
                    }
                    .pickerStyle(.segmented)
                    if modality == "evento" {
                        Text("Las sesiones (fechas, presencial o videollamada) se configuran desde la web.")
                            .font(.footnote).foregroundStyle(.secondary)
                    }
                }
                Section {
                    TextField("Duración estimada", text: $duration)
                    TextField("Precio (MXN)", text: $price).keyboardType(.numberPad)
                    TextField("URL de imagen de portada (opcional)", text: $imageUrl).keyboardType(.URL).textInputAutocapitalization(.never)
                } footer: {
                    Text("Duración: ej. «6 horas» o «4 semanas». Precio en pesos; 0 = gratis.")
                }
                ForEach($sections) { $section in
                    Section {
                        TextField("Título de la sección", text: $section.title)
                        ForEach($section.lessons) { $lesson in
                            LessonEditor(lesson: $lesson, onError: { error = $0 })
                        }
                        Button { section.lessons.append(NewLesson(order: section.lessons.count)) } label: {
                            Label("Agregar lección", systemImage: "plus")
                        }
                    } header: {
                        Text("Sección \((sections.firstIndex { $0.id == section.id } ?? 0) + 1)")
                    }
                }
                Section {
                    Button { sections.append(NewSection(order: sections.count)) } label: { Label("Agregar sección", systemImage: "plus.rectangle.on.rectangle") }
                }
                if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
                Section {
                    PrimaryButton(title: "Crear curso (borrador)", loading: saving) { Task { await submit() } }
                        .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                }
            }
        }
        .navigationTitle("Crear curso")
        .task { categories = (try? await api.categories()) ?? [] }
    }

    private func submit() async {
        error = nil
        let t = title.trimmingCharacters(in: .whitespaces), d = description.trimmingCharacters(in: .whitespacesAndNewlines), dur = duration.trimmingCharacters(in: .whitespaces)
        guard !t.isEmpty, !d.isEmpty, !category.isEmpty, !dur.isEmpty, let p = Double(price) else {
            error = "Completa título, descripción, categoría, duración y precio."
            return
        }
        saving = true
        defer { saving = false }
        let cleanSections = sections
            .filter { !$0.title.trimmingCharacters(in: .whitespaces).isEmpty }
            .enumerated().map { si, s -> NewSection in
                var sec = s
                sec.title = s.title.trimmingCharacters(in: .whitespaces)
                sec.order = si
                sec.lessons = s.lessons.filter { !$0.title.trimmingCharacters(in: .whitespaces).isEmpty }
                    .enumerated().map { li, l in var x = l; x.title = l.title.trimmingCharacters(in: .whitespaces); x.order = li; return x }
                return sec
            }
        do {
            _ = try await api.createCourse(NewCoursePayload(
                title: t, description: d, category: category, level: level, modality: modality,
                courseType: modality == "virtual" ? "ondemand" : "fechado", startDate: "",
                duration: dur, price: max(0, p), imageUrl: imageUrl.isEmpty ? nil : imageUrl.trimmingCharacters(in: .whitespaces),
                sections: cleanSections, isDraft: true
            ))
            done = true
        } catch { self.error = error.localizedDescription }
    }
}

/// Editor de una lección: texto o video (URL o subida a Mux desde la galería).
private struct LessonEditor: View {
    @Binding var lesson: NewLesson
    let onError: (String) -> Void

    @State private var picked: PhotosPickerItem?
    @State private var uploading = false
    private let api = InstructorAPI()

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            TextField("Título de la lección", text: $lesson.title)
            Picker("Tipo", selection: $lesson.type) {
                Text("Texto").tag("text")
                Text("Video").tag("video")
            }
            .pickerStyle(.segmented)
            if lesson.type == "text" {
                TextField("Contenido", text: Binding(get: { lesson.content ?? "" }, set: { lesson.content = $0 }), axis: .vertical).lineLimit(2...6)
            } else {
                TextField("URL de video (Mux/YouTube)", text: Binding(get: { lesson.videoUrl ?? "" }, set: { lesson.videoUrl = $0 }))
                    .keyboardType(.URL).textInputAutocapitalization(.never)
                PhotosPicker(selection: $picked, matching: .videos) {
                    if uploading {
                        HStack { ProgressView(); Text("Subiendo a Mux…") }
                    } else {
                        Label(lesson.videoUrl?.isEmpty == false ? "Video listo ✓ · Reemplazar" : "Subir video del dispositivo", systemImage: "video.badge.plus")
                    }
                }
                .disabled(uploading)
            }
        }
        .padding(.vertical, 4)
        .onChange(of: picked) { _, item in
            guard let item else { return }
            Task { await upload(item) }
        }
    }

    private func upload(_ item: PhotosPickerItem) async {
        uploading = true
        defer { uploading = false; picked = nil }
        do {
            guard let movie = try await item.loadTransferable(type: MovieFile.self) else { return }
            let (uploadId, uploadUrl) = try await api.requestMuxUpload(lessonTitle: lesson.title.isEmpty ? "Lección" : lesson.title)
            try await api.uploadVideo(to: uploadUrl, file: movie.url)
            try? FileManager.default.removeItem(at: movie.url)
            // Mux procesa el asset; reintentar el playback unas veces.
            for _ in 0..<12 {
                try await Task.sleep(for: .seconds(5))
                if let url = try await api.muxPlaybackUrl(uploadId: uploadId) {
                    lesson.videoUrl = url
                    return
                }
            }
            onError("El video se subió pero Mux aún lo procesa. Pega la URL más tarde desde la web.")
        } catch {
            onError(error.localizedDescription)
        }
    }
}

/// Copia el video elegido a un archivo temporal para subirlo por streaming.
private struct MovieFile: Transferable {
    let url: URL
    static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(contentType: .movie) { SentTransferredFile($0.url) } importing: { received in
            let dest = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".mp4")
            try FileManager.default.copyItem(at: received.file, to: dest)
            return MovieFile(url: dest)
        }
    }
}
