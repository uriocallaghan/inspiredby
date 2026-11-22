/* CMS · API HTTP (Request → Response). Totes les rutes són POST amb JSON: així cap service worker ni
   cap memòria cau no les pot guardar, i totes passen pel mateix control d'origen.

   POST /api/cms/config    → com s'entra ({ login: "identity" })
   POST /api/cms/login     → { access_token, refresh_token } de Netlify Identity → galeta de sessió
   POST /api/cms/logout
   POST /api/cms/me        → qui és l'editor (o 401)
   POST /api/cms/pages     → llista de pàgines editables
   POST /api/cms/page      → { page } → blocs, comentaris i últims commits
   POST /api/cms/head      → últim commit de main (per saber si hi ha canvis nous)
   POST /api/cms/save      → { page, edits:[{id, from, to}] }
   POST /api/cms/comment   → { page, quote, prefix, suffix, note }
   POST /api/cms/uncomment → { id } */

import {
  SESSION_COOKIE, SESSION_HOURS, seal, cookie, randomId, identityUser, refreshIdentity, jwtExp,
  isAllowed, checkRequestOrigin, readSession, AuthError
} from "./auth.mjs";
import { listPages, loadPage, headOf, savePage, addComment, deleteComment, HttpError } from "./core.mjs";
import { RepoError } from "./github.mjs";

const REQUIRED = ["CMS_ALLOWED_EMAILS", "CMS_SESSION_SECRET", "CMS_ORIGIN"];

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
  for (const c of cookies) if (c) res.headers.append("set-cookie", c);
  return res;
}
const sessionCookie = async (s, env) => cookie(SESSION_COOKIE, await seal(s, env.CMS_SESSION_SECRET), s.exp - Math.floor(Date.now() / 1000));
const clear = () => cookie(SESSION_COOKIE, "", 0);

/** createHandler({ env, getRepo(session), fetchImpl, identityUrl }) → async (req) => Response */
export function createHandler({ env, getRepo, fetchImpl = fetch, identityUrl, log = console }) {
  const idUrl = identityUrl || `${String(env.CMS_ORIGIN || "").split(",")[0].trim()}/.netlify/identity`;
  const idOpts = { identityUrl: idUrl, fetchImpl };

  return async function handle(req) {
    let renewed = null;
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
      if (route === "config") return json(200, { login: "identity" });
      if (route === "login") {
        // un login fallit no toca la sessió que ja hi hagi (un enllaç maliciós no pot fer fora l'editor)
        let u;
        try { u = await identityUser(body.access_token, idOpts); }
        catch (err) { if (err instanceof AuthError) return json(401, { error: err.message }); throw err; }
        const md = u.user_metadata && typeof u.user_metadata === "object" ? u.user_metadata : {};
        const me = {
          sub: String(u.id).slice(0, 80), email: String(u.email).toLowerCase().slice(0, 200),
          name: String(md.full_name || md.name || u.email).slice(0, 80),
          picture: /^https:\/\/[^\s"'<>]{1,400}$/.test(md.avatar_url || "") ? md.avatar_url : ""
        };
        // a més del correu, cal el rol de Netlify Identity (per defecte «editor»; CMS_REQUIRED_ROLE= el desactiva)
        const role = env.CMS_REQUIRED_ROLE === undefined ? "editor" : String(env.CMS_REQUIRED_ROLE);
        const roles = Array.isArray(u.app_metadata?.roles) ? u.app_metadata.roles : [];
        if (!isAllowed(me, env) || (role && !roles.includes(role))) {
          log.warn?.(`CMS: intent de login denegat (${me.email.replace(/(.).*@/, "$1…@")})`);
          return json(403, { error: "Aquest compte no té permís per editar." });
        }
        if (typeof body.refresh_token !== "string" || !body.refresh_token || body.refresh_token.length > 512) return json(400, { error: "Falta el refresh token." });
        // es renoven els tokens tot d'una: els que han passat per l'URL (i l'historial del navegador) deixen de valer
        let tokens;
        try { tokens = await refreshIdentity(body.refresh_token, idOpts); }
        catch (err) { if (err instanceof AuthError) return json(401, { error: err.message }); throw err; }
        const now = Math.floor(Date.now() / 1000);
        const session = { ...me, iat: now, exp: now + SESSION_HOURS * 3600, v: String(env.CMS_SESSION_VERSION || "1"), sid: randomId(9), ...tokens };
        return withCookies(json(200, { me: { name: me.name, email: me.email, picture: me.picture } }), [await sessionCookie(session, env)]);
      }
      if (route === "logout") {
        // es revoca també el refresh token d'Identity (si no, continuaria servint fins que caduqués)
        const s = await readSession(req, env);
        if (s?.at) { try { await fetchImpl(`${idUrl}/logout`, { method: "POST", headers: { authorization: `Bearer ${s.at}` } }); } catch {} }
        return withCookies(json(200, { ok: true }), [clear()]);
      }

      /* ---------- amb sessió ---------- */
      const session = await readSession(req, env);
      if (!session) return withCookies(json(401, { error: "Cal iniciar la sessió." }), [clear()]);
      if (route === "me") return json(200, { me: { name: session.name, email: session.email, picture: session.picture } });

      // el token d'Identity dura una hora: es renova abans que caduqui i la galeta es torna a escriure
      renewed = null;
      if (session.rt && jwtExp(session.at) - Math.floor(Date.now() / 1000) < 300) {
        try { Object.assign(session, await refreshIdentity(session.rt, idOpts)); renewed = await sessionCookie(session, env); }
        catch (err) {
          // dues peticions alhora (o dues pestanyes) poden renovar el mateix token: si el vell encara val, es continua
          if (!(err instanceof AuthError)) throw err;
          if (jwtExp(session.at) - Math.floor(Date.now() / 1000) < 30) return withCookies(json(401, { error: err.message }), [clear()]);
        }
      }
      const repo = getRepo(session);
      const author = { name: "Editor (CMS)", email: env.CMS_COMMIT_EMAIL || "cms@inspiredbymagazine.com" };
      let out;
      switch (route) {
        case "pages": out = await listPages(repo); break;
        case "page": out = await loadPage(repo, body.page); break;
        case "head": out = await headOf(repo); break;
        case "save": out = await savePage(repo, body, { author }); break;
        case "comment": out = await addComment(repo, body, { author }); break;
        case "uncomment": out = await deleteComment(repo, body, { author }); break;
        default: return json(404, { error: "Ruta desconeguda." });
      }
      return withCookies(json(200, out), [renewed]);
    } catch (err) {
      // la galeta renovada s'envia també amb els errors: el refresh token vell ja no val
      if (err instanceof HttpError) return withCookies(json(err.status, { error: err.message, ...(err.extra || {}) }), [renewed]);
      if (err instanceof RepoError) { log.error?.(err); return withCookies(json(502, { error: "No s'ha pogut parlar amb GitHub. Torna-ho a provar." }), [renewed]); }
      log.error?.(err);
      return withCookies(json(500, { error: "Error inesperat." }), [renewed]);
    }
  };
}
