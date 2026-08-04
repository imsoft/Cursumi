/**
 * Traducción de la posición del puntero a coordenadas del lienzo.
 *
 * Vive aparte del componente porque es justo la parte que se rompió y conviene
 * poder probarla: restar el rect del canvas a `clientX/clientY` solo funciona
 * si el bitmap y la caja en pantalla miden lo mismo. Cuando no coinciden —el
 * contenedor tenía borde y el canvas iba con `inset-0`, así que el bitmap
 * quedaba 2px más ancho— el navegador estira el dibujo, y el trazo se separa
 * del cursor más cuanto más lejos se dibuja de la esquina superior izquierda.
 */

export type RectLienzo = { left: number; top: number; width: number; height: number };

export function puntoEnLienzo(
  cliente: { clientX: number; clientY: number },
  rect: RectLienzo,
  /** Tamaño del bitmap (canvas.width/height, ya multiplicado por dpr). */
  bitmap: { width: number; height: number },
  dpr: number,
): { x: number; y: number } {
  if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };

  const d = dpr || 1;
  // El contexto dibuja en unidades lógicas (setTransform con dpr), por eso el
  // bitmap se divide entre dpr antes de compararlo con la caja en pantalla.
  const escalaX = bitmap.width / d / rect.width;
  const escalaY = bitmap.height / d / rect.height;

  return {
    x: (cliente.clientX - rect.left) * escalaX,
    y: (cliente.clientY - rect.top) * escalaY,
  };
}
