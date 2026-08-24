export function speak(text, enabled = true, language = "en") {
  if (!enabled || !("speechSynthesis" in window) || !text) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.rate = 0.92;
    u.pitch = 1.08;
    u.lang = language === "es" ? "es-US" : "en-US";
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      v.lang?.toLowerCase().startsWith(language === "es" ? "es" : "en"),
    );
    if (preferred) u.voice = preferred;
    speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function speakCommand(
  text,
  enabled = true,
  language = "en",
  { onStart, onEnd } = {},
) {
  if (!enabled || !("speechSynthesis" in window) || !text) return false;
  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.rate = 0.82;
    utterance.pitch = 0.72;
    utterance.volume = 1;
    utterance.lang = language === "es" ? "es-US" : "en-US";
    const voices = speechSynthesis.getVoices();
    const candidates = voices.filter((voice) =>
      voice.lang?.toLowerCase().startsWith(language === "es" ? "es" : "en"),
    );
    const preferred = candidates.find((voice) =>
      /male|daniel|alex|jorge|diego/i.test(voice.name),
    );
    if (preferred || candidates[0])
      utterance.voice = preferred || candidates[0];
    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
export function stopSpeech() {
  try {
    speechSynthesis.cancel();
  } catch {}
}
