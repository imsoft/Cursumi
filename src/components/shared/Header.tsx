import Image from "next/image";
import Link from "next/link";

import {
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";

import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const Header = () => {
  return (
    <>
      <header>
        <Popover className="relative bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between p-6 md:justify-start md:space-x-10 lg:px-8">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/">
                <span className="sr-only">Cursumi</span>
                <Image
                  alt="Cursumi Logo"
                  src="/cursumi.svg"
                  className="h-8 w-auto sm:h-10"
                  width={40}
                  height={40}
                />
              </Link>
            </div>
            <div className="-my-2 -mr-2 md:hidden">
              <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </PopoverButton>
            </div>
            <PopoverGroup as="nav" className="hidden space-x-10 md:flex">
              <Link
                href="/cursos"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Cursos
              </Link>
              <Link
                href="/blog"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Blog
              </Link>
            </PopoverGroup>
            <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
              <Link
                href="#"
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="#"
                className="ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-purple-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-700"
              >
                Registrarse
              </Link>
            </div>
          </div>

          <PopoverPanel
            transition
            className="absolute inset-x-0 top-0 z-30 origin-top-right transform p-2 transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in md:hidden"
          >
            <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-5 pb-6 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Image
                      alt="Cursumi Logo"
                      src="/cursumi.svg"
                      className="h-8 w-auto"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="-mr-2">
                    <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                    </PopoverButton>
                  </div>
                </div>
              </div>
              <div className="px-5 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/cursos"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Cursos
                  </Link>
                  <Link
                    href="/blog"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Blog
                  </Link>
                </div>
                <div className="mt-6">
                  <Link
                    href="#"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-purple-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-700"
                  >
                    Registrarse
                  </Link>
                  <p className="mt-6 text-center text-base font-medium text-gray-500">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="#" className="text-gray-900">
                      Iniciar Sesión
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </PopoverPanel>
        </Popover>
      </header>
    </>
  );
};
