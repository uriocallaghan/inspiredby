/* «Qui va dibuixar el mapa d'Haití?» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-illa    MAP-01 + MAP-03  Mapa físic d'Haití: falla, epicentre, ciutats i la gent que editava el mapa
   V2 #f-carrers MAP-01 + MAP-15 + TIME-01  Un mes dibuixant Port-au-Prince (15.167 vies reals d'OSM, hora a hora)
   V3 #f-onades  TIME-08  Persones que editen OSM cada dia després de quatre desastres
   V4 #s-4636    LINK-03  El flux de missatges de la Missió 4636
   V5 #f-tasques MAP-16 sobre MAP-01  Simulació del Tasking Manager: estigmèrgia
   Colors: vermell = el que fan els voluntaris; blau = el que ja hi havia / qui valida; groc només en superfícies. */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.HT_DATA;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const MESOS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const deMes=m=>(/^[aeiou]/.test(MESOS[m])?"d'":"de ")+MESOS[m];
const dateOf=(t0,i)=>new Date(Date.parse(t0+"T00:00:00Z")+i*864e5);
const fDate=d=>`${d.getUTCDate()} ${deMes(d.getUTCMonth())}`;
const QUAKE=Date.UTC(2010,0,12,21,53);              // 16.53 hora local (UTC−5), USGS
const EPI=[-72.571,18.443];                         // USGS usp000h60h
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// en mode fosc, els cercles translúcids se sumen en clar (screen) en lloc d'enfosquir-se (multiply)
const BLEND=window.IBTheme&&IBTheme.dark?"screen":"multiply";

/* ---------- MAP-01 · relleu (copiat de web/sistema/mapes-b.js, sense canvis) ---------- */
const IB59_BANDS=[[200,[243,242,239]],[500,[235,233,228]],[800,[226,223,216]],[1500,[216,212,204]],[2200,[206,202,193]],[Infinity,[196,191,182]]];
const IB59_COAST="#ABA8A1";
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
  const sea=o.sea==null?0:o.sea;
  const iso=o.iso||(D.mx>1500?[500,1000,1500,2000,2500,3000]:[300,600,900,1200]);
  const sc=o.res||1, fw=Math.ceil(w/sc), fh=Math.ceil(h/sc);
  const fc=document.createElement("canvas"); fc.width=fw; fc.height=fh;
  const fx=fc.getContext("2d"), im=fx.createImageData(fw,fh), d=im.data;
  const kmLon=111.32*Math.cos(((D.lat1-D.ny*D.st/2)*Math.PI)/180), dd=D.st*1.12;
  for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
    const ll=proj.invert([(x+.5)*sc,(y+.5)*sc]); if(!ll)continue;
    const zz=z(ll[0],ll[1]); if(zz!==zz)continue;
    if(zz<=sea)continue;
    const gx=(z(ll[0]+dd,ll[1])-z(ll[0]-dd,ll[1]))/(2*dd*kmLon), gy=(z(ll[0],ll[1]+dd)-z(ll[0],ll[1]-dd))/(2*dd*111.32);
    const shade=(gx!==gx||gy!==gy)?0:clamp((-gx+gy)*.65/98,-1,1)*15;
    const band=IB59_BANDS.find(q=>zz<q[0])[1];
    const i=(y*fw+x)*4; d[i]=clamp(band[0]+shade,0,255); d[i+1]=clamp(band[1]+shade,0,255); d[i+2]=clamp(band[2]+shade,0,255); d[i+3]=255;
  }
  fx.putImageData(im,0,0);
  ctx.save(); ctx.imageSmoothingEnabled=true; ctx.drawImage(fc,0,0,w,h);
  iso59(D,iso).forEach(c=>{ ctx.beginPath(); pth(c.geo); ctx.strokeStyle=V.alpha(C.ink,.14); ctx.lineWidth=.55; ctx.stroke(); });
  ctx.restore();
  ctx.beginPath(); iso59(D,[sea+.01]).forEach(c=>pth(c.geo));
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

/* ---------- ajudants ---------- */
// projecció de l'àrea de Port-au-Prince: amplada sencera i alçada màxima (si cal, retalla pel centre)
function papProj(w,maxH){
  const proj=d3.geoMercator().fitWidth(w,{type:"MultiPoint",coordinates:[[-72.42,18.48],[-72.22,18.62]]});
  const b0=proj([-72.42,18.62]), b1=proj([-72.22,18.48]), full=b1[1]-b0[1], h=Math.round(Math.min(full,maxH));
  proj.translate([proj.translate()[0]-b0[0], proj.translate()[1]-b0[1]-(full-h)/2]);
  return {proj,h};
}
function mkCanvas(el,w,h,label){
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.className="ibv"; c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0`;
  if(label){ c.setAttribute("role","img"); c.setAttribute("aria-label",label); } else c.setAttribute("aria-hidden","true");
  el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx,dpr};
}
function overlay(el,w,h){
  const s=d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
    .attr("aria-hidden","true").style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS);
  return s;
}
function stage(el,h){ d3.select(el).selectAll(":scope>svg,:scope>canvas,:scope>.stage").remove(); const st=document.createElement("div"); st.className="stage"; st.style.cssText=`position:relative;height:${h}px`; el.insertBefore(st,el.firstChild); return st; }
function scaleBar(g,proj,lon,lat,km,x,y){
  const a=proj([lon,lat]), b=proj([lon+km/(111.32*Math.cos(lat*Math.PI/180)),lat]), px=b[0]-a[0];
  g.append("path").attr("d",`M${x},${y-4}V${y}H${x+px}V${y-4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1);
  V.t(g,x+px+6,y+1,`${km} km`,{size:V.FS.small,fill:C.ink2,halo:true});
}

/* =====================================================================
   V1 · MAP-01 + MAP-03 · L'ILLA, LA FALLA I LA GENT QUE EDITAVA EL MAPA (scrolly)
   ===================================================================== */
(function illa(){
  const box=$("#illa-viz"), stepsEl=$("#s-illa .steps"); if(!box||!window.HT_DEM)return;
  let cur=0, api=null;
  // traça aproximada del sistema de falles d'Enriquillo–Plantain Garden (esquema a partir de USGS i Calais et al. 2010)
  const FAULT=[[-74.45,18.31],[-74.0,18.33],[-73.55,18.36],[-73.1,18.40],[-72.8,18.43],[-72.55,18.45],[-72.3,18.47],[-72.05,18.49],[-71.75,18.50]];
  const CITIES=[
    {n:"Port-au-Prince",ll:[-72.3395,18.5473],a:"start",dx:8,dy:-6,big:true},
    {n:"Léogâne",ll:[-72.6334,18.5111],a:"end",dx:-8,dy:-6},
    {n:"Petit-Goâve",ll:[-72.8653,18.4326],a:"end",dx:-8,dy:14},
    {n:"Jacmel",ll:[-72.5375,18.2352],a:"start",dx:8,dy:4},
    {n:"Cap-Haïtien",ll:[-72.2008,19.7595],a:"start",dx:8,dy:4,far:true},
    {n:"Gonaïves",ll:[-72.6884,19.4460],a:"end",dx:-8,dy:4,far:true},
    {n:"Les Cayes",ll:[-73.7511,18.1944],a:"start",dx:8,dy:4,far:true}
  ];
  const N0=D.unique31.haitiAnyAbans, N1=D.unique31.haiti;
  api=V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.78,vh*.40):Math.min(w*.8,vh*.74));
    const st=stage(el,h);
    const proj=d3.geoMercator().fitExtent([[mob?2:10,mob?4:10],[w-(mob?2:10),h-(mob?4:10)]],{type:"MultiPoint",coordinates:[[-74.5,17.98],[-71.62,20.1]]});
    const {c:rcv,ctx}=mkCanvas(st,w,h,"Globus terrestre centrat al Carib que s'acosta fins al mapa físic d'Haití en relleu, amb la falla d'Enriquillo–Plantain Garden, l'epicentre del terratrèmol del 12 de gener de 2010 a 25 km a l'oest de Port-au-Prince i les principals ciutats afectades.");
    relleu59(ctx,proj,w,h,window.HT_DEM,{fade:"e",iso:[500,1000,1500,2000]});
    // frontera amb la República Dominicana (Natural Earth 1:110 m)
    V.world().then(W=>{ const p=d3.geoPath(proj,ctx); ctx.save(); ctx.setLineDash([3,3]); ctx.strokeStyle=V.alpha(C.ink2,.55); ctx.lineWidth=.8;
      ctx.beginPath(); p(W.borders); ctx.stroke(); ctx.restore(); }).catch(()=>{});
    // capa del globus (pas 0): el món en terra plana (MAP-19/MAP-18) que fa zoom fins a l'illa
    const {c:wcv,ctx:wc}=mkCanvas(st,w,h,null);
    st.insertBefore(wcv,rcv); // el globus va a sota: el relleu hi creix a sobre i el cobreix
    rcv.style.transformOrigin="0 0"; rcv.style.willChange="transform,opacity";
    const C0=[-73.06,19.04], m0=proj(C0);
    const s=overlay(st,w,h), g0=s.append("g"), g=s.append("g");
    const ROT=[72.4,-19], R0=Math.min(w,h)/2-(mob?6:10);
    const gProj=d3.geoOrthographic().rotate(ROT).clipAngle(90).precision(.3);
    const tProj=d3.geoOrthographic().rotate(ROT).fitExtent([[mob?2:10,mob?4:10],[w-(mob?2:10),h-(mob?4:10)]],{type:"MultiPoint",coordinates:[[-74.5,17.98],[-71.62,20.1]]});
    const K0=R0, K1=tProj.scale(), T0=[w/2,h/2], T1=tProj.translate(), grat=d3.geoGraticule().step([15,15])();
    let Wd=null, HTI=null, z=cur>=1?1:0, zt=null;
    function paint(){
      const e=d3.easeCubicInOut(z), k=Math.exp(Math.log(K0)+(Math.log(K1)-Math.log(K0))*e);
      gProj.scale(k).translate([T0[0]+(T1[0]-T0[0])*e,T0[1]+(T1[1]-T0[1])*e]);
      // el relleu viatja amb el globus: mateixa escala i mateix punt d'ancoratge, i es fon a sobre mentre creix
      const sc=k/K1, o=gProj(C0), tx=o[0]-sc*m0[0], ty=o[1]-sc*m0[1], id=!Wd||e>=.999;
      rcv.style.transform=id?"":`translate(${tx}px,${ty}px) scale(${sc})`;
      g.attr("transform",id?null:`translate(${tx},${ty}) scale(${sc})`);
      const wa=Wd?1-clamp((e-.4)/.4,0,1):0, ra=Wd?clamp((e-.25)/.4,0,1):1;
      wcv.style.opacity=wa; rcv.style.opacity=ra; g.style("opacity",Wd?clamp((e-.8)/.2,0,1):1); g0.style("opacity",Wd?1-clamp(e*3,0,1):0);
      wc.clearRect(0,0,w,h); if(!Wd||wa<=0)return;
      const p=d3.geoPath(gProj,wc);
      wc.globalAlpha=1-e; wc.strokeStyle=C.hair; wc.lineWidth=.55; wc.beginPath(); p(grat); wc.stroke(); wc.globalAlpha=1;
      wc.fillStyle=C.land; wc.beginPath(); p(Wd.land); wc.fill();
      wc.strokeStyle=C.landEdge; wc.lineWidth=.6; wc.beginPath(); p(Wd.borders); wc.stroke();
      if(HTI){ wc.globalAlpha=1-clamp((e-.15)/.3,0,1); wc.fillStyle=C.red; wc.beginPath(); p(HTI); wc.fill(); wc.globalAlpha=1; }
      wc.strokeStyle=C.hair; wc.lineWidth=1; wc.beginPath(); p({type:"Sphere"}); wc.stroke();
    }
    function zoomTo(t,instant){
      if(zt){ zt.stop(); zt=null; }
      if(instant||V.reduced||!Wd){ z=t; paint(); return; }
      const z0=z, T=2200*Math.abs(t-z0); if(T<1){ z=t; paint(); return; }
      zt=d3.timer(el=>{ const q=Math.min(1,el/T); z=z0+(t-z0)*q; paint(); if(q>=1){ zt.stop(); zt=null; } });
    }
    V.world().then(W=>{ Wd=W; HTI=W.countries.features.find(f=>+f.id===332)||null;
      // noms del globus (posicions fixes en la vista inicial)
      const gp=d3.geoOrthographic().rotate(ROT).scale(K0).translate(T0);
      [["Amèrica del Nord",[-100,43]],["Amèrica del Sud",[-60,-10]],["Oceà Atlàntic",[-40,33]],["Oceà Pacífic",[-112,6]]].forEach(([t,ll])=>{ const q=gp(ll);
        V.t(g0,q[0],q[1],t,{italic:t.startsWith("Oceà"),size:mob?11:12.5,fill:C.muted,anchor:"middle",halo:2.5}); });
      const hp=gp([-72.6,19.0]);
      g0.append("circle").attr("cx",hp[0]).attr("cy",hp[1]).attr("r",mob?8:11).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.2);
      V.note(g0,{x:hp[0]+3,y:hp[1]-3,tx:hp[0]+(mob?30:56),ty:hp[1]+(mob?30:46),anchor:"start",lines:[["Haití",true],[mob?"al mar Carib":"a l'illa de l'Espanyola, al mar Carib"]],size:mob?11.5:12.5});
      paint(); }).catch(()=>{ Wd=null; paint(); });
    // noms de context
    const ctxLab=[["Haití",[-72.2,19.12],13.5],["República Dominicana",[-71.85,19.25],12,"R. Dominicana"],["Mar Carib",[-73.4,17.98+.12],12.5],["Oceà Atlàntic",[-73.0,20.02],12.5],["Golf de la Gonâve",[-73.35,18.95],11.5]];
    ctxLab.forEach(([t,ll,sz,ts])=>{ if(mob&&t==="Golf de la Gonâve")return; const p=proj(ll); V.t(g,p[0]-(mob&&ts?14:0),p[1],mob&&ts?ts:t,{italic:t!=="Haití",serif:t==="Haití",weight:t==="Haití"?600:400,size:mob?Math.min(sz,11.5):sz,fill:t==="Haití"?C.ink2:C.muted,anchor:"middle",halo:2.5}); });
    scaleBar(g,proj,-74.3,18.05,50,mob?8:14,h-(mob?8:14));
    // capes que canvien amb els passos
    const L={fault:g.append("g"), epi:g.append("g"), city:g.append("g"), box:g.append("g"), ppl:g.append("g")};
    const line=d3.line().curve(d3.curveCatmullRom.alpha(.5));
    L.fault.append("path").attr("d",line(FAULT.map(proj))).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.3).attr("stroke-dasharray","5 4").attr("stroke-opacity",.85);
    { const p=proj([-73.85,18.33]); V.t(L.fault,p[0],p[1]+16,mob?"Falla d'Enriquillo":"Falla d'Enriquillo–Plantain Garden (traça aproximada)",{size:mob?11:11.5,italic:true,fill:C.ink2,halo:2.5}); }
    const ep=proj(EPI), R=mob?26:46;
    const pulse=L.epi.append("g");
    [1,.66,.36].forEach((k,i)=>pulse.append("circle").attr("class","pl").attr("cx",ep[0]).attr("cy",ep[1]).attr("r",R*k)
      .attr("fill",i===2?C.red:C.yellow).attr("fill-opacity",i===2?.32:.3).style("mix-blend-mode",BLEND));
    L.epi.append("circle").attr("cx",ep[0]).attr("cy",ep[1]).attr("r",2.6).attr("fill",C.ink);
    V.note(L.epi,{x:ep[0]-4,y:ep[1]+4,tx:ep[0]-(mob?30:60),ty:ep[1]+(mob?R+14:R+26),anchor:"end",
      lines:mob?[["M 7,0",true],["16.53 h"]]:[["Epicentre · magnitud 7,0",true],["12 de gener, 16.53 h · 13 km de fondària"]],size:mob?11.5:12.5});
    CITIES.forEach(c=>{ if(mob&&c.far)return; const p=proj(c.ll);
      L.city.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",c.big?3.4:2.4).attr("fill",c.far?C.ink2:C.ink);
      V.t(L.city,p[0]+c.dx,p[1]+c.dy,c.n,{anchor:c.a,size:c.big?13:11.5,weight:c.big?700:500,fill:c.far?C.ink2:C.ink,halo:3}); });
    { const a=proj([-72.42,18.62]), b=proj([-72.22,18.48]);
      L.box.append("rect").attr("x",a[0]).attr("y",a[1]).attr("width",b[0]-a[0]).attr("height",b[1]-a[1]).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","3 2.5");
      if(!mob)V.t(L.box,b[0]+6,a[1]+2,"Àrea del gràfic següent",{size:11.5,fill:C.ink2,italic:true,halo:2.5,base:"hanging"}); }
    // la gent: 1 punt = 1 persona que va editar Haití a OpenStreetMap (dades ohsome)
    const cols=mob?26:32, gap=mob?4.6:6.2, rr=mob?1.55:2.1;
    const gx0=mob?10:22, gy0=mob?16:30;
    const ppl=d3.range(N1).map(i=>({i,x:gx0+(i%cols)*gap,y:gy0+Math.floor(i/cols)*gap}));
    L.ppl.selectAll("circle").data(ppl).join("circle").attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",rr)
      .attr("fill",d=>d.i<N0?C.blue:C.red).attr("fill-opacity",d=>d.i<N0?.85:.62).style("mix-blend-mode",BLEND).attr("opacity",0);
    const pTxt=L.ppl.append("g");
    const rowsN=Math.ceil(N1/cols), yEnd=gy0+rowsN*gap+(mob?10:14);
    pTxt.append("text").attr("class","p0");
    // aplica l'estat del pas actual
    el.__set=(k,instant)=>{
      const T=instant||V.reduced?0:700;
      const vis=(sel,on)=>sel.interrupt().transition().duration(T).style("opacity",on?1:0);
      zoomTo(k>=1?1:0,instant);
      vis(L.fault,k>=2&&k<=3); vis(L.epi,k>=2&&k<=3); vis(L.city,k>=3); vis(L.box,k===3);
      vis(L.ppl,k>=4);
      L.ppl.selectAll("circle").interrupt().transition().duration(T).delay(d=>T?(d.i<N0?d.i*6:(k>=5?Math.min(1400,(d.i-N0)*2.2):0)):0)
        .attr("opacity",d=>k>=5||d.i<N0?1:0);
      pTxt.selectAll("*").remove();
      if(k>=4){
        const lines=k>=5?[[`${f0(N1)} persones`,true,C.red],["en els 31 dies després del sisme"],[`(en blau, les ${N0} de l'any anterior)`]]
                         :[[`${N0} persones`,true,C.blue],["van editar Haití a OpenStreetMap"],["en tot l'any anterior"]];
        const yy=k>=5?yEnd:gy0+Math.ceil(N0/cols)*gap+(mob?10:14);
        V.lines(pTxt,gx0,yy+2,lines,{size:mob?11.5:12.5,halo:3});
      }
      if(T&&k>=2&&k<=3){ pulse.selectAll("circle.pl").attr("r",0).transition().duration(1400).ease(d3.easeCubicOut).attr("r",(d,i)=>R*[1,.66,.36][i]); }
    };
    el.__set(cur,true);
    V.onView(el,instant=>{ if(instant)return; st.style.opacity=0; d3.select(st).transition().duration(800).style("opacity",1); });
  });
  IB.scrolly(stepsEl,$("#s-illa .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V2 · MAP-01 + MAP-15 + TIME-01 · UN MES DIBUIXANT PORT-AU-PRINCE
   15.167 vies reals d'OSM: cada una apareix a l'hora en què es va afegir.
   ===================================================================== */
(function carrers(){
  const box=$("#carrers-viz"), ser=$("#carrers-ser"), rng=$("#carrers-rng"), play=$("#carrers-play"), lab=$("#carrers-lab");
  if(!box||!window.PAP_RD)return;
  const RD=window.PAP_RD, S=RD.s, WAYS=RD.w;
  // descodifica una sola vegada: [h, x, y, dx, dy, ...] → llista de [lon,lat]
  const ways=WAYS.map(r=>{ const pts=[]; let x=r[1], y=r[2]; pts.push([RD.x0+x*S, RD.y0+y*S]);
    for(let i=3;i<r.length;i+=2){ x+=r[i]; y+=r[i+1]; pts.push([RD.x0+x*S, RD.y0+y*S]); } return {h:r[0],pts}; });
  const pre=ways.filter(d=>d.h<0), post=ways.filter(d=>d.h>=0);   // post ja és en ordre d'hora
  const HMAX=31*24;
  let tH=HMAX, playing=false, raf=0, mapApi=null, serApi=null;
  const FRESH=14;   // hores que una via nova es queda en vermell
  const nUpTo=h=>d3.bisector(d=>d.h).right(post,h);
  const kmDay=D.papRoadKm, t0i=Math.round((Date.UTC(2010,0,12)-Date.parse(D.papT0+"T00:00:00Z"))/864e5); // índex del 12 de gener
  const usersH=D.haiti.users, t0u=Math.round((Date.UTC(2010,0,12)-Date.parse(D.haiti.t0+"T00:00:00Z"))/864e5);
  const fmtT=h=>{ const d=new Date(QUAKE+h*36e5), lh=(d.getUTCHours()+24-5)%24, ld=new Date(QUAKE+h*36e5-5*36e5); return `${fDate(ld)}, ${lh} h`; };

  mapApi=V.mount(box,(el,w)=>{
    const mob=w<640;
    const {proj,h}=papProj(w,Math.max(300,(window.innerHeight||800)*(mob?.62:.72)));
    const st=stage(el,h);
    // capa 1: relleu (estàtic)
    const {ctx:rc}=mkCanvas(st,w,h,null);
    relleu59(rc,proj,w,h,window.PAP_DEM,{iso:[100,200,300,400,500,600,700,800,900,1000,1100],fade:"neso",fadeK:.05});
    // capa 2: carrers, redibuixada
    const {c:cv,ctx,dpr}=mkCanvas(st,w,h,`Mapa de Port-au-Prince amb les ${f0(ways.length)} vies d'OpenStreetMap: ${pre.length} existien abans del terratrèmol (en blau) i ${f0(post.length)} es van afegir en els 31 dies següents (en vermell quan són noves i en gris després).`);
    // capa auxiliar: vies «velles» acumulades (es dibuixen incrementalment)
    const acc=document.createElement("canvas"); acc.width=cv.width; acc.height=cv.height; const ax=acc.getContext("2d"); ax.scale(dpr,dpr);
    const P=ways.map(d=>{ const p=new Path2D(); d.pts.forEach((q,i)=>{ const xy=proj(q); if(i)p.lineTo(xy[0],xy[1]); else p.moveTo(xy[0],xy[1]); }); return p; });
    const idx=new Map(ways.map((d,i)=>[d,i]));
    let accN=0;
    const lwOld=mob?.5:.6, lwNew=mob?1:1.25;
    function addOld(n){ ax.strokeStyle=V.alpha(C.ink,.5); ax.lineWidth=lwOld; ax.lineJoin="round"; ax.lineCap="round";
      for(let i=accN;i<n;i++)ax.stroke(P[idx.get(post[i])]); accN=n; }
    function resetOld(){ ax.setTransform(1,0,0,1,0,0); ax.clearRect(0,0,acc.width,acc.height); ax.setTransform(dpr,0,0,dpr,0,0); accN=0; }
    const preP=new Path2D(); pre.forEach(d=>preP.addPath(P[idx.get(d)]));
    el.__draw=h0=>{
      const nAll=nUpTo(h0), nOld=nUpTo(h0-FRESH);
      if(nOld<accN)resetOld(); addOld(nOld);
      ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); ctx.drawImage(acc,0,0); ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.lineJoin="round"; ctx.lineCap="round";
      for(let i=nOld;i<nAll;i++){ const a=1-(h0-post[i].h)/FRESH; ctx.strokeStyle=V.alpha(C.red,.35+.6*a); ctx.lineWidth=lwOld+(lwNew-lwOld)*a; ctx.stroke(P[idx.get(post[i])]); }
      ctx.strokeStyle=V.alpha(C.blue,.95); ctx.lineWidth=mob?1.1:1.4; ctx.stroke(preP);
      return nAll;
    };
    // etiquetes
    const s=overlay(st,w,h), g=s.append("g");
    [["Port-au-Prince",[-72.3395,18.5473],"start",8,-8,13,700],["Pétion-Ville",[-72.2860,18.5132],"start",7,12,12,500],["Carrefour",[-72.4092,18.5345],"start",7,-7,12,500],
     ["Cité Soleil",[-72.3355,18.5783],"end",-7,-6,11.5,500],["Aeroport",[-72.2960,18.5790],"start",7,4,11.5,400]].forEach(([n,ll,a,dx,dy,sz,wt])=>{
      if(mob&&(n==="Cité Soleil"||n==="Aeroport"))return; const p=proj(ll);
      g.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",2.4).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",1.2);
      V.t(g,p[0]+dx,p[1]+dy,n,{anchor:a,size:mob?Math.min(sz,12):sz,weight:wt,halo:3.2}); });
    { const p=proj([-72.39,18.595]); V.t(g,p[0],p[1],"Badia de Port-au-Prince",{italic:true,size:mob?11:12,fill:C.muted,anchor:"middle",halo:2.5}); }
    scaleBar(g,proj,-72.41,18.49,mob?2:5,w-(mob?92:150),h-(mob?10:16));
    const clock=g.append("g");
    el.__clock=(h0,n)=>{ clock.selectAll("*").remove();
      const x=mob?8:16, y=mob?h-44:h-58;
      V.t(clock,x,y,h0<0?"12 de gener, abans del sisme":fmtT(h0),{size:mob?12:13.5,weight:700,halo:3.4});
      V.t(clock,x,y+(mob?16:19),`${f0(pre.length+n)} vies al mapa · ${f0(n)} de noves`,{size:mob?11.5:12.5,fill:C.ink2,halo:3.4}); };
    const n=el.__draw(tH); el.__clock(tH,n);
  });

  // sèrie: km de vies a l'àrea (dalt) i persones que editen Haití cada dia (baix)
  serApi=V.mount(ser,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, m={l:mob?36:46,r:mob?8:14,t:18,b:22}, rh=mob?58:66, gap=26, h=m.t+rh*2+gap+m.b;
    const s=V.svg(el,w,h,"Dues sèries diàries del 12 de gener al 12 de febrer de 2010: els quilòmetres de vies a l'àrea de Port-au-Prince passen de 364 a més de 2.800, i les persones que editen Haití cada dia arriben a 131."), g=s.append("g");
    const days=d3.range(0,32), x=d3.scaleLinear([0,32],[m.l,w-m.r]);
    const km=days.map(d=>({d,v:kmDay[t0i+d]})), us=days.map(d=>({d,v:usersH[t0u+d]||0}));
    const yK=d3.scaleLinear([0,3000],[m.t+rh,m.t]), yU=d3.scaleLinear([0,140],[m.t+rh*2+gap,m.t+rh+gap]);
    [0,1000,2000,3000].forEach((v,i)=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",yK(v)).attr("y2",yK(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,yK(v)+4,f0(v),{anchor:"end",size:V.FS.small,fill:C.muted}); });
    [0,50,100].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",yU(v)).attr("y2",yU(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,yU(v)+4,f0(v),{anchor:"end",size:V.FS.small,fill:C.muted}); });
    V.t(g,m.l,m.t-6,"Quilòmetres de vies a l'àrea de Port-au-Prince",{size:12,weight:600,fill:C.ink2});
    V.t(g,m.l,m.t+rh+gap-6,"Persones que editen Haití a OpenStreetMap aquell dia",{size:12,weight:600,fill:C.ink2});
    g.append("path").datum(km).attr("d",d3.area().x(d=>x(d.d)).y0(yK(0)).y1(d=>yK(d.v)).curve(d3.curveMonotoneX)).attr("fill",V.alpha(C.ink,.07));
    g.append("path").datum(km).attr("d",d3.line().x(d=>x(d.d)).y(d=>yK(d.v)).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6);
    const bw=Math.max(2,(x(1)-x(0))*.55);
    g.append("g").selectAll("rect").data(us).join("rect").attr("x",d=>x(d.d+.5)-bw/2).attr("width",bw).attr("y",d=>yU(d.v)).attr("height",d=>yU(0)-yU(d.v)).attr("fill",C.red).attr("fill-opacity",.75);
    [0,7,14,21,28].forEach(d=>{ const dt=dateOf("2010-01-12",d); V.t(g,x(d),h-6,fDate(dt).replace(" de gener"," gen").replace(" de febrer"," febr"),{anchor:d?"middle":"start",size:V.FS.small,fill:C.muted}); });
    const pk=d3.greatest(us,d=>d.v);
    if(!mob)V.note(g,{x:x(pk.d+.5),y:yU(pk.v)-4,tx:x(17),ty:yU(pk.v)-4,kind:"straight",anchor:"start",lines:[[`${pk.v} persones, el màxim`,true],[fDate(dateOf("2010-01-12",pk.d))]],size:11.5});
    const cur=g.append("line").attr("y1",m.t-2).attr("y2",yU(0)).attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","2 2");
    el.__cur=h0=>cur.attr("x1",x(clamp(h0+21.9,0,32*24)/24)).attr("x2",x(clamp(h0+21.9,0,32*24)/24));
    el.__cur(tH);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
    V.hover(hit.node(),(ev,[px])=>{ const d=clamp(Math.round(x.invert(px)),0,32), dt=dateOf("2010-01-12",d);
      tp.show(`<b>${fDate(dt)} de 2010</b> · ${f0(kmDay[t0i+d])} km de vies a les 00 h · ${usersH[t0u+d]||0} persones editant Haití`);
      if(ev.type==="pointerdown"){ stop(); set(Math.max(0,d*24-21.9)); }
    },()=>tp.hide());
  });

  function set(h0){ tH=clamp(h0,0,HMAX); rng.value=(tH/24).toFixed(2); rng.setAttribute("aria-valuetext",fmtT(tH));
    if(box.__draw){ const n=box.__draw(tH); box.__clock(tH,n); } if(ser.__cur)ser.__cur(tH); }
  function stop(){ playing=false; cancelAnimationFrame(raf); play.textContent="Reprodueix →"; }
  function start(){ if(tH>=HMAX-.5)set(0); playing=true; play.textContent="Pausa"; let last=0;
    const tick=now=>{ if(!playing)return; const dt=last?Math.min(64,now-last):16; last=now; set(tH+dt*HMAX/22000); if(tH>=HMAX){ stop(); return; } raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); }
  rng.addEventListener("input",()=>{ stop(); set(+rng.value*24); });
  play.addEventListener("click",()=>playing?stop():start());
  // en entrar a la pantalla, s'anima sol des del moment del sisme
  V.onView(box,instant=>{ if(instant){ set(HMAX); return; } set(0); setTimeout(start,450); },{threshold:.45});
})();

/* =====================================================================
   V3 · TIME-08 · CADA DESASTRE, MÉS MANS (files de bombolles, dades reals)
   ===================================================================== */
(function onades(){
  const box=$("#onades-viz"); if(!box)return;
  const ROWS=[
    {k:"haiti",n:"Haití",y:"2010",off:42-20,q:"12 de gener"},
    {k:"haiyan",n:"Filipines (Haiyan)",ns:"Haiyan",y:"2013",off:0,q:"8 de novembre"},
    {k:"nepal",n:"Nepal",y:"2015",off:0,q:"25 d'abril"},
    {k:"turquia",n:"Turquia i Síria",ns:"Turquia–Síria",y:"2023",off:0,q:"6 de febrer"}
  ].map(r=>{ const u=D[r.k].users.slice(r.off,r.off+80); return Object.assign(r,{days:u.map((v,i)=>({d:i-20,v,r})),tot:D.unique31[r.k],t0:D[r.k].t0}); });
  const lg=$("#onades-lg");
  const Rr=d3.scaleSqrt([0,1600],[0,15]);
  if(lg){ lg.innerHTML=""; V.legendSize(lg,{title:"Persones que editen la zona aquell dia",values:[100,500,1500],r:Rr,f:f0}); }
  V.mount(box,(el,w)=>{
    const mob=w<640, rh=mob?64:62, m={t:26,l:mob?8:128,r:mob?8:132,b:24}, h=m.t+ROWS.length*rh+m.b;
    const s=V.svg(el,w,h,"Una fila per desastre (Haití 2010, Haiyan 2013, Nepal 2015, Turquia i Síria 2023). Cada cercle és un dia, de 20 dies abans a 59 dies després, i la seva àrea és el nombre de persones que van editar OpenStreetMap a la zona. Haití no va passar de 131 persones al dia; Nepal i Turquia en van superar les 1.400."), g=s.append("g");
    const x=d3.scaleLinear([-20,59],[m.l+8,w-m.r-8]), k=mob?.62:1;
    // dia del desastre
    g.append("line").attr("x1",x(0)).attr("x2",x(0)).attr("y1",m.t-8).attr("y2",h-m.b+4).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
    V.t(g,x(0),m.t-12,"Dia del desastre",{anchor:"middle",size:V.FS.small,fill:C.ink2,weight:600});
    [-20,30,59].forEach(d=>V.t(g,x(d),h-6,d<0?`${d} dies`:`+${d} dies`,{anchor:d<0?"start":d>50?"end":"middle",size:V.FS.small,fill:C.muted}));
    const rows=g.selectAll("g.row").data(ROWS).join("g").attr("class","row").attr("transform",(d,i)=>`translate(0,${m.t+rh*(i+.55)})`);
    rows.append("line").attr("x1",x(-20)).attr("x2",x(59)).attr("stroke",C.grid).attr("stroke-width",.6);
    rows.each(function(r){ const gr=d3.select(this);
      if(mob){ V.t(gr,0,-rh*.36,`${r.ns||r.n} · ${r.y}`,{size:12.5,weight:700}); V.t(gr,w,-rh*.36,`${f0(r.tot)} el primer mes`,{size:11.5,anchor:"end",fill:C.ink2}); }
      else { V.t(gr,0,-2,r.n,{size:13,weight:700,serif:true}); V.t(gr,0,14,r.y,{size:12,fill:C.ink2});
        V.t(gr,w-m.r+18,-2,f0(r.tot),{size:14,weight:700,fill:r.k==="haiti"?C.red:C.ink}); V.t(gr,w-m.r+18,14,"persones, primer mes",{size:11.5,fill:C.muted}); }
      gr.selectAll("circle").data(r.days.slice().sort((a,b)=>b.v-a.v)).join("circle")
        .attr("cx",d=>x(d.d)).attr("cy",0).attr("r",0)
        .attr("fill",d=>d.d<0?C.blue:C.red).attr("fill-opacity",d=>d.d<0?.3:.34).style("mix-blend-mode",BLEND);
    });
    const bub=g.selectAll("g.row circle");
    const grow=instant=>bub.transition().duration(instant?0:900).delay(d=>instant?0:Math.max(0,d.d+20)*14+ROWS.indexOf(d.r)*120).attr("r",d=>Math.max(d.v>0?.9:0,Rr(d.v)*k));
    V.onView(el,grow);
    if(!mob){ const r=ROWS[2], pk=d3.greatest(r.days,d=>d.v), y=m.t+rh*(2.55);
      V.note(g,{x:x(pk.d)+Rr(pk.v)*.7,y:y-Rr(pk.v)*.7,tx:x(pk.d)+60,ty:y-rh*.62,kind:"curve",bend:12,anchor:"start",lines:[[`${f0(pk.v)} persones en un dia`,true],[fDate(dateOf(r.t0,pk.d+20))+" de 2015"]],size:12}); }
    const tp=V.tip(el), H=g.append("g").attr("pointer-events","none"), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=clamp(Math.floor((py-m.t)/rh),0,ROWS.length-1), r=ROWS[i], d=clamp(Math.round(x.invert(px)),-20,59), o=r.days[d+20];
      H.selectAll("*").remove(); const cy=m.t+rh*(i+.55);
      H.append("circle").attr("cx",x(d)).attr("cy",cy).attr("r",Math.max(3,Rr(o.v)*k)+2).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
      V.focus(g.selectAll("g.row"),q=>q===r);
      const dt=dateOf(r.t0,d+20);
      tp.show(`<b>${r.n}, ${fDate(dt)} de ${dt.getUTCFullYear()}</b> · ${f0(o.v)} persones · ${d<0?`${-d} dies abans`:d===0?"el dia del desastre":`${d} dies després`}`);
    },()=>{ tp.hide(); H.selectAll("*").remove(); V.focus(g.selectAll("g.row"),null); });
  });
})();

/* =====================================================================
   V4 · LINK-03 · 4636: UN SMS QUE TRAVESSA EL MÓN (scrolly)
   Xifres reals (Munro 2013): 80.000 missatges i 45.000 informes.
   ===================================================================== */
(function sms(){
  const box=$("#sms-viz"), stepsEl=$("#s-4636 .steps"); if(!box)return;
  let cur=0;
  const NODES=[
    {id:"ht",col:0,v:80,t:"Missatges des d'Haití",s:"80.000 SMS al 4636",c:C.ink},
    {id:"mh",col:1,v:80,t:"Traduïts i situats al mapa",s:"per voluntaris i treballadors pagats",c:C.red},
    {id:"rp",col:2,v:45,t:"Informes únics i útils",s:"45.000, amb lloc i categoria",c:C.blue},
    {id:"dp",col:2,v:35,t:"Repetits o sense acció",s:"≈35.000",c:C.ghost}
  ];
  const LINKS=[["ht","mh",80],["mh","rp",45],["mh","dp",35]]
    .map(([a,b,v])=>({s:NODES.find(n=>n.id===a),t:NODES.find(n=>n.id===b),v}));
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(mob?Math.min(330,vh*.40):Math.min(520,vh*.7)), nw=4;
    const st=stage(el,h);
    const m=mob?{t:18,b:10,l:4,r:4}:{t:26,b:16,l:150,r:178};
    const X=[m.l,(m.l+w-m.r)/2-nw/2,w-m.r-nw], inner=h-m.t-m.b, pad=mob?18:26;
    const k=(inner-pad*2)/80;
    [0,1,2].forEach(ci=>{ const col=NODES.filter(n=>n.col===ci), tot=d3.sum(col,n=>n.v)*k, pd=col.length>1?Math.min(pad*1.4,(inner-tot)/(col.length-1)):0;
      let y=m.t+(inner-tot-pd*(col.length-1))/2; col.forEach(n=>{ n.x=X[ci]; n.y0=y; n.h=n.v*k; y+=n.h+pd; }); });
    NODES.forEach(n=>{ let y=n.y0; LINKS.filter(l=>l.s===n).forEach(l=>{ l.sy=y; l.w=l.v*k; y+=l.w; }); y=n.y0; LINKS.filter(l=>l.t===n).forEach(l=>{ l.ty=y; y+=l.v*k; }); });
    LINKS.forEach(l=>{ l.x0=l.s.x+nw+1; l.x1=l.t.x-1; l.xm=(l.x0+l.x1)/2; });
    const band=l=>`M${l.x0},${l.sy}C${l.xm},${l.sy} ${l.xm},${l.ty} ${l.x1},${l.ty}L${l.x1},${l.ty+l.w}C${l.xm},${l.ty+l.w} ${l.xm},${l.sy+l.w} ${l.x0},${l.sy+l.w}Z`;
    const {ctx}=mkCanvas(st,w,h,null);
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Diagrama de flux de la Missió 4636: 80.000 missatges enviats des d'Haití són traduïts i situats al mapa per persones, i en surten 45.000 informes únics amb lloc i categoria.");
    const g=s.append("g");
    const LB=g.append("g").selectAll("path").data(LINKS).join("path").attr("d",band)
      .attr("fill",l=>l.t.col===2?l.t.c:l.t.c).attr("fill-opacity",l=>l.t.id==="dp"?.18:.13).style("mix-blend-mode",BLEND);
    const ND=g.append("g").selectAll("rect").data(NODES).join("rect").attr("x",n=>n.x).attr("y",n=>n.y0).attr("width",nw).attr("height",n=>n.h).attr("rx",2).attr("fill",n=>n.id==="dp"?C.muted:n.c);
    const LG=g.append("g");
    NODES.forEach(n=>{ const side=n.col===0?"l":n.col===2?"r":"m";
      let xx=side==="l"?n.x-10:side==="r"?n.x+nw+10:n.x+nw+8, a=side==="l"?"end":"start", yy=n.y0+n.h/2;
      if(mob){ if(side==="l"){ xx=n.x+nw+6; a="start"; yy=n.y0+10; } else if(side==="r"){ xx=n.x-6; a="end"; } else { xx=n.x+nw/2; a="middle"; } }
      const q=LG.append("g").datum(n);
      if(mob&&side==="m"){ V.t(q,xx,n.y0-4,n.t,{anchor:a,size:11,weight:700,halo:3}); return; }
      V.t(q,xx,yy-3,n.t,{anchor:a,size:mob?11.5:12.5,weight:700,fill:n.id==="rp"?C.blue:n.id==="ht"?C.ink:C.ink,halo:3});
      V.t(q,xx,yy+12,n.s,{anchor:a,size:mob?10.5:11.5,fill:C.ink2,halo:3});
    });
    // partícules lentes: 1 partícula ≈ 100 missatges
    const NS=48, rnd=V.rng(4636);
    const bez=(a,b,c2,d,t)=>{ const u=1-t; return u*u*u*a+3*u*u*t*b+3*u*t*t*c2+t*t*t*d; };
    LINKS.forEach(l=>{ l.P=d3.range(Math.max(3,Math.round(l.v*(mob?3:6)))).map(()=>({t:rnd(),o:(.1+rnd()*.8),sp:(.8+rnd()*.5)/28000})); });
    let foc=null;
    function frame(t,dt){
      ctx.clearRect(0,0,w,h);
      for(const l of LINKS){ const on=!foc||foc(l); ctx.fillStyle=l.t.id==="dp"?C.muted:l.t.id==="rp"?C.blue:C.red;
        for(const p of l.P){ p.t=(p.t+dt*p.sp)%1; const tt=p.t;
          const x=bez(l.x0,l.xm,l.xm,l.x1,tt), y=bez(l.sy,l.sy,l.ty,l.ty,tt)+p.o*l.w;
          const fade=Math.min(1,tt/.08,(1-tt)/.08);
          ctx.globalAlpha=(on?.75:.12)*fade; ctx.beginPath(); ctx.arc(x,y,mob?1.1:1.4,0,6.2832); ctx.fill(); } }
      ctx.globalAlpha=1;
    }
    el.__loop=V.loop(el,frame);
    el.__set=(kk)=>{
      const F=[null,l=>l.s.id==="ht",l=>l.s.col===1,l=>l.t.id==="rp"][kk]||null;
      foc=F; LB.transition().duration(500).attr("fill-opacity",l=>(!F||F(l))?(l.t.id==="dp"?.2:.16):.04);
      const nodeOn=[null,n=>n.col<=1,n=>n.col===1,n=>n.id==="rp"][kk];
      LG.selectAll("g").transition().duration(500).style("opacity",n=>!nodeOn||nodeOn(n)?1:.46);
      if(V.reduced)frame(0,0);
    };
    el.__set(cur);
  });
  IB.scrolly(stepsEl,$("#s-4636 .graphic"),i=>{ cur=i; if(box.__set)box.__set(i); });
})();

/* =====================================================================
   V5 · MAP-16 sobre MAP-01 · COM S'ORGANITZEN MIL DESCONEGUTS SENSE CAP (simulació)
   Mecanisme real del Tasking Manager de HOT: l'àrea es divideix en cel·les; cada persona
   en bloqueja una de lliure, la dibuixa i l'allibera; una persona amb experiència la valida.
   Els temps i el nombre de voluntaris són de simulació.
   ===================================================================== */
(function tasques(){
  const box=$("#tasques-viz"), rng=$("#tasques-rng"), play=$("#tasques-play"), out=$("#tasques-out");
  if(!box||!window.PAP_DEM)return;
  const lg=$("#tasques-lg");
  if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.yellow,t:"Algú la dibuixa ara",a:.75},{c:C.red,t:"Dibuixada",a:.5},{c:C.blue,t:"Validada",a:.55}]); }
  let N=+rng.value, sim=null, running=false;
  const {z}=dem59(window.PAP_DEM);
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640;
    const {proj,h}=papProj(w,Math.max(300,(window.innerHeight||800)*(mob?.6:.68)));
    const st=stage(el,h);
    const {ctx:rc}=mkCanvas(st,w,h,null);
    relleu59(rc,proj,w,h,window.PAP_DEM,{iso:[200,400,600,800,1000],fade:"neso",fadeK:.05});
    const {ctx}=mkCanvas(st,w,h,"Simulació: Port-au-Prince cobert de cel·les hexagonals que es van dibuixant (vermell) i validant (blau) a mesura que voluntaris imaginaris agafen cel·les lliures.");
    const R=mob?10:17, hx=d3.range(0,w+R*2,R*Math.sqrt(3)), cells=[];
    for(let j=0,y=R;y<h+R;j++,y+=R*1.5)for(const x0 of hx){ const x=x0+(j%2?R*Math.sqrt(3)/2:0), ll=proj.invert([x,y]);
      if(!ll)continue; const zz=z(ll[0],ll[1]); if(!(zz>12)||x<R*.4||x>w-R*.4||y>h-R*.4)continue; cells.push({x,y,s:0,t:0,who:0}); }
    const hexP=new Path2D(); d3.range(6).forEach(i=>{ const a=Math.PI/180*(60*i-30); const px=(R-.8)*Math.cos(a), py=(R-.8)*Math.sin(a); i?hexP.lineTo(px,py):hexP.moveTo(px,py); }); hexP.closePath();
    function reset(){ cells.forEach(c=>{ c.s=0; c.t=0; }); sim={h:0,busy:0}; }
    if(!sim)reset(); else { sim={h:0,busy:0}; }
    const rnd=V.rng(2010);
    function stepSim(dh){
      // cada voluntari lliure agafa una cel·la lliure (estat 0) o, si és validador, una de dibuixada (estat 2)
      const nVal=Math.max(1,Math.round(N/8)), nMap=N-nVal;
      let mapping=0, validating=0;
      cells.forEach(c=>{ if(c.s===1||c.s===3){ c.t-=dh; if(c.t<=0){ c.s=c.s===1?2:4; } else if(c.s===1)mapping++; else validating++; } });
      const free=cells.filter(c=>c.s===0), done=cells.filter(c=>c.s===2);
      for(let i=mapping;i<nMap&&free.length;i++){ const c=free.splice(Math.floor(rnd()*free.length),1)[0]; c.s=1; c.t=1.2+rnd()*2.6; }
      for(let i=validating;i<nVal&&done.length;i++){ const c=done.splice(Math.floor(rnd()*done.length),1)[0]; c.s=3; c.t=.5+rnd()*1; }
      sim.h+=dh;
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      for(const c of cells){ ctx.save(); ctx.translate(c.x,c.y);
        if(c.s===0){ ctx.strokeStyle=V.alpha(C.ink,.16); ctx.lineWidth=.6; ctx.stroke(hexP); }
        else { ctx.fillStyle=c.s===1?V.alpha(C.yellow,.72):c.s===2?V.alpha(C.red,.42):c.s===3?V.alpha(C.yellow,.72):V.alpha(C.blue,.48); ctx.fill(hexP); }
        ctx.restore(); }
      const nD=cells.filter(c=>c.s>=2).length, nV=cells.filter(c=>c.s===4).length;
      out.innerHTML=`<span><b>${f0(sim.h)} hores</b> simulades · ${f0(nD)} de ${f0(cells.length)} cel·les dibuixades · ${f0(nV)} validades</span>`;
    }
    el.__reset=()=>{ reset(); draw(); };
    el.__loop=V.loop(el,(t,dt)=>{ if(!running)return draw(); stepSim(dt/1000*4); draw(); if(cells.every(c=>c.s===4)){ running=false; play.textContent="Torna a començar →"; } });
    draw();
  });
  rng.addEventListener("input",()=>{ N=+rng.value; $("#tasques-n").textContent=f0(N); rng.setAttribute("aria-valuetext",`${f0(N)} voluntaris`); });
  play.addEventListener("click",()=>{ if(running){ running=false; play.textContent="Continua →"; return; }
    if(play.textContent.startsWith("Torna")&&box.__reset)box.__reset(); running=true; play.textContent="Pausa"; });
  V.onView(box,instant=>{ if(!instant){ running=true; play.textContent="Pausa"; } },{threshold:.5});
})();

})();
