"use client";

import { useState } from "react";

interface AvatarProps {
  children?: React.ReactNode;
  className?: string;
  /** URL de la foto de perfil. Si carga correctamente se muestra; si falla, se usa children como fallback. */
  src?: string | null;
  /** Texto alternativo para la imagen */
  alt?: string;
}

export const Avatar = ({ children, className, src, alt }: AvatarProps) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary overflow-hidden ${className ?? "h-12 w-12"}`}
    >
      {src && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        children
      )}
    </div>
  );
};
