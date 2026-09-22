import { prisma } from "./prisma";
import { claveMes, ultimosMeses } from "./fecha";
import type { PayoutStatus } from "@/generated/prisma";

export type MonthlyEarning = {
  month: string;
  amount: number;
  netAmount: number;
  enrollments: number;
};

export type CourseEarningDetail = {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  enrollmentsCount: number;
  grossRevenue: number;
  netRevenue: number;
  sharePercentage: number;
};

export type RecentTransaction = {
  id: string;
  studentName: string;
  studentImage: string | null;
  courseTitle: string;
  /** Cobrado al alumno, en pesos. */
  amount: number;
  /** Comisión de Cursumi, en pesos. */
  feeAmount: number;
  /** Porcentaje de comisión aplicado en ESA venta (puede diferir del vigente). */
  feePercent: number;
  /** Lo que le toca al instructor, en pesos. */
  netAmount: number;
  couponCode: string | null;
  payoutStatus: PayoutStatus;
  paidOutAt: string | null;
  createdAt: string;
};

/** Resumen de qué parte del neto ya llegó al instructor y cuál sigue en Cursumi. */
export type PayoutSummary = {
  /** Depositado por Stripe en el mismo cobro (Connect). */
  automaticNet: number;
  /** Transferido después por el admin. */
  transferredNet: number;
  /** Cobrado por Cursumi y aún no transferido. */
  pendingNet: number;
  pendingCount: number;
};

export type InstructorEarnings = {
  // Legacy / Direct compatibility fields
  total: number;
  thisMonth: number;
  enrollments: number;
  courses: number;
  monthly: MonthlyEarning[];

  // Enhanced Financial Metrics
  totalGross: number;
  totalNet: number;
  thisMonthGross: number;
  thisMonthNet: number;
  lastMonthGross: number;
  lastMonthNet: number;
  monthOverMonthGrowth: number;
  averageRevenuePerStudent: number;
  monthly12: MonthlyEarning[];
  courseBreakdown: CourseEarningDetail[];
  recentTransactions: RecentTransaction[];
  payouts: PayoutSummary;
};

/**
 * Ingresos de un instructor.
 *
 * El dinero sale SIEMPRE de las transacciones completadas, nunca de
 * `course.price × inscripciones`. Ese cálculo antiguo daba por vendida al
 * precio de catálogo cualquier inscripción: las gratuitas, las de empresa y
 * las que entraron con cupón. Un instructor con 5 alumnos regalados en un
 * curso de $999 veía $4,995 de ingresos que nadie pagó, mientras finanzas del
 * panel de admin —que sí lee transacciones— mostraba $0.
 *
 * Además, al multiplicar por el precio ACTUAL, cambiar el precio del curso
 * reescribía hacia atrás todo el histórico.
 *
 * Unidades: `Transaction.amount`, `platformFee` e `instructorAmount` están en
 * CENTAVOS; esta función devuelve PESOS, que es lo que pinta la interfaz. Las
 * sumas se hacen en centavos y se convierte una sola vez al final, para no
 * acumular error de redondeo.
 *
 * El neto sale de `instructorAmount`, que se congeló al cobrar: si la comisión
 * de la plataforma cambia, lo ya pagado no se recalcula.
 */
export async function getInstructorEarnings(instructorId: string): Promise<InstructorEarnings> {
  const [courses, transactions] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId },
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.transaction.findMany({
      where: { status: "completed", course: { instructorId } },
      select: {
        id: true,
        courseId: true,
        amount: true,
        platformFee: true,
        instructorAmount: true,
        couponCode: true,
        payoutStatus: true,
        paidOutAt: true,
        createdAt: true,
        user: { select: { name: true, image: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Los meses se resuelven en horario de México, no en el del servidor: una
  // compra de las 21:00 del último día del mes cae en el mes siguiente si se
  // mira en UTC, que es como corre Vercel.
  const [mesAnterior, mesActual] = ultimosMeses(2).map((m) => m.clave);

  let totalGrossCents = 0;
  let totalNetCents = 0;
  let thisMonthGrossCents = 0;
  let thisMonthNetCents = 0;
  let lastMonthGrossCents = 0;
  let lastMonthNetCents = 0;

  const perCourseCents = new Map<string, { gross: number; net: number }>();
  const recentTransactions: RecentTransaction[] = [];
  const payoutCents = { automatic: 0, transferred: 0, pending: 0, pendingCount: 0 };

  for (const t of transactions) {
    const netCents = netCentsOf(t);
    totalGrossCents += t.amount;
    totalNetCents += netCents;

    // Transacciones anteriores al estado de pago llegan sin él: el dinero
    // sigue en Cursumi, así que cuentan como pendientes si hay algo que pagar.
    const payoutStatus: PayoutStatus = t.payoutStatus ?? (netCents > 0 ? "pending" : "none");
    if (payoutStatus === "automatic") payoutCents.automatic += netCents;
    else if (payoutStatus === "transferred") payoutCents.transferred += netCents;
    else if (payoutStatus === "pending") {
      payoutCents.pending += netCents;
      payoutCents.pendingCount += 1;
    }

    const clave = claveMes(t.createdAt);
    if (clave === mesActual) {
      thisMonthGrossCents += t.amount;
      thisMonthNetCents += netCents;
    } else if (clave === mesAnterior) {
      lastMonthGrossCents += t.amount;
      lastMonthNetCents += netCents;
    }

    const acc = perCourseCents.get(t.courseId) ?? { gross: 0, net: 0 };
    acc.gross += t.amount;
    acc.net += netCents;
    perCourseCents.set(t.courseId, acc);

    if (recentTransactions.length < 50) {
      const feeCents = t.amount - netCents;
      recentTransactions.push({
        id: t.id,
        studentName: t.user.name || "Estudiante",
        studentImage: t.user.image || null,
        courseTitle: t.course.title,
        amount: toPesos(t.amount),
        feeAmount: toPesos(feeCents),
        feePercent: t.amount > 0 ? Math.round((feeCents / t.amount) * 100) : 0,
        netAmount: toPesos(netCents),
        couponCode: t.couponCode ?? null,
        payoutStatus,
        paidOutAt: t.paidOutAt ? new Date(t.paidOutAt).toISOString() : null,
        createdAt: t.createdAt.toISOString(),
      });
    }
  }

  const totalGross = toPesos(totalGrossCents);
  const totalNet = toPesos(totalNetCents);
  const thisMonthGross = toPesos(thisMonthGrossCents);
  const thisMonthNet = toPesos(thisMonthNetCents);
  const lastMonthGross = toPesos(lastMonthGrossCents);
  const lastMonthNet = toPesos(lastMonthNetCents);

  // Los alumnos se cuentan por inscripción, no por transacción: alguien que
  // entró gratis o por su empresa es un alumno real aunque no haya pagado.
  const enrollmentsCount = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

  let monthOverMonthGrowth = 0;
  if (lastMonthGross === 0) {
    monthOverMonthGrowth = thisMonthGross > 0 ? 100 : 0;
  } else {
    monthOverMonthGrowth = Math.round(((thisMonthGross - lastMonthGross) / lastMonthGross) * 100);
  }

  const averageRevenuePerStudent = enrollmentsCount > 0 ? Math.round(totalNet / enrollmentsCount) : 0;

  const courseBreakdown: CourseEarningDetail[] = courses
    .map((course) => {
      const cents = perCourseCents.get(course.id) ?? { gross: 0, net: 0 };
      const grossRevenue = toPesos(cents.gross);
      return {
        id: course.id,
        title: course.title,
        price: course.price,
        imageUrl: course.imageUrl,
        enrollmentsCount: course._count.enrollments,
        grossRevenue,
        netRevenue: toPesos(cents.net),
        sharePercentage: totalGross > 0 ? Math.round((grossRevenue / totalGross) * 100) : 0,
      };
    })
    .sort((a, b) => b.grossRevenue - a.grossRevenue);

  return {
    total: totalGross,
    thisMonth: thisMonthGross,
    enrollments: enrollmentsCount,
    courses: courses.length,
    monthly: buildMonthlySeries(transactions, 6),

    totalGross,
    totalNet,
    thisMonthGross,
    thisMonthNet,
    lastMonthGross,
    lastMonthNet,
    monthOverMonthGrowth,
    averageRevenuePerStudent,
    monthly12: buildMonthlySeries(transactions, 12),
    courseBreakdown,
    recentTransactions,
    payouts: {
      automaticNet: toPesos(payoutCents.automatic),
      transferredNet: toPesos(payoutCents.transferred),
      pendingNet: toPesos(payoutCents.pending),
      pendingCount: payoutCents.pendingCount,
    },
  };
}

/** Transacción tal y como la consulta esta capa: lo mínimo para repartir el dinero. */
type EarningTransaction = {
  amount: number;
  platformFee: number | null;
  instructorAmount: number | null;
  createdAt: Date;
  couponCode?: string | null;
  payoutStatus?: PayoutStatus | null;
  paidOutAt?: Date | null;
};

const CENTAVOS_POR_PESO = 100;

function toPesos(centavos: number): number {
  return Math.round(centavos / CENTAVOS_POR_PESO);
}

/**
 * Lo que le queda al instructor, en centavos.
 *
 * `instructorAmount` es el valor bueno porque se guardó al cobrar. Los dos
 * respaldos cubren transacciones viejas anteriores a que se guardara el
 * reparto: restar la comisión si se conoce, y si no, el importe íntegro (es
 * preferible quedarse corto en la comisión que inventar un descuento).
 */
function netCentsOf(t: Pick<EarningTransaction, "amount" | "platformFee" | "instructorAmount">): number {
  if (t.instructorAmount != null) return t.instructorAmount;
  if (t.platformFee != null) return t.amount - t.platformFee;
  return t.amount;
}

function buildMonthlySeries(
  transactions: EarningTransaction[],
  monthsCount: number,
): MonthlyEarning[] {
  // Una sola pasada por las transacciones: resolver la zona horaria es caro y
  // antes se repetía por cada mes de la serie.
  const porMes = new Map<string, { gross: number; net: number; count: number }>();
  for (const t of transactions) {
    const clave = claveMes(t.createdAt);
    const acc = porMes.get(clave) ?? { gross: 0, net: 0, count: 0 };
    acc.gross += t.amount;
    acc.net += netCentsOf(t);
    acc.count += 1;
    porMes.set(clave, acc);
  }

  return ultimosMeses(monthsCount).map(({ clave, etiqueta }) => {
    const acc = porMes.get(clave) ?? { gross: 0, net: 0, count: 0 };
    return {
      month: etiqueta,
      amount: toPesos(acc.gross),
      netAmount: toPesos(acc.net),
      // Ventas del mes, no inscripciones: una inscripción regalada no es venta.
      enrollments: acc.count,
    };
  });
}
