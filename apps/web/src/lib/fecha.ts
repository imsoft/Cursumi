/**
 * Fechas en español, armadas pieza por pieza y en horario de la Ciudad de México.
 *
 * Nada de `dateStyle`/`timeStyle` de `toLocaleString`: el patrón que une fecha y
 * hora ("a las" vs ",") depende de los datos ICU de cada entorno, así que Node y
 * el navegador generan textos distintos y React falla al hidratar. Con partes
 * numéricas y los meses escritos aquí, el resultado es idéntico en ambos lados.
 *
 * La zona horaria va fija a propósito: si dependiera del dispositivo, el
 * servidor y el cliente discreparían, y dos personas verían horas distintas
 * para el mismo evento.
 */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const ZONA = "America/Mexico_City";

function partes(fecha: Date | string) {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: Intl.DateTimeFormatPartTypes) => p.find((x) => x.type === t)?.value ?? "";
  return {
    dia: Number(g("day")),
    mes: MESES[Number(g("month")) - 1] ?? "",
    anio: g("year"),
    // "24" a medianoche en algunos entornos → normalizamos a "00".
    hora: g("hour") === "24" ? "00" : g("hour"),
    minuto: g("minute"),
  };
}

/** "11 de agosto" — para listas donde el año se sobreentiende. */
export function fechaCorta(fecha: Date | string | null | undefined): string {
  if (!fecha) return "";
  const { dia, mes } = partes(fecha);
  return `${dia} de ${mes}`;
}

/** "11 de agosto de 2026" */
export function fechaLarga(fecha: Date | string | null | undefined): string {
  if (!fecha) return "";
  const { dia, mes, anio } = partes(fecha);
  return `${dia} de ${mes} de ${anio}`;
}

/** "11 de agosto de 2026, 09:00 h" */
export function fechaHora(fecha: Date | string | null | undefined): string {
  if (!fecha) return "";
  const { dia, mes, anio, hora, minuto } = partes(fecha);
  return `${dia} de ${mes} de ${anio}, ${hora}:${minuto} h`;
}
