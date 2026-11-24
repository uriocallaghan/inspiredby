/* «Els quatre capitals de Pierre Bourdieu» · cinc gràfics del sistema infogràfic
   V1 · LINK-05 + LINK-03 (scrolly, esquema): tres camps de partícules (líquid, sedimentat, en xarxa),
        l'aura puntejada del capital simbòlic i els canals de conversió amb partícules que canvien de color
   V2 · PART-01 en gira-sol (dades reals): 1.000 joves per categoria, els que entren a la universitat en blau (Les Héritiers)
   V3 · SPREAD-02 sobre trama de punts (scrolly, esquema): el quiasme de l'espai social (La Distinction)
   V4 · CASE-09 (dades reals): flors de dades, un pètal per obra musical (La Distinction)
   V5 · SPREAD-03 + PART-01 (dades reals): eixam de 100 punts, un per cada 1 % de la població (Savage et al., 2013) */
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
   V1 · LINK-05 + LINK-03 (scrolly, 5 passos): les quatre monedes
   Cada capital és un camp de partícules amb el seu comportament: l'econòmic gira
   de pressa (líquid), el cultural gairebé no es mou (sedimentat) i el social és una
   xarxa de nusos. El simbòlic no és un quart cercle: és l'aura que apareix al voltant
   dels altres tres quan es reconeixen. Al pas 5, canals de conversió amb partícules
   que canvien de color d'una moneda a l'altra.
   ========================================================================= */
(function(){
  const el = $("#cap-viz"), stepsEl = $("#s-capitals .steps"), gEl = $("#s-capitals .graphic");
  if(!el) return;
  const lg = $("#cap-lg");
  if(lg) V.legendCat(lg, [
    {c: C.red, t: "Econòmic: líquid"},
    {c: C.blue, t: "Cultural: sedimentat"},
    {c: C.yellow, t: "Social: en xarxa"},
    {c: C.ink2, t: "Simbòlic: l'aura del reconeixement", a: .4}
  ]);

  const CAPS = [
    {id: "eco", name: "Econòmic", sub: "diners i patrimoni", c: C.red, ang: -150},
    {id: "cul", name: "Cultural", sub: "cos, objectes i títols", c: C.blue, ang: -30},
    {id: "soc", name: "Social", sub: "una xarxa duradora", c: C.yellow, ang: 90}
  ];
  const STATES = [
    {n: "Incorporat", d: "parla, gust, desimboltura", x: 0, y: -.48, share: .5, below: false},
    {n: "Objectivat", d: "llibres, obres", x: -.48, y: .36, share: .25, below: true},
    {n: "Títols", d: "diplomes de l'Estat", x: .48, y: .36, share: .25, below: true}
  ];
  const FLOWS = [
    {from: "eco", to: "cul", t: "Diners → títols", d: "escoles i temps lliure: anys", per: 34000},
    {from: "cul", to: "soc", t: "Títols → xarxa", d: "promocions, clubs, col·legis", per: 26000},
    {from: "soc", to: "eco", t: "Xarxa → diners", d: "feines i oportunitats", per: 21000}
  ];
  const TITLES = {
    eco: ["1 · Capital econòmic", "La moneda més líquida: circula de pressa i es mesura en xifres"],
    cul: ["2 · Capital cultural", "Tres estats: incorporat al cos, objectivat en coses i certificat en títols"],
    soc: ["3 · Capital social", "Els recursos d'una xarxa estable, que cal mantenir"],
    sim: ["4 · Capital simbòlic", "L'aura que pren qualsevol capital quan els altres el reconeixen"],
    conv: ["5 · Les conversions", "Cada moneda es pot canviar per una altra, però no a la mateixa velocitat"]
  };
  const DOCK = {
    eco: "<b>Capital econòmic</b> · diners, patrimoni i propietats: el més líquid, canvia de mans en segons",
    cul: "<b>Capital cultural</b> · incorporat (parla, gust), objectivat (llibres, obres) i institucionalitzat (títols)",
    soc: "<b>Capital social</b> · els recursos d'una xarxa duradora, que es manté amb temps, favors i invitacions",
    sim: "<b>Capital simbòlic</b> · qualsevol dels altres quan es percep com a honor, mèrit o autoritat"
  };
  const STEPS = {
    eco:  {eco: 1, cul: .3, soc: .3, m: 0, halo: 0, flow: 0},
    cul:  {eco: .3, cul: 1, soc: .3, m: 1, halo: 0, flow: 0},
    soc:  {eco: .3, cul: .3, soc: 1, m: 0, halo: 0, flow: 0},
    sim:  {eco: 1, cul: 1, soc: 1, m: 0, halo: 1, flow: 0},
    conv: {eco: .85, cul: .85, soc: .85, m: 0, halo: .45, flow: 1}
  };

  let curStep = "eco", applyStep = null;
  const cur = Object.assign({}, STEPS.eco), tgt = Object.assign({}, STEPS.eco);
  let hov = null;

  V.mount(el, (container, w) => {
    if(el.__loop){ el.__loop.stop(); el.__loop = null; }
    const mob = w < 600;
    const h = mob ? Math.round(Math.max(236, Math.min(window.innerHeight * .34, 290))) : Math.round(Math.max(470, Math.min(580, window.innerHeight - 330)));
    const R = mob ? Math.min(50, (h - 12) / 5.3, w / 7.4) : Math.min(112, (h - 24) / 5.55, w / 7.6);
    const rho = R * (mob ? 1.62 : 1.75), cx = w / 2, cy = h / 2 - rho / 4;
    const P = {};
    CAPS.forEach(k => { const a = k.ang * Math.PI / 180; P[k.id] = {x: cx + rho * Math.cos(a), y: cy + rho * Math.sin(a), c: k.c}; });

    const {ctx, svg} = layers(container, w, h, "Esquema dels capitals de Pierre Bourdieu: tres camps de partícules (econòmic en vermell, que circula de pressa; cultural en blau, gairebé immòbil; social en groc, una xarxa de nusos), una aura de punts grisos que representa el capital simbòlic i tres canals de conversió entre ells.");
    const rnd = V.rng(1983);

    // Partícules de cada capital
    const ECO = d3.range(mob ? 95 : 180).map(() => {
      const u = rnd();
      return {r: R * .9 * Math.sqrt(.04 + .96 * u), a: rnd() * TAU, w: TAU / (19000 * (.55 + .9 * u))};
    });
    const pickState = () => { const q = rnd(); return q < STATES[0].share ? 0 : q < STATES[0].share + STATES[1].share ? 1 : 2; };
    const CUL = d3.range(mob ? 95 : 180).map(() => {
      const rr = R * .88 * Math.sqrt(rnd()), aa = rnd() * TAU, s = STATES[pickState()];
      let tx = s.x * R + V.gauss(rnd) * R * .12, ty = s.y * R + V.gauss(rnd) * R * .1;
      const d = Math.hypot(tx, ty); if(d > R * .9){ tx *= R * .9 / d; ty *= R * .9 / d; }
      return {hx: Math.cos(aa) * rr, hy: Math.sin(aa) * rr, tx, ty, ph: rnd() * TAU, f: TAU / (7000 + rnd() * 6000), k: .6 + rnd() * .9};
    });
    const SOC = d3.range(mob ? 30 : 52).map(() => {
      const rr = R * .84 * Math.sqrt(rnd()), aa = rnd() * TAU;
      return {x: Math.cos(aa) * rr, y: Math.sin(aa) * rr, ph: rnd() * TAU, f: TAU / (9000 + rnd() * 7000), amp: 1.5 + rnd() * 2.5};
    });
    const SOCL = [];
    SOC.forEach((p, i) => {
      SOC.map((q, j) => ({j, d: Math.hypot(p.x - q.x, p.y - q.y)})).filter(o => o.j !== i)
        .sort((a, b) => a.d - b.d).slice(0, 2).forEach(o => { if(!SOCL.some(l => (l[0] === o.j && l[1] === i))) SOCL.push([i, o.j]); });
    });
    // L'aura: punts de gravat al voltant de cada capital, més densos a prop del cercle
    const HALO = [];
    CAPS.forEach(k => {
      d3.range(mob ? 230 : 440).forEach(() => {
        const q = Math.pow(rnd(), 1.7);
        HALO.push({id: k.id, r: R * (1.04 + .4 * q), a: rnd() * TAU, k: q, s: .55 + rnd() * .6});
      });
    });
    HALO.sort((a, b) => a.k - b.k);

    // Canals de conversió (corba quadràtica que s'obre cap enfora)
    const FL = FLOWS.map(f => {
      const A = P[f.from], B = P[f.to];
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const qx = mx + (mx - cx) * 1.15, qy = my + (my - cy) * 1.15;
      const edge = (S, T) => { const d = Math.hypot(T[0] - S.x, T[1] - S.y); return [S.x + (T[0] - S.x) / d * R * 1.02, S.y + (T[1] - S.y) / d * R * 1.02]; };
      const a = edge(A, [qx, qy]), b = edge(B, [qx, qy]);
      const pt = u => { const v = 1 - u; return [v * v * a[0] + 2 * v * u * qx + u * u * b[0], v * v * a[1] + 2 * v * u * qy + u * u * b[1]]; };
      const col = d3.range(13).map(i => d3.interpolateLab(A.c, B.c)(i / 12));
      const parts = d3.range(mob ? 14 : 24).map(() => ({o: rnd(), s: .85 + rnd() * .3, off: (rnd() - .5) * (mob ? 5 : 9)}));
      const samp = d3.range(31).map(i => pt(i / 30));
      return Object.assign({}, f, {A, B, a, b, qx, qy, pt, col, parts, samp, mid: pt(.5)});
    });

    function draw(t){
      ctx.clearRect(0, 0, w, h);
      const A = id => cur[id] * (hov && hov !== "sim" && !hov.startsWith("f") ? (hov === id ? 1 : .5) : 1);
      // 1. Aura simbòlica
      if(cur.halo > .01){
        const rot = t * TAU / 120000;
        ctx.fillStyle = C.ink2;
        const hA = hov === "sim" ? 1 : hov ? .55 : 1;
        for(let i = 0; i < HALO.length; i++){
          const p = HALO[i]; if(p.k > cur.halo) continue;
          const c = P[p.id], a = p.a + rot * (p.id === "cul" ? -1 : 1);
          ctx.globalAlpha = (.58 - .35 * p.k) * hA * Math.max(.4, cur[p.id]);
          ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * p.r, c.y + Math.sin(a) * p.r, p.s, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // 2. Discos d'aquarel·la (sense vora dura)
      ctx.globalCompositeOperation = "multiply";
      CAPS.forEach(k => {
        const p = P[k.id], a = A(k.id), y = k.c === C.yellow;
        const gr = ctx.createRadialGradient(p.x, p.y, R * .1, p.x, p.y, R);
        gr.addColorStop(0, V.alpha(k.c, (y ? .26 : .13) * a));
        gr.addColorStop(.8, V.alpha(k.c, (y ? .2 : .09) * a));
        gr.addColorStop(1, V.alpha(k.c, (y ? .06 : .025) * a));
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
      // 3. Canals de conversió
      if(cur.flow > .01){
        FL.forEach((f, i) => {
          const fa = cur.flow * (hov && hov.startsWith("f") ? (hov === "f" + i ? 1 : .45) : 1);
          const gr = ctx.createLinearGradient(f.a[0], f.a[1], f.b[0], f.b[1]);
          gr.addColorStop(0, V.alpha(f.A.c, .2 * fa)); gr.addColorStop(1, V.alpha(f.B.c, .2 * fa));
          ctx.strokeStyle = gr; ctx.lineWidth = mob ? 9 : 16; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(f.a[0], f.a[1]); ctx.quadraticCurveTo(f.qx, f.qy, f.b[0], f.b[1]); ctx.stroke();
          f.parts.forEach(p => {
            const u = (p.o + t * p.s / f.per) % 1, fade = smooth(u, 0, .08) * smooth(1 - u, 0, .08);
            if(fade < .02) return;
            const h1 = f.pt(u), h0 = f.pt(Math.max(0, u - .025));
            const nx = -(h1[1] - h0[1]), ny = h1[0] - h0[0], nl = Math.hypot(nx, ny) || 1;
            const ox = nx / nl * p.off, oy = ny / nl * p.off;
            const col = f.col[Math.round(u * 12)];
            ctx.strokeStyle = col; ctx.fillStyle = col;
            ctx.globalAlpha = .5 * fade * fa; ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(h0[0] + ox, h0[1] + oy); ctx.lineTo(h1[0] + ox, h1[1] + oy); ctx.stroke();
            ctx.globalAlpha = .92 * fade * fa;
            ctx.beginPath(); ctx.arc(h1[0] + ox, h1[1] + oy, mob ? 1.7 : 2.1, 0, TAU); ctx.fill();
          });
          ctx.globalAlpha = 1;
        });
      }
      // 4. Econòmic: arcs curts que giren (líquid)
      { const p = P.eco, a = A("eco");
        ctx.strokeStyle = C.red; ctx.lineWidth = 1.05; ctx.lineCap = "round"; ctx.globalAlpha = .55 * a;
        ctx.beginPath();
        ECO.forEach(q => { const a1 = q.a + q.w * t, a0 = a1 - q.w * 900;
          ctx.moveTo(p.x + Math.cos(a0) * q.r, p.y + Math.sin(a0) * q.r); ctx.arc(p.x, p.y, q.r, a0, a1); });
        ctx.stroke();
        ctx.fillStyle = C.red; ctx.globalAlpha = .9 * a; ctx.beginPath();
        ECO.forEach(q => { const a1 = q.a + q.w * t, x = p.x + Math.cos(a1) * q.r, y = p.y + Math.sin(a1) * q.r;
          ctx.moveTo(x + 1.3, y); ctx.arc(x, y, 1.3, 0, TAU); });
        ctx.fill(); }
      // 5. Cultural: grans gairebé quiets que es poden aplegar en tres estats
      { const p = P.cul, a = A("cul"), m = cur.m * cur.m * (3 - 2 * cur.m);
        ctx.fillStyle = C.blue; ctx.globalAlpha = .82 * a; ctx.beginPath();
        CUL.forEach(q => { const j = Math.sin(q.ph + t * q.f) * .9;
          const x = p.x + q.hx + (q.tx - q.hx) * m + j, y = p.y + q.hy + (q.ty - q.hy) * m + Math.cos(q.ph + t * q.f * .7) * .7;
          ctx.rect(x - q.k, y - q.k, q.k * 2, q.k * 2); });
        ctx.fill(); }
      // 6. Social: nusos units
      { const p = P.soc, a = A("soc");
        const pos = SOC.map(q => [p.x + q.x + Math.cos(q.ph + t * q.f) * q.amp, p.y + q.y + Math.sin(q.ph + t * q.f * 1.3) * q.amp]);
        ctx.strokeStyle = C.ink2; ctx.lineWidth = .7; ctx.globalAlpha = .38 * a; ctx.beginPath();
        SOCL.forEach(l => { ctx.moveTo(pos[l[0]][0], pos[l[0]][1]); ctx.lineTo(pos[l[1]][0], pos[l[1]][1]); });
        ctx.stroke();
        ctx.fillStyle = C.yellow; ctx.strokeStyle = C.yellowDark; ctx.globalAlpha = a; ctx.lineWidth = .7;
        pos.forEach(q => { ctx.beginPath(); ctx.arc(q[0], q[1], mob ? 2.2 : 2.9, 0, TAU); ctx.fill(); ctx.stroke(); }); }
      ctx.globalAlpha = 1;
    }

    // Etiquetes (SVG)
    const g = svg.append("g");
    const nameG = g.selectAll("g.cap-n").data(CAPS, d => d.id).join("g").attr("class", "cap-n")
      .attr("transform", d => `translate(${P[d.id].x},${P[d.id].y})`);
    nameG.each(function(d){
      const gr = d3.select(this);
      V.t(gr, 0, mob ? 5 : 2, d.name, {serif: true, size: mob ? 15 : 21, anchor: "middle", halo: 4}).attr("class", "nm");
      if(!mob) V.t(gr, 0, 20, d.sub, {size: 11.5, anchor: "middle", fill: C.ink2, halo: 3}).attr("class", "sb");
    });
    const stG = g.append("g").attr("transform", `translate(${P.cul.x},${P.cul.y})`).style("opacity", 0);
    STATES.forEach(s => {
      const y = s.y * R + (s.below ? R * .12 + 15 : -R * .1 - 8);
      V.t(stG, s.x * R, y, s.n, {size: mob ? 11 : 12, weight: 700, anchor: "middle", halo: 3});
    });
    const flG = g.append("g").style("opacity", 0);
    FL.forEach(f => {
      const dx = f.mid[0] - cx, dy = f.mid[1] - cy, dl = Math.hypot(dx, dy) || 1;
      const ox = f.mid[0] + dx / dl * (mob ? 14 : 24), oy = f.mid[1] + dy / dl * (mob ? 14 : 24);
      const anc = dx > 30 ? "start" : dx < -30 ? "end" : "middle";
      V.t(flG, ox, oy + (dy > 0 ? 10 : -2), f.t, {size: mob ? 11 : 12.5, weight: 700, anchor: anc, halo: 3});
      if(!mob) V.t(flG, ox, oy + (dy > 0 ? 24 : 12), f.d, {size: 11.5, anchor: anc, fill: C.ink2, halo: 3});
    });
    const simG = g.append("g").style("opacity", 0);
    if(!mob){
      const s = P.soc;
      V.note(simG, {x: s.x + R * 1.12, y: s.y - R * .55, tx: s.x + R * 1.75, ty: s.y - R * .2, kind: "curve", anchor: "start",
        lines: [["L'aura simbòlica", true], ["honor, prestigi, autoritat:"], ["el mateix capital, reconegut"]], size: 12});
    }

    function applyNow(st){
      const dur = V.reduced ? 0 : 420;
      nameG.transition().duration(dur).style("opacity", d => STEPS[st][d.id] < .5 ? .55 : 1);
      nameG.filter(d => d.id === "cul").selectAll(".sb").transition().duration(dur).style("opacity", st === "cul" ? 0 : 1);
      nameG.filter(d => d.id === "cul").select(".nm").transition().duration(dur).attr("y", st === "cul" ? (mob ? 5 : 6) : (mob ? 5 : 2));
      stG.transition().duration(dur).style("opacity", st === "cul" ? 1 : 0);
      flG.transition().duration(dur).style("opacity", st === "conv" ? 1 : 0);
      simG.transition().duration(dur).style("opacity", st === "sim" ? 1 : 0);
    }

    applyStep = function(st, instant){
      curStep = st;
      const tEl = $("#cap-t"), sEl = $("#cap-s");
      if(TITLES[st]){ if(tEl) tEl.textContent = TITLES[st][0]; if(sEl) sEl.textContent = TITLES[st][1]; }
      Object.assign(tgt, STEPS[st]);
      if(instant || V.reduced){ Object.assign(cur, tgt); draw(0); }
      applyNow(st);
    };

    // Hover
    const tp = V.tip(container);
    svg.style("cursor", "pointer");
    const setHov = k => { if(hov === k) return; hov = k; if(V.reduced) draw(0); };
    V.hover(svg.node(), (ev, [px, py]) => {
      if(cur.flow > .5){
        let best = null, bd = 1e9;
        FL.forEach((f, i) => f.samp.forEach(s => { const d = Math.hypot(px - s[0], py - s[1]); if(d < bd){ bd = d; best = i; } }));
        if(bd < 16){ setHov("f" + best); const f = FL[best]; tp.show(`<b>${f.t}</b> · ${f.d}`); return; }
      }
      const k = d3.least(CAPS, d => Math.hypot(px - P[d.id].x, py - P[d.id].y));
      const dist = Math.hypot(px - P[k.id].x, py - P[k.id].y);
      if(dist < R * 1.02){ setHov(k.id); tp.show(DOCK[k.id]); }
      else if(dist < R * 1.45 && cur.halo > .3){ setHov("sim"); tp.show(DOCK.sim); }
      else { setHov(null); tp.hide(); }
    }, () => { setHov(null); tp.hide(); });

    applyStep(curStep, true);
    el.__loop = V.loop(container, (t, dt) => {
      const k = 1 - Math.exp(-(dt || 16) / 260);
      for(const key in tgt) cur[key] += (tgt[key] - cur[key]) * k;
      draw(t);
    });
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
   V3 · SPREAD-02 sobre trama de punts (scrolly, 4 passos): l'espai social
   El fons és el model, no una decoració: a cada punt de la trama, el gris diu el
   volum de capital i, en separar-se, el blau diu el capital cultural i el vermell
   l'econòmic. D'aquí surt el quiasme de Bourdieu: cultura a dalt a l'esquerra,
   diners a dalt a la dreta.
   ========================================================================= */
(function(){
  const el = $("#esp-viz"), stepsEl = $("#s-espai .steps"), gEl = $("#s-espai .graphic");
  if(!el) return;
  const lg = $("#esp-lg");
  if(lg) V.legendCat(lg, [
    {c: C.blue, t: "Capital cultural", a: .6},
    {c: C.red, t: "Capital econòmic", a: .6},
    {c: C.ink, t: "Professions"}
  ]);
  const PROFS = D.espai.professions, GUSTS = D.espai.gustos;
  const TITLES = {
    volum: ["Eix vertical · Volum global de capital", "Com més gros el punt, més capital de tota mena"],
    estructura: ["Eix horitzontal · Estructura del capital", "El mateix volum es parteix: cultura a l'esquerra, diners a la dreta"],
    gustos: ["El gust segueix les coordenades socials", "Música, esport i consum cauen sobre el mateix mapa que les professions"],
    distincio: ["La mecànica de la distinció", "Quan un gust es popularitza, la frontera simbòlica puja"]
  };
  const ST = {volum: {m: 0, f: 1}, estructura: {m: 1, f: 1}, gustos: {m: 1, f: .38}, distincio: {m: 1, f: .38}};
  let curStep = "volum", applyStep = null;
  const fs = {m: 0, f: 1};

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const h = mob ? Math.round(Math.max(236, Math.min(window.innerHeight * .34, 290))) : 450;
    const m = mob ? {t: 22, r: 10, b: 22, l: 10} : {t: 30, r: 24, b: 30, l: 24};
    const {ctx, svg} = layers(container, w, h, "Esquema de l'espai social de La Distinction (Bourdieu, 1979). Una trama de punts mostra el volum de capital (de dalt a baix) i la seva composició: el blau, capital cultural, creix cap a dalt a l'esquerra; el vermell, capital econòmic, creix cap a dalt a la dreta. Sobre la trama, les professions i els gustos.");
    const X = d3.scaleLinear([-1.05, 1.05], [m.l, w - m.r]);
    const Y = d3.scaleLinear([-1.05, 1.05], [h - m.b, m.t]);

    // Trama hexagonal
    const sp = mob ? 12 : 16, rmax = sp * .44;
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
        ctx.fillStyle = C.ink2; ctx.globalAlpha = .3 * (1 - mm) * F; ctx.beginPath();
        LAT.forEach(p => { const r = rmax * .78 * Math.sqrt(p.vol); if(r < .35) return; ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, TAU); });
        ctx.fill();
      }
      if(mm > .001){
        const off = sp * .2 * mm;
        ctx.globalCompositeOperation = "multiply";
        [[C.blue, "cul", -off], [C.red, "eco", off]].forEach(([c, k, o]) => {
          ctx.fillStyle = c; ctx.globalAlpha = .46 * mm * F; ctx.beginPath();
          LAT.forEach(p => { const r = rmax * Math.sqrt(p[k]); if(r < .35) return; ctx.moveTo(p.x + o + r, p.y); ctx.arc(p.x + o, p.y, r, 0, TAU); });
          ctx.fill();
        });
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;
    }

    const g = svg.append("g");
    // Eixos fins
    g.append("line").attr("x1", X(0)).attr("x2", X(0)).attr("y1", m.t).attr("y2", h - m.b).attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-opacity", .55);
    const axH = g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", Y(0)).attr("y2", Y(0)).attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-opacity", .15);
    V.t(g, X(0), m.t - 9, "↑ Més capital", {size: mob ? 11 : 12, weight: 700, anchor: "middle", halo: true});
    V.t(g, X(0), h - m.b + 16, "↓ Menys capital", {size: mob ? 11 : 12, anchor: "middle", fill: C.muted, halo: true});
    const lblCul = V.t(g, m.l, Y(0) + (mob ? 15 : -7), "← Més cultural", {size: mob ? 11 : 12, weight: 700, anchor: "start", fill: C.blue, halo: true}).style("opacity", 0);
    const lblEco = V.t(g, w - m.r, Y(0) + (mob ? 15 : -7), "Més econòmic →", {size: mob ? 11 : 12, weight: 700, anchor: "end", fill: C.red, halo: true}).style("opacity", 0);

    // Frontera de la distinció: on era i on és
    const OLD = [[-1, .06], [-.4, .14], [.4, .12], [1, .04]], NEW = [[-1, .36], [-.4, .46], [.4, .44], [1, .34]];
    const line = d3.line().x(d => X(d[0])).y(d => Y(d[1])).curve(d3.curveCatmullRom);
    const distG = g.append("g").style("opacity", 0);
    distG.append("path").attr("d", line(OLD)).attr("fill", "none").attr("stroke", C.ink2).attr("stroke-width", 1).attr("stroke-dasharray", "1.5 3.5").attr("stroke-linecap", "round");
    const newP = distG.append("path").attr("d", line(OLD)).attr("fill", "none").attr("stroke", C.red).attr("stroke-width", 1.8).attr("stroke-dasharray", "6 4");
    const arrows = distG.append("g").style("opacity", 0);
    [-.62, .62].forEach(u => {
      arrows.append("line").attr("x1", X(u)).attr("x2", X(u)).attr("y1", Y(.16) - 2).attr("y2", Y(.4) + 6).attr("stroke", C.red).attr("stroke-width", .9);
      arrows.append("path").attr("d", `M${X(u) - 4},${Y(.4) + 11}L${X(u)},${Y(.4) + 5}L${X(u) + 4},${Y(.4) + 11}`).attr("fill", "none").attr("stroke", C.red).attr("stroke-width", .9);
    });
    const newL = V.t(distG, X(.98), Y(.38) - 8, "Frontera de la distinció", {size: mob ? 11 : 12, weight: 700, anchor: "end", fill: C.red, halo: true}).style("opacity", 0);
    if(!mob) V.t(distG, X(.98), Y(.04) + 16, "on era abans", {size: 11.5, italic: true, anchor: "end", fill: C.muted, halo: true});

    // Gustos
    const gustG = g.append("g").style("opacity", 0);
    GUSTS.forEach(gu => {
      const col = gu.c === "blue" ? C.blue : gu.c === "red" ? C.red : gu.c === "yellow" ? C.yellow : C.ink2;
      const gr = gustG.append("g").attr("transform", `translate(${X(gu.x)},${Y(gu.y)})`);
      gr.append("circle").attr("r", mob ? 17 : 36).attr("fill", col).attr("fill-opacity", gu.c === "yellow" ? .5 : .2).style("mix-blend-mode", "multiply");
      gr.append("circle").attr("r", mob ? 17 : 36).attr("fill", "none").attr("stroke", col === C.yellow ? C.yellowDark : col).attr("stroke-width", .8).attr("stroke-opacity", .6);
      V.t(gr, 0, 4, mob ? gu.short : gu.n, {serif: true, italic: true, size: mob ? 12 : 14.5, anchor: gu.x < -.5 ? "start" : gu.x > .5 ? "end" : "middle", halo: 3})
        .attr("x", gu.x < -.5 ? -(mob ? 12 : 26) : gu.x > .5 ? (mob ? 12 : 26) : 0);
    });

    // Professions
    const pG = g.selectAll("g.prof").data(PROFS, d => d.id).join("g").attr("class", "prof")
      .attr("transform", d => `translate(${X(d.x)},${Y(d.y)})`);
    pG.append("circle").attr("r", mob ? 3 : 3.8).attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1.4);
    pG.each(function(d){
      if(mob && !d.mob) return;
      const anc = d.x > .42 ? "end" : d.x < -.42 ? "start" : "middle";
      const dx = anc === "end" ? -7 : anc === "start" ? 7 : 0, dy = anc === "middle" ? (d.y < -.7 ? 15 : -8) : 4;
      V.t(d3.select(this), dx, dy, mob ? d.short : d.n, {size: mob ? 11 : 12, anchor: anc, fill: C.ink, halo: 3}).attr("class", "plab");
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
      const split = st !== "volum";
      axH.transition().duration(dur).attr("stroke-opacity", split ? .5 : .15);
      lblCul.transition().duration(dur).style("opacity", split ? 1 : 0);
      lblEco.transition().duration(dur).style("opacity", split ? 1 : 0);
      pG.transition().duration(dur).style("opacity", st === "gustos" || st === "distincio" ? .5 : 1);
      if(mob) pG.selectAll(".plab").transition().duration(dur).style("opacity", st === "gustos" || st === "distincio" ? 0 : 1);
      gustG.transition().duration(dur).style("opacity", st === "gustos" || st === "distincio" ? 1 : 0);
      distG.transition().duration(dur).style("opacity", st === "distincio" ? 1 : 0);
      const on = st === "distincio";
      newP.interrupt().transition().delay(on && !dur ? 0 : on ? 350 : 0).duration(on && dur ? 1400 : 0).ease(EIO).attr("d", line(on ? NEW : OLD));
      arrows.transition().delay(on && dur ? 900 : 0).duration(dur).style("opacity", on ? 1 : 0);
      newL.transition().delay(on && dur ? 1300 : 0).duration(dur).style("opacity", on ? 1 : 0);
    };

    const tp = V.tip(container);
    svg.style("cursor", "crosshair");
    V.hover(svg.node(), (ev, [px, py]) => {
      const hit = d3.least(PROFS, d => Math.hypot(px - X(d.x), py - Y(d.y)));
      const gh = (curStep === "gustos" || curStep === "distincio") ? d3.least(GUSTS, d => Math.hypot(px - X(d.x), py - Y(d.y))) : null;
      const dP = hit ? Math.hypot(px - X(hit.x), py - Y(hit.y)) : 1e9, dG = gh ? Math.hypot(px - X(gh.x), py - Y(gh.y)) : 1e9;
      if(dG < (mob ? 22 : 38) && dG < dP){ V.focus(pG, () => false); tp.show(`<b>${gh.n}</b> · gust associat a aquesta regió de l'espai social`); return; }
      if(dP < 40){
        V.focus(pG, d => d.id === hit.id);
        const vol = hit.y > .35 ? "molt capital" : hit.y < -.35 ? "poc capital" : "capital intermedi";
        const pol = hit.x < -.15 ? "sobretot cultural" : hit.x > .15 ? "sobretot econòmic" : "repartit entre tots dos";
        tp.show(`<b>${hit.n}</b> · ${vol}, ${pol}`);
      } else { V.focus(pG, null); tp.hide(); }
    }, () => { V.focus(pG, null); tp.hide(); });

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
   V5 · SPREAD-03 + PART-01 (dades reals): les set classes del Regne Unit
   100 punts, un per cada 1 % de la població, que s'apleguen a la renda familiar
   mitjana de la seva classe. El color diu el perfil de capitals.
   ========================================================================= */
(function(){
  const el = $("#gbcs-viz"); if(!el) return;
  const TONE = {elit: C.red, est: C.red, tec: C.yellow, nou: C.blue, eme: C.blue, tra: C.muted, pre: C.ghost};
  const OP = {elit: .9, est: .42, tec: .9, nou: .88, eme: .42, tra: .82, pre: .82};
  const NOTE = {elit: "alt en tots tres capitals", tec: "renda alta, poca cultura i xarxa", eme: "joves, molta cultura emergent", pre: "baix en tots tres capitals"};
  const lg = $("#gbcs-lg");
  if(lg) V.legendCat(lg, [
    {c: C.red, t: "Alts en tots tres capitals"},
    {c: C.yellow, t: "Diners sense cultura ni xarxa"},
    {c: C.blue, t: "Renda modesta, cultura i xarxa"},
    {c: C.muted, t: "Capitals baixos"}
  ], {title: "Cada punt, l'1 % de la població"});
  const DATA = D.gbcs;

  V.mount(el, (container, w) => {
    const mob = w < 600;
    const r = mob ? 4.4 : 8.2;
    const ml = mob ? 10 : 30, mr = mob ? 16 : 40;
    const X = d3.scaleLinear([0, 95000], [ml, w - mr]);
    // simulació de forces fixa (es calcula un sol cop per amplada)
    const rnd = V.rng(2013);
    const nodes = [];
    DATA.forEach(d => d3.range(d.pop).forEach(() => nodes.push({d, x: X(d.income) + (rnd() - .5) * 6, y: (rnd() - .5) * 20})));
    const sim = d3.forceSimulation(nodes)
      .force("x", d3.forceX(n => X(n.d.income)).strength(.85))
      .force("y", d3.forceY(0).strength(.07))
      .force("c", d3.forceCollide(r + (mob ? .7 : 1.1)).iterations(3)).stop();
    for(let i = 0; i < 320; i++) sim.tick();
    const y0 = d3.min(nodes, n => n.y) - r, y1 = d3.max(nodes, n => n.y) + r;
    const bandT = mob ? 40 : 58, bandB = mob ? 40 : 58, axisH = 34;
    const off = bandT - y0;
    nodes.forEach(n => { n.y += off; });
    const h = Math.round(bandT + (y1 - y0) + bandB + axisH);
    const yAxis = h - axisH + 4;

    const svg = V.svg(container, w, h, "Cent punts, un per cada 1 % de la població britànica, agrupats segons la renda familiar mitjana de les set classes de Savage et al. (2013): el precariat (15 %) a 8.253 £, la classe obrera tradicional (14 %) a 13.305 £, els treballadors emergents de serveis (19 %) a 21.048 £, els nous treballadors acomodats (15 %) a 29.247 £, la classe mitjana tècnica (6 %) a 37.428 £, la classe mitjana establerta (25 %) a 47.184 £ i l'elit (6 %) a 89.082 £, sola a la dreta.");
    const g = svg.append("g");
    // eix de renda
    const ticks = mob ? [0, 40000, 80000] : [0, 20000, 40000, 60000, 80000];
    ticks.forEach((t, i) => {
      g.append("line").attr("x1", X(t)).attr("x2", X(t)).attr("y1", bandT - 10).attr("y2", yAxis).attr("stroke", t === 0 ? C.ink : C.grid).attr("stroke-width", t === 0 ? 1 : .6);
      V.t(g, X(t), yAxis + 15, f0(t) + (i === ticks.length - 1 ? " £" : ""), {size: 11, anchor: "middle", fill: t === 0 ? C.ink : C.muted});
    });
    V.t(g, w - mr, yAxis + 30, "Renda familiar mitjana a l'any →", {size: 11.5, anchor: "end", fill: C.ink2});

    // etiquetes de classe, alternant a dalt i a baix i separades en horitzontal
    const CL = DATA.map(d => {
      const ns = nodes.filter(n => n.d === d);
      return {d, cx: X(d.income), top: d3.min(ns, n => n.y) - r, bot: d3.max(ns, n => n.y) + r};
    });
    const sideOf = {pre: "b", tra: "t", eme: "b", nou: "t", tec: "b", est: "t", elit: "t"};
    const showLab = d => !mob || ["pre", "eme", "est", "elit"].includes(d.id);
    ["t", "b"].forEach(side => {
      const arr = CL.filter(c => sideOf[c.d.id] === side && showLab(c.d)).sort((a, b) => a.cx - b.cx);
      arr.forEach(c => { c.lw = Math.max(textW(c.d.short, mob ? 11.5 : 12.5, true), textW(`${f0(c.d.income)} £ · ${c.d.pop} %`, 11.5)) + 6; c.lx = c.cx; });
      for(let i = 1; i < arr.length; i++){ const a = arr[i - 1], b = arr[i], minD = (a.lw + b.lw) / 2 + 10; if(b.lx - a.lx < minD) b.lx = a.lx + minD; }
      for(let i = arr.length - 1; i >= 0; i--){ const c = arr[i], maxX = (i === arr.length - 1 ? w - 4 : arr[i + 1].lx - (arr[i + 1].lw + c.lw) / 2 - 10) - c.lw / 2; if(c.lx > maxX) c.lx = maxX; if(c.lx < c.lw / 2 + 2) c.lx = c.lw / 2 + 2; }
    });
    const labG = g.selectAll("g.cl").data(CL.filter(c => showLab(c.d))).join("g").attr("class", "cl");
    labG.each(function(c){
      const gr = d3.select(this), top = sideOf[c.d.id] === "t";
      const ly = top ? (mob ? 12 : 16) : h - axisH - bandB + (mob ? 22 : 26);
      const ey = top ? c.top - 3 : c.bot + 3;
      const lyEdge = top ? ly + (NOTE[c.d.id] && !mob ? 32 : 18) : ly - 14;
      gr.append("path").attr("d", `M${c.cx},${ey}L${c.cx},${(ey + lyEdge) / 2}L${c.lx},${(ey + lyEdge) / 2}L${c.lx},${lyEdge}`)
        .attr("fill", "none").attr("stroke", C.ghost).attr("stroke-width", .8);
      V.t(gr, c.lx, ly, c.d.short, {size: mob ? 11.5 : 12.5, weight: 700, anchor: "middle", halo: true});
      V.t(gr, c.lx, ly + 14, `${f0(c.d.income)} £ · ${c.d.pop} %`, {size: 11.5, anchor: "middle", fill: C.ink2, halo: true});
      if(NOTE[c.d.id] && !mob) V.t(gr, c.lx, ly + 28, NOTE[c.d.id], {size: 11.5, italic: true, anchor: "middle", fill: C.muted, halo: true});
    });

    const dots = g.append("g").selectAll("circle").data(nodes).join("circle")
      .attr("cx", n => n.x).attr("cy", n => n.y).attr("r", r)
      .attr("fill", n => TONE[n.d.id]).attr("fill-opacity", n => OP[n.d.id])
      .attr("stroke", n => n.d.id === "pre" ? C.muted : n.d.id === "tec" ? C.yellowDark : (n.d.id === "est" || n.d.id === "eme") ? TONE[n.d.id] : C.paper)
      .attr("stroke-opacity", n => (n.d.id === "est" || n.d.id === "eme") ? .7 : 1).attr("stroke-width", n => n.d.id === "pre" || n.d.id === "tec" ? .7 : (n.d.id === "est" || n.d.id === "eme") ? .9 : 1);

    if(!container.__seen && !V.reduced){
      const mx = X(d3.mean(DATA, d => d.income)), my = (bandT + h - axisH - bandB) / 2;
      dots.attr("cx", () => mx + (rnd() - .5) * 60).attr("cy", () => my + (rnd() - .5) * 40).style("opacity", 0);
      labG.style("opacity", 0);
      V.onView(container, inst => {
        if(inst){ dots.attr("cx", n => n.x).attr("cy", n => n.y).style("opacity", 1); labG.style("opacity", 1); return; }
        dots.transition().duration(300).style("opacity", 1);
        dots.transition("mv").delay(n => 350 + DATA.indexOf(n.d) * 90 + rnd() * 160).duration(1300).ease(EIO).attr("cx", n => n.x).attr("cy", n => n.y);
        labG.transition().delay(1500).duration(500).style("opacity", 1);
      });
    }

    const del = d3.Delaunay.from(nodes, n => n.x, n => n.y);
    const tp = V.tip(container);
    svg.style("cursor", "pointer");
    let curD = null;
    V.hover(svg.node(), (ev, [px, py]) => {
      const n = nodes[del.find(px, py)];
      if(!n || Math.hypot(px - n.x, py - n.y) > r * 3.2){ if(curD){ curD = null; V.focus(dots, null); V.focus(labG, null); } tp.hide(); return; }
      if(curD !== n.d){
        curD = n.d;
        V.focus(dots, q => q.d === curD); V.focus(labG, c => c.d === curD);
      }
      const d = n.d;
      tp.show(`<b>${d.label}</b> · ${d.pop} % de la població · renda familiar mitjana ${f0(d.income)} £ · ${d.tag}`);
    }, () => { curD = null; V.focus(dots, null); V.focus(labG, null); tp.hide(); });
  });
})();

})();
