import { prisma } from "./prisma";

export type ProfileData = {
  fullName: string;
  email: string;
  joinDate: string;
  avatar: string | null;
  coursesCompleted: number;
  coursesInProgress: number;
};

export async function getProfileData(userId: string): Promise<ProfileData> {
  const [user, enrollments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true, image: true },
    }),
    prisma.enrollment.findMany({
      where: { studentId: userId },
      select: { status: true, progress: true },
    }),
  ]);

  const coursesCompleted = enrollments.filter(
    (e) => e.status === "completed" || e.progress >= 100
  ).length;
  const coursesInProgress = enrollments.filter(
    (e) => e.status !== "completed" && e.progress < 100
  ).length;

  return {
    fullName: user?.name || "Usuario",
    email: user?.email || "",
    joinDate: user?.createdAt?.toISOString() ?? "",
    avatar: user?.image || null,
    coursesCompleted,
    coursesInProgress,
  };
}
