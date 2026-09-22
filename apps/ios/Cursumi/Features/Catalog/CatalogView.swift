import SafariServices
import SwiftUI

/// Catálogo público. Modelo "reader app": la compra se hace en la web, así que la
/// ficha del curso se abre en Safari y la app no muestra ningún botón de compra.
struct CatalogView: View {
    @State private var courses: [CourseSummary] = []
    @State private var saved: Set<String> = []
    @State private var loading = true
    @State private var error: String?
    @State private var search = ""
    @State private var openURL: URL?
    private let api = StudentAPI()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                BrandHeader(title: "Explorar", subtitle: "Descubre cursos de instructores expertos")
                if loading {
                    ProgressView().padding(.top, 40)
                    Spacer()
                } else {
                    List {
                        if courses.isEmpty {
                            EmptyState(title: error ?? "No hay cursos disponibles por ahora.")
                                .listRowSeparator(.hidden)
                        }
                        ForEach(courses) { course in
                            Button {
                                openURL = Config.apiURL.appendingPathComponent("courses/\(course.slug ?? course.id)")
                            } label: {
                                CatalogCard(course: course, saved: saved.contains(course.id)) {
                                    Task { await toggle(course.id) }
                                }
                            }
                            .buttonStyle(.plain)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                        }
                    }
                    .listStyle(.plain)
                    .refreshable { await load() }
                }
            }
            .toolbar(.hidden, for: .navigationBar)
            .searchable(text: $search, prompt: "Buscar cursos")
            .onSubmit(of: .search) { Task { await load() } }
            .onChange(of: search) { _, value in
                if value.isEmpty { Task { await load() } }
            }
        }
        .task { await load(); loading = false }
        .sheet(item: $openURL) { url in
            SafariView(url: url).ignoresSafeArea()
        }
    }

    private func load() async {
        error = nil
        do {
            async let list = api.catalog(search: search)
            async let wishlist = (try? api.wishlist()) ?? []
            courses = try await list
            saved = Set(await wishlist)
        } catch {
            self.error = "No se pudieron cargar los cursos. Desliza para reintentar."
        }
    }

    private func toggle(_ courseId: String) async {
        // Optimista; se revierte si falla.
        if saved.contains(courseId) { saved.remove(courseId) } else { saved.insert(courseId) }
        do {
            let isSaved = try await api.toggleWishlist(courseId)
            if isSaved { saved.insert(courseId) } else { saved.remove(courseId) }
        } catch {
            if saved.contains(courseId) { saved.remove(courseId) } else { saved.insert(courseId) }
        }
    }
}

private struct CatalogCard: View {
    let course: CourseSummary
    let saved: Bool
    let onToggleSaved: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let url = course.imageUrl.flatMap(URL.init) {
                RemoteImage(url: url)
            }
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .top) {
                    Text(course.title).font(.headline).lineLimit(2)
                    Spacer()
                    Button(action: onToggleSaved) {
                        Image(systemName: saved ? "heart.fill" : "heart")
                            .foregroundStyle(saved ? Brand.danger : .secondary)
                    }
                    .buttonStyle(.plain)
                }
                Text(Formatting.priceMXN(course.price))
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Brand.primary)
                Text("Ver detalles →").font(.footnote).foregroundStyle(.secondary)
            }
            .padding(16)
        }
        .card()
    }
}

extension URL: @retroactive Identifiable {
    public var id: String { absoluteString }
}

struct SafariView: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }
    func updateUIViewController(_ controller: SFSafariViewController, context: Context) {}
}
