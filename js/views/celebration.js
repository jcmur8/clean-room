import { el, button } from "../ui.js";
import { t, localized } from "../i18n.js";
import { confettiBurst } from "../effects.js";
import { monsterSprite } from "../monsters.js";
import { monsterStory } from "../monster-stories.js";

export function renderCelebration(root, data, actions) {
  const session = data.activeSession;
  const completedIndex = Math.max(0, session.lastCompletedPhaseIndex || 0);
  const completedPhase = session.phaseSnapshots?.[completedIndex];
  const completedMissions = (completedPhase?.missionIds || [])
    .map((id) => session.missionSnapshots.find((mission) => mission.id === id))
    .filter(Boolean);
  const mission = completedMissions[0] || session.missionSnapshots[completedIndex];
  const weakness = Math.min(3, completedIndex + 1);
  const story = monsterStory(session.monsterId);
  const evidenceIndex = completedIndex % story.panels.length;

  root.replaceChildren(
    el(
      "section",
      { class: "child-screen" },
      el(
        "div",
        {
          class: "card celebrate celebration-stage",
          style: "text-align:center",
        },
        el(
          "article",
          { class: "detective-dossier" },
          el(
            "header",
            { class: "dossier-header" },
            el("span", { text: t("classifiedArchive") }),
            el("strong", { text: `${t("caseFile")} ${String(evidenceIndex + 1).padStart(2, "0")}` }),
          ),
          el(
            "div",
            { class: `dossier-photo weakness-${weakness}` },
            monsterSprite(session, "monster-sprite celebration-monster weakening-monster"),
            el("span", { class: "photo-stamp", text: t("weakenedStamp") }),
          ),
          el(
            "div",
            { class: "dossier-copy" },
            el("p", { class: "evidence-label", text: t("evidenceRecovered") }),
            el("h1", { text: story.title }),
            el("p", { class: "archive-fact", text: story.panels[evidenceIndex] }),
            el("hr"),
            el("h2", { text: t("monsterWeakening") }),
            el("p", {
              text: t("missionComplete", {
                mission: completedMissions.length
                  ? completedMissions.map((item) => localized(item, "title")).join(" + ")
                  : mission ? localized(mission, "title") : t("missionsWord"),
              }),
            }),
          ),
        ),
        button(t("nextMission"), "btn-primary", () => {
          if (session.status === "inspection") {
            actions.go("inspection-request");
          } else if (session.status === "victory") {
            actions.go("victory");
          } else {
            actions.go("battle-transition");
          }
        }),
      ),
    ),
  );

  actions.sound("step-complete");
  confettiBurst({ count: 52, duration: 1900 });
}
