import { useEffect, useState } from "react";
import { Brand } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { createNote, deleteNote, getNotes, type Note } from "@/lib/me";

const PURPLE = Brand.primary;

/** Notas del usuario para una lección concreta (listar + agregar + borrar). */
export function NotesSection({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getNotes({ courseId, lessonId })
      .then((n) => active && setNotes(n))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [courseId, lessonId]);

  async function add() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const note = await createNote(courseId, text.trim(), lessonId);
      setNotes((prev) => [note, ...prev]);
      setText("");
    } catch {
      // reintentar
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await deleteNote(id);
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Mis notas</ThemedText>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe una nota…"
          placeholderTextColor="#9ca3af"
          multiline
        />
        <TouchableOpacity style={styles.addBtn} onPress={add} disabled={saving || !text.trim()}>
          {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.addBtnText}>+</ThemedText>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={PURPLE} style={{ marginVertical: 8 }} />
      ) : (
        notes.map((n) => (
          <ThemedView key={n.id} style={styles.noteCard}>
            <ThemedText style={styles.noteText}>{n.content}</ThemedText>
            <TouchableOpacity onPress={() => remove(n.id)} hitSlop={8}>
              <ThemedText style={styles.delete}>Eliminar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  addRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 44,
    textAlignVertical: "top",
    color: "#111827",
    backgroundColor: "#fff",
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 24, fontWeight: "700", lineHeight: 28 },
  noteCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 12,
    gap: 6,
  },
  noteText: { fontSize: 15 },
  delete: { color: "#dc2626", fontSize: 13, fontWeight: "600" },
});
