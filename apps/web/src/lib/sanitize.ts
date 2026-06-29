import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitiza HTML generado por el editor Lexical (o cualquier contenido de
 * instructores/blog) antes de inyectarlo con `dangerouslySetInnerHTML`.
 *
 * Aunque el contenido lo escriben instructores, son usuarios semi-confiables
 * (cualquiera puede registrarse como instructor y enviar HTML directo a la API),
 * así que tratamos su contenido como NO confiable. Esto previene XSS almacenado:
 * scripts inyectados se ejecutarían porque la CSP permite `script-src
 * 'unsafe-inline'`.
 *
 * Allowlist alineada con lo que produce el editor Lexical:
 * párrafos, encabezados, listas, negrita/cursiva/subrayado/tachado, citas y
 * enlaces. Se eliminan `<script>`, manejadores `on*`, `javascript:` URIs, etc.
 */
const ALLOWED_TAGS = [
  "p", "br", "span", "strong", "b", "em", "i", "u", "s", "strike",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "code", "pre", "a",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class", "dir"];

/**
 * Serializa un objeto para un `<script type="application/ld+json">` de forma
 * segura. `JSON.stringify` NO escapa `<`, así que un string de usuario con
 * `</script>` podría romper el bloque e inyectar HTML. Escapamos `<` a su forma
 * Unicode (válida en JSON y aceptada por los parsers de schema.org).
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Solo esquemas seguros en href (bloquea javascript:, data:, etc.)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    // Fuerza rel seguro y evita reverse tabnabbing cuando hay target="_blank"
    ADD_ATTR: ["target"],
  });
}
