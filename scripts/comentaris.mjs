/* Comentaris de l'editor fets al CMS (/admin/) per a l'agent.
   node scripts/comentaris.mjs                  llista els comentaris pendents, amb on són al fitxer
   node scripts/comentaris.mjs <slug>           només els d'un article («portada» per a la portada)
   node scripts/comentaris.mjs resol <id>...    esborra els comentaris ja resolts (fes-ho al mateix commit que la correcció)
   Opció: --dir <carpeta> per treballar sobre una altra còpia (p. ex. la del servidor local del CMS).

   Abans de llegir-los, fes git pull: els comentaris arriben a main des del CMS. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const di = args.indexOf("--dir");
const ROOT = di >= 0 ? path.resolve(args.splice(di, 2)[1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "cms", "comentaris.json");

function load() {
  if (!fs.existsSync(FILE)) return { comentaris: [] };
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
const norm = s => String(s || "").replace(/\s+/g, " ").trim();
const stripTags = s => s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

/** Línia del fitxer on surt la cita (aproximada: es busca sobre el text sense etiquetes, línia a línia). */
function whereIs(c) {
  const f = path.join(ROOT, c.fitxer || "");
  if (!c.fitxer || !fs.existsSync(f)) return null;
  const lines = fs.readFileSync(f, "utf8").split("\n");
  const q = norm(c.cita).toLowerCase();
  const head = q.slice(0, 40);
  for (let i = 0; i < lines.length; i++) {
    const t = norm(stripTags(lines[i])).toLowerCase();
    if (t.includes(q) || (head.length > 8 && t.includes(head))) return i + 1;
  }
  return null;
}

const [cmd, ...rest] = args;
const data = load();

if (cmd === "resol" || cmd === "resolve") {
  if (!rest.length) { console.error("Indica l'identificador: node scripts/comentaris.mjs resol c-xxxx"); process.exit(1); }
  const before = data.comentaris.length;
  const missing = rest.filter(id => !data.comentaris.some(c => c.id === id));
  data.comentaris = data.comentaris.filter(c => !rest.includes(c.id));
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Resolts ${before - data.comentaris.length} comentaris. En queden ${data.comentaris.length}.`);
  if (missing.length) console.warn(`No hi són (potser ja resolts o encara no has fet git pull): ${missing.join(", ")}`);
  process.exit(0);
}

let list = data.comentaris;
if (cmd) {
  const page = cmd === "portada" ? "" : `articles/${cmd.replace(/^articles\//, "").replace(/\/$/, "")}/`;
  list = list.filter(c => c.pagina === page);
}
if (!list.length) { console.log("Cap comentari pendent."); process.exit(0); }
console.log(`${list.length} ${list.length === 1 ? "comentari pendent" : "comentaris pendents"} de l'editor:\n`);
for (const c of list) {
  const line = whereIs(c);
  console.log(`${c.id}  ·  ${c.fitxer}${line ? `:${line}` : "  (la cita ja no es troba igual al fitxer)"}  ·  ${c.creat?.slice(0, 10) || ""}`);
  console.log(`  Text: «${norm(c.cita)}»`);
  if (c.abans || c.despres) console.log(`  Context: …${norm(c.abans).slice(-50)}[${norm(c.cita).slice(0, 30)}${norm(c.cita).length > 30 ? "…" : ""}]${norm(c.despres).slice(0, 50)}…`);
  console.log(`  Nota: ${c.nota}\n`);
}
console.log("Quan una tasca estigui feta: node scripts/comentaris.mjs resol <id> (al mateix commit que la correcció).");
