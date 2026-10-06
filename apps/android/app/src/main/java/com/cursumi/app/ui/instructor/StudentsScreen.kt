package com.cursumi.app.ui.instructor

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.model.InstructorCourseStudents
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp

/** Alumnos inscritos en los cursos del instructor, agrupados por curso. */
@Composable
fun InstructorStudentsScreen(nav: NavController) {
    val app = LocalApp.current
    var courses by remember { mutableStateOf<List<InstructorCourseStudents>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        runCatching { app.instructor.students() }.onSuccess { courses = it }.onFailure { error = "No se pudieron cargar tus alumnos." }
        loading = false
    }
    Screen("Alumnos", onBack = { nav.popBackStack() }) { padding ->
        if (loading) Loading() else LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item { ErrorText(error) }
            if (courses.isEmpty() && error == null) item { EmptyState("Aún no tienes alumnos", "Cuando alguien se inscriba a uno de tus cursos aparecerá aquí.") }
            items(courses, key = { it.courseId }) { c ->
                AppCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(c.courseTitle, fontWeight = FontWeight.SemiBold, maxLines = 2)
                    Text("${c.students.size} ${if (c.students.size == 1) "alumno" else "alumnos"}" + (c.modality?.let { " · $it" } ?: ""), style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                    if (c.students.isEmpty()) Text("Sin inscripciones todavía.", style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                    c.students.forEachIndexed { i, s ->
                        if (i > 0) HorizontalDivider(color = Color.Gray.copy(alpha = 0.15f))
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(s.studentName.ifBlank { "Alumno" }, Modifier.weight(1f), fontWeight = FontWeight.Medium)
                                Text("${s.progressPercent}%", color = Brand.primary, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
                            }
                            Text(s.studentEmail, style = MaterialTheme.typography.bodySmall, color = Brand.muted)
                            LinearProgressIndicator(progress = { s.progressPercent / 100f }, modifier = Modifier.fillMaxWidth(), color = Brand.primary)
                            Text("Inscrito el ${Formatting.shortDate(s.enrolledAt)}" + (if (s.status.isNotBlank()) " · ${s.status}" else ""), style = MaterialTheme.typography.labelSmall, color = Brand.muted)
                        }
                    }
                } }
            }
        }
    }
}
