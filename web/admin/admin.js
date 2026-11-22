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
    if (res.status === 401 && route !== "me" && route !== "login" && $("login").hidden) { persistDraft(); showLogin("La sessió ha caducat. Torna a entrar; els canvis sense publicar es mantenen."); }
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
    closeSheet(); closeComposer();
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
    $("gbtn").disabled = false;
    $("gbtn").onclick = () => {
      try { sessionStorage.setItem("ibcms:back", location.hash); } catch {}
      $("gbtn").disabled = true;
      location.href = "/.netlify/identity/authorize?provider=google";
    };
  }

  /* ---------- barra inferior ---------- */
  function buildDock() {
    $("dock").innerHTML = `
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
  const POPS = { popComments: "bComments", popMe: "bMe" };
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
    if (id !== "popComments") closeComposer();
    $(id).hidden = !open;
    $(POPS[id]).setAttribute("aria-expanded", String(open));
    $(POPS[id]).classList.toggle("is-open", open);
    if (open && id === "popComments") renderComments();
  }
  document.addEventListener("pointerdown", e => {
    if (e.target.closest(".pop, .dock, .composer, .sheet-wrap, .selpill")) return;
    closePops();
  });

  /* ---------- pàgines ---------- */
  function go(page) {
    const h = "#" + (page || "/");
    if (location.hash !== h) location.hash = h; else openPage(page);
  }
  addEventListener("hashchange", () => {
    const page = pageFromHash();
    if (page === S.pageId && S.page) return;
    // mentre es publica no es pot canviar de pàgina (el que s'envia és d'aquesta)
    if (S.busy) { history.replaceState(null, "", "#" + (S.pageId || "/")); toast("Espera que acabi de publicar."); return; }
    openPage(page);
  });
  function pageFromHash() {
    let h = "";
    try { h = decodeURIComponent(location.hash.slice(1)); } catch { return ""; }
    h = h === "/" || h === "" ? "" : h.replace(/^\//, "");
    if (/^articles\/[a-z0-9-]+$/.test(h)) h += "/";
    return h;
  }
  /** Pàgina editable a partir d'un camí de la web ("/" o "/articles/x/"); null si no n'és cap. */
  function pageFromPath(pathname) {
    if (/^\/(?:index\.html)?$/.test(pathname)) return "";
    const m = /^\/(articles\/[a-z0-9-]+\/)(?:index\.html)?$/.exec(pathname);
    return m && S.pages.some(p => p.page === m[1]) ? m[1] : null;
  }

  /* ---------- obrir una pàgina ---------- */
  let openSeq = 0;
  async function openPage(page) {
    const seq = ++openSeq;
    persistDraft();
    loading(true);
    // res de la pàgina d'abans no pot quedar viu: ni edició, ni selecció, ni fulls oberts, ni conflictes
    closeComposer(); hideSelPill(); closeSheet(); closePops();
    S.sel = null; S.composerSel = null; S.review = null; S.conflictInfo = null; S._conflictPage = null; S.freshBlocks = null;
    unbindDoc();
    $("notice").hidden = true;
    S.bound.clear(); S.pending.clear(); S.conflicts.clear(); S.page = null; S.pageId = page; S.staleTries = 0; S.headChangedAt = 0;
    updateCounts();
    let data;
    try { data = await api("page", { page }); }
    catch (e) {
      if (seq !== openSeq) return;
      loading(false);
      if (e.status !== 401) notice(esc(e.message), "red", { label: "Torna-ho a provar", run: () => openPage(page) });
      return;
    }
    if (seq !== openSeq) return;
    S.page = data; S.head = data.head;
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

  /** Carrega una pàgina a l'iframe sense afegir cap entrada a l'historial (així «enrere» és sempre de l'editor). */
  let frameWait = null;
  const pathOf = page => "/" + page;
  function framePath() {
    try { return $("frame").contentWindow.location.pathname.replace(/index\.html$/, ""); } catch { return null; }
  }
  function loadFrame(url) {
    return new Promise(resolve => {
      const f = $("frame");
      if (frameWait) { clearTimeout(frameWait.t); frameWait.resolve(); } // una càrrega anterior que ja no compta
      // només compta la càrrega de la pàgina demanada (no una de l'historial que arribi pel mig)
      frameWait = { path: url, resolve, t: setTimeout(() => { if (frameWait && frameWait.resolve === resolve) { frameWait = null; resolve(); } }, 20000) };
      const full = url + (url.includes("?") ? "&" : "?") + "ib-cms=" + Date.now();
      try { f.contentWindow.location.replace(full); } catch { f.src = full; }
    });
  }
  // Qualsevol càrrega de l'iframe passa per aquí. Si no l'ha demanada l'editor (un enllaç que s'escapa, un
  // script de la pàgina, l'historial), es torna a posar l'editor d'acord amb el que es veu.
  $("frame").addEventListener("load", () => {
    let path = framePath();
    if (frameWait && path === frameWait.path) { const w = frameWait; frameWait = null; clearTimeout(w.t); w.resolve(); return; }
    if (frameWait) {
      // ha arribat una altra pàgina (p. ex. de l'historial) en lloc de la demanada: es torna a demanar
      if ((frameWait.retries = (frameWait.retries || 0) + 1) <= 3) {
        try { $("frame").contentWindow.location.replace(frameWait.path + "?ib-cms=" + Date.now()); } catch {}
      }
      return;
    }
    unbindDoc();
    if (path === null) return;
    const page = pageFromPath(path || "");
    if (page === null) { notice("Aquesta pàgina no es pot editar. Torna enrere o ves a un article.", "amber", { label: "Torna a la portada", run: () => go("") }); return; }
    if (page !== S.pageId) { if (S.busy) return; go(page); return; }
    // la mateixa pàgina s'ha tornat a carregar: es tornen a posar els canvis sense publicar a sobre
    if (S.page) { persistDraft(); S.pending.clear(); bindAll(); restoreDraft({ quiet: true }); paintComments(); updateCounts(); }
  });
  /** Treu l'edició del document que hi hagi a l'iframe (abans de canviar de pàgina o si es perd). */
  function unbindDoc() {
    try {
      if (S.doc) for (const el of S.doc.querySelectorAll("[data-ibc]")) { el.removeAttribute("contenteditable"); el.removeAttribute("data-ibc"); }
    } catch {}
    S.doc = null; S.win = null; S.bound.clear();
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
    if (!doc || !doc.body || !S.page) return;
    // mai aparellar els blocs d'una pàgina amb una altra que s'hagi colat a l'iframe
    if (framePath() !== pathOf(S.page.page)) { S.unbound = S.page.blocks.length; S.doc = null; return; }
    S.doc = doc; S.win = win;
    if (!doc.getElementById("ibc-css")) {
      const st = doc.createElement("style"); st.id = "ibc-css"; st.textContent = FRAME_CSS; doc.head.appendChild(st);
      try { doc.execCommand("styleWithCSS", false, false); } catch {}
      // cap enllaç no navega mentre s'edita; cap formulari s'envia
      doc.addEventListener("click", onFrameLink, true);
      doc.addEventListener("submit", e => e.preventDefault(), true);
      doc.addEventListener("input", onInput);
      // mòbil: molts teclats no envien keydown «Enter», només beforeinput; tampoc es pot deixar caure res
      doc.addEventListener("beforeinput", e => {
        if (!e.target.closest?.("[data-ibc]")) return;
        if (S.busy || S.mode !== "edit") { e.preventDefault(); return; }
        if (/^(insertParagraph|insertLineBreak|insertFromDrop|insertFromPasteAsQuotation)$/.test(e.inputType)) e.preventDefault();
      });
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
    // el lloc només serveix si la gran majoria ja coincideix pel text (si no, potser no és la mateixa pàgina)
    const matched = at.filter(x => x >= 0).length;
    const trustPlace = blocks.length > 0 && matched / blocks.length >= 0.6;
    const fill = (k, i) => {
      if (!trustPlace) return;
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
      let orig, opt = null;
      if (b.plain) orig = norm(b.text);
      else {
        tpl.innerHTML = b.html;
        opt = serOpts(b.html);
        orig = serialize(tpl.content, opt);
        if (serialize(el, opt) !== orig) el.innerHTML = b.html; // el JS de la pàgina l'havia retocat: es torna a la font
      }
      el.dataset.ibc = String(b.id);
      if (b.plain) el.dataset.plain = "1";
      S.bound.set(b.id, { b, el, orig, opt, idx: k });
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
      if (S.mode === "edit" && !S.busy) {
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
  // mateixa llista que el servidor (cms/lib/html.mjs, ATTR_RULES): el que no hi és, el navegador ho perd en desar
  const ATTRS = new Set(["href", "class", "id", "data-c", "lang", "aria-label", "title", "target", "rel"]);
  const attrOk = n => ATTRS.has(n);
  const escText = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;");
  const escAttr = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  /** HTML net d'un bloc. Opcions (segons com era el bloc a la font, perquè el que no canvia no es toqui):
      keepSpan: hi havia <span> sense atributs (amb estil propi a l'article) → es conserven; si no, són del navegador.
      keepNbsp: hi havia espais durs → es conserven; si no, els que hi posa el navegador en escriure tornen a ser espais.
      collapse: no hi havia espais repetits → dos espais seguits (en esborrar una paraula) queden en un. */
  function serialize(node, opt = {}) {
    let out = "";
    for (const c of node.childNodes) {
      if (c.nodeType === 3) {
        let t = c.data;
        if (!opt.keepNbsp) t = t.replace(/\u00a0/g, " ");
        if (opt.collapse) t = t.replace(/ {2,}/g, " ");
        out += escText(t);
        continue;
      }
      if (c.nodeType !== 1) continue;
      const t = c.localName;
      const attrs = [...c.attributes].filter(a => attrOk(a.name));
      if (!INLINE.has(t) || (t === "span" && !attrs.length && !opt.keepSpan)) { out += serialize(c, opt); continue; } // el navegador de vegades hi posa <div>, <font> o <span> buits
      const a = attrs.map(x => ` ${x.name}="${escAttr(x.value)}"`).join("");
      if (t === "br" || t === "wbr") { out += `<${t}${a}>`; continue; }
      const inner = serialize(c, opt);
      if (!inner && t !== "a") continue; // format buit que queda després d'esborrar
      out += `<${t}${a}>${inner}</${t}>`;
    }
    return opt.collapse ? out.replace(/ {2,}/g, " ") : out;
  }
  function serOpts(html) {
    return { keepSpan: /<span>/.test(html), keepNbsp: /&nbsp;|&#160;|\u00a0/.test(html), collapse: !/\s{2,}/.test(html) };
  }
  function currentValue(entry) {
    if (entry.b.plain) return norm(entry.el.textContent);
    let v = serialize(entry.el, entry.opt || {}).replace(/(<br>)+$/, "");
    // vores: sense espais nous al principi o al final que no hi fossin
    if (!/^\s/.test(entry.orig)) v = v.replace(/^(\s|&nbsp;)+/, "");
    if (!/\s$/.test(entry.orig)) v = v.replace(/(\s|&nbsp;)+$/, "");
    return v;
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
    afterPendingChange();
  }
  function onFrameKey(e) {
    const el = e.target?.closest?.("[data-ibc]");
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); openPublish(); return; }
    if (el && e.key === "Enter" && !e.isComposing) { e.preventDefault(); return; } // cada bloc és un sol paràgraf
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
    if (/^(https?|mailto):$/.test(u.protocol)) window.open(u.href, "_blank", "noopener");
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
  /** Torna a posar els canvis guardats al navegador. Primer al mateix bloc (mateix número i mateix text d'origen);
      si no, a un altre bloc amb el mateix text d'origen. El que no es pot col·locar NO s'esborra: va a «canvis
      apartats», d'on l'editor el pot copiar o descartar. */
  function restoreDraft({ quiet = false } = {}) {
    const d = store.get(draftKey(S.page.page));
    if (!d || !Array.isArray(d.edits) || !d.edits.length) return;
    let ok = 0;
    const lost = [];
    const entries = [...S.bound.values()];
    const fromOf = x => (x.b.plain ? x.b.text : x.b.html);
    for (const e of d.edits) {
      if (!e || typeof e.from !== "string" || typeof e.to !== "string") continue;
      const entry = entries.find(x => x.b.id === e.id && fromOf(x) === e.from && !S.pending.has(x.b.id))
        || entries.find(x => fromOf(x) === e.from && !S.pending.has(x.b.id));
      if (!entry) { lost.push(e); continue; }
      if (entry.b.plain) entry.el.textContent = e.to;
      else { const t = S.doc.createElement("template"); t.innerHTML = e.to; entry.el.replaceChildren(...serializeToNodes(t.content, entry.opt)); }
      const to = currentValue(entry);
      if (to !== entry.orig) { S.pending.set(entry.b.id, { id: entry.b.id, from: e.from, to }); entry.el.classList.add("ibc-dirty"); ok++; }
    }
    if (lost.length) setAside(lost);
    updateCounts();
    persistDraft();
    if (ok && !quiet) toast(`Recuperats ${ok} ${ok === 1 ? "canvi" : "canvis"} sense publicar.`);
    if (lost.length) notice(`${lost.length === 1 ? "Un canvi guardat no s'ha pogut" : lost.length + " canvis guardats no s'han pogut"} tornar a posar: aquell text ha canviat a GitHub. No s'ha perdut res.`, "amber", { label: "Mostra'ls", run: showAside });
  }
  /** Passa el text (ja net) per un <template> i en torna els nodes: res del draft s'executa ni s'hi cola. */
  function serializeToNodes(frag, opt) {
    const t = S.doc.createElement("template");
    t.innerHTML = serialize(frag, opt || {});
    return [...t.content.childNodes];
  }

  /* canvis apartats: el que no s'ha pogut aplicar, per no perdre mai el text de l'editor */
  const asideKey = page => `ibcms:apartats:${page || "/"}`;
  function setAside(items) {
    if (!S.page) return;
    const cur = store.get(asideKey(S.page.page)) || [];
    for (const e of items) if (!cur.some(x => x.to === e.to)) cur.push({ to: e.to, from: e.from, at: Date.now() });
    store.set(asideKey(S.page.page), cur.slice(-50));
  }
  function showAside() {
    const list = (S.page && store.get(asideKey(S.page.page))) || [];
    if (!list.length) { toast("No hi ha cap canvi apartat."); return; }
    openSheet({
      title: list.length === 1 ? "Un canvi apartat" : `${list.length} canvis apartats`,
      sub: "Aquests textos no s'han pogut posar al seu lloc perquè el paràgraf ha canviat a GitHub. Copia el que vulguis i enganxa'l on toqui.",
      body: list.map((e, i) => `<div class="chg"><div class="chg-head"><span>${esc(ago(new Date(e.at).toISOString()))}</span>
        <button class="lnk" type="button" data-copy-aside="${i}">Copia</button><button class="lnk" type="button" data-drop-aside="${i}">Descarta</button></div>
        <div class="diff">${esc(textOf(e.to, !/<[a-z]/i.test(e.to)))}</div></div>`).join(""),
      foot: [{ label: "Tanca", run: closeSheet }]
    });
  }
  $("sheetBody").addEventListener("click", async e => {
    const c = e.target.closest("[data-copy-aside],[data-drop-aside],[data-copy-mine]");
    if (!c || !S.page) return;
    if (c.dataset.copyMine !== undefined) {
      const m = S.pending.get(+c.dataset.copyMine) || S.conflictInfo?.get(+c.dataset.copyMine);
      const txt = m ? textOf(m.to || m.mine || "", !/<[a-z]/i.test(m.to || m.mine || "")) : "";
      try { await navigator.clipboard.writeText(txt); toast("Copiat."); } catch { toast("No s'ha pogut copiar.", { error: true }); }
      return;
    }
    const list = store.get(asideKey(S.page.page)) || [];
    const i = +(c.dataset.copyAside ?? c.dataset.dropAside);
    if (!list[i]) return;
    if (c.dataset.copyAside !== undefined) {
      try { await navigator.clipboard.writeText(textOf(list[i].to, !/<[a-z]/i.test(list[i].to))); toast("Copiat."); } catch { toast("No s'ha pogut copiar.", { error: true }); }
    } else {
      list.splice(i, 1);
      if (list.length) store.set(asideKey(S.page.page), list); else store.del(asideKey(S.page.page));
      if (list.length) showAside(); else { closeSheet(); toast("Descartat."); }
    }
  });
  addEventListener("beforeunload", e => { persistDraft(); if (S.pending.size) { e.preventDefault(); e.returnValue = ""; } });
  addEventListener("pagehide", persistDraft);
  addEventListener("pageshow", () => { if ($("gbtn")) $("gbtn").disabled = false; }); // en tornar enrere des de Google

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
    const pb = $("bPublish");
    if (pb) {
      pb.classList.toggle("has-conflict", S.conflicts.size > 0);
      pb.dataset.tip = S.busy ? "Publicant…" : S.conflicts.size ? "Hi ha blocs en conflicte: torna a publicar per triar" : "Revisa i publica  ⌘S";
    }
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
    if (!S.page || S.busy || document.hidden || $("app").hidden) return;
    const seq = openSeq, page = S.page.page;
    const still = () => seq === openSeq && S.page && S.page.page === page && !S.busy;
    let r;
    try { r = await api("head"); } catch { return; }
    if (!still()) return;
    if (!r.head || r.head === S.head) {
      // blocs sense aparellar: la web encara s'està publicant. Es torna a mirar uns minuts després d'un canvi,
      // mai mentre s'escriu, se selecciona o es comenta (recarregar ho esborraria)
      const quiet = !S.pending.size && !S.sel && $("composer").hidden && $("sheetWrap").hidden;
      if (S.unbound && quiet && S.staleTries < 8 && Date.now() - (S.headChangedAt || 0) < 6 * 60000) { S.staleTries++; refreshFrame(); }
      return;
    }
    let fresh;
    try { fresh = await api("page", { page }); } catch { return; }
    if (!still() || fresh.page !== page) return;
    S.head = fresh.head; S.headChangedAt = Date.now(); S.staleTries = 0;
    const current = S.freshBlocks || S.page.blocks;
    const same = JSON.stringify(fresh.blocks) === JSON.stringify(current);
    const sameComments = JSON.stringify(fresh.comments) === JSON.stringify(S.page.comments);
    S.page = { ...fresh, blocks: S.page.blocks, history: fresh.history }; // els blocs aparellats no es canvien mentre hi hagi canvis pendents
    if (!sameComments) {
      // l'agent ha resolt (o algú ha afegit) comentaris: es repinten sols
      const pg = S.pages.find(p => p.page === page); if (pg) pg.comments = (fresh.comments || []).length;
      paintComments(); updateCounts();
      if (!$("popComments").hidden) renderComments();
    }
    if (same) return;
    S.freshBlocks = fresh.blocks;
    if (S.pending.size || !$("sheetWrap").hidden || !$("composer").hidden) {
      notice("Hi ha una versió nova d'aquesta pàgina a GitHub (Claude Code o una altra pestanya). En publicar, els teus canvis s'hi combinaran.", "amber");
      return;
    }
    await applyFresh();
  }
  /** Passa a la versió nova de GitHub (quan no hi ha res pendent que depengui de la vella). */
  async function applyFresh() {
    if (!S.freshBlocks || S.pending.size || S.busy) return;
    S.page = { ...S.page, blocks: S.freshBlocks }; S.freshBlocks = null;
    notice("Hi ha una versió nova d'aquesta pàgina a GitHub. Carregant-la…", "blue");
    await refreshFrame();
  }
  /** Quan s'han desfet tots els canvis pendents, si hi havia una versió nova esperant, s'aplica. */
  function afterPendingChange() { if (!S.pending.size && S.freshBlocks) applyFresh(); }
  async function refreshFrame() {
    if (!S.page) return;
    const seq = openSeq, page = S.page.page;
    const y = S.win ? S.win.scrollY : 0;
    await loadFrame("/" + page);
    if (seq !== openSeq || !S.page || S.page.page !== page) return;
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
  $("sheetClose").onclick = () => { if (!S.busy) closeSheet(); };
  $("sheetWrap").addEventListener("pointerdown", e => { if (e.target === $("sheetWrap") && !S.busy) closeSheet(); });

  const KIND = { h1: "Títol", h2: "Intertítol", h3: "Intertítol", h4: "Intertítol", li: "Element de llista", figcaption: "Peu", dt: "Terme", dd: "Definició", blockquote: "Cita", td: "Cel·la", th: "Cel·la" };
  function kindOf(entry) {
    if (!entry) return "Bloc";
    if (entry.b.plain) return entry.b.tag === "h2" ? "Títol de la targeta" : "Descripció de la targeta";
    return KIND[entry.b.tag] || "Paràgraf";
  }
  /** El que s'envia per a cada canvi: el text d'abans, el nou i els blocs veïns (per trobar-lo encara que la
      pàgina hagi canviat, i per no confondre'l mai amb un bloc idèntic). */
  function payload(e, blocks = S.page.blocks) {
    const i = blocks.findIndex(b => b.id === e.id);
    const c = b => (b ? (b.plain ? b.text : b.html) : null);
    const b = blocks[i];
    return { id: e.id, tag: b?.tag, from: e.from, to: e.to, prev: c(blocks[i - 1]), next: c(blocks[i + 1]), dup: !!b && blocks.filter(x => c(x) === c(b)).length > 1 };
  }

  function openPublish() {
    if (!S.pending.size || S.busy || !S.page) return;
    const items = [...S.pending.values()].sort((a, b) => a.id - b.id).map(e => ({ ...e }));
    const empty = items.filter(e => !textOf(e.to, S.bound.get(e.id)?.b.plain).trim());
    // el que es revisa és exactament el que es publica (i de quina pàgina)
    S.review = { seq: openSeq, page: S.page.page, items };
    const body = items.map(e => {
      const entry = S.bound.get(e.id);
      const fo = formatOnly(e, entry);
      const isEmpty = empty.includes(e);
      return `<div class="chg" data-id="${e.id}">
        <div class="chg-head"><span>${kindOf(entry)}</span>${isEmpty ? '<span class="tag warn">buit</span>' : fo ? '<span class="tag">només format</span>' : ""}
          <button class="lnk" type="button" data-go="${e.id}">Mostra</button><button class="lnk" type="button" data-undo="${e.id}">Desfés</button></div>
        <div class="diff">${diffHtml(textOf(e.from, entry?.b.plain), textOf(e.to, entry?.b.plain))}</div></div>`;
    }).join("");
    openSheet({
      title: `Publica ${items.length} ${items.length === 1 ? "canvi" : "canvis"}`,
      sub: empty.length ? "Hi ha un bloc buit: escriu-hi alguna cosa o desfés el canvi abans de publicar." : "Es desa a GitHub com un commit (on també ho veu Claude Code) i la web s'actualitza en un minut.",
      body,
      foot: [
        { label: "Descarta-ho tot", cls: "btn-danger", grow: true, run: discardAll },
        { label: "Continua editant", run: closeSheet },
        { label: "Publica", cls: "btn-primary", id: "doPublish", run: publish }
      ]
    });
    if (empty.length) $("doPublish").disabled = true;
  }
  $("sheetBody").addEventListener("click", e => {
    const u = e.target.closest("[data-undo]"), g = e.target.closest("[data-go]");
    if (u && !S.busy) {
      const id = +u.dataset.undo;
      revert(id);
      if (S.review) S.review.items = S.review.items.filter(x => x.id !== id);
      u.closest(".chg").remove();
      if (!S.pending.size || !S.review?.items.length) closeSheet();
      else {
        $("sheetTitle").textContent = `Publica ${S.review.items.length} ${S.review.items.length === 1 ? "canvi" : "canvis"}`;
        if (!$("sheetBody").querySelector(".tag.warn") && $("doPublish")) { $("doPublish").disabled = false; $("sheetSub").textContent = "Es desa a GitHub com un commit (on també ho veu Claude Code) i la web s'actualitza en un minut."; }
      }
    }
    if (g && !S.busy) { closeSheet(); reveal(S.bound.get(+g.dataset.go)?.el); }
  });
  function revert(id) {
    const entry = S.bound.get(id);
    if (entry) {
      if (entry.b.plain) entry.el.textContent = entry.b.text; else entry.el.innerHTML = entry.b.html;
      entry.el.classList.remove("ibc-dirty", "ibc-conflict");
    }
    S.pending.delete(id); S.conflicts.delete(id);
    updateCounts(); persistDraft();
    afterPendingChange();
  }
  function discardAll(e) {
    const b = e?.currentTarget;
    if (b && !b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "Segur? Torna a clicar"; return; } // sense diàlegs del navegador
    for (const id of [...S.pending.keys()]) revert(id);
    closeSheet();
    toast("Canvis descartats.");
  }
  function reveal(el) {
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.animate([{ boxShadow: "0 0 0 6px rgba(44,93,168,.45)" }, { boxShadow: "0 0 0 0 rgba(44,93,168,0)" }], { duration: 1200, easing: "ease-out" });
  }
  function setBusy(on) {
    S.busy = on;
    applyMode(); // mentre es publica, res no és editable (el que s'hi escrivís es perdria)
    $("sheetWrap").classList.toggle("is-busy", on);
    setSync();
  }

  async function publish() {
    const R = S.review;
    if (S.busy || !R || R.seq !== openSeq || R.page !== S.page?.page || !R.items.length) return;
    setBusy(true);
    const btn = $("doPublish"); if (btn) { btn.disabled = true; btn.textContent = "Publicant…"; }
    try {
      const r = await api("save", { page: R.page, edits: R.items.map(e => payload(e)) });
      afterSave(r.page, R.items);
      closeSheet();
      $("notice").hidden = true;
      toast(r.unchanged ? "No hi havia res a canviar." : "Publicat. La web s'actualitza en un minut.");
    } catch (e) {
      if (e.status === 409 && e.body?.conflicts) { closeSheet(); showConflicts(e.body); }
      else {
        toast(e.message, { error: true, ms: 6000 });
        if (e.body?.id !== undefined) S.bound.get(e.body.id)?.el.classList.add("ibc-conflict");
        if (btn) { btn.disabled = false; btn.textContent = "Publica"; }
      }
    } finally {
      setBusy(false);
    }
  }
  /** Després de desar: la pàgina ja diu el text nou; es tornen a aparellar els blocs amb la versió del commit.
      Només surten de «pendents» els canvis que s'han enviat i que no s'han tornat a tocar. */
  function afterSave(page, sent) {
    const sentTo = new Map(sent.map(e => [e.id, e.to]));
    const still = [...S.pending.values()].filter(e => sentTo.get(e.id) !== e.to);
    S.page = page; S.head = page.head; S.freshBlocks = null;
    S.pending = new Map(); S.conflicts = new Set(); S.conflictInfo = null; S.review = null;
    persistDraft();
    bindAll();
    if (still.length) { store.set(draftKey(page.page), { at: Date.now(), edits: still }); restoreDraft({ quiet: true }); }
    paintComments(); updateCounts();
  }

  function showConflicts(body) {
    S.conflicts = new Set(body.conflicts.map(c => c.id));
    S.conflictInfo = new Map(body.conflicts.map(c => [c.id, c]));
    S._conflictPage = body.page;
    S.resolved = new Map();
    for (const id of S.conflicts) S.bound.get(id)?.el.classList.add("ibc-conflict");
    setSync();
    const html = body.conflicts.map(c => {
      const mine = S.pending.get(c.id);
      const entry = S.bound.get(c.id);
      const plain = entry?.b.plain;
      const theirs = c.theirs ? (c.theirs.plain ? c.theirs.text : textOf(c.theirs.html)) : null;
      const base = mine ? textOf(mine.from, plain) : "";
      const what = c.why === "ambiguous" ? "Hi ha dos blocs iguals i no es pot saber segur quin era el teu." : theirs === null ? "Aquest bloc ja no hi és (o ha canviat tant que no es pot reconèixer)." : "";
      return `<div class="chg vs" data-c="${c.id}">
        <div><b>${kindOf(entry)} · ara a GitHub</b><div class="diff">${theirs !== null ? diffHtml(base, theirs) : `<span class='muted'>${what}</span>`}</div></div>
        <div><b>El teu canvi</b><div class="diff">${diffHtml(base, textOf(mine?.to || c.mine, plain))}</div></div>
        <div class="row"><button class="btn btn-ghost" type="button" data-copy-mine="${c.id}">Copia el meu text</button>
          <button class="btn btn-ghost" type="button" data-keep="theirs">${theirs !== null ? "Queda't la de GitHub" : "Deixa-ho estar"}</button>${theirs !== null ? `<button class="btn btn-primary" type="button" data-keep="mine">Queda't el meu</button>` : ""}</div>
      </div>`;
    }).join("");
    openSheet({
      title: body.conflicts.length === 1 ? "Un bloc ha canviat mentre l'editaves" : `${body.conflicts.length} blocs han canviat mentre els editaves`,
      sub: "No s'ha publicat res. Tria què es queda per a cada un; després es publiquen tots junts.",
      body: html,
      foot: [{ label: "Decideix-ho després", run: closeSheet }]
    });
  }
  $("sheetBody").addEventListener("click", async e => {
    const k = e.target.closest("[data-keep]");
    if (!k || S.busy || !S.conflictInfo) return;
    const box = k.closest("[data-c]");
    const id = +box.dataset.c;
    const info = S.conflictInfo.get(id);
    const mine = S.pending.get(id);
    if (!info) return;
    if (k.dataset.keep === "theirs") {
      if (mine) setAside([mine]); // el text de l'editor no es perd mai: queda a «canvis apartats»
      S.pending.delete(id);
    } else if (mine && info.theirs) {
      // el meu text sobre el bloc que hi ha ara a GitHub (amb els seus veïns d'ara)
      S.resolved.set(id, payload({ id: info.theirs.id, from: info.theirs.plain ? info.theirs.text : info.theirs.html, to: mine.to }, S._conflictPage.blocks));
    }
    S.conflicts.delete(id);
    box.remove();
    if ($("sheetBody").querySelector("[data-c]")) return;
    closeSheet();
    const seq = openSeq, page = S.page.page;
    const edits = [...S.pending.values()].filter(x => !S.conflictInfo.has(x.id)).map(x => payload(x)).concat([...S.resolved.values()]);
    if (!edits.length) { await refreshAfterConflict(); toast("Fet: es queda la versió de GitHub."); return; }
    setBusy(true);
    try {
      const r = await api("save", { page, edits });
      if (seq !== openSeq) return;
      await refreshAfterConflict(r.page, [], { published: true });
      toast("Publicat. La web s'actualitza en un minut.");
    } catch (err) {
      if (seq !== openSeq) return;
      if (err.status === 409 && err.body?.conflicts) {
        // ha tornat a canviar mentre triaves: res publicat; tot queda com a canvis pendents sobre la versió nova
        await refreshAfterConflict(err.body.page, [...S.resolved.values()].map(x => ({ id: x.id, from: x.from, to: x.to })));
        notice("Ha tornat a canviar a GitHub mentre triaves. No s'ha publicat res; revisa-ho i torna a publicar.", "amber");
      } else toast(err.message, { error: true });
    } finally { setBusy(false); }
  });
  /** Torna a carregar la pàgina (versió nova) i hi torna a posar els canvis que encara no s'han publicat. */
  async function refreshAfterConflict(page, carry = [], { published = false } = {}) {
    const keep = published ? [] : [...S.pending.values()].filter(x => !S.conflictInfo?.has(x.id) && !S.resolved?.has(x.id));
    if (page) { S.page = page; S.head = page.head; } else { S.page = await api("page", { page: S.pageId }); S.head = S.page.head; }
    S.pending.clear(); S.conflicts.clear(); S.conflictInfo = null; S.resolved = null; S.freshBlocks = null;
    store.set(draftKey(S.page.page), { at: Date.now(), edits: [...keep, ...carry] });
    await refreshFrame();
    restoreDraft({ quiet: true });
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
  $("cList").addEventListener("keydown", e => {
    const card = e.target.closest("[data-cid]");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); focusComment(card.dataset.cid); }
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
    if (!sel || !note || !S.page) { $("composerNote").focus(); return; }
    const seq = openSeq, page = S.page.page;
    $("composerSend").disabled = true;
    try {
      const r = await api("comment", { page, quote: sel.quote, prefix: sel.prefix, suffix: sel.suffix, note });
      if (seq !== openSeq || !S.page) { toast("Comentari desat per a l'agent."); return; }
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
    if (e.key === "Escape") { closePops(); closeComposer(); if (!S.busy) closeSheet(); hideSelPill(); return; }
    if (mod || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (!$("sheetWrap").hidden || $("app").hidden) return; // ni amb un full obert ni a la pantalla de login
    if (e.key === "v" || e.key === "V") { e.preventDefault(); setMode("point"); }
    else if (e.key === "t" || e.key === "T" || e.key === "e" || e.key === "E") { e.preventDefault(); setMode("edit"); }
    else if (e.key === "c" || e.key === "C") { e.preventDefault(); if (S.sel) openComposer(); else setMode("comment"); }
  }
  document.addEventListener("keydown", onGlobalKey);

  /* mòbil: la barra puja per sobre del teclat */
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const fit = () => {
      if (vv.scale > 1.05) return; // fer zoom amb els dits no és el teclat
      const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
      $("dock").style.bottom = kb > 80 ? `${kb + 8}px` : "";
      if (innerWidth <= 640) $("composer").style.bottom = kb > 80 ? `${kb + 70}px` : "";
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
