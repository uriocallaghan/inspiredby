/* «Com vam començar a tancar el forat de l'ozó» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-forat   MAP-18 + MAP-07  Globus polar: mitjana d'octubre de l'ozó (KNMI/TEMIS MSR-2) amb la isolínia de 220 DU
   V2 #f-anys    MAP-16 + TIME-01 El mateix globus amb lliscant 1979–2025 i la sèrie de la NASA
   V3 #s-clor    HOW-01           Tall de l'atmosfera: com el clor destrueix l'ozó (esquema)
   V4 #f-gruix   SCALE-02         Tres mil·límetres: gruix de l'ozó comprimit, a mida real
   V5 #f-cfc     TIME-01 + PART-01 CFC-11 i CFC-12 (NOAA) i índex ODGI
   V6 #f-paisos  MAP-03 + SPREAD-03 Les 198 parts del Protocol de Montreal
   V7 #f-evitat  TIME-01 + CASE-02 El món que vam evitar: ozó 60° S–60° N observat (MSR-2) i simulació sense Protocol (Newman et al. 2009)
   Colors: blau = ozó; vermell = el que el destrueix / el forat; groc = llum del sol (només superfícies). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.OZ_DATA, G=window.OZ_OCT;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const BLEND=window.IBTheme&&IBTheme.dark?"screen":"multiply";
const HOLE=220;

/* ---------- ajudants ---------- */
function mkCanvas(el,w,h,label){
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.className="ibv"; c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0`;
  if(label){ c.setAttribute("role","img"); c.setAttribute("aria-label",label); } else c.setAttribute("aria-hidden","true");
  el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx,dpr};
}
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
// rampa: per sota de 220 DU, vermells (el forat); per sobre, blaus (més ozó, més fosc)
const RED=d3.scaleLinear([100,150,200,HOLE],[C.redDark,C.red,"#E07A5F",C.redLight]).clamp(true);
const BLU=V.seq(C.blue,[200,460]);
const ozColor=du=>du<HOLE?RED(du):BLU(du);
const PLACES=[
  {n:"Pol Sud",ll:[0,-90],a:"start",dx:7,dy:4},
  {n:"Halley",ll:[-26.2,-75.6],a:"end",dx:-7,dy:4},
  {n:"McMurdo",ll:[166.7,-77.85],a:"start",dx:7,dy:4},
  {n:"Punta Arenas",ll:[-70.9,-53.16],a:"end",dx:-7,dy:-5},
  {n:"Ushuaia",ll:[-68.3,-54.8],a:"end",dx:-7,dy:14,mobOff:true}
];
let WORLD=null; const worldP=V.world().then(w=>{ WORLD=w; return w; }).catch(()=>null);

// Globus polar reutilitzable: dibuixa el camp d'un any amb la isolínia de 220 DU
function polarGlobe(el,w,h,o){
  o=o||{};
  const mob=w<640, st=stage(el,h);
  const R=Math.min(w,h)/2-(mob?6:14);
  const proj=d3.geoOrthographic().rotate([0,90,0]).scale(R/Math.sin(56*Math.PI/180)).translate([w/2,h/2]).clipAngle(90);
  const {c:cv,ctx,dpr}=mkCanvas(st,w,h,o.label||"Mapa de l'hemisferi sud vist des de sota, amb la mitjana d'octubre de l'ozó total. El forat (menys de 220 unitats Dobson) en vermell.");
  const s=overlay(st,w,h), g=s.append("g"), gL=s.append("g"), gH=s.append("g").attr("pointer-events","none");
  const res=mob?2:2, fw=Math.ceil(w/res), fh=Math.ceil(h/res);
  const off=document.createElement("canvas"); off.width=fw; off.height=fh; const ox=off.getContext("2d"), im=ox.createImageData(fw,fh);
  // posicions lon/lat de cada cel·la de pantalla (una sola vegada)
  const LL=new Float32Array(fw*fh*2).fill(NaN);
  for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){ const ll=proj.invert([(x+.5)*res,(y+.5)*res]); if(ll&&ll[1]<=G.lat0+(G.ny-1)*G.dlat){ LL[(y*fw+x)*2]=ll[0]; LL[(y*fw+x)*2+1]=ll[1]; } }
  const grid=new Float64Array(fw*fh);
  const pth=d3.geoPath(proj,ctx);
  const edge=d3.geoCircle().center([0,-90]).radius(G.ny*G.dlat-G.dlat)();
  const contourPath=d3.geoPath(d3.geoIdentity().scale(res));
  let cur=-1, Z=null;
  function draw(yi){
    cur=yi; const d=im.data;
    for(let k=0;k<fw*fh;k++){
      const lon=LL[k*2], lat=LL[k*2+1];
      if(lat!==lat){ d[k*4+3]=0; grid[k]=999; continue; }
      const du=OZ.val(yi,lon,lat); grid[k]=du;
      const c=d3.rgb(ozColor(du)); d[k*4]=c.r; d[k*4+1]=c.g; d[k*4+2]=c.b; d[k*4+3]=255;
    }
    ox.putImageData(im,0,0);
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.save(); ctx.beginPath(); pth(edge); ctx.clip(); ctx.imageSmoothingEnabled=true; ctx.drawImage(off,0,0,w,h);
    // vora esvaïda cap a les latituds mitjanes
    const pe=proj([0,G.lat0+(G.ny-1)*G.dlat]), re=Math.hypot(pe[0]-w/2,pe[1]-h/2), gr=ctx.createRadialGradient(w/2,h/2,re*.72,w/2,h/2,re);
    gr.addColorStop(0,"rgba(255,255,255,0)"); gr.addColorStop(1,"rgba(255,255,255,.85)"); ctx.fillStyle=gr; ctx.fillRect(0,0,w,h);
    ctx.restore();
    // retícula de latitud
    ctx.strokeStyle=V.alpha(C.ink,.16); ctx.lineWidth=.5;
    [-80,-70,-60,-50,-40].forEach(lat=>{ ctx.beginPath(); pth(d3.geoCircle().center([0,-90]).radius(90+lat)()); ctx.stroke(); });
    // costes
    if(WORLD){ ctx.save(); ctx.beginPath(); pth(d3.geoCircle().center([0,-90]).radius(58)()); ctx.clip(); ctx.beginPath(); pth(WORLD.land); ctx.strokeStyle=V.alpha(C.ink,.62); ctx.lineWidth=.8; ctx.stroke(); ctx.restore(); }
    // isolínia de 220 DU
    const cs=d3.contours().size([fw,fh]).thresholds([-HOLE])(Array.from(grid,v=>-v));
    g.selectAll("path.iso").data(cs).join("path").attr("class","iso").attr("d",contourPath)
      .attr("fill","none").attr("stroke",C.red).attr("stroke-width",mob?1.4:1.8).attr("stroke-linejoin","round");
    Z=grid;
    if(o.onDraw)o.onDraw(yi);
  }
  // etiquetes de llocs
  PLACES.forEach(p=>{ if(mob&&p.mobOff)return; const xy=proj(p.ll); if(!xy)return;
    if(mob&&p.n==="Punta Arenas")p=Object.assign({},p,{a:"start",dx:2,dy:17});
    gL.append("circle").attr("cx",xy[0]).attr("cy",xy[1]).attr("r",2.4).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",1.2);
    V.t(gL,xy[0]+p.dx,xy[1]+p.dy,p.n,{anchor:p.a,size:mob?11:12,weight:600,halo:3}); });
  [["Antàrtida",[60,-72]],["Amèrica del Sud",[-62,-44]],["Oceà Índic",[80,-48]],["Oceà Pacífic",[-150,-50]]].forEach(([t,ll])=>{
    if(mob&&t!=="Antàrtida")return; const xy=proj(ll); V.t(gL,xy[0],xy[1],t,{italic:true,size:mob?11:12,fill:C.ink2,anchor:"middle",halo:2.5}); });
  // hover: valor real de l'ozó on apuntes
  const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
  V.hover(hit.node(),(ev,[px,py])=>{ const ll=proj.invert([px,py]); gH.selectAll("*").remove();
    if(!ll||ll[1]>G.lat0+(G.ny-1)*G.dlat){ tp.hide(); return; }
    const du=OZ.val(cur,ll[0],ll[1]);
    gH.append("circle").attr("cx",px).attr("cy",py).attr("r",3.2).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",1.5);
    V.t(gH,px+9,py-7,`${f0(du)} DU`,{size:12.5,weight:700,halo:3.4});
    tp.show(`<b>Octubre de ${OZ.years[cur]}</b> · ${f0(du)} unitats Dobson de mitjana a ${f0(-ll[1])}° S, ${f0(Math.abs(ll[0]))}° ${ll[0]<0?"O":"E"}${du<HOLE?" · dins del forat":""}`);
  },()=>{ tp.hide(); gH.selectAll("*").remove(); });
  worldP.then(()=>{ if(cur>=0)draw(cur); });
  return {draw, proj, svg:s, gL, get cur(){ return cur; }};
}
function legendOz(el){
  if(!el)return; el.innerHTML="";
  const div=document.createElement("div"); div.className="ibv-lg"; el.appendChild(div);
  const W=210, H=34, s=d3.select(div).append("svg").attr("width",W).attr("height",H).style("display","block").style("overflow","visible");
  const x=d3.scaleLinear([100,460],[0,W-6]);
  d3.range(100,460,4).forEach(v=>s.append("rect").attr("x",x(v)).attr("y",12).attr("width",x(v+4)-x(v)+.5).attr("height",8).attr("fill",ozColor(v+2)));
  s.append("line").attr("x1",x(HOLE)).attr("x2",x(HOLE)).attr("y1",8).attr("y2",24).attr("stroke",C.ink).attr("stroke-width",1);
  [[100,"100"],[HOLE,"220"],[300,"300"],[460,"460 DU"]].forEach(([v,t])=>V.t(s,x(v),33,t,{size:11,fill:C.ink2,anchor:v===100?"start":v===460?"end":"middle"}));
  V.t(s,0,8,"← forat",{size:11,fill:C.ink2}); V.t(s,W-6,8,"més ozó →",{size:11,fill:C.ink2,anchor:"end"});
}

/* =====================================================================
   V1 · MAP-18 + MAP-07 · QUARANTA-SET PRIMAVERES (scrolly)
   ===================================================================== */
(function forat(){
  const box=$("#forat-viz"), stepsEl=$("#s-forat .steps"); if(!box||!OZ)return;
  legendOz($("#forat-lg"));
  const STEPS=[1979,1985,1987,2006,2025];
  let cur=0, api=null;
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w,vh*.42):Math.min(w,vh*.74));
    api=polarGlobe(el,w,h,{onDraw:yi=>{
      const y=OZ.years[yi]; api&&api.svg.selectAll("g.yr").remove();
      if(!api)return; const gy=api.svg.append("g").attr("class","yr");
      V.t(gy,mob?6:12,mob?18:28,String(y),{size:mob?20:30,weight:600,serif:true,halo:3});
      V.t(gy,mob?6:12,mob?33:48,"mitjana d'octubre",{size:mob?11:12.5,fill:C.ink2,halo:3});
    }});
    api.draw(OZ.years.indexOf(STEPS[cur]));
    V.onView(el,instant=>{ if(instant)return; const st=el.querySelector(".stage"); st.style.opacity=0; d3.select(st).transition().duration(800).style("opacity",1); });
  });
  IB.scrolly(stepsEl,$("#s-forat .graphic"),i=>{ cur=i; if(api)api.draw(OZ.years.indexOf(STEPS[i])); });
})();

/* =====================================================================
   V2 · MAP-16 + TIME-01 · CADA OCTUBRE, UN MAPA (lliscant + sèrie de la NASA)
   ===================================================================== */
(function anys(){
  const box=$("#anys-viz"), ser=$("#anys-ser"), rng=$("#anys-rng"), play=$("#anys-play"), lab=$("#anys-y");
  if(!box||!OZ)return;
  legendOz($("#anys-lg"));
  let yi=OZ.years.length-1, api=null, playing=false, timer=0, serCur=null;
  const H=D.hole.map(r=>({y:r[0],a:r[1],m:r[2]}));
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(Math.min(w*(mob?1:.62),vh*(mob?.55:.66)));
    api=polarGlobe(el,w,h,{label:"Mapa interactiu de l'hemisferi sud amb la mitjana d'octubre de l'ozó total de cada any entre 1979 i 2025.",onDraw:i=>{
      if(!api)return; api.svg.selectAll("g.yr").remove(); const gy=api.svg.append("g").attr("class","yr");
      V.t(gy,mob?6:12,mob?20:32,String(OZ.years[i]),{size:mob?22:34,weight:600,serif:true,halo:3}); }});
    api.draw(yi);
  });
  V.mount(ser,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, m={l:mob?34:44,r:mob?46:50,t:20,b:24}, h=mob?190:210;
    const s=V.svg(el,w,h,"Àrea mitjana del forat d'ozó (barres) i ozó mínim (línia) cada any del 1979 al 2025 segons la NASA."), g=s.append("g");
    const x=d3.scaleLinear([1978.5,2026.5],[m.l,w-m.r]), yA=d3.scaleLinear([0,30],[h-m.b,m.t]), yM=d3.scaleLinear([80,240],[h-m.b,m.t]);
    [0,10,20,30].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",yA(v)).attr("y2",yA(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,yA(v)+4,f0(v),{anchor:"end",size:V.FS.small,fill:C.muted}); });
    [100,150,200].forEach(v=>V.t(g,w-m.r+6,yM(v)+4,v===200?"200 DU":f0(v),{size:V.FS.small,fill:C.ink2}));
    const bw=Math.max(2,(x(1)-x(0))*.62);
    g.append("g").selectAll("rect").data(H).join("rect").attr("x",d=>x(d.y)-bw/2).attr("width",bw).attr("y",d=>yA(d.a)).attr("height",d=>yA(0)-yA(d.a))
      .attr("fill",C.red).attr("fill-opacity",.5);
    // 2026: estimació arrodonida de la NASA (sense mínim comparable)
    g.append("rect").attr("x",x(2026)-bw/2).attr("width",bw).attr("y",yA(D.hole2026)).attr("height",yA(0)-yA(D.hole2026)).attr("fill","none").attr("stroke",C.red).attr("stroke-dasharray","2 2");
    g.append("path").datum(H).attr("d",d3.line().defined(d=>d.m).x(d=>x(d.y)).y(d=>yM(d.m)).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",1.6);
    [1980,1990,2000,2010,2020].forEach(v=>V.t(g,x(v),h-6,v,{anchor:"middle",size:V.FS.small,fill:C.muted}));
    V.t(g,m.l,12,mob?"Àrea (milions de km²) i ozó mínim":"Àrea del forat en milions de km² (barres) i ozó mínim (línia blava)",{size:12,weight:600,fill:C.ink2});
    if(!mob){ const p=H.find(d=>d.y===2006); V.note(g,{x:x(2006),y:yA(p.a)-2,tx:x(2006)-40,ty:m.t+2,kind:"straight",anchor:"end",lines:[["2006, el més gran",true],["26,6 milions de km²"]],size:11.5}); }
    const cur=g.append("line").attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","2 2");
    serCur=y=>cur.attr("x1",x(y)).attr("x2",x(y));
    serCur(OZ.years[yi]);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
    V.hover(hit.node(),(ev,[px])=>{ const y=clamp(Math.round(x.invert(px)),1979,2026), d=H.find(q=>q.y===y);
      tp.show(y===2026?`<b>2026</b> · uns ${f0(D.hole2026)} milions de km² de mitjana (estimació de la NASA)`:d?`<b>${y}</b> · ${f1(d.a)} milions de km² de mitjana · mínim de ${f0(d.m)} DU`:`<b>${y}</b> · sense dades de satèl·lit`);
      if(ev.type==="pointerdown"&&y<=2025){ stop(); set(OZ.years.indexOf(y)); } },()=>tp.hide());
  });
  function set(i){ yi=clamp(i,0,OZ.years.length-1); rng.value=OZ.years[yi]; rng.setAttribute("aria-valuetext",`Octubre de ${OZ.years[yi]}`); lab.textContent=OZ.years[yi];
    if(api)api.draw(yi); if(serCur)serCur(OZ.years[yi]); }
  function stop(){ playing=false; clearTimeout(timer); play.textContent="Reprodueix →"; }
  function step(){ if(!playing)return; if(yi>=OZ.years.length-1){ stop(); return; } set(yi+1); timer=setTimeout(step,V.reduced?0:420); }
  play.addEventListener("click",()=>{ if(playing){ stop(); return; } if(yi>=OZ.years.length-1)set(0); playing=true; play.textContent="Pausa"; step(); });
  rng.addEventListener("input",()=>{ stop(); set(+rng.value-OZ.years[0]); });
  V.onView(box,instant=>{ if(instant)return; set(0); playing=true; play.textContent="Pausa"; timer=setTimeout(step,500); },{threshold:.45});
})();

/* =====================================================================
   V3 · HOW-01 · COM UN ÀTOM DE CLOR ES MENJA L'OZÓ (scrolly, esquema)
   ===================================================================== */
(function clor(){
  const box=$("#clor-viz"), stepsEl=$("#s-clor .steps"); if(!box)return;
  let cur=0;
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(mob?Math.min(340,vh*.42):Math.min(560,vh*.72));
    const st=stage(el,h);
    const m={l:mob?34:54,r:mob?8:20,t:14,b:26};
    const y=d3.scaleLinear([0,50],[h-m.b,m.t]), X0=m.l, X1=w-m.r;
    const {ctx}=mkCanvas(st,w,h,null);
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Tall de l'atmosfera de 0 a 50 km: els CFC pugen des de terra fins a l'estratosfera, on la llum ultraviolada n'allibera el clor, que destrueix l'ozó en un cicle que es repeteix.");
    const g=s.append("g");
    // franges: troposfera i estratosfera; capa d'ozó amb el màxim a uns 32 km
    g.append("rect").attr("x",X0).attr("width",X1-X0).attr("y",y(12)).attr("height",y(0)-y(12)).attr("fill",V.alpha(C.ink,.03));
    const oz=g.append("g");
    d3.range(14,46,1).forEach(k=>{ const a=Math.exp(-(((k-32)/8)**2))*.32; oz.append("rect").attr("x",X0).attr("width",X1-X0).attr("y",y(k+1)).attr("height",y(k)-y(k+1)+.5).attr("fill",C.blue).attr("fill-opacity",a); });
    [0,10,20,30,40,50].forEach(k=>{ g.append("line").attr("x1",X0-4).attr("x2",X0).attr("y1",y(k)).attr("y2",y(k)).attr("stroke",C.muted); V.t(g,X0-7,y(k)+4,k===50?"50 km":k,{anchor:"end",size:V.FS.small,fill:C.muted}); });
    V.t(g,X1-4,y(11)+4,"troposfera",{anchor:"end",italic:true,size:12,fill:C.ink2,halo:2.5});
    V.t(g,X1-4,y(44),"estratosfera",{anchor:"end",italic:true,size:12,fill:C.ink2,halo:2.5});
    V.t(g,X1-4,y(32)+4,mob?"capa d'ozó":"capa d'ozó (màxim a uns 32 km)",{anchor:"end",size:12,weight:700,fill:C.blueDark,halo:3});
    // terra: una nevera i un esprai
    const gx=X0+(X1-X0)*(mob?.16:.12), gy=y(0);
    g.append("rect").attr("x",gx-11).attr("y",gy-34).attr("width",22).attr("height",34).attr("rx",2).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
    g.append("line").attr("x1",gx-11).attr("x2",gx+11).attr("y1",gy-22).attr("y2",gy-22).attr("stroke",C.ink).attr("stroke-width",.8);
    g.append("rect").attr("x",gx+18).attr("y",gy-20).attr("width",8).attr("height",20).attr("rx",2).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
    V.t(g,gx,gy+16,"neveres, esprais, escumes",{anchor:"start",size:11,fill:C.ink2,halo:2.5}).attr("x",gx-11);
    // núvols estratosfèrics polars (pas 3) a 15–25 km
    const psc=g.append("g").style("opacity",0);
    d3.range(5).forEach(i=>psc.append("ellipse").attr("cx",X0+(X1-X0)*(.45+i*.1)).attr("cy",y(15+(i%2)*4)).attr("rx",mob?22:40).attr("ry",mob?5:8).attr("fill",C.ink).attr("fill-opacity",.06).attr("stroke",C.ink2).attr("stroke-opacity",.35).attr("stroke-width",.6));
    V.t(psc,X0+(X1-X0)*.66,y(10.5),mob?"núvols polars":"núvols estratosfèrics polars (hivern antàrtic)",{anchor:"middle",size:11.5,italic:true,fill:C.ink2,halo:2.5});
    // sol (pas 2 i 4)
    const sun=g.append("g").style("opacity",0);
    sun.append("circle").attr("cx",X1-24).attr("cy",y(48)).attr("r",14).attr("fill",C.yellow).attr("fill-opacity",.85);
    d3.range(7).forEach(i=>sun.append("line").attr("x1",X1-24-i*16).attr("y1",y(47)).attr("x2",X1-90-i*22).attr("y2",y(30)).attr("stroke",C.yellow).attr("stroke-width",2).attr("stroke-opacity",.55));
    // cicle catalític (pas 3)
    const cyc=g.append("g").style("opacity",0), ccx=X0+(X1-X0)*(mob?.55:.42), ccy=y(30), cr=mob?30:44;
    cyc.append("circle").attr("cx",ccx).attr("cy",ccy).attr("r",cr).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.2).attr("stroke-dasharray","4 3");
    V.t(cyc,ccx,ccy-cr-8,"Cl + O₃ → ClO + O₂",{anchor:"middle",size:mob?11:12.5,weight:700,halo:3});
    V.t(cyc,ccx,ccy+cr+16,"ClO + O → Cl + O₂",{anchor:"middle",size:mob?11:12.5,weight:700,halo:3});
    V.t(cyc,ccx,ccy+4,"Cl",{anchor:"middle",size:14,weight:700,fill:C.red,halo:3});
    // partícules: molècules de CFC (vermell) que pugen; molècules d'ozó (blau) a la capa
    const rnd=V.rng(1974), NP=mob?70:140, NO=mob?220:460;
    const P=d3.range(NP).map(()=>({x:gx+(rnd()-.5)*40, z:rnd()*40, v:.6+rnd()*.8, drift:(rnd()-.2)*.5}));
    const O=d3.range(NO).map(()=>({x:X0+rnd()*(X1-X0), z:clamp(30+V.gauss(rnd)*7,14,46), r:rnd(), ph:rnd()*6.28}));
    let k=0;
    function frame(t,dt){
      ctx.clearRect(0,0,w,h);
      const sp=V.reduced?0:dt/1000;
      // ozó
      O.forEach(o=>{ const near=Math.abs(o.x-ccx)<cr*2.2&&Math.abs(o.z-30)<9;
        const dead=(k>=2&&k<4&&near&&o.r<.55)||(k>=4&&o.z<26&&o.r<.75);
        const yy=y(o.z)+Math.sin(t/2600+o.ph)*1.2;
        if(dead){ ctx.strokeStyle=V.alpha(C.blue,.18); ctx.lineWidth=.6; ctx.beginPath(); ctx.arc(o.x,yy,mob?1.4:1.8,0,6.2832); ctx.stroke(); return; }
        ctx.fillStyle=V.alpha(C.blue,.62); ctx.beginPath(); ctx.arc(o.x,yy,mob?1.4:1.8,0,6.2832); ctx.fill(); });
      // CFC que pugen (pas 1 en endavant); a partir del pas 2 es trenquen a l'estratosfera
      if(k>=1){ P.forEach(p=>{ p.z+=sp*p.v*1.4; p.x+=sp*p.drift*14; if(p.z>(k>=2?30:42)){ p.z=0; p.x=gx+(rnd()-.5)*30; }
        const a=clamp(p.z/4,0,1)*.7; ctx.fillStyle=V.alpha(p.z>22&&k>=2?C.red:C.ink2,a);
        ctx.beginPath(); ctx.arc(p.x,y(p.z),p.z>22&&k>=2?1.8:1.3,0,6.2832); ctx.fill(); }); }
    }
    el.__loop=V.loop(el,frame);
    el.__set=kk=>{ k=kk; const T=V.reduced?0:600;
      sun.transition().duration(T).style("opacity",kk===2||kk===4?1:0);
      psc.transition().duration(T).style("opacity",kk>=3?1:0);
      cyc.transition().duration(T).style("opacity",kk>=2?1:0);
      if(V.reduced)frame(0,0); };
    el.__set(cur);
  });
  IB.scrolly(stepsEl,$("#s-clor .graphic"),i=>{ cur=i; if(box.__set)box.__set(i); });
})();

/* =====================================================================
   V4 · SCALE-02 · TRES MIL·LÍMETRES (gruix a mida real)
   1 DU = 0,01 mm d'ozó pur a 0 °C i 1 atm (NASA).
   ===================================================================== */
(function gruix(){
  const box=$("#gruix-viz"), rng=$("#gruix-rng"), out=$("#gruix-out"); if(!box)return;
  const H=D.hole.filter(r=>r[2]).map(r=>({y:r[0],m:r[2]}));
  let yi=H.findIndex(d=>d.y===2006);
  // px per mm real: 96 px CSS = 25,4 mm
  const PXMM=96/25.4;
  let api=null;
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, k=PXMM*(mob?14:20);  // ampliació declarada al peu: ×14 (mòbil) o ×20
    const h=Math.round(3.4*k+70);
    const s=V.svg(el,w,h,"Gruix que tindria la capa d'ozó si es comprimís a la superfície: uns 3 mm de mitjana mundial, 2,2 mm al llindar del forat i menys d'1 mm en els pitjors dies sobre l'Antàrtida."), g=s.append("g");
    const base=h-30, cols=[{t:"Mitjana mundial",s:"300 DU",du:300,c:C.blue},{t:"Llindar del forat",s:"220 DU",du:220,c:C.blueLight},{t:"",s:"",du:H[yi].m,c:C.red,dyn:true}];
    const X0=mob?50:64, av=w-X0, cw=Math.min(mob?86:150,(av-20)/3-14), gap=(av-cw*3)/4;
    // regle mil·limetrat (a l'escala ampliada)
    for(let mm=0;mm<=3.4;mm+=.1){ const yy=base-mm*k, big=Math.abs(mm-Math.round(mm))<.01;
      g.append("line").attr("x1",4).attr("x2",big?16:(Math.abs(mm*10%5)<.01?12:9)).attr("y1",yy).attr("y2",yy).attr("stroke",C.muted).attr("stroke-width",big?.9:.5);
      if(big)V.t(g,20,yy+4,`${Math.round(mm)} mm`,{size:V.FS.small,fill:C.muted}); }
    const bars=cols.map((c,i)=>{ const x=X0+gap*(i+1)+cw*i;
      const r=g.append("rect").attr("x",x).attr("width",cw).attr("y",base).attr("height",0).attr("fill",c.c).attr("fill-opacity",.6);
      const t1=V.t(g,x+cw/2,base+18,c.t,{anchor:"middle",size:mob?11.5:12.5,weight:700});
      const t2=V.t(g,x+cw/2,base,"",{anchor:"middle",size:mob?11.5:12.5,fill:C.ink2,halo:3});
      return {c,x,r,t1,t2}; });
    g.append("line").attr("x1",X0+gap*.5).attr("x2",w-gap*.5).attr("y1",base).attr("y2",base).attr("stroke",C.ink).attr("stroke-width",.8);
    function upd(instant){ const T=instant||V.reduced?0:600;
      bars.forEach(b=>{ const du=b.c.dyn?H[yi].m:b.c.du, mm=du/100;
        b.r.transition().duration(T).attr("y",base-mm*k).attr("height",mm*k);
        b.t2.transition().duration(T).attr("y",base-mm*k-8).text(`${f1(mm)} mm · ${f0(du)} DU`);
        if(b.c.dyn)b.t1.text(`Primavera de ${H[yi].y}`); });
      out.innerHTML=`<span>Primavera de <b>${H[yi].y}</b>: mínim típic del forat entre el 21 de setembre i el 16 d'octubre (NASA), <b>${f1(H[yi].m/100)} mm</b>, ${f0((1-H[yi].m/300)*100)} % menys que la mitjana mundial.${H[yi].y===1994?" És el valor més baix de tota la sèrie.":""}</span>`;
    }
    api={upd}; V.onView(el,instant=>upd(instant));
    if(el.__seen)upd(true);
  });
  rng.min=0; rng.max=H.length-1; rng.value=yi;
  rng.addEventListener("input",()=>{ yi=+rng.value; rng.setAttribute("aria-valuetext",String(H[yi].y)); $("#gruix-y").textContent=H[yi].y; if(api)api.upd(); });
})();

/* =====================================================================
   V5 · TIME-01 + PART-01 · EL QUE DIU L'AIRE (CFC-11, CFC-12 i ODGI)
   ===================================================================== */
(function cfc(){
  const box=$("#cfc-viz"), bar=$("#odgi-viz"); if(!box)return;
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, m={l:mob?36:46,r:mob?44:90,t:22,b:26}, h=mob?300:360;
    const s=V.svg(el,w,h,"Concentració mitjana mundial de CFC-11 i CFC-12 a l'aire, del 1978 al 2025: pugen fins als anys noranta i després baixen a poc a poc."), g=s.append("g");
    const x=d3.scaleLinear([1977,2026],[m.l,w-m.r]), y=d3.scaleLinear([0,560],[h-m.b,m.t]);
    [0,100,200,300,400,500].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,y(v)+4,v===500?"500 ppt":f0(v),{anchor:"end",size:V.FS.small,fill:C.muted}); });
    [1980,1990,2000,2010,2020].forEach(v=>V.t(g,x(v),h-6,v,{anchor:"middle",size:V.FS.small,fill:C.muted}));
    // Montreal 1987 i entrada en vigor del final de producció mundial de CFC (2010)
    [[1987,"Protocol de Montreal"],[2010,"fi de la producció de CFC"]].forEach(([yr,t])=>{
      g.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
      if(!mob||yr===1987)V.t(g,x(yr)+4,m.t+8,t,{size:11.5,fill:C.ink2,halo:3}); });
    const ln=d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX);
    const p12=g.append("path").datum(D.f12).attr("d",ln).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1.6);
    const p11=g.append("path").datum(D.f11).attr("d",ln).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2.2);
    const l12=D.f12[D.f12.length-1], l11=D.f11[D.f11.length-1];
    V.t(g,x(l12[0])+6,y(l12[1])+4,"CFC-12",{size:12.5,weight:700,fill:C.ink2,halo:3});
    V.t(g,x(l11[0])+6,y(l11[1])+4,"CFC-11",{size:12.5,weight:700,fill:C.red,halo:3});
    const pk=d3.greatest(D.f11,d=>d[1]);
    if(!mob){
      V.note(g,{x:x(pk[0]),y:y(pk[1])-3,tx:x(pk[0])-30,ty:y(pk[1])-46,kind:"straight",anchor:"end",lines:[[`Màxim: ${f0(pk[1])} ppt (${pk[0]})`,true],["després, la baixada"]],size:11.5});
      const a=D.f11.find(d=>d[0]===2015);
      V.note(g,{x:x(2015),y:y(a[1])-4,tx:x(2015)-10,ty:y(a[1])-70,kind:"straight",anchor:"end",lines:[["2013–2018: la baixada s'alenteix",true],["emissions noves i no declarades"]],size:11.5});
    }
    // animació d'entrada
    [p11,p12].forEach(p=>{ const L=p.node().getTotalLength(); p.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L); });
    V.onView(el,instant=>[p11,p12].forEach(p=>p.transition().duration(instant?0:1800).ease(d3.easeCubicOut).attr("stroke-dashoffset",0).on("end",()=>p.attr("stroke-dasharray",null))));
    const tp=V.tip(el), H2=g.append("g").attr("pointer-events","none"), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ const yr=clamp(Math.round(x.invert(px)),1978,2025), a=D.f11.find(d=>d[0]===yr), b=D.f12.find(d=>d[0]===yr); if(!a||!b)return;
      H2.selectAll("*").remove(); H2.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.8);
      [[a,C.red],[b,C.ink2]].forEach(([d,c])=>H2.append("circle").attr("cx",x(yr)).attr("cy",y(d[1])).attr("r",3.5).attr("fill",c).attr("stroke",C.paper).attr("stroke-width",1.2));
      tp.show(`<b>${yr}</b> · CFC-11: ${f1(a[1])} ppt · CFC-12: ${f1(b[1])} ppt (parts per bilió)`); },()=>{ tp.hide(); H2.selectAll("*").remove(); });
  });
  if(bar)V.mount(bar,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, h=mob?96:84, m={l:4,r:4};
    const A=D.odgiA, last=A[A.length-1], x=d3.scaleLinear([100,0],[m.l,w-m.r]);
    const s=V.svg(el,w,h,`Índex de gasos que destrueixen l'ozó sobre l'Antàrtida: de 100 al màxim (2001–2002) a ${f1(last[1])} el ${last[0]}; el zero és el nivell del 1980.`), g=s.append("g");
    const y0=mob?36:30;
    g.append("rect").attr("x",x(100)).attr("width",x(0)-x(100)).attr("y",y0).attr("height",12).attr("fill",V.alpha(C.ink,.06));
    const done=g.append("rect").attr("x",x(100)).attr("width",0).attr("y",y0).attr("height",12).attr("fill",C.blue).attr("fill-opacity",.6);
    V.t(g,x(100),y0-8,"100: màxim de clor i brom (2001–2002)",{size:mob?11:12,fill:C.ink2});
    V.t(g,x(0),y0-8,mob?"0: nivell del 1980":"0: nivell del 1980 (cap al 2070, NOAA)",{size:mob?11:12,fill:C.ink2,anchor:"end"});
    const lb=V.t(g,x(last[1]),y0+30,"",{size:12.5,weight:700,anchor:"middle",halo:3});
    V.onView(el,instant=>{ done.transition().duration(instant?0:1400).attr("width",x(last[1])-x(100));
      lb.text(`Principis del ${last[0]}: ${f1(last[1])} · ${f0(100-last[1])} % del camí`).attr("x",clamp(x(last[1]),70,w-70)); });
  });
})();

/* =====================================================================
   V6 · MAP-03 + SPREAD-03 · 198 SIGNATURES (mapa i cronologia)
   ===================================================================== */
(function paisos(){
  const box=$("#paisos-viz"), segs=document.querySelectorAll('[data-seg="paisos"] button'), play=$("#paisos-play"), lab=$("#paisos-y");
  if(!box)return;
  const R=D.ratif.map(r=>({ca:r[0],wa:r[1],d:new Date(r[2]+"T00:00:00Z"),k:r[3]}));
  const byWA=new Map(R.map(r=>[r.wa,r]));
  const NOPART={"Greenland":"Groenlàndia","Taiwan":"Taiwan","W. Sahara":"Sàhara Occidental","Kosovo":"Kosovo","Somaliland":"Somalilàndia","N. Cyprus":"Xipre del Nord","Puerto Rico":"Puerto Rico","Falkland Is.":"Illes Malvines","New Caledonia":"Nova Caledònia","Fr. S. Antarctic Lands":"Terres Australs i Antàrtiques Franceses"};
  const nm=r=>r.ca;
  const yr=d3.scaleSequential(d3.piecewise(d3.interpolateLab,[C.redDark,C.red,C.redLight,"#F2D6CC"])).domain([1988,2010]).clamp(true);
  let mode="mapa", T=2020, api=null, timer=0, playing=false;
  const fmtD=d=>`${d.getUTCDate()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${d.getUTCFullYear()}`;
  function render(){ const el=box, w=box.__w; if(!w)return;
    const mob=w<640;
    worldP.then(W=>{
      d3.select(el).selectAll("svg").remove();
      if(mode==="mapa"&&W){
        const h=Math.round(w*(mob?.62:.5));
        const proj=d3.geoEqualEarth().fitExtent([[4,4],[w-4,h-4]],{type:"Sphere"});
        const s=V.svg(el,w,h,"Mapa del món on cada país s'acoloreix segons l'any en què es va unir al Protocol de Montreal, del 1988 al 2019."), g=s.append("g"), p=d3.geoPath(proj);
        const feats=W.countries.features.filter(f=>f.properties.name!=="Antarctica");
        const paths=g.selectAll("path").data(feats).join("path").attr("d",p).attr("stroke",C.paper).attr("stroke-width",.5);
        const tp=V.tip(el);
        const paint=()=>paths.attr("fill",f=>{ const r=byWA.get(f.properties.name); if(!r)return C.land; return r.d.getUTCFullYear()<=T?yr(r.d.getUTCFullYear()):C.land; });
        paint();
        paths.on("pointermove pointerdown",(ev,f)=>{ const r=byWA.get(f.properties.name); V.focus(paths,q=>q===f,{dim:.6});
          tp.show(r?`<b>${nm(r)}</b> · s'hi va unir ${r.k==="d"?"per successió ":""}el ${fmtD(r.d)}`:`<b>${NOPART[f.properties.name]||f.properties.name}</b> · no figura com a part a la llista de l'ONU (territori d'un altre estat o sense reconeixement general)`); })
          .on("pointerleave",()=>{ tp.hide(); V.focus(paths,null); });
        api={paint};
      } else {
        const h=mob?380:300, m={l:mob?8:20,r:mob?8:20,t:30,b:28};
        const s=V.svg(el,w,h,"Cronologia de les 198 parts del Protocol de Montreal: cada punt és un estat o la Unió Europea, a la data en què s'hi va unir, de Mèxic el 1988 a Palestina el 2019."), g=s.append("g");
        const x=d3.scaleTime([new Date(Date.UTC(1987,6,1)),new Date(Date.UTC(2020,0,1))],[m.l,w-m.r]);
        const nodes=R.map(r=>({r,x:x(r.d),y:h/2}));
        const sim=d3.forceSimulation(nodes).force("x",d3.forceX(d=>x(d.r.d)).strength(1)).force("y",d3.forceY(h/2-6).strength(.05)).force("c",d3.forceCollide(mob?4.2:5.2)).stop();
        for(let i=0;i<220;i++)sim.tick();
        [1988,1995,2000,2005,2010,2015,2019].forEach(v=>{ const xx=x(new Date(Date.UTC(v,0,1))); g.append("line").attr("x1",xx).attr("x2",xx).attr("y1",h-m.b).attr("y2",h-m.b+5).attr("stroke",C.muted); V.t(g,xx,h-6,v,{anchor:"middle",size:V.FS.small,fill:C.muted}); });
        g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",h-m.b).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.6);
        const dots=g.selectAll("circle").data(nodes).join("circle").attr("cx",d=>d.x).attr("cy",d=>clamp(d.y,m.t,h-m.b-6)).attr("r",mob?3.4:4.3)
          .attr("fill",d=>yr(d.r.d.getUTCFullYear())).attr("fill-opacity",.8).attr("stroke",C.paper).attr("stroke-width",.6);
        // anotacions: el primer, l'últim i Andorra
        const ann=[["Mèxic","Mèxic, el primer (1988)","start"],["Timor Oriental","Timor Oriental: tots els membres de l'ONU (16-09-2009)","end"],["Palestina","Palestina (2019)","end"]];
        if(!mob)ann.push(["Andorra","Andorra (2009)","end"]);
        ann.forEach(([u,t,a],i)=>{ const d=nodes.find(n=>n.r.ca===u); if(!d)return; const cy=clamp(d.y,m.t,h-m.b-6);
          V.note(g,{x:d.x,y:cy-5,tx:d.x+(a==="start"?14:-14),ty:m.t-12+(i%2)*14,kind:"straight",anchor:a,lines:[[t,true]],size:mob?11:12}); });
        const tp=V.tip(el);
        dots.on("pointermove pointerdown",(ev,d)=>{ V.focus(dots,q=>q===d,{dim:.5}); tp.show(`<b>${nm(d.r)}</b> · ${fmtD(d.r.d)}`); }).on("pointerleave",()=>{ tp.hide(); V.focus(dots,null); });
        V.onView(el,instant=>{ if(instant)return; dots.attr("r",0).transition().duration(500).delay((d,i)=>i*6).attr("r",mob?3.4:4.3); });
        api=null;
      }
    });
  }
  V.mount(box,(el,w)=>{ box.__w=w; render(); });
  function setT(y){ T=y; lab.textContent=y>=2019?"Totes":y; if(api)api.paint(); }
  segs.forEach(b=>b.addEventListener("click",()=>{ segs.forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; stop();
    $("#paisos-ctl").style.visibility=mode==="mapa"?"visible":"hidden"; render(); }));
  function stop(){ playing=false; clearTimeout(timer); play.textContent="Reprodueix →"; }
  function step(){ if(!playing)return; if(T>=2019){ stop(); return; } setT(T+1); timer=setTimeout(step,V.reduced?0:520); }
  play.addEventListener("click",()=>{ if(playing){ stop(); return; } setT(1987); playing=true; play.textContent="Pausa"; timer=setTimeout(step,300); });
})();

/* =====================================================================
   V7 · CASE-02 · EL MÓN QUE VAM EVITAR (esquema amb xifres reals)
   ===================================================================== */
(function evitat(){
  const box=$("#evitat-viz"); if(!box)return;
  const NG=D.ng;
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, m={l:mob?40:56,r:mob?12:150,t:24,b:28}, h=mob?320:340;
    const s=V.svg(el,w,h,"Ozó total mitjà entre 60° S i 60° N de 1979 a 2025 (dades reals): baixa fins a un 6 % el 1993 i després es manté uns 2–3 % per sota del 1980. En vermell, la simulació sense Protocol de Newman et al. (2009): −17 % el 2020 i −67 % el 2065."), g=s.append("g");
    const x=d3.scaleLinear([1975,2070],[m.l,w-m.r]), y=d3.scaleLinear([-75,5],[h-m.b,m.t]);
    [0,-25,-50,-75].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.9);
      V.t(g,m.l-6,y(v)+4,`${v} %`,{anchor:"end",size:V.FS.small,fill:C.muted}); });
    [1980,2000,2020,2040,2060].forEach(v=>V.t(g,x(v),h-6,v,{anchor:"middle",size:V.FS.small,fill:C.muted}));
    // observat: mitjana anual 60° S–60° N (MSR-2) respecte del 1979–1981
    const obs=g.append("path").datum(NG).attr("d",d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",2);
    // previsió (avaluació 2022): retorn al valor del 1980 cap al 2040 per a 60° N–60° S
    g.append("circle").attr("cx",x(2040)).attr("cy",y(0)).attr("r",5).attr("fill",C.paper).attr("stroke",C.blue).attr("stroke-width",1.6);
    V.t(g,x(2040),y(0)-10,mob?"~2040":"retorn previst ~2040",{anchor:"middle",size:mob?10.5:11.5,fill:C.blueDark,weight:600,halo:3});
    // simulació sense Protocol (Newman et al. 2009): només els punts publicats
    const av=[[1980,0],[2020,-17],[2065,-67]];
    const path=g.append("path").datum(av).attr("d",d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2).attr("stroke-dasharray","5 4");
    g.selectAll("circle.av").data(av.slice(1)).join("circle").attr("class","av").attr("cx",d=>x(d[0])).attr("cy",d=>y(d[1])).attr("r",5).attr("fill",C.red);
    V.t(g,x(2065)+(mob?-8:10),y(-67)+(mob?-12:4),"−67 % el 2065",{anchor:mob?"end":"start",size:12.5,weight:700,fill:C.red,halo:3});
    V.t(g,x(2020)+10,y(-17)+4,"−17 % el 2020",{size:12.5,weight:700,fill:C.red,halo:3});
    const p93=NG.find(d=>d[0]===1993);
    if(!mob){ V.note(g,{x:x(1993),y:y(p93[1])+3,tx:x(1993)+26,ty:y(-12),kind:"straight",anchor:"start",lines:[["1993: −6 %",true],["després de l'erupció del Pinatubo"]],size:11.5}); }
    if(!mob){ V.t(g,x(2070)+8,y(-55),"Sense el Protocol",{size:12.5,weight:700,fill:C.red});
      V.t(g,x(2070)+8,y(-55)+15,"(simulació, ozó mundial)",{size:11.5,fill:C.ink2});
      V.t(g,x(2070)+8,y(0)-4,"Amb el Protocol",{size:12.5,weight:700,fill:C.blue});
      V.t(g,x(2070)+8,y(0)+11,"(observat, 60° S–60° N)",{size:11.5,fill:C.ink2}); }
    else { V.t(g,x(1980),y(-50),"Sense el Protocol (simulació)",{size:11,weight:700,fill:C.red,halo:3});
      V.t(g,x(1980),y(-14),"Observat (60° S–60° N)",{size:11,weight:700,fill:C.blue,halo:3}); }
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent"), H=g.append("g").attr("pointer-events","none");
    V.hover(hit.node(),(ev,[px])=>{ const yr=Math.round(x.invert(px)), d=NG.find(q=>q[0]===yr); H.selectAll("*").remove(); if(!d){ tp.hide(); return; }
      H.append("circle").attr("cx",x(yr)).attr("cy",y(d[1])).attr("r",3.5).attr("fill",C.blue).attr("stroke",C.paper).attr("stroke-width",1.2);
      tp.show(`<b>${yr}</b> · ozó mitjà entre 60° S i 60° N: ${V.signed(d[1],1)} % respecte del 1979–1981`); },()=>{ tp.hide(); H.selectAll("*").remove(); });
    [obs,path].forEach(p=>{ const L=p.node().getTotalLength(); p.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L); });
    V.onView(el,instant=>{ obs.transition().duration(instant?0:1400).attr("stroke-dashoffset",0).on("end",()=>obs.attr("stroke-dasharray",null));
      path.transition().delay(instant?0:600).duration(instant?0:1600).attr("stroke-dashoffset",0).on("end",()=>path.attr("stroke-dasharray","5 4")); });
  });
})();


})();
