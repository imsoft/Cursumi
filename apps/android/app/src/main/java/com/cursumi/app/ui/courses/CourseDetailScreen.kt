package com.cursumi.app.ui.courses

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.cursumi.app.core.model.StudentCourseDetail
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.GhostButton
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import com.cursumi.app.ui.Routes

private val typeLabels = mapOf(
    "video" to "Video", "text" to "Lectura", "quiz" to "Quiz", "assignment" to "Tarea",
    "section_quiz" to "Examen", "section_minigame" to "Juego",
)

@Composable
fun CourseDetailScreen(nav: NavController, courseId: String) {
    val app = LocalApp.current
    var detail by remember { mutableStateOf<StudentCourseDetail?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    // Se recarga al volver de una lección para reflejar el progreso.
    LaunchedEffect(nav.currentBackStackEntry) {
        try { detail = app.student.courseDetail(courseId) } catch (e: Exception) { error = "No se pudo cargar el curso." }
        loading = false
    }

    Screen("Curso", onBack = { nav.popBackStack() }) { padding ->
        val d = detail
        when {
            loading -> Loading()
            d == null -> EmptyState("Curso no encontrado", error)
            else -> {
                val completed = d.lessonProgress.map { it.lessonId }.toSet()
                LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        Text(d.course.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                        Text("${d.course.instructor?.name ?: "Instructor"} · ${Math.round(d.progress)}% completado", color = Brand.muted, style = MaterialTheme.typography.bodyMedium)
                    }
                    item {
                        GhostButton("Mensajes con el instructor") { nav.navigate(Routes.chat(courseId)) }
                    }
                    items(d.course.sections, key = { it.id }) { section ->
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(section.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                            section.lessons.forEach { lesson ->
                                Row(
                                    Modifier.fillMaxWidth().clickable { nav.navigate(Routes.lesson(lesson.id)) }.padding(vertical = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
                                ) {
                                    val done = lesson.id in completed
                                    Icon(Icons.Filled.Check, contentDescription = null, tint = if (done) Brand.success else Brand.muted.copy(alpha = 0.3f))
                                    Text(lesson.title, Modifier.weight(1f), maxLines = 2)
                                    typeLabels[lesson.type]?.let { AssistChip(onClick = {}, label = { Text(it, style = MaterialTheme.typography.labelSmall) }) }
                                    Icon(Icons.Filled.KeyboardArrowRight, contentDescription = null, tint = Brand.muted)
                                }
                            }
                        }
                    }
                    item { PrimaryButton("Examen final 🎓") { nav.navigate(Routes.exam(courseId)) } }
                    item { ReflectionsSection(courseId) }
                    item { ReviewsSection(courseId) }
                }
            }
        }
    }
}
