"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Save, CheckCircle2, DownloadCloud } from "lucide-react";
import { savePlanningDocument } from "@/app/actions/planning-actions";
import { generateElementPdf } from "@/lib/planning/generate-pdf";
import { deepFillEmpty } from "@/lib/planning/prefill";
import { PlanningBrandFooter } from "./planning-brand-footer";

type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1500;

type Props<T> = {
  courseId: string;
  type: string;
  initialData: unknown;
  initialStatus?: string;
  hydrate: (raw: unknown) => T;
  renderForm: (value: T, onChange: (next: T) => void) => ReactNode;
  renderDocument: (value: T) => ReactNode;
  pdfFilename: (value: T) => string;
  pdfOrientation?: "portrait" | "landscape";
  /** Genera un documento sembrado con los datos actuales del curso (para "Traer datos del curso"). */
  seedFromCourse?: () => T;
  /** Override de exportación (p. ej. presentaciones a PDF 16:9). Recibe el contenedor del documento. */
  exportPdf?: (el: HTMLElement, filename: string) => Promise<void>;
  /** El documento ya incluye su propio branding (p. ej. constancia de página fija) — no añadir el pie. */
  hideBrandFooter?: boolean;
};

/**
 * Contenedor reutilizable para los documentos de planeación: gestiona el estado,
 * autoguardado con debounce, estado "completado" y la exportación a PDF.
 */
export function PlanningDocShell<T>({
  courseId,
  type,
  initialData,
  initialStatus,
  hydrate,
  renderForm,
  renderDocument,
  pdfFilename,
  pdfOrientation = "portrait",
  exportPdf,
  seedFromCourse,
  hideBrandFooter,
}: Props<T>) {
  const [data, setData] = useState<T>(() => hydrate(initialData));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [completed, setCompleted] = useState(initialStatus === "completed");
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [confirmingImport, setConfirmingImport] = useState(false);

  const docRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef(data);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const persist = useCallback(
    async (status: "draft" | "completed") => {
      setSaveState("saving");
      try {
        await savePlanningDocument(courseId, type, dataRef.current, status);
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        setSaveState("error");
      }
    },
    [courseId, type],
  );

  const handleChange = (next: T) => {
    setData(next);
    dataRef.current = next;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persist(completed ? "completed" : "draft"), AUTOSAVE_DELAY_MS);
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

  const handleImportFromCourse = () => {
    if (!seedFromCourse) return;
    const merged = deepFillEmpty(dataRef.current, seedFromCourse());
    setData(merged);
    dataRef.current = merged;
    setConfirmingImport(false);
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
      if (exportPdf) {
        await exportPdf(docRef.current, pdfFilename(data));
      } else {
        await generateElementPdf(docRef.current, pdfFilename(data), pdfOrientation);
      }
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
          {seedFromCourse && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setConfirmingImport(true)}
            >
              <DownloadCloud className="h-4 w-4" /> Traer datos del curso
            </Button>
          )}
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

      {confirmingImport && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Se completarán solo los campos <strong>vacíos</strong> con la información actual del curso. No se sobrescribe lo que ya escribiste.
          </span>
          <div className="flex shrink-0 gap-2">
            <Button type="button" size="sm" onClick={handleImportFromCourse}>
              Rellenar campos vacíos
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setConfirmingImport(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {renderForm(data, handleChange)}

      {/* Documento oculto para captura del PDF (fuera de pantalla, pero renderizado) */}
      <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0">
        <div ref={docRef}>
          {renderDocument(data)}
          {!hideBrandFooter && <PlanningBrandFooter />}
        </div>
      </div>
    </div>
  );
}
