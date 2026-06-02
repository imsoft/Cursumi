import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findFirst({
      where: { slug, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImageUrl: true,
        tags: true,
        publishedAt: true,
        updatedAt: true,
        author: { select: { name: true, image: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}
