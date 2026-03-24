import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  reason: z.string(),
  message: z.string().min(1),
});

const CONTACT_EMAIL = "cursumi.com@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email no configurado" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || "Cursumi <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to: [CONTACT_EMAIL],
      replyTo: body.email,
      subject: `[Contacto - ${body.reason}] ${body.subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#667eea;margin-bottom:20px;">Nuevo mensaje de contacto</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:8px 12px;font-weight:600;color:#374151;">Nombre</td><td style="padding:8px 12px;">${body.name}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:8px 12px;font-weight:600;color:#374151;">Correo</td><td style="padding:8px 12px;"><a href="mailto:${body.email}">${body.email}</a></td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#374151;">Motivo</td><td style="padding:8px 12px;">${body.reason}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:8px 12px;font-weight:600;color:#374151;">Asunto</td><td style="padding:8px 12px;">${body.subject}</td></tr>
          </table>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:14px;color:#1f2937;">
            ${body.message}
          </div>
          <p style="font-size:12px;color:#9ca3af;margin-top:20px;">Puedes responder directamente a este correo para contestar al usuario.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error("Error al enviar contacto:", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
