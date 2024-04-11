import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components";

const IniciarSesion = () => {
  return (
    <>
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <Image
                className="h-10 w-auto"
                src="/cursumi.png"
                alt="Cursumi"
                width={500}
                height={500}
              />
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                ¿Aún no estas registrado?{" "}
                <Link
                  href={"/signup"}
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Registrate
                </Link>
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
            alt=""
            width={500}
            height={500}
          />
        </div>
      </div>
    </>
  );
};

export default IniciarSesion;
