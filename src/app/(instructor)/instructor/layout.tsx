import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getCachedSession } from "@/lib/session";
import { InstructorShell } from "@/components/layouts/instructor-shell";
import { getUserBasicInfo } from "@/lib/user-service";

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
    notFound();
  }

  if (!session) {
    notFound();
  }

  const { role, image: userImage } = await getUserBasicInfo(session.user.id);
  if (role !== "instructor" && role !== "admin") {
    notFound();
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
