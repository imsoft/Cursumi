/**
 * Captura el elemento [data-certificate] con html2canvas (WYSIWYG)
 * y lo exporta como PDF A4 apaisado con jsPDF.
 *
 * Se usa dinámicamente (import()) para no inflar el bundle inicial.
 */
export async function downloadCertificateAsPdf(info: {
  studentName: string;
  certificateNumber: string;
}): Promise<void> {
  const certEl = document.querySelector<HTMLElement>("[data-certificate]");
  if (!certEl) throw new Error("No se encontró el elemento del certificado");

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(certEl, {
    scale: 2,          // 2× resolución para salida nítida
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    onclone(clonedDoc) {
      // Forzar tema claro en el clon (sin afectar la página real)
      clonedDoc.documentElement.classList.remove("dark");

      const el = clonedDoc.querySelector<HTMLElement>("[data-certificate]");
      if (!el) return;

      // Sobreescribir variables CSS con valores del tema claro
      const vars: Record<string, string> = {
        "--background":        "oklch(1 0 0)",
        "--foreground":        "oklch(0.141 0.005 285.823)",
        "--card":              "oklch(1 0 0)",
        "--card-foreground":   "oklch(0.141 0.005 285.823)",
        "--primary":           "oklch(0.541 0.281 293.009)",
        "--primary-foreground":"oklch(0.969 0.016 293.756)",
        "--muted":             "oklch(0.967 0.001 286.375)",
        "--muted-foreground":  "oklch(0.552 0.016 285.938)",
        "--border":            "oklch(0.92 0.004 286.32)",
      };
      for (const [k, v] of Object.entries(vars)) {
        el.style.setProperty(k, v);
      }
      // Forzar color de texto explícitamente (html2canvas lee el computed value)
      el.style.color = "oklch(0.141 0.005 285.823)";
      el.style.background = "linear-gradient(to bottom right, #ffffff, #f3f0ff)";
    },
  });

  // Dimensiones del canvas en CSS px (canvas está a 2×)
  const cssW = canvas.width / 2;
  const cssH = canvas.height / 2;

  const pdf = new jsPDF({
    orientation: cssW >= cssH ? "landscape" : "portrait",
    unit: "px",
    format: [cssW, cssH],
    hotfixes: ["px_scaling"],
  });

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, cssW, cssH);

  const safe = (s: string) => s.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "").trim().replace(/\s+/g, "-");
  pdf.save(`Constancia-${safe(info.studentName)}-${info.certificateNumber}.pdf`);
}
