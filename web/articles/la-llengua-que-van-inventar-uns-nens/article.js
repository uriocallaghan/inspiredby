/* «La llengua que va néixer en un pati de Managua» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-pati    SCALE-03 + TIME-13  De 25 a més de 400 alumnes (scrolly)
   V2 #f-escoles MAP-01 + MAP-03     Escoles d'educació especial sobre el relleu de Nicaragua
   V3 #f-cohorts CASE-02             Primera i segona cohort per edat d'entrada (Senghas i Coppola 2001)
   V4 #s-rodola  HOW-01 + PART-01    Manera i trajectòria (Senghas, Kita i Özyürek 2004) (scrolly)
   V5 #f-ment    CASE-03             Verbs mentals i creença falsa (Pyers i Senghas 2009)
   V6 #f-mon     MAP-03              Llengües de signes nascudes en comunitats concretes (món, sense relleu)
   V7 #f-ordre   PART-01             Ordre dels mots a Al-Sayyid (Sandler et al. 2005)
   Colors: blau = el que hi havia i la primera cohort; vermell = el que és nou; groc només en superfícies. */
(function(){
"use strict";
const V=IBV, C=V.C;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// en mode fosc, els cercles translúcids se sumen en clar (screen) en lloc d'enfosquir-se (multiply)
const DARK=!!(window.IBTheme&&IBTheme.dark), BLEND=DARK?"normal":"multiply", OK=DARK?1.6:1;

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
   DADES (totes reals; fonts a «Dades i fonts»)
   ===================================================================== */
// Matrícula sorda a Managua (Senghas i Coppola 2001, citant Polich 1998)
const ESCOLA=[{y:1977,n:25},{y:1979,n:100},{y:1983,n:400}];
// Fites (Senghas i Coppola 2001; Senghas, Kita i Özyürek 2004; Coppola 2020)
const FITES=[
  {y:1977,t:"S'amplia l'escola d'educació especial",s:"25 alumnes sords a Managua"},
  {y:1980,t:"Centre de formació professional",s:"per a adolescents i joves (1980 o 1981)"},
  {y:1983,t:"Més de 400 alumnes",s:"primera comunitat sorda"},
  {y:1986,t:"ANSNIC",s:"associació nacional de persones sordes"},
  {y:1987,t:"Primers vídeos",s:"els grava Judy Kegl (MIT)"},
  {y:2009,t:"Llei 675",s:"mitjà de comunicació oficial de les persones sordes"},
  {y:2011,t:"Llei 763",s:"la llengua de signes, a l'escola"}
];
// Municipis amb escoles públiques d'educació especial (Coppola 2020); coordenades dels nuclis (OSM)
const ESCOLES=[["Managua",-86.2737,12.1547],["San Marcos",-86.2047,11.9092],["Jinotepe",-86.1992,11.8478],["Diriamba",-86.2403,11.8561,2],["Masaya",-86.096,11.974],["Granada",-85.9535,11.9304],["Rivas",-85.8287,11.4389],["León",-86.8789,12.435],["La Paz Centro",-86.6763,12.3394],["Chinandega",-87.1347,12.6311],["Chichigalpa",-87.028,12.5704],["El Viejo",-87.1674,12.662],["Corinto",-87.1713,12.4817],["Boaco",-85.66,12.4726],["Juigalpa",-85.3652,12.1061],["Matagalpa",-85.9184,12.9284],["Jinotega",-86.0032,13.092],["Estelí",-86.3562,13.093],["La Trinidad",-86.2353,12.968],["Condega",-86.3974,13.3614],["Ocotal",-86.4744,13.632],["Somoto",-86.5826,13.4837],["Bluefields",-83.7649,12.0132],["Bilwi",-83.3823,14.0284]];
// Senghas i Coppola 2001, figures 2–4 (valors per grup, aproximats: llegits de les figures)
const COH={
  mod:{t:"Modulacions espacials per verb",u:"per verb",f:2,max:2,g:[[1.35,1.82],[1.12,1.70],[0.73,0.70]],txt:"Mitjana per edat d'entrada: 1,5 · 1,3 · 0,7"},
  ref:{t:"Usos per indicar referència compartida",u:"per verb",f:2,max:1.5,g:[[0.80,1.33],[0.62,1.22],[0.36,0.41]],txt:"Mitjana: 1a cohort 0,63 · 2a cohort 0,88"},
  mpm:{t:"Velocitat (morfemes per minut)",u:"morfemes/min",f:0,max:400,g:[[210,350],[208,295],[150,128]],txt:"Mitjana: 1a cohort 194 · 2a cohort 234"}
};
const EDATS=["Abans dels 6,5 anys","Entre 6,5 i 10 anys","Després dels 10 anys"], EDATS_M=["< 6,5 anys","6,5–10 anys","> 10 anys"];
// Senghas, Kita i Özyürek 2004: proporció d'expressions amb manera i trajectòria
const MOV=[{k:"oi",t:"Oients (gestos)",ts:"Oients",sim:1.0,seq:0},{k:"c1",t:"1a cohort (abans del 1984)",ts:"1a cohort",sim:.73,seq:.27},{k:"c2",t:"2a cohort (1984–1993)",ts:"2a cohort",sim:.32,seq:.78},{k:"c3",t:"3a cohort (després del 1993)",ts:"3a cohort",sim:.38,seq:.73}];
// Pyers i Senghas 2009, taula 1
const MENT={
  verbs:{t:"Verbs mentals per participant",u:"verbs",max:9,c1:[1.13,3.9],c2:[7.2,7.4],fmt:v=>f1(v)},
  fb:{t:"Encerts en la prova de creença falsa",u:"%",max:100,c1:[0.5/4*100,1.5/3*100],c2:[3.8/4*100,2.6/3*100],fmt:v=>f0(v)+" %"}
};
// Llengües que han nascut en una comunitat concreta
const LLOCS=[
  {n:"Nicaragua",ll:[-86.27,12.15],a:"end",t:"Llengua de signes de Nicaragua",s:"Neix cap al 1978 en una escola de Managua; uns 800 signants el 2004",k:"esc"},
  {n:"Al-Sayyid",ll:[34.9,31.25],a:"start",t:"Llengua de signes beduïna d'Al-Sayyid",s:"Nègueb (Israel); sorgida en uns 70 anys en una comunitat d'unes 3.500 persones (2005)",k:"pob"},
  {n:"Bengkala",ll:[115.17,-8.09],a:"start",t:"Kata Kolok",s:"Bali (Indonèsia); segons un estudi del 1995, un 2,2 % de 2.185 veïns eren sords; molts oients signen",k:"pob"},
  {n:"Martha's Vineyard",ll:[-70.6,41.39],a:"end",t:"Llengua de signes de Martha's Vineyard",s:"Massachusetts (EUA); comunitat signant des del 1785 a Chilmark; es va deixar de transmetre al segle XX",k:"ext"}
];

/* =====================================================================
   V1 · SCALE-03 + TIME-13 · DE 25 A MÉS DE 400 (scrolly)
   ===================================================================== */
(function pati(){
  const box=$("#pati-viz"), stepsEl=$("#s-pati .steps"); if(!box)return;
  let cur=0;
  const rnd=V.rng(1977);
  const kids=d3.range(400).map(i=>({i,rx:rnd(),ry:rnd(),ph:rnd()*6.28}));
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.95,vh*.42):Math.min(560,vh*.7));
    const st=stage(el,h);
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Punts que representen els alumnes sords de Managua: 25 el 1977, 100 el 1979 i més de 400 el 1983, sobre una cronologia que arriba a les lleis del 2009 i el 2011.");
    const g=s.append("g");
    const tlH=mob?64:78, fieldH=h-tlH-10;
    // camp de punts: un pati suau en groc translúcid (superfície)
    const cx=w/2, cy=fieldH/2+4, R=Math.min(w*.46,fieldH*.5);
    g.append("ellipse").attr("cx",cx).attr("cy",cy).attr("rx",R*1.02).attr("ry",R*.86).attr("fill",C.yellow).attr("fill-opacity",.13).style("mix-blend-mode",BLEND);
    // posicions: espiral de Fermat (ordre d'arribada)
    kids.forEach(k=>{ const a=k.i*2.39996, r=Math.sqrt((k.i+.5)/400)*R*.94; k.x=cx+r*Math.cos(a); k.y=cy+r*Math.sin(a)*.84; });
    const links=g.append("g");
    const dots=g.append("g").selectAll("circle").data(kids).join("circle").attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",mob?2.3:3.2)
      .attr("fill",C.red).attr("fill-opacity",.75).style("mix-blend-mode",BLEND).attr("opacity",0);
    const lab=g.append("g");
    // cronologia
    const x=d3.scaleLinear([1975,2013],[mob?14:30,w-(mob?14:30)]), ty=h-tlH+18;
    const tl=g.append("g");
    tl.append("line").attr("x1",x(1975)).attr("x2",x(2013)).attr("y1",ty).attr("y2",ty).attr("stroke",C.ink).attr("stroke-width",.7);
    [1980,1990,2000,2010].forEach(y=>V.t(tl,x(y),ty+16,y,{anchor:"middle",size:V.FS.small,fill:C.muted}));
    const fm=tl.selectAll("g.f").data(FITES).join("g").attr("class","f").attr("transform",d=>`translate(${x(d.y)},${ty})`);
    fm.append("circle").attr("r",3.4).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1);
    const flab=tl.append("g");
    const STEP=[{n:25,y:1977,f:[0]},{n:100,y:1979,f:[0]},{n:400,y:1983,f:[0,1,2],talk:true},{n:400,y:1987,f:[0,1,2,3,4],talk:true},{n:400,y:2011,f:[0,1,2,3,4,5,6],talk:true}];
    function set(k,instant){
      const S=STEP[k], T=instant||V.reduced?0:650;
      dots.interrupt().transition().duration(T).delay(d=>T?Math.max(0,d.i-(k?STEP[k-1].n:0))*3:0).attr("opacity",d=>d.i<S.n?1:0);
      fm.select("circle").transition().duration(T).attr("fill",(d,i)=>S.f.includes(i)?C.red:C.paper).attr("stroke",(d,i)=>S.f.includes(i)?C.red:C.ink);
      flab.selectAll("*").remove();
      const last=FITES[S.f[S.f.length-1]], lx=x(last.y);
      V.lines(flab,Math.min(Math.max(lx,mob?60:110),w-(mob?60:110)),ty-12-(mob?16:18),[[`${last.y} · ${last.t}`,true],[last.s]],{size:mob?11:12,anchor:"middle",halo:3});
      lab.selectAll("*").remove();
      V.lines(lab,mob?6:12,mob?16:22,[[S.n===400?"Més de 400 alumnes sords":`${S.n} alumnes sords`,true,C.red],[S.y<=1983?`Managua, ${S.y}`:"La comunitat ja existeix"]],{size:mob?12:13.5,halo:3});
      links.selectAll("*").remove();
      if(S.talk){
        const r2=V.rng(7); const L=[];
        for(let i=0;i<(mob?60:120);i++){ const a=kids[Math.floor(r2()*400)], b=kids[Math.floor(r2()*400)]; if(Math.hypot(a.x-b.x,a.y-b.y)<R*.5)L.push([a,b]); }
        links.selectAll("path").data(L).join("path").attr("d",([a,b])=>`M${a.x},${a.y}Q${(a.x+b.x)/2},${(a.y+b.y)/2-18} ${b.x},${b.y}`)
          .attr("fill","none").attr("stroke",C.blue).attr("stroke-width",.7).attr("stroke-opacity",0).transition().duration(T*1.4).attr("stroke-opacity",.32);
      }
    }
    el.__set=set; set(cur,true);
    // respiració molt lenta dels punts (vida al pati)
    el.__loop=V.loop(el,t=>{ if(V.reduced)return; dots.attr("cx",d=>d.x+Math.sin(t/2600+d.ph)*1.1).attr("cy",d=>d.y+Math.cos(t/3100+d.ph)*1.1); });
  });
  IB.scrolly(stepsEl,$("#s-pati .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V2 · MAP-01 + MAP-03 · ON S'APRÈN AVUI (escoles d'educació especial)
   ===================================================================== */
(function escoles(){
  const box=$("#escoles-viz"); if(!box||!window.NI_DEM)return;
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(Math.min(mob?w*.95:w*.72,vh*(mob?.62:.78)));
    const st=stage(el,h);
    const proj=d3.geoMercator().fitExtent([[mob?4:10,mob?6:10],[w-(mob?4:10),h-(mob?6:10)]],{type:"MultiPoint",coordinates:[[-87.75,10.75],[-82.7,15.05]]});
    const {ctx}=mkCanvas(st,w,h,"Mapa físic de Nicaragua en relleu amb els 24 municipis que tenen escoles públiques d'educació especial que acullen infants sords: 22 a la meitat occidental del país i 2 a la costa carib.");
    relleu59(ctx,proj,w,h,window.NI_DEM,{iso:[500,1000,1500,2000],fade:"nos"});
    if(window.NI_LAKES){ const pl=d3.geoPath(proj,ctx); ctx.beginPath(); pl(window.NI_LAKES); ctx.fillStyle="#AEC6E6"; ctx.fill(); ctx.strokeStyle=C.blue; ctx.lineWidth=.9; ctx.stroke(); }
    V.world().then(W=>{ const p=d3.geoPath(proj,ctx); ctx.save(); ctx.setLineDash([3,3]); ctx.strokeStyle=V.alpha(C.ink2,.5); ctx.lineWidth=.8; ctx.beginPath(); p(W.borders); ctx.stroke(); ctx.restore(); }).catch(()=>{});
    const s=overlay(st,w,h), g=s.append("g");
    [["Oceà Pacífic",[-87.1,11.2]],["Mar Carib",[-83.25,12.95]],["Llac de Nicaragua",[-85.45,11.6]],["Hondures",[-86.4,14.5]],["Costa Rica",[-84.6,10.85]]].forEach(([t,ll])=>{
      if(mob&&(t==="Llac de Nicaragua"))return; const p=proj(ll); V.t(g,p[0],p[1],t,{italic:true,size:mob?11:12,fill:C.muted,anchor:"middle",halo:2.5}); });
    const r=d3.scaleSqrt([0,2],[0,mob?6:9]);
    const pts=ESCOLES.map(([n,lon,lat,k])=>({n,k:k||1,p:proj([lon,lat])}));
    const gp=g.append("g");
    gp.selectAll("circle.h").data(pts).join("circle").attr("class","h").attr("cx",d=>d.p[0]).attr("cy",d=>d.p[1]).attr("r",0)
      .attr("fill",d=>d.n==="Managua"?C.red:C.blue).attr("fill-opacity",d=>(d.n==="Managua"?.5:.38)*OK).style("mix-blend-mode",BLEND);
    gp.selectAll("circle.c").data(pts).join("circle").attr("class","c").attr("cx",d=>d.p[0]).attr("cy",d=>d.p[1]).attr("r",1.6).attr("fill",C.ink);
    const show=mob?["Managua","León","Estelí","Bluefields","Bilwi","Matagalpa"]:["Managua","León","Estelí","Bluefields","Bilwi","Matagalpa","Jinotega","Chinandega","Granada","Rivas","Juigalpa","Ocotal"];
    pts.filter(d=>show.includes(d.n)).forEach(d=>{ const right=d.p[0]<w*.62&&d.n!=="Chinandega"&&d.n!=="León";
      V.t(g,d.p[0]+(right?8:-8),d.p[1]+4,d.n,{anchor:right?"start":"end",size:d.n==="Managua"?13:11.5,weight:d.n==="Managua"?700:500,halo:3}); });
    { const m=pts[0]; V.note(g,{x:m.p[0]-4,y:m.p[1]+6,tx:m.p[0]-(mob?26:60),ty:m.p[1]+(mob?44:70),anchor:"end",lines:mob?[["On va néixer",true]]:[["On va néixer la llengua",true],["l'escola de 1977 i l'associació"]],size:mob?11.5:12.5}); }
    scaleBar(g,proj,-87.6,10.9,100,mob?8:14,h-(mob?8:14));
    const grow=instant=>gp.selectAll("circle.h").transition().duration(instant?0:700).delay((d,i)=>instant?0:i*35).attr("r",d=>Math.max(4,r(d.k))*(mob?1.6:1.9));
    V.onView(el,grow);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(pts,d=>(d.p[0]-px)**2+(d.p[1]-py)**2);
      if((b.p[0]-px)**2+(b.p[1]-py)**2>900){ tp.hide(); return; }
      tp.show(`<b>${b.n}</b> · ${b.k>1?`${b.k} escoles públiques d'educació especial`:"escola pública d'educació especial"}`); },()=>tp.hide());
  });
})();

/* =====================================================================
   V3 · CASE-02 · ELS PETITS VAN MÉS LLUNY QUE ELS GRANS (halteres)
   ===================================================================== */
(function cohorts(){
  const box=$("#cohorts-viz"); if(!box)return;
  let key="mod", draw=null;
  const lg=$("#cohorts-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"1a cohort (va entrar el 1983 o abans)"},{c:C.red,t:"2a cohort (després del 1983)"}]); }
  document.querySelectorAll('#f-cohorts .seg button').forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll('#f-cohorts .seg button').forEach(o=>o.setAttribute("aria-pressed",o===b)); key=b.dataset.k; if(draw)draw(false); }));
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, rh=mob?78:72, m={t:34,l:mob?8:190,r:mob?16:40,b:30}, h=m.t+3*rh+m.b;
    const s=V.svg(el,w,h,"Comparació entre la primera i la segona cohort de signants de Nicaragua per grups d'edat d'entrada: els qui hi van entrar abans dels 10 anys de la segona cohort fan servir més modulacions espacials, més referència compartida i signen més de pressa; els qui hi van entrar després dels 10 anys no milloren."), g=s.append("g");
    const ax=g.append("g"), rows=g.append("g"), head=g.append("g");
    const x=d3.scaleLinear([0,1],[m.l,w-m.r]);
    draw=instant=>{
      const M=COH[key], T=instant||V.reduced?0:700; x.domain([0,M.max]);
      ax.selectAll("*").remove(); head.selectAll("*").remove();
      x.ticks(mob?4:5).forEach(v=>{ ax.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t-6).attr("y2",h-m.b).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
        V.t(ax,x(v),h-m.b+16,M.f?f1(v):f0(v),{anchor:"middle",size:V.FS.small,fill:C.muted}); });
      V.t(head,x(0),m.t-14,`${M.t} →`,{size:12,weight:600,fill:C.ink2});
      const R=rows.selectAll("g.r").data(M.g.map((v,i)=>({i,v}))).join(enter=>{ const q=enter.append("g").attr("class","r");
        q.append("line").attr("class","bar"); q.append("circle").attr("class","a"); q.append("circle").attr("class","b"); q.append("text").attr("class","lab"); q.append("text").attr("class","va"); q.append("text").attr("class","vb"); return q; })
        .attr("transform",d=>`translate(0,${m.t+rh*(d.i+.55)+(mob?10:0)})`);
      R.select(".lab").attr("x",mob?m.l+6:m.l-14).attr("y",mob?-rh*.36:4).attr("text-anchor",mob?"start":"end").attr("font-size",mob?12:13).attr("font-weight",600).attr("fill",C.ink).attr("font-family",V.SANS).text(d=>(mob?EDATS_M:EDATS)[d.i]);
      const fv=v=>M.f?f1(v).replace(/,0$/,""):f0(v);
      R.select(".bar").attr("y1",0).attr("y2",0).attr("stroke",C.ink2).attr("stroke-width",1.6).attr("stroke-opacity",.5).transition().duration(T).attr("x1",d=>x(d.v[0])).attr("x2",d=>x(d.v[1]));
      R.select(".a").attr("r",mob?6:7).attr("fill",C.blue).attr("fill-opacity",.8).transition().duration(T).attr("cx",d=>x(d.v[0]));
      R.select(".b").attr("r",mob?6:7).attr("fill",C.red).attr("fill-opacity",.8).transition().duration(T).attr("cx",d=>x(d.v[1]));
      const lo=d=>Math.min(d.v[0],d.v[1]), hi=d=>Math.max(d.v[0],d.v[1]);
      R.select(".va").attr("y",-12).attr("font-size",11.5).attr("fill",C.ink2).attr("font-family",V.SANS).attr("text-anchor","middle").text(d=>fv(d.v[0])).transition().duration(T).attr("x",d=>x(d.v[0])+(d.v[0]<=d.v[1]?-0:0));
      R.select(".vb").attr("y",-12).attr("font-size",11.5).attr("font-weight",700).attr("fill",C.ink).attr("font-family",V.SANS).attr("text-anchor","middle").text(d=>fv(d.v[1])).transition().duration(T).attr("x",d=>x(d.v[1]));
      // si els dos valors són massa a prop, la 1a cohort s'escriu a sota
      R.select(".va").transition().duration(T).attr("y",d=>Math.abs(x(d.v[0])-x(d.v[1]))<34?20:-12);
      const note=$("#cohorts-note"); if(note)note.textContent=M.txt;
    };
    draw(true);
    V.onView(el,instant=>{ if(instant)return; rows.selectAll(".a,.b").attr("cx",x(0)); rows.selectAll(".bar").attr("x1",x(0)).attr("x2",x(0)); draw(false); });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=clamp(Math.floor((py-m.t-(mob?10:0))/rh),0,2), M=COH[key], v=M.g[i];
      V.focus(rows.selectAll("g.r"),d=>d.i===i);
      const d=v[1]-v[0];
      tp.show(`<b>${EDATS[i]}</b> · 1a cohort ${M.f?f1(v[0]):f0(v[0])} → 2a cohort ${M.f?f1(v[1]):f0(v[1])} ${M.u} (${d>=0?"+":"−"}${M.f?f1(Math.abs(d)):f0(Math.abs(d))})`);
    },()=>{ tp.hide(); V.focus(rows.selectAll("g.r"),null); });
  });
})();

/* =====================================================================
   V4 · HOW-01 + PART-01 · RODOLAR CAP AVALL (scrolly)
   ===================================================================== */
(function rodola(){
  const box=$("#rodola-viz"), stepsEl=$("#s-rodola .steps"); if(!box)return;
  let cur=0;
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(380,vh*.44):Math.min(600,vh*.74));
    const st=stage(el,h);
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Esquema: un gat rodola pendent avall. Els oients ho expressen amb un sol gest en espiral; els signants de les cohorts més joves ho separen en dos signes, rodolar i baixar. A sota, proporcions reals: 100 % de gestos simultanis en els oients, 73 % a la primera cohort, 32 % i 38 % a la segona i la tercera; les expressions seqüencials passen de 0 a 27, 78 i 73 %.");
    const g=s.append("g");
    // escena (dalt): pendent i bola
    const sceneH=Math.round(h*(mob?.46:.5)), sx0=mob?20:40, sx1=w*(mob?.42:.36), sy0=26, sy1=sceneH-14;
    const sc=g.append("g");
    sc.append("path").attr("d",`M${sx0},${sy0+8}L${sx1},${sy1}L${sx1+40},${sy1}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1.2);
    sc.append("path").attr("d",`M${sx0},${sy0+8}L${sx1},${sy1}L${sx0},${sy1}Z`).attr("fill",C.yellow).attr("fill-opacity",.16).style("mix-blend-mode",BLEND);
    const ball=sc.append("g"); const br=mob?9:12;
    ball.append("circle").attr("r",br).attr("fill",C.ink2).attr("fill-opacity",.85);
    ball.append("line").attr("x1",-br).attr("x2",br).attr("stroke",C.paper).attr("stroke-width",1.4);
    V.t(sc,sx0,sy1+ (mob?16:18),"El que passa: rodola i baixa alhora",{size:mob?11:12,fill:C.ink2,italic:true});
    // mans (dalt dreta): el traç del gest o dels signes
    const hx0=w*(mob?.52:.48), hx1=w*(mob?.96:.86), hy0=22, hy1=sceneH-10;
    const hand=g.append("g"), handLab=g.append("g");
    const tracer=g.append("circle").attr("r",mob?4:5).attr("fill",C.red).attr("opacity",0);
    const P={
      spiral:()=>{ const n=120, pts=[]; for(let i=0;i<=n;i++){ const t=i/n, a=t*Math.PI*2*4; pts.push([hx0+(hx1-hx0)*t+Math.cos(a)*14, hy0+18+(hy1-hy0-30)*t+Math.sin(a)*14]); } return [pts]; },
      seq:()=>{ const c=[], n=60; const cx=hx0+30, cy=hy0+40; for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2*2; c.push([cx+Math.cos(a)*16,cy+Math.sin(a)*16]); }
        const l=[[hx0+(hx1-hx0)*.42,hy0+24],[hx1,hy1-8]]; return [c,l]; },
      aba:()=>{ const mk=(cx,cy)=>{ const c=[]; for(let i=0;i<=50;i++){ const a=i/50*Math.PI*4; c.push([cx+Math.cos(a)*13,cy+Math.sin(a)*13]); } return c; };
        return [mk(hx0+24,hy0+34),[[hx0+(hx1-hx0)*.32,hy0+30],[hx0+(hx1-hx0)*.72,hy1-14]],mk(hx1-18,hy1-22)]; }
    };
    const NAMES={spiral:["Un sol moviment"],seq:["RODOLAR","BAIXAR"],aba:["RODOLAR","BAIXAR","RODOLAR"]};
    let segs=[], segLen=[], total=0;
    function setPath(kind,T){
      hand.selectAll("*").remove(); handLab.selectAll("*").remove(); segs=kind?P[kind]():[]; segLen=[]; total=0;
      const line=d3.line().curve(d3.curveCatmullRom);
      segs.forEach((sg,i)=>{ const p=hand.append("path").attr("d",line(sg)).attr("fill","none").attr("stroke",kind==="spiral"?C.blue:C.red).attr("stroke-width",mob?1.8:2.2).attr("stroke-linecap","round");
        const L=p.node().getTotalLength(); segLen.push(L); total+=L;
        p.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",T?L:0).transition().delay(T?i*500:0).duration(T?900:0).attr("stroke-dashoffset",0);
        const c=sg[Math.floor(sg.length/2)], lbl=NAMES[kind][i];
        V.t(handLab,c[0]+(kind==="spiral"?0:0),Math.min(c[1]+(i===1?-14:30),sceneH+2),lbl,{anchor:"middle",size:mob?11:12,weight:700,fill:C.ink,halo:3});
      });
      V.t(handLab,hx0,12,kind==="spiral"?"El gest dels oients":kind?"Els signes de les cohorts joves":"",{size:mob?11:12,fill:C.ink2,italic:true});
      tracer.attr("opacity",kind?1:0).attr("fill",kind==="spiral"?C.blue:C.red);
    }
    // barres (baix): 20 punts = 100 %
    const by0=sceneH+(mob?26:34), rowH=(h-by0-8)/4, nD=20, dx=mob?Math.min(9,(w*.62)/nD):Math.min(15,(w*.5)/nD), lx=mob?72:150;
    const bars=g.append("g");
    V.t(bars,lx,by0-6,"● simultània",{size:11.5,fill:C.blue});
    V.t(bars,lx+(mob?84:110),by0-6,"● seqüencial",{size:11.5,fill:C.red});
    const R=bars.selectAll("g.r").data(MOV).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${by0+rowH*i+rowH*.32})`);
    R.append("text").attr("x",lx-10).attr("y",4).attr("text-anchor","end").attr("font-size",mob?11:12.5).attr("font-weight",600).attr("fill",C.ink).attr("font-family",V.SANS).text(d=>mob?d.ts:d.t.replace(/ \(.*\)$/,""));
    R.each(function(d){ const q=d3.select(this);
      [["sim",C.blue,-4],["seq",C.red,mob?6:7]].forEach(([k,c,dy])=>{
        q.selectAll(`circle.${k}`).data(d3.range(nD)).join("circle").attr("class",k).attr("cx",i=>lx+i*dx+dx/2).attr("cy",dy).attr("r",mob?2.6:3.6)
          .attr("fill",i=>i<Math.round(d[k]*nD)?c:"none").attr("stroke",c).attr("stroke-width",.6).attr("stroke-opacity",.45).attr("fill-opacity",.85);
        V.t(q,lx+nD*dx+8,dy+4,f0(d[k]*100)+" %",{size:mob?10.5:11.5,fill:C.ink2});
      }); });
    const FOC=[null,["oi"],["c1"],["c2","c3"],["c1","c2","c3"]];
    const KIND=[null,"spiral","spiral","seq","aba"];
    el.__set=(k,instant)=>{ setPath(KIND[k],!(instant||V.reduced)); R.transition().duration(400).style("opacity",d=>!FOC[k]||FOC[k].includes(d.k)?1:.46); };
    el.__set(cur,true);
    // animació lenta: bola i traçador
    el.__loop=V.loop(el,t=>{
      const u=((t/5200)%1);
      const bx=sx0+(sx1-sx0)*u, by=sy0+8+(sy1-sy0-8)*u-br;
      ball.attr("transform",`translate(${bx},${by}) rotate(${u*720})`).attr("opacity",u>.95?1-(u-.95)*20:1);
      if(total){ let d=u*total, i=0; while(i<segLen.length-1&&d>segLen[i]){ d-=segLen[i]; i++; }
        const node=hand.selectAll("path").nodes()[i]; if(node){ const p=node.getPointAtLength(Math.min(d,segLen[i])); tracer.attr("cx",p.x).attr("cy",p.y); } }
    });
  });
  IB.scrolly(stepsEl,$("#s-rodola .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V5 · CASE-03 · PARAULES PER PENSAR (pendents)
   ===================================================================== */
(function ment(){
  const box=$("#ment-viz"); if(!box)return;
  const lg=$("#ment-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"1a cohort (8 adults, 27 anys de mitjana el 2001)",kind:"line",w:2.2},{c:C.red,t:"2a cohort (10 joves, 18 anys)",kind:"line",w:2.2},{c:C.ink2,t:"Atzar (50 %)",kind:"line",w:1}]); }
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, pw=mob?w:(w-60)/2, ph=mob?230:270, h=mob?ph*2+40:ph+20;
    const s=V.svg(el,w,h,"Pendents del 2001 al 2003: la primera cohort (8 adults) passa d'1,1 a 3,9 verbs mentals i del 13 % al 50 % d'encerts en la prova de creença falsa, que és el nivell de l'atzar; la segona cohort es manté alta (7,2 a 7,4 verbs; 95 % i 87 % d'encerts)."), g=s.append("g");
    const panels=[["verbs",0,0],["fb",mob?0:pw+60,mob?ph+40:0]];
    const all=[];
    panels.forEach(([k,ox,oy])=>{ const M=MENT[k], p=g.append("g").attr("transform",`translate(${ox},${oy})`);
      const m={t:40,b:26,l:mob?48:56,r:mob?78:96}, x0=m.l, x1=pw-m.r, y=d3.scaleLinear([0,M.max],[ph-m.b,m.t]);
      V.t(p,0,16,M.t,{size:13,weight:700});
      y.ticks(4).forEach(v=>{ p.append("line").attr("x1",x0-6).attr("x2",x1+6).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
        if(Math.min(Math.abs(y(v)-y(M.c1[0])),Math.abs(y(v)-y(M.c2[0])))<13)return;
        V.t(p,x0-12,y(v)+4,k==="fb"?f0(v)+(v===M.max?" %":""):f0(v),{anchor:"end",size:V.FS.small,fill:C.muted}); });
      if(k==="fb"){ p.append("line").attr("x1",x0-6).attr("x2",x1+6).attr("y1",y(50)).attr("y2",y(50)).attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","4 3");
        V.t(p,(x0+x1)/2,y(50)-6,"atzar (50 %)",{anchor:"middle",size:11.5,fill:C.ink2,italic:true,halo:3}); }
      [[x0,"2001"],[x1,"2003"]].forEach(([xx,t])=>V.t(p,xx,ph-6,t,{anchor:"middle",size:12,fill:C.ink2,weight:600}));
      [["c1",C.blue],["c2",C.red]].forEach(([c,col])=>{ const v=M[c];
        const ln=p.append("line").attr("x1",x0).attr("x2",x0).attr("y1",y(v[0])).attr("y2",y(v[0])).attr("stroke",col).attr("stroke-width",2.2).attr("stroke-linecap","round").datum({k,c});
        const a=p.append("circle").attr("cx",x0).attr("cy",y(v[0])).attr("r",5).attr("fill",col).datum({k,c});
        const b=p.append("circle").attr("cx",x0).attr("cy",y(v[0])).attr("r",5).attr("fill",col).datum({k,c}).attr("opacity",0);
        const la=V.t(p,x0-10,y(v[0])+4,M.fmt(v[0]),{anchor:"end",size:11.5,fill:C.ink2,halo:3}).attr("opacity",0);
        const lb=V.t(p,x1+10,y(v[1])+4,`${M.fmt(v[1])} · ${c==="c1"?"1a":"2a"}`,{size:11.5,weight:700,fill:C.ink,halo:3}).attr("opacity",0);
        all.push({k,c,ln,a,b,la,lb,x1,yv:y(v[1])});
      });
      if(k==="fb"&&!mob) V.note(p,{x:x1-4,y:y(MENT.fb.c1[1])+6,tx:x1-30,ty:y(MENT.fb.c1[1])+82,anchor:"end",lines:[["La primera cohort millora,",true],["però queda a l'altura de l'atzar"]],size:12});
    });
    const go=instant=>{ const T=instant?0:1100;
      all.forEach(o=>{ o.la.transition().duration(T?300:0).attr("opacity",1);
        o.ln.transition().delay(T?300:0).duration(T).attr("x2",o.x1).attr("y2",o.yv);
        o.b.transition().delay(T?300:0).duration(T).attr("cx",o.x1).attr("cy",o.yv).attr("opacity",1);
        o.lb.transition().delay(T?300+T:0).duration(300).attr("opacity",1); }); };
    V.onView(el,go);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const k=mob?(py>ph+20?"fb":"verbs"):(px>pw+30?"fb":"verbs"), M=MENT[k];
      const yy=mob?(k==="fb"?py-ph-40:py):py, Y=d3.scaleLinear([0,M.max],[ph-26,40]), val=Y.invert(yy);
      const c=Math.abs(M.c1[1]-val)+Math.abs(M.c1[0]-val)<Math.abs(M.c2[1]-val)+Math.abs(M.c2[0]-val)?"c1":"c2";
      all.forEach(o=>{ const on=o.c===c; o.ln.attr("stroke-opacity",on?1:.35); o.a.attr("opacity",on?1:.46); o.b.attr("opacity",on?1:.46); });
      tp.show(`<b>${c==="c1"?"1a cohort":"2a cohort"} · ${M.t.toLowerCase()}</b> · 2001: ${M.fmt(M[c][0])} → 2003: ${M.fmt(M[c][1])}`);
    },()=>{ tp.hide(); all.forEach(o=>{ o.ln.attr("stroke-opacity",1); o.a.attr("opacity",1); o.b.attr("opacity",1); }); });
  });
})();

/* =====================================================================
   V6 · MAP-03 · LLENGÜES QUE NEIXEN SOLES (mapa del món, sense relleu)
   ===================================================================== */
(function mon(){
  const box=$("#mon-viz"); if(!box)return;
  const lg=$("#mon-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.red,t:"Neix en una escola"},{c:C.blue,t:"Neix en un poble"},{c:C.ghost,t:"Es va deixar de transmetre"}]); }
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(w*(mob?.62:.5));
    const st=stage(el,h);
    const proj=d3.geoEqualEarth().fitExtent([[4,8],[w-4,h-8]],{type:"Sphere"});
    const {ctx}=mkCanvas(st,w,h,"Mapa del món amb quatre llengües de signes nascudes en comunitats concretes: Nicaragua, Al-Sayyid (Israel), Bengkala (Bali) i Martha's Vineyard (Estats Units).");
    const s=overlay(st,w,h), g=s.append("g");
    V.world().then(W=>{ const p=d3.geoPath(proj,ctx); ctx.fillStyle=C.land; ctx.beginPath(); p(W.land); ctx.fill();
      ctx.strokeStyle=C.paper; ctx.lineWidth=.6; ctx.beginPath(); p(W.borders); ctx.stroke(); }).catch(()=>{});
    const col=k=>k==="esc"?C.red:k==="pob"?C.blue:C.ink2;
    const P=LLOCS.map(d=>Object.assign({},d,{p:proj(d.ll)}));
    const gc=g.append("g");
    gc.selectAll("circle.h").data(P).join("circle").attr("class","h").attr("cx",d=>d.p[0]).attr("cy",d=>d.p[1]).attr("r",0)
      .attr("fill",d=>col(d.k)).attr("fill-opacity",d=>(d.k==="ext"?.22:.42)*OK).style("mix-blend-mode",BLEND);
    gc.selectAll("circle.c").data(P).join("circle").attr("class","c").attr("cx",d=>d.p[0]).attr("cy",d=>d.p[1]).attr("r",2).attr("fill",C.ink);
    const OFF={"Nicaragua":[-12,26],"Al-Sayyid":[16,-22],"Bengkala":[14,24],"Martha's Vineyard":[-14,-24]};
    P.forEach(d=>{ const o=OFF[d.n], tx=d.p[0]+o[0]*(mob?1:2), ty=d.p[1]+o[1]*(mob?.9:1.4);
      V.note(g,{x:d.p[0]+(o[0]>0?4:-4),y:d.p[1]+(o[1]>0?4:-4),tx,ty,kind:"straight",anchor:o[0]>0?"start":"end",lines:mob?[[d.n,true]]:[[d.n,true],[d.t]],size:mob?11.5:12}); });
    V.onView(el,instant=>gc.selectAll("circle.h").transition().duration(instant?0:800).delay((d,i)=>instant?0:i*180).attr("r",mob?9:16));
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(P,d=>(d.p[0]-px)**2+(d.p[1]-py)**2); if((b.p[0]-px)**2+(b.p[1]-py)**2>2500){ tp.hide(); return; }
      tp.show(`<b>${b.t}</b> · ${b.s}`); },()=>tp.hide());
  });
})();

/* =====================================================================
   V7 · PART-01 · UN ORDRE QUE NINGÚ NO VA ENSENYAR (Al-Sayyid)
   ===================================================================== */
(function ordre(){
  const box=$("#ordre-viz"); if(!box)return;
  const N1=136, N2=22;
  V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, cols=mob?16:28, cell=mob?Math.min(18,(w-16)/cols):Math.min(20,(w*.62)/cols), rows=Math.ceil((N1+N2)/cols);
    const gx=mob?8:20, gy=46, h=Math.max(gy+rows*cell+(mob?210:24),mob?0:gy+230);
    const s=V.svg(el,w,h,"158 clàusules de vuit signants de la llengua de signes beduïna d'Al-Sayyid: 136 posen el verb al final i 22 no. L'àrab de la mateixa comunitat posa el verb al mig (subjecte-verb-objecte); els gestos sense parla d'oients de llengües diferents també el posen al final."), g=s.append("g");
    const D=d3.range(N1+N2).map(i=>({i,f:i<N1}));
    V.t(g,gx,18,"158 clàusules de vuit signants de la segona generació",{size:12,weight:600,fill:C.ink2});
    const sq=g.append("g").selectAll("rect").data(D).join("rect").attr("x",d=>gx+(d.i%cols)*cell).attr("y",d=>gy+Math.floor(d.i/cols)*cell)
      .attr("width",cell-2.2).attr("height",cell-2.2).attr("rx",2).attr("fill",d=>d.f?C.red:C.ghost).attr("fill-opacity",d=>d.f?.7:.9).attr("opacity",0);
    V.onView(el,instant=>sq.transition().duration(instant?0:300).delay(d=>instant?0:d.i*9).attr("opacity",1));
    const tx=mob?gx:gx+cols*cell+30, ty=mob?gy+rows*cell+26:gy+6;
    V.lines(g,tx,ty,[["136 amb el verb al final",true,C.red],["86 % de les clàusules"]],{size:13,halo:3});
    V.lines(g,tx,ty+(mob?42:52),[["22 amb un altre ordre",true],["14 %"]],{size:13,halo:3});
    V.lines(g,tx,ty+(mob?84:104),[["L'àrab de la mateixa comunitat",true],["posa el verb al mig:"],["subjecte, verb, objecte"]],{size:12.5,fill:C.ink2,halo:3});
    V.lines(g,tx,ty+(mob?140:170),[["Gestos sense parla d'oients",true],["de llengües diferents:"],["també el verb al final"]],{size:12.5,fill:C.ink2,halo:3});
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const c=Math.floor((px-gx)/cell), r=Math.floor((py-gy)/cell), i=r*cols+c;
      if(c<0||c>=cols||r<0||i>=N1+N2){ tp.hide(); V.focus(sq,null); return; }
      const f=i<N1; V.focus(sq,d=>d.f===f);
      tp.show(f?`<b>Verb al final</b> · 136 de 158 clàusules (86 %)`:`<b>Un altre ordre</b> · 22 de 158 clàusules (14 %)`); },()=>{ tp.hide(); V.focus(sq,null); });
  });
})();

})();
