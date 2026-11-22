/* CMS · repositori local de proves (dev-server i tests). Mateixa interfície que github.mjs,
   sobre una carpeta: cada commit incrementa un comptador i escriu els fitxers al disc. */
import fs from "node:fs";
import path from "node:path";
import { RepoConflict } from "./github.mjs";

export function fsRepo(dir) {
  let head = "local-1";
  const log = [];
  let lastWrite = 0;
  return {
    branch: "main",
    async head() { return head; },
    async readFile(p, ref) {
      if (ref !== head) throw new Error(`fsRepo només llegeix el head (${ref} ≠ ${head})`);
      const f = path.join(dir, p);
      return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
    },
    async listDir(p, ref) {
      if (ref !== head) throw new Error(`fsRepo només llegeix el head (${ref} ≠ ${head})`);
      const d = path.join(dir, p);
      return fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).filter(x => x.isFile()).map(x => ({ name: x.name })) : [];
    },
    async commit({ parent, files, message, author }) {
      if (parent !== head) throw new RepoConflict("not fast-forward");
      lastWrite = Date.now();
      for (const f of files) {
        const full = path.join(dir, f.path);
        if (f.content === null) { fs.rmSync(full, { force: true }); continue; }
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, f.content, "utf8");
      }
      head = `local-${+head.split("-")[1] + 1}`;
      log.unshift({ sha: head, date: new Date().toISOString(), author: author.name, message: message.split("\n")[0], files: files.map(f => f.path) });
      return head;
    },
    /** un canvi fet a mà a la carpeta (com un push de Claude Code) també mou el head */
    touch(file) {
      if (Date.now() - lastWrite < 500) return;
      head = `local-${+head.split("-")[1] + 1}`;
      log.unshift({ sha: head, date: new Date().toISOString(), author: "Claude Code", message: "canvi extern", files: [file] });
    },
    async history(p, n = 5) { return log.filter(c => c.files.includes(p)).slice(0, n); },
    /** per simular un push de Claude Code mentre l'editor edita */
    externalWrite(p, content) {
      fs.writeFileSync(path.join(dir, p), content, "utf8");
      head = `local-${+head.split("-")[1] + 1}`;
      log.unshift({ sha: head, date: new Date().toISOString(), author: "Claude Code", message: "canvi extern", files: [p] });
    }
  };
}
