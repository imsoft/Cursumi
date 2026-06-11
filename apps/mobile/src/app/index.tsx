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

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CourseDetail } from "@/components/course-detail";
import { getMyCourses, type StudentCourse } from "@/lib/me";

const PURPLE = Brand.primary;

function categoryLabel(category: StudentCourse["category"]): string | null {
  if (!category) return null;
  if (typeof category === "string") return category;
  return category.name ?? null;
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={styles.progressOuter}>
      <View style={[styles.progressInner, { width: `${pct}%` }]} />
    </View>
  );
}

export default function MyCoursesScreen() {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getMyCourses();
      setCourses(data);
    } catch {
      setError("No se pudieron cargar tus cursos. Desliza para reintentar.");
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

  if (selectedId) {
    return <CourseDetail courseId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={BrandGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <ThemedText type="title" style={styles.headerTitle}>
          Mis cursos
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Continúa donde lo dejaste
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
            <ThemedView style={styles.empty}>
              <ThemedText type="subtitle">Aún no tienes cursos</ThemedText>
              <ThemedText style={styles.emptyText}>
                {error ?? "Cuando te inscribas a un curso aparecerá aquí."}
              </ThemedText>
            </ThemedView>
          }
          renderItem={({ item }) => {
            const cat = categoryLabel(item.category);
            return (
              <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedId(item.id)}>
              <ThemedView style={styles.card}>
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <ThemedText type="subtitle" numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.meta}>
                    {item.instructorName}
                    {cat ? ` · ${cat}` : ""}
                  </ThemedText>
                  <ProgressBar value={item.progress} />
                  <ThemedText style={styles.progressLabel}>
                    {item.status === "completed"
                      ? "Completado"
                      : `${Math.round(item.progress)}% completado`}
                  </ThemedText>
                </View>
              </ThemedView>
              </TouchableOpacity>
            );
          }}
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    overflow: "hidden",
  },
  thumb: { width: "100%", height: 140, backgroundColor: "rgba(127,127,127,0.1)" },
  cardBody: { padding: 16, gap: 8 },
  meta: { opacity: 0.7, fontSize: 13 },
  progressOuter: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(127,127,127,0.2)",
    overflow: "hidden",
    marginTop: 2,
  },
  progressInner: { height: 8, borderRadius: 4, backgroundColor: PURPLE },
  progressLabel: { fontSize: 12, opacity: 0.7 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 60,
  },
  emptyText: { textAlign: "center", opacity: 0.7, paddingHorizontal: 24 },
});
