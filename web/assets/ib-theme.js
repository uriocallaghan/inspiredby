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
  // login de l'editor (web/admin/): Netlify Identity torna a la portada amb #access_token=…; es passa a l'editor
  if (location.pathname === "/" && /^#(access_token|error)=/.test(location.hash)) { location.replace("/admin/" + location.hash); return; }
  // el tema el decideix només el dispositiu (decisió de l'editor, 21-11-2026): sense botó ni tria desada
  try { localStorage.removeItem(KEY); } catch (e) {}
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  // dins de l'editor (web/admin/, iframe «ib-cms-frame») la pàgina es pinta en clar i sense efectes de lectura:
  // així el text que s'edita és exactament el de la font, sense colors traduïts ni paraules embolcallades
  var CMS = window.name === "ib-cms-frame";
  var dark = !CMS && !!(mq && mq.matches);
  root.setAttribute("data-theme", dark ? "dark" : "light");

  function reloadKeepingPlace(){
    try { sessionStorage.setItem("ib-theme-y", String(scrollY)); } catch (e) {}
    location.reload();
  }
  window.IBTheme = { dark: dark };
  // si el dispositiu canvia de tema (p. ex. de dia a nit), la pàgina el segueix
  if (mq && mq.addEventListener && !CMS) mq.addEventListener("change", reloadKeepingPlace);
  // tornar al mateix punt després de canviar de tema
  try {
    var y = sessionStorage.getItem("ib-theme-y");
    if (y !== null) {
      sessionStorage.removeItem("ib-theme-y");
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      addEventListener("load", function(){ setTimeout(function(){ scrollTo(0, +y); }, 60); });
    }
  } catch (e) {}

  // selector d'idioma (assets/ib-lang.js), al costat del botó de tema
  (function(){
    var me = document.currentScript, src = me && me.src ? me.src.replace(/ib-theme\.js(\?.*)?$/, "ib-lang.js") : null;
    if (!src) return;
    var sc = document.createElement("script"); sc.src = src; sc.defer = true; (document.head || root).appendChild(sc);
  })();

  // efectes de lectura (assets/ib-fx.js): menu a l'esquerra de la barra, només als articles
  (function(){
    if (CMS || !/\/articles\//.test(location.pathname)) return;
    var me = document.currentScript, src = me && me.src ? me.src.replace(/ib-theme\.js(\?.*)?$/, "ib-fx.js") : null;
    if (!src) return;
    var sc = document.createElement("script"); sc.src = src; sc.defer = true; (document.head || root).appendChild(sc);
  })();

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
  // corba per als colors amb to (OKLab L): pàl·lid → a prop del fons · mitjà → gairebé igual · fosc → clar.
  // Així una rampa va sempre «del fons cap al color intens», i els tons foscos (redDark, blueDark) no s'enfonsen
  // en el fons: es tornen clars i llegibles, com diu la guia (sistema-infografic.md, §2 «Mode fosc»).
  var INVC = [[0,.9],[.25,.86],[.35,.82],[.45,.77],[.55,.71],[.62,.665],[.7,.6],[.8,.5],[.9,.4],[.97,.3],[1,.26]];
  function interp(T, L){
    for (var i = 1; i < T.length; i++) if (L <= T[i][0]) { var a = T[i-1], b = T[i]; return a[1] + (b[1]-a[1]) * (L-a[0]) / (b[0]-a[0]); }
    return T[T.length-1][1];
  }
  function mapRGB(r, g, b){
    var f = FIXED[r + "," + g + "," + b];
    if (f) return f;
    var lab = toLab(r, g, b), L = lab[0], C = Math.hypot(lab[1], lab[2]), h = Math.atan2(lab[2], lab[1]);
    if (C < 0.012) { var n = inv(L); var nn = lchToRgb(n, C, h); return nn; }
    // croma relativa (respecte del màxim possible) però també absoluta: un crema gairebé blanc s'ha d'invertir
    var cr = Math.min(1, C / Math.max(0.02, maxChroma(L, h))) * Math.min(1, C / 0.1);
    // els colors intensos (vermell, blau, groc) es queden; els pàl·lids i els foscos s'inverteixen
    var s = 1 - 0.85 * Math.pow(cr, 2.2);
    if (L < 0.56) s = Math.max(s, Math.min(1, (0.56 - L) / 0.14));
    var T = C < 0.04 ? inv(L) * (1 - C / 0.04) + interp(INVC, L) * (C / 0.04) : interp(INVC, L);
    // els colors intensos de grau mitjà pugen una mica, perquè fins i tot el text vermell passi de 5:1
    var lift = 0.06 * cr * (1 - s) * (L > 0.45 && L < 0.75 ? 1 : 0);
    var L2 = L * (1 - s) + T * s + lift;
    var C2 = C * (L > 0.7 ? 1 - 0.38 * s : 1);
    return lchToRgb(Math.min(0.97, L2), C2, h);
  }
  // text: una tinta mai pot quedar per sota de ~4,6:1 sobre el paper fosc. Els textos que eren blancs (paper)
  // van a sobre d'un farcit i no es toquen.
  var TEXT_MIN = 0.585;
  function textRGB(r, g, b){
    var m = mapRGB(r, g, b), o = toLab(r, g, b);
    if (o[0] > 0.9) return m;
    var lab = toLab(m[0], m[1], m[2]);
    if (lab[0] >= TEXT_MIN + 0.08) return m;
    // compressió suau: es manté l'ordre (un gris fluix continua sent més fluix que la tinta), però tot es llegeix
    var L2 = Math.max(lab[0], TEXT_MIN + Math.max(0, lab[0] - 0.2) * 0.17);
    return lchToRgb(L2, Math.hypot(lab[1], lab[2]), Math.atan2(lab[2], lab[1]));
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
  var tcache = new Map();
  function mapText(str){
    var hit = tcache.get(str);
    if (hit !== undefined) return hit;
    var out = str, p = parse(str);
    if (p) {
      var m = textRGB(p[0], p[1], p[2]);
      out = fmt(m[0], m[1], m[2], p[3]);
      if (!rev.has(key(m[0], m[1], m[2], p[3]))) rev.set(key(m[0], m[1], m[2], p[3]), str);
    }
    tcache.set(str, out);
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
  function mapTextValue(v){
    if (typeof v !== "string" || !HAS.test(v)) return v;
    var c = cache.get("t:" + v); if (c !== undefined) return c;
    var out = splitUrl(v, function(part){ return part.replace(TOKEN, function(t){ return mapText(t); }); });
    cache.set("t:" + v, out);
    if (out !== v) revVal.set(out, v);
    return out;
  }
  // un atribut style: el color del text (color, o fill d'un text SVG) passa pel mínim de contrast
  function mapStyleAttr(v, isText, fresh){
    if (typeof v !== "string" || !HAS.test(v)) return v;
    return v.split(";").map(function(d){
      var i = d.indexOf(":"); if (i < 0) return d;
      var prop = d.slice(0, i).trim().toLowerCase(), val = d.slice(i + 1);
      var txt = prop === "color" || prop === "-webkit-text-fill-color" || (isText && prop === "fill");
      if (fresh) {
        if (!HAS.test(val)) return d;
        return d.slice(0, i + 1) + splitUrl(val, function(part){ return part.replace(TOKEN, function(t){
          var p = parse(t); if (!p) return t;
          return rev.has(key(p[0], p[1], p[2], p[3])) ? t : (txt ? mapText(t) : mapColor(t));
        }); });
      }
      return d.slice(0, i + 1) + (txt ? mapTextValue(val) : mapValue(val));
    }).join(";");
  }
  var TEXT_TAGS = { text: 1, tspan: 1, textPath: 1, textpath: 1 };
  function isTextEl(el){ return !!el && TEXT_TAGS[el.localName] === 1; }
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
  // tradueix només els colors que encara no ho estan (els que ja són una sortida de la traducció es respecten)
  function mapFresh(v){
    if (typeof v !== "string" || !HAS.test(v)) return v;
    return splitUrl(v, function(part){ return part.replace(TOKEN, function(t){
      var p = parse(t); if (!p) return t;
      return rev.has(key(p[0], p[1], p[2], p[3])) ? t : mapColor(t);
    }); });
  }
  window.IBTheme.map = mapColor;
  window.IBTheme.mapValue = mapValue;

  /* ---------- canvas 2D ----------
     Només es tradueix el que es veu: els canvas que són a la pàgina i els «sprites» (canvas fora de la pàgina que
     es copien amb drawImage a un de visible). Els canvas ocults que es llegeixen amb getImageData (màscares de
     terra, màscares d'identitat per al hover) es queden en clar, perquè la seva lectura continuï sent correcta. */
  var sprite = new WeakSet(), dirtyOff = new WeakSet(), ver = new WeakMap(), ctxOf = new WeakMap();
  function live(ctx){ var c = ctx && ctx.canvas; return !!c && (c.isConnected || sprite.has(c)); }
  function touch(ctx){ var c = ctx.canvas; if (c && !c.isConnected && !sprite.has(c)) { dirtyOff.add(c); ver.set(c, (ver.get(c) || 0) + 1); } }
  function hookStyle(desc, name){
    Object.defineProperty(CTX, name, {
      configurable: true, enumerable: true,
      get: function(){ var v = desc.get.call(this); return typeof v === "string" && live(this) ? unmapValue(v) : v; },
      set: function(v){ desc.set.call(this, typeof v === "string" && live(this) ? mapColor(v) : v); }
    });
  }
  hookStyle(fsDesc, "fillStyle"); hookStyle(ssDesc, "strokeStyle"); hookStyle(shDesc, "shadowColor");
  // degradats: es tradueixen si el canvas que els crea es veu
  var gradLive = new WeakMap();
  ["createLinearGradient", "createRadialGradient", "createConicGradient"].forEach(function(m){
    var f = CTX[m]; if (!f) return;
    CTX[m] = function(){ var g = f.apply(this, arguments); gradLive.set(g, this); return g; };
  });
  var addStop = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function(o, c){ return addStop.call(this, o, typeof c === "string" && live(gradLive.get(this)) ? mapColor(c) : c); };
  // modes de fusió: el que enfosqueix sobre paper blanc ha d'aclarir sobre paper negre
  var BLEND = { multiply: "screen", screen: "multiply", darken: "lighten", lighten: "darken", "color-burn": "color-dodge", "color-dodge": "color-burn" };
  var BLEND_BACK = {}; for (var bk in BLEND) BLEND_BACK[BLEND[bk]] = bk;
  var gcoDesc = Object.getOwnPropertyDescriptor(CTX, "globalCompositeOperation");
  Object.defineProperty(CTX, "globalCompositeOperation", { configurable: true, enumerable: true,
    get: function(){ var v = gcoDesc.get.call(this); return live(this) && BLEND_BACK[v] ? BLEND_BACK[v] : v; },
    set: function(v){ gcoDesc.set.call(this, live(this) && BLEND[v] ? BLEND[v] : v); } });
  // el negre per defecte del canvas també ha de ser tinta clara (només als canvas visibles)
  function defaults(ctx){ try { var k = live(ctx) ? mapColor("#000000") : "#000000"; fsDesc.set.call(ctx, k); ssDesc.set.call(ctx, k); } catch (e) {} }
  var getCtx = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type){
    var c = getCtx.apply(this, arguments);
    if (c && type === "2d" && !ctxOf.has(this)) { ctxOf.set(this, c); defaults(c); }
    return c;
  };
  ["width", "height"].forEach(function(p){
    var d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, p);
    Object.defineProperty(HTMLCanvasElement.prototype, p, { configurable: true, enumerable: true,
      get: d.get, set: function(v){ d.set.call(this, v); var c = ctxOf.get(this); if (c) { defaults(c); dirtyOff.delete(this); } } });
  });
  if (CTX.reset) { var rst = CTX.reset; CTX.reset = function(){ rst.call(this); defaults(this); }; }
  // marcar els canvas ocults que s'hi dibuixa (per traduir-los si després es fan visibles)
  // text de canvas visible: mateix mínim de contrast que el text HTML i SVG
  ["fillText", "strokeText"].forEach(function(m){
    var f = CTX[m], d = m === "fillText" ? fsDesc : ssDesc;
    CTX[m] = function(){
      if (!live(this)) { touch(this); return f.apply(this, arguments); }
      var cur = d.get.call(this);
      if (typeof cur !== "string") return f.apply(this, arguments);
      var o = unmapValue(cur), t = o !== cur ? mapText(o) : cur;
      if (t === cur) return f.apply(this, arguments);
      d.set.call(this, t);
      try { return f.apply(this, arguments); } finally { d.set.call(this, cur); }
    };
  });
  ["fill", "stroke", "fillRect", "strokeRect"].forEach(function(m){
    var f = CTX[m]; CTX[m] = function(){ if (!live(this)) touch(this); return f.apply(this, arguments); };
  });
  // traducció de píxels, amb memòria per color
  var pixCache = new Map();
  function mapPixels(src, out){
    for (var i = 0, n = src.length; i < n; i += 4) {
      var a = src[i+3];
      out[i+3] = a;
      if (a === 0) continue;
      var k = (src[i] << 16) | (src[i+1] << 8) | src[i+2], m = pixCache.get(k);
      if (m === undefined) { m = mapRGB(src[i], src[i+1], src[i+2]); m = (m[0] << 16) | (m[1] << 8) | m[2]; pixCache.set(k, m); }
      out[i] = m >> 16; out[i+1] = (m >> 8) & 255; out[i+2] = m & 255;
    }
    return out;
  }
  var put = CTX.putImageData, getID = CTX.getImageData, drawImg = CTX.drawImage;
  CTX.putImageData = function(img){
    if (!live(this)) { touch(this); return put.apply(this, arguments); }
    var args = Array.prototype.slice.call(arguments);
    args[0] = new ImageData(mapPixels(img.data, new Uint8ClampedArray(img.data.length)), img.width, img.height);
    return put.apply(this, args);
  };
  function convertInPlace(cv){ // un canvas dibuixat en clar que ara es veu: es tradueix un cop
    var c = ctxOf.get(cv); if (!c || !cv.width || !cv.height) return;
    try { var im = getID.call(c, 0, 0, cv.width, cv.height); mapPixels(im.data, im.data); put.call(c, im, 0, 0); } catch (e) {}
    dirtyOff.delete(cv);
  }
  // un canvas ocult que es copia a un de visible passa a ser «sprite»: el que ja té es tradueix un cop
  // i, d'aquí endavant, el que s'hi dibuixi es tradueix en pintar-lo
  CTX.drawImage = function(src){
    if (src instanceof HTMLCanvasElement && !src.isConnected && !sprite.has(src) && live(this)) {
      sprite.add(src);
      if (dirtyOff.has(src)) convertInPlace(src);
      var sc = ctxOf.get(src); if (sc) defaults(sc);
    }
    if (!live(this)) touch(this);
    return drawImg.apply(this, arguments);
  };
  window.IBTheme._canvasAttached = function(cv){ if (dirtyOff.has(cv) && !sprite.has(cv)) convertInPlace(cv); var c = ctxOf.get(cv); if (c) defaults(c); };

  /* ---------- atributs SVG i estils en línia ---------- */
  var ATTR = { fill: 1, stroke: 1, "stop-color": 1, "flood-color": 1, "lighting-color": 1, color: 1, style: 1, bgcolor: 1 };
  var orig = new WeakMap(); // element → {attr: [clar, fosc]}
  var setA = Element.prototype.setAttribute, getA = Element.prototype.getAttribute;
  function remember(el, name, o, m){ var r = orig.get(el); if (!r) { r = {}; orig.set(el, r); } r[name] = [o, m]; }
  Element.prototype.setAttribute = function(name, value){
    var n = typeof name === "string" ? name.toLowerCase() : name;
    if (ATTR[n] === 1 && typeof value === "string" || ATTR[n] === 1 && typeof value === "number") {
      value = String(value);
      var m = n === "style" ? mapStyleAttr(value, isTextEl(this)) : (n === "fill" || n === "color") && isTextEl(this) ? mapTextValue(value) : mapValue(value);
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
      var m = a === "style" ? mapStyleAttr(v, isTextEl(el), true) : (a === "fill" || a === "color") && isTextEl(el) ? mapTextValue(v) : mapValue(v);
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
  CSD.setProperty = function(p, v, prio){
    if (p === "mix-blend-mode" && typeof v === "string" && BLEND[v.trim()]) v = BLEND[v.trim()];
    return setP.call(this, p, typeof v === "string" ? (p === "color" || p === "-webkit-text-fill-color" ? mapTextValue(v) : mapValue(v)) : v, prio);
  };
  CSD.getPropertyValue = function(p){ return unmapValue(getP.call(this, p)); };
  ["color","fill","stroke","background","backgroundColor","background-color","borderColor","border-color","borderTopColor","borderBottomColor",
   "borderLeftColor","borderRightColor","outlineColor","stopColor","stop-color","boxShadow","textShadow","caretColor","textDecorationColor",
   "border","borderTop","borderBottom","borderLeft","borderRight","outline","cssText","backgroundImage","background-image","accentColor","mixBlendMode"]
  .forEach(function(p){
    // a cada navegador els accessors viuen en un prototip diferent (CSSStyleDeclaration, CSS2Properties, CSSStyleProperties…)
    var owner = Object.getPrototypeOf(root.style), d = null;
    while (owner && !(d = Object.getOwnPropertyDescriptor(owner, p))) owner = Object.getPrototypeOf(owner);
    if (!d || !d.set) return;
    Object.defineProperty(owner, p, { configurable: true, enumerable: d.enumerable,
      get: function(){ return unmapValue(d.get.call(this)); },
      set: function(v){ if (p === "mixBlendMode" && typeof v === "string" && BLEND[v.trim()]) v = BLEND[v.trim()]; d.set.call(this, typeof v === "string" ? (p === "color" ? mapTextValue(v) : p === "cssText" ? mapStyleAttr(v, false) : mapValue(v)) : v); } });
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
        if (p === "mix-blend-mode" && BLEND[v.trim()]) {
          setP.call(st, p, BLEND[v.trim()], st.getPropertyPriority(p));
          // una imatge «multiply» és un dibuix sobre blanc: en fosc s'inverteix (traç clar, fons que desapareix)
          if (v.trim() === "multiply" && /\bimg\b/.test(r.selectorText || "") && !getP.call(st, "filter")) setP.call(st, "filter", "invert(1) hue-rotate(180deg) brightness(.88)", "important");
          continue;
        }
        if (!v || !HAS.test(v)) continue;
        var txt = p === "color" || p === "-webkit-text-fill-color" || (p === "fill" && /\b(text|tspan)\b/.test(r.selectorText || ""));
        var m = txt ? mapTextValue(v) : mapValue(v);
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

  /* ---------- text sobre farcits clars ----------
     El groc (i qualsevol farcit que es quedi clar) continua sent clar en fosc, però la tinta que hi anava a sobre
     s'ha tornat clara. Cada cert temps, per als textos SVG visibles, es mira què hi ha pintat a sota (isPointInFill):
     si és un farcit clar, el text torna a ser fosc i el halo pren el color del farcit. També per a etiquetes HTML amb
     fons clar propi (insígnies). */
  var DARK_TEXT = "#161514", onFill = new WeakSet(), passDirty = true, passLast = 0, passTimer = 0;
  function relLum(c){ return 0.2126 * s2l(c[0]) + 0.7152 * s2l(c[1]) + 0.0722 * s2l(c[2]); }
  function paintOf(cs, prop){ var p = parse(getP.call(cs, prop)); return p; }
  function opac(cs){ var a = parseFloat(getP.call(cs, "opacity")); return isNaN(a) ? 1 : a; }
  var removeP = CSD.removeProperty;
  function clearFix(el){ removeP.call(el.style, "fill"); removeP.call(el.style, "stroke"); removeP.call(el.style, "color"); onFill.delete(el); }
  function crRatio(a, b){ var x = relLum(a), y = relLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  var PAPER_D = [19, 19, 18], LIGHT_TEXT = [234, 232, 227], DARK_RGB = [22, 21, 20];
  var applied = new WeakMap(); // text → {sig, val}
  function boostRGB(c){ // aclareix (mateix to) fins que es llegeix sobre el paper fosc
    var lab = toLab(c[0], c[1], c[2]), C = Math.hypot(lab[1], lab[2]), h = Math.atan2(lab[2], lab[1]);
    for (var L = Math.max(lab[0], TEXT_MIN); L < 0.97; L += 0.02) { var o = lchToRgb(L, C, h); if (crRatio(o, PAPER_D) >= 4.6) return o; }
    return LIGHT_TEXT;
  }
  function blendOver(f, a, b){ return [f[0]*a + b[0]*(1-a), f[1]*a + b[1]*(1-a), f[2]*a + b[2]*(1-a)]; }
  function contrastPass(){
    passTimer = 0; passDirty = false; passLast = Date.now();
    var vh = innerHeight, vw = innerWidth, lo = -0.6 * vh, hi = 1.6 * vh, svgs = document.getElementsByTagName("svg");
    for (var i = 0; i < svgs.length; i++) {
      var svgEl = svgs[i], r = svgEl.getBoundingClientRect();
      if (!r.width || r.bottom < lo || r.top > hi || r.right < 0 || r.left > vw) continue;
      var texts = svgEl.getElementsByTagName("text"); if (!texts.length) continue;
      var shapes = null;
      for (var j = 0; j < texts.length; j++) {
        var t = texts[j], tr = t.getBoundingClientRect();
        if (!tr.width || tr.bottom < lo || tr.top > hi) continue;
        // si el text ha canviat des de l'última correcció (atribut, classe), es torna a mirar de zero
        var sig = getA.call(t, "fill") + "|" + getA.call(t, "class") + "|" + (t.parentNode && t.parentNode.getAttribute ? getA.call(t.parentNode, "fill") : "");
        var ap = applied.get(t);
        if (ap && (ap.sig !== sig || getP.call(t.style, "fill") !== ap.val)) { if (getP.call(t.style, "fill") === ap.val) clearFix(t); applied.delete(t); ap = null; }
        var cs = getComputedStyle(t);
        var tf = ap ? ap.base : paintOf(cs, "fill");
        if (!tf || tf[3] === 0) continue;
        if (!shapes) {
          shapes = [];
          var all = svgEl.querySelectorAll("circle,rect,path,ellipse,polygon");
          for (var k = 0; k < all.length; k++) {
            var sh = all[k], b = sh.getBoundingClientRect();
            if (!b.width || b.bottom < lo || b.top > hi) continue;
            var scs = getComputedStyle(sh), fl = paintOf(scs, "fill");
            if (!fl) continue;
            var al = fl[3] * opac(scs) * (parseFloat(getP.call(scs, "fill-opacity")) || 1);
            if (al < 0.45) continue;
            shapes.push([sh, b, blendOver(fl, Math.min(1, al), PAPER_D)]);
          }
        }
        var cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2, hit = null;
        for (var q = shapes.length - 1; q >= 0; q--) {
          var e = shapes[q], bb = e[1];
          if (cx < bb.left || cx > bb.right || cy < bb.top || cy > bb.bottom) continue;
          // la forma ha de cobrir la major part de l'etiqueta (un punt petit sota un text amb halo no compta)
          var ix = Math.max(0, Math.min(bb.right, tr.right) - Math.max(bb.left, tr.left)), iy = Math.max(0, Math.min(bb.bottom, tr.bottom) - Math.max(bb.top, tr.top));
          if (ix * iy < 0.55 * tr.width * tr.height) continue;
          if (!(e[0].compareDocumentPosition(t) & 4)) continue;          // la forma ha d'anar abans (a sota)
          var m = e[0].getScreenCTM(); if (!m) continue;
          try { if (e[0].isPointInFill(new DOMPoint(cx, cy).matrixTransform(m.inverse()))) { hit = e; break; } } catch (err) {}
        }
        var under = hit ? hit[2] : PAPER_D, want = null, cur = crRatio(tf, under);
        if (cur < 4.5) {
          if (hit) {
            var cd = crRatio(DARK_RGB, under), cl = crRatio(LIGHT_TEXT, under);
            if (Math.max(cd, cl) > cur + 0.3) want = cd >= cl ? DARK_TEXT : fmt(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2], 1);
          } else if (relLum(tf) < relLum(PAPER_D) + 0.2 && !(function(){ var of = parse(t.getAttribute("fill") || ""); return of && relLum(of) > 0.8; })()) {
            // (un text que era blanc va a sobre d'alguna cosa, potser un canvas: no s'aclareix)
            var bo = boostRGB(tf); want = fmt(bo[0], bo[1], bo[2], 1);
          }
        }
        if (want) {
          if (!ap || ap.val !== want) {
            setP.call(t.style, "fill", want, "important");
            var st = getP.call(cs, "stroke");
            if (hit && st && st !== "none") setP.call(t.style, "stroke", fmt(Math.round(under[0]), Math.round(under[1]), Math.round(under[2]), 1), "important");
            applied.set(t, { sig: sig, val: getP.call(t.style, "fill"), base: tf });
            onFill.add(t);
          }
        } else if (ap) { clearFix(t); applied.delete(t); }
      }
    }
    // insígnies HTML amb fons clar propi
    var tagged = document.querySelectorAll("[style*='background']");
    for (var h = 0; h < tagged.length; h++) {
      var el = tagged[h], rr = el.getBoundingClientRect();
      if (!rr.width || rr.bottom < 0 || rr.top > vh || el.children.length > 2) continue;
      var c2 = getComputedStyle(el), bg = paintOf(c2, "background-color"), fg = paintOf(c2, "color");
      if (bg && fg && bg[3] > 0.6 && relLum(bg) > 0.3 && relLum(fg) > 0.35) { setP.call(el.style, "color", DARK_TEXT, "important"); onFill.add(el); }
      else if (onFill.has(el) && !(bg && bg[3] > 0.6 && relLum(bg) > 0.3)) clearFix(el);
    }
  }
  function schedulePass(){
    passDirty = true;
    if (passTimer) return;
    var wait = Math.max(80, 300 - (Date.now() - passLast));
    passTimer = setTimeout(function(){ (window.requestIdleCallback || function(f){ f(); })(contrastPass, { timeout: 400 }); }, wait);
  }
  window.IBTheme._contrastPass = contrastPass;

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
      schedulePass();
      for (var i = 0; i < list.length; i++) {
        if (list[i].type === "attributes") {
          // el.style.color = … no passa per cap funció interceptable a Chrome: es tradueix aquí, abans de pintar
          var tg = list[i].target, sv = getA.call(tg, "style");
          if (sv && HAS.test(sv)) { var sm = mapStyleAttr(sv, isTextEl(tg), true); if (sm !== sv) setA.call(tg, "style", sm); }
          continue;
        }
        var add = list[i].addedNodes;
        for (var j = 0; j < add.length; j++) {
          var n = add[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === "STYLE" || n.tagName === "LINK") { if (n.sheet) fixSheet(n.sheet); n.addEventListener("load", function(){ fixSheet(this.sheet); }); continue; }
          fixTree(n);
          if (n.tagName === "CANVAS") window.IBTheme._canvasAttached(n);
          else if (n.querySelectorAll) { var cvs = n.querySelectorAll("canvas"); for (var q = 0; q < cvs.length; q++) window.IBTheme._canvasAttached(cvs[q]); }
          if (n.querySelector && n.querySelector("style")) fixSheets();
          swapLogos(n);
        }
      }
    }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    addEventListener("load", function(){ fixSheets(); schedulePass(); });
    addEventListener("scroll", schedulePass, { passive: true });
    addEventListener("resize", schedulePass);
    addEventListener("pointerup", schedulePass, { passive: true });
    addEventListener("pointermove", function(){ if (!passTimer) schedulePass(); }, { passive: true });
    setInterval(function(){ if (!document.hidden) schedulePass(); }, 1000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
  setTimeout(function(){ root.classList.add("ib-dark-ready"); }, 2500);
})();
