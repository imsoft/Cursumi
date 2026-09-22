import SwiftUI

struct MyCoursesView: View {
    @State private var courses: [StudentCourse] = []
    @State private var loading = true
    @State private var error: String?
    private let api = StudentAPI()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                BrandHeader(title: "Mis cursos", subtitle: "Continúa donde lo dejaste")
                if loading {
                    ProgressView().padding(.top, 40)
                    Spacer()
                } else {
                    List {
                        if courses.isEmpty {
                            EmptyState(
                                title: "Aún no tienes cursos",
                                message: error ?? "Cuando te inscribas a un curso aparecerá aquí."
                            )
                            .listRowSeparator(.hidden)
                        }
                        ForEach(courses) { course in
                            NavigationLink(value: course.id) {
                                CourseCard(course: course)
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
            .navigationDestination(for: String.self) { courseId in
                CourseDetailView(courseId: courseId)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { await load(); loading = false }
    }

    private func load() async {
        error = nil
        do {
            courses = try await api.myCourses()
        } catch {
            self.error = "No se pudieron cargar tus cursos. Desliza para reintentar."
        }
    }
}

private struct CourseCard: View {
    let course: StudentCourse

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            RemoteImage(url: course.imageUrl.flatMap(URL.init))
            VStack(alignment: .leading, spacing: 8) {
                Text(course.title).font(.headline).lineLimit(2)
                Text([course.instructorName, course.category?.label].compactMap { $0 }.joined(separator: " · "))
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                ProgressView(value: min(max(course.progress, 0), 100), total: 100)
                    .tint(Brand.primary)
                Text(course.isCompleted ? "Completado" : "\(Int(course.progress.rounded()))% completado")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
        }
        .card()
    }
}
