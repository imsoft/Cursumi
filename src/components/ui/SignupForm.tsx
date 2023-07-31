'use client';

import { useState } from "react";
import Link from "next/link";
import { Resolver, useForm } from "react-hook-form";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { emailValidation } from "@/utils";

type FormData = {
  name: string;
  surname: string;
  email: string;
  password: string;
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
      : values.name.length < 2
      ? {
          name: {
            type: "required",
            message: "El nombre debe de ser de dos caracteres o más.",
          },
        }
      : !values.surname
      ? {
          surname: {
            type: "required",
            message: "El campo apellido es requerido.",
          },
        }
      : values.surname.length < 2
      ? {
          surname: {
            type: "required",
            message: "El apellido debe de ser de dos caracteres o más.",
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
      : !values.password
      ? {
          password: {
            type: "required",
            message: "El campo contraseña es requerido.",
          },
        }
      : values.password.length < 6
      ? {
          password: {
            type: "required",
            message: "La contraseña debe de ser de seis caracteres o más.",
          },
        }
      : {},
  };
};

export const SignupForm = () => {
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver });

  const onRegisterUser = async ({
    name,
    surname,
    email,
    password,
  }: FormData) => {
    setShowError(false);
    console.log(name, surname, email, password);
  };

  return (
    <>
      <form
        className="space-y-6"
        onSubmit={handleSubmit(onRegisterUser)}
        noValidate
      >
        <div>
          <label
            htmlFor="TxtNombre"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Nombre
          </label>
          <div className="relative rounded-md shadow-sm">
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
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Apellidos
          </label>
          <div className="relative rounded-md shadow-sm">
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

        <div>
          <label
            htmlFor="TxtCorreoElectronico"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Correo electrónico
          </label>
          <div className="relative rounded-md shadow-sm">
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
            {errors?.email && (
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

        <div>
          <label
            htmlFor="TxtContraseña"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Contraseña
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="password"
              id="TxtContraseña"
              autoComplete="off"
              className={`${
                errors?.password
                  ? "block mt-1 w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                  : "block mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
              }`}
              {...register("password")}
            />
            {errors?.password && (
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
          {errors?.password && (
            <>
              <p className="mt-2 text-sm text-red-600" id="email-error">
                {errors.password.message}
              </p>
            </>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Registrarme
          </button>
        </div>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={"/iniciar-sesion"}
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Inicia sesión
          </Link>
        </p>
      </form>

      <div className={`relative mt-4 ${showError || "invisible"}`}>
        <div className="pointer-events-none absolute flex items-center">
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
          <p className="ml-2 text-sm leading-6 text-red-600">
            No reconocemos ese usuario / contraseña.
          </p>
        </div>
      </div>
    </>
  );
};
