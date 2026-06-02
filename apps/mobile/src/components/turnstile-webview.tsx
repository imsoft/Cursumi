import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { TURNSTILE_SITE_KEY } from "@/lib/api";

/**
 * Renderiza el widget de Cloudflare Turnstile dentro de un WebView y entrega el
 * token resultante (`cf-turnstile-response`) a la app nativa vía postMessage.
 *
 * El servidor exige este token en /sign-up/email; una app nativa no puede
 * generarlo sin un contexto web, por eso lo resolvemos con este WebView mínimo.
 */
type Props = {
  onToken: (token: string) => void;
  onError?: () => void;
};

export function TurnstileWebView({ onToken, onError }: Props) {
  const html = useMemo(
    () => `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
      .wrap { display: flex; justify-content: center; padding: 4px 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div
        class="cf-turnstile"
        data-sitekey="${TURNSTILE_SITE_KEY}"
        data-callback="onSuccess"
        data-error-callback="onError"
        data-theme="light"
      ></div>
    </div>
    <script>
      function post(msg) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }
      function onSuccess(token) { post({ type: "token", token: token }); }
      function onError() { post({ type: "error" }); }
    </script>
  </body>
</html>`,
    []
  );

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://cursumi.vercel.app" }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data) as {
              type: string;
              token?: string;
            };
            if (msg.type === "token" && msg.token) onToken(msg.token);
            else if (msg.type === "error") onError?.();
          } catch {
            onError?.();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Altura fija suficiente para el widget de Turnstile (~65px) + margen.
  container: { height: 78, width: "100%" },
  webview: { backgroundColor: "transparent" },
});
