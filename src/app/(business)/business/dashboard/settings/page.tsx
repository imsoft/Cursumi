"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  logoUrl: string | null;
}

export default function BusinessSettingsPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetch("/api/business/organizations")
      .then((r) => r.json())
      .then((d) => {
        const o = d.organization;
        setOrg(o);
        setName(o.name);
        setContactEmail(o.contactEmail);
        setContactPhone(o.contactPhone || "");
        setAddress(o.address || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/business/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contactEmail, contactPhone: contactPhone || null, address: address || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrg(data.organization);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configuración" description="Ajustes de tu organización" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la organización</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-lg">
            <Input
              label="Nombre de la empresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email de contacto"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              label="Teléfono (opcional)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <Input
              label="Dirección (opcional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
              {saved && <span className="text-sm text-green-600">Guardado</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identificador</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Slug: <code className="rounded bg-muted px-2 py-0.5">{org?.slug}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
