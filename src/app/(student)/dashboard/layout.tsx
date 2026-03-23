import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getCachedSession } from "@/lib/session";
import { getUserRole } from "@/lib/user-service";
import { StudentShell } from "@/components/layouts/student-shell";

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
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  const role = await getUserRole(session.user.id);
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
    <StudentShell userName={userName} userInitials={userInitials} userImage={userImage}>
      {children}
    </StudentShell>
  );
}
