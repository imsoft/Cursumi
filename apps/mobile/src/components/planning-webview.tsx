import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { Brand } from "@/constants/theme";
import { API_URL } from "@/lib/api";
import { authClient } from "@/lib/auth";

/**
 * Sección de Planeación didáctica (documentos + PDFs) del instructor.
 *
 * Reutiliza los editores de la web dentro de un WebView. La autenticación se
 * hace con la cookie de sesión que ya guarda el cliente expo: se envía en la
 * carga inicial al endpoint `/api/mobile/planning-bridge`, que la persiste en
 * el jar del WebView y redirige a la página real.
 *
 * La descarga del PDF no existe en un WebView, así que la web nos envía el PDF
 * en base64 por `postMessage`; aquí lo guardamos y abrimos la hoja de compartir.
 */
export function PlanningWebView({
  courseId,
  onBack,
}: {
  courseId: string;
  onBack: () => void;
}) {
  const cookie = authClient.getCookie();
  const redirect = `/instructor/courses/${courseId}/planning`;
  const uri = `${API_URL}/api/mobile/planning-bridge?redirect=${encodeURIComponent(redirect)}`;

  const [loading, setLoading] = useState(true);
  const [savingPdf, setSavingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    let payload: { type?: string; filename?: string; base64?: string };
    try {
      payload = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (payload.type !== "planning-pdf" || !payload.base64) return;

    setSavingPdf(true);
    setError(null);
    try {
      const name =
        (payload.filename || "documento.pdf").replace(/[\\/:*?"<>|]/g, "").trim() ||
        "documento.pdf";
      const file = new File(Paths.cache, name);
      file.create({ overwrite: true });
      file.write(payload.base64, { encoding: "base64" });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: name,
        });
      }
    } catch {
      setError("No se pudo guardar el PDF. Inténtalo de nuevo.");
    } finally {
      setSavingPdf(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Planeación didáctica" onBack={onBack} />

      {error && (
        <View style={styles.errorBar}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <View style={styles.webWrap}>
        <WebView
          source={{ uri, headers: cookie ? { Cookie: cookie } : undefined }}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          originWhitelist={["*"]}
          onMessage={handleMessage}
          onLoadEnd={() => setLoading(false)}
          startInLoadingState={false}
          style={styles.web}
        />
        {(loading || savingPdf) && (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator color={Brand.primary} size="large" />
            {savingPdf && (
              <ThemedText style={styles.overlayText}>Generando PDF…</ThemedText>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webWrap: { flex: 1, position: "relative" },
  web: { flex: 1, backgroundColor: "transparent" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  overlayText: { fontSize: 14, opacity: 0.8 },
  errorBar: {
    backgroundColor: "rgba(220,38,38,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: { color: "#dc2626", fontSize: 13 },
});
