import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Solo activar en producción para no llenar de ruido en desarrollo
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,         // 10% de trazas de performance
  replaysSessionSampleRate: 0,   // no grabar sesiones normales (Replay es pesado en el cliente)
  replaysOnErrorSampleRate: 1.0, // 100% de replays cuando hay error
  // El SDK de Session Replay añade ~50-90 KB al bundle de cada página y se
  // ejecuta durante el primer pintado, lo que degrada FCP/LCP. Lo cargamos
  // de forma diferida tras el load para no bloquear el render inicial.
  integrations: [],
});

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  const loadReplay = () => {
    void import("@sentry/nextjs").then((S) => {
      Sentry.addIntegration(
        S.replayIntegration({
          maskAllText: true, // GDPR: ocultar texto de usuarios
          blockAllMedia: false,
        }),
      );
    });
  };

  // Espera a que la página esté interactiva (idle) para no competir con el render.
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void) => void;
  }).requestIdleCallback;
  if (typeof ric === "function") {
    ric(loadReplay);
  } else {
    window.addEventListener("load", loadReplay);
  }
}
