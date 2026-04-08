import confetti from "canvas-confetti";

/** Por encima de overlays de Radix (z-50) y cualquier capa de la app. */
const CONFETTI_Z = 99_999;

/** Celebración breve al superar un paso del minijuego (par, palabra, conexión). */
export function fireMiniConfetti() {
  if (typeof window === "undefined") return;
  void confetti({
    particleCount: 55,
    spread: 70,
    origin: { y: 0.75 },
    zIndex: CONFETTI_Z,
    colors: ["#a78bfa", "#818cf8", "#34d399", "#fbbf24"],
  });
}

/** Celebración al terminar todo el minijuego de la sección. */
export function fireGrandConfetti() {
  if (typeof window === "undefined") return;
  const end = Date.now() + 2_200;
  const colors = ["#a78bfa", "#818cf8", "#34d399", "#f472b6", "#fbbf24"];

  (function frame() {
    void confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      zIndex: CONFETTI_Z,
      colors,
    });
    void confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      zIndex: CONFETTI_Z,
      colors,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  void confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
    zIndex: CONFETTI_Z,
    colors,
  });
}
