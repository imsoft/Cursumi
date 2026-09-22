import Foundation

/// Endpoints del alumno. Espejo de `apps/mobile/src/lib/me.ts`.
struct StudentAPI {
    let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    // MARK: Cursos

    func myCourses() async throws -> [StudentCourse] {
        try await api.get("api/me/courses")
    }

    func courseDetail(_ courseId: String) async throws -> StudentCourseDetail {
        try await api.get("api/me/courses/\(courseId)")
    }

    func catalog(search: String? = nil) async throws -> [CourseSummary] {
        var query: [String: String] = [:]
        if let search, !search.isEmpty { query["q"] = search }
        let res: CourseListResponse = try await api.get("api/courses", query: query, auth: false)
        return res.courses
    }

    // MARK: Lecciones

    func lesson(_ lessonId: String) async throws -> Lesson {
        try await api.get("api/me/lessons/\(lessonId)")
    }

    func completeLesson(_ lessonId: String, courseId: String, score: Int? = nil) async throws {
        struct Body: Encodable { let courseId: String; let score: Int? }
        try await api.post("api/lessons/\(lessonId)/complete", Body(courseId: courseId, score: score))
    }

    // MARK: Perfil

    func profile() async throws -> MyProfile {
        try await api.get("api/me/profile")
    }

    func updateProfile(_ update: ProfileUpdate) async throws {
        try await api.patch("api/me/profile", update)
    }

    func uploadAvatar(jpeg: Data) async throws {
        let boundary = "cursumi-\(UUID().uuidString)"
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"avatar.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(jpeg)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        let res = try await api.request("POST", "api/me/avatar", rawBody: body, contentType: "multipart/form-data; boundary=\(boundary)")
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
    }

    // MARK: Certificados, notificaciones, deseos

    func certificates() async throws -> [Certificate] {
        try await api.get("api/me/certificates")
    }

    func notifications() async throws -> NotificationsResponse {
        try await api.get("api/notifications")
    }

    func markNotificationRead(_ id: String) async throws {
        try await api.patch("api/notifications/\(id)/read")
    }

    func markAllNotificationsRead() async throws {
        try await api.patch("api/notifications/read-all")
    }

    func wishlist() async throws -> [String] {
        try await api.get("api/wishlist")
    }

    /// Alterna un curso en la lista de deseos. Devuelve si quedó guardado.
    func toggleWishlist(_ courseId: String) async throws -> Bool {
        struct Body: Encodable { let courseId: String }
        struct Reply: Decodable { let saved: Bool? }
        let reply: Reply = try await api.post("api/wishlist", Body(courseId: courseId))
        return reply.saved ?? false
    }
}
