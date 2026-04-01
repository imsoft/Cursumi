import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getCachedSession } from "@/lib/session";
import { getUserRole } from "@/lib/user-service";
import { StudentShell } from "@/components/layouts/student-shell";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface StudentLayoutProps {
  children: ReactNode;
}

export default async function StudentLayout({ children }: StudentLayoutProps) {
  let session;
  try {
    session = await getCachedSession();
  } catch {
    notFound();
  }

  if (!session) {
    notFound();
  }

  const [role, orgMembership] = await Promise.all([
    getUserRole(session.user.id),
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
  const userImage = (session.user as { image?: string | null }).image ?? null;

  return (
    <StudentShell userName={userName} userInitials={userInitials} userImage={userImage} hasOrg={!!orgMembership}>
      {children}
    </StudentShell>
  );
}
