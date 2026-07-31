import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Regresión de seguridad: `enrollInCourse` inscribe GRATIS.
 *
 * Se llama desde un server action de formulario, así que el navegador conoce su
 * id y manda el `courseId` en el FormData. Si la única comprobación de precio
 * viviera en la ruta /api/courses/[courseId]/enroll, cualquiera podría invocar
 * el action con el id de un curso de paga y llevárselo sin pagar.
 *
 * Estas pruebas fijan que la barrera está DENTRO de la función.
 */

const upserts: unknown[] = [];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findFirst: vi.fn(async () => cursoActual),
    },
    courseSession: { findFirst: vi.fn(async () => null) },
    enrollment: {
      upsert: vi.fn(async (args: unknown) => {
        upserts.push(args);
        return {};
      }),
    },
  },
}));

// `course-actions` arma la sesión con auth.api.getSession + next/headers.
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn(async () => ({ user: { id: "alumno-1" } })) } },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let cursoActual: { joinCodeHash: string | null; modality: string; price: number } | null = null;
let precioPublicado = 0;

vi.mock("@/lib/course-service", () => ({
  getPublishedCourse: vi.fn(async () => ({ id: "curso-1", price: precioPublicado })),
}));

const { enrollInCourse } = await import("@/app/actions/course-actions");

describe("enrollInCourse — barrera de pago", () => {
  beforeEach(() => {
    upserts.length = 0;
  });

  it("rechaza un curso de paga aunque se llame al action directamente", async () => {
    precioPublicado = 1500;
    cursoActual = { joinCodeHash: null, modality: "virtual", price: 1500 };

    await expect(enrollInCourse("curso-1")).rejects.toThrow(/requiere pago/i);
    expect(upserts).toHaveLength(0);
  });

  it("sigue inscribiendo en cursos gratuitos", async () => {
    precioPublicado = 0;
    cursoActual = { joinCodeHash: null, modality: "virtual", price: 0 };

    await expect(enrollInCourse("curso-1")).resolves.toMatchObject({ enrolled: true });
    expect(upserts).toHaveLength(1);
  });

  it("no se deja engañar si el curso publicado dice 0 pero el precio real es mayor", async () => {
    // Defensa en profundidad: manda la fila de la tabla, no el objeto cacheado.
    precioPublicado = 0;
    cursoActual = { joinCodeHash: null, modality: "virtual", price: 990 };

    await expect(enrollInCourse("curso-1")).rejects.toThrow(/requiere pago/i);
    expect(upserts).toHaveLength(0);
  });
});
