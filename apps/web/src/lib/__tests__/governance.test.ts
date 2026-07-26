import { describe, it, expect } from "vitest";
import {
  GOVERNANCE_SIGNATORIES,
  REQUIRED_SIGNATORIES,
  getSignatory,
  isOwner,
  parseContent,
  contentStats,
  signatureStatus,
} from "@/lib/governance";
import { GOVERNANCE_SEED_CONTENT } from "@/lib/governance-content";

describe("firmantes", () => {
  it("solo hay tres correos con acceso", () => {
    expect(GOVERNANCE_SIGNATORIES).toHaveLength(3);
    expect(GOVERNANCE_SIGNATORIES.map((s) => s.email).sort()).toEqual([
      "brangarciaramos@gmail.com",
      "cursumi.com@gmail.com",
      "rahamperys@gmail.com",
    ]);
  });

  it("la cuenta principal publica pero no firma; CEO y CFO sí firman", () => {
    expect(getSignatory("cursumi.com@gmail.com")?.mustSign).toBe(false);
    expect(getSignatory("brangarciaramos@gmail.com")?.mustSign).toBe(true);
    expect(getSignatory("rahamperys@gmail.com")?.mustSign).toBe(true);
    expect(REQUIRED_SIGNATORIES.map((s) => s.role).sort()).toEqual(["ceo", "cfo"]);
  });

  it("reconoce el correo sin importar mayúsculas ni espacios", () => {
    expect(getSignatory("  CURSUMI.COM@Gmail.com ")?.role).toBe("owner");
    expect(isOwner("Cursumi.com@gmail.com")).toBe(true);
  });

  it("cualquier otro correo queda fuera", () => {
    expect(getSignatory("otro@gmail.com")).toBeNull();
    expect(getSignatory("")).toBeNull();
    expect(getSignatory(null)).toBeNull();
    expect(getSignatory(undefined)).toBeNull();
    // Un admin de la plataforma tampoco entra por ser admin.
    expect(getSignatory("admin@cursumi.com")).toBeNull();
    expect(isOwner("brangarciaramos@gmail.com")).toBe(false);
  });

  it("la cuenta duplicada del CFO (sin la 's') NO tiene acceso", () => {
    // Existen dos cuentas a nombre de la misma persona; solo firma la correcta.
    expect(getSignatory("rahampery@gmail.com")).toBeNull();
    expect(getSignatory("rahamperys@gmail.com")?.role).toBe("cfo");
  });
});

describe("contenido", () => {
  it("la semilla trae las 13 secciones y todas las preguntas vacías", () => {
    expect(GOVERNANCE_SEED_CONTENT.sections).toHaveLength(13);
    const { total, answered } = contentStats(GOVERNANCE_SEED_CONTENT);
    expect(total).toBeGreaterThanOrEqual(60);
    expect(answered).toBe(0);
  });

  it("los ids de pregunta son únicos (las respuestas no se pisan)", () => {
    const ids = GOVERNANCE_SEED_CONTENT.sections.flatMap((s) => s.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cuenta solo las respuestas con texto real", () => {
    const content = {
      intro: "",
      sections: [
        {
          id: "s",
          tag: "T",
          title: "T",
          questions: [
            { id: "a", q: "?", answer: "acordado" },
            { id: "b", q: "?", answer: "   " },
            { id: "c", q: "?", answer: "" },
          ],
        },
      ],
    };
    expect(contentStats(content)).toEqual({ total: 3, answered: 1 });
  });

  it("parseContent tolera basura sin romper", () => {
    expect(parseContent(null)).toEqual({ intro: "", sections: [] });
    expect(parseContent("texto")).toEqual({ intro: "", sections: [] });
    expect(parseContent({ sections: "no-es-array" })).toEqual({ intro: "", sections: [] });
  });
});

describe("estado de firmas", () => {
  const accept = (email: string, role: "ceo" | "cfo") => ({
    userId: "u-" + role,
    email,
    role,
    fullName: "Nombre Apellido",
    acceptedAt: new Date("2026-07-25T10:00:00Z"),
  });

  it("sin firmas no está en vigor y ambos aparecen pendientes", () => {
    const s = signatureStatus([]);
    expect(s.inForce).toBe(false);
    expect(s.pending).toHaveLength(2);
  });

  it("con una sola firma sigue sin estar en vigor", () => {
    const s = signatureStatus([accept("brangarciaramos@gmail.com", "ceo")]);
    expect(s.inForce).toBe(false);
    expect(s.pending.map((p) => p.role)).toEqual(["cfo"]);
  });

  it("con CEO y CFO queda en vigor", () => {
    const s = signatureStatus([
      accept("brangarciaramos@gmail.com", "ceo"),
      accept("rahamperys@gmail.com", "cfo"),
    ]);
    expect(s.inForce).toBe(true);
    expect(s.pending).toHaveLength(0);
    expect(s.rows.every((r) => r.acceptance)).toBe(true);
  });

  it("una firma de alguien fuera de la lista no pone el documento en vigor", () => {
    const s = signatureStatus([
      accept("brangarciaramos@gmail.com", "ceo"),
      { ...accept("otro@gmail.com", "cfo"), userId: "u-x" },
    ]);
    expect(s.inForce).toBe(false);
    expect(s.pending.map((p) => p.role)).toEqual(["cfo"]);
  });
});
