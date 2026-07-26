import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";
import { recordAuditLog } from "@/lib/audit-log";
import { GOVERNANCE_DOC_SLUG, parseContent, contentStats } from "@/lib/governance";
import { requireGovernanceOwner } from "@/lib/governance-service";

const bodySchema = z.object({
  changeNote: z.string().max(500).optional(),
});

/**
 * Publica una versión nueva: congela el contenido actual como instantánea
 * inmutable y sube el número de versión. Las firmas de versiones anteriores
 * quedan en el historial, pero la versión nueva empieza SIN firmas: el CEO y
 * el CFO deben volver a aceptar.
 */
export async function POST(req: NextRequest) {
  try {
    const access = await requireGovernanceOwner();
    const { changeNote } = bodySchema.parse(await req.json().catch(() => ({})));

    const doc = await prisma.governanceDocument.findUnique({
      where: { slug: GOVERNANCE_DOC_SLUG },
    });
    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    const content = parseContent(doc.content);
    const { answered } = contentStats(content);
    if (answered === 0) {
      return NextResponse.json(
        { error: "Escribe al menos un acuerdo antes de publicar" },
        { status: 400 },
      );
    }

    const nextVersion = doc.version + 1;

    // Congelamos el contenido y subimos la versión en una sola transacción para
    // que nunca queden desincronizados.
    const [version] = await prisma.$transaction([
      prisma.governanceVersion.create({
        data: {
          documentId: doc.id,
          version: nextVersion,
          content: content as object,
          publishedBy: access.userId,
          changeNote: changeNote?.trim() || null,
        },
      }),
      prisma.governanceDocument.update({
        where: { id: doc.id },
        data: { version: nextVersion },
      }),
    ]);

    await recordAuditLog({
      actorId: access.userId,
      actorEmail: access.email,
      action: "governance.publish",
      targetType: "governance_version",
      targetId: version.id,
      metadata: { version: nextVersion, changeNote: changeNote ?? null },
      req,
    });

    return NextResponse.json({ ok: true, version: nextVersion });
  } catch (error) {
    return handleApiError(error);
  }
}
