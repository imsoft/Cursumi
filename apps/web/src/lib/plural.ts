/**
 * Concordancia de número en español.
 *
 * Evita textos como "1 preguntas" o "1 lecciones". El plural se pasa explícito
 * porque en español no basta con añadir una "s": lección→lecciones,
 * sesión→sesiones, día→días.
 */

/** Devuelve el sustantivo en la forma que corresponde al número. */
export function plural(n: number, singular: string, pluralForm: string): string {
  return n === 1 ? singular : pluralForm;
}

/**
 * Número + sustantivo concordado: `contar(1, "curso", "cursos")` → "1 curso".
 *
 * Un valor nulo o indefinido cuenta como 0, para que un dato que aún no cargó
 * no rompa el texto.
 */
export function contar(
  n: number | null | undefined,
  singular: string,
  pluralForm: string,
): string {
  const v = n ?? 0;
  return `${v} ${plural(v, singular, pluralForm)}`;
}
