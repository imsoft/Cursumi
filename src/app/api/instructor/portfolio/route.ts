import { NextRequest, NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/instructor/portfolio — lista los proyectos del instructor autenticado
export async function GET() {
  const session = await getCachedSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const projects = await prisma.portfolioProject.findMany({
    where: { userId: session.user.id },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(projects);
}

// POST /api/instructor/portfolio — crea un nuevo proyecto
export async function POST(req: NextRequest) {
  const session = await getCachedSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { title, description, url, imageUrl, tags, category } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  // Determinar el siguiente orden
  const count = await prisma.portfolioProject.count({
    where: { userId: session.user.id },
  });

  const project = await prisma.portfolioProject.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      url: url?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      tags: tags?.trim() || null,
      category: category?.trim() || null,
      order: count,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
