package com.cursumi.app.ui.admin

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.model.AdminAnalytics
import com.cursumi.app.core.model.AdminApplication
import com.cursumi.app.core.model.AdminCategory
import com.cursumi.app.core.model.AdminCoupon
import com.cursumi.app.core.model.AdminFinances
import com.cursumi.app.core.model.AdminKpi
import com.cursumi.app.core.model.AdminReview
import com.cursumi.app.core.model.AdminStats
import com.cursumi.app.core.model.AdminUser
import com.cursumi.app.core.model.QuoteRequest
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.core.ui.StatRow
import com.cursumi.app.ui.LocalApp
import com.cursumi.app.ui.Routes
import com.cursumi.app.ui.courses.Stars
import com.cursumi.app.ui.profile.MenuCard
import kotlinx.coroutines.launch

private val sections = listOf(
    "stats" to "Resumen", "applications" to "Solicitudes de instructor", "users" to "Usuarios", "reviews" to "Moderar reseñas",
    "finances" to "Finanzas", "analytics" to "Analíticas", "coupons" to "Cupones", "categories" to "Categorías", "kpis" to "KPIs", "business" to "Empresas",
)

@Composable
fun AdminHome(nav: NavController) {
    Screen("Administración", onBack = { nav.popBackStack() }) { padding ->
        Column(Modifier.padding(padding).padding(16.dp)) {
            MenuCard(null, sections.map { (id, label) -> label to { nav.navigate(Routes.admin(id)) } })
        }
    }
}

@Composable
fun AdminSection(nav: NavController, section: String) {
    Screen(sections.firstOrNull { it.first == section }?.second ?: "Admin", onBack = { nav.popBackStack() }) { padding ->
        Box(Modifier.padding(padding)) {
            when (section) {
                "stats" -> StatsSection()
                "finances" -> FinancesSection()
                "analytics" -> AnalyticsSection()
                "reviews" -> ReviewsSection()
                "applications" -> ApplicationsSection()
                "users" -> UsersSection()
                "coupons" -> CouponsSection()
                "categories" -> CategoriesSection()
                "kpis" -> KpisSection()
                "business" -> BusinessSection()
            }
        }
    }
}

@Composable
private fun StatsSection() {
    val app = LocalApp.current
    var data by remember { mutableStateOf<AdminStats?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { data = runCatching { app.admin.stats() }.getOrNull(); loading = false }
    val d = data
    when {
        loading -> Loading()
        d == null -> EmptyState("No se pudo cargar.")
        else -> Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            StatRow("${d.totalUsers}" to "Usuarios", "${d.totalCourses}" to "Cursos")
            StatRow("${d.publishedCourses}" to "Publicados", "${d.draftCourses}" to "Borradores")
            StatRow("${d.totalEnrollments}" to "Inscripciones", Formatting.priceMXN(d.estimatedRevenue) to "Valor de catálogo")
        }
    }
}

@Composable
private fun FinancesSection() {
    val app = LocalApp.current
    var data by remember { mutableStateOf<AdminFinances?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { data = runCatching { app.admin.finances() }.getOrNull(); loading = false }
    val d = data
    when {
        loading -> Loading()
        d == null -> EmptyState("No se pudo cargar.")
        else -> Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            StatRow(Formatting.priceMXN(d.totalRevenue ?: 0.0) to "Ingresos totales", Formatting.priceMXN(d.totalPlatformFee ?: 0.0) to "Comisión plataforma")
            StatRow(Formatting.priceMXN(d.totalInstructorPayouts ?: 0.0) to "Pagos a instructores", Formatting.priceMXN(d.thisMonthRevenue ?: 0.0) to "Este mes")
        }
    }
}

@Composable
private fun AnalyticsSection() {
    val app = LocalApp.current
    var data by remember { mutableStateOf<AdminAnalytics?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { data = runCatching { app.admin.analytics() }.getOrNull(); loading = false }
    val d = data
    when {
        loading -> Loading()
        d == null -> EmptyState("No se pudo cargar.")
        else -> Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            val revenue = d.revenueByMonth ?: emptyList()
            val max = maxOf(1.0, revenue.maxOfOrNull { it.amount } ?: 1.0)
            Text("Ingresos por mes", fontWeight = FontWeight.SemiBold)
            revenue.forEach { m ->
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(m.month, style = MaterialTheme.typography.labelSmall, modifier = Modifier.width(56.dp))
                    LinearProgressIndicator(progress = { (m.amount / max).toFloat() }, modifier = Modifier.weight(1f).height(10.dp), color = Brand.primary)
                    Text(Formatting.priceMXN(m.amount), style = MaterialTheme.typography.labelSmall)
                }
            }
            Spacer(Modifier.height(12.dp))
            Text("Usuarios nuevos por mes", fontWeight = FontWeight.SemiBold)
            (d.usersByMonth ?: emptyList()).forEach { m ->
                Row { Text(m.month, style = MaterialTheme.typography.labelSmall); Spacer(Modifier.weight(1f)); Text("${m.users}", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold) }
            }
        }
    }
}

@Composable
private fun ReviewsSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<AdminReview>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { items = runCatching { app.admin.reviews(false) }.getOrDefault(emptyList()); loading = false }
    fun act(id: String, f: suspend () -> Unit) = scope.launch { runCatching { f() }.onSuccess { items = items.filter { it.id != id } } }
    if (loading) Loading() else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (items.isEmpty()) item { EmptyState("No hay reseñas pendientes.") }
        items(items, key = { it.id }) { r ->
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Stars(r.rating.toDouble(), 14)
                Text("${r.user?.name ?: "Estudiante"} · ${r.course?.title ?: ""}", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                if (!r.comment.isNullOrEmpty()) Text(r.comment)
                Row { TextButton(onClick = { act(r.id) { app.admin.setReviewApproved(r.id, true) } }) { Text("Aprobar") }; TextButton(onClick = { act(r.id) { app.admin.deleteReview(r.id) } }) { Text("Eliminar", color = Brand.danger) } }
            } }
        }
    }
}

@Composable
private fun ApplicationsSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var apps by remember { mutableStateOf<List<AdminApplication>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var rejecting by remember { mutableStateOf<String?>(null) }
    var reason by remember { mutableStateOf("") }
    LaunchedEffect(Unit) { apps = runCatching { app.admin.applications() }.getOrDefault(emptyList()); loading = false }
    fun act(id: String, f: suspend () -> Unit) = scope.launch { runCatching { f() }.onSuccess { apps = apps.filter { it.id != id } } }
    if (loading) Loading() else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (apps.isEmpty()) item { EmptyState("No hay solicitudes pendientes.") }
        items(apps, key = { it.id }) { a ->
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(a.user?.name ?: "—", fontWeight = FontWeight.SemiBold)
                Text(a.user?.email ?: "", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                if (!a.headline.isNullOrEmpty()) Text(a.headline, fontWeight = FontWeight.Medium)
                if (!a.reason.isNullOrEmpty()) Text(a.reason)
                if (rejecting == a.id) {
                    BrandTextField(reason, { reason = it }, "Motivo del rechazo", singleLine = false, minLines = 2)
                    Row {
                        TextButton(onClick = { rejecting = null }) { Text("Cancelar") }
                        TextButton(enabled = reason.isNotBlank(), onClick = { act(a.id) { app.admin.reviewApplication(a.id, false, reason.trim()) }; rejecting = null; reason = "" }) { Text("Confirmar rechazo", color = Brand.danger) }
                    }
                } else Row {
                    TextButton(onClick = { act(a.id) { app.admin.reviewApplication(a.id, true) } }) { Text("Aprobar") }
                    TextButton(onClick = { rejecting = a.id; reason = "" }) { Text("Rechazar") }
                }
            } }
        }
    }
}

@Composable
private fun UsersSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val roles = listOf("student" to "Alumno", "instructor" to "Instructor", "admin" to "Admin")
    var users by remember { mutableStateOf<List<AdminUser>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var search by remember { mutableStateOf("") }
    LaunchedEffect(Unit) { users = runCatching { app.admin.users() }.getOrDefault(emptyList()); loading = false }
    val filtered = if (search.isBlank()) users else users.filter { (it.name ?: "").contains(search, true) || (it.email ?: "").contains(search, true) }
    Column {
        BrandTextField(search, { search = it }, "Buscar por nombre o correo", Modifier.padding(16.dp))
        if (loading) Loading() else LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (filtered.isEmpty()) item { EmptyState("Sin usuarios.") }
            items(filtered, key = { it.id }) { u ->
                AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(u.name ?: "—", fontWeight = FontWeight.SemiBold)
                    Text(u.email ?: "", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        roles.forEach { (id, label) ->
                            FilterChip(selected = u.role == id, onClick = {
                                if (u.role != id) scope.launch { runCatching { app.admin.setUserRole(u.id, id) }.onSuccess { users = users.map { if (it.id == u.id) it.copy(role = id) else it } } }
                            }, label = { Text(label) })
                        }
                    }
                } }
            }
        }
    }
}

@Composable
private fun CouponsSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<AdminCoupon>>(emptyList()) }
    var code by remember { mutableStateOf("") }
    var pct by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    suspend fun load() { items = runCatching { app.admin.coupons() }.getOrDefault(items) }
    LaunchedEffect(Unit) { load() }
    Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Nuevo cupón", fontWeight = FontWeight.SemiBold)
            BrandTextField(code, { code = it.uppercase() }, "CÓDIGO")
            BrandTextField(pct, { pct = it }, "% de descuento", keyboard = KeyboardOptions(keyboardType = KeyboardType.Number))
            ErrorText(error)
            PrimaryButton("Crear cupón", loading = busy, enabled = code.isNotBlank() && pct.isNotBlank()) {
                val p = pct.toIntOrNull() ?: run { error = "Código y % requeridos."; return@PrimaryButton }
                scope.launch { busy = true; error = null; try { app.admin.createCoupon(code.trim(), p.coerceIn(1, 100)); code = ""; pct = ""; load() } catch (e: Exception) { error = e.message }; busy = false }
            }
        } }
        items.forEach { c ->
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row { Text("${c.code} · ${c.discountPct}%", Modifier.weight(1f), fontWeight = FontWeight.SemiBold); Text(if (c.active) "Activo" else "Inactivo", color = if (c.active) Brand.success else Brand.muted, style = MaterialTheme.typography.labelSmall) }
                Text("Usos: ${c.usedCount ?: 0}" + (c.maxUses?.let { " / $it" } ?: ""), style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                Row {
                    TextButton(onClick = { scope.launch { runCatching { app.admin.setCouponActive(c.id, !c.active) }; load() } }) { Text(if (c.active) "Desactivar" else "Activar") }
                    TextButton(onClick = { scope.launch { runCatching { app.admin.deleteCoupon(c.id) }; load() } }) { Text("Eliminar", color = Brand.danger) }
                }
            } }
        }
    }
}

@Composable
private fun CategoriesSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<AdminCategory>>(emptyList()) }
    var name by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    suspend fun load() { items = runCatching { app.admin.categories() }.getOrDefault(items) }
    LaunchedEffect(Unit) { load() }
    Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Nueva categoría", fontWeight = FontWeight.SemiBold)
            BrandTextField(name, { name = it }, "Nombre")
            ErrorText(error)
            PrimaryButton("Crear", loading = busy, enabled = name.isNotBlank()) {
                if (name.trim().length < 2) { error = "Nombre muy corto."; return@PrimaryButton }
                scope.launch { busy = true; error = null; try { app.admin.createCategory(name.trim()); name = ""; load() } catch (e: Exception) { error = e.message }; busy = false }
            }
        } }
        items.forEach { c ->
            AppCard { Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) { Text(c.name, fontWeight = FontWeight.SemiBold); Text("${c.slug} · ${c.count?.courses ?: 0} cursos", style = MaterialTheme.typography.bodySmall, color = Brand.muted) }
                TextButton(onClick = { scope.launch { runCatching { app.admin.deleteCategory(c.id) }; load() } }) { Text("Eliminar", color = Brand.danger) }
            } }
        }
    }
}

@Composable
private fun KpisSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<AdminKpi>>(emptyList()) }
    var name by remember { mutableStateOf("") }
    var target by remember { mutableStateOf("") }
    var unit by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    suspend fun load() { items = runCatching { app.admin.kpis() }.getOrDefault(items) }
    LaunchedEffect(Unit) { load() }
    Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Nuevo KPI", fontWeight = FontWeight.SemiBold)
            BrandTextField(name, { name = it }, "Nombre")
            BrandTextField(target, { target = it }, "Valor objetivo", keyboard = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            BrandTextField(unit, { unit = it }, "Unidad (opcional)")
            ErrorText(error)
            PrimaryButton("Crear KPI", loading = busy, enabled = name.isNotBlank() && target.isNotBlank()) {
                val t = target.toDoubleOrNull()
                if (t == null || t <= 0) { error = "Nombre y objetivo (>0) requeridos."; return@PrimaryButton }
                scope.launch { busy = true; error = null; try { app.admin.createKpi(name.trim(), t, unit.trim().ifEmpty { null }); name = ""; target = ""; unit = ""; load() } catch (e: Exception) { error = e.message }; busy = false }
            }
        } }
        items.forEach { k ->
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) { Text(k.name, Modifier.weight(1f), fontWeight = FontWeight.SemiBold); TextButton(onClick = { scope.launch { runCatching { app.admin.deleteKpi(k.id) }; load() } }) { Text("Eliminar", color = Brand.danger) } }
                Text("${Formatting.clean(k.currentValue)} / ${Formatting.clean(k.targetValue)} ${k.unit ?: ""} (${k.percent}%)", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                LinearProgressIndicator(progress = { k.percent / 100f }, modifier = Modifier.fillMaxWidth(), color = Brand.primary)
            } }
        }
    }
}

@Composable
private fun BusinessSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var reqs by remember { mutableStateOf<List<QuoteRequest>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { reqs = runCatching { app.admin.quoteRequests() }.getOrDefault(emptyList()); loading = false }
    fun mark(r: QuoteRequest, status: String) { reqs = reqs.map { if (it.id == r.id) it.copy(status = status) else it }; scope.launch { runCatching { app.admin.updateQuoteRequest(r.id, status) } } }
    if (loading) Loading() else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (reqs.isEmpty()) item { EmptyState("No hay solicitudes.") }
        items(reqs, key = { it.id }) { r ->
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row { Text(r.companyName, Modifier.weight(1f), fontWeight = FontWeight.SemiBold); Text(r.statusLabel, color = Brand.primary, style = MaterialTheme.typography.labelSmall) }
                Text(listOfNotNull(r.contactName, r.contactEmail, r.contactPhone).joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                r.companySize?.let { Text("Tamaño: $it", style = MaterialTheme.typography.bodySmall, color = Brand.muted) }
                r.interests?.let { Text("Interés: $it", style = MaterialTheme.typography.bodySmall, color = Brand.muted) }
                r.message?.let { Text(it) }
                Row {
                    if (r.status == "new") TextButton(onClick = { mark(r, "contacted") }) { Text("Contactada") }
                    if (r.status != "closed" && r.status != "converted") TextButton(onClick = { mark(r, "closed") }) { Text("Cerrar") }
                }
                Text("Provisionar: desde la web.", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
            } }
        }
    }
}
