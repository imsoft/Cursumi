/**
 * Opciones de una pregunta de opción única o de varias correctas en el editor
 * del examen. Lógica pura para poder probarla sin montar el editor.
 */

/** Tope de opciones por pregunta. El botón y la función usan el mismo número:
 *  antes el botón aparecía hasta 6 y la función dejaba de agregar en 5. */
export const MAX_CHOICE_OPTIONS = 10;
export const MIN_CHOICE_OPTIONS = 2;

type ChoiceQuestion = {
  options?: string[];
  correctAnswer?: number | string;
  correctAnswers?: number[];
};

export function canAddOption(q: ChoiceQuestion): boolean {
  return (q.options?.length ?? 0) < MAX_CHOICE_OPTIONS;
}

export function addOption<Q extends ChoiceQuestion>(q: Q): Q {
  if (!q.options || !canAddOption(q)) return q;
  return { ...q, options: [...q.options, ""] };
}

/**
 * Quita una opción y recorre los índices de las respuestas correctas, que se
 * guardan por posición: sin recorrerlos, borrar la opción 1 dejaba marcada
 * como correcta la que antes era la 3.
 */
export function removeOption<Q extends ChoiceQuestion>(q: Q, idx: number): Q {
  if (!q.options || q.options.length <= MIN_CHOICE_OPTIONS || idx < 0 || idx >= q.options.length) return q;
  const next: Q = { ...q, options: q.options.filter((_, i) => i !== idx) };
  if (typeof q.correctAnswer === "number") {
    next.correctAnswer = q.correctAnswer === idx ? 0 : q.correctAnswer > idx ? q.correctAnswer - 1 : q.correctAnswer;
  }
  if (q.correctAnswers) {
    next.correctAnswers = q.correctAnswers.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i));
  }
  return next;
}
