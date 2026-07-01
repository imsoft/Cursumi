"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { getPlanningDocsByModality, type CourseModality } from "@/lib/planning/registry";
import type { Modality } from "@/lib/modality";
import { normalizeModality } from "@/lib/modality";

/**
 * Aviso informativo que se muestra al inicio de la creación del curso:
 * lista los documentos de planeación didáctica que el instructor deberá completar
 * (requisito para publicar). No bloquea; solo informa por adelantado.
 */
export function PlanningRequirementsNotice({ modality }: { modality: Modality }) {
  const [open, setOpen] = useState(true);

  const normalized = normalizeModality(modality);
  if (normalized !== "evento" && normalized !== "virtual") return null;

  const docs = getPlanningDocsByModality(normalized as CourseModality);
  const available = docs.filter((d) => d.available);
  const upcoming = docs.filter((d) => !d.available);

  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardContent className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Antes de publicar: tu planeación didáctica
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Para publicar este curso deberás completar{" "}
                <span className="font-medium text-foreground">{available.length} documentos</span>{" "}
                de planeación. Los llenarás desde el curso una vez guardado — muchos campos se
                autocompletan con la información que captures aquí.
              </p>
            </div>
          </div>
          <span className="mt-1 shrink-0 text-muted-foreground">
            {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </button>

        {open && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <ol className="space-y-1.5">
              {available.map((doc, index) => (
                <li key={doc.type} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-foreground">{doc.title}</span>
                    {doc.description && (
                      <span className="text-muted-foreground"> — {doc.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {upcoming.length > 0 && (
              <div className="pt-2">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Próximamente (aún no requeridos)
                </p>
                <ul className="space-y-1">
                  {upcoming.map((doc) => (
                    <li key={doc.type} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Circle className="h-3.5 w-3.5 shrink-0" />
                      {doc.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
              Podrás guardar el curso como borrador y completar la planeación cuando quieras.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
