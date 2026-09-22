package com.cursumi.app.core.auth

import android.net.Uri
import com.cursumi.app.core.Config
import com.cursumi.app.core.api.ApiClient
import com.cursumi.app.core.api.ApiException
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.HttpUrl.Companion.toHttpUrl

@Serializable
data class SessionUser(
    val id: String,
    val name: String? = null,
    val email: String? = null,
    val image: String? = null,
    val role: String? = null,
)

@Serializable
data class SessionInfo(val user: SessionUser)

enum class SignInResult { SIGNED_IN, NEEDS_TWO_FACTOR }

class AuthError(message: String) : Exception(message)

/** Llamadas a `/api/auth/…` de better-auth. */
class AuthService(val api: ApiClient) {

    suspend fun currentSession(): SessionInfo? {
        val res = api.request("GET", "api/auth/get-session").throwIfError()
        val body = res.body.trim()
        if (body.isEmpty() || body == "null") return null
        return res.decode()
    }

    suspend fun signIn(email: String, password: String): SignInResult {
        val res = api.request("POST", "api/auth/sign-in/email", jsonBody = buildJsonObject {
            put("email", email); put("password", password)
        })
        if (!res.isOk) {
            if (res.status == 401 || res.status == 403) throw AuthError("Correo o contraseña incorrectos, o tu correo no está verificado.")
            throw AuthError(res.errorMessage ?: "No se pudo iniciar sesión.")
        }
        val twoFactor = runCatching {
            ((com.cursumi.app.core.api.AppJson.parseToJsonElement(res.body) as? JsonObject)?.get("twoFactorRedirect") as? JsonPrimitive)?.content == "true"
        }.getOrDefault(false)
        return if (twoFactor) SignInResult.NEEDS_TWO_FACTOR else SignInResult.SIGNED_IN
    }

    suspend fun verifyTotp(code: String) {
        val res = api.request("POST", "api/auth/two-factor/verify-totp", jsonBody = buildJsonObject {
            put("code", code); put("trustDevice", false)
        })
        if (!res.isOk) throw AuthError(res.errorMessage ?: "Código incorrecto.")
    }

    suspend fun signUp(name: String, email: String, password: String, captchaToken: String) {
        val res = api.request("POST", "api/auth/sign-up/email", jsonBody = buildJsonObject {
            put("name", name); put("email", email); put("password", password); put("cf-turnstile-response", captchaToken)
        })
        if (!res.isOk) throw AuthError(res.errorMessage ?: "No fue posible crear la cuenta.")
        // El registro no inicia sesión: el correo debe verificarse primero.
        api.jar.clear()
    }

    suspend fun forgotPassword(email: String, captchaToken: String) {
        val res = api.request("POST", "api/auth/forget-password", jsonBody = buildJsonObject {
            put("email", email); put("redirectTo", "/reset-password"); put("cf-turnstile-response", captchaToken)
        })
        if (!res.isOk) throw AuthError(res.errorMessage ?: "No se pudo enviar el correo.")
    }

    suspend fun changePassword(current: String, new: String) {
        val res = api.request("POST", "api/auth/change-password", jsonBody = buildJsonObject {
            put("currentPassword", current); put("newPassword", new); put("revokeOtherSessions", true)
        })
        if (!res.isOk) throw ApiException(res.status, res.errorMessage)
    }

    suspend fun signOut() {
        runCatching { api.request("POST", "api/auth/sign-out") }
        api.jar.clear()
    }

    // ── Google ──────────────────────────────────────────────────────────────

    /**
     * Paso 1 del login con Google: pide la URL de autorización y devuelve la URL a
     * abrir en Custom Tabs vía `native-authorization-proxy` (fija la cookie `state`
     * en el navegador). El servidor termina en `mobile://?cookie=<Set-Cookie>`,
     * que llega a `MainActivity` y se completa con [completeGoogle].
     */
    suspend fun startGoogle(): Uri {
        val res = api.request("POST", "api/auth/sign-in/social", jsonBody = buildJsonObject {
            put("provider", "google"); put("callbackURL", Config.ORIGIN)
        })
        if (!res.isOk) throw AuthError(res.errorMessage ?: "No se pudo continuar con Google.")
        val authorizationURL = ((com.cursumi.app.core.api.AppJson.parseToJsonElement(res.body) as JsonObject)["url"] as JsonPrimitive).content
        val b = api.url("api/auth/native-authorization-proxy").newBuilder().addQueryParameter("authorizationURL", authorizationURL)
        api.jar.oauthState()?.let { b.addQueryParameter("oauthState", it) }
        return Uri.parse(b.build().toString())
    }

    /** Paso 2: guarda la cookie que viene en el deep link. Devuelve si había cookie. */
    fun completeGoogle(callback: Uri): Boolean {
        val cookie = callback.getQueryParameter("cookie") ?: return false
        api.jar.store(listOf(cookie), api.baseUrl.toHttpUrl())
        return api.jar.hasSession()
    }
}
