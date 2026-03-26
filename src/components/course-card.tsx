import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { ModalityOverlayBadge } from "@/components/ui/modality-badge";
import { stripHtml } from "@/lib/utils";

export interface CourseCardProps {
  title: string;
  mode: "Virtual" | "Presencial" | "Híbrido";
  location: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt?: string;
}

export const CourseCard = ({
  title,
  mode,
  location,
  description,
  href,
  imageSrc,
  imageAlt,
}: CourseCardProps) => {
  const isPresencial = mode === "Presencial";

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 border-l-4 ${isPresencial ? "border-l-emerald-500" : "border-l-blue-500"}`}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt ?? `${title} - curso en Cursumi`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Mode badge overlay */}
        <span className="absolute top-3 left-3">
          <ModalityOverlayBadge modality={mode.toLowerCase()} />
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Location */}
        {location && location !== "Online" && (
          <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {location}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {stripHtml(description)}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Ver detalles
          </span>
          <ArrowRight className="h-4 w-4 text-primary transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};
