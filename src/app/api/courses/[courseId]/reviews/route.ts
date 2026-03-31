import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { checkRateLimitAsync } from "@/lib/rate-limit";

const createSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const reviews = await prisma.review.findMany({
      where: { courseId, approved: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    const avg =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, average: Math.round(avg * 10) / 10, total: reviews.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await requireSession();

    // Máximo 3 reseñas por hora por usuario — previene spam
    const limited = await checkRateLimitAsync({
      key: `reviews:${session.user.id}`,
      limit: 3,
      windowSecs: 3600,
    });
    if (limited) return limited;

    const { courseId } = await params;
    const body = createSchema.parse(await req.json());

    // Verify enrollment — any enrolled student can leave a review
    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No estás inscrito en este curso" }, { status: 403 });
    }

    const review = await prisma.review.upsert({
      where: { courseId_userId: { courseId, userId: session.user.id } },
      update: { rating: body.rating, comment: body.comment },
      create: {
        courseId,
        userId: session.user.id,
        rating: body.rating,
        comment: body.comment,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}
