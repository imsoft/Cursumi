package com.cursumi.app.core.api

import com.cursumi.app.core.model.BlogPost
import com.cursumi.app.core.model.BlogPostSummary
import com.cursumi.app.core.model.ChatMessage
import com.cursumi.app.core.model.Conversation
import com.cursumi.app.core.model.FlexibleListSerializer
import com.cursumi.app.core.model.GameState
import com.cursumi.app.core.model.Note
import com.cursumi.app.core.model.OrgMaterialsResponse
import com.cursumi.app.core.model.Referral
import com.cursumi.app.core.model.Reflection
import com.cursumi.app.core.model.ReviewsResponse
import kotlinx.serialization.Serializable

/** Chat, notas, reflexiones, reseñas, referidos, blog, materiales, juegos y solicitud de instructor. */
class SocialApi(private val api: ApiClient) {

    suspend fun conversation(courseId: String): Conversation = api.get("api/conversations", mapOf("courseId" to courseId))
    suspend fun messages(conversationId: String): List<ChatMessage> = api.get("api/conversations/$conversationId/messages")
    @Serializable private data class MsgBody(val body: String)
    suspend fun sendMessage(conversationId: String, body: String): ChatMessage = api.post("api/conversations/$conversationId/messages", MsgBody(body))
    suspend fun markConversationRead(conversationId: String) = api.patch<Unit>("api/conversations/$conversationId/read")

    suspend fun notes(courseId: String? = null, lessonId: String? = null): List<Note> {
        val q = buildMap { courseId?.let { put("courseId", it) }; lessonId?.let { put("lessonId", it) } }
        return api.get("api/notes", q)
    }
    @Serializable private data class NoteBody(val courseId: String, val lessonId: String? = null, val content: String)
    suspend fun createNote(courseId: String, lessonId: String?, content: String): Note = api.post("api/notes", NoteBody(courseId, lessonId, content))
    suspend fun deleteNote(id: String) = api.delete<Unit>("api/notes/$id")

    @Serializable private data class ReflectionsReply(val reflections: List<Reflection>? = null)
    suspend fun reflections(courseId: String): List<Reflection> = api.get<ReflectionsReply>("api/courses/$courseId/learning-reflections").reflections ?: emptyList()
    @Serializable private data class ContentBody(val content: String)
    suspend fun postReflection(courseId: String, content: String) = api.postUnit("api/courses/$courseId/learning-reflections", ContentBody(content))

    suspend fun reviews(courseId: String): ReviewsResponse = api.get("api/courses/$courseId/reviews")
    @Serializable private data class ReviewBody(val rating: Int, val comment: String? = null)
    suspend fun postReview(courseId: String, rating: Int, comment: String?) = api.postUnit("api/courses/$courseId/reviews", ReviewBody(rating, comment))

    suspend fun referral(): Referral = api.get("api/me/referral")
    suspend fun blogPosts(): List<BlogPostSummary> = api.request("GET", "api/blog").throwIfError().decode(FlexibleListSerializer(BlogPostSummary.serializer()))
    suspend fun blogPost(slug: String): BlogPost = api.get("api/blog/$slug")
    suspend fun orgMaterials(): OrgMaterialsResponse = api.get("api/me/org-materials")

    @Serializable private data class ApplyBody(val headline: String, val bio: String, val reason: String)
    suspend fun applyInstructor(headline: String, bio: String, reason: String) = api.postUnit("api/instructor/apply", ApplyBody(headline, bio, reason))

    @Serializable private data class JoinBody(val code: String, val nickname: String)
    @Serializable private data class JoinReply(val gameId: String)
    suspend fun joinGame(code: String, nickname: String): String =
        api.post<JoinBody, JoinReply>("api/games/join", JoinBody(code.uppercase().trim(), nickname.trim())).gameId
    suspend fun game(gameId: String): GameState = api.get("api/games/$gameId")
    @Serializable private data class AnswerBody(val questionId: String, val selectedOption: Int)
    suspend fun answerGame(gameId: String, questionId: String, option: Int) = api.postUnit("api/games/$gameId/answer", AnswerBody(questionId, option))
}
