/* Inspired by Magazine — mode fosc.
   Es carrega el primer de tot al <head> (sense defer). Decideix el tema (preferència desada o la del sistema)
   i, si és fosc, tradueix tots els colors de la pàgina en el moment de pintar-los: fulls d'estil, atributs SVG,
   estils en línia, canvas (fillStyle, strokeStyle, degradats, putImageData). El codi dels articles continua
   treballant amb els colors clars de sempre: les lectures (getAttribute, getPropertyValue, getComputedStyle)
   tornen el color clar original, i només la pintura és fosca. Així cap article s'ha de tocar.
   Traducció: els neutres s'inverteixen (paper → negre càlid, tinta → blanc trencat); els colors saturats de la
   paleta mantenen to i gairebé la lluminositat; els tons clars es tornen tons foscos apagats i els foscos, clars. */
(function(){
  "use strict";
  var KEY = "ib-theme", root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  var dark = stored === "dark" || (stored !== "light" && !!(mq && mq.matches));
  root.setAttribute("data-theme", dark ? "dark" : "light");

  function reloadKeepingPlace(){
    try { sessionStorage.setItem("ib-theme-y", String(scrollY)); } catch (e) {}
    location.reload();
  }
  window.IBTheme = {
    dark: dark,
    set: function(mode){
      try { if (mode === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, mode); } catch (e) {}
      reloadKeepingPlace();
    },
    toggle: function(){
      var next = dark ? "light" : "dark";
      // si el sistema ja demana el que triem, tornem a «automàtic»
      var sys = mq && mq.matches ? "dark" : "light";
      this.set(next === sys ? "auto" : next);
    }
  };
  if (mq && mq.addEventListener) mq.addEventListener("change", function(){
    var s = null; try { s = localStorage.getItem(KEY); } catch (e) {}
    if (!s) reloadKeepingPlace();
  });
  // tornar al mateix punt després de canviar de tema
  try {
    var y = sessionStorage.getItem("ib-theme-y");
    if (y !== null) {
      sessionStorage.removeItem("ib-theme-y");
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      addEventListener("load", function(){ setTimeout(function(){ scrollTo(0, +y); }, 60); });
    }
  } catch (e) {}

  /* ---------- botó de tema a la barra ---------- */
  var ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6 7 17M17 7l1.6-1.6"/></g></svg>';
  function addButton(){
    var bars = document.querySelectorAll(".ib-bar");
    for (var i = 0; i < bars.length; i++) {
      if (bars[i].querySelector(".ib-theme-btn")) continue;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ib-theme-btn";
      b.setAttribute("aria-label", dark ? "Mode clar" : "Mode fosc");
      b.title = dark ? "Mode clar" : "Mode fosc";
      b.innerHTML = dark ? ICON_SUN : ICON_MOON;
      b.addEventListener("click", function(){ window.IBTheme.toggle(); });
      bars[i].appendChild(b);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addButton); else addButton();

  if (!dark) return;

  /* ===================================================================================== */
  /* ---------- traducció de colors ---------- */
  root.style.colorScheme = "dark";
  var pre = document.createElement("style");
  pre.id = "ib-theme-pre";
  pre.textContent = "html{background:#131312!important;color-scheme:dark}html:not(.ib-dark-ready) body{visibility:hidden}";
  (document.head || root).appendChild(pre);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", "#131312");

  // Neutres de la revista amb valor fosc fixat a mà (la resta es calcula).
  var FIXED = {
    "255,255,255": [19,19,18],   // paper dels gràfics
    "252,252,250": [19,19,18],   // paper de la pàgina
    "18,18,18": [234,232,227],   // tinta
    "20,20,20": [232,230,225],
    "0,0,0": [240,238,233],
    "74,74,74": [184,182,176],   // tinta 2
    "122,122,122": [146,144,139],// gris apagat
    "218,218,218": [56,55,51],   // filet
    "234,234,234": [40,39,37],   // graella
    "201,201,201": [74,73,69],
    "236,235,232": [36,35,33],   // terra
    "211,209,204": [62,61,57],
    "236,233,228": [40,38,36],
    "229,229,223": [48,47,44],   // --ib-grey
    "239,237,232": [30,29,28]    // fons de miniatura
  };

  // --- OKLab ---
  function s2l(c){ c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function l2s(c){ c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; return Math.round(Math.max(0, Math.min(1, c)) * 255); }
  function toLab(r, g, b){
    r = s2l(r); g = s2l(g); b = s2l(b);
    var l = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
    var m = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
    var s = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
    return [0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
            1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
            0.0259040371*l + 0.7827717662*m - 0.8086757660*s];
  }
  function fromLabLin(L, a, b){
    var l = L + 0.3963377774*a + 0.2158037573*b, m = L - 0.1055613458*a - 0.0638541728*b, s = L - 0.0894841775*a - 1.2914855480*b;
    l = l*l*l; m = m*m*m; s = s*s*s;
    return [4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
           -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
           -0.0041960863*l - 0.7034186147*m + 1.7076147010*s];
  }
  function inGamut(c){ return c[0] >= -1e-4 && c[0] <= 1.0001 && c[1] >= -1e-4 && c[1] <= 1.0001 && c[2] >= -1e-4 && c[2] <= 1.0001; }
  function lchToRgb(L, C, h){
    var lo = 0, hi = C, c = fromLabLin(L, C*Math.cos(h), C*Math.sin(h));
    if (!inGamut(c)) {
      for (var i = 0; i < 14; i++) { var mid = (lo + hi) / 2; if (inGamut(fromLabLin(L, mid*Math.cos(h), mid*Math.sin(h)))) lo = mid; else hi = mid; }
      c = fromLabLin(L, lo*Math.cos(h), lo*Math.sin(h));
    }
    return [l2s(c[0]), l2s(c[1]), l2s(c[2])];
  }
  function maxChroma(L, h){
    var lo = 0, hi = 0.4;
    for (var i = 0; i < 12; i++) { var mid = (lo + hi) / 2; if (inGamut(fromLabLin(L, mid*Math.cos(h), mid*Math.sin(h)))) lo = mid; else hi = mid; }
    return lo;
  }
  // corba d'inversió de la lluminositat (OKLab L): blanc → 0,205 · negre → 0,95
  var INV = [[0,.95],[.2,.905],[.35,.81],[.5,.69],[.65,.53],[.8,.37],[.9,.285],[.96,.235],[1,.205]];
  function inv(L){
    for (var i = 1; i < INV.length; i++) if (L <= INV[i][0]) { var a = INV[i-1], b = INV[i]; return a[1] + (b[1]-a[1]) * (L-a[0]) / (b[0]-a[0]); }
    return INV[INV.length-1][1];
  }
  function mapRGB(r, g, b){
    var f = FIXED[r + "," + g + "," + b];
    if (f) return f;
    var lab = toLab(r, g, b), L = lab[0], C = Math.hypot(lab[1], lab[2]), h = Math.atan2(lab[2], lab[1]);
    if (C < 0.012) { var n = inv(L); var nn = lchToRgb(n, C, h); return nn; }
    var cr = Math.min(1, C / Math.max(0.02, maxChroma(L, h)));
    var s = 1 - 0.85 * Math.pow(cr, 2.2);
    if (L < 0.45) s = Math.max(s, 0.8);
    var L2 = L * (1 - s) + inv(L) * s + 0.035 * cr;
    var C2 = C * (L > 0.7 ? 1 - 0.55 * s : 1);
    return lchToRgb(Math.min(0.97, L2), C2, h);
  }

  // --- lectura de colors: el canvas natiu ho normalitza tot (#hex, rgb, hsl, noms) ---
  var CTX = CanvasRenderingContext2D.prototype;
  var fsDesc = Object.getOwnPropertyDescriptor(CTX, "fillStyle");
  var ssDesc = Object.getOwnPropertyDescriptor(CTX, "strokeStyle");
  var shDesc = Object.getOwnPropertyDescriptor(CTX, "shadowColor");
  var scratch = document.createElement("canvas").getContext("2d");
  function parse(str){
    fsDesc.set.call(scratch, "#010203");
    fsDesc.set.call(scratch, str);
    var v = fsDesc.get.call(scratch);
    if (v === "#010203" && !/^\s*#010203\s*$/i.test(str)) return null;
    if (typeof v !== "string") return null;
    if (v[0] === "#") return [parseInt(v.slice(1,3),16), parseInt(v.slice(3,5),16), parseInt(v.slice(5,7),16), 1];
    var m = v.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function fmt(r, g, b, a){
    if (a >= 1) return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    return "rgba(" + r + "," + g + "," + b + "," + (+a.toFixed(3)) + ")";
  }
  var cache = new Map();     // original → fosc
  var rev = new Map();       // clau rgba fosca → original (per tornar el clar a les lectures)
  function key(r, g, b, a){ return r + "," + g + "," + b + "," + (+(+a).toFixed(3)); }
  function mapColor(str){
    var hit = cache.get(str);
    if (hit !== undefined) return hit;
    var out = str, p = parse(str);
    if (p) {
      var m = mapRGB(p[0], p[1], p[2]);
      out = fmt(m[0], m[1], m[2], p[3]);
      if (!rev.has(key(m[0], m[1], m[2], p[3]))) rev.set(key(m[0], m[1], m[2], p[3]), str);
    }
    cache.set(str, out);
    return out;
  }
  var NAMED = "white|black|gray|grey|silver|whitesmoke|gainsboro|lightgray|lightgrey|darkgray|darkgrey|dimgray|dimgrey|snow|ivory|linen|beige|red|blue|yellow|orange|green|navy|maroon|teal|tan|wheat";
  var TOKEN = new RegExp("#[0-9a-fA-F]{3,8}\\b|rgba?\\([^)]*\\)|hsla?\\([^)]*\\)|(?<![\\w-])(?:" + NAMED + ")(?![\\w-])", "g");
  var HAS = new RegExp("#[0-9a-fA-F]{3}|rgb|hsl|(?<![\\w-])(?:" + NAMED + ")(?![\\w-])");
  function mapValue(v){
    if (typeof v !== "string" || !HAS.test(v)) return v;
    var c = cache.get("v:" + v); if (c !== undefined) return c;
    var out = splitUrl(v, function(part){ return part.replace(TOKEN, function(t){ return mapColor(t); }); });
    cache.set("v:" + v, out);
    if (out !== v) revVal.set(out, v);
    return out;
  }
  var revVal = new Map();
  function splitUrl(v, fn){ // no tocar res dins de url(...)
    if (v.indexOf("url(") < 0) return fn(v);
    return v.split(/(url\([^)]*\))/).map(function(s){ return s.indexOf("url(") === 0 ? s : fn(s); }).join("");
  }
  function unmapValue(v){
    if (typeof v !== "string" || !v) return v;
    var r = revVal.get(v); if (r !== undefined) return r;
    if (!HAS.test(v)) return v;
    return v.replace(TOKEN, function(t){
      var p = parse(t); if (!p) return t;
      var o = rev.get(key(p[0], p[1], p[2], p[3]));
      return o !== undefined ? o : t;
    });
  }
  window.IBTheme.map = mapColor;
  window.IBTheme.mapValue = mapValue;

  /* ---------- canvas 2D ---------- */
  function hookStyle(desc, name){
    Object.defineProperty(CTX, name, {
      configurable: true, enumerable: true,
      get: function(){ var v = desc.get.call(this); return typeof v === "string" ? unmapValue(v) : v; },
      set: function(v){ desc.set.call(this, typeof v === "string" ? mapColor(v) : v); }
    });
  }
  hookStyle(fsDesc, "fillStyle"); hookStyle(ssDesc, "strokeStyle"); hookStyle(shDesc, "shadowColor");
  var addStop = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function(o, c){ return addStop.call(this, o, typeof c === "string" ? mapColor(c) : c); };
  // el negre per defecte del canvas també ha de ser tinta clara
  function defaults(ctx){ try { fsDesc.set.call(ctx, mapColor("#000000")); ssDesc.set.call(ctx, mapColor("#000000")); } catch (e) {} }
  var ctxOf = new WeakMap();
  var getCtx = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type){
    var c = getCtx.apply(this, arguments);
    if (c && type === "2d" && !ctxOf.has(this)) { ctxOf.set(this, c); defaults(c); }
    return c;
  };
  ["width", "height"].forEach(function(p){
    var d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, p);
    Object.defineProperty(HTMLCanvasElement.prototype, p, { configurable: true, enumerable: true,
      get: d.get, set: function(v){ d.set.call(this, v); var c = ctxOf.get(this); if (c) defaults(c); } });
  });
  if (CTX.reset) { var rst = CTX.reset; CTX.reset = function(){ rst.call(this); defaults(this); }; }
  // píxels escrits a mà (mapes de relleu): es tradueixen en una còpia
  var put = CTX.putImageData, pixCache = new Map();
  CTX.putImageData = function(img){
    var src = img.data, n = src.length, out = new Uint8ClampedArray(n);
    for (var i = 0; i < n; i += 4) {
      var a = src[i+3];
      if (a === 0) { continue; }
      var k = (src[i] << 16) | (src[i+1] << 8) | src[i+2], m = pixCache.get(k);
      if (m === undefined) { m = mapRGB(src[i], src[i+1], src[i+2]); m = (m[0] << 16) | (m[1] << 8) | m[2]; pixCache.set(k, m); }
      out[i] = m >> 16; out[i+1] = (m >> 8) & 255; out[i+2] = m & 255; out[i+3] = a;
    }
    var args = Array.prototype.slice.call(arguments);
    args[0] = new ImageData(out, img.width, img.height);
    return put.apply(this, args);
  };

  /* ---------- atributs SVG i estils en línia ---------- */
  var ATTR = { fill: 1, stroke: 1, "stop-color": 1, "flood-color": 1, "lighting-color": 1, color: 1, style: 1, bgcolor: 1 };
  var orig = new WeakMap(); // element → {attr: [clar, fosc]}
  var setA = Element.prototype.setAttribute, getA = Element.prototype.getAttribute;
  function remember(el, name, o, m){ var r = orig.get(el); if (!r) { r = {}; orig.set(el, r); } r[name] = [o, m]; }
  Element.prototype.setAttribute = function(name, value){
    var n = typeof name === "string" ? name.toLowerCase() : name;
    if (ATTR[n] === 1 && typeof value === "string" || ATTR[n] === 1 && typeof value === "number") {
      value = String(value);
      var m = mapValue(value);
      if (m !== value) { remember(this, n, value, m); return setA.call(this, name, m); }
      var r = orig.get(this); if (r) delete r[n];
    }
    return setA.call(this, name, value);
  };
  Element.prototype.getAttribute = function(name){
    var v = getA.call(this, name);
    if (v !== null && typeof name === "string") {
      var r = orig.get(this), e = r && r[name.toLowerCase()];
      if (e && e[1] === v) return e[0];
    }
    return v;
  };
  function fixNode(el){
    if (el.nodeType !== 1) return;
    var r = orig.get(el);
    for (var a in ATTR) {
      var v = getA.call(el, a);
      if (v === null) continue;
      if (r && r[a] && r[a][1] === v) continue;   // ja traduït
      var m = mapValue(v);
      if (m !== v) { remember(el, a, v, m); setA.call(el, a, m); }
    }
  }
  function fixTree(node){
    if (!node || node.nodeType !== 1) return;
    fixNode(node);
    var all = node.querySelectorAll("[fill],[stroke],[stop-color],[flood-color],[style],[color],[bgcolor]");
    for (var i = 0; i < all.length; i++) fixNode(all[i]);
  }

  /* ---------- CSSStyleDeclaration (d3 .style(), el.style.x, getComputedStyle) ---------- */
  var CSD = CSSStyleDeclaration.prototype;
  var setP = CSD.setProperty, getP = CSD.getPropertyValue;
  CSD.setProperty = function(p, v, prio){ return setP.call(this, p, typeof v === "string" ? mapValue(v) : v, prio); };
  CSD.getPropertyValue = function(p){ return unmapValue(getP.call(this, p)); };
  ["color","fill","stroke","background","backgroundColor","background-color","borderColor","border-color","borderTopColor","borderBottomColor",
   "borderLeftColor","borderRightColor","outlineColor","stopColor","stop-color","boxShadow","textShadow","caretColor","textDecorationColor",
   "border","borderTop","borderBottom","borderLeft","borderRight","outline","cssText","backgroundImage","background-image","accentColor"]
  .forEach(function(p){
    var d = Object.getOwnPropertyDescriptor(CSD, p);
    if (!d || !d.set) return;
    Object.defineProperty(CSD, p, { configurable: true, enumerable: d.enumerable,
      get: function(){ return unmapValue(d.get.call(this)); },
      set: function(v){ d.set.call(this, typeof v === "string" ? mapValue(v) : v); } });
  });

  /* ---------- fulls d'estil ---------- */
  var doneSheets = new WeakSet();
  function fixRules(rules){
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.cssRules && r.cssRules.length) fixRules(r.cssRules);
      var st = r.style; if (!st) continue;
      for (var j = 0; j < st.length; j++) {
        var p = st[j], v = getP.call(st, p);
        if (!v || !HAS.test(v)) continue;
        var m = mapValue(v);
        if (m !== v) setP.call(st, p, m, st.getPropertyPriority(p));
      }
    }
  }
  function fixSheet(sh){
    if (doneSheets.has(sh)) return;
    var rules; try { rules = sh.cssRules; } catch (e) { return; } // fulls d'un altre domini (fonts)
    if (!rules) return;
    doneSheets.add(sh);
    if (sh.ownerNode && sh.ownerNode.id === "ib-theme-pre") return;
    fixRules(rules);
  }
  function fixSheets(){ for (var i = 0; i < document.styleSheets.length; i++) fixSheet(document.styleSheets[i]); }

  /* ---------- arrencada ---------- */
  function swapLogos(scope){
    var imgs = (scope || document).querySelectorAll('img[src$="logo.png"]');
    for (var i = 0; i < imgs.length; i++) imgs[i].src = imgs[i].getAttribute("src").replace(/logo\.png$/, "logo-dark.png");
  }
  function ready(){
    fixSheets();
    fixTree(document.documentElement);
    swapLogos();
    root.classList.add("ib-dark-ready");
    new MutationObserver(function(list){
      for (var i = 0; i < list.length; i++) {
        var add = list[i].addedNodes;
        for (var j = 0; j < add.length; j++) {
          var n = add[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === "STYLE" || n.tagName === "LINK") { if (n.sheet) fixSheet(n.sheet); n.addEventListener("load", function(){ fixSheet(this.sheet); }); continue; }
          fixTree(n);
          if (n.querySelector && n.querySelector("style")) fixSheets();
          swapLogos(n);
        }
      }
    }).observe(root, { childList: true, subtree: true });
    addEventListener("load", fixSheets);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
  setTimeout(function(){ root.classList.add("ib-dark-ready"); }, 2500);
})();
