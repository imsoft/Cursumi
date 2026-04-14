import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Regenerar cada 5 minutos — el detalle del curso (reviews, precio) puede cambiar
export const revalidate = 300;
import { getPublishedCourseDetail, enrollInCourse } from "@/app/actions/course-actions";
import { getSessionSafe } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Monitor, Users, Calendar, Clock, Video } from "lucide-react";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { EnrollActionForm } from "@/components/student/enroll-action-form";
import { CheckoutButton } from "@/components/student/checkout-button";
import { ReviewSection } from "@/components/student/review-section";
import { LearningReflectionsSection } from "@/components/courses/learning-reflections-section";
import { PublicCourseDetailCTA } from "@/components/courses/public-course-detail-cta";
import { CourseCoverImage } from "@/components/courses/course-cover-image";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { formatPriceMXN } from "@/lib/utils";
import { formatDuration } from "@/lib/course-completion";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { parseDurationToMinutes } from "@/lib/utils";
import { formatDateLongMX } from "@/lib/date-format";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";

type Params = { params: Promise<{ slug: string }> };
const ogFallback =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80";

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseDetail(slug);
  if (!course) {
    return {
      title: "Curso no encontrado | Cursumi",
    };
  }
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/courses/${course.slug || slug}`;
  const image = course.imageUrl || ogFallback;
  const ogImageUrl = `${baseUrl}/api/og/course/${course.id}`;

  const modalityLabel =
    course.modality === "virtual" ? "online" :
    course.modality === "presencial" ? "presencial" : "en vivo";

  return {
    title: `${course.title} | Cursumi`,
    description: course.description,
    keywords: [
      course.title,
      course.category,
      `curso de ${course.category}`,
      `curso ${modalityLabel}`,
      course.instructor?.name ? `${course.instructor.name}` : null,
      "Cursumi",
      "cursos online",
      "formación",
      "aprendizaje",
    ].filter(Boolean) as string[],
    authors: course.instructor?.name ? [{ name: course.instructor.name }] : undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${course.title} — Cursumi`,
      description: course.description || "Curso en Cursumi",
      url: canonicalUrl,
      siteName: "Cursumi",
      locale: "es_MX",
      images: [
        { url: ogImageUrl, width: 1200, height: 630, alt: course.title },
        { url: image, width: 1200, height: 630, alt: course.title },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      site: "@cursumi",
      title: `${course.title} — Cursumi`,
      description: course.description || "Curso en Cursumi",
      images: [ogImageUrl],
    },
  };
}

type EnrollState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function enrollCourseAction(_prev: EnrollState, formData: FormData): Promise<EnrollState> {
  "use server";
  const courseId = formData.get("courseId");
  const sessionId = formData.get("sessionId") as string | null;
  const joinCode = formData.get("joinCode");
  if (!courseId || typeof courseId !== "string") {
    return { status: "error", message: "Curso inválido" };
  }
  try {
    await enrollInCourse(
      courseId,
      sessionId || undefined,
      typeof joinCode === "string" ? joinCode : undefined
    );
    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No pudimos inscribirte, intenta de nuevo.",
    };
  }
}

export default async function PublicCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, session] = await Promise.all([
    getPublishedCourseDetail(slug),
    getSessionSafe(),
  ]);

  if (!course) {
    notFound();
  }

  const courseSlug = course.slug || slug;
  const returnUrl = `/courses/${courseSlug}`;
  const isLoggedIn = !!session;

  const totalDurationMinutes = (course.sections ?? []).reduce((total, section) =>
    total + section.lessons.reduce((acc, l) => acc + parseDurationToMinutes(l.duration ?? undefined), 0), 0
  );
  const totalDurationFormatted = totalDurationMinutes > 0 ? formatDuration(totalDurationMinutes) : null;

  const baseUrl = getBaseUrl();

  const reviews = course.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : null;

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: `${baseUrl}/courses/${courseSlug}`,
    provider: { "@type": "Organization", name: "Cursumi", sameAs: baseUrl },
    ...(course.instructor?.name && {
      author: { "@type": "Person", name: course.instructor.name },
    }),
    educationalLevel: course.level,
    inLanguage: "es-MX",
    timeRequired: course.duration,
    courseMode: course.modality,
    courseCode: course.id,
    ...(course.imageUrl && { image: course.imageUrl }),
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/courses/${courseSlug}`,
    },
    ...(avgRating !== null && reviews.length >= 3 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Cursos", item: `${baseUrl}/courses` },
      { "@type": "ListItem", position: 3, name: course.title, item: `${baseUrl}/courses/${courseSlug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/courses" className="underline">
          Cursos
        </Link>
        <span>/</span>
        <span className="text-foreground">{course.title}</span>
      </div>

      <Card className="overflow-hidden border border-border bg-card/90">
        <CourseCoverImage imageUrl={course.imageUrl} title={course.title} />
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <ModalityBadge modality={course.modality} size="md" />
              <Badge variant="outline">{course.category}</Badge>
              {course.level && <Badge variant="outline">{course.level}</Badge>}
            </div>
            <WishlistButton courseId={course.id} isLoggedIn={isLoggedIn} />
          </div>
          <CardTitle className="text-3xl">{course.title}</CardTitle>
          <RichTextRenderer content={course.description} className="text-sm leading-relaxed text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              {course.modality === "virtual" ? (
                <Monitor className="h-4 w-4" />
              ) : course.modality === "live" ? (
                <Video className="h-4 w-4 text-violet-500" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{formatMexicoLocation(course.city, course.state) || "Online"}</span>
            </div>
            {course.startDate && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4" />
                <span>Inicio: {formatDateLongMX(course.startDate)}</span>
              </div>
            )}

            {course.duration && (
              <div className="text-sm text-foreground">Duración: {course.duration}</div>
            )}
            {totalDurationFormatted && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock className="h-4 w-4" />
                <span>{totalDurationFormatted} de contenido en video</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{formatPriceMXN(course.price)}</p>
              <p className="text-xs text-muted-foreground">Pago único · acceso de por vida</p>
            </div>
            <PublicCourseDetailCTA
              isLoggedIn={isLoggedIn}
              courseId={course.id}
              price={course.price}
              enrollAction={enrollCourseAction}
              returnUrl={returnUrl}
              requiresJoinCode={course.requiresJoinCode}
              sessions={
                (course.modality === "presencial" || course.modality === "live") &&
                course.courseSessions?.length
                  ? course.courseSessions.map((s) => ({
                      id: s.id,
                      city: s.city,
                      location:
                        course.modality === "live"
                          ? "Videollamada (enlace tras inscribirte)"
                          : "Sede confirmada al inscribirte",
                      date: s.date.toISOString(),
                      startTime: s.startTime,
                      endTime: s.endTime,
                      isFull: s._count.enrollments >= s.maxStudents,
                    }))
                  : undefined
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Temario / curriculum */}
      {course.sections && course.sections.length > 0 && (
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl">Contenido del curso</CardTitle>
            <p className="text-sm text-muted-foreground">
              {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lecciones
              {totalDurationFormatted ? ` · ${totalDurationFormatted}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {course.sections.map((section) => (
              <div key={section.id} className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5">
                  <p className="text-sm font-semibold">{section.title}</p>
                </div>
                <ul className="divide-y divide-border">
                  {section.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {lesson.type === "video" ? (
                          <Video className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : lesson.type === "quiz" ? (
                          <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="text-sm truncate">{lesson.title}</span>
                        {lesson.isFree && (
                          <span className="shrink-0 rounded-full bg-green-600/10 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400">
                            Gratis
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                        )}
                        {lesson.isFree && (
                          <Link
                            href={isLoggedIn
                              ? `/dashboard/my-courses/${course.id}/lessons/${lesson.id}`
                              : `/login?redirect=/dashboard/my-courses/${course.id}/lessons/${lesson.id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Ver lección
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ReviewSection courseId={course.id} />

      <LearningReflectionsSection courseId={course.id} />
    </div>
  );
}
