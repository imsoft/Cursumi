"use client";

import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLine, Upload, Trash2 } from "lucide-react";

interface SignatureUploadProps {
  signatureUrl: string | null;
  onUploaded?: (url: string | null) => void;
}

export function SignatureUpload({ signatureUrl, onUploaded }: SignatureUploadProps) {
  const fileInputId = useId();
  const [signature, setSignature] = useState<string | null>(signatureUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/me/signature", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Error al subir la firma");
      const url = body.url as string;
      setSignature(url);
      onUploaded?.(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la firma");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      const res = await fetch("/api/me/signature", { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar la firma");
      setSignature(null);
      onUploaded?.(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <PenLine className="h-4 w-4" />
          Firma digital
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Tu firma aparecerá en las constancias de los talleres. Sube una imagen con fondo transparente (PNG).
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {signature ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center rounded-lg border border-border bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signature}
                alt="Firma"
                className="max-h-20 w-auto object-contain"
              />
            </div>
            <div className="flex gap-2">
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Upload className="h-3 w-3" />
                Cambiar
              </label>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-xs text-destructive hover:text-destructive">
                <Trash2 className="mr-1 h-3 w-3" />
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={fileInputId}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {uploading ? "Subiendo..." : "Haz clic para subir tu firma"}
            </span>
            <span className="text-xs text-muted-foreground">PNG o JPG, máx. 4 MB</span>
          </label>
        )}
        <input
          id={fileInputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={handleUpload}
          disabled={uploading}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
