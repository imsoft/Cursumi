"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { uploadAttachmentDirect } from "@/lib/upload-cloudinary-attachment";

interface Material {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/business/materials")
      .then((r) => r.json())
      .then((d) => setMaterials(d.materials || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !name.trim()) return;

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`El archivo supera ${maxBytes / (1024 * 1024)} MB`);
      return;
    }

    setUploading(true);
    try {
      const { url: fileUrl } = await uploadAttachmentDirect(
        file,
        "cursumi/materials",
      );

      const res = await fetch("/api/business/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          fileUrl,
          fileType: file.type.split("/")[1] || file.name.split(".").pop() || "pdf",
          fileSize: file.size,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMaterials((prev) => [data.material, ...prev]);
        setName("");
        setShowForm(false);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        alert(typeof data.error === "string" ? data.error : "No se pudo guardar el material");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo subir el archivo");
    } finally {
      setUploading(false);
    }
  }

  async function deleteMaterial(id: string) {
    if (!confirm("¿Eliminar este material?")) return;
    const res = await fetch(`/api/business/materials/${id}`, { method: "DELETE" });
    if (res.ok) setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Materiales" description="Sube documentos y PDFs para tu equipo" />

      <div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Upload className="h-4 w-4" />
          Subir material
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <Input
                label="Nombre del material"
                placeholder="Ej: Manual de onboarding"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-md"
              />
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                className="text-sm"
              />
              <Button type="submit" disabled={uploading} className="w-fit gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  "Subir"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay materiales aún. Sube PDFs o documentos para tu equipo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{m.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {m.fileType.toUpperCase()}
                      {m.fileSize ? ` · ${formatBytes(m.fileSize)}` : ""}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </Button>
                </a>
                <Button variant="ghost" size="sm" onClick={() => deleteMaterial(m.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
