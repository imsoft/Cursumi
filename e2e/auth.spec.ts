import { test, expect } from "@playwright/test";
import { loginPasswordInput, mockTurnstileTokenIfNeeded } from "./helpers";

test.describe("Autenticación", () => {
  test("Registro: muestra formulario y valida campos", async ({ page }) => {
    await page.goto("/signup");
    const main = page.locator("main");
    await expect(main.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();

    await mockTurnstileTokenIfNeeded(page);
    await expect(main.getByRole("button", { name: "Crear cuenta" })).toBeEnabled({ timeout: 8000 });

    // Submit vacío — debe mostrar errores de validación
    await main.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(main.getByText("El nombre es obligatorio")).toBeVisible();
  });

  test("Login: muestra formulario y valida campos", async ({ page }) => {
    await page.goto("/login");
    const main = page.locator("main");
    await expect(main.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();

    // Credenciales inválidas
    await main.getByLabel("Correo electrónico").fill("noexiste@test.com");
    await loginPasswordInput(main).fill("wrongpass");
    await main.getByRole("button", { name: "Iniciar sesión" }).click();

    // Debe mostrar error (no redirigir)
    await expect(page).toHaveURL(/login/);
  });

  test("Login: redirige al dashboard tras login exitoso (flujo feliz)", async ({ page }) => {
    // Este test requiere un usuario de prueba real — se salta si no hay env vars
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    if (!email || !password) {
      test.skip(true, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD no configurados");
      return;
    }

    const main = page.locator("main");
    await page.goto("/login");
    await main.getByLabel("Correo electrónico").fill(email);
    await loginPasswordInput(main).fill(password);
    await main.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });
  });

  test("Rutas protegidas redirigen a /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
