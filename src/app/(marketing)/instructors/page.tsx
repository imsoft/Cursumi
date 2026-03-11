import { InstructorsHero } from "@/components/instructors/instructors-hero";
import { InstructorsBenefits } from "@/components/instructors/benefits-section";
import { InstructorsCourseTypes } from "@/components/instructors/course-types-section";
import { InstructorsSteps } from "@/components/instructors/steps-section";
import { InstructorsTestimonials } from "@/components/instructors/testimonials-section";
import { InstructorsFAQ } from "@/components/instructors/faq-section";
import { InstructorsFinalCTA } from "@/components/instructors/final-cta";
import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Para instructores | Publica y monetiza cursos en Cursumi",
  description: "Crea cursos virtuales o presenciales, gestiona estudiantes y cobra con Cursumi.",
  alternates: { canonical: `${baseUrl}/instructors` },
  openGraph: {
    title: "Para instructores | Cursumi",
    description: "Publica cursos virtuales o presenciales y cobra con Cursumi.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Instructores en Cursumi",
      },
    ],
  },
};

export default function InstructorsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Puedo impartir cursos si soy independiente o freelancer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Crea tu perfil, demuestra experiencia y conecta tu cuenta bancaria para cobrar.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo ofrecer cursos presenciales en mi ciudad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, especifica ciudad, cupo, lugar y logística desde tu panel.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué tipo de cursos están permitidos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cursos con contenido original y profesional; no se permiten materiales que violen derechos de autor.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo tener varios cursos activos a la vez?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, puedes publicar y gestionar varios cursos desde el mismo dashboard.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo se manejan los pagos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Se liberan tras confirmar asistencia/entrega; configuras tus preferencias en el panel.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="space-y-4 pb-16">
        <InstructorsHero />
        <InstructorsBenefits />
        <InstructorsCourseTypes />
        <InstructorsSteps />
        <InstructorsTestimonials />
        <InstructorsFAQ />
        <InstructorsFinalCTA />
      </main>
    </div>
  );
}
