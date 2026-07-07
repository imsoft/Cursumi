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

type RNWebView = { postMessage: (msg: string) => void };

/**
 * Entrega el PDF ya generado. En un navegador normal dispara la descarga
 * (`pdf.save`). Dentro del WebView de la app móvil (Cursumi para iOS/Android)
 * no existe la descarga del navegador, así que enviamos el PDF en base64 al
 * código nativo por `postMessage`; la app lo guarda y abre la hoja de compartir.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deliverPdf(pdf: any, filename: string): void {
  const rn = (typeof window !== "undefined"
    ? (window as unknown as { ReactNativeWebView?: RNWebView }).ReactNativeWebView
    : undefined);

  if (rn) {
    // "data:application/pdf;filename=…;base64,XXXX" → nos quedamos con XXXX.
    const dataUri: string = pdf.output("datauristring");
    const base64 = dataUri.slice(dataUri.indexOf(",") + 1);
    rn.postMessage(JSON.stringify({ type: "planning-pdf", filename, base64 }));
    return;
  }

  pdf.save(filename);
}

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
  opts?: {
    /** Multiplicador de captura (default 2 ≈ 192 DPI en A4; 3 ≈ 288 DPI para documentos que se imprimen) */
    scale?: number;
    /** Calidad JPEG 0–1 (default 0.92) */
    quality?: number;
  },
): Promise<void> {
  const [html2canvasMod, jsPDFMod, logo] = await Promise.all([
    // html2canvas-pro: soporta colores oklch/lab/color() de Tailwind v4
    // (html2canvas clásico lanza error al parsearlos).
    import("html2canvas-pro"),
    import("jspdf"),
    loadLogoDataUrl(),
  ]);

  const html2canvas = html2canvasMod.default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDFMods = jsPDFMod as any;
  const JsPDF = jsPDFMods.jsPDF ?? jsPDFMods.default?.jsPDF ?? jsPDFMods.default;
  if (!JsPDF) throw new Error("No se pudo cargar jsPDF");

  const docContainer = el.firstElementChild as HTMLElement;
  if (!docContainer) {
    // Fallback: si no hay un contenedor estructurado, se captura el elemento entero como antes
    const canvas = await html2canvas(el, {
      scale: opts?.scale ?? 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new JsPDF({ orientation, unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", opts?.quality ?? 0.92);

    const totalPages = Math.max(1, Math.ceil((imgH - 1) / pageH));

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (pageNum > 1) pdf.addPage();
      const position = -(pageNum - 1) * pageH;
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      
      // Esquina superior izquierda: Logo
      if (logo) {
        pdf.addImage(logo, "PNG", 12, 10, 8, 8);
      }
      // Esquina inferior derecha: Paginación
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`${pageNum} de ${totalPages}`, pageW - 12, pageH - 12, { align: "right" });
    }
    deliverPdf(pdf, filename);
    return;
  }

  // Pre-medir alturas de los elementos originales en el DOM fuera de pantalla para conservar el layout
  const elementHeights = new Map<Element, number>();
  const measureHeights = (parent: HTMLElement) => {
    for (const child of Array.from(parent.children)) {
      const rect = child.getBoundingClientRect();
      elementHeights.set(child, rect.height);
      if (child.tagName === "TABLE") {
        const tbody = child.querySelector("tbody");
        if (tbody) {
          for (const row of Array.from(tbody.children)) {
            const rowRect = row.getBoundingClientRect();
            elementHeights.set(row, rowRect.height);
          }
        }
        const thead = child.querySelector("thead");
        if (thead) {
          const headRect = thead.getBoundingClientRect();
          elementHeights.set(thead, headRect.height);
        }
      }
    }
  };

  measureHeights(docContainer);

  const isLandscape = orientation === "landscape";
  const pageWpx = isLandscape ? 1123 : 794;
  const pageHpx = isLandscape ? 794 : 1123;
  const paddingTop = 90; // Margen para el logo superior izquierdo
  const paddingBottom = 60; // Margen para el pie derecho
  const paddingLeft = 40;
  const paddingRight = 40;
  const maxPageHeight = pageHpx - paddingTop - paddingBottom;

  const pages: HTMLElement[] = [];

  const createNewPage = (): HTMLElement => {
    const page = document.createElement("div");
    page.style.width = `${pageWpx}px`;
    page.style.height = `${pageHpx}px`;
    page.style.boxSizing = "border-box";
    page.style.backgroundColor = "#ffffff";
    page.style.paddingTop = `${paddingTop}px`;
    page.style.paddingBottom = `${paddingBottom}px`;
    page.style.paddingLeft = `${paddingLeft}px`;
    page.style.paddingRight = `${paddingRight}px`;
    page.style.position = "relative";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.fontFamily = "Helvetica, Arial, sans-serif";
    page.style.color = "#1f1147";
    return page;
  };

  let currentPage = createNewPage();
  let currentHeightUsed = 0;

  for (const child of Array.from(docContainer.children) as HTMLElement[]) {
    // Omitir el pie de marca antiguo si se filtrara en el árbol de hijos
    if (child.style.width === "794px" && child.textContent?.includes("Cursumi")) {
      continue;
    }

    if (child.tagName === "TABLE") {
      const tableHeight = elementHeights.get(child) || 0;
      const thead = child.querySelector("thead");
      const tbody = child.querySelector("tbody");
      const theadHeight = thead ? (elementHeights.get(thead) || 0) : 0;

      // Si la tabla entera cabe en el espacio restante de la página
      if (currentHeightUsed + tableHeight <= maxPageHeight) {
        currentPage.appendChild(child.cloneNode(true));
        currentHeightUsed += tableHeight;
      } else {
        // Dividir la tabla fila por fila
        let currentTableClone = child.cloneNode(false) as HTMLElement; // clonar estructura base de table
        if (thead) {
          currentTableClone.appendChild(thead.cloneNode(true));
        }
        let currentTbodyClone = document.createElement("tbody");
        currentTableClone.appendChild(currentTbodyClone);
        currentPage.appendChild(currentTableClone);
        currentHeightUsed += theadHeight;

        const rows = tbody ? Array.from(tbody.children) : [];
        for (const row of rows) {
          const rowHeight = elementHeights.get(row) || 0;

          // Si la fila cabe, o es la primera fila en una página en blanco (evita bucles infinitos)
          if (currentHeightUsed + rowHeight <= maxPageHeight || currentTbodyClone.children.length === 0) {
            currentTbodyClone.appendChild(row.cloneNode(true));
            currentHeightUsed += rowHeight;
          } else {
            // Mover a una nueva página
            pages.push(currentPage);
            currentPage = createNewPage();

            currentTableClone = child.cloneNode(false) as HTMLElement;
            if (thead) {
              currentTableClone.appendChild(thead.cloneNode(true));
            }
            currentTbodyClone = document.createElement("tbody");
            currentTableClone.appendChild(currentTbodyClone);
            currentPage.appendChild(currentTableClone);

            currentTbodyClone.appendChild(row.cloneNode(true));
            currentHeightUsed = theadHeight + rowHeight;
          }
        }
      }
    } else {
      const childHeight = elementHeights.get(child) || 0;
      if (currentHeightUsed + childHeight <= maxPageHeight) {
        currentPage.appendChild(child.cloneNode(true));
        currentHeightUsed += childHeight;
      } else {
        pages.push(currentPage);
        currentPage = createNewPage();
        currentPage.appendChild(child.cloneNode(true));
        currentHeightUsed = childHeight;
      }
    }
  }

  if (currentPage.children.length > 0) {
    pages.push(currentPage);
  }

  // Renderizar las páginas temporalmente en el DOM para poder capturarlas con html2canvas
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.left = "-10000px";
  tempContainer.style.top = "0";
  document.body.appendChild(tempContainer);

  const pageImages: string[] = [];

  for (const pageEl of pages) {
    tempContainer.appendChild(pageEl);
    const canvas = await html2canvas(pageEl, {
      scale: opts?.scale ?? 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/jpeg", opts?.quality ?? 0.92);
    pageImages.push(imgData);
    tempContainer.removeChild(pageEl);
  }

  // Limpiar contenedor temporal del body
  document.body.removeChild(tempContainer);

  const pdf = new JsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(pageImages[i], "JPEG", 0, 0, pageW, pageH);

    // Esquina superior izquierda: Logo de Cursumi
    if (logo) {
      pdf.addImage(logo, "PNG", 12, 10, 8, 8);
    }

    // Esquina inferior derecha: Paginación
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${i + 1} de ${totalPages}`, pageW - 12, pageH - 12, { align: "right" });
  }

  deliverPdf(pdf, filename);
}

/**
 * Exporta una presentación a PDF 16:9 (una diapositiva por página).
 * Cada elemento con [data-slide] dentro del contenedor se captura por separado
 * y ocupa una página completa widescreen (formato PowerPoint 960×540 pt).
 */
export async function generateSlidesPdf(container: HTMLElement, filename: string): Promise<void> {
  const slides = Array.from(container.querySelectorAll<HTMLElement>("[data-slide]"));
  if (slides.length === 0) return;

  const [html2canvasMod, jsPDFMod] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const html2canvas = html2canvasMod.default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDFMods = jsPDFMod as any;
  const JsPDF = jsPDFMods.jsPDF ?? jsPDFMods.default?.jsPDF ?? jsPDFMods.default;
  if (!JsPDF) throw new Error("No se pudo cargar jsPDF");

  const PAGE_W = 960; // pt — 13.333in (16:9)
  const PAGE_H = 540; // pt — 7.5in
  const pdf = new JsPDF({ orientation: "landscape", unit: "pt", format: [PAGE_W, PAGE_H] });

  for (let i = 0; i < slides.length; i++) {
    const canvas = await html2canvas(slides[i], {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "landscape");
    pdf.addImage(imgData, "PNG", 0, 0, PAGE_W, PAGE_H);
  }

  deliverPdf(pdf, filename);
}

export function sanitizeFilename(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "documento";
}
