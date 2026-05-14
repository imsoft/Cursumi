/**
 * Operaciones de course-service orientadas al catálogo público:
 * listado, detalle, sitemap y búsqueda full-text.
 */
import type { Modality } from "@/generated/prisma";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";
import type { Course } from "@/components/courses/types";
import { prisma } from "./prisma";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CourseFilters {
  search?: string;
  category?: string;
  modality?: string;
  level?: string;
  instructor?: string;
  minPrice?: number;
  maxPrice?: number;
  /** newest | price-asc | price-desc | popular */
  sortBy?: string;
}

const COURSES_PER_PAGE = 12;

// ─── Búsqueda full-text via tsvector ─────────────────────────────────────────

/**
 * Usa to_tsvector/plainto_tsquery de PostgreSQL para obtener IDs rankeados
 * por relevancia cuando el usuario hace una búsqueda por texto libre.
 * El índice GIN en Course_fts_idx hace esto eficiente.
 */
async function getFtsMatchingIds(search: string): Promise<string[]> {
  try {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "Course"
      WHERE status = 'published'
        AND to_tsvector('spanish',
              coalesce(title, '') || ' ' || coalesce(description, '')
            ) @@ plainto_tsquery('spanish', ${search})
      ORDER BY ts_rank(
        to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')),
        plainto_tsquery('spanish', ${search})
      ) DESC
      LIMIT 200
    `;
    return rows.map((r) => r.id);
  } catch {
    // Si el índice FTS no existe aún, volvemos al ILIKE de Prisma
    return [];
  }
}

// ─── Listado público ──────────────────────────────────────────────────────────

export async function listPublishedCourses(
  filters: CourseFilters = {},
  page = 1,
  limit = COURSES_PER_PAGE
): Promise<{ courses: Course[]; total: number; hasMore: boolean }> {
  const { search, category, modality, level, instructor, minPrice, maxPrice, sortBy } = filters;

  type PrismaOrderBy = {
    createdAt?: "asc" | "desc";
    price?: "asc" | "desc";
    enrollments?: { _count: "asc" | "desc" };
  };
  const orderBy: PrismaOrderBy =
    sortBy === "price-asc"
      ? { price: "asc" }
      : sortBy === "price-desc"
        ? { price: "desc" }
        : sortBy === "popular"
          ? { enrollments: { _count: "desc" } }
          : { createdAt: "desc" };

  // Cuando hay búsqueda por texto, intentar FTS primero; si no hay resultados o
  // falla el índice, cae a ILIKE vía Prisma.
  let ftsIds: string[] | null = null;
  if (search && search.trim().length >= 2) {
    ftsIds = await getFtsMatchingIds(search.trim());
  }

  const where = {
    status: "published" as const,
    ...(ftsIds !== null && ftsIds.length > 0
      ? { id: { in: ftsIds } }
      : search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { instructor: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
    ...(category && { category: { contains: category, mode: "insensitive" as const } }),
    ...(modality && { modality: modality as Modality }),
    ...(level && { level: { contains: level, mode: "insensitive" as const } }),
    ...(instructor && { instructor: { name: { contains: instructor, mode: "insensitive" as const } } }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
  };

  const [raw, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        slug: true,
        title: true,
        modality: true,
        category: true,
        level: true,
        city: true,
        state: true,
        description: true,
        duration: true,
        price: true,
        imageUrl: true,
        instructor: { select: { name: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const courses = raw.map((course) => ({
    id: course.id,
    slug: course.slug ?? undefined,
    title: course.title,
    modality: course.modality,
    category: course.category,
    level: course.level ?? undefined,
    city: formatMexicoLocation(course.city, course.state) || "Online",
    description: course.description,
    duration: course.duration || "A tu ritmo",
    price: course.price,
    instructorName: course.instructor?.name ?? undefined,
    imageUrl:
      course.imageUrl ||
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
  }));

  return { courses, total, hasMore: page * limit < total };
}

export async function getPublishedCourseIdsForSitemap(): Promise<
  { id: string; slug: string | null; updatedAt: Date }[]
> {
  return prisma.course.findMany({
    where: { status: "published" },
    select: { id: true, slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublishedCourse(slugOrId: string) {
  const course = await prisma.course.findFirst({
    where: { status: "published", OR: [{ id: slugOrId }, { slug: slugOrId }] },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true } },
      reviews: {
        select: { rating: true, comment: true, user: { select: { name: true } }, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      sections: {
        orderBy: { order: "asc" as const },
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            orderBy: { order: "asc" as const },
            select: { id: true, title: true, type: true, duration: true, order: true, isFree: true },
          },
        },
      },
      courseSessions: {
        orderBy: { date: "asc" },
        select: {
          id: true,
          city: true,
          location: true,
          meetingUrl: true,
          date: true,
          startTime: true,
          endTime: true,
          maxStudents: true,
          joinCodeHash: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (course) {
    // SECURITY: no exponer respuestas del examen ni hash del código de acceso
    // @ts-ignore
    delete course.finalExam;
    const requiresJoinCode =
      (course.modality === "presencial" || course.modality === "live") &&
      course.price === 0 &&
      !!course.joinCodeHash;
    // @ts-expect-error no exponer hash
    delete course.joinCodeHash;
    const sessions = course.courseSessions.map(({ joinCodeHash, ...s }) => ({
      ...s,
      requiresJoinCode:
        (course.modality === "presencial" || course.modality === "live") &&
        course.price === 0 &&
        !!joinCodeHash,
    }));
    return { ...course, courseSessions: sessions, requiresJoinCode };
  }

  return course;
}
