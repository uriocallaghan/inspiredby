/* CMS · seguretat: login amb Netlify Identity (Google), sessió xifrada i protecció contra peticions d'altres webs.
   Sense dependències: només Web Crypto (Node 18+ i Netlify Functions).

   - Login: Netlify Identity amb Google (credencials de Google de Netlify: no cal Google Cloud). El navegador
     torna amb un access token d'Identity; el servidor el comprova preguntant-li a Identity qui és (/user)
     i només deixa entrar els correus de CMS_ALLOWED_EMAILS (opcionalment, també l'id fix de CMS_ALLOWED_SUBS).
   - Sessió: galeta __Host- HttpOnly, Secure, SameSite=Strict, XIFRADA amb AES-256-GCM (clau derivada de
     CMS_SESSION_SECRET). Hi viu el token d'Identity, que serveix per escriure a GitHub a través de Git Gateway;
     el JavaScript de la pàgina no el pot llegir. Canviar CMS_SESSION_VERSION tanca totes les sessions.
   - Cada petició: sessió vàlida + capçalera X-IB-CMS + Origin igual al domini (CMS_ORIGIN). */

const enc = new TextEncoder();
const dec = new TextDecoder();

export const SESSION_COOKIE = "__Host-ib_cms";
export const SESSION_HOURS = 12;

export function b64url(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function b64urlDecode(str) {
  if (typeof str !== "string" || !/^[A-Za-z0-9_-]*$/.test(str)) throw new Error("base64url no vàlid");
  const s = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export function randomId(bytes = 16) {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

/* ---------- sessió xifrada ---------- */

const keyCache = new Map();
async function aesKey(secret) {
  if (!secret || secret.length < 32) throw new Error("CMS_SESSION_SECRET ha de tenir com a mínim 32 caràcters.");
  if (!keyCache.has(secret)) {
    keyCache.set(secret, (async () => {
      const raw = await crypto.subtle.digest("SHA-256", enc.encode("ib-cms-session:" + secret));
      return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    })());
  }
  return keyCache.get(secret);
}

/** Xifra i autentica: base64url(iv | xifrat+etiqueta). */
export async function seal(payload, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secret), enc.encode(JSON.stringify(payload))));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv); out.set(ct, iv.length);
  return b64url(out);
}
/** Torna el contingut si és autèntic i no ha caducat; si no, null. */
export async function unseal(token, secret, now = Date.now()) {
  if (typeof token !== "string" || token.length < 40 || token.length > 3800) return null;
  try {
    const bytes = b64urlDecode(token);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.slice(0, 12) }, await aesKey(secret), bytes.slice(12));
    const payload = JSON.parse(dec.decode(pt));
    if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header) {
  const out = {};
  for (const part of String(header || "").split(";")) {
    const k = part.indexOf("=");
    if (k < 0) continue;
    const name = part.slice(0, k).trim();
    if (name && !(name in out)) out[name] = part.slice(k + 1).trim();
  }
  return out;
}
export function cookie(name, value, maxAgeSeconds) {
  return `${name}=${value}; Path=/; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}; HttpOnly; Secure; SameSite=Strict`;
}

/* ---------- Netlify Identity ---------- */

export class AuthError extends Error {}

/** Caducitat (segons) d'un JWT, sense comprovar-ne la signatura (només per saber quan renovar-lo). */
export function jwtExp(token) {
  try { return JSON.parse(dec.decode(b64urlDecode(String(token).split(".")[1]))).exp || 0; } catch { return 0; }
}

/** Pregunta a Netlify Identity de qui és el token. Si el token és fals o ha caducat, Identity respon 401. */
export async function identityUser(accessToken, { identityUrl, fetchImpl = fetch }) {
  if (typeof accessToken !== "string" || accessToken.length < 20 || accessToken.length > 4096) throw new AuthError("Token no vàlid.");
  const res = await fetchImpl(`${identityUrl}/user`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (res.status === 401 || res.status === 403) throw new AuthError("La sessió de Netlify no és vàlida. Torna a entrar.");
  if (!res.ok) throw new Error(`Identity ${res.status}`);
  const u = await res.json();
  if (!u || !u.id || !u.email) throw new AuthError("Usuari no vàlid.");
  if (!u.confirmed_at) throw new AuthError("Aquest compte encara no està confirmat.");
  return u;
}

/** Renova el token d'Identity (dura una hora) amb el refresh token. */
export async function refreshIdentity(refreshToken, { identityUrl, fetchImpl = fetch }) {
  const res = await fetchImpl(`${identityUrl}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`
  });
  if (!res.ok) throw new AuthError("La sessió de Netlify ha caducat. Torna a entrar.");
  const t = await res.json();
  if (!t.access_token) throw new AuthError("La sessió de Netlify ha caducat. Torna a entrar.");
  return { at: t.access_token, rt: t.refresh_token || refreshToken };
}

/** Només el compte (o comptes) autoritzat. */
export function isAllowed(user, env) {
  const emails = String(env.CMS_ALLOWED_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
  const subs = String(env.CMS_ALLOWED_SUBS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!emails.length) return false;
  if (!emails.includes(String(user.email || "").toLowerCase())) return false;
  if (subs.length && !subs.includes(String(user.sub || user.id))) return false;
  return true;
}

/* ---------- peticions ---------- */

/** Rebutja peticions que no vinguin del mateix domini (CSRF) o que no siguin JSON de l'editor. */
export function checkRequestOrigin(req, env) {
  const origin = req.headers.get("origin");
  const allowed = String(env.CMS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!allowed.length) return "Falta CMS_ORIGIN.";
  if (!origin || !allowed.includes(origin)) return "Origen no permès.";
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return "Origen no permès.";
  if (req.headers.get("x-ib-cms") !== "1") return "Falta la capçalera de l'editor.";
  if (!/^application\/json\b/.test(req.headers.get("content-type") || "")) return "Cal JSON.";
  return null;
}

export async function readSession(req, env) {
  const c = parseCookies(req.headers.get("cookie"))[SESSION_COOKIE];
  if (!c) return null;
  const s = await unseal(c, env.CMS_SESSION_SECRET);
  if (!s || s.v !== String(env.CMS_SESSION_VERSION || "1")) return null;
  // si s'ha tret el correu de la llista, la sessió deixa de valer a l'instant
  if (!isAllowed(s, env)) return null;
  return s;
}
