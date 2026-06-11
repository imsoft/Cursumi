import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ScreenHeader } from "@/components/screen-header";
import { Brand, CardShadow} from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_URL } from "@/lib/api";

const PURPLE = Brand.primary;

// Mismas plantillas que la web (public/templates/).
const TEMPLATES = [
  {
    id: "presentation",
    name: "Presentación Cursumi",
    description: "Plantilla de PowerPoint para presentar tus cursos o la plataforma.",
    filename: "cursumi_presentation.pptx",
  },
  {
    id: "letterhead",
    name: "Membrete Cursumi",
    description: "Plantilla PDF con membrete oficial para documentos o comunicados.",
    filename: "cursumi_letterhead.pdf",
  },
];

export function TemplatesView({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Plantillas" onBack={onBack} />
      <View style={styles.list}>
        {TEMPLATES.map((t) => (
          <ThemedView key={t.id} style={styles.card}>
            <ThemedText type="subtitle">{t.name}</ThemedText>
            <ThemedText style={styles.desc}>{t.description}</ThemedText>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                WebBrowser.openBrowserAsync(`${API_URL}/templates/${encodeURIComponent(t.filename)}`)
              }
            >
              <ThemedText style={styles.buttonText}>Abrir / descargar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 12 },
  card: { ...CardShadow,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    gap: 8,
  },
  desc: { opacity: 0.7, fontSize: 14 },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
