import Link from "next/link";

export const SecondSection = () => {
  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-[#3C00B9] px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Desarrolla tus habilidades al máximo
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-gray-300">
              No importa en qué etapa de tu carrera te encuentres, nuestro curso
              online te brindará las herramientas y técnicas necesarias para
              llevar tus habilidades al máximo nivel. Conviértete en un líder
              excepcional, un experto en tu campo o simplemente en una persona
              más segura y confiada en tus habilidades. ¡Únete a nuestro curso
              hoy y comienza a desarrollar tus habilidades al máximo!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/registro"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Registrate
              </Link>
              <Link
                href="/cursos"
                className="text-sm font-semibold leading-6 text-white"
              >
                Ver cursos <span aria-hidden="true">→</span>
              </Link>
            </div>
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};
