package com.cursumi.app.ui.web

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import androidx.navigation.NavController
import com.cursumi.app.core.Config
import com.cursumi.app.core.api.AppJson
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.GhostButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import com.cursumi.app.ui.catalog.openInBrowser
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import java.io.File

/**
 * Sección de la web dentro de un WebView con la sesión de la app.
 * La carga inicial va a `/api/mobile/planning-bridge?redirect=<path>` con la cookie
 * de sesión; ese endpoint la re-emite con `Set-Cookie` para que quede en el jar del
 * WebView y redirige a [path]. La web detecta `window.CursumiNative` (la interfaz JS
 * registrada aquí) para ocultar su chrome y, en planeación, entregar el PDF.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebSectionScreen(nav: NavController, path: String, title: String) {
    val app = LocalApp.current
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var fatal by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableStateOf(0) }
    val apiHost = remember { Uri.parse(Config.API_URL).host }

    Screen(title, onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            if (loading) LinearProgressIndicator(Modifier.fillMaxWidth(), color = Brand.primary)
            ErrorText(error)
            val dead = fatal
            if (dead != null) {
                Column(Modifier.padding(16.dp)) {
                    EmptyState("No se pudo cargar esta sección", dead)
                    GhostButton("Reintentar") { fatal = null; loading = true; reloadKey++ }
                }
            } else AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    WebView(ctx).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) { loading = true }
                            override fun onPageFinished(view: WebView?, url: String?) { loading = false }

                            /** Enlaces fuera de Cursumi se abren en el navegador. */
                            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                                val url = request?.url ?: return false
                                val scheme = url.scheme ?: return false
                                if ((scheme == "https" || scheme == "http") && url.host == apiHost) return false
                                runCatching { openInBrowser(ctx, url.toString()) }
                                return true
                            }

                            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, err: WebResourceError?) {
                                if (request?.isForMainFrame == true) { loading = false; fatal = "Revisa tu conexión e inténtalo de nuevo." }
                            }

                            override fun onReceivedHttpError(view: WebView?, request: WebResourceRequest?, response: WebResourceResponse?) {
                                if (request?.isForMainFrame != true) return
                                val code = response?.statusCode ?: return
                                if (code == 401 || code == 403) { loading = false; fatal = "Tu sesión no tiene acceso a esta sección." }
                                else if (code >= 500) { loading = false; fatal = "El servidor respondió con un error ($code)." }
                            }
                        }
                        addJavascriptInterface(NativeBridge(this) { msg -> post { error = msg } }, "CursumiNative")
                        val url = "${Config.API_URL}/api/mobile/planning-bridge?redirect=" + Uri.encode(path)
                        val headers = app.api.jar.cookieHeader()?.let { mapOf("Cookie" to it) } ?: emptyMap()
                        loadUrl(url, headers)
                    }
                },
                update = { view -> if (reloadKey > 0 && view.tag != reloadKey) { view.tag = reloadKey; view.reload() } },
            )
        }
    }
}

/**
 * `window.CursumiNative.postMessage(json)` desde la web. Hoy solo entiende
 * `{ type: "planning-pdf", base64, filename }`: guarda el PDF en caché y abre el
 * selector de compartir. Mensajes de otro tipo se ignoran.
 */
private class NativeBridge(private val view: WebView, private val onError: (String) -> Unit) {
    @JavascriptInterface
    fun postMessage(raw: String) {
        val ctx = view.context
        runCatching {
            val obj = AppJson.parseToJsonElement(raw) as JsonObject
            if ((obj["type"] as? JsonPrimitive)?.content != "planning-pdf") return
            val base64 = (obj["base64"] as? JsonPrimitive)?.content ?: return
            val name = ((obj["filename"] as? JsonPrimitive)?.content ?: "documento.pdf").replace(Regex("[\\\\/:*?\"<>|]"), "").ifEmpty { "documento.pdf" }
            val dir = File(ctx.cacheDir, "pdf").apply { mkdirs() }
            val file = File(dir, name).apply { writeBytes(java.util.Base64.getDecoder().decode(base64)) }
            val uri = FileProvider.getUriForFile(ctx, "${ctx.packageName}.files", file)
            val send = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"; putExtra(Intent.EXTRA_STREAM, uri); addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            view.post { ctx.startActivity(Intent.createChooser(send, name)) }
        }.onFailure { onError("No se pudo guardar el PDF. Inténtalo de nuevo.") }
    }
}
