let ctx = null;
let enabled = false;

export async function activateAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    await ctx.resume();
    enabled = true;
    return true;
  } catch {
    return false;
  }
}

function tone(frequency, startOffset, duration, volume, type = 'sine') {
  if (!enabled || !ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + startOffset;
  const stop = start + duration;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(Math.max(0.0001, volume), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, stop);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(stop + 0.02);
}

function sequence(notes, volume) {
  for (const note of notes) {
    tone(note.f, note.at, note.d, Math.min(0.18, volume * note.v), note.type || 'sine');
  }
}

export function beep(kind = 'ok', volume = 0.4) {
  if (!enabled || !ctx) return;
  const v = Math.max(0.05, Math.min(1, volume));

  if (kind === 'start') {
    sequence([
      { f: 440, at: 0.00, d: 0.18, v: 0.55, type: 'square' },
      { f: 660, at: 0.22, d: 0.18, v: 0.55, type: 'square' },
      { f: 440, at: 0.44, d: 0.18, v: 0.55, type: 'square' },
      { f: 784, at: 0.70, d: 0.42, v: 0.65, type: 'triangle' }
    ], v);
    return;
  }

  if (kind === 'shotclock') {
    sequence([
      { f: 880, at: 0.00, d: 0.12, v: 0.55, type: 'square' },
      { f: 880, at: 0.18, d: 0.12, v: 0.55, type: 'square' },
      { f: 880, at: 0.36, d: 0.12, v: 0.55, type: 'square' },
      { f: 180, at: 0.58, d: 0.55, v: 0.70, type: 'sawtooth' }
    ], v);
    return;
  }

  if (kind === 'celebrate' || kind === 'complete') {
    sequence([
      { f: 523, at: 0.00, d: 0.18, v: 0.45 },
      { f: 659, at: 0.16, d: 0.18, v: 0.45 },
      { f: 784, at: 0.32, d: 0.22, v: 0.50 },
      { f: 1047, at: 0.50, d: 0.42, v: 0.55 }
    ], v);
    return;
  }

  if (kind === 'victory') {
    sequence([
      { f: 523, at: 0.00, d: 0.18, v: 0.45 },
      { f: 659, at: 0.15, d: 0.18, v: 0.45 },
      { f: 784, at: 0.30, d: 0.18, v: 0.50 },
      { f: 1047, at: 0.48, d: 0.28, v: 0.55 },
      { f: 784, at: 0.82, d: 0.18, v: 0.48 },
      { f: 988, at: 0.98, d: 0.18, v: 0.50 },
      { f: 1319, at: 1.15, d: 0.55, v: 0.60 }
    ], v);
    return;
  }

  const frequency = {
    confirm: 660,
    warning: 220,
    collectible: 784,
    ok: 440
  }[kind] || 440;
  tone(frequency, 0, 0.2, Math.min(0.18, v * 0.25));
}

export function isAudioEnabled() {
  return enabled;
}
