import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  createInstructorCourse,
  getCategories,
  getMuxPlayback,
  requestMuxUpload,
  uploadVideoToMux,
  type NewLesson,
  type NewSection,
} from "@/lib/me";

const PURPLE = "#6d28d9";
const LEVELS = ["Principiante", "Intermedio", "Avanzado"];
const MODALITIES: { v: "virtual" | "presencial" | "live"; l: string }[] = [
  { v: "virtual", l: "Virtual" },
  { v: "presencial", l: "Presencial" },
  { v: "live", l: "En vivo" },
];

let idc = 0;
const uid = (p: string) => `${p}${Date.now()}${idc++}`;

export function CourseCreatorView({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Principiante");
  const [modality, setModality] = useState<"virtual" | "presencial" | "live">("virtual");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sections, setSections] = useState<NewSection[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  function addSection() {
    setSections((s) => [...s, { id: uid("s"), title: "", order: s.length, lessons: [] }]);
  }
  function setSectionTitle(si: number, t: string) {
    setSections((s) => s.map((sec, i) => (i === si ? { ...sec, title: t } : sec)));
  }
  function addLesson(si: number) {
    setSections((s) =>
      s.map((sec, i) =>
        i === si
          ? {
              ...sec,
              lessons: [
                ...sec.lessons,
                { id: uid("l"), title: "", type: "text", order: sec.lessons.length },
              ],
            }
          : sec
      )
    );
  }
  function patchLesson(si: number, li: number, patch: Partial<NewLesson>) {
    setSections((s) =>
      s.map((sec, i) =>
        i === si
          ? { ...sec, lessons: sec.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) }
          : sec
      )
    );
  }

  async function uploadVideo(si: number, li: number, lesson: NewLesson) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], quality: 1 });
    if (result.canceled || !result.assets[0]?.uri) return;
    setUploading(lesson.id);
    setError(null);
    try {
      const { uploadId, uploadUrl } = await requestMuxUpload(lesson.title || "Lección");
      await uploadVideoToMux(uploadUrl, result.assets[0].uri);
      // Mux procesa el asset; reintentar el playback unas veces.
      let playbackUrl: string | undefined;
      for (let i = 0; i < 12 && !playbackUrl; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const pb = await getMuxPlayback(uploadId);
        playbackUrl = pb.playbackUrl;
      }
      if (playbackUrl) {
        patchLesson(si, li, { videoUrl: playbackUrl });
      } else {
        setError("El video se subió pero Mux aún lo procesa. Reintenta el playback en un momento.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el video.");
    } finally {
      setUploading(null);
    }
  }

  async function submit() {
    setError(null);
    const p = parseInt(price, 10);
    if (!title.trim() || !description.trim() || !category || !Number.isFinite(p)) {
      setError("Completa título, descripción, categoría y precio.");
      return;
    }
    setSaving(true);
    try {
      await createInstructorCourse({
        title: title.trim(),
        description: description.trim(),
        category,
        level,
        modality,
        price: Math.max(0, p),
        imageUrl: imageUrl.trim() || undefined,
        sections: sections
          .filter((s) => s.title.trim())
          .map((s, si) => ({
            ...s,
            title: s.title.trim(),
            order: si,
            lessons: s.lessons
              .filter((l) => l.title.trim())
              .map((l, li) => ({ ...l, title: l.title.trim(), order: li })),
          })),
        isDraft: true,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el curso.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <ThemedText type="title">¡Curso creado! 🎉</ThemedText>
          <ThemedText style={styles.muted}>
            Se guardó como borrador. Publícalo desde Panel → Cursos.
          </ThemedText>
          <TouchableOpacity style={styles.button} onPress={onBack}>
            <ThemedText style={styles.buttonText}>Listo</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Crear curso</ThemedText>

        <Field label="Título" value={title} onChangeText={setTitle} />
        <Field label="Descripción" value={description} onChangeText={setDescription} multiline />

        <ThemedText style={styles.label}>Categoría</ThemedText>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Chip key={c.slug} label={c.name} on={category === c.name} onPress={() => setCategory(c.name)} />
          ))}
          {categories.length === 0 && <ThemedText style={styles.muted}>Cargando categorías…</ThemedText>}
        </View>

        <ThemedText style={styles.label}>Nivel</ThemedText>
        <View style={styles.chips}>
          {LEVELS.map((l) => (
            <Chip key={l} label={l} on={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>

        <ThemedText style={styles.label}>Modalidad</ThemedText>
        <View style={styles.chips}>
          {MODALITIES.map((m) => (
            <Chip key={m.v} label={m.l} on={modality === m.v} onPress={() => setModality(m.v)} />
          ))}
        </View>

        <Field label="Precio (MXN, en centavos)" value={price} onChangeText={setPrice} keyboard="number-pad" hint="Ej: 49900 = $499.00" />
        <Field label="URL de imagen de portada (opcional)" value={imageUrl} onChangeText={setImageUrl} />

        {/* Secciones */}
        <ThemedText type="subtitle" style={{ marginTop: 8 }}>Temario</ThemedText>
        {sections.map((sec, si) => (
          <ThemedView key={sec.id} style={styles.secCard}>
            <Field label={`Sección ${si + 1}`} value={sec.title} onChangeText={(t) => setSectionTitle(si, t)} />
            {sec.lessons.map((l, li) => (
              <View key={l.id} style={styles.lessonBox}>
                <Field label={`Lección ${li + 1}`} value={l.title} onChangeText={(t) => patchLesson(si, li, { title: t })} />
                <View style={styles.chips}>
                  <Chip label="Texto" on={l.type === "text"} onPress={() => patchLesson(si, li, { type: "text" })} />
                  <Chip label="Video" on={l.type === "video"} onPress={() => patchLesson(si, li, { type: "video" })} />
                </View>
                {l.type === "text" ? (
                  <Field label="Contenido" value={l.content ?? ""} onChangeText={(t) => patchLesson(si, li, { content: t })} multiline />
                ) : (
                  <>
                    <Field label="URL de video (Mux/YouTube)" value={l.videoUrl ?? ""} onChangeText={(t) => patchLesson(si, li, { videoUrl: t })} />
                    <TouchableOpacity
                      style={[styles.button, styles.ghost]}
                      onPress={() => uploadVideo(si, li, l)}
                      disabled={uploading === l.id}
                    >
                      {uploading === l.id ? (
                        <ActivityIndicator color={PURPLE} />
                      ) : (
                        <ThemedText style={styles.ghostText}>
                          {l.videoUrl ? "Video subido ✓ · Reemplazar" : "Subir video del dispositivo"}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
            <TouchableOpacity style={[styles.button, styles.ghost]} onPress={() => addLesson(si)}>
              <ThemedText style={styles.ghostText}>+ Lección</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
        <TouchableOpacity style={[styles.button, styles.ghost]} onPress={addSection}>
          <ThemedText style={styles.ghostText}>+ Sección</ThemedText>
        </TouchableOpacity>

        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <TouchableOpacity style={styles.button} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Crear curso (borrador)</ThemedText>}
        </TouchableOpacity>
        <ThemedText style={styles.note}>
          Quizzes, minijuegos y examen final se editan en la web.
        </ThemedText>
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
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboard?: "number-pad";
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboard}
        placeholderTextColor="#9ca3af"
      />
      {hint ? <ThemedText style={styles.hint}>{hint}</ThemedText> : null}
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, on && styles.chipOn]} onPress={onPress}>
      <ThemedText style={[styles.chipText, on && styles.chipTextOn]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  scroll: { padding: 16, gap: 12 },
  muted: { opacity: 0.7, textAlign: "center" },
  field: { gap: 4 },
  label: { fontSize: 13, fontWeight: "600" },
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
  hint: { fontSize: 12, opacity: 0.6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextOn: { color: "#fff" },
  secCard: { borderRadius: 14, borderWidth: 1, borderColor: "rgba(127,127,127,0.2)", padding: 14, gap: 10 },
  lessonBox: { borderTopWidth: 1, borderTopColor: "rgba(127,127,127,0.15)", paddingTop: 10, gap: 8 },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: PURPLE },
  ghostText: { color: PURPLE, fontWeight: "700" },
  error: { color: "#dc2626" },
  note: { fontSize: 12, opacity: 0.6, textAlign: "center" },
});
