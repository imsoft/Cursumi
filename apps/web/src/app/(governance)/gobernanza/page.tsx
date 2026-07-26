import { redirect } from "next/navigation";
import { parseContent, signatureStatus } from "@/lib/governance";
import {
  getGovernanceAccess,
  getGovernanceDocument,
  getGovernanceHistory,
} from "@/lib/governance-service";
import { GovernanceClient } from "@/components/governance/governance-client";

export default async function GovernancePage() {
  const access = await getGovernanceAccess();
  if (!access) redirect("/dashboard");

  const { doc, currentVersion } = await getGovernanceDocument();
  const history = await getGovernanceHistory(doc.id);

  const status = signatureStatus(currentVersion?.acceptances ?? []);

  // El dueño edita el borrador; los firmantes leen la versión publicada (lo
  // que realmente se obliga a cumplir), nunca el borrador en curso.
  const isOwner = access.signatory.role === "owner";
  const content = isOwner
    ? parseContent(doc.content)
    : parseContent(currentVersion?.content ?? { intro: "", sections: [] });

  const myAcceptance =
    currentVersion?.acceptances.find((a) => a.userId === access.userId) ?? null;

  return (
    <GovernanceClient
      title={doc.title}
      content={content}
      isOwner={isOwner}
      me={{
        name: access.name,
        email: access.email,
        title: access.signatory.title,
        mustSign: access.signatory.mustSign,
      }}
      version={doc.version}
      currentVersionId={currentVersion?.id ?? null}
      publishedAt={currentVersion?.publishedAt?.toISOString() ?? null}
      changeNote={currentVersion?.changeNote ?? null}
      draftUpdatedAt={doc.updatedAt.toISOString()}
      inForce={status.inForce}
      signatures={status.rows.map((r) => ({
        email: r.email,
        title: r.title,
        signed: !!r.acceptance,
        fullName: r.acceptance?.fullName ?? null,
        acceptedAt: r.acceptance?.acceptedAt?.toISOString() ?? null,
      }))}
      myAcceptance={
        myAcceptance
          ? { fullName: myAcceptance.fullName, acceptedAt: myAcceptance.acceptedAt.toISOString() }
          : null
      }
      history={history.map((v) => ({
        version: v.version,
        publishedAt: v.publishedAt.toISOString(),
        changeNote: v.changeNote,
        signatures: v.acceptances.map((a) => ({
          fullName: a.fullName,
          email: a.email,
          acceptedAt: a.acceptedAt.toISOString(),
        })),
      }))}
    />
  );
}
