import Image from "next/image";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80";

type CourseCoverImageProps = {
  imageUrl?: string | null;
  title: string;
  className?: string;
  /** Alt text for accessibility (defaults to course title) */
  alt?: string;
};

/**
 * Miniatura / portada del curso para vistas de detalle (estudiante, instructor, marketing).
 */
export function CourseCoverImage({ imageUrl, title, className, alt }: CourseCoverImageProps) {
  const src = imageUrl?.trim() || FALLBACK_COVER;
  return (
    <div
      className={`relative w-full overflow-hidden bg-muted ${className ?? "aspect-video min-h-[200px]"}`}
    >
      <Image
        src={src}
        alt={alt ?? `Portada del curso: ${title}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, min(896px, 100vw)"
        priority
      />
    </div>
  );
}
