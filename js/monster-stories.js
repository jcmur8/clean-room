import { getLanguage } from "./i18n.js";

const stories = {
  "mess-gobbler": {
    title: "How the Mess Gobbler Awoke",
    titleEs: "Cómo despertó el Devorador del Desorden",
    panels: [
      "Long ago, toys and clothes were stuffed under the bed instead of being put away.",
      "Dust swirled around the hidden piles until it grew purple fur, bright eyes, and golden horns.",
      "Every new mess fed the Mess Gobbler. Only a team of Room Heroes can make it shrink!",
    ],
    panelsEs: [
      "Hace mucho, juguetes y ropa fueron empujados debajo de la cama en vez de guardarse.",
      "El polvo giró alrededor de las pilas hasta formar pelo morado, ojos brillantes y cuernos dorados.",
      "Cada nuevo desorden alimentó al Devorador. ¡Solo los Héroes del Cuarto pueden encogerlo!",
    ],
  },
  "clutter-crawler": {
    title: "The Clutter Crawler's Secret",
    titleEs: "El secreto del Trepador del Desorden",
    panels: [
      "At night, tiny forgotten objects gathered in the darkest corner of the room.",
      "They built a nest of clutter, and two glowing antennae appeared between the piles.",
      "The Clutter Crawler spreads whenever things lose their home. Organized heroes weaken its power!",
    ],
    panelsEs: [
      "Por la noche, pequeños objetos olvidados se reunieron en el rincón más oscuro.",
      "Construyeron un nido de desorden y dos antenas brillantes aparecieron entre las pilas.",
      "El Trepador se extiende cuando las cosas pierden su lugar. ¡Los héroes organizados reducen su poder!",
    ],
  },
  "chaos-slime": {
    title: "The Birth of the Chaos Slime",
    titleEs: "El nacimiento del Slime del Caos",
    panels: [
      "A mystery pile grew beside the toy bins, with every piece mixed into the wrong group.",
      "Confusion melted the pile into a bright green goo that stuck to everything nearby.",
      "The Chaos Slime grows on mixed-up messes. Sorting each item makes the slime lose its strength!",
    ],
    panelsEs: [
      "Una pila misteriosa creció junto a los juguetes, con cada pieza en el grupo equivocado.",
      "La confusión derritió la pila en una baba verde brillante que se pegó a todo.",
      "El Slime del Caos crece con el desorden mezclado. ¡Clasificar cada objeto le quita fuerza!",
    ],
  },
};

export function monsterStory(monsterId) {
  const story = stories[monsterId] || stories["mess-gobbler"];
  return {
    title: getLanguage() === "es" ? story.titleEs : story.title,
    panels: getLanguage() === "es" ? story.panelsEs : story.panels,
  };
}
