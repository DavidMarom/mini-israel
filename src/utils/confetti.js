import confetti from "canvas-confetti";

export function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#f5c842", "#4a9f3e", "#3a7ab8", "#e8453c", "#ffffff"],
  });
}
