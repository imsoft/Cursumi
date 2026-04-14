import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { getCachedSession } from "@/lib/session";
import { getOrgForUser } from "@/lib/org-service";
import { getUserBasicInfo } from "@/lib/user-service";
import { BusinessShell } from "@/components/layouts/business-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BusinessDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [result, { image: userImage }] = await Promise.all([
    getOrgForUser(session.user.id),
    getUserBasicInfo(session.user.id),
  ]);
  if (!result) {
    redirect("/dashboard");
  }

  const { membership, org } = result;

  // Only owners and admins can access the business dashboard
  if (membership.orgRole === "member") {
    redirect("/dashboard");
  }

  const userName = session.user.name ?? "Admin";
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "BI";

  return (
    <BusinessShell
      userName={userName}
      userInitials={userInitials}
      userImage={userImage}
      orgName={org.name}
    >
      {children}
    </BusinessShell>
  );
}
