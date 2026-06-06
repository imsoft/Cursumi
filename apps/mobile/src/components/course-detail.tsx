import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { LessonView } from "@/components/lesson-view";
import { ExamView } from "@/components/exam-view";
import { ReviewsSection } from "@/components/reviews-section";
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
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [extraCompleted, setExtraCompleted] = useState<Set<string>>(new Set());
  const [showExam, setShowExam] = useState(false);

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

  const completed = new Set([
    ...(detail?.lessonProgress ?? []).map((p) => p.lessonId),
    ...extraCompleted,
  ]);

  if (selectedLessonId) {
    return (
      <LessonView
        lessonId={selectedLessonId}
        onBack={() => setSelectedLessonId(null)}
        onCompleted={(id) => setExtraCompleted((prev) => new Set(prev).add(id))}
      />
    );
  }

  if (showExam) {
    return <ExamView courseId={courseId} onBack={() => setShowExam(false)} />;
  }

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

          {detail.course.sections.map((section) => (
            <ThemedView key={section.id} style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
              {section.lessons.map((lesson) => {
                const done = completed.has(lesson.id);
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.lessonRow}
                    activeOpacity={0.6}
                    onPress={() => setSelectedLessonId(lesson.id)}
                  >
                    <ThemedText style={[styles.check, done && styles.checkDone]}>
                      {done ? "✓" : "○"}
                    </ThemedText>
                    <ThemedText style={styles.lessonTitle} numberOfLines={2}>
                      {lesson.title}
                    </ThemedText>
                    {lesson.type && typeLabels[lesson.type] && (
                      <ThemedText style={styles.typeBadge}>{typeLabels[lesson.type]}</ThemedText>
                    )}
                    <ThemedText style={styles.chevron}>›</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          ))}

          {/* Examen final del curso */}
          <TouchableOpacity style={styles.examButton} onPress={() => setShowExam(true)}>
            <ThemedText style={styles.examButtonText}>Examen final 🎓</ThemedText>
          </TouchableOpacity>

          {/* Reseñas */}
          <ReviewsSection courseId={courseId} />
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
  chevron: { fontSize: 20, opacity: 0.4, marginLeft: 4 },
  examButton: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  examButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
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
