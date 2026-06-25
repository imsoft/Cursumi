"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, type CourseCardProps } from "@/components/course-card";
import { stripHtml } from "@/lib/utils";
import type { FeaturedCourseItem } from "@/lib/public-stats";
import { EmptyState } from "@/components/shared/empty-state";

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80";

function toCardProps(course: FeaturedCourseItem): CourseCardProps {
  const mode = course.modality === "virtual" ? "virtual" : "evento";
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

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const headerVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export const FeaturedCourses = ({ courses }: FeaturedCoursesProps) => {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header row */}
        <motion.div
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          variants={headerVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
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
        </motion.div>

        {/* Grid or empty state */}
        {courses.length === 0 ? (
          <EmptyState
            title="Los cursos están llegando pronto"
            description="Explora la plataforma y sé el primero en inscribirte cuando estén disponibles."
            action={{ label: "Explorar cursos", href: "/courses" }}
          />
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {courses.map((course) => (
              <motion.div key={course.id} variants={itemVariant}>
                <CourseCard {...toCardProps(course)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
