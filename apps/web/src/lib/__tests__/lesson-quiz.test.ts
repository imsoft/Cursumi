import { describe, it, expect } from "vitest";
import {
  parseLessonQuiz,
  sanitizeLessonQuizContent,
  gradeLessonQuiz,
} from "@/lib/lesson-quiz";

const CONTENIDO = JSON.stringify({
  instructions: "Contesta todo",
  passingRequired: true,
  passingScore: 60,
  questions: [
    { question: "¿Capital de México?", type: "multiple-choice", options: ["CDMX", "Lima", "Bogotá"], correctAnswer: 0 },
    { question: "¿Cuáles son pares?", type: "checkbox", options: ["1", "2", "3", "4"], correctAnswers: [1, 3] },
    { question: "Ordena", type: "ordering", options: ["uno", "dos", "tres"] },
    { question: "Relaciona", type: "matching", options: ["A", "B"], matchRight: ["1", "2"] },
  ],
});

describe("parseLessonQuiz", () => {
  it("lee la configuración y las preguntas", () => {
    const q = parseLessonQuiz(CONTENIDO);
    expect(q.passingScore).toBe(60);
    expect(q.passingRequired).toBe(true);
    expect(q.questions).toHaveLength(4);
  });

  it("aguanta contenido inválido sin reventar", () => {
    expect(parseLessonQuiz("no soy json").questions).toEqual([]);
    expect(parseLessonQuiz(null).questions).toEqual([]);
    expect(parseLessonQuiz("").questions).toEqual([]);
  });
});

describe("sanitizeLessonQuizContent — lo que ve el navegador", () => {
  const limpio = sanitizeLessonQuizContent(CONTENIDO)!;

  it("no deja rastro de las respuestas correctas", () => {
    expect(limpio).not.toContain("correctAnswer");
    expect(limpio).not.toContain("correctAnswers");
  });

  it("conserva enunciados, opciones y configuración", () => {
    const p = JSON.parse(limpio);
    expect(p.questions[0].question).toBe("¿Capital de México?");
    expect(p.questions[0].options).toHaveLength(3);
    expect(p.passingScore).toBe(60);
  });

  it("baraja la columna derecha de 'relacionar' (venía alineada = era la respuesta)", () => {
    const p = JSON.parse(limpio);
    expect(p.questions[3].matchRight).toHaveLength(2);
    expect([...p.questions[3].matchRight].sort()).toEqual(["1", "2"]);
  });
});

describe("gradeLessonQuiz — la nota la pone el servidor", () => {
  const quiz = parseLessonQuiz(CONTENIDO);

  it("califica todo correcto", () => {
    const r = gradeLessonQuiz(quiz, {
      "0": 0,
      "1": [1, 3],
      "2": ["uno", "dos", "tres"],
      "3": ["1", "2"],
    });
    expect(r.score).toBe(100);
    expect(r.passed).toBe(true);
  });

  it("califica todo mal", () => {
    const r = gradeLessonQuiz(quiz, {
      "0": 2,
      "1": [0],
      "2": ["tres", "dos", "uno"],
      "3": ["2", "1"],
    });
    expect(r.score).toBe(0);
    expect(r.passed).toBe(false);
  });

  it("no da por buena una selección parcial en checkbox", () => {
    const r = gradeLessonQuiz(quiz, { "0": 0, "1": [1] });
    expect(r.evaluations["1"]).toBe(false);
  });

  it("respeta el mínimo de aprobación del quiz (60, no el 70 por defecto)", () => {
    // 3 de 4 = 75% → aprueba con 60
    const r = gradeLessonQuiz(quiz, {
      "0": 0,
      "1": [1, 3],
      "2": ["uno", "dos", "tres"],
      "3": ["2", "1"],
    });
    expect(r.score).toBe(75);
    expect(r.passed).toBe(true);
  });

  it("sin respuestas, reprueba — no se aprueba por omisión", () => {
    const r = gradeLessonQuiz(quiz, {});
    expect(r.score).toBe(0);
    expect(r.passed).toBe(false);
  });

  it("devuelve las soluciones para pintar la revisión", () => {
    const r = gradeLessonQuiz(quiz, {});
    expect(r.solutions["0"]).toBe(0);
    expect(r.solutions["1"]).toEqual([1, 3]);
    expect(r.solutions["2"]).toEqual(["uno", "dos", "tres"]);
    expect(r.solutions["3"]).toEqual(["1", "2"]);
  });
});
