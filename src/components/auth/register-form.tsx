"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signUp, signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "El nombre es obligatorio"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma tu contraseña"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  returnUrl?: string;
}

export const RegisterForm = ({ returnUrl }: RegisterFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: createZodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setError(null);
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.fullName,
      });

      if (result.error) {
        setError(result.error.message || "Error al crear la cuenta");
        return;
      }

      // Si el registro fue exitoso, redirigir a la página de verificación de email
      const params = new URLSearchParams({ email: values.email });
      if (returnUrl && returnUrl.startsWith("/")) params.set("returnUrl", returnUrl);
      router.push(`/verify-email-sent?${params.toString()}`);
    } catch {
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    }
  };

  return (
    <Card className="w-full max-w-md border border-border bg-card/90 shadow-2xl">
      <CardHeader className="flex flex-col gap-2 px-6 pt-6">
        <CardTitle className="text-3xl font-bold text-foreground">Crear cuenta</CardTitle>
        <p className="text-sm text-muted-foreground">
          {returnUrl && returnUrl.startsWith("/")
            ? "Después de verificar tu correo podrás volver al curso."
            : "Únete a Cursumi y empieza a aprender o enseñar en minutos."}
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Nombre completo"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>
          <div>
            <Input
              label="Correo electrónico"
              type="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <PasswordInput
              label="Contraseña"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <div>
            <PasswordInput
              label="Confirmar contraseña"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
              {...form.register("acceptTerms")}
            />
            <span>
              Acepto los <a href="/terminos" className="text-primary underline">Términos y Condiciones</a> y el{" "}
              <a href="/privacidad" className="text-primary underline">Aviso de Privacidad</a>.
            </span>
          </label>
          {form.formState.errors.acceptTerms && (
            <p className="text-xs text-destructive">{form.formState.errors.acceptTerms.message}</p>
          )}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-primary underline">
            Iniciar sesión
          </Link>
        </div>
        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="flex-1 h-px bg-border" />
          o regístrate con
          <span className="flex-1 h-px bg-border" />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={async () => {
              try {
                await signIn.social({
                  provider: "google",
                });
              } catch (error) {
                console.error("Error al registrarse con Google:", error);
                setError("Error al registrarse con Google. Por favor, intenta de nuevo.");
              }
            }}
          >
            <Image
              src="/logos/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Continuar con Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
