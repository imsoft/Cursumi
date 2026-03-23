type CourseFromDb = NonNullable<
  Awaited<ReturnType<typeof import("@/lib/course-service").getCourseDetail>>
>;

function toIsoDateString(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const t = new Date(value);
  if (Number.isNaN(t.getTime())) return new Date().toISOString();
  return t.toISOString();
}

/**
 * Convierte el curso de Prisma en un objeto plano serializable para componentes cliente.
 * Next.js no permite pasar `Date`, `undefined` en ciertos casos, etc. a "use client".
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
    finalExam: course.finalExam,
    sections: course.sections.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      order: s.order,
      quiz: s.quiz,
      minigame: s.minigame,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration,
        order: l.order,
      })),
    })),
    courseSessions: course.courseSessions?.map((s) => ({
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
