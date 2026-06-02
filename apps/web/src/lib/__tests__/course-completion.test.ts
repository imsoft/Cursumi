import { describe, it, expect } from "vitest";
import {
  getLessonCompletion,
  getCourseCompletion,
  validateCourseForPublish,
  formatDuration,
  getCourseDuration,
} from "../course-completion";
import type { CourseLesson, CourseSection } from "@/components/instructor/course-types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeLesson(overrides: Partial<CourseLesson> = {}): CourseLesson {
  return {
    id: "lesson-1",
    title: "Mi lección",
    type: "video",
    description: "Descripción",
    duration: "10m",
    videoUrl: "https://stream.mux.com/abc",
    content: undefined,
    order: 1,
    quizQuestions: [],
    files: [],
    resources: [],
    evaluationCriteria: [],
    ...overrides,
  };
}

function makeSection(lessons: CourseLesson[] = [], overrides: Partial<CourseSection> = {}): CourseSection {
  return {
    id: "section-1",
    title: "Sección 1",
    description: undefined,
    order: 1,
    lessons,
    quiz: undefined,
    minigame: undefined,
    activities: undefined,
    ...overrides,
  };
}

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("retorna — para 0 minutos", () => expect(formatDuration(0)).toBe("—"));
  it("retorna — para negativos", () => expect(formatDuration(-5)).toBe("—"));
  it("muestra solo minutos cuando < 60", () => expect(formatDuration(45)).toBe("45 min"));
  it("muestra solo horas cuando exacto", () => expect(formatDuration(60)).toBe("1 h"));
  it("muestra horas y minutos", () => expect(formatDuration(90)).toBe("1 h 30 min"));
  it("muestra 2 horas exactas", () => expect(formatDuration(120)).toBe("2 h"));
  it("muestra 2h 15min", () => expect(formatDuration(135)).toBe("2 h 15 min"));
});

// ─── getCourseDuration ────────────────────────────────────────────────────────

describe("getCourseDuration", () => {
  it("retorna 0 para curso sin secciones", () => {
    expect(getCourseDuration([])).toBe(0);
  });

  it("suma duración de todas las lecciones", () => {
    const sections = [
      makeSection([
        makeLesson({ duration: "30m" }),
        makeLesson({ duration: "1h" }),
      ]),
      makeSection([makeLesson({ duration: "15m" })]),
    ];
    expect(getCourseDuration(sections)).toBe(105); // 30 + 60 + 15
  });

  it("ignora lecciones sin duración", () => {
    const sections = [
      makeSection([
        makeLesson({ duration: "20m" }),
        makeLesson({ duration: undefined }),
      ]),
    ];
    expect(getCourseDuration(sections)).toBe(20);
  });
});

// ─── getLessonCompletion ──────────────────────────────────────────────────────

describe("getLessonCompletion — video", () => {
  it("lección video completa: canPublish=true, 100%", () => {
    const result = getLessonCompletion(makeLesson({ type: "video", videoUrl: "https://x.com/v", description: "ok", files: [{ id: "f", name: "f.pdf", url: "u", type: "pdf", size: 1 }] }));
    expect(result.canPublish).toBe(true);
    expect(result.percentage).toBe(100);
    expect(result.statusTone).toBe("success");
  });

  it("video sin videoUrl: canPublish=false", () => {
    const result = getLessonCompletion(makeLesson({ type: "video", videoUrl: "" }));
    expect(result.canPublish).toBe(false);
    expect(result.statusTone).toBe("error");
    expect(result.actionMessage).toContain("video");
  });

  it("video sin título: canPublish=false", () => {
    const result = getLessonCompletion(makeLesson({ title: "" }));
    expect(result.canPublish).toBe(false);
    expect(result.actionMessage).toContain("título");
  });

  it("video con requeridos pero sin recomendados: statusTone warning", () => {
    const result = getLessonCompletion(makeLesson({
      type: "video",
      videoUrl: "https://mux.com/v",
      description: "",
      files: [],
      resources: [],
    }));
    expect(result.canPublish).toBe(true);
    expect(result.statusTone).toBe("warning");
  });
});

describe("getLessonCompletion — texto", () => {
  it("lección texto sin content: canPublish=false", () => {
    const result = getLessonCompletion(makeLesson({ type: "text", content: "" }));
    expect(result.canPublish).toBe(false);
  });

  it("lección texto con content: canPublish=true", () => {
    const result = getLessonCompletion(makeLesson({ type: "text", content: "<p>Hola</p>", description: "desc", files: [{ id: "f", name: "f.pdf", url: "u", type: "pdf", size: 1 }] }));
    expect(result.canPublish).toBe(true);
    expect(result.percentage).toBe(100);
  });
});

describe("getLessonCompletion — quiz", () => {
  it("quiz sin preguntas: canPublish=false", () => {
    const result = getLessonCompletion(makeLesson({ type: "quiz", quizQuestions: [] }));
    expect(result.canPublish).toBe(false);
  });

  it("quiz con preguntas: canPublish=true", () => {
    const q = [{ id: "q1", type: "multiple-choice" as const, question: "¿?", options: ["a", "b"], correctAnswer: 0 }];
    const result = getLessonCompletion(makeLesson({ type: "quiz", quizQuestions: q, description: "desc", files: [] }));
    expect(result.canPublish).toBe(true);
  });
});

describe("getLessonCompletion — assignment", () => {
  it("tarea solo necesita título", () => {
    const result = getLessonCompletion(makeLesson({ type: "assignment", title: "Entrega final" }));
    expect(result.canPublish).toBe(true);
  });
});

// ─── validateCourseForPublish ─────────────────────────────────────────────────

describe("validateCourseForPublish", () => {
  it("aprueba curso con todos los requeridos", () => {
    const { canPublish, errors } = validateCourseForPublish({
      title: "Curso completo",
      imageUrl: "https://cloud.com/img.jpg",
      sectionsCount: 2,
    });
    expect(canPublish).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("rechaza sin título", () => {
    const { canPublish, errors } = validateCourseForPublish({
      title: "",
      imageUrl: "https://cloud.com/img.jpg",
      sectionsCount: 1,
    });
    expect(canPublish).toBe(false);
    expect(errors.some((e) => /título/.test(e))).toBe(true);
  });

  it("rechaza sin miniatura", () => {
    const { canPublish, errors } = validateCourseForPublish({
      title: "Curso",
      imageUrl: null,
      sectionsCount: 1,
    });
    expect(canPublish).toBe(false);
    expect(errors.some((e) => /miniatura/.test(e))).toBe(true);
  });

  it("rechaza sin secciones", () => {
    const { canPublish, errors } = validateCourseForPublish({
      title: "Curso",
      imageUrl: "https://x.com/i.jpg",
      sectionsCount: 0,
    });
    expect(canPublish).toBe(false);
    expect(errors.some((e) => /sección/.test(e))).toBe(true);
  });

  it("acumula múltiples errores", () => {
    const { errors } = validateCourseForPublish({ title: "", imageUrl: null, sectionsCount: 0 });
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── getCourseCompletion ──────────────────────────────────────────────────────

describe("getCourseCompletion", () => {
  const fullCourse = {
    id: "c1",
    title: "Curso completo",
    description: "Descripción del curso",
    imageUrl: "https://img.com/cover.jpg",
    category: "programacion",
    level: "intermedio",
    price: 500,
    modality: "virtual" as const,
    courseType: "self-paced",
    startDate: "",
    duration: "",
    sections: [
      makeSection([makeLesson({ videoUrl: "https://mux.com/v1", description: "desc", files: [] })]),
    ],
  };

  it("curso completo: canPublish=true, percentage>=60", () => {
    const result = getCourseCompletion(fullCourse);
    expect(result.canPublish).toBe(true);
    expect(result.percentage).toBeGreaterThanOrEqual(60);
  });

  it("curso sin requeridos: canPublish=false", () => {
    const result = getCourseCompletion({ ...fullCourse, title: "", imageUrl: "", sections: [] });
    expect(result.canPublish).toBe(false);
    // percentage puede ser > 0 si los recomendados (category, level, price) están completos
    expect(result.percentage).toBeLessThan(60);
  });

  it("stats reflejan las lecciones del curso", () => {
    const result = getCourseCompletion(fullCourse);
    expect(result.stats.totalSections).toBe(1);
    expect(result.stats.totalLessons).toBe(1);
  });

  it("statusTone=success cuando todo está completo", () => {
    const result = getCourseCompletion(fullCourse);
    expect(result.statusTone).toBe("success");
  });

  it("statusTone=error cuando faltan requeridos", () => {
    const result = getCourseCompletion({ ...fullCourse, title: "", imageUrl: "", sections: [] });
    expect(result.statusTone).toBe("error");
  });
});
