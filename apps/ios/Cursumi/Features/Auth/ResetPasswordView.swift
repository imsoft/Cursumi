import SwiftUI

/// Nueva contraseña con el token del correo de recuperación. Se abre desde el
/// deep link `mobile://reset-password?token=…`, con o sin sesión iniciada.
struct ResetPasswordView: View {
    let token: String

    @Environment(\.dismiss) private var dismiss
    @State private var password = ""
    @State private var confirm = ""
    @State private var loading = false
    @State private var error: String?
    @State private var done = false
    private let auth = AuthService()

    private var submitDisabled: Bool { password.isEmpty || confirm.isEmpty }

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                if done {
                    Image(systemName: "checkmark.circle.fill").font(.system(size: 48)).foregroundStyle(Brand.success)
                    Text("Tu contraseña se actualizó.").font(.headline)
                    Text("Ya puedes iniciar sesión con tu nueva contraseña.")
                        .foregroundStyle(.secondary).multilineTextAlignment(.center)
                    PrimaryButton(title: "Volver al inicio de sesión") { dismiss() }
                } else {
                    Text("Elige una contraseña nueva de al menos 6 caracteres.")
                        .foregroundStyle(.secondary).multilineTextAlignment(.center)
                    BrandTextField(placeholder: "Nueva contraseña", text: $password, secure: true, contentType: .newPassword)
                    BrandTextField(placeholder: "Confirmar contraseña", text: $confirm, secure: true, contentType: .newPassword)
                    if let error {
                        Text(error).foregroundStyle(Brand.danger).font(.subheadline).multilineTextAlignment(.center)
                    }
                    PrimaryButton(title: "Guardar contraseña", loading: loading, disabled: submitDisabled) {
                        Task { await submit() }
                    }
                }
                Spacer()
            }
            .padding(24)
            .navigationTitle("Nueva contraseña")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(done ? "Cerrar" : "Cancelar") { dismiss() }
                }
            }
        }
        .interactiveDismissDisabled(loading)
    }

    private func submit() async {
        error = nil
        guard password.count >= 6 else { error = "La contraseña debe tener al menos 6 caracteres."; return }
        guard password == confirm else { error = "Las contraseñas no coinciden."; return }
        loading = true
        defer { loading = false }
        do {
            try await auth.resetPassword(token: token, newPassword: password)
            done = true
        } catch {
            self.error = error.localizedDescription
        }
    }
}
