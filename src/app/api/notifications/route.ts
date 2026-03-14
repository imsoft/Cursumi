import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    const [notifications, unreadAgg] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.aggregate({
        where: { userId: session.user.id, read: false },
        _count: true,
      }),
    ]);
    return NextResponse.json({ notifications, unreadCount: unreadAgg._count });
  } catch (error) {
    return handleApiError(error);
  }
}
