import { Prisma } from "@/generated/prisma";

type CourseFromDb = NonNullable<
  Awaited<ReturnType<typeof import("@/lib/course-service").getCourseDetail>>
>;

/**
 * Fechas inválidas hacían que `Date#toISOString()` lanzara RangeError → 500 en producción.
 */
function toIsoDateString(value: Date | string): string {
  const t = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(t.getTime())) {
    return new Date(0).toISOString();
  }
  return t.toISOString();
}

/**
 * JSON de Prisma puede incluir sentinels no serializables en el protocolo RSC.
 * Devolvemos solo datos JSON puros (null u objeto/array).
 */
function toPlainJson(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  if (value === Prisma.JsonNull || value === Prisma.DbNull) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

/**
 * Convierte el curso de Prisma en un objeto plano serializable para componentes cliente.
 * Next.js no permite pasar `Date`, `BigInt`, etc. a "use client".
 */
export function serializeInstructorCourseForOverview(course: CourseFromDb) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    modality: course.modality as string,
    courseType: course.courseType as string,
    price: course.price,
    imageUrl: course.imageUrl,
    status: course.status,
    /** Presencial gratis con código configurado (el hash no se expone) */
    hasJoinCode: !!course.joinCodeHash,
    finalExam: toPlainJson(course.finalExam),
    sections: course.sections.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      order: s.order,
      quiz: toPlainJson(s.quiz),
      minigame: toPlainJson(s.minigame),
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration,
        order: l.order,
      })),
    })),
    courseSessions: (course.courseSessions ?? []).map((s) => ({
      id: s.id,
      city: s.city,
      location: s.location,
      date: toIsoDateString(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
      maxStudents: s.maxStudents,
      _count: { enrollments: s._count.enrollments },
    })),
    _count: { enrollments: course._count.enrollments },
  };
}

export type SerializedInstructorCourseOverview = ReturnType<
  typeof serializeInstructorCourseForOverview
>;
