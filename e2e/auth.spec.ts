import { test, expect } from "@playwright/test";

const TEST_EMAIL = `e2e_test_${Date.now()}@cursumi.test`;
const TEST_PASSWORD = "TestPass123!";

test.describe("Autenticación", () => {
  test("Registro: muestra formulario y valida campos", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();

    // Submit vacío — debe mostrar errores de validación
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByText("El nombre es obligatorio")).toBeVisible();
  });

  test("Login: muestra formulario y valida campos", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();

    // Credenciales inválidas
    await page.getByLabel("Correo electrónico").fill("noexiste@test.com");
    await page.getByLabel("Contraseña").fill("wrongpass");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

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

    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });
  });

  test("Rutas protegidas redirigen a /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
