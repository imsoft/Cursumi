import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { authorizeCloudinaryUploader } from "@/lib/authorize-cloudinary-uploader";
import { prisma } from "@/lib/prisma";
import { resolveOrgAdmin } from "@/lib/org-service";

/**
 * Genera una firma para subida client-side a Cloudinary.
 *
 * Estructura de carpetas resultante:
 *  - cursumi/courses/{courseId}/attachments  — archivos adjuntos de lección
 *  - cursumi/courses/{courseId}/cover        — portada de curso
 *  - cursumi/orgs/{orgId}/materials          — materiales B2B
 *  - cursumi/attachments                     — fallback sin courseId
 *  - cursumi/materials                       — fallback sin orgId
 */

const BASE_FOLDERS = ["attachments", "materials", "course-covers"] as const;
type BaseFolder = (typeof BASE_FOLDERS)[number];

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} no está configurada`);
  return value;
}

async function resolveFolder(
  userId: string,
  baseFolder: string,
  courseId?: string,
): Promise<string> {
  if (baseFolder === "attachments" || baseFolder === "course-covers") {
    if (courseId) {
      // Validate the user owns the course
      const course = await prisma.course.findFirst({
        where: { id: courseId, instructorId: userId },
        select: { id: true },
      });
      if (!course) throw new Error("No autorizado para subir archivos a este curso");
      const subfolder = baseFolder === "course-covers" ? "cover" : "attachments";
      return `cursumi/courses/${courseId}/${subfolder}`;
    }
    // Fallback without courseId (e.g. new course wizard)
    return baseFolder === "course-covers" ? "cursumi/course-covers" : "cursumi/attachments";
  }

  if (baseFolder === "materials") {
    // Derive orgId server-side from the session
    try {
      const { org } = await resolveOrgAdmin(userId);
      return `cursumi/orgs/${org.id}/materials`;
    } catch {
      return "cursumi/materials";
    }
  }

  return "cursumi/uploads";
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await authorizeCloudinaryUploader(session.user.id);

    const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = requireEnv("CLOUDINARY_API_KEY");
    const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

    const body = await req.json().catch(() => ({})) as {
      folder?: string;
      courseId?: string;
    };

    const requestedBase = body.folder ?? "";
    const baseFolder: BaseFolder = (BASE_FOLDERS as readonly string[]).includes(requestedBase)
      ? (requestedBase as BaseFolder)
      : "attachments";

    const folder = await resolveFolder(session.user.id, baseFolder, body.courseId);

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    return NextResponse.json({ timestamp, signature, cloudName, apiKey, folder });
  } catch (error) {
    return handleApiError(error);
  }
}
