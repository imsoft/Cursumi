import { NextRequest, NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PATCH /api/instructor/portfolio/[id] — actualiza un proyecto
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCachedSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, url, imageUrl, tags, category } = body;

  if (title !== undefined && !title.trim()) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  const updated = await prisma.portfolioProject.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(url !== undefined && { url: url?.trim() || null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      ...(tags !== undefined && { tags: tags?.trim() || null }),
      ...(category !== undefined && { category: category?.trim() || null }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/instructor/portfolio/[id] — elimina un proyecto
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCachedSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.portfolioProject.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
