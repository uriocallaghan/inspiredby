/* Netlify Function: l'API del CMS (/api/cms/*). Tota la lògica és a cms/lib/. */
import { createHandler } from "../../cms/lib/handler.mjs";
import { githubRepo } from "../../cms/lib/github.mjs";

const env = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CMS_ALLOWED_EMAILS: process.env.CMS_ALLOWED_EMAILS,
  CMS_ALLOWED_SUBS: process.env.CMS_ALLOWED_SUBS,
  CMS_SESSION_SECRET: process.env.CMS_SESSION_SECRET,
  CMS_SESSION_VERSION: process.env.CMS_SESSION_VERSION,
  CMS_ORIGIN: process.env.CMS_ORIGIN || "https://inspiredbymagazine.com",
  CMS_COMMIT_EMAIL: process.env.CMS_COMMIT_EMAIL
};

const handle = createHandler({
  env,
  getRepo: () => githubRepo({
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO || "uriocallaghan/inspiredby",
    branch: process.env.GITHUB_BRANCH || "main"
  })
});

export default handle;
export const config = { path: "/api/cms/*" };
