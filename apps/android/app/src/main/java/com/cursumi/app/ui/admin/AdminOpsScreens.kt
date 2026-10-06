package com.cursumi.app.ui.admin

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
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.api.ApiException
import com.cursumi.app.core.model.AuditLog
import com.cursumi.app.core.model.PayoutGroup
import com.cursumi.app.core.model.PayoutRow
import com.cursumi.app.core.model.PayoutsResponse
import com.cursumi.app.core.model.SocialLink
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.StatRow
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.launch

// Secciones de administración: pagos a instructores, bitácora y ajustes de plataforma.

/** Pagos pendientes a instructores: transferencia por Stripe o registro manual. */
@Composable
internal fun PayoutsSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var data by remember { mutableStateOf<PayoutsResponse?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf<String?>(null) }
    /** Fila pendiente de confirmar: transferencia (true) o registro manual (false). */
    var confirm by remember { mutableStateOf<Pair<PayoutRow, Boolean>?>(null) }
    var note by remember { mutableStateOf("") }

    suspend fun load() { runCatching { app.admin.payouts() }.onSuccess { data = it; error = null }.onFailure { error = "No se pudieron cargar los pagos." } }
    LaunchedEffect(Unit) { load(); loading = false }

    fun run(row: PayoutRow, transfer: Boolean) = scope.launch {
        busy = row.transactionId; error = null
        try {
            if (transfer) app.admin.transferPayout(row.transactionId) else app.admin.markPayoutPaid(row.transactionId, note)
            note = ""; load()
        } catch (e: ApiException) {
            // 409: el servidor ya no la tiene pendiente (alguien más la pagó); mostramos su mensaje y refrescamos.
            error = e.message ?: "No se pudo completar el pago."
            if (e.status == 409) load()
        } catch (e: Exception) { error = e.message }
        busy = null
    }

    val d = data
    when {
        loading -> Loading()
        d == null -> Column(Modifier.padding(16.dp)) { ErrorText(error); EmptyState("No se pudo cargar.") }
        else -> LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item { StatRow(Formatting.centsMXN(d.totalPendingCents) to "Pendiente total", "${d.groups.size}" to "Instructores") }
            item { ErrorText(error) }
            if (d.groups.isEmpty()) item { EmptyState("No hay pagos pendientes.") }
            items(d.groups, key = { it.instructorId }) { g -> PayoutGroupCard(g, busy) { row, transfer -> note = ""; confirm = row to transfer } }
        }
    }

    confirm?.let { (row, transfer) ->
        AlertDialog(
            onDismissRequest = { confirm = null },
            title = { Text(if (transfer) "Transferir por Stripe" else "Registrar pago manual") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("${row.courseTitle} · ${row.studentName}", fontWeight = FontWeight.SemiBold)
                    Text("Importe al instructor: ${Formatting.centsMXN(row.instructorAmountCents)}")
                    if (transfer) Text("Se moverá dinero real a la cuenta de Stripe del instructor. Esta acción no se puede deshacer.", color = Brand.danger)
                    else {
                        Text("Marca la venta como pagada sin pasar por Stripe (p. ej. transferencia bancaria hecha a mano).", color = Brand.muted)
                        BrandTextField(note, { note = it }, "Nota (referencia, fecha…)", singleLine = false, minLines = 2)
                    }
                }
            },
            confirmButton = { TextButton(onClick = { confirm = null; run(row, transfer) }) { Text(if (transfer) "Transferir" else "Marcar pagado", fontWeight = FontWeight.Bold) } },
            dismissButton = { TextButton(onClick = { confirm = null }) { Text("Cancelar") } },
        )
    }
}

@Composable
private fun PayoutGroupCard(g: PayoutGroup, busy: String?, onAction: (PayoutRow, Boolean) -> Unit) {
    AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f)) {
                Text(g.instructorName.ifBlank { "Instructor" }, fontWeight = FontWeight.SemiBold)
                Text(g.instructorEmail, style = MaterialTheme.typography.bodySmall, color = Brand.muted)
            }
            Text(Formatting.centsMXN(g.pendingCents), color = Brand.primary, fontWeight = FontWeight.Bold)
        }
        Text(
            if (g.stripeOnboarded) "Stripe conectado" + (g.stripeAccountId?.let { " · $it" } ?: "") else "Sin Stripe: solo se puede registrar el pago a mano.",
            style = MaterialTheme.typography.labelSmall, color = if (g.stripeOnboarded) Brand.success else Brand.warning,
        )
        g.rows.forEachIndexed { i, r ->
            if (i > 0) HorizontalDivider(color = Color.Gray.copy(alpha = 0.15f))
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(r.courseTitle, fontWeight = FontWeight.Medium, maxLines = 2)
                Text("${r.studentName} · ${Formatting.shortDate(r.createdAt)}", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                Text("Cobrado ${Formatting.centsMXN(r.amountCents)} · al instructor ${Formatting.centsMXN(r.instructorAmountCents)}", style = MaterialTheme.typography.bodySmall)
                Row {
                    if (busy == r.transactionId) Text("…", Modifier.padding(12.dp)) else {
                        if (g.stripeOnboarded) TextButton(onClick = { onAction(r, true) }) { Text("Transferir", fontWeight = FontWeight.Bold) }
                        TextButton(onClick = { onAction(r, false) }) { Text("Marcar pagado") }
                    }
                }
            }
        }
    } }
}

/** Bitácora de acciones administrativas. */
@Composable
internal fun AuditLogsSection() {
    val app = LocalApp.current
    var logs by remember { mutableStateOf<List<AuditLog>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        runCatching { app.admin.auditLogs(200) }.onSuccess { logs = it }.onFailure { error = "No se pudo cargar la bitácora." }
        loading = false
    }
    if (loading) Loading() else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ErrorText(error) }
        if (logs.isEmpty() && error == null) item { EmptyState("Sin registros todavía.") }
        items(logs, key = { it.id }) { l ->
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(verticalAlignment = Alignment.Top) {
                    Text(l.label, Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                    Text(Formatting.shortDate(l.createdAt), style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                }
                Text(l.actorEmail ?: l.actorId, style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                if (l.targetType != null || l.targetId != null) Text(listOfNotNull(l.targetType, l.targetId).joinToString(" · "), style = MaterialTheme.typography.bodySmall)
                val meta = l.metadataText
                if (meta.isNotEmpty()) Text(meta, style = MaterialTheme.typography.labelSmall, fontFamily = FontFamily.Monospace, color = Brand.muted, maxLines = 6)
                l.ip?.let { Text("IP $it", style = MaterialTheme.typography.labelSmall, color = Brand.muted) }
            } }
        }
    }
}

/** Comisión de la plataforma y redes sociales del pie de página. */
@Composable
internal fun PlatformSettingsSection() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var fee by remember { mutableStateOf("") }
    var links by remember { mutableStateOf<List<SocialLink>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var feeError by remember { mutableStateOf<String?>(null) }
    var linksError by remember { mutableStateOf<String?>(null) }
    var savingFee by remember { mutableStateOf(false) }
    var savingLinks by remember { mutableStateOf(false) }
    var feeDone by remember { mutableStateOf(false) }
    var linksDone by remember { mutableStateOf(false) }
    var confirmFee by remember { mutableStateOf<Double?>(null) }

    LaunchedEffect(Unit) {
        runCatching { app.admin.platformFee() }.onSuccess { fee = Formatting.clean(it.platformFeePercent) }.onFailure { feeError = "No se pudo cargar la comisión." }
        runCatching { app.admin.socialLinks() }.onSuccess { links = it }.onFailure { linksError = "No se pudieron cargar las redes sociales." }
        loading = false
    }

    if (loading) Loading() else Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Comisión de la plataforma", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text("Porcentaje que Cursumi retiene de cada venta (0–100). Aplica a las ventas futuras.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
            BrandTextField(fee, { fee = it; feeDone = false }, "% de comisión", keyboard = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            ErrorText(feeError)
            if (feeDone) Text("Comisión guardada ✓", color = Brand.success)
            PrimaryButton("Guardar comisión", loading = savingFee, enabled = fee.isNotBlank()) {
                val v = fee.trim().replace(',', '.').toDoubleOrNull()
                if (v == null || v < 0 || v > 100) { feeError = "Escribe un porcentaje entre 0 y 100."; return@PrimaryButton }
                feeError = null; confirmFee = v
            }
        } }

        AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Redes sociales", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text("Enlaces del pie de página de la web. Apaga el interruptor para ocultar una red sin borrar su URL.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
            if (links.isEmpty()) Text("No hay redes configuradas.", color = Brand.muted)
            links.forEachIndexed { i, link ->
                if (i > 0) HorizontalDivider(color = Color.Gray.copy(alpha = 0.15f))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(link.label.ifBlank { link.key }, Modifier.weight(1f), fontWeight = FontWeight.Medium)
                    Switch(checked = link.visible, onCheckedChange = { v -> links = links.map { if (it.key == link.key) it.copy(visible = v) else it }; linksDone = false })
                }
                BrandTextField(link.url, { v -> links = links.map { if (it.key == link.key) it.copy(url = v) else it }; linksDone = false }, "https://…", keyboard = KeyboardOptions(keyboardType = KeyboardType.Uri))
            }
            ErrorText(linksError)
            if (linksDone) Text("Redes guardadas ✓", color = Brand.success)
            PrimaryButton("Guardar redes", loading = savingLinks, enabled = links.isNotEmpty()) {
                scope.launch {
                    savingLinks = true; linksError = null
                    try { app.admin.setSocialLinks(links.map { it.copy(url = it.url.trim()) }); linksDone = true } catch (e: Exception) { linksError = e.message }
                    savingLinks = false
                }
            }
        } }
    }

    confirmFee?.let { v ->
        AlertDialog(
            onDismissRequest = { confirmFee = null },
            title = { Text("¿Cambiar la comisión?") },
            text = { Text("La plataforma pasará a retener ${Formatting.clean(v)}% de cada venta nueva. Las ventas ya hechas no cambian.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmFee = null
                    scope.launch {
                        savingFee = true; feeError = null
                        try { app.admin.setPlatformFee(v); feeDone = true } catch (e: Exception) { feeError = e.message }
                        savingFee = false
                    }
                }) { Text("Guardar", fontWeight = FontWeight.Bold) }
            },
            dismissButton = { TextButton(onClick = { confirmFee = null }) { Text("Cancelar") } },
        )
    }
}
