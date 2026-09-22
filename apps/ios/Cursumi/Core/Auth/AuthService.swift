import AuthenticationServices
import Foundation

struct SessionUser: Decodable, Equatable {
    let id: String
    let name: String?
    let email: String?
    let image: String?
    let role: String?
}

struct SessionInfo: Decodable, Equatable {
    struct Session: Decodable, Equatable {
        let id: String
        let expiresAt: Date
    }
    let user: SessionUser
    let session: Session
}

enum SignInResult: Equatable {
    case signedIn
    /// El usuario tiene 2FA: hay que pedir el código TOTP.
    case needsTwoFactor
}

enum AuthError: LocalizedError {
    case invalidCredentials
    case cancelled
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Correo o contraseña incorrectos, o tu correo no está verificado."
        case .cancelled:
            return "Se canceló el inicio de sesión."
        case .server(let message):
            return message
        }
    }
}

/// Llamadas a `/api/auth/*` de better-auth.
struct AuthService {
    let api: APIClient

    init(api: APIClient = .shared) { self.api = api }

    func currentSession() async throws -> SessionInfo? {
        let res = try await api.request("GET", "api/auth/get-session")
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
        // El servidor devuelve `null` sin sesión.
        if res.data.isEmpty || String(data: res.data, encoding: .utf8) == "null" { return nil }
        return try res.decode(SessionInfo.self)
    }

    func signIn(email: String, password: String) async throws -> SignInResult {
        struct Body: Encodable { let email: String; let password: String }
        let res = try await api.request("POST", "api/auth/sign-in/email", json: Body(email: email, password: password))
        guard res.isOK else {
            if res.status == 401 || res.status == 403 { throw AuthError.invalidCredentials }
            throw AuthError.server(res.errorMessage ?? "No se pudo iniciar sesión.")
        }
        struct Reply: Decodable { let twoFactorRedirect: Bool? }
        if (try? res.decode(Reply.self))?.twoFactorRedirect == true { return .needsTwoFactor }
        return .signedIn
    }

    func verifyTOTP(code: String) async throws {
        struct Body: Encodable { let code: String; let trustDevice: Bool }
        let res = try await api.request("POST", "api/auth/two-factor/verify-totp", json: Body(code: code, trustDevice: false))
        guard res.isOK else { throw AuthError.server(res.errorMessage ?? "Código incorrecto.") }
    }

    func signUp(name: String, email: String, password: String, captchaToken: String) async throws {
        struct Body: Encodable {
            let name: String
            let email: String
            let password: String
            let captcha: String
            enum CodingKeys: String, CodingKey {
                case name, email, password
                case captcha = "cf-turnstile-response"
            }
        }
        let res = try await api.request(
            "POST", "api/auth/sign-up/email",
            json: Body(name: name, email: email, password: password, captcha: captchaToken)
        )
        guard res.isOK else { throw AuthError.server(res.errorMessage ?? "No fue posible crear la cuenta.") }
        // El registro no inicia sesión: el correo debe verificarse primero.
        api.jar.clear()
    }

    func forgotPassword(email: String, captchaToken: String) async throws {
        struct Body: Encodable {
            let email: String
            let redirectTo: String
            let captcha: String
            enum CodingKeys: String, CodingKey {
                case email, redirectTo
                case captcha = "cf-turnstile-response"
            }
        }
        let res = try await api.request(
            "POST", "api/auth/forget-password",
            json: Body(email: email, redirectTo: "/reset-password", captcha: captchaToken)
        )
        guard res.isOK else { throw AuthError.server(res.errorMessage ?? "No se pudo enviar el correo.") }
    }

    func signOut() async {
        _ = try? await api.request("POST", "api/auth/sign-out")
        api.jar.clear()
    }

    // MARK: - Google

    /// Entra con Google con el plugin native-app del servidor:
    /// 1. `sign-in/social` devuelve la URL de autorización.
    /// 2. Se abre vía `native-authorization-proxy`, que fija la cookie `state` en el navegador.
    /// 3. Al terminar, el servidor redirige a `mobile://?cookie=<Set-Cookie>`.
    @MainActor
    func signInWithGoogle(presenting anchor: ASPresentationAnchor) async throws {
        struct Body: Encodable { let provider: String; let callbackURL: String }
        let res = try await api.request("POST", "api/auth/sign-in/social", json: Body(provider: "google", callbackURL: Config.origin))
        guard res.isOK else { throw AuthError.server(res.errorMessage ?? "No se pudo continuar con Google.") }
        struct Reply: Decodable { let url: String }
        let authorizationURL = try res.decode(Reply.self).url

        var components = URLComponents(url: api.baseURL.appendingPathComponent("api/auth/native-authorization-proxy"), resolvingAgainstBaseURL: false)!
        var items = [URLQueryItem(name: "authorizationURL", value: authorizationURL)]
        if let state = api.jar.oauthState {
            items.append(URLQueryItem(name: "oauthState", value: state))
        }
        components.queryItems = items

        let callback = try await WebAuthSession.run(url: components.url!, scheme: Config.scheme, anchor: anchor)
        guard let cookie = URLComponents(url: callback, resolvingAgainstBaseURL: false)?
            .queryItems?.first(where: { $0.name == "cookie" })?.value else {
            throw AuthError.server("Google no devolvió la sesión. Inténtalo de nuevo.")
        }
        api.jar.store(setCookieHeader: cookie, for: api.baseURL)
    }
}

/// Envuelve `ASWebAuthenticationSession` en async/await.
@MainActor
enum WebAuthSession {
    private final class Provider: NSObject, ASWebAuthenticationPresentationContextProviding {
        let anchor: ASPresentationAnchor
        init(anchor: ASPresentationAnchor) { self.anchor = anchor }
        func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor { anchor }
    }

    static func run(url: URL, scheme: String, anchor: ASPresentationAnchor) async throws -> URL {
        let provider = Provider(anchor: anchor)
        return try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: scheme) { url, error in
                if let url {
                    continuation.resume(returning: url)
                } else if let error = error as? ASWebAuthenticationSessionError, error.code == .canceledLogin {
                    continuation.resume(throwing: AuthError.cancelled)
                } else {
                    continuation.resume(throwing: error ?? AuthError.cancelled)
                }
            }
            session.presentationContextProvider = provider
            session.prefersEphemeralWebBrowserSession = false
            // Retener el provider mientras dura la sesión.
            objc_setAssociatedObject(session, "provider", provider, .OBJC_ASSOCIATION_RETAIN)
            session.start()
        }
    }
}
