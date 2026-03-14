import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function generateUniqueCode(): Promise<string> {
  let code = generateCode();
  let existing = await prisma.quizGame.findUnique({ where: { code } });
  while (existing) {
    code = generateCode();
    existing = await prisma.quizGame.findUnique({ where: { code } });
  }
  return code;
}

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const games = await prisma.quizGame.findMany({
      where: { hostId: session.user.id },
      include: {
        _count: { select: { participants: true, questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ games });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const body = await req.json();
    const { title, questions } = body as {
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

    const code = await generateUniqueCode();

    const game = await prisma.$transaction(async (tx) => {
      const created = await tx.quizGame.create({
        data: {
          code,
          title,
          hostId: session.user.id,
        },
      });

      await tx.quizGameQuestion.createMany({
        data: questions.map((q, i) => ({
          gameId: created.id,
          order: i,
          question: q.question,
          options: q.options,
          correct: q.correct,
          timeLimitSec: q.timeLimitSec ?? 20,
          points: q.points ?? 1000,
        })),
      });

      return tx.quizGame.findUnique({
        where: { id: created.id },
        include: { questions: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
