import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendProfileReminderEmail } from "@/lib/email";

// Los campos que evaluamos para completar el perfil
const PROFILE_FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Nombre completo" },
  { key: "image", label: "Foto de perfil" },
  { key: "phone", label: "Teléfono" },
  { key: "city", label: "Ciudad" },
  { key: "bio", label: "Biografía" },
  { key: "website", label: "Sitio web" },
  { key: "linkedinUrl", label: "LinkedIn" },
  { key: "instagramUrl", label: "Instagram" },
];

// GET /api/cron/profile-reminders
// Envía un correo a usuarios con perfil incompleto.
// Protegido con CRON_SECRET.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Usuarios que se registraron hace más de 1 día (darles tiempo de completar al registrarse)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { lt: oneDayAgo },
      // Al menos un campo vacío = perfil incompleto
      OR: [
        { name: null },
        { name: "" },
        { image: null },
        { phone: null },
        { city: null },
        { bio: null },
        { website: null },
        { linkedinUrl: null },
        { instagramUrl: null },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      phone: true,
      city: true,
      bio: true,
      website: true,
      linkedinUrl: true,
      instagramUrl: true,
    },
    take: 100,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com";
  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    // Calcular campos faltantes
    const values: Record<string, string | null> = {
      name: user.name,
      image: user.image,
      phone: user.phone,
      city: user.city,
      bio: user.bio,
      website: user.website,
      linkedinUrl: user.linkedinUrl,
      instagramUrl: user.instagramUrl,
    };

    const missing = PROFILE_FIELDS.filter((f) => !values[f.key]);
    const filled = PROFILE_FIELDS.length - missing.length;
    const percent = Math.round((filled / PROFILE_FIELDS.length) * 100);

    // Si ya completó todo, no enviar
    if (missing.length === 0) {
      skipped++;
      continue;
    }

    try {
      await sendProfileReminderEmail({
        to: user.email,
        name: user.name || "Estudiante",
        percent,
        missingFields: missing.map((f) => f.label),
        profileUrl: `${baseUrl}/dashboard/account?tab=profile`,
      });
      sent++;
    } catch {
      // No interrumpir el loop
    }
  }

  return NextResponse.json({ sent, skipped, total: users.length });
}
