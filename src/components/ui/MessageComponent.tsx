import Image from "next/image";
import Link from "next/link";
import {
  AcademicCapIcon,
  ChevronRightIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const links = [
  {
    nameOfService: "Cursos",
    description: "Ve todos nuestros cursos.",
    href: "/courses",
    icon: AcademicCapIcon,
  },
  {
    nameOfService: "Blog",
    description: "Mantante informado con los articulos de nuestro blog.",
    href: "/blogs",
    icon: ComputerDesktopIcon,
  },
  {
    nameOfService: "Contántanos",
    description: "Contáctanos para aclarar tus dudas.",
    href: "/contact",
    icon: GlobeAltIcon,
  },
];

export const MessageComponent = ({ topic, message, comment }: any) => {
  return (
    <>
      <div className="bg-white">
        <main className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="flex-shrink-0 pt-16">
            <Image
              className="mx-auto h-24 w-auto"
              src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Logotipo%2FCursumi.png?alt=media&token=0c5eb7b5-c8bf-4537-949d-a978c5ce176f&_gl=1*1ql1quh*_ga*MTkzOTYyOTQxNi4xNjg1NDEzODI1*_ga_CW55HF8NVT*MTY4NjI1MzQyNS40LjEuMTY4NjI1MzQ0Mi4wLjAuMA.."
              alt="Your Company"
              height={100}
              width={100}
            />
          </div>
          <div className="mx-auto max-w-xl py-16 sm:pb-24">
            <div className="text-center">
              <p className="text-base font-semibold text-purple-600">{topic}</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {message}
              </h1>
              <p className="mt-2 text-lg text-gray-500">{comment}</p>
            </div>
            <div className="mt-12">
              <h2 className="text-base font-semibold text-gray-500">
                Páginas más populares
              </h2>
              <ul
                role="list"
                className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200"
              >
                {links.map((link, linkIdx) => (
                  <li
                    key={linkIdx}
                    className="relative flex items-start space-x-4 py-6"
                  >
                    <div className="flex-shrink-0">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                        <link.icon
                          className="h-6 w-6 text-purple-700"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-medium text-gray-900">
                        <span className="rounded-sm focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2">
                          <Link href={link.href} className="focus:outline-none">
                            <span
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            {link.nameOfService}
                          </Link>
                        </span>
                      </h3>
                      <p className="text-base text-gray-500">
                        {link.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <ChevronRightIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/"
                  className="text-base font-medium text-purple-600 hover:text-purple-500"
                >
                  Regresar al inicio
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
