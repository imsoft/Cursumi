import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionSafe } from "@/lib/session";
import { getOrgForUser } from "@/lib/org-service";
import { OnboardingForm } from "@/components/business/onboarding-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crea tu empresa | Cursumi Business",
  robots: { index: false, follow: false },
};

export default async function BusinessOnboardingPage() {
  const session = await getSessionSafe();
  if (!session?.user?.id) {
    redirect("/login?returnUrl=/business/onboarding");
  }

  // Si el usuario ya pertenece a una organización, no repetir el onboarding.
  const existing = await getOrgForUser(session.user.id);
  if (existing) {
    redirect("/business/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-foreground">Crea tu empresa en Cursumi</h1>
        <p className="text-muted-foreground">
          Configura tu organización para capacitar a tu equipo. Después elegirás un
          plan y podrás invitar a tus empleados.
        </p>
      </div>

      <OnboardingForm defaultEmail={session.user.email ?? ""} />
    </div>
  );
}
