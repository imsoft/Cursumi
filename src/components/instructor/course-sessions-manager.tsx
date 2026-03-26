"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Calendar, Clock, Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseSessionData } from "./course-types";

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
  /** Si true, cada sesión muestra inscritos / capacidad (modo edición de curso existente) */
  enrollmentCounts?: Record<string, number>;
}

const EMPTY_SESSION: Omit<CourseSessionData, "id"> = {
  city: "",
  location: "",
  date: "",
  startTime: "09:00",
  endTime: "13:00",
  maxStudents: 30,
};

export function CourseSessionsManager({ sessions, onChange, enrollmentCounts }: CourseSessionsManagerProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<CourseSessionData, "id">>(EMPTY_SESSION);

  const handleAdd = () => {
    if (!draft.city.trim() || !draft.location.trim() || !draft.date) return;
    onChange([...sessions, { ...draft }]);
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
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No hay sesiones configuradas. Agrega al menos una sesión con lugar, fecha y horario.
          </p>
        </div>
      )}

      {sessions.map((session, i) => {
        const enrolled = enrollmentCounts?.[session.id ?? ""] ?? 0;
        return (
          <Card key={session.id ?? `new-${i}`} className="border border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-emerald-500" />
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Ciudad</label>
                  <Input
                    className="mt-1"
                    placeholder="Ej. CDMX"
                    value={session.city}
                    onChange={(e) => handleUpdate(i, { city: e.target.value })}
                  />
                </div>
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Fecha
                  </label>
                  <NativeDateTimeInput
                    type="date"
                    className="mt-1"
                    value={session.date ? session.date.substring(0, 10) : ""}
                    onChange={(v) => handleUpdate(i, { date: v })}
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
            </CardContent>
          </Card>
        );
      })}

      {adding ? (
        <Card className="border border-primary/30">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Nueva sesión</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ciudad *</label>
                <Input
                  className="mt-1"
                  placeholder="Ej. CDMX"
                  value={draft.city}
                  onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                  autoFocus
                />
              </div>
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fecha *</label>
                <NativeDateTimeInput
                  type="date"
                  className="mt-1"
                  value={draft.date}
                  onChange={(v) => setDraft((d) => ({ ...d, date: v }))}
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
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!draft.city.trim() || !draft.location.trim() || !draft.date}
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
