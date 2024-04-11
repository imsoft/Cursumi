import Image from "next/image";
import { ContactForm } from "@/components";

const ContactPage = () => {
  return (
    <>
      <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-xl lg:max-w-4xl">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            ¿Quieres dar clases o mandarnos un mensaje?
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Contactanos para que inicies a promocionar tu curso o para mandarnos
            algun mensaje.
          </p>
          <div className="mt-16 flex flex-col gap-16 sm:gap-y-20 lg:flex-row">
            <ContactForm />
            <div className="lg:mt-6 lg:w-80 lg:flex-none">
              <Image
                className="h-12 w-auto"
                src="/cursumi.png"
                alt="Cursumi"
                width={500}
                height={500}
              />
              <figure className="mt-10">
                <blockquote className="text-lg font-semibold leading-8 text-gray-900">
                  <p>
                    “Me da gusto poderle dar platafroma a esas personas expertas
                    en algun tema y que les apasiona el compartir sus
                    conocimientos y sobre todo poder tener una comunidad
                    completa de personas que tienen el hambre de aprender.”
                  </p>
                </blockquote>
                <figcaption className="mt-10 flex gap-x-6">
                  {/* <Image
                      src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=96&h=96&q=80"
                      alt=""
                      className="h-12 w-12 flex-none rounded-full bg-gray-50"
                      width={500}
                      height={500}
                    /> */}
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      Brandon García
                    </div>
                    <div className="text-sm leading-6 text-gray-600">
                      CEO de Cursumi
                    </div>
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
