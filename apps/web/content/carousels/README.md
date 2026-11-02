# Carruseles

Cada `.md` de esta carpeta es un carrusel. Para generar las imágenes:

```sh
pnpm --filter @cursumi/web carousel content/carousels/deja-de-releer.md
```

Salen en `content/carousels/out/<nombre>/01.png, 02.png…` (1080×1350, fuera de git).

## Formato

```md
> Mito                         ← etiqueta opcional (solo tiene sentido en la portada)
# No eres "visual".            ← título
Te **mintieron**.              ← párrafo; **así** resalta en blanco
1. Paso uno                    ← lista numerada (o "- " para viñeta)
Fuente: Autor (año), Revista   ← fuente al pie
---                            ← siguiente slide
```

- La primera slide es la portada ("Desliza →") y la última el cierre (cursumi.com + @cursumi).
- 6–9 slides; título corto, 1–3 líneas de texto por slide.
- Sin emojis: la tipografía no los trae y saldrían como cuadros.
