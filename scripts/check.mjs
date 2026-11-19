import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadArticles, renderHomeHtml } from "./sync-home.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIR = path.join(ROOT, "web");
const ARTICLES_DIR = path.join(WEB_DIR, "articles");
const HOME_PATH = path.join(WEB_DIR, "index.html");

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
    errors.push(`Article orfe a web/articles/${slug}/ que no apareix a web/articles.json (ni a la portada).`);
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

// 4. Comprovació de sintaxi JS a web/assets/, web/articles/ i scripts/
const jsFiles = [
  ...collectJsFiles(path.join(WEB_DIR, "assets")),
  ...collectJsFiles(ARTICLES_DIR),
  ...collectJsFiles(path.join(ROOT, "scripts"))
];

for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (err) {
    const rel = path.relative(ROOT, file);
    errors.push(`Error de sintaxi JS a ${rel}: ${err.stderr ? err.stderr.toString().trim() : err.message}`);
  }
}

if (errors.length) fail(errors);

console.log(`OK · Sistema verificat:`);
console.log(`  - Portada sincronitzada: web/index.html <-> web/articles.json (${articles.length} articles, 0 orfes)`);
console.log(`  - Actius per article verificats: ${articles.length}/${articles.length} amb index.html, thumb.webp vàlid i cover.jpg`);
console.log(`  - Sintaxi JS correcta: ${jsFiles.length} fitxers comprovats`);
