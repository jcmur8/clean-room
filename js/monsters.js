import { monsters } from "./defaults.js";
import { getLanguage } from "./i18n.js";
import { el } from "./ui.js";

export function monsterForSession(session) {
  return (
    monsters.find((monster) => monster.id === session?.monsterId) || monsters[0]
  );
}

export function monsterName(monster) {
  return getLanguage() === "es" ? monster.nameEs : monster.name;
}

export function monsterSprite(session, className = "monster-sprite") {
  const monster = monsterForSession(session);
  return el("img", {
    class: className,
    src: monster.image,
    alt: monsterName(monster),
    width: "420",
    height: "420",
  });
}
