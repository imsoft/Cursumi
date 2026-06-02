import type { Locator, Page } from "@playwright/test";

/**
 * Si la app tiene Turnstile, el botón de registro/forgot queda deshabilitado
 * hasta completar el widget. En E2E llamamos al callback global que expone el formulario
 * para poder probar validación en cliente sin resolver el CAPTCHA real.
 */
export async function mockTurnstileTokenIfNeeded(page: Page) {
  await page.evaluate(() => {
    const cb = (window as unknown as { __turnstileCallback?: (token: string) => void })
      .__turnstileCallback;
    cb?.("e2e-mock-turnstile-token");
  });
}

/** Evita colisión con el botón «Mostrar contraseña» (getByLabel('Contraseña') matchea ambos). */
export function loginPasswordInput(main: Locator) {
  return main.locator('input[type="password"][name="password"]');
}
