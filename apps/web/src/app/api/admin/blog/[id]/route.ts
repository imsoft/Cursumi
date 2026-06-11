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
  // Fecha/hora de publicación (ISO) — permite programar o reprogramar.
  publishedAt: z.string().datetime().optional().nullable(),
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

    // Resolver publishedAt:
    //  - published=false → draft (null)
    //  - fecha explícita → programar/reprogramar (vacía = ahora)
    //  - publicar sin fecha y sin fecha previa → ahora
    //  - en otro caso, conservar la existente
    let publishedAt = existing.publishedAt;
    if (body.published === false) {
      publishedAt = null;
    } else if (body.publishedAt !== undefined) {
      publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
    } else if (body.published === true && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const { publishedAt: _publishedAtInput, ...rest } = body;
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        coverImageUrl: rest.coverImageUrl === "" ? null : rest.coverImageUrl,
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
