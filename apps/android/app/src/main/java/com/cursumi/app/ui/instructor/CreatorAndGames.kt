package com.cursumi.app.ui.instructor

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.cursumi.app.core.model.Category
import com.cursumi.app.core.model.GameState
import com.cursumi.app.core.model.HostGame
import com.cursumi.app.core.model.NewCoursePayload
import com.cursumi.app.core.model.NewGameQuestion
import com.cursumi.app.core.model.NewLesson
import com.cursumi.app.core.model.NewSection
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.GhostButton
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import com.cursumi.app.ui.Routes
import com.cursumi.app.ui.profile.PlayerRow
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** Alta de un curso (queda como borrador; se publica desde el panel). */
@Composable
fun CourseCreatorScreen(nav: NavController) {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val levels = listOf("Principiante", "Intermedio", "Avanzado")
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var level by remember { mutableStateOf("Principiante") }
    var modality by remember { mutableStateOf("virtual") }
    var duration by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var imageUrl by remember { mutableStateOf("") }
    val sections = remember { mutableStateListOf<NewSection>() }
    var categories by remember { mutableStateOf<List<Category>>(emptyList()) }
    var saving by remember { mutableStateOf(false) }
    var uploading by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }
    var pendingUpload by remember { mutableStateOf<Pair<Int, Int>?>(null) }

    LaunchedEffect(Unit) { categories = runCatching { app.instructor.categories() }.getOrDefault(emptyList()) }

    fun patchLesson(si: Int, li: Int, f: (NewLesson) -> NewLesson) {
        val s = sections[si]; sections[si] = s.copy(lessons = s.lessons.mapIndexed { j, l -> if (j == li) f(l) else l })
    }

    val videoPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        val (si, li) = pendingUpload ?: return@rememberLauncherForActivityResult
        pendingUpload = null
        if (uri == null) return@rememberLauncherForActivityResult
        val lesson = sections[si].lessons[li]
        scope.launch {
            uploading = lesson.id; error = null
            try {
                val up = app.instructor.requestMuxUpload(lesson.title.ifEmpty { "Lección" })
                app.instructor.uploadVideo(up.uploadUrl, context.contentResolver, uri)
                // Mux procesa el asset; reintentar el playback unas veces.
                var playback: String? = null
                repeat(12) { if (playback == null) { delay(5000); playback = app.instructor.muxPlaybackUrl(up.uploadId) } }
                if (playback != null) patchLesson(si, li) { it.copy(videoUrl = playback) }
                else error = "El video se subió pero Mux aún lo procesa. Pega la URL más tarde desde la web."
            } catch (e: Exception) { error = e.message }
            uploading = null
        }
    }

    Screen("Crear curso", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (done) {
                Text("¡Curso creado! 🎉", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("Se guardó como borrador. Publícalo desde Panel de instructor → Cursos.", color = Brand.muted)
                PrimaryButton("Listo") { nav.popBackStack() }
                return@Column
            }
            BrandTextField(title, { title = it }, "Título")
            BrandTextField(description, { description = it }, "Descripción", singleLine = false, minLines = 3)
            Text("Categoría", style = MaterialTheme.typography.labelLarge)
            ChipRow(categories.map { it.name }, category) { category = it }
            if (categories.isEmpty()) Text("Cargando categorías…", color = Brand.muted, style = MaterialTheme.typography.bodySmall)
            Text("Nivel", style = MaterialTheme.typography.labelLarge)
            ChipRow(levels, level) { level = it }
            Text("Tipo de curso", style = MaterialTheme.typography.labelLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                FilterChip(selected = modality == "virtual", onClick = { modality = "virtual" }, label = { Text("En video") })
                FilterChip(selected = modality == "evento", onClick = { modality = "evento" }, label = { Text("Por evento") })
            }
            if (modality == "evento") Text("Las sesiones (fechas, presencial o videollamada) se configuran desde la web.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
            BrandTextField(duration, { duration = it }, "Duración estimada (ej. 6 horas)")
            BrandTextField(price, { price = it }, "Precio (MXN; 0 = gratis)", keyboard = KeyboardOptions(keyboardType = KeyboardType.Number))
            BrandTextField(imageUrl, { imageUrl = it }, "URL de imagen de portada (opcional)")

            Text("Temario", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            sections.forEachIndexed { si, sec ->
                AppCard { Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    BrandTextField(sec.title, { t -> sections[si] = sec.copy(title = t) }, "Sección ${si + 1}")
                    sec.lessons.forEachIndexed { li, l ->
                        Column(Modifier.padding(start = 8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            BrandTextField(l.title, { t -> patchLesson(si, li) { it.copy(title = t) } }, "Lección ${li + 1}")
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                FilterChip(selected = l.type == "text", onClick = { patchLesson(si, li) { it.copy(type = "text") } }, label = { Text("Texto") })
                                FilterChip(selected = l.type == "video", onClick = { patchLesson(si, li) { it.copy(type = "video") } }, label = { Text("Video") })
                            }
                            if (l.type == "text") BrandTextField(l.content ?: "", { t -> patchLesson(si, li) { it.copy(content = t) } }, "Contenido", singleLine = false, minLines = 2)
                            else {
                                BrandTextField(l.videoUrl ?: "", { t -> patchLesson(si, li) { it.copy(videoUrl = t) } }, "URL de video (Mux/YouTube)")
                                GhostButton(if (uploading == l.id) "Subiendo a Mux…" else if (!l.videoUrl.isNullOrEmpty()) "Video listo ✓ · Reemplazar" else "Subir video del dispositivo", enabled = uploading == null) {
                                    pendingUpload = si to li
                                    videoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly))
                                }
                            }
                        }
                    }
                    TextButton(onClick = { sections[si] = sec.copy(lessons = sec.lessons + NewLesson(order = sec.lessons.size)) }) { Text("+ Agregar lección") }
                } }
            }
            GhostButton("+ Agregar sección") { sections.add(NewSection(order = sections.size)) }
            ErrorText(error)
            PrimaryButton("Crear curso (borrador)", loading = saving) {
                val p = price.toDoubleOrNull()
                if (title.isBlank() || description.isBlank() || category.isEmpty() || duration.isBlank() || p == null) { error = "Completa título, descripción, categoría, duración y precio."; return@PrimaryButton }
                scope.launch {
                    saving = true; error = null
                    try {
                        val clean = sections.filter { it.title.isNotBlank() }.mapIndexed { si, s ->
                            s.copy(title = s.title.trim(), order = si, lessons = s.lessons.filter { it.title.isNotBlank() }.mapIndexed { li, l -> l.copy(title = l.title.trim(), order = li) })
                        }
                        app.instructor.createCourse(NewCoursePayload(
                            title.trim(), description.trim(), category, level, modality, if (modality == "virtual") "ondemand" else "fechado", "",
                            duration.trim(), maxOf(0.0, p), imageUrl.trim().ifEmpty { null }, clean, true,
                        ))
                        done = true
                    } catch (e: Exception) { error = e.message }
                    saving = false
                }
            }
        }
    }
}

@Composable
private fun ChipRow(items: List<String>, selected: String, onSelect: (String) -> Unit) {
    androidx.compose.foundation.layout.FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        items.forEach { FilterChip(selected = selected == it, onClick = { onSelect(it) }, label = { Text(it) }) }
    }
}

/** Juegos en vivo, lado anfitrión: lista. */
@Composable
fun HostGamesScreen(nav: NavController) {
    val app = LocalApp.current
    var games by remember { mutableStateOf<List<HostGame>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(nav.currentBackStackEntry) { games = runCatching { app.instructor.myGames() }.getOrDefault(emptyList()); loading = false }
    Screen("Juegos (anfitrión)", onBack = { nav.popBackStack() }) { padding ->
        LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item { PrimaryButton("+ Crear juego") { nav.navigate("create-game") } }
            if (loading) item { Loading() } else if (games.isEmpty()) item { EmptyState("Aún no has creado juegos.") }
            items(games, key = { it.id }) { g ->
                AppCard(onClick = { nav.navigate(Routes.controlGame(g.id)) }) { Column(Modifier.padding(16.dp)) {
                    Text(g.title, fontWeight = FontWeight.SemiBold)
                    Text("Código ${g.code} · ${g.count?.questions ?: 0} preguntas · ${g.count?.participants ?: 0} jugadores · ${g.status}", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                } }
            }
        }
    }
}

@Composable
fun CreateGameScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var title by remember { mutableStateOf("") }
    val questions = remember { mutableStateListOf(NewGameQuestion()) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    Screen("Crear juego", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            BrandTextField(title, { title = it }, "Título del juego")
            questions.forEachIndexed { qi, q ->
                AppCard { Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Pregunta ${qi + 1}", fontWeight = FontWeight.SemiBold)
                    BrandTextField(q.question, { t -> questions[qi] = q.copy(question = t) }, "Escribe la pregunta")
                    q.options.forEachIndexed { oi, o ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(selected = q.correct == oi, onClick = { questions[qi] = q.copy(correct = oi) })
                            BrandTextField(o, { t -> questions[qi] = q.copy(options = q.options.mapIndexed { j, x -> if (j == oi) t else x }) }, "Opción ${oi + 1}", Modifier.weight(1f))
                        }
                    }
                    Text("Marca la opción correcta.", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                } }
            }
            GhostButton("+ Agregar pregunta") { questions.add(NewGameQuestion()) }
            ErrorText(error)
            PrimaryButton("Crear juego", loading = saving) {
                if (title.isBlank()) { error = "Ponle un título al juego."; return@PrimaryButton }
                val clean = questions.map { it.copy(question = it.question.trim(), options = it.options.map(String::trim)) }.filter { it.question.isNotEmpty() && it.options.all(String::isNotEmpty) }
                if (clean.isEmpty()) { error = "Agrega al menos una pregunta con 4 opciones."; return@PrimaryButton }
                scope.launch {
                    saving = true; error = null
                    try { val id = app.instructor.createGame(title.trim(), clean); nav.navigate(Routes.controlGame(id)) { popUpTo("host-games") } }
                    catch (e: Exception) { error = e.message }
                    saving = false
                }
            }
        }
    }
}

@Composable
fun ControlGameScreen(nav: NavController, gameId: String) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf<GameState?>(null) }
    var busy by remember { mutableStateOf(false) }
    LaunchedEffect(gameId) { while (true) { runCatching { app.instructor.hostGame(gameId) }.onSuccess { state = it }; delay(2000) } }
    fun run(action: suspend () -> Unit) = scope.launch { busy = true; runCatching { action() }; runCatching { app.instructor.hostGame(gameId) }.onSuccess { state = it }; busy = false }

    Screen("Control del juego", onBack = { nav.popBackStack() }) { padding ->
        val s = state
        if (s == null) Loading() else Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            when (s.game.status) {
                "waiting" -> {
                    Text("Sala de espera", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    AppCard { Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Código para unirse", style = MaterialTheme.typography.labelMedium, color = Brand.muted)
                        Text(s.game.code ?: "—", fontSize = 36.sp, fontWeight = FontWeight.ExtraBold, color = Brand.primary)
                    } }
                    Text("Jugadores (${s.participants.size})", fontWeight = FontWeight.SemiBold)
                    s.ranked.forEach { p -> PlayerRow(p.nickname, null) }
                    PrimaryButton("Iniciar juego", loading = busy, enabled = s.participants.isNotEmpty()) { run { app.instructor.startGame(gameId) } }
                }
                "finished" -> {
                    Text("Resultados 🏆", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    s.ranked.forEachIndexed { i, p -> PlayerRow("${listOf("🥇", "🥈", "🥉").getOrNull(i) ?: "${i + 1}."} ${p.nickname}", p.score) }
                    PrimaryButton("Listo") { nav.popBackStack() }
                }
                else -> {
                    val total = s.game.questions?.size ?: 0
                    val idx = s.game.currentQuestion ?: 0
                    Text("Pregunta ${idx + 1} de $total", color = Brand.muted)
                    Text(s.currentQ?.question ?: "", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Marcador", fontWeight = FontWeight.SemiBold)
                    s.ranked.forEachIndexed { i, p -> PlayerRow("${i + 1}. ${p.nickname}", p.score) }
                    PrimaryButton(if (idx >= total - 1) "Terminar juego" else "Siguiente pregunta", loading = busy) {
                        run { if (idx >= total - 1) app.instructor.finishGame(gameId) else app.instructor.nextQuestion(gameId) }
                    }
                }
            }
        }
    }
}
