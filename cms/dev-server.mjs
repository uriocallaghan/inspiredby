/* CMS · servidor local per provar l'editor sense tocar GitHub.
   node cms/dev-server.mjs [port]
   Copia web/ i cms/comentaris.json a una carpeta temporal i hi fa els «commits»: el repositori real no es toca.
   El login de Netlify Identity se substitueix per un botó «Entra (mode local)» que només existeix aquí. */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHandler } from "./lib/handler.mjs";
import { fsRepo } from "./lib/fsrepo.mjs";
import { seal, cookie, SESSION_COOKIE, randomId } from "./lib/auth.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = +(process.argv[2] || process.env.PORT || 8788);
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "ibcms-dev-"));
fs.cpSync(path.join(ROOT, "web"), path.join(DIR, "web"), { recursive: true });
fs.mkdirSync(path.join(DIR, "cms"), { recursive: true });
const cf = path.join(ROOT, "cms/comentaris.json");
if (fs.existsSync(cf)) fs.copyFileSync(cf, path.join(DIR, "cms/comentaris.json"));

const repo = fsRepo(DIR);
// si algú toca la còpia a mà (p. ex. node scripts/comentaris.mjs --dir …), és com un push nou
fs.watch(DIR, { recursive: true }, (_, f) => { if (f && /\.(html|json)$/.test(f)) repo.touch(f.split(path.sep).join("/")); });
const env = {
  CMS_ALLOWED_EMAILS: "editor@localhost",
  CMS_SESSION_SECRET: randomId(32),
  CMS_ORIGIN: `http://localhost:${PORT},http://127.0.0.1:${PORT}`
};
const handle = createHandler({ env, getRepo: () => repo });

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".csv": "text/csv", ".geojson": "application/json", ".bin": "application/octet-stream" };
// mateixes capçaleres que web/netlify.toml posa a /admin/*
const ADMIN_HEADERS = {
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-src 'self'; connect-src 'self'; img-src 'self' data: https:; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "x-frame-options": "DENY", "referrer-policy": "same-origin", "cross-origin-opener-policy": "same-origin", "x-robots-tag": "noindex, nofollow", "cache-control": "no-store"
};

const frozen = new Map();
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/cms/dev-login" && req.method === "POST") {
    const now = Math.floor(Date.now() / 1000);
    const token = await seal({ sub: "dev", email: "editor@localhost", name: "Editor (local)", picture: "", iat: now, exp: now + 43200, v: "1", sid: randomId(6) }, env.CMS_SESSION_SECRET);
    res.writeHead(200, { "set-cookie": cookie(SESSION_COOKIE, token, 43200), "content-type": "application/json" });
    return res.end("{}");
  }
  // proves: «congela» la versió publicada d'una pàgina, com quan Netlify encara no ha publicat l'últim commit
  if (url.pathname === "/api/cms/dev-freeze" && req.method === "POST") {
    const rel = (url.searchParams.get("path") || "/").replace(/\/?$/, "/") + "index.html";
    const f = path.join(DIR, "web", rel);
    if (fs.existsSync(f)) frozen.set(rel, fs.readFileSync(f));
    res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ frozen: [...frozen.keys()] }));
  }
  if (url.pathname === "/api/cms/config") { res.writeHead(200, { "content-type": "application/json" }); return res.end('{"login":"dev"}'); }
  if (url.pathname.startsWith("/api/cms/")) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const r = await handle(new Request(url, { method: req.method, headers: req.headers, body: req.method === "POST" ? Buffer.concat(chunks) : undefined }));
    const h = {};
    r.headers.forEach((v, k) => { if (k !== "set-cookie") h[k] = v; });
    const sc = r.headers.getSetCookie();
    if (sc.length) h["set-cookie"] = sc;
    res.writeHead(r.status, h);
    return res.end(Buffer.from(await r.arrayBuffer()));
  }
  let p = decodeURIComponent(url.pathname);
  const sh = /^\/articles\/([a-z0-9-]+)\/admin\/?$/.exec(p);
  if (sh) { res.writeHead(302, { location: `/admin/#articles/${sh[1]}/` }); return res.end(); }
  if (p.endsWith("/")) p += "index.html";
  // el codi de l'editor i els actius es llegeixen en directe del repositori; el contingut, de la còpia
  const base = /^\/(admin|assets)\//.test(p) ? path.join(ROOT, "web") : path.join(DIR, "web");
  const file = path.join(base, p);
  if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { res.writeHead(301, { location: url.pathname + "/" }); return res.end(); }
    res.writeHead(404); return res.end("404");
  }
  const headers = { "content-type": TYPES[path.extname(file)] || "application/octet-stream", "cache-control": "no-cache" };
  if (frozen.has(p)) { res.writeHead(200, headers); return res.end(frozen.get(p)); }
  if (url.pathname.startsWith("/admin")) Object.assign(headers, ADMIN_HEADERS);
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Editor local: http://localhost:${PORT}/admin/`);
  console.log(`Còpia de treball (els «commits» van aquí): ${DIR}`);
});
