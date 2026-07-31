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
 * ¿Hay que mandar a esta persona a configurar su segundo factor?
 *
 * Se consulta a la base y no a la sesión: el plugin de better-auth mete
 * `twoFactorEnabled` en el usuario de la sesión, pero esa copia puede quedar
 * vieja, y aquí no queremos que una sesión desactualizada abra la puerta.
 */
export async function debeConfigurar2FA(userId: string, rol: string): Promise<boolean> {
  if (!rolExige2FA(rol)) return false;
  return !(await tiene2FAActivado(userId));
}
