package com.cursumi.app.ui.courses

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.cursumi.app.core.model.Exam
import com.cursumi.app.core.model.ExamResult
import com.cursumi.app.core.model.Lesson
import com.cursumi.app.core.model.QuizAnswer
import com.cursumi.app.core.model.QuizConfig
import com.cursumi.app.core.model.QuizQuestion
import com.cursumi.app.core.model.QuizQuestionType
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.GhostButton
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private fun allAnswered(questions: List<QuizQuestion>, answers: Map<Int, QuizAnswer>) =
    questions.indices.all { questions[it].type == QuizQuestionType.ORDERING || (answers[it]?.isAnswered == true) }

/** Quiz de lección: se califica en cliente y se guarda con `completeLesson`. */
@Composable
fun LessonQuizView(lesson: Lesson, onCompleted: (String) -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val questions = remember(lesson.id) { QuizQuestion.parseLessonQuiz(lesson.content) }
    val config = remember(lesson.id) { QuizConfig.parse(lesson.content) }
    val answers = remember { mutableStateMapOf<Int, QuizAnswer>() }
    var submitted by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    var saving by remember { mutableStateOf(false) }
    var attempts by remember { mutableIntStateOf(0) }
    var timeLeft by remember { mutableStateOf(if (config.timeLimitMin > 0) config.timeLimitMin * 60 else null) }

    val passed = score >= config.passingScore
    val attemptsLeft = if (config.maxAttempts > 0) maxOf(0, config.maxAttempts - attempts) else null
    val canRetake = !passed && (config.maxAttempts == 0 || attempts < config.maxAttempts)

    fun submit() {
        if (submitted) return
        val correct = questions.indices.count { questions[it].grade(answers[it]) }
        score = if (questions.isEmpty()) 0 else Math.round(correct * 100.0 / questions.size).toInt()
        submitted = true; timeLeft = null; attempts++
        scope.launch {
            saving = true
            runCatching { app.student.completeLesson(lesson.id, lesson.courseId, score, answers.mapKeys { it.key.toString() }) }
                .onSuccess { onCompleted(lesson.id) }
            saving = false
        }
    }

    // Cuenta regresiva: al llegar a 0 envía automáticamente.
    LaunchedEffect(timeLeft, submitted) {
        val t = timeLeft ?: return@LaunchedEffect
        if (submitted) return@LaunchedEffect
        if (t <= 0) { submit(); return@LaunchedEffect }
        delay(1000); timeLeft = t - 1
    }

    if (questions.isEmpty()) { Text("Este quiz no tiene preguntas.", fontStyle = FontStyle.Italic, color = Brand.muted); return }
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        timeLeft?.let { if (!submitted) Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) { TimerPill(it) } }
        if (submitted) ResultCard(
            score, passed, if (passed) "¡Aprobado!" else "No alcanzaste el ${config.passingScore}% mínimo.",
            attemptsLeft?.takeIf { !passed }?.let { if (it > 0) "Intentos restantes: $it" else "Sin intentos restantes." },
        )
        questions.forEachIndexed { i, q ->
            QuestionCard(i + 1, q.question, if (submitted) q.grade(answers[i]) else null) {
                QuizAnswerInput(q.type, q.options, q.matchRight ?: emptyList(), answers[i], { answers[i] = it }, disabled = submitted)
            }
        }
        when {
            !submitted -> PrimaryButton("Enviar respuestas", enabled = allAnswered(questions, answers)) { submit() }
            saving -> Loading()
            canRetake -> GhostButton("Reintentar") { answers.clear(); submitted = false; score = 0; timeLeft = if (config.timeLimitMin > 0) config.timeLimitMin * 60 else null }
            else -> Text("Respuestas guardadas ✓", color = Brand.muted, modifier = Modifier.fillMaxWidth(), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        }
    }
}

/** Quiz de sección: lo califica el servidor. */
@Composable
fun SectionQuizView(lesson: Lesson, onCompleted: (String) -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val questions = remember(lesson.id) { QuizQuestion.parseSectionQuiz(lesson.sectionQuiz) }
    val answers = remember { mutableStateMapOf<Int, QuizAnswer>() }
    var submitted by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<Pair<Int, Boolean>?>(null) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    if (questions.isEmpty()) { Text("Esta actividad no tiene preguntas.", fontStyle = FontStyle.Italic, color = Brand.muted); return }
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        result?.let { ResultCard(it.first, it.second, if (it.second) "¡Aprobado!" else "Inténtalo de nuevo.") }
        questions.forEachIndexed { i, q ->
            QuestionCard(i + 1, q.question, if (submitted) q.grade(answers[i]) else null) {
                QuizAnswerInput(q.type, q.options, q.matchRight ?: emptyList(), answers[i], { answers[i] = it }, disabled = submitted)
            }
        }
        ErrorText(error)
        when {
            !submitted -> PrimaryButton("Enviar", enabled = allAnswered(questions, answers)) {
                val sectionId = lesson.sectionId
                if (sectionId == null) { error = "No se pudo identificar la sección."; return@PrimaryButton }
                submitted = true; saving = true; error = null
                scope.launch {
                    try { result = app.student.submitSectionQuiz(sectionId, lesson.courseId, answers.mapKeys { it.key.toString() }); onCompleted(lesson.id) }
                    catch (e: Exception) { error = e.message; submitted = false }
                    saving = false
                }
            }
            saving -> Loading()
            result?.second == false -> GhostButton("Reintentar") { answers.clear(); submitted = false; result = null }
        }
    }
}

/** Tarea: respuesta de texto que se puede actualizar. */
@Composable
fun AssignmentView(lesson: Lesson, onCompleted: (String) -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var text by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var savedAt by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(lesson.id) {
        runCatching { app.student.assignment(lesson.id, lesson.courseId) }.getOrNull()?.let { text = it.content; savedAt = it.submittedAt }
        loading = false
    }
    if (loading) { Loading(); return }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Tu respuesta", fontWeight = FontWeight.SemiBold)
        BrandTextField(text, { text = it }, "Escribe tu respuesta", singleLine = false, minLines = 5)
        savedAt?.let { Text("Enviada · ${it.take(10)}", color = Brand.success, style = MaterialTheme.typography.labelSmall) }
        ErrorText(error)
        PrimaryButton(if (savedAt == null) "Enviar tarea" else "Actualizar respuesta", loading = saving) {
            val content = text.trim()
            if (content.isEmpty()) { error = "Escribe tu respuesta antes de enviar."; return@PrimaryButton }
            scope.launch {
                saving = true; error = null
                try {
                    app.student.submitAssignment(lesson.id, lesson.courseId, content)
                    app.student.completeLesson(lesson.id, lesson.courseId)
                    savedAt = java.time.Instant.now().toString(); onCompleted(lesson.id)
                } catch (e: Exception) { error = "No se pudo enviar. Inténtalo de nuevo." }
                saving = false
            }
        }
    }
}

/** Examen final del curso; el servidor califica y emite el certificado. */
@Composable
fun ExamScreen(nav: NavController, courseId: String) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var exam by remember { mutableStateOf<Exam?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val answers = remember { mutableStateMapOf<String, QuizAnswer>() }
    var result by remember { mutableStateOf<ExamResult?>(null) }
    var submitting by remember { mutableStateOf(false) }
    var timeLeft by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(courseId) {
        try { exam = app.student.exam(courseId); exam?.timeLimit?.takeIf { it > 0 }?.let { timeLeft = it * 60 } }
        catch (e: Exception) { error = "No se pudo cargar el examen." }
        loading = false
    }

    fun submit() {
        if (exam == null || result != null || submitting) return
        scope.launch {
            submitting = true; error = null
            try { result = app.student.submitExam(courseId, answers.toMap()); timeLeft = null } catch (e: Exception) { error = e.message }
            submitting = false
        }
    }

    LaunchedEffect(timeLeft, result) {
        val t = timeLeft ?: return@LaunchedEffect
        if (result != null) return@LaunchedEffect
        if (t <= 0) { submit(); return@LaunchedEffect }
        delay(1000); timeLeft = t - 1
    }

    Screen("Examen", onBack = { nav.popBackStack() }) { padding ->
        val e = exam
        when {
            loading -> Loading()
            e == null -> EmptyState(error ?: "Este curso no tiene examen final.")
            else -> Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Examen final", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("Necesitas ${e.passingScore}% para aprobar.", color = Brand.muted)
                timeLeft?.let { if (result == null) Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) { TimerPill(it) } }
                result?.let { r -> ResultCard(Math.round(r.score).toInt(), r.passed, extra = r.certificate?.let { "🎓 Certificado emitido · Folio ${it.number}" }) }
                e.questions.forEachIndexed { i, q ->
                    QuestionCard(i + 1, q.question) {
                        if (q.isGradable) QuizAnswerInput(q.questionType, q.options ?: emptyList(), q.matchRight ?: emptyList(), answers[q.id], { answers[q.id] = it }, disabled = result != null)
                        else Text("Pregunta abierta — se evalúa manualmente.", fontStyle = FontStyle.Italic, color = Brand.muted, style = MaterialTheme.typography.labelSmall)
                    }
                }
                ErrorText(error)
                if (result == null) {
                    val gradable = e.questions.filter { it.isGradable }
                    val ok = gradable.all { it.questionType == QuizQuestionType.ORDERING || answers[it.id]?.isAnswered == true }
                    PrimaryButton("Enviar examen", loading = submitting, enabled = ok) { submit() }
                }
            }
        }
    }
}
