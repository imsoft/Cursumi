package com.cursumi.app.core.model

import com.cursumi.app.core.api.AppJson
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.descriptors.buildClassSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonEncoder
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive

// Quizzes, examen y minijuegos. Espejo de la lógica de `apps/mobile/src/lib/me.ts`.

enum class QuizQuestionType(val wire: String) {
    MULTIPLE_CHOICE("multiple-choice"), TRUE_FALSE("true-false"), CHECKBOX("checkbox"),
    ORDERING("ordering"), MATCHING("matching"), SHORT_ANSWER("short-answer");

    companion object {
        fun from(raw: String?): QuizQuestionType = entries.firstOrNull { it.wire == raw } ?: MULTIPLE_CHOICE
    }
}

/**
 * Respuesta del alumno, con la forma que espera el servidor:
 *  - [Index]   → opción múltiple / verdadero-falso (índice)
 *  - [Indices] → casillas (índices marcados)
 *  - [Texts]   → ordenar (textos en el orden elegido) / relacionar (pareja
 *                elegida para cada elemento izquierdo, en el orden de `options`)
 */
@Serializable(with = QuizAnswerSerializer::class)
sealed interface QuizAnswer {
    data class Index(val value: Int) : QuizAnswer
    data class Indices(val values: List<Int>) : QuizAnswer
    data class Texts(val values: List<String>) : QuizAnswer

    /** Una respuesta cuenta si no está vacía ni tiene huecos. */
    val isAnswered: Boolean
        get() = when (this) {
            is Index -> true
            is Indices -> values.isNotEmpty()
            is Texts -> values.isNotEmpty() && values.all { it.isNotEmpty() }
        }
}

object QuizAnswerSerializer : KSerializer<QuizAnswer> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("QuizAnswer")
    override fun serialize(encoder: Encoder, value: QuizAnswer) {
        val el: JsonElement = when (value) {
            is QuizAnswer.Index -> JsonPrimitive(value.value)
            is QuizAnswer.Indices -> buildJsonArray { value.values.forEach { add(JsonPrimitive(it)) } }
            is QuizAnswer.Texts -> buildJsonArray { value.values.forEach { add(JsonPrimitive(it)) } }
        }
        (encoder as JsonEncoder).encodeJsonElement(el)
    }
    override fun deserialize(decoder: Decoder): QuizAnswer = throw UnsupportedOperationException()
}

data class QuizQuestion(
    val question: String,
    /** ordenar: opciones en su orden CORRECTO. relacionar: columna izquierda. */
    val options: List<String>,
    val type: QuizQuestionType = QuizQuestionType.MULTIPLE_CHOICE,
    val correctAnswer: Int? = null,
    val correctAnswers: List<Int>? = null,
    /** relacionar: `matchRight[i]` es la pareja correcta de `options[i]`. */
    val matchRight: List<String>? = null,
) {
    /** Califica con los mismos criterios que el servidor. */
    fun grade(answer: QuizAnswer?): Boolean {
        if (answer == null) return false
        return when (type) {
            QuizQuestionType.CHECKBOX -> answer is QuizAnswer.Indices && correctAnswers != null && answer.values.toSet() == correctAnswers.toSet()
            QuizQuestionType.ORDERING -> answer is QuizAnswer.Texts && answer.values == options
            QuizQuestionType.MATCHING -> answer is QuizAnswer.Texts && matchRight != null && answer.values == matchRight
            else -> answer is QuizAnswer.Index && answer.value == correctAnswer
        }
    }

    companion object {
        /** Preguntas de un quiz de lección (`lesson.content` es JSON: array o `{questions}`). */
        fun parseLessonQuiz(content: String?): List<QuizQuestion> {
            val json = parseJson(content) ?: return emptyList()
            return parse(json.listOrQuestions(), correctKey = "correctAnswer")
        }

        /** Preguntas del quiz de sección (`section.quiz`, Json de Prisma). */
        fun parseSectionQuiz(raw: JsonElement?): List<QuizQuestion> =
            parse(raw?.listOrQuestions(), correctKey = "correct").filter { it.options.isNotEmpty() }

        private fun JsonElement.listOrQuestions(): JsonArray? =
            this as? JsonArray ?: (this as? JsonObject)?.get("questions") as? JsonArray

        private fun parse(list: JsonArray?, correctKey: String): List<QuizQuestion> = (list ?: emptyList()).mapNotNull { q ->
            val o = q as? JsonObject ?: return@mapNotNull null
            QuizQuestion(
                question = o.str("question") ?: "",
                options = o.strList("options"),
                type = QuizQuestionType.from(o.str("type")),
                correctAnswer = o.int(correctKey) ?: if (correctKey == "correct") 0 else null,
                correctAnswers = (o["correctAnswers"] as? JsonArray)?.mapNotNull { (it as? JsonPrimitive)?.intOrNull },
                matchRight = (o["matchRight"] as? JsonArray)?.let { a -> a.mapNotNull { (it as? JsonPrimitive)?.content } },
            )
        }
    }
}

fun parseJson(text: String?): JsonElement? = text?.let { runCatching { AppJson.parseToJsonElement(it) }.getOrNull() }
fun JsonObject.str(key: String): String? = (this[key] as? JsonPrimitive)?.takeIf { it.isString || it.content != "null" }?.content
fun JsonObject.int(key: String): Int? = (this[key] as? JsonPrimitive)?.let { it.intOrNull ?: it.content.toDoubleOrNull()?.toInt() }
fun JsonObject.strList(key: String): List<String> = (this[key] as? JsonArray)?.mapNotNull { (it as? JsonPrimitive)?.content } ?: emptyList()

data class QuizConfig(val timeLimitMin: Int = 0, val maxAttempts: Int = 0, val passingScore: Int = 70) {
    companion object {
        fun parse(content: String?): QuizConfig {
            val o = parseJson(content) as? JsonObject ?: return QuizConfig()
            return QuizConfig(o.int("timeLimit") ?: 0, o.int("attempts") ?: 0, o.int("passingScore") ?: 70)
        }
    }
}

// ── Examen final ─────────────────────────────────────────────────────────────

@Serializable
data class ExamQuestion(
    val id: String,
    val question: String,
    val type: String? = null,
    /** ordenar: ya barajadas por el servidor. relacionar: columna izquierda. */
    val options: List<String>? = null,
    /** relacionar: columna derecha barajada. */
    val matchRight: List<String>? = null,
    val points: Double? = null,
) {
    val isGradable get() = !options.isNullOrEmpty()
    val questionType get() = QuizQuestionType.from(type)
}

@Serializable data class Exam(val id: String, val passingScore: Int = 70, val timeLimit: Int? = null, val questions: List<ExamQuestion> = emptyList())
@Serializable data class ExamResult(val score: Double = 0.0, val passed: Boolean = false, val certificate: Cert? = null) {
    @Serializable data class Cert(val id: String, val number: String)
}

// ── Minijuegos ───────────────────────────────────────────────────────────────

sealed interface Minigame {
    val instruction: String?
    data class Pair(val term: String, val definition: String)
    data class Word(val word: String, val hint: String)
    data class MatchPair(val left: String, val right: String)

    data class Memory(override val instruction: String?, val pairs: List<Pair>) : Minigame
    data class Hangman(override val instruction: String?, val words: List<Word>) : Minigame
    data class Sort(override val instruction: String?, val items: List<String>) : Minigame
    data class Match(override val instruction: String?, val pairs: List<MatchPair>) : Minigame

    companion object {
        fun parse(raw: JsonElement?): Minigame? {
            val o = raw as? JsonObject ?: return null
            val instruction = o.str("instruction")
            return when (o.str("type")) {
                "memory" -> (o["pairs"] as? JsonArray)?.mapNotNull { p -> (p as? JsonObject)?.let { po -> po.str("term")?.let { t -> po.str("definition")?.let { d -> Pair(t, d) } } } }
                    ?.takeIf { it.isNotEmpty() }?.let { Memory(instruction, it) }
                "hangman" -> (o["words"] as? JsonArray)?.mapNotNull { w -> (w as? JsonObject)?.let { wo -> wo.str("word")?.let { Word(it, wo.str("hint") ?: "") } } }
                    ?.takeIf { it.isNotEmpty() }?.let { Hangman(instruction, it) }
                "sort" -> o.strList("items").takeIf { it.isNotEmpty() }?.let { Sort(instruction, it) }
                "match" -> (o["pairs"] as? JsonArray)?.mapNotNull { p -> (p as? JsonObject)?.let { po -> po.str("left")?.let { l -> po.str("right")?.let { r -> MatchPair(l, r) } } } }
                    ?.takeIf { it.isNotEmpty() }?.let { Match(instruction, it) }
                else -> null
            }
        }
    }
}
