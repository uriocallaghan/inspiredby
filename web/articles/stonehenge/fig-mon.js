/* «Per què van aixecar Stonehenge?» · mon */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, C = IBV.C;
  const {segBind, clamp} = window.SHA;
  const F0 = IBV.fmt(",.0f");
  const ease = d3.easeCubicInOut;
  const yr = y => y < 0 ? `${F0(-y)} aC` : `${y} dC`;
  const span = d => d.fi >= 2026 ? `${d.inici} dC – avui` : d.inici < 0 && d.fi < 0 ? `${F0(-d.inici)}–${F0(-d.fi)} aC` : d.inici > 0 ? `${d.inici}–${d.fi} dC` : `${yr(d.inici)} – ${yr(d.fi)}`;

  /* ---------- glifs de línia: la forma de cada tradició megalítica (esquemes, no plànols) ---------- */
  // Dibuixa dins d'una caixa de s × s píxels centrada a (x, y), amb la línia de terra a baix.
  function glyph(g, id, x, y, s, col){
    const G = g.append("g").attr("class","gl").attr("transform", `translate(${x},${y}) scale(${s/2})`);
    const st = {fill:"#fff", stroke: col||C.ink, "stroke-width": 1.6/(s/2)*0.62, "stroke-linejoin":"round", "stroke-linecap":"round"};
    const P = (d, o) => { const p = G.append("path").attr("d", d); Object.entries(Object.assign({}, st, o||{})).forEach(([k,v]) => p.attr(k, v)); return p; };
    P("M-1,1H1", {fill:"none"}); // terra
    switch(id){
      case "gobekli":   // pilar en T
        P("M-.16,1V-.45H-.62V-.85H.5V-.45H.16V1Z"); P("M-.05,-.1V.6", {fill:"none", "stroke-width": st["stroke-width"]*.6}); break;
      case "nabta":     // anell de pedres petites
        for(let k=0;k<9;k++){ const a = k/9*Math.PI*2, cx = Math.cos(a)*.8, cy = .62 + Math.sin(a)*.24, h = .26 + (k%3)*.05; P(`M${cx-.07},${cy}V${cy-h}H${cx+.07}V${cy}Z`); } break;
      case "carnac":    // fileres de menhirs
        [[.9,.95,-.85],[.55,.7,-.6],[.35,.45,-.35]].forEach(([h,yb,x0]) => { for(let k=0;k<5;k++){ const cx = x0 + k*(.42 - (.95-yb)*.25), w = .09*h/.9 + .03; P(`M${cx-w},${yb}C${cx-w},${yb-h*.7} ${cx-w*.6},${yb-h} ${cx},${yb-h}C${cx+w*.7},${yb-h} ${cx+w},${yb-h*.6} ${cx+w},${yb}Z`); } }); break;
      case "newgrange": // túmul amb vorada i corredor
        P("M-1,1C-.9,.05 -.5,-.25 0,-.25C.5,-.25 .9,.05 1,1Z"); P("M-.95,.7Q0,.55 .95,.7", {fill:"none"}); P("M-.1,1V.62H.1V1Z", {fill: col||C.ink}); break;
      case "stonehenge":// trílit
        P("M-.62,1V-.42H-.2V1Z"); P("M.2,1V-.42H.62V1Z"); P("M-.72,-.42V-.72H.72V-.42Z"); break;
      case "brodgar":   // anell de lloses primes i altes
        [[-.85,.5],[-.48,.9],[-.1,.65],[.3,1.0],[.68,.6]].forEach(([cx,h]) => P(`M${cx-.09},1V${1-h*1.6+.15}L${cx+.11},${1-h*1.6}V1Z`)); break;
      case "menorca":   // taula dins del recinte
        P("M-1,1V.35Q0,.05 1,.35V1", {fill:"none", "stroke-width": st["stroke-width"]*.6}); P("M-.16,1V-.45H.16V1Z"); P("M-.7,-.45V-.75H.7V-.45Z"); break;
      case "rapanui":   // moai
        P("M-.42,1V.15C-.45,-.25 -.38,-.6 -.3,-.88H.22C.3,-.75 .34,-.6 .3,-.45L.4,-.2L.3,-.1C.36,.1 .44,.5 .42,1Z"); P("M-.3,-.55H.2", {fill:"none", "stroke-width": st["stroke-width"]*.6}); break;
      case "sumba":     // tomba de llosa sobre potes
        P("M-.62,1V.25H-.4V1Z"); P("M.4,1V.25H.62V1Z"); P("M-.95,.25V-.05H.95V.25Z"); P("M-.3,-.05L-.15,-.5H.15L.3,-.05", {fill:"none"}); break;
    }
    return G;
  }

  /* =========================================================================
     V11 · DOTZE MIL ANYS MOVENT PEDRES (TIME-15 lineal + MAP-03)
     ========================================================================= */
  (function initMon(){
    const el = document.getElementById("mon-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el);
    let view = "cronologia", W = 0, anim = null;
    let switched = false;
    const play = (c, cb) => switched && !IBV.reduced ? cb(false) : IBV.onView(c, cb);
    segBind(fig.querySelector(".seg"), "k", k => { view = k; switched = true; draw(el, W); switched = false; });
    const M = D.mon.slice().sort((a,b) => a.inici - b.inici);
    const colOf = d => d.id === "stonehenge" ? C.vermell : d.id === "menorca" ? C.blau : C.ink;

    function draw(container, w){
      W = w; if(anim){ anim.stop(); anim = null; }
      d3.select(container).selectAll("svg").remove();
      const mob = w < 800; // a tauleta vertical, les cotes llargues s'encavalquen
      (view === "cronologia" ? cronologia : mapa)(container, w, mob);
    }

    /* ---------- cronologia ---------- */
    function cronologia(container, w, mob){
      const labW = mob ? 0 : 210, rightW = mob ? 0 : 74, rowH = mob ? 58 : 46, top = 40;
      const H = top + M.length*rowH + (mob ? 120 : 96);
      const svg = IBV.svg(container, w, H, "Línia de temps de megàlits del món des de Göbekli Tepe (9600 aC) fins a Sumba avui, amb Stonehenge entre el 3000 i el 1500 aC.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      const x = d3.scaleLinear().domain([-10000, 2100]).range([labW + 8, w - rightW - 12]);
      const g = svg.append("g"), yBot = top + M.length*rowH - 8;
      // retícula de mil·lennis
      d3.range(-10000, 2001, 1000).forEach(v => {
        const major = v % 2000 === 0 || v === 0;
        g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", top - 12).attr("y2", yBot).attr("stroke", v === 0 ? C.ghost : major ? C.grid : IBV.alpha(C.grid, .6)).attr("stroke-width", .6);
        if(major && !(v === 2000 && !mob) && (!mob || v % 4000 === 0 || v === 0)) IBV.t(g, x(v), top - 18, v < 0 ? `${F0(-v)} aC` : v === 0 ? "0" : `${v} dC`, {size:11.5, anchor:"middle", fill:C.muted});
      });
      // avui
      g.append("line").attr("x1", x(2026)).attr("x2", x(2026)).attr("y1", top - 12).attr("y2", yBot + 6).attr("stroke", C.ink).attr("stroke-width", .8).attr("stroke-dasharray", "2 2");
      if(!mob) IBV.t(g, x(2026) + 4, top - 18, "avui", {size:11.5, fill:C.ink2});
      if(!mob) IBV.t(g, w - rightW/2, top - 18, "pedra gran", {size:11.5, anchor:"middle", fill:C.muted});

      const rows = g.selectAll("g.r").data(M).join("g").attr("class","r").attr("transform", (d,i) => `translate(0,${top + i*rowH + rowH/2})`).style("cursor","pointer");
      rows.each(function(d){
        const r = d3.select(this), col = colOf(d), sh = d.id === "stonehenge";
        const gx = mob ? 14 : 16, by = mob ? 12 : 0;
        glyph(r, d.id, gx, mob ? -12 : -2, mob ? 22 : 26, col);
        if(mob){
          IBV.t(r, 32, -12, d.nom, {size:12.5, weight: sh ? 700 : 600, fill: sh ? C.vermell : C.ink, base:"middle"});
          IBV.t(r, w - 4, -12, `${span(d)} · ${d.pes < 1 ? "<1" : F0(d.pes)} t`, {size:11, anchor:"end", fill:C.muted, base:"middle", halo:true});
        } else {
          IBV.t(r, 38, -5, d.nom, {size:12.5, weight: sh ? 700 : 600, fill: sh ? C.vermell : C.ink});
          IBV.t(r, 38, 10, d.lloc, {size:11.5, fill:C.muted});
        }
        const x0 = x(d.inici), x1 = Math.max(x(d.fi), x0 + 3);
        const band = r.append("rect").attr("class","band").attr("x", x0).attr("y", by - 6).attr("height", 12).attr("rx", 1.5)
          .attr("fill", IBV.alpha(col, sh ? .2 : .1)).attr("stroke", col).attr("stroke-width", sh ? 1.2 : .8).attr("width", x1 - x0);
        // ratllat fi dins la banda, com un gravat
        const hid = `mh-${d.id}`;
        r.append("clipPath").attr("id", hid).append("rect").attr("x", x0).attr("y", by - 6).attr("width", x1 - x0).attr("height", 12);
        let hd = ""; for(let xx = x0 - 12; xx < x1; xx += 4) hd += `M${xx},${by+6}L${xx+12},${by-6}`;
        r.append("path").attr("class","hatch").attr("d", hd).attr("stroke", IBV.alpha(col, .35)).attr("stroke-width", .5).attr("clip-path", `url(#${hid})`);
        if(!mob){
          const lbl = span(d), tx = x1 + 6 + IBV.FS.small*.52*lbl.length > w - rightW - 4 ? x0 - 6 : x1 + 6;
          IBV.t(r, tx, by + 4, lbl, {size:11.5, fill:C.ink2, anchor: tx < x0 ? "end" : "start", halo:true});
          // pes de la pedra més grossa, àrea proporcional
          const rr = Math.sqrt(d.pes)*2.1 + .8;
          r.append("circle").attr("cx", w - rightW + 22).attr("cy", 0).attr("r", rr).attr("fill", IBV.alpha(col, .14)).attr("stroke", col).attr("stroke-width", .8);
          IBV.t(r, w - rightW + 38, 4, `${d.pes < 1 ? "<1" : F0(d.pes)} t`, {size:11.5, fill:C.ink2});
        }
      });
      // dues distàncies que canvien la perspectiva
      const sh = M.find(d => d.id === "stonehenge"), gb = M[0];
      const by1 = yBot + 30, by2 = yBot + (mob ? 76 : 30);
      const brk = (xa, xb, y, lines, col, anc) => {
        g.append("path").attr("d", `M${xa},${y-5}V${y}H${xb}V${y-5}`).attr("fill","none").attr("stroke", col).attr("stroke-width", .9);
        IBV.lines(g, anc === "start" ? xa : anc === "end" ? xb : (xa + xb)/2, y + 16, lines, {size: mob ? 11.5 : 12, anchor: anc||"middle", fill: col});
      };
      brk(x(gb.inici), x(sh.inici) - 3, by1, [[`${F0(Math.round((sh.inici - gb.inici)/100)*100)} anys`, true], [mob ? "de Göbekli Tepe a Stonehenge" : "separen els pilars de Göbekli Tepe del fossat de Stonehenge"]], C.ink, mob ? "start" : "middle");
      brk(x(sh.inici) + 3, x(2026), by2, [[`${F0(Math.round((2026 - sh.inici)/100)*100)} anys`, true, C.vermell], [mob ? "de Stonehenge a avui" : "de Stonehenge a nosaltres"]], C.vermell, mob ? "end" : "middle");

      // entrada animada: les bandes creixen per ordre cronològic
      play(container, inst => {
        if(inst) return;
        rows.each(function(d, i){
          const r = d3.select(this), x0 = x(d.inici), x1 = Math.max(x(d.fi), x0 + 3);
          r.attr("opacity", 0).transition().delay(i*140).duration(500).attr("opacity", 1);
          r.select("rect.band").attr("width", 0).transition().delay(i*140 + 200).duration(900).ease(ease).attr("width", x1 - x0);
          r.select("clipPath rect").attr("width", 0).transition().delay(i*140 + 200).duration(900).ease(ease).attr("width", x1 - x0);
        });
      });
      IBV.hover(svg.node(), (ev, [px, py]) => {
        const i = Math.floor((py - top)/rowH);
        if(i < 0 || i >= M.length){ IBV.focus(rows, null); tp.hide(); return; }
        const d = M[i];
        IBV.focus(rows, q => q === d);
        tp.show(`<b>${d.nom}</b> · ${d.lloc} · ${span(d)} · ${d.detall}`);
      }, () => { IBV.focus(rows, null); tp.hide(); });
    }

    /* ---------- mapa (terra plana, sense relleu: mapa del món) ---------- */
    function mapa(container, w, mob){
      const H = Math.round(mob ? w*.72 + 40 : Math.min(w*.5, 560));
      const svg = IBV.svg(container, w, H, "Mapa del món amb els grans jaciments megalítics, de Göbekli Tepe a Sumba, apareixent per ordre cronològic.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      const box = {type:"MultiPoint", coordinates: mob ? [[-112,-30],[124,-30],[-112,62],[124,62]] : [[-112,-32],[125,-32],[-112,63],[125,63]]};
      const proj = d3.geoNaturalEarth1().fitExtent([[mob?6:40, mob?66:28], [w - 6, H - 6]], box);
      const path = d3.geoPath(proj);
      svg.append("clipPath").attr("id","mon-clip").append("rect").attr("width", w).attr("height", H);
      const g = svg.append("g").attr("clip-path","url(#mon-clip)");
      const gl = g.append("g"), gs = svg.append("g");
      gl.append("path").attr("d", path(d3.geoGraticule10())).attr("fill","none").attr("stroke", C.grid).attr("stroke-width", .5);
      IBV.world().then(wd => {
        // sense l'Antàrtida (fora del marc) per evitar que el polígon s'inverteixi en retallar el món
        const land = {type:"FeatureCollection", features: wd.countries.features.filter(f => f.id !== "010" && path.area(f) < w*H*.25)};
        gl.insert("path", ":first-child").attr("d", path(land)).attr("fill", C.land).attr("stroke", C.land).attr("stroke-width", .6);
      });

      // posicions de les etiquetes: els jaciments europeus, en columna a l'Atlàntic amb una guia
      const EU = new Set(["carnac","newgrange","stonehenge","brodgar","menorca"]);
      const pts = M.map(d => ({d, p: proj([d.lon, d.lat])}));
      const eu = pts.filter(q => EU.has(q.d.id)).sort((a,b) => a.p[1] - b.p[1]);
      const colX = proj([mob ? -40 : -24, 50])[0];
      let yy = -Infinity; const lh = mob ? 30 : 34;
      const yMid = d3.mean(eu, q => q.p[1]), start = yMid - (eu.length - 1)*lh/2;
      eu.forEach((q, i) => { q.lx = colX; q.ly = Math.max(start + i*lh, yy + lh, mob ? 78 : 0); yy = q.ly; q.anc = "end"; });
      pts.filter(q => !EU.has(q.d.id)).forEach(q => {
        const rr = Math.sqrt(q.d.pes)*2.4 + 3, tw = Math.max(q.d.nom.replace(" (Moai)", "").length, span(q.d).length)*(mob ? 5.9 : 6.4) + 24;
        q.right = q.p[0] + rr + 6 + tw < w - 2;
        q.anc = q.right ? "start" : "side"; q.lx = q.right ? q.p[0] + rr + 6 : q.p[0] - rr - 6; q.ly = q.p[1] + 4;
        if(mob && q.d.id === "nabta"){ q.ly += 14; }
      });

      const sites = gs.selectAll("g.s").data(pts).join("g").attr("class","s").style("cursor","pointer");
      sites.each(function(q){
        const s = d3.select(this), d = q.d, col = colOf(d), rr = Math.sqrt(d.pes)*2.4 + 3;
        s.append("circle").attr("class","halo").attr("cx", q.p[0]).attr("cy", q.p[1]).attr("r", rr).attr("fill", IBV.alpha(col, .12)).attr("stroke", col).attr("stroke-width", d.id === "stonehenge" ? 1.2 : .8);
        s.append("circle").attr("cx", q.p[0]).attr("cy", q.p[1]).attr("r", 1.8).attr("fill", col);
        if(q.anc === "end"){
          s.append("path").attr("d", `M${q.p[0] - rr*.7},${q.p[1]}L${q.lx + 30},${q.ly - 4}L${q.lx + 4},${q.ly - 4}`).attr("fill","none").attr("stroke", C.ghost).attr("stroke-width", .7);
          glyph(s, d.id, q.lx + 18, q.ly - 8, 18, col);
          IBV.lines(s, q.lx, q.ly - 8, [[d.nom, true, d.id === "stonehenge" ? C.vermell : C.ink], [span(d)]], {size: mob ? 11 : 12, anchor:"end", halo:true});
        } else if(q.right){
          glyph(s, d.id, q.lx + 9, q.ly - 8, 18, col);
          IBV.lines(s, q.lx + 22, q.ly - 8, [[d.nom.replace(" (Moai)", ""), true], [span(d)]], {size: mob ? 11 : 12, anchor:"start", halo:true});
        } else {
          glyph(s, d.id, q.lx - 9, q.ly - 8, 18, col);
          IBV.lines(s, q.lx - 22, q.ly - 8, [[d.nom.replace(" (Moai)", ""), true], [span(d)]], {size: mob ? 11 : 12, anchor:"end", halo:true});
        }
      });
      // comptador d'anys gran, en tipografia de títol
      const yearT = IBV.t(svg, mob ? 8 : 40, mob ? 20 : 30, "", {size: mob ? 22 : 30, serif:true, fill:C.ink});
      const yearS = IBV.t(svg, mob ? 8 : 40, mob ? 38 : 50, "", {size:11.5, fill:C.muted});
      const setYear = y => yearT.text(y >= 2026 ? "Avui" : y < 0 ? `${F0(-Math.round(y/50)*50)} aC` : `${Math.round(y/10)*10} dC`);
      // l'àrea del cercle és el pes de la pedra més gran
      if(!mob){
        const lg = svg.append("g").attr("transform", `translate(${w - 150},${H - 54})`);
        [5, 25].forEach((t, i) => { const rr = Math.sqrt(t)*2.4 + 3; lg.append("circle").attr("cx", 14).attr("cy", 30 - rr).attr("r", rr).attr("fill","none").attr("stroke", C.ink2).attr("stroke-width", .7);
          IBV.t(lg, 14, 30 - 2*rr - 3, `${t} t`, {size:11, anchor:"middle", fill:C.ink2}); });
        IBV.lines(lg, 34, 14, [["Àrea: pes de la"], ["pedra més grossa"]], {size:11.5, fill:C.muted});
      }
      const showAll = () => { sites.attr("opacity", 1); setYear(2026); yearS.text("els nou jaciments, per ordre d'aparició"); };
      play(container, inst => {
        if(inst){ showAll(); return; }
        sites.attr("opacity", 0);
        let i = 0; const step = 700;
        yearS.text("any en què s'hi comença a aixecar pedres");
        const tick = () => {
          if(i >= pts.length){ setYear(2026); return; }
          const q = pts[i], prev = i ? pts[i-1].d.inici : q.d.inici - 400;
          d3.select(sites.nodes()[i]).transition().duration(600).attr("opacity", 1)
            .select("circle.halo").attr("r", 0).transition().duration(700).ease(d3.easeBackOut).attr("r", Math.sqrt(q.d.pes)*2.4 + 3);
          yearT.transition().duration(step - 100).tween("y", () => { const f = d3.interpolateNumber(prev, q.d.inici); return t => setYear(f(t)); });
          i++; anim = d3.timeout(tick, step);
        };
        anim = d3.timeout(tick, 200);
      });
      if(IBV.reduced) showAll();
      const dl = d3.Delaunay.from(pts, q => q.p[0], q => q.p[1]);
      IBV.hover(svg.node(), (ev, [x, y]) => { const q = pts[dl.find(x, y)]; IBV.focus(sites, z => z === q); tp.show(`<b>${q.d.nom}</b> · ${q.d.lloc} · ${span(q.d)} · ${q.d.detall}`); }, () => { IBV.focus(sites, null); tp.hide(); });
    }

    IBV.mount(el, (c, w) => draw(c, w));
  })();
})();
