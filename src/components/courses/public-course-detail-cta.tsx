"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EnrollActionForm } from "@/components/student/enroll-action-form";
import { CheckoutButton } from "@/components/student/checkout-button";

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
}

export function PublicCourseDetailCTA({
  isLoggedIn,
  courseId,
  price,
  enrollAction,
  returnUrl,
}: PublicCourseDetailCTAProps) {
  if (!isLoggedIn) {
    const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
    const signupUrl = `/signup?returnUrl=${encodeURIComponent(returnUrl)}`;
    return (
      <div className="flex flex-col gap-3">
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

  if (price === 0) {
    return <EnrollActionForm action={enrollAction} courseId={courseId} />;
  }
  return <CheckoutButton courseId={courseId} price={price} />;
}
