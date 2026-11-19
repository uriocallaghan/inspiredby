import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = path.join(ROOT, "web", "articles.json");
const HOME_PATH = path.join(ROOT, "web", "index.html");

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
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Inspired by Magazine</title>
<meta name="description" content="Articles visuals per entendre el món.">
<meta property="og:title" content="Inspired by Magazine">
<meta property="og:description" content="Articles visuals per entendre el món.">
<meta property="og:image" content="articles/${ogSlug}/cover.jpg">
<link rel="icon" sizes="192x192" href="assets/icon192.png">
<link rel="apple-touch-icon" href="assets/icon192.png">
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
</body>
</html>
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

  if (checkMode) {
    if (nextHtml !== currentHtml) {
      console.error("ERROR: web/index.html no està sincronitzat amb web/articles.json. Executa: node scripts/sync-home.mjs");
      process.exit(1);
    }
    console.log(`OK: web/index.html sincronitzat (${articles.length} articles).`);
  } else {
    fs.writeFileSync(HOME_PATH, nextHtml, "utf8");
    console.log(`Generat web/index.html amb ${articles.length} articles (2 al díptic + ${articles.length - 2} a la graella).`);
  }
}
