import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";
import { recordAuditLog } from "@/lib/audit-log";
import { GOVERNANCE_DOC_SLUG, parseContent } from "@/lib/governance";
import { requireGovernanceOwner } from "@/lib/governance-service";

const questionSchema = z.object({
  id: z.string().min(1),
  q: z.string().min(1),
  note: z.string().optional(),
  answer: z.string().max(5000),
});

const bodySchema = z.object({
  intro: z.string().max(5000),
  sections: z
    .array(
      z.object({
        id: z.string().min(1),
        tag: z.string().min(1),
        title: z.string().min(1),
        questions: z.array(questionSchema),
      }),
    )
    .max(50),
});

/** Guarda el borrador del documento. Solo la cuenta principal. */
export async function PATCH(req: NextRequest) {
  try {
    const access = await requireGovernanceOwner();
    const parsed = bodySchema.parse(await req.json());

    const doc = await prisma.governanceDocument.findUnique({
      where: { slug: GOVERNANCE_DOC_SLUG },
      select: { id: true },
    });
    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    const updated = await prisma.governanceDocument.update({
      where: { id: doc.id },
      data: { content: parsed as object },
      select: { id: true, updatedAt: true, content: true },
    });

    await recordAuditLog({
      actorId: access.userId,
      actorEmail: access.email,
      action: "governance.draft_save",
      targetType: "governance_document",
      targetId: updated.id,
      req,
    });

    return NextResponse.json({
      ok: true,
      updatedAt: updated.updatedAt,
      content: parseContent(updated.content),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
