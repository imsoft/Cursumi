import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseDetailForUser } from "@/app/actions/course-actions";
import { getPlanningDocument, getPlanningPrefill } from "@/app/actions/planning-actions";
import { getPlanningDocMeta } from "@/lib/planning/registry";
import { CARTA_DESCRIPTIVA_TYPE } from "@/lib/planning/carta-descriptiva";
import { LISTA_VERIFICACION_TYPE } from "@/lib/planning/lista-verificacion";
import { LISTA_ASISTENCIA_TYPE } from "@/lib/planning/lista-asistencia";
import { CONTRATO_APRENDIZAJE_TYPE } from "@/lib/planning/contrato-aprendizaje";
import { EVALUACION_QUIZ_TYPES } from "@/lib/planning/evaluacion-quiz";
import { EVALUACION_CALIDAD_TYPE } from "@/lib/planning/evaluacion-calidad";
import { HOJA_RESPUESTAS_TYPE } from "@/lib/planning/hoja-respuestas";
import { CartaDescriptivaClient } from "@/components/instructor/planning/carta-descriptiva-client";
import { ListaVerificacionClient } from "@/components/instructor/planning/lista-verificacion-client";
import { ListaAsistenciaClient } from "@/components/instructor/planning/lista-asistencia-client";
import { ContratoAprendizajeClient } from "@/components/instructor/planning/contrato-aprendizaje-client";
import { EvaluacionQuizClient } from "@/components/instructor/planning/evaluacion-quiz-client";
import { EvaluacionCalidadClient } from "@/components/instructor/planning/evaluacion-calidad-client";
import { HojaRespuestasClient } from "@/components/instructor/planning/hoja-respuestas-client";

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

  if (course.modality !== "presencial") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        La planeación didáctica solo está disponible para cursos presenciales.
      </div>
    );
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

  const [doc, prefill] = await Promise.all([
    getPlanningDocument(id, type).catch(() => null),
    getPlanningPrefill(id).catch(() => undefined),
  ]);

  return (
    <div className="space-y-6">
      {Header}
      {type === CARTA_DESCRIPTIVA_TYPE && (
        <CartaDescriptivaClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === LISTA_VERIFICACION_TYPE && (
        <ListaVerificacionClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === LISTA_ASISTENCIA_TYPE && (
        <ListaAsistenciaClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === CONTRATO_APRENDIZAJE_TYPE && (
        <ContratoAprendizajeClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {EVALUACION_QUIZ_TYPES.includes(type) && (
        <EvaluacionQuizClient courseId={id} type={type} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === EVALUACION_CALIDAD_TYPE && (
        <EvaluacionCalidadClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === HOJA_RESPUESTAS_TYPE && (
        <HojaRespuestasClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
    </div>
  );
}
