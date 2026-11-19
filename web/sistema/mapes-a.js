/* Sistema infogràfic d'Inspired by Magazine · Mapes, primera tanda (IB-22 a IB-27).
   Fa servir assets/ib-viz.js (IBV), d3 7.9.0, topojson-client 3.1.0 i dades-mapes-a.js (IBDATA_MAPES_A). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.IBDATA_MAPES_A;
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f"), f1t=V.fmt(",.1~f");
const sgn=(v,d)=>Math.abs(v)<1e-9?"0":V.signed(v,d==null?1:d);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const EIO=d3.easeCubicInOut;
function legend(n,fn){ const el=$(`[data-lg="${n}"]`); if(el&&!el.childElementCount)fn(el); }
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,draw):{redraw(){}}; }
function seg(n,cb){ const bs=document.querySelectorAll(`[data-seg="${n}"] button`);
  bs.forEach(b=>b.addEventListener("click",()=>{ if(b.getAttribute("aria-pressed")==="true")return; bs.forEach(o=>o.setAttribute("aria-pressed",o===b)); cb(+b.dataset.k); })); }
function layer(el,w,h,label){ // canvas a sota (molts punts) + svg a sobre (eixos, text)
  d3.select(el).selectAll("canvas.ibv,svg.ibv,svg.ibx-under").remove(); el.style.height=h+"px";
  const {c,ctx}=V.canvas(el,w,h,label);
  const s=V.svg(el,w,h,""); s.attr("aria-hidden","true").attr("role",null).style("position","absolute").style("left",0).style("top",0);
  return {c,ctx,s};
}
function stack(el,w,h,label){ // svg de fons (terra) + canvas (moviment) + svg de dalt (text i interacció)
  d3.select(el).selectAll("canvas.ibv,svg.ibv,svg.ibx-under").remove(); el.style.height=h+"px";
  const under=d3.select(el).append("svg").attr("class","ibx-under").attr("width",w).attr("height",h).attr("aria-hidden","true");
  const {c,ctx}=V.canvas(el,w,h,label); c.style.position="relative";
  const s=V.svg(el,w,h,""); s.attr("aria-hidden","true").attr("role",null).style("position","absolute").style("left",0).style("top",0);
  return {under,c,ctx,s};
}
function landMask(proj,w,h,feature){ // màscara ràpida de terra: es pinta en un canvas i es llegeix el píxel
  const c=document.createElement("canvas"); c.width=w; c.height=h; const x=c.getContext("2d");
  x.fillStyle="#000"; x.beginPath(); d3.geoPath(proj,x)(feature); x.fill();
  const im=x.getImageData(0,0,w,h).data;
  return (px,py)=>{ px=Math.round(px); py=Math.round(py); if(px<0||py<0||px>=w||py>=h)return false; return im[(py*w+px)*4+3]>0; };
}
const latS=v=>Math.abs(v)<1e-6?"Equador":`${f1t(Math.abs(v))}° ${v>0?"N":"S"}`;
const lonS=v=>{ v=((v+540)%360)-180; return Math.abs(v)<1e-6?"0°":Math.abs(Math.abs(v)-180)<1e-6?"180°":`${f1t(Math.abs(v))}° ${v>0?"E":"O"}`; };
const llS=(lon,lat)=>`${latS(lat)}, ${lonS(lon)}`;
let W=null; // world-atlas 110m (IBV.world)
function needWorld(get){ if(W)return false; V.world().then(x=>{ W=x; get().redraw(); }); return true; }
function tipOf(el){ const tp=V.tip(el); tp.hide(); const n=el.querySelector(":scope>.tip"); if(n)n.style.transform="translate(0px,0px)"; return tp; }
function side(cx,R,lines,w,prefer){ // etiqueta directa: a la dreta o a l'esquerra, sense sortir del gràfic
  const tw=d3.max(lines,l=>l[0].length*(l[1]?6.9:6.2)); const okR=cx+R+tw<w-4, okL=cx-R-tw>4;
  let right=prefer==="right"?(okR||!okL):!(okL||!okR); if(!okR&&!okL){ right=(w-cx)>cx; return {x:right?Math.max(4,Math.min(cx+R,w-4-tw)):Math.min(w-4,Math.max(cx-R,tw+4)),right}; }
  return {x:right?cx+R:cx-R,right}; }
function hitRect(s,w,h){ return s.append("rect").attr("class","ibx-hit").attr("width",w).attr("height",h).attr("fill","transparent"); }
function nameOf(f){ return (D.names&&D.names[f.id||f.properties.name])||f.properties.name; }

/* ---------- camp NCEP (gener i juliol): temperatura i diferència amb la mitjana de la latitud ---------- */
const NLAT=D.ncep.nlat, NLON=D.ncep.nlon, STEP=D.ncep.step;
const TEMP=[Float32Array.from(D.ncep.jan,v=>v/10),Float32Array.from(D.ncep.jul,v=>v/10)];
const ZMEAN=TEMP.map(T=>d3.range(NLAT).map(i=>{ let s=0; for(let j=0;j<NLON;j++)s+=T[i*NLON+j]; return s/NLON; }));
const ANOM=TEMP.map((T,m)=>{ const A=new Float32Array(T.length); for(let i=0;i<NLAT;i++)for(let j=0;j<NLON;j++)A[i*NLON+j]=T[i*NLON+j]-ZMEAN[m][i]; return A; });
const gLat=i=>90-i*STEP, gLon=j=>{ const L=j*STEP; return L>=180?L-360:L; };
const MES2=["gener","juliol"];
function placeName(lon,lat){ // noms només per als extrems que comenten les peces IB-26
  if(lat>58&&lat<74&&lon>-8&&lon<22)return "Mar de Noruega";
  if(lat>26&&lat<41&&lon>72&&lon<102)return "Tibet";
  if(lat>26&&lat<39&&lon>37&&lon<56)return "Mesopotàmia";
  if(lat>-32&&lat<-8&&lon>-76&&lon<-58)return "Altiplà andí";
  if(lat>58&&lat<75&&lon>100&&lon<145)return "Sibèria";
  return llS(lon,lat);
}

/* =====================================================================
   IB-22 · CARTOGRAMA DE CERCLES  (dades reals: superfície de Natural Earth)
   ===================================================================== */
const LOG16=Math.log10(16);
const INFC=v=>V.heatInterp(.1+.9*clamp(v/LOG16,0,1)); // v = log10(inflació)
legend(22,el=>V.legendRamp(el,{scale:INFC,min:0,max:LOG16,ticks:[1,2,4,8].map(Math.log10).concat([LOG16-1e-9]),f:v=>"×"+f0(Math.pow(10,v)),title:"Quantes vegades l'infla el mapa de Mercator",lo:"Gens",hi:"Molt",w:180}));
let mode22=0;
const GEO22=new Map();
const kmS=a=>a>=1e6?`${f1(a/1e6)} milions de km²`:`${f0(Math.round(a/100)*100)} km²`;
const M22=piece(22,(el,w)=>{
  if(needWorld(()=>M22))return;
  if(el._timer)el._timer.stop();
  const mob=w<640, pt=mob?44:4;
  const proj=d3.geoMercator().scale(w/(2*Math.PI)).translate([w/2,0]);
  proj.translate([w/2,-proj([0,84])[1]+pt]); const h=Math.ceil(proj([0,-57])[1]);
  const path=d3.geoPath(proj), k=proj.scale()/6371;
  const feats=W.countries.features.filter(f=>f.id!=="010");
  const N=feats.map(f=>{
    // superfície i part principal: no depenen de l'amplada, es calculen una sola vegada
    let G=GEO22.get(f); if(!G){ let main=f; if(f.geometry.type==="MultiPolygon"){ let best=-1; f.geometry.coordinates.forEach(p=>{ const g={type:"Polygon",coordinates:p}, a=d3.geoArea(g)/Math.cos(d3.geoCentroid(g)[1]*Math.PI/180)**2; if(a>best){best=a;main=g;} }); }
      G={A:d3.geoArea(f)*6371*6371,main}; GEO22.set(f,G); }
    const A=G.A, Ap=path.area(f), Aeq=A*k*k, main=G.main;
    const c=path.centroid(main);
    return {f,id:f.id,n:nameOf(f),A,Ap,inf:Ap/Aeq,r0:Math.sqrt(Ap/Math.PI),r1:Math.sqrt(Aeq/Math.PI),x0:c[0],y0:c[1],x:c[0],y:c[1],r:0};
  }).filter(d=>isFinite(d.x0)&&d.A>0);
  N.forEach(d=>{ d.r=mode22?d.r1:d.r0; d.col=INFC(Math.log10(Math.max(1,d.inf))); });
  const GL=N.find(d=>d.id==="304"), DZ=N.find(d=>d.id==="012"), RU=N.find(d=>d.id==="643");
  const s=V.svg(el,w,h,`Mapa del món en projecció de Mercator, pintat segons quant infla cada país, que es converteix en cercles d'àrea proporcional a la superfície real. Groenlàndia ocupa al mapa ${f1(GL.Ap/DZ.Ap)} vegades l'àrea d'Algèria, però en realitat és més petita: ${kmS(GL.A)} contra ${kmS(DZ.A)}. Dades reals de la geometria de Natural Earth.`), g=s.append("g");
  const paths=g.append("g").selectAll("path").data(N).join("path").attr("d",d=>path(d.f)).attr("stroke","#fff").attr("stroke-width",.5)
    .attr("fill",d=>mode22?C.land:d.col);
  const cg=g.append("g"), circ=cg.selectAll("circle").data(N.slice().sort((a,b)=>b.r1-a.r1)).join("circle")
    .attr("fill",d=>d.col).attr("stroke","#fff").attr("stroke-width",.6).style("opacity",mode22?1:0).style("display",mode22?null:"none");
  const render=()=>circ.attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",d=>Math.max(.6,d.r));
  const notes=g.append("g");
  function settle(){ N.forEach(d=>{ d.x=d.x0; d.y=d.y0; d.r=d.r1; });
    const sim=d3.forceSimulation(N).force("x",d3.forceX(d=>d.x0).strength(.1)).force("y",d3.forceY(d=>d.y0).strength(.1)).force("c",d3.forceCollide(d=>d.r+.6).iterations(3)).stop();
    for(let i=0;i<240;i++)sim.tick(); }
  // clau de mida (només en cercles), a l'escala de l'equador
  const key=g.append("g").style("opacity",mode22?1:0);
  { const R=[1e6,1e7].map(a=>Math.sqrt(a/Math.PI)*k), cx=8+R[1], cy=h-6-R[1];
    R.forEach((r,i)=>{ key.append("circle").attr("cx",cx).attr("cy",cy+R[1]-r).attr("r",r).attr("fill","none").attr("stroke",C.muted).attr("stroke-dasharray","3 2.5"); });
    V.t(key,cx-R[1],cy-R[1]-6,mob?"10 milions de km²":"10 milions de km²",{italic:true,size:11.5,fill:C.ink2,halo:true});
    key.append("line").attr("x1",cx+R[0]).attr("x2",cx+R[1]+3).attr("y1",cy+R[1]-R[0]).attr("y2",cy+R[1]-R[0]).attr("stroke",C.muted).attr("stroke-width",.8);
    V.t(key,cx+R[1]+6,cy+R[1]-R[0]+4,"1 milió",{italic:true,size:11.5,fill:C.ink2,halo:true}); }
  function drawNotes(m){ notes.selectAll("*").remove();
    const at=proj([-41,mob?60:30]), tx=mob?6:at[0], ty=mob?(m?30:24):at[1];
    if(!m){ V.note(notes,{x:mob?GL.x0:GL.x0,y:mob?GL.y0-10:GL.y0+6,tx:mob?GL.x0+10:tx,ty,kind:"elbow",anchor:mob?"start":"middle",size:mob?12:12.5,valign:mob?null:"top",
        lines:[["Groenlàndia sembla enorme",true],[`${mob?"":"al mapa "}ocupa ${f1(GL.Ap/DZ.Ap)} vegades Algèria`]]}); }
    else { const big=GL.A<DZ.A;
      V.note(notes,{x:GL.x,y:mob?GL.y-GL.r:GL.y+GL.r,tx:mob?GL.x+10:tx,ty,kind:"elbow",anchor:mob?"start":"middle",size:mob?12:12.5,valign:mob?null:"top",
        lines:mob?[[big?"Algèria és més gran":"Groenlàndia, a mida real",true],[`Groenlàndia: ${kmS(GL.A)}`],[`Algèria: ${kmS(DZ.A)}`]]:[[big?"En realitat, Algèria és més gran":"Groenlàndia, a mida real",true],[`Groenlàndia, ${kmS(GL.A)}; Algèria, ${f1(DZ.A/1e6)}`]]});
      N.forEach(d=>{ if(d===RU)return; const fsz=11.5, tw=d.n.length*fsz*.5; if(tw>2*d.r-8||d.r<(mob?14:18))return;
        V.t(notes,d.x,d.y+4,d.n,{anchor:"middle",size:fsz,fill:C.ink,halo:false}); });
      notes.append("circle").attr("cx",DZ.x).attr("cy",DZ.y).attr("r",DZ.r+2.5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
      if(!mob)V.note(notes,{x:RU.x+RU.r*.7,y:RU.y-RU.r*.7,tx:RU.x+RU.r+30,ty:RU.y-RU.r-14,kind:"straight",anchor:"start",lines:[["Rússia",true],[`al mapa, ×${f1(RU.inf)}`]]}); }
    if(mob&&!m){} }
  if(mode22){ settle(); render(); }
  drawNotes(mode22);
  V.onView(el,instant=>{ if(instant||mode22)return;
    paths.style("opacity",0).transition().delay(d=>Math.abs(proj.invert([d.x0,d.y0])[1])*16).duration(500).style("opacity",1);
    notes.style("opacity",0).transition().delay(1500).duration(500).style("opacity",1); });
  el._go=m=>{
    el._off&&el._off(); if(el._timer)el._timer.stop(); notes.selectAll("*").remove(); notes.style("opacity",1);
    if(V.reduced){ paths.attr("fill",d=>m?C.land:d.col); key.style("opacity",m?1:0);
      if(m){ settle(); render(); circ.style("display",null).style("opacity",1); } else circ.style("display","none");
      drawNotes(m); return; }
    if(m){ // mapa → cercles: els cercles neixen amb l'àrea del mapa i es redueixen a la real mentre la simulació els separa
      N.forEach(d=>{ d.x=d.x0; d.y=d.y0; d.r=d.r0; d.vx=d.vy=0; }); render();
      circ.style("display",null).style("opacity",0).transition().duration(350).style("opacity",1);
      paths.transition().duration(700).attr("fill",C.land);
      const coll=d3.forceCollide(d=>d.r+.6).iterations(2);
      const sim=d3.forceSimulation(N).alphaDecay(.022).force("x",d3.forceX(d=>d.x0).strength(.1)).force("y",d3.forceY(d=>d.y0).strength(.1)).force("c",coll).stop();
      const T=1500;
      el._timer=d3.timer(t=>{ const e=EIO(clamp((t-250)/T,0,1)); N.forEach(d=>d.r=d.r0+(d.r1-d.r0)*e); coll.radius(d=>d.r+.6); sim.tick(); render();
        if(t>T+250&&(sim.alpha()<.06||t>T+1500)){ el._timer.stop(); drawNotes(1); notes.style("opacity",0).transition().duration(400).style("opacity",1); } });
      key.transition().delay(900).duration(600).style("opacity",1);
    } else { // tornada: cada cercle torna al seu país i hi recupera la mida del mapa
      key.transition().duration(300).style("opacity",0);
      circ.transition().duration(1100).ease(EIO).attr("cx",d=>d.x0).attr("cy",d=>d.y0).attr("r",d=>d.r0)
        .on("end",function(d){ d.x=d.x0; d.y=d.y0; d.r=d.r0; }).transition().duration(400).style("opacity",0).on("end",function(){ d3.select(this).style("display","none"); });
      paths.transition().delay(900).duration(600).attr("fill",d=>d.col);
      notes.style("opacity",0); setTimeout(()=>{ if(!mode22){ drawNotes(0); notes.transition().duration(400).style("opacity",1); } },1500);
    }
  };
  N.slice().sort((a,b)=>b.A-a.A).forEach((d,i)=>d.rk=i+1);
  const hl=g.append("g").style("pointer-events","none"), KR=[1e6,1e7].map(a=>Math.sqrt(a/Math.PI)*k), kcx=8+KR[1], kcy=h-6-KR[1];
  // màscara d'identitat precalculada (un píxel = un país) per al hover del mapa
  let MASK=null; const build=()=>{ if(MASK)return; const cv=document.createElement("canvas"); cv.width=w; cv.height=h; const x=cv.getContext("2d",{willReadFrequently:true}), pp=d3.geoPath(proj,x);
      N.forEach((o,i)=>{ x.fillStyle=`rgb(${(i+1)&255},${(i+1)>>8},0)`; x.beginPath(); pp(o.f); x.fill(); }); MASK=x.getImageData(0,0,w,h).data; };
  (window.requestIdleCallback||(f=>setTimeout(f,300)))(build); // es prepara quan el navegador està lliure
  const pick=(px,py)=>{ build(); px=Math.round(px); py=Math.round(py); if(px<0||py<0||px>=w||py>=h)return null; const q=(py*w+px)*4; if(MASK[q+3]<255)return null; return N[MASK[q]+(MASK[q+1]<<8)-1]||null; };
  const tp=tipOf(el), hit=hitRect(s,w,h);
  let cur=null;
  function off(){ cur=null; tp.hide(); V.focus(circ,null); V.focus(paths,null); notes.transition().duration(150).style("opacity",1);
    paths.attr("stroke","#fff").attr("stroke-width",.5); circ.attr("stroke","#fff").attr("stroke-width",.6); hl.selectAll("*").remove(); }
  el._off=off;
  V.hover(hit.node(),(ev,[px,py])=>{
    let d=null;
    if(!mode22){ d=pick(px,py);
      if(!d){ const b=d3.least(N,o=>(o.x0-px)**2+(o.y0-py)**2); if(b&&Math.hypot(b.x0-px,b.y0-py)<16)d=b; } }
    else { let best=1e9; N.forEach(o=>{ const q=Math.hypot(o.x-px,o.y-py)-Math.max(o.r,2); if(q<best){best=q;d=o;} }); if(best>10)d=null; }
    if(!d){ off(); return; }
    tp.show(`<b>${d.n}</b><br>Superfície: <b>${kmS(d.A)}</b><br>posició ${d.rk} de ${N.length} per superfície<br>Al mapa de Mercator, ×${f1(d.inf)} més gran`,mode22?d.x:px,mode22?d.y-d.r:py);
    if(d===cur)return; cur=d; hl.selectAll("*").remove(); hl.raise(); hit.raise(); notes.transition().duration(150).style("opacity",.5);
    const right=(mode22?d.x:d.x0)<Math.min(220,w*.35), lab=[[d.n,true],[mode22?kmS(d.A):`×${f1(d.inf)} al mapa`]];
    if(!mode22){
      V.focus(paths,o=>o===d,{dim:.25}); paths.filter(o=>o===d).raise().attr("stroke",C.ink).attr("stroke-width",1.5);
      // la mida real del país, dibuixada al seu lloc al costat de la del mapa
      hl.append("circle").attr("cx",d.x0).attr("cy",d.y0).attr("r",Math.max(3,d.r0)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-dasharray","3 2.5");
      hl.append("circle").attr("cx",d.x0).attr("cy",d.y0).attr("r",Math.max(2,d.r1)).attr("fill",V.alpha(C.ink,.12)).attr("stroke",C.ink).attr("stroke-width",1.5);
      const L2=[[d.n,true],[`×${f1(d.inf)}: el cercle ple és la mida real`]], sd=side(d.x0,Math.max(6,d.r0)+6,L2,w,right?"right":"left");
      V.lines(hl,sd.x,d.y0-2,L2,{anchor:sd.right?"start":"end",size:12,halo:true});
    } else {
      V.focus(circ,o=>o===d,{dim:.25}); circ.filter(o=>o===d).raise().attr("stroke",C.ink).attr("stroke-width",1.5);
      paths.filter(o=>o===d).attr("stroke",C.ink).attr("stroke-width",1.2);
      hl.append("line").attr("x1",d.x).attr("y1",d.y).attr("x2",d.x0).attr("y2",d.y0).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
      hl.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",Math.max(1,d.r)+4).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
      hl.append("circle").attr("cx",d.x0).attr("cy",d.y0).attr("r",2.5).attr("fill",C.ink);
      // a la clau de mida: el mateix cercle i el valor en negreta
      hl.append("circle").attr("cx",kcx).attr("cy",kcy+KR[1]-d.r1).attr("r",Math.max(.8,d.r1)).attr("fill",V.alpha(d.col,.9)).attr("stroke",C.ink).attr("stroke-width",1.5);
      V.t(hl,kcx+KR[1]+6,kcy+KR[1]-(mob?20:26),kmS(d.A),{size:12,weight:700,halo:true});
      const sd=side(d.x,Math.max(3,d.r)+6,lab,w,right?"right":"left"); V.lines(hl,sd.x,d.y-2,lab,{anchor:sd.right?"start":"end",size:12,halo:true});
    }
  },off);
});
seg(22,m=>{ mode22=m; const el=$('[data-p="22"]'); el._go&&el._go(m); });

/* =====================================================================
   IB-23 · DENSITAT DE PUNTS  (dades d'exemple + fronteres reals)
   ===================================================================== */
const IDS23=["724","620","250","380","756","040","276","056","528","442","826","372","208","203","616","703","348","705","191"];
const PER23=5000, EU23={};
legend(23,el=>V.legendCat(el,[{c:C.blau,t:`1 punt = ${f0(PER23)} unitats`},{c:C.ink,t:"Regió triada",kind:"line",w:1.2}]));
const M23=piece(23,(el,w)=>{
  if(needWorld(()=>M23))return;
  if(el._timer)el._timer.stop();
  const mob=w<640, h=Math.round(mob?w*1.08:Math.min(640,w*.58));
  // només la part europea de cada país (sense ultramar) i la terra i fronteres de la zona: menys geometria a projectar
  const inEu=c=>c[1]>34&&c[0]>-15&&c[0]<45&&c[1]<72;
  const feats=IDS23.map(id=>W.countries.features.find(f=>f.id===id)).filter(Boolean).map(f=>{ const P=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
    return {type:"Feature",id:f.id,properties:f.properties,geometry:{type:"MultiPolygon",coordinates:P.filter(q=>inEu(d3.geoCentroid({type:"Polygon",coordinates:q})))}}; });
  if(!EU23.land){ const box=c=>c[1]>20&&c[1]<80&&c[0]>-35&&c[0]<60;
    EU23.land={type:"MultiPolygon",coordinates:W.land.features.flatMap(f=>f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates).filter(q=>q[0].some(box))};
    EU23.bord={type:"MultiLineString",coordinates:W.borders.coordinates.filter(l=>l.some(box))}; }
  const fitPts=[]; feats.forEach(f=>{ const P=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
    P.forEach(p=>{ const c=d3.geoCentroid({type:"Polygon",coordinates:p}); if(!(c[1]>60&&c[0]>20))fitPts.push(...p[0]); }); });
  const proj=d3.geoAzimuthalEqualArea().rotate([-7,-48]).fitExtent([[mob?6:120,mob?30:10],[w-(mob?6:120),h-8]],{type:"MultiPoint",coordinates:fitPts});
  const path=d3.geoPath(proj);
  const {ctx,s}=layer(el,w,h,"Mapa de punts de l'Europa occidental i central: cada punt representa un paquet d'unitats, escampat dins de les fronteres de cada país i concentrat en uns quants nuclis. Dades d'exemple generades.");
  // màscara d'identitat: cada país pintat amb el seu índex
  const mc=document.createElement("canvas"); mc.width=w; mc.height=h; const mx=mc.getContext("2d"), mp=d3.geoPath(proj,mx);
  feats.forEach((f,i)=>{ mx.fillStyle=`rgb(${i+1},0,0)`; mx.beginPath(); mp(f); mx.fill(); });
  const im=mx.getImageData(0,0,w,h).data;
  const idAt=(x,y)=>{ x=Math.round(x); y=Math.round(y); if(x<0||y<0||x>=w||y>=h)return -1; const o=(y*w+x)*4; return im[o+3]===255?im[o]-1:-1; };
  // dades d'exemple: total proporcional a l'àrea amb una densitat inventada; punts concentrats en nuclis inventats
  const r=V.rng(23), R=feats.map((f,i)=>{ const area=d3.geoArea(f)*6371*6371, dens=12*Math.exp(V.gauss(r)*.55+.35); return {i,f,n:nameOf(f),total:Math.round(area*dens/1000)*1000}; });
  const A=path.area.bind(path), DOTS=[];
  R.forEach(reg=>{
    const b=path.bounds(reg.f), nd=Math.round(reg.total/PER23), cores=[];
    if(!isFinite(b[0][0])||nd<1){ reg.nd=0; return; }
    const ncore=3+Math.floor(r()*6); for(let t=0;t<600&&cores.length<ncore;t++){ const x=b[0][0]+r()*(b[1][0]-b[0][0]), y=b[0][1]+r()*(b[1][1]-b[0][1]); if(idAt(x,y)===reg.i)cores.push({x,y,s:(mob?2.5:4)+r()*r()*(mob?9:15),wt:.08+Math.pow(r(),2.5)}); }
    const cw=d3.sum(cores,c=>c.wt); let made=0, tries=0;
    while(made<nd&&tries<nd*60){ tries++; let x,y;
      if(cores.length&&r()<.55){ let u=r()*cw, c=cores[0]; for(const k of cores){ u-=k.wt; if(u<=0){c=k;break;} } const sc=c.s*(r()<.7?1:2.6); x=c.x+V.gauss(r)*sc; y=c.y+V.gauss(r)*sc; }
      else { x=b[0][0]+r()*(b[1][0]-b[0][0]); y=b[0][1]+r()*(b[1][1]-b[0][1]); }
      if(idAt(x,y)!==reg.i)continue; DOTS.push({x,y,k:reg.i,dl:0}); made++; }
    reg.nd=made; reg.cores=cores;
  });
  const xs=d3.extent(DOTS,d=>d.x); DOTS.forEach(d=>{ d.dl=((d.x-xs[0])/(xs[1]-xs[0]))*900+r()*900; });
  const dr=mob?.75:.9, dpr=Math.min(2,window.devicePixelRatio||1);
  // capes fora de pantalla, pintades una sola vegada: terra, tots els punts, punts apagats i, a demanda, els d'una regió
  const off2=fn=>{ const cv=document.createElement("canvas"); cv.width=w*dpr; cv.height=h*dpr; const x=cv.getContext("2d"); x.scale(dpr,dpr); fn(x); return cv; };
  const dots=(x,list,col,rr)=>{ x.fillStyle=col; x.beginPath(); for(const d of list){ x.moveTo(d.x+rr,d.y); x.arc(d.x,d.y,rr,0,6.2832); } x.fill(); };
  const BG=off2(x=>{ const pl=d3.geoPath(proj,x); x.fillStyle=C.land; x.beginPath(); pl(EU23.land); x.fill(); x.strokeStyle="#fff"; x.lineWidth=.8; x.beginPath(); pl(EU23.bord); x.stroke(); });
  let FULL=null, DIM=null; const REG=new Map();
  const full=()=>FULL||(FULL=off2(x=>{ x.drawImage(BG,0,0,w,h); dots(x,DOTS,V.alpha(C.blau,.8),dr); }));
  const dimmed=()=>DIM||(DIM=off2(x=>{ x.drawImage(BG,0,0,w,h); dots(x,DOTS,V.alpha(C.ghost,.55),dr); }));
  const regC=k=>{ if(!REG.has(k))REG.set(k,off2(x=>dots(x,DOTS.filter(d=>d.k===k),C.blau,dr*1.3))); return REG.get(k); };
  let hl=-1, drawn=0;
  const ORD=DOTS.slice().sort((a,b)=>a.dl-b.dl);
  function paint(){ ctx.clearRect(0,0,w,h); if(hl<0){ ctx.drawImage(full(),0,0,w,h); return; } ctx.drawImage(dimmed(),0,0,w,h); ctx.drawImage(regC(hl),0,0,w,h); }
  // entrada: cada punt es dibuixa una sola vegada, quan li toca (sense redibuixar els anteriors)
  function reveal(t){ if(drawn===0){ ctx.clearRect(0,0,w,h); ctx.drawImage(BG,0,0,w,h); } let k=drawn; while(k<ORD.length&&ORD[k].dl<=t)k++;
    if(k>drawn){ dots(ctx,ORD.slice(drawn,k),V.alpha(C.blau,.8),dr); drawn=k; } }
  // clau i nota
  const g=s.append("g");
  const core=d3.greatest(R.flatMap(x=>(x.cores||[]).map(c=>Object.assign({reg:x},c))),c=>c.wt*(x=>x.total)(c.reg)/c.s/c.s);
  if(core){ const left=core.x>w*.55; V.note(g,{x:core.x+(left?-core.s*.6:core.s*.6),y:core.y-core.s*.6,tx:core.x+(left?-1:1)*(mob?40:70),ty:core.y-(mob?50:70),kind:"straight",anchor:left?"end":"start",size:mob?12:12.5,
    lines:[["Un nucli dens",true],["els punts gairebé es toquen"]]}); }
  const notes=g.selectAll(".ibv-note");
  const outline=g.append("path").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).attr("stroke-linejoin","round"), hg=g.append("g").style("pointer-events","none");
  // centre de la part principal de cada regió (per a l'anell i l'etiqueta) i superfície europea
  R.forEach(reg=>{ const P=reg.f.geometry.type==="Polygon"?[reg.f.geometry.coordinates]:reg.f.geometry.coordinates; let best=-1;
    reg.area=0; P.forEach(q=>{ const gq={type:"Polygon",coordinates:q}, c=d3.geoCentroid(gq); if(!(c[1]>34&&c[0]>-15))return; reg.area+=d3.geoArea(gq)*6371*6371; const a=path.area(gq); if(a>best){best=a; reg.c=path.centroid(gq);} }); });
  const TOT=d3.sum(R,x=>x.total), DENS=TOT/d3.sum(R,x=>x.area);
  const tp=tipOf(el), hit=hitRect(s,w,h);
  const near=(px,py)=>{ let k=idAt(px,py); if(k>=0)return k; for(const rr of [5,10,14])for(let a=0;a<6.28;a+=.785){ k=idAt(px+rr*Math.cos(a),py+rr*Math.sin(a)); if(k>=0)return k; } return -1; };
  function off(){ if(el._timer&&drawn<ORD.length)return; if(hl>=0){ hl=-1; paint(); } outline.attr("d",null); hg.selectAll("*").remove(); notes.style("opacity",1); tp.hide(); }
  V.hover(hit.node(),(ev,[px,py])=>{ const k=near(px,py);
    if(k<0){ off(); return; }
    if(drawn<ORD.length){ if(el._timer)el._timer.stop(); drawn=ORD.length; }
    const reg=R[k];
    tp.show(`<b>${reg.n}</b><br><b>${f0(reg.total)} unitats</b> (${f0(reg.nd)} punts)<br>${V.fmt(",.1f")(100*reg.total/TOT)} % del total del mapa<br>${f0(reg.total/reg.area)} per km², mitjana ${f0(DENS)} · <i>dades d'exemple</i>`,px,py);
    if(k===hl)return; hl=k; paint(); notes.style("opacity",.5);
    outline.attr("d",path(reg.f)).style("opacity",0).transition().duration(150).style("opacity",1);
    hg.selectAll("*").remove(); const c=reg.c||[px,py], right=c[0]<w*.62;
    hg.append("circle").attr("cx",c[0]).attr("cy",c[1]).attr("r",7).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.5);
    hg.append("circle").attr("cx",c[0]).attr("cy",c[1]).attr("r",2).attr("fill",C.ink);
    V.lines(hg,c[0]+(right?12:-12),c[1]-4,[[reg.n,true],[`${f0(reg.nd)} punts × ${f0(PER23)} = ${reg.total>=1e6?f1(reg.total/1e6)+" milions":f0(reg.total)}`]],{anchor:right?"start":"end",size:12.5,halo:true});
  },off);
  ctx.drawImage(BG,0,0,w,h);
  V.onView(el,instant=>{ if(instant){ drawn=ORD.length; paint(); return; }
    el._timer=d3.timer(t=>{ reveal(t); if(drawn>=ORD.length){ el._timer.stop(); paint(); } }); });
});

/* =====================================================================
   IB-24 · ARCS DE FLUX  (dades d'exemple: ciutats reals, fluxos inventats)
   ===================================================================== */
const CITIES=[["Nova York",-74.01,40.71,"r"],["Ciutat de Mèxic",-99.13,19.43,"l"],["São Paulo",-46.63,-23.55,"r"],["Londres",-.13,51.51,"l"],["Barcelona",2.17,41.39,"b"],
  ["Lagos",3.38,6.52,"l"],["El Caire",31.24,30.04,"b"],["Johannesburg",28.05,-26.2,"r"],["Moscou",37.62,55.76,"r"],["Dubai",55.27,25.2,"b"],["Bombai",72.88,19.08,"b"],
  ["Singapur",103.82,1.35,"b"],["Tòquio",139.69,35.69,"r"],["Sydney",151.21,-33.87,"r"]].map(([n,lon,lat,lp],i)=>({i,n,lon,lat,lp}));
const MOB24=new Set(["Nova York","São Paulo","Londres","Lagos","Johannesburg","Dubai","Singapur","Tòquio","Sydney"]);
const FLOWS=(function(){ const r=V.rng(2404), out=[];
  CITIES.forEach(a=>CITIES.forEach(b=>{ if(a===b)return; const d=d3.geoDistance([a.lon,a.lat],[b.lon,b.lat]);
    if(r()<.34-.06*d){ out.push({a,b,v:Math.round(Math.exp(1.2*V.gauss(r)+3.4)*10)*10}); } }));
  return out.filter(f=>f.v>=40); })();
legend(24,el=>V.legendCat(el,[{c:C.blau,t:"Flux · el gruix és el volum",kind:"line",w:2},{c:C.vermell,t:"Sortides de la ciutat triada",kind:"line",w:2},{c:C.blauFosc,t:"Arribades a la ciutat triada",kind:"line",w:2}]));
const M24=piece(24,(el,w)=>{
  if(needWorld(()=>M24))return;
  if(el._loop)el._loop.stop();
  const mob=w<640;
  const proj=d3.geoNaturalEarth1().rotate([-20,0]).fitWidth(w,{type:"Sphere"});
  const y0=proj([0,90])[1], y1=proj([0,-58])[1]; proj.translate([proj.translate()[0],proj.translate()[1]-y0+6]); const h=Math.ceil(y1-y0+10);
  const {under,ctx,s}=stack(el,w,h,`Mapa del món amb ${FLOWS.length} fluxos entre ${CITIES.length} ciutats, dibuixats com a arcs de cercle màxim amb partícules que circulen d'origen a destinació. El gruix és el volum. Dades d'exemple generades.`);
  const path=d3.geoPath(proj);
  under.append("path").attr("d",path(W.land)).attr("fill",C.land);
  CITIES.forEach(c=>{ const p=proj([c.lon,c.lat]); c.x=p[0]; c.y=p[1]; });
  const vmax=d3.max(FLOWS,f=>f.v), wd=d3.scaleLinear([0,vmax],[.5,mob?3.6:5]);
  // geometria de cada arc: cercle màxim + una petita separació a l'esquerra del sentit
  FLOWS.forEach(f=>{ const ip=d3.geoInterpolate([f.a.lon,f.a.lat],[f.b.lon,f.b.lat]), n=56, P=[];
    for(let i=0;i<=n;i++)P.push(proj(ip(i/n)));
    const dx=f.b.x-f.a.x, dy=f.b.y-f.a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, off=Math.min(mob?18:34,L*.1);
    f.P=P.map((p,i)=>{ const t=i/n, o=Math.sin(Math.PI*t)*off; return [p[0]+nx*o,p[1]+ny*o]; });
    f.cum=[0]; for(let i=1;i<f.P.length;i++)f.cum.push(f.cum[i-1]+Math.hypot(f.P[i][0]-f.P[i-1][0],f.P[i][1]-f.P[i-1][1]));
    f.len=f.cum[f.cum.length-1]; f.ok=d3.max(f.P.slice(1),(p,i)=>Math.abs(p[0]-f.P[i][0]))<w*.3; });
  const FL=FLOWS.filter(f=>f.ok).sort((a,b)=>b.v-a.v);
  const r=V.rng(24); FL.forEach((f,k)=>{ f.dl=k*35; f.np=Math.max(2,Math.round(f.v/(vmax/12))); f.ph=d3.range(f.np).map(()=>r()); f.sp=(mob?55:80)/f.len; });
  function at(f,u){ const d=u*f.len; let i=d3.bisectRight(f.cum,d)-1; i=clamp(i,0,f.P.length-2); const t=(d-f.cum[i])/((f.cum[i+1]-f.cum[i])||1); return [f.P[i][0]+(f.P[i+1][0]-f.P[i][0])*t,f.P[i][1]+(f.P[i+1][1]-f.P[i][1])*t]; }
  let sel=null, T0=null;
  const isOn=f=>!sel||(sel.f?f===sel.f:(f.a===sel.c||f.b===sel.c));
  function colOf(f,a){ if(!sel)return V.alpha(C.blau,a*.8); if(!isOn(f))return V.alpha(C.ghost,.18); if(sel.f||f.a===sel.c)return V.alpha(C.vermell,a*1.6); return V.alpha(C.blauFosc,a*1.6); }
  const dpr=Math.min(2,window.devicePixelRatio||1), END=d3.max(FL,f=>f.dl)+900, ARC=new Map();
  function arcs(x,tt){ x.lineCap="round"; const order=sel?FL.slice().sort((a,b)=>(isOn(a)?1:0)-(isOn(b)?1:0)):FL; // primer els grisos
    for(const f of order){ const p=clamp((tt-f.dl)/900,0,1); if(p<=0)continue;
      x.strokeStyle=colOf(f,.32); x.lineWidth=wd(f.v)*(sel&&isOn(f)?1.35:1); x.beginPath();
      const m=Math.max(1,Math.round(p*(f.P.length-1))); x.moveTo(f.P[0][0],f.P[0][1]); for(let i=1;i<=m;i++)x.lineTo(f.P[i][0],f.P[i][1]); x.stroke(); } }
  // els arcs acabats són fixos: es pinten una vegada per estat (cap ciutat, una ciutat, un flux) i després només drawImage
  function arcImg(){ const k=sel?(sel.c?"c"+sel.c.i:"f"+FL.indexOf(sel.f)):""; if(!ARC.has(k)){ const cv=document.createElement("canvas"); cv.width=w*dpr; cv.height=h*dpr; const x=cv.getContext("2d"); x.scale(dpr,dpr); arcs(x,1e9); ARC.set(k,cv); } return ARC.get(k); }
  function frame(t){ if(T0==null)T0=t; const tt=V.reduced?1e9:t-T0;
    ctx.clearRect(0,0,w,h); ctx.lineCap="round";
    if(tt>=END)ctx.drawImage(arcImg(),0,0,w,h); else arcs(ctx,tt);
    for(const f of FL){ const p=clamp((tt-f.dl)/900,0,1); const on=isOn(f);
      if(p<1||!on)continue;
      const age=(tt-f.dl-900)/1000;
      for(const ph of f.ph){ const u=((age*f.sp*1000/1000)+ph)%1; if(u<0)continue;
        const hd=at(f,u), tl=at(f,Math.max(0,u-12/f.len));
        ctx.strokeStyle=colOf(f,.55); ctx.lineWidth=Math.max(1,wd(f.v)*.55); ctx.beginPath(); ctx.moveTo(tl[0],tl[1]); ctx.lineTo(hd[0],hd[1]); ctx.stroke();
        ctx.fillStyle=sel?((sel.f||f.a===sel.c)?C.vermell:C.blauFosc):C.blau; ctx.beginPath(); ctx.arc(hd[0],hd[1],Math.max(1.6,wd(f.v)*.55),0,6.2832); ctx.fill(); } } }
  // ciutats i etiquetes
  const g=s.append("g"), cg=g.selectAll("g").data(CITIES).join("g");
  cg.append("circle").attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",3).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.2);
  cg.filter(d=>!mob||MOB24.has(d.n)).each(function(d){ const o=d.lp==="l"?[-7,4,"end"]:d.lp==="b"?[0,16,"middle"]:[7,4,"start"];
    V.t(d3.select(this),d.x+o[0],d.y+o[1],d.n,{anchor:o[2],size:mob?11.5:12,halo:true}); });
  const big=FL[0];
  if(big&&!mob){ const m=at(big,.45); V.note(g,{x:m[0],y:m[1]+2,tx:m[0]+18,ty:m[1]+112,kind:"elbow",anchor:"start",
    lines:[["El flux més gros",true],[`${big.a.n} → ${big.b.n}: ${f0(big.v)} unitats`]]}); }
  // clau de gruix (l'escala del volum), a baix a l'esquerra
  const VK=mob?[10000,30000]:[5000,15000,30000], key=g.append("g"), kx=mob?6:14, ky=h-(mob?8:12)-(VK.length-1)*(mob?14:17);
  VK.forEach((v,i)=>{ const y=ky+i*(mob?14:17); key.append("line").attr("x1",kx).attr("x2",kx+28).attr("y1",y).attr("y2",y).attr("stroke",V.alpha(C.blau,.55)).attr("stroke-width",wd(v)).attr("stroke-linecap","round");
    V.t(key,kx+36,y+4,f0(v)+(i===VK.length-1?" unitats":""),{size:11.5,fill:C.ink2,halo:true}); });
  const hg=g.append("g").style("pointer-events","none"), TOTV=d3.sum(FL,f=>f.v);
  FL.forEach((f,i)=>f.rk=i+1);
  const segD=(px,py,a,b)=>{ const dx=b[0]-a[0], dy=b[1]-a[1], L=dx*dx+dy*dy||1, t=clamp(((px-a[0])*dx+(py-a[1])*dy)/L,0,1); return Math.hypot(a[0]+t*dx-px,a[1]+t*dy-py); };
  const tp=tipOf(el), hit=hitRect(s,w,h);
  let curK=null;
  function off(){ sel=null; curK=null; V.focus(cg,null); cg.select("circle").attr("r",3).attr("fill","#fff"); cg.selectAll("text").attr("font-weight",400); hg.selectAll("*").remove(); key.style("opacity",1); g.selectAll(".ibv-note").style("opacity",1); tp.hide(); if(V.reduced)frame(0); }
  V.hover(hit.node(),(ev,[px,py])=>{ const c=d3.least(CITIES,o=>(o.x-px)**2+(o.y-py)**2);
    let ns=null;
    if(c&&Math.hypot(c.x-px,c.y-py)<=(mob?22:26))ns={c};
    else { let best=1e9, bf=null; FL.forEach(f=>{ for(let i=1;i<f.P.length;i++){ const q=segD(px,py,f.P[i-1],f.P[i]); if(q<best){best=q;bf=f;} } }); if(bf&&best<=Math.max(8,wd(bf.v)))ns={f:bf}; }
    if(!ns){ off(); return; }
    const k=ns.c?"c"+ns.c.i:"f"+FL.indexOf(ns.f);
    if(ns.c){ const c=ns.c, out=FL.filter(f=>f.a===c), inn=FL.filter(f=>f.b===c), so=d3.sum(out,f=>f.v), si=d3.sum(inn,f=>f.v);
      tp.show(`<b>${c.n}</b><br>Surten <b>${f0(so)} unitats</b> (${out.length} ${out.length===1?"flux":"fluxos"})<br>N'arriben <b>${f0(si)}</b> (${inn.length} ${inn.length===1?"flux":"fluxos"})<br>${V.fmt(",.0f")(100*(so+si)/TOTV)} % de tot el volum · <i>dades d'exemple</i>`,c.x,c.y); }
    else { const f=ns.f; tp.show(`<b>${f.a.n} → ${f.b.n}</b><br><b>${f0(f.v)} unitats</b><br>${V.fmt(",.1f")(100*f.v/TOTV)} % del total · posició ${f.rk} de ${FL.length} · <i>dades d'exemple</i>`,px,py); }
    if(k===curK)return; curK=k; sel=ns; hg.selectAll("*").remove(); hg.raise(); hit.raise(); g.selectAll(".ibv-note").style("opacity",.5);
    const ends=ns.c?[ns.c]:[ns.f.a,ns.f.b];
    const partner=o=>ends.includes(o)||(ns.c&&FL.some(f=>(f.a===ns.c&&f.b===o)||(f.b===ns.c&&f.a===o)));
    V.focus(cg,partner,{dim:.2}); cg.filter(o=>ends.includes(o)).raise().select("circle").attr("r",4.5).attr("fill",C.ink); cg.selectAll("text").attr("font-weight",o=>ends.includes(o)?700:400);
    ends.forEach(o=>hg.append("circle").attr("cx",o.x).attr("cy",o.y).attr("r",10).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5));
    ends.forEach(o=>{ if(mob&&!MOB24.has(o.n))V.t(hg,o.x,o.y-14,o.n,{anchor:"middle",size:12,weight:700,halo:true}); });
    if(ns.c){ // etiquetes directes: el volum al costat de cada ciutat connectada
      const seen=new Map(); FL.filter(f=>!mob&&(f.a===ns.c||f.b===ns.c)).forEach(f=>{ const o=f.a===ns.c?f.b:f.a, k2=seen.get(o)||0; seen.set(o,k2+1);
        const lp=o.lp, x=lp==="r"?o.x-8:lp==="l"?o.x+8:o.x, y=(lp==="b"?o.y-9:o.y+4)+(lp==="b"?-13:13)*k2;
        V.t(hg,x,y,(f.a===ns.c?"→ ":"← ")+f0(f.v),{anchor:lp==="r"?"end":lp==="l"?"start":"middle",size:11.5,weight:700,halo:true}); });
    } else { const f=ns.f, m=at(f,.5);
      V.lines(hg,m[0],m[1]-14,[[`${f.a.n} → ${f.b.n}`,true],[`${f0(f.v)} unitats`]],{anchor:"middle",size:12,halo:true}); }
    // guia fins a l'escala: el gruix d'aquest flux (o del més gros de la ciutat) a la clau
    const bfl=ns.f||d3.greatest(FL.filter(f=>f.a===ns.c||f.b===ns.c),f=>f.v), fv=bfl?bfl.v:0, yk=ky-(mob?16:20), kc=ns.c&&bfl&&bfl.b===ns.c?C.blauFosc:C.vermell;
    key.style("opacity",.52);
    hg.append("line").attr("x1",kx).attr("x2",kx+28).attr("y1",yk).attr("y2",yk).attr("stroke",kc).attr("stroke-width",wd(fv)*1.35).attr("stroke-linecap","round");
    V.t(hg,kx+36,yk+4,`${f0(fv)} unitats${ns.c?" (el més gros)":""}`,{size:12,weight:700,halo:true});
    if(V.reduced)frame(0);
  },off);
  frame(0);
  V.onView(el,instant=>{ if(instant)T0=-1e9; el._loop=V.loop(el,frame); });
});

/* =====================================================================
   IB-25 · MAPA DE CERCLES TRANSLÚCIDS  (dades reals: Wigington et al. 2016, corregit 2017)
   Projecció plana neta (Equal Earth), zero perspectiva 3D i zero agulles: cercles translúcids multiply.
   ===================================================================== */
const SITES=D.virus.map(([lon,lat,n,v,st])=>({lon,lat,n,v,st}));
const PLACE25={"BATS":"Bermuda (BATS)","USC MO":"Costa de Los Angeles","BEDFORDBASIN":"Halifax (Bedford Basin)","CASES03-04":"Golf d'Amundsen","RAUNEFJORD2000":"Bergen (Raunefjorden)","MOVE":"Badia de Chesapeake"};
const place25=d=>PLACE25[d.st]||(d.lon<-160&&d.lat>=66?"Mar dels Txuktxis":d.lon<-160&&d.lat>=52?"Mar de Bering":d.lon<-140&&d.lon>-160&&d.lat>=54&&d.lat<61?"Golf d'Alaska":llS(d.lon,d.lat));
const MODE25=[{k:"n",c:C.vermell,max:d3.max(SITES,d=>d.n),ref:[50,400,1400],f:v=>`${f0(v)} ${v===1?"mesura":"mesures"}`},
  {k:"v",c:C.blau,max:d3.max(SITES,d=>d.v),ref:[5,25,80],f:v=>`mediana de ${f1(v)} milions de virus/ml`}];
legend(25,el=>V.legendCat(el,[{c:C.vermell,t:"Àrea: nombre de mesures",a:.42},{c:C.blau,t:"Àrea: virus per ml (mediana)",a:.42}]));
let mode25=0;
const M25=piece(25,(el,w)=>{
  if(needWorld(()=>M25))return;
  if(el._tm)el._tm.stop();
  const mob=w<640, pad=mob?4:8;
  const proj=d3.geoEqualEarth().rotate([60,0]).fitWidth(w-pad*2,{type:"Sphere"});
  const path=d3.geoPath(proj), h=Math.ceil(path.bounds({type:"Sphere"})[1][1])+pad*2;
  const {under,c,ctx,s}=stack(el,w,h,`Mapa pla Equal Earth amb cercles translúcids a cada punt de mostreig marí: ${SITES.length} llocs i ${f0(d3.sum(SITES,d=>d.n))} mesures. Bermuda (BATS) en concentra ${f0(MODE25[0].max)}. Dades reals de Wigington et al. 2016.`);
  c.style.transition="opacity .15s";
  const ug=under.append("g").attr("transform",`translate(${pad},${pad})`);
  ug.append("path").attr("d",path({type:"Sphere"})).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.7);
  ug.append("path").attr("d",path(d3.geoGraticule().step([30,30])())).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.5);
  ug.append("path").attr("d",path(W.land)).attr("fill",C.land);
  ug.append("path").attr("d",path(W.borders)).attr("fill","none").attr("stroke","#fff").attr("stroke-width",.6);

  const g=s.append("g"), maxR=mob?26:44;
  const RS=m=>d3.scaleSqrt([0,MODE25[m].max],[mob?2.2:2.6,maxR]);
  SITES.forEach(d=>{ const q=proj([d.lon,d.lat]); d.x=q[0]+pad; d.y=q[1]+pad; d.r=0; });
  const P=SITES.slice().sort((a,b)=>b.n-a.n);
  let colM=mode25;

  function draw(){
    ctx.clearRect(0,0,w,h);
    const cl=MODE25[colM].c;
    ctx.save(); ctx.globalCompositeOperation="multiply";
    for(const d of P){
      if(d.r<=.1)continue;
      const rg=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.r);
      rg.addColorStop(0,V.alpha(cl,.42));
      rg.addColorStop(.68,V.alpha(cl,.24));
      rg.addColorStop(1,V.alpha(cl,.05));
      ctx.fillStyle=rg;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,6.283); ctx.fill();
    }
    ctx.restore();
    // puntet central nítid perquè es vegin els recorreguts de les campanyes oceàniques
    ctx.fillStyle=V.alpha(cl,.8);
    for(const d of P){ if(d.r<=.1)continue; ctx.beginPath(); ctx.arc(d.x,d.y,1.3,0,6.283); ctx.fill(); }
  }

  function animate(m,dur,del){
    if(el._tm)el._tm.stop();
    const rs=RS(m), k=MODE25[m].k;
    P.forEach(d=>{ d.r0=d.r; d.r1=rs(d[k]); d.dl=del(d); });
    if(V.reduced||!dur){ P.forEach(d=>d.r=d.r1); draw(); return; }
    const tend=dur+d3.max(P,d=>d.dl);
    el._tm=d3.timer(t=>{
      for(const d of P){ const q=clamp((t-d.dl)/dur,0,1), e=d.r0===0?d3.easeCubicOut(q):EIO(q); d.r=d.r0+(d.r1-d.r0)*e; }
      draw(); if(t>=tend)el._tm.stop();
    });
  }

  const labs=g.append("g");
  function drawLabels(m){
    labs.selectAll("*").remove();
    const k=MODE25[m].k, rs=RS(m), top5=[], cand=SITES.slice().sort((a,b)=>b[k]-a[k]), boxes=[], fsz=mob?11.5:12;
    for(const d of cand){ if(top5.length>=(mob?3:5))break; if(top5.some(o=>place25(o)===place25(d)))continue; top5.push(d); }
    const hit=b=>boxes.some(o=>b.x0<o.x1&&b.x1>o.x0&&b.y0<o.y1&&b.y1>o.y0)||b.x0<4||b.x1>w-4||b.y0<10||b.y1>h-6;
    top5.forEach(d=>{
      const rr=rs(d[k]), L1=place25(d), L2=m?`${f1(d.v)} M/ml`:`${f0(d.n)} mesures`;
      const tw=Math.max(L1.length*fsz*.56,L2.length*fsz*.52)+8; let pl=null;
      const dirs=[[1,-1],[1,1],[-1,-1],[-1,1]];
      for(let dist=rr+14;dist<rr+90&&!pl;dist+=16){
        for(const [dx,dy] of dirs){
          const x=d.x+dx*dist, y=d.y+dy*(dist*.55), right=dx>0;
          const b={x0:right?x:x-tw,x1:right?x+tw:x,y0:y-fsz*1.1,y1:y+fsz*1.4};
          if(!hit(b)){ pl={x,y,right,b,dx,dy}; break; }
        }
      }
      if(!pl)return; boxes.push(pl.b);
      V.note(labs,{x:d.x+pl.dx*rr*.6,y:d.y+pl.dy*rr*.6,tx:pl.x,ty:pl.y,kind:"curve",bend:pl.dx*8,anchor:pl.right?"start":"end",lines:[[L1,true],[L2]],size:fsz});
    });
  }

  if(!mob){ const oa=proj([-36,12]); V.t(g,oa[0]+pad,oa[1]+pad,"Oceà Atlàntic",{anchor:"middle",italic:true,size:12,fill:C.muted,halo:true}); }
  const rs0=RS(mode25); P.forEach(d=>d.r=el.__seen?rs0(d[MODE25[mode25].k]):0); draw(); drawLabels(mode25);
  V.onView(el,instant=>{
    if(instant){ P.forEach(d=>d.r=RS(mode25)(d[MODE25[mode25].k])); draw(); return; }
    labs.style("opacity",0); animate(mode25,900,d=>(d.x/w)*450);
    labs.transition().delay(1100).duration(450).style("opacity",1);
  });
  el._go=m=>{
    el._off&&el._off(); const dur=V.reduced?0:850; labs.transition().duration(dur*.25).style("opacity",0);
    colM=m; animate(m,dur,d=>(d.x/w)*250);
    setTimeout(()=>{ drawLabels(m); labs.style("opacity",0).transition().duration(350).style("opacity",1); },dur*1.05);
  };

  const hg=g.append("g").style("pointer-events","none"), TOTN=d3.sum(SITES,x=>x.n), MEDV=d3.median(SITES,x=>x.v);
  const del=d3.Delaunay.from(P,d=>d.x,d=>d.y);
  const tp=tipOf(el), hit=hitRect(s,w,h,"pointer");
  let cur=null;
  function off(){ cur=null; c.style.opacity=1; hg.selectAll("*").remove(); labs.style("opacity",1); tp.hide(); }
  el._off=off;
  V.hover(hit.node(),(ev,[px,py])=>{
    const d=P[del.find(px,py)];
    if(!d||Math.hypot(d.x-px,d.y-py)>Math.max(18,d.r+8)){ off(); return; }
    const m=mode25, val=m?`${f1(d.v)} milions de virus/ml`:`${f0(d.n)} ${d.n===1?"mesura":"mesures"}`;
    const ctxt=m?`${d.v>=MEDV?"+":"−"}${f0(Math.abs(100*(d.v/MEDV-1)))} % vs mediana`:`${V.fmt(",.1f")(100*d.n/TOTN)} % del total`;
    tp.show(`<b>${place25(d)}</b> · ${val}<br>${ctxt} · ${llS(d.lon,d.lat)}`,d.x,d.y);
    if(d===cur)return; cur=d; hg.selectAll("*").remove(); labs.style("opacity",.48); c.style.opacity=.5;
    hg.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",d.r).attr("fill",V.alpha(MODE25[m].c,.45)).attr("stroke",C.ink).attr("stroke-width",1.4);
    hg.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",2.6).attr("fill",C.ink);
  },off);
});
seg(25,m=>{ mode25=m; const el=$('[data-p="25"]'); el._go&&el._go(m); });

/* =====================================================================
   IB-26 · MAPA DE FRANGES I ISOLÍNIES  (dades reals: NCEP/NCAR R1, diferència amb la mitjana de la latitud)
   Projecció plana neta Equal Earth amb bandes suaus translúcides, costes recognoscibles
   i isolínies etiquetades (estil «Germany — average rainfall and temperature»).
   ===================================================================== */
const DIV26=V.div(26);
legend(26,el=>{
  V.legendRamp(el,{scale:DIV26,min:-26,max:26,ticks:[-20,-10,0,10,20],f:v=>sgn(v,0),title:"Respecte a la latitud (°C)",lo:"Més fred",hi:"Més calent"});
  V.legendCat(el,[{c:C.vermell,t:"+10 / +20 °C",kind:"line",w:1.3},{c:C.blau,t:"−10 / −20 °C",kind:"line",w:1.3},{c:C.ink2,t:"0 °C",kind:"line",w:1,dash:"3 3"}]);
});
let mode26=0;
// Interpolació bilineal del camp NCEP sobre [-180,180] × [-90,90]
function sampleField(arr,lon,lat){
  const L=((lon%360)+360)%360, fx=L/STEP, fy=(90-clamp(lat,-90,90))/STEP;
  const j0=Math.floor(fx)%NLON, j1=(j0+1)%NLON, i0=Math.min(NLAT-1,Math.max(0,Math.floor(fy))), i1=Math.min(NLAT-1,i0+1);
  const ux=fx-Math.floor(fx), uy=fy-Math.floor(fy);
  const a=arr[i0*NLON+j0], b=arr[i0*NLON+j1], c=arr[i1*NLON+j0], d=arr[i1*NLON+j1];
  return (a*(1-ux)+b*ux)*(1-uy)+(c*(1-ux)+d*ux)*uy;
}
// Construeix isolínies GeoJSON netes (sense arestes de vora) per a un mes
const ISO26_TH=[-20,-10,0,10,20];
function buildIso26(m){
  const WG=NLON+1, G=new Float32Array(WG*NLAT);
  for(let i=0;i<NLAT;i++)for(let j=0;j<WG;j++){
    const lon=-180+j*STEP, jj=Math.round(((lon+360)%360)/STEP)%NLON;
    G[i*WG+j]=ANOM[m][i*NLON+jj];
  }
  const gen=d3.contours().size([WG,NLAT]).thresholds(ISO26_TH);
  const out=[];
  for(const c of gen(G)){
    const v=c.value, lines=[];
    for(const poly of c.coordinates){
      for(const ring of poly){
        let seg=[];
        for(let k=0;k<ring.length;k++){
          const [gx,gy]=ring[k];
          const edge=gx<=.02||gx>=WG-1.02||gy<=.02||gy>=NLAT-1.02;
          if(edge){ if(seg.length>=2)lines.push(seg); seg=[]; }
          else seg.push([-180+gx*STEP,90-gy*STEP]);
        }
        if(seg.length>=2)lines.push(seg);
      }
    }
    out.push({v,fc:{type:"MultiLineString",coordinates:lines},lines});
  }
  return out;
}
const ISO26=[buildIso26(0),buildIso26(1)];
// Precomputa RGB de la rampa per a un renderitzat ràpid en bandes suaus de 5 °C
const BAND26=(function(){
  const m=new Map();
  for(let b=-30;b<=30;b+=5){
    const q=Math.abs(b)<2.5?0:b;
    const rgb=d3.rgb(DIV26(q));
    // Mescla suau amb blanc (72 %) per aconseguir l'efecte d'aquarel·la/litografia
    const a=Math.abs(q)<2.5?.22:.68;
    m.set(b,[Math.round(255*(1-a)+rgb.r*a),Math.round(255*(1-a)+rgb.g*a),Math.round(255*(1-a)+rgb.b*a)]);
  }
  return v=>{ const b=clamp(Math.round(v/5)*5,-30,30); return m.get(b); };
})();

const M26=piece(26,(el,w)=>{
  if(needWorld(()=>M26))return;
  const mob=w<640, pad=mob?4:10;
  const proj=d3.geoEqualEarth().fitWidth(w-pad*2,{type:"Sphere"});
  const [[x0,y0],[x1,y1]]=d3.geoPath(proj).bounds({type:"Sphere"});
  const dx=Math.round((w-(x1-x0))/2-x0), dy=Math.round(6-y0);
  proj.translate([proj.translate()[0]+dx,proj.translate()[1]+dy]);
  const h=Math.ceil(y1-y0+16);
  const {under,c,ctx,s}=stack(el,w,h,"Mapa del món en projecció Equal Earth amb franges suaus i isolínies de la diferència de temperatura respecte a la mitjana de cada latitud. Al gener destaca el mar de Noruega (+25,8 °C sobre la mitjana) i el Tibet (−31,9 °C per l'altitud). Dades reals NCEP/NCAR, 1991–2020.");
  const path=d3.geoPath(proj);

  // Capa de fons: perfil del planeta
  under.append("path").attr("d",path({type:"Sphere"})).attr("fill","#fff").attr("stroke",C.hair).attr("stroke-width",.8);

  // Precalculem la graella de coordenades geogràfiques sobre un canvas reduït per a renderitzat instantani
  const sc=mob?3:2, ow=Math.ceil(w/sc), oh=Math.ceil(h/sc);
  const offC=document.createElement("canvas"); offC.width=ow; offC.height=oh;
  const offX=offC.getContext("2d"), img=offX.createImageData(ow,oh);
  const invLon=new Float32Array(ow*oh), invLat=new Float32Array(ow*oh), inSph=new Uint8Array(ow*oh);
  // Màscara de l'esfera per evitar projeccions fora del globus
  const spC=document.createElement("canvas"); spC.width=ow; spC.height=oh;
  const spX=spC.getContext("2d"); spX.save(); spX.scale(1/sc,1/sc); spX.fillStyle="#000"; spX.beginPath(); d3.geoPath(proj,spX)({type:"Sphere"}); spX.fill(); spX.restore();
  const spD=spX.getImageData(0,0,ow,oh).data;
  for(let py=0;py<oh;py++){
    for(let px=0;px<ow;px++){
      const idx=py*ow+px;
      if(spD[idx*4+3]<128)continue;
      const ll=proj.invert([(px+.5)*sc,(py+.5)*sc]);
      if(!ll||!isFinite(ll[0])||!isFinite(ll[1])||Math.abs(ll[0])>180||Math.abs(ll[1])>90)continue;
      inSph[idx]=1; invLon[idx]=ll[0]; invLat[idx]=ll[1];
    }
  }

  function paintBands(m){
    const arr=ANOM[m], d=img.data;
    for(let i=0;i<ow*oh;i++){
      const p=i*4;
      if(!inSph[i]){ d[p+3]=0; continue; }
      const v=sampleField(arr,invLon[i],invLat[i]);
      const rgb=BAND26(v);
      d[p]=rgb[0]; d[p+1]=rgb[1]; d[p+2]=rgb[2]; d[p+3]=255;
    }
    offX.putImageData(img,0,0);
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.beginPath(); d3.geoPath(proj,ctx)({type:"Sphere"}); ctx.clip();
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(offC,0,0,w,h);
    ctx.restore();
  }

  // Capes SVG nítides a sobre: gratícula, costes, isolínies, etiquetes i anotacions
  const g=s.append("g");
  g.append("path").attr("d",path(d3.geoGraticule().step([30,30])())).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.45).attr("stroke-opacity",.12);
  g.append("path").attr("d",path(W.borders)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.4).attr("stroke-opacity",.18);
  g.append("path").attr("d",path(W.land)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",mob?.6:.75).attr("stroke-opacity",.68);
  g.append("path").attr("d",path({type:"Sphere"})).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.9);

  const gIso=g.append("g"), gIsoLab=g.append("g"), gNotes=g.append("g");

  function drawIso(m){
    gIso.selectAll("*").remove(); gIsoLab.selectAll("*").remove(); gNotes.selectAll("*").remove();
    // Extrems càlid i fred dins [75°N, 60°S] (calculats abans per evitar col·lisions d'etiquetes)
    let mx=null, mn=null;
    for(let i=Math.round((90-75)/STEP);gLat(i)>=-60;i++){
      for(let j=0;j<NLON;j++){
        const a=ANOM[m][i*NLON+j], lon=gLon(j), lat=gLat(i);
        if(!mx||a>mx.a)mx={a,lon,lat};
        if(!mn||a<mn.a)mn={a,lon,lat};
      }
    }
    const pmx=proj([mx.lon,mx.lat]), pmn=proj([mn.lon,mn.lat]);
    const list=ISO26[m];
    list.forEach(item=>{
      const v=item.v, isZero=v===0, col=isZero?C.ink2:(v>0?C.vermell:C.blau);
      const sw=isZero?.8:(Math.abs(v)>=20?1.45:1.1);
      gIso.append("path").attr("d",path(item.fc)).attr("fill","none").attr("stroke",col)
        .attr("stroke-width",mob?sw*.85:sw).attr("stroke-opacity",isZero?.55:.88)
        .attr("stroke-dasharray",isZero?"3 3":null).attr("stroke-linejoin","round");
      // Etiquetes puntuals sobre els trams més llargs (només escriptori i lluny de les anotacions)
      if(mob||isZero)return;
      const ranked=item.lines.filter(ln=>ln.length>=10).sort((a,b)=>b.length-a.length).slice(0,2);
      ranked.forEach(ln=>{
        const mid=ln[Math.floor(ln.length/2)], pt=proj(mid);
        if(!pt||pt[0]<28||pt[0]>w-28||pt[1]<20||pt[1]>h-20)return;
        if(Math.hypot(pt[0]-pmx[0],pt[1]-pmx[1])<64||Math.hypot(pt[0]-pmn[0],pt[1]-pmn[1])<64)return;
        V.t(gIsoLab,pt[0],pt[1]+3,`${v>0?"+":""}${v}°`,{size:11,weight:700,fill:col,anchor:"middle",halo:3.2});
      });
    });

    gNotes.append("circle").attr("cx",pmx[0]).attr("cy",pmx[1]).attr("r",3.2).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.2);
    gNotes.append("circle").attr("cx",pmn[0]).attr("cy",pmn[1]).attr("r",3.2).attr("fill",C.blau).attr("stroke","#fff").attr("stroke-width",1.2);
    // Anotacions col·locades sobre zones d'oceà obertes per màxima llegibilitat
    V.note(gNotes,{x:pmx[0],y:pmx[1]-2,tx:clamp(pmx[0]-(mob?34:68),mob?90:130,w-80),ty:Math.max(20,pmx[1]-(mob?6:22)),
      kind:"curve",anchor:"end",size:mob?11.5:12.5,
      lines:[[placeName(mx.lon,mx.lat),true],[`${sgn(mx.a)} °C sobre la mitjana`]]});
    if(!mob||m===0){
      V.note(gNotes,{x:pmn[0],y:pmn[1]+3,tx:clamp(pmn[0]+(mob?-14:28),mob?80:110,w-(mob?80:130)),ty:Math.min(h-28,pmn[1]+(mob?42:62)),
        kind:"curve",anchor:mob?"end":"start",size:mob?11.5:12.5,
        lines:[[`${placeName(mn.lon,mn.lat)}, ${sgn(mn.a)} °C`,true],["fred per l'altitud"]]});
    }
  }

  paintBands(mode26);
  drawIso(mode26);

  V.onView(el,instant=>{
    if(instant)return;
    c.style.opacity=0; gIso.style("opacity",0); gIsoLab.style("opacity",0); gNotes.style("opacity",0);
    d3.select(c).transition().duration(650).ease(EIO).style("opacity",1);
    gIso.transition().delay(220).duration(550).ease(EIO).style("opacity",1);
    gIsoLab.transition().delay(420).duration(400).style("opacity",1);
    gNotes.transition().delay(520).duration(450).style("opacity",1);
  });

  el._go=m=>{
    el._off&&el._off();
    paintBands(m); drawIso(m);
    if(!V.reduced){
      gIso.style("opacity",.35).transition().duration(420).ease(EIO).style("opacity",1);
      gNotes.style("opacity",0).transition().delay(180).duration(380).style("opacity",1);
    }
  };

  // Hover suau i lectura en una sola línia ancorada sota el gràfic
  const hg=g.append("g").style("pointer-events","none");
  const tp=tipOf(el), hit=hitRect(s,w,h);
  function off(){ hg.selectAll("*").remove(); gNotes.style("opacity",1); tp.hide(); }
  el._off=off;
  V.hover(hit.node(),(ev,[px,py])=>{
    const ll=proj.invert([px,py]);
    if(!ll||!isFinite(ll[0])||!isFinite(ll[1])||Math.abs(ll[0])>180||Math.abs(ll[1])>88){ off(); return; }
    const back=proj(ll);
    if(!back||Math.hypot(back[0]-px,back[1]-py)>3){ off(); return; }
    const a=sampleField(ANOM[mode26],ll[0],ll[1]), t=sampleField(TEMP[mode26],ll[0],ll[1]);
    const col=a>=0?C.vermell:C.blau;
    gNotes.style("opacity",.5);
    hg.selectAll("*").remove();
    hg.append("circle").attr("cx",px).attr("cy",py).attr("r",6).attr("fill",V.alpha(col,.28)).attr("stroke",C.ink).attr("stroke-width",1.3);
    hg.append("circle").attr("cx",px).attr("cy",py).attr("r",2.2).attr("fill",C.ink);
    const right=px<w*.65;
    V.t(hg,px+(right?10:-10),py-8,`${sgn(a)} °C`,{anchor:right?"start":"end",size:12.5,weight:700,fill:col,halo:3.2});
    tp.show(`<b>${placeName(ll[0],ll[1])}</b> · ${sgn(a)} °C vs latitud (${MES2[mode26]}: ${f1(t)} °C)`,px,py);
  },off);
});
seg(26,m=>{ mode26=m; const el=$('[data-p="26"]'); el._go&&el._go(m); });
void M26;

/* =====================================================================
   IB-27 · GLOBUS QUE GIRA  (dades reals: NCEP/NCAR R1; la nit és un esquema)
   ===================================================================== */
const DIV27=V.div(30);
legend(27,el=>{ V.legendRamp(el,{scale:DIV27,min:-30,max:30,ticks:[-30,-15,0,15,30],f:v=>sgn(v,0),title:"Temperatura de l'aire (°C)",lo:"Més freda",hi:"Més calenta"});
  V.legendCat(el,[{c:C.ink,a:.18,t:"Nit (esquema)"},{c:C.ink2,t:"Terminador",kind:"line",w:1,dash:"3 3"}]); });
const DECL=[-21.2,21.5]; // declinació del sol a mitjan gener i a mitjan juliol
const GRID27=(function(){ const out=[]; for(let i=1;i<NLAT-1;i++){ const lat=gLat(i), st=Math.max(1,Math.round(1/Math.cos(lat*Math.PI/180)));
  for(let j=0;j<NLON;j+=st){ const l=gLon(j)*Math.PI/180, p=lat*Math.PI/180, t0=TEMP[0][i*NLON+j], t1=TEMP[1][i*NLON+j];
    out.push({i,j,lon:gLon(j),lat,t0,t1,c0:DIV27(t0),c1:DIV27(t1),vx:Math.cos(p)*Math.cos(l),vy:Math.cos(p)*Math.sin(l),vz:Math.sin(p)}); } } return out; })();
// línies (costa i gratícula) com a vectors unitaris, calculats una sola vegada; cada fotograma només fa girar i projectar
const toVec=(lon,lat)=>{ const l=lon*Math.PI/180, p=lat*Math.PI/180; return [Math.cos(p)*Math.cos(l),Math.cos(p)*Math.sin(l),Math.sin(p)]; };
function vecLines(lines){ return lines.map(ln=>{ const a=new Float32Array(ln.length*3); ln.forEach((q,k)=>{ const v=toVec(q[0],q[1]); a[k*3]=v[0]; a[k*3+1]=v[1]; a[k*3+2]=v[2]; }); return a; }); }
let LAND27=null; const GRAT27=vecLines(d3.geoGraticule().step([15,15]).precision(3).lines().map(l=>l.coordinates));
let mon27=0, spin27=!V.reduced;
const MES27=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const fMon27=m=>(1-Math.cos(m*Math.PI/6))/2; // 0 = gener (real), 6 = juliol (real), sinusoïdal entremig
const M27=piece(27,(el,w)=>{
  if(needWorld(()=>M27))return;
  if(el._loop)el._loop.stop();
  const mob=w<640, padT=mob?52:12, S=Math.min(w,mob?w:620), R=S/2-10, h=Math.round(S+padT+(mob?46:0)), cx=w/2, cy=padT+S/2;
  const {c,ctx,s}=layer(el,w,h,"Globus terrestre que gira, pintat amb la temperatura mitjana de l'aire mes a mes (gener i juliol reals de 1991–2020; la resta, interpolació sinusoïdal): blau on glaça, vermell on fa calor. Una ombra marca la nit. Dades reals de la reanàlisi NCEP/NCAR.");
  c.classList.add("ibx-grab"); s.style("pointer-events","none");
  const proj=d3.geoOrthographic().scale(R).translate([cx,cy]).clipAngle(90).precision(.4), gp=d3.geoPath(proj,ctx);
  const grat=d3.geoGraticule().step([15,15])();
  let rot=el._rot||[-10,-28], mt=fMon27(mon27), hov=null, t0=null, ent=1;
  // Punts més fins i nítids perquè els continents i les costes es reconeguin al primer cop d'ull
  const rad=R*(STEP*Math.PI/180)*.22;
  if(!LAND27){ const rings=[]; W.land.features.forEach(f=>{ const G=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates; G.forEach(pg=>pg.forEach(r=>rings.push(r))); }); LAND27=vecLines(rings); }
  const nightCache=new Map(); let lastKey="";
  function frame(t,dt){
    if(t0==null)t0=t;
    if(spin27&&!el._drag&&!hov&&dt)rot[0]+=dt*0.009;
    if(el._mt!=null){ mt=el._mt; }
    const key=rot[0].toFixed(2)+"|"+rot[1].toFixed(2)+"|"+mt.toFixed(3)+"|"+(hov?hov.k:"")+"|"+ent.toFixed(3);
    if(key===lastKey)return; lastKey=key;
    el._rot=rot; proj.rotate(rot);
    ctx.clearRect(0,0,w,h);
    const L=rot[0]*Math.PI/180, cl=Math.cos(L), sl=Math.sin(L), Pp=rot[1]*Math.PI/180, cp=Math.cos(Pp), sp=Math.sin(Pp);
    const strokeV=arrs=>{ ctx.beginPath(); for(const a of arrs){ let on=false; for(let k=0;k<a.length;k+=3){ const x=a[k]*cl-a[k+1]*sl, y=a[k]*sl+a[k+1]*cl, z=a[k+2], x2=x*cp-z*sp, z2=z*cp+x*sp;
      if(x2<=0){ on=false; continue; } const X=cx+R*y, Y=cy-R*z2; if(on)ctx.lineTo(X,Y); else { ctx.moveTo(X,Y); on=true; } } } ctx.stroke(); };
    ctx.strokeStyle=C.hair; ctx.lineWidth=.55; strokeV(GRAT27);
    const mid=mt>0.001&&mt<0.999, dim=hov?.55:1;
    for(const d of GRID27){ const x=d.vx*cl-d.vy*sl, y=d.vx*sl+d.vy*cl, x2=x*cp-d.vz*sp; if(x2<=0.02)continue;
      const a=ent<1?clamp((ent*1.6-(1-x2)),0,1):1; if(a<=0)continue;
      ctx.globalAlpha=a*(.6+.4*x2)*dim; ctx.fillStyle=mid?DIV27(d.t0+(d.t1-d.t0)*mt):(mt>=.999?d.c1:d.c0);
      ctx.beginPath(); ctx.arc(cx+R*y,cy-R*(d.vz*cp+x*sp),rad*(.55+.45*Math.sqrt(x2))*(.6+.4*a),0,6.2832); ctx.fill(); }
    ctx.globalAlpha=1;
    ctx.strokeStyle=V.alpha(C.ink,.74); ctx.lineWidth=.75; strokeV(LAND27);
    const nk=rot[1].toFixed(1)+"|"+mt.toFixed(2); let night=nightCache.get(nk);
    if(!night){ const dec=DECL[0]+(DECL[1]-DECL[0])*mt; night=new Path2D(); const pr=d3.geoOrthographic().scale(R).translate([cx,cy]).clipAngle(90).precision(.6).rotate([0,rot[1]]);
      d3.geoPath(pr,night)(d3.geoCircle().center([70+180,-dec]).radius(90)()); if(nightCache.size>400)nightCache.clear(); nightCache.set(nk,night); }
    ctx.fillStyle=V.alpha(C.ink,.18); ctx.fill(night);
    ctx.setLineDash([3,3]); ctx.strokeStyle=C.ink2; ctx.lineWidth=.85; ctx.stroke(night); ctx.setLineDash([]);
    ctx.strokeStyle=C.hair; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,R,0,6.2832); ctx.stroke();
    if(hov){ const v=toVec(hov.lon,hov.lat), x=v[0]*cl-v[1]*sl, y=v[0]*sl+v[1]*cl, x2=x*cp-v[2]*sp;
      if(x2>0){ const p=[cx+R*y,cy-R*(v[2]*cp+x*sp)], T=TEMP[0][hov.k]+(TEMP[1][hov.k]-TEMP[0][hov.k])*mt;
        ctx.fillStyle=DIV27(T); ctx.strokeStyle=C.ink; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p[0],p[1],Math.max(4,rad*2.2),0,6.2832); ctx.fill(); ctx.stroke();
        const right=p[0]<cx-R*.55, txt=`${sgn(T)} °C`; ctx.font=`700 13px ${V.SANS}`; ctx.textAlign=right?"left":"right"; ctx.lineJoin="round";
        const lx=mob?p[0]:p[0]+(right?14:-14), ly=mob?p[1]+18:p[1]-8; if(mob)ctx.textAlign="center";
        ctx.lineWidth=3; ctx.strokeStyle="#fff"; ctx.strokeText(txt,lx,ly); ctx.fillStyle=C.ink; ctx.fillText(txt,lx,ly);
        mark(T); } }
    else mark(null);
    if(Math.abs((el._nrot||0)-rot[1])>.5||el._nm!==Math.round(mt)){ drawNote(); }
  }
  const ng=s.append("g");
  // escala dins del gràfic: on cau el punt apuntat
  const sc=s.append("g"), RT=[-30,-15,0,15,30], gid="g27"+Math.random().toString(36).slice(2,7);
  const vert=!mob, sL=vert?Math.min(200,R*.75):Math.min(260,w-60), sx0=vert?Math.max(18,cx-R-96):(w-sL)/2, sy0=vert?cy+R-sL-8:padT+S+18;
  const SP=d3.scaleLinear([-30,30],vert?[sy0+sL,sy0]:[sx0,sx0+sL]).clamp(true);
  { const gr=s.append("defs").append("linearGradient").attr("id",gid).attr("x1",0).attr("y1",vert?1:0).attr("x2",vert?0:1).attr("y2",0);
    d3.range(0,1.0001,.1).forEach(q=>gr.append("stop").attr("offset",q).attr("stop-color",DIV27(-30+60*q)));
    sc.append("rect").attr("x",vert?sx0:sx0).attr("y",vert?sy0:sy0).attr("width",vert?8:sL).attr("height",vert?sL:8).attr("fill",`url(#${gid})`);
    RT.forEach(v=>{ if(vert)V.t(sc,sx0+14,SP(v)+4,sgn(v,0),{size:11.5,fill:C.muted}); else V.t(sc,SP(v),sy0+21,sgn(v,0),{anchor:"middle",size:11.5,fill:C.muted}); });
    if(vert)V.t(sc,sx0,sy0-8,"°C",{size:11.5,fill:C.muted}); else V.t(sc,sx0-6,sy0+8,"°C",{anchor:"end",size:11.5,fill:C.muted}); }
  const mk=sc.append("g").style("display","none"), mkL=mk.append("line").attr("stroke",C.ink).attr("stroke-width",1.5), mkT=mk.append("text").attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink).style("font-variant-numeric","tabular-nums");
  V.halo(mkT,3);
  let lastMk=null;
  function mark(T){ if(T===lastMk)return; lastMk=T; if(T==null){ mk.style("display","none"); sc.selectAll("text:not(.mk)").style("opacity",1); return; }
    mk.style("display",null); const q=SP(T);
    if(vert){ mkL.attr("x1",sx0-5).attr("x2",sx0+13).attr("y1",q).attr("y2",q); mkT.attr("x",sx0-8).attr("y",q+4).attr("text-anchor","end").text(`${sgn(T)} °C`); }
    else { mkL.attr("x1",q).attr("x2",q).attr("y1",sy0-5).attr("y2",sy0+13); mkT.attr("x",clamp(q,30,w-30)).attr("y",sy0-8).attr("text-anchor","middle").text(`${sgn(T)} °C`); } }
  function drawNote(){ ng.selectAll("*").remove(); el._nrot=rot[1]; el._nm=Math.round(mt);
    const pole=proj([0,90]); if(!pole)return; const vis=rot[1]<0;
    if(!vis)return;
    const lines=el._nm?[["Dia polar",true],["al juliol, el sol no es pon a l'extrem nord"]]:[["Nit polar",true],["al gener, el sol no surt a l'extrem nord"]];
    if(mob)V.note(ng,{x:pole[0],y:pole[1],tx:pole[0]-14,ty:16,kind:"elbow",anchor:"end",valign:"top",size:12,lines:[[lines[0][0],true],[el._nm?"el sol no es pon al nord":"el sol no surt al nord"]]});
    else V.note(ng,{x:pole[0],y:pole[1],tx:cx-R-20,ty:pole[1]-10,kind:"elbow",anchor:"end",lines});
    if(!mob){ const ed=[cx+R*.98,cy+R*.15]; V.note(ng,{x:cx+R+2,y:cy+12,tx:cx+R+26,ty:cy+56,kind:"straight",anchor:"start",lines:[["El costat de dia",true],["el globus gira sota el sol"]]}); void ed; } }
  // arrossegar
  // arrossegar amb punter propi (no d3.drag): amb touch-action:pan-y, el dit en vertical continua fent scroll
  c.addEventListener("pointerdown",ev=>{ el._dragP=[ev.clientX,ev.clientY]; el._drag=false; });
  c.addEventListener("pointermove",ev=>{ const P0=el._dragP; if(!P0||(ev.pointerType==="mouse"&&!ev.buttons))return;
    const dx=ev.clientX-P0[0], dy=ev.clientY-P0[1]; if(!el._drag&&Math.hypot(dx,dy)<4)return;
    el._drag=true; hov=null; tp.hide(); el._dragP=[ev.clientX,ev.clientY]; rot[0]+=dx*.35; if(ev.pointerType==="mouse")rot[1]=clamp(rot[1]-dy*.35,-70,70); if(V.reduced||!spin27)frame(1,0); });
  if(!el._pu){ el._pu=1; const up=()=>{ el._dragP=null; el._drag=false; }; window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up); }
  const tp=tipOf(el);
  V.hover(c,(ev,[px,py])=>{ if(el._drag){ tp.hide(); return; } if(Math.hypot(px-cx,py-cy)>R){ hov=null; tp.hide(); if(!spin27)frame(1,0); return; }
    const ll=proj.invert([px,py]); const i=clamp(Math.round((90-ll[1])/STEP),0,NLAT-1), j=Math.round((((ll[0]%360)+360)%360)/STEP)%NLON;
    hov={lon:gLon(j),lat:gLat(i),k:i*NLON+j}; const T=TEMP[0][hov.k]+(TEMP[1][hov.k]-TEMP[0][hov.k])*mt, A=ANOM[0][hov.k]+(ANOM[1][hov.k]-ANOM[0][hov.k])*mt;
    const mn=MES27[mon27][0].toUpperCase()+MES27[mon27].slice(1);
    tp.show(`<b>${llS(hov.lon,hov.lat)}</b> · ${mn}: <b>${sgn(T)} °C</b> (${sgn(A)} °C vs latitud)`,px,py);
    if(!spin27||V.reduced)frame(1,0);
  },()=>{ hov=null; tp.hide(); if(!spin27||V.reduced)frame(1,0); });
  el._redraw=()=>frame(1,0);
  el._month=m=>{
    const target=fMon27(m), a=mt;
    if(V.reduced){ mt=target; el._mt=target; frame(1,0); return; }
    if(el._mtT)el._mtT.stop();
    const tm=el._mtT=d3.timer(t=>{ const e=EIO(clamp(t/450,0,1)); el._mt=a+(target-a)*e; if(!spin27)frame(1,0); if(t>=450){ tm.stop(); el._mt=target; } });
  };
  frame(0,0);
  V.onView(el,instant=>{ if(instant){ ent=1; frame(1,0); }
    else { ent=0; const t1=d3.timer(t=>{ ent=clamp(t/1400,0,1); rot[0]+=(1-ent)*1.6; if(!spin27)frame(1,0); if(ent>=1)t1.stop(); }); }
    el._loop=V.loop(el,(t,dt)=>frame(t,dt)); });
});
{ const rng=$('[data-rng="27"]'), out=$('[data-v="27"]');
  const upd27=m=>{
    mon27=m; const nm=MES27[m][0].toUpperCase()+MES27[m].slice(1), real=m===0||m===6;
    if(out)out.textContent=`${nm} · ${real?"dada real":"interpolat"}`;
    if(rng)rng.setAttribute("aria-valuetext",`${MES27[m]} (${real?"dada real":"interpolat"})`);
    const el=$('[data-p="27"]'); el&&el._month&&el._month(m);
  };
  if(rng)rng.addEventListener("input",()=>upd27(+rng.value));
}
{ const b=$('[data-play="27"]'); if(b){ if(V.reduced){ b.textContent="Gira"; }
  b.addEventListener("click",()=>{ spin27=!spin27; b.textContent=spin27?"Atura":"Gira"; b.setAttribute("aria-pressed",String(!spin27));
    if(V.reduced&&spin27){ const el=$('[data-p="27"]'); const go=d3.timer((t,dt)=>{ if(!spin27){ go.stop(); return; } el._rot&&(el._rot[0]+=.15); el._redraw&&el._redraw(); }); } }); } }

})();
