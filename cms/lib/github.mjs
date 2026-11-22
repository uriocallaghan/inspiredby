/* CMS · el repositori a GitHub (branca main), amb la Git Data API.
   Cada desat és un commit nou sobre l'últim de main. Si main s'ha mogut entretant (Claude Code ha fet push),
   GitHub refusa l'actualització (force: false) i el CMS torna a llegir, a combinar i a provar: mai no
   sobreescriu res que no hagi llegit. Cap token arriba mai al JavaScript del navegador. */

export class RepoConflict extends Error {}
export class RepoError extends Error {}

/** Dues maneres d'arribar al repositori:
    - Git Gateway de Netlify (per defecte): base = https://<domini>/.netlify/git/github, token = el JWT d'Identity
      de l'editor. Netlify hi posa el seu accés a GitHub; ningú no ha de crear cap token de GitHub.
    - Token propi (opcional): base = https://api.github.com/repos/<repo>, token = GITHUB_TOKEN. */
export function githubRepo({ token, repo, base, branch = "main", fetchImpl = fetch }) {
  if (!token) throw new RepoError("Falta el token per escriure a GitHub.");
  if (!base) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo || "")) throw new RepoError("GITHUB_REPO no vàlid.");
    base = `https://api.github.com/repos/${repo}`;
  }

  async function api(path, { method = "GET", body, accept = "application/vnd.github+json" } = {}) {
    const res = await fetchImpl(base + path, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        accept,
        "x-github-api-version": "2022-11-28",
        "user-agent": "inspiredby-cms",
        ...(body ? { "content-type": "application/json" } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return res;
  }
  async function json(path, opts) {
    const res = await api(path, opts);
    if (res.status === 409 || res.status === 422) throw new RepoConflict(`GitHub ${res.status}`);
    if (!res.ok) throw new RepoError(`GitHub ${res.status} a ${path.split("?")[0]}`);
    return res.json();
  }
  const enc = p => p.split("/").map(encodeURIComponent).join("/");

  return {
    branch,
    /** sha de l'últim commit de la branca */
    async head() {
      const r = await json(`/git/ref/heads/${encodeURIComponent(branch)}`);
      return r.object.sha;
    },
    /** contingut d'un fitxer en un commit concret (null si no existeix) */
    async readFile(path, ref) {
      const res = await api(`/contents/${enc(path)}?ref=${encodeURIComponent(ref)}`, { accept: "application/vnd.github.raw+json" });
      if (res.status === 404) return null;
      if (!res.ok) throw new RepoError(`GitHub ${res.status} en llegir ${path}`);
      const text = await res.text();
      // si el camí (p. ex. Git Gateway) torna el JSON de l'API de GitHub en lloc del fitxer cru, es descodifica
      if (!/vnd\.github\.raw/.test(res.headers.get("content-type") || "") && text.startsWith("{")) {
        let j = null;
        try { j = JSON.parse(text); } catch {}
        if (j && j.type === "file" && typeof j.sha === "string" && j.path === path) {
          if (j.encoding !== "base64" || typeof j.content !== "string" || !j.content) throw new RepoError(`${path} és massa gran per llegir-lo`);
          const bin = atob(j.content.replace(/\s/g, ""));
          return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
        }
      }
      return text;
    },
    /** commit amb diversos fitxers sobre `parent`; llança RepoConflict si main ja no és `parent`. */
    async commit({ parent, files, message, author }) {
      const parentCommit = await json(`/git/commits/${parent}`);
      const tree = [];
      for (const f of files) {
        const blob = await json(`/git/blobs`, { method: "POST", body: { content: f.content, encoding: "utf-8" } });
        tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
      }
      const newTree = await json(`/git/trees`, { method: "POST", body: { base_tree: parentCommit.tree.sha, tree } });
      const commit = await json(`/git/commits`, {
        method: "POST",
        body: { message, tree: newTree.sha, parents: [parent], author: { ...author, date: new Date().toISOString() } }
      });
      await json(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", body: { sha: commit.sha, force: false } });
      return commit.sha;
    },
    /** últims commits que han tocat un fitxer (per ensenyar «qui ho ha canviat» a l'editor) */
    async history(path, n = 5) {
      const list = await json(`/commits?sha=${encodeURIComponent(branch)}&path=${encodeURIComponent(path)}&per_page=${n}`);
      return list.map(c => ({ sha: c.sha, date: c.commit.author?.date, author: c.commit.author?.name, message: c.commit.message.split("\n")[0] }));
    }
  };
}
