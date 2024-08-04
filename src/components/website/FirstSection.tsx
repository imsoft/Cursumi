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
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                className="h-full w-full object-cover"
                width={2830}
                height={1200}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-700 mix-blend-multiply" />
            </div>
            <div className="relative px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
              <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-white">Toma el control de tu</span>
                <span className="block text-purple-200">aprendizaje</span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-purple-200 sm:max-w-3xl">
                Transforma tu potencial con cursos diseñados para impulsarte
                hacia el éxito. Descubre una nueva forma de aprender que se
                adapta a tus necesidades.
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                  <Link
                    href="#"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-50 sm:px-8"
                  >
                    Empezar Ahora
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-center rounded-md border border-transparent bg-purple-500 bg-opacity-60 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-opacity-70 sm:px-8"
                  >
                    Ver cursos
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
