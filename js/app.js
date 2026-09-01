import { makeDefaultData, factoryMissions } from "./defaults.js";
import { migrate } from "./migrations.js";
import { loadData, saveData, clearData } from "./storage.js";
import { setState, getState } from "./state.js";
import {
  activateAudio,
  beep,
  startBattleMusic,
  stopBattleMusic,
  startRadioBed,
  stopRadioBed,
  startComicMusic,
  stopComicMusic,
  startMenuMusic,
  stopMenuMusic,
} from "./audio.js";
import { monsters } from "./defaults.js";
import { monsterSprite } from "./monsters.js";
import { speak, speakCommand } from "./speech.js";
import { applyAccessibility, announce, focusMain } from "./accessibility.js";
import { createSession } from "./game-engine.js";
import {
  pauseTimer,
  resumeTimer,
  pauseStepTimer,
  resumeStepTimer,
} from "./timers.js";
import { verifyPin, parentSession } from "./security.js";
import { downloadBackup, parseBackup } from "./backup.js";
import { renderSetup } from "./views/setup.js";
import { renderHome } from "./views/home.js";
import { renderMission } from "./views/mission.js";
import { renderCelebration } from "./views/celebration.js";
import {
  renderInspectionRequest,
  renderInspection,
} from "./views/inspection.js";
import { renderVictory } from "./views/victory.js";
import { renderBattleTransition } from "./views/battle-transition.js";
import { renderMonsterOrigin } from "./views/monster-origin.js";
import { renderParentDashboard } from "./views/parent-dashboard.js";
import { renderPlayerSettings } from "./views/player-settings.js";
import { renderComicBook, renderComicReader } from "./views/comicbook.js";
import { el, button } from "./ui.js";
import { heroPortrait } from "./profile-photo.js";
import { t, setLanguage, modeName, localized } from "./i18n.js";
const root = document.getElementById("app"),
  parentAuth = parentSession();
let route = "home",
  params = {},
  hiddenAt = 0;
async function persist(d = getState()) {
  await saveData(d);
  setState(d);
}
function refreshChrome() {
  const d = getState();
  setLanguage(d?.appSettings?.language || "en");
  document.title = t("appTitle");
  document.querySelector(".skip-link").textContent = t("skip");
  document.querySelector(".topbar strong").textContent = t("appTitle");
  document.getElementById("parent-access").textContent = t("parent");
  const lb = document.getElementById("language-toggle");
  if (lb) {
    lb.textContent = (d?.appSettings?.language || "en") === "es" ? "EN" : "ES";
    lb.setAttribute(
      "aria-label",
      (d?.appSettings?.language || "en") === "es"
        ? "Switch to English"
        : "Cambiar a español",
    );
  }
  updateConnectivity();
}
const actions = {
  save: persist,
  go: (r, p = {}) => {
    route = r;
    params = p;
    render();
  },
  audio: activateAudio,
  sound: (k) => {
    const d = getState();
    if (d.appSettings.sound) beep(k, d.appSettings.soundVolume);
  },
  speak: (tText) => {
    const d = getState();
    if (!speak(tText, d.appSettings.speech, d.appSettings.language))
      announce(t("spokenUnavailable"));
  },
  commandSpeak: (text, onComplete) => {
    const d = getState();
    if (!d.appSettings.speech) {
      onComplete?.();
      return false;
    }
    beep("radio", d.appSettings.soundVolume);
    window.setTimeout(() => {
      if (
        !speakCommand(text, true, d.appSettings.language, {
          onStart: () => startRadioBed(d.appSettings.soundVolume),
          onEnd: () => {
            stopRadioBed();
            beep("radio", d.appSettings.soundVolume);
            onComplete?.();
          },
        })
      ) {
        announce(t("spokenUnavailable"));
        onComplete?.();
      }
    }, 280);
    return true;
  },
  startMusic: () => {
    const d = getState();
    if (d.appSettings.sound) startBattleMusic(d.appSettings.soundVolume);
  },
  startComicMusic: (monsterId) => {
    const d = getState();
    startComicMusic(monsterId, d.appSettings.soundVolume * 0.45);
  },
  startMenuMusic,
  notice: announce,
  applyAccessibility: () => applyAccessibility(getState().appSettings),
  refreshChrome,
  pause30: async () => {
    const d = getState();
    if (d.activeSession.stepTimer?.pauseUsed) return false;
    stopBattleMusic();
    d.activeSession.stepTimer.pauseUsed = true;
    d.activeSession.pauseState.paused = true;
    d.activeSession.timer = pauseTimer(d.activeSession.timer);
    d.activeSession.stepTimer = pauseStepTimer(d.activeSession.stepTimer);
    await persist(d);
    showPause30();
    return true;
  },
  requireParent: (purpose) => showPin(purpose),
  goParent: (s) => {
    if (!parentAuth.active()) return showPin("parent:" + s);
    route = "parent";
    params = { section: s };
    render();
    parentAuth.touch();
  },
  exitParent: () => {
    parentAuth.close();
    route = "home";
    render();
  },
  approveInspection: async (note) => {
    const d = getState();
    const { approveInspection } = await import("./game-engine.js");
    d.activeSession = approveInspection(d.activeSession, note);
    await persist(d);
    route = "victory";
    render();
  },
  returnMissions: async (ids, note) => {
    const d = getState();
    const { returnMissions } = await import("./game-engine.js");
    d.activeSession = returnMissions(d.activeSession, ids, note);
    await persist(d);
    parentAuth.close();
    route = "battle-transition";
    render();
  },
  finishSession: async () => {
    const d = getState();
    const { finishSession } = await import("./game-engine.js");
    const s = finishSession(d.activeSession);
    d.appSettings.defeatedMonsterIds = [
      ...new Set([...(d.appSettings.defeatedMonsterIds || []), s.monsterId]),
    ];
    d.sessionHistory = [...d.sessionHistory, s].slice(-100);
    d.activeSession = null;
    await persist(d);
    route = "home";
    render();
    announce(t("battleSaved"));
  },
  restoreMissions: async () => {
    if (!confirm(t("restoreConfirm"))) return;
    const d = getState(),
      custom = d.missions.filter(
        (m) => !factoryMissions.some((f) => f.id === m.id),
      );
    d.missions = [...structuredClone(factoryMissions), ...custom];
    await persist(d);
    render();
  },
  exportBackup: () =>
    downloadBackup(
      getState(),
      `room-monster-backup-${new Date().toISOString().slice(0, 10)}.json`,
    ),
  importBackup: async (file) => {
    if (!file) return announce(t("chooseBackup"));
    try {
      const d = await parseBackup(file);
      downloadBackup(getState(), "room-monster-pre-import-backup.json");
      if (
        !confirm(
          t("validBackup", {
            heroes: d.children.length,
            missions: d.missions.length,
            sessions: d.sessionHistory.length,
          }),
        )
      )
        return;
      await persist(d);
      setLanguage(d.appSettings.language || "en");
      applyAccessibility(d.appSettings);
      refreshChrome();
      route = "home";
      render();
      announce(t("backupImported"));
    } catch (e) {
      announce(t("importRejected", { message: e.message }));
    }
  },
  fullReset: async () => {
    if (!confirm(t("reset1"))) return;
    if (!confirm(t("reset2"))) return;
    const phrase = prompt(t("resetPhrase"));
    if (phrase !== "RESET ROOM MONSTER") return announce(t("resetCancelled"));
    await clearData();
    location.reload();
  },
  abortBattle: async () => {
    const d = getState();
    d.activeSession = null;
    await persist(d);
    parentAuth.close();
    route = "home";
    params = {};
    render();
    announce(t("battleAborted"));
  },
  defeatBattle: async () => {
    const d = getState();
    const defeated = {
      ...d.activeSession,
      status: "defeated",
      completedAt: new Date().toISOString(),
      outcome: "monster",
    };
    d.sessionHistory = [...d.sessionHistory, defeated].slice(-100);
    d.activeSession = null;
    await persist(d);
    route = "home";
    render();
    announce(t("defeatedNotice"));
  },
};
function render() {
  const d = getState();
  if (route !== "mission") {
    stopBattleMusic();
  }
  if (route !== "comic-reader") stopComicMusic();
  if (route !== "home") stopMenuMusic();
  setLanguage(d.appSettings.language || "en");
  refreshChrome();
  applyAccessibility(d.appSettings);
  if (!d.appSettings.setupComplete) return renderSetup(root, d, actions);
  if (route === "home") renderHome(root, d, actions);
  else if (route === "modes") renderModes();
  else if (route === "intro")
    renderIntro(params.modeId || d.appSettings.lastModeId || "normal");
  else if (route === "mission") renderMission(root, d, actions);
  else if (route === "battle-transition")
    renderBattleTransition(root, d, actions);
  else if (route === "monster-origin") renderMonsterOrigin(root, d, actions);
  else if (route === "celebration") renderCelebration(root, d, actions);
  else if (route === "inspection-request")
    renderInspectionRequest(root, d, actions);
  else if (route === "inspection") renderInspection(root, d, actions);
  else if (route === "victory") renderVictory(root, d, actions);
  else if (route === "player-settings") renderPlayerSettings(root, d, actions);
  else if (route === "comicbook") renderComicBook(root, d, actions);
  else if (route === "comic-reader") renderComicReader(root, d, actions, params);
  else if (route === "parent")
    renderParentDashboard(root, d, actions, params.section || "dashboard");
  focusMain();
}
function renderModes() {
  const d = getState(),
    modes = d.gameModes.filter((m) => m.childSelectable);
  root.replaceChildren(
    el(
      "section",
      { class: "child-screen" },
      el(
        "div",
        { class: "card" },
        el("h1", { text: t("chooseBattle") }),
        el("p", { text: t("chooseBattleHelp") }),
        el(
          "div",
          { class: "grid three" },
          ...modes.map((m) =>
            button(
              `${m.id === "quick" ? "⚡" : m.id === "deep" ? "🧹" : "🛡️"} ${modeName(m)}`,
              "choice mode-card",
              () => {
                route = "intro";
                params = { modeId: m.id };
                render();
              },
            ),
          ),
        ),
      ),
    ),
  );
}
function renderIntro(modeId) {
  const d = getState(),
    mode = d.gameModes.find((m) => m.id === modeId),
    missions = (mode?.missionIds || [])
      .map((id) => d.missions.find((x) => x.id === id))
      .filter((x) => x?.active && !x.archived);
  root.replaceChildren(
    el(
      "section",
      { class: "child-screen" },
      el(
        "div",
        { class: "card hero-card" },
        el(
          "div",
          {},
          monsterSprite(
            {
              monsterId:
                monsters[
                  (d.appSettings.nextMonsterIndex || 0) % monsters.length
                ].id,
            },
            "monster-sprite intro-monster messy",
          ),
          el(
            "div",
            { class: "zone-strip" },
            ...missions.slice(0, 6).map((m) =>
              el("span", {
                class: "zone",
                text: m.icon + " " + localized(m, "title"),
              }),
            ),
          ),
        ),
        el(
          "div",
          {},
          el("h1", { text: t("briefing") }),
          el("p", {
            text: t("briefingText", {
              mode: modeName(mode),
              count: missions.length,
            }),
          }),
          el(
            "div",
            { class: "grid two" },
            ...d.children
              .filter((c) => c.active !== false)
              .map((c) =>
                el(
                  "div",
                  { class: "hero-chip" },
                  heroPortrait(c),
                  el(
                    "div",
                    {},
                    el("strong", { text: c.displayName }),
                    el("div", { text: c.heroTitle || t("hero") }),
                  ),
                ),
              ),
          ),
          el("p", { text: t("teamRule") }),
          button(t("beginMission"), "btn-primary", () => startBattle(modeId)),
        ),
      ),
    ),
  );
}
async function startBattle(modeId) {
  const d = getState();
  await activateAudio();
  if (!d.activeSession) {
    d.activeSession = createSession(d, modeId);
    d.appSettings.nextMonsterIndex =
      ((d.appSettings.nextMonsterIndex || 0) + 1) % monsters.length;
    d.appSettings.lastModeId = modeId;
    await persist(d);
  }
  route = "battle-transition";
  actions.sound("mission-warning");
  actions.notice(t("missionAlarm"));
  render();
}
function showPause30() {
  const d = getState();
  let seconds = 30;
  let resumed = false;
  const counter = el("strong", { class: "pause-countdown", text: "0:30" });
  const modal = el(
    "div",
    { class: "modal" },
    el(
      "div",
      { class: "card", style: "text-align:center" },
      el("h2", { text: t("paused") }),
      el("p", { text: t("pauseText") }),
      counter,
      button(t("resumeBattle"), "btn-primary", () => resume()),
    ),
  );
  const resume = async () => {
    if (resumed) return;
    resumed = true;
    clearInterval(interval);
    d.activeSession.pauseState.paused = false;
    d.activeSession.timer = resumeTimer(d.activeSession.timer);
    d.activeSession.stepTimer = resumeStepTimer(d.activeSession.stepTimer);
    await persist(d);
    modal.remove();
    route = "mission";
    render();
  };
  const interval = setInterval(() => {
    seconds -= 1;
    counter.textContent = `0:${String(Math.max(0, seconds)).padStart(2, "0")}`;
    if (seconds <= 0) resume();
  }, 1000);
  document.body.append(modal);
}
function showPin(purpose = "parent:dashboard") {
  const d = getState();
  let pin = "";
  const dots = el("div", { class: "pin-dots", text: "○ ○ ○ ○" }),
    msg = el("p", { class: "error" });
  const modal = el(
    "div",
    { class: "modal" },
    el(
      "div",
      { class: "card" },
      el("h2", { text: t("parentPin") }),
      el("p", { text: t("grownArea") }),
      dots,
      msg,
    ),
  );
  const keys = el("div", { class: "keypad" });
  const refresh = () =>
    (dots.textContent = [0, 1, 2, 3]
      .map((i) => (i < pin.length ? "●" : "○"))
      .join(" "));
  async function press(k) {
    if (k === "←") {
      pin = pin.slice(0, -1);
      refresh();
      return;
    }
    if (k === "X") {
      modal.remove();
      return;
    }
    if (pin.length < 4) pin += k;
    refresh();
    if (pin.length === 4) {
      const result = await verifyPin(pin, d.parentSecurity);
      if (result.security) {
        d.parentSecurity = result.security;
        await persist(d);
      }
      if (result.ok) {
        parentAuth.open();
        modal.remove();
        if (purpose === "abort") {
          if (confirm(t("abortConfirm"))) actions.abortBattle();
          else parentAuth.close();
        } else if (purpose === "inspection") {
          route = "inspection";
          render();
        } else {
          route = "parent";
          params = { section: purpose.split(":")[1] || "dashboard" };
          render();
        }
      } else {
        msg.textContent = result.locked
          ? t("locked", { seconds: Math.ceil(result.waitMs / 1000) })
          : t("pinWrong");
        pin = "";
        refresh();
      }
    }
  }
  for (const k of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "X", "0", "←"])
    keys.append(button(k, "btn-secondary", () => press(k)));
  modal.firstChild.append(keys);
  document.body.append(modal);
}
function updateConnectivity() {
  const b = document.getElementById("connectivity");
  if (!b) return;
  const on = navigator.onLine;
  b.textContent = on ? t("online") : t("offline");
  b.classList.toggle("offline", !on);
}
window.addEventListener("online", updateConnectivity);
window.addEventListener("offline", updateConnectivity);
document.getElementById("language-toggle").onclick = async () => {
  const d = getState();
  d.appSettings.language = d.appSettings.language === "es" ? "en" : "es";
  setLanguage(d.appSettings.language);
  await persist(d);
  refreshChrome();
  render();
};
document.getElementById("parent-access").onclick = () =>
  showPin("parent:dashboard");
document.addEventListener("visibilitychange", async () => {
  const d = getState();
  if (!d?.activeSession) return;
  if (document.hidden) hiddenAt = Date.now();
  else if (
    hiddenAt &&
    Date.now() - hiddenAt > 30000 &&
    !d.activeSession.pauseState.paused
  ) {
    d.activeSession.timer = pauseTimer(d.activeSession.timer, hiddenAt);
    d.activeSession.timer = resumeTimer(d.activeSession.timer, Date.now());
    d.activeSession.stepTimer = pauseStepTimer(
      d.activeSession.stepTimer,
      hiddenAt,
    );
    d.activeSession.stepTimer = resumeStepTimer(
      d.activeSession.stepTimer,
      Date.now(),
    );
    d.activeSession.interrupted = true;
    await persist(d);
    announce(t("timerHidden"));
  }
  hiddenAt = 0;
});
setInterval(() => {
  if (route === "parent" && !parentAuth.active()) {
    parentAuth.close();
    route = "home";
    render();
    announce(t("parentClosed"));
  }
}, 15000);
for (const evt of ["pointerdown", "keydown"])
  document.addEventListener(
    evt,
    () => {
      if (route === "parent" && parentAuth.active()) parentAuth.touch();
    },
    { passive: true },
  );
async function init() {
  try {
    let d = await loadData();
    d = d ? migrate(d) : makeDefaultData();
    setState(d);
    setLanguage(d.appSettings.language || "en");
    if (d.activeSession) {
      route =
        d.activeSession.status === "inspection"
          ? "inspection-request"
          : d.activeSession.status === "victory"
            ? "victory"
            : "home";
    }
    refreshChrome();
    d.appSettings.sound = true;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const nw = reg.installing;
            nw?.addEventListener("statechange", () => {
              if (
                nw.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                announce(d.activeSession ? t("updateAfter") : t("updateReady"));
              }
            });
          });
        })
        .catch(() => announce(t("offlineUnavailable")));
    }
    render();
  } catch (e) {
    console.error(e);
    root.replaceChildren(
      el(
        "div",
        { class: "card" },
        el("h1", { text: t("restartTitle") }),
        el("p", { text: t("restartText") }),
      ),
    );
  }
}
init();
