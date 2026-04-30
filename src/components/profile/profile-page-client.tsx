"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";
import type { ProfileData } from "@/lib/profile-service";
import { UserAvatarUpload } from "@/components/profile/user-avatar-upload";
import { MexicoStateCityFields } from "@/components/location/mexico-state-city-fields";
import { findStateForMunicipality } from "@/lib/mexico-location-helpers";

const profileSchema = z.object({
  fullName: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
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
  const searchParams = useSearchParams();
  const focusField = searchParams.get("focus");
  const focusHandled = useRef(false);

  useEffect(() => {
    if (focusField && !focusHandled.current) {
      focusHandled.current = true;
      setIsEditing(true);
      // Wait for DOM to update after enabling editing
      setTimeout(() => {
        const el = document.getElementById(`profile-${focusField}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.focus();
          }
        }
      }, 200);
    }
  }, [focusField]);

  const form = useForm<ProfileFormValues>({
    resolver: createZodResolver(profileSchema),
    defaultValues: {
      fullName: initialProfile.fullName,
      email: initialProfile.email,
      phone: initialProfile.phone || "",
      state: initialProfile.state || "",
      city: initialProfile.city || "",
      bio: initialProfile.bio || "",
      website: initialProfile.website || "",
      linkedinUrl: initialProfile.linkedinUrl || "",
      instagramUrl: initialProfile.instagramUrl || "",
    },
  });

  useEffect(() => {
    if (!(initialProfile.state ?? "").trim() && (initialProfile.city ?? "").trim()) {
      const inferred = findStateForMunicipality(initialProfile.city);
      if (inferred) form.setValue("state", inferred);
    }
  }, [initialProfile.state, initialProfile.city, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setError(null);
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error("No pudimos actualizar tu perfil");
      }
      setProfile((prev) => ({
        ...prev,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || "",
        state: values.state || "",
        city: values.city || "",
        bio: values.bio || "",
        website: values.website || "",
        linkedinUrl: values.linkedinUrl || "",
        instagramUrl: values.instagramUrl || "",
      }));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el perfil");
    }
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <PageHeader
          title="Mi perfil"
          description="Gestiona tu información personal y preferencias de cuenta."
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader id="profile-image" className="flex flex-col items-center gap-4 pb-4">
            <UserAvatarUpload
              name={profile.fullName}
              avatarUrl={profile.avatar}
              onUploaded={(url) => setProfile((prev) => ({ ...prev, avatar: url }))}
            />
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
                    id="profile-fullName"
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
                    id="profile-phone"
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
              </div>
              <MexicoStateCityFields
                state={form.watch("state") ?? ""}
                city={form.watch("city") ?? ""}
                onStateChange={(v) => form.setValue("state", v, { shouldValidate: true })}
                onCityChange={(v) => form.setValue("city", v, { shouldValidate: true })}
                disabled={!isEditing}
                stateLabel="Estado"
                cityLabel="Ciudad o municipio"
              />

              <div>
                <Textarea
                  id="profile-bio"
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
                      id="profile-website"
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
                        id="profile-linkedinUrl"
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
                        id="profile-instagramUrl"
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
