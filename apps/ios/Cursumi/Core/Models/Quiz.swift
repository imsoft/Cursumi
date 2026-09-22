import Foundation

// Quizzes, examen y minijuegos. Misma lógica de calificación que el servidor.

enum QuizQuestionType: String, Decodable {
    case multipleChoice = "multiple-choice"
    case trueFalse = "true-false"
    case checkbox
    case ordering
    case matching
    case shortAnswer = "short-answer"
}

/// Respuesta del alumno, con la misma forma que espera el servidor:
///  - `.index`   → opción múltiple / verdadero-falso (índice)
///  - `.indices` → casillas (índices marcados)
///  - `.texts`   → ordenar (textos en el orden elegido) / relacionar (pareja
///                 elegida para cada elemento izquierdo, en el orden de `options`)
enum QuizAnswer: Encodable, Equatable {
    case index(Int)
    case indices([Int])
    case texts([String])

    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .index(let i): try c.encode(i)
        case .indices(let a): try c.encode(a)
        case .texts(let a): try c.encode(a)
        }
    }

    /// Una respuesta cuenta si no está vacía ni tiene huecos.
    var isAnswered: Bool {
        switch self {
        case .index: return true
        case .indices(let a): return !a.isEmpty
        case .texts(let a): return !a.isEmpty && a.allSatisfy { !$0.isEmpty }
        }
    }
}

struct QuizQuestion: Equatable {
    var question: String
    /// ordenar: opciones en su orden CORRECTO. relacionar: columna izquierda.
    var options: [String]
    var type: QuizQuestionType = .multipleChoice
    var correctAnswer: Int?
    var correctAnswers: [Int]?
    /// relacionar: `matchRight[i]` es la pareja correcta de `options[i]`.
    var matchRight: [String]?

    /// Califica una respuesta con los mismos criterios que el servidor.
    func grade(_ answer: QuizAnswer?) -> Bool {
        guard let answer else { return false }
        switch type {
        case .checkbox:
            guard case .indices(let sel) = answer, let expected = correctAnswers else { return false }
            return Set(sel) == Set(expected)
        case .ordering:
            guard case .texts(let a) = answer else { return false }
            return a == options
        case .matching:
            guard case .texts(let a) = answer, let right = matchRight else { return false }
            return a == right
        default:
            guard case .index(let i) = answer else { return false }
            return i == correctAnswer
        }
    }

    private init(question: String, options: [String], type: QuizQuestionType, correctAnswer: Int?, correctAnswers: [Int]?, matchRight: [String]?) {
        self.question = question
        self.options = options
        self.type = type
        self.correctAnswer = correctAnswer
        self.correctAnswers = correctAnswers
        self.matchRight = matchRight
    }

    static func make(question: String, options: [String], type: QuizQuestionType = .multipleChoice, correctAnswer: Int? = nil, correctAnswers: [Int]? = nil, matchRight: [String]? = nil) -> QuizQuestion {
        QuizQuestion(question: question, options: options, type: type, correctAnswer: correctAnswer, correctAnswers: correctAnswers, matchRight: matchRight)
    }

    /// Preguntas de un quiz de lección (`lesson.content` es JSON: array o `{questions}`).
    static func parseLessonQuiz(_ content: String?) -> [QuizQuestion] {
        guard let content, let json = JSONValue.parse(content) else { return [] }
        return parse(list: json.array ?? json["questions"]?.array, correctKey: "correctAnswer")
    }

    /// Preguntas del quiz de sección (`section.quiz`, Json de Prisma).
    static func parseSectionQuiz(_ raw: JSONValue?) -> [QuizQuestion] {
        guard let raw else { return [] }
        return parse(list: raw.array ?? raw["questions"]?.array, correctKey: "correct")
            .filter { !$0.options.isEmpty }
    }

    private static func parse(list: [JSONValue]?, correctKey: String) -> [QuizQuestion] {
        (list ?? []).map { q in
            QuizQuestion(
                question: q["question"]?.string ?? "",
                options: q["options"]?.stringArray ?? [],
                type: q["type"]?.string.flatMap(QuizQuestionType.init) ?? .multipleChoice,
                correctAnswer: q[correctKey]?.int ?? (correctKey == "correct" ? 0 : nil),
                correctAnswers: q["correctAnswers"]?.intArray,
                matchRight: q["matchRight"]?.stringArray
            )
        }
    }
}

struct QuizConfig: Equatable {
    /// Límite en minutos (0 = sin límite).
    var timeLimitMin = 0
    /// Máximo de intentos (0 = ilimitados).
    var maxAttempts = 0
    /// Puntaje mínimo para aprobar (0–100).
    var passingScore = 70

    static func parse(_ content: String?) -> QuizConfig {
        guard let content, let json = JSONValue.parse(content), case .object = json else { return QuizConfig() }
        return QuizConfig(
            timeLimitMin: json["timeLimit"]?.int ?? 0,
            maxAttempts: json["attempts"]?.int ?? 0,
            passingScore: json["passingScore"]?.int ?? 70
        )
    }
}

// MARK: - Examen final

struct ExamQuestion: Decodable, Identifiable {
    let id: String
    let question: String
    let type: QuizQuestionType?
    /// ordenar: ya barajadas por el servidor. relacionar: columna izquierda.
    let options: [String]?
    /// relacionar: columna derecha barajada, sin revelar la pareja.
    let matchRight: [String]?
    let points: Double?

    var isGradable: Bool { !(options ?? []).isEmpty }
}

struct Exam: Decodable {
    let id: String
    let passingScore: Int
    let timeLimit: Int?
    let questions: [ExamQuestion]
}

struct ExamResult: Decodable {
    struct Certificate: Decodable { let id: String; let number: String }
    let score: Double
    let passed: Bool
    let certificate: Certificate?
}

// MARK: - Minijuegos de sección

enum Minigame: Equatable {
    struct Pair: Equatable { let term: String; let definition: String }
    struct Word: Equatable { let word: String; let hint: String }
    struct MatchPair: Equatable { let left: String; let right: String }

    case memory(instruction: String?, pairs: [Pair])
    case hangman(instruction: String?, words: [Word])
    case sort(instruction: String?, items: [String])
    case match(instruction: String?, pairs: [MatchPair])

    var instruction: String? {
        switch self {
        case .memory(let i, _), .hangman(let i, _), .sort(let i, _), .match(let i, _): return i
        }
    }

    static func parse(_ raw: JSONValue?) -> Minigame? {
        guard let raw, let type = raw["type"]?.string else { return nil }
        let instruction = raw["instruction"]?.string
        switch type {
        case "memory":
            let pairs = (raw["pairs"]?.array ?? []).compactMap { p -> Pair? in
                guard let t = p["term"]?.string, let d = p["definition"]?.string else { return nil }
                return Pair(term: t, definition: d)
            }
            return pairs.isEmpty ? nil : .memory(instruction: instruction, pairs: pairs)
        case "hangman":
            let words = (raw["words"]?.array ?? []).compactMap { w -> Word? in
                guard let word = w["word"]?.string else { return nil }
                return Word(word: word, hint: w["hint"]?.string ?? "")
            }
            return words.isEmpty ? nil : .hangman(instruction: instruction, words: words)
        case "sort":
            let items = raw["items"]?.stringArray ?? []
            return items.isEmpty ? nil : .sort(instruction: instruction, items: items)
        case "match":
            let pairs = (raw["pairs"]?.array ?? []).compactMap { p -> MatchPair? in
                guard let l = p["left"]?.string, let r = p["right"]?.string else { return nil }
                return MatchPair(left: l, right: r)
            }
            return pairs.isEmpty ? nil : .match(instruction: instruction, pairs: pairs)
        default:
            return nil
        }
    }
}

/// Quita acentos y pasa a mayúsculas para comparar letras en el ahorcado. La Ñ se
/// conserva como letra propia (el teclado del juego la tiene).
func normalizedLetters(_ s: String) -> String {
    s.map { ch -> String in
        if ch == "ñ" || ch == "Ñ" { return "Ñ" }
        return String(ch).folding(options: .diacriticInsensitive, locale: nil).uppercased()
    }.joined()
}

extension Int {
    /// Segundos → "m:ss".
    var mmss: String { String(format: "%d:%02d", self / 60, self % 60) }
}
