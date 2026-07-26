import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-helpers";
import { getCachedSession } from "@/lib/session";
import { GOVERNANCE_DOC_SLUG, getSignatory, type Signatory } from "@/lib/governance";
import { GOVERNANCE_SEED_CONTENT, GOVERNANCE_DOC_TITLE } from "@/lib/governance-content";

/** Acceso a datos y control de sesión del documento de gobernanza. */

export type GovernanceAccess = {
  userId: string;
  email: string;
  name: string | null;
  signatory: Signatory;
};

/**
 * Exige sesión iniciada Y que el correo esté en la lista de firmantes.
 * Lanza ApiError para las rutas de API; las páginas usan `getGovernanceAccess`.
 */
export async function requireGovernanceAccess(): Promise<GovernanceAccess> {
  const session = await getCachedSession();
  if (!session?.user?.id) throw new ApiError(401, "Necesitas iniciar sesión");

  const signatory = getSignatory(session.user.email);
  if (!signatory) throw new ApiError(403, "No tienes acceso a este documento");

  return {
    userId: session.user.id,
    email: signatory.email,
    name: session.user.name ?? null,
    signatory,
  };
}

/** Igual que `requireGovernanceAccess` pero devuelve null en vez de lanzar. */
export async function getGovernanceAccess(): Promise<GovernanceAccess | null> {
  try {
    return await requireGovernanceAccess();
  } catch {
    return null;
  }
}

/** Solo la cuenta principal puede redactar y publicar. */
export async function requireGovernanceOwner(): Promise<GovernanceAccess> {
  const access = await requireGovernanceAccess();
  if (access.signatory.role !== "owner") {
    throw new ApiError(403, "Solo la cuenta principal puede editar el documento");
  }
  return access;
}

/**
 * Carga el documento con su última versión publicada y las firmas de ésta.
 * Lo crea con el contenido semilla la primera vez que se abre.
 */
export async function getGovernanceDocument() {
  let doc = await prisma.governanceDocument.findUnique({
    where: { slug: GOVERNANCE_DOC_SLUG },
  });

  if (!doc) {
    doc = await prisma.governanceDocument.create({
      data: {
        slug: GOVERNANCE_DOC_SLUG,
        title: GOVERNANCE_DOC_TITLE,
        content: GOVERNANCE_SEED_CONTENT as object,
        version: 0,
      },
    });
  }

  const currentVersion =
    doc.version > 0
      ? await prisma.governanceVersion.findUnique({
          where: { documentId_version: { documentId: doc.id, version: doc.version } },
          include: { acceptances: { orderBy: { acceptedAt: "asc" } } },
        })
      : null;

  return { doc, currentVersion };
}

/** Historial de versiones publicadas con sus firmas (para el registro). */
export async function getGovernanceHistory(documentId: string) {
  return prisma.governanceVersion.findMany({
    where: { documentId },
    orderBy: { version: "desc" },
    include: { acceptances: { orderBy: { acceptedAt: "asc" } } },
  });
}
