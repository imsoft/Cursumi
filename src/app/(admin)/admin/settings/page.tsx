"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Bell, Globe, Share2, Loader2, CheckCircle2 } from "lucide-react";
import { SOCIAL_LINK_DEFAULTS, type SocialLink } from "@/lib/social-links-config";
import { SocialIcon } from "@/components/social-icon";
import { SignatureUpload } from "@/components/profile/signature-upload";

export default function AdminSettingsPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/signature")
      .then((r) => r.json())
      .then((data: { url: string | null }) => setSignatureUrl(data.url))
      .catch(() => {});
    fetch("/api/admin/social-links")
      .then((r) => r.json())
      .then((data: SocialLink[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSocialLinks(data);
        } else {
          setSocialLinks(SOCIAL_LINK_DEFAULTS);
        }
      })
      .catch(() => setSocialLinks(SOCIAL_LINK_DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: string) => {
    setSocialLinks((prev) =>
      prev.map((link) =>
        link.key === key ? { ...link, visible: !link.visible } : link
      )
    );
    setSaved(false);
  };

  const handleUrlChange = (key: string, url: string) => {
    setSocialLinks((prev) =>
      prev.map((link) => (link.key === key ? { ...link, url } : link))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialLinks),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Configuración general de la plataforma"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuración General */}
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Configuración básica de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Nombre de la plataforma</Label>
              <Input id="platform-name" defaultValue="Cursumi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-description">Descripción</Label>
              <Textarea
                id="platform-description"
                defaultValue="Plataforma de cursos virtuales y presenciales"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Email de soporte</Label>
              <Input id="support-email" type="email" defaultValue="cursumi.com@gmail.com" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura las notificaciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por email</Label>
                <p className="text-xs text-muted-foreground">
                  Enviar notificaciones importantes por correo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones de nuevos cursos</Label>
                <p className="text-xs text-muted-foreground">
                  Notificar cuando se publique un nuevo curso
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones de pagos</Label>
                <p className="text-xs text-muted-foreground">
                  Notificar sobre transacciones importantes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        {/* Firma digital del administrador */}
        <SignatureUpload
          signatureUrl={signatureUrl}
          onUploaded={(url) => setSignatureUrl(url)}
        />

        {/* Redes Sociales — ocupa ancho completo */}
        <Card className="border border-border bg-card/90 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Redes Sociales
                </CardTitle>
                <CardDescription className="mt-1">
                  Activa o desactiva las redes sociales que se mostrarán en el sitio. Puedes editar la URL de cada una.
                </CardDescription>
              </div>
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving ? "Guardando..." : saved ? "Guardado" : "Guardar redes"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <div
                    key={link.key}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                      link.visible
                        ? "border-border bg-card"
                        : "border-border/50 bg-muted/30 opacity-60"
                    }`}
                  >
                    <SocialIcon platform={link.key} className="h-6 w-6 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{link.label}</span>
                        {link.visible ? (
                          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                            Visible
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            Oculta
                          </span>
                        )}
                      </div>
                      <Input
                        value={link.url}
                        onChange={(e) => handleUrlChange(link.key, e.target.value)}
                        className="h-8 text-xs"
                        placeholder={`URL de ${link.label}`}
                      />
                    </div>
                    <Switch
                      checked={link.visible}
                      onCheckedChange={() => handleToggle(link.key)}
                      aria-label={`Mostrar ${link.label}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
