"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Lock } from "lucide-react";

const nameSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type NameValues = z.infer<typeof nameSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function SettingsForm() {
  const { data: session } = authClient.useSession();
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const nameForm = useForm<NameValues>({
    resolver: createZodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (session?.user?.name) {
      nameForm.reset({ name: session.user.name });
    }
  }, [session?.user?.name, nameForm]);

  const passwordForm = useForm<PasswordValues>({
    resolver: createZodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSaveName = async (values: NameValues) => {
    setNameError(null);
    setNameSuccess(false);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: values.name }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el nombre");
      setNameSuccess(true);
      nameForm.reset({ name: values.name });
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const onChangePassword = async (values: PasswordValues) => {
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const result = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: false,
      });
      if (result.error) {
        const msg = result.error.message || "Error al cambiar la contraseña";
        throw new Error(
          msg.includes("Invalid") || msg.includes("incorrect")
            ? "La contraseña actual es incorrecta"
            : msg
        );
      }
      setPasswordSuccess(true);
      passwordForm.reset();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Nombre
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Cómo aparecerás en la plataforma.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={nameForm.handleSubmit(onSaveName)} className="space-y-4">
            <div>
              <Input
                label="Nombre completo"
                {...nameForm.register("name")}
              />
              {nameForm.formState.errors.name && (
                <p className="mt-1 text-xs text-destructive">
                  {nameForm.formState.errors.name.message}
                </p>
              )}
            </div>
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
            {nameSuccess && (
              <p className="text-sm text-green-600">Nombre actualizado correctamente.</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={nameForm.formState.isSubmitting}>
                {nameForm.formState.isSubmitting ? "Guardando..." : "Guardar nombre"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Contraseña
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Cambia tu contraseña de acceso cuando quieras.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <Input
                label="Contraseña actual"
                type="password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="mt-1 text-xs text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <Input
                label="Nueva contraseña"
                type="password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <Input
                label="Confirmar nueva contraseña"
                type="password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-sm text-green-600">Contraseña actualizada correctamente.</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
