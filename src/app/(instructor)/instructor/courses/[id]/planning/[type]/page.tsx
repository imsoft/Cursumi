import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseDetailForUser } from "@/app/actions/course-actions";
import { getPlanningDocument, getPlanningPrefill } from "@/app/actions/planning-actions";
import { getPlanningDocMeta } from "@/lib/planning/registry";
import { CARTA_DESCRIPTIVA_TYPE } from "@/lib/planning/carta-descriptiva";
import { CartaDescriptivaClient } from "@/components/instructor/planning/carta-descriptiva-client";

export default async function PlanningDocumentPage({
  params,
}: {
  params: Promise<{ id: string; type: string }>;
}) {
  const { id, type } = await params;
  const course = await getCourseDetailForUser(id).catch(() => null);
  const meta = getPlanningDocMeta(type);

  if (!course || !meta) {
    return <div className="p-8 text-center text-muted-foreground">Documento no encontrado.</div>;
  }

  const Header = (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/instructor/courses/${id}/planning`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a planeación
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
      </div>
    </div>
  );

  if (!meta.available) {
    return (
      <div className="space-y-6">
        {Header}
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Este documento estará disponible próximamente.
        </div>
      </div>
    );
  }

  // Carta descriptiva (único documento disponible por ahora)
  const [doc, prefill] = await Promise.all([
    getPlanningDocument(id, CARTA_DESCRIPTIVA_TYPE).catch(() => null),
    getPlanningPrefill(id).catch(() => undefined),
  ]);

  return (
    <div className="space-y-6">
      {Header}
      <CartaDescriptivaClient
        courseId={id}
        initialData={doc?.data ?? null}
        initialStatus={doc?.status}
        prefill={prefill}
      />
    </div>
  );
}
