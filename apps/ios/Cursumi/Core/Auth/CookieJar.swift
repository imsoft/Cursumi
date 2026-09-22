import Foundation

/// Guarda las cookies de better-auth que el servidor manda en `Set-Cookie` y las
/// devuelve como cabecera `Cookie` para las llamadas autenticadas.
///
/// Reproduce el contrato de `@better-auth/expo`: el servidor trata a la app
/// exactamente igual que a la app Expo (misma cookie de sesión, mismo origen
/// `mobile://`), así que no hace falta cambiar nada del lado del servidor.
///
/// La persistencia es inyectable para que las pruebas no toquen el llavero.
final class CookieJar {
    struct Stored: Codable, Equatable {
        var value: String
        /// ISO 8601; nil = cookie de sesión sin caducidad.
        var expires: String?
    }

    private let storageKey = "cursumi_cookie"
    private let read: (String) -> String?
    private let write: (String, String) -> Void
    private let queue = DispatchQueue(label: "com.cursumi.cookiejar")

    init(
        read: @escaping (String) -> String? = Keychain.read,
        write: @escaping (String, String) -> Void = { Keychain.write($0, for: $1) }
    ) {
        self.read = read
        self.write = write
    }

    /// Cookies vigentes, por nombre.
    var cookies: [String: Stored] {
        queue.sync { load() }
    }

    /// Valor de la cabecera `Cookie`, o nil si no hay ninguna vigente.
    var cookieHeader: String? {
        let live = cookies
            .sorted { $0.key < $1.key }
            .map { "\($0.key)=\($0.value.value)" }
        return live.isEmpty ? nil : live.joined(separator: "; ")
    }

    var hasSession: Bool {
        cookies.keys.contains { $0.hasSuffix("session_token") }
    }

    /// Valor de la cookie `oauth_state` (con o sin prefijo `__Secure-`), si existe.
    var oauthState: String? {
        cookies.first { $0.key.hasSuffix(".oauth_state") }?.value.value
    }

    /// Procesa las cabeceras de una respuesta HTTP y guarda las cookies nuevas.
    func store(responseHeaders: [AnyHashable: Any], for url: URL) {
        let fields = responseHeaders.reduce(into: [String: String]()) { acc, pair in
            if let key = pair.key as? String, let value = pair.value as? String {
                acc[key] = value
            }
        }
        store(cookies: HTTPCookie.cookies(withResponseHeaderFields: fields, for: url))
    }

    /// Procesa un valor de `Set-Cookie` suelto (como el que viene en el deep link
    /// tras entrar con Google).
    func store(setCookieHeader: String, for url: URL) {
        store(cookies: HTTPCookie.cookies(withResponseHeaderFields: ["Set-Cookie": setCookieHeader], for: url))
    }

    func store(cookies incoming: [HTTPCookie]) {
        queue.sync {
            var current = load()
            let now = Date()
            for cookie in incoming {
                // Solo cookies de better-auth; ignoramos cualquier otra.
                guard cookie.name.contains("better-auth") else { continue }
                if let expires = cookie.expiresDate, expires <= now {
                    current.removeValue(forKey: cookie.name)
                    continue
                }
                if cookie.value.isEmpty {
                    current.removeValue(forKey: cookie.name)
                    continue
                }
                current[cookie.name] = Stored(
                    value: cookie.value,
                    expires: cookie.expiresDate.map { Self.iso.string(from: $0) }
                )
            }
            save(current)
        }
    }

    func clear() {
        queue.sync { save([:]) }
    }

    // MARK: - Persistencia

    private static let iso = ISO8601DateFormatter()

    private func load() -> [String: Stored] {
        guard let raw = read(storageKey), let data = raw.data(using: .utf8),
              let parsed = try? JSONDecoder().decode([String: Stored].self, from: data) else {
            return [:]
        }
        let now = Date()
        return parsed.filter { _, stored in
            guard let expires = stored.expires, let date = Self.iso.date(from: expires) else { return true }
            return date > now
        }
    }

    private func save(_ cookies: [String: Stored]) {
        guard let data = try? JSONEncoder().encode(cookies),
              let raw = String(data: data, encoding: .utf8) else { return }
        write(raw, storageKey)
    }
}
