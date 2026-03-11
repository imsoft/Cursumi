import { listPublicCourses } from "@/app/actions/course-actions";
import { CoursesPageClient } from "@/components/courses/courses-page-client";
import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Cursos disponibles | Cursumi",
  description: "Explora cursos virtuales y presenciales de programación, marketing, diseño y más.",
  alternates: { canonical: `${baseUrl}/courses` },
  openGraph: {
    title: "Cursos disponibles | Cursumi",
    description: "Explora cursos virtuales y presenciales de programación, marketing, diseño y más.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Explora cursos en Cursumi",
      },
      {
        url: "https://cursumi.com/api/og/course/preview",
        alt: "Cursos destacados en Cursumi",
      },
    ],
  },
};

export default async function CoursesPage() {
  const courses = await listPublicCourses();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/courses/${course.id}`,
      name: course.title,
      item: {
        "@type": "Course",
        name: course.title,
        description: course.description,
        provider: {
          "@type": "Organization",
          name: "Cursumi",
          sameAs: baseUrl,
        },
      },
    })),
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Cursos", item: `${baseUrl}/courses` },
    ],
  };

  return (
    <>
      <CoursesPageClient initialCourses={courses} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
    </>
  );
}
