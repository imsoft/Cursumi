import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";

/**
 * Registra una acción sensible (típicamente de admin) en el log de auditoría.
 *
 * Es "fire-and-forget" defensivo: NUNCA lanza ni rompe la acción principal. Si
 * el insert falla, solo se loguea el error. Llamar DESPUÉS de que la acción se
 * complete con éxito.
 *
 * Convención de `action`: "<recurso>.<verbo>", p. ej. "user.role_change",
 * "course.disable", "coupon.delete", "instructor_application.review".
 */
export async function recordAuditLog(params: {
  actorId: string;
  actorEmail?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  /** Request para derivar la IP; o pasar `ip` directamente. */
  req?: NextRequest;
  ip?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        metadata: (params.metadata ?? undefined) as object | undefined,
        ip: params.ip ?? (params.req ? getClientIp(params.req) : null),
      },
    });
  } catch (error) {
    console.error("[audit-log] No se pudo registrar la acción:", params.action, error);
  }
}
