import { prisma } from "@/lib/prisma";
import { CouponsClient } from "@/components/admin/coupons-client";

export const metadata = { title: "Cupones | Admin" };

export default async function AdminCouponsPage() {
  const raw = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const coupons = raw.map((c) => ({
    ...c,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
  return <CouponsClient initialCoupons={coupons} />;
}
