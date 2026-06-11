import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

interface TokenBody {
  token: string;
}

// Acepta solo tokens con el formato de Expo: ExponentPushToken[...] o ExpoPushToken[...]
function isValidExpoToken(token: unknown): token is string {
  return (
    typeof token === "string" &&
    /^Expo(nent)?PushToken\[.+\]$/.test(token)
  );
}

// POST /api/me/push-token — registrar el token de Expo del dispositivo
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as TokenBody;

    if (!isValidExpoToken(body.token)) {
      return NextResponse.json({ error: "Token de Expo inválido" }, { status: 400 });
    }

    await prisma.expoPushToken.upsert({
      where: { token: body.token },
      create: { userId: session.user.id, token: body.token },
      update: { userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/me/push-token — desregistrar (logout)
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as TokenBody;

    if (!body.token) {
      return NextResponse.json({ error: "token requerido" }, { status: 400 });
    }

    await prisma.expoPushToken.deleteMany({
      where: { token: body.token, userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
