import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCachedSession } from "@/lib/session";
import { getInstructorEarnings } from "@/lib/instructor-service";
import { InstructorEarningsClient } from "@/components/instructor/instructor-earnings-client";
import { StripeConnectBanner } from "@/components/instructor/stripe-connect-banner";

export default async function InstructorEarningsPage() {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const earnings = await getInstructorEarnings(session.user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Suspense>
        <StripeConnectBanner />
      </Suspense>
      <InstructorEarningsClient earnings={earnings} />
    </div>
  );
}
