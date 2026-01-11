const faqItems = [
  {
    question: "¿Necesito algo especial para tomar cursos virtuales?",
    answer:
      "Solo necesitas una conexión estable y un dispositivo con navegador actualizado. Algunas clases pueden requerir aplicaciones específicas que te notificaremos con anticipación.",
  },
  {
    question: "¿Puedo pagar en mi moneda local?",
    answer:
      "Sí, ofrecemos métodos de pago locales en México y América Latina, y puedes ver las opciones disponibles durante el checkout.",
  },
  {
    question: "¿Cómo creo un curso presencial?",
    answer:
      "Define tu programa, logística, precios y fechas desde tu panel de instructor. Te apoyamos con plantillas y herramientas para publicar rápidamente.",
  },
  {
    question: "¿Puedo impartir cursos si soy independiente?",
    answer:
      "Sí, nuestros instructores son freelancers, empresas o instituciones. Solo necesitas cumplir los requisitos de validación y completar tu perfil.",
  },
  {
    question: "¿Cómo funciona la certificación?",
    answer:
      "Los estudiantes reciben certificados digitales al completar el curso. También puedes optar por entregarlos físicamente si así lo configuras.",
  },
];

export const HowItWorksFAQ = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Preguntas frecuentes
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Respuestas rápidas sobre Cursumi
        </h2>
      </div>
      <div className="mt-6 space-y-3">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="rounded-2xl border border-border bg-card/80 p-5"
          >
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              {item.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};

