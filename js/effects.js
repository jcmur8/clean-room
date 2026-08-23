const symbols = ['★', '✦', '●', '◆', '▲'];

export function confettiBurst({ count = 42, duration = 1800, final = false } = {}) {
  if (document.body.classList.contains('reduce-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const layer = document.createElement('div');
  layer.className = final ? 'confetti-layer final-confetti' : 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.textContent = symbols[i % symbols.length];
    piece.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
    piece.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 220)}px`);
    piece.style.setProperty('--spin', `${Math.round(Math.random() * 900 + 180)}deg`);
    piece.style.setProperty('--delay', `${Math.round(Math.random() * 240)}ms`);
    piece.style.setProperty('--fall', `${Math.round(duration * (0.75 + Math.random() * 0.5))}ms`);
    piece.dataset.variant = String(i % 5);
    layer.append(piece);
  }

  document.body.append(layer);
  window.setTimeout(() => layer.remove(), duration + 900);
}
