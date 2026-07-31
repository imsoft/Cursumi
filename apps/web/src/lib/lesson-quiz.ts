import type { QuizQuestion } from "@/components/instructor/course-types";
import { gradeQuestion, isGradableQuestion, type ExamAnswer } from "@/lib/exam-grading";

/**
 * Quiz de lección: parseo, saneo y calificación.
 *
 * El contenido vive como JSON en `Lesson.content` e incluye las respuestas
 * correctas. Antes se mandaba tal cual al navegador y era el navegador quien
 * calificaba y reportaba la nota, así que un alumno podía leer las respuestas
 * y ponerse la calificación que quisiera. El examen final y los cierres de
 * sección ya se calificaban en el servidor; esto los alinea.
 */

export type LessonQuizQuestion = {
  question: string;
  options: string[];
  type: QuizQuestion["type"];
  correctAnswer?: number;
  correctAnswers?: number[];
  matchRight?: string[];
};

export type LessonQuiz = {
  instructions: string;
  timeLimit: number;
  maxAttempts: number;
  passingRequired: boolean;
  passingScore: number;
  questions: LessonQuizQuestion[];
};

/** Respuesta correcta tal como la espera la UI de revisión. */
export type LessonQuizSolution = number | number[] | string[];

const VACIO: LessonQuiz = {
  instructions: "",
  timeLimit: 0,
  maxAttempts: 0,
  passingRequired: false,
  passingScore: 70,
  questions: [],
};

/** Baraja una copia (Fisher–Yates). No muta el original. */
function barajado<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseLessonQuiz(content: string | null | undefined): LessonQuiz {
  if (!content) return VACIO;
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return VACIO;
  }

  // Formato viejo: un arreglo suelto de preguntas, sin configuración.
  const bruto = Array.isArray(parsed)
    ? { questions: parsed }
    : (parsed as Record<string, unknown> | null);
  if (!bruto || typeof bruto !== "object") return VACIO;

  const lista = Array.isArray(bruto.questions) ? bruto.questions : [];

  return {
    instructions: typeof bruto.instructions === "string" ? bruto.instructions : "",
    timeLimit: Number(bruto.timeLimit) || 0,
    maxAttempts: Number(bruto.attempts) || 0,
    passingRequired: Boolean(bruto.passingRequired),
    passingScore: Number(bruto.passingScore) || 70,
    questions: lista.map((q: Record<string, unknown>) => {
      const type = (typeof q.type === "string" ? q.type : "multiple-choice") as QuizQuestion["type"];
      const options = Array.isArray(q.options)
        ? (q.options as string[])
        : type === "true-false"
          ? ["Verdadero", "Falso"]
          : [];
      return {
        question: typeof q.question === "string" ? q.question : "",
        options,
        type,
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : undefined,
        correctAnswers: Array.isArray(q.correctAnswers) ? (q.correctAnswers as number[]) : undefined,
        matchRight: Array.isArray(q.matchRight) ? (q.matchRight as string[]) : undefined,
      };
    }),
  };
}

/** Convierte a la forma que entiende el calificador compartido. */
function aQuizQuestion(q: LessonQuizQuestion, i: number): QuizQuestion {
  return {
    id: String(i),
    question: q.question,
    type: q.type,
    options: q.options,
    correctAnswer: q.correctAnswer,
    correctAnswers: q.correctAnswers,
    matchRight: q.matchRight,
  };
}

/**
 * Versión del quiz para mandar al navegador: sin respuestas correctas y con las
 * columnas de ordenar/relacionar barajadas (van guardadas en el orden correcto,
 * así que mandarlas tal cual también sería regalar la respuesta).
 */
export function sanitizeLessonQuizContent(content: string | null | undefined): string | null {
  if (!content) return content ?? null;
  const quiz = parseLessonQuiz(content);
  if (quiz.questions.length === 0) return content;

  return JSON.stringify({
    instructions: quiz.instructions,
    timeLimit: quiz.timeLimit,
    attempts: quiz.maxAttempts,
    passingRequired: quiz.passingRequired,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map((q) => ({
      question: q.question,
      type: q.type,
      options: q.type === "ordering" ? barajado(q.options) : q.options,
      ...(q.matchRight ? { matchRight: barajado(q.matchRight) } : {}),
    })),
  });
}

/** La respuesta correcta de una pregunta, para mostrarla DESPUÉS de contestar. */
function solucionDe(q: LessonQuizQuestion): LessonQuizSolution | undefined {
  if (q.type === "checkbox") return q.correctAnswers;
  if (q.type === "ordering") return q.options;
  if (q.type === "matching") return q.matchRight;
  return q.correctAnswer;
}

export function gradeLessonQuiz(
  quiz: LessonQuiz,
  answers: Record<string, ExamAnswer>,
): {
  score: number;
  passed: boolean;
  evaluations: Record<string, boolean>;
  solutions: Record<string, LessonQuizSolution>;
} {
  const evaluations: Record<string, boolean> = {};
  const solutions: Record<string, LessonQuizSolution> = {};
  let calificables = 0;
  let aciertos = 0;

  quiz.questions.forEach((q, i) => {
    const clave = String(i);
    const sol = solucionDe(q);
    if (sol !== undefined) solutions[clave] = sol;

    const pregunta = aQuizQuestion(q, i);
    if (!isGradableQuestion(pregunta)) return;

    calificables++;
    const ok = gradeQuestion(pregunta, answers[clave]);
    evaluations[clave] = ok;
    if (ok) aciertos++;
  });

  // Sin preguntas auto-calificables no hay nada que reprobar.
  const score = calificables > 0 ? Math.round((aciertos / calificables) * 100) : 100;
  const minimo = quiz.passingRequired ? quiz.passingScore : 70;

  return { score, passed: score >= minimo, evaluations, solutions };
}
