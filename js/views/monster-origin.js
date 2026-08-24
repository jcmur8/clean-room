import { el, button } from "../ui.js";
import { monsterSprite } from "../monsters.js";
import { monsterStory } from "../monster-stories.js";
import { t } from "../i18n.js";

export function renderMonsterOrigin(root, data, actions) {
  const session = data.activeSession;
  const story = monsterStory(session.monsterId);
  root.replaceChildren(
    el(
      "section",
      { class: "comic-cutscene" },
      el(
        "div",
        { class: "comic-title" },
        el("span", { text: t("classifiedFile") }),
        el("h1", { text: story.title }),
      ),
      el(
        "div",
        { class: "comic-panels" },
        ...story.panels.map((text, index) =>
          el(
            "article",
            { class: `comic-panel panel-${index + 1}` },
            el("span", { class: "panel-number", text: String(index + 1) }),
            monsterSprite(
              session,
              `monster-sprite comic-monster pose-${index + 1}`,
            ),
            el("p", { text }),
          ),
        ),
      ),
      button(t("beginBattle"), "btn-primary comic-deploy", () =>
        actions.go("battle-transition"),
      ),
    ),
  );
  actions.sound("radio");
}
