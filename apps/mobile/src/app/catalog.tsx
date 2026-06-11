import { useCallback, useEffect, useState } from "react";
import { Brand, BrandGradient } from "@/constants/theme";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getCourses, API_URL, type CourseSummary } from "@/lib/api";
import { getWishlist, toggleWishlist } from "@/lib/me";
import { formatPriceMXN } from "@cursumi/shared";

const PURPLE = Brand.primary;

export default function CatalogScreen() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, wishlist] = await Promise.all([
        getCourses(),
        getWishlist().catch(() => [] as string[]),
      ]);
      setCourses(list);
      setSaved(new Set(wishlist));
    } catch {
      setError("No se pudieron cargar los cursos. Desliza para reintentar.");
    }
  }, []);

  async function toggleSaved(courseId: string) {
    // Optimista
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
    try {
      await toggleWishlist(courseId);
    } catch {
      // revertir si falla
      setSaved((prev) => {
        const next = new Set(prev);
        if (next.has(courseId)) next.delete(courseId);
        else next.add(courseId);
        return next;
      });
    }
  }

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
      <LinearGradient
        colors={BrandGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <ThemedText type="title" style={styles.headerTitle}>
          Explorar
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Descubre cursos de instructores expertos
        </ThemedText>
      </LinearGradient>

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
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
                ) : null}
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="subtitle" numberOfLines={2} style={styles.cardTitle}>
                      {item.title}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => toggleSaved(item.id)}
                      hitSlop={10}
                      style={styles.heart}
                    >
                      <ThemedText style={[styles.heartIcon, saved.has(item.id) && styles.heartActive]}>
                        {saved.has(item.id) ? "♥" : "♡"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.price}>{formatPriceMXN(item.price)}</ThemedText>
                  <ThemedText style={styles.cta}>Ver detalles →</ThemedText>
                </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 4,
  },
  headerTitle: { color: Brand.onBrand, fontWeight: "800" },
  headerSubtitle: { color: Brand.onBrand, opacity: 0.85, fontSize: 14 },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    overflow: "hidden",
  },
  thumb: { width: "100%", height: 150, backgroundColor: "rgba(127,127,127,0.1)" },
  cardBody: { padding: 16, gap: 6 },
  price: { color: PURPLE, fontWeight: "600" },
  cta: { fontSize: 13, opacity: 0.7 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardTitle: { flex: 1 },
  heart: { padding: 2 },
  heartIcon: { fontSize: 22, color: "rgba(127,127,127,0.6)" },
  heartActive: { color: "#dc2626" },
});

