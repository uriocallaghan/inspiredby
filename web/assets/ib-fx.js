/* Inspired by Magazine — efectes de lectura (només articles).
   El carrega ib-theme.js a les pagines d'/articles/, igual que ib-lang.js. Posa una icona a l'esquerra de la
   barra amb un menu per triar l'efecte dels paragrafs llargs, o desactivar-los tots (decisio de l'editor,
   21-11-2026, per provar):
     off    sense efecte
     fade   opacitat: el text de la part baixa de la pantalla surt fluix i s'encen paraula per paraula
     dust   particules: pols caotica que puja i forma les lletres
     swirl  particules: remolí que es tanca sobre les lletres
     spark  particules: espurnes (traços verticals) que pugen i es concreten en les lletres
   Cost: cada paraula va en un <span>; les particules es dibuixen en UN sol canvas fix, en un sol traç, i
   la posicio depèn de l'scroll (sense simulacio per particula). Els punts de cada paraula es mostregen un
   sol cop (per tipus de lletra + text) i es desen. Nomes canvia opacitat i canvas: cap color, aixi que el
   mode fosc ho tradueix tot sol. Tria desada a localStorage («ib-fx»). Amb «reduir moviment», sense efecte. */
(function(){
  "use strict";
  if (window.IBFx) return;
  var KEY = "ib-fx";
  var MODES = [
    { id: "off",   name: "Sense efecte" },
    { id: "fade",  name: "Opacitat" },
    { id: "dust",  name: "Partícules: pols" },
    { id: "swirl", name: "Partícules: remolí" },
    { id: "spark", name: "Partícules: espurnes" }
  ];
  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var mode = reduce ? "off" : "fade";
  try { var sv = localStorage.getItem(KEY); if (sv && MODES.some(function(m){ return m.id === sv; })) mode = sv; } catch (e) {}

  /* ----------------------------- parametres ----------------------------- */
  var MIN_CHARS = 170, MIN_LINES = 4;
  var EDGE = .62, BAND = 2.2, FLOOR = .2;          /* opacitat: tall al 62 %, transicio de 2,2 linies */
  var P_EDGE = .60, P_BAND_MIN = 150, P_BAND_K = .30; /* particules: tall al 60 %, formacio en ~30 % de pantalla */
  var TX = .2;                                       /* part final de la formacio on el text real pren el relleu */
  var STEP_K = 8, STEP_MIN = 1.7, STEP_MAX = 2.6;    /* mostreig: un punt cada font/9 px */
  var LOOP_MS = 40;                                  /* cadencia del tremolor quan no hi ha scroll (~25 fps) */

  /* ----------------------------- estat ----------------------------- */
  var paras = [], vis = new Set(), ticking = false, wrapped = false, fontsReady = false;
  var cv = null, cx = null, dpr = 1, cw = 0, ch = 0;
  /* color del text de mode clar (--ink d'article.css): en fosc, ib-theme el tradueix en assignar-lo al canvas.
     No es llegeix de getComputedStyle, que en fosc ja torna el color traduit i es tornaria a traduir. */
  var INK = "#121212";
  var tick = 0, loopId = 0, lastLoop = 0, drawn = 0, lastW = 0;
  var io = null, fontCache = new WeakMap(), samples = Object.create(null), sc = null, scx = null;
  var queue = [], qi = 0, qTimer = 0, budget = 0;

  /* taules precalculades: aleatoris deterministes i sinus, perque cada frame sigui nomes aritmetica */
  var R = new Float32Array(4096), SIN = new Float32Array(256), COS = new Float32Array(256);
  (function(){
    var s = 1234567;
    for (var i = 0; i < 4096; i++) { s = (s * 1664525 + 1013904223) >>> 0; R[i] = (s / 4294967296) * 2 - 1; }
    for (var j = 0; j < 256; j++) { SIN[j] = Math.sin(j * Math.PI / 128); COS[j] = Math.cos(j * Math.PI / 128); }
  })();

  function isParticles(){ return mode === "dust" || mode === "swirl" || mode === "spark"; }
  function smooth(t){ return t * t * (3 - 2 * t); }
  function clamp01(t){ return t < 0 ? 0 : t > 1 ? 1 : t; }

  /* ----------------------------- paraules ----------------------------- */
  function wrap(node){
    for (var c = node.firstChild; c;) {
      var nx = c.nextSibling;
      if (c.nodeType === 3) {
        var parts = c.nodeValue.split(/(\s+)/);
        if (parts.length > 1 || c.nodeValue.trim()) {
          var f = document.createDocumentFragment();
          parts.forEach(function(t){
            if (!t) return;
            if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(t)); return; }
            var sp = document.createElement("span"); sp.className = "ib-w"; sp.textContent = t; f.appendChild(sp);
          });
          node.replaceChild(f, c);
        }
      } else if (c.nodeType === 1 && !/^(SVG|CANVAS|IMG|BR)$/i.test(c.nodeName)) wrap(c);
      c = nx;
    }
  }

  function fontOf(el){
    var f = fontCache.get(el);
    if (!f) {
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 18;
      f = { font: cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily, size: fs };
      fontCache.set(el, f);
    }
    return f;
  }

  function measure(p){
    var r = p.getBoundingClientRect(), lh = p._lh, nodes = p.querySelectorAll(".ib-w");
    if (Math.round(r.height / lh) < MIN_LINES) {
      (p._ws || []).forEach(function(w){ w.el.style.opacity = ""; });
      p._ws = []; return;
    }
    var first = p.classList.contains("dl") ? nodes[0] : null;
    p._ws = Array.prototype.map.call(nodes, function(el){
      var q = el.getBoundingClientRect();
      var line = Math.floor((q.top + q.height / 2 - r.top) / lh);
      var fx = r.width ? (q.left + q.width / 2 - r.left) / r.width : 0;
      return { el: el, y: (line + .15 + .7 * fx) * lh, x: q.left - r.left, top: q.top - r.top, w: q.width, h: q.height,
               o: -1, s: null, nop: el === first, id: (Math.random() * 4096) | 0 };
    });
  }

  function remeasure(){
    fontCache = new WeakMap();
    paras.forEach(function(p){ p._lh = parseFloat(getComputedStyle(p).lineHeight) || 28; });
    paras.forEach(measure);
    if (isParticles()) { enqueueAll(); }
  }

  /* Es emboliquen tots els paragrafs llargs UNA sola vegada (embolicar canvia els salts de linia i, en ple
     scroll, feia saltar la pagina). Despres nomes es torna a mesurar si canvia l'amplada. */
  function pick(){
    document.querySelectorAll("section.col:not(.fn) > p:not([class]),section.col:not(.fn) > p.dl").forEach(function(p){
      if (p._ib || p.textContent.length < MIN_CHARS) return;
      p._ib = 1; wrap(p); paras.push(p); io.observe(p);
    });
    remeasure();
  }

  /* ----------------------------- mostreig de lletres ----------------------------- */
  function sampleWord(w){
    var f = fontOf(w.el.parentNode), text = w.el.textContent, key = f.font + "|" + text, s = samples[key];
    if (!s) {
      if (!sc) { sc = document.createElement("canvas"); scx = sc.getContext("2d", { willReadFrequently: true }); }
      var cwid = Math.ceil(w.w) + 4, chei = Math.ceil(w.h) + 4;
      sc.width = cwid; sc.height = chei;
      scx.font = f.font; scx.textBaseline = "alphabetic"; scx.fillStyle = "#000";
      var m = scx.measureText(text);
      var asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
      if (!(asc > 0)) { asc = w.h * .8; desc = w.h * .2; }
      var base = 2 + asc + (w.h - (asc + desc)) / 2;
      scx.fillText(text, 2, base);
      var data = scx.getImageData(0, 0, cwid, chei).data, step = Math.min(STEP_MAX, Math.max(STEP_MIN, f.size / STEP_K));
      var pts = [], k = 0;
      for (var yy = 0; yy < chei; yy += step) {
        for (var xx = 0; xx < cwid; xx += step) {
          var jx = xx + R[(k * 2) & 4095] * step * .35, jy = yy + R[(k * 2 + 1) & 4095] * step * .35; k++;
          var ix = jx | 0, iy = jy | 0;
          if (ix >= 0 && iy >= 0 && ix < cwid && iy < chei && data[(iy * cwid + ix) * 4 + 3] > 110) pts.push(jx - 2, jy - 2);
        }
      }
      s = samples[key] = { n: pts.length / 2, p: new Float32Array(pts) };
    }
    w.s = s;
  }

  function enqueueAll(){
    queue = []; qi = 0;
    paras.forEach(function(p){ (p._ws || []).forEach(function(w){ if (!w.s) queue.push(w); }); });
    if (!qTimer && queue.length) qTimer = setTimeout(prefetch, 30);
  }
  function prefetch(){
    qTimer = 0;
    if (!fontsReady || !isParticles()) return;
    var t0 = performance.now(), n = 0;
    while (qi < queue.length && performance.now() - t0 < 5 && n < 60) { var w = queue[qi++]; if (!w.s) { sampleWord(w); n++; } }
    if (qi < queue.length) qTimer = setTimeout(prefetch, 30);
  }

  /* ----------------------------- canvas ----------------------------- */
  function ensureCanvas(){
    if (cv) return;
    cv = document.createElement("canvas"); cv.className = "ib-fx-cv"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv); cx = cv.getContext("2d");
    sizeCanvas();
  }
  function sizeCanvas(){
    if (!cv) return;
    dpr = Math.min(1.5, window.devicePixelRatio || 1); cw = innerWidth; ch = innerHeight;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ----------------------------- pintat ----------------------------- */
  function setAll(p, o, st){
    p._st = st; var ws = p._ws;
    for (var i = 0; i < ws.length; i++) { var w = ws[i]; if (w.o !== o) { w.o = o; w.el.style.opacity = o === 1 ? "" : o; } }
  }

  function renderFade(){
    var h = innerHeight, start = h * EDGE, d = document.documentElement;
    var end = d.scrollHeight - h - scrollY < 4;
    vis.forEach(function(p){
      var ws = p._ws; if (!ws || !ws.length) return;
      var r = p.getBoundingClientRect(), top = r.top, z = p._lh * BAND;
      /* paragrafs sencers per sobre o per sota de la franja: un sol estat, sense tocar paraula per paraula */
      if (end || top + r.height < start) { if (p._st !== 1) setAll(p, 1, 1); return; }
      if (top > start + z) { if (p._st !== 0) setAll(p, FLOOR, 0); return; }
      p._st = 2;
      for (var i = 0; i < ws.length; i++) {
        var w = ws[i], t = smooth(clamp01((top + w.y - start) / z));
        var o = Math.round((1 - t * (1 - FLOOR)) * 100) / 100;
        if (o !== w.o) { w.o = o; w.el.style.opacity = o === 1 ? "" : o; }
      }
    });
  }

  function renderParticles(){
    var h = innerHeight, start = h * P_EDGE, Z = Math.max(P_BAND_MIN, h * P_BAND_K), d = document.documentElement;
    var end = d.scrollHeight - h - scrollY < 4, kind = mode;
    cx.clearRect(0, 0, cw, ch);
    var nPts = 0;
    cx.fillStyle = INK; cx.globalAlpha = kind === "spark" ? .6 : kind === "swirl" ? .8 : .9;
    var AX = kind === "spark" ? 20 : kind === "swirl" ? 54 : 40;
    var AY = kind === "spark" ? 95 : kind === "swirl" ? 78 : 64;
    budget = 40;
    vis.forEach(function(p){
      var ws = p._ws; if (!ws || !ws.length) return;
      var r = p.getBoundingClientRect(), top = r.top, left = r.left;
      if (end || top + r.height < start) { if (p._st !== 1) setAll(p, 1, 1); return; }
      if (top > h + 20) { if (p._st !== 0) setAll(p, 0, 0); return; }
      p._st = 2;
      for (var i = 0; i < ws.length; i++) {
        var w = ws[i], t = clamp01((top + w.y - start) / Z), o;
        if (t <= 0) { if (w.o !== 1) { w.o = 1; w.el.style.opacity = ""; } continue; }
        if (!w.s && !w.nop && fontsReady && budget > 0 && top + w.top < h + 20) { sampleWord(w); budget--; }
        if (!w.s || w.nop) {
          /* sense mostra (encara) o paraula especial (caplletra): opacitat com al mode fade */
          o = Math.round((1 - smooth(t) * (1 - FLOOR)) * 100) / 100;
          if (o !== w.o) { w.o = o; w.el.style.opacity = o === 1 ? "" : o; }
          continue;
        }
        o = t >= TX ? 0 : Math.round(smooth((TX - t) / TX) * 20) / 20;
        if (o !== w.o) { w.o = o; w.el.style.opacity = o === 1 ? "" : o; }
        var Y0 = top + w.top; if (Y0 > h + 4) continue;
        var X0 = left + w.x, k = Math.pow(t, 1.35), s = w.s, pts = s.p, n = s.n, base = w.id;
        if (t < .03) continue;
        var stride = k > .55 ? 2 : 1;
        for (var j = 0; j < n; j += stride) {
          var idx = (base + j) & 4095, rx = R[idx], ry = R[(idx + 1777) & 4095];
          var wx = SIN[(tick * 3 + idx) & 255] * 2.2 * k, wy = SIN[(tick * 2 + idx * 5 + 64) & 255] * 2.2 * k;
          var ox = rx * AX * k, oy = (ry * .4 + .6) * AY * k;
          if (kind === "swirl") {
            var ai = (((rx > 0 ? 1 : -1) * k * 2.4 * 40.7) | 0) & 255, cs = COS[ai], sn = SIN[ai], vx = ox, vy = oy;
            ox = vx * cs - vy * sn; oy = vx * sn + vy * cs;
          }
          var x = X0 + pts[2 * j] + ox + wx, y = Y0 + pts[2 * j + 1] + oy + wy;
          if (y > h) continue;
          if (kind === "spark") cx.fillRect(x, y, 1, 1 + k * 16 * (.3 + .7 * Math.abs(ry)));
          else cx.fillRect(x, y, 1.6, 1.6);
          nPts++;
        }
      }
    });
    drawn = nPts;
    cx.globalAlpha = 1;
  }

  function render(){
    ticking = false;
    if (mode === "off") return;
    if (isParticles()) renderParticles(); else renderFade();
  }
  function req(){ if (!ticking) { ticking = true; requestAnimationFrame(render); } }

  /* tremolor lleuger de les particules sense scroll: ~25 fps, nomes mentre n'hi ha de visibles */
  function loop(ts){
    loopId = 0;
    if (!isParticles() || document.hidden) return;
    if (ts - lastLoop >= LOOP_MS) { lastLoop = ts; tick++; renderParticles(); }
    if (drawn > 0) loopId = requestAnimationFrame(loop);
  }
  function startLoop(){ if (!loopId && isParticles() && !document.hidden) loopId = requestAnimationFrame(loop); }

  /* ----------------------------- cicle de vida ----------------------------- */
  function reset(){
    paras.forEach(function(p){ p._st = undefined; (p._ws || []).forEach(function(w){ w.o = -1; w.el.style.opacity = ""; }); });
    if (cx) cx.clearRect(0, 0, cw, ch);
    drawn = 0;
  }

  function activate(){
    if (!wrapped) { start(); return; }
    reset();
    if (isParticles()) { ensureCanvas(); cv.style.display = ""; enqueueAll(); }
    else if (cv) cv.style.display = "none";
    req(); startLoop();
  }

  function setMode(m){
    if (m === mode) return;
    mode = m;
    try { localStorage.setItem(KEY, m); } catch (e) {}
    if (mode === "off") { reset(); if (cv) cv.style.display = "none"; if (loopId) { cancelAnimationFrame(loopId); loopId = 0; } return; }
    activate();
  }

  function onIO(es){
    es.forEach(function(e){
      var p = e.target;
      if (e.isIntersecting) { vis.add(p); return; }
      vis.delete(p);
      /* en sortir de la zona, estat final segons on queda: a dalt (ja llegit) ple; a baix, fluix (o amagat) */
      if (mode !== "off" && p._ws && p._ws.length) {
        var below = e.boundingClientRect.top > 0, want = below ? 0 : 1;
        if (p._st !== want) setAll(p, below ? (isParticles() ? 0 : FLOOR) : 1, want);
      }
    });
    if (mode !== "off") { render(); startLoop(); }
  }

  function start(){
    if (wrapped || mode === "off") return;
    wrapped = true;
    io = new IntersectionObserver(onIO, { rootMargin: "50% 0px" });
    var st = document.createElement("style"); st.id = "ib-fx-css";
    st.textContent = ".ib-fx-cv{position:fixed;left:0;top:0;width:100vw;height:100vh;height:100lvh;pointer-events:none;z-index:15}" +
      "@media print{.ib-w{opacity:1!important}.ib-fx-cv{display:none}}";
    document.head.appendChild(st);
    pick();
    lastW = innerWidth;
    if (isParticles()) { ensureCanvas(); }
    req();
    addEventListener("scroll", function(){ if (mode !== "off") { req(); startLoop(); } }, { passive: true });
    var rt;
    addEventListener("resize", function(){
      if (innerWidth === lastW) { return; } /* al mobil la barra del navegador canvia l'alcada sense parar: no cal remesurar */
      clearTimeout(rt);
      rt = setTimeout(function(){ lastW = innerWidth; sizeCanvas(); remeasure(); req(); }, 200);
    });
    function after(){ remeasure(); req(); }
    addEventListener("load", after);
    var ready = document.fonts && document.fonts.ready;
    if (ready) ready.then(function(){ fontsReady = true; after(); startLoop(); }); else { fontsReady = true; }
    document.addEventListener("visibilitychange", function(){ if (!document.hidden) { req(); startLoop(); } });
  }

  /* ----------------------------- menu (mateix patro que ib-lang) ----------------------------- */
  var css = [
    ".ib-fx{position:absolute;top:0;bottom:0;display:flex;align-items:center;left:calc(max(var(--ib-gutter,24px),env(safe-area-inset-left,0px)) - 8px);font-family:var(--ib-hn,'Helvetica Neue LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif)}",
    ".ib-fx-btn{inline-size:40px;block-size:40px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;background:none;color:#6b6b66;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:color .2s ease}",
    ".ib-fx-btn:hover,.ib-fx.is-open .ib-fx-btn{color:#141414}",
    ".ib-fx-btn:focus-visible{outline:1.5px solid currentColor;outline-offset:2px}",
    ".ib-fx-btn svg{display:block}",
    ".ib-fx-panel{position:absolute;top:calc(100% - 4px);left:0;min-inline-size:196px;margin:0;padding:6px;list-style:none;background:#FCFCFA;border:1px solid #e5e5df;border-radius:12px;box-shadow:0 10px 30px -14px rgba(20,20,20,.2);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .18s ease,transform .22s ease,visibility 0s linear .22s}",
    ".ib-fx.is-open .ib-fx-panel{opacity:1;visibility:visible;transform:none;transition:opacity .18s ease,transform .22s ease,visibility 0s}",
    ".ib-fx-opt{padding:8px 12px;border-radius:8px;font-size:15px;color:#6b6b66;cursor:pointer;outline:0;white-space:nowrap;transition:background-color .15s ease,color .15s ease}",
    ".ib-fx-opt:hover,.ib-fx-opt.is-active{background:#efede8;color:#141414}",
    ".ib-fx-opt[aria-selected=true]{color:#141414}",
    "@media (prefers-reduced-motion:reduce){.ib-fx *{transition:none!important}}",
    "@media print{.ib-fx{display:none}}"
  ].join("\n");

  /* icona: una espurna i dues partícules */
  var ICON = '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 3.5c.7 4 2 5.3 6 6-4 .7-5.3 2-6 6-.7-4-2-5.3-6-6 4-.7 5.3-2 6-6z"/>' +
    '<circle cx="18.6" cy="17.2" r=".9" fill="currentColor" stroke="none"/><circle cx="14.6" cy="20.4" r=".7" fill="currentColor" stroke="none"/>' +
    '<circle cx="20.4" cy="4.8" r=".7" fill="currentColor" stroke="none"/></svg>';

  function indexOf(id){ for (var i = 0; i < MODES.length; i++) if (MODES[i].id === id) return i; return 0; }

  function build(bar){
    if (bar.querySelector(".ib-fx")) return;
    if (!document.getElementById("ib-fx-menu-css")) {
      var s = document.createElement("style"); s.id = "ib-fx-menu-css"; s.textContent = css; document.head.appendChild(s);
    }
    var uid = "ib-fx-" + Math.random().toString(36).slice(2, 7);
    var wrapEl = document.createElement("div");
    wrapEl.className = "ib-fx";
    wrapEl.innerHTML = '<button type="button" class="ib-fx-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + uid + '"></button>' +
      '<ul class="ib-fx-panel" role="listbox" id="' + uid + '" tabindex="-1" aria-label="Efecte de lectura"></ul>';
    var btn = wrapEl.firstChild, list = wrapEl.lastChild, opts = [], active = 0;

    MODES.forEach(function(m, i){
      var li = document.createElement("li");
      li.className = "ib-fx-opt"; li.id = uid + "-" + m.id; li.setAttribute("role", "option");
      li.textContent = m.name;
      li.addEventListener("mouseenter", function(){ setActive(i); });
      li.addEventListener("click", function(){ choose(i); });
      list.appendChild(li); opts.push(li);
    });

    function setActive(i){
      active = i;
      opts.forEach(function(o, j){ o.classList.toggle("is-active", j === i); });
      list.setAttribute("aria-activedescendant", opts[i].id);
    }
    function step(d){ setActive((active + d + opts.length) % opts.length); }
    function render(){
      btn.innerHTML = ICON;
      btn.setAttribute("aria-label", "Efecte de lectura: " + MODES[indexOf(mode)].name);
      opts.forEach(function(o, j){ o.setAttribute("aria-selected", MODES[j].id === mode ? "true" : "false"); });
    }
    function choose(i){ setMode(MODES[i].id); render(); close(true); }
    function open(){
      wrapEl.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
      setActive(indexOf(mode)); list.focus({ preventScroll: true });
      document.addEventListener("pointerdown", outside, true);
    }
    function close(refocus){
      if (!wrapEl.classList.contains("is-open")) return;
      wrapEl.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
      if (refocus) btn.focus();
    }
    function outside(e){ if (!wrapEl.contains(e.target)) close(); }
    btn.addEventListener("click", function(){ wrapEl.classList.contains("is-open") ? close() : open(); });
    wrapEl.addEventListener("keydown", function(e){
      if (!wrapEl.classList.contains("is-open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(true); }
      else if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
      else if ((e.key === "Enter" || e.key === " ") && document.activeElement === list) { e.preventDefault(); choose(active); }
      else if (e.key === "Tab") close();
    });
    render();
    bar.appendChild(wrapEl);
  }

  function init(){
    if (!document.querySelector(".ib-article")) return;
    var bars = document.querySelectorAll(".ib-bar"); for (var i = 0; i < bars.length; i++) build(bars[i]);
    if (!("IntersectionObserver" in window)) return;
    start();
  }
  window.IBFx = { get: function(){ return mode; }, set: setMode, modes: MODES };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
