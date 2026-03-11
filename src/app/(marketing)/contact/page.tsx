import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { ContactFAQ } from "@/components/contact/contact-faq";
import { ContactCTA } from "@/components/contact/contact-cta";
import { Card } from "@/components/ui/card";
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
      <main className="space-y-8 pb-16">
        <section className="mx-auto max-w-5xl px-4 py-10 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Escríbenos
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Contacto
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Resolvemos dudas y escuchamos tus propuestas.
          </p>
        </section>
        <section className="mx-auto max-w-4xl px-4">
          <Card className="border border-border bg-card p-6 shadow-lg">
            <ContactForm />
          </Card>
        </section>
        <ContactInfo />
        <ContactFAQ />
        <ContactCTA />
      </main>
    </div>
  );
}
