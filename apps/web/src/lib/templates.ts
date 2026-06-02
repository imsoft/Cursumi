/**
 * Plantillas descargables para instructores y administradores.
 * Los archivos deben existir en public/templates/
 */
export type TemplateItem = {
  id: string;
  name: string;
  description: string;
  /** Nombre del archivo en public/templates/ (ej. cursumi_presentation.pptx) */
  filename: string;
};

export const TEMPLATES: TemplateItem[] = [
  {
    id: "presentation",
    name: "Presentación Cursumi",
    description: "Plantilla de PowerPoint para presentar tus cursos o la plataforma Cursumi.",
    filename: "cursumi_presentation.pptx",
  },
  {
    id: "letterhead",
    name: "Membrete Cursumi",
    description: "Plantilla PDF con membrete oficial para documentos, certificados o comunicados.",
    filename: "cursumi_letterhead.pdf",
  },
];

/** URL pública para descargar una plantilla (desde public/templates/) */
export function getTemplateDownloadUrl(filename: string): string {
  return `/templates/${encodeURIComponent(filename)}`;
}
