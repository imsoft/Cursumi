package com.cursumi.app.ui.profile

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Paint
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil3.compose.AsyncImage
import com.cursumi.app.core.DataUrl
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.GhostButton
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream

private const val MAX_SIGNATURE_BYTES = 4 * 1024 * 1024
private const val STROKE_WIDTH = 6f

/** Firma del usuario para los certificados: ver la actual, dibujar una nueva, subirla o eliminarla. */
@Composable
fun SignatureScreen(nav: NavController) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var url by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf<String?>(null) }
    var confirmDelete by remember { mutableStateOf(false) }
    val strokes = remember { mutableStateListOf<List<Offset>>() }
    var current by remember { mutableStateOf<List<Offset>?>(null) }
    var version by remember { mutableIntStateOf(0) }
    var canvasSize by remember { mutableStateOf(IntSize.Zero) }

    LaunchedEffect(Unit) {
        runCatching { app.student.signature() }.onSuccess { url = it.url }.onFailure { error = "No se pudo cargar tu firma." }
        loading = false
    }

    Screen("Mi firma", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Aparece en los certificados que emites como instructor.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Firma actual", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                val u = url
                if (u == null) Text("Aún no has guardado una firma.", color = Brand.muted)
                else {
                    SignatureImage(u, Modifier.fillMaxWidth().height(140.dp).clip(RoundedCornerShape(12.dp)).background(Color.White))
                    GhostButton("Eliminar firma", enabled = !deleting && !saving) { confirmDelete = true }
                }
            } }
            AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Dibuja una nueva", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text("Firma con el dedo dentro del recuadro.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                Canvas(
                    Modifier.fillMaxWidth().height(200.dp).clip(RoundedCornerShape(12.dp)).background(Color.White)
                        .border(1.dp, Color.Gray.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                        .onSizeChanged { canvasSize = it }
                        .pointerInput(Unit) {
                            detectDragGestures(
                                onDragStart = { current = listOf(it) },
                                onDrag = { change, _ -> current = (current ?: emptyList()) + change.position; version++ },
                                onDragEnd = { current?.let { if (it.size > 1) strokes.add(it) }; current = null },
                                onDragCancel = { current = null },
                            )
                        },
                ) {
                    @Suppress("UNUSED_EXPRESSION") version
                    (strokes + listOfNotNull(current)).forEach { pts ->
                        val path = Path().apply { pts.firstOrNull()?.let { moveTo(it.x, it.y) }; pts.drop(1).forEach { lineTo(it.x, it.y) } }
                        drawPath(path, Color.Black, style = Stroke(width = STROKE_WIDTH, cap = StrokeCap.Round, join = StrokeJoin.Round))
                    }
                }
                ErrorText(error)
                done?.let { Text(it, color = Brand.success) }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GhostButton("Limpiar", Modifier.weight(1f), enabled = strokes.isNotEmpty() && !saving) { strokes.clear(); current = null; done = null }
                    PrimaryButton("Guardar", loading = saving, enabled = strokes.isNotEmpty() && canvasSize.width > 0, modifier = Modifier.weight(1f)) {
                        val pts = strokes.toList(); val size = canvasSize
                        scope.launch {
                            saving = true; error = null; done = null
                            try {
                                val png = withContext(Dispatchers.Default) { rasterizeSignature(pts, size.width, size.height) }
                                if (png.size > MAX_SIGNATURE_BYTES) throw IllegalStateException("La firma pesa más de 4 MB. Hazla más sencilla.")
                                url = app.student.uploadSignature(png).url
                                strokes.clear(); done = "Firma guardada ✓"
                            } catch (e: Exception) { error = e.message ?: "No se pudo guardar la firma." }
                            saving = false
                        }
                    }
                }
            } }
        }
    }

    if (confirmDelete) AlertDialog(
        onDismissRequest = { confirmDelete = false },
        title = { Text("¿Eliminar tu firma?") },
        text = { Text("Los certificados nuevos saldrán sin firma hasta que guardes otra.") },
        confirmButton = {
            TextButton(onClick = {
                confirmDelete = false
                scope.launch {
                    deleting = true; error = null; done = null
                    try { app.student.deleteSignature(); url = null; done = "Firma eliminada." } catch (e: Exception) { error = e.message ?: "No se pudo eliminar la firma." }
                    deleting = false
                }
            }) { Text("Eliminar", color = Brand.danger, fontWeight = FontWeight.Bold) }
        },
        dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancelar") } },
    )
}

/** La firma puede llegar como https o como `data:image/png;base64,…`; Coil se encarga de la primera. */
@Composable
private fun SignatureImage(url: String, modifier: Modifier) {
    if (DataUrl.isDataUrl(url)) {
        val bitmap = remember(url) { DataUrl.decode(url)?.let { BitmapFactory.decodeByteArray(it, 0, it.size) } }
        Box(modifier, contentAlignment = Alignment.Center) {
            if (bitmap != null) Image(bitmap.asImageBitmap(), contentDescription = "Firma", modifier = Modifier.fillMaxWidth().padding(8.dp), contentScale = ContentScale.Fit)
            else Text("No se pudo mostrar la firma.", color = Brand.muted)
        }
    } else AsyncImage(url, contentDescription = "Firma", modifier = modifier, contentScale = ContentScale.Fit)
}

/** Rasteriza los trazos (trazo negro sobre blanco) a un PNG con el tamaño del lienzo. */
private fun rasterizeSignature(strokes: List<List<Offset>>, width: Int, height: Int): ByteArray {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = android.graphics.Canvas(bitmap)
    canvas.drawColor(android.graphics.Color.WHITE)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = android.graphics.Color.BLACK; style = Paint.Style.STROKE; strokeWidth = STROKE_WIDTH
        strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND
    }
    strokes.forEach { pts ->
        val path = android.graphics.Path().apply { pts.firstOrNull()?.let { moveTo(it.x, it.y) }; pts.drop(1).forEach { lineTo(it.x, it.y) } }
        canvas.drawPath(path, paint)
    }
    return ByteArrayOutputStream().also { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }.toByteArray()
}
