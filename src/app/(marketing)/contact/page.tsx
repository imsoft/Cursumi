import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { ContactFAQ } from "@/components/contact/contact-faq";
import { ContactCTA } from "@/components/contact/contact-cta";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="space-y-8 pb-16">
        <section className="mx-auto max-w-5xl px-4 py-10 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Escríbenos
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Ponte en contacto con nosotros
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Estamos aquí para ayudarte, resolver dudas o escuchar tus propuestas.
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

