import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  // Email no se actualiza aquí: requiere flujo de verificación por correo
  phone: z.string().max(30).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  website: z.union([z.string().url().max(500), z.literal("")]).optional().nullable(),
  linkedinUrl: z.union([z.string().url().max(500), z.literal("")]).optional().nullable(),
  instagramUrl: z.union([z.string().url().max(500), z.literal("")]).optional().nullable(),
  /** Preferir POST /api/me/avatar para fotos; aquí aceptamos URL (p. ej. Cloudinary) o data URL pequeño */
  avatar: z
    .union([
      z.string().url().max(2048),
      z.string().regex(/^data:image\/(jpeg|png|webp|gif);base64,/).max(100_000), // ~75 KB max
    ])
    .nullable()
    .optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    const [user, enrollments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true, email: true, createdAt: true, image: true,
          phone: true, state: true, city: true, bio: true, website: true, linkedinUrl: true, instagramUrl: true,
        },
      }),
      prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        select: { status: true, progress: true },
      }),
    ]);

    const coursesCompleted = enrollments.filter((e) => e.status === "completed" || e.progress >= 100).length;
    const coursesInProgress = enrollments.filter((e) => e.status !== "completed" && e.progress < 100).length;

    return NextResponse.json({
      fullName: user?.name || "Usuario",
      email: user?.email || "",
      joinDate: user?.createdAt?.toISOString() ?? "",
      avatar: user?.image || null,
      phone: user?.phone || "",
      state: user?.state || "",
      city: user?.city || "",
      bio: user?.bio || "",
      website: user?.website || "",
      linkedinUrl: user?.linkedinUrl || "",
      instagramUrl: user?.instagramUrl || "",
      coursesCompleted,
      coursesInProgress,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const raw = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 422 });
    }
    const { fullName, avatar, phone, state, city, bio, website, linkedinUrl, instagramUrl } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(fullName !== undefined ? { name: fullName } : {}),
        ...(avatar !== undefined ? { image: avatar } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(state !== undefined ? { state: state || null } : {}),
        ...(city !== undefined ? { city: city || null } : {}),
        ...(bio !== undefined ? { bio: bio || null } : {}),
        ...(website !== undefined ? { website: website || null } : {}),
        ...(linkedinUrl !== undefined ? { linkedinUrl: linkedinUrl || null } : {}),
        ...(instagramUrl !== undefined ? { instagramUrl: instagramUrl || null } : {}),
      },
      select: { name: true, email: true, image: true, phone: true, state: true, city: true, bio: true, website: true, linkedinUrl: true, instagramUrl: true },
    });

    return NextResponse.json({ updated });
  } catch (error) {
    return handleApiError(error);
  }
}
