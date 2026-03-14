import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const { questionId, selectedOption } = await req.json() as {
      questionId: string;
      selectedOption: number;
    };

    const game = await prisma.quizGame.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!game) {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    }
    if (game.status !== "active") {
      return NextResponse.json({ error: "El juego no está activo" }, { status: 400 });
    }

    const participant = await prisma.quizGameParticipant.findUnique({
      where: { gameId_userId: { gameId: id, userId: session.user.id } },
    });
    if (!participant) {
      return NextResponse.json({ error: "No eres participante" }, { status: 403 });
    }

    const currentQ = game.questions[game.currentQuestion];
    if (!currentQ || currentQ.id !== questionId) {
      return NextResponse.json({ error: "Pregunta no válida" }, { status: 400 });
    }

    const existing = await prisma.quizGameAnswer.findUnique({
      where: {
        questionId_participantId: {
          questionId,
          participantId: participant.id,
        },
      },
    });
    if (existing) {
      return NextResponse.json({ answer: existing });
    }

    const isCorrect = selectedOption === currentQ.correct;
    let pointsEarned = 0;

    if (isCorrect && game.questionStartedAt) {
      const secondsElapsed = (Date.now() - game.questionStartedAt.getTime()) / 1000;
      const timeLeft = Math.max(0, currentQ.timeLimitSec - secondsElapsed);
      pointsEarned = Math.round(currentQ.points * Math.max(0.1, timeLeft / currentQ.timeLimitSec));
    }

    const answer = await prisma.$transaction(async (tx) => {
      const created = await tx.quizGameAnswer.create({
        data: {
          gameId: id,
          questionId,
          participantId: participant.id,
          selectedOption,
          isCorrect,
          pointsEarned,
        },
      });

      if (pointsEarned > 0) {
        await tx.quizGameParticipant.update({
          where: { id: participant.id },
          data: { score: { increment: pointsEarned } },
        });
      }

      return created;
    });

    return NextResponse.json({ answer });
  } catch (error) {
    return handleApiError(error);
  }
}
