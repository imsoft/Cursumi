import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BecomeInstructorClient } from "./become-instructor-client";

export default async function BecomeInstructorPage() {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  // Si ya es instructor o admin, redirigir
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role === "instructor") redirect("/instructor");
  if (user?.role === "admin") redirect("/admin");

  // Obtener solicitud existente
  const application = await prisma.instructorApplication.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
      headline: true,
      bio: true,
      reason: true,
      rejectionReason: true,
      createdAt: true,
    },
  });

  return <BecomeInstructorClient application={application} />;
}
