import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.2,
  // No enviar errores de rate limit (429) ni not found (404) — son esperados
  beforeSend(event) {
    const status = event.contexts?.response?.status_code;
    if (status === 404 || status === 429) return null;
    return event;
  },
});
