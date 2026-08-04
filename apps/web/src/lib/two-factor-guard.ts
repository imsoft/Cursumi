import { prisma } from "@/lib/prisma";

/**
 * Segundo factor obligatorio para las cuentas con poder.
 *
 * Un admin puede cambiar roles, borrar reseñas y ver las finanzas; un
 * instructor maneja el contenido y los datos de sus alumnos. Para esas cuentas,
 * una contraseña robada basta para hacer daño, así que el 2FA deja de ser
 * opcional. Para los alumnos sigue siendo voluntario: obligarlo ahí solo
 * añadiría fricción sin proteger gran cosa.
 */

export const ROLES_CON_2FA_OBLIGATORIO = ["admin", "instructor"] as const;

/** Ruta donde se configura el segundo factor cuando es obligatorio. */
export const RUTA_CONFIGURAR_2FA = "/seguridad/dos-factores";

export function rolExige2FA(rol: string): boolean {
  return (ROLES_CON_2FA_OBLIGATORIO as readonly string[]).includes(rol);
}

export async function tiene2FAActivado(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });
  return user?.twoFactorEnabled === true;
}

/**
 * ¿Esta persona entra únicamente con un proveedor externo (Google)?
 *
 * Importa porque el alta del TOTP de better-auth pide la contraseña para
 * generar el QR, y quien se registró con Google sencillamente no tiene. Sin
 * esta comprobación, exigir 2FA deja a esas cuentas fuera para siempre: no
 * pueden activarlo y tampoco entrar. Nos pasó con las tres cuentas con
 * privilegios el 31 de julio de 2026.
 */
export async function soloEntraConProveedorExterno(userId: string): Promise<boolean> {
  const conContrasena = await prisma.account.findFirst({
    where: { userId, password: { not: null } },
    select: { id: true },
  });
  return !conContrasena;
}

/**
 * ¿Hay que mandar a esta persona a configurar su segundo factor?
 *
 * Se consulta a la base y no a la sesión: el plugin de better-auth mete
 * `twoFactorEnabled` en el usuario de la sesión, pero esa copia puede quedar
 * vieja, y aquí no queremos que una sesión desactualizada abra la puerta.
 */
export async function debeConfigurar2FA(userId: string, rol: string): Promise<boolean> {
  if (!rolExige2FA(rol)) return false;
  if (await tiene2FAActivado(userId)) return false;

  // Quien solo entra con Google queda exento: su segundo factor es el de la
  // cuenta de Google, que es donde de verdad se autentica. Obligarlo a crear
  // una contraseña aquí para poder sumar un TOTP no lo protegería más —
  // añadiría una credencial nueva, robable, donde antes no había ninguna.
  // A cambio, la seguridad de esas cuentas depende de que tengan la
  // verificación en dos pasos activada EN GOOGLE.
  if (await soloEntraConProveedorExterno(userId)) return false;

  return true;
}
