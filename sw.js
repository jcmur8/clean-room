const CACHE = "room-monster-v1.14.0";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./css/child-mode.css",
  "./css/parent-mode.css",
  "./css/animations.css",
  "./css/print.css",
  "./js/app.js",
  "./js/i18n.js",
  "./js/defaults.js",
  "./js/monsters.js",
  "./js/profile-photo.js",
  "./js/monster-stories.js",
  "./js/comic-stories.js",
  "./js/storage.js",
  "./js/migrations.js",
  "./js/validation.js",
  "./js/security.js",
  "./js/audio.js",
  "./js/effects.js",
  "./js/speech.js",
  "./js/timers.js",
  "./js/roles.js",
  "./js/game-engine.js",
  "./js/backup.js",
  "./js/accessibility.js",
  "./js/ui.js",
  "./js/icons.js",
  "./js/state.js",
  "./js/router.js",
  "./js/views/setup.js",
  "./js/views/home.js",
  "./js/views/mission-offer.js",
  "./js/views/mission.js",
  "./js/views/battle-transition.js",
  "./js/views/monster-origin.js",
  "./js/views/celebration.js",
  "./js/views/inspection.js",
  "./js/views/victory.js",
  "./js/views/parent-dashboard.js",
  "./js/views/player-settings.js",
  "./js/views/comicbook.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/images/monsters/mess-gobbler.png",
  "./assets/images/monsters/clutter-crawler.png",
  "./assets/images/monsters/chaos-slime.png",
  "./assets/images/monsters/monster-roster-v2.png",
  "./assets/images/hero-cleaners-logo-v1.png",
  "./assets/images/heroes-de-limpieza-logo-v1.png",
  "./assets/images/digital-butler-salute-v1.png",
  "./assets/comics/en/page-01.jpg",
  "./assets/comics/es/page-01.jpg",
  "./assets/comics/en/page-02.jpg",
  "./assets/comics/es/page-02.jpg",
  "./assets/comics/en/page-03.jpg",
  "./assets/comics/es/page-03.jpg",
  "./assets/comics/en/page-04.jpg",
  "./assets/comics/es/page-04.jpg",
  "./assets/comics/en/page-05.jpg",
  "./assets/comics/es/page-05.jpg",
  "./assets/comics/en/page-06.jpg",
  "./assets/comics/es/page-06.jpg",
  "./assets/comics/en/page-07.jpg",
  "./assets/comics/es/page-07.jpg",
  "./assets/comics/en/page-08.jpg",
  "./assets/comics/es/page-08.jpg",
  "./assets/comics/en/page-09.jpg",
  "./assets/comics/es/page-09.jpg",
  "./assets/comics/en/page-10.jpg",
  "./assets/comics/es/page-10.jpg",
];
self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request)
          .then((r) => {
            if (r.ok && new URL(e.request.url).origin === location.origin) {
              const copy = r.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy));
            }
            return r;
          })
          .catch(() =>
            e.request.mode === "navigate"
              ? caches.match("./index.html")
              : Response.error(),
          ),
    ),
  );
});
