"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Camera } from "lucide-react";
import type { ProfileData } from "@/lib/profile-service";

const profileSchema = z.object({
  fullName: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().min(10, "La biografía debe tener al menos 10 caracteres").optional(),
  website: z.union([z.string().url("Ingresa una URL válida"), z.literal("")]).optional(),
  linkedinUrl: z.union([z.string().url("Ingresa una URL válida"), z.literal("")]).optional(),
  instagramUrl: z.union([z.string().url("Ingresa una URL válida"), z.literal("")]).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfilePageClientProps {
  initialProfile: ProfileData;
  /** Si false, no se muestra el PageHeader (p. ej. cuando se usa dentro de Cuenta) */
  showHeader?: boolean;
}

export function ProfilePageClient({ initialProfile, showHeader = true }: ProfilePageClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const avatar = reader.result as string;
        const res = await fetch("/api/me/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar }),
        });
        if (!res.ok) throw new Error("No pudimos actualizar tu foto");
        setProfile((prev) => ({ ...prev, avatar }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir la foto");
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };
  const form = useForm<ProfileFormValues>({
    resolver: createZodResolver(profileSchema),
    defaultValues: {
      fullName: initialProfile.fullName,
      email: initialProfile.email,
      phone: "",
      city: "",
      bio: "",
      website: "",
      linkedinUrl: "",
      instagramUrl: "",
    },
  });
  const initials =
    profile.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setError(null);
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: values.fullName, email: values.email }),
      });
      if (!res.ok) {
        throw new Error("No pudimos actualizar tu perfil");
      }
      setProfile((prev) => ({
        ...prev,
        fullName: values.fullName,
        email: values.email,
      }));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el perfil");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {showHeader && (
        <PageHeader
          title="Mi perfil"
          description="Gestiona tu información personal y preferencias de cuenta."
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-col items-center gap-4 pb-4">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.fullName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                    {initials}
                  </div>
                )}
              </Avatar>
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
              </label>
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <span className="text-xs font-medium text-white">Subiendo...</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">{profile.fullName || "Estudiante"}</h3>
              <p className="text-sm text-muted-foreground">Estudiante</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">
                {profile.joinDate ? `Miembro desde ${new Date(profile.joinDate).toLocaleDateString("es-MX")}` : "Miembro"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{profile.coursesCompleted}</p>
                <p className="text-xs text-muted-foreground">Cursos completados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{profile.coursesInProgress}</p>
                <p className="text-xs text-muted-foreground">Cursos en progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información personal</CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Editar perfil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    label="Nombre completo"
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    label="Teléfono"
                    disabled={!isEditing}
                    {...form.register("phone")}
                  />
                  {form.formState.errors.phone && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    label="Ciudad"
                    disabled={!isEditing}
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Textarea
                  label="Biografía"
                  rows={4}
                  disabled={!isEditing}
                  {...form.register("bio")}
                />
                {form.formState.errors.bio && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">Enlaces y redes sociales</h3>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Sitio web"
                      disabled={!isEditing}
                      {...form.register("website")}
                    />
                    {form.formState.errors.website && (
                      <p className="mt-1 text-xs text-destructive">
                        {form.formState.errors.website.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Input
                        label="LinkedIn"
                        disabled={!isEditing}
                        {...form.register("linkedinUrl")}
                      />
                      {form.formState.errors.linkedinUrl && (
                        <p className="mt-1 text-xs text-destructive">
                          {form.formState.errors.linkedinUrl.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        label="Instagram"
                        disabled={!isEditing}
                        {...form.register("instagramUrl")}
                      />
                      {form.formState.errors.instagramUrl && (
                        <p className="mt-1 text-xs text-destructive">
                          {form.formState.errors.instagramUrl.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
