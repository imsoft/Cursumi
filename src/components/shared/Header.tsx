import {
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";

import {
  Bars3Icon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

const solutions = [
  {
    name: "Inbox",
    description:
      "Get a better understanding of where your traffic is coming from.",
    href: "#",
    icon: InboxIcon,
  },
  {
    name: "Messaging",
    description: "Speak directly to your customers in a more meaningful way.",
    href: "#",
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    name: "Live Chat",
    description: "Your customers' data will be safe and secure.",
    href: "#",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: "Knowledge Base",
    description: "Connect with third-party tools that you're already using.",
    href: "#",
    icon: QuestionMarkCircleIcon,
  },
];

export const Header = () => {
  return (
    <>
      <header>
        <Popover className="relative bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between p-6 md:justify-start md:space-x-10 lg:px-8">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="#">
                <span className="sr-only">Your Company</span>
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
              <Popover className="relative">
                <PopoverButton className="group inline-flex items-center rounded-md bg-white text-base font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 data-[open]:text-gray-900">
                  <span>Solutions</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-data-[open]:text-gray-600 group-data-[open]:group-hover:text-gray-500"
                  />
                </PopoverButton>

                <PopoverPanel
                  transition
                  className="absolute z-10 -ml-4 mt-3 w-screen max-w-md transform transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in lg:left-1/2 lg:ml-0 lg:max-w-2xl lg:-translate-x-1/2"
                >
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-2">
                      {solutions.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-purple-600 text-white sm:h-12 sm:w-12">
                            <item.icon aria-hidden="true" className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>

              <Link
                href="#"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Partners
              </Link>
              <Link
                href="#"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Company
              </Link>
            </PopoverGroup>
            <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
              <Link
                href="#"
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="#"
                className="ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-purple-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-700"
              >
                Sign up
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
                <div className="mt-6">
                  <nav className="grid grid-cols-1 gap-7">
                    {solutions.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-m-3 flex items-center rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-purple-600 text-white">
                          <item.icon aria-hidden="true" className="h-6 w-6" />
                        </div>
                        <div className="ml-4 text-base font-medium text-gray-900">
                          {item.name}
                        </div>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="px-5 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Partners
                  </Link>
                  <Link
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Company
                  </Link>
                </div>
                <div className="mt-6">
                  <Link
                    href="#"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-purple-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-700"
                  >
                    Sign up
                  </Link>
                  <p className="mt-6 text-center text-base font-medium text-gray-500">
                    Existing customer?
                    <Link href="#" className="text-gray-900">
                      Sign in
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
