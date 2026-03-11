import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import { getPublicStats, getPublicTestimonials } from "@/lib/public-stats";
import { CourseTypes } from "@/components/course-types";
import { FeaturedCourses } from "@/components/featured-courses";
import { CTASection } from "@/components/cta-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { InstructorSection } from "@/components/instructor-section";
import { Testimonials } from "@/components/testimonials";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata = {
  title: "Formación presencial y online para crecer con expertos",
  description:
    "Descubre cursos virtuales y presenciales con instructores verificados. Aprende habilidades prácticas con Cursumi.",
  alternates: { canonical: baseUrl },
  openGraph: {
    title: "Cursumi | Cursos virtuales y presenciales",
    description: "Aprende con instructores expertos en cursos online y presenciales.",
    url: `${baseUrl}/`,
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Cursumi - Formación presencial y online",
      },
    ],
  },
};

export default async function Home() {
  const session = await getSessionSafe();
  if (session) {
    redirect("/dashboard");
  }

  const [stats, testimonials] = await Promise.all([
    getPublicStats(),
    getPublicTestimonials(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="space-y-12 pb-16 pt-8">
        <Hero stats={stats} />
        <CourseTypes />
        <HowItWorks />
        <FeaturedCourses />
        <InstructorSection />
        <Testimonials items={testimonials} />
        <CTASection />
      </main>
    </div>
  );
}
