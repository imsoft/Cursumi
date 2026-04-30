import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    // Revoke all sessions first so the cookie becomes invalid immediately
    await auth.api.revokeUserSessions({
      headers: await headers(),
    });

    // Delete the user — cascade handles all related data
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
