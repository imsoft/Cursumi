import XCTest
@testable import Cursumi

final class QuizTests: XCTestCase {
    // MARK: Calificación (mismos criterios que el servidor)

    func testGradesMultipleChoiceAndTrueFalse() {
        let q = QuizQuestion.make(question: "¿?", options: ["a", "b"], correctAnswer: 1)
        XCTAssertTrue(q.grade(.index(1)))
        XCTAssertFalse(q.grade(.index(0)))
        XCTAssertFalse(q.grade(nil))
        XCTAssertFalse(q.grade(.indices([1])))
    }

    func testGradesCheckboxIgnoringOrder() {
        let q = QuizQuestion.make(question: "¿?", options: ["a", "b", "c"], type: .checkbox, correctAnswers: [0, 2])
        XCTAssertTrue(q.grade(.indices([2, 0])))
        XCTAssertFalse(q.grade(.indices([0])))
        XCTAssertFalse(q.grade(.indices([0, 1, 2])))
    }

    func testGradesOrderingByText() {
        let q = QuizQuestion.make(question: "¿?", options: ["uno", "dos", "tres"], type: .ordering)
        XCTAssertTrue(q.grade(.texts(["uno", "dos", "tres"])))
        XCTAssertFalse(q.grade(.texts(["dos", "uno", "tres"])))
        XCTAssertFalse(q.grade(.texts(["uno", "dos"])))
    }

    func testGradesMatchingByText() {
        let q = QuizQuestion.make(question: "¿?", options: ["México", "Perú"], type: .matching, matchRight: ["CDMX", "Lima"])
        XCTAssertTrue(q.grade(.texts(["CDMX", "Lima"])))
        XCTAssertFalse(q.grade(.texts(["Lima", "CDMX"])))
    }

    // MARK: Parseo

    func testParsesLessonQuizAndConfig() {
        let content = """
        {"timeLimit":5,"attempts":2,"passingScore":80,"questions":[
          {"question":"Q1","options":["a","b"],"correctAnswer":0},
          {"question":"Q2","type":"checkbox","options":["a","b"],"correctAnswers":[0,1]},
          {"question":"Q3","type":"matching","options":["x"],"matchRight":["y"]}
        ]}
        """
        let qs = QuizQuestion.parseLessonQuiz(content)
        XCTAssertEqual(qs.count, 3)
        XCTAssertEqual(qs[0].type, .multipleChoice)
        XCTAssertEqual(qs[0].correctAnswer, 0)
        XCTAssertEqual(qs[1].correctAnswers, [0, 1])
        XCTAssertEqual(qs[2].matchRight, ["y"])
        XCTAssertEqual(QuizConfig.parse(content), QuizConfig(timeLimitMin: 5, maxAttempts: 2, passingScore: 80))
    }

    func testParsesLessonQuizAsBareArrayWithDefaultConfig() {
        let content = #"[{"question":"Q","options":["a"],"correctAnswer":0}]"#
        XCTAssertEqual(QuizQuestion.parseLessonQuiz(content).count, 1)
        XCTAssertEqual(QuizConfig.parse(content), QuizConfig())
        XCTAssertEqual(QuizQuestion.parseLessonQuiz("no es json").count, 0)
        XCTAssertEqual(QuizQuestion.parseLessonQuiz(nil).count, 0)
    }

    func testParsesSectionQuizUsingCorrectKeyAndDropsEmptyOptions() {
        let raw = JSONValue.parse(#"{"questions":[{"question":"Q","options":["a","b"],"correct":1},{"question":"vacía","options":[]}]}"#)
        let qs = QuizQuestion.parseSectionQuiz(raw)
        XCTAssertEqual(qs.count, 1)
        XCTAssertEqual(qs[0].correctAnswer, 1)
    }

    func testParsesMinigames() {
        XCTAssertEqual(
            Minigame.parse(JSONValue.parse(#"{"type":"memory","pairs":[{"term":"t","definition":"d"}]}"#)),
            .memory(instruction: nil, pairs: [.init(term: "t", definition: "d")])
        )
        XCTAssertEqual(
            Minigame.parse(JSONValue.parse(#"{"type":"sort","instruction":"Ordena","items":["1","2"]}"#)),
            .sort(instruction: "Ordena", items: ["1", "2"])
        )
        XCTAssertNil(Minigame.parse(JSONValue.parse(#"{"type":"otro"}"#)))
        XCTAssertNil(Minigame.parse(JSONValue.parse(#"{"type":"hangman","words":[]}"#)))
    }

    // MARK: Serialización hacia el servidor

    func testAnswerEncodesLikeTheExpoClient() throws {
        let payload: [String: QuizAnswer] = ["0": .index(2), "1": .indices([0, 1]), "2": .texts(["a", "b"])]
        let data = try JSONEncoder().encode(payload)
        let obj = try XCTUnwrap(JSONSerialization.jsonObject(with: data) as? [String: Any])
        XCTAssertEqual(obj["0"] as? Int, 2)
        XCTAssertEqual(obj["1"] as? [Int], [0, 1])
        XCTAssertEqual(obj["2"] as? [String], ["a", "b"])
    }

    func testIsAnsweredRejectsGaps() {
        XCTAssertTrue(QuizAnswer.index(0).isAnswered)
        XCTAssertFalse(QuizAnswer.indices([]).isAnswered)
        XCTAssertFalse(QuizAnswer.texts(["a", ""]).isAnswered)
        XCTAssertTrue(QuizAnswer.texts(["a", "b"]).isAnswered)
    }

    func testHangmanNormalizationAndTimer() {
        XCTAssertEqual(normalizedLetters("Canción"), "CANCION")
        XCTAssertEqual(normalizedLetters("año"), "AÑO")
        XCTAssertEqual(65.mmss, "1:05")
        XCTAssertEqual(600.mmss, "10:00")
    }

    func testLessonDecodesSectionJson() throws {
        let json = #"{"id":"l","courseId":"c","sectionId":"s","title":"T","type":"section_quiz","sectionQuiz":{"questions":[]},"sectionMinigame":null,"completed":false}"#
        let lesson = try JSONDecoder.api.decode(Lesson.self, from: Data(json.utf8))
        XCTAssertNotNil(lesson.sectionQuiz?["questions"])
        XCTAssertNil(lesson.sectionMinigame) // `null` decodifica como ausente
    }
}
