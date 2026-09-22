import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { isApnsToken } from "@/lib/apns-push";
import { isFcmToken } from "@/lib/fcm-push";

interface TokenBody {
  token: string;
}

// Tokens de las apps nativas: iOS (`apns:<64 hex>`) y Android (`fcm:<token>`).
function isValidPushToken(token: unknown): token is string {
  return typeof token === "string" && (isApnsToken(token) || isFcmToken(token));
}

// POST /api/me/push-token — registrar el token de push del dispositivo
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as TokenBody;

    if (!isValidPushToken(body.token)) {
      return NextResponse.json({ error: "Token de push inválido" }, { status: 400 });
    }

    await prisma.pushToken.upsert({
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

    await prisma.pushToken.deleteMany({
      where: { token: body.token, userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
