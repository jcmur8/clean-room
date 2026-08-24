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

function tone(frequency, startOffset, duration, volume, type = "sine") {
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
    tone(
      note.f,
      note.at,
      note.d,
      Math.min(0.18, volume * note.v),
      note.type || "sine",
    );
  }
}

function sweep(
  startFrequency,
  endFrequency,
  startOffset,
  duration,
  volume,
  type = "sawtooth",
) {
  if (!enabled || !ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + startOffset;
  const stop = start + duration;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, stop);
  gain.gain.setValueAtTime(Math.max(0.0001, volume), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, stop);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(stop + 0.02);
}

function noiseBurst(startOffset, duration, volume) {
  if (!enabled || !ctx) return;
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const start = ctx.currentTime + startOffset;
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.7;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(start);
}

export function beep(kind = "ok", volume = 0.4) {
  if (!enabled || !ctx) return;
  const v = Math.max(0.05, Math.min(1, volume));

  if (kind === "mission-warning" || kind === "start") {
    for (let cycle = 0; cycle < 3; cycle += 1) {
      const offset = cycle * 0.72;
      sweep(420, 920, offset, 0.34, Math.min(0.3, v * 0.45), "square");
      sweep(920, 420, offset + 0.34, 0.34, Math.min(0.3, v * 0.45), "square");
    }
    sequence(
      [
        { f: 1047, at: 2.2, d: 0.18, v: 0.8, type: "square" },
        { f: 1047, at: 2.46, d: 0.38, v: 0.9, type: "square" },
      ],
      v,
    );
    return;
  }

  if (kind === "halfway") {
    sequence(
      [
        { f: 988, at: 0, d: 0.22, v: 0.85, type: "square" },
        { f: 740, at: 0.3, d: 0.22, v: 0.85, type: "square" },
        { f: 988, at: 0.6, d: 0.4, v: 0.9, type: "square" },
      ],
      v,
    );
    return;
  }

  if (kind === "step-complete") {
    for (let clap = 0; clap < 12; clap += 1) {
      noiseBurst(
        clap * 0.105 + Math.random() * 0.035,
        0.075,
        Math.min(0.32, v * 0.5),
      );
    }
    sequence(
      [
        { f: 523, at: 0, d: 0.18, v: 0.7 },
        { f: 659, at: 0.2, d: 0.18, v: 0.75 },
        { f: 784, at: 0.4, d: 0.45, v: 0.85 },
      ],
      v,
    );
    sweep(150, 72, 1.25, 0.85, Math.min(0.34, v * 0.55), "sawtooth");
    sweep(118, 62, 1.42, 0.72, Math.min(0.26, v * 0.42), "square");
    return;
  }

  if (kind === "shotclock") {
    sequence(
      [
        { f: 880, at: 0.0, d: 0.12, v: 0.55, type: "square" },
        { f: 880, at: 0.18, d: 0.12, v: 0.55, type: "square" },
        { f: 880, at: 0.36, d: 0.12, v: 0.55, type: "square" },
        { f: 180, at: 0.58, d: 0.55, v: 0.7, type: "sawtooth" },
      ],
      v,
    );
    return;
  }

  if (kind === "celebrate" || kind === "complete") {
    sequence(
      [
        { f: 523, at: 0.0, d: 0.18, v: 0.45 },
        { f: 659, at: 0.16, d: 0.18, v: 0.45 },
        { f: 784, at: 0.32, d: 0.22, v: 0.5 },
        { f: 1047, at: 0.5, d: 0.42, v: 0.55 },
      ],
      v,
    );
    return;
  }

  if (kind === "victory") {
    sequence(
      [
        { f: 523, at: 0.0, d: 0.18, v: 0.45 },
        { f: 659, at: 0.15, d: 0.18, v: 0.45 },
        { f: 784, at: 0.3, d: 0.18, v: 0.5 },
        { f: 1047, at: 0.48, d: 0.28, v: 0.55 },
        { f: 784, at: 0.82, d: 0.18, v: 0.48 },
        { f: 988, at: 0.98, d: 0.18, v: 0.5 },
        { f: 1319, at: 1.15, d: 0.55, v: 0.6 },
      ],
      v,
    );
    return;
  }

  const frequency =
    {
      confirm: 660,
      warning: 220,
      collectible: 784,
      ok: 440,
    }[kind] || 440;
  tone(frequency, 0, 0.2, Math.min(0.18, v * 0.25));
}

export function isAudioEnabled() {
  return enabled;
}
