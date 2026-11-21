/* «Com vam començar a tancar el forat de l'ozó» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-forat   MAP-18 + MAP-07  Globus polar en franges i isolínies: mitjana d'octubre de l'ozó (KNMI/TEMIS MSR-2), isolínia de 220 DU
   V2 #f-anys    MAP-16 + CASE-05 El mateix globus amb lliscant 1979–2025 i els 47 octubres en petits múltiples (àrea de la NASA)
   V3 #s-clor    HOW-01 + LINK-03 Tall de l'atmosfera amb molècules: com el clor destrueix l'ozó (esquema)
   V4 #f-gruix   SCALE-02 + SPREAD-04 Tres mil·límetres: l'ozó d'una columna, escampat a l'aire i comprimit a mida (×20)
   V5 #f-cfc     TIME-01 + PART-01 CFC-11 i CFC-12 (NOAA) i esfera de l'índex ODGI
   V6 #f-paisos  MAP-03 + SPREAD-03 Les 198 parts: mapa que es transforma en escala d'anys
   V7 #f-evitat  TIME-01 + CASE-02 El món que vam evitar: ozó 60° S–60° N observat (MSR-2) i simulació sense Protocol (Newman et al. 2009)
   Colors: blau = ozó; vermell = el que el destrueix / el forat; groc = llum del sol (només superfícies i traços). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.OZ_DATA, G=window.OZ_OCT;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const HOLE=220;
const TAU=Math.PI*2;

/* ---------- ajudants ---------- */
function mkCanvas(el,w,h,label){
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.className="ibv"; c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0`;
  if(label){ c.setAttribute("role","img"); c.setAttribute("aria-label",label); } else c.setAttribute("aria-hidden","true");
  el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx,dpr};
}
function clear(k){ k.ctx.setTransform(1,0,0,1,0,0); k.ctx.clearRect(0,0,k.c.width,k.c.height); k.ctx.setTransform(k.dpr,0,0,k.dpr,0,0); }
function overlay(el,w,h){
  return d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
    .attr("aria-hidden","true").style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS);
}
function stage(el,h){ d3.select(el).selectAll(":scope>.stage").remove(); const st=document.createElement("div"); st.className="stage"; st.style.cssText=`position:relative;height:${h}px`; el.insertBefore(st,el.firstChild); return st; }

/* ---------- camp d'ozó d'octubre (MSR-2) ---------- */
const OZ=(function(){
  if(!G)return null;
  const s=atob(G.b64), a=new Uint8Array(s.length); for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);
  const N=G.nx*G.ny;
  function val(yi,lon,lat){
    const fy=(lat-G.lat0)/G.dlat; if(fy<0||fy>G.ny-1)return NaN;
    let fx=(((lon+180)%360)+360)%360/G.dlon;
    const j=Math.floor(fy), v=fy-j, j1=Math.min(j+1,G.ny-1), i=Math.floor(fx)%G.nx, u=fx-Math.floor(fx), i1=(i+1)%G.nx, o=yi*N;
    const q=(jj,ii)=>a[o+jj*G.nx+ii]*2+60;
    return (q(j,i)*(1-u)+q(j,i1)*u)*(1-v)+(q(j1,i)*(1-u)+q(j1,i1)*u)*v;
  }
  return {val, years:d3.range(G.y0,G.y1+1)};
})();
const EDGE=G?G.lat0+(G.ny-1)*G.dlat:-36;           // vora nord de les dades (−36°)
const ozAt=(yi,lon,lat)=>OZ.val(yi,lon,Math.min(lat,EDGE));
// rampa: per sota de 220 DU, vermells (el forat); per sobre, blaus (més ozó, més fosc)
const RED=d3.scaleLinear([100,150,200,HOLE],[C.redDark,C.red,"#E07A5F",C.redLight]).clamp(true);
const BLU=V.seq(C.blue,[200,460]);
const ozColor=du=>du<HOLE?RED(du):BLU(du);
const LUT=d3.range(0,600).map(v=>d3.rgb(ozColor(v)));    // color per DU enter, per pintar píxels de pressa
const BANDS=d3.range(100,481,20);                          // franges de 20 DU
const PLACES=[
  {n:"Pol Sud",ll:[0,-90],a:"start",dx:7,dy:4},
  {n:"Halley",ll:[-26.2,-75.6],a:"end",dx:-7,dy:4},
  {n:"McMurdo",ll:[166.7,-77.85],a:"start",dx:7,dy:4},
  {n:"Punta Arenas",ll:[-70.9,-53.16],a:"end",dx:-7,dy:-5},
  {n:"Ushuaia",ll:[-68.3,-54.8],a:"end",dx:-7,dy:14,mobOff:true}
];
const HOLEBY=new Map(D.hole.map(r=>[r[0],{a:r[1],m:r[2]}]));
let WORLD=null; const worldP=V.world().then(w=>{ WORLD=w; return w; }).catch(()=>null);

/* Globus polar: l'hemisferi sud vist des de sota, fins als 24° S. Franges de 20 DU, isolínies fines cada 40 DU,
   la de 220 DU en vermell i una transició suau quan canvia l'any. La terra de fora de les dades fa de context. */
function polarGlobe(el,w,h,o){
  o=o||{};
  const mob=w<640, st=stage(el,h);
  const R=Math.min(w,h)/2-(mob?4:10), cx=w/2, cy=h/2;
  const proj=d3.geoOrthographic().rotate([0,90,0]).scale(R/Math.sin(66*Math.PI/180)).translate([cx,cy]).clipAngle(66).precision(.4);
  const base=mkCanvas(st,w,h,null);
  const fld=mkCanvas(st,w,h,o.label||"Mapa de l'hemisferi sud vist des de sota, amb la mitjana d'octubre de l'ozó total. El forat (menys de 220 unitats Dobson) en vermell.");
  const bp=d3.geoPath(proj,base.ctx), fp=d3.geoPath(proj,fld.ctx);
  const s=overlay(st,w,h), gL=s.append("g"), gH=s.append("g").attr("pointer-events","none");
  const res=mob?3:4, fw=Math.ceil(w/res), fh=Math.ceil(h/res), N=fw*fh;
  const LL=new Float32Array(N*2);
  for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){ const ll=proj.invert([(x+.5)*res,(y+.5)*res]), k=(y*fw+x)*2;
    if(ll&&isFinite(ll[1])){ LL[k]=ll[0]; LL[k+1]=ll[1]; } else { LL[k]=0; LL[k+1]=EDGE; } }
  const cache=new Map();
  function vals(yi){ let a=cache.get(yi); if(a)return a; a=new Float32Array(N);
    for(let k=0;k<N;k++)a[k]=ozAt(yi,LL[k*2],LL[k*2+1]);
    cache.set(yi,a); if(cache.size>8)cache.delete(cache.keys().next().value); return a; }
  const cp=d3.geoPath(d3.geoIdentity().scale(res),fld.ctx);
  const bandGen=d3.contours().size([fw,fh]).thresholds(BANDS), holeGen=d3.contours().size([fw,fh]).thresholds([-HOLE]);
  const neg=new Float32Array(N);
  const holeOf=a=>{ for(let k=0;k<N;k++)neg[k]=-a[k]; return holeGen(neg)[0]; };
  const edgeC=d3.geoCircle().center([0,-90]).radius(90+EDGE)();
  const rad=lat=>{ const p=proj([0,lat]); return Math.hypot(p[0]-cx,p[1]-cy); };
  const rIn=rad(EDGE-7), rOut=rad(EDGE);
  let ghost=null, ghostY=null;
  function drawBase(){
    const c=base.ctx; clear(base);
    if(WORLD){ c.beginPath(); bp(WORLD.land); c.fillStyle=C.land; c.fill(); c.strokeStyle=C.landEdge; c.lineWidth=.6; c.stroke(); }
    c.beginPath(); bp(d3.geoGraticule().step([30,10]).precision(2)()); c.strokeStyle=V.alpha(C.ink,.1); c.lineWidth=.5; c.stroke();
    c.beginPath(); bp({type:"Sphere"}); c.strokeStyle=C.hair; c.lineWidth=.8; c.stroke();
  }
  function paint(a){
    const c=fld.ctx; clear(fld);
    c.save(); c.beginPath(); fp(edgeC); c.clip();
    c.fillStyle=ozColor(90); c.fillRect(0,0,w,h);
    const cs=bandGen(a);
    for(const m of cs){ if(!m.coordinates.length)continue; c.beginPath(); cp(m); c.fillStyle=ozColor(m.value+10); c.fill(); }
    // isolínies finíssimes cada 40 DU
    c.lineWidth=.55; c.strokeStyle=V.alpha(C.paper,.55);
    for(const m of cs){ if(m.value%40||m.value===HOLE||!m.coordinates.length)continue; c.beginPath(); cp(m); c.stroke(); }
    // la vora de les dades s'esvaeix cap a la terra
    c.globalCompositeOperation="destination-out";
    const gr=c.createRadialGradient(cx,cy,rIn,cx,cy,rOut); gr.addColorStop(0,"rgba(0,0,0,0)"); gr.addColorStop(1,"rgba(0,0,0,1)");
    c.fillStyle=gr; c.fillRect(0,0,w,h); c.globalCompositeOperation="source-over";
    if(WORLD){ c.beginPath(); fp(WORLD.land); c.lineJoin="round"; c.strokeStyle=V.alpha(C.paper,.8); c.lineWidth=2.4; c.stroke(); c.strokeStyle=V.alpha(C.ink,.55); c.lineWidth=.7; c.stroke(); }
    c.restore();
    if(ghost&&ghostY!==OZ.years[cur]){ c.save(); c.setLineDash([3,3]); c.beginPath(); cp(ghost); c.strokeStyle=V.alpha(C.ink,.7); c.lineWidth=1; c.stroke(); c.restore(); }
    const hm=holeOf(a); c.beginPath(); cp(hm); c.lineJoin="round";
    c.strokeStyle=V.alpha(C.paper,.92); c.lineWidth=mob?3.6:4.6; c.stroke(); c.strokeStyle=C.red; c.lineWidth=mob?1.5:2; c.stroke();
  }
  let cur=-1, shown=null, raf=0;
  function draw(yi,dur){
    cur=yi; const B=vals(yi); if(o.onDraw)o.onDraw(yi);
    cancelAnimationFrame(raf);
    if(!shown||V.reduced||dur===0){ shown=B; paint(B); return; }
    const A=shown, T=new Float32Array(N), t0=performance.now(), Dd=dur||650;
    const step=now=>{ const e=d3.easeCubicInOut(Math.min(1,(now-t0)/Dd)); for(let k=0;k<N;k++)T[k]=A[k]+(B[k]-A[k])*e; shown=T; paint(T);
      if(e<1)raf=requestAnimationFrame(step); else shown=B; };
    raf=requestAnimationFrame(step);
  }
  function setGhost(year){ ghostY=year; ghost=year==null?null:holeOf(vals(OZ.years.indexOf(year)));
    gL.selectAll("g.gh").remove();
    if(ghost&&!mob){ // etiqueta a la vora dreta del contorn de referència
      let best=null; ghost.coordinates.forEach(pg=>pg[0].forEach(p=>{ if(!best||p[0]>best[0])best=p; }));
      if(best){ const gg=gL.append("g").attr("class","gh"), x=best[0]*res, y=best[1]*res;
        V.note(gg,{x:x+2,y,tx:x+34,ty:y+40,kind:"curve",bend:-8,anchor:"start",lines:[[`${year}, el rècord`,true],["contorn discontinu"]],size:11.5}); } }
    if(shown)paint(shown);
  }
  // etiquetes de llocs
  PLACES.forEach(p=>{ if(mob&&p.mobOff)return; const xy=proj(p.ll); if(!xy)return;
    if(mob&&p.n==="Punta Arenas")p=Object.assign({},p,{a:"start",dx:2,dy:17});
    gL.append("circle").attr("cx",xy[0]).attr("cy",xy[1]).attr("r",2.4).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",1.2);
    V.t(gL,xy[0]+p.dx,xy[1]+p.dy,p.n,{anchor:p.a,size:mob?11:12,weight:600,halo:3}); });
  [["Antàrtida",[60,-72]],["Amèrica del Sud",[-64,-30]],["Àfrica",[22,-28]],["Austràlia",[134,-27]],["Oceà Índic",[80,-48]],["Oceà Pacífic",[-150,-50]]].forEach(([t,ll])=>{
    if(mob&&t!=="Antàrtida")return; const xy=proj(ll); if(!xy)return; V.t(gL,xy[0],xy[1],t,{italic:true,size:mob?11:12,fill:C.ink2,anchor:"middle",halo:2.5}); });
  // hover: valor real de l'ozó on apuntes
  const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
  V.hover(hit.node(),(ev,[px,py])=>{ const ll=proj.invert([px,py]); gH.selectAll("*").remove();
    if(!ll||!isFinite(ll[1])||ll[1]>EDGE){ tp.hide(); return; }
    const du=OZ.val(cur,ll[0],ll[1]), r=Math.hypot(px-cx,py-cy);
    gH.append("circle").attr("cx",cx).attr("cy",cy).attr("r",r).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","1 3");
    gH.append("circle").attr("cx",px).attr("cy",py).attr("r",4).attr("fill",ozColor(du)).attr("stroke",C.ink).attr("stroke-width",1.4);
    V.t(gH,px+10,py-8,`${f0(du)} DU`,{size:12.5,weight:700,halo:3.4});
    tp.show(`<b>Octubre de ${OZ.years[cur]}</b> · ${f0(du)} unitats Dobson de mitjana a ${f0(-ll[1])}° S, ${f0(Math.abs(ll[0]))}° ${ll[0]<0?"O":"E"}${du<HOLE?" · dins del forat":""}`);
  },()=>{ tp.hide(); gH.selectAll("*").remove(); });
  drawBase();
  worldP.then(()=>{ drawBase(); if(shown)paint(shown); });
  return {draw, setGhost, proj, svg:s, gL, get cur(){ return cur; }};
}
function legendOz(el){
  if(!el)return; el.innerHTML="";
  const div=document.createElement("div"); div.className="ibv-lg"; el.appendChild(div);
  const W=220, H=36, s=d3.select(div).append("svg").attr("width",W).attr("height",H).style("display","block").style("overflow","visible");
  const x=d3.scaleLinear([100,460],[0,W-8]);
  BANDS.slice(0,-1).forEach(v=>s.append("rect").attr("x",x(v)).attr("y",12).attr("width",x(v+20)-x(v)+.4).attr("height",9).attr("fill",ozColor(v+10)));
  s.append("line").attr("x1",x(HOLE)).attr("x2",x(HOLE)).attr("y1",8).attr("y2",25).attr("stroke",C.red).attr("stroke-width",2);
  [[100,"100"],[HOLE,"220"],[300,"300"],[460,"460 DU"]].forEach(([v,t])=>V.t(s,x(v),34,t,{size:11,fill:C.ink2,anchor:v===100?"start":v===460?"end":"middle"}));
  V.t(s,0,8,"← forat",{size:11,fill:C.ink2}); V.t(s,W-8,8,"més ozó →",{size:11,fill:C.ink2,anchor:"end"});
}
function yearHead(api,yi,mob,big){
  if(!api)return; api.svg.selectAll("g.yr").remove();
  const y=OZ.years[yi], gy=api.svg.append("g").attr("class","yr"), hd=HOLEBY.get(y);
  V.t(gy,mob?4:10,mob?20:34,String(y),{size:mob?22:(big?36:32),weight:600,serif:true,halo:3});
  const sub=hd?(hd.a<1?"gairebé sense forat":`forat de ${f1(hd.a)} milions de km²`):"sense dada de la NASA";
  V.t(gy,mob?4:10,mob?36:54,sub,{size:mob?11:12.5,fill:hd&&hd.a>=1?C.redDark:C.ink2,weight:600,halo:3});
}

/* =====================================================================
   V1 · MAP-18 + MAP-07 · QUARANTA-SET PRIMAVERES (scrolly)
   ===================================================================== */
(function forat(){
  const box=$("#forat-viz"), stepsEl=$("#s-forat .steps"); if(!box||!OZ)return;
  legendOz($("#forat-lg"));
  const STEPS=[1979,1985,1987,2006,2025];
  let cur=0, api=null;
  function go(i,dur){ if(!api)return; api.setGhost(i===4?2006:null); api.draw(OZ.years.indexOf(STEPS[i]),dur); }
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w,vh*.44):Math.min(w,vh*.76));
    api=polarGlobe(el,w,h,{onDraw:yi=>yearHead(api,yi,mob)});
    go(cur,0);
    V.onView(el,instant=>{ if(instant)return; const st=el.querySelector(".stage"); st.style.opacity=0; d3.select(st).transition().duration(900).style("opacity",1); });
  });
  IB.scrolly(stepsEl,$("#s-forat .graphic"),i=>{ cur=i; go(i,900); });
})();

/* =====================================================================
   V2 · MAP-16 + CASE-05 · CADA OCTUBRE, UN MAPA (lliscant + 47 octubres)
   ===================================================================== */
(function anys(){
  const box=$("#anys-viz"), ser=$("#anys-ser"), rng=$("#anys-rng"), play=$("#anys-play"), lab=$("#anys-y");
  if(!box||!OZ)return;
  legendOz($("#anys-lg"));
  let yi=OZ.years.length-1, api=null, playing=false, timer=0, sel=null;
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(Math.min(w*(mob?1:.62),vh*(mob?.55:.68)));
    api=polarGlobe(el,w,h,{label:"Mapa interactiu de l'hemisferi sud amb la mitjana d'octubre de l'ozó total de cada any entre 1979 i 2025.",onDraw:i=>yearHead(api,i,mob,true)});
    api.setGhost(2006); api.draw(yi,0);
  });
  // els 47 octubres: un globus petit per any (mateixa rampa) i, a sota, l'àrea mitjana del forat de la NASA
  V.mount(ser,(el,w)=>{
    const mob=w<640, n=OZ.years.length, cols=mob?8:Math.max(10,Math.min(16,Math.floor(w/70))), cw=w/cols, r=Math.min(cw*.4,30);
    const rowH=2*r+(mob?30:32), rows=Math.ceil(n/cols), h=rows*rowH+4;
    const st=stage(el,h), K=mkCanvas(st,w,h,"Els 47 octubres del 1979 al 2025 en petits mapes de l'hemisferi sud: el vermell del forat apareix als anys vuitanta, és més gran entre el 1992 i el 2015 i es fa una mica més petit en els darrers anys.");
    const pos=i=>({x:(i%cols+.5)*cw, y:Math.floor(i/cols)*rowH+r+4});
    const d=Math.ceil(2*r*K.dpr), pj=d3.geoOrthographic().rotate([0,90,0]).scale(r/Math.sin((90+EDGE)*Math.PI/180)).translate([r,r]).clipAngle(90);
    const pts=[]; for(let py=0;py<d;py++)for(let px=0;px<d;px++){ const X=(px+.5)/K.dpr, Y=(py+.5)/K.dpr; if(Math.hypot(X-r,Y-r)>r)continue; const ll=pj.invert([X,Y]); if(ll)pts.push(py*d+px,ll[0],ll[1]); }
    const imgs=OZ.years.map((y,i)=>{ const cv=document.createElement("canvas"); cv.width=cv.height=d; const c2=cv.getContext("2d"), im=c2.createImageData(d,d), dd=im.data;
      for(let k=0;k<pts.length;k+=3){ const c=LUT[clamp(Math.round(ozAt(i,pts[k+1],pts[k+2])),0,599)], q=pts[k]*4; dd[q]=c.r; dd[q+1]=c.g; dd[q+2]=c.b; dd[q+3]=255; }
      c2.putImageData(im,0,0); return cv; });
    function drawAll(hi){ clear(K); const c=K.ctx;
      imgs.forEach((cv,i)=>{ const p=pos(i); c.globalAlpha=hi==null||hi===i?1:.5; c.drawImage(cv,p.x-r,p.y-r,2*r,2*r); });
      c.globalAlpha=1; }
    drawAll(null);
    const s=overlay(st,w,h), g=s.append("g");
    const amax=27, bwMax=Math.min(cw-8,2*r+6);
    OZ.years.forEach((y,i)=>{ const p=pos(i), hd=HOLEBY.get(y), by=p.y+r+6;
      g.append("rect").attr("x",p.x-bwMax/2).attr("y",by).attr("width",bwMax).attr("height",3).attr("fill",C.grid);
      if(hd)g.append("rect").attr("class","ab").attr("x",p.x-bwMax/2).attr("y",by).attr("width",bwMax*hd.a/amax).attr("height",3).attr("fill",C.red);
      V.t(g,p.x,by+(mob?16:17),String(y),{anchor:"middle",size:11,fill:C.ink2}).attr("class","yl").attr("data-i",i); });
    const ring=s.append("circle").attr("r",r+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).attr("pointer-events","none");
    const hov=s.append("circle").attr("r",r+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2").attr("pointer-events","none").style("opacity",0);
    sel=i=>{ const p=pos(i); ring.attr("cx",p.x).attr("cy",p.y); g.selectAll("text.yl").attr("font-weight",function(){ return +this.dataset.i===i?700:400; }).attr("fill",function(){ return +this.dataset.i===i?C.ink:C.ink2; }); };
    sel(yi);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=Math.floor(py/rowH)*cols+Math.floor(px/cw); if(i<0||i>=n){ tp.hide(); return; }
      const y=OZ.years[i], hd=HOLEBY.get(y), p=pos(i); drawAll(i); hov.attr("cx",p.x).attr("cy",p.y).style("opacity",i===yi?0:1);
      tp.show(hd?`<b>Octubre de ${y}</b> · forat de ${f1(hd.a)} milions de km² de mitjana i mínim de ${f0(hd.m)} DU (NASA)`:`<b>Octubre de ${y}</b> · la NASA no en té dades`);
      if(ev.type==="pointerdown"){ stop(); set(i); } },()=>{ tp.hide(); drawAll(null); hov.style("opacity",0); });
    V.onView(el,instant=>{ if(instant)return; g.selectAll("rect.ab").attr("transform",null).each(function(){ const W0=+this.getAttribute("width"); d3.select(this).attr("width",0).transition().delay((_,i)=>0).duration(900).attr("width",W0); }); });
  });
  function set(i,dur){ yi=clamp(i,0,OZ.years.length-1); rng.value=OZ.years[yi]; rng.setAttribute("aria-valuetext",`Octubre de ${OZ.years[yi]}`); lab.textContent=OZ.years[yi];
    if(api)api.draw(yi,dur); if(sel)sel(yi); }
  function stop(){ playing=false; clearTimeout(timer); play.textContent="Reprodueix →"; }
  function step(){ if(!playing)return; if(yi>=OZ.years.length-1){ stop(); return; } set(yi+1,380); timer=setTimeout(step,V.reduced?0:460); }
  play.addEventListener("click",()=>{ if(playing){ stop(); return; } if(yi>=OZ.years.length-1)set(0,0); playing=true; play.textContent="Pausa"; timer=setTimeout(step,200); });
  rng.addEventListener("input",()=>{ stop(); set(+rng.value-OZ.years[0],260); });
  V.onView(box,instant=>{ if(instant)return; set(0,0); playing=true; play.textContent="Pausa"; timer=setTimeout(step,600); },{threshold:.45});
})();

/* =====================================================================
   V3 · HOW-01 · COM UN ÀTOM DE CLOR ES MENJA L'OZÓ (scrolly, esquema)
   Molècules dibuixades: ozó (tres àtoms, blau), CFC (carboni amb dos clors vermells i dos fluors grisos),
   clor lliure (vermell). Moviment lent i contemplatiu.
   ===================================================================== */
(function clor(){
  const box=$("#clor-viz"), stepsEl=$("#s-clor .steps"); if(!box)return;
  let cur=0;
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(mob?Math.min(370,vh*.45):Math.min(580,vh*.74));
    const st=stage(el,h);
    const m={l:mob?30:50,r:mob?6:14,t:12,b:mob?36:42};
    const X0=m.l, X1=w-m.r, W=X1-X0, kmPx=(h-m.t-m.b-8)/50, sag=mob?9:20;
    const gy=x=>{ const u=(x-(X0+W/2))/(W/2); return h-m.b+sag*u*u; };   // terra corbada
    const Y=(x,z)=>gy(x)-z*kmPx;
    const POLE=X0+W*.6;                                                    // a la dreta, sobre l'Antàrtida
    const inPolar=x=>x>POLE-W*.04;
    const bg=mkCanvas(st,w,h,null), fx=mkCanvas(st,w,h,null);
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Esquema de l'atmosfera de 0 a 50 km: els CFC pugen des de terra fins a l'estratosfera, on la llum ultraviolada n'allibera el clor, que destrueix l'ozó en un cicle que es repeteix; sobre l'Antàrtida, els núvols polars de l'hivern preparen el clor i a la primavera s'obre el forat entre els 10 i els 20 km.");
    const g=s.append("g");
    // --- capa fixa: terra, gel, tropopausa, altituds, neveres i esprais
    (function(){ const c=bg.ctx;
      c.beginPath(); c.moveTo(X0-m.l,gy(X0-m.l)); for(let x=X0-m.l;x<=w;x+=4)c.lineTo(x,gy(x)); c.lineTo(w,h); c.lineTo(0,h); c.closePath(); c.fillStyle=C.land; c.fill();
      c.beginPath(); for(let x=X0-m.l;x<=w;x+=4)c.lineTo(x,gy(x)); c.strokeStyle=C.landEdge; c.lineWidth=.8; c.stroke();
      // casquet de gel: blanc de paper amb vora fina
      const ice=x=>{ const u=clamp((x-POLE)/(X1-POLE),0,1); return Math.sin(u*Math.PI*.5)**.6*(mob?7:12); };
      c.beginPath(); c.moveTo(POLE,gy(POLE)); for(let x=POLE;x<=w;x+=3)c.lineTo(x,gy(x)-ice(x)); c.lineTo(w,gy(w)); c.closePath(); c.fillStyle=C.paper; c.fill(); c.strokeStyle=V.alpha(C.ink,.35); c.lineWidth=.7; c.stroke();
      // tropopausa (uns 12 km), traç fi discontinu
      c.save(); c.setLineDash([2,4]); c.beginPath(); for(let x=X0;x<=X1;x+=4)c.lineTo(x,Y(x,12)); c.strokeStyle=V.alpha(C.ink,.3); c.lineWidth=.7; c.stroke(); c.restore();
      // neveres, esprai i escuma (línia de tinta)
      c.strokeStyle=C.ink; c.lineWidth=1; c.lineJoin="round";
      const fx0=X0+W*(mob?.06:.07), b0=gy(fx0)+1, sc=mob?.8:1;
      const box=(x,y,bw,bh,r)=>{ c.beginPath(); c.roundRect?c.roundRect(x,y,bw,bh,r):c.rect(x,y,bw,bh); c.stroke(); };
      box(fx0,b0-36*sc,22*sc,36*sc,2); c.beginPath(); c.moveTo(fx0,b0-24*sc); c.lineTo(fx0+22*sc,b0-24*sc); c.stroke();
      c.beginPath(); c.moveTo(fx0+18*sc,b0-31*sc); c.lineTo(fx0+18*sc,b0-27*sc); c.moveTo(fx0+18*sc,b0-20*sc); c.lineTo(fx0+18*sc,b0-14*sc); c.stroke();
      const sx=fx0+30*sc, sb=gy(sx)+1; box(sx,sb-20*sc,8*sc,20*sc,2.5); box(sx+2*sc,sb-24*sc,4*sc,4*sc,1);
      c.beginPath(); c.moveTo(sx+7*sc,sb-23*sc); c.lineTo(sx+12*sc,sb-26*sc); c.stroke();
      if(!mob){ const ex=fx0+48*sc, eb=gy(ex)+1; box(ex,eb-12,26,12,1); for(let i=0;i<4;i++){ c.beginPath(); c.arc(ex+5+i*5.5,eb-6,1.6,0,TAU); c.stroke(); } }
    })();
    [0,10,20,30,40,50].forEach(k=>{ const yy=Y(X0,k); g.append("line").attr("x1",X0-4).attr("x2",X0).attr("y1",yy).attr("y2",yy).attr("stroke",C.muted); V.t(g,X0-7,yy+4,k===50?"50 km":k,{anchor:"end",size:V.FS.small,fill:C.muted}); });
    const lx=X0+W*(mob?.2:.42);
    V.t(g,lx,Y(lx,12)-6,"↑ estratosfera",{italic:true,size:12,fill:C.ink2,halo:2.5});
    V.t(g,lx,Y(lx,12)+15,"↓ troposfera",{italic:true,size:12,fill:C.ink2,halo:2.5});
    const lOz=V.t(g,X0+8,Y(X0+8,mob?40:39.5),mob?"capa d'ozó":"capa d'ozó · màxim a uns 32 km",{size:12,weight:700,fill:C.blueDark,halo:3});
    V.t(g,X0+W*(mob?.06:.07),gy(X0+W*.07)+15,mob?"neveres, esprais":"neveres, esprais, escumes",{size:11,fill:C.ink2,halo:2.5});
    V.t(g,POLE+(X1-POLE)*.55,gy(POLE+(X1-POLE)*.55)+(mob?14:16),"Antàrtida",{anchor:"middle",italic:true,size:11.5,fill:C.ink2,halo:2.5});
    // anotacions de cada pas
    const aPsc=g.append("g").style("opacity",0), aHole=g.append("g").style("opacity",0), aSun=g.append("g").style("opacity",0);
    V.t(aPsc,POLE+(X1-POLE)*.5,Y(POLE,mob?27.5:28.5),mob?"núvols polars":"núvols estratosfèrics polars",{anchor:"middle",size:mob?11:12,weight:700,halo:3});
    V.t(aPsc,POLE+(X1-POLE)*.5,Y(POLE,mob?27.5:28.5)+14,mob?"hivern, sense sol":"hivern: el clor s'hi queda preparat",{anchor:"middle",size:11.5,fill:C.ink2,halo:3});
    const hx0=POLE+2, hx1=X1-4, lens=d3.range(0,1.0001,.04).map(u=>[hx0+(hx1-hx0)*u,10.5-Math.sin(u*Math.PI)*.4]).concat(d3.range(1,-.0001,-.04).map(u=>[hx0+(hx1-hx0)*u,22.5+Math.sin(u*Math.PI)*1.2]));
    aHole.append("path").attr("d",d3.line().curve(d3.curveCatmullRomClosed)(lens.map(([x,z])=>[x,Y(x,z)]))).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1).attr("stroke-dasharray","4 3");
    V.t(aHole,POLE+(X1-POLE)*.5,Y(POLE,8),mob?"el forat (10–20 km)":"el forat: es perd l'ozó entre 10 i 20 km",{anchor:"middle",size:mob?11:12,weight:700,fill:C.redDark,halo:3});
    V.t(aSun,X1-34,Y(X1,46.5)+4,mob?"UV":"llum ultraviolada",{anchor:"end",size:11.5,fill:C.ink2,halo:3});
    // cicle del clor (dalt a l'esquerra, on la capa ja és molt prima)
    const cyc=g.append("g").style("opacity",0), rc=mob?15:26, ccx=X0+(mob?30:W*.2), ccy=Y(ccx,mob?44:43.5);
    cyc.append("circle").attr("cx",ccx).attr("cy",ccy).attr("r",rc).attr("fill","none").attr("stroke",C.red).attr("stroke-width",.9).attr("stroke-opacity",.7);
    [[-35,1],[145,1]].forEach(([a])=>{ const t=a*Math.PI/180, px=ccx+rc*Math.cos(t), py=ccy+rc*Math.sin(t), tx=-Math.sin(t), ty=Math.cos(t);
      cyc.append("path").attr("d",`M${px+tx*5},${py+ty*5}L${px-tx*1-ty*3.4},${py-ty*1+tx*3.4}L${px-tx*1+ty*3.4},${py-ty*1-tx*3.4}Z`).attr("fill",C.red); });
    if(!mob){ V.t(cyc,ccx+rc+10,ccy-9,"Cl + O₃ → ClO + O₂",{size:12.5,weight:700,halo:3}); V.t(cyc,ccx+rc+10,ccy+8,"ClO + O → Cl + O₂",{size:12.5,weight:700,halo:3});
      V.t(cyc,ccx+rc+10,ccy+26,"un sol àtom de clor: més de 100.000 molècules d'ozó",{size:11.5,fill:C.ink2,halo:3}); }
    else { V.t(cyc,ccx+rc+8,ccy-2,"el clor torna a quedar lliure:",{size:11,weight:700,halo:3}); V.t(cyc,ccx+rc+8,ccy+12,"més de 100.000 molècules d'ozó",{size:11,fill:C.ink2,halo:3}); }
    // --- partícules
    const rnd=V.rng(1974), NO=mob?150:330, ar=mob?1.2:1.55;
    const holeReg=(x,z)=>inPolar(x)&&z>10.5&&z<22.5;
    const spawnOz=(avoidHole)=>{ let x,z,t=0; do{ x=X0+rnd()*W; z=clamp(29+V.gauss(rnd)*8,11,47); }while(avoidHole&&holeReg(x,z)&&++t<20); return {x,z,ph:rnd()*TAU,a:0,dead:0,dt:0}; };
    const O=d3.range(NO).map(()=>Object.assign(spawnOz(false),{a:1}));
    const fx0=X0+W*(mob?.06:.07)+11;
    const NP=mob?14:26, P=d3.range(NP).map(()=>({x:fx0+(rnd()-.3)*26, z:rnd()*40, v:1+rnd()*.6, zb:22+rnd()*7, ph:rnd()*TAU}));
    let Cl=[], O2=[], flashes=[], photons=[], k=0, cloudA=0, sunA=0, phT=0, t0=0;
    const maxCl=mob?16:30;
    function addCl(x,z,stuck){ if(Cl.length>=maxCl)Cl.shift(); Cl.push({x,z,vx:(rnd()-.5)*16,vz:(rnd()-.5)*1.2,st:0,tt:0,stuck:!!stuck,a:0}); }
    function burnOz(o){ o.dead=1; o.dt=0; O2.push({x:o.x,z:o.z,t:0,big:1}); }
    const molO3=(c,x,y)=>{ c.moveTo(x+ar,y); c.arc(x,y,ar,0,TAU); c.moveTo(x-ar*1.55+ar,y+ar*1.05); c.arc(x-ar*1.55,y+ar*1.05,ar,0,TAU); c.moveTo(x+ar*1.55+ar,y+ar*1.05); c.arc(x+ar*1.55,y+ar*1.05,ar,0,TAU); };
    function frame(t,dt){
      const c=fx.ctx, sp=V.reduced?0:dt/1000; clear(fx);
      cloudA+=((k>=3?(k===4?.55:1):0)-cloudA)*Math.min(1,sp*1.5);
      sunA+=((k===2||k===4?1:0)-sunA)*Math.min(1,sp*1.5);
      // núvols nacrats (iridescents): lents translúcides en blau, vermell i groc clars
      if(cloudA>.01){ c.save(); c.globalAlpha=cloudA;
        [[.18,18.5,.30,1.5],[.46,16.5,.26,1.2],[.72,19.5,.24,1.6],[.35,21.5,.18,1.0],[.62,14.8,.2,1.0]].forEach(([u,z,rw,rh],i)=>{
          const x=POLE+(X1-POLE)*u, y=Y(x,z), RW=(X1-POLE)*rw, RH=kmPx*rh*(mob?1.3:1.1)+Math.sin(t/3000+i)*.6;
          const gr=c.createLinearGradient(x-RW,y-RH,x+RW,y+RH); gr.addColorStop(0,V.alpha(C.blueLight,.42)); gr.addColorStop(.5,V.alpha(C.redLight,.34)); gr.addColorStop(1,V.alpha(C.yellowLight,.5));
          c.beginPath(); c.ellipse(x+Math.sin(t/5000+i)*3,y,RW,RH,0,0,TAU); c.fillStyle=gr; c.fill(); c.strokeStyle=V.alpha(C.ink2,.25); c.lineWidth=.5; c.stroke(); });
        c.restore(); }
      // sol i fotons ultraviolats
      if(sunA>.01){ const sx=X1-16, sy=Y(X1,47.5); c.save(); c.globalAlpha=sunA;
        c.beginPath(); c.arc(sx,sy,mob?9:12,0,TAU); c.fillStyle=C.yellow; c.fill();
        c.strokeStyle=V.alpha(C.yellow,.85); c.lineWidth=2;
        photons.forEach(p=>{ const e=p.p, x=p.x0+(p.x1-p.x0)*e, y=p.y0+(p.y1-p.y0)*e, L=mob?10:16, dx=(p.x1-p.x0), dy=(p.y1-p.y0), n=Math.hypot(dx,dy), ux=dx/n, uy=dy/n;
          c.beginPath(); for(let q=0;q<=8;q++){ const s2=q/8*L, wv=Math.sin(q/8*TAU*1.5+t/80)*2; c.lineTo(x-ux*s2-uy*wv,y-uy*s2+ux*wv); } c.globalAlpha=sunA*Math.sin(Math.PI*e); c.stroke(); });
        c.restore(); }
      if(sunA>.5&&!V.reduced){ phT+=sp; if(phT>(mob?.5:.32)){ phT=0; const tx=X0+W*(.2+rnd()*.75), tz=18+rnd()*14; photons.push({p:0,x0:X1-16,y0:Y(X1,47.5),x1:tx,y1:Y(tx,tz)}); } }
      photons.forEach(p=>p.p+=sp/3.2); photons=photons.filter(p=>p.p<1);
      // ozó
      c.beginPath();
      const hole4=k===4;
      O.forEach(o=>{ if(o.dead){ o.dt+=sp; if(o.dt>(hole4?3:4)+o.ph){ Object.assign(o,spawnOz(hole4)); } return; }
        o.a=Math.min(1,o.a+sp*.6);
        if(hole4&&holeReg(o.x,o.z)&&rnd()<sp*.35){ burnOz(o); return; }
        if(o.a<1)return; const yy=Y(o.x,o.z)+Math.sin(t/2600+o.ph)*1.2; molO3(c,o.x,yy); });
      c.fillStyle=V.alpha(C.blue,.72); c.fill();
      O.forEach(o=>{ if(o.dead||o.a>=1)return; c.beginPath(); molO3(c,o.x,Y(o.x,o.z)); c.fillStyle=V.alpha(C.blue,.72*o.a); c.fill(); });
      // oxigen normal (O₂) que queda: dos àtoms grisos que s'esvaeixen
      O2.forEach(q=>{ q.t+=sp; q.z+=sp*.25; const a=Math.max(0,1-q.t/2.2), x=q.x, y=Y(x,q.z); c.beginPath(); c.arc(x-ar*.8,y,ar,0,TAU); c.arc(x+ar*.8,y,ar,0,TAU); c.fillStyle=V.alpha(C.ink2,.5*a); c.fill(); });
      O2=O2.filter(q=>q.t<2.2);
      // CFC que pugen (des del pas 1) i, des del pas 2, es trenquen a l'estratosfera
      if(k>=1){ P.forEach(p=>{ p.z+=sp*p.v*1.25; p.x+=sp*W*.012;
          if(k>=2&&p.z>p.zb){ addCl(p.x,p.z,false); flashes.push({x:p.x,z:p.z,t:0}); p.z=0; p.x=fx0+(rnd()-.3)*26; p.zb=22+rnd()*7; }
          else if(p.z>46){ p.z=0; p.x=fx0+(rnd()-.3)*26; }
          const x=p.x+Math.sin(t/1800+p.ph)*3, y=Y(x,p.z), a=clamp(p.z/3,0,1)*.9, R2=mob?1.1:1.35, d2=R2*1.9;
          c.beginPath(); c.arc(x,y,R2*1.15,0,TAU); c.fillStyle=V.alpha(C.ink2,a); c.fill();
          c.beginPath(); c.arc(x-d2,y-d2*.6,R2,0,TAU); c.arc(x+d2,y-d2*.6,R2,0,TAU); c.fillStyle=V.alpha(C.red,a*.85); c.fill();
          c.beginPath(); c.arc(x-d2,y+d2*.6,R2,0,TAU); c.arc(x+d2,y+d2*.6,R2,0,TAU); c.fillStyle=V.alpha(C.ghost,a); c.fill(); }); }
      // esclats on la llum trenca una molècula
      flashes.forEach(f=>{ f.t+=sp; const e=f.t/1, y=Y(f.x,f.z); c.beginPath(); c.arc(f.x,y,3+e*10,0,TAU); c.fillStyle=V.alpha(C.yellow,.45*(1-e)); c.fill(); });
      flashes=flashes.filter(f=>f.t<1);
      // clor lliure: vaga lentament; si troba ozó, el trenca (ClO) i al cap d'una estona torna a quedar lliure
      Cl.forEach(q=>{ q.a=Math.min(1,q.a+sp*1.5);
        if(k===3&&inPolar(q.x)){ q.stuck=true; }
        if(q.stuck&&k!==3)q.stuck=false;
        if(q.stuck){ const tz=17+((q.x*7)%5); q.z+=(tz-q.z)*Math.min(1,sp*.8); q.x+=Math.sin(t/4000+q.vx)*sp*2; }
        else { q.vx+=(rnd()-.5)*sp*30; q.vz+=(rnd()-.5)*sp*2; q.vx=clamp(q.vx,-W*.03,W*.03); q.vz=clamp(q.vz,-1.4,1.4);
          if(k===4&&inPolar(q.x)){ q.vz+=((17-q.z)*.3)*sp; }
          q.x=clamp(q.x+q.vx*sp,X0+4,X1-4); q.z=clamp(q.z+q.vz*sp,k===4&&inPolar(q.x)?11:16,44);
          if(k===2&&q.x>X0+W*.95)q.vx=-Math.abs(q.vx); }
        if(q.st){ q.tt-=sp; if(q.tt<=0){ q.st=0; O2.push({x:q.x,z:q.z,t:0}); } }
        else if(!q.stuck&&k>=2){ const qy=Y(q.x,q.z); for(const o of O){ if(o.dead||o.a<1)continue; const dx=o.x-q.x; if(dx>7||dx<-7)continue; if(Math.abs(Y(o.x,o.z)-qy)<6){ burnOz(o); q.st=1; q.tt=1.2+rnd()*.8; break; } } }
        const x=q.x, y=Y(x,q.z), al=q.a*(q.stuck?.55:1);
        c.beginPath(); c.arc(x,y,mob?4.5:6,0,TAU); c.fillStyle=V.alpha(C.red,.16*al); c.fill();
        c.beginPath(); c.arc(x,y,mob?1.9:2.4,0,TAU); c.fillStyle=V.alpha(C.red,al); c.fill();
        if(q.st){ c.beginPath(); c.arc(x+(mob?2.6:3.3),y-1,ar,0,TAU); c.fillStyle=V.alpha(C.blue,al); c.fill(); } });
      // el cicle: un àtom que dona voltes (a la meitat de baix porta l'oxigen robat)
      if(k>=2){ const ang=(t/4200)*TAU, x=ccx+rc*Math.cos(ang), y=ccy+rc*Math.sin(ang);
        c.beginPath(); c.arc(x,y,mob?2.2:2.8,0,TAU); c.fillStyle=C.red; c.fill();
        if(Math.sin(ang)>0){ c.beginPath(); c.arc(x+(mob?3:3.8)*Math.cos(ang),y+(mob?3:3.8)*Math.sin(ang),ar,0,TAU); c.fillStyle=C.blue; c.fill(); } }
    }
    function setK(kk){ const prev=k; k=kk; const T=V.reduced?0:600;
      cyc.transition().duration(T).style("opacity",kk>=2?1:0);
      aPsc.transition().duration(T).style("opacity",kk===3?1:0);
      aHole.transition().duration(T).style("opacity",kk===4?1:0);
      aSun.transition().duration(T).style("opacity",kk===2||kk===4?1:0);
      lOz.transition().duration(T).style("opacity",kk>=2?.0:1);
      if(kk<2){ Cl=[]; }
      if(kk<4&&prev===4){ O.forEach(o=>{ if(o.dead)o.dt=99; }); }
      if(kk===3&&prev!==3){ for(let i=0;i<(mob?8:14);i++)addCl(POLE+(X1-POLE)*(.08+rnd()*.85),17+rnd()*4,true); }
      if(kk===2&&Cl.length<6){ for(let i=0;i<6;i++)addCl(X0+W*(.25+rnd()*.6),24+rnd()*12,false); }
      if(V.reduced)frame(0,0); }
    el.__loop=V.loop(el,frame);
    el.__set=setK; setK(cur);
    // hover: altura i capa
    const tp=V.tip(el), gH=s.append("g").attr("pointer-events","none"), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
    V.hover(hit.node(),(ev,[px,py])=>{ const z=(gy(px)-py)/kmPx; gH.selectAll("*").remove(); if(z<0||z>50||px<X0){ tp.hide(); return; }
      const pts=d3.range(X0,X1+1,6).map(x=>[x,Y(x,z)]);
      gH.append("path").attr("d",d3.line()(pts)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
      const zone=z<12?"troposfera, on els CFC no es destrueixen":z<20?"estratosfera baixa: aquí s'obre el forat sobre l'Antàrtida":z<38?"estratosfera: la capa d'ozó":"estratosfera alta";
      tp.show(`<b>${f0(z)} km d'altura</b> · ${zone}`); },()=>{ tp.hide(); gH.selectAll("*").remove(); });
  });
  IB.scrolly(stepsEl,$("#s-clor .graphic"),i=>{ cur=i; if(box.__set)box.__set(i); });
})();

/* =====================================================================
   V4 · SCALE-02 + SPREAD-04 · TRES MIL·LÍMETRES
   Cada punt és la mateixa quantitat d'ozó (½ DU; 1 DU al mòbil). Primer escampat a l'aire, on és de debò
   (esquema d'altura), i després comprimit a la pressió del terra: 1 DU = 0,01 mm (NASA), dibuixat ×20 (×14 al mòbil).
   ===================================================================== */
(function gruix(){
  const box=$("#gruix-viz"), rng=$("#gruix-rng"), out=$("#gruix-out"), segs=document.querySelectorAll('[data-seg="gruix"] button'); if(!box)return;
  const H=D.hole.filter(r=>r[2]).map(r=>({y:r[0],m:r[2]}));
  let yi=H.findIndex(d=>d.y===2006), mode="aire", api=null;
  const PXMM=96/25.4;   // px CSS per mm real
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, k=PXMM*(mob?14:20), top=mob?30:34, base=top+3.3*k, h=Math.round(base+(mob?40:44));
    const st=stage(el,h), K=mkCanvas(st,w,h,"Gruix que tindria la capa d'ozó si es comprimís a la superfície: uns 3 mm de mitjana mundial, 2,2 mm al llindar del forat i menys d'1 mm en els pitjors dies sobre l'Antàrtida. Els punts representen l'ozó, primer escampat per l'estratosfera i després comprimit.");
    const s=overlay(st,w,h), g=s.append("g");
    const X0=mob?46:70, real=mob?0:70, av=w-X0-real, cw=Math.min(mob?82:170,(av-24)/3-18), gap=(av-cw*3)/4, perDU=mob?1:2, R0=mob?1.35:1.6;
    const cols=[{t:"Mitjana mundial",du:300,c:C.blue},{t:"Llindar del forat",du:HOLE,c:C.blue},{t:"",du:0,c:C.red,dyn:true}].map((c,i)=>Object.assign(c,{x:X0+gap*(i+1)+cw*i,dots:[]}));
    const rnd=V.rng(300);
    const airY=()=>{ const z=clamp(27+V.gauss(rnd)*7,10,48); return base-(z/50)*(base-top); };
    function layout(col,instant){
      const du=col.dyn?H[yi].m:col.du, n=Math.round(du*perDU), hb=du/100*k, sp=Math.sqrt(cw*hb/n), nc=Math.max(1,Math.round(cw/sp)), nr=Math.ceil(n/nc);
      while(col.dots.length<n){ const ay=airY(), ax=col.x+rnd()*cw; col.dots.push({x:ax,y:ay,ax,ay,tx:ax,ty:ay,a:instant?1:0,del:rnd(),sp:4+rnd()*3}); }
      col.dots.length=n; col.hb=hb; col.du=du;
      col.dots.forEach((d,i)=>{ const cc=i%nc, rr=Math.floor(i/nc); d.cx=col.x+(cc+.5)*cw/nc; d.cy=base-(rr+.5)*hb/nr; });
    }
    cols.forEach(c=>layout(c,true));
    // regles: km (a l'aire, esquema) i mm (comprimit, a escala)
    const rKm=g.append("g"), rMm=g.append("g");
    [0,10,20,30,40,50].forEach(z=>{ const yy=base-(z/50)*(base-top); rKm.append("line").attr("x1",X0-10).attr("x2",X0-4).attr("y1",yy).attr("y2",yy).attr("stroke",C.muted);
      V.t(rKm,X0-13,yy+4,z===50?"50 km":z,{anchor:"end",size:V.FS.small,fill:C.muted}); });
    V.t(rKm,X0-13,top-14,"esquema",{anchor:"end",size:11,italic:true,fill:C.muted});
    for(let mm=0;mm<=3.31;mm+=.1){ const yy=base-mm*k, big=Math.abs(mm-Math.round(mm))<.01, half=Math.abs(mm*10%5)<.01;
      rMm.append("line").attr("x1",X0-(big?16:half?12:9)).attr("x2",X0-4).attr("y1",yy).attr("y2",yy).attr("stroke",C.muted).attr("stroke-width",big?.9:.5);
      if(big)V.t(rMm,X0-19,yy+4,`${Math.round(mm)} mm`,{anchor:"end",size:V.FS.small,fill:C.muted}); }
    g.append("line").attr("x1",X0+gap*.5).attr("x2",X0+av-gap*.5).attr("y1",base+.5).attr("y2",base+.5).attr("stroke",C.ink).attr("stroke-width",.8);
    const labs=cols.map(c=>({t1:V.t(g,c.x+cw/2,base+18,c.t,{anchor:"middle",size:mob?11.5:12.5,weight:700}),
      t2:V.t(g,c.x+cw/2,base-6,"",{anchor:"middle",size:mob?11.5:12.5,fill:c.dyn?C.redDark:C.blueDark,weight:600,halo:3})}));
    // a mida real (escriptori)
    const gReal=g.append("g");
    if(real){ const rx=w-real+22; V.t(gReal,rx+14,base-3.4*PXMM-30,"a mida",{anchor:"middle",size:11,fill:C.ink2}); V.t(gReal,rx+14,base-3.4*PXMM-17,"real",{anchor:"middle",size:11,fill:C.ink2});
      cols.forEach((c,i)=>gReal.append("rect").attr("class","rl").attr("x",rx+i*10).attr("width",7).attr("fill",c.dyn?C.red:C.blue).attr("fill-opacity",i===1?.45:.8)); }
    function upd(){
      layout(cols[2]); const T=V.reduced?0:500;
      labs.forEach((l,i)=>{ const c=cols[i], mm=c.du/100;
        l.t2.text(mode==="comp"?`${f1(mm)} mm · ${f0(c.du)} DU`:`${f0(c.du)} DU`).transition().duration(T).attr("y",mode==="comp"?base-c.hb-8:top-6);
        if(c.dyn)l.t1.text(mob?`${H[yi].y}`:`Primavera de ${H[yi].y}`); });
      gReal.selectAll("rect.rl").each(function(_,i){ const mm=cols[i].du/100; d3.select(this).attr("y",base-mm*PXMM).attr("height",mm*PXMM); });
      rKm.transition().duration(T).style("opacity",mode==="aire"?1:0); rMm.transition().duration(T).style("opacity",mode==="comp"?1:0);
      gReal.transition().duration(T).style("opacity",mode==="comp"?1:0);
      cols.forEach(c=>c.dots.forEach(d=>{ if(mode==="comp"){ d.tx=d.cx; d.ty=d.cy; d.wait=d.del*.9; } else { d.tx=d.ax; d.ty=d.ay; d.wait=d.del*.4; } }));
      const y=H[yi].y;
      out.innerHTML=`<span>Primavera de <b>${y}</b>: mínim típic del forat entre el 21 de setembre i el 16 d'octubre (NASA), <b>${f1(H[yi].m/100)} mm</b>, ${f0((1-H[yi].m/300)*100)} % menys que la mitjana mundial.${y===1994?" És el valor més baix de tota la sèrie.":""}</span>`;
    }
    let hi=null;
    function frame(t,dt){ const sp=V.reduced?1e3:dt/1000, c=K.ctx; clear(K);
      cols.forEach((col,ci)=>{ c.beginPath();
        col.dots.forEach(d=>{ if(d.wait>0){ d.wait-=sp; } else { const f=Math.min(1,sp*d.sp*.5); d.x+=(d.tx-d.x)*f; d.y+=(d.ty-d.y)*f; } d.a=Math.min(1,d.a+sp*2);
          c.moveTo(d.x+R0,d.y); c.arc(d.x,d.y,R0,0,TAU); });
        const a=(mode==="comp"?.85:.5)*(hi==null||hi===ci?1:.45);
        c.fillStyle=V.alpha(col.dyn?(col.du<HOLE?C.red:C.blue):col.c,ci===1?a*.6:a); c.fill(); }); }
    el.__loop=V.loop(el,frame);
    api={upd};
    upd();
    V.onView(el,instant=>{ if(instant||V.reduced){ setMode("comp"); return; } setTimeout(()=>setMode("comp"),1100); });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
    V.hover(hit.node(),(ev,[px])=>{ const i=cols.findIndex(c=>px>=c.x-gap/2&&px<=c.x+cw+gap/2); hi=i<0?null:i; if(i<0){ tp.hide(); return; }
      const c=cols[i]; tp.show(`<b>${c.dyn?`Primavera de ${H[yi].y}`:c.t}</b> · ${f0(c.du)} DU = ${f1(c.du/100)} mm d'ozó comprimit`); },()=>{ hi=null; tp.hide(); });
  });
  function setMode(md){ mode=md; segs.forEach(o=>o.setAttribute("aria-pressed",o.dataset.k===md)); if(api)api.upd(); }
  segs.forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.k)));
  rng.min=0; rng.max=H.length-1; rng.value=yi;
  rng.addEventListener("input",()=>{ yi=+rng.value; rng.setAttribute("aria-valuetext",String(H[yi].y)); $("#gruix-y").textContent=H[yi].y; if(api)api.upd(); });
})();

/* =====================================================================
   V5 · TIME-01 + PART-01 · EL QUE DIU L'AIRE (CFC-11, CFC-12 i esfera ODGI)
   ===================================================================== */
(function cfc(){
  const box=$("#cfc-viz"), bar=$("#odgi-viz"); if(!box)return;
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, m={l:mob?36:46,r:mob?46:90,t:30,b:26}, h=mob?300:370;
    const s=V.svg(el,w,h,"Concentració mitjana mundial de CFC-11 i CFC-12 a l'aire, del 1978 al 2025: pugen fins als anys noranta i després baixen a poc a poc."), g=s.append("g");
    const x=d3.scaleLinear([1977,2026],[m.l,w-m.r]), y=d3.scaleLinear([0,560],[h-m.b,m.t]);
    const defs=s.append("defs");
    [["gr11",C.red],["gr12",C.ink2]].forEach(([id,c])=>{ const lg=defs.append("linearGradient").attr("id",id).attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",1);
      lg.append("stop").attr("offset",0).attr("stop-color",c).attr("stop-opacity",id==="gr11"?.24:.08); lg.append("stop").attr("offset",1).attr("stop-color",c).attr("stop-opacity",0); });
    [100,200,300,400,500].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.grid).attr("stroke-width",.6);
      V.t(g,m.l-6,y(v)+4,v===500&&!mob?"500 ppt":f0(v),{anchor:"end",size:V.FS.small,fill:C.muted}); });
    [1980,1990,2000,2010,2020].forEach(v=>V.t(g,x(v),h-6,v,{anchor:"middle",size:V.FS.small,fill:C.muted}));
    // Montreal 1987 i final de la producció mundial de CFC (2010): una marca a l'eix i un fil fi
    [[1987,mob?"Montreal":"Protocol de Montreal (1987)"],[2010,mob?"fi dels CFC":"fi de la producció de CFC (2010)"]].forEach(([yr,t])=>{
      g.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",m.t-6).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","1 3");
      g.append("circle").attr("cx",x(yr)).attr("cy",h-m.b).attr("r",3).attr("fill",C.ink);
      V.t(g,x(yr)+(yr===2010&&mob?-4:4),m.t-10,t,{size:11.5,fill:C.ink2,halo:3,anchor:yr===2010&&mob?"end":"start"}); });
    const ln=d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX), ar=d3.area().x(d=>x(d[0])).y0(y(0)).y1(d=>y(d[1])).curve(d3.curveMonotoneX);
    const clip=defs.append("clipPath").attr("id","cfcclip").append("rect").attr("x",0).attr("y",0).attr("height",h).attr("width",w);
    const gA=g.append("g").attr("clip-path","url(#cfcclip)");
    gA.append("path").datum(D.f12).attr("d",ar).attr("fill","url(#gr12)");
    gA.append("path").datum(D.f11).attr("d",ar).attr("fill","url(#gr11)");
    gA.append("path").datum(D.f12).attr("d",ln).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1.6);
    gA.append("path").datum(D.f11).attr("d",ln).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2.4);
    g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(0)).attr("y2",y(0)).attr("stroke",C.ink).attr("stroke-width",.8);
    const l12=D.f12[D.f12.length-1], l11=D.f11[D.f11.length-1], gEnd=g.append("g").style("opacity",0);
    [[l12,C.ink2,"CFC-12"],[l11,C.red,"CFC-11"]].forEach(([d,c,t])=>{ gEnd.append("circle").attr("cx",x(d[0])).attr("cy",y(d[1])).attr("r",3.5).attr("fill",c);
      V.t(gEnd,x(d[0])+8,y(d[1])+4,t,{size:12.5,weight:700,fill:c,halo:3}); if(!mob)V.t(gEnd,x(d[0])+8,y(d[1])+18,`${f0(d[1])} ppt`,{size:11.5,fill:C.ink2,halo:3}); });
    const pk=d3.greatest(D.f11,d=>d[1]), pk12=d3.greatest(D.f12,d=>d[1]);
    [[pk,C.red],[pk12,C.ink2]].forEach(([d,c])=>{ gEnd.append("circle").attr("cx",x(d[0])).attr("cy",y(d[1])).attr("r",8).attr("fill",c).attr("fill-opacity",.15);
      gEnd.append("circle").attr("cx",x(d[0])).attr("cy",y(d[1])).attr("r",3).attr("fill",c); });
    if(!mob){
      V.note(gEnd,{x:x(pk[0]),y:y(pk[1])+6,tx:x(pk[0])+18,ty:y(pk[1])+52,kind:"curve",bend:-10,anchor:"start",lines:[[`CFC-11, màxim: ${f0(pk[1])} ppt (${pk[0]})`,true],["després, la baixada lenta"]],size:11.5});
      const a=D.f11.find(d=>d[0]===2015);
      V.box(gEnd,x(2012.6),y(a[1])-16,x(2018.4)-x(2012.6),30);
      V.note(gEnd,{x:x(2015.5),y:y(a[1])+15,tx:x(2015.5)-20,ty:y(a[1])+58,kind:"curve",bend:8,anchor:"end",lines:[["2013–2018: la baixada s'alenteix",true],["emissions noves i no declarades"]],size:11.5});
    }
    // animació d'entrada: es dibuixa d'esquerra a dreta
    clip.attr("width",V.reduced?w:m.l);
    V.onView(el,instant=>{ clip.transition().duration(instant?0:2000).ease(d3.easeCubicInOut).attr("width",w); gEnd.transition().delay(instant?0:1600).duration(instant?0:500).style("opacity",1); });
    const tp=V.tip(el), H2=g.append("g").attr("pointer-events","none"), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
    V.hover(hit.node(),(ev,[px])=>{ const yr=clamp(Math.round(x.invert(px)),1978,2025), a=D.f11.find(d=>d[0]===yr), b=D.f12.find(d=>d[0]===yr); if(!a||!b)return;
      H2.selectAll("*").remove(); H2.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.8);
      [[a,C.red],[b,C.ink2]].forEach(([d,c])=>H2.append("circle").attr("cx",x(yr)).attr("cy",y(d[1])).attr("r",4).attr("fill",c).attr("stroke",C.paper).attr("stroke-width",1.4));
      tp.show(`<b>${yr}</b> · CFC-11: ${f1(a[1])} ppt · CFC-12: ${f1(b[1])} ppt (parts per bilió)`); },()=>{ tp.hide(); H2.selectAll("*").remove(); });
  });
  // Esfera de l'índex ODGI-A: l'agulla va de 100 (màxim, 2001) cap a 0 (nivell del 1980) any rere any
  if(bar)V.mount(bar,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, A=D.odgiA.filter(d=>d[0]>=2001), last=A[A.length-1];
    const R=mob?Math.min(w*.36,130):150, cx=w/2, cy=R+(mob?34:40), h=cy+(mob?62:56), th=mob?12:15;
    const s=V.svg(el,w,h,`Índex de gasos que destrueixen l'ozó sobre l'Antàrtida: de 100 al màxim (2001–2002) a ${f1(last[1])} a principis del ${last[0]}; el zero és el nivell del 1980, previst cap al 2070.`), g=s.append("g").attr("transform",`translate(${cx},${cy})`);
    const ang=d3.scaleLinear([100,0],[-Math.PI/2,Math.PI/2]);
    const arc=d3.arc().innerRadius(R-th).outerRadius(R).cornerRadius(2);
    g.append("path").attr("d",arc({startAngle:ang(100),endAngle:ang(0)})).attr("fill",C.grid);
    const done=g.append("path").attr("fill",C.blue).attr("fill-opacity",.75);
    d3.range(0,101,10).forEach(v=>{ const a=ang(v), big=v%50===0; g.append("line").attr("x1",Math.sin(a)*(R+3)).attr("y1",-Math.cos(a)*(R+3)).attr("x2",Math.sin(a)*(R+(big?10:6))).attr("y2",-Math.cos(a)*(R+(big?10:6))).attr("stroke",C.muted).attr("stroke-width",big?.9:.6); });
    V.t(g,Math.sin(ang(100))*(R+6)-2,-Math.cos(ang(100))*(R+6)+22,"100",{anchor:"end",size:12,weight:700});
    V.t(g,Math.sin(ang(100))*(R+6)-2,-Math.cos(ang(100))*(R+6)+36,mob?"màxim":"màxim de clor i brom (2001–2002)",{anchor:mob?"end":"middle",size:11.5,fill:C.ink2}).attr("x",mob?-R:-R+th/2);
    V.t(g,R+2,22,"0",{anchor:"start",size:12,weight:700}).attr("x",R-th/2-2).attr("text-anchor","middle");
    V.t(g,R-th/2,36,mob?"nivell del 1980":"nivell del 1980 (cap al 2070)",{anchor:mob?"start":"middle",size:11.5,fill:C.ink2}).attr("x",mob?R-th-20:R-th/2);
    const needle=g.append("line").attr("stroke",C.ink).attr("stroke-width",1.8).attr("stroke-linecap","round"), tipC=g.append("circle").attr("r",3.5).attr("fill",C.ink);
    const yT=V.t(g,0,-R*.42,"",{anchor:"middle",size:mob?26:34,serif:true,weight:600}), vT=V.t(g,0,-R*.42+(mob?20:24),"",{anchor:"middle",size:mob?12:13,fill:C.ink2,weight:600});
    const pT=V.t(g,0,-R*.42+(mob?36:42),"",{anchor:"middle",size:11.5,fill:C.ink2});
    function show(v,yr){ const a=ang(v); const r0=R-th-(mob?22:30), r1=R+4; needle.attr("x1",Math.sin(a)*r0).attr("y1",-Math.cos(a)*r0).attr("x2",Math.sin(a)*r1).attr("y2",-Math.cos(a)*r1); tipC.attr("cx",Math.sin(a)*r0).attr("cy",-Math.cos(a)*r0);
      done.attr("d",arc({startAngle:ang(100),endAngle:a}));
      yT.text(yr); vT.text(`índex ${f1(v)}`); pT.text(`${f0(100-v)} % del camí cap al 1980`); }
    show(100,2001);
    V.onView(el,instant=>{ if(instant){ show(last[1],last[0]); return; }
      const t=d3.scaleLinear([0,1],[0,A.length-1]);
      d3.select(el).transition().duration(2600).ease(d3.easeCubicOut).tween("odgi",()=>e=>{ const f=t(e), i=Math.floor(f), j=Math.min(i+1,A.length-1), u=f-i; show(A[i][1]+(A[j][1]-A[i][1])*u,A[Math.round(f)][0]); }); });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
    V.hover(hit.node(),(ev,[px,py])=>{ const a=Math.atan2(px-cx,-(py-cy)); if(a<-Math.PI/2-.2||a>Math.PI/2+.2){ tp.hide(); return; }
      const v=clamp(ang.invert(a),0,100), d=d3.least(A,q=>Math.abs(q[1]-v));
      show(d[1],d[0]); tp.show(`<b>Principis del ${d[0]}</b> · índex ${f1(d[1])} sobre l'Antàrtida (100 = màxim; 0 = nivell del 1980)`); },()=>{ tp.hide(); show(last[1],last[0]); });
  });
})();

/* =====================================================================
   V6 · MAP-03 + SPREAD-03 · 198 PARTS (el mapa es transforma en una escala d'anys)
   ===================================================================== */
(function paisos(){
  const box=$("#paisos-viz"), segs=document.querySelectorAll('[data-seg="paisos"] button'), play=$("#paisos-play"), lab=$("#paisos-y"), cnt=$("#paisos-n");
  if(!box)return;
  const R=D.ratif.map((r,i)=>({ca:r[0],wa:r[1],d:new Date(r[2]+"T00:00:00Z"),k:r[3]})).sort((a,b)=>a.d-b.d);
  R.forEach((r,i)=>{ r.n=i+1; r.y=r.d.getUTCFullYear(); });
  const byWA=new Map(R.filter(r=>r.wa).map(r=>[r.wa,r]));
  const NOPART={"Greenland":"Groenlàndia","Taiwan":"Taiwan","W. Sahara":"Sàhara Occidental","Kosovo":"Kosovo","Somaliland":"Somalilàndia","N. Cyprus":"Xipre del Nord","Puerto Rico":"Puerto Rico","Falkland Is.":"Illes Malvines","New Caledonia":"Nova Caledònia","Fr. S. Antarctic Lands":"Terres Australs i Antàrtiques Franceses"};
  const yr=d3.scaleSequential(d3.piecewise(d3.interpolateLab,[C.redDark,C.red,C.redLight,"#F2D6CC"])).domain([1988,2010]).clamp(true);
  let mode="mapa", T=2020, api=null, timer=0, playing=false;
  const fmtD=d=>`${d.getUTCDate()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${d.getUTCFullYear()}`;
  function build(el,w,W){
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, hMap=Math.round(w*(mob?.62:.5));
    // escala d'anys: una columna per any, una part per punt, de baix a dalt per ordre de data
    const sub=mob?1:2, Y0=1988, Y1=2019, mL=mob?6:14, mR=mob?6:14, band=(w-mL-mR)/(Y1-Y0+1), sp=Math.min(band/sub,mob?8.6:12), rr=Math.max(2.2,sp*.4);
    const counts=d3.rollup(R,v=>v.length,r=>r.y), maxRows=Math.ceil(d3.max(counts.values())/sub);
    const hCr=Math.round(maxRows*sp+(mob?100:96)), h=hMap, axY=hCr-26;
    const xc=y=>mL+(y-Y0+.5)*band;
    const idx=new Map(); R.forEach(r=>{ const i=idx.get(r.y)||0; idx.set(r.y,i+1); r.cx=xc(r.y)+((i%sub)-(sub-1)/2)*sp; r.cy=axY-6-rr-Math.floor(i/sub)*sp; });
    const s=V.svg(el,w,h,"Les 198 parts del Protocol de Montreal: en el mapa, cada país s'acoloreix segons l'any en què s'hi va unir; en la cronologia, cada punt és una part, de Mèxic el 1988 a Palestina el 2019."), g=s.append("g");
    const gMap=g.append("g"), gCr=g.append("g").style("opacity",0), gRip=g.append("g").attr("pointer-events","none"), gDots=g.append("g");
    let paths=null, proj=null;
    if(W){ proj=d3.geoEqualEarth().fitExtent([[4,4],[w-4,hMap-4]],{type:"Sphere"}); const p=d3.geoPath(proj);
      gMap.append("path").datum({type:"Sphere"}).attr("d",p).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.6);
      gMap.append("path").datum(d3.geoGraticule10()).attr("d",p).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.4);
      const feats=W.countries.features.filter(f=>f.properties.name!=="Antarctica");
      paths=gMap.selectAll("path.c").data(feats).join("path").attr("class","c").attr("d",p).attr("stroke",C.paper).attr("stroke-width",.5);
      feats.forEach(f=>{ const r=byWA.get(f.properties.name); if(r){ const c=p.centroid(f); if(isFinite(c[0])){ r.mx=c[0]; r.my=c[1]; } } }); }
    // eix de la cronologia
    gCr.append("line").attr("x1",mL).attr("x2",w-mR).attr("y1",axY).attr("y2",axY).attr("stroke",C.ink).attr("stroke-width",.7);
    (mob?[1988,1995,2005,2019]:[1988,1990,1995,2000,2005,2010,2015,2019]).forEach(v=>{ gCr.append("line").attr("x1",xc(v)).attr("x2",xc(v)).attr("y1",axY).attr("y2",axY+4).attr("stroke",C.muted); V.t(gCr,xc(v),axY+17,v,{anchor:"middle",size:V.FS.small,fill:C.muted}); });
    const col=r=>yr(r.y);
    const dots=gDots.selectAll("circle").data(R).join("circle").attr("r",rr).attr("fill",col).attr("stroke",C.paper).attr("stroke-width",.6);
    // anotacions de la cronologia
    const top1=r=>r.cy-rr;
    const mex=R[0], tim=R.find(r=>r.ca==="Timor Oriental"), pal=R.find(r=>r.ca==="Palestina"), col88=R.filter(r=>r.y===1988);
    const yTop=d3.min(col88,top1), yAll=d3.min(R,top1);
    V.note(gCr,{x:xc(1988)-band/2+1,y:mex.cy,tx:xc(1988)-band/2+1,ty:yAll-14,kind:"straight",anchor:"start",lines:[[mob?"Mèxic, el primer":"Mèxic, el primer (31-03-1988)",true]],size:mob?11:12});
    if(tim)V.note(gCr,{x:tim.cx,y:top1(tim)-2,tx:tim.cx,ty:mob?yTop-2:axY-104,kind:"straight",anchor:"end",lines:mob?[["2009: tota l'ONU",true]]:[["Andorra i Timor Oriental (2009)",true],["amb Timor, tots els membres de l'ONU"]],size:mob?11:12});
    if(pal)V.note(gCr,{x:pal.cx,y:top1(pal)-2,tx:pal.cx,ty:mob?yTop+26:axY-60,kind:"straight",anchor:"end",lines:[[mob?"Palestina (2019)":"Palestina, la darrera (2019)",true]],size:mob?11:12});
    gCr.selectAll(".ibv-note").raise();
    // estats
    function place(md,instant){ const D0=instant||V.reduced?0:900, H2=md==="crono"?hCr:hMap;
      s.transition().duration(D0).attr("height",H2).attr("viewBox",`0 0 ${w} ${H2}`);
      gMap.transition().duration(D0*.7).style("opacity",md==="mapa"?1:0).on("end",function(){ d3.select(this).attr("pointer-events",md==="mapa"?null:"none"); });
      gCr.transition().delay(md==="crono"?D0*.6:0).duration(D0*.5).style("opacity",md==="crono"?1:0);
      dots.interrupt().transition().duration(D0).delay((d,i)=>instant?0:(md==="crono"?i*3:0)).ease(d3.easeCubicInOut)
        .attr("cx",d=>md==="crono"||d.mx==null?d.cx:d.mx).attr("cy",d=>md==="crono"||d.mx==null?d.cy:d.my)
        .attr("r",md==="crono"?rr:(d=>d.mx==null?0:2)).style("opacity",md==="crono"?1:0);
      dots.attr("pointer-events",md==="crono"?null:"none");
    }
    const tp=V.tip(el);
    function paint(){ if(!paths)return; paths.attr("fill",f=>{ const r=byWA.get(f.properties.name); if(!r)return C.land; return r.y<=T?yr(r.y):C.land; }); }
    function ripple(y){ if(!proj||V.reduced)return; R.filter(r=>r.y===y&&r.mx!=null).forEach((r,i)=>{
      gRip.append("circle").attr("cx",r.mx).attr("cy",r.my).attr("r",2).attr("fill",yr(y)).attr("fill-opacity",.45)
        .transition().delay(i*25).duration(1100).ease(d3.easeCubicOut).attr("r",mob?12:20).attr("fill-opacity",0).remove(); }); }
    if(paths)paths.on("pointermove pointerdown",(ev,f)=>{ const r=byWA.get(f.properties.name); V.focus(paths,q=>q===f,{dim:.55}); d3.select(ev.currentTarget).raise().attr("stroke",C.ink).attr("stroke-width",1.2);
        tp.show(r?`<b>${r.ca}</b> · s'hi va unir ${r.k==="d"?"per successió ":""}el ${fmtD(r.d)} (part núm. ${r.n})`:`<b>${NOPART[f.properties.name]||f.properties.name}</b> · no figura com a part a la llista de l'ONU (territori d'un altre estat o sense reconeixement general)`); })
      .on("pointerleave",(ev)=>{ tp.hide(); V.focus(paths,null); d3.select(ev.currentTarget).attr("stroke",C.paper).attr("stroke-width",.5); });
    dots.on("pointermove pointerdown",(ev,d)=>{ V.focus(dots,q=>q===d||q.y===d.y,{dim:.5}); d3.select(ev.currentTarget).raise().attr("stroke",C.ink).attr("stroke-width",1.4);
        tp.show(`<b>${d.ca}</b> · ${fmtD(d.d)} · part núm. ${d.n} de 198`); })
      .on("pointerleave",(ev)=>{ tp.hide(); V.focus(dots,null); d3.select(ev.currentTarget).attr("stroke",C.paper).attr("stroke-width",.6); });
    paint(); place(mode,true);
    return {paint,place,ripple,dots,gCr};
  }
  V.mount(box,(el,w)=>{ worldP.then(W=>{ api=build(el,w,W);
    V.onView(el,instant=>{ if(instant||mode!=="crono")return; api.dots.attr("r",0).transition().duration(500).delay((d,i)=>i*5).attr("r",null); }); }); });
  function setT(y){ T=y; lab.textContent=y>=2019?"2019":y; if(cnt)cnt.textContent=R.filter(r=>r.y<=y).length; if(api){ api.paint(); api.ripple(y); } }
  segs.forEach(b=>b.addEventListener("click",()=>{ segs.forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; stop();
    $("#paisos-ctl").style.visibility=mode==="mapa"?"visible":"hidden"; if(mode==="crono"){ T=2020; if(api)api.paint(); } if(api)api.place(mode); }));
  function stop(){ playing=false; clearTimeout(timer); play.textContent="Reprodueix →"; }
  function step(){ if(!playing)return; if(T>=2019){ stop(); return; } setT(T+1); timer=setTimeout(step,V.reduced?0:560); }
  play.addEventListener("click",()=>{ if(playing){ stop(); return; } setT(1987); playing=true; play.textContent="Pausa"; timer=setTimeout(step,300); });
})();

/* =====================================================================
   V7 · TIME-01 + CASE-02 · EL MÓN QUE VAM EVITAR (dades reals + punts d'una simulació)
   ===================================================================== */
(function evitat(){
  const box=$("#evitat-viz"); if(!box)return;
  const NG=D.ng;
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, m={l:mob?40:56,r:mob?12:150,t:28,b:28}, h=mob?340:380;
    const s=V.svg(el,w,h,"Ozó total mitjà entre 60° S i 60° N de 1979 a 2025 (dades reals): baixa fins a un 6 % el 1993 i després es manté uns 2–3 % per sota del 1980. En vermell, la simulació sense Protocol de Newman et al. (2009): −17 % el 2020 i −67 % el 2065."), g=s.append("g");
    const x=d3.scaleLinear([1975,2070],[m.l,w-m.r]), y=d3.scaleLinear([-75,5],[h-m.b,m.t]);
    const defs=s.append("defs"), lg=defs.append("linearGradient").attr("id","evgr").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",1);
    lg.append("stop").attr("offset",0).attr("stop-color",C.red).attr("stop-opacity",.04); lg.append("stop").attr("offset",1).attr("stop-color",C.red).attr("stop-opacity",.34);
    [-25,-50,-75].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.grid).attr("stroke-width",.6);
      V.t(g,m.l-6,y(v)+4,`${v} %`,{anchor:"end",size:V.FS.small,fill:C.muted}); });
    V.t(g,m.l-6,y(0)+4,"0 %",{anchor:"end",size:V.FS.small,fill:C.ink,weight:600});
    [1980,2000,2020,2040,2060].forEach(v=>V.t(g,x(v),h-6,v,{anchor:"middle",size:V.FS.small,fill:C.muted}));
    // simulació sense Protocol (Newman et al. 2009): només els punts publicats i una corba suau entre ells
    const av=[[1980,0],[2020,-17],[2065,-67]], cv=d3.curveMonotoneX;
    const clip=defs.append("clipPath").attr("id","evclip").append("rect").attr("x",0).attr("y",0).attr("height",h).attr("width",V.reduced?w:m.l);
    const gS=g.append("g").attr("clip-path","url(#evclip)");
    gS.append("path").datum(av).attr("d",d3.area().x(d=>x(d[0])).y0(y(0)).y1(d=>y(d[1])).curve(cv)).attr("fill","url(#evgr)");
    gS.append("path").datum(av).attr("d",d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(cv)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2).attr("stroke-dasharray","5 4");
    g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(0)).attr("y2",y(0)).attr("stroke",C.ink).attr("stroke-width",.9);
    // observat: mitjana anual 60° S–60° N (MSR-2) respecte del 1979–1981
    const obs=g.append("path").datum(NG).attr("d",d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",2.2);
    const gLab=g.append("g").style("opacity",0);
    // previsió (avaluació 2022): retorn al valor del 1980 cap al 2040 per a 60° N–60° S
    const lastO=NG[NG.length-1];
    gLab.append("path").attr("d",`M${x(lastO[0])},${y(lastO[1])}C${x(2032)},${y(lastO[1])} ${x(2034)},${y(0)} ${x(2040)},${y(0)}`).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",1.2).attr("stroke-dasharray","2 3");
    gLab.append("circle").attr("cx",x(2040)).attr("cy",y(0)).attr("r",5).attr("fill",C.paper).attr("stroke",C.blue).attr("stroke-width",1.6);
    V.t(gLab,x(2040),y(0)-11,mob?"~2040":"retorn previst ~2040",{anchor:"middle",size:mob?10.5:11.5,fill:C.blueDark,weight:600,halo:3});
    av.slice(1).forEach(d=>{ gLab.append("circle").attr("cx",x(d[0])).attr("cy",y(d[1])).attr("r",9).attr("fill",C.red).attr("fill-opacity",.15);
      gLab.append("circle").attr("cx",x(d[0])).attr("cy",y(d[1])).attr("r",5).attr("fill",C.red); });
    V.t(gLab,x(2065)+(mob?-10:12),y(-67)+(mob?-14:4),"−67 % el 2065",{anchor:mob?"end":"start",size:12.5,weight:700,fill:C.red,halo:3});
    V.t(gLab,x(2020)+12,y(-17)+4,"−17 % el 2020",{size:12.5,weight:700,fill:C.red,halo:3});
    // dins de l'àrea: l'ozó perdut i la UV
    V.t(gLab,x(mob?2049:2040),y(mob?-35:-26),mob?"l'ozó que":"l'ozó que s'hauria perdut",{anchor:"middle",size:mob?11.5:12.5,weight:700,fill:C.redDark,halo:3});
    V.t(gLab,x(mob?2049:2040),y(mob?-35:-26)+15,mob?"s'hauria perdut":"sense el Protocol",{anchor:"middle",size:11.5,fill:C.ink2,halo:3});
    if(!mob){ const p60=y(-58);
      V.note(gLab,{x:x(2060),y:p60+2,tx:x(2048),ty:y(-62),kind:"curve",bend:-10,anchor:"end",lines:[["cap al 2060, la UV d'estiu",true],["més que doblada a les latituds"],["mitjanes del nord"]],size:11.5});
      const p93=NG.find(d=>d[0]===1993);
      V.note(gLab,{x:x(1993),y:y(p93[1])+3,tx:x(1993)+26,ty:y(-14),kind:"straight",anchor:"start",lines:[["1993: −6 %",true],["després de l'erupció del Pinatubo"]],size:11.5});
      V.t(gLab,x(2070)+8,y(-55),"Sense el Protocol",{size:12.5,weight:700,fill:C.red});
      V.t(gLab,x(2070)+8,y(-55)+15,"(simulació, ozó mundial)",{size:11.5,fill:C.ink2});
      V.t(gLab,x(2070)+8,y(0)-4,"Amb el Protocol",{size:12.5,weight:700,fill:C.blue});
      V.t(gLab,x(2070)+8,y(0)+11,"(observat, 60° S–60° N)",{size:11.5,fill:C.ink2}); }
    else { V.t(gLab,x(1979),y(-62),"Sense el Protocol (simulació)",{size:11,weight:700,fill:C.red,halo:3});
      V.t(gLab,x(1979),y(-12),"Observat (60° S–60° N)",{size:11,weight:700,fill:C.blue,halo:3}); }
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair"), H=g.append("g").attr("pointer-events","none");
    V.hover(hit.node(),(ev,[px])=>{ const yv=Math.round(x.invert(px)), d=NG.find(q=>q[0]===yv); H.selectAll("*").remove();
      const near=d3.least(av.slice(1),q=>Math.abs(x(q[0])-px));
      if(near&&Math.abs(x(near[0])-px)<16){ H.append("circle").attr("cx",x(near[0])).attr("cy",y(near[1])).attr("r",7).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
        tp.show(`<b>${near[0]}, sense el Protocol</b> · ${V.signed(near[1],0)} % d'ozó mundial respecte del 1980 (simulació de Newman et al., 2009)`); return; }
      if(!d){ tp.hide(); return; }
      H.append("line").attr("x1",x(yv)).attr("x2",x(yv)).attr("y1",y(0)).attr("y2",y(d[1])).attr("stroke",C.ink).attr("stroke-width",.7);
      H.append("circle").attr("cx",x(yv)).attr("cy",y(d[1])).attr("r",4).attr("fill",C.blue).attr("stroke",C.ink).attr("stroke-width",1.4);
      tp.show(`<b>${yv}</b> · ozó mitjà entre 60° S i 60° N: ${V.signed(d[1],1)} % respecte del 1979–1981`); },()=>{ tp.hide(); H.selectAll("*").remove(); });
    const L=obs.node().getTotalLength(); obs.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L);
    V.onView(el,instant=>{ obs.transition().duration(instant?0:1300).attr("stroke-dashoffset",0).on("end",()=>obs.attr("stroke-dasharray",null));
      clip.transition().delay(instant?0:500).duration(instant?0:2000).ease(d3.easeCubicInOut).attr("width",w);
      gLab.transition().delay(instant?0:1900).duration(instant?0:600).style("opacity",1); });
  });
})();

})();
