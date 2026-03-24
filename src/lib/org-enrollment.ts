import { prisma } from "@/lib/prisma";

/**
 * Sync enrollments for all members of an org across all org-accessible courses.
 * Creates missing enrollments; does NOT remove existing ones.
 */
export async function syncOrgEnrollments(organizationId: string) {
  const [courseAccess, members] = await Promise.all([
    prisma.orgCourseAccess.findMany({
      where: { organizationId },
      select: { courseId: true },
    }),
    prisma.orgMember.findMany({
      where: { organizationId },
      select: { userId: true },
    }),
  ]);

  if (courseAccess.length === 0 || members.length === 0) return;

  const courseIds = courseAccess.map((ca) => ca.courseId);
  const userIds = members.map((m) => m.userId);

  // Find existing enrollments for this org
  const existing = await prisma.enrollment.findMany({
    where: {
      organizationId,
      courseId: { in: courseIds },
      studentId: { in: userIds },
    },
    select: { courseId: true, studentId: true },
  });

  const existingSet = new Set(
    existing.map((e) => `${e.courseId}:${e.studentId}`)
  );

  // Build missing enrollment data
  const toCreate: { courseId: string; studentId: string; organizationId: string }[] = [];
  for (const courseId of courseIds) {
    for (const userId of userIds) {
      if (!existingSet.has(`${courseId}:${userId}`)) {
        toCreate.push({ courseId, studentId: userId, organizationId });
      }
    }
  }

  if (toCreate.length === 0) return;

  // Use skipDuplicates in case of race conditions with @@unique([courseId, studentId])
  await prisma.enrollment.createMany({
    data: toCreate,
    skipDuplicates: true,
  });
}

/**
 * Enroll a single member in all org courses.
 * Called when a new member joins the org.
 */
export async function enrollMemberInOrgCourses(
  userId: string,
  organizationId: string
) {
  const courseAccess = await prisma.orgCourseAccess.findMany({
    where: { organizationId },
    select: { courseId: true },
  });

  if (courseAccess.length === 0) return;

  await prisma.enrollment.createMany({
    data: courseAccess.map((ca) => ({
      courseId: ca.courseId,
      studentId: userId,
      organizationId,
    })),
    skipDuplicates: true,
  });
}

/**
 * Enroll all org members in a specific course.
 * Called when a course is added to org access.
 */
export async function enrollOrgInCourse(
  organizationId: string,
  courseId: string
) {
  const members = await prisma.orgMember.findMany({
    where: { organizationId },
    select: { userId: true },
  });

  if (members.length === 0) return;

  await prisma.enrollment.createMany({
    data: members.map((m) => ({
      courseId,
      studentId: m.userId,
      organizationId,
    })),
    skipDuplicates: true,
  });
}
