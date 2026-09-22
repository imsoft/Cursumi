package com.cursumi.app.ui.catalog

import android.content.Context
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cursumi.app.core.Config
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.model.CourseSummary
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandHeader
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.RemoteImage
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.launch

/** Abre una URL en Custom Tabs (modelo reader app: la compra se hace en la web). */
fun openInBrowser(context: Context, url: String) {
    CustomTabsIntent.Builder().build().launchUrl(context, Uri.parse(url))
}

fun courseWebUrl(course: CourseSummary) = "${Config.API_URL}/courses/${course.slug ?: course.id}"

/**
 * Catálogo público. La ficha del curso se abre en el navegador y la app no
 * muestra ningún botón de compra.
 */
@Composable
fun CatalogScreen() {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var courses by remember { mutableStateOf<List<CourseSummary>>(emptyList()) }
    var saved by remember { mutableStateOf<Set<String>>(emptySet()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var search by remember { mutableStateOf("") }
    var submitted by remember { mutableStateOf("") }

    LaunchedEffect(submitted) {
        error = null
        try {
            courses = app.student.catalog(submitted)
            saved = runCatching { app.student.wishlist().toSet() }.getOrDefault(emptySet())
        } catch (e: Exception) { error = "No se pudieron cargar los cursos." }
        loading = false
    }

    Column(Modifier.fillMaxSize()) {
        BrandHeader("Explorar", "Descubre cursos de instructores expertos")
        OutlinedTextField(
            value = search, onValueChange = { search = it; if (it.isEmpty()) submitted = "" },
            placeholder = { Text("Buscar cursos") }, singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            keyboardActions = androidx.compose.foundation.text.KeyboardActions(onSearch = { submitted = search }),
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Search),
        )
        if (loading) Loading()
        else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (courses.isEmpty()) item { EmptyState(error ?: "No hay cursos disponibles por ahora.") }
            items(courses, key = { it.id }) { course ->
                AppCard(onClick = { openInBrowser(context, courseWebUrl(course)) }) {
                    if (course.imageUrl != null) RemoteImage(course.imageUrl)
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(verticalAlignment = Alignment.Top) {
                            Text(course.title, Modifier.weight(1f), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, maxLines = 2)
                            val isSaved = course.id in saved
                            IconButton(onClick = {
                                saved = if (isSaved) saved - course.id else saved + course.id // optimista
                                scope.launch {
                                    runCatching { app.student.toggleWishlist(course.id) }
                                        .onSuccess { s -> saved = if (s) saved + course.id else saved - course.id }
                                        .onFailure { saved = if (isSaved) saved + course.id else saved - course.id }
                                }
                            }) { Icon(if (isSaved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder, contentDescription = "Guardar", tint = if (isSaved) Brand.danger else Brand.muted) }
                        }
                        Text(Formatting.priceMXN(course.price), color = Brand.primary, fontWeight = FontWeight.Bold)
                        Text("Ver detalles →", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                    }
                }
            }
        }
    }
}
