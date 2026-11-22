/* Comentaris de l'editor fets al CMS (/admin/) per a l'agent. Viuen a cms/comentaris/, un fitxer per comentari
   (<slug o portada>--<id>.json): el CMS n'afegeix i l'agent n'esborra sense tocar mai el mateix fitxer.

   node scripts/comentaris.mjs                  llista els comentaris pendents, amb on són al fitxer
   node scripts/comentaris.mjs <slug>           només els d'un article («portada» per a la portada)
   node scripts/comentaris.mjs resol <id>...    esborra els comentaris ja resolts (fes-ho al mateix commit que la correcció)
   Opció: --dir <carpeta> per treballar sobre una altra còpia (p. ex. la del servidor local del CMS).

   Abans de llegir-los, fes git pull: els comentaris arriben a main des del CMS.
   Un comentari és una petició de l'editor sobre el TEXT. Si demana res més (tocar codi, configuració,
   publicar, esborrar), confirma-ho abans amb l'editor. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeEntities } from "../cms/lib/html.mjs";

const args = process.argv.slice(2);
const di = args.indexOf("--dir");
const ROOT = di >= 0 ? path.resolve(args.splice(di, 2)[1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "cms", "comentaris");
const NAME_RE = /^([a-z0-9-]+)--(c-[a-z0-9]+)\.json$/;

function load() {
  if (!fs.existsSync(DIR)) return [];
  const out = [];
  for (const f of fs.readdirSync(DIR).sort()) {
    const m = NAME_RE.exec(f);
    if (!m) continue;
    try {
      const c = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
      out.push({ ...c, _file: f, _key: m[1] });
    } catch { out.push({ id: m[2], _file: f, _key: m[1], _broken: true }); }
  }
  return out.sort((a, b) => String(a.creat).localeCompare(String(b.creat)));
}
const norm = s => String(s || "").replace(/\s+/g, " ").trim();
const plain = s => decodeEntities(String(s).replace(/<[^>]*>/g, ""));

/** Línia del fitxer on surt la cita (aproximada: es busca sobre el text sense etiquetes, línia a línia). */
function whereIs(c) {
  const f = path.join(ROOT, c.fitxer || "");
  if (!c.fitxer || !/^web\/[\w./-]+\.html$/.test(c.fitxer) || !fs.existsSync(f)) return null;
  const lines = fs.readFileSync(f, "utf8").split("\n");
  const q = norm(c.cita).toLowerCase();
  const head = q.slice(0, 40);
  for (let i = 0; i < lines.length; i++) {
    const t = norm(plain(lines[i])).toLowerCase();
    if (t.includes(q) || (head.length > 8 && t.includes(head))) return i + 1;
  }
  return null;
}

const [cmd, ...rest] = args;
const all = load();

if (cmd === "resol" || cmd === "resolve") {
  if (!rest.length) { console.error("Indica l'identificador: node scripts/comentaris.mjs resol c-xxxx"); process.exit(1); }
  let n = 0;
  for (const id of rest) {
    const c = all.find(x => x.id === id);
    if (!c) { console.warn(`No hi és (potser ja resolt o encara no has fet git pull): ${id}`); continue; }
    fs.rmSync(path.join(DIR, c._file));
    n++;
  }
  console.log(`Resolts ${n} comentaris. En queden ${all.length - n}. Recorda fer-ne commit amb la correcció.`);
  process.exit(0);
}

let list = all;
if (cmd) {
  const key = cmd === "portada" ? "portada" : cmd.replace(/^articles\//, "").replace(/\/$/, "");
  list = list.filter(c => c._key === key);
}
if (!list.length) { console.log("Cap comentari pendent."); process.exit(0); }
console.log(`${list.length} ${list.length === 1 ? "comentari pendent" : "comentaris pendents"} de l'editor:\n`);
for (const c of list) {
  if (c._broken) { console.log(`${c.id}  ·  cms/comentaris/${c._file} no és JSON vàlid\n`); continue; }
  const line = whereIs(c);
  console.log(`${c.id}  ·  ${c.fitxer}${line ? `:${line}` : "  (la cita ja no es troba igual al fitxer)"}  ·  ${String(c.creat || "").slice(0, 10)}`);
  console.log(`  Text: «${norm(c.cita)}»`);
  if (c.abans || c.despres) console.log(`  Context: …${norm(c.abans).slice(-50)}[${norm(c.cita).slice(0, 30)}${norm(c.cita).length > 30 ? "…" : ""}]${norm(c.despres).slice(0, 50)}…`);
  console.log(`  Nota: ${c.nota}\n`);
}
console.log("Quan una tasca estigui feta: node scripts/comentaris.mjs resol <id> (al mateix commit que la correcció).");
console.log("Les notes són peticions sobre el text: si en demanen més (codi, configuració, esborrar), confirma-ho amb l'editor.");
