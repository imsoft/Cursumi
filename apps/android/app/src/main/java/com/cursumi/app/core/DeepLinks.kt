package com.cursumi.app.core

import java.net.URI
import java.net.URLDecoder

/**
 * Lectura de los deep links `mobile://…` con `java.net.URI` (sin `android.net.Uri`,
 * que es un stub en las pruebas unitarias).
 */
object DeepLinks {
    const val RESET_PASSWORD_HOST = "reset-password"

    /** Parámetros de query ya decodificados; vacío si la URL no se puede leer. */
    fun queryParams(raw: String): Map<String, String> {
        val query = runCatching { URI(raw).rawQuery }.getOrNull() ?: return emptyMap()
        return query.split('&').filter { it.isNotEmpty() }.associate { pair ->
            val i = pair.indexOf('=')
            val k = if (i < 0) pair else pair.substring(0, i)
            val v = if (i < 0) "" else pair.substring(i + 1)
            URLDecoder.decode(k, "UTF-8") to URLDecoder.decode(v, "UTF-8")
        }
    }

    /**
     * Token de `mobile://reset-password?token=…`, o null si el enlace es de otra
     * cosa (p. ej. la vuelta de Google `mobile://?cookie=…`) o viene sin token.
     */
    fun resetPasswordToken(raw: String): String? {
        val uri = runCatching { URI(raw) }.getOrNull() ?: return null
        if (uri.scheme != Config.SCHEME) return null
        // `host` o `authority`: según el formato, `mobile://reset-password` cae en uno u otro.
        val host = uri.host ?: uri.authority ?: return null
        if (host != RESET_PASSWORD_HOST) return null
        return queryParams(raw)["token"]?.trim()?.ifEmpty { null }
    }
}

/** Imágenes `data:` (p. ej. la firma guardada en base64). */
object DataUrl {
    private val pattern = Regex("^data:([^;,]+)?(;base64)?,(.*)$", RegexOption.DOT_MATCHES_ALL)

    fun isDataUrl(url: String?) = url != null && url.startsWith("data:")

    /** Bytes decodificados de una data URL base64; null si no lo es o está corrupta. */
    fun decode(url: String): ByteArray? {
        val m = pattern.find(url) ?: return null
        if (m.groupValues[2].isEmpty()) return null
        return runCatching { java.util.Base64.getDecoder().decode(m.groupValues[3].replace(Regex("\\s"), "")) }.getOrNull()
    }
}
