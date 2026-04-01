import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-helpers";
import type { SessionAnonymousQuestion } from "@/generated/prisma";

export async function getCourseSessionOrThrow(sessionId: string) {
  const cs = await prisma.courseSession.findUnique({
    where: { id: sessionId },
    include: {
      course: { select: { id: true, instructorId: true, modality: true } },
    },
  });
  if (!cs) throw new ApiError(404, "Sesión no encontrada");
  if (cs.course.modality !== "presencial") {
    throw new ApiError(400, "Las preguntas anónimas solo aplican a cursos presenciales");
  }
  return cs;
}

export async function assertStudentEnrolledInSession(
  userId: string,
  courseId: string,
  sessionId: string,
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: userId } },
  });
  if (!enrollment || enrollment.status !== "active") {
    throw new ApiError(403, "Debes estar inscrito en este curso");
  }
  if (enrollment.sessionId !== sessionId) {
    throw new ApiError(403, "Esta sección corresponde a otra sesión presencial");
  }
}

export async function assertInstructorOwnsCourse(userId: string, instructorId: string, isAdmin: boolean) {
  if (isAdmin) return;
  if (instructorId !== userId) {
    throw new ApiError(403, "No autorizado");
  }
}

export function serializeQuestion(
  q: SessionAnonymousQuestion,
  viewerId: string,
  viewer: "student" | "instructor",
) {
  const base = {
    id: q.id,
    content: q.content,
    createdAt: q.createdAt.toISOString(),
    status: q.status,
    answer: q.answer,
    answeredAt: q.answeredAt?.toISOString() ?? null,
  };
  if (viewer === "student") {
    return { ...base, isMine: q.authorId === viewerId };
  }
  return base;
}
