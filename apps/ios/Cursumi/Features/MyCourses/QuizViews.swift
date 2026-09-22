import SwiftUI

/// Quiz de lección: se califica en cliente y se guarda con `completeLesson`.
struct LessonQuizView: View {
    let lesson: Lesson
    let onCompleted: (String) -> Void

    @State private var questions: [QuizQuestion] = []
    @State private var config = QuizConfig()
    @State private var answers: [Int: QuizAnswer] = [:]
    @State private var submitted = false
    @State private var score = 0
    @State private var saving = false
    @State private var attempts = 0
    @State private var timeLeft: Int?
    private let api = StudentAPI()

    private var passed: Bool { score >= config.passingScore }
    private var attemptsLeft: Int? { config.maxAttempts > 0 ? max(0, config.maxAttempts - attempts) : nil }
    private var canRetake: Bool { !passed && (config.maxAttempts == 0 || attempts < config.maxAttempts) }
    private var allAnswered: Bool {
        questions.indices.allSatisfy { questions[$0].type == .ordering || (answers[$0]?.isAnswered ?? false) }
    }

    var body: some View {
        VStack(spacing: 14) {
            if questions.isEmpty {
                Text("Este quiz no tiene preguntas.").italic().foregroundStyle(.secondary)
            } else {
                if let timeLeft, !submitted {
                    TimerPill(seconds: timeLeft)
                }
                if submitted {
                    ResultCard(
                        score: score, passed: passed,
                        message: passed ? "¡Aprobado!" : "No alcanzaste el \(config.passingScore)% mínimo.",
                        extra: attemptsLeft.flatMap { passed ? nil : ($0 > 0 ? "Intentos restantes: \($0)" : "Sin intentos restantes.") }
                    )
                }
                ForEach(questions.indices, id: \.self) { i in
                    QuestionCard(number: i + 1, text: questions[i].question, graded: submitted ? questions[i].grade(answers[i]) : nil) {
                        QuizAnswerInput(
                            type: questions[i].type, options: questions[i].options,
                            matchRight: questions[i].matchRight ?? [],
                            answer: binding(i), disabled: submitted
                        )
                    }
                }
                if !submitted {
                    PrimaryButton(title: "Enviar respuestas", disabled: !allAnswered) { Task { await submit() } }
                } else if saving {
                    ProgressView()
                } else if canRetake {
                    GhostButton(title: "Reintentar") { retake() }
                } else {
                    Text("Respuestas guardadas ✓").foregroundStyle(.secondary)
                }
            }
        }
        .onAppear {
            questions = QuizQuestion.parseLessonQuiz(lesson.content)
            config = QuizConfig.parse(lesson.content)
            timeLeft = config.timeLimitMin > 0 ? config.timeLimitMin * 60 : nil
        }
        .task(id: timeLeft) {
            // Cuenta regresiva: al llegar a 0 envía automáticamente.
            guard let t = timeLeft, !submitted else { return }
            if t <= 0 { await submit(); return }
            try? await Task.sleep(for: .seconds(1))
            if !Task.isCancelled, timeLeft == t { timeLeft = t - 1 }
        }
    }

    private func binding(_ i: Int) -> Binding<QuizAnswer?> {
        Binding(get: { answers[i] }, set: { answers[i] = $0 })
    }

    private func submit() async {
        guard !submitted else { return }
        let correct = questions.indices.filter { questions[$0].grade(answers[$0]) }.count
        score = questions.isEmpty ? 0 : Int((Double(correct) / Double(questions.count) * 100).rounded())
        submitted = true
        timeLeft = nil
        attempts += 1
        saving = true
        defer { saving = false }
        var toSave: [String: QuizAnswer] = [:]
        for (i, a) in answers { toSave[String(i)] = a }
        do {
            try await api.completeLesson(lesson.id, courseId: lesson.courseId, score: score, answers: toSave)
            onCompleted(lesson.id)
        } catch {
            // El puntaje ya se muestra; el intento siguiente vuelve a guardar.
        }
    }

    private func retake() {
        answers = [:]
        submitted = false
        score = 0
        timeLeft = config.timeLimitMin > 0 ? config.timeLimitMin * 60 : nil
    }
}

/// Quiz de sección: lo califica el servidor.
struct SectionQuizView: View {
    let lesson: Lesson
    let onCompleted: (String) -> Void

    @State private var questions: [QuizQuestion] = []
    @State private var answers: [Int: QuizAnswer] = [:]
    @State private var submitted = false
    @State private var result: (score: Int, passed: Bool)?
    @State private var saving = false
    @State private var error: String?
    private let api = StudentAPI()

    private var allAnswered: Bool {
        questions.indices.allSatisfy { questions[$0].type == .ordering || (answers[$0]?.isAnswered ?? false) }
    }

    var body: some View {
        VStack(spacing: 14) {
            if questions.isEmpty {
                Text("Esta actividad no tiene preguntas.").italic().foregroundStyle(.secondary)
            } else {
                if let result {
                    ResultCard(score: result.score, passed: result.passed, message: result.passed ? "¡Aprobado!" : "Inténtalo de nuevo.")
                }
                ForEach(questions.indices, id: \.self) { i in
                    QuestionCard(number: i + 1, text: questions[i].question, graded: submitted ? questions[i].grade(answers[i]) : nil) {
                        QuizAnswerInput(
                            type: questions[i].type, options: questions[i].options,
                            matchRight: questions[i].matchRight ?? [],
                            answer: Binding(get: { answers[i] }, set: { answers[i] = $0 }), disabled: submitted
                        )
                    }
                }
                if let error { Text(error).foregroundStyle(Brand.danger) }
                if !submitted {
                    PrimaryButton(title: "Enviar", disabled: !allAnswered) { Task { await submit() } }
                } else if saving {
                    ProgressView()
                } else if let result, !result.passed {
                    GhostButton(title: "Reintentar") { answers = [:]; submitted = false; self.result = nil }
                }
            }
        }
        .onAppear { questions = QuizQuestion.parseSectionQuiz(lesson.sectionQuiz) }
    }

    private func submit() async {
        guard let sectionId = lesson.sectionId else { error = "No se pudo identificar la sección."; return }
        submitted = true
        saving = true
        error = nil
        defer { saving = false }
        var payload: [String: QuizAnswer] = [:]
        for (i, a) in answers { payload[String(i)] = a }
        do {
            result = try await api.submitSectionQuiz(sectionId: sectionId, courseId: lesson.courseId, answers: payload)
            onCompleted(lesson.id)
        } catch {
            self.error = error.localizedDescription
            submitted = false
        }
    }
}

/// Tarea: respuesta de texto que se puede actualizar.
struct AssignmentView: View {
    let lesson: Lesson
    let onCompleted: (String) -> Void

    @State private var text = ""
    @State private var loading = true
    @State private var saving = false
    @State private var savedAt: String?
    @State private var error: String?
    private let api = StudentAPI()

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else {
                Text("Tu respuesta").font(.subheadline.weight(.semibold))
                TextEditor(text: $text)
                    .frame(minHeight: 140)
                    .padding(8)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.3)))
                if let savedAt {
                    Text("Enviada · \(savedAt.prefix(10))").font(.caption).foregroundStyle(Brand.success)
                }
                if let error { Text(error).foregroundStyle(Brand.danger) }
                PrimaryButton(title: savedAt == nil ? "Enviar tarea" : "Actualizar respuesta", loading: saving) {
                    Task { await submit() }
                }
            }
        }
        .task {
            if let sub = try? await api.assignment(lessonId: lesson.id, courseId: lesson.courseId) {
                text = sub.content
                savedAt = sub.submittedAt
            }
            loading = false
        }
    }

    private func submit() async {
        let content = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty else { error = "Escribe tu respuesta antes de enviar."; return }
        error = nil
        saving = true
        defer { saving = false }
        do {
            try await api.submitAssignment(lessonId: lesson.id, courseId: lesson.courseId, content: content)
            try await api.completeLesson(lesson.id, courseId: lesson.courseId)
            savedAt = ISO8601DateFormatter().string(from: Date())
            onCompleted(lesson.id)
        } catch {
            self.error = "No se pudo enviar. Inténtalo de nuevo."
        }
    }
}

/// Examen final del curso; el servidor califica y emite el certificado.
struct ExamView: View {
    let courseId: String

    @State private var exam: Exam?
    @State private var loading = true
    @State private var error: String?
    @State private var answers: [String: QuizAnswer] = [:]
    @State private var result: ExamResult?
    @State private var submitting = false
    @State private var timeLeft: Int?
    private let api = StudentAPI()

    private var allAnswered: Bool {
        (exam?.questions ?? []).filter(\.isGradable).allSatisfy { $0.type == .ordering || (answers[$0.id]?.isAnswered ?? false) }
    }

    var body: some View {
        Group {
            if loading {
                ProgressView()
            } else if let exam {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Examen final").font(.title2.bold())
                        Text("Necesitas \(exam.passingScore)% para aprobar.").foregroundStyle(.secondary)
                        if let timeLeft, result == nil { TimerPill(seconds: timeLeft) }
                        if let result {
                            ResultCard(
                                score: Int(result.score.rounded()), passed: result.passed,
                                extra: result.certificate.map { "🎓 Certificado emitido · Folio \($0.number)" }
                            )
                        }
                        ForEach(Array(exam.questions.enumerated()), id: \.element.id) { i, q in
                            QuestionCard(number: i + 1, text: q.question) {
                                if q.isGradable {
                                    QuizAnswerInput(
                                        type: q.type ?? .multipleChoice, options: q.options ?? [], matchRight: q.matchRight ?? [],
                                        answer: Binding(get: { answers[q.id] }, set: { answers[q.id] = $0 }),
                                        disabled: result != nil
                                    )
                                } else {
                                    Text("Pregunta abierta — se evalúa manualmente.").font(.caption).italic().foregroundStyle(.secondary)
                                }
                            }
                        }
                        if let error { Text(error).foregroundStyle(Brand.danger) }
                        if result == nil {
                            PrimaryButton(title: "Enviar examen", loading: submitting, disabled: !allAnswered) { Task { await submit() } }
                        }
                    }
                    .padding(16)
                }
            } else {
                EmptyState(title: error ?? "Este curso no tiene examen final.")
            }
        }
        .navigationTitle("Examen")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do {
                exam = try await api.exam(courseId: courseId)
                if let limit = exam?.timeLimit, limit > 0 { timeLeft = limit * 60 }
            } catch {
                self.error = "No se pudo cargar el examen."
            }
            loading = false
        }
        .task(id: timeLeft) {
            guard let t = timeLeft, result == nil else { return }
            if t <= 0 { await submit(); return }
            try? await Task.sleep(for: .seconds(1))
            if !Task.isCancelled, timeLeft == t { timeLeft = t - 1 }
        }
    }

    private func submit() async {
        guard exam != nil, result == nil, !submitting else { return }
        submitting = true
        error = nil
        defer { submitting = false }
        do {
            result = try await api.submitExam(courseId: courseId, answers: answers)
            timeLeft = nil
        } catch {
            self.error = error.localizedDescription
        }
    }
}

struct TimerPill: View {
    let seconds: Int
    var body: some View {
        Label(seconds.mmss, systemImage: "timer")
            .font(.subheadline.bold())
            .foregroundStyle(seconds <= 30 ? Brand.danger : .primary)
            .padding(.horizontal, 16).padding(.vertical, 6)
            .overlay(Capsule().stroke(seconds <= 30 ? Brand.danger : Color.gray.opacity(0.3)))
            .frame(maxWidth: .infinity)
    }
}
