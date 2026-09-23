import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const leer = (rel: string) => readFileSync(resolve(__dirname, rel), "utf-8");
import { payoutLabel } from "@/lib/payout-status";

describe("payout-status es seguro para el navegador", () => {
  it("no importa Prisma ni Stripe (tumbó /instructor/earnings el 22/09/2026)", () => {
    const src = leer("../payout-status.ts");
    expect(src).not.toMatch(/from "\.\/prisma"|from "@\/lib\/prisma"|from "\.\/stripe"|from "@\/lib\/stripe"/);
  });

  it("los componentes de cliente no importan lib/payouts en runtime", () => {
    for (const f of ["../../components/instructor/instructor-earnings-client.tsx", "../../components/admin/payouts-client.tsx"]) {
      const src = leer(f);
      const runtimeImports = src.match(/^import (?!type )[^;]*from "@\/lib\/payouts";/gm) ?? [];
      expect(runtimeImports, f).toEqual([]);
    }
  });

  it("etiqueta la transferencia con fecha en horario de México", () => {
    expect(payoutLabel("transferred", "2026-09-22T23:51:28.610Z")).toMatch(/Transferido el 22 sept? 2026/);
  });
});
