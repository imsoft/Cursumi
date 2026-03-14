import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

const sendSchema = z.object({ body: z.string().min(1).max(2000) });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    // Verify user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { studentId: true, instructorId: true },
    });
    if (
      !conversation ||
      (conversation.studentId !== session.user.id && conversation.instructorId !== session.user.id)
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { name: true } } },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { body } = sendSchema.parse(await req.json());

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { studentId: true, instructorId: true },
    });
    if (
      !conversation ||
      (conversation.studentId !== session.user.id && conversation.instructorId !== session.user.id)
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: { conversationId: id, senderId: session.user.id, body },
      include: { sender: { select: { name: true } } },
    });

    // Notify the other participant
    const recipientId =
      conversation.studentId === session.user.id
        ? conversation.instructorId
        : conversation.studentId;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "message",
        title: "Nuevo mensaje",
        body: body.slice(0, 80),
        link: `/dashboard/my-courses`,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
