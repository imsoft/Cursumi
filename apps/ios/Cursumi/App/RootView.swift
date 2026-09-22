import SwiftUI

/// Decide qué mostrar según el estado de la sesión: cargando, login o las pestañas.
struct RootView: View {
    @Environment(SessionStore.self) private var session

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
