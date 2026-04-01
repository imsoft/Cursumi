import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { getUserRole } from "@/lib/user-service";
import {
  getCourseSessionOrThrow,
  assertStudentEnrolledInSession,
  assertInstructorOwnsCourse,
  serializeQuestion,
} from "@/lib/anonymous-session-questions";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

const MAX_CONTENT = 2000;
const MAX_PER_HOUR = 15;

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { sessionId } = await params;
    const cs = await getCourseSessionOrThrow(sessionId);
    const role = await getUserRole(session.user.id);
    const isAdmin = role === "admin";
    const isInstructor = cs.course.instructorId === session.user.id || isAdmin;

    if (isInstructor) {
      await assertInstructorOwnsCourse(session.user.id, cs.course.instructorId, isAdmin);
    } else {
      await assertStudentEnrolledInSession(session.user.id, cs.courseId, sessionId);
    }

    const rows = await prisma.sessionAnonymousQuestion.findMany({
      where: {
        courseSessionId: sessionId,
        ...(!isInstructor ? { NOT: { status: "dismissed" } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const viewer = isInstructor ? "instructor" : "student";
    const payload = rows.map((q) => serializeQuestion(q, session.user.id, viewer));

    return NextResponse.json({ questions: payload });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { sessionId } = await params;
    const cs = await getCourseSessionOrThrow(sessionId);
    const role = await getUserRole(session.user.id);
    if (role === "admin" || cs.course.instructorId === session.user.id) {
      throw new ApiError(403, "Solo los alumnos inscritos pueden enviar preguntas anónimas");
    }

    await assertStudentEnrolledInSession(session.user.id, cs.courseId, sessionId);

    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (content.length < 3) {
      return NextResponse.json({ error: "Escribe al menos 3 caracteres." }, { status: 400 });
    }
    if (content.length > MAX_CONTENT) {
      return NextResponse.json(
        { error: `El mensaje no puede superar ${MAX_CONTENT} caracteres.` },
        { status: 400 },
      );
    }

    const since = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await prisma.sessionAnonymousQuestion.count({
      where: {
        authorId: session.user.id,
        courseSessionId: sessionId,
        createdAt: { gte: since },
      },
    });
    if (recent >= MAX_PER_HOUR) {
      return NextResponse.json(
        { error: "Has enviado muchas preguntas en poco tiempo. Espera un momento e intenta de nuevo." },
        { status: 429 },
      );
    }

    const created = await prisma.sessionAnonymousQuestion.create({
      data: {
        courseSessionId: sessionId,
        courseId: cs.courseId,
        authorId: session.user.id,
        content,
      },
    });

    return NextResponse.json({
      question: serializeQuestion(created, session.user.id, "student"),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
