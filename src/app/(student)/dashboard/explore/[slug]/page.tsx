import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublishedCourseDetail, enrollInCourse } from "@/app/actions/course-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Monitor, Users, Calendar, Video } from "lucide-react";
import { ReviewSection } from "@/components/student/review-section";
import { PublicCourseDetailCTA } from "@/components/courses/public-course-detail-cta";
import { CourseCoverImage } from "@/components/courses/course-cover-image";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { formatPriceMXN } from "@/lib/utils";
import { formatDateLongMX } from "@/lib/date-format";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";

type Params = { params: Promise<{ slug: string }> };
const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseDetail(slug);
  if (!course) {
    return { title: "Curso no encontrado | Cursumi" };
  }
  const canonicalUrl = `${baseUrl}/courses/${course.slug || slug}`;
  return {
    title: `${course.title} | Cursumi`,
    description: course.description,
    robots: { index: false, follow: true },
    alternates: { canonical: canonicalUrl },
  };
}

type EnrollState = { status: "idle" | "success" | "error"; message?: string };

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

export default async function ExploreCourseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getPublishedCourseDetail(slug);

  if (!course) {
    redirect("/dashboard/explore");
  }

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description: course.description,
            provider: { "@type": "Organization", name: "Cursumi", sameAs: "https://cursumi.com" },
            educationalLevel: course.level,
            timeRequired: course.duration,
            courseMode: course.modality,
            courseCode: course.id,
          }),
        }}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/explore" className="underline">
          Explorar cursos
        </Link>
        <span>/</span>
        <span className="text-foreground">{course.title}</span>
      </div>

      <Card className="overflow-hidden border border-border bg-card/90">
        <CourseCoverImage imageUrl={course.imageUrl} title={course.title} />
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <ModalityBadge modality={course.modality} size="md" />
            <Badge variant="outline">{course.category}</Badge>
            {course.level && <Badge variant="outline">{course.level}</Badge>}
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
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{formatPriceMXN(course.price)}</p>
              <p className="text-xs text-muted-foreground">Pago único · acceso de por vida</p>
            </div>
            <PublicCourseDetailCTA
              isLoggedIn={true}
              courseId={course.id}
              price={course.price}
              enrollAction={enrollCourseAction}
              returnUrl={`/dashboard/explore/${slug}`}
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

      <ReviewSection courseId={course.id} />
    </div>
  );
}
