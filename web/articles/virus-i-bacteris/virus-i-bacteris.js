/* «La guerra invisible» — gràfics 1 (sistema infogràfic IBV, gravat científic i aquarel·la editorial):
   1. SCALE-04 Cinta d'arcs proporcionals + gravat òptic a escala (òvul humà → fag T4)
   2. HOW-01 Gravat biològic d'alta precisió del cicle d'infecció (lític T4 i lisogènic lambda)
   3. SPREAD-04 Pols de punts + SPREAD-06 Topografia de densitat (d3.contourDensity) de 5.508 mostres marines
   4. LINK-03 Riu d'aquarel·la amb ~1.100 micro-traços lents del curtcircuit viral
   Helpers compartits a window.VIB (els fa servir crispr.js). */
(function(){
"use strict";
const V=window.IBV; if(!V)return;
const C=V.C;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const SSF=V.SANS;
const RM=V.reduced;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t,0,1);return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;};
const sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const fmtN=(v,d)=>d===1?f1(v):d===0||d==null?f0(v):V.fmt(`,.${d}f`)(v);

/* Gradient d'aquarel·la radial per a SVG (estil PART-06 / el-jesus-historic) */
function addWashGrad(defs,id,col,a0,a1,a2){
  const rg=defs.append("radialGradient").attr("id",id).attr("cx","42%").attr("cy","38%").attr("r","64%");
  rg.append("stop").attr("offset",0).attr("stop-color",col).attr("stop-opacity",a0==null?.42:a0);
  rg.append("stop").attr("offset",.76).attr("stop-color",col).attr("stop-opacity",a1==null?.22:a1);
  rg.append("stop").attr("offset",1).attr("stop-color",col).attr("stop-opacity",a2==null?.05:a2);
  return `url(#${id})`;
}

/* Bany d'aquarel·la radial en Canvas (multiply suau sobre paper blanc) */
function canvasWash(c,x,y,r,col,a0,a1){
  if(r<=0)return;
  c.save();
  c.globalCompositeOperation="multiply";
  const g=c.createRadialGradient(x-r*.16,y-r*.18,r*.05,x,y,r);
  g.addColorStop(0,V.alpha(col,a0==null?.28:a0));
  g.addColorStop(.72,V.alpha(col,a1==null?.12:a1));
  g.addColorStop(1,V.alpha(col,0));
  c.fillStyle=g;
  c.beginPath(); c.arc(x,y,r,0,6.2832); c.fill();
  c.restore();
}

/* Etiqueta multilínia en canvas amb halo blanc (mateixa jerarquia que IBV.t) */
function txt(c,lines,x,y,al,fs,a,halo){
  c.save(); c.globalAlpha=a==null?1:a; c.textAlign=al||"left"; c.textBaseline="alphabetic";
  lines.forEach((l,i)=>{
    if(!l||l[0]==null||l[0]==="")return;
    c.font=`${l[1]?"700 ":""}${fs}px ${SSF}`;
    const yy=y+i*fs*1.28;
    if(halo!==false){ c.lineWidth=3.4; c.strokeStyle="rgba(255,255,255,.95)"; c.lineJoin="round"; c.strokeText(l[0],x,yy); }
    c.fillStyle=l[2]||C.ink; c.fillText(l[0],x,yy);
  });
  c.restore();
}
function lead(c,x0,y0,x1,y1,col,a){
  c.save(); c.globalAlpha=a==null?1:a;
  c.strokeStyle=col||C.ink; c.lineWidth=.75;
  c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y1); c.stroke();
  c.fillStyle=col||C.ink; c.beginPath(); c.arc(x0,y0,1.8,0,6.2832); c.fill();
  c.restore();
}

/* ================= gravat científic dels fags (nm, y amunt; s = px per nm) ================= */
function drawT4(c,x,y,s,o){
  o=o||{}; const k=o.k||0, legs=o.legs==null?0:o.legs, al=o.a==null?1:o.a, fillAmt=o.fillAmt==null?(o.empty?0:1):o.fillAmt;
  c.save(); c.globalAlpha=al; c.translate(x,y); if(o.rot)c.rotate(o.rot); c.scale(s,s);
  c.lineJoin="round"; c.lineCap="round";
  const bpH=27,bpW=52,shL=lerp(92.5,42,k),shW=lerp(24,33,k),neck=8,hL=115,hW=85,tube=92.5;
  const lw=Math.max(.55/s,1.0);

  /* Sis fibres articulades en 2 plans de profunditat */
  const fib=(dir,depth)=>{
    const bx=dir*bpW*.42, by=-bpH*.52;
    const kx=lerp(dir*(34+depth*5),dir*(72+depth*10),legs), ky=lerp(-bpH-56,-56+depth*5,legs);
    const tx=lerp(dir*(18+depth*7),dir*(120+depth*16),legs), ty=lerp(-5,0,legs);
    c.beginPath(); c.moveTo(bx,by); c.lineTo(kx,ky); c.lineTo(tx,ty); c.stroke();
    /* Punta sensora d'ancoratge */
    c.fillStyle=legs>.6?C.vermell:C.ink2;
    c.beginPath(); c.arc(tx,ty,lw*1.4,0,6.2832); c.fill();
  };
  c.strokeStyle=C.ink2; c.lineWidth=lw*1.05;
  c.globalAlpha=al*.42; fib(-1,1); fib(1,1);
  c.globalAlpha=al*.92; fib(-1,0); fib(1,0);
  c.globalAlpha=al;

  /* Tub intern perforador quan la beina es contrau */
  if(k>0){
    const p=tube-shL;
    c.fillStyle=C.ink2; c.fillRect(-4.2,-bpH*.2,8.4,p+bpH*.2);
    /* Punta enzimàtica (lisozim de cua) */
    c.fillStyle=C.vermell;
    c.beginPath(); c.moveTo(-4.2,p); c.lineTo(4.2,p); c.lineTo(0,p+7.5); c.closePath(); c.fill();
  }

  /* Placa basal (passa d'hexàgon a estrella amb k / legs) */
  const w2=lerp(bpW,bpW*1.28,k)/2, h2=lerp(bpH,bpH*.68,k);
  c.fillStyle=C.ink;
  c.beginPath();
  c.moveTo(-w2,0); c.lineTo(w2,0); c.lineTo(w2*.74,-h2); c.lineTo(-w2*.74,-h2); c.closePath(); c.fill();
  if(legs>.5){
    c.strokeStyle=C.ink; c.lineWidth=lw*.9;
    [-w2*.75,-w2*.3,w2*.3,w2*.75].forEach(px=>{ c.beginPath(); c.moveTo(px,0); c.lineTo(px,4.5); c.stroke(); });
  }

  /* Beina contràctil amb anells helicoïdals de gravat */
  const sy=-h2, sTop=sy-shL;
  const sg=c.createLinearGradient(-shW/2,0,shW/2,0);
  sg.addColorStop(0,"#3A3A3A"); sg.addColorStop(.42,"#686868"); sg.addColorStop(1,"#2C2C2C");
  c.fillStyle=sg; c.fillRect(-shW/2,sTop,shW,shL);
  c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=lw*.65;
  const nR=Math.max(4,Math.round(shL/4.2));
  for(let i=1;i<nR;i++){
    const yy=sTop+i*shL/nR;
    c.beginPath(); c.moveTo(-shW/2+1,yy-.8); c.lineTo(shW/2-1,yy+.8); c.stroke();
  }
  c.strokeStyle=C.ink; c.lineWidth=lw*.85; c.strokeRect(-shW/2,sTop,shW,shL);

  /* Coll i collarí amb bigotis */
  const nTop=sTop-neck;
  c.fillStyle=C.ink2; c.fillRect(-7.5,nTop,15,neck);
  c.fillStyle=C.ink; c.fillRect(-18,nTop+1.8,36,2.8);

  /* Càpside icosaèdrica elongada amb bany d'aquarel·la vermell i facetes nítides */
  const hb=nTop, ht=hb-hL, sh=hW/2, my=(hb+ht)/2;
  c.beginPath();
  c.moveTo(0,hb+2); c.lineTo(sh,hb-20); c.lineTo(sh,ht+20);
  c.lineTo(0,ht); c.lineTo(-sh,ht+20); c.lineTo(-sh,hb-20); c.closePath();

  if(fillAmt>.02){
    const hg=c.createRadialGradient(-sh*.22,my-14,4,0,my,hL*.65);
    hg.addColorStop(0,V.alpha(C.vermell,.36*fillAmt));
    hg.addColorStop(.72,V.alpha(C.vermell,.18*fillAmt));
    hg.addColorStop(1,V.alpha(C.vermell,.04*fillAmt));
    c.fillStyle=hg;
  } else {
    c.fillStyle="rgba(255,255,255,.88)";
  }
  c.fill();

  /* Espiral d'ADN empaquetat dins la càpside */
  if(fillAmt>.05){
    c.save(); c.clip();
    c.strokeStyle=C.vermell; c.globalAlpha=al*.72*fillAmt; c.lineWidth=lw*1.0;
    for(let r=7;r<=33;r+=5.5){
      c.beginPath(); c.ellipse(0,my+(1-fillAmt)*16,r,r*1.32,0,0,6.2832); c.stroke();
    }
    c.restore();
  }

  /* Facetes icosaèdriques de gravat */
  c.strokeStyle=V.alpha(C.ink,.26); c.lineWidth=lw*.68;
  c.beginPath();
  c.moveTo(-sh,hb-20); c.lineTo(0,hb-34); c.lineTo(sh,hb-20);
  c.moveTo(-sh,ht+20); c.lineTo(0,ht+34); c.lineTo(sh,ht+20);
  c.moveTo(0,hb-34); c.lineTo(0,ht+34);
  c.moveTo(-sh,ht+20); c.lineTo(0,my); c.lineTo(sh,ht+20);
  c.moveTo(-sh,hb-20); c.lineTo(0,my); c.lineTo(sh,hb-20);
  c.stroke();

  c.strokeStyle=C.ink; c.lineWidth=lw*1.15;
  c.beginPath();
  c.moveTo(0,hb+2); c.lineTo(sh,hb-20); c.lineTo(sh,ht+20);
  c.lineTo(0,ht); c.lineTo(-sh,ht+20); c.lineTo(-sh,hb-20); c.closePath();
  c.stroke();

  c.restore();
  return {head:[x,y-(h2+shL+neck+hL/2)*s],headTop:y-(h2+shL+neck+hL)*s,sheath:[x,y-(h2+shL/2)*s],base:[x,y-h2*s/2]};
}
function miniT4(c,x,y,s,rot,a){
  c.save(); c.globalAlpha=a==null?1:a; c.translate(x,y); c.rotate(rot||0); c.scale(s,s);
  c.fillStyle=C.ink2; c.fillRect(-11,10,22,78); c.fillStyle=C.ink; c.fillRect(-19,86,38,14);
  c.beginPath(); c.moveTo(0,12); c.lineTo(42,-8); c.lineTo(42,-82); c.lineTo(0,-103); c.lineTo(-42,-82); c.lineTo(-42,-8); c.closePath();
  c.fillStyle=V.alpha(C.vermell,.26); c.fill(); c.strokeStyle=C.ink; c.lineWidth=Math.max(1/s,5.2); c.stroke(); c.restore();
}
function miniHead(c,x,y,s,rot,a){
  c.save(); c.globalAlpha=a==null?1:a; c.translate(x,y); c.rotate(rot||0); c.scale(s,s);
  c.beginPath(); c.moveTo(0,57); c.lineTo(42,37); c.lineTo(42,-37); c.lineTo(0,-57); c.lineTo(-42,-37); c.lineTo(-42,37); c.closePath();
  c.fillStyle=V.alpha(C.vermell,.14); c.fill(); c.strokeStyle=C.ink2; c.lineWidth=Math.max(1/s,5.2); c.stroke(); c.restore();
}
function miniTail(c,x,y,s,rot,a){
  c.save(); c.globalAlpha=a==null?1:a; c.translate(x,y); c.rotate(rot||0); c.scale(s,s);
  c.fillStyle=C.ink2; c.fillRect(-11,-46,22,78); c.fillStyle=C.ink; c.fillRect(-19,30,38,14); c.restore();
}
function drawLambda(c,x,y,s,o){
  o=o||{}; c.save(); c.globalAlpha=o.a==null?1:o.a; c.translate(x,y); if(o.rot)c.rotate(o.rot); c.scale(s,s); c.lineCap="round";
  const lw=Math.max(.55/s,1.0), bend=o.bend==null?10:o.bend;
  /* Cua flexible estriada */
  c.strokeStyle=C.ink2; c.lineWidth=8.5; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(bend,-68,0,-135); c.stroke();
  c.strokeStyle="rgba(255,255,255,.45)"; c.lineWidth=lw*.9; c.setLineDash([2.5,4.5]);
  c.beginPath(); c.moveTo(0,-4); c.quadraticCurveTo(bend,-68,0,-132); c.stroke(); c.setLineDash([]);
  c.strokeStyle=C.ink; c.lineWidth=lw*1.2; c.beginPath(); c.moveTo(0,0); c.lineTo(0,18); c.stroke();
  /* Càpside icosaèdrica regular amb aquarel·la */
  const cy=-165, r=31;
  c.beginPath(); for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3, px=Math.cos(a)*r, py=cy+Math.sin(a)*r; i?c.lineTo(px,py):c.moveTo(px,py); } c.closePath();
  if(!o.empty){
    const lg=c.createRadialGradient(-8,cy-8,3,0,cy,r);
    lg.addColorStop(0,V.alpha(C.vermell,.38));
    lg.addColorStop(1,V.alpha(C.vermell,.09));
    c.fillStyle=lg;
  } else {
    c.fillStyle="rgba(255,255,255,.88)";
  }
  c.fill();
  c.strokeStyle=V.alpha(C.ink,.24); c.lineWidth=lw*.65;
  c.beginPath();
  for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3; c.moveTo(0,cy); c.lineTo(Math.cos(a)*r,cy+Math.sin(a)*r); }
  c.stroke();
  c.strokeStyle=C.ink; c.lineWidth=lw*1.15;
  c.beginPath(); for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3, px=Math.cos(a)*r, py=cy+Math.sin(a)*r; i?c.lineTo(px,py):c.moveTo(px,py); } c.closePath(); c.stroke();
  c.restore();
}

window.VIB={C,SSF,RM,clamp,lerp,ease,sm,fmtN,txt,lead,addWashGrad,canvasWash,drawT4,miniT4,miniHead,miniTail,drawLambda};

/* =====================================================================
   1. SCALE-04 CINTA D'ARCS PROPORCIONALS + GRAVAT ÒPTIC A ESCALA
   ===================================================================== */
(function(){
  const ribEl=document.getElementById("scale-ribbon"), vizEl=document.getElementById("scale-viz");
  if(!ribEl||!vizEl)return;
  const rng=document.getElementById("scRng"), seg=document.getElementById("scSeg");
  const nameEl=document.getElementById("scName"), valEl=document.getElementById("scVal"), play=document.getElementById("scPlay");
  const lgEl=document.getElementById("scale-lg");
  if(lgEl)V.legendCat(lgEl,[
    {c:C.vermell,t:"Virus (fag T4)"},
    {c:C.blau,t:"Bacteri (E. coli)"},
    {c:C.groc,t:"Glòbul vermell"},
    {c:C.ink2,t:"Cèl·lules humanes"}
  ]);

  /* Dades reals verificades: Milo & Phillips (Cell Biology by the Numbers); Yap & Rossmann 2014 (T4) */
  const ITEMS=[
    {id:"fag",  v:.2,  t:"Fag T4",          ts:"Fag T4",   m:"0,2 µm",  c:C.vermell, sc:C.vermell,  zIdx:4, desc:"Un dels fags més estudiats (~200 nm d'alt)"},
    {id:"bac",  v:2,   t:"Bacteri E. coli", ts:"E. coli",  m:"2 µm",    c:C.blau,    sc:C.blau,     zIdx:3, desc:"Bacteri intestinal de 2 × 1 µm"},
    {id:"glob", v:7.5, t:"Glòbul vermell",  ts:"Glòbul",   m:"7,5 µm",  c:C.groc,    sc:C.grocFosc, zIdx:2, desc:"Eritròcit humà (7–8 µm de diàmetre)"},
    {id:"hela", v:20,  t:"Cèl·lula humana", ts:"Cèl·lula", m:"20 µm",   c:C.ink2,    sc:C.ink2,     zIdx:1, desc:"Cèl·lula humana en cultiu (HeLa)"},
    {id:"ovul", v:120, t:"Òvul humà",       ts:"Òvul",     m:"120 µm",  c:C.ink2,    sc:C.ink2,     zIdx:0, desc:"La cèl·lula més gran del cos humà"}
  ].map(d=>Object.assign(d,{k:Math.log10(d.v)}));

  const P=[
    {n:"Un òvul humà",           W:300, c:[40,30],   id:"ovul"},
    {n:"Una cèl·lula humana",    W:44,  c:[-6,3],    id:"hela"},
    {n:"Un glòbul vermell",      W:14,  c:[2.6,.8],  id:"glob"},
    {n:"Un bacteri",             W:3.2, c:[.1,-.25], id:"bac"},
    {n:"Un fag sobre un bacteri",W:.62, c:[.25,.1],  id:"fag"}
  ];
  const L0=Math.log10(P[0].W), L1=Math.log10(P[P.length-1].W);
  seg.innerHTML=P.map((p,i)=>`<button type="button" data-i="${i}" aria-pressed="${i?"false":"true"}">${["Òvul","Cèl·lula humana","Glòbul vermell","Bacteri","Fag"][i]}</button>`).join("");

  let anchorId="fag", focusId="ovul", z=0, anim=null, autoDone=false;
  const fmtL=v=>v>=1?fmtN(v,0)+" µm":fmtN(v*1000,0)+" nm";
  function fmtRatio(a,b){
    const r=b.v/a.v;
    if(Math.abs(r-1)<1e-6)return "Mateixa mida";
    const big=r>1, f=big?r:1/r;
    const s=f<10?f1(f):f0(f);
    return big?`×${s}`:`÷${s}`;
  }
  function fmtRatioFull(a,b){
    const r=b.v/a.v;
    if(Math.abs(r-1)<1e-6)return "Mateixa mida";
    const big=r>1, f=big?r:1/r;
    const s=f<10?f1(f):f0(f);
    return big?`×${s} més gran`:`÷${s} més petit`;
  }

  /* ---- 1A. Cinta logarítmica d'arcs proporcionals SCALE-04 (vertical a mòbil < 600 px) ---- */
  let renderArc=null;
  V.mount(ribEl,(el,w)=>{
    const mob=w<600;
    const tp=V.tip(el);
    const uid="sr"+Math.random().toString(36).slice(2,6);

    if(mob){
      /* Transposició vertical neta a mòbil (guia-mobil.md) */
      const h=276, mt=24, mb=24, axX=72;
      const s=V.svg(el,w,h,"Escala logarítmica vertical comparativa d'un fag T4 (0,2 micres) fins a un òvul humà (120 micres): 600 vegades més gran. Toca qualsevol cercle per fixar-lo com a referència.");
      const defs=s.append("defs");
      const grads={};
      ITEMS.forEach(d=>{ grads[d.id]=addWashGrad(defs,uid+d.id,d.c,d.c===C.groc?.52:.44,d.c===C.groc?.28:.22,.05); });

      const g=s.append("g");
      const Y=d3.scaleLinear([-0.92,2.24],[mt,h-mb]);
      const rSc=d3.scaleSqrt().domain([.2,120]).range([7.5,17.5]);

      g.append("line").attr("x1",axX).attr("x2",axX).attr("y1",mt-6).attr("y2",h-mb+6).attr("stroke",C.hair).attr("stroke-width",.85);
      [-1,0,1,2].forEach(k=>{
        const y=Y(k);
        g.append("line").attr("x1",axX-5).attr("x2",axX+5).attr("y1",y).attr("y2",y).attr("stroke",C.muted).attr("stroke-width",.75);
        V.t(g,axX-9,y+4,k===-1?"0,1 µm":k===0?"1 µm":k===1?"10 µm":"100 µm",{size:11,fill:C.muted,anchor:"end"});
      });
      V.t(g,axX-6,h-4,"log ↓",{size:11,fill:C.muted,anchor:"end"});

      const gArc=g.append("g").style("pointer-events","none");
      const gPts=g.append("g");
      const pts=gPts.selectAll("g.pt").data(ITEMS).join("g").attr("class","pt").style("cursor","pointer");
      pts.each(function(d){
        const q=d3.select(this), y=Y(d.k), rad=rSc(d.v);
        q.append("circle").attr("class","halo").attr("cx",axX).attr("cy",y).attr("r",rad)
          .attr("fill",grads[d.id]).style("mix-blend-mode","multiply");
        q.append("circle").attr("class","rim").attr("cx",axX).attr("cy",y).attr("r",rad)
          .attr("fill","none").attr("stroke",V.alpha(d.sc,.36)).attr("stroke-width",.75);
        q.append("circle").attr("class","core").attr("cx",axX).attr("cy",y).attr("r",3)
          .attr("fill",d.sc).attr("stroke","#fff").attr("stroke-width",1.1);
        V.t(q,axX+rad+9,y+4,`${d.ts} · ${d.m}`,{size:11.5,weight:600,fill:C.ink,anchor:"start",halo:3});
        q.append("rect").attr("x",axX-22).attr("y",y-18).attr("width",w-axX+16).attr("height",36).attr("fill","transparent");
      });

      renderArc=function(hv){
        const anc=ITEMS.find(d=>d.id===anchorId)||ITEMS[0];
        const tgt=hv||ITEMS.find(d=>d.id===focusId)||ITEMS[4];
        gArc.selectAll("*").remove();
        pts.each(function(d){
          const q=d3.select(this), isA=d.id===anc.id, isT=tgt&&d.id===tgt.id, on=isA||isT;
          q.style("opacity",on?1:.48);
          q.select(".core").attr("r",isA?4.5:isT?3.8:3).attr("stroke",isA?C.ink:"#fff").attr("stroke-width",isA?1.5:1.1);
          q.select(".rim").attr("stroke",isA?C.ink:isT?d.sc:V.alpha(d.sc,.35)).attr("stroke-width",isA?1.5:isT?1.2:.75);
        });
        if(!tgt||tgt.id===anc.id){
          tp.show(`<b>${anc.t}</b> (${anc.m}) · Referència activa — toca una altra mida per comparar`);
          return;
        }
        const y1=Y(anc.k), y2=Y(tgt.k), my=(y1+y2)/2;
        const rx=w-16, bx=w-54;
        const col=tgt.k>=anc.k?C.vermell:C.blau;
        gArc.append("path").attr("d",`M${bx},${y1} Q${rx},${my} ${bx},${y2}`)
          .attr("fill","none").attr("stroke",col).attr("stroke-width",1.6).attr("stroke-opacity",.9);
        gArc.append("circle").attr("cx",bx).attr("cy",y1).attr("r",2.2).attr("fill",col);
        gArc.append("circle").attr("cx",bx).attr("cy",y2).attr("r",2.2).attr("fill",col);
        V.t(gArc,rx-6,my+4,fmtRatio(anc,tgt),{size:13,weight:700,fill:col,anchor:"end",halo:4});
        tp.show(`<b>${anc.t}</b> (${anc.m}) → <b>${tgt.t}</b> (${tgt.m}): <b>${fmtRatioFull(anc,tgt)}</b>`);
      };

      pts.on("click",(ev,d)=>{ anchorId=d.id; if(focusId===d.id)focusId=d.id==="fag"?"ovul":"fag"; renderArc(ITEMS.find(x=>x.id===focusId)); setTargetZ(zOf(d.zIdx)); });
      renderArc(ITEMS.find(x=>x.id===focusId));
      V.onView(el,inst=>{
        if(inst)return;
        gPts.style("opacity",0).transition().duration(600).ease(d3.easeCubicOut).style("opacity",1);
        gArc.style("opacity",0).transition().delay(240).duration(500).ease(d3.easeCubicOut).style("opacity",1);
      });
      return;
    }

    /* Escriptori: cinta horitzontal SCALE-04 amb esferes d'aquarel·la radialGradient + multiply */
    const h=202, ml=48, mr=48, axisY=116;
    const s=V.svg(el,w,h,"Escala logarítmica comparativa d'un fag T4 (0,2 micres) fins a un òvul humà (120 micres): 600 vegades més gran. Clica qualsevol cercle per fixar-lo com a referència.");
    const defs=s.append("defs");
    const grads={};
    ITEMS.forEach(d=>{ grads[d.id]=addWashGrad(defs,uid+d.id,d.c,d.c===C.groc?.52:.44,d.c===C.groc?.28:.22,.05); });

    const g=s.append("g");
    const X=d3.scaleLinear([-0.9,2.28],[ml,w-mr]);
    const rSc=d3.scaleSqrt().domain([.2,120]).range([9,24]);

    g.append("line").attr("x1",ml).attr("x2",w-mr).attr("y1",axisY).attr("y2",axisY).attr("stroke",C.hair).attr("stroke-width",.85);
    [-1,0,1,2].forEach(k=>{
      const x=X(k);
      g.append("line").attr("x1",x).attr("x2",x).attr("y1",axisY-5).attr("y2",axisY+5).attr("stroke",C.muted).attr("stroke-width",.8);
      V.t(g,x,axisY+19,k===-1?"0,1 µm":k===0?"1 µm":k===1?"10 µm":"100 µm",{size:11,fill:C.muted,anchor:"middle"});
    });
    V.t(g,w-mr,h-4,"Escala logarítmica →",{size:11,fill:C.muted,anchor:"end"});

    const gArc=g.append("g").style("pointer-events","none");
    const gPts=g.append("g");
    const pts=gPts.selectAll("g.pt").data(ITEMS).join("g").attr("class","pt").style("cursor","pointer");
    pts.each(function(d,i){
      const q=d3.select(this), x=X(d.k), rad=rSc(d.v);
      q.append("circle").attr("class","halo").attr("cx",x).attr("cy",axisY).attr("r",rad)
        .attr("fill",grads[d.id]).style("mix-blend-mode","multiply");
      q.append("circle").attr("class","rim").attr("cx",x).attr("cy",axisY).attr("r",rad)
        .attr("fill","none").attr("stroke",V.alpha(d.sc,.36)).attr("stroke-width",.8);
      q.append("circle").attr("class","core").attr("cx",x).attr("cy",axisY).attr("r",3.2)
        .attr("fill",d.sc).attr("stroke","#fff").attr("stroke-width",1.2);
      const yLab=axisY+46;
      const anc=i===0?"start":i===ITEMS.length-1?"end":"middle";
      q.append("line").attr("x1",x).attr("x2",x).attr("y1",axisY+rad+2).attr("y2",yLab-12).attr("stroke",C.hair).attr("stroke-width",.6);
      V.t(q,x,yLab,d.t,{size:12,weight:600,fill:C.ink,anchor:anc,halo:3});
      V.t(q,x,yLab+14,d.m,{size:11,fill:C.muted,anchor:anc,halo:3});
      q.append("circle").attr("cx",x).attr("cy",axisY).attr("r",Math.max(20,rad+6)).attr("fill","transparent");
    });

    renderArc=function(hv){
      const anc=ITEMS.find(d=>d.id===anchorId)||ITEMS[0];
      const tgt=hv||ITEMS.find(d=>d.id===focusId)||ITEMS[4];
      gArc.selectAll("*").remove();
      pts.each(function(d){
        const q=d3.select(this), isA=d.id===anc.id, isT=tgt&&d.id===tgt.id, on=isA||isT;
        q.style("opacity",on?1:.48);
        q.select(".core").attr("r",isA?4.8:isT?4.2:3.2).attr("stroke",isA?C.ink:"#fff").attr("stroke-width",isA?1.6:1.2);
        q.select(".rim").attr("stroke",isA?C.ink:isT?d.sc:V.alpha(d.sc,.35)).attr("stroke-width",isA?1.5:isT?1.2:.8);
      });
      if(!tgt||tgt.id===anc.id){
        tp.show(`<b>${anc.t}</b> (${anc.m}) · Referència activa — passa per una altra mida per comparar-la`);
        return;
      }
      const x1=X(anc.k), x2=X(tgt.k), mx=(x1+x2)/2, span=Math.abs(x2-x1);
      const arcH=Math.min(axisY-48,Math.max(36,span*.21));
      const col=tgt.k>=anc.k?C.vermell:C.blau;
      const yBase=axisY-10;
      gArc.append("path").attr("d",`M${x1},${yBase} Q${mx},${yBase-arcH*1.5} ${x2},${yBase}`)
        .attr("fill","none").attr("stroke",col).attr("stroke-width",1.8).attr("stroke-opacity",.92);
      /* Punta de fletxa delicada a l'arribada */
      const ang=Math.atan2(yBase-(yBase-arcH*1.5),x2-mx), L=6;
      gArc.append("path").attr("d",`M${x2-L*Math.cos(ang-.45)},${yBase-L*Math.sin(ang-.45)} L${x2},${yBase} L${x2-L*Math.cos(ang+.45)},${yBase-L*Math.sin(ang+.45)}`)
        .attr("fill","none").attr("stroke",col).attr("stroke-width",1.4);
      const apexY=yBase-arcH*.75;
      const topY=Math.max(20,apexY-20);
      const lx=clamp(mx,155,w-155);
      const ordDiff=tgt.k-anc.k;
      V.t(gArc,lx,topY,`${anc.ts} → ${tgt.ts}: ${fmtRatioFull(anc,tgt)}`,{size:13,weight:700,fill:col,anchor:"middle",halo:4});
      V.t(gArc,lx,topY+15,`${V.signed(ordDiff,1)} ordres de magnitud`,{size:11.5,fill:C.ink2,anchor:"middle",halo:3.5});
      tp.show(`<b>${anc.t}</b> (${anc.m}) → <b>${tgt.t}</b> (${tgt.m}): <b>${fmtRatioFull(anc,tgt)}</b> · Clica un cercle per canviar la referència`);
    };

    pts.on("pointerenter",(ev,d)=>{ focusId=d.id; renderArc(d); })
       .on("click",(ev,d)=>{ anchorId=d.id; if(focusId===d.id)focusId=d.id==="fag"?"ovul":"fag"; renderArc(ITEMS.find(x=>x.id===focusId)); setTargetZ(zOf(d.zIdx)); });
    s.on("pointerleave",()=>{ renderArc(ITEMS.find(x=>x.id===focusId)); });

    renderArc(ITEMS.find(x=>x.id===focusId));
    V.onView(el,inst=>{
      if(inst)return;
      gPts.style("opacity",0).transition().duration(650).ease(d3.easeCubicOut).style("opacity",1);
      gArc.style("opacity",0).transition().delay(260).duration(550).ease(d3.easeCubicOut).style("opacity",1);
    });
  });

  /* ---- 1B. Gravat òptic de precisió sobre paper blanc amb retícula fina de microscopi ---- */
  const blob=[]; for(let i=0;i<72;i++){ const a=i/72*6.2832; blob.push([a,1+.055*Math.sin(3*a+.6)+.038*Math.sin(5*a+1.9)+.025*Math.sin(8*a)]); }
  function niceBar(w){ const cand=[100,50,20,10,5,2,1,.5,.2,.1,.05,.02]; for(const v of cand)if(v<=w/4.2)return v; return .01; }
  function cam(zz){
    const L=lerp(L0,L1,zz); let i=0; while(i<P.length-2&&L<Math.log10(P[i+1].W))i++;
    const a=Math.log10(P[i].W), b=Math.log10(P[i+1].W), t=clamp((L-a)/(b-a),0,1), te=sm(t);
    return {W:Math.pow(10,L),x:lerp(P[i].c[0],P[i+1].c[0],te),y:lerp(P[i].c[1],P[i+1].c[1],te),near:t<.5?i:i+1};
  }
  const zOf=i=>(Math.log10(P[i].W)-L0)/(L1-L0);
  let dirty=true, drawScale=null;
  function setZ(v){
    z=clamp(v,0,1); rng.value=Math.round(z*1000);
    const k=cam(z);
    rng.setAttribute("aria-valuetext",P[k.near].n+", amplada de la imatge "+fmtL(k.W));
    focusId=P[k.near].id;
    if(renderArc)renderArc(ITEMS.find(x=>x.id===focusId));
    dirty=true;
  }
  function setTargetZ(to){
    if(RM){ setZ(to); return; }
    anim={from:z,to,t0:performance.now(),dur:1300};
  }

  V.mount(vizEl,(el,W)=>{
    const mob=W<640, H=Math.round(clamp(W*(mob?.74:.42),220,mob?340:420));
    const {c:cv,ctx:c}=V.canvas(el,W,H,"Comparació de mides a escala: un òvul humà de 120 micres, una cèl·lula humana de 20 micres, un glòbul vermell de 7,5 micres, un bacteri E. coli de 2 micres de llarg i un fag T4 de 0,2 micres aterrat a la seva superfície.");
    const fs=mob?11:12.5;
    drawScale=function(){
      const k=cam(z), s=W/k.W, X=x=>W/2+(x-k.x)*s, Y=y=>H/2-(y-k.y)*s, R=r=>r*s;
      c.clearRect(0,0,W,H);

      /* Retícula òptica fina de microscopi (0,5 px, paper blanc pur — P1) */
      const stepU=niceBar(k.W)*.5, stepPx=stepU*s;
      if(stepPx>=26){
        c.save();
        c.strokeStyle=C.grid; c.lineWidth=.5;
        const xMin=Math.floor((k.x-k.W/2)/stepU)*stepU, xMax=k.x+k.W/2;
        const yMin=Math.floor((k.y-H/(2*s))/stepU)*stepU, yMax=k.y+H/(2*s);
        c.beginPath();
        for(let gx=xMin;gx<=xMax;gx+=stepU){ const px=Math.round(X(gx))+.5; c.moveTo(px,0); c.lineTo(px,H); }
        for(let gy=yMin;gy<=yMax;gy+=stepU){ const py=Math.round(Y(gy))+.5; c.moveTo(0,py); c.lineTo(W,py); }
        c.stroke();
        /* Creus òptiques subtils a les interseccions */
        c.strokeStyle=C.hair; c.lineWidth=.6;
        c.beginPath();
        for(let gx=xMin;gx<=xMax;gx+=stepU*2){
          for(let gy=yMin;gy<=yMax;gy+=stepU*2){
            const px=Math.round(X(gx))+.5, py=Math.round(Y(gy))+.5;
            c.moveTo(px-3.5,py); c.lineTo(px+3.5,py); c.moveTo(px,py-3.5); c.lineTo(px,py+3.5);
          }
        }
        c.stroke();
        c.restore();
      }

      /* Òvul humà (120 µm): bany d'aquarel·la gris pedra + zona pel·lúcida de gravat + nucli */
      const oc=[75,40], orr=60;
      if(R(orr)>3){
        const ox=X(oc[0]), oy=Y(oc[1]), orPx=R(orr);
        canvasWash(c,ox,oy,orPx,C.ink2,.14,.06);
        c.strokeStyle=V.alpha(C.ink2,.46); c.lineWidth=Math.max(.9,R(1.6));
        c.beginPath(); c.arc(ox,oy,orPx,0,6.2832); c.stroke();
        if(orPx>24){
          /* Zona pel·lúcida interior puntejada */
          c.save(); c.setLineDash([2.5,3.5]); c.strokeStyle=V.alpha(C.ink2,.28); c.lineWidth=.75;
          c.beginPath(); c.arc(ox,oy,orPx*.92,0,6.2832); c.stroke(); c.restore();
        }
        canvasWash(c,X(oc[0]+12),Y(oc[1]+8),R(13.5),C.ink2,.22,.09);
        c.strokeStyle=V.alpha(C.ink2,.36); c.lineWidth=.75;
        c.beginPath(); c.arc(X(oc[0]+12),Y(oc[1]+8),R(13.5),0,6.2832); c.stroke();
        if(R(3.5)>1.5){ c.fillStyle=V.alpha(C.ink2,.42); c.beginPath(); c.arc(X(oc[0]+14.5),Y(oc[1]+10),R(3.5),0,6.2832); c.fill(); }
      }

      /* Cèl·lula humana (HeLa, ~20 µm): membrana orgànica + nucli ovalat */
      const hc=[-14,6], hr=10;
      if(R(hr)>2){
        c.save();
        c.beginPath(); blob.forEach(([a,f],i)=>{ const px=X(hc[0]+Math.cos(a)*hr*f), py=Y(hc[1]+Math.sin(a)*hr*f); i?c.lineTo(px,py):c.moveTo(px,py); }); c.closePath();
        const hg=c.createRadialGradient(X(hc[0]-2),Y(hc[1]+2),R(1),X(hc[0]),Y(hc[1]),R(hr*1.1));
        hg.addColorStop(0,V.alpha(C.land,.95)); hg.addColorStop(1,V.alpha(C.land,.45));
        c.fillStyle=hg; c.fill();
        c.strokeStyle=C.ink2; c.lineWidth=Math.max(.85,R(.18)); c.stroke();
        canvasWash(c,X(hc[0]-1.5),Y(hc[1]+1),R(4.2),C.ink2,.24,.09);
        c.strokeStyle=V.alpha(C.ink2,.45); c.lineWidth=.75;
        c.beginPath(); c.arc(X(hc[0]-1.5),Y(hc[1]+1),R(4.2),0,6.2832); c.stroke();
        c.restore();
      }

      /* Glòbul vermell (7,5 µm): disc bicòncau d'aquarel·la groga */
      const rc=[5.2,1.5], rr=3.75;
      if(R(rr)>1){
        const rx=X(rc[0]), ry=Y(rc[1]), rrPx=R(rr);
        canvasWash(c,rx,ry,rrPx,C.groc,.48,.22);
        c.strokeStyle=C.grocFosc; c.lineWidth=Math.max(.85,R(.14));
        c.beginPath(); c.arc(rx,ry,rrPx,0,6.2832); c.stroke();
        /* Depressió central bicòncava */
        c.fillStyle=V.alpha(C.paper,.68);
        c.beginPath(); c.arc(rx,ry,rrPx*.44,0,6.2832); c.fill();
        c.strokeStyle=V.alpha(C.grocFosc,.45); c.lineWidth=.7;
        c.beginPath(); c.arc(rx,ry,rrPx*.44,0,6.2832); c.stroke();
      }

      const sNm=s/1000;
      /* Bacteri E. coli (2 × 1 µm): càpsula de doble membrana blava amb bany d'aquarel·la */
      if(R(1)>.6){
        const r=.5, cx0=0, cy0=-.5;
        c.save();
        c.beginPath();
        c.moveTo(X(cx0-.5),Y(cy0+r)); c.lineTo(X(cx0+.5),Y(cy0+r));
        c.arc(X(cx0+.5),Y(cy0),R(r),-Math.PI/2,Math.PI/2);
        c.lineTo(X(cx0-.5),Y(cy0-r));
        c.arc(X(cx0-.5),Y(cy0),R(r),Math.PI/2,Math.PI*1.5); c.closePath();
        const bg=c.createRadialGradient(X(cx0-.2),Y(cy0+.15),R(.1),X(cx0),Y(cy0),R(1.15));
        bg.addColorStop(0,V.alpha(C.blau,.22)); bg.addColorStop(1,V.alpha(C.blau,.06));
        c.fillStyle=bg; c.fill();
        c.strokeStyle=C.blau; c.lineWidth=Math.max(1.05,R(.026)); c.stroke();
        /* Membrana interna fina quan hi ha prou zoom */
        if(R(.5)>16){
          const r2=.45;
          c.beginPath();
          c.moveTo(X(cx0-.48),Y(cy0+r2)); c.lineTo(X(cx0+.48),Y(cy0+r2));
          c.arc(X(cx0+.48),Y(cy0),R(r2),-Math.PI/2,Math.PI/2);
          c.lineTo(X(cx0-.48),Y(cy0-r2));
          c.arc(X(cx0-.48),Y(cy0),R(r2),Math.PI/2,Math.PI*1.5); c.closePath();
          c.strokeStyle=V.alpha(C.blau,.45); c.lineWidth=.8; c.stroke();
        }
        c.restore();
      }

      /* Fag T4 aterrat sobre E. coli */
      if(sNm*245>2.5){ drawT4(c,X(.25),Y(0),sNm,{legs:1,k:0}); }
      else if(R(1)>.6){ c.fillStyle=C.vermell; c.fillRect(X(.25)-.9,Y(0)-Math.max(2.2,sNm*245),1.8,Math.max(2.2,sNm*245)); }

      const lab=(px,py,lines,tx,ty,al,a)=>{
        if(a<=0)return;
        let lx=tx, ly=ty, alg=al||"left", tw=0;
        lines.forEach(l=>{ if(!l||!l[0])return; c.font=`${l[1]?"700 ":""}${fs}px ${SSF}`; tw=Math.max(tw,c.measureText(l[0]).width); });
        if(alg==="left"&&lx+4+tw>W-8){
          if(lx-4-tw>=8){ alg="right"; }
          else { lx=Math.max(8,W-8-tw-4); }
        } else if(alg==="right"&&lx-4-tw<8){
          if(lx+4+tw<=W-8){ alg="left"; }
          else { lx=Math.min(W-8,8+tw+4); }
        } else if(alg==="center"){
          lx=clamp(lx,8+tw/2,W-8-tw/2);
        }
        const yOff=ly<py?-4-(lines.length-1)*fs*1.28:fs;
        const top=ly+yOff-fs, bot=ly+yOff+(lines.length-1)*fs*1.28+3;
        let sh=0;
        if(top<6) sh=6-top;
        else if(bot>H-26) sh=H-26-bot;
        lead(c,px,py,lx,ly+sh,C.ink,a);
        txt(c,lines,lx+(alg==="right"?-4:alg==="center"?0:4),ly+yOff+sh,alg,fs,a);
      };
      const vis=sz=>clamp((sz-18)/30,0,1)*clamp((W*1.6-sz)/(W*.6),0,1);
      let a=vis(R(120)); if(a>0){ const px=X(oc[0]+orr*.7), py=Y(oc[1]+orr*.7); lab(px,py,[["Òvul humà",true],["120 µm",false,C.ink2]],Math.min(W-10,px+30),Math.max(28,py-22),px+30>W-80?"right":"left",a); }
      a=vis(R(20)); if(a>0){ const px=X(hc[0]-hr*.7), py=Y(hc[1]+hr*.7); lab(px,py,[["Cèl·lula humana",true],["en cultiu (HeLa), ~20 µm",false,C.ink2]],Math.max(10,px-24),Math.max(28,py-20),"left",a); }
      a=vis(R(7.5)); if(a>0){ const px=X(rc[0]+rr*.7), py=Y(rc[1]+rr*.7); lab(px,py,[["Glòbul vermell",true],["7–8 µm",false,C.ink2]],Math.min(W-10,px+20),Math.max(28,py-20),px+20>W-120?"right":"left",a); }
      a=vis(R(2)); if(a>0){ const px=X(-.8), py=Y(-.85); lab(px,py,[["Bacteri E. coli",true,C.blau],["2 µm de llarg, 1 µm d'ample",false,C.ink2]],Math.max(10,px-10),Math.min(H-36,py+26),"left",a); }
      a=vis(sNm*245); if(a>0){ const px=X(.25)+sNm*45, py=Y(0)-sNm*190; lab(px,py,[["Fag T4",true,C.vermell],["uns 0,2 µm d'alt",false,C.ink2]],Math.min(W-10,px+36),Math.max(28,py-16),"left",a); }

      /* Barra d'escala micromètrica de laboratori */
      const bv=niceBar(k.W), bw=bv*s, bx=12, by=H-14;
      c.fillStyle=C.ink; c.fillRect(bx,by,bw,1.4);
      c.fillRect(bx,by-5,1,6.4); c.fillRect(bx+bw-1,by-5,1,6.4);
      c.fillRect(bx+bw/2-.5,by-3,1,3.5);
      txt(c,[[fmtL(bv),true]],bx,by-8,"left",11.5,1);

      nameEl.textContent=P[k.near].n;
      valEl.textContent="Amplada de la imatge: "+fmtL(k.W)+" · Clica una mida a la cinta per comparar proporcions";
      [...seg.children].forEach((b,i)=>b.setAttribute("aria-pressed",String(i===k.near)));
    };

    dirty=true;
    if(el.__loop)el.__loop.stop();
    el.__loop=V.loop(el,()=>{
      if(anim){
        const p=clamp((performance.now()-anim.t0)/anim.dur,0,1);
        setZ(lerp(anim.from,anim.to,ease(p)));
        if(p>=1)anim=null;
      }
      if(dirty){ dirty=false; drawScale(); }
    });
    V.onView(el,inst=>{
      if(!autoDone){ autoDone=true; if(!inst)anim={from:0,to:1,t0:performance.now()+400,dur:6800}; }
      dirty=true; drawScale();
    });
    void cv;
  });

  rng.addEventListener("input",()=>{ anim=null; setZ(+rng.value/1000); });
  seg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; setTargetZ(zOf(+b.dataset.i)); });
  play.addEventListener("click",()=>{ if(RM){ setZ(z<.5?1:0); return; } anim={from:0,to:1,t0:performance.now(),dur:6800}; });
})();

/* =====================================================================
   2. HOW-01 GRAVAT BIOLÒGIC D'ALTA PRECISIÓ — CICLE D'INFECCIÓ (SCROLLY)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("inf-viz"); if(!vizEl)return;
  const steps=document.getElementById("isteps"), graphic=document.getElementById("igraphic");
  const nameEl=document.getElementById("iName"), clockEl=document.getElementById("iClock");
  const seg=document.getElementById("iSeg"), playB=document.getElementById("iPlay"), lgEl=document.getElementById("inf-lg");
  if(lgEl)V.legendCat(lgEl,[
    {c:C.vermell,t:"Fag i ADN víric"},
    {c:C.blau,t:"Bacteri i cromosoma"},
    {c:C.groc,t:"Alarma / llum UV"}
  ]);

  const SC=[
    {n:"El fag T4",cam:[0,170,600],dur:1,tip:"<b>Fag T4</b> · Cap icosaèdric (115 × 85 nm) amb ~169.000 lletres d'ADN i sis fibres sensores"},
    {n:"L'aterratge",cam:[0,90,560],dur:2.4,tip:"<b>Aterratge</b> · Quan almenys tres fibres s'enganxen a la paret, la placa basal passa d'hexàgon a estrella"},
    {n:"La injecció",cam:[0,10,640],dur:3.2,tip:"<b>Injecció</b> · La beina es contrau de 92,5 a 42 nm i perfora la paret per injectar l'ADN"},
    {n:"El segrest",cam:[0,-420,3000],dur:3,tip:"<b>Segrest cel·lular</b> · L'ADN del bacteri queda trossejat i la maquinària treballa per al virus"},
    {n:"La fàbrica",cam:[0,-470,2900],dur:6,tip:"<b>Cadena de muntatge</b> · Al minut 15 surt el primer fag complet; després uns 8 cada minut"},
    {n:"L'esclat",cam:[0,-470,4600],dur:4.5,tip:"<b>Lisi (minut ~30)</b> · La membrana es trenca i allibera un centenar llarg de fags nous"},
    {n:"El fag lambda s'amaga",cam:[0,-420,3000],dur:4,tip:"<b>Cicle lisogènic</b> · L'ADN del fag lambda s'insereix al cromosoma bacterià com a pròfag"},
    {n:"Un passatger que viatja gratis",cam:[0,-500,6200],dur:5,tip:"<b>Herència</b> · En dividir-se el bacteri, les dues cèl·lules filles hereten el pròfag"},
    {n:"Despertar: torna el cicle lític",cam:[0,-420,4900],dur:6,tip:"<b>Inducció per dany (UV)</b> · L'alarma trenca el repressor, el pròfag se separa i activa la lisi"}
  ];
  const clockTxt=["Dibuix a escala del fag sobre la paret","Minut 0 · reconeixement","Inici de la infecció","Primers minuts","Minut 15 · primer fag complet","Cap al minut 30 · lisi","Cicle lisogènic (lambda)","Divisió bacteriana","Dany a l'ADN · retorn al cicle lític"];
  let scene=0, sceneT0=performance.now(), playSeq=null, camC={x:0,y:150,w:520}, camFrom=null, camT0=0;

  const r1=V.rng(11), PG=[];
  while(PG.length<120){
    const x=(r1()*2-1)*900, y=-500+(r1()*2-1)*400, dx=Math.max(0,Math.abs(x)-500);
    if(dx*dx+(y+500)*(y+500)>420*420)continue;
    PG.push({x,y,rot:(r1()-.5)*Math.PI*2,vx:x/900,vy:(y+500)/400});
  }
  const FRAG=d3.range(18).map(i=>({a:i/18*6.2832}));
  const r2=V.rng(5), lamPG=[];
  while(lamPG.length<60){
    const x=(r2()*2-1)*900, y=-500+(r2()*2-1)*400, dx=Math.max(0,Math.abs(x)-500);
    if(dx*dx+(y+500)*(y+500)>420*420)continue;
    lamPG.push({x,y,rot:(r2()-.5)*Math.PI*2});
  }

  let tp=null;
  function setScene(i,keep){
    if(i===scene&&!keep)return;
    camFrom={...camC}; camT0=performance.now(); scene=i; sceneT0=performance.now();
    nameEl.textContent=SC[i].n; clockEl.textContent=clockTxt[i]||"";
  }

  V.mount(vizEl,(el,W)=>{
    const mob=innerWidth<900, nar=W<600;
    const H=mob?Math.round(Math.max(195,Math.min(window.innerHeight*.27,235))):Math.round(clamp(Math.min(innerHeight-230,W*.72),310,540));
    const {c:cv,ctx:c}=V.canvas(el,W,H,"Esquema a escala d'un fag T4 que aterra sobre un bacteri E. coli, hi injecta el seu ADN, es multiplica i el fa esclatar; i d'un fag lambda que s'amaga al cromosoma del bacteri.");
    tp=V.tip(el);
    V.hover(cv,()=>{ tp.show(SC[scene].tip); },()=>tp.hide());

    let s=1, cx=0, cy=0;
    const X=x=>W/2+(x-cx)*s, Y=y=>H/2-(y-cy)*s;
    function capsule(x0,y0,len,r,shrink){
      const hl=len/2-r; c.beginPath();
      if(!shrink){
        c.moveTo(X(x0-hl),Y(y0+r)); c.lineTo(X(x0+hl),Y(y0+r));
        c.arc(X(x0+hl),Y(y0),r*s,-Math.PI/2,Math.PI/2);
        c.lineTo(X(x0-hl),Y(y0-r));
        c.arc(X(x0-hl),Y(y0),r*s,Math.PI/2,Math.PI*1.5); c.closePath(); return;
      }
      const N=80, pts=[];
      for(let i=0;i<=N;i++){
        const t=i/N, xx=x0-len/2+t*len, u=(xx-x0)/(len/2);
        let hw=r; const ax=Math.abs(xx-x0)-hl;
        if(ax>0)hw=Math.sqrt(Math.max(0,r*r-ax*ax));
        hw*=1-shrink*Math.exp(-Math.pow(u/.12,2)); pts.push([xx,hw]);
      }
      c.moveTo(X(pts[0][0]),Y(y0)); pts.forEach(p=>c.lineTo(X(p[0]),Y(y0+p[1])));
      for(let i=pts.length-1;i>=0;i--)c.lineTo(X(pts[i][0]),Y(y0-pts[i][1])); c.closePath();
    }
    function cell(x0,y0,len,shrink,alpha){
      c.save(); c.globalAlpha=alpha==null?1:alpha;
      /* Bany d'aquarel·la blau suau dins la càpsula bacteriana */
      capsule(x0,y0,len,500,shrink);
      const bg=c.createRadialGradient(X(x0-len*.12),Y(y0+160),50*s,X(x0),Y(y0),len*.58*s);
      bg.addColorStop(0,V.alpha(C.blau,.14));
      bg.addColorStop(.75,V.alpha(C.blau,.06));
      bg.addColorStop(1,V.alpha(C.blau,.02));
      c.fillStyle=bg; c.fill();
      /* Doble membrana finíssima + peptidoglicà */
      c.strokeStyle=C.blau; c.lineWidth=Math.max(1.1,5.2*s); c.stroke();
      if(30*s>2.5&&!shrink){
        capsule(x0,y0,len-56,472);
        c.strokeStyle=V.alpha(C.blau,.52); c.lineWidth=Math.max(.85,4.2*s); c.stroke();
        c.setLineDash([Math.max(2,5.5*s),Math.max(2,4.5*s)]);
        capsule(x0,y0,len-28,486);
        c.strokeStyle=V.alpha(C.blau,.34); c.lineWidth=Math.max(.65,2.8*s); c.stroke();
        c.setLineDash([]);
        /* Receptors proteics subtils a la superfície superior (quan hi ha zoom a la paret) */
        if(s>.5){
          c.fillStyle=V.alpha(C.blau,.58);
          for(let rx=-260;rx<=260;rx+=42){
            c.beginPath(); c.arc(X(x0+rx),Y(y0+500),Math.max(1.6,3.2*s),0,6.2832); c.fill();
          }
        }
      }
      c.restore();
    }
    function chromo(x0,y0,sc,col,alpha,frag,pro){
      c.save(); c.globalAlpha=alpha==null?1:alpha; c.strokeStyle=col||C.blau; c.lineWidth=Math.max(1.25,8*s); c.lineCap="round";
      const N=140, pt=i=>{ const a=i/N*6.2832, rx=560*sc, ry=230*sc, w=1+.08*Math.sin(5*a)+.05*Math.sin(9*a+1); return [x0+Math.cos(a)*rx*w,y0+Math.sin(a)*ry*w]; };
      if(frag){
        for(let i=0;i<N;i+=7){ if(((i*37)%11)/11<frag)continue; c.beginPath(); for(let j=0;j<=5;j++){ const p=pt(i+j); j?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1])); } c.stroke(); }
      } else {
        c.beginPath(); for(let i=0;i<=N;i++){ const p=pt(i); i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1])); } c.stroke();
      }
      if(pro){
        const pMid=pt(Math.round(N*.21));
        canvasWash(c,X(pMid[0]),Y(pMid[1]),Math.max(14,85*s),C.vermell,.24*pro,.06*pro);
        c.strokeStyle=C.vermell; c.lineWidth=Math.max(2.1,13*s); c.beginPath();
        const i0=Math.round(N*.18), i1=Math.round(N*.18+N*.065*pro);
        for(let i=i0;i<=i1;i++){ const p=pt(i); i===i0?c.moveTo(X(p[0]),Y(p[1])):c.lineTo(X(p[0]),Y(p[1])); } c.stroke();
      }
      c.restore(); return pt(Math.round(N*.21));
    }
    function coil(x0,y0,r,a,seed,alpha){
      c.save(); c.globalAlpha=alpha==null?1:alpha;
      canvasWash(c,X(x0),Y(y0),Math.max(10,r*1.15*s),C.vermell,.18,.04);
      c.strokeStyle=C.vermell; c.lineWidth=Math.max(1.2,7*s);
      c.beginPath(); for(let i=0;i<=90;i++){ const u=i/90*6.2832, px=x0+r*Math.sin(3*u+seed)*Math.cos(.5*u), py=y0+r*.7*Math.sin(4*u+seed*1.3); i?c.lineTo(X(px),Y(py)):c.moveTo(X(px),Y(py)); } c.stroke(); c.restore();
    }
    function label(px,py,lines,tx,ty,al,a){
      if(a<=0)return;
      const fs=mob?11:12.5, n=lines.length;
      const y0=ty+(ty<py?-4-(n-1)*fs*1.28:fs), top=y0-fs, bot=y0+(n-1)*fs*1.28+3;
      let sh=0; if(top<4)sh=4-top; else if(bot>H-22)sh=H-22-bot; ty+=sh;
      let tw=0; lines.forEach(l=>{ c.font=`${l[1]?"700 ":""}${fs}px ${SSF}`; tw=Math.max(tw,c.measureText(l[0]).width); });
      if(al==="left"&&tx+4+tw>W-4)tx=W-8-tw;
      if(al==="right"&&tx-4-tw<4)tx=tw+8;
      lead(c,px,py,tx,ty,C.ink,a);
      txt(c,lines,tx+(al==="right"?-4:al==="center"?0:4),y0+sh,al,fs,a);
    }

    function draw(){
      const now=performance.now();
      runPlay(now);
      const t=RM?99:(now-sceneT0)/1000, p=clamp(t/SC[scene].dur,0,1), fs=mob?11:12.5;
      const tg=SC[scene].cam, ct=camFrom&&!RM?ease((now-camT0)/1100):1, cf=camFrom||{x:tg[0],y:tg[1],w:tg[2]};
      camC={x:lerp(cf.x,tg[0],ct),y:lerp(cf.y,tg[1],ct),w:Math.exp(lerp(Math.log(cf.w),Math.log(tg[2]),ct))};
      if(ct>=1)camFrom=null;
      const vw=camC.w*(mob?1.08:1); s=W/vw; cx=camC.x; cy=camC.y;
      c.clearRect(0,0,W,H);

      const sc=scene, la=k=>clamp((t-k)/.5,0,1);
      if(sc<=5){
        const burst=sc===5?ease(clamp((t-1.2)/2.2,0,1)):0;
        /* Ràfega suau d'aquarel·la a la lisi */
        if(sc===5&&burst>0){
          canvasWash(c,X(0),Y(-500),lerp(180,1450,burst)*s,C.vermell,.24*(1-burst*.75),.06*(1-burst*.75));
          canvasWash(c,X(0),Y(-500),lerp(220,1200,burst)*s,C.blau,.14*(1-burst*.8),0);
        }
        if(burst<1)cell(0,-500,2000,0,1-burst);
        if(sc<=4){ const frag=sc===3?ease(p)*.85:sc===4?.9:0; chromo(0,-560,1,C.blau,sc>=3?1-.55*(sc===3?ease(p):1):1,frag); }
        const land=sc===0?0:sc===1?ease(clamp(t/1.6,0,1)):1;
        const legs=sc===0?0:sc===1?ease(clamp((t-.6)/1.4,0,1)):1;
        const k=sc<2?0:sc===2?ease(clamp(t/1.2,0,1)):1;
        const py=lerp(140,0,land), bob=sc===0&&!RM?Math.sin(now/1100)*3.5:0;
        const injQ=sc===2?clamp((t-1)/1.8,0,1):0;
        const fillAmt=sc<2?1:sc===2?1-injQ:0;
        drawT4(c,X(0),Y(py+bob),s,{k,legs,fillAmt,a:sc===5?1-burst:1});

        /* Injecció fluida d'ADN amb bany d'aquarel·la */
        if(sc===2&&injQ>0){
          canvasWash(c,X(0),Y(-20-injQ*110),Math.max(14,injQ*130*s),C.vermell,.22,.05);
          c.save(); c.strokeStyle=C.vermell; c.lineWidth=Math.max(1.6,2.8*s); c.lineCap="round"; c.beginPath();
          const L=injQ*360; c.moveTo(X(0),Y(-20));
          for(let d=0;d<=L;d+=5){ c.lineTo(X(Math.sin(d*.052)*(18+d*.12)),Y(-20-d*.55)); }
          c.stroke(); c.restore();
        }
        if(sc>=3&&sc<=4)coil(-40,-170,120,1,0,1);
        if(sc===4||sc===5){
          const nCopies=sc===4?Math.floor(lerp(1,7,clamp(t/2.5,0,1))):7;
          for(let i=1;i<nCopies;i++)coil(-700+i*190,-470+((i*53)%140)-70,90,1,i*1.7,sc===5?1-burst:.85);
          const nParts=sc===4?Math.floor(lerp(0,26,clamp((t-.5)/2,0,1))):0;
          for(let i=0;i<nParts;i++){ const pp=PG[(i*7)%120]; (i%2?miniHead:miniTail)(c,X(pp.x*.9+60),Y(pp.y+40),s*.95,pp.rot+1,.45); }
          const nDone=sc===4?Math.floor(120*clamp((t-1.6)/4,0,1)*.55):Math.floor(lerp(66,120,clamp(t/1.1,0,1)));
          for(let i=0;i<nDone;i++){
            const pp=PG[i]; let x=pp.x, y=pp.y;
            if(sc===5){ const f=burst*620+(RM?0:Math.min(55,Math.max(0,t-3.4)*8)); x+=pp.vx*f; y+=pp.vy*f*1.3+(pp.vy>0?1:-1)*f*.25; }
            miniT4(c,X(x),Y(y),s*.95,pp.rot,1);
          }
          if(sc===4)clockEl.textContent=t<1.6?"Abans del minut 15":"Minut "+Math.round(15+nDone/8)+" · "+nDone+" fags";
          if(sc===5)clockEl.textContent=burst>0?"Cap al minut 30 · lisi":"Minut "+Math.round(15+nDone/8)+" · "+nDone+" fags";
          if(sc===5&&burst>0){
            c.save(); c.strokeStyle=C.blau; c.lineWidth=Math.max(1.2,5.8*s); c.globalAlpha=1-burst*.78;
            FRAG.forEach(f=>{
              const a0=f.a, a1=a0+.25, d=burst*500, ox=Math.cos(a0+.12)*d, oy=Math.sin(a0+.12)*d*.7;
              c.beginPath(); for(let j=0;j<=6;j++){ const a=a0+(a1-a0)*j/6, xx=Math.cos(a)*980+ox, yy=-500+Math.sin(a)*490+oy; j?c.lineTo(X(xx),Y(yy)):c.moveTo(X(xx),Y(yy)); } c.stroke();
            }); c.restore();
          }
        }
        if(sc===0){
          const hx=X(0);
          label(hx+42*s,Y(140+27+92.5+8+75),nar?[["Cap · 115 × 85 nm",true],["~169.000 lletres d'ADN",false,C.ink2]]:[["Cap · 115 × 85 nm",true],["guarda l'ADN: ~169.000 lletres",false,C.ink2]],hx+(mob?52:110)*s+14,Y(140+27+92.5+8+100),"left",la(.1));
          label(hx+13*s,Y(140+27+45),[["Cua amb beina · 92,5 nm",true]],hx-(mob?52:120)*s-14,Y(140+27+70),"right",la(.3));
          if(!nar){
            label(hx+26*s,Y(140+10),[["Placa basal",true]],hx+(mob?60:110)*s+14,Y(140+40),"left",la(.5));
            label(hx-38*s,Y(140+70),[["Sis fibres · 145 nm",true],["els sensors",false,C.ink2]],hx-(mob?60:120)*s-18,Y(130),"right",la(.7));
          }
          label(W*.5+(mob?60:150)*s,Y(-4),[["Paret del bacteri",true,C.blau]],W*.5+(mob?96:190)*s,Y(nar?38:60),"left",la(.9));
        }
        if(sc===1){
          label(X(110),Y(2),[["Les fibres reconeixen",true],["una molècula de la paret",false,C.ink2]],X(150),Y(120),"left",la(1.6));
          label(X(-30),Y(15),[["La placa passa",true],["d'hexàgon a estrella",false,C.ink2]],X(-140),Y(110),"right",la(2));
        }
        if(sc===2){
          label(X(15),Y(62),[["La beina es contrau",true],["de 92,5 a 42 nm",false,C.ink2]],X(140),Y(160),"left",la(1));
          label(X(5),Y(-80),[["L'ADN del fag",true,C.vermell],["entra a la cèl·lula",false,C.ink2]],X(-120),Y(-170),"right",la(1.6));
        }
        if(sc===3){
          label(X(-40),Y(-170),[["ADN del fag",true,C.vermell]],X(-500),Y(-90),"right",la(.4));
          label(X(350),Y(-640),[["ADN del bacteri,",true,C.blau],["trossejat",false,C.ink2]],X(780),Y(-980),"left",la(1.2));
        }
        if(sc===4&&t>1.6){
          label(X(PG[0].x),Y(PG[0].y),[["Fags nous",true],["muntats a dins",false,C.ink2]],X(PG[0].x)+(X(PG[0].x)>W/2?-50:50),Y(-1080),X(PG[0].x)>W/2?"right":"left",la(1.8));
        }
        if(sc===5&&burst>.6){
          txt(c,[["Un centenar llarg de fags nous",true],["a punt per infectar altres bacteris",false,C.ink2]],W/2,mob?18:28,"center",fs,clamp((burst-.6)/.3,0,1));
        }
      } else {
        if(sc===6){
          cell(0,-500,2000,0,1); const ins=ease(clamp((t-1.2)/2.2,0,1));
          const tipPt=chromo(0,-560,1,C.blau,1,0,ins);
          drawLambda(c,X(150),Y(0),s,{empty:t>1.2});
          if(t<3.4){
            const q=clamp((t-.4)/1.6,0,1); c.save(); c.strokeStyle=C.vermell; c.lineWidth=Math.max(1.6,8*s); c.globalAlpha=1-ins;
            c.beginPath(); c.moveTo(X(150),Y(-30)); const ex=lerp(150,tipPt[0],q), ey=lerp(-30,tipPt[1],q);
            c.quadraticCurveTo(X(lerp(150,ex,.5)+120),Y(lerp(-30,ey,.5)),X(ex),Y(ey)); c.stroke(); c.restore();
          }
          label(X(tipPt[0]),Y(tipPt[1]),[["Pròfag",true,C.vermell],["ADN del virus dins del cromosoma",false,C.ink2]],X(tipPt[0])+(mob?20:60),Y(-1150),"left",clamp((t-3)/.6,0,1));
          label(X(150),Y(150),[["Fag lambda",true]],X(150)+(mob?40:80),Y(330),"left",clamp(t/.5,0,1));
        }
        if(sc===7){
          const g=ease(clamp(t/2,0,1)), d=ease(clamp((t-2)/1.8,0,1)), sep=ease(clamp((t-3.6)/1.2,0,1));
          if(sep<=0){
            const len=lerp(2000,4000,g); cell(0,-500,len,d*.98,1);
            chromo(-len/4*g,-560,1,C.blau,1,0,1);
            if(g>.3)chromo(len/4,-560,1,C.blau,clamp((g-.3)/.4,0,1),0,1);
          } else {
            const off=lerp(1000,1150,sep);
            [-1,1].forEach(sg=>{ cell(sg*off,-500,2000,0,1); chromo(sg*off,-560,1,C.blau,1,0,1); });
          }
          label(X((sep>0?1150:1000)+139),Y(-337),[["Les dues filles",true],["hereten el pròfag",false,C.ink2]],X(1700),Y(-1250),"left",clamp((t-4.2)/.5,0,1));
          clockEl.textContent=sep>0?"1 generació després":"Divisió bacteriana";
        }
        if(sc===8){
          const uv=clamp(t/1.2,0,1), ex=ease(clamp((t-1.2)/1.2,0,1)), rep=clamp((t-2.4)/2,0,1), burst=ease(clamp((t-4.4)/1.4,0,1));
          cell(1150,-500,2000,0,1); chromo(1150,-560,1,C.blau,1,0,1);
          if(burst>0)canvasWash(c,X(-1150),Y(-500),lerp(180,1400,burst)*s,C.vermell,.24*(1-burst*.75),0);
          if(burst<1)cell(-1150,-500,2000,0,1-burst);
          chromo(-1150,-560,1,C.blau,1-burst,0,1-ex);
          /* Raigs UV daurats d'aquarel·la (C.groc, etiqueta en tinta!) */
          if(t<3.2){
            const uA=Math.sin(Math.min(1,uv)*Math.PI);
            canvasWash(c,X(-1250),Y(80),620*s,C.groc,.36*uA,.12*uA);
            c.save(); c.strokeStyle=C.groc; c.lineWidth=3.0; c.lineCap="round"; c.globalAlpha=uA*.92;
            for(let i=0;i<4;i++){
              const x0=-1700+i*300, y0=900; c.beginPath(); c.moveTo(X(x0),Y(y0));
              for(let j=1;j<=6;j++)c.lineTo(X(x0+j*45+(j%2?42:-42)),Y(y0-j*170)); c.stroke();
            }
            c.restore();
          }
          if(ex>0&&burst<1)coil(-1450,-420,90,1,0,ex*(1-burst));
          const nL=Math.floor(60*rep);
          for(let i=0;i<nL;i++){
            const q=lamPG[i]; let x=q.x-1150, y=q.y;
            if(burst>0){ const f=burst*1000; x+=q.x/900*f; y+=(q.y+500)/400*f; }
            drawLambda(c,X(x),Y(y),s*.9,{rot:q.rot,bend:10});
          }
          if(burst>0){
            c.save(); c.strokeStyle=C.blau; c.lineWidth=Math.max(1.2,5.8*s); c.globalAlpha=1-burst*.78;
            FRAG.forEach(f=>{
              const a0=f.a, a1=a0+.25, d=burst*500, ox=Math.cos(a0+.12)*d, oy=Math.sin(a0+.12)*d*.7;
              c.beginPath(); for(let j=0;j<=6;j++){ const a=a0+(a1-a0)*j/6, xx=-1150+Math.cos(a)*980+ox, yy=-500+Math.sin(a)*490+oy; j?c.lineTo(X(xx),Y(yy)):c.moveTo(X(xx),Y(yy)); } c.stroke();
            }); c.restore();
          }
          label(X(-1500),Y(400),[["Llum ultraviolada",true,C.ink],["alarma de reparació",false,C.ink2]],X(-1500),Y(850),"left",clamp(t/.4,0,1)*(t<3.2?1:clamp((4-t)/.8,0,1)));
          label(X(-1450),Y(-420),[["El pròfag se separa",true,C.vermell],["i es multiplica",false,C.ink2]],X(-200),Y(-1250),"left",clamp((t-1.6)/.5,0,1)*(1-burst));
          label(X(1550),Y(-300),[["Sense dany:",true],["el pròfag continua adormit",false,C.ink2]],X(1150),Y(320),"center",clamp((t-2)/.5,0,1));
          clockEl.textContent=burst>0?"Lisi":ex>0?"Dany a l'ADN":"Inducció";
        }
      }
      /* Barra d'escala fina */
      const cand=[2000,1000,500,200,100,50], bv=cand.find(v=>v*s<=W/4.5)||50, bw=bv*s, bx=12, by=H-12;
      c.fillStyle=C.ink; c.fillRect(bx,by,bw,1.4); c.fillRect(bx,by-4,1,5.4); c.fillRect(bx+bw-1,by-4,1,5.4);
      txt(c,[[(bv>=1000?fmtN(bv/1000,0)+" µm":bv+" nm"),true]],bx,by-7,"left",11.5,1);
    }

    if(el.__loop)el.__loop.stop();
    el.__loop=V.loop(el,draw);
  });

  const SEQ={lit:[[0,1.8],[1,2.8],[2,3.4],[3,2.6],[4,6.2],[5,4.4]],lis:[[6,4.4],[7,5.4],[8,6.4]]};
  function setMode(m){ [...seg.children].forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.c===m))); playSeq={m,t0:performance.now(),i:-1}; }
  function runPlay(now){
    if(!playSeq)return;
    const seq=SEQ[playSeq.m]; let tt=(now-playSeq.t0)/1000, i=0;
    while(i<seq.length-1&&tt>seq[i][1]){ tt-=seq[i][1]; i++; }
    if(i!==playSeq.i){ playSeq.i=i; setScene(seq[i][0],true); }
    if(i===seq.length-1&&tt>seq[i][1]+1.5)playSeq=null;
  }
  seg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; setMode(b.dataset.c); });
  playB.addEventListener("click",()=>{ const cur=[...seg.children].find(b=>b.getAttribute("aria-pressed")==="true"); setMode(cur?cur.dataset.c:"lit"); });
  if(window.IB&&IB.scrolly){
    IB.scrolly(steps,graphic,i=>{
      playSeq=null; [...seg.children].forEach(b=>b.setAttribute("aria-pressed","false"));
      if(i<=8)setScene(i,true); else setMode("lit");
    });
  }
})();

/* =====================================================================
   3. SPREAD-04 POLS DE PUNTS + SPREAD-06 TOPOGRAFIA DE DENSITAT (5.508 MOSTRES)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("sea-viz"); if(!vizEl||!window.VIB_DATA)return;
  const D=VIB_DATA.sea, ST=VIB_DATA.seaStudies, seg=document.getElementById("seaSeg"), nEl=document.getElementById("seaN"), lgEl=document.getElementById("sea-lg");
  /* Paleta estricta: superfície blau, mitjana blau clar, profund vermell */
  const BC=[C.blau,C.blauClar,C.vermell];
  const BLAB=["0–100 m","100–1.000 m","Més de 1.000 m"];
  if(lgEl)V.legendCat(lgEl,[
    {c:C.blau,t:"0–100 m (superfície)",a:.75},
    {c:C.blauClar,t:"100–1.000 m",a:.85},
    {c:C.vermell,t:"Més de 1.000 m",a:.75},
    {c:C.ink,t:"Tendència global",kind:"line",w:1.4}
  ]);

  const band=d=>d<100?0:d<1000?1:2;
  const P=D.map((r,idx)=>({idx,b:r[0],v:r[1],d:r[2],s:r[3],k:band(r[2])}));
  const order=P.map((p,i)=>i).sort((a,b)=>(P[b].k-P[a].k)||(((a*2654435761)>>>0)%997-((b*2654435761)>>>0)%997));
  const med=[0,1,2].map(k=>{
    const q=P.filter(p=>p.k===k);
    const m=a=>{ a=a.slice().sort((x,y)=>x-y); return a[a.length>>1]; };
    return {k,b:m(q.map(p=>p.b)),v:m(q.map(p=>p.v)),n:q.length};
  });
  const TR0=2.7732, TR1=.7010;
  let filt="all", redrawSea=null;

  V.mount(vizEl,(el,W)=>{
    const mob=W<580, H=Math.round(clamp(W*(mob?1.02:.56),320,520));
    const m={t:26,r:mob?14:26,b:44,l:mob?48:66};
    d3.select(el).selectAll("canvas.ibv,svg.ibv").remove();
    const {ctx}=V.canvas(el,W,H,"Topografia de densitat i dispersió logarítmica amb 5.508 mostres d'aigua de mar: bacteris per mil·lilitre a l'eix horitzontal i virus per mil·lilitre a l'eix vertical. Les corbes de nivell separen clarament les aigües de superfície (0–100 m, en blau) i les profundes (> 1.000 m, en vermell, mediana de 36 virus per bacteri).");
    const s=V.svg(el,W,H,""); s.attr("aria-hidden","true").attr("role",null).style("position","absolute").style("left",0).style("top",0);

    const X=d3.scaleLinear([3.6,7.4],[m.l,W-m.r]);
    const Y=d3.scaleLinear([5,8.9],[H-m.b,m.t]);
    const lab10=e=>mob?({4:"10 mil",5:"100 mil",6:"1 M",7:"10 M",8:"100 M"}[e]||""):({4:"10.000",5:"100.000",6:"1 milió",7:"10 milions",8:"100 milions"}[e]||"");

    /* Eixos recessius IBV */
    const gAx=s.append("g");
    V.gridY(gAx,Y,m.l,W-m.r,[5,6,7,8],lab10,{unit:" virus/ml"});
    V.axisX(gAx,X,H-m.b,[4,5,6,7],lab10,{grid:m.t});
    V.t(gAx,W-m.r,H-6,"Bacteris per mil·lilitre (escala logarítmica) →",{size:11.5,fill:C.ink2,anchor:"end"});

    /* Clip de l'àrea de dades */
    const cid="csea"+Math.random().toString(36).slice(2,7);
    s.append("defs").append("clipPath").attr("id",cid).append("rect").attr("x",m.l).attr("y",m.t).attr("width",W-m.l-m.r).attr("height",H-m.t-m.b);
    const gClip=s.append("g").attr("clip-path",`url(#${cid})`);

    /* Diagonals de proporció 1:1, 10:1, 100:1 */
    const ang=Math.atan2(Y(1)-Y(0),X(1)-X(0))*180/Math.PI;
    [[0,"1 per bacteri"],[1,"10 per bacteri"],[2,"100 per bacteri"]].forEach(([r,lbl])=>{
      gClip.append("line").attr("x1",X(3.6)).attr("y1",Y(3.6+r)).attr("x2",X(7.4)).attr("y2",Y(7.4+r))
        .attr("stroke",C.muted).attr("stroke-width",.65).attr("stroke-dasharray","3 3");
      const xe=Math.min(7.32,8.84-r);
      gClip.append("g").attr("transform",`translate(${X(xe)},${Y(xe+r)-5}) rotate(${ang})`)
        .call(gg=>V.t(gg,0,0,lbl,{size:11,fill:C.muted,anchor:"end",halo:3}));
    });

    /* Capa SPREAD-06: Corbes topogràfiques de densitat (d3.contourDensity) */
    const gCont=gClip.append("g").style("pointer-events","none");
    const geoPath=d3.geoPath();
    const contourCache={};
    function getContours(key,pts,levels,bw){
      const ck=`${key}-${W}-${H}`;
      if(contourCache[ck])return contourCache[ck];
      const gen=d3.contourDensity().x(p=>X(p.b)).y(p=>Y(p.v)).size([W,H]).bandwidth(bw).thresholds(levels);
      contourCache[ck]=gen(pts);
      return contourCache[ck];
    }
    function drawContours(){
      gCont.selectAll("*").remove();
      const bw=mob?15:20;
      const drawGroup=(pts,col,levels,key)=>{
        if(pts.length<30)return;
        const ct=getContours(key,pts,levels,bw);
        const maxV=d3.max(ct,d=>d.value)||1;
        gCont.selectAll(null).data(ct).join("path")
          .attr("d",geoPath)
          .attr("fill","none")
          .attr("stroke",col)
          .attr("stroke-width",(d,i)=>i===0?1.15:.65)
          .attr("stroke-opacity",d=>.24+.56*(d.value/maxV));
      };
      if(filt==="all"){
        /* Estructura bimodal: 10 nivells superfície (blau) + 9 nivells fondària (vermell) = 19 corbes */
        drawGroup(P.filter(p=>p.k===0),C.blau,10,"k0");
        drawGroup(P.filter(p=>p.k===2),C.vermell,9,"k2");
      } else {
        const k=+filt, col=k===1?C.blau:BC[k];
        drawGroup(P.filter(p=>p.k===k),col,16,"f"+k);
      }
    }

    /* Tendència global (càlcul propi) */
    const trend=gClip.append("line").attr("x1",X(3.9)).attr("y1",Y(TR0+TR1*3.9)).attr("x2",X(7.2)).attr("y2",Y(TR0+TR1*7.2))
      .attr("stroke",C.ink).attr("stroke-width",1.45);

    /* Medianes + anotacions corbes IBV.note */
    const gMed=s.append("g"), gNote=s.append("g").style("pointer-events","none");
    function drawOverlays(){
      gMed.selectAll("*").remove(); gNote.selectAll("*").remove();
      med.forEach(md=>{
        const on=filt==="all"||+filt===md.k;
        const mg=gMed.append("g").style("opacity",on?1:.22);
        mg.append("circle").attr("cx",X(md.b)).attr("cy",Y(md.v)).attr("r",6.2).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.5);
        mg.append("circle").attr("cx",X(md.b)).attr("cy",Y(md.v)).attr("r",3.4).attr("fill",BC[md.k]);
      });
      if(filt==="all"||filt==="0"){
        const m0=med[0];
        V.note(gNote,{x:X(m0.b),y:Y(m0.v)-7,tx:X(m0.b)-(mob?16:48),ty:Y(m0.v)-(mob?46:58),kind:"curve",anchor:"end",
          lines:[["Superfície (0–100 m)",true,C.blau],[mob?"6,8 M virus · 11 a 1":"6,8 M virus · 540.000 bacteris"]]});
      }
      if(filt==="all"||filt==="2"){
        const m2=med[2];
        V.note(gNote,{x:X(m2.b),y:Y(m2.v)+7,tx:X(m2.b)+(mob?18:44),ty:Y(m2.v)+(mob?44:48),kind:"curve",anchor:"start",
          lines:[["Fondària (> 1.000 m)",true,C.vermell],["mediana de 36 virus per bacteri"]]});
      }
      if(!mob){
        const xe=6.55;
        V.note(gNote,{x:X(xe),y:Y(TR0+TR1*xe)+2,tx:X(xe)+18,ty:Y(TR0+TR1*xe)+36,kind:"straight",anchor:"start",
          lines:[["Tendència global",true],["pendent 0,70 (càlcul propi)"]]});
      }
    }

    /* Capa SPREAD-04: Pols fina de les 5.508 mostres en Canvas multiply */
    let rev=1;
    function paintCanvas(){
      ctx.clearRect(0,0,W,H);
      ctx.save(); ctx.beginPath(); ctx.rect(m.l,m.t,W-m.l-m.r,H-m.t-m.b); ctx.clip();
      ctx.globalCompositeOperation="multiply";
      const n=Math.floor(P.length*rev), rad=mob?1.35:1.65;
      for(let j=0;j<n;j++){
        const p=P[order[j]], on=filt==="all"||+filt===p.k;
        ctx.globalAlpha=on?.26:.04;
        ctx.fillStyle=BC[p.k];
        ctx.beginPath(); ctx.arc(X(p.b),Y(p.v),rad,0,6.2832); ctx.fill();
      }
      ctx.restore();
    }

    /* Hover barat amb d3.Delaunay + guies fins als eixos + dock d'una línia */
    const gHv=s.append("g").style("pointer-events","none");
    const tp=V.tip(el);
    let del=null, curIdx=-1;
    function rebuildDel(){
      const vis=P.filter(p=>filt==="all"||+filt===p.k);
      del={pts:vis, d:d3.Delaunay.from(vis,p=>X(p.b),p=>Y(p.v))};
    }
    rebuildDel();
    const clearHv=()=>{ curIdx=-1; gHv.selectAll("*").remove(); tp.hide(); };
    const fVal=v=>v>=1e6?f1(v/1e6)+" M":f0(Math.round(v/100)*100);
    s.style("cursor","crosshair");
    V.hover(s.node(),(ev,[px,py])=>{
      if(px<m.l||px>W-m.r||py<m.t||py>H-m.b){ if(curIdx>=0)clearHv(); return; }
      const ci=del.d.find(px,py), cand=del.pts[ci];
      if(!cand||Math.hypot(X(cand.b)-px,Y(cand.v)-py)>22){ if(curIdx>=0)clearHv(); return; }
      if(cand.idx!==curIdx){
        curIdx=cand.idx; gHv.selectAll("*").remove();
        const cx=X(cand.b), cy=Y(cand.v);
        gHv.append("line").attr("x1",cx).attr("x2",cx).attr("y1",cy).attr("y2",H-m.b).attr("stroke",C.ink).attr("stroke-width",.75).attr("stroke-dasharray","2 2");
        gHv.append("line").attr("x1",m.l).attr("x2",cx).attr("y1",cy).attr("y2",cy).attr("stroke",C.ink).attr("stroke-width",.75).attr("stroke-dasharray","2 2");
        gHv.append("circle").attr("cx",cx).attr("cy",cy).attr("r",5).attr("fill",BC[cand.k]).attr("stroke",C.ink).attr("stroke-width",1.5);
        const B=Math.pow(10,cand.b), Vv=Math.pow(10,cand.v), ratio=Vv/B;
        tp.show(`<b>${ST[cand.s]}</b> (${fmtN(cand.d,cand.d<10?1:0)} m)<br>${fVal(Vv)} virus/ml · ${fVal(B)} bacteris/ml (${fmtN(ratio,ratio<10?1:0)} a 1)`);
      }
    },clearHv);

    redrawSea=function(){ rebuildDel(); clearHv(); paintCanvas(); drawContours(); drawOverlays(); };

    V.onView(el,inst=>{
      if(inst){ rev=1; paintCanvas(); drawContours(); drawOverlays(); return; }
      trend.style("opacity",0); gCont.style("opacity",0); gMed.style("opacity",0); gNote.style("opacity",0);
      d3.transition().duration(1050).ease(d3.easeCubicOut).tween("sea",()=>t=>{ rev=t; paintCanvas(); })
        .on("end",()=>{
          drawContours(); drawOverlays();
          gCont.transition().duration(550).ease(d3.easeCubicOut).style("opacity",1);
          trend.transition().duration(400).style("opacity",1);
          gMed.transition().duration(400).style("opacity",1);
          gNote.transition().delay(180).duration(400).style("opacity",1);
        });
    });
    if(el.__seen){ rev=1; paintCanvas(); drawContours(); drawOverlays(); }
  });

  seg.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    filt=b.dataset.d;
    [...seg.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    nEl.textContent=filt==="all"?"Totes les fondàries · Escala logarítmica als dos eixos":`${BLAB[+filt]} · ${f0(med[+filt].n)} mostres · Escala logarítmica`;
    if(redrawSea)redrawSea();
  });
})();

/* =====================================================================
   4. LINK-03 CURTCIRCUIT VIRAL — RIU D'AQUAREL·LA AMB ~1.100 MICRO-TRAÇOS
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("shunt-viz"); if(!vizEl)return;
  const seg=document.getElementById("shSeg"), playB=document.getElementById("shPlay"), lgEl=document.getElementById("shunt-lg");
  if(lgEl)V.legendCat(lgEl,[
    {c:C.groc,t:"Carboni fixat (algues)"},
    {c:C.blau,t:"Bucle microbià"},
    {c:C.vermell,t:"Curtcircuit viral (lisi)"},
    {c:C.ink2,t:"Cadena tròfica (peixos)"}
  ]);

  const ND={
    fito:{id:"fito",n:["Algues","microscòpiques"],d:[130,108],m:[84,76],c:C.groc,sc:C.grocFosc,tip:"<b>Algues microscòpiques (fitoplàncton)</b> · Fixen carboni amb la llum solar; amb virus produeixen més gràcies als nutrients reciclats"},
    zoo: {id:"zoo", n:["Zooplàncton","i protists"],d:[495,108],m:[316,76],c:C.ink2,sc:C.ink2,tip:"<b>Zooplàncton i protists</b> · Es mengen algues i bacteris i transfereixen carboni cap als peixos"},
    peix:{id:"peix",n:["Peixos"],d:[865,108],m:[316,250],c:C.ink2,sc:C.ink2,tip:"<b>Peixos</b> · Amb virus hi arriba menys carboni perquè una part queda retinguda en el bucle microbià"},
    dom: {id:"dom", n:["Matèria orgànica","dissolta"],d:[305,305],m:[84,424],c:C.groc,sc:C.grocFosc,tip:"<b>Matèria orgànica dissolta</b> · Carboni, nitrogen i fòsfor alliberats a l'aigua; els virus multipliquen aquest dipòsit"},
    bac: {id:"bac", n:["Bacteris"],d:[690,305],m:[316,424],c:C.blau,sc:C.blau,tip:"<b>Bacteris</b> · Consumeixen la matèria dissolta i es converteixen en la diana principal dels fags"}
  };
  const ED=[
    {id:"f-z",a:"fito",b:"zoo", f:[58,44],bend:-28,c:C.ink2,   sc:C.ink2,     n:175,tip:"<b>Algues → Zooplàncton</b> · Baixa lleugerament quan els virus destrueixen part del fitoplàncton"},
    {id:"z-p",a:"zoo", b:"peix",f:[26,17],bend:-28,c:C.ink2,   sc:C.ink2,     n:120,tip:"<b>Zooplàncton → Peixos</b> · Menys carboni puja cap als nivells superiors de la cadena"},
    {id:"f-d",a:"fito",b:"dom", f:[28,28],bend:20, c:C.groc,   sc:C.grocFosc, n:135,tip:"<b>Algues → Matèria dissolta</b> · Exsudació natural de carboni dissolt"},
    {id:"d-b",a:"dom", b:"bac", f:[30,68],bend:32, c:C.blau,   sc:C.blau,     n:220,tip:"<b>Matèria dissolta → Bacteris</b> · El reciclatge microbià es dispara quan hi ha virus"},
    {id:"b-z",a:"bac", b:"zoo", f:[22,14],bend:22, c:C.blau,   sc:C.blau,     n:110,tip:"<b>Bacteris → Zooplàncton</b> · Menys bacteris passen als protists perquè molts moren per lisi"},
    {id:"fv", a:"fito",b:"dom", f:[0,24], bend:-62,c:C.vermell,sc:C.vermell,v:1,n:165,tip:"<b>Lisi viral d'algues → Matèria dissolta</b> · Els virus fan esclatar algues i retornen carboni a l'aigua"},
    {id:"bv", a:"bac", b:"dom", f:[0,26], bend:76, c:C.vermell,sc:C.vermell,v:1,n:185,tip:"<b>Curtcircuit viral (lisi de bacteris)</b> · El contingut dels bacteris esclatats alimenta altres bacteris"}
  ]; /* Total: 1.110 micro-traços a escriptori */

  let vir=1, runP=true, updateMode=null, clearShuntHv=null;
  document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!vizEl.contains(ev.target)&&clearShuntHv)clearShuntHv(); });

  V.mount(vizEl,(el,W)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=W<600;
    const F=mob?{w:400,h:550}:{w:1000,h:400};
    const S=Math.min(mob?1.2:1.1,W/F.w), ox=(W-F.w*S)/2, H=Math.round(F.h*S);
    d3.select(el).selectAll("canvas.ibv,svg.ibv").remove();
    const s=V.svg(el,W,H,"Esquema de fluxos de carboni marí: amb virus, el curtcircuit viral retorna carboni d'algues i bacteris a matèria dissolta, augmentant el reciclatge microbià i reduint el flux cap als peixos.");
    const {c:cv,ctx}=V.canvas(el,W,H,"");
    d3.select(cv).attr("role",null).attr("aria-hidden","true").style("position","absolute").style("left",0).style("top",0).style("pointer-events","none");

    const pos=k=>{ const p=mob?ND[k].m:ND[k].d; return [ox+p[0]*S,p[1]*S]; };
    function curve(e){
      const a=pos(e.a), b=pos(e.b), mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
      const dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1;
      const bd=e.bend*S*(mob?.78:1);
      return [a,[mx-dy/L*bd,my+dx/L*bd],b];
    }
    const qp=(q,t)=>{ const u=1-t; return [u*u*q[0][0]+2*u*t*q[1][0]+t*t*q[2][0],u*u*q[0][1]+2*u*t*q[1][1]+t*t*q[2][1]]; };
    const ws=Math.max(.75,Math.min(1.15,S*1.05))*(mob?.85:1);
    const nr=Math.round(33*Math.min(1.12,Math.max(.82,S*1.05)));

    const defs=s.append("defs");
    const uid="sh"+Math.random().toString(36).slice(2,6);
    const gEdges=s.append("g"), gNodes=s.append("g"), gNotes=s.append("g").style("pointer-events","none");

    /* Bandes d'aquarel·la translúcides (doble veladura multiply sense contorns durs) */
    const edgeSel=gEdges.selectAll("g.ed").data(ED).join("g").attr("class","ed").style("cursor","pointer");
    edgeSel.each(function(e){
      const q=curve(e), g=d3.select(this);
      const pathD=`M${q[0][0]},${q[0][1]} Q${q[1][0]},${q[1][1]} ${q[2][0]},${q[2][1]}`;
      const lgId=uid+"e"+e.id;
      const lg=defs.append("linearGradient").attr("id",lgId).attr("gradientUnits","userSpaceOnUse")
        .attr("x1",q[0][0]).attr("y1",q[0][1]).attr("x2",q[2][0]).attr("y2",q[2][1]);
      lg.append("stop").attr("offset",0).attr("stop-color",e.c).attr("stop-opacity",.04);
      lg.append("stop").attr("offset",.22).attr("stop-color",e.c).attr("stop-opacity",e.c===C.groc?.28:.2);
      lg.append("stop").attr("offset",.78).attr("stop-color",e.c).attr("stop-opacity",e.c===C.groc?.28:.2);
      lg.append("stop").attr("offset",1).attr("stop-color",e.c).attr("stop-opacity",.04);

      g.append("path").attr("class","wash").attr("d",pathD).attr("fill","none")
        .attr("stroke",`url(#${lgId})`).attr("stroke-linecap","round").style("mix-blend-mode","multiply");
      g.append("path").attr("class","band").attr("d",pathD).attr("fill","none")
        .attr("stroke",`url(#${lgId})`).attr("stroke-linecap","round").style("mix-blend-mode","multiply");
      g.append("path").attr("class","hit").attr("d",pathD).attr("fill","none").attr("stroke","transparent").attr("stroke-width",24);
      const pt=qp(q,.56), pn=qp(q,.60), ang=Math.atan2(pn[1]-pt[1],pn[0]-pt[0])*180/Math.PI;
      g.append("path").attr("class","arr").attr("d","M5,0 L-3,-3.2 L-3,3.2 Z").attr("fill",e.sc)
        .attr("transform",`translate(${pt[0]},${pt[1]}) rotate(${ang})`);
    });

    /* Nodes d'aquarel·la amb radialGradient + multiply i gravats científics */
    const nodeList=Object.values(ND);
    const nodeSel=gNodes.selectAll("g.nd").data(nodeList).join("g").attr("class","nd").style("cursor","pointer");
    nodeSel.each(function(nd){
      const [x,y]=pos(nd.id), g=d3.select(this);
      const gid=addWashGrad(defs,uid+"n"+nd.id,nd.c,nd.c===C.groc?.42:.26,nd.c===C.groc?.2:.12,.03);
      g.append("circle").attr("class","aura").attr("cx",x).attr("cy",y).attr("r",nr)
        .attr("fill",gid).style("mix-blend-mode","multiply");
      g.append("circle").attr("class","rim").attr("cx",x).attr("cy",y).attr("r",nr)
        .attr("fill","none").attr("stroke",nd.sc).attr("stroke-opacity",.36).attr("stroke-width",.8);
      const ic=g.append("g").attr("transform",`translate(${x},${y})`).attr("fill","none").attr("stroke",nd.sc).attr("stroke-width",1.15).attr("stroke-linecap","round");
      const r=nr*.52;
      if(nd.id==="fito"){
        [[-.42,-.18,.36],[.34,-.34,.28],[.18,.4,.32],[-.34,.45,.2]].forEach(([a,b,rr])=>{
          ic.append("circle").attr("cx",a*r).attr("cy",b*r).attr("r",rr*r).attr("fill",V.alpha(C.groc,.35));
        });
      } else if(nd.id==="zoo"){
        ic.append("ellipse").attr("rx",r*.72).attr("ry",r*.4).attr("transform","rotate(-16)").attr("fill",V.alpha(C.ink2,.08));
        ic.append("path").attr("d",`M${-r*.4},${-r*.25}L${-r*.92},${-r*.75} M${-r*.22},${-r*.34}L${-r*.52},${-r*.92} M${r*.6},${r*.18}L${r*.95},${r*.52}`);
      } else if(nd.id==="peix"){
        ic.append("path").attr("d",`M${-r*.8},0 Q0,${-r*.58} ${r*.78},0 Q0,${r*.58} ${-r*.8},0 M${-r*.8},0 L${-r*1.18},${-r*.38} L${-r*1.18},${r*.38} Z`).attr("fill",V.alpha(C.ink2,.08));
      } else if(nd.id==="dom"){
        const rr=V.rng(17);
        for(let i=0;i<16;i++){
          const a=i*2.4, d=(.2+rr()*.75)*r;
          ic.append("circle").attr("cx",Math.cos(a)*d).attr("cy",Math.sin(a)*d*.72).attr("r",1.6).attr("fill",C.grocFosc).attr("stroke","none").attr("opacity",.72);
        }
      } else if(nd.id==="bac"){
        [[-.34,-.24,18],[.34,.18,-28],[-.08,.42,68]].forEach(([a,b,ro])=>{
          ic.append("rect").attr("x",-r*.46).attr("y",-r*.2).attr("width",r*.92).attr("height",r*.4).attr("rx",r*.2)
            .attr("transform",`translate(${a*r},${b*r}) rotate(${ro})`).attr("fill",V.alpha(C.blau,.16));
        });
      }
      nd.n.forEach((ln,i)=>V.t(g,x,y+nr+15+i*14,ln,{size:mob?11.5:12.5,weight:i===0?700:400,fill:i===0?C.ink:C.ink2,anchor:"middle",halo:3}));
    });

    /* Anotacions editorials del curtcircuit viral */
    function drawNotes(vOn){
      gNotes.selectAll("*").remove();
      if(!vOn)return;
      const qL=curve(ED[6]), pL=qp(qL,.5);
      V.t(gNotes,pL[0],pL[1]-(mob?30:22),"Curtcircuit viral",{size:mob?11.5:12.5,weight:700,fill:C.vermell,anchor:"middle",halo:3.5});
      V.t(gNotes,pL[0],pL[1]-(mob?16:8),"els virus fan esclatar microbis",{size:11,fill:C.ink2,anchor:"middle",halo:3.5});
      const pFish=qp(curve(ED[1]),.5), pMic=qp(curve(ED[3]),.5);
      V.t(gNotes,pFish[0],pFish[1]-(mob?10:18),"↓ Menys carboni als peixos",{size:11.5,weight:600,fill:C.vermell,anchor:mob?"end":"middle",halo:3.5});
      V.t(gNotes,pMic[0],mob?H-10:pMic[1]+24,"↑ Més reciclatge microbià",{size:11.5,weight:600,fill:C.blau,anchor:"middle",halo:3.5});
    }

    /* ~1.100 micro-traços corbats molt lents (~26–32 s) agrupats per flux per anar a 60 fps */
    const rnd=V.rng(40), scaleCount=mob?.68:1;
    const edgeGroups=ED.map((e,ei)=>{
      const q=curve(e), count=Math.round(e.n*scaleCount), list=[];
      for(let i=0;i<count;i++){
        list.push({
          t:rnd(),
          off:(rnd()-.5)*.82,
          sp:(.000031+rnd()*.000008), /* ~26–32 segons per travessar */
          len:.032+rnd()*.034,
          pw:.65+rnd()*.48,
          aScale:.45+rnd()*.55
        });
      }
      return {e,q,list};
    });

    let virA=vir, foc=null;
    function applyStyle(instant){
      const dur=instant||RM?0:420;
      edgeSel.each(function(e){
        const wVal=e.f[vir], g=d3.select(this);
        const sw=wVal<=.3?0:Math.max(4,wVal*.44*ws);
        g.select(".wash").transition().duration(dur).attr("stroke-width",sw*1.55).attr("stroke-opacity",wVal<=.3?0:.52);
        g.select(".band").transition().duration(dur).attr("stroke-width",sw*.82).attr("stroke-opacity",wVal<=.3?0:.85);
        g.select(".arr").transition().duration(dur).style("opacity",wVal<=.3?0:.82);
      });
      drawNotes(vir===1);
    }

    function drawParticles(){
      ctx.clearRect(0,0,W,H);
      ctx.lineCap="round"; ctx.lineJoin="round";
      for(const grp of edgeGroups){
        const e=grp.e, q=grp.q, wVal=lerp(e.f[0],e.f[1],virA);
        if(wVal<=.5)continue;
        const bw=Math.max(4,wVal*.44*ws);
        const dimF=foc?(foc.has(e.id)?1:.24):1;
        const baseA=.58*dimF*Math.min(1,wVal/16);
        if(baseA<.02)continue;
        ctx.strokeStyle=e.sc;
        const q0x=q[0][0], q0y=q[0][1], q1x=q[1][0], q1y=q[1][1], q2x=q[2][0], q2y=q[2][1];
        for(let i=0;i<grp.list.length;i++){
          const p=grp.list[i], t1=p.t, t0=t1-p.len;
          if(t0<0)continue;
          const fade=sm(clamp(t1/.11,0,1))*sm(clamp((1-t1)/.11,0,1));
          const a=baseA*fade*p.aScale;
          if(a<.03)continue;
          const offPx=p.off*bw*.68;
          ctx.globalAlpha=a;
          ctx.lineWidth=p.pw;
          ctx.beginPath();
          for(let sI=0;sI<=3;sI++){
            const tt=t0+(t1-t0)*(sI/3), u=1-tt;
            const px=u*u*q0x+2*u*tt*q1x+tt*tt*q2x;
            const py=u*u*q0y+2*u*tt*q1y+tt*tt*q2y;
            const tx=2*u*(q1x-q0x)+2*tt*(q2x-q1x);
            const ty=2*u*(q1y-q0y)+2*tt*(q2y-q1y);
            const L=Math.hypot(tx,ty)||1;
            const ox=px-ty/L*offPx, oy=py+tx/L*offPx;
            sI?ctx.lineTo(ox,oy):ctx.moveTo(ox,oy);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha=1;
    }

    /* Hover suau (IBV.focus + IBV.tip dock) */
    const tp=V.tip(el);
    function clearHv(){
      foc=null; tp.hide();
      V.focus(edgeSel,null); V.focus(nodeSel,null);
      nodeSel.select(".rim").attr("stroke-width",.8).attr("stroke-opacity",.36);
      if(RM||!runP)drawParticles();
    }
    edgeSel.on("pointerenter pointerdown",(ev,e)=>{
      if(e.f[vir]<=.3)return;
      foc=new Set([e.id]);
      V.focus(edgeSel,d=>d.id===e.id,{dim:.48});
      V.focus(nodeSel,d=>d.id===e.a||d.id===e.b,{dim:.48});
      tp.show(e.tip);
      if(RM||!runP)drawParticles();
    }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")clearHv(); });
    nodeSel.on("pointerenter pointerdown",(ev,nd)=>{
      const ids=new Set(ED.filter(e=>(e.a===nd.id||e.b===nd.id)&&e.f[vir]>.3).map(e=>e.id));
      foc=ids;
      V.focus(edgeSel,d=>ids.has(d.id),{dim:.48});
      V.focus(nodeSel,d=>d.id===nd.id||ED.some(e=>ids.has(e.id)&&(e.a===d.id||e.b===d.id)),{dim:.48});
      d3.select(ev.currentTarget).select(".rim").attr("stroke-width",1.6).attr("stroke-opacity",.9);
      tp.show(nd.tip);
      if(RM||!runP)drawParticles();
    }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")clearHv(); });
    clearShuntHv=clearHv;

    applyStyle(true);
    updateMode=function(){ applyStyle(false); if(RM||!runP){ virA=vir; drawParticles(); } };

    V.onView(el,inst=>{
      if(inst)return;
      gEdges.style("opacity",0).transition().duration(750).ease(d3.easeCubicOut).style("opacity",1);
      gNodes.style("opacity",0).transition().delay(180).duration(650).ease(d3.easeCubicOut).style("opacity",1);
    });

    el.__loop=V.loop(el,(t,dt)=>{
      virA+=(vir-virA)*Math.min(1,(dt/1000)*3.2);
      if(runP&&!RM){
        for(const grp of edgeGroups){
          for(let i=0;i<grp.list.length;i++){
            const p=grp.list[i]; p.t+=dt*p.sp; if(p.t>1)p.t-=1;
          }
        }
      }
      drawParticles();
    });
  });

  seg.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    vir=+b.dataset.v;
    [...seg.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    if(updateMode)updateMode();
  });
  if(playB){
    if(RM){ playB.style.display="none"; }
    else {
      playB.addEventListener("click",()=>{
        runP=!runP;
        playB.textContent=runP?"Atura els fils":"Torna a moure els fils";
        playB.setAttribute("aria-pressed",String(!runP));
      });
    }
  }
})();

/* ================= temps de lectura ================= */
(()=>{
  const n=[...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")]
    .filter(e=>!e.closest(".fn"))
    .reduce((a,e)=>a+(e.textContent.match(/[\p{L}\p{N}·'’]+/gu)||[]).length,0);
  const figs=document.querySelectorAll("figure.fig,.scrolly").length;
  let sec=n/218*60; for(let i=0;i<figs;i++)sec+=Math.max(3,12-i);
  const el=document.getElementById("rt"); if(el)el.textContent=Math.max(1,Math.round(sec/60))+" min de lectura";
})();
})();
