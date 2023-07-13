import Image from "next/image";
import Link from "next/link";

export const FirstSection = () => {
  return (
    <>
      <div className="relative bg-white">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:pt-20 lg:px-0 xl:col-span-6">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className="hidden sm:mt-32 sm:flex lg:mt-16">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  Únete a nuestra comunidad de aprendizaje en línea hoy mismo.{" "}
                  <Link
                    href="/registro"
                    className="whitespace-nowrap font-semibold text-indigo-600"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    Registrate <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              <h1 className="mt-24 text-4xl font-bold tracking-tight text-gray-900 sm:mt-10 sm:text-6xl">
                Te apoyaremos a dar el primer paso.
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Aprende desde cualquier lugar, en cualquier momento para que
                descubras tu potencial y alcanza tus metas con nuestra
                plataforma de educación en línea.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/cursos"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Ver cursos
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Leer blog <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
            <Image
              className="aspect-[3/2] w-full rounded-l-lg bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
              src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Imagenes-Varias%2Fyoung-student-wearing-headphones-studies-online-d-2023-02-24-00-21-26-utc.jpg?alt=media&token=b9d9a48f-088b-429c-843d-6c575942089e"
              alt=""
              height={3951}
              width={5939}
            />
          </div>
        </div>
      </div>
    </>
  );
};
