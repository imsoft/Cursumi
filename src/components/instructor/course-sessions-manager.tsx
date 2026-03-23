"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Calendar, Clock, Users, Trash2 } from "lucide-react";
import type { CourseSessionData } from "./course-types";

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
                  <Input
                    className="mt-1"
                    type="date"
                    value={session.date ? session.date.substring(0, 10) : ""}
                    onChange={(e) => handleUpdate(i, { date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" /> Hora inicio
                  </label>
                  <Input
                    className="mt-1"
                    type="time"
                    value={session.startTime}
                    onChange={(e) => handleUpdate(i, { startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" /> Hora fin
                  </label>
                  <Input
                    className="mt-1"
                    type="time"
                    value={session.endTime}
                    onChange={(e) => handleUpdate(i, { endTime: e.target.value })}
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
                <Input
                  className="mt-1"
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Hora inicio</label>
                <Input
                  className="mt-1"
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Hora fin</label>
                <Input
                  className="mt-1"
                  type="time"
                  value={draft.endTime}
                  onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
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
