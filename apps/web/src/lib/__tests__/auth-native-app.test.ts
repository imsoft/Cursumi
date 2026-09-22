import { describe, it, expect } from "vitest";
import { withCookieInNativeRedirect } from "@/lib/auth-native-app";

const trusted = (u: string) => u.startsWith("mobile://");

describe("withCookieInNativeRedirect", () => {
  it("añade la cookie al deep link de la app", () => {
    const out = withCookieInNativeRedirect("mobile://", "better-auth.session_token=abc; Path=/", trusted);
    expect(out).not.toBeNull();
    const url = new URL(out!);
    expect(url.protocol).toBe("mobile:");
    expect(url.searchParams.get("cookie")).toBe("better-auth.session_token=abc; Path=/");
  });

  it("no toca redirecciones web", () => {
    expect(withCookieInNativeRedirect("https://cursumi.com/dashboard", "x=1", trusted)).toBeNull();
    expect(withCookieInNativeRedirect("http://localhost:3000/", "x=1", trusted)).toBeNull();
  });

  it("no filtra la cookie a schemes que no son de confianza", () => {
    expect(withCookieInNativeRedirect("otraapp://", "x=1", trusted)).toBeNull();
  });

  it("ignora casos sin cookie, sin location o con URL inválida", () => {
    expect(withCookieInNativeRedirect("mobile://", null, trusted)).toBeNull();
    expect(withCookieInNativeRedirect(null, "x=1", trusted)).toBeNull();
    expect(withCookieInNativeRedirect("no es url", "x=1", trusted)).toBeNull();
  });
});
