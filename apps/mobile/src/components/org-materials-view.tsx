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
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getOrgMaterials, type OrgMaterial } from "@/lib/me";

const PURPLE = Brand.primary;

export function OrgMaterialsView({ onBack }: { onBack: () => void }) {
  const [materials, setMaterials] = useState<OrgMaterial[]>([]);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getOrgMaterials()
      .then((d) => {
        if (!active) return;
        setMaterials(d.materials);
        setOrgName(d.orgName);
      })
      .catch(() => active && setError("No se pudieron cargar los materiales."))
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
        Materiales {orgName ? `· ${orgName}` : ""}
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>
              {error ?? "No hay materiales disponibles para tu organización."}
            </ThemedText>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => WebBrowser.openBrowserAsync(item.fileUrl)}
            >
              <ThemedView style={styles.card}>
                <ThemedText style={styles.fileType}>{item.fileType?.toUpperCase()}</ThemedText>
                <View style={styles.cardBody}>
                  <ThemedText type="subtitle" numberOfLines={2}>
                    {item.name}
                  </ThemedText>
                  {item.description ? (
                    <ThemedText style={styles.desc} numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                  ) : null}
                </View>
                <ThemedText style={styles.open}>Abrir ›</ThemedText>
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
  fileType: {
    fontSize: 11,
    fontWeight: "800",
    color: PURPLE,
    width: 44,
  },
  cardBody: { flex: 1, gap: 2 },
  desc: { opacity: 0.7, fontSize: 13 },
  open: { color: PURPLE, fontWeight: "600" },
});
