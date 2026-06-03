import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_URL } from "@/lib/api";
import { getMyCourseDetail, type CourseDetail as Detail } from "@/lib/me";

const PURPLE = "#6d28d9";

const typeLabels: Record<string, string> = {
  video: "Video",
  text: "Lectura",
  quiz: "Quiz",
  assignment: "Tarea",
  section_quiz: "Examen",
  section_minigame: "Juego",
};

export function CourseDetail({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyCourseDetail(courseId)
      .then((d) => active && setDetail(d))
      .catch(() => active && setError("No se pudo cargar el curso."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [courseId]);

  const completed = new Set((detail?.lessonProgress ?? []).map((p) => p.lessonId));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : error || !detail ? (
        <ThemedText style={styles.error}>{error ?? "Curso no encontrado."}</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">{detail.course.title}</ThemedText>
          <ThemedText style={styles.meta}>
            {detail.course.instructor?.name ?? "Instructor"} · {Math.round(detail.progress)}% completado
          </ThemedText>

          <TouchableOpacity
            style={styles.openButton}
            onPress={() =>
              WebBrowser.openBrowserAsync(`${API_URL}/dashboard/my-courses/${courseId}`)
            }
          >
            <ThemedText style={styles.openButtonText}>Continuar en cursumi.com</ThemedText>
          </TouchableOpacity>

          {detail.course.sections.map((section) => (
            <ThemedView key={section.id} style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
              {section.lessons.map((lesson) => {
                const done = completed.has(lesson.id);
                return (
                  <View key={lesson.id} style={styles.lessonRow}>
                    <ThemedText style={[styles.check, done && styles.checkDone]}>
                      {done ? "✓" : "○"}
                    </ThemedText>
                    <ThemedText style={styles.lessonTitle} numberOfLines={2}>
                      {lesson.title}
                    </ThemedText>
                    {lesson.type && typeLabels[lesson.type] && (
                      <ThemedText style={styles.typeBadge}>{typeLabels[lesson.type]}</ThemedText>
                    )}
                  </View>
                );
              })}
            </ThemedView>
          ))}
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
  scroll: { padding: 16, gap: 12 },
  meta: { opacity: 0.7, fontSize: 13 },
  openButton: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 4,
  },
  openButtonText: { color: "#fff", fontWeight: "700" },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 16,
    gap: 10,
  },
  sectionTitle: { marginBottom: 2 },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  check: { fontSize: 16, color: "rgba(127,127,127,0.6)", width: 18 },
  checkDone: { color: "#16a34a" },
  lessonTitle: { flex: 1 },
  typeBadge: {
    fontSize: 11,
    opacity: 0.6,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
