import SwiftUI

struct NotificationsView: View {
    @State private var items: [Notification] = []
    @State private var loading = true
    @State private var error: String?
    private let api = StudentAPI()

    var body: some View {
        List {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if items.isEmpty {
                EmptyState(title: "Sin notificaciones", message: error ?? "Aquí verás avisos de tus cursos.")
            }
            ForEach(items) { item in
                Button {
                    Task { await markRead(item) }
                } label: {
                    HStack(alignment: .top, spacing: 10) {
                        Circle().fill(item.read ? Color.clear : Brand.primary).frame(width: 8, height: 8).padding(.top, 6)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title).font(.subheadline.weight(item.read ? .regular : .semibold))
                            Text(item.body).font(.footnote).foregroundStyle(.secondary)
                            Text(item.createdAt, style: .relative).font(.caption2).foregroundStyle(.tertiary)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .navigationTitle("Notificaciones")
        .toolbar {
            if items.contains(where: { !$0.read }) {
                Button("Leer todas") { Task { await markAll() } }
            }
        }
        .refreshable { await load() }
        .task { await load(); loading = false }
    }

    private func load() async {
        do { items = try await api.notifications().notifications } catch { self.error = "No se pudieron cargar." }
    }

    private func markRead(_ item: Notification) async {
        guard !item.read else { return }
        try? await api.markNotificationRead(item.id)
        await load()
    }

    private func markAll() async {
        try? await api.markAllNotificationsRead()
        await load()
    }
}

struct CertificatesView: View {
    @State private var items: [Certificate] = []
    @State private var loading = true
    @State private var error: String?
    @State private var openURL: URL?
    private let api = StudentAPI()

    var body: some View {
        List {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if items.isEmpty {
                EmptyState(title: "Aún no tienes certificados", message: error ?? "Completa un curso y aprueba su examen final.")
            }
            ForEach(items) { cert in
                Button {
                    openURL = Config.apiURL.appendingPathComponent("certificates/\(cert.id)")
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(cert.courseTitle).font(.headline)
                        Text(cert.instructorName).font(.footnote).foregroundStyle(.secondary)
                        Text("Nº \(cert.certificateNumber)").font(.caption).foregroundStyle(.tertiary)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .navigationTitle("Certificados")
        .refreshable { await load() }
        .task { await load(); loading = false }
        .sheet(item: $openURL) { SafariView(url: $0).ignoresSafeArea() }
    }

    private func load() async {
        do { items = try await api.certificates() } catch { self.error = "No se pudieron cargar." }
    }
}

struct WishlistView: View {
    @State private var courses: [CourseSummary] = []
    @State private var loading = true
    @State private var openURL: URL?
    private let api = StudentAPI()

    var body: some View {
        List {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if courses.isEmpty {
                EmptyState(title: "Tu lista está vacía", message: "Guarda cursos desde Explorar con el corazón.")
            }
            ForEach(courses) { course in
                Button {
                    openURL = Config.apiURL.appendingPathComponent("courses/\(course.slug ?? course.id)")
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(course.title).font(.headline).lineLimit(2)
                            Text(Formatting.priceMXN(course.price)).font(.footnote).foregroundStyle(Brand.primary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right").foregroundStyle(.tertiary)
                    }
                }
                .buttonStyle(.plain)
                .swipeActions {
                    Button(role: .destructive) {
                        Task { await remove(course) }
                    } label: { Label("Quitar", systemImage: "heart.slash") }
                }
            }
        }
        .navigationTitle("Lista de deseos")
        .refreshable { await load() }
        .task { await load(); loading = false }
        .sheet(item: $openURL) { SafariView(url: $0).ignoresSafeArea() }
    }

    private func load() async {
        // El endpoint devuelve solo IDs; cruzamos con el catálogo publicado.
        async let ids = (try? api.wishlist()) ?? []
        async let all = (try? api.catalog()) ?? []
        let saved = Set(await ids)
        courses = await all.filter { saved.contains($0.id) }
    }

    private func remove(_ course: CourseSummary) async {
        courses.removeAll { $0.id == course.id }
        _ = try? await api.toggleWishlist(course.id)
    }
}
