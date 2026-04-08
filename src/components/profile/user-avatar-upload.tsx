"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { ProfilePhotoImg } from "@/components/ui/profile-photo-img";
import { Camera } from "lucide-react";
import { compressImageToJpegFile } from "@/lib/browser-image";

type UserAvatarUploadProps = {
  name: string;
  avatarUrl: string | null;
  onUploaded?: (url: string) => void;
  /** Tamaño del círculo en px (clases Tailwind h-24 w-24 = 96) */
  sizeClass?: string;
  /** Texto de ayuda bajo el avatar (por defecto visible) */
  showHint?: boolean;
  /**
   * `row`: solo el círculo (centrado vertical junto a texto en filas).
   * `stacked`: columna centrada (perfil estudiante).
   */
  layout?: "stacked" | "row";
};

const initialsFrom = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

/**
 * Selector de foto: comprime en el cliente y sube por POST /api/me/avatar.
 */
export function UserAvatarUpload({
  name,
  avatarUrl,
  onUploaded,
  sizeClass = "h-24 w-24",
  showHint = true,
  layout = "stacked",
}: UserAvatarUploadProps) {
  const router = useRouter();
  const fileInputId = useId();
  const [avatar, setAvatar] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initials = initialsFrom(name);

  useEffect(() => {
    setAvatar(avatarUrl);
  }, [avatarUrl]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageToJpegFile(file, 800, 0.82);
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await fetch("/api/me/avatar", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "No pudimos subir la foto");
      }
      const url = body.url as string;
      setAvatar(url);
      onUploaded?.(url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const circle = (
    <div
      className={`group relative isolate shrink-0 overflow-hidden rounded-full ${sizeClass} shadow-none ring-0`}
    >
      <Avatar className="h-full w-full min-h-0 min-w-0 rounded-full text-2xl shadow-none ring-0 ring-offset-0 focus-within:ring-0">
        {avatar ? (
          <ProfilePhotoImg
            src={avatar}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
            {initials}
          </div>
        )}
      </Avatar>
      <label
        htmlFor={fileInputId}
        className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 outline-none ring-0 transition-opacity focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:opacity-100"
      >
        <Camera className="h-6 w-6 text-white" aria-hidden />
      </label>
      <input
        id={fileInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleChange}
        disabled={uploading}
      />
      {uploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-black/50">
          <span className="text-xs font-medium text-white">Subiendo...</span>
        </div>
      )}
    </div>
  );

  if (layout === "row") {
    return (
      <div className="flex shrink-0 flex-col items-center justify-center gap-1 self-center">
        {circle}
        {error && <p className="max-w-48 text-center text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {circle}
      {error && <p className="max-w-xs text-center text-xs text-destructive">{error}</p>}
      {showHint && (
        <p className="text-center text-xs text-muted-foreground">Clic o pasa el ratón para cambiar foto</p>
      )}
    </div>
  );
}
