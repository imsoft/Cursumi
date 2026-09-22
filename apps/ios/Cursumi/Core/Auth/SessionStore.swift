import Foundation
import Observation

/// Estado global de la sesión. Equivale a `useSession()` de la app Expo.
@MainActor
@Observable
final class SessionStore {
    enum State: Equatable {
        case loading
        case signedOut
        case signedIn(SessionUser)
    }

    private(set) var state: State = .loading
    private let auth: AuthService

    init(auth: AuthService = AuthService()) {
        self.auth = auth
    }

    var user: SessionUser? {
        if case .signedIn(let user) = state { return user }
        return nil
    }

    /// Al arrancar: si hay cookie guardada, valida la sesión contra el servidor.
    func restore() async {
        guard auth.api.jar.hasSession else {
            state = .signedOut
            return
        }
        do {
            if let info = try await auth.currentSession() {
                state = .signedIn(info.user)
            } else {
                auth.api.jar.clear()
                state = .signedOut
            }
        } catch APIError.network {
            // Sin red: conservamos la cookie y dejamos al usuario entrar; las
            // pantallas mostrarán su propio error al cargar datos.
            state = .signedIn(SessionUser(id: "", name: nil, email: nil, image: nil, role: nil))
        } catch {
            auth.api.jar.clear()
            state = .signedOut
        }
    }

    /// Tras un login exitoso: carga el usuario y cambia a `signedIn`.
    func refresh() async {
        if let info = try? await auth.currentSession() {
            state = .signedIn(info.user)
        }
    }

    func signOut() async {
        await auth.signOut()
        state = .signedOut
    }
}
