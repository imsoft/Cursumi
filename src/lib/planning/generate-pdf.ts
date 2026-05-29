/**
 * Exporta un elemento HTML a PDF A4 multipágina con html2canvas + jsPDF.
 * Se importa dinámicamente para no inflar el bundle inicial.
 */
export async function generateElementPdf(el: HTMLElement, filename: string): Promise<void> {
  const [html2canvasMod, jsPDFMod] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
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

  const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgH;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
  heightLeft -= pageH;

  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
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
