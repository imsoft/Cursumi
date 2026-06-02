import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { getUserRole } from "@/lib/user-service";
import {
  getCourseSessionOrThrow,
  assertInstructorOwnsCourse,
  serializeQuestion,
} from "@/lib/anonymous-session-questions";

interface RouteParams {
  params: Promise<{ sessionId: string; questionId: string }>;
}

const MAX_ANSWER = 5000;

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { sessionId, questionId } = await params;
    const cs = await getCourseSessionOrThrow(sessionId);
    const role = await getUserRole(session.user.id);
    const isAdmin = role === "admin";
    await assertInstructorOwnsCourse(session.user.id, cs.course.instructorId, isAdmin);

    const question = await prisma.sessionAnonymousQuestion.findFirst({
      where: { id: questionId, courseSessionId: sessionId },
    });
    if (!question) {
      return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
    }

    const body = await req.json();

    if (body.status === "dismissed") {
      const updated = await prisma.sessionAnonymousQuestion.update({
        where: { id: questionId },
        data: {
          status: "dismissed",
          answer: null,
          answeredAt: null,
        },
      });
      return NextResponse.json({
        question: serializeQuestion(updated, session.user.id, "instructor"),
      });
    }

    const answer = typeof body.answer === "string" ? body.answer.trim() : "";
    if (answer.length < 1) {
      return NextResponse.json({ error: "La respuesta no puede estar vacía." }, { status: 400 });
    }
    if (answer.length > MAX_ANSWER) {
      return NextResponse.json(
        { error: `La respuesta no puede superar ${MAX_ANSWER} caracteres.` },
        { status: 400 },
      );
    }

    const updated = await prisma.sessionAnonymousQuestion.update({
      where: { id: questionId },
      data: {
        answer,
        status: "answered",
        answeredAt: new Date(),
      },
    });

    return NextResponse.json({
      question: serializeQuestion(updated, session.user.id, "instructor"),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
