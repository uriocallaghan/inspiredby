/* «El viatge de la pizza»: 6 visualitzacions del sistema infogràfic (IBV + d3 7.9.0).
   Paleta estricta: vermell #C8442A, blau #2C5DA8, groc #F5C518, grisos i terra #ECEBE8.
   Mai text en groc; mai fons pintats; mai anells diana; hover suau IBV.focus (0,48) + IBV.tip dock. */
(function(){
  "use strict";
  const D = window.PIZZA_DADES;
  const C = IBV.C;
  const F0 = IBV.fmt(",.0f");
  const F1 = IBV.fmt(",.1f");

  const COL = { vermell: C.vermell, blau: C.blau, groc: C.groc };
  const TEXT_COL = { vermell: C.vermell, blau: C.blau, groc: C.ink }; // mai text en groc

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  /* Helper per a arcs geogràfics (cercle màxim interpolat) */
  function greatCircleLine(a, b, n){
    const interp = d3.geoInterpolate(a, b);
    const pts = [];
    for(let i = 0; i <= (n || 48); i++) pts.push(interp(i / (n || 48)));
    return { type: "LineString", coordinates: pts };
  }

  /* =========================================================================
     1. SCROLLY 1 — QUATRE CONTINENTS EN UN SOL DISC (IB-24 + IB-25)
     ========================================================================= */
  (function initOrigen(){
    const el = document.getElementById("origen-viz");
    const lgEl = document.getElementById("origen-lg");
    const playBtn = document.getElementById("origen-play");
    const tEl = document.getElementById("origen-t");
    const sEl = document.getElementById("origen-s");
    if(!el) return;

    IBV.legendCat(lgEl, [
      { c: C.groc, t: "Cereals, oli i herbes" },
      { c: C.blau, t: "Microbis i ramaderia" },
      { c: C.vermell, t: "Intercanvi americà (tomàquet)" }
    ]);

    const STEPS = {
      blat:     { idx: 0, t: "Pas 1 · El blat del Creixent Fèrtil", s: "Fa ~10.000–8.500 anys: l'hibridació hexaploide crea el gluten elàstic" },
      llevat:   { idx: 1, t: "Pas 2 · Llevat asiàtic i olivera llevantina", s: "Saccharomyces cerevisiae neix a l'Àsia Oriental; l'olivera, al Llevant" },
      bufala:   { idx: 2, t: "Pas 3 · Búfala i alfàbrega de l'Índia", s: "La búfala d'aigua arriba als aiguamolls de Campània i hi dóna la mozzarella" },
      tomaquet: { idx: 3, t: "Pas 4 · El tomàquet creua l'Atlàntic", s: "Dels Andes a Mesoamèrica, i dos segles de recel abans d'entrar a Nàpols (1692)" },
      napoli:   { idx: 4, t: "Quatre continents dins d'una Margherita", s: "Abans de 1492 aquesta combinació era biològicament impossible" }
    };

    let curStep = "blat";
    let paused = false;
    let loopCtl = null;
    let worldData = null;
    let state = null;

    if(playBtn){
      if(IBV.reduced){ playBtn.style.display = "none"; }
      playBtn.addEventListener("click", () => {
        paused = !paused;
        playBtn.textContent = paused ? "Reprodueix el flux" : "Atura el flux";
      });
    }

    function buildAndDraw(container, w){
      if(loopCtl){ loopCtl.stop(); loopCtl = null; }
      const mob = w < 540;
      const h = mob ? Math.round(clamp(w * 0.62, 200, 232)) : Math.round(clamp(w * 0.52, 340, 440));
      container.innerHTML = "";

      const wrap = d3.select(container).append("div").style("position","relative").style("width",w+"px").style("height",h+"px");
      const { c: cv, ctx } = IBV.canvas(wrap.node(), w, h, "");
      d3.select(cv).attr("aria-hidden","true").style("position","absolute").style("left","0").style("top","0").style("pointer-events","none");

      const svg = IBV.svg(wrap.node(), w, h,
        "Mapa del món en projecció Equal Earth amb sis rutes de domesticació que convergeixen a Nàpols: blat, llevat, olivera, búfala, alfàbrega i tomàquet.");
      svg.style("position","relative").style("z-index","1");

      const tp = IBV.tip(container);

      const proj = d3.geoEqualEarth()
        .rotate([-12, 0])
        .fitExtent([[mob ? 4 : 12, mob ? 8 : 14], [w - (mob ? 4 : 12), h - (mob ? 8 : 14)]], { type: "Sphere" });
      const path = d3.geoPath(proj);

      // Gratícula gairebé invisible + terra silenciosa
      const gMap = svg.append("g");
      gMap.append("path").datum(d3.geoGraticule().step([30, 30])())
        .attr("d", path).attr("fill","none").attr("stroke", C.grid).attr("stroke-width", 0.45);
      if(worldData){
        gMap.append("path").datum(worldData.land).attr("d", path).attr("fill", C.land);
        gMap.append("path").datum(worldData.borders).attr("d", path).attr("fill","none").attr("stroke", C.paper).attr("stroke-width", 0.5);
      }

      const napXY = proj(D.napoli);

      // Precomputar rutes en coordenades de pantalla (canvas fluid a 60 fps)
      const routes = D.origens.map((d, idx) => {
        const segs = [];
        if(d.andes){
          const p1 = greatCircleLine(d.andes, [d.lon, d.lat], 24).coordinates.map(pt => proj(pt)).filter(Boolean);
          const p2 = greatCircleLine([d.lon, d.lat], D.napoli, 48).coordinates.map(pt => proj(pt)).filter(Boolean);
          segs.push(p1, p2);
        } else {
          const p = greatCircleLine([d.lon, d.lat], D.napoli, 48).coordinates.map(pt => proj(pt)).filter(Boolean);
          segs.push(p);
        }
        return { d, idx, segs, xy: proj([d.lon, d.lat]), andesXY: d.andes ? proj(d.andes) : null };
      });

      const gArcs = svg.append("g").attr("class","or-arcs");
      const gNodes = svg.append("g").attr("class","or-nodes");
      const gAnn = svg.append("g").attr("class","or-ann").style("pointer-events","none");

      const arcSel = gArcs.selectAll("g.arc-item").data(routes).join("g").attr("class","arc-item");
      arcSel.each(function(r){
        const g = d3.select(this);
        const col = COL[r.d.cat];
        const lineGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveCatmullRom.alpha(0.5));
        r.segs.forEach((pts, si) => {
          g.append("path")
            .attr("d", lineGen(pts))
            .attr("fill","none")
            .attr("stroke", col)
            .attr("stroke-width", r.d.id === "tomaquet" ? 2.1 : 1.5)
            .attr("stroke-opacity", 0.72)
            .attr("stroke-dasharray", (r.d.andes && si === 0) ? "3 3" : null);
        });
      });

      // Nodes d'origen: cercles translúcids multiply + punt central (MAI anells diana)
      const nodeSel = gNodes.selectAll("g.node-item").data(routes).join("g").attr("class","node-item");
      nodeSel.each(function(r){
        const g = d3.select(this);
        const col = COL[r.d.cat];
        if(r.andesXY){
          g.append("circle").attr("cx", r.andesXY[0]).attr("cy", r.andesXY[1]).attr("r", mob ? 5 : 7)
            .attr("fill", col).attr("fill-opacity", 0.25).style("mix-blend-mode","multiply");
          g.append("circle").attr("cx", r.andesXY[0]).attr("cy", r.andesXY[1]).attr("r", 2).attr("fill", col);
        }
        g.append("circle").attr("class","aura")
          .attr("cx", r.xy[0]).attr("cy", r.xy[1]).attr("r", mob ? r.d.r * 0.72 : r.d.r)
          .attr("fill", col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("class","core")
          .attr("cx", r.xy[0]).attr("cy", r.xy[1]).attr("r", 2.8)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.9);
      });

      // Destí: Nàpols
      const gNap = svg.append("g").attr("class","nap-node");
      gNap.append("circle").attr("cx", napXY[0]).attr("cy", napXY[1]).attr("r", mob ? 10 : 15)
        .attr("fill", C.vermell).attr("fill-opacity", 0.24).style("mix-blend-mode","multiply");
      gNap.append("circle").attr("cx", napXY[0]).attr("cy", napXY[1]).attr("r", 3.6)
        .attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1.2);

      // Etiquetes directes amb halo i clamp dins l'amplada
      const lblOffsets = {
        blat:     mob ? [8, -14]  : [12, -16],
        llevat:   mob ? [-8, -14] : [-10, -14],
        olivera:  mob ? [8, 16]   : [10, 18],
        bufala:   mob ? [6, -12]  : [10, -14],
        alfabrega:mob ? [6, 16]   : [10, 16],
        tomaquet: mob ? [10, -14] : [14, -14]
      };
      const annSel = gAnn.selectAll("g.ann-item").data(routes).join("g").attr("class","ann-item");
      annSel.each(function(r){
        const g = d3.select(this);
        const off = lblOffsets[r.d.id] || [10, -10];
        let lx = clamp(r.xy[0] + off[0], 42, w - 48);
        let ly = clamp(r.xy[1] + off[1], 14, h - 10);
        const anc = r.d.id === "llevat" ? "end" : "start";
        if(anc === "end") lx = clamp(r.xy[0] + off[0], 72, w - 8);
        IBV.t(g, lx, ly, mob ? r.d.curt : r.d.nom, {
          size: mob ? 11 : 12, weight: 700, anchor: anc, fill: TEXT_COL[r.d.cat], halo: 3
        });
        if(!mob){
          IBV.t(g, lx, ly + 13, r.d.epoca, { size: 11, fill: C.ink2, anchor: anc, halo: 3 });
        }
      });

      const napLbl = gAnn.append("g").attr("class","nap-lbl");
      IBV.t(napLbl, clamp(napXY[0] - 10, 46, w - 50), clamp(napXY[1] - 12, 16, h - 14), "Nàpols", {
        size: mob ? 11.5 : 13, weight: 700, anchor: "end", fill: C.ink, halo: 3.5
      });

      // Partícules lentes (recorregut complet ~26 segons: moviment serè i hipnòtic)
      const particles = [];
      routes.forEach((r, ri) => {
        const count = mob ? 3 : 5;
        for(let i = 0; i < count; i++){
          particles.push({ r, phase: (i / count + ri * 0.17) % 1, speed: 1 / (24000 + (ri % 3) * 3500) });
        }
      });

      function activeLimit(){ return STEPS[curStep].idx; }

      function updateVisibility(instant){
        const lim = activeLimit();
        const dur = instant || IBV.reduced ? 0 : 420;
        arcSel.transition().duration(dur)
          .style("opacity", r => r.d.pas <= lim ? (r.d.pas === lim || lim === 4 ? 1 : 0.42) : 0.04);
        nodeSel.transition().duration(dur)
          .style("opacity", r => r.d.pas <= lim ? (r.d.pas === lim || lim === 4 ? 1 : 0.48) : 0.08);
        annSel.transition().duration(dur)
          .style("opacity", r => {
            if(mob) return (r.d.pas === lim || (lim === 4 && (r.d.id === "tomaquet" || r.d.id === "blat" || r.d.id === "llevat"))) ? 1 : 0;
            return r.d.pas <= lim ? (r.d.pas === lim || lim === 4 ? 1 : 0.35) : 0;
          });
        napLbl.transition().duration(dur).style("opacity", lim >= 0 ? 1 : 0);
        if(tEl) tEl.textContent = STEPS[curStep].t;
        if(sEl) sEl.textContent = STEPS[curStep].s;
      }

      // Hover interactiu via Delaunay / nearest
      let hoveredId = null;
      function setHover(r){
        hoveredId = r ? r.d.id : null;
        if(!r){
          updateVisibility(true);
          tp.hide();
          return;
        }
        IBV.focus(arcSel, x => x.d.id === r.d.id, { dim: 0.48 });
        IBV.focus(nodeSel, x => x.d.id === r.d.id, { dim: 0.48 });
        nodeSel.selectAll("circle.core")
          .attr("r", function(){ const d = d3.select(this.parentNode).datum(); return d.d.id === r.d.id ? 4.5 : 2.8; })
          .attr("stroke", function(){ const d = d3.select(this.parentNode).datum(); return d.d.id === r.d.id ? C.ink : C.paper; });
        tp.show(`<b>${r.d.nom}</b> (<i>${r.d.especie}</i>) · ${r.d.origen} · ${r.d.detall}`);
      }

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        const lim = activeLimit();
        const visible = routes.filter(r => r.d.pas <= lim);
        const best = d3.least(visible, r => Math.hypot(r.xy[0] - mx, r.xy[1] - my));
        if(best && Math.hypot(best.xy[0] - mx, best.xy[1] - my) < (mob ? 42 : 64)){
          setHover(best);
        } else {
          if(hoveredId) setHover(null);
        }
      }, () => setHover(null));

      // Dibuix de partícules lentes en canvas
      let simT = 0;
      loopCtl = IBV.loop(container, (t, dt) => {
        if(!paused) simT += dt;
        ctx.clearRect(0, 0, w, h);
        const lim = activeLimit();
        particles.forEach(p => {
          if(p.r.d.pas > lim) return;
          if(hoveredId && p.r.d.id !== hoveredId) return;
          const seg = p.r.segs[p.r.segs.length - 1];
          if(seg.length < 2) return;
          const u = (p.phase + simT * p.speed) % 1;
          const f = u * (seg.length - 1);
          const i0 = Math.floor(f), i1 = Math.min(seg.length - 1, i0 + 1), frac = f - i0;
          const px = seg[i0][0] + (seg[i1][0] - seg[i0][0]) * frac;
          const py = seg[i0][1] + (seg[i1][1] - seg[i0][1]) * frac;
          const prevI = Math.max(0, i0 - 2);
          const tx = seg[prevI][0], ty = seg[prevI][1];
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.strokeStyle = IBV.alpha(COL[p.r.d.cat], 0.55);
          ctx.lineWidth = 2.0;
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(px, py, 2.3, 0, Math.PI * 2);
          ctx.fillStyle = COL[p.r.d.cat];
          ctx.fill();
        });
      });

      state = { updateVisibility };
      updateVisibility(true);
    }

    const mounted = IBV.mount(el, (container, w) => {
      if(worldData){ buildAndDraw(container, w); }
      else { IBV.world().then(wd => { worldData = wd; buildAndDraw(container, w); }); }
    });

    const stepsEl = document.querySelector("#s-origen .steps");
    const graphicEl = document.querySelector("#s-origen .graphic");
    if(stepsEl && graphicEl && window.IB && IB.scrolly){
      IB.scrolly(stepsEl, graphicEl, (idx, stepEl) => {
        const k = stepEl && stepEl.dataset && stepEl.dataset.s;
        if(k && STEPS[k]){
          curStep = k;
          if(state) state.updateVisibility(false);
        }
      });
    }
    return mounted;
  })();

  /* =========================================================================
     2. FIGURA 2 — 14.400 ANYS DE PA PLA I ELS SEUS PARENTS (IB-49 + IB-25)
     ========================================================================= */
  (function initPans(){
    const el = document.getElementById("pans-viz");
    const lgEl = document.getElementById("pans-lg");
    const btns = document.querySelectorAll("#f-pans .seg button");
    if(!el) return;

    let mode = "cronologia";
    let worldData = null;

    function renderLegend(){
      lgEl.innerHTML = "";
      if(mode === "cronologia"){
        IBV.legendCat(lgEl, [
          { c: C.groc, t: "Arqueologia del pa pla" },
          { c: C.blau, t: "Biologia i ingredients" },
          { c: C.vermell, t: "Nàpols i mite" },
          { c: C.ink, t: "Diàspora i UNESCO" }
        ]);
      } else {
        IBV.legendCat(lgEl, [
          { c: C.vermell, t: "Arc mediterrani" },
          { c: C.blau, t: "Europa central" },
          { c: C.groc, t: "Altres continents" }
        ]);
      }
    }

    function drawCronologia(container, w){
      const mob = w < 760;
      const colOf = c => c === "pa" ? C.groc : c === "bio" ? C.blau : c === "hist" ? C.vermell : C.ink;
      const tp = IBV.tip(container);
      const ancient = D.fites.filter(d => d.any < 1500);
      const modern = D.fites.filter(d => d.any >= 1500);
      const keySet = new Set([-12400, 1692, 2017]);

      if(mob){
        // Mòbil: barra proporcional lineal superior + llista vertical en dos blocs
        const xMini = d3.scaleLinear([-12400, 2026], [6, w - 6]);
        const axisX = 82;
        const rowH = 44;
        const hdr1Y = 92;
        const y1 = 104;
        const sepY = y1 + ancient.length * rowH + 6;
        const hdr2Y = sepY + 18;
        const y2 = hdr2Y + 12;
        const h = y2 + modern.length * rowH + 12;

        const svg = IBV.svg(container, w, h, "Cronologia en escala lineal real dels 14.400 anys amb barra proporcional superior i llista ordenada en dos blocs: pa pla antic i zoom 1500–2025.");

        // Capçalera proporcional superior (y = 0..76)
        IBV.t(svg, 6, 14, "Escala lineal real (14.400 anys)", { size: 11.5, weight: 700, fill: C.ink });
        IBV.t(svg, 6, 29, "El 96 % del temps és pa pla abans del tomàquet", { size: 11, fill: C.ink2 });

        const barY = 46;
        svg.append("line").attr("x1", 6).attr("x2", w - 6).attr("y1", barY).attr("y2", barY)
          .attr("stroke", C.hair).attr("stroke-width", 1.5);
        const zw = Math.max(8, xMini(2026) - xMini(1500));
        const zx = xMini(2026) - zw;
        svg.append("rect").attr("x", zx).attr("y", barY - 7).attr("width", zw).attr("height", 14).attr("rx", 1.5)
          .attr("fill", C.vermell).attr("fill-opacity", 0.16).attr("stroke", C.vermell).attr("stroke-width", 1);

        const miniDots = svg.append("g").selectAll("circle.mini-dot").data(D.fites).join("circle")
          .attr("class", "mini-dot")
          .attr("cx", d => xMini(d.any)).attr("cy", barY).attr("r", 2.2)
          .attr("fill", d => colOf(d.cat));

        IBV.t(svg, 6, 63, "12.400 aC", { size: 11, fill: C.muted });
        IBV.t(svg, w - 6, 63, "1500–2025 (3,6 %) ↓", { size: 11, weight: 700, anchor: "end", fill: C.vermell });

        // Bloc 1: Pa pla antic
        IBV.t(svg, 6, hdr1Y, "Pa pla abans del tomàquet (12.400 aC – 997)", { size: 11, weight: 700, fill: C.muted });
        svg.append("line").attr("x1", axisX).attr("x2", axisX)
          .attr("y1", y1 + 18).attr("y2", y1 + (ancient.length - 1) * rowH + 18)
          .attr("stroke", C.hair).attr("stroke-width", 1);

        // Separador i Bloc 2: Zoom modern
        svg.append("line").attr("x1", 6).attr("x2", w - 6).attr("y1", sepY).attr("y2", sepY)
          .attr("stroke", IBV.alpha(C.vermell, 0.45)).attr("stroke-width", 0.9);
        IBV.t(svg, 6, hdr2Y, "Zoom · 1500–2025: la pizza moderna (3,6 %)", { size: 11.5, weight: 700, fill: C.vermell });
        svg.append("line").attr("x1", axisX).attr("x2", axisX)
          .attr("y1", y2 + 18).attr("y2", y2 + (modern.length - 1) * rowH + 18)
          .attr("stroke", IBV.alpha(C.vermell, 0.45)).attr("stroke-width", 1);

        const placedRows = [
          ...ancient.map((d, i) => ({ d, cy: y1 + i * rowH + 18 })),
          ...modern.map((d, i) => ({ d, cy: y2 + i * rowH + 18 }))
        ];

        const rows = svg.selectAll("g.fita").data(placedRows).join("g").attr("class", "fita hit")
          .attr("transform", p => `translate(0, ${p.cy})`);

        rows.append("rect").attr("x", 0).attr("y", -18).attr("width", w).attr("height", rowH).attr("fill", "transparent");
        rows.append("circle").attr("class", "aura").attr("cx", axisX).attr("cy", 0).attr("r", 0)
          .attr("fill", p => colOf(p.d.cat)).attr("fill-opacity", 0.24).style("mix-blend-mode", "multiply");
        rows.append("circle").attr("class", "dot").attr("cx", axisX).attr("cy", 0).attr("r", 3.5)
          .attr("fill", p => colOf(p.d.cat)).attr("stroke", C.paper).attr("stroke-width", 0.8);

        rows.each(function(p){
          const g = d3.select(this);
          IBV.t(g, axisX - 12, 4, p.d.etiq, { size: 11, weight: 700, anchor: "end", fill: C.ink2 });
          IBV.t(g, axisX + 14, -1, p.d.titol, { size: 12, weight: 700, fill: C.ink });
          IBV.t(g, axisX + 14, 14, p.d.lloc, { size: 11.5, fill: C.muted });
        });

        IBV.onView(container, instant => {
          rows.selectAll("circle.aura").transition().duration(instant ? 0 : 750).ease(IBV.EASE)
            .attr("r", p => keySet.has(p.d.any) ? 10.5 : 8.5);
        });

        function resetMob(){
          IBV.focus(rows, null);
          rows.selectAll("circle.dot").attr("r", 3.5).attr("stroke", C.paper).attr("stroke-width", 0.8);
          miniDots.attr("r", 2.2).attr("stroke", "none").attr("stroke-width", 0);
          tp.hide();
        }

        IBV.hover(svg.node(), (ev, [mx, my]) => {
          const best = d3.least(placedRows, p => Math.abs(my - p.cy));
          if(!best || Math.abs(my - best.cy) > rowH * 0.55){ resetMob(); return; }
          IBV.focus(rows, p => p === best, { dim: 0.48 });
          rows.selectAll("circle.dot")
            .attr("r", p => p === best ? 5 : 3.5)
            .attr("stroke", p => p === best ? C.ink : C.paper)
            .attr("stroke-width", p => p === best ? 1.3 : 0.8);
          miniDots
            .attr("r", d => d === best.d ? 4 : 2.2)
            .attr("stroke", d => d === best.d ? C.ink : "none")
            .attr("stroke-width", d => d === best.d ? 1.3 : 0);
          miniDots.filter(d => d === best.d).raise();
          tp.show(`<b>${best.d.etiq} · ${best.d.lloc}</b> · ${best.d.detall}`);
        }, resetMob);
        return;
      }

      // Escriptori (>= 760 px): dues franges en escala lineal real (14.400 anys + zoom 1500–2025)
      const h = 418;
      const M = { l: 24, r: 24 };
      const svg = IBV.svg(container, w, h, "Cronologia en dues franges lineals reals: dalt, els 14.400 anys d'història del pa pla (el 96 % anterior al tomàquet); a sota, zoom lineal de 1500 a 2025 amb les vuit fites de la pizza moderna.");

      const xTop = d3.scaleLinear([-12400, 2026], [M.l, w - M.r]);
      const xZoom = d3.scaleLinear([1500, 2026], [M.l, w - M.r]);
      const topY = 120;
      const yConn0 = 128;
      const yConn1 = 178;
      const zoomY = 316;
      const bx0 = xTop(1500);
      const bx1 = xTop(2026);

      // Capçalera franja 1
      const h1 = svg.append("text").attr("x", M.l).attr("y", 14).attr("font-size", 12)
        .style("font-variant-numeric", "tabular-nums");
      h1.append("tspan").attr("font-weight", 700).attr("fill", C.ink).text("1 · Escala lineal real (14.400 anys)");
      h1.append("tspan").attr("fill", C.ink2).text(" · El 96 % és pa pla abans del tomàquet");
      IBV.t(svg, w - M.r, 14, "Zoom 1500–2025 (3,6 %) ↓", { size: 11.5, weight: 600, anchor: "end", fill: C.vermell });

      // Connector òptic de zoom (darrere de les marques i eixos)
      const beamPath = `M ${bx0},${yConn0} C ${bx0},${yConn0 + 34} ${M.l},${yConn1 - 24} ${M.l},${yConn1} L ${w - M.r},${yConn1} C ${w - M.r},${yConn1 - 24} ${bx1},${yConn0 + 34} ${bx1},${yConn0} Z`;
      const zoomBeam = svg.append("path").attr("d", beamPath).attr("fill", C.vermell).attr("fill-opacity", 0.04);
      svg.append("path")
        .attr("d", `M ${bx0},${yConn0} C ${bx0},${yConn0 + 34} ${M.l},${yConn1 - 24} ${M.l},${yConn1}`)
        .attr("fill", "none").attr("stroke", IBV.alpha(C.vermell, 0.5)).attr("stroke-width", 0.9).attr("stroke-dasharray", "3 3");
      svg.append("path")
        .attr("d", `M ${bx1},${yConn0} C ${bx1},${yConn0 + 34} ${w - M.r},${yConn1 - 24} ${w - M.r},${yConn1}`)
        .attr("fill", "none").attr("stroke", IBV.alpha(C.vermell, 0.5)).attr("stroke-width", 0.9).attr("stroke-dasharray", "3 3");
      svg.append("line").attr("x1", M.l).attr("x2", w - M.r).attr("y1", yConn1).attr("y2", yConn1)
        .attr("stroke", IBV.alpha(C.vermell, 0.35)).attr("stroke-width", 0.8);

      // Marques d'eix franja 1
      [-12000, -8000, -4000, 0].forEach(v => {
        const tx = xTop(v);
        svg.append("line").attr("x1", tx).attr("x2", tx).attr("y1", topY).attr("y2", topY + 5).attr("stroke", C.muted);
        const lbl = v < 0 ? `${F0(-v)} aC` : "Any 0";
        IBV.t(svg, clamp(tx, M.l + 26, w - M.r - 26), topY + 17, lbl, { size: 11, anchor: "middle", fill: C.muted, halo: 3 });
      });
      svg.append("line").attr("x1", M.l).attr("x2", w - M.r).attr("y1", topY).attr("y2", topY)
        .attr("stroke", C.ink).attr("stroke-width", 1.1);

      // Finestra de zoom 1500–2026 sobre la franja 1
      svg.append("rect").attr("x", bx0).attr("y", topY - 8).attr("width", Math.max(2, bx1 - bx0)).attr("height", 16).attr("rx", 1.5)
        .attr("fill", IBV.alpha(C.vermell, 0.13)).attr("stroke", C.vermell).attr("stroke-width", 1.1);
      const miniDots = svg.append("g").selectAll("circle.mini-dot").data(modern).join("circle")
        .attr("class", "mini-dot")
        .attr("cx", d => xTop(d.any)).attr("cy", topY).attr("r", 2.2)
        .attr("fill", d => colOf(d.cat));

      // Capçalera franja 2 + guies de segle
      const h2 = svg.append("text").attr("x", M.l).attr("y", 194).attr("font-size", 12)
        .style("font-variant-numeric", "tabular-nums");
      h2.append("tspan").attr("font-weight", 700).attr("fill", C.vermell).text("2 · Zoom lineal (1500 – 2025)");
      h2.append("tspan").attr("fill", C.ink2).text(" · Els últims 525 anys, només el 3,6 % de la història");

      [1500, 1600, 1700, 1800, 1900, 2000].forEach(v => {
        const gx = xZoom(v);
        svg.append("line").attr("x1", gx).attr("x2", gx).attr("y1", 218).attr("y2", 408)
          .attr("stroke", C.grid).attr("stroke-width", 0.55);
        IBV.t(svg, gx, 212, String(v), { size: 11, anchor: v === 1500 ? "start" : "middle", fill: C.muted });
      });
      svg.append("line").attr("x1", M.l).attr("x2", w - M.r).attr("y1", zoomY).attr("y2", zoomY)
        .attr("stroke", C.ink).attr("stroke-width", 1.1);

      // Posicionament determinista de totes 12 fites
      const ancSpec = {
        "-12400": { ty: 44, anchor: "start", dx: 6, stemY: 40 },
        "-8000":  { ty: 82, anchor: "start", dx: 6, stemY: 78 },
        "79":     { ty: 82, anchor: "end",   dx: -6, stemY: 78 },
        "997":    { ty: 44, anchor: "end",   dx: -6, stemY: 40 }
      };
      const modSpec = {
        "1544": { ty: 276, anchor: "start", dx: 6, stemY: 272 },
        "1692": { ty: 348, anchor: "end",   dx: -6, stemY: 342 },
        "1835": { ty: 276, anchor: "end",   dx: -6, stemY: 272 },
        "1858": { ty: 348, anchor: "end",   dx: -6, stemY: 342 },
        "1889": { ty: 236, anchor: "end",   dx: -6, stemY: 232 },
        "1905": { ty: 388, anchor: "end",   dx: -6, stemY: 382 },
        "1970": { ty: 276, anchor: "end",   txFixed: w - M.r, stemY: 294 },
        "2017": { ty: 348, anchor: "end",   txFixed: w - M.r, stemY: 336 }
      };

      const placedAll = D.fites.map(d => {
        const isMod = d.any >= 1500;
        const spec = isMod ? modSpec[String(d.any)] : ancSpec[String(d.any)];
        const cx = isMod ? xZoom(d.any) : xTop(d.any);
        const cy = isMod ? zoomY : topY;
        const tx = spec.txFixed != null ? spec.txFixed : cx + spec.dx;
        return { d, isMod, cx, cy, ty: spec.ty, tx, anchor: spec.anchor, stemY: spec.stemY };
      });

      const items = svg.append("g").selectAll("g.fita").data(placedAll).join("g").attr("class", "fita hit");
      items.each(function(p){
        const g = d3.select(this);
        const col = colOf(p.d.cat);
        const textCol = col === C.groc ? C.ink : col;

        g.append("line").attr("class", "stem")
          .attr("x1", p.cx).attr("x2", p.cx).attr("y1", p.cy).attr("y2", p.stemY)
          .attr("stroke", C.hair).attr("stroke-width", 0.8);
        g.append("circle").attr("class", "aura")
          .attr("cx", p.cx).attr("cy", p.cy).attr("r", 0)
          .attr("fill", col).attr("fill-opacity", 0.28).style("mix-blend-mode", "multiply");
        g.append("circle").attr("class", "dot")
          .attr("cx", p.cx).attr("cy", p.cy).attr("r", 3.6)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 1);

        IBV.t(g, p.tx, p.ty, p.d.etiq, { size: 11.5, weight: 700, anchor: p.anchor, fill: textCol, halo: 3 });
        IBV.t(g, p.tx, p.ty + 14, p.d.titol, { size: 11.5, anchor: p.anchor, fill: C.ink, halo: 3 });
      });

      const rBase = w < 900 ? 8 : 10;
      const rKey = w < 900 ? 10.5 : 13;
      IBV.onView(container, instant => {
        items.selectAll("circle.aura").transition().duration(instant ? 0 : 850).ease(IBV.EASE)
          .attr("r", p => keySet.has(p.d.any) ? rKey : rBase);
      });

      const placedAnc = placedAll.filter(p => !p.isMod);
      const placedMod = placedAll.filter(p => p.isMod);

      function hitLabel(list, mx, my){
        return list.find(p => {
          const approxW = Math.max(p.d.titol.length * 6.0, 58);
          const x0 = p.anchor === "start" ? p.tx - 6 : p.tx - approxW - 6;
          const x1 = p.anchor === "start" ? p.tx + approxW + 6 : p.tx + 6;
          return mx >= x0 && mx <= x1 && my >= p.ty - 14 && my <= p.ty + 20;
        });
      }

      function highlightItem(best){
        IBV.focus(items, p => p === best, { dim: 0.48 });
        items.selectAll("circle.dot")
          .attr("r", p => p === best ? 5.4 : 3.6)
          .attr("stroke", p => p === best ? C.ink : C.paper);
        items.selectAll("line.stem")
          .attr("stroke", p => p === best ? C.ink : C.hair)
          .attr("stroke-width", p => p === best ? 1.3 : 0.8);
        miniDots
          .attr("r", d => best.isMod && d === best.d ? 4 : 2.2)
          .attr("stroke", d => best.isMod && d === best.d ? C.ink : "none")
          .attr("stroke-width", d => best.isMod && d === best.d ? 1.3 : 0);
        if(best.isMod) miniDots.filter(d => d === best.d).raise();
        zoomBeam.attr("fill-opacity", best.isMod ? 0.06 : 0.04);
        tp.show(`<b>${best.d.etiq} · ${best.d.lloc}</b> · ${best.d.detall}`);
      }

      function resetDesktop(){
        IBV.focus(items, null);
        items.selectAll("circle.dot").attr("r", 3.6).attr("stroke", C.paper);
        items.selectAll("line.stem").attr("stroke", C.hair).attr("stroke-width", 0.8);
        miniDots.attr("r", 2.2).attr("stroke", "none").attr("stroke-width", 0);
        zoomBeam.attr("fill-opacity", 0.04);
        tp.hide();
      }

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(my < 168){
          if(mx >= bx0 - 8 && mx <= bx1 + 8){
            IBV.focus(items, p => p.isMod, { dim: 0.48 });
            items.selectAll("circle.dot").attr("r", 3.6).attr("stroke", C.paper);
            items.selectAll("line.stem").attr("stroke", C.hair).attr("stroke-width", 0.8);
            miniDots.attr("r", 2.6).attr("stroke", "none").attr("stroke-width", 0);
            zoomBeam.attr("fill-opacity", 0.09);
            tp.show("<b>1500–2025 (3,6 % del temps)</b> · Les vuit fites modernes de la pizza desplegades a la franja inferior");
            return;
          }
          let best = hitLabel(placedAnc, mx, my);
          if(!best){
            const cand = d3.least(placedAnc, p => Math.abs(p.cx - mx));
            if(cand && Math.abs(cand.cx - mx) <= 90) best = cand;
          }
          if(best) highlightItem(best);
          else resetDesktop();
          return;
        }
        const best = hitLabel(placedMod, mx, my) || d3.least(placedMod, p => Math.abs(p.cx - mx));
        if(best) highlightItem(best);
        else resetDesktop();
      }, resetDesktop);
    }

    function drawParents(container, w){
      const mob = w < 560;
      const colOf = c => c === "med" ? C.vermell : c === "eur" ? C.blau : C.groc;
      const tp = IBV.tip(container);

      if(mob){
        // Llista gràfica orgànica vertical en mòbil (0 retalls, 100 % llegible)
        const rowH = 56, padT = 10, h = padT + D.parents.length * rowH + 8;
        const svg = IBV.svg(container, w, h, "Vuit parents antropològics del pa pla al món, amb cereal, tipus de forn i funció social.");
        const rows = svg.selectAll("g.par").data(D.parents).join("g").attr("class","par hit")
          .attr("transform", (d, i) => `translate(0, ${padT + i * rowH})`);
        rows.append("line").attr("x1", 0).attr("x2", w).attr("y1", rowH - 2).attr("y2", rowH - 2).attr("stroke", C.grid).attr("stroke-width", 0.6);
        rows.append("circle").attr("cx", 14).attr("cy", 22).attr("r", 10).attr("fill", d => colOf(d.cat)).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        rows.append("circle").attr("class","core").attr("cx", 14).attr("cy", 22).attr("r", 3).attr("fill", d => colOf(d.cat));
        rows.each(function(d){
          const g = d3.select(this);
          IBV.t(g, 32, 18, `${d.nom} · ${d.lloc}`, { size: 12.5, weight: 700, fill: C.ink });
          IBV.t(g, 32, 34, `${d.cereal} · ${d.foc}`, { size: 11.5, fill: C.ink2 });
        });
        IBV.hover(svg.node(), (ev, [mx, my]) => {
          const i = clamp(Math.floor((my - padT) / rowH), 0, D.parents.length - 1);
          const d = D.parents[i];
          IBV.focus(rows, x => x === d, { dim: 0.48 });
          tp.show(`<b>${d.nom}</b> (${d.lloc}) · ${d.rol}`);
        }, () => { IBV.focus(rows, null); tp.hide(); });
        return;
      }

      const h = Math.round(clamp(w * 0.46, 330, 410));
      const svg = IBV.svg(container, w, h, "Mapa del món amb vuit tradicions germanes del pa pla: coca de recapte, manakish, lahmacun, pissaladière, flammekueche, injera, naan i tlayuda.");
      const proj = d3.geoEqualEarth().rotate([-10, 0]).fitExtent([[12, 12], [w - 12, h - 12]], { type: "Sphere" });
      const path = d3.geoPath(proj);

      svg.append("path").datum(d3.geoGraticule().step([30, 30])()).attr("d", path).attr("fill","none").attr("stroke", C.grid).attr("stroke-width", 0.45);
      if(worldData){
        svg.append("path").datum(worldData.land).attr("d", path).attr("fill", C.land);
        svg.append("path").datum(worldData.borders).attr("d", path).attr("fill","none").attr("stroke", C.paper).attr("stroke-width", 0.5);
      }

      const offs = {
        "Coca de recapte": [-14, 14],
        "Pissaladière":    [-14, -8],
        "Flammekueche":    [14, -18],
        "Lahmacun":        [14, -12],
        "Manakish":        [14, 16],
        "Injera":          [14, 10],
        "Naan i roti":     [14, -10],
        "Tortilla / tlayuda": [14, -10]
      };

      const pts = D.parents.map(d => Object.assign({}, d, { xy: proj([d.lon, d.lat]) }));
      const nodes = svg.selectAll("g.par-node").data(pts).join("g").attr("class","par-node hit");
      nodes.each(function(d){
        const g = d3.select(this);
        const col = colOf(d.cat);
        g.append("circle").attr("cx", d.xy[0]).attr("cy", d.xy[1]).attr("r", 13)
          .attr("fill", col).attr("fill-opacity", 0.28).style("mix-blend-mode","multiply");
        g.append("circle").attr("class","core").attr("cx", d.xy[0]).attr("cy", d.xy[1]).attr("r", 3.2)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.9);
        const [ox, oy] = offs[d.nom] || [12, -10];
        const anc = ox < 0 ? "end" : "start";
        g.append("line").attr("x1", d.xy[0]).attr("y1", d.xy[1]).attr("x2", d.xy[0] + ox * 0.78).attr("y2", d.xy[1] + oy * 0.78)
          .attr("stroke", C.ink2).attr("stroke-width", 0.65);
        IBV.t(g, clamp(d.xy[0] + ox, 54, w - 54), clamp(d.xy[1] + oy, 14, h - 10), d.nom, {
          size: 12, weight: 700, anchor: anc, fill: col === C.groc ? C.ink : col, halo: 3
        });
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        const best = d3.least(pts, d => Math.hypot(d.xy[0] - mx, d.xy[1] - my));
        if(best && Math.hypot(best.xy[0] - mx, best.xy[1] - my) < 70){
          IBV.focus(nodes, d => d === best, { dim: 0.48 });
          nodes.selectAll("circle.core").attr("r", d => d === best ? 4.8 : 3.2).attr("stroke", d => d === best ? C.ink : C.paper);
          tp.show(`<b>${best.nom}</b> (${best.lloc} · ${best.cereal}) · ${best.rol}`);
        } else {
          IBV.focus(nodes, null);
          nodes.selectAll("circle.core").attr("r", 3.2).attr("stroke", C.paper);
          tp.hide();
        }
      }, () => {
        IBV.focus(nodes, null);
        nodes.selectAll("circle.core").attr("r", 3.2).attr("stroke", C.paper);
        tp.hide();
      });
    }

    function draw(container, w){
      container.innerHTML = "";
      renderLegend();
      if(mode === "cronologia") drawCronologia(container, w);
      else if(worldData) drawParents(container, w);
      else IBV.world().then(wd => { worldData = wd; drawParents(container, w); });
    }

    const m = IBV.mount(el, draw);
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      mode = b.dataset.k;
      m.redraw();
    }));
  })();

  /* =========================================================================
     3. FIGURA 3 — BIOLOGIA INVISIBLE: LACTOSA I SINERGIA UMAMI (IB-38)
     ========================================================================= */
  (function initBio(){
    const el = document.getElementById("bio-viz");
    const lgEl = document.getElementById("bio-lg");
    const btns = document.querySelectorAll("#f-bio .seg button");
    if(!el) return;

    let mode = "lactosa";

    function renderLegend(){
      lgEl.innerHTML = "";
      if(mode === "lactosa"){
        IBV.legendCat(lgEl, [
          { c: C.vermell, t: "Itàlia i Sardenya" },
          { c: C.blau, t: "Europa del Nord" },
          { c: C.ghost, t: "Món i Àsia Oriental" }
        ]);
      } else {
        IBV.legendCat(lgEl, [
          { c: C.vermell, t: "Motor glutamat (tomàquet / parmesà)" },
          { c: C.groc, t: "Potenciador ribonucleòtid (anxova / bolet)" },
          { c: C.blau, t: "Base làctia i fresca" }
        ]);
      }
    }

    function drawLactosa(container, w){
      const mob = w < 640;
      const tp = IBV.tip(container);
      const colOf = g => g === "italia" ? C.vermell : g === "nord" ? C.blau : C.ink2;

      const hLeft = 248;
      const hRight = mob ? 176 : 248;
      const h = mob ? hLeft + hRight + 28 : 276;
      const svg = IBV.svg(container, w, h,
        "Comparació de la malabsorció de lactosa en adults per regió (Itàlia 50 %, Dinamarca 4 %, món 68 %) i la caiguda de lactosa de la llet (4,81 g/100 g) a la mozzarella (0–0,07 g) i al Parmigiano (0 g).");

      const leftW = mob ? w : Math.round(w * 0.56);
      const rightX = mob ? 0 : leftW + 34;
      const rightW = mob ? w : w - rightX;
      const rightY = mob ? hLeft + 26 : 0;

      // PANELL A: Malabsorció de lactosa en adults (%)
      const gA = svg.append("g");
      IBV.t(gA, 0, 14, "Adults amb malabsorció de lactosa (%)", { size: 13, weight: 700, fill: C.ink });
      const M = { l: mob ? 0 : 162, r: 22, t: 38 };
      const x = d3.scaleLinear([0, 100], [M.l, leftW - M.r]);
      const rSc = d3.scaleSqrt([0, 100], [4, mob ? 13 : 15]);
      const rowH = mob ? 34 : 33;

      // Eix X fi
      [0, 50, 100].forEach(tk => {
        gA.append("line").attr("x1", x(tk)).attr("x2", x(tk)).attr("y1", M.t - 8).attr("y2", M.t + D.lactosa_reg.length * rowH - 8)
          .attr("stroke", tk === 50 ? C.hair : C.grid).attr("stroke-dasharray", tk === 50 ? "2 3" : null);
        IBV.t(gA, x(tk), M.t + D.lactosa_reg.length * rowH + 8, tk + " %", { size: 11, anchor: tk === 100 ? "end" : tk === 0 ? "start" : "middle", fill: C.muted });
      });

      const rowsA = gA.selectAll("g.lac-row").data(D.lactosa_reg).join("g").attr("class","lac-row hit")
        .attr("transform", (d, i) => `translate(0, ${M.t + i * rowH + 10})`);

      rowsA.each(function(d){
        const g = d3.select(this);
        const col = colOf(d.grup);
        g.append("line").attr("x1", M.l).attr("x2", leftW - M.r).attr("y1", 0).attr("y2", 0).attr("stroke", C.grid).attr("stroke-width", 0.6);
        g.append("line").attr("x1", M.l).attr("x2", x(d.pct)).attr("y1", 0).attr("y2", 0).attr("stroke", col).attr("stroke-width", 1.2).attr("stroke-opacity", 0.55);
        g.append("circle").attr("class","bub").attr("cx", x(d.pct)).attr("cy", 0).attr("r", 0)
          .attr("fill", col).attr("fill-opacity", d.grup === "italia" ? 0.34 : 0.24).style("mix-blend-mode","multiply");
        g.append("circle").attr("class","core").attr("cx", x(d.pct)).attr("cy", 0).attr("r", 3)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.8);

        if(mob){
          IBV.t(g, 0, -10, `${d.regio} · ${d.pct} %`, { size: 11.5, weight: d.grup === "italia" ? 700 : 400, fill: d.grup === "italia" ? C.vermell : C.ink });
        } else {
          IBV.t(g, M.l - 10, 4, d.regio, { size: 12, weight: d.grup === "italia" ? 700 : 400, anchor: "end", fill: d.grup === "italia" ? C.vermell : C.ink });
          IBV.t(g, clamp(x(d.pct) + rSc(d.pct) + 6, M.l + 18, leftW - 4), 4, d.pct + " %", {
            size: 11.5, weight: 700, anchor: x(d.pct) > leftW - 56 ? "end" : "start", fill: col, halo: 3
          });
        }
      });

      // PANELL B: Caiguda de lactosa (g / 100 g) — cercles d'àrea proporcional (USDA)
      const gB = svg.append("g").attr("transform", `translate(${rightX}, ${rightY})`);
      IBV.t(gB, 0, 14, "La fermentació elimina la lactosa (g / 100 g)", { size: 13, weight: 700, fill: C.ink });
      const rMilk = d3.scaleSqrt([0, 4.81], [3, mob ? 38 : 48]);
      const centers = [
        { d: D.lactosa_llet[0], cx: rightW * 0.22, cy: 102, col: C.blau },
        { d: D.lactosa_llet[1], cx: rightW * 0.60, cy: 102, col: C.vermell },
        { d: D.lactosa_llet[2], cx: rightW * 0.86, cy: 102, col: C.ink }
      ];

      gB.append("line").attr("x1", centers[0].cx).attr("x2", centers[2].cx).attr("y1", 102).attr("y2", 102)
        .attr("stroke", C.hair).attr("stroke-width", 0.7).attr("stroke-dasharray", "3 3");

      const bubB = gB.selectAll("g.milk-b").data(centers).join("g").attr("class","milk-b hit");
      bubB.each(function(c){
        const g = d3.select(this);
        const rr = rMilk(c.d.g);
        g.append("circle").attr("class","bub").attr("cx", c.cx).attr("cy", c.cy).attr("r", 0)
          .attr("fill", c.col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("cx", c.cx).attr("cy", c.cy).attr("r", 2.5).attr("fill", c.col);
        IBV.t(g, c.cx, c.cy + 62, c.d.nom, { size: 11.5, weight: 700, anchor: "middle", fill: C.ink });
        IBV.t(g, c.cx, c.cy + 77, c.d.g === 0 ? "0 g" : (c.d.g < 0.2 ? "≤ 0,07 g" : "4,81 g"), {
          size: 12, weight: 700, anchor: "middle", fill: c.col
        });
      });

      IBV.note(gB, {
        x: centers[1].cx, y: 88, tx: rightW * 0.56, ty: 44,
        lines: [["−98 % de lactosa", true], ["El sèrum i els bacteris la digereixen"]],
        kind: "curve", anchor: "middle", bend: -10, size: 11.5
      });

      IBV.onView(container, instant => {
        rowsA.selectAll("circle.bub").transition().duration(instant ? 0 : 800).ease(IBV.EASE).attr("r", d => rSc(d.pct));
        bubB.selectAll("circle.bub").transition().duration(instant ? 0 : 850).ease(IBV.EASE).attr("r", c => rMilk(c.d.g));
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        const inB = mob ? (my > rightY) : (mx > leftW + 10);
        if(!inB){
          const i = clamp(Math.floor((my - M.t) / rowH), 0, D.lactosa_reg.length - 1);
          const d = D.lactosa_reg[i];
          IBV.focus(rowsA, x => x === d, { dim: 0.48 });
          IBV.focus(bubB, null);
          tp.show(`<b>${d.regio}</b> · ${d.pct} % d'adults amb malabsorció de lactosa (${d.font})`);
        } else {
          const lx = mx - rightX;
          const best = d3.least(centers, c => Math.abs(c.cx - lx));
          IBV.focus(bubB, c => c === best, { dim: 0.48 });
          IBV.focus(rowsA, null);
          tp.show(`<b>${best.d.nom}</b> · ${best.d.sub} (USDA FoodData Central)`);
        }
      }, () => {
        IBV.focus(rowsA, null);
        IBV.focus(bubB, null);
        tp.hide();
      });
    }

    function drawUmami(container, w){
      const mob = w < 560;
      const tp = IBV.tip(container);
      const M = { l: mob ? 0 : 196, r: 28, t: 28, b: 64 };
      const rowH = mob ? 44 : 38;
      const h = M.t + D.umami.length * rowH + M.b;
      const svg = IBV.svg(container, w, h,
        "Contingut de glutamat lliure (mg per 100 g) en set ingredients de la pizza: des de la mozzarella (10 mg) i el tomàquet fresc (140–250 mg) fins al Parmigiano-Reggiano (1.200–1.680 mg).");

      const x = d3.scaleLinear([0, 1750], [M.l, w - M.r]);
      const rSc = d3.scaleSqrt([0, 1680], [4, mob ? 14 : 18]);

      const ticks = mob ? [0, 500, 1000, 1500] : [0, 250, 500, 750, 1000, 1250, 1500];
      ticks.forEach((tk, idx) => {
        svg.append("line").attr("x1", x(tk)).attr("x2", x(tk)).attr("y1", M.t - 6).attr("y2", h - M.b + 4)
          .attr("stroke", tk === 0 ? C.ink : C.grid).attr("stroke-width", tk === 0 ? 1 : 0.7);
        IBV.t(svg, x(tk), M.t - 12, F0(tk) + (idx === ticks.length - 1 ? " mg/100 g" : ""), {
          size: 11, anchor: idx === ticks.length - 1 ? "end" : tk === 0 ? "start" : "middle", fill: C.muted
        });
      });

      const rows = svg.selectAll("g.um-row").data(D.umami).join("g").attr("class","um-row hit")
        .attr("transform", (d, i) => `translate(0, ${M.t + i * rowH + (mob ? 22 : 16)})`);

      rows.each(function(d){
        const g = d3.select(this);
        const col = COL[d.cat];
        g.append("line").attr("x1", M.l).attr("x2", w - M.r).attr("y1", 0).attr("y2", 0).attr("stroke", C.grid).attr("stroke-width", 0.55);
        // Interval real min–max
        g.append("line").attr("x1", x(d.min)).attr("x2", x(d.max)).attr("y1", 0).attr("y2", 0)
          .attr("stroke", col).attr("stroke-width", 2.4).attr("stroke-linecap","round").attr("stroke-opacity", 0.7);
        // Cercle translúcid multiply
        g.append("circle").attr("class","bub").attr("cx", x(d.mid)).attr("cy", 0).attr("r", 0)
          .attr("fill", col).attr("fill-opacity", 0.32).style("mix-blend-mode","multiply");
        g.append("circle").attr("class","core").attr("cx", x(d.mid)).attr("cy", 0).attr("r", 3)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.8);

        const rngTxt = d.min === d.max ? `${F0(d.mid)} mg` : `${F0(d.min)}–${F0(d.max)} mg`;
        if(mob){
          IBV.t(g, 0, -11, `${d.nom} · ${rngTxt}`, { size: 11.5, weight: d.cat === "vermell" ? 700 : 400, fill: C.ink });
        } else {
          IBV.t(g, M.l - 12, 4, d.nom, { size: 12.5, weight: d.cat === "vermell" ? 700 : 400, anchor: "end", fill: C.ink });
          const tx = x(d.max) + rSc(d.mid) + 6;
          const flip = tx > w - 84;
          IBV.t(g, flip ? x(d.min) - rSc(d.mid) - 6 : tx, 4, rngTxt, {
            size: 11.5, weight: 600, anchor: flip ? "end" : "start", fill: TEXT_COL[d.cat], halo: 3
          });
        }
      });

      // Nota editorial de sinergia T1R1/T1R3 a la base
      const syY = h - (mob ? 34 : 24);
      IBV.rule(svg, M.l, w - M.r, syY - 16, { stroke: C.hair });
      if(mob){
        IBV.lines(svg, M.l, syY, [
          ["Sinergia T1R1/T1R3: glutamat del tomàquet +"],
          ["inosinat d'anxova o guanilat de bolet → fins a 7–8×"]
        ], { size: 11, italic: true, fill: C.ink2 });
      } else {
        IBV.t(svg, M.l, syY, "Sinergia al·lostèrica (T1R1/T1R3): glutamat del tomàquet + inosinat d'anxova o guanilat de bolet → fins a 7–8× més intensitat umami.", {
          size: 12, italic: true, fill: C.ink2
        });
      }

      IBV.onView(container, instant => {
        rows.selectAll("circle.bub").transition().duration(instant ? 0 : 820).ease(IBV.EASE).attr("r", d => rSc(d.mid));
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        const i = clamp(Math.floor((my - M.t) / rowH), 0, D.umami.length - 1);
        const d = D.umami[i];
        IBV.focus(rows, x => x === d, { dim: 0.48 });
        rows.selectAll("circle.core").attr("r", x => x === d ? 4.8 : 3).attr("stroke", x => x === d ? C.ink : C.paper);
        tp.show(`<b>${d.nom}</b> (${F0(d.min)}–${F0(d.max)} mg/100 g) · ${d.nota}`);
      }, () => {
        IBV.focus(rows, null);
        rows.selectAll("circle.core").attr("r", 3).attr("stroke", C.paper);
        tp.hide();
      });
    }

    function draw(container, w){
      container.innerHTML = "";
      renderLegend();
      if(mode === "lactosa") drawLactosa(container, w);
      else drawUmami(container, w);
    }

    const m = IBV.mount(el, draw);
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      mode = b.dataset.k;
      m.redraw();
    }));
  })();

  /* =========================================================================
     4. SCROLLY 2 — TALL DEL FORN I LA MASSA EN COCCIÓ (IB-16)
     ========================================================================= */
  (function initFornScrolly(){
    const el = document.getElementById("forn-viz");
    const lgEl = document.getElementById("forn-lg");
    const playBtn = document.getElementById("forn-play");
    const tEl = document.getElementById("forn-t");
    const sEl = document.getElementById("forn-s");
    if(!el) return;

    IBV.legendCat(lgEl, [
      { c: C.vermell, t: "Calor radiant i Maillard (>140 °C)" },
      { c: C.groc, t: "Sòl refractari i gas CO₂" },
      { c: C.blau, t: "Vapor d'aigua (100 °C)" }
    ]);

    const STEPS = {
      massa:     { idx: 0, t: "1 · La xarxa viva de gluten i CO₂", s: "Gliadina i glutenina atrapen les bombolles exhalades per Saccharomyces cerevisiae" },
      conduccio: { idx: 1, t: "2 · El tampó tèrmic del maó refractari", s: "El sòl a 330–485 °C frena la conducció fins a una interfície de ~208–240 °C" },
      radiacio:  { idx: 2, t: "3 · Cúpula radiant i escut de vapor", s: "La radiació infraroja (∝ T⁴) daura les vores mentre el vapor manté el centre a 100 °C" },
      maillard:  { idx: 3, t: "4 · Reacció de Maillard en 60–90 segons", s: "Per sobre de 140 °C, aminoàcids i sucres creen aroma i la «pell de lleopard»" }
    };

    let curStep = "massa";
    let paused = false;
    let loopCtl = null;
    let state = null;

    if(playBtn){
      if(IBV.reduced) playBtn.style.display = "none";
      playBtn.addEventListener("click", () => {
        paused = !paused;
        playBtn.textContent = paused ? "Reprodueix el flux" : "Atura el flux";
      });
    }

    function draw(container, w){
      if(loopCtl){ loopCtl.stop(); loopCtl = null; }
      const mob = w < 540;
      const h = mob ? 226 : Math.round(clamp(w * 0.50, 340, 410));
      container.innerHTML = "";

      const wrap = d3.select(container).append("div").style("position","relative").style("width",w+"px").style("height",h+"px");
      const { c: cv, ctx } = IBV.canvas(wrap.node(), w, h, "");
      d3.select(cv).attr("aria-hidden","true").style("position","absolute").style("left","0").style("top","0").style("pointer-events","none");

      const svg = IBV.svg(wrap.node(), w, h,
        "Esquema en tall d'un forn de llenya i una pizza en cocció: cúpula radiant, evaporació d'aigua a 100 graus, xarxa de gluten i CO₂, i conducció des del sòl refractari.");
      svg.style("position","relative").style("z-index","1");
      const tp = IBV.tip(container);

      const cx = w * 0.5;
      const floorY = h * 0.76;
      const floorH = h * 0.16;
      const domeR = Math.min(w * 0.43, h * 0.64);
      const pizzaW = Math.min(w * 0.62, domeR * 1.48);
      const px0 = cx - pizzaW / 2, px1 = cx + pizzaW / 2;

      // Capa 1: Cúpula del forn (arc fi + aura de radiació translúcida)
      const gDome = svg.append("g").attr("class","layer-dome");
      gDome.append("path")
        .attr("d", `M${cx - domeR},${floorY} A${domeR},${domeR * 0.92} 0 0,1 ${cx + domeR},${floorY}`)
        .attr("fill", C.vermell).attr("fill-opacity", 0.06)
        .attr("stroke", C.vermell).attr("stroke-width", 2.2).attr("stroke-opacity", 0.75);

      // Capa 2: Sòl refractari (maó / biscotto)
      const gFloor = svg.append("g").attr("class","layer-floor");
      gFloor.append("rect").attr("x", cx - domeR).attr("y", floorY).attr("width", domeR * 2).attr("height", floorH)
        .attr("fill", C.groc).attr("fill-opacity", 0.20).style("mix-blend-mode","multiply");
      gFloor.append("line").attr("x1", cx - domeR).attr("x2", cx + domeR).attr("y1", floorY).attr("y2", floorY)
        .attr("stroke", C.ink).attr("stroke-width", 1.2);

      // Capa 3: Massa de pizza amb cornicione lateral i centre fi
      const gDough = svg.append("g").attr("class","layer-dough");
      const rimH = mob ? 22 : 34;
      const midH = mob ? 8 : 11;
      const doughPath = `M${px0},${floorY}
        Q${px0 - 6},${floorY - rimH} ${px0 + pizzaW * 0.12},${floorY - rimH}
        Q${px0 + pizzaW * 0.22},${floorY - rimH} ${px0 + pizzaW * 0.24},${floorY - midH}
        L${px1 - pizzaW * 0.24},${floorY - midH}
        Q${px1 - pizzaW * 0.22},${floorY - rimH} ${px1 - pizzaW * 0.12},${floorY - rimH}
        Q${px1 + 6},${floorY - rimH} ${px1},${floorY} Z`;

      gDough.append("path").attr("class","dough-shape").attr("d", doughPath)
        .attr("fill", C.grocClar).attr("fill-opacity", 0.55)
        .attr("stroke", C.ink2).attr("stroke-width", 1.1);

      // Capa 4: Tomàquet + mozzarella al centre
      const gTop = svg.append("g").attr("class","layer-top");
      gTop.append("rect")
        .attr("x", px0 + pizzaW * 0.23).attr("y", floorY - midH - (mob ? 4 : 6))
        .attr("width", pizzaW * 0.54).attr("height", mob ? 4 : 6).attr("rx", 2)
        .attr("fill", C.vermell).attr("fill-opacity", 0.72);
      // Mozzarella (punts suaus)
      [0.32, 0.44, 0.56, 0.67].forEach(f => {
        gTop.append("ellipse")
          .attr("cx", px0 + pizzaW * f).attr("cy", floorY - midH - (mob ? 5.5 : 8))
          .attr("rx", mob ? 10 : 16).attr("ry", mob ? 2.8 : 4)
          .attr("fill", C.paper).attr("stroke", C.blau).attr("stroke-width", 0.9);
      });

      // Taques Maillard («pell de lleopard», només visibles al pas 4)
      const gMaillard = svg.append("g").attr("class","layer-maillard").style("opacity", 0);
      [0.06, 0.13, 0.87, 0.94].forEach((f, idx) => {
        gMaillard.append("circle")
          .attr("cx", px0 + pizzaW * f).attr("cy", floorY - rimH + (idx % 2 ? 6 : 3))
          .attr("r", mob ? 4.5 : 6.5)
          .attr("fill", C.vermellFosc).attr("fill-opacity", 0.55).style("mix-blend-mode","multiply");
      });

      // Anotacions per capa (clares i sense solapar-se)
      const gLbls = svg.append("g").style("pointer-events","none");
      const lDome = gLbls.append("g");
      IBV.t(lDome, cx, floorY - domeR * 0.92 + (mob ? 18 : 24), mob ? "Cúpula radiant (∝ T⁴)" : "Cúpula radiant · 430–485 °C (∝ T⁴)", {
        size: mob ? 11 : 12.5, weight: 700, anchor: "middle", fill: C.vermell, halo: 3
      });

      const lSteam = gLbls.append("g");
      IBV.t(lSteam, cx, floorY - midH - (mob ? 28 : 44), mob ? "Escut de vapor · ~100 °C" : "Vapor del tomàquet · ~100 °C (2.260 kJ/kg)", {
        size: mob ? 11 : 12, weight: 700, anchor: "middle", fill: C.blau, halo: 3
      });

      const lFloor = gLbls.append("g");
      IBV.t(lFloor, cx, floorY + floorH * 0.62, mob ? "Sòl refractari · interfície ~208 °C" : "Sòl de maó / biscotto · interfície amortida ~208–240 °C", {
        size: mob ? 11 : 12, weight: 700, anchor: "middle", fill: C.ink, halo: 3
      });

      const lCrust = gLbls.append("g");
      IBV.t(lCrust, clamp(px1 - pizzaW * 0.08, 60, w - 12), floorY - rimH - (mob ? 10 : 16), mob ? "Maillard >140 °C" : "Vora inflada · Maillard >140 °C", {
        size: mob ? 11 : 12, weight: 700, anchor: "end", fill: C.vermellFosc, halo: 3
      });

      // Partícules per a canvas (bombolles CO₂, flux conducció, radiació, vapor)
      const rand = IBV.rng(2026);
      const co2 = d3.range(mob ? 18 : 30).map(() => ({
        x: px0 + pizzaW * (0.04 + rand() * 0.92),
        y: floorY - 3 - rand() * (rimH * 0.68),
        r: 1.5 + rand() * (mob ? 2.4 : 3.4),
        p: rand() * Math.PI * 2
      }));
      const steam = d3.range(mob ? 14 : 24).map(() => ({
        x: px0 + pizzaW * (0.25 + rand() * 0.50),
        p: rand()
      }));
      const rays = d3.range(mob ? 12 : 20).map((_, i) => ({
        ang: Math.PI * (0.14 + (i / (mob ? 11 : 19)) * 0.72),
        p: rand()
      }));

      function updateStep(instant){
        const idx = STEPS[curStep].idx;
        const dur = instant || IBV.reduced ? 0 : 380;
        gDome.transition().duration(dur).style("opacity", idx >= 2 ? 1 : 0.35);
        gFloor.transition().duration(dur).style("opacity", idx >= 1 ? 1 : 0.45);
        gMaillard.transition().duration(dur).style("opacity", idx >= 3 ? 1 : 0);
        lDome.transition().duration(dur).style("opacity", idx >= 2 ? 1 : 0.2);
        lSteam.transition().duration(dur).style("opacity", idx >= 2 ? 1 : 0);
        lFloor.transition().duration(dur).style("opacity", idx >= 1 ? 1 : 0.25);
        lCrust.transition().duration(dur).style("opacity", idx >= 3 ? 1 : 0);
        if(tEl) tEl.textContent = STEPS[curStep].t;
        if(sEl) sEl.textContent = STEPS[curStep].s;
      }

      // Hover per zones físiques del tall
      const zones = [
        { y0: 0, y1: floorY - rimH - 22, nom: "Cúpula radiant", info: "La radiació tèrmica escala amb T⁴: a 485 °C és gairebé 5× més intensa que a 230 °C" },
        { y0: floorY - rimH - 22, y1: floorY - midH, nom: "Escut de vapor i vora", info: "L'evaporació de l'aigua (2.260 kJ/kg) frena el centre a 100 °C mentre la vora seca supera 140 °C" },
        { y0: floorY - midH, y1: floorY + 2, nom: "Xarxa de gluten i CO₂", info: "El vapor i el CO₂ dels llevats dilaten els alvèols de gluten en segons (oven spring)" },
        { y0: floorY + 2, y1: h, nom: "Sòl refractari", info: "Baixa efusivitat tèrmica: absorbeix el xoc sense carbonitzar la base (~208 °C en maó a 330 °C)" }
      ];
      IBV.hover(svg.node(), (ev, [mx, my]) => {
        const z = zones.find(zz => my >= zz.y0 && my <= zz.y1);
        if(z) tp.show(`<b>${z.nom}</b> · ${z.info}`);
      }, () => tp.hide());

      // Bucle lent i contemplatiu en canvas
      let simT = 0;
      loopCtl = IBV.loop(container, (t, dt) => {
        if(!paused) simT += dt;
        ctx.clearRect(0, 0, w, h);
        const idx = STEPS[curStep].idx;

        // 1. Bombolles CO₂ a la massa (sempre presents; creixen amb la calor)
        const expand = idx === 0 ? 1 : idx === 1 ? 1.15 : 1.38;
        co2.forEach(b => {
          const inCenter = b.x > px0 + pizzaW * 0.24 && b.x < px1 - pizzaW * 0.24;
          const by = inCenter ? floorY - 2 - (b.r * 1.4) : b.y;
          const pulse = 1 + 0.12 * Math.sin(simT * 0.0016 + b.p);
          ctx.beginPath();
          ctx.arc(b.x, by, b.r * expand * pulse, 0, Math.PI * 2);
          ctx.fillStyle = IBV.alpha(C.grocFosc, 0.36);
          ctx.fill();
        });

        // 2. Conducció des del sòl refractari (pas >= 1)
        if(idx >= 1){
          const nCols = mob ? 7 : 11;
          for(let i = 0; i < nCols; i++){
            const u = ((simT / 14000) + i * 0.13) % 1;
            const xx = px0 + pizzaW * (0.08 + (i / (nCols - 1)) * 0.84);
            const yy = floorY + floorH * (1 - u);
            ctx.beginPath();
            ctx.moveTo(xx, yy + 7);
            ctx.lineTo(xx, yy);
            ctx.strokeStyle = IBV.alpha(C.vermell, 0.45 * (1 - Math.abs(u - 0.5)));
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        }

        // 3. Radiació de la cúpula + vapor d'aigua (pas >= 2)
        if(idx >= 2){
          rays.forEach(r => {
            const u = ((simT / 22000) + r.p) % 1;
            const sx = cx - Math.cos(r.ang) * domeR;
            const sy = floorY - Math.sin(r.ang) * (domeR * 0.92);
            const ex = px0 + pizzaW * (0.1 + (r.ang / Math.PI) * 0.8);
            const ey = floorY - midH - 6;
            const qx = sx + (ex - sx) * u, qy = sy + (ey - sy) * u;
            ctx.beginPath();
            ctx.arc(qx, qy, 2.0, 0, Math.PI * 2);
            ctx.fillStyle = IBV.alpha(C.vermell, 0.48 * Math.sin(u * Math.PI));
            ctx.fill();
          });
          steam.forEach(st => {
            const u = ((simT / 20000) + st.p) % 1;
            const sx = st.x + Math.sin(u * 5 + st.p * 8) * 5;
            const sy = (floorY - midH - 8) - u * (domeR * 0.52);
            ctx.beginPath();
            ctx.arc(sx, sy, 2.2 + u * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = IBV.alpha(C.blau, 0.28 * (1 - u));
            ctx.fill();
          });
        }
      });

      state = { updateStep };
      updateStep(true);
    }

    IBV.mount(el, draw);
    const stepsEl = document.querySelector("#s-forn .steps");
    const graphicEl = document.querySelector("#s-forn .graphic");
    if(stepsEl && graphicEl && window.IB && IB.scrolly){
      IB.scrolly(stepsEl, graphicEl, (idx, stepEl) => {
        const k = stepEl && stepEl.dataset && stepEl.dataset.s;
        if(k && STEPS[k]){
          curStep = k;
          if(state) state.updateStep(false);
        }
      });
    }
  })();

  /* =========================================================================
     5. FIGURA 4 — SIMULADOR TERMODINÀMIC DEL FORN (VARLAMOV ET AL., 2018)
     ========================================================================= */
  (function initSimForn(){
    const el = document.getElementById("sim-viz");
    const lgEl = document.getElementById("sim-lg");
    const rng = document.getElementById("forn-rng");
    const rngVal = document.getElementById("forn-rng-val");
    const btns = document.querySelectorAll("#f-sim-forn .seg button");
    const rTint = document.getElementById("stat-tint");
    const rTintNote = document.getElementById("stat-tint-n");
    const rRad = document.getElementById("stat-rad");
    const rTime = document.getElementById("stat-time");
    const rTimeNote = document.getElementById("stat-time-n");
    if(!el || !rng) return;

    IBV.legendCat(lgEl, [
      { c: C.vermell, t: "Biscotto volcànic", kind: "line" },
      { c: C.grocFosc, t: "Maó refractari", kind: "line" },
      { c: C.blau, t: "Acer domèstic", kind: "line" }
    ]);

    let matKey = "mao";
    let ovenT = 330;
    const T_DOUGH = 20;

    function tInterface(T, nu){ return T_DOUGH + (T - T_DOUGH) / (1 + nu); }
    function radRatio(T){ return Math.pow((T + 273.15) / (230 + 273.15), 4); }
    function bakeEstimate(T, ti){
      if(ti >= 265) return { s: "Base cremada", n: "Carbonització ràpida abans que el centre es cogui" };
      if(ti < 175)  return { s: "> 6–9 min", n: "Massa lenta: es resseca abans de fer Maillard" };
      const secs = Math.round(clamp(120 * Math.pow((330 + 273.15) / (T + 273.15), 2.3), 65, 360));
      const fmtT = secs < 110 ? `${secs} segons` : `${(secs / 60).toFixed(1).replace(".", ",")} min`;
      if(ti >= 195 && ti <= 245) return { s: fmtT, n: "Finestra òptima de Maillard sense carbonitzar" };
      return { s: fmtT, n: ti > 245 ? "Límit alt: vigila la base" : "Cocció suau: poc daurat lateral" };
    }

    // Sincronització de custom properties del slider natiu (modern-web-guidance: slider)
    function syncSliderProps(){
      rng.style.setProperty("--attr-min", rng.min || 180);
      rng.style.setProperty("--attr-max", rng.max || 485);
      rng.style.setProperty("--control-value", rng.value);
      const m = D.forn_materials[matKey];
      const ti = Math.round(tInterface(ovenT, m.nu));
      rng.setAttribute("aria-valuetext", `${ovenT} graus Celsius sobre ${m.nom}, interfície de ${ti} graus`);
      if(rngVal) rngVal.textContent = `${ovenT} °C`;
      if(rTint) rTint.textContent = `${ti} °C`;
      if(rTintNote) rTintNote.textContent = ti >= 265 ? "Per sobre del llindar de carbonització" : (ti >= 195 ? "Dins la finestra Maillard (195–245 °C)" : "Per sota de la finestra òptima");
      if(rRad) rRad.textContent = `${F1(radRatio(ovenT))}×`;
      const est = bakeEstimate(ovenT, ti);
      if(rTime) rTime.textContent = est.s;
      if(rTimeNote) rTimeNote.textContent = est.n;
    }

    let updateMarker = null;

    function draw(container, w){
      container.innerHTML = "";
      const mob = w < 540;
      const h = mob ? 270 : 320;
      const M = { l: mob ? 42 : 52, r: mob ? 18 : 26, t: 24, b: 36 };
      const svg = IBV.svg(container, w, h,
        "Corbes de temperatura d'interfície entre la massa i el sòl del forn segons la temperatura del forn (180 a 485 °C) per a biscotto volcànic, maó refractari i acer domèstic.");
      const tp = IBV.tip(container);

      const x = d3.scaleLinear([180, 485], [M.l, w - M.r]);
      const y = d3.scaleLinear([100, 440], [h - M.b, M.t]);

      // Franja suau: Finestra òptima de Maillard (195–245 °C)
      svg.append("rect")
        .attr("x", M.l).attr("width", w - M.l - M.r)
        .attr("y", y(245)).attr("height", y(195) - y(245))
        .attr("fill", C.groc).attr("fill-opacity", 0.16);
      IBV.t(svg, w - M.r - 4, y(236) + 4, mob ? "Finestra Maillard (195–245 °C)" : "Finestra Maillard òptima (195–245 °C)", {
        size: 11, italic: true, anchor: "end", fill: C.ink2, halo: 3
      });

      // Llindar de carbonització (265 °C)
      IBV.rule(svg, M.l, w - M.r, y(265), { stroke: C.vermell });
      IBV.t(svg, w - M.r - 4, y(265) - 6, mob ? "Carbonització (>265 °C)" : "Carbonització de la base (>265 °C)", {
        size: 11, italic: true, anchor: "end", fill: C.vermell, halo: 3
      });

      IBV.gridY(svg, y, M.l, w - M.r, [150, 200, 250, 300, 350, 400], v => F0(v), { unit: " °C (interfície)" });
      IBV.axisX(svg, x, h - M.b, mob ? [200, 300, 400, 485] : [180, 230, 280, 330, 380, 430, 485], v => v + " °C");

      const Ts = d3.range(180, 486, 5);
      const lineGen = nu => d3.line().x(t => x(t)).y(t => y(tInterface(t, nu)))(Ts);
      const matOrder = ["acer", "mao", "biscotto"];

      const paths = {};
      matOrder.forEach(k => {
        const m = D.forn_materials[k];
        const strokeC = k === "mao" ? C.grocFosc : COL[m.color];
        paths[k] = svg.append("path").attr("d", lineGen(m.nu))
          .attr("fill","none").attr("stroke", strokeC)
          .attr("stroke-width", k === matKey ? 2.8 : 1.3)
          .attr("stroke-opacity", k === matKey ? 1 : 0.45);
      });

      // 3 punts de referència reals del paper Varlamov et al. (2018)
      const anchors = [
        { k: "mao", T: 330, ti: 208, lbl: "Maó 330 °C → 208 °C", tx: 365, ty: 174 },
        { k: "acer", T: 330, ti: 300, lbl: "Acer 330 °C → 300 °C (crema)", tx: 342, ty: 332 },
        { k: "acer", T: 230, ti: 209, lbl: "Acer 230 °C → 209 °C", tx: 224, ty: 162 }
      ];
      anchors.forEach(a => {
        svg.append("circle").attr("cx", x(a.T)).attr("cy", y(a.ti)).attr("r", 3.2)
          .attr("fill", C.paper).attr("stroke", C.ink).attr("stroke-width", 1.2);
        if(!mob || a.k === "mao"){
          IBV.note(svg, {
            x: x(a.T), y: y(a.ti), tx: clamp(x(a.tx), M.l + 50, w - M.r - 40), ty: y(a.ty),
            lines: [[a.lbl, true]], kind: "straight", anchor: a.T > 300 ? "start" : "middle", size: 11
          });
        }
      });

      // Guia i marcador actiu del lliscant
      const gCur = svg.append("g").style("pointer-events","none");
      const vLine = gCur.append("line").attr("y1", M.t).attr("y2", h - M.b).attr("stroke", C.ink).attr("stroke-width", 0.8).attr("stroke-dasharray", "2 3");
      const hLine = gCur.append("line").attr("x1", M.l).attr("stroke", C.ink).attr("stroke-width", 0.8).attr("stroke-dasharray", "2 3");
      const haloDot = gCur.append("circle").attr("r", 12).attr("fill-opacity", 0.28).style("mix-blend-mode","multiply");
      const dot = gCur.append("circle").attr("r", 5).attr("stroke", C.paper).attr("stroke-width", 1.5);

      updateMarker = () => {
        const m = D.forn_materials[matKey];
        const ti = tInterface(ovenT, m.nu);
        const col = matKey === "mao" ? C.grocFosc : COL[m.color];
        matOrder.forEach(k => {
          paths[k].transition().duration(180)
            .attr("stroke-width", k === matKey ? 2.8 : 1.3)
            .attr("stroke-opacity", k === matKey ? 1 : 0.42);
        });
        vLine.attr("x1", x(ovenT)).attr("x2", x(ovenT));
        hLine.attr("x2", x(ovenT)).attr("y1", y(ti)).attr("y2", y(ti));
        haloDot.attr("cx", x(ovenT)).attr("cy", y(ti)).attr("fill", col);
        dot.attr("cx", x(ovenT)).attr("cy", y(ti)).attr("fill", col);
        syncSliderProps();
      };
      updateMarker();

      // Hover interactiu per explorar qualsevol punt
      IBV.hover(svg.node(), (ev, [mx]) => {
        const T = Math.round(clamp(x.invert(mx), 180, 485));
        const tiB = Math.round(tInterface(T, D.forn_materials.biscotto.nu));
        const tiM = Math.round(tInterface(T, D.forn_materials.mao.nu));
        const tiA = Math.round(tInterface(T, D.forn_materials.acer.nu));
        tp.show(`<b>Forn a ${T} °C</b> · Biscotto ${tiB} °C · Maó ${tiM} °C · Acer ${tiA} °C`);
      }, () => tp.hide());
    }

    IBV.mount(el, draw);
    rng.addEventListener("input", () => {
      ovenT = +rng.value;
      if(updateMarker) updateMarker();
    });
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      matKey = b.dataset.k;
      ovenT = D.forn_materials[matKey].refT;
      rng.value = ovenT;
      if(updateMarker) updateMarker();
    }));
    syncSliderProps();
  })();

  /* =========================================================================
     6. FIGURA 5 — DIÀSPORA ITALIANA (1876–1915) I GLOCALITZACIÓ (IB-24 + IB-25)
     ========================================================================= */
  (function initDiaspora(){
    const el = document.getElementById("diaspora-viz");
    const lgEl = document.getElementById("diaspora-lg");
    const btns = document.querySelectorAll("#f-diaspora .seg button");
    if(!el) return;

    let mode = "emigracio";
    let worldData = null;

    function renderLegend(){
      lgEl.innerHTML = "";
      if(mode === "emigracio"){
        IBV.legendCat(lgEl, [
          { c: C.vermell, t: "Migració transatlàntica (1876–1915)" },
          { c: C.blau, t: "Migració europea" },
          { c: C.ink, t: "Retorn cultural («efecte pizza»)", kind: "line", dash: "4 3" }
        ]);
      } else {
        IBV.legendCat(lgEl, [
          { c: C.vermell, t: "Bressol napolità" },
          { c: C.blau, t: "Diàspora americana" },
          { c: C.groc, t: "Reinvenció glocal" }
        ]);
      }
    }

    function drawEmigracio(container, w){
      const mob = w < 560;
      const tp = IBV.tip(container);
      const mapH = mob ? 225 : Math.round(clamp(w * 0.47, 340, 415));
      const railH = mob ? (D.diaspora.length * 34 + 26) : 0;
      const h = mapH + railH;

      const svg = IBV.svg(container, w, h,
        "Mapa dels fluxos reals d'emigració italiana 1876–1915 (ISTAT/Rosoli: 4,16 milions als EUA, 1,80 a Argentina, 1,72 a França, 1,34 a Suïssa, 1,23 a Alemanya i 1,23 al Brasil) i el retorn cultural de l'efecte pizza.");

      const proj = d3.geoEqualEarth()
        .rotate([22, 0])
        .fitExtent([[mob ? 4 : 12, 8], [w - (mob ? 4 : 12), mapH - 8]], {
          type: "MultiPoint",
          coordinates: [[-95, 52], [35, 55], [-70, -42], [25, -40]]
        });
      const path = d3.geoPath(proj);

      svg.append("path").datum(d3.geoGraticule().step([30, 30])()).attr("d", path).attr("fill","none").attr("stroke", C.grid).attr("stroke-width", 0.45);
      if(worldData){
        svg.append("path").datum(worldData.land).attr("d", path).attr("fill", C.land);
        svg.append("path").datum(worldData.borders).attr("d", path).attr("fill","none").attr("stroke", C.paper).attr("stroke-width", 0.5);
      }

      const itXY = proj(D.napoli);
      const rSc = d3.scaleSqrt([0, 4.16], [4, mob ? 18 : 28]);
      const swSc = d3.scaleLinear([1.2, 4.16], [1.4, 4.2]);
      const lineGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveCatmullRom.alpha(0.5));

      const items = D.diaspora.map(d => ({
        d,
        xy: proj([d.lon, d.lat]),
        pts: greatCircleLine(D.napoli, [d.lon, d.lat], 36).coordinates.map(pt => proj(pt)).filter(Boolean)
      }));

      const gFlows = svg.append("g");
      const flowSel = gFlows.selectAll("g.fl").data(items).join("g").attr("class","fl hit");
      flowSel.each(function(it){
        const g = d3.select(this);
        const col = it.d.via === "america" ? C.vermell : C.blau;
        g.append("path").attr("d", lineGen(it.pts)).attr("fill","none")
          .attr("stroke", col).attr("stroke-width", swSc(it.d.sortides)).attr("stroke-opacity", 0.58);
        g.append("circle").attr("class","bub").attr("cx", it.xy[0]).attr("cy", it.xy[1]).attr("r", 0)
          .attr("fill", col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("class","core").attr("cx", it.xy[0]).attr("cy", it.xy[1]).attr("r", 3)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.8);

        if(!mob){
          const off = it.d.pais === "Estats Units" ? [-12, -26]
            : it.d.pais === "Argentina" ? [-10, 28]
            : it.d.pais === "Brasil" ? [22, 6]
            : it.d.pais === "França" ? [-24, 6]
            : it.d.pais === "Suïssa" ? [-14, -22]
            : [18, -16];
          const anc = off[0] < 0 ? "end" : "start";
          IBV.t(g, clamp(it.xy[0] + off[0], 54, w - 54), clamp(it.xy[1] + off[1], 14, mapH - 12),
            `${it.d.pais} · ${F1(it.d.sortides)} M`, { size: 11.5, weight: 700, anchor: anc, fill: col, halo: 3 });
        }
      });

      // Arc de retorn cultural: «Efecte pizza» (Nova York -> Nord d'Itàlia, post-1945)
      const nyXY = proj([-74.0, 40.7]);
      const milanXY = proj([9.19, 45.46]);
      const midX = (nyXY[0] + milanXY[0]) / 2;
      const midY = Math.min(nyXY[1], milanXY[1]) - (mob ? 38 : 66);
      svg.append("path")
        .attr("d", `M${nyXY[0]},${nyXY[1]} Q${midX},${midY} ${milanXY[0]},${milanXY[1]}`)
        .attr("fill","none").attr("stroke", C.ink).attr("stroke-width", 1.5).attr("stroke-dasharray", "5 4");
      IBV.t(svg, midX, clamp(midY + (mob ? 12 : 16), 14, mapH - 12), mob ? "«Efecte pizza» (retorn post-1945) →" : "«Efecte pizza»: retorn prestigiat cap al nord d'Itàlia (post-1945) →", {
        size: mob ? 11 : 12, weight: 700, anchor: "middle", fill: C.ink, halo: 3
      });

      // Punt d'origen Itàlia
      svg.append("circle").attr("cx", itXY[0]).attr("cy", itXY[1]).attr("r", 4).attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1.2);

      // En mòbil: rànquing compacte sota el mapa perquè les 6 xifres es llegeixin nítides
      let railRows = null;
      if(mob){
        const gR = svg.append("g").attr("transform", `translate(0, ${mapH + 10})`);
        const xBar = d3.scaleLinear([0, 4.3], [0, w - 12]);
        railRows = gR.selectAll("g.rr").data(D.diaspora).join("g").attr("class","rr hit")
          .attr("transform", (d, i) => `translate(0, ${i * 34})`);
        railRows.each(function(d){
          const g = d3.select(this);
          const col = d.via === "america" ? C.vermell : C.blau;
          IBV.t(g, 0, 12, `${d.pais}`, { size: 12, weight: 700, fill: C.ink });
          IBV.t(g, w, 12, `${F1(d.sortides)} M (${F0(d.pct)} %)`, { size: 11.5, weight: 600, anchor: "end", fill: col });
          g.append("line").attr("x1", 0).attr("x2", w).attr("y1", 22).attr("y2", 22).attr("stroke", C.grid).attr("stroke-width", 0.7);
          g.append("line").attr("x1", 0).attr("x2", xBar(d.sortides)).attr("y1", 22).attr("y2", 22).attr("stroke", col).attr("stroke-width", 2.2);
          g.append("circle").attr("cx", xBar(d.sortides)).attr("cy", 22).attr("r", 4.5).attr("fill", col).attr("fill-opacity", 0.35);
        });
      }

      IBV.onView(container, instant => {
        flowSel.selectAll("circle.bub").transition().duration(instant ? 0 : 850).ease(IBV.EASE).attr("r", it => rSc(it.d.sortides));
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(mob && my > mapH){
          const i = clamp(Math.floor((my - mapH - 10) / 34), 0, D.diaspora.length - 1);
          const d = D.diaspora[i];
          IBV.focus(flowSel, it => it.d === d, { dim: 0.48 });
          if(railRows) IBV.focus(railRows, x => x === d, { dim: 0.48 });
          tp.show(`<b>${d.pais} · ${F1(d.sortides)} M (${d.pct} %)</b> · ${d.mutacio}`);
          return;
        }
        const best = d3.least(items, it => Math.hypot(it.xy[0] - mx, it.xy[1] - my));
        if(best && Math.hypot(best.xy[0] - mx, best.xy[1] - my) < 72){
          IBV.focus(flowSel, it => it === best, { dim: 0.48 });
          if(railRows) IBV.focus(railRows, x => x === best.d, { dim: 0.48 });
          tp.show(`<b>${best.d.pais} · ${F1(best.d.sortides)} M (${best.d.pct} %)</b> · ${best.d.mutacio}`);
        } else {
          IBV.focus(flowSel, null);
          if(railRows) IBV.focus(railRows, null);
          tp.hide();
        }
      }, () => {
        IBV.focus(flowSel, null);
        if(railRows) IBV.focus(railRows, null);
        tp.hide();
      });
    }

    function drawGlocal(container, w){
      const mob = w < 560;
      const colOf = c => c === "origen" ? C.vermell : c === "diaspora" ? C.blau : C.groc;
      const tp = IBV.tip(container);

      if(mob){
        const rowH = 58, padT = 8, h = padT + D.glocal.length * rowH + 6;
        const svg = IBV.svg(container, w, h, "Vuit mutacions locals de la pizza al món: Nàpols, Nova York, Chicago, Buenos Aires, São Paulo, Tòquio, Estocolm i Nova Delhi.");
        const rows = svg.selectAll("g.gl-r").data(D.glocal).join("g").attr("class","gl-r hit")
          .attr("transform", (d, i) => `translate(0, ${padT + i * rowH})`);
        rows.append("line").attr("x1", 0).attr("x2", w).attr("y1", rowH - 2).attr("y2", rowH - 2).attr("stroke", C.grid).attr("stroke-width", 0.6);
        rows.append("circle").attr("cx", 14).attr("cy", 22).attr("r", 10).attr("fill", d => colOf(d.cat)).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        rows.append("circle").attr("cx", 14).attr("cy", 22).attr("r", 3).attr("fill", d => colOf(d.cat));
        rows.each(function(d){
          const g = d3.select(this);
          const sub = d.base.length > 52 ? d.base.slice(0, 50) + "…" : d.base;
          IBV.t(g, 32, 18, `${d.ciutat} (${d.pais}) · ${d.forn}`, { size: 12, weight: 700, fill: C.ink });
          IBV.t(g, 32, 35, sub, { size: 11.5, fill: C.ink2 });
        });
        IBV.hover(svg.node(), (ev, [mx, my]) => {
          const i = clamp(Math.floor((my - padT) / rowH), 0, D.glocal.length - 1);
          const d = D.glocal[i];
          IBV.focus(rows, x => x === d, { dim: 0.48 });
          tp.show(`<b>${d.ciutat}</b> · ${d.ritual}`);
        }, () => { IBV.focus(rows, null); tp.hide(); });
        return;
      }

      const h = Math.round(clamp(w * 0.47, 340, 415));
      const svg = IBV.svg(container, w, h, "Mapa mundial de vuit ciutats on la pizza s'ha reinventat segons l'ecologia i els rituals locals.");
      const proj = d3.geoEqualEarth().rotate([-10, 0]).fitExtent([[12, 12], [w - 12, h - 12]], { type: "Sphere" });
      const path = d3.geoPath(proj);

      svg.append("path").datum(d3.geoGraticule().step([30, 30])()).attr("d", path).attr("fill","none").attr("stroke", C.grid).attr("stroke-width", 0.45);
      if(worldData){
        svg.append("path").datum(worldData.land).attr("d", path).attr("fill", C.land);
        svg.append("path").datum(worldData.borders).attr("d", path).attr("fill","none").attr("stroke", C.paper).attr("stroke-width", 0.5);
      }

      const offs = {
        "Nàpols": [14, 14], "Nova York": [14, 12], "Chicago": [-14, -14],
        "Buenos Aires": [-14, 14], "São Paulo": [14, 4], "Tòquio": [-14, -14],
        "Estocolm": [14, -14], "Nova Delhi": [14, -12]
      };
      const pts = D.glocal.map(d => Object.assign({}, d, { xy: proj([d.lon, d.lat]) }));
      const nodes = svg.selectAll("g.gl-n").data(pts).join("g").attr("class","gl-n hit");
      nodes.each(function(d){
        const g = d3.select(this);
        const col = colOf(d.cat);
        g.append("circle").attr("cx", d.xy[0]).attr("cy", d.xy[1]).attr("r", 10 + d.gruix * 2.5)
          .attr("fill", col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("class","core").attr("cx", d.xy[0]).attr("cy", d.xy[1]).attr("r", 3.2)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.9);
        const [ox, oy] = offs[d.ciutat] || [12, -10];
        IBV.t(g, clamp(d.xy[0] + ox, 54, w - 54), clamp(d.xy[1] + oy, 14, h - 10), d.ciutat, {
          size: 12, weight: 700, anchor: ox < 0 ? "end" : "start", fill: col === C.groc ? C.ink : col, halo: 3
        });
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        const best = d3.least(pts, d => Math.hypot(d.xy[0] - mx, d.xy[1] - my));
        if(best && Math.hypot(best.xy[0] - mx, best.xy[1] - my) < 70){
          IBV.focus(nodes, d => d === best, { dim: 0.48 });
          nodes.selectAll("circle.core").attr("r", d => d === best ? 4.8 : 3.2).attr("stroke", d => d === best ? C.ink : C.paper);
          tp.show(`<b>${best.ciutat} (${best.forn})</b> · ${best.base} — ${best.ritual}`);
        } else {
          IBV.focus(nodes, null);
          nodes.selectAll("circle.core").attr("r", 3.2).attr("stroke", C.paper);
          tp.hide();
        }
      }, () => {
        IBV.focus(nodes, null);
        nodes.selectAll("circle.core").attr("r", 3.2).attr("stroke", C.paper);
        tp.hide();
      });
    }

    function draw(container, w){
      container.innerHTML = "";
      renderLegend();
      if(worldData){
        if(mode === "emigracio") drawEmigracio(container, w);
        else drawGlocal(container, w);
      } else {
        IBV.world().then(wd => {
          worldData = wd;
          if(mode === "emigracio") drawEmigracio(container, w);
          else drawGlocal(container, w);
        });
      }
    }

    const m = IBV.mount(el, draw);
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      mode = b.dataset.k;
      m.redraw();
    }));
  })();
})();
