import Image from "next/image";

const metrics = [
  {
    id: 1,
    stat: "",
    emphasis: "Aprendizaje Personalizado, ",
    rest: "cursos adaptados a tu ritmo y estilo.",
  },
  {
    id: 2,
    stat: "",
    emphasis: "Enfoque Práctico, ",
    rest: "aplica lo aprendido con proyectos reales.",
  },
  {
    id: 3,
    stat: "",
    emphasis: "Soporte y Comunidad, ",
    rest: "accede a una red de estudiantes y expertos.",
  },
  {
    id: 4,
    stat: "",
    emphasis: "Contenido de Alta Calidad, ",
    rest: "lecciones creadas por profesionales.",
  },
];

export const FifthSection = () => {
  return (
    <>
      {/* Stats section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-x-0 bottom-0 h-80 xl:top-0 xl:h-full">
          <div className="h-full w-full xl:grid xl:grid-cols-2">
            <div className="h-full xl:relative xl:col-start-2">
              <Image
                alt="People working on laptops"
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                className="h-full w-full object-cover opacity-25 xl:absolute xl:inset-0"
                width={2830}
                height={1200}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-900 xl:inset-y-0 xl:left-0 xl:h-full xl:w-32 xl:bg-gradient-to-r"
              />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 lg:max-w-7xl lg:px-8 xl:grid xl:grid-flow-col-dense xl:grid-cols-2 xl:gap-x-8">
          <div className="relative pb-64 pt-12 sm:pb-64 sm:pt-24 xl:col-start-1 xl:pb-24">
            <h2 className="text-base font-semibold">
              <span className="bg-gradient-to-r from-purple-300 to-purple-300 bg-clip-text text-transparent">
                Cursumi
              </span>
            </h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">
              Impulsa tu Crecimiento con Datos Accionables
            </p>
            <p className="mt-5 text-lg text-gray-300">
              En Cursumi, ofrecemos herramientas poderosas que te permiten
              transformar tus metas en realidad. Aprovecha los recursos
              diseñados para optimizar tu aprendizaje y desarrollo personal.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
              {metrics.map((item) => (
                <p key={item.id}>
                  <span className="block text-2xl font-bold text-white">
                    {item.stat}
                  </span>
                  <span className="mt-1 block text-base text-gray-300">
                    <span className="font-medium text-white">
                      {item.emphasis}
                    </span>{" "}
                    {item.rest}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
