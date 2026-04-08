import { prisma } from "@/lib/prisma";

/** Si `activityId` es una lección `section_quiz` / `section_minigame`, marca progreso de lección (sin duplicar unidades en `recalculateProgress`). */
export async function upsertLessonProgressForGateActivity(args: {
  enrollmentId: string;
  courseId: string;
  sectionId: string;
  activityId: string;
}) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: args.activityId,
      sectionId: args.sectionId,
      section: { courseId: args.courseId },
      type: { in: ["section_quiz", "section_minigame"] },
    },
    select: { id: true },
  });
  if (!lesson) return;
  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: args.enrollmentId,
        lessonId: lesson.id,
      },
    },
    update: {},
    create: { enrollmentId: args.enrollmentId, lessonId: lesson.id },
  });
}
