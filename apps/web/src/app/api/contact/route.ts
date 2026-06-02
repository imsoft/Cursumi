import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  reason: z.string(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimitAsync({ key: `contact:${ip}`, limit: 5, windowSecs: 3600 });
  if (rl) return rl;

  try {
    const body = schema.parse(await req.json());
    await sendContactEmail(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error("Error al enviar contacto:", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
