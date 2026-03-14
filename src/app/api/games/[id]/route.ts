import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

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

    return NextResponse.json({
      game,
      currentQ,
      participants: game.participants,
      myAnswer,
      myParticipantId: participant?.id ?? null,
      myNickname: participant?.nickname ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
