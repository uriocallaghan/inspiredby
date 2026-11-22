/* Proves del CMS: node --test cms/test/ */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { articleBlocks, homeBlocks, sanitizeInline, InvalidHtml } from "../lib/html.mjs";
import { seal, unseal, b64url, identityUser, AuthError, SESSION_COOKIE } from "../lib/auth.mjs";
import { fsRepo } from "../lib/fsrepo.mjs";
import { savePage, loadPage, addComment, deleteComment, HttpError, safeForCommit } from "../lib/core.mjs";
import { createHandler } from "../lib/handler.mjs";
import { RepoConflict, githubRepo } from "../lib/github.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SLUG = "per-que-riem";
const SECRET = "x".repeat(40);

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ibcms-"));
  for (const rel of ["web/articles.json", "web/index.html", `web/articles/${SLUG}/index.html`]) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, rel), path.join(dir, rel));
  }
  return { dir, repo: fsRepo(dir) };
}
const author = { name: "Editor (CMS)", email: "cms@example.com" };

/* ---------- HTML ---------- */

test("tots els articles es llegeixen sense elements trencats als blocs", () => {
  for (const d of fs.readdirSync(path.join(ROOT, "web/articles"))) {
    const f = path.join(ROOT, "web/articles", d, "index.html");
    if (!fs.existsSync(f)) continue;
    const src = fs.readFileSync(f, "utf8");
    const blocks = articleBlocks(src);
    assert.ok(blocks.length > 20, `${d}: massa pocs blocs (${blocks.length})`);
    for (const b of blocks) {
      assert.equal(src.slice(b.start, b.end), b.html);
      assert.doesNotThrow(() => sanitizeInline(b.html.replace(/&(?![a-z#0-9]+;)/gi, "&amp;").replace(/<(?![a-z\/])/gi, "&lt;")), `${d} bloc ${b.id} no passa el sanejador`);
    }
    assert.ok(!blocks.some(b => /min de lectura/.test(b.html)), `${d}: la línia de temps de lectura no s'ha d'editar`);
  }
});

test("la portada dona títol i descripció de cada targeta", () => {
  const blocks = homeBlocks(fs.readFileSync(path.join(ROOT, "web/index.html"), "utf8"));
  const cat = JSON.parse(fs.readFileSync(path.join(ROOT, "web/articles.json"), "utf8")).filter(a => !a.draft);
  assert.equal(blocks.length, cat.length * 2);
  assert.ok(blocks.every(b => b.plain && b.slug && (b.field === "title" || b.field === "desc")));
});

test("el sanejador accepta format en línia i rebutja la resta", () => {
  const ok = ['Text <b>fort</b> i <i lang="en">cursiva</i>', 'Nota<sup class="nr"><a href="#font-1" id="c1" data-c="u1-1">1</a></sup>', "a&nbsp;b<br>c"];
  for (const h of ok) assert.equal(sanitizeInline(h), h);
  const bad = ["<script>alert(1)</script>", '<a href="javascript:alert(1)">x</a>', '<a href="java&#115;cript:x">x</a>', '<img src=x onerror="alert(1)">',
    '<b onclick="x()">x</b>', "<div>x</div>", "<b>x", "x</b>", "<!-- x -->", '<span style="background:url(x)">x</span>', "<svg><script>x</script></svg>", "a < b"];
  for (const h of bad) assert.throws(() => sanitizeInline(h), InvalidHtml, h);
});

/* ---------- sessió i Google ---------- */

test("sessió xifrada: vàlida, manipulada, amb una altra clau i caducada", async () => {
  const t = await seal({ a: 1, at: "secret-token", exp: Math.floor(Date.now() / 1000) + 60 }, SECRET);
  assert.equal((await unseal(t, SECRET)).a, 1);
  assert.ok(!t.includes("secret"), "el token d'Identity no es veu a la galeta");
  const flipped = t.slice(0, 30) + (t[30] === "A" ? "B" : "A") + t.slice(31);
  assert.equal(await unseal(flipped, SECRET), null);
  assert.equal(await unseal(t, "y".repeat(40)), null);
  const old = await seal({ a: 1, exp: Math.floor(Date.now() / 1000) - 1 }, SECRET);
  assert.equal(await unseal(old, SECRET), null);
});

/* Netlify Identity de mentida: /user torna l'usuari del token; /token renova; Git Gateway no s'usa aquí. */
function fakeIdentity() {
  const exp = s => b64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256" }))) + "." + b64url(new TextEncoder().encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + s }))) + ".sig";
  const users = {
    [exp(3600) + "a"]: { id: "u1", email: "Editor@example.com", confirmed_at: "2026-01-01", app_metadata: { roles: ["editor"] }, user_metadata: { full_name: "Editor", avatar_url: "https://lh3.googleusercontent.com/x" } },
    [exp(3600) + "b"]: { id: "u2", email: "altre@example.com", confirmed_at: "2026-01-01", user_metadata: {} },
    [exp(60) + "c"]: { id: "u1", email: "editor@example.com", confirmed_at: "2026-01-01", app_metadata: { roles: ["editor"] }, user_metadata: {} },
    [exp(3600) + "d"]: { id: "u1", email: "editor@example.com", confirmed_at: "2026-01-01", app_metadata: {}, user_metadata: {} }
  };
  const tokens = Object.keys(users);
  const calls = [];
  const used = new Set();
  const fetchImpl = async (url, opts = {}) => {
    calls.push(url);
    if (url.endsWith("/user")) {
      const u = users[(opts.headers?.authorization || "").replace("Bearer ", "")];
      return u ? new Response(JSON.stringify(u)) : new Response("{}", { status: 401 });
    }
    if (url.endsWith("/token")) {
      // r1 (el de l'URL) → un token a punt de caducar; r2 → un de bo. Cada refresh token només serveix un cop.
      const m = /refresh_token=(r\d)/.exec(opts.body || "");
      if (!m || used.has(m[1])) return new Response("{}", { status: 400 });
      used.add(m[1]);
      if (m[1] === "r1") return new Response(JSON.stringify({ access_token: tokens[2], refresh_token: "r2" }));
      if (m[1] === "r2") return new Response(JSON.stringify({ access_token: tokens[0], refresh_token: "r3" }));
      if (m[1] === "r3") return new Response(JSON.stringify({ access_token: tokens[0], refresh_token: "r4" }));
      return new Response("{}", { status: 400 });
    }
    if (url.endsWith("/logout")) return new Response(null, { status: 204 });
    return new Response("{}", { status: 404 });
  };
  return { fetchImpl, good: tokens[0], other: tokens[1], expiring: tokens[2], calls, users };
}

test("Identity: només val un token que Identity reconegui", async () => {
  const id = fakeIdentity();
  const u = await identityUser(id.good, { identityUrl: "https://site.test/.netlify/identity", fetchImpl: id.fetchImpl });
  assert.equal(u.id, "u1");
  await assert.rejects(identityUser("x".repeat(40), { identityUrl: "https://site.test/.netlify/identity", fetchImpl: id.fetchImpl }), AuthError);
  await assert.rejects(identityUser(undefined, { identityUrl: "https://site.test/.netlify/identity", fetchImpl: id.fetchImpl }), AuthError);
});

/* ---------- API ---------- */

function apiKit(env = {}) {
  const { dir, repo } = tmpRepo();
  const id = fakeIdentity();
  const E = { CMS_ALLOWED_EMAILS: "editor@example.com", CMS_SESSION_SECRET: SECRET, CMS_ORIGIN: "https://site.test", ...env };
  const seen = [];
  const handle = createHandler({ env: E, getRepo: s => { seen.push(s.at); return repo; }, fetchImpl: id.fetchImpl, log: { warn() {}, error() {} } });
  let jar = {};
  async function call(route, body = {}, { origin = "https://site.test", headers = {} } = {}) {
    const res = await handle(new Request(`https://site.test/api/cms/${route}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ib-cms": "1", origin, cookie: Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; "), ...headers },
      body: JSON.stringify(body)
    }));
    for (const c of res.headers.getSetCookie()) {
      const [kv] = c.split(";"); const k = kv.slice(0, kv.indexOf("=")); const v = kv.slice(kv.indexOf("=") + 1);
      if (/Max-Age=0/.test(c)) delete jar[k]; else jar[k] = v;
    }
    return { status: res.status, body: await res.json(), res };
  }
  const login = (token = id.good, rt = "r1") => call("login", { access_token: token, refresh_token: rt });
  return { dir, repo, call, login, id, seen, jar: () => jar, handleEnv: E };
}

test("API: sense sessió, d'un altre origen o sense capçalera, no s'hi entra", async () => {
  const k = apiKit();
  assert.equal((await k.call("pages")).status, 401);
  assert.equal((await k.call("config", {}, { origin: "https://evil.test" })).status, 403);
  assert.equal((await k.call("config", {}, { headers: { "x-ib-cms": "" } })).status, 403);
  assert.equal((await k.call("config", {}, { headers: { "sec-fetch-site": "cross-site" } })).status, 403);
  assert.equal((await k.call("config", {}, { headers: { "content-type": "text/plain" } })).status, 403);
});

test("API: login només per al compte autoritzat, i la galeta és segura", async () => {
  const k = apiKit();
  assert.equal((await k.login("fals".repeat(10))).status, 401);
  assert.equal((await k.login(k.id.other)).status, 403);
  assert.equal((await k.login(Object.keys(k.id.users)[3])).status, 403, "el correu bo sense el rol editor no entra");
  assert.equal(k.jar()[SESSION_COOKIE], undefined);
  const ok = await k.login();
  assert.equal(ok.status, 200);
  assert.equal(ok.body.me.email, "editor@example.com");
  const sc = ok.res.headers.getSetCookie().find(c => c.startsWith(SESSION_COOKIE));
  assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /SameSite=Strict/);
  assert.ok(!sc.includes(k.id.good.split(".")[0]), "el token d'Identity viatja xifrat");
  assert.equal((await k.call("pages")).status, 200);
  assert.equal(k.seen.at(-1), k.id.good, "el repositori rep el token d'Identity renovat (Git Gateway)");
  assert.equal((await k.login()).status, 401, "el refresh token que ha passat per l'URL ja no serveix");
  assert.equal((await k.call("logout")).status, 200);
  assert.equal((await k.call("pages")).status, 401);
});

test("API: el token d'Identity es renova sol abans que caduqui", async () => {
  const k = apiKit();
  assert.equal((await k.login(k.id.good, "r1")).status, 200); // en entrar ja es renova (r1 → token curt + r2)
  const r = await k.call("pages"); // el token curt es renova sol (r2 → bo)
  assert.equal(r.status, 200);
  assert.equal(k.seen.at(-1), k.id.good, "s'ha fet servir el token renovat");
  assert.ok(r.res.headers.getSetCookie().some(c => c.startsWith(SESSION_COOKIE)), "la galeta s'ha tornat a escriure");
});

test("API: si es treu el correu de la llista, la sessió deixa de valer", async () => {
  const k = apiKit();
  await k.login();
  const k2 = createHandler({ env: { ...k.handleEnv, CMS_ALLOWED_EMAILS: "una-altra@example.com" }, getRepo: () => k.repo, fetchImpl: k.id.fetchImpl });
  const res = await k2(new Request("https://site.test/api/cms/pages", { method: "POST", headers: { "content-type": "application/json", "x-ib-cms": "1", origin: "https://site.test", cookie: `${SESSION_COOKIE}=${k.jar()[SESSION_COOKIE]}` }, body: "{}" }));
  assert.equal(res.status, 401);
});

test("Git Gateway: llegeix fitxers encara que torni el JSON de GitHub en lloc del fitxer cru", async () => {
  const content = "<p>Hola, món</p>\n";
  const fetchImpl = async url => {
    assert.ok(url.startsWith("https://site.test/.netlify/git/github/contents/web/index.html?ref="));
    return new Response(JSON.stringify({ type: "file", path: "web/index.html", sha: "abc", encoding: "base64", content: Buffer.from(content).toString("base64") }), { headers: { "content-type": "application/json" } });
  };
  const r = githubRepo({ token: "jwt", base: "https://site.test/.netlify/git/github", fetchImpl });
  assert.equal(await r.readFile("web/index.html", "sha1"), content);
  const raw = githubRepo({ token: "jwt", base: "https://x", fetchImpl: async () => new Response('[{"slug":"a"}]', { headers: { "content-type": "application/vnd.github.raw+json" } }) });
  assert.equal(await raw.readFile("web/articles.json", "s"), '[{"slug":"a"}]');
});

/* ---------- desar i combinar ---------- */

test("desar: canvia només el paràgraf editat, sense tocar res més del fitxer", async () => {
  const { dir, repo } = tmpRepo();
  const file = path.join(dir, `web/articles/${SLUG}/index.html`);
  const before = fs.readFileSync(file, "utf8");
  const p = await loadPage(repo, `articles/${SLUG}/`);
  const b = p.blocks.find(x => x.tag === "p" && x.html.length > 100);
  const to = b.html.replace(/^([^<]{3})/, "$1 [editat]");
  const r = await savePage(repo, { page: `articles/${SLUG}/`, edits: [{ id: b.id, from: b.html, to }] }, { author });
  assert.ok(r.ok && r.commit);
  const after = fs.readFileSync(file, "utf8");
  assert.equal(after, before.replace(b.html, to));
});

test("desar: si Claude Code ha canviat un ALTRE paràgraf entretant, es combinen tots dos", async () => {
  const { dir, repo } = tmpRepo();
  const rel = `web/articles/${SLUG}/index.html`;
  const p = await loadPage(repo, `articles/${SLUG}/`);
  const [b1, b2] = p.blocks.filter(x => x.tag === "p" && x.html.length > 100);
  // Claude Code fa push d'un canvi a b2 i afegeix un paràgraf nou a dalt de tot
  const src = fs.readFileSync(path.join(dir, rel), "utf8");
  repo.externalWrite(rel, src.replace(b2.html, b2.html + " [Claude]").replace("<section class=\"intro col\">", "<section class=\"intro col\">\n  <p>Paràgraf nou de Claude.</p>"));
  const r = await savePage(repo, { page: `articles/${SLUG}/`, edits: [{ id: b1.id, from: b1.html, to: b1.html + " [editor]" }] }, { author });
  assert.ok(r.ok);
  const out = fs.readFileSync(path.join(dir, rel), "utf8");
  assert.ok(out.includes(b1.html + " [editor]"), "hi ha el canvi de l'editor");
  assert.ok(out.includes(b2.html + " [Claude]"), "hi ha el canvi de Claude");
  assert.ok(out.includes("Paràgraf nou de Claude."), "hi ha el paràgraf nou");
});

test("desar: si Claude Code ha canviat EL MATEIX paràgraf, conflicte i no es toca res", async () => {
  const { dir, repo } = tmpRepo();
  const rel = `web/articles/${SLUG}/index.html`;
  const p = await loadPage(repo, `articles/${SLUG}/`);
  const b = p.blocks.find(x => x.tag === "p" && x.html.length > 100);
  const src = fs.readFileSync(path.join(dir, rel), "utf8");
  repo.externalWrite(rel, src.replace(b.html, "Versió de Claude."));
  const mid = fs.readFileSync(path.join(dir, rel), "utf8");
  await assert.rejects(savePage(repo, { page: `articles/${SLUG}/`, edits: [editOf(p, b.id, "Versió de l'editor.")] }, { author }),
    e => e instanceof HttpError && e.status === 409 && e.extra.conflicts[0].theirs.html === "Versió de Claude.");
  assert.equal(fs.readFileSync(path.join(dir, rel), "utf8"), mid);
});

test("desar: si main es mou just abans del commit, es torna a provar", async () => {
  const { repo } = tmpRepo();
  const p = await loadPage(repo, `articles/${SLUG}/`);
  const b = p.blocks[5];
  const real = repo.commit.bind(repo);
  let calls = 0;
  repo.commit = async (args) => { calls++; if (calls === 1) throw new RepoConflict("moved"); return real(args); };
  const r = await savePage(repo, { page: `articles/${SLUG}/`, edits: [{ id: b.id, from: b.html, to: b.html + "." }] }, { author });
  assert.ok(r.ok); assert.equal(calls, 2);
});

test("desar: HTML perillós es rebutja", async () => {
  const { repo } = tmpRepo();
  const p = await loadPage(repo, `articles/${SLUG}/`);
  const b = p.blocks[3];
  await assert.rejects(savePage(repo, { page: `articles/${SLUG}/`, edits: [{ id: b.id, from: b.html, to: '<img src=x onerror="alert(1)">' }] }, { author }),
    e => e instanceof HttpError && e.status === 400);
  await assert.rejects(savePage(repo, { page: "../../etc/passwd", edits: [{ id: 0, from: "", to: "x" }] }, { author }), e => e.status === 400);
});

test("portada: el títol es desa a articles.json i a index.html", async () => {
  const { dir, repo } = tmpRepo();
  const p = await loadPage(repo, "");
  const b = p.blocks.find(x => x.plain && x.tag === "h2");
  const r = await savePage(repo, { page: "", edits: [{ id: b.id, from: b.text, to: "Títol nou & <prova>" }] }, { author });
  assert.ok(r.ok);
  const html = fs.readFileSync(path.join(dir, "web/index.html"), "utf8");
  assert.ok(html.includes("<h2>Títol nou &amp; &lt;prova&gt;</h2>"));
  const cat = JSON.parse(fs.readFileSync(path.join(dir, "web/articles.json"), "utf8"));
  assert.ok(cat.some(a => a.title === "Títol nou & <prova>"));
});

test("comentaris: un fitxer per comentari, es llisten per pàgina i es treuen", async () => {
  const { dir, repo } = tmpRepo();
  const r = await addComment(repo, { page: `articles/${SLUG}/`, quote: "duel de cançons", prefix: "Els convocava a un ", suffix: " (nith", note: "Comprova la font [skip ci]" }, { author });
  assert.match(r.comment.id, /^c-[a-z0-9]{4,16}$/);
  const f = path.join(dir, `cms/comentaris/${SLUG}--${r.comment.id}.json`);
  assert.equal(JSON.parse(fs.readFileSync(f, "utf8")).fitxer, `web/articles/${SLUG}/index.html`);
  await addComment(repo, { page: "", quote: "x", note: "a la portada" }, { author });
  fs.writeFileSync(path.join(dir, `cms/comentaris/${SLUG}--c-trencat1.json`), "{no és json"); // un fitxer trencat no ho atura
  repo.touch("x");
  assert.equal((await loadPage(repo, `articles/${SLUG}/`)).comments.length, 1);
  assert.equal((await loadPage(repo, "")).comments.length, 1);
  await deleteComment(repo, { id: r.comment.id }, { author });
  assert.ok(!fs.existsSync(f));
  assert.equal((await loadPage(repo, `articles/${SLUG}/`)).comments.length, 0);
  assert.equal((await deleteComment(repo, { id: r.comment.id }, { author })).removed, false, "treure'n un que ja no hi és no falla");
  await assert.rejects(addComment(repo, { page: `articles/${SLUG}/`, quote: "x", note: "  " }, { author }), e => e.status === 400);
  await assert.rejects(deleteComment(repo, { id: "../../web/index" }, { author }), e => e.status === 400);
});

test("commits: el text de l'editor no pot fer saltar el desplegament", () => {
  assert.ok(!/\[skip/i.test(safeForCommit("hola [skip ci] i [skip netlify] i [ci skip]")));
  assert.ok(!/\n/.test(safeForCommit("a\nb")));
});

/* Fitxer d'article sintètic per a casos límit */
function synthRepo(body) {
  const { dir, repo } = tmpRepo();
  const rel = `web/articles/${SLUG}/index.html`;
  fs.writeFileSync(path.join(dir, rel), `<!doctype html><html><head><title>x</title></head><body><main>\n${body}\n</main><footer class="ib-foot"><p>peu</p></footer></body></html>`);
  repo.touch(rel);
  return { dir, repo, rel, read: () => fs.readFileSync(path.join(dir, rel), "utf8"), write: s => repo.externalWrite(rel, s) };
}
const editOf = (p, id, to) => {
  const i = p.blocks.findIndex(b => b.id === id), b = p.blocks[i];
  return { id, tag: b.tag, from: b.html, to, prev: p.blocks[i - 1]?.html ?? null, next: p.blocks[i + 1]?.html ?? null, dup: p.blocks.filter(x => x.html === b.html).length > 1 };
};

test("blocs idèntics: l'edició va al de la mateixa posició, encara que Claude n'afegeixi a dalt", async () => {
  const k = synthRepo(`<p>U</p>\n<h2>Repetit</h2>\n<p>A</p>\n<h2>Repetit</h2>\n<p>B</p>`);
  const p = await loadPage(k.repo, `articles/${SLUG}/`);
  const second = p.blocks.filter(b => b.html === "Repetit")[1];
  k.write(k.read().replace("<p>U</p>", "<p>Nou 1</p><p>Nou 2</p><p>U</p>"));
  await savePage(k.repo, { page: `articles/${SLUG}/`, edits: [editOf(p, second.id, "Segon editat")] }, { author });
  assert.match(k.read(), /<h2>Repetit<\/h2>\n<p>A<\/p>\n<h2>Segon editat<\/h2>/);
});

test("blocs idèntics: si Claude ha reescrit el que editaves, conflicte (no s'escriu a l'altre)", async () => {
  const k = synthRepo(`<h2>Repetit</h2>\n<p>A</p>\n<h2>Repetit</h2>\n<p>B</p>`);
  const p = await loadPage(k.repo, `articles/${SLUG}/`);
  const second = p.blocks.filter(b => b.html === "Repetit")[1];
  k.write(k.read().replace(/<h2>Repetit<\/h2>\n<p>B<\/p>/, "<h2>Reescrit per Claude</h2>\n<p>B</p>"));
  const before = k.read();
  await assert.rejects(savePage(k.repo, { page: `articles/${SLUG}/`, edits: [editOf(p, second.id, "Editor")] }, { author }), e => e.status === 409);
  assert.equal(k.read(), before);
});

test("conflicte amb un paràgraf inserit a dalt: «la de GitHub» és el paràgraf que toca, no el del mateix número", async () => {
  const k = synthRepo(`<p>Primer paràgraf de prova amb unes quantes paraules.</p>\n<p>Segon paràgraf que l'editor vol canviar avui mateix.</p>\n<p>Tercer paràgraf i final.</p>`);
  const p = await loadPage(k.repo, `articles/${SLUG}/`);
  k.write(k.read().replace("<p>Primer", "<p>Un paràgraf totalment nou de Claude sobre una altra cosa.</p>\n<p>Primer").replace("l'editor vol canviar avui mateix", "l'editor vol canviar avui mateix, retocat per Claude"));
  await assert.rejects(savePage(k.repo, { page: `articles/${SLUG}/`, edits: [editOf(p, 1, "Versió de l'editor.")] }, { author }),
    e => e.status === 409 && /retocat per Claude/.test(e.extra.conflicts[0].theirs.html));
  // i si el paràgraf ja no existeix, no se'n proposa cap d'aliè
  k.write(k.read().replace(/<p>Segon[^<]*<\/p>/, ""));
  await assert.rejects(savePage(k.repo, { page: `articles/${SLUG}/`, edits: [editOf(p, 1, "Versió de l'editor.")] }, { author }),
    e => e.status === 409 && e.extra.conflicts[0].theirs === null);
});

test("paràgraf buit: es rebutja, no es publica <p></p>", async () => {
  const k = synthRepo(`<p>Hola</p>`);
  const p = await loadPage(k.repo, `articles/${SLUG}/`);
  await assert.rejects(savePage(k.repo, { page: `articles/${SLUG}/`, edits: [editOf(p, 0, "")] }, { author }), e => e.status === 400);
  await assert.rejects(savePage(k.repo, { page: `articles/${SLUG}/`, edits: [editOf(p, 0, "<b> </b>")] }, { author }), e => e.status === 400);
});

test("portada: si Claude ha canviat el títol a articles.json (sense regenerar), conflicte", async () => {
  const { dir, repo } = tmpRepo();
  const p = await loadPage(repo, "");
  const b = p.blocks.find(x => x.plain && x.tag === "h2");
  const cat = JSON.parse(fs.readFileSync(path.join(dir, "web/articles.json"), "utf8"));
  cat.find(a => a.slug === b.slug).title = "TÍTOL NOU DE CLAUDE";
  repo.externalWrite("web/articles.json", JSON.stringify(cat, null, 2) + "\n");
  await assert.rejects(savePage(repo, { page: "", edits: [{ id: b.id, tag: "h2", from: b.text, to: "Editor" }] }, { author }), e => e.status === 409);
  assert.ok(fs.readFileSync(path.join(dir, "web/articles.json"), "utf8").includes("TÍTOL NOU DE CLAUDE"));
});

test("enllaços: cap truc d'entitats per colar javascript:", () => {
  for (const h of ['<a href="javascript&colon;alert(1)">x</a>', '<a href="java&Tab;script:alert(1)">x</a>', '<a href="&#106avascript:alert(1)">x</a>',
    '<a href="data:text/html,x">x</a>', '<a href="//evil.com">x</a>', '<a href="JAVASCRIPT:x">x</a>', '<a href=" javascript:x">x</a>',
    '<span style="position:fixed">x</span>', '<a data-x="1">x</a>', '<a id="a" id="b">x</a>', '<a target="_top">x</a>'])
    assert.throws(() => sanitizeInline(h), InvalidHtml, h);
  for (const h of ['<a href="https://a.com/?a=1&amp;b=2">x</a>', '<a href="../el-nino/">x</a>', '<a href="mailto:a@b.c">m</a>', '<a href="https://x" target="_blank" rel="noopener">x</a>'])
    assert.equal(sanitizeInline(h), h);
});
