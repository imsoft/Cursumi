import XCTest
@testable import Cursumi

/// Modelos de las secciones añadidas para paridad con la web.
final class ParityModelsTests: XCTestCase {
    func testInstructorStudentsDecode() throws {
        let json = """
        [{"courseId":"c1","courseTitle":"Swift","modality":"virtual","status":"published","students":[
          {"enrollmentId":"e1","studentId":"u1","studentName":"Ana","studentEmail":"ana@x.com","progress":42.6,"status":"active","enrolledAt":"2026-09-01T10:00:00.000Z"},
          {"enrollmentId":"e2","studentId":"u2","studentName":null,"studentEmail":null,"progress":120,"status":"completed","enrolledAt":"2026-09-02T10:00:00Z"}
        ]}]
        """
        let list = try JSONDecoder.api.decode(FlexibleList<InstructorCourseStudents>.self, from: Data(json.utf8)).items
        XCTAssertEqual(list.count, 1)
        XCTAssertEqual(list[0].id, "c1")
        XCTAssertEqual(list[0].students.map(\.progressPercent), [43, 100])
        XCTAssertNil(list[0].students[1].studentName)
    }

    func testPayoutsDecode() throws {
        let json = """
        {"groups":[{"instructorId":"i1","instructorName":"Luis","instructorEmail":"l@x.com","stripeAccountId":null,"stripeOnboarded":false,"pendingCents":12345,
          "rows":[{"transactionId":"t1","createdAt":"2026-09-21T10:00:00.000Z","courseTitle":"Curso","studentName":"Ana","amountCents":15000,"instructorAmountCents":12345}]}],
         "totalPendingCents":12345}
        """
        let p = try JSONDecoder.api.decode(AdminPayouts.self, from: Data(json.utf8))
        XCTAssertEqual(p.totalPendingCents, 12345)
        XCTAssertEqual(p.groups.first?.id, "i1")
        XCTAssertFalse(p.groups[0].stripeOnboarded)
        XCTAssertNil(p.groups[0].stripeAccountId)
        XCTAssertEqual(p.groups[0].rows.first?.id, "t1")
        XCTAssertEqual(Formatting.centsMXN(p.groups[0].rows[0].instructorAmountCents), "$123.45 MXN")
        XCTAssertEqual(Formatting.centsMXN(0), "$0.00 MXN")
    }

    func testAuditLogLabelsAndMetadata() throws {
        let json = """
        [{"id":"a1","actorId":"u","actorEmail":"admin@x.com","action":"user.role_change","targetType":"user","targetId":"u2",
          "metadata":{"to":"admin","from":"student","n":2,"ok":true,"nested":{"a":[1,2]}},"ip":"1.2.3.4","createdAt":"2026-09-21T10:00:00Z"},
         {"id":"a2","actorId":"u","actorEmail":null,"action":"something.new","targetType":null,"targetId":null,"metadata":null,"ip":null,"createdAt":"2026-09-21T10:00:00Z"},
         {"id":"a3","actorId":"u","action":"payout.mark-paid","metadata":"nota libre","createdAt":"2026-09-21T10:00:00Z"}]
        """
        let logs = try JSONDecoder.api.decode(FlexibleList<AuditLog>.self, from: Data(json.utf8)).items
        XCTAssertEqual(logs.count, 3)
        XCTAssertEqual(logs[0].actionLabel, "Cambio de rol")
        XCTAssertEqual(logs[0].metadataSummary, #"from: student · n: 2 · nested: {"a":[1,2]} · ok: sí · to: admin"#)
        XCTAssertEqual(logs[1].actionLabel, "something.new")
        XCTAssertNil(logs[1].metadataSummary)
        XCTAssertEqual(logs[2].actionLabel, "Pago registrado a mano")
        XCTAssertEqual(logs[2].metadataSummary, "nota libre")
    }

    func testKnownAuditActionsHaveLabels() throws {
        let known = ["instructor_application.approve": "Instructor aprobado", "instructor_application.reject": "Instructor rechazado",
                     "course.disable": "Curso deshabilitado", "course.enable": "Curso habilitado", "platform_fee.change": "Cambio de comisión",
                     "review.delete": "Reseña eliminada", "payout.transfer": "Pago transferido"]
        for (action, label) in known {
            let log = try JSONDecoder.api.decode(AuditLog.self, from: Data(#"{"id":"x","actorId":"u","action":"\#(action)","createdAt":"2026-09-21T10:00:00Z"}"#.utf8))
            XCTAssertEqual(log.actionLabel, label)
        }
    }

    func testPlatformFeeRoundTrip() throws {
        let fee = try JSONDecoder.api.decode(PlatformFee.self, from: Data(#"{"platformFeePercent":15}"#.utf8))
        XCTAssertEqual(fee.platformFeePercent, 15)
        let obj = try XCTUnwrap(JSONSerialization.jsonObject(with: JSONEncoder().encode(PlatformFee(platformFeePercent: 12.5))) as? [String: Any])
        XCTAssertEqual(obj["platformFeePercent"] as? Double, 12.5)
    }

    func testSocialLinksDecodeAndEncodeFullArray() throws {
        let json = #"[{"key":"instagram","label":"Instagram","url":"https://instagram.com/cursumi","visible":true},{"key":"x","label":"X","url":"","visible":false}]"#
        var links = try JSONDecoder.api.decode(FlexibleList<SocialLink>.self, from: Data(json.utf8)).items
        XCTAssertEqual(links.map(\.id), ["instagram", "x"])
        links[1].url = "https://x.com/cursumi"
        links[1].visible = true
        let encoded = try XCTUnwrap(JSONSerialization.jsonObject(with: JSONEncoder().encode(links)) as? [[String: Any]])
        XCTAssertEqual(encoded.count, 2)
        XCTAssertEqual(encoded[1]["url"] as? String, "https://x.com/cursumi")
        XCTAssertEqual(encoded[1]["visible"] as? Bool, true)
    }

    func testSignatureInfoAcceptsNullAndDataURL() throws {
        XCTAssertNil(try JSONDecoder.api.decode(SignatureInfo.self, from: Data(#"{"url":null}"#.utf8)).url)
        // PNG de 1×1 px.
        let png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        let info = try JSONDecoder.api.decode(SignatureInfo.self, from: Data(#"{"url":"data:image/png;base64,\#(png)"}"#.utf8))
        XCTAssertNotNil(SignatureImage.inlineImage(try XCTUnwrap(info.url)))
        XCTAssertNil(SignatureImage.inlineImage("https://res.cloudinary.com/x/firma.png"))
    }

    func testMultipartBodyLayout() {
        let body = APIClient.multipartBody(boundary: "B", field: "file", filename: "firma.png", mimeType: "image/png", data: Data("PNG".utf8))
        let text = String(decoding: body, as: UTF8.self)
        XCTAssertTrue(text.hasPrefix("--B\r\nContent-Disposition: form-data; name=\"file\"; filename=\"firma.png\"\r\nContent-Type: image/png\r\n\r\nPNG"))
        XCTAssertTrue(text.hasSuffix("\r\n--B--\r\n"))
    }
}
