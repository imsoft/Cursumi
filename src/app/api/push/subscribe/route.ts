import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

interface SubscribeBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// POST /api/push/subscribe — registrar suscripción Web Push
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as SubscribeBody;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      create: {
        userId: session.user.id,
        endpoint: body.endpoint,
        keys: body.keys,
      },
      update: {
        userId: session.user.id,
        keys: body.keys,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/push/subscribe — eliminar suscripción
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as { endpoint: string };

    if (!body.endpoint) {
      return NextResponse.json({ error: "endpoint requerido" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint: body.endpoint, userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
