import { el, button } from "../ui.js";
import {
  currentMission,
  missionAssignments,
  confirmChild,
  missionReady,
  advanceMission,
  undoChild,
} from "../game-engine.js";
import {
  formatDuration,
  elapsedMs,
  stepRemainingMs,
  newStepTimer,
  shouldAlertHalfway,
  isCriticalRemaining,
  retryDurationMs,
} from "../timers.js";
import { t, localized, roleName } from "../i18n.js";
import { monsterSprite, monsterForSession, monsterName } from "../monsters.js";

let activeCountdown = null;

function stopCountdown() {
  if (activeCountdown) clearInterval(activeCountdown);
  activeCountdown = null;
}

function showHelp(instruction, safety) {
  const bullets = [instruction, safety, t("helpNotice")].filter(Boolean);
  const modal = el(
    "div",
    { class: "modal help-modal", role: "dialog", "aria-modal": "true" },
    el(
      "div",
      { class: "card" },
      button("✕", "help-close", () => modal.remove(), {
        "aria-label": t("closeHelp"),
      }),
      el("div", { class: "help-hand", text: "✋" }),
      el("h2", { text: t("helpTitle") }),
      el(
        "ul",
        { class: "help-bullet-list" },
        ...bullets.map((text) => el("li", { text })),
      ),
    ),
  );
  document.body.append(modal);
}

function showPauseDenied() {
  const modal = el(
    "div",
    { class: "modal", role: "dialog", "aria-modal": "true" },
    el(
      "div",
      { class: "card pause-denied" },
      button("✕", "help-close", () => modal.remove(), {
        "aria-label": t("closeHelp"),
      }),
      el("div", { class: "monster-strength", text: "⚡👾⚡" }),
      el("h2", { text: t("pauseDeniedTitle") }),
      el("p", { text: t("pauseDeniedText") }),
    ),
  );
  document.body.append(modal);
}

function showTimeout(data, mission, actions) {
  const previous = data.activeSession.stepTimer;
  const modal = el(
    "div",
    { class: "modal timeout-flash", role: "dialog", "aria-modal": "true" },
    el(
      "div",
      { class: "card timeout-card" },
      el("div", { class: "timeout-alert", text: "⚠" }),
      el("h2", { text: t("opportunityMissed") }),
      el("p", { text: t("monsterDistracted") }),
      el(
        "div",
        { class: "timeout-options" },
        button(t("defeatByMonster"), "btn-danger", () => {
          modal.remove();
          actions.defeatBattle();
        }),
        button(t("tryAgain"), "btn-primary", async () => {
          const retryDuration = retryDurationMs(
            data.activeSession.stepDurationMs || previous.durationMs,
          );
          data.activeSession.stepTimer = {
            ...newStepTimer(mission.id, Date.now(), retryDuration),
            attempts: (previous.attempts || 0) + 1,
            lastExpiredAt: Date.now(),
            pauseUsed: previous.pauseUsed || false,
          };
          await actions.save(data);
          modal.remove();
          actions.go("mission");
        }),
      ),
    ),
  );
  document.body.append(modal);
}

export function renderMission(root, data, actions) {
  stopCountdown();
  const session = data.activeSession;
  const mission = currentMission(session);
  if (!mission) return actions.go("home");

  if (!session.stepTimer || session.stepTimer.missionId !== mission.id) {
    session.stepTimer = newStepTimer(
      mission.id,
      Date.now(),
      session.stepDurationMs || 300000,
    );
    actions.save(data);
  }

  const assignments = missionAssignments(session, mission.id);
  const confirmed = session.confirmations[mission.id] || [];
  const completed = session.currentMissionIndex;
  const total = session.missionSnapshots.length;
  const pct = Math.round((completed / total) * 100);
  const healthCount = Math.max(5, Math.min(10, total));
  const alive = Math.max(
    0,
    healthCount - Math.round((completed / total) * healthCount),
  );
  const instruction = localized(mission, "childInstruction");
  const safety = localized(mission, "safetyNote");

  const health = el(
    "div",
    { class: "health", "aria-label": t("health", { count: alive }) },
    ...Array.from({ length: healthCount }, (_, index) =>
      el("span", {
        class: `heart ${index < alive ? "alive" : ""}`,
        text: "◆",
      }),
    ),
  );

  const timerValue = el("strong", {
    class: "countdown-value",
    text: formatDuration(stepRemainingMs(session.stepTimer)),
  });
  const timerBox = el(
    "div",
    { class: "mission-countdown", "aria-live": "polite" },
    el("span", { class: "countdown-label", text: t("timeToTarget") }),
    timerValue,
    el("span", {
      class: "soundtrack-status",
      text: `◉ ${t("battleMusicActive")}`,
    }),
  );
  const timerCoach = el("p", {
    class: `timer-coach notice${session.stepTimer.attempts ? "" : " hidden"}`,
    text:
      session.stepTimer.attempts > 1
        ? t("timerExpiredAgain", {
            minutes: Math.round(session.stepTimer.durationMs / 60000),
          })
        : t("timerExpired"),
  });

  let expiryBusy = false;
  let halfwayBusy = false;
  const tick = async () => {
    if (!timerValue.isConnected) return stopCountdown();
    const current = data.activeSession;
    if (!current?.stepTimer || current.stepTimer.missionId !== mission.id)
      return;
    const remaining = stepRemainingMs(current.stepTimer);
    timerValue.textContent = formatDuration(remaining);
    const critical = isCriticalRemaining(remaining);
    timerBox.classList.toggle("critical", critical);
    if (critical && !current.stepTimer.criticalAlerted) {
      current.stepTimer.criticalAlerted = true;
      await actions.save(data);
      actions.sound("critical-siren");
    }

    if (
      shouldAlertHalfway(current.stepTimer, remaining) &&
      !current.pauseState?.paused &&
      !halfwayBusy
    ) {
      halfwayBusy = true;
      current.stepTimer.halfwayAlerted = true;
      await actions.save(data);
      actions.sound("halfway");
      actions.notice(t("halfwayWarning"));
      halfwayBusy = false;
    }

    if (remaining <= 0 && !current.pauseState?.paused && !expiryBusy) {
      expiryBusy = true;
      stopCountdown();
      actions.sound("shotclock");
      showTimeout(data, mission, actions);
    }
  };

  const heroChecks = el(
    "div",
    { class: "heroes-confirm" },
    ...assignments.map((assignment) => {
      const child = data.children.find(
        (item) => item.id === assignment.childId,
      );
      if (!child) return null;
      const done = confirmed.includes(assignment.childId);
      let holdTimer;
      const check = button(
        done ? "✓" : "",
        `hero-check ${done ? "checked" : ""}`,
        async () => {
          if (done) return;
          data.activeSession = confirmChild(
            data.activeSession,
            mission.id,
            child.id,
          );
          await actions.save(data);
          actions.sound("confirm");
          actions.go("mission");
        },
        {
          "aria-label": `${child.displayName}: ${done ? t("done") : t("didPart")}`,
          "aria-pressed": done ? "true" : "false",
        },
      );

      if (done) {
        check.addEventListener("pointerdown", () => {
          holdTimer = setTimeout(async () => {
            data.activeSession = undoChild(
              data.activeSession,
              mission.id,
              child.id,
            );
            await actions.save(data);
            actions.notice(t("undoNotice"));
            actions.go("mission");
          }, 2000);
        });
        ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) =>
          check.addEventListener(eventName, () => clearTimeout(holdTimer)),
        );
      }

      return el(
        "div",
        { class: `hero-check-card ${done ? "complete" : ""}` },
        el("span", { class: "hero-avatar", text: child.avatar }),
        el(
          "div",
          { class: "hero-check-copy" },
          el("strong", { text: child.displayName }),
          el("span", { text: roleName(assignment.role) }),
        ),
        check,
      );
    }),
  );

  const advance = missionReady(session, mission.id)
    ? button(
        "→",
        "team-advance",
        async () => {
          stopCountdown();
          data.activeSession = advanceMission(data.activeSession);
          await actions.save(data);
          actions.go("celebration");
        },
        { "aria-label": t("teamContinue"), title: t("teamContinue") },
      )
    : el("p", { class: "check-status", text: t("waitBoth") });

  const commandRail = el(
    "aside",
    { class: "command-rail", "aria-label": t("missionControls") },
    button("📋", "command-icon", () => actions.commandSpeak(instruction), {
      "aria-label": t("repeatInstructions"),
      title: t("repeatInstructions"),
    }),
    button("✋", "command-icon", () => showHelp(instruction, safety), {
      "aria-label": t("help"),
      title: t("help"),
    }),
    button(
      "⏸",
      "command-icon",
      async () => {
        const started = await actions.pause30();
        if (!started) showPauseDenied();
      },
      {
        "aria-label": t("pause"),
        title: t("pause"),
      },
    ),
    button("🛑", "command-icon danger", () => actions.requireParent("abort"), {
      "aria-label": t("abortMission"),
      title: t("abortMission"),
    }),
  );

  root.replaceChildren(
    el(
      "section",
      { class: "child-screen battle-console-screen" },
      el(
        "div",
        { class: "battle-console" },
        commandRail,
        el(
          "div",
          { class: "mission-core" },
          el(
            "div",
            { class: "mission-hud" },
            el(
              "div",
              {},
              el("span", { class: "hud-label", text: t("target") }),
              el("strong", { text: monsterName(monsterForSession(session)) }),
              health,
            ),
            monsterSprite(session, "monster-sprite hud-monster attacking"),
            el(
              "div",
              {},
              el("span", { class: "hud-label", text: t("missionProgress") }),
              el("strong", { text: `${completed + 1} / ${total}` }),
              el("span", { text: formatDuration(elapsedMs(session.timer)) }),
            ),
          ),
          timerBox,
          timerCoach,
          el(
            "div",
            { class: "mission-order" },
            el("span", { class: "mission-icon", text: mission.icon }),
            el(
              "div",
              {},
              el("span", { class: "hud-label", text: t("currentOrders") }),
              el("h1", { text: localized(mission, "title") }),
              el("p", { text: instruction }),
            ),
          ),
          safety
            ? el(
                "div",
                { class: "warning" },
                el("strong", { text: t("safety") }),
                safety,
              )
            : null,
          el(
            "div",
            { class: "progress-track" },
            el("div", { class: "progress-fill", style: `width:${pct}%` }),
          ),
        ),
        el(
          "aside",
          { class: "hero-check-column" },
          el("h2", { text: t("teamStatus") }),
          heroChecks,
          advance,
        ),
      ),
    ),
  );
  window.requestAnimationFrame(() => window.scrollTo(0, 0));

  activeCountdown = setInterval(tick, 200);
  tick();

  if (session.lastAutoSpokenMissionId !== mission.id) {
    session.lastAutoSpokenMissionId = mission.id;
    actions.save(data);
    actions.commandSpeak(`${t("commandPrefix")} ${instruction}`);
    window.setTimeout(() => actions.startMusic(), 1600);
  } else {
    actions.startMusic();
  }
}
