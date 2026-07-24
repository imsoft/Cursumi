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

export async function getInstructorEarnings(instructorId: string): Promise<InstructorEarnings> {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: {
      id: true,
      title: true,
      price: true,
      imageUrl: true,
      enrollments: {
        select: {
          id: true,
          createdAt: true,
          student: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let totalGross = 0;
  let enrollmentsCount = 0;
  let thisMonthGross = 0;
  let lastMonthGross = 0;

  const allTransactions: RecentTransaction[] = [];

  const courseBreakdownRaw: {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    enrollmentsCount: number;
    grossRevenue: number;
    netRevenue: number;
  }[] = [];

  for (const course of courses) {
    const courseEnrolls = course.enrollments.length;
    const courseGross = course.price * courseEnrolls;
    totalGross += courseGross;
    enrollmentsCount += courseEnrolls;

    courseBreakdownRaw.push({
      id: course.id,
      title: course.title,
      price: course.price,
      imageUrl: course.imageUrl,
      enrollmentsCount: courseEnrolls,
      grossRevenue: courseGross,
      netRevenue: Math.round(courseGross * 0.85),
    });

    for (const e of course.enrollments) {
      if (isSameMonth(e.createdAt, now)) {
        thisMonthGross += course.price;
      } else if (isSameMonth(e.createdAt, lastMonthDate)) {
        lastMonthGross += course.price;
      }

      allTransactions.push({
        id: e.id,
        studentName: e.student.name || "Estudiante",
        studentImage: e.student.image || null,
        courseTitle: course.title,
        amount: course.price,
        netAmount: Math.round(course.price * 0.85),
        createdAt: e.createdAt.toISOString(),
      });
    }
  }

  // Sort transactions newest first
  allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentTransactions = allTransactions.slice(0, 15);

  const totalNet = Math.round(totalGross * 0.85);
  const thisMonthNet = Math.round(thisMonthGross * 0.85);
  const lastMonthNet = Math.round(lastMonthGross * 0.85);

  let monthOverMonthGrowth = 0;
  if (lastMonthGross === 0) {
    monthOverMonthGrowth = thisMonthGross > 0 ? 100 : 0;
  } else {
    monthOverMonthGrowth = Math.round(((thisMonthGross - lastMonthGross) / lastMonthGross) * 100);
  }

  const averageRevenuePerStudent = enrollmentsCount > 0 ? Math.round(totalNet / enrollmentsCount) : 0;

  // Course breakdown sorted by gross revenue descending with share percentage
  const courseBreakdown: CourseEarningDetail[] = courseBreakdownRaw
    .map((c) => ({
      ...c,
      sharePercentage: totalGross > 0 ? Math.round((c.grossRevenue / totalGross) * 100) : 0,
    }))
    .sort((a, b) => b.grossRevenue - a.grossRevenue);

  const monthly6 = buildMonthlySeries(courses, 6);
  const monthly12 = buildMonthlySeries(courses, 12);

  return {
    total: totalGross,
    thisMonth: thisMonthGross,
    enrollments: enrollmentsCount,
    courses: courses.length,
    monthly: monthly6,

    totalGross,
    totalNet,
    thisMonthGross,
    thisMonthNet,
    lastMonthGross,
    lastMonthNet,
    monthOverMonthGrowth,
    averageRevenuePerStudent,
    monthly12,
    courseBreakdown,
    recentTransactions,
  };
}

function isSameMonth(date: Date, ref: Date) {
  return date.getMonth() === ref.getMonth() && date.getFullYear() === ref.getFullYear();
}

function buildMonthlySeries(
  courses: {
    price: number;
    enrollments: { createdAt: Date }[];
  }[],
  monthsCount: number,
): MonthlyEarning[] {
  const now = new Date();
  const months: MonthlyEarning[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("es-MX", { month: "short" });

    let amount = 0;
    let enrollments = 0;

    for (const course of courses) {
      const monthEnrolls = course.enrollments.filter((e) => isSameMonth(e.createdAt, date)).length;
      enrollments += monthEnrolls;
      amount += course.price * monthEnrolls;
    }

    months.push({
      month: label,
      amount,
      netAmount: Math.round(amount * 0.85),
      enrollments,
    });
  }

  return months;
}
