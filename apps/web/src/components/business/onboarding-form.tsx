"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  defaultEmail: string;
}

export function OnboardingForm({ defaultEmail }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !contactEmail.trim()) {
      setError("El nombre de la empresa y el email de contacto son obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/business/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || null,
          address: address.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo crear la organización. Inténtalo de nuevo.");
        return;
      }

      // Empresa creada (el usuario queda como owner) → elegir plan.
      router.push("/business/dashboard/subscription?welcome=1");
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos de tu empresa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre de la empresa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            hint="Así aparecerá tu organización en Cursumi."
            autoFocus
          />
          <Input
            label="Email de contacto"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            hint="Para facturación y avisos de la cuenta empresarial."
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear empresa y elegir plan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
