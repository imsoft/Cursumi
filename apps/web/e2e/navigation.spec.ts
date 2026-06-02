import { test, expect } from "@playwright/test";

test.describe("Navegación y páginas públicas", () => {
  test("Home carga correctamente", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Página de login accesible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("Página de registro accesible", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
  });

  test("Términos y condiciones accesibles", async ({ page }) => {
    await page.goto("/terminos");
    await expect(page).toHaveURL("/terminos");
  });

  test("Aviso de privacidad accesible", async ({ page }) => {
    await page.goto("/privacidad");
    await expect(page).toHaveURL("/privacidad");
  });

  test("404 para rutas inexistentes", async ({ page }) => {
    const response = await page.goto("/esta-ruta-no-existe-9999");
    expect(response?.status()).toBe(404);
  });

  test("Rutas admin redirigen a login sin sesión", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/);
  });

  test("Rutas instructor redirigen a login sin sesión", async ({ page }) => {
    await page.goto("/instructor");
    await expect(page).toHaveURL(/login/);
  });
});
