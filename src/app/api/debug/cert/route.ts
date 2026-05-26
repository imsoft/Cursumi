import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-helpers";

// Endpoint de diagnóstico temporal — eliminar después de resolver el bug
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const [certs, enrollments] = await Promise.all([
      prisma.certificate.findMany({
        where: { userId },
        select: { id: true, userId: true, courseId: true, type: true, enrollmentId: true },
      }),
      prisma.enrollment.findMany({
        where: { studentId: userId },
        select: { id: true, courseId: true, status: true, progress: true },
      }),
    ]);

    return NextResponse.json({
      sessionUserId: userId,
      sessionUserEmail: session.user.email,
      certificates: certs,
      enrollments: enrollments,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
