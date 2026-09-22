package com.cursumi.app.ui.courses

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.cursumi.app.core.model.StudentCourse
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandHeader
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.RemoteImage
import com.cursumi.app.ui.LocalApp
import com.cursumi.app.ui.Routes

@Composable
fun MyCoursesScreen(nav: NavController) {
    val app = LocalApp.current
    var courses by remember { mutableStateOf<List<StudentCourse>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try { courses = app.student.myCourses() } catch (e: Exception) { error = "No se pudieron cargar tus cursos." }
        loading = false
    }

    Column(Modifier.fillMaxSize()) {
        BrandHeader("Mis cursos", "Continúa donde lo dejaste")
        if (loading) Loading()
        else LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (courses.isEmpty()) item { EmptyState("Aún no tienes cursos", error ?: "Cuando te inscribas a un curso aparecerá aquí.") }
            items(courses, key = { it.id }) { course ->
                AppCard(onClick = { nav.navigate(Routes.course(course.id)) }) {
                    RemoteImage(course.imageUrl)
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(course.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, maxLines = 2)
                        Text(listOfNotNull(course.instructorName, course.category?.label).joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                        LinearProgressIndicator(progress = { (course.progress / 100).toFloat().coerceIn(0f, 1f) }, modifier = Modifier.fillMaxWidth(), color = Brand.primary)
                        Text(if (course.isCompleted) "Completado" else "${Math.round(course.progress)}% completado", style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                    }
                }
            }
        }
    }
}
