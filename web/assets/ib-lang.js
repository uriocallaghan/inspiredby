/* Inspired by Magazine — selector d'idioma (només interfície).
   El carrega ib-theme.js, així surt a la barra de totes les pàgines sense tocar-les. Per ara cap article
   està traduït: la tria es desa a localStorage («ib-lang») i el selector ho diu, però la pàgina no canvia.
   Els colors s'escriuen en clar; ib-theme.js els tradueix en fosc com la resta de la web. */
(function(){
  "use strict";
  if (window.IBLang) return;
  var KEY = "ib-lang";
  var LANGS = [
    { code: "ca", name: "Català",    line: "Entendre el món",          note: "La revista s'escriu en català." },
    { code: "es", name: "Español",   line: "Entender el mundo",        note: "Por ahora, los artículos solo están en catalán." },
    { code: "en", name: "English",   line: "Understanding the world",  note: "For now, articles are only in Catalan." },
    { code: "fr", name: "Français",  line: "Comprendre le monde",      note: "Pour l'instant, les articles ne sont qu'en catalan." },
    { code: "it", name: "Italiano",  line: "Capire il mondo",          note: "Per ora gli articoli sono solo in catalano." },
    { code: "de", name: "Deutsch",   line: "Die Welt verstehen",       note: "Vorerst erscheinen die Artikel nur auf Katalanisch." },
    { code: "pt", name: "Português", line: "Entender o mundo",         note: "Por agora, os artigos só estão em catalão." }
  ];
  var current = "ca";
  try { var s = localStorage.getItem(KEY); if (s && LANGS.some(function(l){ return l.code === s; })) current = s; } catch (e) {}
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var css = [
    ".ib-lang{position:absolute;bottom:0;top:0;display:flex;align-items:center;right:calc(max(var(--ib-gutter,24px),env(safe-area-inset-right,0px)) + 44px);font-family:var(--ib-hn,'Helvetica Neue LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif)}",
    ".ib-lang-btn{display:flex;align-items:center;gap:6px;block-size:40px;padding:0 10px;border:0;border-radius:20px;background:none;color:#6b6b66;font:inherit;font-size:13px;font-weight:500;letter-spacing:.02em;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:color .2s ease}",
    ".ib-lang-btn:hover,.ib-lang.is-open .ib-lang-btn{color:#141414}",
    ".ib-lang-btn:focus-visible{outline:1.5px solid currentColor;outline-offset:2px}",
    ".ib-lang-code{position:relative;display:inline-block;min-inline-size:2ch;text-align:center;text-transform:uppercase}",
    ".ib-lang-code::after{content:'';position:absolute;left:0;right:0;bottom:-4px;block-size:2px;background:#C8442A;transform:scaleX(.35);transform-origin:left;transition:transform .35s cubic-bezier(.2,.8,.2,1)}",
    ".ib-lang-btn:hover .ib-lang-code::after,.ib-lang.is-open .ib-lang-code::after{transform:scaleX(1)}",
    ".ib-lang-btn svg{display:block;transition:transform .35s cubic-bezier(.2,.8,.2,1)}",
    ".ib-lang.is-open .ib-lang-btn svg{transform:rotate(180deg)}",
    ".ib-lang-panel{position:absolute;top:calc(100% + 4px);right:-44px;inline-size:340px;padding:26px 0 18px;background:#FCFCFA;border:1px solid #e5e5df;box-shadow:0 18px 50px -18px rgba(20,20,20,.22);opacity:0;visibility:hidden;transform:translateY(-6px);transform-origin:top right;transition:opacity .22s ease,transform .32s cubic-bezier(.2,.8,.2,1),visibility 0s linear .32s;text-align:left}",
    ".ib-lang.is-open .ib-lang-panel{opacity:1;visibility:visible;transform:none;transition:opacity .22s ease,transform .32s cubic-bezier(.2,.8,.2,1),visibility 0s}",
    ".ib-lang-hero{padding:0 26px 20px;border-bottom:1px solid #ecece7}",
    ".ib-lang-line{display:block;min-block-size:2.1em;font-size:30px;line-height:1.04;font-weight:700;letter-spacing:-.035em;color:#141414;overflow-wrap:anywhere}",
    ".ib-lang-line span{display:inline-block;white-space:pre}",
    ".ib-lang-bars{display:flex;gap:4px;margin-top:14px}",
    ".ib-lang-bars i{display:block;block-size:3px;inline-size:22px;transform-origin:left;transition:inline-size .45s cubic-bezier(.2,.8,.2,1)}",
    ".ib-lang-bars i:nth-child(1){background:#C8442A}.ib-lang-bars i:nth-child(2){background:#2C5DA8}.ib-lang-bars i:nth-child(3){background:#F5C518}",
    ".ib-lang-list{position:relative;list-style:none;margin:0;padding:10px 0 0}",
    ".ib-lang-ind{position:absolute;left:0;top:0;inline-size:3px;background:#C8442A;transition:transform .3s cubic-bezier(.2,.8,.2,1),block-size .3s ease,opacity .2s ease;opacity:0;pointer-events:none}",
    ".ib-lang-opt{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:9px 26px;font-size:17px;letter-spacing:-.01em;color:#4a4a46;cursor:pointer;transition:color .2s ease,padding .3s cubic-bezier(.2,.8,.2,1)}",
    ".ib-lang-opt:hover,.ib-lang-opt.is-active{color:#141414;padding-left:32px}",
    ".ib-lang-opt[aria-selected=true]{color:#141414;font-weight:700}",
    ".ib-lang-opt small{font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#9a9a93}",
    ".ib-lang-opt[aria-selected=true] small{color:#C8442A}",
    ".ib-lang-note{margin:14px 26px 0;font-size:12.5px;line-height:1.4;color:#7a7a74;min-block-size:2.8em}",
    "@media (max-width:600px){.ib-lang-btn{padding:0 6px}.ib-lang-panel{position:fixed;top:56px;left:0;right:0;inline-size:auto;border-left:0;border-right:0;padding-top:22px;max-block-size:calc(100dvh - 56px);overflow:auto}.ib-lang-line{font-size:28px}.ib-lang-opt{padding-block:12px}}",
    "@media (prefers-reduced-motion:reduce){.ib-lang *{transition:none!important}}",
    "@media print{.ib-lang{display:none}}"
  ].join("\n");

  var CHEVRON = '<svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function byCode(c){ for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === c) return LANGS[i]; return LANGS[0]; }

  /* el lema es transforma lletra a lletra: cada posició gira per uns quants caràcters abans de fixar-se */
  var GLYPHS = "abcdefghijklmnopqrstuvwxyzàçéèíòóúüäöß";
  function morph(el, text){
    if (el._raf) cancelAnimationFrame(el._raf);
    if (reduce) { el.textContent = text; return; }
    var from = el.textContent, n = Math.max(from.length, text.length), t0 = performance.now(), dur = 420;
    var stops = []; for (var i = 0; i < n; i++) stops.push(dur * (0.25 + 0.75 * i / Math.max(1, n - 1)) * (0.8 + Math.random() * 0.4));
    (function frame(now){
      var t = now - t0, out = "", done = true;
      for (var i = 0; i < n; i++) {
        var target = text.charAt(i);
        if (t >= stops[i]) out += target;
        else { done = false; out += (target === " " || from.charAt(i) === " " && t < stops[i] * 0.4) ? (from.charAt(i) || " ") : GLYPHS.charAt((Math.random() * GLYPHS.length) | 0); }
      }
      el.textContent = out.replace(/\s+$/, "");
      if (!done) el._raf = requestAnimationFrame(frame); else el.textContent = text;
    })(t0);
  }

  function build(bar){
    if (bar.querySelector(".ib-lang")) return;
    if (!document.getElementById("ib-lang-css")) {
      var st = document.createElement("style"); st.id = "ib-lang-css"; st.textContent = css; document.head.appendChild(st);
    }
    var wrap = document.createElement("div");
    wrap.className = "ib-lang";
    var uid = "ib-lang-" + Math.random().toString(36).slice(2, 7);
    wrap.innerHTML =
      '<button type="button" class="ib-lang-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + uid + '" title="Idioma"><span class="ib-lang-code"></span>' + CHEVRON + '</button>' +
      '<div class="ib-lang-panel" role="dialog" aria-label="Idioma">' +
        '<div class="ib-lang-hero"><span class="ib-lang-line" aria-hidden="true"></span><div class="ib-lang-bars" aria-hidden="true"><i></i><i></i><i></i></div></div>' +
        '<ul class="ib-lang-list" role="listbox" id="' + uid + '" tabindex="-1"><span class="ib-lang-ind" aria-hidden="true"></span></ul>' +
        '<p class="ib-lang-note" aria-live="polite"></p>' +
      '</div>';
    var btn = wrap.querySelector(".ib-lang-btn"), code = wrap.querySelector(".ib-lang-code"),
        line = wrap.querySelector(".ib-lang-line"), note = wrap.querySelector(".ib-lang-note"),
        list = wrap.querySelector(".ib-lang-list"), ind = wrap.querySelector(".ib-lang-ind"),
        bars = wrap.querySelectorAll(".ib-lang-bars i"), opts = [], active = 0;

    LANGS.forEach(function(l, i){
      var li = document.createElement("li");
      li.className = "ib-lang-opt"; li.setAttribute("role", "option"); li.id = uid + "-" + l.code;
      li.setAttribute("lang", l.code);
      li.innerHTML = '<span></span><small></small>';
      li.firstChild.textContent = l.name; li.lastChild.textContent = l.code;
      li.addEventListener("mouseenter", function(){ focusOpt(i, true); });
      li.addEventListener("click", function(){ choose(i); });
      list.appendChild(li); opts.push(li);
    });
    list.addEventListener("mouseleave", function(){ focusOpt(indexOf(current), true); });

    function indexOf(c){ for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === c) return i; return 0; }
    function show(l){
      morph(line, l.line); line.setAttribute("lang", l.code);
      note.textContent = l.note; note.setAttribute("lang", l.code);
      // les tres barres de la paleta canvien de proporció segons l'idioma: un petit senyal propi de cadascun
      var k = indexOf(l.code);
      bars[0].style.inlineSize = (18 + (k * 13) % 40) + "px";
      bars[1].style.inlineSize = (14 + (k * 23) % 34) + "px";
      bars[2].style.inlineSize = (10 + (k * 17) % 28) + "px";
    }
    function focusOpt(i, preview){
      active = i;
      opts.forEach(function(o, j){ o.classList.toggle("is-active", j === i); });
      list.setAttribute("aria-activedescendant", opts[i].id);
      var o = opts[i];
      ind.style.opacity = "1";
      ind.style.blockSize = o.offsetHeight + "px";
      ind.style.transform = "translateY(" + o.offsetTop + "px)";
      if (preview) show(LANGS[i]);
    }
    function render(){
      code.textContent = current;
      opts.forEach(function(o, j){ o.setAttribute("aria-selected", LANGS[j].code === current ? "true" : "false"); });
      btn.setAttribute("aria-label", "Idioma: " + byCode(current).name);
    }
    function choose(i){
      current = LANGS[i].code;
      try { localStorage.setItem(KEY, current); } catch (e) {}
      render(); show(LANGS[i]);
      code.animate && !reduce && code.animate([{ transform: "translateY(-6px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      setTimeout(close, 650);
    }
    function open(){
      wrap.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
      line.textContent = "";
      requestAnimationFrame(function(){ focusOpt(indexOf(current), true); list.focus({ preventScroll: true }); });
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
      else if (e.key === "ArrowDown") { e.preventDefault(); focusOpt((active + 1) % opts.length, true); }
      else if (e.key === "ArrowUp") { e.preventDefault(); focusOpt((active - 1 + opts.length) % opts.length, true); }
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
