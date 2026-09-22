import XCTest
@testable import Cursumi

final class ModelsTests: XCTestCase {
    func testStudentCourseDecodesCategoryAsStringOrObject() throws {
        let asString = """
        {"id":"c1","title":"Curso","progress":42.5,"instructorName":"Ana","category":"Diseño","status":"in-progress","imageUrl":"https://x/y.png"}
        """
        let asObject = """
        {"id":"c2","title":"Curso","progress":100,"instructorName":"Ana","category":{"name":"Negocios"},"status":"completed","imageUrl":null}
        """
        let a = try JSONDecoder.api.decode(StudentCourse.self, from: Data(asString.utf8))
        let b = try JSONDecoder.api.decode(StudentCourse.self, from: Data(asObject.utf8))
        XCTAssertEqual(a.category?.label, "Diseño")
        XCTAssertEqual(b.category?.label, "Negocios")
        XCTAssertFalse(a.isCompleted)
        XCTAssertTrue(b.isCompleted)
    }

    func testCourseListAcceptsArrayOrWrappedObject() throws {
        let array = #"[{"id":"1","title":"A","price":0}]"#
        let wrapped = #"{"courses":[{"id":"2","title":"B","price":499,"slug":"b"}],"total":1}"#
        XCTAssertEqual(try JSONDecoder.api.decode(CourseListResponse.self, from: Data(array.utf8)).courses.count, 1)
        let res = try JSONDecoder.api.decode(CourseListResponse.self, from: Data(wrapped.utf8))
        XCTAssertEqual(res.courses.first?.slug, "b")
    }

    func testNotificationDecodesISODatesWithAndWithoutFraction() throws {
        let json = """
        {"notifications":[
          {"id":"n1","type":"info","title":"T","body":"B","read":false,"createdAt":"2026-09-21T10:00:00.123Z"},
          {"id":"n2","type":"info","title":"T","body":"B","read":true,"link":"/x","createdAt":"2026-09-21T10:00:00Z"}
        ],"unreadCount":1}
        """
        let res = try JSONDecoder.api.decode(NotificationsResponse.self, from: Data(json.utf8))
        XCTAssertEqual(res.notifications.count, 2)
        XCTAssertEqual(res.unreadCount, 1)
    }

    func testSessionInfoDecodes() throws {
        let json = """
        {"session":{"id":"s","expiresAt":"2026-09-28T10:00:00.000Z","token":"t"},
         "user":{"id":"u","name":"Ana","email":"a@b.c","image":null,"role":"student","emailVerified":true}}
        """
        let info = try JSONDecoder.api.decode(SessionInfo.self, from: Data(json.utf8))
        XCTAssertEqual(info.user.role, "student")
    }
}
