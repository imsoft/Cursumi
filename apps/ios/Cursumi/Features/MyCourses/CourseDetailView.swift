import SwiftUI

struct CourseDetailView: View {
    let courseId: String

    @State private var detail: StudentCourseDetail?
    @State private var loading = true
    @State private var error: String?
    @State private var extraCompleted: Set<String> = []
    private let api = StudentAPI()

    private static let typeLabels: [String: String] = [
        "video": "Video", "text": "Lectura", "quiz": "Quiz", "assignment": "Tarea",
        "section_quiz": "Examen", "section_minigame": "Juego",
    ]

    private var completed: Set<String> {
        Set((detail?.lessonProgress ?? []).map(\.lessonId)).union(extraCompleted)
    }

    var body: some View {
        Group {
            if loading {
                ProgressView()
            } else if let detail {
                List {
                    Section {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(detail.course.title).font(.title2.bold())
                            Text("\(detail.course.instructor?.name ?? "Instructor") · \(Int(detail.progress.rounded()))% completado")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .listRowSeparator(.hidden)
                    }
                    Section {
                        NavigationLink { ExamView(courseId: courseId) } label: {
                            Label("Examen final", systemImage: "graduationcap.fill").foregroundStyle(Brand.primary)
                        }
                    }
                    ForEach(detail.course.sections) { section in
                        Section(section.title) {
                            ForEach(section.lessons) { lesson in
                                NavigationLink {
                                    LessonView(lessonId: lesson.id) { extraCompleted.insert($0) }
                                } label: {
                                    HStack(spacing: 10) {
                                        Image(systemName: completed.contains(lesson.id) ? "checkmark.circle.fill" : "circle")
                                            .foregroundStyle(completed.contains(lesson.id) ? Brand.success : .secondary)
                                        Text(lesson.title).lineLimit(2)
                                        Spacer()
                                        if let type = lesson.type, let label = Self.typeLabels[type] {
                                            Text(label)
                                                .font(.caption2.weight(.semibold))
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 3)
                                                .background(Brand.primary.opacity(0.12))
                                                .foregroundStyle(Brand.primary)
                                                .clipShape(Capsule())
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .listStyle(.insetGrouped)
            } else {
                EmptyState(title: "Curso no encontrado", message: error)
            }
        }
        .navigationTitle("Curso")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do {
                detail = try await api.courseDetail(courseId)
            } catch {
                self.error = "No se pudo cargar el curso."
            }
            loading = false
        }
    }
}
