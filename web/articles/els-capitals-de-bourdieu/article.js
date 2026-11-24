/* «Els quatre capitals de Pierre Bourdieu» · gràfics del sistema infogràfic
   V2 · PART-01 en gira-sol (dades reals): 1.000 fills per categoria, els que entren a la universitat en blau (Les Héritiers)
   V6 · SPREAD-04 (dades reals): PISA 2022, un punt per alumne, origen socioeconòmic i nota de matemàtiques
   V3 · SPREAD-02 + LINK-02 (scrolly, esquema): el mapa sencer de l'espai social (La Distinction)
   V4 · CASE-09 (dades reals): flors de dades, un pètal per obra musical (La Distinction)
   V5 · CASE-09 + PART-01 (dades reals): set classes, set variables de la taula 6 (Savage et al., 2013) */
(function(){
"use strict";
const V = IBV, C = V.C, D = window.BOURDIEU_DATA;
if(!V || !D) return;
const $ = s => document.querySelector(s);
const f0 = V.fmt(",.0f"), f1 = V.fmt(",.1f");
const EIO = d3.easeCubicInOut;
const TAU = Math.PI * 2;
const cl01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const smooth = (x, a, b) => { const t = cl01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const textW = (s, size, bold) => String(s).length * size * (bold ? .55 : .5);

function bindSeg(figSel, cb){
  const root = $(figSel); if(!root) return;
  const btns = root.querySelectorAll(".seg button");
  btns.forEach(b => b.addEventListener("click", () => {
    btns.forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    cb(b.dataset.k);
  }));
}
// talla un text en línies d'una amplada màxima aproximada
function wrap(str, maxW, size, bold){
  const words = str.split(" "), out = []; let line = "";
  words.forEach(wd => {
    const tryL = line ? line + " " + wd : wd;
    if(line && textW(tryL, size, bold) > maxW){ out.push(line); line = wd; } else line = tryL;
  });
  if(line) out.push(line);
  return out;
}
// canvas a sota i SVG a sobre, a la mateixa mida
function layers(container, w, h, label){
  const {c, ctx} = V.canvas(container, w, h, "");
  d3.select(c).attr("role", null).attr("aria-hidden", "true");
  const svg = V.svg(container, w, h, label);
  svg.style("position", "absolute").style("left", 0).style("top", 0);
  return {ctx, svg};
}

/* =========================================================================
   V2 · PART-01 en gira-sol (dades reals): 1.000 joves per categoria
   Cada disc és una cohort de 1.000 fills; els punts blaus (al cor del gira-sol)
   són els que arriben a la universitat. L'àrea blava és proporcional a la taxa.
   ========================================================================= */
(function(){
  const el = $("#heritiers-viz"); if(!el) return;
  const lg = $("#heritiers-lg");
  if(lg) V.legendCat(lg, [{c: C.blue, t: "Arriba a la universitat"}, {c: C.ghost, t: "No hi arriba"}], {title: "Cada punt, 1 de cada 1.000 fills"});
  const DATA = D.heritiers, TOP = DATA[0], REF = DATA.find(d => d.ref);
  const N = 1000, GA = Math.PI * (3 - Math.sqrt(5));

  V.mount(el, (container, w) => {
    const mob = w < 600, cols = mob ? 2 : (w < 980 ? 4 : 7);
    const rows = Math.ceil(DATA.length / cols), cw = w / cols;
    const R = Math.min(cw * .41, mob ? 72 : 76);
    const top = mob ? 8 : 50, labH = mob ? 86 : 92;
    const rowH = 2 * R + labH;
    const h = top + rows * rowH;
    const pos = DATA.map((d, i) => {
      const r = Math.floor(i / cols), inRow = Math.min(cols, DATA.length - r * cols), c = i % cols;
      const x0 = (w - inRow * cw) / 2;
      return {x: x0 + (c + .5) * cw, y: top + r * rowH + R};
    });
    const {ctx, svg} = layers(container, w, h, "Set gira-sols de 1.000 punts, un per categoria socioprofessional del pare a França (1961–1962). Els punts blaus són els fills que arriben a la universitat: 585 de cada 1.000 fills de quadres superiors, 14 de cada 1.000 fills d'obrers i 7 de cada 1.000 fills d'assalariats agrícoles.");
    const dotR = R * Math.sqrt(Math.PI / N) * .4;
    const PTS = d3.range(N).map(k => { const r = R * Math.sqrt((k + .5) / N), a = k * GA; return [Math.cos(a) * r, Math.sin(a) * r]; });
    const prog = DATA.map(() => 1);
    let foc = null, grey = 1;

    function draw(){
      ctx.clearRect(0, 0, w, h);
      DATA.forEach((d, i) => {
        const p = pos[i], lit = Math.round(d.pct * 10 * prog[i]), fa = foc == null || foc === i ? 1 : .5;
        ctx.fillStyle = C.ghost; ctx.globalAlpha = .75 * fa * grey; ctx.beginPath();
        for(let k = lit; k < N; k++){ const q = PTS[k]; ctx.moveTo(p.x + q[0] + dotR, p.y + q[1]); ctx.arc(p.x + q[0], p.y + q[1], dotR, 0, TAU); }
        ctx.fill();
        ctx.fillStyle = C.blue; ctx.globalAlpha = .95 * fa; ctx.beginPath();
        for(let k = 0; k < lit; k++){ const q = PTS[k]; ctx.moveTo(p.x + q[0] + dotR * 1.12, p.y + q[1]); ctx.arc(p.x + q[0], p.y + q[1], dotR * 1.12, 0, TAU); }
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    const g = svg.append("g");
    const lab = g.selectAll("g.lb").data(DATA).join("g").attr("class", "lb")
      .attr("transform", (d, i) => `translate(${pos[i].x},${pos[i].y + R})`);
    lab.each(function(d){
      const gr = d3.select(this);
      V.t(gr, 0, mob ? 26 : 30, f1(d.pct) + " %", {serif: true, size: mob ? 21 : 24, anchor: "middle", fill: d.highlight ? C.blue : C.ink});
      const ln = wrap(d.label, cw - 14, 12.5, true);
      ln.forEach((l, j) => V.t(gr, 0, (mob ? 44 : 49) + j * 15, l, {size: 12.5, weight: 700, anchor: "middle"}));
      const y2 = (mob ? 44 : 49) + ln.length * 15;
      V.t(gr, 0, y2, `${f0(d.pct * 10)} de cada 1.000`, {size: 11.5, anchor: "middle", fill: C.muted});
    });
    // Anotació: l'arc entre els fills de quadres superiors i els d'obrers
    const noteG = g.append("g");
    if(!mob && cols === 7){
      const a = pos[0], b = pos[DATA.indexOf(REF)];
      const ya = a.y - R - 6, yb = b.y - R - 6, mx = (a.x + b.x) / 2, my = Math.min(ya, yb) - 40;
      noteG.append("path").attr("d", `M${a.x},${ya}Q${mx},${my - 6} ${b.x},${yb}`).attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", .8);
      noteG.append("path").attr("d", `M${b.x - 4},${yb - 6}L${b.x},${yb}L${b.x + 5},${yb - 5}`).attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", .8);
      V.t(noteG, mx, my + 14, `${f0(TOP.pct / REF.pct)} vegades més probable`, {size: 12.5, weight: 700, anchor: "middle", halo: true});
    } else {
      const i = DATA.indexOf(REF), p = pos[i];
      V.t(noteG, p.x, p.y + R + (mob ? 44 : 49) + 2 * 15 + 14, `${f0(TOP.pct / REF.pct)} vegades menys`, {size: 11.5, anchor: "middle", fill: C.ink2, italic: true});
    }

    if(!container.__seen && !V.reduced){
      prog.fill(0); grey = 0; lab.style("opacity", 0); noteG.style("opacity", 0); draw();
      V.onView(container, inst => {
        if(inst){ prog.fill(1); grey = 1; lab.style("opacity", 1); noteG.style("opacity", 1); draw(); return; }
        const t0 = performance.now();
        const tm = d3.timer(() => {
          const e = performance.now() - t0;
          grey = cl01(e / 500);
          DATA.forEach((d, i) => { prog[i] = d3.easeCubicOut(cl01((e - 300 - i * 110) / 1500)); });
          draw();
          if(e > 300 + 6 * 110 + 1500){ tm.stop(); }
        });
        lab.transition().delay((d, i) => 250 + i * 110).duration(500).style("opacity", 1);
        noteG.transition().delay(1900).duration(500).style("opacity", 1);
      });
    } else draw();

    const tp = V.tip(container);
    svg.style("cursor", "pointer");
    V.hover(svg.node(), (ev, [px, py]) => {
      const i = d3.leastIndex(pos, p => Math.hypot(px - p.x, (py - p.y - labH / 2) * .7));
      const p = pos[i];
      if(Math.abs(px - p.x) > cw / 2 || py < p.y - R - 10 || py > p.y + R + labH){ if(foc != null){ foc = null; V.focus(lab, null); draw(); } tp.hide(); return; }
      if(foc !== i){ foc = i; V.focus(lab, (d, j) => d === DATA[i]); draw(); }
      const d = DATA[i];
      const rel = d === TOP ? `${f0(d.pct / REF.pct)} vegades més que els fills d'obrers` : d.ref ? `${f0(TOP.pct / d.pct)} vegades menys que els fills de quadres superiors` : `×${f1(d.pct / REF.pct)} respecte als fills d'obrers`;
      tp.show(`<b>${d.label}</b> · ${f0(d.pct * 10)} de cada 1.000 fills arriben a la universitat (${f1(d.pct)} %) · ${rel}`);
    }, () => { foc = null; V.focus(lab, null); draw(); tp.hide(); });
  });
})();

/* =========================================================================
   V6 · SPREAD-04 (dades reals): PISA 2022, un punt per alumne
   Cada punt és un alumne de la mostra: a l'esquerra, menys capital econòmic, social
   i cultural a casa (índex ESCS de l'OCDE); amunt, més nota de matemàtiques. A sobre,
   la mitjana de cada quart socioeconòmic i la bretxa entre el primer i el darrer.
   ========================================================================= */
(function(){
  const el = $("#pisa-viz"), P = window.BOURDIEU_PISA; if(!el || !P) return;
  const lg = $("#pisa-lg");
  if(lg) V.legendCat(lg, [{c: C.blue, t: "Un alumne de la mostra", a: .7}, {c: C.ink, t: "Mitjana de cada quart", kind: "line", w: 2}, {c: C.red, t: "Bretxa entre el primer i el darrer quart", kind: "line", w: 1.5}]);
  const NAMES = {oecd: "Països de l'OCDE", esp: "Espanya", cat: "Catalunya"};
  // reixa RLE -> Uint16Array
  Object.values(P.views).forEach(v => {
    if(v.g) return;
    const g = new Uint16Array(P.xb[2] * P.yb[2]); let i = 0;
    v.rle.forEach(t => { if(t < 0) i += -t; else g[i++] = t; });
    v.g = g;
  });
  let view = "oecd", setView = null;

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const h = mob ? 360 : 470;
    const m = mob ? {t: 22, r: 12, b: 40, l: 10} : {t: 26, r: 150, b: 46, l: 20};
    const {ctx, svg} = layers(container, w, h, `Núvol de punts de PISA 2022: cada punt és un alumne, segons l'índex socioeconòmic i cultural de casa seva (horitzontal) i la nota de matemàtiques (vertical). Als països de l'OCDE, l'alumnat del quart més afavorit treu de mitjana ${f0(P.views.oecd.qmean[3] - P.views.oecd.qmean[0])} punts més que el del quart més desafavorit.`);
    const X = d3.scaleLinear([P.xb[0], P.xb[1]], [m.l, w - m.r]).clamp(true);
    const Y = d3.scaleLinear([P.yb[0], P.yb[1]], [h - m.b, m.t]).clamp(true);
    const XS = d3.scaleLinear([-3.5, 3], [m.l, w - m.r]);   // finestra visible
    const YS = d3.scaleLinear([150, 850], [h - m.b, m.t]);
    const cwx = (P.xb[1] - P.xb[0]) / P.xb[2], cwy = (P.yb[1] - P.yb[0]) / P.yb[2];
    const rnd = V.rng(2022);

    let pts = null;
    function build(v){
      const g = P.views[v].g, arr = [];
      for(let r = 0; r < P.yb[2]; r++) for(let c = 0; c < P.xb[2]; c++){
        const n = g[r * P.xb[2] + c]; if(!n) continue;
        const x0 = P.xb[0] + c * cwx, y0 = P.yb[0] + r * cwy;
        for(let k = 0; k < n; k++) arr.push(XS(x0 + rnd() * cwx), YS(y0 + rnd() * cwy));
      }
      // ordre aleatori per a l'entrada
      const n = arr.length / 2, ord = new Uint32Array(n);
      for(let i = 0; i < n; i++) ord[i] = i;
      for(let i = n - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)), t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
      return {xy: new Float32Array(arr), ord, n};
    }
    function draw(frac){
      ctx.clearRect(0, 0, w, h);
      const n = Math.floor(pts.n * (frac == null ? 1 : frac));
      const a = Math.min(.55, .09 * Math.sqrt(280000 / pts.n)) * (mob ? 1.3 : 1);
      ctx.fillStyle = C.blue; ctx.globalAlpha = a;
      const s = (pts.n < 5000 ? 2.6 : pts.n < 50000 ? 1.6 : 1.2) * (mob ? .85 : 1);
      for(let i = 0; i < n; i++){ const k = pts.ord[i]; const x = pts.xy[2 * k], y = pts.xy[2 * k + 1];
        if(x < m.l || x > w - m.r || y < m.t || y > h - m.b) continue; ctx.fillRect(x - s / 2, y - s / 2, s, s); }
      ctx.globalAlpha = 1;
    }

    const g = svg.append("g");
    // eixos
    [200, 300, 400, 500, 600, 700, 800].forEach((t, i, a) => {
      g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", YS(t)).attr("y2", YS(t)).attr("stroke", C.grid).attr("stroke-width", .6);
      if(!mob || t % 200 === 0) V.t(g, m.l, YS(t) - 4, t + (i === a.length - 1 ? " punts de matemàtiques" : ""), {size: 11, anchor: "start", fill: C.muted, halo: 2});
    });
    (mob ? [-3, -2, -1, 0, 1, 2] : [-3, -2, -1, 0, 1, 2, 3]).forEach(t => V.t(g, XS(t), h - m.b + 16, String(t).replace("-", "−"), {size: 11, anchor: "middle", fill: t === 0 ? C.ink : C.muted}));
    V.t(g, m.l, h - m.b + (mob ? 32 : 34), mob ? "← menys capital a casa" : "← Menys capital econòmic, social i cultural a casa", {size: 11.5, anchor: "start", fill: C.ink2});
    V.t(g, w - m.r, h - m.b + (mob ? 32 : 34), mob ? "més →" : "més →  (índex ESCS de l'OCDE)", {size: 11.5, anchor: "end", fill: C.ink2});

    const qG = g.append("g");
    function drawQ(anim){
      qG.selectAll("*").remove();
      const v = P.views[view], qs = [-3.5].concat(v.q, [3]);
      v.qmean.forEach((mu, k) => {
        const x0 = XS(qs[k]) + 2, x1 = XS(qs[k + 1]) - 2, y = YS(mu);
        if(k > 0) qG.append("line").attr("x1", XS(qs[k])).attr("x2", XS(qs[k])).attr("y1", m.t).attr("y2", h - m.b).attr("stroke", C.ink).attr("stroke-width", .6).attr("stroke-dasharray", "2 3").attr("stroke-opacity", .5);
        qG.append("line").attr("class", "qm").attr("x1", x0).attr("x2", x1).attr("y1", y).attr("y2", y).attr("stroke", C.ink).attr("stroke-width", 2.2);
        V.t(qG, (x0 + x1) / 2, y - 7, f0(mu), {size: mob ? 11.5 : 12.5, weight: 700, anchor: "middle", halo: 3});
      });
      // bretxa
      const gap = v.qmean[3] - v.qmean[0], xg = mob ? XS(v.q[2]) + 14 : w - m.r + 14;
      const y0 = YS(v.qmean[0]), y1 = YS(v.qmean[3]);
      if(!mob){
        qG.append("line").attr("x1", XS(qs[1]) - 2).attr("x2", xg).attr("y1", y0).attr("y2", y0).attr("stroke", C.red).attr("stroke-width", .8).attr("stroke-dasharray", "2 3");
        qG.append("line").attr("x1", XS(3) - 2).attr("x2", xg).attr("y1", y1).attr("y2", y1).attr("stroke", C.red).attr("stroke-width", .8).attr("stroke-dasharray", "2 3");
      }
      qG.append("path").attr("d", `M${xg - 5},${y0}L${xg},${y0}L${xg},${y1}L${xg - 5},${y1}`).attr("fill", "none").attr("stroke", C.red).attr("stroke-width", 1.5);
      V.t(qG, xg + 8, (y0 + y1) / 2 - 2, `${f0(gap)} punts`, {size: mob ? 12.5 : 15, weight: 700, fill: C.red, halo: 3});
      if(!mob) V.lines(qG, xg + 8, (y0 + y1) / 2 + 15, [["entre el quart més"], ["desafavorit i el"], ["més afavorit"]], {size: 11.5, fill: C.ink2, halo: true});
      V.t(qG, mob ? m.l + 4 : m.l + 8, m.t + 30, `${NAMES[view]} · ${f0(v.n)} alumnes`, {size: 12, weight: 700, halo: 3});
      if(anim && !V.reduced) qG.style("opacity", 0).transition().delay(300).duration(600).style("opacity", 1);
    }

    pts = build(view);
    drawQ(false);
    if(!container.__seen && !V.reduced){
      draw(0); qG.style("opacity", 0);
      V.onView(container, inst => {
        if(inst){ draw(1); qG.style("opacity", 1); return; }
        const t0 = performance.now();
        const tm = d3.timer(() => { const e = cl01((performance.now() - t0) / 1600); draw(d3.easeCubicOut(e)); if(e >= 1) tm.stop(); });
        qG.transition().delay(1300).duration(600).style("opacity", 1);
      });
    } else draw(1);

    setView = function(k){
      view = k; pts = build(k);
      if(V.reduced){ draw(1); drawQ(false); return; }
      const t0 = performance.now();
      const tm = d3.timer(() => { const e = cl01((performance.now() - t0) / 900); draw(d3.easeCubicOut(e)); if(e >= 1) tm.stop(); });
      drawQ(true);
    };

    const tp = V.tip(container);
    svg.style("cursor", "crosshair");
    V.hover(svg.node(), (ev, [px, py]) => {
      if(px < m.l || px > w - m.r || py < m.t || py > h - m.b){ tp.hide(); qG.selectAll("line.qm").attr("stroke-width", 2.2); return; }
      const v = P.views[view], e = XS.invert(px), k = e <= v.q[0] ? 0 : e <= v.q[1] ? 1 : e <= v.q[2] ? 2 : 3;
      const nm = ["El 25 % més desafavorit", "El segon quart", "El tercer quart", "El 25 % més afavorit"][k];
      qG.selectAll("line.qm").attr("stroke-width", (d, i) => i === k ? 3.4 : 1.6);
      tp.show(`<b>${nm}</b> (${NAMES[view]}) · nota mitjana de matemàtiques: <b>${f0(v.qmean[k])} punts</b>`);
    }, () => { tp.hide(); qG.selectAll("line.qm").attr("stroke-width", 2.2); });
  });

  bindSeg("#f-pisa", k => { if(setView) setView(k); });
})();

/* =========================================================================
   V3 · SPREAD-02 + LINK-02 (scrolly, 4 passos): l'espai social de La Distinction
   El mapa de Bourdieu sencer: 24 professions i 22 pràctiques a la seva posició.
   A sota, una trama de punts que dibuixa la definició dels eixos: el gris diu el
   volum de capital i, en partir-se, el blau diu el capital cultural i el vermell
   l'econòmic (el quiasme). En passar per una pràctica, fils fins fins a les tres
   professions més properes: la correspondència entre posició i gust.
   ========================================================================= */
(function(){
  const el = $("#esp-viz"), stepsEl = $("#s-espai .steps"), gEl = $("#s-espai .graphic");
  if(!el) return;
  const lg = $("#esp-lg");
  if(lg) V.legendCat(lg, [
    {c: C.blue, t: "Capital cultural", a: .6},
    {c: C.red, t: "Capital econòmic", a: .6},
    {c: C.ink, t: "Professions"},
    {c: C.ink2, t: "Pràctiques, en cursiva", kind: "none"}
  ]);
  const PROFS = D.espai.professions, PRAC = D.espai.practiques;
  const TITLES = {
    volum: ["Eix vertical · Volum global de capital", "Com més gros el punt de la trama, més capital de tota mena"],
    estructura: ["Eix horitzontal · Estructura del capital", "El mateix volum es parteix: cultura a l'esquerra, diners a la dreta"],
    gustos: ["El gust segueix les coordenades socials", "Les pràctiques sobre el mateix mapa que les professions. Passa-hi per veure amb qui conviuen"],
    distincio: ["La mecànica de la distinció", "Quan un gust es popularitza, la frontera simbòlica puja"]
  };
  const ST = {volum: {m: 0, f: 1}, estructura: {m: 1, f: 1}, gustos: {m: 1, f: .42}, distincio: {m: 1, f: .42}};
  let curStep = "volum", applyStep = null;
  const fs = {m: 0, f: 1};

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const h = mob ? Math.round(Math.max(250, Math.min(window.innerHeight * .36, 300))) : Math.round(Math.max(460, Math.min(600, window.innerHeight - 290)));
    const m = mob ? {t: 22, r: 8, b: 22, l: 8} : {t: 30, r: 20, b: 30, l: 20};
    const {ctx, svg} = layers(container, w, h, "L'espai social de La Distinction (Bourdieu, 1979): 24 professions i 22 pràctiques en dos eixos. Amunt, més capital; a l'esquerra, més capital cultural; a la dreta, més capital econòmic. Professors i artistes amb el piano i els escacs a dalt a l'esquerra; patrons amb el golf, l'equitació i el xampany a dalt a la dreta; obrers amb el futbol, la belote i el vi negre corrent a baix.");
    const X = d3.scaleLinear([-1.02, 1.02], [m.l, w - m.r]);
    const Y = d3.scaleLinear([-1.08, 1.08], [h - m.b, m.t]);

    // Trama hexagonal (la definició dels eixos)
    const sp = mob ? 12 : 15, rmax = sp * .42;
    const LAT = [];
    let row = 0;
    for(let y = m.t + 2; y <= h - m.b - 2; y += sp * .866, row++){
      for(let x = m.l + (row % 2 ? sp / 2 : 0) + 2; x <= w - m.r - 2; x += sp){
        const u = cl01((X.invert(x) + 1) / 2), v = cl01((Y.invert(y) + 1) / 2);
        LAT.push({x, y, vol: v, cul: v * (1 - u), eco: v * u});
      }
    }
    function drawField(){
      ctx.clearRect(0, 0, w, h);
      const mm = fs.m * fs.m * (3 - 2 * fs.m), F = fs.f;
      if(mm < .999){
        ctx.fillStyle = C.ink2; ctx.globalAlpha = .24 * (1 - mm) * F; ctx.beginPath();
        LAT.forEach(p => { const r = rmax * .8 * Math.sqrt(p.vol); if(r < .35) return; ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, TAU); });
        ctx.fill();
      }
      if(mm > .001){
        const off = sp * .2 * mm;
        ctx.globalCompositeOperation = "multiply";
        [[C.blue, "cul", -off], [C.red, "eco", off]].forEach(([c, k, o]) => {
          ctx.fillStyle = c; ctx.globalAlpha = .36 * mm * F; ctx.beginPath();
          LAT.forEach(p => { const r = rmax * Math.sqrt(p[k]); if(r < .35) return; ctx.moveTo(p.x + o + r, p.y); ctx.arc(p.x + o, p.y, r, 0, TAU); });
          ctx.fill();
        });
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;
    }

    const g = svg.append("g");
    g.append("line").attr("x1", X(0)).attr("x2", X(0)).attr("y1", m.t).attr("y2", h - m.b).attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-opacity", .5);
    const axH = g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", Y(0)).attr("y2", Y(0)).attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-opacity", .15);
    V.t(g, X(0), m.t - 9, "↑ Més capital", {size: mob ? 11 : 12, weight: 700, anchor: "middle", halo: true});
    V.t(g, X(0), h - m.b + 16, "↓ Menys capital", {size: mob ? 11 : 12, anchor: "middle", fill: C.muted, halo: true});
    const lblCul = V.t(g, m.l, Y(0) + 15, "← Més cultural", {size: mob ? 11 : 12, weight: 700, anchor: "start", fill: C.blue, halo: true}).style("opacity", 0);
    const lblEco = V.t(g, w - m.r, Y(0) + 15, "Més econòmic →", {size: mob ? 11 : 12, weight: 700, anchor: "end", fill: C.red, halo: true}).style("opacity", 0);

    // Frontera de la distinció (il·lustrativa): on era i on és
    const OLD = [[-1, .1], [-.4, .2], [.4, .18], [1, .08]], NEW = [[-1, .4], [-.4, .5], [.4, .48], [1, .38]];
    const line = d3.line().x(d => X(d[0])).y(d => Y(d[1])).curve(d3.curveCatmullRom);
    const distG = g.append("g").style("opacity", 0);
    distG.append("path").attr("d", line(OLD)).attr("fill", "none").attr("stroke", C.ink2).attr("stroke-width", 1).attr("stroke-dasharray", "1.5 3.5").attr("stroke-linecap", "round");
    const newP = distG.append("path").attr("d", line(OLD)).attr("fill", "none").attr("stroke", C.red).attr("stroke-width", 1.8).attr("stroke-dasharray", "6 4");
    const newL = V.t(distG, X(.99), Y(.42) - 8, "Frontera de la distinció", {size: mob ? 11 : 12, weight: 700, anchor: "end", fill: C.red, halo: true}).style("opacity", 0);
    if(!mob) V.t(distG, X(.99), Y(.06) + 16, "on era abans", {size: 11.5, italic: true, anchor: "end", fill: C.muted, halo: true});

    // Fils de correspondència (hover sobre una pràctica)
    const linkG = g.append("g");

    // Pràctiques: cursiva serif, a la posició del mapa original
    const prG = g.append("g").style("opacity", 0);
    const prN = prG.selectAll("g.pr").data(PRAC).join("g").attr("class", "pr")
      .attr("transform", d => `translate(${X(d.x)},${Y(d.y)})`).style("display", d => mob && !d.mob ? "none" : null);
    prN.each(function(d){
      const nud = {"comèdia musical": [-8, 5, "end"], "belote (cartes)": [-4, 22, "middle"]}[d.n] || [0, 5];
      const col = d.x < -.12 ? C.blue : d.x > .12 ? C.red : C.ink2;
      V.t(d3.select(this), nud[0], nud[1], d.n, {serif: true, italic: true, size: mob ? 13 : 16, anchor: nud[2] || (d.x > .7 ? "end" : d.x < -.7 ? "start" : "middle"), fill: col, halo: 3});
    });

    // Professions: punt i nom
    const pG = g.selectAll("g.prof").data(PROFS).join("g").attr("class", "prof")
      .attr("transform", d => `translate(${X(d.x)},${Y(d.y)})`);
    pG.append("circle").attr("r", mob ? 2.6 : 3.2).attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1.2);
    pG.each(function(d){
      if(mob && !d.mob) return;
      const anc = d.x > .6 ? "end" : d.x < -.6 ? "start" : "middle";
      const dx = anc === "end" ? -6 : anc === "start" ? 6 : 0, dy = anc === "middle" ? -7 : 4;
      V.t(d3.select(this), dx, dy, mob ? d.short : d.n, {size: mob ? 11 : 12, weight: 600, anchor: anc, halo: 3}).attr("class", "plab");
    });

    function animField(to, instant){
      d3.select(container).interrupt("fld");
      if(instant || V.reduced){ Object.assign(fs, to); drawField(); return; }
      const m0 = fs.m, f0_ = fs.f;
      d3.select(container).transition("fld").duration(1100).ease(EIO).tween("f", () => t => {
        fs.m = m0 + (to.m - m0) * t; fs.f = f0_ + (to.f - f0_) * t; drawField();
      });
    }

    applyStep = function(st, instant){
      curStep = st;
      const dur = instant || V.reduced ? 0 : 450;
      const tEl = $("#esp-t"), sEl = $("#esp-s");
      if(TITLES[st]){ if(tEl) tEl.textContent = TITLES[st][0]; if(sEl) sEl.textContent = TITLES[st][1]; }
      animField(ST[st], instant);
      const split = st !== "volum", taste = st === "gustos" || st === "distincio";
      axH.transition().duration(dur).attr("stroke-opacity", split ? .45 : .15);
      lblCul.transition().duration(dur).style("opacity", split ? 1 : 0);
      lblEco.transition().duration(dur).style("opacity", split ? 1 : 0);
      pG.transition().duration(dur).style("opacity", taste ? .55 : 1);
      prG.transition().duration(dur).style("opacity", taste ? 1 : 0);
      prN.transition().delay((d, i) => taste && dur ? i * 25 : 0).duration(dur).attr("transform", d => `translate(${X(d.x)},${Y(d.y)}) scale(${taste ? 1 : .6})`);
      distG.transition().duration(dur).style("opacity", st === "distincio" ? 1 : 0);
      const on = st === "distincio";
      newP.interrupt().transition().delay(on && dur ? 350 : 0).duration(on && dur ? 1400 : 0).ease(EIO).attr("d", line(on ? NEW : OLD));
      newL.transition().delay(on && dur ? 1300 : 0).duration(dur).style("opacity", on ? 1 : 0);
      linkG.selectAll("*").remove();
    };

    const near = d => PROFS.map(p => ({p, d: Math.hypot(p.x - d.x, (p.y - d.y))})).sort((a, b) => a.d - b.d).slice(0, 3).map(o => o.p);
    const tp = V.tip(container);
    svg.style("cursor", "crosshair");
    const reset = () => { linkG.selectAll("*").remove(); V.focus(pG, () => true); pG.style("opacity", curStep === "gustos" || curStep === "distincio" ? .55 : 1); prN.style("opacity", 1); tp.hide(); };
    V.hover(svg.node(), (ev, [px, py]) => {
      const taste = curStep === "gustos" || curStep === "distincio";
      const vis = PRAC.filter(d => !mob || d.mob);
      const pr = taste ? d3.least(vis, d => Math.hypot(px - X(d.x), py - Y(d.y))) : null;
      const pf = d3.least(PROFS, d => Math.hypot(px - X(d.x), py - Y(d.y)));
      const dPr = pr ? Math.hypot(px - X(pr.x), py - Y(pr.y)) : 1e9, dPf = Math.hypot(px - X(pf.x), py - Y(pf.y));
      linkG.selectAll("*").remove();
      if(pr && dPr < 30 && dPr <= dPf + 6){
        const nb = near(pr);
        nb.forEach(p => linkG.append("path").attr("d", `M${X(pr.x)},${Y(pr.y)}Q${(X(pr.x) + X(p.x)) / 2},${Math.min(Y(pr.y), Y(p.y)) - 18} ${X(p.x)},${Y(p.y)}`)
          .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", .9).attr("stroke-opacity", .75));
        pG.interrupt().style("opacity", p => nb.includes(p) ? 1 : .4);
        prN.style("opacity", d => d === pr ? 1 : .5);
        tp.show(`<i>${pr.n}</i> · al mapa, al costat de: <b>${nb.map(p => p.n.toLowerCase()).join(", ")}</b>`);
        return;
      }
      if(dPf < 34){
        pG.interrupt().style("opacity", p => p === pf ? 1 : .45);
        const vol = pf.y > .35 ? "molt capital" : pf.y < -.35 ? "poc capital" : "capital intermedi";
        const pol = pf.x < -.15 ? "sobretot cultural" : pf.x > .15 ? "sobretot econòmic" : "repartit entre tots dos";
        tp.show(`<b>${pf.n}</b> · ${vol}, ${pol}`);
        return;
      }
      reset();
    }, reset);

    applyStep(curStep, true);
  });

  if(stepsEl && gEl && window.IB && IB.scrolly){
    IB.scrolly(stepsEl, gEl, (_, st) => {
      const k = (st && st.dataset && st.dataset.s) || "volum";
      curStep = k;
      if(applyStep) applyStep(k, false);
    });
  }
})();

/* =========================================================================
   V4 · CASE-09 (dades reals): flors de dades
   Una flor per grup; tres pètals, un per obra. Llargada del pètal amb arrel
   quadrada (l'àrea mana). L'arc discontinu és el 100 %.
   ========================================================================= */
(function(){
  const el = $("#musica-viz"); if(!el) return;
  const SERIES = [
    {k: "danubi", name: "El Danubi blau (Strauss)", short: "Danubi blau", c: C.red, ang: -58},
    {k: "rhapsody", name: "Rhapsody in Blue (Gershwin)", short: "Rhapsody in Blue", c: C.yellow, ang: 0},
    {k: "bach", name: "El clave ben temperat (Bach)", short: "Bach", c: C.blue, ang: 58}
  ];
  const lg = $("#musica-lg");
  if(lg) V.legendCat(lg, SERIES.map(s => ({c: s.c, t: s.name, a: s.c === C.yellow ? .75 : .6})));
  const EDGE = c => c === C.yellow ? "none" : c, FILL = (c, a) => V.alpha(c, (c === C.yellow ? .72 : .52) * (a == null ? 1 : a));
  function petal(L){ const w = L * .29; return `M0,0C${w.toFixed(2)},${(-L * .3).toFixed(2)} ${(w * .85).toFixed(2)},${(-L * .82).toFixed(2)} 0,${(-L).toFixed(2)}C${(-w * .85).toFixed(2)},${(-L * .82).toFixed(2)} ${(-w).toFixed(2)},${(-L * .3).toFixed(2)} 0,0Z`; }
  const DATA = D.musica.map(d => { const p = d.label.split(" · "); return Object.assign({}, d, {cls: p[0], tit: p[1]}); });
  let filter = "totes", updateFilter = null;

  V.mount(el, (container, w) => {
    const mob = w < 600, cols = mob ? 3 : 5, rowsN = Math.ceil(DATA.length / cols), cw = w / cols;
    const R = Math.min(cw * (mob ? .46 : .4), mob ? 62 : 104);
    const stem = mob ? 34 : 64, labH = mob ? 52 : 50;
    const rowH = R + 18 + stem + labH;
    const h = rowsN * rowH + 6;
    const svg = V.svg(container, w, h, "Cinc flors, una per grup de classe i titulació (La Distinction, 1979). Cada flor té tres pètals: El Danubi blau en vermell, Rhapsody in Blue en groc i El clave ben temperat de Bach en blau; com més llarg el pètal, més gent tria l'obra. El pètal vermell passa del 65 % al 3 % i el blau, de l'1 % al 21 %.");
    const g = svg.append("g");
    const L = d3.scaleSqrt([0, 100], [0, R]);
    const pos = DATA.map((d, i) => {
      const r = Math.floor(i / cols), inRow = Math.min(cols, DATA.length - r * cols), c = i % cols, x0 = (w - inRow * cw) / 2;
      return {x: x0 + (c + .5) * cw, y: r * rowH + R + 18};
    });
    // terra
    d3.range(rowsN).forEach(r => {
      const yb = r * rowH + R + 18 + stem;
      g.append("line").attr("x1", mob ? 0 : cw * .2).attr("x2", w - (mob ? 0 : cw * .2)).attr("y1", yb).attr("y2", yb).attr("stroke", C.hair).attr("stroke-width", 1);
    });
    const fl = g.selectAll("g.fl").data(DATA, d => d.id).join("g").attr("class", "fl")
      .attr("transform", (d, i) => `translate(${pos[i].x},${pos[i].y})`);
    fl.append("line").attr("y1", 0).attr("y2", stem).attr("stroke", C.ink2).attr("stroke-width", .9);
    fl.append("path").attr("d", d3.arc()({innerRadius: R, outerRadius: R, startAngle: -1.45, endAngle: 1.45}))
      .attr("fill", "none").attr("stroke", C.ghost).attr("stroke-width", .8).attr("stroke-dasharray", "1.5 3");
    const inner = fl.append("g").attr("class", "in");
    const pts = inner.selectAll("path.pt").data(d => SERIES.map(s => ({s, d, v: d[s.k]}))).join("path").attr("class", "pt")
      .attr("transform", p => `rotate(${p.s.ang})`).attr("d", p => petal(Math.max(.01, L(p.v))))
      .attr("fill", p => FILL(p.s.c)).attr("stroke", p => EDGE(p.s.c)).attr("stroke-width", .8).attr("stroke-linejoin", "round");
    inner.append("circle").attr("r", 2.2).attr("fill", C.ink);
    // valors a la punta
    const vals = inner.selectAll("text.pv").data(d => SERIES.map(s => ({s, d, v: d[s.k]}))).join("text").attr("class", "pv")
      .each(function(p){
        const a = p.s.ang * Math.PI / 180, rr = L(p.v) + 9, x = Math.sin(a) * rr, y = -Math.cos(a) * rr;
        d3.select(this).attr("x", x).attr("y", y + 4).attr("text-anchor", p.s.ang < -10 ? "end" : p.s.ang > 10 ? "start" : "middle");
      })
      .attr("font-family", V.SANS).attr("font-size", 11.5).attr("font-weight", 600).attr("fill", C.ink).style("font-variant-numeric", "tabular-nums")
      .text(p => f0(p.v) + " %").call(V.halo, 3).style("opacity", 0);
    // etiqueta del grup
    fl.each(function(d){
      const gr = d3.select(this);
      V.t(gr, 0, stem + 18, d.cls, {size: mob ? 11.5 : 12.5, weight: 700, anchor: "middle"});
      wrap(d.tit, cw - 10, mob ? 11 : 11.5).slice(0, 2).forEach((l, j) => V.t(gr, 0, stem + 33 + j * 13, l, {size: mob ? 11 : 11.5, anchor: "middle", fill: C.muted}));
    });
    // anotacions (escriptori)
    const noteG = g.append("g");
    if(!mob){
      const i = DATA.length - 1, p = pos[i], d = DATA[i];
      const ab = 58 * Math.PI / 180, lb = L(d.bach), ad = -58 * Math.PI / 180, ld = L(d.danubi);
      V.note(noteG, {x: p.x + Math.sin(ab) * lb * .8, y: p.y - Math.cos(ab) * lb * .8, tx: p.x + R * .9, ty: p.y - R * .95, kind: "curve", anchor: "start",
        lines: [["Bach, al 21 %", true], ["amb estudis superiors"]], size: 12});
      const p0 = pos[0];
      V.note(noteG, {x: p0.x + Math.sin(ad) * ld * .95, y: p0.y - Math.cos(ad) * ld * .95, tx: p0.x - R * .95, ty: p0.y - R * 1.02, kind: "curve", anchor: "end", bend: -18,
        lines: [["Strauss, al 65 %", true], ["sense títol escolar"]], size: 12});
    }

    function showVals(){
      vals.interrupt().style("opacity", p => {
        if(filter !== "totes") return p.s.k === filter ? 1 : 0;
        return 0;
      });
    }
    updateFilter = function(k){
      filter = k;
      const dur = V.reduced ? 0 : 260;
      pts.transition().duration(dur).attr("fill", p => FILL(p.s.c, k === "totes" || k === p.s.k ? 1 : .32))
        .attr("stroke-opacity", p => k === "totes" || k === p.s.k ? 1 : .3);
      noteG.transition().duration(dur).style("opacity", k === "totes" ? 1 : 0);
      showVals();
    };

    if(!container.__seen && !V.reduced){
      pts.attr("transform", p => `rotate(${p.s.ang - 60}) scale(0.01)`);
      fl.selectAll("line").attr("y1", stem);
      noteG.style("opacity", 0);
      V.onView(container, inst => {
        if(inst){ pts.attr("transform", p => `rotate(${p.s.ang})`); fl.selectAll("line").attr("y1", 0); noteG.style("opacity", filter === "totes" ? 1 : 0); return; }
        fl.selectAll("line").transition().delay((d, i) => i * 120).duration(600).ease(EIO).attr("y1", 0);
        pts.transition().delay(function(p){ return DATA.indexOf(p.d) * 120 + 450 + SERIES.indexOf(p.s) * 90; }).duration(1000).ease(d3.easeCubicOut)
          .attr("transform", p => `rotate(${p.s.ang}) scale(1)`);
        noteG.transition().delay(2000).duration(500).style("opacity", filter === "totes" ? 1 : 0);
      });
    }
    updateFilter(filter);

    const tp = V.tip(container);
    svg.style("cursor", "pointer");
    let curI = -1, curK = null;
    function off(){
      if(curI < 0) return;
      fl.filter((d, i) => i === curI).select("g.in").interrupt().transition().duration(160).attr("transform", "scale(1)");
      curI = -1; curK = null; V.focus(fl, null); showVals();
      pts.attr("stroke", p => EDGE(p.s.c)).attr("stroke-width", .8);
      tp.hide();
    }
    V.hover(svg.node(), (ev, [px, py]) => {
      const i = d3.leastIndex(pos, p => Math.hypot(px - p.x, (py - p.y) * .8)), p = pos[i];
      if(Math.abs(px - p.x) > cw / 2 || py < p.y - R - 16 || py > p.y + stem + labH){ off(); return; }
      let a = Math.atan2(px - p.x, -(py - p.y)) * 180 / Math.PI;
      const s = d3.least(SERIES, q => Math.abs(q.ang - a));
      const d = DATA[i];
      if(curI !== i){
        off(); curI = i;
        V.focus(fl, q => q === d);
        fl.filter(q => q === d).raise().select("g.in").interrupt().transition().duration(160).attr("transform", "scale(1.08)");
        vals.interrupt().style("opacity", q => q.d === d ? 1 : (filter !== "totes" && q.s.k === filter ? 1 : 0));
      }
      if(curK !== s.k){
        curK = s.k;
        pts.attr("stroke", q => q.d === d && q.s === s ? C.ink : EDGE(q.s.c)).attr("stroke-width", q => q.d === d && q.s === s ? 1.4 : .8);
      }
      tp.show(`<b>${d.cls}, ${d.tit}</b> · ${SERIES.map(q => `${q === s ? "<b>" : ""}${q.short} ${f1(d[q.k])} %${q === s ? "</b>" : ""}`).join(" · ")}`);
    }, off);
  });

  bindSeg("#f-musica", k => { if(updateFilter) updateFilter(k); });
})();

/* =========================================================================
   V5 · CASE-09 + PART-01 (dades reals): les set classes del Regne Unit
   Una flor per classe i set pètals, un per variable de la taula 6 de Savage et al.:
   tres d'econòmiques (vermell), dues de culturals (blau) i dues de socials (groc).
   La llargada és l'arrel del valor respecte a la classe més alta (cercle discontinu).
   Sota terra, un punt per cada 1 % de la població.
   ========================================================================= */
(function(){
  const el = $("#gbcs-viz"); if(!el) return;
  const VARS = [
    {k: "income", t: "Renda familiar", c: C.red, f: v => f0(v) + " £"},
    {k: "sav", t: "Estalvis", c: C.red, f: v => f0(v) + " £"},
    {k: "house", t: "Valor de l'habitatge", c: C.red, f: v => f0(v) + " £"},
    {k: "hb", t: "Cultura «alta»", c: C.blue, f: v => f1(v)},
    {k: "em", t: "Cultura emergent", c: C.blue, f: v => f1(v)},
    {k: "cs", t: "Prestigi dels contactes", c: C.yellow, f: v => f1(v)},
    {k: "cn", t: "Nombre de contactes", c: C.yellow, f: v => f1(v)}
  ];
  const NV = VARS.length, DATA = D.gbcs;
  const MAX = {}; VARS.forEach(v => MAX[v.k] = d3.max(DATA, d => d[v.k]));
  const EDGE = c => c === C.yellow ? "none" : c, FILL = (c, a) => V.alpha(c, (c === C.yellow ? .72 : .5) * (a == null ? 1 : a));
  function petal(L){ const w = L * .3; return `M0,0C${w.toFixed(2)},${(-L * .3).toFixed(2)} ${(w * .85).toFixed(2)},${(-L * .82).toFixed(2)} 0,${(-L).toFixed(2)}C${(-w * .85).toFixed(2)},${(-L * .82).toFixed(2)} ${(-w).toFixed(2)},${(-L * .3).toFixed(2)} 0,0Z`; }

  const lg = $("#gbcs-lg");
  if(lg){
    const d = d3.select(lg).append("div").attr("class", "ibv-lg");
    d.append("div").attr("class", "ibv-lg-t").text("Cada pètal, una variable (el cercle és la classe més alta)");
    const W = 250, H = 132, cx = 125, cy = 68, L = 36, s = d.append("svg").attr("width", W).attr("height", H).style("overflow", "visible");
    s.append("circle").attr("cx", cx).attr("cy", cy).attr("r", L).attr("fill", "none").attr("stroke", C.ghost).attr("stroke-dasharray", "1.5 3");
    VARS.forEach((v, j) => {
      const a = j * TAU / NV, ll = L * .85;
      s.append("path").attr("transform", `translate(${cx},${cy}) rotate(${j * 360 / NV})`).attr("d", petal(ll)).attr("fill", FILL(v.c)).attr("stroke", EDGE(v.c)).attr("stroke-width", .8);
      const rr = L + 6, x = cx + Math.sin(a) * rr, y = cy - Math.cos(a) * rr, sn = Math.sin(a);
      s.append("text").attr("x", x).attr("y", y + (Math.cos(a) > .5 ? -1 : Math.cos(a) < -.5 ? 9 : 4)).attr("text-anchor", sn > .2 ? "start" : sn < -.2 ? "end" : "middle")
        .attr("font-size", 11).attr("fill", C.ink2).text(v.t);
    });
    s.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 2).attr("fill", C.ink);
    V.legendCat(lg, [{c: C.red, t: "Econòmic", a: .6}, {c: C.blue, t: "Cultural", a: .6}, {c: C.yellow, t: "Social", a: .8}, {c: C.ink2, t: "1 punt = 1 % de la població"}]);
  }

  V.mount(el, (container, w) => {
    const mob = w < 600, cols = mob ? 2 : (w < 980 ? 4 : 7), rowsN = Math.ceil(DATA.length / cols), cw = w / cols;
    const R = Math.min(cw * .36, mob ? 62 : 64);
    const stem = mob ? 30 : 38, dotR = mob ? 3 : 3.4, dotG = dotR * 2 + 2, perRow = 5;
    const popH = Math.ceil(25 / perRow) * dotG;
    const labH = 44;
    const rowH = R * 2 + 14 + stem + 10 + popH + labH;
    const h = rowsN * rowH + 4;
    const svg = V.svg(container, w, h, "Set flors, una per classe social del Regne Unit (Savage et al., 2013). Cada flor té set pètals: renda, estalvis i valor de l'habitatge (econòmic), cultura «alta» i emergent (cultural), prestigi i nombre de contactes (social). L'elit té els pètals econòmics més llargs; la classe mitjana tècnica té molts estalvis però molt pocs contactes; els treballadors emergents de serveis tenen la cultura emergent més alta; el precariat té la flor més petita. Sota cada flor, un punt per cada 1 % de la població.");
    const g = svg.append("g");
    const L = d3.scaleSqrt([0, 1], [0, R]);
    const pos = DATA.map((d, i) => {
      const r = Math.floor(i / cols), inRow = Math.min(cols, DATA.length - r * cols), c = i % cols, x0 = (w - inRow * cw) / 2;
      return {x: x0 + (c + .5) * cw, y: r * rowH + R + 8};
    });
    d3.range(rowsN).forEach(r => {
      const yb = r * rowH + R * 2 + 8 + stem;
      g.append("line").attr("x1", mob ? 0 : cw * .15).attr("x2", w - (mob ? 0 : cw * .15)).attr("y1", yb).attr("y2", yb).attr("stroke", C.hair);
    });
    const fl = g.selectAll("g.fl").data(DATA, d => d.id).join("g").attr("class", "fl")
      .attr("transform", (d, i) => `translate(${pos[i].x},${pos[i].y})`);
    fl.append("line").attr("class", "stm").attr("y1", 0).attr("y2", R + stem).attr("stroke", C.ink2).attr("stroke-width", .9);
    fl.append("circle").attr("r", R).attr("fill", "none").attr("stroke", C.ghost).attr("stroke-width", .8).attr("stroke-dasharray", "1.5 3");
    const inner = fl.append("g").attr("class", "in");
    const pts = inner.selectAll("path.pt").data(d => VARS.map((v, j) => ({v, j, d, p: d[v.k] / MAX[v.k]}))).join("path").attr("class", "pt")
      .attr("transform", q => `rotate(${q.j * 360 / NV})`).attr("d", q => petal(Math.max(.5, L(q.p))))
      .attr("fill", q => FILL(q.v.c)).attr("stroke", q => EDGE(q.v.c)).attr("stroke-width", .8).attr("stroke-linejoin", "round");
    inner.append("circle").attr("r", 2.2).attr("fill", C.ink);
    // població: un punt per 1 %
    fl.each(function(d){
      const gr = d3.select(this), y0 = R + stem + 10;
      d3.range(d.pop).forEach(k => {
        const cx = ((k % perRow) - (perRow - 1) / 2) * dotG, cy = y0 + Math.floor(k / perRow) * dotG + dotR;
        gr.append("circle").attr("class", "pp").attr("cx", cx).attr("cy", cy).attr("r", dotR).attr("fill", C.ink2).attr("fill-opacity", .75);
      });
      const yl = y0 + popH + 16;
      V.t(gr, 0, yl, d.short, {size: mob ? 12 : 12.5, weight: 700, anchor: "middle"});
      V.t(gr, 0, yl + 15, `${d.pop} % · ${f0(d.income)} £`, {size: 11.5, anchor: "middle", fill: C.muted});
    });

    if(!container.__seen && !V.reduced){
      pts.attr("transform", q => `rotate(${q.j * 360 / NV - 50}) scale(0.01)`);
      fl.selectAll("circle.pp").style("opacity", 0);
      V.onView(container, inst => {
        if(inst){ pts.attr("transform", q => `rotate(${q.j * 360 / NV})`); fl.selectAll("circle.pp").style("opacity", 1); return; }
        pts.transition().delay(q => DATA.indexOf(q.d) * 110 + q.j * 60).duration(950).ease(d3.easeCubicOut).attr("transform", q => `rotate(${q.j * 360 / NV}) scale(1)`);
        fl.each(function(d, i){ d3.select(this).selectAll("circle.pp").transition().delay((q, k) => 900 + i * 110 + k * 18).duration(250).style("opacity", 1); });
      });
    }

    const tp = V.tip(container);
    svg.style("cursor", "pointer");
    const vg = g.append("g").style("pointer-events", "none");
    let cur = null, curJ = -1;
    function off(){ if(!cur) return; cur = null; curJ = -1; vg.selectAll("*").remove(); V.focus(fl, null); pts.attr("stroke", q => EDGE(q.v.c)).attr("stroke-width", .8); tp.hide(); }
    V.hover(svg.node(), (ev, [px, py]) => {
      const i = d3.leastIndex(pos, p => Math.hypot(px - p.x, (py - p.y) * .7)), p = pos[i], d = DATA[i];
      if(Math.abs(px - p.x) > cw / 2 || py < p.y - R - 10 || py > p.y + rowH - R - 8){ off(); return; }
      let a = Math.atan2(px - p.x, -(py - p.y)); if(a < 0) a += TAU;
      const j = Math.round(a / (TAU / NV)) % NV;
      if(cur === d && curJ === j) return;
      cur = d; curJ = j;
      V.focus(fl, q => q === d);
      pts.attr("stroke", q => q.d === d && q.j === j ? C.ink : EDGE(q.v.c)).attr("stroke-width", q => q.d === d && q.j === j ? 1.5 : .8);
      vg.selectAll("*").remove();
      const v = VARS[j], val = d[v.k], ang = j * TAU / NV, ll = L(val / MAX[v.k]) + 8;
      const tx = p.x + Math.sin(ang) * ll, ty = p.y - Math.cos(ang) * ll, sn = Math.sin(ang);
      V.t(vg, tx, ty + (Math.cos(ang) < -.5 ? 10 : 4), v.f(val), {size: 12.5, weight: 700, anchor: sn > .2 ? "start" : sn < -.2 ? "end" : "middle", halo: 3});
      const rank = 1 + DATA.filter(q => q[v.k] > val).length;
      tp.show(`<b>${d.label}</b> · ${v.t}: <b>${v.f(val)}</b> (posició ${rank} de 7) · ${d.tag}`);
    }, off);
  });
})();

})();
