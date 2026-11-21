/* Inspired by Magazine — selector d'idioma (només interfície).
   El carrega ib-theme.js, així surt a la barra de totes les pàgines sense tocar-les. Per ara cap article
   està traduït: la tria es desa a localStorage («ib-lang») però la pàgina no canvia.
   Minimalista per decisió de l'editor (21-11-2026): només català, castellà i anglès, sense títol ni colors. */
(function(){
  "use strict";
  if (window.IBLang) return;
  var KEY = "ib-lang";
  var LANGS = [
    { code: "ca", name: "Català" },
    { code: "es", name: "Español" },
    { code: "en", name: "English" }
  ];
  var current = "ca";
  try { var s = localStorage.getItem(KEY); if (s && LANGS.some(function(l){ return l.code === s; })) current = s; } catch (e) {}

  var css = [
    ".ib-lang{position:absolute;top:0;bottom:0;display:flex;align-items:center;right:calc(max(var(--ib-gutter,24px),env(safe-area-inset-right,0px)) + 44px);font-family:var(--ib-hn,'Helvetica Neue LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif)}",
    ".ib-lang-btn{block-size:40px;padding:0 8px;border:0;background:none;color:#6b6b66;font:inherit;font-size:13px;letter-spacing:.02em;text-transform:uppercase;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:color .2s ease}",
    ".ib-lang-btn:hover,.ib-lang.is-open .ib-lang-btn{color:#141414}",
    ".ib-lang-btn:focus-visible{outline:1.5px solid currentColor;outline-offset:2px;border-radius:6px}",
    ".ib-lang-panel{position:absolute;top:calc(100% - 4px);right:0;min-inline-size:132px;margin:0;padding:6px;list-style:none;background:#FCFCFA;border:1px solid #e5e5df;border-radius:12px;box-shadow:0 10px 30px -14px rgba(20,20,20,.2);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .18s ease,transform .22s ease,visibility 0s linear .22s}",
    ".ib-lang.is-open .ib-lang-panel{opacity:1;visibility:visible;transform:none;transition:opacity .18s ease,transform .22s ease,visibility 0s}",
    ".ib-lang-opt{padding:8px 12px;border-radius:8px;font-size:15px;color:#6b6b66;cursor:pointer;outline:0;transition:background-color .15s ease,color .15s ease}",
    ".ib-lang-opt:hover,.ib-lang-opt.is-active{background:#efede8;color:#141414}",
    ".ib-lang-opt[aria-selected=true]{color:#141414}",
    "@media (prefers-reduced-motion:reduce){.ib-lang *{transition:none!important}}",
    "@media print{.ib-lang{display:none}}"
  ].join("\n");

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
      li.addEventListener("mouseenter", function(){ setActive(i); });
      li.addEventListener("click", function(){ choose(i); });
      list.appendChild(li); opts.push(li);
    });

    function setActive(i){
      active = i;
      opts.forEach(function(o, j){ o.classList.toggle("is-active", j === i); });
      list.setAttribute("aria-activedescendant", opts[i].id);
    }
    function render(){
      btn.textContent = current;
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
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % opts.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((active - 1 + opts.length) % opts.length); }
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
