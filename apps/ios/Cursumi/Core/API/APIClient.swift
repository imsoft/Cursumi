import Foundation

enum APIError: LocalizedError {
    case http(Int, message: String?)
    case decoding(Error)
    case network(Error)

    var errorDescription: String? {
        switch self {
        case .http(let status, let message):
            return message ?? "HTTP \(status)"
        case .decoding:
            return "La respuesta del servidor no tiene el formato esperado."
        case .network:
            return "No se pudo conectar. Revisa tu conexión."
        }
    }
}

/// Cliente HTTP hacia la API de Cursumi. Adjunta la cookie de sesión y las
/// cabeceras que espera el plugin expo del servidor.
final class APIClient {
    static let shared = APIClient()

    let baseURL: URL
    let jar: CookieJar
    private let session: URLSession

    init(baseURL: URL = Config.apiURL, jar: CookieJar = CookieJar()) {
        self.baseURL = baseURL
        self.jar = jar
        // Las cookies las gestiona `CookieJar`, no Foundation: así controlamos qué
        // se guarda y evitamos que la cookie viaje a otros dominios.
        let config = URLSessionConfiguration.default
        config.httpShouldSetCookies = false
        config.httpCookieAcceptPolicy = .never
        config.timeoutIntervalForRequest = 30
        session = URLSession(configuration: config)
    }

    // MARK: - Peticiones

    struct Response {
        let status: Int
        let data: Data
        let headers: [AnyHashable: Any]

        var isOK: Bool { (200..<300).contains(status) }

        func decode<T: Decodable>(_ type: T.Type) throws -> T {
            do {
                return try JSONDecoder.api.decode(type, from: data)
            } catch {
                throw APIError.decoding(error)
            }
        }

        /// Mensaje `{ error: "..." }` o `{ message: "..." }` del cuerpo, si lo hay.
        var errorMessage: String? {
            guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            return (obj["error"] as? String) ?? (obj["message"] as? String)
        }
    }

    func request(
        _ method: String,
        _ path: String,
        query: [String: String] = [:],
        json body: Encodable? = nil,
        rawBody: Data? = nil,
        contentType: String? = nil,
        auth: Bool = true
    ) async throws -> Response {
        var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: false)!
        if !query.isEmpty {
            components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
        }
        var req = URLRequest(url: components.url!)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if auth, let cookie = jar.cookieHeader {
            req.setValue(cookie, forHTTPHeaderField: "Cookie")
        }
        if path.hasPrefix("api/auth/") || path.hasPrefix("/api/auth/") {
            // Mismas cabeceras que manda @better-auth/expo.
            req.setValue(Config.origin, forHTTPHeaderField: "expo-origin")
            req.setValue("true", forHTTPHeaderField: "x-skip-oauth-proxy")
        }
        if let body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONEncoder().encode(AnyEncodable(body))
        } else if let rawBody {
            req.httpBody = rawBody
            if let contentType { req.setValue(contentType, forHTTPHeaderField: "Content-Type") }
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: req)
        } catch {
            throw APIError.network(error)
        }
        let http = response as? HTTPURLResponse
        let headers = http?.allHeaderFields ?? [:]
        jar.store(responseHeaders: headers, for: req.url!)
        return Response(status: http?.statusCode ?? 0, data: data, headers: headers)
    }

    // MARK: - Atajos

    func get<T: Decodable>(_ path: String, query: [String: String] = [:], auth: Bool = true) async throws -> T {
        let res = try await request("GET", path, query: query, auth: auth)
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
        return try res.decode(T.self)
    }

    @discardableResult
    func post<T: Decodable>(_ path: String, _ body: Encodable? = nil) async throws -> T {
        let res = try await request("POST", path, json: body)
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
        return try res.decode(T.self)
    }

    func post(_ path: String, _ body: Encodable? = nil) async throws {
        let res = try await request("POST", path, json: body)
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
    }

    func patch(_ path: String, _ body: Encodable? = nil) async throws {
        let res = try await request("PATCH", path, json: body)
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
    }

    func delete(_ path: String, _ body: Encodable? = nil) async throws {
        let res = try await request("DELETE", path, json: body)
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
    }
}

/// Envuelve cualquier `Encodable` para poder pasarlo como existencial.
struct AnyEncodable: Encodable {
    private let encode: (Encoder) throws -> Void
    init(_ value: Encodable) { encode = value.encode }
    func encode(to encoder: Encoder) throws { try encode(encoder) }
}

extension JSONDecoder {
    /// Decoder tolerante con las fechas ISO de la API (con y sin fracción de segundo).
    static let api: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let raw = try decoder.singleValueContainer().decode(String.self)
            if let date = ISO8601DateFormatter.fractional.date(from: raw) ?? ISO8601DateFormatter.plain.date(from: raw) {
                return date
            }
            throw DecodingError.dataCorrupted(.init(codingPath: decoder.codingPath, debugDescription: "Fecha inválida: \(raw)"))
        }
        return decoder
    }()
}

extension ISO8601DateFormatter {
    static let fractional: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    static let plain = ISO8601DateFormatter()
}
