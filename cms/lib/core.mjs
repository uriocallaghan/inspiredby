/* CMS · lògica: llistar pàgines, carregar-ne els blocs, desar canvis i comentaris.
   No depèn de Netlify ni de GitHub: rep un `repo` (github.mjs o fsrepo.mjs).

   Com es combinen els canvis (la regla que fa que el CMS i Claude Code no es trepitgin):
   - L'editor no envia el fitxer sencer, només «aquest bloc deia X (entre els blocs P i N) i ara ha de dir Y».
   - En desar, el servidor llegeix l'últim main i busca el bloc que encara diu exactament X. Si n'hi ha més
     d'un d'igual (dos intertítols idèntics), tria el que té els mateixos veïns; si no ho pot saber segur, NO
     endevina: torna un conflicte. Tota la resta del fitxer (el que hagi canviat Claude Code) es queda com és.
   - Si X ja no hi és (algú altre ha tocat aquell bloc), es torna un conflicte amb el bloc que més s'hi
     assembla (o cap, si no n'hi ha cap de prou semblant) i l'editor tria.
   - El commit es fa sobre el main que s'ha llegit; si main s'ha mogut entremig, es torna a començar. */

import { articleBlocks, homeBlocks, sanitizeInline, sanitizePlain, escapeHtml, decodeEntities, InvalidHtml } from "./html.mjs";
import { RepoConflict } from "./github.mjs";
import { randomId } from "./auth.mjs";

export const CATALOG = "web/articles.json";
/** Un fitxer per comentari: el CMS n'afegeix i Claude Code n'esborra sense tocar mai el mateix fitxer. */
export const COMMENTS_DIR = "cms/comentaris";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_RE = /^c-[a-z0-9]{4,16}$/;
const MAX_TRIES = 4;

export class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}

/** "" → portada; "articles/<slug>/" → article. Qualsevol altra cosa es rebutja (res de camins inventats). */
export function resolvePage(page) {
  if (page === "" || page === "/" || page === "index.html") return { page: "", file: "web/index.html", home: true, key: "portada" };
  const m = /^articles\/([a-z0-9-]+)\/?$/.exec(String(page ?? ""));
  if (!m || !SLUG_RE.test(m[1]) || m[1] === "portada") throw new HttpError(400, "Pàgina no vàlida.");
  return { page: `articles/${m[1]}/`, file: `web/articles/${m[1]}/index.html`, slug: m[1], home: false, key: m[1] };
}

function parseCatalog(txt) {
  try { const a = JSON.parse(txt); if (Array.isArray(a)) return a.filter(x => x && typeof x === "object" && typeof x.slug === "string"); } catch {}
  throw new HttpError(500, "web/articles.json no és vàlid.");
}

function blocksFor(target, src) {
  return target.home ? homeBlocks(src) : articleBlocks(src);
}
function publicBlock(b) {
  return b.plain ? { id: b.id, tag: b.tag, text: decodeEntities(b.html), plain: true, slug: b.slug, field: b.field } : { id: b.id, tag: b.tag, html: b.html };
}

/* ---------- comentaris: lectura ---------- */

const commentFile = (key, id) => `${COMMENTS_DIR}/${key}--${id}.json`;
function parseCommentName(name) {
  const m = /^([a-z0-9-]+)--(c-[a-z0-9]+)\.json$/.exec(name);
  return m ? { key: m[1], id: m[2] } : null;
}
async function listComments(repo, head) {
  const files = (await repo.listDir(COMMENTS_DIR, head)) || [];
  return files.map(f => ({ ...parseCommentName(f.name), path: `${COMMENTS_DIR}/${f.name}` })).filter(x => x.id);
}
async function readComments(repo, head, key) {
  const list = (await listComments(repo, head)).filter(x => x.key === key);
  const out = [];
  for (const f of list) {
    try {
      const c = JSON.parse(await repo.readFile(f.path, head));
      if (c && typeof c === "object" && c.id === f.id && typeof c.cita === "string" && typeof c.nota === "string") out.push(c);
    } catch {} // un fitxer trencat no ha d'aturar l'editor: simplement no surt
  }
  return out.sort((a, b) => String(a.creat).localeCompare(String(b.creat)));
}

/* ---------- pàgines ---------- */

export async function listPages(repo) {
  const head = await repo.head();
  const catalog = parseCatalog(await repo.readFile(CATALOG, head));
  const comments = await listComments(repo, head);
  const count = key => comments.filter(c => c.key === key).length;
  return {
    head,
    pages: [
      { page: "", title: "Portada", comments: count("portada") },
      ...catalog.map(a => ({ page: `articles/${a.slug}/`, title: String(a.title || a.slug), draft: !!a.draft, comments: count(a.slug) }))
    ]
  };
}

async function pageAt(repo, target, head) {
  const [src, catalogTxt] = await Promise.all([repo.readFile(target.file, head), repo.readFile(CATALOG, head)]);
  if (src === null) throw new HttpError(404, "Aquesta pàgina no existeix a GitHub.");
  const catalog = parseCatalog(catalogTxt);
  let title = "Portada";
  if (!target.home) {
    const a = catalog.find(x => x.slug === target.slug);
    if (!a) throw new HttpError(404, "Aquest article no és a web/articles.json.");
    title = String(a.title || a.slug);
  }
  return { src, catalog, title };
}

/** Carrega una pàgina. Amb `ref`, la llegeix en aquell commit (p. ex. el que s'acaba de fer), no a l'últim. */
export async function loadPage(repo, page, { withHistory = true, ref } = {}) {
  const target = resolvePage(page);
  const head = ref || await repo.head();
  const [{ src, title }, comments] = await Promise.all([pageAt(repo, target, head), readComments(repo, head, target.key)]);
  let history = [];
  if (withHistory && repo.history) { try { history = await repo.history(target.file, 4); } catch {} }
  return {
    page: target.page, file: target.file, title, head,
    blocks: blocksFor(target, src).map(publicBlock),
    comments,
    history
  };
}

export async function headOf(repo) {
  return { head: await repo.head() };
}

/* ---------- desar text ---------- */

function plainOf(b) { return decodeEntities(b.html); }
export function stripTags(html) { return decodeEntities(String(html).replace(/<[^>]*>/g, "")).replace(/[\s ]+/g, " ").trim(); }
function snippet(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 25);
  const cut = s => (from > 0 ? "…" : "") + s.slice(from, from + 70) + (s.length > from + 70 ? "…" : "");
  return `«${cut(a)}» → «${cut(b)}»`;
}
/** Text de l'editor dins d'un missatge de commit: sense marques que facin saltar Netlify o les Actions. */
export function safeForCommit(s) {
  return String(s).replace(/[\r\n]+/g, " ").replace(/\[\s*(skip|no|ci|netlify)[^\]]*\]/gi, m => "(" + m.slice(1, -1) + ")");
}
/** Semblança 0–1 entre dos textos (paraules en comú). */
function similarity(a, b) {
  const A = new Set(a.toLowerCase().split(/\s+/).filter(Boolean)), B = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / (A.size + B.size - n);
}

function validateEdits(edits, home) {
  if (!Array.isArray(edits) || !edits.length) throw new HttpError(400, "No hi ha canvis.");
  if (edits.length > 300) throw new HttpError(400, "Massa canvis d'un sol cop.");
  const ids = new Set();
  return edits.map(e => {
    if (!e || typeof e !== "object" || !Number.isInteger(e.id) || e.id < 0 || e.id > 100000 || typeof e.from !== "string" || e.from.length > 40000) throw new HttpError(400, "Canvi no vàlid.");
    if (ids.has(e.id)) throw new HttpError(400, "Hi ha dos canvis per al mateix bloc.");
    ids.add(e.id);
    const ctx = v => (typeof v === "string" && v.length <= 40000 ? v : null);
    let to;
    try { to = home ? sanitizePlain(e.to) : sanitizeInline(e.to); }
    catch (err) { if (err instanceof InvalidHtml) throw new HttpError(400, err.message, { id: e.id }); throw err; }
    if (!home && !stripTags(to)) throw new HttpError(400, "Un paràgraf no pot quedar buit. Escriu-hi alguna cosa o desfés el canvi.", { id: e.id });
    return { id: e.id, from: e.from, to, prev: ctx(e.prev), next: ctx(e.next), dup: e.dup === true, tag: typeof e.tag === "string" && /^[a-z0-9]{1,10}$/.test(e.tag) ? e.tag : null };
  });
}

/** Desa els canvis d'una pàgina. Torna { ok, commit, page } o llança HttpError(409) amb els conflictes. */
export async function savePage(repo, { page, edits }, { author }) {
  const target = resolvePage(page);
  const clean = validateEdits(edits, target.home);
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const head = await repo.head();
    const { src, catalog, title } = await pageAt(repo, target, head);
    const blocks = blocksFor(target, src);
    const content = b => (target.home ? plainOf(b) : b.html);
    const used = new Set();
    const splices = [];
    const conflicts = [];
    const lines = [];
    for (const e of clean) {
      let cands = blocks.filter(b => !used.has(b.id) && content(b) === e.from);
      // a la portada, la font de veritat de cada targeta és articles.json: si allà ja diu una altra cosa, és un conflicte
      if (target.home) cands = cands.filter(b => { const a = catalog.find(x => x.slug === b.slug); return a && String(a[b.field] ?? "") === e.from; });
      let pick = null, why = "changed";
      if (cands.length === 1 && !e.dup) pick = cands[0];
      else if (cands.length) {
        // blocs idèntics: es decideix pels veïns; si no queda clar, no s'endevina
        const score = b => {
          const i = blocks.indexOf(b);
          return (e.prev !== null && i > 0 && content(blocks[i - 1]) === e.prev ? 1 : 0) + (e.next !== null && i < blocks.length - 1 && content(blocks[i + 1]) === e.next ? 1 : 0);
        };
        const ranked = cands.map(b => ({ b, s: score(b) })).sort((x, y) => y.s - x.s || Math.abs(x.b.id - e.id) - Math.abs(y.b.id - e.id));
        if (ranked[0].s > 0 && (ranked.length === 1 || ranked[0].s > ranked[1].s)) pick = ranked[0].b;
        else why = "ambiguous";
      }
      if (!pick) {
        // proposta per a l'editor: el bloc del mateix tipus que més s'assembla al que hi havia (o cap)
        const base = target.home ? e.from : stripTags(e.from);
        let best = null, bestS = 0;
        // 1) el bloc que és entre els mateixos dos veïns d'abans: és el mateix lloc, encara que s'hagi reescrit
        if (why === "changed" && e.prev !== null && e.next !== null) {
          for (let i = 1; i < blocks.length - 1; i++) {
            const b = blocks[i];
            if (!used.has(b.id) && (!e.tag || b.tag === e.tag) && content(blocks[i - 1]) === e.prev && content(blocks[i + 1]) === e.next) { best = b; bestS = 1; break; }
          }
        }
        // 2) si no, el que més s'hi assembla
        if (!best) for (const b of blocks) {
          if (used.has(b.id) || (e.tag && b.tag !== e.tag)) continue;
          const s = similarity(base, target.home ? plainOf(b) : stripTags(b.html)) - Math.min(Math.abs(b.id - e.id), 50) * 0.002;
          if (s > bestS) { bestS = s; best = b; }
        }
        conflicts.push({ id: e.id, why, mine: e.to, theirs: why === "changed" && best && bestS >= 0.35 ? publicBlock(best) : null });
        continue;
      }
      used.add(pick.id);
      const html = target.home ? escapeHtml(e.to) : e.to;
      if (html === pick.html) continue;
      splices.push({ b: pick, html, to: e.to });
      lines.push(snippet(target.home ? plainOf(pick) : stripTags(pick.html), target.home ? e.to : stripTags(e.to)));
    }
    if (conflicts.length) {
      throw new HttpError(409, "Algú altre ha canviat aquests paràgrafs mentre els editaves.", {
        conflicts, page: await loadPage(repo, target.page, { withHistory: false, ref: head })
      });
    }
    if (!splices.length) return { ok: true, unchanged: true, page: await loadPage(repo, target.page, { ref: head }) };

    let next = src;
    for (const s of [...splices].sort((a, b) => b.b.start - a.b.start)) {
      next = next.slice(0, s.b.start) + s.html + next.slice(s.b.end);
    }
    const files = [{ path: target.file, content: next }];
    if (target.home) {
      const cat = JSON.parse(await repo.readFile(CATALOG, head)); // l'original sencer, amb tots els camps i entrades
      for (const s of splices) {
        const a = cat.find(x => x && x.slug === s.b.slug);
        if (!a) throw new HttpError(409, "Aquesta targeta ja no és a web/articles.json.");
        a[s.b.field] = s.to;
      }
      files.push({ path: CATALOG, content: JSON.stringify(cat, null, 2) + "\n" });
    }
    const n = splices.length;
    const message = `CMS: ${safeForCommit(title)} · ${n} ${n === 1 ? "canvi" : "canvis"} de text\n\n${lines.map(l => `- ${safeForCommit(l)}`).join("\n")}\n\nVia: CMS de l'editor (/admin/)`;
    let sha;
    try { sha = await repo.commit({ parent: head, files, message, author }); }
    catch (err) { if (err instanceof RepoConflict) continue; throw err; } // main s'ha mogut: es torna a llegir i a combinar
    return { ok: true, commit: sha, page: await loadPage(repo, target.page, { ref: sha }) };
  }
  throw new HttpError(503, "GitHub està molt ocupat ara mateix. Torna-ho a provar.");
}

/* ---------- comentaris per a l'agent ---------- */

function cleanStr(v, max, { required = false, name = "text" } = {}) {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") throw new HttpError(400, `${name} no vàlid.`);
  const s = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
  if (required && !s.trim()) throw new HttpError(400, `Falta ${name}.`);
  if (s.length > max) throw new HttpError(400, `${name} massa llarg.`);
  return s;
}

async function commitRetry(repo, build, author) {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const head = await repo.head();
    const r = await build(head);
    if (!r) return { ok: true, unchanged: true };
    try { return { ok: true, commit: await repo.commit({ parent: head, files: r.files, message: r.message, author }) }; }
    catch (err) { if (err instanceof RepoConflict) continue; throw err; }
  }
  throw new HttpError(503, "GitHub està molt ocupat ara mateix. Torna-ho a provar.");
}

export async function addComment(repo, body, { author }) {
  const target = resolvePage(body.page);
  const id = `c-${(randomId(9).toLowerCase().replace(/[^a-z0-9]/g, "") + Date.now().toString(36)).slice(0, 10)}`;
  const c = {
    id,
    pagina: target.page,
    fitxer: target.file,
    cita: cleanStr(body.quote, 4000, { required: true, name: "el text subratllat" }),
    abans: cleanStr(body.prefix, 200, { name: "el context" }),
    despres: cleanStr(body.suffix, 200, { name: "el context" }),
    nota: cleanStr(body.note, 4000, { required: true, name: "el comentari" }).trim(),
    creat: new Date().toISOString()
  };
  if (!c.nota) throw new HttpError(400, "Falta el comentari.");
  const short = safeForCommit(c.nota).slice(0, 60);
  const r = await commitRetry(repo, async () => ({
    files: [{ path: commentFile(target.key, id), content: JSON.stringify(c, null, 2) + "\n" }],
    message: `CMS: comentari a ${target.home ? "la portada" : target.slug} · ${short}${c.nota.length > 60 ? "…" : ""}\n\nCita: «${safeForCommit(c.cita).slice(0, 200)}»\nNota: ${safeForCommit(c.nota)}\n\nVia: CMS de l'editor (/admin/)`
  }), author);
  return { ...r, comment: c };
}

export async function deleteComment(repo, body, { author }) {
  const id = cleanStr(body.id, 40, { required: true, name: "l'identificador" });
  if (!ID_RE.test(id)) throw new HttpError(400, "Identificador no vàlid.");
  let removed = false;
  const r = await commitRetry(repo, async head => {
    const f = (await listComments(repo, head)).find(x => x.id === id);
    if (!f) return null; // ja resolt (per l'agent o en una altra pestanya)
    removed = true;
    return { files: [{ path: f.path, content: null }], message: `CMS: l'editor treu el comentari ${id}` };
  }, author);
  return { ...r, removed };
}
