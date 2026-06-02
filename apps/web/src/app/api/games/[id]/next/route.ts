import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();

    const game = await prisma.quizGame.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    }
    if (game.hostId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const nextIndex = game.currentQuestion + 1;
    const isLast = nextIndex >= game.questions.length;

    const updated = await prisma.quizGame.update({
      where: { id },
      data: {
        status: isLast ? "finished" : "active",
        currentQuestion: isLast ? game.currentQuestion : nextIndex,
        questionStartedAt: isLast ? game.questionStartedAt : new Date(),
      },
    });

    return NextResponse.json({ game: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
