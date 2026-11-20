/* «Ciència entre enemics» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-pol      MAP-14 + MAP-03 + PART-01  L'Antàrtida: Any Geofísic, reclamacions, article IV, estacions (scrolly)
   V2 #f-estacions MAP-03 + lliscant          82 estacions de COMNAP (cercles de població, filtre, any)
   V3 #f-tractat  CASE-02 + TIME-13           58 països del Tractat: adhesió i estatus consultiu
   V4 #s-vostok   HOW-01 + TIME-01            Nucli de Vostok: temperatura i CO₂ de 420.000 anys (scrolly)
   V5 #f-cern     TIME-13                     Membres i associats del CERN 1954–2026
   V6 #f-eei      SCALE-03 + PART-01          298 visitants de l'Estació Espacial Internacional
   V7 #f-sesame   LINK-04                     SESAME: membres i observadors
   Colors: vermell = el que es comparteix o funciona tot l'any; blau = el que es reclama o és estacional; groc, superfícies. */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.CE_DATA, ANT=window.CE_ANT;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// en mode fosc, els cercles translúcids se sumen en clar (screen) en lloc d'enfosquir-se (multiply)
const BLEND=window.IBTheme&&IBTheme.dark?"normal":"multiply";
const MESOS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const fDate=iso=>{ const [y,m,d]=iso.split("-").map(Number); const mm=MESOS[m-1]; return `${d} ${/^[aeiou]/.test(mm)?"d'":"de "}${mm} de ${y}`; };
const yr=iso=>+iso.slice(0,4)+(+iso.slice(5,7)-1)/12+(+iso.slice(8,10)-1)/365;

function stage(el,h){ d3.select(el).selectAll(":scope>.stage").remove(); const st=document.createElement("div"); st.className="stage"; st.style.cssText=`position:relative;height:${h}px`; el.insertBefore(st,el.firstChild); return st; }
function overlay(el,w,h){ return d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`).style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS); }
function mkCanvas(el,w,h){ const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas"); c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0;pointer-events:none`; c.setAttribute("aria-hidden","true"); el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx}; }

/* ---------- mapa polar comú (MAP-14: azimutal centrat al pol Sud, àrees iguals) ---------- */
const RIM=d3.geoCircle().center([0,-90]).radius(30)();          // paral·lel 60° S
function polar(w,h,pad){
  return d3.geoAzimuthalEqualArea().rotate([0,90,0]).clipAngle(34).fitExtent([[pad,pad],[w-pad,h-pad]],RIM);
}
function ring(l0,l1){ // sector del pol al 60° S entre dos meridians (graus est; l1 > l0)
  const pts=[[l0,-89.999]]; for(let l=l0;l<=l1;l+=1)pts.push([l,-60]); pts.push([l1,-60],[l1,-89.999],[l0,-89.999]);
  let g={type:"Polygon",coordinates:[pts]}; if(d3.geoArea(g)>2*Math.PI)g={type:"Polygon",coordinates:[pts.slice().reverse()]}; return g; }
function baseMap(g,path,proj,o){
  o=o||{};
  const grat=d3.geoGraticule().extent([[-180,-90],[180,-55]]).step([30,10]);
  g.append("path").attr("d",path(grat())).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.5);
  g.append("path").attr("d",path(ANT)).attr("fill",C.land).attr("stroke","#C9C6BF").attr("stroke-width",.6);
  g.append("path").attr("d",path(RIM)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","3 3");
  if(o.labels!==false){
    const p=proj([45,-60]); V.t(g,p[0]+4,p[1]+14,"60° S",{size:V.FS.small,fill:C.muted,halo:2.5});
    [[0,"0°"],[90,"90° E"],[180,"180°"],[-90,"90° O"]].forEach(([l,t])=>{ const q=proj([l,-58.6]); if(!q)return; V.t(g,q[0],q[1]+4,t,{anchor:"middle",size:V.FS.small,fill:C.muted,halo:2.5}); });
  }
  const pole=proj([0,-90]); g.append("circle").attr("cx",pole[0]).attr("cy",pole[1]).attr("r",2).attr("fill",C.ink);
  if(o.pole!==false)V.t(g,pole[0]+6,pole[1]-5,"Pol Sud",{size:V.FS.small,fill:C.ink2,halo:2.5,italic:true});
}

/* =====================================================================
   V1 · MAP-14 + MAP-03 + PART-01 · UN CONTINENT SENSE AMO (scrolly)
   ===================================================================== */
(function pol(){
  const box=$("#pol-viz"), stepsEl=$("#s-pol .steps"); if(!box||!ANT)return;
  let cur=0;
  const CL=D.claims;  // [nom, lon0, lon1]
  const COLS={"Argentina":C.red,"Xile":C.red,"Regne Unit":C.red,"França":C.yellow};
  const LAB=[["Regne Unit",-50,-85.5],["Argentina",-36,-71],["Xile",-80,-73.5],["Noruega",12,-74],["Austràlia",92,-75],["França",139,-69.2],["Nova Zelanda",183,-80]];
  const lg=$("#pol-lg");
  function legend(k){ if(!lg)return; lg.innerHTML="";
    if(k===1)V.legendCat(lg,[{c:C.red,t:"Base al continent o al gel"},{c:C.blue,t:"Base en una illa"}]);
    else if(k===2||k===3)V.legendCat(lg,[{c:C.red,t:"Sectors que se superposen",a:.4},{c:C.blue,t:"Altres reclamacions",a:.3},{c:C.yellow,t:"França",a:.6}]);
    else if(k===4)V.legendCat(lg,[{c:C.red,t:"Estació de tot l'any"},{c:C.blue,t:"Estació d'estiu"}]); }
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.98,vh*.43):Math.min(w*.78,vh*.76));
    const st=stage(el,h);
    const s=overlay(st,w,h).attr("role","img").attr("aria-label","Mapa de l'Antàrtida vista des del pol Sud: el paral·lel 60° S, les 55 bases de l'Any Geofísic, les set reclamacions territorials congelades per l'article IV del Tractat i les 82 estacions actuals.");
    const gMap=s.append("g");
    const proj=polar(w,h,mob?14:22), path=d3.geoPath(proj);
    const G={base:gMap.append("g"),sec:gMap.append("g"),secL:gMap.append("g"),sta:gMap.append("g"),igy:s.append("g")};
    baseMap(G.base,path,proj);
    CL.forEach(([n,a,b])=>{ G.sec.append("path").datum({n}).attr("class","sec").attr("d",path(ring(a,b)))
      .attr("fill",COLS[n]||C.blue).attr("fill-opacity",n==="França"?.55:(COLS[n]?.2:.13)).attr("stroke",n==="Noruega"?C.ink2:C.paper).attr("stroke-width",n==="Noruega"?.8:1.1)
      .attr("stroke-dasharray",n==="Noruega"?"4 3":null).style("mix-blend-mode",BLEND); });
    LAB.forEach(([n,l,la])=>{ if(mob&&n==="França")return; const p=proj([l,la]); V.t(G.secL,p[0],p[1],n,{anchor:"middle",size:mob?11:12.5,weight:700,halo:3}); });
    { const p=proj([-120,-76]); V.t(G.secL,p[0],p[1],"Sense reclamar",{anchor:"middle",size:mob?11:12,italic:true,fill:C.ink2,halo:3}); }
    const frz=G.secL.append("g");
    { const p=proj([-150,-63.5]); V.t(frz,p[0],p[1],mob?"Article IV":"Article IV: congelades",{anchor:"middle",size:mob?12:13.5,weight:700,fill:C.ink,halo:3.4}); }
    // estacions actuals
    G.sta.selectAll("circle").data(D.st).join("circle").attr("cx",d=>proj([d.lon,d.lat])[0]).attr("cy",d=>proj([d.lon,d.lat])[1])
      .attr("r",mob?2.6:3.4).attr("fill",d=>d.s?C.red:C.blue).attr("fill-opacity",.75).attr("stroke",C.paper).attr("stroke-width",.6);
    // Any Geofísic: un punt per base, agrupat per país (no a la seva posició)
    const rowsH=mob?17:19, gap=mob?7:8, r0=mob?2.6:3;
    const bx=mob?Math.max(6,(w-260)/2):18, by=mob?Math.max(18,(h-D.igy.length*rowsH)/2):Math.max(30,(h-D.igy.length*rowsH)/2), lw=mob?118:132;
    V.t(G.igy,bx,by-12,"55 bases de l'Any Geofísic, per país",{size:12,weight:700,halo:3});
    D.igy.forEach(([n,a,b],i)=>{ const y=by+i*rowsH+8;
      V.t(G.igy,bx+lw-8,y+4,n,{anchor:"end",size:mob?11:12,fill:C.ink,halo:3});
      for(let k=0;k<a+b;k++)G.igy.append("circle").attr("cx",bx+lw+k*gap).attr("cy",y).attr("r",r0).attr("fill",k<a?C.red:C.blue).attr("fill-opacity",.8);
      V.t(G.igy,bx+lw+(a+b)*gap+4,y+4,a+b,{size:11,fill:C.ink2,halo:2.5}); });
    el.__set=(k,instant)=>{
      const T=instant||V.reduced?0:700, vis=(sel,on,o)=>sel.interrupt().transition().duration(T).style("opacity",on?(o||1):0);
      legend(k);
      const shift=k===1;
      gMap.interrupt().transition().duration(T).style("opacity",shift?(mob?.12:.35):1)
        .attr("transform",shift&&!mob?`translate(${w*.2},${h*.06}) scale(.88)`:null);
      vis(G.igy,k===1);
      vis(G.sec,k>=2,1); G.sec.selectAll("path.sec").interrupt().transition().duration(T)
        .attr("fill-opacity",d=>k>=3?.05:(d.n==="França"?.55:(COLS[d.n]?.2:.13)))
        .attr("stroke",d=>k>=3?C.ink2:(d.n==="Noruega"?C.ink2:C.paper)).attr("stroke-dasharray",d=>k>=3||d.n==="Noruega"?"4 3":null);
      vis(G.secL,k===2||k===3); frz.interrupt().transition().duration(T).style("opacity",k===3?1:0);
      G.sta.selectAll("circle").interrupt().transition().duration(T).delay((d,i)=>T&&k===4?i*8:0).attr("r",k===4?(mob?2.6:3.4):0);
    };
    el.__set(cur,true);
  });
  IB.scrolly(stepsEl,$("#s-pol .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V2 · MAP-03 · 82 ESTACIONS (cercles de població, filtre i any)
   ===================================================================== */
(function estacions(){
  const box=$("#est-viz"), rng=$("#est-rng"), play=$("#est-play"), yl=$("#est-y"); if(!box||!ANT)return;
  let mode="tot", Y=2024, playing=false, raf=0;
  const R=d3.scaleSqrt([0,1200],[0,22]);
  const lg=$("#est-lg");
  if(lg){ lg.innerHTML=""; V.legendSize(lg,{title:"Població màxima a l'estiu",values:[50,300,1200],r:R,f:f0}); V.legendCat(lg,[{c:C.red,t:"Tot l'any",a:.5},{c:C.blue,t:"Només estiu",a:.5}]); }
  const ok=d=>(mode==="tot"||(mode==="any"?d.s:!d.s))&&(d.y?d.y<=Y:Y>=2024);
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(mob?w*1.02:Math.min(w*.8,640));
    const st=stage(el,h);
    const s=overlay(st,w,h).attr("role","img").attr("aria-label","Mapa de les 82 estacions antàrtiques del catàleg de COMNAP, amb cercles proporcionals a la població màxima d'estiu: McMurdo (1.200 persones) és la més gran.");
    const proj=polar(w,h,mob?10:20), path=d3.geoPath(proj), g=s.append("g");
    baseMap(g,path,proj,{labels:!mob});
    { const p=proj([-62,-66]); V.t(g,p[0]+(mob?14:-14),p[1]+(mob?14:0),"Península Antàrtica",{anchor:mob?"start":"end",size:mob?11:12,italic:true,fill:C.ink2,halo:3}); }
    const data=D.st.slice().sort((a,b)=>(b.p||0)-(a.p||0)).map(d=>Object.assign({},d,{xy:proj([d.lon,d.lat])}));
    const k=mob?.72:1;
    const cs=g.append("g").selectAll("circle").data(data).join("circle").attr("cx",d=>d.xy[0]).attr("cy",d=>d.xy[1])
      .attr("r",0).attr("fill",d=>d.p?(d.s?C.red:C.blue):"none").attr("fill-opacity",.32)
      .attr("stroke",d=>d.s?C.red:C.blue).attr("stroke-width",d=>d.p?.6:1).attr("stroke-opacity",d=>d.p?.7:.9).style("mix-blend-mode",BLEND);
    const dots=g.append("g").selectAll("circle").data(data).join("circle").attr("cx",d=>d.xy[0]).attr("cy",d=>d.xy[1]).attr("r",1.2).attr("fill",C.ink).attr("opacity",0);
    const notes=g.append("g");
    const NOTE=[["McMurdo","McMurdo",1,"start"],["Amundsen-Scott South Pole","Amundsen-Scott (pol Sud)",1,"start"],["Vostok","Vostok",1,"start"],["Orcadas Antartic Base","Orcadas, 1904",-1,"end"],["Concordia","Concordia (França i Itàlia)",1,"start"]];
    NOTE.forEach(([n,t,dir,a])=>{ if(mob&&n==="Concordia")return; if(mob&&dir<0){ dir=1; a="start"; } const d=data.find(q=>q.n===n); if(!d)return; const rr=d.p?R(d.p)*k:3;
      notes.append("text").datum(d).attr("x",d.xy[0]+dir*(rr+5)).attr("y",d.xy[1]+4).attr("text-anchor",a).attr("font-size",mob?11:12).attr("font-weight",600).attr("fill",C.ink).text(t)
        .attr("stroke",C.paper).attr("stroke-width",3).attr("paint-order","stroke").attr("stroke-linejoin","round"); });
    const cnt=s.append("g");
    el.__upd=instant=>{
      const T=instant||V.reduced?0:500;
      cs.interrupt().transition().duration(T).attr("r",d=>ok(d)?(d.p?Math.max(2.4,R(d.p)*k):3.2):0);
      dots.attr("opacity",d=>ok(d)?.9:0); notes.selectAll("text").attr("opacity",d=>ok(d)?1:0);
      const n=data.filter(ok), nc=new Set(n.map(d=>d.o)).size;
      cnt.selectAll("*").remove();
      V.t(cnt,mob?6:12,mob?16:24,`${n.length} estacions · ${nc} països`,{size:mob?12.5:14,weight:700,halo:3});
      V.t(cnt,mob?6:12,mob?32:42,Y<2024?`fundades fins al ${Y}`:"catàleg del novembre del 2024",{size:mob?11.5:12.5,fill:C.ink2,halo:3});
    };
    V.onView(el,instant=>el.__upd(instant));
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent"), H=s.append("g").attr("pointer-events","none");
    V.hover(hit.node(),(ev,[px,py])=>{ const vis=data.filter(ok); const b=d3.least(vis,d=>(d.xy[0]-px)**2+(d.xy[1]-py)**2);
      H.selectAll("*").remove(); if(!b||(b.xy[0]-px)**2+(b.xy[1]-py)**2>26**2){ tp.hide(); return; }
      H.append("circle").attr("cx",b.xy[0]).attr("cy",b.xy[1]).attr("r",(b.p?R(b.p)*k:3)+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
      tp.show(`<b>${b.n}</b> (${b.o}${b.o2?" i "+b.o2:""}) · ${b.y?"fundada el "+b.y+" · ":""}${b.s?"tot l'any":"només estiu"}${b.p?" · fins a "+f0(b.p)+" persones":""}${b.cl?" · temporalment tancada":""}`);
    },()=>{ tp.hide(); H.selectAll("*").remove(); });
  });
  document.querySelectorAll("#est-seg button").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("#est-seg button").forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; if(box.__upd)box.__upd(false); }));
  function setY(y){ Y=Math.round(clamp(y,1904,2024)); rng.value=Y; yl.textContent=Y; rng.setAttribute("aria-valuetext",`fins al ${Y}`); if(box.__upd)box.__upd(true); }
  function stop(){ playing=false; cancelAnimationFrame(raf); play.textContent="Reprodueix →"; }
  rng.addEventListener("input",()=>{ stop(); setY(+rng.value); });
  play.addEventListener("click",()=>{ if(playing){ stop(); return; } if(Y>=2024)setY(1904); playing=true; play.textContent="Pausa"; let last=0, acc=Y;
    const tick=t=>{ if(!playing)return; const dt=last?Math.min(64,t-last):16; last=t; acc+=dt*120/16000; setY(acc); if(acc>=2024){ stop(); return; } raf=requestAnimationFrame(tick); }; raf=requestAnimationFrame(tick); });
})();

/* =====================================================================
   V3 · CASE-02 + TIME-13 · 58 PAÏSOS DEL TRACTAT
   ===================================================================== */
(function tractat(){
  const box=$("#tr-viz"); if(!box)return;
  let mode="fils";
  const P=D.parts.map(p=>Object.assign({},p,{a:yr(p.in),b:p.c?yr(p.c):null})).sort((x,y)=>x.a-y.a||(x.b||3000)-(y.b||3000)||x.n.localeCompare(y.n,"ca"));
  const lg=$("#tr-lg");
  if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.ink,t:"Adhesió",kind:"hollow"},{c:C.red,t:"Pot votar (part consultiva)"},{c:C.ghost,t:"Encara sense vot",kind:"line",dash:"2 3"}]); }
  const api=V.mount(box,(el,w)=>{
    const mob=w<640;
    d3.select(el).selectAll("svg").remove();
    if(mode==="corba"){
      const h=mob?330:380, m={l:mob?34:44,r:mob?16:120,t:20,b:28};
      const s=V.svg(el,w,h,"Països part del Tractat Antàrtic acumulats des del 1961: de 12 a 58; parts consultives: de 12 a 29."), g=s.append("g");
      const x=d3.scaleLinear([1959,2027],[m.l,w-m.r]), y=d3.scaleLinear([0,60],[h-m.b,m.t]);
      [0,10,20,30,40,50,60].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8); V.t(g,m.l-6,y(v)+4,v,{anchor:"end",size:V.FS.small,fill:C.muted}); });
      [1960,1980,2000,2020].forEach(v=>V.t(g,x(v),h-8,v,{anchor:"middle",size:V.FS.small,fill:C.muted}));
      const step=(arr)=>{ const ev=arr.slice().sort((a,b)=>a-b); const pts=[[1959.92,0]]; ev.forEach((t,i)=>{ pts.push([t,i],[t,i+1]); }); pts.push([2026.9,ev.length]); return pts; };
      const L=d3.line().x(d=>x(d[0])).y(d=>y(d[1]));
      const all=step(P.map(p=>p.a)), co=step(P.filter(p=>p.b).map(p=>p.b));
      g.append("path").attr("d",L(all)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.8);
      g.append("path").attr("d",L(co)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2.2);
      V.t(g,x(2026.9)+6,y(58)+4,mob?"58":"58 parts",{size:12.5,weight:700,halo:3});
      V.t(g,x(2026.9)+6,y(29)+4,mob?"29":"29 hi voten",{size:12.5,weight:700,fill:C.red,halo:3});
      if(!mob){ V.note(g,{x:x(1991.76),y:y(40),tx:x(1979),ty:y(52),anchor:"end",kind:"curve",lines:[["1991, Madrid",true],["Protocol de medi ambient"]],size:12});
        g.append("line").attr("x1",x(1991.76)).attr("x2",x(1991.76)).attr("y1",y(0)).attr("y2",y(44)).attr("stroke",C.ink).attr("stroke-dasharray","2 3").attr("stroke-width",.8); }
      return;
    }
    const rh=mob?13:12, lw=mob?104:150, m={l:lw,r:mob?10:60,t:30,b:26}, h=m.t+P.length*rh+m.b;
    const s=V.svg(el,w,h,"Un fil per a cadascun dels 58 països del Tractat Antàrtic, de la data d'adhesió a la data en què va obtenir l'estatus de part consultiva; 29 encara no en tenen."), g=s.append("g");
    const x=d3.scaleLinear([1959,2027],[m.l+6,w-m.r]);
    [1961,1980,2000,2020].forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t-6).attr("y2",h-m.b).attr("stroke",C.grid).attr("stroke-width",.6); V.t(g,x(v),m.t-10,v,{anchor:"middle",size:V.FS.small,fill:C.muted}); });
    g.append("line").attr("x1",x(1998.04)).attr("x2",x(1998.04)).attr("y1",m.t-6).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
    V.t(g,x(1998.04)+4,h-8,mob?"Protocol, 1998":"Protocol de Madrid en vigor, 1998",{size:V.FS.small,fill:C.ink2});
    const rows=g.selectAll("g.r").data(P).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${m.t+i*rh+rh/2})`);
    rows.append("text").attr("x",m.l-6).attr("y",4).attr("text-anchor","end").attr("font-size",11).attr("fill",d=>d.n==="Espanya"?C.red:(d.o?C.ink:C.ink2)).attr("font-weight",d=>d.o||d.n==="Espanya"?700:400).attr("font-family",V.SANS).text(d=>d.n);
    rows.append("line").attr("x1",d=>x(d.a)).attr("x2",d=>x(d.a)).attr("stroke",d=>d.b?C.red:C.ghost).attr("stroke-width",d=>d.b?1.6:1).attr("stroke-dasharray",d=>d.b?null:"2 3").attr("class","ln");
    rows.append("circle").attr("cx",d=>x(d.a)).attr("r",3.3).attr("fill",d=>d.o?C.red:C.paper).attr("stroke",d=>d.o?C.red:C.ink).attr("stroke-width",1);
    rows.filter(d=>d.b&&!d.o).append("circle").attr("class","cs").attr("cx",d=>x(d.a)).attr("r",0).attr("fill",C.red);
    const go=instant=>{ const T=instant?0:900;
      rows.select("line.ln").transition().duration(T).delay((d,i)=>instant?0:i*14).attr("x2",d=>x(d.b||2026.9));
      rows.select("circle.cs").transition().duration(T).delay((d,i)=>instant?0:i*14).attr("cx",d=>x(d.b)).attr("r",3.6); };
    V.onView(el,go);
    if(!mob){ const i=P.findIndex(p=>p.n==="Espanya"), d=P[i];
      V.note(g,{x:x(d.b)+5,y:m.t+i*rh+rh/2,tx:x(d.b)+60,ty:m.t+i*rh+rh/2+30,anchor:"start",lines:[["Espanya: 6 anys",true],["d'adhesió (1982) a vot (1988)"]],size:12}); }
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=clamp(Math.floor((py-m.t)/rh),0,P.length-1), d=P[i];
      V.focus(rows,o=>o===d);
      const wait=d.b&&!d.o?` · ${f0(Math.round(d.b-d.a))} anys d'espera`:"";
      tp.show(`<b>${d.n}</b> · ${d.o?"signatari original, en vigor el 23 de juny de 1961":"part des del "+fDate(d.in)} · ${d.c?(d.o?"vot des del primer dia":"vota des del "+fDate(d.c)+wait):"encara sense vot"}`);
    },()=>{ tp.hide(); V.focus(rows,null); });
  });
  document.querySelectorAll("#tr-seg button").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("#tr-seg button").forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k;
    const t=box.querySelector(":scope>.tip"); if(t)t.style.opacity=0; api.redraw(); }));
})();

/* =====================================================================
   V4 · HOW-01 + TIME-01 · 3.623 METRES DE GEL COMPARTIT (scrolly)
   ===================================================================== */
(function vostok(){
  const box=$("#vk-viz"), stepsEl=$("#s-vostok .steps"); if(!box)return;
  let cur=0;
  const DT=D.deut, CO=D.co2;     // [edat ka, ΔT, profunditat] · [edat ka, ppm]
  const DIV=V.div(9);
  const lg=$("#vk-lg");
  if(lg){ lg.innerHTML=""; V.legendRamp(lg,{scale:DIV,min:-9,max:9,ticks:[-8,0],f:v=>(v>0?"+":v<0?"−":"")+Math.abs(v)+" °C",title:"Temperatura respecte a l'actual",lo:"Més fred",hi:"Més càlid",w:150}); }
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(mob?Math.min(w*.95,vh*.42):Math.min(w*.72,vh*.72));
    const st=stage(el,h);
    const s=overlay(st,w,h).attr("role","img").attr("aria-label","A l'esquerra, la columna de gel de Vostok fins als 3.623 metres, acolorida per la temperatura; a la dreta, la temperatura i el CO₂ dels últims 420.000 anys, que pugen i baixen junts entre 182 i 299 ppm; el 2025, 427 ppm.");
    const cw=mob?36:56, cx0=mob?6:12, gap=mob?44:70;
    const m={t:mob?22:30,b:mob?24:30}, x0=cx0+cw+gap, x1=w-(mob?34:70);
    const yD=d3.scaleLinear([0,3750],[m.t,h-m.b]);
    // columna de gel: un rectangle per tram de 3 m, color de la temperatura
    const G={core:s.append("g"),coreL:s.append("g"),team:s.append("g"),tC:s.append("g"),cC:s.append("g"),now:s.append("g"),hv:s.append("g").attr("pointer-events","none")};
    const coreH=yD(3)-yD(0)+.6;
    DT.forEach(([a,t,d])=>G.core.append("rect").attr("x",cx0).attr("width",cw).attr("y",yD(d)).attr("height",coreH).attr("fill",DIV(t)));
    G.core.append("rect").attr("x",cx0).attr("width",cw).attr("y",yD(3310)).attr("height",yD(3623)-yD(3310)).attr("fill",C.ghost).attr("opacity",.5);
    G.core.append("rect").attr("x",cx0-4).attr("width",cw+8).attr("y",yD(3623+120)).attr("height",yD(3750)-yD(3743)+6).attr("fill",C.blue).attr("fill-opacity",.6);
    G.core.append("rect").attr("x",cx0).attr("width",cw).attr("y",m.t).attr("height",yD(3623)-m.t).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8);
    [0,1000,2000,3000,3623].forEach(d=>{ G.coreL.append("line").attr("x1",cx0+cw).attr("x2",cx0+cw+5).attr("y1",yD(d)).attr("y2",yD(d)).attr("stroke",C.ink).attr("stroke-width",.8);
      V.t(G.coreL,cx0+cw+7,yD(d)+4,(d===3623?f0(d)+" m":f0(d)),{size:V.FS.small,fill:d===3623?C.ink:C.muted,weight:d===3623?700:400,halo:2.5}); });
    V.t(G.coreL,cx0+cw+7,yD(3743)+4,mob?"llac":"llac Vostok",{size:V.FS.small,fill:C.blue,italic:true,halo:2.5});
    // equip
    const team=mob?[["Perforació","Sant Petersburg"],["Laboratoris","França, Rússia, EUA"]]:[["Perforació","Institut de Mines de Sant Petersburg"],["Logística","expedicions russes, institut polar francès, NSF"],["Laboratoris","Grenoble · Saclay · Sant Petersburg · Moscou · Princeton · Miami"]];
    team.forEach(([a,b],i)=>{ V.lines(G.team,x0,m.t+30+i*(mob?40:52),[[a,true],[b]],{size:mob?11.5:13,halo:3}); });
    // sèries
    const xA=d3.scaleLinear([-425,0],[x0,x1]);
    const hh=(h-m.t-m.b-26)/2, yT=d3.scaleLinear([-10,4],[m.t+hh,m.t]), yC=d3.scaleLinear([170,440],[h-m.b,h-m.b-hh]);
    const ax=s.insert("g",":first-child");
    [-400,-300,-200,-100,0].forEach(a=>{ ax.append("line").attr("x1",xA(a)).attr("x2",xA(a)).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.grid).attr("stroke-width",.5);
      if(mob&&(a===-300||a===-100))return;
      V.t(ax,xA(a),h-m.b+16,a?(mob&&a!==-400?`${f0(-a)}.000`:`${f0(-a)}.000 anys`):"avui",{anchor:a===-400?"start":a?"middle":"end",size:V.FS.small,fill:C.muted}); });
    [-8,-4,0].forEach(v=>{ G.tC.append("line").attr("x1",x0).attr("x2",x1).attr("y1",yT(v)).attr("y2",yT(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.5:.8);
      V.t(G.tC,x1+4,yT(v)+4,(v<0?"−":"")+Math.abs(v)+" °C",{size:V.FS.small,fill:C.muted}); });
    const lT=d3.line().x(d=>xA(-d[0])).y(d=>yT(d[1]));
    const areaW=d3.area().x(d=>xA(-d[0])).y0(yT(0)).y1(d=>yT(Math.max(0,d[1]))), areaC=d3.area().x(d=>xA(-d[0])).y0(yT(0)).y1(d=>yT(Math.min(0,d[1])));
    const DTv=DT.filter(d=>d[2]<=3310);
    G.tC.append("path").attr("d",areaC(DTv)).attr("fill",C.blue).attr("fill-opacity",.18);
    G.tC.append("path").attr("d",areaW(DTv)).attr("fill",C.red).attr("fill-opacity",.3);
    const pT=G.tC.append("path").attr("d",lT(DTv)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",mob?.8:1);
    V.t(G.tC,x0,m.t-8,"Temperatura",{size:12,weight:700,halo:3});
    [200,250,300,400].forEach(v=>{ G.cC.append("line").attr("x1",x0).attr("x2",x1).attr("y1",yC(v)).attr("y2",yC(v)).attr("stroke",C.grid).attr("stroke-width",.5);
      V.t(G.cC,x1+4,yC(v)+4,v+(v===400?" ppm":""),{size:V.FS.small,fill:C.muted}); });
    const lC=d3.line().x(d=>xA(-d[0])).y(d=>yC(d[1])).curve(d3.curveMonotoneX);
    const pC=G.cC.append("path").attr("d",lC(CO)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",mob?1.4:1.8);
    V.t(G.cC,x0,yC(440)-6,"CO₂ a les bombolles",{size:12,weight:700,halo:3});
    // avui
    const mx=d3.greatest(CO,d=>d[1]);
    G.now.append("line").attr("x1",xA(-mx[0])).attr("x2",xA(0)).attr("y1",yC(mx[1])).attr("y2",yC(mx[1])).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
    G.now.append("line").attr("x1",xA(0)).attr("x2",xA(0)).attr("y1",yC(mx[1])).attr("y2",yC(D.co2now[1])).attr("stroke",C.red).attr("stroke-width",2.2);
    G.now.append("circle").attr("cx",xA(0)).attr("cy",yC(D.co2now[1])).attr("r",4.5).attr("fill",C.red);
    V.t(G.now,xA(0)-8,yC(D.co2now[1])+4,`${f0(D.co2now[1])} ppm (2025)`,{anchor:"end",size:mob?12:13,weight:700,fill:C.red,halo:3.4});
    V.t(G.now,xA(-mx[0]),yC(mx[1])-8,`màxim de l'arxiu: ${f0(mx[1])} ppm`,{anchor:"middle",size:mob?11:12,fill:C.ink2,halo:3});
    const Lt=pT.node().getTotalLength(), Lc=pC.node().getTotalLength();
    el.__set=(k,instant)=>{
      const T=instant||V.reduced?0:900, vis=(sel,on)=>sel.interrupt().transition().duration(T).style("opacity",on?1:0);
      vis(G.team,k===0); vis(ax,k>=2); vis(G.tC,k>=2); vis(G.cC,k>=3); vis(G.now,k>=4);
      G.core.interrupt().transition().duration(T).style("opacity",k===0?.35:1); vis(G.coreL,k>=1);
      if(k===2&&T){ pT.attr("stroke-dasharray",`${Lt} ${Lt}`).attr("stroke-dashoffset",Lt).transition().duration(1800).ease(d3.easeCubicOut).attr("stroke-dashoffset",0); }
      if(k===3&&T){ pC.attr("stroke-dasharray",`${Lc} ${Lc}`).attr("stroke-dashoffset",Lc).transition().duration(1800).ease(d3.easeCubicOut).attr("stroke-dashoffset",0); }
    };
    el.__set(cur,true);
    const tp=V.tip(el), hit=s.append("rect").attr("x",x0).attr("width",x1-x0).attr("y",m.t).attr("height",h-m.t-m.b).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ if(cur<2)return; const a=-xA.invert(px+x0); if(a<0)return;
      const d=d3.least(DTv,q=>Math.abs(q[0]-a)), c=d3.least(CO,q=>Math.abs(q[0]-a));
      G.hv.selectAll("*").remove(); G.hv.append("line").attr("x1",xA(-d[0])).attr("x2",xA(-d[0])).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.8);
      G.hv.append("rect").attr("x",cx0-3).attr("width",cw+6).attr("y",yD(d[2])-1.5).attr("height",3).attr("fill",C.ink);
      tp.show(`<b>fa ${f0(Math.round(d[0]))}.000 anys</b> · ${d[1]>0?"+":d[1]<0?"−":""}${f1(Math.abs(d[1]))} °C · ${cur>=3?f0(c[1])+" ppm de CO₂ · ":""}gel a ${f0(d[2])} m`);
    },()=>{ tp.hide(); G.hv.selectAll("*").remove(); });
  });
  IB.scrolly(stepsEl,$("#s-vostok .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V5 · TIME-13 · DEL CERN DELS DOTZE AL CERN DELS 36
   ===================================================================== */
(function cern(){
  const box=$("#cern-viz"); if(!box)return;
  const rows=[], byN={};
  const add=(n,a,b,t)=>{ if(!byN[n]){ byN[n]={n,seg:[]}; rows.push(byN[n]); } byN[n].seg.push({a,b:b||2026.9,t,end:!!b}); };
  D.cern.m.forEach(([n,a,b])=>add(n,a,b,"m"));
  D.cern.a.forEach(([n,a,b])=>add(n,a,b,"a"));
  rows.forEach(r=>{ r.first=d3.min(r.seg,s=>s.a); r.now=r.seg.some(s=>!s.end); r.kind=r.seg.find(s=>!s.end)?.t||"x"; });
  rows.sort((a,b)=>a.first-b.first||a.n.localeCompare(b.n,"ca"));
  const EV=[[1967,"Acord amb l'URSS","1967 URSS"],[1989,"Neix el web","1989 web"],[1993,"Web al domini públic","1993 web lliure"],[2024,"Fi amb Rússia","2024 fi amb Rússia"]];
  const lg=$("#cern-lg");
  if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Estat membre",kind:"line",w:5},{c:C.redLight,t:"Estat associat",kind:"line",w:5},{c:C.ghost,t:"Ja no hi és",kind:"line",w:5}]); }
  V.mount(box,(el,w)=>{
    const mob=w<640, rh=mob?14:13, lw=mob?96:120, m={l:lw,r:mob?12:30,t:mob?74:54,b:26}, h=m.t+rows.length*rh+m.b;
    const s=V.svg(el,w,h,`Cronologia dels ${rows.length} països que han estat al CERN: 12 fundadors el 1954 i 25 membres i 11 associats el 2026.`), g=s.append("g");
    const x=d3.scaleLinear([1953,2027],[m.l+4,w-m.r]);
    [1954,1970,1990,2010,2026].forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t-4).attr("y2",h-m.b).attr("stroke",C.grid).attr("stroke-width",.5); V.t(g,x(v),h-8,v,{anchor:"middle",size:V.FS.small,fill:C.muted}); });
    EV.forEach(([y,t,ts],i)=>{ const ly=m.t-(mob?[58,42,26,10][i]:(i%2?12:30));
      g.append("line").attr("x1",x(y)).attr("x2",x(y)).attr("y1",ly+4).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
      V.t(g,x(y)+(x(y)>w*.6?-4:4),ly,mob?ts:t,{anchor:x(y)>w*.6?"end":"start",size:mob?11:11.5,weight:600,fill:C.ink,halo:3}); });
    const R=g.selectAll("g.r").data(rows).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${m.t+i*rh+rh/2})`);
    R.append("text").attr("x",m.l-6).attr("y",4).attr("text-anchor","end").attr("font-size",11).attr("font-family",V.SANS)
      .attr("fill",d=>d.now?C.ink:C.muted).attr("font-weight",d=>d.n==="Espanya"?700:400).text(d=>d.n);
    R.each(function(r){ d3.select(this).selectAll("rect").data(r.seg).join("rect").attr("x",d=>x(d.a)).attr("y",-3.5).attr("height",7).attr("rx",2)
      .attr("width",0).attr("fill",d=>d.end&&!(r.seg.some(q=>q.a===d.b))?C.ghost:(d.t==="m"?C.red:C.redLight)).attr("fill-opacity",.9); });
    V.onView(el,instant=>R.selectAll("rect").transition().duration(instant?0:900).delay((d,i,n)=>instant?0:rows.findIndex(r=>r.seg.includes(d))*18).attr("width",d=>Math.max(2,x(d.b)-x(d.a))));
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=clamp(Math.floor((py-m.t)/rh),0,rows.length-1), r=rows[i];
      V.focus(R,o=>o===r);
      tp.show(`<b>${r.n}</b> · `+r.seg.map(sg=>`${sg.t==="m"?"membre":"associat"} ${sg.a}${sg.end?"–"+sg.b:" fins avui"}`).join("; "));
    },()=>{ tp.hide(); V.focus(R,null); });
  });
})();

/* =====================================================================
   V6 · SCALE-03 + PART-01 · 298 PERSONES A L'ESTACIÓ ESPACIAL
   ===================================================================== */
(function eei(){
  const box=$("#eei-viz"); if(!box)return;
  const col=n=>n==="Estats Units"?C.blue:n==="Rússia"?C.red:C.ink2;
  const lg=$("#eei-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Estats Units"},{c:C.red,t:"Rússia"},{c:C.ink2,t:"24 països més",a:.7}]); }
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(mob?w*1.05:Math.min(520,w*.55));
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Constel·lació de 298 punts, un per persona que ha estat a l'Estació Espacial Internacional, agrupats per país: 174 dels Estats Units, 66 de Rússia, 11 del Japó, 10 del Canadà i 22 països més amb entre una i sis persones."), g=s.append("g");
    const root=d3.hierarchy({children:D.iss.map(([n,v])=>({n,v}))}).sum(d=>d.v).sort((a,b)=>b.value-a.value);
    d3.pack().size([mob?w:w*.62,mob?h-74:h-10]).padding(mob?3:5)(root);
    const ox=mob?0:w*.02, leaves=root.leaves();
    const dotR=mob?2:2.6;
    const gr=g.selectAll("g.c").data(leaves).join("g").attr("class","c").attr("transform",d=>`translate(${ox+d.x},${d.y+5})`);
    gr.append("circle").attr("r",d=>d.r).attr("fill",d=>col(d.data.n)).attr("fill-opacity",.08).attr("stroke",d=>col(d.data.n)).attr("stroke-opacity",.3).attr("stroke-width",.6);
    gr.each(function(d){ const n=d.data.v, sel=d3.select(this), golden=Math.PI*(3-Math.sqrt(5)), sc=n>1?(d.r-dotR-1)/Math.sqrt(n):0;
      for(let i=0;i<n;i++){ const rr=sc*Math.sqrt(i+.5), a=i*golden; sel.append("circle").attr("class","p").attr("cx",n>1?rr*Math.cos(a):0).attr("cy",n>1?rr*Math.sin(a):0).attr("r",0).attr("fill",col(d.data.n)).attr("fill-opacity",.85); } });
    gr.filter(d=>d.data.v>=60).append("text").attr("y",d=>-d.r+18).attr("text-anchor","middle").attr("font-size",12).attr("font-weight",700).attr("font-family",V.SANS).attr("fill",C.ink)
      .attr("stroke",C.paper).attr("stroke-width",3).attr("paint-order","stroke").text(d=>`${d.data.n} · ${d.data.v}`);
    V.onView(el,instant=>gr.selectAll("circle.p").transition().duration(instant?0:500).delay((d,i)=>instant?0:i*5).attr("r",dotR));
    if(!mob){ const tx=w*.68;
      V.lines(g,tx,h*.2,[["240 de 298",true],["són dels Estats Units o de Rússia,"],["els dos rivals de la cursa espacial."]],{size:13.5,halo:3});
      V.lines(g,tx,h*.2+80,[["2022: tripulacions integrades",true],["un nord-americà en una Soiuz i una russa"],["en una nau nord-americana, en plena guerra."]],{size:13.5,halo:3});
      V.lines(g,tx,h*.2+160,[["La resta, de 24 països",true],["Japó 11 · Canadà 10 · Itàlia 6 · França 5"],["Alemanya 4 · i 19 països més amb 1 o 2,"],["entre ells Espanya (Pedro Duque)."]],{size:13.5,halo:3}); }
    else V.lines(g,6,h-58,[["Japó 11 · Canadà 10 · Itàlia 6 · França 5",false],["Alemanya 4 · 19 països més amb 1 o 2"]],{size:11.5,halo:3,fill:C.ink2});
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=leaves.find(d=>(ox+d.x-px)**2+(d.y+5-py)**2<=(d.r+2)**2);
      if(!b){ tp.hide(); V.focus(gr,null); return; } V.focus(gr,o=>o===b); tp.show(`<b>${b.data.n}</b> · ${b.data.v} ${b.data.v>1?"persones":"persona"}`); },()=>{ tp.hide(); V.focus(gr,null); });
  });
})();

/* =====================================================================
   V7 · LINK-04 · UN ANELL DE 133 METRES A JORDÀNIA (SESAME)
   ===================================================================== */
(function sesame(){
  const box=$("#ses-viz"); if(!box)return;
  const MEM=D.ses, OBS=["Alemanya*","Brasil","Canadà","Xina","CERN","Unió Europea","França","Grècia","Itàlia","Japó","Kuwait","OCI-COMSTECH","Portugal","Rússia","Espanya","Suècia","Suïssa","Emirats Àrabs Units","Regne Unit","Estats Units"];
  const lg=$("#ses-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Membre",a:.6},{c:C.yellow,t:"Associat",a:.8},{c:C.ghost,t:"Observador"}]); }
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, h=Math.round(mob?w*1.08:Math.min(560,w*.6));
    const st=stage(el,h);
    const {ctx}=mkCanvas(st,w,h);
    const s=overlay(st,w,h).attr("role","img").attr("aria-label","Esquema de SESAME: un anell amb els vuit membres (Xipre, Egipte, l'Iran, Israel, Jordània, el Pakistan, Palestina i Turquia), cadascun unit al Consell central on seuen tots, i al voltant Alemanya, associada, i 19 observadors.");
    const cx=w/2, cy=h/2, R=Math.min(w,h)*(mob?.27:.26), RO=Math.min(w*.47,h*.46);
    const g=s.append("g");
    g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
    const mem=MEM.map((n,i)=>{ const a=-Math.PI/2+i*2*Math.PI/MEM.length; return {n,a,x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)}; });
    // cada membre, unit al Consell (cercle interior): no són relacions bilaterals
    const RC=R*.42;
    g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",RC).attr("fill",C.red).attr("fill-opacity",.07).attr("stroke",C.red).attr("stroke-opacity",.55).attr("stroke-width",1);
    const ch=g.append("g");
    mem.forEach(p=>{ const qx=cx+RC*Math.cos(p.a), qy=cy+RC*Math.sin(p.a);
      ch.append("path").datum([p.n]).attr("d",`M${p.x},${p.y}L${qx},${qy}`).attr("fill","none").attr("stroke",C.red).attr("stroke-opacity",.45).attr("stroke-width",1.4);
      ch.append("circle").attr("cx",qx).attr("cy",qy).attr("r",2).attr("fill",C.red); });
    const nd=g.selectAll("g.m").data(mem).join("g").attr("class","m").attr("transform",d=>`translate(${d.x},${d.y})`);
    nd.append("circle").attr("r",mob?11:15).attr("fill",C.red).attr("fill-opacity",.45).style("mix-blend-mode",BLEND);
    nd.append("circle").attr("r",2.2).attr("fill",C.ink);
    nd.each(function(d){ const out=(mob?20:26), ax=Math.cos(d.a), ay=Math.sin(d.a); V.t(d3.select(this),ax*out,ay*out+4,d.n,{anchor:Math.abs(ax)<.3?"middle":(ax>0?"start":"end"),size:mob?12:13.5,weight:700,halo:3}); });
    const obs=OBS.map((n,i)=>{ const a=-Math.PI/2+(i+.5)*2*Math.PI/OBS.length; return {n,a,x:cx+RO*Math.cos(a),y:cy+RO*Math.sin(a)*(mob?1:.92)}; });
    const og=g.selectAll("g.o").data(obs).join("g").attr("class","o").attr("transform",d=>`translate(${d.x},${d.y})`);
    og.append("circle").attr("r",d=>d.n.endsWith("*")?5:3).attr("fill",d=>d.n.endsWith("*")?C.yellow:C.ghost);
    if(!mob)og.each(function(d){ const ax=Math.cos(d.a); V.t(d3.select(this),(ax>=0?8:-8),4,d.n.replace("*"," (associat)"),{anchor:ax>=0?"start":"end",size:11,fill:C.ink2,halo:2.5}); });
    V.t(g,cx,cy-10,"Consell",{anchor:"middle",serif:true,size:mob?16:20,weight:600,halo:3});
    V.t(g,cx,cy+8,"de SESAME",{anchor:"middle",size:mob?11:12.5,fill:C.ink2,halo:3});
    V.t(g,cx,cy+R+(mob?44:50),"Allan, Jordània · 2017 · anell de 133 m",{anchor:"middle",size:mob?11:12,fill:C.muted,italic:true,halo:3});
    // un electró que gira a poc a poc (una volta cada ~24 s)
    el.__loop=V.loop(el,t=>{ ctx.clearRect(0,0,w,h); const a=-Math.PI/2+t/24000*2*Math.PI;
      for(let k=0;k<26;k++){ const b=a-k*.025; ctx.fillStyle=V.alpha(C.red,.6*(1-k/26)); ctx.beginPath(); ctx.arc(cx+R*Math.cos(b),cy+R*Math.sin(b),2.6-k*.06,0,6.2832); ctx.fill(); } });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    const all=mem.map(d=>Object.assign({t:"m"},d)).concat(obs.map(d=>Object.assign({t:"o"},d)));
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(all,d=>(d.x-px)**2+(d.y-py)**2); if((b.x-px)**2+(b.y-py)**2>30**2){ tp.hide(); ch.selectAll("path").attr("stroke-opacity",.45); return; }
      if(b.t==="m"){ ch.selectAll("path").attr("stroke-opacity",d=>d.includes(b.n)?.95:.15); tp.show(`<b>${b.n}</b> · membre de SESAME, representat al Consell`); }
      else { ch.selectAll("path").attr("stroke-opacity",.45); tp.show(`<b>${b.n.replace("*","")}</b> · ${b.n.endsWith("*")?"membre associat":"observador"}`); }
    },()=>{ tp.hide(); ch.selectAll("path").attr("stroke-opacity",.45); });
  });
})();

})();
