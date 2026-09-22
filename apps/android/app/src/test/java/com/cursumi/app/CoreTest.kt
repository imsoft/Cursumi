package com.cursumi.app

import com.cursumi.app.core.Formatting
import com.cursumi.app.core.LessonContent
import com.cursumi.app.core.VideoSource
import com.cursumi.app.core.api.AppJson
import com.cursumi.app.core.auth.CookieJar
import com.cursumi.app.core.model.CourseSummary
import com.cursumi.app.core.model.FlexibleListSerializer
import com.cursumi.app.core.model.Minigame
import com.cursumi.app.core.model.QuizAnswer
import com.cursumi.app.core.model.QuizConfig
import com.cursumi.app.core.model.QuizQuestion
import com.cursumi.app.core.model.QuizQuestionType
import com.cursumi.app.core.model.StudentCourse
import com.cursumi.app.core.normalizedLetters
import com.cursumi.app.core.slugified
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import okhttp3.HttpUrl.Companion.toHttpUrl
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CookieJarTest {
    private var storage: String? = null
    private val jar = CookieJar(read = { storage }, write = { storage = it })
    private val url = "https://cursumi.com/api/auth/sign-in/email".toHttpUrl()

    @Test fun storesBetterAuthSessionCookie() {
        jar.store(listOf("__Secure-better-auth.session_token=abc.def; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"), url)
        assertTrue(jar.hasSession())
        assertEquals("__Secure-better-auth.session_token=abc.def", jar.cookieHeader())
    }

    @Test fun ignoresForeignCookies() {
        jar.store(listOf("_ga=123; Path=/"), url)
        assertNull(jar.cookieHeader())
    }

    @Test fun maxAgeZeroRemovesCookie() {
        jar.store(listOf("better-auth.session_token=abc; Max-Age=3600; Path=/"), url)
        assertTrue(jar.hasSession())
        jar.store(listOf("better-auth.session_token=; Max-Age=0; Path=/"), url)
        assertFalse(jar.hasSession())
    }

    @Test fun expiredCookiesAreDroppedOnRead() {
        storage = """{"better-auth.session_token":{"value":"x","expires":"2000-01-01T00:00:00Z"}}"""
        assertFalse(jar.hasSession())
    }

    @Test fun oauthStateWithAndWithoutSecurePrefix() {
        jar.store(listOf("__Secure-better-auth.oauth_state=s1; Path=/"), url)
        assertEquals("s1", jar.oauthState())
        jar.clear()
        jar.store(listOf("better-auth.oauth_state=s2; Path=/"), url)
        assertEquals("s2", jar.oauthState())
    }
}

class FormattingTest {
    @Test fun priceMXNMatchesShared() {
        assertEquals("Gratis", Formatting.priceMXN(0.0))
        assertEquals("$1,234 MXN", Formatting.priceMXN(1234.0))
        assertEquals("$999.50 MXN", Formatting.priceMXN(999.5, showDecimals = true))
    }

    @Test fun initialsAndTimer() {
        assertEquals("AL", Formatting.initials("Ana López"))
        assertEquals("B", Formatting.initials("brandon"))
        assertEquals("1:05", Formatting.mmss(65))
        assertEquals("12", Formatting.clean(12.0))
        assertEquals("12.50", Formatting.clean(12.5))
    }

    @Test fun videoSources() {
        assertEquals(VideoSource.Native("https://stream.mux.com/abc123.m3u8"), VideoSource.from("https://stream.mux.com/abc123/high.mp4"))
        assertEquals(VideoSource.YouTube("dQw4w9WgXcQ"), VideoSource.from("https://youtu.be/dQw4w9WgXcQ"))
        assertEquals(VideoSource.Native("https://cdn.example.com/v.mp4"), VideoSource.from("https://cdn.example.com/v.mp4"))
        assertNull(VideoSource.from(""))
    }

    @Test fun lessonContentEscapesPlainText() {
        assertTrue(LessonContent.html("a & b\nc").contains("a &amp; b<br/>c"))
        assertTrue(LessonContent.html("<p>hola</p>").contains("<p>hola</p>"))
    }

    @Test fun slugAndNormalization() {
        assertEquals("diseno-grafico", "Diseño Gráfico".slugified())
        assertEquals("CANCION", normalizedLetters("Canción"))
        assertEquals("AÑO", normalizedLetters("año"))
    }
}

class ModelsTest {
    @Test fun studentCourseDecodesCategoryAsStringOrObject() {
        val a = AppJson.decodeFromString<StudentCourse>("""{"id":"c1","title":"Curso","progress":42.5,"instructorName":"Ana","category":"Diseño","status":"in-progress"}""")
        val b = AppJson.decodeFromString<StudentCourse>("""{"id":"c2","title":"Curso","progress":100,"instructorName":"Ana","category":{"name":"Negocios"},"status":"completed","imageUrl":null}""")
        assertEquals("Diseño", a.category?.label)
        assertEquals("Negocios", b.category?.label)
        assertTrue(b.isCompleted)
    }

    @Test fun flexibleListAcceptsArrayOrWrapped() {
        val s = FlexibleListSerializer(CourseSummary.serializer())
        assertEquals(1, AppJson.decodeFromString(s, """[{"id":"1","title":"A","price":0}]""").size)
        assertEquals("b", AppJson.decodeFromString(s, """{"courses":[{"id":"2","title":"B","price":499,"slug":"b"}],"total":1}""").first().slug)
        assertEquals(0, AppJson.decodeFromString(s, """{"total":0}""").size)
    }
}

class QuizTest {
    @Test fun grading() {
        assertTrue(QuizQuestion("q", listOf("a", "b"), correctAnswer = 1).grade(QuizAnswer.Index(1)))
        assertFalse(QuizQuestion("q", listOf("a", "b"), correctAnswer = 1).grade(null))
        assertTrue(QuizQuestion("q", listOf("a", "b", "c"), QuizQuestionType.CHECKBOX, correctAnswers = listOf(0, 2)).grade(QuizAnswer.Indices(listOf(2, 0))))
        assertTrue(QuizQuestion("q", listOf("uno", "dos"), QuizQuestionType.ORDERING).grade(QuizAnswer.Texts(listOf("uno", "dos"))))
        assertFalse(QuizQuestion("q", listOf("uno", "dos"), QuizQuestionType.ORDERING).grade(QuizAnswer.Texts(listOf("dos", "uno"))))
        assertTrue(QuizQuestion("q", listOf("MX"), QuizQuestionType.MATCHING, matchRight = listOf("CDMX")).grade(QuizAnswer.Texts(listOf("CDMX"))))
    }

    @Test fun parsesLessonQuizAndConfig() {
        val content = """{"timeLimit":5,"attempts":2,"passingScore":80,"questions":[
          {"question":"Q1","options":["a","b"],"correctAnswer":0},
          {"question":"Q2","type":"checkbox","options":["a","b"],"correctAnswers":[0,1]}]}"""
        val qs = QuizQuestion.parseLessonQuiz(content)
        assertEquals(2, qs.size)
        assertEquals(0, qs[0].correctAnswer)
        assertEquals(listOf(0, 1), qs[1].correctAnswers)
        assertEquals(QuizConfig(5, 2, 80), QuizConfig.parse(content))
        assertEquals(QuizConfig(), QuizConfig.parse("""[{"question":"Q","options":["a"]}]"""))
        assertEquals(0, QuizQuestion.parseLessonQuiz("no es json").size)
    }

    @Test fun parsesSectionQuizAndMinigames() {
        val raw = AppJson.parseToJsonElement("""{"questions":[{"question":"Q","options":["a","b"],"correct":1},{"question":"vacía","options":[]}]}""")
        val qs = QuizQuestion.parseSectionQuiz(raw)
        assertEquals(1, qs.size)
        assertEquals(1, qs[0].correctAnswer)
        assertEquals(Minigame.Sort("Ordena", listOf("1", "2")), Minigame.parse(AppJson.parseToJsonElement("""{"type":"sort","instruction":"Ordena","items":["1","2"]}""")))
        assertNull(Minigame.parse(AppJson.parseToJsonElement("""{"type":"hangman","words":[]}""")))
    }

    @Test fun answerEncodesLikeTheExpoClient() {
        val payload = mapOf("0" to QuizAnswer.Index(2), "1" to QuizAnswer.Indices(listOf(0, 1)), "2" to QuizAnswer.Texts(listOf("a", "b")))
        val json = AppJson.encodeToString(MapSerializer(String.serializer(), QuizAnswer.serializer()), payload)
        assertEquals("""{"0":2,"1":[0,1],"2":["a","b"]}""", json)
        assertFalse(QuizAnswer.Texts(listOf("a", "")).isAnswered)
    }
}
