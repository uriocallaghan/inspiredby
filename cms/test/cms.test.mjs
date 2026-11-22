/* Proves del CMS: node --test cms/test/ */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { articleBlocks, homeBlocks, sanitizeInline, InvalidHtml } from "../lib/html.mjs";
import { sign, verify, b64url, verifyGoogleIdToken, _resetGoogleKeys, AuthError, SESSION_COOKIE, NONCE_COOKIE } from "../lib/auth.mjs";
import { fsRepo } from "../lib/fsrepo.mjs";
import { savePage, loadPage, addComment, deleteComment, HttpError } from "../lib/core.mjs";
import { createHandler } from "../lib/handler.mjs";
import { RepoConflict } from "../lib/github.mjs";

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
  const ok = ['Text <b>fort</b> i <i lang="en">cursiva</i>', 'Nota<sup class="nr"><a href="#font-1" id="c1" data-c="u1">1</a></sup>', "a&nbsp;b<br>c"];
  for (const h of ok) assert.equal(sanitizeInline(h), h);
  const bad = ["<script>alert(1)</script>", '<a href="javascript:alert(1)">x</a>', '<a href="java&#115;cript:x">x</a>', '<img src=x onerror="alert(1)">',
    '<b onclick="x()">x</b>', "<div>x</div>", "<b>x", "x</b>", "<!-- x -->", '<span style="background:url(x)">x</span>', "<svg><script>x</script></svg>", "a < b"];
  for (const h of bad) assert.throws(() => sanitizeInline(h), InvalidHtml, h);
});

/* ---------- sessió i Google ---------- */

test("sessió signada: vàlida, manipulada i caducada", async () => {
  const t = await sign({ a: 1, exp: Math.floor(Date.now() / 1000) + 60 }, SECRET);
  assert.equal((await verify(t, SECRET)).a, 1);
  assert.equal(await verify(t.replace(/^./, c => (c === "e" ? "f" : "e")), SECRET), null);
  assert.equal(await verify(t, "y".repeat(40)), null);
  const old = await sign({ a: 1, exp: Math.floor(Date.now() / 1000) - 1 }, SECRET);
  assert.equal(await verify(old, SECRET), null);
});

async function googleKit() {
  const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1", use: "sig", alg: "RS256" };
  const fetchImpl = async url => {
    assert.equal(url, "https://www.googleapis.com/oauth2/v3/certs");
    return new Response(JSON.stringify({ keys: [jwk] }), { headers: { "cache-control": "max-age=100" } });
  };
  const enc = new TextEncoder();
  async function token(claims, header = { alg: "RS256", kid: "k1", typ: "JWT" }) {
    const now = Math.floor(Date.now() / 1000);
    const body = { iss: "https://accounts.google.com", aud: "client-1", sub: "111", email: "editor@example.com", email_verified: true, iat: now, exp: now + 600, nonce: "n1", ...claims };
    const data = `${b64url(enc.encode(JSON.stringify(header)))}.${b64url(enc.encode(JSON.stringify(body)))}`;
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, enc.encode(data));
    return `${data}.${b64url(sig)}`;
  }
  return { fetchImpl, token };
}

test("ID token de Google: només si signatura, audiència, emissor, nonce i correu verificat quadren", async () => {
  _resetGoogleKeys();
  const { fetchImpl, token } = await googleKit();
  const opts = { clientId: "client-1", nonce: "n1", fetchImpl };
  assert.equal((await verifyGoogleIdToken(await token({}), opts)).email, "editor@example.com");
  for (const claims of [{ aud: "altre" }, { iss: "https://evil.example" }, { nonce: "n2" }, { email_verified: false }, { exp: 1000 }]) {
    await assert.rejects(verifyGoogleIdToken(await token(claims), opts), AuthError, JSON.stringify(claims));
  }
  await assert.rejects(verifyGoogleIdToken(await token({}, { alg: "none", kid: "k1" }), opts), AuthError);
  const t = await token({});
  const forged = t.split(".").slice(0, 1).join(".") + "." + b64url(new TextEncoder().encode(JSON.stringify({ email: "x" }))) + "." + t.split(".")[2];
  await assert.rejects(verifyGoogleIdToken(forged, opts), AuthError);
});

/* ---------- API ---------- */

function apiKit(env = {}) {
  const { dir, repo } = tmpRepo();
  return googleKit().then(g => {
    _resetGoogleKeys();
    const E = { GOOGLE_CLIENT_ID: "client-1", CMS_ALLOWED_EMAILS: "editor@example.com", CMS_SESSION_SECRET: SECRET, CMS_ORIGIN: "https://site.test", ...env };
    const handle = createHandler({ env: E, getRepo: () => repo, fetchImpl: g.fetchImpl, log: { warn() {}, error() {} } });
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
    async function login(claims = {}) {
      const { nonce } = (await call("nonce")).body;
      return call("login", { credential: await g.token({ nonce, ...claims }) });
    }
    return { dir, repo, call, login, jar: () => jar, token: g.token };
  });
}

test("API: sense sessió, d'un altre origen o sense capçalera, no s'hi entra", async () => {
  const k = await apiKit();
  assert.equal((await k.call("pages")).status, 401);
  assert.equal((await k.call("nonce", {}, { origin: "https://evil.test" })).status, 403);
  assert.equal((await k.call("nonce", {}, { headers: { "x-ib-cms": "" } })).status, 403);
  assert.equal((await k.call("nonce", {}, { headers: { "sec-fetch-site": "cross-site" } })).status, 403);
});

test("API: login només per al compte autoritzat, i la galeta és segura", async () => {
  const k = await apiKit();
  assert.equal((await k.login({ email: "altre@example.com" })).status, 403);
  assert.equal(k.jar()[SESSION_COOKIE], undefined);
  const ok = await k.login();
  assert.equal(ok.status, 200);
  const sc = ok.res.headers.getSetCookie().find(c => c.startsWith(SESSION_COOKIE));
  assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /SameSite=Strict/);
  assert.equal(k.jar()[NONCE_COOKIE], undefined, "el nonce és d'un sol ús");
  assert.equal((await k.call("pages")).status, 200);
  // el mateix token no es pot tornar a fer servir sense un nonce nou
  assert.equal((await k.call("logout")).status, 200);
  assert.equal((await k.call("pages")).status, 401);
});

test("API: si es treu el correu de la llista, la sessió deixa de valer", async () => {
  const k = await apiKit();
  await k.login();
  const k2 = createHandler({ env: { GOOGLE_CLIENT_ID: "client-1", CMS_ALLOWED_EMAILS: "una-altra@example.com", CMS_SESSION_SECRET: SECRET, CMS_ORIGIN: "https://site.test" }, getRepo: () => k.repo });
  const res = await k2(new Request("https://site.test/api/cms/pages", { method: "POST", headers: { "content-type": "application/json", "x-ib-cms": "1", origin: "https://site.test", cookie: `${SESSION_COOKIE}=${k.jar()[SESSION_COOKIE]}` }, body: "{}" }));
  assert.equal(res.status, 401);
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
  await assert.rejects(savePage(repo, { page: `articles/${SLUG}/`, edits: [{ id: b.id, from: b.html, to: "Versió de l'editor." }] }, { author }),
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

test("comentaris: s'afegeixen al fitxer per a l'agent i es treuen", async () => {
  const { dir, repo } = tmpRepo();
  const r = await addComment(repo, { page: `articles/${SLUG}/`, quote: "duel de cançons", prefix: "Els convocava a un ", suffix: " (nith", note: "Comprova la font" }, { author });
  assert.match(r.comment.id, /^c-[a-z0-9]+$/);
  const data = JSON.parse(fs.readFileSync(path.join(dir, "cms/comentaris.json"), "utf8"));
  assert.equal(data.comentaris[0].fitxer, `web/articles/${SLUG}/index.html`);
  const p = await loadPage(repo, `articles/${SLUG}/`);
  assert.equal(p.comments.length, 1);
  await deleteComment(repo, { id: r.comment.id }, { author });
  assert.equal((await loadPage(repo, `articles/${SLUG}/`)).comments.length, 0);
  await assert.rejects(addComment(repo, { page: `articles/${SLUG}/`, quote: "x", note: "" }, { author }), e => e.status === 400);
});
