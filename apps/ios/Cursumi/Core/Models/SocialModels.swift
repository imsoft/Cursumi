import Foundation

// Chat, notas, reflexiones, reseñas, referidos, blog, materiales y juegos en vivo.

struct ChatMessage: Decodable, Identifiable, Equatable {
    struct Sender: Decodable, Equatable { let name: String? }
    let id: String
    let body: String
    let senderId: String
    let createdAt: Date
    let sender: Sender?
}

struct Conversation: Decodable {
    let id: String
    let messages: [ChatMessage]?
}

struct Note: Decodable, Identifiable, Equatable {
    struct Ref: Decodable, Equatable { let id: String; let title: String }
    let id: String
    let content: String
    let createdAt: Date
    let course: Ref?
    let lesson: Ref?
}

struct Reflection: Decodable, Identifiable, Equatable {
    struct User: Decodable, Equatable { let name: String? }
    let id: String
    let content: String
    let user: User?
}

struct Review: Decodable, Identifiable, Equatable {
    struct User: Decodable, Equatable { let name: String? }
    let id: String
    let rating: Int
    let comment: String?
    let user: User?
}

struct ReviewsResponse: Decodable {
    let reviews: [Review]
    let average: Double?
    let total: Int?
}

struct Referral: Decodable, Equatable {
    let referralCode: String?
    let referralLink: String
    let totalReferrals: Int
    let pendingReferrals: Int
    let earnedReferrals: Int
    let totalEarnedCents: Int
    let totalPaidCents: Int
}

struct BlogPostSummary: Decodable, Identifiable, Equatable {
    var id: String { slug }
    let title: String
    let slug: String
    let excerpt: String?
    let coverImageUrl: String?
}

struct BlogPost: Decodable {
    struct Author: Decodable { let name: String? }
    let title: String
    let slug: String
    let content: String
    let coverImageUrl: String?
    let author: Author?
}

/// `/api/blog` devuelve array o `{ posts }`.
struct BlogListResponse: Decodable {
    let posts: [BlogPostSummary]
    init(from decoder: Decoder) throws {
        if let list = try? decoder.singleValueContainer().decode([BlogPostSummary].self) {
            posts = list
        } else {
            let c = try decoder.container(keyedBy: Keys.self)
            posts = (try? c.decode([BlogPostSummary].self, forKey: .posts)) ?? []
        }
    }
    private enum Keys: String, CodingKey { case posts }
}

struct OrgMaterial: Decodable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String?
    let fileUrl: String
    let fileType: String
}

struct OrgMaterialsResponse: Decodable {
    let orgName: String?
    let materials: [OrgMaterial]
}

// MARK: - Juegos en vivo (lado jugador)

struct GameParticipant: Decodable, Identifiable, Equatable {
    let id: String
    let nickname: String
    let score: Int
}

struct GameQuestion: Decodable, Identifiable, Equatable {
    let id: String
    let question: String
    let options: [String]
}

struct GameState: Decodable {
    struct Game: Decodable {
        let id: String
        let status: String // waiting | active | finished
        let currentQuestion: Int?
    }
    struct MyAnswer: Decodable { let selectedOption: Int? }
    let game: Game
    let currentQ: GameQuestion?
    let participants: [GameParticipant]
    let myAnswer: MyAnswer?
    let myParticipantId: String?
    let myNickname: String?

    var ranked: [GameParticipant] { participants.sorted { $0.score > $1.score } }
}
