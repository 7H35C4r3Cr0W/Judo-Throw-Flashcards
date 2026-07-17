/* Service worker — precaches the whole app (shell + all animations)
   so it works fully offline after the first visit.
   Bump CACHE_VERSION whenever any precached file changes. */

var CACHE_VERSION = "judo-v2.1.0";

var APP_SHELL = [
  "./",
  "index.html",
  "css/style.css",
  "js/data.js",
  "js/core.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "kano_jigoro.jpg"
];

var GIFS = [
  "images/technique/deashibarai.gif",
  "images/technique/hizaguruma.gif",
  "images/technique/sasaetsu.gif",
  "images/technique/uki_goshi.gif",
  "images/technique/osoto_gari.gif",
  "images/technique/ogoshi.gif",
  "images/technique/ouchi_gari.gif",
  "images/technique/seoi-nage.gif",
  "images/technique/kosotogari.gif",
  "images/technique/kouchigari.gif",
  "images/technique/koshiguruma.gif",
  "images/technique/tsurikomi_goshi.gif",
  "images/technique/okuriash_Haraii.gif",
  "images/technique/tai_otoshi.gif",
  "images/technique/hara_igoshi.gif",
  "images/technique/uchi_mata.gif",
  "images/technique/kosotogake.gif",
  "images/technique/tsuri_goshi.gif",
  "images/technique/yoko_otoshi.gif",
  "images/technique/ashiguruma.gif",
  "images/technique/hanegoshi.gif",
  "images/technique/haraitsurikomiashi.gif",
  "images/technique/tomoe_nage.gif",
  "images/technique/sumi_gaesh.gif",
  "images/technique/tani_otoshi.gif",
  "images/technique/hanemakikomi.gif",
  "images/technique/sukui_nage.gif",
  "images/technique/utsuri_goshi.gif",
  "images/technique/oguruma.gif",
  "images/technique/soto_makikomi.gif",
  "images/technique/uki_otoshi.gif",
  "images/technique/osoto_guruma.gif",
  "images/technique/uki_waza.gif",
  "images/technique/yoko_wakare.gif",
  "images/technique/yoko_guruma.gif",
  "images/technique/ushiro_goshi.gif",
  "images/technique/ura_nage.gif",
  "images/technique/sumi_otoshi.gif",
  "images/technique/yoko_gake2.gif",
  "images/technique/obi_otoshi.gif",
  "images/technique/seoio_toshi.gif",
  "images/technique/yama_arashi.gif",
  "images/technique/osoto_otoshi.gif",
  "images/technique/dakiwakare.gif",
  "images/technique/hikikomigaeshi.gif",
  "images/technique/tawara_gaeshi.gif",
  "images/technique/uchi_makikomi.gif"
];

/* "no-cache" forces revalidation against the server so a version bump can
   never precache files the browser HTTP cache is still holding stale. */
function freshRequest(url) {
  return new Request(url, { cache: "no-cache" });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // the app shell is atomic: fail the install if any piece is missing…
      return cache.addAll(APP_SHELL.map(freshRequest)).then(function () {
        // …but GIFs are best-effort — one bad file must not brick every
        // future update (missing ones self-heal via runtime caching)
        return Promise.all(GIFS.map(function (u) {
          return cache.add(freshRequest(u)).catch(function () {});
        }));
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_VERSION) return caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // navigations are network-first so a new deploy is picked up promptly;
  // offline falls back to the precached shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(function () { return caches.match("index.html"); })
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(freshRequest(req.url)).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_VERSION)
            .then(function (cache) { return cache.put(req, copy); })
            .catch(function () {}); // storage pressure — serving still works
        }
        return res;
      }).catch(function () { return Response.error(); });
    })
  );
});
