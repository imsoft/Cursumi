package com.cursumi.app.ui.courses

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.navigation.NavController
import com.cursumi.app.core.LessonContent
import com.cursumi.app.core.VideoSource
import com.cursumi.app.core.model.Lesson
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.EmptyState
import com.cursumi.app.core.ui.Loading
import com.cursumi.app.core.ui.PrimaryButton
import com.cursumi.app.core.ui.Screen
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.launch

/** Visor de lección: video, HTML, quizzes, tarea o minijuego según el tipo. */
@Composable
fun LessonScreen(nav: NavController, lessonId: String) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var lesson by remember { mutableStateOf<Lesson?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }
    var completing by remember { mutableStateOf(false) }

    LaunchedEffect(lessonId) {
        try { lesson = app.student.lesson(lessonId).also { done = it.completed } } catch (e: Exception) { error = "No se pudo cargar la lección." }
        loading = false
    }

    Screen("Lección", onBack = { nav.popBackStack() }) { padding ->
        val l = lesson
        when {
            loading -> Loading()
            l == null -> EmptyState("Lección no encontrada", error)
            else -> Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(l.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                if (!l.description.isNullOrEmpty()) Text(l.description, color = Brand.muted)

                when (val source = VideoSource.from(l.videoUrl)) {
                    is VideoSource.Native -> VideoPlayer(source.url)
                    is VideoSource.YouTube -> HtmlView(url = "https://www.youtube.com/embed/${source.id}?playsinline=1", modifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f).clip(RoundedCornerShape(12.dp)))
                    null -> {}
                }

                val onCompleted: (String) -> Unit = { done = true }
                when (l.type) {
                    "quiz" -> LessonQuizView(l, onCompleted)
                    "section_quiz" -> SectionQuizView(l, onCompleted)
                    "section_minigame" -> MinigameView(l, onCompleted)
                    "assignment" -> { HtmlContent(l.content); AssignmentView(l, onCompleted) }
                    else -> {
                        HtmlContent(l.content)
                        PrimaryButton(if (done) "✓ Completada" else "Marcar como completada", loading = completing, enabled = !done) {
                            scope.launch {
                                completing = true
                                try { app.student.completeLesson(l.id, l.courseId); done = true } catch (e: Exception) { error = "No se pudo marcar la lección." }
                                completing = false
                            }
                        }
                    }
                }
                NotesSection(l.courseId, l.id)
            }
        }
    }
}

@Composable
private fun HtmlContent(content: String?) {
    if (!content.isNullOrEmpty()) HtmlView(html = LessonContent.html(content), modifier = Modifier.fillMaxWidth().wrapContentHeight())
}

/** Reproductor nativo (Mux HLS / mp4). */
@Composable
fun VideoPlayer(url: String) {
    val context = LocalContext.current
    val player = remember(url) { ExoPlayer.Builder(context).build().apply { setMediaItem(MediaItem.fromUri(url)); prepare() } }
    DisposableEffect(player) { onDispose { player.release() } }
    AndroidView(
        modifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f).clip(RoundedCornerShape(12.dp)),
        factory = { PlayerView(it).apply { this.player = player } },
    )
}

/** WebView que renderiza HTML de lección o una URL, ajustando su altura al contenido. */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun HtmlView(html: String? = null, url: String? = null, modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier,
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                webViewClient = WebViewClient()
                if (html != null) loadDataWithBaseURL(com.cursumi.app.core.Config.API_URL, html, "text/html", "utf-8", null)
                else if (url != null) loadUrl(url)
            }
        },
    )
}
