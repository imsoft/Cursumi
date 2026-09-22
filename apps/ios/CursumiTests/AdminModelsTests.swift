import XCTest
@testable import Cursumi

final class AdminModelsTests: XCTestCase {
    func testFlexibleListAcceptsArrayOrAnyWrappedKey() throws {
        let a = #"[{"id":"1","name":"A","slug":"a"}]"#
        let w = #"{"categories":[{"id":"2","name":"B","slug":"b"}],"total":1}"#
        XCTAssertEqual(try JSONDecoder.api.decode(FlexibleList<AdminCategory>.self, from: Data(a.utf8)).items.count, 1)
        XCTAssertEqual(try JSONDecoder.api.decode(FlexibleList<AdminCategory>.self, from: Data(w.utf8)).items.first?.slug, "b")
        XCTAssertEqual(try JSONDecoder.api.decode(FlexibleList<AdminCategory>.self, from: Data(#"{"total":0}"#.utf8)).items.count, 0)
    }

    func testSlugMatchesExpoApp() {
        XCTAssertEqual("Diseño Gráfico".slugified, "diseno-grafico")
        XCTAssertEqual("  Negocios & Ventas ".slugified, "negocios-ventas")
    }

    func testKpiPercentIsClamped() throws {
        let k = try JSONDecoder.api.decode(AdminKpi.self, from: Data(#"{"id":"k","name":"n","targetValue":10,"currentValue":25}"#.utf8))
        XCTAssertEqual(k.percent, 100)
        let z = try JSONDecoder.api.decode(AdminKpi.self, from: Data(#"{"id":"k","name":"n","targetValue":0,"currentValue":5}"#.utf8))
        XCTAssertEqual(z.percent, 0)
    }

    func testNewGameQuestionEncodesWithoutId() throws {
        let q = NewGameQuestion(question: "¿?", options: ["a", "b", "c", "d"], correct: 2)
        let obj = try XCTUnwrap(JSONSerialization.jsonObject(with: JSONEncoder().encode(q)) as? [String: Any])
        XCTAssertNil(obj["id"])
        XCTAssertEqual(obj["correct"] as? Int, 2)
    }

    func testLabelsAndCleanNumbers() {
        XCTAssertEqual(QuoteRequest(id: "1", companyName: "c", contactName: "n", contactEmail: "e", contactPhone: nil, companySize: nil, interests: nil, message: nil, status: "new").statusLabel, "Nueva")
        XCTAssertEqual(12.0.clean, "12")
        XCTAssertEqual(12.5.clean, "12.50")
    }
}
