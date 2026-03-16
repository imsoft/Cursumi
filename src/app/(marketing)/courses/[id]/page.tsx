import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedCourseDetail, enrollInCourse } from "@/app/actions/course-actions";
import { getSessionSafe } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Monitor, Users, Calendar, Clock } from "lucide-react";
import { EnrollActionForm } from "@/components/student/enroll-action-form";
import { CheckoutButton } from "@/components/student/checkout-button";
import { ReviewSection } from "@/components/student/review-section";
import { PublicCourseDetailCTA } from "@/components/courses/public-course-detail-cta";
import { formatPriceMXN } from "@/lib/utils";
import { formatDuration } from "@/lib/course-completion";
import { parseDurationToMinutes } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };
const ogFallback =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80";

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const course = await getPublishedCourseDetail(id);
  if (!course) {
    return {
      title: "Curso no encontrado | Cursumi",
    };
  }
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/courses/${id}`;
  const image = course.imageUrl || ogFallback;
  return {
    title: `${course.title} | Cursumi`,
    description: course.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: course.title,
      description: course.description || "Curso en Cursumi",
      url: canonicalUrl,
      images: [
        image,
        { url: `/api/og/course/${course.id}` },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.description || "Curso en Cursumi",
      images: [image],
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
  if (!courseId || typeof courseId !== "string") {
    return { status: "error", message: "Curso inválido" };
  }
  try {
    await enrollInCourse(courseId);
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, session] = await Promise.all([
    getPublishedCourseDetail(id),
    getSessionSafe(),
  ]);

  if (!course) {
    notFound();
  }

  const returnUrl = `/courses/${id}`;
  const isLoggedIn = !!session;

  // Calculate total content duration from lesson durations
  const totalDurationMinutes = (course.sections ?? []).reduce((total, section) =>
    total + section.lessons.reduce((acc, l) => acc + parseDurationToMinutes(l.duration ?? undefined), 0), 0
  );
  const totalDurationFormatted = totalDurationMinutes > 0 ? formatDuration(totalDurationMinutes) : null;

  const baseUrl = getBaseUrl();
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: { "@type": "Organization", name: "Cursumi", sameAs: baseUrl },
    educationalLevel: course.level,
    timeRequired: course.duration,
    courseMode: course.modality,
    courseCode: course.id,
    ...(course.imageUrl && { image: course.imageUrl }),
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Cursos", item: `${baseUrl}/courses` },
      { "@type": "ListItem", position: 3, name: course.title, item: `${baseUrl}/courses/${id}` },
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

      <Card className="border border-border bg-card/90">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{course.modality === "virtual" ? "Virtual" : "Presencial"}</Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <CardTitle className="text-3xl">{course.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{course.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              {course.modality === "virtual" ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{course.city || "Online"}</span>
            </div>
            {course.startDate && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4" />
                <span>Inicio: {course.startDate.toISOString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Users className="h-4 w-4" />
              <span>Inscritos: {course._count.enrollments}</span>
            </div>
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
            />
          </div>
        </CardContent>
      </Card>

      <ReviewSection courseId={id} />
    </div>
  );
}
