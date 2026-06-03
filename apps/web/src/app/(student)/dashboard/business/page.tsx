import type { Metadata } from "next";
import { BusinessHero } from "@/components/business/business-hero";
import { BusinessBenefits } from "@/components/business/business-benefits";
import { BusinessHowItWorks } from "@/components/business/business-how-it-works";
import { BusinessPricing } from "@/components/business/business-pricing";
import { BusinessCTA } from "@/components/business/business-cta";

export const metadata: Metadata = {
  title: "Para empresas | Cursumi",
  robots: { index: false, follow: false },
};

// Misma landing de Cursumi Business, pero dentro del panel del usuario (conserva
// el sidebar/header del dashboard).
export default function DashboardBusinessPage() {
  return (
    <div className="-mx-4 -my-4 flex flex-col md:-mx-6 md:-my-6 lg:-mx-8 lg:-my-8">
      <BusinessHero quoteHref="/dashboard/business/cotizacion" />
      <BusinessBenefits />
      <BusinessHowItWorks />
      <BusinessPricing quoteHref="/dashboard/business/cotizacion" />
      <BusinessCTA quoteHref="/dashboard/business/cotizacion" />
    </div>
  );
}
