import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

// GET /api/notes - Lista de notas para el estudiante
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const lessonId = searchParams.get("lessonId");
    
    const notes = await prisma.courseNote.findMany({
      where: {
        userId,
        ...(courseId ? { courseId } : {}),
        ...(lessonId ? { lessonId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        course: { 
          select: { 
            id: true, 
            title: true, 
            instructorId: true,
            instructor: { select: { name: true } }
          }
        },
        lesson: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/notes - Crea una nueva nota
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const body = await req.json();
    const { courseId, lessonId, content } = body;

    if (!courseId || !content) {
      return NextResponse.json(
        { error: "El courseId y el content son requeridos." }, 
        { status: 400 }
      );
    }

    const newNote = await prisma.courseNote.create({
      data: {
        userId,
        courseId,
        lessonId: lessonId || null,
        content
      },
      include: {
        course: { select: { title: true } },
        lesson: { select: { title: true } }
      }
    });

    return NextResponse.json(newNote);
  } catch (error) {
    return handleApiError(error);
  }
}
