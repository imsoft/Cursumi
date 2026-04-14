import { test, expect } from "@playwright/test";

/**
 * Smoke tests: verifica que cada página pública carga sin errores 500
 * y muestra contenido mínimo (<body> visible, no blank screen).
 *
 * Se ejecutan sin sesión — cubren la capa de rendering y SSR.
 */

const PUBLIC_PAGES = [
  { path: "/", name: "Home" },
  { path: "/courses", name: "Catálogo de cursos" },
  { path: "/login", name: "Login" },
  { path: "/signup", name: "Registro" },
  { path: "/pricing", name: "Precios" },
  { path: "/how-it-works", name: "Cómo funciona" },
  { path: "/instructors", name: "Instructores" },
  { path: "/terminos", name: "Términos y condiciones" },
  { path: "/privacidad", name: "Aviso de privacidad" },
  { path: "/contact", name: "Contacto" },
  { path: "/business", name: "Cursumi Business" },
  { path: "/forgot-password", name: "Recuperar contraseña" },
];

test.describe("Smoke: páginas públicas cargan sin errores", () => {
  for (const { path, name } of PUBLIC_PAGES) {
    test(`${name} (${path})`, async ({ page }) => {
      const errors: string[] = [];

      // Captura errores de consola
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      // Captura requests fallidas
      page.on("requestfailed", (req) => {
        // ignoramos recursos de terceros (fonts, analytics, etc.)
        const url = req.url();
        if (url.includes("localhost") || url.includes("127.0.0.1")) {
          errors.push(`Request failed: ${url}`);
        }
      });

      const response = await page.goto(path, { waitUntil: "domcontentloaded" });

      // No debe ser 500
      expect(response?.status()).not.toBe(500);
      expect(response?.status()).not.toBe(502);
      expect(response?.status()).not.toBe(503);

      // El body debe existir y ser visible
      await expect(page.locator("body")).toBeVisible();

      // No debe tener una página de error de Next.js
      const pageText = await page.locator("body").innerText().catch(() => "");
      expect(pageText).not.toContain("Application error");
      expect(pageText).not.toContain("Internal Server Error");
    });
  }
});

test.describe("Smoke: páginas de error estáticas", () => {
  test("404 para ruta inexistente", async ({ page }) => {
    const response = await page.goto("/ruta-que-no-existe-99999");
    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Smoke: meta tags SEO presentes en home", () => {
  test("home tiene title y description", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
    expect(title).toContain("Cursumi");

    const description = page.locator('meta[name="description"]');
    const content = await description.getAttribute("content");
    expect(content?.length).toBeGreaterThan(10);
  });

  test("home tiene OG tags", async ({ page }) => {
    await page.goto("/");
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);
  });
});

test.describe("Smoke: comportamiento responsive", () => {
  test("home carga en viewport móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const response = await page.goto("/");
    expect(response?.status()).not.toBe(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("página de cursos carga en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const response = await page.goto("/courses");
    expect(response?.status()).not.toBe(500);
    await expect(page.locator("body")).toBeVisible();
  });
});
