package com.cursumi.app.core.api

import com.cursumi.app.core.model.Certificate
import com.cursumi.app.core.model.CourseSummary
import com.cursumi.app.core.model.Exam
import com.cursumi.app.core.model.ExamResult
import com.cursumi.app.core.model.FlexibleListSerializer
import com.cursumi.app.core.model.Lesson
import com.cursumi.app.core.model.MyProfile
import com.cursumi.app.core.model.NotificationsResponse
import com.cursumi.app.core.model.ProfileUpdate
import com.cursumi.app.core.model.QuizAnswer
import com.cursumi.app.core.model.StudentCourse
import com.cursumi.app.core.model.StudentCourseDetail
import kotlinx.serialization.Serializable
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

/** Endpoints del alumno. Espejo de `apps/mobile/src/lib/me.ts`. */
class StudentApi(private val api: ApiClient) {

    suspend fun myCourses(): List<StudentCourse> = api.get("api/me/courses")
    suspend fun courseDetail(courseId: String): StudentCourseDetail = api.get("api/me/courses/$courseId")

    suspend fun catalog(search: String? = null): List<CourseSummary> {
        val query = if (search.isNullOrBlank()) emptyMap() else mapOf("q" to search)
        return api.request("GET", "api/courses", query, auth = false).throwIfError()
            .decode(FlexibleListSerializer(CourseSummary.serializer()))
    }

    suspend fun lesson(lessonId: String): Lesson = api.get("api/me/lessons/$lessonId")

    @Serializable private data class CompleteBody(val courseId: String, val score: Int? = null, val answers: Map<String, QuizAnswer>? = null)
    suspend fun completeLesson(lessonId: String, courseId: String, score: Int? = null, answers: Map<String, QuizAnswer>? = null) =
        api.postUnit("api/lessons/$lessonId/complete", CompleteBody(courseId, score, answers))

    @Serializable private data class SectionQuizBody(val courseId: String, val activityId: String, val answers: Map<String, QuizAnswer>)
    @Serializable private data class SectionQuizReply(val score: Double? = null, val passed: Boolean? = null)
    suspend fun submitSectionQuiz(sectionId: String, courseId: String, answers: Map<String, QuizAnswer>): Pair<Int, Boolean> {
        val r: SectionQuizReply = api.post("api/sections/$sectionId/quiz/submit", SectionQuizBody(courseId, "default", answers))
        return Math.round(r.score ?: 0.0).toInt() to (r.passed ?: false)
    }

    @Serializable private data class MinigameBody(val courseId: String, val activityId: String)
    suspend fun completeMinigame(sectionId: String, courseId: String) =
        api.postUnit("api/sections/$sectionId/minigame/complete", MinigameBody(courseId, "default"))

    @Serializable data class AssignmentSubmission(val content: String, val submittedAt: String = "")
    @Serializable private data class AssignmentReply(val submission: AssignmentSubmission? = null)
    suspend fun assignment(lessonId: String, courseId: String): AssignmentSubmission? {
        val res = api.request("GET", "api/lessons/$lessonId/assignment", mapOf("courseId" to courseId))
        return if (res.isOk) res.decode<AssignmentReply>().submission else null
    }

    @Serializable private data class AssignmentBody(val courseId: String, val content: String)
    suspend fun submitAssignment(lessonId: String, courseId: String, content: String) =
        api.postUnit("api/lessons/$lessonId/assignment", AssignmentBody(courseId, content))

    /** null si el curso no tiene examen (404). */
    suspend fun exam(courseId: String): Exam? {
        val res = api.request("GET", "api/courses/$courseId/exam")
        if (res.status == 404) return null
        return res.throwIfError().decode()
    }

    @Serializable private data class ExamBody(val answers: Map<String, QuizAnswer>)
    suspend fun submitExam(courseId: String, answers: Map<String, QuizAnswer>): ExamResult =
        api.post("api/courses/$courseId/exam/submit", ExamBody(answers))

    suspend fun profile(): MyProfile = api.get("api/me/profile")
    suspend fun updateProfile(update: ProfileUpdate) = api.patch("api/me/profile", update)

    suspend fun uploadAvatar(jpeg: ByteArray) {
        val body = MultipartBody.Builder().setType(MultipartBody.FORM)
            .addFormDataPart("file", "avatar.jpg", jpeg.toRequestBody("image/jpeg".toMediaType()))
            .build()
        api.request("POST", "api/me/avatar", rawBody = body).throwIfError()
    }

    suspend fun certificates(): List<Certificate> = api.get("api/me/certificates")
    suspend fun notifications(): NotificationsResponse = api.get("api/notifications")
    suspend fun markNotificationRead(id: String) = api.patch<Unit>("api/notifications/$id/read")
    suspend fun markAllNotificationsRead() = api.patch<Unit>("api/notifications/read-all")

    suspend fun wishlist(): List<String> = api.get("api/wishlist")

    @Serializable private data class WishBody(val courseId: String)
    @Serializable private data class WishReply(val saved: Boolean? = null)
    /** Alterna un curso en la lista de deseos. Devuelve si quedó guardado. */
    suspend fun toggleWishlist(courseId: String): Boolean =
        api.post<WishBody, WishReply>("api/wishlist", WishBody(courseId)).saved ?: false
}
