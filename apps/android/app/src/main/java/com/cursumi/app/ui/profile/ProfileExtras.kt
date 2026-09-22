package com.cursumi.app.ui.profile

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.cursumi.app.core.Config
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.LessonContent
import com.cursumi.app.core.model.BlogPost
import com.cursumi.app.core.model.BlogPostSummary
import com.cursumi.app.core.model.Certificate
import com.cursumi.app.core.model.CourseSummary
import com.cursumi.app.core.model.GameQuestion
import com.cursumi.app.core.model.GameState
import com.cursumi.app.core.model.Note
import com.cursumi.app.core.model.Notification
import com.cursumi.app.core.model.OrgMaterial
import com.cursumi.app.core.model.Referral
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.RemoteImage
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.core.ui.StatRow
import com.cursumi.app.ui.LocalApp
import com.cursumi.app.ui.Routes
import com.cursumi.app.ui.catalog.courseWebUrl
import com.cursumi.app.ui.catalog.openInBrowser
import com.cursumi.app.ui.courses.HtmlView
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun NotificationsScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<Notification>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    suspend fun load() { runCatching { app.student.notifications() }.onSuccess { items = it.notifications } }
    LaunchedEffect(Unit) { load(); loading = false }
    Screen("Notificaciones", onBack = { nav.popBackStack() }, actions = {
        if (items.any { !it.read }) TextButton(onClick = { scope.launch { runCatching { app.student.markAllNotificationsRead() }; load() } }) { Text("Leer todas") }
    }) { padding ->
        if (loading) Loading() else LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (items.isEmpty()) item { EmptyState("Sin notificaciones", "Aquí verás avisos de tus cursos.") }
            items(items, key = { it.id }) { n ->
                Row(Modifier.fillMaxWidth().clickable { if (!n.read) scope.launch { runCatching { app.student.markNotificationRead(n.id) }; load() } }.padding(8.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Box(Modifier.padding(top = 6.dp).size(8.dp).clip(CircleShape).background(if (n.read) Color.Transparent else Brand.primary))
                    Column {
                        Text(n.title, fontWeight = if (n.read) FontWeight.Normal else FontWeight.SemiBold)
                        Text(n.body, style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                        Text(n.createdAt.take(10), style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                    }
                }
            }
        }
    }
}

@Composable
fun CertificatesScreen(nav: NavController) {
    val app = LocalApp.current
    val context = LocalContext.current
    var items by remember { mutableStateOf<List<Certificate>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { items = runCatching { app.student.certificates() }.getOrDefault(emptyList()); loading = false }
    Screen("Certificados", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (items.isEmpty()) item { EmptyState("Aún no tienes certificados", "Completa un curso y aprueba su examen final.") }
            items(items, key = { it.id }) { c ->
                AppCard(onClick = { openInBrowser(context, "${Config.API_URL}/certificates/${c.id}") }) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(c.courseTitle, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                        Text(c.instructorName, style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                        Text("Nº ${c.certificateNumber}", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                    }
                }
            }
        }
    }
}

@Composable
fun WishlistScreen(nav: NavController) {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var courses by remember { mutableStateOf<List<CourseSummary>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        // El endpoint devuelve solo IDs; cruzamos con el catálogo publicado.
        val ids = runCatching { app.student.wishlist() }.getOrDefault(emptyList()).toSet()
        courses = runCatching { app.student.catalog() }.getOrDefault(emptyList()).filter { it.id in ids }
        loading = false
    }
    Screen("Lista de deseos", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (courses.isEmpty()) item { EmptyState("Tu lista está vacía", "Guarda cursos desde Explorar con el corazón.") }
            items(courses, key = { it.id }) { c ->
                AppCard(onClick = { openInBrowser(context, courseWebUrl(c)) }) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(c.title, fontWeight = FontWeight.SemiBold, maxLines = 2)
                            Text(Formatting.priceMXN(c.price), color = Brand.primary, style = MaterialTheme.typography.bodySmall)
                        }
                        TextButton(onClick = { courses = courses.filter { it.id != c.id }; scope.launch { runCatching { app.student.toggleWishlist(c.id) } } }) { Text("Quitar", color = Brand.danger) }
                    }
                }
            }
        }
    }
}

@Composable
fun NotesScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var notes by remember { mutableStateOf<List<Note>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { notes = runCatching { app.social.notes() }.getOrDefault(emptyList()); loading = false }
    Screen("Mis notas", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (notes.isEmpty()) item { EmptyState("Aún no tienes notas", "Agrégalas mientras ves una lección.") }
            items(notes, key = { it.id }) { n ->
                AppCard {
                    Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        val ctx = listOfNotNull(n.course?.title, n.lesson?.title).joinToString(" · ")
                        if (ctx.isNotEmpty()) Text(ctx, style = MaterialTheme.typography.labelSmall, color = Brand.primary, maxLines = 1)
                        Text(n.content)
                        TextButton(onClick = { notes = notes.filter { it.id != n.id }; scope.launch { runCatching { app.social.deleteNote(n.id) } } }) { Text("Eliminar", color = Brand.danger) }
                    }
                }
            }
        }
    }
}

@Composable
fun ReferralScreen(nav: NavController) {
    val app = LocalApp.current
    val context = LocalContext.current
    var data by remember { mutableStateOf<Referral?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { data = runCatching { app.social.referral() }.getOrNull(); loading = false }
    Screen("Referidos", onBack = { nav.popBackStack() }) { padding ->
        val d = data
        when {
            loading -> Loading()
            d == null -> EmptyState("No se pudo cargar tu programa de referidos.")
            else -> Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                AppCard {
                    Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Tu código", style = MaterialTheme.typography.labelMedium, color = Brand.muted)
                        Text(d.referralCode ?: "—", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Brand.primary)
                        Text(d.referralLink, style = MaterialTheme.typography.labelSmall, color = Brand.muted, maxLines = 1)
                        PrimaryButton("Compartir enlace") {
                            val send = Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, "Únete a Cursumi con mi enlace: ${d.referralLink}") }
                            context.startActivity(Intent.createChooser(send, "Compartir"))
                        }
                    }
                }
                StatRow("${d.totalReferrals}" to "Referidos", "${d.earnedReferrals}" to "Con recompensa", Formatting.priceMXN(d.totalEarnedCents / 100.0).removeSuffix(" MXN") to "Ganado")
                Text("Comparte tu enlace. Cuando alguien se registre y compre con él, recibes una recompensa.", style = MaterialTheme.typography.bodySmall, color = Brand.muted, textAlign = TextAlign.Center)
            }
        }
    }
}

@Composable
fun OrgMaterialsScreen(nav: NavController) {
    val app = LocalApp.current
    val context = LocalContext.current
    var items by remember { mutableStateOf<List<OrgMaterial>>(emptyList()) }
    var orgName by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { runCatching { app.social.orgMaterials() }.onSuccess { items = it.materials; orgName = it.orgName }; loading = false }
    Screen(orgName?.let { "Materiales · $it" } ?: "Materiales", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (items.isEmpty()) item { EmptyState("No hay materiales disponibles para tu organización.") }
            items(items, key = { it.id }) { m ->
                AppCard(onClick = { openInBrowser(context, m.fileUrl) }) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(m.fileType.uppercase(), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = Brand.primary, modifier = Modifier.background(Brand.primary.copy(alpha = 0.12f), RoundedCornerShape(6.dp)).padding(6.dp))
                        Column(Modifier.weight(1f)) {
                            Text(m.name, fontWeight = FontWeight.SemiBold, maxLines = 2)
                            if (!m.description.isNullOrEmpty()) Text(m.description, style = MaterialTheme.typography.bodySmall, color = Brand.muted, maxLines = 2)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BlogScreen(nav: NavController) {
    val app = LocalApp.current
    var posts by remember { mutableStateOf<List<BlogPostSummary>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { posts = runCatching { app.social.blogPosts() }.getOrDefault(emptyList()); loading = false }
    Screen("Blog", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (posts.isEmpty()) item { EmptyState("No hay artículos por ahora.") }
            items(posts, key = { it.slug }) { p ->
                AppCard(onClick = { nav.navigate(Routes.blogPost(p.slug)) }) {
                    if (p.coverImageUrl != null) RemoteImage(p.coverImageUrl, 150)
                    Column(Modifier.padding(16.dp)) {
                        Text(p.title, fontWeight = FontWeight.SemiBold, maxLines = 2)
                        if (!p.excerpt.isNullOrEmpty()) Text(p.excerpt, style = MaterialTheme.typography.bodySmall, color = Brand.muted, maxLines = 2)
                    }
                }
            }
        }
    }
}

@Composable
fun BlogReaderScreen(nav: NavController, slug: String) {
    val app = LocalApp.current
    var post by remember { mutableStateOf<BlogPost?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(slug) { post = runCatching { app.social.blogPost(slug) }.getOrNull(); loading = false }
    Screen("Blog", onBack = { nav.popBackStack() }) { padding ->
        val p = post
        when {
            loading -> Loading()
            p == null -> EmptyState("No se pudo cargar el artículo.")
            else -> Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (p.coverImageUrl != null) RemoteImage(p.coverImageUrl, 200, Modifier.clip(RoundedCornerShape(12.dp)))
                Text(p.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                p.author?.name?.let { Text("Por $it", style = MaterialTheme.typography.bodySmall, color = Brand.muted) }
                HtmlView(html = LessonContent.html(p.content), modifier = Modifier.fillMaxWidth().heightIn(min = 400.dp))
            }
        }
    }
}

/** Cambio de contraseña (solo cuentas con contraseña; Google no la tiene). */
@Composable
fun SettingsScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var current by remember { mutableStateOf("") }
    var next by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }
    Screen("Configuración", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Cambiar contraseña", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            BrandTextField(current, { current = it }, "Contraseña actual", secure = true, keyboard = KeyboardOptions(keyboardType = KeyboardType.Password))
            BrandTextField(next, { next = it }, "Nueva contraseña", secure = true, keyboard = KeyboardOptions(keyboardType = KeyboardType.Password))
            BrandTextField(confirm, { confirm = it }, "Confirmar nueva contraseña", secure = true, keyboard = KeyboardOptions(keyboardType = KeyboardType.Password))
            Text("Mínimo 8 caracteres. Si entras con Google, no tienes contraseña que cambiar.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
            ErrorText(error)
            if (done) Text("Contraseña actualizada ✓", color = Brand.success)
            PrimaryButton("Actualizar contraseña", loading = saving, enabled = current.isNotEmpty() && next.isNotEmpty() && confirm.isNotEmpty()) {
                error = null; done = false
                if (next.length < 8) { error = "La nueva contraseña debe tener al menos 8 caracteres."; return@PrimaryButton }
                if (next != confirm) { error = "Las contraseñas no coinciden."; return@PrimaryButton }
                scope.launch {
                    saving = true
                    try { app.auth.changePassword(current, next); done = true; current = ""; next = ""; confirm = "" }
                    catch (e: Exception) { error = "No se pudo cambiar la contraseña. Verifica tu contraseña actual." }
                    saving = false
                }
            }
        }
    }
}

@Composable
fun BecomeInstructorScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var headline by remember { mutableStateOf("") }
    var bio by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }
    Screen("Ser instructor", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (done) {
                Text("¡Solicitud enviada!", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("Nuestro equipo la revisará y te contactará pronto.", color = Brand.muted)
            } else {
                Text("Comparte tu experiencia y cuéntanos por qué quieres enseñar en Cursumi.", color = Brand.muted)
                BrandTextField(headline, { headline = it }, "Titular profesional")
                Text("Ej: Desarrollador web · 8 años de experiencia", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                BrandTextField(bio, { bio = it }, "Tu biografía", singleLine = false, minLines = 3)
                BrandTextField(reason, { reason = it }, "¿Por qué quieres enseñar?", singleLine = false, minLines = 3)
                Text("Al menos 20 caracteres.", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                ErrorText(error)
                PrimaryButton("Enviar solicitud", loading = saving) {
                    val h = headline.trim(); val b = bio.trim(); val r = reason.trim()
                    if (h.isEmpty() || b.length < 10 || r.length < 20) { error = "Completa todos los campos (la motivación necesita al menos 20 caracteres)."; return@PrimaryButton }
                    scope.launch {
                        saving = true; error = null
                        try { app.social.applyInstructor(h, b, r); done = true } catch (e: Exception) { error = e.message }
                        saving = false
                    }
                }
            }
        }
    }
}

/** Juego en vivo, lado jugador. */
@Composable
fun GamesScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val optionColors = listOf(Color(0xFFEF4444), Color(0xFF3B82F6), Color(0xFFF59E0B), Color(0xFF22C55E))
    var code by remember { mutableStateOf("") }
    var nickname by remember { mutableStateOf("") }
    var joining by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var gameId by remember { mutableStateOf<String?>(null) }
    var state by remember { mutableStateOf<GameState?>(null) }
    var answered by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(gameId) {
        val id = gameId ?: return@LaunchedEffect
        while (true) { runCatching { app.social.game(id) }.onSuccess { state = it }; delay(2000) }
    }

    Screen(if (gameId == null) "Unirse a un juego" else state?.myNickname ?: "Juego", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            val id = gameId
            val s = state
            if (id == null) {
                Text("Ingresa el código que te compartió tu instructor.", color = Brand.muted)
                BrandTextField(code, { code = it.uppercase() }, "CÓDIGO", keyboard = KeyboardOptions(capitalization = androidx.compose.ui.text.input.KeyboardCapitalization.Characters))
                BrandTextField(nickname, { nickname = it }, "Tu apodo")
                ErrorText(error)
                PrimaryButton("Entrar", loading = joining, enabled = code.isNotBlank() && nickname.isNotBlank()) {
                    scope.launch {
                        joining = true; error = null
                        try { gameId = app.social.joinGame(code, nickname) } catch (e: Exception) { error = e.message }
                        joining = false
                    }
                }
            } else if (s == null) Loading()
            else when (s.game.status) {
                "waiting" -> {
                    Text("Sala de espera", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text("Esperando a que el anfitrión inicie…", color = Brand.muted)
                    Text("Jugadores (${s.participants.size})", fontWeight = FontWeight.SemiBold)
                    s.ranked.forEach { p -> PlayerRow(p.nickname, null, p.id == s.myParticipantId) }
                }
                "finished" -> {
                    Text("Resultados 🏆", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    s.ranked.forEachIndexed { i, p -> PlayerRow("${listOf("🥇", "🥈", "🥉").getOrNull(i) ?: "${i + 1}."} ${p.nickname}", p.score, p.id == s.myParticipantId) }
                }
                else -> {
                    val q: GameQuestion? = s.currentQ
                    if (q == null) Loading() else {
                        Text("Pregunta ${(s.game.currentQuestion ?: 0) + 1}", style = MaterialTheme.typography.labelMedium, color = Brand.muted)
                        Text(q.question, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        if (s.myAnswer != null || answered == q.id) {
                            AppCard { Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) { Text("¡Respondido!", fontWeight = FontWeight.Bold); Text("Espera la siguiente pregunta…", color = Brand.muted) } }
                        } else q.options.forEachIndexed { i, opt ->
                            Box(
                                Modifier.fillMaxWidth().heightIn(min = 64.dp).clip(RoundedCornerShape(14.dp)).background(optionColors[i % optionColors.size]).clickable {
                                    answered = q.id
                                    scope.launch { runCatching { app.social.answerGame(id, q.id, i) }.onFailure { answered = null }; runCatching { app.social.game(id) }.onSuccess { state = it } }
                                }.padding(12.dp),
                                contentAlignment = Alignment.Center,
                            ) { Text(opt, color = Color.White, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PlayerRow(name: String, score: Int?, me: Boolean = false) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if (me) Brand.primary.copy(alpha = 0.08f) else Color.Transparent).border(1.dp, Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(12.dp)).padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(name, fontWeight = if (me) FontWeight.Bold else FontWeight.Normal)
        Spacer(Modifier.weight(1f))
        if (score != null) Text("$score", fontWeight = FontWeight.Bold, color = Brand.primary)
    }
}
