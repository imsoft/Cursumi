import { useState } from "react";
import { Brand } from "@/constants/theme";
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
import { submitQuoteRequest } from "@/lib/me";

const PURPLE = Brand.primary;
const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const BENEFITS = [
  "Capacita a todo tu equipo con el catálogo de Cursumi",
  "Métricas de avance y certificados por empleado",
  "Equipos, asignación de cursos y materiales internos",
  "Precio a la medida según tu empresa",
];

export function BusinessView({ onBack }: { onBack: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [interests, setInterests] = useState("");
  const [message, setMessage] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setError(null);
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError("Empresa, nombre y correo son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await submitQuoteRequest({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || null,
        companySize: companySize || null,
        interests: interests.trim() || null,
        message: message.trim() || null,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar tu solicitud.");
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
        <ThemedView style={styles.hero}>
          <ThemedText style={styles.heroTitle}>Cursumi Business</ThemedText>
          <ThemedText style={styles.heroSub}>
            Capacitación para tu equipo, con precio a la medida.
          </ThemedText>
        </ThemedView>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b} style={styles.benefitRow}>
              <ThemedText style={styles.check}>✓</ThemedText>
              <ThemedText style={styles.benefitText}>{b}</ThemedText>
            </View>
          ))}
        </View>

        {done ? (
          <ThemedView style={styles.successCard}>
            <ThemedText type="subtitle">¡Solicitud enviada!</ThemedText>
            <ThemedText style={styles.muted}>
              Nuestro equipo te contactará pronto con una cotización a la medida.
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Solicita tu cotización</ThemedText>
            <Field label="Empresa" value={companyName} onChangeText={setCompanyName} />
            <Field label="Tu nombre" value={contactName} onChangeText={setContactName} />
            <Field label="Correo" value={contactEmail} onChangeText={setContactEmail} keyboard="email-address" />
            <Field label="Teléfono (opcional)" value={contactPhone} onChangeText={setContactPhone} keyboard="phone-pad" />

            <View style={styles.field}>
              <ThemedText style={styles.fieldLabel}>Tamaño de la empresa</ThemedText>
              <View style={styles.sizes}>
                {SIZES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizeChip, companySize === s && styles.sizeChipOn]}
                    onPress={() => setCompanySize(s)}
                  >
                    <ThemedText style={[styles.sizeText, companySize === s && styles.sizeTextOn]}>{s}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Field label="¿Cuántos cursos te interesan?" value={interests} onChangeText={setInterests} />
            <Field label="Mensaje (opcional)" value={message} onChangeText={setMessage} multiline />

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
  keyboard,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboard?: "email-address" | "phone-pad";
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboard}
        autoCapitalize={keyboard === "email-address" ? "none" : "sentences"}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  scroll: { padding: 16, gap: 16 },
  hero: { backgroundColor: "#4f00f6", borderRadius: 16, padding: 24, gap: 6 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  heroSub: { color: "rgba(255,255,255,0.85)" },
  benefits: { gap: 8 },
  benefitRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  check: { color: "#16a34a", fontWeight: "800" },
  benefitText: { flex: 1, opacity: 0.85 },
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
  muted: { opacity: 0.7, textAlign: "center" },
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
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  sizes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sizeChip: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sizeChipOn: { backgroundColor: PURPLE, borderColor: PURPLE },
  sizeText: { fontSize: 13, fontWeight: "600" },
  sizeTextOn: { color: "#fff" },
  error: { color: "#dc2626" },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
