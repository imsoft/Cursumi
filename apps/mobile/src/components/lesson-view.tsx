import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { WebView } from "react-native-webview";

import { ThemedText } from "@/components/themed-text";
import { QuizView } from "@/components/quiz-view";
import { AssignmentView } from "@/components/assignment-view";
import { completeLesson, getLesson, type Lesson } from "@/lib/me";

const PURPLE = "#6d28d9";

function muxPlaybackId(url: string): string | null {
  const m = url.match(/stream\.mux\.com\/([^/.]+)/);
  return m ? m[1] : null;
}
function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

/** Devuelve la fuente de video reproducible nativamente (Mux HLS o URL directa). */
function nativeVideoSource(videoUrl: string | null | undefined): string | null {
  if (!videoUrl) return null;
  const mux = muxPlaybackId(videoUrl);
  if (mux) return `https://stream.mux.com/${mux}.m3u8`;
  if (youTubeId(videoUrl)) return null; // YouTube se reproduce vía WebView
  return videoUrl; // mp4/HLS directo
}

function contentToHtml(content: string): string {
  const isHtml = content.includes("<");
  const body = isHtml
    ? content
    : content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\n/g, "<br/>");
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <style>
      body { font-family: -apple-system, system-ui, sans-serif; font-size: 17px; line-height: 1.6;
             color: #111827; padding: 4px 2px; margin: 0; }
      img, video { max-width: 100%; height: auto; }
      a { color: #6d28d9; }
      pre, code { white-space: pre-wrap; word-break: break-word; }
    </style></head><body>${body}</body></html>`;
}

export function LessonView({
  lessonId,
  onBack,
  onCompleted,
}: {
  lessonId: string;
  onBack: () => void;
  onCompleted?: (lessonId: string) => void;
}) {
  const { width } = useWindowDimensions();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getLesson(lessonId)
      .then((l) => {
        if (!active) return;
        setLesson(l);
        setDone(l.completed);
      })
      .catch(() => active && setError("No se pudo cargar la lección."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [lessonId]);

  const videoSource = useMemo(() => nativeVideoSource(lesson?.videoUrl), [lesson?.videoUrl]);
  const ytId = lesson?.videoUrl ? youTubeId(lesson.videoUrl) : null;

  // El hook se llama siempre; la fuente se actualiza cuando carga la lección.
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
  });

  async function markComplete() {
    if (!lesson) return;
    setCompleting(true);
    try {
      await completeLesson(lesson.id, lesson.courseId);
      setDone(true);
      onCompleted?.(lesson.id);
    } catch {
      // silencioso; el usuario puede reintentar
    } finally {
      setCompleting(false);
    }
  }

  const videoHeight = Math.round((Math.min(width, 700) - 32) * (9 / 16));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : error || !lesson ? (
        <ThemedText style={styles.error}>{error ?? "Lección no encontrada."}</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">{lesson.title}</ThemedText>
          {lesson.description ? (
            <ThemedText style={styles.desc}>{lesson.description}</ThemedText>
          ) : null}

          {/* Video nativo (Mux/HLS/mp4) */}
          {videoSource && (
            <VideoView
              player={player}
              style={[styles.video, { height: videoHeight }]}
              fullscreenOptions={{ enable: true }}
              contentFit="contain"
            />
          )}

          {/* YouTube vía WebView */}
          {ytId && (
            <View style={[styles.video, { height: videoHeight }]}>
              <WebView
                source={{ uri: `https://www.youtube.com/embed/${ytId}?playsinline=1` }}
                allowsFullscreenVideo
                style={{ flex: 1 }}
              />
            </View>
          )}

          {/* Quiz nativo */}
          {lesson.type === "quiz" ? (
            <QuizView lesson={lesson} onCompleted={onCompleted} />
          ) : lesson.type === "assignment" ? (
            <>
              {/* Enunciado de la tarea (si viene en content como texto/HTML) */}
              {lesson.content ? (
                <View style={styles.textWrap}>
                  <WebView
                    originWhitelist={["*"]}
                    source={{
                      html: contentToHtml(lesson.content),
                      baseUrl: "https://cursumi.vercel.app",
                    }}
                    style={styles.textWebview}
                    scrollEnabled={false}
                  />
                </View>
              ) : null}
              <AssignmentView lesson={lesson} onCompleted={onCompleted} />
            </>
          ) : (
            <>
              {/* Contenido de texto/HTML (video/lectura) */}
              {lesson.content ? (
                <View style={styles.textWrap}>
                  <WebView
                    originWhitelist={["*"]}
                    source={{
                      html: contentToHtml(lesson.content),
                      baseUrl: "https://cursumi.vercel.app",
                    }}
                    style={styles.textWebview}
                    scrollEnabled={false}
                  />
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, done && styles.buttonDone]}
                onPress={markComplete}
                disabled={completing || done}
              >
                {completing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.buttonText}>
                    {done ? "✓ Completada" : "Marcar como completada"}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  loader: { marginTop: 40 },
  error: { padding: 16, color: "#dc2626" },
  scroll: { padding: 16, gap: 14 },
  desc: { opacity: 0.8 },
  video: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  textWrap: { minHeight: 80 },
  textWebview: { flex: 1, minHeight: 200, backgroundColor: "transparent" },
  notice: {
    opacity: 0.7,
    fontStyle: "italic",
    paddingVertical: 12,
  },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDone: { backgroundColor: "#16a34a" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
