"use client";

import { useCallback, useState } from "react";

interface UseImageUploadOptions {
  endpoint?: string;
  maxSizeMB?: number;
  /** ID del curso — cuando se proporciona se envía junto al archivo para organizar en Cloudinary */
  courseId?: string;
  onSuccess?: (url: string) => void;
  onError?: (message: string) => void;
}

export function useImageUpload({
  endpoint = "/api/upload/course-cover",
  maxSizeMB = 10,
  courseId,
  onSuccess,
  onError,
}: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        onError?.("El archivo debe ser una imagen");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        onError?.(`La imagen es demasiado grande (máx. ${maxSizeMB} MB)`);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (courseId) formData.append("courseId", courseId);

        const res = await fetch(endpoint, { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al subir la imagen");
        onSuccess?.(data.url);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Error al subir la imagen");
      } finally {
        setUploading(false);
      }
    },
    [endpoint, maxSizeMB, courseId, onSuccess, onError],
  );

  return { upload, uploading };
}
