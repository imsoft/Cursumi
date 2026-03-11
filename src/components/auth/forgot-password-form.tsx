"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { useState } from "react";
import Link from "next/link";
import { forgetPassword } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: createZodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setError(null);
      
      // Usar el cliente de Better Auth para solicitar reset de contraseña
      const result = await forgetPassword.email({
        email: values.email,
      });

      if (result.error) {
        setError(result.error.message || "Error al enviar el correo de recuperación");
        return;
      }

      // Si fue exitoso, mostrar mensaje de confirmación
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error al solicitar reset:", err);
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md border border-border bg-card/90 shadow-2xl">
        <CardHeader className="flex flex-col gap-2 px-6 pt-6">
          <CardTitle className="text-3xl font-bold text-foreground">
            Correo enviado
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Revisa tu correo y sigue el enlace para restablecer tu contraseña.
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Revisa tu bandeja de entrada y sigue las instrucciones del correo. 
              Si no lo encuentras, revisa tu carpeta de spam.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-border bg-card/90 shadow-2xl">
      <CardHeader className="flex flex-col gap-2 px-6 pt-6">
        <CardTitle className="text-3xl font-bold text-foreground">
          ¿Olvidaste tu contraseña?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ingresa tu correo y te enviamos un enlace para restablecer tu contraseña.
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="hola@cursumi.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="text-primary underline">
              Iniciar sesión
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

