import type { Metadata } from "next";
import { ReferralDashboard } from "@/components/student/referral-dashboard";

export const metadata: Metadata = {
  title: "Programa de referidos",
  description: "Comparte Cursumi y gana comisiones.",
};

export default function ReferralPage() {
  return <ReferralDashboard />;
}
