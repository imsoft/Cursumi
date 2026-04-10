import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

interface NoteParams {
  params: Promise<{ noteId: string }>;
}

async function resolveNoteForUser(noteId: string, userId: string) {
  const note = await prisma.courseNote.findUnique({
    where: { id: noteId },
    select: { id: true, userId: true, courseId: true, lessonId: true, content: true },
  });

  if (!note || note.userId !== userId) return { note: null, error: "Nota no encontrada o permiso denegado." };

  // Verify the user is still enrolled in the course this note belongs to
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId: note.courseId, studentId: userId } },
    select: { id: true },
  });
  if (!enrollment) return { note: null, error: "No tienes acceso a este curso." };

  return { note, error: null };
}

export async function PATCH(req: NextRequest, { params }: NoteParams) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const { noteId } = await params;

    const body = await req.json();
    const { content } = body;

    const { note, error } = await resolveNoteForUser(noteId, userId);
    if (!note) {
      return NextResponse.json({ error }, { status: 403 });
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

    const { note, error } = await resolveNoteForUser(noteId, userId);
    if (!note) {
      return NextResponse.json({ error }, { status: 403 });
    }

    await prisma.courseNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true, message: "Nota eliminada correctamente." });
  } catch (error) {
    return handleApiError(error);
  }
}
