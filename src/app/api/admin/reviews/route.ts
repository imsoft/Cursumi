import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

// GET /api/admin/reviews?approved=false — lista reseñas pendientes de moderación
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { searchParams } = req.nextUrl;
    const approvedParam = searchParams.get("approved");
    const approved = approvedParam === "true" ? true : approvedParam === "false" ? false : undefined;
    const courseId = searchParams.get("courseId") || undefined;

    const reviews = await prisma.review.findMany({
      where: {
        ...(approved !== undefined && { approved }),
        ...(courseId && { courseId }),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        approved: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}
