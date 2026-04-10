import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";

/** GET /api/wishlist — lista de IDs de cursos en wishlist del usuario */
export async function GET() {
  try {
    const session = await requireSession();
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { courseId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items.map((i) => i.courseId));
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/wishlist — togglea un curso (añade si no existe, elimina si existe) */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { courseId } = await req.json();
    if (typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId requerido" }, { status: 400 });
    }

    // Verificar que el curso existe y está publicado
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: "published" },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { userId_courseId: { userId: session.user.id, courseId } },
      });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.wishlistItem.create({
        data: { userId: session.user.id, courseId },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
