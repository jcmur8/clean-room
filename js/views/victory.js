import { el, button } from "../ui.js";
import { t, getLanguage } from "../i18n.js";
import { confettiBurst } from "../effects.js";
import { monsterSprite } from "../monsters.js";

export function renderVictory(root, data, actions) {
  const message =
    getLanguage() === "es"
      ? data.appSettings.rewardMessageEs || data.appSettings.rewardMessage
      : data.appSettings.rewardMessage;

  root.replaceChildren(
    el(
      "section",
      { class: "child-screen victory-screen" },
      el(
        "div",
        { class: "card celebrate victory-stage", style: "text-align:center" },
        el("div", { class: "victory-rays", "aria-hidden": "true" }),
        monsterSprite(data.activeSession, "monster-sprite victory-monster"),
        el("h1", { text: t("victory") }),
        el("p", { text: t("victoryText") }),
        el("div", {
          class: "collectibles victory-stars",
          text: "⭐ 🏅 ✨ 🌟 🏆 ✨ ⭐",
        }),
        el("p", { class: "notice", text: message }),
        button(t("finishBattle"), "btn-primary", () => actions.finishSession()),
      ),
    ),
  );

  actions.sound("victory");
  confettiBurst({ count: 96, duration: 3200, final: true });
  window.setTimeout(
    () => confettiBurst({ count: 64, duration: 2600, final: true }),
    850,
  );
}
