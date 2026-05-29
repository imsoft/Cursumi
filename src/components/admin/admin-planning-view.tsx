"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { CartaDescriptivaDocument } from "@/components/instructor/planning/carta-descriptiva-document";
import { hydrateCartaDescriptiva } from "@/lib/planning/carta-descriptiva";
import { generateElementPdf, sanitizeFilename } from "@/lib/planning/generate-pdf";

export function AdminCartaDescriptivaView({ data }: { data: unknown }) {
  const hydrated = hydrateCartaDescriptiva(data);
  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      await generateElementPdf(docRef.current, `Carta-descriptiva-${sanitizeFilename(hydrated.nombreCurso || "curso")}.pdf`);
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
          <CartaDescriptivaDocument data={hydrated} />
        </div>
      </div>
    </div>
  );
}
