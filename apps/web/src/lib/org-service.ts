import { prisma } from "@/lib/prisma";
import type { OrgRole } from "@/generated/prisma";
import { ApiError } from "@/lib/api-helpers";

/**
 * Get the organization membership for a user (first org found).
 * Returns null if user is not part of any org.
 */
export async function getOrgForUser(userId: string) {
  const membership = await prisma.orgMember.findFirst({
    where: { userId },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
    },
  });
  if (!membership) return null;
  return { org: membership.organization, membership };
}

/**
 * Require the user to be part of a specific org with one of the given roles.
 * Throws ApiError if not authorized.
 */
export async function requireOrgRole(
  userId: string,
  orgId: string,
  roles: OrgRole[]
) {
  const membership = await prisma.orgMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
  });
  if (!membership || !roles.includes(membership.orgRole)) {
    throw new ApiError(403, "No autorizado para esta organización");
  }
  return membership;
}

/**
 * Resolve orgId for the current user (owner or admin).
 * Used in API routes to avoid passing orgId in every request.
 */
export async function resolveOrgAdmin(userId: string) {
  const membership = await prisma.orgMember.findFirst({
    where: { userId, orgRole: { in: ["owner", "admin"] } },
    include: { organization: true },
  });
  if (!membership) {
    throw new ApiError(403, "No eres administrador de ninguna organización");
  }
  return { org: membership.organization, membership };
}

/**
 * Create a new organization with the creator as owner.
 */
export async function createOrganization(data: {
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
  ownerId: string;
}) {
  const existing = await prisma.organization.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw new ApiError(400, "Ya existe una organización con ese identificador");
  }

  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        logoUrl: data.logoUrl,
      },
    });

    await tx.orgMember.create({
      data: {
        organizationId: org.id,
        userId: data.ownerId,
        orgRole: "owner",
      },
    });

    return org;
  });
}

/**
 * List members of an organization with user details and enrollment stats.
 */
export async function listOrgMembers(orgId: string) {
  return prisma.orgMember.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          enrollments: {
            where: { organizationId: orgId },
            select: {
              id: true,
              courseId: true,
              progress: true,
              status: true,
              certificate: { select: { id: true } },
            },
          },
        },
      },
      teamMemberships: {
        include: { team: { select: { id: true, name: true } } },
      },
    },
    orderBy: { joinedAt: "asc" },
  });
}

/**
 * Get org-level metrics: completion rates, certificates, etc.
 */
export async function getOrgMetrics(orgId: string) {
  const [memberCount, enrollments, certificates] = await Promise.all([
    prisma.orgMember.count({ where: { organizationId: orgId } }),
    prisma.enrollment.findMany({
      where: { organizationId: orgId },
      select: { progress: true, status: true, courseId: true },
    }),
    prisma.certificate.count({
      where: {
        enrollment: { organizationId: orgId },
      },
    }),
  ]);

  const courseAccess = await prisma.orgCourseAccess.count({
    where: { organizationId: orgId },
  });

  const totalEnrollments = enrollments.length;
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments
        )
      : 0;
  const completed = enrollments.filter((e) => e.status === "completed").length;

  // Per-course breakdown
  const courseMap = new Map<
    string,
    { total: number; sumProgress: number; completed: number }
  >();
  for (const e of enrollments) {
    const entry = courseMap.get(e.courseId) || {
      total: 0,
      sumProgress: 0,
      completed: 0,
    };
    entry.total++;
    entry.sumProgress += e.progress;
    if (e.status === "completed") entry.completed++;
    courseMap.set(e.courseId, entry);
  }

  const courseBreakdown = Array.from(courseMap.entries()).map(
    ([courseId, data]) => ({
      courseId,
      enrolled: data.total,
      avgProgress: Math.round(data.sumProgress / data.total),
      completed: data.completed,
    })
  );

  return {
    memberCount,
    courseAccessCount: courseAccess,
    totalEnrollments,
    avgProgress,
    completedEnrollments: completed,
    certificates,
    courseBreakdown,
  };
}

/**
 * Slugify a string for org slugs.
 */
export function slugifyOrg(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
