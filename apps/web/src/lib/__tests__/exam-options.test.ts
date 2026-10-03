import { describe, it, expect } from "vitest";
import { addOption, canAddOption, removeOption, MAX_CHOICE_OPTIONS } from "@/lib/exam-options";

describe("opciones de pregunta del examen", () => {
  it("deja agregar más de 5 opciones, hasta el tope", () => {
    let q = { options: ["a", "b"], correctAnswers: [0] };
    for (let i = 0; i < 20; i++) q = addOption(q);
    expect(q.options).toHaveLength(MAX_CHOICE_OPTIONS);
    expect(MAX_CHOICE_OPTIONS).toBeGreaterThan(5);
    expect(canAddOption(q)).toBe(false);
  });

  it("mientras el botón se muestre, agregar hace algo (antes se quedaba en 5)", () => {
    let q = { options: ["a", "b"] };
    while (canAddOption(q)) {
      const before = q.options.length;
      q = addOption(q);
      expect(q.options.length).toBe(before + 1);
    }
  });

  it("varias correctas: al quitar una opción las correctas siguen siendo las mismas", () => {
    const q = { options: ["a", "b", "c", "d"], correctAnswers: [1, 3] }; // b y d
    const r = removeOption(q, 0);
    expect(r.options).toEqual(["b", "c", "d"]);
    expect(r.correctAnswers).toEqual([0, 2]); // b y d
    expect(removeOption(q, 1).correctAnswers).toEqual([2]); // se quitó b, queda d
    expect("correctAnswer" in r).toBe(false);
  });

  it("opción única: recorre la correcta y nunca baja de 2 opciones", () => {
    expect(removeOption({ options: ["a", "b", "c"], correctAnswer: 2 }, 0).correctAnswer).toBe(1);
    expect(removeOption({ options: ["a", "b", "c"], correctAnswer: 1 }, 1).correctAnswer).toBe(0);
    const two = { options: ["a", "b"], correctAnswer: 0 };
    expect(removeOption(two, 0)).toBe(two);
  });
});
