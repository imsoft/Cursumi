import { useState } from "react";
import { ScreenHeader } from "@/components/screen-header";
import { Brand, CardShadow} from "@/constants/theme";
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
import { authClient } from "@/lib/auth";

const PURPLE = Brand.primary;

export function SettingsView({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setError(null);
    setDone(false);
    if (next.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    try {
      const { error: authError } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (authError) {
        setError("No se pudo cambiar la contraseña. Verifica tu contraseña actual.");
        return;
      }
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Configuración" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Cambiar contraseña</ThemedText>

          <Field label="Contraseña actual" value={current} onChangeText={setCurrent} />
          <Field label="Nueva contraseña" value={next} onChangeText={setNext} hint="Mínimo 8 caracteres." />
          <Field label="Confirmar nueva contraseña" value={confirm} onChangeText={setConfirm} />

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}
          {done && <ThemedText style={styles.success}>Contraseña actualizada ✓</ThemedText>}

          <TouchableOpacity
            style={[styles.button, (saving || !current || !next || !confirm) && styles.buttonDisabled]}
            onPress={submit}
            disabled={saving || !current || !next || !confirm}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Actualizar contraseña</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
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
  scroll: { padding: 16, gap: 16 },
  card: { ...CardShadow,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 12,
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
  hint: { fontSize: 12, opacity: 0.6 },
  error: { color: "#dc2626" },
  success: { color: "#16a34a" },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
