"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, PlusCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { DatePickerField } from "@/components/ui/date-picker";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountPct: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const schema = z.object({
  code: z.string().min(3, "Mínimo 3 caracteres").max(20),
  description: z.string().optional(),
  discountPct: z.coerce.number().int().min(1).max(100),
  maxUses: z.coerce.number().int().positive().optional().or(z.literal("")),
  expiresAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [loading, setLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<FormValues>({
    resolver: createZodResolver(schema),
    defaultValues: { code: "", description: "", discountPct: 10, maxUses: "", expiresAt: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: values.code.toUpperCase(),
        description: values.description || undefined,
        discountPct: values.discountPct,
        maxUses: values.maxUses ? Number(values.maxUses) : null,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setCoupons((prev) => [created, ...prev]);
      form.reset();
      setShowForm(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    setLoading(id);
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: updated.active } : c)));
    }
    setLoading(null);
  };

  const deleteCoupon = async (id: string) => {
    setLoading(id);
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Cupones de descuento" description={`${coupons.length} cupón${coupons.length !== 1 ? "es" : ""} creado${coupons.length !== 1 ? "s" : ""}`} />
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nuevo cupón
        </Button>
      </div>

      {showForm && (
        <Card className="border border-border bg-card/90">
          <CardHeader><CardTitle>Crear cupón</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input label="Código (ej. PROMO20)" {...form.register("code")} />
                {form.formState.errors.code && <p className="text-xs text-destructive mt-1">{form.formState.errors.code.message}</p>}
              </div>
              <div>
                <Input label="Descripción (opcional)" {...form.register("description")} />
              </div>
              <div>
                <Input label="Descuento (%)" type="number" min={1} max={100} {...form.register("discountPct")} />
                {form.formState.errors.discountPct && <p className="text-xs text-destructive mt-1">{form.formState.errors.discountPct.message}</p>}
              </div>
              <div>
                <Input label="Máximo de usos (vacío = ilimitado)" type="number" min={1} {...form.register("maxUses")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Fecha de expiración (opcional)
                </label>
                <DatePickerField
                  value={form.watch("expiresAt") || ""}
                  onChange={(v) => form.setValue("expiresAt", v, { shouldValidate: true })}
                  placeholder="Sin expiración"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creando..." : "Crear cupón"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="border border-border bg-card/90">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-lg font-bold">{coupon.code}</span>
                    <Badge variant={coupon.active ? "default" : "outline"}>
                      {coupon.active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="outline">{coupon.discountPct}% off</Badge>
                  </div>
                  {coupon.description && <p className="text-sm text-muted-foreground">{coupon.description}</p>}
                  <p className="text-xs text-muted-foreground">
                    Usos: {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                    {coupon.expiresAt && ` · Expira: ${new Date(coupon.expiresAt).toLocaleDateString("es-MX")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(coupon.id, coupon.active)}
                    disabled={loading === coupon.id}
                    className="gap-1"
                  >
                    {coupon.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {coupon.active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCoupon(coupon.id)}
                    disabled={loading === coupon.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {coupons.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No hay cupones. Crea el primero.</p>
        )}
      </div>
    </div>
  );
}
