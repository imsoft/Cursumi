"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/date-picker";
import { Plus, MapPin, Calendar, Clock, Users, Trash2, Video, Link2, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseSessionData } from "./course-types";
import { MexicoStateCityFields } from "@/components/location/mexico-state-city-fields";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { PasswordInput } from "@/components/ui/password-input";

/**
 * Input nativo para date/time que NO es controlado por React en cada keystroke.
 * Solo propaga el valor al padre en onChange del nativo (que en date/time
 * se dispara al completar la edición de un segmento) y en onBlur.
 */
function NativeDateTimeInput({
  type,
  value,
  onChange,
  className,
}: {
  type: "date" | "time";
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  // Sync external value → DOM only when the input is NOT focused
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.value = value;
    }
  }, [value]);

  const commit = useCallback(() => {
    if (ref.current && ref.current.value !== value) {
      onChange(ref.current.value);
    }
  }, [onChange, value]);

  return (
    <input
      ref={ref}
      type={type}
      defaultValue={value}
      onChange={commit}
      onBlur={commit}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className,
      )}
    />
  );
}

interface CourseSessionsManagerProps {
  sessions: CourseSessionData[];
  onChange: (sessions: CourseSessionData[]) => void;
  /** presencial: sede física; live: enlace de reunión obligatorio por sesión */
  variant?: "presencial" | "live";
  /** Si true, cada sesión muestra inscritos / capacidad (modo edición de curso existente) */
  enrollmentCounts?: Record<string, number>;
  /** Si el curso es gratuito, se muestra el campo de código por sesión */
  isFree?: boolean;
}

const EMPTY_SESSION: Omit<CourseSessionData, "id"> = {
  state: "",
  city: "",
  location: "",
  meetingUrl: "",
  date: "",
  startTime: "09:00",
  endTime: "13:00",
  maxStudents: 30,
};

export function CourseSessionsManager({
  sessions,
  onChange,
  enrollmentCounts,
  variant = "presencial",
  isFree = false,
}: CourseSessionsManagerProps) {
  const isLive = variant === "live";
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<CourseSessionData, "id">>(EMPTY_SESSION);

  const handleAdd = () => {
    if (!draft.date) return;
    if (isLive) {
      if (!draft.meetingUrl?.trim()) return;
      onChange([
        ...sessions,
        {
          ...draft,
          city: draft.city.trim() || "En línea",
          location: draft.location.trim() || "Videollamada",
          meetingUrl: draft.meetingUrl.trim(),
        },
      ]);
    } else {
      if (!draft.state?.trim() || !draft.city.trim() || !draft.location.trim()) return;
      onChange([...sessions, { ...draft, meetingUrl: draft.meetingUrl?.trim() || undefined }]);
    }
    setDraft(EMPTY_SESSION);
    setAdding(false);
  };

  const handleRemove = (index: number) => {
    onChange(sessions.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<CourseSessionData>) => {
    onChange(sessions.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  return (
    <div className="space-y-3">
      {sessions.length === 0 && !adding && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {isLive ? <Video /> : <MapPin />}
            </EmptyMedia>
            <EmptyTitle>Sin sesiones</EmptyTitle>
            <EmptyDescription>
              {isLive
                ? "Agrega sesiones con fecha, hora y enlace de videollamada (Meet, Zoom, etc.)."
                : "Agrega al menos una sesión con lugar, fecha y horario."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {sessions.map((session, i) => {
        const enrolled = enrollmentCounts?.[session.id ?? ""] ?? 0;
        return (
          <Card key={session.id ?? `new-${i}`} className="border border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {isLive ? (
                    <Video className="h-4 w-4 text-violet-500" />
                  ) : (
                    <MapPin className="h-4 w-4 text-emerald-500" />
                  )}
                  Sesión {i + 1}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(i)}
                  disabled={enrolled > 0}
                  title={enrolled > 0 ? "No se puede eliminar una sesión con estudiantes inscritos" : "Eliminar sesión"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {isLive ? (
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Link2 className="h-3 w-3" /> Enlace de reunión *
                    </label>
                    <Input
                      className="mt-1"
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={session.meetingUrl ?? ""}
                      onChange={(e) => handleUpdate(i, { meetingUrl: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Etiqueta (opcional)</label>
                      <Input
                        className="mt-1"
                        placeholder="Ej. Módulo 1"
                        value={session.location}
                        onChange={(e) => handleUpdate(i, { location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <MexicoStateCityFields
                    state={session.state ?? ""}
                    city={session.city}
                    onStateChange={(v) => handleUpdate(i, { state: v })}
                    onCityChange={(v) => handleUpdate(i, { city: v })}
                    stateLabel="Estado"
                    cityLabel="Ciudad o municipio"
                  />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Dirección / Sede</label>
                    <Input
                      className="mt-1"
                      placeholder="Ej. Av. Reforma 123, Col. Centro"
                      value={session.location}
                      onChange={(e) => handleUpdate(i, { location: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" /> Fecha
                  </label>
                  <DatePickerField
                    value={session.date ? session.date.substring(0, 10) : ""}
                    onChange={(v) => handleUpdate(i, { date: v })}
                    placeholder="Selecciona fecha"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" /> Hora inicio
                  </label>
                  <NativeDateTimeInput
                    type="time"
                    className="mt-1"
                    value={session.startTime}
                    onChange={(v) => handleUpdate(i, { startTime: v })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" /> Hora fin
                  </label>
                  <NativeDateTimeInput
                    type="time"
                    className="mt-1"
                    value={session.endTime}
                    onChange={(v) => handleUpdate(i, { endTime: v })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Users className="h-3 w-3" /> Capacidad máxima
                  </label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    value={session.maxStudents}
                    onChange={(e) => handleUpdate(i, { maxStudents: Number(e.target.value) })}
                  />
                </div>
                {enrollmentCounts && session.id && (
                  <div className="flex items-end">
                    <p className="text-sm text-muted-foreground pb-2">
                      <span className="font-semibold text-foreground">{enrolled}</span> / {session.maxStudents} inscritos
                    </p>
                  </div>
                )}
              </div>

              {isFree && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    Código de acceso para esta sesión (opcional)
                  </div>
                  <PasswordInput
                    autoComplete="new-password"
                    value={session.joinCode ?? ""}
                    onChange={(e) => handleUpdate(i, { joinCode: e.target.value, clearJoinCode: false })}
                    placeholder={session.hasJoinCode ? "Vacío = no cambiar el código actual" : "Ej. SESION1-2025"}
                  />
                  {session.hasJoinCode && (
                    <label className="flex cursor-pointer items-start gap-2 text-xs text-foreground">
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-input"
                        checked={!!session.clearJoinCode}
                        onChange={(e) => handleUpdate(i, { clearJoinCode: e.target.checked })}
                      />
                      <span>Quitar el código (cualquiera podrá inscribirse a esta sesión sin código)</span>
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Si defines un código, solo quienes lo ingresen podrán inscribirse a esta sesión específica.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {adding ? (
        <Card className="border border-primary/30">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Nueva sesión</p>
            {isLive ? (
              <>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Link2 className="h-3 w-3" /> Enlace de reunión *
                  </label>
                  <Input
                    className="mt-1"
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={draft.meetingUrl ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, meetingUrl: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nombre o nota (opcional)</label>
                  <Input
                    className="mt-1"
                    placeholder="Ej. Sesión 1"
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <MexicoStateCityFields
                  state={draft.state ?? ""}
                  city={draft.city}
                  onStateChange={(v) => setDraft((d) => ({ ...d, state: v }))}
                  onCityChange={(v) => setDraft((d) => ({ ...d, city: v }))}
                  stateLabel="Estado *"
                  cityLabel="Ciudad o municipio *"
                />
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Dirección / Sede *</label>
                  <Input
                    className="mt-1"
                    placeholder="Ej. Av. Reforma 123"
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha *</label>
                <DatePickerField
                  value={draft.date}
                  onChange={(v) => setDraft((d) => ({ ...d, date: v }))}
                  placeholder="Selecciona fecha"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Hora inicio</label>
                <NativeDateTimeInput
                  type="time"
                  className="mt-1"
                  value={draft.startTime}
                  onChange={(v) => setDraft((d) => ({ ...d, startTime: v }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Hora fin</label>
                <NativeDateTimeInput
                  type="time"
                  className="mt-1"
                  value={draft.endTime}
                  onChange={(v) => setDraft((d) => ({ ...d, endTime: v }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Capacidad máxima</label>
              <Input
                className="mt-1 max-w-[200px]"
                type="number"
                min={1}
                value={draft.maxStudents}
                onChange={(e) => setDraft((d) => ({ ...d, maxStudents: Number(e.target.value) }))}
              />
            </div>
            {isFree && (
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  Código de acceso para esta sesión (opcional)
                </div>
                <PasswordInput
                  autoComplete="new-password"
                  value={draft.joinCode ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, joinCode: e.target.value }))}
                  placeholder="Ej. SESION1-2025"
                />
                <p className="text-xs text-muted-foreground">
                  Si defines un código, solo quienes lo ingresen podrán inscribirse a esta sesión.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={
                  !draft.date ||
                  (isLive
                    ? !draft.meetingUrl?.trim()
                    : !draft.state?.trim() || !draft.city.trim() || !draft.location.trim())
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar sesión
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setDraft(EMPTY_SESSION); }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar sesión
        </Button>
      )}
    </div>
  );
}
