"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const sizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

export function QuoteRequestForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [interests, setInterests] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError("Empresa, nombre y correo son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/business/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || null,
          companySize: companySize || null,
          interests: interests.trim() || null,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo enviar tu solicitud. Inténtalo de nuevo.");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h2 className="text-xl font-bold text-foreground">¡Solicitud enviada!</h2>
          <p className="mt-2 text-muted-foreground">
            Gracias por tu interés. Nuestro equipo te contactará pronto con una
            cotización a la medida de tu empresa.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Solicita tu cotización</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre de la empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <Input label="Tu nombre" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <Input label="Correo de contacto" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          <Input label="Teléfono (opcional)" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />

          <div className="flex w-full flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Tamaño de la empresa</label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Selecciona…</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s} empleados
                </option>
              ))}
            </select>
          </div>

          <Input
            label="¿Cuántos cursos te interesan?"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            hint="Áreas o cursos específicos que buscas."
          />

          <div className="sm:col-span-2 flex w-full flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Mensaje (opcional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
