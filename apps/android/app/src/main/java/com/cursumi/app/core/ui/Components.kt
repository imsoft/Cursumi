package com.cursumi.app.core.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import coil3.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale

/** Cabecera con gradiente de marca, igual que las pestañas de la app Expo. */
@Composable
fun BrandHeader(title: String, subtitle: String? = null, content: @Composable ColumnScopeWrapper.() -> Unit = {}) {
    Column(
        Modifier.fillMaxWidth()
            .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
            .background(Brand.gradient)
            .padding(start = 20.dp, end = 20.dp, top = 44.dp, bottom = 24.dp),
    ) {
        Text(title, color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
        if (subtitle != null) Text(subtitle, color = Color.White.copy(alpha = 0.85f), style = MaterialTheme.typography.bodyMedium)
        ColumnScopeWrapper.content()
    }
}

object ColumnScopeWrapper

/** Pantalla interior con barra superior y flecha atrás. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Screen(title: String, onBack: (() -> Unit)?, actions: @Composable () -> Unit = {}, content: @Composable (PaddingValues) -> Unit) {
    Scaffold(topBar = {
        TopAppBar(
            title = { Text(title, maxLines = 1) },
            navigationIcon = {
                if (onBack != null) IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás") }
            },
            actions = { actions() },
        )
    }) { padding -> content(padding) }
}

/** Botón primario morado de ancho completo. */
@Composable
fun PrimaryButton(title: String, loading: Boolean = false, enabled: Boolean = true, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled && !loading,
        modifier = modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Brand.primary),
    ) {
        if (loading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
        else Text(title, fontWeight = FontWeight.Bold)
    }
}

/** Botón secundario con borde morado. */
@Composable
fun GhostButton(title: String, modifier: Modifier = Modifier, enabled: Boolean = true, onClick: () -> Unit) {
    OutlinedButton(
        onClick = onClick, enabled = enabled,
        modifier = modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, Brand.primary),
    ) { Text(title, color = Brand.primary, fontWeight = FontWeight.Bold) }
}

@Composable
fun BrandTextField(
    value: String, onChange: (String) -> Unit, placeholder: String,
    modifier: Modifier = Modifier, secure: Boolean = false,
    keyboard: KeyboardOptions = KeyboardOptions.Default, singleLine: Boolean = true, minLines: Int = 1,
) {
    OutlinedTextField(
        value = value, onValueChange = onChange,
        placeholder = { Text(placeholder) },
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        singleLine = singleLine, minLines = minLines,
        keyboardOptions = keyboard,
        visualTransformation = if (secure) PasswordVisualTransformation() else VisualTransformation.None,
    )
}

@Composable
fun AppCard(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable () -> Unit) {
    val colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    val border = BorderStroke(1.dp, Color.Gray.copy(alpha = 0.2f))
    if (onClick != null) Card(onClick = onClick, modifier = modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = colors, border = border) { content() }
    else Card(modifier = modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = colors, border = border) { content() }
}

@Composable
fun RemoteImage(url: String?, height: Int = 140, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxWidth().height(height.dp).background(Color.Gray.copy(alpha = 0.1f))) {
        if (url != null) AsyncImage(model = url, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
    }
}

@Composable
fun EmptyState(title: String, message: String? = null) {
    Column(Modifier.fillMaxWidth().padding(vertical = 60.dp, horizontal = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
        if (message != null) {
            Spacer(Modifier.height(8.dp))
            Text(message, style = MaterialTheme.typography.bodyMedium, color = Brand.muted, textAlign = TextAlign.Center)
        }
    }
}

@Composable
fun Loading() {
    Box(Modifier.fillMaxWidth().padding(top = 40.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Brand.primary) }
}

@Composable
fun ErrorText(text: String?) {
    if (text != null) Text(text, color = Brand.danger, style = MaterialTheme.typography.bodyMedium)
}

@Composable
fun StatCard(value: String, label: String, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Column(Modifier.fillMaxWidth().padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(value, color = Brand.primary, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge, maxLines = 1)
            Text(label, style = MaterialTheme.typography.labelSmall, color = Brand.muted)
        }
    }
}

@Composable
fun StatRow(vararg items: Pair<String, String>) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        items.forEach { (v, l) -> StatCard(v, l, Modifier.weight(1f)) }
    }
}
