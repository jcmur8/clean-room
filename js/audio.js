let ctx = null;
let enabled = false;
let musicTimer = null;
let musicStep = 0;
let musicVolume = 0.4;
let radioBedTimer = null;
let comicMusicTimer = null;
let comicMusicStep = 0;

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

  if (kind === "radio") {
    noiseBurst(0, 0.11, Math.min(0.22, v * 0.34));
    sequence(
      [
        { f: 1250, at: 0.03, d: 0.07, v: 0.7, type: "square" },
        { f: 980, at: 0.14, d: 0.08, v: 0.65, type: "square" },
      ],
      v,
    );
    noiseBurst(0.24, 0.08, Math.min(0.15, v * 0.25));
    return;
  }

  if (kind === "monster-attack") {
    sweep(190, 58, 0, 1.05, Math.min(0.34, v * 0.55), "sawtooth");
    noiseBurst(0.18, 0.28, Math.min(0.25, v * 0.4));
    sequence(
      [
        { f: 92, at: 0.5, d: 0.35, v: 0.85, type: "square" },
        { f: 72, at: 0.92, d: 0.5, v: 0.9, type: "sawtooth" },
      ],
      v,
    );
    return;
  }

  if (kind === "critical-siren") {
    for (let cycle = 0; cycle < 4; cycle += 1) {
      sweep(620, 1080, cycle * 0.42, 0.2, Math.min(0.32, v * 0.5), "square");
      sweep(
        1080,
        620,
        cycle * 0.42 + 0.2,
        0.2,
        Math.min(0.32, v * 0.5),
        "square",
      );
    }
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

function scheduleBattleBar() {
  if (!enabled || !ctx || musicTimer == null) return;
  const v = Math.max(0.06, Math.min(0.24, musicVolume * 0.3));
  const roots = [110, 123.47, 98, 146.83];
  const root = roots[musicStep % roots.length];
  const pattern = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
  for (const at of pattern) {
    tone(root, at, 0.18, v, "sawtooth");
    tone(root * 2, at + 0.02, 0.1, v * 0.55, "square");
    noiseBurst(at, 0.055, v * 1.7);
  }
  for (const at of [0, 1, 2, 3]) tone(root / 2, at, 0.34, v * 1.2, "triangle");
  sequence(
    [
      { f: root * 4, at: 0.25, d: 0.12, v: 0.45, type: "square" },
      { f: root * 5, at: 1.25, d: 0.12, v: 0.42, type: "square" },
      { f: root * 6, at: 2.25, d: 0.16, v: 0.5, type: "square" },
      { f: root * 5, at: 3.25, d: 0.14, v: 0.42, type: "square" },
    ],
    musicVolume * 0.38,
  );

  if (musicStep % 2 === 1) {
    // A short, wordless heroic team shout made from filtered noise and pitch.
    noiseBurst(1.62, 0.28, Math.min(0.16, musicVolume * 0.24));
    sweep(330, 510, 1.62, 0.25, Math.min(0.11, musicVolume * 0.18), "triangle");
  }
  if (musicStep % 3 === 2) {
    // Friendly monster growl punctuation.
    sweep(135, 68, 2.85, 0.62, Math.min(0.14, musicVolume * 0.24), "sawtooth");
  }
  musicStep += 1;
}

export function startBattleMusic(volume = 0.4) {
  musicVolume = volume;
  if (musicTimer != null || !enabled || !ctx) return;
  musicStep = 0;
  musicTimer = window.setInterval(scheduleBattleBar, 4000);
  scheduleBattleBar();
}

export function stopBattleMusic() {
  if (musicTimer != null) window.clearInterval(musicTimer);
  musicTimer = null;
  musicStep = 0;
}

export function startComicMusic(monsterId = "monster", volume = 0.4) {
  stopBattleMusic();
  stopComicMusic();
  if (!enabled || !ctx) return;
  const seed = [...monsterId].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const roots = [196, 220, 246.94, 261.63, 293.66];
  const root = roots[seed % roots.length];
  const low = Math.max(0.018, Math.min(0.055, volume * 0.09));
  const playPage = () => {
    if (comicMusicTimer == null) return;
    const pattern = [0, 0.75, 1.5, 2.25];
    for (const at of pattern) {
      const note = [1, 1.25, 1.5, 2][(comicMusicStep + Math.round(at / 0.75)) % 4];
      tone(root * note, at, 0.52, low, "triangle");
      tone((root / 2) * (comicMusicStep % 2 ? 1.125 : 1), at, 0.7, low * 0.7, "sine");
    }
    comicMusicStep += 1;
  };
  comicMusicStep = 0;
  comicMusicTimer = window.setInterval(playPage, 3000);
  playPage();
}

export function stopComicMusic() {
  if (comicMusicTimer != null) window.clearInterval(comicMusicTimer);
  comicMusicTimer = null;
  comicMusicStep = 0;
}

export function startRadioBed(volume = 0.4) {
  stopRadioBed();
  const pulse = () => noiseBurst(0, 0.14, Math.min(0.045, volume * 0.07));
  pulse();
  radioBedTimer = window.setInterval(pulse, 420);
}

export function stopRadioBed() {
  if (radioBedTimer != null) window.clearInterval(radioBedTimer);
  radioBedTimer = null;
}

export function isAudioEnabled() {
  return enabled;
}
