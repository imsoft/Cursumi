import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getCachedSession } from "@/lib/session";
import { AdminShell } from "@/components/layouts/admin-shell";
import { getUserRole } from "@/lib/user-service";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
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
  if (role !== "admin") {
    redirect("/dashboard");
  }

  const userName = session.user.name || "Admin";
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AD";

  return (
    <AdminShell userName={userName} userInitials={userInitials}>
      {children}
    </AdminShell>
  );
}
