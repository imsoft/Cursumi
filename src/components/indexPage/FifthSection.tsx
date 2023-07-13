import Image from "next/image";
import Link from "next/link";

export const FifthSection = () => {
  return (
    <>
      <div className="overflow-hidden bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">
            <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Aprendamos juntos
              </h2>
              <p className="mt-6 text-xl leading-8 text-gray-600">
                La tecnología avanza a pasos agigantados y es importante estar
                actualizado para no quedarse atrás. Con nuestros cursos de
                programación, tendrás la oportunidad de estar siempre a la
                vanguardia en un mundo cada vez más digital.
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600">
                El futuro está en la tecnología y la programación. ¿Quieres ser
                parte de él? Nuestros cursos te brindarán las herramientas
                necesarias para que puedas destacar en un mercado laboral cada
                vez más competitivo.
              </p>
              <div className="mt-10 flex">
                <Link
                  href="/cursos"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Nuestros cursos <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
              <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Imagenes-Varias%2Flearning-english-online-2022-10-28-22-22-52-utc.jpg?alt=media&token=14ab0533-0c51-4306-8996-8830f6e5afe6"
                  alt=""
                  className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                  width={6720}
                  height={4480}
                />
              </div>
              <div className="contents lg:col-span-2 lg:col-end-2 lg:ml-auto lg:flex lg:w-[37rem] lg:items-start lg:justify-end lg:gap-x-8">
                <div className="order-first flex w-64 flex-none justify-end self-end lg:w-auto">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Imagenes-Varias%2Feuropean-girl-learning-online-on-laptop-at-home-2023-04-27-07-06-06-utc.jpg?alt=media&token=ad5dd3f5-fca2-46ae-b46f-2094b8d64a0a"
                    alt=""
                    className="aspect-[4/3] w-[24rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                    width={7696}
                    height={4585}
                  />
                </div>
                <div className="flex w-96 flex-auto justify-end lg:w-auto lg:flex-none">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Imagenes-Varias%2Fonline-learning-2021-09-24-03-33-50-utc.jpg?alt=media&token=00803db6-398c-4f41-b449-4934ebf97ae1"
                    alt=""
                    className="aspect-[7/5] w-[37rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                    width={5760}
                    height={3840}
                  />
                </div>
                <div className="hidden sm:block sm:w-0 sm:flex-auto lg:w-auto lg:flex-none">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Imagenes-Varias%2Fhappy-guy-near-laptop-taking-notes-learning-online-2023-04-27-07-30-36-utc.jpg?alt=media&token=a842fead-5890-42a7-b833-24c8f71232dc"
                    alt=""
                    className="aspect-[4/3] w-[24rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                    width={6720}
                    height={4480}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
