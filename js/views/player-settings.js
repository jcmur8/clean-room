import { el, button } from "../ui.js";
import { heroAvatars } from "../defaults.js";
import { heroPortrait, choosePhotoInput } from "../profile-photo.js";
import { t } from "../i18n.js";

export function renderPlayerSettings(root, data, actions) {
  const cards = data.children
    .filter((child) => child.active !== false)
    .map((child) => {
      const photoInput = choosePhotoInput(t("takeProfilePhoto"), async (photo) => {
        child.photo = photo;
        await actions.save(data);
        actions.go("player-settings");
      });
      return el(
        "article",
        { class: "card player-settings-card" },
        heroPortrait(child, "player-settings-portrait"),
        el("h2", { text: child.displayName }),
        el("p", { text: t("chooseAvatarOrPhoto") }),
        el(
          "div",
          { class: "avatar-picker" },
          ...heroAvatars.map((avatar) =>
            button(
              avatar,
              avatar === child.avatar && !child.photo ? "avatar-option selected" : "avatar-option",
              async () => {
                child.avatar = avatar;
                child.photo = null;
                await actions.save(data);
                actions.go("player-settings");
              },
              { "aria-label": `${t("chooseAvatar")} ${avatar}` },
            ),
          ),
        ),
        el("label", { class: "photo-capture-button" }, `📷 ${t("takeProfilePhoto")}`, photoInput),
        child.photo
          ? button(t("removeProfilePhoto"), "btn-secondary", async () => {
              child.photo = null;
              await actions.save(data);
              actions.go("player-settings");
            })
          : null,
      );
    });

  root.replaceChildren(
    el(
      "section",
      { class: "child-screen player-settings-screen" },
      el("div", { class: "screen-title-row" }, button("←", "btn-secondary", () => actions.go("home"), { "aria-label": t("backToMenu") }), el("h1", { text: t("playerSettings") })),
      el("div", { class: "player-settings-grid" }, ...cards),
    ),
  );
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
}
