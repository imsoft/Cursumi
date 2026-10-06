import Foundation

/// Deep links `mobile://…` que abre el sistema (`onOpenURL`). El retorno de
/// Google (`mobile://?cookie=…`) lo captura `ASWebAuthenticationSession` y no
/// pasa por aquí.
enum DeepLink: Equatable {
    /// `mobile://reset-password?token=<token>` desde la página web de recuperación.
    case resetPassword(token: String)

    init?(url: URL) {
        guard url.scheme == Config.scheme else { return nil }
        if let token = Self.resetPasswordToken(from: url) {
            self = .resetPassword(token: token)
            return
        }
        return nil
    }

    /// Token de `mobile://reset-password?token=abc`; nil si no es ese enlace o
    /// el token viene vacío. Acepta el nombre tanto en host como en path
    /// (`mobile://reset-password` y `mobile:///reset-password`).
    static func resetPasswordToken(from url: URL) -> String? {
        guard url.scheme == Config.scheme else { return nil }
        let route = (url.host ?? "") + url.path
        guard route.trimmingCharacters(in: CharacterSet(charactersIn: "/")) == "reset-password" else { return nil }
        let token = URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?.first(where: { $0.name == "token" })?.value?
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard let token, !token.isEmpty else { return nil }
        return token
    }
}
