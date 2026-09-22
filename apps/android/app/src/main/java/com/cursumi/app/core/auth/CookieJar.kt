package com.cursumi.app.core.auth

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.Cookie
import okhttp3.HttpUrl
import java.time.Instant

/**
 * Guarda las cookies de better-auth que el servidor manda en `Set-Cookie` y las
 * devuelve como cabecera `Cookie` para las llamadas autenticadas.
 *
 * Reproduce el contrato de `@better-auth/expo`: el servidor trata a la app igual
 * que a la app Expo (misma cookie de sesión, mismo origen `mobile://`).
 *
 * La persistencia es inyectable para que las pruebas no toquen Android.
 */
class CookieJar(
    private val read: () -> String?,
    private val write: (String) -> Unit,
) {
    @Serializable
    data class Stored(val value: String, val expires: String? = null)

    private val json = Json { ignoreUnknownKeys = true }

    /** Cookies vigentes, por nombre. */
    @Synchronized
    fun cookies(): Map<String, Stored> = load()

    /** Valor de la cabecera `Cookie`, o null si no hay ninguna vigente. */
    fun cookieHeader(): String? {
        val live = cookies().toSortedMap().map { (k, v) -> "$k=${v.value}" }
        return if (live.isEmpty()) null else live.joinToString("; ")
    }

    fun hasSession(): Boolean = cookies().keys.any { it.endsWith("session_token") }

    /** Valor de la cookie `oauth_state` (con o sin prefijo `__Secure-`), si existe. */
    fun oauthState(): String? = cookies().entries.firstOrNull { it.key.endsWith(".oauth_state") }?.value?.value

    /** Procesa los `Set-Cookie` de una respuesta. */
    fun store(setCookieHeaders: List<String>, url: HttpUrl) {
        store(setCookieHeaders.mapNotNull { Cookie.parse(url, it) })
    }

    @Synchronized
    fun store(incoming: List<Cookie>) {
        val current = load().toMutableMap()
        val now = System.currentTimeMillis()
        for (cookie in incoming) {
            // Solo cookies de better-auth; ignoramos cualquier otra.
            if (!cookie.name.contains("better-auth")) continue
            // OkHttp pone expiresAt muy lejano cuando no hay caducidad.
            val persistent = cookie.persistent
            if ((persistent && cookie.expiresAt <= now) || cookie.value.isEmpty()) {
                current.remove(cookie.name)
                continue
            }
            current[cookie.name] = Stored(
                value = cookie.value,
                expires = if (persistent) Instant.ofEpochMilli(cookie.expiresAt).toString() else null,
            )
        }
        save(current)
    }

    @Synchronized
    fun clear() = save(emptyMap())

    private fun load(): Map<String, Stored> {
        val raw = read() ?: return emptyMap()
        val parsed = runCatching { json.decodeFromString<Map<String, Stored>>(raw) }.getOrDefault(emptyMap())
        val now = Instant.now()
        return parsed.filterValues { stored ->
            val exp = stored.expires ?: return@filterValues true
            runCatching { Instant.parse(exp).isAfter(now) }.getOrDefault(true)
        }
    }

    private fun save(cookies: Map<String, Stored>) = write(json.encodeToString(cookies))
}
