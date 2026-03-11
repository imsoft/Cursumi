import { prisma } from "./prisma";

export type PublicStats = {
  studentsCount: number;
  citiesCount: number;
  instructorsCount: number;
};

export async function getPublicStats(): Promise<PublicStats> {
  const [enrollmentsDistinct, courses, instructors] = await Promise.all([
    prisma.enrollment.findMany({ select: { studentId: true }, distinct: ["studentId"] }),
    prisma.course.findMany({
      where: { status: "published", city: { not: null } },
      select: { city: true },
    }),
    prisma.user.count({ where: { role: "instructor" } }),
  ]);

  const uniqueCities = new Set(courses.map((c) => c.city).filter(Boolean));
  return {
    studentsCount: enrollmentsDistinct.length,
    citiesCount: uniqueCities.size,
    instructorsCount: instructors,
  };
}

export type PublicTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export async function getPublicTestimonials(limit: number = 6): Promise<PublicTestimonial[]> {
  const reviews = await prisma.review.findMany({
    where: { comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      comment: true,
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  return reviews.map((r) => ({
    quote: (r.comment ?? "").slice(0, 200),
    name: r.user.name ?? "Estudiante",
    role: r.course.title,
  }));
}
