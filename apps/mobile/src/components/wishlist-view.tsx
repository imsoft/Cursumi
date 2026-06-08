import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getCourses, type CourseSummary } from "@/lib/api";
import { getWishlist, toggleWishlist } from "@/lib/me";
import { formatPriceMXN } from "@cursumi/shared";

const PURPLE = "#6d28d9";

export function WishlistView({ onBack }: { onBack: () => void }) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getWishlist(), getCourses()])
      .then(([ids, all]) => {
        if (!active) return;
        const set = new Set(ids);
        setCourses(all.filter((c) => set.has(c.id)));
      })
      .catch(() => active && setError("No se pudo cargar tu lista de deseos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function remove(courseId: string) {
    setRemoving(courseId);
    try {
      await toggleWishlist(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {
      // dejar el item; el usuario puede reintentar
    } finally {
      setRemoving(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="title" style={styles.heading}>
        Lista de deseos
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>
              {error ?? "Tu lista de deseos está vacía. Guarda cursos desde Explorar."}
            </ThemedText>
          }
          renderItem={({ item }) => (
            <ThemedView style={styles.card}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
              ) : null}
              <View style={styles.cardBody}>
                <ThemedText type="subtitle" numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.price}>{formatPriceMXN(item.price)}</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => remove(item.id)}
                disabled={removing === item.id}
              >
                {removing === item.id ? (
                  <ActivityIndicator color="#dc2626" />
                ) : (
                  <ThemedText style={styles.removeText}>Quitar</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 12,
  },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: "rgba(127,127,127,0.1)" },
  cardBody: { flex: 1, gap: 4 },
  price: { color: PURPLE, fontWeight: "600" },
  removeBtn: {
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  removeText: { color: "#dc2626", fontWeight: "600" },
});
