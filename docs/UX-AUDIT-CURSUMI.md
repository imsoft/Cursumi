# Auditoría UX / Producto — Cursumi

**Fecha:** Marzo 2025  
**Alcance:** Experiencia de usuario, flujos, navegación, coherencia, fricción y performance percibida.  
**Enfoque:** Product-first, conversión, retención y sensación premium.

---

## A. Resumen general de la experiencia actual

### Qué está bien
- **Arquitectura clara por roles:** Marketing, estudiante (`/dashboard`), instructor (`/instructor`), admin (`/admin`) con layouts y shells diferenciados. El usuario no mezcla contextos.
- **Auth completo:** Login, registro, recuperación de contraseña, reset con token, verificación de email. Formularios con validación (Zod), mensajes de error y enlaces cruzados (olvidé contraseña ↔ login).
- **Flujos de pago definidos:** Cursos gratis → inscripción directa (server action); cursos de pago → Stripe Checkout → webhook → inscripción. El estudiante llega a "Mis cursos" tras comprar.
- **Contenido de lecciones rico:** Video (Mux/URL), texto, quiz, tarea; materiales extra (archivos, enlaces); progreso y “marcar completada”; navegación anterior/siguiente en el visor.
- **Componentes reutilizables:** EmptyState, PageHeader, StatsGrid, Cards consistentes. Menos duplicación y coherencia visual.
- **Dos catálogos separados:** `/courses` (público, sin login) y `/dashboard/explore` (con login, filtros, estado de inscripción). Permite descubrimiento antes y después de registrarse.

### Qué lastra la experiencia
- **Doble catálogo sin conexión clara:** Un usuario en `/courses` no sabe que “ver curso” lo llevará a una URL bajo `/dashboard/explore` (y si no está logueado, a login). La intención “explorar” vs “comprar ya” no está bien guiada.
- **Home no lleva al catálogo real:** “Explorar cursos” en el Hero apunta a `#cursos` (anchor en la misma página), no a `/courses` ni a `/dashboard/explore`. El CTA principal no cumple la expectativa de “ir a ver cursos”.
- **Falta de contexto “dónde estoy”:** El header del dashboard no muestra título de página ni breadcrumb. Solo avatar y notificaciones. En rutas profundas (lección, detalle de curso) el usuario depende de breadcrumbs internos de la página.
- **Búsqueda en Explorar sin debounce:** El input de búsqueda actualiza la URL en cada `onChange`, generando muchas navegaciones y posibles parpadeos. No hay indicador de “buscando…”.
- **Wizard de curso muy largo:** Crear/editar curso son 5 pasos (info, secciones, examen, precio, preview) en tabs. Guardar borrador/publicar está en cada paso pero no hay “guardado automático” ni indicación clara de progreso guardado.
- **Inconsistencias de sesión:** Algunas páginas usan `getCachedSession()`, otras `auth.api.getSession({ headers })`. No afecta solo rendimiento sino posible inconsistencia de estado.
- **Pocos estados de carga y vacío:** Varias listas (cursos, certificados, perfil) muestran loading genérico o vacío sin skeleton. La app puede sentirse “en blanco” un momento.
- **Perfil y configuración duplicados en rol:** Estudiante tiene `/dashboard/profile` y `/dashboard/settings`; instructor tiene `/instructor/profile`. Configuración (nombre, contraseña) podría unificarse o al menos enlazarse desde un solo “Cuenta”.

---

## B. Principales problemas UX detectados

| # | Problema | Dónde | Impacto |
|---|----------|--------|---------|
| 1 | CTA “Explorar cursos” no lleva al listado de cursos | Home Hero | Alto: primera acción del usuario no cumple expectativa. |
| 2 | Catálogo público (`/courses`) y explorar logueado (`/dashboard/explore`) no están conectados en copy ni flujo | Navbar, Home, /courses | Alto: confusión sobre “dónde ver/comprar cursos”. |
| 3 | Usuario no logueado que abre detalle de curso (ej. desde /courses) termina en login sin “volver al curso” | /dashboard/explore/[id] + redirect login | Alto: pierde contexto y puede abandonar. |
| 4 | Header del dashboard sin título de página ni breadcrumb | StudentShell, InstructorShell | Medio: “¿En qué pantalla estoy?”. |
| 5 | Búsqueda en Explorar dispara navegación en cada tecla | explore-client Input onChange | Medio: lentitud percibida y posibles flashes. |
| 6 | Crear curso en 5 pasos sin guardado automático ni progreso persistente visible | CreateCourseWizard | Medio: miedo a perder cambios y sensación de proceso largo. |
| 7 | Después de registro solo se muestra “verifica tu correo” sin opción de “Reenviar correo” | verify-email-sent | Medio: usuario bloqueado sin recurso claro. |
| 8 | Reset password redirige a login a los 2 s sin que el usuario lea el mensaje | reset-password-form setTimeout | Bajo: sensación de “me sacaron” de la pantalla. |
| 9 | En login/registro los enlaces a signup/login usan `<a href>` en vez de `<Link>` | login-form, register-form | Bajo: recarga completa de página. |
| 10 | Perfil estudiante hace fetch en cliente y muestra loading genérico | profile page | Medio: primera impresión de lentitud. |

---

## C. Flujos con más fricción

### 1. Registro → Primer uso
- **Bien:** Formulario claro, términos y privacidad enlazados, Google como alternativa.
- **Mal:** Tras enviar, solo “Verifica tu correo” y “Ir al inicio de sesión”. No puede “continuar” sin verificar; no hay “Reenviar correo”. Si el correo tarda, el usuario no tiene acción clara.
- **Propuesta:** Añadir botón “Reenviar correo de verificación” (con throttling) y opcionalmente “Entrar con Google” también en verify-email-sent para no bloquear.

### 2. Descubrimiento de cursos (invitado)
- **Bien:** `/courses` muestra cursos con filtros y orden; las cards llevan a detalle.
- **Mal:** En el schema, el detalle del curso está en `https://cursumi.com/dashboard/explore/${id}`. Un invitado que hace clic en un curso es redirigido a login sin guardar “quería ver este curso”. Al volver, no se le devuelve al detalle.
- **Propuesta:** Detalle de curso público en `/courses/[id]` para invitados (solo lectura, CTA “Inscribirse”/“Comprar” que lleve a login/signup con `?redirect=/dashboard/explore/[id]` o `/courses/[id]`). Tras login, redirigir al detalle.

### 3. Compra / inscripción
- **Bien:** Curso gratis = un clic (EnrollActionForm); de pago = CheckoutButton → Stripe → webhook → inscripción. success_url lleva a `my-courses/[courseId]?enrolled=true`.
- **Mal:** No hay confirmación visual tipo “¡Inscrito!” en la misma pantalla antes de redirigir (Stripe redirige directamente). En cursos gratis el feedback es por useActionState; está bien pero podría ser más visible (toast o banner).
- **Propuesta:** Tras enroll exitoso (curso gratis), mostrar toast o banner breve “Te has inscrito. Redirigiendo a tu curso…” y luego navegar. En pago, la URL de éxito ya lleva a my-courses; añadir query `?enrolled=true` y en esa página un banner “Bienvenido al curso” (dismissible).

### 4. Consumo de contenido (lección)
- **Bien:** Sidebar con progreso, lista de lecciones, anterior/siguiente, material extra, marcar completada.
- **Mal:** No hay “siguiente lección” prevista al terminar de ver el video/texto sin hacer scroll (el botón “Marcar completada” y “Siguiente” están más abajo). En móvil el sidebar se convierte en drawer; está bien pero el acceso no es obvio (icono de menú).
- **Propuesta:** Barra fija inferior (o sticky) en viewport con “Marcar completada” + “Siguiente” cuando aplique, para reducir scroll. En móvil, indicar con un texto corto “Menú” junto al ícono del drawer.

### 5. Crear / editar curso (instructor)
- **Bien:** Wizard por pasos, guardar borrador en cada paso, preview antes de publicar.
- **Mal:** 5 pasos en tabs; no hay “guardado automático” ni “Última vez guardado: hace X”. Si cierra sin guardar, pierde cambios. El paso “Secciones y lecciones” es el más pesado y no hay indicación de “cuántas lecciones llevo”.
- **Propuesta:** Guardado automático cada N segundos o al cambiar de tab (con indicador “Guardado” / “Guardando…”). Resumen en el header: “X secciones, Y lecciones”. Opcional: “Restaurar borrador” si hay uno reciente.

### 6. Navegación principal (estudiante)
- **Bien:** Sidebar con Dashboard, Mis cursos, Certificados, Explorar, Perfil, Configuración. Estructura lógica.
- **Mal:** “Dashboard” y “Mis cursos” pueden solaparse en mente del usuario (“¿dónde veo mis cursos?”). “Explorar cursos” está al final; para alguien que quiere descubrir, no es el primer elemento.
- **Propuesta:** Mantener orden pero en el Dashboard destacar “Seguir con tus cursos” y “Explorar más” con CTAs. En sidebar, considerar “Explorar” antes de “Certificados” si el dato de producto muestra que explorar se usa más.

---

## D. Oportunidades para reducir clics y pasos

1. **Un solo “Catálogo” para invitados y logueados**  
   Ruta única tipo `/courses` (o `/explore`). Invitado: ve listado y detalle en solo lectura; CTA “Inscribirse”/“Comprar” → login/signup con returnUrl. Logueado: mismo listado con badges “Inscrito” y enlace a “Ir al curso”. Reduce decisión “¿entro a /courses o a dashboard/explore?”.

2. **Home → Catálogo en un clic**  
   “Explorar cursos” del Hero que apunte a `/courses` (o la ruta unificada de catálogo). “Ver cursos” en navbar igual. Un clic desde cualquier sitio público al listado.

3. **Detalle de curso sin login con returnUrl**  
   Ver descripción, precio, temario (si quieres) sin sesión. Botón “Comprar”/“Inscribirme” → login/signup con `returnUrl=/courses/[id]` (o equivalente). Tras auth, redirigir al detalle y dejar comprar/inscribir ahí. Un paso menos de “entré, me mandaron a login, no sé a dónde volver”.

4. **Guardado automático en wizard de curso**  
   Evita “Guardar como borrador” manual en cada paso; el usuario no tiene que pensar en guardar. Menos clics y menos miedo a perder trabajo.

5. **Breadcrumb en header**  
   Ej.: “Dashboard > Mis cursos > [Nombre curso]”. Un vistazo para saber “dónde estoy” y volver atrás sin usar atrás del navegador.

6. **Unificar “Cuenta” (perfil + configuración)**  
   Una sección “Cuenta” o “Mi cuenta” con subsecciones: Perfil (nombre, bio, avatar), Seguridad (contraseña). Menos ítems en el menú y menos “¿esto dónde estaba?”.

---

## E. Recomendaciones por pantalla o módulo

### Marketing / Home
- **Hero:** Cambiar “Explorar cursos” de `#cursos` a `/courses` (o ruta unificada). Prioridad: **alta**.
- **Featured courses:** Si hay sección “Cursos destacados”, que cada card enlace a `/courses/[id]` (detalle público) o a la misma ruta que uses para catálogo. Prioridad: **alta** si existe la sección.

### Auth (login, signup, forgot, reset, verify)
- **Login/Register:** Sustituir `<a href="/signup">` por `<Link href="/signup">` para evitar recarga. Prioridad: **media**.
- **verify-email-sent:** Añadir “Reenviar correo de verificación” (con cooldown 60 s). Prioridad: **alta**.
- **reset-password éxito:** Quitar `setTimeout` de redirección; dejar solo el botón “Ir al inicio de sesión”. Prioridad: **baja**.

### Catálogo y detalle de curso
- **Ruta de detalle para invitados:** Implementar `/courses/[id]` (o equivalente) con contenido de solo lectura y CTA que lleve a login/signup con returnUrl. Prioridad: **alta**.
- **Schema/links:** Ajustar schema y enlaces del catálogo público para que apunten a la URL de detalle público, no a `dashboard/explore/[id]`. Prioridad: **alta** cuando exista detalle público.

### Dashboard estudiante
- **Header:** Mostrar título de la página actual y breadcrumb (ej. desde layout o desde cada página vía contexto). Prioridad: **alta**.
- **Explorar:** Debounce en búsqueda (300–400 ms) y actualizar URL después; opcional: indicador “Buscando…”. Prioridad: **alta**.
- **Mis cursos:** Mantener; asegurar que desde “Explorar” y desde “Dashboard” el camino a “Mis cursos” sea obvio (enlaces y copy). Prioridad: **media**.

### Lección (visor)
- **Sticky CTA:** Barra con “Marcar completada” y “Siguiente” fija o sticky al final del viewport en desktop. Prioridad: **media**.
- **Móvil:** Etiqueta “Menú” junto al ícono del drawer del sidebar. Prioridad: **baja**.

### Instructor
- **Wizard:** Guardado automático + indicador “Guardado” / “Guardando…”; resumen “X secciones, Y lecciones” en header del paso de secciones. Prioridad: **alta**.
- **Perfil instructor vs perfil estudiante:** Si es el mismo usuario en ambos roles, unificar “Cuenta” (perfil + contraseña) y diferenciar solo “Perfil público instructor” (bio, especialidades). Prioridad: **media** a largo plazo.

### Perfil y configuración
- **Perfil:** Cargar datos en servidor (page async) y pasarlos como props para evitar loading genérico en cliente. Prioridad: **media**.
- **Settings/Perfil:** Unificar en “Cuenta” con pestañas o secciones (Perfil, Seguridad). Prioridad: **media**.

### Estados vacíos y errores
- **EmptyState:** Ya existe componente; usarlo en todas las listas (mis cursos vacío, explorar sin resultados, certificados vacíos, etc.) con título, descripción y CTA. Prioridad: **alta** donde falte.
- **Errores de red/formulario:** Mensajes claros y acción “Reintentar” donde aplique (ej. guardar curso, cargar perfil). Prioridad: **media**.

---

## F. Quick wins (rápidos de implementar)

| # | Acción | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 1 | Hero: enlace “Explorar cursos” → `/courses` | Bajo | Alto |
| 2 | Login/Register: usar `<Link>` en lugar de `<a>` para signup/login | Bajo | Medio |
| 3 | verify-email-sent: botón “Reenviar correo” con throttle 60 s | Medio | Alto |
| 4 | Reset password: quitar auto-redirect; solo botón “Ir a inicio de sesión” | Bajo | Bajo |
| 5 | Explorar: debounce 300 ms en input de búsqueda antes de actualizar URL | Medio | Alto |
| 6 | Dashboard header: título de página desde pathname (ej. “Mis cursos”, “Explorar”) | Bajo | Medio |
| 7 | success_url de Stripe: mantener `?enrolled=true`; en my-courses/[courseId] mostrar banner “¡Bienvenido al curso!” si existe query | Bajo | Medio |
| 8 | Revisar todas las listas (mis cursos, explorar 0 resultados, certificados, instructor courses) y usar EmptyState con CTA | Bajo | Medio |

---

## G. Mejoras de alto impacto que requieren rediseño

1. **Catálogo unificado + detalle público**  
   Una sola entrada “Cursos” (ej. `/courses`) para invitados y logueados; detalle en `/courses/[id]` accesible sin login; CTA de compra/inscripción con returnUrl. Implica: nueva ruta, posible refactor de explore, redirects y manejo de returnUrl en auth. **Prioridad: alta.**

2. **Guardado automático en wizard de curso**  
   Endpoint o action “upsert draft” por curso; guardar al cambiar de tab o cada N segundos; indicador “Guardado”/“Guardando…” y manejo de conflictos. **Prioridad: alta.**

3. **Breadcrumb global en dashboard/instructor**  
   Componente de breadcrumb en layout que reciba segmentos de la ruta y opcionalmente labels (ej. “Mis cursos” en vez de “my-courses”). **Prioridad: media.**

4. **Unificación Perfil + Configuración en “Cuenta”**  
   Una sección con subsecciones (Perfil, Seguridad, Notificaciones si aplica) para reducir ítems en sidebar y duplicidad entre estudiante e instructor. **Prioridad: media.**

5. **Skeletons en listas críticas**  
   Listado de cursos (explore, mis cursos), certificados, perfil: mostrar skeleton de cards o filas mientras carga en lugar de spinner genérico. **Prioridad: media.**

---

## H. Lista priorizada de cambios recomendados

### Prioridad alta
1. Hero “Explorar cursos” → enlace a `/courses` (o ruta unificada de catálogo).  
2. Detalle de curso accesible sin login en `/courses/[id]` con CTA que lleve a login/signup con returnUrl.  
3. verify-email-sent: botón “Reenviar correo de verificación” (con cooldown).  
4. Búsqueda en Explorar con debounce (300–400 ms).  
5. Guardado automático (o al cambiar de tab) en wizard de crear/editar curso + indicador “Guardado”/“Guardando…”.  
6. Uso consistente de EmptyState en todas las listas con CTA claros.

### Prioridad media
7. Dashboard/Instructor header con título de página y breadcrumb.  
8. Login/Register con `<Link>` para no recargar.  
9. Banner “¡Bienvenido al curso!” en my-courses/[courseId] cuando `?enrolled=true`.  
10. Perfil: cargar datos en servidor para evitar loading genérico en cliente.  
11. Barra sticky “Marcar completada” + “Siguiente” en visor de lección (desktop).  
12. Unificar Perfil y Configuración en una sección “Cuenta” con subsecciones.

### Prioridad baja
13. Reset password: quitar setTimeout; solo botón para ir a login.  
14. Etiqueta “Menú” en móvil en el drawer del visor de lección.  
15. Revisar consistencia de uso de `getCachedSession()` vs `auth.api.getSession` y documentar cuándo usar cada uno.

---

*Documento generado a partir de revisión de rutas, layouts, componentes y flujos del código de Cursumi. Las prioridades pueden ajustarse según métricas reales (embudo de registro, abandono en checkout, uso de explorar vs mis cursos, etc.).*
