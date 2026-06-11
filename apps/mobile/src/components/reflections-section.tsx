import { useEffect, useState } from "react";
import { Brand, CardShadow} from "@/constants/theme";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getReflections, postReflection, type Reflection } from "@/lib/me";

const PURPLE = Brand.primary;

export function ReflectionsSection({ courseId }: { courseId: string }) {
  const [items, setItems] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function load() {
    try {
      setItems(await getReflections(courseId));
    } catch {
      // sección secundaria
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function submit() {
    if (text.trim().length < 10) {
      setError("Escribe al menos 10 caracteres.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await postReflection(courseId, text.trim());
      setDone(true);
      setText("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ActivityIndicator color={PURPLE} style={{ marginVertical: 12 }} />;

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">¿Qué aprendiste?</ThemedText>
      <ThemedView style={styles.card}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Comparte lo que te llevas de este curso…"
          placeholderTextColor="#9ca3af"
        />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        {done && <ThemedText style={styles.success}>¡Gracias por compartir!</ThemedText>}
        <TouchableOpacity style={styles.button} onPress={submit} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Compartir</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>

      {items.map((r) => (
        <ThemedView key={r.id} style={styles.reflectionCard}>
          <ThemedText style={styles.name}>{r.user?.name ?? "Estudiante"}</ThemedText>
          <ThemedText style={styles.content}>{r.content}</ThemedText>
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: { ...CardShadow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 16,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    color: "#111827",
    backgroundColor: "#fff",
  },
  error: { color: "#dc2626" },
  success: { color: "#16a34a" },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  reflectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 14,
    gap: 4,
  },
  name: { fontWeight: "600", fontSize: 13, opacity: 0.8 },
  content: { fontSize: 15 },
});
