import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, type CourseCardProps } from "@/components/course-card";
import { stripHtml } from "@/lib/utils";
import type { FeaturedCourseItem } from "@/lib/public-stats";

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80";

function toCardProps(course: FeaturedCourseItem): CourseCardProps {
  const mode: "Virtual" | "Presencial" | "En vivo" =
    course.modality === "virtual" ? "Virtual" : course.modality === "live" ? "En vivo" : "Presencial";
  const location = course.city?.trim() ? course.city : "Online";
  return {
    title: course.title,
    mode,
    location,
    description: (() => {
      const plain = stripHtml(course.description);
      return plain.length > 160 ? plain.slice(0, 160) + "…" : plain;
    })(),
    href: `/courses/${course.slug || course.id}`,
    imageSrc: course.imageUrl ?? DEFAULT_COURSE_IMAGE,
    imageAlt: `${course.title} - curso en Cursumi`,
  };
}

interface FeaturedCoursesProps {
  courses: FeaturedCourseItem[];
}

export const FeaturedCourses = ({ courses }: FeaturedCoursesProps) => {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header row */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Cursos destacados
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              Formación para perfiles ambiciosos
            </h2>
          </div>
          <Link href="/courses" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2">
              Ver todos los cursos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Grid or empty state */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-border bg-card/60 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
              <BookOpen className="h-8 w-8 text-primary/40" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Los cursos están llegando pronto
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Explora la plataforma y sé el primero en inscribirte cuando
                estén disponibles.
              </p>
            </div>
            <Link href="/courses">
              <Button size="sm">Explorar cursos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} {...toCardProps(course)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
