import Foundation

/// Configuración de la app. Los valores públicos viajan igual en el bundle de la web.
enum Config {
    /// Base de la API. En desarrollo se puede apuntar a local con la variable de
    /// entorno `CURSUMI_API_URL` del esquema de Xcode.
    static let apiURL: URL = {
        if let raw = ProcessInfo.processInfo.environment["CURSUMI_API_URL"],
           let url = URL(string: raw) {
            return url
        }
        return URL(string: "https://cursumi.com")!
    }()

    /// Site key de Cloudflare Turnstile (valor público). El servidor exige el token
    /// `cf-turnstile-response` en el registro y en recuperar contraseña.
    static let turnstileSiteKey = "0x4AAAAAACyo73SS8jWrE9tZ"

    /// Scheme del deep link al que vuelve el navegador tras entrar con Google.
    /// Debe coincidir con Info.plist (CFBundleURLSchemes) y con `trustedOrigins`
    /// en `apps/web/src/lib/auth.ts`.
    static let scheme = "mobile"

    /// Origen que la app declara al servidor de auth. El plugin expo del servidor
    /// lo copia a `Origin` para pasar la comprobación de origen en los POST.
    static let origin = "\(scheme)://"
}
