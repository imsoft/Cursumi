"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Clock,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
} from "lucide-react";
import type { GovernanceContent } from "@/lib/governance";

type Signature = {
  email: string;
  title: string;
  signed: boolean;
  fullName: string | null;
  acceptedAt: string | null;
};

type HistoryEntry = {
  version: number;
  publishedAt: string;
  changeNote: string | null;
  signatures: { fullName: string; email: string; acceptedAt: string }[];
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/**
 * Fecha y hora en horario de la Ciudad de México, armada pieza por pieza.
 *
 * Nada de `dateStyle`/`timeStyle`: el patrón que los une ("a las" vs ",")
 * depende de los datos ICU de cada entorno, así que Node y el navegador
 * generaban textos distintos y React fallaba al hidratar. Con partes numéricas
 * y los meses escritos aquí, el resultado es idéntico en ambos lados. La zona
 * va fija para que dos firmantes vean la misma hora en una misma firma.
 */
function fmt(iso: string | null): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const mes = MESES[Number(get("month")) - 1] ?? "";
  // "24" a medianoche en algunos entornos → normalizamos a "00".
  const hora = get("hour") === "24" ? "00" : get("hour");
  return `${Number(get("day"))} de ${mes} de ${get("year")}, ${hora}:${get("minute")} h`;
}

export function GovernanceClient({
  title,
  content: initialContent,
  isOwner,
  me,
  version,
  currentVersionId,
  publishedAt,
  changeNote,
  draftUpdatedAt,
  inForce,
  signatures,
  myAcceptance,
  history,
}: {
  title: string;
  content: GovernanceContent;
  isOwner: boolean;
  me: { name: string | null; email: string; title: string; mustSign: boolean };
  version: number;
  currentVersionId: string | null;
  publishedAt: string | null;
  changeNote: string | null;
  draftUpdatedAt: string;
  inForce: boolean;
  signatures: Signature[];
  myAcceptance: { fullName: string; acceptedAt: string } | null;
  history: HistoryEntry[];
}) {
  const [content, setContent] = useState<GovernanceContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  // Firma
  const [fullName, setFullName] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(myAcceptance);

  const stats = useMemo(() => {
    let total = 0;
    let answered = 0;
    for (const s of content.sections) {
      for (const q of s.questions) {
        total++;
        if (q.answer.trim()) answered++;
      }
    }
    return { total, answered };
  }, [content]);

  const published = version > 0;

  function setAnswer(sectionId: string, questionId: string, value: string) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId ? { ...q, answer: value } : q,
              ),
            },
      ),
    }));
  }

  async function saveDraft() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/governance/document", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setSavedAt(data.updatedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    const confirmed = window.confirm(
      published
        ? `Vas a publicar la versión ${version + 1}. Las firmas de la versión ${version} dejarán de estar vigentes y el CEO y el CFO deberán aceptar de nuevo. ¿Continuar?`
        : "Vas a publicar la versión 1. El CEO y el CFO podrán leerla y firmarla. ¿Continuar?",
    );
    if (!confirmed) return;

    setPublishing(true);
    setError(null);
    try {
      // Guardamos primero para que la versión congelada incluya lo último escrito.
      const saveRes = await fetch("/api/governance/document", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!saveRes.ok) {
        const d = await saveRes.json();
        throw new Error(d.error ?? "No se pudo guardar antes de publicar");
      }

      const res = await fetch("/api/governance/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo publicar");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo publicar");
      setPublishing(false);
    }
  }

  async function accept() {
    if (!currentVersionId) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch("/api/governance/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: currentVersionId, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo registrar tu aceptación");
      setAccepted({ fullName, acceptedAt: new Date().toISOString() });
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar tu aceptación");
      setAccepting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Documento de gobernanza
          </span>
          {published ? (
            inForce ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                En vigor · versión {version}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                Versión {version} · pendiente de firma
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Borrador · sin publicar
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entraste como <span className="font-medium text-foreground">{me.title}</span> ({me.email})
        </p>

        {content.intro && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {content.intro}
          </p>
        )}

        {published && publishedAt && (
          <p className="mt-3 text-xs text-muted-foreground">
            Versión {version} publicada el {fmt(publishedAt)}
            {changeNote ? ` · ${changeNote}` : ""}
          </p>
        )}
      </header>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Estado de firmas ───────────────────────────────────────── */}
      {published && (
        <Card className="mb-8 border-border">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Firmas de la versión {version}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {signatures.map((s) => (
                <li key={s.email} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  {s.signed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <span className="font-medium text-foreground">{s.title}</span>
                  <span className="text-muted-foreground">{s.email}</span>
                  {s.signed ? (
                    <span className="text-xs text-muted-foreground">
                      Aceptó como “{s.fullName}” el {fmt(s.acceptedAt)}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      Pendiente
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {inForce && (
              <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                Todos los firmantes aceptaron. Esta versión rige los acuerdos de la empresa.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Aviso al dueño si hay cambios sin publicar ─────────────── */}
      {isOwner && (
        <Card className="mb-8 border-border bg-muted/30">
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Borrador</h2>
                <p className="text-xs text-muted-foreground">
                  {stats.answered} de {stats.total} preguntas con acuerdo escrito · último guardado{" "}
                  {fmt(savedAt ?? draftUpdatedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving}>
                  <Save className="mr-1.5 h-4 w-4" />
                  {saving ? "Guardando…" : "Guardar borrador"}
                </Button>
                <Button size="sm" onClick={publish} disabled={publishing}>
                  <Send className="mr-1.5 h-4 w-4" />
                  {publishing ? "Publicando…" : published ? `Publicar v${version + 1}` : "Publicar v1"}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="changeNote" className="text-xs text-muted-foreground">
                Nota de cambios (opcional)
              </Label>
              <Input
                id="changeNote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Qué cambió respecto a la versión anterior, para que el CEO y el CFO sepan qué
                están firmando.
              </p>
            </div>
            {published && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                Publicar una versión nueva invalida las firmas actuales: el CEO y el CFO tendrán
                que aceptar otra vez.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Documento sin publicar (vista de firmante) ─────────────── */}
      {!isOwner && !published && (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              La cuenta principal todavía no publica el documento. Cuando lo haga, aparecerá aquí
              para que lo revises y lo aceptes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Contenido ──────────────────────────────────────────────── */}
      {(isOwner || published) && (
        <div className="space-y-6">
          {content.sections.map((section) => (
            <Card key={section.id} className="border-border">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {section.tag}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                </div>
                <ul>
                  {section.questions.map((q) => (
                    <li key={q.id} className="border-b border-border px-5 py-4 last:border-b-0">
                      <p className="text-sm font-medium leading-relaxed text-foreground">{q.q}</p>
                      {q.note && (
                        <span className="mt-1.5 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {q.note}
                        </span>
                      )}
                      {isOwner ? (
                        <Textarea
                          value={q.answer}
                          rows={2}
                          className="mt-2.5 min-h-16 resize-y text-sm"
                          onChange={(e) => setAnswer(section.id, q.id, e.target.value)}
                        />
                      ) : q.answer.trim() ? (
                        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 px-3 py-2 text-sm leading-relaxed text-foreground">
                          {q.answer}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm italic text-muted-foreground">
                          Sin acuerdo definido en esta versión.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Aceptación ─────────────────────────────────────────────── */}
      {!isOwner && published && me.mustSign && (
        <Card className="mt-8 border-primary/40">
          <CardContent className="p-6">
            {accepted ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Aceptaste la versión {version}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Firmado como “{accepted.fullName}” el {fmt(accepted.acceptedAt)}. Quedó
                    registrado con fecha, hora y dirección IP.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-foreground">
                  Aceptar este documento
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Al aceptar confirmas que leíste la versión {version} y que estos acuerdos rigen
                  tus decisiones como {me.title}. Se guardará tu nombre, la fecha, la hora y tu
                  dirección IP.
                </p>
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm">
                    Escribe tu nombre completo para firmar
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="max-w-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tu nombre completo, tal como lo usas legalmente.
                  </p>
                </div>
                <Button
                  className="mt-4"
                  onClick={accept}
                  disabled={accepting || fullName.trim().length < 5}
                >
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  {accepting ? "Registrando…" : "Acepto y me obligo a cumplirlo"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Historial ──────────────────────────────────────────────── */}
      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <History className="h-4 w-4" />
            Historial de versiones
          </h2>
          <ul className="mt-3 space-y-2">
            {history.map((v) => (
              <li
                key={v.version}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-foreground">Versión {v.version}</span>
                  {v.version === version && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                      Vigente
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{fmt(v.publishedAt)}</span>
                </div>
                {v.changeNote && (
                  <p className="mt-1 text-xs text-muted-foreground">{v.changeNote}</p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {v.signatures.length === 0
                    ? "Sin firmas"
                    : v.signatures
                        .map((s) => `${s.fullName} (${fmt(s.acceptedAt)})`)
                        .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
