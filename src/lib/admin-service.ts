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
        id: true,
        status: true,
        price: true,
        enrollments: { select: { id: true, createdAt: true } },
      },
    }),
    prisma.enrollment.count(),
  ]);

  const publishedCourses = courses.filter((c) => c.status === "published").length;
  const draftCourses = courses.filter((c) => c.status === "draft").length;
  const estimatedRevenue = courses.reduce((sum, course) => {
    return sum + course.price * course.enrollments.length;
  }, 0);

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
  const [courses, users] = await Promise.all([
    prisma.course.findMany({
      select: {
        price: true,
        enrollments: { select: { createdAt: true } },
      },
    }),
    prisma.user.findMany({
      select: { createdAt: true },
    }),
  ]);

  const now = new Date();
  const revenueByMonth: { month: string; amount: number }[] = [];
  const usersByMonth: { month: string; users: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("es-MX", { month: "short" });

    const amount = courses.reduce((sum, course) => {
      const enrolls = course.enrollments.filter((e) => isSameMonth(e.createdAt, date)).length;
      return sum + course.price * enrolls;
    }, 0);

    const usersCount = users.filter((u) => isSameMonth(u.createdAt, date)).length;

    revenueByMonth.push({ month: label, amount });
    usersByMonth.push({ month: label, users: usersCount });
  }

  return { revenueByMonth, usersByMonth };
}

function isSameMonth(date: Date, ref: Date) {
  return date.getMonth() === ref.getMonth() && date.getFullYear() === ref.getFullYear();
}
