import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getSessionSafe } from "@/lib/session";
import { InstructorShell } from "@/components/layouts/instructor-shell";
import { getUserBasicInfo } from "@/lib/user-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface InstructorLayoutProps {
  children: ReactNode;
}

export default async function InstructorLayout({ children }: InstructorLayoutProps) {
  const session = await getSessionSafe();
  if (!session) {
    redirect("/login");
  }

  let role = "";
  let userImage: string | null = null;
  try {
    const info = await getUserBasicInfo(session.user.id);
    role = info.role;
    userImage = info.image;
  } catch {
    redirect("/login");
  }
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

  return (
    <InstructorShell userName={userName} userInitials={userInitials} userImage={userImage}>
      {children}
    </InstructorShell>
  );
}
