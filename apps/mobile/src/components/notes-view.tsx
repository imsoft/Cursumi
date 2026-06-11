import { useEffect, useState } from "react";
import { Brand, CardShadow} from "@/constants/theme";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { deleteNote, getNotes, type Note } from "@/lib/me";

const PURPLE = Brand.primary;

export function NotesView({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getNotes()
      .then((n) => active && setNotes(n))
      .catch(() => active && setError("No se pudieron cargar tus notas."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await deleteNote(id);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="title" style={styles.heading}>
        Mis notas
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>
              {error ?? "Aún no tienes notas. Agrégalas mientras ves una lección."}
            </ThemedText>
          }
          renderItem={({ item }) => (
            <ThemedView style={styles.card}>
              {(item.course?.title || item.lesson?.title) && (
                <ThemedText style={styles.context} numberOfLines={1}>
                  {item.course?.title}
                  {item.lesson?.title ? ` · ${item.lesson.title}` : ""}
                </ThemedText>
              )}
              <ThemedText style={styles.content}>{item.content}</ThemedText>
              <TouchableOpacity onPress={() => remove(item.id)} hitSlop={8}>
                <ThemedText style={styles.delete}>Eliminar</ThemedText>
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
  list: { padding: 16, gap: 10, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  card: { ...CardShadow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    padding: 14,
    gap: 6,
  },
  context: { fontSize: 12, opacity: 0.6 },
  content: { fontSize: 15 },
  delete: { color: "#dc2626", fontSize: 13, fontWeight: "600", alignSelf: "flex-start" },
});
