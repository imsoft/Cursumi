import { prisma } from "./prisma";

export async function getUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role || "student";
}
