import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getCachedSession } from "@/lib/session";
import { InstructorShell } from "@/components/layouts/instructor-shell";
import { getUserRole } from "@/lib/user-service";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface InstructorLayoutProps {
  children: ReactNode;
}

export default async function InstructorLayout({ children }: InstructorLayoutProps) {
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
  if (role !== "instructor" && role !== "admin") {
    redirect("/dashboard");
  }

  const userName = session.user.name || "Instructor";
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "IN";
  const userImage = (session.user as { image?: string | null }).image ?? null;

  return (
    <InstructorShell userName={userName} userInitials={userInitials} userImage={userImage}>
      {children}
    </InstructorShell>
  );
}
