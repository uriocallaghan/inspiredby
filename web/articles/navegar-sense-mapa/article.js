/* «Navegar sense mapa» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-triangle  MAP-03 + MAP-12   Poblament del triangle polinesi (scrolly)
   V2 #f-viatge    MAP-11            Ruta de Hōkūleʻa 1976
   V3 #f-pantalla  MAP-03            Arribada ampliada: la muralla d'illes
   V4 #f-bruixola  LINK-04 + SCALE-01  Brúixola estel·lar amb sortides reals d'estrelles
   V5 #s-mar       HOW-04 + HOW-01   Onades de fons, la canoa i una illa (simulació, scrolly)
   V6 #f-etak      HOW-01            Etak: el vaixell es mou o les illes es mouen
   V7 #f-tupaia    CASE-02           Rumbs del mapa de Tupaia
   V8 #f-cronologia TIME-13          Cronologia
   Mapes d'oceà sense relleu (vegeu el pla visual). Colors: blau = mar, onades, el que ja hi era;
   vermell = el viatge i la canoa; groc = estrelles i sol (només superfícies i punts). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.NAV;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// en mode fosc, els cercles translúcids se sumen en clar (screen) en lloc d'enfosquir-se (multiply)
const BLEND=window.IBTheme&&IBTheme.dark?"screen":"multiply";
const NM=1.852; // quilòmetres per milla nàutica
const S_=D.settle.reduce((o,d)=>(o[d.k]=d,o),{});

/* ---------- ajudants ---------- */
function stage(el,h){ d3.select(el).selectAll(":scope>.stage").remove(); const st=document.createElement("div"); st.className="stage"; st.style.cssText=`position:relative;height:${h}px`; el.insertBefore(st,el.firstChild); return st; }
function mkCanvas(el,w,h,label){
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.className="ibv"; c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0`;
  if(label){ c.setAttribute("role","img"); c.setAttribute("aria-label",label); } else c.setAttribute("aria-hidden","true");
  el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx};
}
function overlay(el,w,h,label){
  const s=d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
    .style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS);
  if(label)s.attr("role","img").attr("aria-label",label); else s.attr("aria-hidden","true");
  return s;
}
let landP=null;
function land50(){ // Natural Earth 1:50 m via world-atlas 2.0.2 (es carrega només quan cal)
  if(!landP)landP=fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json").then(r=>r.json()).then(tp=>topojson.feature(tp,tp.objects.land));
  return landP;
}
function drawLand(ctx,proj,land){
  const p=d3.geoPath(proj,ctx);
  ctx.beginPath(); p(land); ctx.fillStyle=C.land; ctx.fill();
}
function graticule(ctx,proj,step){
  const p=d3.geoPath(proj,ctx);
  ctx.beginPath(); p(d3.geoGraticule().step([step,step])()); ctx.strokeStyle=V.alpha(C.ink,.06); ctx.lineWidth=.6; ctx.stroke();
}
// radi en píxels d'una distància en km al voltant d'un punt
function kmPx(proj,ll,km){ const a=proj(ll), b=proj([ll[0],ll[1]+km/111.2]); return Math.abs(a[1]-b[1]); }
const pacProj=(w,h,pts,pad)=>d3.geoNaturalEarth1().rotate([165,0]).fitExtent([[pad,pad],[w-pad,h-pad]],{type:"MultiPoint",coordinates:pts});

/* =====================================================================
   V1 · MAP-03 + MAP-12 · COM ES VA POBLAR EL TRIANGLE (scrolly)
   ===================================================================== */
(function triangle(){
  const box=$("#tri-viz"), stepsEl=$("#s-triangle .steps"); if(!box)return;
  let cur=0;
  const PH={west:C.blue, soc:C.yellow, east:C.red};
  const phase=k=>({tonga:"west",samoa:"west",rarotonga:"west",societat:"soc",tuamotu:"soc"})[k]||"east";
  const lg=$("#tri-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:PH.west,t:"Polinèsia occidental",a:.5},{c:PH.soc,t:"Primera fase oriental",a:.6},{c:PH.east,t:"Segona fase (1190–1290)",a:.5},{c:C.ink2,t:"Sense data pròpia (ordre genòmic)",kind:"hollow"}]); }
  const OAHU=[-158.037,21.483], NZ=[175.958,-38.004], RN=[-109.35,-27.126];
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.95,vh*.42):Math.min(w*.72,vh*.74));
    const st=stage(el,h);
    const proj=pacProj(w,h,[[150,28],[-104,28],[150,-48],[-104,-48]],mob?4:10);
    const {ctx}=mkCanvas(st,w,h,"Mapa del Pacífic amb el triangle polinesi i les dates de primer poblament de cada arxipèlag: Tonga cap al 888 aC; illes de la Societat cap al 1025–1120; Hawaiʻi, Marqueses, Rapa Nui i Aotearoa entre el 1190 i el 1290.");
    graticule(ctx,proj,15);
    land50().then(L=>{ drawLand(ctx,proj,L); }).catch(()=>{});
    const s=overlay(st,w,h), g=s.append("g");
    // context
    [["Oceà Pacífic",[-140,8],13],["Austràlia",[140,-27],12],["Amèrica",[-106,20],12]].forEach(([t,ll,sz])=>{ const p=proj(ll); if(p[0]<10||p[0]>w-10)return; V.t(g,p[0],p[1],t,{italic:true,fill:C.muted,size:mob?11:sz,anchor:"middle",halo:2.5}); });
    const L={tri:g.append("g"), path:g.append("g"), am:g.append("g"), pts:g.append("g"), lab:g.append("g")};
    // triangle
    const tri=[OAHU,NZ,RN];
    L.tri.append("path").attr("d",d3.line()(tri.concat([OAHU]).map(p=>proj(p)))).attr("fill",V.alpha(C.blue,.05)).attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","4 3");
    const dist=(a,b)=>d3.geoDistance(a,b)*6371.0088;
    [[OAHU,NZ],[NZ,RN],[RN,OAHU]].forEach(([a,b])=>{ const pa=proj(a), pb=proj(b), m=[(pa[0]+pb[0])/2,(pa[1]+pb[1])/2];
      V.t(L.tri,m[0],m[1],`${f0(Math.round(dist(a,b)/50)*50)} km`,{anchor:"middle",size:mob?11:12.5,weight:700,halo:3.5}); });
    // camí genòmic: arcs
    const arc=(a,b)=>{ const p=proj(a), q=proj(b), mx=(p[0]+q[0])/2, my=(p[1]+q[1])/2, dx=q[0]-p[0], dy=q[1]-p[1], k=.22; return `M${p[0]},${p[1]}Q${mx-dy*k},${my+dx*k} ${q[0]},${q[1]}`; };
    D.path.forEach(([a,b])=>L.path.append("path").attr("d",arc(S_[a].ll,S_[b].ll)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.6).attr("stroke-opacity",.85).attr("class","pa"));
    // contacte amb Amèrica
    { const a=proj([-128,-18]), b=proj([-104,-8]);
      L.am.append("path").attr("d",`M${a[0]},${a[1]}Q${(a[0]+b[0])/2},${a[1]-30} ${b[0]},${b[1]}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-dasharray","3 3");
      L.am.append("path").attr("d",`M${b[0]-7},${b[1]-4}L${b[0]},${b[1]}L${b[0]-6},${b[1]+5}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.1);
      V.lines(L.am,b[0]-(mob?4:6),b[1]+(mob?18:22),mob?[["Contacte amb Amèrica",true],["c. 1200–1430"]]:[["Contacte amb Amèrica",true],["c. 1200 (2020) o 1250–1430 (2024)"],["poble emparentat amb l'actual Colòmbia"]],{size:mob?11:12,halo:3,anchor:"end"}); }
    // arxipèlags
    const R=mob?9:15;
    const pts=D.settle.map(d=>({d,p:proj(d.ll),ph:phase(d.k)}));
    const dots=L.pts.selectAll("g").data(pts).join("g").attr("transform",o=>`translate(${o.p[0]},${o.p[1]})`);
    dots.append("circle").attr("class","halo").attr("r",R).attr("fill",o=>o.d.src==="gen"?"none":PH[o.ph]).attr("fill-opacity",o=>o.ph==="soc"?.55:.4).attr("stroke",o=>o.d.src==="gen"?PH[o.ph]:"none").attr("stroke-width",1.4).attr("stroke-dasharray",o=>o.d.src==="gen"?"3 2":null).style("mix-blend-mode",BLEND);
    dots.append("circle").attr("r",2.4).attr("fill",C.ink);
    const LAB={tonga:["end",-1],samoa:["end",-1],rarotonga:["end",1],societat:["end",-1],tuamotu:["start",1],mangareva:["start",1],raivavae:["end",1],marqueses:["start",-1],hawaii:["start",-1],rapanui:["end",1],aotearoa:["start",1]};
    const labs=L.lab.selectAll("g").data(pts).join("g").attr("transform",o=>`translate(${o.p[0]},${o.p[1]})`);
    labs.each(function(o){ const gg=d3.select(this), [an,vy]=LAB[o.d.k], dx=an==="start"?R*.75+4:-R*.75-4;
      if(mob&&["rarotonga","mangareva","raivavae","tuamotu"].includes(o.d.k)){ return; }
      let A2=an, X=dx, VY=vy, nm=o.d.n;
      if(mob&&o.d.k==="societat"){ A2="start"; X=R*.75+3; VY=1; nm="Societat"; }
      if(mob&&o.d.k==="samoa"){ A2="end"; VY=-1; }
      V.t(gg,X,VY<0?-4:12,nm,{anchor:A2,size:mob?11:12.5,weight:700,halo:3});
      if(!(mob&&o.d.k==="samoa"))V.t(gg,X,VY<0?10:26,o.d.d,{anchor:A2,size:mob?10.5:11.5,fill:C.ink2,halo:3}); });
    const SHOW=[ // arxipèlags visibles a cada pas
      ()=>false, k=>["tonga","samoa"].includes(k), k=>["tonga","samoa","rarotonga","societat"].includes(k), k=>true, k=>true, k=>true];
    el.__set=(k,instant)=>{
      const T=instant||V.reduced?0:650, on=SHOW[k]||SHOW[5];
      L.tri.interrupt().transition().duration(T).style("opacity",k===0?1:.35);
      dots.interrupt().transition().duration(T).style("opacity",o=>on(o.d.k)?1:.12);
      dots.select(".halo").interrupt().transition().duration(T).attr("r",o=>on(o.d.k)?R:R*.4);
      labs.interrupt().transition().duration(T).style("opacity",o=>on(o.d.k)?1:0);
      L.path.interrupt().transition().duration(T).style("opacity",k===4?1:0);
      if(k===4&&T){ L.path.selectAll("path").each(function(_,i){ const n=this.getTotalLength(); d3.select(this).attr("stroke-dasharray",`${n} ${n}`).attr("stroke-dashoffset",n).transition().delay(i*260).duration(900).attr("stroke-dashoffset",0); }); }
      L.am.interrupt().transition().duration(T).style("opacity",k===5?1:0);
    };
    el.__set(cur,true);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(pts,o=>(o.p[0]-px)**2+(o.p[1]-py)**2);
      if((b.p[0]-px)**2+(b.p[1]-py)**2>(R*2.2)**2){ tp.hide(); return; }
      tp.show(`<b>${b.d.n}</b> · ${b.d.d}${b.d.k==="tonga"?" (2838 ± 8 anys abans del 1950)":""} · ${b.d.t}`); },()=>tp.hide());
  });
  IB.scrolly(stepsEl,$("#s-triangle .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V2 · MAP-11 · DE MAUI A TAHITÍ (ruta de 1976, traça digitalitzada)
   ===================================================================== */
(function viatge(){
  const box=$("#viatge-viz"), play=$("#viatge-play"); if(!box)return;
  const lg=$("#viatge-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Ruta d'anada, sense instruments",kind:"line",w:2.2},{c:C.ink,t:"Illes i atols",a:.8}]); }
  const R=D.route, iMat=d3.leastIndex(R,p=>(p[0]+148.68)**2+(p[1]+14.884)**2), MS=[{i:0,t:"1 de maig",s:"Sortida de Honolua, Maui"},{i:iMat,t:"1 de juny",s:"Albiren Mataiva gràcies als xatracs"},{i:R.length-1,t:"4 de juny",s:"Arribada a Papeʻete, Tahití"}];
  let api=null;
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(560,w*1.45):Math.min(720,vh*.84));
    const mapW=mob?w:Math.min(w*.52,h*.62);
    const st=stage(el,h);
    const proj=d3.geoNaturalEarth1().rotate([150,0]).fitExtent([[mob?6:10,10],[mapW-(mob?6:10),h-10]],{type:"MultiPoint",coordinates:[[-161,23.5],[-139,23.5],[-161,-19.5],[-139,-19.5]]});
    const {ctx}=mkCanvas(st,w,h,"Mapa del Pacífic central amb la ruta de Hōkūleʻa de 1976: surt de Maui l'1 de maig, fa via cap al sud-est fins a creuar l'equador cap als 145° O, baixa cap a Mataiva, a les Tuamotu, l'1 de juny, i arriba a Tahití el 4 de juny.");
    ctx.beginPath(); ctx.rect(0,0,mapW,h); ctx.clip();
    graticule(ctx,proj,10);
    land50().then(L=>{ drawLand(ctx,proj,L); dotsIsl(); }).catch(()=>dotsIsl());
    function dotsIsl(){ ctx.fillStyle=V.alpha(C.ink,.7); D.illes.forEach(d=>{ const p=proj([d[1],d[2]]); ctx.beginPath(); ctx.arc(p[0],p[1],1.3,0,6.283); ctx.fill(); }); }
    const s=overlay(st,w,h), g=s.append("g");
    // equador i tròpics
    const eq=d3.geoPath(proj)({type:"LineString",coordinates:d3.range(-162,-137.9,1).map(x=>[x,0])});
    g.append("path").attr("d",eq).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
    { const p=proj([-161.5,0]); V.t(g,p[0]+2,p[1]-5,"Equador",{size:11.5,italic:true,fill:C.ink2,halo:2.5}); }
    [["Hawaiʻi",[-155.5,19.6],"start",10,22],["Tuamotu",[-143.5,-16.2],"start",6,0],["Illes de la Societat",[-151.5,-17.2],"end",-8,12],["Marqueses",[-139.8,-9.3],"end",-8,-4]].forEach(([t,ll,a,dx,dy])=>{ const p=proj(ll); V.t(g,p[0]+dx,p[1]+dy,t,{anchor:a,italic:true,size:mob?11:12,fill:C.ink2,halo:3}); });
    // alisis (esquema): direcció del NE al nord de l'equador i del SE al sud
    [[-159.5,13,1],[-159.5,-9,-1]].forEach(([lo,la,sg])=>{ const p=proj([lo,la]); const dx=-18, dy=sg*12;
      g.append("path").attr("d",`M${p[0]+18},${p[1]-dy}L${p[0]+18+dx},${p[1]}`).attr("stroke",C.blue).attr("stroke-width",1.4).attr("fill","none");
      g.append("path").attr("d",`M${p[0]+18+dx+6},${p[1]-sg*1}L${p[0]+18+dx},${p[1]}L${p[0]+18+dx+3},${p[1]-sg*7}`).attr("stroke",C.blue).attr("stroke-width",1.4).attr("fill","none");
      V.t(g,p[0]+24,p[1]-dy+4,sg>0?"Alisis del NE":"Alisis del SE",{size:11.5,fill:C.ink2,halo:2.5}); });
    const line=d3.line().curve(d3.curveCatmullRom.alpha(.5));
    const RP=R.map(p=>proj(p));
    const route=g.append("path").attr("d",line(RP)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2.2).attr("stroke-linecap","round");
    const n=route.node().getTotalLength();
    const canoe=g.append("circle").attr("r",4.5).attr("fill",C.red).attr("stroke",C.paper).attr("stroke-width",1.5);
    const mg=g.append("g");
    // fites
    MS.forEach((m,j)=>{ const p=RP[m.i], q=mg.append("g").attr("class","ms").datum(j);
      q.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",3.4).attr("fill",C.ink);
      if(mob){ V.lines(q,p[0]+(j===0?10:8),p[1]+(j===0?4:j===1?-8:14),[[m.t,true],[m.s]],{size:11,halo:3}); }
    });
    // columna de la dreta (escriptori): els tres dies coneguts
    const side=g.append("g");
    if(!mob){ const x0=mapW+34, ys=[h*.12,h*.70,h*.84];
      V.t(side,x0,h*.12-28,"Les tres dates conegudes",{size:12,fill:C.muted});
      MS.forEach((m,j)=>{ const q=side.append("g").attr("class","ms2").datum(j), p=RP[m.i];
        q.append("path").attr("d",`M${p[0]+6},${p[1]}C${(p[0]+x0)/2},${p[1]} ${(p[0]+x0)/2},${ys[j]-4} ${x0-6},${ys[j]-4}`).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.8);
        V.t(q,x0,ys[j],m.t+" de 1976",{size:15,weight:700,serif:true});
        V.t(q,x0,ys[j]+18,m.s,{size:12.5,fill:C.ink2});
        V.t(q,x0,ys[j]+34,j===0?"Dia 0":j===1?"Dia 31":"Dia 34",{size:11.5,fill:C.muted}); });
      const yE=proj([-150,0])[1];
      V.lines(side,x0,yE-6,[["Creuen l'equador",true],["Abans, una setmana encalmats."],["Després, vents de cara que els"],["empenyen cap a l'oest de Tahití."]],{size:12.5,halo:3});
      side.append("path").attr("d",`M${x0-6},${yE-10}L${proj([-145.3,0])[0]+8},${yE-2}`).attr("stroke",C.hair).attr("fill","none");
    }
    function setT(t){ const L=n*t; route.attr("stroke-dasharray",`${L} ${n}`); const pt=route.node().getPointAtLength(L); canoe.attr("cx",pt.x).attr("cy",pt.y);
      const k=t*(R.length-1); mg.selectAll(".ms").style("opacity",j=>k>=MS[j].i-.01?1:.25); side.selectAll(".ms2").style("opacity",j=>k>=MS[j].i-.01?1:.3); }
    el.__set=setT; setT(el.__t==null?1:el.__t);
  });
  let raf=0, playing=false;
  function stop(){ playing=false; cancelAnimationFrame(raf); play.textContent="Reprodueix →"; }
  function start(){ playing=true; play.textContent="Pausa"; let t=0,last=0; box.__t=0;
    const tick=now=>{ if(!playing)return; const dt=last?Math.min(64,now-last):16; last=now; t=Math.min(1,t+dt/16000); box.__t=t; if(box.__set)box.__set(t); if(t>=1){ stop(); return; } raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); }
  play.addEventListener("click",()=>playing?stop():start());
  V.onView(box,instant=>{ if(instant){ box.__t=1; if(box.__set)box.__set(1); return; } start(); },{threshold:.4});
})();

/* =====================================================================
   V3 · MAP-03 · UNA MURALLA D'ILLES (arribada ampliada)
   ===================================================================== */
(function pantalla(){
  const box=$("#pantalla-viz"); if(!box)return;
  const RAD=[0,8*NM,40*NM,120*NM], NAME=["","Atol visible","Noio","Manu-o-Kū"];
  let mode=3;
  const lg=$("#pantalla-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Fins on avisa de terra",a:.35},{c:C.ink,t:"Atol o illa",a:.9},{c:C.red,t:"Hōkūleʻa, 1976",kind:"line",w:2}]); }
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*1.05,520):Math.min(w*.62,vh*.78));
    const st=stage(el,h);
    const proj=d3.geoNaturalEarth1().rotate([145,0]).fitExtent([[mob?4:10,10],[w-(mob?4:10),h-10]],{type:"MultiPoint",coordinates:[[-155,-7],[-133,-7],[-155,-28],[-133,-28]]});
    const {ctx}=mkCanvas(st,w,h,"Mapa dels atols i illes de les Tuamotu, la Societat, les Australs i les Marqueses. Quan s'hi dibuixa l'abast dels ocells que avisen de terra, les illes es fusionen en una gran muralla d'uns 1.000 quilòmetres.");
    graticule(ctx,proj,5);
    const isl=D.illes.map(d=>({n:d[0],ll:[d[1],d[2]],k:d[3],p:proj([d[1],d[2]])}));
    function draw(){
      ctx.clearRect(0,0,w,h); graticule(ctx,proj,5);
      if(mode>0){ // unió de tots els cercles: un sol camí i un sol farciment (sense acumular opacitat)
        ctx.beginPath(); isl.forEach(o=>{ const r=kmPx(proj,o.ll,RAD[mode]); ctx.moveTo(o.p[0]+r,o.p[1]); ctx.arc(o.p[0],o.p[1],r,0,6.283); });
        ctx.fillStyle=V.alpha(C.blue,mode===3?.2:mode===2?.26:.4); ctx.fill("nonzero");
      }
      if(el.__land){ ctx.save(); const p=d3.geoPath(proj,ctx); ctx.beginPath(); p(el.__land); ctx.fillStyle=C.land; ctx.fill(); ctx.restore(); }
      isl.forEach(o=>{ ctx.beginPath(); ctx.arc(o.p[0],o.p[1],o.k==="atoll"?1.8:2.2,0,6.283); ctx.fillStyle=C.ink; ctx.fill(); });
    }
    land50().then(L=>{ el.__land=L; draw(); }).catch(()=>{});
    const s=overlay(st,w,h), g=s.append("g");
    // ruta de 1976 (tram final)
    const tail=D.route.filter(p=>p[1]<-7.5);
    g.append("path").attr("d",d3.line().curve(d3.curveCatmullRom)(tail.map(p=>proj(p)))).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2).attr("stroke-linecap","round");
    { const p=proj(tail[0]); V.t(g,p[0]+7,p[1]+4,"Hōkūleʻa",{size:12,weight:700,fill:C.red,halo:3}); }
    [["Tuamotu",[-141.5,-15.2],"start"],["Societat",[-151.2,-15.6],"end"],["Marqueses",[-138.6,-8.2],"start"],["Australs",[-149.8,-24.6],"end"],["Gambier",[-134.6,-21.8],"end"]].forEach(([t,ll,a])=>{ const p=proj(ll); V.t(g,p[0],p[1],t,{anchor:a,italic:true,size:mob?11.5:13,fill:C.ink2,halo:3}); });
    ["Mataiva","Tahiti","Rangiroa","Fakarava"].forEach(nm=>{ const o=isl.find(q=>q.n===nm); if(!o||(mob&&nm!=="Mataiva"&&nm!=="Tahiti"))return; V.t(g,o.p[0]+5,o.p[1]-5,nm==="Tahiti"?"Tahití":nm,{size:11.5,weight:600,halo:3}); });
    // escala
    { const a=proj([-154,-27]), b=proj([-154+200/(111.32*Math.cos(27*Math.PI/180)),-27]); const y=h-14, x=12;
      g.append("path").attr("d",`M${x},${y-4}V${y}H${x+b[0]-a[0]}V${y-4}`).attr("fill","none").attr("stroke",C.ink2);
      V.t(g,x+b[0]-a[0]+6,y+1,"200 km",{size:11.5,fill:C.ink2,halo:true}); }
    const info=g.append("g");
    el.__mode=m=>{ mode=m; draw(); info.selectAll("*").remove();
      if(m>0){ const x=w-(mob?8:16), y=mob?h-34:28; V.lines(info,x,y,[[NAME[m],true],[`radi d'unes ${m===1?"8":m===2?"40":"120"} milles (${f0(RAD[m])} km)`]],{size:mob?11.5:12.5,anchor:"end",halo:3}); } };
    el.__mode(mode);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(isl,o=>(o.p[0]-px)**2+(o.p[1]-py)**2); if(!b||(b.p[0]-px)**2+(b.p[1]-py)**2>400){ tp.hide(); return; }
      tp.show(`<b>${b.n}</b> · ${b.k==="atoll"?"atol":"illa"} · ${f1(-b.ll[1])}° S, ${f1(-b.ll[0])}° O`); },()=>tp.hide());
  });
  document.querySelectorAll("#pantalla-seg button").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("#pantalla-seg button").forEach(o=>o.setAttribute("aria-pressed",o===b)); if(box.__mode)box.__mode(+b.dataset.k); }));
})();

/* =====================================================================
   V4 · LINK-04 + SCALE-01 · PER ON SURTEN LES ESTRELLES (brúixola estel·lar)
   Azimut de sortida: cos A = sin δ / cos φ (sense refracció). Declinacions Hipparcos J2000.
   ===================================================================== */
(function bruixola(){
  const box=$("#bruixola-viz"), rng=$("#bruixola-rng"), latL=$("#bruixola-lat"); if(!box)return;
  let lat=+rng.value;
  const lg=$("#bruixola-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.yellow,t:"Sortida i posta d'una estrella",a:.9},{c:C.red,t:"Hōkūleʻa (Arcturus)",a:.9},{c:C.blue,t:"ʻAʻā (Sírius)",a:.9}]); }
  const latTxt=l=>`${f1(Math.abs(l))}° ${l<0?"S":l>0?"N":""}${Math.abs(l+17.5)<.3?" (Tahití)":Math.abs(l-21)<.3?" (Hawaiʻi)":Math.abs(l)<.3?" (equador)":""}`.replace("0,0° ","0° ");
  const rise=(dec,la)=>{ const c=Math.sin(dec*Math.PI/180)/Math.cos(la*Math.PI/180); return Math.abs(c)>1?null:Math.acos(c)*180/Math.PI; };
  const HS=11.25;
  V.mount(box,(el,w)=>{
    const mob=w<640, S=Math.min(w,mob?w:620), top=mob?44:0, h=S+top+(mob?6:20), cx=w/2, cy=top+(h-top)/2, R=S/2-(mob?52:92);
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Brúixola estel·lar hawaiana de 32 cases amb els punts de sortida i de posta de 25 estrelles brillants calculats per a la latitud triada."), g=s.append("g").attr("transform",`translate(${cx},${cy})`);
    const P=(az,r)=>[r*Math.sin(az*Math.PI/180),-r*Math.cos(az*Math.PI/180)];
    // anell de cases
    g.append("circle").attr("r",R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7);
    g.append("circle").attr("r",R*.985).attr("fill",V.alpha(C.blue,.035));
    d3.range(32).forEach(i=>{ const az=i*HS, a=P(az-HS/2,R), b=P(az-HS/2,R+(mob?6:10));
      g.append("line").attr("x1",a[0]).attr("y1",a[1]).attr("x2",b[0]).attr("y2",b[1]).attr("stroke",C.ink).attr("stroke-width",.6);
      const nm=D.houses[i], card=i%8===0, manu=i%8===4;
      if(mob&&!card&&!manu)return;
      const r=R+(mob?12:16), p=P(az,r); let rot=az-90; let an="start"; if(az>180){ rot=az+90; an="end"; }
      if(card){ V.t(g,P(az,R+(mob?14:18))[0],P(az,R+(mob?14:18))[1]+4,nm,{anchor:"middle",size:mob?12:13.5,weight:700,halo:3}); return; }
      const t=V.t(g,p[0],p[1],nm,{anchor:an,size:mob?10.5:11.5,fill:manu?C.ink:C.ink2,weight:manu?700:400,halo:2.5});
      t.attr("transform",`rotate(${rot},${p[0]},${p[1]})`).attr("dominant-baseline","middle");
    });
    // quadrants
    [["Koʻolau",45],["Malanai",135],["Kona",225],["Hoʻolua",315]].forEach(([t,az])=>{ const p=P(az,R*.62); V.t(g,p[0],p[1],t,{anchor:"middle",italic:true,size:mob?11:12.5,fill:C.muted,halo:2.5}); });
    // canoa al centre
    g.append("path").attr("d","M-6,-16C-3,-6 -3,8 -6,16M6,-16C3,-6 3,8 6,16M-6,-2H6").attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.6).attr("stroke-linecap","round");
    const SG=g.append("g"), ZT=s.append("g");
    const stars=D.stars.map(d=>Object.assign({},d));
    el.__draw=la=>{
      SG.selectAll("*").remove(); ZT.selectAll("*").remove();
      stars.forEach(d=>{ d.A=rise(d.dec,la); });
      const vis=stars.filter(d=>d.A!=null);
      // cordes sortida–posta
      vis.forEach(d=>{ const a=P(d.A,R*.97), b=P(360-d.A,R*.97), hi=d.n==="Arcturus"||d.n==="Sírius";
        SG.append("line").attr("x1",a[0]).attr("y1",a[1]).attr("x2",b[0]).attr("y2",b[1]).attr("stroke",hi?(d.n==="Arcturus"?C.red:C.blue):C.ink).attr("stroke-opacity",hi?.75:.12).attr("stroke-width",hi?1.4:.7); });
      vis.forEach(d=>{ const hi=d.n==="Arcturus"?C.red:d.n==="Sírius"?C.blue:null, r=clamp(4.6-d.mag*1.2,1.8,5.6);
        [d.A,360-d.A].forEach((az,j)=>{ const p=P(az,R*.97); SG.append("circle").datum(d).attr("cx",p[0]).attr("cy",p[1]).attr("r",r+(hi?1.2:0)).attr("fill",hi||C.yellow).attr("stroke",hi?C.paper:C.yellowDark).attr("stroke-width",hi?1.2:.6).attr("class","st"); }); });
      // etiquetes de les estrelles destacades
      { ["Arcturus","Sírius","Canopus","Àcrux","Estrella Polar"].forEach(nm=>{ const d=vis.find(q=>q.n===nm); if(!d)return; const p=P(d.A,R*.97-(mob?14:18));
        V.t(SG,p[0],p[1]+4,d.h?(mob?d.h.split(" (")[0].replace("Ke Aliʻi o Kona i ka Lewa","Canopus"):`${d.h} (${d.n})`):d.n,{anchor:d.A>150?"end":d.A<30?"start":"end",size:mob?10.5:11.5,weight:600,halo:3}); }); }
      // estrella zenital
      const zen=stars.filter(d=>Math.abs(d.dec-la)<1.6).sort((a,b)=>Math.abs(a.dec-la)-Math.abs(b.dec-la))[0];
      const zl=zen?[[`${zen.h?zen.h+" ("+zen.n+")":zen.n} passa pel zenit`,true],[`declinació ${V.signed(zen.dec,1)}° · latitud ${V.signed(la,1)}°`]]:[["Cap estrella brillant",true],["passa ara pel zenit"]];
      V.lines(ZT,mob?6:12,mob?18:22,zl,{size:mob?11.5:12.5,halo:3});
      if(!mob)V.lines(ZT,w-12,h-36,[[`${vis.length} de ${stars.length} estrelles`,true],["surten i es ponen a aquesta latitud"]],{size:12,anchor:"end",fill:C.ink2,halo:3});
      latL.textContent=latTxt(la); rng.setAttribute("aria-valuetext",latTxt(la));
    };
    el.__draw(lat);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const x=px-cx, y=py-cy; let best=null,bd=1e9;
      SG.selectAll("circle.st").each(function(d){ const dd=(+this.getAttribute("cx")-x)**2+(+this.getAttribute("cy")-y)**2; if(dd<bd){bd=dd;best=d;} });
      if(!best||bd>300){ tp.hide(); return; }
      const house=D.houses[Math.round(best.A/HS)%32], house2=D.houses[Math.round((360-best.A)/HS)%32];
      tp.show(`<b>${best.h?best.h+" · ":""}${best.n}</b> · declinació ${V.signed(best.dec,1)}° · surt a ${f0(best.A)}° (${house}) i es pon a ${f0(360-best.A)}° (${house2})`); },()=>tp.hide());
  });
  rng.addEventListener("input",()=>{ lat=+rng.value; if(box.__draw)box.__draw(lat); });
})();

/* =====================================================================
   V5 · HOW-04 + HOW-01 · QUÈ SENT UN NAVEGANT (simulació d'onades, scrolly)
   ===================================================================== */
(function mar(){
  const box=$("#mar-viz"), stepsEl=$("#s-mar .steps"); if(!box)return;
  let cur=0;
  const lg=$("#mar-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Crestes d'onada",kind:"line",w:1.4},{c:C.red,t:"Canoa",a:.9}]); }
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(mob?Math.min(w*.9,vh*.4):Math.min(w*.66,vh*.7));
    const st=stage(el,h);
    const {ctx}=mkCanvas(st,w,h,"Simulació d'onades de fons: una onada del nord-est, una segona del sud-est que la creua, una canoa que es mou diferent segons l'angle, i una illa que reflecteix les onades aigües amunt i les fa creuar-se a sotavent.");
    const s=overlay(st,w,h), A=s.append("g");
    const lam=mob?26:38;
    const crests=(dir,t,alpha,clip)=>{ // dir: angle de propagació (graus, 0 = cap avall)
      const a=dir*Math.PI/180, dx=Math.sin(a), dy=Math.cos(a), nx=-dy, ny=dx, D2=Math.hypot(w,h);
      const ph=(t*lam/7000)%lam;
      ctx.save(); if(clip)clip(); ctx.strokeStyle=V.alpha(C.blue,alpha); ctx.lineWidth=1.3;
      for(let k=-D2/lam-1;k<D2/lam+1;k++){ const off=k*lam+ph, px=w/2+dx*off, py=h/2+dy*off;
        ctx.beginPath(); ctx.moveTo(px-nx*D2,py-ny*D2); ctx.lineTo(px+nx*D2,py+ny*D2); ctx.stroke(); }
      ctx.restore(); };
    const ix=w*.62, iy=h*.5, ir=mob?10:14;
    function frame(t){
      ctx.clearRect(0,0,w,h);
      const k=cur;
      if(k<3){ crests(-45,t,.55); if(k===1)crests(225,t*1.1,.45); }
      else { // illa: onada de l'est cap a l'oest, ombra a sotavent, reflexió aigües amunt
        ctx.save(); ctx.beginPath(); ctx.rect(ix,0,w-ix,h); ctx.clip(); crests(-90,t,.55); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(0,0,ix,h); ctx.clip();
        ctx.beginPath(); ctx.moveTo(ix,iy-ir*2.2); ctx.lineTo(0,iy-h*.62); ctx.lineTo(0,0); ctx.lineTo(ix,0); ctx.closePath();
        ctx.moveTo(ix,iy+ir*2.2); ctx.lineTo(0,iy+h*.62); ctx.lineTo(0,h); ctx.lineTo(ix,h); ctx.closePath(); ctx.clip(); crests(-90,t,.5); ctx.restore();
        // trens refractats que es creuen a sotavent
        ctx.save(); ctx.beginPath(); ctx.moveTo(ix,iy-ir*2.2); ctx.lineTo(0,iy-h*.62); ctx.lineTo(0,iy+h*.62); ctx.lineTo(ix,iy+ir*2.2); ctx.closePath(); ctx.clip();
        crests(-90-28,t,.42); crests(-90+28,t,.42); ctx.restore();
        // ones reflectides (arcs aigües amunt, febles)
        ctx.save(); ctx.strokeStyle=V.alpha(C.blue,.32); ctx.lineWidth=1; const ph=(t*lam/7000)%lam;
        for(let r=ir+ph;r<w-ix;r+=lam){ ctx.beginPath(); ctx.arc(ix,iy,r,-Math.PI/2.6,Math.PI/2.6); ctx.stroke(); }
        ctx.restore();
        ctx.beginPath(); ctx.arc(ix,iy,ir,0,6.283); ctx.fillStyle=C.land; ctx.fill(); ctx.strokeStyle=V.alpha(C.ink,.5); ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(ix,iy,ir*.55,0,6.283); ctx.fillStyle=V.alpha(C.blue,.35); ctx.fill();
      }
      if(k===2)canoes(t);
    }
    // tres canoes amb el seu moviment
    const CAN=[{t:"Contra l'onada: capcineig",ang:0,m:"pitch"},{t:"De través: balanç",ang:90,m:"roll"},{t:"En diagonal: tirabuixó",ang:45,m:"cork"}];
    function canoes(t){ const ph=t/1300;
      CAN.forEach((c,i)=>{ const x=w*(mob?.2+.3*i:.22+.28*i), y=h*.5, sc=mob?1:1.6;
        const pitch=c.m==="pitch"?Math.sin(ph)*.18:c.m==="cork"?Math.sin(ph)*.12:0, roll=c.m==="roll"?Math.sin(ph)*.25:c.m==="cork"?Math.cos(ph)*.16:0;
        ctx.save(); ctx.translate(x,y); ctx.rotate((45-c.ang)*Math.PI/180); ctx.scale(sc*(1+roll*.6),sc*(1+pitch));
        ctx.fillStyle=V.alpha(C.paper,.85); ctx.fillRect(-14,-26,28,52);
        ctx.strokeStyle=C.red; ctx.lineWidth=2/sc; ctx.lineCap="round";
        [-8,8].forEach(dx=>{ ctx.beginPath(); ctx.moveTo(dx,-24); ctx.quadraticCurveTo(dx*1.2,0,dx,24); ctx.stroke(); });
        ctx.beginPath(); ctx.moveTo(-8,-4); ctx.lineTo(8,-4); ctx.moveTo(-8,6); ctx.lineTo(8,6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-3,-24); ctx.lineTo(0,-31); ctx.lineTo(3,-24); ctx.fillStyle=C.red; ctx.fill();
        ctx.restore(); }); }
    function labels(k){ A.selectAll("*").remove();
      const arrow=(x,y,ang,txt)=>{ const a=ang*Math.PI/180, L=mob?22:30, x2=x+Math.sin(a)*L, y2=y+Math.cos(a)*L;
        A.append("line").attr("x1",x).attr("y1",y).attr("x2",x2).attr("y2",y2).attr("stroke",C.ink).attr("stroke-width",1.2);
        A.append("circle").attr("cx",x2).attr("cy",y2).attr("r",2.6).attr("fill",C.ink);
        V.t(A,x+(Math.sin(a)<0?-6:6),y-6,txt,{anchor:Math.sin(a)<0?"end":"start",size:mob?11:12.5,weight:700,halo:3.5}); };
      if(k<3){ arrow(w-(mob?40:70),mob?26:34,-45,"Onada del NE"); if(k===1)arrow(w-(mob?40:70),h-(mob?40:56),225,"Onada del SE"); }
      if(k===2){ CAN.forEach((c,i)=>{ const x=w*(mob?.2+.3*i:.22+.28*i); V.t(A,x,h*.5+(mob?44:66),mob?c.t.split(": ")[1]:c.t,{anchor:"middle",size:mob?11:12.5,weight:700,halo:3.5}); }); }
      if(k===3){
        V.note(A,{x:ix+ir+lam*1.3,y:iy-ir*2.6,tx:ix+ir+lam*1.3+(mob?6:22),ty:mob?18:30,anchor:"start",lines:mob?[["Ones reflectides",true],["fins a 40 km"]]:[["Ones reflectides",true],["fins a uns 40 km aigües amunt"]],size:mob?11:12.5});
        V.note(A,{x:ix*.5,y:iy+8,tx:mob?8:24,ty:h-(mob?30:40),anchor:"start",lines:mob?[["Trens creuats",true],["desenes de km"]]:[["Trens d'onades que es creuen",true],["desenes de km a sotavent"]],size:mob?11:12.5});
        if(!mob)V.t(A,ix,iy+ir+18,"Atol",{anchor:"middle",size:12,weight:700,halo:3});
        arrow(w-(mob?20:40),mob?h*.5-60:h*.5-80,270,mob?"Alisis":"Onada dels alisis (de l'est)");
      }
    }
    el.__set=k=>{ labels(k); if(V.reduced)frame(0); };
    el.__set(cur);
    el.__loop=V.loop(el,(t)=>frame(t));
  });
  IB.scrolly(stepsEl,$("#s-mar .graphic"),i=>{ cur=i; if(box.__set)box.__set(i); });
})();

/* =====================================================================
   V6 · HOW-01 · L'ILLA QUE ES MOU (etak)
   ===================================================================== */
(function etak(){
  const box=$("#etak-viz"), rng=$("#etak-rng"), play=$("#etak-play"); if(!box)return;
  let mode="etak", p=0, playing=!V.reduced, modeK=1;
  const lg=$("#etak-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Canoa",a:.9},{c:C.blue,t:"Illa de referència (no es veu)",a:.6},{c:C.yellow,t:"Punts d'estrella",a:.9}]); }
  const NSTAR=8;
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(mob?w*.92:Math.min(400,w*.45));
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Esquema de l'etak: una canoa va d'una illa a una altra mentre una illa de referència, a un costat, passa d'un punt d'estrella al següent. En la vista carolina, la canoa queda quieta i les illes es mouen."), g=s.append("g");
    const OY=mob?h*.66:h*.78, rs=mob?Math.min(OY-14,w/2-14):OY-14, Lc=Math.min(rs/.78,mob?w*.44:w*.62);
    const W0={o:[0,0], d:[1,0], r:[.42,-.42]};  // coordenades del viatge, en unitats de la travessia
    const bearing=q=>Math.atan2(W0.r[0]-q,-(W0.r[1]));  // angle respecte del «nord» (amunt)
    const b0=Math.atan2(W0.r[0]-0, -W0.r[1]), b1=Math.atan2(W0.r[0]-1,-W0.r[1]);
    const STARS=d3.range(NSTAR).map(i=>b0+(b1-b0)*i/(NSTAR-1));
    const layer=g.append("g");
    function draw(){
      layer.selectAll("*").remove();
      const k=modeK; // 0: mapa (món fix), 1: etak (canoa fixa)
      const cxWorld=(w-Lc)/2, canoeWorld=[cxWorld+p*Lc,OY], canoeFixed=[w/2,OY];
      const cpos=[canoeWorld[0]*(1-k)+canoeFixed[0]*k, OY];
      const off=[(cpos[0]-(cxWorld+p*Lc)), 0]; // desplaçament del món
      const W=q=>[cxWorld+q[0]*Lc+off[0], OY+q[1]*Lc+off[1]];
      // horitzó d'estrelles (arc al voltant de la canoa)
      const arcR=rs;
      const arc=d3.arc().innerRadius(arcR).outerRadius(arcR).startAngle(b1-.25).endAngle(b0+.25);
      layer.append("path").attr("d",arc()).attr("transform",`translate(${cpos[0]},${cpos[1]})`).attr("fill","none").attr("stroke",C.hair).attr("stroke-dasharray","2 3");
      const cur=bearing(p), done=STARS.filter(b=>b>=cur-1e-6).length; // estrelles ja passades
      STARS.forEach((b,i)=>{ const x=cpos[0]+Math.sin(b)*arcR, y=cpos[1]-Math.cos(b)*arcR, past=b>=cur-1e-6;
        layer.append("circle").attr("cx",x).attr("cy",y).attr("r",past?5:4).attr("fill",C.yellow).attr("stroke",past?C.yellowDark:"none").attr("fill-opacity",past?1:.45);
      });
      // ruta i illes
      const o=W(W0.o), d=W(W0.d), r=W(W0.r);
      layer.append("line").attr("x1",o[0]).attr("y1",o[1]).attr("x2",d[0]).attr("y2",d[1]).attr("stroke",C.ink).attr("stroke-dasharray","3 3").attr("stroke-width",.8);
      [[o,"Origen"],[d,"Destí"]].forEach(([q,t])=>{ layer.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",mob?7:9).attr("fill",C.land).attr("stroke",C.ink2).attr("stroke-width",.8); if(q[0]>28&&q[0]<w-28)V.t(layer,q[0],q[1]+(mob?22:26),t,{anchor:"middle",size:mob?11:12.5,weight:600,halo:3}); });
      layer.append("circle").attr("cx",r[0]).attr("cy",r[1]).attr("r",mob?8:11).attr("fill",C.blue).attr("fill-opacity",.35).attr("stroke",C.blue).attr("stroke-dasharray","2 2").style("mix-blend-mode",BLEND);
      V.t(layer,r[0],r[1]-(mob?14:18),"Illa de referència",{anchor:"middle",size:mob?11:12.5,weight:600,fill:C.ink,halo:3});
      // visual de la canoa a l'illa de referència, allargada fins a l'horitzó
      const vx=Math.sin(cur), vy=-Math.cos(cur);
      layer.append("line").attr("x1",cpos[0]).attr("y1",cpos[1]).attr("x2",cpos[0]+vx*arcR).attr("y2",cpos[1]+vy*arcR).attr("stroke",C.blue).attr("stroke-width",1).attr("stroke-opacity",.7);
      // canoa
      const cg=layer.append("g").attr("transform",`translate(${cpos[0]},${cpos[1]}) rotate(90)`);
      cg.append("path").attr("d","M-5,-13C-2.5,-5 -2.5,6 -5,13M5,-13C2.5,-5 2.5,6 5,13M-5,-1H5").attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.8).attr("stroke-linecap","round");
      // comptador
      const et=Math.max(0,done-1);
      V.lines(layer,mob?8:16,mob?18:24,[[`Etak ${et} de ${NSTAR-1}`,true],[k>.5?"La canoa és quieta: les illes llisquen enrere":"El mapa és quiet: la canoa avança"]],{size:mob?11.5:13,halo:3});
    }
    el.__draw=draw; draw();
  });
  let raf=0,last=0;
  function tick(now){ if(!playing)return; const dt=last?Math.min(64,now-last):16; last=now; p=(p+dt/26000)%1; rng.value=p; rng.setAttribute("aria-valuetext",`${f0(p*100)} % del viatge`); if(box.__draw)box.__draw(); raf=requestAnimationFrame(tick); }
  function start(){ playing=true; last=0; play.textContent="Pausa"; raf=requestAnimationFrame(tick); }
  function stop(){ playing=false; cancelAnimationFrame(raf); play.textContent="Reprodueix →"; }
  play.addEventListener("click",()=>playing?stop():start());
  rng.addEventListener("input",()=>{ stop(); p=+rng.value; if(box.__draw)box.__draw(); });
  document.querySelectorAll("#etak-seg button").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("#etak-seg button").forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k;
    const k0=modeK, k1=mode==="etak"?1:0; d3.transition().duration(V.reduced?0:700).tween("m",()=>t=>{ modeK=k0+(k1-k0)*t; if(box.__draw)box.__draw(); }); }));
  V.onView(box,instant=>{ if(instant){ playing=false; play.textContent="Reprodueix →"; return; } start(); },{threshold:.4});
})();

/* =====================================================================
   V7 · CASE-02 · LLEGIR EL MAPA DE TUPAIA
   ===================================================================== */
(function tupaia(){
  const box=$("#tupaia-viz"); if(!box)return;
  const B=[{v:330,t:"Real (mapa Mercator)",c:C.ink},{v:335,t:"Còpia de Forster",c:C.blue},{v:338,t:"Còpia de Banks",c:C.red}];
  const lg=$("#tupaia-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,B.map(b=>({c:b.c,t:`${b.t}: ${b.v}°`,kind:"line",w:2}))); }
  V.mount(box,(el,w)=>{
    const mob=w<560, pw=mob?w:w/2, ph2=mob?pw*.78:0, h=mob?pw+ph2+20:Math.min(340,pw*.9);
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Esquema de lectura del mapa de Tupaia amb avatea al centre com a nord, i rumbs de les Marqueses a Oʻahu: 330° real, 335° a la còpia de Forster i 338° a la de Banks.");
    // esquerra: esquema de lectura
    const g1=s.append("g"), c1=[pw/2,(mob?pw:h)/2], R1=Math.min(pw,(mob?pw:h))/2-34;
    g1.append("line").attr("x1",c1[0]-R1).attr("x2",c1[0]+R1).attr("y1",c1[1]).attr("y2",c1[1]).attr("stroke",C.hair);
    g1.append("line").attr("y1",c1[1]-R1).attr("y2",c1[1]+R1).attr("x1",c1[0]).attr("x2",c1[0]).attr("stroke",C.hair);
    g1.append("circle").attr("cx",c1[0]).attr("cy",c1[1]).attr("r",9).attr("fill",C.yellow).attr("fill-opacity",.85);
    V.t(g1,c1[0]+12,c1[1]-10,"avatea · «migdia» = nord",{size:12,weight:700,halo:3});
    const isl=[c1[0]-R1*.55,c1[1]+R1*.55], aN0=Math.atan2(c1[0]-isl[0],-(c1[1]-isl[1])), aT0=aN0+330*Math.PI/180;
    const tgt=[isl[0]+Math.sin(aT0)*R1*.9,isl[1]-Math.cos(aT0)*R1*.9];
    g1.append("line").attr("x1",isl[0]).attr("y1",isl[1]).attr("x2",c1[0]).attr("y2",c1[1]).attr("stroke",C.yellowDark).attr("stroke-width",1.4).attr("stroke-dasharray","4 3");
    g1.append("line").attr("x1",isl[0]).attr("y1",isl[1]).attr("x2",tgt[0]).attr("y2",tgt[1]).attr("stroke",C.red).attr("stroke-width",1.6);
    [[isl,"Illa de sortida"],[tgt,"Illa de destí"]].forEach(([p,t])=>{ g1.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",5).attr("fill",C.land).attr("stroke",C.ink); V.t(g1,p[0]+(p===tgt?8:0),p[1]+(p===tgt?-6:20),t,{anchor:p===tgt?"start":"middle",size:11.5,halo:3}); });
    g1.append("path").attr("d",d3.arc().innerRadius(34).outerRadius(34).startAngle(aN0-Math.PI/6).endAngle(aN0)()).attr("transform",`translate(${isl[0]},${isl[1]})`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9);
    { const am=aN0-Math.PI/12, p=[isl[0]+Math.sin(am)*48,isl[1]-Math.cos(am)*48]; V.t(g1,p[0],p[1],"330°",{anchor:"middle",size:12,weight:700,halo:3}); }
    V.t(g1,8,16,"Com es llegeix (esquema)",{size:12,fill:C.muted});
    // dreta: rosa amb els tres rumbs, ampliada al sector nord-oest
    const ox=mob?0:pw, oy=mob?pw+20:0, g2=s.append("g").attr("transform",`translate(${ox},${oy})`);
    const c2=[pw*.5,(mob?ph2:h)*.9], R2=mob?Math.min(pw*.36,ph2*.7):Math.min(pw*.46,h*.78);
    const sc=d3.scaleLinear([315,345],[-Math.PI/2.4,Math.PI/2.4]);
    V.t(g2,8,16,"De les Marqueses a Oʻahu (sector ampliat)",{size:12,fill:C.muted});
    g2.append("path").attr("d",d3.arc().innerRadius(R2).outerRadius(R2).startAngle(sc(315)).endAngle(sc(345))()).attr("transform",`translate(${c2[0]},${c2[1]})`).attr("fill","none").attr("stroke",C.hair);
    [315,320,325,330,335,340,345].forEach(v=>{ const a=sc(v), p=[c2[0]+Math.sin(a)*R2,c2[1]-Math.cos(a)*R2], q=[c2[0]+Math.sin(a)*(R2+6),c2[1]-Math.cos(a)*(R2+6)];
      g2.append("line").attr("x1",p[0]).attr("y1",p[1]).attr("x2",q[0]).attr("y2",q[1]).attr("stroke",C.muted);
      V.t(g2,c2[0]+Math.sin(a)*(R2+18),c2[1]-Math.cos(a)*(R2+18)+4,`${v}°`,{anchor:"middle",size:11,fill:C.muted}); });
    const nd=g2.selectAll("g.nd").data(B).join("g").attr("class","nd");
    nd.append("line").attr("x1",c2[0]).attr("y1",c2[1]).attr("x2",c2[0]).attr("y2",c2[1]).attr("stroke",b=>b.c).attr("stroke-width",2.2).attr("stroke-linecap","round");
    nd.append("circle").attr("cx",c2[0]).attr("cy",c2[1]).attr("r",4).attr("fill",b=>b.c);
    g2.append("circle").attr("cx",c2[0]).attr("cy",c2[1]).attr("r",3.5).attr("fill",C.ink);
    V.t(g2,c2[0],c2[1]+18,"Marqueses",{anchor:"middle",size:12,weight:700,halo:3});
    const go=instant=>{ nd.each(function(b,i){ const a=sc(b.v), x=c2[0]+Math.sin(a)*R2*.92, y=c2[1]-Math.cos(a)*R2*.92;
      d3.select(this).select("line").transition().delay(instant?0:i*300).duration(instant?0:800).attr("x2",x).attr("y2",y);
      d3.select(this).select("circle").transition().delay(instant?0:i*300).duration(instant?0:800).attr("cx",x).attr("cy",y); }); };
    V.onView(el,go);
    V.note(g2,{x:c2[0]+Math.sin(sc(336.5))*R2*.6,y:c2[1]-Math.cos(sc(336.5))*R2*.6,tx:c2[0]+R2*.42,ty:c2[1]-R2*.42,kind:"curve",anchor:"start",lines:mob?[["5–8° de diferència",true]]:[["5–8° de diferència",true],["en més de 3.900 km"]],size:12});
  });
})();

/* =====================================================================
   V8 · TIME-13 · CRONOLOGIA
   ===================================================================== */
(function crono(){
  const box=$("#crono-viz"); if(!box)return;
  const T={deb:{c:C.blue,t:"Debat"},via:{c:C.red,t:"Viatge"},sab:{c:C.yellow,t:"Mestres i deixebles"},cie:{c:C.ink2,t:"Ciència"}};
  const E=[
    {y:1769,k:"sab",t:"Tupaia dibuixa el seu mapa",s:"amb la tripulació de l'Endeavour (1769–1770)"},
    {y:1947,k:"deb",t:"El Kon-Tiki",s:"un rai d'Amèrica del Sud a les Tuamotu"},
    {y:1956,k:"deb",t:"Andrew Sharp",s:"la colonització seria accidental"},
    {y:1973,k:"cie",t:"Simulació per ordinador",s:"la deriva no arriba a Hawaiʻi"},
    {y:1975,k:"via",t:"S'avara Hōkūleʻa",s:"una canoa doble reconstruïda"},
    {y:1976,k:"via",t:"Mau Piailug la porta a Tahití",s:"34 dies sense instruments"},
    {y:1978,k:"via",t:"Hōkūleʻa bolca",s:"Eddie ʻAikau no torna"},
    {y:1979,k:"sab",t:"Mau ensenya Nainoa Thompson",s:"trenca els tabús de l'ensenyament"},
    {y:1980,k:"via",t:"Nainoa navega a Tahití",s:"i torna, sense instruments"},
    {y:2007,k:"sab",t:"Pwo a Satawal",s:"5 hawaians i 11 micronesis"},
    {y:2010,k:"sab",t:"Mor Mau Piailug",s:"el 12 de juliol, a Satawal"},
    {y:2014,k:"via",t:"Mālama Honua",s:"la volta al món (2014–2017)"},
    {y:2020,k:"cie",t:"Contacte amb Amèrica",s:"els genomes el daten cap al 1200"},
    {y:2021,k:"cie",t:"El camí dels gens",s:"de Samoa a Rapa Nui"},
    {y:2022,k:"via",t:"Lehua Kamalu",s:"primera capitana i navegant"},
    {y:2026,k:"sab",t:"Primer pwo a Hawaiʻi",s:"quatre dones entre sis navegants"}
  ];
  const lg=$("#crono-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,Object.values(T).map(o=>({c:o.c,t:o.t,a:.85}))); }
  V.mount(box,(el,w)=>{
    const mob=w<640;
    d3.select(el).selectAll("svg").remove();
    if(mob){ // vertical: un fet per fila
      const rh=46, h=E.length*rh+16, s=V.svg(el,w,h,"Cronologia de la navegació polinèsia de 1769 a 2021."), g=s.append("g");
      g.append("line").attr("x1",52).attr("x2",52).attr("y1",8).attr("y2",h-8).attr("stroke",C.hair);
      E.forEach((e,i)=>{ const y=16+i*rh; V.t(g,40,y+4,e.y,{anchor:"end",size:12,weight:700,fill:C.ink2});
        g.append("circle").attr("cx",52).attr("cy",y).attr("r",6).attr("fill",T[e.k].c).attr("fill-opacity",.85);
        V.t(g,66,y+4,e.t,{size:12.5,weight:700}); V.t(g,66,y+20,e.s,{size:11.5,fill:C.ink2}); });
      return;
    }
    const h=420, s=V.svg(el,w,h,"Cronologia de la navegació polinèsia de 1769 a 2021: el mapa de Tupaia, el Kon-Tiki, la tesi de Sharp, la simulació de 1973, Hōkūleʻa i els viatges de 1976 i 1980, el pwo de 2007, la mort de Mau el 2010, la volta al món i els estudis genòmics."), g=s.append("g");
    const x=d3.scaleLinear([1765,1945,1972,1982,2005,2027],[20,w*.11,w*.18,w*.56,w*.62,w-24]);
    const y0=h*.52;
    g.append("line").attr("x1",x(1765)).attr("x2",x(2027)).attr("y1",y0).attr("y2",y0).attr("stroke",C.ink).attr("stroke-width",.8);
    [[1769,"1769"],[1945,"1945"],[1972,"1972"],[1982,"1982"],[2005,"2005"]].forEach(([v,t])=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",y0-3).attr("y2",y0+3).attr("stroke",C.ink); });
    [1945,2005].forEach(v=>V.t(g,x(v),y0+4,"//",{anchor:"middle",size:12,fill:C.muted,halo:4}));
    const ev=g.selectAll("g.ev").data(E).join("g").attr("class","ev");
    // nivells: cada etiqueta va al primer nivell (dalt/baix alternant) on no trepitja l'anterior
    const ends={}; E.forEach((e,i)=>{ e.up=i%2===0; const X=x(e.y), wd=Math.max((e.y+" · "+e.t).length,e.s.length)*6.4, a=X>w*.85?X-wd:X<w*.08?X:X-wd/2;
      for(let lv=0;lv<4;lv++){ const k=(e.up?"u":"d")+lv; if(ends[k]==null||ends[k]<a-8){ e.lv=lv; ends[k]=a+wd; break; } if(lv===3)e.lv=3; } });
    ev.each(function(e){ const q=d3.select(this), X=x(e.y), dy=(e.up?-1:1)*(30+e.lv*44);
      q.append("line").attr("x1",X).attr("x2",X).attr("y1",y0).attr("y2",y0+dy).attr("stroke",C.hair);
      q.append("circle").attr("cx",X).attr("cy",y0).attr("r",6.5).attr("fill",T[e.k].c).attr("fill-opacity",.85).attr("stroke",C.paper).attr("stroke-width",1.2);
      const ty=y0+dy+(e.up?-18:12), an=X>w*.85?"end":X<w*.08?"start":"middle";
      V.t(q,X,ty,`${e.y} · ${e.t}`,{anchor:an,size:12,weight:700,halo:3}); V.t(q,X,ty+15,e.s,{anchor:an,size:11.5,fill:C.ink2,halo:3}); });
    V.onView(el,instant=>ev.style("opacity",0).transition().duration(instant?0:500).delay((e,i)=>instant?0:i*90).style("opacity",1));
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(evn,[px])=>{ const b=d3.least(E,e=>Math.abs(x(e.y)-px)); V.focus(ev,e=>e===b); tp.show(`<b>${b.y} · ${b.t}</b> · ${b.s}`); },()=>{ tp.hide(); V.focus(ev,null); });
  });
})();

})();
