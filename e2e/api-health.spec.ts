import { test, expect } from "@playwright/test";

/**
 * API health checks: verifica que los endpoints públicos y protegidos
 * responden con los status HTTP correctos.
 *
 * No prueba lógica de negocio — prueba que los endpoints EXISTEN y no dan 500.
 */

test.describe("API pública: endpoints sin autenticación", () => {
  test("GET /api/categories — retorna 200 con array", async ({ request }) => {
    const res = await request.get("/api/categories");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/courses/public — retorna 200 o 404 (no 500)", async ({ request }) => {
    const res = await request.get("/api/courses/public");
    expect(res.status()).not.toBe(500);
  });
});

test.describe("API protegida: debe retornar 401 sin sesión", () => {
  const PROTECTED_ENDPOINTS = [
    { method: "GET", path: "/api/me/profile" },
    { method: "GET", path: "/api/me/certificates" },
    { method: "GET", path: "/api/notifications" },
    { method: "GET", path: "/api/instructor/courses" },
    { method: "GET", path: "/api/admin/users" },
    { method: "GET", path: "/api/business/materials" },
  ];

  for (const { method, path } of PROTECTED_ENDPOINTS) {
    test(`${method} ${path} → 401 sin sesión`, async ({ request }) => {
      const res = method === "GET"
        ? await request.get(path)
        : await request.post(path);
      // Debe ser 401 (no autorizado) — nunca 500 ni 200
      expect([401, 403]).toContain(res.status());
    });
  }
});

test.describe("API: métodos incorrectos retornan 405 o similar", () => {
  test("POST /api/categories (si es solo GET) no da 500", async ({ request }) => {
    const res = await request.post("/api/categories", { data: {} });
    // Puede ser 401, 403, 405 — pero no 500
    expect(res.status()).not.toBe(500);
  });
});

test.describe("API: endpoints de upload protegidos", () => {
  test("POST /api/upload/course-cover sin sesión → 401", async ({ request }) => {
    const res = await request.post("/api/upload/course-cover");
    expect([401, 403]).toContain(res.status());
  });

  test("POST /api/upload/attachment sin sesión → 401", async ({ request }) => {
    const res = await request.post("/api/upload/attachment");
    expect([401, 403]).toContain(res.status());
  });

  test("POST /api/cloudinary/signature sin sesión → 401", async ({ request }) => {
    const res = await request.post("/api/cloudinary/signature", {
      data: { folder: "attachments" },
    });
    expect([401, 403]).toContain(res.status());
  });
});

test.describe("API: endpoints de pago protegidos", () => {
  test("POST /api/payments/checkout sin sesión → 401", async ({ request }) => {
    const res = await request.post("/api/payments/checkout", {
      json: { courseId: "fake-id" },
    });
    expect([401, 403]).toContain(res.status());
  });
});
