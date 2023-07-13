"use client";

import { Fragment, useState } from "react";

import Link from "next/link";
import Image from "next/image";

import { IHeader } from "@/interfaces";

import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const headerNavigation: IHeader[] = [
  { name: "Inicio", href: "/" },
  { name: "Cursos", href: "/courses" },
  { name: "Blog", href: "/blogs" },
  { name: "Contacto", href: "/contact" },
];

export const HeaderMenu = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-white shadow-md shadow-purple-500/50 sticky top-0 z-50">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Cursumi</span>
              <Image
                className="h-12 w-auto"
                src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Logotipo%2FCursumi.png?alt=media&token=0c5eb7b5-c8bf-4537-949d-a978c5ce176f&_gl=1*1ql1quh*_ga*MTkzOTYyOTQxNi4xNjg1NDEzODI1*_ga_CW55HF8NVT*MTY4NjI1MzQyNS40LjEuMTY4NjI1MzQ0Mi4wLjAuMA.."
                alt="Logo Cursumi"
                width={500}
                height={500}
              />
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {headerNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-semibold leading-6 text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-1 items-center justify-end gap-x-6">
            <Link
              href="/login"
              className="text-sm lg:block lg:text-base lg:font-semibold lg:leading-6 lg:text-gray-900"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/signup"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm lg:text-base hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Regístrate
            </Link>
            {/* {!isLoggedIn ? (
              <>
                <button
                  // href="/iniciar-sesion"
                  className="text-sm lg:block lg:text-base lg:font-semibold lg:leading-6 lg:text-gray-900"
                  onClick={() =>
                    navigateTo(`/iniciar-sesion?p=${router.refresh}`)
                  }
                >
                  Iniciar sesión
                </button>

                <button
                  // href="/registro"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm lg:text-base hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => navigateTo(`/registro?p=${router.refresh}`)}
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div
                    className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
                    aria-hidden="true"
                  />

                  <Menu as="div" className="relative">
                    <Menu.Button className="-m-1.5 flex items-center p-1.5">
                      <span className="sr-only">Open user menu</span>
                      <Image
                        className="h-8 w-8 rounded-full bg-gray-50"
                        src={user?.profilePicture!}
                        alt="Cursumi"
                        width={50}
                        height={50}
                      />
                      <span className="hidden lg:flex lg:items-center">
                        <span
                          className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                          aria-hidden="true"
                        >
                          {user?.name}
                        </span>
                        <ChevronDownIcon
                          className="ml-2 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                        <Menu.Item>
                          <button
                            className="block px-3 py-1 text-sm leading-6 text-gray-900"
                            onClick={onHandleProfile}
                          >
                            Perfil
                          </button>
                        </Menu.Item>
                        {user?.role === "teacher" && (
                          <Menu.Item>
                            <button
                              className="block px-3 py-1 text-sm leading-6 text-gray-900"
                              onClick={onHandleProfile}
                            >
                              Cursos
                            </button>
                          </Menu.Item>
                        )}

                        <Menu.Item>
                          <Link
                            href="/"
                            className="block px-3 py-1 text-sm leading-6 text-gray-900"
                            onClick={onLogout}
                          >
                            Salir
                          </Link>
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </>
            )} */}
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </nav>

        <Dialog
          as="div"
          className={"lg:hidden"}
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center gap-x-6">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Cursumi</span>
                <Image
                  className="h-8 w-auto"
                  src="https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Logotipo%2FCursumi.png?alt=media&token=0c5eb7b5-c8bf-4537-949d-a978c5ce176f&_gl=1*1ql1quh*_ga*MTkzOTYyOTQxNi4xNjg1NDEzODI1*_ga_CW55HF8NVT*MTY4NjI1MzQyNS40LjEuMTY4NjI1MzQ0Mi4wLjAuMA.."
                  alt="Cursumi"
                  width={500}
                  height={500}
                />
              </Link>
              <Link
                href="/iniciar-sesion"
                className="lg:block lg:text-base lg:font-semibold lg:leading-6 lg:text-gray-900"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="ml-auto rounded-md bg-indigo-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Regístrate
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {headerNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/iniciar-sesion"
                    className="lg:block lg:text-base lg:font-semibold lg:leading-6 lg:text-gray-900"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="-mx-3 block rounded-md px-3 py-2.5 mt-6 text-base font-semibold shadow-sm leading-7 bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Regístrate
                  </Link>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </div>
    </>
  );
};
