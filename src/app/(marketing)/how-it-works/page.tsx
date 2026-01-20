import { HowItWorksHero } from "@/components/how-it-works/hero";
import { HowItWorksStudents } from "@/components/how-it-works/for-students";
import { HowItWorksInstructors } from "@/components/how-it-works/for-instructors";
import { HowItWorksBenefits } from "@/components/how-it-works/benefits-summary";
import { HowItWorksFAQ } from "@/components/how-it-works/faq";
import { HowItWorksFinalCTA } from "@/components/how-it-works/final-cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo funciona Cursumi",
  description: "Conoce el flujo para estudiantes e instructores en Cursumi: publica, aprende y certifica.",
  openGraph: {
    title: "Cómo funciona Cursumi",
    description: "Descubre el flujo para estudiantes e instructores y cómo se certifica.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Cómo funciona Cursumi",
      },
    ],
  },
};

export default function HowItWorksPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Necesito algo especial para tomar cursos virtuales?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Solo necesitas una conexión estable y un dispositivo con navegador actualizado. Algunas clases pueden requerir aplicaciones específicas.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo pagar en mi moneda local?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, ofrecemos métodos de pago locales en México y América Latina, visibles durante el checkout.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo creo un curso presencial?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Configura programa, logística, precios y fechas desde tu panel de instructor.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo impartir cursos si soy independiente?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, instructores freelancers o empresas pueden publicar al completar validación y perfil.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo funciona la certificación?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Los estudiantes reciben certificados digitales al completar el curso; puedes ofrecer físicos si lo configuras.",
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
        <HowItWorksHero />
        <HowItWorksStudents />
        <HowItWorksInstructors />
        <HowItWorksBenefits />
        <HowItWorksFAQ />
        <HowItWorksFinalCTA />
      </main>
    </div>
  );
}
