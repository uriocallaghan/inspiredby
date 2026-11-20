import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIR = path.join(ROOT, "web");
const CATALOG_PATH = path.join(WEB_DIR, "articles.json");
const HOME_PATH = path.join(WEB_DIR, "index.html");
const SW_PATH = path.join(WEB_DIR, "sw.js");

const EXTERNAL_PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js",
  "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js",
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json",
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json"
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateArticles(articles) {
  if (!Array.isArray(articles) || articles.length < 2) {
    throw new Error("web/articles.json ha de contenir com a mínim 2 articles.");
  }
  const required = ["slug", "title", "desc", "category", "minutes", "thumbAlt"];
  const seen = new Set();
  articles.forEach((a, idx) => {
    if (!a || typeof a !== "object") {
      throw new Error(`Entrada #${idx} invàlida a web/articles.json.`);
    }
    for (const key of required) {
      if (a[key] === undefined || a[key] === null || a[key] === "") {
        throw new Error(`Falta el camp obligatori "${key}" a l'article #${idx} (${a.slug || "?"}).`);
      }
    }
    if (seen.has(a.slug)) {
      throw new Error(`Slug duplicat a web/articles.json: "${a.slug}".`);
    }
    seen.add(a.slug);
    if (typeof a.minutes !== "number" || !Number.isFinite(a.minutes) || a.minutes <= 0) {
      throw new Error(`El camp "minutes" ha de ser un número positiu a "${a.slug}".`);
    }
  });
}

function renderDiptychCard(a) {
  return [
    `    <a class="ib-diptych-card" href="articles/${escapeHtml(a.slug)}/">`,
    `      <div class="ib-card-media">`,
    `        <img src="articles/${escapeHtml(a.slug)}/thumb.webp" alt="${escapeHtml(a.thumbAlt)}" width="800" height="1000" fetchpriority="high" decoding="async">`,
    `      </div>`,
    `      <div class="ib-diptych-body">`,
    `        <div class="ib-diptych-copy">`,
    `          <h2>${escapeHtml(a.title)}</h2>`,
    `          <p class="ib-card-desc">${escapeHtml(a.desc)}</p>`,
    `        </div>`,
    `        <span class="ib-card-meta"><span>${escapeHtml(a.category)} · ${a.minutes} min</span><span class="ib-card-arrow" aria-hidden="true">→</span></span>`,
    `      </div>`,
    `    </a>`
  ].join("\n");
}

function renderGridCard(a, idx) {
  const lazyAttr = idx >= 4 ? ' loading="lazy"' : "";
  return [
    `      <a class="ib-card" href="articles/${escapeHtml(a.slug)}/">`,
    `        <div class="ib-card-media">`,
    `          <img src="articles/${escapeHtml(a.slug)}/thumb.webp" alt="${escapeHtml(a.thumbAlt)}" width="800" height="1000"${lazyAttr} decoding="async">`,
    `        </div>`,
    `        <h2>${escapeHtml(a.title)}</h2>`,
    `        <p class="ib-card-desc">${escapeHtml(a.desc)}</p>`,
    `        <span class="ib-card-meta"><span>${escapeHtml(a.category)} · ${a.minutes} min</span><span class="ib-card-arrow" aria-hidden="true">→</span></span>`,
    `      </a>`
  ].join("\n");
}

/**
 * Genera el codi HTML complet de web/index.html a partir de web/articles.json.
 */
export function renderHomeHtml(articles) {
  validateArticles(articles);
  const diptych = articles.slice(0, 2);
  const grid = articles.slice(2);
  const ogSlug = escapeHtml(articles[0].slug);

  const diptychHtml = diptych.map(renderDiptychCard).join("\n\n");
  const gridHtml = grid.map((a, i) => renderGridCard(a, i)).join("\n\n");

  return `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Inspired by Magazine</title>
<meta name="description" content="Articles visuals per entendre el món.">
<meta property="og:title" content="Inspired by Magazine">
<meta property="og:description" content="Articles visuals per entendre el món.">
<meta property="og:image" content="articles/${ogSlug}/cover.jpg">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#FCFCFA">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Inspired by">
<link rel="icon" sizes="192x192" href="assets/icon192.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/helveticaneueltpro-md.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/helveticaneueltpro-roman.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/ib.css">
</head>
<body class="ib-home">

<header class="ib-bar ib-bar--sticky">
  <a href="./" aria-label="Inspired by Magazine"><img src="assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</header>

<main class="ib-page">
  <h1 class="ib-sr-only">Inspired by Magazine</h1>

  <section class="ib-diptych" aria-label="Articles destacats">
${diptychHtml}
  </section>

  <section class="ib-collection" aria-label="Articles">
    <div class="ib-grid">
${gridHtml}
    </div>
  </section>
</main>

<footer class="ib-foot">
  <a href="./"><img src="assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</footer>
<script src="assets/ib.js" defer></script>
</body>
</html>
`;
}

function collectFiles(dir, baseDir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, baseDir, acc);
    else if (entry.isFile()) acc.push("/" + path.relative(baseDir, full).split(path.sep).join("/"));
  }
  return acc;
}

/**
 * Genera web/sw.js amb tots els actius locals i dependències externes
 * per garantir lectura 100% offline de la portada i tots els articles.
 */
export function renderServiceWorker(articles) {
  const localUrls = new Set([
    "/",
    "/index.html",
    "/404.html",
    "/manifest.webmanifest",
    "/articles.json"
  ]);

  for (const url of collectFiles(path.join(WEB_DIR, "assets"), WEB_DIR)) {
    localUrls.add(url);
  }
  for (const a of articles) {
    localUrls.add(`/articles/${a.slug}/`);
    for (const url of collectFiles(path.join(WEB_DIR, "articles", a.slug), WEB_DIR)) {
      localUrls.add(url);
    }
  }

  const sortedLocal = [...localUrls].sort();
  const hash = crypto.createHash("sha256");
  for (const url of sortedLocal) {
    hash.update(url);
    const filePath = url.endsWith("/") ? path.join(WEB_DIR, url, "index.html") : path.join(WEB_DIR, url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      hash.update(fs.readFileSync(filePath));
    }
  }
  for (const ext of EXTERNAL_PRECACHE) hash.update(ext);
  const version = hash.digest("hex").slice(0, 12);

  return `/* Inspired by Magazine — Service Worker (generat per scripts/sync-home.mjs) */
const CACHE_NAME = "ib-offline-${version}";
const LOCAL_ASSETS = ${JSON.stringify(sortedLocal, null, 2)};
const EXTERNAL_ASSETS = ${JSON.stringify(EXTERNAL_PRECACHE, null, 2)};

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
`;
}

export function loadArticles(catalogPath = CATALOG_PATH) {
  return JSON.parse(fs.readFileSync(catalogPath, "utf8"));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const checkMode = process.argv.includes("--check");
  const articles = loadArticles();
  const nextHtml = renderHomeHtml(articles);
  const currentHtml = fs.existsSync(HOME_PATH) ? fs.readFileSync(HOME_PATH, "utf8") : "";
  const nextSw = renderServiceWorker(articles);
  const currentSw = fs.existsSync(SW_PATH) ? fs.readFileSync(SW_PATH, "utf8") : "";

  if (checkMode) {
    if (nextHtml !== currentHtml || nextSw !== currentSw) {
      console.error("ERROR: web/index.html o web/sw.js no estan sincronitzats. Executa: node scripts/sync-home.mjs");
      process.exit(1);
    }
    console.log(`OK: web/index.html i web/sw.js sincronitzats (${articles.length} articles).`);
  } else {
    fs.writeFileSync(HOME_PATH, nextHtml, "utf8");
    // Recalculate SW hash after writing updated index.html so hash matches disk
    const finalSw = renderServiceWorker(articles);
    fs.writeFileSync(SW_PATH, finalSw, "utf8");
    console.log(`Generat web/index.html (${articles.length} articles) i web/sw.js (cache offline complet).`);
  }
}
