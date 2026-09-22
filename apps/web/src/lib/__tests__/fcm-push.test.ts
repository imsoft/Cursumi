import { describe, it, expect, vi } from "vitest";
import { createVerify, generateKeyPairSync } from "node:crypto";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

const { buildGoogleJwt, buildFcmMessage, isFcmToken, readServiceAccount } = await import("@/lib/fcm-push");

describe("fcm-push", () => {
  it("reconoce tokens fcm:<token> y rechaza el resto", () => {
    expect(isFcmToken("fcm:dGhpcy1pcy1hLXRva2Vu:APA91bH_abc-123")).toBe(true);
    expect(isFcmToken("fcm:corto")).toBe(false);
    expect(isFcmToken(`apns:${"ab".repeat(32)}`)).toBe(false);
  });

  it("lee la cuenta de servicio solo si trae lo necesario", () => {
    expect(readServiceAccount("")).toBeNull();
    expect(readServiceAccount("no json")).toBeNull();
    expect(readServiceAccount(JSON.stringify({ project_id: "p" }))).toBeNull();
    expect(readServiceAccount(JSON.stringify({ project_id: "p", client_email: "e", private_key: "k" }))?.project_id).toBe("p");
  });

  it("firma un JWT RS256 verificable con la clave pública y el alcance de FCM", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    const jwt = buildGoogleJwt({ project_id: "p", client_email: "svc@p.iam.gserviceaccount.com", private_key: pem }, 1_700_000_000);
    const [header, claims, signature] = jwt.split(".");
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    const c = JSON.parse(Buffer.from(claims, "base64url").toString());
    expect(c.iss).toBe("svc@p.iam.gserviceaccount.com");
    expect(c.scope).toBe("https://www.googleapis.com/auth/firebase.messaging");
    expect(c.exp - c.iat).toBe(3600);
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${header}.${claims}`);
    expect(verifier.verify(publicKey, Buffer.from(signature, "base64url"))).toBe(true);
  });

  it("arma el mensaje v1 con notificación, canal y URL de destino", () => {
    const m = buildFcmMessage("tok", { title: "Hola", body: "Cuerpo", url: "/dashboard" }).message;
    expect(m.token).toBe("tok");
    expect(m.notification).toEqual({ title: "Hola", body: "Cuerpo" });
    expect(m.data).toEqual({ url: "/dashboard" });
    expect(m.android.notification.channel_id).toBe("default");
    expect(buildFcmMessage("t", { title: "A", body: "B" }).message.data).toEqual({});
  });
});
