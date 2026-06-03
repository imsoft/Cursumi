import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getCourses, API_URL, type CourseSummary } from "@/lib/api";
import { formatPriceMXN } from "@cursumi/shared";

const PURPLE = "#6d28d9";

export default function CatalogScreen() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCourses(await getCourses());
    } catch {
      setError("No se pudieron cargar los cursos. Desliza para reintentar.");
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedText type="title" style={styles.heading}>
        Explorar
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />
          }
          ListEmptyComponent={
            <ThemedText style={styles.empty}>
              {error ?? "No hay cursos disponibles por ahora."}
            </ThemedText>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                WebBrowser.openBrowserAsync(`${API_URL}/courses/${item.slug ?? item.id}`)
              }
            >
              <ThemedView style={styles.card}>
                <ThemedText type="subtitle" numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.price}>{formatPriceMXN(item.price)}</ThemedText>
                <ThemedText style={styles.cta}>Ver e inscribirme →</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 6,
  },
  price: { color: PURPLE, fontWeight: "600" },
  cta: { fontSize: 13, opacity: 0.7 },
});
