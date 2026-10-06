package com.cursumi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import java.util.UUID

// Instructor y administración.

@Serializable data class InstructorEarnings(val total: Double = 0.0, val thisMonth: Double? = null, val courses: Int? = null)
@Serializable data class InstructorAnalytics(val totalCourses: Int = 0, val publishedCourses: Int = 0, val totalStudents: Int = 0, val avgProgress: Double = 0.0)

@Serializable
data class InstructorCourse(
    val id: String, val title: String, val modality: String? = null, val status: String = "draft",
    val price: Double? = null, val imageUrl: String? = null, val studentsCount: Int? = null,
) {
    val statusLabel get() = mapOf("draft" to "Borrador", "published" to "Publicado", "archived" to "Archivado")[status] ?: status
}

@Serializable data class ConvStudent(val name: String? = null)
@Serializable data class ConvCourse(val title: String? = null)
@Serializable data class ConvMessage(val body: String)
@Serializable data class InstructorConversation(val id: String, val student: ConvStudent? = null, val course: ConvCourse? = null, val messages: List<ConvMessage>? = null)

@Serializable data class InstructorProfile(val headline: String = "", val bio: String = "", val specialties: String = "", val teachingYears: Int? = null)
@Serializable data class InstructorProfileUpdate(val headline: String, val bio: String, val specialties: String, val teachingYears: Int? = null)
@Serializable data class StripeStatus(val connected: Boolean? = null, val onboarded: Boolean? = null)

@Serializable
data class NewLesson(
    val id: String = UUID.randomUUID().toString(), val title: String = "", val type: String = "text",
    val order: Int = 0, val content: String? = null, val videoUrl: String? = null,
)
@Serializable data class NewSection(val id: String = UUID.randomUUID().toString(), val title: String = "", val order: Int = 0, val lessons: List<NewLesson> = emptyList())

@Serializable
data class NewCoursePayload(
    val title: String, val description: String, val category: String, val level: String, val modality: String,
    /** Derivado de la modalidad: virtual → ondemand · evento → fechado */
    val courseType: String, val startDate: String, val duration: String, val price: Double,
    val imageUrl: String? = null, val sections: List<NewSection>, val isDraft: Boolean,
)

@Serializable data class HostGameCount(val participants: Int? = null, val questions: Int? = null)
@Serializable data class HostGame(val id: String, val title: String, val code: String = "", val status: String = "", @SerialName("_count") val count: HostGameCount? = null)

@Serializable
data class NewGameQuestion(
    @Transient val uid: String = UUID.randomUUID().toString(),
    val question: String = "", val options: List<String> = listOf("", "", "", ""), val correct: Int = 0,
)

// ── Admin ────────────────────────────────────────────────────────────────────

@Serializable
data class AdminStats(
    val totalUsers: Int = 0, val totalCourses: Int = 0, val publishedCourses: Int = 0, val draftCourses: Int = 0,
    val totalEnrollments: Int = 0,
    /** Valor de catálogo (precio × inscripciones), NO dinero cobrado. */
    val estimatedRevenue: Double = 0.0,
)
@Serializable data class AdminFinances(val totalRevenue: Double? = null, val totalPlatformFee: Double? = null, val totalInstructorPayouts: Double? = null, val thisMonthRevenue: Double? = null)
@Serializable data class RevenueMonth(val month: String, val amount: Double = 0.0)
@Serializable data class UsersMonth(val month: String, val users: Int = 0)
@Serializable data class AdminAnalytics(val revenueByMonth: List<RevenueMonth>? = null, val usersByMonth: List<UsersMonth>? = null)

@Serializable data class TitledCourse(val title: String? = null)
@Serializable data class AdminReview(val id: String, val rating: Int = 0, val comment: String? = null, val approved: Boolean = false, val user: NamedUser? = null, val course: TitledCourse? = null)
@Serializable data class AppUser(val id: String, val name: String? = null, val email: String? = null)
@Serializable data class AdminApplication(val id: String, val status: String = "", val headline: String? = null, val bio: String? = null, val reason: String? = null, val user: AppUser? = null)
@Serializable data class AdminUser(val id: String, val name: String? = null, val email: String? = null, val role: String = "student")
@Serializable data class AdminCoupon(val id: String, val code: String, val discountPct: Int = 0, val maxUses: Int? = null, val usedCount: Int? = null, val active: Boolean = true)
@Serializable data class CatCount(val courses: Int? = null)
@Serializable data class AdminCategory(val id: String, val name: String, val slug: String = "", @SerialName("_count") val count: CatCount? = null)
@Serializable
data class AdminKpi(val id: String, val name: String, val unit: String? = null, val targetValue: Double = 0.0, val currentValue: Double = 0.0) {
    val percent get() = if (targetValue > 0) minOf(100, Math.round(currentValue / targetValue * 100).toInt()) else 0
}

@Serializable
data class QuoteRequest(
    val id: String, val companyName: String, val contactName: String = "", val contactEmail: String = "",
    val contactPhone: String? = null, val companySize: String? = null, val interests: String? = null,
    val message: String? = null, val status: String = "new",
) {
    val statusLabel get() = mapOf("new" to "Nueva", "contacted" to "Contactada", "converted" to "Convertida", "closed" to "Cerrada")[status] ?: status
}

@Serializable
data class QuoteRequestPayload(
    val companyName: String, val contactName: String, val contactEmail: String, val contactPhone: String? = null,
    val companySize: String? = null, val interests: String? = null, val message: String? = null,
)

// ── Alumnos del instructor ───────────────────────────────────────────────────

@Serializable
data class InstructorStudent(
    val enrollmentId: String, val studentId: String = "", val studentName: String = "", val studentEmail: String = "",
    val progress: Double = 0.0, val status: String = "", val enrolledAt: String = "",
) {
    val progressPercent get() = progress.coerceIn(0.0, 100.0).toInt()
}

@Serializable
data class InstructorCourseStudents(
    val courseId: String, val courseTitle: String = "", val modality: String? = null, val status: String = "",
    val students: List<InstructorStudent> = emptyList(),
)

// ── Pagos a instructores ─────────────────────────────────────────────────────

@Serializable
data class PayoutRow(
    val transactionId: String, val createdAt: String = "", val courseTitle: String = "", val studentName: String = "",
    val amountCents: Long = 0, val instructorAmountCents: Long = 0,
)

@Serializable
data class PayoutGroup(
    val instructorId: String, val instructorName: String = "", val instructorEmail: String = "",
    val stripeAccountId: String? = null, val stripeOnboarded: Boolean = false, val pendingCents: Long = 0,
    val rows: List<PayoutRow> = emptyList(),
)

@Serializable data class PayoutsResponse(val groups: List<PayoutGroup> = emptyList(), val totalPendingCents: Long = 0)

// ── Bitácora ─────────────────────────────────────────────────────────────────

@Serializable
data class AuditLog(
    val id: String, val actorId: String = "", val actorEmail: String? = null, val action: String = "",
    val targetType: String? = null, val targetId: String? = null,
    /** Cualquier JSON (objeto, array, primitivo) o null. */
    val metadata: JsonElement? = null,
    val ip: String? = null, val createdAt: String = "",
) {
    /** Etiqueta legible de la acción; si no la conocemos, la clave tal cual. */
    val label get() = labels[action] ?: action

    /** `metadata` compacto para mostrar; vacío si es null. */
    val metadataText: String get() = when (val m = metadata) {
        null, is JsonNull -> ""
        else -> m.toString()
    }

    companion object {
        val labels = mapOf(
            "user.role_change" to "Cambio de rol",
            "instructor_application.approve" to "Instructor aprobado",
            "instructor_application.reject" to "Instructor rechazado",
            "course.disable" to "Curso deshabilitado",
            "course.enable" to "Curso habilitado",
            "platform_fee.change" to "Cambio de comisión",
            "review.delete" to "Reseña eliminada",
            "payout.transfer" to "Pago transferido",
            "payout.mark-paid" to "Pago registrado a mano",
        )
    }
}

// ── Ajustes de plataforma ────────────────────────────────────────────────────

@Serializable data class PlatformFee(val platformFeePercent: Double = 0.0)
@Serializable data class SocialLink(val key: String, val label: String = "", val url: String = "", val visible: Boolean = true)

// ── Firma para certificados ──────────────────────────────────────────────────

@Serializable data class SignatureReply(val url: String? = null)
