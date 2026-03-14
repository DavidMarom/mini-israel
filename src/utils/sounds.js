export function playSound(name) {
  try {
    const audio = new Audio(`/assets/sound/${name}.mp3`);
    audio.play().catch(() => {});
  } catch {}
}
