import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionSafe } from "@/lib/session";
import { AcceptInviteClient } from "@/components/business/accept-invite-client";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: Props) {
  const { token } = await params;
  const session = await getSessionSafe();

  const invite = await prisma.orgInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true, logoUrl: true } } },
  });

  if (!invite || invite.status !== "pending") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Invitación no válida</h1>
        <p className="text-muted-foreground">
          Esta invitación ya fue usada, expiró, o no existe.
        </p>
      </div>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Invitación expirada</h1>
        <p className="text-muted-foreground">
          Esta invitación ha expirado. Pide a tu administrador que envíe una nueva.
        </p>
      </div>
    );
  }

  // If not logged in, redirect to login with return URL
  if (!session) {
    redirect(`/login?callbackUrl=/business/invite/${token}`);
  }

  return (
    <AcceptInviteClient
      token={token}
      orgName={invite.organization.name}
      orgLogo={invite.organization.logoUrl}
      inviteEmail={invite.email}
      userEmail={session.user.email}
    />
  );
}
