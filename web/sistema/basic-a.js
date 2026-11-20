/* Mostrari del sistema infogràfic · peces bàsiques A
   TIME-01 Annotated series · Sèrie temporal anotada
   SPREAD-01 Uncertainty intervals · Intervals d'incertesa
   CASE-01 Ranked bars · Barres ordenades
   CASE-02 Dumbbells · Halteres
   Cada bloc és una peça completa que es pot copiar a un article. Fa servir assets/ib-viz.js (IBV)
   i les dades reals de sistema/dades.js (CO₂ de Mauna Loa i ONI de la NOAA). */
(function(){
"use strict";
const V = IBV, C = V.C, D = window.IBDATA || {};
const $ = s => document.querySelector(s);
const f1 = V.fmt(",.1f"), f0 = V.fmt(",.0f");
const MES = ["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const MESC = ["gen","feb","març","abr","maig","juny","jul","ag","set","oct","nov","des"];

// Entrada comuna: les línies es dibuixen, les formes i el text apareixen. Només la primera vegada que es veu.
function enter(el, svg){
  if(el.__seen || V.reduced) return;
  const lines = svg.selectAll("path.ln"), rest = svg.selectAll(".fx"), txt = svg.selectAll("text,.ibv-note");
  lines.each(function(){ const l = Math.ceil(this.getTotalLength()) + 1; d3.select(this).attr("stroke-dasharray", `${l} ${l}`).attr("stroke-dashoffset", l); });
  rest.style("opacity", 0); txt.style("opacity", 0);
  V.onView(el, inst => {
    const done = function(){ d3.select(this).attr("stroke-dasharray", null).attr("stroke-dashoffset", null); };
    if(inst){ lines.each(done); rest.style("opacity", 1); txt.style("opacity", 1); return; }
    lines.transition().duration(1600).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0).on("end", done).on("interrupt", done);
    rest.transition().delay((d,i) => 150 + i*45).duration(700).style("opacity", 1);
    txt.transition().delay(900).duration(600).style("opacity", 1);
  });
}
function piece(key, draw){ const el = $(`[data-p="${key}"]`); if(el) V.mount(el, (e, w) => draw(e, w)); }
function seg(key, cb){
  const r = $(`[data-seg="${key}"]`); if(!r) return;
  r.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    r.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); cb(b.dataset.k);
  }));
}
// ratllat fi de gravat dins d'un camí (clip)
function hatchIn(g, id, d, box, o){
  o = o || {};
  g.append("clipPath").attr("id", id).append("path").attr("d", d);
  const p = d3.path(), st = o.step || 3.2, [x0,y0,x1,y1] = box, hgt = y1 - y0;
  for(let x = x0 - hgt; x < x1 + st; x += st){ p.moveTo(x, y1); p.lineTo(x + hgt*(o.slope||.55), y0); }
  return g.append("path").attr("d", p.toString()).attr("clip-path", `url(#${id})`).attr("fill", "none")
    .attr("stroke", o.color || C.ink).attr("stroke-opacity", o.alpha == null ? .35 : o.alpha).attr("stroke-width", o.w || .5);
}

/* =========================================================================
   TIME-01 · Annotated series (Sèrie temporal anotada)
   Una línia principal gruixuda, el soroll fi a sota, una franja que diu el marge de variació,
   episodis ombrejats i anotacions en colze calculades a partir de les mateixes dades.
   ========================================================================= */
(function(){
  if(!D.co2) return;
  const M = [];                                           // mesos amb valor
  Object.keys(D.co2).forEach(y => D.co2[y].forEach((v, m) => { if(v != null) M.push({t: +y + (m + .5)/12, y: +y, m, v}); }));
  const Y = d3.groups(M, d => d.y).filter(([, a]) => a.length === 12).map(([y, a]) => ({y, t: y + .5, mean: d3.mean(a, d => d.v), lo: d3.min(a, d => d.v), hi: d3.max(a, d => d.v)}));
  const first = (th, arr, k) => arr.find(d => d[k] >= th);
  const y350 = first(350, Y, "mean"), m400 = first(400, M, "v"), y400 = first(400, Y, "mean");
  // la dècada que va créixer més de pressa (ppm/any)
  const dec = d3.range(1960, 2020, 10).map(d0 => { const a = Y.find(q => q.y === d0), b = Y.find(q => q.y === d0 + 9); return a && b ? {d0, r: (b.mean - a.mean)/9} : null; }).filter(Boolean);
  const fast = d3.greatest(dec, d => d.r), slow = d3.least(dec, d => d.r);
  const last = M[M.length - 1];
  piece("time-01", (el, w) => {
    const mob = w < 560, H = mob ? 340 : 440, m = {t:22, r: mob ? 46 : 92, b:30, l: mob ? 34 : 44};
    const svg = V.svg(el, w, H, "Concentració de CO₂ a Mauna Loa de 1958 a 2026: la mitjana anual puja de 316 a més de 425 ppm, amb l'oscil·lació estacional a sota.");
    const x = d3.scaleLinear().domain([1958, 2026.9]).range([m.l, w - m.r]);
    const y = d3.scaleLinear().domain([310, 440]).range([H - m.b, m.t]);
    const g = svg.append("g");
    // quadrícula horitzontal finíssima
    y.ticks(mob ? 4 : 6).forEach(v => { g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y(v)).attr("y2", y(v)).attr("stroke", C.grid).attr("stroke-width", .6);
      V.t(g, m.l - 6, y(v) + 4, f0(v), {size:V.FS.small, anchor:"end", fill:C.muted}); });
    V.t(g, m.l - 6, m.t - 8, "ppm", {size:V.FS.small, anchor:"end", fill:C.muted});
    d3.range(1960, 2027, mob ? 20 : 10).forEach(v => { g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", H - m.b).attr("y2", H - m.b + 4).attr("stroke", C.ink2).attr("stroke-width", .6);
      V.t(g, x(v), H - m.b + 17, v, {size:V.FS.small, anchor:"middle", fill:C.muted}); });
    g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", H - m.b).attr("y2", H - m.b).attr("stroke", C.ink2).attr("stroke-width", .6);
    // episodis: la dècada que més va créixer i la que menys (franges verticals molt clares)
    [[fast, C.redLight, "creixement més ràpid"], [slow, C.blueLight, "creixement més lent"]].forEach(([d, col]) => {
      g.append("rect").attr("class", "fx ep").attr("x", x(d.d0)).attr("width", x(d.d0 + 10) - x(d.d0)).attr("y", m.t).attr("height", H - m.b - m.t)
        .attr("fill", col).attr("fill-opacity", .22).style("mix-blend-mode", "multiply"); });
    // franja estacional: mínim i màxim de cada any, amb ratllat de gravat
    const band = d3.area().x(d => x(d.t)).y0(d => y(d.lo)).y1(d => y(d.hi)).curve(d3.curveMonotoneX);
    g.append("path").attr("class", "fx").attr("d", band(Y)).attr("fill", C.red).attr("fill-opacity", .12).style("mix-blend-mode", "multiply");
    // dents de serra mensuals: fil gris
    const lm = d3.line().x(d => x(d.t)).y(d => y(d.v)).curve(d3.curveMonotoneX);
    g.append("path").attr("class", "ln").attr("d", lm(M)).attr("fill", "none").attr("stroke", C.ink2).attr("stroke-width", .6).attr("stroke-opacity", .7);
    // mitjana anual: la línia protagonista
    const la = d3.line().x(d => x(d.t)).y(d => y(d.mean)).curve(d3.curveMonotoneX);
    g.append("path").attr("class", "ln").attr("d", la(Y)).attr("fill", "none").attr("stroke", C.red).attr("stroke-width", 2.4).attr("stroke-linecap", "round");
    // final de la sèrie
    const lx = x(last.t), ly = y(last.v);
    g.append("circle").attr("class", "fx").attr("cx", lx).attr("cy", ly).attr("r", 3.4).attr("fill", C.red).attr("stroke", "#fff").attr("stroke-width", 1.2);
    V.lines(g, lx + 7, ly + 1, [[`${f1(last.v)} ppm`, true], [`${MESC[last.m]} ${last.y}`]], {anchor:"start", halo:true, size:V.FS.small});
    // anotacions en colze, totes calculades a partir de les dades
    const notes = [
      {d: Y[0], k:"mean", lines: [[`${Y[0].y}: ${f1(Y[0].mean)} ppm`, true], ["primer any sencer de mesures"]], dx: 14, dy: -54},
      {d: y350, k:"mean", lines: [[`${y350.y}: supera els 350`, true], ["de mitjana anual"]], dx: -10, dy: -62, anchor:"end"},
      {d: m400, k:"v", lines: [[`${MESC[m400.m]} ${m400.y}: primer mes`, true], ["per sobre de 400 ppm"]], dx: -12, dy: mob ? 46 : -58, anchor:"end"}
    ];
    if(mob) notes.splice(1, 1);
    notes.forEach(n => { const px = x(n.d.t), py = y(n.d[n.k]);
      V.note(g, {x: px, y: py, tx: px + n.dx, ty: py + n.dy, kind:"elbow", anchor: n.anchor || "start", dot: true, lines: n.lines, size: V.FS.small}); });
    // rètols dels episodis
    [[fast, C.redDark], [slow, C.blueDark]].forEach(([d, col], i) => {
      const cx = x(d.d0 + 5);
      V.lines(g, cx, m.t + 14, [[`${d.d0}–${d.d0 + 9}`, true], [`${V.signed(d.r, 1)} ppm/any`]], {anchor:"middle", halo:true, size:V.FS.small, fill: col}); });
    // lectura: línia vertical que segueix el cursor
    const tp = V.tip(el), rule = g.append("line").attr("y1", m.t).attr("y2", H - m.b).attr("stroke", C.ink).attr("stroke-width", .6).style("opacity", 0);
    const dot = g.append("circle").attr("r", 3).attr("fill", "#fff").attr("stroke", C.ink).attr("stroke-width", 1).style("opacity", 0);
    const ov = g.append("rect").attr("x", m.l).attr("y", m.t).attr("width", w - m.l - m.r).attr("height", H - m.t - m.b).attr("fill", "transparent");
    V.hover(ov.node(), (ev, [px]) => {
      const t = x.invert(px + m.l), d = d3.least(M, q => Math.abs(q.t - t)), a = Y.find(q => q.y === d.y);
      rule.attr("x1", x(d.t)).attr("x2", x(d.t)).style("opacity", 1); dot.attr("cx", x(d.t)).attr("cy", y(d.v)).style("opacity", 1);
      V.focus(g.selectAll("rect.ep"), () => true);
      tp.show(`<b>${MES[d.m]} de ${d.y}</b> · ${f1(d.v)} ppm${a ? ` · mitjana de l'any ${f1(a.mean)} (oscil·lació de ${f1(a.hi - a.lo)})` : ""}`);
    }, () => { rule.style("opacity", 0); dot.style("opacity", 0); tp.hide(); });
    enter(el, svg);
  });
})();

/* =========================================================================
   SPREAD-01 · Uncertainty intervals (Intervals d'incertesa)
   Cada interval és una llentia: gruixuda al centre, que s'afua cap als extrems, amb ratllat de gravat.
   El punt és l'estimació central. Diu «probablement aquí, segur dins d'aquí» sense fingir precisió.
   ========================================================================= */
(function(){
  // Darvill, Marshall, Parker Pearson i Wainwright (2012), «Stonehenge remodelled», Antiquity 86: intervals al 95 %
  const F = [
    {n:1, t:"El fossat i el cementiri", a:[-3100,-2920], b:[-2965,-2755], c:[-3010,-2860]},
    {n:2, t:"Els sarsens i els trílits", a:[-2760,-2510], b:[-2470,-2300], c:[-2635,-2385]},
    {n:3, t:"L'Avinguda", a:[-2405,-2225], b:[-2300,-2100], c:[-2315,-2200]},
    {n:4, t:"Les pedres blaves es tornen a plantar", a:[-2210,-2030], b:[-2160,-1925], c:[-2120,-2040]},
    {n:5, t:"Els forats Y i Z", a:[-2020,-1745], b:[-1620,-1450], c:[-1880,-1535]}
  ];
  const yr = v => `${f0(-v)} aC`;
  piece("spread-01", (el, w) => {
    const mob = w < 560, row = mob ? 66 : 64, m = {t:34, r:16, b:34, l: mob ? 12 : 214};
    const H = m.t + F.length*row + m.b;
    const svg = V.svg(el, w, H, "Intervals de datació al 95 % de les cinc fases de Stonehenge, del 3100 al 1450 aC.");
    const x = d3.scaleLinear().domain([-3150, -1400]).range([m.l, w - m.r]);
    const g = svg.append("g");
    d3.range(-3000, -1399, mob ? 500 : 250).forEach(v => { g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", m.t - 10).attr("y2", H - m.b).attr("stroke", C.grid).attr("stroke-width", .6);
      V.t(g, x(v), H - m.b + 16, yr(v), {size:V.FS.small, anchor:"middle", fill:C.muted}); });
    const lens = (x0, x1, cy, hh) => { const a = x(x0), b = x(x1), mx = (a + b)/2;
      return `M${a},${cy}Q${mx},${cy - hh*2} ${b},${cy}Q${mx},${cy + hh*2} ${a},${cy}Z`; };
    const rows = g.selectAll("g.r").data(F).join("g").attr("class", "r").attr("transform", (d,i) => `translate(0,${m.t + i*row + (mob ? 34 : row/2)})`);
    rows.each(function(d, i){
      const r = d3.select(this), hh = mob ? 9 : 11;
      if(mob) V.t(r, m.l, -20, `Fase ${d.n} · ${d.t}`, {size:V.FS.small, weight:600});
      else { V.t(r, m.l - 14, -2, `Fase ${d.n}`, {size:V.FS.label, weight:700, anchor:"end"}); V.t(r, m.l - 14, 13, d.t, {size:V.FS.small, anchor:"end", fill:C.ink2}); }
      // la durada probable: fil fi entre les dues estimacions centrals
      r.append("path").attr("class", "ln").attr("d", `M${x(d.c[0])},0L${x(d.c[1])},0`).attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1);
      [[d.a, C.red, "ini"], [d.b, C.blue, "fi"]].forEach(([iv, col, k]) => {
        const p = lens(iv[0], iv[1], 0, hh);
        r.append("path").attr("class", "fx").attr("d", p).attr("fill", col).attr("fill-opacity", .16).style("mix-blend-mode", "multiply");
        hatchIn(r, `s01-${i}-${k}-${Math.round(w)}`, p, [x(iv[0]), -hh, x(iv[1]), hh], {color: col, alpha:.5, step: 3}).attr("class", "fx");
        r.append("path").attr("class", "ln").attr("d", p).attr("fill", "none").attr("stroke", col).attr("stroke-width", .8);
      });
      d.c.forEach((v, j) => r.append("circle").attr("class", "fx").attr("cx", x(v)).attr("cy", 0).attr("r", 3.2).attr("fill", "#fff").attr("stroke", j ? C.blue : C.red).attr("stroke-width", 1.4));
    });
    // anotacions a la primera fase
    const y0 = m.t + (mob ? 34 : row/2);
    V.note(g, {x: x(-3010), y: y0 - 6, tx: x(-3010) + (mob ? 26 : 40), ty: m.t - (mob ? 22 : 18), kind:"elbow", anchor:"start", lines: [["Comença: 95 % de probabilitat dins la llentia vermella", true]], size: V.FS.small});
    if(!mob) V.note(g, {x: x(-2860), y: y0 + 8, tx: x(-2860) + 40, ty: y0 + 28, kind:"elbow", anchor:"start", lines: [["Acaba (blau); el punt, l'estimació central", false]], size: V.FS.small});
    const tp = V.tip(el);
    const ov = g.append("rect").attr("x", 0).attr("y", m.t - 10).attr("width", w).attr("height", F.length*row).attr("fill", "transparent");
    V.hover(ov.node(), (ev, [, py]) => {
      const i = Math.max(0, Math.min(F.length - 1, Math.floor((py - m.t + 10)/row))), d = F[i];
      V.focus(rows, q => q === d);
      tp.show(`<b>Fase ${d.n} · ${d.t}</b> · comença entre el ${f0(-d.a[0])} i el ${yr(d.a[1])}, acaba entre el ${f0(-d.b[0])} i el ${yr(d.b[1])}`);
    }, () => { V.focus(rows, null); tp.hide(); });
    enter(el, svg);
  });
})();

/* =========================================================================
   CASE-01 · Ranked bars (Barres ordenades)
   Tija fina i punt al final, el nom a l'esquerra i el valor a la dreta; la mitjana com a fil discontinu.
   Un sol cas destacat en vermell. Es pot reordenar per valor o per ordre cronològic.
   ========================================================================= */
(function(){
  if(!D.oni) return;
  // episodis d'El Niño segons la NOAA: ONI ≥ 0,5 durant almenys cinc trimestres seguits; el valor és el pic de cada episodi
  const S = []; Object.keys(D.oni).sort().forEach(y => D.oni[y].forEach((v, m) => { if(v != null) S.push({y: +y, m, v}); }));
  const E = []; let run = [];
  const close = () => { if(run.length >= 5){ const pk = d3.greatest(run, d => d.v), a = run[0], b = run[run.length - 1];
    E.push({a: a.y, b: b.y, pk: pk.v, py: pk.y, pm: pk.m, n: run.length, open: b === S[S.length - 1]}); } run = []; };
  S.forEach(d => { if(d.v >= .5) run.push(d); else close(); }); close();
  E.forEach(e => e.lab = e.open ? `${e.a} (en curs)` : e.a === e.b ? `${e.a}` : `${e.a}–${String(e.b).slice(2)}`);
  const hero = E.find(e => e.open) || d3.greatest(E, e => e.pk), avg = d3.mean(E, e => e.pk);
  let order = "valor", redraw = null;
  piece("case-01", (el, w) => {
    const mob = w < 560, rh = mob ? 17 : 19, m = {t:30, r: mob ? 40 : 60, b:26, l: mob ? 86 : 110};
    const H = m.t + E.length*rh + m.b;
    const svg = V.svg(el, w, H, `Pic de cadascun dels ${E.length} episodis d'El Niño des del 1950, ordenats.`);
    const x = d3.scaleLinear().domain([0, Math.ceil(d3.max(E, e => e.pk)*2)/2]).range([m.l, w - m.r]);
    const g = svg.append("g");
    // llindars de la NOAA com a franges molt clares: moderat, fort, molt fort
    [[1, 1.5, "moderat"], [1.5, 2, "fort"], [2, x.domain()[1], "molt fort"]].forEach(([a, b, t], i) => {
      g.append("rect").attr("x", x(a)).attr("width", x(b) - x(a)).attr("y", m.t - 6).attr("height", E.length*rh + 6).attr("fill", C.red).attr("fill-opacity", .035 + i*.03).style("mix-blend-mode", "multiply");
      if(!mob || i) V.t(g, (x(a) + x(b))/2, m.t - 12, t, {size:V.FS.small, anchor:"middle", fill:C.muted}); });
    x.ticks(mob ? 3 : 5).forEach(v => V.t(g, x(v), H - m.b + 16, V.fmt(",.1f")(v), {size:V.FS.small, anchor:"middle", fill:C.muted}));
    V.t(g, w - m.r + 16, H - m.b + 16, "°C", {size:V.FS.small, anchor:"start", fill:C.muted});
    // mitjana
    g.append("line").attr("x1", x(avg)).attr("x2", x(avg)).attr("y1", m.t - 6).attr("y2", m.t + E.length*rh).attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-dasharray", "2 3");
    V.t(g, x(avg) + 4, m.t + E.length*rh - 4, `mitjana ${V.fmt(",.2f")(avg)}`, {size:V.FS.small, fill:C.ink2, halo:true});
    const yOf = e => { const arr = order === "valor" ? E.slice().sort((p, q) => q.pk - p.pk) : E; return m.t + arr.indexOf(e)*rh + rh/2; };
    const rows = g.selectAll("g.r").data(E).join("g").attr("class", "r").attr("transform", e => `translate(0,${yOf(e)})`);
    rows.each(function(e){
      const r = d3.select(this), on = e === hero, col = on ? C.red : e.pk >= 2 ? C.ink : C.ink2;
      V.t(r, m.l - 10, 4, e.lab, {size:V.FS.small, anchor:"end", weight: on ? 700 : 400, fill: on ? C.red : C.ink});
      r.append("path").attr("class", "ln").attr("d", `M${x(0)},0L${x(e.pk)},0`).attr("fill", "none").attr("stroke", col).attr("stroke-width", on ? 2.2 : .9);
      r.append("circle").attr("class", "fx").attr("cx", x(e.pk)).attr("cy", 0).attr("r", on ? 4.6 : 3).attr("fill", on ? C.red : "#fff").attr("stroke", col).attr("stroke-width", 1.2);
      V.t(r, x(e.pk) + 8, 4, V.fmt(",.1f")(e.pk), {size:V.FS.small, fill: on ? C.red : C.ink2, weight: on ? 700 : 400});
    });
    const hy = yOf(hero);
    if(!mob) V.note(g, {x: x(hero.pk) + 30, y: hy, tx: x(hero.pk) + 30 + 14, ty: hy + 2, kind:"straight", anchor:"start", lines: [[hero.open ? "l'episodi d'ara, encara pujant" : "el més fort", false]], size: V.FS.small, fill: C.redDark});
    const tp = V.tip(el);
    V.hover(svg.node(), (ev, [, py]) => {
      const e = d3.least(E, q => Math.abs(yOf(q) - py)); if(!e) return;
      V.focus(rows, q => q === e);
      tp.show(`<b>El Niño ${e.lab}</b> · pic de ${V.fmt(",.2f")(e.pk)} °C (${MESC[e.pm]} ${e.py}) · ${e.n} trimestres seguits per sobre de 0,5`);
    }, () => { V.focus(rows, null); tp.hide(); });
    redraw = () => rows.transition().duration(V.reduced ? 0 : 900).ease(d3.easeCubicInOut).delay((e, i) => V.reduced ? 0 : i*14).attr("transform", e => `translate(0,${yOf(e)})`);
    enter(el, svg);
  });
  seg("case-01", k => { order = k; if(redraw) redraw(); });
})();

/* =========================================================================
   CASE-02 · Dumbbells (Halteres)
   Dos valors per cas units per una barra: blau per al mínim, vermell per al màxim. La distància és la història.
   Tres vistes que s'animen: posició real, només l'oscil·lació, i ordenades per oscil·lació.
   ========================================================================= */
(function(){
  if(!D.co2) return;
  const R = d3.range(1960, 2026, 5).map(y => { const a = D.co2[y]; if(!a || a.some(v => v == null)) return null;
    const lo = d3.min(a), hi = d3.max(a); return {y, lo, hi, mlo: a.indexOf(lo), mhi: a.indexOf(hi), amp: hi - lo}; }).filter(Boolean);
  let mode = "real", redraw = null;
  piece("case-02", (el, w) => {
    const mob = w < 560, rh = mob ? 24 : 28, m = {t:36, r: mob ? 18 : 120, b:30, l: mob ? 44 : 64};
    const H = m.t + R.length*rh + m.b;
    const svg = V.svg(el, w, H, "Mínim i màxim mensual de CO₂ a Mauna Loa cada cinc anys des del 1960.");
    const g = svg.append("g"), ax = g.append("g");
    const xr = d3.scaleLinear().domain([310, 432]).range([m.l, w - m.r]);
    const xa = d3.scaleLinear().domain([0, Math.ceil(d3.max(R, d => d.amp)) + .5]).range([m.l, w - m.r]);
    const sorted = () => mode === "ordre" ? R.slice().sort((a, b) => b.amp - a.amp) : R;
    const yOf = d => m.t + sorted().indexOf(d)*rh + rh/2;
    const X = () => mode === "real" ? [d => xr(d.lo), d => xr(d.hi)] : [() => xa(0), d => xa(d.amp)];
    function axis(){
      ax.selectAll("*").remove();
      const s = mode === "real" ? xr : xa, tk = s.ticks(mob ? 4 : 6);
      tk.forEach(v => { ax.append("line").attr("x1", s(v)).attr("x2", s(v)).attr("y1", m.t - 8).attr("y2", H - m.b).attr("stroke", C.grid).attr("stroke-width", .6);
        V.t(ax, s(v), H - m.b + 16, mode === "real" ? f0(v) : `${f0(v)}`, {size:V.FS.small, anchor:"middle", fill:C.muted}); });
      V.t(ax, w - m.r, H - m.b + 16, "ppm", {size:V.FS.small, anchor:"start", fill:C.muted});
      V.t(ax, m.l, m.t - 18, mode === "real" ? "Mínim i màxim de l'any, en ppm" : "Oscil·lació de l'any (màxim − mínim)", {size:V.FS.small, fill:C.ink2});
    }
    axis();
    const rows = g.selectAll("g.r").data(R).join("g").attr("class", "r").attr("transform", d => `translate(0,${yOf(d)})`);
    rows.each(function(d){
      const r = d3.select(this), [a, b] = X();
      V.t(r, m.l - 12, 4, d.y, {size:V.FS.small, anchor:"end", fill:C.ink});
      r.append("line").attr("class", "bar fx").attr("x1", a(d)).attr("x2", b(d)).attr("stroke", C.ink).attr("stroke-width", 2.6).attr("stroke-opacity", .16).attr("stroke-linecap", "round");
      r.append("line").attr("class", "thin fx").attr("x1", a(d)).attr("x2", b(d)).attr("stroke", C.ink).attr("stroke-width", .8);
      r.append("circle").attr("class", "lo fx").attr("cx", a(d)).attr("r", 4.4).attr("fill", C.blue).attr("fill-opacity", .9).attr("stroke", "#fff").attr("stroke-width", 1);
      r.append("circle").attr("class", "hi fx").attr("cx", b(d)).attr("r", 4.4).attr("fill", C.red).attr("fill-opacity", .9).attr("stroke", "#fff").attr("stroke-width", 1);
      r.append("text").attr("class", "amp").attr("x", b(d) + 9).attr("y", 4).attr("font-size", V.FS.small).attr("fill", C.ink2).attr("font-family", V.SANS).text(`${f1(d.amp)}`);
    });
    const lg = g.append("g").attr("transform", `translate(${mob ? m.l : w - m.r + 22},${mob ? H - 6 : m.t + 6})`);
    [[C.blue, "el mes més baix (tardor)"], [C.red, "el més alt (primavera)"]].forEach(([c, t], i) => {
      const gg = lg.append("g").attr("transform", mob ? `translate(${i*150},0)` : `translate(0,${i*18})`);
      gg.append("circle").attr("r", 4).attr("cx", 4).attr("cy", -4).attr("fill", c); V.t(gg, 13, 0, t, {size:V.FS.small, fill:C.ink2}); });
    if(mob) svg.attr("height", H + 14).attr("viewBox", `0 0 ${w} ${H + 14}`);
    redraw = () => {
      axis(); const [a, b] = X(), T = V.reduced ? 0 : 1000;
      rows.transition().duration(T).ease(d3.easeCubicInOut).attr("transform", d => `translate(0,${yOf(d)})`);
      rows.selectAll("line").transition().duration(T).ease(d3.easeCubicInOut).attr("x1", a).attr("x2", b);
      rows.select("circle.lo").transition().duration(T).ease(d3.easeCubicInOut).attr("cx", a);
      rows.select("circle.hi").transition().duration(T).ease(d3.easeCubicInOut).attr("cx", b);
      rows.select("text.amp").transition().duration(T).ease(d3.easeCubicInOut).attr("x", d => b(d) + 9);
    };
    const tp = V.tip(el);
    V.hover(svg.node(), (ev, [, py]) => {
      const d = d3.least(R, q => Math.abs(yOf(q) - py)); if(!d) return;
      V.focus(rows, q => q === d);
      tp.show(`<b>${d.y}</b> · mínim ${f1(d.lo)} ppm (${MES[d.mlo]}), màxim ${f1(d.hi)} ppm (${MES[d.mhi]}) · oscil·lació de ${f1(d.amp)}`);
    }, () => { V.focus(rows, null); tp.hide(); });
    enter(el, svg);
  });
  seg("case-02", k => { mode = k; if(redraw) redraw(); });
})();
})();
