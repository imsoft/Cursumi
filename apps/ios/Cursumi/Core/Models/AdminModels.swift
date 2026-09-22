import Foundation

// Instructor y administración. Espejo de `apps/mobile/src/lib/me.ts`.

/// Lista que la API devuelve como array suelto o envuelta en `{ <clave>: [...] }`.
struct FlexibleList<T: Decodable>: Decodable {
    let items: [T]

    init(from decoder: Decoder) throws {
        if let list = try? decoder.singleValueContainer().decode([T].self) {
            items = list
            return
        }
        let container = try decoder.container(keyedBy: AnyKey.self)
        for key in container.allKeys {
            if let list = try? container.decode([T].self, forKey: key) {
                items = list
                return
            }
        }
        items = []
    }

    private struct AnyKey: CodingKey {
        var stringValue: String
        var intValue: Int? { nil }
        init?(stringValue: String) { self.stringValue = stringValue }
        init?(intValue: Int) { nil }
    }
}

// MARK: - Instructor

struct InstructorEarnings: Decodable {
    let total: Double
    let thisMonth: Double?
    let courses: Int?
}

struct InstructorAnalytics: Decodable {
    let totalCourses: Int
    let publishedCourses: Int
    let totalStudents: Int
    let avgProgress: Double
}

struct InstructorCourse: Decodable, Identifiable, Equatable {
    let id: String
    let title: String
    let modality: String?
    let status: String // draft | published | archived
    let price: Double?
    let imageUrl: String?
    let studentsCount: Int?

    var statusLabel: String {
        ["draft": "Borrador", "published": "Publicado", "archived": "Archivado"][status] ?? status
    }
}

struct InstructorConversation: Decodable, Identifiable {
    struct Student: Decodable { let name: String? }
    struct Course: Decodable { let title: String? }
    struct Message: Decodable { let body: String }
    let id: String
    let student: Student?
    let course: Course?
    let messages: [Message]?
}

struct InstructorProfile: Decodable {
    let headline: String
    let bio: String
    let specialties: String
    let teachingYears: Int?
}

struct InstructorProfileUpdate: Encodable {
    let headline: String
    let bio: String
    let specialties: String
    let teachingYears: Int?
}

struct StripeStatus: Decodable {
    let connected: Bool?
    let onboarded: Bool?
}

struct Category: Decodable, Identifiable, Equatable {
    var id: String { slug }
    let name: String
    let slug: String
}

struct NewLesson: Encodable, Identifiable, Equatable {
    var id: String = UUID().uuidString
    var title = ""
    var type = "text" // text | video
    var order = 0
    var content: String?
    var videoUrl: String?
}

struct NewSection: Encodable, Identifiable, Equatable {
    var id: String = UUID().uuidString
    var title = ""
    var order = 0
    var lessons: [NewLesson] = []
}

struct NewCoursePayload: Encodable {
    let title: String
    let description: String
    let category: String
    let level: String
    let modality: String // virtual | evento
    /// Derivado de la modalidad: virtual → ondemand · evento → fechado
    let courseType: String
    let startDate: String
    let duration: String
    let price: Double
    let imageUrl: String?
    let sections: [NewSection]
    let isDraft: Bool
}

struct HostGame: Decodable, Identifiable {
    struct Count: Decodable { let participants: Int?; let questions: Int? }
    let id: String
    let title: String
    let code: String
    let status: String
    let _count: Count?
}

struct NewGameQuestion: Encodable, Identifiable, Equatable {
    var id = UUID()
    var question = ""
    var options = ["", "", "", ""]
    var correct = 0
    enum CodingKeys: String, CodingKey { case question, options, correct }
}

/// Estado del juego visto por el anfitrión (incluye código y total de preguntas).
struct HostGameState: Decodable {
    struct Game: Decodable {
        let id: String
        let status: String
        let currentQuestion: Int?
        let code: String?
        let questions: [GameQuestion]?
    }
    let game: Game
    let currentQ: GameQuestion?
    let participants: [GameParticipant]

    var ranked: [GameParticipant] { participants.sorted { $0.score > $1.score } }
}

// MARK: - Admin

struct AdminStats: Decodable {
    let totalUsers: Int
    let totalCourses: Int
    let publishedCourses: Int
    let draftCourses: Int
    let totalEnrollments: Int
    /// Valor de catálogo (precio × inscripciones), NO dinero cobrado.
    let estimatedRevenue: Double
}

struct AdminFinances: Decodable {
    let totalRevenue: Double?
    let totalPlatformFee: Double?
    let totalInstructorPayouts: Double?
    let thisMonthRevenue: Double?
}

struct AdminAnalytics: Decodable {
    struct Revenue: Decodable, Identifiable { var id: String { month }; let month: String; let amount: Double }
    struct Users: Decodable, Identifiable { var id: String { month }; let month: String; let users: Int }
    let revenueByMonth: [Revenue]?
    let usersByMonth: [Users]?
}

struct AdminReview: Decodable, Identifiable {
    struct User: Decodable { let name: String? }
    struct Course: Decodable { let title: String? }
    let id: String
    let rating: Int
    let comment: String?
    let approved: Bool
    let user: User?
    let course: Course?
}

struct AdminApplication: Decodable, Identifiable {
    struct User: Decodable { let id: String; let name: String?; let email: String? }
    let id: String
    let status: String
    let headline: String?
    let bio: String?
    let reason: String?
    let user: User?
}

struct AdminUser: Decodable, Identifiable {
    let id: String
    let name: String?
    let email: String?
    var role: String
}

struct AdminCoupon: Decodable, Identifiable {
    let id: String
    let code: String
    let discountPct: Int
    let maxUses: Int?
    let usedCount: Int?
    let active: Bool
}

struct AdminCategory: Decodable, Identifiable {
    struct Count: Decodable { let courses: Int? }
    let id: String
    let name: String
    let slug: String
    let _count: Count?
}

struct AdminKpi: Decodable, Identifiable {
    let id: String
    let name: String
    let unit: String?
    let targetValue: Double
    let currentValue: Double

    var percent: Int { targetValue > 0 ? min(100, Int((currentValue / targetValue * 100).rounded())) : 0 }
}

struct QuoteRequest: Decodable, Identifiable {
    let id: String
    let companyName: String
    let contactName: String
    let contactEmail: String
    let contactPhone: String?
    let companySize: String?
    let interests: String?
    let message: String?
    var status: String

    var statusLabel: String {
        ["new": "Nueva", "contacted": "Contactada", "converted": "Convertida", "closed": "Cerrada"][status] ?? status
    }
}

struct QuoteRequestPayload: Encodable {
    let companyName: String
    let contactName: String
    let contactEmail: String
    let contactPhone: String?
    let companySize: String?
    let interests: String?
    let message: String?
}

extension String {
    /// Slug como lo genera la app Expo al crear categorías.
    var slugified: String {
        let folded = folding(options: .diacriticInsensitive, locale: nil).lowercased()
        let parts = folded.split { !($0.isLetter || $0.isNumber) || !$0.isASCII }
        return parts.joined(separator: "-")
    }
}
