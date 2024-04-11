import Image from "next/image";
import Link from "next/link";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const links = [
  {
    name: "Nuestros cursos",
    href: "/courses",
    description: "Conoce nuestros cursos y especialidades.",
    icon: AcademicCapIcon,
  },
  {
    name: "Blog",
    href: "/blogs",
    description: "Actualizate con nuestros artículos y noticias.",
    icon: BookOpenIcon,
  },
  {
    name: "Contáctanos",
    href: "/contact",
    description: "Contáctanos para más información o soporte.",
    icon: ChatBubbleLeftRightIcon,
  },
];

const NotFound = () => {
  return (
    <div className="bg-white">
      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 sm:pb-24 lg:px-8">
        <Image
          className="mx-auto h-10 w-auto sm:h-12"
          src="/cursumi.svg"
          alt="Cursumi"
          width={120}
          height={120}
        />
        <div className="mx-auto mt-20 max-w-2xl text-center sm:mt-24">
          <p className="text-base font-semibold leading-8 text-indigo-600">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Esta página no existe
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
            Lo sentimos, no pudimos encontrar la página que buscas.
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-lg sm:mt-20">
          <h2 className="sr-only">Popular pages</h2>
          <ul
            role="list"
            className="-mt-6 divide-y divide-gray-900/5 border-b border-gray-900/5"
          >
            {links.map((link, linkIdx) => (
              <li key={linkIdx} className="relative flex gap-x-6 py-6">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm ring-1 ring-gray-900/10">
                  <link.icon
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-auto">
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">
                    <Link href={link.href}>
                      <span className="absolute inset-0" aria-hidden="true" />
                      {link.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {link.description}
                  </p>
                </div>
                <div className="flex-none self-center">
                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className="text-sm font-semibold leading-6 text-indigo-600"
            >
              <span className="mr-2" aria-hidden="true">
                &larr;
              </span>
              Regresar al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
