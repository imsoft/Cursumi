"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
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
}: UserAvatarUploadProps) {
  const router = useRouter();
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

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <Avatar className={`${sizeClass} text-2xl`}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL externa o data URL
            <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
              {initials}
            </div>
          )}
        </Avatar>
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
        </label>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <span className="text-xs font-medium text-white">Subiendo...</span>
          </div>
        )}
      </div>
      {error && <p className="max-w-xs text-center text-xs text-destructive">{error}</p>}
      {showHint && (
        <p className="text-center text-xs text-muted-foreground">Clic o pasa el ratón para cambiar foto</p>
      )}
    </div>
  );
}
