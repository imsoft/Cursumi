import { describe, it, expect } from "vitest";
import {
  gradeQuestion,
  gradeExam,
  isGradableQuestion,
  sectionQuizToQuizQuestion,
} from "@/lib/exam-grading";
import type { QuizQuestion, SectionQuizQuestion } from "@/components/instructor/course-types";

const q = (over: Partial<QuizQuestion>): QuizQuestion => ({
  id: "q",
  question: "?",
  type: "multiple-choice",
  ...over,
});

describe("gradeQuestion", () => {
  it("multiple-choice: acierta solo con el índice correcto", () => {
    const question = q({ type: "multiple-choice", options: ["A", "B", "C"], correctAnswer: 1 });
    expect(gradeQuestion(question, 1)).toBe(true);
    expect(gradeQuestion(question, 0)).toBe(false);
    expect(gradeQuestion(question, undefined)).toBe(false);
  });

  it("true-false: acierta con el índice correcto", () => {
    const question = q({ type: "true-false", options: ["Verdadero", "Falso"], correctAnswer: 0 });
    expect(gradeQuestion(question, 0)).toBe(true);
    expect(gradeQuestion(question, 1)).toBe(false);
  });

  it("checkbox: requiere el conjunto exacto (sin sobra ni falta)", () => {
    const question = q({ type: "checkbox", options: ["A", "B", "C", "D"], correctAnswers: [0, 2] });
    expect(gradeQuestion(question, [0, 2])).toBe(true);
    expect(gradeQuestion(question, [2, 0])).toBe(true); // orden no importa
    expect(gradeQuestion(question, [0])).toBe(false); // falta una
    expect(gradeQuestion(question, [0, 2, 3])).toBe(false); // sobra una
    expect(gradeQuestion(question, [])).toBe(false);
  });

  it("ordering: acierta solo con el orden exacto de textos", () => {
    const question = q({ type: "ordering", options: ["Uno", "Dos", "Tres"] });
    expect(gradeQuestion(question, ["Uno", "Dos", "Tres"])).toBe(true);
    expect(gradeQuestion(question, ["Tres", "Uno", "Dos"])).toBe(false);
    expect(gradeQuestion(question, ["Uno", "Dos"])).toBe(false);
  });

  it("matching: cada izquierda debe emparejar con su derecha por texto", () => {
    const question = q({
      type: "matching",
      options: ["Perro", "Gato"],
      matchRight: ["Ladra", "Maulla"],
    });
    expect(gradeQuestion(question, ["Ladra", "Maulla"])).toBe(true);
    expect(gradeQuestion(question, ["Maulla", "Ladra"])).toBe(false);
    expect(gradeQuestion(question, ["Ladra"])).toBe(false);
  });
});

describe("isGradableQuestion", () => {
  it("short-answer no es auto-calificable", () => {
    expect(isGradableQuestion(q({ type: "short-answer" }))).toBe(false);
  });
  it("matching necesita matchRight alineado con options", () => {
    expect(
      isGradableQuestion(q({ type: "matching", options: ["A", "B"], matchRight: ["1"] })),
    ).toBe(false);
    expect(
      isGradableQuestion(q({ type: "matching", options: ["A", "B"], matchRight: ["1", "2"] })),
    ).toBe(true);
  });
});

describe("gradeExam", () => {
  it("calcula score ponderado por puntos y aplica passingScore", () => {
    const questions: QuizQuestion[] = [
      q({ id: "a", type: "multiple-choice", options: ["x", "y"], correctAnswer: 0, points: 1 }),
      q({ id: "b", type: "checkbox", options: ["x", "y", "z"], correctAnswers: [1, 2], points: 3 }),
    ];
    const res = gradeExam(questions, { a: 0, b: [1, 2] }, 80);
    expect(res.evaluations).toEqual({ a: true, b: true });
    expect(res.score).toBe(100);
    expect(res.passed).toBe(true);
  });

  it("una respuesta incorrecta baja el score proporcionalmente a sus puntos", () => {
    const questions: QuizQuestion[] = [
      q({ id: "a", type: "multiple-choice", options: ["x", "y"], correctAnswer: 0, points: 1 }),
      q({ id: "b", type: "ordering", options: ["1", "2", "3"], points: 3 }),
    ];
    const res = gradeExam(questions, { a: 0, b: ["3", "2", "1"] }, 80);
    expect(res.evaluations).toEqual({ a: true, b: false });
    expect(res.score).toBe(25); // 1 de 4 puntos
    expect(res.passed).toBe(false);
  });

  it("sin preguntas auto-calificables aprueba automáticamente", () => {
    const res = gradeExam([q({ type: "short-answer" })], {}, 80);
    expect(res.score).toBe(100);
    expect(res.passed).toBe(true);
  });
});

describe("sectionQuizToQuizQuestion", () => {
  it("mapea multiple-choice legacy (sin type) usando correct como índice", () => {
    const sq: SectionQuizQuestion = { question: "?", options: ["A", "B"], correct: 1 };
    const mapped = sectionQuizToQuizQuestion(sq);
    expect(mapped.type).toBe("multiple-choice");
    expect(gradeQuestion(mapped, 1)).toBe(true);
    expect(gradeQuestion(mapped, 0)).toBe(false);
  });

  it("mapea y califica checkbox / ordering / matching de sección", () => {
    const checkbox: SectionQuizQuestion = {
      question: "?", type: "checkbox", options: ["A", "B", "C"], correct: 0, correctAnswers: [0, 2],
    };
    expect(gradeQuestion(sectionQuizToQuizQuestion(checkbox), [0, 2])).toBe(true);
    expect(gradeQuestion(sectionQuizToQuizQuestion(checkbox), [0])).toBe(false);

    const ordering: SectionQuizQuestion = {
      question: "?", type: "ordering", options: ["Uno", "Dos", "Tres"], correct: 0,
    };
    expect(gradeQuestion(sectionQuizToQuizQuestion(ordering), ["Uno", "Dos", "Tres"])).toBe(true);
    expect(gradeQuestion(sectionQuizToQuizQuestion(ordering), ["Dos", "Uno", "Tres"])).toBe(false);

    const matching: SectionQuizQuestion = {
      question: "?", type: "matching", options: ["Perro", "Gato"], matchRight: ["Ladra", "Maulla"], correct: 0,
    };
    expect(gradeQuestion(sectionQuizToQuizQuestion(matching), ["Ladra", "Maulla"])).toBe(true);
    expect(gradeQuestion(sectionQuizToQuizQuestion(matching), ["Maulla", "Ladra"])).toBe(false);
  });
});
