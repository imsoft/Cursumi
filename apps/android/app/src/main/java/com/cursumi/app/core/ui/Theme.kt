package com.cursumi.app.core.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/** Paleta de marca. Misma fuente de verdad que `apps/mobile/src/constants/theme.ts`. */
object Brand {
    val primary = Color(0xFF6D28D9)
    val deep = Color(0xFF1F1147)
    val vivid = Color(0xFF4F00F6)
    val accent = Color(0xFFA400E3)
    val success = Color(0xFF16A34A)
    val danger = Color(0xFFDC2626)
    val warning = Color(0xFFF59E0B)
    val muted = Color(0xFF9CA3AF)
    val gradient = Brush.linearGradient(listOf(deep, vivid, accent))
}

private val Light = lightColorScheme(primary = Brand.primary, secondary = Brand.vivid, tertiary = Brand.accent, error = Brand.danger)
private val Dark = darkColorScheme(primary = Color(0xFFB794F6), secondary = Brand.vivid, tertiary = Brand.accent, error = Brand.danger)

@Composable
fun CursumiTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = if (isSystemInDarkTheme()) Dark else Light, content = content)
}
