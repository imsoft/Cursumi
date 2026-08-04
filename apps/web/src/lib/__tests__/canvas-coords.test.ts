import { describe, it, expect } from "vitest";
import { puntoEnLienzo } from "@/lib/canvas-coords";

describe("puntoEnLienzo", () => {
  it("con bitmap y caja del mismo tamaño, es una simple resta", () => {
    const p = puntoEnLienzo(
      { clientX: 150, clientY: 120 },
      { left: 100, top: 100, width: 800, height: 600 },
      { width: 800, height: 600 },
      1,
    );
    expect(p).toEqual({ x: 50, y: 20 });
  });

  it("compensa el dpr sin desplazar el trazo", () => {
    // Pantalla retina: el bitmap mide el doble, pero se muestra igual.
    const p = puntoEnLienzo(
      { clientX: 150, clientY: 120 },
      { left: 100, top: 100, width: 800, height: 600 },
      { width: 1600, height: 1200 },
      2,
    );
    expect(p).toEqual({ x: 50, y: 20 });
  });

  it("REGRESIÓN: pantalla retina con el canvas mostrado al tamaño del bitmap", () => {
    // El caso real que se reportó. Un <canvas> es un elemento reemplazado: con
    // `inset-0` y sin ancho en CSS, el navegador lo pinta al tamaño de su
    // bitmap. En retina el bitmap medía 1600 y se mostraba a 1600, dentro de un
    // contenedor de 800: el cursor recorría la mitad de lienzo que el trazo.
    const rect = { left: 0, top: 0, width: 1600, height: 1200 };
    const bitmap = { width: 1600, height: 1200 };

    // Con la caja y el bitmap iguales, y dpr=2, el contexto trabaja en unidades
    // lógicas: media coordenada por cada píxel de pantalla recorrido.
    const p = puntoEnLienzo({ clientX: 800, clientY: 600 }, rect, bitmap, 2);
    expect(p).toEqual({ x: 400, y: 300 });
  });

  it("ya con el tamaño en CSS fijado, retina cae exacto bajo el cursor", () => {
    // Así queda tras el arreglo: bitmap 1600 pero mostrado a 800.
    const p = puntoEnLienzo(
      { clientX: 740, clientY: 540 },
      { left: 0, top: 0, width: 800, height: 600 },
      { width: 1600, height: 1200 },
      2,
    );
    expect(p).toEqual({ x: 740, y: 540 });
  });

  it("con el canvas escalado a la mitad, duplica la coordenada", () => {
    const p = puntoEnLienzo(
      { clientX: 200, clientY: 150 },
      { left: 0, top: 0, width: 400, height: 300 },
      { width: 800, height: 600 },
      1,
    );
    expect(p).toEqual({ x: 400, y: 300 });
  });

  it("devuelve el origen si el canvas aún no tiene tamaño", () => {
    const p = puntoEnLienzo(
      { clientX: 50, clientY: 50 },
      { left: 0, top: 0, width: 0, height: 0 },
      { width: 0, height: 0 },
      1,
    );
    expect(p).toEqual({ x: 0, y: 0 });
  });

  it("resta el desplazamiento del canvas en la página", () => {
    const p = puntoEnLienzo(
      { clientX: 320, clientY: 240 },
      { left: 120, top: 40, width: 800, height: 600 },
      { width: 800, height: 600 },
      1,
    );
    expect(p).toEqual({ x: 200, y: 200 });
  });
});
