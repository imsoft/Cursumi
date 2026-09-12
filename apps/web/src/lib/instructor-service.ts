import { prisma } from "./prisma";

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
  amount: number;
  netAmount: number;
  createdAt: string;
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
        createdAt: true,
        user: { select: { name: true, image: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let totalGrossCents = 0;
  let totalNetCents = 0;
  let thisMonthGrossCents = 0;
  let thisMonthNetCents = 0;
  let lastMonthGrossCents = 0;
  let lastMonthNetCents = 0;

  const perCourseCents = new Map<string, { gross: number; net: number }>();
  const recentTransactions: RecentTransaction[] = [];

  for (const t of transactions) {
    const netCents = netCentsOf(t);
    totalGrossCents += t.amount;
    totalNetCents += netCents;

    if (isSameMonth(t.createdAt, now)) {
      thisMonthGrossCents += t.amount;
      thisMonthNetCents += netCents;
    } else if (isSameMonth(t.createdAt, lastMonthDate)) {
      lastMonthGrossCents += t.amount;
      lastMonthNetCents += netCents;
    }

    const acc = perCourseCents.get(t.courseId) ?? { gross: 0, net: 0 };
    acc.gross += t.amount;
    acc.net += netCents;
    perCourseCents.set(t.courseId, acc);

    if (recentTransactions.length < 15) {
      recentTransactions.push({
        id: t.id,
        studentName: t.user.name || "Estudiante",
        studentImage: t.user.image || null,
        courseTitle: t.course.title,
        amount: toPesos(t.amount),
        netAmount: toPesos(netCents),
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
  };
}

/** Transacción tal y como la consulta esta capa: lo mínimo para repartir el dinero. */
type EarningTransaction = {
  amount: number;
  platformFee: number | null;
  instructorAmount: number | null;
  createdAt: Date;
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

function isSameMonth(date: Date, ref: Date) {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
}

function buildMonthlySeries(
  transactions: EarningTransaction[],
  monthsCount: number,
): MonthlyEarning[] {
  const now = new Date();
  const months: MonthlyEarning[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("es-MX", { month: "short" });

    let grossCents = 0;
    let netCents = 0;
    let count = 0;

    for (const t of transactions) {
      if (!isSameMonth(t.createdAt, date)) continue;
      grossCents += t.amount;
      netCents += netCentsOf(t);
      count += 1;
    }

    months.push({
      month: label,
      amount: toPesos(grossCents),
      netAmount: toPesos(netCents),
      // Ventas del mes, no inscripciones: una inscripción regalada no es venta.
      enrollments: count,
    });
  }

  return months;
}
