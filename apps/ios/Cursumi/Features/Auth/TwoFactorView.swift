import SwiftUI

/// Pide el código TOTP tras un login con segundo factor activado.
struct TwoFactorView: View {
    let onVerified: () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var code = ""
    @State private var loading = false
    @State private var error: String?
    private let auth = AuthService()

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("Escribe el código de 6 dígitos de tu app de autenticación.")
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                BrandTextField(placeholder: "Código", text: $code, keyboard: .numberPad, contentType: .oneTimeCode)
                if let error {
                    Text(error).foregroundStyle(Brand.danger).font(.subheadline)
                }
                PrimaryButton(title: "Verificar", loading: loading, disabled: code.count < 6) {
                    Task { await verify() }
                }
                Spacer()
            }
            .padding(24)
            .navigationTitle("Segundo factor")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
            }
        }
    }

    private func verify() async {
        error = nil
        loading = true
        defer { loading = false }
        do {
            try await auth.verifyTOTP(code: code.trimmingCharacters(in: .whitespaces))
            await onVerified()
            dismiss()
        } catch {
            self.error = "Código incorrecto o vencido. Inténtalo de nuevo."
        }
    }
}

/// Recuperación de contraseña: manda el correo con el enlace de la web.
struct ForgotPasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var captchaToken: String?
    @State private var loading = false
    @State private var error: String?
    @State private var sent = false
    private let auth = AuthService()

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                if sent {
                    Text("Si el correo existe, te enviamos un enlace para restablecer tu contraseña.")
                        .foregroundStyle(Brand.success)
                        .multilineTextAlignment(.center)
                } else {
                    Text("Te enviaremos un enlace para crear una contraseña nueva.")
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    BrandTextField(placeholder: "Correo electrónico", text: $email, keyboard: .emailAddress, contentType: .emailAddress)
                    TurnstileView(onToken: { captchaToken = $0 }, onError: {})
                        .frame(height: 78)
                    if let error {
                        Text(error).foregroundStyle(Brand.danger).font(.subheadline)
                    }
                    PrimaryButton(title: "Enviar enlace", loading: loading, disabled: email.isEmpty || captchaToken == nil) {
                        Task { await send() }
                    }
                }
                Spacer()
            }
            .padding(24)
            .navigationTitle("Recuperar contraseña")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(sent ? "Cerrar" : "Cancelar") { dismiss() }
                }
            }
        }
    }

    private func send() async {
        guard let captchaToken else { return }
        error = nil
        loading = true
        defer { loading = false }
        do {
            try await auth.forgotPassword(email: email.trimmingCharacters(in: .whitespaces), captchaToken: captchaToken)
            sent = true
        } catch {
            self.error = error.localizedDescription
            self.captchaToken = nil
        }
    }
}
