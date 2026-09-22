import Foundation

/// Endpoints del instructor: ingresos, cursos, chats, perfil, Stripe, juegos y Mux.
struct InstructorAPI {
    let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    func earnings() async throws -> InstructorEarnings { try await api.get("api/instructor/earnings") }
    func analytics() async throws -> InstructorAnalytics { try await api.get("api/instructor/analytics") }

    func courses() async throws -> [InstructorCourse] {
        let list: FlexibleList<InstructorCourse> = try await api.get("api/instructor/courses")
        return list.items
    }

    func setCourseStatus(_ courseId: String, status: String) async throws {
        struct Body: Encodable { let status: String }
        try await api.patch("api/instructor/courses/\(courseId)", Body(status: status))
    }

    func conversations() async throws -> [InstructorConversation] {
        let list: FlexibleList<InstructorConversation> = try await api.get("api/instructor/conversations")
        return list.items
    }

    func profile() async throws -> InstructorProfile { try await api.get("api/instructor/profile") }

    func updateProfile(_ update: InstructorProfileUpdate) async throws {
        try await api.patch("api/instructor/profile", update)
    }

    func stripeStatus() async throws -> StripeStatus { try await api.get("api/instructor/stripe/connect") }

    /// Inicia o continúa el onboarding de Stripe Connect; devuelve la URL a abrir.
    func startStripeConnect() async throws -> URL {
        struct Reply: Decodable { let url: String? }
        let reply: Reply = try await api.post("api/instructor/stripe/connect")
        guard let raw = reply.url, let url = URL(string: raw) else { throw APIError.http(500, message: "No se pudo conectar con Stripe.") }
        return url
    }

    func categories() async throws -> [Category] {
        let list: FlexibleList<Category> = try await api.get("api/categories")
        return list.items
    }

    func createCourse(_ payload: NewCoursePayload) async throws -> String {
        struct Reply: Decodable { let id: String }
        let reply: Reply = try await api.post("api/instructor/courses", payload)
        return reply.id
    }

    // MARK: Mux

    func requestMuxUpload(lessonTitle: String) async throws -> (uploadId: String, uploadUrl: URL) {
        struct Body: Encodable { let lessonTitle: String }
        struct Reply: Decodable { let uploadId: String; let uploadUrl: String }
        let reply: Reply = try await api.post("api/mux/upload-url", Body(lessonTitle: lessonTitle))
        guard let url = URL(string: reply.uploadUrl) else { throw APIError.http(500, message: "URL de subida inválida.") }
        return (reply.uploadId, url)
    }

    /// PUT directo del archivo a Mux (sin cookie: es otro dominio).
    func uploadVideo(to uploadUrl: URL, file: URL) async throws {
        var req = URLRequest(url: uploadUrl)
        req.httpMethod = "PUT"
        req.setValue("video/mp4", forHTTPHeaderField: "Content-Type")
        let (_, response) = try await URLSession.shared.upload(for: req, fromFile: file)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else { throw APIError.http(status, message: "Subida falló (HTTP \(status))") }
    }

    func muxPlaybackUrl(uploadId: String) async throws -> String? {
        struct Reply: Decodable { let playbackUrl: String? }
        let res = try await api.request("GET", "api/mux/playback/\(uploadId)")
        guard res.isOK else { return nil }
        return try res.decode(Reply.self).playbackUrl
    }

    // MARK: Juegos (anfitrión)

    func myGames() async throws -> [HostGame] {
        let list: FlexibleList<HostGame> = try await api.get("api/games")
        return list.items
    }

    func createGame(title: String, questions: [NewGameQuestion]) async throws -> String {
        struct Body: Encodable { let title: String; let questions: [NewGameQuestion] }
        struct Reply: Decodable { struct Game: Decodable { let id: String }; let game: Game }
        let reply: Reply = try await api.post("api/games", Body(title: title, questions: questions))
        return reply.game.id
    }

    func hostGame(_ id: String) async throws -> HostGameState { try await api.get("api/games/\(id)") }
    func startGame(_ id: String) async throws { try await api.post("api/games/\(id)/start") }
    func nextQuestion(_ id: String) async throws { try await api.post("api/games/\(id)/next") }
    func finishGame(_ id: String) async throws { try await api.post("api/games/\(id)/finish") }

    // MARK: Empresas (formulario público)

    func submitQuoteRequest(_ payload: QuoteRequestPayload) async throws {
        try await api.post("api/business/quote-requests", payload)
    }
}

/// Endpoints de administración.
struct AdminAPI {
    let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    func stats() async throws -> AdminStats { try await api.get("api/admin/stats") }
    func finances() async throws -> AdminFinances { try await api.get("api/admin/finances") }
    func analytics() async throws -> AdminAnalytics { try await api.get("api/admin/analytics") }

    func reviews(approved: Bool) async throws -> [AdminReview] {
        let list: FlexibleList<AdminReview> = try await api.get("api/admin/reviews", query: ["approved": approved ? "true" : "false"])
        return list.items
    }
    func setReviewApproved(_ id: String, _ approved: Bool) async throws {
        struct Body: Encodable { let approved: Bool }
        try await api.patch("api/admin/reviews/\(id)", Body(approved: approved))
    }
    func deleteReview(_ id: String) async throws { try await api.delete("api/admin/reviews/\(id)") }

    func applications() async throws -> [AdminApplication] {
        let list: FlexibleList<AdminApplication> = try await api.get("api/admin/instructor-applications", query: ["status": "pending"])
        return list.items
    }
    func reviewApplication(_ id: String, approve: Bool, reason: String? = nil) async throws {
        struct Body: Encodable { let action: String; let rejectionReason: String? }
        try await api.patch("api/admin/instructor-applications/\(id)", Body(action: approve ? "approve" : "reject", rejectionReason: approve ? nil : reason))
    }

    func users() async throws -> [AdminUser] {
        let list: FlexibleList<AdminUser> = try await api.get("api/admin/users")
        return list.items
    }
    func setUserRole(_ id: String, role: String) async throws {
        struct Body: Encodable { let role: String }
        try await api.patch("api/admin/users/\(id)", Body(role: role))
    }

    func coupons() async throws -> [AdminCoupon] {
        let list: FlexibleList<AdminCoupon> = try await api.get("api/admin/coupons")
        return list.items
    }
    func createCoupon(code: String, discountPct: Int) async throws {
        struct Body: Encodable { let code: String; let discountPct: Int }
        try await api.post("api/admin/coupons", Body(code: code, discountPct: discountPct))
    }
    func setCouponActive(_ id: String, _ active: Bool) async throws {
        struct Body: Encodable { let active: Bool }
        try await api.patch("api/admin/coupons/\(id)", Body(active: active))
    }
    func deleteCoupon(_ id: String) async throws { try await api.delete("api/admin/coupons/\(id)") }

    func categories() async throws -> [AdminCategory] {
        let list: FlexibleList<AdminCategory> = try await api.get("api/admin/categories")
        return list.items
    }
    func createCategory(name: String) async throws {
        struct Body: Encodable { let name: String; let slug: String }
        try await api.post("api/admin/categories", Body(name: name, slug: name.slugified))
    }
    func deleteCategory(_ id: String) async throws { try await api.delete("api/admin/categories/\(id)") }

    func kpis() async throws -> [AdminKpi] {
        let list: FlexibleList<AdminKpi> = try await api.get("api/admin/kpis")
        return list.items
    }
    func createKpi(name: String, targetValue: Double, unit: String?) async throws {
        struct Body: Encodable { let name: String; let targetValue: Double; let unit: String? }
        try await api.post("api/admin/kpis", Body(name: name, targetValue: targetValue, unit: unit))
    }
    func deleteKpi(_ id: String) async throws { try await api.delete("api/admin/kpis/\(id)") }

    func quoteRequests() async throws -> [QuoteRequest] {
        let list: FlexibleList<QuoteRequest> = try await api.get("api/admin/business/quote-requests")
        return list.items
    }
    func updateQuoteRequest(_ id: String, status: String) async throws {
        struct Body: Encodable { let id: String; let status: String }
        try await api.patch("api/admin/business/quote-requests", Body(id: id, status: status))
    }
}
