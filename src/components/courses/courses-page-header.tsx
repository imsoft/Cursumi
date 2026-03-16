export const CoursesPageHeader = () => {
  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Catálogo de cursos
        </p>
        <h1 className="mt-2 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
          Explora nuestros cursos
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Cursos virtuales y presenciales creados por expertos en programación,
          marketing, diseño y más. Instructores verificados, certificación
          incluida.
        </p>
      </div>
    </section>
  );
};
