import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAuthTables } from "@better-auth/core/db";

// auth.ts carga Prisma al importarse; aquí solo necesitamos sus opciones.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
const { auth } = await import("@/lib/auth");

/**
 * Esquema que better-auth espera para NUESTRA configuración (plugins incluidos)
 * contra prisma/schema.prisma. Desde 1.7.3 better-auth valida esto en cada
 * petición de /api/auth y, si falta una columna, rechaza TODO el login en
 * producción; y ni el build ni CI lo detectaban (pasó con `issuer` en 1.7.0 y
 * con `failedVerificationCount` en 1.7.7).
 */
function prismaModels(): Map<string, Set<string>> {
  const src = readFileSync(resolve(__dirname, "../../../prisma/schema.prisma"), "utf-8");
  const models = new Map<string, Set<string>>();
  for (const m of src.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
    const fields = new Set<string>();
    for (const line of m[2].split("\n")) {
      const f = line.match(/^\s+(\w+)\s+[\w\[\]?]+/);
      if (f && !line.trim().startsWith("@@") && !line.trim().startsWith("//")) fields.add(f[1]);
    }
    models.set(m[1], fields);
  }
  return models;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

describe("prisma/schema.prisma cubre lo que espera better-auth", () => {
  const models = prismaModels();
  const tables = getAuthTables(auth.options);

  it("cada tabla y columna de better-auth existe en Prisma", () => {
    const missing: string[] = [];
    for (const [key, table] of Object.entries(tables)) {
      const modelName = cap(table.modelName ?? key);
      const fields = models.get(modelName);
      if (!fields) { missing.push(`modelo ${modelName}`); continue; }
      for (const [fieldKey, field] of Object.entries(table.fields)) {
        const name = field.fieldName ?? fieldKey;
        if (!fields.has(name)) missing.push(`${modelName}.${name}`);
      }
    }
    expect(missing, "Falta en prisma/schema.prisma (añadir migración antes de subir better-auth)").toEqual([]);
  });

  it("incluye las columnas que rompieron en 1.7.0 y 1.7.7", () => {
    expect(models.get("TwoFactor")?.has("failedVerificationCount")).toBe(true);
    expect(models.get("Account")?.has("issuer")).toBe(true);
  });
});
