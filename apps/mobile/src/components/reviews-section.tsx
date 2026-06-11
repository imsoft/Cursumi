import { useEffect, useState } from "react";
import { Brand, CardShadow} from "@/constants/theme";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getReviews, postReview, type Review } from "@/lib/me";

const PURPLE = Brand.primary;
const STAR = Brand.warning;

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <ThemedText style={{ color: STAR, fontSize: size }}>
      {"★".repeat(Math.round(value))}
      {"☆".repeat(Math.max(0, 5 - Math.round(value)))}
    </ThemedText>
  );
}

export function ReviewsSection({ courseId }: { courseId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function load() {
    try {
      const data = await getReviews(courseId);
      setReviews(data.reviews);
      setAverage(data.average);
      setTotal(data.total);
    } catch {
      // sección secundaria; si falla, queda vacía
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function submit() {
    if (rating < 1) {
      setError("Selecciona una calificación.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await postReview(courseId, rating, comment.trim() || undefined);
      setDone(true);
      setComment("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar tu reseña.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ActivityIndicator color={PURPLE} style={{ marginVertical: 12 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Reseñas</ThemedText>
        {total > 0 && (
          <View style={styles.avgRow}>
            <Stars value={average} />
            <ThemedText style={styles.muted}>
              {average.toFixed(1)} · {total}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Escribir reseña */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.label}>Tu reseña</ThemedText>
        <View style={styles.starPicker}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)} hitSlop={6}>
              <ThemedText style={[styles.pickStar, n <= rating && styles.pickStarOn]}>
                {n <= rating ? "★" : "☆"}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          multiline
          placeholder="Comparte tu opinión (opcional)"
          placeholderTextColor="#9ca3af"
        />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        {done && <ThemedText style={styles.success}>¡Gracias por tu reseña!</ThemedText>}
        <TouchableOpacity style={styles.button} onPress={submit} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Enviar reseña</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>

      {/* Lista */}
      {reviews.map((r) => (
        <ThemedView key={r.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <ThemedText style={styles.reviewName}>{r.user?.name ?? "Estudiante"}</ThemedText>
            <Stars value={r.rating} size={13} />
          </View>
          {r.comment ? <ThemedText style={styles.reviewComment}>{r.comment}</ThemedText> : null}
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avgRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  muted: { opacity: 0.7, fontSize: 13 },
  card: { ...CardShadow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 16,
    gap: 10,
  },
  label: { fontWeight: "600" },
  starPicker: { flexDirection: "row", gap: 6 },
  pickStar: { fontSize: 30, color: "rgba(127,127,127,0.5)" },
  pickStarOn: { color: STAR },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 70,
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
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 14,
    gap: 4,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewName: { fontWeight: "600" },
  reviewComment: { opacity: 0.85 },
});
