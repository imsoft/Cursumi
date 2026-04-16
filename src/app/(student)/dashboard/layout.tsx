import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getSessionSafe } from "@/lib/session";
import { getUserBasicInfo } from "@/lib/user-service";
import { StudentShell } from "@/components/layouts/student-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface StudentLayoutProps {
  children: ReactNode;
}

export default async function StudentLayout({ children }: StudentLayoutProps) {
  const session = await getSessionSafe();
  if (!session) {
    redirect("/login");
  }

  const [{ role, image: userImage }, orgMembership] = await Promise.all([
    getUserBasicInfo(session.user.id),
    prisma.orgMember.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    }),
  ]);
  if (role === "admin") redirect("/admin");
  if (role === "instructor") redirect("/instructor");

  const userName = session.user.name || "Usuario";
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <StudentShell userName={userName} userInitials={userInitials} userImage={userImage} hasOrg={!!orgMembership}>
      {children}
    </StudentShell>
  );
}
