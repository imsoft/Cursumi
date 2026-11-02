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

/**
 * Umbrales para mostrar cada número en la portada. Por debajo, en vez de un
 * "0+" o una calificación de 5 con dos reseñas, se muestra un argumento sin
 * número. Cada stat se evalúa por separado.
 */
export const HOME_STATS_THRESHOLDS = {
  /** Alumnos únicos inscritos */
  students: 100,
  /** Usuarios con rol instructor */
  instructors: 10,
  /** Reseñas aprobadas necesarias para mostrar la calificación promedio */
  reviews: 10,
} as const;

export type HomeStatsThresholds = {
  students: number;
  instructors: number;
  reviews: number;
};

export type PublicStats = {
  /** Alumnos únicos con al menos una inscripción */
  studentsCount: number;
  /** Usuarios con rol instructor (el admin también los da de alta sin solicitud) */
  instructorsCount: number;
  /** Reseñas aprobadas */
  reviewsCount: number;
  /** Promedio de reseñas aprobadas (1–5, un decimal); null si no hay reseñas */
  averageRating: number | null;
};

/** Lo que pinta el hero: un número real o, si no da el umbral, un argumento. */
export type HomeStatItem =
  | { kind: "number"; key: "students" | "instructors"; value: string; label: string }
  | { kind: "rating"; key: "rating"; value: string; label: string }
  | { kind: "claim"; key: "students" | "instructors" | "rating"; label: string };

const formatCount = (n: number) => `${n.toLocaleString("es-MX")}+`;

export function buildHomeStats(
  stats: PublicStats,
  thresholds: HomeStatsThresholds = HOME_STATS_THRESHOLDS,
): HomeStatItem[] {
  const students: HomeStatItem =
    stats.studentsCount >= thresholds.students
      ? { kind: "number", key: "students", value: formatCount(stats.studentsCount), label: "Estudiantes" }
      : { kind: "claim", key: "students", label: "Pago único, acceso de por vida" };

  const instructors: HomeStatItem =
    stats.instructorsCount >= thresholds.instructors
      ? { kind: "number", key: "instructors", value: formatCount(stats.instructorsCount), label: "Instructores" }
      : { kind: "claim", key: "instructors", label: "Instructores verificados" };

  // Nunca una calificación sin reseñas: el umbral mínimo es 1 aunque se configure 0.
  const showRating =
    stats.averageRating != null &&
    stats.reviewsCount > 0 &&
    stats.reviewsCount >= thresholds.reviews;
  const rating: HomeStatItem = showRating
    ? {
        kind: "rating",
        key: "rating",
        value: stats.averageRating!.toFixed(1),
        label: "Calificación promedio",
      }
    : { kind: "claim", key: "rating", label: "Curso en video o por evento" };

  return [students, instructors, rating];
}

export const getPublicStats = unstable_cache(
  async (): Promise<PublicStats> => {
  // COUNT(DISTINCT) en la base en vez de traerse TODAS las filas de
  // inscripciones a memoria para contar alumnos únicos.
  const [alumnosUnicos, instructors, reviewAgg] = await Promise.all([
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COUNT(DISTINCT "studentId")::int AS total FROM "Enrollment"
    `,
    // Por rol y no por solicitud aprobada: el admin da de alta instructores
    // cambiando el rol directo, sin pasar por InstructorApplication, y esos
    // no contaban (había 2 instructores reales y 0 solicitudes aprobadas).
    prisma.user.count({ where: { role: "instructor" } }),
    prisma.review.aggregate({
      where: { approved: true },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const avg = reviewAgg._avg.rating;
  return {
    studentsCount: alumnosUnicos[0]?.total ?? 0,
    instructorsCount: instructors,
    reviewsCount: reviewAgg._count._all,
    averageRating: avg != null ? Math.round(avg * 10) / 10 : null,
  };
  },
  ["public-stats-v3"],
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
