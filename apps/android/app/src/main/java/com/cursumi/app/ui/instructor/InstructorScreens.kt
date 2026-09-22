package com.cursumi.app.ui.instructor

import android.annotation.SuppressLint
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import androidx.navigation.NavController
import com.cursumi.app.core.Config
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.model.InstructorAnalytics
import com.cursumi.app.core.model.InstructorConversation
import com.cursumi.app.core.model.InstructorCourse
import com.cursumi.app.core.model.InstructorEarnings
import com.cursumi.app.core.model.InstructorProfileUpdate
import com.cursumi.app.core.model.QuoteRequestPayload
import com.cursumi.app.core.model.StripeStatus
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.GhostButton
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.core.ui.StatCard
import com.cursumi.app.core.ui.StatRow
import com.cursumi.app.ui.LocalApp
import com.cursumi.app.ui.Routes
import com.cursumi.app.ui.catalog.openInBrowser
import com.cursumi.app.ui.courses.ChatThread
import kotlinx.coroutines.launch
import java.io.File

/** Panel del instructor: ingresos, datos, cursos y chats. */
@Composable
fun InstructorScreen(nav: NavController) {
    var tab by remember { mutableIntStateOf(0) }
    val titles = listOf("Ingresos", "Datos", "Cursos", "Chats")
    Screen("Instructor", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding)) {
            TabRow(selectedTabIndex = tab) { titles.forEachIndexed { i, t -> Tab(selected = tab == i, onClick = { tab = i }, text = { Text(t) }) } }
            when (tab) {
                0 -> EarningsTab()
                1 -> AnalyticsTab()
                2 -> CoursesTab(nav)
                else -> MessagesTab(nav)
            }
        }
    }
}

@Composable
private fun EarningsTab() {
    val app = LocalApp.current
    var data by remember { mutableStateOf<InstructorEarnings?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { data = runCatching { app.instructor.earnings() }.getOrNull(); loading = false }
    val d = data
    when {
        loading -> Loading()
        d == null -> EmptyState("No se pudieron cargar tus ingresos.")
        else -> Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            AppCard { Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Total generado", style = MaterialTheme.typography.labelMedium, color = Brand.muted)
                Text(Formatting.priceMXN(d.total), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold, color = Brand.primary)
            } }
            StatRow(Formatting.priceMXN(d.thisMonth ?: 0.0) to "Este mes", "${d.courses ?: 0}" to "Cursos")
            Text("Solo cuenta dinero realmente cobrado; las inscripciones gratuitas o con cupón no suman.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
        }
    }
}

@Composable
private fun AnalyticsTab() {
    val app = LocalApp.current
    var data by remember { mutableStateOf<InstructorAnalytics?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { data = runCatching { app.instructor.analytics() }.getOrNull(); loading = false }
    val d = data
    when {
        loading -> Loading()
        d == null -> EmptyState("No se pudieron cargar las analíticas.")
        else -> Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            StatRow("${d.totalStudents}" to "Estudiantes", "${d.totalCourses}" to "Cursos")
            StatRow("${d.publishedCourses}" to "Publicados", "${Math.round(d.avgProgress)}%" to "Avance prom.")
        }
    }
}

@Composable
private fun CoursesTab(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var courses by remember { mutableStateOf<List<InstructorCourse>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var busy by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    suspend fun load() { runCatching { app.instructor.courses() }.onSuccess { courses = it }.onFailure { error = "No se pudieron cargar tus cursos." } }
    LaunchedEffect(Unit) { load(); loading = false }
    fun change(c: InstructorCourse, status: String) = scope.launch {
        busy = c.id; error = null
        try { app.instructor.setCourseStatus(c.id, status); load() } catch (e: Exception) { error = e.message }
        busy = null
    }
    if (loading) Loading() else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ErrorText(error) }
        if (courses.isEmpty()) item { EmptyState("Aún no tienes cursos", "Créalos desde Perfil → Crear curso.") }
        items(courses, key = { it.id }) { c ->
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.Top) {
                    Text(c.title, Modifier.weight(1f), fontWeight = FontWeight.SemiBold, maxLines = 2)
                    AssistChip(onClick = {}, label = { Text(c.statusLabel, style = MaterialTheme.typography.labelSmall) })
                }
                Text("${c.studentsCount ?: 0} estudiantes" + (c.price?.let { " · ${Formatting.priceMXN(it)}" } ?: ""), style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (busy == c.id) Text("…") else if (c.status == "published") {
                        TextButton(onClick = { change(c, "draft") }) { Text("Despublicar") }
                        TextButton(onClick = { change(c, "archived") }) { Text("Archivar") }
                    } else TextButton(onClick = { change(c, "published") }) { Text("Publicar", fontWeight = FontWeight.Bold) }
                }
                TextButton(onClick = { nav.navigate(Routes.planning(c.id)) }) { Text("Planeación didáctica") }
            } }
        }
    }
}

@Composable
private fun MessagesTab(nav: NavController) {
    val app = LocalApp.current
    var items by remember { mutableStateOf<List<InstructorConversation>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { items = runCatching { app.instructor.conversations() }.getOrDefault(emptyList()); loading = false }
    if (loading) Loading() else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (items.isEmpty()) item { EmptyState("No tienes conversaciones.") }
        items(items, key = { it.id }) { c ->
            AppCard(onClick = { nav.navigate(Routes.thread(c.id, c.student?.name ?: "Estudiante")) }) { Column(Modifier.padding(16.dp)) {
                Text(c.student?.name ?: "Estudiante", fontWeight = FontWeight.SemiBold)
                Text(c.course?.title ?: "", style = MaterialTheme.typography.bodySmall, color = Brand.primary, maxLines = 1)
                c.messages?.lastOrNull()?.let { Text(it.body, style = MaterialTheme.typography.bodySmall, color = Brand.muted, maxLines = 1) }
            } }
        }
    }
}

@Composable
fun ThreadScreen(nav: NavController, conversationId: String, title: String) {
    val app = LocalApp.current
    LaunchedEffect(conversationId) { runCatching { app.social.markConversationRead(conversationId) } }
    Screen(title, onBack = { nav.popBackStack() }) { padding -> ChatThread(conversationId, Modifier.padding(padding)) }
}

/** Perfil de instructor + Stripe Connect. */
@Composable
fun InstructorAccountScreen(nav: NavController) {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var loading by remember { mutableStateOf(true) }
    var headline by remember { mutableStateOf("") }
    var bio by remember { mutableStateOf("") }
    var specialties by remember { mutableStateOf("") }
    var years by remember { mutableStateOf("") }
    var stripe by remember { mutableStateOf<StripeStatus?>(null) }
    var saving by remember { mutableStateOf(false) }
    var stripeBusy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        runCatching { app.instructor.profile() }.onSuccess { headline = it.headline; bio = it.bio; specialties = it.specialties; years = it.teachingYears?.toString() ?: "" }
            .onFailure { error = "No se pudo cargar tu perfil." }
        stripe = runCatching { app.instructor.stripeStatus() }.getOrNull()
        loading = false
    }

    Screen("Perfil de instructor", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Cobros (Stripe)", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text(when {
                    stripe?.onboarded == true -> "Tu cuenta de cobros está conectada y activa."
                    stripe?.connected == true -> "Conexión iniciada. Completa el onboarding para recibir pagos."
                    else -> "Conecta Stripe para recibir tus pagos."
                }, color = Brand.muted)
                PrimaryButton(if (stripe?.onboarded == true) "Abrir panel de Stripe" else "Conectar Stripe", loading = stripeBusy) {
                    scope.launch {
                        stripeBusy = true
                        try { openInBrowser(context, app.instructor.startStripeConnect()) } catch (e: Exception) { error = e.message }
                        stripeBusy = false
                    }
                }
            } }
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Tu información", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                BrandTextField(headline, { headline = it }, "Titular profesional")
                BrandTextField(bio, { bio = it }, "Biografía", singleLine = false, minLines = 3)
                BrandTextField(specialties, { specialties = it }, "Especialidades")
                BrandTextField(years, { years = it }, "Años enseñando", keyboard = KeyboardOptions(keyboardType = KeyboardType.Number))
                ErrorText(error)
                if (done) Text("Guardado ✓", color = Brand.success)
                PrimaryButton("Guardar", loading = saving) {
                    scope.launch {
                        saving = true; error = null; done = false
                        try { app.instructor.updateProfile(InstructorProfileUpdate(headline.trim(), bio.trim(), specialties.trim(), years.toIntOrNull())); done = true }
                        catch (e: Exception) { error = e.message }
                        saving = false
                    }
                }
            } }
            Text("Nombre, correo y foto se editan en tu perfil general.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
        }
    }
}

/**
 * Planeación didáctica: reutiliza los editores de la web dentro de un WebView.
 * La carga inicial va a `/api/mobile/planning-bridge` con la cookie de sesión; ese
 * endpoint la re-emite con `Set-Cookie` para que quede en el jar del WebView.
 * La web detecta `window.ReactNativeWebView` (así se llama la interfaz JS aquí,
 * igual que en React Native) para ocultar su chrome y entregar el PDF.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PlanningScreen(nav: NavController, courseId: String) {
    val app = LocalApp.current
    val context = LocalContext.current
    var error by remember { mutableStateOf<String?>(null) }
    Screen("Planeación didáctica", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            ErrorText(error)
            AndroidView(modifier = Modifier.fillMaxSize(), factory = { ctx ->
                WebView(ctx).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    webViewClient = WebViewClient()
                    addJavascriptInterface(object {
                        @JavascriptInterface
                        fun postMessage(raw: String) {
                            runCatching {
                                val obj = com.cursumi.app.core.api.AppJson.parseToJsonElement(raw) as kotlinx.serialization.json.JsonObject
                                if ((obj["type"] as? kotlinx.serialization.json.JsonPrimitive)?.content != "planning-pdf") return
                                val base64 = (obj["base64"] as? kotlinx.serialization.json.JsonPrimitive)?.content ?: return
                                val name = ((obj["filename"] as? kotlinx.serialization.json.JsonPrimitive)?.content ?: "documento.pdf").replace(Regex("[\\\\/:*?\"<>|]"), "").ifEmpty { "documento.pdf" }
                                val dir = File(ctx.cacheDir, "pdf").apply { mkdirs() }
                                val file = File(dir, name).apply { writeBytes(Base64.decode(base64, Base64.DEFAULT)) }
                                val uri = FileProvider.getUriForFile(ctx, "${ctx.packageName}.files", file)
                                val send = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                                    type = "application/pdf"; putExtra(android.content.Intent.EXTRA_STREAM, uri); addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
                                }
                                post { ctx.startActivity(android.content.Intent.createChooser(send, name)) }
                            }.onFailure { post { error = "No se pudo guardar el PDF. Inténtalo de nuevo." } }
                        }
                    }, "ReactNativeWebView")
                    val url = "${Config.API_URL}/api/mobile/planning-bridge?redirect=" + android.net.Uri.encode("/instructor/courses/$courseId/planning")
                    val headers = app.api.jar.cookieHeader()?.let { mapOf("Cookie" to it) } ?: emptyMap()
                    loadUrl(url, headers)
                }
            })
        }
    }
    @Suppress("UNUSED_VARIABLE") val unused = context
}

/** Plantillas oficiales (mismas que `public/templates/` en la web). */
@Composable
fun TemplatesScreen(nav: NavController) {
    val context = LocalContext.current
    val templates = listOf(
        Triple("Presentación Cursumi", "Plantilla de PowerPoint para presentar tus cursos o la plataforma.", "cursumi_presentation.pptx"),
        Triple("Membrete Cursumi", "Plantilla PDF con membrete oficial para documentos o comunicados.", "cursumi_letterhead.pdf"),
    )
    Screen("Plantillas", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            templates.forEach { (name, desc, file) ->
                AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(name, fontWeight = FontWeight.SemiBold)
                    Text(desc, style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                    GhostButton("Abrir / descargar") { openInBrowser(context, "${Config.API_URL}/templates/$file") }
                } }
            }
        }
    }
}

/** Formulario público de Cursumi Business. */
@Composable
fun BusinessScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val sizes = listOf("1-10", "11-50", "51-200", "201-500", "500+")
    var companyName by remember { mutableStateOf("") }
    var contactName by remember { mutableStateOf("") }
    var contactEmail by remember { mutableStateOf("") }
    var contactPhone by remember { mutableStateOf("") }
    var companySize by remember { mutableStateOf("") }
    var interests by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }
    Screen("Cursumi Business", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Capacitación para tu equipo, con precio a la medida.", color = Brand.muted)
            listOf("Capacita a todo tu equipo con el catálogo de Cursumi", "Métricas de avance y certificados por empleado", "Equipos, asignación de cursos y materiales internos", "Precio a la medida según tu empresa").forEach { Text("✓ $it") }
            if (done) {
                Text("¡Solicitud enviada!", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("Nuestro equipo te contactará pronto con una cotización a la medida.", color = Brand.muted)
            } else {
                BrandTextField(companyName, { companyName = it }, "Nombre de la empresa")
                BrandTextField(contactName, { contactName = it }, "Tu nombre")
                BrandTextField(contactEmail, { contactEmail = it }, "Correo", keyboard = KeyboardOptions(keyboardType = KeyboardType.Email))
                BrandTextField(contactPhone, { contactPhone = it }, "Teléfono (opcional)", keyboard = KeyboardOptions(keyboardType = KeyboardType.Phone))
                Text("Tamaño de la empresa", style = MaterialTheme.typography.labelMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) { sizes.forEach { s -> FilterChip(selected = companySize == s, onClick = { companySize = s }, label = { Text(s) }) } }
                BrandTextField(interests, { interests = it }, "¿Qué te interesa capacitar?")
                BrandTextField(message, { message = it }, "Mensaje (opcional)", singleLine = false, minLines = 3)
                ErrorText(error)
                PrimaryButton("Solicitar cotización", loading = saving) {
                    if (companyName.isBlank() || contactName.isBlank() || contactEmail.isBlank()) { error = "Empresa, nombre y correo son obligatorios."; return@PrimaryButton }
                    scope.launch {
                        saving = true; error = null
                        try {
                            app.instructor.submitQuoteRequest(QuoteRequestPayload(companyName.trim(), contactName.trim(), contactEmail.trim(), contactPhone.trim().ifEmpty { null }, companySize.ifEmpty { null }, interests.trim().ifEmpty { null }, message.trim().ifEmpty { null }))
                            done = true
                        } catch (e: Exception) { error = e.message }
                        saving = false
                    }
                }
            }
        }
    }
}

/** Pizarrón: trazos libres con Canvas, colores, borrador, deshacer y limpiar. */
@Composable
fun WhiteboardScreen(nav: NavController) {
    data class Stroke(val points: MutableList<Offset>, val color: Color, val width: Float)
    val colors = listOf(Color(0xFF111827), Color(0xFFDC2626), Color(0xFF2563EB), Color(0xFF16A34A), Color(0xFFF59E0B), Brand.primary)
    val strokes = remember { mutableStateListOf<Stroke>() }
    var current by remember { mutableStateOf<Stroke?>(null) }
    var color by remember { mutableStateOf(colors[0]) }
    var eraser by remember { mutableStateOf(false) }
    var version by remember { mutableIntStateOf(0) }

    Screen("Pizarrón", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            Canvas(
                Modifier.weight(1f).fillMaxWidth().background(Color.White).pointerInput(color, eraser) {
                    detectDragGestures(
                        onDragStart = { current = Stroke(mutableListOf(it), if (eraser) Color.White else color, if (eraser) 24f else 4f) },
                        onDrag = { change, _ -> current?.points?.add(change.position); version++ },
                        onDragEnd = { current?.let { if (it.points.size > 1) strokes.add(it) }; current = null },
                    )
                },
            ) {
                @Suppress("UNUSED_EXPRESSION") version
                (strokes + listOfNotNull(current)).forEach { s ->
                    val path = Path().apply { s.points.firstOrNull()?.let { moveTo(it.x, it.y) }; s.points.drop(1).forEach { lineTo(it.x, it.y) } }
                    drawPath(path, s.color, style = Stroke(width = s.width, cap = StrokeCap.Round, join = StrokeJoin.Round))
                }
            }
            HorizontalDivider()
            Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                colors.forEach { c ->
                    Box(Modifier.size(26.dp).clip(CircleShape).background(c).border(if (!eraser && color == c) 2.dp else 0.dp, Color.Black, CircleShape).clickable { color = c; eraser = false })
                }
                TextButton(onClick = { eraser = !eraser }) { Text("Borrador", color = if (eraser) Brand.primary else Brand.muted) }
                Spacer(Modifier.weight(1f))
                TextButton(enabled = strokes.isNotEmpty(), onClick = { strokes.removeAt(strokes.lastIndex) }) { Text("Deshacer") }
                TextButton(enabled = strokes.isNotEmpty(), onClick = { strokes.clear() }) { Text("Limpiar") }
            }
        }
    }
}
