import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Course } from "./types";
import { ModalityOverlayBadge } from "@/components/ui/modality-badge";
import { stripHtml } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  priority?: boolean;
}

export const CourseCard = ({ course, priority }: CourseCardProps) => {
  const isPresencial = course.modality === "presencial";

  return (
    <Link
      href={`/courses/${course.slug || course.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 border-l-4 ${isPresencial ? "border-l-emerald-500" : "border-l-blue-500"}`}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={course.imageUrl}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        {/* Modality badge */}
        <span className="absolute top-3 left-3">
          <ModalityOverlayBadge modality={course.modality} />
        </span>
        {/* Category badge */}
        <span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Location */}
        {course.city && course.city !== "Online" && (
          <div className="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {course.city}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {stripHtml(course.description)}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          {course.duration ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {course.duration}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            Ver detalles
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
