package com.cursumi.app.core.model

import kotlinx.serialization.Serializable

// Chat, notas, reflexiones, reseñas, referidos, blog, materiales y juegos en vivo.

@Serializable data class ChatSender(val name: String? = null)
@Serializable data class ChatMessage(val id: String, val body: String, val senderId: String = "", val createdAt: String = "", val sender: ChatSender? = null)
@Serializable data class Conversation(val id: String, val messages: List<ChatMessage>? = null)

@Serializable data class NoteRef(val id: String, val title: String)
@Serializable data class Note(val id: String, val content: String, val createdAt: String = "", val course: NoteRef? = null, val lesson: NoteRef? = null)

@Serializable data class NamedUser(val name: String? = null)
@Serializable data class Reflection(val id: String, val content: String, val user: NamedUser? = null)
@Serializable data class Review(val id: String, val rating: Int = 0, val comment: String? = null, val user: NamedUser? = null)
@Serializable data class ReviewsResponse(val reviews: List<Review> = emptyList(), val average: Double? = null, val total: Int? = null)

@Serializable
data class Referral(
    val referralCode: String? = null,
    val referralLink: String = "",
    val totalReferrals: Int = 0,
    val pendingReferrals: Int = 0,
    val earnedReferrals: Int = 0,
    val totalEarnedCents: Int = 0,
    val totalPaidCents: Int = 0,
)

@Serializable data class BlogPostSummary(val title: String, val slug: String, val excerpt: String? = null, val coverImageUrl: String? = null)
@Serializable data class BlogAuthor(val name: String? = null)
@Serializable data class BlogPost(val title: String, val slug: String = "", val content: String = "", val coverImageUrl: String? = null, val author: BlogAuthor? = null)

@Serializable data class OrgMaterial(val id: String, val name: String, val description: String? = null, val fileUrl: String, val fileType: String = "")
@Serializable data class OrgMaterialsResponse(val orgName: String? = null, val materials: List<OrgMaterial> = emptyList())

// ── Juegos en vivo ──────────────────────────────────────────────────────────

@Serializable data class GameParticipant(val id: String, val nickname: String, val score: Int = 0)
@Serializable data class GameQuestion(val id: String, val question: String, val options: List<String> = emptyList())
@Serializable data class GameInfo(val id: String, val status: String, val currentQuestion: Int? = null, val code: String? = null, val questions: List<GameQuestion>? = null)
@Serializable data class MyAnswer(val selectedOption: Int? = null)

@Serializable
data class GameState(
    val game: GameInfo,
    val currentQ: GameQuestion? = null,
    val participants: List<GameParticipant> = emptyList(),
    val myAnswer: MyAnswer? = null,
    val myParticipantId: String? = null,
    val myNickname: String? = null,
) {
    val ranked get() = participants.sortedByDescending { it.score }
}
