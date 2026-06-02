import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BusinessAdminClient } from "@/components/admin/business-admin-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Empresas | Admin Cursumi",
  robots: { index: false, follow: false },
};

export default async function AdminBusinessPage() {
  const [requests, organizations, courses] = await Promise.all([
    prisma.businessQuoteRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: true,
        _count: { select: { members: true, courseAccess: true } },
      },
    }),
    prisma.course.findMany({
      where: { status: "published" },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <BusinessAdminClient
      initialRequests={requests.map((r) => ({
        id: r.id,
        companyName: r.companyName,
        contactName: r.contactName,
        contactEmail: r.contactEmail,
        contactPhone: r.contactPhone,
        companySize: r.companySize,
        interests: r.interests,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }))}
      organizations={organizations.map((o) => ({
        id: o.id,
        name: o.name,
        contactEmail: o.contactEmail,
        members: o._count.members,
        courseAccess: o._count.courseAccess,
        subscription: o.subscription
          ? {
              status: o.subscription.status,
              maxSeats: o.subscription.maxSeats,
              amountCents: o.subscription.amountCents,
              billingInterval: o.subscription.billingInterval,
            }
          : null,
      }))}
      courses={courses}
    />
  );
}
