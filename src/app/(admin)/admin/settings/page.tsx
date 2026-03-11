"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Bell, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Configuración general de la plataforma"
      />

      <div className="grid gap-6 md:grid-cols-2">
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
              <Input id="support-email" type="email" defaultValue="soporte@cursumi.com" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}

