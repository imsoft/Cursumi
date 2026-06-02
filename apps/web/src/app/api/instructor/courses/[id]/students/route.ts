import { NextRequest, NextResponse } from "next/server";
import { getCourseDetail, listCourseStudents } from "@/lib/course-service";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();
    const role = await requireRole(session.user.id, ["instructor", "admin"]);

    const course = await getCourseDetail(id);
    if (!course || (course.instructorId !== session.user.id && role !== "admin")) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const students = await listCourseStudents(id);
    return NextResponse.json(students);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await context.params;
    const session = await requireSession();
    const role = await requireRole(session.user.id, ["instructor", "admin"]);

    const course = await getCourseDetail(courseId);
    if (!course || (course.instructorId !== session.user.id && role !== "admin")) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const { enrollmentId } = (await req.json()) as { enrollmentId: string };
    if (!enrollmentId) {
      return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 });
    }

    // Verify enrollment belongs to this course
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, courseId },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
    }

    await prisma.enrollment.delete({ where: { id: enrollmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
