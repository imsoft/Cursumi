import SwiftUI

/// Ajustes de plataforma: comisión de Cursumi y redes sociales del pie de página.
struct AdminSettingsView: View {
    @State private var loading = true
    @State private var error: String?

    // Comisión
    @State private var savedFee: Double?
    @State private var fee: Double = 0
    @State private var feeText = ""
    @State private var confirmFee = false
    @State private var savingFee = false
    @State private var feeDone = false

    // Redes sociales
    @State private var links: [SocialLink] = []
    @State private var savedLinks: [SocialLink] = []
    @State private var savingLinks = false
    @State private var linksDone = false

    private let api = AdminAPI()

    private var feeChanged: Bool { savedFee.map { abs($0 - fee) > 0.001 } ?? false }
    private var linksChanged: Bool { links != savedLinks }

    var body: some View {
        Form {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else {
                if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
                feeSection
                linksSection
            }
        }
        .navigationTitle("Ajustes de plataforma")
        .task { await load(); loading = false }
        .confirmationDialog("¿Cambiar la comisión a \(fee.clean)%?", isPresented: $confirmFee, titleVisibility: .visible) {
            Button("Guardar comisión") { Task { await saveFee() } }
            Button("Cancelar", role: .cancel) {}
        } message: {
            Text("Aplica a las ventas nuevas; las transacciones pasadas no cambian.")
        }
    }

    private var feeSection: some View {
        Section {
            HStack {
                TextField("Porcentaje", text: $feeText)
                    .keyboardType(.decimalPad)
                    .onChange(of: feeText) { _, raw in
                        if let v = Double(raw.replacingOccurrences(of: ",", with: ".")) { fee = min(100, max(0, v)) }
                    }
                Text("%").foregroundStyle(.secondary)
                Stepper("", value: $fee, in: 0...100, step: 1)
                    .labelsHidden()
                    .onChange(of: fee) { _, v in
                        let text = v.clean
                        if text != feeText { feeText = text }
                    }
            }
            if feeDone { Text("Comisión guardada ✓").foregroundStyle(Brand.success) }
            PrimaryButton(title: "Guardar comisión", loading: savingFee, disabled: !feeChanged) { confirmFee = true }
                .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
        } header: {
            Text("Comisión de la plataforma")
        } footer: {
            Text("Porcentaje de cada venta que se queda Cursumi (0–100). El resto va al instructor." + (savedFee.map { " Actual: \($0.clean)%." } ?? ""))
        }
    }

    private var linksSection: some View {
        Section {
            if links.isEmpty { Text("No hay redes configuradas.").foregroundStyle(.secondary) }
            ForEach($links) { $link in
                VStack(alignment: .leading, spacing: 6) {
                    Toggle(isOn: $link.visible) { Text(link.label).font(.headline) }
                    TextField("https://…", text: $link.url)
                        .keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .font(.footnote)
                }
                .padding(.vertical, 2)
            }
            if linksDone { Text("Redes guardadas ✓").foregroundStyle(Brand.success) }
            PrimaryButton(title: "Guardar redes", loading: savingLinks, disabled: !linksChanged) { Task { await saveLinks() } }
                .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
        } header: {
            Text("Redes sociales")
        } footer: {
            Text("Se muestran en el pie de página de la web. Apaga una para ocultarla sin borrar la URL.")
        }
    }

    private func load() async {
        error = nil
        do {
            let f = try await api.platformFee()
            savedFee = f.platformFeePercent
            fee = f.platformFeePercent
            feeText = f.platformFeePercent.clean
            let l = try await api.socialLinks()
            links = l
            savedLinks = l
        } catch {
            self.error = "No se pudieron cargar los ajustes."
        }
    }

    private func saveFee() async {
        error = nil; feeDone = false; savingFee = true
        defer { savingFee = false }
        do {
            try await api.setPlatformFee(fee)
            savedFee = fee
            feeDone = true
        } catch { self.error = error.localizedDescription }
    }

    private func saveLinks() async {
        error = nil; linksDone = false
        let cleaned = links.map { SocialLink(key: $0.key, label: $0.label, url: $0.url.trimmingCharacters(in: .whitespacesAndNewlines), visible: $0.visible) }
        if let bad = cleaned.first(where: { $0.visible && !$0.url.isEmpty && URL(string: $0.url)?.scheme == nil }) {
            error = "La URL de \(bad.label) no es válida (debe empezar con https://)."
            return
        }
        savingLinks = true
        defer { savingLinks = false }
        do {
            try await api.setSocialLinks(cleaned)
            links = cleaned
            savedLinks = cleaned
            linksDone = true
        } catch { self.error = error.localizedDescription }
    }
}
