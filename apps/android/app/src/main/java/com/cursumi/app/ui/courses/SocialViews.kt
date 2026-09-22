package com.cursumi.app.ui.courses

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.cursumi.app.core.model.ChatMessage
import com.cursumi.app.core.model.Note
import com.cursumi.app.core.model.Reflection
import com.cursumi.app.core.model.Review
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** Mensajes con el instructor del curso (crea la conversación si no existe). */
@Composable
fun ChatScreen(nav: NavController, courseId: String) {
    val app = LocalApp.current
    var conversationId by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(courseId) {
        try { val c = app.social.conversation(courseId); conversationId = c.id; runCatching { app.social.markConversationRead(c.id) } }
        catch (e: Exception) { error = "No se pudo abrir el chat." }
    }
    Screen("Mensajes", onBack = { nav.popBackStack() }) { padding ->
        val id = conversationId
        when {
            error != null -> EmptyState(error!!)
            id == null -> Loading()
            else -> ChatThread(id, Modifier.padding(padding), emptyText = "Escríbele a tu instructor. Te responderá por aquí.")
        }
    }
}

/** Hilo de chat con sondeo cada 5 s. Lo usan alumno e instructor. */
@Composable
fun ChatThread(conversationId: String, modifier: Modifier = Modifier, emptyText: String = "Sin mensajes.") {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val myId = app.session.user?.id
    var messages by remember { mutableStateOf<List<ChatMessage>>(emptyList()) }
    var text by remember { mutableStateOf("") }
    var sending by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()

    LaunchedEffect(conversationId) {
        while (true) {
            runCatching { app.social.messages(conversationId) }.onSuccess { messages = it }
            delay(5000)
        }
    }
    LaunchedEffect(messages.size) { if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1) }

    Column(modifier.fillMaxSize().imePadding()) {
        LazyColumn(Modifier.weight(1f), state = listState, contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (messages.isEmpty()) item { Text(emptyText, color = Brand.muted, modifier = Modifier.fillMaxWidth().padding(vertical = 40.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center) }
            items(messages, key = { it.id }) { m ->
                val mine = m.senderId == myId
                Row(Modifier.fillMaxWidth(), horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start) {
                    Column(
                        Modifier.widthIn(max = 300.dp).clip(RoundedCornerShape(16.dp)).background(if (mine) Brand.primary else Color.Gray.copy(alpha = 0.15f)).padding(horizontal = 14.dp, vertical = 10.dp),
                    ) {
                        if (!mine) Text(m.sender?.name ?: "Instructor", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                        Text(m.body, color = if (mine) Color.White else Color.Unspecified)
                    }
                }
            }
        }
        HorizontalDivider()
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            BrandTextField(text, { text = it }, "Escribe un mensaje…", Modifier.weight(1f), singleLine = false)
            IconButton(enabled = text.isNotBlank() && !sending, onClick = {
                val body = text.trim(); text = ""
                scope.launch {
                    sending = true
                    runCatching { app.social.sendMessage(conversationId, body) }.onSuccess { messages = messages + it }.onFailure { text = body }
                    sending = false
                }
            }) { Icon(Icons.AutoMirrored.Filled.Send, "Enviar", tint = Brand.primary) }
        }
    }
}

/** Notas del alumno para una lección. */
@Composable
fun NotesSection(courseId: String, lessonId: String) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var notes by remember { mutableStateOf<List<Note>>(emptyList()) }
    var text by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    LaunchedEffect(lessonId) { notes = runCatching { app.social.notes(courseId, lessonId) }.getOrDefault(emptyList()) }

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Mis notas", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            BrandTextField(text, { text = it }, "Escribe una nota…", Modifier.weight(1f), singleLine = false)
            IconButton(enabled = text.isNotBlank() && !saving, onClick = {
                scope.launch {
                    saving = true
                    runCatching { app.social.createNote(courseId, lessonId, text.trim()) }.onSuccess { notes = listOf(it) + notes; text = "" }
                    saving = false
                }
            }, modifier = Modifier.size(56.dp)) { Icon(Icons.Filled.Add, "Agregar", tint = Brand.primary) }
        }
        notes.forEach { note ->
            Column(Modifier.fillMaxWidth().border(1.dp, Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(12.dp)).padding(12.dp)) {
                Text(note.content)
                TextButton(onClick = { notes = notes.filter { it.id != note.id }; scope.launch { runCatching { app.social.deleteNote(note.id) } } }) { Text("Eliminar", color = Brand.danger) }
            }
        }
    }
}

/** "¿Qué aprendiste?": reflexiones de los alumnos del curso. */
@Composable
fun ReflectionsSection(courseId: String) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<Reflection>>(emptyList()) }
    var text by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }
    LaunchedEffect(courseId) { items = runCatching { app.social.reflections(courseId) }.getOrDefault(emptyList()) }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("¿Qué aprendiste?", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        AppCard {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                BrandTextField(text, { text = it }, "Comparte lo que te llevas de este curso…", singleLine = false, minLines = 3)
                ErrorText(error)
                if (done) Text("¡Gracias por compartir!", color = Brand.success)
                PrimaryButton("Compartir", loading = saving) {
                    val content = text.trim()
                    if (content.length < 10) { error = "Escribe al menos 10 caracteres."; return@PrimaryButton }
                    scope.launch {
                        saving = true; error = null
                        try { app.social.postReflection(courseId, content); done = true; text = ""; items = runCatching { app.social.reflections(courseId) }.getOrDefault(items) }
                        catch (e: Exception) { error = e.message }
                        saving = false
                    }
                }
            }
        }
        items.forEach { r ->
            Column(Modifier.fillMaxWidth().border(1.dp, Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(12.dp)).padding(12.dp)) {
                Text(r.user?.name ?: "Estudiante", fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                Text(r.content, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
fun Stars(value: Double, size: Int = 16) {
    Row {
        repeat(5) { i -> Icon(Icons.Filled.Star, null, Modifier.size(size.dp), tint = if (i < Math.round(value)) Brand.warning else Color.Gray.copy(alpha = 0.4f)) }
    }
}

/** Reseñas del curso con promedio y formulario. */
@Composable
fun ReviewsSection(courseId: String) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var reviews by remember { mutableStateOf<List<Review>>(emptyList()) }
    var average by remember { mutableStateOf(0.0) }
    var total by remember { mutableIntStateOf(0) }
    var rating by remember { mutableIntStateOf(0) }
    var comment by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }

    suspend fun load() { runCatching { app.social.reviews(courseId) }.onSuccess { reviews = it.reviews; average = it.average ?: 0.0; total = it.total ?: 0 } }
    LaunchedEffect(courseId) { load() }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Reseñas", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.weight(1f))
            if (total > 0) { Stars(average, 14); Text(" %.1f · %d".format(average, total), style = MaterialTheme.typography.labelSmall, color = Brand.muted) }
        }
        AppCard {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Tu reseña", fontWeight = FontWeight.SemiBold)
                Row { (1..5).forEach { n -> IconButton(onClick = { rating = n }) { Icon(Icons.Filled.Star, null, tint = if (n <= rating) Brand.warning else Color.Gray.copy(alpha = 0.4f)) } } }
                BrandTextField(comment, { comment = it }, "Comparte tu opinión (opcional)", singleLine = false, minLines = 2)
                ErrorText(error)
                if (done) Text("¡Gracias por tu reseña!", color = Brand.success)
                PrimaryButton("Enviar reseña", loading = saving) {
                    if (rating < 1) { error = "Selecciona una calificación."; return@PrimaryButton }
                    scope.launch {
                        saving = true; error = null
                        try { app.social.postReview(courseId, rating, comment.trim().ifEmpty { null }); done = true; comment = ""; load() }
                        catch (e: Exception) { error = e.message }
                        saving = false
                    }
                }
            }
        }
        reviews.forEach { r ->
            Column(Modifier.fillMaxWidth().border(1.dp, Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(12.dp)).padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(r.user?.name ?: "Estudiante", Modifier.weight(1f), fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                    Stars(r.rating.toDouble(), 12)
                }
                if (!r.comment.isNullOrEmpty()) Text(r.comment, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}
