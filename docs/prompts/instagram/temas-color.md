# Temas de color Cursumi — bloques para pegar en la sección 2 del prompt maestro

Elige uno y pégalo entero donde dice "AQUÍ VA EL TEMA DE COLOR".

---

## TEMA OSCURO

```
**Tema de color: Oscuro.**

| Rol | Color |
|---|---|
| Fondo | #09090B |
| Superficie / tarjeta | #18181B |
| Texto principal | #FAFAFA |
| Texto secundario | #A1A1AA |
| Acento | #6500F9 |
| Borde / divisor | rgba(255,255,255,0.10) |

Reglas de este tema:
- El violeta #6500F9 no alcanza contraste suficiente para texto de cuerpo sobre este fondo: úsalo solo en números grandes, formas, iconos, barras y bordes. Todo el texto pequeño va en #FAFAFA o #A1A1AA.
- El degradado de marca linear-gradient(135deg, #4300D0 0%, #A400E3 90%) puede aparecer en un único elemento de la portada y otro del slide final. Nunca en los intermedios.
- El slide de contraste a mitad del carrusel usa fondo #18181B en lugar de #09090B.
- Logo Cursumi a color, sobre el fondo negro.
```

---

## TEMA VIOLETA

```
**Tema de color: Violeta.**

| Rol | Color |
|---|---|
| Fondo | #4F00F6 plano, o el degradado de marca linear-gradient(135deg, #4300D0 0%, #A400E3 90%) |
| Superficie / tarjeta | rgba(255,255,255,0.12) |
| Texto principal | #FFFFFF |
| Texto secundario | rgba(255,255,255,0.75) |
| Acento | #FFFFFF, con lila claro #D6BCFF como acento secundario |
| Borde / divisor | rgba(255,255,255,0.22) |

Reglas de este tema:
- Sobre fondo violeta no se añade más violeta: el contraste lo dan el blanco y el lila claro. Nada de #6500F9 ni #4F00F6 como elementos encima.
- Si usas el degradado, aplícalo al lienzo completo y mantén la dirección de 135° idéntica en todos los slides, para que no salte al deslizar.
- El slide de contraste a mitad del carrusel usa fondo #4F00F6 plano si el resto va en degradado, o al revés.
- Logo Cursumi en versión monocromática blanca.
- Este tema satura si se prolonga: mantén el carrusel entre 5 y 7 slides.
```

---

## TEMA CLARO

```
**Tema de color: Claro.**

| Rol | Color |
|---|---|
| Fondo | #FAFAFA |
| Superficie / tarjeta | #F4F4F5 |
| Texto principal | #09090B |
| Texto secundario | #52525B |
| Acento | #4F00F6 |
| Borde / divisor | #E4E4E7 |

Reglas de este tema:
- El texto secundario nunca va en #A1A1AA: no alcanza contraste sobre fondo claro. Siempre #52525B.
- El violeta #4F00F6 sí funciona como color de texto sobre este fondo, además de como color de formas y botones.
- El degradado de marca linear-gradient(135deg, #4300D0 0%, #A400E3 90%) puede usarse en un único elemento de la portada y otro del slide final, siempre con texto blanco encima.
- El slide de contraste a mitad del carrusel usa fondo #F4F4F5 en lugar de #FAFAFA.
- Logo Cursumi a color, sobre el fondo claro.
```

---

## Cuándo usar cada uno

| Tema | Úsalo para | Evítalo cuando |
|---|---|---|
| **Oscuro** | Por defecto. Diagnósticos, datos duros, tono editorial serio. Es el que más destaca como miniatura en el feed. | El slide tiene mucho texto denso: cansa la vista. |
| **Violeta** | Anuncios, lanzamientos, frases de marca, celebraciones, carruseles cortos de alto impacto. | El carrusel pasa de 7 slides, o el contenido es técnico y detallado. |
| **Claro** | Contenido denso: comparativas, listas largas, capturas de producto, testimonios, guías paso a paso. | Buscas máximo impacto visual en el feed; el claro compite peor por atención. |

## Reglas de mezcla

- **Un solo tema por carrusel.** Alternar claro y oscuro entre slides produce parpadeo al deslizar y rompe la percepción de pieza única.
- **Única excepción, el patrón "sándwich":** portada y slide final en Violeta, todos los intermedios en Oscuro o Claro. Funciona porque el cambio ocurre en los extremos, nunca a mitad del recorrido. Para usarlo, pega el bloque del tema intermedio y añade esta línea: *"Excepción: la portada y el slide final usan el tema Violeta; el resto usa el tema indicado arriba."*
- **La variedad se gana entre publicaciones, no dentro de una.** La cuadrícula del perfil se lee en filas de tres: alterna temas post a post y no coloques dos carruseles Violeta seguidos, o el perfil pierde jerarquía.
- **El andamiaje nunca cambia con el tema.** Márgenes, escala tipográfica, retícula y tratamiento gráfico son idénticos en los tres. Solo cambia la capa de color.
