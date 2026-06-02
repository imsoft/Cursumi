import { prisma } from "./prisma";

export type AdminStats = {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  estimatedRevenue: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [users, courses, enrollments] = await Promise.all([
    prisma.user.count(),
    prisma.course.findMany({
      select: {
        status: true,
        price: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.enrollment.count(),
  ]);

  const publishedCourses = courses.filter((c) => c.status === "published").length;
  const draftCourses = courses.filter((c) => c.status === "draft").length;
  const estimatedRevenue = courses.reduce(
    (sum, c) => sum + c.price * c._count.enrollments,
    0
  );

  return {
    totalUsers: users,
    totalCourses: courses.length,
    publishedCourses,
    draftCourses,
    totalEnrollments: enrollments,
    estimatedRevenue,
  };
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
    prisma.$queryRaw<{ month_label: string; month_key: string; amount: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', e."createdAt"), 'Mon') AS month_label,
        TO_CHAR(DATE_TRUNC('month', e."createdAt"), 'YYYY-MM') AS month_key,
        COALESCE(SUM(c.price), 0)::int AS amount
      FROM "Enrollment" e
      JOIN "Course" c ON c.id = e."courseId"
      WHERE e."createdAt" >= ${startOfRange}
      GROUP BY DATE_TRUNC('month', e."createdAt")
      ORDER BY DATE_TRUNC('month', e."createdAt")
    `,
    prisma.$queryRaw<{ month_label: string; month_key: string; users: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month_label,
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month_key,
        COUNT(*)::int AS users
      FROM "User"
      WHERE "createdAt" >= ${startOfRange}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
  ]);

  // Garantizar que los últimos 6 meses siempre aparezcan aunque no haya datos
  const revenueByMonth: { month: string; amount: number }[] = [];
  const usersByMonth: { month: string; users: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("es-MX", { month: "short" });

    const rev = revenueRows.find((r) => r.month_key === key);
    const usr = userRows.find((u) => u.month_key === key);

    revenueByMonth.push({ month: label, amount: Number(rev?.amount ?? 0) });
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
      trend: { value: "20% promedio", isPositive: true },
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
    const key = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = new Date(t.createdAt.getFullYear(), t.createdAt.getMonth(), 1).toLocaleDateString("es-MX", { month: "long" });
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
