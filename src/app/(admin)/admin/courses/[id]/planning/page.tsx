import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getCoursePlanningForAdmin } from "@/app/actions/planning-actions";
import { getPlanningDocMeta } from "@/lib/planning/registry";
import { CARTA_DESCRIPTIVA_TYPE } from "@/lib/planning/carta-descriptiva";
import { AdminCartaDescriptivaView } from "@/components/admin/admin-planning-view";

export default async function AdminCoursePlanningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { courseTitle, instructorName, docs } = await getCoursePlanningForAdmin(id).catch(() => ({
    courseTitle: "Curso",
    instructorName: "",
    docs: [] as { type: string; data: unknown; status: string; updatedAt: Date }[],
  }));

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/courses">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a cursos
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Planeación didáctica</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {courseTitle}
          {instructorName ? ` — por ${instructorName}` : ""}
        </p>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          title="Sin documentos de planeación"
          description="El instructor aún no ha llenado ningún documento de certificación para este curso."
          icon={FileText}
        />
      ) : (
        <div className="space-y-8">
          {docs.map((doc) => {
            const meta = getPlanningDocMeta(doc.type);
            return (
              <Card key={doc.type} className="border border-border bg-card/90">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{meta?.title ?? doc.type}</h2>
                      <p className="text-xs text-muted-foreground">
                        {doc.status === "completed" ? "Completado" : "Borrador"} · actualizado{" "}
                        {new Date(doc.updatedAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  {doc.type === CARTA_DESCRIPTIVA_TYPE ? (
                    <AdminCartaDescriptivaView data={doc.data} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Vista previa no disponible para este tipo de documento todavía.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
