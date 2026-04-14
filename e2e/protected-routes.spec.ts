import { test, expect } from "@playwright/test";

/**
 * Verifica que todas las rutas protegidas redirijan a /login cuando no hay sesión.
 * Estos tests corren sin credenciales — cubren la capa de autenticación/autorización.
 */

const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/explore",
  "/dashboard/my-courses",
  "/dashboard/settings",
  "/dashboard/certificates",
  "/dashboard/wishlist",
  "/instructor",
  "/instructor/courses",
  "/admin",
  "/admin/users",
  "/admin/courses",
  "/admin/categories",
  "/business/dashboard",
];

test.describe("Rutas protegidas redirigen a /login", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirige a /login sin sesión`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    });
  }
});

test.describe("Páginas públicas no requieren sesión", () => {
  const PUBLIC_ROUTES = [
    "/",
    "/courses",
    "/login",
    "/signup",
    "/terminos",
    "/privacidad",
    "/contacto",
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} es accesible sin sesión`, async ({ page }) => {
      const response = await page.goto(route);
      // No redirige a login
      await expect(page).not.toHaveURL(/login/);
      // Y no es un 500
      expect(response?.status()).not.toBe(500);
    });
  }
});
