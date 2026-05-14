"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus, Trash2, Pencil, X, Check, Target, TrendingUp,
  ChevronDown, ChevronUp, Clock, CalendarClock, AlertTriangle,
} from "lucide-react";

interface KpiProgressEntry {
  id: string;
  kpiId: string;
  value: number;
  note: string | null;
  createdAt: string;
}

interface Kpi {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  targetValue: number;
  currentValue: number;
  period: string;
  category: string;
  deadline: string | null;
}

const PERIODS = ["diario", "semanal", "mensual", "trimestral", "anual"] as const;
const CATEGORIES = ["crecimiento", "ingresos", "engagement", "calidad", "general"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  crecimiento: "Crecimiento",
  ingresos: "Ingresos",
  engagement: "Engagement",
  calidad: "Calidad",
  general: "General",
};

const PERIOD_LABELS: Record<string, string> = {
  diario: "Diario",
  semanal: "Semanal",
  mensual: "Mensual",
  trimestral: "Trimestral",
  anual: "Anual",
};

const kpiSchema = z.object({
  name: z.string().min(1, "Requerido").max(100),
  description: z.string().max(500).optional(),
  unit: z.string().max(20).optional(),
  targetValue: z.coerce.number().positive("Debe ser mayor a 0"),
  currentValue: z.coerce.number().min(0).default(0),
  period: z.enum(PERIODS),
  category: z.enum(CATEGORIES),
  deadline: z.string().optional(),
});

function deadlineStatus(deadline: string | null): "overdue" | "soon" | "ok" | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff < 0) return "overdue";
  if (diff < 7 * 24 * 60 * 60 * 1000) return "soon";
  return "ok";
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const status = deadlineStatus(deadline);
  const label = new Date(deadline).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const cls =
    status === "overdue"
      ? "text-destructive border-destructive/40 bg-destructive/10"
      : status === "soon"
      ? "text-yellow-600 dark:text-yellow-400 border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/20"
      : "text-muted-foreground border-border bg-muted/30";
  const Icon = status === "overdue" ? AlertTriangle : CalendarClock;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {status === "overdue" ? "Vencido · " : "Límite · "}
      {label}
    </span>
  );
}

const progressSchema = z.object({
  value: z.coerce.number().positive("Ingresa un número mayor a 0"),
  note: z.string().max(500).optional(),
  type: z.enum(["avance", "correccion"]).default("avance"),
});

type KpiFormValues = z.infer<typeof kpiSchema>;
type ProgressFormValues = z.infer<typeof progressSchema>;

function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const color =
    pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-primary" : pct >= 30 ? "bg-yellow-500" : "bg-destructive";
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value.toLocaleString("es-MX")}</span>
        <span>{pct.toFixed(0)}%</span>
        <span>{target.toLocaleString("es-MX")}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Inline progress panel for one KPI ───────────────────────────────────────
function KpiProgressPanel({
  kpi,
  onProgressAdded,
}: {
  kpi: Kpi;
  onProgressAdded: (kpiId: string, delta: number) => void;
}) {
  const [entries, setEntries] = useState<KpiProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<ProgressFormValues>({
    resolver: createZodResolver(progressSchema),
    defaultValues: { value: undefined, note: "", type: "avance" },
  });

  const watchedType = form.watch("type");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kpis/${kpi.id}/progress`);
      if (res.ok) setEntries(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [kpi.id]);

  const onSubmit = async (values: ProgressFormValues) => {
    const delta = values.type === "correccion" ? -(values.value as number) : (values.value as number);
    const res = await fetch(`/api/admin/kpis/${kpi.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: delta, note: values.note }),
    });
    if (!res.ok) return;
    const entry: KpiProgressEntry = await res.json();
    setEntries((prev) => [entry, ...prev]);
    onProgressAdded(kpi.id, delta);
    form.reset({ value: undefined, note: "", type: "avance" });
    setShowForm(false);
  };

  const onDelete = async (entryId: string, delta: number) => {
    setDeletingId(entryId);
    const res = await fetch(`/api/admin/kpis/${kpi.id}/progress/${entryId}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      onProgressAdded(kpi.id, -delta);
    }
    setDeletingId(null);
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Add progress button / form */}
      {showForm ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3"
        >
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            Registrar avance
          </p>
          {/* Tipo: avance o corrección */}
          <div className="flex rounded-lg border border-input overflow-hidden text-xs font-medium w-fit">
            <button
              type="button"
              onClick={() => form.setValue("type", "avance")}
              className={`px-3 py-1.5 transition-colors ${
                watchedType === "avance"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              + Avance
            </button>
            <button
              type="button"
              onClick={() => form.setValue("type", "correccion")}
              className={`px-3 py-1.5 transition-colors border-l border-input ${
                watchedType === "correccion"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              − Corrección
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Input
                label={`Cantidad (${kpi.unit || "unidades"})`}
                type="number"
                min="0"
                step="any"
                {...form.register("value")}
              />
              {form.formState.errors.value && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.value.message}</p>
              )}
            </div>
            <div>
              <Input
                label="Nota (opcional)"
                {...form.register("note")}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              <Check className="mr-1 h-3.5 w-3.5" />
              {form.formState.isSubmitting ? "Guardando..." : "Guardar avance"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setShowForm(false); form.reset(); }}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={() => setShowForm(true)}
        >
          <TrendingUp className="mr-2 h-3.5 w-3.5" />
          Registrar avance
        </Button>
      )}

      {/* History */}
      {loading ? (
        <p className="text-xs text-muted-foreground">Cargando historial...</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Sin registros de avance aún.</p>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Historial ({entries.length})
          </p>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 px-3 py-2 bg-background">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${entry.value >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                    >
                      {entry.value >= 0 ? "+" : ""}
                      {entry.value.toLocaleString("es-MX")}
                      {kpi.unit ? ` ${kpi.unit}` : ""}
                    </span>
                    {entry.note && (
                      <span className="text-xs text-foreground truncate">{entry.note}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-7 w-7 p-0"
                  disabled={deletingId === entry.id}
                  onClick={() => onDelete(entry.id, entry.value)}
                  title="Eliminar este registro"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminKpisPage() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<Kpi | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);

  const form = useForm<KpiFormValues>({
    resolver: createZodResolver(kpiSchema),
    defaultValues: {
      name: "",
      description: "",
      unit: "",
      targetValue: 0,
      currentValue: 0,
      period: "mensual",
      category: "general",
      deadline: "",
    },
  });

  const editForm = useForm<KpiFormValues>({
    resolver: createZodResolver(kpiSchema),
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kpis");
      if (!res.ok) throw new Error("Error al cargar KPIs");
      setKpis(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Called by KpiProgressPanel when a progress entry is added or deleted
  const handleProgressAdded = (kpiId: string, delta: number) => {
    setKpis((prev) =>
      prev.map((k) =>
        k.id === kpiId ? { ...k, currentValue: k.currentValue + delta } : k
      )
    );
  };

  const serializeDeadline = (raw?: string) =>
    raw ? new Date(raw).toISOString() : null;

  const onCreate = async (values: KpiFormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, deadline: serializeDeadline(values.deadline) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear KPI");
      }
      form.reset({ name: "", description: "", unit: "", targetValue: 0, currentValue: 0, period: "mensual", category: "general", deadline: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const startEdit = (kpi: Kpi) => {
    setEditing(kpi);
    editForm.reset({
      name: kpi.name,
      description: kpi.description ?? "",
      unit: kpi.unit,
      targetValue: kpi.targetValue,
      currentValue: kpi.currentValue,
      period: kpi.period as typeof PERIODS[number],
      category: kpi.category as typeof CATEGORIES[number],
      deadline: kpi.deadline ? kpi.deadline.substring(0, 10) : "",
    });
  };

  const onUpdate = async (values: KpiFormValues) => {
    if (!editing) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/kpis/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, deadline: serializeDeadline(values.deadline) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar KPI");
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const onDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/kpis/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setKpis((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setDeleting(null);
    }
  };

  const grouped = kpis.reduce<Record<string, Kpi[]>>((acc, kpi) => {
    const cat = kpi.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(kpi);
    return acc;
  }, {});

  const filtered = filterCategory === "all" ? kpis : (grouped[filterCategory] ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPIs"
        description="Indicadores clave de rendimiento de la plataforma"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Filters + add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat === "all" ? "Todos" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo KPI
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Nuevo KPI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Input label="Nombre *" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Input label="Unidad (ej: usuarios, MXN, %)" {...form.register("unit")} />
                </div>
                <div>
                  <Input label="Valor objetivo *" type="number" step="any" {...form.register("targetValue")} />
                  {form.formState.errors.targetValue && (
                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.targetValue.message}</p>
                  )}
                </div>
                <div>
                  <Input label="Valor actual inicial" type="number" step="any" {...form.register("currentValue")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Período</label>
                  <select
                    {...form.register("period")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PERIODS.map((p) => (
                      <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Categoría</label>
                  <select
                    {...form.register("category")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Input label="Descripción (opcional)" {...form.register("description")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Fecha límite (opcional)</label>
                  <input
                    type="date"
                    {...form.register("deadline")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creando..." : "Crear KPI"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* KPI list */}
      <Card>
        <CardHeader>
          <CardTitle>KPIs ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin KPIs aún. Crea uno con el botón de arriba.</p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((kpi) => (
                <div key={kpi.id} className="py-4">
                  {editing?.id === kpi.id ? (
                    /* ─── Edit inline form ─── */
                    <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Input label="Nombre *" {...editForm.register("name")} />
                          {editForm.formState.errors.name && (
                            <p className="mt-1 text-xs text-destructive">{editForm.formState.errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <Input label="Unidad" {...editForm.register("unit")} />
                        </div>
                        <div>
                          <Input label="Valor objetivo *" type="number" step="any" {...editForm.register("targetValue")} />
                          {editForm.formState.errors.targetValue && (
                            <p className="mt-1 text-xs text-destructive">{editForm.formState.errors.targetValue.message}</p>
                          )}
                        </div>
                        <div>
                          <Input label="Valor actual" type="number" step="any" {...editForm.register("currentValue")} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Período</label>
                          <select
                            {...editForm.register("period")}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {PERIODS.map((p) => (
                              <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Categoría</label>
                          <select
                            {...editForm.register("category")}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Input label="Descripción" {...editForm.register("description")} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Fecha límite</label>
                          <input
                            type="date"
                            {...editForm.register("deadline")}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={editForm.formState.isSubmitting}>
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Guardar
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>
                          <X className="mr-1 h-3.5 w-3.5" />
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* ─── Display row ─── */
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{kpi.name}</p>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {CATEGORY_LABELS[kpi.category]}
                            </span>
                            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                              {PERIOD_LABELS[kpi.period]}
                            </span>
                            <DeadlineBadge deadline={kpi.deadline} />
                          </div>
                          {kpi.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground">{kpi.description}</p>
                          )}
                          <ProgressBar value={kpi.currentValue} target={kpi.targetValue} />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Meta: {kpi.targetValue.toLocaleString("es-MX")}{kpi.unit ? ` ${kpi.unit}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedKpi(expandedKpi === kpi.id ? null : kpi.id)}
                            title={expandedKpi === kpi.id ? "Ocultar avances" : "Ver avances"}
                          >
                            {expandedKpi === kpi.id
                              ? <ChevronUp className="h-4 w-4" />
                              : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(kpi)}
                            title="Editar KPI"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(kpi.id)}
                            disabled={deleting === kpi.id}
                            title="Eliminar KPI"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress panel — collapsible */}
                      {expandedKpi === kpi.id && (
                        <KpiProgressPanel
                          kpi={kpi}
                          onProgressAdded={handleProgressAdded}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary by category */}
      {!loading && kpis.length > 0 && (
        <>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(grouped).map(([cat, items]) => {
              const avgPct =
                items.reduce(
                  (sum, k) => sum + (k.targetValue > 0 ? (k.currentValue / k.targetValue) * 100 : 0),
                  0
                ) / items.length;
              return (
                <Card key={cat} className="border border-border bg-card/90">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[cat]}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{avgPct.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">
                      promedio de cumplimiento · {items.length} KPI{items.length !== 1 ? "s" : ""}
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          avgPct >= 100 ? "bg-green-500" : avgPct >= 60 ? "bg-primary" : "bg-yellow-500"
                        }`}
                        style={{ width: `${Math.min(avgPct, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
