import { CourseCard, type CourseCardProps } from "@/components/course-card";
import type { FeaturedCourseItem } from "@/lib/public-stats";

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80";

function toCardProps(course: FeaturedCourseItem): CourseCardProps {
  const mode: "Virtual" | "Presencial" | "Híbrido" =
    course.modality === "virtual" ? "Virtual" : "Presencial";
  const location = course.city?.trim() ? course.city : "Online";
  return {
    title: course.title,
    mode,
    location,
    description: course.description.slice(0, 160) + (course.description.length > 160 ? "…" : ""),
    href: `/courses/${course.id}`,
    imageSrc: course.imageUrl ?? DEFAULT_COURSE_IMAGE,
    imageAlt: `${course.title} - curso en Cursumi`,
  };
}

interface FeaturedCoursesProps {
  courses: FeaturedCourseItem[];
}

export const FeaturedCourses = ({ courses }: FeaturedCoursesProps) => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Cursos destacados
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Formación para perfiles ambiciosos
        </h2>
      </div>
      {courses.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
          Próximamente habrá cursos publicados. Explora la plataforma en la sección Cursos.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} {...toCardProps(course)} />
          ))}
        </div>
      )}
    </section>
  );
};
