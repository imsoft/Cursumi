import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";
import { recordAuditLog } from "@/lib/audit-log";
import { getClientIp } from "@/lib/rate-limit";
import { GOVERNANCE_DOC_SLUG } from "@/lib/governance";
import { requireGovernanceAccess } from "@/lib/governance-service";

const bodySchema = z.object({
  /** Versión que el firmante tenía en pantalla (evita firmar algo que ya cambió). */
  versionId: z.string().min(1),
  /** Nombre completo tecleado como firma electrónica. */
  fullName: z.string().trim().min(5).max(120),
});

/** Registra la aceptación de la versión vigente por parte de un firmante. */
export async function POST(req: NextRequest) {
  try {
    const access = await requireGovernanceAccess();

    if (!access.signatory.mustSign) {
      return NextResponse.json(
        { error: "La cuenta principal publica el documento, no lo firma" },
        { status: 403 },
      );
    }

    const { versionId, fullName } = bodySchema.parse(await req.json());

    const doc = await prisma.governanceDocument.findUnique({
      where: { slug: GOVERNANCE_DOC_SLUG },
      select: { id: true, version: true },
    });
    if (!doc || doc.version === 0) {
      return NextResponse.json(
        { error: "Todavía no hay una versión publicada" },
        { status: 400 },
      );
    }

    const version = await prisma.governanceVersion.findUnique({
      where: { id: versionId },
      select: { id: true, documentId: true, version: true },
    });

    // Solo se firma la versión vigente del documento correcto.
    if (!version || version.documentId !== doc.id) {
      return NextResponse.json({ error: "Versión no encontrada" }, { status: 404 });
    }
    if (version.version !== doc.version) {
      return NextResponse.json(
        {
          error:
            "El documento cambió mientras lo revisabas. Recarga la página para leer y firmar la versión vigente.",
        },
        { status: 409 },
      );
    }

    const existing = await prisma.governanceAcceptance.findUnique({
      where: { versionId_userId: { versionId: version.id, userId: access.userId } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, alreadyAccepted: true });
    }

    const acceptance = await prisma.governanceAcceptance.create({
      data: {
        versionId: version.id,
        userId: access.userId,
        email: access.email,
        role: access.signatory.role,
        fullName,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      },
    });

    await recordAuditLog({
      actorId: access.userId,
      actorEmail: access.email,
      action: "governance.accept",
      targetType: "governance_version",
      targetId: version.id,
      metadata: { version: version.version, role: access.signatory.role, fullName },
      req,
    });

    return NextResponse.json({ ok: true, acceptedAt: acceptance.acceptedAt });
  } catch (error) {
    return handleApiError(error);
  }
}
