"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { CartaDescriptivaDocument } from "@/components/instructor/planning/carta-descriptiva-document";
import { ListaVerificacionDocument } from "@/components/instructor/planning/lista-verificacion-document";
import { ListaAsistenciaDocument } from "@/components/instructor/planning/lista-asistencia-document";
import { ContratoAprendizajeDocument } from "@/components/instructor/planning/contrato-aprendizaje-document";
import { EvaluacionQuizDocument } from "@/components/instructor/planning/evaluacion-quiz-document";
import { EvaluacionCalidadDocument } from "@/components/instructor/planning/evaluacion-calidad-document";
import { HojaRespuestasDocument } from "@/components/instructor/planning/hoja-respuestas-document";
import { GuiaActividadesDocument } from "@/components/instructor/planning/guia-actividades-document";
import { ManualParticipanteDocument } from "@/components/instructor/planning/manual-participante-document";
import { hydrateEvaluacionCalidad, EVALUACION_CALIDAD_TYPE } from "@/lib/planning/evaluacion-calidad";
import { hydrateHojaRespuestas, HOJA_RESPUESTAS_TYPE } from "@/lib/planning/hoja-respuestas";
import { hydrateGuiaActividades, GUIA_ACTIVIDADES_TYPE } from "@/lib/planning/guia-actividades";
import { hydrateManualParticipante, MANUAL_PARTICIPANTE_TYPE } from "@/lib/planning/manual-participante";
import { hydrateCartaDescriptiva, CARTA_DESCRIPTIVA_TYPE } from "@/lib/planning/carta-descriptiva";
import { hydrateListaVerificacion, LISTA_VERIFICACION_TYPE } from "@/lib/planning/lista-verificacion";
import { hydrateListaAsistencia, LISTA_ASISTENCIA_TYPE } from "@/lib/planning/lista-asistencia";
import { hydrateContratoAprendizaje, CONTRATO_APRENDIZAJE_TYPE } from "@/lib/planning/contrato-aprendizaje";
import {
  hydrateEvaluacionQuiz,
  EVALUACION_QUIZ_TYPES,
  EVALUACION_TITULO,
  EVALUACION_CUESTIONARIO_TITULO,
} from "@/lib/planning/evaluacion-quiz";
import { generateElementPdf, sanitizeFilename } from "@/lib/planning/generate-pdf";

function renderByType(type: string, data: unknown): { node: ReactNode; filename: string } | null {
  if (type === CARTA_DESCRIPTIVA_TYPE) {
    const d = hydrateCartaDescriptiva(data);
    return { node: <CartaDescriptivaDocument data={d} />, filename: `Carta-descriptiva-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  if (type === LISTA_VERIFICACION_TYPE) {
    const d = hydrateListaVerificacion(data);
    return { node: <ListaVerificacionDocument data={d} />, filename: `Lista-verificacion-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  if (type === LISTA_ASISTENCIA_TYPE) {
    const d = hydrateListaAsistencia(data);
    return { node: <ListaAsistenciaDocument data={d} />, filename: `Lista-asistencia-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  if (type === CONTRATO_APRENDIZAJE_TYPE) {
    const d = hydrateContratoAprendizaje(data);
    return { node: <ContratoAprendizajeDocument data={d} />, filename: `Contrato-aprendizaje-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  if (EVALUACION_QUIZ_TYPES.includes(type)) {
    const documentTitle = EVALUACION_TITULO[type] ?? "Evaluación";
    const fallbackCuestionario = EVALUACION_CUESTIONARIO_TITULO[type] ?? documentTitle;
    const d = hydrateEvaluacionQuiz(data, fallbackCuestionario);
    return {
      node: (
        <EvaluacionQuizDocument documentTitle={documentTitle} fallbackCuestionarioTitulo={fallbackCuestionario} data={d} />
      ),
      filename: `${sanitizeFilename(documentTitle)}-${sanitizeFilename(d.nombreCurso || "curso")}.pdf`,
    };
  }
  if (type === EVALUACION_CALIDAD_TYPE) {
    const d = hydrateEvaluacionCalidad(data);
    return { node: <EvaluacionCalidadDocument data={d} />, filename: `Evaluacion-de-calidad-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  if (type === HOJA_RESPUESTAS_TYPE) {
    const d = hydrateHojaRespuestas(data);
    return { node: <HojaRespuestasDocument data={d} />, filename: `Hoja-de-respuestas-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  if (type === GUIA_ACTIVIDADES_TYPE) {
    const d = hydrateGuiaActividades(data);
    return { node: <GuiaActividadesDocument data={d} />, filename: `Guia-de-actividades-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  if (type === MANUAL_PARTICIPANTE_TYPE) {
    const d = hydrateManualParticipante(data);
    return { node: <ManualParticipanteDocument data={d} />, filename: `Manual-del-participante-${sanitizeFilename(d.nombreCurso || "curso")}.pdf` };
  }
  return null;
}

export function AdminPlanningDocView({ type, data }: { type: string; data: unknown }) {
  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const rendered = renderByType(type, data);

  if (!rendered) {
    return (
      <p className="text-sm text-muted-foreground">
        Vista previa no disponible para este tipo de documento todavía.
      </p>
    );
  }

  const handleDownload = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      await generateElementPdf(docRef.current, rendered.filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Descargar PDF
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-white p-4">
        <div ref={docRef} className="mx-auto">
          {rendered.node}
        </div>
      </div>
    </div>
  );
}
