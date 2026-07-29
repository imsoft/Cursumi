import type { ComponentPropsWithoutRef } from "react";

/**
 * Imagen de perfil (OAuth, p. ej. googleusercontent.com): esos hosts suelen
 * devolver 403 si el navegador envía Referer de otro sitio. Sin referrer cargan bien.
 */
export function ProfilePhotoImg(
  // `alt` es obligatorio: quien la use decide el texto, o `alt=""` si la foto
  // es decorativa porque el nombre ya va al lado.
  props: Omit<ComponentPropsWithoutRef<"img">, "referrerPolicy" | "alt"> & { alt: string },
) {
  // eslint-disable-next-line jsx-a11y/alt-text -- va dentro del spread; el tipo de arriba la exige
  return <img {...props} referrerPolicy="no-referrer" />;
}
