import { describe, it, expect, vi } from "vitest";
import { createVerify, generateKeyPairSync } from "node:crypto";

// El módulo importa prisma (que exige DATABASE_URL); aquí solo probamos lo puro.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

const { buildApnsJwt, buildApnsBody, isApnsToken } = await import("@/lib/apns-push");

describe("apns-push", () => {
  it("reconoce tokens apns:<64 hex> y rechaza el resto", () => {
    expect(isApnsToken(`apns:${"ab".repeat(32)}`)).toBe(true);
    expect(isApnsToken(`apns:${"AB".repeat(32)}`)).toBe(true);
    expect(isApnsToken("apns:corto")).toBe(false);
    expect(isApnsToken("ExponentPushToken[xyz]")).toBe(false);
  });

  it("firma un JWT ES256 verificable con la clave pública", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    const jwt = buildApnsJwt({ keyId: "ABC1234567", teamId: "TEAM123456", privateKey: pem }, 1_700_000_000);
    const [header, claims, signature] = jwt.split(".");
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({ alg: "ES256", kid: "ABC1234567" });
    expect(JSON.parse(Buffer.from(claims, "base64url").toString())).toEqual({ iss: "TEAM123456", iat: 1_700_000_000 });
    const verifier = createVerify("SHA256");
    verifier.update(`${header}.${claims}`);
    expect(verifier.verify({ key: publicKey, dsaEncoding: "ieee-p1363" }, Buffer.from(signature, "base64url"))).toBe(true);
  });

  it("acepta la clave con saltos de línea escapados (como en Vercel)", () => {
    const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString().replace(/\n/g, "\\n");
    expect(() => buildApnsJwt({ keyId: "k", teamId: "t", privateKey: pem })).not.toThrow();
  });

  it("arma el cuerpo con alert, sonido y la URL de destino", () => {
    const body = JSON.parse(buildApnsBody({ title: "Hola", body: "Cuerpo", url: "/dashboard" }));
    expect(body.aps.alert).toEqual({ title: "Hola", body: "Cuerpo" });
    expect(body.aps.sound).toBe("default");
    expect(body.url).toBe("/dashboard");
    expect(JSON.parse(buildApnsBody({ title: "A", body: "B" })).url).toBeUndefined();
  });
});
