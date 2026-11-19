/* On va el CO₂ que emetem — visualitzacions editorials d'aquarel·la i gravat científic (IBV).
   1. #scA      IB-40 Riu d'aquarel·la de carboni amb ~1.200 micro-traços lents (transposat a vertical en mòbil)
   2. #scB      IB-16 + IB-28/IB-40 Tall científic oceà–bosc amb ~900 micro-traços i capçades d'aquarel·la
   3. #keelFig  IB-01 Sèrie i zoom enllaçat + IB-05 Espiral respiratòria polar (doble vista .seg)
   4. #yearFig  IB-38 Cercles translúcids anuals (multiply) + IB-02 Pulsacions ONI
   5. #histFig  IB-47 Corrent apilat bidireccional d'aquarel·la (morph Anual ↔ Acumulat)
   6. #persFig  IB-49 Horitzó logarítmic de temps profund (hover + lliscant sincronitzats)
   Dades: dades.js (Global Carbon Budget 2026, NOAA GML, NOAA CPC). */
(function(){
"use strict";

const V = window.IBV;
const C = V.C;
const D = window.CO2DATA;
const CC = 3.664;
const RM = V.reduced;

const f0 = V.fmt(",.0f");
const f1 = V.fmt(",.1f");
const f2 = V.fmt(",.2f");
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (x, e0, e1) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const pct = v => Math.round(v * 100) + " %";
const safe = (f, ...a) => { try { return f(...a); } catch (e) { console.error(e); } };
const bez = (a, b, c, d, t) => { const u = 1 - t; return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d; };

const MONTHS = ["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const MSH = V.MES;

// Paleta semàntica única a tot l'article (estrictament vermell / blau / groc + grisos; mai text en groc)
const PAL = {
  fossil: C.ink2,
  fossilDark: C.ink,
  landUse: C.vermellClar,
  landUseEdge: C.vermellFosc,
  air: C.vermell,
  ocean: C.blau,
  land: C.groc,
  landEdge: C.grocFosc,
  imb: C.muted
};

/* ---------- Dades derivades (Gt de CO₂) ---------- */
const ROWS = D.G.map(r => {
  const F = (r[1] - r[6]) * CC, U = r[2] * CC;
  return { y: r[0], F, U, E: F + U, A: r[3] * CC, O: r[4] * CC, L: r[5] * CC, B: r[7] * CC };
});
const BY = {};
ROWS.forEach(r => { BY[r.y] = r; });
const LAST = 2026, LASTREAL = 2025;
const ONI = y => { const i = y - D.ONI0; return i >= 0 && i < D.ONI.length ? D.ONI[i] : null; };

const DEC = (() => {
  let E = 0, a = 0, o = 0, l = 0, b = 0;
  for (let y = 2016; y <= 2025; y++) {
    const r = BY[y]; E += r.E; a += r.A; o += r.O; l += r.L; b += r.B;
  }
  return { A: a / E, O: o / E, L: l / E, B: b / E };
})();

/* ---------- Helpers visuals (aquarel·la, capes híbrides, separació d'etiquetes) ---------- */
function hybridLayer(el, w, h, ariaLabel) {
  d3.select(el).selectAll(".ibv-stage").remove();
  const stage = d3.select(el).insert("div", ":first-child")
    .attr("class", "ibv-stage")
    .style("position", "relative")
    .style("width", w + "px")
    .style("height", h + "px");
  const cv = V.canvas(stage.node(), w, h, ariaLabel);
  const s = V.svg(stage.node(), w, h, ariaLabel)
    .style("position", "absolute")
    .style("left", 0).style("top", 0);
  return { stage, ctx: cv.ctx, canvas: cv.c, svg: s };
}

function addWashGrad(defs, id, col, a0, a1, a2) {
  const rg = defs.append("radialGradient").attr("id", id).attr("cx", "40%").attr("cy", "36%").attr("r", "64%");
  rg.append("stop").attr("offset", "0%").attr("stop-color", col).attr("stop-opacity", a0 == null ? .44 : a0);
  rg.append("stop").attr("offset", "74%").attr("stop-color", col).attr("stop-opacity", a1 == null ? .22 : a1);
  rg.append("stop").attr("offset", "100%").attr("stop-color", col).attr("stop-opacity", a2 == null ? .05 : a2);
  return `url(#${id})`;
}

function addLinearGrad(defs, id, x1, y1, x2, y2, stops) {
  const lg = defs.append("linearGradient").attr("id", id)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
  stops.forEach(([off, col, op]) => lg.append("stop").attr("offset", off).attr("stop-color", col).attr("stop-opacity", op));
  return `url(#${id})`;
}

function separate(items, gap, lo, hi) {
  items.sort((a, b) => a.y - b.y);
  items.forEach(o => { o.ly = o.y; });
  for (let it = 0; it < 28; it++) {
    for (let i = 1; i < items.length; i++) {
      const d = items[i].ly - items[i - 1].ly;
      if (d < gap) {
        const push = (gap - d) / 2;
        items[i - 1].ly -= push;
        items[i].ly += push;
      }
    }
    if (items.length) {
      if (items[0].ly < lo) items[0].ly = lo;
      if (items[items.length - 1].ly > hi) items[items.length - 1].ly = hi;
    }
  }
}

function scrollyMobH() {
  return Math.round(clamp((window.innerHeight || 720) * .30, 200, 260));
}

/* =====================================================================
   1. SCROLLY A — IB-40 RIU D'AQUAREL·LA DE CARBONI AMB ~1.200 MICRO-TRAÇOS
      Emissions del 2025 (42,8 Gt CO₂): Fòssils + Ús del sòl → Aire / Oceà / Terra / Desq.
      A mòbil (w < 600): flux transposat en vertical (dalt → baix), alçada ≤ 260 px.
   ===================================================================== */
const A = { step: 0, W: 0, H: 0, hov: null, loopH: null, g: null, links: [], cmpLinks: [] };
const R25 = BY[LASTREAL];

V.legendCat(document.getElementById("aLg"), [
  { c: PAL.fossil, t: "Fòssil i ciment" },
  { c: PAL.landUse, t: "Ús del sòl" },
  { c: PAL.air, t: "Atmosfera" },
  { c: PAL.ocean, t: "Oceà" },
  { c: PAL.land, t: "Terra" },
  { c: PAL.imb, t: "Desquadrament", kind: "hollow" }
]);

const A_TXT = [
  () => ["Emissions del 2025", `${f1(R25.E)} Gt de CO₂ · riu de carboni (427 unitats de 0,1 Gt)`],
  () => ["Combustibles fòssils i ciment", `${f1(R25.F)} Gt de CO₂ · ${pct(R25.F / R25.E)} del total`],
  () => ["+ Canvi d'ús del sòl", `${f1(R25.U)} Gt més · ${f1(R25.E)} Gt de CO₂ en total`],
  () => ["Si tot es quedés a l'aire", `+${f1(R25.E / CC / 2.124)} ppm en un any (en realitat, +2,1 ppm)`],
  () => ["L'oceà absorbeix una quarta part", `${f1(R25.O)} Gt · ${pct(R25.O / R25.E)} de les emissions`],
  () => ["La terra, gairebé un terç el 2025", `${f1(R25.L)} Gt · ${pct(R25.L / R25.E)} (rècord històric)`],
  () => ["El que es queda a l'aire", `${f1(R25.A)} Gt · ${pct(R25.A / R25.E)} → +${f1(R25.A / CC / 2.124)} ppm`],
  () => ["Desquadrament del balanç", `${f1(R25.B)} Gt · ${pct(R25.B / R25.E)} sense assignar`],
  () => ["El 2025 i la mitjana 2016–2025", `A l'aire: ${pct(R25.A / R25.E)} el 2025 · ${pct(DEC.A)} de mitjana`]
];

function buildRiverA(w, h) {
  const mob = w < 600;
  const nw = mob ? 3.5 : 4.2;
  const nodes = [
    { id: "F", col: 0, nm: "Fòssils i ciment", short: "Fòssils", v: R25.F, c: PAL.fossil, sc: "#3D3B38" },
    { id: "U", col: 0, nm: "Ús del sòl", short: "Sòl", v: R25.U, c: PAL.landUse, sc: PAL.landUseEdge },
    { id: "T", col: 1, nm: "Emès a l'aire", short: "42,8 Gt", v: R25.E, c: C.ink, sc: C.ink },
    { id: "A", col: 2, nm: "Atmosfera", short: "Aire", v: R25.A, c: PAL.air, sc: C.vermell },
    { id: "O", col: 2, nm: "Oceà", short: "Oceà", v: R25.O, c: PAL.ocean, sc: C.blau },
    { id: "L", col: 2, nm: "Terra", short: "Terra", v: R25.L, c: PAL.land, sc: C.grocFosc },
    { id: "B", col: 2, nm: "Desquadrament", short: "Desq.", v: R25.B, c: PAL.imb, sc: C.muted }
  ];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const links = [
    { id: "F-T", s: byId.F, t: byId.T, v: R25.F, c0: PAL.fossil, c1: C.ink2, sc: "#3E3C38", group: "F" },
    { id: "U-T", s: byId.U, t: byId.T, v: R25.U, c0: PAL.landUse, c1: PAL.landUseEdge, sc: PAL.landUseEdge, group: "U" },
    { id: "T-A", s: byId.T, t: byId.A, v: R25.A, c0: C.ink2, c1: PAL.air, sc: C.vermell, group: "A" },
    { id: "T-O", s: byId.T, t: byId.O, v: R25.O, c0: C.ink2, c1: PAL.ocean, sc: C.blau, group: "O" },
    { id: "T-L", s: byId.T, t: byId.L, v: R25.L, c0: C.ink2, c1: PAL.land, sc: C.grocFosc, group: "L" },
    { id: "T-B", s: byId.T, t: byId.B, v: R25.B, c0: C.ink2, c1: PAL.imb, sc: C.muted, group: "B" }
  ];

  const NS = 56;
  const rnd = V.rng(4025);
  const totalParticles = mob ? 620 : 1200;

  if (!mob) {
    // Horitzontal (escriptori): esquerra (fonts) → centre (atmosfera/total) → dreta (destins)
    const m = { t: 38, b: 32, l: 136, r: 146 };
    const X = [m.l, m.l + (w - m.l - m.r) * .42, w - m.r - nw];
    const inner = h - m.t - m.b;
    const cols = [[byId.F, byId.U], [byId.T], [byId.A, byId.O, byId.L, byId.B]];
    const gapMax = 26;
    const k = (inner - gapMax * 3) / R25.E;

    cols.forEach((col, ci) => {
      const tot = d3.sum(col, d => d.v) * k;
      const gap = col.length > 1 ? Math.min(ci === 0 ? 52 : gapMax, (inner - tot) / (col.length - 1)) : 0;
      let y = m.t + (inner - tot - gap * (col.length - 1)) / 2;
      col.forEach(nd => {
        nd.x = X[ci]; nd.y0 = y; nd.len = Math.max(4, nd.v * k); nd.y1 = y + nd.len;
        nd.cx = nd.x + nw / 2; nd.cy = (nd.y0 + nd.y1) / 2;
        y = nd.y1 + gap;
      });
    });

    // Assignar posicions d'entrada i sortida als links
    let yTin = byId.T.y0, yTout = byId.T.y0;
    links.forEach(l => {
      l.w = Math.max(2, l.v * k);
      l.x0 = l.s.x + nw + 1.5; l.x1 = l.t.x - 1.5; l.xm = (l.x0 + l.x1) / 2;
      if (l.t.id === "T") {
        l.sy = l.s.y0; l.ty = yTin; yTin += l.w;
      } else {
        l.sy = yTout; yTout += l.w; l.ty = l.t.y0;
      }
      l.pathD = `M${l.x0},${l.sy}C${l.xm},${l.sy} ${l.xm},${l.ty} ${l.x1},${l.ty}` +
                `L${l.x1},${l.ty + l.w}C${l.xm},${l.ty + l.w} ${l.xm},${l.sy + l.w} ${l.x0},${l.sy + l.w}Z`;
      l.LX = new Float32Array(NS + 1);
      l.LY = new Float32Array(NS + 1);
      for (let i = 0; i <= NS; i++) {
        const t = i / NS;
        l.LX[i] = bez(l.x0, l.xm, l.xm, l.x1, t);
        l.LY[i] = bez(l.sy, l.sy, l.ty, l.ty, t);
      }
      l.vert = false;
    });
  } else {
    // Vertical (mòbil < 600 px): dalt (fonts) → centre (total) → baix (destins), alçada ≤ 260 px
    const m = { t: 28, b: 36, l: 10, r: 10 };
    const Y = [m.t, m.t + (h - m.t - m.b) * .42, h - m.b - nw];
    const inner = w - m.l - m.r;
    const rows = [[byId.F, byId.U], [byId.T], [byId.A, byId.O, byId.L, byId.B]];
    const gapMax = 10;
    const k = (inner - gapMax * 3) / R25.E;

    rows.forEach((row, ri) => {
      const tot = d3.sum(row, d => d.v) * k;
      const gap = row.length > 1 ? Math.min(ri === 0 ? 22 : gapMax, (inner - tot) / (row.length - 1)) : 0;
      let x = m.l + (inner - tot - gap * (row.length - 1)) / 2;
      row.forEach(nd => {
        nd.y = Y[ri]; nd.x0 = x; nd.len = Math.max(5, nd.v * k); nd.x1 = x + nd.len;
        nd.cx = (nd.x0 + nd.x1) / 2; nd.cy = nd.y + nw / 2;
        x = nd.x1 + gap;
      });
    });

    let xTin = byId.T.x0, xTout = byId.T.x0;
    links.forEach(l => {
      l.w = Math.max(3, l.v * k);
      l.y0 = l.s.y + nw + 1; l.y1 = l.t.y - 1; l.ym = (l.y0 + l.y1) / 2;
      if (l.t.id === "T") {
        l.sx = l.s.x0; l.tx = xTin; xTin += l.w;
      } else {
        l.sx = xTout; xTout += l.w; l.tx = l.t.x0;
      }
      l.pathD = `M${l.sx},${l.y0}C${l.sx},${l.ym} ${l.tx},${l.ym} ${l.tx},${l.y1}` +
                `L${l.tx + l.w},${l.y1}C${l.tx + l.w},${l.ym} ${l.sx + l.w},${l.ym} ${l.sx + l.w},${l.y0}Z`;
      l.LX = new Float32Array(NS + 1);
      l.LY = new Float32Array(NS + 1);
      for (let i = 0; i <= NS; i++) {
        const t = i / NS;
        l.LX[i] = bez(l.sx, l.sx, l.tx, l.tx, t);
        l.LY[i] = bez(l.y0, l.ym, l.ym, l.y1, t);
      }
      l.vert = true;
    });
  }

  // Micro-traços corbats molt lents (~28 s de recorregut complet, estil IB-28/IB-40)
  const dens = totalParticles / (R25.E * 2);
  links.forEach(l => {
    const nP = Math.max(12, Math.round(l.v * dens));
    l.pt = new Float32Array(nP);
    l.po = new Float32Array(nP);
    l.ps = new Float32Array(nP);
    l.pl = new Float32Array(nP);
    l.pw = new Float32Array(nP);
    for (let i = 0; i < nP; i++) {
      l.pt[i] = rnd();
      l.po[i] = (.07 + rnd() * .86) * l.w;
      // ~28 segons per travessar una meitat (0.000034–0.000046 / ms)
      l.ps[i] = (.76 + rnd() * .48) * .000038;
      l.pl[i] = .042 + rnd() * .045;
      l.pw[i] = mob ? (.72 + rnd() * .48) : (.85 + rnd() * .62);
    }
  });

  // Micro-traços per al pas 8 (comparació 2025 vs Mitjana 2016–2025)
  const cmpParts = [];
  const y25 = { A: R25.A / R25.E, O: R25.O / R25.E, L: R25.L / R25.E, B: R25.B / R25.E };
  const segKeys = [["A", PAL.air, C.vermell], ["O", PAL.ocean, C.blau], ["L", PAL.land, C.grocFosc], ["B", PAL.imb, C.muted]];
  const cmpN = mob ? 220 : 420;
  [0, 1].forEach(rowIdx => {
    const fracs = rowIdx === 0 ? y25 : DEC;
    let acc = 0;
    segKeys.forEach(([k, , sc]) => {
      const f = fracs[k], x0f = acc, x1f = acc + f;
      acc += f;
      const n = Math.max(6, Math.round(cmpN * .5 * f));
      for (let i = 0; i < n; i++) {
        cmpParts.push({
          row: rowIdx, k, sc, x0f, x1f,
          t: rnd(), o: .12 + rnd() * .76,
          sp: (.75 + rnd() * .5) * .000035,
          len: .04 + rnd() * .05,
          pw: mob ? .8 : 1.05
        });
      }
    });
  });

  return { w, h, mob, nw, nodes, byId, links, NS, cmpParts, y25 };
}

function sampleLinkA(l, t, off, NS) {
  const f = clamp(t, 0, 1) * NS, k = f | 0, u = f - k, k1 = k < NS ? k + 1 : NS;
  const x = l.LX[k] + (l.LX[k1] - l.LX[k]) * u;
  const y = l.LY[k] + (l.LY[k1] - l.LY[k]) * u;
  return l.vert ? [x + off, y] : [x, y + off];
}

function activeGroupsA(step) {
  if (step === 0) return new Set(["F", "U", "A", "O", "L", "B"]);
  if (step === 1) return new Set(["F"]);
  if (step === 2) return new Set(["F", "U"]);
  if (step === 3) return new Set(["F", "U"]);
  if (step === 4) return new Set(["O"]);
  if (step === 5) return new Set(["L"]);
  if (step === 6) return new Set(["A"]);
  if (step === 7) return new Set(["B"]);
  return new Set(["A", "O", "L", "B"]);
}

function renderRiverSVG_A() {
  if (!A.svg || !A.g) return;
  const g = A.g, s = A.step, mob = g.mob;
  const root = A.root;
  root.selectAll("*").remove();
  A.defs.selectAll("*").remove();

  // Pas 8: Comparació directa d'aquarel·la 2025 vs Mitjana 2016–2025
  if (s === 8) {
    const padX = mob ? 10 : 20, bw = g.w - padX * 2;
    const bh = mob ? 28 : 42;
    const y1 = mob ? g.h * .24 : g.h * .25;
    const y2 = mob ? g.h * .64 : g.h * .64;
    const segs = [
      ["A", PAL.air, "Atmosfera", "Aire"],
      ["O", PAL.ocean, "Oceà", "Oceà"],
      ["L", PAL.land, "Terra", "Terra"],
      ["B", PAL.imb, "Desquadrament", "Desq."]
    ];
    A.cmpGeom = { padX, bw, bh, y1, y2 };

    V.t(root, padX, y1 - 10, mob ? "2025 · any rècord per als boscos" : "2025 · un any excepcional per als boscos", { size: mob ? 11.5 : 13, weight: 700, fill: C.ink });
    V.t(root, padX, y2 - 10, mob ? "Mitjana 2016–2025 · gairebé la meitat a l'aire" : "Mitjana 2016–2025 · gairebé la meitat es queda a l'aire", { size: mob ? 11.5 : 13, weight: 700, fill: C.ink });

    // Connectors suaus entre les dues franges (mostren com s'eixampla l'atmosfera de 37% a 48%)
    const cG = root.append("g").style("mix-blend-mode", "multiply");
    let x1a = padX, x2a = padX;
    segs.forEach(([k, col]) => {
      const w1 = bw * g.y25[k], w2 = bw * DEC[k];
      if (k !== "B") {
        const ym = (y1 + bh + y2) / 2;
        cG.append("path")
          .attr("d", `M${x1a},${y1 + bh}C${x1a},${ym} ${x2a},${ym} ${x2a},${y2}L${x2a + w2},${y2}C${x2a + w2},${ym} ${x1a + w1},${ym} ${x1a + w1},${y1 + bh}Z`)
          .attr("fill", col).attr("fill-opacity", k === "A" ? .14 : .07);
      }
      x1a += w1; x2a += w2;
    });

    // Dibuix de les dues franges d'aquarel·la
    [0, 1].forEach(ri => {
      const fracs = ri === 0 ? g.y25 : DEC;
      const yb = ri === 0 ? y1 : y2;
      let cx = padX;
      segs.forEach(([k, col, nm, snm]) => {
        const sw = bw * fracs[k];
        const grp = root.append("g").datum({ id: k, nm, v25: g.y25[k], vDec: DEC[k] }).attr("class", "cmp-seg").style("cursor", "pointer");
        if (k === "B") {
          grp.append("rect").attr("x", cx + .5).attr("y", yb + .5).attr("width", Math.max(0, sw - 1)).attr("height", bh - 1)
            .attr("rx", 2).attr("fill", "none").attr("stroke", col).attr("stroke-dasharray", "3 2").attr("stroke-width", 1);
        } else {
          const gid = `cmp-${ri}-${k}-${Math.random().toString(36).slice(2, 5)}`;
          addLinearGrad(A.defs, gid, cx, yb, cx, yb + bh, [
            ["0%", col, k === "L" ? .44 : .36],
            ["100%", col, k === "L" ? .24 : .20]
          ]);
          grp.append("rect").attr("x", cx).attr("y", yb).attr("width", Math.max(0, sw - 1.5)).attr("height", bh)
            .attr("rx", 2).attr("fill", `url(#${gid})`).style("mix-blend-mode", "multiply");
          grp.append("line").attr("x1", cx + sw - 1).attr("x2", cx + sw - 1).attr("y1", yb).attr("y2", yb + bh)
            .attr("stroke", C.paper).attr("stroke-width", 1.2);
        }
        if (sw > (mob ? 38 : 54)) {
          V.t(grp, cx + sw / 2, yb + bh / 2 + 4, pct(fracs[k]), {
            size: mob ? 11.5 : 13, weight: 700, anchor: "middle",
            fill: k === "A" ? C.vermellFosc : k === "O" ? C.blauFosc : C.ink, halo: 2.5
          });
        }
        if (sw > (mob ? 36 : 52)) {
          V.t(grp, cx + sw / 2, yb + bh + (mob ? 14 : 16), mob ? snm : nm, {
            size: 11.5, anchor: "middle", fill: k === "A" ? C.vermell : k === "O" ? C.blau : C.ink2, weight: 600
          });
        }
        cx += sw;
      });
    });

    if (!mob) {
      V.note(root, {
        x: padX + bw * DEC.A * .55, y: y2 - 2, tx: padX + bw * DEC.A + 22, ty: (y1 + bh + y2) / 2,
        kind: "curve", bend: -10, anchor: "start", stroke: C.vermell,
        lines: [["+11 punts més a l'aire", true, C.vermell], ["en una dècada típica (48 % vs 37 %)"]]
      });
    }
    return;
  }

  // Passos 0–7: Riu d'aquarel·la IB-40
  const act = activeGroupsA(s);
  const pid = "ra" + Math.random().toString(36).slice(2, 6);

  // Degradats translúcids per a cada banda
  g.links.forEach((l, i) => {
    const isAct = act.has(l.group);
    const aScale = s === 0 ? 1 : isAct ? 1.25 : .36;
    if (!l.vert) {
      addLinearGrad(A.defs, `${pid}-${i}`, l.x0, 0, l.x1, 0, [
        ["0%", l.c0, (l.group === "F" || l.group === "U" ? .14 : .06) * aScale],
        ["45%", l.c1, (l.c1 === PAL.land ? .18 : .14) * aScale],
        ["100%", l.c1, (l.c1 === PAL.land ? .28 : .22) * aScale]
      ]);
    } else {
      addLinearGrad(A.defs, `${pid}-${i}`, 0, l.y0, 0, l.y1, [
        ["0%", l.c0, (l.group === "F" || l.group === "U" ? .15 : .07) * aScale],
        ["50%", l.c1, (l.c1 === PAL.land ? .20 : .15) * aScale],
        ["100%", l.c1, (l.c1 === PAL.land ? .30 : .23) * aScale]
      ]);
    }
  });

  // Bandes d'aquarel·la sense contorns durs (multiply)
  const ribG = root.append("g");
  ribG.selectAll("path.rib").data(g.links).join("path")
    .attr("class", "rib")
    .attr("d", l => l.pathD)
    .attr("fill", (l, i) => `url(#${pid}-${i})`)
    .style("mix-blend-mode", "multiply")
    .style("cursor", "pointer");

  // Nodes esvelts arrodonits (3,5–4,2 px)
  const ndG = root.append("g");
  ndG.selectAll("rect.nd").data(g.nodes).join("rect")
    .attr("class", "nd")
    .attr("x", d => mob ? d.x0 : d.x)
    .attr("y", d => mob ? d.y : d.y0)
    .attr("width", d => mob ? d.len : g.nw)
    .attr("height", d => mob ? g.nw : d.len)
    .attr("rx", g.nw / 2).attr("ry", g.nw / 2)
    .attr("fill", d => d.c)
    .attr("fill-opacity", d => {
      if (d.id === "T") return s === 3 ? 1 : .82;
      if (s === 0) return .88;
      return act.has(d.id) ? .96 : .34;
    })
    .style("cursor", "pointer");

  // Etiquetes directes dels nodes
  const lbG = root.append("g").style("pointer-events", "none");
  if (!mob) {
    // Capçaleres de columna ultra-netes
    V.t(lbG, g.byId.F.x - 10, 16, "D'on surt", { size: 11.5, fill: C.muted, anchor: "end", italic: true });
    V.t(lbG, g.byId.T.cx, 16, "Emès el 2025", { size: 11.5, fill: C.muted, anchor: "middle", italic: true });
    V.t(lbG, g.byId.A.x + g.nw + 10, 16, "On va a parar", { size: 11.5, fill: C.muted, anchor: "start", italic: true });

    // Fonts (esquerra)
    const srcItems = [g.byId.F, g.byId.U].map(nd => ({ nd, y: nd.cy }));
    separate(srcItems, 36, 38, g.h - 28);
    srcItems.forEach(({ nd, ly }) => {
      const on = s === 0 || act.has(nd.id);
      const q = lbG.append("g").style("opacity", on ? 1 : .45);
      V.t(q, nd.x - 10, ly - 3, nd.nm, { size: 12.5, weight: 700, anchor: "end", fill: nd.id === "U" ? PAL.landUseEdge : C.ink });
      V.t(q, nd.x - 10, ly + 12, `${f1(nd.v)} Gt · ${pct(nd.v / R25.E)}`, { size: 11.5, anchor: "end", fill: C.muted });
    });

    // Hub central
    V.t(lbG, g.byId.T.cx, g.byId.T.y0 - 10, `${f1(R25.E)} Gt`, { size: 12.5, weight: 700, anchor: "middle", fill: C.ink, halo: true });

    // Destins (dreta)
    const dstItems = [g.byId.A, g.byId.O, g.byId.L, g.byId.B].map(nd => ({ nd, y: nd.cy }));
    separate(dstItems, 36, 38, g.h - 22);
    dstItems.forEach(({ nd, ly }) => {
      const on = s === 0 || act.has(nd.id);
      const q = lbG.append("g").style("opacity", on ? 1 : .45);
      if (Math.abs(ly - nd.cy) > 5) {
        q.append("path").attr("d", `M${nd.x + g.nw + 2},${nd.cy}L${nd.x + g.nw + 8},${ly - 2}`)
          .attr("stroke", C.hair).attr("stroke-width", .75).attr("fill", "none");
      }
      V.t(q, nd.x + g.nw + 10, ly - 3, nd.nm, {
        size: 12.5, weight: 700, anchor: "start",
        fill: nd.id === "A" ? C.vermell : nd.id === "O" ? C.blau : C.ink
      });
      V.t(q, nd.x + g.nw + 10, ly + 12, `${f1(nd.v)} Gt · ${pct(nd.v / R25.E)}`, { size: 11.5, anchor: "start", fill: C.muted });
    });
  } else {
    // Mòbil vertical: etiquetes compactes dalt i baix (≥ 11 px, sense solapaments)
    const F = g.byId.F, U = g.byId.U;
    V.t(lbG, Math.max(8, F.x0), F.y - 8, `Fòssils ${f1(F.v)} Gt`, { size: 11, weight: 700, fill: C.ink, anchor: "start" });
    V.t(lbG, Math.min(g.w - 8, U.x1), U.y - 8, `Sòl ${f1(U.v)}`, { size: 11, weight: 700, fill: PAL.landUseEdge, anchor: "end" });
    V.t(lbG, g.w - 8, g.byId.T.y - 6, `${f1(R25.E)} Gt`, { size: 11, weight: 700, fill: C.ink2, anchor: "end", halo: true });

    const dsts = [g.byId.A, g.byId.O, g.byId.L, g.byId.B];
    dsts.forEach((nd, idx) => {
      const on = s === 0 || act.has(nd.id);
      const anc = idx === 0 ? "start" : idx === 3 ? "end" : "middle";
      const lx = idx === 0 ? Math.max(6, nd.x0) : idx === 3 ? Math.min(g.w - 6, nd.x1) : nd.cx;
      const q = lbG.append("g").style("opacity", on ? 1 : .45);
      V.t(q, lx, nd.y + g.nw + 14, nd.short, {
        size: 11, weight: 700, anchor: anc,
        fill: nd.id === "A" ? C.vermell : nd.id === "O" ? C.blau : C.ink
      });
      V.t(q, lx, nd.y + g.nw + 26, pct(nd.v / R25.E), { size: 11, anchor: anc, fill: C.muted });
    });
  }

  // Anotació quirúrgica per pas (IBV.note)
  const ann = root.append("g").style("pointer-events", "none");
  const lById = Object.fromEntries(g.links.map(l => [l.id, l]));
  const midPt = (id, tPos) => {
    const l = lById[id];
    return sampleLinkA(l, tPos == null ? .5 : tPos, l.w * .5, g.NS);
  };

  if (!mob) {
    if (s === 1) {
      const p = midPt("F-T", .46);
      V.note(ann, { x: p[0], y: p[1] - 10, tx: p[0], ty: Math.max(38, p[1] - 64), kind: "elbow", anchor: "middle", dot: true,
        lines: [["90 % del total", true], ["carbó 41 % · petroli 33 % · gas 21 %"]] });
    } else if (s === 2) {
      const p = midPt("U-T", .5);
      V.note(ann, { x: p[0], y: p[1], tx: p[0] - 10, ty: Math.min(g.h - 24, p[1] + 46), kind: "curve", bend: -12, anchor: "end", dot: true, stroke: PAL.landUseEdge,
        lines: [["Tala i crema tropical", true, PAL.landUseEdge], ["Brasil, Indonèsia i RD Congo > 50 %"]] });
    } else if (s === 3) {
      const T = g.byId.T;
      V.note(ann, { x: T.cx + 4, y: T.cy, tx: T.cx + 42, ty: T.y0 + 30, kind: "curve", bend: 14, anchor: "start", dot: true, stroke: C.vermell,
        lines: [["Si tot quedés a l'aire: +5,5 ppm", true, C.vermell], ["mesurat realment: +2,1 ppm"]] });
    } else if (s === 4) {
      const p = midPt("T-O", .52);
      V.note(ann, { x: p[0], y: p[1], tx: p[0] - 16, ty: Math.max(40, p[1] - 58), kind: "curve", bend: -12, anchor: "end", dot: true, stroke: C.blau,
        lines: [["Embornal oceànic constant", true, C.blau], ["11,7 Gt dissoltes al mar"]] });
    } else if (s === 5) {
      const p = midPt("T-L", .52);
      V.note(ann, { x: p[0], y: p[1], tx: p[0] - 16, ty: Math.min(g.h - 24, p[1] + 54), kind: "curve", bend: 12, anchor: "end", dot: true,
        lines: [["Any excepcional a terra", true], ["13,3 Gt: el màxim registrat"]] });
    } else if (s === 6) {
      const p = midPt("T-A", .52);
      V.note(ann, { x: p[0], y: p[1], tx: p[0] - 20, ty: Math.max(40, p[1] - 46), kind: "curve", bend: -12, anchor: "end", dot: true, stroke: C.vermell,
        lines: [["Fracció aerotransportada", true, C.vermell], ["16,0 Gt (+2,1 ppm a la corba)"]] });
    } else if (s === 7) {
      const p = midPt("T-B", .55);
      V.note(ann, { x: p[0], y: p[1], tx: p[0] - 26, ty: Math.min(g.h - 24, p[1] - 32), kind: "curve", bend: 12, anchor: "end", dot: true, stroke: C.muted,
        lines: [["Desquadrament · 1,7 Gt", true, C.ink2], ["diferència entre models i mesures"]] });
    }
  } else {
    // Mòbil: una sola anotació compacta i centrada fora de col·lisions
    if (s === 3) {
      V.t(ann, g.w / 2, g.byId.T.y + 22, "Tot a l'aire: +5,5 ppm · real: +2,1 ppm", { size: 11, weight: 700, fill: C.vermell, anchor: "middle", halo: 3 });
    } else if (s === 4) {
      const p = midPt("T-O", .52);
      V.t(ann, clamp(p[0], 68, g.w - 68), p[1], "Oceà · 11,7 Gt (27 %)", { size: 11, weight: 700, fill: C.blau, anchor: "middle", halo: 3.2 });
    } else if (s === 5) {
      const p = midPt("T-L", .52);
      V.t(ann, clamp(p[0], 68, g.w - 68), p[1], "Terra · 13,3 Gt (31 %)", { size: 11, weight: 700, fill: C.ink, anchor: "middle", halo: 3.2 });
    } else if (s === 6) {
      const p = midPt("T-A", .52);
      V.t(ann, clamp(p[0], 72, g.w - 72), p[1], "Aire · 16,0 Gt (37 %)", { size: 11, weight: 700, fill: C.vermell, anchor: "middle", halo: 3.2 });
    } else if (s === 7) {
      V.t(ann, g.w - 8, g.byId.B.y - 14, "Desq. · 1,7 Gt (4 %)", { size: 11, weight: 700, fill: C.ink2, anchor: "end", halo: 3.2 });
    }
  }
}

function drawParticlesA(tMs, dtMs) {
  const ctx = A.ctx, g = A.g;
  if (!ctx || !g) return;
  const dt = RM ? 0 : Math.min(50, dtMs);
  ctx.clearRect(0, 0, g.w, g.h);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Pas 8: micro-traços suaus dins les dues franges comparatives
  if (A.step === 8 && A.cmpGeom) {
    const cg = A.cmpGeom;
    for (const p of g.cmpParts) {
      if (dt) { p.t += dt * p.sp; if (p.t > 1) p.t -= 1; }
      const x0 = cg.padX + p.x0f * cg.bw, segW = (p.x1f - p.x0f) * cg.bw;
      if (segW < 6) continue;
      const yb = p.row === 0 ? cg.y1 : cg.y2;
      const t1 = p.t, t0 = Math.max(0, t1 - p.len);
      const fade = smooth(t1, 0, .12) * smooth(1 - t1, 0, .12);
      const dim = A.hov && A.hov !== p.k ? .35 : 1;
      const a = .72 * fade * dim;
      if (a < .03) continue;
      const y = yb + p.o * cg.bh;
      const px0 = x0 + t0 * segW, px1 = x0 + t1 * segW;
      ctx.strokeStyle = p.sc; ctx.fillStyle = p.sc;
      ctx.globalAlpha = a * .58; ctx.lineWidth = p.pw;
      ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px1, y); ctx.stroke();
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(px1, y, p.pw * .75, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  // Passos 0–7: ~1.200 micro-traços corbats molt lents seguint les Bézier del riu
  const act = activeGroupsA(A.step);
  for (const l of g.links) {
    const isAct = A.hov ? (A.hov === l.group || A.hov === "T") : (A.step === 0 || act.has(l.group));
    const baseA = isAct ? .86 : .20;
    ctx.strokeStyle = l.sc;
    ctx.fillStyle = l.sc;
    const pt = l.pt, po = l.po, ps = l.ps, pl = l.pl, pw = l.pw;
    for (let i = 0; i < pt.length; i++) {
      if (dt) {
        let nt = pt[i] + dt * ps[i];
        if (nt > 1) nt -= 1;
        pt[i] = nt;
      }
      const t1 = pt[i], t0 = Math.max(0, t1 - pl[i]);
      if (t1 - t0 < .004) continue;
      const fade = smooth(t1, 0, .09) * smooth(1 - t1, 0, .09);
      const a = baseA * fade;
      if (a < .025) continue;

      const p0 = sampleLinkA(l, t0, po[i], g.NS);
      const p1 = sampleLinkA(l, t0 + (t1 - t0) * .35, po[i], g.NS);
      const p2 = sampleLinkA(l, t0 + (t1 - t0) * .7, po[i], g.NS);
      const p3 = sampleLinkA(l, t1, po[i], g.NS);

      ctx.globalAlpha = a * .58;
      ctx.lineWidth = pw[i];
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.stroke();

      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(p3[0], p3[1], pw[i] * .76, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

const aPlot = document.getElementById("aPlot");
const aTip = V.tip(aPlot);
V.mount(aPlot, (el, w) => {
  if (A.loopH) { A.loopH.stop(); A.loopH = null; }
  const mob = w < 600;
  const h = mob ? scrollyMobH() : Math.round(clamp(w * .58, 350, 440));
  A.W = w; A.H = h;
  A.g = buildRiverA(w, h);
  const lay = hybridLayer(el, w, h, "Riu d'aquarel·la de les 42,8 Gt de CO₂ emeses el 2025: 38,4 Gt de combustibles fòssils i ciment i 4,4 Gt del canvi d'ús del sòl flueixen cap a l'atmosfera (16,0 Gt), l'oceà (11,7 Gt), la terra (13,3 Gt) i el desquadrament (1,7 Gt).");
  A.ctx = lay.ctx; A.svg = lay.svg;
  A.defs = lay.svg.append("defs");
  A.root = lay.svg.append("g");
  renderRiverSVG_A();

  V.hover(lay.svg.node(), ev => {
    const d = d3.select(ev.target).datum();
    if (!d) {
      if (A.hov) { A.hov = null; A.root.selectAll(".rib,.nd,.cmp-seg").style("opacity", null); aTip.hide(); if (RM) drawParticlesA(0, 0); }
      return;
    }
    const id = d.group || d.id;
    A.hov = id;
    if (A.step === 8 && d.v25 != null) {
      A.root.selectAll(".cmp-seg").style("opacity", o => o.id === id ? 1 : .48);
      aTip.show(`<b>${d.nm}</b> · 2025: ${pct(d.v25)} · Mitjana 2016–2025: ${pct(d.vDec)}`);
    } else if (d.v != null) {
      const nm = d.nm || `${d.s.nm} → ${d.t.nm}`;
      A.root.selectAll(".rib").style("opacity", o => (o.group === id || id === "T") ? 1 : .48);
      A.root.selectAll(".nd").style("opacity", o => (o.id === id || o.id === "T" || id === "T") ? 1 : .48);
      aTip.show(`<b>${nm} (2025)</b> · ${f1(d.v)} Gt de CO₂ (${pct(d.v / R25.E)})`);
    }
    if (RM) drawParticlesA(0, 0);
  }, () => {
    A.hov = null;
    A.root.selectAll(".rib,.nd,.cmp-seg").style("opacity", null);
    aTip.hide();
    if (RM) drawParticlesA(0, 0);
  });

  A.loopH = V.loop(el, drawParticlesA);
});

function onStepA(i) {
  A.step = i; A.hov = null;
  aTip.hide();
  renderRiverSVG_A();
  const txt = A_TXT[i]();
  document.getElementById("aTitle").textContent = txt[0];
  document.getElementById("aVal").textContent = txt[1];
  if (RM) drawParticlesA(0, 0);
}

/* =====================================================================
   2. SCROLLY B — IB-16 + IB-28/IB-40 TALL CIENTÍFIC OCEÀ–BOSC
      Perfil silenciós #ECEBE8, capes oceàniques d'aquarel·la, batimetria fina,
      capçades d'aquarel·la groga (radialGradient + multiply) i ~900 micro-traços lents.
   ===================================================================== */
const B = { step: 0, W: 0, H: 0, parts: [], f: 0, ft: 0, stepT: 0, loopH: null };
const B_TXT = [
  ["Dissolució", "Hi entren més molècules de les que en surten"],
  ["Química del carbonat", "CO₂ + H₂O + CO₃²⁻ → 2 HCO₃⁻"],
  ["Cap al fons", "El carboni hi queda de dècades a mil·lennis"],
  ["Bomba biològica", "Sobretot carboni natural que baixa com neu marina"],
  ["Fotosíntesi", "Efecte fertilitzant del CO₂: unes 12 Gt/any (2016–2025)"],
  ["La terra dona i pren", `2025: ${f1(R25.U)} Gt per tala · ${f1(R25.L)} Gt absorbides`]
];

V.legendCat(document.getElementById("bLg"), [
  { c: PAL.ocean, t: "Absorció oceànica" },
  { c: PAL.land, t: "Absorció vegetal / plàncton" },
  { c: PAL.air, t: "Acidificació / tala" }
]);

function geoB(w, h, fOverride) {
  const f = fOverride != null ? fOverride : (B.f == null ? 0 : B.f);
  const mob = w < 600;
  const y0 = h * lerp(.35, .52, f);
  const shore = w * lerp(.35, .64, f);
  const mix = y0 + (h - y0) * .26;
  const deep = y0 + (h - y0) * .66;
  const ox0 = shore + w * .05;
  const tx0 = w * .065, tx1 = shore - w * lerp(.15, .19, f);
  const K = [1.0, 1.18, .92, 1.12, .88];
  const trees = K.map((k, i) => [lerp(tx0, tx1, i / 4), k * lerp(1, 1.14, f)]);
  const fire = [shore - w * lerp(.135, .165, f), shore - w * lerp(.065, .085, f)];
  const tr = Math.max(mob ? 8 : 11, w * lerp(.029, .040, f));
  return { w, h, mob, y0, shore, mix, deep, ox0, trees, fire, tr };
}

function loopPosB(u, d, g) {
  const x0 = g.ox0 + g.w * .035, x1 = g.w - g.w * .045;
  const yT = g.y0 + (g.h - g.y0) * .08, yB = g.h * .90;
  const cx = (x0 + x1) / 2, cy = (yT + yB) / 2;
  const k = 1 - d * .44;
  const rx = (x1 - x0) / 2 * k, ry = (yB - yT) / 2 * (1 - d * .48);
  const th = -Math.PI / 2 + 2 * Math.PI * u;
  const c = Math.cos(th), s = Math.sin(th), e = .54;
  return [cx + rx * Math.sign(c) * Math.pow(Math.abs(c), e), cy + ry * Math.sign(s) * Math.pow(Math.abs(s), e)];
}

function initB(s) {
  const R = V.rng(110 + s * 17);
  B.parts = [];
  const mob = B.W < 600;
  const n = mob ? 480 : 900;
  for (let i = 0; i < n; i++) {
    B.parts.push({
      u: R(), v: R(), w: R(), ph: R() * Math.PI * 2,
      t: R(),
      sp: (.72 + R() * .56) * (s === 2 ? .034 : .042), // ~24–30 s per recorregut
      len: .045 + R() * .055,
      pw: mob ? (.65 + R() * .42) : (.75 + R() * .55),
      kind: R() < .68 ? 0 : 1
    });
  }
}

function drawCanopyWash(ctx, x, y, r, alpha) {
  // Capçada d'aquarel·la multi-lòbul amb radialGradient + multiply (estil el-jesus-historic)
  const lobes = [
    [0, 0, r * 1.05],
    [-r * .58, r * .22, r * .72],
    [r * .55, r * .18, r * .76],
    [-r * .22, -r * .45, r * .68],
    [r * .28, -r * .38, r * .64]
  ];
  for (const [dx, dy, lr] of lobes) {
    const cx = x + dx, cy = y + dy;
    const rg = ctx.createRadialGradient(cx - lr * .18, cy - lr * .18, lr * .05, cx, cy, lr);
    rg.addColorStop(0, V.alpha(C.groc, .36 * alpha));
    rg.addColorStop(.72, V.alpha(C.groc, .20 * alpha));
    rg.addColorStop(1, V.alpha(C.grocClar, 0));
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cx, cy, lr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawB(tMs, dtMs) {
  const ctx = B.ctx;
  if (!ctx || !B.W) return;
  const t = RM ? 0 : tMs / 1000;
  const dt = RM ? 0 : Math.min(.05, dtMs / 1000);
  B.stepT += dt;
  B.ft = B.step >= 4 ? 1 : 0;
  B.f += (B.ft - B.f) * (RM ? 1 : Math.min(1, dt * 3.5));
  const g = B.g = geoB(B.W, B.H);
  const s = B.step, mob = g.mob, fa = RM ? 1 : Math.min(1, B.stepT * 2.2);

  ctx.clearRect(0, 0, g.w, g.h);

  // 1. Capes oceàniques d'aquarel·la (degradat translúcid multiply sense contorns durs)
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const og = ctx.createLinearGradient(0, g.y0, 0, g.h);
  og.addColorStop(0, V.alpha(C.blau, .06));
  og.addColorStop(.26, V.alpha(C.blau, .11));
  og.addColorStop(.66, V.alpha(C.blau, .16));
  og.addColorStop(1, V.alpha(C.blauFosc, .22));
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.moveTo(g.shore - g.w * .05, g.y0);
  ctx.lineTo(g.w, g.y0); ctx.lineTo(g.w, g.h); ctx.lineTo(g.shore - g.w * .05, g.h);
  ctx.closePath();
  ctx.fill();

  // Al pas 1 (química del carbonat), vel suau d'acidificació (vermell translúcid superficial)
  if (s === 1) {
    const ag = ctx.createLinearGradient(0, g.y0, 0, g.deep);
    ag.addColorStop(0, V.alpha(C.vermell, .18 * fa));
    ag.addColorStop(.55, V.alpha(C.vermell, .07 * fa));
    ag.addColorStop(1, V.alpha(C.vermell, 0));
    ctx.fillStyle = ag;
    ctx.fillRect(g.ox0 - g.w * .02, g.y0, g.w - g.ox0 + g.w * .02, g.deep - g.y0);
  }
  ctx.restore();

  // 2. Línies batimètriques fines (0,55 px, estètica de gravat científic)
  ctx.save();
  ctx.setLineDash([2.5, 4]);
  ctx.strokeStyle = V.alpha(C.blau, .42);
  ctx.lineWidth = .6;
  ctx.beginPath(); ctx.moveTo(g.ox0 - g.w * .01, g.mix); ctx.lineTo(g.w, g.mix); ctx.stroke();
  ctx.strokeStyle = V.alpha(C.blauFosc, .28);
  ctx.beginPath(); ctx.moveTo(g.ox0 + g.w * .02, g.deep); ctx.lineTo(g.w, g.deep); ctx.stroke();
  ctx.restore();

  // 3. Perfil de terra silenciós #ECEBE8 amb estrats finíssims
  ctx.fillStyle = C.land;
  ctx.beginPath();
  ctx.moveTo(0, g.y0);
  ctx.lineTo(g.shore - g.w * .07, g.y0);
  ctx.bezierCurveTo(g.shore - g.w * .015, g.y0 + g.h * .07, g.shore + g.w * .005, g.y0 + g.h * .34, g.shore + g.w * .085, g.h);
  ctx.lineTo(0, g.h); ctx.closePath();
  ctx.fill();

  // Estrats geològics ultra-fins dins la terra (0,5 px)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, g.y0);
  ctx.lineTo(g.shore - g.w * .07, g.y0);
  ctx.bezierCurveTo(g.shore - g.w * .015, g.y0 + g.h * .07, g.shore + g.w * .005, g.y0 + g.h * .34, g.shore + g.w * .085, g.h);
  ctx.lineTo(0, g.h); ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = V.alpha(C.landEdge, .55);
  ctx.lineWidth = .55;
  for (let k = 1; k <= 3; k++) {
    const sy = g.y0 + (g.h - g.y0) * (k * .24);
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.bezierCurveTo(g.shore * .35, sy + 5, g.shore * .7, sy - 4, g.shore + g.w * .09, sy + 12);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = C.landEdge; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.moveTo(0, g.y0); ctx.lineTo(g.shore - g.w * .07, g.y0); ctx.stroke();

  // 4. Superfície del mar (línia de gravat ondulada suau)
  ctx.strokeStyle = V.alpha(C.blau, .72); ctx.lineWidth = .9;
  ctx.beginPath();
  for (let x = g.shore - g.w * .068; x <= g.w; x += 3) {
    const y = g.y0 + Math.sin(x * .042 + t * .55) * 1.1;
    if (x === g.shore - g.w * .068) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 5. Bosc amb capçades d'aquarel·la (radialGradient + multiply en C.groc)
  const treeAlpha = s <= 3 ? .54 : 1;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  g.trees.forEach(([x, k]) => {
    const th = g.h * .125 * k, y = g.y0 - th;
    ctx.strokeStyle = V.alpha(C.ink2, .62 * treeAlpha);
    ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.moveTo(x, g.y0); ctx.lineTo(x, y); ctx.stroke();
    // Branques i arrels de gravat fi
    ctx.strokeStyle = V.alpha(C.muted, .42 * treeAlpha);
    ctx.lineWidth = .6;
    ctx.beginPath();
    ctx.moveTo(x, y + th * .35); ctx.lineTo(x - g.tr * .45, y + th * .12);
    ctx.moveTo(x, y + th * .45); ctx.lineTo(x + g.tr * .42, y + th * .18);
    ctx.moveTo(x, g.y0); ctx.lineTo(x - 9, g.y0 + 12);
    ctx.moveTo(x, g.y0); ctx.lineTo(x + 8, g.y0 + 14);
    ctx.moveTo(x, g.y0 + 3); ctx.lineTo(x - 2, g.y0 + 17);
    ctx.stroke();
    drawCanopyWash(ctx, x, y - g.tr * .22, g.tr * 1.05, treeAlpha);
  });
  ctx.restore();

  // Clariana de tala i plomall d'aquarel·la vermell al pas 5
  ctx.strokeStyle = V.alpha(C.vermellFosc, .65 * treeAlpha);
  ctx.lineWidth = 1.3;
  for (let k = 0; k < 3; k++) {
    const x = lerp(g.fire[0], g.fire[1], .2 + .3 * k);
    ctx.beginPath(); ctx.moveTo(x, g.y0); ctx.lineTo(x, g.y0 - 4.5); ctx.stroke();
  }
  if (s === 5) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const fx = (g.fire[0] + g.fire[1]) / 2;
    const rg = ctx.createLinearGradient(fx, g.y0, fx + 18, g.h * .06);
    rg.addColorStop(0, V.alpha(C.vermell, .26 * fa));
    rg.addColorStop(.55, V.alpha(C.vermellClar, .14 * fa));
    rg.addColorStop(1, V.alpha(C.vermell, 0));
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(g.fire[0] - 2, g.y0);
    ctx.quadraticCurveTo(fx - 14, g.y0 * .52, fx + 22, g.h * .06);
    ctx.quadraticCurveTo(fx + 28, g.y0 * .52, g.fire[1] + 2, g.y0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Cinta de circulació profunda al pas 2 (aquarel·la IB-40)
  if (s === 2) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.strokeStyle = V.alpha(C.blau, .14 * fa);
    ctx.lineWidth = mob ? 18 : 28;
    ctx.beginPath();
    for (let u = 0; u <= 1.001; u += .01) {
      const q = loopPosB(u, .5, g);
      if (u === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
    }
    ctx.closePath(); ctx.stroke();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = V.alpha(C.blau, .45 * fa);
    ctx.lineWidth = .75;
    ctx.stroke();
    ctx.restore();
  }

  // Floració de fitoplàncton d'aquarel·la groga al pas 3
  if (s === 3) {
    const R = V.rng(53);
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    for (let i = 0; i < (mob ? 18 : 30); i++) {
      const px = lerp(g.ox0 + 8, g.w - 14, R());
      const py = lerp(g.y0 + 7, g.mix - 6, R()) + Math.sin(t * .4 + i) * 1.1;
      const rr = (mob ? 7 : 11) + R() * 8;
      const rg = ctx.createRadialGradient(px, py, 1, px, py, rr);
      rg.addColorStop(0, V.alpha(C.groc, .34 * fa));
      rg.addColorStop(1, V.alpha(C.grocClar, 0));
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 6. ~900 micro-traços lents amb estela corba (estil IB-28 / IB-40)
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const p of B.parts) {
    if (dt) {
      p.t += dt * p.sp;
      if (p.t > 1) p.t -= 1;
    }
    const t1 = p.t, t0 = Math.max(0, t1 - p.len);
    if (t1 - t0 < .004) continue;
    const fade = smooth(t1, 0, .10) * smooth(1 - t1, 0, .10);
    if (fade < .03) continue;

    let sampleFn, col, al = .76;

    if (s <= 1) {
      // Dissolució / química: corbes suaus aire ↔ capa superficial marina
      const sx = lerp(g.ox0 + 4, g.w - 8, p.u);
      const enter = p.kind === 0;
      const sy = enter ? lerp(g.h * .05, g.y0 * .48, p.v) : lerp(g.y0 + 8, g.mix - 4, p.v);
      const ey = enter ? lerp(g.y0 + 8, g.mix - 2, p.w) : lerp(g.h * .08, g.y0 * .52, p.w);
      const sway = (p.w - .5) * (mob ? 18 : 28);
      sampleFn = q => [
        bez(sx, sx + sway, sx - sway * .6, sx + sway * .4, q),
        bez(sy, lerp(sy, ey, .4), lerp(sy, ey, .7), ey, q)
      ];
      col = enter ? (s === 1 && t1 > .55 ? (p.w > .72 ? C.vermell : C.blauFosc) : C.blau) : C.ink2;
      al = enter ? .74 : .46;
    } else if (s === 2) {
      // Circulació profunda: llaç termohalí lent
      sampleFn = q => {
        const pt = loopPosB((q + p.u) % 1, p.v, g);
        return [pt[0] + Math.sin(q * 6 + p.ph) * 1.3, pt[1] + Math.cos(q * 5 + p.ph) * 1.1];
      };
      col = p.v < .35 ? C.blauFosc : C.blau;
      al = .72;
    } else if (s === 3) {
      // Bomba biològica: neu marina caient suaument cap a l'abisme
      const sx = lerp(g.ox0 + 6, g.w - 10, p.u);
      const sy = lerp(g.y0 + 6, g.mix * .95, p.v * .5);
      const ey = lerp(g.deep, g.h - 6, p.w);
      const drift = (p.v - .5) * 16;
      sampleFn = q => [
        sx + Math.sin(q * 5 + p.ph) * 4 + drift * q,
        lerp(sy, ey, q)
      ];
      col = p.w > .5 ? C.grocFosc : C.blau;
      al = .68;
    } else if (s === 4) {
      // Fotosíntesi (cap a les capçades) vs Respiració (cap amunt des del sòl)
      const photo = p.kind === 0;
      const tr = g.trees[Math.floor(p.u * g.trees.length) % g.trees.length];
      if (photo) {
        const sx = lerp(g.w * .02, g.shore - g.w * .03, p.u);
        const sy = lerp(g.h * .04, g.y0 * .38, p.v);
        const tx = tr[0] + (p.w - .5) * g.tr * 1.6;
        const ty = g.y0 - g.h * .12 * tr[1] - g.tr * .18;
        sampleFn = q => [
          bez(sx, lerp(sx, tx, .35), lerp(sx, tx, .75), tx, q),
          bez(sy, lerp(sy, ty, .25) - 6, lerp(sy, ty, .75), ty, q)
        ];
        col = t1 > .55 ? C.grocFosc : C.ink2;
        al = .72;
      } else {
        const sx = lerp(g.w * .04, g.shore - g.w * .08, p.u);
        const sy = g.y0 + 3 + p.v * 10;
        const tx = sx + (p.w - .5) * 24;
        const ty = lerp(g.h * .08, g.y0 * .52, p.w);
        sampleFn = q => [lerp(sx, tx, q) + Math.sin(q * 5 + p.ph) * 2.5, lerp(sy, ty, q)];
        col = C.muted;
        al = .44;
      }
    } else {
      // Pas 5: La terra dona i pren (absorció vegetal vs tala/incendis)
      const fire = p.kind === 1;
      if (fire) {
        const sx = lerp(g.fire[0], g.fire[1], p.u);
        const sy = g.y0 - 1;
        const tx = sx + (p.v - .25) * 44;
        const ty = lerp(g.h * .05, g.y0 * .42, p.w);
        sampleFn = q => [
          bez(sx, sx + (p.v - .3) * 14, tx - 6, tx, q),
          bez(sy, lerp(sy, ty, .45), lerp(sy, ty, .8), ty, q)
        ];
        col = C.vermell;
        al = .76;
      } else {
        const tr = g.trees[Math.floor(p.u * g.trees.length) % g.trees.length];
        const sx = lerp(g.w * .02, g.shore - g.w * .06, p.u);
        const sy = lerp(g.h * .04, g.y0 * .38, p.v);
        const tx = tr[0] + (p.w - .5) * g.tr * 1.5;
        const ty = g.y0 - g.h * .12 * tr[1] - g.tr * .18;
        sampleFn = q => [
          bez(sx, lerp(sx, tx, .35), lerp(sx, tx, .75), tx, q),
          bez(sy, lerp(sy, ty, .25) - 5, lerp(sy, ty, .75), ty, q)
        ];
        col = t1 > .55 ? C.grocFosc : C.ink2;
        al = .68;
      }
    }

    const q0 = sampleFn(t0);
    const q1 = sampleFn(t0 + (t1 - t0) * .35);
    const q2 = sampleFn(t0 + (t1 - t0) * .7);
    const q3 = sampleFn(t1);
    const a = al * fade * fa;

    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.globalAlpha = a * .52;
    ctx.lineWidth = p.pw;
    ctx.beginPath();
    ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.lineTo(q3[0], q3[1]);
    ctx.stroke();

    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(q3[0], q3[1], p.pw * .72, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderOverlayB() {
  if (!B.ov || !B.W) return;
  const s = B.step, g = geoB(B.W, B.H, s >= 4 ? 1 : 0), mob = g.mob, ov = B.ov;
  ov.selectAll("*").remove();

  // Etiquetes silencioses de medi + batimetria
  V.t(ov, 8, 15, "Atmosfera", { size: 11.5, italic: true, fill: C.muted });
  V.t(ov, g.w - 6, g.y0 + 14, mob ? "Superfície" : "Capa de mescla (~200 m)", { size: 11, italic: true, fill: C.blau, anchor: "end", halo: true });
  if (!mob) {
    V.t(ov, g.w - 6, g.deep - 4, "−2.000 m", { size: 11, italic: true, fill: C.blauFosc, anchor: "end", halo: true });
  }
  V.t(ov, g.w - 6, g.h - 8, "Oceà profund", { size: 11, italic: true, fill: C.blauFosc, anchor: "end", halo: true });
  V.t(ov, 8, g.h - 8, "Terra i sòl", { size: 11, italic: true, fill: C.ink2 });

  // Anotacions quirúrgiques IBV.note per pas (màx. 2 a mòbil, totes dins marge)
  if (s === 0) {
    const mx = g.ox0 + (g.w - g.ox0) * .48;
    if (mob) {
      V.note(ov, { x: mx - 12, y: g.y0 + 3, tx: clamp(mx - 24, 126, g.w - 8), ty: Math.max(28, g.y0 - 40), kind: "curve", bend: -10, anchor: "end", size: 11,
        lines: [["En entra més", true, C.blau], ["per pressió de CO₂"]] });
    } else {
      V.note(ov, { x: mx - 12, y: g.y0 + 4, tx: mx - 38, ty: g.y0 - 46, kind: "curve", bend: -14, anchor: "end",
        lines: [["En entra més", true, C.blau], ["per pressió de CO₂"]] });
      V.note(ov, { x: mx + 14, y: g.y0 - 4, tx: mx + 40, ty: g.y0 - 34, kind: "curve", bend: 12, anchor: "start",
        lines: [["En surt menys", false, C.ink2]] });
    }
  } else if (s === 1) {
    const cx = g.ox0 + (g.w - g.ox0) * .5, cy = g.mix + (g.h - g.mix) * .40;
    if (mob) {
      V.t(ov, g.w - 8, cy - 12, "CO₂ + H₂O + CO₃²⁻ → 2 HCO₃⁻", { size: 11.5, weight: 700, fill: C.ink, anchor: "end", halo: 3.5 });
      V.t(ov, g.w - 8, cy + 6, "pH −0,1 · +26 % d'acidesa", { size: 11, weight: 700, fill: C.vermell, anchor: "end", halo: 3.5 });
    } else {
      V.t(ov, cx, cy - 14, "CO₂ + H₂O + CO₃²⁻ → 2 HCO₃⁻", { size: 14.5, weight: 700, fill: C.ink, anchor: "middle", halo: 4 });
      V.t(ov, cx, cy + 6, "El carbonat es converteix en bicarbonat", { size: 12, fill: C.ink2, anchor: "middle", halo: 3.5 });
      V.t(ov, cx, cy + 26, "pH superficial: −0,1 unitats (+26 % acidesa)", { size: 12, weight: 700, fill: C.vermell, anchor: "middle", halo: 3.5 });
    }
  } else if (s === 2) {
    const p1 = loopPosB(.25, .5, g), p2 = loopPosB(.5, 0, g);
    V.note(ov, { x: p1[0], y: p1[1], tx: clamp(p1[0] - 16, 130, g.w - 8), ty: Math.max(28, p1[1] - 26), kind: "curve", bend: -10, anchor: "end", size: mob ? 11 : 12.5,
      lines: [["L'aigua freda s'enfonsa", true, C.blau], ["i arrossega el carboni"]] });
    V.t(ov, mob ? g.w - 8 : p2[0], Math.min(g.h - 22, p2[1] + 10), mob ? "Dècades–mil·lennis (> 2.000 m)" : "Dècades a mil·lennis al fons (> 2.000 m)", {
      size: mob ? 11 : 12, weight: 700, fill: C.ink, anchor: mob ? "end" : "middle", halo: 3.5
    });
  } else if (s === 3) {
    V.note(ov, { x: g.ox0 + 26, y: g.y0 + 12, tx: g.ox0 + 34, ty: Math.max(26, g.y0 - 30), kind: "curve", bend: -8, anchor: "start", size: mob ? 11 : 12.5,
      lines: [["Fitoplàncton", true], ["fixa carboni a la llum"]] });
    V.note(ov, { x: g.ox0 + (g.w - g.ox0) * .56, y: g.mix + (g.h - g.mix) * .42, tx: g.w - 10, ty: g.mix + (g.h - g.mix) * .20, kind: "curve", bend: 10, anchor: "end", size: mob ? 11 : 12.5,
      lines: [["Neu marina", true], ["sobretot carboni natural"]] });
  } else if (s === 4) {
    const t1 = g.trees[1];
    V.note(ov, { x: t1[0], y: g.y0 - g.h * .13, tx: t1[0] + (mob ? 16 : 24), ty: Math.max(28, g.y0 - g.h * .29), kind: "curve", bend: 12, anchor: "start", size: mob ? 11 : 12.5,
      lines: [["Fotosíntesi", true], ["~12 Gt/any per fertilització"]] });
    V.t(ov, 10, g.y0 + 18, "Respiració de plantes i sòl ↑", { size: 11, fill: C.ink2, halo: true });
  } else if (s === 5) {
    const fx = (g.fire[0] + g.fire[1]) / 2;
    if (mob) {
      V.t(ov, 8, Math.max(30, g.y0 - g.h * .36), `Absorció vegetal: −${f1(R25.L)} Gt`, { size: 11, weight: 700, fill: C.ink, halo: 3.2 });
      V.note(ov, { x: fx, y: g.y0 - 10, tx: g.w - 8, ty: Math.max(54, g.y0 - g.h * .20), kind: "curve", bend: 10, anchor: "end", size: 11,
        lines: [[`Tala i incendis: +${f1(R25.U)} Gt`, true, C.vermell]] });
    } else {
      V.note(ov, { x: fx, y: g.y0 - 12, tx: fx + 20, ty: g.y0 - g.h * .28, kind: "curve", bend: 12, anchor: "start",
        lines: [[`Tala i incendis: +${f1(R25.U)} Gt`, true, C.vermell]] });
      V.t(ov, 10, g.y0 - g.h * .28, `Absorció vegetal: −${f1(R25.L)} Gt`, { size: 12.5, weight: 700, fill: C.ink, halo: 3.5 });
    }
  }
}

const bPlot = document.getElementById("bPlot");
const bTip = V.tip(bPlot);
V.mount(bPlot, (el, w) => {
  if (B.loopH) { B.loopH.stop(); B.loopH = null; }
  const mob = w < 600;
  const h = mob ? scrollyMobH() : Math.round(clamp(w * .60, 350, 440));
  B.W = w; B.H = h;
  B.g = geoB(w, h);
  const lay = hybridLayer(el, w, h, "Tall científic de l'oceà i el bosc: dissolució del CO₂ a la superfície marina, química del carbonat, circulació profunda, bomba biològica, fotosíntesi i emissions per tala.");
  B.ctx = lay.ctx; B.svg = lay.svg;
  B.ov = lay.svg.append("g");
  initB(B.step);
  renderOverlayB();

  V.hover(lay.svg.node(), (ev, [px, py]) => {
    const g = B.g;
    if (py < g.y0) bTip.show("<b>Atmosfera</b> · 427,7 ppm previstos el 2026 (+54 % respecte a l'era preindustrial)");
    else if (px < g.shore) bTip.show(`<b>Terra i vegetació</b> · El 2025: −${f1(R25.L)} Gt absorbides, +${f1(R25.U)} Gt per tala`);
    else if (py < g.mix) bTip.show(`<b>Capa superficial marina</b> · El 2025: −${f1(R25.O)} Gt absorbides · pH −0,1 unitats`);
    else bTip.show("<b>Oceà profund</b> · Carboni guardat de dècades a mil·lennis · acidificació > 2.000 m");
  }, () => bTip.hide());

  B.loopH = V.loop(el, drawB);
});

function onStepB(i) {
  B.step = i; B.stepT = 0;
  if (B.W) { B.g = geoB(B.W, B.H); initB(i); renderOverlayB(); }
  document.getElementById("bTitle").textContent = B_TXT[i][0];
  document.getElementById("bVal").textContent = B_TXT[i][1];
  if (RM) drawB(0, 0);
}

/* =====================================================================
   3. CORBA DE KEELING — DOBLE VISTA .seg:
      (a) «Sèrie i zoom» (IB-01) · 1958–2026 + ampliació interactiva
      (b) «Espiral respiratòria» (IB-05) · 68 voltes sobre IBV.polarGrid
   ===================================================================== */
const K = {
  mode: "series",
  w0: 2022.75, span: 4,
  data: D.M.map((v, i) => {
    const mi = D.M0[1] - 1 + i, y = D.M0[0] + Math.floor(mi / 12), m = mi % 12;
    return { t: y + (m + .5) / 12, y, m, v, d: D.MD[i] };
  })
};
K.tmin = K.data[0].t - .04;
K.tmax = K.data[K.data.length - 1].t + .04;
const KMAX = K.data.reduce((a, b) => b.v > a.v ? b : a);
const K_RAMP = d3.scaleSequential(d3.piecewise(d3.interpolateLab, [C.blauClar, C.blau, C.vermellClar, C.vermell])).domain([315, 432]).clamp(true);

function renderKeelingLegend() {
  const kLg = document.getElementById("kLg");
  kLg.innerHTML = "";
  if (K.mode === "series") {
    V.legendCat(kLg, [
      { c: C.ink, t: "Mitjana mensual", kind: "line", w: 1.8 },
      { c: C.muted, t: "Sense estacionalitat", kind: "line", w: 1.3, dash: "3 3" },
      { c: C.vermell, t: "Màxim (maig)" },
      { c: C.blau, t: "Mínim (set.–oct.)" }
    ]);
  } else {
    V.legendRamp(kLg, {
      scale: K_RAMP, min: 315, max: 432, ticks: [320, 360, 400, 430],
      f: v => f0(v), title: "Concentració (ppm)", lo: "1958", hi: "2026", w: 160
    });
  }
}
renderKeelingLegend();

const kPlot = document.getElementById("kPlot");
const kTip = V.tip(kPlot);

function drawKeelingSeries(el, w) {
  const mob = w < 640;
  const ml = mob ? 8 : 10, mr = mob ? 8 : 12;
  const top = 22, oh = mob ? 105 : 134, gap = mob ? 48 : 56, dh = mob ? 225 : 292;
  const H = top + oh + gap + dh + 28;
  const dy = top + oh + gap;

  const svg = V.svg(el, w, H, "Corba de Keeling: concentració mensual de CO₂ a Mauna Loa des del març del 1958 (315,7 ppm) fins al maig del 2026 (432,3 ppm), amb ampliació interactiva del cicle estacional.");
  const defs = svg.append("defs");
  const uid = "k1" + Math.random().toString(36).slice(2, 6);

  const xo = d3.scaleLinear([K.tmin, K.tmax], [ml, w - mr]);
  const yo = d3.scaleLinear([310, 445], [top + oh, top]);

  // Degradat d'aquarel·la blau → vermell sota la corba de 68 anys
  addLinearGrad(defs, uid + "ov", ml, 0, w - mr, 0, [
    ["0%", C.blauClar, .14],
    ["55%", C.blau, .10],
    ["100%", C.vermell, .20]
  ]);

  // Panell superior: tota la sèrie 1958–2026
  const go = svg.append("g");
  V.gridY(go, yo, ml, w - mr, [320, 360, 400, 440], v => f0(v), { unit: " ppm" });
  V.axisX(go, xo, top + oh, mob ? [1960, 1980, 2000, 2020] : [1960, 1970, 1980, 1990, 2000, 2010, 2020], d => String(d));

  const ovArea = go.append("path").datum(K.data)
    .attr("fill", `url(#${uid}ov)`).style("mix-blend-mode", "multiply")
    .attr("d", d3.area().x(d => xo(d.t)).y0(top + oh).y1(d => yo(d.v)));

  const ovLine = go.append("path").datum(K.data)
    .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.35)
    .attr("d", d3.line().x(d => xo(d.t)).y(d => yo(d.v)));

  const f0Pt = K.data[0];
  V.note(go, {
    x: xo(f0Pt.t), y: yo(f0Pt.v), tx: xo(f0Pt.t) + (mob ? 18 : 26), ty: yo(f0Pt.v) - (mob ? 34 : 42),
    kind: "curve", bend: -10, anchor: "start", dot: true,
    lines: [[`${f1(f0Pt.v)} ppm`, true], ["març del 1958"]]
  });
  V.note(go, {
    x: xo(KMAX.t), y: yo(KMAX.v), tx: xo(KMAX.t) - (mob ? 24 : 38), ty: yo(KMAX.v) + (mob ? 22 : 16),
    kind: "curve", bend: 12, anchor: "end", dot: true, stroke: C.vermell,
    lines: [[`${f1(KMAX.v)} ppm`, true, C.vermell], [`${MONTHS[KMAX.m]} del ${KMAX.y}`]]
  });

  // Finestra arrossegable + connectors fins
  const win = go.append("rect").attr("y", top).attr("height", oh)
    .attr("fill", V.alpha(C.vermell, .10)).attr("stroke", C.vermell).attr("stroke-width", 1.1)
    .style("cursor", "grab").attr("tabindex", 0).attr("role", "slider")
    .attr("aria-label", "Finestra de l'ampliació; arrossega o fes servir les fletxes");
  const winLab = V.t(go, 0, top + oh + 32, "", { size: 12, weight: 700, fill: C.vermell, anchor: "middle", halo: true });
  const c1 = svg.append("line").attr("stroke", C.vermell).attr("stroke-width", .7).attr("stroke-opacity", .45);
  const c2 = svg.append("line").attr("stroke", C.vermell).attr("stroke-width", .7).attr("stroke-opacity", .45);

  // Panell inferior: ampliació de 4 anys amb banda respiratòria d'aquarel·la
  const gd = svg.append("g");
  const gyG = gd.append("g"), gxG = gd.append("g");
  const gmk = gd.append("rect").attr("fill", C.grid).attr("opacity", .72);
  const gmkT = V.t(gd, 0, dy + dh - 8, "", { size: 11, fill: C.muted, anchor: "middle" });
  const envUp = gd.append("path").attr("fill", C.vermell).attr("fill-opacity", .12).style("mix-blend-mode", "multiply");
  const envDn = gd.append("path").attr("fill", C.blau).attr("fill-opacity", .12).style("mix-blend-mode", "multiply");
  const pd = gd.append("path").attr("fill", "none").attr("stroke", C.muted).attr("stroke-width", 1.25).attr("stroke-dasharray", "3 3");
  const pv = gd.append("path").attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.85);
  const dotsG = gd.append("g"), labsG = gd.append("g");
  const hvG = gd.append("g").style("pointer-events", "none");
  const hit = gd.append("rect").attr("class", "hit").attr("x", ml).attr("y", dy).attr("width", w - ml - mr).attr("height", dh).attr("fill", "transparent");

  let xd, yd, sub = [];

  function setK(w0) {
    w0 = clamp(w0, K.tmin, K.tmax - K.span);
    K.w0 = w0;
    win.attr("x", xo(w0)).attr("width", xo(w0 + K.span) - xo(w0))
      .attr("aria-valuetext", `${Math.floor(w0)}–${Math.floor(w0 + K.span)}`);
    winLab.attr("x", clamp((xo(w0) + xo(w0 + K.span)) / 2, ml + 34, w - mr - 34))
      .text(`${Math.floor(w0 + .04)}–${Math.floor(w0 + K.span - .04)}`);
    c1.attr("x1", xo(w0)).attr("y1", top + oh).attr("x2", ml).attr("y2", dy - 2);
    c2.attr("x1", xo(w0 + K.span)).attr("y1", top + oh).attr("x2", w - mr).attr("y2", dy - 2);

    sub = K.data.filter(d => d.t >= w0 - .05 && d.t <= w0 + K.span + .05);
    const lo = d3.min(sub, d => Math.min(d.v, d.d)), hi = d3.max(sub, d => Math.max(d.v, d.d));
    xd = d3.scaleLinear([w0, w0 + K.span], [ml, w - mr]);
    yd = d3.scaleLinear([Math.floor(lo - 1), Math.ceil(hi + 1.4)], [dy + dh, dy + 16]);

    gyG.selectAll("*").remove();
    gxG.selectAll("*").remove();
    V.gridY(gyG, yd, ml, w - mr, yd.ticks(mob ? 4 : 5), v => f0(v), { unit: " ppm" });
    const yrs = d3.range(Math.ceil(w0), Math.floor(w0 + K.span) + 1);
    V.axisX(gxG, xd, dy + dh, yrs, d => String(d));

    const mk0 = 2022 + 11 / 12, mk1 = 2023 + 6.13 / 12, a0 = Math.max(mk0, w0), a1 = Math.min(mk1, w0 + K.span);
    if (a1 > a0) {
      gmk.attr("x", xd(a0)).attr("width", xd(a1) - xd(a0)).attr("y", dy + 16).attr("height", dh - 16).attr("opacity", .65);
      gmkT.attr("x", xd((a0 + a1) / 2)).text(mob ? "Maunakea" : "mesures a Maunakea");
    } else {
      gmk.attr("opacity", 0); gmkT.text("");
    }

    // Banda respiratòria d'aquarel·la: vermell quan el cicle supera la tendència (exhalació), blau quan baixa (inhalació)
    envUp.attr("d", d3.area().x(d => xd(d.t)).y0(d => yd(d.d)).y1(d => yd(Math.max(d.v, d.d))).curve(d3.curveMonotoneX)(sub));
    envDn.attr("d", d3.area().x(d => xd(d.t)).y0(d => yd(d.d)).y1(d => yd(Math.min(d.v, d.d))).curve(d3.curveMonotoneX)(sub));

    pv.attr("d", d3.line().x(d => xd(d.t)).y(d => yd(d.v)).curve(d3.curveMonotoneX)(sub));
    pd.attr("d", d3.line().x(d => xd(d.t)).y(d => yd(d.d)).curve(d3.curveMonotoneX)(sub));

    dotsG.selectAll("circle").data(sub, d => d.t).join("circle")
      .attr("r", d => (d.m === 4 || d.m === 8 || d.m === 9) ? (mob ? 3.2 : 3.8) : (mob ? 1.9 : 2.3))
      .attr("cx", d => xd(d.t)).attr("cy", d => yd(d.v))
      .attr("fill", d => d.m === 4 ? C.vermell : (d.m === 8 || d.m === 9) ? C.blau : C.ink)
      .attr("fill-opacity", d => (d.m === 4 || d.m === 8 || d.m === 9) ? .92 : .58);

    labsG.selectAll("*").remove();
    const mm = [];
    yrs.concat([Math.floor(w0)]).forEach(y => {
      const ys = sub.filter(d => d.y === y);
      if (ys.length < 10) return;
      const mx = ys.reduce((a, b) => b.v > a.v ? b : a);
      const mn = ys.reduce((a, b) => b.v < a.v ? b : a);
      mm.push({ d: mx, t: MSH[mx.m], c: C.vermell, up: true }, { d: mn, t: MSH[mn.m], c: C.blau, up: false });
    });
    [...new Map(mm.map(l => [l.d.t, l])).values()].forEach(l => {
      V.t(labsG, xd(l.d.t), yd(l.d.v) + (l.up ? -9 : 16), l.t, { size: 11.5, weight: 700, fill: l.c, anchor: "middle", halo: true });
    });

    let ys0 = null;
    for (const y of yrs) {
      const q = sub.filter(d => d.y === y);
      if (q.length >= 12 && q.reduce((a, b) => b.v > a.v ? b : a).m === 4) { ys0 = q; break; }
    }
    if (ys0 && !mob) {
      const mx = ys0.reduce((a, b) => b.v > a.v ? b : a);
      const mn = ys0.reduce((a, b) => b.v < a.v ? b : a);
      V.note(labsG, {
        x: xd(mx.t), y: yd(mx.v) - 16, tx: xd(mx.t) + 20, ty: yd(mx.v) - 30, kind: "curve", bend: -8, anchor: "start", stroke: C.vermell,
        lines: [["Màxim al maig", true, C.vermell], ["abans que el nord reverdeixi"]]
      });
      V.note(labsG, {
        x: xd(mn.t), y: yd(mn.v) + 18, tx: xd(mn.t) + 20, ty: yd(mn.v) + 34, kind: "curve", bend: 8, anchor: "start", stroke: C.blau,
        lines: [["Mínim a la tardor", true, C.blau], ["després de l'estiu de creixement"]]
      });
    }

    d3.selectAll("#kSeg button").attr("aria-pressed", function() { return String(Math.abs(+this.dataset.y - w0) < .05); });
  }

  const drag = d3.drag()
    .on("start", function(e) { K.dx = xo.invert(e.x) - K.w0; d3.select(this).style("cursor", "grabbing"); })
    .on("drag", e => setK(xo.invert(e.x) - K.dx))
    .on("end", function() { d3.select(this).style("cursor", "grab"); });
  win.call(drag);

  go.append("rect").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", oh)
    .attr("fill", "transparent").style("cursor", "pointer").lower()
    .on("click", e => { const [x] = d3.pointer(e); setK(xo.invert(x) - K.span / 2); });

  win.on("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setK(K.w0 + (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 5 : 1));
    }
  });

  V.hover(hit.node(), (ev, [px]) => {
    const t = xd.invert(px);
    const best = d3.least(sub, d => Math.abs(d.t - t));
    if (!best) return;
    const bx = xd(best.t), by = yd(best.v);
    V.focus(dotsG.selectAll("circle"), d => d.t === best.t, { dim: .48 });
    hvG.selectAll("*").remove();
    hvG.append("line").attr("x1", bx).attr("x2", bx).attr("y1", dy + 16).attr("y2", dy + dh)
      .attr("stroke", C.ink).attr("stroke-width", .75).attr("stroke-dasharray", "2 2");
    hvG.append("circle").attr("cx", bx).attr("cy", by).attr("r", 5.5)
      .attr("fill", best.m === 4 ? C.vermell : (best.m === 8 || best.m === 9) ? C.blau : C.ink)
      .attr("stroke", C.ink).attr("stroke-width", 1.5);
    kTip.show(`<b>${MONTHS[best.m]} ${best.y}</b> · ${f2(best.v)} ppm (sense estacionalitat: ${f2(best.d)} ppm)`);
  }, () => {
    V.focus(dotsG.selectAll("circle"), null);
    hvG.selectAll("*").remove();
    kTip.hide();
  });

  el._setK = setK;
  setK(K.w0);

  V.onView(el, inst => {
    if (inst) return;
    const L = ovLine.node().getTotalLength();
    ovLine.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
      .transition().duration(1000).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0)
      .on("end", () => ovLine.attr("stroke-dasharray", null));
    ovArea.style("opacity", 0).transition().delay(380).duration(600).style("opacity", 1);
  });
}

function drawKeelingSpiral(el, w) {
  const mob = w < 640;
  const S = Math.min(w, mob ? Math.min(w, 360) : 540);
  const h = S + (mob ? 18 : 26);
  const cx = w / 2, cy = h / 2, R = S / 2 - (mob ? 24 : 34);

  const svg = V.svg(el, w, h, "Espiral respiratòria anual de la corba de Keeling (1958–2026): 68 voltes mensuals de 315,7 ppm en blau pàl·lid fins a 432,3 ppm en vermell intens, amb gener a dalt.");
  const g = svg.append("g");

  // Retícula polar ultra-fina (0,5 px, gener a dalt)
  V.polarGrid(g, cx, cy, R, 5, 12, { stroke: C.grid, outer: C.hair, rIn: R * .10 });

  const r = d3.scaleLinear([312, 434], [R * .10, R]);
  const A = m => m / 12 * 2 * Math.PI;
  const P = (m, v) => [cx + r(v) * Math.sin(A(m)), cy - r(v) * Math.cos(A(m))];

  // Etiquetes dels 12 mesos al perímetre
  d3.range(12).forEach(m => {
    const [lx, ly] = [cx + (R + (mob ? 13 : 18)) * Math.sin(A(m)), cy - (R + (mob ? 13 : 18)) * Math.cos(A(m))];
    V.t(g, lx, ly + 4, mob ? V.MES1[m] : V.MES[m], {
      anchor: "middle", size: 11.5,
      fill: m === 4 ? C.vermell : (m === 8 || m === 9) ? C.blau : C.muted,
      weight: (m === 4 || m === 8 || m === 9) ? 700 : 400
    });
  });

  // 68 voltes mensuals (1958 → 2026)
  const sp = d3.line().curve(d3.curveCatmullRom.alpha(.5));
  const byYr = d3.groups(K.data, d => d.y);
  const yrMap = new Map(byYr);
  const pathsG = g.append("g");

  const yrPaths = pathsG.selectAll("path.sp").data(byYr).join("path")
    .attr("class", "sp")
    .attr("d", ([yr, ms]) => {
      const nextJan = K.data.find(d => d.y === yr + 1 && d.m === 0);
      const pts = ms.concat(nextJan ? [nextJan] : []).map(d => P(d.m, d.v));
      return sp(pts);
    })
    .attr("fill", "none")
    .attr("stroke", ([yr, ms]) => yr >= LAST ? C.vermell : K_RAMP(d3.mean(ms, d => d.v)))
    .attr("stroke-width", ([yr]) => yr >= LAST ? 2.3 : (mob ? 1.05 : 1.2))
    .attr("stroke-opacity", ([yr]) => yr >= LAST ? 1 : .86)
    .attr("stroke-linecap", "round");

  // Escala radial en ppm (amb halo blanc)
  [330, 360, 390, 420].forEach((v, i) => {
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", r(v))
      .attr("fill", "none").attr("stroke", C.hair).attr("stroke-width", .55).attr("stroke-dasharray", "2 3");
    V.t(g, cx + 4, cy - r(v) + 11, f0(v) + (i === 3 ? " ppm" : ""), { size: 11, fill: C.muted, halo: 3 });
  });

  // Anotacions quirúrgiques (1958 i maig 2026)
  const annG = g.append("g").style("pointer-events", "none");
  const first = K.data[0];
  const [fx, fy] = P(first.m, first.v);
  V.note(annG, {
    x: fx, y: fy, tx: cx - (mob ? 38 : 66), ty: cy + (mob ? 14 : 20),
    kind: "curve", bend: -10, anchor: "end", dot: true, size: mob ? 11 : 12,
    lines: [["1958", true], [f1(first.v) + " ppm"]]
  });
  const [mx, my] = P(KMAX.m, KMAX.v);
  V.note(annG, {
    x: mx, y: my, tx: clamp(mx + (mob ? -10 : 34), 90, w - 12), ty: Math.min(h - 16, my + (mob ? 26 : 18)),
    kind: "curve", bend: 10, anchor: mob ? "end" : "start", dot: true, stroke: C.vermell, size: mob ? 11 : 12,
    lines: [[`${MSH[KMAX.m]} 2026`, true, C.vermell], [f1(KMAX.v) + " ppm"]]
  });

  // Hover interactiu per any/mes sobre els 823 punts mensuals
  const pts = K.data.map(d => ({ d, p: P(d.m, d.v) }));
  const hvG = g.append("g").style("pointer-events", "none");
  const hit = svg.append("rect").attr("class", "hit").attr("width", w).attr("height", h).attr("fill", "transparent");

  V.hover(hit.node(), (ev, [px, py]) => {
    const best = d3.least(pts, o => (o.p[0] - px) ** 2 + (o.p[1] - py) ** 2);
    if (!best) return;
    const yr = best.d.y, ms = yrMap.get(yr) || [];
    V.focus(yrPaths, ([y]) => y === yr, { dim: .48 });
    yrPaths.filter(([y]) => y === yr).raise()
      .attr("stroke-width", 2.5).attr("stroke", yr >= LAST ? C.vermell : C.ink);
    yrPaths.filter(([y]) => y !== yr)
      .attr("stroke-width", ([y]) => y >= LAST ? 2.2 : (mob ? 1.05 : 1.2))
      .attr("stroke", ([y, m]) => y >= LAST ? C.vermell : K_RAMP(d3.mean(m, d => d.v)));

    hvG.selectAll("*").remove();
    hvG.append("line").attr("x1", cx).attr("y1", cy).attr("x2", best.p[0]).attr("y2", best.p[1])
      .attr("stroke", C.ink).attr("stroke-width", .75).attr("stroke-dasharray", "2 2");
    hvG.append("circle").attr("cx", best.p[0]).attr("cy", best.p[1]).attr("r", 4.8)
      .attr("fill", K_RAMP(best.d.v)).attr("stroke", C.ink).attr("stroke-width", 1.5);
    V.lines(hvG, cx, cy - 5, [[String(yr), true], [`${f1(d3.mean(ms, d => d.v))} ppm`]], {
      anchor: "middle", size: 12, halo: 3.5
    });

    const prev = K.data.find(q => q.y === yr - 1 && q.m === best.d.m);
    const diff = prev ? ` (${V.signed(best.d.v - prev.v, 2)} ppm vs ${yr - 1})` : "";
    kTip.show(`<b>${MONTHS[best.d.m]} ${yr}</b> · ${f2(best.d.v)} ppm${diff}`);
  }, () => {
    V.focus(yrPaths, null);
    yrPaths.attr("stroke-width", ([y]) => y >= LAST ? 2.3 : (mob ? 1.05 : 1.2))
      .attr("stroke", ([y, m]) => y >= LAST ? C.vermell : K_RAMP(d3.mean(m, d => d.v)));
    hvG.selectAll("*").remove();
    kTip.hide();
  });

  // Animació d'entrada suau (espiral que floreix del 1958 al 2026)
  if (!RM) {
    yrPaths.style("opacity", 0).transition().delay((_, i) => i * 11).duration(420).style("opacity", 1);
  }
}

const kMount = V.mount(kPlot, (el, w) => {
  kTip.hide();
  if (K.mode === "series") drawKeelingSeries(el, w);
  else drawKeelingSpiral(el, w);
});

document.querySelectorAll("#kMode button").forEach(b => b.addEventListener("click", () => {
  const m = b.dataset.m;
  if (m === K.mode) return;
  K.mode = m;
  document.querySelectorAll("#kMode button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  const kSeg = document.getElementById("kSeg");
  if (kSeg) kSeg.hidden = m !== "series";
  renderKeelingLegend();
  kMount.redraw();
}));

document.querySelectorAll("#kSeg button").forEach(b => b.addEventListener("click", () => {
  if (K.mode === "series" && kPlot._setK) kPlot._setK(+b.dataset.y);
}));

/* =====================================================================
   4. ANYS BONS I ANYS DOLENTS — IB-38 CERCLES TRANSLÚCIDS + IB-02 ONI
      1959–2026: cercles d'aquarel·la multiply per atmosfera / oceà / terra,
      línia d'emissions totals al damunt i tira de pulsacions ONI a sota.
   ===================================================================== */
const Y = { sel: 2025, rows: ROWS.filter(r => r.y >= 1959) };
const ONI_DIV = V.div(1.6);

const NOTES = {
  1983: "El Niño molt fort del 1982–83.",
  1987: "El Niño del 1986–88. L'aire es va quedar el 76 % de les emissions, el màxim de la sèrie.",
  1991: "Al juny va esclatar el Pinatubo, a les Filipines. Probablement la terra va absorbir més del que reprodueixen els models: d'aquí el gran desquadrament.",
  1992: "L'any després del Pinatubo, l'aire només es va quedar el 19 %. Els models no ho reprodueixen: el desquadrament és molt gran.",
  1997: "Comença El Niño del 1997–98, un dels més forts del segle XX. Grans incendis a Indonèsia.",
  1998: "El Niño va tocar sostre a finals del 1997 (ONI +2,4), però el CO₂ es va disparar el 1998: va pujar 2,8 ppm.",
  2015: "El Niño fort del 2015–16. Incendis de torberes al sud-est asiàtic.",
  2016: "El Niño va tocar sostre a l'hivern del 2015 al 2016. El CO₂ mundial va pujar gairebé tant com el 2015: 2,8 ppm. A Mauna Loa, 3,0 ppm, el rècord fins aleshores.",
  2023: "Arriba El Niño. Sequera a l'Amazònia i incendis rècord al Canadà.",
  2024: "El Niño va durar fins a la primavera. Rècord de creixement del CO₂ mundial: 3,8 ppm. Els models probablement sobreestimen l'absorció de la terra.",
  2025: "Recuperació: l'embornal terrestre més gran del registre.",
  2026: "Projecció. L'embornal terrestre es calcula com la resta dels altres termes, sense desquadrament. Comença un El Niño fort; l'efecte sobre el CO₂ es notarà sobretot el 2027."
};

const yLg = document.getElementById("yLg");
V.legendCat(yLg, [
  { c: PAL.air, t: "Atmosfera (àrea = Gt)", a: .48 },
  { c: PAL.ocean, t: "Oceà", a: .48 },
  { c: PAL.land, t: "Terra", a: .58 },
  { c: C.ink, t: "Emissions totals", kind: "line", w: 1.5 }
]);
V.legendRamp(yLg, {
  scale: ONI_DIV, min: -1.6, max: 1.6, ticks: [-1, 0, 1],
  f: v => V.signed(v, 0), title: "Índex ONI (°C)", lo: "La Niña", hi: "El Niño", w: 140
});

const yPlot = document.getElementById("yPlot");
const yTip = V.tip(yPlot);

function renderYearPanel(yr) {
  const r = BY[yr], o = ONI(yr);
  const row = (n, v, col, dash) => {
    const p = v / r.E;
    const bg = dash
      ? `repeating-linear-gradient(90deg,${C.muted} 0 3px,transparent 3px 5px)`
      : col;
    return `<div class="yp-row"><span>${n}</span><span class="bar"><i style="width:${clamp(Math.abs(p), 0, 1) * 100}%;background:${bg}"></i></span><span class="v">${v < 0 ? "−" : ""}${f1(Math.abs(v))} Gt · ${v < 0 ? "−" : ""}${Math.round(Math.abs(p) * 100)} %</span></div>`;
  };
  document.getElementById("yPanel").innerHTML =
    `<h3>${yr}${yr === LAST ? " · projecció" : ""}</h3>` +
    `<p class="em">Emissions: ${f1(r.E)} Gt de CO₂${o != null ? ` · ONI mitjà: ${V.signed(o, 2)} °C` : ""}</p>` +
    `<div class="yp-rows">${row("Es queda a l'aire", r.A, PAL.air)}${row("Oceà", r.O, PAL.ocean)}${row("Terra", r.L, PAL.land)}${yr === LAST ? "" : row("Desquadrament", r.B, PAL.imb, true)}</div>` +
    (NOTES[yr] ? `<p class="yp-note">${NOTES[yr]}</p>` : "");
  d3.selectAll("#ySeg button").attr("aria-pressed", function() { return String(+this.dataset.y === yr); });
}

V.mount(yPlot, (el, w) => {
  const mob = w < 560;
  const ml = mob ? 8 : 10, mr = mob ? 8 : 12, top = 26, ch = mob ? 225 : 295;
  const gap = 22, oniH = mob ? 44 : 54, bot = 24;
  const H = top + ch + gap + oniH + bot;

  const svg = V.svg(el, w, H, "Cercles translúcids anuals del repartiment del CO₂ (1959–2026) per atmosfera, oceà i terra comparats amb les emissions totals, i tira de pulsacions de l'índex ONI d'El Niño a sota.")
    .attr("tabindex", 0);
  const defs = svg.append("defs");
  const uid = "y38" + Math.random().toString(36).slice(2, 6);
  const gA = addWashGrad(defs, uid + "a", PAL.air, .48, .26, .06);
  const gO = addWashGrad(defs, uid + "o", PAL.ocean, .44, .22, .05);
  const gL = addWashGrad(defs, uid + "l", PAL.land, .56, .32, .08);

  const x = d3.scaleLinear([1959, LAST], [ml + 6, w - mr - 8]);
  const yy = d3.scaleLinear([0, 46], [top + ch, top]);
  const rS = d3.scaleSqrt([0, 32], [mob ? 2.4 : 3.0, mob ? 9.5 : 15.0]);
  const yOni = d3.scaleLinear([-1.6, 1.6], [top + ch + gap + oniH, top + ch + gap]);

  V.gridY(svg, yy, ml, w - mr, [0, 10, 20, 30, 40], v => f0(v), { zero: 0, unit: " Gt CO₂" });

  // Eix de zero i llindars per a les pulsacions ONI (IB-02)
  const oniZeroY = yOni(0);
  svg.append("line").attr("x1", ml).attr("x2", w - mr).attr("y1", oniZeroY).attr("y2", oniZeroY)
    .attr("stroke", C.ink).attr("stroke-width", .7);
  V.rule(svg, ml, w - mr, yOni(.5), { stroke: C.ghost });
  V.rule(svg, ml, w - mr, yOni(-.5), { stroke: C.ghost });
  V.t(svg, ml, top + ch + gap + 9, "El Niño (+)", { size: 11, italic: true, fill: C.muted });
  V.t(svg, ml, top + ch + gap + oniH - 2, "La Niña (−)", { size: 11, italic: true, fill: C.muted });

  // Fils suaus de connexió per llegir les trajectòries sota els cercles d'aquarel·la
  const trG = svg.append("g").style("pointer-events", "none");
  [["L", PAL.landEdge, .35], ["O", PAL.ocean, .40], ["A", PAL.air, .42]].forEach(([k, col, op]) => {
    trG.append("path").datum(Y.rows)
      .attr("fill", "none").attr("stroke", col).attr("stroke-width", .85).attr("stroke-opacity", op)
      .attr("d", d3.line().x(d => x(d.y)).y(d => yy(Math.max(0, d[k]))).curve(d3.curveMonotoneX));
  });

  // Línia nítida d'emissions totals (E)
  const emLine = svg.append("path").datum(Y.rows)
    .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.5)
    .attr("d", d3.line().x(d => x(d.y)).y(d => yy(d.E)).curve(d3.curveMonotoneX));

  // Cercles translúcids IB-38 per any + pulsacions ONI IB-02
  const yrG = svg.append("g");
  const yrGroups = yrG.selectAll("g.yg").data(Y.rows).join("g").attr("class", "yg");

  const pulseW = Math.min(2.2, Math.max(1.4, (w - ml - mr) / Y.rows.length * .42));
  yrGroups.each(function(r) {
    const q = d3.select(this), cx = x(r.y);
    const isProj = r.y === LAST;

    // Fil vertical ultra-fi fins a les emissions totals
    q.append("line").attr("x1", cx).attr("x2", cx).attr("y1", yy(0)).attr("y2", yy(r.E))
      .attr("stroke", C.grid).attr("stroke-width", .45);

    // 3 cercles translúcids d'aquarel·la (multiply): Terra, Oceà, Atmosfera
    [
      ["L", gL, PAL.landEdge, Math.max(0, r.L)],
      ["O", gO, PAL.ocean, Math.max(0, r.O)],
      ["A", gA, PAL.air, Math.max(0, r.A)]
    ].forEach(([k, fillG, rimC, val]) => {
      const cy = yy(val), rad = rS(val);
      q.append("circle").attr("class", "wc wc-" + k)
        .attr("cx", cx).attr("cy", cy).attr("r", rad)
        .attr("fill", fillG)
        .attr("fill-opacity", isProj ? .55 : 1)
        .attr("stroke", rimC).attr("stroke-width", .5).attr("stroke-opacity", isProj ? .3 : .38)
        .style("mix-blend-mode", "multiply");
      q.append("circle").attr("class", "dot")
        .attr("cx", cx).attr("cy", cy).attr("r", 1.25)
        .attr("fill", rimC).attr("fill-opacity", isProj ? .45 : .78);
    });

    // Pulsació ONI (IB-02): barres fines ≤ 2,2 px, color només fora de ±0,5 °C
    const o = ONI(r.y);
    if (o != null) {
      const strong = Math.abs(o) >= .5;
      const yTop = o >= 0 ? yOni(o) : oniZeroY;
      const hBar = Math.max(1, Math.abs(yOni(o) - oniZeroY));
      q.append("rect").attr("class", "oni")
        .attr("x", cx - pulseW / 2).attr("width", pulseW)
        .attr("y", yTop).attr("height", hBar)
        .attr("rx", .6)
        .attr("fill", strong ? ONI_DIV(o) : C.ghost);
    }
  });

  V.axisX(svg, x, top + ch + gap + oniH,
    mob ? [1960, 1980, 2000, 2020] : [1960, 1970, 1980, 1990, 2000, 2010, 2020], d => String(d));

  // Anotacions corbes quirúrgiques (Pinatubo 1992, El Niño 1998 i 2024)
  const annG = svg.append("g").style("pointer-events", "none");
  V.t(annG, x(1960), yy(BY[1960].E) - 10, "Emissions totals", { size: 11.5, weight: 600, fill: C.ink, halo: true });

  const r92 = BY[1992];
  V.note(annG, {
    x: x(1992), y: yy(r92.A) + rS(r92.A) * .5,
    tx: clamp(x(1992) - (mob ? 10 : 22), 110, w - 10), ty: Math.min(top + ch - 12, yy(r92.A) + (mob ? 28 : 34)),
    kind: "curve", bend: -12, anchor: "end", size: mob ? 11 : 12,
    lines: [["1992 · Pinatubo", true], ["només 19 % a l'aire"]]
  });

  if (!mob) {
    const r98 = BY[1998];
    V.note(annG, {
      x: x(1998), y: yy(r98.A) - rS(r98.A) * .8,
      tx: x(1998) - 16, ty: yy(r98.E) - 24,
      kind: "curve", bend: -12, anchor: "end", stroke: C.vermell, size: 12,
      lines: [["1998 · El Niño", true, C.vermell], ["+2,8 ppm a l'aire"]]
    });
  }

  const r24 = BY[2024];
  V.note(annG, {
    x: x(2024) - rS(r24.A) * .55, y: yy(r24.A) - rS(r24.A) * .55,
    tx: x(mob ? 2015 : 2014), ty: top + (mob ? 12 : 16),
    kind: "curve", bend: -14, anchor: "end", stroke: C.vermell, size: mob ? 11 : 12,
    lines: [["2024 · El Niño", true, C.vermell], ["+3,8 ppm (rècord)"]]
  });

  // Marcador d'any seleccionat
  const selG = svg.append("g").style("pointer-events", "none");
  const selLine = selG.append("line").attr("y1", top + 6).attr("y2", top + ch + gap + oniH)
    .attr("stroke", C.ink).attr("stroke-width", .9).attr("stroke-dasharray", "2 2");
  const selRings = selG.append("g");
  const selLab = V.t(selG, 0, 0, "", { size: 12, weight: 700, fill: C.ink, anchor: "middle", halo: 3.5 });

  function selectY(yr) {
    Y.sel = yr;
    const r = BY[yr], cx = x(yr);
    selLine.attr("x1", cx).attr("x2", cx);
    selLab.attr("x", clamp(cx, 24, w - 24)).attr("y", Math.max(top + 4, yy(r.E) - 10)).text(String(yr));
    selRings.selectAll("*").remove();
    [["A", PAL.air], ["O", PAL.ocean], ["L", PAL.landEdge]].forEach(([k, col]) => {
      const v = Math.max(0, r[k]);
      selRings.append("circle").attr("cx", cx).attr("cy", yy(v)).attr("r", rS(v) + 1)
        .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.4);
      selRings.append("circle").attr("cx", cx).attr("cy", yy(v)).attr("r", 2.2)
        .attr("fill", col).attr("stroke", C.ink).attr("stroke-width", .8);
    });
    renderYearPanel(yr);
  }

  const yearAt = px => clamp(Math.round(x.invert(px)), 1959, LAST);

  const hvG = svg.append("g").style("pointer-events", "none");
  V.hover(svg.node(), (ev, [px]) => {
    const yr = yearAt(px);
    if (ev.type === "pointerdown") selectY(yr);
    const r = BY[yr], o = ONI(yr), cx = x(yr);
    V.focus(yrGroups, d => d.y === yr || d.y === Y.sel, { dim: .48 });
    hvG.selectAll("*").remove();
    if (yr !== Y.sel) {
      hvG.append("line").attr("x1", cx).attr("x2", cx).attr("y1", top + 6).attr("y2", top + ch + gap + oniH)
        .attr("stroke", C.ink2).attr("stroke-width", .75).attr("stroke-dasharray", "2 2");
    }
    yTip.show(`<b>${yr}${yr === LAST ? " (proj.)" : ""}</b> · Emès ${f1(r.E)} Gt · Aire ${pct(r.A / r.E)} · Oceà ${pct(r.O / r.E)} · Terra ${pct(r.L / r.E)}${o != null ? ` · ONI ${V.signed(o, 2)} °C` : ""}`);
  }, () => {
    V.focus(yrGroups, null);
    hvG.selectAll("*").remove();
    yTip.hide();
  });

  svg.on("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      selectY(clamp(Y.sel + (e.key === "ArrowLeft" ? -1 : 1), 1959, LAST));
    }
  });

  el._selectY = selectY;
  selectY(Y.sel);

  V.onView(el, inst => {
    if (inst) return;
    yrGroups.selectAll("circle.wc").attr("r", 0)
      .transition().delay((_, i) => (i % Y.rows.length) * 8).duration(650).ease(d3.easeCubicOut)
      .attr("r", function() {
        const d = d3.select(this.parentNode).datum();
        const k = this.classList.contains("wc-A") ? "A" : this.classList.contains("wc-O") ? "O" : "L";
        return rS(Math.max(0, d[k]));
      });
    const L = emLine.node().getTotalLength();
    emLine.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
      .transition().delay(180).duration(900).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0)
      .on("end", () => emLine.attr("stroke-dasharray", null));
  });
});

document.querySelectorAll("#ySeg button").forEach(b => b.addEventListener("click", () => {
  if (yPlot._selectY) yPlot._selectY(+b.dataset.y);
}));

/* =====================================================================
   5. DES DEL 1850 — IB-47 CORRENT APILAT BIDIRECCIONAL D'AQUAREL·LA
      Capes suavitzades (curveMonotoneX), degradats d'aquarel·la multiply,
      separadors blancs 0,7 px, zero en tinta i morph Anual ↔ Acumulat.
   ===================================================================== */
const Hh = { cum: 0 };
(function() {
  let c = { F: 0, U: 0, A: 0, O: 0, L: 0, B: 0 };
  Hh.rows = ROWS.map(r => {
    ["F", "U", "A", "O", "L", "B"].forEach(k => { c[k] += r[k]; });
    return { y: r.y, a: r, c: { ...c } };
  });
})();

const HKEYS = [
  ["F", PAL.fossil, 1, "Fòssil i ciment", .52, .30],
  ["U", PAL.landUse, 1, "Ús del sòl", .58, .32],
  ["A", PAL.air, -1, "Atmosfera", .56, .32],
  ["O", PAL.ocean, -1, "Oceà", .52, .28],
  ["L", PAL.land, -1, "Terra", .62, .36]
];

V.legendCat(document.getElementById("hLg"), [
  { c: PAL.fossil, t: "Fòssil i ciment", a: .65 },
  { c: PAL.landUse, t: "Ús del sòl", a: .72 },
  { c: PAL.air, t: "Atmosfera", a: .68 },
  { c: PAL.ocean, t: "Oceà", a: .65 },
  { c: PAL.land, t: "Terra", a: .75 }
]);

function stackH(cum) {
  const out = {};
  const get = (d, k) => (cum ? d.c[k] : d.a[k]);
  const up = Hh.rows.map(() => 0), dn = Hh.rows.map(() => 0);
  HKEYS.forEach(([k, , s]) => {
    out[k] = Hh.rows.map((d, i) => {
      const v = Math.max(0, get(d, k));
      if (s > 0) { const a = up[i]; up[i] += v; return [a, up[i]]; }
      const a = dn[i]; dn[i] -= v; return [a, dn[i]];
    });
  });
  return out;
}

const hPlot = document.getElementById("hPlot");
const hTip = V.tip(hPlot);

V.mount(hPlot, (el, w) => {
  const mob = w < 640;
  const ml = mob ? 8 : 10, mr = mob ? 8 : 144, top = 22, ch = mob ? 305 : 416, H = top + ch + 28;
  const svg = V.svg(el, w, H, "Corrent apilat bidireccional d'aquarel·la del 1850 al 2026: emissions fòssils i per ús del sòl amunt; CO₂ a l'atmosfera, l'oceà i la terra avall. Del 1850 al 2025 es van emetre 2.765 Gt de CO₂.");

  const x = d3.scaleLinear([1850, LAST + 1], [ml, w - mr]);
  const defs = svg.append("defs");
  const uid = "h47" + Math.random().toString(36).slice(2, 6);
  const clipRect = defs.append("clipPath").attr("id", uid + "cl")
    .append("rect").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", ch);

  // Degradats verticals d'aquarel·la per a cada capa
  HKEYS.forEach(([k, col, dir, , a0, a1]) => {
    addLinearGrad(defs, `${uid}-${k}`, 0, dir > 0 ? top : top + ch / 2, 0, dir > 0 ? top + ch / 2 : top + ch,
      dir > 0 ? [["0%", col, a0], ["100%", col, a1]] : [["0%", col, a1], ["100%", col, a0]]);
  });

  const gyG = svg.append("g");
  V.axisX(svg, x, top + ch, mob ? [1850, 1900, 1950, 2000] : [1850, 1875, 1900, 1925, 1950, 1975, 2000, 2025], d => String(d));

  const areasG = svg.append("g").attr("clip-path", `url(#${uid}cl)`);
  const zeroLine = svg.append("line").attr("x1", ml).attr("x2", w - mr).attr("stroke", C.ink).attr("stroke-width", 1.1);
  svg.append("rect").attr("x", x(LAST)).attr("width", Math.max(2, x(LAST + 1) - x(LAST)))
    .attr("y", top).attr("height", ch).attr("fill", C.paper).attr("opacity", .48).style("pointer-events", "none");
  const annG = svg.append("g").style("pointer-events", "none");
  const labsG = svg.append("g").style("pointer-events", "none");
  const hvG = svg.append("g").style("pointer-events", "none");
  const hit = svg.append("rect").attr("class", "hit").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", ch).attr("fill", "transparent");

  let yScale, curStack;

  function drawH(instant) {
    const cum = Hh.cum;
    curStack = stackH(cum);
    const lim = cum ? 3100 : 54;
    yScale = d3.scaleLinear([-lim, lim], [top + ch, top]);
    const ticks = cum ? [-3000, -2000, -1000, 0, 1000, 2000, 3000] : [-50, -25, 0, 25, 50];

    gyG.selectAll("*").remove();
    V.gridY(gyG, yScale, ml, w - mr, ticks, v => f0(Math.abs(v)), { zero: 0, unit: " Gt CO₂" });
    zeroLine.attr("y1", yScale(0)).attr("y2", yScale(0));

    const areaGen = k => d3.area()
      .x(d => x(d.y + .5))
      .y0((d, i) => yScale(curStack[k][i][0]))
      .y1((d, i) => yScale(curStack[k][i][1]))
      .curve(d3.curveMonotoneX);

    const paths = areasG.selectAll("path.layer").data(HKEYS, d => d[0]).join("path")
      .attr("class", "layer")
      .attr("fill", d => `url(#${uid}-${d[0]})`)
      .attr("stroke", C.paper)
      .attr("stroke-width", .7)
      .style("mix-blend-mode", "multiply");

    (instant || RM ? paths : paths.transition().duration(750).ease(d3.easeCubicInOut))
      .attr("d", d => areaGen(d[0])(Hh.rows));

    labsG.selectAll("*").remove();
    annG.selectAll("*").remove();
    const i25 = Hh.rows.findIndex(d => d.y === LASTREAL), r25 = Hh.rows[i25];

    if (!mob) {
      const xl = w - mr + 10, tot = cum ? r25.c.F + r25.c.U : 0;
      const ys = HKEYS.map(([k, col, , nm]) => ({
        k, nm, col: k === "L" ? C.ink : k === "U" ? PAL.landUseEdge : k === "F" ? C.ink : col,
        y: yScale((curStack[k][i25][0] + curStack[k][i25][1]) / 2)
      }));
      separate(ys, 34, top + 24, top + ch - 12);
      V.t(labsG, xl, top + 6, cum ? "Acumulat 1850–2025" : "El 2025", { size: 11, fill: C.muted, italic: true });
      ys.forEach(o => {
        const v = cum ? r25.c[o.k] : r25.a[o.k];
        const origY = yScale((curStack[o.k][i25][0] + curStack[o.k][i25][1]) / 2);
        if (Math.abs(o.ly - origY) > 6) {
          labsG.append("path").attr("d", `M${w - mr + 2},${origY}L${xl - 2},${o.ly - 2}`)
            .attr("stroke", C.hair).attr("stroke-width", .7).attr("fill", "none");
        }
        V.t(labsG, xl, o.ly - 1, o.nm, { size: 12, weight: 700, fill: o.col });
        V.t(labsG, xl, o.ly + 14, cum && ["A", "O", "L"].includes(o.k) ? `${f0(v)} Gt · ${pct(v / tot)}` : `${cum ? f0(v) : f1(v)} Gt`, { size: 11.5, fill: C.ink2 });
      });
    }

    V.t(annG, ml + 4, yScale(cum ? 2500 : 44), "Emissions ↑", { size: 12, weight: 700, fill: C.ink, halo: true });
    V.t(annG, ml + 4, yScale(cum ? -2500 : -44), "On van ↓", { size: 12, weight: 700, fill: C.ink, halo: true });

    if (!cum && !mob) {
      V.note(annG, {
        x: x(1900), y: yScale(BY[1900].E), tx: x(1900) + 16, ty: yScale(BY[1900].E + 18), kind: "curve", bend: -10, anchor: "start",
        lines: [["Fins a mitjan segle XX,", true], ["la tala superava els fòssils"]]
      });
      V.note(annG, {
        x: x(1959), y: yScale(-BY[1959].A - BY[1959].O - BY[1959].L), tx: x(1959) - 16, ty: yScale(-35), kind: "curve", bend: 10, anchor: "end",
        lines: [["Des del 1959", true], ["mesures directes a l'aire"]]
      });
    } else if (cum && !mob) {
      const i00 = Hh.rows.findIndex(d => d.y === 2000);
      const e00 = Hh.rows[i00].c.F + Hh.rows[i00].c.U;
      V.note(annG, {
        x: x(2000), y: yScale(e00), tx: x(1972), ty: yScale(2350), kind: "curve", bend: -12, anchor: "end",
        lines: [["Més d'un terç del total", true], ["s'ha emès des de l'any 2000"]]
      });
    }
    if (mob && cum) {
      const tot = r25.c.F + r25.c.U;
      V.t(annG, w - mr, yScale(-2750), `Aire ${pct(r25.c.A / tot)} · Oceà ${pct(r25.c.O / tot)} · Terra ${pct(r25.c.L / tot)}`, { size: 11, fill: C.ink2, anchor: "end", halo: true });
    }
    d3.selectAll("#hSeg button").attr("aria-pressed", function() { return String(+this.dataset.v === cum); });
  }

  V.hover(hit.node(), (ev, [px]) => {
    const yr = clamp(Math.floor(x.invert(px)), 1850, LAST);
    const idx = Hh.rows.findIndex(r => r.y === yr);
    if (idx < 0) return;
    const d = Hh.rows[idx], v = Hh.cum ? d.c : d.a, xx = x(yr + .5), fmtV = val => Hh.cum ? f0(val) : f1(val);
    hvG.selectAll("*").remove();
    hvG.append("line").attr("x1", xx).attr("x2", xx).attr("y1", top).attr("y2", top + ch)
      .attr("stroke", C.ink).attr("stroke-width", .85).attr("stroke-dasharray", "2 2");
    HKEYS.forEach(([k, col]) => {
      const valY = yScale(curStack[k][idx][1]);
      hvG.append("circle").attr("cx", xx).attr("cy", valY).attr("r", 3)
        .attr("fill", col).attr("stroke", C.ink).attr("stroke-width", 1);
    });
    hTip.show(`<b>${Hh.cum ? "1850–" + yr : yr}${yr === LAST ? " (proj.)" : ""}</b> · Emès ${fmtV(v.F + v.U)} Gt (fòssil ${fmtV(v.F)}, sòl ${fmtV(v.U)}) · Aire ${fmtV(v.A)} · Oceà ${fmtV(v.O)} · Terra ${fmtV(v.L)} Gt`);
  }, () => {
    hvG.selectAll("*").remove();
    hTip.hide();
  });

  el._drawH = drawH;
  drawH(true);

  V.onView(el, inst => {
    if (inst) return;
    clipRect.attr("width", 0).transition().duration(1000).ease(d3.easeCubicInOut).attr("width", w - ml - mr);
  });
});

document.querySelectorAll("#hSeg button").forEach(b => b.addEventListener("click", () => {
  Hh.cum = +b.dataset.v;
  hTip.hide();
  if (hPlot._drawH) hPlot._drawH(false);
}));

/* =====================================================================
   6. PERSISTÈNCIA DEL CO₂ — IB-49 HORITZÓ LOGARÍTMIC DE TEMPS PROFUND
      Capes translúcides multiply, línies guia verticals (10 / 100 / 1.000 /
      10.000 / 100.000 anys), cua mil·lenària gravada i hover + lliscant sincronitzats.
   ===================================================================== */
const IRF = {
  atm: [.2173, [.2240, .2824, .2763], [394.4, 36.54, 4.304]],
  oce: [60.29, [-26.48, -17.45, -16.35], [390.5, 100.5, 4.551]],
  lnd: [17.07, [332.1, -334.1, -15.09], [74.76, 70.31, 6.139]]
};
const fitIRF = (c, t) => c[0] + c[1].reduce((s, a, i) => s + a * Math.exp(-t / c[2][i]), 0);
function partsAt(t) {
  const a = 100 * fitIRF(IRF.atm, t);
  const o = clamp(fitIRF(IRF.oce, t), 0, 100 - a);
  return { a, o, l: Math.max(0, 100 - a - o) };
}

const BANDS = [
  ["Fotosíntesi i respiració a terra", 1, 100, PAL.land],
  ["Dissolució a l'oceà", 10, 1000, PAL.ocean],
  ["Reacció amb els carbonats del fons", 1000, 1e4, C.blauClar],
  ["Meteorització de les roques", 1e4, 1e6, C.ink2]
];

V.legendCat(document.getElementById("pLg"), [
  { c: PAL.air, t: "Atmosfera", a: .68 },
  { c: PAL.ocean, t: "Oceà", a: .65 },
  { c: PAL.land, t: "Terra", a: .75 }
]);

const P = { t: 100, rng: document.getElementById("pRng") };
const tOf = v => {
  if (v <= 0) return 0;
  const t = Math.pow(10, v / 100);
  return t < 10 ? Math.round(t * 2) / 2 : t < 100 ? Math.round(t) : Math.round(t / 5) * 5;
};
const vOf = t => t <= 0 ? 0 : Math.round(clamp(Math.log10(t) * 100, 0, 300));

const pPlot = document.getElementById("pPlot");
const pTip = V.tip(pPlot);

V.mount(pPlot, (el, w) => {
  const mob = w < 600;
  const ml = mob ? 8 : 10, mr = mob ? 14 : 20, top = 24, ch = mob ? 205 : 265;
  const bg = mob ? 26 : 28, H = top + ch + 48 + BANDS.length * bg + 8;

  const svg = V.svg(el, w, H, "Horitzó logarítmic de temps profund de la persistència del CO₂: als 20 anys resta un 60 % a l'aire, als 100 anys un 41 % i als 1.000 anys un 25 %. Més enllà, els carbonats del fons marí i la meteorització de les roques retiren la resta en desenes o centenars de milers d'anys.");
  const defs = svg.append("defs");
  const uid = "p49" + Math.random().toString(36).slice(2, 6);

  const x = d3.scaleSymlog().constant(1).domain([0, 1e6]).range([ml, w - mr]);
  const y = d3.scaleLinear([0, 100], [top + ch, top]);

  V.gridY(svg, y, ml, w - mr, [0, 25, 50, 75, 100], v => v + " %", { zero: 0 });

  // Línies guia verticals fines de temps profund (10 / 100 / 1.000 / 10.000 / 100.000 anys)
  const guideYears = [10, 100, 1e3, 1e4, 1e5];
  guideYears.forEach(yr => {
    const gx = x(yr);
    svg.append("line").attr("x1", gx).attr("x2", gx).attr("y1", top).attr("y2", top + ch)
      .attr("stroke", yr === 1e3 ? C.ink : C.hair)
      .attr("stroke-width", yr === 1e3 ? .9 : .6)
      .attr("stroke-dasharray", yr === 1e3 ? "3 3" : "2 3");
  });

  const tv = mob ? [0, 10, 100, 1e3, 1e5, 1e6] : [0, 1, 10, 100, 1e3, 1e4, 1e5, 1e6];
  const ax = V.axisX(svg, x, top + ch, tv, v => mob && v >= 1e4 ? (v >= 1e6 ? "1 M" : (v / 1e3) + " mil") : f0(v));
  if (mob) {
    ax.selectAll("text").filter((_, i) => i === 0).attr("text-anchor", "start");
    ax.selectAll("text").filter((_, i, n) => i === n.length - 1).attr("text-anchor", "end").attr("x", w - 4);
  }
  V.t(svg, w - mr, top + ch + 33, "Escala logarítmica · anys després de l'emissió →", { size: 11.5, italic: true, fill: C.muted, anchor: "end" });

  // Degradats d'aquarel·la per a les 3 capes
  addLinearGrad(defs, uid + "a", 0, y(100), 0, y(0), [["0%", PAL.air, .58], ["100%", PAL.air, .34]]);
  addLinearGrad(defs, uid + "o", 0, y(100), 0, y(0), [["0%", PAL.ocean, .50], ["100%", PAL.ocean, .28]]);
  addLinearGrad(defs, uid + "l", 0, y(100), 0, y(0), [["0%", PAL.land, .62], ["100%", PAL.land, .36]]);

  const ts = [];
  for (let t = 0; t <= 1000; t += t < 10 ? .25 : t < 100 ? 1 : 5) ts.push(t);
  const pts = ts.map(t => ({ t, ...partsAt(t) }));

  const x1k = x(1000);
  const clipRect = defs.append("clipPath").attr("id", uid + "cl")
    .append("rect").attr("x", ml).attr("y", top).attr("width", x1k - ml).attr("height", ch);

  const areaG = svg.append("g").attr("clip-path", `url(#${uid}cl)`);
  const mkAr = (f0fn, f1fn, gid) => areaG.append("path").datum(pts)
    .attr("fill", `url(#${gid})`).attr("stroke", C.paper).attr("stroke-width", .7)
    .style("mix-blend-mode", "multiply")
    .attr("d", d3.area().x(d => x(d.t)).y0(d => y(f0fn(d))).y1(d => y(f1fn(d))));
  mkAr(() => 0, d => d.a, uid + "a");
  mkAr(d => d.a, d => d.a + d.o, uid + "o");
  mkAr(d => d.a + d.o, () => 100, uid + "l");

  areaG.append("path").datum(pts).attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.6)
    .attr("d", d3.line().x(d => x(d.t)).y(d => y(d.a)));

  // Zona fora del model (> 1.000 anys): trama fina de gravat + cua esquemàtica esvaïda (Archer et al. 2009)
  const pat = defs.append("pattern").attr("id", uid + "ht").attr("width", 7).attr("height", 7)
    .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
  pat.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 7).attr("stroke", C.hair).attr("stroke-width", .9);
  svg.append("rect").attr("x", x1k).attr("y", top).attr("width", Math.max(0, w - mr - x1k)).attr("height", ch)
    .attr("fill", `url(#${uid}ht)`).attr("opacity", .65);

  const a1k = partsAt(1000).a;
  addLinearGrad(defs, uid + "tail", x1k, 0, w - mr, 0, [
    ["0%", PAL.air, .24],
    ["45%", PAL.air, .14],
    ["100%", PAL.air, .03]
  ]);
  svg.append("path")
    .attr("d", `M${x1k},${y(a1k)}C${x(1e4)},${y(16)} ${x(8e4)},${y(7)} ${w - mr},${y(1.5)}L${w - mr},${y(0)}L${x1k},${y(0)}Z`)
    .attr("fill", `url(#${uid}tail)`).style("mix-blend-mode", "multiply");
  svg.append("path")
    .attr("d", `M${x1k},${y(a1k)}C${x(1e4)},${y(16)} ${x(8e4)},${y(7)} ${w - mr},${y(1.5)}`)
    .attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 1.1).attr("stroke-dasharray", "3 3").attr("stroke-opacity", .75);

  const xm = (x1k + w - mr) / 2;
  V.t(svg, xm, top + ch * .42, "Fora del model (> 1.000 anys)", { size: mob ? 11 : 12.5, weight: 700, fill: C.ink2, anchor: "middle", halo: 3.5 });
  V.t(svg, xm, top + ch * .42 + 16, mob ? "cua mil·lenària (carbonats i roques)" : "cua mil·lenària: carbonats del fons i meteorització de roques", { size: 11, fill: C.muted, anchor: "middle", halo: 3.5 });

  // Etiquetes directes dins de cada capa
  const tl = mob ? 280 : 210, pl = partsAt(tl);
  V.t(svg, x(tl), y(pl.a / 2) + 4, "Atmosfera", { size: 12, weight: 700, fill: C.vermellFosc, anchor: "middle", halo: 2.5 });
  V.t(svg, x(tl), y(pl.a + pl.o / 2) + 4, "Oceà", { size: 12, weight: 700, fill: C.blauFosc, anchor: "middle", halo: 2.5 });
  V.t(svg, x(tl), y(pl.a + pl.o + pl.l / 2) + 4, "Terra", { size: 12, weight: 700, fill: C.ink, anchor: "middle", halo: 2.5 });

  // Fites clau (20, 100 i 1.000 anys)
  [[20, "20 anys"], [100, "100 anys"], [1000, "1.000 anys"]].forEach(([t]) => {
    const v = partsAt(t).a;
    svg.append("circle").attr("cx", x(t)).attr("cy", y(v)).attr("r", 3).attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1);
  });

  // Franges de processos de retirada en temps profund (IB-49 càpsules d'aquarel·la)
  const bandsG = svg.append("g");
  BANDS.forEach(([nm, a, b, col], i) => {
    const by = top + ch + 54 + i * bg;
    const xA = x(a), xB = x(b);
    const bgItem = bandsG.append("g").datum({ nm, a, b });
    bgItem.append("line").attr("x1", ml).attr("x2", w - mr).attr("y1", by + 3.5).attr("y2", by + 3.5)
      .attr("stroke", C.grid).attr("stroke-width", .55);
    bgItem.append("rect").attr("x", xA).attr("width", Math.max(6, xB - xA)).attr("y", by).attr("height", 7)
      .attr("fill", col).attr("fill-opacity", col === PAL.land ? .68 : .52).attr("rx", 3.5)
      .style("mix-blend-mode", "multiply");
    bgItem.append("circle").attr("cx", xA).attr("cy", by + 3.5).attr("r", 2.2).attr("fill", col === PAL.land ? C.grocFosc : col);
    bgItem.append("circle").attr("cx", xB).attr("cy", by + 3.5).attr("r", 2.2).attr("fill", col === PAL.land ? C.grocFosc : col);
    const tx = clamp((xA + xB) / 2, ml + 76, w - mr - 76);
    V.t(bgItem, tx, by - 4, nm, { size: mob ? 11 : 12, fill: C.ink2, anchor: "middle", halo: 2.5 });
  });

  // Marcador interactiu sincronitzat amb el lliscant
  const mkG = svg.append("g").style("pointer-events", "none");
  const mkLine = mkG.append("line").attr("y1", top).attr("y2", top + ch).attr("stroke", C.ink).attr("stroke-width", 1.2);
  const mkDotA = mkG.append("circle").attr("r", 4.5).attr("fill", PAL.air).attr("stroke", C.ink).attr("stroke-width", 1.4);
  const mkDotO = mkG.append("circle").attr("r", 3.2).attr("fill", PAL.ocean).attr("stroke", C.ink).attr("stroke-width", 1.1);
  const mkLab = V.t(mkG, 0, 0, "", { size: 12, weight: 700, fill: C.ink, halo: 3.5 });

  function setP(t) {
    t = clamp(t, 0, 1000);
    P.t = t;
    const p = partsAt(t), px = x(t);
    mkLine.attr("x1", px).attr("x2", px);
    mkDotA.attr("cx", px).attr("cy", y(p.a));
    mkDotO.attr("cx", px).attr("cy", y(p.a + p.o));
    const right = px < w * .52;
    mkLab.attr("x", px + (right ? 8 : -8))
      .attr("y", mob ? Math.min(top + ch - 8, y(p.a) + 18) : Math.max(top + 14, y(p.a) - 10))
      .attr("text-anchor", right ? "start" : "end")
      .text(`${Math.round(p.a)} % a l'aire`);
    const yrs = t === 1 ? "1 any" : t === 0 ? "0 anys" : `${t < 10 && t % 1 ? f1(t) : f0(t)} anys`;
    P.rng.setAttribute("aria-valuetext", `${yrs}: ${Math.round(p.a)} % a l'aire`);
    document.getElementById("pOut").innerHTML =
      `Al cap de <b>${yrs}</b>: atmosfera <b style="color:${PAL.air}">${Math.round(p.a)} %</b> · oceà <b style="color:${PAL.ocean}">${Math.round(p.o)} %</b> · terra <b style="box-shadow:inset 0 -3px 0 ${PAL.land}">${Math.round(p.l)} %</b>`;
  }

  const hit = svg.append("rect").attr("class", "hit").attr("x", ml).attr("y", top).attr("width", x1k - ml).attr("height", ch).attr("fill", "transparent");
  V.hover(hit.node(), (ev, [px]) => {
    const t = clamp(x.invert(px), 0, 1000);
    const tSnap = t < 10 ? Math.round(t * 2) / 2 : t < 100 ? Math.round(t) : Math.round(t / 5) * 5;
    P.rng.value = vOf(tSnap);
    setP(tSnap);
    const p = partsAt(tSnap);
    const yrs = tSnap === 1 ? "1 any" : tSnap === 0 ? "0 anys" : `${tSnap < 10 && tSnap % 1 ? f1(tSnap) : f0(tSnap)} anys`;
    pTip.show(`<b>Al cap de ${yrs}</b> · Atmosfera ${Math.round(p.a)} % · Oceà ${Math.round(p.o)} % · Terra ${Math.round(p.l)} %`);
  }, () => pTip.hide());

  el._setP = setP;
  setP(P.t);

  V.onView(el, inst => {
    if (inst) return;
    clipRect.attr("width", 0).transition().duration(1000).ease(d3.easeCubicInOut).attr("width", x1k - ml);
  });
});

P.rng.addEventListener("input", () => {
  const t = tOf(+P.rng.value);
  if (pPlot._setP) pPlot._setP(t);
});

/* =====================================================================
   Scrolly wiring + temps de lectura
   ===================================================================== */
IB.scrolly(document.getElementById("aSteps"), document.getElementById("aGraphic"), i => safe(onStepA, i));
IB.scrolly(document.getElementById("bSteps"), document.getElementById("bGraphic"), i => safe(onStepB, i));

(() => {
  const n = [...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")]
    .filter(e => !e.closest(".fn"))
    .reduce((a, e) => a + (e.textContent.match(/[\p{L}\p{N}·'’]+/gu) || []).length, 0);
  const figs = document.querySelectorAll(".plot").length;
  let sec = n / 218 * 60;
  for (let i = 0; i < figs; i++) sec += Math.max(3, 12 - i);
  const el = document.getElementById("rt");
  if (el) el.textContent = Math.max(1, Math.round(sec / 60)) + " min de lectura";
})();
})();
