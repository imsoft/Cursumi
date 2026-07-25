import { useEffect, useMemo, useRef, useState } from "react";
import { Brand } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { QuizAnswerInput } from "@/components/quiz-answer-input";
import {
  completeLesson,
  gradeQuizAnswer,
  parseQuizConfig,
  parseQuizQuestions,
  type Lesson,
  type QuizAnswer,
} from "@/lib/me";

function isAnswered(a: QuizAnswer | undefined): boolean {
  if (a === undefined) return false;
  if (Array.isArray(a)) return a.length > 0 && a.every((x) => x !== "" && x !== undefined);
  return true;
}

const PURPLE = Brand.primary;
const GREEN = Brand.success;
const RED = Brand.danger;

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuizView({
  lesson,
  onCompleted,
}: {
  lesson: Lesson;
  onCompleted?: (lessonId: string) => void;
}) {
  const questions = useMemo(() => parseQuizQuestions(lesson.content), [lesson.content]);
  const config = useMemo(() => parseQuizConfig(lesson.content), [lesson.content]);
  // answers[i] = respuesta (índice / índices / textos ordenados / parejas)
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePct, setScorePct] = useState(0);
  const [saving, setSaving] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    config.timeLimitMin > 0 ? config.timeLimitMin * 60 : null
  );
  const submitRef = useRef<() => void>(() => {});

  const passed = scorePct >= config.passingScore;
  const attemptsLeft =
    config.maxAttempts > 0 ? Math.max(0, config.maxAttempts - attemptCount) : null;
  const canRetake = !passed && (config.maxAttempts === 0 || attemptCount < config.maxAttempts);

  // Cuenta regresiva: al llegar a 0 envía automáticamente.
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      submitRef.current();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted]);

  function computeScore(): number {
    const correct = questions.reduce(
      (acc, q, i) => acc + (gradeQuizAnswer(q, answers[i]) ? 1 : 0),
      0,
    );
    return questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  }

  async function submit() {
    if (submitted) return;
    const pct = computeScore();
    setScorePct(pct);
    setSubmitted(true);
    setTimeLeft(null);
    setAttemptCount((n) => n + 1);
    setSaving(true);
    try {
      const toSave: Record<string, QuizAnswer> = {};
      questions.forEach((_, i) => {
        if (answers[i] !== undefined) toSave[String(i)] = answers[i];
      });
      await completeLesson(lesson.id, lesson.courseId, { score: pct, answers: toSave });
      onCompleted?.(lesson.id);
    } catch {
      // el puntaje ya se muestra; reintentar guardando con el botón nuevamente
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    submitRef.current = submit;
  });

  function retake() {
    setAnswers({});
    setSubmitted(false);
    setScorePct(0);
    setTimeLeft(config.timeLimitMin > 0 ? config.timeLimitMin * 60 : null);
  }

  const allAnswered = questions.every(
    (q, i) => q.type === "ordering" || isAnswered(answers[i]),
  );

  if (questions.length === 0) {
    return <ThemedText style={styles.notice}>Este quiz no tiene preguntas.</ThemedText>;
  }

  return (
    <View style={styles.container}>
      {/* Temporizador */}
      {timeLeft !== null && !submitted && (
        <ThemedView
          style={[styles.timer, { borderColor: timeLeft <= 30 ? RED : "rgba(127,127,127,0.3)" }]}
        >
          <ThemedText style={[styles.timerText, timeLeft <= 30 && { color: RED }]}>
            ⏱ {mmss(timeLeft)}
          </ThemedText>
        </ThemedView>
      )}

      {submitted && (
        <ThemedView style={[styles.resultCard, { borderColor: passed ? GREEN : RED }]}>
          <ThemedText type="subtitle">Tu resultado: {scorePct}%</ThemedText>
          <ThemedText style={styles.muted}>
            {passed
              ? "¡Aprobado!"
              : `No alcanzaste el ${config.passingScore}% mínimo.`}
          </ThemedText>
          {attemptsLeft !== null && !passed && (
            <ThemedText style={styles.muted}>
              {attemptsLeft > 0
                ? `Intentos restantes: ${attemptsLeft}`
                : "Sin intentos restantes."}
            </ThemedText>
          )}
        </ThemedView>
      )}

      {questions.map((q, qi) => {
        const graded = submitted ? gradeQuizAnswer(q, answers[qi]) : null;
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

      {!submitted ? (
        <TouchableOpacity
          style={[styles.button, !allAnswered && styles.buttonDisabled]}
          onPress={submit}
          disabled={!allAnswered}
        >
          <ThemedText style={styles.buttonText}>Enviar respuestas</ThemedText>
        </TouchableOpacity>
      ) : saving ? (
        <ActivityIndicator color={PURPLE} />
      ) : canRetake ? (
        <TouchableOpacity style={[styles.button, styles.buttonGhost]} onPress={retake}>
          <ThemedText style={styles.buttonGhostText}>Reintentar</ThemedText>
        </TouchableOpacity>
      ) : (
        <ThemedText style={[styles.muted, { textAlign: "center" }]}>
          Respuestas guardadas ✓
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  timer: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  timerText: { fontWeight: "700", fontSize: 15 },
  resultCard: { borderWidth: 2, borderRadius: 16, padding: 16, gap: 4, alignItems: "center" },
  muted: { opacity: 0.7 },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 16,
    gap: 8,
  },
  questionText: { fontWeight: "600", fontSize: 16 },
  badge: { fontWeight: "700", fontSize: 13, marginTop: 2 },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: PURPLE },
  buttonGhostText: { color: PURPLE, fontWeight: "700" },
  notice: { opacity: 0.7, fontStyle: "italic", paddingVertical: 12 },
});
