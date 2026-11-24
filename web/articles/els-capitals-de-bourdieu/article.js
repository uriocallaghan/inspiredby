/* «Els quatre capitals de Pierre Bourdieu» · cinc gràfics del sistema infogràfic
   V1 · LINK-05 + LINK-03 (scrolly 5 passos): Els quatre capitals i les conversions
   V2 · CASE-01 (interactiu, dades reals): Accés a la universitat a França 1961–1962 (Les Héritiers)
   V3 · SPREAD-02 (scrolly 4 passos): L'espai social en dues dimensions (La Distinction)
   V4 · CASE-02 (interactiu, dades reals): Preferències musicals per classe i titulació (La Distinction)
   V5 · CASE-01 (interactiu, dades reals): Les set classes del Regne Unit (Savage et al., 2013) */
(function(){
"use strict";
const V = IBV, C = V.C, D = window.BOURDIEU_DATA;
if(!V || !D) return;
const $ = s => document.querySelector(s);
const f0 = V.fmt(",.0f"), f1 = V.fmt(",.1f");
const EIO = d3.easeCubicInOut;

function bindSeg(figSel, cb){
  const root = $(figSel); if(!root) return;
  const btns = root.querySelectorAll(".seg button");
  btns.forEach(b => b.addEventListener("click", () => {
    btns.forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    cb(b.dataset.k);
  }));
}

/* =========================================================================
   V1 · LINK-05 + LINK-03 (Scrolly 5 passos): Les quatre monedes i conversions
   ========================================================================= */
(function(){
  const el = $("#cap-viz"), stepsEl = $("#s-capitals .steps"), gEl = $("#s-capitals .graphic");
  if(!el) return;
  const lg = $("#cap-lg");
  if(lg) V.legendCat(lg, [
    {c: C.red, t: "Econòmic", a: .42},
    {c: C.blue, t: "Cultural", a: .42},
    {c: C.yellow, t: "Social", a: .55},
    {c: C.ink, t: "Simbòlic (legitimitat)", kind: "ring"}
  ]);

  const NODES = [
    {id: "eco", name: "Econòmic", sub: "Diners, patrimoni, liquiditat", c: C.red, a: .34, rx: -0.30, ry: -0.18},
    {id: "cul", name: "Cultural", sub: "Incorporat, objectivat i títols", c: C.blue, a: .34, rx: 0.30, ry: -0.18},
    {id: "soc", name: "Social",   sub: "Xarxa duradora i contactes", c: C.yellow, a: .48, rx: 0.0, ry: 0.34}
  ];
  const SUB_CUL = [
    {n: "Incorporat", d: "cos, parla, gust", dx: -0.66, dy: -0.78},
    {n: "Objectivat", d: "llibres, obres", dx: 0.62, dy: -0.78},
    {n: "Institucionalitzat", d: "títols, diplomes", dx: 0.0, dy: 0.92}
  ];
  const FLOWS = [
    {from: "eco", to: "cul", label: "Escoles i temps", c: C.red, speed: 0.036, n: 7},
    {from: "cul", to: "soc", label: "Clubs i promocions", c: C.blue, speed: 0.032, n: 6},
    {from: "soc", to: "eco", label: "Feines i oportunitats", c: C.ink2, speed: 0.040, n: 7}
  ];
  const TITLES = {
    eco: ["1 · Capital econòmic", "La moneda més líquida: es transfereix en segons i es mesura en xifres"],
    cul: ["2 · Capital cultural", "Tres estats: cos i parla (incorporat), llibres (objectivat) i diplomes (institucionalitzat)"],
    soc: ["3 · Capital social", "Recursos lligats a pertànyer a una xarxa estable que exigeix manteniment"],
    sim: ["4 · Capital simbòlic", "Quan qualsevol dels tres anteriors es reconeix com a honor, mèrit o autoritat"],
    conv: ["5 · Les conversions entre capitals", "El diner es mou de pressa; incorporar cultura o construir honor exigeix anys"]
  };

  let curStep = "eco", applyStep = null, stopLoop = null;

  V.mount(el, (container, w) => {
    if(stopLoop){ stopLoop(); stopLoop = null; }
    const mob = w < 600;
    const h = mob ? Math.round(Math.max(205, Math.min(window.innerHeight * 0.30, 250))) : 420;
    const cx = w / 2, cy = h / 2 + (mob ? 4 : 8);
    const span = Math.min(w * 0.44, h * 0.43);
    const R = mob ? Math.min(48, span * 0.56) : Math.min(82, span * 0.58);
    const Rsim = Math.min(w * 0.46, h * 0.46);

    const svg = V.svg(container, w, h, "Esquema conceptual dels quatre tipus de capital de Pierre Bourdieu: econòmic en vermell, cultural en blau, social en groc, envoltats pel capital simbòlic i connectats per canals de conversió.");
    const g = svg.append("g");

    // Eix suau de fons (LINK-05)
    g.append("line").attr("x1", cx - Rsim).attr("x2", cx + Rsim).attr("y1", cy).attr("y2", cy)
      .attr("stroke", C.grid).attr("stroke-width", .7).attr("stroke-dasharray", "2 4");

    // Cercle exterior: capital simbòlic (el marc que legitima)
    const simG = g.append("g").attr("class", "sim-g");
    const simRing = simG.append("circle").attr("cx", cx).attr("cy", cy).attr("r", Rsim)
      .attr("fill", "none").attr("stroke", C.ink2).attr("stroke-width", 1.1).attr("stroke-dasharray", "4 4").attr("stroke-opacity", .45);
    const simLbl = V.t(simG, cx, cy - Rsim + (mob ? 13 : 16), "Capital simbòlic · honor i legitimitat", {size: mob ? 11 : 12.5, weight: 600, anchor: "middle", fill: C.ink2, halo: true});

    // Posicions dels 3 cercles principals
    const pos = {};
    NODES.forEach(n => {
      pos[n.id] = { x: cx + n.rx * span * (mob ? 1.55 : 1.75), y: cy + n.ry * span * (mob ? 1.45 : 1.55) };
    });

    // Camins de conversió (LINK-03)
    const flowG = g.append("g").attr("class", "flow-g").style("opacity", 0);
    const flowPaths = FLOWS.map((fl, i) => {
      const a = pos[fl.from], b = pos[fl.to];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = mx - cx, dy = my - cy;
      const qx = cx + dx * 1.48, qy = cy + dy * 1.48;
      const dStr = `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
      const p = flowG.append("path").attr("d", dStr).attr("fill", "none")
        .attr("stroke", fl.c).attr("stroke-width", mob ? 5 : 8).attr("stroke-opacity", .14).attr("stroke-linecap", "round");
      const pLine = flowG.append("path").attr("d", dStr).attr("fill", "none")
        .attr("stroke", fl.c).attr("stroke-width", 1).attr("stroke-opacity", .55).attr("stroke-dasharray", "3 4");
      if(!mob){
        V.t(flowG, qx, qy + (i === 0 ? -12 : 14), fl.label, {size: 11.5, fill: C.ink2, anchor: "middle", halo: true});
      }
      const node = pLine.node();
      const len = node ? node.getTotalLength() : 100;
      const dots = d3.range(fl.n).map(k => ({
        t0: k / fl.n,
        el: flowG.append("circle").attr("r", mob ? 2.1 : 2.6).attr("fill", fl.c).attr("fill-opacity", .85)
      }));
      return {fl, node, len, dots, p};
    });

    // Cercles dels 3 capitals (LINK-05: cercles translúcids multiply)
    const nodeG = g.selectAll("g.cap-n").data(NODES, d => d.id).join("g")
      .attr("class", "cap-n")
      .attr("transform", d => `translate(${pos[d.id].x},${pos[d.id].y})`);

    nodeG.append("circle").attr("class", "bg")
      .attr("r", R).attr("fill", d => d.c).attr("fill-opacity", d => d.a)
      .style("mix-blend-mode", "multiply")
      .attr("stroke", d => d.c === C.yellow ? C.ink2 : d.c).attr("stroke-width", .9).attr("stroke-opacity", .5);

    nodeG.append("circle").attr("r", 2.6).attr("fill", C.ink);

    nodeG.each(function(d){
      const gr = d3.select(this);
      V.t(gr, 0, -6, d.name, {size: mob ? 12.5 : 15, weight: 700, anchor: "middle", fill: C.ink, halo: true});
      if(!mob){
        V.t(gr, 0, 12, d.sub, {size: 11.5, anchor: "middle", fill: C.ink2, halo: true});
      }
    });

    // Tres estats del capital cultural (visibles al pas "cul")
    const culPos = pos.cul;
    const subCulG = g.append("g").attr("class", "sub-cul").attr("transform", `translate(${culPos.x},${culPos.y})`).style("opacity", 0);
    SUB_CUL.forEach(s => {
      const sx = s.dx * R * (mob ? 0.85 : 1.05), sy = s.dy * R * (mob ? 0.72 : 0.88);
      subCulG.append("line").attr("x1", 0).attr("y1", 0).attr("x2", sx).attr("y2", sy)
        .attr("stroke", C.blue).attr("stroke-width", .8).attr("stroke-dasharray", "2 2");
      subCulG.append("circle").attr("cx", sx).attr("cy", sy).attr("r", mob ? 3.2 : 4.2)
        .attr("fill", C.blue).attr("stroke", "#fff").attr("stroke-width", 1);
      const anc = s.dx < -0.2 ? "end" : s.dx > 0.2 ? "start" : "middle";
      const tx = sx + (s.dx < -0.2 ? -6 : s.dx > 0.2 ? 6 : 0);
      const ty = sy + (s.dy > 0.3 ? 13 : -6);
      V.t(subCulG, tx, ty, s.n, {size: mob ? 11 : 12, weight: 700, anchor: anc, fill: C.ink, halo: true});
      if(!mob) V.t(subCulG, tx, ty + 13, s.d, {size: 11, anchor: anc, fill: C.muted, halo: true});
    });

    // Animació de partícules lentes (LINK-03, recorregut ~25-30s)
    function updateParticles(tSec){
      flowPaths.forEach(fp => {
        if(!fp.node) return;
        fp.dots.forEach(dt => {
          const u = (dt.t0 + tSec * fp.fl.speed) % 1;
          const pt = fp.node.getPointAtLength(u * fp.len);
          dt.el.attr("cx", pt.x).attr("cy", pt.y);
        });
      });
    }
    updateParticles(0);
    if(!V.reduced){
      stopLoop = V.loop(container, t => {
        if(curStep === "conv") updateParticles(t / 1000);
      });
    }

    // Hover dock
    const tp = V.tip(container);
    svg.style("cursor", "pointer");
    V.hover(svg.node(), (ev, [px, py]) => {
      const hit = d3.least(NODES, d => Math.hypot(px - pos[d.id].x, py - pos[d.id].y));
      const dist = hit ? Math.hypot(px - pos[hit.id].x, py - pos[hit.id].y) : 999;
      if(dist <= R * 1.15){
        V.focus(nodeG, d => d.id === hit.id);
        tp.show(`<b>Capital ${hit.name.toLowerCase()}</b> · ${hit.sub}`);
      } else if(Math.abs(Math.hypot(px - cx, py - cy) - Rsim) < 24){
        V.focus(nodeG, null);
        tp.show(`<b>Capital simbòlic</b> · Honor, prestigi i legitimitat que fan reconèixer els altres capitals`);
      } else {
        V.focus(nodeG, null);
        tp.hide();
      }
    }, () => { V.focus(nodeG, null); tp.hide(); });

    applyStep = function(st, instant){
      curStep = st;
      const dur = instant || V.reduced ? 0 : 420;
      const tEl = $("#cap-t"), sEl = $("#cap-s");
      if(TITLES[st]){ if(tEl) tEl.textContent = TITLES[st][0]; if(sEl) sEl.textContent = TITLES[st][1]; }

      nodeG.transition().duration(dur).ease(EIO)
        .style("opacity", d => {
          if(st === "conv" || st === "sim") return 1;
          return d.id === st ? 1 : 0.48;
        });
      nodeG.select("circle.bg").transition().duration(dur).ease(EIO)
        .attr("stroke-width", d => d.id === st ? 2.0 : 0.9)
        .attr("stroke", d => d.id === st ? C.ink : (d.c === C.yellow ? C.ink2 : d.c));

      subCulG.transition().duration(dur).style("opacity", st === "cul" ? 1 : 0);
      simRing.transition().duration(dur)
        .attr("stroke", st === "sim" ? C.red : C.ink2)
        .attr("stroke-width", st === "sim" ? 2.2 : 1.1)
        .attr("stroke-opacity", st === "sim" ? .95 : .45);
      simLbl.transition().duration(dur).attr("fill", st === "sim" ? C.red : C.ink2);
      flowG.transition().duration(dur).style("opacity", st === "conv" ? 1 : 0);
    };

    applyStep(curStep, true);
  });

  if(stepsEl && gEl && window.IB && IB.scrolly){
    IB.scrolly(stepsEl, gEl, (_, st) => {
      const k = (st && st.dataset && st.dataset.s) || "eco";
      curStep = k;
      if(applyStep) applyStep(k, false);
    });
  }
})();

/* =========================================================================
   V2 · CASE-01 (Dades reals): Accés a la universitat a França (1961–1962)
   ========================================================================= */
(function(){
  const el = $("#heritiers-viz"); if(!el) return;
  const lg = $("#heritiers-lg");
  if(lg) V.legendCat(lg, [
    {c: C.red, t: "Categoria més alta"},
    {c: C.blue, t: "Resta de categories"},
    {c: C.ink2, t: "Referència (obrers = 1×)", kind: "hollow"}
  ]);

  const DATA = D.heritiers.map(d => Object.assign({}, d, { mult: d.pct / 1.4 }));
  let mode = "pct", updateMode = null;

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const ml = mob ? 8 : 265, mr = mob ? 48 : 68, mt = 30, mb = 28;
    const rowH = mob ? 48 : 34;
    const h = mt + DATA.length * rowH + mb;

    const svg = V.svg(container, w, h, "Probabilitat d'accés a la universitat a França el 1961–1962 segons la professió del pare: del 0,7 % per a fills d'assalariats agrícoles i l'1,4 % per a fills d'obrers fins al 58,5 % per a fills de quadres superiors i professions liberals.");
    const g = svg.append("g");

    const xPct = d3.scaleLinear([0, 64], [ml, w - mr]);
    const xMult = d3.scaleLinear([0, 46], [ml, w - mr]);
    const getX = () => mode === "pct" ? xPct : xMult;
    const getVal = d => mode === "pct" ? d.pct : d.mult;
    const fmtVal = d => mode === "pct" ? `${f1(d.pct)} %` : `×${f1(d.mult)}`;

    const axisG = g.append("g");
    function drawAxis(){
      axisG.selectAll("*").remove();
      const X = getX();
      const ticks = mode === "pct" ? (mob ? [0, 20, 40, 60] : [0, 10, 20, 30, 40, 50, 60]) : (mob ? [0, 15, 30, 45] : [0, 10, 20, 30, 40]);
      ticks.forEach(t => {
        axisG.append("line").attr("x1", X(t)).attr("x2", X(t)).attr("y1", mt - 6).attr("y2", h - mb)
          .attr("stroke", t === 0 ? C.ink : C.grid).attr("stroke-width", t === 0 ? 1 : .6);
        V.t(axisG, X(t), mt - 12, mode === "pct" ? (t === ticks[ticks.length - 1] ? t + " %" : t) : (t === ticks[ticks.length - 1] ? "×" + t : t),
          {size: 11, anchor: "middle", fill: t === 0 ? C.ink : C.muted});
      });
    }
    drawAxis();

    const rows = g.selectAll("g.row").data(DATA, d => d.id).join("g")
      .attr("class", "row")
      .attr("transform", (d, i) => `translate(0,${mt + i * rowH + (mob ? 28 : rowH / 2)})`);

    // Etiqueta: a l'esquerra en desktop, a sobre en mòbil (guia-mobil.md §3)
    rows.each(function(d){
      const r = d3.select(this);
      if(mob){
        V.t(r, ml, -12, d.short, {size: 12, weight: d.highlight ? 700 : 500, anchor: "start", fill: d.highlight ? C.ink : C.ink2});
      } else {
        V.t(r, ml - 12, 4, d.label, {size: 12.5, weight: d.highlight ? 700 : 400, anchor: "end", fill: d.highlight ? C.ink : C.ink2});
      }
    });

    const stems = rows.append("line").attr("class", "stem")
      .attr("x1", ml).attr("y1", 0).attr("y2", 0)
      .attr("x2", d => getX()(getVal(d)))
      .attr("stroke", d => d.highlight ? C.red : C.blue)
      .attr("stroke-width", d => d.highlight ? 2.4 : 1.1)
      .attr("stroke-linecap", "round");

    const halos = rows.append("circle").attr("class", "hl")
      .attr("cx", d => getX()(getVal(d))).attr("cy", 0)
      .attr("r", d => d.highlight ? 11 : 7)
      .attr("fill", d => d.highlight ? C.red : C.blue).attr("fill-opacity", .22)
      .style("mix-blend-mode", "multiply");

    const dots = rows.append("circle").attr("class", "dt")
      .attr("cx", d => getX()(getVal(d))).attr("cy", 0)
      .attr("r", d => d.highlight ? 4.4 : 3.4)
      .attr("fill", d => d.ref ? "#fff" : (d.highlight ? C.red : C.blue))
      .attr("stroke", d => d.ref ? C.ink : "#fff").attr("stroke-width", 1.3);

    const vals = rows.append("text").attr("class", "vl")
      .attr("x", d => getX()(getVal(d)) + 12).attr("y", 4)
      .attr("font-family", V.SANS).attr("font-size", 12).attr("font-weight", d => d.highlight ? 700 : 500)
      .attr("fill", d => d.highlight ? C.red : C.ink2).style("font-variant-numeric", "tabular-nums")
      .text(fmtVal);

    // Anotació editorial en desktop
    const noteG = g.append("g");
    function drawNote(){
      noteG.selectAll("*").remove();
      if(mob) return;
      const X = getX();
      const top = DATA[0];
      const px = X(getVal(top)), py = mt + rowH / 2;
      V.note(noteG, {
        x: px - 18, y: py + 14,
        tx: px - 86, ty: py + 62,
        kind: "elbow", anchor: "end",
        lines: [["×41,8 més que un fill d'obrer", true], ["i ×83,6 més que un d'assalariat agrícola"]],
        size: 12
      });
    }
    drawNote();

    // Entrada animada
    if(!container.__seen && !V.reduced){
      stems.attr("x2", ml); halos.attr("cx", ml).style("opacity", 0); dots.attr("cx", ml); vals.style("opacity", 0); noteG.style("opacity", 0);
      V.onView(container, inst => {
        const dur = inst ? 0 : 900;
        stems.transition().delay((d, i) => inst ? 0 : i * 55).duration(dur).ease(EIO).attr("x2", d => getX()(getVal(d)));
        halos.transition().delay((d, i) => inst ? 0 : i * 55).duration(dur).ease(EIO).attr("cx", d => getX()(getVal(d))).style("opacity", 1);
        dots.transition().delay((d, i) => inst ? 0 : i * 55).duration(dur).ease(EIO).attr("cx", d => getX()(getVal(d)));
        vals.transition().delay(inst ? 0 : 650).duration(inst ? 0 : 350).style("opacity", 1);
        noteG.transition().delay(inst ? 0 : 800).duration(inst ? 0 : 350).style("opacity", 1);
      });
    }

    updateMode = function(k){
      mode = k;
      const dur = V.reduced ? 0 : 650;
      drawAxis();
      stems.transition().duration(dur).ease(EIO).attr("x2", d => getX()(getVal(d)));
      halos.transition().duration(dur).ease(EIO).attr("cx", d => getX()(getVal(d)));
      dots.transition().duration(dur).ease(EIO).attr("cx", d => getX()(getVal(d)));
      vals.transition().duration(dur).ease(EIO).attr("x", d => getX()(getVal(d)) + 12).text(fmtVal);
      drawNote();
    };

    const tp = V.tip(container);
    const ov = g.append("rect").attr("x", 0).attr("y", mt).attr("width", w).attr("height", DATA.length * rowH).attr("fill", "transparent").style("cursor", "pointer");
    V.hover(ov.node(), (ev, [, py]) => {
      const idx = Math.max(0, Math.min(DATA.length - 1, Math.floor(py / rowH)));
      const d = DATA[idx];
      V.focus(rows, q => q.id === d.id);
      tp.show(`<b>${d.label}</b> · <b>${f1(d.pct)} %</b> d'accés universitari · ×${f1(d.mult)} respecte a fills d'obrers`);
    }, () => { V.focus(rows, null); tp.hide(); });
  });

  bindSeg("#f-heritiers", k => { if(updateMode) updateMode(k); });
})();

/* =========================================================================
   V3 · SPREAD-02 (Scrolly 4 passos): L'espai social de La Distinction
   ========================================================================= */
(function(){
  const el = $("#esp-viz"), stepsEl = $("#s-espai .steps"), gEl = $("#s-espai .graphic");
  if(!el) return;
  const lg = $("#esp-lg");
  if(lg) V.legendCat(lg, [
    {c: C.blue, t: "Més capital cultural"},
    {c: C.red, t: "Més capital econòmic"},
    {c: C.yellow, t: "Gustos i pràctiques", a: .6}
  ]);

  // Núvol determinista de context (per donar textura de l'enquesta N = 1.217)
  const rng = V.rng(1979);
  const CLOUD = d3.range(180).map(() => {
    const y = Math.max(-0.96, Math.min(0.96, V.gauss(rng) * 0.48));
    const spread = 0.55 + 0.35 * ((y + 1) / 2);
    const x = Math.max(-0.96, Math.min(0.96, V.gauss(rng) * spread * 0.58));
    return {x, y};
  });

  const PROFS = D.espai.professions;
  const GUSTS = D.espai.gustos;
  const TITLES = {
    volum: ["Eix vertical · Volum global de capital", "De dalt a baix: qui acumula més recursos i qui en té menys"],
    estructura: ["Eix horitzontal · Estructura del capital", "A la mateixa alçada: pol cultural a l'esquerra, pol econòmic a la dreta"],
    gustos: ["El gust segueix les coordenades socials", "Música, esport i consum s'alineen sobre el mateix mapa que les professions"],
    distincio: ["La mecànica de la distinció", "Quan un gust es popularitza, la frontera simbòlica es desplaça cap amunt"]
  };

  let curStep = "volum", applyStep = null;

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const h = mob ? Math.round(Math.max(210, Math.min(window.innerHeight * 0.31, 255))) : 430;
    const m = mob ? {t: 26, r: 16, b: 26, l: 16} : {t: 36, r: 30, b: 34, l: 30};

    const svg = V.svg(container, w, h, "Esquema de l'espai social en dues dimensions de La Distinction (1979): l'eix vertical mostra el volum global de capital i l'eix horitzontal separa el capital cultural a l'esquerra del capital econòmic a la dreta.");
    const g = svg.append("g");
    const X = d3.scaleLinear([-1.05, 1.05], [m.l, w - m.r]);
    const Y = d3.scaleLinear([-1.05, 1.05], [h - m.b, m.t]);

    // Quadrícula creuada dels dos eixos principals
    const axV = g.append("line").attr("x1", X(0)).attr("x2", X(0)).attr("y1", m.t).attr("y2", h - m.b)
      .attr("stroke", C.ink).attr("stroke-width", 1).attr("stroke-opacity", .65);
    const axH = g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", Y(0)).attr("y2", Y(0))
      .attr("stroke", C.ink).attr("stroke-width", 1).attr("stroke-opacity", .25);

    V.t(g, X(0), m.t - 10, "↑ Més volum de capital", {size: mob ? 11 : 12, weight: 700, anchor: "middle", fill: C.ink});
    V.t(g, X(0), h - m.b + 17, "↓ Menys volum de capital", {size: mob ? 11 : 12, anchor: "middle", fill: C.muted});

    const lblCul = V.t(g, m.l + 2, Y(0) - 8, "← + Cultural", {size: mob ? 11 : 12, weight: 700, anchor: "start", fill: C.blue, halo: true});
    const lblEco = V.t(g, w - m.r - 2, Y(0) - 8, "+ Econòmic →", {size: mob ? 11 : 12, weight: 700, anchor: "end", fill: C.red, halo: true});

    // Núvol de context translúcid (SPREAD-02)
    g.append("g").selectAll("circle").data(CLOUD).join("circle")
      .attr("cx", d => X(d.x)).attr("cy", d => Y(d.y)).attr("r", mob ? 1.8 : 2.3)
      .attr("fill", C.ghost).attr("fill-opacity", .45);

    // Frontera de la distinció (pas 4)
    const distG = g.append("g").style("opacity", 0);
    const curvePts = [[-0.95, 0.36], [-0.35, 0.44], [0.35, 0.42], [0.95, 0.34]];
    const lineGen = d3.line().x(d => X(d[0])).y(d => Y(d[1])).curve(d3.curveCatmullRom);
    distG.append("path").attr("d", lineGen(curvePts)).attr("fill", "none")
      .attr("stroke", C.red).attr("stroke-width", 1.8).attr("stroke-dasharray", "5 4");
    V.t(distG, X(0), Y(0.46) - 6, "Frontera de la distinció", {size: mob ? 11 : 12, weight: 700, anchor: "middle", fill: C.red, halo: true});

    // Gustos (pas 3 i 4)
    const gustG = g.append("g").style("opacity", 0);
    GUSTS.forEach(gu => {
      const col = gu.c === "blue" ? C.blue : gu.c === "red" ? C.red : gu.c === "yellow" ? C.yellow : C.ink2;
      const gr = gustG.append("g").attr("transform", `translate(${X(gu.x)},${Y(gu.y)})`);
      gr.append("circle").attr("r", mob ? 16 : 30).attr("fill", col).attr("fill-opacity", gu.c === "yellow" ? .32 : .16)
        .style("mix-blend-mode", "multiply");
      const anc = gu.x < -0.4 ? "start" : gu.x > 0.4 ? "end" : "middle";
      const dx = gu.x < -0.4 ? -10 : gu.x > 0.4 ? 10 : 0;
      V.t(gr, dx, mob ? 3 : 4, mob ? gu.short : gu.n, {size: mob ? 11 : 12, weight: 600, italic: true, anchor: anc, fill: C.ink, halo: true});
    });

    // Professions protagonistes
    const colProf = d => d.x < -0.15 ? C.blue : d.x > 0.15 ? C.red : C.ink2;
    const pG = g.selectAll("g.prof").data(PROFS, d => d.id).join("g")
      .attr("class", "prof")
      .attr("transform", d => `translate(${X(d.x)},${Y(d.y)})`);

    pG.append("circle").attr("class", "pc")
      .attr("r", mob ? 3.8 : 4.8)
      .attr("fill", colProf).attr("fill-opacity", .85)
      .attr("stroke", "#fff").attr("stroke-width", 1.2);

    pG.each(function(d){
      if(mob && !d.mob) return;
      const anc = d.x > 0.42 ? "end" : d.x < -0.42 ? "start" : "middle";
      const dx = anc === "end" ? -7 : anc === "start" ? 7 : 0;
      const dy = anc === "middle" ? (d.y < -0.7 ? 14 : -8) : 4;
      V.t(d3.select(this), dx, dy, mob ? d.short : d.n, {size: mob ? 11 : 11.8, anchor: anc, fill: C.ink, halo: true}).attr("class", "plab");
    });

    // Hover
    const tp = V.tip(container);
    const ov = g.append("rect").attr("x", m.l).attr("y", m.t).attr("width", w - m.l - m.r).attr("height", h - m.t - m.b)
      .attr("fill", "transparent").style("cursor", "crosshair");
    V.hover(ov.node(), (ev, [px, py]) => {
      const rx = px + m.l, ry = py + m.t;
      const hit = d3.least(PROFS, d => Math.hypot(rx - X(d.x), ry - Y(d.y)));
      if(hit && Math.hypot(rx - X(hit.x), ry - Y(hit.y)) < 44){
        V.focus(pG, d => d.id === hit.id);
        const pol = hit.x < -0.15 ? "predomini de capital cultural" : hit.x > 0.15 ? "predomini de capital econòmic" : "equilibri entre capitals";
        const vol = hit.y > 0.35 ? "volum alt" : hit.y < -0.35 ? "volum baix" : "volum intermedi";
        tp.show(`<b>${hit.n}</b> · ${vol} · ${pol}`);
      } else {
        V.focus(pG, null); tp.hide();
      }
    }, () => { V.focus(pG, null); tp.hide(); });

    applyStep = function(st, instant){
      curStep = st;
      const dur = instant || V.reduced ? 0 : 420;
      const tEl = $("#esp-t"), sEl = $("#esp-s");
      if(TITLES[st]){ if(tEl) tEl.textContent = TITLES[st][0]; if(sEl) sEl.textContent = TITLES[st][1]; }

      axV.transition().duration(dur).attr("stroke-opacity", st === "volum" ? .95 : .55);
      axH.transition().duration(dur).attr("stroke-opacity", st === "volum" ? .2 : .8);
      lblCul.transition().duration(dur).style("opacity", st === "volum" ? .3 : 1);
      lblEco.transition().duration(dur).style("opacity", st === "volum" ? .3 : 1);
      pG.transition().duration(dur).style("opacity", st === "gustos" ? .45 : 1);
      if(mob){
        pG.selectAll(".plab").transition().duration(dur).style("opacity", (st === "gustos" || st === "distincio") ? 0 : 1);
      }
      gustG.transition().duration(dur).style("opacity", (st === "gustos" || st === "distincio") ? 1 : 0);
      distG.transition().duration(dur).style("opacity", st === "distincio" ? 1 : 0);
    };

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
   V4 · CASE-02 (Dades reals): Tres peces musicals, tres mons (La Distinction)
   ========================================================================= */
(function(){
  const el = $("#musica-viz"); if(!el) return;
  const SERIES = [
    {k: "danubi", name: "El Danubi blau (Strauss)", short: "Danubi blau", c: C.red},
    {k: "rhapsody", name: "Rhapsody in Blue (Gershwin)", short: "Rhapsody in Blue", c: C.yellow},
    {k: "bach", name: "El clave ben temperat (Bach)", short: "Bach", c: C.blue}
  ];
  const lg = $("#musica-lg");
  if(lg) V.legendCat(lg, SERIES.map(s => ({c: s.c, t: s.name})));

  const DATA = D.musica;
  let filter = "totes", updateFilter = null;

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const ml = mob ? 8 : 265, mr = mob ? 22 : 36, mt = 32, mb = 32;
    const rowH = mob ? 56 : 44;
    const h = mt + DATA.length * rowH + mb;

    const svg = V.svg(container, w, h, "Percentatge d'enquestats que trien El Danubi blau, Rhapsody in Blue i El clave ben temperat de Bach segons classe social i estudis (La Distinction, 1979). El Danubi blau baixa del 65 % al 3 % mentre Bach puja de l'1 % al 21 %.");
    const g = svg.append("g");
    const X = d3.scaleLinear([0, 70], [ml, w - mr]);

    // Quadrícula vertical
    const ticks = mob ? [0, 20, 40, 60] : [0, 10, 20, 30, 40, 50, 60, 70];
    ticks.forEach(t => {
      g.append("line").attr("x1", X(t)).attr("x2", X(t)).attr("y1", mt - 6).attr("y2", h - mb)
        .attr("stroke", t === 0 ? C.ink : C.grid).attr("stroke-width", t === 0 ? 1 : .6);
      V.t(g, X(t), mt - 12, t === ticks[ticks.length - 1] ? t + " %" : t, {size: 11, anchor: "middle", fill: t === 0 ? C.ink : C.muted});
    });

    const rows = g.selectAll("g.mrow").data(DATA, d => d.id).join("g")
      .attr("class", "mrow")
      .attr("transform", (d, i) => `translate(0,${mt + i * rowH + (mob ? 30 : rowH / 2)})`);

    rows.each(function(d){
      const r = d3.select(this);
      if(mob){
        V.t(r, ml, -14, d.short, {size: 12, weight: 600, anchor: "start", fill: C.ink});
      } else {
        V.t(r, ml - 14, 4, d.label, {size: 12.5, anchor: "end", fill: C.ink2});
      }
      // Fil base connectant mínim i màxim (CASE-02)
      const lo = Math.min(d.danubi, d.rhapsody, d.bach);
      const hi = Math.max(d.danubi, d.rhapsody, d.bach);
      r.append("line").attr("class", "span-ln")
        .attr("x1", X(lo)).attr("x2", X(hi)).attr("y1", 0).attr("y2", 0)
        .attr("stroke", C.hair).attr("stroke-width", 2.2);

      SERIES.forEach(s => {
        const val = d[s.k];
        const pt = r.append("g").attr("class", `pt pt-${s.k}`).attr("transform", `translate(${X(val)},0)`);
        pt.append("circle").attr("r", mob ? 6.2 : 7.2)
          .attr("fill", s.c).attr("fill-opacity", s.c === C.yellow ? .85 : .78)
          .attr("stroke", s.c === C.yellow ? C.ink2 : "#fff").attr("stroke-width", s.c === C.yellow ? 1 : 1.3);
        pt.append("text").attr("class", "pt-v").attr("y", -11).attr("text-anchor", "middle")
          .attr("font-family", V.SANS).attr("font-size", 11).attr("font-weight", 600)
          .attr("fill", C.ink).style("font-variant-numeric", "tabular-nums")
          .style("opacity", 0).text(f1(val) + " %");
      });
    });

    // Anotació de la inversió en l'última fila (desktop)
    if(!mob){
      const last = DATA[DATA.length - 1];
      const yLast = mt + (DATA.length - 1) * rowH + rowH / 2;
      V.note(g, {
        x: X(last.bach), y: yLast + 8,
        tx: X(last.bach) + 28, ty: yLast + 26,
        kind: "straight", anchor: "start",
        lines: [["Bach: 21 % · Strauss cau al 3 %", true]],
        size: 11.5
      });
    }

    updateFilter = function(k){
      filter = k;
      const dur = V.reduced ? 0 : 240;
      rows.selectAll(".span-ln").transition().duration(dur).style("opacity", k === "totes" ? 1 : 0.25);
      SERIES.forEach(s => {
        const on = k === "totes" || k === s.k;
        rows.selectAll(`.pt-${s.k}`).transition().duration(dur).style("opacity", on ? 1 : 0.14);
        rows.selectAll(`.pt-${s.k} .pt-v`).transition().duration(dur).style("opacity", k === s.k ? 1 : 0);
      });
    };
    updateFilter(filter);

    const tp = V.tip(container);
    const ov = g.append("rect").attr("x", 0).attr("y", mt).attr("width", w).attr("height", DATA.length * rowH)
      .attr("fill", "transparent").style("cursor", "pointer");
    V.hover(ov.node(), (ev, [, py]) => {
      const idx = Math.max(0, Math.min(DATA.length - 1, Math.floor(py / rowH)));
      const d = DATA[idx];
      V.focus(rows, q => q.id === d.id);
      tp.show(`<b>${d.label}</b> · Danubi blau <b>${f1(d.danubi)} %</b> · Rhapsody <b>${f1(d.rhapsody)} %</b> · Bach <b>${f1(d.bach)} %</b>`);
    }, () => { V.focus(rows, null); tp.hide(); });
  });

  bindSeg("#f-musica", k => { if(updateFilter) updateFilter(k); });
})();

/* =========================================================================
   V5 · CASE-01 (Dades reals): Les 7 classes del Regne Unit (Savage et al. 2013)
   ========================================================================= */
(function(){
  const el = $("#gbcs-viz"); if(!el) return;
  const lg = $("#gbcs-lg");
  if(lg) V.legendCat(lg, [
    {c: C.red, t: "Alts en tots tres capitals"},
    {c: C.yellow, t: "Alt econòmic, baix cultural/social"},
    {c: C.blue, t: "Renda modesta, alt cultural/social"},
    {c: C.ink2, t: "Capitals baixos"}
  ]);

  const DATA = D.gbcs;
  const colTone = t => t === "red" ? C.red : t === "yellow" ? C.yellow : t === "blue" ? C.blue : C.ink2;
  let sortBy = "income", updateSort = null;

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const ml = mob ? 8 : 225, mr = mob ? 66 : 86, mt = 30, mb = 24;
    const rowH = mob ? 50 : 36;
    const h = mt + DATA.length * rowH + mb;

    const svg = V.svg(container, w, h, "Les set classes socials del Regne Unit segons Savage et al. (2013), amb renda familiar mitjana anual en lliures i percentatge de població nacional: de l'Elit (6 %, 89.082 £) fins al Precariat (15 %, 8.253 £).");
    const g = svg.append("g");

    const xInc = d3.scaleLinear([0, 95000], [ml, w - mr]);
    const xPop = d3.scaleLinear([0, 28], [ml, w - mr]);
    const getX = () => sortBy === "income" ? xInc : xPop;
    const getVal = d => sortBy === "income" ? d.income : d.pop;
    const fmtVal = d => sortBy === "income" ? `£${f0(d.income)}` : `${d.pop} %`;

    const axisG = g.append("g");
    function drawAxis(){
      axisG.selectAll("*").remove();
      const X = getX();
      const ticks = sortBy === "income"
        ? (mob ? [0, 30000, 60000, 90000] : [0, 20000, 40000, 60000, 80000])
        : (mob ? [0, 10, 20] : [0, 5, 10, 15, 20, 25]);
      ticks.forEach(t => {
        axisG.append("line").attr("x1", X(t)).attr("x2", X(t)).attr("y1", mt - 6).attr("y2", h - mb)
          .attr("stroke", t === 0 ? C.ink : C.grid).attr("stroke-width", t === 0 ? 1 : .6);
        const lbl = sortBy === "income"
          ? (t === 0 ? "0" : (t / 1000) + "k" + (t === ticks[ticks.length - 1] ? " £" : ""))
          : (t === ticks[ticks.length - 1] ? t + " %" : t);
        V.t(axisG, X(t), mt - 12, lbl, {size: 11, anchor: "middle", fill: t === 0 ? C.ink : C.muted});
      });
    }
    drawAxis();

    const getOrder = () => {
      const a = DATA.slice().sort((p, q) => q[sortBy] - p[sortBy]);
      const m = {}; a.forEach((d, i) => m[d.id] = i);
      return m;
    };
    let ord = getOrder();
    const rowY = id => mt + ord[id] * rowH + (mob ? 28 : rowH / 2);

    const rows = g.selectAll("g.grow").data(DATA, d => d.id).join("g")
      .attr("class", "grow")
      .attr("transform", d => `translate(0,${rowY(d.id)})`);

    rows.each(function(d){
      const r = d3.select(this);
      if(mob){
        V.t(r, ml, -12, d.short, {size: 12, weight: 600, anchor: "start", fill: C.ink});
      } else {
        V.t(r, ml - 12, 4, d.label, {size: 12.5, weight: d.id === "elit" || d.id === "pre" ? 700 : 400, anchor: "end", fill: C.ink});
      }
    });

    const stems = rows.append("line")
      .attr("x1", ml).attr("y1", 0).attr("y2", 0)
      .attr("x2", d => getX()(getVal(d)))
      .attr("stroke", d => d.tone === "yellow" ? C.ink2 : colTone(d.tone))
      .attr("stroke-width", d => d.id === "elit" ? 2.4 : 1.3)
      .attr("stroke-linecap", "round");

    const halos = rows.append("circle")
      .attr("cx", d => getX()(getVal(d))).attr("cy", 0)
      .attr("r", d => 6 + Math.sqrt(d.pop) * 1.4)
      .attr("fill", d => colTone(d.tone)).attr("fill-opacity", d => d.tone === "yellow" ? .45 : .24)
      .style("mix-blend-mode", "multiply");

    const dots = rows.append("circle")
      .attr("cx", d => getX()(getVal(d))).attr("cy", 0)
      .attr("r", 4)
      .attr("fill", d => colTone(d.tone))
      .attr("stroke", d => d.tone === "yellow" ? C.ink2 : "#fff").attr("stroke-width", 1.2);

    const vals = rows.append("text")
      .attr("x", d => getX()(getVal(d)) + 15).attr("y", 4)
      .attr("font-family", V.SANS).attr("font-size", 12).attr("font-weight", 600)
      .attr("fill", C.ink).style("font-variant-numeric", "tabular-nums")
      .text(fmtVal);

    updateSort = function(k){
      sortBy = k;
      ord = getOrder();
      const dur = V.reduced ? 0 : 700;
      drawAxis();
      rows.transition().duration(dur).ease(EIO).attr("transform", d => `translate(0,${rowY(d.id)})`);
      stems.transition().duration(dur).ease(EIO).attr("x2", d => getX()(getVal(d)));
      halos.transition().duration(dur).ease(EIO).attr("cx", d => getX()(getVal(d)));
      dots.transition().duration(dur).ease(EIO).attr("cx", d => getX()(getVal(d)));
      vals.transition().duration(dur).ease(EIO).attr("x", d => getX()(getVal(d)) + 15).text(fmtVal);
    };

    const tp = V.tip(container);
    const ov = g.append("rect").attr("x", 0).attr("y", mt).attr("width", w).attr("height", DATA.length * rowH)
      .attr("fill", "transparent").style("cursor", "pointer");
    V.hover(ov.node(), (ev, [, py]) => {
      const idx = Math.max(0, Math.min(DATA.length - 1, Math.floor(py / rowH)));
      const d = DATA.find(q => ord[q.id] === idx);
      if(!d) return;
      V.focus(rows, q => q.id === d.id);
      tp.show(`<b>${d.label}</b> · £${f0(d.income)}/any · ${d.pop} % del país · ${d.tag}`);
    }, () => { V.focus(rows, null); tp.hide(); });
  });

  bindSeg("#f-gbcs", k => { if(updateSort) updateSort(k); });
})();

})();
