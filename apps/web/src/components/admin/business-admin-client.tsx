"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";

interface QuoteRequest {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  companySize: string | null;
  interests: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface OrgRow {
  id: string;
  name: string;
  contactEmail: string;
  members: number;
  courseAccess: number;
  subscription: {
    status: string;
    maxSeats: number;
    amountCents: number | null;
    billingInterval: string | null;
  } | null;
}

interface CourseOption {
  id: string;
  title: string;
}

const statusLabels: Record<string, string> = {
  new: "Nueva",
  contacted: "Contactada",
  converted: "Convertida",
  closed: "Cerrada",
  pending: "Pendiente de pago",
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  trialing: "Prueba",
};

function money(cents: number | null, interval: string | null) {
  if (cents == null) return "—";
  const v = (cents / 100).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
  return interval === "year" ? `${v} / año` : `${v} / mes`;
}

export function BusinessAdminClient({
  initialRequests,
  organizations,
  courses,
}: {
  initialRequests: QuoteRequest[];
  organizations: OrgRow[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);

  // ── Formulario de provisión ──────────────────────────────────────────
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [maxSeats, setMaxSeats] = useState("");
  const [amount, setAmount] = useState("");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [fromRequestId, setFromRequestId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ inviteToken: string | null; ownerHadAccount: boolean } | null>(null);

  function prefillFromRequest(r: QuoteRequest) {
    setName(r.companyName);
    setContactEmail(r.contactEmail);
    setOwnerEmail(r.contactEmail);
    setContactPhone(r.contactPhone ?? "");
    setFromRequestId(r.id);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleCourse(id: string) {
    setCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function updateRequestStatus(id: string, status: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/business/quote-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  async function handleProvision(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const seats = Number.parseInt(maxSeats, 10);
    const amt = Number.parseFloat(amount);
    if (!name.trim() || !contactEmail.trim() || !ownerEmail.trim()) {
      setError("Empresa, email de contacto y email del dueño son obligatorios.");
      return;
    }
    if (!Number.isFinite(seats) || seats <= 0) {
      setError("Indica un número de asientos válido.");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Indica el monto acordado.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/business/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || null,
          ownerEmail: ownerEmail.trim(),
          maxSeats: seats,
          amount: amt,
          billingInterval,
          courseIds,
          quoteRequestId: fromRequestId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo provisionar la organización.");
        return;
      }
      setResult({ inviteToken: data.inviteToken, ownerHadAccount: data.ownerHadAccount });
      // Limpiar formulario
      setName("");
      setContactEmail("");
      setOwnerEmail("");
      setContactPhone("");
      setMaxSeats("");
      setAmount("");
      setCourseIds([]);
      setFromRequestId(null);
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Empresas"
        description="Cotizaciones y provisión de cuentas empresariales"
      />

      {/* ── Provisionar organización ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provisionar organización</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProvision} className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre de la empresa" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Email de contacto"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              label="Email del dueño"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              hint="Si ya tiene cuenta, se vuelve dueño; si no, se crea una invitación."
            />
            <Input label="Teléfono (opcional)" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            <Input
              label="Asientos (empleados)"
              type="number"
              value={maxSeats}
              onChange={(e) => setMaxSeats(e.target.value)}
            />
            <Input
              label="Monto acordado (MXN)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              hint="Monto por periodo de cobro."
            />

            <div className="flex w-full flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Intervalo de cobro</label>
              <Combobox
                options={[
                  { value: "month", label: "Mensual" },
                  { value: "year", label: "Anual" },
                ]}
                value={billingInterval}
                onValueChange={(v) => { if (v) setBillingInterval(v as "month" | "year"); }}
                placeholder="Intervalo"
                searchable={false}
                allowDeselect={false}
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Cursos incluidos ({courseIds.length})
              </label>
              <div className="grid max-h-48 gap-1 overflow-y-auto rounded-md border border-input p-3 sm:grid-cols-2">
                {courses.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay cursos publicados.</p>
                )}
                {courses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={courseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                    />
                    {c.title}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}
            {result && (
              <div className="sm:col-span-2 rounded-md border border-green-600/30 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30">
                Organización provisionada (suscripción pendiente de pago).{" "}
                {result.ownerHadAccount
                  ? "El dueño ya tiene cuenta y puede entrar a pagar."
                  : "El dueño no tenía cuenta: se creó una invitación."}
                {result.inviteToken && (
                  <div className="mt-1 break-all">
                    Link de invitación: <code>/business/invite/{result.inviteToken}</code>
                  </div>
                )}
              </div>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Provisionando..." : "Provisionar organización"}
              </Button>
              {fromRequestId && (
                <span className="ml-3 text-xs text-muted-foreground">
                  Desde solicitud de cotización
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Solicitudes de cotización ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitudes de cotización</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay solicitudes.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((r) => (
                <div key={r.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{r.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.contactName} · {r.contactEmail}
                        {r.contactPhone ? ` · ${r.contactPhone}` : ""}
                      </p>
                    </div>
                    <Badge variant={r.status === "new" ? "default" : "outline"}>
                      {statusLabels[r.status] ?? r.status}
                    </Badge>
                  </div>
                  {(r.companySize || r.interests || r.message) && (
                    <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                      {r.companySize && <span>Tamaño: {r.companySize}</span>}
                      {r.interests && <span>Interés: {r.interests}</span>}
                      {r.message && <span>Mensaje: {r.message}</span>}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => prefillFromRequest(r)}>
                      Provisionar
                    </Button>
                    {r.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => updateRequestStatus(r.id, "contacted")}>
                        Marcar contactada
                      </Button>
                    )}
                    {r.status !== "closed" && r.status !== "converted" && (
                      <Button size="sm" variant="outline" onClick={() => updateRequestStatus(r.id, "closed")}>
                        Cerrar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Organizaciones ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay organizaciones.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {organizations.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                  <div>
                    <p className="font-semibold">{o.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {o.members} miembros · {o.courseAccess} cursos ·{" "}
                      {money(o.subscription?.amountCents ?? null, o.subscription?.billingInterval ?? null)}
                    </p>
                  </div>
                  <Badge variant={o.subscription?.status === "active" ? "default" : "outline"}>
                    {o.subscription ? statusLabels[o.subscription.status] ?? o.subscription.status : "Sin suscripción"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
