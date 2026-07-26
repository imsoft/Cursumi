import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getGovernanceAccess } from "@/lib/governance-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gobernanza · Cursumi",
  robots: { index: false, follow: false },
};

/**
 * Solo los correos declarados en GOVERNANCE_SIGNATORIES entran aquí. No basta
 * con ser admin de la plataforma: es un documento privado entre socios.
 */
export default async function GovernanceLayout({ children }: { children: ReactNode }) {
  const access = await getGovernanceAccess();
  if (!access) redirect("/dashboard");

  return <div className="min-h-screen bg-muted/20">{children}</div>;
}
