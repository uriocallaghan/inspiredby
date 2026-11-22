/* Inspired by · Editor (CMS).
   La pàgina real es carrega en un iframe del mateix domini i els seus paràgrafs es fan editables.
   El servidor (/api/cms/*) dona, per a cada pàgina, la llista de blocs tal com són a GitHub (main);
   aquí s'aparellen amb els elements de la pàgina pel text i, en publicar, només s'envia
   «aquest bloc deia X i ara diu Y». El servidor ho combina amb l'últim main i fa el commit.
   Els canvis sense publicar es guarden al navegador (localStorage) per no perdre res. */
(function () {
  "use strict";

  /* ---------- utilitats ---------- */
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = s => String(s).replace(/[\s ]+/g, " ").trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const draftKey = page => `ibcms:draft:${page || "/"}`;

  const ICON = {
    pointer: '<path d="M5 3.5l13 6.2-5.6 1.7-2.3 5.6z"/><path d="M12.6 11.6l5.2 5.2"/>',
    pages: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    text: '<path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9 19h6"/>',
    comment: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"/>',
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z"/><path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
    italic: '<path d="M10 5h8"/><path d="M6 19h8"/><path d="M14 5l-4 14"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    list: '<path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h8"/><circle cx="4" cy="6" r=".6" fill="currentColor"/><circle cx="4" cy="12" r=".6" fill="currentColor"/><circle cx="4" cy="18" r=".6" fill="currentColor"/>',
    up: '<path d="M12 19V6"/><path d="M6 11l6-6 6 6"/>',
    close: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    user: '<circle cx="12" cy="9" r="3.5"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"/>'
  };
  const svg = (name, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICON[name]}</svg>`;

  function ago(iso) {
    if (!iso) return "";
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "ara";
    if (s < 3600) return `fa ${Math.round(s / 60)} min`;
    if (s < 86400) return `fa ${Math.round(s / 3600)} h`;
    const d = Math.round(s / 86400);
    return d === 1 ? "ahir" : `fa ${d} dies`;
  }

  let toastT;
  function toast(msg, { error = false, ms = 3200 } = {}) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.toggle("err", error);
    t.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("on"), ms);
  }

  /* ---------- API ---------- */
  class ApiError extends Error { constructor(status, body) { super(body?.error || `Error ${status}`); this.status = status; this.body = body; } }
  async function api(route, body = {}) {
    let res;
    try {
      res = await fetch(`/api/cms/${route}`, {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "content-type": "application/json", "x-ib-cms": "1" },
        body: JSON.stringify(body)
      });
    } catch {
      throw new ApiError(0, { error: "Sense connexió. Els canvis es queden guardats en aquest navegador." });
    }
    let data = {};
    try { data = await res.json(); } catch {}
    if (res.status === 401 && route !== "me" && route !== "login") { showLogin("La sessió ha caducat. Torna a entrar; els canvis sense publicar es mantenen."); }
    if (!res.ok) throw new ApiError(res.status, data);
    return data;
  }

  /* ---------- estat ---------- */
  const S = {
    me: null,
    pages: [],
    page: null,          // dades del servidor de la pàgina oberta
    pageId: "",
    head: null,
    mode: "point",       // "point" (navegar, per defecte) | "edit" | "comment"
    doc: null, win: null,
    bound: new Map(),    // id → { b, el, orig }
    pending: new Map(),  // id → { id, from, to }
    conflicts: new Set(),
    unbound: 0,
    sel: null,           // selecció per comentar
    activeComment: null,
    busy: false,
    staleTries: 0
  };

  /* ---------- login (Netlify Identity amb Google) ---------- */
  // Identity torna a la portada amb #access_token=…; ib-theme.js ho reenvia aquí. El token s'envia una sola
  // vegada al servidor (que el comprova i el guarda xifrat en una galeta HttpOnly) i s'esborra de l'URL.
  async function takeIdentityReturn() {
    if (!/^#(access_token|error)=/.test(location.hash)) return false;
    const q = new URLSearchParams(location.hash.slice(1));
    let back = "";
    try { back = sessionStorage.getItem("ibcms:back") || ""; sessionStorage.removeItem("ibcms:back"); } catch {}
    history.replaceState(null, "", "/admin/" + back);
    if (q.get("error")) { showLogin(q.get("error_description") || "No s'ha pogut entrar."); return true; }
    try {
      await api("login", { access_token: q.get("access_token"), refresh_token: q.get("refresh_token") });
      return false;
    } catch (e) { showLogin(e.message); return true; }
  }
  async function showLogin(msg = "") {
    $("app").hidden = true;
    $("login").hidden = false;
    $("loginErr").textContent = msg;
    let cfg = { login: "identity" };
    try { cfg = await api("config"); } catch (e) { $("loginErr").textContent = e.message; }
    if (cfg.login === "dev" && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      $("gbtn").hidden = true;
      $("devlogin").hidden = false;
      $("devlogin").onclick = async () => { await fetch("/api/cms/dev-login", { method: "POST", headers: { "x-ib-cms": "1" } }); boot(); };
      return;
    }
    $("gbtn").onclick = () => {
      try { sessionStorage.setItem("ibcms:back", location.hash); } catch {}
      $("gbtn").disabled = true;
      location.href = "/.netlify/identity/authorize?provider=google";
    };
  }

  /* ---------- barra inferior ---------- */
  function buildDock() {
    $("dock").innerHTML = `
      <button class="tb tb-page" id="bPages" type="button" aria-haspopup="dialog" aria-expanded="false" data-tip="Pàgines">${svg("pages")}<span class="lbl" id="pageLabel">…</span><span class="dot" id="syncDot"></span>${svg("chev", 'class="chev"')}</button>
      <span class="sep"></span>
      <button class="tb" id="bPoint" type="button" aria-pressed="true" data-tip="Navega  V">${svg("pointer")}</button>
      <button class="tb" id="bEdit" type="button" aria-pressed="false" data-tip="Edita el text  T">${svg("text")}</button>
      <button class="tb" id="bComment" type="button" aria-pressed="false" data-tip="Subratlla i comenta  C">${svg("comment")}</button>
      <span class="sep wide-only"></span>
      <button class="tb wide-only" id="bBold" type="button" data-tip="Negreta  ⌘B">${svg("bold")}</button>
      <button class="tb wide-only" id="bItalic" type="button" data-tip="Cursiva  ⌘I">${svg("italic")}</button>
      <button class="tb" id="bUndo" type="button" data-tip="Desfés  ⌘Z">${svg("undo")}</button>
      <button class="tb wide-only" id="bRedo" type="button" data-tip="Refés  ⇧⌘Z">${svg("redo")}</button>
      <span class="sep"></span>
      <button class="tb" id="bComments" type="button" aria-expanded="false" data-tip="Comentaris">${svg("list")}<span class="badge" id="cBadge"></span></button>
      <button class="tb tb-avatar" id="bMe" type="button" aria-expanded="false" data-tip="Compte"><img id="avatar" alt="" referrerpolicy="no-referrer" hidden>${svg("user", 'id="avatarFallback"')}</button>
      <button class="publish" id="bPublish" type="button" disabled data-tip="Revisa i publica  ⌘S">${svg("up")}<span class="t">Publica</span><span class="n" id="pubN"></span></button>`;
    for (const b of $("dock").querySelectorAll("[data-tip]")) if (!b.hasAttribute("aria-label")) b.setAttribute("aria-label", b.dataset.tip.split("  ")[0]);
    $("bPages").onclick = () => togglePop("popPages");
    $("bComments").onclick = () => togglePop("popComments");
    $("bMe").onclick = () => togglePop("popMe");
    $("bPoint").onclick = () => setMode("point");
    $("bEdit").onclick = () => setMode(S.mode === "edit" ? "point" : "edit");
    $("bComment").onclick = () => { if (S.sel) openComposer(); else setMode(S.mode === "comment" ? "point" : "comment"); };
    for (const [id, cmd] of [["bBold", "bold"], ["bItalic", "italic"], ["bUndo", "undo"], ["bRedo", "redo"]]) {
      const b = $(id);
      b.addEventListener("mousedown", e => e.preventDefault()); // que no es perdi la selecció dins l'iframe
      b.onclick = () => exec(cmd);
    }
    $("bPublish").onclick = openPublish;
    $("sheetClose").innerHTML = svg("close");
    $("selComment").innerHTML = `${svg("comment")}<span>Comenta</span>`;
    $("selComment").addEventListener("mousedown", e => e.preventDefault());
    $("selComment").onclick = openComposer;
    $("logout").onclick = async () => { await api("logout").catch(() => {}); location.reload(); };
  }

  function exec(cmd) {
    if (!S.doc) return;
    if ((cmd === "bold" || cmd === "italic") && S.mode !== "edit") return;
    const active = S.doc.activeElement;
    if ((cmd === "bold" || cmd === "italic") && !(active && active.dataset && active.dataset.ibc !== undefined && !active.dataset.plain)) {
      toast("Clica dins d'un paràgraf i selecciona el text."); return;
    }
    S.doc.execCommand(cmd, false, null);
    if (active && active.dataset && active.dataset.ibc !== undefined) onInput({ target: active });
  }

  /* ---------- popovers ---------- */
  const POPS = { popPages: "bPages", popComments: "bComments", popMe: "bMe" };
  function closePops(except) {
    for (const [p, b] of Object.entries(POPS)) {
      if (p === except) continue;
      $(p).hidden = true;
      $(b)?.setAttribute("aria-expanded", "false");
      $(b)?.classList.remove("is-open");
    }
  }
  function togglePop(id) {
    const open = $(id).hidden;
    closePops(id);
    closeComposer();
    $(id).hidden = !open;
    $(POPS[id]).setAttribute("aria-expanded", String(open));
    $(POPS[id]).classList.toggle("is-open", open);
    if (open && id === "popPages") { renderPages(); setTimeout(() => { if (matchMedia("(hover: hover)").matches) $("pageSearch").focus(); }, 30); }
    if (open && id === "popComments") renderComments();
  }
  document.addEventListener("pointerdown", e => {
    if (e.target.closest(".pop, .dock, .composer, .sheet-wrap, .selpill")) return;
    closePops();
  });

  /* ---------- pàgines ---------- */
  function hasDraft(page) { const d = store.get(draftKey(page)); return !!(d && d.edits && d.edits.length); }
  function renderPages() {
    const q = norm($("pageSearch").value).toLowerCase();
    const list = S.pages.filter(p => !q || p.title.toLowerCase().includes(q));
    $("pageList").innerHTML = list.map(p => `
      <li><button type="button" data-page="${esc(p.page)}" ${p.page === S.pageId ? 'aria-current="page"' : ""}>
        <span class="t">${esc(p.title)}</span>
        ${hasDraft(p.page) ? '<span class="pend" title="Canvis sense publicar"></span>' : ""}
        ${p.comments ? `<span class="cnt">${p.comments}</span>` : ""}
        ${p.draft ? '<span class="tag">per penjar</span>' : ""}
      </button></li>`).join("") || '<li class="empty">Cap pàgina amb aquest nom</li>';
    const h = (S.page?.history || []).slice(0, 3);
    $("pageHist").innerHTML = h.length ? `<div class="h"><b>Últimes versions a GitHub</b></div>` + h.map(c =>
      `<div class="h"><b>${esc(/CMS/.test(c.author) ? "Tu (CMS)" : c.author || "")}</b><span>${esc(c.message.replace(/^CMS: /, ""))}</span><time>${esc(ago(c.date))}</time></div>`).join("") : "";
  }
  $("pageSearch").addEventListener("input", renderPages);
  $("pageSearch").addEventListener("keydown", e => {
    if (e.key === "Enter") { const b = $("pageList").querySelector("button"); if (b) b.click(); }
    if (e.key === "Escape") closePops();
  });
  $("pageList").addEventListener("click", e => {
    const b = e.target.closest("button[data-page]");
    if (!b) return;
    closePops();
    go(b.dataset.page);
  });

  function go(page) {
    const h = "#" + (page || "/");
    if (location.hash !== h) location.hash = h; else openPage(page);
  }
  addEventListener("hashchange", () => openPage(pageFromHash()));
  function pageFromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    return h === "/" || h === "" ? "" : h.replace(/^\//, "");
  }

  /* ---------- obrir una pàgina ---------- */
  let openSeq = 0;
  async function openPage(page) {
    const seq = ++openSeq;
    persistDraft();
    loading(true);
    closeComposer(); hideSelPill();
    $("notice").hidden = true;
    S.bound.clear(); S.pending.clear(); S.conflicts.clear(); S.page = null; S.pageId = page; S.staleTries = 0;
    updateCounts();
    $("pageLabel").textContent = S.pages.find(p => p.page === page)?.title || "…";
    let data;
    try { data = await api("page", { page }); }
    catch (e) { loading(false); if (e.status !== 401) toast(e.message, { error: true }); return; }
    if (seq !== openSeq) return;
    S.page = data; S.head = data.head;
    $("pageLabel").textContent = data.page === "" ? "Portada" : data.title;
    document.title = `${data.page === "" ? "Portada" : data.title} · Editor`;
    $("openLive").href = "/" + data.page;
    $("openGit").href = `https://github.com/uriocallaghan/inspiredby/commits/main/${data.file}`;
    await loadFrame("/" + data.page);
    if (seq !== openSeq) return;
    bindAll();
    restoreDraft();
    paintComments();
    setSync();
    loading(false);
  }

  function loading(on) { $("loading").classList.toggle("on", on); }

  function loadFrame(url) {
    return new Promise(resolve => {
      const f = $("frame");
      const done = () => { f.removeEventListener("load", done); resolve(); };
      f.addEventListener("load", done);
      f.src = url + (url.includes("?") ? "&" : "?") + "ib-cms=" + Date.now();
    });
  }

  /* ---------- l'iframe: estils i comportament d'edició ---------- */
  const FRAME_CSS = `
    [data-ibc]{outline:none;border-radius:3px;transition:background-color .2s,box-shadow .2s}
    html.ibc-edit [data-ibc]{cursor:text}
    html.ibc-edit [data-ibc]:hover{box-shadow:0 0 0 4px rgba(44,93,168,.10);background-color:rgba(44,93,168,.04)}
    html.ibc-edit [data-ibc]:focus{box-shadow:0 0 0 4px rgba(44,93,168,.28);background-color:rgba(44,93,168,.035)}
    [data-ibc].ibc-dirty{background-color:rgba(245,197,24,.16)!important;box-shadow:0 0 0 4px rgba(245,197,24,.16)}
    [data-ibc].ibc-conflict{box-shadow:0 0 0 2px #C8442A!important}
    html.ibc-edit a,html.ibc-comment a{cursor:text}
    ::highlight(ibc-comment){background-color:rgba(245,197,24,.42)}
    ::highlight(ibc-active){background-color:rgba(245,197,24,.85);color:#141414}
    body::after{content:"";display:block;height:110px}
    .ib-w{opacity:1!important}`;

  function bindAll() {
    const doc = $("frame").contentDocument, win = $("frame").contentWindow;
    if (!doc || !doc.body) return;
    S.doc = doc; S.win = win;
    if (!doc.getElementById("ibc-css")) {
      const st = doc.createElement("style"); st.id = "ibc-css"; st.textContent = FRAME_CSS; doc.head.appendChild(st);
      try { doc.execCommand("styleWithCSS", false, false); } catch {}
      // cap enllaç no navega mentre s'edita; cap formulari s'envia
      doc.addEventListener("click", onFrameLink, true);
      doc.addEventListener("submit", e => e.preventDefault(), true);
      doc.addEventListener("input", onInput);
      doc.addEventListener("keydown", onFrameKey);
      doc.addEventListener("paste", onPaste);
      doc.addEventListener("drop", e => e.preventDefault());
      doc.addEventListener("selectionchange", onSelection);
      doc.addEventListener("scroll", () => { hideSelPill(); }, { passive: true });
      win.addEventListener("scroll", () => { hideSelPill(); placeComposer(); }, { passive: true });
      doc.addEventListener("pointerdown", () => closePops());
      doc.addEventListener("focusin", e => { const el = e.target.closest?.("[data-ibc]"); if (el) el.spellcheck = true; });
      doc.addEventListener("focusout", e => { const el = e.target.closest?.("[data-ibc]"); if (el) el.spellcheck = false; });
    }
    for (const el of doc.querySelectorAll("[data-ibc]")) { el.removeAttribute("data-ibc"); el.removeAttribute("contenteditable"); el.classList.remove("ibc-dirty", "ibc-conflict"); }
    S.bound.clear();

    const home = S.page.page === "";
    const sel = home
      ? "a.ib-card h2, a.ib-card p.ib-card-desc, a.ib-diptych-card h2, a.ib-diptych-card p.ib-card-desc"
      : "p, h1, h2, h3, h4, h5, h6, li, figcaption, dt, dd, blockquote, td, th, caption";
    const cands = [...doc.body.querySelectorAll(sel)].filter(el => !el.closest("footer, .ib-bar, svg, button, nav, template, label"));
    const candText = cands.map(el => norm(el.textContent));
    const tpl = doc.createElement("template");
    const blocks = S.page.blocks;
    const at = new Array(blocks.length).fill(-1); // bloc → element de la pàgina
    const taken = new Set();
    const textOfBlock = b => { if (b.plain) return norm(b.text); tpl.innerHTML = b.html; return norm(tpl.content.textContent); };

    // 1) pel text, en ordre: el cas normal (la pàgina publicada és igual que GitHub)
    let ptr = 0;
    blocks.forEach((b, k) => {
      const text = textOfBlock(b);
      for (let i = ptr; i < cands.length; i++) {
        if (!taken.has(i) && cands[i].localName === b.tag && candText[i] === text) { at[k] = i; taken.add(i); ptr = i + 1; return; }
      }
    });
    // 2) si la pàgina publicada encara és una versió anterior (la web s'està publicant, o el navegador en té
    //    una còpia vella), el bloc es busca pel seu lloc i s'hi posa el text de GitHub, que és el que mana.
    let refreshed = 0;
    const fill = (k, i) => {
      const b = blocks[k], el = cands[i];
      if (b.plain) el.textContent = b.text; else el.innerHTML = b.html;
      at[k] = i; taken.add(i); refreshed++;
    };
    if (home) {
      // portada: cada bloc és el títol o la descripció d'una targeta concreta
      blocks.forEach((b, k) => {
        if (at[k] >= 0 || !b.slug) return;
        const i = cands.findIndex((el, j) => !taken.has(j) && el.closest("a")?.getAttribute("href") === `articles/${b.slug}/` &&
          (b.field === "title" ? el.localName === "h2" : el.matches("p.ib-card-desc")));
        if (i >= 0) fill(k, i);
      });
    } else {
      // article: entre dos blocs ja trobats, si queden tants elements lliures com blocs i són del mateix tipus, van a la par
      let k = 0;
      while (k < blocks.length) {
        if (at[k] >= 0) { k++; continue; }
        let e = k; while (e < blocks.length && at[e] < 0) e++;
        const lo = k > 0 ? at[k - 1] : -1, hi = e < blocks.length ? at[e] : cands.length;
        const fits = [];
        for (let i = lo + 1; i < hi; i++) if (!taken.has(i) && !cands[i].querySelector("p, li, h1, h2, h3, h4, h5, h6, dt, dd, figcaption")) fits.push(i);
        const run = blocks.slice(k, e);
        if (fits.length === run.length && run.every((b, j) => cands[fits[j]].localName === b.tag)) run.forEach((b, j) => fill(k + j, fits[j]));
        k = e;
      }
    }

    let unbound = 0;
    blocks.forEach((b, k) => {
      if (at[k] < 0) { unbound++; return; }
      const el = cands[at[k]];
      let orig;
      if (b.plain) orig = norm(b.text);
      else {
        tpl.innerHTML = b.html;
        orig = serialize(tpl.content);
        if (serialize(el) !== orig) el.innerHTML = b.html; // el JS de la pàgina l'havia retocat: es torna a la font
      }
      el.dataset.ibc = String(b.id);
      if (b.plain) el.dataset.plain = "1";
      S.bound.set(b.id, { b, el, orig });
    });
    S.unbound = unbound;
    S.refreshed = refreshed;
    applyMode();
    if (refreshed && !S.pending.size) notice(`La web publicada encara no té l'última versió de GitHub: ${refreshed === 1 ? "1 bloc mostra" : refreshed + " blocs mostren"} ja el text de GitHub, que és el que edites.`, "blue");
  }

  function applyMode() {
    const doc = S.doc;
    if (!doc) return;
    doc.documentElement.classList.toggle("ibc-edit", S.mode === "edit");
    doc.documentElement.classList.toggle("ibc-comment", S.mode === "comment");
    for (const { el, b } of S.bound.values()) {
      if (S.mode === "edit") {
        try { el.contentEditable = b.plain ? "plaintext-only" : "true"; } catch { el.contentEditable = "true"; }
        el.spellcheck = false; // el corrector només s'encén al paràgraf que s'edita (vegeu focusin)
        el.setAttribute("lang", el.closest("[lang]")?.getAttribute("lang") || "ca");
      } else {
        el.removeAttribute("contenteditable");
      }
    }
    $("bPoint")?.setAttribute("aria-pressed", String(S.mode === "point"));
    $("bEdit")?.setAttribute("aria-pressed", String(S.mode === "edit"));
    $("bComment")?.setAttribute("aria-pressed", String(S.mode === "comment"));
    for (const id of ["bBold", "bItalic"]) if ($(id)) $(id).disabled = S.mode !== "edit" || S.page?.page === "";
  }
  function setMode(m) {
    S.mode = m;
    try { S.doc?.getSelection()?.removeAllRanges(); } catch {}
    hideSelPill(); closeComposer();
    applyMode();
    if (m === "comment") toast("Selecciona un tros de text per comentar-lo.", { ms: 2400 });
    if (m === "edit") toast("Clica qualsevol paràgraf per editar-lo.", { ms: 2000 });
  }

  /* ---------- serialitzar (mateixa llista que el servidor: cms/lib/html.mjs) ---------- */
  const INLINE = new Set(["a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn", "em", "i", "kbd", "mark", "q", "s", "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr"]);
  const ATTRS = new Set(["class", "id", "href", "title", "lang", "dir", "rel", "target", "datetime", "translate", "style", "role", "value", "cite"]);
  const attrOk = n => ATTRS.has(n) || /^data-[a-z0-9_.-]+$/.test(n) || /^aria-[a-z]+$/.test(n);
  const escText = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;");
  const escAttr = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function serialize(node) {
    let out = "";
    for (const c of node.childNodes) {
      if (c.nodeType === 3) { out += escText(c.data); continue; }
      if (c.nodeType !== 1) continue;
      const t = c.localName;
      const attrs = [...c.attributes].filter(a => attrOk(a.name) && !(a.name === "style" && /url\s*\(|expression|@import|javascript:/i.test(a.value)));
      if (!INLINE.has(t) || (t === "span" && !attrs.length)) { out += serialize(c); continue; } // el navegador de vegades hi posa <div>, <font> o <span> buits
      const a = attrs.map(x => ` ${x.name}="${escAttr(x.value)}"`).join("");
      if (t === "br" || t === "wbr") { out += `<${t}${a}>`; continue; }
      const inner = serialize(c);
      if (!inner && t !== "a") continue; // format buit que queda després d'esborrar
      out += `<${t}${a}>${inner}</${t}>`;
    }
    return out;
  }
  function currentValue(entry) {
    if (entry.b.plain) return norm(entry.el.textContent);
    return serialize(entry.el).replace(/(<br>)+$/, "");
  }

  /* ---------- editar ---------- */
  function onInput(e) {
    const el = e.target?.closest?.("[data-ibc]");
    if (!el) return;
    const id = +el.dataset.ibc;
    const entry = S.bound.get(id);
    if (!entry) return;
    const now = currentValue(entry);
    if (now === entry.orig) S.pending.delete(id);
    else S.pending.set(id, { id, from: entry.b.plain ? entry.b.text : entry.b.html, to: now });
    el.classList.toggle("ibc-dirty", S.pending.has(id));
    if (!S.pending.has(id)) { S.conflicts.delete(id); el.classList.remove("ibc-conflict"); }
    updateCounts();
    persistDraftSoon();
  }
  function onFrameKey(e) {
    const el = e.target?.closest?.("[data-ibc]");
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); openPublish(); return; }
    if (el && e.key === "Enter") { e.preventDefault(); return; } // cada bloc és un sol paràgraf
    if (el && e.key === "Escape") { el.blur(); return; }
    if (el && el.dataset.plain && mod && /^[biu]$/i.test(e.key)) { e.preventDefault(); return; }
    if (!el) onGlobalKey(e);
  }
  /** Amb el punter, els enllaços funcionen: un article o la portada s'obren dins l'editor, una àncora fa
      scroll, i la resta (altres pàgines, webs de fora) s'obre en una pestanya nova. Amb les altres eines, cap
      enllaç navega (es clica per escriure o per seleccionar). */
  function onFrameLink(e) {
    const a = e.target.closest("a[href]");
    if (!a) { onFrameClick(e); return; }
    if (S.mode !== "point" || e.button > 0) { e.preventDefault(); onFrameClick(e); return; }
    const raw = a.getAttribute("href") || "";
    if (raw.startsWith("#")) return; // àncores dins la mateixa pàgina: deixa fer
    let u;
    try { u = new URL(a.href); } catch { e.preventDefault(); return; }
    e.preventDefault();
    if (u.origin === location.origin) {
      const m = /^\/(?:index\.html)?$/.test(u.pathname) ? "" : (/^\/(articles\/[a-z0-9-]+\/)(?:index\.html)?$/.exec(u.pathname) || [])[1];
      if (m !== undefined && (m === "" || S.pages.some(p => p.page === m))) { go(m); return; }
    }
    window.open(u.href, "_blank", "noopener");
  }

  function onPaste(e) {
    const el = e.target?.closest?.("[data-ibc]");
    if (!el) return;
    e.preventDefault();
    const text = (e.clipboardData?.getData("text/plain") || "").replace(/[\r\n]+/g, " ");
    S.doc.execCommand("insertText", false, text);
  }

  /* ---------- canvis guardats al navegador ---------- */
  let draftT;
  function persistDraftSoon() { clearTimeout(draftT); draftT = setTimeout(persistDraft, 400); }
  function persistDraft() {
    clearTimeout(draftT);
    if (!S.page) return;
    const edits = [...S.pending.values()];
    if (edits.length) store.set(draftKey(S.page.page), { at: Date.now(), edits });
    else store.del(draftKey(S.page.page));
  }
  function restoreDraft() {
    const d = store.get(draftKey(S.page.page));
    if (!d || !Array.isArray(d.edits) || !d.edits.length) return;
    let ok = 0, lost = 0;
    for (const e of d.edits) {
      const entry = [...S.bound.values()].find(x => (x.b.plain ? x.b.text : x.b.html) === e.from && !S.pending.has(x.b.id));
      if (!entry) { lost++; continue; }
      if (entry.b.plain) entry.el.textContent = e.to; else entry.el.innerHTML = e.to;
      S.pending.set(entry.b.id, { id: entry.b.id, from: e.from, to: currentValue(entry) });
      entry.el.classList.add("ibc-dirty");
      ok++;
    }
    updateCounts();
    persistDraft();
    if (ok) toast(`Recuperats ${ok} ${ok === 1 ? "canvi" : "canvis"} sense publicar.`);
    if (lost) notice(`${lost} ${lost === 1 ? "canvi guardat no s'ha pogut recuperar" : "canvis guardats no s'han pogut recuperar"}: aquell text ha canviat a GitHub mentrestant.`, "amber");
  }
  addEventListener("beforeunload", e => { persistDraft(); if (S.pending.size) { e.preventDefault(); e.returnValue = ""; } });
  addEventListener("pagehide", persistDraft);

  function updateCounts() {
    const n = S.pending.size;
    if ($("pubN")) { $("pubN").textContent = n || ""; $("bPublish").disabled = !n; }
    const c = S.page?.comments?.length || 0;
    if ($("cBadge")) $("cBadge").textContent = c || "";
    setSync();
  }

  /* ---------- sincronia amb GitHub ---------- */
  let noticeKind = null;
  function notice(html, kind = "amber", action) {
    const n = $("notice");
    noticeKind = kind;
    n.innerHTML = `<span class="dot ${kind}"></span><span>${html}</span>`;
    if (action) {
      const b = document.createElement("button");
      b.className = "btn btn-ghost"; b.type = "button"; b.textContent = action.label; b.onclick = action.run;
      n.appendChild(b);
    }
    const x = document.createElement("button");
    x.className = "icon-btn"; x.type = "button"; x.setAttribute("aria-label", "Amaga"); x.innerHTML = svg("close"); x.onclick = () => { n.hidden = true; };
    n.appendChild(x);
    n.hidden = false;
  }
  function setSync() {
    const d = $("syncDot");
    if (!d) return;
    d.className = "dot";
    let tip = "Al dia amb GitHub";
    if (S.busy) { d.classList.add("blue"); tip = "Publicant…"; }
    else if (S.conflicts.size) { d.classList.add("red"); tip = "Hi ha conflictes per resoldre"; }
    else if (S.pending.size) { d.classList.add("amber"); tip = `${S.pending.size} canvis sense publicar`; }
    else if (S.unbound) { d.classList.add("amber"); tip = "La web encara s'està publicant"; }
    d.title = tip;
  }

  async function poll() {
    if (!S.page || S.busy || document.hidden) return;
    let r;
    try { r = await api("head"); } catch { return; }
    if (!r.head || r.head === S.head) {
      if (S.unbound && !S.pending.size && S.staleTries < 12) { S.staleTries++; refreshFrame(); }
      return;
    }
    let fresh;
    try { fresh = await api("page", { page: S.pageId }); } catch { return; }
    if (fresh.page !== S.pageId) return;
    const same = JSON.stringify(fresh.blocks) === JSON.stringify(S.page.blocks);
    const sameComments = JSON.stringify(fresh.comments) === JSON.stringify(S.page.comments);
    S.head = fresh.head;
    S.page = { ...fresh, blocks: same ? S.page.blocks : fresh.blocks };
    if (!sameComments) {
      // l'agent ha resolt (o algú ha afegit) comentaris: es repinten sols
      const pg = S.pages.find(p => p.page === S.pageId); if (pg) pg.comments = (fresh.comments || []).length;
      paintComments(); updateCounts();
      if (!$("popComments").hidden) renderComments();
    }
    if (same) return;
    if (S.pending.size) {
      notice("Hi ha una versió nova d'aquesta pàgina a GitHub (Claude Code o una altra pestanya). En publicar, els teus canvis s'hi combinaran.", "amber");
      return;
    }
    notice("Hi ha una versió nova d'aquesta pàgina a GitHub. Carregant-la…", "blue");
    await refreshFrame();
  }
  async function refreshFrame() {
    const y = S.win ? S.win.scrollY : 0;
    await loadFrame("/" + S.page.page);
    bindAll(); paintComments();
    try { S.win.scrollTo(0, y); } catch {}
    updateCounts();
    if (!S.unbound) { if (noticeKind !== "red") $("notice").hidden = true; }
    else notice(`La web encara s'està publicant: ${S.unbound} ${S.unbound === 1 ? "bloc encara no es pot" : "blocs encara no es poden"} editar. Es torna a mirar sol.`, "amber");
  }
  setInterval(poll, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) poll(); });

  /* ---------- publicar ---------- */
  function words(s) { return s.split(/(\s+)/).filter(x => x !== ""); }
  function diffHtml(a, b) {
    const A = words(a), B = words(b);
    if (A.length * B.length > 400000) return `<del>${esc(a)}</del> <ins>${esc(b)}</ins>`;
    const m = A.length, n = B.length;
    const L = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0, out = "", del = "", ins = "";
    const flush = () => { if (del) out += `<del>${esc(del)}</del>`; if (ins) out += `<ins>${esc(ins)}</ins>`; del = ins = ""; };
    while (i < m && j < n) {
      if (A[i] === B[j]) { flush(); out += esc(A[i]); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) del += A[i++];
      else ins += B[j++];
    }
    while (i < m) del += A[i++];
    while (j < n) ins += B[j++];
    flush();
    return out;
  }
  function textOf(html, plain) {
    if (plain) return html;
    const t = document.createElement("template"); t.innerHTML = html; return norm(t.content.textContent);
  }
  function formatOnly(e, entry) {
    return textOf(e.from, entry?.b.plain) === textOf(e.to, entry?.b.plain);
  }

  function openSheet({ title, sub, body, foot }) {
    $("sheetTitle").textContent = title;
    $("sheetSub").innerHTML = sub || "";
    $("sheetSub").hidden = !sub;
    $("sheetBody").innerHTML = body;
    $("sheetFoot").innerHTML = "";
    for (const f of foot) {
      const b = document.createElement("button");
      b.type = "button"; b.className = `btn ${f.cls || "btn-ghost"}`; b.textContent = f.label; b.onclick = f.run;
      if (f.grow) b.classList.add("grow");
      if (f.id) b.id = f.id;
      $("sheetFoot").appendChild(b);
    }
    $("sheetWrap").hidden = false;
    closePops();
    setTimeout(() => $("sheetFoot").querySelector(".btn-primary")?.focus(), 30);
  }
  function closeSheet() { $("sheetWrap").hidden = true; }
  $("sheetClose").onclick = closeSheet;
  $("sheetWrap").addEventListener("pointerdown", e => { if (e.target === $("sheetWrap")) closeSheet(); });

  function openPublish() {
    if (!S.pending.size || S.busy) return;
    const items = [...S.pending.values()].sort((a, b) => a.id - b.id);
    const body = items.map(e => {
      const entry = S.bound.get(e.id);
      const tag = !entry ? "Bloc" : entry.b.plain ? (entry.b.tag === "h2" ? "Títol de la targeta" : "Descripció de la targeta")
        : ({ h1: "Títol", h2: "Intertítol", h3: "Intertítol", li: "Element de llista", figcaption: "Peu", dt: "Terme", dd: "Definició" }[entry.b.tag] || "Paràgraf");
      const fo = formatOnly(e, entry);
      return `<div class="chg" data-id="${e.id}">
        <div class="chg-head"><span>${tag}</span>${fo ? '<span class="tag">només format</span>' : ""}
          <button class="lnk" type="button" data-go="${e.id}">Mostra</button><button class="lnk" type="button" data-undo="${e.id}">Desfés</button></div>
        <div class="diff">${diffHtml(textOf(e.from, entry?.b.plain), textOf(e.to, entry?.b.plain))}</div></div>`;
    }).join("");
    openSheet({
      title: `Publica ${items.length} ${items.length === 1 ? "canvi" : "canvis"}`,
      sub: "Es desa a GitHub com un commit (on també ho veu Claude Code) i la web s'actualitza en un minut.",
      body,
      foot: [
        { label: "Descarta-ho tot", cls: "btn-danger", grow: true, run: discardAll },
        { label: "Continua editant", run: closeSheet },
        { label: "Publica", cls: "btn-primary", id: "doPublish", run: publish }
      ]
    });
  }
  $("sheetBody").addEventListener("click", e => {
    const u = e.target.closest("[data-undo]"), g = e.target.closest("[data-go]");
    if (u) {
      const id = +u.dataset.undo;
      revert(id);
      u.closest(".chg").remove();
      if (!S.pending.size) closeSheet(); else $("sheetTitle").textContent = `Publica ${S.pending.size} ${S.pending.size === 1 ? "canvi" : "canvis"}`;
    }
    if (g) { closeSheet(); reveal(S.bound.get(+g.dataset.go)?.el); }
  });
  function revert(id) {
    const entry = S.bound.get(id);
    if (entry) {
      if (entry.b.plain) entry.el.textContent = entry.b.text; else entry.el.innerHTML = entry.b.html;
      entry.el.classList.remove("ibc-dirty", "ibc-conflict");
    }
    S.pending.delete(id); S.conflicts.delete(id);
    updateCounts(); persistDraft();
  }
  function discardAll(e) {
    const b = e?.currentTarget;
    if (b && !b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "Segur? Torna a clicar"; return; } // sense diàlegs del navegador
    if (!b && !confirm(`Segur? Es perdran ${S.pending.size} canvis sense publicar.`)) return;
    for (const id of [...S.pending.keys()]) revert(id);
    closeSheet();
    toast("Canvis descartats.");
  }
  function reveal(el) {
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.animate([{ boxShadow: "0 0 0 6px rgba(44,93,168,.45)" }, { boxShadow: "0 0 0 0 rgba(44,93,168,0)" }], { duration: 1200, easing: "ease-out" });
  }

  async function publish() {
    if (S.busy || !S.pending.size) return;
    S.busy = true; setSync();
    const btn = $("doPublish"); if (btn) { btn.disabled = true; btn.textContent = "Publicant…"; }
    const edits = [...S.pending.values()];
    try {
      const r = await api("save", { page: S.page.page, edits });
      afterSave(r.page);
      closeSheet();
      $("notice").hidden = true;
      toast(r.unchanged ? "No hi havia res a canviar." : "Publicat. La web s'actualitza en un minut.");
    } catch (e) {
      if (e.status === 409 && e.body?.conflicts) { closeSheet(); showConflicts(e.body); }
      else { toast(e.message, { error: true, ms: 6000 }); if (btn) { btn.disabled = false; btn.textContent = "Publica"; } }
    } finally {
      S.busy = false; setSync();
    }
  }
  /** Després de desar: el text de la pàgina ja és el nou; es tornen a aparellar els blocs amb la versió de GitHub. */
  function afterSave(page) {
    const keepConflicts = new Map([...S.pending].filter(([id]) => S.conflicts.has(id)));
    S.page = page; S.head = page.head;
    S.pending = keepConflicts;
    bindAll();
    for (const [id] of keepConflicts) S.bound.get(id)?.el.classList.add("ibc-dirty", "ibc-conflict");
    persistDraft(); paintComments(); updateCounts();
  }

  function showConflicts(body) {
    // la versió nova de GitHub: el que no és conflicte es tornarà a enviar igual
    S.conflicts = new Set(body.conflicts.map(c => c.id));
    for (const id of S.conflicts) S.bound.get(id)?.el.classList.add("ibc-conflict");
    setSync();
    const html = body.conflicts.map(c => {
      const mine = S.pending.get(c.id);
      const entry = S.bound.get(c.id);
      const plain = entry?.b.plain;
      const theirs = c.theirs ? (c.theirs.plain ? c.theirs.text : textOf(c.theirs.html)) : null;
      const base = mine ? textOf(mine.from, plain) : "";
      return `<div class="chg vs" data-c="${c.id}">
        <div><b>Ara a GitHub (algú altre l'ha canviat)</b><div class="diff">${theirs !== null ? diffHtml(base, theirs) : "<span class='muted'>Aquest bloc ja no hi és.</span>"}</div></div>
        <div><b>El teu canvi</b><div class="diff">${diffHtml(base, textOf(mine?.to || c.mine, plain))}</div></div>
        <div class="row"><button class="btn btn-ghost" type="button" data-keep="theirs">Queda't la de GitHub</button>${theirs !== null ? `<button class="btn btn-primary" type="button" data-keep="mine">Queda't el meu</button>` : ""}</div>
      </div>`;
    }).join("");
    openSheet({
      title: body.conflicts.length === 1 ? "Un paràgraf ha canviat mentre l'editaves" : `${body.conflicts.length} paràgrafs han canviat mentre els editaves`,
      sub: "No s'ha publicat res. Tria quina versió es queda per a cada un; la resta de canvis es publicaran junts.",
      body: html,
      foot: [{ label: "Decideix-ho després", run: closeSheet }]
    });
    S._conflictPage = body.page;
  }
  $("sheetBody").addEventListener("click", async e => {
    const k = e.target.closest("[data-keep]");
    if (!k) return;
    const box = k.closest("[data-c]");
    const id = +box.dataset.c;
    const c = S._conflictPage;
    const mine = S.pending.get(id);
    const theirs = c && c.blocks.find(b => b.id === id);
    if (k.dataset.keep === "theirs") {
      S.pending.delete(id);
    } else if (mine && theirs) {
      // el meu text sobre la versió nova: ara el «from» és el que hi ha a GitHub
      S.pending.set(id, { ...mine, from: theirs.plain ? theirs.text : theirs.html });
    }
    S.conflicts.delete(id);
    box.remove();
    if (!$("sheetBody").querySelector("[data-c]")) {
      closeSheet();
      // es torna a carregar la pàgina amb la versió nova i, si queden canvis, es publiquen
      const pend = [...S.pending.values()];
      if (k.dataset.keep === "theirs" && !pend.length) { await refreshAfterConflict(); toast("Fet: es queda la versió de GitHub."); return; }
      if (pend.length) {
        S.busy = true; setSync();
        try {
          const r = await api("save", { page: S.page.page, edits: pend });
          S.pending.clear();
          await refreshAfterConflict(r.page);
          toast("Publicat. La web s'actualitza en un minut.");
        } catch (err) {
          if (err.status === 409 && err.body?.conflicts) showConflicts(err.body); else toast(err.message, { error: true });
        } finally { S.busy = false; setSync(); }
      }
    }
  });
  async function refreshAfterConflict(page) {
    S.pending.clear(); S.conflicts.clear();
    if (page) { S.page = page; S.head = page.head; } else { S.page = await api("page", { page: S.pageId }); S.head = S.page.head; }
    persistDraft();
    await refreshFrame();
  }

  /* ---------- comentaris ---------- */
  function textMap(doc) {
    const nodes = []; let full = "";
    const w = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { const p = n.parentElement; return !p || p.closest("script, style, noscript, template") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    let n;
    while ((n = w.nextNode())) { nodes.push({ n, s: full.length }); full += n.data; }
    return { full, nodes };
  }
  function offsetOf(map, container, offset) {
    if (container.nodeType === 3) { const e = map.nodes.find(x => x.n === container); return e ? e.s + offset : null; }
    const child = container.childNodes[offset];
    for (const e of map.nodes) {
      if (child) { if (child === e.n || child.contains(e.n) || (child.compareDocumentPosition(e.n) & Node.DOCUMENT_POSITION_FOLLOWING)) return e.s; }
      else if ((container.compareDocumentPosition(e.n) & Node.DOCUMENT_POSITION_FOLLOWING) && !container.contains(e.n)) return e.s;
    }
    return map.full.length;
  }
  function pointAt(map, off) {
    for (let i = map.nodes.length - 1; i >= 0; i--) if (map.nodes[i].s <= off) return { node: map.nodes[i].n, offset: Math.min(off - map.nodes[i].s, map.nodes[i].n.data.length) };
    return null;
  }
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function commonTail(a, b) { let k = 0; while (k < a.length && k < b.length && a[a.length - 1 - k] === b[b.length - 1 - k]) k++; return k; }
  function commonHead(a, b) { let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k; }
  /** Troba on és ara el text comentat (pot haver canviat de lloc). */
  function locate(map, c) {
    const q = norm(c.cita);
    if (!q) return null;
    let re;
    try { re = new RegExp(reEsc(q).replace(/ /g, "[\\s\\u00a0]+"), "g"); } catch { return null; }
    let best = null, m;
    while ((m = re.exec(map.full))) {
      const before = norm(map.full.slice(Math.max(0, m.index - 160), m.index));
      const after = norm(map.full.slice(m.index + m[0].length, m.index + m[0].length + 160));
      const score = commonTail(before, norm(c.abans || "")) + commonHead(after, norm(c.despres || ""));
      if (!best || score > best.score) best = { start: m.index, end: m.index + m[0].length, score };
      if (m[0].length === 0) re.lastIndex++;
    }
    if (!best) return null;
    const a = pointAt(map, best.start), b = pointAt(map, best.end);
    if (!a || !b) return null;
    const r = S.doc.createRange();
    try { r.setStart(a.node, a.offset); r.setEnd(b.node, b.offset); } catch { return null; }
    return r;
  }
  let ranges = new Map();
  function paintComments() {
    ranges = new Map();
    if (!S.doc || !S.page) return;
    const map = textMap(S.doc);
    for (const c of S.page.comments || []) { const r = locate(map, c); if (r) ranges.set(c.id, r); }
    const W = S.win;
    if (!W || !W.CSS || !W.CSS.highlights || !W.Highlight) return;
    W.CSS.highlights.set("ibc-comment", new W.Highlight(...[...ranges.entries()].filter(([id]) => id !== S.activeComment).map(([, r]) => r)));
    const act = ranges.get(S.activeComment);
    if (act) W.CSS.highlights.set("ibc-active", new W.Highlight(act)); else W.CSS.highlights.delete("ibc-active");
    updateCounts();
  }
  function renderComments() {
    const list = S.page?.comments || [];
    $("cCount").textContent = list.length ? String(list.length) : "";
    $("cList").innerHTML = list.length ? list.map(c => `
      <li><div class="cmt ${c.id === S.activeComment ? "on" : ""}" data-cid="${esc(c.id)}" tabindex="0">
        <q>${esc(norm(c.cita))}</q>
        <p>${esc(c.nota)}</p>
        <div class="meta"><span>${esc(ago(c.creat))}</span>${ranges.has(c.id) ? "" : '<span class="lost">no es troba al text</span>'}
          <button class="x" type="button" data-del="${esc(c.id)}">Treu</button></div>
      </div></li>`).join("") : '<li class="empty">Cap comentari pendent en aquesta pàgina.</li>';
  }
  $("cList").addEventListener("click", async e => {
    const del = e.target.closest("[data-del]");
    if (del) {
      e.stopPropagation();
      del.disabled = true;
      try {
        await api("uncomment", { id: del.dataset.del });
        S.page.comments = S.page.comments.filter(c => c.id !== del.dataset.del);
        const pg = S.pages.find(p => p.page === S.pageId); if (pg) pg.comments = S.page.comments.length;
        paintComments(); renderComments(); toast("Comentari tret.");
      } catch (err) { del.disabled = false; toast(err.message, { error: true }); }
      return;
    }
    const card = e.target.closest("[data-cid]");
    if (card) focusComment(card.dataset.cid);
  });
  function focusComment(id) {
    S.activeComment = id;
    paintComments(); renderComments();
    const r = ranges.get(id);
    if (r) {
      const el = r.startContainer.parentElement;
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }
  function onFrameClick(e) {
    if (!ranges.size) return;
    let pos = null;
    try { pos = S.doc.caretPositionFromPoint ? S.doc.caretPositionFromPoint(e.clientX, e.clientY) : null; } catch {}
    let node, off;
    if (pos) { node = pos.offsetNode; off = pos.offset; }
    else if (S.doc.caretRangeFromPoint) { const r = S.doc.caretRangeFromPoint(e.clientX, e.clientY); if (r) { node = r.startContainer; off = r.startOffset; } }
    if (!node) return;
    for (const [id, r] of ranges) {
      try { if (r.isPointInRange(node, off)) { if ($("popComments").hidden) togglePop("popComments"); focusComment(id); return; } } catch {}
    }
  }

  /* selecció → comentar */
  let selT;
  function onSelection() {
    clearTimeout(selT);
    selT = setTimeout(() => {
      const s = S.doc?.getSelection();
      if (!s || s.isCollapsed || !s.rangeCount || !$("composer").hidden) { if ($("composer").hidden) hideSelPill(); S.sel = s && !s.isCollapsed ? S.sel : null; return; }
      const r = s.getRangeAt(0);
      const map = textMap(S.doc);
      const a = offsetOf(map, r.startContainer, r.startOffset), b = offsetOf(map, r.endContainer, r.endOffset);
      if (a === null || b === null || b <= a) return;
      const quote = map.full.slice(a, b);
      if (!norm(quote)) return;
      const collapse = t => t.replace(/[\s\u00a0]+/g, " ");
      S.sel = { quote: norm(quote), prefix: collapse(map.full.slice(Math.max(0, a - 120), a)).trimStart().slice(-64), suffix: collapse(map.full.slice(b, b + 120)).trimEnd().slice(0, 64), rect: r.getBoundingClientRect() };
      showSelPill();
    }, 180);
  }
  function frameOffset() { return $("frame").getBoundingClientRect(); }
  function showSelPill() {
    if (!S.sel) return;
    const fr = frameOffset(), r = S.sel.rect, p = $("selpill");
    let x = fr.left + r.left + r.width / 2, y = fr.top + r.top - 8;
    const touch = !matchMedia("(hover: hover)").matches;
    if (touch || y < 60) { y = fr.top + r.bottom + 46; } // a sota en mòbil (a dalt hi ha el menú del sistema)
    p.style.left = Math.max(70, Math.min(innerWidth - 70, x)) + "px";
    p.style.top = Math.min(innerHeight - 90, y) + "px";
    p.hidden = false;
  }
  function hideSelPill() { $("selpill").hidden = true; }
  function openComposer() {
    if (!S.sel) { setMode("comment"); return; }
    hideSelPill(); closePops();
    $("composerQuote").textContent = S.sel.quote.length > 180 ? S.sel.quote.slice(0, 180) + "…" : S.sel.quote;
    $("composerNote").value = "";
    $("composer").hidden = false;
    S.composerSel = S.sel;
    // el focus surt de la pàgina abans que res: el que s'escrigui ha d'anar al comentari, mai al paràgraf
    try { S.doc.activeElement?.blur(); } catch {}
    $("composerNote").focus();
    placeComposer();
  }
  function placeComposer() {
    const c = $("composer");
    if (c.hidden || !S.composerSel || innerWidth <= 640) return;
    const fr = frameOffset(), r = S.composerSel.rect;
    const w = c.offsetWidth, h = c.offsetHeight;
    let left = fr.left + r.left + r.width / 2 - w / 2;
    let top = fr.top + r.bottom + 10;
    if (top + h > innerHeight - 80) top = fr.top + r.top - h - 10;
    c.style.left = Math.max(12, Math.min(innerWidth - w - 12, left)) + "px";
    c.style.top = Math.max(12, top) + "px";
  }
  function closeComposer() { $("composer").hidden = true; S.composerSel = null; }
  $("composerCancel").onclick = closeComposer;
  $("composerNote").addEventListener("keydown", e => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendComment(); }
    if (e.key === "Escape") closeComposer();
  });
  $("composerSend").onclick = sendComment;
  async function sendComment() {
    const sel = S.composerSel, note = $("composerNote").value.trim();
    if (!sel || !note) { $("composerNote").focus(); return; }
    $("composerSend").disabled = true;
    try {
      const r = await api("comment", { page: S.page.page, quote: sel.quote, prefix: sel.prefix, suffix: sel.suffix, note });
      S.page.comments = [...(S.page.comments || []), r.comment];
      const pg = S.pages.find(p => p.page === S.pageId); if (pg) pg.comments = S.page.comments.length;
      closeComposer();
      try { S.doc.getSelection().removeAllRanges(); } catch {}
      S.sel = null;
      paintComments(); if (!$("popComments").hidden) renderComments();
      toast("Comentari desat per a l'agent.");
    } catch (e) { toast(e.message, { error: true }); }
    finally { $("composerSend").disabled = false; }
  }

  /* ---------- teclat ---------- */
  function onGlobalKey(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); openPublish(); return; }
    if (e.key === "Escape") { closePops(); closeComposer(); closeSheet(); hideSelPill(); return; }
    if (mod || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (e.key === "v" || e.key === "V") setMode("point");
    else if (e.key === "t" || e.key === "T" || e.key === "e" || e.key === "E") setMode("edit");
    else if (e.key === "c" || e.key === "C") { if (S.sel) openComposer(); else setMode("comment"); }
    else if (e.key === "/" ) { e.preventDefault(); togglePop("popPages"); }
  }
  document.addEventListener("keydown", onGlobalKey);

  /* mòbil: la barra puja per sobre del teclat */
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const fit = () => {
      const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
      $("dock").style.bottom = kb > 80 ? `${kb + 8}px` : "";
    };
    vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit);
  }
  addEventListener("resize", () => { hideSelPill(); placeComposer(); });

  /* ---------- arrencada ---------- */
  async function boot() {
    if (await takeIdentityReturn()) return;
    let me;
    try { me = (await api("me")).me; }
    catch (e) { if (e.status === 401) return showLogin(); $("login").hidden = false; $("loginErr").textContent = e.message; return; }
    S.me = me;
    $("login").hidden = true;
    $("app").hidden = false;
    if (!$("dock").children.length) buildDock();
    $("meName").textContent = me.name; $("meMail").textContent = me.email;
    if (me.picture) { $("meImg").src = me.picture; $("avatar").src = me.picture; $("avatar").hidden = false; $("avatarFallback").remove(); }
    try { const r = await api("pages"); S.pages = r.pages; } catch (e) { toast(e.message, { error: true }); }
    // el service worker de la web no ha de servir còpies velles a l'editor
    try { navigator.serviceWorker?.getRegistration().then(r => r && r.update()); } catch {}
    openPage(pageFromHash());
  }
  boot();
})();
