/* CMS · seguretat: login amb Google, sessió signada i protecció contra peticions d'altres webs.
   Sense dependències: només Web Crypto (Node 18+ i Netlify Functions).

   - Google: el navegador rep un ID token (JWT RS256) de Google Identity Services. Aquí se'n comprova la
     signatura amb les claus públiques de Google, l'emissor, l'audiència (el nostre client ID), la caducitat,
     el nonce d'un sol ús i que el correu sigui l'autoritzat (CMS_ALLOWED_EMAILS, opcionalment CMS_ALLOWED_SUBS).
   - Sessió: galeta __Host- HttpOnly, Secure, SameSite=Strict, signada amb HMAC-SHA256 (CMS_SESSION_SECRET).
     Canviar CMS_SESSION_VERSION tanca totes les sessions obertes.
   - Cada petició: sessió vàlida + capçalera X-IB-CMS + Origin igual al domini (CMS_ORIGIN). */

const enc = new TextEncoder();
const dec = new TextDecoder();

export const SESSION_COOKIE = "__Host-ib_cms";
export const NONCE_COOKIE = "__Host-ib_cms_n";
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

const keyCache = new Map();
async function hmacKey(secret) {
  if (!secret || secret.length < 32) throw new Error("CMS_SESSION_SECRET ha de tenir com a mínim 32 caràcters.");
  if (!keyCache.has(secret)) {
    keyCache.set(secret, crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]));
  }
  return keyCache.get(secret);
}

/** Galeta signada: base64url(json).base64url(hmac). */
export async function sign(payload, secret) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}
/** Torna el contingut si la signatura és bona i no ha caducat; si no, null. */
export async function verify(token, secret, now = Date.now()) {
  if (typeof token !== "string" || token.length > 4096) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), b64urlDecode(parts[1]), enc.encode(parts[0]));
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(b64urlDecode(parts[0])));
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

/* ---------- Google ---------- */

const GOOGLE_JWKS = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISS = new Set(["accounts.google.com", "https://accounts.google.com"]);
let jwks = { keys: null, until: 0 };

async function googleKeys(fetchImpl, now) {
  if (jwks.keys && jwks.until > now) return jwks.keys;
  const res = await fetchImpl(GOOGLE_JWKS);
  if (!res.ok) throw new Error("No s'han pogut llegir les claus de Google.");
  const { keys } = await res.json();
  const age = /max-age=(\d+)/.exec(res.headers.get("cache-control") || "");
  jwks = { keys, until: now + Math.min(+(age?.[1] || 3600), 6 * 3600) * 1000 };
  return keys;
}
export function _resetGoogleKeys() { jwks = { keys: null, until: 0 }; }

export class AuthError extends Error {}

/** Comprova un ID token de Google. Torna el contingut (sub, email...) o llança AuthError. */
export async function verifyGoogleIdToken(idToken, { clientId, nonce, fetchImpl = fetch, now = Date.now() }) {
  if (!clientId) throw new AuthError("Falta GOOGLE_CLIENT_ID.");
  if (typeof idToken !== "string" || idToken.length > 8192) throw new AuthError("Token no vàlid.");
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new AuthError("Token no vàlid.");
  let header, payload;
  try {
    header = JSON.parse(dec.decode(b64urlDecode(parts[0])));
    payload = JSON.parse(dec.decode(b64urlDecode(parts[1])));
  } catch { throw new AuthError("Token no vàlid."); }
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new AuthError("Algorisme no permès.");
  const keys = await googleKeys(fetchImpl, now);
  let jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) { _resetGoogleKeys(); jwk = (await googleKeys(fetchImpl, now)).find(k => k.kid === header.kid); }
  if (!jwk) throw new AuthError("Clau de Google desconeguda.");
  const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlDecode(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`));
  if (!ok) throw new AuthError("Signatura no vàlida.");
  const t = Math.floor(now / 1000);
  if (!GOOGLE_ISS.has(payload.iss)) throw new AuthError("Emissor no vàlid.");
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(clientId)) throw new AuthError("Audiència no vàlida.");
  if (typeof payload.exp !== "number" || payload.exp + 60 < t) throw new AuthError("El token ha caducat.");
  if (typeof payload.iat === "number" && payload.iat - 300 > t) throw new AuthError("Token del futur.");
  if (payload.email_verified !== true && payload.email_verified !== "true") throw new AuthError("Correu no verificat.");
  if (!nonce || payload.nonce !== nonce) throw new AuthError("Nonce no vàlid. Torna-ho a provar.");
  return payload;
}

/** Només el compte (o comptes) autoritzat. Si CMS_ALLOWED_SUBS hi és, també ha de coincidir l'identificador fix de Google. */
export function isAllowed(payload, env) {
  const emails = String(env.CMS_ALLOWED_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
  const subs = String(env.CMS_ALLOWED_SUBS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!emails.length) return false;
  if (!emails.includes(String(payload.email || "").toLowerCase())) return false;
  if (subs.length && !subs.includes(String(payload.sub))) return false;
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
  const s = await verify(c, env.CMS_SESSION_SECRET);
  if (!s || s.v !== String(env.CMS_SESSION_VERSION || "1")) return null;
  // si s'ha tret el correu de la llista, la sessió deixa de valer a l'instant
  if (!isAllowed(s, env)) return null;
  return s;
}
