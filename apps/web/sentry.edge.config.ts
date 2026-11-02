import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.2,
  // Sentry 11 recopila por defecto cookies, cabeceras, cuerpos de petición y
  // datos del usuario. Se apaga todo para quedar como en la versión 10 (sin PII).
  dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
});
