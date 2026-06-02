import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { checkRateLimitAsync } from "@/lib/rate-limit";

const createSchema = z.object({
  content: z.string().min(10, "Escribe al menos 10 caracteres.").max(2000),
});

function publicDisplayName(name: string | null | undefined): string {
  const t = name?.trim();
  if (!t) return "Participante";
  return t.split(/\s+/)[0] ?? "Participante";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: "published",
        visibility: { in: ["public", "both"] },
      },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const rows = await prisma.learningReflection.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    const reflections = rows.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      authorLabel: publicDisplayName(r.user.name),
    }));

    return NextResponse.json({ reflections });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const session = await requireSession();
    const limited = await checkRateLimitAsync({
      key: `learning-reflection:${session.user.id}`,
      limit: 5,
      windowSecs: 3600,
    });
    if (limited) return limited;

    const { courseId } = await params;
    const body = createSchema.parse(await req.json());

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: "published",
      },
      select: { id: true, slug: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
      select: {
        id: true,
        status: true,
        learningReflectionEmailSentAt: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No estás inscrito en este curso" }, { status: 403 });
    }

    const canSubmit =
      enrollment.status === "completed" || enrollment.learningReflectionEmailSentAt != null;
    if (!canSubmit) {
      return NextResponse.json(
        {
          error:
            "Podrás compartir qué aprendiste cuando termines el curso o después de recibir la invitación por correo.",
        },
        { status: 403 },
      );
    }

    const reflection = await prisma.learningReflection.upsert({
      where: { enrollmentId: enrollment.id },
      update: { content: body.content },
      create: {
        enrollmentId: enrollment.id,
        courseId,
        userId: session.user.id,
        content: body.content,
      },
    });

    if (course.slug) {
      revalidatePath(`/courses/${course.slug}`);
    }

    return NextResponse.json({
      id: reflection.id,
      content: reflection.content,
      updatedAt: reflection.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
