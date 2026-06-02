import { describe, it, expect } from "vitest";
import {
  normalizeSectionActivities,
  countSectionGateActivities,
  ensureActivityIds,
  persistSectionActivitiesPayload,
} from "../section-activities";

const sampleQuiz = {
  passingScore: 70,
  questions: [
    { question: "¿Cuánto es 2+2?", options: ["3", "4"], correct: 1 },
  ],
};

const sampleMinigame = { type: "memory", pairs: [] };

describe("normalizeSectionActivities", () => {
  it("retorna vacío para sección sin actividades ni legacy", () => {
    expect(normalizeSectionActivities({})).toEqual([]);
  });

  it("convierte quiz legacy a actividad", () => {
    const result = normalizeSectionActivities({ quiz: sampleQuiz });
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("quiz");
    if (result[0].kind === "quiz") {
      expect(result[0].passingScore).toBe(70);
    }
  });

  it("convierte minigame legacy a actividad", () => {
    const result = normalizeSectionActivities({ minigame: sampleMinigame });
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("minigame");
  });

  it("combina quiz y minigame legacy", () => {
    const result = normalizeSectionActivities({
      quiz: sampleQuiz,
      minigame: sampleMinigame,
    });
    expect(result).toHaveLength(2);
    const kinds = result.map((a) => a.kind);
    expect(kinds).toContain("quiz");
    expect(kinds).toContain("minigame");
  });

  it("no duplica quiz si ya existe en activities", () => {
    const activities = [
      { id: "q1", kind: "quiz", passingScore: 80, questions: [] },
    ];
    const result = normalizeSectionActivities({
      activities,
      quiz: sampleQuiz,
    });
    expect(result.filter((a) => a.kind === "quiz")).toHaveLength(1);
  });

  it("usa activities array si está presente y no vacío", () => {
    const activities = [
      { id: "q1", kind: "quiz", passingScore: 80, questions: [] },
      { id: "m1", kind: "minigame", minigame: sampleMinigame },
    ];
    const result = normalizeSectionActivities({ activities });
    expect(result).toHaveLength(2);
  });

  it("ignora quiz legacy si preguntas está vacío", () => {
    const result = normalizeSectionActivities({
      quiz: { passingScore: 70, questions: [] },
    });
    expect(result).toHaveLength(0);
  });
});

describe("countSectionGateActivities", () => {
  it("retorna 0 para sección vacía", () => {
    expect(countSectionGateActivities({})).toBe(0);
  });

  it("cuenta quiz y minigame", () => {
    expect(
      countSectionGateActivities({ quiz: sampleQuiz, minigame: sampleMinigame })
    ).toBe(2);
  });
});

describe("ensureActivityIds", () => {
  it("mantiene IDs existentes", () => {
    const activities = [
      { id: "existing-id", kind: "quiz" as const, passingScore: 70, questions: [] },
    ];
    const result = ensureActivityIds(activities);
    expect(result[0].id).toBe("existing-id");
  });

  it("genera IDs para actividades sin id", () => {
    const activities = [
      { id: "", kind: "quiz" as const, passingScore: 70, questions: [] },
    ];
    const result = ensureActivityIds(activities);
    expect(result[0].id.length).toBeGreaterThan(0);
  });
});

describe("persistSectionActivitiesPayload", () => {
  it("retorna nulls para array vacío", () => {
    const result = persistSectionActivitiesPayload([]);
    expect(result.activities).toBeNull();
    expect(result.quiz).toBeNull();
    expect(result.minigame).toBeNull();
  });

  it("retorna nulls para undefined", () => {
    const result = persistSectionActivitiesPayload(undefined);
    expect(result.activities).toBeNull();
  });

  it("incluye activities y pone quiz/minigame en null", () => {
    const activities = [
      { id: "q1", kind: "quiz" as const, passingScore: 70, questions: [] },
    ];
    const result = persistSectionActivitiesPayload(activities);
    expect(result.activities).toEqual(activities);
    expect(result.quiz).toBeNull();
    expect(result.minigame).toBeNull();
  });
});
