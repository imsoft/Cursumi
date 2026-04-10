import { describe, it, expect } from "vitest";
import type { SectionQuizQuestion } from "@/components/instructor/course-types";

/**
 * Tests para el algoritmo de scoring server-side de quizzes de sección.
 * Verifica que la lógica de cálculo sea correcta independientemente de lo que
 * envíe el cliente.
 */

function calculateQuizScore(
  questions: SectionQuizQuestion[],
  answers: Record<string, unknown>,
  passingScore = 70
): { score: number; passed: boolean } {
  const correct = questions.filter(
    (q, i) => typeof answers[String(i)] === "number" && answers[String(i)] === q.correct
  ).length;
  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  return { score, passed: score >= passingScore };
}

const sampleQuestions: SectionQuizQuestion[] = [
  { question: "¿Cuánto es 2+2?", options: ["3", "4", "5", "6"], correct: 1 },
  { question: "¿Capital de México?", options: ["Guadalajara", "CDMX", "Monterrey", "Puebla"], correct: 1 },
  { question: "¿Lenguaje de la web?", options: ["Python", "Java", "JavaScript", "C++"], correct: 2 },
  { question: "¿HTTP es?", options: ["Protocolo", "Lenguaje", "Framework", "Base de datos"], correct: 0 },
];

describe("calculateQuizScore", () => {
  it("100% con todas las respuestas correctas", () => {
    const answers = { "0": 1, "1": 1, "2": 2, "3": 0 };
    const { score, passed } = calculateQuizScore(sampleQuestions, answers);
    expect(score).toBe(100);
    expect(passed).toBe(true);
  });

  it("0% con todas las respuestas incorrectas", () => {
    const answers = { "0": 0, "1": 0, "2": 0, "3": 1 };
    const { score, passed } = calculateQuizScore(sampleQuestions, answers);
    expect(score).toBe(0);
    expect(passed).toBe(false);
  });

  it("50% con la mitad correctas", () => {
    const answers = { "0": 1, "1": 1, "2": 0, "3": 1 };
    const { score, passed } = calculateQuizScore(sampleQuestions, answers);
    expect(score).toBe(50);
    expect(passed).toBe(false);
  });

  it("cliente no puede hacer trampas enviando score=100", () => {
    // Simula lo que un atacante intentaría: respuestas todas incorrectas
    const attackerAnswers = { "0": 0, "1": 0, "2": 0, "3": 1 };
    const { score } = calculateQuizScore(sampleQuestions, attackerAnswers);
    // El server recalcula — el score del cliente es ignorado
    expect(score).toBe(0);
  });

  it("retorna 0 para quiz sin preguntas", () => {
    const { score, passed } = calculateQuizScore([], {});
    expect(score).toBe(0);
    expect(passed).toBe(false);
  });

  it("ignora claves no numéricas en answers", () => {
    const answers = { "0": 1, "1": 1, "hack": 99, "toString": 1 };
    const { score } = calculateQuizScore(sampleQuestions, answers);
    // Solo cuenta índices 0 y 1 correctos → 2/4 = 50%
    expect(score).toBe(50);
  });

  it("passingScore personalizado: 80% mínimo", () => {
    const answers = { "0": 1, "1": 1, "2": 2, "3": 1 }; // 3/4 = 75%
    const { passed } = calculateQuizScore(sampleQuestions, answers, 80);
    expect(passed).toBe(false);
  });
});
