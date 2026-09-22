import SwiftUI

/// Pantalla de acceso: Google, correo y contraseña, registro con Turnstile y 2FA.
struct AuthView: View {
    private enum Mode { case login, register }

    @Environment(SessionStore.self) private var session
    private let auth = AuthService()

    @State private var mode: Mode = .login
    @State private var fullName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var acceptTerms = false
    @State private var captchaToken: String?
    @State private var captchaFailed = false
    @State private var loading = false
    @State private var googleLoading = false
    @State private var error: String?
    @State private var info: String?
    @State private var showTwoFactor = false
    @State private var showForgot = false

    private var isRegister: Bool { mode == .register }
    private var submitDisabled: Bool {
        email.isEmpty || password.isEmpty || (isRegister && (fullName.isEmpty || !acceptTerms))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Image("Logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 84, height: 84)
                Text("Cursumi")
                    .font(.system(size: 32, weight: .heavy))
                    .foregroundStyle(Brand.vivid)
                Text(isRegister ? "Crea tu cuenta" : "Inicia sesión para continuar")
                    .foregroundStyle(.secondary)
                    .padding(.bottom, 12)

                googleButton

                HStack(spacing: 12) {
                    Rectangle().fill(Color.gray.opacity(0.25)).frame(height: 1)
                    Text("o").font(.footnote).foregroundStyle(.secondary)
                    Rectangle().fill(Color.gray.opacity(0.25)).frame(height: 1)
                }

                if isRegister {
                    BrandTextField(placeholder: "Nombre completo", text: $fullName, contentType: .name, autocapitalization: .words)
                }
                BrandTextField(placeholder: "Correo electrónico", text: $email, keyboard: .emailAddress, contentType: .emailAddress)
                BrandTextField(placeholder: "Contraseña", text: $password, secure: true, contentType: isRegister ? .newPassword : .password)

                if isRegister {
                    Toggle(isOn: $acceptTerms) {
                        Text("Acepto los términos y la política de privacidad")
                            .font(.footnote)
                    }
                    .toggleStyle(CheckboxToggleStyle())

                    TurnstileView(
                        onToken: { captchaToken = $0; captchaFailed = false },
                        onError: { captchaFailed = true }
                    )
                    .frame(height: 78)
                } else {
                    Button("¿Olvidaste tu contraseña?") { showForgot = true }
                        .font(.footnote.weight(.semibold))
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }

                if let error {
                    Text(error).foregroundStyle(Brand.danger).multilineTextAlignment(.center).font(.subheadline)
                }
                if let info {
                    Text(info).foregroundStyle(Brand.success).multilineTextAlignment(.center).font(.subheadline)
                }

                PrimaryButton(
                    title: isRegister ? "Crear cuenta" : "Iniciar sesión",
                    loading: loading,
                    disabled: submitDisabled
                ) {
                    Task { isRegister ? await register() : await login() }
                }

                Button(isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Crea una") {
                    switchMode(isRegister ? .login : .register)
                }
                .font(.subheadline.weight(.semibold))
                .padding(.top, 8)
            }
            .padding(.horizontal, 28)
            .padding(.vertical, 32)
            .frame(maxWidth: 480)
            .frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .sheet(isPresented: $showTwoFactor) {
            TwoFactorView { await session.refresh() }
        }
        .sheet(isPresented: $showForgot) {
            ForgotPasswordView()
        }
    }

    private var googleButton: some View {
        Button {
            Task { await google() }
        } label: {
            HStack(spacing: 10) {
                if googleLoading {
                    ProgressView()
                } else {
                    GoogleIcon().frame(width: 20, height: 20)
                    Text("Continuar con Google").font(.subheadline.weight(.semibold))
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .foregroundStyle(Color(hex: 0x111827))
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.35), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(googleLoading)
    }

    private func switchMode(_ next: Mode) {
        mode = next
        error = nil
        info = nil
        captchaToken = nil
        captchaFailed = false
    }

    @MainActor
    private func google() async {
        error = nil
        info = nil
        googleLoading = true
        defer { googleLoading = false }
        guard let anchor = UIApplication.shared.keyWindow else { return }
        do {
            try await auth.signInWithGoogle(presenting: anchor)
            await session.refresh()
        } catch AuthError.cancelled {
            // El usuario cerró el navegador: sin mensaje.
        } catch {
            self.error = "No se pudo continuar con Google. Inténtalo de nuevo."
        }
    }

    private func login() async {
        error = nil
        info = nil
        loading = true
        defer { loading = false }
        do {
            switch try await auth.signIn(email: email.trimmingCharacters(in: .whitespaces), password: password) {
            case .signedIn:
                await session.refresh()
            case .needsTwoFactor:
                showTwoFactor = true
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func register() async {
        error = nil
        info = nil
        guard acceptTerms else {
            error = "Debes aceptar los términos y condiciones."
            return
        }
        guard let captchaToken else {
            error = captchaFailed
                ? "No se pudo cargar el desafío de seguridad. Revisa tu conexión."
                : "Completa el desafío de seguridad antes de continuar."
            return
        }
        loading = true
        defer { loading = false }
        do {
            try await auth.signUp(
                name: fullName.trimmingCharacters(in: .whitespaces),
                email: email.trimmingCharacters(in: .whitespaces),
                password: password,
                captchaToken: captchaToken
            )
            info = "¡Cuenta creada! Te enviamos un correo para verificar tu cuenta. Verifícalo y luego inicia sesión."
            mode = .login
            password = ""
            self.captchaToken = nil
        } catch {
            self.error = error.localizedDescription
            self.captchaToken = nil
        }
    }
}

/// Casilla morada de marca.
struct CheckboxToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        Button { configuration.isOn.toggle() } label: {
            HStack(spacing: 10) {
                RoundedRectangle(cornerRadius: 6)
                    .stroke(configuration.isOn ? Brand.primary : Color.gray.opacity(0.5), lineWidth: 1.5)
                    .background(RoundedRectangle(cornerRadius: 6).fill(configuration.isOn ? Brand.primary : .clear))
                    .frame(width: 22, height: 22)
                    .overlay {
                        if configuration.isOn {
                            Image(systemName: "checkmark").font(.caption.bold()).foregroundStyle(.white)
                        }
                    }
                configuration.label.foregroundStyle(.primary)
                Spacer()
            }
        }
        .buttonStyle(.plain)
    }
}

/// "G" oficial de Google (SVG vectorial en el catálogo de assets).
struct GoogleIcon: View {
    var body: some View {
        Image("GoogleG").resizable().scaledToFit()
    }
}

extension UIApplication {
    var keyWindow: UIWindow? {
        connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow }
    }
}
