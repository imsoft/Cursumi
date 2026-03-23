"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Users, Check } from "lucide-react";

export interface PickableSession {
  id: string;
  city: string;
  location: string;
  date: string; // ISO
  startTime: string;
  endTime: string;
  maxStudents: number;
  enrolledCount: number;
}

interface SessionPickerProps {
  sessions: PickableSession[];
  selectedSessionId: string | null;
  onSelect: (sessionId: string) => void;
}

export function SessionPicker({ sessions, selectedSessionId, onSelect }: SessionPickerProps) {
  const futureSessions = sessions.filter((s) => new Date(s.date) >= new Date());

  if (futureSessions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        No hay sesiones disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Selecciona una sesión:</p>
      {futureSessions.map((session) => {
        const isFull = session.enrolledCount >= session.maxStudents;
        const spotsLeft = session.maxStudents - session.enrolledCount;
        const isSelected = selectedSessionId === session.id;
        const dateFormatted = new Date(session.date).toLocaleDateString("es-MX", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <button
            key={session.id}
            type="button"
            disabled={isFull}
            onClick={() => onSelect(session.id)}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/5"
                : isFull
                ? "cursor-not-allowed border-border bg-muted/30 opacity-60"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                  {session.city} — {session.location}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateFormatted}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.startTime} – {session.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {isFull ? (
                      <span className="text-destructive font-medium">Llena</span>
                    ) : (
                      <span>{spotsLeft} {spotsLeft === 1 ? "lugar disponible" : "lugares disponibles"}</span>
                    )}
                  </span>
                </div>
              </div>
              {isSelected && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
