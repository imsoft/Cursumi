import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("change-role"), role: z.enum(["student", "instructor", "admin"]) }),
  z.object({ action: z.literal("verify-email") }),
  z.object({ action: z.literal("resend-verification") }),
  // Legacy (sin action) — mantiene compatibilidad con el código anterior
]).or(z.object({ role: z.enum(["student", "instructor", "admin"]) }));

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const body = await req.json();

    // ── Verificar email manualmente ──────────────────────────────────────
    if (body.action === "verify-email") {
      await prisma.user.update({
        where: { id },
        data: { emailVerified: true },
      });
      // Limpiar tokens de verificación pendientes
      const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
      if (user) {
        await prisma.verification.deleteMany({ where: { identifier: user.email } });
      }
      return NextResponse.json({ success: true });
    }

    // ── Reenviar correo de verificación ─────────────────────────────────
    if (body.action === "resend-verification") {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, emailVerified: true },
      });
      if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
      if (user.emailVerified) {
        return NextResponse.json({ error: "El correo ya está verificado" }, { status: 400 });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.verification.deleteMany({ where: { identifier: user.email } });
      await prisma.verification.create({
        data: { identifier: user.email, value: token, expiresAt },
      });

      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationLink = `${baseURL}/verify-email?token=${token}`;

      await sendVerificationEmail({
        to: user.email,
        name: user.name || "Usuario",
        verificationLink,
      });

      return NextResponse.json({ success: true });
    }

    // ── Cambiar rol ──────────────────────────────────────────────────────
    const { role } = z.object({ role: z.enum(["student", "instructor", "admin"]) }).parse(body);

    // Un admin no puede modificar su propio rol
    if (id === session.user.id) {
      return NextResponse.json({ error: "No puedes cambiar tu propio rol" }, { status: 403 });
    }

    // Un admin no puede modificar a otro admin
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (target?.role === "admin") {
      return NextResponse.json({ error: "No puedes cambiar el rol de otro administrador" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
