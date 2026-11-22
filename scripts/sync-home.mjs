import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIR = path.join(ROOT, "web");
const CATALOG_PATH = path.join(WEB_DIR, "articles.json");
const HOME_PATH = path.join(WEB_DIR, "index.html");
const SW_PATH = path.join(WEB_DIR, "sw.js");
const DRAFTS_PATH = path.join(WEB_DIR, "per-penjar", "index.html");

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
 * Peu de pàgina comú de tota la web. `prefix` és el camí fins a l'arrel ("", "../" o "../../").
 * `node scripts/sync-home.mjs` l'aplica a totes les pàgines de web/ (portada, articles, sistema, guies).
 */
export function renderFooterHtml(prefix = "") {
  const home = prefix || "./";
  const sis = `${prefix}sistema/`, gui = `${prefix}guidelines/`;
  const col = (href, title, links) => `  <nav class="ib-foot-col" aria-label="${title}">
    <a class="ib-foot-h" href="${href}">${title}</a>
    <ul>
${links.map(([h, t]) => `      <li><a href="${h}">${t}</a></li>`).join("\n")}
    </ul>
  </nav>`;
  return `<footer class="ib-foot">
  <div class="ib-foot-id">
    <a href="${home}">Inspired by Magazine</a>
    <p>Articles visuals per entendre el món.</p>
    <p>© 2026</p>
  </div>
${col(home, "Revista", [[home, "Portada"], [`${prefix}per-penjar/`, "Articles per penjar"]])}
${col(sis, "Sistema infogràfic", [[`${sis}#principis`, "Principis"], [`${sis}#colors`, "Colors"], [`${sis}#tipografia`, "Tipografia"], [`${sis}#components`, "Components"], [`${sis}#peces`, "Les 76 peces"]])}
${col(gui, "Normes", [[`${gui}#anatomia`, "Com és un article"], [`${gui}#to`, "El to"], [`${gui}#cites`, "Les cites"], [`${gui}#mobil`, "El mòbil"], [`${gui}#preses`, "Decisions preses"], [`${gui}#decidir`, "Per decidir"]])}
</footer>`;
}

export const publishedArticles = articles => articles.filter(a => !a.draft);
export const draftArticles = articles => articles.filter(a => a.draft);

/**
 * Genera el codi HTML complet de web/index.html a partir de web/articles.json.
 * Els articles amb "draft": true no hi surten: van a web/per-penjar/.
 */
export function renderHomeHtml(allArticles) {
  validateArticles(allArticles);
  const articles = publishedArticles(allArticles);
  if (articles.length < 2) throw new Error("La portada necessita com a mínim 2 articles publicats (sense \"draft\").");
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

${renderFooterHtml("")}
<script src="assets/ib.js" defer></script>
</body>
</html>
`;
}

/**
 * Genera web/per-penjar/index.html: els articles amb "draft": true, que encara s'estan fent.
 * No surten a la portada i la pàgina no s'indexa.
 */
export function renderDraftsHtml(allArticles) {
  const drafts = draftArticles(allArticles);
  const cards = drafts.map((a, i) => renderGridCard(a, i)
    .replace(/href="articles\//g, 'href="../articles/')
    .replace(/src="articles\//g, 'src="../articles/')).join("\n\n");
  const body = drafts.length
    ? `    <div class="ib-grid">\n${cards}\n    </div>`
    : `    <p class="ib-drafts-empty">Ara mateix no hi ha cap article a mig fer.</p>`;
  return `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Articles per penjar · Inspired by Magazine</title>
<meta name="description" content="Articles que encara s'estan fent.">
<meta name="robots" content="noindex">
<link rel="manifest" href="../manifest.webmanifest">
<meta name="theme-color" content="#FCFCFA">
<link rel="icon" sizes="192x192" href="../assets/icon192.png">
<link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
<link rel="preload" href="../assets/fonts/helveticaneueltpro-md.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fonts/helveticaneueltpro-roman.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../assets/ib.css">
</head>
<body class="ib-home ib-drafts">

<header class="ib-bar ib-bar--sticky">
  <a href="../" aria-label="Inspired by Magazine"><img src="../assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</header>

<main class="ib-page">
  <header class="ib-drafts-head">
    <h1>Articles per penjar</h1>
    <p>Articles que encara s'estan fent. Les dades, els gràfics i el text poden canviar abans de publicar-se.</p>
  </header>

  <section class="ib-collection" aria-label="Articles per penjar">
${body}
  </section>
</main>

${renderFooterHtml("../")}
<script src="../assets/ib.js" defer></script>
</body>
</html>
`;
}

/** Pàgines de web/ que porten el peu comú, amb el prefix fins a l'arrel. La portada i per-penjar el generen sols. */
export function footerPages() {
  const pages = [["sistema/index.html", "../"], ["guidelines/index.html", "../"]];
  const dir = path.join(WEB_DIR, "articles");
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory() && !d.name.startsWith(".")) pages.push([`articles/${d.name}/index.html`, "../../"]);
  }
  return pages.filter(([rel]) => fs.existsSync(path.join(WEB_DIR, rel)));
}

const FOOTER_RE = /<footer class="ib-foot">[\s\S]*?<\/footer>/;

/** Torna l'HTML amb el peu comú; null si la pàgina no té cap <footer class="ib-foot">. */
export function withFooter(html, prefix) {
  if (!FOOTER_RE.test(html)) return null;
  return html.replace(FOOTER_RE, () => renderFooterHtml(prefix));
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
    "/articles.json",
    "/per-penjar/",
    "/per-penjar/index.html"
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
  // l'editor (/admin/), la seva API i les pàgines que s'hi editen van sempre a la xarxa, mai a la memòria cau
  if (url.origin === self.location.origin && (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/") || url.searchParams.has("ib-cms"))) return;
  if (url.hostname === "accounts.google.com") return;

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

/* Temps de lectura (decisió de l'editor, 21-11-2026): mateix criteri que Medium, que a la
   seva pàgina d'ajuda (help.medium.com, «Read time») diu que es calcula amb unes 265 paraules
   per minut, la mitjana d'un adult. Sense ajust per gràfics (Medium no publica el valor del
   seu ajust per imatges). Es compten les paraules del cos de l'article: no hi entren els
   peus de gràfic ni «Dades i fonts» (ni, als articles antics, «Metodologia» i «Fonts»). */
export const WORDS_PER_MINUTE = 265;

export function readingMinutes(html) {
  let s = html.slice(Math.max(0, html.search(/<body/i)));
  const ends = [/id="fonts"/, /id="sources"/, /<b>Metodologia\.<\/b>/, /<b>Fonts\.<\/b>/]
    .map(re => s.search(re)).filter(i => i >= 0);
  if (ends.length) s = s.slice(0, Math.min(...ends));
  s = s
    .replace(/<(script|style|svg|noscript|figcaption)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<p class="src"[\s\S]*?<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ");
  const words = (s.match(/[\p{L}\p{N}·'’]+/gu) || []).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const META_RE = /(<p class="meta">(?:<span id="rt">)?)\d+( min de lectura)/;

/** Posa a cada article el temps calculat. Torna els fitxers d'article amb la capçalera corregida. */
export function applyReadingTime(articles) {
  const changes = [];
  for (const a of articles) {
    const file = path.join(WEB_DIR, "articles", a.slug, "index.html");
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    a.minutes = readingMinutes(html);
    const next = html.replace(META_RE, (_, pre, post) => `${pre}${a.minutes}${post}`);
    if (next !== html) changes.push([file, next]);
  }
  return changes;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const checkMode = process.argv.includes("--check");
  const articles = loadArticles();
  const catalogBefore = fs.readFileSync(CATALOG_PATH, "utf8");
  const metaChanges = applyReadingTime(articles);
  const nextCatalog = JSON.stringify(articles, null, 2) + "\n";
  const nextHtml = renderHomeHtml(articles);
  const nextDrafts = renderDraftsHtml(articles);
  const read = f => fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  const footerChanges = [];
  for (const [rel, prefix] of footerPages()) {
    const file = path.join(WEB_DIR, rel);
    const html = read(file);
    const next = withFooter(html, prefix);
    if (next === null) console.warn(`AVÍS: web/${rel} no té <footer class="ib-foot">.`);
    else if (next !== html) footerChanges.push([file, next]);
  }

  if (checkMode) {
    const stale = [];
    if (nextCatalog !== catalogBefore) stale.push("web/articles.json (minutes)");
    for (const [file] of metaChanges) stale.push(path.relative(ROOT, file));
    if (nextHtml !== read(HOME_PATH)) stale.push("web/index.html");
    if (nextDrafts !== read(DRAFTS_PATH)) stale.push("web/per-penjar/index.html");
    if (renderServiceWorker(articles) !== read(SW_PATH)) stale.push("web/sw.js");
    for (const [file] of footerChanges) stale.push(path.relative(ROOT, file));
    if (stale.length) {
      console.error(`ERROR: no estan sincronitzats (${stale.join(", ")}). Executa: node scripts/sync-home.mjs`);
      process.exit(1);
    }
    console.log(`OK: portada, per-penjar, peus i sw.js sincronitzats (${articles.length} articles).`);
  } else {
    if (nextCatalog !== catalogBefore) fs.writeFileSync(CATALOG_PATH, nextCatalog, "utf8");
    for (const [file, html] of metaChanges) fs.writeFileSync(file, html, "utf8");
    fs.writeFileSync(HOME_PATH, nextHtml, "utf8");
    fs.mkdirSync(path.dirname(DRAFTS_PATH), { recursive: true });
    fs.writeFileSync(DRAFTS_PATH, nextDrafts, "utf8");
    for (const [file, html] of footerChanges) fs.writeFileSync(file, html, "utf8");
    // El hash del SW es calcula després d'escriure-ho tot perquè coincideixi amb el disc
    fs.writeFileSync(SW_PATH, renderServiceWorker(articles), "utf8");
    const drafts = draftArticles(articles).length;
    console.log(`Generat web/index.html (${articles.length - drafts} articles), web/per-penjar/ (${drafts}), ${footerChanges.length} peus actualitzats i web/sw.js.`);
  }
}
