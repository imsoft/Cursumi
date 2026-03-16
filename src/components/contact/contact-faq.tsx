import { Plus } from "lucide-react";

const faqItems = [
  {
    question: "¿Cuánto tardan en responder?",
    answer:
      "Respondemos en menos de 24 h hábiles. Si es urgente, puedes escribirnos directamente al correo de soporte.",
  },
  {
    question: "¿Puedo enviar propuestas para cursos?",
    answer:
      "Sí, mándanos el temario junto con tus credenciales y te conectamos con nuestro equipo de curaduría.",
  },
  {
    question: "¿Cómo resuelvo problemas con mi inscripción?",
    answer:
      "Escríbenos con tu número de pedido y te ayudamos a revisar estados, reembolsos o incidencias.",
  },
  {
    question: "¿Puedo cambiar el medio de pago?",
    answer:
      "Sí, consultamos contigo para ajustar tu método de pago y mostramos las opciones disponibles en tu región.",
  },
];

export const ContactFAQ = () => {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
            Preguntas frecuentes
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Si tienes dudas, seguro las encuentras aquí
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Y si no las encuentras, escríbenos directamente.
          </p>
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
