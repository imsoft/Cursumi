import sanitizeHtmlLib from "sanitize-html";

/**
 * Sanitiza HTML generado por el editor Lexical (o cualquier contenido de
 * instructores/blog) antes de inyectarlo con `dangerouslySetInnerHTML`.
 *
 * Aunque el contenido lo escriben instructores, son usuarios semi-confiables
 * (cualquiera puede registrarse como instructor y enviar HTML directo a la API),
 * así que tratamos su contenido como NO confiable. Esto previene XSS almacenado.
 *
 * Usamos `sanitize-html` (JS puro, sin jsdom) porque corre igual en server (SSR)
 * y cliente. La allowlist está alineada con lo que produce el editor Lexical:
 * párrafos, encabezados, listas, negrita/cursiva/subrayado/tachado, citas y
 * enlaces. Se eliminan `<script>`, manejadores `on*`, `javascript:` URIs, etc.
 */
const ALLOWED_TAGS = [
  "p", "br", "span", "strong", "b", "em", "i", "u", "s", "strike",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "code", "pre", "a",
];

/**
 * Serializa un objeto para un `<script type="application/ld+json">` de forma
 * segura. `JSON.stringify` NO escapa `<`, así que un string de usuario con
 * `</script>` podría romper el bloque e inyectar HTML. Escapamos `<` a su forma
 * Unicode (válida en JSON y aceptada por los parsers de schema.org).
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Marca los `<li>` que solo envuelven una sublista (`<li><ul>…`), que es como
 * Lexical guarda una sublista sin elemento padre. Sin la clase, ese envoltorio
 * pinta su propio número y la lista sale "1. 2. • …". Un `<li>Texto<ul>` normal
 * no se toca: ahí el número sí corresponde al texto.
 */
export function markNestedListItems(html: string): string {
  return html.replace(/<li(\s[^>]*)?>(\s*<(?:ul|ol)[\s>])/gi, (_m, attrs: string | undefined, rest: string) => {
    const a = attrs ?? "";
    if (/\brte-nested-item\b/.test(a)) return `<li${a}>${rest}`;
    const withClass = /\bclass="/i.test(a)
      ? a.replace(/\bclass="/i, 'class="rte-nested-item ')
      : `${a} class="rte-nested-item"`;
    return `<li${withClass}>${rest}`;
  });
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return markNestedListItems(sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      "*": ["class", "dir"],
    },
    // Solo esquemas seguros en href (bloquea javascript:, data:, etc.)
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Evita reverse tabnabbing cuando hay target="_blank"
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  }));
}
