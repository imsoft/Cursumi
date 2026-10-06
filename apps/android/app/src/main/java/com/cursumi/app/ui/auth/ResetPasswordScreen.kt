package com.cursumi.app.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.launch

/** Longitud mínima que exige el servidor en `reset-password`. */
const val MIN_PASSWORD_LENGTH = 6

/** Valida nueva contraseña + confirmación; devuelve el mensaje de error o null si todo bien. */
fun validateNewPassword(password: String, confirm: String): String? = when {
    password.length < MIN_PASSWORD_LENGTH -> "La contraseña debe tener al menos $MIN_PASSWORD_LENGTH caracteres."
    password != confirm -> "Las contraseñas no coinciden."
    else -> null
}

/**
 * Nueva contraseña con el token que llegó por `mobile://reset-password?token=…`.
 * Se muestra con o sin sesión; al terminar (o cancelar) [onFinished] limpia el token.
 */
@Composable
fun ResetPasswordScreen(token: String, onFinished: (success: Boolean) -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var password by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }

    Screen("Nueva contraseña", onBack = if (done) null else ({ onFinished(false) })) { padding ->
        Column(Modifier.padding(padding).fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (done) {
                Text("¡Listo!", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("Tu contraseña se actualizó. Inicia sesión con la nueva.", color = Brand.muted)
                PrimaryButton("Ir a iniciar sesión") { onFinished(true) }
            } else {
                Text("Elige tu nueva contraseña", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Mínimo $MIN_PASSWORD_LENGTH caracteres.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                BrandTextField(password, { password = it }, "Nueva contraseña", secure = true, keyboard = KeyboardOptions(keyboardType = KeyboardType.Password))
                BrandTextField(confirm, { confirm = it }, "Confirmar contraseña", secure = true, keyboard = KeyboardOptions(keyboardType = KeyboardType.Password))
                ErrorText(error)
                PrimaryButton("Guardar contraseña", loading = saving, enabled = password.isNotEmpty() && confirm.isNotEmpty()) {
                    error = validateNewPassword(password, confirm)
                    if (error != null) return@PrimaryButton
                    scope.launch {
                        saving = true
                        try { app.auth.resetPassword(token, password); done = true }
                        catch (e: Exception) { error = e.message ?: "No se pudo cambiar la contraseña." }
                        saving = false
                    }
                }
            }
        }
    }
}
