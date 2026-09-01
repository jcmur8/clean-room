import { el, button } from "../ui.js";
import { t } from "../i18n.js";

export function renderHome(root, data, actions) {
  const active = Boolean(data.activeSession && data.activeSession.status !== "complete");
  const startOrResume = async () => {
    await actions.audio();
    if (active) {
      const status = data.activeSession.status;
      actions.go(status === "inspection" ? "inspection-request" : status === "victory" ? "victory" : "mission");
      return;
    }
    const defaultMode = data.gameModes.find((mode) => mode.defaultMode);
    actions.go(data.appSettings.showModeSelection ? "modes" : "intro", {
      modeId: defaultMode ? defaultMode.id : "normal",
    });
  };

  const menu = el(
    "div",
    { class: "landing-menu-grid", "aria-label": t("mainMenu") },
    button(`🔐 ${t("parentZone")}`, "landing-menu-card parent-zone", () => actions.goParent("dashboard")),
    button(`⚔ ${active ? t("resume") : t("battleMenu")}`, "landing-menu-card battle-zone", startOrResume),
    button(`⚙ ${t("settingMenu")}`, "landing-menu-card setting-zone", () => actions.go("player-settings")),
    button(`📚 ${t("comicBooksMenu")}`, "landing-menu-card comics-zone", async () => {
      await actions.audio();
      actions.go("comicbook");
    }),
  );

  const musicButton = button(`♫ ${t("menuMusicHint")}`, "menu-music-activation", async (event) => {
    event?.stopPropagation?.();
    await actions.audio();
    actions.startMenuMusic();
    musicButton.textContent = `♫ ${t("menuMusicPlaying")}`;
    musicButton.classList.add("playing");
  });

  root.replaceChildren(
    el(
      "section",
      { class: "landing-screen child-screen" },
      el(
        "div",
        { class: "landing-logo-wrap" },
        el("img", {
          class: "landing-logo",
          src: "./assets/images/hero-cleaners-logo-v1.png",
          alt: "Hero Cleaners",
        }),
        el("p", { class: "landing-tagline", text: t("landingTagline") }),
      ),
      menu,
      musicButton,
    ),
  );
  actions.startMenuMusic();
}
