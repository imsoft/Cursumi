import { prisma } from "./prisma";
import { claveMes, ultimosMeses } from "./fecha";

export type AdminStats = {
  totalUsers: number;
  students: number;
  instructors: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  /** Cobrado de verdad: suma de transacciones completadas (en pesos). */
  realRevenue: number;
  /** Potencial teórico: precio de catálogo × inscripciones. No es dinero cobrado. */
  estimatedRevenue: number;
  certificates: number;
  averageRating: number | null;
  /** Cosas que esperan una decisión del administrador. */
  pendingApplications: number;
  lowReviews: number;
  activeOrganizations: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [
    usersByRole,
    courses,
    enrollments,
    transactions,
    certificates,
    ratings,
    pendingApplications,
    lowReviews,
    activeOrganizations,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.course.findMany({
      select: {
        status: true,
        price: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.enrollment.count(),
    prisma.transaction.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
    }),
    prisma.certificate.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.instructorApplication.count({ where: { status: "pending" } }),
    prisma.review.count({ where: { rating: { lte: 2 } } }),
    prisma.orgSubscription.count({ where: { status: { in: ["active", "trialing"] } } }),
  ]);

  const roleCount = (role: string) =>
    usersByRole.find((r) => r.role === role)?._count ?? 0;

  const publishedCourses = courses.filter((c) => c.status === "published").length;
  const draftCourses = courses.filter((c) => c.status === "draft").length;
  const estimatedRevenue = courses.reduce(
    (sum, c) => sum + c.price * c._count.enrollments,
    0
  );

  return {
    totalUsers: usersByRole.reduce((sum, r) => sum + r._count, 0),
    students: roleCount("student"),
    instructors: roleCount("instructor"),
    totalCourses: courses.length,
    publishedCourses,
    draftCourses,
    totalEnrollments: enrollments,
    // Las transacciones se guardan en CENTAVOS; el resto del panel muestra pesos.
    realRevenue: Math.round((transactions._sum.amount ?? 0) / 100),
    estimatedRevenue,
    certificates,
    averageRating: ratings._avg.rating,
    pendingApplications,
    lowReviews,
    activeOrganizations,
  };
}

export type AdminActivityItem = {
  kind: "signup" | "enrollment" | "review" | "course";
  text: string;
  at: string;
  link: string;
};

/** Últimos movimientos de la plataforma, mezclados y ordenados por fecha. */
export async function getAdminActivity(limit = 8): Promise<AdminActivityItem[]> {
  const [users, enrollments, reviews, courses] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { name: true, email: true, role: true, createdAt: true },
    }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        createdAt: true,
        student: { select: { name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        rating: true,
        createdAt: true,
        course: { select: { title: true } },
      },
    }),
    prisma.course.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, updatedAt: true },
    }),
  ]);

  const items: AdminActivityItem[] = [
    ...users.map((u) => ({
      kind: "signup" as const,
      text: `${u.name || u.email} se registró como ${
        u.role === "instructor" ? "instructor" : u.role === "admin" ? "administrador" : "alumno"
      }`,
      at: u.createdAt.toISOString(),
      link: "/admin/users",
    })),
    ...enrollments.map((e) => ({
      kind: "enrollment" as const,
      text: `${e.student?.name || e.student?.email || "Alguien"} se inscribió en "${
        e.course?.title ?? "un curso"
      }"`,
      at: e.createdAt.toISOString(),
      link: e.course ? `/admin/courses` : "/admin/courses",
    })),
    ...reviews.map((r) => ({
      kind: "review" as const,
      text: `Reseña de ${r.rating}★ en "${r.course?.title ?? "un curso"}"`,
      at: r.createdAt.toISOString(),
      link: "/admin/reviews",
    })),
    ...courses.map((c) => ({
      kind: "course" as const,
      text: `"${c.title}" se actualizó en el catálogo`,
      at: c.updatedAt.toISOString(),
      link: "/admin/courses",
    })),
  ];

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export type AdminAnalytics = {
  revenueByMonth: { month: string; amount: number }[];
  usersByMonth: { month: string; users: number }[];
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const now = new Date();
  const startOfRange = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // SQL GROUP BY en lugar de traer todos los registros y filtrar en JS
  const [revenueRows, userRows] = await Promise.all([
    // Dinero cobrado, no precio de catálogo. Antes sumaba SUM(c.price) sobre
    // Enrollment, así que cada inscripción gratuita, de empresa o con cupón
    // engordaba la gráfica con dinero que nadie pagó. Es el mismo fallo que
    // tenía el panel de ingresos del instructor.
    prisma.$queryRaw<{ month_label: string; month_key: string; amount: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', t."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City'), 'Mon') AS month_label,
        TO_CHAR(DATE_TRUNC('month', t."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City'), 'YYYY-MM') AS month_key,
        COALESCE(SUM(t.amount), 0)::int AS amount
      FROM "Transaction" t
      WHERE t."status"::text = 'completed'
        AND t."createdAt" >= ${startOfRange}
      GROUP BY DATE_TRUNC('month', t."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')
      ORDER BY DATE_TRUNC('month', t."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')
    `,
    prisma.$queryRaw<{ month_label: string; month_key: string; users: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City'), 'Mon') AS month_label,
        TO_CHAR(DATE_TRUNC('month', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City'), 'YYYY-MM') AS month_key,
        COUNT(*)::int AS users
      FROM "User"
      WHERE "createdAt" >= ${startOfRange}
      GROUP BY DATE_TRUNC('month', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')
      ORDER BY DATE_TRUNC('month', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')
    `,
  ]);

  // Garantizar que los últimos 6 meses siempre aparezcan aunque no haya datos
  const revenueByMonth: { month: string; amount: number }[] = [];
  const usersByMonth: { month: string; users: number }[] = [];

  for (const { clave: key, etiqueta: label } of ultimosMeses(6, now)) {
    const rev = revenueRows.find((r) => r.month_key === key);
    const usr = userRows.find((u) => u.month_key === key);

    // La consulta devuelve CENTAVOS; esta gráfica se pinta en pesos.
    revenueByMonth.push({ month: label, amount: Math.round(Number(rev?.amount ?? 0) / 100) });
    usersByMonth.push({ month: label, users: Number(usr?.users ?? 0) });
  }

  return { revenueByMonth, usersByMonth };
}

// ─────────────────────────────────────────
// FINANZAS (datos reales de Transaction)
// ─────────────────────────────────────────

export type FinancialStatItem = {
  title: string;
  value: string;
  description: string;
  iconColor: string;
  trend: { value: string; isPositive: boolean };
};

export type RecentTransactionRow = {
  id: string;
  course: string;
  instructor: string;
  student: string;
  amount: number;
  platformFee: number;
  stripeFee: number;
  date: string;
  status: string;
};

export type MonthlyRevenueRow = {
  month: string;
  revenue: number;
  transactions: number;
};

export type InstructorEarningRow = {
  instructorId: string;
  instructorName: string;
  totalAmount: number;
  transactionsCount: number;
};

export type AdminFinances = {
  financialStats: FinancialStatItem[];
  recentTransactions: RecentTransactionRow[];
  monthlyRevenue: MonthlyRevenueRow[];
  instructorEarnings: InstructorEarningRow[];
  commissionSummary: {
    platformCommission: number;
    paidToInstructors: number;
    stripeFees: number;
    netPlatform: number;
  };
};

export async function getAdminFinances(): Promise<AdminFinances> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    allCompleted,
    thisMonthCompleted,
    lastMonthCompleted,
    recentRows,
    transactionsForMonthly,
    transactionsForInstructors,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: "completed" },
      select: { amount: true, platformFee: true, instructorAmount: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      where: { status: "completed", createdAt: { gte: startOfMonth } },
      select: { amount: true, platformFee: true },
    }),
    prisma.transaction.findMany({
      where: { status: "completed", createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      select: { amount: true },
    }),
    prisma.transaction.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, instructor: { select: { name: true } } } },
      },
    }),
    prisma.transaction.findMany({
      where: { status: "completed" },
      select: { amount: true, platformFee: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      where: { status: "completed" },
      select: { amount: true, instructorAmount: true, courseId: true, course: { select: { instructorId: true, instructor: { select: { name: true } } } } },
    }),
  ]);

  const totalRevenue = allCompleted.reduce((s, t) => s + t.amount, 0);
  const totalPlatformFee = allCompleted.reduce((s, t) => s + (t.platformFee ?? 0), 0);
  const thisMonthRevenue = thisMonthCompleted.reduce((s, t) => s + t.amount, 0);
  const lastMonthRevenue = lastMonthCompleted.reduce((s, t) => s + t.amount, 0);
  const thisMonthCount = thisMonthCompleted.length;
  const lastMonthCount = lastMonthCompleted.length;

  const pctRevenue = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;
  const pctCount = lastMonthCount > 0 ? thisMonthCount - lastMonthCount : thisMonthCount;
  const avgFeePercent = totalRevenue > 0 ? Math.round((totalPlatformFee / totalRevenue) * 100) : 0;

  const financialStats: FinancialStatItem[] = [
    {
      title: "Ingresos totales",
      value: formatMxn(totalRevenue),
      description: pctRevenue >= 0 ? `+${pctRevenue}% desde el mes pasado` : `${pctRevenue}% desde el mes pasado`,
      iconColor: "text-green-600",
      trend: { value: pctRevenue >= 0 ? `+${pctRevenue}%` : `${pctRevenue}%`, isPositive: pctRevenue >= 0 },
    },
    {
      title: "Este mes",
      value: formatMxn(thisMonthRevenue),
      description: `Ingresos de ${now.toLocaleDateString("es-MX", { month: "long" })}`,
      iconColor: "text-blue-600",
      trend: { value: pctCount >= 0 ? `+${pctCount}` : `${pctCount}`, isPositive: pctCount >= 0 },
    },
    {
      title: "Comisión plataforma",
      value: formatMxn(totalPlatformFee),
      description: "Total de comisiones cobradas",
      iconColor: "text-purple-600",
      // Se calcula, no se escribe a mano: decía "20% promedio" mientras la
      // comisión real era del 15%, así que la tarjeta se contradecía con su
      // propio importe.
      trend: { value: `${avgFeePercent}% promedio`, isPositive: true },
    },
    {
      title: "Transacciones",
      value: String(allCompleted.length),
      description: "Pagos completados",
      iconColor: "text-orange-600",
      trend: { value: thisMonthCount > 0 ? `+${thisMonthCount} este mes` : "0 este mes", isPositive: true },
    },
  ];

  const recentTransactions: RecentTransactionRow[] = recentRows.map((t) => ({
    id: t.id,
    course: t.course.title,
    instructor: t.course.instructor?.name ?? "—",
    student: t.user.name ?? "—",
    amount: t.amount,
    platformFee: t.platformFee ?? 0,
    stripeFee: 0,
    date: t.createdAt.toISOString().slice(0, 10),
    status: t.status,
  }));

  const byMonthKey = new Map<string, { monthLabel: string; revenue: number; count: number }>();
  for (const t of transactionsForMonthly) {
    const key = claveMes(t.createdAt);
    const [anio, mes] = key.split("-").map(Number);
    // Se arma en UTC a propósito: solo se necesita el nombre del mes, y así el
    // nombre no depende de la hora del servidor.
    const monthLabel = new Date(Date.UTC(anio, mes - 1, 1)).toLocaleDateString("es-MX", {
      month: "long",
      timeZone: "UTC",
    });
    if (!byMonthKey.has(key)) byMonthKey.set(key, { monthLabel, revenue: 0, count: 0 });
    const cur = byMonthKey.get(key)!;
    cur.revenue += t.amount;
    cur.count += 1;
  }
  const monthlyRevenue: MonthlyRevenueRow[] = Array.from(byMonthKey.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([, data]) => ({ month: data.monthLabel, revenue: data.revenue, transactions: data.count }));

  const byInstructor = new Map<string, { name: string; total: number; count: number }>();
  for (const t of transactionsForInstructors) {
    const id = t.course.instructorId;
    const name = t.course.instructor?.name ?? "—";
    if (!byInstructor.has(id)) byInstructor.set(id, { name, total: 0, count: 0 });
    const cur = byInstructor.get(id)!;
    cur.total += t.instructorAmount ?? t.amount;
    cur.count += 1;
  }
  const instructorEarnings: InstructorEarningRow[] = Array.from(byInstructor.entries())
    .map(([instructorId, data]) => ({
      instructorId,
      instructorName: data.name,
      totalAmount: data.total,
      transactionsCount: data.count,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  const paidToInstructors = allCompleted.reduce((s, t) => s + (t.instructorAmount ?? t.amount - (t.platformFee ?? 0)), 0); // instructorAmount en centavos
  const commissionSummary = {
    platformCommission: totalPlatformFee,
    paidToInstructors,
    stripeFees: 0,
    netPlatform: totalPlatformFee,
  };

  return {
    financialStats,
    recentTransactions,
    monthlyRevenue,
    instructorEarnings,
    commissionSummary,
  };
}

function formatMxn(cents: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
}
