# Auditoría SEO integral — Cursumi

**Fecha:** Marzo 2025  
**Alcance:** Technical SEO, on-page, rendimiento, arquitectura, contenido, indexación, structured data y conversión.  
**Objetivo:** Base SEO sólida para competir en tráfico orgánico.

---

## A. Resumen general del estado SEO actual

**Fortalezas**
- Next.js App Router con renderizado en servidor para páginas clave (home, cursos, detalle de curso público).
- Uso consistente de `next/image` con `alt` en imágenes revisadas.
- Metadata definida en home, contact, privacidad, términos, how-it-works, instructors, courses y courses/[id].
- `robots.ts` y `sitemap.ts` presentes; Organization JSON-LD en layout; Course y FAQPage en varias páginas.
- Contenido principal de marketing y detalle de curso es server-rendered y rastreable.

**Debilidades críticas**
- **Sitemap incompleto:** no incluye `/privacidad`, `/terminos` ni las URLs dinámicas `/courses/[id]`, por lo que Google puede descubrir tarde o no descubrir cursos publicados.
- **Sin canonical ni control de indexación** en muchas páginas: dashboard, instructor y admin no declaran `noindex`, y las páginas de detalle de curso no fijan canonical explícito.
- **Idioma incorrecto en HTML:** `lang="en"` en el root con contenido en español, lo que perjudica targeting y calidad de índice.
- **Doble H1 en dashboard e instructor:** el header del shell usa `<h1>` y las páginas añaden otro (PageHeader o títulos), lo que diluye la jerarquía y la señal de tema principal.
- **Páginas auth y post-login sin metadata:** login, signup, forgot-password, reset-password, verify-email, verify-email-sent carecen de title/description y de directiva `noindex` donde convenga.

**Impacto estimado**
- Riesgo alto de contenido duplicado o confuso (dashboard/explore/[id] vs courses/[id] sin canonical).
- Oportunidad perdida de indexar bien cada curso público por falta de sitemap dinámico y canonicals.
- Señal semántica y de calidad debilitada por idioma y múltiples H1.

---

## B. Problemas críticos detectados

| # | Problema | Por qué afecta al SEO | Impacto | Propuesta | Prioridad |
|---|----------|------------------------|---------|-----------|-----------|
| 1 | Sitemap sin `/courses/[id]` | Los cursos publicados no se incluyen en el sitemap; descubrimiento e indexación más lentos o incompletos. | Alto | Generar sitemap dinámico: obtener IDs de cursos publicados (Prisma/course-service) y añadir URLs `{siteUrl}/courses/{id}` con lastmod. | Alta |
| 2 | Sitemap sin `/privacidad` ni `/terminos` | Páginas legales no declaradas; cobertura y confianza del sitio menores. | Medio | Añadir `/privacidad` y `/terminos` a la lista de rutas estáticas del sitemap. | Alta |
| 3 | Dashboard, instructor y admin sin noindex | Áreas privadas pueden ser indexadas; contenido duplicado, bajo valor para búsqueda y posible fuga de URLs internas. | Alto | Añadir en los layouts de dashboard, instructor y admin `metadata: { robots: { index: false, follow: false } }` (o equivalente por layout). | Alta |
| 4 | `lang="en"` en `<html>` con sitio en español | Google puede clasificar el contenido como inglés; empeora targeting y calidad para búsquedas en español. | Alto | Cambiar a `lang="es"` en el root layout (o `es-MX` si se quiere afinar). | Alta |
| 5 | Doble H1 en páginas de dashboard/instructor | Dos H1 por página confunden el tema principal y debilitan la jerarquía para buscadores y accesibilidad. | Medio | Que el header del shell no use `<h1>` para el título de sección; usar `<span>` o `<p>` con estilo. Dejar un único H1 por página (contenido). | Alta |
| 6 | Detalle de curso público sin canonical | Riesgo de que se indexen variantes (query params, trailing slash) o que se confunda con dashboard/explore/[id]. | Alto | En `generateMetadata` de `/courses/[id]` añadir `alternates: { canonical: `${siteUrl}/courses/${id}` }`. | Alta |
| 7 | Login, signup, auth sin metadata ni noindex | Títulos genéricos del template y posible indexación de páginas de flujo que no aportan valor orgánico. | Medio | Añadir metadata con title/description y `robots: { index: false, follow: true }` en login, signup, forgot-password, reset-password, verify-email, verify-email-sent. | Alta |

---

## C. Problemas técnicos de SEO

| # | Problema | Por qué afecta | Impacto | Propuesta | Prioridad |
|---|----------|----------------|---------|-----------|-----------|
| 8 | robots.txt permite todo | No se desaconseja el rastreo de /dashboard, /instructor, /admin, /api; desperdicio de crawl budget y riesgo de indexación. | Medio | En `robots.ts` añadir reglas `Disallow: /dashboard`, `Disallow: /instructor`, `Disallow: /admin`, `Disallow: /api`. | Alta |
| 9 | Falta canonical en home y otras estáticas | Evitar que se indexen variantes (www, trailing slash, etc.). | Bajo | Root layout ya tiene `metadataBase`; en home (y donde aplique) fijar `alternates.canonical` a la URL canónica exacta. | Media |
| 10 | Detalle de curso sin Twitter cards explícitas | Menor optimización para compartir y para cualquier uso que haga Twitter de metadata. | Bajo | En `generateMetadata` de `/courses/[id]` añadir `twitter: { card: 'summary_large_image', title, description, images }`. | Media |
| 11 | Open Graph de curso con URL absoluta hardcodeada | `url: "https://cursumi.com/courses/..."` debe depender de `metadataBase` o variable de entorno. | Bajo | Usar `metadataBase` (ya en layout) o `${process.env.NEXT_PUBLIC_APP_URL}/courses/${id}` para OG url. | Media |
| 12 | Páginas 404/notFound sin metadata | Páginas de error pueden ser indexadas con título genérico. | Bajo | Asegurar que `notFound()` o la página de 404 tengan metadata con noindex o título claro. | Baja |

---

## D. Problemas de contenido y on-page SEO

| # | Problema | Por qué afecta | Impacto | Propuesta | Prioridad |
|---|----------|----------------|---------|-----------|-----------|
| 13 | Títulos largos o repetitivos | Algunos títulos podrían truncarse en SERP o no diferenciar bien la página. | Medio | Revisar longitud (≈50–60 caracteres) y unicidad; acortar donde sea necesario manteniendo palabra clave. | Media |
| 14 | Meta descriptions genéricas o faltantes | Descripciones duplicadas o ausentes reducen CTR en resultados de búsqueda. | Medio | Asegurar description única por página, orientada a intención y con CTA o beneficio claro (≈150–160 caracteres). | Media |
| 15 | Listado de cursos sin BreadcrumbList | Pérdida de señal de jerarquía y de rich results (breadcrumbs) en Google. | Bajo | Añadir JSON-LD BreadcrumbList en `/courses` (ej. Inicio > Cursos). | Media |
| 16 | Detalle de curso sin breadcrumb en schema | Misma razón que arriba para la página de detalle. | Bajo | En `/courses/[id]` añadir BreadcrumbList (ej. Inicio > Cursos > [Título curso]). | Media |
| 17 | Schema Course sin offers | Los precios ayudan a rich results y a intención de compra. | Medio | En Course JSON-LD añadir `offers`: tipo Offer con price y priceCurrency (MXN). | Media |
| 18 | Poco contenido único en listado /courses | Página con solo grid de cursos puede posicionar menos que con intro, categorías o copy útil. | Medio | Añadir un párrafo o dos de texto único (qué son los cursos, cómo elegir, etc.) y/o enlaces a categorías. | Baja |

---

## E. Problemas de arquitectura y enlazado interno

| # | Problema | Por qué afecta | Impacto | Propuesta | Prioridad |
|---|----------|----------------|---------|-----------|-----------|
| 19 | Duplicidad conceptual /courses/[id] y /dashboard/explore/[id] | Mismo curso en dos URLs; sin canonical claro puede haber duplicado o competición. | Alto | Mantener una sola URL canónica para tráfico orgánico: `/courses/[id]`. En dashboard/explore/[id] añadir canonical a `/courses/[id]` o redirigir; o noindex y canonical a courses. | Alta |
| 20 | Enlaces internos con anchor genérico | "Ver más", "Aquí", "Clic" no describen el destino y pierden valor de ancla. | Medio | Revisar enlaces en navbar, footer, cards y CTAs; usar anclas descriptivas (ej. "Explorar cursos de programación"). | Media |
| 21 | Footer y navbar sin enlace a términos/privacidad | Menor descubrimiento y señal de que son parte del sitio. | Bajo | Asegurar que footer (y si aplica navbar) enlacen a /terminos y /privacidad. | Media |
| 22 | Páginas huérfanas | Cualquier página que no reciba enlaces internos es más difícil de descubrir y de dar autoridad. | Bajo | Revisar /how-it-works, /instructors, /contact; enlazar desde home, footer o otras páginas relevantes. | Baja |

---

## F. Problemas de rendimiento que afectan SEO

| # | Problema | Por qué afecta | Impacto | Propuesta | Prioridad |
|---|----------|----------------|---------|-----------|-----------|
| 23 | Imágenes sin `sizes` en varios componentes | next/image sin `sizes` puede generar srcset subóptimo y afectar LCP. | Medio | Añadir `sizes` en grids de cursos (ej. (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw) y en hero/cards donde aplique. | Media |
| 24 | Root layout con force-dynamic y revalidate 0 | Toda la app se sirve dinámica; puede afectar TTFB y cache donde no haga falta. | Medio | Evaluar qué rutas pueden ser estáticas o con revalidate; no forzar dynamic en root si no es necesario. | Baja |
| 25 | Posible hidratación pesada en listados | Componentes client que no necesitan ser client pueden aumentar JS y tiempo interactivo. | Bajo | Revisar explore-client, courses-page-client: mantener solo interactividad en cliente y dejar estructura en servidor donde sea posible. | Baja |

---

## G. Quick wins fáciles de implementar

1. **Cambiar `lang` a "es"** en `app/layout.tsx`.
2. **Añadir `/privacidad` y `/terminos`** al sitemap estático.
3. **Canonical en `/courses/[id]`** en generateMetadata.
4. **Twitter cards** en generateMetadata de `/courses/[id]`.
5. **noindex en layouts** de dashboard, instructor y admin.
6. **Metadata + noindex** en login, signup, forgot-password, reset-password, verify-email, verify-email-sent.
7. **robots.ts:** Disallow /dashboard, /instructor, /admin, /api.
8. **DashboardHeader:** dejar de usar `<h1>` para el título de sección; usar elemento no encabezado (evitar doble H1).
9. **Schema Course:** añadir `offers` con price y priceCurrency.
10. **BreadcrumbList** en `/courses` y en `/courses/[id]` (JSON-LD).

---

## H. Mejoras de alto impacto

1. **Sitemap dinámico con todos los cursos publicados:** consultar BD (ids + updatedAt) y generar entradas para `/courses/[id]` con lastmod.
2. **Estrategia única de URL para cursos:** canonical desde dashboard/explore/[id] a /courses/[id] y/o noindex en explore para evitar duplicados.
3. **Revisión de títulos y descriptions** por página: longitud, unicidad y alineación con intención de búsqueda.
4. **WebSite + SearchAction** en layout (opcional): schema para sitio y barra de búsqueda si existe.
5. **Lazy loading y prioridad de imágenes:** asegurar `priority` en LCP (hero, primer curso) y `sizes` en todos los Image de listados.

---

## I. Lista priorizada de cambios recomendados

**Prioridad alta (implementar ya)**  
1. lang="es" en layout.  
2. Sitemap: incluir privacidad, terminos y URLs dinámicas de cursos.  
3. robots: Disallow /dashboard, /instructor, /admin, /api.  
4. noindex en layouts dashboard, instructor, admin.  
5. Metadata + noindex en páginas auth (login, signup, forgot, reset, verify-email, verify-email-sent).  
6. Canonical en /courses/[id] (generateMetadata).  
7. Eliminar doble H1: DashboardHeader sin H1 para el título de sección.  
8. Schema Course con offers (price, priceCurrency).

**Prioridad media**  
9. Twitter cards en detalle de curso.  
10. BreadcrumbList en /courses y /courses/[id].  
11. OG url del curso con metadataBase/variable de entorno.  
12. Añadir `sizes` a next/image en listados y cards de curso.  
13. Enlaces internos con anclas descriptivas y enlaces a términos/privacidad en footer.

**Prioridad baja**  
14. Canonical explícito en home y estáticas.  
15. Revisión de force-dynamic/revalidate en root.  
16. Más contenido único en listado /courses.  
17. 404 con metadata adecuada.

---

## Estado de implementación (post-auditoría)

**Implementado en código:**

- **Alta:** lang="es", sitemap (privacidad, términos, cursos dinámicos), robots disallow, noindex dashboard/instructor/admin, metadata + noindex auth, canonical /courses/[id], doble H1 corregido, Course schema con offers, canonical en explore/[id] apuntando a /courses/[id] con noindex.
- **Media:** Twitter cards en detalle de curso, BreadcrumbList en /courses y /courses/[id], OG url con env, sizes en next/image (listados/cards), enlaces footer a términos/privacidad, canonicals en contact, how-it-works, instructors, privacidad, terminos y home.
- **Baja/Opcional:** 404 con metadata y noindex (not-found.tsx), WebSite JSON-LD en layout, contenido único en listado /courses (párrafo en header), priority en primera imagen del grid de cursos, anclas más descriptivas ("Ver detalles del curso", "Ir al curso").

*Auditoría realizada sobre la base del código y la estructura del proyecto Cursumi. Las prioridades pueden ajustarse según recursos y métricas (Search Console, Core Web Vitals, conversiones).*
