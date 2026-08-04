import type { GovernanceRole } from "@/generated/prisma";

/**
 * Lógica PURA del documento de gobernanza: quién tiene acceso, cómo se lee el
 * contenido y cuándo entra en vigor. Sin Prisma ni sesión a propósito, para
 * poder testearla aislada. El acceso a datos vive en `governance-service.ts`.
 */

/** Slug del documento de acuerdos entre socios. */
export const GOVERNANCE_DOC_SLUG = "alineacion-socios";

export type Signatory = {
  email: string;
  role: GovernanceRole;
  /** Cargo mostrado en la UI. */
  title: string;
  /**
   * Si debe firmar para que el documento quede en vigor.
   * La cuenta principal (empresa) redacta y publica, pero no firma:
   * quienes se obligan son las personas (CEO y CFO).
   */
  mustSign: boolean;
};

/**
 * Personas con acceso al documento de gobernanza. Deliberadamente en código
 * (no en BD): así el acceso queda versionado en git y nadie puede concederse
 * permiso escribiendo en la base de datos.
 */
export const GOVERNANCE_SIGNATORIES: Signatory[] = [
  {
    email: "cursumi.com@gmail.com",
    role: "owner",
    title: "Cuenta principal",
    mustSign: false,
  },
  {
    email: "brangarciaramos@gmail.com",
    role: "ceo",
    title: "CEO",
    mustSign: true,
  },
  {
    email: "rahamperys@gmail.com",
    role: "cfo",
    title: "CFO",
    mustSign: true,
  },
];

/** Firmantes obligatorios (los que deben aceptar para que entre en vigor). */
export const REQUIRED_SIGNATORIES = GOVERNANCE_SIGNATORIES.filter((s) => s.mustSign);

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/** Devuelve el firmante asociado a un correo, o null si no tiene acceso. */
export function getSignatory(email: string | null | undefined): Signatory | null {
  const target = normalizeEmail(email);
  if (!target) return null;
  return GOVERNANCE_SIGNATORIES.find((s) => s.email === target) ?? null;
}

export function isOwner(email: string | null | undefined): boolean {
  return getSignatory(email)?.role === "owner";
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export type GovernanceQuestion = {
  id: string;
  q: string;
  /** Dato de contexto: cómo está montado hoy en la plataforma. */
  note?: string;
  /** Acuerdo redactado por el dueño. */
  answer: string;
};

export type GovernanceSection = {
  id: string;
  tag: string;
  title: string;
  questions: GovernanceQuestion[];
};

export type GovernanceContent = {
  intro: string;
  sections: GovernanceSection[];
};

/** Normaliza el Json de la BD al tipo de contenido (defensivo). */
export function parseContent(raw: unknown): GovernanceContent {
  const empty: GovernanceContent = { intro: "", sections: [] };
  if (!raw || typeof raw !== "object") return empty;
  const o = raw as GovernanceContent;
  if (!Array.isArray(o.sections)) return empty;
  return { intro: typeof o.intro === "string" ? o.intro : "", sections: o.sections };
}

/** Cuenta preguntas totales y cuántas tienen acuerdo escrito. */
export function contentStats(content: GovernanceContent): { total: number; answered: number } {
  let total = 0;
  let answered = 0;
  for (const s of content.sections) {
    for (const q of s.questions) {
      total++;
      if (q.answer && q.answer.trim()) answered++;
    }
  }
  return { total, answered };
}

/**
 * Estado de firmas de una versión: quién firmó, quién falta y si ya está en vigor.
 * Solo cuentan las firmas de los correos declarados como firmantes obligatorios.
 */
export function signatureStatus(
  acceptances: {
    userId: string;
    email: string;
    role: GovernanceRole;
    fullName: string;
    acceptedAt: Date;
  }[],
) {
  const signed = new Map(acceptances.map((a) => [normalizeEmail(a.email), a]));
  const rows = REQUIRED_SIGNATORIES.map((s) => ({
    ...s,
    acceptance: signed.get(s.email) ?? null,
  }));
  const pending = rows.filter((r) => !r.acceptance);
  return { rows, pending, inForce: pending.length === 0 && rows.length > 0 };
}

// ─── Comparación entre versiones ──────────────────────────────────────────────

export type CambiosVersion = {
  /** Ids de preguntas cuyo acuerdo cambió respecto a la versión anterior. */
  modificadas: Set<string>;
  /** Ids de preguntas que no existían en la versión anterior. */
  nuevas: Set<string>;
  /** Preguntas que estaban antes y ya no están (texto de la pregunta). */
  eliminadas: string[];
  introCambio: boolean;
};

function mapaDeRespuestas(c: GovernanceContent): Map<string, { q: string; answer: string }> {
  const m = new Map<string, { q: string; answer: string }>();
  for (const s of c.sections) {
    for (const q of s.questions) m.set(q.id, { q: q.q, answer: q.answer ?? "" });
  }
  return m;
}

/**
 * Qué se movió entre dos versiones publicadas.
 *
 * Un historial que solo lista fechas no sirve para gobernanza: lo que importa
 * es qué acuerdo concreto cambió, porque eso es lo que cada firmante tiene que
 * volver a aceptar. `anterior` va en null para la primera versión.
 */
export function compararVersiones(
  actual: GovernanceContent,
  anterior: GovernanceContent | null,
): CambiosVersion {
  const vacio: CambiosVersion = {
    modificadas: new Set(),
    nuevas: new Set(),
    eliminadas: [],
    introCambio: false,
  };
  if (!anterior) return vacio;

  const antes = mapaDeRespuestas(anterior);
  const ahora = mapaDeRespuestas(actual);

  const modificadas = new Set<string>();
  const nuevas = new Set<string>();
  for (const [id, val] of ahora) {
    const previo = antes.get(id);
    if (!previo) nuevas.add(id);
    else if (previo.answer.trim() !== val.answer.trim()) modificadas.add(id);
  }

  const eliminadas: string[] = [];
  for (const [id, val] of antes) {
    if (!ahora.has(id)) eliminadas.push(val.q);
  }

  return {
    modificadas,
    nuevas,
    eliminadas,
    introCambio: (anterior.intro ?? "").trim() !== (actual.intro ?? "").trim(),
  };
}
