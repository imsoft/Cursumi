import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Download, FileDown } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { TEMPLATES, getTemplateDownloadUrl } from "@/lib/templates";

export function TemplatesDownloadList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantillas"
        description="Descarga plantillas para presentaciones, materiales o uso interno. Se irán añadiendo más con el tiempo."
      />
      {TEMPLATES.length === 0 ? (
        <EmptyState
          title="Sin plantillas"
          description="Aún no hay plantillas disponibles."
          icon={FileDown}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <Card key={template.id} className="flex flex-col border border-border bg-card/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Button asChild variant="default" className="w-full">
                  <a
                    href={getTemplateDownloadUrl(template.filename)}
                    download={template.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
