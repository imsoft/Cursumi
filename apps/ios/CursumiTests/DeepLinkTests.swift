import XCTest
@testable import Cursumi

final class DeepLinkTests: XCTestCase {
    func testResetPasswordTokenExtraction() {
        XCTAssertEqual(DeepLink.resetPasswordToken(from: URL(string: "mobile://reset-password?token=abc")!), "abc")
        XCTAssertEqual(DeepLink.resetPasswordToken(from: URL(string: "mobile:///reset-password?token=abc")!), "abc")
        XCTAssertEqual(DeepLink.resetPasswordToken(from: URL(string: "mobile://reset-password/?token=a%2Fb&x=1")!), "a/b")
        XCTAssertNil(DeepLink.resetPasswordToken(from: URL(string: "mobile://reset-password")!))
        XCTAssertNil(DeepLink.resetPasswordToken(from: URL(string: "mobile://reset-password?token=")!))
        XCTAssertNil(DeepLink.resetPasswordToken(from: URL(string: "mobile://?cookie=abc")!))
        XCTAssertNil(DeepLink.resetPasswordToken(from: URL(string: "https://cursumi.com/reset-password?token=abc")!))
    }

    func testDeepLinkInit() {
        XCTAssertEqual(DeepLink(url: URL(string: "mobile://reset-password?token=t1")!), .resetPassword(token: "t1"))
        XCTAssertNil(DeepLink(url: URL(string: "mobile://?cookie=x")!))
        XCTAssertNil(DeepLink(url: URL(string: "mobile://other")!))
    }
}
