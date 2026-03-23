"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EnrollActionForm } from "@/components/student/enroll-action-form";
import { CheckoutButton } from "@/components/student/checkout-button";
import { SessionPicker, type PickableSession } from "./session-picker";

type EnrollState = {
  status: "idle" | "success" | "error";
  message?: string;
};

type EnrollAction = (prev: EnrollState, formData: FormData) => Promise<EnrollState>;

interface PublicCourseDetailCTAProps {
  isLoggedIn: boolean;
  courseId: string;
  price: number;
  enrollAction: EnrollAction;
  returnUrl: string;
  /** Sesiones presenciales disponibles (solo para cursos presenciales) */
  sessions?: PickableSession[];
}

export function PublicCourseDetailCTA({
  isLoggedIn,
  courseId,
  price,
  enrollAction,
  returnUrl,
  sessions,
}: PublicCourseDetailCTAProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const hasSessions = sessions && sessions.length > 0;
  const requiresSession = hasSessions;

  if (!isLoggedIn) {
    const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
    const signupUrl = `/signup?returnUrl=${encodeURIComponent(returnUrl)}`;
    return (
      <div className="flex flex-col gap-3">
        {hasSessions && (
          <SessionPicker
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelect={setSelectedSessionId}
          />
        )}
        <p className="text-sm text-muted-foreground">
          Inicia sesión o crea una cuenta para inscribirte a este curso.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="default" size="lg">
            <Link href={loginUrl}>Iniciar sesión</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={signupUrl}>Crear cuenta</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {hasSessions && (
        <SessionPicker
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelect={setSelectedSessionId}
        />
      )}
      {price === 0 ? (
        <EnrollActionForm
          action={enrollAction}
          courseId={courseId}
          sessionId={selectedSessionId ?? undefined}
          disabled={requiresSession && !selectedSessionId}
        />
      ) : (
        <CheckoutButton
          courseId={courseId}
          price={price}
          sessionId={selectedSessionId ?? undefined}
          disabled={requiresSession && !selectedSessionId}
        />
      )}
    </div>
  );
}
