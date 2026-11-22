/* CMS · API HTTP (Request → Response). Totes les rutes són POST amb JSON: així cap service worker ni
   cap memòria cau no les pot guardar, i totes passen pel mateix control d'origen.

   POST /api/cms/nonce     → nonce d'un sol ús per al login (galeta signada, 10 min)
   POST /api/cms/login     → { credential } de Google → galeta de sessió
   POST /api/cms/logout
   POST /api/cms/me        → qui és l'editor (o 401)
   POST /api/cms/pages     → llista de pàgines editables
   POST /api/cms/page      → { page } → blocs, comentaris i últim commit
   POST /api/cms/head      → últim commit de main (per saber si hi ha canvis nous)
   POST /api/cms/save      → { page, edits:[{id, from, to}] }
   POST /api/cms/comment   → { page, quote, prefix, suffix, note }
   POST /api/cms/uncomment → { id } */

import {
  SESSION_COOKIE, NONCE_COOKIE, SESSION_HOURS, sign, verify, cookie, parseCookies, randomId,
  verifyGoogleIdToken, isAllowed, checkRequestOrigin, readSession, AuthError
} from "./auth.mjs";
import { listPages, loadPage, headOf, savePage, addComment, deleteComment, HttpError } from "./core.mjs";
import { RepoError } from "./github.mjs";

const REQUIRED = ["GOOGLE_CLIENT_ID", "CMS_ALLOWED_EMAILS", "CMS_SESSION_SECRET", "CMS_ORIGIN"];

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex",
      ...headers
    }
  });
}
function withCookies(res, cookies) {
  for (const c of cookies) res.headers.append("set-cookie", c);
  return res;
}

/** createHandler({ env, getRepo, fetchImpl }) → async (req) => Response */
export function createHandler({ env, getRepo, fetchImpl = fetch, log = console }) {
  return async function handle(req) {
    try {
      const missing = REQUIRED.filter(k => !env[k]);
      if (missing.length) return json(500, { error: `Falta configurar: ${missing.join(", ")}.` });
      if (req.method !== "POST") return json(405, { error: "Només POST." }, { allow: "POST" });
      const bad = checkRequestOrigin(req, env);
      if (bad) return json(403, { error: bad });

      const route = new URL(req.url).pathname.replace(/^\/api\/cms\/?/, "").replace(/\/$/, "");
      const text = await req.text();
      if (text.length > 600_000) return json(413, { error: "Petició massa gran." });
      let body = {};
      if (text) { try { body = JSON.parse(text); } catch { return json(400, { error: "JSON no vàlid." }); } }
      if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "JSON no vàlid." });

      /* ---------- sense sessió ---------- */
      if (route === "nonce") {
        const nonce = randomId(18);
        const signed = await sign({ n: nonce, exp: Math.floor(Date.now() / 1000) + 600 }, env.CMS_SESSION_SECRET);
        return withCookies(json(200, { nonce, clientId: env.GOOGLE_CLIENT_ID }), [cookie(NONCE_COOKIE, signed, 600)]);
      }
      if (route === "login") {
        const nc = await verify(parseCookies(req.headers.get("cookie"))[NONCE_COOKIE], env.CMS_SESSION_SECRET);
        if (!nc) return json(401, { error: "La sessió de login ha caducat. Torna-ho a provar." });
        let g;
        try {
          g = await verifyGoogleIdToken(body.credential, { clientId: env.GOOGLE_CLIENT_ID, nonce: nc.n, fetchImpl });
        } catch (err) {
          if (err instanceof AuthError) return withCookies(json(401, { error: err.message }), [cookie(NONCE_COOKIE, "", 0)]);
          throw err;
        }
        if (!isAllowed(g, env)) {
          log.warn?.(`CMS: intent de login denegat (${String(g.email).replace(/(.).*@/, "$1…@")})`);
          return withCookies(json(403, { error: "Aquest compte no té permís per editar." }), [cookie(NONCE_COOKIE, "", 0)]);
        }
        const now = Math.floor(Date.now() / 1000);
        const session = {
          sub: String(g.sub), email: String(g.email).toLowerCase(), name: String(g.name || g.email), picture: String(g.picture || ""),
          iat: now, exp: now + SESSION_HOURS * 3600, v: String(env.CMS_SESSION_VERSION || "1"), sid: randomId(9)
        };
        const token = await sign(session, env.CMS_SESSION_SECRET);
        return withCookies(json(200, { me: { name: session.name, email: session.email, picture: session.picture } }),
          [cookie(SESSION_COOKIE, token, SESSION_HOURS * 3600), cookie(NONCE_COOKIE, "", 0)]);
      }
      if (route === "logout") {
        return withCookies(json(200, { ok: true }), [cookie(SESSION_COOKIE, "", 0)]);
      }

      /* ---------- amb sessió ---------- */
      const me = await readSession(req, env);
      if (!me) return withCookies(json(401, { error: "Cal iniciar la sessió." }), [cookie(SESSION_COOKIE, "", 0)]);
      if (route === "me") return json(200, { me: { name: me.name, email: me.email, picture: me.picture } });

      const repo = getRepo();
      const author = { name: "Editor (CMS)", email: env.CMS_COMMIT_EMAIL || "cms@inspiredbymagazine.com" };
      switch (route) {
        case "pages": return json(200, await listPages(repo));
        case "page": return json(200, await loadPage(repo, body.page));
        case "head": return json(200, await headOf(repo));
        case "save": return json(200, await savePage(repo, body, { author }));
        case "comment": return json(200, await addComment(repo, body, { author }));
        case "uncomment": return json(200, await deleteComment(repo, body, { author }));
        default: return json(404, { error: "Ruta desconeguda." });
      }
    } catch (err) {
      if (err instanceof HttpError) return json(err.status, { error: err.message, ...(err.extra || {}) });
      if (err instanceof RepoError) { log.error?.(err); return json(502, { error: "No s'ha pogut parlar amb GitHub. Torna-ho a provar." }); }
      log.error?.(err);
      return json(500, { error: "Error inesperat." });
    }
  };
}
