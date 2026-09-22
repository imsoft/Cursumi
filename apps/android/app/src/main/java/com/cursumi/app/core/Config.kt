package com.cursumi.app.core

import com.cursumi.app.BuildConfig

/** Configuración de la app. Los valores públicos viajan igual en el bundle de la web. */
object Config {
    /** Base de la API (sin barra final). Se cambia con `-Pcursumi.apiUrl=` al compilar. */
    val API_URL: String = BuildConfig.API_URL.trimEnd('/')

    /** Site key de Cloudflare Turnstile (público). */
    const val TURNSTILE_SITE_KEY: String = BuildConfig.TURNSTILE_SITE_KEY

    /**
     * Scheme del deep link al que vuelve el navegador tras entrar con Google.
     * Debe coincidir con el manifest y con `trustedOrigins` en `apps/web/src/lib/auth.ts`.
     */
    const val SCHEME = "mobile"

    /** Origen que la app declara al servidor de auth (el plugin expo lo copia a `Origin`). */
    const val ORIGIN = "$SCHEME://"
}
