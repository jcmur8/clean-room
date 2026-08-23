export const STEP_COUNTDOWN_MS = 5 * 60 * 1000;

export function elapsedMs(timer, now = Date.now()) {
  if (!timer) return 0;
  let elapsed = timer.accumulatedMs || 0;
  if (!timer.pausedAt && timer.runningSince) {
    elapsed += Math.max(0, now - timer.runningSince);
  }
  return elapsed;
}

export function pauseTimer(timer, now = Date.now()) {
  if (!timer || timer.pausedAt) return timer;
  return {
    ...timer,
    accumulatedMs: elapsedMs(timer, now),
    runningSince: null,
    pausedAt: now
  };
}

export function resumeTimer(timer, now = Date.now()) {
  if (!timer || !timer.pausedAt) return timer;
  return { ...timer, runningSince: now, pausedAt: null };
}

export function formatDuration(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function newStepTimer(missionId, now = Date.now(), durationMs = STEP_COUNTDOWN_MS) {
  return {
    missionId,
    durationMs,
    deadlineAt: now + durationMs,
    pausedRemainingMs: null,
    attempts: 0,
    lastExpiredAt: null
  };
}

export function stepRemainingMs(stepTimer, now = Date.now()) {
  if (!stepTimer) return 0;
  if (stepTimer.pausedRemainingMs != null) {
    return Math.max(0, stepTimer.pausedRemainingMs);
  }
  return Math.max(0, (stepTimer.deadlineAt || now) - now);
}

export function expireStepTimer(stepTimer, now = Date.now()) {
  const durationMs = stepTimer?.durationMs || STEP_COUNTDOWN_MS;
  return {
    ...stepTimer,
    durationMs,
    deadlineAt: now + durationMs,
    pausedRemainingMs: null,
    attempts: (stepTimer?.attempts || 0) + 1,
    lastExpiredAt: now
  };
}

export function pauseStepTimer(stepTimer, now = Date.now()) {
  if (!stepTimer || stepTimer.pausedRemainingMs != null) return stepTimer;
  return {
    ...stepTimer,
    pausedRemainingMs: stepRemainingMs(stepTimer, now),
    deadlineAt: null
  };
}

export function resumeStepTimer(stepTimer, now = Date.now()) {
  if (!stepTimer || stepTimer.pausedRemainingMs == null) return stepTimer;
  return {
    ...stepTimer,
    deadlineAt: now + stepTimer.pausedRemainingMs,
    pausedRemainingMs: null
  };
}
