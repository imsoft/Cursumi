import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { StudentShell } from "@/components/layouts/student-shell";

interface StudentLayoutProps {
  children: ReactNode;
}

export default async function StudentLayout({ children }: StudentLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userName = session.user.name || "Usuario";
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <StudentShell userName={userName} userInitials={userInitials}>
      {children}
    </StudentShell>
  );
}
