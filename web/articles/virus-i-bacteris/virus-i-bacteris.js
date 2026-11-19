/* «La guerra invisible» — gràfics 1 (sistema infogràfic IBV):
   1. IB-35 + gravat científic a escala (òvul humà → fag T4)
   2. IB-16 esquema orgànic animat del cicle d'infecció (lític T4 i lisogènic lambda)
   3. IB-07 / IB-08 dispersió logarítmica de 5.508 mostres marines (Canvas + SVG)
   4. IB-40 flux amb fils de partícules lentes del curtcircuit viral (SVG + Canvas)
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

/* Etiqueta multilínia en canvas amb halo blanc (mateixa jerarquia que IBV.t) */
function txt(c,lines,x,y,al,fs,a,halo){
  c.save(); c.globalAlpha=a==null?1:a; c.textAlign=al||"left"; c.textBaseline="alphabetic";
  lines.forEach((l,i)=>{
    if(!l||l[0]==null||l[0]==="")return;
    c.font=`${l[1]?"700 ":""}${fs}px ${SSF}`;
    const yy=y+i*fs*1.28;
    if(halo!==false){ c.lineWidth=3.2; c.strokeStyle="rgba(255,255,255,.94)"; c.lineJoin="round"; c.strokeText(l[0],x,yy); }
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
  o=o||{}; const k=o.k||0, legs=o.legs==null?0:o.legs, al=o.a==null?1:o.a;
  c.save(); c.globalAlpha=al; c.translate(x,y); if(o.rot)c.rotate(o.rot); c.scale(s,s);
  c.lineJoin="round"; c.lineCap="round";
  const bpH=27,bpW=52,shL=lerp(92.5,42,k),shW=lerp(24,33,k),neck=8,hL=115,hW=85,tube=92.5;
  const lw=Math.max(.6/s,1.05);
  const fib=(dir,depth)=>{
    const bx=dir*bpW*.42, by=-bpH*.55;
    const kx=lerp(dir*36,dir*(70+depth*8),legs), ky=lerp(-bpH-58,-56+depth*4,legs);
    const tx=lerp(dir*(18+depth*6),dir*(118+depth*14),legs), ty=lerp(-6,0,legs);
    c.beginPath(); c.moveTo(bx,by); c.lineTo(kx,ky); c.lineTo(tx,ty); c.stroke();
  };
  c.strokeStyle=C.ink2; c.lineWidth=lw*1.15;
  fib(-1,0); fib(1,0); c.globalAlpha=al*.52; fib(-1,1); fib(1,1); c.globalAlpha=al;
  if(k>0){ const p=tube-shL; c.fillStyle=C.ink2; c.fillRect(-4.5,-bpH*.2,9,p+bpH*.2); }
  const w2=lerp(bpW,bpW*1.25,k)/2, h2=lerp(bpH,bpH*.7,k);
  c.fillStyle=C.ink; c.beginPath(); c.moveTo(-w2,0); c.lineTo(w2,0); c.lineTo(w2*.72,-h2); c.lineTo(-w2*.72,-h2); c.closePath(); c.fill();
  const sy=-h2, sTop=sy-shL;
  c.fillStyle=C.ink2; c.fillRect(-shW/2,sTop,shW,shL);
  c.strokeStyle="rgba(255,255,255,.55)"; c.lineWidth=lw*.65;
  const nR=Math.max(4,Math.round(shL/4.1));
  for(let i=1;i<nR;i++){ const yy=sTop+i*shL/nR; c.beginPath(); c.moveTo(-shW/2,yy); c.lineTo(shW/2,yy); c.stroke(); }
  const nTop=sTop-neck; c.fillStyle=C.ink2; c.fillRect(-8,nTop,16,neck); c.fillRect(-17,nTop+2,34,2.6);
  const hb=nTop, ht=hb-hL, sh=hW/2;
  c.beginPath(); c.moveTo(0,hb+2); c.lineTo(sh,hb-20); c.lineTo(sh,ht+20); c.lineTo(0,ht); c.lineTo(-sh,ht+20); c.lineTo(-sh,hb-20); c.closePath();
  c.fillStyle=o.empty?"rgba(255,255,255,.85)":V.alpha(C.vermell,.15); c.fill();
  c.strokeStyle=C.ink; c.lineWidth=lw*1.2; c.stroke();
  c.strokeStyle=V.alpha(C.ink,.22); c.lineWidth=lw*.7;
  c.beginPath(); c.moveTo(-sh,hb-20); c.lineTo(0,hb-34); c.lineTo(sh,hb-20);
  c.moveTo(-sh,ht+20); c.lineTo(0,ht+34); c.lineTo(sh,ht+20); c.moveTo(0,hb-34); c.lineTo(0,ht+34); c.stroke();
  if(!o.empty){
    c.strokeStyle=C.vermell; c.globalAlpha=al*.78; c.lineWidth=lw*1.05;
    const my=(hb+ht)/2;
    for(let r=8;r<=32;r+=6){ c.beginPath(); c.ellipse(0,my,r,r*1.32,0,0,6.2832); c.stroke(); }
  }
  c.restore();
  return {head:[x,y-(h2+shL+neck+hL/2)*s],headTop:y-(h2+shL+neck+hL)*s,sheath:[x,y-(h2+shL/2)*s],base:[x,y-h2*s/2]};
}
function miniT4(c,x,y,s,rot,a){
  c.save(); c.globalAlpha=a==null?1:a; c.translate(x,y); c.rotate(rot||0); c.scale(s,s);
  c.fillStyle=C.ink2; c.fillRect(-12,10,24,80); c.fillStyle=C.ink; c.fillRect(-20,88,40,14);
  c.beginPath(); c.moveTo(0,12); c.lineTo(42,-8); c.lineTo(42,-82); c.lineTo(0,-103); c.lineTo(-42,-82); c.lineTo(-42,-8); c.closePath();
  c.fillStyle=V.alpha(C.vermell,.24); c.fill(); c.strokeStyle=C.ink; c.lineWidth=Math.max(1/s,5.5); c.stroke(); c.restore();
}
function miniHead(c,x,y,s,rot,a){
  c.save(); c.globalAlpha=a==null?1:a; c.translate(x,y); c.rotate(rot||0); c.scale(s,s);
  c.beginPath(); c.moveTo(0,57); c.lineTo(42,37); c.lineTo(42,-37); c.lineTo(0,-57); c.lineTo(-42,-37); c.lineTo(-42,37); c.closePath();
  c.fillStyle=V.alpha(C.vermell,.12); c.fill(); c.strokeStyle=C.ink2; c.lineWidth=Math.max(1/s,5.5); c.stroke(); c.restore();
}
function miniTail(c,x,y,s,rot,a){
  c.save(); c.globalAlpha=a==null?1:a; c.translate(x,y); c.rotate(rot||0); c.scale(s,s);
  c.fillStyle=C.ink2; c.fillRect(-12,-46,24,80); c.fillStyle=C.ink; c.fillRect(-20,32,40,14); c.restore();
}
function drawLambda(c,x,y,s,o){
  o=o||{}; c.save(); c.globalAlpha=o.a==null?1:o.a; c.translate(x,y); if(o.rot)c.rotate(o.rot); c.scale(s,s); c.lineCap="round";
  const lw=Math.max(.6/s,1.05), bend=o.bend==null?8:o.bend;
  c.strokeStyle=C.ink2; c.lineWidth=9; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(bend,-68,0,-135); c.stroke();
  c.strokeStyle=C.ink; c.lineWidth=lw*1.3; c.beginPath(); c.moveTo(0,0); c.lineTo(0,18); c.stroke();
  const cy=-165, r=30;
  c.beginPath(); for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3, px=Math.cos(a)*r, py=cy+Math.sin(a)*r; i?c.lineTo(px,py):c.moveTo(px,py); } c.closePath();
  c.fillStyle=o.empty?"rgba(255,255,255,.85)":V.alpha(C.vermell,.2); c.fill(); c.strokeStyle=C.ink; c.lineWidth=lw*1.2; c.stroke(); c.restore();
}

window.VIB={C,SSF,RM,clamp,lerp,ease,sm,fmtN,txt,lead,drawT4,miniT4,miniHead,miniTail,drawLambda};

/* =====================================================================
   1. IB-35 ESCALA COMPARATIVA + GRAVAT CIENTÍFIC A ESCALA
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
    {id:"fag",   v:.2,   t:"Fag T4",          ts:"Fag T4",    m:"0,2 µm",   c:C.vermell, zIdx:4, desc:"Un dels fags més estudiats (~200 nm d'alt)"},
    {id:"bac",   v:2,    t:"Bacteri E. coli", ts:"E. coli",   m:"2 µm",     c:C.blau,    zIdx:3, desc:"Bacteri intestinal de 2 × 1 µm"},
    {id:"glob",  v:7.5,  t:"Glòbul vermell",  ts:"Glòbul",    m:"7,5 µm",   c:C.groc,    zIdx:2, desc:"Eritròcit humà (7–8 µm de diàmetre)"},
    {id:"hela",  v:20,   t:"Cèl·lula humana", ts:"Cèl·lula",  m:"20 µm",    c:C.ink2,    zIdx:1, desc:"Cèl·lula humana en cultiu (HeLa)"},
    {id:"ovul",  v:120,  t:"Òvul humà",       ts:"Òvul",      m:"120 µm",   c:C.ink2,    zIdx:0, desc:"La cèl·lula més gran del cos humà"}
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
    return big?`×${s} més gran`:`÷${s} més petit`;
  }

  /* ---- 1A. Cinta logarítmica IB-35 ---- */
  let renderArc=null;
  V.mount(ribEl,(el,w)=>{
    const mob=w<560, h=mob?210:192, ml=mob?26:44, mr=mob?26:44, axisY=mob?100:112;
    const s=V.svg(el,w,h,"Escala logarítmica comparativa d'un fag T4 (0,2 micres) fins a un òvul humà (120 micres): 600 vegades més gran. Clica qualsevol cercle per fixar-lo com a referència.");
    const g=s.append("g");
    const X=d3.scaleLinear([-0.9,2.28],[ml,w-mr]);
    const rSc=d3.scaleSqrt().domain([.2,120]).range(mob?[7,18]:[8,22]);

    /* línia base fina i marques logarítmiques */
    g.append("line").attr("x1",ml).attr("x2",w-mr).attr("y1",axisY).attr("y2",axisY).attr("stroke",C.hair).attr("stroke-width",.8);
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
        .attr("fill",d.c).attr("fill-opacity",d.c===C.groc?.34:.22).style("mix-blend-mode","multiply");
      q.append("circle").attr("class","core").attr("cx",x).attr("cy",axisY).attr("r",3.2)
        .attr("fill",d.c===C.groc?C.grocFosc:d.c).attr("stroke","#fff").attr("stroke-width",1.2);
      const row=mob?(i%2):0;
      const yLab=axisY+(mob?34+row*26:42);
      const anc=i===0?"start":i===ITEMS.length-1?"end":"middle";
      q.append("line").attr("x1",x).attr("x2",x).attr("y1",axisY+rad+2).attr("y2",yLab-12).attr("stroke",C.hair).attr("stroke-width",.6);
      V.t(q,x,yLab,mob?d.ts:d.t,{size:11.5,weight:600,fill:C.ink,anchor:anc,halo:3});
      V.t(q,x,yLab+13,d.m,{size:11,fill:C.muted,anchor:anc,halo:3});
      q.append("circle").attr("cx",x).attr("cy",axisY).attr("r",Math.max(18,rad+4)).attr("fill","transparent");
    });

    const tp=V.tip(el);
    renderArc=function(hv){
      const anc=ITEMS.find(d=>d.id===anchorId)||ITEMS[0];
      const tgt=hv||ITEMS.find(d=>d.id===focusId)||ITEMS[4];
      gArc.selectAll("*").remove();
      pts.each(function(d){
        const q=d3.select(this), isA=d.id===anc.id, isT=tgt&&d.id===tgt.id, on=isA||isT;
        q.style("opacity",on?1:.48);
        q.select(".core").attr("r",isA?4.8:isT?4.2:3.2).attr("stroke",isA?C.ink:"#fff").attr("stroke-width",isA?1.6:1.2);
        q.select(".halo").attr("fill-opacity",on?(d.c===C.groc?.46:.34):.16);
      });
      if(!tgt||tgt.id===anc.id){
        tp.show(`<b>${anc.t}</b> (${anc.m}) · Referència activa — passa per una altra mida per comparar-la`);
        return;
      }
      const x1=X(anc.k), x2=X(tgt.k), mx=(x1+x2)/2, span=Math.abs(x2-x1);
      const arcH=Math.min(axisY-42,Math.max(32,span*.2));
      const col=tgt.k>=anc.k?C.vermell:C.blau;
      gArc.append("path").attr("d",`M${x1},${axisY-8} Q${mx},${axisY-8-arcH*1.45} ${x2},${axisY-8}`)
        .attr("fill","none").attr("stroke",col).attr("stroke-width",1.6).attr("stroke-opacity",.9);
      const topY=Math.max(18,axisY-8-arcH*.72-14);
      const lx=clamp(mx,mob?110:155,w-(mob?110:155));
      const ratioStr=fmtRatio(anc,tgt);
      V.t(gArc,lx,topY,`${anc.ts} → ${tgt.ts}: ${ratioStr}`,{size:mob?12:13,weight:700,fill:col,anchor:"middle",halo:4});
      tp.show(`<b>${anc.t}</b> (${anc.m}) → <b>${tgt.t}</b> (${tgt.m}): <b>${ratioStr}</b> · Clica un cercle per canviar la referència`);
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

  /* ---- 1B. Gravat científic a escala (Canvas interactiu) ---- */
  const blob=[]; for(let i=0;i<64;i++){ const a=i/64*6.2832; blob.push([a,1+.06*Math.sin(3*a+.6)+.04*Math.sin(5*a+1.9)+.03*Math.sin(8*a)]); }
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
    const mob=W<640, H=Math.round(clamp(W*(mob?.74:.42),220,mob?350:420));
    const {c:cv,ctx:c}=V.canvas(el,W,H,"Comparació de mides a escala: un òvul humà de 120 micres, una cèl·lula humana de 20 micres, un glòbul vermell de 7,5 micres, un bacteri E. coli de 2 micres de llarg i un fag T4 de 0,2 micres aterrat a la seva superfície.");
    const fs=mob?11:12.5;
    drawScale=function(){
      const k=cam(z), s=W/k.W, X=x=>W/2+(x-k.x)*s, Y=y=>H/2-(y-k.y)*s, R=r=>r*s;
      c.clearRect(0,0,W,H);
      /* Òvul humà: gravat orgànic translúcid en gris pedra */
      const oc=[75,40], orr=60;
      if(R(orr)>3){
        c.fillStyle=V.alpha(C.land,.65); c.beginPath(); c.arc(X(oc[0]),Y(oc[1]),R(orr),0,6.2832); c.fill();
        c.strokeStyle=V.alpha(C.ink2,.38); c.lineWidth=Math.max(.9,R(4.2)); c.stroke();
        c.fillStyle=V.alpha(C.ghost,.5); c.beginPath(); c.arc(X(oc[0]+12),Y(oc[1]+8),R(13),0,6.2832); c.fill();
      }
      /* Cèl·lula humana (HeLa) */
      const hc=[-14,6], hr=10;
      if(R(hr)>2){
        c.beginPath(); blob.forEach(([a,f],i)=>{ const px=X(hc[0]+Math.cos(a)*hr*f), py=Y(hc[1]+Math.sin(a)*hr*f); i?c.lineTo(px,py):c.moveTo(px,py); }); c.closePath();
        c.fillStyle=V.alpha(C.land,.8); c.fill(); c.strokeStyle=C.ink2; c.lineWidth=Math.max(.8,R(.22)); c.stroke();
        c.fillStyle=V.alpha(C.ghost,.55); c.beginPath(); c.arc(X(hc[0]-1.5),Y(hc[1]+1),R(4.2),0,6.2832); c.fill();
      }
      /* Glòbul vermell: disc translúcid groc càlid / vermell clar de la paleta */
      const rc=[5.2,1.5], rr=3.75;
      if(R(rr)>1){
        c.fillStyle=V.alpha(C.groc,.34); c.beginPath(); c.arc(X(rc[0]),Y(rc[1]),R(rr),0,6.2832); c.fill();
        c.strokeStyle=C.grocFosc; c.lineWidth=Math.max(.8,R(.16)); c.stroke();
        c.fillStyle=V.alpha(C.paper,.55); c.beginPath(); c.arc(X(rc[0]),Y(rc[1]),R(rr*.45),0,6.2832); c.fill();
      }
      const sNm=s/1000;
      /* Bacteri E. coli: 2 × 1 µm en blau translúcid */
      if(R(1)>.6){
        c.beginPath(); const r=.5, cx=0, cy=-.5;
        c.moveTo(X(cx-.5),Y(cy+r)); c.lineTo(X(cx+.5),Y(cy+r));
        c.arc(X(cx+.5),Y(cy),R(r),-Math.PI/2,Math.PI/2);
        c.lineTo(X(cx-.5),Y(cy-r));
        c.arc(X(cx-.5),Y(cy),R(r),Math.PI/2,Math.PI*1.5); c.closePath();
        c.fillStyle=V.alpha(C.blau,.12); c.fill();
        c.strokeStyle=sNm*30>4?C.blauClar:C.blau; c.lineWidth=Math.max(1,R(.03)); c.stroke();
      }
      /* Fag T4 aterrat sobre E. coli */
      if(sNm*245>2.5){ drawT4(c,X(.25),Y(0),sNm,{legs:1,k:0}); }
      else if(R(1)>.6){ c.fillStyle=C.vermell; c.fillRect(X(.25)-.8,Y(0)-Math.max(2,sNm*245),1.6,Math.max(2,sNm*245)); }

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
        else if(bot>H-24) sh=H-24-bot;
        lead(c,px,py,lx,ly+sh,C.ink,a);
        txt(c,lines,lx+(alg==="right"?-4:alg==="center"?0:4),ly+yOff+sh,alg,fs,a);
      };
      const vis=sz=>clamp((sz-18)/30,0,1)*clamp((W*1.6-sz)/(W*.6),0,1);
      let a=vis(R(120)); if(a>0){ const px=X(oc[0]+orr*.7), py=Y(oc[1]+orr*.7); lab(px,py,[["Òvul humà",true],["120 µm",false,C.ink2]],Math.min(W-10,px+30),Math.max(28,py-22),px+30>W-80?"right":"left",a); }
      a=vis(R(20)); if(a>0){ const px=X(hc[0]-hr*.7), py=Y(hc[1]+hr*.7); lab(px,py,[["Cèl·lula humana",true],["en cultiu (HeLa), ~20 µm",false,C.ink2]],Math.max(10,px-24),Math.max(28,py-20),"left",a); }
      a=vis(R(7.5)); if(a>0){ const px=X(rc[0]+rr*.7), py=Y(rc[1]+rr*.7); lab(px,py,[["Glòbul vermell",true],["7–8 µm",false,C.ink2]],Math.min(W-10,px+20),Math.max(28,py-20),px+20>W-120?"right":"left",a); }
      a=vis(R(2)); if(a>0){ const px=X(-.8), py=Y(-.85); lab(px,py,[["Bacteri E. coli",true,C.blau],["2 µm de llarg, 1 µm d'ample",false,C.ink2]],Math.max(10,px-10),Math.min(H-34,py+26),"left",a); }
      a=vis(sNm*245); if(a>0){ const px=X(.25)+sNm*45, py=Y(0)-sNm*190; lab(px,py,[["Fag T4",true,C.vermell],["uns 0,2 µm d'alt",false,C.ink2]],Math.min(W-10,px+36),Math.max(28,py-16),"left",a); }

      /* Barra d'escala fina */
      const bv=niceBar(k.W), bw=bv*s, bx=12, by=H-14;
      c.fillStyle=C.ink; c.fillRect(bx,by,bw,1.5); c.fillRect(bx,by-4,1,5.5); c.fillRect(bx+bw-1,by-4,1,5.5);
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
   2. IB-16 CICLE D'INFECCIÓ DEL FAG (SCROLLYTELLING ORGÀNIC)
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
      capsule(x0,y0,len,500,shrink);
      c.fillStyle=V.alpha(C.blau,.06); c.fill();
      c.strokeStyle=C.blau; c.lineWidth=Math.max(1.2,6.5*s); c.stroke();
      if(30*s>3&&!shrink){
        capsule(x0,y0,len-60,470); c.strokeStyle=V.alpha(C.blau,.48); c.lineWidth=Math.max(.9,5.5*s); c.stroke();
        c.setLineDash([Math.max(2,6*s),Math.max(2,5*s)]);
        capsule(x0,y0,len-32,484); c.strokeStyle=V.alpha(C.blau,.3); c.lineWidth=Math.max(.7,3.5*s); c.stroke();
        c.setLineDash([]);
      }
      c.restore();
    }
    function chromo(x0,y0,sc,col,alpha,frag,pro){
      c.save(); c.globalAlpha=alpha==null?1:alpha; c.strokeStyle=col||C.blau; c.lineWidth=Math.max(1.3,9*s); c.lineCap="round";
      const N=140, pt=i=>{ const a=i/N*6.2832, rx=560*sc, ry=230*sc, w=1+.08*Math.sin(5*a)+.05*Math.sin(9*a+1); return [x0+Math.cos(a)*rx*w,y0+Math.sin(a)*ry*w]; };
      if(frag){
        for(let i=0;i<N;i+=7){ if(((i*37)%11)/11<frag)continue; c.beginPath(); for(let j=0;j<=5;j++){ const p=pt(i+j); j?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1])); } c.stroke(); }
      } else {
        c.beginPath(); for(let i=0;i<=N;i++){ const p=pt(i); i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1])); } c.stroke();
      }
      if(pro){
        c.strokeStyle=C.vermell; c.lineWidth=Math.max(2,13*s); c.beginPath();
        const i0=Math.round(N*.18), i1=Math.round(N*.18+N*.06*pro);
        for(let i=i0;i<=i1;i++){ const p=pt(i); i===i0?c.moveTo(X(p[0]),Y(p[1])):c.lineTo(X(p[0]),Y(p[1])); } c.stroke();
      }
      c.restore(); return pt(Math.round(N*.21));
    }
    function coil(x0,y0,r,a,seed,alpha){
      c.save(); c.globalAlpha=alpha==null?1:alpha; c.strokeStyle=C.vermell; c.lineWidth=Math.max(1.2,7.5*s);
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
        if(burst<1)cell(0,-500,2000,0,1-burst);
        if(sc<=4){ const frag=sc===3?ease(p)*.85:sc===4?.9:0; chromo(0,-560,1,C.blau,sc>=3?1-.55*(sc===3?ease(p):1):1,frag); }
        const land=sc===0?0:sc===1?ease(clamp(t/1.6,0,1)):1;
        const legs=sc===0?0:sc===1?ease(clamp((t-.6)/1.4,0,1)):1;
        const k=sc<2?0:sc===2?ease(clamp(t/1.2,0,1)):1;
        const py=lerp(140,0,land), bob=sc===0&&!RM?Math.sin(now/1100)*3.5:0;
        const emptyHead=sc>=3||(sc===2&&t>2.6);
        drawT4(c,X(0),Y(py+bob),s,{k,legs,empty:emptyHead,a:sc===5?1-burst:1});

        if(sc===2){
          const q=clamp((t-1)/1.8,0,1);
          if(q>0){
            c.save(); c.strokeStyle=C.vermell; c.lineWidth=Math.max(1.6,3*s); c.beginPath();
            const L=q*360; c.moveTo(X(0),Y(-20));
            for(let d=0;d<=L;d+=6){ c.lineTo(X(Math.sin(d*.05)*(18+d*.12)),Y(-20-d*.55)); }
            c.stroke(); c.restore();
          }
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
            c.save(); c.strokeStyle=C.blau; c.lineWidth=Math.max(1.2,6.5*s); c.globalAlpha=1-burst*.78;
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
          if(burst<1)cell(-1150,-500,2000,0,1-burst);
          chromo(-1150,-560,1,C.blau,1-burst,0,1-ex);
          /* Raigs UV en groc de la paleta (mai text en groc!) */
          if(t<3){
            c.save(); c.strokeStyle=C.groc; c.lineWidth=2.6; c.globalAlpha=Math.sin(Math.min(1,uv)*Math.PI);
            for(let i=0;i<4;i++){
              const x0=-1700+i*300, y0=900; c.beginPath(); c.moveTo(X(x0),Y(y0));
              for(let j=1;j<=6;j++)c.lineTo(X(x0+j*45+(j%2?40:-40)),Y(y0-j*170)); c.stroke();
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
            c.save(); c.strokeStyle=C.blau; c.lineWidth=Math.max(1.2,6.5*s); c.globalAlpha=1-burst*.78;
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
      c.fillStyle=C.ink; c.fillRect(bx,by,bw,1.5); c.fillRect(bx,by-4,1,5.5); c.fillRect(bx+bw-1,by-4,1,5.5);
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
   3. IB-07 / IB-08 DISPERSIÓ LOGARÍTMICA DE 5.508 MOSTRES MARINES
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("sea-viz"); if(!vizEl||!window.VIB_DATA)return;
  const D=VIB_DATA.sea, ST=VIB_DATA.seaStudies, seg=document.getElementById("seaSeg"), nEl=document.getElementById("seaN"), lgEl=document.getElementById("sea-lg");
  /* Paleta estricta: superfície blau, mitjana blau clar, profund vermell */
  const BC=[C.blau,C.blauClar,C.vermell];
  const BLAB=["0–100 m","100–1.000 m","Més de 1.000 m"];
  if(lgEl)V.legendCat(lgEl,[
    {c:C.blau,t:"0–100 m",a:.75},
    {c:C.blauClar,t:"100–1.000 m",a:.85},
    {c:C.vermell,t:"Més de 1.000 m",a:.75},
    {c:C.ink,t:"Tendència global",kind:"line",w:1.5}
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
    const {ctx}=V.canvas(el,W,H,"Gràfic de dispersió logarítmic amb 5.508 mostres d'aigua de mar: bacteris per mil·lilitre a l'eix horitzontal i virus per mil·lilitre a l'eix vertical. Les mostres de més de 1.000 metres tenen menys bacteris però una mediana de 36 virus per bacteri.");
    const s=V.svg(el,W,H,""); s.attr("aria-hidden","true").attr("role",null).style("position","absolute").style("left",0).style("top",0);

    const X=d3.scaleLinear([3.6,7.4],[m.l,W-m.r]);
    const Y=d3.scaleLinear([5,8.9],[H-m.b,m.t]);
    const lab10=e=>mob?({4:"10 mil",5:"100 mil",6:"1 M",7:"10 M",8:"100 M"}[e]||""):({4:"10.000",5:"100.000",6:"1 milió",7:"10 milions",8:"100 milions"}[e]||"");

    /* Eixos recessius IBV */
    const gAx=s.append("g");
    V.gridY(gAx,Y,m.l,W-m.r,[5,6,7,8],lab10,{unit:" virus/ml"});
    V.axisX(gAx,X,H-m.b,[4,5,6,7],lab10,{grid:m.t});
    V.t(gAx,W-m.r,H-6,"Bacteris per mil·lilitre (escala logarítmica) →",{size:11.5,fill:C.ink2,anchor:"end"});

    /* Diagonals de proporció 1:1, 10:1, 100:1 */
    const cid="csea"+Math.random().toString(36).slice(2,7);
    s.append("defs").append("clipPath").attr("id",cid).append("rect").attr("x",m.l).attr("y",m.t).attr("width",W-m.l-m.r).attr("height",H-m.t-m.b);
    const gClip=s.append("g").attr("clip-path",`url(#${cid})`);
    const ang=Math.atan2(Y(1)-Y(0),X(1)-X(0))*180/Math.PI;
    [[0,"1 per bacteri"],[1,"10 per bacteri"],[2,"100 per bacteri"]].forEach(([r,lbl])=>{
      gClip.append("line").attr("x1",X(3.6)).attr("y1",Y(3.6+r)).attr("x2",X(7.4)).attr("y2",Y(7.4+r))
        .attr("stroke",C.muted).attr("stroke-width",.7).attr("stroke-dasharray","3 3");
      const xe=Math.min(7.32,8.84-r);
      gClip.append("g").attr("transform",`translate(${X(xe)},${Y(xe+r)-5}) rotate(${ang})`)
        .call(gg=>V.t(gg,0,0,lbl,{size:11,fill:C.muted,anchor:"end",halo:3}));
    });

    /* Tendència global (càlcul propi) */
    const trend=gClip.append("line").attr("x1",X(3.9)).attr("y1",Y(TR0+TR1*3.9)).attr("x2",X(7.2)).attr("y2",Y(TR0+TR1*7.2))
      .attr("stroke",C.ink).attr("stroke-width",1.5);

    /* Medianes (protagonistes IB-07) + anotacions IBV.note */
    const gMed=s.append("g"), gNote=s.append("g").style("pointer-events","none");
    function drawOverlays(){
      gMed.selectAll("*").remove(); gNote.selectAll("*").remove();
      med.forEach(md=>{
        const on=filt==="all"||+filt===md.k;
        const mg=gMed.append("g").style("opacity",on?1:.25);
        mg.append("circle").attr("cx",X(md.b)).attr("cy",Y(md.v)).attr("r",6.5).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.6);
        mg.append("circle").attr("cx",X(md.b)).attr("cy",Y(md.v)).attr("r",3.6).attr("fill",BC[md.k]);
      });
      if(filt==="all"||filt==="0"){
        const m0=med[0];
        V.note(gNote,{x:X(m0.b),y:Y(m0.v)-7,tx:X(m0.b)-(mob?16:48),ty:Y(m0.v)-(mob?44:56),kind:"curve",anchor:"end",
          lines:[["Mediana 0–100 m",true,C.blau],[mob?"6,8 M virus · 540 mil bact.":"6,8 M virus · 540.000 bacteris"]]});
      }
      if(filt==="all"||filt==="2"){
        const m2=med[2];
        V.note(gNote,{x:X(m2.b),y:Y(m2.v)+7,tx:X(m2.b)+(mob?18:42),ty:Y(m2.v)+(mob?44:48),kind:"curve",anchor:"start",
          lines:[["Mediana > 1.000 m",true,C.vermell],["36 virus per bacteri"]]});
      }
      if(!mob){
        const xe=6.55;
        V.note(gNote,{x:X(xe),y:Y(TR0+TR1*xe)+2,tx:X(xe)+18,ty:Y(TR0+TR1*xe)+36,kind:"straight",anchor:"start",
          lines:[["Tendència global",true],["pendent 0,70 (càlcul propi)"]]});
      }
    }

    /* Pintat dels 5.508 punts en Canvas (molts elements, petits i translúcids — P3) */
    let rev=1;
    function paintCanvas(){
      ctx.clearRect(0,0,W,H);
      ctx.save(); ctx.beginPath(); ctx.rect(m.l,m.t,W-m.l-m.r,H-m.t-m.b); ctx.clip();
      ctx.globalCompositeOperation="multiply";
      const n=Math.floor(P.length*rev), rad=mob?1.45:1.85;
      for(let j=0;j<n;j++){
        const p=P[order[j]], on=filt==="all"||+filt===p.k;
        ctx.globalAlpha=on?.36:.05;
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
      if(!cand||Math.hypot(X(cand.b)-px,Y(cand.v)-py)>18){ if(curIdx>=0)clearHv(); return; }
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

    redrawSea=function(){ rebuildDel(); clearHv(); paintCanvas(); drawOverlays(); };

    V.onView(el,inst=>{
      if(inst){ rev=1; paintCanvas(); drawOverlays(); return; }
      trend.style("opacity",0); gMed.style("opacity",0); gNote.style("opacity",0);
      d3.transition().duration(1100).ease(d3.easeCubicOut).tween("sea",()=>t=>{ rev=t; paintCanvas(); })
        .on("end",()=>{
          drawOverlays();
          trend.transition().duration(400).style("opacity",1);
          gMed.transition().duration(400).style("opacity",1);
          gNote.transition().delay(180).duration(400).style("opacity",1);
        });
    });
    if(el.__seen){ rev=1; paintCanvas(); drawOverlays(); }
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
   4. IB-40 CURTCIRCUIT VIRAL — FLUX AMB FILS DE PARTÍCULES LENTES
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
    fito:{id:"fito",n:["Algues","microscòpiques"],d:[130,108],m:[84,74],c:C.groc,sc:C.grocFosc,tip:"<b>Algues microscòpiques (fitoplàncton)</b> · Fixen carboni amb la llum solar; amb virus produeixen més gràcies als nutrients reciclats"},
    zoo: {id:"zoo", n:["Zooplàncton","i protists"],d:[495,108],m:[316,74],c:C.ink2,sc:C.ink2,tip:"<b>Zooplàncton i protists</b> · Es mengen algues i bacteris i transfereixen carboni cap als peixos"},
    peix:{id:"peix",n:["Peixos"],d:[865,108],m:[316,250],c:C.ink2,sc:C.ink2,tip:"<b>Peixos</b> · Amb virus hi arriba menys carboni perquè una part queda retinguda en el bucle microbià"},
    dom: {id:"dom", n:["Matèria orgànica","dissolta"],d:[305,305],m:[84,424],c:C.groc,sc:C.grocFosc,tip:"<b>Matèria orgànica dissolta</b> · Carboni, nitrogen i fòsfor alliberats a l'aigua; els virus multipliquen aquest dipòsit"},
    bac: {id:"bac", n:["Bacteris"],d:[690,305],m:[316,424],c:C.blau,sc:C.blau,tip:"<b>Bacteris</b> · Consumeixen la matèria dissolta i es converteixen en la diana principal dels fags"}
  };
  const ED=[
    {id:"f-z",a:"fito",b:"zoo", f:[58,44],bend:-28,c:C.ink2,  sc:C.ink2,    tip:"<b>Algues → Zooplàncton</b> · Baixa lleugerament quan els virus destrueixen part del fitoplàncton"},
    {id:"z-p",a:"zoo", b:"peix",f:[26,17],bend:-28,c:C.ink2,  sc:C.ink2,    tip:"<b>Zooplàncton → Peixos</b> · Menys carboni puja cap als nivells superiors de la cadena"},
    {id:"f-d",a:"fito",b:"dom", f:[28,28],bend:20, c:C.groc,  sc:C.grocFosc,tip:"<b>Algues → Matèria dissolta</b> · Exsudació natural de carboni dissolt"},
    {id:"d-b",a:"dom", b:"bac", f:[30,68],bend:32, c:C.blau,  sc:C.blau,    tip:"<b>Matèria dissolta → Bacteris</b> · El reciclatge microbià es dispara quan hi ha virus"},
    {id:"b-z",a:"bac", b:"zoo", f:[22,14],bend:22, c:C.blau,  sc:C.blau,    tip:"<b>Bacteris → Zooplàncton</b> · Menys bacteris passen als protists perquè molts moren per lisi"},
    {id:"fv", a:"fito",b:"dom", f:[0,24], bend:-62,c:C.vermell,sc:C.vermell,v:1,tip:"<b>Lisi viral d'algues → Matèria dissolta</b> · Els virus fan esclatar algues i retornen carboni a l'aigua"},
    {id:"bv", a:"bac", b:"dom", f:[0,26], bend:76, c:C.vermell,sc:C.vermell,v:1,tip:"<b>Curtcircuit viral (lisi de bacteris)</b> · El contingut dels bacteris esclatats alimenta altres bacteris"}
  ];

  let vir=1, runP=true, updateMode=null, clearShuntHv=null;
  document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!vizEl.contains(ev.target)&&clearShuntHv)clearShuntHv(); });

  V.mount(vizEl,(el,W)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=W<640;
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
    const nr=Math.round(32*Math.min(1.12,Math.max(.82,S*1.05)));

    const defs=s.append("defs");
    const gEdges=s.append("g"), gNodes=s.append("g"), gNotes=s.append("g").style("pointer-events","none");

    /* Bandes translúcides d'aquarel·la sense contorns durs (IB-40) */
    const edgeSel=gEdges.selectAll("g.ed").data(ED).join("g").attr("class","ed").style("cursor","pointer");
    edgeSel.each(function(e){
      const q=curve(e), g=d3.select(this);
      const pathD=`M${q[0][0]},${q[0][1]} Q${q[1][0]},${q[1][1]} ${q[2][0]},${q[2][1]}`;
      g.append("path").attr("class","band").attr("d",pathD).attr("fill","none")
        .attr("stroke",e.c).attr("stroke-linecap","round").style("mix-blend-mode","multiply");
      g.append("path").attr("class","hit").attr("d",pathD).attr("fill","none").attr("stroke","transparent").attr("stroke-width",22);
      const pt=qp(q,.56), pn=qp(q,.60), ang=Math.atan2(pn[1]-pt[1],pn[0]-pt[0])*180/Math.PI;
      g.append("path").attr("class","arr").attr("d","M5,0 L-3,-3.5 L-3,3.5 Z").attr("fill",e.sc)
        .attr("transform",`translate(${pt[0]},${pt[1]}) rotate(${ang})`);
    });

    /* Nodes orgànics translúcids (cercles d'aquarel·la sense vora dura) + icones de gravat */
    const nodeList=Object.values(ND);
    const nodeSel=gNodes.selectAll("g.nd").data(nodeList).join("g").attr("class","nd").style("cursor","pointer");
    nodeSel.each(function(nd){
      const [x,y]=pos(nd.id), g=d3.select(this);
      const gid="shg-"+nd.id+"-"+Math.random().toString(36).slice(2,6);
      const rg=defs.append("radialGradient").attr("id",gid);
      rg.append("stop").attr("offset","0%").attr("stop-color",nd.c).attr("stop-opacity",nd.c===C.groc?.32:.18);
      rg.append("stop").attr("offset","100%").attr("stop-color",nd.c).attr("stop-opacity",nd.c===C.groc?.08:.04);
      g.append("circle").attr("class","aura").attr("cx",x).attr("cy",y).attr("r",nr)
        .attr("fill",`url(#${gid})`).style("mix-blend-mode","multiply");
      g.append("circle").attr("class","rim").attr("cx",x).attr("cy",y).attr("r",nr)
        .attr("fill","none").attr("stroke",nd.sc).attr("stroke-opacity",.35).attr("stroke-width",.8);
      /* Icones científiques fines en SVG */
      const ic=g.append("g").attr("transform",`translate(${x},${y})`).attr("fill","none").attr("stroke",nd.sc).attr("stroke-width",1.2).attr("stroke-linecap","round");
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

    /* Micro-traços lents i contemplatius (IB-40: recorregut ~24–30 s!) */
    const rnd=V.rng(40), streaks=[];
    ED.forEach((e,ei)=>{
      const q=curve(e), nP=e.v?18:22;
      for(let i=0;i<nP;i++){
        streaks.push({
          ei, q, t:rnd(), off:(rnd()-.5)*.65,
          sp:(.000032+rnd()*.000018), /* ~24–32 segons per travessar */
          len:.05+rnd()*.045, pw:.9+rnd()*.55
        });
      }
    });

    let virA=vir, foc=null;
    function applyStyle(instant){
      const dur=instant||RM?0:420;
      edgeSel.each(function(e){
        const wVal=e.f[vir], g=d3.select(this);
        const sw=wVal<=.3?0:Math.max(2.5,wVal*.38*ws);
        g.select(".band").transition().duration(dur).attr("stroke-width",sw).attr("stroke-opacity",wVal<=.3?0:(e.c===C.groc?.26:.18));
        g.select(".arr").transition().duration(dur).style("opacity",wVal<=.3?0:.85);
      });
      drawNotes(vir===1);
    }

    function drawParticles(){
      ctx.clearRect(0,0,W,H);
      ctx.lineCap="round"; ctx.lineJoin="round";
      for(const p of streaks){
        const e=ED[p.ei], wVal=lerp(e.f[0],e.f[1],virA);
        if(wVal<=.5)continue;
        const bw=Math.max(2.5,wVal*.38*ws), offPx=p.off*bw*.62;
        const t1=p.t, t0=Math.max(0,t1-p.len);
        const fade=sm(clamp(t1/.12,0,1))*sm(clamp((1-t1)/.12,0,1));
        const dimF=foc?(foc.has(e.id)?1:.28):1;
        const a=.72*fade*dimF*Math.min(1,wVal/16);
        if(a<.03)continue;
        const ptAt=tt=>{
          const pt=qp(p.q,tt), pn=qp(p.q,Math.min(1,tt+.02));
          const dx=pn[0]-pt[0], dy=pn[1]-pt[1], L=Math.hypot(dx,dy)||1;
          return [pt[0]-dy/L*offPx, pt[1]+dx/L*offPx];
        };
        const p0=ptAt(t0), p1=ptAt(t0+(t1-t0)*.4), p2=ptAt(t0+(t1-t0)*.75), pH=ptAt(t1);
        ctx.strokeStyle=e.sc; ctx.fillStyle=e.sc;
        ctx.globalAlpha=a*.65; ctx.lineWidth=p.pw;
        ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.lineTo(pH[0],pH[1]); ctx.stroke();
        ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(pH[0],pH[1],p.pw*.85,0,6.2832); ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    /* Hover suau (IBV.focus + IBV.tip dock) */
    const tp=V.tip(el);
    function clearHv(){
      foc=null; tp.hide();
      V.focus(edgeSel,null); V.focus(nodeSel,null);
      nodeSel.select(".rim").attr("stroke-width",.8).attr("stroke-opacity",.35);
      if(RM||!runP)drawParticles();
    }
    edgeSel.on("pointerenter",(ev,e)=>{
      if(e.f[vir]<=.3)return;
      foc=new Set([e.id]);
      V.focus(edgeSel,d=>d.id===e.id,{dim:.48});
      V.focus(nodeSel,d=>d.id===e.a||d.id===e.b,{dim:.48});
      tp.show(e.tip);
      if(RM||!runP)drawParticles();
    }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")clearHv(); });
    nodeSel.on("pointerenter",(ev,nd)=>{
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
        for(const p of streaks){ p.t+=dt*p.sp; if(p.t>1)p.t-=1; }
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
