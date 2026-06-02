import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getCourses, type CourseSummary } from "@/lib/api";
import { formatPriceMXN } from "@cursumi/shared";

export default function CoursesScreen() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCourses()
      .then((data) => active && setCourses(data))
      .catch((e) => active && setError(e instanceof Error ? e.message : "Error"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedText type="title" style={styles.heading}>
        Cursos
      </ThemedText>

      {loading && <ActivityIndicator style={styles.loader} />}

      {error && (
        <ThemedText style={styles.error}>
          No se pudieron cargar los cursos: {error}
        </ThemedText>
      )}

      {!loading && !error && (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<ThemedText>No hay cursos disponibles.</ThemedText>}
          renderItem={({ item }) => (
            <ThemedView style={styles.card}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={styles.price}>{formatPriceMXN(item.price)}</ThemedText>
            </ThemedView>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  loader: { marginTop: 32 },
  error: { paddingHorizontal: 16, color: "#dc2626" },
  list: { padding: 16, gap: 12 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 6,
  },
  price: { color: "#6d28d9", fontWeight: "600" },
});
