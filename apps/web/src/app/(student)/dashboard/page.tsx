import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { listMyCourses } from "@/app/actions/course-actions";
import { StudentDashboardClient } from "@/components/student/student-dashboard-client";
import { prisma } from "@/lib/prisma";
import { listRecommendations } from "@/lib/course-service";
import type { ProfileField } from "@/components/student/profile-completeness";
import { firstNameFromFullName } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch courses first to reuse IDs for recommendations (avoids duplicate query)
  const courses = await listMyCourses();
  const excludeIds = courses.map((c) => c.id);

  // Parallel: recommendations + hours watched + user profile for completeness
  const [recommendations, orgMembership, hoursResult, userProfile] = await Promise.all([
    listRecommendations(excludeIds),
    prisma.orgMember.findFirst({
      where: { userId: session.user.id },
      select: { organization: { select: { name: true } } },
    }),
    prisma.$queryRaw<[{ total_minutes: number | null }]>`
      SELECT COALESCE(SUM(
        CASE
          WHEN l.duration ~ '^[0-9]+h [0-9]+m$' THEN
            (CAST(split_part(l.duration, 'h', 1) AS INT) * 60) +
            CAST(trim(split_part(split_part(l.duration, 'h ', 2), 'm', 1)) AS INT)
          WHEN l.duration ~ '^[0-9]+h$' THEN
            CAST(split_part(l.duration, 'h', 1) AS INT) * 60
          WHEN l.duration ~ '^[0-9]+m$' THEN
            CAST(split_part(l.duration, 'm', 1) AS INT)
          ELSE 0
        END
      ), 0) AS total_minutes
      FROM "LessonProgress" lp
      JOIN "Lesson" l ON l.id = lp."lessonId"
      JOIN "Enrollment" e ON e.id = lp."enrollmentId"
      WHERE e."studentId" = ${session.user.id}
    `,
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true, phone: true, city: true, bio: true, website: true, linkedinUrl: true, instagramUrl: true },
    }),
  ]);

  const totalMinutes = Number(hoursResult[0]?.total_minutes ?? 0);
  const hoursWatched = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : totalMinutes > 0
    ? `${totalMinutes}m`
    : "0h";

  const profileFields: ProfileField[] = [
    { key: "fullName", label: "Nombre completo", filled: !!userProfile?.name, anchor: "fullName" },
    { key: "image", label: "Foto de perfil", filled: !!userProfile?.image, anchor: "image" },
    { key: "phone", label: "Teléfono", filled: !!userProfile?.phone, anchor: "phone" },
    { key: "city", label: "Ciudad", filled: !!userProfile?.city, anchor: "city" },
    { key: "bio", label: "Biografía", filled: !!userProfile?.bio, anchor: "bio" },
    { key: "website", label: "Sitio web", filled: !!userProfile?.website, anchor: "website" },
    { key: "linkedinUrl", label: "LinkedIn", filled: !!userProfile?.linkedinUrl, anchor: "linkedinUrl" },
    { key: "instagramUrl", label: "Instagram", filled: !!userProfile?.instagramUrl, anchor: "instagramUrl" },
  ];

  return (
    <StudentDashboardClient
      name={firstNameFromFullName(session.user.name)}
      courses={courses}
      recommendations={recommendations}
      hoursWatched={hoursWatched}
      orgName={orgMembership?.organization.name}
      profileFields={profileFields}
    />
  );
}
