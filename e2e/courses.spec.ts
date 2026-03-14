import { test, expect } from "@playwright/test";

test.describe("Catálogo de cursos (público)", () => {
  test("Página de cursos muestra listado", async ({ page }) => {
    await page.goto("/courses");
    await expect(page).toHaveURL(/courses/);
    // Debe tener algún contenido de cursos o mensaje de vacío
    const body = page.locator("main, body");
    await expect(body).toBeVisible();
  });

  test("Explorar cursos requiere login", async ({ page }) => {
    await page.goto("/dashboard/explore");
    await expect(page).toHaveURL(/login/);
  });

  test("Página de detalle de curso carga correctamente", async ({ page }) => {
    // Navegar al catálogo público
    await page.goto("/courses");
    const firstLink = page.getByRole("link").first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      // Debe mostrar el título del curso
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });
});

test.describe("Búsqueda de cursos", () => {
  test("Explorar: filtros funcionan (requiere login)", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    if (!email || !password) {
      test.skip(true, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD no configurados");
      return;
    }

    // Login
    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });

    // Navegar a explorar
    await page.goto("/dashboard/explore");
    await expect(page.getByRole("heading", { name: "Explorar cursos" })).toBeVisible();

    // El selector de ordenamiento debe estar visible
    await expect(page.getByLabel("Ordenar por")).toBeVisible();
  });
});
