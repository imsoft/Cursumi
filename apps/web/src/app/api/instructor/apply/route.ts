import { NextResponse } from "next/server";
import { z } from "zod";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// RFC (México): 3-4 letras + 6 dígitos (fecha) + 3 de homoclave
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;

const bodySchema = z.object({
  headline: z.string().min(1).max(120),
  bio: z.string().min(10).max(1000),
  reason: z.string().min(20).max(2000),
  legalName: z.string().min(3, "Ingresa tu nombre legal completo").max(160),
  rfc: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => rfcRegex.test(v), "RFC inválido (12-13 caracteres)"),
  fiscalAddress: z.string().min(5, "Ingresa tu domicilio fiscal").max(300),
});

// GET — devuelve la solicitud del usuario actual
export async function GET() {
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await prisma.instructorApplication.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
      headline: true,
      bio: true,
      reason: true,
      legalName: true,
      rfc: true,
      fiscalAddress: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ application });
}

// POST — envía una nueva solicitud
export async function POST(req: Request) {
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Si ya es instructor, no puede solicitar
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role === "instructor" || user?.role === "admin") {
    return NextResponse.json({ error: "Ya eres instructor" }, { status: 409 });
  }

  // Si ya tiene una solicitud activa (pending), no puede crear otra
  const existing = await prisma.instructorApplication.findUnique({
    where: { userId: session.user.id },
  });
  if (existing && existing.status === "pending") {
    return NextResponse.json({ error: "Ya tienes una solicitud pendiente" }, { status: 409 });
  }

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Datos inválidos", details: body.error.flatten() }, { status: 400 });
  }

  // Si tenía una solicitud rechazada, actualizarla; si no, crear nueva
  let application;
  if (existing && existing.status === "rejected") {
    application = await prisma.instructorApplication.update({
      where: { userId: session.user.id },
      data: {
        status: "pending",
        headline: body.data.headline,
        bio: body.data.bio,
        reason: body.data.reason,
        legalName: body.data.legalName,
        rfc: body.data.rfc,
        fiscalAddress: body.data.fiscalAddress,
        rejectionReason: null,
      },
    });
  } else {
    application = await prisma.instructorApplication.create({
      data: {
        userId: session.user.id,
        headline: body.data.headline,
        bio: body.data.bio,
        reason: body.data.reason,
        legalName: body.data.legalName,
        rfc: body.data.rfc,
        fiscalAddress: body.data.fiscalAddress,
      },
    });
  }

  return NextResponse.json({ application }, { status: 201 });
}
