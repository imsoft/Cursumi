import { describe, it, expect, vi, beforeEach } from "vitest";

const db = {
  students: 0,
  approvedInstructors: 0,
  reviews: [] as number[],
};
const calls: { instructorWhere?: unknown; reviewWhere?: unknown } = {};

vi.mock("next/cache", () => ({ unstable_cache: <T,>(fn: T) => fn }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(async () => [{ total: db.students }]),
    instructorApplication: {
      count: vi.fn(async (args: { where: unknown }) => {
        calls.instructorWhere = args.where;
        return db.approvedInstructors;
      }),
    },
    review: {
      aggregate: vi.fn(async (args: { where: unknown }) => {
        calls.reviewWhere = args.where;
        const n = db.reviews.length;
        return {
          _avg: { rating: n ? db.reviews.reduce((a, b) => a + b, 0) / n : null },
          _count: { _all: n },
        };
      }),
    },
  },
}));

const { buildHomeStats, getPublicStats, HOME_STATS_THRESHOLDS } = await import("@/lib/public-stats");

const hasDigit = (s: string) => /\d/.test(s);

describe("getPublicStats", () => {
  beforeEach(() => {
    db.students = 0;
    db.approvedInstructors = 0;
    db.reviews = [];
  });

  it("cuenta instructores aprobados por InstructorApplication y solo reseñas aprobadas", async () => {
    db.students = 3;
    db.approvedInstructors = 2;
    db.reviews = [5, 4];
    const stats = await getPublicStats();
    expect(calls.instructorWhere).toEqual({ status: "approved" });
    expect(calls.reviewWhere).toEqual({ approved: true });
    expect(stats).toEqual({ studentsCount: 3, instructorsCount: 2, reviewsCount: 2, averageRating: 4.5 });
  });

  it("sin reseñas el promedio es null", async () => {
    expect((await getPublicStats()).averageRating).toBeNull();
  });
});

describe("buildHomeStats", () => {
  it("los umbrales por defecto son 100 alumnos, 10 instructores y 10 reseñas", () => {
    expect(HOME_STATS_THRESHOLDS).toEqual({ students: 100, instructors: 10, reviews: 10 });
  });

  it("con datos en cero no hay ningún número, solo los tres argumentos", () => {
    const items = buildHomeStats({ studentsCount: 0, instructorsCount: 0, reviewsCount: 0, averageRating: null });
    expect(items.map((i) => i.kind)).toEqual(["claim", "claim", "claim"]);
    expect(items.map((i) => i.label)).toEqual([
      "Pago único, acceso de por vida",
      "Instructores verificados",
      "Curso en video o por evento",
    ]);
    for (const item of items) {
      expect(hasDigit(item.label)).toBe(false);
      expect("value" in item).toBe(false);
    }
  });

  it("justo debajo del umbral sigue sin números", () => {
    const items = buildHomeStats({ studentsCount: 99, instructorsCount: 9, reviewsCount: 9, averageRating: 5 });
    expect(items.every((i) => i.kind === "claim")).toBe(true);
  });

  it("en el umbral o arriba muestra los valores reales", () => {
    const items = buildHomeStats({ studentsCount: 1234, instructorsCount: 10, reviewsCount: 10, averageRating: 4.7 });
    expect(items).toEqual([
      { kind: "number", key: "students", value: "1,234+", label: "Estudiantes" },
      { kind: "number", key: "instructors", value: "10+", label: "Instructores" },
      { kind: "rating", key: "rating", value: "4.7", label: "Calificación promedio" },
    ]);
  });

  it("cada stat se evalúa por separado", () => {
    const items = buildHomeStats({ studentsCount: 150, instructorsCount: 3, reviewsCount: 2, averageRating: 5 });
    expect(items.map((i) => i.kind)).toEqual(["number", "claim", "claim"]);
  });

  it("nunca muestra calificación sin reseñas, aunque el umbral sea 0", () => {
    const zero = { students: 0, instructors: 0, reviews: 0 };
    const sinResenas = buildHomeStats(
      { studentsCount: 0, instructorsCount: 0, reviewsCount: 0, averageRating: 5 },
      zero,
    );
    expect(sinResenas[2].kind).toBe("claim");
    const sinPromedio = buildHomeStats(
      { studentsCount: 0, instructorsCount: 0, reviewsCount: 12, averageRating: null },
      zero,
    );
    expect(sinPromedio[2].kind).toBe("claim");
  });
});
