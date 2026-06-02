/**
 * Redimensiona y comprime una imagen en el navegador (JPEG) para subirla como avatar u otros usos.
 */
export function compressImageToJpegFile(
  file: File,
  maxWidth = 800,
  quality = 0.82,
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selecciona un archivo de imagen"));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("No se pudo generar la vista previa"));
              return;
            }
            resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality,
        );
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Error al comprimir la imagen"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}
