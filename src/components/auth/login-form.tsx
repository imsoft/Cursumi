"use client";

import { useForm, type FieldErrorsImpl, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

const loginSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const loginResolver: Resolver<LoginFormValues> = async (values) => {
  const result = loginSchema.safeParse(values);

  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const flattened = result.error.flatten();
  const fieldErrors = Object.entries(flattened.fieldErrors).reduce<
    FieldErrorsImpl<LoginFormValues>
  >((acc, [field, errors]) => {
    const message = errors?.[0];
    if (!message) {
      return acc;
    }

    acc[field as keyof LoginFormValues] = {
      type: "manual",
      message,
    };

    return acc;
  }, {});

  return {
    values: {},
    errors: fieldErrors,
  };
};

interface LoginFormProps {
  returnUrl?: string;
  /** Solo true si el servidor tiene GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET */
  googleAuthEnabled?: boolean;
}

export const LoginForm = ({ returnUrl, googleAuthEnabled = false }: LoginFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: loginResolver,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError(null);
      form.setError("root", { message: "" }); // Limpiar errores previos
      
      const result = await signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe || false,
      });

      if (result.error) {
        // Mensaje genérico deliberado: nunca revelar si el email existe o no.
        // El servidor ya normaliza los códigos de error (ver auth.ts hooks.after),
        // pero esta es la segunda línea de defensa en el cliente.
        setError("Correo o contraseña incorrectos.");
        return;
      }

      // Si el login fue exitoso, redirigir (returnUrl si es ruta segura)
      if (result.data) {
        const isSafe = returnUrl?.startsWith("/") && !returnUrl.startsWith("//") && !returnUrl.startsWith("/\\");
        const target = isSafe ? returnUrl! : "/dashboard";
        router.push(target);
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    }
  };

  return (
    <Card className="w-full max-w-md border border-border bg-card/80 shadow-xl">
      <CardHeader className="flex flex-col gap-2 px-6 pt-6">
        <CardTitle className="text-3xl font-bold text-foreground">Iniciar sesión</CardTitle>
        <p className="text-sm text-muted-foreground">
          {returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
            ? "Después de iniciar sesión volverás al curso."
            : "Accede a tu cuenta para continuar aprendiendo en Cursumi"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                {...form.register("rememberMe")}
              />
              Recordarme
            </label>
            <Link href="/forgot-password" className="text-primary underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Iniciando..." : "Iniciar sesión"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="text-primary underline">
              Crear cuenta
            </Link>
          </div>
        </form>
        {googleAuthEnabled && (
          <>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              o continúa con
              <span className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex w-full items-center justify-center gap-2"
                onClick={async () => {
                  try {
                    await signIn.social({
                      provider: "google",
                    });
                  } catch (error) {
                    console.error("Error al iniciar sesión con Google:", error);
                    setError("Error al iniciar sesión con Google. Por favor, intenta de nuevo.");
                  }
                }}
              >
                <Image src="/logos/google.svg" alt="Google" width={20} height={20} />
                Continuar con Google
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
