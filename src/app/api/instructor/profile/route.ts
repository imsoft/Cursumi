import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(255).optional(),
  state: z.string().trim().max(80).optional(),
  city: z.string().trim().max(100).optional(),
  headline: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(2000).optional(),
  specialties: z.string().trim().max(500).optional(),
  teachingYears: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().min(0).optional(),
  ),
  website: z.union([z.string().url(), z.literal("")]).optional(),
  linkedinUrl: z.union([z.string().url(), z.literal("")]).optional(),
  instagramUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true, signatureUrl: true },
      }),
      prisma.instructorProfile.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      fullName: user?.name || "",
      email: user?.email || "",
      avatar: user?.image || null,
      signatureUrl: user?.signatureUrl || null,
      state: profile?.state || "",
      city: profile?.city || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      specialties: profile?.specialties || "",
      teachingYears: profile?.teachingYears ?? null,
      website: profile?.website || "",
      linkedinUrl: profile?.linkedinUrl || "",
      instagramUrl: profile?.instagramUrl || "",
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
    const { fullName, email, state, city, headline, bio, specialties, teachingYears, website, linkedinUrl, instagramUrl } = parsed.data;

    const profileData = {
      state,
      city,
      headline,
      bio,
      specialties,
      teachingYears: teachingYears ?? null,
      website: website || null,
      linkedinUrl: linkedinUrl || null,
      instagramUrl: instagramUrl || null,
    };

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
        update: profileData,
        create: {
          userId: session.user.id,
          ...profileData,
        },
      }),
    ]);

    return NextResponse.json({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
