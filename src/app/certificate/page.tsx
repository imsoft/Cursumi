import Image from "next/image";
import { ArrowDownTrayIcon, ShareIcon } from "@heroicons/react/24/outline";

const nombreCertificado = "Brandon Uriel Garcia Ramos";

const CertificatePage = () => {
  return (
    <>
      <div className="bg-white">
        <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-x-8">
              <div className="flex flex-col-reverse col-span-2">
                <div className="aspect-h-1 aspect-w-1 w-full">
                  <Image
                    src={
                      "https://tailwindui.com/img/ecommerce-images/home-page-03-category-01.jpg"
                    }
                    alt={`Curso finalizado en Cursumi, certificado de ${nombreCertificado}`}
                    className="h-full w-full object-cover object-center sm:rounded-lg"
                    height={500}
                    width={500}
                  />
                </div>
              </div>

              {/* Product info */}
              <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  ¡Felicidades!
                </h1>

                <div className="mt-3">
                  <h2 className="sr-only">Students name</h2>
                  <p className="text-3xl tracking-tight text-gray-900">
                    {nombreCertificado} 🥳
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="sr-only">Description</h3>

                  <div className="space-y-6 text-base text-gray-700">
                    <p>
                      ¡Enhorabuena! Hoy es un día especial para ti, ya que
                      culminas exitosamente este curso. Quiero felicitarte por
                      tu dedicación, perseverancia y compromiso con tu
                      crecimiento personal. Has demostrado una increíble
                      determinación y has superado todos los desafíos que se
                      presentaron en el camino.
                    </p>
                    <p>
                      Recuerda que el aprendizaje es un viaje constante, y este
                      es solo el comienzo. Sigue persiguiendo tus sueños, sigue
                      explorando y aprendiendo. Confía en ti mismo/a y en tus
                      habilidades, porque tienes todo lo necesario para
                      triunfar.
                    </p>
                    <p>
                      Quiero agradecerte por ser parte de este curso y por
                      contribuir a un ambiente de aprendizaje enriquecedor. Tu
                      participación, tus preguntas y tu entusiasmo han hecho que
                      este curso sea aún más especial. Ha sido un honor ser tu
                      guía en este proceso de aprendizaje.
                    </p>
                  </div>
                </div>

                <form className="mt-6">
                  <div className="mt-10 flex gap-4">
                    <button
                      type="submit"
                      className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Descargar
                    </button>
                    <button
                      type="submit"
                      className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                    >
                      <ShareIcon className="h-4 w-4 mr-2" />
                      Compartir
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CertificatePage;
