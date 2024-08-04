import Link from "next/link";

export const SixthSection = () => {
  return (
    <>
      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24 lg:flex lg:max-w-7xl lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">¿Listo para comenzar?</span>
            <span className="-mb-1 block bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text pb-1 text-transparent">
              Empieza tu viaje de aprendizaje con nosotros.
            </span>
          </h2>
          <div className="mt-6 space-y-4 sm:flex sm:space-x-5 sm:space-y-0">
            <Link
              href="#"
              className="flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-purple-600 bg-origin-border px-4 py-3 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-700"
            >
              Más información
            </Link>
            <Link
              href="#"
              className="flex items-center justify-center rounded-md border border-transparent bg-purple-50 px-4 py-3 text-base font-medium text-purple-800 shadow-sm hover:bg-purple-100"
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
