import { useMemo, useState } from "react";
import { Brand } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { parseSectionQuiz, submitSectionQuiz, type Lesson } from "@/lib/me";

const PURPLE = Brand.primary;
const GREEN = Brand.success;
const RED = Brand.danger;

export function SectionQuizView({
  lesson,
  onCompleted,
}: {
  lesson: Lesson;
  onCompleted?: (lessonId: string) => void;
}) {
  const questions = useMemo(() => parseSectionQuiz(lesson.sectionQuiz), [lesson.sectionQuiz]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  async function submit() {
    if (!lesson.sectionId) {
      setError("No se pudo identificar la sección.");
      return;
    }
    setSubmitted(true);
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, number> = {};
      questions.forEach((_, i) => {
        if (answers[i] !== undefined) payload[String(i)] = answers[i];
      });
      const res = await submitSectionQuiz(lesson.sectionId, lesson.courseId, payload);
      setResult(res);
      onCompleted?.(lesson.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar.");
      setSubmitted(false);
    } finally {
      setSaving(false);
    }
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  }

  if (questions.length === 0) {
    return <ThemedText style={styles.notice}>Esta actividad no tiene preguntas.</ThemedText>;
  }

  return (
    <View style={styles.container}>
      {result && (
        <ThemedView style={[styles.resultCard, { borderColor: result.passed ? GREEN : RED }]}>
          <ThemedText type="subtitle">Resultado: {result.score}%</ThemedText>
          <ThemedText style={styles.muted}>
            {result.passed ? "¡Aprobado!" : "Inténtalo de nuevo."}
          </ThemedText>
        </ThemedView>
      )}

      {questions.map((q, qi) => (
        <ThemedView key={qi} style={styles.questionCard}>
          <ThemedText style={styles.questionText}>
            {qi + 1}. {q.question}
          </ThemedText>
          {q.options.map((opt, oi) => {
            const selected = answers[qi] === oi;
            const showCorrect = submitted && q.correct === oi;
            const showWrong = submitted && selected && q.correct !== oi;
            return (
              <TouchableOpacity
                key={oi}
                style={[
                  styles.option,
                  selected && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
                activeOpacity={0.7}
                onPress={() => !submitted && setAnswers((p) => ({ ...p, [qi]: oi }))}
                disabled={submitted}
              >
                <ThemedText style={styles.optionText}>{opt}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      ))}

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      {!submitted ? (
        <TouchableOpacity
          style={[styles.button, !allAnswered && styles.buttonDisabled]}
          onPress={submit}
          disabled={!allAnswered}
        >
          <ThemedText style={styles.buttonText}>Enviar</ThemedText>
        </TouchableOpacity>
      ) : saving ? (
        <ActivityIndicator color={PURPLE} />
      ) : result && !result.passed ? (
        <TouchableOpacity style={[styles.button, styles.buttonGhost]} onPress={retake}>
          <ThemedText style={styles.buttonGhostText}>Reintentar</ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  muted: { opacity: 0.7 },
  resultCard: { borderWidth: 2, borderRadius: 16, padding: 16, gap: 4, alignItems: "center" },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 16,
    gap: 8,
  },
  questionText: { fontWeight: "600", fontSize: 16 },
  option: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionSelected: { borderColor: PURPLE, backgroundColor: "rgba(109,40,217,0.08)" },
  optionCorrect: { borderColor: GREEN, backgroundColor: "rgba(22,163,74,0.1)" },
  optionWrong: { borderColor: RED, backgroundColor: "rgba(220,38,38,0.08)" },
  optionText: { fontSize: 15 },
  error: { color: RED },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: PURPLE },
  buttonGhostText: { color: PURPLE, fontWeight: "700" },
  notice: { opacity: 0.7, fontStyle: "italic", paddingVertical: 12 },
});
