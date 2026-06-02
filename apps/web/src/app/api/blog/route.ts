import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const tag = searchParams.get("tag") ?? undefined;
    const pageRaw = parseInt(searchParams.get("page") ?? "1");
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 100) : 1;
    const limit = 9;

    const where = {
      published: true,
      ...(tag ? { tags: { has: tag } } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          tags: true,
          publishedAt: true,
          author: { select: { name: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return handleApiError(error);
  }
}
