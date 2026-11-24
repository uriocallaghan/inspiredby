/* «Comptar ocells» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-cercles     MAP-03 (scrolly)   Els cercles del recompte de Nadal, a escala
   V2 #f-protocols   SCALE-05           Tres protocols a la mateixa escala
   V3 #f-ebird       TIME-01            Registres d'eBird per any
   V4 #f-oreneta     MAP-16 + MAP-06    L'oreneta vulgar mes a mes (lliscant i «Reprodueix»)
   V5 #f-cursa       SCALE-01 sobre mapa  La cursa cap al nord (Europa, 1990–2008)
   V6 #f-biomes      CASE-01            Canvi d'ocells per bioma, 1970–2017
   V7 #f-socc        MAP-01 + MAP-11    Itineraris del SOCC sobre el relleu de Catalunya
   V8 #f-indicadors  CASE-05            Indicadors d'hàbitat del SOCC
   Colors: vermell = les persones que compten; blau = els ocells; groc = la temperatura; verd = només ocells de bosc. */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.OC;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const DARK=!!(window.IBTheme&&IBTheme.dark), BLEND=DARK?"screen":"multiply";
const MESOS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];

/* ---------- ajudants ---------- */
function stage(el,h){ d3.select(el).selectAll(":scope>.stage").remove(); const st=document.createElement("div"); st.className="stage"; st.style.cssText=`position:relative;height:${h}px`; el.insertBefore(st,el.firstChild); return st; }
function mkCanvas(el,w,h,label){
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.className="ibv"; c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0`;
  if(label){ c.setAttribute("role","img"); c.setAttribute("aria-label",label); } else c.setAttribute("aria-hidden","true");
  el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx,dpr};
}
function overlay(el,w,h,label){
  const s=d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
    .style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS);
  if(label)s.attr("role","img").attr("aria-label",label); else s.attr("aria-hidden","true");
  return s;
}
let landP=null;
function land50(){ // Natural Earth 1:50 m via world-atlas 2.0.2
  if(!landP)landP=fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json").then(r=>r.json()).then(tp=>topojson.feature(tp,tp.objects.land));
  return landP;
}
// només els polígons d'una caixa (més lleuger per redibuixar)
function landIn(L,lon0,lon1,lat0,lat1){
  const polys=[];
  L.features.forEach(f=>{ const g=f.geometry; const P=g.type==="Polygon"?[g.coordinates]:g.coordinates;
    P.forEach(p=>{ const r=p[0]; let x=0,y=0; r.forEach(c=>{x+=c[0];y+=c[1];}); x/=r.length; y/=r.length;
      const b=d3.geoBounds({type:"Polygon",coordinates:p});
      // els polígons que travessen l'antimeridià (Euràsia per Txukotka) es decideixen per la longitud mitjana
      const wrap=b[0][0]>b[1][0]; if((wrap?(x>=lon0&&x<=lon1):(b[1][0]>=lon0&&b[0][0]<=lon1))&&b[1][1]>=lat0&&b[0][1]<=lat1)polys.push(p); }); });
  return {type:"MultiPolygon",coordinates:polys};
}
function kmPx(proj,ll,km){ const a=proj(ll), b=proj([ll[0],ll[1]+km/111.2]); return Math.hypot(a[0]-b[0],a[1]-b[1]); }
const amerProj=(w,h,pad)=>d3.geoEqualEarth().rotate([92,0]).fitExtent([[pad,pad],[w-pad,h-pad]],{type:"MultiPoint",coordinates:[[-168,71],[-34,71],[-168,-56],[-34,-56],[-90,72],[-90,-56]]});

/* =====================================================================
   V1 · MAP-03 · ELS CERCLES DEL RECOMPTE DE NADAL (scrolly)
   ===================================================================== */
(function cercles(){
  const box=$("#cer-viz"), stepsEl=$("#s-cercles .steps"); if(!box||!D)return;
  const lg=$("#cer-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Cercle de recompte, de 24,1 km, a escala",a:.45}]); }
  const CER=D.cercles.filter(d=>d[2]<-20); // fora: Guam i les Marianes
  const LH=[-74.001,40.775];
  let cur=0, api=null;
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*1.0,vh*.4):Math.min(w*1.02,vh*.78));
    const st=stage(el,h);
    const base=amerProj(w,h,mob?4:10), S0=base.scale(), T0=base.translate();
    const proj=d3.geoEqualEarth().rotate([92,0]);
    const {ctx}=mkCanvas(st,w,h,"Mapa d'Amèrica amb els 3.138 cercles del recompte d'ocells de Nadal de la temporada 2025–26: es concentren a l'est dels Estats Units, a la costa del Pacífic i al sud del Canadà, i n'hi ha menys a Mèxic, Amèrica Central, el Carib i Amèrica del Sud.");
    const s=overlay(st,w,h), g=s.append("g"), gA=s.append("g");
    let LAND=null;
    // vistes: centre i ampliació
    const r0=kmPx(base,LH,12.05);
    const VIEWS=[
      {c:LH,k:(mob?h*.085:h*.075)/r0},
      {c:null,k:1},
      {c:[-92,41],k:mob?2.1:1.9},
      {c:null,k:1,south:true}];
    let view={c:base.invert([w/2,h/2]),k:1,south:false};
    function setProj(v){ proj.scale(S0*v.k).translate([w/2,h/2]); const p=proj(v.c); proj.translate([w-p[0],h-p[1]]); }
    function draw(v){
      setProj(v);
      ctx.clearRect(0,0,w,h);
      const path=d3.geoPath(proj,ctx);
      if(LAND){ ctx.beginPath(); path(LAND); ctx.fillStyle=C.land; ctx.fill(); }
      ctx.beginPath(); path(d3.geoGraticule().step([20,20])()); ctx.strokeStyle=V.alpha(C.ink,.05); ctx.lineWidth=.6; ctx.stroke();
      const zoom=v.k>8;
      ctx.globalCompositeOperation=DARK?"source-over":"multiply";
      for(const d of CER){
        const p=proj([d[2],d[3]]); if(p[0]<-30||p[0]>w+30||p[1]<-30||p[1]>h+30)continue;
        const r=Math.max(1.1,kmPx(proj,[d[2],d[3]],12.05));
        const south=d[3]<25&&d[2]>-120;
        const a=(v.south?(south?.65:.14):(zoom?.2:.4))*(DARK&&!zoom?1.5:1);
        ctx.beginPath(); ctx.arc(p[0],p[1],r,0,6.2832); ctx.fillStyle=V.alpha(C.red,a); ctx.fill();
        if(zoom){ ctx.strokeStyle=V.alpha(C.red,.7); ctx.lineWidth=.8; ctx.stroke(); }
      }
      ctx.globalCompositeOperation="source-over";
      view=v;
    }
    function annotate(k){
      gA.selectAll("*").remove();
      if(k===0){
        const p=proj(LH), r=kmPx(proj,LH,12.05);
        gA.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",r).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
        gA.append("line").attr("x1",p[0]-r).attr("x2",p[0]+r).attr("y1",p[1]).attr("y2",p[1]).attr("stroke",C.ink).attr("stroke-width",1);
        [-1,1].forEach(sg=>gA.append("line").attr("x1",p[0]+sg*r).attr("x2",p[0]+sg*r).attr("y1",p[1]-5).attr("y2",p[1]+5).attr("stroke",C.ink));
        V.t(gA,p[0],p[1]-8,"24,1 km",{anchor:"middle",weight:700,size:13,halo:3.5});
        V.t(gA,p[0],p[1]+r+18,"Lower Hudson (Manhattan)",{anchor:"middle",size:12,fill:C.ink2,halo:3});
      } else if(k===1){
        V.lines(gA,mob?10:16,mob?20:30,[["3.138 cercles",true],["inscrits el 2025–26"]],{size:mob?12.5:14,halo:3});
      } else if(k===2){
        const p=proj([-77.0,39.0]);
        if(p[0]>0&&p[0]<w) V.note(gA,{x:p[0],y:p[1],tx:Math.min(w-10,p[0]+(mob?28:60)),ty:p[1]+(mob?44:70),lines:[["Maryland",true],["37 % dins d'un cercle"]],anchor:"start",size:mob?11.5:12.5,dot:true});
      } else if(k===3){
        const p=proj([-75,0]);
        V.lines(gA,p[0]+(mob?6:20),p[1],[["177 recomptes",true],["a l'Amèrica Llatina,"],["el Carib i el Pacífic"]],{size:mob?11.5:12.5,halo:3});
      }
      gA.style("opacity",0).transition().duration(V.reduced?0:400).style("opacity",1);
    }
    let anim=null;
    function go(k,instant){
      const tgt=Object.assign({},VIEWS[k]); if(!tgt.c)tgt.c=base.invert([w/2,h/2]);
      const from=view; if(anim)anim.stop();
      gA.selectAll("*").remove();
      if(instant||V.reduced){ draw(tgt); annotate(k); return; }
      const iz=d3.interpolateZoom([...from.c,1/from.k*1000],[...tgt.c,1/tgt.k*1000]);
      const T=Math.min(1800,Math.max(700,iz.duration*.55));
      anim=d3.timer(e=>{ const t=d3.easeCubicInOut(Math.min(1,e/T)), z=iz(t);
        draw({c:[z[0],z[1]],k:1000/z[2],south:tgt.south&&t>.5});
        if(t>=1){ anim.stop(); anim=null; draw(tgt); annotate(k); } });
    }
    api={go};
    land50().then(L=>{ LAND=landIn(L,-180,-20,-60,85); draw(view); }).catch(()=>{});
    go(cur,true);
    // hover: el cercle més proper
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").lower();
    const hv=s.append("g").attr("pointer-events","none");
    V.hover(hit.node(),(ev,[px,py])=>{
      let best=null,bd=1e9; for(const d of CER){ const p=proj([d[2],d[3]]); const dd=(p[0]-px)**2+(p[1]-py)**2; if(dd<bd){bd=dd;best=[d,p];} }
      hv.selectAll("*").remove();
      if(!best||bd>(mob?22:16)**2){ tp.hide(); return; }
      const r=Math.max(3,kmPx(proj,[best[0][2],best[0][3]],12.05));
      hv.append("circle").attr("cx",best[1][0]).attr("cy",best[1][1]).attr("r",r+2).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
      tp.show(`<b>${best[0][1]}</b> · cercle ${best[0][0]}`);
    },()=>{ hv.selectAll("*").remove(); tp.hide(); });
  });
  IB.scrolly(stepsEl,$("#s-cercles .graphic"),i=>{ cur=i; if(api)api.go(i,false); });
})();

/* =====================================================================
   V2 · SCALE-05 · TRES PROTOCOLS A LA MATEIXA ESCALA (esquema amb mides reals)
   ===================================================================== */
(function protocols(){
  const box=$("#pro-viz"); if(!box)return;
  const lg=$("#pro-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Recorregut o àrea que es compta",a:.5},{c:C.ink,t:"Parada de 3 minuts",kind:"hollow"}]); }
  // ruta il·lustrativa en ziga-zaga de 39,2 km: 4 trams verticals de 8,3 km i 3 horitzontals de 2 km
  const ROUTE=[[0,0],[0,8.3],[2,8.3],[2,0],[4,0],[4,8.3],[6,8.3],[6,0]];
  const routeLen=d3.sum(d3.pairs(ROUTE),([a,b])=>Math.hypot(b[0]-a[0],b[1]-a[1])); // 39,2 km
  function along(pts,dist){ let acc=0; for(const [a,b] of d3.pairs(pts)){ const L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(acc+L>=dist){ const t=(dist-acc)/L; return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; } acc+=L; } return pts[pts.length-1]; }
  const STOPS=d3.range(50).map(i=>along(ROUTE,i*0.8));
  V.mount(box,(el,w)=>{
    const mob=w<640;
    // escala: px per km (la mateixa per a les tres formes)
    const kpx=mob?(w-24)/26:Math.min(16,(w-40)/43);
    const hCirc=24.1*kpx;
    // posicions: a mòbil, apilat; a escriptori, el cercle a l'esquerra i la resta a la dreta
    const cx=mob?w/2:12+hCirc/2, cy=mob?30+hCirc/2:46+hCirc/2;
    const rx0=mob?w/2-3*kpx:12+hCirc+4*kpx, ry0=mob?cy+hCirc/2+62:66;
    const sx0=mob?w/2-1.5*kpx:rx0+10*kpx, sy0=mob?ry0+8.3*kpx+78:ry0+4.15*kpx;
    const Z=Math.floor((mob?w-24:Math.min(w-rx0-12,26*kpx))/(3*kpx)), zW=Z*3*kpx, zx0=mob?(w-zW)/2:rx0, zy=mob?sy0+56:46+hCirc-40;
    const h=Math.round(mob?zy+70:Math.max(46+hCirc+34,zy+70));
    const s=V.svg(el,w,h,"Esquema a escala: el cercle del recompte de Nadal fa 24,1 km de diàmetre; una ruta del Breeding Bird Survey fa 39,2 km amb 50 parades cada 800 metres; un itinerari del SOCC fa 3 km, dividit en sis trams de 500 metres, i es veu també ampliat.");
    const g=s.append("g");
    const tp=V.tip(el);
    // 1. cercle
    const gc=g.append("g").attr("class","pc");
    gc.append("circle").attr("cx",cx).attr("cy",cy).attr("r",0).attr("fill",V.alpha(C.red,.16)).attr("stroke",C.red).attr("stroke-width",1.2)
      .transition().duration(V.reduced?0:900).attr("r",hCirc/2);
    V.lines(gc,cx,mob?14:22,[["Recompte de Nadal",true]],{anchor:"middle",size:13,halo:3});
    V.t(gc,cx,cy+4,"24,1 km de diàmetre",{anchor:"middle",size:12,fill:C.ink2,halo:3});
    V.t(gc,cx,cy+20,"un dia, tot el cercle",{anchor:"middle",size:12,fill:C.ink2,halo:3});
    // 2. ruta BBS
    const X=p=>rx0+p[0]*kpx, Y=p=>ry0+p[1]*kpx;
    const gr=g.append("g");
    V.lines(gr,rx0+3*kpx,ry0-(mob?14:24),[["Breeding Bird Survey",true]],{anchor:"middle",size:13,halo:3});
    const R400=0.4*kpx;
    const stopsG=gr.append("g");
    STOPS.forEach((p,i)=>{ stopsG.append("circle").attr("cx",X(p)).attr("cy",Y(p)).attr("r",R400).attr("fill",V.alpha(C.red,.12)).style("opacity",0)
      .transition().delay(V.reduced?0:300+i*28).duration(200).style("opacity",1); });
    const rp=gr.append("path").attr("d",d3.line()(ROUTE.map(p=>[X(p),Y(p)]))).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.6);
    if(!V.reduced){ const n=rp.node().getTotalLength(); rp.attr("stroke-dasharray",`${n} ${n}`).attr("stroke-dashoffset",n).transition().delay(200).duration(1500).ease(d3.easeLinear).attr("stroke-dashoffset",0); }
    STOPS.forEach((p,i)=>{ stopsG.append("circle").attr("cx",X(p)).attr("cy",Y(p)).attr("r",1.6).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",.8).style("opacity",0)
      .transition().delay(V.reduced?0:300+i*28).duration(200).style("opacity",1); });
    V.t(gr,rx0+3*kpx,ry0+8.3*kpx+18,"39,2 km · 50 parades",{anchor:"middle",size:12,fill:C.ink2,halo:3});
    V.t(gr,rx0+3*kpx,ry0+8.3*kpx+33,"cada juny, per carretera",{anchor:"middle",size:12,fill:C.ink2,halo:3});
    // 3. SOCC (real) + lupa ×8
    const gs=g.append("g");
    gs.append("line").attr("x1",sx0).attr("x2",sx0+3*kpx).attr("y1",sy0).attr("y2",sy0).attr("stroke",C.red).attr("stroke-width",2.2);
    V.t(gs,sx0+1.5*kpx,sy0-10,"SOCC · 3 km",{anchor:"middle",size:12,weight:700,halo:3});
    gs.append("path").attr("d",`M${sx0},${sy0+4}L${zx0},${zy-14}M${sx0+3*kpx},${sy0+4}L${zx0+zW},${zy-14}`).attr("stroke",C.ghost).attr("stroke-width",.8).attr("fill","none");
    const seg=zW/6;
    for(let i=0;i<6;i++){
      gs.append("line").attr("x1",zx0+i*seg+1).attr("x2",zx0+(i+1)*seg-1).attr("y1",zy).attr("y2",zy).attr("stroke",i%2?C.redLight:C.red).attr("stroke-width",3);
      V.t(gs,zx0+(i+.5)*seg,zy+18,`${i*500}–${(i+1)*500} m`,{anchor:"middle",size:11,fill:C.ink2,halo:2.5}).style("display",seg<66?"none":null);
    }
    V.t(gs,zx0+zW/2,zy+(seg<66?20:38),`ampliat ×${Z} · 6 trams de 500 m · 4 matins l'any`,{anchor:"middle",size:12,fill:C.ink2,halo:3});
    // escala
    const sb=g.append("g").attr("transform",`translate(${mob?12:12},${h-12})`);
    sb.append("path").attr("d",`M0,-4V0H${5*kpx}V-4`).attr("fill","none").attr("stroke",C.ink2);
    V.t(sb,5*kpx+6,1,"5 km",{size:11.5,fill:C.ink2,halo:true});
    // hover
    const hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{
      if(Math.hypot(px-cx,py-cy)<hCirc/2) return tp.show("<b>Recompte de Nadal</b> · un cercle de 24,1 km, un sol dia entre el 14 de desembre i el 5 de gener; s'anoten les hores i les persones");
      if(px>rx0-R400&&px<rx0+6*kpx+R400&&py>ry0-R400&&py<ry0+8.3*kpx+R400) return tp.show("<b>Breeding Bird Survey</b> · 50 parades cada 800 m; a cada una, 3 minuts comptant el que es veu a 400 m i tot el que se sent");
      if((px>sx0-10&&px<sx0+3*kpx+10&&py>sy0-24&&py<sy0+10)||(px>zx0&&px<zx0+zW&&py>zy-14&&py<zy+44)) return tp.show("<b>SOCC</b> · 3 km a peu en sis trams de 500 m, dos matins a la primavera i dos a l'hivern");
      tp.hide();
    },()=>tp.hide());
  });
})();

/* =====================================================================
   V3 · TIME-01 · REGISTRES D'EBIRD PER ANY
   ===================================================================== */
(function ebird(){
  const box=$("#eb-viz"); if(!box||!D)return;
  const E=D.ebird;
  V.mount(box,(el,w)=>{
    const mob=w<640, h=mob?260:340, m={l:mob?6:8,r:mob?10:20,t:30,b:28};
    const s=V.svg(el,w,h,`Barres dels registres d'eBird publicats per any: ${f1(E[0][1]/1e6)} milions el 2002 i ${f0(E[E.length-1][1]/1e6)} milions el 2025.`);
    const x=d3.scaleBand(E.map(d=>d[0]),[m.l+(mob?26:34),w-m.r]).padding(.28), y=d3.scaleLinear([0,240e6],[h-m.b,m.t]);
    const g=s.append("g");
    V.gridY(g,y,m.l,w-m.r,[0,50e6,100e6,150e6,200e6],v=>f0(v/1e6),{zero:0,unit:" milions"});
    V.axisX(g,d=>x(d)+x.bandwidth()/2,h-m.b,mob?[2002,2010,2018,2025]:[2002,2005,2010,2015,2020,2025],d=>d,{tick:false});
    const bars=g.append("g").selectAll("rect").data(E).join("rect").attr("x",d=>x(d[0])).attr("width",x.bandwidth())
      .attr("y",y(0)).attr("height",0).attr("fill",d=>d[0]===2025?C.red:V.alpha(C.red,.55));
    V.onView(el,inst=>{ bars.transition().duration(inst?0:900).delay((d,i)=>inst?0:i*35).attr("y",d=>y(d[1])).attr("height",d=>y(0)-y(d[1])); });
    const last=E[E.length-1];
    V.note(g,{x:x(last[0])+x.bandwidth()/2,y:y(last[1])-4,tx:x(last[0])-(mob?6:14),ty:y(last[1])-(mob?6:12),anchor:"end",lines:[[`${f0(last[1]/1e6)} milions`,true],["el 2025"]],size:mob?11.5:12.5});
    const a=E[0];
    V.note(g,{x:x(a[0])+x.bandwidth()/2,y:y(a[1])-3,tx:x(a[0])+x.bandwidth()/2+(mob?8:14),ty:y(a[1])-(mob?40:56),anchor:"start",lines:[["2002",true],[`${f1(a[1]/1e6)} milions`]],size:mob?11.5:12.5});
    const tp=V.tip(el), hit=s.append("rect").attr("x",m.l).attr("width",w-m.l-m.r).attr("y",m.t).attr("height",h-m.t-m.b).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ const d=d3.least(E,d=>Math.abs(x(d[0])+x.bandwidth()/2-px));
      V.focus(bars,b=>b===d); tp.show(`<b>${d[0]}</b> · ${f1(d[1]/1e6)} milions de registres`); },()=>{ V.focus(bars,null); tp.hide(); });
  });
})();

/* =====================================================================
   V4 · MAP-16 + MAP-06 · L'ORENETA VULGAR MES A MES
   ===================================================================== */
(function oreneta(){
  const box=$("#or-viz"), rng=$("#or-rng"), lab=$("#or-mes"), play=$("#or-play"); if(!box||!D)return;
  const O=D.oreneta;
  const r=d3.scaleSqrt([0,400],[0,1]).clamp(true);
  const lg=$("#or-lg");
  let mon=5, api=null, timer=null;
  function setMon(v,fromRng){ mon=v; const k=Math.round(((v-1)%12+12)%12)+1; if(lab)lab.textContent=MESOS[k-1]; if(rng&&!fromRng){ rng.value=k; } if(rng)rng.setAttribute("aria-valuetext",MESOS[k-1]); if(api)api.draw(v); }
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*1.05,vh*.58):Math.min(w*.72,vh*.68,660));
    const st=stage(el,h);
    const proj=amerProj(w,h,mob?4:10);
    const {ctx}=mkCanvas(st,w,h,"Mapa animat d'Amèrica: a l'estiu del nord, l'oreneta vulgar ocupa els Estats Units i el Canadà; a l'hivern del nord, és a l'Amèrica del Sud, sobretot a l'Argentina, el Brasil i el Perú, i a la primavera i la tardor passa per Mèxic i Amèrica Central.");
    const P=O.map(c=>proj([c[0],c[1]]));
    const R=Math.max(4,kmPx(proj,[-90,0],156*.95)); // radi màxim ≈ mitja cel·la
    if(lg){ lg.innerHTML=""; const vals=[50,200,400], rr=vals.map(v=>Math.max(1.5,r(v)*R)), W=vals.length*46, HH=2*rr[2]+18;
      const d=d3.select(lg).append("div").attr("class","ibv-lg"); d.append("div").attr("class","ibv-lg-t").text("Part dels registres que són d'oreneta");
      const sv=d.append("svg").attr("width",W).attr("height",HH);
      vals.forEach((v,i)=>{ sv.append("circle").attr("cx",i*46+14).attr("cy",rr[2]+1).attr("r",rr[i]).attr("fill",V.alpha(C.blue,.5));
        sv.append("text").attr("x",i*46+14).attr("y",HH-2).attr("text-anchor","middle").attr("font-size",11).attr("fill",C.ink2).text(f1(v/100)+" %"); }); }
    let LAND=null;
    const s=overlay(st,w,h), g=s.append("g");
    function draw(v){
      ctx.clearRect(0,0,w,h);
      if(LAND){ ctx.beginPath(); d3.geoPath(proj,ctx)(LAND); ctx.fillStyle=C.land; ctx.fill(); }
      const m0=Math.floor(v-1+12)%12, m1=(m0+1)%12, t=(v-1)-Math.floor(v-1);
      ctx.globalCompositeOperation=DARK?"source-over":"multiply";
      for(let i=0;i<O.length;i++){
        const a=O[i][2+m0], b=O[i][2+m1];
        if(a<0&&b<0)continue;
        const f=(a<0?b:b<0?a:a+(b-a)*t);
        const p=P[i];
        if(f<=0){ ctx.fillStyle=V.alpha(C.ink,.12); ctx.fillRect(p[0]-.6,p[1]-.6,1.2,1.2); continue; }
        ctx.beginPath(); ctx.arc(p[0],p[1],Math.max(.8,r(f)*R),0,6.2832); ctx.fillStyle=V.alpha(C.blue,.5); ctx.fill();
      }
      ctx.globalCompositeOperation="source-over";
      const k=Math.round(((v-1)%12+12)%12);
      g.selectAll(".mes").data([k]).join("text").attr("class","mes").attr("x",mob?10:18).attr("y",mob?28:40)
        .attr("font-family",V.SERIF).attr("font-size",mob?22:30).attr("fill",C.ink).text(MESOS[k]);
    }
    // context
    [["Equador",[-160,0]]].forEach(([t,ll])=>{ const a=proj([-170,0]), b=proj([-30,0]);
      g.append("line").attr("x1",a[0]).attr("x2",b[0]).attr("y1",a[1]).attr("y2",b[1]).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","2 3").attr("opacity",.6);
      V.t(g,a[0]+(mob?4:10),a[1]-5,t,{size:11.5,italic:true,fill:C.ink2,halo:2.5}); });
    api={draw};
    land50().then(L=>{ LAND=landIn(L,-180,-20,-60,85); draw(mon); }).catch(()=>{});
    draw(mon);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    const hv=s.append("g").attr("pointer-events","none");
    const del=d3.Delaunay.from(P);
    V.hover(hit.node(),(ev,[px,py])=>{
      const i=del.find(px,py); const p=P[i]; hv.selectAll("*").remove();
      if(Math.hypot(p[0]-px,p[1]-py)>(mob?24:16)){ tp.hide(); return; }
      const k=Math.round(((mon-1)%12+12)%12), v=O[i][2+k];
      hv.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",Math.max(4,r(Math.max(0,v))*R)+2).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.1);
      const lat=O[i][1], lon=O[i][0];
      tp.show(v<0?`${MESOS[k]} · poques dades en aquesta cel·la`:`<b>${f1(v/100)} %</b> dels registres d'eBird de ${MESOS[k]} són d'oreneta · cel·la de ${f0(Math.abs(lat))}° ${lat>=0?"N":"S"}, ${f0(Math.abs(lon))}° O`);
    },()=>{ hv.selectAll("*").remove(); tp.hide(); });
    V.onView(el,inst=>{ if(!inst&&!timer)startPlay(1); });
  });
  function startPlay(from){
    stopPlay(); let v=from||mon; if(play)play.textContent="Atura";
    if(V.reduced){ setMon(Math.round(v)); return; }
    let last=0;
    timer=d3.timer(e=>{ const dt=e-last; last=e; v+=dt/1100; if(v>=12.999){ stopPlay(); setMon(12); return; } setMon(v); });
  }
  function stopPlay(){ if(timer){ timer.stop(); timer=null; } if(play)play.textContent="Reprodueix l'any →"; }
  if(play)play.addEventListener("click",()=>{ if(timer)stopPlay(); else startPlay(1); });
  if(rng)rng.addEventListener("input",()=>{ stopPlay(); setMon(+rng.value,true); });
})();

/* =====================================================================
   V5 · LA CURSA CAP AL NORD (Europa, 1990–2008)
   ===================================================================== */
(function cursa(){
  const box=$("#cu-viz"), btn=$("#cu-play"); if(!box)return;
  const R=[{k:"t",n:"Temperatura",km:249,c:C.yellow,w:6},{k:"p",n:"Papallones",km:114,c:C.blueLight,w:4},{k:"o",n:"Ocells",km:37,c:C.blue,w:4}];
  const lg=$("#cu-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,R.map(d=>({c:d.c,t:d.n,kind:"line",w:d.w}))); }
  let api=null;
  V.mount(box,(el,w)=>{
    const mob=w<640, h=mob?Math.round(w*1.05):Math.min(560,Math.round(w*.62));
    const st=stage(el,h);
    const proj=d3.geoConicConformal().parallels([40,60]).rotate([-12,0]).fitExtent([[6,6],[w-6,h-6]],{type:"MultiPoint",coordinates:mob?[[4,44],[16,44],[4,51],[16,51]]:[[0,43.5],[20,43.5],[0,51.5],[20,51.5]]});
    const {ctx}=mkCanvas(st,w,h,"Mapa d'Europa amb tres fletxes cap al nord que surten del mateix punt: la temperatura s'ha desplaçat 249 km, les comunitats de papallones 114 km i les d'ocells només 37 km.");
    land50().then(L=>{ ctx.beginPath(); d3.geoPath(proj,ctx)(landIn(L,-30,180,30,75)); ctx.fillStyle=C.land; ctx.fill(); }).catch(()=>{});
    const s=overlay(st,w,h), g=s.append("g");
    [["París",[2.35,48.86]],["Berlín",[13.40,52.52]],["Milà",[9.19,45.46]],["Viena",[16.37,48.21]]].forEach(([n,ll])=>{ const p=proj(ll); if(p[0]<8||p[0]>w-8||p[1]<8||p[1]>h-8)return;
      g.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",2.2).attr("fill",C.ink2); V.t(g,p[0]+5,p[1]+4,n,{size:11.5,fill:C.ink2,halo:2.5}); });
    const O=[9.5,46.2]; // punt arbitrari a la serralada dels Alps
    const pO=proj(O);
    const top=d=>proj([O[0],O[1]+d.km/111.2]);
    const dx=mob?[-50,0,50]:[-90,0,90];
    const arr=R.map((d,i)=>{ const p1=top(d); const x=pO[0]+dx[i];
      const gg=g.append("g");
      const ln=gg.append("line").attr("x1",x).attr("x2",x).attr("y1",pO[1]).attr("y2",pO[1]).attr("stroke",d.c).attr("stroke-width",d.w).attr("stroke-linecap","round");
      const hd=gg.append("path").attr("d",`M${x-7},${pO[1]+2}L${x},${pO[1]-8}L${x+7},${pO[1]+2}Z`).attr("fill",d.k==="t"?C.yellowDark:d.c);
      const lb=gg.append("g").style("opacity",0);
      if(i===0)V.lines(lb,x,p1[1]-30,[[d.n,true],[`${f0(d.km)} km`]],{anchor:"middle",size:mob?11.5:13,halo:3.5}); else V.lines(lb,x+12,p1[1]-2,[[d.n,true],[`${f0(d.km)} km`]],{anchor:"start",size:mob?11.5:13,halo:3.5});
      return {d,ln,hd,lb,x,y1:p1[1]}; });
    gg0(); function gg0(){ g.append("circle").attr("cx",pO[0]).attr("cy",pO[1]).attr("r",3).attr("fill",C.ink); V.t(g,pO[0],pO[1]+18,"1990",{anchor:"middle",size:12,weight:700,halo:3}); }
    // deute dels ocells
    const db=g.append("g").style("opacity",0);
    { const xb=pO[0]+dx[0]-14, y0=arr[2].y1, y1=arr[0].y1;
      db.append("path").attr("d",`M${xb+4},${y0}H${xb}V${y1}H${xb+4}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","3 2");
      db.append("line").attr("x1",xb+4).attr("x2",arr[2].x).attr("y1",y0).attr("y2",y0).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","1 3");
      V.lines(db,xb-6,(y0+y1)/2+2,[["Deute climàtic",true],["dels ocells:"],["212 km"]],{anchor:"end",size:mob?11.5:12.5,halo:3.5}); }
    // escala 100 km
    { const a=proj([-6,38.2]), b=proj([-6,38.2+100/111.2]); const L=Math.abs(a[1]-b[1]), x=mob?14:24, y=h-(mob?18:26);
      g.append("path").attr("d",`M${x},${y}H${x+L}M${x},${y-4}V${y}M${x+L},${y-4}V${y}`).attr("stroke",C.ink2).attr("fill","none");
      V.t(g,x+L+6,y+1,"100 km",{size:11.5,fill:C.ink2,halo:true}); }
    function run(inst){
      const T=inst||V.reduced?0:2600;
      arr.forEach(a=>{ a.ln.interrupt().attr("y2",pO[1]).transition().duration(T).ease(d3.easeCubicOut).attr("y2",a.y1+(a.d.k==="t"?6:4));
        a.hd.interrupt().attr("transform","translate(0,0)").transition().duration(T).ease(d3.easeCubicOut).attr("transform",`translate(0,${a.y1-pO[1]})`);
        a.lb.interrupt().style("opacity",0).transition().delay(T*.85).duration(400).style("opacity",1); });
      db.interrupt().style("opacity",0).transition().delay(T+200).duration(500).style("opacity",1);
    }
    api={run};
    V.onView(el,inst=>run(inst));
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ const a=d3.least(arr,a=>Math.abs(a.x-px)); if(Math.abs(a.x-px)>30){ tp.hide(); return; }
      tp.show(a.d.k==="t"?"<b>Temperatura</b> · 249 km cap al nord entre el 1990 i el 2008":`<b>${a.d.n}</b> · la comunitat s'ha desplaçat l'equivalent de ${a.d.km} km; ${249-a.d.km} km per darrere de la temperatura`); },()=>tp.hide());
  });
  if(btn)btn.addEventListener("click",()=>{ if(api)api.run(false); });
})();

/* =====================================================================
   V6 · CASE-01 · QUI HA PERDUT OCELLS I QUI N'HA GUANYAT (1970–2017)
   ===================================================================== */
(function biomes(){
  const box=$("#bi-viz"); if(!box||!D)return;
  const B=D.biomes;
  const lg=$("#bi-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Perd ocells"},{c:C.blue,t:"En guanya"},{c:V.alpha(C.ink2,.35),t:"Interval del 95 %",kind:"line",w:6}]); }
  V.mount(box,(el,w)=>{
    const mob=w<640, ml=mob?8:170, mr=mob?54:70, rowH=mob?50:34, top=28;
    const h=top+B.length*rowH+30;
    const s=V.svg(el,w,h,"Canvi del nombre d'ocells per hàbitat de cria entre el 1970 i el 2017: els prats perden 717 milions (−53 %), el bosc boreal 501 milions, i només les zones humides en guanyen, 21 milions (+13 %).");
    const x=d3.scaleLinear([-800,60],[ml,w-mr]);
    const g=s.append("g");
    (mob?[-800,-400,0]:[-800,-600,-400,-200,0]).forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",top-6).attr("y2",h-24).attr("stroke",v===0?C.ink:C.grid);
      V.t(g,x(v),h-8,(v===0?"0":f0(v))+(v===-800?" milions":""),{anchor:v===-800?"start":"middle",size:11,fill:C.muted}); });
    const rows=g.selectAll("g.r").data(B).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${top+i*rowH+(mob?rowH-16:rowH/2)})`);
    rows.each(function(d){ const r=d3.select(this), c=d[2]<0?C.red:C.blue;
      V.t(r,mob?ml:ml-12,mob?-16:4,d[0],{anchor:mob?"start":"end",size:12.5,weight:600,halo:mob?3:false});
      r.append("line").attr("class","ci").attr("x1",x(0)).attr("x2",x(0)).attr("stroke",V.alpha(c,.3)).attr("stroke-width",6).attr("stroke-linecap","round");
      r.append("line").attr("class","st").attr("x1",x(0)).attr("x2",x(0)).attr("stroke",C.ghost).attr("stroke-width",.9).attr("stroke-dasharray","2 2");
      r.append("circle").attr("class","pt").attr("cx",x(0)).attr("r",5).attr("fill",c);
      V.t(r,w-mr+8,4,(d[5]>0?"+":"−")+f1(Math.abs(d[5]))+" %",{size:12.5,weight:700}).attr("class","pc").style("opacity",0); });
    V.onView(el,inst=>{ const T=inst?0:900;
      rows.select(".ci").transition().duration(T).attr("x1",d=>x(d[3])).attr("x2",d=>x(d[4]));
      rows.select(".st").transition().duration(T).attr("x2",d=>x(d[2]));
      rows.select(".pt").transition().duration(T).attr("cx",d=>x(d[2]));
      rows.select(".pc").transition().delay(T*.8).duration(300).style("opacity",1); });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=clamp(Math.floor((py-top)/rowH),0,B.length-1), d=B[i];
      V.focus(rows,r=>r===d); tp.show(`<b>${d[0]}</b> · ${d[1]} espècies · ${d[2]>0?"+":"−"}${f1(Math.abs(d[2]))} milions (${d[2]>0?"+":"−"}${f1(Math.abs(d[5]))} %)`); },()=>{ V.focus(rows,null); tp.hide(); });
  });
})();

/* =====================================================================
   V7 · MAP-01 + MAP-11 · ELS ITINERARIS DEL SOCC (relleu de Catalunya)
   ===================================================================== */
// MAP-01 copiat de web/sistema/mapes-b.js (IB59_BANDS … relleu59)
const IB59_BANDS=[[200,[243,242,239]],[500,[235,233,228]],[800,[226,223,216]],[1500,[216,212,204]],[2200,[206,202,193]],[Infinity,[196,191,182]]];
const IB59_COAST="#ABA8A1", IB59_LAKE="#AEC6E6";
function dem59(D){
  if(D.__dec)return D.__dec;
  const s=atob(D.b64), a=new Float32Array(s.length), k=(D.mx-D.mn)/254;
  for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i)*k+D.mn;
  const z=(lon,lat)=>{ const fx=(lon-D.lon0)/D.st-.5, fy=(D.lat1-lat)/D.st-.5;
    if(fx<0||fy<0||fx>D.nx-1||fy>D.ny-1)return NaN;
    const i=Math.floor(fx), j=Math.floor(fy), u=fx-i, v=fy-j, i1=Math.min(i+1,D.nx-1), j1=Math.min(j+1,D.ny-1);
    return (a[j*D.nx+i]*(1-u)+a[j*D.nx+i1]*u)*(1-v)+(a[j1*D.nx+i]*(1-u)+a[j1*D.nx+i1]*u)*v; };
  return (D.__dec={z,grid:a,D});
}
function iso59(D,th){
  const {grid}=dem59(D), out=[];
  for(const c of d3.contours().size([D.nx,D.ny]).thresholds(th)(grid)){
    const lines=[];
    for(const poly of c.coordinates)for(const ring of poly){
      let seg=[];
      for(const [gx,gy] of ring){
        if(gx<=.05||gx>=D.nx-1.05||gy<=.05||gy>=D.ny-1.05){ if(seg.length>1)lines.push(seg); seg=[]; }
        else seg.push([D.lon0+(gx+.5)*D.st, D.lat1-(gy+.5)*D.st]);
      }
      if(seg.length>1)lines.push(seg);
    }
    out.push({v:c.value,geo:{type:"MultiLineString",coordinates:lines}});
  }
  return out;
}
function relleu59(ctx,proj,w,h,D,o){
  o=o||{};
  const {z}=dem59(D), pth=d3.geoPath(proj,ctx);
  const land=o.land||null, sea=o.sea==null?0:o.sea;
  const iso=o.iso||(D.mx>1500?[500,1000,1500,2000,2500,3000]:[300,600,900,1200]);
  const sc=o.res||1, fw=Math.ceil(w/sc), fh=Math.ceil(h/sc);
  const fc=document.createElement("canvas"); fc.width=fw; fc.height=fh;
  const fx=fc.getContext("2d"), im=fx.createImageData(fw,fh), d=im.data;
  const kmLon=111.32*Math.cos(((D.lat1-D.ny*D.st/2)*Math.PI)/180), dd=D.st*1.12;
  for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
    const ll=proj.invert([(x+.5)*sc,(y+.5)*sc]); if(!ll)continue;
    const zz=z(ll[0],ll[1]); if(zz!==zz)continue;
    if(!land&&zz<=sea)continue;
    const gx=(z(ll[0]+dd,ll[1])-z(ll[0]-dd,ll[1]))/(2*dd*kmLon), gy=(z(ll[0],ll[1]+dd)-z(ll[0],ll[1]-dd))/(2*dd*111.32);
    const shade=(gx!==gx||gy!==gy)?0:clamp((-gx+gy)*.65/98,-1,1)*15;
    let r,g,b;
    if(zz<0){ const t=clamp(-zz/420,0,1); r=234-t*48; g=240-t*32; b=248-t*12; }
    else { const band=IB59_BANDS.find(q=>zz<q[0])[1]; r=band[0]; g=band[1]; b=band[2]; }
    const i=(y*fw+x)*4; d[i]=clamp(r+shade,0,255); d[i+1]=clamp(g+shade,0,255); d[i+2]=clamp(b+shade,0,255); d[i+3]=255;
  }
  fx.putImageData(im,0,0);
  ctx.save();
  if(land){ ctx.beginPath(); pth(land); ctx.clip(); }
  ctx.imageSmoothingEnabled=true; ctx.drawImage(fc,0,0,w,h);
  iso59(D,land?[0,...iso]:iso).forEach(c=>{
    ctx.beginPath(); pth(c.geo);
    if(c.v===0){ ctx.strokeStyle=V.alpha(C.blue,.48); ctx.lineWidth=.85; ctx.setLineDash([3,2.5]); }
    else { ctx.strokeStyle=V.alpha(C.ink,.14); ctx.lineWidth=.55; ctx.setLineDash([]); }
    ctx.stroke();
  });
  ctx.setLineDash([]); ctx.restore();
  ctx.beginPath();
  if(land)pth(land); else iso59(D,[sea+.01]).forEach(c=>pth(c.geo));
  ctx.strokeStyle=IB59_COAST; ctx.lineWidth=.9; ctx.lineJoin="round"; ctx.stroke();
  if(o.fade){
    const a=proj([D.lon0,D.lat1]), b=proj([D.lon0+D.nx*D.st,D.lat1-D.ny*D.st]);
    const x0=Math.max(0,Math.min(a[0],b[0])), x1=Math.min(w,Math.max(a[0],b[0])), y0=Math.max(0,Math.min(a[1],b[1])), y1=Math.min(h,Math.max(a[1],b[1]));
    const L=Math.min(x1-x0,y1-y0)*(o.fadeK||.09);
    ctx.save(); ctx.globalCompositeOperation="destination-out";
    const side=(gx0,gy0,gx1,gy1,rx,ry,rw,rh)=>{ const g=ctx.createLinearGradient(gx0,gy0,gx1,gy1); g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,1)"); ctx.fillStyle=g; ctx.fillRect(rx,ry,rw,rh); };
    if(o.fade.includes("e"))side(x1-L,0,x1,0,x1-L,-2,w-x1+L+2,h+4);
    if(o.fade.includes("o"))side(x0+L,0,x0,0,-2,-2,x0+L+2,h+4);
    if(o.fade.includes("n"))side(0,y0+L,0,y0,-2,-2,w+4,y0+L+2);
    if(o.fade.includes("s"))side(0,y1-L,0,y1,-2,y1-L,w+4,h-y1+L+2);
    ctx.restore();
  }
  return {z};
}
(function socc(){
  const box=$("#so-viz"); if(!box||!D||!window.CAT_DEM)return;
  const S=D.socc, nAct=S.filter(d=>d[1]).length;
  const lg=$("#so-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:`Amb voluntari (${nAct})`,kind:"line",w:2.4},{c:C.ink2,t:`Esperen voluntari (${S.length-nAct})`,kind:"line",w:1.6,dash:"2 2"}]); }
  const LL=[{n:"Barcelona",ll:[2.170,41.387],a:"start"},{n:"Girona",ll:[2.821,41.979],a:"start"},{n:"Lleida",ll:[0.620,41.617],a:"start"},{n:"Tarragona",ll:[1.245,41.119],a:"start"},{n:"Tortosa",ll:[0.521,40.812],a:"start"}];
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(mob?w*1.0:Math.min(w*.74,640));
    const st=stage(el,h);
    const proj=d3.geoMercator().fitExtent([[mob?2:8,mob?4:8],[w-(mob?2:8),h-(mob?4:8)]],{type:"MultiPoint",coordinates:[[0.16,40.5],[3.35,42.88]]});
    const {c:cv,ctx}=mkCanvas(st,w,h,`Mapa físic de Catalunya amb els ${S.length} itineraris del SOCC: ${nAct} tenen voluntari i ${S.length-nAct} l'esperen, sobretot a les Terres de l'Ebre, la Terra Alta i el Pirineu occidental.`);
    relleu59(ctx,proj,w,h,window.CAT_DEM,{fade:"neso"});
    const s=overlay(st,w,h), g=s.append("g"), gL=s.append("g");
    const line=d3.line(); const P=S.map(d=>d[2].map(p=>proj(p)));
    const inact=g.append("g"), act=g.append("g");
    S.forEach((d,i)=>{ (d[1]?act:inact).append("path").attr("d",line(P[i])).attr("fill","none").attr("stroke",d[1]?C.red:C.ink2).attr("stroke-width",d[1]?(mob?2:2.4):(mob?1.4:1.6)).attr("stroke-linecap","round").attr("stroke-dasharray",d[1]?null:"2 2").attr("stroke-opacity",d[1]?.9:.75).datum(i); });
    LL.filter(d=>!mob||d.n!=="Tortosa").forEach(d=>{ const p=proj(d.ll); gL.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",2.6).attr("fill",C.ink); V.t(gL,p[0]+7,p[1]+4,d.n,{anchor:d.a,size:V.FS.label,weight:600,halo:3}); });
    [["Mar Mediterrani",[2.55,40.95]],["Pirineu",[1.25,42.72]]].forEach(([t,ll])=>{ const p=proj(ll); V.t(gL,p[0],p[1],t,{italic:true,fill:C.muted,size:V.FS.small,anchor:"middle",halo:2.5}); });
    { const a=proj([1.6,40.62]), b=proj([1.6+50/(111.32*Math.cos(40.62*Math.PI/180)),40.62]), x=proj([0.35,40.6])[0], y=h-(mob?12:18), px=b[0]-a[0];
      gL.append("path").attr("d",`M${x},${y-4}V${y}H${x+px}V${y-4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1);
      V.t(gL,x+px+6,y+1,"50 km",{size:V.FS.small,fill:C.ink2,halo:true}); }
    V.onView(el,inst=>{ if(inst)return; act.selectAll("path").style("opacity",0).transition().delay(()=>Math.random()*1200).duration(300).style("opacity",1);
      inact.style("opacity",0).transition().delay(1300).duration(600).style("opacity",1); });
    const C2=S.map((d,i)=>{ const p=P[i]; return [d3.mean(p,q=>q[0]),d3.mean(p,q=>q[1])]; });
    const del=d3.Delaunay.from(C2);
    const tp=V.tip(el), hv=s.append("g").attr("pointer-events","none"), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=del.find(px,py), q=C2[i]; hv.selectAll("*").remove();
      if(Math.hypot(q[0]-px,q[1]-py)>(mob?22:16)){ tp.hide(); return; }
      hv.append("path").attr("d",line(P[i])).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",4.5).attr("stroke-linecap","round").attr("stroke-opacity",.35);
      tp.show(`<b>${S[i][0]}</b> · ${S[i][1]?"té voluntari":"espera voluntari"}`); },()=>{ hv.selectAll("*").remove(); tp.hide(); });
  });
})();

/* =====================================================================
   V8 · CASE-05 · INDICADORS D'HÀBITAT DEL SOCC (2002 = 100)
   ===================================================================== */
(function indicadors(){
  const box=$("#in-viz"); if(!box||!D)return;
  const ORD=["Forestals","Agrícoles","Zones humides","Zones obertes naturals","Secans de caire estèpic"];
  const NOM={"Forestals":"Ocells de bosc","Agrícoles":"Ocells de conreus","Zones humides":"Zones humides","Zones obertes naturals":"Prats i matollars","Secans de caire estèpic":"Secans estèpics"};
  const COL={"Forestals":C.greenDark,"Secans de caire estèpic":C.red};
  const BAND={"Forestals":C.green,"Secans de caire estèpic":C.red};
  V.mount(box,(el,w)=>{
    const mob=w<640, cols=mob?2:5, gapX=mob?14:22, cw=(w-gapX*(cols-1))/cols, ch=mob?150:190, rowsN=Math.ceil(ORD.length/cols);
    const RH=ch+60, h=rowsN*RH;
    const s=V.svg(el,w,h,"Cinc gràfics petits amb l'índex d'abundància del SOCC entre el 2002 i el 2024: ocells de bosc +9 %, conreus −4 %, zones humides −17 %, prats i matollars −34 % i secans estèpics −43 %.");
    const y=d3.scaleLinear([30,135],[ch,0]), x=d3.scaleLinear([2002,2024],[0,cw-(mob?42:44)]);
    const panels=[];
    ORD.forEach((k,i)=>{
      const S=D.indicadors[k]; if(!S)return;
      const gx=(i%cols)*(cw+gapX), gy=Math.floor(i/cols)*RH+30;
      const g=s.append("g").attr("transform",`translate(${gx},${gy})`);
      V.t(g,0,-14,NOM[k],{size:12.5,weight:700});
      [50,100].forEach(v=>{ g.append("line").attr("x1",0).attr("x2",x(2024)).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v===100?C.ink:C.grid).attr("stroke-width",v===100?.8:1);
        if(i%cols===0)V.t(g,0,y(v)-4,String(v),{size:11,fill:C.muted}); });
      [2002,2024].forEach(v=>V.t(g,x(v),ch+16,String(v),{size:11,fill:C.muted,anchor:v===2002?"start":"end"}));
      const col=COL[k]||C.ink2, band=BAND[k]||C.ink2;
      g.append("path").attr("d",d3.area().x(d=>x(d[0])).y0(d=>y(d[2])).y1(d=>y(d[3])).curve(d3.curveMonotoneX)(S)).attr("fill",V.alpha(band,.16));
      const ln=g.append("path").attr("d",d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX)(S)).attr("fill","none").attr("stroke",col).attr("stroke-width",2);
      const last=S[S.length-1], pc=last[1]-100;
      g.append("circle").attr("cx",x(last[0])).attr("cy",y(last[1])).attr("r",3).attr("fill",col);
      V.t(g,x(last[0])+5,y(last[1])+4,(pc>0?"+":"−")+f0(Math.abs(pc))+" %",{size:12,weight:700,halo:3});
      const hv=g.append("g").attr("pointer-events","none");
      panels.push({k,S,g,ln,hv,gx,gy});
    });
    V.onView(el,inst=>{ if(inst)return; panels.forEach((p,i)=>{ const n=p.ln.node().getTotalLength(); p.ln.attr("stroke-dasharray",`${n} ${n}`).attr("stroke-dashoffset",n).transition().delay(i*150).duration(1100).attr("stroke-dashoffset",0).on("end",function(){ d3.select(this).attr("stroke-dasharray",null); }); }); });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{
      const p=panels.find(p=>px>=p.gx-gapX/2&&px<=p.gx+cw+gapX/2&&py>=p.gy-30&&py<=p.gy+ch+14);
      panels.forEach(q=>q.hv.selectAll("*").remove());
      if(!p){ tp.hide(); return; }
      const yr=clamp(Math.round(x.invert(px-p.gx)),2002,2024), d=p.S.find(d=>d[0]===yr); if(!d){ tp.hide(); return; }
      p.hv.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",0).attr("y2",ch).attr("stroke",C.ink).attr("stroke-width",.6);
      p.hv.append("circle").attr("cx",x(yr)).attr("cy",y(d[1])).attr("r",3.5).attr("fill",C.paper).attr("stroke",C.ink);
      tp.show(`<b>${NOM[p.k]}</b> · ${yr}: índex ${f1(d[1])} (interval ${f0(d[2])}–${f0(d[3])})`);
    },()=>{ panels.forEach(q=>q.hv.selectAll("*").remove()); tp.hide(); });
  });
})();

})();
