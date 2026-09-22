import type { Metadata } from "next";
import { PayoutsClient } from "@/components/admin/payouts-client";

export const metadata: Metadata = {
  title: "Pagos a instructores",
  description: "Ventas cobradas por Cursumi cuya parte del instructor sigue pendiente de transferir.",
};

export default function AdminPayoutsPage() {
  return <PayoutsClient />;
}
