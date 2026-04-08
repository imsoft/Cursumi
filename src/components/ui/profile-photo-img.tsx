import type { ComponentPropsWithoutRef } from "react";

/**
 * Imagen de perfil (OAuth, p. ej. googleusercontent.com): esos hosts suelen
 * devolver 403 si el navegador envía Referer de otro sitio. Sin referrer cargan bien.
 */
export function ProfilePhotoImg(
  props: Omit<ComponentPropsWithoutRef<"img">, "referrerPolicy">,
) {
  return <img {...props} referrerPolicy="no-referrer" />;
}
