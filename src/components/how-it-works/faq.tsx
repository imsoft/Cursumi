import { Plus } from "lucide-react";

const faqItems = [
  {
    question: "¿Necesito algo especial para tomar cursos virtuales?",
    answer:
      "Solo necesitas una conexión estable y un dispositivo con navegador actualizado. Algunas clases pueden requerir aplicaciones específicas que te notificaremos con anticipación.",
  },
  {
    question: "¿Puedo pagar en mi moneda local?",
    answer:
      "Sí, ofrecemos métodos de pago locales en México y América Latina. Puedes ver las opciones disponibles durante el checkout.",
  },
  {
    question: "¿Cómo creo un curso presencial?",
    answer:
      "Define tu programa, logística, precios y fechas desde tu panel de instructor. Te apoyamos con plantillas y herramientas para publicar rápidamente.",
  },
  {
    question: "¿Puedo impartir cursos si soy independiente?",
    answer:
      "Sí, instructores freelancers, empresas o instituciones pueden publicar. Solo necesitas completar la validación y configurar tu perfil.",
  },
  {
    question: "¿Cómo funciona la certificación?",
    answer:
      "Los estudiantes reciben certificados digitales al completar el curso. También puedes optar por entregarlos físicamente si así lo configuras en tu panel.",
  },
];

export const HowItWorksFAQ = () => {
  return (
    <section className="bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
            Preguntas frecuentes
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Todo lo que necesitas saber
          </h2>
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group overflow-hidden rounded-2xl border border-border bg-background transition-shadow duration-200 hover:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 group-open:rotate-45 group-open:bg-primary/10 group-open:text-primary"
                >
                  <Plus className="h-3 w-3" />
                </span>
              </summary>
              <div className="border-t border-border px-6 pb-5 pt-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
