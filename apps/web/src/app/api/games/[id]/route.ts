import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();

    const game = await prisma.quizGame.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        participants: { orderBy: { score: "desc" } },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    }

    const isHost = game.hostId === session.user.id;
    const participant = game.participants.find((p) => p.userId === session.user.id);

    if (!isHost && !participant) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const currentQ = game.questions[game.currentQuestion] ?? null;

    let myAnswer = null;
    if (currentQ && participant) {
      myAnswer = await prisma.quizGameAnswer.findUnique({
        where: {
          questionId_participantId: {
            questionId: currentQ.id,
            participantId: participant.id,
          },
        },
      });
    }

    // La respuesta correcta solo sale del servidor cuando ya no sirve para hacer
    // trampa: al anfitrión (que proyecta el resultado) y al participante que YA
    // contestó esta pregunta, para poder mostrarle cuál era. Antes se mandaban
    // todas las preguntas tal cual salen de la base, así que cualquier jugador
    // podía leer `correct` en la pestaña de red y contestar perfecto.
    const sinRespuesta = <T extends { correct: number }>({ correct: _c, ...q }: T) => q;
    const yaContesto = !!myAnswer;

    return NextResponse.json({
      game: {
        ...game,
        questions: isHost ? game.questions : game.questions.map(sinRespuesta),
      },
      currentQ: currentQ && !isHost && !yaContesto ? sinRespuesta(currentQ) : currentQ,
      participants: game.participants,
      myAnswer,
      myParticipantId: participant?.id ?? null,
      myNickname: participant?.nickname ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const game = await prisma.quizGame.findUnique({ where: { id }, select: { hostId: true, status: true } });
    if (!game) return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    if (game.hostId !== session.user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    if (game.status !== "waiting") {
      return NextResponse.json({ error: "Solo se pueden editar juegos que aún no han iniciado" }, { status: 400 });
    }

    const { title, questions } = (await req.json()) as {
      title: string;
      questions: {
        question: string;
        options: string[];
        correct: number;
        timeLimitSec?: number;
        points?: number;
      }[];
    };

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Título y preguntas son requeridos" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.quizGame.update({ where: { id }, data: { title } });
      await tx.quizGameQuestion.deleteMany({ where: { gameId: id } });
      await tx.quizGameQuestion.createMany({
        data: questions.map((q, i) => ({
          gameId: id,
          order: i,
          question: q.question,
          options: q.options,
          correct: q.correct,
          timeLimitSec: q.timeLimitSec ?? 20,
          points: q.points ?? 1000,
        })),
      });
      return tx.quizGame.findUnique({
        where: { id },
        include: { questions: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ game: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const game = await prisma.quizGame.findUnique({ where: { id }, select: { hostId: true } });
    if (!game) return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    if (game.hostId !== session.user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    await prisma.quizGame.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
