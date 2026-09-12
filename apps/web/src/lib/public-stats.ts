import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

/**
 * Datos públicos de la portada, cacheados.
 *
 * La portada se renderiza en cada visita, así que sin caché cada visitante
 * anónimo disparaba seis consultas contra Neon antes de recibir el primer
 * byte. Y en el plan gratuito la base se duerme, de modo que la primera
 * visita tras un rato de inactividad pagaba además el arranque: de ahí el
 * TTFB de más de tres segundos que medía Speed Insights.
 *
 * Cinco minutos, el mismo intervalo que ya usan /courses y /blog. Nada de
 * esto cambia de un segundo a otro.
 */
const REVALIDAR_SEGUNDOS = 300;

export type PublicStats = {
  studentsCount: number;
  citiesCount: number;
  instructorsCount: number;
  /** Promedio de reseñas aprobadas (1–5); null si no hay reseñas publicadas */
  averageRating: number | null;
};

export const getPublicStats = unstable_cache(
  async (): Promise<PublicStats> => {
  // COUNT(DISTINCT) en la base en vez de traerse TODAS las filas de
  // inscripciones a memoria para contar alumnos únicos.
  const [alumnosUnicos, courses, instructors, reviewAgg] = await Promise.all([
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COUNT(DISTINCT "studentId")::int AS total FROM "Enrollment"
    `,
    prisma.course.findMany({
      where: { status: "published", city: { not: null } },
      select: { city: true },
    }),
    prisma.user.count({ where: { role: "instructor" } }),
    prisma.review.aggregate({
      where: { approved: true },
      _avg: { rating: true },
    }),
  ]);

  const uniqueCities = new Set(courses.map((c) => c.city).filter(Boolean));
  const avg = reviewAgg._avg.rating;
  return {
    studentsCount: alumnosUnicos[0]?.total ?? 0,
    citiesCount: uniqueCities.size,
    instructorsCount: instructors,
    averageRating: avg != null ? Math.round(avg * 10) / 10 : null,
  };
  },
  ["public-stats"],
  { revalidate: REVALIDAR_SEGUNDOS, tags: ["public-stats"] },
);

export type PublicTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export const getPublicTestimonials = unstable_cache(
  async (limit: number = 6): Promise<PublicTestimonial[]> => {
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
  },
  ["public-testimonials"],
  { revalidate: REVALIDAR_SEGUNDOS, tags: ["public-stats"] },
);

export type FeaturedCourseItem = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  modality: "virtual" | "evento";
  city: string | null;
  imageUrl: string | null;
};

export const getFeaturedCourses = unstable_cache(
  async (limit: number = 6): Promise<FeaturedCourseItem[]> => {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      modality: true,
      city: true,
      imageUrl: true,
    },
  });
  return courses;
  },
  ["featured-courses"],
  { revalidate: REVALIDAR_SEGUNDOS, tags: ["public-stats"] },
);
