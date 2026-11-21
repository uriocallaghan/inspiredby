/* La pols que adoba l'Amazònia — sistema infogràfic d'Inspired by Magazine (IBV).
   Joia de la corona del model MAP-19 combinat amb MAP-03, HOW-01, TIME-11/TIME-10, LINK-03, PART-01, CASE-04, SCALE-01 i TIME-02:
   1. Bodélé (#bmap): MAP-19 pur (2.200–2.800 micro-traços) + MAP-03 aquarel·la (Megatxad i diatomita)
   2. Capa d'aire del Sàhara (#salWrap): HOW-01 (gravat atmosfèric) + mini anell estacional TIME-11/TIME-10
   3. Viatge a l'Atlàntic (#mmap): MAP-19 atlàntic (2.800–3.400 micro-traços) + MAP-03 deposició amazònica
   4. Quant són 28 Mt? (#trucksWrap): Doble vista .seg — Flux de massa (LINK-03, ~1.000 micro-traços) + 364 blocs (PART-01)
   5. Balanç de fòsfor (#budgetWrap): CASE-04 (cercles d'aquarel·la) + SCALE-01 (escala interactiva 0–60 g/ha)
   6. Any a any 2007–2013 (#yearsWrap): TIME-02 (sèries multi-meridià amb embolcalls d'aquarel·la LDF–UDF)
   Dades i fonts: research/pols-del-sahara/ (Yu et al. 2015, Tsamalis et al. 2013, Prospero et al. 2020, Vitousek & Sanford 1986). */
(function(){
"use strict";
if(!window.IBV||!window.d3)return;

const V=window.IBV, C=V.C;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const DEG=Math.PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const sm=x=>{ x=clamp(x,0,1); return x*x*(3-2*x); };
const smoothEdge=(x,a,b)=>sm((x-a)/Math.max(1e-6,b-a));
const isMob=w=>(w!=null?w:window.innerWidth)<600;
const fmtNum=(n,d)=>d?f1(n):f0(n);
const llFmt=(lon,lat)=>`${f0(Math.abs(lat))}° ${lat>=0?"N":"S"}, ${f0(Math.abs(lon))}° ${lon>=0?"E":"O"}`;

function pw(nodes,x){
  if(x<=nodes[0][0])return nodes[0][1];
  for(let i=1;i<nodes.length;i++){
    if(x<=nodes[i][0]){
      const a=nodes[i-1], b=nodes[i];
      return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
    }
  }
  return nodes[nodes.length-1][1];
}

function arrowHead(g,x,y,ang,o){
  o=o||{}; const L=o.L||6.5;
  return g.append("path")
    .attr("d",`M${x-L*Math.cos(ang-.45)},${y-L*Math.sin(ang-.45)}L${x},${y}L${x-L*Math.cos(ang+.45)},${y-L*Math.sin(ang+.45)}`)
    .attr("fill","none").attr("stroke",o.stroke||C.ink).attr("stroke-width",o.sw||1.3).attr("stroke-linejoin","round");
}

function wcBlob(ctx,cx,cy,rx,ry,col,alpha,rot){
  if(alpha<=.004||rx<=.5||ry<=.5)return;
  ctx.save();
  ctx.translate(cx,cy);
  if(rot)ctx.rotate(rot);
  ctx.scale(1,ry/rx);
  const gr=ctx.createRadialGradient(0,0,0,0,0,rx);
  gr.addColorStop(0,V.alpha(col,alpha));
  gr.addColorStop(.52,V.alpha(col,alpha*.48));
  gr.addColorStop(.82,V.alpha(col,alpha*.14));
  gr.addColorStop(1,V.alpha(col,0));
  ctx.fillStyle=gr;
  ctx.beginPath(); ctx.arc(0,0,rx,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

const MES=["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"];
/* Yu et al. 2015 RSE taula 1 (15° O i 75° O, % del flux anual) i Yu et al. 2015 GRL (deposició a l'Amazònia, Tg) */
const SEAS=[
  {n:"Hivern",m:"desembre–febrer",out:23,car:11,amz:"11,9 milions de tones",amzV:11.9},
  {n:"Primavera",m:"març–maig",out:21,car:16,amz:"15,8 milions de tones",amzV:15.8},
  {n:"Estiu",m:"juny–agost",out:46,car:61,amz:"gairebé gens",amzV:.4},
  {n:"Tardor",m:"setembre–novembre",out:10,car:12,amz:"gairebé gens",amzV:.4}
];
function seasonOf(m){ const k=Math.floor(((m%12)+12)%12); return k===11||k<2?0:k<5?1:k<8?2:3; }
function fluxM(m){
  const c=[[-2.5,10/3],[0.5,23/3],[3.5,21/3],[6.5,46/3],[9.5,10/3],[12.5,23/3]];
  return pw(c,((m%12)+12)%12);
}
function amzM(m){
  const c=[[-2.5,.15],[0.5,11.9/3],[3.5,15.8/3],[6.5,.1],[9.5,.15],[12.5,11.9/3]];
  return pw(c,((m%12)+12)%12);
}
function summer(m){
  const n=[[-.5,.08],[.5,0],[1.5,0],[2.5,.08],[3.5,.2],[4.5,.45],[5.5,.85],[6.5,1],[7.5,1],[8.5,.85],[9.5,.6],[10.5,.3],[11.5,.08],[12.5,0]];
  return pw(n,((m%12)+12)%12);
}

/* Rampes MAP-19: monocromia rica per al vent (blau) i la pols (càlid vermell–groc) */
const WIND_SC=d3.scaleSequential(V.seqInterp(C.blau)).domain([-.12,1.12]).clamp(true);
const DUST_INTERP=d3.piecewise(d3.interpolateLab,[C.grocClar,C.vermellClar,C.vermell,C.vermellFosc]);
const DUST_SC=d3.scaleSequential(DUST_INTERP).domain([0,1]).clamp(true);

/* Camí suau Catmull-Rom amb amplada i velocitat */
function makePath(nodes){
  const out=[];
  for(let i=0;i<nodes.length-1;i++){
    const p0=nodes[Math.max(0,i-1)], p1=nodes[i], p2=nodes[i+1], p3=nodes[Math.min(nodes.length-1,i+2)];
    for(let j=0;j<12;j++){
      const t=j/12, t2=t*t, t3=t2*t;
      const cr=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3);
      out.push([cr(0),cr(1),lerp(p1[2],p2[2],t),lerp(p1[3],p2[3],t)]);
    }
  }
  const last=nodes[nodes.length-1];
  out.push([last[0],last[1],last[2],last[3]]);
  const L=[0];
  for(let i=1;i<out.length;i++) L.push(L[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
  function idx(s){
    let lo=0, hi=L.length-1;
    while(hi-lo>1){ const md=(lo+hi)>>1; if(L[md]<=s)lo=md; else hi=md; }
    return lo;
  }
  return {
    total:L[L.length-1],
    sAt(n){ return L[Math.min(out.length-1,n*12)]; },
    at(s,q){
      s=clamp(s,0,L[L.length-1]-1e-6);
      const i=idx(s), a=out[i], b=out[i+1], t=(s-L[i])/Math.max(1e-9,L[i+1]-L[i]);
      const dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy)||1, w=lerp(a[2],b[2],t);
      return {lon:lerp(a[0],b[0],t)+(-dy/d)*q*w, lat:lerp(a[1],b[1],t)+(dx/d)*q*w, sp:lerp(a[3],b[3],t), ux:dx/d, uy:dy/d};
    }
  };
}

function polyPath(ctx,P,pts){
  ctx.beginPath();
  pts.forEach((q,i)=>{ const p=P(q[0],q[1]); if(i)ctx.lineTo(p[0],p[1]); else ctx.moveTo(p[0],p[1]); });
  ctx.closePath();
}
function scalePoly(pts,cx,cy,f){ return pts.map(p=>[cx+(p[0]-cx)*f,cy+(p[1]-cy)*f]); }

/* Geografia compartida (IBV.world) */
let WORLD=null;
function ensureWorld(cb){
  if(WORLD){ cb(WORLD); return; }
  V.world().then(w=>{ WORLD=w; cb(w); }).catch(e=>console.error("No s'ha pogut carregar el mapa",e));
}

/* MAP-01 · Mapa físic en relleu (recepta de web/sistema/mapes-b.js) adaptat a una vista que fa zoom:
   com que la projecció és equirectangular, el relleu es calcula UNA vegada en una graella lon/lat
   (una cel·la = un píxel) i a cada fotograma només s'escala amb drawImage. Dades: relleu.js (PS_DEM). */
const PS_BANDS=[[200,[243,242,239]],[500,[235,233,228]],[800,[226,223,216]],[1500,[216,212,204]],[2200,[206,202,193]],[Infinity,[196,191,182]]];
let PS_RELIEF=null;
function psRelief(){
  if(PS_RELIEF||!window.PS_DEM)return PS_RELIEF;
  const D=window.PS_DEM, s=atob(D.b64), n=s.length, z=new Float32Array(n), kq=(D.mx-D.mn)/254;
  for(let i=0;i<n;i++)z[i]=s.charCodeAt(i)*kq+D.mn;
  const nx=D.nx, ny=D.ny, cv=document.createElement("canvas"); cv.width=nx; cv.height=ny;
  const x=cv.getContext("2d"), im=x.createImageData(nx,ny), d=im.data, Z=(i,j)=>z[clamp(j,0,ny-1)*nx+clamp(i,0,nx-1)];
  const kmY=D.st*111.32;
  for(let j=0;j<ny;j++){
    const kmX=kmY*Math.cos((D.lat1-(j+.5)*D.st)*DEG);
    for(let i=0;i<nx;i++){
      const zz=Z(i,j), gx=(Z(i+1,j)-Z(i-1,j))/(2*kmX), gy=(Z(i,j-1)-Z(i,j+1))/(2*kmY);
      // ombra suau des del NO; amb cel·les de ~22 km el pendent satura abans (40 m/km)
      const sh=clamp((-gx+gy)*.65/40,-1,1)*15;
      let c;
      if(zz<-40){ const t=clamp(-zz/420,0,1); c=[234-t*48,240-t*32,248-t*12]; }   // depressions sota el mar (Qattara)
      else c=PS_BANDS.find(q=>zz<q[0])[1];
      const o=(j*nx+i)*4; d[o]=clamp(c[0]+sh,0,255); d[o+1]=clamp(c[1]+sh,0,255); d[o+2]=clamp(c[2]+sh,0,255); d[o+3]=255;
    }
  }
  x.putImageData(im,0,0);
  const iso=[];
  for(const c of d3.contours().size([nx,ny]).thresholds([500,1000,1500,2000,2500])(z)){
    const lines=[];
    for(const poly of c.coordinates)for(const ring of poly){
      let seg=[];
      for(const [gx,gy] of ring){
        if(gx<=.05||gx>=nx-1.05||gy<=.05||gy>=ny-1.05){ if(seg.length>1)lines.push(seg); seg=[]; }
        else seg.push([D.lon0+(gx+.5)*D.st,D.lat1-(gy+.5)*D.st]);
      }
      if(seg.length>1)lines.push(seg);
    }
    iso.push({type:"MultiLineString",coordinates:lines});
  }
  return (PS_RELIEF={cv,D,iso});
}

/* =====================================================================
   1. EL BODÉLÉ (MAP-19 pur + MAP-03 aquarel·la) · Scrolly
   2.200–2.800 micro-traços direccionals finíssims (0,9–1,3 px) amb estela
   de 10–14 punts en typed arrays (~26–30 s de recorregut contemplatiu),
   modulant to, llargada i densitat sobre geografia silenciosa #ECEBE8.
   ===================================================================== */
function initBodele(){
  const wrap=document.getElementById("bmap");
  if(!wrap)return;
  const lgEl=document.getElementById("bLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.blauClar,t:"Llac Megatxad",kind:"dot",a:.65},
      {c:C.grocClar,t:"Diatomita",kind:"dot",a:.85},
      {c:C.blau,t:"Vent harmattan",kind:"line",w:1.5},
      {c:C.vermell,t:"Pols del Bodélé",kind:"line",w:2}
    ]);
  }

  let MEGA=[[12.3,13.0],[12.6,14.4],[13.4,15.5],[14.5,16.4],[15.4,17.5],[16.3,18.5],[17.4,19.0],[18.6,18.9],[19.4,18.2],[19.7,17.1],[19.1,16.0],[18.3,15.1],[17.7,14.1],[17.1,12.9],[16.1,11.7],[15.0,11.0],[13.8,11.1],[12.9,11.8]];
  function polyArea(pts){
    const ring=pts.concat([pts[0]]).map(p=>p.slice());
    let a=d3.geoArea({type:"Polygon",coordinates:[ring]});
    if(a>2*Math.PI){ ring.reverse(); a=d3.geoArea({type:"Polygon",coordinates:[ring]}); }
    return a*6371*6371;
  }
  const cen=d3.polygonCentroid(MEGA);
  MEGA=scalePoly(MEGA,cen[0],cen[1],Math.sqrt(361000/polyArea(MEGA)));
  const chadC=[14.05,13.3];
  const MEGA_LOBES=[
    {lon:16.9,lat:17.4,rx:2.3,ry:1.8,rot:-.35,a:.46},
    {lon:15.1,lat:15.4,rx:2.5,ry:2.1,rot:-.2,a:.42},
    {lon:14.7,lat:12.9,rx:2.2,ry:1.7,rot:.15,a:.44},
    {lon:17.7,lat:16.1,rx:1.7,ry:1.4,rot:.1,a:.34}
  ];

  const PATH=makePath([[30,25.2,4.4,.78],[25,22.0,2.7,1.08],[20.9,18.9,.72,2.25],[18.2,17.4,1.25,1.65],[14.5,14.6,2.05,1.15],[9.5,10.5,2.75,1.0],[4.5,6.6,3.15,.98],[-1,4.6,3.35,.98],[-10,4.4,3.6,1.0],[-19,5.0,4.0,1.0],[-36,4.5,5.1,1.0]]);
  const sGap=PATH.sAt(2), sBod=PATH.sAt(3), sD=PATH.sAt(4), sEnd=PATH.total;

  const STEPS=[
    {v:[-20,42,2,36],name:"Avui",val:"El Bodélé, al nord del Txad (0,2 % del Sàhara)",monsoon:0,lake:0,shrink:0,diat:.4,wind:0,dust:.34,reach:.07,spot:1,inset:0},
    {v:[4,30,6,25],name:"Fa entre 11.500 i 5.000 anys",val:"El llac Megatxad: uns 361.000 km², onze vegades Catalunya",monsoon:1,lake:1,shrink:0,diat:0,wind:0,dust:0,reach:0,spot:0,inset:0},
    {v:[4,30,6,25],name:"Fa uns 1.000 anys",val:"Les pluges es retiren i el Bodélé queda sec",monsoon:.1,lake:1,shrink:1,diat:.72,wind:0,dust:0,reach:0,spot:0,inset:0},
    {v:[11,25,12,22.5],name:"Avui",val:"Un fons de diatomita: closques de sílice d'algues d'aigua dolça",monsoon:0,lake:0,shrink:1,diat:1,wind:0,dust:0,reach:0,spot:0,inset:1},
    {v:[8,31,9,26.5],name:"Avui, de desembre a març",val:"L'harmattan s'accelera entre el Tibesti i l'Ennedi",monsoon:0,lake:0,shrink:1,diat:1,wind:1,dust:1,reach:.14,spot:0,inset:0},
    {v:[-38,32,-8,30],name:"Avui, de desembre a març",val:"La pols viatja cap al golf de Guinea i l'Atlàntic",monsoon:0,lake:0,shrink:1,diat:1,wind:.48,dust:1,reach:1,spot:0,inset:0}
  ];

  /* Només 2–3 anotacions quirúrgiques de mecanisme per pas (P4 + MAP-19) */
  const ANNS=[
    {lon:17.6,lat:17.3,lines:[["Bodélé",true],["0,2 % del Sàhara"]],dx:22,dy:22,lead:true,steps:[0]},
    {lon:4,lat:25.5,lines:[["Sàhara",true]],anchor:"middle",steps:[0]},
    {lon:16.2,lat:15.2,lines:[["Llac Megatxad",true],["361.000 km², fins a 160 m"]],dx:-76,dy:24,anchor:"end",lead:true,steps:[1]},
    {lon:14.1,lat:13.3,lines:[["Llac Txad",true],["el que en queda avui"]],dx:-46,dy:28,anchor:"end",lead:true,steps:[2]},
    {lon:17.6,lat:17.2,lines:[["Bodélé",true],["sec fa uns mil anys"]],dx:36,dy:-30,lead:true,steps:[2]},
    {lon:18.6,lat:21.0,lines:[["Tibesti",true]],dx:-36,dy:-14,anchor:"end",lead:true,hm:true,steps:[3,4]},
    {lon:22.4,lat:17.0,lines:[["Ennedi",true]],dx:28,dy:18,lead:true,hm:true,steps:[3,4]},
    {lon:18.0,lat:16.6,lines:[["Diatomita",true],["closques de sílice al fons"]],dx:34,dy:28,lead:true,steps:[3]},
    {lon:20.9,lat:18.9,lines:[["Embut de vent",true],["l'harmattan s'accelera entre relleus"]],dx:28,dy:-26,lead:true,steps:[4]},
    {lon:17.6,lat:17.2,lines:[["Bodélé",true],["~700.000 t per tempesta"]],dx:-32,dy:34,anchor:"end",lead:true,steps:[4]},
    {lon:17.6,lat:17.3,lines:[["Bodélé",true]],dx:18,dy:-18,lead:true,steps:[5]},
    {lon:-9,lat:4.8,lines:[["Cap a l'Atlàntic",true],["← rumb a l'Amazònia"]],dx:-12,dy:-26,anchor:"end",lead:true,steps:[5]}
  ];

  const POIS=[
    {n:"Depressió del Bodélé",d:"0,2 % del Sàhara · ~700.000 t per tempesta",lon:17.7,lat:17.2},
    {n:"Massís del Tibesti",d:"Muntanyes al nord-oest del pas de l'harmattan",lon:18.6,lat:21.0},
    {n:"Altiplà de l'Ennedi",d:"Relleu al sud-est que estreny el vent",lon:22.4,lat:17.0},
    {n:"Llac Txad",d:"Resta actual de l'antic Megatxad",lon:14.1,lat:13.3},
    {n:"Golf de Guinea",d:"Sortida de la pols cap a l'Atlàntic equatorial",lon:3.0,lat:3.0}
  ];

  let step=0, view=STEPS[0].v.slice(), tgt=STEPS[0].v.slice();
  const st={monsoon:0,lake:0,shrink:0,diat:.4,wind:0,dust:.34,reach:.07,spot:1,inset:0};
  const tg=Object.assign({},st);
  let activeLoop=null, drawFn=null;

  function setStep(i){
    step=i;
    const S=STEPS[i];
    Object.keys(tg).forEach(k=>{ tg[k]=S[k]||0; });
    if(i!==3)st.inset=0;
    tgt=S.v.slice();
    if(V.reduced)view=tgt.slice();
    const bn=document.getElementById("bName"), bv=document.getElementById("bVal");
    if(bn)bn.textContent=S.name;
    if(bv)bv.textContent=S.val;
    if(V.reduced&&drawFn)drawFn();
  }

  const rnd=V.rng(101);
  const tri=()=>(rnd()+rnd()-1);

  const mnt=V.mount(wrap,(el,W)=>{
    if(activeLoop){ activeLoop.stop(); activeLoop=null; }
    if(!WORLD){ ensureWorld(()=>mnt.redraw()); return; }
    const mob=isMob(W);
    /* Pressupost mòbil guia-mobil.md: ≤ 260 px dins .graphic */
    const H=mob
      ?Math.round(Math.max(200,Math.min(window.innerHeight*.30,260)))
      :Math.round(Math.min(W*.64,Math.min(Math.max(320,window.innerHeight-200),520)));

    d3.select(el).selectAll("canvas.ibv,svg.ibv").remove();
    const {c:cv,ctx}=V.canvas(el,W,H,"Mapa del nord d'Àfrica: depressió del Bodélé al Txad, antic llac Megatxad, diatomita, vent harmattan entre el Tibesti i l'Ennedi i pols cap a l'Atlàntic. Esquema.");
    const svg=d3.select(el).append("svg").attr("class","ibv ibv-ov").attr("width",W).attr("height",H)
      .attr("viewBox",`0 0 ${W} ${H}`).style("font-family",V.SANS).attr("aria-hidden","true");
    const gAnn=svg.append("g").attr("pointer-events","none");
    const gHl=svg.append("g").attr("pointer-events","none");
    const hit=svg.append("rect").attr("width",W).attr("height",H).attr("fill","transparent").attr("class","ibv-hit");
    const tp=V.tip(el);

    const dpr=Math.min(2,window.devicePixelRatio||1);
    const baseCv=document.createElement("canvas");
    baseCv.width=Math.round(W*dpr); baseCv.height=Math.round(H*dpr);
    const baseCtx=baseCv.getContext("2d");

    let k=1, tx=0, ty=0, proj=null, baseDirty=true, lastViewKey="";
    function fit(){
      k=Math.min(W/((view[1]-view[0])*DEG),H/((view[3]-view[2])*DEG));
      tx=W/2-k*(view[0]+view[1])/2*DEG;
      ty=H/2+k*(view[2]+view[3])/2*DEG;
      proj=d3.geoEquirectangular().scale(k).translate([tx,ty]);
      baseDirty=true;
    }
    const P=(lon,lat)=>[tx+k*lon*DEG,ty-k*lat*DEG];
    const inv=(x,y)=>[(x-tx)/(k*DEG),(ty-y)/(k*DEG)];
    fit();

    function drawBase(){
      baseCtx.setTransform(dpr,0,0,dpr,0,0);
      baseCtx.clearRect(0,0,W,H);
      const gp=d3.geoPath(proj,baseCtx);
      /* MAP-19: geografia ultra-silenciosa #ECEBE8 sobre paper blanc, fronteres blanques */
      baseCtx.strokeStyle=C.grid; baseCtx.lineWidth=.45;
      baseCtx.beginPath(); gp(d3.geoGraticule().step([10,10])()); baseCtx.stroke();
      baseCtx.fillStyle=C.land;
      baseCtx.beginPath(); gp(WORLD.land); baseCtx.fill();
      /* MAP-01: relleu físic real a sobre de la terra (Tibesti, Ennedi, Ahaggar, la cubeta del Txad) */
      const RL=psRelief();
      if(RL){
        const D=RL.D, a=P(D.lon0,D.lat1), sc=k*DEG*D.st;
        baseCtx.save(); baseCtx.beginPath(); gp(WORLD.land); baseCtx.clip();
        baseCtx.imageSmoothingEnabled=true; baseCtx.drawImage(RL.cv,a[0],a[1],D.nx*sc,D.ny*sc);
        baseCtx.strokeStyle=V.alpha(C.ink,.14); baseCtx.lineWidth=.55;
        RL.iso.forEach(g=>{ baseCtx.beginPath(); gp(g); baseCtx.stroke(); });
        baseCtx.restore();
        baseCtx.strokeStyle="#ABA8A1"; baseCtx.lineWidth=.9;
        baseCtx.beginPath(); gp(WORLD.land); baseCtx.stroke();
      }
      baseCtx.strokeStyle=RL?"rgba(255,255,255,.7)":"#FFFFFF"; baseCtx.lineWidth=RL?.6:.75;
      baseCtx.beginPath(); gp(WORLD.borders); baseCtx.stroke();
      const eq0=P(-180,0), eq1=P(180,0);
      baseCtx.save(); baseCtx.setLineDash([2,4]); baseCtx.strokeStyle=C.muted; baseCtx.globalAlpha=.4; baseCtx.lineWidth=.55;
      baseCtx.beginPath(); baseCtx.moveTo(eq0[0],eq0[1]); baseCtx.lineTo(eq1[0],eq1[1]); baseCtx.stroke(); baseCtx.restore();
      baseDirty=false;
    }

    /* Motor MAP-19 en typed arrays: 2.500 micro-traços (1.150 a mòbil) amb estela de 10–13 punts */
    const KT=mob?10:13, BINS=5;
    const NW=mob?340:760, ND=mob?820:1780;
    const WXS=new Float32Array(NW*KT), WYS=new Float32Array(NW*KT), WHD=new Uint8Array(NW), WNN=new Uint8Array(NW), WBIN=new Uint8Array(NW);
    const WS=new Float32Array(NW), WQ=new Float32Array(NW);
    const DXS=new Float32Array(ND*KT), DYS=new Float32Array(ND*KT), DHD=new Uint8Array(ND), DNN=new Uint8Array(ND), DBIN=new Uint8Array(ND);
    const DS=new Float32Array(ND), DQ=new Float32Array(ND), DU=new Float32Array(ND), DSH=new Float32Array(ND);
    const WIDX=d3.range(BINS).map(()=>new Uint32Array(NW)), WCNT=new Uint32Array(BINS);
    const DIDX=d3.range(BINS).map(()=>new Uint32Array(ND)), DCNT=new Uint32Array(BINS);
    const wCols=d3.range(BINS).map(b=>WIND_SC((b+.5)/BINS));
    const dCols=d3.range(BINS).map(b=>DUST_SC(.18+(b+.5)/BINS*.82));

    function spW(i,pre){
      WS[i]=pre?rnd()*sD:rnd()*sGap*.65;
      WQ[i]=tri()*1.05;
      WHD[i]=0; WNN[i]=0;
    }
    function spD(i,pre){
      DS[i]=sBod+(pre?rnd()*3.2:(rnd()-.5)*.7);
      DQ[i]=tri()*.88;
      DU[i]=Math.pow(rnd(),.58);
      DSH[i]=rnd();
      DHD[i]=0; DNN[i]=0;
    }
    for(let i=0;i<NW;i++)spW(i,true);
    for(let i=0;i<ND;i++)spD(i,true);

    const monsoonPts=[], diatDots=[];
    for(let i=0;i<(mob?110:220);i++) monsoonPts.push([4+rnd()*26,8+rnd()*17,rnd()]);
    for(let i=0;i<(mob?80:160);i++) diatDots.push([17.65+(rnd()+rnd()-1)*1.15,17.25+(rnd()+rnd()-1)*.95,.7+rnd()*1.1]);

    function drawDiatom(alpha){
      if(alpha<.02||W<340||mob)return;
      const r=Math.round(Math.min(40,W*.058));
      const x=W-r-24, y=r+18;
      ctx.save(); ctx.globalAlpha=alpha;
      ctx.fillStyle="rgba(255,255,255,.94)";
      ctx.beginPath(); ctx.arc(x,y,r+7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=C.hair; ctx.lineWidth=.8; ctx.stroke();
      ctx.strokeStyle=C.ink2; ctx.lineWidth=.7;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x,y,r*.3,0,Math.PI*2); ctx.stroke();
      ctx.beginPath();
      for(let i=0;i<36;i++){
        const a=i/36*Math.PI*2;
        ctx.moveTo(x+Math.cos(a)*r*.34,y+Math.sin(a)*r*.34);
        ctx.lineTo(x+Math.cos(a)*r*.94,y+Math.sin(a)*r*.94);
      }
      ctx.stroke();
      ctx.fillStyle=C.ink;
      ctx.beginPath();
      for(let i=0;i<36;i++){
        const a=(i+.5)/36*Math.PI*2, px=x+Math.cos(a)*r*.68, py=y+Math.sin(a)*r*.68;
        ctx.moveTo(px+.85,py); ctx.arc(px,py,.85,0,Math.PI*2);
      }
      ctx.fill();
      ctx.font=`11.5px ${V.SANS}`; ctx.fillStyle=C.ink2; ctx.textAlign="center";
      ctx.fillText("Diatomea (esquema)",x,y+r+20);
      ctx.restore();
    }

    function drawMountains(lon0,lon1,lat0,lat1){
      let n=0; const s=clamp(k*DEG*.15,2,4.8);
      for(let la=lat1;la>=lat0;la-=.58){
        for(let lo=lon0+(n%2)*.3;lo<=lon1;lo+=.62){
          const dx=(lo-(lon0+lon1)/2)/((lon1-lon0)/2), dy=(la-(lat0+lat1)/2)/((lat1-lat0)/2);
          if(dx*dx+dy*dy>1)continue;
          const p=P(lo,la);
          ctx.moveTo(p[0]-s,p[1]+s*.5); ctx.lineTo(p[0],p[1]-s*.5); ctx.lineTo(p[0]+s,p[1]+s*.5);
        }
        n++;
      }
    }

    function renderAnns(){
      gAnn.selectAll("*").remove();
      const countries=[["Txad",20.8,13.4],["Níger",9.5,17.5],["Líbia",18,26.5],["Sudan",29,14],["Nigèria",8,9.6],["Algèria",3,28],["Mali",-2,18]];
      countries.forEach(([nm,lo,la])=>{
        const q=P(lo,la);
        if(q[0]>28&&q[0]<W-28&&q[1]>16&&q[1]<H-14&&!(st.lake>.5&&nm==="Txad")){
          V.t(gAnn,q[0],q[1],nm,{size:mob?11:11.5,fill:C.muted,anchor:"middle",halo:2.5});
        }
      });
      const K=clamp(W/860,.62,1.12);
      ANNS.forEach(a=>{
        if(a.steps.indexOf(step)<0)return;
        if(mob&&a.hm)return;
        const p=P(a.lon,a.lat);
        if(p[0]<-10||p[0]>W+10||p[1]<-10||p[1]>H+10)return;
        const anc=a.anchor||(p[0]>W*.62?"end":"start");
        const tx2=clamp(p[0]+(a.dx||0)*K,anc==="end"?92:10,anc==="end"?W-10:W-102);
        const ty2=clamp(p[1]+(a.dy||0)*K,16,H-18);
        if(a.lead){
          V.note(gAnn,{x:p[0],y:p[1],tx:tx2,ty:ty2,lines:a.lines,kind:"elbow",anchor:anc,dot:true,size:mob?11.5:12.5,italic:a.italic});
        }else{
          V.lines(gAnn,tx2,ty2,a.lines,{anchor:anc,halo:3,size:mob?11.5:12.5,italic:a.italic,fill:a.italic?C.ink2:C.ink});
        }
      });
    }

    function stepParticles(dt,moving){
      const reachS=lerp(sD+1.2,sEnd,st.reach);
      /* ~28 s de recorregut contemplatiu (MAP-19) */
      const spd=.62*clamp((view[1]-view[0])/28,.62,2.0);
      if(st.wind>.02){
        const limW=sD+(st.reach>.5?3.5:.4);
        for(let i=0;i<NW;i++){
          const q=PATH.at(WS[i],WQ[i]);
          WS[i]+=q.sp*spd*1.04*dt;
          if(moving)WNN[i]=0;
          if(WS[i]>limW){ spW(i,false); continue; }
          const p=P(q.lon,q.lat);
          const nh=(WHD[i]+1)%KT; WHD[i]=nh;
          WXS[i*KT+nh]=p[0]; WYS[i*KT+nh]=p[1];
          if(WNN[i]<KT)WNN[i]++;
          /* Modula el to blau per la velocitat dins l'embut Tibesti–Ennedi */
          const spN=clamp((q.sp-.75)/1.55,0,1);
          WBIN[i]=Math.min(BINS-1,(spN*BINS)|0);
        }
      }
      if(st.dust>.02){
        for(let i=0;i<ND;i++){
          const q=PATH.at(DS[i],DQ[i]);
          DS[i]+=q.sp*spd*dt;
          if(moving)DNN[i]=0;
          if(DS[i]>lerp(sBod+1.4,reachS,DU[i])||DS[i]>=sEnd-.02){ spD(i,false); continue; }
          const p=P(q.lon,q.lat);
          const nh=(DHD[i]+1)%KT; DHD[i]=nh;
          DXS[i*KT+nh]=p[0]; DYS[i*KT+nh]=p[1];
          if(DNN[i]<KT)DNN[i]++;
          /* Modula el to càlid per nucli del plomall + intensitat */
          const core=1-Math.min(1,Math.abs(DQ[i])/.9);
          const inten=clamp(core*.65+((q.sp-.8)/1.4)*.25+DSH[i]*.18,0,.999);
          DBIN[i]=Math.min(BINS-1,(inten*BINS)|0);
        }
      }
    }

    function drawTrails(N,XS,YS,HD,NN,BIN,IDX,CNT,cols,alphaScale,wMin,wMax){
      CNT.fill(0);
      for(let i=0;i<N;i++){ if(NN[i]>1){ const b=BIN[i]; IDX[b][CNT[b]++]=i; } }
      ctx.lineCap="round";
      for(let seg=0;seg<KT-1;seg++){
        const al=alphaScale*Math.pow(1-seg/(KT-1),1.3);
        if(al<.015)continue;
        for(let b=0;b<BINS;b++){
          const c=CNT[b], ix=IDX[b];
          if(!c)continue;
          ctx.strokeStyle=cols[b];
          ctx.globalAlpha=al;
          ctx.lineWidth=lerp(wMin,wMax,b/(BINS-1));
          ctx.beginPath();
          for(let t=0;t<c;t++){
            const i=ix[t];
            if(NN[i]-1<=seg)continue;
            const a=i*KT+(HD[i]-seg+KT)%KT;
            const bb=i*KT+(HD[i]-seg-1+KT)%KT;
            ctx.moveTo(XS[a],YS[a]);
            ctx.lineTo(XS[bb],YS[bb]);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha=1;
    }

    function paint(){
      if(baseDirty)drawBase();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.drawImage(baseCv,0,0);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      /* Monsó humit fa 11.500–5.000 anys (traços fins en blau) */
      if(st.monsoon>.02){
        ctx.save();
        ctx.strokeStyle=V.alpha(C.blau,.20*st.monsoon);
        ctx.lineWidth=.85; ctx.lineCap="round";
        ctx.beginPath();
        monsoonPts.forEach(m=>{
          const p=P(m[0],m[1]);
          ctx.moveTo(p[0],p[1]); ctx.lineTo(p[0]-2.8,p[1]+6);
        });
        ctx.stroke();
        ctx.restore();
      }

      /* MAP-03 Aquarel·la: Llac Megatxad i Llac Txad actual (radialGradient + multiply, sense polígons rígids) */
      if(st.lake>.01){
        const ff=lerp(1,.18,sm(st.shrink));
        const lakeA=st.lake*(1-.78*sm(st.shrink));
        ctx.save();
        ctx.globalCompositeOperation="multiply";
        MEGA_LOBES.forEach(lb=>{
          const lon=chadC[0]+(lb.lon-chadC[0])*ff;
          const lat=chadC[1]+(lb.lat-chadC[1])*ff;
          const p=P(lon,lat);
          const rx=lb.rx*ff*k*DEG, ry=lb.ry*ff*k*DEG;
          wcBlob(ctx,p[0],p[1],rx,ry,C.blauClar,lb.a*lakeA,lb.rot);
          wcBlob(ctx,p[0],p[1],rx*.62,ry*.62,C.blau,.24*lakeA,lb.rot);
        });
        ctx.restore();
        /* Contorn subtilíssim de riba antiga només a màxima extensió */
        if(lakeA>.3){
          ctx.save();
          ctx.globalAlpha=(lakeA-.3)*.45;
          ctx.setLineDash([2.5,3]);
          polyPath(ctx,P,scalePoly(MEGA,chadC[0],chadC[1],ff));
          ctx.strokeStyle=C.blau; ctx.lineWidth=.6; ctx.stroke();
          ctx.restore();
        }
      }
      const chadA=Math.max(sm(st.shrink),1-st.lake)*clamp(1-st.reach*.2,0,1);
      if(chadA>.02&&(st.shrink>.05||st.lake<.99)){
        const cp=P(chadC[0],chadC[1]), cr=Math.max(4.5,.75*k*DEG);
        ctx.save(); ctx.globalCompositeOperation="multiply";
        wcBlob(ctx,cp[0],cp[1],cr*1.4,cr*1.1,C.blau,.55*chadA,-.2);
        ctx.restore();
      }

      /* MAP-03 Aquarel·la: Conca de diatomita del Bodélé (grocClar + vermellClar multiply) */
      if(st.diat>.01){
        const dp=P(17.65,17.25);
        const rx=Math.max(10,1.55*k*DEG), ry=Math.max(8,1.15*k*DEG);
        ctx.save(); ctx.globalCompositeOperation="multiply";
        wcBlob(ctx,dp[0],dp[1],rx*1.35,ry*1.35,C.grocClar,.68*st.diat,-.25);
        wcBlob(ctx,dp[0]+rx*.12,dp[1]-ry*.08,rx*.78,ry*.68,C.groc,.32*st.diat,.1);
        ctx.restore();
        if(st.inset>.15){
          ctx.save(); ctx.fillStyle=V.alpha(C.ink2,.28*st.inset);
          ctx.beginPath();
          for(let i=0;i<diatDots.length;i++){
            const q=P(diatDots[i][0],diatDots[i][1]), pr=diatDots[i][2];
            ctx.moveTo(q[0]+pr,q[1]); ctx.arc(q[0],q[1],pr,0,Math.PI*2);
          }
          ctx.fill(); ctx.restore();
        }
      }

      /* Muntanyes Tibesti i Ennedi */
      const mA=clamp(st.diat*1.15,0,1)*(1-st.lake*.65);
      if(mA>.02&&!PS_RELIEF){   // amb el relleu real, els símbols de muntanya sobren
        ctx.save(); ctx.globalAlpha=mA*.48; ctx.strokeStyle=C.ink2; ctx.lineWidth=.7; ctx.lineJoin="round";
        ctx.beginPath(); drawMountains(16.4,20.6,19.4,22.6); drawMountains(21.2,23.8,15.9,18.4); ctx.stroke();
        ctx.restore();
      }

      /* MAP-19: Micro-traços direccionals de vent harmattan (blau seqüencial) */
      if(st.wind>.02){
        drawTrails(NW,WXS,WYS,WHD,WNN,WBIN,WIDX,WCNT,wCols,.56*st.wind,.85,1.25);
      }

      /* MAP-19: Micro-traços direccionals de pols del Bodélé (càlid vermell–vermellFosc) */
      if(st.dust>.02){
        drawTrails(ND,DXS,DYS,DHD,DNN,DBIN,DIDX,DCNT,dCols,.76*st.dust,.9,1.3);
      }

      /* Pas 0: Cercle d'aquarel·la translúcid multiply al Bodélé (MAP-03) */
      if(st.spot>.02){
        const b=P(17.7,17.2), R=mob?18:26;
        ctx.save(); ctx.globalCompositeOperation="multiply";
        wcBlob(ctx,b[0],b[1],R,R,C.vermell,.48*st.spot,0);
        ctx.restore();
        ctx.save(); ctx.fillStyle=V.alpha(C.vermell,st.spot);
        ctx.beginPath(); ctx.arc(b[0],b[1],3.2,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }

      drawDiatom(st.inset);
    }

    for(let i=0;i<18;i++)stepParticles(.12,false);
    renderAnns();
    paint();

    drawFn=()=>{
      Object.keys(tg).forEach(k=>{ st[k]=tg[k]; });
      view=tgt.slice(); fit();
      WNN.fill(0); DNN.fill(0);
      for(let i=0;i<16;i++)stepParticles(.12,false);
      renderAnns(); paint();
    };

    /* Hover MAP-19: línia de corrent en tinta + punt d'interès al dock */
    V.hover(hit.node(),(ev,[px,py])=>{
      const [lon,lat]=inv(px,py);
      let near=null, best=Infinity;
      POIS.forEach(q=>{
        const qp=P(q.lon,q.lat), dist=Math.hypot(qp[0]-px,qp[1]-py);
        if(dist<best){ best=dist; near=q; }
      });
      gHl.selectAll("*").remove();
      /* Si estem en un pas amb vent o pols, dibuixem la línia de corrent (MAP-19) */
      if(st.wind>.2||st.dust>.5){
        let bestS=sBod, bestD=Infinity, bestQ=0;
        for(let s=0;s<sEnd;s+=.6){
          const q=PATH.at(s,0), dd=Math.hypot(q.lon-lon,q.lat-lat);
          if(dd<bestD){ bestD=dd; bestS=s; }
        }
        if(bestD<8){
          const q0=PATH.at(bestS,0);
          bestQ=clamp(((lon-q0.lon)*(-q0.uy)+(lat-q0.lat)*q0.ux)/2.5,-1,1);
          const pts=[];
          for(let s=Math.max(0,bestS-3);s<=Math.min(sEnd-.1,bestS+7);s+=.4){
            const qr=PATH.at(s,bestQ*.5); pts.push(P(qr.lon,qr.lat));
          }
          if(pts.length>2){
            const dStr=d3.line().curve(d3.curveBasis)(pts);
            gHl.append("path").attr("d",dStr).attr("fill","none").attr("stroke","#fff").attr("stroke-width",4).attr("stroke-linecap","round");
            gHl.append("path").attr("d",dStr).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.35).attr("stroke-linecap","round");
            const e=pts[pts.length-1], e0=pts[pts.length-3];
            arrowHead(gHl,e[0],e[1],Math.atan2(e[1]-e0[1],e[0]-e0[0]),{L:6.5,sw:1.35});
          }
        }
        cv.style.opacity=.58;
      }
      gHl.append("circle").attr("cx",px).attr("cy",py).attr("r",4.2).attr("fill",C.vermell).attr("stroke",C.ink).attr("stroke-width",1.4);
      gAnn.style("opacity",.52);
      if(near&&best<(mob?48:70)){
        tp.show(`<b>${near.n}</b><br>${near.d}`);
      }else{
        tp.show(`<b>${STEPS[step].name}</b><br>${llFmt(lon,lat)} · ${STEPS[step].val}`);
      }
    },()=>{
      gHl.selectAll("*").remove();
      cv.style.opacity=1;
      gAnn.style("opacity",1);
      tp.hide();
    });

    activeLoop=V.loop(el,(t,dtMs)=>{
      const dt=Math.min(.05,(dtMs||16)/1000);
      for(const key in tg){
        st[key]+=(tg[key]-st[key])*Math.min(1,dt*2.4);
        if(Math.abs(tg[key]-st[key])<.002)st[key]=tg[key];
      }
      let mv=false;
      const easeK=Math.min(1,dt*2.4);
      for(let i=0;i<4;i++){
        const d=tgt[i]-view[i];
        if(Math.abs(d)>.02){ view[i]+=d*easeK; mv=true; } else view[i]=tgt[i];
      }
      if(mv)fit();
      const vk=step+":"+view.map(v=>v.toFixed(2)).join(",");
      if(vk!==lastViewKey){ lastViewKey=vk; renderAnns(); }
      stepParticles(dt,mv);
      paint();
    });
  });

  if(window.IB&&IB.scrolly){
    IB.scrolly(document.getElementById("bsteps"),document.getElementById("bgraphic"),i=>setStep(i));
  }
}

/* =====================================================================
   2. TALL DE LA CAPA D'AIRE DEL SÀHARA (HOW-01) + ANELL ESTACIONAL (TIME-11/TIME-10)
   Gravat atmosfèric amb ploma SAL en aquarel·la vermell→groc sobre aire marí
   blau, micro-traços lents seguint la inversió tèrmica, i mini rellotge
   estacional integrat a escriptori que mostra els 12 mesos en temps real.
   ===================================================================== */
function initSAL(){
  const wrap=document.getElementById("salWrap");
  if(!wrap)return;
  const lgEl=document.getElementById("salLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.vermell,t:"Capa d'aire del Sàhara (pols)",kind:"dot",a:.48},
      {c:C.blau,t:"Aire marí fresc / Amazònia",kind:"dot",a:.38},
      {c:C.grocClar,t:"Sàhara (terra)",kind:"dot",a:.9}
    ]);
  }

  const seg=[...document.querySelectorAll("#salSeg button")];
  const titleEl=document.getElementById("salTitle"), subEl=document.getElementById("salSub"), playB=document.getElementById("salPlay");
  const TOPW=[[-92,1.6],[-50,2],[-17,3],[22,3]], BOTW=[[-92,0],[22,0]];
  const TOPS=[[-92,2],[-75,2.6],[-50,3.6],[-30,4.8],[-17,5],[0,5.5],[22,5.5]], BOTS=[[-92,0],[-75,.25],[-50,.6],[-30,1],[-19,1],[-16,0],[22,0]];
  const SUMW=[0,.45,1,.55], DEST=[0,0,1,1];
  const DESC=[
    "De 0 a 3 km a la costa africana i baixa a 0–2 km prop de Sud-amèrica",
    "Transició entre hivern i estiu · és quan més pols cau a l'Amazònia",
    "D'1 a 5 km a la costa africana, amb aire fresc del mar a sota",
    "La capa torna a baixar cap al sud · és l'època amb menys pols"
  ];

  function geo(sv){ const i=Math.floor(sv)%4, j=(i+1)%4, f=sm(sv-Math.floor(sv)); return {w:lerp(SUMW[i],SUMW[j],f),d:lerp(DEST[i],DEST[j],f)}; }
  function topAt(lon,w){ return lerp(pw(TOPW,lon),pw(TOPS,lon),w); }
  function botAt(lon,w){ return lerp(pw(BOTW,lon),pw(BOTS,lon),w); }

  let cur=0, sv=0, playing=false, pt=0, activeLoop=null, redrawStatic=null, updateRing=null;

  function setSeason(i){
    cur=i;
    seg.forEach((b,k)=>b.setAttribute("aria-pressed",String(k===i)));
    const S=SEAS[i];
    if(titleEl)titleEl.textContent=`Tall de la capa d'aire del Sàhara · ${S.n}`;
    if(subEl)subEl.textContent=`${DESC[i]} · Surt el ${S.out} % anual · Amazònia: ${S.amz}`;
    if(updateRing)updateRing(i);
    if(V.reduced){ sv=i; if(redrawStatic)redrawStatic(); }
  }
  seg.forEach((b,k)=>b.addEventListener("click",()=>{ playing=false; if(playB)playB.textContent="Reprodueix l'any"; setSeason(k); }));
  if(playB)playB.addEventListener("click",()=>{ playing=!playing; playB.textContent=playing?"Pausa":"Reprodueix l'any"; pt=0; });
  setSeason(0);

  const rnd=V.rng(202);
  const L0=-92, L1=22;

  V.mount(wrap,(el,W)=>{
    if(activeLoop){ activeLoop.stop(); activeLoop=null; }
    const mob=isMob(W), hasRing=W>=720;
    const H=mob?276:356;
    const mainW=hasRing?Math.round(W*.72):W;
    const mg={l:mob?34:42,r:14,t:20,b:30};

    d3.select(el).selectAll("canvas.ibv,svg.ibv").remove();
    const {c:cv,ctx}=V.canvas(el,mainW,H,"Tall vertical de l'atmosfera des del Sàhara fins a Amèrica. La capa d'aire del Sàhara va de 0 a 3 km a l'hivern i d'1 a 5 km a l'estiu a la costa africana, sobre aire marí més fresc.");
    const svg=d3.select(el).append("svg").attr("class","ibv ibv-ov").attr("width",W).attr("height",H)
      .attr("viewBox",`0 0 ${W} ${H}`).style("font-family",V.SANS).attr("aria-hidden","true");
    const tp=V.tip(el);

    const x=d3.scaleLinear([L0,L1],[mg.l,mainW-mg.r]);
    const y=d3.scaleLinear([0,7],[H-mg.b,mg.t]);
    const y0=y(0);

    /* Eixos recessius (IBV.gridY + IBV.axisX) */
    const gAxes=svg.append("g").attr("pointer-events","none");
    V.gridY(gAxes,y,mg.l,mainW-mg.r,[0,2,4,6],f0,{zero:0,unit:" km"});
    const xTicks=mob?[-80,-40,0,20]:[-80,-60,-40,-20,0,20];
    V.axisX(gAxes,x,y0,xTicks,v=>v===0?"0°":v>0?`${v}° E`:`${-v}° O`,{tick:false});

    const gAnn=svg.append("g").attr("pointer-events","none");
    const gHl=svg.append("g").attr("pointer-events","none");
    const hit=svg.append("rect").attr("x",mg.l).attr("y",mg.t).attr("width",mainW-mg.l-mg.r).attr("height",H-mg.t-mg.b).attr("fill","transparent").attr("class","ibv-hit");

    /* Mini anell estacional TIME-11 / TIME-10 integrat a escriptori */
    let ringWedge=null, ringCenterA=null, ringCenterB=null;
    if(hasRing){
      const rx0=mainW+16, rW=W-rx0, cx=rx0+rW/2, cy=H*.51;
      const R=Math.min(rW*.41,H*.34), rIn=18;
      const gRing=svg.append("g").attr("class","sal-ring");
      V.t(gRing,cx,mg.t+2,"Cicle anual (12 mesos)",{anchor:"middle",size:12,weight:700,fill:C.ink});
      V.t(gRing,cx,mg.t+16,"surt d'Àfrica · cau a l'Amazònia",{anchor:"middle",size:11,fill:C.muted});

      V.polarGrid(gRing,cx,cy,R,4,12,{rIn,stroke:C.grid,outer:C.hair});
      /* Inicials dels 12 mesos (gener a dalt, sentit horari) */
      V.MES1.forEach((m,i)=>{
        const a=(i+.5)/12*Math.PI*2;
        V.t(gRing,cx+(R+11)*Math.sin(a),cy-(R+11)*Math.cos(a)+3.5,m,{anchor:"middle",size:11,fill:C.muted});
      });

      /* Pètals polars translúcids multiply (scaleSqrt perquè mani l'àrea) */
      const months=d3.range(12).map(m=>({m,out:fluxM(m+.5),amz:amzM(m+.5)}));
      const rOut=d3.scaleSqrt([0,16],[rIn,R*.96]);
      const rAmz=d3.scaleSqrt([0,6.5],[rIn,R*.78]);
      const areaOut=d3.areaRadial().angle(d=>(d.m+.5)/12*Math.PI*2).innerRadius(rIn).outerRadius(d=>rOut(d.out)).curve(d3.curveCardinalClosed);
      const areaAmz=d3.areaRadial().angle(d=>(d.m+.5)/12*Math.PI*2).innerRadius(rIn).outerRadius(d=>rAmz(d.amz)).curve(d3.curveCardinalClosed);

      const gPetals=gRing.append("g").attr("transform",`translate(${cx},${cy})`);
      /* Sector actiu de l'estació (0=des–feb, 1=mar–mai, 2=jun–ag, 3=set–nov) */
      const sArc=d3.arc().innerRadius(rIn).outerRadius(R);
      const sAngles=[[11/12*2*Math.PI,14/12*2*Math.PI],[2/12*2*Math.PI,5/12*2*Math.PI],[5/12*2*Math.PI,8/12*2*Math.PI],[8/12*2*Math.PI,11/12*2*Math.PI]];
      ringWedge=gPetals.append("path").attr("fill",V.alpha(C.grocClar,.36)).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");

      gPetals.append("path").datum(months).attr("d",areaOut)
        .attr("fill",V.alpha(C.vermell,.24)).attr("stroke",C.vermell).attr("stroke-width",1.15).style("mix-blend-mode","multiply");
      gPetals.append("path").datum(months).attr("d",areaAmz)
        .attr("fill",V.alpha(C.blau,.26)).attr("stroke",C.blau).attr("stroke-width",1.15).style("mix-blend-mode","multiply");

      /* Quadrants clicables per canviar d'estació */
      sAngles.forEach((ang,si)=>{
        gPetals.append("path").attr("d",sArc({startAngle:ang[0],endAngle:ang[1]}))
          .attr("fill","transparent").style("cursor","pointer")
          .on("click",()=>{ playing=false; if(playB)playB.textContent="Reprodueix l'any"; setSeason(si); })
          .on("pointerenter",()=>{
            const S=SEAS[si];
            tp.show(`<b>${S.n} (${S.m})</b><br>Surt el ${S.out} % anual · Amazònia: ${S.amz}`);
          })
          .on("pointerleave",()=>tp.hide());
      });

      /* Lectura neta sota l'anell */
      ringCenterA=V.t(gRing,cx,cy+R+28,"",{anchor:"middle",size:12.5,weight:700,fill:C.ink});
      ringCenterB=V.t(gRing,cx,cy+R+43,"",{anchor:"middle",size:11.5,fill:C.ink2});
      updateRing=si=>{
        const S=SEAS[si], a=sAngles[si];
        ringWedge.transition().duration(V.reduced?0:360).attr("d",sArc({startAngle:a[0],endAngle:a[1]}));
        ringCenterA.text(`${S.n} · ${S.out} % anual`);
        ringCenterB.text(`Amazònia: ${S.amz}`);
      };
      updateRing(cur);
    }else{
      updateRing=null;
    }

    /* Partícules MAP-19 lentes dins del tall (typed arrays, ~27 s per creuar) */
    const KT=mob?8:10, N=mob?200:460, BINS=4;
    const PXS=new Float32Array(N*KT), PYS=new Float32Array(N*KT), PHD=new Uint8Array(N), PNN=new Uint8Array(N), PBIN=new Uint8Array(N);
    const PLON=new Float32Array(N), PF=new Float32Array(N), PZ=new Float32Array(N), PSP=new Float32Array(N), PDL=new Float32Array(N), PFALL=new Uint8Array(N);
    const PIDX=d3.range(BINS).map(()=>new Uint32Array(N)), PCNT=new Uint32Array(BINS);
    const pCols=d3.range(BINS).map(b=>DUST_SC(.22+(b+.5)/BINS*.78));

    function sp(i,pre){
      PLON[i]=pre?L0+rnd()*(L1-L0):-6+rnd()*26;
      PF[i]=rnd(); PFALL[i]=0; PZ[i]=0; PSP[i]=.78+rnd()*.44;
      PDL[i]=-17-(rnd()<.68?rnd()*58:58+rnd()*48);
      PHD[i]=0; PNN[i]=0;
      PBIN[i]=Math.min(BINS-1,(rnd()*BINS)|0);
    }
    for(let i=0;i<N;i++)sp(i,true);

    let lastStateKey="";
    function drawAnns(w,de,rainA){
      const key=`${Math.round(w*20)}:${Math.round(de*20)}`;
      if(key===lastStateKey)return;
      lastStateKey=key;
      gAnn.selectAll("*").remove();
      const lx=mob?-16:-32, ty=y(topAt(lx,w));
      V.lines(gAnn,x(lx),Math.max(mg.t+12,ty-18),[["Capa d'aire del Sàhara",true,C.ink],["calenta, seca i amb pols",false,C.ink2]],{anchor:"middle",halo:3,size:mob?11.5:12.5});
      V.t(gAnn,x(8),y0-10,"Sàhara",{anchor:"middle",weight:600,size:mob?11.5:12.5,fill:C.ink,halo:3});
      if(!mob)V.t(gAnn,x(-17),y0+22,"costa africana",{anchor:"middle",size:11,fill:C.muted,italic:true});
      if(w>.35){
        const iy=y(botAt(-34,w));
        if(!mob){
          V.note(gAnn,{x:x(-34),y:iy,tx:x(-28),ty:y(Math.max(.32,botAt(-34,w)*.42)),kind:"straight",anchor:"start",
            lines:[["Inversió tèrmica",true,C.blauFosc],["aire marí fresc a sota"]],size:11.5}).style("opacity",sm((w-.35)/.3));
        }else{
          V.t(gAnn,x(-40),y(Math.max(.35,botAt(-32,w)*.45)),"aire del mar, fresc i humit",{anchor:"middle",size:11,fill:C.blauFosc,italic:true,halo:3}).style("opacity",sm((w-.35)/.3));
        }
      }
      if(rainA>.25){
        V.t(gAnn,x(-70),y0-12,"Amazònia",{anchor:"middle",weight:600,size:mob?11.5:12.5,fill:C.ink,halo:3}).style("opacity",rainA);
        V.t(gAnn,mob?mg.l+6:x(-70),y(4.15),"la pluja arrossega la pols",{anchor:mob?"start":"middle",size:mob?11:12,fill:C.blauFosc,italic:true,halo:3}).style("opacity",rainA);
      }
      if(de>.25){
        V.t(gAnn,x(-65),y0-14,"Antilles",{anchor:"middle",size:11.5,fill:C.ink2,halo:3}).style("opacity",de);
        if(!mob)V.t(gAnn,x(-82),y(2.8),"Florida i golf de Mèxic",{anchor:"middle",size:11.5,fill:C.ink2,halo:3}).style("opacity",de);
      }
      V.t(gAnn,x(-35),y(6.35),"← la pols viatja cap a l'oest",{anchor:"middle",size:mob?11.5:12,fill:C.muted,italic:true,serif:true});
    }

    function paint(dt,tSec){
      const dpr=Math.min(2,window.devicePixelRatio||1);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,mainW,H);
      const g=geo(sv), w=g.w, de=g.d, rainA=1-de;

      /* Capa marina fresca en aquarel·la blava (multiply) */
      ctx.save(); ctx.globalCompositeOperation="multiply";
      ctx.beginPath();
      for(let lon=L0;lon<=-17;lon+=1)ctx.lineTo(x(lon),y(botAt(lon,w)));
      ctx.lineTo(x(-17),y0); ctx.lineTo(x(L0),y0); ctx.closePath();
      const gMar=ctx.createLinearGradient(0,y(1.2),0,y0);
      gMar.addColorStop(0,V.alpha(C.blau,.10));
      gMar.addColorStop(1,V.alpha(C.blau,.20));
      ctx.fillStyle=gMar; ctx.fill();

      /* Ploma SAL en aquarel·la vermell → vermellClar → grocClar */
      ctx.beginPath();
      for(let lon=L0;lon<=L1;lon+=1)ctx.lineTo(x(lon),y(topAt(lon,w)));
      for(let lon=L1;lon>=L0;lon-=1)ctx.lineTo(x(lon),y(botAt(lon,w)));
      ctx.closePath();
      const gr=ctx.createLinearGradient(x(L1),y(5.5),x(L0),y0);
      gr.addColorStop(0,V.alpha(C.vermell,.24));
      gr.addColorStop(.45,V.alpha(C.vermellClar,.22));
      gr.addColorStop(.82,V.alpha(C.grocClar,.26));
      gr.addColorStop(1,V.alpha(C.grocClar,.10));
      ctx.fillStyle=gr; ctx.fill();
      ctx.restore();

      /* Isolínia superior fina en vermell */
      ctx.strokeStyle=V.alpha(C.vermell,.62); ctx.lineWidth=1.05;
      ctx.beginPath();
      for(let lon=L0;lon<=L1;lon+=1){ const px=x(lon), py=y(topAt(lon,w)); if(lon===L0)ctx.moveTo(px,py); else ctx.lineTo(px,py); }
      ctx.stroke();

      /* Base discontínua d'inversió tèrmica sobre l'aire marí */
      if(w>.2){
        ctx.save(); ctx.globalAlpha=sm((w-.2)/.4); ctx.setLineDash([3,3]); ctx.strokeStyle=C.blau; ctx.lineWidth=.95;
        ctx.beginPath();
        for(let lon=L0;lon<=-12;lon+=1){ const px=x(lon), py=y(botAt(lon,w)); if(lon===L0)ctx.moveTo(px,py); else ctx.lineTo(px,py); }
        ctx.stroke(); ctx.restore();
      }

      /* Pluja fina sobre l'Amazònia */
      if(rainA>.02){
        ctx.save(); ctx.globalAlpha=rainA;
        ctx.strokeStyle=V.alpha(C.blau,.38); ctx.lineWidth=.8;
        const off=V.reduced?0:(tSec*28)%16;
        ctx.beginPath();
        for(let rx=x(-86);rx<x(-50);rx+=7){
          for(let ry=y(3.1)+off-16;ry<y0-4;ry+=16){
            ctx.moveTo(rx,ry); ctx.lineTo(rx-1.5,ry+6.5);
          }
        }
        ctx.stroke(); ctx.restore();
      }

      /* Perfil de terra: Sàhara i Amazònia */
      ctx.fillStyle=C.land;
      ctx.beginPath(); ctx.moveTo(x(-17),y0);
      for(let lon=-17;lon<=L1;lon+=1)ctx.lineTo(x(lon),y(.14+.22*sm((lon+17)/12)+.04*Math.sin(lon*.7)));
      ctx.lineTo(x(L1),y0); ctx.closePath(); ctx.fill();
      ctx.fillStyle=V.alpha(C.grocClar,.48); ctx.fill();

      if(rainA>.02){
        ctx.save(); ctx.globalAlpha=rainA;
        ctx.fillStyle=C.land;
        ctx.beginPath(); ctx.moveTo(x(-50),y0); ctx.lineTo(x(-50),y(.08)); ctx.lineTo(x(L0),y(.12)); ctx.lineTo(x(L0),y0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle=V.alpha(C.ink2,.42); ctx.lineWidth=.85;
        ctx.beginPath();
        for(let lon=-51;lon>L0;lon-=1.6){ const tx2=x(lon), ty2=y(.12); ctx.moveTo(tx2,ty2); ctx.lineTo(tx2,ty2-5); }
        ctx.stroke(); ctx.restore();
      }
      if(de>.02){
        ctx.save(); ctx.globalAlpha=de; ctx.fillStyle=C.land;
        [[-59.5,.6],[-61.5,.8],[-66,1],[-72.5,1.6],[-77,1.2],[-81.2,.7]].forEach(([lo,sz])=>{
          const ix=x(lo), s=sz*(mob?4:6);
          ctx.beginPath(); ctx.moveTo(ix-s,y0); ctx.quadraticCurveTo(ix,y0-s*1.1,ix+s,y0); ctx.fill();
        });
        ctx.restore();
      }

      /* Línia del mar */
      ctx.strokeStyle=V.alpha(C.blau,.55); ctx.lineWidth=1.15;
      ctx.beginPath(); ctx.moveTo(x(rainA>.5?-50:L0),y0); ctx.lineTo(x(-17),y0); ctx.stroke();

      /* Micro-traços lents de pols seguint la inversió tèrmica (~27 s) */
      const spd=4.1;
      if(dt>0){
        for(let i=0;i<N;i++){
          const tp2=topAt(PLON[i],w), bt2=botAt(PLON[i],w);
          if(!PFALL[i]){
            PLON[i]-=spd*PSP[i]*dt;
            PZ[i]=bt2+(tp2-bt2)*PF[i];
            PF[i]=Math.max(0,PF[i]-dt*.008);
            if(PLON[i]<PDL[i]||(rainA>.5&&PLON[i]<-50&&rnd()<dt*.65))PFALL[i]=1;
          }else{
            PLON[i]-=spd*PSP[i]*dt*.35;
            PZ[i]-=dt*(rainA>.5&&PLON[i]<-50?1.05:.26);
          }
          if(PZ[i]<=0||PLON[i]<L0){ sp(i,false); continue; }
          const nh=(PHD[i]+1)%KT; PHD[i]=nh;
          PXS[i*KT+nh]=x(PLON[i]); PYS[i*KT+nh]=y(PZ[i]);
          if(PNN[i]<KT)PNN[i]++;
        }
      }
      PCNT.fill(0);
      for(let i=0;i<N;i++){ if(PNN[i]>1){ const b=PBIN[i]; PIDX[b][PCNT[b]++]=i; } }
      ctx.lineCap="round";
      for(let segI=0;segI<KT-1;segI++){
        const al=.68*Math.pow(1-segI/(KT-1),1.25);
        if(al<.02)continue;
        for(let b=0;b<BINS;b++){
          const c=PCNT[b], ix=PIDX[b]; if(!c)continue;
          ctx.strokeStyle=pCols[b]; ctx.globalAlpha=al; ctx.lineWidth=lerp(.85,1.2,b/(BINS-1));
          ctx.beginPath();
          for(let t=0;t<c;t++){
            const i=ix[t]; if(PNN[i]-1<=segI)continue;
            const a=i*KT+(PHD[i]-segI+KT)%KT, bb=i*KT+(PHD[i]-segI-1+KT)%KT;
            ctx.moveTo(PXS[a],PYS[a]); ctx.lineTo(PXS[bb],PYS[bb]);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha=1;
      drawAnns(w,de,rainA);
    }

    for(let i=0;i<16;i++)paint(.15,0);
    redrawStatic=()=>{ lastStateKey=""; paint(0,0); };

    V.hover(hit.node(),(ev,[px])=>{
      const lon=clamp(x.invert(px),L0,L1);
      const g=geo(sv), hi=topAt(lon,g.w), lo=botAt(lon,g.w);
      const sx=x(lon);
      gHl.selectAll("*").remove();
      gHl.append("line").attr("x1",sx).attr("x2",sx).attr("y1",mg.t).attr("y2",y0).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
      gHl.append("line").attr("x1",sx).attr("x2",sx).attr("y1",y(hi)).attr("y2",y(lo)).attr("stroke",C.vermell).attr("stroke-width",3).attr("stroke-linecap","round");
      gHl.append("circle").attr("cx",sx).attr("cy",y(hi)).attr("r",3.5).attr("fill",C.vermell).attr("stroke",C.ink).attr("stroke-width",1.3);
      if(lo>.05)gHl.append("circle").attr("cx",sx).attr("cy",y(lo)).attr("r",3.5).attr("fill",C.blau).attr("stroke",C.ink).attr("stroke-width",1.3);
      gAnn.style("opacity",.52);
      const lStr=Math.abs(lon)<.5?"0°":lon>0?`${f0(lon)}° E`:`${f0(-lon)}° O`;
      const extra=lo>.08?` · Aire marí a sota (0–${f1(lo)} km)`:lon<-50&&g.d<.5?" · Zona de pluja sobre l'Amazònia":"";
      tp.show(`<b>${lStr} (${SEAS[cur].n})</b><br>Capa de pols: ${f1(lo)}–${f1(hi)} km d'altura${extra}`);
    },()=>{
      gHl.selectAll("*").remove();
      gAnn.style("opacity",1);
      tp.hide();
    });

    svg.style("opacity",0); cv.style.opacity=0;
    V.onView(el,inst=>{
      if(inst){ svg.style("opacity",1); cv.style.opacity=1; }
      else{
        svg.transition().duration(750).ease(V.EASE).style("opacity",1);
        d3.select(cv).transition().duration(750).ease(V.EASE).style("opacity",1);
      }
    });

    activeLoop=V.loop(el,(t,dtMs)=>{
      const dt=Math.min(.05,(dtMs||16)/1000);
      if(playing){ pt+=dt; if(pt>3.2){ pt=0; setSeason((cur+1)%4); } }
      let d=cur-sv; if(d<-2)d+=4; if(d>2)d-=4;
      sv=(sv+d*Math.min(1,dt*2.4)+4)%4;
      paint(dt,t/1000);
    });
  });
}

/* =====================================================================
   3. EL VIATGE A TRAVÉS DE L'ATLÀNTIC (MAP-19 atlàntic + MAP-03 deposició)
   2.800–3.400 micro-traços direccionals hipnòtics (~28 s) travessant
   l'Atlàntic sobre geografia silenciosa #ECEBE8, deposició d'aquarel·la
   translúcida multiply sobre la conca amazònica i meridians en fils 0,5 px.
   ===================================================================== */
function initAtlantic(){
  const wrap=document.getElementById("mmap");
  if(!wrap)return;
  const lgEl=document.getElementById("mLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.vermell,t:"Pols en trànsit (MAP-19)",kind:"line",w:2},
      {c:C.vermellFosc,t:"Deposició amazònica",kind:"dot",a:.42},
      {c:C.blau,t:"Conca amazònica (Yu et al.)",kind:"line",w:1.1,dash:"4 3"}
    ]);
  }

  const LON=[-17,-35,-50,-60,-70,-80,-90,-100];
  const WC=[6,3,1.5,-1,-3.5,-5,-6,-6], WH=[8,6.5,5.5,5,5,5,5,5];
  const SC=[16.5,16,17,18,19.5,22,25,27.5], SH=[10.5,8.5,7,6.5,6,5.5,5.5,5];
  const toNodes=arr=>LON.map((x,i)=>[-x,arr[i]]);
  const nWC=toNodes(WC), nWH=toNodes(WH), nSC=toNodes(SC), nSH=toNodes(SH);
  const latAt=(lon,w,q)=>lerp(pw(nWC,-lon),pw(nSC,-lon),w)+q*lerp(pw(nWH,-lon),pw(nSH,-lon),w);

  const SRC=[[17.8,17.0,.45,.12,[5,8.5]],[-10,20,.14,.3],[-3,22,.15,.25],[3,19,.15,.18],[8,24,.11,.15]];
  const EU=makePath([[-1.5,27,2.6,1],[-1,33,3,1],[0.5,37.5,3.4,1],[1.8,41.5,3.6,1],[4,46,3.8,1]]);
  const AMZ=[[-75,-12],[-40,-12],[-40,-2],[-50,-2],[-50,8],[-75,8]];
  const AMZ_BLOOMS=[
    {lon:-58,lat:2.5,rx:11,ry:6.5,a:.26},
    {lon:-64,lat:-2.2,rx:10.5,ry:6,a:.22},
    {lon:-52,lat:1.5,rx:7.5,ry:5,a:.24}
  ];

  const STEPS=[
    {v:[-48,36,-6,34],m:5.5,lines:[1,0,0],amz:0,eu:0},
    {v:[-92,32,-16,36],m:6.5,lines:[1,1,1],amz:0,eu:0},
    {v:[-82,22,-20,24],m:1.5,lines:[0,0,0],amz:.55,eu:0},
    {v:[-82,-12,-18,16],m:2.5,lines:[0,0,0],amz:1,eu:0},
    {v:[-100,8,-2,38],m:6.5,lines:[0,0,1],amz:0,eu:0},
    {v:[-32,32,8,50],m:5.8,lines:[0,0,0],amz:0,eu:1},
    {v:[-100,42,-22,48],m:null,lines:[0,0,0],amz:.65,eu:.35}
  ];

  const ANNS=[
    {lon:5,lat:23,lines:[["Sàhara",true]],anchor:"middle",steps:[0,1,6]},
    {lon:17.8,lat:17,lines:[["Bodélé",false]],dx:10,dy:16,hm:true,lead:true,steps:[0]},
    {lon:-15,lat:30,lines:[["182 Mt/any",true,C.vermell],["surten d'Àfrica"]],dx:8,dy:0,m1:{dx:-6,dy:-4,anchor:"end"},steps:[0,1]},
    {lon:-35,lat:30,lines:[["132 Mt/any",true],["a mig oceà"]],dx:8,dy:0,m1:{dx:-6,dy:28,anchor:"end"},steps:[1]},
    {lon:-75,lat:30,lines:[["43 Mt/any",true,C.blau],["al Carib"]],dx:8,dy:0,steps:[1,4]},
    {lon:-23.6,lat:15.6,lines:[["Cap Verd",false]],dx:-10,dy:-14,anchor:"end",hm:true,steps:[0,1]},
    {lon:-59.5,lat:13.1,lines:[["Barbados",false]],dx:10,dy:-12,hm:true,lead:true,steps:[1,4]},
    {lon:-52.3,lat:4.9,lines:[["Caiena",true],["més pols de gen a maig"]],dx:20,dy:-28,lead:true,steps:[2]},
    {lon:-62,lat:-4,lines:[["Amazònia",true,C.blau]],anchor:"middle",steps:[2,6]},
    {lon:-60,lat:-3,lines:[["≈ 28 Mt/any",true,C.vermell],["entre 8 i 48 · des–mai"]],anchor:"middle",dy:14,steps:[3]},
    {lon:-81.5,lat:27.8,lines:[["Florida",false]],dx:10,dy:-10,hm:true,steps:[4]},
    {lon:-91,lat:24.5,lines:[["Golf de Mèxic",false]],anchor:"middle",italic:true,hm:true,steps:[4]},
    {lon:-72,lat:15,lines:[["Mar Carib",false]],anchor:"middle",italic:true,hm:true,steps:[4,6]},
    {lon:1.6,lat:41.8,lines:[["Catalunya",true],["pols 1 de cada 6 dies"]],dx:22,dy:-20,lead:true,steps:[5]},
    {lon:3,lat:30,lines:[["Sàhara",true]],anchor:"middle",steps:[5]}
  ];

  const POIS=[
    {n:"Meridià 15° O",d:"182 Mt/any surten d'Àfrica (CALIPSO 2007–2013)",lon:-15,lat:16},
    {n:"Meridià 35° O",d:"132 Mt/any arriben a mig Atlàntic",lon:-35,lat:14},
    {n:"Meridià 75° O",d:"43 Mt/any passen cap al Carib i el golf de Mèxic",lon:-75,lat:18},
    {n:"Conca amazònica",d:"≈ 28 Mt/any (entre 8 i 48), sobretot de desembre a maig",lon:-60,lat:-3},
    {n:"Catalunya",d:"Pols africana 17–18 % dels dies (més d'1 de cada 6)",lon:1.6,lat:41.8}
  ];

  const rngEl=document.getElementById("mRng"), playB=document.getElementById("mPlay");
  let step=0, view=STEPS[0].v.slice(), tgt=STEPS[0].v.slice();
  const st={m:5.5,l0:1,l1:0,l2:0,amz:0,eu:0}, tg={m:5.5,l0:1,l1:0,l2:0,amz:0,eu:0};
  let user=false, playing=false, activeLoop=null, drawStatic=null, lastRead="";

  function stopPlay(){ playing=false; if(playB)playB.textContent="Reprodueix"; }
  function updateReadout(){
    const m=((st.m%12)+12)%12, S=SEAS[seasonOf(m)], nm=MES[Math.floor(m)];
    if(nm===lastRead)return;
    lastRead=nm;
    const mn=document.getElementById("mName"), mv=document.getElementById("mVal");
    if(mn)mn.textContent=nm;
    if(mv)mv.textContent=`${S.n}: surt el ${S.out} % de la pols anual · Amazònia: ${S.amz}`;
    if(rngEl)rngEl.setAttribute("aria-valuetext",`${nm} (${S.n.toLowerCase()})`);
  }

  function setStep(i){
    step=i;
    const S=STEPS[i];
    tg.l0=S.lines[0]; tg.l1=S.lines[1]; tg.l2=S.lines[2]; tg.amz=S.amz; tg.eu=S.eu;
    if(S.m!==null){ user=false; stopPlay(); tg.m=S.m; if(rngEl)rngEl.value=S.m.toFixed(2); }
    else if(rngEl){ tg.m=+rngEl.value; }
    tgt=S.v.slice();
    if(V.reduced){ view=tgt.slice(); st.m=tg.m; if(drawStatic)drawStatic(); }
    lastRead=""; updateReadout();
  }

  if(rngEl)rngEl.addEventListener("input",()=>{ user=true; stopPlay(); tg.m=+rngEl.value; st.m=tg.m; lastRead=""; updateReadout(); if(V.reduced&&drawStatic)drawStatic(); });
  if(playB)playB.addEventListener("click",()=>{ if(playing){ stopPlay(); return; } playing=true; user=true; playB.textContent="Pausa"; });

  const rnd=V.rng(303);
  const tri=()=>rnd()+rnd()-1;
  function deathLon(){
    const u=rnd();
    if(u>.725)return -17-(1-u)/(1-.725)*18;
    if(u>.237)return -35-(.725-u)/(.725-.237)*40;
    if(u>.05)return -75-(.237-u)/.187*25;
    return -130;
  }

  const mnt=V.mount(wrap,(el,W)=>{
    if(activeLoop){ activeLoop.stop(); activeLoop=null; }
    if(!WORLD){ ensureWorld(()=>mnt.redraw()); return; }
    const mob=isMob(W);
    /* Pressupost mòbil guia-mobil.md: ≤ 220 px quan hi ha slider a sota */
    const H=mob
      ?Math.round(Math.max(190,Math.min(window.innerHeight*.25,220)))
      :Math.round(Math.min(W*.60,Math.min(Math.max(300,window.innerHeight-250),500)));

    d3.select(el).selectAll("canvas.ibv,svg.ibv").remove();
    const {c:cv,ctx}=V.canvas(el,W,H,"Mapa de l'Atlàntic tropical amb milers de micro-traços de pols del Sàhara cap a l'Amazònia a l'hivern i primavera, cap al Carib a l'estiu i cap a Europa alguns dies. Esquema.");
    const svg=d3.select(el).append("svg").attr("class","ibv ibv-ov").attr("width",W).attr("height",H)
      .attr("viewBox",`0 0 ${W} ${H}`).style("font-family",V.SANS).attr("aria-hidden","true");
    const gGeo=svg.append("g").attr("pointer-events","none");
    const gAnn=svg.append("g").attr("pointer-events","none");
    const gHl=svg.append("g").attr("pointer-events","none");
    const hit=svg.append("rect").attr("width",W).attr("height",H).attr("fill","transparent").attr("class","ibv-hit");
    const tp=V.tip(el);

    const dpr=Math.min(2,window.devicePixelRatio||1);
    const baseCv=document.createElement("canvas");
    baseCv.width=Math.round(W*dpr); baseCv.height=Math.round(H*dpr);
    const baseCtx=baseCv.getContext("2d");

    let k=1, tx=0, ty=0, proj=null, baseDirty=true, lastKey="";
    function fit(){
      k=Math.min(W/((view[1]-view[0])*DEG),H/((view[3]-view[2])*DEG));
      tx=W/2-k*(view[0]+view[1])/2*DEG;
      ty=H/2+k*(view[2]+view[3])/2*DEG;
      proj=d3.geoEquirectangular().scale(k).translate([tx,ty]);
      baseDirty=true;
    }
    const P=(lon,lat)=>[tx+k*lon*DEG,ty-k*lat*DEG];
    const inv=(x,y)=>[(x-tx)/(k*DEG),(ty-y)/(k*DEG)];
    fit();

    function drawBase(){
      baseCtx.setTransform(dpr,0,0,dpr,0,0);
      baseCtx.clearRect(0,0,W,H);
      const gp=d3.geoPath(proj,baseCtx);
      baseCtx.strokeStyle=C.grid; baseCtx.lineWidth=.45;
      baseCtx.beginPath(); gp(d3.geoGraticule().step([15,15])()); baseCtx.stroke();
      baseCtx.fillStyle=C.land;
      baseCtx.beginPath(); gp(WORLD.land); baseCtx.fill();
      baseCtx.strokeStyle="#FFFFFF"; baseCtx.lineWidth=.7;
      baseCtx.beginPath(); gp(WORLD.borders); baseCtx.stroke();
      const eq0=P(-180,0), eq1=P(180,0);
      baseCtx.save(); baseCtx.setLineDash([2,4]); baseCtx.strokeStyle=C.muted; baseCtx.globalAlpha=.4; baseCtx.lineWidth=.55;
      baseCtx.beginPath(); baseCtx.moveTo(eq0[0],eq0[1]); baseCtx.lineTo(eq1[0],eq1[1]); baseCtx.stroke(); baseCtx.restore();
      baseDirty=false;
    }

    /* Motor MAP-19 atlàntic en typed arrays: 3.100 micro-traços (1.200 a mòbil) */
    const KT=mob?9:12, NMAX=mob?1200:3100, NEU=mob?140:300, BINS=5;
    const AXS=new Float32Array(NMAX*KT), AYS=new Float32Array(NMAX*KT), AHD=new Uint8Array(NMAX), ANN=new Uint8Array(NMAX), ABIN=new Uint8Array(NMAX);
    const ALON=new Float32Array(NMAX), ALAT=new Float32Array(NMAX), AQ=new Float32Array(NMAX), APH=new Float32Array(NMAX), ADL=new Float32Array(NMAX), ASP=new Float32Array(NMAX), ASRC=new Uint8Array(NMAX), ASH=new Float32Array(NMAX), AON=new Uint8Array(NMAX);
    const AIDX=d3.range(BINS).map(()=>new Uint32Array(NMAX)), ACNT=new Uint32Array(BINS);
    const aCols=d3.range(BINS).map(b=>DUST_SC(.18+(b+.5)/BINS*.82));

    const EXS=new Float32Array(NEU*KT), EYS=new Float32Array(NEU*KT), EHD=new Uint8Array(NEU), ENN=new Uint8Array(NEU);
    const ES=new Float32Array(NEU), EQ=new Float32Array(NEU), ELIM=new Float32Array(NEU), ESP=new Float32Array(NEU), EON=new Uint8Array(NEU);

    let deps=[], acc=0, accE=0, aliveCount=0;
    function spawnAt(i){
      const w=summer(st.m);
      let tot=0; for(let j=0;j<SRC.length;j++)tot+=lerp(SRC[j][2],SRC[j][3],w);
      let r=rnd()*tot, idx=0;
      for(let j=0;j<SRC.length;j++){ r-=lerp(SRC[j][2],SRC[j][3],w); if(r<=0){ idx=j; break; } }
      const s=SRC[idx];
      ASRC[i]=idx; ALON[i]=s[0]+(rnd()*4.4-2.2); ALAT[i]=s[1]+(rnd()*3.6-1.8);
      AQ[i]=tri()*.94; APH[i]=rnd()*Math.PI*2; ADL[i]=deathLon(); ASP[i]=.82+rnd()*.36; ASH[i]=rnd();
      AHD[i]=0; ANN[i]=0; AON[i]=1;
    }

    function sim(dt,moving,recordTrails){
      const w=summer(st.m);
      const targetN=Math.round(NMAX*clamp(fluxM(st.m)/(46/3),.36,1));
      const rate=targetN/11;
      acc+=rate*dt;
      if(acc>=1){
        for(let i=0;i<NMAX&&acc>=1&&aliveCount<targetN;i++){
          if(!AON[i]){ spawnAt(i); aliveCount++; acc-=1; }
        }
        if(acc>6)acc=0;
      }

      /* Velocitat contemplativa (~28 s travessant l'Atlàntic) */
      const spd=3.05*clamp((view[1]-view[0])/95,.7,1.25);
      const c17=lerp(pw(nWC,17),pw(nSC,17),w), h17=lerp(pw(nWH,17),pw(nSH,17),w);
      const ww=1-w;
      for(let i=0;i<NMAX;i++){
        if(!AON[i])continue;
        let lon=ALON[i], lat=ALAT[i], q=AQ[i];
        const ex=c17+q*h17;
        let tl;
        if(lon>-17){
          const s=SRC[ASRC[i]], wp=s[4];
          if(wp&&ww>.35&&lon>wp[0]){
            const tt=(s[0]-lon)/(s[0]-wp[0]);
            tl=lerp(s[1],wp[1]+q*2,sm(tt));
          }else{
            const a0=wp&&ww>.35?wp[0]:s[0], b0=wp&&ww>.35?wp[1]:s[1];
            tl=lerp(b0,ex,sm((a0-lon)/(a0+17)));
          }
          lon-=spd*.82*ASP[i]*dt;
        }else{
          tl=latAt(lon,w,q)+.6*Math.sin(APH[i]+lon*.12);
          lon-=spd*ASP[i]*dt;
        }
        lat+=(tl-lat)*Math.min(1,dt*1.85);
        ALON[i]=lon; ALAT[i]=lat;
        let dead=false, depo=true;
        if(lon<ADL[i])dead=true;
        if(!dead&&lon<-49&&lat<8.5&&lat>-14&&rnd()<dt*.62)dead=true;
        if(lon<-104||lat>47){ dead=true; depo=false; }
        if(dead){
          AON[i]=0; aliveCount--;
          if(depo&&recordTrails&&deps.length<260&&rnd()<.35){ deps.push({lon,lat,a:1,r:2+rnd()*2.5}); }
          continue;
        }
        if(moving)ANN[i]=0;
        if(recordTrails){
          const pt=P(lon,lat);
          const nh=(AHD[i]+1)%KT; AHD[i]=nh;
          AXS[i*KT+nh]=pt[0]; AYS[i*KT+nh]=pt[1];
          if(ANN[i]<KT)ANN[i]++;
          const core=1-Math.min(1,Math.abs(q)/.95);
          const westFade=clamp((lon+95)/115,0,1);
          const inten=clamp(core*.55+westFade*.32+ASH[i]*.18,0,.999);
          ABIN[i]=Math.min(BINS-1,(inten*BINS)|0);
        }
      }

      /* Branca cap a Europa */
      if(st.eu>.03){
        accE+=st.eu*dt*(mob?26:62);
        for(let i=0;i<NEU&&accE>=1;i++){
          if(!EON[i]){ ES[i]=rnd()*.8; EQ[i]=tri(); ELIM[i]=EU.total*(.5+rnd()*.5); ESP[i]=.8+rnd()*.4; EHD[i]=0; ENN[i]=0; EON[i]=1; accE-=1; }
        }
        if(accE>4)accE=0;
      }
      for(let i=0;i<NEU;i++){
        if(!EON[i])continue;
        ES[i]+=dt*spd*.48*ESP[i];
        if(ES[i]>ELIM[i]){ EON[i]=0; continue; }
        if(moving)ENN[i]=0;
        if(recordTrails){
          const qe=EU.at(ES[i],EQ[i]), pt=P(qe.lon,qe.lat);
          const nh=(EHD[i]+1)%KT; EHD[i]=nh;
          EXS[i*KT+nh]=pt[0]; EYS[i*KT+nh]=pt[1];
          if(ENN[i]<KT)ENN[i]++;
        }
      }
      for(let i=deps.length-1;i>=0;i--){ deps[i].a-=dt*.11; if(deps[i].a<=0)deps.splice(i,1); }
    }

    function renderSvgLayers(){
      gGeo.selectAll("*").remove();
      gAnn.selectAll("*").remove();
      if(st.amz>.02){
        const pts=AMZ.map(q=>P(q[0],q[1]));
        gGeo.append("path").attr("d","M"+pts.map(p=>p.join(",")).join("L")+"Z")
          .attr("fill","none").attr("stroke",C.blau)
          .attr("stroke-width",.95).attr("stroke-dasharray","4 3").style("opacity",st.amz*.85);
      }
      /* Meridians 15° O, 35° O, 75° O en fils ultra-fins de 0,55 px */
      [[-15,st.l0,C.vermell],[-35,st.l1,C.ink2],[-75,st.l2,C.blau]].forEach(([lo,a,col])=>{
        if(a<.02)return;
        const p0=P(lo,-16), p1=P(lo,33);
        gGeo.append("line").attr("x1",p0[0]).attr("x2",p1[0]).attr("y1",p0[1]).attr("y2",p1[1])
          .attr("stroke",col).attr("stroke-width",.55).attr("stroke-dasharray","3 3").style("opacity",a*.9);
      });
      const oa=P(-40,24);
      if(oa[0]>44&&oa[0]<W-44&&oa[1]>14&&oa[1]<H-14){
        V.t(gAnn,oa[0],oa[1],"Oceà Atlàntic",{anchor:"middle",italic:true,serif:true,size:mob?11.5:13,fill:C.muted});
      }
      const K=clamp(W/880,.62,1.1);
      ANNS.forEach(a=>{
        if(a.steps.indexOf(step)<0)return;
        if(mob&&a.hm)return;
        const p=P(a.lon,a.lat);
        if(p[0]<-10||p[0]>W+10||p[1]<-10||p[1]>H+10)return;
        const ov=(mob&&step===1&&a.m1)?a.m1:null;
        const anc=ov&&ov.anchor?ov.anchor:a.anchor;
        const adx=ov&&ov.dx!=null?ov.dx:(a.dx||0);
        const ady=ov&&ov.dy!=null?ov.dy:(a.dy||0);
        const tx2=clamp(p[0]+adx*K,anc==="end"?84:10,anc==="end"?W-10:W-96);
        const ty2=clamp(p[1]+ady*K,16,H-18);
        if(a.lead){
          V.note(gAnn,{x:p[0],y:p[1],tx:tx2,ty:ty2,lines:a.lines,kind:"elbow",anchor:anc,dot:true,size:mob?11.5:12.5,italic:a.italic});
        }else{
          V.lines(gAnn,tx2,ty2,a.lines,{anchor:anc||"start",halo:3,size:mob?11.5:12.5,italic:a.italic,fill:a.italic?C.ink2:C.ink});
        }
      });
    }

    function paint(){
      if(baseDirty)drawBase();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.drawImage(baseCv,0,0);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      /* MAP-03: Bany d'aquarel·la translúcid multiply sobre la conca amazònica */
      const amzWash=st.amz*clamp(1.15-summer(st.m)*.9,.22,1);
      if(amzWash>.04){
        ctx.save(); ctx.globalCompositeOperation="multiply";
        AMZ_BLOOMS.forEach(b=>{
          const q=P(b.lon,b.lat);
          wcBlob(ctx,q[0],q[1],b.rx*k*DEG,b.ry*k*DEG,C.vermell,b.a*amzWash,-.2);
        });
        ctx.restore();
      }
      if(deps.length){
        ctx.save(); ctx.globalCompositeOperation="multiply";
        for(let i=0;i<deps.length;i++){
          const d=deps[i], q=P(d.lon,d.lat);
          ctx.fillStyle=V.alpha(C.vermellFosc,.22*d.a);
          ctx.beginPath(); ctx.arc(q[0],q[1],d.r,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      /* MAP-19: Micro-traços direccionals atlàntics (batched per color bin i segment) */
      ACNT.fill(0);
      for(let i=0;i<NMAX;i++){ if(AON[i]&&ANN[i]>1){ const b=ABIN[i]; AIDX[b][ACNT[b]++]=i; } }
      ctx.lineCap="round";
      for(let seg=0;seg<KT-1;seg++){
        const al=.74*Math.pow(1-seg/(KT-1),1.3);
        if(al<.015)continue;
        for(let b=0;b<BINS;b++){
          const c=ACNT[b], ix=AIDX[b]; if(!c)continue;
          ctx.strokeStyle=aCols[b]; ctx.globalAlpha=al;
          ctx.lineWidth=lerp(.85,1.25,b/(BINS-1));
          ctx.beginPath();
          for(let t=0;t<c;t++){
            const i=ix[t]; if(ANN[i]-1<=seg)continue;
            const a=i*KT+(AHD[i]-seg+KT)%KT, bb=i*KT+(AHD[i]-seg-1+KT)%KT;
            ctx.moveTo(AXS[a],AYS[a]); ctx.lineTo(AXS[bb],AYS[bb]);
          }
          ctx.stroke();
        }
      }
      /* Branca europea */
      if(st.eu>.02){
        for(let seg=0;seg<KT-1;seg++){
          const al=.62*Math.pow(1-seg/(KT-1),1.3);
          if(al<.02)continue;
          ctx.strokeStyle=C.vermell; ctx.globalAlpha=al; ctx.lineWidth=.95;
          ctx.beginPath();
          for(let i=0;i<NEU;i++){
            if(!EON[i]||ENN[i]-1<=seg)continue;
            const a=i*KT+(EHD[i]-seg+KT)%KT, bb=i*KT+(EHD[i]-seg-1+KT)%KT;
            ctx.moveTo(EXS[a],EYS[a]); ctx.lineTo(EXS[bb],EYS[bb]);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha=1;
    }

    for(let i=0;i<150;i++)sim(.12,false,i>136);
    renderSvgLayers();
    paint();

    drawStatic=()=>{
      view=tgt.slice(); fit();
      AON.fill(0); EON.fill(0); aliveCount=0; deps=[];
      for(let i=0;i<150;i++)sim(.12,false,i>136);
      renderSvgLayers(); paint();
    };

    /* Hover MAP-19: línia de corrent en tinta + lectura al dock */
    V.hover(hit.node(),(ev,[px,py])=>{
      const [lon,lat]=inv(px,py);
      let near=null, best=Infinity;
      POIS.forEach(q=>{
        const qp=P(q.lon,q.lat), dist=Math.hypot(qp[0]-px,qp[1]-py);
        if(dist<best){ best=dist; near=q; }
      });
      gHl.selectAll("*").remove();
      /* Línia de corrent aproximada del mes actiu */
      if(lon<18&&lon>-98&&lat>-14&&lat<36){
        const w=summer(st.m), c0=latAt(clamp(lon,-98,-17),w,0), h0=lerp(pw(nWH,clamp(-lon,17,98)),pw(nSH,clamp(-lon,17,98)),w);
        const qOff=clamp((lat-c0)/Math.max(3,h0),-1.1,1.1);
        const pts=[];
        for(let lo=Math.min(10,lon+10);lo>=Math.max(-96,lon-24);lo-=2.5){
          pts.push(P(lo,latAt(clamp(lo,-98,-17),w,qOff)));
        }
        if(pts.length>2){
          const dStr=d3.line().curve(d3.curveBasis)(pts);
          gHl.append("path").attr("d",dStr).attr("fill","none").attr("stroke","#fff").attr("stroke-width",4).attr("stroke-linecap","round");
          gHl.append("path").attr("d",dStr).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.3).attr("stroke-linecap","round");
          const e=pts[pts.length-1], e0=pts[pts.length-3];
          arrowHead(gHl,e[0],e[1],Math.atan2(e[1]-e0[1],e[0]-e0[0]),{L:6.5,sw:1.3});
        }
      }
      cv.style.opacity=.56;
      gHl.append("circle").attr("cx",px).attr("cy",py).attr("r",4.2).attr("fill",C.vermell).attr("stroke",C.ink).attr("stroke-width",1.4);
      gAnn.style("opacity",.52);
      if(near&&best<(mob?52:76)){
        tp.show(`<b>${near.n}</b><br>${near.d}`);
      }else{
        const S=SEAS[seasonOf(st.m)];
        tp.show(`<b>${MES[Math.floor(((st.m%12)+12)%12)]} (${S.n})</b><br>${llFmt(lon,lat)} · Surt el ${S.out} % anual`);
      }
    },()=>{
      gHl.selectAll("*").remove();
      cv.style.opacity=1;
      gAnn.style("opacity",1);
      tp.hide();
    });

    activeLoop=V.loop(el,(t,dtMs)=>{
      const dt=Math.min(.05,(dtMs||16)/1000);
      if(playing){
        tg.m=(tg.m+dt*.55)%12; st.m=tg.m;
        if(rngEl)rngEl.value=tg.m.toFixed(2);
      }else{
        let dm=tg.m-st.m; if(Math.abs(dm)>6)dm-=12*Math.sign(dm);
        st.m=((st.m+dm*Math.min(1,dt*1.8))%12+12)%12;
        if(!user&&rngEl)rngEl.value=st.m.toFixed(2);
      }
      ["l0","l1","l2","amz","eu"].forEach(k=>{ st[k]+=(tg[k]-st[k])*Math.min(1,dt*2.4); });
      let mv=false; const ek=Math.min(1,dt*2.4);
      for(let i=0;i<4;i++){
        const d=tgt[i]-view[i];
        if(Math.abs(d)>.02){ view[i]+=d*ek; mv=true; } else view[i]=tgt[i];
      }
      if(mv)fit();
      const key=step+":"+view.map(v=>v.toFixed(2)).join(",")+":"+Math.round(st.amz*20)+":"+Math.round(st.l0*20);
      if(key!==lastKey){ lastKey=key; renderSvgLayers(); }
      sim(dt,mv,true);
      paint();
      updateReadout();
    });
  });

  setStep(0);
  if(window.IB&&IB.scrolly){
    IB.scrolly(document.getElementById("msteps"),document.getElementById("mgraphic"),i=>setStep(i));
  }
}

/* =====================================================================
   4. QUANT SÓN 28 MILIONS DE TONES? · Doble vista .seg
   Vista A (principal): LINK-03 Flux de massa amb bandes d'aquarel·la multiply
   i ~1.000 micro-traços corbats lents (transposició vertical a mòbil).
   Vista B: PART-01 Reixa interactiva de 364 cercles translúcids per etapa.
   ===================================================================== */
function initTrucks(){
  const wrap=document.getElementById("trucksWrap");
  if(!wrap)return;
  const lgEl=document.getElementById("tLg");
  const titleEl=document.getElementById("tTitle"), outEl=document.getElementById("tOut");
  const viewBtns=[...document.querySelectorAll("#tViewSeg button")];
  const stageRow=document.getElementById("tStageRow");
  const flowPlayB=document.getElementById("tFlowPlay");
  const segBtns=[...document.querySelectorAll("#tSeg button")];
  const playB=document.getElementById("tPlay");

  const V_STAGES=[
    {t:182e6,lab:"Surt d'Àfrica cada any (15° O)",col:C.vermell},
    {t:132e6,lab:"Arriba a mig oceà (35° O) · 50 Mt ja han caigut al mar",col:C.vermell,ocean:true},
    {t:27.7e6,lab:"Cau a l'Amazònia, abans d'arribar als 75° O",col:C.vermell},
    {t:43e6,lab:"Una altra part arriba al Carib (75° O), sense la que cau a l'Amazònia",col:C.blau},
    {t:22000,lab:"Fòsfor que cau a l'Amazònia: una 23a part d'un sol cercle",col:C.vermellFosc,p:true}
  ];
  const PER=500000, N_DOTS=Math.ceil(182e6/PER); // 364 cercles

  let viewMode="flow", cur=0, timer=null, flowRun=true, flowLoop=null, updateStage=null;

  function renderLegend(){
    if(!lgEl)return;
    lgEl.innerHTML="";
    if(viewMode==="flow"){
      V.legendCat(lgEl,[
        {c:C.vermell,t:"Cau a l'Amazònia (27,7 Mt)",kind:"dot",a:.65},
        {c:C.vermellFosc,t:"Fòsfor (22.000 t = 0,08 %)",kind:"line",w:2.2},
        {c:C.blau,t:"Cau a l'Atlàntic (111,3 Mt)",kind:"dot",a:.55},
        {c:C.ink2,t:"Arriba al Carib (43 Mt)",kind:"dot",a:.6}
      ]);
    }else{
      V.legendCat(lgEl,[
        {c:C.vermell,t:"Pols en aquesta etapa (1 cercle = 20.000 camions)",kind:"dot",a:.72},
        {c:C.blauClar,t:"Cau a l'oceà abans de 35° O",kind:"dot",a:.72},
        {c:C.ghost,t:"Context: 182 Mt que surten d'Àfrica",kind:"dot",a:.5}
      ]);
    }
  }

  function updateHeader(){
    if(viewMode==="flow"){
      if(titleEl)titleEl.textContent="Del Sàhara a l'oceà, l'Amazònia i el Carib";
      if(outEl)outEl.textContent="182 milions de tones surten cada any d'Àfrica (15° O); 27,7 cauen a l'Amazònia, i només 22.000 t són fòsfor (0,08 %)";
    }else{
      const v=V_STAGES[cur], trucks=v.t/25, perDay=trucks/365.25;
      segBtns.forEach((b,k)=>b.setAttribute("aria-pressed",String(k===cur)));
      if(titleEl)titleEl.textContent=v.p?`${f0(v.t)} tones de fòsfor l'any`:`${fmtNum(v.t/1e6,v.t<1e8&&v.t%1e6?1:0)} milions de tones l'any`;
      if(outEl)outEl.textContent=v.p
        ?`${v.lab} · 880 camions de 25 t (~2 o 3 al dia)`
        :`${v.lab} · ${f1(trucks/1e6)} milions de camions de 25 t (~${f0(Math.round(perDay/100)*100)} al dia)`;
    }
  }

  function stopT(){ if(timer){ clearInterval(timer); timer=null; if(playB)playB.textContent="Reprodueix el viatge"; } }
  if(V.reduced&&flowPlayB)flowPlayB.hidden=true;

  if(flowPlayB)flowPlayB.addEventListener("click",()=>{
    flowRun=!flowRun;
    flowPlayB.textContent=flowRun?"Atura":"Reprodueix";
    flowPlayB.setAttribute("aria-pressed",String(!flowRun));
  });
  segBtns.forEach(b=>b.addEventListener("click",()=>{ stopT(); cur=+b.dataset.i; updateHeader(); if(updateStage)updateStage(cur,false); }));
  if(playB)playB.addEventListener("click",()=>{
    if(timer){ stopT(); return; }
    cur=0; updateHeader(); if(updateStage)updateStage(0,false);
    playB.textContent="Pausa";
    timer=setInterval(()=>{ cur++; if(cur>=V_STAGES.length){ stopT(); return; } updateHeader(); if(updateStage)updateStage(cur,false); },2100);
  });

  function drawFlow(el,W){
    const mob=isMob(W);
    const H=mob?500:400;
    const nw=mob?3.5:4;
    d3.select(el).selectAll("svg.ibv,canvas.ibv").remove();
    const svg=V.svg(el,W,H,"Flux anual de la pols africana (LINK-03): 182 milions de tones surten d'Àfrica a 15° O. 50 Mt cauen a l'Atlàntic oriental; 132 Mt arriben a mig oceà (35° O), d'on 61,3 Mt cauen a l'Atlàntic central, 43 Mt arriben al Carib (75° O) i 27,7 Mt cauen a l'Amazònia, portant 22.000 tones de fòsfor (0,08 %).");
    const {c:cv,ctx}=V.canvas(el,W,H,"");
    d3.select(cv).attr("class","ibv ibv-flow-cv").attr("role",null).attr("aria-hidden","true");
    const tp=V.tip(el);
    const defs=svg.append("defs"), g=svg.append("g");

    /* Model de flux exacte (Yu et al. 2015: 182 = 50 + 61,3 + 43 + 27,7) */
    const nodes=[
      {id:"afr",t:"Surt d'Àfrica",sub:"15° O",v:182,col:0,c:C.ink},
      {id:"mid",t:"Mig oceà",sub:"35° O",v:132,col:1,c:C.ink2},
      {id:"oc1",t:"Atlàntic oriental",sub:"15°–35° O",v:50,col:1,c:C.blau},
      {id:"oc2",t:"Atlàntic central",sub:"35°–75° O",v:61.3,col:2,c:C.blauClar},
      {id:"car",t:"Arriba al Carib",sub:"75° O",v:43,col:2,c:C.ink2},
      {id:"amz",t:"Cau a l'Amazònia",sub:"des–mai",v:27.7,col:2,c:C.vermell}
    ];
    const byId=new Map(nodes.map(n=>[n.id,n]));
    const links=[
      {s:byId.get("afr"),t:byId.get("oc1"),v:50,c:C.blau,sc:C.blau,lab:"Cau a l'Atlàntic oriental (15°–35° O)"},
      {s:byId.get("afr"),t:byId.get("mid"),v:132,c:C.vermellClar,sc:C.ink2,lab:"Travessa el meridià 35° O"},
      {s:byId.get("mid"),t:byId.get("oc2"),v:61.3,c:C.blauClar,sc:C.blau,lab:"Cau a l'Atlàntic central i oest"},
      {s:byId.get("mid"),t:byId.get("car"),v:43,c:C.ink2,sc:C.ink2,lab:"Arriba al Carib i golf de Mèxic (75° O)"},
      {s:byId.get("mid"),t:byId.get("amz"),v:27.7,c:C.vermell,sc:C.vermell,lab:"Cau sobre la conca amazònica"}
    ];
    links.forEach((l,i)=>{ l.idx=i; });
    nodes.forEach(n=>{ n.in=links.filter(l=>l.t===n); n.out=links.filter(l=>l.s===n); });

    const bez=(a,b,c2,d,t)=>{ const u=1-t; return u*u*u*a+3*u*u*t*b+3*u*t*t*c2+t*t*t*d; };
    const NS=64, pid="f40-"+Math.random().toString(36).slice(2,6);

    if(!mob){
      /* ESCRIPTORI: flux horitzontal d'esquerra a dreta */
      const m={t:34,b:44,l:136,r:176};
      const X=[m.l,(m.l+W-m.r)/2-nw/2,W-m.r-nw];
      const inner=H-m.t-m.b, k=(inner-76)/182;

      const c0=[byId.get("afr")];
      const c1=[byId.get("oc1"),byId.get("mid")];
      const c2=[byId.get("oc2"),byId.get("car"),byId.get("amz")];
      [c0,c1,c2].forEach((col,ci)=>{
        const tot=d3.sum(col,d=>d.v)*k, pad=col.length>1?Math.min(34,(inner-tot)/(col.length-1)):0;
        let y=m.t+(inner-tot-pad*(col.length-1))/2;
        col.forEach(nd=>{ nd.x=X[ci]; nd.y0=y; nd.h=Math.max(4,nd.v*k); nd.y1=y+nd.h; y=nd.y1+pad; });
      });
      nodes.forEach(nd=>{
        let y=nd.y0; nd.out.forEach(l=>{ l.sy=y; l.w=l.v*k; y+=l.w; });
        y=nd.y0; nd.in.forEach(l=>{ l.ty=y; y+=l.v*k; });
      });
      links.forEach(l=>{
        l.x0=l.s.x+nw+1.5; l.x1=l.t.x-1.5; l.xm=(l.x0+l.x1)/2;
        l.d=`M${l.x0},${l.sy}C${l.xm},${l.sy} ${l.xm},${l.ty} ${l.x1},${l.ty}L${l.x1},${l.ty+l.w}C${l.xm},${l.ty+l.w} ${l.xm},${l.sy+l.w} ${l.x0},${l.sy+l.w}Z`;
        l.LX=new Float32Array(NS+1); l.LY=new Float32Array(NS+1);
        for(let i=0;i<=NS;i++){ const t=i/NS; l.LX[i]=bez(l.x0,l.xm,l.xm,l.x1,t); l.LY[i]=bez(l.sy,l.sy,l.ty,l.ty,t); }
      });

      links.forEach(l=>{
        const gr=defs.append("linearGradient").attr("id",`${pid}-${l.idx}`).attr("gradientUnits","userSpaceOnUse")
          .attr("x1",l.x0).attr("x2",l.x1).attr("y1",0).attr("y2",0);
        gr.append("stop").attr("offset","0%").attr("stop-color",l.c).attr("stop-opacity",.07);
        gr.append("stop").attr("offset","45%").attr("stop-color",l.c).attr("stop-opacity",.16);
        gr.append("stop").attr("offset","100%").attr("stop-color",l.c).attr("stop-opacity",l.t.id==="amz"?.28:.19);
      });

      const LB=g.append("g").selectAll("path").data(links).join("path").attr("d",l=>l.d)
        .attr("fill",l=>`url(#${pid}-${l.idx})`).style("mix-blend-mode","multiply").style("cursor","pointer");
      const ND=g.append("g").selectAll("rect").data(nodes).join("rect")
        .attr("x",d=>d.x).attr("y",d=>d.y0).attr("width",nw).attr("height",d=>d.h)
        .attr("rx",nw/2).attr("ry",nw/2).attr("fill",d=>d.c).attr("fill-opacity",.9).style("cursor","pointer");

      /* Fil minúscul de fòsfor (22.000 t = 0,08 %) dins la branca amazònica */
      const amzL=links[4];
      const py0=amzL.sy+amzL.w-1.4, py1=amzL.ty+amzL.w-1.4;
      const pPath=`M${amzL.x0},${py0}C${amzL.xm},${py0} ${amzL.xm},${py1} ${amzL.x1},${py1}`;
      g.append("path").attr("d",pPath).attr("fill","none").attr("stroke",C.groc).attr("stroke-width",3.4).attr("stroke-opacity",.65);
      g.append("path").attr("d",pPath).attr("fill","none").attr("stroke",C.vermellFosc).attr("stroke-width",1.3);

      /* Etiquetes netes */
      const LG=g.append("g").attr("pointer-events","none");
      [["Surt d'Àfrica",X[0]-10,"end"],["A mig Atlàntic",X[1]+nw/2,"middle"],["Destinació",X[2]+nw+10,"start"]]
        .forEach(([t,xx,a])=>V.t(LG,xx,16,t,{size:11.5,fill:C.muted,anchor:a}));
      nodes.forEach(nd=>{
        const ym=(nd.y0+nd.y1)/2;
        const pct=f0(nd.v/182*100);
        if(nd.col===0){
          V.lines(LG,nd.x-10,ym-4,[[nd.t,true],[`${f0(nd.v)} Mt · 100 %`,false,C.muted]],{anchor:"end",size:12.5});
        }else if(nd.col===1){
          const topY=nd.id==="oc1"?nd.y0-18:nd.y1+16;
          V.t(LG,nd.x+nw/2,topY,`${nd.t} · ${fmtNum(nd.v,nd.v%1?1:0)} Mt (${pct} %)`,{anchor:"middle",size:12,weight:700,fill:nd.id==="oc1"?C.blauFosc:C.ink,halo:3});
        }else{
          V.lines(LG,nd.x+nw+10,ym-4,[[nd.t,true,nd.id==="amz"?C.vermell:C.ink],[`${fmtNum(nd.v,nd.v%1?1:0)} Mt · ${pct} %`,false,C.muted]],{anchor:"start",size:12.5});
        }
      });
      /* Anotació quirúrgica del fòsfor */
      V.note(LG,{x:amzL.xm+18,y:lerp(py0,py1,.58)+2,tx:amzL.xm-14,ty:H-18,kind:"elbow",anchor:"end",
        lines:[["Fòsfor: 22.000 t (0,08 %)",true,C.vermellFosc],["fil minúscul dins la pols amazònica"]],size:11.5,dot:true,stroke:C.vermellFosc});

      bindFlowInteraction(svg,LB,ND,links,nodes,ctx,W,H,false,tp);
    }else{
      /* MÒBIL (w < 600): transposició vertical neta (dalt → baix) */
      const m={t:34,b:46,l:14,r:14};
      const usableW=W-m.l-m.r, k=(usableW-36)/182;
      const Y=[m.t,m.t+155,H-m.b-60];

      const r0=[byId.get("afr")];
      const r1=[byId.get("oc1"),byId.get("mid")];
      const r2=[byId.get("oc2"),byId.get("car"),byId.get("amz")];
      [r0,r1,r2].forEach((row,ri)=>{
        const tot=d3.sum(row,d=>d.v)*k, pad=row.length>1?18:0;
        let xx=m.l+(usableW-tot-pad*(row.length-1))/2;
        row.forEach(nd=>{ nd.y=Y[ri]; nd.x0=xx; nd.w=Math.max(8,nd.v*k); nd.x1=xx+nd.w; xx=nd.x1+pad; });
      });
      nodes.forEach(nd=>{
        let xx=nd.x0; nd.out.forEach(l=>{ l.sx=xx; l.bw=l.v*k; xx+=l.bw; });
        xx=nd.x0; nd.in.forEach(l=>{ l.tx=xx; xx+=l.v*k; });
      });
      links.forEach(l=>{
        l.y0=l.s.y+nw+1.5; l.y1=l.t.y-1.5; l.ym=(l.y0+l.y1)/2;
        l.d=`M${l.sx},${l.y0}C${l.sx},${l.ym} ${l.tx},${l.ym} ${l.tx},${l.y1}L${l.tx+l.bw},${l.y1}C${l.tx+l.bw},${l.ym} ${l.sx+l.bw},${l.ym} ${l.sx+l.bw},${l.y0}Z`;
        l.LX=new Float32Array(NS+1); l.LY=new Float32Array(NS+1);
        for(let i=0;i<=NS;i++){ const t=i/NS; l.LX[i]=bez(l.sx,l.sx,l.tx,l.tx,t); l.LY[i]=bez(l.y0,l.ym,l.ym,l.y1,t); }
      });

      links.forEach(l=>{
        const gr=defs.append("linearGradient").attr("id",`${pid}-${l.idx}`).attr("gradientUnits","userSpaceOnUse")
          .attr("x1",0).attr("x2",0).attr("y1",l.y0).attr("y2",l.y1);
        gr.append("stop").attr("offset","0%").attr("stop-color",l.c).attr("stop-opacity",.08);
        gr.append("stop").attr("offset","100%").attr("stop-color",l.c).attr("stop-opacity",l.t.id==="amz"?.30:.20);
      });

      const LB=g.append("g").selectAll("path").data(links).join("path").attr("d",l=>l.d)
        .attr("fill",l=>`url(#${pid}-${l.idx})`).style("mix-blend-mode","multiply").style("cursor","pointer");
      const ND=g.append("g").selectAll("rect").data(nodes).join("rect")
        .attr("x",d=>d.x0).attr("y",d=>d.y).attr("width",d=>d.w).attr("height",nw)
        .attr("rx",nw/2).attr("ry",nw/2).attr("fill",d=>d.c).attr("fill-opacity",.9).style("cursor","pointer");

      /* Fil de fòsfor vertical */
      const amzL=links[4], px0=amzL.sx+amzL.bw-1.4, px1=amzL.tx+amzL.bw-1.4;
      const pPath=`M${px0},${amzL.y0}C${px0},${amzL.ym} ${px1},${amzL.ym} ${px1},${amzL.y1}`;
      g.append("path").attr("d",pPath).attr("fill","none").attr("stroke",C.groc).attr("stroke-width",3.2).attr("stroke-opacity",.65);
      g.append("path").attr("d",pPath).attr("fill","none").attr("stroke",C.vermellFosc).attr("stroke-width",1.3);

      const LG=g.append("g").attr("pointer-events","none");
      const afr=byId.get("afr"), oc1=byId.get("oc1"), mid=byId.get("mid"), oc2=byId.get("oc2"), car=byId.get("car"), amz=byId.get("amz");
      V.t(LG,W/2,m.t-10,"Surt d'Àfrica (15° O) · 182 Mt/any",{anchor:"middle",size:12.5,weight:700,fill:C.ink});
      V.t(LG,oc1.x0,oc1.y+nw+14,"Atlàntic E · 50 Mt",{anchor:"start",size:11.5,weight:600,fill:C.blauFosc,halo:3});
      V.t(LG,mid.x0+mid.w,mid.y-8,"35° O · 132 Mt",{anchor:"end",size:11.5,weight:700,fill:C.ink,halo:3});
      V.lines(LG,oc2.x0,oc2.y+nw+15,[["Atlàntic",true],["61,3 Mt",false,C.muted]],{anchor:"start",size:11.5});
      V.lines(LG,car.x0+car.w/2,car.y+nw+15,[["Carib",true],["43 Mt",false,C.muted]],{anchor:"middle",size:11.5});
      V.lines(LG,amz.x1,amz.y+nw+15,[["Amazònia",true,C.vermell],["27,7 Mt",false,C.muted]],{anchor:"end",size:11.5});
      V.t(LG,W-14,H-10,"Fòsfor: 22.000 t (0,08 % de la pols amazònica)",{anchor:"end",size:11.5,weight:700,fill:C.vermellFosc});

      bindFlowInteraction(svg,LB,ND,links,nodes,ctx,W,H,true,tp);
    }

    function bindFlowInteraction(svg,LB,ND,links,nodes,ctx,W,H,vert,tp){
      const rnd=V.rng(404), totalP=vert?480:1020;
      const sumV=d3.sum(links,l=>l.v);
      links.forEach(l=>{
        const nP=Math.max(12,Math.round(totalP*l.v/sumV));
        l.pt=new Float32Array(nP); l.po=new Float32Array(nP); l.ps=new Float32Array(nP); l.pl=new Float32Array(nP); l.pw=new Float32Array(nP);
        const span=vert?l.bw:l.w;
        for(let i=0;i<nP;i++){
          l.pt[i]=rnd();
          l.po[i]=(.08+rnd()*.84)*span;
          /* ~28 s per travessar el flux */
          l.ps[i]=(.78+rnd()*.44)*.000034;
          l.pl[i]=.042+rnd()*.042;
          l.pw[i]=.85+rnd()*.55;
        }
      });
      function sampleP(l,t,off){
        const f=clamp(t,0,1)*NS, k0=f|0, u=f-k0, k1=k0<NS?k0+1:NS;
        const bx=l.LX[k0]+(l.LX[k1]-l.LX[k0])*u, by=l.LY[k0]+(l.LY[k1]-l.LY[k0])*u;
        return vert?[bx+off,by]:[bx,by+off];
      }
      let foc=null;
      function drawP(){
        ctx.clearRect(0,0,W,H);
        ctx.lineCap="round"; ctx.lineJoin="round";
        for(const l of links){
          const baseA=foc?(foc.has(l)?.9:.24):(l.t.id==="amz"?.85:.62);
          ctx.strokeStyle=l.sc; ctx.fillStyle=l.sc;
          const pt=l.pt, po=l.po, pl=l.pl, pw=l.pw;
          for(let i=0;i<pt.length;i++){
            const t1=pt[i], t0=Math.max(0,t1-pl[i]);
            if(t1-t0<.004)continue;
            const fade=smoothEdge(t1,0,.09)*smoothEdge(1-t1,0,.09);
            const a=baseA*fade; if(a<.03)continue;
            const p0=sampleP(l,t0,po[i]), p1=sampleP(l,t0+(t1-t0)*.35,po[i]), p2=sampleP(l,t0+(t1-t0)*.7,po[i]), pH=sampleP(l,t1,po[i]);
            ctx.globalAlpha=a*.62; ctx.lineWidth=pw[i];
            ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.lineTo(pH[0],pH[1]); ctx.stroke();
            ctx.globalAlpha=a;
            ctx.beginPath(); ctx.arc(pH[0],pH[1],pw[i]*.72,0,Math.PI*2); ctx.fill();
          }
        }
        ctx.globalAlpha=1;
      }
      drawP();
      flowLoop=V.loop(wrap,(t,dt)=>{
        if(!flowRun||V.reduced)return;
        for(const l of links){
          const pt=l.pt, ps=l.ps;
          for(let i=0;i<pt.length;i++){ let v=pt[i]+dt*ps[i]; if(v>1)v-=1; pt[i]=v; }
        }
        drawP();
      });

      function pathOf(d){
        const S=new Set();
        if(d.s){ S.add(d); if(d.s.in)d.s.in.forEach(x=>S.add(x)); if(d.t.out)d.t.out.forEach(x=>S.add(x)); }
        else{ d.in.forEach(x=>S.add(x)); d.out.forEach(x=>S.add(x)); }
        return S;
      }
      function reset(){ foc=null; V.focus(LB,null); V.focus(ND,null); tp.hide(); drawP(); }
      V.hover(svg.node(),ev=>{
        const d=d3.select(ev.target).datum();
        if(!d||(!d.s&&!d.in)){ if(foc)reset(); return; }
        foc=pathOf(d);
        V.focus(LB,l=>foc.has(l),{dim:.48});
        V.focus(ND,n=>n===d||n===d.s||n===d.t,{dim:.52});
        drawP();
        const mt=d.v, pct=f0(mt/182*100), trk=f1(mt*1e6/25/1e6);
        const nm=d.s?d.lab:`${d.t} (${d.sub})`;
        const extra=(d.t&&d.t.id==="amz")||d.id==="amz"?" · conté 22.000 t de fòsfor (0,08 %)":"";
        tp.show(`<b>${nm}</b><br>${fmtNum(mt,mt%1?1:0)} Mt/any (${pct} %) · ${trk} M camions${extra}`);
      },reset);
    }
  }

  function drawGrid(el,W){
    const mob=isMob(W);
    const cols=W>=720?26:W>=480?20:14;
    const rows=Math.ceil(N_DOTS/cols);
    const cell=Math.min(28,W/cols);
    const r=cell*.36;
    const gridW=cols*cell, x0=(W-gridW)/2, gridH=rows*cell;
    const calloutH=mob?78:64;
    const H=Math.round(gridH+calloutH+12);

    d3.select(el).selectAll("svg.ibv,canvas.ibv").remove();
    const svg=V.svg(el,W,H,"Reixa de 364 cercles translúcids on cada cercle equival a 20.000 camions de 25 tones (0,5 Mt). Permet comparar els 182 Mt que surten d'Àfrica amb els 132 a mig oceà, els 28 que cauen a l'Amazònia, els 43 al Carib i les 22.000 t de fòsfor (880 camions, 1/23 d'un cercle).");
    const tp=V.tip(el);

    const data=d3.range(N_DOTS).map(i=>({i,cx:x0+(i%cols+.5)*cell,cy:(Math.floor(i/cols)+.5)*cell}));
    const dots=svg.append("g").selectAll("circle").data(data).join("circle")
      .attr("cx",d=>d.cx).attr("cy",d=>d.cy).attr("r",0)
      .style("mix-blend-mode","multiply").style("cursor","pointer");
    const gCall=svg.append("g").attr("pointer-events","none");

    function applyStage(i,instant){
      const v=V_STAGES[i], exact=v.t/PER, full=Math.floor(exact), frac=exact-full;
      const dur=instant||V.reduced?0:480;
      dots.interrupt().transition().duration(dur)
        .delay(d=>instant||V.reduced?0:Math.min(320,d.i*.7))
        .attr("r",d=>d.i<full?r:d.i===full&&frac>.02?Math.max(2.6,r*Math.sqrt(frac)):r*.82)
        .attr("fill",d=>(d.i<full||(d.i===full&&frac>.02))?v.col:v.ocean?C.blauClar:C.ghost)
        .attr("fill-opacity",d=>(d.i<full||(d.i===full&&frac>.02))?.74:v.ocean?.48:.34);

      gCall.selectAll("*").remove();
      if(v.p){
        const by=gridH+(mob?16:20), bw=mob?Math.min(W-16,gridW):Math.min(280,W-24), bx=x0, bh=14;
        if(mob){
          V.note(gCall,{x:data[0].cx,y:data[0].cy+r+2,tx:Math.min(W-8,bx+bw),ty:by+bh+22,kind:"elbow",anchor:"end",
            lines:[["880 camions",true,C.vermellFosc],["1/23 d'un cercle"]],size:11.5,dot:false});
        }else{
          V.note(gCall,{x:data[0].cx,y:data[0].cy+r+2,tx:bx+bw+12,ty:by+bh/2,kind:"elbow",anchor:"start",
            lines:[["Fòsfor: 880 camions",true,C.vermellFosc],["una 23a part d'un sol cercle (22.000 t)"]],size:12.5,dot:false});
        }
        gCall.append("rect").attr("x",bx).attr("y",by).attr("width",bw).attr("height",bh).attr("rx",2)
          .attr("fill",V.alpha(C.grocClar,.65)).attr("stroke",C.hair).attr("stroke-width",.8);
        gCall.append("rect").attr("x",bx).attr("y",by).attr("width",Math.max(4,bw/22.7)).attr("height",bh).attr("rx",1.5)
          .attr("fill",C.vermellFosc);
        for(let s=1;s<23;s++){
          const sx=bx+bw*s/22.7;
          gCall.append("line").attr("x1",sx).attr("x2",sx).attr("y1",by).attr("y2",by+bh).attr("stroke","#FFFFFF").attr("stroke-width",.7);
        }
        V.t(gCall,bx,by+bh+15,mob?"1 cercle = 20.000 camions":"1 cercle = 20.000 camions (500.000 t)",{size:11.5,fill:C.muted});
      }else{
        const activeCount=Math.ceil(exact), pct=Math.round(v.t/182e6*100);
        V.t(gCall,x0,gridH+24,`${f0(activeCount)} de 364 cercles (${pct} % del flux que surt d'Àfrica)`,{size:12,fill:C.ink2});
      }
    }
    updateStage=applyStage;

    const delaunay=d3.Delaunay.from(data,d=>d.cx,d=>d.cy);
    V.hover(svg.node(),(ev,[mx,my])=>{
      if(my>gridH+6){ dots.attr("stroke",null); V.focus(dots,null); tp.hide(); return; }
      const idx=delaunay.find(mx,my), d=data[idx];
      if(!d||Math.hypot(d.cx-mx,d.cy-my)>cell*1.2)return;
      V.focus(dots,x=>x.i<=d.i,{dim:.48});
      dots.attr("stroke",x=>x.i===d.i?C.ink:null).attr("stroke-width",x=>x.i===d.i?1.4:0);
      tp.show(`<b>Cercle ${d.i+1} de ${N_DOTS}</b><br>${f1((d.i+1)*.5)} Mt acumulades (${f0((d.i+1)*20000)} camions de 25 t)`);
    },()=>{ dots.attr("stroke",null); V.focus(dots,null); tp.hide(); });

    applyStage(cur,false);
  }

  const mnt=V.mount(wrap,(el,W)=>{
    if(flowLoop){ flowLoop.stop(); flowLoop=null; }
    updateStage=null;
    if(viewMode==="flow")drawFlow(el,W);
    else drawGrid(el,W);
  });

  function setView(mode){
    if(viewMode===mode)return;
    stopT();
    viewMode=mode;
    viewBtns.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===mode)));
    if(stageRow)stageRow.hidden=(mode==="flow");
    if(flowPlayB)flowPlayB.hidden=(mode!=="flow"||V.reduced);
    renderLegend();
    updateHeader();
    mnt.redraw();
  }
  viewBtns.forEach(b=>b.addEventListener("click",()=>setView(b.dataset.v)));
  renderLegend();
  updateHeader();
}

/* =====================================================================
   5. BALANÇ DE FÒSFOR DE L'AMAZÒNIA (CASE-04 aquarel·la + SCALE-01 llindar)
   Cercles amb radialGradient + multiply d'àrea proporcional per als 7
   estudis publicats i escala interactiva 0–60 g P/ha/any molt polida.
   ===================================================================== */
function initBudget(){
  const wrap=document.getElementById("budgetWrap");
  if(!wrap)return;
  const lgEl=document.getElementById("bLg2");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.vermell,t:"Pols africana / fòsfor aportat",kind:"dot",a:.55},
      {c:C.blau,t:"Pèrdues pels rius (8–40 g/ha)",kind:"dot",a:.32},
      {c:C.groc,t:"Reciclatge de la selva",kind:"dot",a:.65}
    ]);
  }

  const EST=[
    {n:"Prospero et al. 2020",d:"Caiena i model, 2002–2017",v:9,lo:8,hi:10},
    {n:"Swap et al. 1992",d:"Amazònia central, 1987",v:13,lo:9,hi:19},
    {n:"Model GEOS-Chem",d:"Ridley et al. 2012",v:17},
    {n:"Model WRF-Chem",d:"via Yu et al. 2015",v:19},
    {n:"Model GOCART",d:"via Yu et al. 2015",v:26},
    {n:"Satèl·lit CALIPSO",d:"Yu et al. 2015, 2007–2013",v:27.7,lo:8,hi:48,main:true},
    {n:"Satèl·lit MODIS",d:"Kaufman et al. 2005",v:50}
  ];
  const PF=1e12*780e-6/9.6e8; // g P/ha per Tg de pols
  const rng=document.getElementById("bRng"), outD=document.getElementById("bOutD"), ver=document.getElementById("bVerdict");
  let updateVal=null, clearBudgetFocus=null;
  document.addEventListener("pointerdown",ev=>{
    if(clearBudgetFocus&&!wrap.contains(ev.target))clearBudgetFocus();
  });

  function updateVerdict(D){
    const P=D*PF;
    if(outD)outD.textContent=`${fmtNum(D,D%1?1:0)} milions de tones`;
    const lo=P/40*100, hi=P/8*100, Dt=fmtNum(D,D%1?1:0);
    let txt="";
    if(P<.05)txt="Sense pols africana, la selva perdria un dels seus ingressos de fòsfor nou, però no l'únic: el fum dels incendis d'Àfrica també n'hi porta. I del cel hi continuarien caient partícules biològiques i de fum, moltes de la mateixa selva.";
    else if(P<8)txt=`Amb ${Dt} milions de tones, la pols aporta <b>${f1(P)} grams</b> de fòsfor per hectàrea i any: menys que les pèrdues més petites. <b>Només pagaria una part de la comissió.</b>`;
    else if(P<=40)txt=`Amb ${Dt} milions de tones, la pols aporta <b>${fmtNum(P,P<10?1:0)} grams</b> per hectàrea i any. Equivaldria a <b>entre el ${f0(lo)} % i ${hi>=100?"la totalitat":`el ${f0(hi)} %`}</b> del que es perd pels rius, però seria una part petita del fòsfor que cau de l'aire.`;
    else txt=`Amb ${Dt} milions de tones, la pols aporta <b>${f0(P)} grams</b> per hectàrea i any: <b>més que les pèrdues més altes.</b> És més del que mesuren la majoria d'estudis.`;
    if(ver)ver.innerHTML=txt;
    if(rng)rng.setAttribute("aria-valuetext",`${f1(D)} milions de tones; ${f1(P)} grams de fòsfor per hectàrea`);
  }

  V.mount(wrap,(el,W)=>{
    const mob=isMob(W);
    const lw=mob?0:215;
    const rowH=mob?46:29;
    const top1=26, h1=top1+EST.length*rowH+26;
    const top2=h1+30;
    const balH=mob?228:166;
    const H=top2+balH+24;

    const svg=V.svg(el,W,H,"Balanç de fòsfor de l'Amazònia. A dalt, les 7 estimacions publicades de pols africana (de 9 a 50 milions de tones l'any). A baix, comparació del fòsfor aportat per la pols amb les pèrdues pels rius (8–40 g/ha/any), la deposició total de l'aire (161–300 g/ha) i el reciclatge de la selva (1.400–4.100 g/ha).");
    const tp=V.tip(el);
    const defs=svg.append("defs");
    const uid="bg"+Math.random().toString(36).slice(2,6);

    /* Gradients radials d'aquarel·la (CASE-04) */
    const mkRad=(id,col,a0)=>{
      const g=defs.append("radialGradient").attr("id",id);
      g.append("stop").attr("offset","0%").attr("stop-color",col).attr("stop-opacity",a0);
      g.append("stop").attr("offset","62%").attr("stop-color",col).attr("stop-opacity",a0*.46);
      g.append("stop").attr("offset","100%").attr("stop-color",col).attr("stop-opacity",0);
    };
    mkRad(uid+"-main",C.vermell,.72);
    mkRad(uid+"-sec",C.vermell,.46);
    mkRad(uid+"-dot",C.vermell,.55);
    const gRiv=defs.append("linearGradient").attr("id",uid+"-riv").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",1);
    gRiv.append("stop").attr("offset","0%").attr("stop-color",C.blau).attr("stop-opacity",.06);
    gRiv.append("stop").attr("offset","50%").attr("stop-color",C.blau).attr("stop-opacity",.13);
    gRiv.append("stop").attr("offset","100%").attr("stop-color",C.blau).attr("stop-opacity",.06);

    /* Part 1: CASE-04 Estimacions publicades amb cercles d'aquarel·la (scaleSqrt) */
    const x=d3.scaleLinear([0,55],[lw+10,W-28]);
    const rSc=d3.scaleSqrt([0,55],[5.5,mob?13:16]);
    const gE=svg.append("g");
    V.t(gE,0,14,"Estimacions publicades de pols sobre l'Amazònia (Mt/any)",{size:12.5,weight:700,fill:C.ink});
    V.axisX(gE,x,top1+EST.length*rowH,mob?[0,15,30,45]:[0,10,20,30,40,50],f0,{tick:false,grid:top1});

    const rows=gE.selectAll("g.est-row").data(EST).join("g")
      .attr("class","est-row hit").attr("tabindex",0).attr("role","button")
      .attr("aria-label",d=>`${d.n}: ${fmtNum(d.v,d.v%1?1:0)} milions de tones`)
      .attr("transform",(d,i)=>`translate(0,${top1+i*rowH})`);

    rows.append("rect").attr("x",0).attr("y",0).attr("width",W).attr("height",rowH).attr("fill","transparent");
    const cy=mob?rowH*.72:rowH*.52;
    rows.append("line").attr("x1",x(0)).attr("x2",x(55)).attr("y1",cy).attr("y2",cy).attr("stroke",C.grid).attr("stroke-width",.55);
    rows.append("text").attr("x",mob?x(0):0).attr("y",mob?12:rowH*.62)
      .attr("font-size",mob?11.5:12.5).attr("fill",d=>d.main?C.ink:C.ink2).attr("font-weight",d=>d.main?700:400)
      .text(d=>d.n);

    /* Interval d'incertesa translúcid amb petits topalls */
    const rInt=rows.filter(d=>d.lo!=null);
    rInt.append("line").attr("x1",d=>x(d.lo)).attr("x2",d=>x(d.hi)).attr("y1",cy).attr("y2",cy)
      .attr("stroke",d=>d.main?C.vermell:C.ink2).attr("stroke-width",4.5).attr("stroke-linecap","round").attr("opacity",.2);
    rInt.each(function(d){
      const gg=d3.select(this);
      [d.lo,d.hi].forEach(v=>gg.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",cy-4).attr("y2",cy+4)
        .attr("stroke",d.main?C.vermell:C.ink2).attr("stroke-width",.8).attr("opacity",.5));
    });

    /* Cercles d'aquarel·la radialGradient + multiply + puntet central */
    const circs=rows.append("circle")
      .attr("cx",d=>x(d.v)).attr("cy",cy).attr("r",0)
      .attr("fill",d=>`url(#${uid}-${d.main?"main":"sec"})`)
      .style("mix-blend-mode","multiply");
    rows.append("circle").attr("cx",d=>x(d.v)).attr("cy",cy).attr("r",d=>d.main?3:2.2).attr("fill",d=>d.main?C.vermellFosc:C.ink2);
    rows.append("text").attr("x",d=>x(d.v)+rSc(d.v)+4).attr("y",cy+4).attr("font-size",11.5)
      .attr("font-weight",d=>d.main?700:400).attr("fill",C.ink).style("font-variant-numeric","tabular-nums")
      .text(d=>fmtNum(d.v,d.v%1?1:0));

    const curLine=gE.append("line").attr("y1",top1-2).attr("y2",top1+EST.length*rowH)
      .attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-dasharray","3 2").attr("pointer-events","none");

    clearBudgetFocus=()=>{ V.focus(rows,null); tp.hide(); };
    rows.on("click",(e,d)=>{ if(rng)rng.value=d.v; setVal(d.v,false); })
      .on("keydown",(e,d)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); if(rng)rng.value=d.v; setVal(d.v,false); } })
      .on("pointerenter pointerdown",(e,d)=>{
        V.focus(rows,r=>r===d,{dim:.48});
        const pVal=d.v*PF, intv=d.lo!=null?` (interval ${d.lo}–${d.hi} Mt)`:"";
        tp.show(`<b>${d.n}</b> (${d.d})<br>${fmtNum(d.v,d.v%1?1:0)} Mt/any${intv} → ≈ ${f1(pVal)} g P/ha`);
      })
      .on("pointerleave",e=>{ if(e.pointerType!=="mouse")return; clearBudgetFocus(); });

    /* Part 2: SCALE-01 Escala amb llindar de fòsfor (0–60 g P/ha/any) */
    const xb=d3.scaleLinear([0,60],[mob?10:lw+10,W-(mob?14:88)]);
    const gB=svg.append("g");
    V.t(gB,0,top2,"Balanç de fòsfor (grams per hectàrea i any)",{size:12.5,weight:700,fill:C.ink});

    const bt=top2+18, dy=mob?45:35;
    const r1=bt+12, r2=r1+dy, r3=r2+dy, r4=r3+dy, bh=12;
    V.axisX(gB,xb,bt+balH-22,[0,10,20,30,40,50,60],f0,{tick:false,grid:bt});

    /* Zona de llindar: pèrdues pels rius (8–40 g/ha/any) en aquarel·la blava */
    gB.append("rect").attr("x",xb(8)).attr("y",bt).attr("width",xb(40)-xb(8)).attr("height",balH-22)
      .attr("fill",`url(#${uid}-riv)`);
    [8,40].forEach(v=>{
      gB.append("line").attr("x1",xb(v)).attr("x2",xb(v)).attr("y1",bt).attr("y2",bt+balH-22)
        .attr("stroke",C.blau).attr("stroke-width",.85).attr("stroke-dasharray","2.5 2.5");
    });

    const rowLab=(yPos,txt,bold)=>V.t(gB,mob?xb(0):0,mob?yPos-6:yPos+bh*.8,txt,{size:mob?11.5:12.5,weight:bold?700:400,fill:bold?C.ink:C.ink2});
    rowLab(r1,"Entra amb la pols africana",true);
    rowLab(r2,"Surt pels rius (llindar)",false);
    rowLab(r3,"Cau de l'aire (totes les fonts)",false);
    rowLab(r4,"Recicla la selva (fulles)",false);

    /* Fila 1: entrada de pols (barra fina + aura d'aquarel·la + triangle) */
    const inBar=gB.append("rect").attr("x",xb(0)).attr("y",r1).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.vermell,.72));
    const inDot=gB.append("circle").attr("cy",r1+bh/2).attr("r",12).attr("fill",`url(#${uid}-dot)`).style("mix-blend-mode","multiply");
    const inTri=gB.append("path").attr("fill",C.ink);
    const inVal=gB.append("text").attr("y",r1+bh*.82).attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink).style("font-variant-numeric","tabular-nums");

    /* Fila 2: rang de pèrdues pels rius */
    gB.append("rect").attr("x",xb(8)).attr("y",r2).attr("width",xb(40)-xb(8)).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.blau,.34));
    V.t(gB,xb(40)+7,r2+bh*.82,"8–40 g/ha",{size:12,fill:C.blauFosc,weight:600});

    /* Fila 3: deposició total de l'aire (fora d'escala) */
    gB.append("rect").attr("x",xb(0)).attr("y",r3).attr("width",xb(60)-xb(0)).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.ink2,.14));
    V.t(gB,xb(60)-6,r3+bh*.78,mob?"pols, fum i espores":"fora d'escala: pols, fum i partícules biològiques",{anchor:"end",size:11,fill:C.ink2});
    V.t(gB,xb(60)+(mob?-2:7),r3+bh*.82+(mob?bh+4:0),"161–300 →",{anchor:mob?"end":"start",size:11.5,fill:C.ink2,weight:600});

    /* Fila 4: reciclatge de la selva (groc suau, etiqueta en tinta) */
    gB.append("rect").attr("x",xb(0)).attr("y",r4).attr("width",xb(60)-xb(0)).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.groc,.38));
    V.t(gB,xb(60)-6,r4+bh*.78,mob?"60–180× la pols":"fora d'escala: de 60 a 180 vegades la pols",{anchor:"end",size:11,fill:C.ink});
    V.t(gB,xb(60)+(mob?-2:7),r4+bh*.82+(mob?bh+4:0),"1.400–4.100 →",{anchor:mob?"end":"start",size:11.5,fill:C.ink,weight:600});

    function setVal(D,instant){
      const P=D*PF, px=xb(Math.min(P,60)), dur=instant||V.reduced?0:280;
      curLine.transition().duration(dur).attr("x1",x(D)).attr("x2",x(D));
      inBar.transition().duration(dur).attr("width",Math.max(0,px-xb(0)));
      inDot.transition().duration(dur).attr("cx",px);
      inTri.transition().duration(dur).attr("d",`M${px-4},${r1-6}L${px+4},${r1-6}L${px},${r1-1}Z`);
      const flipVal=px+40>W-8;
      inVal.transition().duration(dur)
        .attr("x",flipVal?px-12:px+11)
        .attr("text-anchor",flipVal?"end":"start")
        .text(fmtNum(P,P<10?1:0)+(mob?"":" g/ha"));
      updateVerdict(D);
    }
    updateVal=setVal;

    V.onView(el,inst=>{
      const d0=rng?+rng.value:27.7;
      circs.transition().duration(inst||V.reduced?0:680).delay((d,i)=>inst||V.reduced?0:i*55).ease(V.EASE)
        .attr("r",d=>rSc(d.v));
      setVal(d0,inst);
    });
  });

  if(rng)rng.addEventListener("input",()=>{ if(updateVal)updateVal(+rng.value,true); else updateVerdict(+rng.value); });
}

/* =====================================================================
   6. ANY A ANY (2007–2013) · TIME-02 Sèries multi-meridià amb aquarel·la
   Traços nítids, embolcalls LDF–UDF en degradat multiply, anotacions
   quirúrgiques IBV.note i hover sincronitzat amb .ibv-dock.
   ===================================================================== */
function initYears(){
  const wrap=document.getElementById("yearsWrap");
  if(!wrap)return;
  const lgEl=document.getElementById("yLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.vermell,t:"Surt d'Àfrica (15° O)",kind:"line",w:2.2},
      {c:C.ink2,t:"A mig oceà (35° O)",kind:"line",w:2},
      {c:C.blau,t:"Arriba al Carib (75° O)",kind:"line",w:2},
      {c:C.ghost,t:"Embolcall LDF–UDF",kind:"dot",a:.45}
    ]);
  }

  /* Yu et al. 2015 RSE taula 2: [any, LDF, UDF, AVE] */
  const DATA={
    "15":[[2007,195.9,257.3,226.6],[2008,190.7,252.6,221.7],[2009,129.3,176.4,152.9],[2010,140.5,192.1,166.3],[2011,111.5,153.9,132.7],[2012,185.9,243.9,214.9],[2013,135.5,185.2,160.4]],
    "35":[[2007,134.8,215.5,175.2],[2008,100.8,164.4,132.6],[2009,83.4,141.3,112.4],[2010,101.8,161.0,131.4],[2011,78.8,132.2,105.5],[2012,114.8,188.3,151.6],[2013,85.3,142.3,113.8]],
    "75":[[2007,32.1,64.9,48.5],[2008,31.9,63.1,47.5],[2009,25.7,55.2,40.5],[2010,29.6,59.5,44.6],[2011,18.5,38.3,28.4],[2012,34.5,67.4,51.0],[2013,29.9,54.5,42.2]]
  };
  const SER=[
    {k:"15",n:"Surt d'Àfrica",s:"15° O",avg:182,col:C.vermell},
    {k:"35",n:"A mig oceà",s:"35° O",avg:132,col:C.ink2},
    {k:"75",n:"Arriba al Carib",s:"75° O",avg:43,col:C.blau}
  ];

  V.mount(wrap,(el,W)=>{
    const mob=isMob(W);
    const H=mob?304:370;
    const mg={l:mob?32:40,r:mob?14:160,t:26,b:30};

    const svg=V.svg(el,W,H,"Pols africana que creua l'Atlàntic cada any del 2007 al 2013 a tres meridians. A 15° O va de 133 a 227 Mt, a 35° O de 106 a 175 Mt i a 75° O de 28 a 51 Mt. El 2011 és l'any amb menys pols.");
    svg.attr("tabindex",0);
    const tp=V.tip(el);
    const defs=svg.append("defs"), uid="yr"+Math.random().toString(36).slice(2,6);

    const x=d3.scaleLinear([2007,2013],[mg.l,W-mg.r]);
    const y=d3.scaleLinear([0,260],[H-mg.b,mg.t]);

    V.gridY(svg,y,mg.l,W-mg.r,[0,50,100,150,200,250],f0,{zero:0,unit:" Mt/any"});
    V.axisX(svg,x,H-mg.b,d3.range(2007,2014),yr=>mob&&yr%2===0?"’"+String(yr).slice(2):String(yr),{tick:false});

    const gPlot=svg.append("g");
    const lineGen=d3.line().x(r=>x(r[0])).y(r=>y(r[3])).curve(d3.curveMonotoneX);
    const areaGen=d3.area().x(r=>x(r[0])).y0(r=>y(r[1])).y1(r=>y(r[2])).curve(d3.curveMonotoneX);

    const paths=[], bands=[], allDots=[];
    SER.forEach(s=>{
      const d=DATA[s.k];
      /* Embolcall d'aquarel·la LDF–UDF en degradat vertical multiply */
      const gr=defs.append("linearGradient").attr("id",`${uid}-${s.k}`).attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",1);
      gr.append("stop").attr("offset","0%").attr("stop-color",s.col).attr("stop-opacity",.06);
      gr.append("stop").attr("offset","50%").attr("stop-color",s.col).attr("stop-opacity",.20);
      gr.append("stop").attr("offset","100%").attr("stop-color",s.col).attr("stop-opacity",.06);

      const b=gPlot.append("path").datum(d).attr("d",areaGen)
        .attr("fill",`url(#${uid}-${s.k})`).style("opacity",0).style("mix-blend-mode","multiply");
      bands.push(b);

      /* Marca discreta de mitjana 2007–2013 */
      gPlot.append("line").attr("x1",mg.l).attr("x2",W-mg.r).attr("y1",y(s.avg)).attr("y2",y(s.avg))
        .attr("stroke",s.col).attr("stroke-width",.55).attr("stroke-dasharray","2 4").attr("opacity",.38);

      const p=gPlot.append("path").datum(d).attr("d",lineGen)
        .attr("fill","none").attr("stroke",s.col).attr("stroke-width",s.k==="15"?2.4:1.95).attr("stroke-linecap","round");
      paths.push(p);

      const pts=gPlot.selectAll(null).data(d.map(r=>({r,s}))).join("circle")
        .attr("cx",o=>x(o.r[0])).attr("cy",o=>y(o.r[3])).attr("r",3.4)
        .attr("fill",C.paper).attr("stroke",s.col).attr("stroke-width",1.6).style("opacity",0);
      allDots.push(pts);

      const last=d[d.length-1];
      if(!mob){
        V.lines(gPlot,x(2013)+10,y(last[3])+2,[[s.n,true,s.k==="15"?C.vermell:C.ink],[`${s.s} · mitjana ${s.avg} Mt`,false,C.muted]],{size:12});
      }else{
        V.t(gPlot,x(2013),y(last[2])-6,s.s,{anchor:"end",weight:700,size:11.5,fill:s.k==="15"?C.vermell:C.ink,halo:3});
      }
    });

    /* Anotacions quirúrgiques IBV.note (P4) */
    const gAnn=svg.append("g").attr("pointer-events","none").style("opacity",0);
    V.note(gAnn,{x:x(2007),y:y(226.6),tx:x(2007)+(mob?22:32),ty:y(248),kind:"elbow",anchor:"start",
      lines:[["2007 · 227 Mt",true],["màxim del període"]],size:mob?11.5:12});
    V.note(gAnn,{x:x(2011),y:y(28.4),tx:mob?W-10:x(2011),ty:y(6)+2,kind:"straight",anchor:mob?"end":"middle",
      lines:[["2011 · mínim a tots tres meridians",true]],size:mob?11.5:12});

    /* Capa de hover sincronitzat amb .ibv-dock */
    const gHl=svg.append("g").attr("pointer-events","none");
    const rule=gHl.append("line").attr("y1",mg.t).attr("y2",H-mg.b).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2").style("opacity",0);
    const hlDots=gHl.append("g");
    const hit=svg.append("rect").attr("x",mg.l).attr("y",mg.t).attr("width",W-mg.l-mg.r).attr("height",H-mg.t-mg.b).attr("fill","transparent").attr("class","ibv-hit");

    function showYr(yr){
      svg.attr("data-yr",yr);
      const i=yr-2007, sx=x(yr);
      rule.attr("x1",sx).attr("x2",sx).style("opacity",.75);
      hlDots.selectAll("*").remove();
      SER.forEach(s=>{
        const r=DATA[s.k][i];
        /* Segment vertical LDF–UDF del punt actiu */
        hlDots.append("line").attr("x1",sx).attr("x2",sx).attr("y1",y(r[1])).attr("y2",y(r[2]))
          .attr("stroke",s.col).attr("stroke-width",2.2).attr("opacity",.45);
        hlDots.append("circle").attr("cx",sx).attr("cy",y(r[3])).attr("r",5)
          .attr("fill",s.col).attr("stroke",C.ink).attr("stroke-width",1.5);
      });
      allDots.forEach(sel=>V.focus(sel,o=>o.r[0]===yr,{dim:.48}));
      gAnn.style("opacity",.52);
      const parts=SER.map(s=>{
        const r=DATA[s.k][i];
        return `${s.s}: <b>${f1(r[3])} Mt</b> (${f0(r[1])}–${f0(r[2])})`;
      });
      tp.show(`<b>${yr}</b><br>${parts.join(" · ")}`);
    }
    function clearYr(){
      rule.style("opacity",0);
      hlDots.selectAll("*").remove();
      allDots.forEach(sel=>V.focus(sel,null));
      gAnn.style("opacity",1);
      tp.hide();
    }

    V.hover(hit.node(),(ev,[mx])=>{
      const yr=clamp(Math.round(x.invert(mx)),2007,2013);
      showYr(yr);
    },clearYr);
    svg.on("keydown",e=>{
      let yr=+(svg.attr("data-yr")||2006);
      if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
        e.preventDefault();
        yr=clamp(yr+(e.key==="ArrowRight"?1:-1),2007,2013);
        showYr(yr);
      }
    });

    V.onView(el,inst=>{
      if(inst||V.reduced){
        bands.forEach(b=>b.style("opacity",1));
        allDots.forEach(pts=>pts.style("opacity",1));
        gAnn.style("opacity",1);
      }else{
        paths.forEach((p,idx)=>{
          const len=p.node().getTotalLength();
          p.attr("stroke-dasharray",`${len} ${len}`).attr("stroke-dashoffset",len)
            .transition().duration(900).delay(idx*110).ease(V.EASE).attr("stroke-dashoffset",0)
            .on("end",function(){ d3.select(this).attr("stroke-dasharray",null); });
        });
        bands.forEach((b,idx)=>b.transition().duration(700).delay(350+idx*80).style("opacity",1));
        allDots.forEach((pts,idx)=>pts.transition().duration(450).delay(500+idx*90).style("opacity",1));
        gAnn.transition().duration(500).delay(750).style("opacity",1);
      }
    });
  });
}

function start(){
  initBodele();
  initSAL();
  initAtlantic();
  initTrucks();
  initBudget();
  initYears();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);
else start();
})();
