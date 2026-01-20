import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

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
    const body = await req.json().catch(() => ({}));
    const { fullName, email } = body as { fullName?: string; email?: string };

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName,
        email,
      },
      select: { name: true, email: true },
    });

    return NextResponse.json({ updated });
  } catch (error) {
    return handleApiError(error);
  }
}
