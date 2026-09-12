import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Regresión: los ingresos del instructor salen de las transacciones cobradas,
 * no de `course.price × inscripciones`.
 *
 * El caso real que lo destapó: un curso de $999 con 5 alumnos que entraron con
 * cupón del 100% aparecía como $4,995 de ingresos en el panel del instructor,
 * mientras finanzas del panel de admin —que sí lee transacciones— mostraba $0.
 */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findMany: vi.fn(async () => cursos) },
    transaction: { findMany: vi.fn(async () => transacciones) },
  },
}));

type CursoMock = {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  _count: { enrollments: number };
};
type TxMock = {
  id: string;
  courseId: string;
  amount: number;
  platformFee: number | null;
  instructorAmount: number | null;
  createdAt: Date;
  user: { name: string | null; image: string | null };
  course: { title: string };
};

let cursos: CursoMock[] = [];
let transacciones: TxMock[] = [];

const { getInstructorEarnings } = await import("@/lib/instructor-service");

const curso = (id: string, title: string, price: number, enrollments: number): CursoMock => ({
  id,
  title,
  price,
  imageUrl: null,
  _count: { enrollments },
});

/** Importes en centavos, como los guarda Stripe y la tabla Transaction. */
const tx = (
  id: string,
  courseId: string,
  amount: number,
  extra: Partial<Pick<TxMock, "platformFee" | "instructorAmount" | "createdAt">> = {},
): TxMock => ({
  id,
  courseId,
  amount,
  // `in` y no `??`: pasar null explícito significa "esta transacción no guardó
  // el reparto", que es justo el caso que ejercita los respaldos de netCentsOf.
  platformFee: "platformFee" in extra ? (extra.platformFee ?? null) : Math.round(amount * 0.15),
  instructorAmount:
    "instructorAmount" in extra
      ? (extra.instructorAmount ?? null)
      : amount - Math.round(amount * 0.15),
  createdAt: extra.createdAt ?? new Date(),
  user: { name: "Alumno", image: null },
  course: { title: "Curso" },
});

beforeEach(() => {
  cursos = [];
  transacciones = [];
});

describe("getInstructorEarnings", () => {
  it("no cuenta como venta al alumno que entró con cupón del 100%", async () => {
    // 5 alumnos con cupón total en un curso de $999: transacciones de importe 0.
    cursos = [curso("c1", "Agente completo para cédula A.", 999, 5)];
    transacciones = [0, 0, 0, 0, 0].map((amount, i) =>
      tx(`t${i}`, "c1", amount, { platformFee: 0, instructorAmount: 0 }),
    );

    const e = await getInstructorEarnings("inst-1");

    expect(e.totalGross).toBe(0);
    expect(e.totalNet).toBe(0);
    // Los alumnos siguen siendo 5: entraron de verdad, solo que sin pagar.
    expect(e.enrollments).toBe(5);
    expect(e.courseBreakdown[0].enrollmentsCount).toBe(5);
    expect(e.courseBreakdown[0].grossRevenue).toBe(0);
  });

  it("con cupón parcial cobra lo cobrado, no el precio de catálogo", async () => {
    // Curso de $1,000 vendido con 40% de descuento: se cobraron $600.
    cursos = [curso("c1", "Curso", 1000, 1)];
    transacciones = [tx("t1", "c1", 60000)];

    const e = await getInstructorEarnings("inst-1");

    expect(e.totalGross).toBe(600);
    expect(e.totalNet).toBe(510); // 600 − 15%
  });

  it("reproduce el caso reportado: solo la venta real suma", async () => {
    cursos = [
      curso("c1", "Agente completo para cédula A.", 999, 5),
      curso("c2", "Carta ganadora : Presenta tu negocio.", 180, 1),
    ];
    transacciones = [
      ...[0, 0, 0, 0, 0].map((a, i) => tx(`g${i}`, "c1", a, { platformFee: 0, instructorAmount: 0 })),
      tx("t1", "c2", 18000, { platformFee: 2700, instructorAmount: 15300 }),
    ];

    const e = await getInstructorEarnings("inst-1");

    expect(e.totalGross).toBe(180);
    expect(e.totalNet).toBe(153);

    const porCurso = Object.fromEntries(e.courseBreakdown.map((c) => [c.id, c]));
    expect(porCurso.c1.grossRevenue).toBe(0);
    expect(porCurso.c1.sharePercentage).toBe(0);
    expect(porCurso.c2.grossRevenue).toBe(180);
    expect(porCurso.c2.sharePercentage).toBe(100);
  });

  it("cambiar el precio del curso no reescribe el histórico", async () => {
    transacciones = [tx("t1", "c1", 10000)]; // se cobraron $100

    cursos = [curso("c1", "Curso", 100, 1)];
    const antes = await getInstructorEarnings("inst-1");

    cursos = [curso("c1", "Curso", 5000, 1)]; // el instructor sube el precio
    const despues = await getInstructorEarnings("inst-1");

    expect(antes.totalGross).toBe(100);
    expect(despues.totalGross).toBe(100);
  });

  it("el neto usa el reparto congelado al cobrar, no la comisión de hoy", async () => {
    cursos = [curso("c1", "Curso", 1000, 1)];
    // Cobrada cuando la comisión era del 30%.
    transacciones = [tx("t1", "c1", 100000, { platformFee: 30000, instructorAmount: 70000 })];

    const e = await getInstructorEarnings("inst-1");

    expect(e.totalNet).toBe(700);
  });

  it("sin reparto guardado, cae a restar la comisión y luego al importe íntegro", async () => {
    cursos = [curso("c1", "Curso", 1000, 2)];
    transacciones = [
      tx("t1", "c1", 10000, { platformFee: 1500, instructorAmount: null }),
      tx("t2", "c1", 10000, { platformFee: null, instructorAmount: null }),
    ];

    const e = await getInstructorEarnings("inst-1");

    expect(e.totalGross).toBe(200);
    expect(e.totalNet).toBe(185); // (100 − 15) + 100
  });

  it("un curso sin ninguna venta aparece en cero, no oculto", async () => {
    cursos = [curso("c1", "Curso sin ventas", 500, 0)];

    const e = await getInstructorEarnings("inst-1");

    expect(e.courseBreakdown).toHaveLength(1);
    expect(e.courseBreakdown[0].grossRevenue).toBe(0);
    expect(e.courseBreakdown[0].sharePercentage).toBe(0);
    expect(e.averageRevenuePerStudent).toBe(0);
  });

  it("la serie mensual cuenta ventas del mes, no inscripciones regaladas", async () => {
    cursos = [curso("c1", "Curso", 1000, 9)];
    transacciones = [tx("t1", "c1", 20000), tx("t2", "c1", 0, { platformFee: 0, instructorAmount: 0 })];

    const e = await getInstructorEarnings("inst-1");
    const mesActual = e.monthly[e.monthly.length - 1];

    expect(mesActual.amount).toBe(200);
    expect(mesActual.enrollments).toBe(2); // dos transacciones, no nueve alumnos
    expect(e.thisMonthGross).toBe(200);
  });
});
