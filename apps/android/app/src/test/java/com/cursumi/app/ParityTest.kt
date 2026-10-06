package com.cursumi.app

import com.cursumi.app.core.DataUrl
import com.cursumi.app.core.DeepLinks
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.api.AppJson
import com.cursumi.app.core.api.AppJsonWithDefaults
import com.cursumi.app.core.model.AuditLog
import com.cursumi.app.core.model.FlexibleListSerializer
import com.cursumi.app.core.model.InstructorCourseStudents
import com.cursumi.app.core.model.PayoutsResponse
import com.cursumi.app.core.model.PlatformFee
import com.cursumi.app.core.model.SignatureReply
import com.cursumi.app.core.model.SocialLink
import com.cursumi.app.ui.auth.validateNewPassword
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

// Modelos y helpers de las secciones que antes solo existían en la web.

class InstructorStudentsModelTest {
    private val fixture = """[
      {"courseId":"c1","courseTitle":"Diseño UX","modality":"virtual","status":"published","students":[
        {"enrollmentId":"e1","studentId":"u1","studentName":"Ana López","studentEmail":"ana@x.com","progress":42.6,"status":"active","enrolledAt":"2026-03-05T12:00:00.000Z"},
        {"enrollmentId":"e2","studentId":"u2","studentName":"Luis","studentEmail":"luis@x.com","progress":100,"status":"completed","enrolledAt":"2026-01-01T12:00:00.000Z"}
      ]},
      {"courseId":"c2","courseTitle":"Sin alumnos","modality":null,"status":"draft","students":[]}
    ]"""

    @Test fun decodesCoursesWithStudents() {
        val list = AppJson.decodeFromString(FlexibleListSerializer(InstructorCourseStudents.serializer()), fixture)
        assertEquals(2, list.size)
        assertEquals("Diseño UX", list[0].courseTitle)
        assertEquals(2, list[0].students.size)
        assertEquals("ana@x.com", list[0].students[0].studentEmail)
        assertEquals(42, list[0].students[0].progressPercent)
        assertEquals(100, list[0].students[1].progressPercent)
        assertNull(list[1].modality)
        assertTrue(list[1].students.isEmpty())
    }

    @Test fun progressIsClampedTo0To100() {
        val s = AppJson.decodeFromString<InstructorCourseStudents>("""{"courseId":"c","students":[{"enrollmentId":"e","progress":140},{"enrollmentId":"f","progress":-3}]}""")
        assertEquals(100, s.students[0].progressPercent)
        assertEquals(0, s.students[1].progressPercent)
    }
}

class PayoutsModelTest {
    private val fixture = """{"groups":[
      {"instructorId":"i1","instructorName":"Carla","instructorEmail":"carla@x.com","stripeAccountId":"acct_123","stripeOnboarded":true,"pendingCents":150000,
       "rows":[{"transactionId":"t1","createdAt":"2026-09-01T10:00:00.000Z","courseTitle":"Curso A","studentName":"Pepe","amountCents":200000,"instructorAmountCents":150000}]},
      {"instructorId":"i2","instructorName":"Dan","instructorEmail":"dan@x.com","stripeAccountId":null,"stripeOnboarded":false,"pendingCents":0,"rows":[]}
    ],"totalPendingCents":150000}"""

    @Test fun decodesGroupsAndTotals() {
        val r = AppJson.decodeFromString<PayoutsResponse>(fixture)
        assertEquals(150000L, r.totalPendingCents)
        assertEquals(2, r.groups.size)
        val g = r.groups[0]
        assertTrue(g.stripeOnboarded)
        assertEquals("acct_123", g.stripeAccountId)
        assertEquals(1, g.rows.size)
        assertEquals(150000L, g.rows[0].instructorAmountCents)
        assertNull(r.groups[1].stripeAccountId)
        assertFalse(r.groups[1].stripeOnboarded)
    }

    @Test fun centsAreFormattedAsMXN() {
        assertEquals("$1,500.00 MXN", Formatting.centsMXN(150000))
        assertEquals("$0.50 MXN", Formatting.centsMXN(50))
        assertEquals("$0 MXN", Formatting.centsMXN(0))
    }
}

class AuditLogModelTest {
    private val fixture = """[
      {"id":"1","actorId":"a1","actorEmail":"admin@x.com","action":"user.role_change","targetType":"user","targetId":"u9","metadata":{"from":"student","to":"instructor"},"ip":"1.2.3.4","createdAt":"2026-09-30T12:00:00.000Z"},
      {"id":"2","actorId":"a1","action":"payout.mark-paid","metadata":null,"createdAt":"2026-09-30T12:00:00.000Z"},
      {"id":"3","actorId":"a1","action":"platform_fee.change","metadata":[1,2,3],"createdAt":"2026-09-30T12:00:00.000Z"},
      {"id":"4","actorId":"a1","action":"review.delete","metadata":"texto","createdAt":"2026-09-30T12:00:00.000Z"},
      {"id":"5","actorId":"a1","action":"algo.nuevo","metadata":42,"createdAt":"2026-09-30T12:00:00.000Z"},
      {"id":"6","actorId":"a1","action":"course.disable","createdAt":"2026-09-30T12:00:00.000Z"}
    ]"""

    @Test fun decodesVariedMetadata() {
        val logs = AppJson.decodeFromString(FlexibleListSerializer(AuditLog.serializer()), fixture)
        assertEquals(6, logs.size)
        assertTrue(logs[0].metadata is JsonObject)
        assertEquals("""{"from":"student","to":"instructor"}""", logs[0].metadataText)
        assertEquals("admin@x.com", logs[0].actorEmail)
        assertEquals("1.2.3.4", logs[0].ip)
        assertNull(logs[1].metadata)
        assertEquals("", logs[1].metadataText)
        assertEquals("[1,2,3]", logs[2].metadataText)
        assertTrue(logs[3].metadata is JsonPrimitive)
        assertEquals("\"texto\"", logs[3].metadataText)
        assertEquals("42", logs[4].metadataText)
        assertNull(logs[5].metadata)
        assertNull(logs[5].actorEmail)
    }

    @Test fun labelsKnownActionsAndFallsBackToKey() {
        assertEquals("Cambio de rol", AuditLog("1", action = "user.role_change").label)
        assertEquals("Instructor aprobado", AuditLog("1", action = "instructor_application.approve").label)
        assertEquals("Instructor rechazado", AuditLog("1", action = "instructor_application.reject").label)
        assertEquals("Curso deshabilitado", AuditLog("1", action = "course.disable").label)
        assertEquals("Curso habilitado", AuditLog("1", action = "course.enable").label)
        assertEquals("Cambio de comisión", AuditLog("1", action = "platform_fee.change").label)
        assertEquals("Reseña eliminada", AuditLog("1", action = "review.delete").label)
        assertEquals("Pago transferido", AuditLog("1", action = "payout.transfer").label)
        assertEquals("Pago registrado a mano", AuditLog("1", action = "payout.mark-paid").label)
        assertEquals("algo.nuevo", AuditLog("1", action = "algo.nuevo").label)
    }
}

class PlatformSettingsModelTest {
    @Test fun platformFeeRoundTrips() {
        assertEquals(12.5, AppJson.decodeFromString<PlatformFee>("""{"platformFeePercent":12.5}""").platformFeePercent, 0.0)
        assertEquals("""{"platformFeePercent":20.0}""", AppJsonWithDefaults.encodeToString(PlatformFee.serializer(), PlatformFee(20.0)))
        // El valor por defecto (0.0) también debe viajar en el PUT.
        assertEquals("""{"platformFeePercent":0.0}""", AppJsonWithDefaults.encodeToString(PlatformFee.serializer(), PlatformFee(0.0)))
    }

    @Test fun socialLinksDecodeAndEncodeWholeArray() {
        val fixture = """[{"key":"instagram","label":"Instagram","url":"https://instagram.com/cursumi","visible":true},{"key":"x","label":"X","url":"","visible":false}]"""
        val links = AppJson.decodeFromString(FlexibleListSerializer(SocialLink.serializer()), fixture)
        assertEquals(2, links.size)
        assertFalse(links[1].visible)
        val edited = links.map { if (it.key == "x") it.copy(url = "https://x.com/cursumi", visible = true) else it }
        val out = AppJsonWithDefaults.encodeToString(ListSerializer(SocialLink.serializer()), edited)
        assertTrue(out.contains(""""key":"x""""))
        assertTrue(out.contains(""""url":"https://x.com/cursumi""""))
        assertTrue(out.contains(""""visible":true"""))
        assertTrue(out.contains(""""key":"instagram","label":"Instagram","url":"https://instagram.com/cursumi","visible":true"""))
    }
}

class SignatureTest {
    @Test fun signatureReplyAcceptsNullOrUrl() {
        assertNull(AppJson.decodeFromString<SignatureReply>("""{"url":null}""").url)
        assertNull(AppJson.decodeFromString<SignatureReply>("""{}""").url)
        assertEquals("https://res.cloudinary.com/x/firma.png", AppJson.decodeFromString<SignatureReply>("""{"url":"https://res.cloudinary.com/x/firma.png"}""").url)
    }

    @Test fun dataUrlDecodesBase64Png() {
        val bytes = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47)
        val url = "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(bytes)
        assertTrue(DataUrl.isDataUrl(url))
        assertFalse(DataUrl.isDataUrl("https://cursumi.com/firma.png"))
        assertFalse(DataUrl.isDataUrl(null))
        assertArrayEquals(bytes, DataUrl.decode(url))
        assertNull(DataUrl.decode("https://cursumi.com/firma.png"))
        assertNull(DataUrl.decode("data:image/png;base64,%%%no-base64%%%"))
        assertNull(DataUrl.decode("data:text/plain,hola"))
    }
}

class ResetPasswordDeepLinkTest {
    @Test fun extractsTokenFromResetLink() {
        assertEquals("abc123", DeepLinks.resetPasswordToken("mobile://reset-password?token=abc123"))
        assertEquals("a b+c", DeepLinks.resetPasswordToken("mobile://reset-password?token=a%20b%2Bc"))
        assertEquals("tok", DeepLinks.resetPasswordToken("mobile://reset-password?x=1&token=tok&y=2"))
        assertEquals("tok", DeepLinks.resetPasswordToken("mobile://reset-password/?token=tok"))
    }

    @Test fun ignoresOtherLinks() {
        assertNull(DeepLinks.resetPasswordToken("mobile://?cookie=better-auth.session_token%3Dabc"))
        assertNull(DeepLinks.resetPasswordToken("https://cursumi.com/reset-password?token=abc"))
        assertNull(DeepLinks.resetPasswordToken("mobile://reset-password"))
        assertNull(DeepLinks.resetPasswordToken("mobile://reset-password?token="))
        assertNull(DeepLinks.resetPasswordToken("mobile://other?token=abc"))
        assertNull(DeepLinks.resetPasswordToken("no es una url ://"))
    }

    @Test fun queryParamsDecode() {
        assertEquals(mapOf("a" to "1", "b" to "", "c" to "x y"), DeepLinks.queryParams("mobile://h?a=1&b&c=x%20y"))
        assertTrue(DeepLinks.queryParams("mobile://h").isEmpty())
    }

    @Test fun validatesNewPassword() {
        assertNull(validateNewPassword("123456", "123456"))
        assertEquals("La contraseña debe tener al menos 6 caracteres.", validateNewPassword("12345", "12345"))
        assertEquals("Las contraseñas no coinciden.", validateNewPassword("123456", "1234567"))
    }
}

class DateFormattingTest {
    @Test fun shortDateHandlesIsoAndGarbage() {
        // Mediodía UTC: cae en el mismo día en cualquier zona horaria de América.
        assertEquals("05/03/2026", Formatting.shortDate("2026-03-05T12:00:00.000Z"))
        assertEquals("2026-03-05", Formatting.shortDate("2026-03-05"))
        assertEquals("", Formatting.shortDate(""))
    }
}
