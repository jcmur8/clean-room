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
  "dust-devourer": {
    title: "The Dust Devourer's First Storm",
    titleEs: "La primera tormenta del Devorador de Polvo",
    panels: [
      "Dust bunnies met beneath a shelf that had not been cleared for a very long time.",
      "A forgotten fan spun the dust into a living storm with two enormous golden eyes.",
      "The Dust Devourer hides in corners, but clear surfaces and careful dusting make its storm fade.",
    ],
    panelsEs: [
      "Las pelusas se reunieron bajo un estante que llevaba mucho tiempo sin despejarse.",
      "Un ventilador olvidado convirtió el polvo en una tormenta viviente con enormes ojos dorados.",
      "El Devorador se esconde en los rincones, pero las superficies despejadas hacen desaparecer su tormenta.",
    ],
  },
  "sock-stealer": {
    title: "The Case of the Missing Socks",
    titleEs: "El caso de los calcetines perdidos",
    panels: [
      "One lonely sock slipped behind the hamper and wished for a partner in mischief.",
      "Its wish woke a blue collector who built secret tunnels from forgotten laundry.",
      "Matching every pair closes those tunnels and leaves the Sock Stealer nowhere to hide.",
    ],
    panelsEs: [
      "Un calcetín solitario cayó detrás del cesto y deseó un compañero de travesuras.",
      "Su deseo despertó a un coleccionista azul que construyó túneles con ropa olvidada.",
      "Emparejar los calcetines cierra esos túneles y deja al Ladrón sin escondite.",
    ],
  },
  "toy-tumbler": {
    title: "The Tower That Tumbled",
    titleEs: "La torre que se derrumbó",
    panels: [
      "A tower of unsorted toys grew so tall that it touched the moonlight.",
      "When it crashed, its biggest green block sprouted horns, paws, and a roaring laugh.",
      "The Toy Tumbler loses power whenever toys are sorted safely into their proper homes.",
    ],
    panelsEs: [
      "Una torre de juguetes sin ordenar creció tanto que tocó la luz de la luna.",
      "Al caer, su bloque verde más grande desarrolló cuernos, patas y una risa rugiente.",
      "El Volteador pierde poder cuando los juguetes se clasifican en sus lugares.",
    ],
  },
  "book-basher": {
    title: "The Library Disturbance",
    titleEs: "El disturbio de la biblioteca",
    panels: [
      "Books left open on the floor whispered unfinished stories after everyone went to sleep.",
      "The loudest endings twisted together and became a purple creature that tossed every chapter.",
      "Returning books upright and treating pages gently rewrites the Book Basher's ending.",
    ],
    panelsEs: [
      "Los libros abiertos en el piso susurraban historias sin terminar durante la noche.",
      "Los finales más ruidosos se unieron y formaron una criatura morada que lanzaba capítulos.",
      "Guardar los libros y cuidar sus páginas cambia el final del Destructor de Libros.",
    ],
  },
  "crumb-cruncher": {
    title: "The Midnight Crumb Trail",
    titleEs: "El rastro de migas de medianoche",
    panels: [
      "A tiny trail of snack crumbs crossed the room and disappeared beneath a toy bin.",
      "Each midnight snack added another crunchy layer until the golden monster awakened.",
      "Safe cleanup with a grown-up removes its trail and leaves the Crumb Cruncher hungry for nothing.",
    ],
    panelsEs: [
      "Un pequeño rastro de migas cruzó el cuarto y desapareció bajo una caja de juguetes.",
      "Cada bocadillo nocturno añadió otra capa crujiente hasta despertar al monstruo dorado.",
      "La limpieza segura con un adulto borra su rastro y debilita al Triturador de Migas.",
    ],
  },
  "laundry-lurker": {
    title: "The Hamper That Blinked",
    titleEs: "El cesto que parpadeó",
    panels: [
      "A hamper overflowed until clean clothes and dirty clothes forgot which team they belonged to.",
      "The mixed-up mountain blinked, giggled, and grew pink paws beneath the blankets.",
      "Sorting laundry into the right places makes the Laundry Lurker sink back into the basket.",
    ],
    panelsEs: [
      "Un cesto se desbordó hasta que la ropa limpia y sucia olvidó a qué equipo pertenecía.",
      "La montaña mezclada parpadeó, se rio y desarrolló patas rosas bajo las cobijas.",
      "Clasificar la ropa hace que el Acechador vuelva a hundirse en el cesto.",
    ],
  },
  "drawer-digger": {
    title: "The Secret Beneath Drawer Three",
    titleEs: "El secreto bajo el tercer cajón",
    panels: [
      "Small objects were pushed into one drawer whenever nobody knew where they belonged.",
      "The drawer rattled for seven nights before an orange explorer tunneled out through the socks.",
      "Giving every object a home fills its tunnels and stops the Drawer Digger's search.",
    ],
    panelsEs: [
      "Pequeños objetos fueron empujados a un cajón cuando nadie sabía dónde guardarlos.",
      "El cajón tembló siete noches antes de que un explorador naranja saliera entre los calcetines.",
      "Dar un hogar a cada objeto llena sus túneles y detiene al Excavador de Cajones.",
    ],
  },
  "backpack-burrower": {
    title: "The Backpack With a Heartbeat",
    titleEs: "La mochila con latido",
    panels: [
      "Old papers, pencils, and mystery treasures gathered at the bottom of a forgotten backpack.",
      "The zipper began to breathe, and a teal creature peeked out with stolen homework maps.",
      "Emptying, sorting, and repacking the bag collapses the Backpack Burrower's secret den.",
    ],
    panelsEs: [
      "Papeles, lápices y tesoros misteriosos se reunieron al fondo de una mochila olvidada.",
      "El cierre empezó a respirar y una criatura turquesa asomó con mapas de tareas robados.",
      "Vaciar, clasificar y empacar la mochila derrumba la guarida del Intruso.",
    ],
  },
  "wall-doodler": {
    title: "The Mark That Moved",
    titleEs: "La marca que se movió",
    panels: [
      "A runaway crayon made one tiny mark where paper should have been used.",
      "By morning the mark had grown red fur, golden horns, and a pocket full of colors.",
      "Keeping art on approved paper and asking an adult for cleanup traps the Wall Doodler in its sketchbook.",
    ],
    panelsEs: [
      "Un crayón fugitivo dejó una marca donde debía haberse usado papel.",
      "Al amanecer, la marca tenía pelo rojo, cuernos dorados y bolsillos llenos de colores.",
      "Dibujar en papel y pedir ayuda para limpiar encierra al Garabateador en su cuaderno.",
    ],
  },
  "nighttime-ninja": {
    title: "The Shadow After Lights-Out",
    titleEs: "La sombra después de apagar la luz",
    panels: [
      "Every object left on the floor cast a small shadow when the bedroom lights went out.",
      "At midnight the shadows joined into a silent ninja that could move a mess without a sound.",
      "Clear pathways and tidy homes leave no shadows for the Nighttime Ninja to command.",
    ],
    panelsEs: [
      "Cada objeto dejado en el piso proyectó una pequeña sombra al apagarse las luces.",
      "A medianoche, las sombras formaron un ninja silencioso capaz de mover el desorden.",
      "Los caminos despejados no dejan sombras para que el Ninja Nocturno pueda controlar.",
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
