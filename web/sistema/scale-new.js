/* Sistema infogràfic d'Inspired by Magazine · Escala (peces noves): SCALE-03, SCALE-05 i SCALE-06.
   Cada bloc «SCALE-nn» és una peça completa que es pot copiar a un article i adaptar.
   Fa servir assets/ib-viz.js (IBV) i, si hi és, assets/ib-gent.js (IBGENT: figures humanes de silueta).
   Ve de «Per què van aixecar Stonehenge?» (fig-gent, fig-escala i fig-moure). */
(function(){
"use strict";
const V=IBV, C=V.C;
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,k)=>d3.interpolateLab(a,b)(k);
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,draw):{redraw(){}}; }
function seg(n,cb){ const bs=document.querySelectorAll(`[data-seg="${n}"] button`);
  bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(o=>o.setAttribute("aria-pressed",o===b)); cb(b.dataset.k,b); })); }
function legend(n,fn){ const el=$(`[data-lg="${n}"]`); if(el&&!el.childElementCount)fn(el); }
// text amb halo al canvas
function ctext(ctx,x,y,str,o){ o=o||{}; ctx.save();
  ctx.font=`${o.italic?"italic ":""}${o.weight||400} ${o.size||12.5}px ${o.serif?V.SERIF:V.SANS}`;
  ctx.textAlign=o.anchor||"left"; ctx.textBaseline=o.base||"middle"; ctx.lineJoin="round";
  if(o.halo!==false){ ctx.lineWidth=3.2; ctx.strokeStyle=C.paper; ctx.strokeText(str,x,y); }
  ctx.fillStyle=o.fill||C.ink; ctx.fillText(str,x,y); ctx.restore(); }

/* Figures humanes: el component compartit assets/ib-gent.js; si la pàgina no el carrega, una còpia mínima. */
const G=window.IBGENT||(function(){
  const POSES = {
    //        inclinació, cama davant [angle, genoll], cama darrere, braç 1 [espatlla, colze], braç 2, cap, eina
    dret:    ph => ({lean:.03, L1:[.06,.03], L2:[-.07,.04], A1:[.08,.12], A2:[-.05,.1], head:.05}),
    mira:    ph => ({lean:-.02, L1:[.07,.02], L2:[-.06,.03], A1:[.04,.08], A2:[-.02,.1], head:-.25}),
    camina:  ph => { const sw = Math.sin(ph); return {lean:.07, L1:[.36*sw, Math.max(0,-sw)*.7 + .06], L2:[-.36*sw, Math.max(0,sw)*.7 + .06], A1:[-.38*sw, .3], A2:[.38*sw, .3], head:.08}; },
    porta:   ph => { const sw = Math.sin(ph); return {lean:.1, L1:[.3*sw, Math.max(0,-sw)*.6 + .06], L2:[-.3*sw, Math.max(0,sw)*.6 + .06], A1:[.05, 2.5], A2:[.3*sw, .3], head:.08, eina:"banya-espatlla"}; },
    estira:  ph => { const sw = Math.sin(ph)*.08; return {lean:.62, L1:[.55+sw, .55], L2:[-.42+sw, .08], A1:[.55, 2.0], A2:[.35, 2.2], head:.35}; },
    palanca: ph => ({lean:.75, L1:[.35, .4], L2:[-.38, .06], A1:[1.15, .12], A2:[1.0, .18], head:.3}),
    picar:   ph => { const u = (Math.sin(ph)+1)/2; return {lean:.38, L1:[1.35, 1.35], L2:[.05, 1.6], A1:[1.2 + 1.5*u, .35], A2:[1.1 + 1.5*u, .45], head:.25, eina:"maça"}; },
    cavar:   ph => { const u = (Math.sin(ph)+1)/2; return {lean:.5 + .2*(1-u), L1:[.4, .35], L2:[-.32, .05], A1:[.9 + 1.7*u, .35], A2:[.8 + 1.7*u, .45], head:.25, eina:"banya"}; }
  };
  function silhouette(p, x, y, h, pose, ph, dir, o){
    dir = dir||1; ph = ph||0; o = o||{};
    const flush = () => { if(p.__flush) p.__flush(); };
    const P = (POSES[pose] || POSES.dret)(ph);
    const dn = a => [Math.sin(a), -Math.cos(a)], up = a => [Math.sin(a), Math.cos(a)];
    const add = (q, v, k) => [q[0] + v[0]*k, q[1] + v[1]*k];
    // esquelet en coordenades locals (x endavant, y amunt, unitats d'alçada), amb el maluc a l'origen
    const hip = [0, 0];
    const leg = ([th, kb]) => { const knee = add(hip, dn(th), .245), ank = add(knee, dn(th - kb), .245);
      const toe = kb > 1.2 ? add(ank, dn(th - kb), .05) : [ank[0] + .075, ank[1] - .005]; return [hip, knee, ank, toe]; };
    const Lf = leg(P.L1), Lb = leg(P.L2);
    const lean = P.lean;
    const waist = add(hip, up(lean*.8), .1), chest = add(waist, up(lean), .13), sh = add(chest, up(lean*1.05), .06);
    const neckTop = add(sh, up(lean*.7 + .12 + P.head*.4), .065), head = add(neckTop, up(lean*.6 + P.head*.5 + .15), .052);
    const arm = ([th, el]) => { const elb = add(sh, dn(th), .165), wr = add(elb, dn(th + el), .15), hand = add(wr, dn(th + el), .035); return [sh, elb, wr, hand]; };
    const Af = arm(P.A1), Ab = arm(P.A2);
    // terra: el punt més baix (peu, genoll de qui està agenollat) toca y = 0
    const low = Math.min(...[Lf, Lb].flatMap(L => [L[2][1], L[3][1], L[1][1] + .03]));
    const S = q => [x + dir*q[0]*h, y - (q[1] - low)*h];
    // tub de gruix variable amb corbes suaves i puntes rodones (en coordenades de pantalla)
    const tube = (pts, ws) => {
      const Q = pts.map(S), n = Q.length, W = ws.map(w => w*h/2);
      const nrm = Q.map((q,i) => { const a = Q[Math.max(0,i-1)], b = Q[Math.min(n-1,i+1)], dx = b[0]-a[0], dy = b[1]-a[1], L = Math.hypot(dx,dy)||1; return [-dy/L, dx/L]; });
      const Lp = Q.map((q,i) => [q[0] + nrm[i][0]*W[i], q[1] + nrm[i][1]*W[i]]), Rp = Q.map((q,i) => [q[0] - nrm[i][0]*W[i], q[1] - nrm[i][1]*W[i]]);
      const curve = (pts2) => { for(let i=1;i<pts2.length-1;i++){ const a = pts2[i], b = pts2[i+1]; p.quadraticCurveTo(a[0], a[1], (a[0]+b[0])/2, (a[1]+b[1])/2); } p.lineTo(pts2[pts2.length-1][0], pts2[pts2.length-1][1]); };
      const capArc = (c, r, nv, tipv) => { const aN = Math.atan2(nv[1], nv[0]), tip = Math.atan2(tipv[1], tipv[0]);
        p.arc(c[0], c[1], Math.max(.3, r), aN, aN + Math.PI, Math.cos(aN + Math.PI/2 - tip) < 0); };
      p.moveTo(Lp[0][0], Lp[0][1]); curve(Lp);
      const dE = [Q[n-1][0]-Q[n-2][0], Q[n-1][1]-Q[n-2][1]]; capArc(Q[n-1], W[n-1], nrm[n-1], dE);
      curve(Rp.slice().reverse());
      const dS = [Q[0][0]-Q[1][0], Q[0][1]-Q[1][1]]; capArc(Q[0], W[0], [-nrm[0][0], -nrm[0][1]], dS);
      p.closePath(); flush();
    };
    const circle = (c, r) => { const q = S(c); p.moveTo(q[0] + r*h, q[1]); p.arc(q[0], q[1], r*h, 0, Math.PI*2); p.closePath(); flush(); };
    // cames: la del darrere primer
    tube(Lb, [.088, .058, .04, .026]); tube(Lf, [.088, .058, .04, .026]);
    // túnica fins al genoll, que segueix la direcció mitjana de les cuixes
    const thighDir = [(Lf[1][0] + Lb[1][0])/2, (Lf[1][1] + Lb[1][1])/2], tl = Math.hypot(...thighDir)||1;
    const hem = add(hip, [thighDir[0]/tl, thighDir[1]/tl], .17);
    // forma tancada i suau (punts de control amb corbes pel mig)
    const blob = pts => { const Q = pts.map(S), n = Q.length, mid = (a,b) => [(a[0]+b[0])/2, (a[1]+b[1])/2];
      const m0 = mid(Q[n-1], Q[0]); p.moveTo(m0[0], m0[1]);
      for(let i=0;i<n;i++){ const a = Q[i], b = Q[(i+1)%n], m = mid(a,b); p.quadraticCurveTo(a[0], a[1], m[0], m[1]); }
      p.closePath(); flush(); };
    const fw = [Math.cos(lean), -Math.sin(lean)];                          // endavant, perpendicular al tors
    const tdir = [thighDir[0]/tl, thighDir[1]/tl], fh = [-tdir[1], tdir[0]];  // perpendicular a la cuixa (vora de la túnica)
    const fhf = fh[0] < 0 ? [-fh[0], -fh[1]] : fh;
    if(o.capa) blob([add(sh, fw, -.02), add(chest, fw, -.085), add(waist, fw, -.09), add(add(hem, fhf, -.13), [0,-.04], 1), add(add(hem, fhf, -.04), [0,-.03], 1), add(waist, fw, -.03), add(chest, fw, -.02)]);
    blob([add(sh, fw, .045), add(chest, fw, .068), add(waist, fw, .058), add(hem, fhf, .1), add(hem, fhf, -.115), add(waist, fw, -.062), add(chest, fw, -.07), add(sh, fw, -.05), add(add(sh, up(lean), .015), fw, 0)]);
    // braç del darrere, coll, cap i cabells, braç del davant
    tube(Ab, [.056, .044, .034, .04]);
    tube([sh, neckTop], [.06, .05]);
    circle(head, .062);
    if(o.pel === "llarg") tube([add(head, [-.03, .045], 1), add(head, [-.07, -.02], 1), add(head, [-.075, -.11], 1)], [.075, .06, .035]);
    else if(o.pel === "monyo") circle(add(head, [-.066, .035], 1), .03);
    else circle(add(head, [-.012, .012], 1), .063);
    tube(Af, [.056, .044, .034, .04]);
    // eines de l'època
    const hand = Af[3], fd = (() => { const dx = Af[3][0]-Af[2][0], dy = Af[3][1]-Af[2][1], L = Math.hypot(dx,dy)||1; return [dx/L, dy/L]; })();
    if(P.eina === "maça") circle(add(hand, fd, .03), .05);                               // percussor de pedra
    if(P.eina === "banya"){ const t0 = add(hand, fd, -.1), t1 = add(hand, fd, .16), t2 = add(t1, [fd[1], -fd[0]], -.09);
      tube([t0, hand, t1], [.022, .02, .016]); tube([add(hand, fd, .1), t2], [.016, .008]); }  // pic de banya de cérvol
    if(P.eina === "banya-espatlla"){ const t0 = add(hand, [-.2, -.02], 1), t1 = add(hand, [.12, .04], 1);
      tube([t0, hand, t1], [.022, .02, .016]); tube([add(t1, [-.03, 0], 1), add(t1, [.03, .08], 1)], [.014, .008]); }
    return {hand: S(Af[3]), shoulder: S(sh), head: S(head)};
  }
  function drawSil(ctx, x, y, h, pose, ph, dir, col, o){
    ctx.fillStyle = col || C.ink; ctx.beginPath();
    ctx.__flush = () => { ctx.fill(); ctx.beginPath(); };
    const r = silhouette(ctx, x, y, h, pose, ph, dir, o);
    ctx.__flush = null; return r;
  }
  // per a SVG: retorna una llista de camins (un per peça)
  function silPaths(x, y, h, pose, ph, dir, o){
    const out = []; let cur = d3.path();
    const w = {moveTo:(a,b)=>cur.moveTo(a,b), lineTo:(a,b)=>cur.lineTo(a,b), arc:(...a)=>cur.arc(...a), quadraticCurveTo:(...a)=>cur.quadraticCurveTo(...a), closePath:()=>cur.closePath(),
      __flush(){ out.push(cur.toString()); cur = d3.path(); }};
    const r = silhouette(w, x, y, h, pose, ph, dir, o); r.paths = out; return r;
  }


  return {POSES, silhouette, drawSil, silPaths};
})();

/* =====================================================================
   SCALE-03 · RETRAT DE FIGURES  (dades reals, arrodonides)
   Una quantitat explicada en persones: si el món fos 100 persones, d'on serien.
   Cada figura és una silueta diferent (alçada, pentinat, pose); els grups es poden agrupar o barrejar.
   ===================================================================== */
const P03=[
  {k:"as",t:"Àsia",n:59,c:C.red},
  {k:"af",t:"Àfrica",n:18,c:C.blue},
  {k:"eu",t:"Europa",n:9,c:C.yellow},
  {k:"la",t:"Amèrica Llatina i Carib",tc:"Am. Llatina",n:8,c:C.redLight},
  {k:"na",t:"Amèrica del Nord",tc:"Am. Nord",n:5,c:C.blueLight},
  {k:"oc",t:"Oceania",n:1,c:C.ink2}
];
let mode03="grup";
legend("scale-03",el=>V.legendCat(el,P03.map(g=>({c:g.c,t:g.t}))));
piece("scale-03",(el,w)=>{
  const mob=w<560, rows=mob?6:3;
  // persones: una per cada 1 % de la població mundial
  const r=V.rng(303), POSE=["dret","dret","mira","camina","dret","porta","mira","camina"], PEL=["llarg","curt","monyo"];
  const P=[]; P03.forEach((g,gi)=>d3.range(g.n).forEach(i=>P.push({g,gi,i,
    pose:POSE[Math.floor(r()*POSE.length)], ph:r()*6, dir:r()<.5?-1:1, hk:.88+r()*.2, pel:PEL[Math.floor(r()*3)], capa:r()<.25})));
  // columnes de cada grup (agrupat) i ordre aleatori (barrejat)
  const cols=P03.map(g=>Math.ceil(g.n/rows)), gap=mob?.7:.8, totC=d3.sum(cols)+gap*(P03.length-1);
  const cw=(w-8)/(totC+.6), fh=Math.min(mob?52:70, cw*(mob?2.3:2.05)), dy=fh*(mob?.34:.4);
  const top=mob?56:66, base=top+(rows-1)*dy+fh, H=Math.round(base+(mob?44:42));
  const x0=[]; let acc=4+cw*.3; P03.forEach((g,gi)=>{ x0.push(acc); acc+=(cols[gi]+gap)*cw; });
  const posG=p=>{ const c=Math.floor(p.i/rows), rr=p.i%rows; return [x0[p.gi]+c*cw+cw/2+rr*cw*.33, base-rr*dy, rr]; };
  const sh=d3.shuffler(V.rng(7))(d3.range(P.length)), mixCols=Math.ceil(P.length/rows), mcw=(w-8)/(mixCols+.6);
  const posM=(p,k)=>{ const j=sh[k], c=Math.floor(j/rows), rr=j%rows; return [4+mcw*.3+c*mcw+mcw/2+rr*mcw*.33, base-rr*dy, rr]; };
  P.forEach((p,k)=>{ p.a=posG(p); p.b=posM(p,k); });
  el.style.height=H+"px";
  const {ctx}=V.canvas(el,w,H,"Si el món fossin 100 persones: 59 viurien a Àsia, 18 a Àfrica, 9 a Europa, 8 a l'Amèrica Llatina i el Carib, 5 a l'Amèrica del Nord i 1 a Oceania.");
  const tp=V.tip(el);
  let t=mode03==="grup"?0:1, hov=-1, rise=V.reduced||el.__seen?1:0, anim=null;
  function draw(){
    ctx.clearRect(0,0,w,H);
    // terra: una línia fina amb ombres sota cada fila
    ctx.strokeStyle=C.hair; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(0,base+.5); ctx.lineTo(w,base+.5); ctx.stroke();
    const order=P.map((p,k)=>{ const q=[p.a[0]+(p.b[0]-p.a[0])*t, p.a[1]+(p.b[1]-p.a[1])*t, p.a[2]+(p.b[2]-p.a[2])*t]; return {p,k,q}; })
      .sort((u,v)=>u.q[1]-v.q[1]);
    order.forEach(({p,k,q})=>{
      const appear=clamp(rise*1.6-k/P.length*.6,0,1); if(appear<=0)return;
      const depth=q[2]/rows, h=fh*(1-depth*.16)*p.hk, y=q[1]+(1-appear)*10;
      const dim=hov>=0&&p.gi!==hov;
      ctx.save(); ctx.globalAlpha=appear*(dim?.46:1);
      // ombra al terra
      ctx.fillStyle=V.alpha(C.ink,.07); ctx.beginPath(); ctx.ellipse(q[0],y,h*.16,h*.035,0,0,7); ctx.fill();
      const col=mix(p.g.c,C.paper,depth*.28);
      G.drawSil(ctx,q[0],y,h,p.pose,p.ph,p.dir,col,{pel:p.pel,capa:p.capa});
      ctx.restore();
    });
    // xifres: grans sobre cada grup quan estan agrupats; total quan es barregen
    const lab=1-t;
    if(lab>.02){ ctx.save(); ctx.globalAlpha=lab*clamp(rise*1.4-.3,0,1);
      P03.forEach((g,gi)=>{ const cx=x0[gi]+cols[gi]*cw/2, dim=hov>=0&&gi!==hov;
        ctx.globalAlpha=lab*clamp(rise*1.4-.3,0,1)*(dim?.46:1);
        ctext(ctx,cx,top-(mob?30:34),f0(g.n),{size:mob?20:28,serif:true,anchor:"center",fill:gi===hov?C.ink:C.ink});
        const nm=g.tc&&(mob||cols[gi]*cw<g.t.length*6.6)?g.tc:g.t;
        if(cols[gi]*cw>=nm.length*(mob?5.6:6.6)||gi===0) ctext(ctx,cx,base+16,nm,{size:mob?11:12,weight:700,anchor:"center"});
      }); ctx.restore(); }
    if(t>.02){ ctx.save(); ctx.globalAlpha=t; ctext(ctx,4,top-(mob?30:34),"100 persones, barrejades com al món",{size:mob?13:15,weight:700}); ctx.restore(); }
    ctext(ctx,w-4,H-12,"cada figura = 1 % de la humanitat, unes 82 milions de persones",{size:11.5,anchor:"right",fill:C.muted,halo:false});
  }
  function go(to){ if(anim)anim.stop(); const from=t;
    if(V.reduced){ t=to; draw(); return; }
    anim=d3.timer(e=>{ const k=Math.min(1,e/1100); t=from+(to-from)*d3.easeCubicInOut(k); draw(); if(k>=1)anim.stop(); }); }
  el._mode=k=>{ mode03=k; go(k==="grup"?0:1); };
  V.onView(el,now=>{ if(now){ rise=1; draw(); return; }
    d3.timer(function(e){ rise=Math.min(1,e/1800); draw(); if(rise>=1)this.stop(); }); });
  draw(); if(document.fonts)document.fonts.ready.then(draw);
  V.hover(el.querySelector("canvas"),(ev,[mx,my])=>{
    // la persona més propera
    let best=null,bd=1e9; P.forEach(p=>{ const qx=p.a[0]+(p.b[0]-p.a[0])*t, qy=p.a[1]+(p.b[1]-p.a[1])*t-fh*.45, d=Math.hypot(qx-mx,qy-my); if(d<bd){bd=d;best=p;} });
    const gi=best&&bd<fh?best.gi:-1; if(gi!==hov){ hov=gi; draw(); }
    if(gi>=0){ const g=P03[gi]; tp.show(`<b>${g.t}</b> · ${g.n} de cada 100 persones`); } else tp.hide();
  },()=>{ hov=-1; draw(); tp.hide(); });
});
seg("scale-03",k=>{ const el=$('[data-p="scale-03"]'); if(el&&el._mode)el._mode(k); else mode03=k; });

/* =====================================================================
   SCALE-05 · PLANTES A LA MATEIXA ESCALA  (dades reals, plantes simplificades)
   Edificis i llocs coneguts dibuixats en línia fina a una sola escala, posats dins del més gran;
   una lupa amplia el grup petit amb una persona vista des de dalt.
   ===================================================================== */
const P05={
  colos:{t:"Colosseu",d:"el·lipse de 189 × 156 m; arena d'uns 87 × 55 m (les fonts varien) · Roma, 80 dC",a:189,b:156,ia:87.5,ib:55},
  camp:{t:"Camp de futbol",d:"105 × 68 m, la mida recomanada per la FIFA",a:105,b:68},
  cup:[
    {k:"flor",t:"Cúpula de Florència",d:"45,5 m de diàmetre interior · Brunelleschi, 1436",r:45.5/2,oct:true},
    {k:"pan",t:"Panteó de Roma",d:"43,3 m de diàmetre, amb un òcul de 8,9 m · c. 125 dC",r:43.3/2,ocul:8.92/2},
    {k:"sof",t:"Santa Sofia",d:"uns 32 m de diàmetre, amb 40 finestres a la base · 537 dC",r:32/2,fin:40},
    {k:"sto",t:"Cercle de sarsens de Stonehenge",d:"uns 30 m de diàmetre · c. 2500 aC",r:30/2,sto:true}
  ]
};
piece("scale-05",(el,w)=>{
  const mob=w<700;
  const mainW=mob?w:w*.52, L=mob?w:w*.48, pad=14;
  const k=(mainW-2*pad)/(P05.colos.a+8);                // px per metre del pla principal
  const Hm=P05.colos.b*k+2*pad+40, R=Math.min(mob?w/2-80:L/2-96, mob?w*.42:190), Hl=2*R+90;
  const H=Math.round(mob?Hm+Hl:Math.max(Hm,Hl));
  el.style.height=H+"px";
  const s=V.svg(el,w,H,"Plantes a la mateixa escala: el Colosseu amb un camp de futbol a dins i, al centre, les cúpules de Florència, el Panteó i Santa Sofia i el cercle de Stonehenge; una lupa les amplia.");
  const tp=V.tip(el);
  const cx=mainW/2, cy=pad+30+P05.colos.b*k/2;
  const g=s.append("g"), items=[];
  const reg=(sel,d)=>{ sel.datum(d); items.push(sel); return sel; };
  const draw=(sel,len)=>{ if(V.reduced||el.__seen)return sel; return sel.attr("stroke-dasharray",len+" "+len).attr("stroke-dashoffset",len); };
  // --- Colosseu: dues el·lipses, 80 arcs i graderia en ratllat fi
  const co=g.append("g"); reg(co,{t:P05.colos.t,d:P05.colos.d,k:"colos"});
  const ell=(a,b)=>d3.range(0,361,3).map(t=>[cx+a/2*k*Math.cos(t*Math.PI/180),cy+b/2*k*Math.sin(t*Math.PI/180)]);
  const line=d3.line();
  const hatch=d3.path(); d3.range(0,360,1.5).forEach(t=>{ const c=Math.cos(t*Math.PI/180), sn=Math.sin(t*Math.PI/180);
    hatch.moveTo(cx+P05.colos.ia/2*k*c*1.04, cy+P05.colos.ib/2*k*sn*1.04); hatch.lineTo(cx+(P05.colos.a/2-4)*k*c, cy+(P05.colos.b/2-4)*k*sn); });
  co.append("path").attr("d",hatch.toString()).attr("stroke",C.ink).attr("stroke-opacity",.09).attr("stroke-width",.5);
  const arcs=d3.path(); d3.range(80).forEach(i=>{ const t=i/80*2*Math.PI; arcs.moveTo(cx+(P05.colos.a/2)*k*Math.cos(t), cy+(P05.colos.b/2)*k*Math.sin(t)); arcs.lineTo(cx+(P05.colos.a/2-4)*k*Math.cos(t), cy+(P05.colos.b/2-4)*k*Math.sin(t)); });
  co.append("path").attr("d",arcs.toString()).attr("stroke",C.ink).attr("stroke-opacity",.5).attr("stroke-width",.6);
  [[P05.colos.a,P05.colos.b,1.1],[P05.colos.a-8,P05.colos.b-8,.6],[P05.colos.ia,P05.colos.ib,.9]].forEach(([a,b,sw])=>
    draw(co.append("path").attr("d",line(ell(a,b))+"Z").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",sw),Math.PI*(a+b)/2*k*1.1));
  // --- Camp de futbol: gespa en verd (és vegetació) i línies reglamentàries
  const cp=g.append("g"); reg(cp,{t:P05.camp.t,d:P05.camp.d,k:"camp"});
  const pw=P05.camp.a*k, ph=P05.camp.b*k, px=cx-pw/2, py=cy-ph/2;
  cp.append("rect").attr("x",px).attr("y",py).attr("width",pw).attr("height",ph).attr("fill",V.alpha(C.greenLight,.75));
  d3.range(10).forEach(i=>{ if(i%2) cp.append("rect").attr("x",px+i*pw/10).attr("y",py).attr("width",pw/10).attr("height",ph).attr("fill",V.alpha(C.green,.18)); });
  const ln=d3.path(); ln.rect(px,py,pw,ph); ln.moveTo(cx,py); ln.lineTo(cx,py+ph);
  ln.moveTo(cx+9.15*k,cy); ln.arc(cx,cy,9.15*k,0,2*Math.PI);
  [-1,1].forEach(sd=>{ const ex=sd<0?px:px+pw; ln.rect(sd<0?ex:ex-16.5*k, cy-20.16*k, 16.5*k, 40.32*k); ln.rect(sd<0?ex:ex-5.5*k, cy-9.16*k, 5.5*k, 18.32*k); });
  draw(cp.append("path").attr("d",ln.toString()).attr("fill","none").attr("stroke",C.greenDark).attr("stroke-width",.9),2*(pw+ph)*1.6);
  co.raise();
  // --- Cúpules al punt central, concèntriques
  const cupG=g.append("g");
  function dome(gg,d,ox,oy,kk,sw){ const r=d.r*kk;
    const node=gg.append("g"); reg(node,{t:d.t,d:d.d,k:d.k});
    if(d.oct){ const pts=d3.range(8).map(i=>{ const a=(i+.5)/8*2*Math.PI; return [ox+r/Math.cos(Math.PI/8)*Math.cos(a),oy+r/Math.cos(Math.PI/8)*Math.sin(a)]; });
      node.append("path").attr("d",line(pts)+"Z").attr("fill","none").attr("stroke",C.red).attr("stroke-width",sw*1.2);
      if(kk>2) pts.forEach(p=>node.append("line").attr("x1",ox).attr("y1",oy).attr("x2",p[0]).attr("y2",p[1]).attr("stroke",C.red).attr("stroke-opacity",.25).attr("stroke-width",.6)); }
    else node.append("circle").attr("cx",ox).attr("cy",oy).attr("r",r).attr("fill","none").attr("stroke",d.sto?C.ink2:C.ink).attr("stroke-width",sw).attr("stroke-dasharray",d.sto?"3 2.5":null);
    if(d.ocul&&kk>2) node.append("circle").attr("cx",ox).attr("cy",oy).attr("r",d.ocul*kk).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8);
    if(d.fin&&kk>2){ const fp=d3.path(); d3.range(d.fin).forEach(i=>{ const a=i/d.fin*2*Math.PI; fp.moveTo(ox+(r-3)*Math.cos(a),oy+(r-3)*Math.sin(a)); fp.lineTo(ox+(r+3)*Math.cos(a),oy+(r+3)*Math.sin(a)); });
      node.append("path").attr("d",fp.toString()).attr("stroke",C.ink).attr("stroke-opacity",.55).attr("stroke-width",.7); }
    if(d.pan&&kk>2){}
    return node;
  }
  P05.cup.forEach(d=>dome(cupG,d,cx,cy,k,.8));
  // rètols del pla principal
  V.t(g,cx,pad+12,P05.colos.t,{size:12.5,weight:700,anchor:"middle",halo:true});
  V.t(g,cx,pad+26,"189 × 156 m",{size:11.5,anchor:"middle",fill:C.ink2,halo:true});
  V.t(g,px+4,py+ph-6,"camp de futbol · 105 × 68 m",{size:11.5,fill:C.greenDark,halo:true});
  // l'arena és més curta que el camp
  V.note(g,{x:cx+P05.colos.ia/2*k*Math.cos(-1.1),y:cy+P05.colos.ib/2*k*Math.sin(-1.1),tx:cx+P05.colos.a/2*k*.62,ty:cy-P05.colos.b/2*k-4,kind:"elbow",anchor:"start",lines:mob?[["Arena",true],["~87 × 55 m"]]:[["Arena",true],["~87 × 55 m: el camp no hi cap"]],size:11.5});
  // escala gràfica
  const sb=50*k, sy=H-(mob?Hl:0)-14;
  g.append("path").attr("d",`M${pad},${sy-4}V${sy}H${pad+sb}V${sy-4}M${pad+sb/2},${sy}V${sy-3}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.8);
  V.t(g,pad+sb+6,sy+1,"50 m",{size:11.5,fill:C.ink2});
  // --- Lupa: el grup del centre ampliat
  const lx=mob?w/2:mainW+L/2, ly=mob?Hm+R+34:H/2-6, kk=R/(P05.cup[0].r/Math.cos(Math.PI/8)+3);
  const lens=s.append("g");
  // guia de la lupa cap al punt central
  const gr=(P05.cup[0].r/Math.cos(Math.PI/8))*k;
  lens.append("circle").attr("cx",cx).attr("cy",cy).attr("r",gr+3).attr("fill","none").attr("stroke",C.red).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
  if(!mob){ const a1=Math.atan2(ly-cy,lx-cx); lens.append("path").attr("d",`M${cx+(gr+3)*Math.cos(a1-.5)},${cy+(gr+3)*Math.sin(a1-.5)}L${lx+R*Math.cos(Math.PI+a1-.25)},${ly+R*Math.sin(Math.PI+a1-.25)}M${cx+(gr+3)*Math.cos(a1+.5)},${cy+(gr+3)*Math.sin(a1+.5)}L${lx+R*Math.cos(Math.PI+a1+.25)},${ly+R*Math.sin(Math.PI+a1+.25)}`).attr("stroke",V.alpha(C.red,.5)).attr("stroke-width",.7).attr("fill","none"); }
  lens.append("circle").attr("cx",lx).attr("cy",ly).attr("r",R+8).attr("fill",C.paper).attr("stroke",C.red).attr("stroke-width",1.1);
  V.t(lens,lx,ly-R-20,`La lupa: ×${f0(kk/k)}`,{size:12.5,weight:700,anchor:"middle"});
  // mitja gespa i el cercle central dins la lupa
  const lg=lens.append("g");
  lg.append("circle").attr("cx",lx).attr("cy",ly).attr("r",R+7.5).attr("fill",V.alpha(C.greenLight,.45));
  lg.append("circle").attr("cx",lx).attr("cy",ly).attr("r",9.15*kk).attr("fill","none").attr("stroke",C.greenDark).attr("stroke-width",.8);
  lg.append("line").attr("x1",lx).attr("x2",lx).attr("y1",ly-R-7).attr("y2",ly+R+7).attr("stroke",C.greenDark).attr("stroke-width",.8);
  V.t(lg,lx+9.15*kk+3,ly+R*.08,"cercle central",{size:11,fill:C.greenDark,halo:true});
  P05.cup.forEach(d=>dome(lens,d,lx,ly,kk,1.1));
  // una persona vista des de dalt (espatlles de 0,5 m) i escala de 10 m
  const pp=lens.append("g").attr("transform",`translate(${lx-R*.18},${ly+R*.42})`);
  pp.append("ellipse").attr("rx",.25*kk).attr("ry",.13*kk).attr("fill",C.ink); pp.append("circle").attr("r",.11*kk).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",.6);
  V.t(lens,lx-R*.18+.4*kk,ly+R*.42+4,"una persona",{size:11,fill:C.ink2,halo:true});
  const s10=10*kk, sx=lx-s10/2, sy2=ly+R+30;
  lens.append("path").attr("d",`M${sx},${sy2-4}V${sy2}H${sx+s10}V${sy2-4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.8);
  V.t(lens,sx+s10+6,sy2+1,"10 m",{size:11.5,fill:C.ink2});
  // rètols de les cúpules a la lupa: dos a l'esquerra i dos a la dreta, amb línia fins a la seva vora
  const LAB=[["flor",-1,-.62,"Florència","45,5 m"],["pan",-1,.5,"Panteó","43,3 m"],["sof",1,-.5,"Santa Sofia","~32 m"],["sto",1,.42,"Stonehenge","~30 m"]];
  LAB.forEach(([kd,side,fy,nm,sz])=>{ const d=P05.cup.find(q=>q.k===kd), rr=d.r*kk, dy=fy*rr, ax=lx+side*Math.sqrt(Math.max(0,rr*rr-dy*dy)), ay=ly+dy;
    const tx=lx+side*(R+14);
    lens.append("path").attr("d",`M${ax},${ay}L${lx+side*(R+9)},${ay}`).attr("stroke",kd==="flor"?C.red:C.ink).attr("stroke-width",.6).attr("stroke-opacity",.7);
    lens.append("circle").attr("cx",ax).attr("cy",ay).attr("r",1.8).attr("fill",kd==="flor"?C.red:C.ink);
    V.lines(lens,tx,ay-1,[[nm,true,kd==="flor"?C.red:C.ink],[sz]],{anchor:side<0?"end":"start",size:11.5,halo:true});
  });
  // hover: cada forma
  const order=["sto","sof","pan","flor","camp","colos"];
  V.hover(s.node(),(ev,[mx,my])=>{
    let hit=null;
    const inL=Math.hypot(mx-lx,my-ly)<R+8, ox=inL?lx:cx, oy=inL?ly:cy, kz=inL?kk:k, rr=Math.hypot(mx-ox,my-oy)/kz;
    for(const d of P05.cup){ const rd=d.r*(d.oct?1/Math.cos(Math.PI/8):1); if(Math.abs(rr-rd)<(inL?1.2:3)){ hit=d.k; break; } }
    if(!hit&&!inL){ if(Math.abs(mx-cx)<pw/2&&Math.abs(my-cy)<ph/2) hit="camp";
      else { const e=((mx-cx)/(P05.colos.a/2*k))**2+((my-cy)/(P05.colos.b/2*k))**2; if(e<1.05) hit="colos"; } }
    items.forEach(n=>V.focus(n,d=>!hit||d.k===hit));
    if(hit){ const d=n=>n.datum(); const it=items.find(n=>n.datum().k===hit).datum(); tp.show(`<b>${it.t}</b> · ${it.d}`); } else tp.hide();
  },()=>{ items.forEach(n=>V.focus(n,null)); tp.hide(); });
  // entrada: les línies es dibuixen
  V.onView(el,now=>{ if(now)return; s.selectAll("path[stroke-dashoffset]").transition().duration(1600).delay((d,i)=>i*120).ease(d3.easeCubicOut).attr("stroke-dashoffset",0);
    cupG.attr("opacity",0).transition().delay(900).duration(700).attr("opacity",1); lens.attr("opacity",0).transition().delay(1300).duration(700).attr("opacity",1); });
});

/* =====================================================================
   SCALE-06 · ESCENA DE COLLA A ESCALA  (dades d'exemple)
   Quanta gent cal per varar una barca a la platja: barca, parats, cordes en ventall i colla a escala.
   Amb l'argue (cabrestant), quatre persones fan la feina de moltes.
   ===================================================================== */
const B06={
  boats:{
    llaut:{t:"Llaüt",tn:2,L:7,Hh:1.1},
    barca:{t:"Barca de bou",tn:5,L:10,Hh:1.5},
    gran:{t:"Pesquer gran",tn:10,L:14,Hh:2.0}
  },
  kgPer:100   // ritme d'exemple: una persona per cada 100 kg a pols sobre parats
};
let boat06="barca", how06="pols";
piece("scale-06",(el,w)=>{
  const mob=w<560, H=Math.round(mob?250:clamp(w*.4,280,400));
  el.style.height=H+"px";
  const {ctx}=V.canvas(el,w,H,"Escena d'exemple: una colla vara una barca a la platja estirant cordes; amb l'argue n'hi ha prou amb quatre persones.");
  const tp=V.tip(el);
  // projecció obliqua: x al llarg de la platja (cap amunt), y en profunditat, z alçada (metres)
  let st={zoom:1}, cur=null, T=0, pull=0;
  const SP=mob?.62:1.05;
  const view=()=>{ const n=crewN(), span=Math.max(mob?18:26, (mob?6:12)+B06.boats[boat06].L+ (how06==="pols"? Math.ceil(n/ropes(n))*SP : 8));
    return {m:(w-30)/span, ox:18}; };
  const crewN=()=>how06==="pols"?Math.ceil(B06.boats[boat06].tn*1000/B06.kgPer):4;
  const ropes=n=>how06==="pols"?Math.max(2,Math.min(8,Math.ceil(n/(mob?9:12)))):1;
  let VW=view(), VW0=VW;
  function P(x,y,z){ const m=VW.m, X=VW.ox+x*m+y*m*.52, Y=H*.72-y*m*.3-(z||0)*m; return [X,Y]; }
  function draw(){
    ctx.clearRect(0,0,w,H);
    const b=B06.boats[boat06], n=crewN(), R=ropes(n), m=VW.m;
    const off=(T*.0006)%1.2;                          // la platja «corre» cap enrere: la barca avança
    // mar: línies blaves d'onada a l'esquerra
    ctx.strokeStyle=V.alpha(C.blue,.5); ctx.lineWidth=.8;
    for(let i=0;i<7;i++){ const y=-6+i*2.2; ctx.beginPath(); for(let x=-30;x<=1.5-i*.18;x+=.4){ const q=P(x,y,.04*Math.sin(x*2+T*.002+i)); x===-30?ctx.moveTo(q[0],q[1]):ctx.lineTo(q[0],q[1]); } ctx.stroke(); }
    // vora de l'aigua i sorra puntejada
    ctx.strokeStyle=C.blue; ctx.lineWidth=1.1; ctx.beginPath(); for(let y=-7;y<=9;y+=.5){ const q=P(1.8+.25*Math.sin(y*1.3+T*.0015),y); y===-7?ctx.moveTo(q[0],q[1]):ctx.lineTo(q[0],q[1]); } ctx.stroke();
    const r=V.rng(6); ctx.fillStyle=V.alpha(C.ink,.22);
    for(let i=0;i<520;i++){ const x=2+r()*60, y=-7+r()*16, q=P(x-off*0,y); if(q[0]>w||q[1]<0)continue; ctx.fillRect(q[0],q[1],.9,.9); }
    // mates de borró a la duna (vegetació, en verd)
    ctx.strokeStyle=C.greenDark; ctx.lineWidth=.8;
    for(let i=0;i<46;i++){ const x=8+r()*60, y=6.5+r()*2.5, q=P(x,y), hh=(.25+r()*.3)*m; if(q[0]>w)continue;
      ctx.beginPath(); ctx.moveTo(q[0],q[1]); ctx.quadraticCurveTo(q[0]-2,q[1]-hh*.6,q[0]-4,q[1]-hh); ctx.moveTo(q[0],q[1]); ctx.lineTo(q[0]+.5,q[1]-hh*1.1); ctx.moveTo(q[0],q[1]); ctx.quadraticCurveTo(q[0]+2,q[1]-hh*.6,q[0]+4.5,q[1]-hh*.9); ctx.stroke(); }
    // parats: travesses de fusta sota el camí de la barca
    const bx0=1.2, bx1=bx0+b.L;
    for(let x=-1.6+((1.2-off)%1.2); x<bx1+3; x+=1.2){ const a=P(x,-.6), c=P(x,.6);
      ctx.strokeStyle=C.ink; ctx.lineWidth=Math.max(2,.14*m); ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(c[0],c[1]); ctx.stroke();
      ctx.strokeStyle=mix(C.paper,"#8C7A5E",.35); ctx.lineWidth=Math.max(1,.1*m); ctx.stroke(); }
    // barca: buc de perfil sobre el pla y = 0, amb tapa de regala i taulons
    const hull=(z0)=>{ const pts=[]; const N=24; for(let i=0;i<=N;i++){ const u=i/N, x=bx0+u*b.L, sheer=b.Hh*(1+.35*Math.pow(2*u-1,2))*1.0; pts.push(P(x,0,z0+sheer)); }
      for(let i=N;i>=0;i--){ const u=i/N, x=bx0+u*b.L, keel=.12+ .5*b.Hh*Math.pow(2*u-1,6)*.0; const bow=u>.86?(u-.86)/.14*b.Hh*.9:0, st=u<.08?(.08-u)/.08*b.Hh*.5:0; pts.push(P(x,0,z0+Math.max(keel,bow,st))); }
      return pts; };
    const Hp=hull(0);
    ctx.fillStyle=V.alpha(C.ink,.08); ctx.beginPath(); const s0=P(bx0,-.4), s1=P(bx1,.8); ctx.ellipse((s0[0]+s1[0])/2,(s0[1]+s1[1])/2+2,(s1[0]-s0[0])/2,4,0,0,7); ctx.fill();
    const gg=ctx.createLinearGradient(0,P(0,0,b.Hh*1.3)[1],0,P(0,0,0)[1]); gg.addColorStop(0,"#FBFAF6"); gg.addColorStop(1,mix(C.paper,C.ink,.16));
    ctx.beginPath(); Hp.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fillStyle=gg; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle=V.alpha(C.ink,.22); ctx.lineWidth=.6;
    for(let j=1;j<5;j++){ ctx.beginPath(); for(let i=0;i<=24;i++){ const u=i/24, z=b.Hh*(1+.35*Math.pow(2*u-1,2))*(1-j*.19); const q=P(bx0+u*b.L,0,z); i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); } ctx.stroke(); }
    // franja de color de la regala (blau, com moltes barques de la Mediterrània)
    ctx.strokeStyle=C.blue; ctx.lineWidth=Math.max(2,.12*m); ctx.beginPath(); for(let i=0;i<=24;i++){ const u=i/24, q=P(bx0+u*b.L,0,b.Hh*(1+.35*Math.pow(2*u-1,2))-.12); i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); } ctx.stroke();
    ctx.restore();
    ctx.beginPath(); Hp.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.strokeStyle=cur==="boat"?C.red:C.ink; ctx.lineWidth=cur==="boat"?1.5:1.05; ctx.stroke();
    // roda de proa alta (llaüt) i pal
    const pr=P(bx1+.05,0,b.Hh*1.55); const pb=P(bx1-.15,0,b.Hh*1.1); ctx.beginPath(); ctx.moveTo(pb[0],pb[1]); ctx.quadraticCurveTo(pr[0]+3,pr[1]+4,pr[0],pr[1]); ctx.strokeStyle=C.ink; ctx.lineWidth=1.4; ctx.stroke();
    const mb=P(bx0+b.L*.42,0,b.Hh*1.05), mt=P(bx0+b.L*.42,0,b.Hh*1.05+b.L*.42); ctx.beginPath(); ctx.moveTo(mb[0],mb[1]); ctx.lineTo(mt[0],mt[1]); ctx.lineWidth=1.2; ctx.stroke();
    // persona d'escala al costat de la barca
    { const q=P(bx0+b.L*.3,-1.6); G.drawSil(ctx,q[0],q[1],1.7*m,"dret",0,1,C.ink,{pel:"monyo"}); ctext(ctx,q[0],q[1]+10,"1,7 m",{size:11,anchor:"center",fill:C.ink2}); }
    // cordes i colla
    const bow=[bx1+.1,0,.6];
    if(how06==="pols"){
      const per=Math.ceil(n/R), sp=SP, spread=Math.min(12, R*2.1);
      let k=0;
      for(let ri=0;ri<R;ri++){
        const yy=R===1?0:-spread/2+ri*spread/(R-1), len=per*sp+1.2, end=[bow[0]+2+len,yy*1.0+.0,1.0];
        const on=cur===ri, a=P(...bow), e=P(end[0],end[1],1.0);
        ctx.strokeStyle=on?C.red:mix(C.ink,"#8C7A5E",.35); ctx.lineWidth=on?1.6:Math.max(1,.05*m+.6);
        ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(e[0],e[1]); ctx.stroke();
        for(let i=0;i<per&&k<n;i++,k++){
          const u=(i+1)/(per+.4), x=bow[0]+2+u*len, y=yy*(1)+(i%2?.42:-.42), q=P(x,y), hh=(1.6+((k*37)%9)/60)*m;
          const depth=(y+8)/16; ctx.save(); ctx.globalAlpha=(cur!=null&&cur!=="boat"&&!on)?.46:1;
          G.drawSil(ctx,q[0],q[1],hh,"estira",T*.004+k*.7,1,mix(on?C.red:C.ink,C.paper,clamp(depth*.4,0,.35)),{pel:["llarg","curt","monyo"][k%3],capa:k%7===3});
          ctx.restore();
        }
      }
    } else {
      // l'argue: un torn vertical amb quatre barres; la corda hi fa voltes
      const ax=[bx1+7,0], a=P(ax[0],ax[1],0), at=P(ax[0],ax[1],1.1), on=cur===0;
      ctx.strokeStyle=on?C.red:mix(C.ink,"#8C7A5E",.35); ctx.lineWidth=Math.max(1.2,.06*m+.6); const bq=P(...bow); ctx.beginPath(); ctx.moveTo(bq[0],bq[1]); ctx.lineTo(at[0],at[1]+6); ctx.stroke();
      ctx.fillStyle=mix(C.paper,"#8C7A5E",.3); ctx.strokeStyle=C.ink; ctx.lineWidth=1; ctx.beginPath(); ctx.rect(at[0]-.25*m,at[1],.5*m,a[1]-at[1]); ctx.fill(); ctx.stroke();
      const rot=T*.0012;
      for(let i=0;i<4;i++){ const ang=rot+i*Math.PI/2, ex=ax[0]+Math.cos(ang)*1.8, ey=ax[1]+Math.sin(ang)*1.8, e=P(ex,ey,.95), c0=P(ax[0],ax[1],.95);
        ctx.strokeStyle=C.ink; ctx.lineWidth=Math.max(1.4,.08*m); ctx.beginPath(); ctx.moveTo(c0[0],c0[1]); ctx.lineTo(e[0],e[1]); ctx.stroke(); }
      const ppl=d3.range(4).map(i=>{ const ang=rot+i*Math.PI/2, ex=ax[0]+Math.cos(ang)*1.95, ey=ax[1]+Math.sin(ang)*1.95; return {i,ang,ey,q:P(ex,ey)}; }).sort((p1,p2)=>p2.ey-p1.ey);
      ppl.forEach(p=>{ const dir=Math.sin(p.ang)>0?-1:1; G.drawSil(ctx,p.q[0],p.q[1],1.65*m,"palanca",0,dir,mix(on?C.red:C.ink,C.paper,clamp((p.ey+2)/8,0,.3)),{pel:["llarg","curt","monyo","curt"][p.i]}); });
      ctext(ctx,at[0],at[1]-14,"argue",{size:11.5,weight:700,anchor:"center"});
    }
    // xifra
    const nn=crewN();
    ctext(ctx,14,22,`${f0(nn)} persones`,{size:mob?20:26,serif:true});
    ctext(ctx,14,46,how06==="pols"?`${b.t}, ${b.tn} t · ${R} cordes · una persona per cada ${B06.kgPer} kg`:`${b.t}, ${b.tn} t · quatre persones fan girar l'argue`,{size:12,fill:C.ink2});
  }
  function setView(){ const to=view(), from={m:VW.m,ox:VW.ox}; if(V.reduced){ VW=to; draw(); return; }
    d3.timer(function(e){ const k=Math.min(1,e/900), q=d3.easeCubicInOut(k); VW={m:from.m+(to.m-from.m)*q, ox:from.ox+(to.ox-from.ox)*q}; draw(); if(k>=1)this.stop(); }); }
  el._update=setView;
  VW=view(); draw(); if(document.fonts)document.fonts.ready.then(draw);
  if(el.__lp)el.__lp.stop(); el.__lp=V.loop(el,t=>{ T=t; draw(); });
  V.hover(el.querySelector("canvas"),(ev,[mx,my])=>{
    const b=B06.boats[boat06]; let hit=null;
    const a=P(1.2,0,0), c=P(1.2+b.L,0,b.Hh*1.2); if(mx>a[0]&&mx<c[0]&&my>c[1]&&my<a[1]+4) hit="boat";
    else if(how06==="pols"){ const n=crewN(), R=ropes(n), spread=Math.min(12,R*2.1); let bd=1e9;
      for(let ri=0;ri<R;ri++){ const yy=R===1?0:-spread/2+ri*spread/(R-1), e=P(b.L+3+Math.ceil(n/R)*SP,yy,0), s0=P(b.L+1.3,0,.6);
        const dx=e[0]-s0[0], dy=e[1]-s0[1], tt=clamp(((mx-s0[0])*dx+(my-s0[1])*dy)/(dx*dx+dy*dy),0,1), d=Math.hypot(s0[0]+dx*tt-mx,s0[1]+dy*tt-my);
        if(d<bd&&d<22){ bd=d; hit=ri; } } }
    else { const at=P(b.L+8.2,0,0); if(Math.hypot(mx-at[0],my-at[1]+20)<60) hit=0; }
    if(hit!==cur){ cur=hit; if(V.reduced)draw(); }
    if(hit==="boat") tp.show(`<b>${b.t}</b> · ${b.tn} t, ${b.L} m d'eslora (exemple)`);
    else if(hit!=null&&how06==="pols"){ const n=crewN(), R=ropes(n), per=Math.ceil(n/R); tp.show(`<b>Corda ${hit+1}</b> · ${Math.min(per,n-hit*per)} persones estirant`); }
    else if(hit!=null) tp.show(`<b>L'argue</b> · quatre persones fan girar el torn i la corda hi fa voltes`);
    else tp.hide();
  },()=>{ cur=null; draw(); tp.hide(); });
});
function upd06(){ const el=$('[data-p="scale-06"]'); el&&el._update&&el._update(); }
seg("scale-06b",k=>{ boat06=k; upd06(); });
seg("scale-06m",k=>{ how06=k; upd06(); });
})();
