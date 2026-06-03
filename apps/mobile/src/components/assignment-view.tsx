import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  completeLesson,
  getAssignment,
  submitAssignment,
  type Lesson,
} from "@/lib/me";

const PURPLE = "#6d28d9";

export function AssignmentView({
  lesson,
  onCompleted,
}: {
  lesson: Lesson;
  onCompleted?: (lessonId: string) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAssignment(lesson.id, lesson.courseId)
      .then((sub) => {
        if (!active || !sub) return;
        setText(sub.content);
        setSavedAt(sub.submittedAt);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [lesson.id, lesson.courseId]);

  async function submit() {
    if (!text.trim()) {
      setError("Escribe tu respuesta antes de enviar.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await submitAssignment(lesson.id, lesson.courseId, text.trim());
      await completeLesson(lesson.id, lesson.courseId);
      setSavedAt(new Date().toISOString());
      onCompleted?.(lesson.id);
    } catch {
      setError("No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ActivityIndicator color={PURPLE} style={{ marginVertical: 16 }} />;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Tu respuesta</ThemedText>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        placeholderTextColor="#9ca3af"
      />
      {savedAt && (
        <ThemedText style={styles.saved}>
          Enviada · {new Date(savedAt).toLocaleDateString("es-MX")}
        </ThemedText>
      )}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <TouchableOpacity style={styles.button} onPress={submit} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>
            {savedAt ? "Actualizar respuesta" : "Enviar tarea"}
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 140,
    textAlignVertical: "top",
    color: "#111827",
    backgroundColor: "#fff",
  },
  saved: { fontSize: 12, color: "#16a34a" },
  error: { color: "#dc2626" },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
