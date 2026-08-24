import { el, button } from "../ui.js";
import { currentMission } from "../game-engine.js";
import { localized, t } from "../i18n.js";
import { monsterSprite, monsterForSession, monsterName } from "../monsters.js";

let transitionTimer = null;

export function renderBattleTransition(root, data, actions) {
  if (transitionTimer) clearTimeout(transitionTimer);
  const session = data.activeSession;
  const mission = currentMission(session);
  const monster = monsterForSession(session);
  const deploy = () => {
    if (transitionTimer) clearTimeout(transitionTimer);
    transitionTimer = null;
    actions.go("mission");
  };

  root.replaceChildren(
    el(
      "section",
      { class: "battle-interlude" },
      el("div", { class: "radar-grid", "aria-hidden": "true" }),
      el("div", { class: "alert-banner", text: t("monsterAttack") }),
      monsterSprite(session, "monster-sprite attacking-monster"),
      el("h1", { text: monsterName(monster) }),
      el("p", {
        class: "interlude-order",
        text: t("incomingMission", {
          mission: mission ? localized(mission, "title") : t("missionsWord"),
        }),
      }),
      button(t("deployNow"), "btn-primary deploy-button", deploy),
    ),
  );
  actions.sound("monster-attack");
  transitionTimer = setTimeout(
    deploy,
    data.appSettings.reducedMotion ? 900 : 3600,
  );
}
