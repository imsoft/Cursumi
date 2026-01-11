export const CoursesPageHeader = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Catálogo de cursos
      </p>
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
        Explora nuestros cursos
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Encuentra cursos virtuales y presenciales creados por expertos para ayudarte
        a crecer en tu carrera profesional.<span className="hidden sm:inline"> Filtra por modalidad, categoría o ciudad y responde a tus necesidades.</span>
      </p>
    </section>
  );
};

