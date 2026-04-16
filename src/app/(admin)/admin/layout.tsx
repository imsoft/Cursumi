import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getSessionSafe } from "@/lib/session";
import { AdminShell } from "@/components/layouts/admin-shell";
import { getUserBasicInfo } from "@/lib/user-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSessionSafe();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { role, image: userImage } = await getUserBasicInfo(session.user.id);
  if (role !== "admin") {
    if (role === "instructor") redirect("/instructor");
    redirect("/dashboard");
  }

  const userName = session.user.name ?? "Admin";
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AD";

  return (
    <AdminShell userName={userName} userInitials={userInitials} userImage={userImage}>
      {children}
    </AdminShell>
  );
}
