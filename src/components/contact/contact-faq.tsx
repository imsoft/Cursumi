import { Accordion } from "@/components/ui/accordion";

const faqItems = [
  {
    question: "¿Cuánto tardan en responder?",
    answer:
      "Respondemos en menos de 24h hábiles; si es urgente, puedes escribir por chat o WhatsApp.",
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
      "Claro, consultamos contigo para ajustar tu suscripción y mostramos las opciones disponibles en tu región.",
  },
];

export const ContactFAQ = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <p className="text-sm text-muted-foreground">
          Si tienes dudas, seguro las encuentras aquí. Y si no, escríbenos.
        </p>
      </div>
      <div className="mt-6">
        <Accordion
          items={faqItems.map((item) => ({
            title: item.question,
            content: item.answer,
          }))}
        />
      </div>
    </section>
  );
};

