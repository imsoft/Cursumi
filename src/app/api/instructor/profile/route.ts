import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  headline: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(2000).optional(),
  specialties: z.string().trim().max(500).optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true },
      }),
      prisma.instructorProfile.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      fullName: user?.name || "",
      email: user?.email || "",
      avatar: user?.image || null,
      city: profile?.city || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      specialties: profile?.specialties || "",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const raw = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 422 });
    }
    const { fullName, email, city, headline, bio, specialties } = parsed.data;

    await Promise.all([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(fullName !== undefined ? { name: fullName } : {}),
          ...(email !== undefined ? { email } : {}),
        },
      }),
      prisma.instructorProfile.upsert({
        where: { userId: session.user.id },
        update: { city, headline, bio, specialties },
        create: {
          userId: session.user.id,
          city,
          headline,
          bio,
          specialties,
        },
      }),
    ]);

    return NextResponse.json({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
