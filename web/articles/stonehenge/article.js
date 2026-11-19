/* «Per què van aixecar Stonehenge?»: 6 visualitzacions del sistema infogràfic (IBV + d3 7.9.0).
   Paleta estricta: vermell #C8442A, blau #2C5DA8, groc #F5C518, grisos i terra #ECEBE8.
   Mai text en groc; mai fons pintats; mai anells diana; hover suau IBV.focus (0,48) + IBV.tip dock. */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES;
  const C = IBV.C;
  const F0 = IBV.fmt(",.0f");
  const F1 = IBV.fmt(",.1f");
  const F2 = IBV.fmt(",.2f");

  const COL = { vermell: C.vermell, blau: C.blau, groc: C.groc, gris: C.ink2 };
  const TEXT_COL = { vermell: C.vermell, blau: C.blau, groc: C.ink, gris: C.ink2 }; // mai text en groc

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  function greatCircleLine(a, b, n){
    const interp = d3.geoInterpolate(a, b);
    const pts = [];
    const steps = n || 44;
    for(let i = 0; i <= steps; i++) pts.push(interp(i / steps));
    return pts;
  }

  /* Atles 50m per a Gran Bretanya i Irlanda (amb fallback automàtic a 110m si falla) */
  let ukWorldP = null;
  function ukWorld(){
    if(!ukWorldP){
      ukWorldP = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json")
        .then(r => { if(!r.ok) throw new Error("50m fetch"); return r.json(); })
        .then(tp => ({
          land: topojson.feature(tp, tp.objects.land),
          borders: topojson.mesh(tp, tp.objects.countries, (a, b) => a !== b)
        }))
        .catch(() => IBV.world());
    }
    return ukWorldP;
  }

  /* =========================================================================
     1. SCROLLY 1 — MAPA D'UNA ILLA MOBILITZADA (IB-24 + IB-25)
     ========================================================================= */
  (function initPedres(){
    const el = document.getElementById("pedres-viz");
    const lgEl = document.getElementById("pedres-lg");
    const playBtn = document.getElementById("pedres-play");
    const tEl = document.getElementById("pedres-t");
    const sEl = document.getElementById("pedres-s");
    if(!el) return;

    IBV.legendCat(lgEl, [
      { c: C.groc, t: "Sarsens i connexió nord" },
      { c: C.blau, t: "Gal·les (pedres i cremats)" },
      { c: C.vermell, t: "Pedra de l'Altar i banquets" }
    ]);

    const STEPS = {
      sarsen: { idx: 0, t: "Pas 1 · Els gegants de West Woods (~25 km)", s: "50 dels 52 sarsens venen del mateix bosc de Wiltshire (Nash et al., 2020)" },
      gales:  { idx: 1, t: "Pas 2 · Les pedres blaves de Gal·les (~230 km)", s: "~80 blocs dels turons Preseli (Carn Goedog, Craig Rhos-y-felin i possible cercle Waun Mawn)" },
      altar:  { idx: 2, t: "Pas 3 · La Pedra de l'Altar (≥750 km)", s: "Zircons laurèntians apunten al NE d'Escòcia (Clarke 2024); aflorament exacte obert (Pirrie 2026)" },
      feast:  { idx: 3, t: "Pas 4 · Persones cremades i ramats en camí", s: "40 % dels cremats són forans (Snoeck 2018) i 131 porcs venen d'arreu de l'illa (Madgwick 2019)" },
      illa:   { idx: 4, t: "Un mapa de pedra de tota Gran Bretanya", s: "L'únic entre ~900 cercles britànics fet íntegrament amb pedres portades de lluny" }
    };

    let curStep = "sarsen";
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
      const mob = w < 600;
      const h = mob
        ? Math.round(clamp(window.innerHeight * 0.25, 195, 224))
        : Math.round(clamp(w * 0.62, 360, 445));
      container.innerHTML = "";

      const wrap = d3.select(container).append("div")
        .style("position","relative").style("width", w + "px").style("height", h + "px").style("overflow","hidden");
      const { c: cv, ctx } = IBV.canvas(wrap.node(), w, h, "");
      d3.select(cv).attr("aria-hidden","true").style("position","absolute")
        .style("left","0").style("top","0").style("pointer-events","none");

      const svg = IBV.svg(wrap.node(), w, h,
        "Mapa de Gran Bretanya i Irlanda amb les rutes de les pedres i persones cap a Stonehenge: West Woods (25 km), Gal·les (230 km) i nord-est d'Escòcia (750 km o més).");
      svg.style("position","relative").style("z-index","1").style("overflow","hidden");

      const clipId = "clip-pedres-" + Math.random().toString(36).slice(2, 7);
      svg.append("defs").append("clipPath").attr("id", clipId)
        .append("rect").attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);

      const tp = IBV.tip(container);

      const bbox = {
        type: "MultiPoint",
        coordinates: [[-7.2, 49.8], [1.9, 59.4], [-8.8, 55.2], [1.2, 51.0]]
      };
      const proj = d3.geoTransverseMercator()
        .rotate([2, -54.5])
        .fitExtent([[mob ? 12 : 18, mob ? 8 : 12], [w - (mob ? 12 : 18), h - (mob ? 8 : 12)]], bbox);
      const path = d3.geoPath(proj);

      const gMap = svg.append("g").attr("clip-path", `url(#${clipId})`);
      gMap.append("path").datum(d3.geoGraticule().step([4, 4])())
        .attr("d", path).attr("fill","none").attr("stroke", C.grid).attr("stroke-width", 0.45);
      if(worldData){
        gMap.append("path").datum(worldData.land).attr("d", path).attr("fill", C.land);
        gMap.append("path").datum(worldData.borders).attr("d", path).attr("fill","none").attr("stroke", C.paper).attr("stroke-width", 0.65);
      }

      const shCoord = [D.stonehenge.lon, D.stonehenge.lat];
      const shXY = proj(shCoord);

      const routes = D["orígens"].map((d, idx) => {
        const arc = greatCircleLine([d.lon, d.lat], shCoord, 36).map(pt => proj(pt)).filter(Boolean);
        return { d, idx, pts: arc, xy: proj([d.lon, d.lat]) };
      });

      const gArcs = svg.append("g");
      const gNodes = svg.append("g");
      const gAnn = svg.append("g").style("pointer-events","none");

      const lineGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveCatmullRom.alpha(0.5));
      const arcSel = gArcs.selectAll("g.ar").data(routes).join("g").attr("class","ar");
      arcSel.each(function(r){
        d3.select(this).append("path")
          .attr("d", lineGen(r.pts))
          .attr("fill","none")
          .attr("stroke", COL[r.d.cat])
          .attr("stroke-width", r.d.id === "altar" ? 2.1 : 1.5)
          .attr("stroke-opacity", 0.72)
          .attr("stroke-dasharray", (r.d.id === "porcs" || r.d.id === "cremats") ? "4 3" : null);
      });

      /* Cercles plens translúcids multiply + punt central (MAI anells diana) */
      const nodeSel = gNodes.selectAll("g.nd").data(routes).join("g").attr("class","nd");
      nodeSel.each(function(r){
        const g = d3.select(this);
        const col = COL[r.d.cat];
        g.append("circle").attr("class","aura")
          .attr("cx", r.xy[0]).attr("cy", r.xy[1])
          .attr("r", mob ? r.d.r * 0.65 : r.d.r)
          .attr("fill", col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("class","core")
          .attr("cx", r.xy[0]).attr("cy", r.xy[1]).attr("r", 2.8)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.9);
      });

      /* Node destí: Stonehenge */
      const gSh = svg.append("g");
      gSh.append("circle").attr("cx", shXY[0]).attr("cy", shXY[1]).attr("r", mob ? 10 : 14)
        .attr("fill", C.vermell).attr("fill-opacity", 0.24).style("mix-blend-mode","multiply");
      gSh.append("circle").attr("cx", shXY[0]).attr("cy", shXY[1]).attr("r", 3.6)
        .attr("fill", C.ink).attr("stroke", C.paper).attr("stroke-width", 1.2);

      const offsets = {
        sarsen:     mob ? [10, -10] : [14, -14],
        bluestones: mob ? [-10, -8] : [-12, -12],
        altar:      mob ? [10, 8]   : [14, 6],
        cremats:    mob ? [-10, 14] : [-12, 16],
        porcs:      mob ? [10, 0]   : [14, 0],
        orkney:     mob ? [10, -6]  : [14, -10]
      };

      const annSel = gAnn.selectAll("g.an").data(routes).join("g").attr("class","an");
      annSel.each(function(r){
        const g = d3.select(this);
        const off = offsets[r.d.id] || [10, -8];
        const anc = (r.d.id === "bluestones" || r.d.id === "cremats") ? "end" : "start";
        let lx = r.xy[0] + off[0];
        lx = anc === "end" ? clamp(lx, 108, w - 8) : clamp(lx, 8, w - 122);
        const ly = clamp(r.xy[1] + off[1], 14, h - 12);
        IBV.t(g, lx, ly, mob ? r.d.curt : r.d.nom, {
          size: mob ? 11 : 12, weight: 700, anchor: anc, fill: TEXT_COL[r.d.cat], halo: 3
        });
        if(!mob){
          IBV.t(g, lx, ly + 13, r.d.origen, { size: 11, fill: C.ink2, anchor: anc, halo: 3 });
        }
      });

      const shLbl = gAnn.append("g");
      IBV.t(shLbl, clamp(shXY[0] + 12, 8, w - 78), clamp(shXY[1] + 15, 16, h - 8), "Stonehenge", {
        size: mob ? 11.5 : 13, weight: 700, anchor: "start", fill: C.ink, halo: 3.5
      });

      /* Partícules lentes i contemplatives (~26–30 segons per recorregut) */
      const particles = [];
      routes.forEach((r, ri) => {
        const count = mob ? 3 : 4;
        for(let i = 0; i < count; i++){
          particles.push({ r, phase: (i / count + ri * 0.19) % 1, speed: 1 / (25000 + (ri % 3) * 3000) });
        }
      });

      function activeLimit(){ return STEPS[curStep].idx; }

      function updateVisibility(instant){
        const lim = activeLimit();
        const dur = instant || IBV.reduced ? 0 : 420;
        arcSel.transition().duration(dur)
          .style("opacity", r => r.d.pas <= lim ? (r.d.pas === lim || lim === 4 ? 1 : 0.44) : 0.05);
        nodeSel.transition().duration(dur)
          .style("opacity", r => r.d.pas <= lim ? (r.d.pas === lim || lim === 4 ? 1 : 0.48) : 0.08);
        annSel.transition().duration(dur)
          .style("opacity", r => {
            if(mob) return (r.d.pas === lim || (lim === 4 && (r.d.id === "altar" || r.d.id === "bluestones" || r.d.id === "sarsen"))) ? 1 : 0;
            return r.d.pas <= lim ? (r.d.pas === lim || lim === 4 ? 1 : 0.40) : 0;
          });
        if(tEl) tEl.textContent = STEPS[curStep].t;
        if(sEl) sEl.textContent = STEPS[curStep].s;
      }

      let hoveredId = null;
      function setHover(r){
        if(!svg.node().isConnected) return;
        hoveredId = r ? r.d.id : null;
        if(!r){
          updateVisibility(true);
          tp.hide();
          return;
        }
        IBV.focus(arcSel, x => x.d.id === r.d.id, { dim: 0.48 });
        IBV.focus(nodeSel, x => x.d.id === r.d.id, { dim: 0.48 });
        nodeSel.selectAll("circle.core")
          .attr("r", function(){ const d = d3.select(this.parentNode).datum(); return d.d.id === r.d.id ? 4.4 : 2.8; })
          .attr("stroke", function(){ const d = d3.select(this.parentNode).datum(); return d.d.id === r.d.id ? C.ink : C.paper; });
        tp.show(`<b>${r.d.nom}</b> (${r.d.dist} km) · ${r.d.pes} · ${r.d.detall}`);
      }

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        const lim = activeLimit();
        const visible = routes.filter(r => r.d.pas <= lim);
        const best = d3.least(visible, r => Math.hypot(r.xy[0] - mx, r.xy[1] - my));
        if(best && Math.hypot(best.xy[0] - mx, best.xy[1] - my) < (mob ? 44 : 68)){
          setHover(best);
        } else if(hoveredId){
          setHover(null);
        }
      }, () => setHover(null));

      let simT = 0;
      loopCtl = IBV.loop(container, (t, dt) => {
        if(!paused) simT += dt;
        ctx.clearRect(0, 0, w, h);
        const lim = activeLimit();
        particles.forEach(p => {
          if(p.r.d.pas > lim) return;
          if(hoveredId && p.r.d.id !== hoveredId) return;
          const seg = p.r.pts;
          if(seg.length < 2) return;
          const u = (p.phase + simT * p.speed) % 1;
          const f = u * (seg.length - 1);
          const i0 = Math.floor(f), i1 = Math.min(seg.length - 1, i0 + 1), frac = f - i0;
          const px = seg[i0][0] + (seg[i1][0] - seg[i0][0]) * frac;
          const py = seg[i0][1] + (seg[i1][1] - seg[i0][1]) * frac;
          const prevI = Math.max(0, i0 - 2);
          ctx.beginPath();
          ctx.moveTo(seg[prevI][0], seg[prevI][1]);
          ctx.lineTo(px, py);
          ctx.strokeStyle = IBV.alpha(COL[p.r.d.cat], 0.58);
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

    IBV.mount(el, (container, w) => {
      if(worldData){ buildAndDraw(container, w); }
      else { ukWorld().then(wd => { worldData = wd; buildAndDraw(container, w); }); }
    });

    const stepsEl = document.querySelector("#s-pedres .steps");
    const graphicEl = document.querySelector("#s-pedres .graphic");
    if(stepsEl && graphicEl && window.IB && IB.scrolly){
      IB.scrolly(stepsEl, graphicEl, (idx, stepEl) => {
        const k = stepEl && stepEl.dataset && stepEl.dataset.s;
        if(k && STEPS[k]){
          curStep = k;
          if(state) state.updateVisibility(false);
        }
      });
    }
  })();

  /* =========================================================================
     2. SCROLLY 2 — CINC MONUMENTS EN UN SOL LLOC (PLANTA MORPH + RADIOCARBONI)
     ========================================================================= */
  (function initFases(){
    const el = document.getElementById("fases-viz");
    const lgEl = document.getElementById("fases-lg");
    const tEl = document.getElementById("fases-t");
    const sEl = document.getElementById("fases-s");
    if(!el) return;

    IBV.legendCat(lgEl, [
      { c: C.ink2, t: "Fossat, talús i Avinguda" },
      { c: C.vermell, t: "Sarsens i trílits (~25 t)" },
      { c: C.blau, t: "Pedres blaves i forats Aubrey (~3 t)" },
      { c: C.groc, t: "Altar i forats Y/Z" }
    ]);

    let curIdx = 0;
    let state = null;

    function polarStoneXY(deg, r){
      const a = deg * Math.PI / 180;
      return [Math.sin(a) * r, -Math.cos(a) * r];
    }

    function draw(container, w){
      container.innerHTML = "";
      const mob = w < 600;
      const h = mob
        ? Math.round(clamp(window.innerHeight * 0.27, 200, 238))
        : Math.round(clamp(w * 0.65, 380, 465));

      const svg = IBV.svg(container, w, h,
        "Planta arquitectònica evolutiva de Stonehenge a escala real en cinc fases bayesianes (3100–1450 aC): fossat circular, 56 forats Aubrey, cercle i ferradura de sarsens amb llindes, Avinguda, pedres blaves i forats Y/Z.");
      const tp = IBV.tip(container);

      const tlH = mob ? 48 : 74;
      const planH = h - tlH;
      const cx = mob ? w * 0.46 : w * 0.44;
      const cy = planH * 0.52;
      const scaleM = Math.min((planH * 0.42) / 58, (w * 0.36) / 58);

      const gPlan = svg.append("g").attr("transform", `translate(${cx},${cy})`);

      /* Guia solsticial molt tènue */
      const axP1 = polarStoneXY(50, 74 * scaleM);
      const axP2 = polarStoneXY(230, 62 * scaleM);
      gPlan.append("line").attr("x1", axP2[0]).attr("y1", axP2[1]).attr("x2", axP1[0]).attr("y2", axP1[1])
        .attr("stroke", C.hair).attr("stroke-width", 0.9).attr("stroke-dasharray", "3 3");

      /* 1. Fossat circular (R = 55 m) amb obertura al NE (~44° a 57°) */
      const gFossat = gPlan.append("g").attr("class","st-part").attr("data-part","fossat");
      const arcDitch = d3.arc()
        .innerRadius(53 * scaleM).outerRadius(56 * scaleM)
        .startAngle(57 * Math.PI / 180).endAngle((360 + 43) * Math.PI / 180);
      gFossat.append("path").attr("d", arcDitch())
        .attr("fill", C.ghost).attr("fill-opacity", 0.65);
      const arcBank = d3.arc()
        .innerRadius(48 * scaleM).outerRadius(51 * scaleM)
        .startAngle(57 * Math.PI / 180).endAngle((360 + 43) * Math.PI / 180);
      gFossat.append("path").attr("d", arcBank())
        .attr("fill", C.landEdge).attr("fill-opacity", 0.8);

      /* Heel Stone (74 m NE) */
      const heel = polarStoneXY(51, 70 * scaleM);
      gFossat.append("circle").attr("cx", heel[0]).attr("cy", heel[1]).attr("r", Math.max(2.6, 2.2 * scaleM))
        .attr("fill", C.ink);

      /* 2. 56 Forats Aubrey (R = 43.6 m) */
      const gAubrey = gPlan.append("g").attr("class","st-part").attr("data-part","aubrey");
      const aubreyPts = d3.range(56).map(i => polarStoneXY(50 + i * (360 / 56), 43.6 * scaleM));
      gAubrey.selectAll("circle").data(aubreyPts).join("circle")
        .attr("cx", d => d[0]).attr("cy", d => d[1]).attr("r", Math.max(1.7, 0.95 * scaleM))
        .attr("fill", C.blau).attr("fill-opacity", 0.72);

      /* 3. Avinguda (Fase 3): dos bancs paral·lels sortint cap al NE ~50° */
      const gAv = gPlan.append("g").attr("class","st-part").attr("data-part","avinguda");
      const avDir = [Math.sin(50 * Math.PI / 180), -Math.cos(50 * Math.PI / 180)];
      const avPerp = [Math.cos(50 * Math.PI / 180), Math.sin(50 * Math.PI / 180)];
      [-10.5 * scaleM, 10.5 * scaleM].forEach(off => {
        const x1 = avDir[0] * 50 * scaleM + avPerp[0] * off;
        const y1 = avDir[1] * 50 * scaleM + avPerp[1] * off;
        const x2 = avDir[0] * 86 * scaleM + avPerp[0] * off;
        const y2 = avDir[1] * 86 * scaleM + avPerp[1] * off;
        gAv.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
          .attr("stroke", C.ink2).attr("stroke-width", 1.8).attr("stroke-dasharray", "4 2");
      });

      /* 4. Station Stones rectangle (a=18m al llarg de 50°, b=39.7m perpendicular 140°) */
      const gStations = gPlan.append("g").attr("class","st-part").attr("data-part","stations");
      const sU = [Math.sin(50 * Math.PI / 180), -Math.cos(50 * Math.PI / 180)];
      const sV = [Math.sin(140 * Math.PI / 180), -Math.cos(140 * Math.PI / 180)];
      const rectCorners = [
        [ 18 * scaleM,  39.7 * scaleM],
        [-18 * scaleM,  39.7 * scaleM],
        [-18 * scaleM, -39.7 * scaleM],
        [ 18 * scaleM, -39.7 * scaleM]
      ].map(([a, b]) => [a * sU[0] + b * sV[0], a * sU[1] + b * sV[1]]);
      gStations.append("polygon")
        .attr("points", rectCorners.map(p => p.join(",")).join(" "))
        .attr("fill","none").attr("stroke", C.blau).attr("stroke-width", 1.1).attr("stroke-dasharray", "3 3");
      gStations.selectAll("circle").data(rectCorners).join("circle")
        .attr("cx", d => d[0]).attr("cy", d => d[1]).attr("r", Math.max(2.8, 1.8 * scaleM))
        .attr("fill", C.blau).attr("stroke", C.paper).attr("stroke-width", 0.8);

      /* 5. Forats Y i Z (Fase 5: 30 Z a 19.5 m + 29 Y a 26.8 m) */
      const gYZ = gPlan.append("g").attr("class","st-part").attr("data-part","yz");
      const yzPts = [
        ...d3.range(30).map(i => polarStoneXY(i * 12 + 4, 19.8 * scaleM)),
        ...d3.range(29).map(i => polarStoneXY(i * (360 / 29) + 2, 26.8 * scaleM))
      ];
      gYZ.selectAll("circle").data(yzPts).join("circle")
        .attr("cx", d => d[0]).attr("cy", d => d[1]).attr("r", Math.max(1.6, 0.8 * scaleM))
        .attr("fill", C.grocFosc);

      /* 6. Forats Q i R (Fase 2: doble cercle temporal de bluestones) */
      const gQR = gPlan.append("g").attr("class","st-part").attr("data-part","qr");
      const qrPts = [
        ...d3.range(34).map(i => polarStoneXY(i * (360 / 34), 11.4 * scaleM)),
        ...d3.range(34).map(i => polarStoneXY(i * (360 / 34), 13.0 * scaleM))
      ];
      gQR.selectAll("circle").data(qrPts).join("circle")
        .attr("cx", d => d[0]).attr("cy", d => d[1]).attr("r", Math.max(1.3, 0.65 * scaleM))
        .attr("fill", C.blauClar);

      /* 7. Cercle exterior de Sarsens (R = 15.4 m, 30 pilars + llindes) */
      const gSarsens = gPlan.append("g").attr("class","st-part").attr("data-part","sarsens");
      gSarsens.append("circle").attr("r", 15.4 * scaleM)
        .attr("fill","none").attr("stroke", C.vermell).attr("stroke-width", Math.max(2.5, 2.2 * scaleM))
        .attr("stroke-opacity", 0.35);
      d3.range(30).forEach(i => {
        const ang = i * 12;
        const p = polarStoneXY(ang, 15.4 * scaleM);
        gSarsens.append("rect")
          .attr("x", -1.1 * scaleM).attr("y", -0.65 * scaleM)
          .attr("width", 2.2 * scaleM).attr("height", 1.3 * scaleM)
          .attr("transform", `translate(${p[0]},${p[1]}) rotate(${ang})`)
          .attr("fill", C.vermell);
      });

      /* 8. Cercle i oval definitius de Bluestones (Fase 4) */
      const gBlueFinal = gPlan.append("g").attr("class","st-part").attr("data-part","bluefinal");
      d3.range(38).forEach(i => {
        const p = polarStoneXY(i * (360 / 38), 11.7 * scaleM);
        gBlueFinal.append("circle").attr("cx", p[0]).attr("cy", p[1]).attr("r", Math.max(1.5, 0.78 * scaleM))
          .attr("fill", C.blau);
      });
      /* Ferradura / oval interior */
      d3.range(19).forEach(i => {
        const ang = 90 + (i / 18) * 280;
        const p = polarStoneXY(ang, 5.4 * scaleM);
        gBlueFinal.append("circle").attr("cx", p[0]).attr("cy", p[1]).attr("r", Math.max(1.6, 0.85 * scaleM))
          .attr("fill", C.blau);
      });

      /* 9. Ferradura de 5 trílits gegants (oberta cap al NE 50°) */
      const gTril = gPlan.append("g").attr("class","st-part").attr("data-part","trilithons");
      const trilAngles = [132, 178, 230, 282, 328];
      trilAngles.forEach(ang => {
        [-7, 7].forEach(dA => {
          const p = polarStoneXY(ang + dA, 8.2 * scaleM);
          gTril.append("rect")
            .attr("x", -1.4 * scaleM).attr("y", -0.95 * scaleM)
            .attr("width", 2.8 * scaleM).attr("height", 1.9 * scaleM)
            .attr("transform", `translate(${p[0]},${p[1]}) rotate(${ang})`)
            .attr("fill", C.vermellFosc);
        });
      });

      /* 10. Pedra de l'Altar (jacent al peu del Gran Trílit 230°) */
      const altarP = polarStoneXY(230, 4.3 * scaleM);
      gTril.append("rect")
        .attr("x", -2.45 * scaleM).attr("y", -0.5 * scaleM)
        .attr("width", 4.9 * scaleM).attr("height", 1.0 * scaleM)
        .attr("transform", `translate(${altarP[0]},${altarP[1]}) rotate(${230})`)
        .attr("fill", C.groc).attr("stroke", C.ink).attr("stroke-width", 0.7);

      /* Anotació lateral només en desktop (a mòbil l'espai queda net per a la planta) */
      const gInset = svg.append("g").style("pointer-events","none");
      if(!mob){
        const ix = w - 165, iy = 24;
        IBV.t(gInset, ix, iy, "Fusteria en pedra (Fase 2)", { size: 12, weight: 700, fill: C.vermell, halo: 3 });
        IBV.t(gInset, ix, iy + 15, "Caixa i metxa + encadellat", { size: 11, fill: C.ink2, halo: 3 });
        /* Petit esquema de pilar + llinda encaixada */
        const sx = ix + 18, sy = iy + 48;
        gInset.append("rect").attr("x", sx).attr("y", sy + 14).attr("width", 18).attr("height", 34).attr("fill", C.vermell).attr("fill-opacity", 0.25).attr("stroke", C.vermell).attr("stroke-width", 1.2);
        gInset.append("rect").attr("x", sx + 6).attr("y", sy + 8).attr("width", 6).attr("height", 6).attr("fill", C.vermell);
        gInset.append("rect").attr("x", sx + 38).attr("y", sy + 14).attr("width", 18).attr("height", 34).attr("fill", C.vermell).attr("fill-opacity", 0.25).attr("stroke", C.vermell).attr("stroke-width", 1.2);
        gInset.append("rect").attr("x", sx + 44).attr("y", sy + 8).attr("width", 6).attr("height", 6).attr("fill", C.vermell);
        gInset.append("rect").attr("x", sx - 6).attr("y", sy - 6).attr("width", 68).attr("height", 14).attr("fill", C.groc).attr("fill-opacity", 0.45).attr("stroke", C.ink).attr("stroke-width", 1);
        IBV.t(gInset, ix + 115, sy + 52, "escala: 110 m", { size: 11, fill: C.muted, anchor: "middle", halo: 3 });
      } else {
        IBV.t(gInset, w - 10, 16, "NE (Solstici)", { size: 11, anchor: "end", fill: C.ink2, halo: 3 });
      }

      /* Cinta inferior Bayesiana (3100–1450 aC) */
      const ml = mob ? 14 : 28, mr = mob ? 14 : 28;
      const xTime = d3.scaleLinear([-3150, -1450], [ml, w - mr]);
      const yBar = h - (mob ? 28 : 42);
      const gTl = svg.append("g");
      IBV.axisX(gTl, xTime, yBar + 10, mob ? [-3000, -2500, -2000, -1500] : [-3000, -2600, -2200, -1800, -1500],
        v => Math.abs(v) + " aC", { grid: false });

      const bars = gTl.selectAll("g.fb").data(D.fases).join("g").attr("class","fb hit");
      bars.append("rect")
        .attr("x", f => xTime(f.inici))
        .attr("width", f => Math.max(6, xTime(f.fi) - xTime(f.inici)))
        .attr("y", yBar - 6).attr("height", 12).attr("rx", 3)
        .attr("fill", C.ghost);
      bars.append("text")
        .attr("x", f => (xTime(f.inici) + xTime(f.fi)) / 2)
        .attr("y", yBar - 11).attr("text-anchor","middle")
        .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink2)
        .text(f => "F" + f.num);

      function applyPhase(idx, instant){
        const dur = instant || IBV.reduced ? 0 : 420;
        const op = {
          fossat: 1,
          aubrey: idx === 0 ? 1 : 0.35,
          stations: idx >= 1 ? (idx === 1 ? 1 : 0.45) : 0,
          sarsens: idx >= 1 ? (idx === 1 ? 1 : 0.65) : 0,
          trilithons: idx >= 1 ? (idx === 1 ? 1 : 0.72) : 0,
          qr: idx === 1 ? 0.9 : (idx === 2 ? 0.45 : 0.08),
          avinguda: idx >= 2 ? (idx === 2 ? 1 : 0.55) : 0,
          bluefinal: idx >= 3 ? (idx === 3 ? 1 : 0.72) : 0,
          yz: idx >= 4 ? 1 : 0
        };
        gFossat.transition().duration(dur).style("opacity", op.fossat);
        gAubrey.transition().duration(dur).style("opacity", op.aubrey);
        gStations.transition().duration(dur).style("opacity", op.stations);
        gSarsens.transition().duration(dur).style("opacity", op.sarsens);
        gTril.transition().duration(dur).style("opacity", op.trilithons);
        gQR.transition().duration(dur).style("opacity", op.qr);
        gAv.transition().duration(dur).style("opacity", op.avinguda);
        gBlueFinal.transition().duration(dur).style("opacity", op.bluefinal);
        gYZ.transition().duration(dur).style("opacity", op.yz);
        gInset.transition().duration(dur).style("opacity", mob ? 1 : (idx === 1 ? 1 : 0.4));

        bars.select("rect").transition().duration(dur)
          .attr("fill", (d, i) => i === idx ? C.vermell : (i < idx ? C.blau : C.ghost))
          .attr("fill-opacity", (d, i) => i === idx ? 0.92 : (i < idx ? 0.42 : 0.55));
        bars.select("text").transition().duration(dur)
          .attr("fill", (d, i) => i === idx ? C.vermell : C.muted);

        const f = D.fases[idx];
        if(tEl) tEl.textContent = f.titol;
        if(sEl) sEl.textContent = `${f.dates} · ${f.desc}`;
      }

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const hitBar = d3.least(D.fases, f => Math.abs(mx - (xTime(f.inici) + xTime(f.fi)) / 2));
        if(my > yBar - 26 && hitBar){
          tp.show(`<b>${hitBar.titol}</b> (${hitBar.dates}) · ${hitBar.desc}`);
          return;
        }
        const dx = (mx - cx) / scaleM, dy = (my - cy) / scaleM;
        const rM = Math.hypot(dx, dy);
        if(rM <= 6) tp.show("<b>Pedra de l'Altar i ferradura interior</b> · 6 t de gres septentrional i pedres blaves");
        else if(rM <= 10.5) tp.show("<b>5 Trílits de sarsen</b> · fins a 8,71 m totals (Pedra 56), oberts cap al NE");
        else if(rM <= 18) tp.show("<b>Cercle exterior de sarsens (30,8 m Ø)</b> · 30 pilars de ~25 t units amb llindes encaixades");
        else if(rM <= 29) tp.show("<b>Forats Y i Z (Fase 5, ~1630–1520 cal BC)</b> · 59 cavitats concèntriques mai omplertes");
        else if(rM <= 47) tp.show("<b>56 Forats Aubrey i Station Stones</b> · cementiri de cremacions i rectangle perpendicular");
        else tp.show("<b>Fossat, talús i Avinguda (110 m Ø)</b> · orientats al solstici i cap al riu Avon");
      }, () => { if(svg.node().isConnected) tp.hide(); });

      state = { applyPhase };
      applyPhase(curIdx, true);
    }

    IBV.mount(el, draw);

    const stepsEl = document.querySelector("#s-fases .steps");
    const graphicEl = document.querySelector("#s-fases .graphic");
    if(stepsEl && graphicEl && window.IB && IB.scrolly){
      IB.scrolly(stepsEl, graphicEl, (idx, stepEl) => {
        const i = Number(stepEl && stepEl.dataset && stepEl.dataset.idx);
        if(!Number.isNaN(i) && D.fases[i]){
          curIdx = i;
          if(state) state.applyPhase(i, false);
        }
      });
    }
  })();

  /* =========================================================================
     3. FIGURA 3 — SIMULADOR ASTRONÒMIC POLAR (SOLSTICIS + LLUNA 18,6 ANYS)
     ========================================================================= */
  (function initCel(){
    const el = document.getElementById("cel-viz");
    const lgEl = document.getElementById("cel-lg");
    const rng = document.getElementById("cel-rng");
    const rngVal = document.getElementById("cel-rng-val");
    const presetBtns = document.querySelectorAll("#f-cel .cel-presets button");
    const eraBtns = document.querySelectorAll("#f-cel .cel-era button");
    const rAz = document.getElementById("stat-az");
    const rLloc = document.getElementById("stat-lloc");
    const rLluna = document.getElementById("stat-lluna");
    if(!el || !rng) return;

    IBV.legendCat(lgEl, [
      { c: C.groc, t: "Sortida solar" },
      { c: C.vermell, t: "Posta solar (eix principal SO)" },
      { c: C.blau, t: "Aturada lunar major (18,6 anys)" }
    ]);

    const PHI = 51.1789 * Math.PI / 180;
    const DEG = 180 / Math.PI, RAD = Math.PI / 180;
    let day = 355;
    let era = "-2500";
    let showLunarHighlight = false;

    const MONTH_LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const MONTH_CAT = ["gen", "feb", "març", "abr", "maig", "juny", "jul", "ag", "set", "oct", "nov", "des"];
    function dayToLabel(d){
      let rem = Math.round(d);
      for(let m = 0; m < 12; m++){
        if(rem <= MONTH_LEN[m]) return `${rem} ${MONTH_CAT[m]}`;
        rem -= MONTH_LEN[m];
      }
      return "21 des";
    }

    function calcAstro(d, eraKey){
      const eps = eraKey === "-2500" ? 23.98 : 23.436;
      const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(2 * Math.PI * (d - 80) / 365.2422)) * DEG;
      function azFromDecl(deltaDeg, hEffDeg){
        const c = (Math.sin(deltaDeg * RAD) - Math.sin(PHI) * Math.sin(hEffDeg * RAD)) / (Math.cos(PHI) * Math.cos(hEffDeg * RAD));
        const A = Math.acos(clamp(c, -1, 1)) * DEG;
        return { rise: A, set: 360 - A };
      }
      const sun = azFromDecl(decl, 0.0);
      const lunaN = azFromDecl(eps + 5.145, 0.88);
      const lunaS = azFromDecl(-(eps + 5.145), 0.88);
      return { eps, decl, sun, lunaN, lunaS };
    }

    function syncReadout(){
      rng.style.setProperty("--attr-min", rng.min || 1);
      rng.style.setProperty("--attr-max", rng.max || 365);
      rng.style.setProperty("--control-value", rng.value);
      const a = calcAstro(day, era);
      const dTxt = dayToLabel(day);
      const eTxt = era === "-2500" ? "2500 aC" : "2026 dC";
      rng.setAttribute("aria-valuetext", `${dTxt} (${eTxt}): sortida solar a ${F1(a.sun.rise)} graus i posta a ${F1(a.sun.set)} graus`);
      if(rngVal) rngVal.textContent = dTxt;
      if(rAz) rAz.textContent = `${F1(a.sun.rise)}° / ${F1(a.sun.set)}°`;
      if(rLloc){
        const diffWS = Math.abs(a.sun.set - 229.6);
        const diffSS = Math.abs(a.sun.rise - 49.6);
        rLloc.textContent = diffWS < 1.5
          ? "Posta alineada al Gran Trílit (SO)"
          : (diffSS < 1.5 ? "Sortida alineada amb l'Avinguda (NE)" : (Math.abs(a.decl) < 2 ? "Prop de l'equinocci (E–O)" : "Horitzó intermedi"));
      }
      if(rLluna){
        rLluna.textContent = `${F1(a.lunaN.set)}° NO · ${F1(a.lunaS.rise)}° SE`;
      }
    }

    let updateSky = null;

    function draw(container, w){
      container.innerHTML = "";
      const mob = w < 600;
      const h = mob ? Math.min(320, Math.round(w * 0.90)) : 410;
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * (mob ? 0.39 : 0.40);

      const svg = IBV.svg(container, w, h,
        "Brúixola astronòmica polar de Stonehenge a 51°11′ N comparant l'eix solar solsticial (NE–SO) amb el rectangle de les Station Stones i l'aturada lunar major (NO–SE) cada 18,6 anys.");
      const tp = IBV.tip(container);

      IBV.polarGrid(svg, cx, cy, R, 4, 12, { rIn: R * 0.25 });

      const pt = (deg, rad) => [cx + Math.sin(deg * RAD) * rad, cy - Math.cos(deg * RAD) * rad];

      /* Etiquetes cardinals */
      [[0, "N (0°)"], [90, "E (90°)"], [180, "S (180°)"], [270, "O (270°)"]].forEach(([ang, lbl]) => {
        const p = pt(ang, R + (mob ? 13 : 16));
        IBV.t(svg, p[0], p[1] + 4, lbl, { size: 11, weight: 600, fill: C.muted, anchor: "middle", halo: 3 });
      });

      /* Planta central a escala: Station Stones rectangle + Cercle sarsen + Ferradura */
      const gCore = svg.append("g");
      const rCore = R * 0.34;
      gCore.append("circle").attr("cx", cx).attr("cy", cy).attr("r", rCore * 0.65)
        .attr("fill","none").attr("stroke", C.hair).attr("stroke-width", 1.2);
      const sU = [Math.sin(50 * RAD), -Math.cos(50 * RAD)];
      const sV = [Math.sin(140 * RAD), -Math.cos(140 * RAD)];
      const corners = [[18, 39.7], [-18, 39.7], [-18, -39.7], [18, -39.7]].map(([a, b]) => {
        const sc = rCore / 44;
        return [cx + (a * sU[0] + b * sV[0]) * sc, cy + (a * sU[1] + b * sV[1]) * sc];
      });
      gCore.append("polygon").attr("points", corners.map(p => p.join(",")).join(" "))
        .attr("fill","none").attr("stroke", C.blau).attr("stroke-width", 1.2).attr("stroke-dasharray", "3 2.5");
      corners.forEach(p => gCore.append("circle").attr("cx", p[0]).attr("cy", p[1]).attr("r", 2.6).attr("fill", C.blau));

      /* Solstici 2500 aC de referència (línia base grisa fina) */
      const ref25 = calcAstro(355, "-2500");
      const pRefNE = pt(ref25.sun.rise, R), pRefSW = pt(ref25.sun.set, R);
      svg.append("line").attr("x1", pRefSW[0]).attr("y1", pRefSW[1]).attr("x2", pRefNE[0]).attr("y2", pRefNE[1])
        .attr("stroke", C.ghost).attr("stroke-width", 1).attr("stroke-dasharray", "3 3");

      /* Lluna: aturada major (cada 18,6 anys) */
      const gLuna = svg.append("g");
      const lunaLine1 = gLuna.append("line").attr("stroke", C.blau).attr("stroke-dasharray", "5 3");
      const lunaLine2 = gLuna.append("line").attr("stroke", C.blau).attr("stroke-dasharray", "5 3");
      const lunaDotN = gLuna.append("circle").attr("r", 5.2).attr("fill", C.blau).attr("stroke", C.paper).attr("stroke-width", 1.2);
      const lunaDotS = gLuna.append("circle").attr("r", 5.2).attr("fill", C.blau).attr("stroke", C.paper).attr("stroke-width", 1.2);

      /* Raigs solars dinàmics */
      const gSun = svg.append("g");
      const rayRise = gSun.append("line").attr("stroke", C.groc).attr("stroke-width", 2.8);
      const raySet = gSun.append("line").attr("stroke", C.vermell).attr("stroke-width", 2.8);
      const auraRise = gSun.append("circle").attr("r", 12).attr("fill", C.groc).attr("fill-opacity", 0.34).style("mix-blend-mode","multiply");
      const dotRise = gSun.append("circle").attr("r", 5).attr("fill", C.groc).attr("stroke", C.ink).attr("stroke-width", 1.2);
      const auraSet = gSun.append("circle").attr("r", 12).attr("fill", C.vermell).attr("fill-opacity", 0.28).style("mix-blend-mode","multiply");
      const dotSet = gSun.append("circle").attr("r", 5).attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.2);

      const lblRise = IBV.t(gSun, 0, 0, "", { size: 11.5, weight: 700, fill: C.ink, halo: 3 });
      const lblSet = IBV.t(gSun, 0, 0, "", { size: 11.5, weight: 700, fill: C.vermell, halo: 3 });
      const lblLuna = IBV.t(gLuna, 0, 0, "", { size: 11, weight: 700, fill: C.blau, halo: 3 });

      updateSky = () => {
        const a = calcAstro(day, era);
        const pRise = pt(a.sun.rise, R);
        const pSet = pt(a.sun.set, R);
        rayRise.attr("x1", cx).attr("y1", cy).attr("x2", pRise[0]).attr("y2", pRise[1]);
        raySet.attr("x1", cx).attr("y1", cy).attr("x2", pSet[0]).attr("y2", pSet[1]);
        auraRise.attr("cx", pRise[0]).attr("cy", pRise[1]);
        dotRise.attr("cx", pRise[0]).attr("cy", pRise[1]);
        auraSet.attr("cx", pSet[0]).attr("cy", pSet[1]);
        dotSet.attr("cx", pSet[0]).attr("cy", pSet[1]);

        lblRise.attr("x", clamp(pRise[0] + 10, 12, w - 95)).attr("y", clamp(pRise[1] - 8, 14, h - 12))
          .text(`Sortida ${F1(a.sun.rise)}°`);
        lblSet.attr("x", clamp(pSet[0] - 10, 95, w - 12)).attr("y", clamp(pSet[1] + 16, 14, h - 10))
          .attr("text-anchor", pSet[0] < cx ? "end" : "start")
          .text(`Posta ${F1(a.sun.set)}°`);

        const pLN = pt(a.lunaN.set, R), pLS = pt(a.lunaS.rise, R);
        const pLN2 = pt(a.lunaN.rise, R * 0.78), pLS2 = pt(a.lunaS.set, R * 0.78);
        lunaLine1.attr("x1", pLN[0]).attr("y1", pLN[1]).attr("x2", pLS[0]).attr("y2", pLS[1])
          .attr("stroke-width", showLunarHighlight ? 2.2 : 1.1).attr("stroke-opacity", showLunarHighlight ? 0.95 : 0.45);
        lunaLine2.attr("x1", pLN2[0]).attr("y1", pLN2[1]).attr("x2", pLS2[0]).attr("y2", pLS2[1])
          .attr("stroke-width", 0.8).attr("stroke-opacity", showLunarHighlight ? 0.45 : 0.2);
        lunaDotN.attr("cx", pLN[0]).attr("cy", pLN[1]).attr("opacity", showLunarHighlight ? 1 : 0.6);
        lunaDotS.attr("cx", pLS[0]).attr("cy", pLS[1]).attr("opacity", showLunarHighlight ? 1 : 0.6);
        const lunaAtN = a.sun.set <= 285;
        const lAnchor = lunaAtN ? pLN : pLS;
        lblLuna
          .attr("x", clamp(lAnchor[0] + (lunaAtN ? -8 : 8), lunaAtN ? 96 : 12, lunaAtN ? w - 10 : w - 96))
          .attr("y", clamp(lAnchor[1] + (lunaAtN ? -10 : 14), 14, h - 10))
          .attr("text-anchor", lunaAtN ? "end" : "start")
          .text(lunaAtN ? `Lluna ${F1(a.lunaN.set)}° NO` : `Lluna ${F1(a.lunaS.rise)}° SE`)
          .attr("opacity", showLunarHighlight || !mob ? 1 : 0);

        syncReadout();
      };

      updateSky();

      IBV.onView(container, instant => {
        if(instant) return;
        gCore.style("opacity", 0).transition().duration(750).ease(IBV.EASE).style("opacity", 1);
        gSun.style("opacity", 0).transition().delay(180).duration(750).ease(IBV.EASE).style("opacity", 1);
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const a = calcAstro(day, era);
        const ang = ((Math.atan2(mx - cx, -(my - cy)) * DEG) + 360) % 360;
        tp.show(`<b>Azimut ${F1(ang)}°</b> · Solstici ${era === "-2500" ? "2500 aC" : "avui"}: ${F1(a.sun.rise)}° / ${F1(a.sun.set)}° · Lluna 18,6 a: ${F1(a.lunaN.set)}° / ${F1(a.lunaS.rise)}°`);
      }, () => { if(svg.node().isConnected) tp.hide(); });
    }

    IBV.mount(el, draw);

    rng.addEventListener("input", () => {
      day = +rng.value;
      presetBtns.forEach(b => b.setAttribute("aria-pressed", "false"));
      if(updateSky) updateSky();
    });

    presetBtns.forEach(b => b.addEventListener("click", () => {
      presetBtns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      const k = b.dataset.k;
      showLunarHighlight = k === "lluna";
      if(k === "hivern") day = 355;
      else if(k === "equinocci") day = 80;
      else if(k === "estiu") day = 172;
      else if(k === "lluna") day = 355;
      rng.value = day;
      if(updateSky) updateSky();
    }));

    eraBtns.forEach(b => b.addEventListener("click", () => {
      eraBtns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      era = b.dataset.era;
      if(updateSky) updateSky();
    }));

    syncReadout();
  })();

  /* =========================================================================
     4. FIGURA 4 — PAISATGE FUSTA i PEDRA (3,2 KM) I ACÚSTICA (COX 2020)
     ========================================================================= */
  (function initPaisatge(){
    const el = document.getElementById("paisatge-viz");
    const lgEl = document.getElementById("paisatge-lg");
    const btns = document.querySelectorAll("#f-paisatge .seg button");
    if(!el) return;

    let mode = "corredor";

    function renderLegend(){
      lgEl.innerHTML = "";
      if(mode === "corredor"){
        IBV.legendCat(lgEl, [
          { c: C.vermell, t: "Monuments en pedra (avantpassats)" },
          { c: C.groc, t: "Monuments en fusta (vius)" },
          { c: C.blau, t: "Riu Avon i Bluestonehenge" }
        ]);
      } else {
        IBV.legendCat(lgEl, [
          { c: C.vermell, t: "Stonehenge interior (maqueta 1:12)" },
          { c: C.blau, t: "Stonehenge exterior (fossat)" },
          { c: C.groc, t: "Referència sala moderna" }
        ]);
      }
    }

    function drawCorredor(container, w){
      const mob = w < 600;
      const h = mob ? 280 : 340;
      const M = { l: mob ? 14 : 34, r: mob ? 14 : 34, t: 28, b: 38 };
      const svg = IBV.svg(container, w, h,
        "Plànol a escala del corredor cerimonial de la plana de Salisbury: Stonehenge en pedra, l'Avinguda fins a Bluestonehenge arran del riu Avon, Durrington Walls i Woodhenge en fusta, i la tomba de l'Arquer d'Amesbury a 5 km.");
      const tp = IBV.tip(container);

      const x = d3.scaleLinear([-1.0, 5.1], [M.l, w - M.r]);
      const y = d3.scaleLinear([-2.2, 2.7], [h - M.b, M.t]);

      /* Riu Avon serpentejant (corba en blau suau) */
      const avonPts = [[1.6, 2.7], [2.4, 2.0], [2.2, 1.0], [2.5, 0.0], [2.35, -1.15], [3.0, -2.2]];
      const riverLine = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveCatmullRom);
      svg.append("path").attr("d", riverLine(avonPts))
        .attr("fill","none").attr("stroke", C.blauClar).attr("stroke-width", mob ? 7 : 10).attr("stroke-linecap","round").attr("stroke-opacity", 0.55);
      IBV.t(svg, x(2.48), y(0.45), "Riu Avon", { size: 11.5, italic: true, fill: C.blau, halo: 3 });

      /* Avinguda cerimonial: 2,8 km entre Stonehenge (0,0) i Bluestonehenge (2.35, -1.15) */
      const avPts = [[0, 0], [0.6, 0.45], [1.4, 0.25], [2.05, -0.45], [2.35, -1.15]];
      svg.append("path").attr("d", riverLine(avPts))
        .attr("fill","none").attr("stroke", C.ink).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 3");
      IBV.t(svg, x(1.15), y(0.55), "L'Avinguda (~2,8 km)", { size: 11, fill: C.ink2, anchor: "middle", halo: 3 });

      /* Gran Cursus: franja est-oest */
      svg.append("rect").attr("x", x(-0.8)).attr("y", y(1.05)).attr("width", x(1.7) - x(-0.8)).attr("height", 8)
        .attr("fill", C.landEdge).attr("stroke", C.ghost).attr("stroke-width", 0.8);

      const nodes = D.paisatge_nodes.map(d => ({ ...d, px: x(d.x), py: y(d.y) }));
      const sel = svg.selectAll("g.pn").data(nodes).join("g").attr("class","pn hit");
      sel.each(function(d){
        const g = d3.select(this);
        const col = COL[d.cat] || C.ink2;
        g.append("circle").attr("cx", d.px).attr("cy", d.py).attr("r", mob ? d.r * 0.72 : d.r)
          .attr("fill", col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("cx", d.px).attr("cy", d.py).attr("r", 3.4)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 1);

        const anc = (d.x > 3.6 || d.id === "bhenge") ? "end" : "start";
        const offX = anc === "end" ? -10 : 10;
        const offY = d.id === "wood" ? 16 : (d.id === "durr" ? -10 : (d.id === "archer" ? 16 : -10));
        IBV.t(g, clamp(d.px + offX, 10, w - 10), clamp(d.py + offY, 14, h - 22), d.nom, {
          size: mob ? 11 : 12, weight: 700, anchor: anc, fill: TEXT_COL[d.cat] || C.ink, halo: 3
        });
        if(!mob || d.id === "sh" || d.id === "durr"){
          IBV.t(g, clamp(d.px + offX, 10, w - 10), clamp(d.py + offY + 13, 24, h - 10), d.mat, {
            size: 11, fill: C.ink2, anchor: anc, halo: 3
          });
        }
      });

      /* Barra d'escala real: 1 km */
      svg.append("line").attr("x1", M.l).attr("x2", M.l + (x(1) - x(0))).attr("y1", h - 14).attr("y2", h - 14)
        .attr("stroke", C.ink).attr("stroke-width", 1.5);
      IBV.t(svg, M.l + (x(1) - x(0)) + 6, h - 10, "1 km", { size: 11, fill: C.ink2, halo: 3 });

      IBV.onView(container, instant => {
        if(instant) return;
        sel.style("opacity", 0).transition().delay((d, i) => i * 90).duration(700).ease(IBV.EASE).style("opacity", 1);
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const best = d3.least(nodes, d => Math.hypot(d.px - mx, d.py - my));
        if(best && Math.hypot(best.px - mx, best.py - my) < 55){
          IBV.focus(sel, x => x.id === best.id, { dim: 0.48 });
          tp.show(`<b>${best.nom}</b> (${best.mat}) · ${best.detall}`);
        } else {
          IBV.focus(sel, null);
          tp.hide();
        }
      }, () => { if(svg.node().isConnected){ IBV.focus(sel, null); tp.hide(); } });
    }

    function drawAcustica(container, w){
      const mob = w < 600;
      const items = D.acustica;
      const tp = IBV.tip(container);

      /* Dues mètriques de Cox et al. (2020): files netes amb cercles translúcids multiply (IB-38) */
      const rowH = mob ? 56 : 52;
      const M = { l: mob ? 8 : 245, r: mob ? 22 : 34, t: 28, b: 36 };
      const h = M.t + items.length * rowH + M.b;

      const svg = IBV.svg(container, w, h,
        "Comparativa acústica de la maqueta 1:12 de Stonehenge (Cox, Fazenda & Greaney, 2020): reverberació mitjana de 0,64 s i amplificació de la parla de +4,3 dB dins del cercle.");

      const xRt = d3.scaleSqrt([0, 4.6], [M.l, w - M.r]);
      const rSc = d3.scaleSqrt([0, 9.0], [4, mob ? 14 : 18]);

      IBV.axisX(svg, xRt, h - M.b, mob ? [0, 0.64, 2, 4.5] : [0, 0.2, 0.64, 1.5, 3.0, 4.5],
        v => v === 0.64 ? "0,64 s" : F1(v) + " s", { grid: M.t });
      IBV.t(svg, w - M.r, M.t - 10, "Reverberació (s, escala √) · àrea = guany parla (+dB)", {
        size: 11, fill: C.muted, anchor: "end", halo: 3
      });

      const rows = svg.selectAll("g.ac").data(items).join("g").attr("class","ac hit");
      rows.each(function(d, i){
        const g = d3.select(this);
        const y0 = M.t + i * rowH + (mob ? 34 : rowH / 2);
        const col = COL[d.cat] || C.ink2;
        const cxPos = xRt(d.rt);

        g.append("line").attr("x1", M.l).attr("x2", w - M.r).attr("y1", y0).attr("y2", y0)
          .attr("stroke", C.grid).attr("stroke-width", 0.7);
        g.append("line").attr("x1", M.l).attr("x2", cxPos).attr("y1", y0).attr("y2", y0)
          .attr("stroke", col).attr("stroke-width", d.id === "int" ? 2.2 : 1.2).attr("stroke-opacity", 0.7);

        g.append("circle").attr("class","ac-aur").attr("cx", cxPos).attr("cy", y0).attr("r", 0)
          .attr("fill", col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("cx", cxPos).attr("cy", y0).attr("r", 3.2)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.8);

        if(mob){
          IBV.t(g, M.l, y0 - 14, `${d.nom} · ${F2(d.rt)} s (+${F1(d.amp)} dB)`, {
            size: 11.5, weight: d.id === "int" ? 700 : 600, fill: d.id === "int" ? C.vermell : C.ink, halo: 3
          });
        } else {
          IBV.t(g, M.l - 12, y0 + 4, d.nom, {
            size: 12.5, weight: d.id === "int" ? 700 : 400, anchor: "end", fill: d.id === "int" ? C.vermell : C.ink, halo: 3
          });
          const nearRight = cxPos > w - M.r - 110;
          const lblX = nearRight ? cxPos - rSc(d.amp) - 8 : cxPos + rSc(d.amp) + 8;
          IBV.t(g, lblX, y0 + 4,
            `${F2(d.rt)} s · +${F1(d.amp)} dB`, {
              size: 11.5, weight: d.id === "int" ? 700 : 400, anchor: nearRight ? "end" : "start",
              fill: d.id === "int" ? C.vermell : C.ink2, halo: 3
            });
        }
      });

      IBV.onView(container, instant => {
        rows.selectAll("circle.ac-aur").transition().duration(instant ? 0 : 800).ease(IBV.EASE)
          .attr("r", d => d.amp > 0 ? rSc(d.amp) : 4.5);
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const best = d3.least(items, (d, i) => Math.abs(my - (M.t + i * rowH + (mob ? 34 : rowH / 2))));
        if(best){
          IBV.focus(rows, x => x.id === best.id, { dim: 0.48 });
          tp.show(`<b>${best.nom}</b> · ${F2(best.rt)} s · +${F1(best.amp)} dB · ${best.detall}`);
        }
      }, () => { if(svg.node().isConnected){ IBV.focus(rows, null); tp.hide(); } });
    }

    IBV.mount(el, (container, w) => {
      container.innerHTML = "";
      if(mode === "corredor") drawCorredor(container, w);
      else drawAcustica(container, w);
    });

    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      mode = b.dataset.k;
      renderLegend();
      el.innerHTML = "";
      const w = Math.round(el.clientWidth);
      if(w){ if(mode === "corredor") drawCorredor(el, w); else drawAcustica(el, w); }
    }));
    renderLegend();
  })();

  /* =========================================================================
     5. FIGURA 5 — GENT: CREMACIONS, ADNa (100 PUNTS) I BANQUETS D'HIVERN
     ========================================================================= */
  (function initGent(){
    const el = document.getElementById("gent-viz");
    const lgEl = document.getElementById("gent-lg");
    const btns = document.querySelectorAll("#f-gent .seg.main-seg button");
    const eraBox = document.getElementById("gent-era-ctl");
    const eraBtns = document.querySelectorAll("#gent-era-ctl button");
    if(!el) return;

    let mode = "cremacions";
    let adnKey = "campaniforme";

    function renderLegend(){
      lgEl.innerHTML = "";
      if(eraBox) eraBox.style.display = mode === "adn" ? "flex" : "none";
      if(mode === "cremacions"){
        IBV.legendCat(lgEl, [
          { c: C.groc, t: "Creta local de Wessex (15 · 60 %)" },
          { c: C.blau, t: "Fora de Wessex / Gal·les (10 · 40 %)" }
        ]);
      } else if(mode === "adn"){
        IBV.legendCat(lgEl, [
          { c: C.blau, t: "Caçadors-recol·lectors (WHG)" },
          { c: C.groc, t: "Agricultors neolítics (EEF)" },
          { c: C.vermell, t: "Onada Campaniforme / estepària" }
        ]);
      } else {
        IBV.legendCat(lgEl, [
          { c: C.blau, t: "Naixements de primavera (%)" },
          { c: C.vermell, t: "Sacrifici (~9 mesos) a tardor-hivern (%)" }
        ]);
      }
    }

    function drawCremacions(container, w){
      const mob = w < 600;
      const h = mob ? 290 : 300;
      const svg = IBV.svg(container, w, h,
        "25 individus cremats dels forats Aubrey analitzats per Snoeck et al. (2018): 15 locals de Wessex (60 %) i almenys 10 forans compatibles amb l'oest de Gal·les (40 %).");
      const tp = IBV.tip(container);

      const cols = 5, rows = 5;
      const gridW = Math.min(w - 40, mob ? 210 : 260);
      const step = gridW / cols;
      const x0 = mob ? (w - gridW) / 2 : 56;
      const y0 = 42;

      IBV.t(svg, mob ? w / 2 : x0, 22,
        mob ? "25 cremats · estronci (Snoeck et al., 2018)" : "25 individus cremats analitzats amb estronci (Snoeck et al., 2018)", {
          size: mob ? 12 : 13, weight: 700, anchor: mob ? "middle" : "start", fill: C.ink, halo: 3
      });

      const pts = d3.range(25).map(i => {
        const isFora = i >= 15;
        return {
          i, isFora,
          col: isFora ? C.blau : C.groc,
          cat: isFora ? D.cremacions[1] : D.cremacions[0],
          cx: x0 + (i % cols) * step + step / 2,
          cy: y0 + Math.floor(i / cols) * step + step / 2
        };
      });

      const dotSel = svg.selectAll("circle.cr").data(pts).join("circle").attr("class","cr hit")
        .attr("cx", d => d.cx).attr("cy", d => d.cy)
        .attr("r", 0)
        .attr("fill", d => d.col).attr("fill-opacity", d => d.isFora ? 0.85 : 0.72)
        .attr("stroke", C.paper).attr("stroke-width", 1.5);

      IBV.onView(container, instant => {
        dotSel.transition().delay((d, i) => instant ? 0 : i * 18).duration(instant ? 0 : 650).ease(IBV.EASE)
          .attr("r", mob ? 13 : 16);
      });

      if(!mob){
        const tx = x0 + gridW + 44;
        IBV.t(svg, tx, y0 + 26, "15 locals (60 %)", { size: 15, weight: 700, fill: C.ink, halo: 3 });
        IBV.t(svg, tx, y0 + 44, "Signatura compatible amb la creta de Wessex", { size: 12.5, fill: C.ink2, halo: 3 });
        IBV.t(svg, tx, y0 + 96, "10 forans (40 %)", { size: 15, weight: 700, fill: C.blau, halo: 3 });
        IBV.t(svg, tx, y0 + 114, "Van passar la vida lluny, compatibles amb Gal·les", { size: 12.5, fill: C.ink2, halo: 3 });
        IBV.t(svg, tx, y0 + 168, "Total estimat al cementiri: 150–240 persones", { size: 12, weight: 600, fill: C.muted, halo: 3 });
        IBV.t(svg, tx, y0 + 185, "Paritat d'homes i dones (Willis et al., 2016)", { size: 12, fill: C.muted, halo: 3 });
      } else {
        IBV.t(svg, w / 2, y0 + gridW + 22, "15 locals (60 %) · 10 de fora / Gal·les (40 %)", {
          size: 12, weight: 700, anchor: "middle", fill: C.ink, halo: 3
        });
        IBV.t(svg, w / 2, y0 + gridW + 40, "Cementiri estimat: 150–240 persones (homes i dones)", {
          size: 11.5, anchor: "middle", fill: C.muted, halo: 3
        });
      }

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const best = d3.least(pts, d => Math.hypot(d.cx - mx, d.cy - my));
        if(best && Math.hypot(best.cx - mx, best.cy - my) < 28){
          IBV.focus(dotSel, x => x.isFora === best.isFora, { dim: 0.48 });
          tp.show(`<b>${best.cat.nom}</b> (${best.cat.pct} %) · ${best.cat.detall}`);
        } else {
          IBV.focus(dotSel, null);
          tp.hide();
        }
      }, () => { if(svg.node().isConnected){ IBV.focus(dotSel, null); tp.hide(); } });
    }

    let updateAdn = null;

    function drawAdn(container, w){
      const mob = w < 600;
      const h = mob ? 330 : 340;
      const svg = IBV.svg(container, w, h,
        "Reixa de 100 punts amb el reemplaçament genètic a Gran Bretanya segons l'ADNa: del Mesolític al Neolític (Brace et al., 2019) i el gir de ~90 % del Vas Campaniforme (Olalde et al., 2018).");
      const tp = IBV.tip(container);

      const gridW = Math.min(w - 36, mob ? 236 : 260);
      const step = gridW / 10;
      const x0 = mob ? (w - gridW) / 2 : 52;
      const y0 = 56;

      const tTitle = IBV.t(svg, mob ? w / 2 : x0, 22, "", {
        size: mob ? 12.5 : 14, weight: 700, anchor: mob ? "middle" : "start", fill: C.ink, halo: 3
      });
      const tSub = IBV.t(svg, mob ? w / 2 : x0, 40, "", {
        size: 11.5, anchor: mob ? "middle" : "start", fill: C.ink2, halo: 3
      });

      const dots = d3.range(100).map(i => ({
        i,
        cx: x0 + (i % 10) * step + step / 2,
        cy: y0 + Math.floor(i / 10) * step + step / 2,
        cat: "blau", grup: ""
      }));

      const dotSel = svg.selectAll("circle.ad").data(dots).join("circle").attr("class","ad hit")
        .attr("cx", d => d.cx).attr("cy", d => d.cy)
        .attr("r", mob ? 8.5 : 9.6)
        .attr("stroke", C.paper).attr("stroke-width", 1.2);

      const gSum = svg.append("g");

      updateAdn = (instant) => {
        const st = D.adn.find(x => x.id === adnKey) || D.adn[2];
        tTitle.text(mob ? st.nom : st.titol);
        tSub.text(mob ? st.grups.map(g => `${g.pct}%`).join(" / ") + " · " + st.nom.split(" ")[0] : st.desc);

        let cursor = 0;
        const assign = [];
        st.grups.forEach(g => {
          for(let k = 0; k < g.pct && cursor < 100; k++){
            assign[cursor++] = g;
          }
        });
        dots.forEach((d, idx) => {
          const g = assign[idx] || st.grups[0];
          d.cat = g.cat;
          d.grup = g.nom;
          d.pct = g.pct;
        });

        const dur = instant || IBV.reduced ? 0 : 480;
        dotSel.transition().duration(dur).delay((d, i) => instant || IBV.reduced ? 0 : i * 3)
          .attr("fill", d => COL[d.cat]);

        gSum.selectAll("*").remove();
        if(!mob){
          const sx = x0 + gridW + 44;
          st.grups.forEach((g, idx) => {
            const yy = y0 + 28 + idx * 54;
            gSum.append("circle").attr("cx", sx).attr("cy", yy - 4).attr("r", 6).attr("fill", COL[g.cat]);
            IBV.t(gSum, sx + 14, yy, `${g.pct} % · ${g.nom}`, {
              size: 14, weight: 700, fill: TEXT_COL[g.cat], halo: 3
            });
          });
        } else {
          st.grups.forEach((g, idx) => {
            const yy = y0 + gridW + 22 + idx * 18;
            IBV.t(gSum, w / 2, yy, `${g.pct} % · ${g.nom}`, {
              size: 11.5, weight: 700, anchor: "middle", fill: TEXT_COL[g.cat], halo: 3
            });
          });
        }
      };

      updateAdn(true);

      IBV.onView(container, instant => {
        if(instant) return;
        dotSel.attr("r", 0).transition().delay((d, i) => i * 5).duration(600).ease(IBV.EASE).attr("r", mob ? 8.5 : 9.6);
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const best = d3.least(dots, d => Math.hypot(d.cx - mx, d.cy - my));
        if(best && Math.hypot(best.cx - mx, best.cy - my) < 26){
          IBV.focus(dotSel, x => x.grup === best.grup, { dim: 0.48 });
          tp.show(`<b>${best.grup}</b> (${best.pct} %) · Patrimoni genètic estimat en aquesta etapa`);
        } else {
          IBV.focus(dotSel, null);
          tp.hide();
        }
      }, () => { if(svg.node().isConnected){ IBV.focus(dotSel, null); tp.hide(); } });
    }

    function drawBanquets(container, w){
      const mob = w < 600;
      const h = mob ? 310 : 380;
      const cx = w / 2, cy = h / 2 + 6;
      const R = Math.min(w, h) * (mob ? 0.37 : 0.38);

      const svg = IBV.svg(container, w, h,
        "Rosa anual del cicle de cria i sacrifici de porcs a Durrington Walls (síntesi de Wright et al., 2014): naixements concentrats a la primavera i pic de sacrificis als ~9 mesos a finals de tardor i ple hivern.");
      const tp = IBV.tip(container);

      IBV.polarGrid(svg, cx, cy, R, 4, 12);

      const rSc = d3.scaleSqrt([0, 40], [0, R]);
      const data = D.banquets_mesos;
      const ang = i => (i / 12) * Math.PI * 2;

      const areaGen = key => d3.areaRadial()
        .angle(d => ang(d.m))
        .innerRadius(0)
        .outerRadius(d => rSc(d[key]))
        .curve(d3.curveCardinalClosed.tension(0.35));

      const pNaix = svg.append("path").datum(data).attr("transform", `translate(${cx},${cy})`)
        .attr("d", areaGen("naix")).attr("fill", C.blau).attr("fill-opacity", 0.28)
        .attr("stroke", C.blau).attr("stroke-width", 1.3);

      const pSac = svg.append("path").datum(data).attr("transform", `translate(${cx},${cy})`)
        .attr("d", areaGen("sac")).attr("fill", C.vermell).attr("fill-opacity", 0.32)
        .attr("stroke", C.vermell).attr("stroke-width", 1.5);

      IBV.onView(container, instant => {
        if(instant) return;
        pNaix.attr("transform", `translate(${cx},${cy}) scale(0.1)`).transition().duration(800).ease(IBV.EASE).attr("transform", `translate(${cx},${cy}) scale(1)`);
        pSac.attr("transform", `translate(${cx},${cy}) scale(0.1)`).transition().delay(120).duration(850).ease(IBV.EASE).attr("transform", `translate(${cx},${cy}) scale(1)`);
      });

      data.forEach(d => {
        const a = ang(d.m);
        const lx = cx + Math.sin(a) * (R + 14);
        const ly = cy - Math.cos(a) * (R + 14);
        IBV.t(svg, lx, ly + 4, d.nom, { size: 11, weight: (d.m === 11 || d.m === 3) ? 700 : 400, anchor: "middle", fill: C.ink2, halo: 3 });
      });

      IBV.note(svg, {
        x: cx + Math.sin(ang(11)) * rSc(22), y: cy - Math.cos(ang(11)) * rSc(22),
        tx: clamp(cx - R * 0.45, 92, w - 20), ty: clamp(cy - R - 2, 22, h - 20),
        lines: [["Pic d'hivern (~9 mesos)", true], ["Solstici i banquets"]], kind: "elbow", anchor: "end", size: 11, fill: C.vermell
      });
      if(!mob){
        IBV.note(svg, {
          x: cx + Math.sin(ang(3)) * rSc(38), y: cy - Math.cos(ang(3)) * rSc(38),
          tx: clamp(cx + R + 34, 40, w - 120), ty: cy - 36,
          lines: [["Parts de primavera", true], ["Fora de Wessex"]], kind: "elbow", anchor: "start", size: 11, fill: C.blau
        });
      }

      const hitPts = data.map(d => {
        const a = ang(d.m);
        return { d, hx: cx + Math.sin(a) * (R * 0.65), hy: cy - Math.cos(a) * (R * 0.65) };
      });
      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const best = d3.least(hitPts, p => Math.hypot(p.hx - mx, p.hy - my));
        if(best && Math.hypot(best.hx - mx, best.hy - my) < R * 0.55){
          tp.show(`<b>${best.d.nom}</b> · Parts ~${best.d.naix} % · Sacrificis ~${best.d.sac} % · ${best.d.nota}`);
        } else tp.hide();
      }, () => { if(svg.node().isConnected) tp.hide(); });
    }

    function renderAll(){
      renderLegend();
      el.innerHTML = "";
      const w = Math.round(el.clientWidth);
      if(!w) return;
      if(mode === "cremacions") drawCremacions(el, w);
      else if(mode === "adn") drawAdn(el, w);
      else drawBanquets(el, w);
    }

    IBV.mount(el, () => renderAll());
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      mode = b.dataset.k;
      renderAll();
    }));
    eraBtns.forEach(b => b.addEventListener("click", () => {
      eraBtns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      adnKey = b.dataset.era;
      if(mode === "adn" && updateAdn) updateAdn(false);
    }));
    renderLegend();
  })();

  /* =========================================================================
     6. FIGURA 6 — STONEHENGE AL MÓN: 12.000 ANYS DE MEGÀLITS (IB-49 + IB-25)
     ========================================================================= */
  (function initMon(){
    const el = document.getElementById("mon-viz");
    const lgEl = document.getElementById("mon-lg");
    const btns = document.querySelectorAll("#f-mon .seg button");
    if(!el) return;

    let mode = "cronologia";
    let worldData = null;

    function renderLegend(){
      lgEl.innerHTML = "";
      IBV.legendCat(lgEl, [
        { c: C.vermell, t: "Stonehenge i tradicions monumentals" },
        { c: C.blau, t: "Arc atlàntic i britànic" },
        { c: C.groc, t: "Àfrica, Pacífic i Sud-est asiàtic" }
      ]);
    }

    function fmtYear(y){ return y < 0 ? `${F0(Math.abs(y))} aC` : `${y} dC`; }

    /* A mòbil (< 600 px) es transposa obligatòriament a línia del temps vertical! */
    function drawCronologia(container, w){
      const mob = w < 600;
      const items = D.mon;
      const tp = IBV.tip(container);

      if(mob){
        const rowH = 48;
        const M = { l: 64, r: 14, t: 20, b: 22 };
        const h = M.t + items.length * rowH + M.b;
        const svg = IBV.svg(container, w, h,
          "Línia del temps vertical de 12.000 anys de megalitisme mundial (de Göbekli Tepe al 9600 aC fins a Sumba Occidental avui).");

        const y = d3.scaleLinear([-10000, 2026], [M.t + 12, h - M.b - 12]);
        svg.append("line").attr("x1", M.l).attr("x2", M.l).attr("y1", M.t).attr("y2", h - M.b)
          .attr("stroke", C.hair).attr("stroke-width", 1.2);

        const rows = svg.selectAll("g.mv").data(items).join("g").attr("class","mv hit");
        rows.each(function(d, i){
          const g = d3.select(this);
          const py = M.t + i * rowH + rowH / 2;
          const col = COL[d.cat];
          g.append("circle").attr("class","mh-dot").attr("cx", M.l).attr("cy", py).attr("r", 0)
            .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 1.2);
          IBV.t(g, M.l - 10, py + 4, fmtYear(d.mid), { size: 11, weight: 700, anchor: "end", fill: C.ink2, halo: 3 });
          IBV.t(g, M.l + 14, py - 2, d.nom, { size: 12.5, weight: 700, fill: TEXT_COL[d.cat], halo: 3 });
          IBV.t(g, M.l + 14, py + 13, `${d.lloc} · ~${F0(d.pes)} t`, { size: 11, fill: C.muted, halo: 3 });
        });

        IBV.onView(container, instant => {
          rows.selectAll("circle.mh-dot").transition().delay((d, i) => instant ? 0 : i * 45).duration(instant ? 0 : 700).ease(IBV.EASE)
            .attr("r", d => d.id === "stonehenge" ? 7 : 5);
        });

        IBV.hover(svg.node(), (ev, [mx, my]) => {
          if(!svg.node().isConnected) return;
          const best = d3.least(items, (d, i) => Math.abs(my - (M.t + i * rowH + rowH / 2)));
          if(best){
            IBV.focus(rows, x => x.id === best.id, { dim: 0.48 });
            tp.show(`<b>${best.nom}</b> (${fmtYear(best.inici)} – ${fmtYear(best.fi)}) · ${best.detall}`);
          }
        }, () => { if(svg.node().isConnected){ IBV.focus(rows, null); tp.hide(); } });
        return;
      }

      /* Desktop horitzontal (IB-49) */
      const h = 320;
      const M = { l: 38, r: 44, t: 32, b: 42 };
      const svg = IBV.svg(container, w, h,
        "Línia del temps de 12.000 anys de megalitisme mundial des de Göbekli Tepe fins a Rapa Nui i Sumba Occidental.");

      const x = d3.scaleLinear([-10200, 2100], [M.l, w - M.r]);
      const yAxis = h - M.b;

      IBV.axisX(svg, x, yAxis, [-10000, -8000, -6000, -4000, -2000, 0, 2000], v => v === 0 ? "0" : (v < 0 ? Math.abs(v) + " aC" : v + " dC"), { grid: M.t });

      const laneY = [M.t + 36, M.t + 104, M.t + 172];
      const nodes = svg.selectAll("g.mh").data(items).join("g").attr("class","mh hit");
      nodes.each(function(d){
        const g = d3.select(this);
        const ly = laneY[d.carril % 3];
        const col = COL[d.cat];
        const x1 = x(d.inici), x2 = x(d.fi), xm = x(d.mid);

        g.append("line").attr("x1", xm).attr("x2", xm).attr("y1", ly).attr("y2", yAxis)
          .attr("stroke", C.grid).attr("stroke-width", 0.8);
        g.append("line").attr("x1", x1).attr("x2", Math.max(x1 + 4, x2)).attr("y1", ly).attr("y2", ly)
          .attr("stroke", col).attr("stroke-width", d.id === "stonehenge" ? 6 : 4).attr("stroke-opacity", 0.72).attr("stroke-linecap","round");
        g.append("circle").attr("class","mh-dot").attr("cx", xm).attr("cy", ly).attr("r", 0)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 1.2);

        const anc = xm > w * 0.78 ? "end" : (xm < w * 0.16 ? "start" : "middle");
        IBV.t(g, xm, ly - 12, d.nom, { size: 12, weight: 700, anchor: anc, fill: TEXT_COL[d.cat], halo: 3 });
        IBV.t(g, xm, ly + 17, `${fmtYear(d.inici)}`, { size: 11, anchor: anc, fill: C.ink2, halo: 3 });
      });

      IBV.onView(container, instant => {
        nodes.selectAll("circle.mh-dot").transition().delay((d, i) => instant ? 0 : i * 50).duration(instant ? 0 : 750).ease(IBV.EASE)
          .attr("r", d => d.id === "stonehenge" ? 7 : 5);
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const best = d3.least(items, d => Math.hypot(mx - x(d.mid), my - laneY[d.carril % 3]));
        if(best && Math.hypot(mx - x(best.mid), my - laneY[best.carril % 3]) < 95){
          IBV.focus(nodes, p => p.id === best.id, { dim: 0.48 });
          tp.show(`<b>${best.nom}</b> (${best.lloc}, ${fmtYear(best.inici)} – ${fmtYear(best.fi)}) · ${best.detall}`);
        } else {
          IBV.focus(nodes, null);
          tp.hide();
        }
      }, () => { if(svg.node().isConnected){ IBV.focus(nodes, null); tp.hide(); } });
    }

    function drawMapa(container, w){
      const mob = w < 600;
      const h = mob ? 245 : Math.round(clamp(w * 0.47, 340, 420));
      const svg = IBV.svg(container, w, h,
        "Mapa del món en projecció Equal Earth amb nou grans tradicions megalítiques d'arreu del planeta i el pes típic dels blocs.");
      const tp = IBV.tip(container);

      const proj = d3.geoEqualEarth().fitExtent([[mob ? 4 : 12, 8], [w - (mob ? 4 : 12), h - 8]], { type: "Sphere" });
      const path = d3.geoPath(proj);

      svg.append("path").datum(d3.geoGraticule().step([30, 30])()).attr("d", path).attr("fill","none").attr("stroke", C.grid).attr("stroke-width", 0.45);
      if(worldData){
        svg.append("path").datum(worldData.land).attr("d", path).attr("fill", C.land);
        svg.append("path").datum(worldData.borders).attr("d", path).attr("fill","none").attr("stroke", C.paper).attr("stroke-width", 0.5);
      }

      const rSc = d3.scaleSqrt([0.8, 25], [6, mob ? 16 : 24]);
      const pts = D.mon.map(d => ({ ...d, xy: proj([d.lon, d.lat]) }));
      const sel = svg.selectAll("g.mw").data(pts).join("g").attr("class","mw hit");
      sel.each(function(d){
        const g = d3.select(this);
        const col = COL[d.cat];
        g.append("circle").attr("class","mw-aur").attr("cx", d.xy[0]).attr("cy", d.xy[1]).attr("r", 0)
          .attr("fill", col).attr("fill-opacity", 0.30).style("mix-blend-mode","multiply");
        g.append("circle").attr("cx", d.xy[0]).attr("cy", d.xy[1]).attr("r", 2.8)
          .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 0.8);

        if(!mob || d.id === "gobekli" || d.id === "stonehenge" || d.id === "menorca" || d.id === "rapanui" || d.id === "sumba"){
          if(d.id === "newgrange" || d.id === "brodgar") return; // evitar solapament amb Stonehenge al mapa global
          const anc = d.lon < -60 ? "start" : (d.id === "carnac" ? "end" : "start");
          const ox = anc === "end" ? -10 : 10;
          const oy = d.id === "menorca" ? 16 : -8;
          IBV.t(g, clamp(d.xy[0] + ox, 10, w - 10), clamp(d.xy[1] + oy, 14, h - 10), d.nom, {
            size: mob ? 11 : 11.5, weight: 700, anchor: anc, fill: TEXT_COL[d.cat], halo: 3
          });
        }
      });

      IBV.onView(container, instant => {
        sel.selectAll("circle.mw-aur").transition().duration(instant ? 0 : 800).ease(IBV.EASE)
          .attr("r", d => rSc(d.pes));
      });

      IBV.hover(svg.node(), (ev, [mx, my]) => {
        if(!svg.node().isConnected) return;
        const best = d3.least(pts, d => Math.hypot(d.xy[0] - mx, d.xy[1] - my));
        if(best && Math.hypot(best.xy[0] - mx, best.xy[1] - my) < 55){
          IBV.focus(sel, x => x.id === best.id, { dim: 0.48 });
          tp.show(`<b>${best.nom}</b> (${best.lloc}, ~${F0(best.pes)} t) · ${best.detall}`);
        } else {
          IBV.focus(sel, null);
          tp.hide();
        }
      }, () => { if(svg.node().isConnected){ IBV.focus(sel, null); tp.hide(); } });
    }

    IBV.mount(el, (container, w) => {
      container.innerHTML = "";
      if(mode === "cronologia") drawCronologia(container, w);
      else if(worldData) drawMapa(container, w);
      else IBV.world().then(wd => { worldData = wd; container.innerHTML = ""; drawMapa(container, w); });
    });

    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      mode = b.dataset.k;
      el.innerHTML = "";
      const w = Math.round(el.clientWidth);
      if(!w) return;
      if(mode === "cronologia") drawCronologia(el, w);
      else if(worldData) drawMapa(el, w);
      else IBV.world().then(wd => { worldData = wd; el.innerHTML = ""; drawMapa(el, w); });
    }));

    renderLegend();
  })();
})();
