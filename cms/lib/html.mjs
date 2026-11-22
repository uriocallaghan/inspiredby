/* CMS · lectura i escriptura d'HTML sense dependències.
   - parseElements: troba cada element amb les posicions exactes al text font, per poder canviar només
     l'interior d'un paràgraf sense reescriure (ni reformatar) la resta del fitxer.
   - articleBlocks / homeBlocks: quins elements es poden editar (només text amb format en línia).
   - sanitizeInline: el servidor només accepta HTML en línia d'una llista tancada (res de <script>, on*, etc.). */

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea", "title", "xmp", "noscript"]);

/** Elements que es poden editar com a bloc de text. */
export const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "figcaption", "dt", "dd", "blockquote", "td", "th", "caption"]);
/** Format en línia que es pot tenir dins d'un bloc. */
export const INLINE_TAGS = new Set(["a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn", "em", "i", "kbd", "mark", "q", "s", "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr"]);
/** Un bloc dins d'algun d'aquests no s'edita (gràfics, formularis, codi generat). */
const NO_EDIT_ANCESTORS = new Set(["svg", "math", "template", "button", "select", "label", "nav", "form", "canvas", "iframe", "object"]);

const ATTR_RE = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

export function parseAttrs(str) {
  const out = [];
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(str))) {
    out.push({ name: m[1].toLowerCase(), value: m[2] ?? m[3] ?? m[4] ?? "", quoted: m[2] !== undefined || m[3] !== undefined || m[4] !== undefined });
  }
  return out;
}

/** Llista plana d'elements en ordre de document, amb start/innerStart/innerEnd/end al text font.
    Els elements sense tancament explícit queden marcats com a `broken` (no s'editen mai). */
export function parseElements(src) {
  const els = [];
  const stack = [];
  const lower = src.toLowerCase();
  const n = src.length;
  let i = 0;
  while (i < n) {
    const lt = src.indexOf("<", i);
    if (lt < 0) break;
    if (src.startsWith("<!--", lt)) {
      const e = src.indexOf("-->", lt + 4);
      i = e < 0 ? n : e + 3;
      continue;
    }
    const c1 = src[lt + 1];
    if (c1 === "!" || c1 === "?") {
      const e = src.indexOf(">", lt);
      i = e < 0 ? n : e + 1;
      continue;
    }
    if (c1 === "/") {
      const m = /^<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/.exec(src.slice(lt, lt + 80));
      if (!m) { i = lt + 1; continue; }
      const name = m[1].toLowerCase();
      const end = lt + m[0].length;
      let k = stack.length - 1;
      while (k >= 0 && stack[k].name !== name) k--;
      if (k >= 0) {
        while (stack.length - 1 > k) stack.pop().broken = true;
        const el = stack.pop();
        el.innerEnd = lt;
        el.end = end;
      }
      i = end;
      continue;
    }
    const m = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(src.slice(lt, lt + 80));
    if (!m) { i = lt + 1; continue; }
    let j = lt + m[0].length;
    let q = null;
    for (; j < n; j++) {
      const c = src[j];
      if (q) { if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if (c === ">") break;
    }
    if (j >= n) break;
    const tagEnd = j + 1;
    const name = m[1].toLowerCase();
    let attrStr = src.slice(lt + m[0].length, j);
    const selfClose = /\/\s*$/.test(attrStr);
    if (selfClose) attrStr = attrStr.replace(/\/\s*$/, "");
    const el = {
      name, start: lt, innerStart: tagEnd, innerEnd: -1, end: -1,
      attrs: parseAttrs(attrStr), parent: stack[stack.length - 1] || null, index: els.length, broken: false
    };
    els.push(el);
    if (VOID.has(name) || selfClose) {
      el.innerEnd = tagEnd; el.end = tagEnd; el.void = true;
      i = tagEnd;
      continue;
    }
    if (RAW.has(name)) {
      const close = lower.indexOf("</" + name, tagEnd);
      if (close < 0) { el.broken = true; i = n; break; }
      const gt = src.indexOf(">", close);
      el.innerEnd = close; el.end = gt + 1; el.raw = true;
      i = gt + 1;
      continue;
    }
    stack.push(el);
    i = tagEnd;
  }
  for (const el of stack) el.broken = true;
  return els;
}

export function attr(el, name) {
  const a = el.attrs.find(x => x.name === name);
  return a ? a.value : null;
}
function hasClass(el, cls) {
  const c = attr(el, "class");
  return !!c && c.split(/\s+/).includes(cls);
}
function ancestors(el) {
  const out = [];
  for (let p = el.parent; p; p = p.parent) out.push(p);
  return out;
}
/** Descendents (en ordre) d'un element: a parseElements són contigus. */
function descendants(els, el) {
  const out = [];
  for (let k = el.index + 1; k < els.length && els[k].start < el.innerEnd; k++) out.push(els[k]);
  return out;
}
function inlineOnly(els, el) {
  return descendants(els, el).every(d => INLINE_TAGS.has(d.name) && !d.broken && !d.raw);
}

/** Text visible aproximat (només per decidir si un bloc és buit). */
function roughText(html) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim();
}

/** Blocs editables d'un article: dins del <body> (sense barra ni peu), només text amb format en línia.
    Fora: la línia de temps de lectura (la calcula sync-home), els gràfics i els elements buits que omple el JS. */
export function articleBlocks(src) {
  const els = parseElements(src);
  const blocks = [];
  for (const el of els) {
    if (!BLOCK_TAGS.has(el.name) || el.broken || el.innerEnd < 0) continue;
    const anc = ancestors(el);
    if (!anc.some(a => a.name === "body")) continue;
    // fora: la barra superior, el peu comú (el genera sync-home) i qualsevol gràfic o formulari
    if (anc.some(a => NO_EDIT_ANCESTORS.has(a.name) || a.broken || a.name === "footer" || hasClass(a, "ib-bar"))) continue;
    if (el.name === "p" && hasClass(el, "meta")) continue;
    if (!inlineOnly(els, el)) continue;
    const html = src.slice(el.innerStart, el.innerEnd);
    if (!roughText(html)) continue;
    blocks.push({ id: blocks.length, tag: el.name, html, start: el.innerStart, end: el.innerEnd });
  }
  return blocks;
}

const CARD_RE = /^articles\/([a-z0-9-]+)\/$/;

/** Blocs editables de la portada: títol i descripció de cada targeta. Text pla: es desa a articles.json. */
export function homeBlocks(src) {
  const els = parseElements(src);
  const blocks = [];
  for (const el of els) {
    if (el.broken || el.innerEnd < 0) continue;
    let field = null;
    if (el.name === "h2") field = "title";
    else if (el.name === "p" && hasClass(el, "ib-card-desc")) field = "desc";
    if (!field) continue;
    const card = ancestors(el).find(a => a.name === "a" && (hasClass(a, "ib-card") || hasClass(a, "ib-diptych-card")));
    if (!card) continue;
    const m = CARD_RE.exec(attr(card, "href") || "");
    if (!m) continue;
    if (descendants(els, el).length) continue; // la portada només té text pla
    const html = src.slice(el.innerStart, el.innerEnd);
    blocks.push({ id: blocks.length, tag: el.name, html, start: el.innerStart, end: el.innerEnd, plain: true, slug: m[1], field });
  }
  return blocks;
}

/* ---------- text pla de la portada (mateix escapat que scripts/sync-home.mjs) ---------- */

export function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rarr: "→", larr: "←", uarr: "↑", darr: "↓", mdash: "—", ndash: "–", hellip: "…", laquo: "«", raquo: "»", middot: "·" };
export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (all, e) => {
    if (e[0] === "#") {
      const cp = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp < 0x110000 ? String.fromCodePoint(cp) : all;
    }
    const v = NAMED[e.toLowerCase()];
    return v === undefined ? all : v;
  });
}

/* ---------- sanejador d'HTML en línia ---------- */

const ALLOWED_ATTRS = new Set(["class", "id", "href", "title", "lang", "dir", "rel", "target", "datetime", "translate", "style", "role", "value", "cite"]);
function attrAllowed(name) {
  return ALLOWED_ATTRS.has(name) || /^data-[a-z0-9_.-]+$/.test(name) || /^aria-[a-z]+$/.test(name);
}
function safeUrl(v) {
  const s = decodeEntities(v).replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase();
  return !/^(javascript|vbscript|data|file):/.test(s);
}
function safeStyle(v) {
  const s = decodeEntities(v).toLowerCase();
  return !/url\s*\(|expression\s*\(|@import|javascript:|behavior\s*:|-moz-binding|[<>]/.test(s);
}

export class InvalidHtml extends Error {}

/** Valida un fragment d'HTML en línia. Torna el mateix text si és vàlid; si no, llança InvalidHtml.
    No reescriu res: el que arriba del navegador ja està serialitzat; aquí només es rebutja el que no toca. */
export function sanitizeInline(html, { maxLength = 20000 } = {}) {
  if (typeof html !== "string") throw new InvalidHtml("El text no és vàlid.");
  if (html.length > maxLength) throw new InvalidHtml("El text és massa llarg.");
  if (/[\u0000]/.test(html)) throw new InvalidHtml("Caràcters no vàlids.");
  const stack = [];
  let i = 0;
  const n = html.length;
  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt < 0) break;
    const close = /^<\/([a-z][a-z0-9]*)>/.exec(html.slice(lt, lt + 40));
    if (close) {
      const name = close[1];
      if (stack.pop() !== name) throw new InvalidHtml(`Etiqueta mal tancada: </${name}>.`);
      i = lt + close[0].length;
      continue;
    }
    const open = /^<([a-z][a-z0-9]*)((?:\s+[a-z][a-z0-9_.:-]*(?:="[^"<>]*")?)*)\s*>/.exec(html.slice(lt, lt + 4000));
    if (!open) throw new InvalidHtml("Hi ha un «<» que no és una etiqueta permesa.");
    const name = open[1];
    if (!INLINE_TAGS.has(name)) throw new InvalidHtml(`Etiqueta no permesa: <${name}>.`);
    for (const a of parseAttrs(open[2])) {
      if (!attrAllowed(a.name)) throw new InvalidHtml(`Atribut no permès: ${a.name}.`);
      if ((a.name === "href" || a.name === "cite") && !safeUrl(a.value)) throw new InvalidHtml("Enllaç no permès.");
      if (a.name === "style" && !safeStyle(a.value)) throw new InvalidHtml("Estil no permès.");
    }
    if (!VOID.has(name)) stack.push(name);
    i = lt + open[0].length;
  }
  if (stack.length) throw new InvalidHtml(`Etiqueta sense tancar: <${stack[stack.length - 1]}>.`);
  if (/<\/?(script|style|iframe|object|embed)/i.test(html)) throw new InvalidHtml("Contingut no permès.");
  return html;
}

/** Text pla (portada): sense salts de línia ni caràcters de control. */
export function sanitizePlain(text, { maxLength = 600 } = {}) {
  if (typeof text !== "string") throw new InvalidHtml("El text no és vàlid.");
  const t = text.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!t) throw new InvalidHtml("El text no pot quedar buit.");
  if (t.length > maxLength) throw new InvalidHtml("El text és massa llarg.");
  return t;
}
