import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, turnstileToken } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // 1. Validate CAPTCHA
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
    
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "CAPTCHA requerido" }, { status: 400 });
      }
      const captchaResult = await verifyTurnstile(turnstileToken, ip);
      if (!captchaResult.success) {
        return NextResponse.json({ error: "Captcha inválido" }, { status: 400 });
      }
    }

    // 2. Call Better Auth internal forget password method strictly using the native API on the backend
    try {
      // @ts-ignore (Tipos ocultos por better-auth/email-otp plugin mismatch)
      await auth.api.forgetPassword({
        body: {
          email,
          redirectTo: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` : "http://localhost:3000/reset-password",
        },
        headers: reqHeaders,
      });
    } catch (authError: any) {
      console.error("Error from Better Auth core:", authError);
      // Even if Better Auth throws "User not found", we continue (OWASP recommendation: do not leak existance of user)
    }

    return NextResponse.json({ success: true, message: "Correo enviado" });
  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json({ error: "Hubo un error inesperado" }, { status: 500 });
  }
}
