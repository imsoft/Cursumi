import { useMemo, useState } from "react";
import { Brand } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { QuizAnswerInput } from "@/components/quiz-answer-input";
import {
  gradeQuizAnswer,
  parseSectionQuiz,
  submitSectionQuiz,
  type Lesson,
  type QuizAnswer,
} from "@/lib/me";

const PURPLE = Brand.primary;
const GREEN = Brand.success;
const RED = Brand.danger;

function isAnswered(a: QuizAnswer | undefined): boolean {
  if (a === undefined) return false;
  if (Array.isArray(a)) return a.length > 0 && a.every((x) => x !== "" && x !== undefined);
  return true;
}

export function SectionQuizView({
  lesson,
  onCompleted,
}: {
  lesson: Lesson;
  onCompleted?: (lessonId: string) => void;
}) {
  const questions = useMemo(() => parseSectionQuiz(lesson.sectionQuiz), [lesson.sectionQuiz]);
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "ordenar" cuenta como respondida en cuanto se monta (el orden visible es la respuesta).
  const allAnswered = questions.every(
    (q, i) => q.type === "ordering" || isAnswered(answers[i]),
  );

  async function submit() {
    if (!lesson.sectionId) {
      setError("No se pudo identificar la sección.");
      return;
    }
    setSubmitted(true);
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, QuizAnswer> = {};
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

      {questions.map((q, qi) => {
        const graded = submitted
          ? gradeQuizAnswer(
              {
                type: q.type,
                options: q.options,
                correctAnswer: q.correct,
                correctAnswers: q.correctAnswers,
                matchRight: q.matchRight,
              },
              answers[qi],
            )
          : null;
        return (
          <ThemedView key={qi} style={styles.questionCard}>
            <ThemedText style={styles.questionText}>
              {qi + 1}. {q.question}
            </ThemedText>
            <QuizAnswerInput
              question={{ type: q.type, options: q.options, matchRight: q.matchRight }}
              value={answers[qi]}
              disabled={submitted}
              onChange={(a) => setAnswers((p) => ({ ...p, [qi]: a }))}
            />
            {graded !== null && (
              <ThemedText style={[styles.badge, { color: graded ? GREEN : RED }]}>
                {graded ? "✓ Correcto" : "✗ Incorrecto"}
              </ThemedText>
            )}
          </ThemedView>
        );
      })}

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
  badge: { fontWeight: "700", fontSize: 13, marginTop: 2 },
  error: { color: RED },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: PURPLE },
  buttonGhostText: { color: PURPLE, fontWeight: "700" },
  notice: { opacity: 0.7, fontStyle: "italic", paddingVertical: 12 },
});
