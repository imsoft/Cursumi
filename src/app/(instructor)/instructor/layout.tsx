import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { InstructorShell } from "@/components/layouts/instructor-shell";
import { getUserRole } from "@/lib/user-service";

interface InstructorLayoutProps {
  children: ReactNode;
}

export default async function InstructorLayout({ children }: InstructorLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  return (
    <InstructorShell userName={userName} userInitials={userInitials}>
      {children}
    </InstructorShell>
  );
}
