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

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/**
 * Año y mes (0–11) a los que pertenece la fecha en horario de México.
 *
 * Hace falta porque el servidor corre en UTC: `getMonth()` sobre una compra
 * hecha a las 21:00 del 30 de septiembre en México la sitúa ya en octubre.
 */
function anioMesEnMexico(fecha: Date): { anio: number; mesIndice: number } {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    year: "numeric",
    month: "numeric",
  }).formatToParts(fecha);
  const g = (t: Intl.DateTimeFormatPartTypes) => Number(p.find((x) => x.type === t)?.value ?? "0");
  return { anio: g("year"), mesIndice: g("month") - 1 };
}

const DIAS_EN_INGLES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/**
 * Día de la semana en horario de México: 0 domingo … 6 sábado.
 *
 * El cron diario lo usa para decidir qué recordatorios semanales toca enviar.
 * Con `getDay()` sobre la hora del servidor, una ejecución de madrugada en UTC
 * caería en el día equivocado para México.
 */
export function diaSemanaEnMexico(ref: Date = new Date()): number {
  const nombre = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    weekday: "long",
  }).format(ref);
  return DIAS_EN_INGLES.indexOf(nombre);
}

/** Clave "YYYY-MM" del mes al que pertenece la fecha, en horario de México. */
export function claveMes(fecha: Date): string {
  const { anio, mesIndice } = anioMesEnMexico(fecha);
  return `${anio}-${String(mesIndice + 1).padStart(2, "0")}`;
}

/**
 * Los últimos `n` meses hasta el actual, en horario de México, del más
 * antiguo al más reciente.
 *
 * Se calcula con aritmética sobre año y mes, no construyendo fechas: un
 * `new Date(2026, 8, 1)` en un servidor UTC es el 31 de agosto a las 18:00 en
 * México, y la clave saldría del mes equivocado.
 */
export function ultimosMeses(
  n: number,
  ref: Date = new Date(),
): { clave: string; etiqueta: string }[] {
  const { anio, mesIndice } = anioMesEnMexico(ref);
  const meses: { clave: string; etiqueta: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    let m = mesIndice - i;
    let a = anio;
    while (m < 0) {
      m += 12;
      a -= 1;
    }
    meses.push({
      clave: `${a}-${String(m + 1).padStart(2, "0")}`,
      etiqueta: MESES_CORTOS[m],
    });
  }
  return meses;
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
