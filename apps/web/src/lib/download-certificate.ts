/**
 * Exporta la constancia a un PDF A4 horizontal de tamaño fijo.
 *
 * Captura el nodo [data-certificate-doc] — la copia OCULTA y SIN escalar del
 * documento (1123×794 px) — con el mismo pipeline probado de los documentos
 * de planeación (html2canvas-pro + jsPDF, con entrega vía postMessage dentro
 * del WebView de la app móvil). Así el PDF sale idéntico para todos los
 * usuarios, sin importar el tamaño de su pantalla.
 */
import { generateElementPdf, sanitizeFilename } from "@/lib/planning/generate-pdf";

export async function downloadCertificateAsPdf(info: {
  studentName: string;
  certificateNumber: string;
}): Promise<void> {
  const certEl = document.querySelector<HTMLElement>("[data-certificate-doc]");
  if (!certEl) throw new Error("No se encontró el elemento del certificado");

  await generateElementPdf(
    certEl,
    `Constancia-${sanitizeFilename(info.studentName)}-${info.certificateNumber}.pdf`,
    "landscape",
    // La constancia se imprime/comparte: captura a 3× (~288 DPI) y JPEG alta calidad
    { scale: 3, quality: 0.95 },
  );
}
