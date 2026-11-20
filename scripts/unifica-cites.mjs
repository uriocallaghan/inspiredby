#!/usr/bin/env node
/* Unifica el sistema de cites d'un article: abans el número del text portava a «Notes»
   i la nota portava, amb un altre número, a «Fonts». Ara cada número del text porta
   directament a la font; la font diu què s'hi recolza i té fletxes per tornar al text.
   També treu el detall de fonts dels peus de gràfic i de l'entradeta: queda un enllaç
   a «Dades i fonts», on hi ha l'explicació completa de cada gràfic.

   Ús: node scripts/unifica-cites.mjs <slug> [--dry]
   Només serveix per a articles amb el format antic (ol.nts + ol.fts). */
import fs from "fs";
import path from "path";

const slug = process.argv[2];
const dry = process.argv.includes("--dry");
const dir = path.join("web/articles", slug);
const file = path.join(dir, "index.html");
let h = fs.readFileSync(file, "utf8");
if (!/<ol class="nts">/.test(h)) { console.error(`${slug}: no té el format antic de notes`); process.exit(1); }

const strip = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/* ---------- 1. Notes i fonts antigues ---------- */
const notes = new Map();
for (const [, n, body] of h.matchAll(/<li id="nota-([^"]+)">([\s\S]*?)<\/li>/g)) {
  const fonts = [...body.matchAll(/href="#font-([^"]+)"/g)].map(m => m[1]);
  let claim = body
    .replace(/<a class="bk"[^>]*>[\s\S]*?<\/a>\s*/g, "")
    .replace(/\s*<a class="fr"[^>]*>[\s\S]*?<\/a>/g, "")
    .replace(/\s+([.,;:])/g, "$1").replace(/\s+/g, " ").trim()
    .replace(/[.;]$/, "");
  notes.set(n, { claim, fonts });
}
const fontsOld = new Map();
for (const [, k, body] of h.matchAll(/<li id="font-([^"]+)">([\s\S]*?)<\/li>/g)) fontsOld.set(k, body.trim());

// Fonts que faltaven (notes sense cap font enllaçada)
const CFG = JSON.parse(fs.readFileSync(process.argv.find(a => a.endsWith(".json")), "utf8"))[slug];
const EXTRA = CFG.extra || {};
for (const [n, f] of Object.entries(EXTRA)) {
  const key = "x" + n; fontsOld.set(key, f); notes.get(n).fonts.push(key);
}
for (const [n, v] of notes) if (!v.fonts.length) { console.error(`${slug}: la nota ${n} no té cap font`); process.exit(1); }

/* ---------- 2. Cites del text: grups de <sup class="nr"> consecutius ---------- */
const newNum = new Map();       // clau antiga de font -> número nou (ordre d'aparició)
const claimsOf = new Map();     // clau antiga -> [{text, id}]
const citesOf = new Map();      // clau antiga -> [id de cita]
let citeCount = 0;
const claimId = (k, text) => {
  if (!claimsOf.has(k)) claimsOf.set(k, []);
  const L = claimsOf.get(k); let c = L.find(x => x.text === text);
  if (!c) { c = { text, id: null }; L.push(c); }
  return c;
};
const SUPS = /(?:<sup class="nr"><a href="#nota-[^"]+"[^>]*>[^<]*<\/a><\/sup>)+/g;
h = h.replace(SUPS, grp => {
  const ns = [...grp.matchAll(/href="#nota-([^"]+)"/g)].map(m => m[1]);
  const seen = new Set(), links = [];
  for (const n of ns) for (const k of notes.get(n).fonts) {
    if (seen.has(k)) continue; seen.add(k);
    if (!newNum.has(k)) newNum.set(k, newNum.size + 1);
    const num = newNum.get(k);
    const c = claimId(k, notes.get(n).claim);
    const id = `c${++citeCount}`;
    if (!citesOf.has(k)) citesOf.set(k, []); citesOf.get(k).push(id);
    links.push({ num, k, id, c });
  }
  links.sort((a, b) => a.num - b.num);
  return `<sup class="nr">` + links.map(l => `<a href="#font-${l.num}" id="${l.id}" data-c="@@${l.k}|${l.c.text.length}|${hash(l.c.text)}@@">${l.num}</a>`).join(",") + `</sup>`;
});
function hash(s) { let x = 0; for (const ch of s) x = (x * 31 + ch.codePointAt(0)) >>> 0; return x.toString(36); }
// fonts mai citades al text (no n'hi hauria d'haver)
for (const k of fontsOld.keys()) if (!newNum.has(k)) { console.error(`${slug}: avís, la font ${k} no es cita enlloc; s'afegeix al final`); newNum.set(k, newNum.size + 1); }
// ids estables per a cada afirmació
for (const [k, L] of claimsOf) L.forEach((c, i) => c.id = `u${newNum.get(k)}-${i + 1}`);
h = h.replace(/data-c="@@([^|]+)\|(\d+)\|([^@]+)@@"/g, (m, k, len, hs) => {
  const c = claimsOf.get(k).find(x => x.text.length === +len && hash(x.text) === hs);
  return `data-c="${c.id}"`;
});

/* ---------- 3. Peus de gràfic: el detall va a «Dades i fonts» ---------- */
const LABELS = CFG.peus;
const graphs = [];
let gi = 0;
h = h.replace(/<(figcaption|p) class="src"([^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, inner, off) => {
  gi++;
  const before = h.slice(Math.max(0, off - 6000), off);
  const titles = [...before.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/g)];
  const title = titles.length ? strip(titles[titles.length - 1][1]) : `Gràfic ${gi}`;
  const lab = LABELS[gi - 1];
  if (lab == null) { console.error(`${slug}: falta l'etiqueta del peu ${gi}: ${strip(inner).slice(0, 120)}`); process.exit(1); }
  graphs.push({ id: `g-${gi}`, title, inner: inner.trim() });
  return `<${tag} class="src" id="gc-${gi}"${attrs}>${lab} <a class="gs" href="#g-${gi}">Fonts i dades del gràfic&nbsp;→</a></${tag}>`;
});

/* ---------- 4. Entradeta: només un enllaç ---------- */
h = h.replace(/(<p class="meta">[^·<]*·\s*)Dades[^·]*?·/, `$1<a class="dl-f" href="#fonts">Dades i fonts&nbsp;↓</a> ·`);

/* ---------- 5. Secció final unificada ---------- */
const order = [...newNum.entries()].sort((a, b) => a[1] - b[1]);
const lis = order.map(([k, num]) => {
  const cites = citesOf.get(k) || [];
  const bk = cites.length ? `<a class="bk" href="#${cites[0]}" aria-label="Torna al text">↑</a> ` : "";
  const cl = (claimsOf.get(k) || []).map(c => `<span id="${c.id}">${c.text}</span>`).join("; ");
  return `    <li id="font-${num}">${bk}${fontsOld.get(k)}${cl ? `<span class="us">Hi recolza: ${cl}.</span>` : ""}</li>`;
}).join("\n");
const gl = graphs.map(g => `    <li id="${g.id}"><b class="gt"><a class="bk" href="#gc-${g.id.slice(2)}" aria-label="Torna al gràfic">↑</a> ${g.title}</b>${g.inner}</li>`).join("\n");

const secRe = /<section class="col fn" id="notes">\s*<h2>Metodologia<\/h2>([\s\S]*?)<h2>Notes<\/h2>[\s\S]*?<h2>Fonts<\/h2>\s*<ol class="fts">[\s\S]*?<\/ol>\s*<\/section>/;
if (!secRe.test(h)) { console.error(`${slug}: no trobo la secció de notes`); process.exit(1); }
h = h.replace(secRe, (m, meto) => `<section class="col fn" id="fonts">
  <h2>Dades i fonts</h2>
  <h3>Metodologia</h3>
  ${meto.trim()}
${graphs.length ? `
  <h3>Els gràfics</h3>
  <ul class="gfs">
${gl}
  </ul>
` : ""}
  <h3>Fonts</h3>
  <p class="nt-i">Cada número del text porta a la seva font. La fletxa (↑) et torna al punt on llegies.</p>
  <ol class="fts">
${lis}
  </ol>
</section>`);

/* ---------- 6. Comprovacions ---------- */
const ids = new Set([...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const dupl = [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]).filter((x, i, a) => a.indexOf(x) !== i);
const broken = [...h.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).filter(x => !ids.has(x));
const left = (h.match(/nota-|class="nts"|class="fr"/g) || []).length;
if (dupl.length || broken.length || left) { console.error(slug, { dupl, broken, left }); process.exit(1); }
console.log(`${slug}: ${notes.size} notes → ${order.length} fonts, ${citeCount} cites, ${graphs.length} gràfics`);
if (!dry) fs.writeFileSync(file, h);
else fs.writeFileSync(path.join(process.env.TMPDIR || "/tmp", slug + ".html"), h);
