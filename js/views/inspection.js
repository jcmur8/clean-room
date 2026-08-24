import { el, button } from "../ui.js";
import { t, localized } from "../i18n.js";

export function renderInspectionRequest(root, data, actions) {
  const panel = el(
    "section",
    { class: "child-screen" },
    el(
      "div",
      { class: "card", style: "text-align:center" },
      el("div", { class: "monster", text: "😴" }),
      el("h1", { text: t("greatTeamwork") }),
      el("p", { text: t("inspectionAsk") }),
      button(t("grownInspection"), "btn-gold", () =>
        actions.requireParent("inspection"),
      ),
    ),
  );

  root.replaceChildren(panel);
}

export function renderInspection(root, data, actions) {
  const session = data.activeSession;

  const repeatMission = el(
    "select",
    { "aria-label": t("repeatPreviousStep") },
    ...session.missionSnapshots.map((mission) =>
      el("option", {
        value: mission.id,
        text: `${mission.icon} ${localized(mission, "title")}`,
      }),
    ),
  );

  const note = el("textarea", {
    rows: "3",
    placeholder: t("optionalNote"),
  });

  const approveButton = button(t("approveRoom"), "btn-primary", () =>
    actions.approveInspection(note.value),
  );

  const returnButton = button(t("repeatSelectedStep"), "btn-gold", () =>
    actions.returnMissions([repeatMission.value], note.value),
  );

  const panel = el(
    "section",
    { class: "card" },
    el("h1", { text: t("parentInspection") }),
    el("p", { text: t("simpleInspectionHelp") }),
    el(
      "label",
      { class: "field" },
      el("span", { text: t("repeatPreviousStep") }),
      repeatMission,
    ),
    el("label", { class: "field" }, el("span", { text: t("note") }), note),
    el("div", { class: "button-row" }, approveButton, returnButton),
  );

  root.replaceChildren(panel);
}
