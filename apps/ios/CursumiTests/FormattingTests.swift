import XCTest
@testable import Cursumi

final class FormattingTests: XCTestCase {
    func testPriceMXNMatchesShared() {
        XCTAssertEqual(Formatting.priceMXN(0), "Gratis")
        XCTAssertEqual(Formatting.priceMXN(1234), "$1,234 MXN")
        XCTAssertEqual(Formatting.priceMXN(999.5, showDecimals: true), "$999.50 MXN")
    }

    func testInitials() {
        XCTAssertEqual(Formatting.initials("Ana López"), "AL")
        XCTAssertEqual(Formatting.initials("brandon"), "B")
        XCTAssertEqual(Formatting.initials("Juan Carlos Pérez"), "JC")
    }

    func testVideoSourceMux() {
        let source = VideoSource.from("https://stream.mux.com/abc123/high.mp4")
        XCTAssertEqual(source, .native(URL(string: "https://stream.mux.com/abc123.m3u8")!))
    }

    func testVideoSourceYouTube() {
        XCTAssertEqual(VideoSource.from("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), .youtube(id: "dQw4w9WgXcQ"))
        XCTAssertEqual(VideoSource.from("https://youtu.be/dQw4w9WgXcQ"), .youtube(id: "dQw4w9WgXcQ"))
    }

    func testVideoSourceDirectAndEmpty() {
        XCTAssertEqual(VideoSource.from("https://cdn.example.com/v.mp4"), .native(URL(string: "https://cdn.example.com/v.mp4")!))
        XCTAssertNil(VideoSource.from(nil))
        XCTAssertNil(VideoSource.from(""))
    }

    func testLessonContentEscapesPlainText() {
        let html = LessonContent.html(from: "a & b\nc")
        XCTAssertTrue(html.contains("a &amp; b<br/>c"))
        XCTAssertTrue(LessonContent.html(from: "<p>hola</p>").contains("<p>hola</p>"))
    }
}
