"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token?: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: createZodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("Token de recuperación no válido");
      return;
    }

    try {
      setError(null);
      
      // Usar el cliente de Better Auth para resetear la contraseña
      const result = await resetPassword.email({
        password: values.password,
        token,
      });

      if (result.error) {
        setError(result.error.message || "Error al restablecer la contraseña");
        return;
      }

      // Si fue exitoso, mostrar mensaje de éxito
      setIsSuccess(true);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Error al resetear contraseña:", err);
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md border border-border bg-card/90 shadow-2xl">
        <CardHeader className="flex flex-col gap-2 px-6 pt-6">
          <CardTitle className="text-3xl font-bold text-foreground text-destructive">
            Token inválido
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            El enlace de recuperación no es válido o ha expirado.
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Solicitar nuevo enlace</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border border-border bg-card/90 shadow-2xl">
        <CardHeader className="flex flex-col gap-2 px-6 pt-6">
          <CardTitle className="text-3xl font-bold text-foreground text-green-600">
            ¡Contraseña restablecida!
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión.
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Button asChild className="w-full">
            <Link href="/login">Ir al inicio de sesión</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-border bg-card/90 shadow-2xl">
      <CardHeader className="flex flex-col gap-2 px-6 pt-6">
        <CardTitle className="text-3xl font-bold text-foreground">
          Restablecer contraseña
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ingresa tu nueva contraseña. Asegúrate de que tenga al menos 6 caracteres.
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <PasswordInput
              label="Nueva contraseña"
              placeholder="••••••••"
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
              label="Confirmar nueva contraseña"
              placeholder="••••••••"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
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
            {form.formState.isSubmitting ? "Restableciendo..." : "Restablecer contraseña"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

