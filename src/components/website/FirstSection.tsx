import Link from "next/link";
import Image from "next/image";

export const FirstSection = () => {
  return (
    <>
      {/* Hero section */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-purple-100" />
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <Image
                alt="People working on laptops"
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100"
                className="h-full w-full object-cover"
                width={2830}
                height={1200}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-700 mix-blend-multiply" />
            </div>
            <div className="relative px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
              <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-white">Take control of your</span>
                <span className="block text-purple-200">customer support</span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-purple-200 sm:max-w-3xl">
                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
                lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
                fugiat aliqua.
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                  <Link
                    href="#"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-50 sm:px-8"
                  >
                    Get started
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-center rounded-md border border-transparent bg-purple-500 bg-opacity-60 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-opacity-70 sm:px-8"
                  >
                    Live demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
