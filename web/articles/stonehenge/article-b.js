/* «Per què van aixecar Stonehenge?» · part B: cinc fases en 3D, el cel dins la pedra, la cambra de so,
   qui hi havia, plantes a la mateixa escala, megalitisme mundial i el mirall modern. */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, S3 = window.SH3D, C = IBV.C;
  const {segBind, ctext, MODEL, GROUND, clamp} = window.SHA;
  const F0 = IBV.fmt(",.0f"), F1 = IBV.fmt(",.1f");
  const D2R = Math.PI/180, R2D = 180/Math.PI, AX = S3.AX;
  const ease = d3.easeCubicInOut;
  const yr = y => y < 0 ? `${F0(-y)} aC` : `${y}`;

  /* =========================================================================
     V6 · SCROLLY: CINC MONUMENTS APILATS (maqueta de línia + IB-49)
     ========================================================================= */
  (function initFases(){
    const el = document.getElementById("fases-viz"); if(!el) return;
    const sec = document.getElementById("s-fases"), tp = IBV.tip(el);
    const tEl = document.getElementById("fases-t"), sEl = document.getElementById("fases-s");
    const FASES = D.fases;
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
      const mob = W < 520, h = mob ? 92 : 100, m = {l:52, r:10};
      const svg = d3.select(el).append("svg").attr("class","tl ibv").attr("width",W).attr("height",h).style("display","block")
        .attr("role","img").attr("aria-label","Línia de temps de les cinc fases de construcció entre el 3100 i el 1450 aC, amb intervals de probabilitat del 95 %.");
      const x = d3.scaleLinear().domain([-3200,-1400]).range([m.l, W-m.r]);
      [-3000,-2500,-2000,-1500].forEach(v => { svg.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",14).attr("y2",h-18).attr("stroke",C.grid).attr("stroke-width",.6);
        IBV.t(svg, x(v), h-4, yr(v), {size:11.5, anchor:"middle", fill:C.muted}); });
      const rows = svg.selectAll("g.f").data(FASES).join("g").attr("class","f").style("cursor","pointer");
      const yy = i => 14 + i*13;
      rows.append("line").attr("x1",d=>x(d.ini[0])).attr("x2",d=>x(d.fi[1])).attr("y1",(d,i)=>yy(i)).attr("y2",(d,i)=>yy(i)).attr("stroke",C.ghost).attr("stroke-width",1);
      rows.append("line").attr("class","a").attr("x1",d=>x(d.ini[0])).attr("x2",d=>x(d.ini[1])).attr("y1",(d,i)=>yy(i)).attr("y2",(d,i)=>yy(i)).attr("stroke-width",5).attr("stroke-linecap","round");
      rows.append("line").attr("class","a").attr("x1",d=>x(d.fi[0])).attr("x2",d=>x(d.fi[1])).attr("y1",(d,i)=>yy(i)).attr("y2",(d,i)=>yy(i)).attr("stroke-width",5).attr("stroke-linecap","round");
      rows.append("text").attr("x",0).attr("y",(d,i)=>yy(i)+4).attr("font-size",11.5).attr("fill",C.ink2).text(d=>`Fase ${d.num}`);
      tl = rows;
      el.appendChild(el.querySelector(".tip.ibv-dock"));
      paintTl();
      IBV.hover(svg.node(), (ev,[px,py]) => {
        const i = clamp(Math.round((py-14)/13), 0, 4), d = FASES[i];
        IBV.focus(rows, q => q===d);
        tp.show(`<b>Fase ${d.num}</b> · comença ${d.dIni} · acaba ${d.dFi} cal BC (95 %)`);
      }, () => { IBV.focus(rows, null); tp.hide(); });
    }
    function paintTl(){ if(tl) tl.selectAll("line.a").attr("stroke", (d,i,n) => FASES.indexOf(d3.select(n[i].parentNode).datum())===cur ? C.vermell : C.ink2).attr("stroke-opacity", function(){ return FASES.indexOf(d3.select(this.parentNode).datum())===cur ? 1 : .45; }); }
    function go(i){
      if(i === cur) return;
      prev = cur; cur = i; t0 = performance.now(); camFrom = Object.assign({}, cam);
      tEl.textContent = FASES[i].titol; sEl.textContent = FASES[i].dates + " cal BC · " + FASES[i].desc;
      paintTl(); busy = true;
      if(IBV.reduced){ cam = Object.assign({}, CAMS[i]); prev = cur; draw(); busy = false; }
    }
    IBV.mount(el, (container, w) => {
      W = w; H = Math.round(clamp(Math.min(innerHeight*(innerWidth<900?.36:.58), w*.7), 230, 540));
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
      S3.render(ctx, W, H, cam, MODEL, GROUND, {phase:4, horizon:true, sky, beam:{az:e.az, w:1.1, a:body==="lluna"?0:.24}});
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

  /* =========================================================================
     V8 · UNA CAMBRA DE RESSONÀNCIA (IB-28 aplicat al so: raigs que reboten)
     ========================================================================= */
  (function initSo(){
    const el = document.getElementById("so-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el);
    let mode = "pedres";
    segBind(fig.querySelector(".seg"), "k", k => { mode = k; pulse(true); });
    const STONES = MODEL.filter(s => !s.lintel && s.ph[0] <= 4 && s.ph[1] >= 4 && Math.hypot(s.x,s.y) < 20).map(s => ({
      x:s.x, y:s.y, ca:Math.sin(s.rot*D2R), sa:Math.cos(s.rot*D2R), nx:Math.cos(s.rot*D2R), ny:-Math.sin(s.rot*D2R), hw:s.w/2, ht:s.t/2, R:Math.hypot(s.w,s.t)/2+.3, s
    }));
    let W = 0, H = 0, ctx = null, trail = null, rays = [], tPulse = 0, curve = {pedres:[], camp:[]}, ghost = {pedres:null, camp:null}, sc = 1, cx = 0, cy = 0;
    const N = 420, SPEED = 7.5;   // m per segon de simulació (càmera molt lenta)
    function pulse(reset){
      rays = d3.range(N).map(i => { const a = i/N*Math.PI*2 + .003; return {x:0, y:.4, vx:Math.cos(a)*SPEED, vy:Math.sin(a)*SPEED, e:1}; });
      tPulse = 0; curve[mode] = [];
      if(trail) trail.clearRect(0,0,W,H);
    }
    function step(dt){
      const sub = 3, h = dt/sub;
      for(let k=0;k<sub;k++) for(const r of rays){
        if(r.e < .02) continue;
        r.x += r.vx*h; r.y += r.vy*h;
        if(mode === "pedres") for(const s of STONES){
          const dx = r.x - s.x, dy = r.y - s.y; if(dx*dx+dy*dy > s.R*s.R) continue;
          // marc local de la pedra: u = amplada, v = gruix
          const u = dx*s.ca + dy*s.sa, v = dx*s.nx + dy*s.ny;
          if(Math.abs(u) < s.hw && Math.abs(v) < s.ht){
            const vu = r.vx*s.ca + r.vy*s.sa, vv = r.vx*s.nx + r.vy*s.ny;
            let nu = vu, nv = vv;
            if(s.hw - Math.abs(u) < s.ht - Math.abs(v)) nu = -vu; else nv = -vv;
            r.vx = nu*s.ca + nv*s.nx; r.vy = nu*s.sa + nv*s.ny;
            r.x += r.vx*h*1.5; r.y += r.vy*h*1.5;
            r.e *= .82;   // part de l'energia s'absorbeix a cada rebot (esquema)
          }
        }
        if(r.x*r.x + r.y*r.y > 60*60) r.e = 0;
      }
    }
    function drawStatic(sctx){
      sctx.clearRect(0,0,W,H);
      const P = (x,y) => [cx + x*sc, cy - y*sc];
      // anell d'escala i fossat
      sctx.beginPath(); sctx.arc(cx, cy, 15*sc, 0, 7); sctx.strokeStyle = IBV.alpha(C.ink,.12); sctx.lineWidth = .6; sctx.stroke();
      STONES.forEach(s => {
        const c = [[-s.hw,-s.ht],[s.hw,-s.ht],[s.hw,s.ht],[-s.hw,s.ht]].map(([u,v]) => {
          return P(s.x + u*s.ca + v*s.nx, s.y + u*s.sa + v*s.ny); });
        sctx.beginPath(); c.forEach((p,i)=>i?sctx.lineTo(p[0],p[1]):sctx.moveTo(p[0],p[1])); sctx.closePath();
        sctx.globalAlpha = mode==="pedres" ? 1 : .25;
        sctx.fillStyle = S3.PAPER; sctx.fill(); sctx.strokeStyle = IBV.alpha(C.ink,.85); sctx.lineWidth = .7; sctx.stroke();
        sctx.globalAlpha = 1;
      });
      const v = P(0,.4); sctx.beginPath(); sctx.arc(v[0], v[1], 3.2, 0, 7); sctx.fillStyle = C.vermell; sctx.fill();
    }
    let base = null, graph = null;
    IBV.mount(el, (container, w) => {
      W = w; const mob = w < 600; H = Math.round(clamp(mob ? w*.95 : w*.56, 300, 520));
      d3.select(container).selectAll("canvas,svg").remove();
      const plotW = mob ? W : W*.62;
      sc = Math.min(plotW, H)/2/19.5; cx = plotW/2; cy = H/2;
      const b = IBV.canvas(container, W, H, "Planta de Stonehenge amb raigs de so que surten d'una veu al centre i reboten contra les pedres; sense pedres, s'escapen de seguida.");
      base = b.ctx;
      const tc = d3.select(container).append("canvas").attr("width",W*2).attr("height",H*2).style("width",W+"px").style("height",H+"px").style("position","absolute").style("left",0).style("top",0).style("pointer-events","none").node();
      trail = tc.getContext("2d"); trail.scale(2,2);
      ctx = trail;
      graph = IBV.svg(container, W, H, "").style("position","absolute").style("left",0).style("top",0).style("pointer-events","none");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      drawStatic(base); pulse(true);
      IBV.hover(container, (ev,[x,y]) => {
        const r = Math.hypot(x-cx, y-cy)/sc;
        tp.show(r < 15 ? `<b>Dins el cercle</b> · reverberació mesurada de 0,64 s i +4,3 dB per a la veu (Cox et al., 2020)` : `<b>Fora del cercle</b> · el so s'escapa: poca reverberació i gens d'amplificació`);
      }, () => tp.hide());
    });
    function drawGraph(){
      if(!graph) return;
      graph.selectAll("*").remove();
      const mob = W < 600;
      if(mob) return;
      const x0 = W*.66, x1 = W-8, y0 = H*.3, y1 = H*.72;
      const x = d3.scaleLinear().domain([0,8]).range([x0,x1]), y = d3.scaleLinear().domain([0,1]).range([y1,y0]);
      IBV.t(graph, x0, y0-40, "Energia que encara queda dins el cercle", {weight:700, size:12.5});
      IBV.t(graph, x0, y0-24, "simulació de raigs, no és la mesura", {size:11.5, fill:C.ink2, italic:true});
      graph.append("line").attr("x1",x0).attr("x2",x1).attr("y1",y1).attr("y2",y1).attr("stroke",C.ink).attr("stroke-width",.8);
      IBV.t(graph, x1, y1+15, "temps (escala lenta) →", {size:11.5, anchor:"end", fill:C.muted});
      const ln = d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX);
      [["camp",C.ghost,"camp obert"],["pedres",C.blau,"amb les pedres"]].forEach(([k,c,t]) => {
        const data = (k===mode ? curve[k] : ghost[k]) || [];
        if(data.length < 2) return;
        graph.append("path").attr("d", ln(data)).attr("fill","none").attr("stroke",c).attr("stroke-width",k==="pedres"?2:1.4);
        const last = data[data.length-1];
        IBV.t(graph, x(last[0])+4, y(last[1]) + (k==="camp"?10:-6), t, {size:11.5, fill:C.ink2, halo:true});
      });
    }
    IBV.loop(el, (t, dt) => {
      if(!trail) return;
      if(IBV.reduced){   // moviment reduït: es dibuixa d'un cop el rastre dels primers 2,5 s
        for(let i = 0; i < 60; i++){ step(.042); trail.fillStyle = C.blau;
          for(const r of rays){ if(r.e < .02) continue; trail.globalAlpha = .08 + .25*r.e; trail.fillRect(cx + r.x*sc - .7, cy - r.y*sc - .7, 1.4, 1.4); } }
        trail.globalAlpha = 1; return;
      }
      const sdt = dt/1000;
      tPulse += sdt;
      step(sdt);
      // estela que s'esvaeix (sense pintar fons: destination-out)
      trail.save(); trail.globalCompositeOperation = "destination-out"; trail.fillStyle = "rgba(0,0,0,0.22)"; trail.fillRect(0,0,W,H); trail.restore();
      trail.fillStyle = C.blau;
      let inside = 0;
      for(const r of rays){
        if(r.e < .02) continue;
        if(r.x*r.x + r.y*r.y < 15*15) inside += r.e;
        trail.globalAlpha = .25 + .6*r.e;
        trail.fillRect(cx + r.x*sc - .9, cy - r.y*sc - .9, 1.8, 1.8);
      }
      trail.globalAlpha = 1;
      curve[mode].push([tPulse, inside/N]);
      if(curve[mode].length % 6 === 0) drawGraph();
      if(tPulse > 8){ ghost[mode] = curve[mode].slice(); drawStatic(base); pulse(false); }
    });
  })();

  /* =========================================================================
     V9 · QUI HI HAVIA (IB-11 + IB-53)
     ========================================================================= */
  (function initGent(){
    const el = document.getElementById("gent-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el);
    let tab = "morts", W = 0, svg = null, adnState = IBV.reduced ? 1 : 0, adnTimer = null;
    segBind(fig.querySelector(".seg"), "k", k => { tab = k; render(); });
    function render(){
      if(!svg) return;
      if(adnTimer){ adnTimer.stop(); adnTimer = null; }
      svg.selectAll("*").remove(); svg.on("click.adn", null);
      ({morts, adn, porc})[tab]();
    }
    function H(){ return +svg.attr("height"); }
    function morts(){
      const h = H(), mob = W < 600, R = Math.min(h*.36, W*(mob?.34:.2)), cx = mob ? W/2 : W*.38, cy = h*.52;
      const g = svg.append("g");
      for(let i=0;i<56;i++){ const a = (AX+3.2+i*360/56)*D2R; g.append("circle").attr("cx",cx+R*Math.sin(a)).attr("cy",cy-R*Math.cos(a)).attr("r",3).attr("fill","none").attr("stroke",C.ink).attr("stroke-opacity",.5).attr("stroke-width",.6); }
      IBV.t(g, cx, cy-R-12, "56 forats Aubrey", {anchor:"middle", size:11.5, fill:C.ink2, italic:true});
      const rnd = IBV.rng(7), pts = [];
      for(let i=0;i<240;i++){ const a = rnd()*Math.PI*2, rr = R*(.8 + rnd()*.4); pts.push({x:cx+rr*Math.sin(a), y:cy-rr*Math.cos(a), i, k:i<150?"min":"max"}); }
      // els 25 analitzats, en una reixa de 5 × 5 al centre: 10 de fora (blau) i 15 locals o indeterminats (tinta)
      const sp = Math.min(18, R*.16);
      for(let i=0;i<25;i++) pts.push({x:cx + ((i%5)-2)*sp, y:cy + (Math.floor(i/5)-2)*sp, i:240+i, k:i<10?"fora":"local"});
      const dots = g.selectAll("circle.p").data(pts).join("circle").attr("class","p")
        .attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",d=>d.k==="fora"||d.k==="local"?sp*.32:2.4)
        .attr("fill",d=>d.k==="fora"?C.blau:d.k==="local"?C.ink2:d.k==="min"?IBV.alpha(C.ink,.24):"none")
        .attr("stroke",d=>d.k==="max"?IBV.alpha(C.ink,.38):"none").attr("stroke-width",.6).attr("stroke-dasharray",d=>d.k==="max"?"1.5 1.5":null);
      IBV.onView(svg.node(), inst => { if(inst) return; dots.attr("opacity",0).transition().delay(d=>d.i*4).duration(500).attr("opacity",1); });
      const lx = mob ? 12 : W*.66, ly = mob ? h-64 : cy-64;
      const lg = g.append("g").attr("transform", `translate(${lx},${ly})`);
      if(!mob){
        IBV.lines(lg, 0, 0, [["Entre 150 i 240 persones cremades",true],["c. 3000–2500 aC, al voltant dels forats Aubrey:"],["el cementiri més gran del Neolític britànic"]], {size:12.5});
        IBV.lines(lg, 0, 70, [["25 analitzades, 10 de lluny",true],["l'estronci dels ossos encaixa amb l'oest"],["de Gal·les (Snoeck et al., 2018)"]], {size:12.5});
        lg.append("circle").attr("cx",-11).attr("cy",66).attr("r",5).attr("fill",C.blau);
        lg.append("circle").attr("cx",-11).attr("cy",-4).attr("r",3).attr("fill",IBV.alpha(C.ink,.24));
      }
      IBV.note(g, {x:cx-2.4*sp, y:cy-1.6*sp, tx: mob ? 14 : cx-R-24, ty: mob ? 22 : cy-R*.55, kind:"curve", bend:-16, anchor: mob?"start":"end", lines:[["10 de 25",true],["vingudes de l'oest de Gal·les"]]});
      const vor = d3.Delaunay.from(pts, d=>d.x, d=>d.y);
      IBV.hover(svg.node(), (ev,[x,y]) => {
        const d = pts[vor.find(x,y)]; if(Math.hypot(d.x-x,d.y-y) > 14){ tp.hide(); return; }
        tp.show(d.k==="fora" ? "<b>Persona analitzada</b> · estronci de fora de Wessex, compatible amb l'oest de Gal·les" : d.k==="local" ? "<b>Persona analitzada</b> · estronci compatible amb Wessex o sense origen clar" :
          d.k==="min" ? "<b>Persona cremada</b> · part de l'estimació mínima (150)" : "<b>Possible</b> · fins a 240 segons l'estimació alta");
      }, () => tp.hide());
    }
    function adn(){
      const h = H(), mob = W < 600, n = 10, cell = Math.min((mob ? W-20 : W*.5)/n, (h-70)/n), gx = mob ? (W-cell*n)/2 : 18, gy = 46;
      const g = svg.append("g");
      const title = IBV.t(g, gx, 18, "", {weight:700, serif:false, size:13.5});
      const sub = IBV.t(g, gx, 35, "", {size:12.5, fill:C.ink2});
      const units = g.selectAll("circle").data(d3.range(100)).join("circle")
        .attr("cx", i => gx + (i%n + .5)*cell).attr("cy", i => gy + (Math.floor(i/n) + .5)*cell).attr("r", cell*.36);
      if(!mob){
        const tx = gx + cell*n + 34;
        IBV.lines(g, tx, gy+20, [["Els constructors (c. 3000–2500 aC)",true],["agricultors neolítics, descendents dels"],["pagesos arribats d'Anatòlia i l'Egeu cap al"],["4000 aC (Brace et al., 2019)"]], {size:12.5});
        g.append("circle").attr("cx",tx-10).attr("cy",gy+16).attr("r",5).attr("fill",C.groc);
        IBV.lines(g, tx, gy+110, [["Els nouvinguts del Vas Campaniforme",true],["arribats del continent des del 2450 aC;"],["en pocs segles, ~90 % de l'ascendència"],["de l'illa (Olalde et al., 2018)"]], {size:12.5});
        g.append("circle").attr("cx",tx-10).attr("cy",gy+106).attr("r",5).attr("fill",C.vermell);
      }
      const set = (s, inst) => {
        adnState = s;
        title.text(s ? "Cap al 2000 aC" : "Cap al 2500 aC, mentre s'alcen els sarsens");
        sub.text(s ? "~90 de cada 100 parts de l'ascendència ja són noves" : "100 parts d'ascendència de la població de Gran Bretanya");
        units.transition().duration(inst||IBV.reduced?0:600).delay(i => inst?0:(i%n + Math.floor(i/n))*22)
          .attr("fill", i => s && i >= 10 ? C.vermell : C.groc).attr("fill-opacity", .9);
      };
      set(adnState, true);
      if(!IBV.reduced) adnTimer = d3.interval(() => set(adnState ? 0 : 1), 3600);
      svg.on("click.adn", () => set(adnState ? 0 : 1));
      IBV.hover(svg.node(), (ev,[x,y]) => tp.show(adnState ? "<b>c. 2000 aC</b> · ~90 % d'ascendència nova, ~10 % neolítica" : "<b>c. 2500 aC</b> · la gent que va aixecar els sarsens"), () => tp.hide());
    }
    function porc(){
      const h = H(), mob = W < 600, R = Math.min(h*.36, W*(mob?.33:.2)), cx = mob ? W/2 : W*.36, cy = h*.53;
      const g = svg.append("g").attr("transform",`translate(${cx},${cy})`);
      const ang = m => (m/12)*360;   // m: mes fraccionari, 0 = 1 de gener a dalt
      const arc = (m0, m1, r0, r1) => d3.arc()({innerRadius:r0, outerRadius:r1, startAngle:ang(m0)*D2R, endAngle:ang(m1)*D2R});
      g.append("circle").attr("r",R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7);
      IBV.MES.forEach((t,i) => { const a = ang(i+.5)*D2R; IBV.t(g, (R+16)*Math.sin(a), -(R+16)*Math.cos(a)+4, t, {size:11.5, anchor:"middle", fill:C.muted}); });
      for(let i=0;i<12;i++){ const a = ang(i)*D2R; g.append("line").attr("x1",(R-4)*Math.sin(a)).attr("y1",-(R-4)*Math.cos(a)).attr("x2",(R+4)*Math.sin(a)).attr("y2",-(R+4)*Math.cos(a)).attr("stroke",C.ink).attr("stroke-width",.6); }
      g.append("path").attr("d", arc(2, 5, R*.62, R*.86)).attr("fill", IBV.alpha(C.blau,.38));
      g.append("path").attr("d", arc(10.8, 13.4, R*.62, R*.86)).attr("fill", IBV.alpha(C.vermell,.42));
      // solsticis
      [[11.67,"solstici d'hivern"],[5.67,"solstici d'estiu"]].forEach(([m,t]) => { const a = ang(m)*D2R;
        g.append("line").attr("x1",R*.5*Math.sin(a)).attr("y1",-R*.5*Math.cos(a)).attr("x2",R*1.0*Math.sin(a)).attr("y2",-R*1.0*Math.cos(a)).attr("stroke",C.ink).attr("stroke-dasharray","3 2");
      });
      // la vida d'un garrí: ~9 mesos
      const life = g.append("path").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.1)
        .attr("d", d3.arc()({innerRadius:R*.45, outerRadius:R*.45, startAngle:ang(3.5)*D2R, endAngle:ang(12.5)*D2R}));
      const L = life.node().getTotalLength();
      const pig = g.append("circle").attr("r",4).attr("fill",C.vermell);
      IBV.t(g, 0, -6, "~9 mesos", {anchor:"middle", weight:700, size:13.5});
      IBV.t(g, 0, 12, "de vida", {anchor:"middle", size:12.5, fill:C.ink2});
      const pt = (m, r) => { const a = ang(m)*D2R; return [r*Math.sin(a), -r*Math.cos(a)]; };
      const pb = pt(3.5, R*.86), ps = pt(12.1, R*.86);
      IBV.note(g, {x:pb[0], y:pb[1], tx:pb[0]+(mob?10:44), ty:pb[1]+(mob?-20:-28), kind:"elbow", anchor:"start", lines:[["Neixen a la primavera",true],["a les granges d'arreu de l'illa"]]});
      IBV.note(g, {x:ps[0], y:ps[1], tx:ps[0]-(mob?6:40), ty:ps[1]-(mob?18:26), kind:"elbow", anchor:"end", lines:[["Es mengen a ple hivern",true],["al voltant del solstici"]]});
      if(!mob) IBV.lines(svg.append("g"), W*.74, cy+60, [["Un calendari escrit en dents",true],["El desgast de les dents dels porcs de"],["Durrington Walls diu que es van sacrificar"],["sobretot cap als nou mesos (Wright et al., 2014)."]], {size:12.5});
      if(!IBV.reduced){ const tm = d3.timer(e => { const k = (e/9000)%1, p = life.node().getPointAtLength(L*k); pig.attr("cx",p.x).attr("cy",p.y); }); adnTimer = {stop:()=>tm.stop()}; }
      else { const p = life.node().getPointAtLength(L); pig.attr("cx",p.x).attr("cy",p.y); }
      IBV.hover(svg.node(), (ev,[x,y]) => { const a = (Math.atan2(x-cx, -(y-cy))*R2D + 360) % 360, m = Math.floor(a/30);
        tp.show(`<b>${MESOS[m]}</b> · ${m>=2&&m<=4?"temporada de parts":m===11||m<=1?"temporada de banquets a Durrington Walls":"els porcs creixen a casa"}`); }, () => tp.hide());
    }
    IBV.mount(el, (container, w) => {
      W = w; const h = Math.round(clamp(w < 600 ? w*1.0 : w*.46, 320, 470));
      svg = IBV.svg(container, W, h, "Tres vistes de la gent de Stonehenge: les persones cremades als forats Aubrey, el canvi d'ascendència del Vas Campaniforme i l'any dels porcs dels banquets.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      render();
    });
  })();

  /* =========================================================================
     V10 · PLANTES A LA MATEIXA ESCALA (IB-20 + IB-43 amb cercles de línia fina)
     ========================================================================= */
  (function initEscala(){
    const el = document.getElementById("esc-viz"); if(!el) return;
    const tp = IBV.tip(el);
    const S = D.escala.slice().sort((a,b) => b.d - a.d);
    IBV.mount(el, (container, w) => {
      const mob = w < 600;
      const big = S[0], rest = S.slice(1);
      const D0 = mob ? Math.min(w*.78, 300) : Math.min(w*.4, 380), sc = D0/big.d;
      // fila de petits múltiples a la mateixa escala
      const gapX = mob ? 22 : 34, cellW = d => Math.max(d.d*sc, mob?58:66);
      const x0 = mob ? 10 : D0 + 70, avail = w - x0 - 6;
      const rows = [[]]; let acc = 0;
      rest.forEach(d => { const cw = cellW(d); if(acc + cw > avail && rows[rows.length-1].length){ rows.push([]); acc = 0; } rows[rows.length-1].push(d); acc += cw + gapX; });
      const rowH = 110*sc + 48;
      const topRows = mob ? D0 + 40 : Math.max(20, (D0 - rows.length*rowH)/2 + 30);
      const H = Math.round(mob ? topRows + rows.length*rowH + 10 : Math.max(D0 + 40, topRows + rows.length*rowH));
      const svg = IBV.svg(container, w, H, "Plantes de monuments a la mateixa escala: Durrington Walls, enorme, al costat de Stonehenge, Woodhenge, Waun Mawn, Brodgar, el cercle de sarsens i el recinte D de Göbekli Tepe.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      const g = svg.append("g");
      const pos = new Map();
      const bcx = mob ? w/2 : D0/2 + 8, bcy = mob ? D0/2 + 8 : H/2;
      pos.set(big, [bcx, bcy]);
      rows.forEach((row, ri) => {
        let x = x0; const base = topRows + ri*rowH + 110*sc;
        if(mob){ const tot = row.reduce((a,d)=>a+cellW(d),0) + gapX*(row.length-1); x = (w - tot)/2; }
        row.forEach(d => { const cw = cellW(d); pos.set(d, [x + cw/2, base - d.d*sc/2]); x += cw + gapX; });
      });
      const items = g.selectAll("g.m").data(S).join("g").attr("class","m").style("cursor","pointer");
      items.append("circle").attr("cx",d=>pos.get(d)[0]).attr("cy",d=>pos.get(d)[1]).attr("r",d=>Math.max(1.5,d.d*sc/2))
        .attr("fill", d => d.id==="stonehenge" ? IBV.alpha(C.vermell,.16) : d.id==="durrington" ? IBV.alpha(C.groc,.16) : "none")
        .attr("stroke", d => d.id==="stonehenge" ? C.vermell : C.ink).attr("stroke-width", d => d.id==="stonehenge" ? 1.4 : .8)
        .attr("stroke-dasharray", d => d.dash ? "3 2" : null);
      // Stonehenge fantasma dins de Durrington Walls, per comparar
      const sh = S.find(d=>d.id==="stonehenge");
      [-1.5,-.5,.5,1.5].forEach(k => g.append("circle").attr("cx",bcx + k*sh.d*sc*1.02).attr("cy",bcy).attr("r",sh.d*sc/2).attr("fill","none").attr("stroke",C.vermell).attr("stroke-opacity",.55).attr("stroke-dasharray","2 2").attr("stroke-width",.8).style("pointer-events","none"));
      IBV.t(g, bcx, bcy + sh.d*sc/2 + 16, "hi caben quatre fossats de Stonehenge", {anchor:"middle", size:12, italic:true, fill:C.ink2, halo:true});
      IBV.lines(items.filter(d=>d===big), bcx, bcy - D0/2 + 26, [[big.nom,true],[`${F0(big.d)} m · ${big.data}`]], {size:12.5, anchor:"middle", halo:true});
      items.filter(d=>d!==big).each(function(d){
        const p = pos.get(d), yb = p[1] + Math.max(d.d*sc/2, 3) + 15;
        IBV.lines(d3.select(this), p[0], yb, [[d.curt,true],[`${F0(d.d)} m`]], {size:12, anchor:"middle", fill: d.id==="stonehenge" ? C.vermell : C.ink, halo:true});
      });
      // barra d'escala de 100 m
      const sx = mob ? 10 : x0, sy = H - 8;
      g.append("path").attr("d",`M${sx},${sy-4}V${sy}H${sx+100*sc}V${sy-4}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8);
      IBV.t(g, sx+100*sc+6, sy, "100 m", {size:11.5, fill:C.ink2});
      IBV.onView(container, inst => { if(inst) return; items.select("circle").attr("r",0).transition().delay((d,i)=>i*160).duration(900).ease(ease).attr("r",d=>Math.max(1.5,d.d*sc/2)); });
      IBV.hover(svg.node(), (ev,[x,y]) => {
        const d = S.filter(q => Math.hypot(x-pos.get(q)[0], y-pos.get(q)[1]) < Math.max(14, q.d*sc/2 + 6)).sort((a,b)=>a.d-b.d)[0];
        if(!d){ IBV.focus(items, null); tp.hide(); return; }
        IBV.focus(items, q => q===d);
        tp.show(`<b>${d.nom}</b> · ${F0(d.d)} m · ${d.det}`);
      }, () => { IBV.focus(items, null); tp.hide(); });
    });
  })();

  /* =========================================================================
     V11 · DOTZE MIL ANYS MOVENT PEDRES (IB-49 lineal + IB-25)
     ========================================================================= */
  (function initMon(){
    const el = document.getElementById("mon-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el);
    let view = "cronologia", W = 0;
    segBind(fig.querySelector(".seg"), "k", k => { view = k; draw(el, W, true); });
    const M = D.mon.slice().sort((a,b) => a.inici - b.inici);
    function draw(container, w){
      W = w; d3.select(container).selectAll("svg").remove();
      const mob = w < 600;
      if(view === "cronologia"){
        const rowH = mob ? 34 : 30, H = M.length*rowH + 40;
        const svg = IBV.svg(container, w, H, "Línia de temps de megàlits del món des de Göbekli Tepe (9600 aC) fins a Sumba avui, amb Stonehenge entre el 3000 i el 1500 aC.");
        container.appendChild(container.querySelector(".tip.ibv-dock"));
        const lw = mob ? 0 : 150;
        const x = d3.scaleLinear().domain([-10000,2100]).range([lw+8, w-10]);
        const g = svg.append("g");
        [-10000,-8000,-6000,-4000,-2000,0,2000].forEach(v => { g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",8).attr("y2",H-22).attr("stroke",v===0?C.ink:C.grid).attr("stroke-width",v===0?.8:.6);
          IBV.t(g, x(v), H-6, v<0 ? `${F0(-v)} aC` : v===0 ? "0" : `${v} dC`, {size:11.5, anchor:"middle", fill:C.muted}); });
        const rows = g.selectAll("g.r").data(M).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${16+i*rowH})`).style("cursor","pointer");
        rows.append("line").attr("x1",d=>x(d.inici)).attr("x2",d=>x(d.inici)).attr("y1",0).attr("y2",0)
          .attr("stroke",d=>d.id==="stonehenge"?C.vermell:d.id==="menorca"?C.blau:C.ink2).attr("stroke-width",7).attr("stroke-linecap","round").attr("stroke-opacity",.85)
          .transition().duration(IBV.reduced?0:1100).delay((d,i)=>i*90).ease(ease).attr("x2",d=>Math.max(x(d.fi), x(d.inici)+2));
        rows.append("text").attr("x", d => mob ? Math.min(x(d.inici), w-120) : 0).attr("y", mob ? -9 : 4).attr("text-anchor", "start")
          .attr("font-size",12.5).attr("font-weight",d=>d.id==="stonehenge"?700:400).attr("fill",C.ink).text(d=>d.nom)
          .each(function(){ IBV.halo(d3.select(this)); });
        IBV.hover(svg.node(), (ev,[px,py]) => {
          const i = clamp(Math.round((py-16)/rowH), 0, M.length-1), d = M[i];
          IBV.focus(rows, q=>q===d);
          tp.show(`<b>${d.nom}</b> · ${yr(d.inici)} – ${d.fi<0?yr(d.fi):d.fi>=2026?"avui":d.fi+" dC"} · ${d.detall}`);
        }, () => { IBV.focus(rows, null); tp.hide(); });
      } else {
        const H = Math.round(w*.52);
        const svg = IBV.svg(container, w, H, "Mapa del món amb els grans jaciments megalítics.");
        container.appendChild(container.querySelector(".tip.ibv-dock"));
        const proj = d3.geoEqualEarth().fitExtent([[4,4],[w-4,H-4]], {type:"Sphere"});
        const path = d3.geoPath(proj), g = svg.append("g");
        IBV.world().then(wd => {
          g.insert("path", ":first-child").attr("d", path(wd.land)).attr("fill", C.land);
        });
        const sites = g.selectAll("g.s").data(M).join("g").attr("class","s").attr("transform",d=>`translate(${proj([d.lon,d.lat])})`);
        sites.append("circle").attr("r",d=>Math.sqrt(d.pes)*2.4+3).attr("fill",d=>IBV.alpha(d.id==="stonehenge"?C.vermell:C.blau,.32)).style("mix-blend-mode","multiply");
        sites.append("circle").attr("r",1.8).attr("fill",C.ink);
        const dl = d3.Delaunay.from(M, d=>proj([d.lon,d.lat])[0], d=>proj([d.lon,d.lat])[1]);
        IBV.hover(svg.node(), (ev,[x,y]) => { const d = M[dl.find(x,y)]; IBV.focus(sites, q=>q===d); tp.show(`<b>${d.nom}</b> · ${d.lloc} · ${d.detall}`); }, () => { IBV.focus(sites, null); tp.hide(); });
        const sh = proj([D.stonehenge.lon, D.stonehenge.lat]);
        IBV.note(g, {x:sh[0], y:sh[1]-4, tx:sh[0]-30, ty:sh[1]-40, kind:"elbow", anchor:"end", lines:[["Stonehenge",true]]});
      }
    }
    IBV.mount(el, (c, w) => draw(c, w));
  })();

  /* =========================================================================
     V12 · CADA SEGLE S'INVENTA EL SEU STONEHENGE (IB-38, filera cronològica)
     ========================================================================= */
  (function initMirall(){
    const el = document.getElementById("mir-viz"); if(!el) return;
    const tp = IBV.tip(el);
    const E = D.mirall;
    IBV.mount(el, (container, w) => {
      const mob = w < 600, step = mob ? 26 : 30, minGap = mob ? 62 : 104;
      // eix trencat: 1100–1790 comprimit, 1790–2030 ample (on passen gairebé totes les intervencions)
      const x = d3.scaleLinear().domain([1100,1790,2035]).range([10, w*(mob?.22:.26), w-10]);
      const lanes = {dalt:[], baix:[]};
      E.slice().sort((p,q)=>p.any-q.any).forEach(d => {
        if(mob && !d.clau){ d._k = -1; return; }
        const wd = Math.max(d.curt.length, String(d.anyTxt||d.any).length) * (mob?6.2:6.6) + 4;
        d._lx = Math.min(x(d.any) + 3, w - 6 - wd);
        const L = lanes[d.tipus]; let k = 0; while(L[k] != null && d._lx - 6 < L[k]) k++; L[k] = d._lx + wd; d._k = k; });
      const nT = Math.max(1, lanes.dalt.length), nB = Math.max(1, lanes.baix.length);
      const yI = 30 + nT*step + 10, H = yI + 40 + nB*step + 10;
      const svg = IBV.svg(container, w, H, "Filera cronològica de 1136 a 2026: les interpretacions de Stonehenge a dalt i les intervencions físiques a baix.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      const g = svg.append("g");
      g.append("line").attr("x1",x(1100)).attr("x2",x(2035)).attr("y1",yI).attr("y2",yI).attr("stroke",C.ink).attr("stroke-width",.8);
      const xb = x(1790);
      g.append("path").attr("d",`M${xb-5},${yI+5}L${xb-1},${yI-5}M${xb+1},${yI+5}L${xb+5},${yI-5}`).attr("stroke",C.ink).attr("stroke-width",.8);
      [1200,1400,1600,1800,1850,1900,1950,2000].forEach(v => { if(mob && (v===1850||v===1950||v===1200||v===1600)) return; g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",yI-3).attr("y2",yI+3).attr("stroke",C.ink); IBV.t(g, x(v), yI+16, String(v), {size:11.5, anchor:"middle", fill:C.muted, halo:true}); });
      IBV.t(g, 10, 14, "Què hi han vist", {weight:700, size:12.5});
      IBV.t(g, 10, H-6, "Què hi han fet", {weight:700, size:12.5});
      const ev = g.selectAll("g.e").data(E).join("g").attr("class","e").style("cursor","pointer");
      ev.each(function(d){
        const s = d3.select(this), px = x(d.any), up = d.tipus === "dalt", k = Math.max(0, d._k);
        const ty = up ? yI - 22 - k*step : yI + 40 + k*step;
        if(d._k >= 0) s.append("line").attr("x1",px).attr("x2",px).attr("y1",yI).attr("y2",up?ty+6:ty-14).attr("stroke",C.ink).attr("stroke-opacity",.45).attr("stroke-width",.6);
        s.append("circle").attr("cx",px).attr("cy",yI).attr("r",d.clau?5:3.6).attr("fill",up?(d.clau?C.vermell:C.ink):S3.PAPER).attr("stroke",up?"none":C.blau).attr("stroke-width",1.6);
        if(d._k >= 0) IBV.lines(s, d._lx, ty-2, [[d.curt,true],[String(d.anyTxt||d.any)]], {size:mob?11.5:12, halo:true});
      });
      IBV.onView(container, inst => { if(inst) return; ev.attr("opacity",0).transition().delay((d,i)=>i*70).duration(500).attr("opacity",1); });
      const dl = d3.Delaunay.from(E, d=>x(d.any), d=>yI + (d.tipus==="dalt"?-10:10));
      IBV.hover(svg.node(), (ev2,[px,py]) => { const d = E[dl.find(px,py)]; IBV.focus(ev, q=>q===d); tp.show(`<b>${d.anyTxt||d.any} · ${d.curt}</b> · ${d.det}`); }, () => { IBV.focus(ev, null); tp.hide(); });
    });
  })();
})();
