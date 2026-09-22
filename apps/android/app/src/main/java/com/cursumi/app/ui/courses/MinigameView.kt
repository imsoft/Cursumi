package com.cursumi.app.ui.courses

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cursumi.app.core.model.Lesson
import com.cursumi.app.core.model.Minigame
import com.cursumi.app.core.normalizedLetters
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.GhostButton
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** Minijuegos de sección: memoria, ahorcado, ordenar y emparejar. */
@Composable
fun MinigameView(lesson: Lesson, onCompleted: (String) -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val game = remember(lesson.id) { Minigame.parse(lesson.sectionMinigame) }
    var won by remember { mutableStateOf(false) }

    fun win() {
        won = true
        scope.launch {
            lesson.sectionId?.let { runCatching { app.student.completeMinigame(it, lesson.courseId) } }
            onCompleted(lesson.id)
        }
    }

    if (game == null) { Text("Este minijuego no está disponible.", fontStyle = FontStyle.Italic, color = Brand.muted); return }
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        game.instruction?.takeIf { it.isNotEmpty() }?.let { Text(it, fontWeight = FontWeight.Medium) }
        if (won) {
            Box(Modifier.fillMaxWidth().border(2.dp, Brand.success, RoundedCornerShape(16.dp)).padding(20.dp), contentAlignment = Alignment.Center) {
                Text("¡Completado! 🎉", style = MaterialTheme.typography.titleMedium)
            }
        } else when (game) {
            is Minigame.Memory -> MemoryGame(game.pairs, ::win)
            is Minigame.Hangman -> HangmanGame(game.words, ::win)
            is Minigame.Sort -> SortGame(game.items, ::win)
            is Minigame.Match -> MatchGame(game.pairs, ::win)
        }
    }
}

private data class MemCard(val id: String, val pair: Int, val label: String)

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun MemoryGame(pairs: List<Minigame.Pair>, onWin: () -> Unit) {
    val scope = rememberCoroutineScope()
    val cards = remember { pairs.flatMapIndexed { i, p -> listOf(MemCard("$i-t", i, p.term), MemCard("$i-d", i, p.definition)) }.shuffled() }
    var flipped by remember { mutableStateOf<List<String>>(emptyList()) }
    var matched by remember { mutableStateOf<Set<String>>(emptySet()) }
    var busy by remember { mutableStateOf(false) }

    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp), maxItemsInEachRow = 2) {
        cards.forEach { card ->
            val isMatched = card.id in matched
            val show = isMatched || card.id in flipped
            Box(
                Modifier.weight(1f).heightIn(min = 80.dp).clip(RoundedCornerShape(12.dp))
                    .background(if (isMatched) Brand.success.copy(alpha = 0.15f) else if (show) Color.Gray.copy(alpha = 0.12f) else Brand.primary)
                    .clickable(enabled = !busy && !show) {
                        val next = flipped + card.id
                        flipped = next
                        if (next.size == 2) {
                            busy = true
                            val a = cards.first { it.id == next[0] }; val b = cards.first { it.id == next[1] }
                            val match = a.pair == b.pair
                            scope.launch {
                                delay(if (match) 350 else 800)
                                if (match) { matched = matched + a.id + b.id; if (matched.size == cards.size) onWin() }
                                flipped = emptyList(); busy = false
                            }
                        }
                    }.padding(10.dp),
                contentAlignment = Alignment.Center,
            ) { Text(if (show) card.label else "?", color = if (show) Color.Unspecified else Color.White, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center, maxLines = 4) }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun HangmanGame(words: List<Minigame.Word>, onWin: () -> Unit) {
    val alphabet = remember { "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".toList() }
    var wordIndex by remember { mutableIntStateOf(0) }
    var guessed by remember { mutableStateOf<Set<Char>>(emptySet()) }
    var wrong by remember { mutableIntStateOf(0) }
    val current = words[wordIndex]
    val target = normalizedLetters(current.word)
    val solved = target.filter { it.isLetter() }.all { it in guessed }
    val dead = wrong >= 6
    val masked = current.word.map { ch -> if (!ch.isLetter()) ch.toString() else { val n = normalizedLetters(ch.toString()).firstOrNull() ?: ch; if (n in guessed) ch.toString() else "_" } }.joinToString(" ")

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Pista: ${current.hint}", fontStyle = FontStyle.Italic, color = Brand.muted)
        Text(masked, fontSize = 26.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 2.sp, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
        Text("Errores: $wrong / 6", color = Brand.muted)
        when {
            solved -> PrimaryButton(if (wordIndex + 1 >= words.size) "Terminar" else "Siguiente palabra") {
                if (wordIndex + 1 >= words.size) onWin() else { wordIndex++; guessed = emptySet(); wrong = 0 }
            }
            dead -> { Text("La palabra era: ${current.word}", color = Brand.danger); GhostButton("Reintentar") { guessed = emptySet(); wrong = 0 } }
            else -> FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                alphabet.forEach { letter ->
                    val used = letter in guessed
                    Box(
                        Modifier.width(34.dp).height(42.dp).clip(RoundedCornerShape(8.dp))
                            .background(if (used) Color.Gray.copy(alpha = 0.2f) else Color.Transparent)
                            .border(1.dp, Color.Gray.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable(enabled = !used) { guessed = guessed + letter; if (letter !in target) wrong++ },
                        contentAlignment = Alignment.Center,
                    ) { Text(letter.toString(), fontWeight = FontWeight.Bold) }
                }
            }
        }
    }
}

@Composable
private fun SortGame(items: List<String>, onWin: () -> Unit) {
    var order by remember { mutableStateOf(items.shuffled().let { if (it == items) items.shuffled() else it }) }
    var wrong by remember { mutableStateOf(false) }
    fun move(i: Int, dir: Int) {
        val j = i + dir
        if (j < 0 || j >= order.size) return
        order = order.toMutableList().also { val t = it[i]; it[i] = it[j]; it[j] = t }; wrong = false
    }
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        order.forEachIndexed { i, item ->
            Row(Modifier.fillMaxWidth().border(1.dp, Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(12.dp)).padding(horizontal = 12.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("${i + 1}", color = Brand.primary, fontWeight = FontWeight.ExtraBold, modifier = Modifier.width(24.dp))
                Text(item, Modifier.weight(1f))
                IconButton(enabled = i > 0, onClick = { move(i, -1) }) { Icon(Icons.Filled.KeyboardArrowUp, "Subir", tint = Brand.primary) }
                IconButton(enabled = i < order.size - 1, onClick = { move(i, 1) }) { Icon(Icons.Filled.KeyboardArrowDown, "Bajar", tint = Brand.primary) }
            }
        }
        if (wrong) Text("Aún no es el orden correcto.", color = Brand.danger, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
        PrimaryButton("Comprobar") { if (order == items) onWin() else wrong = true }
    }
}

@Composable
private fun MatchGame(pairs: List<Minigame.MatchPair>, onWin: () -> Unit) {
    val scope = rememberCoroutineScope()
    val rights = remember { pairs.mapIndexed { i, p -> p.right to i }.shuffled() }
    var selectedLeft by remember { mutableStateOf<Int?>(null) }
    var matched by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var bad by remember { mutableStateOf<Int?>(null) }

    @Composable
    fun item(text: String, selected: Boolean, done: Boolean, isBad: Boolean, onClick: () -> Unit) {
        val stroke = if (done) Brand.success else if (isBad) Brand.danger else if (selected) Brand.primary else Color.Gray.copy(alpha = 0.3f)
        val fill = if (done) Brand.success.copy(alpha = 0.12f) else if (isBad) Brand.danger.copy(alpha = 0.08f) else if (selected) Brand.primary.copy(alpha = 0.08f) else Color.Transparent
        Box(Modifier.fillMaxWidth().heightIn(min = 56.dp).clip(RoundedCornerShape(12.dp)).background(fill).border(1.dp, stroke, RoundedCornerShape(12.dp)).clickable(enabled = !done, onClick = onClick).padding(12.dp), contentAlignment = Alignment.CenterStart) {
            Text(text, maxLines = 3)
        }
    }

    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            pairs.forEachIndexed { i, p -> item(p.left, selectedLeft == i, i in matched, false) { if (i !in matched) selectedLeft = i } }
        }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            rights.forEachIndexed { j, (right, idx) ->
                item(right, false, idx in matched, bad == j) {
                    val left = selectedLeft ?: return@item
                    if (left in matched) return@item
                    if (idx == left) { matched = matched + left; selectedLeft = null; if (matched.size == pairs.size) onWin() }
                    else { bad = j; scope.launch { delay(500); bad = null } }
                }
            }
        }
    }
}
