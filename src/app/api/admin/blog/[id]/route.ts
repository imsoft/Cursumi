import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const body = updateSchema.parse(await req.json());

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    if (body.slug && body.slug !== existing.slug) {
      const conflict = await prisma.blogPost.findUnique({ where: { slug: body.slug } });
      if (conflict) {
        return NextResponse.json({ error: "Ya existe un post con ese slug" }, { status: 409 });
      }
    }

    const publishedAt =
      body.published === true && !existing.publishedAt
        ? new Date()
        : body.published === false
        ? null
        : existing.publishedAt;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...body,
        coverImageUrl: body.coverImageUrl === "" ? null : body.coverImageUrl,
        publishedAt,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
