"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Save, CheckCircle2 } from "lucide-react";
import { CartaDescriptivaForm } from "./carta-descriptiva-form";
import { CartaDescriptivaDocument } from "./carta-descriptiva-document";
import {
  type CartaDescriptivaData,
  hydrateCartaDescriptiva,
  CARTA_DESCRIPTIVA_TYPE,
} from "@/lib/planning/carta-descriptiva";
import { savePlanningDocument } from "@/app/actions/planning-actions";
import { generateElementPdf, sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1500;

export function CartaDescriptivaClient({ courseId, initialData, initialStatus, prefill }: Props) {
  const [data, setData] = useState<CartaDescriptivaData>(() => hydrateCartaDescriptiva(initialData, prefill));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [completed, setCompleted] = useState(initialStatus === "completed");
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const docRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  const persist = useCallback(
    async (status: "draft" | "completed") => {
      setSaveState("saving");
      try {
        await savePlanningDocument(courseId, CARTA_DESCRIPTIVA_TYPE, dataRef.current, status);
        dirtyRef.current = false;
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        setSaveState("error");
      }
    },
    [courseId],
  );

  // Autoguardado con debounce tras cada cambio
  const handleChange = (next: CartaDescriptivaData) => {
    setData(next);
    dirtyRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persist(completed ? "completed" : "draft");
    }, AUTOSAVE_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleManualSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    persist(completed ? "completed" : "draft");
  };

  const handleToggleCompleted = () => {
    const next = !completed;
    setCompleted(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    persist(next ? "completed" : "draft");
  };

  const handleDownload = async () => {
    if (!docRef.current) return;
    setPdfError(null);
    setDownloading(true);
    try {
      const filename = `Carta-descriptiva-${sanitizeFilename(data.nombreCurso || "curso")}.pdf`;
      await generateElementPdf(docRef.current, filename);
    } catch {
      setPdfError("No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          {saveState === "saving" && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
            </span>
          )}
          {saveState === "saved" && <span className="text-green-600">Guardado</span>}
          {saveState === "error" && <span className="text-destructive">Error al guardar</span>}
          {saveState === "idle" && (
            <span className="text-muted-foreground">
              {completed ? "Documento marcado como completado" : "Borrador — se guarda automáticamente"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleManualSave} disabled={saveState === "saving"}>
            <Save className="h-4 w-4" /> Guardar
          </Button>
          <Button type="button" variant={completed ? "secondary" : "outline"} size="sm" className="gap-2" onClick={handleToggleCompleted}>
            <CheckCircle2 className="h-4 w-4" /> {completed ? "Completado" : "Marcar completado"}
          </Button>
          <Button type="button" size="sm" className="gap-2" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Descargar PDF
          </Button>
        </div>
      </div>

      {pdfError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{pdfError}</div>
      )}

      <CartaDescriptivaForm value={data} onChange={handleChange} />

      {/* Documento oculto para captura del PDF (fuera de pantalla, pero renderizado) */}
      <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0">
        <div ref={docRef}>
          <CartaDescriptivaDocument data={data} />
        </div>
      </div>
    </div>
  );
}
