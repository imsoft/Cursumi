"use client";

import { emailValidation } from "@/utils";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Resolver, useForm } from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};

const resolver: Resolver<FormData> = async (values) => {
  return {
    values,
    errors: !values.email
      ? {
          email: {
            type: "required",
            message: "El campo de correo electrónico es requerido.",
          },
        }
      : !emailValidation.isValidEmail(values.email)
      ? {
          email: {
            type: "required",
            message:
              "El correo electrónico no tiene formato de correo electrónico.",
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

export const LoginForm = () => {
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver });

  const onLoginUser = async ({ email, password }: FormData) => {
    setShowError(false);
    console.log("onLoginUser");
  };

  return (
    <>
      <div className="mt-10">
        <div>
          <form
            onSubmit={handleSubmit(onLoginUser)}
            className="space-y-6"
            noValidate
          >
            <div>
              <label
                htmlFor="TxtEmail"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Correo electronico
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  id="TxtEmail"
                  type="email"
                  autoComplete="email"
                  required
                  className={`${
                    errors?.email
                      ? "block mt-1 w-full rounded-md border-0 py-1.5 px-4 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                      : "block w-full rounded-md border-0 py-1.5 px-4 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                htmlFor="TxtPassword"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Contraseña
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  id="TxtPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`${
                    errors?.password
                      ? "block mt-1 w-full rounded-md border-0 py-1.5 px-4 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                      : "block w-full rounded-md border-0 py-1.5 px-4 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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

            {/* <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="remember-me"
                          className="ml-3 block text-sm leading-6 text-gray-700"
                        >
                          Recuerdame
                        </label>
                      </div>

                      <div className="text-sm leading-6">
                        <Link
                          href="#"
                          className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                    </div> */}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Iniciar sesión
              </button>
            </div>
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
        </div>

        {/* <div className="mt-10">
                  <div className="relative">
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                      <span className="bg-white px-6 text-gray-900">
                        O continua con
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Link
                      href="#"
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#EA4335] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
                    >
                      <svg
                        className="h-5 w-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 488 512"
                      >
                        <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                      </svg>
                      <span className="text-sm font-semibold leading-6">
                        Google
                      </span>
                    </Link>

                    <Link
                      href="#"
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#1877F2] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                    >
                      <svg
                        className="h-5 w-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 22 22"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-semibold leading-6">
                        Facebook
                      </span>
                    </Link>

                    <Link
                      href="#"
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#1DA1F2] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                    >
                      <svg
                        className="h-5 w-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-semibold leading-6">
                        Twitter
                      </span>
                    </Link>

                    <Link
                      href="#"
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#0a66c2] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                    >
                      <svg
                        className="h-5 w-5 mt-0.5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 18 18"
                      >
                        <path
                          fillRule="evenodd"
                          d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-semibold leading-6">
                        LinkedIn
                      </span>
                    </Link>
                  </div>
                </div> */}
      </div>
    </>
  );
};
