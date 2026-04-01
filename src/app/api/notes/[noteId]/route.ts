import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

interface NoteParams {
  params: Promise<{ noteId: string }>;
}

export async function PATCH(req: NextRequest, { params }: NoteParams) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const { noteId } = await params;

    const body = await req.json();
    const { content } = body;

    const note = await prisma.courseNote.findUnique({
      where: { id: noteId }
    });

    if (!note || note.userId !== userId) {
      return NextResponse.json({ error: "Nota no encontrada o permiso denegado." }, { status: 403 });
    }

    const updatedNote = await prisma.courseNote.update({
      where: { id: noteId },
      data: { content },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: NoteParams) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const { noteId } = await params;

    const note = await prisma.courseNote.findUnique({
      where: { id: noteId }
    });

    if (!note || note.userId !== userId) {
      return NextResponse.json({ error: "Nota no encontrada o permiso denegado." }, { status: 403 });
    }

    await prisma.courseNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true, message: "Nota eliminada correctamente." });
  } catch (error) {
    return handleApiError(error);
  }
}
