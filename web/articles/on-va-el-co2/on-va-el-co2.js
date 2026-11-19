/* On va el CO₂ que emetem — visualitzacions amb el sistema infogràfic d'Inspired by Magazine (IBV).
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
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const pct = v => Math.round(v * 100) + " %";
const safe = (f, ...a) => { try { return f(...a); } catch (e) { console.error(e); } };

const MONTHS = ["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const MSH = V.MES;

// Paleta semàntica única a tot l'article (estrictament vermell / blau / groc + grisos; mai text en groc)
const PAL = {
  fossil: C.ink,
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

/* Helper: contenidor híbrid Canvas + SVG superposat */
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

/* =====================================================================
   1. SCROLLY A — IB-11 (Reixa d'unitats) + IB-40 (Flux orgànic translúcid)
      Un any d'emissions (2025), punt a punt (1 punt = 0,1 Gt de CO₂)
   ===================================================================== */
const A = { step: 0, W: 0, H: 0, parts: [], hov: null, stepT: 0, loopH: null };
(function initA() {
  const r = BY[LASTREAL];
  const nF = Math.round(r.F * 10), nU = Math.floor(r.U * 10 + 1e-9);
  const nO = Math.round(r.O * 10), nL = Math.round(r.L * 10), nB = Math.round(r.B * 10);
  const nA = nF + nU - nO - nL - nB;
  A.n = { F: nF, U: nU, A: nA, O: nO, L: nL, B: nB, N: nF + nU };

  const R = V.rng(7);
  const dest = [];
  for (let i = 0; i < nA; i++) dest.push("A");
  for (let i = 0; i < nO; i++) dest.push("O");
  for (let i = 0; i < nL; i++) dest.push("L");
  for (let i = 0; i < nB; i++) dest.push("B");
  for (let i = dest.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1));
    [dest[i], dest[j]] = [dest[j], dest[i]];
  }
  // Índexs ordenats dins de cada grup per col·locar els punts amb ordre orgànic
  const idx = { F: 0, U: 0, A: 0, O: 0, L: 0, B: 0 };
  for (let i = 0; i < A.n.N; i++) {
    const o = i < nF ? "F" : "U";
    const d = dest[i];
    A.parts.push({
      k: i, o, d,
      oi: idx[o]++, di: idx[d]++,
      u: R(), v: R(), ph: R() * Math.PI * 2,
      x: 0, y: 0, sx: 0, sy: 0, tx: 0, ty: 0,
      al: 0, tal: 0, col: PAL.fossil, where: null,
      moving: false, mt: 0, delay: 0, dur: 1.4
    });
  }
})();

V.legendCat(document.getElementById("aLg"), [
  { c: PAL.fossil, t: "Fòssil i ciment" },
  { c: PAL.landUse, t: "Ús del sòl" },
  { c: PAL.air, t: "Atmosfera" },
  { c: PAL.ocean, t: "Oceà" },
  { c: PAL.land, t: "Terra" },
  { c: PAL.imb, t: "Desquadrament", kind: "hollow" }
]);

const A_TXT = [
  () => ["Emissions del 2025", `${A.n.N} punts · 1 punt = 0,1 Gt de CO₂`],
  () => ["Combustibles fòssils i ciment", `${A.n.F} punts · ${f1(BY[LASTREAL].F)} Gt de CO₂ (90 %)`],
  () => ["+ Canvi d'ús del sòl", `${A.n.U} punts més · ${f1(BY[LASTREAL].E)} Gt de CO₂ en total`],
  () => ["Si tot es quedés a l'aire", `+${f1(BY[LASTREAL].E / CC / 2.124)} ppm en un any (en realitat, +2,1 ppm)`],
  () => ["L'oceà absorbeix una quarta part", `${A.n.O} punts · ${f1(BY[LASTREAL].O)} Gt · ${pct(BY[LASTREAL].O / BY[LASTREAL].E)}`],
  () => ["La terra, gairebé un terç el 2025", `${A.n.L} punts · ${f1(BY[LASTREAL].L)} Gt · ${pct(BY[LASTREAL].L / BY[LASTREAL].E)}`],
  () => ["El que es queda a l'aire", `${A.n.A} punts · ${f1(BY[LASTREAL].A)} Gt · ${pct(BY[LASTREAL].A / BY[LASTREAL].E)} → +${f1(BY[LASTREAL].A / CC / 2.124)} ppm`],
  () => ["Desquadrament del balanç", `${A.n.B} punts · ${f1(BY[LASTREAL].B)} Gt · ${pct(BY[LASTREAL].B / BY[LASTREAL].E)}`],
  () => ["El 2025 i la mitjana 2016–2025", `A l'aire: ${pct(BY[LASTREAL].A / BY[LASTREAL].E)} el 2025 · ${pct(DEC.A)} de mitjana`]
];

function geoA(w, h) {
  const mob = w < 520;
  const padX = mob ? 14 : 24, padY = mob ? 28 : 34;
  const yMid = h * .53;
  // Zones netes sobre paper blanc (sense fons pintats)
  return {
    w, h, mob, padX, padY, yMid,
    // Camp unitari central (pas 0)
    all: { x0: padX + (w - 2 * padX) * .08, x1: w - padX - (w - 2 * padX) * .08, y0: padY + 12, y1: h - padY - 12 },
    // Fonts (passos 1-2)
    srcF: { x0: padX, x1: w * .68, y0: padY + 16, y1: h - padY - 10 },
    srcU: { x0: w * .74, x1: w - padX, y0: padY + 16, y1: h - padY - 10 },
    // Banda atmosfèrica superior (passos 3-7)
    air: { x0: padX, x1: w * .72, y0: padY + 12, y1: yMid - 20 },
    imb: { x0: w * .76, x1: w - padX, y0: padY + 12, y1: yMid - 20 },
    // Embornals a sota de l'horitzó (passos 4-7)
    land: { x0: padX, x1: w * .48, y0: yMid + 28, y1: h - padY + 2 },
    ocean: { x0: w * .52, x1: w - padX, y0: yMid + 28, y1: h - padY + 2 }
  };
}

function gridPos(box, index, total, jitterU, jitterV, organic) {
  const bw = Math.max(20, box.x1 - box.x0), bh = Math.max(20, box.y1 - box.y0);
  const aspect = bw / bh;
  const cols = Math.max(3, Math.round(Math.sqrt(total * aspect)));
  const rows = Math.max(1, Math.ceil(total / cols));
  const c = index % cols, r = Math.floor(index / cols);
  const dx = bw / cols, dy = bh / rows;
  const j = organic ? .22 : .06;
  return [
    box.x0 + (c + .5 + (jitterU - .5) * j) * dx,
    box.y0 + (r + .5 + (jitterV - .5) * j) * dy
  ];
}

function targetsA(s, first) {
  const g = A.g;
  if (!g) return;
  A.parts.forEach((p, i) => {
    let where, pos, col, al = 1;
    if (s === 0) {
      where = "all";
      pos = gridPos(g.all, i, A.n.N, p.u, p.v, false);
      col = C.ink;
    } else if (s === 1) {
      where = p.o === "F" ? "srcF" : "srcU_hide";
      pos = p.o === "F" ? gridPos(g.srcF, p.oi, A.n.F, p.u, p.v, false) : [g.srcU.x0, (g.srcU.y0 + g.srcU.y1) / 2];
      col = p.o === "F" ? PAL.fossil : PAL.landUse;
      al = p.o === "F" ? 1 : 0;
    } else if (s === 2) {
      where = p.o === "F" ? "srcF" : "srcU";
      pos = p.o === "F" ? gridPos(g.srcF, p.oi, A.n.F, p.u, p.v, false) : gridPos(g.srcU, p.oi, A.n.U, p.u, p.v, false);
      col = p.o === "F" ? PAL.fossil : PAL.landUse;
    } else if (s === 3) {
      where = "airAll";
      pos = gridPos({ x0: g.padX, x1: g.w - g.padX, y0: g.air.y0, y1: g.air.y1 }, i, A.n.N, p.u, p.v, true);
      col = p.o === "F" ? PAL.fossil : PAL.landUse;
    } else if (s >= 4 && s <= 7) {
      const placedO = s >= 4 && p.d === "O";
      const placedL = s >= 5 && p.d === "L";
      const placedB = s >= 7 && p.d === "B";
      if (placedO) {
        where = "O"; pos = gridPos(g.ocean, p.di, A.n.O, p.u, p.v, true); col = PAL.ocean;
      } else if (placedL) {
        where = "L"; pos = gridPos(g.land, p.di, A.n.L, p.u, p.v, true); col = PAL.land;
      } else if (placedB) {
        where = "B"; pos = gridPos(g.imb, p.di, A.n.B, p.u, p.v, false); col = PAL.imb;
      } else {
        where = "A";
        const box = s >= 7 ? g.air : { x0: g.padX, x1: g.w - g.padX, y0: g.air.y0, y1: g.air.y1 };
        const tot = s >= 6 ? A.n.A : A.n.N;
        const idx = s >= 6 ? p.di : i;
        pos = gridPos(box, idx, tot, p.u, p.v, true);
        col = s >= 6 && p.d === "A" ? PAL.air : (p.o === "F" ? PAL.fossil : PAL.landUse);
      }
      if (s === 6 && p.d !== "A") al = .48;
    } else {
      // Pas 8: banda proporcional 2025 (en comparació amb la mitjana 2016-2025)
      where = "bar25";
      const x0 = g.padX, x1 = g.w - g.padX, bw = x1 - x0;
      const yBar = g.h * .28, bh = g.mob ? 28 : 34;
      const order = { A: 0, O: 1, L: 2, B: 3 };
      const offs = {
        A: 0,
        O: A.n.A / A.n.N,
        L: (A.n.A + A.n.O) / A.n.N,
        B: (A.n.A + A.n.O + A.n.L) / A.n.N
      };
      const frac = A.n[p.d] / A.n.N;
      const segBox = { x0: x0 + offs[p.d] * bw + 1, x1: x0 + (offs[p.d] + frac) * bw - 1, y0: yBar, y1: yBar + bh };
      pos = gridPos(segBox, p.di, A.n[p.d], p.u, p.v, false);
      col = p.d === "A" ? PAL.air : p.d === "O" ? PAL.ocean : p.d === "L" ? PAL.land : PAL.imb;
      void order;
    }

    const changed = p.where !== where;
    p.tx = pos[0]; p.ty = pos[1];
    p.col = col; p.tal = al;
    if (changed) {
      if (p.where == null || first || RM) {
        p.x = p.tx; p.y = p.ty; p.al = al; p.moving = false;
      } else {
        p.sx = p.x; p.sy = p.y; p.moving = true; p.mt = 0;
        p.delay = p.u * .45; p.dur = 1.0 + p.v * .45;
      }
      p.where = where;
    } else if (first || RM) {
      p.x = p.tx; p.y = p.ty; p.al = al; p.moving = false;
    }
  });
}

function renderOverlayA() {
  if (!A.svg || !A.g) return;
  const s = A.step, g = A.g, mob = g.mob, R = BY[LASTREAL];
  const ov = A.ov; ov.selectAll("*").remove();
  const hits = [];

  if (s === 0) {
    V.t(ov, g.padX, 14, "42,8 Gt de CO₂ emeses el 2025 · cada punt = 0,1 Gt", { size: 12, fill: C.ink2 });
    hits.push({ id: "all", box: g.all, tip: `<b>Emissions totals 2025</b> · ${f1(R.E)} Gt de CO₂ (427 punts)` });
  } else if (s === 1 || s === 2) {
    V.t(ov, g.srcF.x0, g.padY + 6, `Fòssil i ciment · ${f1(R.F)} Gt`, { size: 12.5, weight: 700, fill: C.ink });
    hits.push({ id: "F", box: g.srcF, tip: `<b>Fòssil i ciment</b> · ${f1(R.F)} Gt (${A.n.F} punts · ${pct(R.F / R.E)})` });
    if (s === 2) {
      ov.append("line").attr("x1", g.w * .71).attr("x2", g.w * .71).attr("y1", g.padY + 12).attr("y2", g.h - g.padY)
        .attr("stroke", C.hair).attr("stroke-width", .7);
      V.t(ov, g.srcU.x0, g.padY + 6, `Ús del sòl · ${f1(R.U)} Gt`, { size: 12.5, weight: 700, fill: PAL.landUseEdge });
      hits.push({ id: "U", box: g.srcU, tip: `<b>Canvi d'ús del sòl</b> · ${f1(R.U)} Gt (${A.n.U} punts · ${pct(R.U / R.E)})` });
    }
  } else if (s >= 3 && s <= 7) {
    // Horitzó finíssim que separa l'atmosfera dels embornals (P1: sense fons pintats)
    ov.append("line").attr("x1", g.padX).attr("x2", g.w - g.padX).attr("y1", g.yMid).attr("y2", g.yMid)
      .attr("stroke", C.hair).attr("stroke-width", .8);
    V.t(ov, g.padX, g.yMid - 6, "Atmosfera ↑", { size: 11.5, italic: true, fill: C.muted });
    V.t(ov, g.padX, g.yMid + 14, "Embornals a la superfície ↓", { size: 11.5, italic: true, fill: C.muted });

    if (s === 3) {
      V.t(ov, g.padX, g.padY + 2, `Si tot es quedés a l'aire: ${f1(R.E)} Gt → +${f1(R.E / CC / 2.124)} ppm`, { size: 12.5, weight: 700, fill: C.ink });
      V.rule(ov, g.padX, g.w - g.padX, g.air.y0 + (g.air.y1 - g.air.y0) * .38, { stroke: C.vermell });
      V.t(ov, g.w - g.padX, g.air.y0 + (g.air.y1 - g.air.y0) * .38 - 5, "Pujada real mesurada: +2,1 ppm", { size: 11.5, fill: C.vermell, anchor: "end", halo: true });
      hits.push({ id: "A", box: { x0: g.padX, x1: g.w - g.padX, y0: g.air.y0, y1: g.air.y1 }, tip: `<b>Si tot quedés a l'aire</b> · ${f1(R.E)} Gt → +${f1(R.E / CC / 2.124)} ppm (mesurat: +2,1 ppm)` });
    }
    if (s >= 4) {
      V.t(ov, g.ocean.x0, g.yMid + 22, `Oceà · ${f1(R.O)} Gt (${pct(R.O / R.E)})`, { size: mob ? 11.5 : 12.5, weight: 700, fill: C.blau });
      hits.push({ id: "O", box: g.ocean, tip: `<b>Embornal oceànic (2025)</b> · ${f1(R.O)} Gt (${A.n.O} punts · ${pct(R.O / R.E)})` });
    }
    if (s >= 5) {
      V.t(ov, g.land.x0, g.yMid + 22, `Terra · ${f1(R.L)} Gt (${pct(R.L / R.E)})`, { size: mob ? 11.5 : 12.5, weight: 700, fill: C.ink });
      hits.push({ id: "L", box: g.land, tip: `<b>Embornal terrestre (2025)</b> · ${f1(R.L)} Gt (${A.n.L} punts · ${pct(R.L / R.E)})` });
    }
    if (s >= 6) {
      V.t(ov, g.air.x0, g.padY + 2, `Es queda a l'aire · ${f1(R.A)} Gt (${pct(R.A / R.E)})`, { size: mob ? 11.5 : 12.5, weight: 700, fill: C.vermell });
      hits.push({ id: "A", box: s >= 7 ? g.air : { x0: g.padX, x1: g.w - g.padX, y0: g.air.y0, y1: g.air.y1 }, tip: `<b>Atmosfera (2025)</b> · ${f1(R.A)} Gt (${A.n.A} punts · ${pct(R.A / R.E)} · +${f1(R.A / CC / 2.124)} ppm)` });
    }
    if (s >= 7) {
      V.box(ov, g.imb.x0 - 4, g.imb.y0 - 4, g.imb.x1 - g.imb.x0 + 8, g.imb.y1 - g.imb.y0 + 8, { stroke: C.muted });
      V.t(ov, g.imb.x0, g.padY + 2, mob ? `Desq. · ${f1(R.B)}` : `Desquadrament · ${f1(R.B)} Gt`, { size: 11.5, weight: 600, fill: C.muted });
      hits.push({ id: "B", box: g.imb, tip: `<b>Desquadrament del balanç (2025)</b> · ${f1(R.B)} Gt (${A.n.B} punts · ${pct(R.B / R.E)})` });
    }
  } else if (s === 8) {
    // Comparació directa 2025 vs Mitjana 2016–2025 (bandes translúcides sobre paper blanc)
    const x0 = g.padX, x1 = g.w - g.padX, bw = x1 - x0;
    const bh = mob ? 28 : 34, y1 = g.h * .28, y2 = g.h * .64;
    const y25 = { A: R.A / R.E, O: R.O / R.E, L: R.L / R.E, B: R.B / R.E };
    V.t(ov, x0, y1 - 10, "2025 · un any excepcional per als boscos", { size: 12.5, weight: 700, fill: C.ink });
    V.t(ov, x0, y2 - 10, "Mitjana 2016–2025 · gairebé la meitat queda a l'aire", { size: 12.5, weight: 700, fill: C.ink });

    // Etiquetes directes sobre la banda de punts 2025
    const segs = [["A", PAL.air, "Aire"], ["O", PAL.ocean, "Oceà"], ["L", PAL.land, "Terra"], ["B", PAL.imb, "Desq."]];
    let cx = x0;
    segs.forEach(([k, col, nm]) => {
      const sw = bw * y25[k];
      if (sw > 38) V.t(ov, cx + sw / 2, y1 + bh + 15, `${nm} ${pct(y25[k])}`, { size: 11.5, anchor: "middle", fill: k === "L" ? C.ink : col, weight: 600 });
      hits.push({ id: k, box: { x0: cx, x1: cx + sw, y0: y1, y1: y1 + bh }, tip: `<b>${nm}</b> · 2025: ${pct(y25[k])} · Mitjana 2016–2025: ${pct(DEC[k])}` });
      cx += sw;
    });

    // Banda translúcida inferior per a la mitjana 2016–2025
    cx = x0;
    segs.forEach(([k, col, nm]) => {
      const sw = bw * DEC[k];
      if (k === "B") {
        ov.append("rect").attr("x", cx + .5).attr("y", y2 + .5).attr("width", Math.max(0, sw - 1)).attr("height", bh - 1)
          .attr("fill", "none").attr("stroke", col).attr("stroke-dasharray", "3 2").attr("stroke-width", 1);
      } else {
        ov.append("rect").attr("x", cx).attr("y", y2).attr("width", Math.max(0, sw - 1.5)).attr("height", bh)
          .attr("fill", col).attr("fill-opacity", k === "L" ? .72 : .82);
      }
      if (sw > 44) {
        V.t(ov, cx + sw / 2, y2 + bh / 2 + 4, pct(DEC[k]), { size: 12, weight: 700, anchor: "middle", fill: k === "L" ? C.ink : C.paper });
      }
      if (sw > 38) {
        V.t(ov, cx + sw / 2, y2 + bh + 15, nm, { size: 11.5, anchor: "middle", fill: C.ink2 });
      }
      cx += sw;
    });
  }
  A.hits = hits;
}

function drawA(tMs, dtMs) {
  const ctx = A.ctx, g = A.g;
  if (!ctx || !g) return;
  const t = tMs / 1000, dt = Math.min(.05, dtMs / 1000);
  A.stepT += dt;
  const s = A.step, mob = g.mob;

  ctx.clearRect(0, 0, g.w, g.h);

  // Bandes orgàniques translúcides de flux (estil IB-40, multiply, sense vores dures) als passos 4–7
  if (s >= 4 && s <= 7) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const srcX = (g.air.x0 + g.air.x1) * .5, srcY = g.air.y1 - 4;
    const drawRibbon = (tx, ty, col, bw, active) => {
      const grad = ctx.createLinearGradient(srcX, srcY, tx, ty);
      grad.addColorStop(0, V.alpha(col, active ? .14 : .06));
      grad.addColorStop(1, V.alpha(col, active ? .07 : .03));
      ctx.strokeStyle = grad;
      ctx.lineWidth = bw;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(srcX, srcY);
      ctx.bezierCurveTo(srcX, g.yMid, tx, g.yMid, tx, ty);
      ctx.stroke();
    };
    const dimO = A.hov && A.hov !== "O";
    const dimL = A.hov && A.hov !== "L";
    drawRibbon((g.ocean.x0 + g.ocean.x1) * .5, g.ocean.y0 + 18, PAL.ocean, mob ? 22 : 34, !dimO);
    if (s >= 5) drawRibbon((g.land.x0 + g.land.x1) * .5, g.land.y0 + 18, PAL.land, mob ? 26 : 40, !dimL);
    ctx.restore();
  }

  // Partícules (cercles translúcids estil gravat científic, deriva lenta ~25-30s)
  const r = mob ? 2.5 : 3.2;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (const p of A.parts) {
    if (p.moving) {
      p.mt += dt;
      const q = clamp((p.mt - p.delay) / p.dur, 0, 1);
      const e = ease(q);
      const arc = -14 * Math.sin(Math.PI * e);
      p.x = lerp(p.sx, p.tx, e);
      p.y = lerp(p.sy, p.ty, e) + arc;
      if (q >= 1) p.moving = false;
    } else {
      p.x += (p.tx - p.x) * (RM ? 1 : .2);
      p.y += (p.ty - p.y) * (RM ? 1 : .2);
    }
    p.al += (p.tal - p.al) * (RM ? 1 : Math.min(1, dt * 6));
    if (p.al < .02) continue;

    // Hover: atenua suaument la resta a ~0,48 (mai a 0,15)
    let dim = 1;
    if (A.hov && A.hov !== "all") {
      const match = (s === 1 || s === 2) ? (p.o === A.hov) : (p.d === A.hov);
      dim = match ? 1 : .48;
    }

    // Deriva lenta contemplativa (~28 s de període)
    let jx = 0, jy = 0;
    if (!RM && !p.moving && s !== 8) {
      const amp = p.where === "A" || p.where === "airAll" ? 1.8 : .9;
      jx = Math.sin(t * .24 + p.ph) * amp;
      jy = Math.cos(t * .19 + p.ph * 1.3) * amp * .8;
    }

    const alpha = p.al * dim;
    if (p.col === PAL.imb) {
      ctx.strokeStyle = V.alpha(PAL.imb, alpha * .9);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x + jx, p.y + jy, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = V.alpha(p.col, alpha * (p.col === PAL.land ? .82 : .76));
      ctx.beginPath();
      ctx.arc(p.x + jx, p.y + jy, r, 0, Math.PI * 2);
      ctx.fill();
      if (p.col === PAL.landUse) {
        ctx.strokeStyle = V.alpha(PAL.landUseEdge, alpha * .55);
        ctx.lineWidth = .6;
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

const aPlot = document.getElementById("aPlot");
const aTip = V.tip(aPlot);
V.mount(aPlot, (el, w) => {
  if (A.loopH) { A.loopH.stop(); A.loopH = null; }
  const mob = w < 520;
  const h = Math.round(mob ? clamp(w * .74, 240, 320) : clamp(w * .60, 340, 440));
  A.W = w; A.H = h;
  A.g = geoA(w, h);
  const lay = hybridLayer(el, w, h, "Esquema animat amb dades reals: 427 punts representen les 42,8 Gt de CO₂ emeses el 2025. 384 surten de combustibles fòssils i ciment i 43 del canvi d'ús del sòl. 117 acaben a l'oceà, 133 a la terra, 160 es queden a l'atmosfera i 17 són el desquadrament.");
  A.ctx = lay.ctx; A.svg = lay.svg;
  A.ov = lay.svg.append("g");
  A.hvG = lay.svg.append("g").style("pointer-events", "none");

  A.parts.forEach(p => { p.where = null; });
  targetsA(A.step, true);
  renderOverlayA();

  V.hover(lay.svg.node(), (ev, [px, py]) => {
    const hit = (A.hits || []).find(h => px >= h.box.x0 - 6 && px <= h.box.x1 + 6 && py >= h.box.y0 - 16 && py <= h.box.y1 + 16);
    if (!hit) { A.hov = null; A.hvG.selectAll("*").remove(); aTip.hide(); return; }
    A.hov = hit.id;
    A.hvG.selectAll("*").remove();
    A.hvG.append("rect")
      .attr("x", hit.box.x0 - 4).attr("y", hit.box.y0 - 4)
      .attr("width", Math.max(0, hit.box.x1 - hit.box.x0 + 8))
      .attr("height", Math.max(0, hit.box.y1 - hit.box.y0 + 8))
      .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1).attr("stroke-dasharray", "3 2").attr("opacity", .55);
    aTip.show(hit.tip);
    if (RM) drawA(0, 0);
  }, () => {
    A.hov = null; A.hvG.selectAll("*").remove(); aTip.hide();
    if (RM) drawA(0, 0);
  });

  A.loopH = V.loop(el, drawA);
});

function onStepA(i) {
  A.step = i; A.stepT = 0; A.hov = null;
  if (A.hvG) A.hvG.selectAll("*").remove();
  aTip.hide();
  targetsA(i, false);
  renderOverlayA();
  const txt = A_TXT[i]();
  document.getElementById("aTitle").textContent = txt[0];
  document.getElementById("aVal").textContent = txt[1];
  if (RM) drawA(0, 0);
}

/* =====================================================================
   2. SCROLLY B — IB-16 (Tall científic) + IB-40 (Fils lents de partícules)
      Com absorbeixen CO₂ el mar i la vegetació
   ===================================================================== */
const B = { step: 0, W: 0, H: 0, parts: [], f: 0, ft: 0, stepT: 0, loopH: null, hov: null };
const B_TXT = [
  ["Dissolució", "Hi entren més molècules de les que en surten"],
  ["Química del carbonat", "CO₂ + H₂O + CO₃²⁻ → 2 HCO₃⁻"],
  ["Cap al fons", "El carboni hi queda de dècades a mil·lennis"],
  ["Bomba biològica", "Sobretot carboni natural que baixa com neu marina"],
  ["Fotosíntesi", "Efecte fertilitzant del CO₂: unes 12 Gt/any (2016–2025)"],
  ["La terra dona i pren", `2025: ${f1(BY[LASTREAL].U)} Gt per tala · ${f1(BY[LASTREAL].L)} Gt absorbides`]
];

V.legendCat(document.getElementById("bLg"), [
  { c: PAL.ocean, t: "Absorció oceànica" },
  { c: PAL.land, t: "Absorció vegetal / plàncton" },
  { c: PAL.air, t: "Acidificació / tala" }
]);

function geoB(w, h) {
  const f = B.f == null ? 0 : B.f;
  const mob = w < 520;
  const y0 = h * lerp(.36, .52, f);
  const shore = w * lerp(.36, .64, f);
  const mix = y0 + h * .15;
  const ox0 = shore + w * .06;
  const tx0 = w * .07, tx1 = shore - w * lerp(.16, .20, f);
  const K = [1, 1.16, .94, 1.1, .9];
  const trees = K.map((k, i) => [lerp(tx0, tx1, i / 4), k * lerp(1, 1.16, f)]);
  const fire = [shore - w * lerp(.14, .17, f), shore - w * lerp(.07, .09, f)];
  const tr = Math.max(9, w * lerp(.028, .038, f));
  return { w, h, mob, y0, shore, mix, ox0, trees, fire, tr };
}

function initB(s) {
  const R = V.rng(11 + s);
  B.parts = [];
  B.R = R;
  const n = s <= 2 ? 96 : 72;
  for (let i = 0; i < n; i++) {
    // Trànsits lents contemplatius (~20–30 s)
    const p = { ph: R() * Math.PI * 2, u: R(), v: R(), age: R() * 24, life: 18 + R() * 12 };
    spawnB(p, s, true);
    B.parts.push(p);
  }
}

function spawnB(p, s, initial) {
  const g = B.g, R = B.R;
  if (!g || !R) return;
  p.age = initial ? R() * p.life : 0;
  p.state = 0;
  if (s <= 1) {
    p.x = lerp(g.ox0, g.w - 10, R());
    p.y = initial ? lerp(g.h * .08, g.mix - 4, R()) : lerp(g.h * .06, g.y0 - 8, R());
    p.enter = R() < .66;
    p.vx = (R() - .5) * 2.2;
    p.vy = 5 + R() * 4.5;
    p.kind = "air";
    if (initial && p.y >= g.y0) p.state = 1;
  } else if (s === 2) {
    p.u = R(); p.d = R(); p.v = .034 + R() * .014; // ~24-30s volta completa
    p.kind = "loop";
  } else if (s === 3) {
    p.x = lerp(g.ox0, g.w - 10, R());
    p.y = initial ? lerp(g.y0 + 6, g.h - 10, R()) : lerp(g.y0 + 6, g.mix, R() * .5);
    p.vy = 7 + R() * 5;
    p.kind = "snow";
  } else if (s === 4) {
    const resp = R() < .36;
    p.kind = resp ? "resp" : "photo";
    const t = g.trees[Math.floor(R() * g.trees.length)];
    if (resp) {
      p.sx = lerp(g.w * .03, g.shore - g.w * .07, R()); p.sy = g.y0 + 4;
      p.tx = p.sx + (R() - .5) * 18; p.ty = lerp(g.h * .06, g.y0 * .55, R());
    } else {
      p.sx = lerp(g.w * .02, g.shore - g.w * .03, R()); p.sy = lerp(g.h * .05, g.y0 * .42, R());
      p.tx = t[0] + (R() - .5) * g.tr * 1.4; p.ty = g.y0 - g.h * .12 * t[1] - g.tr * .2;
    }
    p.life = 16 + R() * 10;
  } else {
    const fire = R() < .28;
    p.kind = fire ? "fire" : "photo";
    if (fire) {
      p.sx = lerp(g.fire[0], g.fire[1], R()); p.sy = g.y0 - 2;
      p.tx = p.sx + (R() - .25) * 38; p.ty = lerp(g.h * .06, g.y0 * .48, R());
    } else {
      const t = g.trees[Math.floor(R() * g.trees.length)];
      p.sx = lerp(g.w * .02, g.shore - g.w * .05, R()); p.sy = lerp(g.h * .05, g.y0 * .42, R());
      p.tx = t[0] + (R() - .5) * g.tr * 1.4; p.ty = g.y0 - g.h * .12 * t[1] - g.tr * .2;
    }
    p.life = 16 + R() * 10;
  }
}

function loopPosB(u, d) {
  const g = B.g;
  const x0 = g.ox0 + g.w * .03, x1 = g.w - g.w * .04;
  const yT = g.y0 + g.h * .045, yB = g.h * .91;
  const cx = (x0 + x1) / 2, cy = (yT + yB) / 2;
  const k = 1 - d * .42;
  const rx = (x1 - x0) / 2 * k, ry = (yB - yT) / 2 * (1 - d * .48);
  const th = -Math.PI / 2 + 2 * Math.PI * u;
  const c = Math.cos(th), s = Math.sin(th), e = .52;
  return [cx + rx * Math.sign(c) * Math.pow(Math.abs(c), e), cy + ry * Math.sign(s) * Math.pow(Math.abs(s), e)];
}

function drawB(tMs, dtMs) {
  const ctx = B.ctx;
  if (!ctx || !B.W) return;
  const t = RM ? 0 : tMs / 1000;
  const dt = Math.min(.05, dtMs / 1000);
  B.stepT += dt;
  B.ft = B.step >= 4 ? 1 : 0;
  B.f += (B.ft - B.f) * (RM ? 1 : Math.min(1, dt * 3.5));
  const g = B.g = geoB(B.W, B.H);
  const s = B.step, mob = g.mob, fa = Math.min(1, B.stepT * 2.2), sp = RM ? 0 : 1;

  ctx.clearRect(0, 0, g.w, g.h);

  // 1. Tall geològic silenciós (IB-16): aigua translúcida suau en blau, terra en C.land (#ECEBE8)
  const og = ctx.createLinearGradient(0, g.y0, 0, g.h);
  og.addColorStop(0, V.alpha(C.blau, .06));
  og.addColorStop(.28, V.alpha(C.blau, .10));
  og.addColorStop(1, V.alpha(C.blau, .18));
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.moveTo(g.shore - g.w * .05, g.y0);
  ctx.lineTo(g.w, g.y0); ctx.lineTo(g.w, g.h); ctx.lineTo(g.shore - g.w * .05, g.h);
  ctx.fill();

  // Termoclina / límit capa de mescla (fil finíssim)
  ctx.save();
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = V.alpha(C.blau, .45);
  ctx.lineWidth = .7;
  ctx.beginPath(); ctx.moveTo(g.ox0 - g.w * .02, g.mix); ctx.lineTo(g.w, g.mix); ctx.stroke();
  ctx.restore();

  // Terra silenciosa (C.land, sense marrons ni contorns durs)
  ctx.fillStyle = C.land;
  ctx.beginPath();
  ctx.moveTo(0, g.y0);
  ctx.lineTo(g.shore - g.w * .07, g.y0);
  ctx.bezierCurveTo(g.shore - g.w * .02, g.y0 + g.h * .06, g.shore, g.y0 + g.h * .32, g.shore + g.w * .08, g.h);
  ctx.lineTo(0, g.h); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = C.landEdge; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.moveTo(0, g.y0); ctx.lineTo(g.shore - g.w * .07, g.y0); ctx.stroke();

  // Superfície del mar (línia fina de gravat)
  ctx.strokeStyle = V.alpha(C.blau, .75); ctx.lineWidth = .9;
  ctx.beginPath();
  for (let x = g.shore - g.w * .065; x <= g.w; x += 4) {
    const y = g.y0 + Math.sin(x * .045 + t * .6) * 1.1;
    if (x === g.shore - g.w * .065) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Siluetes botàniques delicades (capçades translúcides en groc/grocClar multiply, mai verd)
  const treeAlpha = s <= 3 ? .52 : 1;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  g.trees.forEach(([x, k]) => {
    const h = g.h * .125 * k, y = g.y0 - h;
    ctx.strokeStyle = V.alpha(C.ink2, .55 * treeAlpha);
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(x, g.y0); ctx.lineTo(x, y); ctx.stroke();
    // Arrels fines
    ctx.strokeStyle = V.alpha(C.muted, .42 * treeAlpha);
    ctx.lineWidth = .65;
    ctx.beginPath();
    ctx.moveTo(x, g.y0); ctx.lineTo(x - 8, g.y0 + 11);
    ctx.moveTo(x, g.y0); ctx.lineTo(x + 7, g.y0 + 13);
    ctx.stroke();
    // Capçada d'aquarel·la groga
    ctx.fillStyle = V.alpha(C.groc, .36 * treeAlpha);
    ctx.beginPath(); ctx.arc(x, y - g.tr * .28, g.tr * 1.08, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();

  // Clariana de tala (soca fina + plomall translúcid vermell al pas 5)
  ctx.strokeStyle = V.alpha(C.vermellFosc, .6 * treeAlpha);
  ctx.lineWidth = 1.3;
  for (let k = 0; k < 3; k++) {
    const x = lerp(g.fire[0], g.fire[1], .2 + .3 * k);
    ctx.beginPath(); ctx.moveTo(x, g.y0); ctx.lineTo(x, g.y0 - 4.5); ctx.stroke();
  }
  if (s === 5) {
    const fx = (g.fire[0] + g.fire[1]) / 2;
    const grad = ctx.createLinearGradient(fx, g.y0, fx + 14, g.h * .08);
    grad.addColorStop(0, V.alpha(C.vermell, .24 * fa));
    grad.addColorStop(1, V.alpha(C.vermell, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(g.fire[0], g.y0);
    ctx.quadraticCurveTo(fx - 12, g.y0 * .55, fx + 18, g.h * .08);
    ctx.quadraticCurveTo(fx + 22, g.y0 * .55, g.fire[1], g.y0);
    ctx.closePath();
    ctx.fill();
  }

  // Cinta de circulació profunda al pas 2 (estil IB-40)
  if (s === 2) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.strokeStyle = V.alpha(C.blau, .14 * fa);
    ctx.lineWidth = mob ? 18 : 26;
    ctx.beginPath();
    for (let u = 0; u <= 1.001; u += .008) {
      const q = loopPosB(u, .5);
      if (u === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
    }
    ctx.closePath(); ctx.stroke();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = V.alpha(C.blau, .55 * fa);
    ctx.lineWidth = .9;
    ctx.stroke();
    ctx.restore();
  }

  // Fitoplàncton translúcid al pas 3 (groc d'aquarel·la a la capa fòtica)
  if (s === 3) {
    const R = V.rng(5);
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    for (let i = 0; i < 65; i++) {
      const px = lerp(g.ox0, g.w - 8, R());
      const py = lerp(g.y0 + 4, g.mix - 4, R()) + Math.sin(t * .5 + i) * 1;
      ctx.fillStyle = V.alpha(C.grocFosc, .55 * fa);
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // Partícules amb micro-estela lenta (estil IB-28 / IB-40)
  ctx.save();
  for (const p of B.parts) {
    p.age += dt * sp;
    let x, y, px, py, col = C.ink, al = 1;
    if (p.kind === "air") {
      px = p.x; py = p.y;
      if (p.state === 0) {
        p.y += p.vy * dt * sp; p.x += p.vx * dt * sp;
        if (p.y >= g.y0) { if (p.enter) { p.state = 1; p.vy *= .32; } else { p.state = 2; p.vy = -p.vy * .7; } }
      } else if (p.state === 1) {
        p.y += p.vy * dt * sp * .5; p.x += Math.sin(t * .5 + p.ph) * dt * sp * 3;
        if (p.y > g.mix - 4) p.vy = -Math.abs(p.vy) * .5;
        if (p.y < g.y0 + 3) p.vy = Math.abs(p.vy);
      } else {
        p.y += p.vy * dt * sp;
      }
      x = p.x; y = p.y;
      col = p.state === 1 ? (s === 1 ? C.blauFosc : C.blau) : C.ink2;
      al = p.state === 2 ? clamp(1 - (g.y0 - p.y) / (g.h * .22), 0, 1) : .85;
      if (p.age > p.life || (p.state === 2 && al <= 0)) spawnB(p, s, false);
    } else if (p.kind === "loop") {
      const prev = loopPosB(p.u, p.d);
      p.u = (p.u + p.v * dt * sp) % 1;
      const cur = loopPosB(p.u, p.d);
      px = prev[0]; py = prev[1];
      x = cur[0] + Math.sin(t * .4 + p.ph) * 1.4;
      y = cur[1] + Math.cos(t * .35 + p.ph) * 1.4;
      col = C.blau; al = .78;
    } else if (p.kind === "snow") {
      px = p.x; py = p.y;
      p.y += p.vy * dt * sp * (p.y < g.mix ? .45 : .9);
      x = p.x + Math.sin(t * .45 + p.ph) * 1.8; y = p.y;
      col = C.grocFosc; al = .75;
      if (p.y > g.h - 4) spawnB(p, s, false);
    } else {
      const q = clamp(p.age / p.life, 0, 1);
      const qPrev = clamp((p.age - .35) / p.life, 0, 1);
      const e = ease(q), ep = ease(qPrev);
      x = lerp(p.sx, p.tx, e) + Math.sin(t * .4 + p.ph) * 1.2;
      y = lerp(p.sy, p.ty, e);
      px = lerp(p.sx, p.tx, ep); py = lerp(p.sy, p.ty, ep);
      col = p.kind === "photo" ? (q > .65 ? C.grocFosc : C.ink2) : p.kind === "fire" ? C.vermell : C.muted;
      al = q > .88 ? 1 - (q - .88) / .12 : q < .08 ? q / .08 : .82;
      if (q >= 1) spawnB(p, s, false);
    }
    ctx.strokeStyle = V.alpha(col, al * fa * .45);
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = V.alpha(col, al * fa);
    ctx.beginPath(); ctx.arc(x, y, mob ? 1.8 : 2.1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function renderOverlayB() {
  if (!B.ov || !B.g) return;
  const g = B.g, s = B.step, mob = g.mob, ov = B.ov;
  ov.selectAll("*").remove();

  // Etiquetes de medi silencioses
  V.t(ov, 8, 16, "Atmosfera", { size: 12, italic: true, fill: C.muted });
  V.t(ov, g.w - 8, g.y0 + 16, "Capa superficial", { size: 11.5, italic: true, fill: C.blau, anchor: "end", halo: true });
  V.t(ov, g.w - 8, g.h - 10, "Oceà profund", { size: 11.5, italic: true, fill: C.blauFosc, anchor: "end", halo: true });
  V.t(ov, 8, g.h - 10, "Terra i sòl", { size: 11.5, italic: true, fill: C.ink2 });

  // Anotacions editorials per pas amb IBV.note (sense caixes opaques ni dianes)
  if (s === 0) {
    const mx = g.ox0 + (g.w - g.ox0) * .48;
    V.note(ov, { x: mx - 12, y: g.y0 + 4, tx: mx - 38, ty: g.y0 - 44, kind: "curve", bend: -14, anchor: "end",
      lines: [["En entra més", true, C.blau], ["per pressió de CO₂"]] });
    V.note(ov, { x: mx + 14, y: g.y0 - 4, tx: mx + 40, ty: g.y0 - 34, kind: "curve", bend: 12, anchor: "start",
      lines: [["En surt menys", false, C.ink2]] });
  } else if (s === 1) {
    const cx = g.ox0 + (g.w - g.ox0) * .5, cy = g.mix + (g.h - g.mix) * .42;
    V.t(ov, cx, cy - 14, "CO₂ + H₂O + CO₃²⁻ → 2 HCO₃⁻", { size: mob ? 12.5 : 14.5, weight: 700, fill: C.ink, anchor: "middle", halo: 4 });
    V.t(ov, cx, cy + 6, "El carbonat es converteix en bicarbonat", { size: 12, fill: C.ink2, anchor: "middle", halo: 3.5 });
    V.t(ov, cx, cy + 26, "pH superficial: −0,1 unitats (+26 % acidesa)", { size: 12, weight: 700, fill: C.vermell, anchor: "middle", halo: 3.5 });
  } else if (s === 2) {
    const p1 = loopPosB(.25, .5), p2 = loopPosB(.5, 0);
    V.note(ov, { x: p1[0], y: p1[1], tx: p1[0] - 18, ty: p1[1] - 28, kind: "elbow", anchor: "end",
      lines: [["L'aigua freda s'enfonsa", true, C.blau], ["i arrossega el carboni"]] });
    V.t(ov, p2[0], Math.min(g.h - 24, p2[1] + 12), "Dècades a mil·lennis al fons (> 2.000 m)", { size: 12, weight: 700, fill: C.ink, anchor: "middle", halo: 3.5 });
  } else if (s === 3) {
    V.note(ov, { x: g.ox0 + 28, y: g.y0 + 14, tx: g.ox0 + 36, ty: g.y0 - 34, kind: "elbow", anchor: "start",
      lines: [["Fitoplàncton", true], ["fixa carboni a la llum"]] });
    V.note(ov, { x: g.ox0 + (g.w - g.ox0) * .55, y: g.mix + (g.h - g.mix) * .45, tx: g.w - 14, ty: g.mix + (g.h - g.mix) * .25, kind: "elbow", anchor: "end",
      lines: [["Neu marina", true], ["sobretot carboni natural"]] });
  } else if (s === 4) {
    const t1 = g.trees[1];
    V.note(ov, { x: t1[0], y: g.y0 - g.h * .14, tx: t1[0] + 24, ty: g.y0 - g.h * .30, kind: "curve", bend: 12, anchor: "start",
      lines: [["Fotosíntesi", true], ["~12 Gt/any per fertilització"]] });
    V.t(ov, 10, g.y0 + 22, "Respiració de plantes i sòl ↑", { size: 11.5, fill: C.ink2, halo: true });
  } else if (s === 5) {
    const fx = (g.fire[0] + g.fire[1]) / 2;
    V.note(ov, { x: fx, y: g.y0 - 12, tx: fx + (mob ? -10 : 18), ty: g.y0 - g.h * .28, kind: "elbow", anchor: mob ? "end" : "start",
      lines: [[`Tala i incendis: +${f1(BY[LASTREAL].U)} Gt`, true, C.vermell]] });
    V.t(ov, 10, g.y0 - g.h * .28, `Absorció vegetal: −${f1(BY[LASTREAL].L)} Gt`, { size: 12.5, weight: 700, fill: C.ink, halo: 3.5 });
  }
}

const bPlot = document.getElementById("bPlot");
const bTip = V.tip(bPlot);
V.mount(bPlot, (el, w) => {
  if (B.loopH) { B.loopH.stop(); B.loopH = null; }
  const mob = w < 520;
  const h = Math.round(mob ? clamp(w * .74, 240, 310) : clamp(w * .62, 340, 440));
  B.W = w; B.H = h;
  B.g = geoB(w, h);
  const lay = hybridLayer(el, w, h, "Tall esquemàtic de l'oceà i la terra: dissolució del CO₂ a la superfície marina, reacció del carbonat, enfonsament al fons, bomba biològica, fotosíntesi i emissions per tala.");
  B.ctx = lay.ctx; B.svg = lay.svg;
  B.ov = lay.svg.append("g");
  initB(B.step);
  renderOverlayB();

  V.hover(lay.svg.node(), (ev, [px, py]) => {
    const g = B.g;
    if (py < g.y0) bTip.show("<b>Atmosfera</b> · 427,7 ppm previstos el 2026 (+54 % respecte a l'era preindustrial)");
    else if (px < g.shore) bTip.show(`<b>Terra i vegetació</b> · El 2025: −${f1(BY[LASTREAL].L)} Gt absorbides, +${f1(BY[LASTREAL].U)} Gt per tala`);
    else if (py < g.mix) bTip.show(`<b>Superfície marina</b> · El 2025: −${f1(BY[LASTREAL].O)} Gt absorbides · pH −0,1 unitats`);
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
   3. KEELING — Corba sencera (1958–2026) + ampliació enllaçada
      Sistema IBV: gridY, axisX, note, tip dock, onView, paleta estricta
   ===================================================================== */
const K = {
  w0: 2022.75, span: 4,
  data: D.M.map((v, i) => {
    const mi = D.M0[1] - 1 + i, y = D.M0[0] + Math.floor(mi / 12), m = mi % 12;
    return { t: y + (m + .5) / 12, y, m, v, d: D.MD[i] };
  })
};
K.tmin = K.data[0].t - .04;
K.tmax = K.data[K.data.length - 1].t + .04;
const KMAX = K.data.reduce((a, b) => b.v > a.v ? b : a);

V.legendCat(document.getElementById("kLg"), [
  { c: C.ink, t: "Mitjana mensual", kind: "line", w: 1.8 },
  { c: C.muted, t: "Sense cicle estacional", kind: "line", w: 1.3, dash: "3 3" },
  { c: C.vermell, t: "Màxim (maig)" },
  { c: C.blau, t: "Mínim (set.–oct.)" }
]);

const kPlot = document.getElementById("kPlot");
const kTip = V.tip(kPlot);

V.mount(kPlot, (el, w) => {
  const mob = w < 640;
  const ml = mob ? 8 : 10, mr = mob ? 8 : 12;
  const top = 22, oh = mob ? 105 : 132, gap = mob ? 48 : 56, dh = mob ? 225 : 290;
  const H = top + oh + gap + dh + 28;
  const dy = top + oh + gap;

  const svg = V.svg(el, w, H, "Corba de Keeling: concentració mensual de CO₂ a Mauna Loa des del març del 1958 (315,7 ppm) fins al maig del 2026 (432,3 ppm), amb ampliació interactiva del cicle estacional.");

  const xo = d3.scaleLinear([K.tmin, K.tmax], [ml, w - mr]);
  const yo = d3.scaleLinear([310, 445], [top + oh, top]);

  // Panell superior: tota la sèrie 1958–2026
  const go = svg.append("g");
  V.gridY(go, yo, ml, w - mr, [320, 360, 400, 440], v => f0(v), { unit: " ppm" });
  V.axisX(go, xo, top + oh, mob ? [1960, 1980, 2000, 2020] : [1960, 1970, 1980, 1990, 2000, 2010, 2020], d => String(d));

  const ovArea = go.append("path").datum(K.data)
    .attr("fill", V.alpha(C.ink, .04))
    .attr("d", d3.area().x(d => xo(d.t)).y0(top + oh).y1(d => yo(d.v)));

  const ovLine = go.append("path").datum(K.data)
    .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.2)
    .attr("d", d3.line().x(d => xo(d.t)).y(d => yo(d.v)));

  const f0Pt = K.data[0];
  V.note(go, {
    x: xo(f0Pt.t), y: yo(f0Pt.v), tx: xo(f0Pt.t) + (mob ? 18 : 26), ty: yo(f0Pt.v) - (mob ? 34 : 42),
    kind: "elbow", anchor: "start", dot: true,
    lines: [[`${f1(f0Pt.v)} ppm`, true], ["març del 1958"]]
  });
  V.note(go, {
    x: xo(KMAX.t), y: yo(KMAX.v), tx: xo(KMAX.t) - (mob ? 24 : 36), ty: yo(KMAX.v) + (mob ? 22 : 16),
    kind: "elbow", anchor: "end", dot: true, stroke: C.vermell,
    lines: [[`${f1(KMAX.v)} ppm`, true, C.vermell], [`${MONTHS[KMAX.m]} del ${KMAX.y}`]]
  });

  // Finestra arrossegable + connectors
  const win = go.append("rect").attr("y", top).attr("height", oh)
    .attr("fill", V.alpha(C.vermell, .10)).attr("stroke", C.vermell).attr("stroke-width", 1.1)
    .style("cursor", "grab").attr("tabindex", 0).attr("role", "slider")
    .attr("aria-label", "Finestra de l'ampliació; arrossega o fes servir les fletxes");
  const winLab = V.t(go, 0, top + oh + 32, "", { size: 12, weight: 700, fill: C.vermell, anchor: "middle", halo: true });
  const c1 = svg.append("line").attr("stroke", C.vermell).attr("stroke-width", .7).attr("stroke-opacity", .45);
  const c2 = svg.append("line").attr("stroke", C.vermell).attr("stroke-width", .7).attr("stroke-opacity", .45);

  // Panell inferior: ampliació de 4 anys
  const gd = svg.append("g");
  const gyG = gd.append("g"), gxG = gd.append("g");
  const gmk = gd.append("rect").attr("fill", C.grid).attr("opacity", .75);
  const gmkT = V.t(gd, 0, dy + dh - 8, "", { size: 11, fill: C.muted, anchor: "middle" });
  const pd = gd.append("path").attr("fill", "none").attr("stroke", C.muted).attr("stroke-width", 1.3).attr("stroke-dasharray", "3 3");
  const pv = gd.append("path").attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.8);
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

    // Franja Maunakea (des 2022 – jul 2023)
    const mk0 = 2022 + 11 / 12, mk1 = 2023 + 6.13 / 12, a0 = Math.max(mk0, w0), a1 = Math.min(mk1, w0 + K.span);
    if (a1 > a0) {
      gmk.attr("x", xd(a0)).attr("width", xd(a1) - xd(a0)).attr("y", dy + 16).attr("height", dh - 16).attr("opacity", .7);
      gmkT.attr("x", xd((a0 + a1) / 2)).text(mob ? "Maunakea" : "mesures a Maunakea");
    } else {
      gmk.attr("opacity", 0); gmkT.text("");
    }

    pv.attr("d", d3.line().x(d => xd(d.t)).y(d => yd(d.v))(sub));
    pd.attr("d", d3.line().x(d => xd(d.t)).y(d => yd(d.d))(sub));

    dotsG.selectAll("circle").data(sub, d => d.t).join("circle")
      .attr("r", d => (d.m === 4 || d.m === 8 || d.m === 9) ? (mob ? 3.2 : 3.8) : (mob ? 2 : 2.5))
      .attr("cx", d => xd(d.t)).attr("cy", d => yd(d.v))
      .attr("fill", d => d.m === 4 ? C.vermell : (d.m === 8 || d.m === 9) ? C.blau : C.ink)
      .attr("fill-opacity", d => (d.m === 4 || d.m === 8 || d.m === 9) ? .88 : .65);

    // Etiquetes màxim / mínim anual
    labsG.selectAll("*").remove();
    const mm = [];
    yrs.concat([Math.floor(w0)]).forEach(y => {
      const ys = sub.filter(d => d.y === y);
      if (ys.length < 10) return;
      const mx = ys.reduce((a, b) => b.v > a.v ? b : a);
      const mn = ys.reduce((a, b) => b.v < a.v ? b : a);
      mm.push({ d: mx, t: MSH[mx.m], c: C.vermell, up: true }, { d: mn, t: MSH[mn.m], c: C.blau, up: false });
    });
    const uniq = [...new Map(mm.map(l => [l.d.t, l])).values()];
    uniq.forEach(l => {
      V.t(labsG, xd(l.d.t), yd(l.d.v) + (l.up ? -9 : 16), l.t, { size: 11.5, weight: 700, fill: l.c, anchor: "middle", halo: true });
    });

    // Anotacions editorials (desktop)
    let ys0 = null;
    for (const y of yrs) {
      const q = sub.filter(d => d.y === y);
      if (q.length >= 12 && q.reduce((a, b) => b.v > a.v ? b : a).m === 4) { ys0 = q; break; }
    }
    if (ys0 && !mob) {
      const mx = ys0.reduce((a, b) => b.v > a.v ? b : a);
      const mn = ys0.reduce((a, b) => b.v < a.v ? b : a);
      V.note(labsG, {
        x: xd(mx.t), y: yd(mx.v) - 16, tx: xd(mx.t) + 18, ty: yd(mx.v) - 30, kind: "straight", anchor: "start", stroke: C.vermell,
        lines: [["Màxim al maig", true, C.vermell], ["abans que el nord reverdeixi"]]
      });
      V.note(labsG, {
        x: xd(mn.t), y: yd(mn.v) + 18, tx: xd(mn.t) + 18, ty: yd(mn.v) + 34, kind: "straight", anchor: "start", stroke: C.blau,
        lines: [["Mínim a la tardor", true, C.blau], ["després de l'estiu de creixement"]]
      });
    }

    d3.selectAll("#kSeg button").attr("aria-pressed", function() { return String(Math.abs(+this.dataset.y - w0) < .05); });
  }

  // Interacció: arrossegar finestra + clic al context + teclat
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

  // Hover amb IBV.hover + IBV.focus + dock
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

  // Animació d'entrada (IBV.onView)
  V.onView(el, inst => {
    if (inst) return;
    const L = ovLine.node().getTotalLength();
    ovLine.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
      .transition().duration(1000).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0)
      .on("end", () => ovLine.attr("stroke-dasharray", null));
    ovArea.style("opacity", 0).transition().delay(400).duration(600).style("opacity", 1);
  });
});

document.querySelectorAll("#kSeg button").forEach(b => b.addEventListener("click", () => {
  if (kPlot._setK) kPlot._setK(+b.dataset.y);
}));

/* =====================================================================
   4. ANY A ANY — IB-02 (Índex de pulsacions ONI) + balanç anual (1959–2026)
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
  2024: "El Niño va durar fins a la primavera. Rècord de creixement del CO₂ mundial: 3,8 ppm. Les barres passen la línia: els models probablement sobreestimen l'absorció de la terra.",
  2025: "Recuperació: l'embornal terrestre més gran del registre.",
  2026: "Projecció. L'embornal terrestre es calcula com la resta dels altres termes, sense desquadrament. Comença un El Niño fort; l'efecte sobre el CO₂ es notarà sobretot el 2027."
};

const yLg = document.getElementById("yLg");
V.legendCat(yLg, [
  { c: PAL.air, t: "Atmosfera" },
  { c: PAL.ocean, t: "Oceà" },
  { c: PAL.land, t: "Terra" },
  { c: C.ink, t: "Emissions totals", kind: "line", w: 1.6 }
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
  const ml = mob ? 8 : 10, mr = 6, top = 22, ch = mob ? 205 : 275;
  const gap = 18, oniH = mob ? 42 : 52, bot = 24;
  const H = top + ch + gap + oniH + bot;

  const svg = V.svg(el, w, H, "Repartiment anual del CO₂ del 1959 al 2026: atmosfera, oceà i terra comparats amb les emissions totals, i pols de l'índex ONI d'El Niño a sota. Fes servir les fletxes per canviar d'any.")
    .attr("tabindex", 0);

  const x = d3.scaleBand(Y.rows.map(r => r.y), [ml, w - mr]).paddingInner(mob ? .14 : .22);
  const yy = d3.scaleLinear([0, 52], [top + ch, top]);
  const yOni = d3.scaleLinear([-1.6, 1.6], [top + ch + gap + oniH, top + ch + gap]);

  V.gridY(svg, yy, ml, w - mr, [0, 10, 20, 30, 40, 50], v => f0(v), { zero: 0, unit: " Gt CO₂" });

  // Eix de zero per a les pulsacions ONI (IB-02)
  const oniZeroY = yOni(0);
  svg.append("line").attr("x1", ml).attr("x2", w - mr).attr("y1", oniZeroY).attr("y2", oniZeroY)
    .attr("stroke", C.ink).attr("stroke-width", .7);
  V.rule(svg, ml, w - mr, yOni(.5), { stroke: C.ghost });
  V.rule(svg, ml, w - mr, yOni(-.5), { stroke: C.ghost });
  V.t(svg, ml, top + ch + gap + 9, "El Niño (+)", { size: 11, italic: true, fill: C.muted });
  V.t(svg, ml, top + ch + gap + oniH - 2, "La Niña (−)", { size: 11, italic: true, fill: C.muted });

  const barsG = svg.append("g");
  const yrGroups = barsG.selectAll("g.yb").data(Y.rows).join("g").attr("class", "yb");

  yrGroups.each(function(r) {
    const s = d3.select(this), bx = x(r.y), bw = x.bandwidth();
    let y0 = 0;
    [["L", PAL.land, .86], ["O", PAL.ocean, .86], ["A", PAL.air, .88]].forEach(([k, col, op]) => {
      const v = Math.max(0, r[k]);
      s.append("rect").attr("class", "segbar")
        .attr("x", bx).attr("width", bw)
        .attr("y", yy(y0 + v)).attr("height", Math.max(0, yy(y0) - yy(y0 + v)))
        .attr("fill", col).attr("fill-opacity", r.y === LAST ? op * .5 : op);
      y0 += v;
    });
    // Pulsació ONI (IB-02): color només fora de ±0,5 °C; neutre en gris ghost
    const o = ONI(r.y);
    if (o != null) {
      const strong = Math.abs(o) >= .5;
      const yTop = o >= 0 ? yOni(o) : oniZeroY;
      const hBar = Math.max(1, Math.abs(yOni(o) - oniZeroY));
      s.append("rect").attr("class", "oni")
        .attr("x", bx + bw * .12).attr("width", Math.max(1.4, bw * .76))
        .attr("y", yTop).attr("height", hBar)
        .attr("fill", strong ? ONI_DIV(o) : C.ghost);
    }
  });

  // Línia esglaonada d'emissions totals
  const pts = [];
  Y.rows.forEach(r => {
    const bx = x(r.y), bw = x.bandwidth(), p = x.step() * x.paddingInner() / 2;
    pts.push([bx - p, yy(r.E)], [bx + bw + p, yy(r.E)]);
  });
  const emLine = svg.append("path").attr("d", d3.line()(pts))
    .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.5);

  // Eix X d'anys
  V.axisX(svg, y => x(y) + x.bandwidth() / 2, top + ch + gap + oniH,
    mob ? [1960, 1980, 2000, 2020] : [1960, 1970, 1980, 1990, 2000, 2010, 2020], d => String(d));

  // Anotacions editorials dins del gràfic (desktop)
  const annG = svg.append("g").style("pointer-events", "none");
  if (!mob) {
    V.t(annG, x(1962), yy(BY[1962].E) - 10, "Emissions totals", { size: 12, weight: 600, fill: C.ink, halo: true });
    const r92 = BY[1992];
    V.note(annG, {
      x: x(1992) + x.bandwidth() / 2, y: yy(r92.E), tx: x(1992) - 18, ty: yy(r92.E) - 34, kind: "elbow", anchor: "end",
      lines: [["1992 · Pinatubo", true], ["només 19 % a l'aire"]]
    });
    const r24 = BY[2024];
    V.note(annG, {
      x: x(2024) + x.bandwidth() / 2, y: yy(r24.A + r24.O + r24.L), tx: x(2017), ty: top + 14, kind: "elbow", anchor: "end", stroke: C.vermell,
      lines: [["2024 · El Niño", true, C.vermell], ["+3,8 ppm (rècord)"]]
    });
  }

  // Marcador d'any seleccionat
  const selG = svg.append("g").style("pointer-events", "none");
  const selRect = selG.append("rect").attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.4);
  const selLab = V.t(selG, 0, 0, "", { size: 12, weight: 700, fill: C.ink, anchor: "middle", halo: true });

  function selectY(yr) {
    Y.sel = yr;
    const r = BY[yr], bx = x(yr), bw = x.bandwidth();
    const topV = Math.max(r.E, r.A + r.O + r.L);
    selRect.attr("x", bx - 1.5).attr("width", bw + 3)
      .attr("y", yy(topV) - 2).attr("height", yy(0) - yy(topV) + 4);
    selLab.attr("x", clamp(bx + bw / 2, 24, w - 24)).attr("y", yy(topV) - 7).text(String(yr));
    renderYearPanel(yr);
  }

  const yearAt = px => {
    const st = x.step(), i = Math.floor((px - x.range()[0] + st * x.paddingInner() / 2) / st);
    const r = Y.rows[clamp(i, 0, Y.rows.length - 1)];
    return r ? r.y : null;
  };

  // Hover (IBV.focus a 0,50 + dock) i clic/toc per fixar l'any
  V.hover(svg.node(), (ev, [px]) => {
    const yr = yearAt(px);
    if (!yr) return;
    if (ev.type === "pointerdown") selectY(yr);
    const r = BY[yr], o = ONI(yr);
    V.focus(yrGroups, d => d.y === yr || d.y === Y.sel, { dim: .50 });
    yTip.show(`<b>${yr}${yr === LAST ? " (projecció)" : ""}</b> · Emès ${f1(r.E)} Gt · Aire ${pct(r.A / r.E)} · Oceà ${pct(r.O / r.E)} · Terra ${pct(r.L / r.E)}${o != null ? ` · ONI ${V.signed(o, 2)} °C` : ""}`);
  }, () => {
    V.focus(yrGroups, null);
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

  // Animació d'entrada (IBV.onView)
  V.onView(el, inst => {
    if (inst) return;
    yrGroups.style("opacity", 0).transition().delay((d, i) => i * 7).duration(420).style("opacity", 1);
    const L = emLine.node().getTotalLength();
    emLine.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
      .transition().delay(200).duration(900).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0)
      .on("end", () => emLine.attr("stroke-dasharray", null));
  });
});

document.querySelectorAll("#ySeg button").forEach(b => b.addEventListener("click", () => {
  if (yPlot._selectY) yPlot._selectY(+b.dataset.y);
}));

/* =====================================================================
   5. DES DEL 1850 — IB-47 (Corrent apilat bidireccional, anual / acumulat)
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
  ["F", PAL.fossil, 1, "Fòssil i ciment", .82],
  ["U", PAL.landUse, 1, "Ús del sòl", .92],
  ["A", PAL.air, -1, "Atmosfera", .88],
  ["O", PAL.ocean, -1, "Oceà", .86],
  ["L", PAL.land, -1, "Terra", .85]
];

V.legendCat(document.getElementById("hLg"), [
  { c: PAL.fossil, t: "Fòssil i ciment" },
  { c: PAL.landUse, t: "Ús del sòl" },
  { c: PAL.air, t: "Atmosfera" },
  { c: PAL.ocean, t: "Oceà" },
  { c: PAL.land, t: "Terra" }
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
  const ml = mob ? 8 : 10, mr = mob ? 8 : 138, top = 22, ch = mob ? 300 : 410, H = top + ch + 28;
  const svg = V.svg(el, w, H, "Corrent apilat bidireccional del 1850 al 2026: emissions fòssils i per ús del sòl a dalt; CO₂ acumulat a l'atmosfera, l'oceà i la terra a baix. Del 1850 al 2025 es van emetre 2.765 Gt de CO₂.");

  const x = d3.scaleLinear([1850, LAST + 1], [ml, w - mr]);
  const gyG = svg.append("g");
  V.axisX(svg, x, top + ch, mob ? [1850, 1900, 1950, 2000] : [1850, 1875, 1900, 1925, 1950, 1975, 2000, 2025], d => String(d));

  const clipId = "hclip-" + Math.random().toString(36).slice(2, 7);
  const clipRect = svg.append("defs").append("clipPath").attr("id", clipId)
    .append("rect").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", ch);

  const areasG = svg.append("g").attr("clip-path", `url(#${clipId})`);
  const zeroLine = svg.append("line").attr("x1", ml).attr("x2", w - mr).attr("stroke", C.ink).attr("stroke-width", 1);
  const projRect = svg.append("rect").attr("x", x(LAST)).attr("width", Math.max(2, x(LAST + 1) - x(LAST)))
    .attr("y", top).attr("height", ch).attr("fill", C.paper).attr("opacity", .48).style("pointer-events", "none");
  const annG = svg.append("g").style("pointer-events", "none");
  const labsG = svg.append("g").style("pointer-events", "none");
  const hvG = svg.append("g").style("pointer-events", "none");
  const hit = svg.append("rect").attr("class", "hit").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", ch).attr("fill", "transparent");

  let yScale, curStack;

  function drawH(instant) {
    const cum = Hh.cum;
    curStack = stackH(cum);
    const lim = cum ? 3200 : 55;
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
      .attr("fill", d => d[1])
      .attr("fill-opacity", d => d[4])
      .attr("stroke", C.paper)
      .attr("stroke-width", .7);

    (instant || RM ? paths : paths.transition().duration(750).ease(d3.easeCubicInOut))
      .attr("d", d => areaGen(d[0])(Hh.rows));

    // Etiquetes directes a la dreta (desktop, mai text en groc)
    labsG.selectAll("*").remove();
    annG.selectAll("*").remove();
    const i25 = Hh.rows.findIndex(d => d.y === LASTREAL), r25 = Hh.rows[i25];
    if (!mob) {
      const xl = w - mr + 10, tot = cum ? r25.c.F + r25.c.U : 0;
      let ys = HKEYS.map(([k, col, , nm]) => ({
        k, nm, col: k === "L" ? C.ink : k === "U" ? PAL.landUseEdge : col,
        y: yScale((curStack[k][i25][0] + curStack[k][i25][1]) / 2)
      }));
      for (let it = 0; it < 24; it++) {
        for (let j = 1; j < ys.length; j++) {
          if (ys[j].y - ys[j - 1].y < 34) {
            const d = (34 - (ys[j].y - ys[j - 1].y)) / 2;
            ys[j].y += d; ys[j - 1].y -= d;
          }
        }
      }
      V.t(labsG, xl, top + 6, cum ? "Acumulat 1850–2025" : "El 2025", { size: 11, fill: C.muted });
      ys.forEach(o => {
        const v = cum ? r25.c[o.k] : r25.a[o.k];
        V.t(labsG, xl, o.y - 1, o.nm, { size: 12, weight: 700, fill: o.col });
        V.t(labsG, xl, o.y + 14, cum && ["A", "O", "L"].includes(o.k) ? `${f0(v)} Gt · ${pct(v / tot)}` : `${cum ? f0(v) : f1(v)} Gt`, { size: 11.5, fill: C.ink2 });
      });
    }

    V.t(annG, ml + 4, yScale(cum ? 2500 : 44), "Emissions ↑", { size: 12, weight: 700, fill: C.ink, halo: true });
    V.t(annG, ml + 4, yScale(cum ? -2500 : -44), "On van ↓", { size: 12, weight: 700, fill: C.ink, halo: true });

    if (!cum && !mob) {
      V.note(annG, {
        x: x(1900), y: yScale(BY[1900].E), tx: x(1900) + 12, ty: yScale(BY[1900].E + 18), kind: "elbow", anchor: "start",
        lines: [["Fins a mitjan segle XX,", true], ["la tala superava els fòssils"]]
      });
      V.note(annG, {
        x: x(1959), y: yScale(-BY[1959].A - BY[1959].O - BY[1959].L), tx: x(1959) - 12, ty: yScale(-36), kind: "elbow", anchor: "end",
        lines: [["Des del 1959", true], ["mesures directes a l'aire"]]
      });
    }
    if (mob && cum) {
      const tot = r25.c.F + r25.c.U;
      V.t(annG, w - mr, yScale(-2850), `Aire ${pct(r25.c.A / tot)} · Oceà ${pct(r25.c.O / tot)} · Terra ${pct(r25.c.L / tot)}`, { size: 11, fill: C.ink2, anchor: "end", halo: true });
    }
    d3.selectAll("#hSeg button").attr("aria-pressed", function() { return String(+this.dataset.v === cum); });
  }

  V.hover(hit.node(), (ev, [px]) => {
    const yr = clamp(Math.floor(x.invert(px)), 1850, LAST);
    const d = Hh.rows.find(r => r.y === yr);
    if (!d) return;
    const v = Hh.cum ? d.c : d.a, xx = x(yr + .5), fmtV = val => Hh.cum ? f0(val) : f1(val);
    hvG.selectAll("*").remove();
    hvG.append("line").attr("x1", xx).attr("x2", xx).attr("y1", top).attr("y2", top + ch)
      .attr("stroke", C.ink).attr("stroke-width", .8).attr("stroke-dasharray", "2 2");
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
   6. PERSISTÈNCIA — IB-49 (Temps profund en escala logarítmica) + corba d'impuls
      Model multimodel (Joos et al. 2013, taula 5; IPCC AR5 Box 6.1)
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
  { c: PAL.air, t: "Atmosfera" },
  { c: PAL.ocean, t: "Oceà" },
  { c: PAL.land, t: "Terra" }
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
  const ml = mob ? 8 : 10, mr = mob ? 14 : 20, top = 22, ch = mob ? 200 : 255;
  const bg = mob ? 24 : 26, H = top + ch + 46 + BANDS.length * bg + 6;

  const svg = V.svg(el, w, H, "Simulació multimodel de la persistència del CO₂ en escala logarítmica: als 20 anys resta un 60 % a l'aire, als 100 anys un 41 % i als 1.000 anys un 25 %. Més enllà, els carbonats del fons marí i la meteorització de les roques retiren la resta en desenes o centenars de milers d'anys.");

  const x = d3.scaleSymlog().constant(1).domain([0, 1e6]).range([ml, w - mr]);
  const y = d3.scaleLinear([0, 100], [top + ch, top]);

  V.gridY(svg, y, ml, w - mr, [0, 25, 50, 75, 100], v => v + " %", { zero: 0 });
  const tv = [0, 1, 10, 100, 1e3, 1e4, 1e5, 1e6];
  V.axisX(svg, x, top + ch, tv, v => mob && v >= 1e4 ? (v >= 1e6 ? "1 M" : (v / 1e3) + " mil") : f0(v));
  V.t(svg, w - mr, top + ch + 32, "Escala logarítmica · anys després de l'emissió →", { size: 11.5, italic: true, fill: C.muted, anchor: "end" });

  const ts = [];
  for (let t = 0; t <= 1000; t += t < 10 ? .25 : t < 100 ? 1 : 5) ts.push(t);
  const pts = ts.map(t => ({ t, ...partsAt(t) }));

  const clipId = "pclip-" + Math.random().toString(36).slice(2, 7);
  const clipRect = svg.append("defs").append("clipPath").attr("id", clipId)
    .append("rect").attr("x", ml).attr("y", top).attr("width", x(1000) - ml).attr("height", ch);

  const areaG = svg.append("g").attr("clip-path", `url(#${clipId})`);
  const mkAr = (f0fn, f1fn, col, op) => areaG.append("path").datum(pts)
    .attr("fill", col).attr("fill-opacity", op).attr("stroke", C.paper).attr("stroke-width", .7)
    .attr("d", d3.area().x(d => x(d.t)).y0(d => y(f0fn(d))).y1(d => y(f1fn(d))));
  mkAr(() => 0, d => d.a, PAL.air, .86);
  mkAr(d => d.a, d => d.a + d.o, PAL.ocean, .84);
  mkAr(d => d.a + d.o, () => 100, PAL.land, .82);
  areaG.append("path").datum(pts).attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.5)
    .attr("d", d3.line().x(d => x(d.t)).y(d => y(d.a)));

  // Zona fora del model (> 1.000 anys): trama diagonal fina (P1)
  const x1k = x(1000);
  const patId = "pHatch-" + Math.random().toString(36).slice(2, 7);
  const pat = svg.select("defs").append("pattern").attr("id", patId).attr("width", 7).attr("height", 7)
    .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
  pat.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 7).attr("stroke", C.hair).attr("stroke-width", 1.1);
  svg.append("rect").attr("x", x1k).attr("y", top).attr("width", Math.max(0, w - mr - x1k)).attr("height", ch).attr("fill", `url(#${patId})`);
  svg.append("line").attr("x1", x1k).attr("x2", x1k).attr("y1", top).attr("y2", top + ch)
    .attr("stroke", C.ink).attr("stroke-dasharray", "3 3").attr("stroke-width", .8);

  const xm = (x1k + w - mr) / 2;
  V.t(svg, xm, top + ch * .44, "Fora del model (> 1.000 anys)", { size: mob ? 11.5 : 12.5, weight: 700, fill: C.ink2, anchor: "middle", halo: true });
  V.t(svg, xm, top + ch * .44 + 16, mob ? "carbonats i roques" : "carbonats del fons i meteorització de roques", { size: 11.5, fill: C.muted, anchor: "middle", halo: true });

  // Etiquetes dins les capes (tinta sobre groc, blanc sobre vermell i blau)
  const tl = mob ? 320 : 220, pl = partsAt(tl);
  V.t(svg, x(tl), y(pl.a / 2) + 4, "Atmosfera", { size: 12, weight: 700, fill: C.paper, anchor: "middle" });
  V.t(svg, x(tl), y(pl.a + pl.o / 2) + 4, "Oceà", { size: 12, weight: 700, fill: C.paper, anchor: "middle" });
  V.t(svg, x(tl), y(pl.a + pl.o + pl.l / 2) + 4, "Terra", { size: 12, weight: 700, fill: C.ink, anchor: "middle" });

  // Fites clau (20 i 100 anys)
  [[20, "20 anys"], [100, "100 anys"]].forEach(([t]) => {
    const v = partsAt(t).a;
    svg.append("circle").attr("cx", x(t)).attr("cy", y(v)).attr("r", 3).attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1);
  });

  // Franges de processos de retirada (IB-49 temps profund)
  const bandsG = svg.append("g");
  BANDS.forEach(([nm, a, b, col], i) => {
    const by = top + ch + 52 + i * bg;
    const xA = x(a), xB = x(b);
    const bgItem = bandsG.append("g").datum({ nm, a, b });
    bgItem.append("rect").attr("x", xA).attr("width", Math.max(4, xB - xA)).attr("y", by).attr("height", 7)
      .attr("fill", col).attr("fill-opacity", .82).attr("rx", 3.5);
    const tx = clamp((xA + xB) / 2, ml + 72, w - mr - 72);
    V.t(bgItem, tx, by - 4, nm, { size: mob ? 11 : 12, fill: C.ink2, anchor: "middle" });
  });

  // Marcador interactiu
  const mkG = svg.append("g").style("pointer-events", "none");
  const mkLine = mkG.append("line").attr("y1", top).attr("y2", top + ch).attr("stroke", C.ink).attr("stroke-width", 1.2);
  const mkDot = mkG.append("circle").attr("r", 4.5).attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1.5);
  const mkLab = V.t(mkG, 0, 0, "", { size: 12, weight: 700, fill: C.ink, halo: 3.5 });

  function setP(t) {
    t = clamp(t, 0, 1000);
    P.t = t;
    const p = partsAt(t), px = x(t);
    mkLine.attr("x1", px).attr("x2", px);
    mkDot.attr("cx", px).attr("cy", y(p.a));
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

  // Hover directe sobre el gràfic (sincronitza amb el lliscant)
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
