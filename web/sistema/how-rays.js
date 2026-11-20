/* HOW-04 · Ray simulation · Simulació de raigs
   Centenars de raigs (de so o de llum) que surten d'una font, reboten contra les parets d'una planta i perden energia a cada
   rebot, al costat d'un panell que mesura què arriba a qui escolta. Exemple: una sala el·líptica, la «galeria dels xiuxiueigs».
   Bloc per copiar: canvia ROOM (la paret i la seva intersecció), la font, els oients i les pèrdues. Requereix d3 7.9.0 i ib-viz.js. */
(function(){
  "use strict";
  const el = document.querySelector('[data-p="how-04"]'); if(!el) return;
  const C = IBV.C, INK = C.ink, PAPER = C.paper, F0 = IBV.fmt(",.0f");
  /* ---------- simulació (valors d'exemple) ---------- */
  const A = 15, B = 9, CF = Math.sqrt(A*A - B*B);       // semieixos (m) i distància del centre al focus
  const SPEED = .343, N = 360, BOUNCES = 5, LOSS = .8, HIT = .6, TMAX = 300; // m/ms, raigs, rebots, energia que queda a cada rebot, radi de l'oient (m), ms
  const SRC = [-CF, 0];
  const LISTEN = {focus: {p: [CF, 0], t: "Oient al segon focus"}, centre: {p: [0, 0], t: "Oient al centre"}};
  let mode = "focus";
  // traça cada raig: segments amb la distància acumulada i l'energia
  function hitWall(p, d){ const a = d[0]*d[0]/(A*A) + d[1]*d[1]/(B*B), b = 2*(p[0]*d[0]/(A*A) + p[1]*d[1]/(B*B)), c = p[0]*p[0]/(A*A) + p[1]*p[1]/(B*B) - 1;
    return (-b + Math.sqrt(b*b - 4*a*c))/(2*a); }
  const RAYS = d3.range(N).map(i => { const th = (i + .5)/N*2*Math.PI; let p = SRC.slice(), d = [Math.cos(th), Math.sin(th)], L = 0, e = 1; const seg = [];
    for(let k = 0; k <= BOUNCES; k++){ const t = hitWall(p, d), q = [p[0] + d[0]*t, p[1] + d[1]*t]; seg.push({p, q, d, L0: L, L1: L + t, e, k});
      L += t; e *= LOSS; let n = [q[0]/(A*A), q[1]/(B*B)]; const nl = Math.hypot(...n); n = [n[0]/nl, n[1]/nl]; const dn = d[0]*n[0] + d[1]*n[1]; d = [d[0] - 2*dn*n[0], d[1] - 2*dn*n[1]]; p = q; }
    return {th, seg}; });
  // què arriba a l'oient: per a cada segment, el pas més proper (dins del radi HIT)
  function arrivals(L){ const out = [];
    RAYS.forEach((r, ri) => r.seg.forEach(s => { const vx = L[0] - s.p[0], vy = L[1] - s.p[1], u = Math.max(0, Math.min(s.L1 - s.L0, vx*s.d[0] + vy*s.d[1])), cx = s.p[0] + s.d[0]*u, cy = s.p[1] + s.d[1]*u;
      if(Math.hypot(L[0] - cx, L[1] - cy) < HIT){ const ms = (s.L0 + u)/SPEED; if(ms < TMAX) out.push({ms, e: s.e, k: s.k, ri}); } }));
    return out; }
  const BIN = 4, NB = TMAX/BIN;
  const STATS = {}; Object.keys(LISTEN).forEach(k => { const ar = arrivals(LISTEN[k].p), bins = d3.range(NB).map(i => ({i, t0: i*BIN, dir: 0, ref: 0, n: 0}));
    ar.forEach(a => { const b = bins[Math.floor(a.ms/BIN)]; if(a.k === 0) b.dir += a.e; else b.ref += a.e; b.n++; });
    const firstRef = d3.min(ar.filter(a => a.k > 0), a => a.ms), direct = d3.min(ar.filter(a => a.k === 0), a => a.ms);
    const rays1 = new Set(ar.filter(a => a.k === 1).map(a => a.ri)).size, ref1 = d3.extent(ar.filter(a => a.k === 1), a => a.ms);
    const peak = d3.max(bins, b => b.dir + b.ref);
    STATS[k] = {bins, firstRef, direct, rays1, peak, ref1}; });

  /* ---------- dibuix ---------- */
  const mix = (a, b, k) => d3.interpolateLab(a, b)(k);
  const LIT = mix(PAPER, INK, .03), SHD = mix(PAPER, INK, .2);
  const tp = IBV.tip(el);
  let cv = null, ctx = null, svg = null, W = 0, H = 0, PW = 0, PH = 0, sc = 1, ox = 0, oy = 0, tms = 0, panel = null, still = IBV.reduced;
  const X = x => ox + x*sc, Y = y => oy - y*sc;
  function wallBlocks(){ const out = [], n = 64, T = .8; for(let i = 0; i < n; i++){ const a0 = i/n*2*Math.PI + .004, a1 = (i + 1)/n*2*Math.PI - .004, q = [];
      for(let k = 0; k <= 4; k++){ const a = a0 + (a1 - a0)*k/4; q.push([(A)*Math.cos(a), (B)*Math.sin(a)]); }
      for(let k = 4; k >= 0; k--){ const a = a0 + (a1 - a0)*k/4; q.push([(A + T)*Math.cos(a), (B + T)*Math.sin(a)]); }
      out.push(q); } return out; }
  const WALL = wallBlocks();
  function drawPlan(){
    if(!ctx) return;
    const L = LISTEN[mode].p;
    ctx.save(); ctx.clearRect(0, 0, PW, PH); ctx.lineJoin = "round"; ctx.lineCap = "round";
    // paviment: fils molt fins dins la sala
    ctx.save(); ctx.beginPath(); ctx.ellipse(X(0), Y(0), A*sc, B*sc, 0, 0, 7); ctx.clip();
    ctx.beginPath(); for(let x = -A; x <= A; x += 1.5){ ctx.moveTo(X(x), Y(-B)); ctx.lineTo(X(x), Y(B)); } for(let y = -B; y <= B; y += 1.5){ ctx.moveTo(X(-A), Y(y)); ctx.lineTo(X(A), Y(y)); }
    ctx.strokeStyle = IBV.alpha(INK, .045); ctx.lineWidth = .5; ctx.stroke(); ctx.restore();
    // eix major i focus
    ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(-A), Y(0)); ctx.lineTo(X(A), Y(0)); ctx.strokeStyle = IBV.alpha(INK, .22); ctx.lineWidth = .6; ctx.stroke(); ctx.setLineDash([]);
    // raigs
    const draw = tt => { const d = tt*SPEED, tail = 2.4;
      RAYS.forEach(r => { const s = r.seg.find(z => d >= z.L0 && d < z.L1); if(!s) return; const u = d - s.L0, x = s.p[0] + s.d[0]*u, y = s.p[1] + s.d[1]*u;
        const u0 = Math.max(0, u - tail), x0 = s.p[0] + s.d[0]*u0, y0 = s.p[1] + s.d[1]*u0;
        ctx.beginPath(); ctx.moveTo(X(x0), Y(y0)); ctx.lineTo(X(x), Y(y));
        ctx.strokeStyle = IBV.alpha(s.k === 0 ? C.blue : C.red, .18 + .6*s.e); ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(X(x), Y(y), 1.3, 0, 7); ctx.fillStyle = IBV.alpha(s.k === 0 ? C.blue : C.red, .35 + .6*s.e); ctx.fill(); }); };
    if(still){ [18, 40, 62, 84, 106].forEach(tt => draw(tt)); }
    else { draw(tms); }
    // paret de pedra en blocs
    WALL.forEach((q, i) => { ctx.beginPath(); q.forEach((p, k) => k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.closePath();
      const c = q[2], g = ctx.createLinearGradient(X(c[0]*.95), Y(c[1]*.95), X(c[0]*1.06), Y(c[1]*1.06)); g.addColorStop(0, LIT); g.addColorStop(1, SHD);
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = IBV.alpha(INK, .75); ctx.lineWidth = .7; ctx.stroke(); });
    // font i oient vistos des de dalt
    const who = (p, col, t, sub, below) => { const x = X(p[0]), y = Y(p[1]);
      ctx.beginPath(); ctx.ellipse(x, y, .42*sc, .24*sc, 0, 0, 7); ctx.fillStyle = col; ctx.globalAlpha = .9; ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x, y, .16*sc, 0, 7); ctx.fillStyle = PAPER; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, HIT*sc, 0, 7); ctx.setLineDash([2, 2]); ctx.strokeStyle = IBV.alpha(col, .6); ctx.stroke(); ctx.setLineDash([]);
      [[t, 700, col], [sub, 400, C.ink2]].forEach(([s, wgt, f], i) => { ctx.font = `${wgt} ${i ? 11.5 : 12}px ${IBV.SANS}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const yy = y + (below ? 1 : -1)*(HIT*sc + 12) + (below ? i*14 : -(1 - i)*14); ctx.lineWidth = 3.2; ctx.strokeStyle = PAPER; ctx.strokeText(s, x, yy); ctx.fillStyle = f; ctx.fillText(s, x, yy); }); };
    who(SRC, INK, "Qui parla", "focus A", false);
    who(L, C.red, "Qui escolta", mode === "focus" ? "focus B" : "centre", true);
    // escala
    const sx = X(-A), sy = Math.min(PH - 8, Y(-B) + .8*sc + 22); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 10*sc, sy); ctx.moveTo(sx, sy - 3); ctx.lineTo(sx, sy + 3); ctx.moveTo(sx + 10*sc, sy - 3); ctx.lineTo(sx + 10*sc, sy + 3);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = .8; ctx.stroke(); ctx.font = `400 11.5px ${IBV.SANS}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("10 m", sx + 10*sc + 6, sy + 4);
    if(!still){ ctx.textAlign = "right"; ctx.fillText(`${F0(tms)} ms després de la paraula`, PW - 4, sy + 4); }
    ctx.restore();
    if(panel) panel.cursor(still ? TMAX : tms);
  }
  function buildPanel(container, w, h){
    svg = IBV.svg(container, w, h, "Energia que arriba a qui escolta al llarg del temps: so directe en blau i so reflectit en vermell.");
    const st = STATS[mode], m = {l: 34, r: 14, t: 44, b: 92}, iw = w - m.l - m.r, ih = h - m.t - m.b;
    const x = d3.scaleLinear([0, TMAX], [0, iw]), y = d3.scaleSqrt([0, Math.max(STATS.focus.peak, STATS.centre.peak)], [ih, 0]);
    const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
    IBV.t(svg, m.l - 34, 14, "Què sent qui escolta", {size: 13, weight: 700});
    IBV.t(svg, m.l - 34, 31, "energia que arriba cada 4 ms (escala d'arrel)", {size: 11.5, fill: C.ink2});
    [0, 100, 200, 300].forEach(v => { g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", 0).attr("y2", ih).attr("stroke", C.grid).attr("stroke-width", .6);
      IBV.t(g, x(v), ih + 14, v + (v === 300 ? " ms" : ""), {size: 11, anchor: "middle", fill: C.muted}); });
    g.append("line").attr("x1", 0).attr("x2", iw).attr("y1", ih).attr("y2", ih).attr("stroke", C.ink).attr("stroke-width", .8);
    const bw = Math.max(1.2, iw/NB - 1);
    const bars = g.selectAll("g.b").data(st.bins.filter(b => b.dir + b.ref > 0)).join("g").attr("class", "b");
    bars.append("rect").attr("x", d => x(d.t0)).attr("width", bw).attr("y", d => y(d.ref)).attr("height", d => ih - y(d.ref)).attr("fill", C.red).attr("rx", .6);
    bars.append("rect").attr("x", d => x(d.t0)).attr("width", bw).attr("y", d => y(d.ref + d.dir)).attr("height", d => y(d.ref) - y(d.ref + d.dir)).attr("fill", C.blue).attr("rx", .6);
    const cur = g.append("line").attr("y1", -6).attr("y2", ih).attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-dasharray", "2 2");
    const mask = g.append("rect").attr("y", -8).attr("height", ih + 9).attr("fill", PAPER).attr("opacity", .82);
    // anotacions calculades
    const ann = (t, lines, col, dy) => { if(t == null) return; const xx = x(t); g.append("line").attr("x1", xx).attr("x2", xx + 10).attr("y1", dy).attr("y2", dy - 12).attr("stroke", col).attr("stroke-width", .7);
      lines.forEach((s, i) => IBV.t(g, xx + 13, dy - 14 + i*13, s, {size: i ? 11 : 11.5, weight: i ? 400 : 700, fill: i ? C.ink2 : col, halo: true})); };
    ann(st.direct, ["So directe", `${F0(st.direct)} ms`], C.blue, ih*.62);
    ann(st.firstRef, [mode === "focus" ? "Tots els ecos alhora" : "Primers ecos", `${F0(st.firstRef)} ms`], C.red, mode === "focus" ? 16 : ih*.3);
    // xifres
    const fy = ih + m.t + 34;
    const stat = (yy, big, txt, col) => { IBV.t(svg, m.l - 34, yy, big, {size: 20, weight: 400, serif: true, fill: col}); IBV.t(svg, m.l - 34 + (big.length*10.5) + 8, yy - 2, txt, {size: 11.5, fill: C.ink2}); };
    stat(fy, `${st.rays1} de ${N}`, "raigs passen per l'oient després del primer rebot", C.red);
    if(mode === "focus") stat(fy + 28, `${F0(2*A)} m`, "el mateix camí per a tots: l'eix major", INK);
    else stat(fy + 28, `${F0(st.ref1[0])}–${F0(st.ref1[1])} ms`, "els primers ecos arriben escampats", INK);
    IBV.hover(svg.node(), (ev, [px]) => { const t = x.invert(px - m.l), b = st.bins[Math.floor(t/BIN)];
      if(!b || t < 0 || t > TMAX){ IBV.focus(bars, null); tp.hide(); return; }
      IBV.focus(bars, d => Math.abs(d.i - b.i) <= 1);
      tp.show(`<b>${F0(b.t0)}–${F0(b.t0 + BIN)} ms</b> · ${b.n ? `${b.n} raigs, ${b.dir ? "so directe" : "so reflectit"}` : "no arriba res"}`); }, () => { IBV.focus(bars, null); tp.hide(); });
    return {cursor(t){ cur.attr("x1", x(t)).attr("x2", x(t)); mask.attr("x", x(t) + 1).attr("width", Math.max(0, iw - x(t))); }};
  }
  IBV.mount(el, (container, w) => {
    d3.select(container).selectAll(".h4-wrap").remove();
    const mob = w < 640, wrap = d3.select(container).append("div").attr("class", "h4-wrap").style("display", "flex").style("flex-direction", mob ? "column" : "row").style("gap", mob ? "18px" : "28px");
    const left = wrap.append("div").style("flex", mob ? "none" : "1.55 1 0").node(), right = wrap.append("div").style("flex", mob ? "none" : "1 1 0").style("min-width", 0).node();
    PW = mob ? w : Math.round((w - 28)*1.55/2.55); sc = (PW - 8)/(2*(A + .8)); PH = Math.round(2*(B + .8)*sc + 50);
    ox = PW/2; oy = (2*(B + .8)*sc)/2 + 26;
    ({c: cv, ctx} = IBV.canvas(left, PW, PH, "Planta d'una sala el·líptica amb raigs de so que surten de qui parla, en un focus, reboten a la paret i es tornen a trobar a l'altre focus."));
    const RW = mob ? w : w - PW - 28;
    panel = buildPanel(right, RW, mob ? 300 : PH);
    IBV.hover(cv, (ev, [px, py]) => { const p = [(px - ox)/sc, (oy - py)/sc], L = LISTEN[mode].p;
      if(Math.hypot(p[0] - SRC[0], p[1] - SRC[1]) < 1.6) tp.show("<b>Qui parla</b> · en un dels dos focus de l'el·lipse");
      else if(Math.hypot(p[0] - L[0], p[1] - L[1]) < 1.6) tp.show(`<b>Qui escolta</b> · ${mode === "focus" ? "a l'altre focus: hi passen tots els raigs reflectits" : "al centre: els ecos hi arriben escampats"}`);
      else if(p[0]*p[0]/(A*A) + p[1]*p[1]/(B*B) > .92) tp.show("<b>Paret</b> · cada rebot hi deixa el 20 % de l'energia (valor d'exemple)");
      else tp.hide(); }, () => tp.hide());
    drawPlan();
  });
  document.querySelectorAll('[data-seg="how-04"] button').forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll('[data-seg="how-04"] button').forEach(o => o.setAttribute("aria-pressed", o === b ? "true" : "false"));
    mode = b.dataset.k; tms = 0; const right = el.querySelector(".h4-wrap > div:last-child"); if(right) panel = buildPanel(right, +svg.attr("width"), +svg.attr("height")); drawPlan(); }));
  // un pols cada ~9 s, a càmera molt lenta (40 ms de so per segon); amb moviment reduït, fronts d'ona fixos
  IBV.loop(el, (t, dt) => { if(IBV.reduced){ still = true; drawPlan(); return; } tms += dt*.04; if(tms > TMAX + 60) tms = 0; drawPlan(); });
})();
