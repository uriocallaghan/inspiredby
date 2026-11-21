/* Inspired by Magazine — selector d'idioma (només interfície).
   El carrega ib-theme.js, així surt a la barra de totes les pàgines sense tocar-les. Per ara cap article
   està traduït: la tria es desa a localStorage («ib-lang») però la pàgina no canvia.
   Minimalista per decisió de l'editor (21-11-2026): només català, castellà i anglès, sense títol ni colors;
   icona de bafarada i castellà i anglès com a no disponibles (21-11-2026). */
(function(){
  "use strict";
  if (window.IBLang) return;
  var KEY = "ib-lang";
  var LANGS = [
    { code: "ca", name: "Català" },
    { code: "es", name: "Español", off: true },
    { code: "en", name: "English", off: true }
  ];
  var current = "ca";
  try { var s = localStorage.getItem(KEY); if (s && LANGS.some(function(l){ return l.code === s && !l.off; })) current = s; } catch (e) {}

  var css = [
    ".ib-lang{position:absolute;top:0;bottom:0;display:flex;align-items:center;right:calc(max(var(--ib-gutter,24px),env(safe-area-inset-right,0px)) - 8px);font-family:var(--ib-hn,'Helvetica Neue LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif)}",
    ".ib-lang-btn{inline-size:40px;block-size:40px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;background:none;color:#6b6b66;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:color .2s ease}",
    ".ib-lang-btn:hover,.ib-lang.is-open .ib-lang-btn{color:#141414}",
    ".ib-lang-btn:focus-visible{outline:1.5px solid currentColor;outline-offset:2px}",
    ".ib-lang-btn svg{display:block}",
    ".ib-lang-panel{position:absolute;top:calc(100% - 4px);right:0;min-inline-size:132px;margin:0;padding:6px;list-style:none;background:#FCFCFA;border:1px solid #e5e5df;border-radius:12px;box-shadow:0 10px 30px -14px rgba(20,20,20,.2);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .18s ease,transform .22s ease,visibility 0s linear .22s}",
    ".ib-lang.is-open .ib-lang-panel{opacity:1;visibility:visible;transform:none;transition:opacity .18s ease,transform .22s ease,visibility 0s}",
    ".ib-lang-opt{padding:8px 12px;border-radius:8px;font-size:15px;color:#6b6b66;cursor:pointer;outline:0;transition:background-color .15s ease,color .15s ease}",
    ".ib-lang-opt[aria-disabled=true]{opacity:.4;cursor:default}",
    ".ib-lang-opt:not([aria-disabled=true]):hover,.ib-lang-opt.is-active{background:#efede8;color:#141414}",
    ".ib-lang-opt[aria-selected=true]{color:#141414}",
    "@media (prefers-reduced-motion:reduce){.ib-lang *{transition:none!important}}",
    "@media print{.ib-lang{display:none}}"
  ].join("\n");

  // icona de traducció: dues bafarades, una amb una «A» i l'altra amb un caràcter
  var ICON = '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3.5 4.5h9a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H8l-3 2.5v-2.5H3.5A1.5 1.5 0 0 1 2 12V6a1.5 1.5 0 0 1 1.5-1.5z"/>' +
    '<path d="M5.6 11.2 8 6.6l2.4 4.6M6.4 9.7h3.2"/>' +
    '<path d="M16.5 9.5h4A1.5 1.5 0 0 1 22 11v6a1.5 1.5 0 0 1-1.5 1.5H19v2.5l-3-2.5h-3.5A1.5 1.5 0 0 1 11 17v-1.5"/>' +
    '<path d="M14.6 12.6h4.8M17 11.6v1M18.6 12.6c-.4 1.9-1.6 3.2-3.6 4M16 14.4c.6.9 1.5 1.6 2.8 2.1"/></svg>';

  function indexOf(c){ for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === c) return i; return 0; }

  function build(bar){
    if (bar.querySelector(".ib-lang")) return;
    if (!document.getElementById("ib-lang-css")) {
      var st = document.createElement("style"); st.id = "ib-lang-css"; st.textContent = css; document.head.appendChild(st);
    }
    var uid = "ib-lang-" + Math.random().toString(36).slice(2, 7);
    var wrap = document.createElement("div");
    wrap.className = "ib-lang";
    wrap.innerHTML = '<button type="button" class="ib-lang-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + uid + '"></button>' +
      '<ul class="ib-lang-panel" role="listbox" id="' + uid + '" tabindex="-1"></ul>';
    var btn = wrap.firstChild, list = wrap.lastChild, opts = [], active = 0;

    LANGS.forEach(function(l, i){
      var li = document.createElement("li");
      li.className = "ib-lang-opt"; li.id = uid + "-" + l.code;
      li.setAttribute("role", "option"); li.setAttribute("lang", l.code);
      li.textContent = l.name;
      if (l.off) { li.setAttribute("aria-disabled", "true"); li.title = "No disponible"; }
      if (!l.off) {
        li.addEventListener("mouseenter", function(){ setActive(i); });
        li.addEventListener("click", function(){ choose(i); });
      }
      list.appendChild(li); opts.push(li);
    });

    function setActive(i){
      active = i;
      opts.forEach(function(o, j){ o.classList.toggle("is-active", j === i); });
      list.setAttribute("aria-activedescendant", opts[i].id);
    }
    function step(d){ var i = active; do { i = (i + d + opts.length) % opts.length; } while (LANGS[i].off); setActive(i); }
    function render(){
      btn.innerHTML = ICON;
      btn.setAttribute("aria-label", "Idioma: " + LANGS[indexOf(current)].name);
      opts.forEach(function(o, j){ o.setAttribute("aria-selected", LANGS[j].code === current ? "true" : "false"); });
    }
    function choose(i){
      current = LANGS[i].code;
      try { localStorage.setItem(KEY, current); } catch (e) {}
      render(); close(true);
    }
    function open(){
      wrap.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
      setActive(indexOf(current)); list.focus({ preventScroll: true });
      document.addEventListener("pointerdown", outside, true);
    }
    function close(refocus){
      if (!wrap.classList.contains("is-open")) return;
      wrap.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
      if (refocus) btn.focus();
    }
    function outside(e){ if (!wrap.contains(e.target)) close(); }
    btn.addEventListener("click", function(){ wrap.classList.contains("is-open") ? close() : open(); });
    wrap.addEventListener("keydown", function(e){
      if (!wrap.classList.contains("is-open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(true); }
      else if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
      else if ((e.key === "Enter" || e.key === " ") && document.activeElement === list) { e.preventDefault(); choose(active); }
      else if (e.key === "Tab") close();
    });
    render();
    bar.appendChild(wrap);
  }

  function init(){ var b = document.querySelectorAll(".ib-bar"); for (var i = 0; i < b.length; i++) build(b[i]); }
  window.IBLang = { get: function(){ return current; }, langs: LANGS };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
