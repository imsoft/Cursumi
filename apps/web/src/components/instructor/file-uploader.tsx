"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { CourseFile } from "./course-types";

interface FileUploaderProps {
  onUpload: (files: CourseFile[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export const FileUploader = ({
  onUpload,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getFileType = (file: File): CourseFile["type"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (
      file.type.includes("document") ||
      file.type.includes("word") ||
      file.type.includes("text")
    ) {
      return "document";
    }
    return "other";
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles: CourseFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (file.size > maxSize) {
        alert(`El archivo ${file.name} es demasiado grande. Tamaño máximo: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
        return;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: getFileType(file),
        url: URL.createObjectURL(file),
        size: file.size,
      });
    });

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:border-primary/50"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Arrastra archivos aquí o{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => fileInputRef.current?.click()}
              >
                haz clic para seleccionar
              </button>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, documentos, imágenes (máx. {(maxSize / 1024 / 1024).toFixed(0)}MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
