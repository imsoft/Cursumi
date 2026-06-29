import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { TwoFactorForm } from "@/components/auth/two-factor-form";

export const metadata: Metadata = {
  title: "Verificación en dos pasos",
  description: "Confirma tu identidad con el segundo factor.",
  robots: { index: false, follow: false },
};

export default async function TwoFactorPage() {
  // Si ya hay sesión completa, no hace falta el challenge.
  const session = await getSessionSafe();
  if (session) redirect("/dashboard");

  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <TwoFactorForm />
      </Suspense>
    </AuthPageShell>
  );
}
