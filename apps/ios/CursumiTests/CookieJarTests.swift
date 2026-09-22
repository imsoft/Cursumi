import XCTest
@testable import Cursumi

final class CookieJarTests: XCTestCase {
    private var storage: [String: String] = [:]
    private var jar: CookieJar!
    private let url = URL(string: "https://www.cursumi.com/api/auth/sign-in/email")!

    override func setUp() {
        storage = [:]
        jar = CookieJar(read: { self.storage[$0] }, write: { self.storage[$1] = $0 })
    }

    func testStoresBetterAuthSessionCookie() {
        jar.store(
            setCookieHeader: "__Secure-better-auth.session_token=abc.def; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax",
            for: url
        )
        XCTAssertTrue(jar.hasSession)
        XCTAssertEqual(jar.cookieHeader, "__Secure-better-auth.session_token=abc.def")
    }

    func testIgnoresForeignCookies() {
        jar.store(setCookieHeader: "_ga=123; Path=/", for: url)
        XCTAssertNil(jar.cookieHeader)
    }

    func testMaxAgeZeroRemovesCookie() {
        jar.store(setCookieHeader: "better-auth.session_token=abc; Max-Age=3600; Path=/", for: url)
        XCTAssertTrue(jar.hasSession)
        jar.store(setCookieHeader: "better-auth.session_token=; Max-Age=0; Path=/", for: url)
        XCTAssertFalse(jar.hasSession)
    }

    func testExpiredCookiesAreDroppedOnRead() {
        let stored = ["better-auth.session_token": CookieJar.Stored(value: "x", expires: "2000-01-01T00:00:00Z")]
        storage["cursumi_cookie"] = String(data: try! JSONEncoder().encode(stored), encoding: .utf8)
        XCTAssertFalse(jar.hasSession)
    }

    func testOAuthStateWithAndWithoutSecurePrefix() {
        jar.store(setCookieHeader: "__Secure-better-auth.oauth_state=s1; Path=/", for: url)
        XCTAssertEqual(jar.oauthState, "s1")
        jar.clear()
        jar.store(setCookieHeader: "better-auth.oauth_state=s2; Path=/", for: url)
        XCTAssertEqual(jar.oauthState, "s2")
    }

    func testStoresFromResponseHeaders() {
        jar.store(responseHeaders: ["Set-Cookie": "better-auth.session_token=tok; Path=/"], for: url)
        XCTAssertEqual(jar.cookieHeader, "better-auth.session_token=tok")
    }

    func testClearRemovesEverything() {
        jar.store(setCookieHeader: "better-auth.session_token=tok; Path=/", for: url)
        jar.clear()
        XCTAssertNil(jar.cookieHeader)
        XCTAssertFalse(jar.hasSession)
    }
}
