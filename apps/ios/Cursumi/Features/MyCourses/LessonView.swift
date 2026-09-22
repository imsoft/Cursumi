import AVKit
import SwiftUI

/// Visor de lección: video (Mux/HLS/mp4 nativo o YouTube embebido), contenido
/// HTML, quizzes, tarea o minijuego según el tipo, y botón de completar.
struct LessonView: View {
    let lessonId: String
    let onCompleted: (String) -> Void

    @State private var lesson: Lesson?
    @State private var loading = true
    @State private var error: String?
    @State private var completing = false
    @State private var done = false
    @State private var contentHeight: CGFloat = 200
    @State private var player: AVPlayer?
    private let api = StudentAPI()

    var body: some View {
        Group {
            if loading {
                ProgressView()
            } else if let lesson {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        Text(lesson.title).font(.title2.bold())
                        if let description = lesson.description, !description.isEmpty {
                            Text(description).foregroundStyle(.secondary)
                        }

                        video(for: lesson)

                        switch lesson.type {
                        case "quiz":
                            LessonQuizView(lesson: lesson, onCompleted: completed)
                        case "section_quiz":
                            SectionQuizView(lesson: lesson, onCompleted: completed)
                        case "section_minigame":
                            MinigameView(lesson: lesson, onCompleted: completed)
                        case "assignment":
                            // Enunciado de la tarea (si viene en content).
                            htmlContent(lesson)
                            AssignmentView(lesson: lesson, onCompleted: completed)
                        default:
                            htmlContent(lesson)
                            PrimaryButton(title: done ? "✓ Completada" : "Marcar como completada", loading: completing, disabled: done) {
                                Task { await markComplete(lesson) }
                            }
                            .tint(done ? Brand.success : Brand.primary)
                        }

                        NotesSection(courseId: lesson.courseId, lessonId: lesson.id)
                    }
                    .padding(16)
                }
            } else {
                EmptyState(title: "Lección no encontrada", message: error)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do {
                let loaded = try await api.lesson(lessonId)
                lesson = loaded
                done = loaded.completed
                if case .native(let url)? = VideoSource.from(loaded.videoUrl) {
                    player = AVPlayer(url: url)
                }
            } catch {
                self.error = "No se pudo cargar la lección."
            }
            loading = false
        }
        .onDisappear { player?.pause() }
    }

    @ViewBuilder
    private func video(for lesson: Lesson) -> some View {
        switch VideoSource.from(lesson.videoUrl) {
        case .native?:
            if let player {
                VideoPlayer(player: player)
                    .aspectRatio(16 / 9, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        case .youtube(let id)?:
            HTMLView(
                source: .url(URL(string: "https://www.youtube.com/embed/\(id)?playsinline=1")!),
                height: .constant(0)
            )
            .aspectRatio(16 / 9, contentMode: .fit)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        case nil:
            EmptyView()
        }
    }

    @ViewBuilder
    private func htmlContent(_ lesson: Lesson) -> some View {
        if let content = lesson.content, !content.isEmpty {
            HTMLView(source: .html(LessonContent.html(from: content)), height: $contentHeight)
                .frame(height: contentHeight)
        }
    }

    private func completed(_ id: String) {
        done = true
        onCompleted(id)
    }

    private func markComplete(_ lesson: Lesson) async {
        completing = true
        defer { completing = false }
        do {
            try await api.completeLesson(lesson.id, courseId: lesson.courseId)
            done = true
            onCompleted(lesson.id)
        } catch {
            self.error = "No se pudo marcar la lección."
        }
    }
}
