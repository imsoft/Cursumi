# Cursumi

Plataforma de cursos virtuales, presenciales y en vivo: estudiantes exploran e inscriben cursos, instructores publican y cobran, administradores gestionan la plataforma. Incluye dashboard para organizaciones (B2B), pizarrón virtual para instructores, **blog** (marketing y paneles por rol) y catálogo de ubicaciones en México (estado y municipio INEGI) en formularios de perfil y cursos presenciales.

**Stack:** Next.js 16 (App Router), React 19, Better Auth, Neon + Prisma 7, shadcn/ui + Tailwind CSS v4, editor enriquecido con **Lexical**. Vídeo con Mux, medios con Cloudinary, pagos con Stripe (Connect para instructores). Funciones de **IA para admin** (Google Gemini) opcionales vía API.

**Documentación extra:** [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) y [docs/README.md](./docs/README.md).

---

## Requisitos

- **Node.js** 20+
- **pnpm** (gestor de paquetes del proyecto)
- Archivo **`.env`** en la raíz (plantilla en [`.env.example`](./.env.example))

---

## Setup rápido

1. **Variables de entorno** — copia `.env.example` a `.env` y completa al menos:

   | Área | Variables |
   |------|-----------|
   | **Base de datos** | `DATABASE_URL` — Neon; usa conexión **directa** para migraciones (`prisma migrate`). |
   | **Auth (obligatorio)** | `BETTER_AUTH_SECRET` (mín. 32 caracteres; p. ej. `openssl rand -base64 32`), `NEXT_PUBLIC_APP_URL` (URL pública **sin** barra final, p. ej. `http://localhost:3000` o `https://www.cursumi.com`). Opcional: `BETTER_AUTH_URL` si difiere de `NEXT_PUBLIC_APP_URL` en el servidor. |
   | **OAuth Google (opcional)** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Si faltan, el login por email sigue funcionando y el botón de Google no se muestra. En Google Cloud Console, redirect URI: `https://TU-DOMINIO/api/auth/callback/google`. |
   | **Email** | Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (verificación de correo y recuperación de contraseña). Opcional: `CONTACT_INBOX_EMAIL` — bandeja del formulario `/contact` (por defecto `contacto@cursumi.com`; el destino debe estar permitido en tu cuenta Resend). |
   | **Seguridad registro / forgot password** | Cloudflare Turnstile: `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Si no configuras el secret, el servidor omite la verificación CAPTCHA en desarrollo. |
   | **Rate limiting (opcional)** | Upstash Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — complementa límites en hooks de auth. |
   | **Video** | Mux: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` |
   | **Cloudinary (obligatorio para medios en producción)** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Opcional en `.env.example`: `CLOUDINARY_UPLOAD_PRESET` (presets sin firmar si los usas en otro flujo). Sirve para portadas, avatares, firmas, **y adjuntos** (PDF, Office, etc.): el navegador sube directo a Cloudinary con firma de `/api/cloudinary/signature` para no chocar con el límite de tamaño del body en serverless. |
   | **Pagos** | Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (+ Stripe Connect según tu entorno). |
   | **IA admin (opcional)** | `GOOGLE_GENAI_API_KEY` — rutas bajo `/api/admin/ai/*` (p. ej. recomendaciones, Q&A de curso con Gemini). Sin clave, esas funciones no operan; el resto de la app sí. |
   | **Observabilidad (opcional)** | Sentry: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (source maps en CI). |
   | **Cron** | `CRON_SECRET` — protege rutas bajo `/api/cron/*` (p. ej. recordatorios). |
   | **Notificaciones push (opcional)** | Web Push (VAPID): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`; opcional `VAPID_CONTACT_EMAIL`. Sin ellas, el resto de la app funciona; solo se omiten suscripciones push en el cliente. |

2. **Dependencias:** `pnpm install` (ejecuta `prisma generate` en `postinstall`; cliente en `src/generated/prisma`).

3. **Base de datos:** `pnpm db:generate` y luego `pnpm prisma migrate deploy` en producción (o `pnpm db:migrate` / `pnpm db:push` en desarrollo).

4. **(Opcional)** Datos iniciales: `pnpm db:seed`

5. **Desarrollo:** `pnpm dev` (Turbopack). **Producción local:** `pnpm build` y `pnpm start` (el build fuerza webpack: `NEXT_USE_TURBOPACK=0` en el script).

---

## Scripts

| Comando | Descripción |
|--------|-------------|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción (Next sin Turbopack, ver `package.json`) |
| `pnpm start` | Servidor Node tras el build |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Genera el cliente Prisma |
| `pnpm db:push` | Sincroniza el schema con la BD (solo desarrollo rápido) |
| `pnpm db:migrate` | Crea o aplica migraciones (`prisma migrate dev`) |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:seed` | Ejecuta `prisma/seed.ts` |
| `pnpm test` | Vitest (una ejecución) |
| `pnpm test:watch` | Vitest en modo watch |
| `pnpm test:ui` | Vitest con interfaz gráfica |
| `pnpm test:e2e` | Pruebas E2E con Playwright (`e2e/`) |
| `pnpm test:e2e:ui` | Playwright en modo UI |

### Pruebas

- **Vitest:** útil para lógica y componentes aislados; ver tabla de scripts arriba.
- **Playwright:** `baseURL` por defecto `http://localhost:3000` (sobrescribe con `PLAYWRIGHT_BASE_URL`). En local, levanta antes la app con `pnpm dev` o `pnpm start`. Con la variable de entorno `CI` definida, `playwright.config.ts` puede arrancar el servidor de producción (`pnpm start`) automáticamente.

---

## Integraciones

- **Autenticación:** Better Auth — email/contraseña (verificación de email obligatoria), Google opcional. API en `/api/auth/*`. Cookies y CSRF dependen de que `NEXT_PUBLIC_APP_URL` coincida con el dominio real; en Vercel también se considera `VERCEL_URL` para orígenes de confianza (`trustedOrigins` en `src/lib/auth.ts`).
- **Base de datos:** Prisma + PostgreSQL (Neon). Modelos: usuarios, cursos, modalidades (virtual, presencial, live), sesiones, inscripciones, certificados, transacciones, notificaciones, organizaciones (B2B), blog, etc.
- **Contenido enriquecido:** Lexical (`@lexical/*`) en editores (p. ej. lecciones, blog).
- **Video:** Mux — subida y reproducción; rutas `/api/mux/*`.
- **Medios (Cloudinary):** imágenes (portadas, avatares) y archivos **raw** (material de lección, materiales B2B). Firma en `POST /api/cloudinary/signature`; subida al cliente a `https://api.cloudinary.com/...` (debe estar permitido en CSP `connect-src`, ver `next.config.ts`). Respaldo: `POST /api/upload/attachment` y `/api/upload/course-cover` en servidor.
- **Pagos:** Stripe (checkout) y Stripe Connect (liquidación a instructores). Webhook: `/api/payments/webhook`.
- **IA (opcional):** Google Gemini (`@google/genai`, `src/lib/gemini.ts`) para endpoints de administración; requiere `GOOGLE_GENAI_API_KEY`.
- **Notificaciones push (opcional):** Web Push con VAPID (`src/lib/web-push.ts`); variables en la tabla de entorno del setup.
- **Protección de rutas (Next.js 16):** `src/proxy.ts` actúa como capa tipo middleware (no dupliques con `middleware.ts`). Rutas protegidas por cookie de sesión; la sesión real se valida en layouts y APIs.

---

## Rutas principales por rol

- **Público:** `/`, `/courses`, `/courses/[slug]`, `/blog`, `/blog/[slug]`, `/how-it-works`, `/pricing`, `/business`, `/instructors`, `/contact`, `/privacidad`, `/terminos`, `/offline`, `/login`, `/signup`, `/verify-email`, `/forgot-password`
- **Estudiante:** `/dashboard`, `/dashboard/explore`, `/dashboard/my-courses`, `/dashboard/certificates`, `/dashboard/account`, `/dashboard/games`, `/dashboard/blog`, …
- **Instructor:** `/instructor`, `/instructor/courses`, `/instructor/whiteboard`, `/instructor/earnings`, `/instructor/analytics`, `/instructor/profile`, `/instructor/games`, `/instructor/blog`, …
- **Admin:** `/admin` y subrutas (usuarios, cursos, analytics, finanzas, categorías, cupones, **blog**, …)
- **Empresa (B2B):** `/business/dashboard`, equipos, materiales, métricas, invitaciones (`/business/invite/[token]`), …

---

## Despliegue y buenas prácticas

- **Neon:** Usa la URL **directa** para `prisma migrate deploy`; en runtime el **pooler** suele ser adecuado.
- **Dominio único:** Evita mezclar `www` y apex sin configurar ambos en variables y en la consola de OAuth; la app añade variantes `www` / sin `www` a orígenes de confianza cuando la URL base está bien definida.
- **Vercel / serverless:** Los adjuntos grandes no deben pasar solo por una función que reciba todo el body; el flujo actual sube desde el navegador a Cloudinary cuando la firma está configurada.
- **Open Graph:** Imagen dinámica por curso en `/api/og/course/[id]`.
- **Sentry / analítica:** Configuradas según variables del entorno (Vercel Analytics, Speed Insights, etc.).
- **Fotos de perfil OAuth (Google):** si no cargan en el UI, suele ser el `Referer`; los componentes de avatar usan `referrerPolicy="no-referrer"` donde aplica (`ProfilePhotoImg`).

---

## Licencia y contribución

Uso privado del proyecto salvo que se indique lo contrario. Para cambios estructurales (auth, pagos, schema), revisa migraciones Prisma y variables en staging antes de producción.
