import Link from "next/link";

export const SecondSection = () => {
  return (
    <>
      {/* CTA */}
      <div className="relative bg-purple-100 mx-auto flexflex-col items-center px-4 py-32 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2
            id="sale-heading"
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
          >
            Transforma tu futuro hoy mismo
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-xl text-gray-600">
            Únete a Cursumi y accede a cursos que te llevarán al siguiente nivel
            en tu carrera y desarrollo personal. No pierdas la oportunidad de
            crecer y aprender con los mejores.
          </p>
          <Link
            href="#"
            className="mt-6 inline-block w-full rounded-md border border-transparent bg-purple-900 px-8 py-3 font-medium text-white hover:bg-purple-800 sm:w-auto"
          >
            Accede a tu futuro ahora
          </Link>
        </div>
      </div>
    </>
  );
};
