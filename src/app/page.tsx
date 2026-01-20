import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CourseTypes } from "@/components/course-types";
import { FeaturedCourses } from "@/components/featured-courses";
import { CTASection } from "@/components/cta-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { InstructorSection } from "@/components/instructor-section";
import { Testimonials } from "@/components/testimonials";

export const metadata = {
  title: "Formación presencial y online para crecer con expertos",
  description:
    "Descubre cursos virtuales y presenciales con instructores verificados. Aprende habilidades prácticas con Cursumi.",
  openGraph: {
    title: "Cursumi | Cursos virtuales y presenciales",
    description: "Aprende con instructores expertos en cursos online y presenciales.",
    url: "https://cursumi.com/",
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
  // Verificar si el usuario tiene sesión activa
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Si el usuario está autenticado, redirigir al dashboard
    if (session) {
      redirect("/dashboard");
    }
  } catch (error) {
    // Si hay un error al verificar la sesión, continuar mostrando la página
    // (puede ser un error de conexión, etc.)
    console.error("Error al verificar sesión:", error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="space-y-12 pb-16 pt-8">
        <Hero />
        <CourseTypes />
        <HowItWorks />
        <FeaturedCourses />
        <InstructorSection />
        <Testimonials />
        <CTASection />
      </main>
    </div>
  );
}
