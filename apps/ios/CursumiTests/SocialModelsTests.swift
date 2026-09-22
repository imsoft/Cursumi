import XCTest
@testable import Cursumi

final class SocialModelsTests: XCTestCase {
    func testBlogListAcceptsArrayOrWrapped() throws {
        let a = #"[{"title":"A","slug":"a"}]"#
        let w = #"{"posts":[{"title":"B","slug":"b","excerpt":null}]}"#
        XCTAssertEqual(try JSONDecoder.api.decode(BlogListResponse.self, from: Data(a.utf8)).posts.first?.slug, "a")
        XCTAssertEqual(try JSONDecoder.api.decode(BlogListResponse.self, from: Data(w.utf8)).posts.first?.slug, "b")
    }

    func testGameStateRanksByScore() throws {
        let json = """
        {"game":{"id":"g","status":"finished","currentQuestion":2},"currentQ":null,
         "participants":[{"id":"1","nickname":"a","score":10,"userId":"u1"},{"id":"2","nickname":"b","score":30,"userId":"u2"}],
         "myAnswer":null,"myParticipantId":"1","myNickname":"a"}
        """
        let s = try JSONDecoder.api.decode(GameState.self, from: Data(json.utf8))
        XCTAssertEqual(s.ranked.map(\.nickname), ["b", "a"])
        XCTAssertEqual(s.game.status, "finished")
    }

    func testChatMessageAndNoteDecode() throws {
        let m = #"{"id":"m","body":"hola","senderId":"u","createdAt":"2026-09-21T10:00:00.000Z","sender":{"name":"Ana"}}"#
        XCTAssertEqual(try JSONDecoder.api.decode(ChatMessage.self, from: Data(m.utf8)).sender?.name, "Ana")
        let n = #"{"id":"n","content":"x","createdAt":"2026-09-21T10:00:00Z","course":{"id":"c","title":"Curso"},"lesson":null}"#
        XCTAssertEqual(try JSONDecoder.api.decode(Note.self, from: Data(n.utf8)).course?.title, "Curso")
    }

    func testReviewsResponseToleratesMissingAggregates() throws {
        let r = try JSONDecoder.api.decode(ReviewsResponse.self, from: Data(#"{"reviews":[{"id":"r","rating":4}]}"#.utf8))
        XCTAssertEqual(r.reviews.count, 1)
        XCTAssertNil(r.average)
    }
}
