/* Netlify Function: l'API del CMS (/api/cms/*). Tota la lògica és a cms/lib/.
   Login: Netlify Identity (Google). Escriptura a GitHub: Git Gateway de Netlify amb el token d'Identity
   de l'editor; si algun dia es defineix GITHUB_TOKEN, es fa servir aquest token en lloc de Git Gateway. */
import { createHandler } from "../../cms/lib/handler.mjs";
import { githubRepo } from "../../cms/lib/github.mjs";

const ORIGIN = process.env.CMS_ORIGIN || "https://inspiredbymagazine.com";
const env = {
  CMS_ALLOWED_EMAILS: process.env.CMS_ALLOWED_EMAILS,
  CMS_ALLOWED_SUBS: process.env.CMS_ALLOWED_SUBS,
  CMS_SESSION_SECRET: process.env.CMS_SESSION_SECRET,
  CMS_SESSION_VERSION: process.env.CMS_SESSION_VERSION,
  CMS_ORIGIN: ORIGIN,
  CMS_COMMIT_EMAIL: process.env.CMS_COMMIT_EMAIL
};
const SITE = ORIGIN.split(",")[0].trim();

const handle = createHandler({
  env,
  getRepo: session => process.env.GITHUB_TOKEN
    ? githubRepo({ token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPO || "uriocallaghan/inspiredby", branch: process.env.GITHUB_BRANCH || "main" })
    : githubRepo({ token: session.at, base: `${SITE}/.netlify/git/github`, branch: process.env.GITHUB_BRANCH || "main" })
});

export default handle;
export const config = { path: "/api/cms/*" };
