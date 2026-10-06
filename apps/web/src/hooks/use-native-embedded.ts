"use client";

import { useEffect, useState } from "react";

/**
 * `true` cuando la página corre dentro del visor web de la app móvil, que
 * inyecta `window.CursumiNative`. Las shells devuelven entonces solo el
 * contenido, sin sidebar ni header, para que se sienta parte de la app.
 */
export function useNativeEmbedded(): boolean {
  const [embedded, setEmbedded] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && (window as unknown as { CursumiNative?: unknown }).CursumiNative) {
      setEmbedded(true);
    }
  }, []);
  return embedded;
}
