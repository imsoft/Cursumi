import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const TOKEN_EXPIRY_HOURS = 24;

export async function POST(req: NextRequest) {
  // Máximo 3 reenvíos por IP cada 10 minutos — evita spam de emails
  const ip = getClientIp(req);
  const limited = checkRateLimit({ key: `resend-verification:${ip}`, limit: 3, windowSecs: 600 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : null;
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, emailVerified: true },
    });
    if (!user) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "El correo ya está verificado" }, { status: 400 });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.verification.deleteMany({ where: { identifier: email } });
    await prisma.verification.create({
      data: {
        identifier: email,
        value: token,
        expiresAt,
      },
    });

    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationLink = `${baseURL}/verify-email?token=${token}`;

    await sendVerificationEmail({
      to: user.email,
      name: user.name || "Usuario",
      verificationLink,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { error: "No se pudo reenviar el correo" },
      { status: 500 }
    );
  }
}
