import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { code, nickname } = await req.json() as { code: string; nickname: string };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código y nickname son requeridos" }, { status: 400 });
    }
    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return NextResponse.json({ error: "Nickname es requerido" }, { status: 400 });
    }
    if (nickname.length > 30) {
      return NextResponse.json({ error: "Nickname no puede exceder 30 caracteres" }, { status: 400 });
    }

    const game = await prisma.quizGame.findUnique({ where: { code: code.toUpperCase() } });
    if (!game) {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    }
    if (game.status !== "waiting") {
      return NextResponse.json({ error: "El juego ya inició" }, { status: 400 });
    }

    const existing = await prisma.quizGameParticipant.findUnique({
      where: { gameId_userId: { gameId: game.id, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ gameId: game.id });
    }

    await prisma.quizGameParticipant.create({
      data: {
        gameId: game.id,
        userId: session.user.id,
        nickname,
      },
    });

    return NextResponse.json({ gameId: game.id });
  } catch (error) {
    return handleApiError(error);
  }
}
