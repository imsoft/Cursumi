package com.cursumi.app.core

import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

object Formatting {
    /**
     * Precio en pesos mexicanos con sufijo explícito, igual que `formatPriceMXN`
     * de `@cursumi/shared`: `$1,234 MXN`; 0 → "Gratis".
     */
    fun priceMXN(price: Double, showDecimals: Boolean = false): String {
        if (price == 0.0) return "Gratis"
        val nf = NumberFormat.getNumberInstance(Locale("es", "MX")).apply {
            minimumFractionDigits = if (showDecimals) 2 else 0
            maximumFractionDigits = if (showDecimals) 2 else 0
        }
        return "$${nf.format(price)} MXN"
    }

    /** Iniciales para el avatar de respaldo ("Ana López" → "AL"). */
    fun initials(name: String): String =
        name.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }.take(2).mapNotNull { it.firstOrNull()?.uppercaseChar() }.joinToString("")

    /** Segundos → "m:ss". */
    fun mmss(total: Int): String = "%d:%02d".format(total / 60, total % 60)

    /** Sin decimales si es entero ("12"), si no con 2 ("12.50"). */
    fun clean(n: Double): String = if (n % 1.0 == 0.0) n.toLong().toString() else "%.2f".format(n)
}

/** Fuente de video reproducible. */
sealed interface VideoSource {
    /** HLS de Mux o mp4/HLS directo, reproducible con ExoPlayer. */
    data class Native(val url: String) : VideoSource
    /** YouTube: se reproduce embebido en un WebView. */
    data class YouTube(val id: String) : VideoSource

    companion object {
        private val mux = Regex("stream\\.mux\\.com/([^/.]+)")
        private val yt = Regex("(?:youtube\\.com/(?:watch\\?v=|embed/)|youtu\\.be/)([A-Za-z0-9_-]{11})")

        /** Misma lógica que `nativeVideoSource` en la app Expo. */
        fun from(raw: String?): VideoSource? {
            if (raw.isNullOrEmpty()) return null
            mux.find(raw)?.let { return Native("https://stream.mux.com/${it.groupValues[1]}.m3u8") }
            yt.find(raw)?.let { return YouTube(it.groupValues[1]) }
            return Native(raw)
        }
    }
}

object LessonContent {
    /** Envuelve el contenido (HTML o texto plano) en una página legible. */
    fun html(content: String): String {
        val body = if (content.contains("<")) content else content
            .replace("&", "&amp;").replace("<", "&lt;").replace("\n", "<br/>")
        return """<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>
  body { font-family: sans-serif; font-size: 17px; line-height: 1.6; color: #111827; padding: 4px 2px; margin: 0; }
  @media (prefers-color-scheme: dark) { body { color: #f3f4f6; } }
  img, video { max-width: 100%; height: auto; }
  a { color: #6d28d9; }
  pre, code { white-space: pre-wrap; word-break: break-word; }
</style></head><body>$body</body></html>"""
    }
}

/** Slug como lo genera la app Expo al crear categorías. */
fun String.slugified(): String {
    val folded = java.text.Normalizer.normalize(this, java.text.Normalizer.Form.NFD)
        .replace(Regex("\\p{M}"), "").lowercase()
    return folded.split(Regex("[^a-z0-9]+")).filter { it.isNotEmpty() }.joinToString("-")
}

/** Quita acentos y pasa a mayúsculas; la Ñ se conserva (el ahorcado la tiene en su teclado). */
fun normalizedLetters(s: String): String = s.map { ch ->
    if (ch == 'ñ' || ch == 'Ñ') "Ñ"
    else java.text.Normalizer.normalize(ch.toString(), java.text.Normalizer.Form.NFD).replace(Regex("\\p{M}"), "").uppercase()
}.joinToString("")
