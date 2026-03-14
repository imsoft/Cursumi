import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

/** PATCH /api/conversations/[id]/read — marca mensajes no leídos como leídos */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { studentId: true, instructorId: true },
    });
    if (
      !conversation ||
      (conversation.studentId !== session.user.id &&
        conversation.instructorId !== session.user.id)
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.message.updateMany({
      where: { conversationId: id, read: false, senderId: { not: session.user.id } },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
