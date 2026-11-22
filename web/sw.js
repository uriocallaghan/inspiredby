/* Inspired by Magazine — Service Worker (generat per scripts/sync-home.mjs) */
const CACHE_NAME = "ib-offline-dff1c44ee071";
const LOCAL_ASSETS = [
  "/",
  "/404.html",
  "/articles.json",
  "/articles/calendari-cosmic/",
  "/articles/calendari-cosmic/article.css",
  "/articles/calendari-cosmic/calendari.js",
  "/articles/calendari-cosmic/cover.jpg",
  "/articles/calendari-cosmic/index.html",
  "/articles/calendari-cosmic/thumb.webp",
  "/articles/ciencia-entre-enemics/",
  "/articles/ciencia-entre-enemics/antartida.js",
  "/articles/ciencia-entre-enemics/article.css",
  "/articles/ciencia-entre-enemics/article.js",
  "/articles/ciencia-entre-enemics/cites.js",
  "/articles/ciencia-entre-enemics/cover.html",
  "/articles/ciencia-entre-enemics/cover.jpg",
  "/articles/ciencia-entre-enemics/dades.js",
  "/articles/ciencia-entre-enemics/index.html",
  "/articles/ciencia-entre-enemics/thumb.webp",
  "/articles/cinta-transportadora/",
  "/articles/cinta-transportadora/article.css",
  "/articles/cinta-transportadora/cinta-transportadora.js",
  "/articles/cinta-transportadora/cover.html",
  "/articles/cinta-transportadora/cover.jpg",
  "/articles/cinta-transportadora/dades.js",
  "/articles/cinta-transportadora/index.html",
  "/articles/cinta-transportadora/thumb.webp",
  "/articles/de-que-mor-el-mon/",
  "/articles/de-que-mor-el-mon/cover.jpg",
  "/articles/de-que-mor-el-mon/index.html",
  "/articles/de-que-mor-el-mon/morts.js",
  "/articles/de-que-mor-el-mon/thumb.webp",
  "/articles/el-forat-de-l-ozo/",
  "/articles/el-forat-de-l-ozo/article.css",
  "/articles/el-forat-de-l-ozo/article.js",
  "/articles/el-forat-de-l-ozo/cites.js",
  "/articles/el-forat-de-l-ozo/cover.html",
  "/articles/el-forat-de-l-ozo/cover.jpg",
  "/articles/el-forat-de-l-ozo/dades.js",
  "/articles/el-forat-de-l-ozo/index.html",
  "/articles/el-forat-de-l-ozo/ozo-octubre.js",
  "/articles/el-forat-de-l-ozo/thumb.webp",
  "/articles/el-jesus-historic/",
  "/articles/el-jesus-historic/article.css",
  "/articles/el-jesus-historic/article.js",
  "/articles/el-jesus-historic/cites.js",
  "/articles/el-jesus-historic/cover.html",
  "/articles/el-jesus-historic/cover.jpg",
  "/articles/el-jesus-historic/dades.js",
  "/articles/el-jesus-historic/img/alexamenos-dibuix.jpg",
  "/articles/el-jesus-historic/img/bon-pastor.jpg",
  "/articles/el-jesus-historic/img/commodilla.jpg",
  "/articles/el-jesus-historic/img/dura-europos.jpg",
  "/articles/el-jesus-historic/img/durer-1500.jpg",
  "/articles/el-jesus-historic/img/fumie.jpg",
  "/articles/el-jesus-historic/img/hofmann-1889.jpg",
  "/articles/el-jesus-historic/img/kongo-crucifix.jpg",
  "/articles/el-jesus-historic/img/magdala-pedra.jpg",
  "/articles/el-jesus-historic/img/mughal-abgar.jpg",
  "/articles/el-jesus-historic/img/pilat-pedra.jpg",
  "/articles/el-jesus-historic/img/ploma-mexic.jpg",
  "/articles/el-jesus-historic/img/ravenna-nord.jpg",
  "/articles/el-jesus-historic/img/ravenna-sud.jpg",
  "/articles/el-jesus-historic/img/rembrandt-crist.jpg",
  "/articles/el-jesus-historic/img/sinai-pantocrator.jpg",
  "/articles/el-jesus-historic/img/yehohanan-talo.jpg",
  "/articles/el-jesus-historic/img/zapata-cuy.jpg",
  "/articles/el-jesus-historic/index.html",
  "/articles/el-jesus-historic/nom-i-temps.js",
  "/articles/el-jesus-historic/thumb.webp",
  "/articles/el-mapa-d-haiti/",
  "/articles/el-mapa-d-haiti/article.css",
  "/articles/el-mapa-d-haiti/article.js",
  "/articles/el-mapa-d-haiti/cites.js",
  "/articles/el-mapa-d-haiti/cover.html",
  "/articles/el-mapa-d-haiti/cover.jpg",
  "/articles/el-mapa-d-haiti/dades.js",
  "/articles/el-mapa-d-haiti/index.html",
  "/articles/el-mapa-d-haiti/pap-carrers.js",
  "/articles/el-mapa-d-haiti/relleu-haiti.js",
  "/articles/el-mapa-d-haiti/relleu-pap.js",
  "/articles/el-mapa-d-haiti/thumb.webp",
  "/articles/el-mapa-del-colera/",
  "/articles/el-mapa-del-colera/article.css",
  "/articles/el-mapa-del-colera/article.js",
  "/articles/el-mapa-del-colera/cites.js",
  "/articles/el-mapa-del-colera/cover.html",
  "/articles/el-mapa-del-colera/cover.jpg",
  "/articles/el-mapa-del-colera/dades.js",
  "/articles/el-mapa-del-colera/index.html",
  "/articles/el-mapa-del-colera/relleu-londres.js",
  "/articles/el-mapa-del-colera/tamesi.js",
  "/articles/el-mapa-del-colera/thumb.webp",
  "/articles/el-nino/",
  "/articles/el-nino/cover.jpg",
  "/articles/el-nino/index.html",
  "/articles/el-nino/thumb.webp",
  "/articles/jesus-i-els-quatre-evangelis/",
  "/articles/jesus-i-els-quatre-evangelis/article.css",
  "/articles/jesus-i-els-quatre-evangelis/article.js",
  "/articles/jesus-i-els-quatre-evangelis/cites.js",
  "/articles/jesus-i-els-quatre-evangelis/cover.html",
  "/articles/jesus-i-els-quatre-evangelis/cover.jpg",
  "/articles/jesus-i-els-quatre-evangelis/dades.js",
  "/articles/jesus-i-els-quatre-evangelis/img/joan.jpg",
  "/articles/jesus-i-els-quatre-evangelis/img/lluc.jpg",
  "/articles/jesus-i-els-quatre-evangelis/img/marc.jpg",
  "/articles/jesus-i-els-quatre-evangelis/img/mateu.jpg",
  "/articles/jesus-i-els-quatre-evangelis/index.html",
  "/articles/jesus-i-els-quatre-evangelis/mapes.js",
  "/articles/jesus-i-els-quatre-evangelis/relleu.js",
  "/articles/jesus-i-els-quatre-evangelis/thumb.webp",
  "/articles/l-ultim-sopar/",
  "/articles/l-ultim-sopar/article.css",
  "/articles/l-ultim-sopar/article.js",
  "/articles/l-ultim-sopar/cites.js",
  "/articles/l-ultim-sopar/cover.html",
  "/articles/l-ultim-sopar/cover.jpg",
  "/articles/l-ultim-sopar/dades.js",
  "/articles/l-ultim-sopar/img/bombardeig-1943.jpg",
  "/articles/l-ultim-sopar/img/castagno-1447.jpg",
  "/articles/l-ultim-sopar/img/giampietrino-cenacolo.jpg",
  "/articles/l-ultim-sopar/img/giampietrino-cmp.jpg",
  "/articles/l-ultim-sopar/img/huguet-mnac.jpg",
  "/articles/l-ultim-sopar/img/leonardo-cenacolo.jpg",
  "/articles/l-ultim-sopar/img/leonardo-cmp.jpg",
  "/articles/l-ultim-sopar/img/ravenna-sopar.jpg",
  "/articles/l-ultim-sopar/img/v1/castagno-1200.webp",
  "/articles/l-ultim-sopar/img/v1/castagno-720.webp",
  "/articles/l-ultim-sopar/img/v1/leonardo-1200.webp",
  "/articles/l-ultim-sopar/img/v1/leonardo-720.webp",
  "/articles/l-ultim-sopar/img/v1/pompeia-1200.webp",
  "/articles/l-ultim-sopar/img/v1/pompeia-720.webp",
  "/articles/l-ultim-sopar/img/v1/ravenna-1200.webp",
  "/articles/l-ultim-sopar/img/v1/ravenna-720.webp",
  "/articles/l-ultim-sopar/img/veronese-1573.jpg",
  "/articles/l-ultim-sopar/img/windsor-felip.jpg",
  "/articles/l-ultim-sopar/img/windsor-judes.jpg",
  "/articles/l-ultim-sopar/index.html",
  "/articles/l-ultim-sopar/thumb.webp",
  "/articles/la-llengua-que-van-inventar-uns-nens/",
  "/articles/la-llengua-que-van-inventar-uns-nens/article.css",
  "/articles/la-llengua-que-van-inventar-uns-nens/article.js",
  "/articles/la-llengua-que-van-inventar-uns-nens/cites.js",
  "/articles/la-llengua-que-van-inventar-uns-nens/cover.html",
  "/articles/la-llengua-que-van-inventar-uns-nens/cover.jpg",
  "/articles/la-llengua-que-van-inventar-uns-nens/index.html",
  "/articles/la-llengua-que-van-inventar-uns-nens/llacs.js",
  "/articles/la-llengua-que-van-inventar-uns-nens/relleu-nicaragua.js",
  "/articles/la-llengua-que-van-inventar-uns-nens/thumb.webp",
  "/articles/la-malaltia-que-vam-esborrar/",
  "/articles/la-malaltia-que-vam-esborrar/article.css",
  "/articles/la-malaltia-que-vam-esborrar/article.js",
  "/articles/la-malaltia-que-vam-esborrar/cites.js",
  "/articles/la-malaltia-que-vam-esborrar/cover.html",
  "/articles/la-malaltia-que-vam-esborrar/cover.jpg",
  "/articles/la-malaltia-que-vam-esborrar/dades.js",
  "/articles/la-malaltia-que-vam-esborrar/index.html",
  "/articles/la-malaltia-que-vam-esborrar/relleu-somalia.js",
  "/articles/la-malaltia-que-vam-esborrar/rius-somalia.js",
  "/articles/la-malaltia-que-vam-esborrar/thumb.webp",
  "/articles/les-llavors-de-leningrad/",
  "/articles/les-llavors-de-leningrad/article.css",
  "/articles/les-llavors-de-leningrad/article.js",
  "/articles/les-llavors-de-leningrad/cites.js",
  "/articles/les-llavors-de-leningrad/cover.html",
  "/articles/les-llavors-de-leningrad/cover.jpg",
  "/articles/les-llavors-de-leningrad/dades.js",
  "/articles/les-llavors-de-leningrad/index.html",
  "/articles/les-llavors-de-leningrad/relleu-leningrad.js",
  "/articles/les-llavors-de-leningrad/thumb.webp",
  "/articles/migracio-vertical/",
  "/articles/migracio-vertical/article.css",
  "/articles/migracio-vertical/cover.html",
  "/articles/migracio-vertical/cover.jpg",
  "/articles/migracio-vertical/index.html",
  "/articles/migracio-vertical/migracio.js",
  "/articles/migracio-vertical/thumb.webp",
  "/articles/navegar-sense-mapa/",
  "/articles/navegar-sense-mapa/article.css",
  "/articles/navegar-sense-mapa/article.js",
  "/articles/navegar-sense-mapa/cites.js",
  "/articles/navegar-sense-mapa/cover.html",
  "/articles/navegar-sense-mapa/cover.jpg",
  "/articles/navegar-sense-mapa/dades.js",
  "/articles/navegar-sense-mapa/index.html",
  "/articles/navegar-sense-mapa/thumb.webp",
  "/articles/on-va-el-co2/",
  "/articles/on-va-el-co2/article.css",
  "/articles/on-va-el-co2/cover.html",
  "/articles/on-va-el-co2/cover.jpg",
  "/articles/on-va-el-co2/dades.js",
  "/articles/on-va-el-co2/index.html",
  "/articles/on-va-el-co2/on-va-el-co2.js",
  "/articles/on-va-el-co2/thumb.webp",
  "/articles/per-que-dormim/",
  "/articles/per-que-dormim/article.css",
  "/articles/per-que-dormim/article.js",
  "/articles/per-que-dormim/cites.js",
  "/articles/per-que-dormim/cover.html",
  "/articles/per-que-dormim/cover.jpg",
  "/articles/per-que-dormim/dades.js",
  "/articles/per-que-dormim/index.html",
  "/articles/per-que-dormim/thumb.webp",
  "/articles/per-que-riem/",
  "/articles/per-que-riem/article.css",
  "/articles/per-que-riem/article.js",
  "/articles/per-que-riem/cites.js",
  "/articles/per-que-riem/cover.html",
  "/articles/per-que-riem/cover.jpg",
  "/articles/per-que-riem/dades.js",
  "/articles/per-que-riem/index.html",
  "/articles/per-que-riem/thumb.webp",
  "/articles/pols-del-sahara/",
  "/articles/pols-del-sahara/article.css",
  "/articles/pols-del-sahara/cover.html",
  "/articles/pols-del-sahara/cover.jpg",
  "/articles/pols-del-sahara/index.html",
  "/articles/pols-del-sahara/pols-del-sahara.js",
  "/articles/pols-del-sahara/relleu.js",
  "/articles/pols-del-sahara/thumb.webp",
  "/articles/stonehenge/",
  "/articles/stonehenge/article-b.js",
  "/articles/stonehenge/article.css",
  "/articles/stonehenge/article.js",
  "/articles/stonehenge/cites.js",
  "/articles/stonehenge/cover.html",
  "/articles/stonehenge/cover.jpg",
  "/articles/stonehenge/dades-local.js",
  "/articles/stonehenge/dades-veg.js",
  "/articles/stonehenge/dades.js",
  "/articles/stonehenge/fig-escala.js",
  "/articles/stonehenge/fig-gent.js",
  "/articles/stonehenge/fig-mirall.js",
  "/articles/stonehenge/fig-mon.js",
  "/articles/stonehenge/fig-moure.js",
  "/articles/stonehenge/fig-so.js",
  "/articles/stonehenge/fig-trilit.js",
  "/articles/stonehenge/index.html",
  "/articles/stonehenge/relleu-local.js",
  "/articles/stonehenge/relleu.js",
  "/articles/stonehenge/sh3d.js",
  "/articles/stonehenge/thumb.webp",
  "/articles/viatge-de-la-pizza/",
  "/articles/viatge-de-la-pizza/article.css",
  "/articles/viatge-de-la-pizza/article.js",
  "/articles/viatge-de-la-pizza/cites.js",
  "/articles/viatge-de-la-pizza/cover.html",
  "/articles/viatge-de-la-pizza/cover.jpg",
  "/articles/viatge-de-la-pizza/dades.js",
  "/articles/viatge-de-la-pizza/index.html",
  "/articles/viatge-de-la-pizza/thumb.webp",
  "/articles/virus-i-bacteris/",
  "/articles/virus-i-bacteris/article.css",
  "/articles/virus-i-bacteris/cover.html",
  "/articles/virus-i-bacteris/cover.jpg",
  "/articles/virus-i-bacteris/crispr.js",
  "/articles/virus-i-bacteris/dades.js",
  "/articles/virus-i-bacteris/index.html",
  "/articles/virus-i-bacteris/thumb.webp",
  "/articles/virus-i-bacteris/virus-i-bacteris.js",
  "/articles/xifrat-extrem-a-extrem/",
  "/articles/xifrat-extrem-a-extrem/article.css",
  "/articles/xifrat-extrem-a-extrem/article.js",
  "/articles/xifrat-extrem-a-extrem/cites.js",
  "/articles/xifrat-extrem-a-extrem/cover.html",
  "/articles/xifrat-extrem-a-extrem/cover.jpg",
  "/articles/xifrat-extrem-a-extrem/dades.js",
  "/articles/xifrat-extrem-a-extrem/index.html",
  "/articles/xifrat-extrem-a-extrem/thumb.webp",
  "/assets/apple-touch-icon.png",
  "/assets/article.css",
  "/assets/fonts/helveticaneueltpro-bd.woff",
  "/assets/fonts/helveticaneueltpro-bd.woff2",
  "/assets/fonts/helveticaneueltpro-it.woff",
  "/assets/fonts/helveticaneueltpro-it.woff2",
  "/assets/fonts/helveticaneueltpro-lt.woff",
  "/assets/fonts/helveticaneueltpro-lt.woff2",
  "/assets/fonts/helveticaneueltpro-md.woff",
  "/assets/fonts/helveticaneueltpro-md.woff2",
  "/assets/fonts/helveticaneueltpro-roman.woff",
  "/assets/fonts/helveticaneueltpro-roman.woff2",
  "/assets/fonts/helveticaneueltpro-th.woff",
  "/assets/fonts/helveticaneueltpro-th.woff2",
  "/assets/fonts/hnltpro-text-roman.woff",
  "/assets/fonts/hnltpro-text-roman.woff2",
  "/assets/ib-3d.js",
  "/assets/ib-fx.js",
  "/assets/ib-gent.js",
  "/assets/ib-lang.js",
  "/assets/ib-theme.js",
  "/assets/ib-viz.js",
  "/assets/ib-voyager.js",
  "/assets/ib.css",
  "/assets/ib.js",
  "/assets/icon-512.png",
  "/assets/icon192.png",
  "/assets/logo-dark.png",
  "/assets/logo.png",
  "/assets/scrolly.js",
  "/index.html",
  "/manifest.webmanifest",
  "/per-penjar/",
  "/per-penjar/index.html"
];
const EXTERNAL_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js",
  "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js",
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json",
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const BATCH = 12;
    for (let i = 0; i < LOCAL_ASSETS.length; i += BATCH) {
      const slice = LOCAL_ASSETS.slice(i, i + BATCH);
      await cache.addAll(slice);
    }
    await Promise.allSettled(EXTERNAL_ASSETS.map(async (url) => {
      const res = await fetch(url, { mode: "cors" });
      if (res && res.ok) await cache.put(url, res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("ib-") && k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function matchWithSlashFallback(cache, request) {
  const exact = await cache.match(request, { ignoreSearch: true });
  if (exact) return exact;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith("/")) {
      const idx = await cache.match(url.pathname + "index.html");
      if (idx) return idx;
    } else if (!url.pathname.includes(".")) {
      const slash = await cache.match(url.pathname + "/");
      if (slash) return slash;
      const idx = await cache.match(url.pathname + "/index.html");
      if (idx) return idx;
    }
  }
  return null;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await matchWithSlashFallback(cache, request);
      const networkPromise = fetch(request).then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
        return res;
      }).catch(() => null);

      if (cached) {
        event.waitUntil(networkPromise);
        return cached;
      }
      const net = await networkPromise;
      if (net) return net;
      return (await cache.match("/index.html")) || (await cache.match("/404.html")) || Response.error();
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await matchWithSlashFallback(cache, request);
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res && (res.ok || res.type === "opaque")) {
        cache.put(request, res.clone());
      }
      return res;
    } catch {
      return Response.error();
    }
  })());
});
