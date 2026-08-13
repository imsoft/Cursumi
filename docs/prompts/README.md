# Prompts

Prompts reutilizables para trabajar con herramientas de IA en Cursumi. Cada subcarpeta agrupa los de un mismo propósito.

| Carpeta | Contenido |
|---|---|
| [instagram/](./instagram/) | Contenido social: carruseles de Instagram y el sistema de color de marca. |
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

## dev/

| Archivo | Para qué sirve |
|---|---|
| [build-validation.md](./dev/build-validation.md) | Pide ejecutar `pnpm build` como paso de validación principal y corregir errores hasta dejar el proyecto en estado desplegable. |
