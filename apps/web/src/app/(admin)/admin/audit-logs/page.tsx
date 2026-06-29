import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateLongMX } from "@/lib/date-format";

export const dynamic = "force-dynamic";

// Etiquetas legibles para cada acción registrada.
const ACTION_LABELS: Record<string, string> = {
  "user.role_change": "Cambio de rol",
  "instructor_application.approve": "Instructor aprobado",
  "instructor_application.reject": "Instructor rechazado",
  "course.disable": "Curso deshabilitado",
  "course.enable": "Curso habilitado",
  "platform_fee.change": "Cambio de comisión",
  "review.delete": "Reseña eliminada",
};

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs de auditoría"
        description="Registro de las acciones sensibles realizadas por administradores (últimas 200)."
      />

      <Card>
        <CardHeader>
          <CardTitle>Acciones ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay acciones registradas.</p>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{ACTION_LABELS[log.action] ?? log.action}</Badge>
                      {log.targetType && (
                        <span className="text-xs text-muted-foreground">
                          {log.targetType}
                          {log.targetId ? `: ${log.targetId}` : ""}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground">
                      {log.actorEmail ?? log.actorId}
                      {log.ip ? <span className="text-xs text-muted-foreground"> · {log.ip}</span> : null}
                    </p>
                    {log.metadata != null && (
                      <pre className="mt-1 max-w-full overflow-x-auto rounded bg-muted/40 p-2 text-xs text-muted-foreground">
                        {JSON.stringify(log.metadata)}
                      </pre>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateLongMX(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
