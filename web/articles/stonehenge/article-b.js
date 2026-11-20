/* «Per què van aixecar Stonehenge?» · part B: cinc fases en 3D, el cel dins la pedra, la cambra de so,
   qui hi havia, plantes a la mateixa escala, megalitisme mundial i el mirall modern. */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, S3 = window.SH3D, C = IBV.C;
  const {segBind, ctext, MODEL, GROUND, clamp, scrollyH} = window.SHA;
  const F0 = IBV.fmt(",.0f"), F1 = IBV.fmt(",.1f");
  const D2R = Math.PI/180, R2D = 180/Math.PI, AX = S3.AX;
  const ease = d3.easeCubicInOut;
  const yr = y => y < 0 ? `${F0(-y)} aC` : `${y}`;

  /* =========================================================================
     V6 · SCROLLY: CINC MONUMENTS APILATS (maqueta de línia + TIME-15)
     ========================================================================= */
  (function initFases(){
    const el = document.getElementById("fases-viz"); if(!el) return;
    const sec = document.getElementById("s-fases"), tp = IBV.tip(el);
    const tEl = document.getElementById("fases-t"), sEl = document.getElementById("fases-s");
    const FASES = D.fases;
    // en mòbil, títols d'una sola línia perquè el gràfic enganxat no canviï d'alçada a cada pas
    const TCURT = ["Fase 1 · Fossat i cementiri", "Fase 2 · Sarsens i trílits", "Fase 3 · L'Avinguda cap al riu", "Fase 4 · Les pedres blaves es reordenen", "Fase 5 · Els forats Y i Z"];
    const titol = i => innerWidth < 600 ? TCURT[i] : FASES[i].titol;
    tEl.textContent = titol(0);
    const CAMS = [
      {az:AX+150, el:40, dist:150, tz:0, tg:[0,0]},
      {az:AX+168, el:24, dist:64,  tz:1.5, tg:[0,0]},
      {az:AX+205, el:33, dist:190, tz:0, tg:S3.pol(60,AX)},
      {az:AX+222, el:22, dist:58,  tz:1.5, tg:[0,0]},
      {az:AX+245, el:44, dist:120, tz:0, tg:[0,0]}
    ];
    let cur = 0, prev = 0, t0 = 0, cam = Object.assign({}, CAMS[0]), camFrom = null, W = 0, H = 0, ctx = null, tl = null, busy = false;
    const pres = (o, p) => p >= o.ph[0] && p <= o.ph[1];
    const ORDER = {sarsen:0, trilit:250, llinda:900, altar:500, talo:400, station:450, blava:200, blava1:0};
    MODEL.forEach((s,i) => s._dl = (ORDER[s.g]||0) + (i%60)*16);
    function appearAt(o, now){
      const p0 = prev+1, p1 = cur+1, a = pres(o,p0), b = pres(o,p1);
      if(a && b) return 1;
      const k = IBV.reduced ? 1e9 : now - t0;
      if(b) return clamp((k - (o._dl||0))/850, 0, 1);
      if(a) return 1 - clamp(k/650, 0, 1);
      return 0;
    }
    function draw(){
      if(!ctx) return;
      const now = performance.now();
      const camO = Object.assign(S3.orbit(cam.az, cam.el, cam.dist, cam.tz, [cam.tg[0], cam.tg[1], cam.tz]), {fov:36, cy:.52});
      const c3 = S3.camera(camO, W, H);
      let any = false;
      S3.render(ctx, W, H, c3, MODEL, GROUND, {
        all:true,
        appear: s => { const a = appearAt(s, now); if(a>0 && a<1) any = true; return a; },
        groundAppear: g => { const a = appearAt(g, now); if(a>0 && a<1) any = true; return a; },
        person: cur===1||cur===3 ? S3.pol(21, AX+30) : null, t: now
      });
      return any;
    }
    function timeline(){
      d3.select(el).select("svg.tl").remove();
      const mob = W < 520, rh = mob ? 12 : 13, h = 14 + 4*rh + (mob ? 30 : 34), m = {l:mob ? 46 : 52, r:10};
      const svg = d3.select(el).append("svg").attr("class","tl ibv").attr("width",W).attr("height",h).style("display","block")
        .attr("role","img").attr("aria-label","Línia de temps de les cinc fases de construcció entre el 3100 i el 1450 aC, amb intervals de probabilitat del 95 %.");
      const x = d3.scaleLinear().domain([-3200,-1400]).range([m.l, W-m.r]);
      [-3000,-2500,-2000,-1500].forEach(v => { svg.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",14).attr("y2",h-18).attr("stroke",C.grid).attr("stroke-width",.6);
        IBV.t(svg, x(v), h-4, yr(v), {size:11.5, anchor:"middle", fill:C.muted}); });
      const rows = svg.selectAll("g.f").data(FASES).join("g").attr("class","f").style("cursor","pointer");
      const yy = i => 14 + i*rh;
      rows.append("line").attr("x1",d=>x(d.ini[0])).attr("x2",d=>x(d.fiR[1])).attr("y1",(d,i)=>yy(i)).attr("y2",(d,i)=>yy(i)).attr("stroke",C.ghost).attr("stroke-width",1);
      rows.append("line").attr("class","a").attr("x1",d=>x(d.ini[0])).attr("x2",d=>x(d.ini[1])).attr("y1",(d,i)=>yy(i)).attr("y2",(d,i)=>yy(i)).attr("stroke-width",5).attr("stroke-linecap","round");
      rows.append("line").attr("class","a").attr("x1",d=>x(d.fiR[0])).attr("x2",d=>x(d.fiR[1])).attr("y1",(d,i)=>yy(i)).attr("y2",(d,i)=>yy(i)).attr("stroke-width",5).attr("stroke-linecap","round");
      rows.append("text").attr("x",0).attr("y",(d,i)=>yy(i)+4).attr("font-size",11).attr("fill",C.ink2).text(d=>`Fase ${d.num}`);
      tl = rows;
      el.appendChild(el.querySelector(".tip.ibv-dock"));
      paintTl();
      IBV.hover(svg.node(), (ev,[px,py]) => {
        const i = clamp(Math.round((py-14)/rh), 0, 4), d = FASES[i];
        IBV.focus(rows, q => q===d);
        tp.show(`<b>Fase ${d.num}</b> · comença ${d.dIni} · acaba ${d.dFi} cal BC (95 %)`);
      }, () => { IBV.focus(rows, null); tp.hide(); });
    }
    function paintTl(){ if(tl) tl.selectAll("line.a").attr("stroke", (d,i,n) => FASES.indexOf(d3.select(n[i].parentNode).datum())===cur ? C.vermell : C.ink2).attr("stroke-opacity", function(){ return FASES.indexOf(d3.select(this.parentNode).datum())===cur ? 1 : .45; }); }
    function go(i){
      if(i === cur) return;
      prev = cur; cur = i; t0 = performance.now(); camFrom = Object.assign({}, cam);
      tEl.textContent = titol(i); sEl.textContent = FASES[i].dates + " cal BC · " + FASES[i].desc;
      paintTl(); busy = true;
      if(IBV.reduced){ cam = Object.assign({}, CAMS[i]); prev = cur; draw(); busy = false; }
    }
    IBV.mount(el, (container, w) => {
      W = w; H = innerWidth < 900 ? Math.min(scrollyH(w < 520 ? 144 : 150, 140, 300), Math.round(w*.7)) : Math.round(clamp(Math.min(innerHeight*.58, w*.7), 230, 540));
      ({ctx} = IBV.canvas(container, W, H, "Maqueta de línia de Stonehenge que es construeix fase a fase: el fossat i els forats Aubrey, el cercle de sarsens i els trílits, l'Avinguda, la reordenació de les pedres blaves i els forats Y i Z."));
      timeline(); draw();
    });
    IBV.loop(el, () => {
      if(!busy) return;
      const k = clamp((performance.now()-t0)/1600, 0, 1), e = ease(k), to = CAMS[cur];
      ["az","el","dist","tz"].forEach(key => cam[key] = camFrom[key] + (to[key]-camFrom[key])*e);
      cam.tg = [camFrom.tg[0] + (to.tg[0]-camFrom.tg[0])*e, camFrom.tg[1] + (to.tg[1]-camFrom.tg[1])*e];
      const anim = draw();
      if(k >= 1 && !anim){ busy = false; prev = cur; draw(); }
    });
    IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), i => go(i));
  })();

  /* =========================================================================
     V7 · EL CEL DINS LA PEDRA (maqueta en primera persona + horitzó de 360°)
     ========================================================================= */
  const PHI = 51.1789*D2R;
  const EPS = {"-2500":23.98, "2026":23.436};
  function decl(day, eps){ const lam = 2*Math.PI*(day-80)/365.2422; return Math.asin(Math.sin(eps*D2R)*Math.sin(lam)); }
  function riseAz(dec, hDeg){ const h = hDeg*D2R; const c = (Math.sin(dec) - Math.sin(PHI)*Math.sin(h))/(Math.cos(PHI)*Math.cos(h)); return Math.acos(clamp(c,-1,1))*R2D; }
  const MESOS = ["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
  function dayLabel(d){ const dt = new Date(Date.UTC(2026,0,1) + (d-1)*864e5); return `${dt.getUTCDate()} ${MESOS[dt.getUTCMonth()]}`; }
  window.SHASTRO = {decl, riseAz, EPS};

  (function initCel(){
    const el = document.getElementById("cel-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el);
    const rng = document.getElementById("cel-rng"), rngVal = document.getElementById("cel-rng-val");
    const outAz = document.getElementById("cel-az"), outMsg = document.getElementById("cel-msg");
    let era = "-2500", day = 355, ev = "set", body = "sol";
    const TODAY = S3.todayModel(MODEL);
    const PRE = {hivern:{day:355, ev:"set", body:"sol"}, estiu:{day:172, ev:"rise", body:"sol"}, equinocci:{day:80, ev:"set", body:"sol"}, lluna:{day:355, ev:"rise", body:"lluna"}};
    segBind(fig.querySelector(".cel-presets"), "k", k => { ({day,ev,body} = PRE[k]); rng.value = day; rng.disabled = body==="lluna"; upd(); });
    segBind(fig.querySelector(".cel-era"), "era", v => { era = v; upd(); });
    rng.addEventListener("input", () => { day = +rng.value; if(body==="lluna"){ body = "sol"; } upd(); });
    function event(){
      const eps = EPS[era];
      if(body === "lluna"){ const dec = -(eps + 5.145)*D2R; const a = riseAz(dec, .125); return {az:a, c:C.blau, dec}; }
      const dec = decl(day, eps), a = riseAz(dec, -.833);
      return {az: ev==="rise" ? a : 360-a, c:C.groc, dec};
    }
    let W = 0, H = 0, ctx = null, strip = null;
    function draw(){
      if(!ctx) return;
      const e = event(), mob = W < 600;
      const eye = [...S3.pol(36, e.az+180), 10], tg = [...S3.pol(85, e.az), 0];
      const cam = S3.camera({eye, target:tg, fov:mob?56:44, cy:.56}, W, H);
      const sky = [{az:e.az, alt:.9, c:e.c}];
      // «Avui» mostra el monument tal com és ara (pilars i llindes caigudes); el 2500 aC, la reconstrucció sencera
      const today = era === "2026";
      S3.render(ctx, W, H, cam, today ? TODAY : MODEL, GROUND, {phase: today ? 9 : 4, horizon:true, sky, beam:{az:e.az, w:1.1, a:body==="lluna"?0:.24},
        groundAppear: today ? (gd => gd.k === "yz" ? 0 : 1) : null});
      ctext(ctx, 10, H - 12, today ? "Stonehenge avui: 17 dels 30 pilars i 6 de les 30 llindes encara al seu lloc" : "Reconstrucció cap al 2500–2200 aC", {size: mob ? 10.5 : 11.5, fill: C.ink2});
      const q = sky[0].screen;
      if(q){
        const txt = body==="lluna" ? "Sortida extrema de la Lluna" : (ev==="rise" ? "Sortida del Sol" : "Posta del Sol");
        const y = Math.max(16, q[1]-56);
        ctx.beginPath(); ctx.moveTo(q[0], q[1]-14); ctx.lineTo(q[0], y+8); ctx.strokeStyle = C.ink; ctx.lineWidth = .8; ctx.stroke();
        ctext(ctx, q[0], y, `${txt} · ${F1(e.az)}°`, {anchor:"middle", weight:700});
      }
      paintStrip(e);
      // missatge: cau dins l'eix?
      const dAx = Math.min(Math.abs(((e.az - (AX+180)) + 540) % 360 - 180), Math.abs(((e.az - AX) + 540) % 360 - 180));
      outAz.textContent = `${F1(e.az)}°`;
      outMsg.textContent = body==="lluna" ? "Quasi perpendicular a l'eix: la diagonal curta del rectangle de les Station Stones" :
        dAx < 2.5 ? "Sobre l'eix: la llum entra pel passadís de pedres" : `A ${F1(dAx)}° de l'eix: les pedres tapen el Sol`;
      rngVal.textContent = body==="lluna" ? "cicle de 18,6 anys" : dayLabel(day);
      rng.setAttribute("aria-valuetext", body==="lluna" ? "Aturada lunar major" : dayLabel(day));
      rng.style.setProperty("--control-value", day);
    }
    function buildStrip(container){
      d3.select(container).select("svg.hz").remove();
      const h = 92, mob = W < 600;
      const svg = d3.select(container).append("svg").attr("class","hz ibv").attr("width",W).attr("height",h).style("display","block").style("margin-top","6px")
        .attr("role","img").attr("aria-label","Horitzó de 360 graus amb la franja de sortides i postes del Sol al llarg de l'any i els extrems de la Lluna.");
      const x = d3.scaleLinear().domain([0,360]).range([6, W-6]);
      const g = svg.append("g");
      const yB = 40;
      g.append("line").attr("x1",x(0)).attr("x2",x(360)).attr("y1",yB).attr("y2",yB).attr("stroke",C.ink).attr("stroke-width",.8);
      [[0,"N"],[90,"E"],[180,"S"],[270,"O"],[360,"N"]].forEach(([a,t]) => { g.append("line").attr("x1",x(a)).attr("x2",x(a)).attr("y1",yB).attr("y2",yB+5).attr("stroke",C.ink); IBV.t(g, x(a), yB+17, t, {size:11.5, anchor:a===0?"start":a===360?"end":"middle", fill:C.muted}); });
      const bands = g.append("g"), moon = g.append("g"), mk = g.append("g");
      g.append("line").attr("x1",x(AX)).attr("x2",x(AX)).attr("y1",8).attr("y2",yB+24).attr("stroke",C.ink).attr("stroke-dasharray","3 2").attr("stroke-width",.8);
      g.append("line").attr("x1",x(AX+180)).attr("x2",x(AX+180)).attr("y1",8).attr("y2",yB+24).attr("stroke",C.ink).attr("stroke-dasharray","3 2").attr("stroke-width",.8);
      IBV.t(g, x(AX+180)+5, 12, mob ? "eix" : "eix de Stonehenge", {size:11.5, fill:C.ink2, halo:true});
      IBV.t(g, x(45), yB+32, mob?"sortides":"sortides del Sol", {size:11.5, anchor:"start", italic:true, fill:C.ink2});
      IBV.t(g, x(315), yB+32, mob?"postes":"postes del Sol", {size:11.5, anchor:"end", italic:true, fill:C.ink2});
      strip = {x, bands, moon, mk, yB};
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      IBV.hover(svg.node(), (ev,[px]) => {
        const a = x.invert(px);
        tp.show(`<b>Azimut ${F0(clamp(a,0,360))}°</b> · ${Math.abs(a-AX)<4?"eix del solstici d'estiu (sortida)":Math.abs(a-AX-180)<4?"eix del solstici d'hivern (posta)":"horitzó de Stonehenge"}`);
      }, () => tp.hide());
    }
    function paintStrip(e){
      if(!strip) return;
      const {x, bands, moon, mk, yB} = strip, eps = EPS[era];
      const sMax = riseAz(eps*D2R, -.833), sMin = riseAz(-eps*D2R, -.833);
      bands.selectAll("*").remove();
      [[sMax, sMin],[360-sMin, 360-sMax]].forEach(([a,b]) => bands.append("rect").attr("x",x(a)).attr("width",x(b)-x(a)).attr("y",yB-12).attr("height",12).attr("fill",IBV.alpha(C.groc,.55)));
      moon.selectAll("*").remove();
      const mN = riseAz((eps+5.145)*D2R, .125), mS = riseAz(-(eps+5.145)*D2R, .125);
      [mN, mS, 360-mS, 360-mN].forEach(a => moon.append("line").attr("x1",x(a)).attr("x2",x(a)).attr("y1",yB-20).attr("y2",yB).attr("stroke",C.blau).attr("stroke-width",2));
      mk.selectAll("*").remove();
      mk.append("circle").attr("cx",x(e.az)).attr("cy",yB-6).attr("r",5.5).attr("fill",e.c).attr("stroke",C.ink).attr("stroke-width",1);
    }
    IBV.mount(el, (container, w) => {
      W = w; H = Math.round(clamp(w*.46, 250, 470));
      ({ctx} = IBV.canvas(container, W, H, "Vista de Stonehenge des de sobre l'Avinguda, mirant cap a on surt o es pon el Sol o la Lluna el dia triat."));
      buildStrip(container); draw();
    });
    function upd(){ draw(); }
  })();

})();
