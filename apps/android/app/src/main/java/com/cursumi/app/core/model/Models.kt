package com.cursumi.app.core.model

import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.descriptors.buildClassSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive

// Formas de la API de Cursumi.

/** `category` llega como string o como `{ name }` según el endpoint. */
@Serializable(with = CategoryRefSerializer::class)
data class CategoryRef(val label: String?)

object CategoryRefSerializer : KSerializer<CategoryRef> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("CategoryRef")
    override fun deserialize(decoder: Decoder): CategoryRef {
        val el = (decoder as JsonDecoder).decodeJsonElement()
        return when (el) {
            is JsonPrimitive -> CategoryRef(el.contentOrNull())
            is JsonObject -> CategoryRef((el["name"] as? JsonPrimitive)?.contentOrNull())
            else -> CategoryRef(null)
        }
    }
    override fun serialize(encoder: Encoder, value: CategoryRef) = encoder.encodeString(value.label ?: "")
}

fun JsonPrimitive.contentOrNull(): String? = if (isString || content != "null") content else null

/** Lista que la API devuelve como array suelto o envuelta en `{ <clave>: [...] }`. */
class FlexibleListSerializer<T>(private val item: KSerializer<T>) : KSerializer<List<T>> {
    override val descriptor: SerialDescriptor = ListSerializer(item).descriptor
    override fun deserialize(decoder: Decoder): List<T> {
        val json = decoder as JsonDecoder
        val el = json.decodeJsonElement()
        val list: JsonArray? = when (el) {
            is JsonArray -> el
            is JsonObject -> el.values.firstNotNullOfOrNull { it as? JsonArray }
            else -> null
        }
        return list?.let { json.json.decodeFromJsonElement(ListSerializer(item), it) } ?: emptyList()
    }
    override fun serialize(encoder: Encoder, value: List<T>) = ListSerializer(item).serialize(encoder, value)
}

@Serializable
data class StudentCourse(
    val id: String,
    val title: String,
    val modality: String? = null,
    val progress: Double = 0.0,
    val instructorName: String = "",
    val category: CategoryRef? = null,
    val status: String = "in-progress",
    val imageUrl: String? = null,
    val lastLessonId: String? = null,
    val lastLessonTitle: String? = null,
) {
    val isCompleted get() = status == "completed"
}

@Serializable
data class CourseSummary(
    val id: String,
    val title: String,
    val price: Double = 0.0,
    val modality: String? = null,
    val slug: String? = null,
    val imageUrl: String? = null,
)

@Serializable data class CourseLesson(val id: String, val title: String, val type: String? = null)
@Serializable data class CourseSection(val id: String, val title: String, val lessons: List<CourseLesson> = emptyList())

@Serializable
data class StudentCourseDetail(
    val progress: Double = 0.0,
    val course: Course,
    val lessonProgress: List<LessonProgress> = emptyList(),
) {
    @Serializable data class Instructor(val name: String? = null)
    @Serializable data class Course(val title: String, val description: String? = null, val instructor: Instructor? = null, val sections: List<CourseSection> = emptyList())
    @Serializable data class LessonProgress(val lessonId: String)
}

@Serializable
data class Lesson(
    val id: String,
    val courseId: String,
    val sectionId: String? = null,
    val title: String,
    val description: String? = null,
    val type: String = "text",
    val duration: String? = null,
    val videoUrl: String? = null,
    val content: String? = null,
    /** Solo en lecciones `section_quiz`: preguntas de la sección (Json). */
    val sectionQuiz: JsonElement? = null,
    /** Solo en lecciones `section_minigame`: definición del juego (Json). */
    val sectionMinigame: JsonElement? = null,
    val completed: Boolean = false,
)

@Serializable
data class Certificate(
    val id: String,
    val courseId: String = "",
    val courseTitle: String = "",
    val instructorName: String = "",
    val issueDate: String = "",
    val certificateNumber: String = "",
    val hours: Double? = null,
)

@Serializable
data class Notification(
    val id: String,
    val type: String = "",
    val title: String,
    val body: String = "",
    val read: Boolean = false,
    val link: String? = null,
    val createdAt: String = "",
)

@Serializable data class NotificationsResponse(val notifications: List<Notification> = emptyList(), val unreadCount: Int = 0)

@Serializable
data class MyProfile(
    val fullName: String = "Usuario",
    val email: String = "",
    val joinDate: String = "",
    val avatar: String? = null,
    val phone: String = "",
    val state: String = "",
    val city: String = "",
    val bio: String = "",
    val website: String = "",
    val linkedinUrl: String = "",
    val instagramUrl: String = "",
    val role: String = "student",
    val coursesCompleted: Int = 0,
    val coursesInProgress: Int = 0,
)

@Serializable
data class ProfileUpdate(
    val fullName: String? = null,
    val phone: String? = null,
    val state: String? = null,
    val city: String? = null,
    val bio: String? = null,
    val website: String? = null,
    val linkedinUrl: String? = null,
    val instagramUrl: String? = null,
)

@Serializable data class Category(val name: String, val slug: String)
