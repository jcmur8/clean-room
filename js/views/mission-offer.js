import { el, button } from "../ui.js";
import { t } from "../i18n.js";
import { iconLabel } from "../icons.js";

export function renderMissionOffer(root, data, actions, modeId) {
  const message = t("missionOfferMessage");
  const typed = el("p", {
    class: "incoming-message-text",
    "aria-label": message,
  });
  let character = 0;
  let typingTimer = null;

  const finish = (route) => {
    if (typingTimer) window.clearInterval(typingTimer);
    actions.stopVoice();
    actions.go(route, route === "intro" ? { modeId } : {});
  };

  root.replaceChildren(
    el(
      "section",
      { class: "child-screen mission-offer-screen" },
      el("div", { class: "transmission-grid", "aria-hidden": "true" }),
      el(
        "div",
        { class: "mission-offer-card" },
        el("span", { class: "transmission-label", text: t("incomingTransmission") }),
        el("img", {
          class: "digital-butler",
          src: "./assets/images/digital-butler-salute-v1.png",
          alt: t("digitalButlerAlt"),
        }),
        el("div", { class: "incoming-message-panel" }, typed, el("span", { class: "typing-cursor", text: "▋" })),
        el(
          "div",
          { class: "mission-offer-actions" },
          button(iconLabel("check", t("acceptMission")), "btn-primary accept-mission", () => finish("intro")),
          button(iconLabel("close", t("denyMission")), "btn-danger deny-mission", () => finish("home")),
        ),
      ),
    ),
  );

  actions.assistantSpeak(message);
  typingTimer = window.setInterval(() => {
    character += 1;
    typed.textContent = message.slice(0, character);
    if (character >= message.length) window.clearInterval(typingTimer);
  }, 38);
}
