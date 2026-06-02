const faqItems = [
  {
    question: "¿Puedo impartir cursos si soy independiente o freelancer?",
    answer:
      "Sí. Solo necesitas crear tu perfil, mostrar tu experiencia y conectar una cuenta bancaria para recibir ingresos.",
  },
  {
    question: "¿Puedo ofrecer cursos presenciales en mi ciudad?",
    answer:
      "Claro. Puedes especificar la ciudad, cupo, lugar y logística; nosotros ayudamos con la visibilidad.",
  },
  {
    question: "¿Qué tipo de cursos están permitidos?",
    answer:
      "Cursos con contenido original, alineados a aprendizaje profesional. No se permiten materiales que violen derechos de autor.",
  },
  {
    question: "¿Puedo tener varios cursos activos a la vez?",
    answer:
      "Sí, la plataforma permite publicar varios cursos independientes y gestionarlos desde el mismo dashboard.",
  },
  {
    question: "¿Cómo se manejan los pagos?",
    answer:
      "Los pagos se liberan luego de confirmar la asistencia o la entrega del curso; puedes configurar tus preferencias en el panel.",
  },
];

export const InstructorsFAQ = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          FAQ para instructores
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Resolvemos tus dudas más rápidas
        </h2>
      </div>
      <div className="mt-6 space-y-3">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="rounded-2xl border border-border bg-card/90 p-5"
          >
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

