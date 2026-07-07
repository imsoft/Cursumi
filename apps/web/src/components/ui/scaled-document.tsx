"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Muestra un documento de tamaño fijo (px) escalado para caber en el ancho
 * del contenedor, conservando la proporción. El documento NO se re-maqueta:
 * se escala visualmente, así la vista previa es idéntica al PDF exportado.
 */
export function ScaledDocument({
  width,
  height,
  children,
  className,
}: {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", overflow: "hidden" }}>
      <div style={{ height: height * scale, position: "relative" }}>
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
