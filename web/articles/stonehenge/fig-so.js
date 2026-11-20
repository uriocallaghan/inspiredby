/* «Per què van aixecar Stonehenge?» · so */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, S3 = window.SH3D, C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C);
  const {segBind, MODEL, clamp} = window.SHA;
  const F1 = IBV.fmt(",.1f"), F2 = IBV.fmt(",.2f");
  const D2R = Math.PI/180, AX = S3.AX;

  /* =========================================================================
     V8 · UNA CAMBRA DE RESSONÀNCIA (MAP-19 aplicat al so: raigs que reboten)
     A l'esquerra, la planta de les pedres (estat c. 2200 aC) en gravat, amb raigs de so que surten d'una veu:
     blau mentre és so directe, vermell un cop les pedres l'han retornat. A la dreta, el que es va mesurar
     (Cox, Fazenda i Greaney, 2020): com s'apaga la veu segons la reverberació i quant s'amplifica.
     ========================================================================= */
  (function initSo(){
    const el = document.getElementById("so-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el);
    const AC = Object.fromEntries((D.acustica||[]).map(d => [d.id, d]));
    let mode = "pedres";
    const STONES = MODEL.filter(s => !s.lintel && s.ph[0] <= 4 && s.ph[1] >= 4 && s.g !== "trineu" && s.id !== "bmov" && Math.hypot(s.x,s.y) < 20).map(s => ({
      x:s.x, y:s.y, ca:Math.sin(s.rot*D2R), sa:Math.cos(s.rot*D2R), nx:Math.cos(s.rot*D2R), ny:-Math.sin(s.rot*D2R), hw:s.w/2, ht:s.t/2, R:Math.hypot(s.w,s.t)/2+.3, s
    }));
    const LINTELS = MODEL.filter(s => s.lintel && s.g === "llinda");
    const TRIL = MODEL.filter(s => s.lintel && s.g === "trilit");
    let W = 0, H = 0, PW = 0, PH = 0, trail = null, base = null, panel = null, rays = [], tPulse = 0, sc = 1, cx = 0, cy = 0, mob = false, live = null;
    const N = 400, SPEED = 6.5;   // m per segon de simulació (càmera molt lenta)
    const VOICE = [0, .6];

    function pulse(){
      rays = d3.range(N).map(i => { const a = i/N*Math.PI*2 + .004; return {x:VOICE[0], y:VOICE[1], px:VOICE[0], py:VOICE[1], vx:Math.cos(a)*SPEED, vy:Math.sin(a)*SPEED, e:1, b:0}; });
      tPulse = 0;
      if(trail) trail.clearRect(0,0,W,PH);
    }
    function step(dt){
      const sub = 3, h = dt/sub;
      for(const r of rays){ r.px = r.x; r.py = r.y; }
      for(let k=0;k<sub;k++) for(const r of rays){
        if(r.e < .03) continue;
        r.x += r.vx*h; r.y += r.vy*h;
        if(mode === "pedres") for(const s of STONES){
          const dx = r.x - s.x, dy = r.y - s.y; if(dx*dx+dy*dy > s.R*s.R) continue;
          const u = dx*s.ca + dy*s.sa, v = dx*s.nx + dy*s.ny;
          if(Math.abs(u) < s.hw && Math.abs(v) < s.ht){
            const vu = r.vx*s.ca + r.vy*s.sa, vv = r.vx*s.nx + r.vy*s.ny;
            let nu = vu, nv = vv;
            if(s.hw - Math.abs(u) < s.ht - Math.abs(v)) nu = -vu; else nv = -vv;
            r.vx = nu*s.ca + nv*s.nx; r.vy = nu*s.sa + nv*s.ny;
            r.x += r.vx*h*1.5; r.y += r.vy*h*1.5;
            r.e *= .8; r.b++;   // part de l'energia s'absorbeix a cada rebot (esquema)
          }
        }
        if(r.x*r.x + r.y*r.y > 40*40) r.e = 0;
      }
    }
    const P = (x,y) => [cx + x*sc, cy - y*sc];
    // pedra en planta: rectangle amb cantons arrodonits, ombra cap al SE i un ombrejat suau
    function stonePath(c, s, grow){
      const g = grow||0, hw = s.hw + g, ht = s.ht + g, rr = Math.min(hw, ht)*.45;
      const pts = [[-hw,-ht],[hw,-ht],[hw,ht],[-hw,ht]].map(([u,v]) => P(s.x + u*s.ca + v*s.nx, s.y + u*s.sa + v*s.ny));
      const k = rr/Math.min(hw*2, ht*2);
      c.beginPath();
      for(let i=0;i<4;i++){
        const a = pts[i], b = pts[(i+1)%4], m0 = [a[0]+(b[0]-a[0])*k, a[1]+(b[1]-a[1])*k];
        if(i===0) c.moveTo(m0[0], m0[1]); else c.quadraticCurveTo(a[0], a[1], m0[0], m0[1]);
        const m1 = [b[0]+(a[0]-b[0])*k, b[1]+(a[1]-b[1])*k]; c.lineTo(m1[0], m1[1]);
      }
      const a0 = pts[0], b0 = pts[1]; c.quadraticCurveTo(a0[0], a0[1], a0[0]+(b0[0]-a0[0])*k, a0[1]+(b0[1]-a0[1])*k);
      c.closePath();
    }
    function drawStatic(){
      const c = base; c.clearRect(0,0,W,PH);
      const on = mode === "pedres";
      // anells de referència: fossat (fora de quadre) i cercle de sarsens
      [[15,.10],[12.2,.06]].forEach(([r,a]) => { c.beginPath(); c.arc(cx, cy, r*sc, 0, 7); c.strokeStyle = IBV.alpha(C.ink,a); c.lineWidth = .6; c.setLineDash([2,3]); c.stroke(); c.setLineDash([]); });
      // ombres projectades (llum del NO)
      c.save(); c.globalAlpha = on ? 1 : .35; c.translate(sc*.35, sc*.35); c.fillStyle = IBV.alpha(C.ink,.07);
      STONES.forEach(s => { stonePath(c, s, .05); c.fill(); }); c.restore();
      STONES.forEach(s => {
        const blava = s.s.g === "blava";
        c.save(); c.globalAlpha = on ? 1 : .3;
        stonePath(c, s);
        const [x0,y0] = P(s.x - .8, s.y + .8), [x1,y1] = P(s.x + .8, s.y - .8);
        const gr = c.createLinearGradient(x0,y0,x1,y1);
        gr.addColorStop(0, blava ? "#EEF1F6" : "#F6F4EF"); gr.addColorStop(1, blava ? "#C9D3E3" : "#DAD5CB");
        c.fillStyle = gr; c.fill();
        c.strokeStyle = IBV.alpha(C.ink,.85); c.lineWidth = .75; c.stroke();
        // cops de percussió (acabat picat dels sarsens)
        if(!blava && sc > 6){ const rnd = IBV.rng(Math.round((s.x+40)*97 + (s.y+40)*13)); c.fillStyle = IBV.alpha(C.ink,.22);
          for(let i=0;i<5;i++){ const u = (rnd()-.5)*s.hw*1.5, v = (rnd()-.5)*s.ht*1.4, q = P(s.x + u*s.ca + v*s.nx, s.y + u*s.sa + v*s.ny); c.fillRect(q[0]-.4, q[1]-.4, .8, .8); } }
        c.restore();
      });
      // l'anell continu de llindes, per sobre (el que retorna el so cap a dins)
      c.save(); c.globalAlpha = on ? 1 : .3;
      LINTELS.forEach(s => { const [b0,b1,R] = s.arc, a0 = (90-b1)*D2R, a1 = (90-b0)*D2R;
        c.beginPath(); c.arc(cx, cy, (R+.5)*sc, -a1, -a0); c.arc(cx, cy, (R-.5)*sc, -a0, -a1, true); c.closePath();
        c.fillStyle = IBV.alpha("#E2DDD3", .55); c.fill(); c.strokeStyle = IBV.alpha(C.ink,.55); c.lineWidth = .55; c.stroke(); });
      TRIL.forEach(s => { stonePath(c, {x:s.x, y:s.y, ca:Math.sin(s.rot*D2R), sa:Math.cos(s.rot*D2R), nx:Math.cos(s.rot*D2R), ny:-Math.sin(s.rot*D2R), hw:s.w/2, ht:s.t/2});
        c.fillStyle = IBV.alpha("#E2DDD3", .5); c.fill(); c.strokeStyle = IBV.alpha(C.ink,.55); c.lineWidth = .55; c.stroke(); });
      c.restore();
      // la veu: una persona que parla al centre (vista des de dalt: cap i espatlles)
      const v = P(VOICE[0], VOICE[1]);
      c.beginPath(); c.ellipse(v[0], v[1], .26*sc, .14*sc, 0, 0, 7); c.fillStyle = C.ink; c.fill();
      c.beginPath(); c.arc(v[0], v[1], .11*sc, 0, 7); c.fillStyle = C.vermell; c.fill();
    }
    function labels(svg){
      const g = svg.append("g").attr("class","so-lab");
      const v = P(VOICE[0], VOICE[1]);
      const fs = mob ? 11.5 : 12.5;
      IBV.note(g, {x:v[0]+4, y:v[1]-3, tx:v[0]+ (mob?46:70), ty:v[1]-(mob?40:58), kind:"curve", bend:-10, anchor:"start", size:fs, lines:[["Una veu",true],["al centre del cercle"]]});
      const r = P(...S3.pol(15.9, AX+178));
      IBV.note(g, {x:r[0]-3, y:r[1]+3, tx:6, ty:PH-(mob?22:70), kind:"curve", bend:-20, anchor:"start", size:fs, lines:[["Pilars i llindes",true],["un anell gairebé tancat","",C.ink2]]});
      // llegenda dels raigs
      const ly = mob ? 12 : 16;
      [[C.blau,"so directe"],[C.vermell,mob?"retornat per les pedres":"so retornat per les pedres"]].forEach(([col,t],i) => {
        if(mode === "camp" && i) return;
        const lx = mob ? 6 + i*104 : 6, yy = mob ? ly : ly + i*18;
        g.append("line").attr("x1",lx).attr("x2",lx+18).attr("y1",yy).attr("y2",yy).attr("stroke",col).attr("stroke-width",2).attr("stroke-linecap","round");
        IBV.t(g, lx+24, yy+4, t, {size:fs, fill:C.ink2});
      });
      live = IBV.t(g, 6, mob ? 34 : PH-14, "", {size:fs, fill:C.muted, halo:true});
    }
    // panell de la dreta: el que es va mesurar
    function drawPanel(inst){
      panel.selectAll("*").remove();
      const x0 = mob ? 10 : PW + 34, x1 = W - 8, top = mob ? PH + 14 : 20;
      const fsT = mob ? 13 : 13.5, fs = mob ? 11.5 : 12.5;
      const g = panel.append("g");
      IBV.t(g, x0, top+4, "Com s'apaga la veu", {weight:700, size:fsT});
      IBV.t(g, x0, top+22, W < 380 ? "caiguda del so, segons la reverberació mesurada" : "caiguda del so després d'una paraula, segons la reverberació mesurada", {size:fs, fill:C.ink2});
      const cy0 = top + 46, cy1 = cy0 + (mob ? 150 : Math.max(170, PH - 330));
      const x = d3.scaleLinear().domain([0, 1]).range([x0+30, x1-6]), y = d3.scaleLinear().domain([-60, 0]).range([cy1, cy0]);
      [0,-20,-40,-60].forEach(v => { g.append("line").attr("x1",x(0)).attr("x2",x(1)).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.grid).attr("stroke-width",v===-60?.9:.6).attr("stroke",v===-60?C.ink:C.grid);
        IBV.t(g, x0+24, y(v)+4, v ? `${v} dB` : "0 dB", {size:11, anchor:"end", fill:C.muted}); });
      [0,.25,.5,.75,1].forEach(v => IBV.t(g, x(v), cy1+15, v ? `${String(v).replace(".",",")} s` : "0 s", {size:11, anchor:"middle", fill:C.muted}));
      const L = [
        {id:"int", col:C.vermell, w:2.2, txt:"Dins el cercle · 0,64 s"},
        {id:"sala", col:C.ink2, w:1, dash:"3 3", txt:"Sala de conferències · 0,65 s"},
        {id:"ext", col:C.blau, w:1.6, txt:"Fora del cercle · 0,14 s"},
        {id:"camp", col:C.ink, w:1.2, txt:"Camp obert · no torna"}
      ].filter(d => AC[d.id]);
      const lg = g.append("g");
      const paths = L.map((d,i) => {
        const rt = AC[d.id].rt, pts = rt > 0 ? [[0,0],[Math.min(1, rt), -60*Math.min(1, rt)/rt]] : [[0,0],[.004,-60]];
        const p = lg.append("path").datum(d).attr("d", d3.line().x(q=>x(q[0])).y(q=>y(q[1]))(pts)).attr("fill","none").attr("stroke",d.col).attr("stroke-width",d.w).attr("stroke-dasharray",d.dash||null).attr("stroke-linecap","round");
        return p;
      });
      // clau de les línies, a sota del gràfic
      const ky = cy1 + 34, colW = (x1 - x0)/2;
      L.forEach((d,i) => { const kx = x0 + (i%2)*colW, yy = ky + Math.floor(i/2)*19;
        lg.append("line").datum(d).attr("x1",kx).attr("x2",kx+20).attr("y1",yy-4).attr("y2",yy-4).attr("stroke",d.col).attr("stroke-width",Math.max(1.4,d.w)).attr("stroke-dasharray",d.dash||null);
        IBV.t(lg, kx+26, yy, d.txt, {size:fs, fill:d.id==="camp"||d.id==="sala"?C.ink2:d.col, weight:d.id==="int"?700:400}).datum(d); });
      IBV.t(lg, x(.66)+8, y(-60)-8, "gairebé idèntiques", {size:11, fill:C.muted, italic:true, halo:true});
      // l'amplificació de la veu
      const by0 = cy1 + (mob ? 92 : 98);
      IBV.t(g, x0, by0, "Quant s'amplifica la veu", {weight:700, size:fsT});
      const B = [["int","Dins el cercle",C.vermell],["ext","Fora del cercle",C.blau],["camp","Camp obert",C.ghost]].filter(d => AC[d[0]]);
      const bx = d3.scaleLinear().domain([0, 6]).range([x0+110, x1-40]);
      const bars = g.append("g");
      B.forEach(([id,t,col],i) => { const yy = by0 + 22 + i*24, a = AC[id].amp;
        IBV.t(bars, x0, yy+4, t, {size:fs, fill:C.ink2});
        bars.append("line").attr("x1",bx(0)).attr("x2",bx(0)).attr("y1",yy-8).attr("y2",yy+8).attr("stroke",C.ink).attr("stroke-width",.8);
        const r = bars.append("rect").datum({id}).attr("x",bx(0)).attr("y",yy-5).attr("height",10).attr("width",inst?Math.max(1, bx(a)-bx(0)):0).attr("fill",col);
        if(!inst) r.transition("in").delay(500+i*150).duration(900).ease(d3.easeCubicOut).attr("width", Math.max(1, bx(a)-bx(0)));
        if(id === "int"){ bars.append("line").attr("x1",bx(a-.9)).attr("x2",bx(a+.9)).attr("y1",yy).attr("y2",yy).attr("stroke",C.ink).attr("stroke-width",.8);
          [a-.9,a+.9].forEach(q => bars.append("line").attr("x1",bx(q)).attr("x2",bx(q)).attr("y1",yy-3).attr("y2",yy+3).attr("stroke",C.ink).attr("stroke-width",.8)); }
        IBV.t(bars, (id==="int"?bx(a+.9):bx(a)) + 6, yy+4, a ? `+${F1(a)} dB` : "0 dB", {size:fs, weight:id==="int"?700:400, fill:C.ink});
      });
      // entrada: les línies es dibuixen d'esquerra a dreta
      if(!inst) paths.forEach((p,i) => { const Ln = p.node().getTotalLength(); p.attr("stroke-dasharray", p.datum().dash || `${Ln} ${Ln}`).attr("stroke-dashoffset", p.datum().dash ? 0 : Ln)
        .transition("in").delay(i*180).duration(1100).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0); });
      const hi = () => { const on = d => !d || (mode === "camp" ? d.id === "camp" : d.id !== "camp");
        IBV.focus(lg.selectAll("path,text"), on, {dim:.46}); IBV.focus(bars.selectAll("rect"), d => on(d)); };
      hi(); panel.__hi = hi;
      panel.__hit = (px,py) => {
        if(px < x0 || py < cy0-10) return null;
        if(py <= cy1 + 8 && px >= x(0)){ const tt = x.invert(px); let best = null, bd = 1e9;
          L.forEach(d => { const rt = AC[d.id].rt, yy = rt > 0 ? y(Math.max(-60, -60*tt/rt)) : (tt < .01 ? py : y(-60)); const dd = Math.abs(yy - py); if(dd < bd){ bd = dd; best = d; } });
          return bd < 18 ? best.id : null; }
        if(py < by0 - 10){ const i = Math.floor((py - (cy1+34) + 14)/19)*2 + (px > x0 + (x1-x0)/2 ? 1 : 0); return L[i] ? L[i].id : null; }
        const i = Math.round((py - by0 - 22)/24); return B[i] ? B[i][0] : null;
      };
    }
    let svg = null;
    IBV.mount(el, (container, w) => {
      W = w; mob = w < 800; // fins a tauleta vertical, el panell va a sota: al costat no hi cap el text
      PW = mob ? W : Math.round(W*.52);
      PH = Math.round(mob ? clamp(W*1.12, 340, 560) : clamp(W*.5, 380, 560));
      H = mob ? PH + 385 : PH;
      d3.select(container).selectAll("canvas,svg").remove();
      sc = Math.min(PW, PH - (mob?70:0))/2/17.2; cx = PW/2; cy = PH/2 + (mob ? 14 : 0);
      const b = IBV.canvas(container, W, H, "Planta de Stonehenge amb raigs de so que surten d'una veu al centre i reboten contra les pedres; al costat, la reverberació i l'amplificació mesurades per Cox et al. (2020).");
      base = b.ctx;
      const dpr = Math.min(2, window.devicePixelRatio||1);
      const tc = d3.select(container).append("canvas").attr("width",W*dpr).attr("height",PH*dpr).style("width",W+"px").style("height",PH+"px").style("position","absolute").style("left",0).style("top",0).style("pointer-events","none").node();
      trail = tc.getContext("2d"); trail.scale(dpr,dpr);
      svg = IBV.svg(container, W, H, "").style("position","absolute").style("left",0).style("top",0);
      panel = svg.append("g");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      drawStatic(); labels(svg); pulse();
      IBV.onView(el, inst => drawPanel(inst));
      if(IBV.reduced) staticTrail();
      IBV.hover(svg.node(), (ev,[px,py]) => {
        const id = panel.__hit && panel.__hit(px,py);
        if(id){ const d = AC[id]; tp.show(`<b>${d.nom}</b> · ${d.detall}`); return; }
        if(px > PW || py > PH){ tp.hide(); return; }
        const r = Math.hypot(px-cx, py-cy)/sc;
        tp.show(r < 15.6 ? `<b>Dins el cercle</b> · reverberació de 0,64 s i veu +4,3 dB més forta (Cox et al., 2020)` : `<b>Fora del cercle</b> · el so s'escapa: 0,14 s de reverberació i només +0,4 dB`);
      }, () => tp.hide());
    });
    segBind(fig.querySelector(".seg"), "k", k => { mode = k; if(!base) return; drawStatic(); svg.selectAll(".so-lab").remove(); labels(svg); pulse(); if(panel.__hi) panel.__hi(); if(IBV.reduced) staticTrail(); });

    function seg(r, a){
      trail.strokeStyle = r.b ? C.vermell : C.blau; trail.globalAlpha = a;
      trail.beginPath(); trail.moveTo(cx + r.px*sc, cy - r.py*sc); trail.lineTo(cx + r.x*sc, cy - r.y*sc); trail.stroke();
    }
    // moviment reduït: el rastre dels primers segons, dibuixat d'un cop
    function staticTrail(){
      trail.clearRect(0,0,W,PH);
      // instantànies successives dels fronts d'ona: punts on és cada raig cada 0,3 s
      for(let i = 1; i <= 66; i++){ step(.05);
        if(i % 6) continue;
        const age = i/66;
        for(const r of rays){ if(r.e < .03) continue; trail.fillStyle = r.b ? C.vermell : C.blau; trail.globalAlpha = (.2 + .55*r.e)*(1 - age*.45);
          trail.beginPath(); trail.arc(cx + r.x*sc, cy - r.y*sc, .95, 0, 7); trail.fill(); } }
      trail.globalAlpha = 1;
      if(live) live.text(mode === "pedres" ? "Fronts d'ona cada 0,3 s de simulació: el so rebota i es queda dins" : "Fronts d'ona cada 0,3 s de simulació: el so marxa i no torna");
    }
    IBV.loop(el, (t, dt) => {
      if(!trail || IBV.reduced) return;
      const sdt = dt/1000;
      tPulse += sdt;
      step(sdt);
      // estela que s'esvaeix sense pintar fons (destination-out)
      trail.save(); trail.globalCompositeOperation = "destination-out"; trail.fillStyle = "rgba(0,0,0,0.085)"; trail.fillRect(0,0,W,PH); trail.restore();
      trail.lineWidth = 1.1; trail.lineCap = "round";
      let inside = 0, alive = 0;
      for(const r of rays){
        if(r.e < .03) continue; alive++;
        if(r.x*r.x + r.y*r.y < 15.6*15.6) inside += r.e;
        seg(r, .25 + .6*r.e);
      }
      trail.globalAlpha = 1;
      // fronts d'ona: el so directe s'expandeix en un anell
      if(tPulse < 3.2){ trail.beginPath(); trail.arc(cx + VOICE[0]*sc, cy - VOICE[1]*sc, tPulse*SPEED*sc, 0, 7); trail.strokeStyle = IBV.alpha(C.blau, .5*(1 - tPulse/3.2)); trail.lineWidth = .8; trail.stroke(); }
      if(live && Math.round(t/250) !== live.__k){ live.__k = Math.round(t/250); live.text(`Energia que encara és dins el cercle: ${Math.round(100*inside/N)} %`); }
      if(tPulse > 7.5 || (tPulse > 1.5 && !alive)){ pulse(); }
    });
  })();
})();
