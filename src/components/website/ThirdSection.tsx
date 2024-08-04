import { AcademicCapIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export const ThirdSection = () => {
  return (
    <>
      {/* Alternating Feature Sections */}
      <div className="relative overflow-hidden pb-32 pt-16">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-purple-100"
        />
        <div className="relative">
          <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-24 lg:px-8">
            <div className="mx-auto max-w-xl px-6 lg:mx-0 lg:max-w-none lg:px-0 lg:py-16">
              <div>
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-purple-600">
                    <AcademicCapIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Mantente al día con tu educación
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    En Cursumi, entendemos que el aprendizaje es un viaje
                    continuo. Ofrecemos un entorno donde puedes avanzar en tus
                    estudios sin perder el ritmo, gracias a nuestros cursos
                    actualizados y accesibles en cualquier momento y lugar.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="#"
                      className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-purple-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-700"
                    >
                      Comienza Ahora
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-6">
                <blockquote>
                  <div>
                    <p className="text-base text-gray-500">
                      &ldquo;En Cursumi, nuestra misión es empoderar a cada
                      estudiante para que alcance su máximo potencial. Creemos
                      que la educación de calidad debe ser accesible para todos,
                      en cualquier momento y lugar.&rdquo;
                    </p>
                  </div>
                  <footer className="mt-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Image
                          alt=""
                          src="/Brandon.png"
                          className="h-6 w-6 rounded-full"
                          width={24}
                          height={24}
                        />
                      </div>
                      <div className="text-base font-medium text-gray-700">
                        Brandon Garcia, CEO de Cursumi
                      </div>
                    </div>
                  </footer>
                </blockquote>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0">
              <div className="-mr-48 pl-6 md:-mr-16 lg:relative lg:m-0 lg:h-full lg:px-0">
                <Image
                  alt="Inbox user interface"
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  width={500}
                  height={462}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-24">
          <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-24 lg:px-8">
            <div className="mx-auto max-w-xl px-6 lg:col-start-2 lg:mx-0 lg:max-w-none lg:px-0 lg:py-32">
              <div>
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-purple-600">
                    <SparklesIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Comprende Mejor tu Aprendizaje
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Con Cursumi, no solo adquieres conocimientos, sino que
                    también entiendes cómo aplicarlos de manera efectiva en la
                    vida real. Nuestros cursos están diseñados para brindarte
                    una comprensión profunda y práctica de cada tema, asegurando
                    que estés preparado para enfrentar cualquier desafío.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="#"
                      className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-purple-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-700"
                    >
                      Comienza Ahora
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:col-start-1 lg:mt-0">
              <div className="-ml-48 pr-6 md:-ml-16 lg:relative lg:m-0 lg:h-full lg:px-0">
                <Image
                  alt="Customer profile user interface"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                  width={500}
                  height={462}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
