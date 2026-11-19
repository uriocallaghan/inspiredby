/* Sistema infogràfic d'Inspired by Magazine · Formes inesperades, primera tanda (IB-35 a IB-44).
   Fa servir assets/ib-viz.js (IBV), les dades reals de dades.js (ONI i CO₂) i dades-creatives-a.js
   (IHME GBD 2023, Global Carbon Budget 2026, pols del Sàhara de Yu et al. 2015). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.IBDATA||{oni:{}}, DA=window.IBDATA_CREATIVES_A||{};
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f"), f2=V.fmt(",.2f");
const sgn=(v,d)=>Math.abs(v)<1e-9?"0":V.signed(v,d==null?1:d);
const EIO=d3.easeCubicInOut;
const cl01=v=>v<0?0:v>1?1:v;
const smooth=(v,a,b)=>{ const u=cl01((v-a)/(b-a)); return u*u*(3-2*u); };
// Mesura: temps de cada fotograma de les animacions contínues (el.__f = [ms acumulats, fotogrames])
function tm(el,fn){ return function(){ const a=performance.now(), r=fn.apply(this,arguments); if(el.__f){ el.__f[0]+=performance.now()-a; el.__f[1]++; } return r; }; }
function legend(n,fn){ const el=$(`[data-lg="${n}"]`); if(el&&!el.childElementCount)fn(el); }
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,(e,w)=>{ const t=e.querySelector(":scope>.tip"); if(t)t.style.opacity=0; const t0=performance.now(); draw(e,w); e.__ms=performance.now()-t0; }):{redraw(){}}; }
function layer(el,w,h,label){ // canvas a sota (molts punts) + svg a sobre (eixos, text)
  d3.select(el).selectAll("canvas.ibv,svg.ibv").remove(); el.style.height=h+"px";
  const {ctx}=V.canvas(el,w,h,label);
  const s=V.svg(el,w,h,""); s.attr("aria-hidden","true").attr("role",null).style("position","absolute").style("left",0).style("top",0);
  return {ctx,s};
}
// Entrada animada: hide() posa l'estat inicial, show(instant) el final. Només la primera vegada que es veu.
function intro(el,hide,show){
  if(el.__seen){ show(true); return; }
  hide(); el.__show=show;
  if(!el.__ov){ el.__ov=true; V.onView(el,inst=>{ if(el.__show)el.__show(inst); }); }
}
// Botons de segment: data-seg="NN"
function segs(n,cb){
  const bs=document.querySelectorAll(`[data-seg="${n}"] button`);
  bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(o=>o.setAttribute("aria-pressed",o===b)); cb(b.dataset.k,b); }));
}
// Separa etiquetes verticalment (ordre conservat): items amb .y desitjada → .ly
function separate(items,gap,lo,hi){
  const a=items.slice().sort((p,q)=>p.y-q.y);
  let G=a.map(d=>({it:[d],c:d.y}));
  const top=g=>g.c-(g.it.length-1)*gap/2;
  let again=true, guard=0;
  while(again&&guard++<200){ again=false;
    for(let i=1;i<G.length;i++){ const A=G[i-1], B=G[i];
      if(top(B)<top(A)+A.it.length*gap-.01){ const it=A.it.concat(B.it); G.splice(i-1,2,{it,c:d3.mean(it,d=>d.y)}); again=true; break; } }
    G.forEach(g=>{ const t=top(g), b=t+(g.it.length-1)*gap; if(t<lo)g.c+=lo-t; else if(b>hi)g.c-=b-hi; });
  }
  G.forEach(g=>g.it.forEach((d,i)=>d.ly=top(g)+i*gap));
  return items;
}
function legendSteps(el,o){
  const d=d3.select(el).append("div").attr("class","ibv-lg");
  if(o.title)d.append("div").attr("class","ibv-lg-t").text(o.title);
  const n=o.colors.length, cw=o.cw||24, s=d.append("svg").attr("width",cw*n).attr("height",26).style("overflow","visible");
  o.colors.forEach((c,i)=>s.append("rect").attr("x",i*cw).attr("width",cw-1).attr("height",8).attr("fill",c));
  o.thresholds.forEach((v,i)=>{ s.append("text").attr("x",i*cw-.5).attr("y",21).attr("text-anchor","middle").attr("font-size",V.FS.min).attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(o.f?o.f(v):v); });
}
// Text d'una línia amb halo (per a etiquetes que es mouen)
function lab(g,x,y,str,o){ return V.t(g,x,y,str,Object.assign({halo:true},o||{})); }
/* Hover estàndard (sistema §«Moviment i hover»): capa per sobre de tot, sense esdeveniments,
   etiqueta en negreta sobre l'eix i transicions curtes. */
const HT=150;
function hvLayer(s){ return s.append("g").attr("class","ibx-hv").style("pointer-events","none"); }
function axTag(g,x,y,str,o){ return V.t(g,x,y,str,Object.assign({size:12,weight:700,anchor:"middle",halo:4},o||{})); }
function fo(sel,isOn,dim){ sel.interrupt("hv").transition("hv").duration(HT).style("opacity",d=>isOn==null||isOn(d)?1:Math.max(.46,dim==null?.5:dim)); }
function dimTo(sel,a){ sel.interrupt("hv").transition("hv").duration(HT).style("opacity",a<1?Math.max(.48,a):1); }

/* ---------- dades derivades de dades.js (ONI, reals) ---------- */
const ONI_YEARS=Object.keys(D.oni).map(Number).sort((a,b)=>a-b);
const ONI_PTS=[]; ONI_YEARS.forEach(y=>D.oni[y].forEach((v,k)=>{ if(v!=null)ONI_PTS.push({y,k,v,t:y+k/12+1/24}); }));
const SEASON=["des–feb","gen–març","feb–abr","març–maig","abr–juny","maig–jul","juny–ag","jul–set","ag–oct","set–nov","oct–des","nov–gen"];
const DIV25=V.div(2.5);
const DECS=d3.range(1950,2030,10);
const decLab=(d,mob)=>{ const last=Math.min(d+9,ONI_YEARS[ONI_YEARS.length-1]); return mob?`${d}–${String(last).slice(2)}`:`${d}–${last}`; };

/* =====================================================================
   IB-35 · ESCALA COMPARATIVA D'ORDRES DE MAGNITUD  (dades reals: SI, IAU, NASA, FIFA)
   Tots els ordres de magnitud visibles alhora (de 10⁻⁹ m a 10⁹ m) amb referències
   concretes en cercles translúcids i arcs interactius per comparar qualssevol dues mides.
   ===================================================================== */
const SUPD={"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻"};
const p10=k=>"10"+String(k).split("").map(c=>SUPD[c]).join("");
const ord=n=>n===1?"1r":n===2?"2n":n===3?"3r":n===4?"4t":n+"è";
const ITEMS35=[
  {id:"adn",    v:2e-9,       t:"Hèlix d'ADN",      m:"2 nm",            d:"micro", mob:true},
  {id:"virus",  v:1e-7,       t:"Virus",            m:"100 nm",          d:"micro", mob:false},
  {id:"globul", v:7e-6,       t:"Glòbul vermell",   m:"7 µm",            d:"micro", mob:false},
  {id:"cabell", v:7e-5,       t:"Cabell humà",      m:"70 µm",           d:"micro", mob:true},
  {id:"polz",   v:.0254,      t:"Polzada",          m:"25,4 mm",         d:"huma",  mob:false},
  {id:"metre",  v:1,          t:"1 metre",          m:"1 m exacte",      d:"huma",  mob:true},
  {id:"camp",   v:105,        t:"Camp de futbol",   m:"105 m",           d:"huma",  mob:false},
  {id:"milla",  v:1852,       t:"Milla nàutica",    m:"1.852 m",         d:"cosmo", mob:false},
  {id:"everest",v:8849,       t:"Everest",          m:"8,85 km",         d:"cosmo", mob:true},
  {id:"marato", v:42195,      t:"Marató",           m:"42,2 km",         d:"cosmo", mob:false},
  {id:"lluna",  v:3.474e6,    t:"Lluna",            m:"3.474 km",        d:"cosmo", mob:false},
  {id:"terra",  v:1.2742e7,   t:"Terra",            m:"12.742 km",       d:"cosmo", mob:false},
  {id:"llum",   v:2.99792458e8,t:"Segon-llum",      m:"299.792 km",      d:"cosmo", mob:false},
  {id:"sol",    v:1.3927e9,   t:"Sol",              m:"1,39 M km",       d:"cosmo", mob:true}
].map((d,i)=>Object.assign(d,{i,k:Math.log10(d.v)}));
const DOM35={
  micro:{c:C.blau,  t:"Món microscòpic (< 1 mm)"},
  huma: {c:C.ink2,  t:"Escala humana (1 mm – 1 km)"},
  cosmo:{c:C.vermell,t:"Planetari i còsmic (> 1 km)"}
};
function fmtRatio35(a,b){
  const r=b.v/a.v;
  if(Math.abs(r-1)<1e-6)return "Mateixa mida";
  const big=r>1, f=big?r:1/r;
  let num;
  if(f<10)num=f1(f);
  else if(f<1e4)num=f0(f);
  else if(f<1e6)num=f0(Math.round(f/100)*100);
  else if(f<1e9)num=f1(f/1e6)+" milions";
  else if(f<1e12)num=f1(f/1e9)+" mil milions";
  else num=p10(Math.round(Math.log10(f)));
  return big?`×${num} més gran`:`÷${num} més petit`;
}
let anchor35="metre", focus35="terra";
legend(35,el=>V.legendCat(el,[
  {c:C.blau,t:"Món microscòpic"},
  {c:C.ink2,t:"Escala humana"},
  {c:C.vermell,t:"Planetari i còsmic"}
]));
const M35=piece(35,(el,w)=>{
  const mob=w<640, h=mob?290:360;
  const ml=mob?18:42, mr=mob?18:42, axisY=mob?154:162;
  el.style.height="";
  const s=V.svg(el,w,h,"Escala logarítmica comparativa d'un nanòmetre fins al diàmetre del Sol (18 ordres de magnitud). Totes les mides són visibles alhora com a cercles translúcids; clicant qualsevol punt es fixa com a referència i un arc mostra quantes vegades és més gran o més petit qualsevol altre objecte.");
  const g=s.append("g");
  const X=d3.scaleLinear([-9.4,9.6],[ml,w-mr]);
  const rDom=d=>mob?8+(d.k+9)*.52:10+(d.k+9)*.68;

  // 1. Franges subtils de domini sobre la línia base
  const bands=[
    {a:-9.4,b:-3,c:C.blau,t:"Món microscòpic"},
    {a:-3,b:3,c:C.groc,t:"Escala humana"},
    {a:3,b:9.6,c:C.vermell,t:"Planetari i còsmic"}
  ];
  bands.forEach(b=>{
    g.append("rect").attr("x",X(b.a)).attr("y",axisY-3).attr("width",X(b.b)-X(b.a)).attr("height",6)
      .attr("rx",3).attr("fill",b.c).attr("fill-opacity",b.c===C.groc?.22:.12);
    V.t(g,(X(b.a)+X(b.b))/2,h-10,b.t,{size:11,fill:C.muted,anchor:"middle"});
  });

  // 2. Marques cada potència de 10 (etiquetades cada 3 ordres de magnitud, just sota l'eix)
  const ticks=d3.range(-9,10,1);
  ticks.forEach(k=>{
    const x=X(k), major=k%3===0;
    g.append("line").attr("x1",x).attr("x2",x).attr("y1",axisY-(major?9:4)).attr("y2",axisY+(major?9:4))
      .attr("stroke",k===0?C.ink:major?C.hair:C.grid).attr("stroke-width",k===0?1.3:.8);
    if(major&&(!mob||k%6===0||k===0)){
      const txt=k===-9?"1 nm":k===-6?"1 µm":k===-3?"1 mm":k===0?"1 m":k===3?"1 km":k===6?"1.000 km":"1 M km";
      V.t(g,x,axisY+24,txt,{size:11,fill:k===0?C.ink:C.muted,weight:k===0?700:400,anchor:"middle"});
    }
  });

  // 3. Zona superior lliure reservada exclusivament per a l'arc comparatiu (zero col·lisions!)
  const gArc=g.append("g").style("pointer-events","none");

  // 4. Cercles translúcids sobre l'eix i etiquetes escalonades a sota (sense solapaments)
  const gPts=g.append("g");
  const pts=gPts.selectAll("g.pt").data(ITEMS35).join("g").attr("class","pt").style("cursor","pointer");
  pts.each(function(d,idx){
    const q=d3.select(this), x=X(d.k), col=DOM35[d.d].c, rad=rDom(d);
    const showLab=!mob||d.mob;
    q.append("circle").attr("class","halo").attr("cx",x).attr("cy",axisY).attr("r",rad)
      .attr("fill",col).attr("fill-opacity",.22).style("mix-blend-mode","multiply");
    q.append("circle").attr("class","core").attr("cx",x).attr("cy",axisY).attr("r",3.2)
      .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.2);
    if(showLab){
      // 3 files escalonades a escriptori, 2 a mòbil — totes sota la línia d'escala
      const row=mob?(idx%2):(idx%3);
      const yLab=axisY+(mob?52+row*32:54+row*42);
      q.append("line").attr("class","stem").attr("x1",x).attr("x2",x)
        .attr("y1",axisY+rad+2).attr("y2",yLab-12)
        .attr("stroke",C.hair).attr("stroke-width",.7);
      const anc=x<ml+52?"start":x>w-mr-52?"end":"middle";
      V.t(q,x,yLab,d.t,{size:11.5,weight:600,fill:C.ink,anchor:anc,halo:3}).attr("class","lbl-t");
      V.t(q,x,yLab+13,d.m,{size:11,fill:C.muted,anchor:anc,halo:3}).attr("class","lbl-m");
    }
    q.append("circle").attr("cx",x).attr("cy",axisY).attr("r",Math.max(16,rad+4)).attr("fill","transparent");
  });

  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);

  function renderCompare(hvItem){
    const anc=ITEMS35.find(d=>d.id===anchor35)||ITEMS35[5];
    const tgt=hvItem||ITEMS35.find(d=>d.id===focus35)||ITEMS35[11];
    gArc.selectAll("*").remove();

    pts.each(function(d){
      const q=d3.select(this), isA=d.id===anc.id, isT=tgt&&d.id===tgt.id;
      const active=isA||isT;
      q.style("opacity",active?1:.52);
      q.select(".core").attr("r",isA?4.8:isT?4.2:3.2).attr("stroke",isA?C.ink:"#fff").attr("stroke-width",isA?1.8:1.2);
      q.select(".halo").attr("fill-opacity",active?.36:.18);
    });

    if(!tgt||tgt.id===anc.id){
      tp.show(`<b>${anc.t}</b> (${anc.m}) · Referència activa — passa per qualsevol altre punt per comparar-lo`,X(anc.k),axisY);
      return;
    }
    const x1=X(anc.k), x2=X(tgt.k), mx=(x1+x2)/2, span=Math.abs(x2-x1);
    const arcH=Math.min(axisY-64,Math.max(46,span*.24));
    const col=tgt.k>=anc.k?C.vermell:C.blau;
    const dPath=`M${x1},${axisY-10} Q${mx},${axisY-10-arcH*1.5} ${x2},${axisY-10}`;
    gArc.append("path").attr("d",dPath).attr("fill","none").attr("stroke",col).attr("stroke-width",1.9).attr("stroke-opacity",.92);
    // Titular de la comparació centrat amb seguretat a la zona superior neta
    const apexY=axisY-10-arcH*.75;
    const topY=Math.max(24,apexY-24);
    const ratioStr=fmtRatio35(anc,tgt);
    const ordDiff=tgt.k-anc.k;
    const lx=Math.max(mob?140:180,Math.min(w-(mob?140:180),mx));
    V.t(gArc,lx,topY,`${anc.t} → ${tgt.t}: ${ratioStr}`,{size:mob?12:13.5,weight:700,fill:col,anchor:"middle",halo:4});
    V.t(gArc,lx,topY+16,`${sgn(ordDiff,1)} ordres de magnitud`,{size:11.5,fill:C.ink2,anchor:"middle",halo:3.5});
    tp.show(`<b>${anc.t}</b> (${anc.m}) → <b>${tgt.t}</b> (${tgt.m}): <b>${ratioStr}</b> · Clica qualsevol punt per canviar la referència`,mx,topY);
  }

  // Interacció: hover compara contra l'àncora; clic fixa una nova àncora
  pts.on("mouseenter",(ev,d)=>{ focus35=d.id; renderCompare(d); })
     .on("click",(ev,d)=>{ anchor35=d.id; if(focus35===d.id)focus35=d.id==="metre"?"terra":"metre"; renderCompare(ITEMS35.find(x=>x.id===focus35)); });
  s.on("mouseleave",()=>{ renderCompare(ITEMS35.find(x=>x.id===focus35)); });

  el._setPair=(a,b)=>{ anchor35=a; focus35=b; renderCompare(ITEMS35.find(x=>x.id===b)); };
  renderCompare(ITEMS35.find(x=>x.id===focus35));

  intro(el,
    ()=>{ gPts.style("opacity",0); gArc.style("opacity",0); },
    inst=>{
      if(inst){ gPts.style("opacity",1); gArc.style("opacity",1); return; }
      gPts.transition().duration(550).ease(EIO).style("opacity",1);
      gArc.transition().delay(320).duration(500).ease(EIO).style("opacity",1);
    }
  );
});
segs(35,k=>{
  const pairs={metre:["metre","terra"],micro:["virus","globul"],huma:["everest","marato"],cosmo:["terra","sol"]};
  const p=pairs[k]||pairs.metre, el=$('[data-p="35"]');
  if(el&&el._setPair)el._setPair(p[0],p[1]);
});
void M35;

/* =====================================================================
   IB-36 · MÀQUINA DE GALTON  (simulació)
   ===================================================================== */
const G36={hov:null,p:.5,n:12,N:1000,counts:null,moving:[],spawned:0,acc:0,on:false,rnd:V.rng(36)};
function reset36(){ G36.counts=new Array(G36.n+1).fill(0); G36.moving=[]; G36.spawned=0; G36.acc=0; G36.rnd=V.rng(36+Math.round(G36.p*100)); }
reset36();
function binom(n,k,p){ let c=1; for(let i=0;i<k;i++)c=c*(n-i)/(i+1); return c*Math.pow(p,k)*Math.pow(1-p,n-k); }
function choose(n,k){ let c=1; for(let i=0;i<k;i++)c=c*(n-i)/(i+1); return Math.round(c); }
function fill36(){ reset36(); for(let i=0;i<G36.N;i++){ let j=0; for(let r=0;r<G36.n;r++)if(G36.rnd()<G36.p)j++; G36.counts[j]++; } G36.spawned=G36.N; }
legend(36,el=>V.legendCat(el,[{c:C.blau,t:"Cada bola que ha caigut"},{c:C.vermell,t:"Bola que cau"},{c:C.ink,t:"El que diu la teoria (binomial)",kind:"line",w:1.4}]));
const M36=piece(36,(el,w)=>{
  if(el.__loop){ el.__loop.stop(); el.__loop=null; }
  const mob=w<640, h=mob?470:540, n=G36.n, N=G36.N;
  const {ctx,s}=layer(el,w,h,"Màquina de Galton: mil boles cauen per dotze fileres de claus i, a cada clau, reboten a la dreta amb una probabilitat que es pot canviar. S'apilen en tretze calaixos i dibuixen una campana, la distribució binomial. Simulació.");
  const g=s.append("g");
  const dx=Math.min(mob?(w-12)/(n+1):46,(w-12)/(n+1)), cx=w/2, top=mob?60:58, dy=mob?Math.min(22,dx*.95):24;
  const pegB=top+(n-1)*dy, binT=pegB+dy*1.15, binB=h-30, binH=binB-binT;
  const rb=Math.max(1.6,Math.min(3.4,dx*.075));
  const xAt=(row,j)=>cx+(j-row/2)*dx;
  const binX=j=>cx+(j-n/2)*dx;
  // mida dels punts apilats: que hi càpiga el calaix més ple esperat
  let dd, per;
  function sizes(){ const pm=d3.max(d3.range(n+1),k=>binom(n,k,G36.p))*1.18;
    dd=Math.sqrt(binH*(dx-4)/(N*pm)); per=Math.max(1,Math.floor((dx-4)/dd)); dd=Math.min(dd,(dx-4)/per); }
  sizes();
  // estàtic: separadors dels calaixos i base
  const st=g.append("g");
  d3.range(n+2).forEach(j=>st.append("line").attr("x1",binX(j)-dx/2).attr("x2",binX(j)-dx/2).attr("y1",binT+6).attr("y2",binB).attr("stroke",C.hair).attr("stroke-width",.8));
  st.append("line").attr("x1",binX(0)-dx/2).attr("x2",binX(n)+dx/2).attr("y1",binB+.5).attr("y2",binB+.5).attr("stroke",C.ink);
  d3.range(n+1).forEach(j=>{ if(mob&&j%2)return; V.t(st,binX(j),binB+16,j,{size:11.5,fill:C.muted,anchor:"middle"}); });
  V.t(st,binX(n)+dx/2,binB+16,mob?"":"rebots a la dreta",{size:11.5,fill:C.muted,anchor:"start"}).attr("dx",6);
  if(mob)V.t(st,binX(0)-dx/2,h-1,"Nombre de rebots a la dreta, de 0 a 12",{size:11.5,fill:C.muted});
  // corba teòrica
  const cur=g.append("path").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
  const curD=()=>d3.line().curve(d3.curveMonotoneX)(d3.range(n+1).map(k=>[binX(k),binB-N*binom(n,k,G36.p)/per*dd]));
  const meanG=g.append("g");
  function meanAnn(anim){
    meanG.selectAll("*").remove();
    const k=n*G36.p, X=cx+(k-n/2)*dx, pk=d3.max(d3.range(n+1),j=>N*binom(n,j,G36.p)/per*dd);
    meanG.append("line").attr("x1",X).attr("x2",X).attr("y1",binB-pk-14).attr("y2",binB).attr("stroke",C.ink2).attr("stroke-width",1.2).attr("stroke-dasharray","1.5 3.5").attr("stroke-linecap","round");
    const right=G36.p<=.5;
    V.note(meanG,{x:X,y:binB-pk-14,tx:X+(right?1:-1)*(mob?16:28),ty:binB-pk-34,kind:"elbow",anchor:right?"start":"end",
      lines:[["Mitjana teòrica",true],[`${n} × ${f2(G36.p).replace(/0$/,"")} = ${f1(k)} rebots`]]});
    if(anim&&!V.reduced)meanG.style("opacity",0).transition().duration(700).style("opacity",1);
  }
  cur.attr("d",curD()); meanAnn(false);
  // comptador
  const cnt=lab(g,0,18,"",{size:12.5,weight:700}), cnt2=lab(g,0,34,"",{size:12.5,fill:C.ink2});
  const hb=g.append("rect").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-dasharray","3 2").style("display","none");
  el._p=anim=>{ sizes(); stale=true; lastCnt=-1; (anim&&!V.reduced?cur.transition().duration(800).ease(EIO):cur).attr("d",curD()); meanAnn(anim); };
  let dirty=true;
  // el que és fix (claus) i el que només creix (pila de boles) es pinten en canvas fora de pantalla;
  // cada fotograma només copia les dues capes i dibuixa les boles que cauen
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const off=()=>{ const c=document.createElement("canvas"); c.width=Math.round(w*dpr); c.height=Math.round(h*dpr); const x=c.getContext("2d"); x.scale(dpr,dpr); return x; };
  const pegX=off(); pegX.fillStyle=C.ghost; pegX.beginPath();
  for(let r=0;r<n;r++)for(let j=0;j<=r;j++){ const px=xAt(r,j), py=top+r*dy, pr=mob?1.7:2; pegX.moveTo(px+pr,py); pegX.arc(px,py,pr,0,6.2832); }
  pegX.fill();
  const stX=off(), drawn=new Array(n+1).fill(0); let lastArr=null, stale=true, lastCnt=-1;
  function syncStack(){
    if(stale||G36.counts!==lastArr){ stX.clearRect(0,0,w,h); drawn.fill(0); stale=false; lastArr=G36.counts; }
    const pr=dd*.42; stX.fillStyle=V.alpha(C.blau,.82);
    G36.counts.forEach((c,j)=>{ if(c===drawn[j])return; const x0=binX(j)-(per*dd)/2+dd/2; stX.beginPath();
      for(let i=drawn[j];i<c;i++){ const x=x0+(i%per)*dd, y=binB-dd/2-Math.floor(i/per)*dd; stX.moveTo(x+pr,y); stX.arc(x,y,pr,0,6.2832); }
      stX.fill(); drawn[j]=c; });
  }
  function draw(){
    syncStack();
    ctx.clearRect(0,0,w,h); ctx.drawImage(pegX.canvas,0,0,w,h);
    const hj=G36.hov;
    if(hj==null)ctx.drawImage(stX.canvas,0,0,w,h);
    else { ctx.globalAlpha=.2; ctx.drawImage(stX.canvas,0,0,w,h); ctx.globalAlpha=1;
      ctx.save(); ctx.beginPath(); ctx.rect(binX(hj)-dx/2,0,dx,h); ctx.clip(); ctx.drawImage(stX.canvas,0,0,w,h); ctx.restore(); }
    if(G36.moving.length){ ctx.fillStyle=C.vermell; ctx.beginPath(); for(const b of G36.moving){ ctx.moveTo(b.x+rb,b.y); ctx.arc(b.x,b.y,rb,0,6.2832); } ctx.fill(); }
    if(G36.spawned!==lastCnt){ lastCnt=G36.spawned; cnt.text(`${f0(G36.spawned)} de ${f0(N)} boles`); cnt2.text(`Probabilitat de rebotar a la dreta: ${f0(G36.p*100)} %`); }
  }
  const ROW=mob?105:95;
  function step(dt){
    if(G36.spawned<N){ G36.acc+=dt; while(G36.acc>26&&G36.spawned<N){ G36.acc-=26; G36.spawned++;
      const path=[]; for(let r=0;r<n;r++)path.push(G36.rnd()<G36.p?1:0);
      G36.moving.push({path,t:0,j:0,x:cx,y:top-dy,done:false}); } }
    const out=[];
    G36.moving.forEach(b=>{ b.t+=dt;
      const u=b.t/ROW, row=Math.floor(u);
      if(row<n){ // de la clau row-1 a la clau row (la fila -1 és el forat de dalt)
        const f=u-row; let j0=0; for(let r=0;r<row;r++)j0+=b.path[r];
        const x0=row===0?cx:xAt(row-1,j0-(b.path[row-1]||0)+0)+(b.path[row-1]?dx/2:-dx/2)*0;
        const xa=row===0?cx:xAt(row-1,j0-b.path[row-1]), xb=xAt(row,j0);
        void x0;
        const y0=top+(row-1)*dy, a=dy*.45;
        b.x=xa+(xb-xa)*Math.min(1,f*1.25); b.y=y0-a*f+(dy+a)*f*f-rb;
      } else { // cau al calaix
        let j=0; b.path.forEach(v=>j+=v); b.j=j;
        const lvl=Math.floor(G36.counts[j]/per), ty=binB-dd/2-lvl*dd, f=(b.t-n*ROW)/ROW;
        const xa=xAt(n-1,j-b.path[n-1]), xb=binX(j);
        const fT=Math.max(1,Math.sqrt((ty-pegB)/dy)*.8), q=Math.min(1,f/fT);
        b.x=xa+(xb-xa)*Math.min(1,f*2); b.y=pegB+(ty-pegB)*q*q;
        if(b.y>=ty){ G36.counts[j]++; b.done=true; }
      }
      if(!b.done)out.push(b); });
    G36.moving=out;
  }
  draw();
  el._redraw=()=>{ dirty=true; };
  const run=()=>{ el.__f=el.__f||[0,0]; el.__loop=V.loop(el,tm(el,(t,dt)=>{ if(!G36.on){ if(dirty){ draw(); dirty=false; } return; }
    if(G36.spawned>=N&&!G36.moving.length){ if(dirty){ draw(); dirty=false; } return; }
    step(dt); draw(); })); };
  if(V.reduced){ if(!G36.spawned)fill36(); draw(); }
  else run();
  if(!el.__ov){ el.__ov=true; V.onView(el,inst=>{ if(inst||V.reduced){ if(!G36.spawned)fill36(); dirty=true; if(el.__draw)el.__draw(); } G36.on=true; }); }
  el.__draw=draw;
  // hover per calaix: el calaix en blau ple i amb vora, la resta apagada, guia fins a l'eix i recompte al damunt
  const hv=hvLayer(s), dimS=d3.selectAll([cur.node(),meanG.node()]);
  const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
  const showHv=(j,anim)=>{
    hv.selectAll("*").remove(); hb.style("display","none");
    if(j==null)return;
    const c=G36.counts[j], th=binom(n,j,G36.p), stk=Math.ceil(c/per)*dd, thy=binB-N*th/per*dd, top0=Math.min(binB-stk,thy)-6;
    hb.style("display",null).attr("stroke-dasharray",null).attr("stroke-width",1.5).attr("x",binX(j)-dx/2+1).attr("width",dx-2).attr("y",binB-stk-3).attr("height",stk+3).raise();
    hv.append("line").attr("x1",binX(j)).attr("x2",binX(j)).attr("y1",top0).attr("y2",binB+5).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
    hv.append("circle").attr("cx",binX(j)).attr("cy",thy).attr("r",3.5).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.5);
    hv.append("rect").attr("x",binX(j)-11).attr("y",binB+3).attr("width",22).attr("height",17).attr("fill",C.paper);
    axTag(hv,binX(j),binB+16,j,{size:12.5,halo:false});
    lab(hv,binX(j),top0-6,`${f0(c)} ${c===1?"bola":"boles"}`,{size:12.5,weight:700,anchor:"middle"});
    void anim;
  };
  V.hover(hit.node(),(ev,[px,py])=>{
    const j=Math.max(0,Math.min(n,Math.round((px-cx)/dx+n/2)));
    if(px<binX(0)-dx||px>binX(n)+dx||py<top-dy*1.5){ if(G36.hov!=null){ G36.hov=null; showHv(null); dimTo(dimS,1); draw(); } tp.hide(); return; }
    const c=G36.counts[j], tot=d3.sum(G36.counts)||1, th=binom(n,j,G36.p);
    if(G36.hov!==j){ G36.hov=j; dimTo(dimS,.3); draw(); }
    showHv(j);
    tp.show(`<b>${j} ${j===1?"rebot":"rebots"} a la dreta de ${n}</b><br>${f0(c)} boles (${f1(c/tot*100)} % de les caigudes)<br>Teoria: ${f1(th*100)} % · ${f0(choose(n,j))} camins hi porten`,binX(j),binB-Math.ceil(c/per)*dd-30);
  },()=>{ G36.hov=null; showHv(null); dimTo(dimS,1); draw(); tp.hide(); });
});
(function(){
  const r=$('[data-r36]'), o=$('[data-v36]');
  const upd=()=>{ const t=f0(G36.p*100)+" %"; if(o)o.textContent=t; if(r)r.setAttribute("aria-valuetext",t+" de probabilitat de rebotar a la dreta"); };
  if(r)r.addEventListener("input",()=>{ G36.p=+r.value; upd(); const el=$('[data-p="36"]'); reset36(); if(V.reduced)fill36();
    if(el){ if(el._p)el._p(true); if(el._redraw)el._redraw(); if(el.__draw)el.__draw(); } });
  const p=$('[data-play="36"]'); if(p)p.addEventListener("click",()=>{ reset36(); if(V.reduced)fill36(); G36.on=true; const el=$('[data-p="36"]'); if(el&&el.__draw)el.__draw(); });
  upd(); void M36;
})();

/* =====================================================================
   IB-37 · CALENDARI DE CALOR  (dades d'exemple)
   ===================================================================== */
const DIES=["dilluns","dimarts","dimecres","dijous","divendres","dissabte","diumenge"], DIES2=["dl","dt","dc","dj","dv","ds","dg"];
const MESOS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const deMes=m=>/^[aeiou]/.test(MESOS[m])?"d'"+MESOS[m]:"de "+MESOS[m];
const YRS37=[2023,2024,2025];
const DAYS37=(function(){ const r=V.rng(37), out=[];
  d3.timeDays(new Date(2023,0,1),new Date(2026,0,1)).forEach((d,i)=>{
    const doy=d3.timeDay.count(d3.timeYear(d),d), wd=(d.getDay()+6)%7, yi=d.getFullYear()-2023;
    let v=52+yi*7+24*Math.sin(2*Math.PI*(doy-100)/365.25)+(wd===5?-14:wd===6?-22:wd===0?4:0)+V.gauss(r)*7;
    if(r()<.012)v+=35+r()*40;
    if((d.getMonth()===7&&d.getDate()>=8&&d.getDate()<=22)||(d.getMonth()===11&&d.getDate()>=24))v*=.22;
    out.push({d,i,yi,wd,wk:d3.timeMonday.count(d3.timeYear(d),d),m:d.getMonth(),v:Math.max(0,Math.round(v))}); });
  return out; })();
const MAX37=d3.max(DAYS37,d=>d.v), SEQ37=V.heat([0,MAX37]);
legend(37,el=>V.legendRamp(el,{scale:SEQ37,min:0,max:MAX37,ticks:[25,50,75,100],f:f0,title:"Registres per dia",lo:"Menys",hi:"Més",w:170}));
piece(37,(el,w)=>{
  const mob=w<640;
  let c, H, pos, monthPath, yearHead;
  const wd=d=>d.wd, wk=d=>d.wk;
  if(!mob){ // anys en files: setmanes a l'eix x, dies a l'eix y
    var T0=52; const L=30; c=Math.min(21,Math.floor((w-L-6)/54)); const blockH=7*c+40;
    H=T0+YRS37.length*blockH+14;
    pos=d=>[L+wk(d)*c, T0+d.yi*blockH+wd(d)*c];
    yearHead=(yi)=>[L,T0+yi*blockH-(yi?12:26)];
    monthPath=(y,m)=>{ const t0=new Date(y,m,1), t1=new Date(y,m+1,0), yi=y-2023, X=L, Y=T0+yi*blockH;
      const d0=(t0.getDay()+6)%7, w0=d3.timeMonday.count(d3.timeYear(t0),t0), d1=(t1.getDay()+6)%7, w1=d3.timeMonday.count(d3.timeYear(t1),t1);
      return `M${X+(w0+1)*c},${Y+d0*c}H${X+w0*c}V${Y+7*c}H${X+w1*c}V${Y+(d1+1)*c}H${X+(w1+1)*c}V${Y}H${X+(w0+1)*c}Z`; };
  } else { // mòbil: anys en columnes, setmanes cap avall
    const L=34, gap=16; c=Math.min(15,Math.floor((w-L-gap*(YRS37.length-1))/(7*YRS37.length)));
    H=40+54*c+10;
    pos=d=>[L+d.yi*(7*c+gap)+wd(d)*c, 40+wk(d)*c];
    yearHead=yi=>[L+yi*(7*c+gap),22];
    monthPath=(y,m)=>{ const t0=new Date(y,m,1), t1=new Date(y,m+1,0), yi=y-2023, X=L+yi*(7*c+gap), Y=40;
      const d0=(t0.getDay()+6)%7, w0=d3.timeMonday.count(d3.timeYear(t0),t0), d1=(t1.getDay()+6)%7, w1=d3.timeMonday.count(d3.timeYear(t1),t1);
      return `M${X+d0*c},${Y+(w0+1)*c}V${Y+w0*c}H${X+7*c}V${Y+w1*c}H${X+(d1+1)*c}V${Y+(w1+1)*c}H${X}V${Y+(w0+1)*c}Z`; };
  }
  // 1.095 dies: en canvas. L'SVG només porta text, notes i la capa de hover.
  const {ctx,s}=layer(el,w,H,"Calendari de tres anys, del 2023 al 2025: cada quadrat és un dia, més fosc com més registres. Hi ha un cicle anual amb el màxim a l'estiu, caps de setmana més baixos, dues setmanes buides a l'agost i per Nadal, i cada any una mica més alt que l'anterior. Dades d'exemple."), g=s.append("g");
  const P37=DAYS37.map(d=>{ const [x,y]=pos(d); return [x,y,SEQ37(d.v)]; });
  const MP=[]; YRS37.forEach(y=>d3.range(12).forEach(m=>MP.push(new Path2D(monthPath(y,m)))));
  function paint(cellA,monthA){ // cellA(i) → opacitat de cada dia (entrada); monthA: opacitat de les vores dels mesos
    ctx.clearRect(0,0,w,H);
    for(let i=0;i<P37.length;i++){ const a=cellA?cellA(i):1; if(a<=0)continue; ctx.globalAlpha=a; ctx.fillStyle=P37[i][2]; ctx.fillRect(P37[i][0]+.5,P37[i][1]+.5,c-1.5,c-1.5); }
    ctx.globalAlpha=.55*monthA; ctx.strokeStyle=C.ink; ctx.lineWidth=.7; if(monthA>0)MP.forEach(p=>ctx.stroke(p)); ctx.globalAlpha=1;
  }
  // reixa precalculada per trobar el dia sota el punter
  const GRID=new Map(); DAYS37.forEach((d,i)=>{ const k=Math.floor((P37[i][0]+c/2)/c)+","+Math.floor((P37[i][1]+c/2)/c); GRID.set(k,d); });
  const cellAt=(px,py)=>{ const gx=Math.floor(px/c), gy=Math.floor(py/c); let best=null, bd=1e9;
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){ const d=GRID.get((gx+a)+","+(gy+b)); if(!d)continue; const [x,y]=pos(d), dd=Math.abs(px-x-c/2)+Math.abs(py-y-c/2); if(dd<bd){ bd=dd; best=d; } }
    return bd<c*1.2?best:null; };
  // capçaleres
  const hd=g.append("g");
  YRS37.forEach((y,yi)=>{ const [X,Y]=yearHead(yi), tot=d3.sum(DAYS37.filter(d=>d.yi===yi),d=>d.v);
    V.t(hd,X,Y,y,{serif:true,weight:600,size:16});
    if(!mob)V.t(hd,X+44,Y,`${f0(tot)} registres · ${f0(tot/DAYS37.filter(d=>d.yi===yi).length)} al dia de mitjana`,{size:12,fill:C.ink2}); });
  if(!mob){
    DIES2.forEach((t,i)=>{ if(i%2)return; YRS37.forEach((y,yi)=>V.t(hd,26,pos({wd:i,wk:0,yi})[1]+c*.72,t,{size:11.5,fill:C.muted,anchor:"end"})); });
    d3.range(12).forEach(m=>{ const t0=new Date(2023,m,1); const x=pos({wd:0,wk:d3.timeMonday.count(d3.timeYear(t0),t0)+ ((t0.getDay()+6)%7?1:0),yi:0})[0]; V.t(hd,x,T0-6,V.MES[m],{size:11.5,fill:C.muted}); });
  } else {
    d3.range(12).forEach(m=>{ const t0=new Date(2023,m,1), wk0=d3.timeMonday.count(d3.timeYear(t0),t0)+((t0.getDay()+6)%7?1:0);
      V.t(hd,0,40+wk0*c+c*.8,V.MES[m],{size:11.5,fill:C.muted}); });
    DIES2.forEach((t,i)=>{ if(i!==0&&i!==6)return; V.t(hd,pos({wd:i,wk:0,yi:0})[0]+c/2,36,t,{size:11,fill:C.muted,anchor:"middle"}); });
  }
  // anotacions
  const an=g.append("g").attr("class","ibx-an");
  const mx=DAYS37.reduce((a,b)=>b.v>a.v?b:a), [mxX,mxY]=pos(mx);
  if(!mob){
    V.note(an,{x:mxX+c/2,y:mxY,tx:mxX+c*3,ty:yearHead(mx.yi)[1]-2,kind:"elbow",anchor:"start",lines:[["Dia màxim",true],[`${mx.d.getDate()} ${deMes(mx.m)} de ${mx.d.getFullYear()}: ${mx.v}`]]}).attr("transform","translate(0,0)");
    const ag=DAYS37.find(d=>d.yi===2&&d.m===7&&d.d.getDate()===15), [aX,aY]=pos(ag);
    V.note(an,{x:aX+c/2,y:aY+7*c-ag.wd*c,tx:aX+c*4,ty:aY+7*c-ag.wd*c+18,kind:"elbow",anchor:"start",lines:[["Agost",true],["quinze dies gairebé buits"]]});
  } else {
    const ag=DAYS37.find(d=>d.yi===0&&d.m===7&&d.d.getDate()===15), [aX,aY]=pos(ag);
    void aX; void aY;
  }
  // hover: el dia s'engrandeix amb vora en tinta, el mes es queda encès i la setmana es marca;
  // guies fins al dia de la setmana i fins al mes, amb el nom en negreta sobre l'eix, i el valor al costat
  const hv=hvLayer(s), tp=V.tip(el); let cur=null;
  s.style("cursor","crosshair");
  V.hover(s.node(),(ev,[px,py])=>{
    const best=cellAt(px,py); // el dia sota el dit, o el més proper
    if(!best){ if(cur){ cur=null; hv.selectAll("*").remove(); dimTo(an,1); } tp.hide(); return; }
    const [x,y]=pos(best);
    if(cur===best)return;
    const ch=!cur||cur.m!==best.m||cur.yi!==best.yi; cur=best;
    if(ch)dimTo(an,.15);
    const w0=DAYS37.filter(d=>d.yi===best.yi&&d.wk===best.wk), [x0,y0]=pos(w0[0]), [x1,y1]=pos(w0[w0.length-1]);
    hv.selectAll("*").remove();
    // vel blanc amb un forat a la forma del mes: la resta queda apagada sense redibuixar el canvas
    hv.append("path").attr("d",`M0,0H${w}V${H}H0Z`+monthPath(best.d.getFullYear(),best.m)).attr("fill-rule","evenodd").attr("fill",C.paper).attr("fill-opacity",.75);
    hv.append("rect").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).attr("x",Math.min(x0,x1)-.5).attr("y",Math.min(y0,y1)-.5).attr("width",Math.abs(x1-x0)+c).attr("height",Math.abs(y1-y0)+c);
    const cxx=x+c/2, cyy=y+c/2, mY=mob?null:T0-6, wdX=mob?null:26;
    // guies
    if(!mob){ hv.append("path").attr("d",`M${x},${cyy}H${wdX+4}M${cxx},${y}V${mY+4}`).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2").attr("fill","none"); }
    else { hv.append("path").attr("d",`M${cxx},${y}V${42}M${x},${cyy}H${26}`).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2").attr("fill","none"); }
    // el dia, més gran i al davant
    const k=1.45, sz=(c-1.5)*k;
    hv.append("rect").attr("x",cxx-sz/2).attr("y",cyy-sz/2).attr("width",sz).attr("height",sz).attr("rx",2).attr("fill",SEQ37(best.v)).attr("stroke",C.ink).attr("stroke-width",1.5);
    // etiquetes sobre els eixos
    if(!mob){ axTag(hv,wdX,cyy+4,DIES2[best.wd],{anchor:"end"}); axTag(hv,cxx,mY,MESOS[best.m],{}); }
    else { axTag(hv,cxx,36,DIES2[best.wd],{}); axTag(hv,0,cyy+4,V.MES[best.m],{anchor:"start"}); }
    // valor al costat
    const right=cxx+sz/2+4+30<w;
    lab(hv,right?cxx+sz/2+4:cxx-sz/2-4,cyy+4.5,best.v,{size:13,weight:700,anchor:right?"start":"end"});
    const md=d3.mean(DAYS37.filter(d=>d.yi===best.yi&&d.m===best.m),d=>d.v), wsum=d3.sum(w0,d=>d.v);
    tp.show(`<b>${DIES[best.wd]} ${best.d.getDate()} ${deMes(best.m)} de ${best.d.getFullYear()}</b><br>${best.v} registres<br>${best.v>=md?"+":"−"}${f0(Math.abs(best.v/md-1)*100)} % respecte a la mitjana ${deMes(best.m).replace(/^de /,"de ")} (${f0(md)})<br>Setmana: ${f0(wsum)}`,cxx,y-6);
  },()=>{ cur=null; tp.hide(); hv.selectAll("*").remove(); dimTo(an,1); });
  const DL=DAYS37.map(d=>(d.yi*53+d.wk)*8+d.wd*22);
  intro(el,()=>{ paint(()=>0,0); an.style("opacity",0); },inst=>{
    if(inst){ paint(null,1); an.style("opacity",1); return; }
    const T=d3.timer(t=>{ paint(i=>d3.easeCubicOut(cl01((t-DL[i])/500)),cl01((t-1400)/700)); if(t>2200){ T.stop(); paint(null,1); } });
    an.transition().delay(1700).duration(600).style("opacity",1);
  });
});

/* =====================================================================
   IB-38 · FILERA DE CERCLES TRANSLÚCIDS  (dades reals: ONI, 921 mesos)
   Cada mes real és un cercle translúcid `multiply` sobre el fil de la seva dècada
   o estació, amb l'àrea proporcional a la intensitat (estil «Major quakes» i
   «Incendios en Perú»), sense crestes opaques que amaguin les files de darrere.
   ===================================================================== */
let mode38="dec";
function groups38(mode,mob){
  if(mode==="dec")return DECS.map(d=>{ const pts=ONI_PTS.filter(p=>p.y>=d&&p.y<d+10); return {id:d,t:decLab(d,mob),pts}; });
  return d3.range(12).map(k=>({id:k,t:SEASON[k],pts:ONI_PTS.filter(p=>p.k===k)}));
}
legend(38,el=>{
  V.legendRamp(el,{scale:DIV25,min:-2.5,max:2.5,ticks:[-2,-1,0,1,2],f:v=>sgn(v,0),title:"Anomalia de cada mes (°C)",lo:"La Niña",hi:"El Niño"});
  V.legendCat(el,[{c:C.vermell,a:.32,t:"1 cercle = 1 mes (àrea = intensitat)"},{c:C.ink,t:"Mediana del grup",kind:"line",w:1.6}]);
});
const M38=piece(38,(el,w)=>{
  const mob=w<640, G=groups38(mode38,mob), n=G.length;
  const rowH=mode38==="dec"?(mob?40:50):(mob?30:36);
  const m={t:34,l:mob?66:88,r:mob?12:82,b:46};
  const h=m.t+n*rowH+m.b;
  el.style.height="";
  const s=V.svg(el,w,h,mode38==="dec"?"Una fila per dècada, del 1950 al 2026, on cada mes real és un cercle translúcid situat segons l'índex ONI i d'àrea proporcional a la intensitat. Les dècades del 1980, el 1990 i el 2010 mostren els cercles vermells d'El Niño més grans, fins a +2,6 °C.":"Una fila per estació de tres mesos amb tots els mesos reals de 1950 a 2026 en cercles translúcids: a la primavera boreal els valors s'apinyen prop de zero; a la tardor i l'hivern els cercles creixen cap als dos extrems.");
  const g=s.append("g");
  const x=d3.scaleLinear([-2.6,3.0],[m.l,w-m.r]);
  const rS=d3.scaleSqrt([0,2.6],[mob?2.2:2.8,mob?14.5:21]);
  const cy=i=>m.t+(i+.5)*rowH;

  // 1. Quadrícula vertical ultra-fina i llindars El Niño / La Niña
  const ax=g.append("g");
  [-2,-1,0,1,2,3].forEach(v=>{
    ax.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t-8).attr("y2",h-m.b+4)
      .attr("stroke",v===0?C.ink:C.grid).attr("stroke-width",v===0?.9:.75).attr("stroke-opacity",v===0?.55:.85);
    V.t(ax,x(v),h-m.b+20,sgn(v,0)+(v===3?" °C":""),{size:11.5,fill:v===0?C.ink:C.muted,weight:v===0?600:400,anchor:"middle"});
  });
  [-.5,.5].forEach(v=>ax.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t-8).attr("y2",h-m.b)
    .attr("stroke",v<0?C.blau:C.vermell).attr("stroke-width",.9).attr("stroke-opacity",.45).attr("stroke-dasharray","2 3"));
  if(!mob){
    V.t(ax,x(-.5)-8,h-m.b+36,"◀ La Niña (≤ −0,5 °C)",{size:11.5,fill:C.blau,anchor:"end",italic:true});
    V.t(ax,x(.5)+8,h-m.b+36,"El Niño (≥ +0,5 °C) ▶",{size:11.5,fill:C.vermell,italic:true});
    V.t(ax,w-m.r+10,m.t-12,"Mediana",{size:11,fill:C.muted,anchor:"start"});
  }

  // 2. Files netes de cercles translúcids (sense muntanyes opaques encavalcades)
  const R=g.append("g").selectAll("g.r").data(G).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${cy(i)})`);
  R.each(function(gd){
    const q=d3.select(this);
    gd.med=d3.median(gd.pts,p=>p.v);
    // Fil base ultra-fi
    q.append("line").attr("class","rail").attr("x1",m.l).attr("x2",w-m.r).attr("y1",0).attr("y2",0)
      .attr("stroke",C.hair).attr("stroke-width",.65);
    // Tots els mesos reals en cercles translúcids `multiply` (ordenats de petits a grans perquè els grans no ofeguin la lectura)
    const sorted=gd.pts.slice().sort((a,b)=>Math.abs(a.v)-Math.abs(b.v));
    q.selectAll("circle.m").data(sorted).join("circle").attr("class","m")
      .attr("cx",p=>x(p.v)).attr("cy",0).attr("r",p=>rS(Math.abs(p.v)))
      .attr("fill",p=>Math.abs(p.v)<.35?"#8A8A8A":DIV25(p.v))
      .attr("fill-opacity",p=>Math.abs(p.v)<.35?.11:.23)
      .attr("stroke",p=>Math.abs(p.v)<.5?"none":DIV25(p.v))
      .attr("stroke-width",.65).attr("stroke-opacity",.52)
      .style("mix-blend-mode","multiply");
    // Marca discreta de la mediana en tinta
    q.append("line").attr("class","med").attr("x1",x(gd.med)).attr("x2",x(gd.med)).attr("y1",-7).attr("y2",7)
      .attr("stroke",C.ink).attr("stroke-width",1.6).attr("stroke-linecap","round");
    // Etiqueta de la fila (esquerra) i mediana numèrica (dreta, escriptori)
    lab(q,m.l-10,4,gd.t,{size:mob?11.5:12.5,anchor:"end",fill:C.ink2}).attr("class","rl");
    if(!mob){
      V.t(q,w-m.r+10,4,`${sgn(gd.med)} °C`,{size:11.5,fill:C.muted,anchor:"start"}).attr("class","rm");
    }
  });

  // 3. Anotacions quirúrgiques (màxim 2)
  const an=g.append("g").style("pointer-events","none");
  const mxP=ONI_PTS.reduce((a,b)=>b.v>a.v?b:a), gi=G.findIndex(gd=>gd.pts.includes(mxP));
  if(gi>=0){
    const X=x(mxP.v), Y=cy(gi), rad=rS(Math.abs(mxP.v));
    V.note(an,{x:X,y:Y-rad-2,tx:Math.min(w-m.r-8,X-14),ty:Math.max(18,Y-rowH*(mob?1.2:1.05)),kind:"curve",anchor:"end",size:mob?11.5:12.5,
      lines:[["Màxim de la sèrie",true],[`${sgn(mxP.v)} °C · ${SEASON[mxP.k]} ${mxP.y}`]]});
  }
  if(mode38==="est"&&!mob){
    const sd=G.map(gd=>d3.deviation(gd.pts,p=>p.v)), kmin=d3.minIndex(sd), kmax=d3.maxIndex(sd);
    R.filter((d,i)=>i===kmin||i===kmax).each(function(){ d3.select(this).select(".rl").attr("font-weight",700).attr("fill",C.ink); });
    V.note(an,{x:x(.65),y:cy(kmin),tx:x(1.45),ty:cy(kmin)-12,kind:"curve",anchor:"start",size:12,
      lines:[[`${G[kmin].t}: primavera en calma`,true],[`dispersió ${f2(sd[kmin])} °C vs ${f2(sd[kmax])} °C a ${G[kmax].t}`]]});
  }

  // 4. Hover suau (atenuació ≥ 0,48) + cerca del mes exacte apuntat + lectura ancorada en 1 línia
  const hv=hvLayer(g), tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
  let curRow=-1;
  const reset=()=>{ curRow=-1; tp.hide(); hv.selectAll("*").remove();
    R.interrupt("hv").transition("hv").duration(HT).style("opacity",1);
    R.select(".rl").attr("font-weight",d=>d.__bold?700:400).attr("fill",d=>d.__bold?C.ink:C.ink2);
    dimTo(an,1); };
  R.select(".rl").each(function(d){ d.__bold=d3.select(this).attr("font-weight")==="700"; });

  V.hover(hit.node(),(ev,[px,py])=>{
    if(py<m.t-8||py>h-m.b+6){ if(curRow>=0)reset(); return; }
    const i=Math.max(0,Math.min(n-1,Math.floor((py-m.t)/rowH)));
    const gd=G[i], yR=cy(i);
    // Troba el mes més proper horitzontalment dins la fila
    const near=d3.least(gd.pts,p=>Math.abs(x(p.v)-px));
    if(i!==curRow){
      curRow=i;
      R.interrupt("hv").transition("hv").duration(HT).style("opacity",(d,j)=>j===i?1:.48);
      R.select(".rl").attr("font-weight",(d,j)=>j===i||d.__bold?700:400).attr("fill",(d,j)=>j===i?C.ink:d.__bold?C.ink:C.ink2);
      dimTo(an,.5);
    }
    hv.selectAll("*").remove();
    if(near){
      const nx=x(near.v), nr=rS(Math.abs(near.v)), col=Math.abs(near.v)<.35?C.ink:DIV25(near.v);
      hv.append("line").attr("x1",nx).attr("x2",nx).attr("y1",yR+nr+2).attr("y2",h-m.b+4)
        .attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
      hv.append("circle").attr("cx",nx).attr("cy",yR).attr("r",Math.max(5,nr))
        .attr("fill",V.alpha(col,.32)).attr("stroke",C.ink).attr("stroke-width",1.5);
      hv.append("circle").attr("cx",nx).attr("cy",yR).attr("r",2.2).attr("fill",C.ink);
      const right=nx<w*.72;
      V.t(hv,nx+(right?Math.max(8,nr+6):-Math.max(8,nr+6)),yR-6,`${sgn(near.v)} °C (${near.y})`,{anchor:right?"start":"end",size:12,weight:700,fill:C.ink,halo:3.4});
      const vs=gd.pts.map(p=>p.v), pN=f0(vs.filter(v=>v>=.5).length/vs.length*100), pL=f0(vs.filter(v=>v<=-.5).length/vs.length*100);
      tp.show(`<b>${SEASON[near.k]} ${near.y}</b> · ${sgn(near.v)} °C · ${mode38==="dec"?decLab(gd.id,false):gd.t}: mediana ${sgn(gd.med)} °C (El Niño ${pN} %, La Niña ${pL} %)`,nx,yR);
    }
  },reset);

  const anim=inst=>{
    if(inst){ R.style("opacity",1); R.selectAll("circle.m").attr("r",p=>rS(Math.abs(p.v))); an.style("opacity",1); return; }
    R.style("opacity",0).transition().delay((d,i)=>i*70).duration(320).style("opacity",1);
    R.selectAll("circle.m").attr("r",0).transition().delay((d,i,nn)=>{
      const rowIdx=G.indexOf(d3.select(nn[i].parentNode).datum());
      return rowIdx*70+Math.abs(d.v)*90;
    }).duration(550).ease(d3.easeCubicOut).attr("r",p=>rS(Math.abs(p.v)));
    an.style("opacity",0).transition().delay(n*70+520).duration(420).style("opacity",1);
  };
  if(el.__again){ el.__again=false; anim(false); }
  else intro(el,()=>{ R.style("opacity",0); an.style("opacity",0); },anim);
});
segs(38,k=>{ mode38=k; const el=$('[data-p="38"]'); if(el)el.__again=!V.reduced; M38.redraw(); });

/* =====================================================================
   IB-39 · EIXAM DE FORCES  (dades reals: ONI, un punt per mes)
   ===================================================================== */
let mode39="tot", sim39=null;
const N39=ONI_PTS.map(p=>({yr:p.y,k:p.k,v:p.v,ph:p.v>=.5?2:p.v<=-.5?0:1,dec:Math.floor(p.y/10)*10})); // sense «y»: la simulació hi escriu la posició
const PH=["La Niña","Neutral","El Niño"];
legend(39,el=>V.legendRamp(el,{scale:DIV25,min:-2.5,max:2.5,ticks:[-2,-1,0,1,2],f:v=>sgn(v,0),title:"ONI de cada mes (°C)",lo:"La Niña",hi:"El Niño"}));
const M39=piece(39,(el,w)=>{
  if(sim39)sim39.stop();
  const mob=w<640, h=mob?460:420, r=mob?2.6:3.6, pad=mob?6:18, E=mob?124:84;
  // 921 punts en canvas; l'SVG porta el text, les notes i la capa de hover
  const {ctx,s}=layer(el,w,h,`${N39.length} punts, un per cada mes des del 1950, amb l'índex ONI. Es poden agrupar en una línia de valors, per fase (La Niña, neutral, El Niño) o per dècada. Dades reals de la NOAA.`), cv=ctx.canvas;
  const veil=s.append("rect").attr("width",w).attr("height",h).attr("fill",C.paper).attr("opacity",0).style("pointer-events","none");
  const gl=s.append("g"), ga=s.append("g");
  const x=d3.scaleLinear([-2.4,2.9],[pad+r,w-pad-r]);
  function targets(mode){
    const T={};
    if(mode==="tot"){ T.x=d=>x(d.v); T.y=()=>h*.5; T.sx=.9; T.sy=.07; }
    else if(mode==="fase"){ const cxs=mob?[w*.2,w*.5,w*.8]:[w*.22,w*.5,w*.78]; T.x=d=>cxs[d.ph]+d.v*(mob?6:10); T.y=()=>h*.55; T.sx=.12; T.sy=.12; }
    else { const cols=mob?4:8, rows=mob?2:1, cw=(w-2*pad)/cols, rh=(h-60)/rows;
      T.cx=d=>pad+cw*((DECS.indexOf(d.dec))%cols+.5); T.cy=d=>40+rh*(Math.floor(DECS.indexOf(d.dec)/cols)+.55);
      T.x=d=>T.cx(d)+d.v*(mob?4:6); T.y=T.cy; T.sx=.14; T.sy=.14; }
    return T;
  }
  N39.forEach(d=>{ if(!d.col)d.col=DIV25(d.v); });
  const NOW39=N39.filter(d=>d.yr===2026);
  function paint(){
    ctx.clearRect(0,0,w,h);
    for(const d of N39){ ctx.fillStyle=d.col; ctx.beginPath(); ctx.arc(d.x,d.y,r,0,6.2832); ctx.fill(); }
    ctx.strokeStyle=C.ink; ctx.lineWidth=1.1; ctx.beginPath(); for(const d of NOW39){ ctx.moveTo(d.x+r,d.y); ctx.arc(d.x,d.y,r,0,6.2832); } ctx.stroke();
  }
  let del=null, moving=false; // Delaunay per al hover, es refà quan la simulació s'atura
  N39.forEach(d=>{ if(d.x==null||el.__w!==w){ d.x=w/2+(Math.random()-.5)*40; d.y=h/2+(Math.random()-.5)*40; } });
  el.__w=w;
  function labels(mode,anim){
    gl.selectAll("*").remove(); ga.selectAll("*").remove();
    if(mode==="tot"){
      [-2,-1,0,1,2].forEach(v=>{ gl.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",h*.5+E-4).attr("y2",h*.5+E).attr("stroke",C.muted);
        V.t(gl,x(v),h*.5+E+14,sgn(v,0)+(v===2?" °C":""),{size:11.5,fill:C.muted,anchor:"middle"}); });
      [-.5,.5].forEach(v=>gl.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",h*.5-E+4).attr("y2",h*.5+E-4).attr("stroke",C.ink2).attr("stroke-width",1.1).attr("stroke-dasharray","1.5 3.5").attr("stroke-linecap","round"));
      V.t(gl,x(-.5)-6,h*.5-E,"◀ La Niña",{size:12,italic:true,fill:C.ink2,anchor:"end"}); V.t(gl,x(.5)+6,h*.5-E,"El Niño ▶",{size:12,italic:true,fill:C.ink2});
      const mx=N39.reduce((a,b)=>b.v>a.v?b:a);
      V.note(ga,{x:x(mx.v),y:h*.5-6,tx:x(mx.v)-(mob?8:20),ty:h*.5-E-(mob?26:34),kind:"elbow",anchor:"end",lines:[["El mes més càlid",true],[`${SEASON[mx.k]} ${mx.yr}: ${sgn(mx.v)} °C`]]});
      const nw=N39.filter(d=>d.yr===2026);
      if(!mob)V.note(ga,{x:x(d3.mean(nw,d=>d.v)),y:h*.5+14,tx:x(d3.mean(nw,d=>d.v))+60,ty:h*.5+(mob?120:130),kind:"elbow",anchor:"start",lines:[["El 2026, amb vora negra",true],[`${nw.length} mesos, de ${sgn(d3.min(nw,d=>d.v))} a ${sgn(d3.max(nw,d=>d.v))} °C`]]});
    } else if(mode==="fase"){
      const cxs=mob?[w*.2,w*.5,w*.8]:[w*.22,w*.5,w*.78];
      PH.forEach((t,i)=>{ const k=N39.filter(d=>d.ph===i).length;
        V.t(gl,cxs[i],mob?54:52,t,{size:mob?15:17,weight:600,serif:true,anchor:"middle"});
        V.t(gl,cxs[i],mob?70:70,`${f0(k)} mesos · ${f0(k/N39.length*100)} %`,{size:12,fill:C.ink2,anchor:"middle"}); });
    } else {
      const cols=mob?4:8, rows=mob?2:1, cw=(w-2*pad)/cols, rh=(h-60)/rows;
      DECS.forEach((d,i)=>{ const X=pad+cw*(i%cols+.5), Y=40+rh*Math.floor(i/cols)+(mob?2:8), pts=N39.filter(p=>p.dec===d);
        V.t(gl,X,Y,mob?`${d}`:decLab(d,false),{size:mob?13:14,weight:600,serif:true,anchor:"middle"});
        V.t(gl,X,Y+15,`El Niño ${f0(pts.filter(p=>p.ph===2).length/pts.length*100)} %`,{size:11.5,fill:C.ink2,anchor:"middle"}); });
    }
    if(anim&&!V.reduced){ gl.style("opacity",0).transition().delay(300).duration(700).style("opacity",1); ga.style("opacity",0).transition().delay(900).duration(700).style("opacity",1); }
  }
  el.__f=el.__f||[0,0];
  const tick=tm(el,()=>{ paint(); del=null; });
  function go(mode,anim){
    const T=targets(mode); if(el._clear)el._clear();
    if(sim39)sim39.stop();
    sim39=d3.forceSimulation(N39).alphaDecay(.028).velocityDecay(.3)
      .force("x",d3.forceX(T.x).strength(T.sx)).force("y",d3.forceY(T.y).strength(T.sy))
      .force("c",d3.forceCollide(r+.55).iterations(2)).alphaMin(.01).on("tick",tick).on("end",()=>{ moving=false; del=null; });
    moving=true;
    if(!anim||V.reduced){ sim39.stop(); for(let i=0;i<200;i++)sim39.tick(); moving=false; tick(); }
    labels(mode,anim);
  }
  el._go=go;
  // hover: el punt creix amb vora en tinta; el seu any es queda encès i s'uneix en ordre; guia fins a l'eix (o fins al grup)
  const hv=hvLayer(s), tp=V.tip(el); let cur=null;
  s.style("cursor","pointer");
  const rank=new Map(N39.slice().sort((a,b)=>b.v-a.v).map((d,i)=>[d,i+1]));
  const anchor39=d=>{ // on és l'eix o l'etiqueta de grup del punt
    if(mode39==="tot")return {x:x(d.v),y:h*.5+E-4,tag:`${sgn(d.v)} °C`,dy:18};
    if(mode39==="fase"){ const cxs=mob?[w*.2,w*.5,w*.8]:[w*.22,w*.5,w*.78]; return {x:cxs[d.ph],y:(mob?70:70)+6,tag:`${sgn(d.v)} °C`,dy:14}; }
    const cols=mob?4:8, cw=(w-2*pad)/cols, rh=(h-60)/(mob?2:1), i=DECS.indexOf(d.dec);
    return {x:pad+cw*(i%cols+.5),y:40+rh*Math.floor(i/cols)+(mob?2:8)+19,tag:`${sgn(d.v)} °C`,dy:14}; };
  const clear39=()=>{ cur=null; tp.hide(); hv.selectAll("*").remove(); veil.interrupt().transition().duration(HT).attr("opacity",0); dimTo(ga,1); };
  el._clear=clear39;
  V.hover(s.node(),(ev,[px,py])=>{
    if(!del)del=d3.Delaunay.from(N39,d=>d.x,d=>d.y);
    const ci=del.find(px,py), cand=N39[ci], best=cand&&(cand.x-px)**2+(cand.y-py)**2<=(r+10)**2?cand:null;
    if(!best){ if(cur)clear39(); return; }
    if(best!==cur){ cur=best;
      veil.interrupt().transition().duration(HT).attr("opacity",.8); dimTo(ga,.15);
      hv.selectAll("*").remove();
      const yr=N39.filter(d=>d.yr===best.yr).sort((a,b)=>a.k-b.k);
      hv.append("path").attr("d",d3.line(d=>d.x,d=>d.y)(yr)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-opacity",.6);
      // el seu any, per sobre del vel; el punt apuntat, més gran i amb vora
      hv.selectAll("circle.y").data(yr).join("circle").attr("class","y").attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",r).attr("fill",d=>d.col);
      hv.append("circle").attr("cx",best.x).attr("cy",best.y).attr("r",r+3).attr("fill",best.col).attr("stroke",C.ink).attr("stroke-width",1.5);
      const A=anchor39(best);
      hv.append("line").attr("x1",best.x).attr("y1",best.y).attr("x2",A.x).attr("y2",A.y).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
      hv.append("rect").attr("x",A.x-30).attr("y",A.y+A.dy-13).attr("width",60).attr("height",17).attr("fill",C.paper);
      axTag(hv,A.x,A.y+A.dy,A.tag,{halo:false});
      const right=best.x<w-120;
      lab(hv,best.x+(right?r+7:-r-7),best.y-r-4,`${SEASON[best.k]} ${best.yr}`,{size:12.5,weight:700,anchor:right?"start":"end"});
    }
    const yr=N39.filter(d=>d.yr===best.yr);
    tp.show(`<b>${SEASON[best.k]} ${best.yr}</b><br>ONI ${sgn(best.v)} °C · ${PH[best.ph]}<br>El ${ord(rank.get(best))} més càlid de ${f0(N39.length)} mesos<br>Any ${best.yr}: de ${sgn(d3.min(yr,d=>d.v))} a ${sgn(d3.max(yr,d=>d.v))} °C`,best.x,best.y-14);
  },clear39);
  void moving;
  if(el.__seen){ go(mode39,false); }
  else { paint(); cv.style.opacity=0;
    intro(el,()=>{},inst=>{ cv.style.opacity=1; if(inst){ go(mode39,false); return; }
      N39.forEach(d=>{ d.x=w/2+(Math.random()-.5)*20; d.y=h/2+(Math.random()-.5)*20; }); tick(); go(mode39,true); }); }
});
segs(39,k=>{ mode39=k; const el=$('[data-p="39"]'); if(el&&el._go)el._go(k,true); });

/* =====================================================================
   IB-40 · FLUX AMB FILS DE PARTÍCULES  (dades reals: Global Carbon Budget 2026)
   Bandes de seda translúcides sense contorn (`multiply` + degradat horitzontal),
   nodes fins arrodonits i centenars de micro-traços corbats que circulen a poc a poc
   seguint el flux (estil IB-28 aplicat a un Sankey).
   ===================================================================== */
let run40=true;
const GCB=DA.gcb||{p:[]};
const N40=(function(){
  const src=[{id:"fossil",t:"Combustibles fòssils",ts:"Fòssils",col:0,c:C.ink2},{id:"luc",t:"Canvi d'ús del sòl",ts:"Ús del sòl",col:0,c:C.muted}];
  const per=GCB.p.map((p,i)=>({id:"p"+i,t:p[0],ts:p[0].replace(/–(\d\d)(\d\d)$/,"–$2"),col:1,c:C.ink,yrs:+p[0].slice(5)-+p[0].slice(0,4)+1}));
  const dst=[{id:"atm",t:"Atmosfera",ts:"Atmosfera",c:C.vermell,sc:C.vermell,i:3},{id:"ocean",t:"Oceà",ts:"Oceà",c:C.blau,sc:C.blau,i:4},{id:"land",t:"Terra: vegetació i sòls",ts:"Terra",c:C.groc,sc:C.grocFosc,i:5},{id:"cement",t:"Carbonatació del ciment",ts:"Ciment",c:C.ink2,sc:C.ink2,i:6},{id:"imb",t:"Desquadrament del balanç",ts:"Desquadrament",c:C.muted,sc:C.muted,i:7}].map(d=>Object.assign(d,{col:2}));
  const links=[];
  GCB.p.forEach((p,i)=>{ links.push({s:src[0],t:per[i],v:p[1]}); links.push({s:src[1],t:per[i],v:p[2]}); dst.forEach(d=>links.push({s:per[i],t:d,v:p[d.i]})); });
  const nodes=src.concat(per,dst);
  nodes.forEach(nd=>{ nd.out=links.filter(l=>l.s===nd); nd.in=links.filter(l=>l.t===nd); nd.v=Math.max(d3.sum(nd.out,l=>l.v),d3.sum(nd.in,l=>l.v)); });
  links.forEach((l,idx)=>{ l.idx=idx; l.c=l.t.col===2?l.t.c:(l.s.id==="fossil"?C.ink2:C.muted); l.sc=l.t.col===2?l.t.sc:(l.s.id==="fossil"?"#4E4C48":"#8F8C85"); });
  return {nodes,links,src,per,dst,T:d3.sum(src,d=>d.v)};
})();
legend(40,el=>V.legendCat(el,[{c:C.vermell,t:"Es queda a l'atmosfera"},{c:C.blau,t:"L'absorbeix l'oceà"},{c:C.groc,t:"L'absorbeix la terra"},{c:C.ink2,t:"Ciment i desquadrament",a:.6}]));
const M40=piece(40,(el,w)=>{
  if(el.__loop){ el.__loop.stop(); el.__loop=null; }
  const mob=w<640, h=mob?500:520, nw=mob?3:3.5;
  const m=mob?{t:28,b:18,l:6,r:6}:{t:32,b:56,l:178,r:208};
  const d3s=d3.select(el); d3s.selectAll("canvas.ibv,svg.ibv").remove(); el.style.height="";
  const s=V.svg(el,w,h,`Diagrama de flux del carboni emès entre el 1850 i el 2025: ${f0(N40.T)} GtC, de combustibles fòssils i del canvi d'ús del sòl, repartits en tres períodes i en la seva destinació: un ${f0(N40.dst[0].v/N40.T*100)} % s'ha quedat a l'atmosfera, la resta l'han absorbit l'oceà i la terra. Micro-traços direccionals circulen a poc a poc en proporció al volum. Dades reals del Global Carbon Budget 2026.`);
  const {c:cv,ctx}=V.canvas(el,w,h,""); d3.select(cv).attr("role",null).attr("aria-hidden","true").style("position","absolute").style("left",0).style("top",0).style("pointer-events","none");
  const g=s.append("g"), defs=s.append("defs");
  const X=[m.l,(m.l+w-m.r)/2-nw/2,w-m.r-nw];
  const cols=[N40.src,N40.per,N40.dst];
  const inner=h-m.t-m.b, maxN=5, padMax=mob?32:36;
  const k=(inner-padMax*(maxN-1))/N40.T;
  cols.forEach((col,ci)=>{
    const tot=d3.sum(col,d=>d.v)*k, pad=Math.min(ci===0?112:58,(inner-tot)/(col.length-1));
    let y=m.t+(inner-tot-pad*(col.length-1))/2;
    col.forEach(nd=>{ nd.x=X[ci]; nd.y0=y; nd.h=Math.max(2,nd.v*k); nd.y1=y+nd.h; y=nd.y1+pad; });
  });
  N40.nodes.forEach(nd=>{
    let y=nd.y0; nd.out.slice().sort((a,b)=>a.t.y0-b.t.y0).forEach(l=>{ l.sy=y; l.w=l.v*k; y+=l.w; });
    y=nd.y0; nd.in.slice().sort((a,b)=>a.s.y0-b.s.y0).forEach(l=>{ l.ty=y; y+=l.v*k; });
  });
  N40.links.forEach(l=>{ l.x0=l.s.x+nw+1.5; l.x1=l.t.x-1.5; l.xm=(l.x0+l.x1)/2; });
  const band=l=>`M${l.x0},${l.sy}C${l.xm},${l.sy} ${l.xm},${l.ty} ${l.x1},${l.ty}L${l.x1},${l.ty+l.w}C${l.xm},${l.ty+l.w} ${l.xm},${l.sy+l.w} ${l.x0},${l.sy+l.w}Z`;

  // Degradats suaus d'aquarel·la sense contorn (sense vores dures ni gris brut)
  const pid="g40"+Math.random().toString(36).slice(2,6);
  N40.links.forEach(l=>{
    const gr=defs.append("linearGradient").attr("id",`${pid}-${l.idx}`).attr("gradientUnits","userSpaceOnUse")
      .attr("x1",l.x0).attr("x2",l.x1).attr("y1",0).attr("y2",0);
    if(l.t.col===2){
      gr.append("stop").attr("offset","0%").attr("stop-color",C.ink2).attr("stop-opacity",.04);
      gr.append("stop").attr("offset","35%").attr("stop-color",l.c).attr("stop-opacity",l.c===C.groc?.13:.09);
      gr.append("stop").attr("offset","100%").attr("stop-color",l.c).attr("stop-opacity",l.c===C.groc?.22:.16);
    } else {
      const a0=l.s.id==="fossil"?.09:.065;
      gr.append("stop").attr("offset","0%").attr("stop-color",l.c).attr("stop-opacity",a0);
      gr.append("stop").attr("offset","100%").attr("stop-color",l.c).attr("stop-opacity",.04);
    }
  });

  const cid="c40"+Math.random().toString(36).slice(2,7);
  const clip=defs.append("clipPath").attr("id",cid).append("rect").attr("x",0).attr("y",0).attr("height",h).attr("width",w);
  const LB=g.append("g").attr("clip-path",`url(#${cid})`).selectAll("path").data(N40.links).join("path").attr("d",band)
    .attr("fill",l=>`url(#${pid}-${l.idx})`).style("mix-blend-mode","multiply");
  const LH=g.append("g").attr("clip-path",`url(#${cid})`).selectAll("path").data(N40.links).join("path").attr("d",band)
    .attr("fill","transparent").attr("stroke","transparent").attr("stroke-width",8).style("cursor","pointer");
  // Nodes ultra-esvelts arrodonits (3,5 px en lloc de blocs negres pesants)
  const ND=g.append("g").selectAll("rect").data(N40.nodes).join("rect")
    .attr("x",d=>d.x).attr("y",d=>d.y0).attr("width",nw).attr("height",d=>d.h)
    .attr("rx",nw/2).attr("ry",nw/2).attr("fill",d=>d.col===2?d.c:d.col===1?C.ink:d.c).attr("fill-opacity",.88);

  // Etiquetes netes
  const LG=g.append("g");
  const pct=v=>f0(v/N40.T*100)+" %";
  function labelsCol(col,side){
    const it=col.map(nd=>({nd,y:(nd.y0+nd.y1)/2}));
    separate(it,mob?30:34,m.t+8,h-m.b-22);
    it.forEach(o=>{
      const nd=o.nd, xx=side==="l"?nd.x-10:side==="r"?nd.x+nw+10:nd.x+nw/2;
      const a=side==="l"?"end":side==="r"?"start":"middle";
      const q=LG.append("g").datum(nd).attr("class","ibx-nl");
      if(Math.abs(o.ly-o.y)>4&&side!=="m")q.append("path").attr("d",`M${side==="l"?nd.x-2:nd.x+nw+2},${o.y}L${xx+(side==="l"?4:-4)},${o.ly-3}`).attr("stroke",C.hair).attr("stroke-width",.8).attr("fill","none");
      lab(q,xx,o.ly-4,mob?nd.ts:nd.t,{size:12.5,weight:700,anchor:a,fill:nd.col===2&&(nd.id==="atm"||nd.id==="ocean")?nd.c:C.ink});
      lab(q,xx,o.ly+11,`${f0(nd.v)} GtC · ${pct(nd.v)}`,{size:11.5,anchor:a,fill:C.muted});
    });
  }
  if(!mob){ labelsCol(N40.src,"l"); labelsCol(N40.dst,"r"); }
  else { labelsCol(N40.src,"r"); labelsCol(N40.dst,"l"); }
  N40.per.forEach(nd=>{
    const q=LG.append("g").datum(nd).attr("class","ibx-nl");
    lab(q,nd.x+nw/2,nd.y0-9,mob?nd.ts:`${nd.t} · ${f0(nd.v)} GtC`,{size:12,weight:700,anchor:"middle",fill:C.ink});
  });
  if(!mob){
    const p2=N40.per[2], p0=N40.per[0];
    V.note(LG,{x:p2.x+nw/2,y:p2.y1+5,tx:p2.x+nw/2+34,ty:p2.y1+32,kind:"curve",anchor:"start",
      lines:[[`${f1(p2.v/p2.yrs)} GtC l'any`,true],[`${f0(p2.v/p2.yrs/(p0.v/p0.yrs))} vegades el ritme de ${p0.t}`]]});
  }
  if(!mob){
    [["D'on surt",X[0]-10,"end"],["Quan",X[1]+nw/2,"middle"],["On va",X[2]+nw+10,"start"]]
      .forEach(([t,xx,a])=>V.t(g,xx,14,t,{size:11.5,fill:C.muted,anchor:a}));
  }

  // Micro-traços corbats de seda (estil IB-28: esteles corbes suaus, moviment lent i hipnòtic)
  const NS=64, dens=(mob?360:720)/N40.T, rnd=V.rng(40);
  const bez=(a,b,c2,d,t)=>{ const u=1-t; return u*u*u*a+3*u*u*t*b+3*u*t*t*c2+t*t*t*d; };
  N40.links.forEach(l=>{
    l.LX=new Float32Array(NS+1); l.LY=new Float32Array(NS+1);
    for(let i=0;i<=NS;i++){ const t=i/NS; l.LX[i]=bez(l.x0,l.xm,l.xm,l.x1,t); l.LY[i]=bez(l.sy,l.sy,l.ty,l.ty,t); }
    const nP=Math.max(2,Math.round(l.v*dens));
    l.pt=new Float32Array(nP); l.po=new Float32Array(nP); l.ps=new Float32Array(nP); l.pl=new Float32Array(nP); l.pw=new Float32Array(nP);
    for(let i=0;i<nP;i++){
      l.pt[i]=rnd();
      l.po[i]=(.08+rnd()*.84)*l.w;
      l.ps[i]=(.75+rnd()*.5)*.00003*(160/Math.max(120,l.x1-l.x0));
      l.pl[i]=.038+rnd()*.042;
      l.pw[i]=.85+rnd()*.65;
    }
  });
  function sampleP(l,t,off){
    const f=cl01(t)*NS, k=f|0, u=f-k, k1=k<NS?k+1:NS;
    return [l.LX[k]+(l.LX[k1]-l.LX[k])*u, l.LY[k]+(l.LY[k1]-l.LY[k])*u+off];
  }
  let foc=null, rev=1;
  function drawP(){
    ctx.clearRect(0,0,w,h);
    ctx.lineCap="round"; ctx.lineJoin="round";
    const xMax=m.l+(w-m.l-m.r)*rev+nw;
    for(const l of N40.links){
      const baseA=foc?(foc.has(l)?.88:.24):(l.t.col===2?.76:.52);
      ctx.strokeStyle=l.sc; ctx.fillStyle=l.sc;
      const pt=l.pt, po=l.po, pl=l.pl, pw=l.pw;
      for(let i=0;i<pt.length;i++){
        const t1=pt[i], t0=Math.max(0,t1-pl[i]);
        const pHead=sampleP(l,t1,po[i]);
        if(pHead[0]>xMax||t1-t0<.004)continue;
        const fade=smooth(t1,0,.09)*smooth(1-t1,0,.09);
        const a=baseA*fade;
        if(a<.03)continue;
        // Estela corba suau de 4 segments seguint exactament la Bézier
        ctx.globalAlpha=a*.62; ctx.lineWidth=pw[i];
        ctx.beginPath();
        const p0=sampleP(l,t0,po[i]), p1=sampleP(l,t0+(t1-t0)*.35,po[i]), p2=sampleP(l,t0+(t1-t0)*.7,po[i]);
        ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.lineTo(pHead[0],pHead[1]);
        ctx.stroke();
        // Puntet lluminós al capdavant perquè el sentit del flux es llegeixi fins i tot congelat
        ctx.globalAlpha=a;
        ctx.beginPath(); ctx.arc(pHead[0],pHead[1],pw[i]*.78,0,6.2832); ctx.fill();
      }
    }
    ctx.globalAlpha=1;
  }
  const move=dt=>{ for(const l of N40.links){ const pt=l.pt, ps=l.ps; for(let i=0;i<pt.length;i++){ let t=pt[i]+dt*ps[i]; if(t>1)t-=1; pt[i]=t; } } };
  el.__f=el.__f||[0,0]; el.__loop=V.loop(el,tm(el,(t,dt)=>{ if(run40&&!V.reduced){ move(dt); drawP(); } else if(rev<1)drawP(); }));

  // Hover suau: camí sencer + lectura en 1 línia ancorada a sota
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const pathOf=o=>{
    const S=new Set();
    if(o.s){ S.add(o); if(o.t.col===1)o.t.out.forEach(l=>S.add(l)); if(o.s.col===1)o.s.in.forEach(l=>S.add(l)); }
    else { o.in.forEach(l=>S.add(l)); o.out.forEach(l=>S.add(l)); }
    return S;
  };
  const hv=hvLayer(s); ND.style("cursor","pointer");
  const reset40=()=>{ foc=null; tp.hide(); hv.selectAll("*").remove(); fo(LB,null); fo(ND,null); fo(LG.selectAll(".ibx-nl"),null); drawP(); };
  let curD=null;
  V.hover(s.node(),(ev,[px,py])=>{
    const d=d3.select(ev.target).datum();
    if(!d||(!d.s&&d.col==null)){ if(foc){ curD=null; reset40(); } return; }
    foc=pathOf(d);
    if(curD!==d){
      curD=d; hv.selectAll("*").remove();
      if(d.s){
        hv.append("path").attr("d",band(d)).attr("fill",d.c).attr("fill-opacity",.18).attr("stroke",d.sc).attr("stroke-width",1.2).attr("stroke-opacity",.75);
        const share=d.v/(d.s.col===0?d.t.v:d.s.v)*100;
        lab(hv,d.xm,(d.sy+d.ty)/2+d.w/2+4,`${f0(d.v)} GtC (${f0(share)} %)`,{size:12.5,weight:700,anchor:"middle",fill:C.ink});
      }
    }
    fo(LB,l=>foc.has(l),.48);
    fo(ND,nd=>d.s?(nd===d.s||nd===d.t||(d.t.col===1&&d.t.out.some(l=>l.t===nd))||(d.s.col===1&&d.s.in.some(l=>l.s===nd))):(nd===d||d.in.some(l=>l.s===nd)||d.out.some(l=>l.t===nd)),.48);
    fo(LG.selectAll(".ibx-nl"),nd=>[...foc].some(l=>l.s===nd||l.t===nd),.48);
    if(d.s){
      const share=d.v/(d.s.col===0?d.t.v:d.s.v)*100;
      tp.show(`<b>${d.s.t} → ${d.t.t}</b> · ${f1(d.v)} GtC (${f0(share)} % de ${d.s.col===0?d.t.t:d.s.t})`,px,py);
    } else {
      tp.show(`<b>${d.t}</b> · ${f1(d.v)} GtC (${pct(d.v)} del total${d.yrs?` · ${f1(d.v/d.yrs)} GtC/any`:""})`,px,py);
    }
    if(V.reduced||!run40)drawP();
  },()=>{ curD=null; reset40(); });

  intro(el,()=>{ clip.attr("width",0); rev=0; LG.style("opacity",0); ND.attr("height",0); },inst=>{
    if(inst){ clip.attr("width",w); rev=1; LG.style("opacity",1); ND.attr("height",d=>d.h); drawP(); return; }
    ND.transition().delay(d=>d.col*280).duration(550).ease(EIO).attr("height",d=>d.h);
    clip.transition().duration(1400).ease(EIO).attr("width",w);
    d3.transition().duration(1400).ease(EIO).tween("rev",()=>t=>{ rev=t; });
    LG.transition().delay(850).duration(600).style("opacity",1);
  });
});
(function(){ const b=$('[data-play="40"]'); if(!b)return; if(V.reduced){ b.style.display="none"; return; }
  b.addEventListener("click",()=>{ run40=!run40; b.textContent=run40?"Atura els fils":"Torna a moure els fils"; b.setAttribute("aria-pressed",!run40); }); void M40; })();

/* =====================================================================
   IB-41 · CONSTEL·LACIÓ DE CERCLES TRANSLÚCIDS  (dades reals: IHME GBD, morts per causa)
   Cercles plens d'aquarel·la translúcids (`radialGradient` + `multiply`) agrupats en
   4 constel·lacions suaus, sense vores dures ni punts que embrutin el text. Clic en
   un grup per fer-hi zoom suau.
   ===================================================================== */
const GRP41=[
  {id:"ncd",t:"Malalties no transmissibles",ts:"No transmissibles",c:C.blau,tc:C.blau},
  {id:"inf",t:"Infeccions, maternes i nadons",ts:"Infeccions i nadons",c:C.groc,cs:C.grocFosc,tc:C.ink},
  {id:"inj",t:"Lesions i violència",ts:"Lesions i violència",c:C.vermell,tc:C.vermell},
  {id:"oth",t:"Altres causes",ts:"Altres causes",c:C.muted,tc:C.ink2}
];
let yr41="2023", zoom41=null;
function tree41(yr){
  const idx=yr==="2019"?3:4, M=(DA.mort||{c:[]}).c;
  const root={id:"root",children:GRP41.map(gp=>({id:gp.id,gp,children:M.filter(c=>c[2]===gp.id).map(c=>({id:c[0],t:c[0],ts:c[1],gp,v:c[idx],v19:c[3],v23:c[4]}))}))};
  return d3.hierarchy(root).sum(d=>d.children?0:Math.max(0,d.v)).sort((a,b)=>b.value-a.value);
}
legend(41,el=>{
  V.legendCat(el,GRP41.map(gp=>({c:gp.c,a:.45,t:gp.ts||gp.t})));
  V.legendCat(el,[{t:"Àrea proporcional a les morts · clica un grup per fer-hi zoom",kind:"none"}]);
});
const M41=piece(41,(el,w)=>{
  const mob=w<640, Dm=Math.min(w-(mob?12:180),mob?w-12:520);
  const H=tree41(yr41); d3.pack().size([1000,1000]).padding(d=>d.depth===0?38:7)(H);
  const gx0=d3.min(H.children,c=>c.x-c.r), gx1=d3.max(H.children,c=>c.x+c.r), gy0=d3.min(H.children,c=>c.y-c.r), gy1=d3.max(H.children,c=>c.y+c.r);
  const dH=Math.max(gx1-gx0,gy1-gy0)*(1+48/Dm), HOME=[(gx0+gx1)/2,(gy0+gy1)/2,dH];
  const h=Math.round(Math.min(mob?420:510,(gy1-gy0)*Dm/dH+(mob?84:96)));
  d3.select(el).selectAll("canvas.ibv,svg.ibv").remove(); el.style.height="";
  const s=V.svg(el,w,h,`Constel·lació de cercles translúcids amb les morts del món el ${yr41} per causa, agrupades en malalties no transmissibles, infeccions, lesions i altres causes. Àrea proporcional al nombre de morts. Clica un grup per fer-hi zoom. Dades reals de l'IHME.`);
  const defs=s.append("defs"), uid="w41"+Math.random().toString(36).slice(2,6);
  // Gradients radials suaus d'aquarel·la per a les 4 famílies (halo de grup + cercle de causa)
  GRP41.forEach(gp=>{
    const col=gp.c;
    const rgG=defs.append("radialGradient").attr("id",`${uid}-g-${gp.id}`);
    rgG.append("stop").attr("offset","0%").attr("stop-color",col).attr("stop-opacity",gp.id==="inf"?.11:.07);
    rgG.append("stop").attr("offset","78%").attr("stop-color",col).attr("stop-opacity",gp.id==="inf"?.06:.035);
    rgG.append("stop").attr("offset","100%").attr("stop-color",col).attr("stop-opacity",0);
    const rgL=defs.append("radialGradient").attr("id",`${uid}-l-${gp.id}`).attr("cx","38%").attr("cy","34%").attr("r","68%");
    const aHi=gp.id==="inf"?.56:gp.id==="oth"?.30:.44, aLo=gp.id==="inf"?.30:gp.id==="oth"?.16:.22;
    rgL.append("stop").attr("offset","0%").attr("stop-color",col).attr("stop-opacity",aHi);
    rgL.append("stop").attr("offset","100%").attr("stop-color",col).attr("stop-opacity",aLo);
  });
  defs.append("clipPath").attr("id",uid+"-c").append("rect").attr("width",w).attr("height",h);
  const g=s.append("g").attr("clip-path",`url(#${uid}-c)`);
  const OX=(w-Dm)/2, OY=h/2-Dm/2+4;
  const leaves=H.leaves(), grps=H.children, TOT=d3.sum(leaves,l=>l.data.v);
  let view=zoom41?[zoom41.x,zoom41.y,zoom41.r*2.18*Math.max(1,Dm/h)]:HOME, grow=1, foc=null;
  const Pt=(x,y)=>{ const kk=Dm/view[2]; return [OX+Dm/2+(x-view[0])*kk,OY+Dm/2+(y-view[1])*kk]; };

  // 1. Aures suaus dels 4 grups (sense parets gruixudes de placa de Petri)
  const GC=g.append("g").selectAll("circle").data(grps).join("circle")
    .attr("fill",d=>`url(#${uid}-g-${d.data.gp.id})`)
    .attr("stroke",d=>d.data.gp.cs||d.data.gp.c).attr("stroke-width",.7).attr("stroke-opacity",.22)
    .attr("stroke-dasharray","3 4").style("cursor","pointer");

  // 2. Cercles translúcids d'aquarel·la per a cada causa (zero puntets darrere el text!)
  const LC=g.append("g").selectAll("circle").data(leaves).join("circle")
    .attr("fill",d=>`url(#${uid}-l-${d.data.gp.id})`)
    .attr("stroke",d=>d.data.gp.cs||d.data.gp.c).attr("stroke-width",.7).attr("stroke-opacity",.32)
    .style("mix-blend-mode","multiply").style("cursor","pointer");

  // 3. Etiquetes netes dins de cada causa (100 % llegibles sobre l'aquarel·la suau)
  const LL=g.append("g").selectAll("g").data(leaves).join("g").style("pointer-events","none");
  LL.each(function(d){
    const q=d3.select(this);
    d.ls=[0,1,2].map(i=>lab(q,0,0,"",{size:i<2?(mob?11.5:12.5):11.5,weight:i<2?600:400,anchor:"middle",fill:i<2?C.ink:C.ink2,halo:2.5}));
  });

  // 4. Etiquetes horitzontals netes dels 4 grups (mai text corbat de costat!)
  const GL=g.append("g").style("pointer-events","none");
  const wch=(t,sz)=>t.length*sz*.53;
  const hv=hvLayer(g);

  function drawGroupLabs(kk){
    GL.selectAll("*").remove();
    if(zoom41){
      const gp=zoom41.data.gp;
      V.t(GL,14,22,`${gp.t} · ${f1(zoom41.value/1e6)} M (${f0(zoom41.value/TOT*100)} %)`,{size:mob?13:15,serif:true,weight:600,fill:gp.tc,halo:3.5});
      return;
    }
    const [hcX,hcY]=Pt(HOME[0],HOME[1]);
    grps.forEach(d=>{
      const [cx,cy]=Pt(d.x,d.y), r=d.r*kk*grow;
      const gp=d.data.gp, ttl=`${mob?gp.ts:gp.t}`, sub=`${f1(d.value/1e6)} M · ${f0(d.value/TOT*100)} %`;
      if(!mob){
        if(gp.id==="oth")return; // «Altres causes» ja porta el nom i la xifra dins del cercle
        const right=cx>=hcX-12, down=cy>hcY+24;
        const ex=cx+(right?1:-1)*r*.84, ey=cy+(down?.52:-.68)*r;
        const tx=Math.max(12,Math.min(w-12,cx+(right?1:-1)*(r+22))), ty=Math.max(20,Math.min(h-26,ey+(down?14:-14)));
        GL.append("line").attr("x1",ex).attr("y1",ey).attr("x2",tx+(right?-4:4)).attr("y2",ty-2)
          .attr("stroke",gp.cs||gp.c).attr("stroke-width",.8).attr("stroke-opacity",.55);
        const anc=right?"start":"end";
        V.t(GL,tx,ty-4,ttl,{size:12.5,weight:700,fill:gp.tc,anchor:anc,halo:3.5});
        V.t(GL,tx,ty+11,sub,{size:11.5,fill:C.muted,anchor:anc,halo:3.5});
      } else {
        // Mòbil: 4 posicions dedicades que no es trepitgen mai entre si ni sobre altres grups
        if(gp.id==="ncd") V.t(GL,6,18,`No transmissibles · ${f1(d.value/1e6)} M`,{size:11.5,weight:700,fill:gp.tc,anchor:"start",halo:3.5});
        else if(gp.id==="inj") V.t(GL,w-6,18,`Lesions · ${f1(d.value/1e6)} M`,{size:11.5,weight:700,fill:gp.tc,anchor:"end",halo:3.5});
        else if(gp.id==="inf") V.t(GL,w-6,Math.min(h-12,cy+r+16),`Infeccions · ${f1(d.value/1e6)} M`,{size:11.5,weight:700,fill:gp.tc,anchor:"end",halo:3.5});
        else V.t(GL,Math.max(60,Math.min(w-60,cx)),Math.min(h-12,cy+r+16),`Altres · ${f1(d.value/1e6)} M`,{size:11.5,weight:700,fill:gp.tc,anchor:"middle",halo:3.5});
      }
    });
  }

  function render(){
    const kk=Dm/view[2];
    GC.attr("cx",d=>Pt(d.x,d.y)[0]).attr("cy",d=>Pt(d.x,d.y)[1]).attr("r",d=>d.r*kk*grow);
    LC.attr("cx",d=>Pt(d.x,d.y)[0]).attr("cy",d=>Pt(d.x,d.y)[1]).attr("r",d=>d.r*kk*grow);
    LL.attr("transform",d=>{ const [x,y]=Pt(d.x,d.y); return `translate(${x},${y-2})`; }).each(function(d){
      const r=d.r*kk*grow, t=d.data.t, ts=d.data.ts; let L=null;
      if(r>(mob?20:17)){
        if(wch(t,12)<1.82*r)L=[t];
        else if(wch(ts,12)<1.88*r)L=[ts];
        else if(r>30){
          const wds=t.split(" "), k=Math.ceil(wds.length/2), a=wds.slice(0,k).join(" "), b=wds.slice(k).join(" ");
          if(b&&Math.max(wch(a,12),wch(b,12))<1.75*r)L=[a,b];
        }
      }
      const show=!!L; if(show&&r>(L.length>1?38:26))L.push(`${f1(d.data.v/1e6)} M`);
      const n=show?L.length:0;
      d.ls.forEach((tx,i)=>tx.text(i<n?L[i]:"").attr("y",(i-(n-1)/2)*14+4));
      d3.select(this).style("visibility",show?null:"hidden");
    });
    drawGroupLabs(kk);
    drawHv();
  }

  function drawHv(){
    hv.selectAll("*").remove();
    if(!foc){
      LC.style("opacity",1); GC.style("opacity",1); LL.style("opacity",1); GL.style("opacity",1);
      return;
    }
    const isHit=d=>foc.depth===2?(d===foc):(d.parent===foc);
    LC.style("opacity",d=>isHit(d)?1:.48);
    GC.style("opacity",d=>(foc.depth===1?d===foc:d===foc.parent)?1:.52);
    LL.style("opacity",d=>isHit(d)?1:.5);
    GL.style("opacity",.55);
    const kk=Dm/view[2], [cx,cy]=Pt(foc.x,foc.y), R=foc.r*kk*grow;
    hv.append("circle").attr("cx",cx).attr("cy",cy).attr("r",R+1).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
    if(foc.depth===2&&R<26){
      const nm=foc.data.t, val=`${f1(foc.data.v/1e6)} M`;
      V.t(hv,Math.max(66,Math.min(w-66,cx)),Math.max(16,cy-R-8),`${nm} · ${val}`,{size:12,weight:700,fill:C.ink,anchor:"middle",halo:3.5});
    }
  }

  el.__render=render;
  function zoomTo(nd){
    zoom41=nd&&nd!==H?nd:null;
    const target=zoom41?[nd.x,nd.y,nd.r*2.18*Math.max(1,Dm/h)]:HOME;
    const b=$('[data-zoom41]'); if(b)b.style.visibility=zoom41?"visible":"hidden";
    if(V.reduced){ view=target; render(); return; }
    const I=d3.interpolateZoom(view,target);
    d3.select(el).transition("z").duration(Math.min(1200,Math.max(650,I.duration*.85))).ease(EIO).tween("z",()=>t=>{ view=I(t); render(); });
  }
  el._zoom=zoomTo;
  let prevFoc=null;
  s.on("pointerdown.z",()=>{ prevFoc=foc; });
  s.on("click",ev=>{
    const [px,py]=d3.pointer(ev,s.node()), d=pick(px,py);
    if(!d){ if(zoom41)zoomTo(null); return; }
    if(ev.pointerType&&ev.pointerType!=="mouse"&&d!==prevFoc)return;
    const gpn=d.depth===1?d:d.parent; if(zoom41===gpn)zoomTo(null); else zoomTo(gpn);
  });

  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const pick=(px,py)=>{
    const kk=Dm/view[2];
    let L=null, bd=1e9;
    leaves.forEach(l=>{ if(!l.data.v)return; const [cx,cy]=Pt(l.x,l.y), dd=Math.hypot(px-cx,py-cy)-l.r*kk*grow; if(dd<6&&dd<bd){ bd=dd; L=l; } });
    if(L&&bd<=0)return L;
    const Gp=grps.find(gp=>{ const [cx,cy]=Pt(gp.x,gp.y); return Math.hypot(px-cx,py-cy)<gp.r*kk*grow+4; });
    return L||Gp||null;
  };
  V.hover(s.node(),(ev,[px,py])=>{
    const d=pick(px,py);
    if(!d){ if(foc){ foc=null; drawHv(); } tp.hide(); return; }
    if(foc!==d){ foc=d; drawHv(); }
    if(d.depth===2){
      const o=d.data, other=yr41==="2019"?o.v23:o.v19;
      tp.show(`<b>${o.t}</b> · ${f2(o.v/1e6)} M (${f1(o.v/TOT*100)} % del total el ${yr41} · ${yr41==="2019"?"2023":"2019"}: ${f2(other/1e6)} M)`,px,py);
    } else {
      tp.show(`<b>${d.data.gp.t}</b> · ${f1(d.value/1e6)} M (${f0(d.value/TOT*100)} % del total) · ${zoom41===d?"Clica fora per tornar":"Clica per fer-hi zoom"}`,px,py);
    }
  },()=>{ foc=null; tp.hide(); drawHv(); });

  render();
  intro(el,()=>{ grow=0; render(); },inst=>{
    if(inst||V.reduced){ grow=1; render(); return; }
    d3.select(el).transition("g").duration(1000).ease(d3.easeCubicOut).tween("g",()=>t=>{ grow=t; render(); });
  });
  el.__morph=(prev)=>{
    if(!prev||V.reduced)return;
    const P=new Map(); prev.forEach(p=>P.set(p.id,p));
    const all=leaves.concat(grps), tgt=all.map(n=>({x:n.x,y:n.y,r:n.r}));
    d3.select(el).transition("m").duration(950).ease(EIO).tween("m",()=>t=>{
      all.forEach((n,i)=>{ const p=P.get(n.data.id)||{x:tgt[i].x,y:tgt[i].y,r:0}; n.x=p.x+(tgt[i].x-p.x)*t; n.y=p.y+(tgt[i].y-p.y)*t; n.r=p.r+(tgt[i].r-p.r)*t; });
      render();
    });
  };
  el.__snap=()=>leaves.concat(grps).map(n=>({id:n.data.id,x:n.x,y:n.y,r:n.r}));
});
segs(41,k=>{ const el=$('[data-p="41"]'); const prev=el&&el.__snap?el.__snap():null; yr41=k; zoom41=null;
  const b=$('[data-zoom41]'); if(b)b.style.visibility="hidden"; M41.redraw(); if(el&&el.__morph)el.__morph(prev); });
(function(){ const b=$('[data-zoom41]'); if(b){ b.style.visibility="hidden"; b.addEventListener("click",()=>{ const el=$('[data-p="41"]'); if(el&&el._zoom)el._zoom(null); }); } })();

/* =====================================================================
   IB-42 · PENDENTS  (dades reals: IHME GBD, 2019 → 2023)
   ===================================================================== */
let mode42="pct";
const C42=((DA.mort||{c:[]}).c).filter(c=>c[2]!=="oth").map(c=>({t:c[0],ts:c[1],a:c[3],b:c[4]}));
const T42=(DA.mort||{tot:{}}).tot;
legend(42,el=>V.legendCat(el,[{c:C.vermell,t:"Puja",kind:"line",w:1.6},{c:C.blau,t:"Baixa",kind:"line",w:1.6},{c:C.ghost,t:"Gairebé igual (menys d'un 3 %)",kind:"line",w:1.6}]));
const M42=piece(42,(el,w)=>{
  const mob=w<640, n=C42.length, gap=mob?14:15;
  const m={t:40,b:mob?40:56,l:mob?62:270,r:mob?150:270};
  const h=mob?600:680;
  const s=V.svg(el,w,h,"Gràfic de pendents amb 26 causes de mort entre el 2019 i el 2023, en percentatge del total i en escala logarítmica. La COVID-19 passa de zero a l'1,4 %; els desastres naturals es multipliquen per nou; la diarrea, la tuberculosi, el VIH i els trastorns neonatals baixen. Dades reals de l'IHME.");
  const g=s.append("g");
  const xL=m.l, xR=w-m.r, yB=h-m.b-30, yZ=h-m.b+2;
  const val=(d,yr)=>mode42==="pct"?(yr?d.b/T42["2023"]:d.a/T42["2019"])*100:(yr?d.b:d.a)/1e6;
  const dom=mode42==="pct"?[.015,40]:[.008,25];
  const y=d3.scaleLog(dom,[yB,m.t]);
  const Y=v=>v<=0?yZ:y(v);
  const fv=v=>v<=0?"0":mode42==="pct"?(v<1?f2(v):f1(v))+" %":(v<1?f2(v):f1(v))+" M";
  const col=d=>d.a<=0?C.vermell:d.b/d.a>1.03?C.vermell:d.b/d.a<.97?C.blau:C.ghost;
  C42.forEach(d=>{ d.y0=Y(val(d,0)); d.y1=Y(val(d,1)); });
  // quadrícula logarítmica
  const ax=g.append("g");
  const ticks=[.1,1,10];
  ticks.forEach(v=>{ ax.append("line").attr("x1",xL).attr("x2",xR).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.grid);
    V.t(ax,(xL+xR)/2,y(v)-4,mode42==="pct"?`${V.fmt(",~g")(v)} %`:`${V.fmt(",~g")(v)} milions`,{size:11.5,fill:C.muted,anchor:"middle"}); });
  ax.append("line").attr("x1",xL).attr("x2",xR).attr("y1",yZ).attr("y2",yZ).attr("stroke",C.grid).attr("stroke-dasharray","2 3");
  V.t(ax,(xL+xR)/2,yZ+14,"zero (fora de l'escala)",{size:11.5,fill:C.muted,anchor:"middle",italic:true});
  [["2019",xL],["2023",xR]].forEach(([t,xx])=>{ V.t(ax,xx,16,t,{serif:true,weight:600,size:17,anchor:"middle"}); ax.append("line").attr("x1",xx).attr("x2",xx).attr("y1",26).attr("y2",yZ).attr("stroke",C.hair); });
  // etiquetes separades
  const L=C42.map(d=>({d,y:d.y0})), R=C42.map(d=>({d,y:d.y1}));
  separate(L,gap,m.t-2,yZ); separate(R,gap,m.t-2,yZ+4);
  const LN=g.append("g").selectAll("g").data(C42).join("g").attr("class","ibx-ln");
  LN.append("path").attr("class","ln").attr("d",d=>`M${xL},${d.y0}L${xR},${d.y1}`).attr("fill","none").attr("stroke",col).attr("stroke-width",d=>col(d)===C.ghost?1.2:1.6)
    .attr("stroke-dasharray",d=>d.a<=0?"4 3":null);
  LN.append("circle").attr("class","d0").attr("cx",xL).attr("cy",d=>d.y0).attr("r",2.8).attr("fill",col);
  LN.append("circle").attr("class","d1").attr("cx",xR).attr("cy",d=>d.y1).attr("r",2.8).attr("fill",col);
  LN.append("path").attr("class","hit").attr("d",d=>`M${xL},${d.y0}L${xR},${d.y1}`).attr("stroke","transparent").attr("stroke-width",10).attr("fill","none");
  const LT=g.append("g").selectAll("g").data(L).join("g").attr("class","ibx-lt");
  LT.each(function(o){ const q=d3.select(this), d=o.d;
    if(Math.abs(o.ly-o.y)>2)q.append("path").attr("d",`M${xL-5},${o.y}L${xL-26},${o.ly-4}L${xL-29},${o.ly-4}`).attr("stroke",C.ghost).attr("fill","none");
    lab(q,xL-32,o.ly,mob?fv(val(d,0)):`${d.t}  ${fv(val(d,0))}`,{size:12,anchor:"end",fill:C.ink}); });
  const RT=g.append("g").selectAll("g").data(R).join("g").attr("class","ibx-lt");
  RT.each(function(o){ const q=d3.select(this), d=o.d;
    if(Math.abs(o.ly-o.y)>2)q.append("path").attr("d",`M${xR+5},${o.y}L${xR+26},${o.ly-4}L${xR+29},${o.ly-4}`).attr("stroke",C.ghost).attr("fill","none");
    const t=q.append("text").attr("x",xR+32).attr("y",o.ly).attr("font-size",12).style("font-variant-numeric","tabular-nums").call(V.halo,3);
    t.append("tspan").attr("font-weight",700).attr("fill",col(o.d)===C.ghost?C.ink:col(o.d)).text(fv(val(d,1)));
    t.append("tspan").attr("fill",C.ink).text("  "+(mob?d.ts:d.t)); });
  // anotacions
  const an=g.append("g");
  const cov=C42.find(d=>d.a<=0), dis=C42.reduce((a,b)=>(b.a>0&&b.b/b.a>a.b/a.a)?b:a);
  void cov;
  if(dis&&!mob){ const u=.62, xx=xL+(xR-xL)*u, yy=dis.y0+(dis.y1-dis.y0)*u;
    V.note(an,{x:xx,y:yy+3,tx:xx+(mob?-8:24),ty:yy+(mob?34:34),kind:"elbow",anchor:mob?"end":"start",lines:[[`${dis.t}: ×${f0(dis.b/dis.a)}`,true],[`${f0(dis.a/1000)} mil → ${f0(dis.b/1000)} mil morts`]]}); }
  // hover: la línia es fa gruixuda i passa al davant; guies horitzontals fins als dos eixos amb el valor en negreta; canvi al mig
  const hv=hvLayer(s), tp=V.tip(el); let cur=null;
  s.style("cursor","crosshair");
  const off=()=>{ cur=null; tp.hide(); hv.selectAll("*").remove(); fo(LN,null); fo(LT,null); fo(RT,null); dimTo(an,1);
    LN.select(".ln").attr("stroke-width",d=>col(d)===C.ghost?1.2:1.6); LN.selectAll("circle.d0,circle.d1").attr("r",2.8); };
  const on=d=>{ cur=d; const f=x=>(x.d||x)===d; fo(LN,f); fo(LT,f,.2); fo(RT,f,.2); dimTo(an,.1);
    LN.select(".ln").attr("stroke-width",x=>x===d?3:col(x)===C.ghost?1.2:1.6); LN.selectAll("circle.d0,circle.d1").attr("r",x=>x===d?4.5:2.8);
    LN.filter(x=>x===d).raise();
    hv.selectAll("*").remove();
    const c0=col(d)===C.ghost?C.ink:col(d), a=val(d,0), b=val(d,1);
    [[xL,d.y0,a],[xR,d.y1,b]].forEach(([xx,yy,v])=>{
      hv.append("line").attr("x1",xL).attr("x2",xR).attr("y1",yy).attr("y2",yy).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","2 3").attr("stroke-opacity",.5);
      hv.append("rect").attr("x",xx-28).attr("y",yy-24).attr("width",56).attr("height",16).attr("fill",C.paper);
      axTag(hv,xx,yy-11,fv(v),{halo:false}); });
    const mx=(xL+xR)/2, my=(d.y0+d.y1)/2;
    const ch=d.a>0?`${d.b>=d.a?"+":"−"}${f0(Math.abs(d.b/d.a-1)*100)} %`:"nova";
    lab(hv,mx,my-8,`${mob?"":d.t+": "}${ch}`,{size:13,weight:700,anchor:"middle",fill:c0===C.groc?C.ink:c0});
  };
  V.hover(s.node(),(ev,[px,py])=>{
    let d=d3.select(ev.target).datum(); if(d&&d.d)d=d.d;
    if(!d||!d.t){ // la línia més propera a l'altura del punter
      if(px<xL-12||px>xR+12){ if(cur)off(); return; }
      const u=Math.max(0,Math.min(1,(px-xL)/(xR-xL))); d=d3.least(C42,c=>Math.abs(c.y0+(c.y1-c.y0)*u-py)); }
    if(d!==cur)on(d);
    const a=val(d,0), b=val(d,1), rk=C42.slice().sort((p,q)=>q.b-p.b).indexOf(d)+1;
    tp.show(`<b>${d.t}</b><br>2019: ${fv(a)} · 2023: ${fv(b)}<br>${d.a>0?`${d.b>=d.a?"+":"−"}${f0(Math.abs(d.b/d.a-1)*100)} % de morts (${f2(d.a/1e6)} → ${f2(d.b/1e6)} M)`:`${f2(d.b/1e6)} milions de morts el 2023`}<br>${rk}a causa de les ${C42.length} el 2023`,px,py);
  },off);
  const anim=inst=>{
    if(inst){ LN.select(".ln").attr("stroke-dashoffset",null).style("opacity",1); RT.style("opacity",1); an.style("opacity",1); LN.select(".d1").attr("r",2.8); return; }
    LN.select(".ln").each(function(d){ const L0=this.getTotalLength(); d3.select(this).attr("stroke-dasharray",d.a<=0?"4 3":`${L0} ${L0}`).attr("stroke-dashoffset",d.a<=0?0:L0).style("opacity",d.a<=0?0:1); })
      .transition().delay((d,i)=>i*45).duration(1000).ease(EIO).attr("stroke-dashoffset",0).style("opacity",1)
      .on("end",function(d){ if(d.a>0)d3.select(this).attr("stroke-dasharray",null); });
    LN.select(".d1").attr("r",0).transition().delay((d,i)=>i*45+900).duration(300).attr("r",2.8);
    RT.style("opacity",0).transition().delay((d,i)=>i*45+900).duration(400).style("opacity",1);
    an.style("opacity",0).transition().delay(2200).duration(500).style("opacity",1);
  };
  if(el.__again){ el.__again=false; g.style("opacity",.0).transition().duration(500).style("opacity",1); }
  else intro(el,()=>{ LN.select(".ln").style("opacity",0); RT.style("opacity",0); an.style("opacity",0); LN.select(".d1").attr("r",0); },anim);
});
segs(42,k=>{ mode42=k; const el=$('[data-p="42"]'); if(el)el.__again=!V.reduced; M42.redraw(); });

/* =====================================================================
   IB-43 · QUADRATS D'ESCALA  (dades reals: pols del Sàhara, Yu et al. 2015)
   ===================================================================== */
const Q43=(DA.pols||[]).map((p,i)=>({i,t:p[0],d:p[1],v:p[2]}));
legend(43,el=>{ const d=d3.select(el).append("div").attr("class","ibv-lg ibv-lg-cat");
  [[C.groc,"Pols (milions de tones l'any)",.3],[C.vermell,"Fòsfor que porta la pols",1]].forEach(([c,t,a])=>{ const sp=d.append("span"); const sv=sp.append("svg").attr("width",12).attr("height",12).style("margin-right","6px");
    sv.append("rect").attr("x",.5).attr("y",.5).attr("width",11).attr("height",11).attr("fill",V.alpha(c,a)).attr("stroke",c===C.groc?C.grocFosc:c); sp.append("span").text(t); });
  const sp=d.append("span"); const sv=sp.append("svg").attr("width",12).attr("height",12).style("margin-right","6px");
  sv.append("rect").attr("x",.5).attr("y",.5).attr("width",11).attr("height",11).attr("fill","none").attr("stroke",C.hair); sp.append("span").text("1 quadradet = 1 milió de tones"); });
const M43=piece(43,(el,w)=>{
  const mob=w<640, S=Math.round(mob?w-4:Math.min(470,w-330)), h=S+(mob?44:36), ox=mob?2:Math.max(2,(w-S-330)/2), oy=h-(mob?8:12)-S;
  const s=V.svg(el,w,h,"Quadrats niats a la cantonada, d'àrea proporcional a la quantitat: 182 milions de tones de pols surten d'Àfrica cada any, 132 arriben a mig oceà, 43 al Carib i 28 cauen a l'Amazònia. El fòsfor que porta aquesta pols, 22.000 tones, és un quadradet vermell gairebé invisible. Dades reals (Yu et al. 2015).");
  const g=s.append("g").attr("transform",`translate(${ox},${oy})`);
  const V0=Q43[0].v, side=d=>S*Math.sqrt(d.v/V0);
  // reixa: 1 quadradet = 1 milió de tones
  const u=S*Math.sqrt(1e6/V0), cid="c43"+Math.random().toString(36).slice(2,6);
  g.append("defs").append("clipPath").attr("id",cid).append("rect").attr("width",S).attr("height",S);
  const grid=g.append("g").attr("clip-path",`url(#${cid})`).attr("stroke",C.ink).attr("stroke-opacity",.08).attr("stroke-width",.6);
  let gp=""; for(let a=u;a<S;a+=u)gp+=`M${a.toFixed(1)},0V${S}M0,${(S-a).toFixed(1)}H${S}`; grid.append("path").attr("d",gp);
  const SQ=g.append("g").selectAll("rect").data(Q43).join("rect").attr("x",0)
    .attr("fill",d=>d.i===4?C.vermell:V.alpha(C.groc,.13)).attr("stroke",d=>d.i===4?C.vermell:C.grocFosc).attr("stroke-width",d=>d.i===0?1.2:1);
  const setSq=(sel,f)=>sel.attr("y",d=>S-side(d)*f(d)).attr("width",d=>Math.max(d.i===4?1.6:0,side(d)*f(d))).attr("height",d=>Math.max(d.i===4?1.6:0,side(d)*f(d)));
  setSq(SQ,()=>1);
  const hl=g.append("rect").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",2).style("display","none");
  // etiquetes
  const LB=g.append("g"), items=Q43.slice(0,4).map(d=>({d,y:S-side(d)}));
  const vtxt=d=>d.v>=1e6?`${f1(d.v/1e6)} milions de tones`:`${f0(d.v)} tones`;
  if(!mob){
    separate(items,36,-6,S-20);
    items.forEach(o=>{ const d=o.d, q=LB.append("g").datum(d).attr("class","ibx-q");
      q.append("path").attr("d",`M${side(d)},${o.y}H${S+10}${Math.abs(o.ly-o.y)>2?`L${S+16},${o.ly+3}`:""}H${S+20}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","1.5 2.5");
      q.d=d; d.n1=lab(q,S+24,o.ly+7,vtxt(d),{size:13,weight:700}); lab(q,S+24,o.ly+22,`${d.t}, ${d.d}`,{size:12.5,fill:C.ink2}); });
  } else {
    separate(items,32,4,S-50);
    items.forEach(o=>{ const d=o.d, q=LB.append("g").datum(d).attr("class","ibx-q");
      d.n1=lab(q,S-6,o.ly+15,vtxt(d),{size:12.5,weight:700,anchor:"end"}); lab(q,S-6,o.ly+29,d.t,{size:12,fill:C.ink2,anchor:"end"}); });
  }
  const P=Q43[4], pn=LB.append("g").datum(P).attr("class","ibx-q");
  V.note(pn,{x:4,y:S-4,tx:mob?24:30,ty:S-(mob?48:56),kind:"elbow",anchor:"start",lines:[[`Fòsfor: ${f0(P.v)} tones`,true],[`1 de cada ${f0(Q43[3].v/P.v)} tones de pols que cau`]]});
  // hover: el quadrat s'omple i agafa vora en tinta, la resta s'apaga; guia des de la cantonada fins a l'escala de valors
  const hv=hvLayer(g), tp=V.tip(el); let cur=null;
  s.style("cursor","pointer");
  const off=()=>{ cur=null; hl.style("display","none"); hv.selectAll("*").remove(); tp.hide(); fo(LB.selectAll(".ibx-q"),null); fo(SQ,null); dimTo(grid,1); };
  V.hover(s.node(),(ev,[px,py])=>{
    const lx=px-ox, ly=py-oy;
    let d=Q43.slice().reverse().find(q=>{ const sd=Math.max(side(q),q.i===4?16:0); return lx>=-4&&lx<=sd+3&&ly>=S-sd-3&&ly<=S+4; });
    const qn=ev.target.closest&&ev.target.closest(".ibx-q"); if(qn&&qn.__data__)d=qn.__data__;
    if(!d){ if(cur)off(); return; }
    const sd=Math.max(side(d),2), r0=d.v/V0;
    if(d!==cur){ cur=d;
      fo(SQ,x=>x===d||x.i===4&&d.i===3,.25); fo(LB.selectAll(".ibx-q"),x=>x===d,.25); dimTo(grid,.4);
      hl.style("display",null).attr("x",0).attr("y",S-sd).attr("width",sd).attr("height",sd).attr("stroke",d.i===4?C.vermell:C.ink).attr("stroke-width",2).raise();
      hv.selectAll("*").remove();
      if(d.i<4)hv.append("rect").attr("x",0).attr("y",S-sd).attr("width",sd).attr("height",sd).attr("fill",V.alpha(C.groc,.28));
      else hv.append("circle").attr("cx",1).attr("cy",S-1).attr("r",9).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.5);
      // guia: de la cantonada fins a la columna d'etiquetes (escriptori) o fins a la vora (mòbil)
      const gx=mob?S:S+18;
      hv.append("line").attr("x1",sd).attr("x2",gx).attr("y1",S-sd).attr("y2",S-sd).attr("stroke",C.ink).attr("stroke-width",1);
      hv.append("circle").attr("cx",sd).attr("cy",S-sd).attr("r",3).attr("fill",C.ink);
      // etiqueta directa a dins, a la cantonada
      const pc=d.i?(r0>=.01?f0(r0*100)+" %":f2(r0*100)+" %"):"100 %";
      if(d.i<4)lab(hv,sd-6,S-sd+17,pc,{size:13,weight:700,anchor:"end"});
      if(mob||d.i===4)axTag(hv,Math.min(gx,S)-4,S-sd-6,d.i===4?`${f0(d.v)} t`:`${f1(d.v/1e6)} Mt`,{anchor:"end"});
    }
    tp.show(`<b>${d.t}</b>, ${d.d}<br>${vtxt(d)} l'any<br>${d.i?`${r0>=.01?f0(r0*100)+" %":f2(r0*100)+" %"} de la pols que surt d'Àfrica · 1 de cada ${f0(1/r0)}`:"El quadrat de referència (100 %)"}${d.i>0&&d.i<4?`<br>${f0(d.v/1e6)} quadradets d'un milió de tones`:""}`,ox+sd,oy+S-sd);
  },off);
  const order=[4,3,2,1,0];
  const grow=()=>{ // del més petit al més gran, un darrere l'altre
    setSq(SQ,()=>0); LB.selectAll(".ibx-q").style("opacity",0); grid.style("opacity",0);
    order.forEach((ix,k)=>{ const d=Q43[ix];
      SQ.filter(q=>q===d).transition().delay(k*1000).duration(950).ease(EIO).attr("y",S-Math.max(d.i===4?1.6:0,side(d))).attr("width",Math.max(d.i===4?1.6:0,side(d))).attr("height",Math.max(d.i===4?1.6:0,side(d)));
      LB.selectAll(".ibx-q").filter(q=>q===d).transition().delay(k*1000+300).duration(500).style("opacity",1)
        .on("start",function(){ if(d.n1&&d.v>=1e6)d.n1.transition().duration(900).tween("text",()=>{ const I=d3.interpolate(0,d.v); return t=>d.n1.text(vtxt({v:I(t)})); }); }); });
    grid.transition().delay(order.length*1000).duration(900).style("opacity",1);
  };
  el._grow=grow;
  intro(el,()=>{ setSq(SQ,()=>0); LB.selectAll(".ibx-q").style("opacity",0); grid.style("opacity",0); },inst=>{ if(inst){ setSq(SQ,()=>1); LB.selectAll(".ibx-q").style("opacity",1); grid.style("opacity",1); return; } grow(); });
});
(function(){ const b=$('[data-play="43"]'); if(b)b.addEventListener("click",()=>{ const el=$('[data-p="43"]'); if(el&&el._grow&&!V.reduced)el._grow(); }); void M43; })();

/* =====================================================================
   IB-44 · HORITZÓ  (dades reals: ONI, una fila per dècada)
   ===================================================================== */
let fold44=true;
const B44=1, NB=3;
const POS44=[C.vermellClar,C.vermell,C.vermellFosc], NEG44=[C.blauClar,C.blau,C.blauFosc];
legend(44,el=>legendSteps(el,{title:"ONI (°C) · cada banda, 1 °C",colors:NEG44.slice().reverse().concat(POS44),thresholds:[-3,-2,-1,0,1,2,3],f:v=>sgn(v,0),cw:26}));
const M44=piece(44,(el,w)=>{
  const mob=w<640, bh=mob?30:36, gapR=mob?10:12, u=.42;
  const m={t:30,l:mob?40:78,r:mob?6:16,b:28};
  const rowsF=DECS.length*(bh+gapR), rowU=NB*bh*u*2+gapR;
  const hF=m.t+rowsF+m.b, hU=m.t+DECS.length*rowU+m.b;
  const h=fold44?hF:hU;
  const s=V.svg(el,w,h,"Gràfic d'horitzó de l'índex ONI, una fila per dècada del 1950 al 2026. Els valors positius (El Niño) en vermell i els negatius (La Niña) en blau, plegats en bandes d'1 °C: com més fosc, més intens. Destaquen 1972, 1982–83, 1997–98 i 2015–16.");
  const g=s.append("g"), x=d3.scaleLinear([0,120],[m.l,w-m.r]);
  const rows=DECS.map(d=>({d,v:d3.range(120).map(i=>{ const yr=d+Math.floor(i/12), a=D.oni[yr]; return a&&a[i%12]!=null?a[i%12]:null; })}));
  const rowY=i=>fold44?m.t+i*(bh+gapR)+bh:m.t+i*rowU+NB*bh*u;
  const area=k=>d3.area().defined(v=>v!=null).x((v,i)=>x(i+.5)).y0(0).y1(v=>-bh*cl01((v-k*B44)/B44)).curve(d3.curveMonotoneX);
  const areaN=k=>d3.area().defined(v=>v!=null).x((v,i)=>x(i+.5)).y0(0).y1(v=>-bh*cl01((-v-k*B44)/B44)).curve(d3.curveMonotoneX);
  const tP=k=>fold44?"translate(0,0) scale(1,1)":`translate(0,${-k*bh*u}) scale(1,${u})`;
  const tN=k=>fold44?"translate(0,0) scale(1,1)":`translate(0,${k*bh*u}) scale(1,${-u})`;
  // eix x: l'any dins la dècada
  const ax=g.append("g");
  d3.range(11).forEach(i=>{ if(mob&&i%2)return; const X=x(i*12);
    ax.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t-6).attr("y2",h-m.b+2).attr("stroke",C.grid);
    if(i<10)V.t(ax,X+3,m.t-10,i===0?(mob?"…0":"any …0"):"…"+i,{size:11.5,fill:C.muted}); });
  const cid="c44"+Math.random().toString(36).slice(2,6);
  const clips=s.append("defs").selectAll("clipPath").data(rows).join("clipPath").attr("id",(d,i)=>cid+i).append("rect").attr("x",m.l).attr("y",-NB*bh*1.2).attr("height",NB*bh*2.4).attr("width",w-m.l-m.r);
  const R=g.append("g").selectAll("g").data(rows).join("g").attr("transform",(d,i)=>`translate(0,${rowY(i)})`);
  R.each(function(r,i){ const q=d3.select(this), gg=q.append("g").attr("clip-path",`url(#${cid+i})`);
    d3.range(NB).forEach(k=>{ gg.append("path").attr("class","bp").datum(k).attr("d",area(k)(r.v)).attr("fill",POS44[k]).attr("transform",tP(k));
      gg.append("path").attr("class","bn").datum(k).attr("d",areaN(k)(r.v)).attr("fill",NEG44[k]).attr("transform",tN(k)); });
    q.append("line").attr("class","bl").attr("x1",m.l).attr("x2",w-m.r).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-opacity",.4);
    V.t(q,m.l-8,fold44?-bh/2+4:4,mob?`${r.d}`:decLab(r.d,false),{size:12.5,anchor:"end",fill:C.ink2}).attr("class","rl"); });
  // anotacions amb dades
  const an=g.append("g");
  const mx=ONI_PTS.reduce((a,b)=>b.v>a.v?b:a), mxi=DECS.indexOf(Math.floor(mx.y/10)*10), mxx=x((mx.y%10)*12+mx.k+.5);
  if(fold44&&!mob)V.note(an,{x:mxx,y:rowY(mxi)-bh-2,tx:mxx+40,ty:rowY(mxi)-bh-gapR-2,kind:"elbow",anchor:"start",lines:[[`${mx.y}: ${sgn(mx.v)} °C`,true]]});
  const mn=ONI_PTS.reduce((a,b)=>b.v<a.v?b:a), mni=DECS.indexOf(Math.floor(mn.y/10)*10), mnx=x((mn.y%10)*12+mn.k+.5);
  if(fold44&&!mob)V.note(an,{x:mnx,y:rowY(mni)-bh-2,tx:mnx+40,ty:rowY(mni)-bh-gapR-2,kind:"elbow",anchor:"start",lines:[[`${mn.y}: ${sgn(mn.v)} °C`,true]]});
  // hover: línia vertical que travessa totes les files
  const hv=g.append("g").style("display","none").style("pointer-events","none");
  const vl=hv.append("line").attr("y1",m.t-4).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",1);
  const vt=rows.map(()=>({t:null}));
  rows.forEach((r,i)=>{ vt[i].t=lab(hv,0,0,"",{size:12,weight:700}); vt[i].dot=hv.append("circle").attr("r",2.6).attr("fill",C.ink).attr("stroke","#fff"); });
  const topF=v=>{ const a=Math.abs(v||0); if(a>=NB*B44)return 1; const f=(a%B44)/B44; return f===0&&a>0?1:f; };
  const axT=hv.append("g"); axT.append("rect").attr("height",17).attr("fill",C.paper); const axTx=axTag(axT,0,0,"",{halo:false});
  const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
  let curJ=-1;
  // hover: línia vertical per totes les files amb el valor de cadascuna; la fila apuntada s'encén i la resta s'apaga
  V.hover(hit.node(),(ev,[px,py])=>{
    const i=Math.max(0,Math.min(119,Math.floor(x.invert(px)))), X=x(i+.5), right=X<w-90;
    const j0=d3.minIndex(rows.map((r,j)=>Math.abs(py-(rowY(j)-(fold44?bh*.5:0)))));
    hv.style("display",null).raise(); vl.attr("x1",X).attr("x2",X); dimTo(an,.15);
    if(j0!==curJ){ curJ=j0; fo(R,(d,)=>d===rows[j0],.3); R.select(".rl").attr("font-weight",d=>d===rows[j0]?700:400).attr("fill",d=>d===rows[j0]?C.ink:C.ink2); }
    rows.forEach((r,j)=>{ const v=r.v[i], yr=r.d+Math.floor(i/12), Y=rowY(j)-(fold44?bh*.5:0), me=j===j0;
      vt[j].t.attr("x",X+(right?7:-7)).attr("y",Y+4).attr("text-anchor",right?"start":"end").attr("font-size",me?13.5:12).attr("font-weight",me?700:400).attr("fill",me?C.ink:C.ink2)
        .text(v==null?"":`${mob&&!me?"":yr+" "}${sgn(v)}${me?" °C":""}`);
      vt[j].dot.attr("cx",X).attr("cy",fold44?rowY(j)-bh*topF(v):rowY(j)-(v||0)*bh*u).attr("r",me?4.5:2.6).attr("stroke",me?C.paper:"#fff").attr("stroke-width",me?1.5:1).style("display",v==null?"none":null); });
    // valor de l'eix x en negreta a dalt
    const tag=`${rows[j0].d+Math.floor(i/12)} · ${SEASON[i%12]}`; axTx.text(tag).attr("x",Math.max(m.l+46,Math.min(w-m.r-46,X))).attr("y",m.t-10);
    axT.select("rect").attr("x",Math.max(m.l+46,Math.min(w-m.r-46,X))-48).attr("y",m.t-23).attr("width",96);
    const r=rows[j0], v=r.v[i], yr=r.d+Math.floor(i/12);
    if(v==null){ tp.hide(); return; }
    const col=rows.map(q=>q.v[i]).filter(q=>q!=null), rk=col.slice().sort((a,b)=>b-a).indexOf(v)+1;
    tp.show(`<b>${SEASON[i%12]} ${yr}</b><br>ONI ${sgn(v)} °C · ${v>=.5?"El Niño":v<=-.5?"La Niña":"neutral"}<br>${ord(rk)} valor més alt de les ${col.length} dècades en aquest punt del cicle`,X,Math.max(0,rowY(j0)-bh-8));
  },()=>{ curJ=-1; hv.style("display","none"); tp.hide(); dimTo(an,1); fo(R,null); R.select(".rl").attr("font-weight",400).attr("fill",C.ink2); });
  el._fold=(anim)=>{ // plega o desplega: les bandes es mouen al seu lloc
    const H2=fold44?hF:hU;
    const T=anim&&!V.reduced?d=>d.transition().duration(1100).ease(EIO):d=>d;
    T(s).attr("height",H2).attr("viewBox",`0 0 ${w} ${H2}`); el.style.minHeight=H2+"px";
    T(R).attr("transform",(d,i)=>`translate(0,${rowY(i)})`);
    T(R.selectAll(".bp")).attr("transform",tP); T(R.selectAll(".bn")).attr("transform",tN);
    T(R.selectAll(".rl")).attr("y",fold44?-bh/2+4:4);
    T(ax.selectAll("line")).attr("y2",H2-m.b+2); vl.attr("y2",H2-m.b); hit.attr("height",H2);
    an.style("display",fold44?null:"none");
  };
  intro(el,()=>{ clips.attr("width",0); an.style("opacity",0); },inst=>{
    if(inst){ clips.attr("width",w-m.l-m.r); an.style("opacity",1); return; }
    clips.transition().delay((d,i)=>i*120).duration(1400).ease(EIO).attr("width",w-m.l-m.r);
    an.transition().delay(DECS.length*120+1300).duration(500).style("opacity",1);
  });
});
segs(44,k=>{ fold44=k==="1"; const el=$('[data-p="44"]'); if(el&&el._fold)el._fold(true); });

})();
