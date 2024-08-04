import Image from "next/image";

export const SecondSection = () => {
  return (
    <>
    {/* Logo Cloud */}
    <div className="bg-gray-100">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
              <p className="text-center text-base font-semibold text-gray-500">
                Trusted by over 5 very average small businesses
              </p>
              <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
                <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                  <Image
                    alt="Tuple"
                    src="https://tailwindui.com/img/logos/tuple-logo-gray-400.svg"
                    className="h-12"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                  <Image
                    alt="Mirage"
                    src="https://tailwindui.com/img/logos/mirage-logo-gray-400.svg"
                    className="h-12"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                  <Image
                    alt="StaticKit"
                    src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg"
                    className="h-12"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="col-span-1 flex justify-center md:col-span-2 md:col-start-2 lg:col-span-1">
                  <Image
                    alt="Transistor"
                    src="https://tailwindui.com/img/logos/transistor-logo-gray-400.svg"
                    className="h-12"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="col-span-2 flex justify-center md:col-span-2 md:col-start-4 lg:col-span-1">
                  <Image
                    alt="Workcation"
                    src="https://tailwindui.com/img/logos/workcation-logo-gray-400.svg"
                    className="h-12"
                    width={48}
                    height={48}
                  />
                </div>
              </div>
            </div>
          </div>
    </>
  )
}
