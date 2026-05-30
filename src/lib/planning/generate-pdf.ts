/**
 * Exporta un elemento HTML a PDF A4 multipágina con html2canvas + jsPDF.
 * Se importa dinámicamente para no inflar el bundle inicial.
 *
 * Cada página (excepto la portada, que ya lleva la marca a gran tamaño) recibe
 * un pie con el logo de Cursumi, el nombre de marca y el número de página.
 */

const BRAND_PURPLE: [number, number, number] = [109, 40, 217]; // #6d28d9
const BRAND_LINE: [number, number, number] = [221, 214, 254]; // #ddd6fe
const FOOTER_MUTED: [number, number, number] = [120, 120, 120];
const LOGO_SRC = "/icons/icon-512.png";

let cachedLogo: string | null | undefined;

async function loadLogoDataUrl(): Promise<string | null> {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const res = await fetch(LOGO_SRC);
    const blob = await res.blob();
    cachedLogo = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    cachedLogo = null;
  }
  return cachedLogo;
}

export async function generateElementPdf(
  el: HTMLElement,
  filename: string,
  orientation: "portrait" | "landscape" = "portrait",
): Promise<void> {
  const [html2canvasMod, jsPDFMod, logo] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
    loadLogoDataUrl(),
  ]);

  const html2canvas = html2canvasMod.default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDFMods = jsPDFMod as any;
  const JsPDF = jsPDFMods.jsPDF ?? jsPDFMods.default?.jsPDF ?? jsPDFMods.default;
  if (!JsPDF) throw new Error("No se pudo cargar jsPDF");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const pdf = new JsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  const totalPages = Math.max(1, Math.ceil(imgH / pageH));

  /** Pie de marca: franja blanca + línea + logo + "Cursumi" + número de página. */
  const drawFooter = (pageNum: number) => {
    // La portada (página 1) ya lleva la marca a gran tamaño.
    if (pageNum === 1) return;

    const stripH = 12;
    const baseY = pageH - stripH;
    const margin = 12;

    // Franja blanca para que el pie sea legible sobre cualquier contenido.
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, baseY, pageW, stripH, "F");

    // Línea superior del pie.
    pdf.setDrawColor(...BRAND_LINE);
    pdf.setLineWidth(0.3);
    pdf.line(margin, baseY + 1.5, pageW - margin, baseY + 1.5);

    const textY = baseY + 7.5;

    // Logo + wordmark (izquierda).
    let leftX = margin;
    if (logo) {
      pdf.addImage(logo, "PNG", leftX, baseY + 3.5, 5, 5);
      leftX += 6.5;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_PURPLE);
    pdf.text("Cursumi", leftX, textY);

    // Número de página (derecha).
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...FOOTER_MUTED);
    pdf.text(`Página ${pageNum} de ${totalPages}`, pageW - margin, textY, { align: "right" });
  };

  let heightLeft = imgH;
  let position = 0;
  let pageNum = 1;

  pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
  drawFooter(pageNum);
  heightLeft -= pageH;

  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pageNum += 1;
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
    drawFooter(pageNum);
    heightLeft -= pageH;
  }

  pdf.save(filename);
}

export function sanitizeFilename(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "documento";
}
