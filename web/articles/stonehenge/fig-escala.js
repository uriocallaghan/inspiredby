/* «Per què van aixecar Stonehenge?» · escala */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, S3 = window.SH3D, C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C);
  const {MODEL, GROUND} = window.SHA;
  const F0 = IBV.fmt(",.0f");
  const D2R = Math.PI/180;
  const ease = d3.easeCubicInOut;

  /* =========================================================================
     V10 · PLANTES A LA MATEIXA ESCALA (IB-20 + IB-16: plantes de línia fina)
     Totes les plantes del gràfic gran comparteixen escala; les quatre de 104–110 m
     i el recinte D de Göbekli Tepe es posen dins de Durrington Walls per comparar-les.
     A la lupa, el cor de Stonehenge i Göbekli D a una mateixa escala més gran.
     ========================================================================= */
  (function initEscala(){
    const el = document.getElementById("esc-viz"); if(!el) return;
    const tp = IBV.tip(el);
    const E = Object.fromEntries(D.escala.map(d => [d.id, d]));
    // pedres de Stonehenge dretes cap al 2200 aC (fase 4), en planta
    const STONES = MODEL.filter(s => s.ph[0] <= 4 && s.ph[1] >= 4 && !s.lintel && s.g !== "trineu" && s.id !== "bmov");
    const LINTELS = MODEL.filter(s => s.ph[0] <= 4 && s.ph[1] >= 4 && s.lintel);

    IBV.mount(el, (container, w) => {
      const mob = w < 640;
      // ---------- geometria del full ----------
      const DW = 490, DE = 468;                              // Durrington Walls: N–S × E–W (m)
      const callW = mob ? 0 : Math.min(150, w*.13);
      const D0 = mob ? w - 8 : Math.min(w*.56, 600);          // alçada (N–S) de Durrington en px
      const sc = D0/DW;                                       // px per metre, comú a tot el gràfic gran
      const cx = mob ? w/2 : callW + D0*DE/DW/2 + 6, cy = D0/2 + 50;
      const lupaX = mob ? 0 : cx + D0*DE/DW/2 + 46, lupaW = mob ? w : w - lupaX;
      const lsc = mob ? Math.min((w - 24)/(35 + 18 + 3), 6.6) : Math.min((lupaW - 30)/34, (D0 - 60)/(34 + 16 + 14), 8.5);
      const lupaH = mob ? 36*lsc + 104 : 0;
      const H = Math.round(mob ? cy + D0/2 + 30 + lupaH : cy + D0/2 + 34);
      const svg = IBV.svg(container, w, H, "Plantes a la mateixa escala: dins de Durrington Walls hi caben Stonehenge, Woodhenge, l'Anell de Brodgar, Waun Mawn i el recinte D de Göbekli Tepe. A la lupa, el cercle de sarsens al costat del recinte de Göbekli Tepe.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      const root = svg.append("g");
      const P = (ox, oy, s) => (x, y) => [ox + x*s, oy - y*s];   // metres (x E, y N) → px
      const polm = (r, b) => [r*Math.sin(b*D2R), r*Math.cos(b*D2R)];
      const line = d3.line();
      const groups = [];
      const mk = (id, ox, oy, rr, s, lupa) => { const g = root.append("g").datum({id, ox, oy, rr, s, lupa}).attr("class","pl"); groups.push(g); return g; };
      const ink = C.ink, ink2 = C.ink2, hw = .7;

      // anell amb buits (b0..b1 en graus, buits [[a,b],...])
      function ring(g, f, rx, ry, gaps, o){
        o = o||{}; const segs = []; let cur = [];
        for(let b=0; b<=360; b+=1.5){
          const inGap = (gaps||[]).some(([a,c]) => { const bb = ((b - a)%360 + 360)%360, span = ((c - a)%360 + 360)%360; return bb <= span; });
          if(inGap){ if(cur.length > 1) segs.push(cur); cur = []; continue; }
          cur.push(f(rx*Math.sin(b*D2R), ry*Math.cos(b*D2R)));
        }
        if(cur.length > 1) segs.push(cur);
        return g.append("path").attr("d", segs.map(s => line(s)).join("")).attr("fill","none")
          .attr("stroke", o.stroke||ink).attr("stroke-width", o.sw||hw).attr("stroke-dasharray", o.dash||null).attr("stroke-opacity", o.op==null?1:o.op);
      }
      // ratllat radial entre dos radis (talús o fossat)
      function hatch(g, f, r0x, r0y, r1x, r1y, gaps, step, o){
        o = o||{}; let d = "", k = 0;
        for(let b=0; b<360; b+=step, k++){
          if((gaps||[]).some(([a,c]) => { const bb = ((b - a)%360 + 360)%360, span = ((c - a)%360 + 360)%360; return bb <= span; })) continue;
          const L = k%2 ? .55 : 1, s = Math.sin(b*D2R), c = Math.cos(b*D2R);
          const p0 = f(r0x*s, r0y*c), p1 = f((r0x + (r1x - r0x)*L)*s, (r0y + (r1y - r0y)*L)*c);
          d += `M${p0[0].toFixed(1)},${p0[1].toFixed(1)}L${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
        }
        return g.append("path").attr("d", d).attr("stroke", o.stroke||C.ghost).attr("stroke-width", o.sw||.5).attr("fill","none");
      }
      // bloc rectangular en planta (amplada w al llarg del rumb rot, gruix t)
      function slab(g, f, x, y, rot, wl, th, o){
        o = o||{}; const a = rot*D2R, ux = Math.sin(a), uy = Math.cos(a), nx = -uy, ny = ux;
        const pts = [[1,1],[1,-1],[-1,-1],[-1,1]].map(([i,j]) => f(x + ux*wl/2*i + nx*th/2*j, y + uy*wl/2*i + ny*th/2*j));
        return g.append("path").attr("d", line(pts) + "Z").attr("fill", o.fill||"#fff").attr("stroke", o.stroke||ink).attr("stroke-width", o.sw||.6).attr("stroke-linejoin","round");
      }

      // ---------- Durrington Walls (490 × 468 m, talús exterior de ~40 m, fossat de fins a 17,6 m, entrades NW i SE) ----------
      const fD = P(cx, cy, sc), gD = mk("durrington", cx, cy, DW/2, sc);
      const gapsD = [[305, 322], [125, 142]];
      const R = (a) => [DE/2 - a, DW/2 - a];
      hatch(gD, fD, ...R(0), ...R(40), gapsD, mob?2.4:1.4, {stroke:C.ghost});
      ring(gD, fD, ...R(0), gapsD, {sw:.8});
      ring(gD, fD, ...R(40), gapsD, {sw:.6, stroke:ink2});
      hatch(gD, fD, ...R(57.6), ...R(42), gapsD, mob?3:1.8, {stroke:IBV.alpha(C.ink,.35), sw:.45});
      ring(gD, fD, ...R(42), gapsD, {sw:.75});
      ring(gD, fD, ...R(57.6), gapsD, {sw:.75});
      // riu Avon cap al SE (direcció, no traçat)
      { const a = fD(...polm(DW/2 + 6, 133)), b = fD(...polm(DW/2 + (mob?26:44), 133));
        gD.append("path").attr("d", `M${a}L${b}`).attr("stroke", IBV.alpha(C.blau,.7)).attr("stroke-width",1).attr("marker-end",null);
        IBV.t(gD, b[0] + (mob?-4:4), b[1] + 12, "cap a l'Avon", {size:11, italic:true, fill:C.blau, anchor: mob?"end":"start", halo:true}); }
      gD.append("text").attr("x", cx).attr("y", cy - D0/2 - 30).attr("text-anchor","middle").attr("font-size", 12.5).attr("font-weight",700).attr("fill",ink).text("Durrington Walls").call(IBV.halo);
      IBV.t(gD, cx, cy - D0/2 - 15, `${F0(490)} × ${F0(468)} m · c. 2500 aC`, {size:11.5, anchor:"middle", fill:ink2, halo:true}).attr("dy", -1);

      // ---------- quatre plantes de ~110 m i Göbekli D dins de Durrington ----------
      const o = 66;
      const cells = { stonehenge:[-o, o], woodhenge:[o, o], brodgar:[-o, -o], waunmawn:[o, -o], gobekli:[0, 0] };
      const lab = [];

      // Stonehenge: fossat, talús, forats Aubrey, Station Stones i pedres de la fase 4
      function drawStonehenge(g, f, s, core){
        if(!core){
          GROUND.filter(q => (q.k === "ditch" || q.k === "bank") && q.pts).forEach(q => g.append("path").attr("d", line(q.pts.map(p => f(p[0], p[1])))).attr("fill","none").attr("stroke", q.k==="ditch" ? C.vermell : IBV.alpha(C.vermell,.55)).attr("stroke-width", q.k==="ditch" ? .8 : .55));
          GROUND.filter(q => q.hach).forEach(q => g.append("path").attr("d", q.hach.map(h => line(h.map(p => f(p[0], p[1])))).join("")).attr("stroke", IBV.alpha(C.vermell,.28)).attr("stroke-width",.4));
          GROUND.filter(q => q.k === "hole" && q.ph[0] === 1).forEach(q => { const p = f(q.c[0], q.c[1]); g.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r", Math.max(.75, .55*s)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",.5); });
          // primer tram de l'Avinguda
          GROUND.filter(q => q.k === "avenue").forEach(q => { const pts = q.pts.filter(p => Math.hypot(p[0],p[1]) < 56 + 14); g.append("path").attr("d", line(pts.map(p => f(p[0],p[1])))).attr("fill","none").attr("stroke",IBV.alpha(C.vermell,.45)).attr("stroke-width",.5); });
        }
        const list = core ? STONES.filter(q => Math.hypot(q.x, q.y) < 18) : STONES.filter(q => q.g !== "talo" || Math.hypot(q.x,q.y) < 70);
        if(s > 3){ // a la lupa, les llindes com a arcs fins per sobre
          LINTELS.filter(q => q.arc).forEach(q => { const [b0,b1,r] = q.arc, pts = d3.range(0,1.0001,.1).map(t => f(...polm(r, b0 + (b1-b0)*t))); g.append("path").attr("d", line(pts)).attr("fill","none").attr("stroke", IBV.alpha(C.vermell,.22)).attr("stroke-width", 1.0*s).attr("stroke-linecap","butt"); });
        }
        list.forEach(q => slab(g, f, q.x, q.y, q.rot, q.w, q.t, {fill: q.g === "blava" ? IBV.alpha(C.blau,.22) : IBV.alpha(C.vermell, s > 3 ? .14 : .3), stroke: q.g === "blava" ? C.blau : C.vermell, sw: s > 3 ? .8 : .45}));
      }
      // Woodhenge: talús (fins a 10 m) i fossat (fins a 12 m) en un total de 110 m; sis anells de pals (esquemàtics); entrada al NNE
      function drawWoodhenge(g, f, s){
        const gap = [[14, 32]];
        hatch(g, f, 55, 55, 45, 45, gap, 3, {stroke:C.ghost});
        ring(g, f, 55, 55, gap, {sw:.7}); ring(g, f, 45, 45, gap, {sw:.55, stroke:ink2});
        hatch(g, f, 33, 33, 44, 44, gap, 4, {stroke:IBV.alpha(C.ink,.3), sw:.45});
        ring(g, f, 44, 44, gap, {sw:.7}); ring(g, f, 33, 33, gap, {sw:.7});
        const RR = [4.5, 7.5, 10.5, 14, 17.5, 21];  // esquemàtic: sis anells ovals amb l'eix al NNE
        RR.forEach((r, i) => { const n = Math.round(r*1.15) + 6; for(let k=0;k<n;k++){ const b = 22 + k*360/n, p = f(r*.92*Math.sin(b*D2R), r*Math.cos(b*D2R));
          g.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r", Math.max(.7, (.35 + i*.06)*s)).attr("fill", IBV.alpha(C.ink,.55)).attr("stroke","none"); } });
      }
      // Anell de Brodgar: 60 pedres originals en un cercle de 104 m i fossat de 136 m
      function drawBrodgar(g, f, s){
        hatch(g, f, 65, 65, 71, 71, [], 3, {stroke:IBV.alpha(C.ink,.3), sw:.45});
        ring(g, f, 65, 65, [[352, 8], [172, 188]], {sw:.7}); ring(g, f, 71, 71, [[352, 8], [172, 188]], {sw:.7});
        for(let k=0;k<60;k++){ const b = k*6; const [x,y] = polm(52, b); slab(g, f, x, y, b + 90, 1.6, .5, {fill:"#fff", stroke:ink, sw:.5}); }
      }
      // Waun Mawn: cercle desmantellat i discutit, de diàmetre «idèntic» al fossat de Stonehenge
      function drawWaun(g, f, s){
        ring(g, f, 55, 55, [], {sw:.8, dash:"3 3", stroke:ink2});
        IBV.t(g, ...f(0, 0), "en debat", {size:11, italic:true, anchor:"middle", fill:C.muted, halo:true}).attr("dy", 4);
      }
      // Göbekli Tepe, recinte D: ~14 m d'interior; dos pilars en T centrals (fins a 5,5 m d'alt); mur i pilars perimetrals esquemàtics
      function drawGobekli(g, f, s){
        const wall = d3.range(0, 361, 6).map(b => f(7.6*Math.sin(b*D2R)*(1 + .05*Math.sin(3*b*D2R)), 7.0*Math.cos(b*D2R)*(1 + .04*Math.cos(2*b*D2R))));
        const wall2 = d3.range(0, 361, 6).map(b => f(8.9*Math.sin(b*D2R)*(1 + .05*Math.sin(3*b*D2R)), 8.3*Math.cos(b*D2R)*(1 + .04*Math.cos(2*b*D2R))));
        g.append("path").attr("d", line(wall2) + line(wall.slice().reverse())).attr("fill", IBV.alpha(C.ink,.06)).attr("stroke", ink).attr("stroke-width", s > 3 ? .8 : .5);
        if(s > 3){ for(let k=0;k<11;k++){ const b = 15 + k*360/11, [x,y] = [7.1*Math.sin(b*D2R), 6.6*Math.cos(b*D2R)]; slab(g, f, x, y, b, 1.5, .5, {fill:"#fff", stroke:ink, sw:.7}); } }
        // pilars centrals en T (vistos des de dalt: el cap és més ample que el fust)
        [[-1.4, .2], [1.4, -.2]].forEach(([x, y]) => { slab(g, f, x, y, 160, 3.0, .9, {fill:IBV.alpha(C.ink,.12), stroke:ink, sw: s > 3 ? .9 : .5}); });
      }
      const DRAW = { stonehenge:drawStonehenge, woodhenge:drawWoodhenge, brodgar:drawBrodgar, waunmawn:drawWaun, gobekli:drawGobekli };
      Object.entries(cells).forEach(([id, [mx, my]]) => {
        const [ox, oy] = fD(mx, my), g = mk(id, ox, oy, (id==="brodgar"?71:id==="gobekli"?9:56)*sc, sc);
        DRAW[id](g, P(ox, oy, sc), sc);
        const d = E[id], top = my > 0;
        if(id === "gobekli"){
          const tx = ox + (mob ? 0 : 0), ty = oy + 24;
          lab.push({g, x:tx, y:ty - 4, anchor:"middle", lines:[[`${d.curt} · 14 m`, true, ink]]});
        } else {
          const rr = (id==="brodgar" ? 71 : 56)*sc, ty = top ? oy - rr - (mob ? 18 : 22) : oy + rr + (mob ? 13 : 16);
          lab.push({g, x:ox, y:ty, anchor:"middle", lines: mob ? [[d.curt, true, id==="stonehenge"?C.vermell:ink]] : [[d.curt, true, id==="stonehenge"?C.vermell:ink], [`${F0(d.d)} m · ${d.data}`]]});
        }
      });
      lab.forEach(L => IBV.lines(L.g, L.x, L.y, L.lines, {size: mob ? 11 : 12, anchor:L.anchor, halo:true}));

      // escala gràfica de 100 m
      { const sx = mob ? 8 : callW - 4 > 20 ? 14 : 8, sy = cy + D0/2 + (mob ? 14 : 10);
        const g = root.append("g");
        g.append("path").attr("d", `M${sx},${sy-4}V${sy}H${sx+100*sc}V${sy-4}M${sx+50*sc},${sy}V${sy-2.5}`).attr("fill","none").attr("stroke",ink).attr("stroke-width",.8);
        IBV.t(g, sx + 100*sc + 6, sy + 1, "100 m", {size:11.5, fill:ink2, base:"middle"}); }
      // nota lateral a l'escriptori: què hi cap
      if(!mob){
        const g = root.append("g");
        IBV.lines(g, 0, cy - 40, [["Hi caben tots", true], ["Quatre recintes de"], ["104–110 m i el de"], ["Göbekli Tepe, dins"], ["del fossat d'un sol"], ["henge de fusta."]], {size:12, fill:ink2});
      }

      // ---------- lupa: el cor de Stonehenge i Göbekli D a la mateixa escala gran ----------
      const lg = root.append("g");
      let lx0, ly0;
      if(mob){ lx0 = w/2; ly0 = cy + D0/2 + 50; } else { lx0 = lupaX + (lupaW - 10)/2; ly0 = 40; }
      const shC = mob ? [8 + 17.5*lsc, ly0 + 18*lsc + 22] : [lx0, ly0 + 18*lsc + 20];
      const gbC = mob ? [w - 8 - 9*lsc, shC[1] + 4*lsc] : [lx0, shC[1] + 18*lsc + 9*lsc + 54];
      {
        const g1 = mk("sarsens", shC[0], shC[1], 17*lsc, lsc, true);
        drawStonehenge(g1, P(shC[0], shC[1], lsc), lsc, true);
        const g2 = mk("gobekli", gbC[0], gbC[1], 9*lsc, lsc, true);
        drawGobekli(g2, P(gbC[0], gbC[1], lsc), lsc);
        // persones vistes des de dalt (espatlles de ~0,45 m i cap), per a l'escala humana
        const person = (g, x, y) => { const pg = g.append("g").attr("transform", `translate(${x},${y})`);
          pg.append("ellipse").attr("rx", .24*lsc).attr("ry", .13*lsc).attr("fill", ink);
          pg.append("circle").attr("r", .11*lsc).attr("cy", -.02*lsc).attr("fill", "#fff").attr("stroke", ink).attr("stroke-width",.6); };
        person(g1, shC[0] + 1.2*lsc, shC[1] + 1.8*lsc);
        person(g2, gbC[0] + 3.2*lsc, gbC[1] + 2.2*lsc);
        IBV.lines(g1, shC[0], shC[1] - 17.5*lsc - 12, [["Cercle de sarsens", true, C.vermell], ["30 m · c. 2500 aC"]], {size:12, anchor:"middle", halo:true});
        IBV.lines(g2, gbC[0], gbC[1] + 9*lsc + 18, [[mob ? "Göbekli D" : "Göbekli Tepe, recinte D", true], ["~14 m · c. 9500 aC"]], {size:12, anchor:"middle", halo:true});
        // escala de 10 m i persona
        const sx = mob ? 10 : lupaX + 4, sy = mob ? ly0 + 36*lsc + 70 : gbC[1] + 9*lsc + 64;
        lg.append("path").attr("d", `M${sx},${sy-4}V${sy}H${sx+10*lsc}V${sy-4}`).attr("fill","none").attr("stroke",ink).attr("stroke-width",.8);
        IBV.t(lg, sx + 10*lsc + 6, sy + 1, "10 m", {size:11.5, fill:ink2, base:"middle"});
        const pp = lg.append("g").attr("transform", `translate(${sx + 10*lsc + 52},${sy - 2})`);
        pp.append("ellipse").attr("rx", .24*lsc).attr("ry", .13*lsc).attr("fill", ink);
        pp.append("circle").attr("r", .11*lsc).attr("fill", "#fff").attr("stroke", ink).attr("stroke-width",.6);
        IBV.t(lg, sx + 10*lsc + 62, sy + 1, "una persona vista des de dalt", {size:11.5, fill:ink2, base:"middle"});
        // marc de la lupa
        const lab2 = mob ? "Lupa: ×" + F0(lsc/sc) : "La lupa: ×" + F0(lsc/sc);
        IBV.t(lg, mob ? 10 : lupaX + 4, mob ? ly0 - 8 : 18, lab2, {size:12, weight:700, fill:ink});
        // guia des del cercle de sarsens petit cap a la lupa
        const [sx0, sy0] = fD(...cells.stonehenge);
        const r0 = 17*sc;
        if(!mob){
          lg.append("circle").attr("cx", sx0).attr("cy", sy0).attr("r", r0).attr("fill","none").attr("stroke",ink).attr("stroke-width",.6).attr("stroke-dasharray","2 2");
          const [gx0, gy0] = fD(0, 0);
          lg.append("circle").attr("cx", gx0).attr("cy", gy0).attr("r", 11*sc).attr("fill","none").attr("stroke",ink).attr("stroke-width",.6).attr("stroke-dasharray","2 2");
          IBV.t(lg, lupaX + 4, 34, "els dos cercles puntejats, ampliats", {size:11.5, fill:C.muted});
        } else {
          lg.append("line").attr("x1", 10).attr("x2", w - 10).attr("y1", ly0 - 26).attr("y2", ly0 - 26).attr("stroke", C.hair).attr("stroke-width", .8);
        }
      }

      // ---------- entrada animada ----------
      IBV.onView(container, inst => {
        if(inst) return;
        root.selectAll("g.pl").each(function(d, i){
          const g = d3.select(this), k = d.id === "durrington" ? 0 : i;
          g.attr("opacity", 0).attr("transform", d.id === "durrington" ? null : `translate(${d.ox},${d.oy}) scale(.2) translate(${-d.ox},${-d.oy})`)
            .transition().delay(d.id === "durrington" ? 0 : 700 + k*260).duration(d.id === "durrington" ? 900 : 1000).ease(ease)
            .attr("opacity", 1).attr("transform", `translate(${d.ox},${d.oy}) scale(1) translate(${-d.ox},${-d.oy})`);
        });
        lg.attr("opacity", 0).transition().delay(700 + groups.length*260).duration(800).attr("opacity", 1);
      });

      // ---------- hover ----------
      const all = root.selectAll("g.pl");
      IBV.hover(svg.node(), (ev, [x, y]) => {
        const hit = groups.map(g => g.datum()).filter(d => Math.hypot(x - d.ox, y - d.oy) < Math.max(14, d.rr + 4)).sort((a, b) => a.rr - b.rr)[0];
        if(!hit){ IBV.focus(all, null); tp.hide(); return; }
        const id = hit.id === "durrington" && Math.hypot(x - hit.ox, y - hit.oy) < (DW/2 - 58)*sc ? null : hit.id;
        if(!id){ IBV.focus(all, null); tp.hide(); return; }
        IBV.focus(all, q => q.id === id || (id === "durrington" && q.lupa !== true && false) || (id === "sarsens" && q.id === "stonehenge"));
        const d = E[id] || E.sarsens;
        tp.show(`<b>${d.nom}</b> · ${id==="durrington" ? "490 × 468" : F0(d.d)} m · ${d.data} · ${d.det}`);
      }, () => { IBV.focus(all, null); tp.hide(); });
    });
  })();
})();
