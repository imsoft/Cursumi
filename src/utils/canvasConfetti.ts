import confetti from "canvas-confetti";

export const showConfetti = () => {
  const duration: number = 5 * 1000;
  const animationEnd: number = Date.now() + duration;
  const defaults: {
    startVelocity: number;
    spread: number;
    ticks: number;
    zIndex: number;
  } = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft: number = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount: number = 50 * (timeLeft / duration);
    confetti(
      Object.assign({}, defaults, {
        zIndex: 999,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        zIndex: 999,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
};
