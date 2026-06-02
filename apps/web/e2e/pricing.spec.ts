import { test, expect } from "@playwright/test";

test.describe("Página de precios", () => {
  test("carga correctamente", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveURL("/pricing");
    await expect(page.getByRole("heading", { name: /Simple/i })).toBeVisible();
  });

  test("muestra sección para estudiantes", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/Para estudiantes/i)).toBeVisible();
  });

  test("muestra sección para instructores", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/Para instructores/i).first()).toBeVisible();
  });

  test("muestra sección empresarial", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/Para empresas/i).first()).toBeVisible();
  });

  test("muestra FAQ", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/suscripción/i).first()).toBeVisible();
  });

  test("tiene link a Precios en la navbar", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "Precios" }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL("/pricing");
  });
});
