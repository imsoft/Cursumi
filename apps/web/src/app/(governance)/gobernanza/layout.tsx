import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getGovernanceAccess } from "@/lib/governance-service";
import { getUserBasicInfo } from "@/lib/user-service";
import { AdminShell } from "@/components/layouts/admin-shell";
import { InstructorShell } from "@/components/layouts/instructor-shell";
import { StudentShell } from "@/components/layouts/student-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gobernanza · Cursumi",
  robots: { index: false, follow: false },
};

/**
 * Solo los correos declarados en GOVERNANCE_SIGNATORIES entran aquí. No basta
 * con ser admin de la plataforma: es un documento privado entre socios.
 *
 * La página vive fuera de /admin porque los firmantes tienen roles distintos
 * (el CEO y el CFO son instructores), así que la envolvemos en el mismo panel
 * que cada uno usa habitualmente para que no se sienta una pantalla suelta.
 */
export default async function GovernanceLayout({ children }: { children: ReactNode }) {
  const access = await getGovernanceAccess();
  if (!access) redirect("/dashboard");

  const { role, image } = await getUserBasicInfo(access.userId);

  const userName = access.name ?? "Cursumi";
  const userInitials =
    access.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU";

  const shellProps = {
    userName,
    userInitials,
    userImage: image,
    showGovernance: true,
  };

  if (role === "admin") {
    return <AdminShell {...shellProps}>{children}</AdminShell>;
  }
  if (role === "instructor") {
    return (
      <InstructorShell {...shellProps} pageTitle="Gobernanza">
        {children}
      </InstructorShell>
    );
  }
  return (
    <StudentShell {...shellProps} pageTitle="Gobernanza">
      {children}
    </StudentShell>
  );
}
