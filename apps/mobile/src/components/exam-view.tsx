import { useEffect, useRef, useState } from "react";
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
import { getExam, submitExam, type Exam, type ExamResult } from "@/lib/me";

const PURPLE = "#6d28d9";
const GREEN = "#16a34a";
const RED = "#dc2626";

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExamView({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    let active = true;
    getExam(courseId)
      .then((e) => {
        if (!active) return;
        if (!e) {
          setError("Este curso no tiene examen final.");
          return;
        }
        setExam(e);
        if (e.timeLimit && e.timeLimit > 0) setTimeLeft(e.timeLimit * 60);
      })
      .catch(() => active && setError("No se pudo cargar el examen."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [courseId]);

  // Temporizador opcional.
  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      submitRef.current();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result]);

  async function submit() {
    if (!exam || result) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitExam(courseId, answers);
      setResult(res);
      setTimeLeft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el examen.");
    } finally {
      setSubmitting(false);
    }
  }
  submitRef.current = submit;

  // Solo cuentan las preguntas con opciones (auto-calificables).
  const gradable = exam?.questions.filter((q) => (q.options?.length ?? 0) > 0) ?? [];
  const allAnswered = gradable.every((q) => answers[q.id] !== undefined);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
        {timeLeft !== null && !result && (
          <ThemedText style={[styles.timer, timeLeft <= 30 && { color: RED }]}>
            ⏱ {mmss(timeLeft)}
          </ThemedText>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : error && !exam ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : exam ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">Examen final</ThemedText>
          <ThemedText style={styles.muted}>
            Necesitas {exam.passingScore}% para aprobar.
          </ThemedText>

          {result && (
            <ThemedView style={[styles.resultCard, { borderColor: result.passed ? GREEN : RED }]}>
              <ThemedText type="subtitle">Tu resultado: {result.score}%</ThemedText>
              <ThemedText style={styles.muted}>
                {result.passed ? "¡Aprobado!" : "No alcanzaste el mínimo."}
              </ThemedText>
              {result.passed && result.certificate && (
                <ThemedText style={styles.certText}>
                  🎓 Certificado emitido · Folio {result.certificate.number}
                </ThemedText>
              )}
            </ThemedView>
          )}

          {exam.questions.map((q, qi) => {
            const hasOptions = (q.options?.length ?? 0) > 0;
            return (
              <ThemedView key={q.id} style={styles.questionCard}>
                <ThemedText style={styles.questionText}>
                  {qi + 1}. {q.question}
                </ThemedText>
                {hasOptions ? (
                  q.options!.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <TouchableOpacity
                        key={oi}
                        style={[styles.option, selected && styles.optionSelected]}
                        activeOpacity={0.7}
                        onPress={() => !result && setAnswers((p) => ({ ...p, [q.id]: oi }))}
                        disabled={!!result}
                      >
                        <ThemedText>{opt}</ThemedText>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <ThemedText style={styles.hint}>
                    Pregunta abierta — se evalúa manualmente.
                  </ThemedText>
                )}
              </ThemedView>
            );
          })}

          {error && exam && <ThemedText style={styles.error}>{error}</ThemedText>}

          {!result && (
            <TouchableOpacity
              style={[styles.button, (!allAnswered || submitting) && styles.buttonDisabled]}
              onPress={submit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Enviar examen</ThemedText>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  timer: { fontWeight: "700", fontSize: 15 },
  loader: { marginTop: 40 },
  error: { padding: 16, color: RED },
  scroll: { padding: 16, gap: 14 },
  muted: { opacity: 0.7 },
  resultCard: { borderWidth: 2, borderRadius: 16, padding: 16, gap: 4, alignItems: "center" },
  certText: { color: GREEN, fontWeight: "600", marginTop: 4 },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 16,
    gap: 8,
  },
  questionText: { fontWeight: "600", fontSize: 16 },
  hint: { fontSize: 12, opacity: 0.6, fontStyle: "italic" },
  option: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionSelected: { borderColor: PURPLE, backgroundColor: "rgba(109,40,217,0.08)" },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
