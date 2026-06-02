import { prisma } from "./prisma";

export type InstructorEarnings = {
  total: number;
  thisMonth: number;
  enrollments: number;
  courses: number;
  monthly: { month: string; amount: number }[];
};

export async function getInstructorEarnings(instructorId: string): Promise<InstructorEarnings> {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: {
      id: true,
      price: true,
      enrollments: { select: { createdAt: true } },
    },
  });

  const total = courses.reduce((sum, course) => sum + course.price * course.enrollments.length, 0);
  const enrollments = courses.reduce((sum, course) => sum + course.enrollments.length, 0);
  const thisMonth = courses.reduce((sum, course) => {
    const monthEnrolls = course.enrollments.filter((e) => isSameMonth(e.createdAt, new Date())).length;
    return sum + course.price * monthEnrolls;
  }, 0);

  const monthly = buildMonthlySeries(courses);

  return {
    total,
    thisMonth,
    enrollments,
    courses: courses.length,
    monthly,
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
) {
  const now = new Date();
  const months: { month: string; amount: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("es-MX", { month: "short" });
    const amount = courses.reduce((sum, course) => {
      const monthEnrolls = course.enrollments.filter((e) => isSameMonth(e.createdAt, date)).length;
      return sum + course.price * monthEnrolls;
    }, 0);
    months.push({ month: label, amount });
  }

  return months;
}
