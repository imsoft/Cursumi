import SwiftUI

/// Decide qué mostrar según el estado de la sesión: cargando, login o las pestañas.
/// También recibe los deep links `mobile://…` (restablecer contraseña).
struct RootView: View {
    /// Token del enlace de recuperación; presenta `ResetPasswordView` como hoja.
    private struct ResetLink: Identifiable {
        let token: String
        var id: String { token }
    }

    @Environment(SessionStore.self) private var session
    @State private var resetLink: ResetLink?

    var body: some View {
        Group {
            switch session.state {
            case .loading:
                ProgressView()
            case .signedOut:
                AuthView()
            case .signedIn:
                AppTabs()
            }
        }
        .task { await session.restore() }
        .onOpenURL { url in
            // Funciona con la app cerrada (llega tras el arranque) o ya abierta,
            // con o sin sesión: la hoja se monta sobre cualquiera de los estados.
            if case .resetPassword(let token) = DeepLink(url: url) {
                resetLink = ResetLink(token: token)
            }
        }
        .sheet(item: $resetLink) { link in
            ResetPasswordView(token: link.token)
        }
    }
}

struct AppTabs: View {
    var body: some View {
        TabView {
            MyCoursesView()
                .tabItem { Label("Mis cursos", systemImage: "book.fill") }
            CatalogView()
                .tabItem { Label("Explorar", systemImage: "magnifyingglass") }
            ProfileView()
                .tabItem { Label("Perfil", systemImage: "person.crop.circle") }
        }
    }
}
