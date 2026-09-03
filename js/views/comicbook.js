import { el, button } from "../ui.js";
import { monsters } from "../defaults.js";
import { monsterSprite, monsterName } from "../monsters.js";
import { monsterStory } from "../monster-stories.js";
import { comicStory } from "../comic-stories.js";
import { t } from "../i18n.js";

export function renderComicBook(root, data, actions) {
  const unlocked = new Set(data.appSettings.defeatedMonsterIds || []);
  const tiles = monsters.map((monster) => {
    const defeated = unlocked.has(monster.id);
    const activate = async () => {
      if (defeated) {
        actions.go("comic-reader", { monsterId: monster.id, scene: 0 });
        return;
      }
      data.appSettings.selectedMonsterId = monster.id;
      await actions.save(data);
      actions.notice(t("quickMissionSelected", { monster: monsterName(monster) }));
      actions.go("mission-offer", { modeId: "quick" });
    };
    return el(
      "article",
      {
        class: `monster-library-tile ${defeated ? "unlocked" : "locked"}`,
        role: "button",
        tabindex: "0",
        onClick: activate,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        },
        "aria-label": defeated
          ? t("openMonsterComic", { monster: monsterName(monster) })
          : t("startQuickAgainst", { monster: monsterName(monster) }),
      },
      monsterSprite({ monsterId: monster.id }, "monster-sprite library-monster"),
      el("strong", { text: monsterName(monster) }),
      el("span", { text: defeated ? t("defeatedUnlocked") : `🔒 ${t("notDefeated")}` }),
      defeated
        ? el("span", { class: "comic-tile-action", text: t("tapToRead") })
        : el("span", { class: "comic-tile-action locked-mission", text: t("tapForQuickMission") }),
    );
  });

  root.replaceChildren(
    el(
      "section",
      { class: "child-screen comic-library-screen" },
      el("div", { class: "screen-title-row" }, button("←", "btn-secondary", () => actions.go("home"), { "aria-label": t("backToMenu") }), el("div", {}, el("h1", { text: t("comicBook") }), el("p", { text: t("comicBookHelp") }))),
      el("div", { class: "monster-library-grid" }, ...tiles),
    ),
  );
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
}

export function renderComicReader(root, data, actions, params = {}) {
  const monsterId = params.monsterId;
  if (!(data.appSettings.defeatedMonsterIds || []).includes(monsterId)) {
    actions.go("comicbook");
    return;
  }
  const monster = monsters.find((item) => item.id === monsterId) || monsters[0];
  const pdfComic = comicStory(monsterId);
  const origin = monsterStory(monsterId);
  const scenes = pdfComic?.scenes || origin.panels;
  const scene = Math.max(0, Math.min(scenes.length - 1, Number(params.scene) || 0));
  const title = pdfComic?.title || origin.title;
  const visual = pdfComic
    ? el(
        "div",
        { class: `comic-source-crop source-scene-${scene}` },
        el("img", { src: pdfComic.image, alt: "" }),
      )
    : el("div", { class: "original-comic-scene" }, monsterSprite({ monsterId }, "monster-sprite comic-reader-monster"));

  root.replaceChildren(
    el(
      "section",
      { class: "child-screen comic-reader-screen" },
      el(
        "div",
        { class: "screen-title-row" },
        button("←", "btn-secondary", () => actions.go("comicbook"), { "aria-label": t("backToComics") }),
        el("div", {}, el("span", { class: "comic-progress", text: t("comicScene", { current: scene + 1, total: scenes.length }) }), el("h1", { text: `${monsterName(monster)}: ${title}` })),
      ),
      el(
        "article",
        { class: "comic-reader-card" },
        visual,
        el("div", { class: "comic-scene-copy" }, el("p", { text: scenes[scene] }), scene === scenes.length - 1 && pdfComic ? el("aside", { class: "hero-lesson" }, el("strong", { text: t("heroLesson") }), el("span", { text: pdfComic.lesson })) : null),
      ),
      el(
        "div",
        { class: "comic-reader-controls" },
        scene > 0 ? button(t("previousScene"), "btn-secondary", () => actions.go("comic-reader", { monsterId, scene: scene - 1 })) : el("span"),
        scene < scenes.length - 1
          ? button(t("nextScene"), "btn-primary", () => actions.go("comic-reader", { monsterId, scene: scene + 1 }))
          : button(t("backToComics"), "btn-primary", () => actions.go("comicbook")),
      ),
    ),
  );
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
  actions.startComicMusic(monsterId);
}
