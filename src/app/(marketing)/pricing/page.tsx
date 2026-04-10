import Link from "next/link";
import type { Metadata } from "next";
import { Check, X, ArrowRight, BookOpen, Users, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Precios | Cursumi",
  description:
    "Sin suscripciones. Paga solo por los cursos que quieres. Acceso de por vida, certificado incluido.",
  alternates: { canonical: `${baseUrl}/pricing` },
  openGraph: {
    title: "Precios — Cursumi",
    description: "Sin suscripciones. Paga solo por los cursos que quieres.",
    url: `${baseUrl}/pricing`,
    siteName: "Cursumi",
  },
};

const studentBenefits = [
  "Acceso de por vida al contenido del curso",
  "Certificado digital al completar",
  "Acceso desde cualquier dispositivo",
  "Mensajería directa con el instructor",
  "Notas personales por lección",
  "Descarga de materiales adjuntos",
  "Progreso guardado automáticamente",
  "Sin suscripción mensual",
];

const instructorPlans = [
  {
    name: "Instructor",
    price: "Gratis",
    description: "Publica tus cursos y llega a miles de estudiantes.",
    highlight: false,
    features: [
      { text: "Cursos ilimitados", included: true },
      { text: "Video alojado con Mux", included: true },
      { text: "Panel de analíticas", included: true },
      { text: "Mensajería con estudiantes", included: true },
      { text: "Certificados automáticos", included: true },
      { text: "Pagos vía Stripe Connect", included: true },
      { text: "Comisión de plataforma: 20%", included: true },
      { text: "Soporte prioritario", included: false },
    ],
    cta: "Convertirse en instructor",
    ctaHref: "/dashboard/become-instructor",
  },
];

const businessFeatures = [
  "Acceso a catálogo completo de cursos",
  "Gestión de equipos y asignación de cursos",
  "Panel de métricas de progreso por empleado",
  "Materiales corporativos propios",
  "Facturación centralizada",
  "Soporte dedicado",
];

const faqs = [
  {
    q: "¿Necesito una suscripción para aprender?",
    a: "No. En Cursumi pagas una sola vez por cada curso y tienes acceso de por vida. No hay cargos mensuales ni sorpresas.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex) a través de Stripe. Los precios están en MXN.",
  },
  {
    q: "¿Hay política de reembolso?",
    a: "Si no estás satisfecho con tu compra, contáctanos dentro de los primeros 7 días y revisamos tu caso.",
  },
  {
    q: "¿Cómo funciona para empresas?",
    a: "Las empresas pueden crear una organización, invitar a sus empleados y asignarles cursos del catálogo. Contáctanos para una demostración.",
  },
  {
    q: "¿Los instructores reciben el 100% del precio?",
    a: "Los instructores reciben el 80% de cada venta. Cursumi retiene el 20% para cubrir la plataforma, pagos y soporte.",
  },
  {
    q: "¿Puedo publicar cursos presenciales y en vivo?",
    a: "Sí. Cursumi soporta cursos virtuales, presenciales y sesiones en vivo. Configuras fechas, ubicación y capacidad desde tu panel.",
  },
];

export default function PricingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-20 pb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary mb-3">
          Precios
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Simple. Sin sorpresas.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Paga solo por los cursos que quieres. Sin suscripciones, sin costos ocultos.
          Acceso de por vida desde el primer día.
        </p>
      </section>

      {/* Para estudiantes */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-border bg-card/60 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: copy */}
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit mb-4">
                <BookOpen className="h-3.5 w-3.5" />
                Para estudiantes
              </div>
              <h2 className="text-3xl font-black">Paga por curso,<br />acceso de por vida</h2>
              <p className="mt-3 text-muted-foreground">
                Cada curso tiene su propio precio. Lo pagas una vez y es tuyo para siempre —
                incluyendo actualizaciones futuras del instructor.
              </p>
              <Link href="/courses" className="mt-6 w-fit">
                <Button size="lg" className="gap-2">
                  Ver cursos disponibles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Right: benefits */}
            <div className="bg-muted/30 p-8 sm:p-10 flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Incluido en cada curso
              </p>
              <ul className="space-y-3">
                {studentBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Para instructores */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400 mb-3">
            <Users className="h-3.5 w-3.5" />
            Para instructores
          </div>
          <h2 className="text-3xl font-black">Publica gratis, gana por cada venta</h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            No hay cuota mensual para instructores. Creas tu curso, lo publicas y
            recibes el <strong>80%</strong> de cada venta directamente en tu cuenta.
          </p>
        </div>

        {instructorPlans.map((plan) => (
          <div
            key={plan.name}
            className="mx-auto max-w-xl rounded-2xl border border-border bg-card/60 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-black text-2xl">{plan.price}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm">
                  {f.included
                    ? <Check className="h-4 w-4 shrink-0 text-primary" />
                    : <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  }
                  <span className={f.included ? "" : "text-muted-foreground/50"}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link href={plan.ctaHref} className="block">
              <Button size="lg" className="w-full gap-2">
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </section>

      {/* Para empresas */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-violet-600 to-purple-700 p-8 sm:p-12">
          <div aria-hidden className="pointer-events-none absolute top-0 left-1/4 h-48 w-48 rounded-full bg-white/6 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white mb-4">
                <Award className="h-3.5 w-3.5" />
                Para empresas
              </div>
              <h2 className="text-3xl font-black text-white">Formación corporativa a medida</h2>
              <p className="mt-3 text-white/75">
                Capacita a tu equipo con el catálogo de Cursumi. Gestiona equipos, asigna cursos
                y mide el progreso desde un panel centralizado.
              </p>
              <Link href="/business" className="mt-6 inline-block">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                  Conocer plan empresarial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ul className="space-y-3">
              {businessFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                  <Check className="h-4 w-4 shrink-0 text-white" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 pb-20">
        <h2 className="text-2xl font-black text-center mb-8">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-border bg-card/60 px-5 py-4">
              <p className="font-semibold text-sm">{q}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
