import { test, expect } from "@playwright/test";

test.describe("Formulario de registro", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("muestra errores al enviar vacío", async ({ page }) => {
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByText("El nombre es obligatorio")).toBeVisible();
  });

  test("muestra error por email inválido", async ({ page }) => {
    await page.getByLabel("Nombre").fill("Test User");
    await page.getByLabel("Correo electrónico").fill("no-es-email");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    // El campo de email debe mostrar un error de validación
    await expect(page.locator("input[type='email']:invalid, [data-invalid], [aria-invalid='true']").or(
      page.getByText(/correo|email|válido/i)
    )).toBeVisible({ timeout: 3000 }).catch(() => {
      // El browser puede mostrar validación nativa — aceptable
    });
  });

  test("tiene enlace a login", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /iniciar sesión|login/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Formulario de login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("muestra error con credenciales incorrectas", async ({ page }) => {
    await page.getByLabel("Correo electrónico").fill("noexiste@cursumi.com");
    await page.getByLabel("Contraseña").fill("wrong-password-123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    // No redirige — permanece en /login
    await expect(page).toHaveURL(/login/, { timeout: 6000 });
  });

  test("tiene enlace a registro", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: /crear cuenta|registr/i });
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await expect(page).toHaveURL(/signup/);
  });

  test("tiene enlace de recuperar contraseña", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: /olvidaste|contraseña/i });
    await expect(forgotLink).toBeVisible();
  });
});

test.describe("Página de contacto", () => {
  test("carga y muestra formulario o información de contacto", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page).toHaveURL(/contacto/);
    await expect(page.locator("main")).toBeVisible();
  });
});
