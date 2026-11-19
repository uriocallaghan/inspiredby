/* La pols que adoba l'Amazònia — sistema infogràfic d'Inspired by Magazine (IBV).
   Peces aplicades:
   1. Bodélé (#bmap): IB-28 (camp de vent/pols animat lent) + IB-25 (cercles translúcids multiply)
   2. Capa d'aire del Sàhara (#salWrap): IB-16 (tall atmosfèric interactiu)
   3. Viatge a l'Atlàntic (#mmap): IB-28 (flux lent de micro-traços) + IB-25 (deposició translúcida)
   4. Escala en camions (#trucksWrap): IB-11 (reixa d'unitats orgànica de 364 cercles)
   5. Balanç de fòsfor (#budgetWrap): IB-38 (estimacions translúcides) + IB-10 (escala amb llindar)
   6. Any a any 2007–2013 (#yearsWrap): IB-01 (sèries amb franja d'incertesa i anotacions)
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
const isMob=w=>(w!=null?w:window.innerWidth)<680;
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

const MES=["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"];
/* Yu et al. 2015 RSE taula 1 (15° O i 75° O, % del flux anual) i Yu et al. 2015 GRL (deposició a l'Amazònia, Tg) */
const SEAS=[
  {n:"Hivern",m:"desembre–febrer",out:23,car:11,amz:"11,9 milions de tones"},
  {n:"Primavera",m:"març–maig",out:21,car:16,amz:"15,8 milions de tones"},
  {n:"Estiu",m:"juny–agost",out:46,car:61,amz:"gairebé gens"},
  {n:"Tardor",m:"setembre–novembre",out:10,car:12,amz:"gairebé gens"}
];
function seasonOf(m){ const k=Math.floor(((m%12)+12)%12); return k===11||k<2?0:k<5?1:k<8?2:3; }
function fluxM(m){
  const c=[[-2.5,10/3],[0.5,23/3],[3.5,21/3],[6.5,46/3],[9.5,10/3],[12.5,23/3]];
  return pw(c,((m%12)+12)%12);
}
function summer(m){
  const n=[[-.5,.08],[.5,0],[1.5,0],[2.5,.08],[3.5,.2],[4.5,.45],[5.5,.85],[6.5,1],[7.5,1],[8.5,.85],[9.5,.6],[10.5,.3],[11.5,.08],[12.5,0]];
  return pw(n,((m%12)+12)%12);
}

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
      return {lon:lerp(a[0],b[0],t)+(-dy/d)*q*w, lat:lerp(a[1],b[1],t)+(dx/d)*q*w, sp:lerp(a[3],b[3],t)};
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

/* =====================================================================
   1. EL BODÉLÉ (IB-28 + IB-25) · Scrolly
   Geografia silenciosa (#ECEBE8 sobre paper blanc), micro-traços molt lents
   de vent harmattan i pols, i cercles translúcids multiply (mai dianes).
   ===================================================================== */
function initBodele(){
  const wrap=document.getElementById("bmap");
  if(!wrap)return;
  const lgEl=document.getElementById("bLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.blauClar,t:"Llac Megatxad",kind:"dot",a:.85},
      {c:C.grocClar,t:"Diatomita",kind:"dot",a:.9},
      {c:C.vermell,t:"Pols del Bodélé",kind:"line",w:2}
    ]);
  }

  let MEGA=[[12.3,13.0],[12.6,14.4],[13.4,15.5],[14.5,16.4],[15.4,17.5],[16.3,18.5],[17.4,19.0],[18.6,18.9],[19.4,18.2],[19.7,17.1],[19.1,16.0],[18.3,15.1],[17.7,14.1],[17.1,12.9],[16.1,11.7],[15.0,11.0],[13.8,11.1],[12.9,11.8]];
  const CHAD=[[13.55,13.05],[13.7,13.55],[14.1,13.8],[14.45,13.6],[14.5,13.15],[14.2,12.9],[13.8,12.85]];
  const DIAT=[[16.5,17.5],[17.3,18.2],[18.3,18.05],[18.85,17.3],[18.4,16.45],[17.4,16.25],[16.7,16.7]];
  function polyArea(pts){
    const ring=pts.concat([pts[0]]).map(p=>p.slice());
    let a=d3.geoArea({type:"Polygon",coordinates:[ring]});
    if(a>2*Math.PI){ ring.reverse(); a=d3.geoArea({type:"Polygon",coordinates:[ring]}); }
    return a*6371*6371;
  }
  const cen=d3.polygonCentroid(MEGA);
  MEGA=scalePoly(MEGA,cen[0],cen[1],Math.sqrt(361000/polyArea(MEGA)));
  const chadC=[14.0,13.3];

  const PATH=makePath([[29,24.5,4.2,.8],[24.5,21.6,2.6,1.1],[20.9,18.9,.75,2.2],[18.2,17.4,1.3,1.6],[14.5,14.6,2.0,1.15],[9.5,10.5,2.6,1],[4.5,6.6,3.0,1],[-1,4.6,3.2,1],[-10,4.4,3.4,1],[-19,5.0,3.8,1],[-36,4.5,5,1]]);
  const sGap=PATH.sAt(2), sBod=PATH.sAt(3), sD=PATH.sAt(4), sEnd=PATH.total;

  const STEPS=[
    {v:[-20,42,2,36],name:"Avui",val:"El Bodélé, al nord del Txad (0,2 % del Sàhara)",monsoon:0,lake:0,shrink:0,diat:.35,wind:0,dust:.28,reach:.06,spot:1,inset:0},
    {v:[4,30,6,25],name:"Fa entre 11.500 i 5.000 anys",val:"El llac Megatxad: uns 361.000 km², onze vegades Catalunya",monsoon:1,lake:1,shrink:0,diat:0,wind:0,dust:0,reach:0,spot:0,inset:0},
    {v:[4,30,6,25],name:"Fa uns 1.000 anys",val:"Les pluges es retiren i el Bodélé queda sec",monsoon:.12,lake:1,shrink:1,diat:.65,wind:0,dust:0,reach:0,spot:0,inset:0},
    {v:[11,25,12,22.5],name:"Avui",val:"Un fons de diatomita: closques de sílice d'algues d'aigua dolça",monsoon:0,lake:0,shrink:1,diat:1,wind:0,dust:0,reach:0,spot:0,inset:1},
    {v:[8,31,9,26.5],name:"Avui, de desembre a març",val:"L'harmattan s'accelera entre el Tibesti i l'Ennedi",monsoon:0,lake:0,shrink:1,diat:1,wind:1,dust:1,reach:.1,spot:0,inset:0},
    {v:[-38,32,-8,30],name:"Avui, de desembre a març",val:"La pols viatja cap al golf de Guinea i l'Atlàntic",monsoon:0,lake:0,shrink:1,diat:1,wind:.5,dust:1,reach:1,spot:0,inset:0}
  ];

  const ANNS=[
    {lon:17.6,lat:17.3,lines:[["Bodélé",true]],dx:18,dy:20,lead:true,steps:[0,3,4,5]},
    {lon:18.6,lat:21.0,lines:[["Tibesti",true]],dx:-38,dy:-14,anchor:"end",lead:true,steps:[3,4]},
    {lon:22.4,lat:17.0,lines:[["Ennedi",true]],dx:28,dy:16,lead:true,steps:[3,4]},
    {lon:16.2,lat:15.2,lines:[["Llac Megatxad",true],["361.000 km², fins a 160 m"]],dx:-78,dy:24,anchor:"end",lead:true,steps:[1]},
    {lon:14.1,lat:13.3,lines:[["Llac Txad",true],["el que en queda avui"]],dx:-46,dy:28,anchor:"end",lead:true,steps:[2,3]},
    {lon:17.6,lat:17.2,lines:[["Bodélé",true],["sec fa uns mil anys"]],dx:36,dy:-30,lead:true,steps:[2]},
    {lon:18.0,lat:16.6,lines:[["Diatomita",true],["restes d'algues del llac"]],dx:34,dy:30,lead:true,steps:[3]},
    {lon:25.5,lat:23.0,lines:[["Harmattan",true],["vent sec del nord-est"]],dx:16,dy:-22,lead:true,steps:[4]},
    {lon:20.9,lat:18.9,lines:[["Embut de vent",true],["el flux s'accelera"]],dx:32,dy:-8,hm:true,steps:[4]},
    {lon:5,lat:25,lines:[["Sàhara",true]],anchor:"middle",steps:[0]},
    {lon:3,lat:3,lines:[["Golf de Guinea",false]],anchor:"middle",italic:true,hm:true,steps:[5]},
    {lon:-9,lat:4.8,lines:[["Cap a l'Atlàntic",true],["← rumb a Amèrica"]],dx:-12,dy:-24,anchor:"end",steps:[5]}
  ];

  const POIS=[
    {n:"Depressió del Bodélé",d:"0,2 % del Sàhara · ~700.000 t per tempesta",lon:17.7,lat:17.2},
    {n:"Massís del Tibesti",d:"Muntanyes al nord-oest del pas de l'harmattan",lon:18.6,lat:21.0},
    {n:"Altiplà de l'Ennedi",d:"Relleu al sud-est que estreny el vent",lon:22.4,lat:17.0},
    {n:"Llac Txad",d:"Resta actual de l'antic Megatxad",lon:14.1,lat:13.3},
    {n:"Golf de Guinea",d:"Sortida de la pols cap a l'Atlàntic equatorial",lon:3.0,lat:3.0}
  ];

  let step=0, view=STEPS[0].v.slice(), tgt=STEPS[0].v.slice();
  const st={monsoon:0,lake:0,shrink:0,diat:.35,wind:0,dust:.28,reach:.06,spot:1,inset:0};
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
  const tri=()=>rnd()+rnd()-1;
  let wind=[], dust=[], monsoonPts=[];

  const mnt=V.mount(wrap,(el,W)=>{
    if(activeLoop){ activeLoop.stop(); activeLoop=null; }
    if(!WORLD){ ensureWorld(()=>mnt.redraw()); return; }
    const mob=isMob(W);
    const maxH=mob?Math.min(window.innerHeight*.38,300):Math.min(Math.max(300,window.innerHeight-210),520);
    const H=Math.round(Math.min(W*(mob?.74:.64),maxH));

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
      /* P1 i IB-28: aigua en paper blanc (transparent), terra plana en #ECEBE8 */
      const gp=d3.geoPath(proj,baseCtx);
      baseCtx.strokeStyle=C.grid; baseCtx.lineWidth=.5;
      baseCtx.beginPath(); gp(d3.geoGraticule().step([10,10])()); baseCtx.stroke();
      baseCtx.fillStyle=C.land;
      baseCtx.beginPath(); gp(WORLD.land); baseCtx.fill();
      baseCtx.strokeStyle="#FFFFFF"; baseCtx.lineWidth=.7;
      baseCtx.beginPath(); gp(WORLD.borders); baseCtx.stroke();
      /* Equador subtil */
      const eq0=P(-180,0), eq1=P(180,0);
      baseCtx.save(); baseCtx.setLineDash([2,4]); baseCtx.strokeStyle=C.muted; baseCtx.globalAlpha=.45; baseCtx.lineWidth=.65;
      baseCtx.beginPath(); baseCtx.moveTo(eq0[0],eq0[1]); baseCtx.lineTo(eq1[0],eq1[1]); baseCtx.stroke(); baseCtx.restore();
      baseDirty=false;
    }

    /* Partícules IB-28 amb estela de 10 punts, velocitat molt lenta (~25 s) */
    const KT=mob?8:11;
    function spW(p,pre){ p.s=pre?rnd()*sD:rnd()*sGap*.65; p.q=tri(); p.tr=[]; }
    function spD(p,pre){ p.s=sBod+(pre?rnd(-.2,2.4):rnd(-.35,.35)); p.q=rnd(-.72,.72); p.u=Math.pow(rnd(),.55); p.tr=[]; p.shade=rnd(); }
    const nw=mob?55:110, nd=mob?260:520;
    wind=[]; dust=[]; monsoonPts=[];
    for(let i=0;i<nw;i++){ const p={}; spW(p,true); wind.push(p); }
    for(let i=0;i<nd;i++){ const d={}; spD(d,true); dust.push(d); }
    for(let i=0;i<(mob?90:180);i++) monsoonPts.push([4+rnd()*26,8+rnd()*17,rnd()]);

    /* Diatomea gravada en tinta (sense caixa pesada ni ombra) */
    function drawDiatom(alpha){
      if(alpha<.02||W<300)return;
      const r=Math.round(Math.min(42,W*.065));
      const x=W<540?r+16:W-r-24, y=r+18;
      ctx.save(); ctx.globalAlpha=alpha;
      ctx.fillStyle="rgba(255,255,255,.92)";
      ctx.beginPath(); ctx.arc(x,y,r+7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=C.hair; ctx.lineWidth=.9; ctx.stroke();
      ctx.strokeStyle=C.ink2; ctx.lineWidth=.75;
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
      let n=0; const s=clamp(k*DEG*.16,2,5);
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
      /* Noms discrets de països */
      const countries=[["Txad",20.8,13.4],["Níger",9.5,17.5],["Líbia",18,26.5],["Sudan",29,14],["Nigèria",8,9.6],["Algèria",3,28],["Mali",-2,18]];
      countries.forEach(([nm,lo,la])=>{
        const q=P(lo,la);
        if(q[0]>28&&q[0]<W-28&&q[1]>16&&q[1]<H-14&&!(st.lake>.5&&nm==="Txad")){
          V.t(gAnn,q[0],q[1],nm,{size:mob?11:11.5,fill:C.muted,anchor:"middle",halo:2.5});
        }
      });
      const K=clamp(W/860,.65,1.15);
      ANNS.forEach(a=>{
        if(a.steps.indexOf(step)<0)return;
        if(mob&&a.hm)return;
        const p=P(a.lon,a.lat);
        if(p[0]<-10||p[0]>W+10||p[1]<-10||p[1]>H+10)return;
        const tx2=clamp(p[0]+(a.dx||0)*K,a.anchor==="end"?86:10,a.anchor==="end"?W-10:W-96);
        const ty2=clamp(p[1]+(a.dy||0)*K,16,H-18);
        if(a.lead){
          V.note(gAnn,{x:p[0],y:p[1],tx:tx2,ty:ty2,lines:a.lines,kind:"elbow",anchor:a.anchor,dot:true,size:mob?11.5:12.5,italic:a.italic});
        }else{
          V.lines(gAnn,tx2,ty2,a.lines,{anchor:a.anchor||"start",halo:3,size:mob?11.5:12.5,italic:a.italic,fill:a.italic?C.ink2:C.ink});
        }
      });
    }

    function stepParticles(dt,moving){
      const reachS=lerp(sD+1,sEnd,st.reach);
      /* Velocitat molt lenta i contemplativa (~25 s) */
      const spd=.68*clamp((view[1]-view[0])/28,.65,2.1);
      if(st.dust>.02){
        for(let i=0;i<dust.length;i++){
          const d=dust[i], q=PATH.at(d.s,d.q);
          d.s+=q.sp*spd*dt;
          if(moving)d.tr=[];
          if(d.s>lerp(sBod+1.4,reachS,d.u)||d.s>=sEnd-.02){ spD(d,false); continue; }
          const p=P(q.lon,q.lat);
          d.tr.push(p); if(d.tr.length>KT)d.tr.shift();
        }
      }
      if(st.wind>.02){
        for(let i=0;i<wind.length;i++){
          const w=wind[i], q=PATH.at(w.s,w.q);
          w.s+=q.sp*spd*1.05*dt;
          if(moving)w.tr=[];
          if(w.s>sD+(st.reach>.5?3:0)){ spW(w,false); continue; }
          const p=P(q.lon,q.lat);
          w.tr.push(p); if(w.tr.length>KT)w.tr.shift();
        }
      }
    }

    function paint(){
      if(baseDirty)drawBase();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.drawImage(baseCv,0,0);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      /* Monsó humit del Sàhara fa 11.500–5.000 anys (traços fins en blau, MAI verd!) */
      if(st.monsoon>.02){
        ctx.save();
        ctx.strokeStyle=V.alpha(C.blau,.22*st.monsoon);
        ctx.lineWidth=.9; ctx.lineCap="round";
        ctx.beginPath();
        monsoonPts.forEach(m=>{
          const p=P(m[0],m[1]);
          ctx.moveTo(p[0],p[1]); ctx.lineTo(p[0]-3,p[1]+6);
        });
        ctx.stroke();
        ctx.restore();
      }

      /* Antic llac Megatxad i llac Txad actual */
      if(st.lake>.01){
        const ff=lerp(1,.16,sm(st.shrink));
        ctx.save();
        ctx.globalAlpha=st.lake*(1-.82*sm(st.shrink));
        polyPath(ctx,P,scalePoly(MEGA,chadC[0],chadC[1],ff));
        ctx.fillStyle=V.alpha(C.blauClar,.78); ctx.fill();
        ctx.strokeStyle=V.alpha(C.blau,.5); ctx.lineWidth=.8; ctx.stroke();
        ctx.restore();
      }
      const chadA=Math.max(sm(st.shrink),1-st.lake)*clamp(1-st.reach*.2,0,1);
      if(chadA>.02&&(st.shrink>.05||st.lake<.99)){
        ctx.save(); ctx.globalAlpha=chadA*.85;
        polyPath(ctx,P,CHAD); ctx.fillStyle=C.blau; ctx.fill();
        ctx.restore();
      }

      /* Diatomita (groc clar suau + textura subtil, sense ocre) */
      if(st.diat>.01){
        ctx.save(); ctx.globalAlpha=st.diat;
        polyPath(ctx,P,DIAT);
        ctx.fillStyle=V.alpha(C.grocClar,.62); ctx.fill();
        ctx.strokeStyle=V.alpha(C.grocFosc,.7); ctx.lineWidth=.85; ctx.stroke();
        ctx.restore();
      }

      /* Muntanyes Tibesti i Ennedi */
      const mA=clamp(st.diat*1.15,0,1)*(1-st.lake*.6);
      if(mA>.02){
        ctx.save(); ctx.globalAlpha=mA*.52; ctx.strokeStyle=C.ink2; ctx.lineWidth=.75; ctx.lineJoin="round";
        ctx.beginPath(); drawMountains(16.4,20.6,19.4,22.6); drawMountains(21.2,23.8,15.9,18.4); ctx.stroke();
        ctx.restore();
      }

      /* Micro-traços de vent harmattan (IB-28) */
      if(st.wind>.02){
        ctx.save(); ctx.lineCap="round";
        for(let i=0;i<wind.length;i++){
          const tr=wind[i].tr; if(tr.length<2)continue;
          for(let k=1;k<tr.length;k++){
            const al=(k/tr.length)*.38*st.wind;
            ctx.strokeStyle=V.alpha(C.blauFosc,al);
            ctx.lineWidth=.85;
            ctx.beginPath(); ctx.moveTo(tr[k-1][0],tr[k-1][1]); ctx.lineTo(tr[k][0],tr[k][1]); ctx.stroke();
          }
        }
        ctx.restore();
      }

      /* Micro-traços de pols (IB-28 en vermell/vermellFosc) */
      if(st.dust>.02){
        ctx.save(); ctx.lineCap="round";
        for(let i=0;i<dust.length;i++){
          const d=dust[i], tr=d.tr; if(tr.length<2)continue;
          const col=d.shade>.62?C.vermellFosc:C.vermell;
          for(let k=1;k<tr.length;k++){
            const al=(k/tr.length)*.62*st.dust;
            ctx.strokeStyle=V.alpha(col,al);
            ctx.lineWidth=d.shade>.62?1.25:.95;
            ctx.beginPath(); ctx.moveTo(tr[k-1][0],tr[k-1][1]); ctx.lineTo(tr[k][0],tr[k][1]); ctx.stroke();
          }
        }
        ctx.restore();
      }

      /* Pas 0: Cercles translúcids multiply al Bodélé (IB-25 — MAI anells concèntrics tipus diana!) */
      if(st.spot>.02){
        const b=P(17.7,17.2);
        const R=mob?16:22;
        ctx.save();
        ctx.globalCompositeOperation="multiply";
        const gr=ctx.createRadialGradient(b[0],b[1],1,b[0],b[1],R);
        gr.addColorStop(0,V.alpha(C.vermell,.46*st.spot));
        gr.addColorStop(.6,V.alpha(C.vermell,.18*st.spot));
        gr.addColorStop(1,V.alpha(C.vermell,0));
        ctx.fillStyle=gr;
        ctx.beginPath(); ctx.arc(b[0],b[1],R,0,Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=V.alpha(C.vermell,st.spot);
        ctx.beginPath(); ctx.arc(b[0],b[1],3.2,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }

      drawDiatom(st.inset);
    }

    /* Pre-escalfament perquè les esteles ja hi siguin en entrar */
    for(let i=0;i<16;i++)stepParticles(.12,false);
    renderAnns();
    paint();

    drawFn=()=>{
      Object.keys(tg).forEach(k=>{ st[k]=tg[k]; });
      view=tgt.slice(); fit();
      dust.forEach(d=>{ d.tr=[]; }); wind.forEach(w=>{ w.tr=[]; });
      for(let i=0;i<14;i++)stepParticles(.12,false);
      renderAnns(); paint();
    };

    /* Hover: coordenades i punt d'interès més proper */
    V.hover(hit.node(),(ev,[px,py])=>{
      const [lon,lat]=inv(px,py);
      let near=null, best=Infinity;
      POIS.forEach(q=>{
        const qp=P(q.lon,q.lat), dist=Math.hypot(qp[0]-px,qp[1]-py);
        if(dist<best){ best=dist; near=q; }
      });
      gHl.selectAll("*").remove();
      gHl.append("circle").attr("cx",px).attr("cy",py).attr("r",4.5).attr("fill",C.vermell).attr("stroke",C.ink).attr("stroke-width",1.4);
      gAnn.style("opacity",.52);
      if(near&&best<(mob?48:70)){
        tp.show(`<b>${near.n}</b><br>${near.d}`);
      }else{
        tp.show(`<b>${STEPS[step].name}</b><br>${llFmt(lon,lat)} · ${STEPS[step].val}`);
      }
    },()=>{
      gHl.selectAll("*").remove();
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
   2. TALL DE LA CAPA D'AIRE DEL SÀHARA (IB-16)
   Capes suaus sense contorns negres, micro-traços molt lents, hover per
   longitud amb lectura exacta d'altura al dock.
   ===================================================================== */
function initSAL(){
  const wrap=document.getElementById("salWrap");
  if(!wrap)return;
  const lgEl=document.getElementById("salLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.vermell,t:"Capa d'aire del Sàhara (pols)",kind:"dot",a:.48},
      {c:C.blau,t:"Aire marí fresc / pluja",kind:"dot",a:.38},
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

  let cur=0, sv=0, playing=false, pt=0, activeLoop=null, redrawStatic=null;

  function setSeason(i){
    cur=i;
    seg.forEach((b,k)=>b.setAttribute("aria-pressed",String(k===i)));
    const S=SEAS[i];
    if(titleEl)titleEl.textContent=`Tall de la capa d'aire del Sàhara · ${S.n}`;
    if(subEl)subEl.textContent=`${DESC[i]} · Surt el ${S.out} % anual · Amazònia: ${S.amz}`;
    if(V.reduced){ sv=i; if(redrawStatic)redrawStatic(); }
  }
  seg.forEach((b,k)=>b.addEventListener("click",()=>{ playing=false; if(playB)playB.textContent="Reprodueix l'any"; setSeason(k); }));
  if(playB)playB.addEventListener("click",()=>{ playing=!playing; playB.textContent=playing?"Pausa":"Reprodueix l'any"; pt=0; });
  setSeason(0);

  const rnd=V.rng(202);
  const L0=-92, L1=22;

  V.mount(wrap,(el,W)=>{
    if(activeLoop){ activeLoop.stop(); activeLoop=null; }
    const mob=isMob(W);
    const H=mob?290:360;
    const mg={l:mob?34:42,r:14,t:20,b:30};

    d3.select(el).selectAll("canvas.ibv,svg.ibv").remove();
    const {c:cv,ctx}=V.canvas(el,W,H,"Tall vertical de l'atmosfera des del Sàhara fins a Amèrica. La capa d'aire del Sàhara va de 0 a 3 km a l'hivern i d'1 a 5 km a l'estiu a la costa africana, sobre aire marí més fresc.");
    const svg=d3.select(el).append("svg").attr("class","ibv ibv-ov").attr("width",W).attr("height",H)
      .attr("viewBox",`0 0 ${W} ${H}`).style("font-family",V.SANS).attr("aria-hidden","true");
    const tp=V.tip(el);

    const x=d3.scaleLinear([L0,L1],[mg.l,W-mg.r]);
    const y=d3.scaleLinear([0,7],[H-mg.b,mg.t]);
    const y0=y(0);

    /* Eixos recessius (IBV.gridY + IBV.axisX) */
    const gAxes=svg.append("g").attr("pointer-events","none");
    V.gridY(gAxes,y,mg.l,W-mg.r,[0,2,4,6],f0,{zero:0,unit:" km"});
    const xTicks=mob?[-80,-40,0,20]:[-80,-60,-40,-20,0,20];
    V.axisX(gAxes,x,y0,xTicks,v=>v===0?"0°":v>0?`${v}° E`:`${-v}° O`,{tick:false});

    const gAnn=svg.append("g").attr("pointer-events","none");
    const gHl=svg.append("g").attr("pointer-events","none");
    const hit=svg.append("rect").attr("x",mg.l).attr("y",mg.t).attr("width",W-mg.l-mg.r).attr("height",H-mg.t-mg.b).attr("fill","transparent").attr("class","ibv-hit");

    /* Partícules lentes (micro-traços de 8 punts, ~25 s per creuar) */
    const KT=8, N=mob?160:320;
    const parts=[];
    function sp(p,pre){
      p.lon=pre?L0+rnd()*(L1-L0):-8+rnd()*28;
      p.f=rnd(); p.fall=false; p.z=0; p.sp=.8+rnd()*.4;
      p.dl=-17-(rnd()<.7?rnd()*60:60+rnd()*50);
      p.tr=[]; p.shade=rnd();
    }
    for(let i=0;i<N;i++){ const p={}; sp(p,true); parts.push(p); }

    let lastStateKey="";
    function drawAnns(w,de,rainA){
      const key=`${Math.round(w*20)}:${Math.round(de*20)}`;
      if(key===lastStateKey)return;
      lastStateKey=key;
      gAnn.selectAll("*").remove();
      const lx=mob?-16:-32;
      const ty=y(topAt(lx,w));
      V.lines(gAnn,x(lx),Math.max(mg.t+12,ty-18),[["Capa d'aire del Sàhara",true,C.ink],["calenta, seca i amb pols",false,C.ink2]],{anchor:"middle",halo:3,size:mob?11.5:12.5});
      V.t(gAnn,x(8),y0-10,"Sàhara",{anchor:"middle",weight:600,size:mob?11.5:12.5,fill:C.ink,halo:3});
      if(!mob)V.t(gAnn,x(-17),y0+22,"costa africana",{anchor:"middle",size:11,fill:C.muted,italic:true});
      if(w>.35){
        V.t(gAnn,x(-32),y(Math.max(.35,botAt(-32,w)*.45)),"aire del mar, fresc i humit",{anchor:"middle",size:mob?11:12,fill:C.blauFosc,italic:true,halo:3})
          .style("opacity",sm((w-.35)/.3));
      }
      if(rainA>.25){
        V.t(gAnn,x(-70),y0-12,"Amazònia",{anchor:"middle",weight:600,size:mob?11.5:12.5,fill:C.ink,halo:3}).style("opacity",rainA);
        V.t(gAnn,x(-70),y(4.2),"la pluja arrossega la pols",{anchor:"middle",size:mob?11:12,fill:C.blauFosc,italic:true,halo:3}).style("opacity",rainA);
      }
      if(de>.25){
        V.t(gAnn,x(-65),y0-14,"Antilles",{anchor:"middle",size:11.5,fill:C.ink2,halo:3}).style("opacity",de);
        if(!mob)V.t(gAnn,x(-83),y(2.8),"Florida i golf de Mèxic",{anchor:"middle",size:11.5,fill:C.ink2,halo:3}).style("opacity",de);
      }
      V.t(gAnn,x(-35),y(6.35),"← la pols viatja cap a l'oest",{anchor:"middle",size:mob?11.5:12,fill:C.muted,italic:true,serif:true});
    }

    function paint(dt,tSec){
      const dpr=Math.min(2,window.devicePixelRatio||1);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      const g=geo(sv), w=g.w, de=g.d, rainA=1-de;

      /* Capa marina fresca i humida (blau suau translúcid, sense contorn negre) */
      ctx.beginPath();
      for(let lon=L0;lon<=-17;lon+=1)ctx.lineTo(x(lon),y(botAt(lon,w)));
      ctx.lineTo(x(-17),y0); ctx.lineTo(x(L0),y0); ctx.closePath();
      ctx.fillStyle=V.alpha(C.blau,.12); ctx.fill();

      /* Capa d'aire del Sàhara (degradat càlid vermell→groc, sense contorn negre) */
      ctx.beginPath();
      for(let lon=L0;lon<=L1;lon+=1)ctx.lineTo(x(lon),y(topAt(lon,w)));
      for(let lon=L1;lon>=L0;lon-=1)ctx.lineTo(x(lon),y(botAt(lon,w)));
      ctx.closePath();
      const gr=ctx.createLinearGradient(0,y(5.5),0,y0);
      gr.addColorStop(0,V.alpha(C.vermell,.18));
      gr.addColorStop(.65,V.alpha(C.vermell,.12));
      gr.addColorStop(1,V.alpha(C.groc,.12));
      ctx.fillStyle=gr; ctx.fill();

      /* Isolínia superior fina en vermell */
      ctx.strokeStyle=V.alpha(C.vermell,.55); ctx.lineWidth=1;
      ctx.beginPath();
      for(let lon=L0;lon<=L1;lon+=1){ const px=x(lon), py=y(topAt(lon,w)); if(lon===L0)ctx.moveTo(px,py); else ctx.lineTo(px,py); }
      ctx.stroke();

      /* Base discontínua quan s'eleva sobre l'aire marí */
      if(w>.2){
        ctx.save(); ctx.globalAlpha=sm((w-.2)/.4); ctx.setLineDash([3,3]); ctx.strokeStyle=C.blau; ctx.lineWidth=.9;
        ctx.beginPath();
        for(let lon=L0;lon<=-12;lon+=1){ const px=x(lon), py=y(botAt(lon,w)); if(lon===L0)ctx.moveTo(px,py); else ctx.lineTo(px,py); }
        ctx.stroke(); ctx.restore();
      }

      /* Pluja fina sobre l'Amazònia (hivern i primavera, blau translúcid) */
      if(rainA>.02){
        ctx.save(); ctx.globalAlpha=rainA;
        ctx.strokeStyle=V.alpha(C.blau,.42); ctx.lineWidth=.85;
        const off=V.reduced?0:(tSec*32)%16;
        ctx.beginPath();
        for(let rx=x(-86);rx<x(-50);rx+=7){
          for(let ry=y(3.1)+off-16;ry<y0-4;ry+=16){
            ctx.moveTo(rx,ry); ctx.lineTo(rx-1.5,ry+6.5);
          }
        }
        ctx.stroke(); ctx.restore();
      }

      /* Perfil de terra: Sàhara (land + toc grocClar) i Amazònia (land + ratlles fines ink2, zero verd) */
      ctx.fillStyle=C.land;
      ctx.beginPath(); ctx.moveTo(x(-17),y0);
      for(let lon=-17;lon<=L1;lon+=1)ctx.lineTo(x(lon),y(.14+.22*sm((lon+17)/12)+.04*Math.sin(lon*.7)));
      ctx.lineTo(x(L1),y0); ctx.closePath(); ctx.fill();
      ctx.fillStyle=V.alpha(C.grocClar,.5); ctx.fill();

      if(rainA>.02){
        ctx.save(); ctx.globalAlpha=rainA;
        ctx.fillStyle=C.land;
        ctx.beginPath(); ctx.moveTo(x(-50),y0); ctx.lineTo(x(-50),y(.08)); ctx.lineTo(x(L0),y(.12)); ctx.lineTo(x(L0),y0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle=V.alpha(C.ink2,.45); ctx.lineWidth=.9;
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

      /* Línia del mar en blau suau */
      ctx.strokeStyle=V.alpha(C.blau,.55); ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(x(rainA>.5?-50:L0),y0); ctx.lineTo(x(-17),y0); ctx.stroke();

      /* Micro-traços lents de pols (~25 s per travessar) */
      const spd=4.4;
      ctx.lineCap="round";
      for(let i=0;i<parts.length;i++){
        const p=parts[i], tp2=topAt(p.lon,w), bt2=botAt(p.lon,w);
        if(dt>0){
          if(!p.fall){
            p.lon-=spd*p.sp*dt;
            p.z=bt2+(tp2-bt2)*p.f;
            p.f=Math.max(0,p.f-dt*.008);
            if(p.lon<p.dl||(rainA>.5&&p.lon<-50&&rnd()<dt*.7))p.fall=true;
          }else{
            p.lon-=spd*p.sp*dt*.35;
            p.z-=dt*(rainA>.5&&p.lon<-50?1.1:.28);
          }
          if(p.z<=0||p.lon<L0){ sp(p,false); continue; }
          p.tr.push([x(p.lon),y(p.z)]);
          if(p.tr.length>KT)p.tr.shift();
        }
        if(p.tr.length>1){
          const col=p.shade>.6?C.vermellFosc:C.vermell;
          for(let k=1;k<p.tr.length;k++){
            ctx.strokeStyle=V.alpha(col,(k/p.tr.length)*.62);
            ctx.lineWidth=p.shade>.6?1.2:.9;
            ctx.beginPath(); ctx.moveTo(p.tr[k-1][0],p.tr[k-1][1]); ctx.lineTo(p.tr[k][0],p.tr[k][1]); ctx.stroke();
          }
        }
      }
      drawAnns(w,de,rainA);
    }

    for(let i=0;i<14;i++)paint(.15,0);
    redrawStatic=()=>{ lastStateKey=""; paint(0,0); };

    /* Hover interactiu al llarg de la longitud */
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

    /* Entrada suau */
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
   3. EL VIATGE A TRAVÉS DE L'ATLÀNTIC (IB-28 + IB-25) · Scrolly
   Micro-traços molt lents (~26 s), geografia silenciosa #ECEBE8 sobre paper,
   conca amazònica en blau discontinu, hover amb meridians i regions.
   ===================================================================== */
function initAtlantic(){
  const wrap=document.getElementById("mmap");
  if(!wrap)return;
  const lgEl=document.getElementById("mLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.vermell,t:"Pols a l'aire",kind:"line",w:2},
      {c:C.vermellFosc,t:"Pols que cau",kind:"dot",a:.4},
      {c:C.blau,t:"Conca amazònica (Yu et al.)",kind:"line",w:1.3,dash:"4 3"}
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
    {lon:-15,lat:30,lines:[["182 Mt/any",true,C.vermell],["surten d'Àfrica"]],dx:8,dy:0,steps:[0,1]},
    {lon:-35,lat:30,lines:[["132 Mt/any",true],["a mig oceà"]],dx:8,dy:0,steps:[1]},
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
    const maxH=mob?Math.min(window.innerHeight*.36,280):Math.min(Math.max(280,window.innerHeight-260),500);
    const H=Math.round(Math.min(W*(mob?.72:.60),maxH));

    d3.select(el).selectAll("canvas.ibv,svg.ibv").remove();
    const {c:cv,ctx}=V.canvas(el,W,H,"Mapa de l'Atlàntic tropical amb el flux de pols del Sàhara cap a l'Amazònia a l'hivern i primavera, cap al Carib a l'estiu i cap a Europa alguns dies. Esquema.");
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
      baseCtx.strokeStyle=C.grid; baseCtx.lineWidth=.5;
      baseCtx.beginPath(); gp(d3.geoGraticule().step([15,15])()); baseCtx.stroke();
      baseCtx.fillStyle=C.land;
      baseCtx.beginPath(); gp(WORLD.land); baseCtx.fill();
      baseCtx.strokeStyle="#FFFFFF"; baseCtx.lineWidth=.7;
      baseCtx.beginPath(); gp(WORLD.borders); baseCtx.stroke();
      const eq0=P(-180,0), eq1=P(180,0);
      baseCtx.save(); baseCtx.setLineDash([2,4]); baseCtx.strokeStyle=C.muted; baseCtx.globalAlpha=.45; baseCtx.lineWidth=.65;
      baseCtx.beginPath(); baseCtx.moveTo(eq0[0],eq0[1]); baseCtx.lineTo(eq1[0],eq1[1]); baseCtx.stroke(); baseCtx.restore();
      baseDirty=false;
    }

    const KT=mob?7:10, NMAX=mob?520:1100;
    let parts=[], eu=[], deps=[], acc=0, accE=0;
    function spawnP(p){
      const w=summer(st.m);
      let tot=0; for(let i=0;i<SRC.length;i++)tot+=lerp(SRC[i][2],SRC[i][3],w);
      let r=rnd()*tot, idx=0;
      for(let i=0;i<SRC.length;i++){ r-=lerp(SRC[i][2],SRC[i][3],w); if(r<=0){ idx=i; break; } }
      const s=SRC[idx];
      p.src=s; p.lon=s[0]+(rnd()*4.4-2.2); p.lat=s[1]+(rnd()*3.6-1.8);
      p.q=tri()*.92; p.ph=rnd()*Math.PI*2; p.dl=deathLon(); p.sp=.85+rnd()*.3; p.tr=[]; p.shade=rnd();
    }

    function sim(dt,moving,recordTrails){
      const w=summer(st.m);
      const rate=fluxM(st.m)/(46/3)*(NMAX/14);
      acc+=rate*dt;
      while(acc>=1&&parts.length<NMAX){ acc-=1; const np={}; spawnP(np); parts.push(np); }
      if(acc>4)acc=0;

      /* Velocitat contemplativa (~26 s per travessar l'Atlàntic) */
      const spd=3.2*clamp((view[1]-view[0])/95,.7,1.25);
      const c17=lerp(pw(nWC,17),pw(nSC,17),w), h17=lerp(pw(nWH,17),pw(nSH,17),w);
      const alive=[];
      for(let i=0;i<parts.length;i++){
        const p=parts[i];
        const ex=c17+p.q*h17;
        let tl;
        if(p.lon>-17){
          const s=p.src, wp=s[4], ww=1-w;
          if(wp&&ww>.35&&p.lon>wp[0]){
            const tt=(s[0]-p.lon)/(s[0]-wp[0]);
            tl=lerp(s[1],wp[1]+p.q*2,sm(tt));
          }else{
            const a0=wp&&ww>.35?wp[0]:s[0], b0=wp&&ww>.35?wp[1]:s[1];
            tl=lerp(b0,ex,sm((a0-p.lon)/(a0+17)));
          }
          p.lon-=spd*.82*p.sp*dt;
        }else{
          tl=latAt(p.lon,w,p.q)+.65*Math.sin(p.ph+p.lon*.12);
          p.lon-=spd*p.sp*dt;
        }
        p.lat+=(tl-p.lat)*Math.min(1,dt*1.8);
        let dead=false, depo=true;
        if(p.lon<p.dl)dead=true;
        if(!dead&&p.lon<-49&&p.lat<8.5&&p.lat>-14&&rnd()<dt*.65)dead=true;
        if(p.lon<-104||p.lat>47){ dead=true; depo=false; }
        if(dead){
          if(depo&&recordTrails){ deps.push({lon:p.lon,lat:p.lat,a:1}); if(deps.length>220)deps.shift(); }
          continue;
        }
        if(moving)p.tr=[];
        if(recordTrails){
          const q=P(p.lon,p.lat);
          p.tr.push(q); if(p.tr.length>KT)p.tr.shift();
        }
        alive.push(p);
      }
      parts=alive;

      /* Branca cap a Europa */
      if(st.eu>.03){
        accE+=st.eu*dt*(mob?22:48);
        while(accE>=1&&eu.length<160){ accE-=1; eu.push({s:rnd()*.8,q:tri(),lim:EU.total*(.5+rnd()*.5),sp:.8+rnd()*.4,tr:[]}); }
      }
      const keep=[];
      for(let i=0;i<eu.length;i++){
        const e=eu[i];
        e.s+=dt*spd*.48*e.sp;
        if(e.s>e.lim)continue;
        if(moving)e.tr=[];
        if(recordTrails){
          const qe=EU.at(e.s,e.q);
          e.tr.push(P(qe.lon,qe.lat)); if(e.tr.length>KT)e.tr.shift();
        }
        keep.push(e);
      }
      eu=keep;
      for(let i=deps.length-1;i>=0;i--){ deps[i].a-=dt*.12; if(deps[i].a<=0)deps.splice(i,1); }
    }

    function renderSvgLayers(){
      gGeo.selectAll("*").remove();
      gAnn.selectAll("*").remove();
      /* Conca amazònica (rectangle Yu et al. 2015 en blau discontinu) */
      if(st.amz>.02){
        const pts=AMZ.map(q=>P(q[0],q[1]));
        gGeo.append("path").attr("d","M"+pts.map(p=>p.join(",")).join("L")+"Z")
          .attr("fill",V.alpha(C.blau,.06*st.amz)).attr("stroke",C.blau)
          .attr("stroke-width",1.1).attr("stroke-dasharray","4 3").style("opacity",st.amz);
      }
      /* Meridians 15° O, 35° O, 75° O */
      [[-15,st.l0,C.vermell],[-35,st.l1,C.ink2],[-75,st.l2,C.blau]].forEach(([lo,a,col])=>{
        if(a<.02)return;
        const p0=P(lo,-16), p1=P(lo,33);
        gGeo.append("line").attr("x1",p0[0]).attr("x2",p1[0]).attr("y1",p0[1]).attr("y2",p1[1])
          .attr("stroke",col).attr("stroke-width",1).attr("stroke-dasharray","3 3").style("opacity",a*.85);
      });
      /* Rètol discret de l'oceà */
      const oa=P(-40,24);
      if(oa[0]>44&&oa[0]<W-44&&oa[1]>14&&oa[1]<H-14){
        V.t(gAnn,oa[0],oa[1],"Oceà Atlàntic",{anchor:"middle",italic:true,serif:true,size:mob?11.5:13,fill:C.muted});
      }
      const K=clamp(W/880,.65,1.1);
      ANNS.forEach(a=>{
        if(a.steps.indexOf(step)<0)return;
        if(mob&&a.hm)return;
        const p=P(a.lon,a.lat);
        if(p[0]<-10||p[0]>W+10||p[1]<-10||p[1]>H+10)return;
        const tx2=clamp(p[0]+(a.dx||0)*K,a.anchor==="end"?84:10,a.anchor==="end"?W-10:W-96);
        const ty2=clamp(p[1]+(a.dy||0)*K,16,H-18);
        if(a.lead){
          V.note(gAnn,{x:p[0],y:p[1],tx:tx2,ty:ty2,lines:a.lines,kind:"elbow",anchor:a.anchor,dot:true,size:mob?11.5:12.5,italic:a.italic});
        }else{
          V.lines(gAnn,tx2,ty2,a.lines,{anchor:a.anchor||"start",halo:3,size:mob?11.5:12.5,italic:a.italic,fill:a.italic?C.ink2:C.ink});
        }
      });
    }

    function paint(){
      if(baseDirty)drawBase();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.drawImage(baseCv,0,0);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      /* Deposició translúcida multiply (IB-25) */
      if(deps.length){
        ctx.save(); ctx.globalCompositeOperation="multiply";
        for(let i=0;i<deps.length;i++){
          const d=deps[i], q=P(d.lon,d.lat);
          ctx.fillStyle=V.alpha(C.vermellFosc,.24*d.a);
          ctx.beginPath(); ctx.arc(q[0],q[1],2.4,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      /* Micro-traços IB-28 de pols sobre l'Atlàntic */
      ctx.save(); ctx.lineCap="round";
      for(let i=0;i<parts.length;i++){
        const p=parts[i], tr=p.tr; if(tr.length<2)continue;
        const col=p.shade>.62?C.vermellFosc:C.vermell;
        for(let k=1;k<tr.length;k++){
          ctx.strokeStyle=V.alpha(col,(k/tr.length)*.58);
          ctx.lineWidth=p.shade>.62?1.25:.95;
          ctx.beginPath(); ctx.moveTo(tr[k-1][0],tr[k-1][1]); ctx.lineTo(tr[k][0],tr[k][1]); ctx.stroke();
        }
      }
      for(let i=0;i<eu.length;i++){
        const tr=eu[i].tr; if(tr.length<2)continue;
        for(let k=1;k<tr.length;k++){
          ctx.strokeStyle=V.alpha(C.vermell,(k/tr.length)*.55);
          ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(tr[k-1][0],tr[k-1][1]); ctx.lineTo(tr[k][0],tr[k][1]); ctx.stroke();
        }
      }
      ctx.restore();
    }

    /* Pre-escalfament del camp */
    for(let i=0;i<160;i++)sim(.12,false,i>146);
    renderSvgLayers();
    paint();

    drawStatic=()=>{
      view=tgt.slice(); fit();
      parts=[]; eu=[]; deps=[];
      for(let i=0;i<160;i++)sim(.12,false,i>146);
      renderSvgLayers(); paint();
    };

    /* Hover sobre l'Atlàntic */
    V.hover(hit.node(),(ev,[px,py])=>{
      const [lon,lat]=inv(px,py);
      let near=null, best=Infinity;
      POIS.forEach(q=>{
        const qp=P(q.lon,q.lat), dist=Math.hypot(qp[0]-px,qp[1]-py);
        if(dist<best){ best=dist; near=q; }
      });
      gHl.selectAll("*").remove();
      gHl.append("circle").attr("cx",px).attr("cy",py).attr("r",4.5).attr("fill",C.vermell).attr("stroke",C.ink).attr("stroke-width",1.4);
      gAnn.style("opacity",.52);
      if(near&&best<(mob?52:76)){
        tp.show(`<b>${near.n}</b><br>${near.d}`);
      }else{
        const S=SEAS[seasonOf(st.m)];
        tp.show(`<b>${MES[Math.floor(((st.m%12)+12)%12)]} (${S.n})</b><br>${llFmt(lon,lat)} · Surt el ${S.out} % anual`);
      }
    },()=>{
      gHl.selectAll("*").remove();
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
   4. QUANT SÓN 28 MILIONS DE TONES? (IB-11 · Reixa d'unitats orgànica)
   364 cercles translúcids multiply (1 cercle = 20.000 camions = 0,5 Mt).
   Hover amb IBV.focus i lectura acumulada al dock.
   ===================================================================== */
function initTrucks(){
  const wrap=document.getElementById("trucksWrap");
  if(!wrap)return;
  const lgEl=document.getElementById("tLg");
  if(lgEl&&!lgEl.childElementCount){
    V.legendCat(lgEl,[
      {c:C.vermell,t:"Pols en aquesta etapa (1 cercle = 20.000 camions)",kind:"dot",a:.72},
      {c:C.blauClar,t:"Cau a l'oceà abans de 35° O",kind:"dot",a:.72},
      {c:C.ghost,t:"Context: 182 Mt que surten d'Àfrica",kind:"dot",a:.5}
    ]);
  }

  const V_STAGES=[
    {t:182e6,lab:"Surt d'Àfrica cada any (15° O)",col:C.vermell},
    {t:132e6,lab:"Arriba a mig oceà (35° O) · 50 Mt ja han caigut al mar",col:C.vermell,ocean:true},
    {t:27.7e6,lab:"Cau a l'Amazònia, abans d'arribar als 75° O",col:C.vermell},
    {t:43e6,lab:"Una altra part arriba al Carib (75° O), sense la que cau a l'Amazònia",col:C.blau},
    {t:22000,lab:"Fòsfor que cau a l'Amazònia: una 23a part d'un sol cercle",col:C.vermellFosc,p:true}
  ];
  const PER=500000, N=Math.ceil(182e6/PER); // 364 cercles
  const titleEl=document.getElementById("tTitle"), outEl=document.getElementById("tOut"), playB=document.getElementById("tPlay");
  const segBtns=[...document.querySelectorAll("#tSeg button")];
  let cur=0, timer=null, updateStage=null;

  function updateHeader(i){
    const v=V_STAGES[i], trucks=v.t/25, perDay=trucks/365.25;
    segBtns.forEach((b,k)=>b.setAttribute("aria-pressed",String(k===i)));
    if(titleEl)titleEl.textContent=v.p?`${f0(v.t)} tones de fòsfor l'any`:`${fmtNum(v.t/1e6,v.t<1e8&&v.t%1e6?1:0)} milions de tones l'any`;
    if(outEl)outEl.textContent=v.p
      ?`${v.lab} · 880 camions de 25 t (~2 o 3 al dia)`
      :`${v.lab} · ${f1(trucks/1e6)} milions de camions de 25 t (~${f0(Math.round(perDay/100)*100)} al dia)`;
  }

  function stopT(){ if(timer){ clearInterval(timer); timer=null; if(playB)playB.textContent="Reprodueix el viatge"; } }
  segBtns.forEach(b=>b.addEventListener("click",()=>{ stopT(); cur=+b.dataset.i; updateHeader(cur); if(updateStage)updateStage(cur,false); }));
  if(playB)playB.addEventListener("click",()=>{
    if(timer){ stopT(); return; }
    cur=0; updateHeader(0); if(updateStage)updateStage(0,false);
    playB.textContent="Pausa";
    timer=setInterval(()=>{ cur++; if(cur>=V_STAGES.length){ stopT(); return; } updateHeader(cur); if(updateStage)updateStage(cur,false); },2100);
  });
  updateHeader(0);

  V.mount(wrap,(el,W)=>{
    const mob=isMob(W);
    const cols=W>=720?26:W>=480?20:14;
    const rows=Math.ceil(N/cols);
    const cell=Math.min(28,W/cols);
    const r=cell*.36;
    const gridW=cols*cell, x0=(W-gridW)/2;
    const gridH=rows*cell;
    const calloutH=64;
    const H=Math.round(gridH+calloutH+12);

    const svg=V.svg(el,W,H,"Reixa de 364 cercles translúcids on cada cercle equival a 20.000 camions de 25 tones (0,5 Mt). Permet comparar els 182 Mt que surten d'Àfrica amb els 132 a mig oceà, els 28 que cauen a l'Amazònia, els 43 al Carib i les 22.000 t de fòsfor (880 camions, 1/23 d'un cercle).");
    const tp=V.tip(el);

    const data=d3.range(N).map(i=>({
      i, cx:x0+(i%cols+.5)*cell, cy:(Math.floor(i/cols)+.5)*cell
    }));

    const gDots=svg.append("g");
    const dots=gDots.selectAll("circle").data(data).join("circle")
      .attr("cx",d=>d.cx).attr("cy",d=>d.cy).attr("r",0)
      .style("mix-blend-mode","multiply").style("cursor","pointer");

    const gCall=svg.append("g").attr("pointer-events","none");

    function applyStage(i,instant){
      const v=V_STAGES[i], exact=v.t/PER, full=Math.floor(exact), frac=exact-full;
      const dur=instant||V.reduced?0:520;
      dots.interrupt().transition().duration(dur)
        .delay(d=>instant||V.reduced?0:Math.min(340,d.i*.75))
        .attr("r",d=>d.i<full?r:d.i===full&&frac>.02?Math.max(2.6,r*Math.sqrt(frac)):r*.82)
        .attr("fill",d=>{
          if(d.i<full||(d.i===full&&frac>.02))return v.col;
          if(v.ocean)return C.blauClar;
          return C.ghost;
        })
        .attr("fill-opacity",d=>{
          if(d.i<full||(d.i===full&&frac>.02))return .74;
          if(v.ocean)return .48;
          return .34;
        });

      gCall.selectAll("*").remove();
      if(v.p){
        /* Escala proporcional neta per al fòsfor (1/23 d'un cercle), sense lupa flotant */
        const by=gridH+20, bw=Math.min(280,W-24), bx=x0, bh=14;
        V.note(gCall,{x:data[0].cx,y:data[0].cy+r+2,tx:bx+bw+12,ty:by+bh/2,kind:"elbow",anchor:"start",
          lines:mob?[["880 camions",true,C.vermellFosc],["1/23 d'un cercle"]]:[["Fòsfor: 880 camions",true,C.vermellFosc],["una 23a part d'un sol cercle (22.000 t)"]],
          size:mob?11.5:12.5,dot:false});
        gCall.append("rect").attr("x",bx).attr("y",by).attr("width",bw).attr("height",bh).attr("rx",2)
          .attr("fill",V.alpha(C.grocClar,.65)).attr("stroke",C.hair).attr("stroke-width",.8);
        gCall.append("rect").attr("x",bx).attr("y",by).attr("width",Math.max(4,bw/22.7)).attr("height",bh).attr("rx",1.5)
          .attr("fill",C.vermellFosc);
        for(let s=1;s<23;s++){
          const sx=bx+bw*s/22.7;
          gCall.append("line").attr("x1",sx).attr("x2",sx).attr("y1",by).attr("y2",by+bh).attr("stroke","#FFFFFF").attr("stroke-width",.7);
        }
        V.t(gCall,bx,by+bh+15,"1 cercle = 20.000 camions (500.000 t)",{size:11.5,fill:C.muted});
      }else{
        const activeCount=Math.ceil(exact);
        const pct=Math.round(v.t/182e6*100);
        V.t(gCall,x0,gridH+24,`${f0(activeCount)} de 364 cercles (${pct} % del flux que surt d'Àfrica)`,{size:12,fill:C.ink2});
      }
    }

    updateStage=applyStage;

    /* Hover sobre els cercles (IBV.hover + IBV.focus + dock) */
    const delaunay=d3.Delaunay.from(data,d=>d.cx,d=>d.cy);
    V.hover(svg.node(),(ev,[mx,my])=>{
      if(my>gridH+6){ dots.attr("stroke",null); V.focus(dots,null); tp.hide(); return; }
      const idx=delaunay.find(mx,my);
      const d=data[idx];
      if(!d||Math.hypot(d.cx-mx,d.cy-my)>cell*1.2)return;
      V.focus(dots,x=>x.i<=d.i,{dim:.48});
      dots.attr("stroke",x=>x.i===d.i?C.ink:null).attr("stroke-width",x=>x.i===d.i?1.4:0);
      const mt=(d.i+1)*.5, trucks=(d.i+1)*20000;
      tp.show(`<b>Cercle ${d.i+1} de ${N}</b><br>${f1(mt)} milions de tones acumulades (${f0(trucks)} camions de 25 t)`);
    },()=>{
      dots.attr("stroke",null);
      V.focus(dots,null);
      tp.hide();
    });

    V.onView(el,inst=>applyStage(cur,inst));
  });
}

/* =====================================================================
   5. BALANÇ DE FÒSFOR DE L'AMAZÒNIA (IB-38 + IB-10)
   A dalt: filera de cercles translúcids multiply per les 7 estimacions.
   A baix: escala amb llindar de pèrdues pels rius (8–40 g/ha/any) i context.
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
  let updateVal=null;

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
    const rowH=mob?34:26;
    const top1=26, h1=top1+EST.length*rowH+26;
    const top2=h1+28;
    const balH=mob?198:162;
    const H=top2+balH+24;

    const svg=V.svg(el,W,H,"Balanç de fòsfor de l'Amazònia. A dalt, les 7 estimacions publicades de pols africana (de 9 a 50 milions de tones l'any). A baix, comparació del fòsfor aportat per la pols amb les pèrdues pels rius (8–40 g/ha/any), la deposició total de l'aire (161–300 g/ha) i el reciclatge de la selva (1.400–4.100 g/ha).");
    const tp=V.tip(el);

    /* Part 1: IB-38 Estimacions publicades */
    const x=d3.scaleLinear([0,55],[lw+10,W-28]);
    const gE=svg.append("g");
    V.t(gE,0,14,"Estimacions publicades de pols sobre l'Amazònia (Mt/any)",{size:12.5,weight:700,fill:C.ink});
    V.axisX(gE,x,top1+EST.length*rowH,mob?[0,15,30,45]:[0,10,20,30,40,50],f0,{tick:false,grid:top1});

    const rows=gE.selectAll("g.est-row").data(EST).join("g")
      .attr("class","est-row hit").attr("tabindex",0).attr("role","button")
      .attr("aria-label",d=>`${d.n}: ${fmtNum(d.v,d.v%1?1:0)} milions de tones`)
      .attr("transform",(d,i)=>`translate(0,${top1+i*rowH})`);

    rows.append("rect").attr("x",0).attr("y",0).attr("width",W).attr("height",rowH).attr("fill","transparent");
    const cy=mob?rowH*.72:rowH*.52;
    /* Fil horitzontal ultra-fi (IB-38) */
    rows.append("line").attr("x1",x(0)).attr("x2",x(55)).attr("y1",cy).attr("y2",cy).attr("stroke",C.grid).attr("stroke-width",.55);

    rows.append("text").attr("x",mob?x(0):0).attr("y",mob?11:rowH*.62)
      .attr("font-size",mob?11.5:12.5).attr("fill",d=>d.main?C.ink:C.ink2).attr("font-weight",d=>d.main?700:400)
      .text(d=>d.n);

    /* Interval d'incertesa translúcid */
    rows.filter(d=>d.lo!=null).append("line")
      .attr("x1",d=>x(d.lo)).attr("x2",d=>x(d.hi)).attr("y1",cy).attr("y2",cy)
      .attr("stroke",d=>d.main?C.vermell:C.ink2).attr("stroke-width",4).attr("stroke-linecap","round").attr("opacity",.22);

    /* Cercles translúcids multiply + punt central (IB-38 / IB-25) */
    const circs=rows.append("circle")
      .attr("cx",d=>x(d.v)).attr("cy",cy).attr("r",0)
      .attr("fill",d=>d.main?C.vermell:C.vermellClar).attr("fill-opacity",d=>d.main?.52:.45)
      .style("mix-blend-mode","multiply");
    rows.append("circle").attr("cx",d=>x(d.v)).attr("cy",cy).attr("r",2.2).attr("fill",d=>d.main?C.vermellFosc:C.ink2);
    rows.append("text").attr("x",d=>x(d.v)+(d.main?13:10)).attr("y",cy+4).attr("font-size",11.5)
      .attr("font-weight",d=>d.main?700:400).attr("fill",C.ink).style("font-variant-numeric","tabular-nums")
      .text(d=>fmtNum(d.v,d.v%1?1:0));

    const curLine=gE.append("line").attr("y1",top1-2).attr("y2",top1+EST.length*rowH)
      .attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-dasharray","3 2").attr("pointer-events","none");

    rows.on("click",(e,d)=>{ if(rng)rng.value=d.v; setVal(d.v,false); })
      .on("keydown",(e,d)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); if(rng)rng.value=d.v; setVal(d.v,false); } })
      .on("pointerenter",(e,d)=>{
        V.focus(rows,r=>r===d,{dim:.48});
        const pVal=d.v*PF;
        const intv=d.lo!=null?` (interval ${d.lo}–${d.hi} Mt)`:"";
        tp.show(`<b>${d.n}</b> (${d.d})<br>${fmtNum(d.v,d.v%1?1:0)} Mt/any${intv} → ≈ ${f1(pVal)} g P/ha`);
      })
      .on("pointerleave",()=>{ V.focus(rows,null); tp.hide(); });

    /* Part 2: IB-10 Escala amb llindar de fòsfor */
    const xb=d3.scaleLinear([0,60],[mob?10:lw+10,W-(mob?14:86)]);
    const gB=svg.append("g");
    V.t(gB,0,top2,"Balanç de fòsfor (grams per hectàrea i any)",{size:12.5,weight:700,fill:C.ink});

    const bt=top2+18, dy=mob?44:34;
    const r1=bt+12, r2=r1+dy, r3=r2+dy, r4=r3+dy, bh=12;
    V.axisX(gB,xb,bt+balH-22,[0,10,20,30,40,50,60],f0,{tick:false,grid:bt});

    /* Zona de llindar: pèrdues pels rius (8–40 g/ha/any) en blau translúcid */
    gB.append("rect").attr("x",xb(8)).attr("y",bt).attr("width",xb(40)-xb(8)).attr("height",balH-22)
      .attr("fill",V.alpha(C.blau,.10));
    [8,40].forEach(v=>{
      gB.append("line").attr("x1",xb(v)).attr("x2",xb(v)).attr("y1",bt).attr("y2",bt+balH-22)
        .attr("stroke",C.blau).attr("stroke-width",.9).attr("stroke-dasharray","2.5 2.5");
    });

    const rowLab=(yPos,txt,bold)=>V.t(gB,mob?xb(0):0,mob?yPos-6:yPos+bh*.8,txt,{size:mob?11.5:12.5,weight:bold?700:400,fill:bold?C.ink:C.ink2});
    rowLab(r1,"Entra amb la pols africana",true);
    rowLab(r2,"Surt pels rius (llindar)",false);
    rowLab(r3,"Cau de l'aire (totes les fonts)",false);
    rowLab(r4,"Recicla la selva (fulles)",false);

    /* Fila 1: entrada de pols (barra fina + cercle translúcid + triangle indicador) */
    const inBar=gB.append("rect").attr("x",xb(0)).attr("y",r1).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.vermell,.72));
    const inDot=gB.append("circle").attr("cy",r1+bh/2).attr("r",8).attr("fill",V.alpha(C.vermell,.35)).style("mix-blend-mode","multiply");
    const inTri=gB.append("path").attr("fill",C.ink);
    const inVal=gB.append("text").attr("y",r1+bh*.82).attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink).style("font-variant-numeric","tabular-nums");

    /* Fila 2: rang de pèrdues pels rius */
    gB.append("rect").attr("x",xb(8)).attr("y",r2).attr("width",xb(40)-xb(8)).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.blau,.34));
    V.t(gB,xb(40)+7,r2+bh*.82,"8–40 g/ha",{size:12,fill:C.blauFosc,weight:600});

    /* Fila 3: deposició total de l'aire (fora d'escala) */
    gB.append("rect").attr("x",xb(0)).attr("y",r3).attr("width",xb(60)-xb(0)).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.ink2,.14));
    V.t(gB,xb(60)-6,r3+bh*.78,mob?"pols, fum i espores":"fora d'escala: pols, fum i partícules biològiques",{anchor:"end",size:11,fill:C.ink2});
    V.t(gB,xb(60)+(mob?-2:7),r3+bh*.82+(mob?bh+4:0),"161–300 →",{anchor:mob?"end":"start",size:11.5,fill:C.ink2,weight:600});

    /* Fila 4: reciclatge de la selva (groc suau, etiqueta en tinta, mai verd!) */
    gB.append("rect").attr("x",xb(0)).attr("y",r4).attr("width",xb(60)-xb(0)).attr("height",bh).attr("rx",2).attr("fill",V.alpha(C.groc,.38));
    V.t(gB,xb(60)-6,r4+bh*.78,mob?"60–180× la pols":"fora d'escala: de 60 a 180 vegades la pols",{anchor:"end",size:11,fill:C.ink});
    V.t(gB,xb(60)+(mob?-2:7),r4+bh*.82+(mob?bh+4:0),"1.400–4.100 →",{anchor:mob?"end":"start",size:11.5,fill:C.ink,weight:600});

    function setVal(D,instant){
      const P=D*PF, px=xb(Math.min(P,60)), dur=instant||V.reduced?0:280;
      curLine.transition().duration(dur).attr("x1",x(D)).attr("x2",x(D));
      inBar.transition().duration(dur).attr("width",Math.max(0,px-xb(0)));
      inDot.transition().duration(dur).attr("cx",px);
      inTri.transition().duration(dur).attr("d",`M${px-4},${r1-6}L${px+4},${r1-6}L${px},${r1-1}Z`);
      inVal.transition().duration(dur).attr("x",Math.min(W-34,px+9)).text(fmtNum(P,P<10?1:0));
      updateVerdict(D);
    }
    updateVal=setVal;

    V.onView(el,inst=>{
      const d0=rng?+rng.value:27.7;
      circs.transition().duration(inst||V.reduced?0:650).delay((d,i)=>inst||V.reduced?0:i*55).ease(V.EASE)
        .attr("r",d=>d.main?10:7);
      setVal(d0,inst);
    });
  });

  if(rng)rng.addEventListener("input",()=>{ if(updateVal)updateVal(+rng.value,true); else updateVerdict(+rng.value); });
}

/* =====================================================================
   6. ANY A ANY (2007–2013) · IB-01
   Tres meridians amb franges d'incertesa translúcides, anotacions IBV.note,
   entrada animada IBV.onView i hover amb IBV.focus + dock.
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
      {c:C.ghost,t:"Interval LDF–UDF",kind:"dot",a:.45}
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
    const H=mob?310:370;
    const mg={l:mob?32:40,r:mob?14:156,t:26,b:30};

    const svg=V.svg(el,W,H,"Pols africana que creua l'Atlàntic cada any del 2007 al 2013 a tres meridians. A 15° O va de 133 a 227 Mt, a 35° O de 106 a 175 Mt i a 75° O de 28 a 51 Mt. El 2011 és l'any amb menys pols.");
    svg.attr("tabindex",0);
    const tp=V.tip(el);

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
      const b=gPlot.append("path").datum(d).attr("d",areaGen)
        .attr("fill",s.col).attr("fill-opacity",0).style("mix-blend-mode","multiply");
      bands.push(b);

      const p=gPlot.append("path").datum(d).attr("d",lineGen)
        .attr("fill","none").attr("stroke",s.col).attr("stroke-width",s.k==="15"?2.4:1.9);
      paths.push(p);

      const pts=gPlot.selectAll(null).data(d.map(r=>({r,s}))).join("circle")
        .attr("cx",o=>x(o.r[0])).attr("cy",o=>y(o.r[3])).attr("r",3.4)
        .attr("fill",C.paper).attr("stroke",s.col).attr("stroke-width",1.6).style("opacity",0);
      allDots.push(pts);

      const last=d[d.length-1];
      if(!mob){
        V.lines(gPlot,x(2013)+10,y(last[3])+2,[[s.n,true,s.k==="15"?C.vermell:C.ink],[`${s.s} · mitjana ${s.avg}`,false,C.muted]],{size:12});
      }else{
        V.t(gPlot,x(2013),y(last[2])-6,s.s,{anchor:"end",weight:700,size:11.5,fill:s.k==="15"?C.vermell:C.ink,halo:3});
      }
    });

    /* Anotacions IBV.note (P4) */
    const gAnn=svg.append("g").attr("pointer-events","none").style("opacity",0);
    V.note(gAnn,{x:x(2007),y:y(226.6),tx:x(2007)+(mob?22:32),ty:y(248),kind:"elbow",anchor:"start",
      lines:[["2007 · 227 Mt",true],["màxim del període"]],size:mob?11.5:12});
    V.note(gAnn,{x:x(2011),y:y(28.4),tx:x(2011),ty:y(6)+2,kind:"straight",anchor:"middle",
      lines:[["2011 · mínim a tots tres meridians",true]],size:mob?11.5:12});

    /* Capa de hover */
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

    /* Animació d'entrada (IBV.onView) */
    V.onView(el,inst=>{
      if(inst||V.reduced){
        bands.forEach(b=>b.attr("fill-opacity",.13));
        allDots.forEach(pts=>pts.style("opacity",1));
        gAnn.style("opacity",1);
      }else{
        paths.forEach((p,idx)=>{
          const len=p.node().getTotalLength();
          p.attr("stroke-dasharray",`${len} ${len}`).attr("stroke-dashoffset",len)
            .transition().duration(900).delay(idx*110).ease(V.EASE).attr("stroke-dashoffset",0)
            .on("end",function(){ d3.select(this).attr("stroke-dasharray",null); });
        });
        bands.forEach((b,idx)=>b.transition().duration(700).delay(350+idx*80).attr("fill-opacity",.13));
        allDots.forEach((pts,idx)=>pts.transition().duration(450).delay(500+idx*90).style("opacity",1));
        gAnn.transition().duration(500).delay(750).style("opacity",1);
      }
    });
  });
}

/* Temps de lectura (218 paraules/min + temps per figura, sense metodologia ni fonts) */
function readingTime(){
  const n=[...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")]
    .filter(e=>!e.closest(".fn"))
    .reduce((a,e)=>a+(e.textContent.match(/[\p{L}\p{N}·'’]+/gu)||[]).length,0);
  const figs=document.querySelectorAll(".page .plot").length;
  let sec=n/218*60;
  for(let i=0;i<figs;i++)sec+=Math.max(3,12-i);
  const el=document.getElementById("rt");
  if(el)el.textContent=Math.max(1,Math.round(sec/60))+" min de lectura";
}

function start(){
  initBodele();
  initSAL();
  initAtlantic();
  initTrucks();
  initBudget();
  initYears();
  readingTime();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);
else start();
})();
