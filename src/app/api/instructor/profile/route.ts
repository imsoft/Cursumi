import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      }),
      prisma.instructorProfile.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      fullName: user?.name || "",
      email: user?.email || "",
      city: profile?.city || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      specialties: profile?.specialties || "",
      teachingYears: profile?.specialties ? undefined : undefined,
      website: null,
      linkedinUrl: null,
      instagramUrl: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const body = await req.json();

    const {
      fullName,
      email,
      city,
      headline,
      bio,
      specialties,
      teachingYears,
      website,
      linkedinUrl,
      instagramUrl,
    } = body as Record<string, any>;

    await Promise.all([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: fullName,
          email,
        },
      }),
      prisma.instructorProfile.upsert({
        where: { userId: session.user.id },
        update: {
          city,
          headline,
          bio,
          specialties,
          // teachingYears not in schema; ignore
        },
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
