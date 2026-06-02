import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const search = req.nextUrl.searchParams.get("q") || "";

    // Get courses available for business (public, both, business_only) that the org doesn't already have
    const existingAccess = await prisma.orgCourseAccess.findMany({
      where: { organizationId: org.id },
      select: { courseId: true },
    });
    const excludeIds = existingAccess.map((a) => a.courseId);

    const courses = await prisma.course.findMany({
      where: {
        status: "published",
        visibility: { in: ["public", "both", "business_only"] },
        id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        category: true,
        modality: true,
        level: true,
        price: true,
        visibility: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ courses });
  } catch (error) {
    return handleApiError(error);
  }
}
