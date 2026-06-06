import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { applyInstructor } from "@/lib/me";

const PURPLE = "#6d28d9";

export function BecomeInstructorView({ onBack }: { onBack: () => void }) {
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setError(null);
    if (headline.trim().length < 1 || bio.trim().length < 10 || reason.trim().length < 20) {
      setError("Completa todos los campos (la motivación necesita al menos 20 caracteres).");
      return;
    }
    setSaving(true);
    try {
      await applyInstructor({
        headline: headline.trim(),
        bio: bio.trim(),
        reason: reason.trim(),
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la solicitud.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Conviértete en instructor</ThemedText>
        <ThemedText style={styles.muted}>
          Comparte tu experiencia y cuéntanos por qué quieres enseñar en Cursumi.
        </ThemedText>

        {done ? (
          <ThemedView style={styles.successCard}>
            <ThemedText type="subtitle">¡Solicitud enviada!</ThemedText>
            <ThemedText style={styles.muted}>
              Nuestro equipo la revisará y te contactará pronto.
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.card}>
            <Field
              label="Titular profesional"
              value={headline}
              onChangeText={setHeadline}
              hint="Ej: Desarrollador web · 8 años de experiencia"
            />
            <Field label="Tu biografía" value={bio} onChangeText={setBio} multiline />
            <Field
              label="¿Por qué quieres enseñar?"
              value={reason}
              onChangeText={setReason}
              multiline
              hint="Al menos 20 caracteres."
            />
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
            <TouchableOpacity style={styles.button} onPress={submit} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Enviar solicitud</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#9ca3af"
      />
      {hint ? <ThemedText style={styles.hint}>{hint}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  scroll: { padding: 16, gap: 14 },
  muted: { opacity: 0.7 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 12,
  },
  successCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#16a34a",
    gap: 6,
    alignItems: "center",
  },
  field: { gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputMultiline: { minHeight: 90, textAlignVertical: "top" },
  hint: { fontSize: 12, opacity: 0.6 },
  error: { color: "#dc2626" },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
