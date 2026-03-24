import type { Metadata } from "next";
import { BusinessHero } from "@/components/business/business-hero";
import { BusinessBenefits } from "@/components/business/business-benefits";
import { BusinessHowItWorks } from "@/components/business/business-how-it-works";
import { BusinessPricing } from "@/components/business/business-pricing";
import { BusinessCTA } from "@/components/business/business-cta";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Cursumi Business | Capacitación empresarial",
  description:
    "Capacita a tu equipo con cursos de calidad. Gestiona empleados, mide progreso y genera certificados desde un solo panel.",
  alternates: { canonical: `${baseUrl}/business` },
  openGraph: {
    title: "Cursumi Business | Capacitación empresarial",
    description:
      "Capacita a tu equipo con cursos de calidad. Gestiona empleados, mide progreso y genera certificados.",
    url: `${baseUrl}/business`,
    type: "website",
  },
};

export default function BusinessPage() {
  return (
    <div className="flex flex-col">
      <BusinessHero />
      <BusinessBenefits />
      <BusinessHowItWorks />
      <BusinessPricing />
      <BusinessCTA />
    </div>
  );
}
