import { describe, it, expect } from "vitest";
import {
  parseSectionQuizFromLessonContent,
  parseSectionMinigameFromLessonContent,
  stringifySectionQuizPayload,
  stringifySectionMinigamePayload,
  gateActivityFromLesson,
  listSectionGateUnitsForUi,
} from "../gate-lesson-content";
import type { SectionQuiz, SectionMinigame } from "@/components/instructor/course-types";

// ─── parseSectionQuizFromLessonContent ────────────────────────────────────────

describe("parseSectionQuizFromLessonContent", () => {
  const validQuiz: SectionQuiz = {
    passingScore: 70,
    questions: [
      { question: "¿Pregunta?", options: ["A", "B", "C"], correct: 0 },
    ],
  };

  it("parsea JSON de quiz válido", () => {
    const result = parseSectionQuizFromLessonContent(JSON.stringify(validQuiz));
    expect(result).not.toBeNull();
    expect(result?.passingScore).toBe(70);
    expect(result?.questions).toHaveLength(1);
  });

  it("retorna null para string vacío", () => {
    expect(parseSectionQuizFromLessonContent("")).toBeNull();
    expect(parseSectionQuizFromLessonContent(null)).toBeNull();
    expect(parseSectionQuizFromLessonContent(undefined)).toBeNull();
  });

  it("retorna null para JSON inválido", () => {
    expect(parseSectionQuizFromLessonContent("{broken json")).toBeNull();
  });

  it("retorna null si falta passingScore", () => {
    const noScore = JSON.stringify({ questions: [{ question: "q", options: ["a"], correct: 0 }] });
    expect(parseSectionQuizFromLessonContent(noScore)).toBeNull();
  });

  it("retorna null si falta questions o no es array", () => {
    const noQuestions = JSON.stringify({ passingScore: 70 });
    expect(parseSectionQuizFromLessonContent(noQuestions)).toBeNull();
  });

  it("retorna null para string no-JSON", () => {
    expect(parseSectionQuizFromLessonContent("hola mundo")).toBeNull();
  });
});

// ─── parseSectionMinigameFromLessonContent ────────────────────────────────────

describe("parseSectionMinigameFromLessonContent", () => {
  const validMinigame = { type: "memory", pairs: [{ term: "a", definition: "b" }] };

  it("parsea JSON de minigame válido", () => {
    const result = parseSectionMinigameFromLessonContent(JSON.stringify(validMinigame));
    expect(result).not.toBeNull();
    expect((result as SectionMinigame & { type: string }).type).toBe("memory");
  });

  it("retorna null para string vacío o null", () => {
    expect(parseSectionMinigameFromLessonContent("")).toBeNull();
    expect(parseSectionMinigameFromLessonContent(null)).toBeNull();
  });

  it("retorna null si falta el campo type", () => {
    expect(parseSectionMinigameFromLessonContent(JSON.stringify({ pairs: [] }))).toBeNull();
  });

  it("retorna null para JSON inválido", () => {
    expect(parseSectionMinigameFromLessonContent("{broken")).toBeNull();
  });
});

// ─── stringify round-trips ────────────────────────────────────────────────────

describe("stringify round-trip", () => {
  it("quiz: stringify → parse mantiene datos", () => {
    const quiz: SectionQuiz = {
      passingScore: 80,
      questions: [{ question: "¿Q?", options: ["A", "B"], correct: 1 }],
    };
    const json = stringifySectionQuizPayload(quiz);
    const parsed = parseSectionQuizFromLessonContent(json);
    expect(parsed?.passingScore).toBe(80);
    expect(parsed?.questions[0].correct).toBe(1);
  });

  it("minigame: stringify → parse mantiene datos", () => {
    const minigame = { type: "flashcard", pairs: [{ term: "x", definition: "y" }] } as unknown as SectionMinigame;
    const json = stringifySectionMinigamePayload(minigame);
    const parsed = parseSectionMinigameFromLessonContent(json);
    expect(parsed).not.toBeNull();
    expect((parsed as { type: string }).type).toBe("flashcard");
  });
});

// ─── gateActivityFromLesson ───────────────────────────────────────────────────

describe("gateActivityFromLesson", () => {
  const quizContent = JSON.stringify({
    passingScore: 70,
    questions: [{ question: "¿?", options: ["A"], correct: 0 }],
  });
  const minigameContent = JSON.stringify({ type: "memory", pairs: [] });

  it("genera actividad quiz para lección section_quiz", () => {
    const result = gateActivityFromLesson({ id: "l1", type: "section_quiz", content: quizContent });
    expect(result?.kind).toBe("quiz");
    expect(result?.id).toBe("l1");
  });

  it("genera actividad minigame para lección section_minigame", () => {
    const result = gateActivityFromLesson({ id: "l2", type: "section_minigame", content: minigameContent });
    expect(result?.kind).toBe("minigame");
  });

  it("retorna null para tipos normales de lección", () => {
    expect(gateActivityFromLesson({ id: "l3", type: "video", content: null })).toBeNull();
    expect(gateActivityFromLesson({ id: "l4", type: "text", content: "texto" })).toBeNull();
  });

  it("retorna null para section_quiz con contenido vacío", () => {
    expect(gateActivityFromLesson({ id: "l5", type: "section_quiz", content: null })).toBeNull();
    expect(gateActivityFromLesson({ id: "l6", type: "section_quiz", content: "" })).toBeNull();
  });

  it("retorna null para section_quiz con quiz sin preguntas", () => {
    const emptyQuiz = JSON.stringify({ passingScore: 70, questions: [] });
    expect(gateActivityFromLesson({ id: "l7", type: "section_quiz", content: emptyQuiz })).toBeNull();
  });
});

// ─── listSectionGateUnitsForUi ────────────────────────────────────────────────

describe("listSectionGateUnitsForUi", () => {
  const sampleQuiz = {
    passingScore: 70,
    questions: [{ question: "¿?", options: ["a", "b"], correct: 0 }],
  };
  const sampleMinigame = { type: "memory", pairs: [] };
  const quizContent = JSON.stringify({ passingScore: 70, questions: [{ question: "¿?", options: ["a"], correct: 0 }] });
  const miniContent = JSON.stringify({ type: "memory", pairs: [] });

  it("retorna vacío para sección sin actividades ni lecciones gate", () => {
    const result = listSectionGateUnitsForUi({ id: "s1", lessons: [] });
    expect(result).toHaveLength(0);
  });

  it("usa actividades legacy (quiz) si existen", () => {
    const result = listSectionGateUnitsForUi({ id: "s1", quiz: sampleQuiz });
    expect(result).toHaveLength(1);
    expect(result[0].sectionId).toBe("s1");
  });

  it("usa actividades legacy (quiz + minigame) si existen", () => {
    const result = listSectionGateUnitsForUi({ id: "s1", quiz: sampleQuiz, minigame: sampleMinigame });
    expect(result).toHaveLength(2);
  });

  it("usa lecciones section_quiz si no hay legacy", () => {
    const lessons = [
      { id: "l1", type: "section_quiz", content: quizContent },
      { id: "l2", type: "video", content: null },
    ];
    const result = listSectionGateUnitsForUi({ id: "s1", lessons });
    expect(result).toHaveLength(1);
    expect(result[0].activityId).toBe("l1");
  });

  it("usa lecciones section_minigame si no hay legacy", () => {
    const lessons = [{ id: "l1", type: "section_minigame", content: miniContent }];
    const result = listSectionGateUnitsForUi({ id: "s1", lessons });
    expect(result).toHaveLength(1);
  });

  it("prioriza legacy sobre lecciones individuales", () => {
    const lessons = [{ id: "l1", type: "section_quiz", content: quizContent }];
    // Sección con legacy quiz Y lección section_quiz → solo legacy
    const result = listSectionGateUnitsForUi({ id: "s1", quiz: sampleQuiz, lessons });
    const fromLegacy = result.filter((r) => r.activityId !== "l1");
    expect(result).toHaveLength(1);
    expect(fromLegacy).toHaveLength(1); // legacy id = "default", not "l1"
  });
});
