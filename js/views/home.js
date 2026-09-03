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
    actions.go(data.appSettings.showModeSelection ? "modes" : "mission-offer", {
      modeId: defaultMode ? defaultMode.id : "quick",
    });
  };

  const logo = el(
    "div",
    { class: "landing-logo-wrap" },
    el("img", {
      class: "landing-logo",
      src: data.appSettings.language === "es"
        ? "./assets/images/heroes-de-limpieza-logo-v1.png"
        : "./assets/images/hero-cleaners-logo-v1.png",
      alt: data.appSettings.language === "es" ? "Héroes de Limpieza" : "Hero Cleaners",
    }),
    el("p", { class: "landing-tagline", text: t("landingTagline") }),
  );

  const landing = el(
    "section",
    { class: "landing-screen child-screen" },
    el(
      "div",
      { class: "landing-menu-grid", "aria-label": t("mainMenu") },
      button(`⚔ ${active ? t("resume") : t("battleMenu")}`, "landing-menu-card battle-zone", startOrResume),
      button(`📚 ${t("comicBooksMenu")}`, "landing-menu-card comics-zone", async () => {
        await actions.audio();
        actions.go("comicbook");
      }),
      logo,
      button(`🔐 ${t("parentZone")}`, "landing-menu-card parent-zone", () => actions.goParent("dashboard")),
      button(`⚙ ${t("settingMenu")}`, "landing-menu-card setting-zone", () => actions.go("player-settings")),
    ),
  );
  landing.addEventListener("pointerdown", async () => {
    await actions.audio();
    actions.startMenuMusic();
  }, { once: true, capture: true });
  root.replaceChildren(landing);
  actions.startMenuMusic();
}
