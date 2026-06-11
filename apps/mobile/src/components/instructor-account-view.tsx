import { useEffect, useState } from "react";
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
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  getInstructorProfile,
  getStripeStatus,
  startStripeConnect,
  updateInstructorProfile,
  type InstructorProfile,
} from "@/lib/me";

const PURPLE = Brand.primary;

export function InstructorAccountView({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [teachingYears, setTeachingYears] = useState("");

  const [stripe, setStripe] = useState<{ connected: boolean; onboarded: boolean } | null>(null);
  const [stripeBusy, setStripeBusy] = useState(false);

  async function load() {
    try {
      const [p, s] = await Promise.all([getInstructorProfile(), getStripeStatus().catch(() => null)]);
      setProfile(p);
      setHeadline(p.headline);
      setBio(p.bio);
      setSpecialties(p.specialties);
      setTeachingYears(p.teachingYears != null ? String(p.teachingYears) : "");
      setStripe(s);
    } catch {
      setError("No se pudo cargar tu perfil.");
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function save() {
    setError(null);
    setDone(false);
    setSaving(true);
    try {
      const years = parseInt(teachingYears, 10);
      await updateInstructorProfile({
        headline: headline.trim(),
        bio: bio.trim(),
        specialties: specialties.trim(),
        teachingYears: Number.isFinite(years) ? years : undefined,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function connectStripe() {
    setStripeBusy(true);
    try {
      const url = await startStripeConnect();
      await WebBrowser.openBrowserAsync(url);
      // Al volver, refrescar estado.
      setStripe(await getStripeStatus().catch(() => stripe));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir Stripe.");
    } finally {
      setStripeBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Perfil de instructor" onBack={onBack} />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Cobros con Stripe */}
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Cobros (Stripe)</ThemedText>
            <ThemedText style={styles.muted}>
              {stripe?.onboarded
                ? "Tu cuenta de cobros está conectada y activa."
                : stripe?.connected
                  ? "Conexión iniciada. Completa el onboarding para recibir pagos."
                  : "Conecta Stripe para recibir tus pagos."}
            </ThemedText>
            <TouchableOpacity style={styles.button} onPress={connectStripe} disabled={stripeBusy}>
              {stripeBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {stripe?.onboarded ? "Abrir panel de Stripe" : "Conectar Stripe"}
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* Datos del instructor */}
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Tu información</ThemedText>
            <Field label="Titular profesional" value={headline} onChangeText={setHeadline} />
            <Field label="Biografía" value={bio} onChangeText={setBio} multiline />
            <Field label="Especialidades" value={specialties} onChangeText={setSpecialties} />
            <Field
              label="Años enseñando"
              value={teachingYears}
              onChangeText={setTeachingYears}
              keyboard="number-pad"
            />
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
            {done && <ThemedText style={styles.success}>Guardado ✓</ThemedText>}
            <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Guardar</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          <ThemedText style={styles.note}>
            Nombre, correo y foto se editan en tu perfil general.
          </ThemedText>
        </ScrollView>
      )}
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
  keyboard?: "number-pad";
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
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  loader: { marginTop: 40 },
  scroll: { padding: 16, gap: 16 },
  card: { ...CardShadow,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 12,
  },
  muted: { opacity: 0.7 },
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
  error: { color: "#dc2626" },
  success: { color: "#16a34a" },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  note: { fontSize: 12, opacity: 0.6, textAlign: "center" },
});
