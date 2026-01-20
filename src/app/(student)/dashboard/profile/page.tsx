"use client";

import { useEffect, useState } from "react";
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
import { Save } from "lucide-react";

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

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<{
    fullName: string;
    email: string;
    joinDate: string;
    avatar: string | null;
    coursesCompleted: number;
    coursesInProgress: number;
  }>({
    fullName: "",
    email: "",
    joinDate: "",
    avatar: null,
    coursesCompleted: 0,
    coursesInProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ProfileFormValues>({
    resolver: createZodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me/profile", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No pudimos cargar tu perfil");
        }
        const data = await res.json();
        setProfile({
          fullName: data.fullName || "",
          email: data.email || "",
          joinDate: data.joinDate || "",
          avatar: data.avatar || null,
          coursesCompleted: data.coursesCompleted || 0,
          coursesInProgress: data.coursesInProgress || 0,
        });
        form.reset({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: "",
          city: "",
          bio: "",
          website: "",
          linkedinUrl: "",
          instagramUrl: "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [form]);

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
      <PageHeader
        title="Mi perfil"
        description="Gestiona tu información personal y preferencias de cuenta."
      />
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Resumen del perfil */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-col items-center gap-4 pb-4">
            <Avatar className="h-24 w-24">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {initials}
              </div>
            </Avatar>
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

        {/* Formulario de edición */}
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
                    placeholder="Tu nombre completo"
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
                    placeholder="tu@email.com"
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
                    placeholder="+52 55 1234 5678"
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
                    placeholder="Ciudad de México"
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
                  placeholder="Cuéntanos sobre ti..."
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
                      placeholder="https://tu-sitio.com"
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
                        placeholder="https://linkedin.com/in/tu-perfil"
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
                        placeholder="https://instagram.com/tu-perfil"
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
