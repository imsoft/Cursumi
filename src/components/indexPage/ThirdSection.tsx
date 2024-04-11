import Image from "next/image";
import Link from "next/link";

import {
  AcademicCapIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

export const ThirdSection = () => {
  return (
    <>
      <div className="relative overflow-hidden bg-white pb-16 pt-16">
        <div className="relative">
          <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-24 lg:px-8">
            <div className="mx-auto max-w-xl px-6 lg:mx-0 lg:max-w-none lg:px-0 lg:py-16">
              <div>
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
                    <AcademicCapIcon
                      className="h-8 w-8 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Aprende a programar desde cero
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Nuestro curso online te enseñará los fundamentos de la
                    programación y te guiará paso a paso para que puedas crear
                    tus propios programas y aplicaciones desde cero. Aprenderás
                    los lenguajes de programación más utilizados en la
                    actualidad.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/signup"
                      className="inline-flex rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
                    >
                      Iniciemos hoy
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-6">
                <blockquote>
                  <div>
                    <p className="text-base text-gray-500">
                      &ldquo;El aprendizaje constante nos permite vivir en una
                      vida de variables.&rdquo;
                    </p>
                  </div>
                  <footer className="mt-3">
                    <div className="flex items-center space-x-3">
                      {/* <div className="flex-shrink-0">
                        <Image
                          className="h-6 w-6 rounded-full"
                          src="https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                          alt=""
                          width={500}
                          height={500}
                        />
                      </div> */}
                      <div className="text-base font-medium text-gray-700">
                        Brandon García, CEO
                      </div>
                    </div>
                  </footer>
                </blockquote>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0">
              <div className="-mr-48 pl-6 md:-mr-16 lg:relative lg:m-0 lg:h-full lg:px-0">
                <Image
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Imagenes-Varias%2Fhelena-lopes-UZe35tk5UoA-unsplash.jpg?alt=media&token=e91ced26-2ff1-4ab7-b620-29b5628a4069"
                  alt="Inbox user interface"
                  width={4813}
                  height={3209}
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
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
                    <ComputerDesktopIcon
                      className="h-8 w-8 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Desarrollo web
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    El desarrollo web es una de las habilidades más demandadas
                    en la actualidad, y nuestro curso online te enseñará todo lo
                    que necesitas saber para convertirte en un experto en
                    desarrollo web. Aprenderás a utilizar lenguajes de
                    programación como HTML, CSS y JavaScript.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/cursos"
                      className="inline-flex rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
                    >
                      Ver cursos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:col-start-1 lg:mt-0">
              <div className="-ml-48 pr-6 md:-ml-16 lg:relative lg:m-0 lg:h-full lg:px-0">
                <Image
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Imagenes-Varias%2Fpriscilla-du-preez-XkKCui44iM0-unsplash.jpg?alt=media&token=07156316-9dc6-40d2-b64b-0a936fc2a5ed"
                  alt="Customer profile user interface"
                  width={5472}
                  height={3648}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
