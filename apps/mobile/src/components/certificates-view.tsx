import { useEffect, useState } from "react";
import { Brand } from "@/constants/theme";
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
import { getCertificates, type Certificate } from "@/lib/me";

const PURPLE = Brand.primary;

function categoryLabel(category: Certificate["category"]): string | null {
  if (!category) return null;
  if (typeof category === "string") return category;
  return category.name ?? null;
}

export function CertificatesView({ onBack }: { onBack: () => void }) {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCertificates()
      .then((c) => active && setCerts(c))
      .catch(() => active && setError("No se pudieron cargar tus certificados."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="title" style={styles.heading}>
        Certificados
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={certs}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>
              {error ?? "Aún no tienes certificados. Completa un curso para obtener el tuyo."}
            </ThemedText>
          }
          renderItem={({ item }) => {
            const cat = categoryLabel(item.category);
            return (
              <ThemedView style={styles.card}>
                <View style={styles.ribbon}>
                  <ThemedText style={styles.ribbonText}>CERTIFICADO</ThemedText>
                </View>
                <ThemedText type="subtitle" numberOfLines={2}>
                  {item.courseTitle}
                </ThemedText>
                <ThemedText style={styles.meta}>
                  {item.instructorName}
                  {cat ? ` · ${cat}` : ""}
                  {item.hours ? ` · ${item.hours} h` : ""}
                </ThemedText>
                <View style={styles.divider} />
                <ThemedText style={styles.number}>Folio: {item.certificateNumber}</ThemedText>
                <ThemedText style={styles.date}>
                  Emitido el {new Date(item.issueDate).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </ThemedText>
              </ThemedView>
            );
          }}
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
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PURPLE,
    gap: 6,
  },
  ribbon: { alignSelf: "flex-start", backgroundColor: PURPLE, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  ribbonText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  meta: { opacity: 0.7, fontSize: 13 },
  divider: { height: 1, backgroundColor: "rgba(127,127,127,0.2)", marginVertical: 4 },
  number: { fontSize: 13, fontWeight: "600" },
  date: { fontSize: 12, opacity: 0.6 },
});
