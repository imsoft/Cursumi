import { prisma } from "./prisma";

export async function getUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role || "student";
}

/** Devuelve `role` e `image` en una sola query — ideal para layouts. */
export async function getUserBasicInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, image: true },
  });
  return { role: user?.role ?? "student", image: user?.image ?? null };
}
