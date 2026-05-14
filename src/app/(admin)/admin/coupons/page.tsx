import { prisma } from "@/lib/prisma";
import { CouponsClient } from "@/components/admin/coupons-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cupones | Admin" };

export default async function AdminCouponsPage() {
  const [rawCoupons, courses] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { course: { select: { id: true, title: true } } },
    }),
    prisma.course.findMany({
      where: { status: "published" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const codes = rawCoupons.map((c) => c.code);
  const usages = codes.length
    ? await prisma.transaction.findMany({
        where: { couponCode: { in: codes } },
        select: {
          id: true,
          couponCode: true,
          courseId: true,
          userId: true,
          amount: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const usagesByCoupon: Record<string, typeof usages> = {};
  for (const u of usages) {
    if (!u.couponCode) continue;
    if (!usagesByCoupon[u.couponCode]) usagesByCoupon[u.couponCode] = [];
    usagesByCoupon[u.couponCode].push(u);
  }

  const coupons = rawCoupons.map((c) => ({
    ...c,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    usages: (usagesByCoupon[c.code] ?? []).map((u) => ({
      ...u,
      discountPct: c.discountPct,
      createdAt: u.createdAt.toISOString(),
    })),
  }));

  return <CouponsClient initialCoupons={coupons} courses={courses} />;
}
