package com.cursumi.app.core.api

import android.content.ContentResolver
import android.net.Uri
import com.cursumi.app.core.model.AdminAnalytics
import com.cursumi.app.core.model.AdminApplication
import com.cursumi.app.core.model.AdminCategory
import com.cursumi.app.core.model.AdminCoupon
import com.cursumi.app.core.model.AdminFinances
import com.cursumi.app.core.model.AdminKpi
import com.cursumi.app.core.model.AdminReview
import com.cursumi.app.core.model.AdminStats
import com.cursumi.app.core.model.AdminUser
import com.cursumi.app.core.model.Category
import com.cursumi.app.core.model.FlexibleListSerializer
import com.cursumi.app.core.model.GameState
import com.cursumi.app.core.model.HostGame
import com.cursumi.app.core.model.InstructorAnalytics
import com.cursumi.app.core.model.InstructorConversation
import com.cursumi.app.core.model.InstructorCourse
import com.cursumi.app.core.model.InstructorEarnings
import com.cursumi.app.core.model.InstructorProfile
import com.cursumi.app.core.model.InstructorProfileUpdate
import com.cursumi.app.core.model.NewCoursePayload
import com.cursumi.app.core.model.NewGameQuestion
import com.cursumi.app.core.model.QuoteRequest
import com.cursumi.app.core.model.QuoteRequestPayload
import com.cursumi.app.core.model.StripeStatus
import com.cursumi.app.core.slugified
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody
import okio.BufferedSink
import okio.source

private suspend inline fun <reified T> ApiClient.getList(path: String, serializer: KSerializer<T>, query: Map<String, String> = emptyMap()): List<T> =
    request("GET", path, query).throwIfError().decode(FlexibleListSerializer(serializer))

/** Endpoints del instructor: ingresos, cursos, chats, perfil, Stripe, juegos y Mux. */
class InstructorApi(private val api: ApiClient) {
    suspend fun earnings(): InstructorEarnings = api.get("api/instructor/earnings")
    suspend fun analytics(): InstructorAnalytics = api.get("api/instructor/analytics")
    suspend fun courses(): List<InstructorCourse> = api.getList("api/instructor/courses", InstructorCourse.serializer())
    @Serializable private data class StatusBody(val status: String)
    suspend fun setCourseStatus(courseId: String, status: String) = api.patch("api/instructor/courses/$courseId", StatusBody(status))
    suspend fun conversations(): List<InstructorConversation> = api.getList("api/instructor/conversations", InstructorConversation.serializer())
    suspend fun profile(): InstructorProfile = api.get("api/instructor/profile")
    suspend fun updateProfile(update: InstructorProfileUpdate) = api.patch("api/instructor/profile", update)
    suspend fun stripeStatus(): StripeStatus = api.get("api/instructor/stripe/connect")

    @Serializable private data class UrlReply(val url: String? = null)
    /** Inicia o continúa el onboarding de Stripe Connect; devuelve la URL a abrir. */
    suspend fun startStripeConnect(): String {
        val r = api.request("POST", "api/instructor/stripe/connect").throwIfError().decode<UrlReply>()
        return r.url ?: throw ApiException(500, "No se pudo conectar con Stripe.")
    }

    suspend fun categories(): List<Category> = api.getList("api/categories", Category.serializer())
    @Serializable private data class IdReply(val id: String)
    suspend fun createCourse(payload: NewCoursePayload): String = api.post<NewCoursePayload, IdReply>("api/instructor/courses", payload).id

    // ── Mux ──
    @Serializable private data class MuxBody(val lessonTitle: String)
    @Serializable data class MuxUpload(val uploadId: String, val uploadUrl: String)
    suspend fun requestMuxUpload(lessonTitle: String): MuxUpload = api.post("api/mux/upload-url", MuxBody(lessonTitle))

    /** PUT directo del archivo a Mux (sin cookie: es otro dominio), leyendo el content URI en streaming. */
    suspend fun uploadVideo(uploadUrl: String, resolver: ContentResolver, uri: Uri) = withContext(Dispatchers.IO) {
        val body = object : RequestBody() {
            override fun contentType() = "video/mp4".toMediaType()
            override fun writeTo(sink: BufferedSink) {
                resolver.openInputStream(uri)?.use { sink.writeAll(it.source()) } ?: throw ApiException(0, "No se pudo leer el video.")
            }
        }
        api.http.newCall(Request.Builder().url(uploadUrl).put(body).build()).execute().use {
            if (!it.isSuccessful) throw ApiException(it.code, "Subida falló (HTTP ${it.code})")
        }
    }

    @Serializable private data class PlaybackReply(val playbackUrl: String? = null)
    suspend fun muxPlaybackUrl(uploadId: String): String? {
        val res = api.request("GET", "api/mux/playback/$uploadId")
        return if (res.isOk) res.decode<PlaybackReply>().playbackUrl else null
    }

    // ── Juegos (anfitrión) ──
    suspend fun myGames(): List<HostGame> = api.getList("api/games", HostGame.serializer())
    @Serializable private data class GameBody(val title: String, val questions: List<NewGameQuestion>)
    @Serializable private data class GameReply(val game: IdReply)
    suspend fun createGame(title: String, questions: List<NewGameQuestion>): String = api.post<GameBody, GameReply>("api/games", GameBody(title, questions)).game.id
    suspend fun hostGame(id: String): GameState = api.get("api/games/$id")
    suspend fun startGame(id: String) = api.postEmpty("api/games/$id/start")
    suspend fun nextQuestion(id: String) = api.postEmpty("api/games/$id/next")
    suspend fun finishGame(id: String) = api.postEmpty("api/games/$id/finish")

    suspend fun submitQuoteRequest(payload: QuoteRequestPayload) = api.postUnit("api/business/quote-requests", payload)
}

/** Endpoints de administración. */
class AdminApi(private val api: ApiClient) {
    suspend fun stats(): AdminStats = api.get("api/admin/stats")
    suspend fun finances(): AdminFinances = api.get("api/admin/finances")
    suspend fun analytics(): AdminAnalytics = api.get("api/admin/analytics")

    suspend fun reviews(approved: Boolean): List<AdminReview> = api.getList("api/admin/reviews", AdminReview.serializer(), mapOf("approved" to approved.toString()))
    @Serializable private data class ApprovedBody(val approved: Boolean)
    suspend fun setReviewApproved(id: String, approved: Boolean) = api.patch("api/admin/reviews/$id", ApprovedBody(approved))
    suspend fun deleteReview(id: String) = api.delete<Unit>("api/admin/reviews/$id")

    suspend fun applications(): List<AdminApplication> = api.getList("api/admin/instructor-applications", AdminApplication.serializer(), mapOf("status" to "pending"))
    @Serializable private data class ReviewAppBody(val action: String, val rejectionReason: String? = null)
    suspend fun reviewApplication(id: String, approve: Boolean, reason: String? = null) =
        api.patch("api/admin/instructor-applications/$id", ReviewAppBody(if (approve) "approve" else "reject", if (approve) null else reason))

    suspend fun users(): List<AdminUser> = api.getList("api/admin/users", AdminUser.serializer())
    @Serializable private data class RoleBody(val role: String)
    suspend fun setUserRole(id: String, role: String) = api.patch("api/admin/users/$id", RoleBody(role))

    suspend fun coupons(): List<AdminCoupon> = api.getList("api/admin/coupons", AdminCoupon.serializer())
    @Serializable private data class CouponBody(val code: String, val discountPct: Int)
    suspend fun createCoupon(code: String, discountPct: Int) = api.postUnit("api/admin/coupons", CouponBody(code, discountPct))
    @Serializable private data class ActiveBody(val active: Boolean)
    suspend fun setCouponActive(id: String, active: Boolean) = api.patch("api/admin/coupons/$id", ActiveBody(active))
    suspend fun deleteCoupon(id: String) = api.delete<Unit>("api/admin/coupons/$id")

    suspend fun categories(): List<AdminCategory> = api.getList("api/admin/categories", AdminCategory.serializer())
    @Serializable private data class CategoryBody(val name: String, val slug: String)
    suspend fun createCategory(name: String) = api.postUnit("api/admin/categories", CategoryBody(name, name.slugified()))
    suspend fun deleteCategory(id: String) = api.delete<Unit>("api/admin/categories/$id")

    suspend fun kpis(): List<AdminKpi> = api.getList("api/admin/kpis", AdminKpi.serializer())
    @Serializable private data class KpiBody(val name: String, val targetValue: Double, val unit: String? = null)
    suspend fun createKpi(name: String, targetValue: Double, unit: String?) = api.postUnit("api/admin/kpis", KpiBody(name, targetValue, unit))
    suspend fun deleteKpi(id: String) = api.delete<Unit>("api/admin/kpis/$id")

    suspend fun quoteRequests(): List<QuoteRequest> = api.getList("api/admin/business/quote-requests", QuoteRequest.serializer())
    @Serializable private data class QuoteStatusBody(val id: String, val status: String)
    suspend fun updateQuoteRequest(id: String, status: String) = api.patch("api/admin/business/quote-requests", QuoteStatusBody(id, status))
}
