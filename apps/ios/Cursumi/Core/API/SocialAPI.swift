import Foundation

/// Chat, notas, reflexiones, reseñas, referidos, blog, materiales, juegos y
/// solicitud de instructor. Espejo de `apps/mobile/src/lib/me.ts`.
struct SocialAPI {
    let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    // MARK: Chat con el instructor

    /// Obtiene (o crea) la conversación del curso, con sus mensajes.
    func conversation(courseId: String) async throws -> Conversation {
        try await api.get("api/conversations", query: ["courseId": courseId])
    }

    func messages(conversationId: String) async throws -> [ChatMessage] {
        try await api.get("api/conversations/\(conversationId)/messages")
    }

    func sendMessage(conversationId: String, body: String) async throws -> ChatMessage {
        struct Body: Encodable { let body: String }
        return try await api.post("api/conversations/\(conversationId)/messages", Body(body: body))
    }

    func markConversationRead(_ conversationId: String) async throws {
        try await api.patch("api/conversations/\(conversationId)/read")
    }

    // MARK: Notas

    func notes(courseId: String? = nil, lessonId: String? = nil) async throws -> [Note] {
        var query: [String: String] = [:]
        if let courseId { query["courseId"] = courseId }
        if let lessonId { query["lessonId"] = lessonId }
        return try await api.get("api/notes", query: query)
    }

    func createNote(courseId: String, lessonId: String?, content: String) async throws -> Note {
        struct Body: Encodable { let courseId: String; let lessonId: String?; let content: String }
        return try await api.post("api/notes", Body(courseId: courseId, lessonId: lessonId, content: content))
    }

    func deleteNote(_ id: String) async throws {
        try await api.delete("api/notes/\(id)")
    }

    // MARK: Reflexiones y reseñas

    func reflections(courseId: String) async throws -> [Reflection] {
        struct Reply: Decodable { let reflections: [Reflection]? }
        let reply: Reply = try await api.get("api/courses/\(courseId)/learning-reflections")
        return reply.reflections ?? []
    }

    func postReflection(courseId: String, content: String) async throws {
        struct Body: Encodable { let content: String }
        try await api.post("api/courses/\(courseId)/learning-reflections", Body(content: content))
    }

    func reviews(courseId: String) async throws -> ReviewsResponse {
        try await api.get("api/courses/\(courseId)/reviews")
    }

    func postReview(courseId: String, rating: Int, comment: String?) async throws {
        struct Body: Encodable { let rating: Int; let comment: String? }
        try await api.post("api/courses/\(courseId)/reviews", Body(rating: rating, comment: comment))
    }

    // MARK: Referidos, blog, materiales

    func referral() async throws -> Referral {
        try await api.get("api/me/referral")
    }

    func blogPosts() async throws -> [BlogPostSummary] {
        let reply: BlogListResponse = try await api.get("api/blog")
        return reply.posts
    }

    func blogPost(slug: String) async throws -> BlogPost {
        try await api.get("api/blog/\(slug)")
    }

    func orgMaterials() async throws -> OrgMaterialsResponse {
        try await api.get("api/me/org-materials")
    }

    // MARK: Volverse instructor

    func applyInstructor(headline: String, bio: String, reason: String) async throws {
        struct Body: Encodable { let headline: String; let bio: String; let reason: String }
        try await api.post("api/instructor/apply", Body(headline: headline, bio: bio, reason: reason))
    }

    // MARK: Juegos en vivo (jugador)

    func joinGame(code: String, nickname: String) async throws -> String {
        struct Body: Encodable { let code: String; let nickname: String }
        struct Reply: Decodable { let gameId: String }
        let reply: Reply = try await api.post("api/games/join", Body(code: code.uppercased().trimmingCharacters(in: .whitespaces), nickname: nickname.trimmingCharacters(in: .whitespaces)))
        return reply.gameId
    }

    func game(_ gameId: String) async throws -> GameState {
        try await api.get("api/games/\(gameId)")
    }

    func answerGame(_ gameId: String, questionId: String, option: Int) async throws {
        struct Body: Encodable { let questionId: String; let selectedOption: Int }
        try await api.post("api/games/\(gameId)/answer", Body(questionId: questionId, selectedOption: option))
    }

    // MARK: Contraseña

    func changePassword(current: String, new: String) async throws {
        struct Body: Encodable { let currentPassword: String; let newPassword: String; let revokeOtherSessions: Bool }
        let res = try await api.request("POST", "api/auth/change-password", json: Body(currentPassword: current, newPassword: new, revokeOtherSessions: true))
        guard res.isOK else { throw APIError.http(res.status, message: res.errorMessage) }
    }
}
