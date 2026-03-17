import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(255).optional(),
}).refine((d) => d.fullName !== undefined || d.email !== undefined, {
  message: "Se debe proporcionar al menos un campo para actualizar",
});

export async function GET() {
  try {
    const session = await requireSession();
    const [user, enrollments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, createdAt: true, image: true },
      }),
      prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        select: { status: true, progress: true },
      }),
    ]);

    const coursesCompleted = enrollments.filter((e) => e.status === "completed" || e.progress >= 100).length;
    const coursesInProgress = enrollments.filter((e) => e.status !== "completed" && e.progress < 100).length;

    return NextResponse.json({
      fullName: user?.name || "Usuario",
      email: user?.email || "",
      joinDate: user?.createdAt?.toISOString() ?? "",
      avatar: user?.image || null,
      coursesCompleted,
      coursesInProgress,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const raw = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 422 });
    }
    const { fullName, email } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(fullName !== undefined ? { name: fullName } : {}),
        ...(email !== undefined ? { email } : {}),
      },
      select: { name: true, email: true },
    });

    return NextResponse.json({ updated });
  } catch (error) {
    return handleApiError(error);
  }
}
