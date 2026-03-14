import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Solo activar en producción para no llenar de ruido en desarrollo
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.2,       // 20% de trazas de performance
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // 100% de replays cuando hay error
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,        // GDPR: ocultar texto de usuarios
      blockAllMedia: false,
    }),
  ],
});
