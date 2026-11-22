import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadArticles, renderHomeHtml, renderDraftsHtml, renderServiceWorker, footerPages, withFooter, draftArticles } from "./sync-home.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIR = path.join(ROOT, "web");
const ARTICLES_DIR = path.join(WEB_DIR, "articles");
const HOME_PATH = path.join(WEB_DIR, "index.html");
const SW_PATH = path.join(WEB_DIR, "sw.js");
const MANIFEST_PATH = path.join(WEB_DIR, "manifest.webmanifest");

const FORBIDDEN_EMOJIS = ["◀", "▶", "↔"];

function collectJsFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectJsFiles(full, acc);
    else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))) acc.push(full);
  }
  return acc;
}

function isValidWebp(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 12) return false;
  return buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
}

function fail(errors) {
  console.error("\nERRORS DE VALIDACIÓ DEL SISTEMA:");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

const errors = [];

// 1. Sincronia web/articles.json <-> web/index.html
let articles = [];
try {
  articles = loadArticles();
  const expectedHome = renderHomeHtml(articles);
  const actualHome = fs.existsSync(HOME_PATH) ? fs.readFileSync(HOME_PATH, "utf8") : "";
  if (expectedHome !== actualHome) {
    errors.push("web/index.html no coincideix amb web/articles.json. Executa: node scripts/sync-home.mjs");
  }
  const draftsPath = path.join(WEB_DIR, "per-penjar", "index.html");
  const actualDrafts = fs.existsSync(draftsPath) ? fs.readFileSync(draftsPath, "utf8") : "";
  if (renderDraftsHtml(articles) !== actualDrafts) {
    errors.push("web/per-penjar/index.html no coincideix amb web/articles.json. Executa: node scripts/sync-home.mjs");
  }
  for (const [rel, prefix] of footerPages()) {
    const html = fs.readFileSync(path.join(WEB_DIR, rel), "utf8");
    const next = withFooter(html, prefix);
    if (next === null) errors.push(`web/${rel} no té el peu comú <footer class="ib-foot">.`);
    else if (next !== html) errors.push(`web/${rel} té un peu antic. Executa: node scripts/sync-home.mjs`);
  }
  const expectedSw = renderServiceWorker(articles);
  const actualSw = fs.existsSync(SW_PATH) ? fs.readFileSync(SW_PATH, "utf8") : "";
  if (expectedSw !== actualSw) {
    errors.push("web/sw.js no està sincronitzat. Executa: node scripts/sync-home.mjs");
  }
  if (!fs.existsSync(MANIFEST_PATH)) {
    errors.push("Falta web/manifest.webmanifest.");
  } else {
    JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  }
} catch (err) {
  errors.push(err.message);
}

// 2. Bijecció web/articles/ <-> web/articles.json
const diskSlugs = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith("."))
  .map(d => d.name)
  .sort();
const jsonSlugs = articles.map(a => a.slug);
const jsonSet = new Set(jsonSlugs);
const diskSet = new Set(diskSlugs);

for (const slug of diskSlugs) {
  if (!jsonSet.has(slug)) {
    errors.push(`Article orfe a web/articles/${slug}/ que no apareix a web/articles.json (ni a la portada ni a per-penjar).`);
  }
}
for (const slug of jsonSlugs) {
  if (!diskSet.has(slug)) {
    errors.push(`L'entrada "${slug}" de web/articles.json no té carpeta a web/articles/${slug}/.`);
  }
}

// 3. Fitxers obligatoris i higiene HTML per cada article
for (const slug of jsonSlugs) {
  const dir = path.join(ARTICLES_DIR, slug);
  const htmlPath = path.join(dir, "index.html");
  const thumbPath = path.join(dir, "thumb.webp");
  const coverPath = path.join(dir, "cover.jpg");

  if (!fs.existsSync(htmlPath)) {
    errors.push(`Falta web/articles/${slug}/index.html`);
  } else {
    const html = fs.readFileSync(htmlPath, "utf8");
    if (!/<title>[^<]+<\/title>/i.test(html)) {
      errors.push(`web/articles/${slug}/index.html no té <title> vàlid.`);
    }
    if (!html.includes("ib.css")) {
      errors.push(`web/articles/${slug}/index.html no enllaça ib.css.`);
    }
    for (const ch of FORBIDDEN_EMOJIS) {
      if (html.includes(ch)) {
        errors.push(`web/articles/${slug}/index.html conté el caràcter prohibit "${ch}".`);
      }
    }
  }

  if (!fs.existsSync(thumbPath)) {
    errors.push(`Falta web/articles/${slug}/thumb.webp`);
  } else if (!isValidWebp(thumbPath)) {
    errors.push(`web/articles/${slug}/thumb.webp no té una capçalera RIFF/WEBP vàlida.`);
  }

  if (!fs.existsSync(coverPath)) {
    errors.push(`Falta web/articles/${slug}/cover.jpg`);
  } else if (fs.statSync(coverPath).size === 0) {
    errors.push(`web/articles/${slug}/cover.jpg és buit.`);
  }
}

// 4. Comprovació de sintaxi JS a web/assets/, web/articles/, web/sw.js i scripts/
const jsFiles = [
  ...collectJsFiles(path.join(WEB_DIR, "assets")),
  ...collectJsFiles(ARTICLES_DIR),
  ...collectJsFiles(path.join(ROOT, "scripts")),
  ...(fs.existsSync(SW_PATH) ? [SW_PATH] : [])
];

for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (err) {
    const rel = path.relative(ROOT, file);
    errors.push(`Error de sintaxi JS a ${rel}: ${err.stderr ? err.stderr.toString().trim() : err.message}`);
  }
}

// 5. Sistema infogràfic (research/sistema-infografic.md): cada article nou ha de partir d'un pla visual
//    amb peces reals del sistema (TIME, MAP, SCALE, SPREAD, PART, LINK, HOW, CASE), i els mapes regionals han d'anar sobre la base física en relleu MAP-01.
//    Els articles publicats abans del 19-11-2026 en queden exempts (només avisos).
const LEGACY = new Set([
  "calendari-cosmic", "cinta-transportadora", "de-que-mor-el-mon", "el-jesus-historic", "el-nino",
  "jesus-i-els-quatre-evangelis", "migracio-vertical", "on-va-el-co2", "per-que-dormim", "per-que-riem",
  "pols-del-sahara", "stonehenge", "viatge-de-la-pizza", "virus-i-bacteris"
]);
const GUIDE = fs.readFileSync(path.join(ROOT, "research", "sistema-infografic.md"), "utf8");
const CODE_RE = /\b(?:TIME|MAP|SCALE|SPREAD|PART|LINK|HOW|CASE)-\d{2}\b/g;
const IB_VALID = new Set([...GUIDE.matchAll(/\| \*\*((?:TIME|MAP|SCALE|SPREAD|PART|LINK|HOW|CASE)-\d{2})\*\* \|/g)].map(m => m[1]));
// Colors del sistema: IBV.C i rampes d'ib-viz.js + els tons del mapa físic MAP-01
const PALETTE = new Set([
  ...(fs.readFileSync(path.join(WEB_DIR, "assets", "ib-viz.js"), "utf8").match(/#[0-9A-Fa-f]{6}\b/g) || []),
  "#F3F2EF", "#ABA8A1", "#AEC6E6"
].map(h => h.toUpperCase()));
const REGIONAL = /\bgeo(Mercator|TransverseMercator|Conic\w*|Albers\w*|Equirectangular)\s*\(/;
const RELIEF = /relleu59\s*\(|\w+_DEM\b|getReliefCanvas/;
const warnings = [];

for (const slug of jsonSlugs) {
  const dir = path.join(ARTICLES_DIR, slug);
  if (!fs.existsSync(dir)) continue;
  const code = fs.readdirSync(dir).filter(f => /\.(js|css)$/.test(f) && !/^(dades|relleu|cites)/.test(f))
    .map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
  const planPath = path.join(ROOT, "research", slug, "pla-visual.md");
  const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, "utf8") : null;
  const legacy = LEGACY.has(slug);
  const report = (msg) => (legacy ? warnings : errors).push(msg);

  if (!legacy) {
    if (!plan) {
      errors.push(`Falta research/${slug}/pla-visual.md: abans de dibuixar, anota quina peça del sistema fa cada gràfic (vegeu AGENTS.md).`);
    } else {
      const cited = [...new Set(plan.match(CODE_RE) || [])];
      if (!cited.length) errors.push(`research/${slug}/pla-visual.md no cita cap peça del sistema infogràfic (TIME-01, MAP-03…).`);
      const bad = cited.filter(n => !IB_VALID.has(n));
      if (bad.length) errors.push(`research/${slug}/pla-visual.md cita peces que no existeixen a la guia: ${bad.join(", ")}.`);
      if (/\bIB-\d{2}\b/.test(plan)) errors.push(`research/${slug}/pla-visual.md fa servir codis antics IB-xx: passa'ls als nous (taula a research/sistema-codis.json).`);
    }
  }
  if (REGIONAL.test(code) && !RELIEF.test(code) && !(plan && /sense relleu/i.test(plan))) {
    report(`${slug}: té un mapa regional sense la base física en relleu MAP-01 (si és un mapa d'oceà, escriu-ho al pla visual amb «sense relleu: motiu»).`);
  }
  const off = [...new Set((code.match(/#[0-9A-Fa-f]{6}\b/g) || []).map(h => h.toUpperCase()).filter(h => !PALETTE.has(h)))];
  if (off.length) warnings.push(`${slug}: colors fora del sistema (${off.join(" ")}).`);
}

// ---------- Mode fosc: assets/ib-theme.js el primer al <head> de cada pàgina ----------
const THEME_PAGES = [
  "index.html", "404.html", "sistema/index.html", "guidelines/index.html", "per-penjar/index.html",
  ...fs.readdirSync(ARTICLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => `articles/${d.name}/index.html`)
];
for (const rel of THEME_PAGES) {
  const file = path.join(WEB_DIR, rel);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [, ""])[1];
  const first = (head.match(/<script\b[^>]*>|<link\b[^>]*rel=["']?stylesheet[^>]*>|<style\b/i) || [""])[0];
  if (!/<script\b[^>]*src=["'][^"']*assets\/ib-theme\.js["'][^>]*>/i.test(first) || /\b(defer|async)\b/i.test(first)) {
    errors.push(`web/${rel}: falta el mode fosc. La primera etiqueta <script> o d'estil del <head> ha de ser <script src="…/assets/ib-theme.js"></script>, sense defer (vegeu AGENTS.md, «Mode fosc»).`);
  }
  if (rel.startsWith("articles/")) {
    const dir = path.dirname(file);
    const code = html + fs.readdirSync(dir).filter(f => /\.(js|css)$/.test(f)).map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
    if (/prefers-color-scheme|data-theme|ib-theme/.test(code.replace(/<script[^>]*ib-theme\.js[^>]*><\/script>/g, ""))) {
      errors.push(`web/${rel}: l'article fa el seu propi mode fosc (prefers-color-scheme, data-theme o ib-theme). No cal: assets/ib-theme.js ja tradueix tots els colors; escriu l'article només en clar.`);
    }
  }
}

// 9. Sincronia amb el CMS de l'editor (/admin/): l'editor fa commits directament a main.
//    Si la còpia local va per darrere d'origin/main, hi ha text de l'editor que no tens: no es pot publicar.
try {
  execFileSync("git", ["fetch", "-q", "origin", "main"], { cwd: ROOT, stdio: "ignore", timeout: 15000 });
  const behind = +execFileSync("git", ["rev-list", "--count", "HEAD..origin/main"], { cwd: ROOT, encoding: "utf8" }).trim();
  if (behind > 0) {
    const log = execFileSync("git", ["log", "--format=%h %an: %s", "HEAD..origin/main"], { cwd: ROOT, encoding: "utf8" }).trim().split("\n").slice(0, 8);
    errors.push(`La còpia local va ${behind} commits per darrere d'origin/main (canvis del CMS de l'editor o d'una altra sessió). Fes git pull --rebase origin main abans de publicar; en un conflicte de text, mana la versió del CMS.\n     ${log.join("\n     ")}`);
  }
} catch { warnings.push("No s'ha pogut comprovar si hi ha canvis nous a origin/main (sense xarxa?). Fes git pull --rebase origin main abans de fer push."); }

// 10. Comentaris del CMS (cms/comentaris/, un fitxer per comentari): tots han de ser JSON vàlid
{
  const cd = path.join(ROOT, "cms", "comentaris");
  if (fs.existsSync(cd)) {
    for (const f of fs.readdirSync(cd)) {
      if (!f.endsWith(".json")) continue;
      if (!/^[a-z0-9-]+--c-[a-z0-9]+\.json$/.test(f)) { errors.push(`cms/comentaris/${f}: nom no vàlid (ha de ser <slug>--<id>.json).`); continue; }
      try { const c = JSON.parse(fs.readFileSync(path.join(cd, f), "utf8")); if (!c || typeof c.nota !== "string" || typeof c.cita !== "string") throw 0; }
      catch { errors.push(`cms/comentaris/${f} no és un comentari vàlid.`); }
    }
  }
}

// 12. Scripts externs amb integritat (SRI): la mateixa web serveix l'editor; un CDN compromès no hi pot executar res
for (const rel of THEME_PAGES.concat(fs.readdirSync(ARTICLES_DIR).map(d => `articles/${d}/cover.html`)).filter(r => fs.existsSync(path.join(WEB_DIR, r)))) {
  const html = fs.readFileSync(path.join(WEB_DIR, rel), "utf8");
  for (const tag of html.match(/<script\b[^>]*\bsrc="https?:\/\/[^"]+"[^>]*>/g) || []) {
    if (!/\bintegrity="sha(256|384|512)-/.test(tag) || !/\bcrossorigin="anonymous"/.test(tag))
      errors.push(`web/${rel}: script extern sense integrity/crossorigin (${(tag.match(/src="([^"]+)"/) || [])[1]}). Copia l'etiqueta d'un article que ja el tingui.`);
  }
}

// 11. Articles generats amb un script (research/<slug>/build.py, build-cites.py o scripts/page.py): si el
//     script es torna a executar, reescriu index.html des de research/ i esborraria el que l'editor hagi canviat
//     al CMS. Aquí es comprova que cap línia que l'editor hi va posar (i que encara és a origin/main) hagi desaparegut.
try {
  const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const base = (() => { try { git("rev-parse", "--verify", "-q", "origin/main"); return "origin/main"; } catch { return "HEAD"; } })();
  const RESEARCH = path.join(ROOT, "research");
  for (const slug of fs.existsSync(RESEARCH) ? fs.readdirSync(RESEARCH) : []) {
    const gen = ["build.py", "build-cites.py", "scripts/page.py"].find(f => fs.existsSync(path.join(RESEARCH, slug, f)));
    const rel = `web/articles/${slug}/index.html`;
    if (!gen || !fs.existsSync(path.join(ROOT, rel))) continue;
    const since = +(git("log", "-1", "--format=%ct", base, "--", `research/${slug}`).trim() || 0);
    const cms = git("log", base, "--author=Editor (CMS)", "--format=%H %ct", "--", rel).trim().split("\n").filter(Boolean)
      .map(l => l.split(" ")).filter(([, t]) => +t > since).map(([h]) => h);
    if (!cms.length) continue;
    const onMain = new Set(git("show", `${base}:${rel}`).split("\n").map(l => l.trim()));
    const local = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const keep = new Set();
    for (const h of cms) {
      for (const l of git("show", h, "--format=", "-U0", "--", rel).split("\n")) {
        if (l.startsWith("+") && !l.startsWith("+++")) { const t = l.slice(1).trim(); if (t.length > 20 && onMain.has(t)) keep.add(t); }
      }
    }
    const lost = [...keep].filter(t => !local.includes(t));
    if (lost.length) {
      errors.push(`${rel}: ${lost.length} ${lost.length === 1 ? "línia escrita per l'editor al CMS ha desaparegut" : "línies escrites per l'editor al CMS han desaparegut"} (segurament s'ha tornat a executar research/${slug}/${gen}). ` +
        `Porta primer els canvis del CMS a research/${slug}/ (git log --author="Editor (CMS)" -p -- ${rel}) i torna a generar. Primera línia perduda:\n     ${lost[0].slice(0, 160)}`);
    } else {
      warnings.push(`${rel}: l'editor l'ha canviat al CMS després de l'última edició de research/${slug}/. Abans de tornar a executar ${gen}, porta-hi aquests canvis.`);
    }
  }
} catch (e) { warnings.push("No s'ha pogut comprovar si s'han perdut canvis del CMS als articles generats: " + e.message.split("\n")[0]); }

if (warnings.length) {
  console.warn("\nAVISOS DEL SISTEMA INFOGRÀFIC (no bloquegen; articles anteriors al 19-11-2026 o colors):");
  for (const w of warnings) console.warn(" - " + w);
  console.warn("");
}

if (errors.length) fail(errors);

console.log(`OK · Sistema verificat:`);
console.log(`  - Portada sincronitzada: web/index.html <-> web/articles.json (${articles.length - draftArticles(articles).length} a la portada, ${draftArticles(articles).length} per penjar, 0 orfes)`);
console.log(`  - Actius per article verificats: ${articles.length}/${articles.length} amb index.html, thumb.webp vàlid i cover.jpg`);
console.log(`  - Sintaxi JS correcta: ${jsFiles.length} fitxers comprovats`);
console.log(`  - Mode fosc: ib-theme.js el primer al <head> de ${THEME_PAGES.length} pàgines`);
