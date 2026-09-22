import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import { getCachedSession } from "@/lib/session";
import { getInstructorEarnings } from "@/lib/instructor-service";
import { getPlatformFeePercent } from "@/lib/platform-fee";
import { InstructorEarningsClient } from "@/components/instructor/instructor-earnings-client";
import { StripeConnectBanner } from "@/components/instructor/stripe-connect-banner";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Ganancias e ingresos",
  description: "Consulta tus ingresos netos por ventas de cursos, métricas financieras y estado de depósitos en Cursumi.",
};

export default async function InstructorEarningsPage() {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const [earnings, platformFeePercent] = await Promise.all([
    getInstructorEarnings(session.user.id),
    getPlatformFeePercent(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <Suspense fallback={<Skeleton className="h-20 w-full rounded-2xl" />}>
        <StripeConnectBanner platformFeePercent={platformFeePercent} />
      </Suspense>
      <InstructorEarningsClient earnings={earnings} platformFeePercent={platformFeePercent} />
    </div>
  );
}
