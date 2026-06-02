import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        published: true,
        publishedAt: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const body = createSchema.parse(await req.json());

    const existing = await prisma.blogPost.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un post con ese slug" }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        ...body,
        coverImageUrl: body.coverImageUrl || null,
        publishedAt: body.published ? new Date() : null,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return handleApiError(error);
  }
}
