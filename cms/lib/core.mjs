/* CMS · lògica: llistar pàgines, carregar-ne els blocs, desar canvis i comentaris.
   No depèn de Netlify ni de GitHub: rep un `repo` (github.mjs o fsrepo.mjs).

   Com es combinen els canvis (la regla que fa que el CMS i Claude Code no es trepitgin):
   - L'editor no envia el fitxer sencer, només «aquest paràgraf deia X i ara ha de dir Y».
   - En desar, el servidor llegeix l'últim main, busca el paràgraf que encara diu exactament X i el canvia per Y.
     Tota la resta del fitxer (el que hagi canviat Claude Code entretant) es queda com és.
   - Si X ja no hi és (algú altre ha tocat aquell mateix paràgraf), no s'endevina res: es torna un conflicte
     i l'editor tria quina versió es queda.
   - El commit es fa sobre el main que s'ha llegit; si main s'ha mogut entremig, es torna a començar. */

import { articleBlocks, homeBlocks, sanitizeInline, sanitizePlain, escapeHtml, decodeEntities, InvalidHtml } from "./html.mjs";
import { RepoConflict } from "./github.mjs";
import { randomId } from "./auth.mjs";

export const CATALOG = "web/articles.json";
export const COMMENTS = "cms/comentaris.json";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TRIES = 4;

export class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}

/** "" → portada; "articles/<slug>/" → article. Qualsevol altra cosa es rebutja (res de camins inventats). */
export function resolvePage(page) {
  if (page === "" || page === "/" || page === "index.html") return { page: "", file: "web/index.html", home: true };
  const m = /^articles\/([a-z0-9-]+)\/?$/.exec(String(page || ""));
  if (!m || !SLUG_RE.test(m[1])) throw new HttpError(400, "Pàgina no vàlida.");
  return { page: `articles/${m[1]}/`, file: `web/articles/${m[1]}/index.html`, slug: m[1], home: false };
}

function parseCatalog(txt) {
  try { const a = JSON.parse(txt); if (Array.isArray(a)) return a; } catch {}
  throw new HttpError(500, "web/articles.json no és vàlid.");
}
const emptyComments = () => ({
  "llegeix-me": "Comentaris de l'editor fets al CMS (/admin/). Cada comentari assenyala un tros de text d'una pàgina (cita, amb el text d'abans i de després) i diu què cal revisar (nota). Quan l'agent ha fet la feina que demana un comentari, l'esborra amb «node scripts/comentaris.mjs resol <id>» al mateix commit que la correcció; així desapareix del CMS.",
  comentaris: []
});
function parseComments(txt) {
  if (!txt) return emptyComments();
  try {
    const o = JSON.parse(txt);
    if (o && Array.isArray(o.comentaris)) return o;
  } catch {}
  throw new HttpError(500, "cms/comentaris.json no és vàlid.");
}
const stringifyComments = o => JSON.stringify(o, null, 2) + "\n";

function blocksFor(target, src) {
  return target.home ? homeBlocks(src) : articleBlocks(src);
}
function publicBlock(b) {
  return b.plain ? { id: b.id, tag: b.tag, text: decodeEntities(b.html), plain: true, slug: b.slug, field: b.field } : { id: b.id, tag: b.tag, html: b.html };
}

export async function listPages(repo) {
  const head = await repo.head();
  const catalog = parseCatalog(await repo.readFile(CATALOG, head));
  const comments = parseComments(await repo.readFile(COMMENTS, head));
  const count = p => comments.comentaris.filter(c => c.pagina === p).length;
  return {
    head,
    pages: [
      { page: "", title: "Portada", comments: count("") },
      ...catalog.map(a => ({ page: `articles/${a.slug}/`, title: a.title, draft: !!a.draft, comments: count(`articles/${a.slug}/`) }))
    ]
  };
}

async function pageAt(repo, target, head) {
  const [src, catalogTxt, commentsTxt] = await Promise.all([
    repo.readFile(target.file, head), repo.readFile(CATALOG, head), repo.readFile(COMMENTS, head)
  ]);
  if (src === null) throw new HttpError(404, "Aquesta pàgina no existeix a GitHub.");
  const catalog = parseCatalog(catalogTxt);
  let title = "Portada";
  if (!target.home) {
    const a = catalog.find(x => x.slug === target.slug);
    if (!a) throw new HttpError(404, "Aquest article no és a web/articles.json.");
    title = a.title;
  }
  return { src, catalog, comments: parseComments(commentsTxt), title };
}

export async function loadPage(repo, page, { withHistory = true } = {}) {
  const target = resolvePage(page);
  const head = await repo.head();
  const { src, comments, title } = await pageAt(repo, target, head);
  let history = [];
  if (withHistory && repo.history) { try { history = await repo.history(target.file, 4); } catch {} }
  return {
    page: target.page, file: target.file, title, head,
    blocks: blocksFor(target, src).map(publicBlock),
    comments: comments.comentaris.filter(c => c.pagina === target.page),
    history
  };
}

export async function headOf(repo) {
  return { head: await repo.head() };
}

/* ---------- desar text ---------- */

function plainOf(b) { return decodeEntities(b.html); }
function stripTags(html) { return decodeEntities(String(html).replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim(); }
function snippet(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 25);
  const cut = s => (from > 0 ? "…" : "") + s.slice(from, from + 70) + (s.length > from + 70 ? "…" : "");
  return `«${cut(a)}» → «${cut(b)}»`;
}

function validateEdits(edits, home) {
  if (!Array.isArray(edits) || !edits.length) throw new HttpError(400, "No hi ha canvis.");
  if (edits.length > 300) throw new HttpError(400, "Massa canvis d'un sol cop.");
  return edits.map(e => {
    if (!e || !Number.isInteger(e.id) || e.id < 0 || typeof e.from !== "string") throw new HttpError(400, "Canvi no vàlid.");
    try {
      return { id: e.id, from: e.from, to: home ? sanitizePlain(e.to) : sanitizeInline(e.to) };
    } catch (err) {
      if (err instanceof InvalidHtml) throw new HttpError(400, err.message);
      throw err;
    }
  });
}

/** Desa els canvis d'una pàgina. Torna { ok, head, page } o llança HttpError(409) amb els conflictes. */
export async function savePage(repo, { page, edits }, { author }) {
  const target = resolvePage(page);
  const clean = validateEdits(edits, target.home);
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const head = await repo.head();
    const { src, catalog, title } = await pageAt(repo, target, head);
    const blocks = blocksFor(target, src);
    const used = new Set();
    const splices = [];
    const conflicts = [];
    const lines = [];
    for (const e of clean) {
      const same = b => (target.home ? plainOf(b) === e.from : b.html === e.from);
      const cands = blocks.filter(b => same(b) && !used.has(b.id));
      if (!cands.length) {
        // proposta per a l'editor: el bloc que ara ocupa el mateix lloc, si és del mateix tipus
        const near = blocks.find(b => b.id === e.id);
        conflicts.push({ id: e.id, mine: e.to, theirs: near ? publicBlock(near) : null });
        continue;
      }
      cands.sort((a, b) => Math.abs(a.id - e.id) - Math.abs(b.id - e.id));
      const b = cands[0];
      used.add(b.id);
      const html = target.home ? escapeHtml(e.to) : e.to;
      if (html === b.html) continue;
      splices.push({ b, html, to: e.to });
      lines.push(snippet(target.home ? plainOf(b) : stripTags(b.html), target.home ? e.to : stripTags(e.to)));
    }
    if (conflicts.length) {
      throw new HttpError(409, "Algú altre ha canviat aquests paràgrafs mentre els editaves.", {
        conflicts, page: { ...(await loadPage(repo, target.page, { withHistory: false })) }
      });
    }
    if (!splices.length) return { ok: true, unchanged: true, page: await loadPage(repo, target.page) };

    let next = src;
    for (const s of [...splices].sort((a, b) => b.b.start - a.b.start)) {
      next = next.slice(0, s.b.start) + s.html + next.slice(s.b.end);
    }
    const files = [{ path: target.file, content: next }];
    if (target.home) {
      const cat = catalog.map(a => ({ ...a }));
      for (const s of splices) {
        const a = cat.find(x => x.slug === s.b.slug);
        if (a) a[s.b.field] = s.to;
      }
      files.push({ path: CATALOG, content: JSON.stringify(cat, null, 2) + "\n" });
    }
    const n = splices.length;
    const message = `CMS: ${title} · ${n} ${n === 1 ? "canvi" : "canvis"} de text\n\n${lines.map(l => `- ${l}`).join("\n")}\n\nVia: CMS de l'editor (/admin/)`;
    try {
      const sha = await repo.commit({ parent: head, files, message, author });
      return { ok: true, commit: sha, page: await loadPage(repo, target.page) };
    } catch (err) {
      if (err instanceof RepoConflict) continue; // main s'ha mogut: es torna a llegir i a combinar
      throw err;
    }
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

async function mutateComments(repo, fn, message, author) {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const head = await repo.head();
    const data = parseComments(await repo.readFile(COMMENTS, head));
    const result = fn(data);
    if (result === false) return { ok: true, unchanged: true };
    try {
      const sha = await repo.commit({ parent: head, files: [{ path: COMMENTS, content: stringifyComments(data) }], message, author });
      return { ok: true, commit: sha };
    } catch (err) {
      if (err instanceof RepoConflict) continue;
      throw err;
    }
  }
  throw new HttpError(503, "GitHub està molt ocupat ara mateix. Torna-ho a provar.");
}

export async function addComment(repo, body, { author }) {
  const target = resolvePage(body.page);
  const c = {
    id: `c-${randomId(6).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || Date.now().toString(36)}`,
    pagina: target.page,
    fitxer: target.file,
    cita: cleanStr(body.quote, 4000, { required: true, name: "el text subratllat" }),
    abans: cleanStr(body.prefix, 200, { name: "el context" }),
    despres: cleanStr(body.suffix, 200, { name: "el context" }),
    nota: cleanStr(body.note, 4000, { required: true, name: "el comentari" }).trim(),
    creat: new Date().toISOString()
  };
  const short = c.nota.replace(/\s+/g, " ").slice(0, 60);
  const r = await mutateComments(repo, d => { d.comentaris.push(c); },
    `CMS: comentari a ${target.home ? "la portada" : target.slug} · ${short}${c.nota.length > 60 ? "…" : ""}\n\nCita: «${c.cita.slice(0, 200)}»\nNota: ${c.nota}\n\nVia: CMS de l'editor (/admin/)`, author);
  return { ...r, comment: c };
}

export async function deleteComment(repo, body, { author }) {
  const id = cleanStr(body.id, 40, { required: true, name: "l'identificador" });
  if (!/^c-[a-z0-9]+$/.test(id)) throw new HttpError(400, "Identificador no vàlid.");
  let gone = null;
  const r = await mutateComments(repo, d => {
    const i = d.comentaris.findIndex(c => c.id === id);
    if (i < 0) return false;
    gone = d.comentaris.splice(i, 1)[0];
  }, `CMS: l'editor treu el comentari ${id}`, author);
  return { ...r, removed: !!gone };
}
