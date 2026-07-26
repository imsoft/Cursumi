import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * El helper toca BD y push; aquí solo nos interesa A QUIÉN avisa y con qué
 * texto. Interceptamos en el límite real (prisma.notification.create) en vez
 * de mockear createNotification: notifyEnrollment lo llama internamente, así
 * que un mock del módulo no lo interceptaría.
 */
type Created = { userId: string; type: string; title: string; body: string; link: string | null };
const created: Created[] = [];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findUnique: vi.fn(async () => ({ instructorId: "instructor-1", title: "Curso de prueba" })),
    },
    notification: {
      create: vi.fn(async ({ data }: { data: Created }) => {
        created.push(data);
        return data;
      }),
    },
  },
}));
vi.mock("@/lib/web-push", () => ({ sendPushToUser: vi.fn(async () => {}) }));
vi.mock("@/lib/expo-push", () => ({ sendExpoPushToUser: vi.fn(async () => {}) }));

const { notifyEnrollment } = await import("@/lib/notification-helpers");

describe("notifyEnrollment", () => {
  beforeEach(() => {
    created.length = 0;
  });

  it("avisa al alumno y al instructor", async () => {
    await notifyEnrollment({ studentId: "alumno-1", courseId: "curso-1" });

    expect(created).toHaveLength(2);
    const alumno = created.find((n) => n.userId === "alumno-1");
    const instructor = created.find((n) => n.userId === "instructor-1");

    expect(alumno?.title).toBe("Inscripción confirmada");
    expect(alumno?.link).toBe("/dashboard/my-courses/curso-1");
    expect(instructor?.title).toBe("Nueva inscripción");
    expect(instructor?.body).toContain("Curso de prueba");
    expect(instructor?.link).toBe("/instructor/courses/curso-1");
    expect(created.every((n) => n.type === "enrollment")).toBe(true);
  });

  it("el texto del alumno cambia si la inscripción fue gratuita", async () => {
    await notifyEnrollment({ studentId: "alumno-1", courseId: "curso-1", free: true });
    const alumno = created.find((n) => n.userId === "alumno-1");
    expect(alumno?.body).toContain("Ya tienes acceso");
    expect(alumno?.body).not.toContain("pago");
  });

  it("con pago, el texto del alumno menciona el pago", async () => {
    await notifyEnrollment({ studentId: "alumno-1", courseId: "curso-1" });
    const alumno = created.find((n) => n.userId === "alumno-1");
    expect(alumno?.body).toContain("pago");
  });

  it("no se avisa a sí mismo si el instructor se inscribe a su propio curso", async () => {
    await notifyEnrollment({ studentId: "instructor-1", courseId: "curso-1" });
    expect(created).toHaveLength(1);
    expect(created[0].title).toBe("Inscripción confirmada");
  });
});
