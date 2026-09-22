package com.cursumi.app.ui.courses

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cursumi.app.core.model.QuizAnswer
import com.cursumi.app.core.model.QuizQuestionType
import com.cursumi.app.core.ui.Brand

/**
 * Entrada de respuesta para los 5 tipos de pregunta. Espejo de
 * `apps/mobile/src/components/quiz-answer-input.tsx`.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun QuizAnswerInput(
    type: QuizQuestionType,
    /** ordenar: elementos (se barajan al mostrar). relacionar: columna izquierda. */
    options: List<String>,
    /** relacionar: columna derecha (pool de parejas a elegir). */
    matchRight: List<String>,
    answer: QuizAnswer?,
    onAnswer: (QuizAnswer) -> Unit,
    disabled: Boolean = false,
) {
    // Orden inicial barajado (ordenar) o pool derecho barajado (relacionar), fijado una vez.
    val shuffled = remember(options, matchRight, type) { (if (type == QuizQuestionType.MATCHING) matchRight else options).shuffled() }
    LaunchedEffect(Unit) {
        // Una pregunta de ordenar siempre tiene respuesta: el orden visible.
        if (type == QuizQuestionType.ORDERING && answer == null) onAnswer(QuizAnswer.Texts(shuffled))
    }
    val border = Modifier.border(1.dp, Color.Gray.copy(alpha = 0.3f), RoundedCornerShape(10.dp))

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        when (type) {
            QuizQuestionType.CHECKBOX -> {
                val selected = (answer as? QuizAnswer.Indices)?.values ?: emptyList()
                Text("Selecciona todas las que apliquen.", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                options.forEachIndexed { i, opt ->
                    val isSel = i in selected
                    Row(
                        Modifier.fillMaxWidth().then(optionBg(isSel)).clickable(enabled = !disabled) { onAnswer(QuizAnswer.Indices(if (isSel) selected - i else selected + i)) }.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) { Checkbox(isSel, null, enabled = !disabled); Text(opt) }
                }
            }
            QuizQuestionType.ORDERING -> {
                val order = (answer as? QuizAnswer.Texts)?.values ?: shuffled
                Text("Ordena los elementos con las flechas.", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                order.forEachIndexed { i, item ->
                    Row(Modifier.fillMaxWidth().then(border).padding(horizontal = 12.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("${i + 1}.", color = Brand.primary, fontWeight = FontWeight.Bold, modifier = Modifier.width(24.dp))
                        Text(item, Modifier.weight(1f))
                        IconButton(enabled = !disabled && i > 0, onClick = { onAnswer(QuizAnswer.Texts(order.swapped(i, i - 1))) }) { Icon(Icons.Filled.KeyboardArrowUp, "Subir", tint = Brand.primary) }
                        IconButton(enabled = !disabled && i < order.size - 1, onClick = { onAnswer(QuizAnswer.Texts(order.swapped(i, i + 1))) }) { Icon(Icons.Filled.KeyboardArrowDown, "Bajar", tint = Brand.primary) }
                    }
                }
            }
            QuizQuestionType.MATCHING -> {
                val picks = (answer as? QuizAnswer.Texts)?.values ?: emptyList()
                Text("Toca la pareja correcta de cada elemento.", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                options.forEachIndexed { li, left ->
                    Column(Modifier.fillMaxWidth().then(border).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(left, fontWeight = FontWeight.SemiBold)
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            shuffled.forEach { right ->
                                val chosen = picks.getOrNull(li) == right
                                FilterChip(selected = chosen, enabled = !disabled, onClick = {
                                    val next = options.indices.map { picks.getOrNull(it) ?: "" }.toMutableList()
                                    next[li] = right
                                    onAnswer(QuizAnswer.Texts(next))
                                }, label = { Text(right) })
                            }
                        }
                    }
                }
            }
            else -> options.forEachIndexed { i, opt ->
                val selected = answer == QuizAnswer.Index(i)
                Row(
                    Modifier.fillMaxWidth().then(optionBg(selected)).clickable(enabled = !disabled) { onAnswer(QuizAnswer.Index(i)) }.padding(horizontal = 14.dp, vertical = 12.dp),
                ) { Text(opt) }
            }
        }
    }
}

private fun optionBg(selected: Boolean): Modifier = Modifier
    .clip(RoundedCornerShape(10.dp))
    .background(if (selected) Brand.primary.copy(alpha = 0.08f) else Color.Transparent)
    .border(BorderStroke(1.dp, if (selected) Brand.primary else Color.Gray.copy(alpha = 0.3f)), RoundedCornerShape(10.dp))

private fun <T> List<T>.swapped(a: Int, b: Int): List<T> = toMutableList().also { val t = it[a]; it[a] = it[b]; it[b] = t }

/** Tarjeta con el resultado de un quiz o examen. */
@Composable
fun ResultCard(score: Int, passed: Boolean, message: String? = null, extra: String? = null) {
    Column(
        Modifier.fillMaxWidth().border(2.dp, if (passed) Brand.success else Brand.danger, RoundedCornerShape(16.dp)).padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text("Tu resultado: $score%", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(message ?: if (passed) "¡Aprobado!" else "No alcanzaste el mínimo.", color = Brand.muted)
        if (extra != null) Text(extra, color = Brand.success, fontWeight = FontWeight.SemiBold)
    }
}

/** Tarjeta de pregunta con su número y, tras enviar, la corrección. */
@Composable
fun QuestionCard(number: Int, text: String, graded: Boolean? = null, content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxWidth().border(1.dp, Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(16.dp)).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("$number. $text", fontWeight = FontWeight.SemiBold)
        content()
        if (graded != null) Text(if (graded) "✓ Correcto" else "✗ Incorrecto", color = if (graded) Brand.success else Brand.danger, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
    }
}

@Composable
fun TimerPill(seconds: Int) {
    val color = if (seconds <= 30) Brand.danger else Color.Gray
    Row(Modifier.border(1.dp, color, CircleShape).padding(horizontal = 16.dp, vertical = 6.dp)) {
        Text("⏱ ${com.cursumi.app.core.Formatting.mmss(seconds)}", fontWeight = FontWeight.Bold, color = if (seconds <= 30) Brand.danger else Color.Unspecified)
    }
}
