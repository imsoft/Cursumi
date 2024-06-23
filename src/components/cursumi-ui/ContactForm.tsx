"use client";

import Link from "next/link";
import { Resolver, useForm } from "react-hook-form";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { emailValidation } from "@/utils";
import { sendEmail } from "@/lib";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  surname: string;
  email: string;
  message: string;
};

const resolver: Resolver<FormData> = async (values) => {
  return {
    values,
    errors: !values.name
      ? {
          name: {
            type: "required",
            message: "El campo nombre es requerido.",
          },
        }
      : !values.surname
      ? {
          surname: {
            type: "required",
            message: "El campo apellido es requerido.",
          },
        }
      : !values.email
      ? {
          email: {
            type: "required",
            message: "El campo correo electrónico es requerido.",
          },
        }
      : !emailValidation.isValidEmail(values.email)
      ? {
          email: {
            type: "pattern",
            message: "Correo electrónico no valido.",
          },
        }
      : !values.message
      ? {
          message: {
            type: "required",
            message: "El campo mensaje es requerido.",
          },
        }
      : {},
  };
};

export const ContactForm = () => {

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver });

  const onSend = async ({ name, surname, email, message }: FormData) => {
    console.log(
      `Nombre: ${name}, Apellido: ${surname}, Correo electrónico: ${email}, mensaje: ${message}`
    );

    try {
      await sendEmail(name, surname, email, message);
      router.push("/confirmMessage");
    } catch (error) {
      console.warn(error);
      router.push("/errorMessage");
      throw new Error("Hubo un error al enviar tu mensaje...");
    }
  };

  return (
    <>
      <form className="lg:flex-auto" onSubmit={handleSubmit(onSend)}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="TxtNombre"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Nombre
            </label>
            <div className="relative rounded-md shadow-sm mt-2.5">
              <input
                type="text"
                id="TxtNombre"
                autoComplete="off"
                className={`${
                  errors?.name
                    ? "block mt-1 w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                    : "block mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                }`}
                {...register("name")}
              />
              {errors?.name && (
                <>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                </>
              )}
            </div>
            {errors?.name && (
              <>
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors.name.message}
                </p>
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="TxtApellidos"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Apellidos
            </label>
            <div className="relative rounded-md shadow-sm mt-2.5">
              <input
                type="text"
                id="TxtApellidos"
                autoComplete="off"
                className={`${
                  errors?.surname
                    ? "block mt-1 w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                    : "block mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                }`}
                {...register("surname")}
              />
              {errors?.surname && (
                <>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                </>
              )}
            </div>
            {errors?.surname && (
              <>
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors.surname.message}
                </p>
              </>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="TxtCorreoElectronico"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Correo electrónico
            </label>
            <div className="relative rounded-md shadow-sm mt-2.5">
              <input
                type="email"
                id="TxtCorreoElectronico"
                autoComplete="off"
                className={`${
                  errors?.email
                    ? "block mt-1 w-full rounded-md border-0 py-1.5 px-3 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                    : "block mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                }`}
                {...register("email")}
              />
              {errors?.email && errors?.email.type === "pattern" && (
                <>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                </>
              )}
            </div>
            {errors?.email && (
              <>
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors.email.message}
                </p>
              </>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="TxtMensaje"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Mensaje
            </label>
            <div className="relative rounded-md shadow-sm mt-2.5">
              <textarea
                id="TxtMensaje"
                autoComplete="off"
                rows={4}
                className={`${
                  errors?.message
                    ? "block mt-1 w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                    : "block mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                }`}
                {...register("message")}
              />
              {errors?.message && (
                <>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                </>
              )}
            </div>
            {errors?.message && (
              <>
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors.message.message}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            ¡Hablemos!
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-gray-500">
          Al enviar este formulario, acepto las{" "}
          <Link href="/privacy-notice" className="font-semibold text-indigo-600">
            politicas&nbsp;de&nbsp;privacidad
          </Link>
          .
        </p>
      </form>
    </>
  );
};
