import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import { getUserRole } from "@/lib/user-service";
import { getPublicStats, getPublicTestimonials, getFeaturedCourses } from "@/lib/public-stats";
import { CourseTypes } from "@/components/course-types";
import { FeaturedCourses } from "@/components/featured-courses";
import { CTASection } from "@/components/cta-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { InstructorSection } from "@/components/instructor-section";
import { Testimonials } from "@/components/testimonials";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata = {
  title: "Cursos en video y en vivo para crecer con expertos",
  description:
    "Descubre cursos en video a tu ritmo y cursos por evento (presenciales o por videollamada) con instructores verificados. Aprende habilidades prácticas con Cursumi.",
  alternates: {
    canonical: baseUrl,
    // Público de toda Latinoamérica: una sola versión en español.
    // Declaramos es-419 (español LatAm) y x-default apuntando a la misma URL.
    languages: {
      "es-419": baseUrl,
      "x-default": baseUrl,
    },
  },
  openGraph: {
    title: "Cursumi | Cursos en video y en vivo",
    description: "Aprende con instructores expertos: cursos en video a tu ritmo o eventos en vivo.",
    url: `${baseUrl}/`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "Cursumi - Aprende a tu ritmo o en vivo",
      },
    ],
  },
};

export default async function Home() {
  const session = await getSessionSafe();
  if (session) {
    const role = await getUserRole(session.user.id);
    if (role === "admin") redirect("/admin");
    if (role === "instructor") redirect("/instructor");
    redirect("/dashboard");
  }

  const [stats, testimonials, featuredCourses] = await Promise.all([
    getPublicStats(),
    getPublicTestimonials(),
    getFeaturedCourses(6),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Hero stats={stats} />
        <CourseTypes />
        <HowItWorks />
        <FeaturedCourses courses={featuredCourses} />
        <InstructorSection />
        <Testimonials items={testimonials} />
        <CTASection />
      </main>
    </div>
  );
}
