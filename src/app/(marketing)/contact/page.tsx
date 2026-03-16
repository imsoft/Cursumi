import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { ContactFAQ } from "@/components/contact/contact-faq";
import { ContactCTA } from "@/components/contact/contact-cta";
import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Contacto | Cursumi",
  description: "Escríbenos para soporte, dudas o propuestas sobre tus cursos en Cursumi.",
  alternates: { canonical: `${baseUrl}/contact` },
  openGraph: {
    title: "Contacto | Cursumi",
    description: "Comunícate con el equipo Cursumi para soporte y dudas.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Contacto Cursumi",
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero */}
        <section className="bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
              Escríbenos
            </p>
            <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">
              ¿En qué podemos ayudarte?
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Nuestro equipo está listo para resolver tus dudas, escuchar tus
              propuestas y acompañarte en cada paso.
            </p>
          </div>
        </section>

        {/* Form + Info — side by side */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            {/* Form card */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">
                Envíanos un mensaje
              </h2>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                Respondemos en menos de 24 horas hábiles.
              </p>
              <ContactForm />
            </div>

            {/* Contact info */}
            <ContactInfo />
          </div>
        </section>

        <ContactFAQ />
        <ContactCTA />
      </main>
    </div>
  );
}
