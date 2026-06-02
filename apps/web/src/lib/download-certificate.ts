/**
 * Captura el elemento [data-certificate] con html2canvas (WYSIWYG)
 * y lo exporta como PDF con jsPDF.
 *
 * Se importa dinámicamente para no inflar el bundle inicial.
 */
export async function downloadCertificateAsPdf(info: {
  studentName: string;
  certificateNumber: string;
}): Promise<void> {
  const certEl = document.querySelector<HTMLElement>("[data-certificate]");
  if (!certEl) throw new Error("No se encontró el elemento del certificado");

  // Importar ambas librerías en paralelo
  const [html2canvasMod, jsPDFMod] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // html2canvas exporta default en todas las versiones
  const html2canvas = html2canvasMod.default;

  // jsPDF v2/v3: default export · jsPDF v4: named export `jsPDF`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDFMods = jsPDFMod as any;
  const JsPDF =
    jsPDFMods.jsPDF ??
    jsPDFMods.default?.jsPDF ??
    jsPDFMods.default;

  if (!JsPDF) throw new Error("No se pudo cargar jsPDF");

  const canvas = await html2canvas(certEl, {
    scale: 2,        // 2× para salida nítida
    useCORS: true,
    logging: false,
    // El certificado ya usa colores fijos (sin CSS variables del tema),
    // así que solo necesitamos fondo blanco de fallback.
    backgroundColor: "#ffffff",
    onclone(clonedDoc) {
      // Forzar tema claro en el clon (por si algún hijo hereda dark)
      clonedDoc.documentElement.classList.remove("dark");
      clonedDoc.documentElement.setAttribute("data-theme", "light");

      const el = clonedDoc.querySelector<HTMLElement>("[data-certificate]");
      if (el) {
        // Garantizar fondo blanco explícito en el clon
        el.style.background = "linear-gradient(to bottom right, #ffffff, #f3f0ff)";
        el.style.color = "#0f0a1e";
      }
    },
  });

  // Dimensiones del canvas en CSS px (canvas está a 2×)
  const cssW = canvas.width / 2;
  const cssH = canvas.height / 2;

  const pdf = new JsPDF({
    orientation: cssW >= cssH ? "landscape" : "portrait",
    unit: "px",
    format: [cssW, cssH],
    hotfixes: ["px_scaling"],
  });

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, cssW, cssH);

  const safe = (s: string) =>
    s
      .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  pdf.save(`Constancia-${safe(info.studentName)}-${info.certificateNumber}.pdf`);
}
