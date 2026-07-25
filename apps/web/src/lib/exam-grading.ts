import type { QuizQuestion, SectionQuizQuestion } from "@/components/instructor/course-types";

/** Convierte una pregunta de quiz de sección al tipo rico para reusar la calificación/render. */
export function sectionQuizToQuizQuestion(sq: SectionQuizQuestion): QuizQuestion {
  return {
    id: "",
    question: sq.question,
    type: sq.type ?? "multiple-choice",
    options: sq.options,
    correctAnswer: sq.correct,
    correctAnswers: sq.correctAnswers,
    matchRight: sq.matchRight,
  };
}

/**
 * Respuesta de un alumno a una pregunta del examen:
 *  - number   → multiple-choice / true-false (índice de la opción)
 *  - number[] → checkbox (índices seleccionados)
 *  - string[] → ordering (textos en el orden elegido) / matching (texto derecho
 *               elegido para cada elemento izquierdo, en el orden de options)
 */
export type ExamAnswer = number | number[] | string[];

/** ¿La pregunta se puede calificar automáticamente (tiene su respuesta correcta)? */
export function isGradableQuestion(q: QuizQuestion): boolean {
  switch (q.type) {
    case "multiple-choice":
    case "true-false":
      return q.correctAnswer !== undefined;
    case "checkbox":
      return Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0;
    case "ordering":
      return Array.isArray(q.options) && q.options.length > 0;
    case "matching":
      return (
        Array.isArray(q.options) &&
        q.options.length > 0 &&
        Array.isArray(q.matchRight) &&
        q.matchRight.length === q.options.length
      );
    default:
      return false; // short-answer u otros: no auto-calificable
  }
}

/** Califica una respuesta contra la definición ORIGINAL de la pregunta (server-side). */
export function gradeQuestion(q: QuizQuestion, answer: ExamAnswer | undefined): boolean {
  if (answer === undefined) return false;
  switch (q.type) {
    case "multiple-choice":
    case "true-false":
      return typeof answer === "number" && answer === q.correctAnswer;

    case "checkbox": {
      if (!Array.isArray(answer) || !q.correctAnswers) return false;
      const selected = new Set(answer as number[]);
      const correct = new Set(q.correctAnswers);
      return selected.size === correct.size && [...correct].every((c) => selected.has(c));
    }

    case "ordering": {
      if (!Array.isArray(answer) || !q.options) return false;
      const a = answer as string[];
      // options está guardado en el orden CORRECTO; la respuesta son los textos ordenados por el alumno
      return a.length === q.options.length && a.every((t, i) => t === q.options![i]);
    }

    case "matching": {
      if (!Array.isArray(answer) || !q.options || !q.matchRight) return false;
      const a = answer as string[];
      // matchRight[i] es la pareja correcta de options[i]; la respuesta es el texto elegido por cada izquierda
      return a.length === q.options.length && a.every((t, i) => t === q.matchRight![i]);
    }

    default:
      return false;
  }
}

/** Calcula evaluations (correcto/incorrecto por pregunta), score y passed. */
export function gradeExam(
  questions: QuizQuestion[],
  answers: Record<string, ExamAnswer>,
  passingScore: number,
): { evaluations: Record<string, boolean>; score: number; passed: boolean } {
  let totalPoints = 0;
  let earnedPoints = 0;
  const evaluations: Record<string, boolean> = {};

  for (const q of questions) {
    if (!isGradableQuestion(q)) continue;
    const pts = Math.max(1, q.points ?? 1);
    totalPoints += pts;
    const ok = gradeQuestion(q, answers[q.id]);
    evaluations[q.id] = ok;
    if (ok) earnedPoints += pts;
  }

  // Si no hay preguntas auto-calificables, se aprueba automáticamente.
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
  return { evaluations, score, passed: score >= passingScore };
}
