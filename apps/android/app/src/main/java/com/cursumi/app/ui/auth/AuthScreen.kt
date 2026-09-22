package com.cursumi.app.ui.auth

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.cursumi.app.R
import com.cursumi.app.core.Config
import com.cursumi.app.core.auth.SignInResult
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.launch

/** Pantalla de acceso: Google, correo y contraseña, registro con Turnstile y 2FA. */
@Composable
fun AuthScreen() {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var register by remember { mutableStateOf(false) }
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var acceptTerms by remember { mutableStateOf(false) }
    var captchaToken by remember { mutableStateOf<String?>(null) }
    var captchaFailed by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var googleLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var info by remember { mutableStateOf<String?>(null) }
    var showTwoFactor by remember { mutableStateOf(false) }
    var showForgot by remember { mutableStateOf(false) }

    fun switchMode() { register = !register; error = null; info = null; captchaToken = null; captchaFailed = false }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 28.dp, vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Image(painterResource(R.drawable.logo), contentDescription = null, Modifier.size(84.dp))
        Text("Cursumi", color = Brand.vivid, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
        Text(if (register) "Crea tu cuenta" else "Inicia sesión para continuar", color = Brand.muted, modifier = Modifier.padding(bottom = 12.dp))

        OutlinedButton(
            onClick = {
                scope.launch {
                    error = null; googleLoading = true
                    try {
                        // Abre el navegador; la vuelta (mobile://?cookie=…) la recibe MainActivity.
                        val uri = app.auth.startGoogle()
                        try {
                            CustomTabsIntent.Builder().build().launchUrl(context, uri)
                        } catch (_: android.content.ActivityNotFoundException) {
                            // Sin navegador con Custom Tabs (p. ej. un emulador pelón): el que haya.
                            context.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, uri))
                        }
                    } catch (e: Exception) {
                        error = "No se pudo continuar con Google. Inténtalo de nuevo."
                    } finally { googleLoading = false }
                }
            },
            enabled = !googleLoading, modifier = Modifier.fillMaxWidth().height(50.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                androidx.compose.material3.Icon(painterResource(R.drawable.ic_google), contentDescription = null, modifier = Modifier.size(20.dp), tint = Color.Unspecified)
                Text(if (googleLoading) "Abriendo…" else "Continuar con Google", fontWeight = FontWeight.SemiBold, color = Color(0xFF111827))
            }
        }

        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            HorizontalDivider(Modifier.weight(1f)); Text("o", color = Brand.muted); HorizontalDivider(Modifier.weight(1f))
        }

        if (register) BrandTextField(fullName, { fullName = it }, "Nombre completo", keyboard = KeyboardOptions(capitalization = androidx.compose.ui.text.input.KeyboardCapitalization.Words))
        BrandTextField(email, { email = it }, "Correo electrónico", keyboard = KeyboardOptions(keyboardType = KeyboardType.Email))
        BrandTextField(password, { password = it }, "Contraseña", secure = true, keyboard = KeyboardOptions(keyboardType = KeyboardType.Password))

        if (register) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Checkbox(acceptTerms, { acceptTerms = it })
                Text("Acepto los términos y la política de privacidad", style = MaterialTheme.typography.bodySmall)
            }
            TurnstileView(onToken = { captchaToken = it; captchaFailed = false }, onError = { captchaFailed = true })
        } else {
            TextButton(onClick = { showForgot = true }, modifier = Modifier.align(Alignment.End)) { Text("¿Olvidaste tu contraseña?") }
        }

        error?.let { Text(it, color = Brand.danger, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodyMedium) }
        info?.let { Text(it, color = Brand.success, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodyMedium) }

        PrimaryButton(
            title = if (register) "Crear cuenta" else "Iniciar sesión", loading = loading,
            enabled = email.isNotBlank() && password.isNotBlank() && (!register || (fullName.isNotBlank() && acceptTerms)),
        ) {
            scope.launch {
                error = null; info = null; loading = true
                try {
                    if (register) {
                        val token = captchaToken
                        if (token == null) {
                            error = if (captchaFailed) "No se pudo cargar el desafío de seguridad. Revisa tu conexión." else "Completa el desafío de seguridad antes de continuar."
                        } else {
                            app.auth.signUp(fullName.trim(), email.trim(), password, token)
                            info = "¡Cuenta creada! Te enviamos un correo para verificar tu cuenta. Verifícalo y luego inicia sesión."
                            register = false; password = ""; captchaToken = null
                        }
                    } else {
                        when (app.auth.signIn(email.trim(), password)) {
                            SignInResult.SIGNED_IN -> app.session.refresh()
                            SignInResult.NEEDS_TWO_FACTOR -> showTwoFactor = true
                        }
                    }
                } catch (e: Exception) {
                    error = e.message ?: "No se pudo completar. Revisa tu conexión."
                    captchaToken = null
                } finally { loading = false }
            }
        }

        TextButton(onClick = { switchMode() }) {
            Text(if (register) "¿Ya tienes cuenta? Inicia sesión" else "¿No tienes cuenta? Crea una", fontWeight = FontWeight.SemiBold)
        }
    }

    if (showTwoFactor) TwoFactorDialog(onDismiss = { showTwoFactor = false })
    if (showForgot) ForgotPasswordDialog(onDismiss = { showForgot = false })
}

@Composable
private fun TwoFactorDialog(onDismiss: () -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var code by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Segundo factor") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Escribe el código de 6 dígitos de tu app de autenticación.")
                BrandTextField(code, { code = it }, "Código", keyboard = KeyboardOptions(keyboardType = KeyboardType.NumberPassword))
                error?.let { Text(it, color = Brand.danger) }
            }
        },
        confirmButton = {
            TextButton(enabled = code.length >= 6 && !loading, onClick = {
                scope.launch {
                    loading = true; error = null
                    try { app.auth.verifyTotp(code.trim()); app.session.refresh(); onDismiss() }
                    catch (e: Exception) { error = "Código incorrecto o vencido. Inténtalo de nuevo." }
                    finally { loading = false }
                }
            }) { Text(if (loading) "Verificando…" else "Verificar") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } },
    )
}

@Composable
private fun ForgotPasswordDialog(onDismiss: () -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var token by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    var sent by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Recuperar contraseña") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (sent) Text("Si el correo existe, te enviamos un enlace para restablecer tu contraseña.", color = Brand.success)
                else {
                    Text("Te enviaremos un enlace para crear una contraseña nueva.")
                    BrandTextField(email, { email = it }, "Correo electrónico", keyboard = KeyboardOptions(keyboardType = KeyboardType.Email))
                    TurnstileView(onToken = { token = it }, onError = {})
                    error?.let { Text(it, color = Brand.danger) }
                }
            }
        },
        confirmButton = {
            if (!sent) TextButton(enabled = email.isNotBlank() && token != null && !loading, onClick = {
                scope.launch {
                    loading = true; error = null
                    try { app.auth.forgotPassword(email.trim(), token!!); sent = true }
                    catch (e: Exception) { error = e.message; token = null }
                    finally { loading = false }
                }
            }) { Text("Enviar enlace") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(if (sent) "Cerrar" else "Cancelar") } },
    )
}

/**
 * Widget de Cloudflare Turnstile dentro de un WebView. Entrega el token
 * `cf-turnstile-response` que el servidor exige en el registro.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TurnstileView(onToken: (String) -> Unit, onError: () -> Unit) {
    val html = remember {
        """<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>html, body { margin: 0; padding: 0; background: transparent; }
  .wrap { display: flex; justify-content: center; padding: 4px 0; }</style>
</head><body>
<div class="wrap"><div class="cf-turnstile" data-sitekey="${Config.TURNSTILE_SITE_KEY}"
  data-callback="onSuccess" data-error-callback="onError" data-theme="light"></div></div>
<script>
  function onSuccess(token) { Cursumi.onToken(token); }
  function onError() { Cursumi.onError(); }
</script></body></html>"""
    }
    AndroidView(
        modifier = Modifier.fillMaxWidth().height(78.dp),
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                setBackgroundColor(Color.Transparent.hashCode())
                webViewClient = WebViewClient()
                addJavascriptInterface(object {
                    @JavascriptInterface fun onToken(token: String) = post { onToken(token) }
                    @JavascriptInterface fun onError() = post { onError() }
                }, "Cursumi")
                // baseURL con el dominio real: el site key solo acepta hostnames de Cursumi.
                loadDataWithBaseURL(Config.API_URL, html, "text/html", "utf-8", null)
            }
        },
    )
}
