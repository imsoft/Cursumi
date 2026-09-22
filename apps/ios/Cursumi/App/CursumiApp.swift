import SwiftUI

@main
struct CursumiApp: App {
    @State private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(session)
                .tint(Brand.primary)
        }
    }
}
