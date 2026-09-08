# Prompts

Prompts reutilizables para trabajar con herramientas de IA en Cursumi. Cada subcarpeta agrupa los de un mismo propósito.

| Carpeta | Contenido |
|---|---|
| [instagram/](./instagram/) | Contenido social: carruseles de Instagram y el sistema de color de marca. |
| [marketing/](./marketing/) | Planificación: el plan de marketing mensual como documento diseñado. |
| [dev/](./dev/) | Prompts de desarrollo: validación del build. |

## instagram/

| Archivo | Para qué sirve |
|---|---|
| [carrusel-maestro.md](./instagram/carrusel-maestro.md) | Prompt maestro para carruseles de Instagram (Claude Design). Autocontenido: rellenas TEMA, COPY BASE y COLOR arriba, y lo copias entero. |
| [descripcion-hashtags.md](./instagram/descripcion-hashtags.md) | Prompt para el pie de publicación y los hashtags, a partir del carrusel ya definido. Autocontenido: rellenas PUBLICACIÓN, OBJETIVO y CURSO. |
| [descripcion-hashtags.md](./instagram/descripcion-hashtags.md) | Prompt para el pie de publicación y los hashtags, a partir del carrusel ya definido. Autocontenido igual que el maestro. |
| [temas-color.md](./instagram/temas-color.md) | Referencia de las tres paletas de marca y de cuándo conviene cada una. Consulta previa: las paletas ya van dentro del prompt maestro. |

Cómo usarlo:

1. Abre `instagram/carrusel-maestro.md` y rellena las tres primeras secciones: **TEMA**, **COPY BASE** y **COLOR** (Oscuro, Violeta o Claro).
2. Copia el archivo entero y mándalo a Claude Design.
3. Antes de generar imágenes te devolverá el **mapa de láminas** para que lo apruebes o lo corrijas.
4. Con el mapa aprobado, rellena `instagram/descripcion-hashtags.md` y mándalo para obtener el pie y los hashtags.

El prompt del carrusel ya pide un pie y unos hashtags como entregable. Usa el prompt de descripción cuando quieras trabajarlos en serio: da tres versiones de distinta longitud, alternativas de primera línea con su conteo de caracteres y el set de hashtags desglosado.

Los colores de los temas salen de la identidad real de la marca: el logo (`apps/web/public/logos/cursumi.svg`) y los tokens de `apps/web/src/app/globals.css`. Si cambia la paleta del producto, actualiza también `instagram/temas-color.md` para que el contenido social no se desalinee.

## marketing/

| Archivo | Para qué sirve |
|---|---|
| [plan-mensual.md](./marketing/plan-mensual.md) | Prompt para el plan de marketing de un mes como documento diseñado (Claude Design). Autocontenido: rellenas MES, OBJETIVO, FRECUENCIA y NOTAS arriba, y lo copias entero. Viene precargado con septiembre de 2026 (fiestas patrias + cierre de Q3, educación en general, sin promoción de cursos). |

Cómo usarlo:

1. Abre `marketing/plan-mensual.md`, revisa las cuatro secciones de arriba y ajusta lo que cambie ese mes.
2. Copia el archivo entero y mándalo a Claude Design.
3. Primero te devuelve el **esquema y los temas por semana** en texto; apruébalo o corrígelo.
4. Con el esquema aprobado, produce el documento. Las piezas de cada publicación se hacen después con los prompts de `instagram/`.

El documento usa el Tema Claro en el interior y el Violeta solo en portada, con las mismas paletas de `instagram/temas-color.md`.

## dev/

| Archivo | Para qué sirve |
|---|---|
| [build-validation.md](./dev/build-validation.md) | Pide ejecutar `pnpm build` como paso de validación principal y corregir errores hasta dejar el proyecto en estado desplegable. |
