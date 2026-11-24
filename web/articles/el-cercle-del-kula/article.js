/* «El cercle del kula» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-cercle   MAP-01 + MAP-12  El cercle del kula: comunitats, collarets i braçalets, l'onada del 1918
   V2 #f-objecte  MAP-11 sobre MAP-01  La vida d'un collaret (simulació amb regles reals)
   V3 #f-regal    HOW-01  Com es fa un regal que s'ha de tornar (esquema)
   V4 #f-espectre SCALE-01  Del regal pur al regateig (Malinowski 1922, Sahlins 1972)
   V5 #f-mauss    MAP-03  On va buscar Mauss el regal (sense relleu: mapa del món)
   V6 #f-hau      LINK-03  El hau, segons Tamati Ranaipiri (esquema)
   V7 #f-segle    TIME-14  Un segle de kula, i un segle d'explicar-lo
   Colors: vermell = collarets i el que es dona; blau = braçalets i el que es torna; groc només en superfícies. */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.KU_DATA;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// en mode fosc, els cercles translúcids se sumen en clar (screen) en lloc d'enfosquir-se (multiply)
const BLEND=window.IBTheme&&IBTheme.dark?"screen":"multiply";
const P=Object.fromEntries(D.places.map(p=>[p.k,p]));
const RED=C.red, BLUE=C.blue;

/* ---------- MAP-01 · relleu (copiat de web/sistema/mapes-b.js, sense canvis de fons) ---------- */
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
    if(zz<=sea)continue;                                   // mar: blanc de paper
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
  return {z};
}

/* ---------- utilitats ---------- */
function stage(el,h){ el.innerHTML=""; const st=document.createElement("div"); st.className="stage"; st.style.position="relative"; st.style.height=h+"px"; el.appendChild(st); return st; }
function mkCanvas(st,w,h,label){
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.width=Math.round(w*dpr); c.height=Math.round(h*dpr); c.style.cssText=`position:absolute;left:0;top:0;width:${w}px;height:${h}px`;
  if(label){ c.setAttribute("role","img"); c.setAttribute("aria-label",label); } else c.setAttribute("aria-hidden","true");
  st.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx};
}
function overlay(st,w,h){ return d3.select(st).append("svg").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
  .style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS); }
function massimProj(w,h,pad,top){
  return d3.geoMercator().fitExtent([[pad,top==null?pad:top],[w-pad,h-pad]],{type:"MultiPoint",coordinates:[[150.36,-8.32],[153.86,-8.32],[150.36,-11.04],[153.86,-11.04]]});
}
// esvaeix el relleu cap a l'oest, on la graella s'acaba en plena terra (Nova Guinea)
function fadeWest(ctx,proj,w,h,D){
  const x0=proj([D.lon0,-9.6])[0]; if(x0<-60)return; const L=70;
  ctx.save(); ctx.globalCompositeOperation="destination-out";
  const g=ctx.createLinearGradient(x0+L,0,x0,0); g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,1)");
  ctx.fillStyle=g; ctx.fillRect(-2,-2,x0+L+2,h+4); ctx.restore();
}
// el cercle esquemàtic en coordenades de pantalla, mostrejat; node → posició (0–1) sobre el cercle
function ringPath(proj,n){
  const pts=D.ring.map(k=>proj(P[k].ll));
  const d=d3.line().curve(d3.curveCatmullRomClosed.alpha(.5))(pts);
  const tmp=d3.select(document.body).append("svg").attr("width",0).attr("height",0).style("position","absolute");
  const p=tmp.append("path").attr("d",d).node(), L=p.getTotalLength(), S=[];
  for(let i=0;i<n;i++){ const q=p.getPointAtLength(L*i/n); S.push([q.x,q.y]); }
  tmp.remove();
  const at={}; D.ring.forEach(k=>{ const q=proj(P[k].ll); at[k]=d3.leastIndex(S,s=>(s[0]-q[0])**2+(s[1]-q[1])**2)/n; });
  const pos=u=>{ u=((u%1)+1)%1; const f=u*n, i=Math.floor(f)%n, j=(i+1)%n, t=f-Math.floor(f); return [S[i][0]+(S[j][0]-S[i][0])*t, S[i][1]+(S[j][1]-S[i][1])*t]; };
  const nrm=u=>{ const a=pos(u-.002), b=pos(u+.002), dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy)||1; return [-dy/l,dx/l]; };
  // tros del cercle de u0 a u1 en el sentit del rellotge
  const seg=(u0,u1,m)=>{ let span=((u1-u0)%1+1)%1; const out=[]; m=m||Math.max(8,Math.round(span*n/3)); for(let i=0;i<=m;i++)out.push(pos(u0+span*i/m)); return out; };
  return {d,S,at,pos,nrm,seg,L};
}
const LAB={kiriwina:["end",-4,-6],sinaketa:["end",-7,4],vakuta:["start",7,9],kitava:["start",4,-9],iwa:["middle",0,-10],gawa:["start",7,10],
  muyuw:["middle",0,-11],nada:["end",-2,-11],misima:["middle",0,17],tubetube:["middle",0,17],wari:["start",7,5],duau:["start",7,4],dobu:["end",-7,4],amphlett:["end",-7,-3]};
function drawPlaces(g,proj,mob,o){
  o=o||{};
  const pl=D.places.filter(p=>!o.only||o.only.includes(p.k));
  const gg=g.append("g").attr("class","pl");
  const nodes=gg.selectAll("g").data(pl).join("g").attr("transform",p=>`translate(${proj(p.ll)})`);
  nodes.append("circle").attr("r",o.r||(mob?3:3.6)).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",1.4);
  nodes.each(function(p){ const [an,dx,dy]=LAB[p.k]||["start",6,4];
    if(mob&&o.mobHide&&o.mobHide.includes(p.k))return;
    V.t(d3.select(this),dx,dy,p.n,{anchor:an,size:mob?10.5:(o.size||12),weight:600,halo:2.6}); });
  return nodes;
}

/* =====================================================================
   V1 · MAP-01 + MAP-12 · EL CERCLE DEL KULA (scrolly)
   ===================================================================== */
(function cercle(){
  const box=$("#cer-viz"), stepsEl=$("#s-cercle .steps"); if(!box||!window.KU_DEM)return;
  let cur=0;
  const lg=$("#cer-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:RED,t:"Collarets (soulava, bagi) · sentit del rellotge"},{c:BLUE,t:"Braçalets (mwali) · sentit contrari"}]); }
  let api=null;
  V.mount(box,(el,w)=>{
    if(api)api.stop();
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.8,vh*.36):Math.min(w*.8,vh*.74));
    const st=stage(el,h), pad=mob?4:12;
    const proj=massimProj(w,h,pad);
    const {c:bc,ctx:bctx}=mkCanvas(st,w,h,"Mapa físic de l'arxipèlag Massim, a l'est de Papua Nova Guinea, amb les comunitats del kula unides en un cercle: les Trobriand al nord-oest, Kitava, Iwa i Gawa al nord, Muyuw a l'est, Misima i Tubetube al sud-est i Duau, Dobu i les Amphlett al sud-oest. Els collarets hi circulen en el sentit de les agulles del rellotge i els braçalets en sentit contrari.");
    relleu59(bctx,proj,w,h,window.KU_DEM,{iso:[300,600,900,1200,1500,1800]}); fadeWest(bctx,proj,w,h,window.KU_DEM);
    const R=ringPath(proj,900);
    const {c:pc,ctx:pctx}=mkCanvas(st,w,h,null);
    const s=overlay(st,w,h), g=s.append("g");
    // context
    D.context.forEach(o=>{ if(mob&&!["Nova Guinea","Mar de Salomó","Mar del Corall"].includes(o.t))return; const p=proj(o.ll);
      V.t(g,p[0],p[1],o.t,{italic:true,fill:C.muted,size:mob?10.5:12,anchor:"middle",halo:2.5}); });
    const L={ring:g.append("g"), spur:g.append("g"), wave:g.append("g"), trade:g.append("g"), pl:g.append("g")};
    L.ring.append("path").attr("d",R.d).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","2 3").attr("stroke-opacity",.7);
    D.spurs.forEach(([a,b])=>{ const p=proj(P[a].ll), q=proj(P[b].ll); L.spur.append("line").attr("x1",p[0]).attr("y1",p[1]).attr("x2",q[0]).attr("y2",q[1]).attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","2 3").attr("stroke-opacity",.7); });
    { const p=proj(P[D.branch[0]].ll), q=proj(P[D.branch[1]].ll), m=[(p[0]+q[0])/2-20,(p[1]+q[1])/2-10];
      L.spur.append("path").attr("d",`M${p[0]},${p[1]}Q${m[0]},${m[1]} ${q[0]},${q[1]}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.8).attr("stroke-dasharray","1 3").attr("stroke-opacity",.6); }
    // onada del 1918: el tram Kitava → Kiriwina → Sinaketa → … → Dobu, en sentit contrari al rellotge
    const segPts=R.seg(R.at.dobu,R.at.kitava).reverse();
    const wavePath=L.wave.append("path").attr("d",d3.line().curve(d3.curveBasis)(segPts)).attr("fill","none").attr("stroke",BLUE).attr("stroke-width",mob?3:4).attr("stroke-opacity",.55).attr("stroke-linecap","round");
    const rS=d3.scaleSqrt([0,800],[0,mob?20:34]);
    const wv=L.wave.selectAll("g.w").data(D.wave1918).join("g").attr("class","w").attr("transform",d=>`translate(${proj(P[d.k].ll)})`);
    wv.append("circle").attr("r",d=>rS(d.v)).attr("fill",BLUE).attr("fill-opacity",.28).attr("stroke",BLUE).attr("stroke-width",1).style("mix-blend-mode",BLEND);
    wv.each(function(d){ const r=rS(d.v), sel=d3.select(this), lab=P[d.k].n+" · "+(d.k==="dobu"?"~":"")+f0(d.v);
      if(mob){ V.t(sel,0,4,(d.k==="dobu"?"~":"")+f0(d.v),{anchor:"middle",size:10.5,weight:700,halo:2.5}); return; }
      if(d.k==="dobu"){ V.t(sel,0,r+16,lab+" parells",{anchor:"middle",size:12.5,weight:700,halo:3}); return; }
      const dx=-(proj(P[d.k].ll)[0]-proj([P[d.k].ll[0]-.3,P[d.k].ll[1]])[0]);
      sel.append("line").attr("x1",-r).attr("x2",dx+4).attr("y1",0).attr("y2",0).attr("stroke",C.ink2).attr("stroke-width",.7);
      V.t(sel,dx,4,lab+" parells",{anchor:"end",size:12.5,weight:700,halo:3}); });
    // comerç
    { const p=proj(D.sanaroa);
      L.trade.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",mob?5:7).attr("fill",C.yellow).attr("fill-opacity",.85).attr("stroke",C.ink).attr("stroke-width",.8);
      V.lines(L.trade,p[0]+(mob?8:11),p[1]+4,mob?[["Sanaroa",true]]:[["Sanaroa",true],["hi bussegen la petxina vermella"]],{size:mob?10.5:11.5,halo:3});
      const a=proj(P.amphlett.ll), t=proj(P.tubetube.ll);
      if(!mob){ V.t(L.trade,a[0]-8,a[1]+12,"terrissa",{anchor:"end",size:11.5,italic:true,fill:C.ink2,halo:3});
        V.t(L.trade,t[0],t[1]+31,"olles de fang",{anchor:"middle",size:11.5,italic:true,fill:C.ink2,halo:3}); } }
    const nodes=drawPlaces(L.pl,proj,mob,{mobHide:["vakuta","iwa","wari","nada"]});
    // partícules
    const n=mob?36:64, rr=V.rng(11);
    const parts=[];
    for(let i=0;i<n;i++){ parts.push({u:i/n+rr()*.006,k:"r",o:2.4+rr()*1.2}); parts.push({u:i/n+rr()*.006+.5/n,k:"b",o:-(2.4+rr()*1.2)}); }
    const A={r:0,b:0}, T={r:0,b:0};
    const SP=.011;  // voltes per segon
    function draw(dt){
      ["r","b"].forEach(k=>{ A[k]+=(T[k]-A[k])*Math.min(1,dt/260); });
      pctx.clearRect(0,0,w,h);
      for(const q of parts){
        q.u+=(q.k==="r"?SP:-SP)*dt/1000;
        const a=A[q.k]; if(a<.02)continue;
        const p=R.pos(q.u), nn=R.nrm(q.u);
        pctx.fillStyle=V.alpha(q.k==="r"?RED:BLUE,.85*a);
        pctx.beginPath(); pctx.arc(p[0]+nn[0]*q.o*(mob?.8:1),p[1]+nn[1]*q.o*(mob?.8:1),mob?1.8:2.3,0,Math.PI*2); pctx.fill();
      }
    }
    api=V.loop(el,(t,dt)=>draw(dt||16));
    const ST=[ // objectius per pas: [collarets, braçalets, onada, comerç]
      [0,0,0,0],[1,0,0,0],[.25,1,0,0],[.12,.25,1,0],[.6,.6,0,1]];
    el.__set=(k,instant)=>{
      const s0=ST[k]||ST[0], Tm=instant||V.reduced?0:650;
      T.r=s0[0]; T.b=s0[1]; if(instant||V.reduced){ A.r=T.r; A.b=T.b; draw(0); }
      L.wave.interrupt().transition().duration(Tm).style("opacity",s0[2]);
      if(s0[2]&&Tm){ const len=wavePath.node().getTotalLength(); wavePath.attr("stroke-dasharray",`${len} ${len}`).attr("stroke-dashoffset",len).transition().duration(1400).ease(d3.easeCubicInOut).attr("stroke-dashoffset",0);
        wv.select("circle").attr("r",0).transition().delay((d,i)=>350+i*420).duration(700).attr("r",d=>rS(d.v)); }
      L.trade.interrupt().transition().duration(Tm).style("opacity",s0[3]);
      L.ring.interrupt().transition().duration(Tm).style("opacity",k===0?1:.55);
      if(!mob)nodes.selectAll("text").interrupt().transition().duration(Tm).style("opacity",o=>k===3&&D.wave1918.some(x=>x.k===o.k)?0:1);
    };
    L.wave.style("opacity",0); L.trade.style("opacity",0);
    el.__set(cur,true);
    // hover
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    const pts=D.places.map(p=>({p,xy:proj(p.ll)}));
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(pts,o=>(o.xy[0]-px)**2+(o.xy[1]-py)**2);
      if((b.xy[0]-px)**2+(b.xy[1]-py)**2>(mob?26:22)**2){ tp.hide(); V.focus(nodes,null); return; }
      V.focus(nodes,o=>o.k===b.p.k);
      const w18=D.wave1918.find(x=>x.k===b.p.k);
      tp.show(`<b>${b.p.n}</b>${b.p.n2?" ("+b.p.n2+")":""} · ${cur===3&&w18?w18.t:b.p.t}`); },()=>{ tp.hide(); V.focus(nodes,null); });
    V.onView(el,instant=>{ if(instant)return; bc.style.opacity=0; g.style("opacity",0);
      d3.select(bc).transition().duration(900).style("opacity",1); g.transition().delay(300).duration(600).style("opacity",1); });
  });
  IB.scrolly(stepsEl,$("#s-cercle .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V2 · MAP-11 sobre MAP-01 · LA VIDA D'UN COLLARET (simulació)
   ===================================================================== */
(function objecte(){
  const box=$("#obj-viz"), play=$("#obj-play"), rng=$("#obj-rng"); if(!box||!window.KU_DEM)return;
  const lg=$("#obj-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:RED,t:"El collaret i el camí fet",kind:"line",w:2.4},{c:C.ink,t:"Comunitat"}]); }
  // parades: de Dobu en el sentit del rellotge fins a tornar-hi
  const i0=D.ring.indexOf("dobu"), STOPS=D.ring.map((_,i)=>D.ring[(i0+i)%D.ring.length]);
  const TOT=6, TRAVEL=.05, r=V.rng(23);
  let raw=STOPS.map(()=>.2+r()*.8); const k=(TOT-TRAVEL*STOPS.length)/d3.sum(raw); raw=raw.map(v=>clamp(v*k,.04,2));
  const SCH=[]; let t=0;
  STOPS.forEach((s,i)=>{ SCH.push({k:s,i,a:t,b:t+raw[i],hold:raw[i]}); t+=raw[i]+TRAVEL; });
  const END=t; // ≈ 6 anys
  const MES=v=>{ const m=Math.round(v*12); return m<1?"menys d'un mes":m<12?`${m} ${m===1?"mes":"mesos"}`:(m%12===0?`${m/12} ${m/12===1?"any":"anys"}`:`${f1(v)} anys`); };
  let T=0, api=null, playing=false, raf=0;
  const set=v=>{ T=clamp(v,0,END); if(rng)rng.value=Math.round(T/END*1000); if(box.__draw)box.__draw(T); };
  V.mount(box,(el,w)=>{
    const mob=w<640;
    const mapH=Math.round(mob?Math.min(w*.8,300)+34:Math.min(w*.6,470)), stripH=mob?64:62, h=mapH+stripH;
    const st=stage(el,h);
    const proj=massimProj(w,mapH,mob?4:14,mob?40:14);
    const {ctx}=mkCanvas(st,w,mapH,"Simulació: un collaret surt de Dobu i fa la volta a l'arxipèlag en el sentit de les agulles del rellotge, passant per dotze comunitats en uns sis anys; a sota, una franja amb el temps que el té cada soci.");
    relleu59(ctx,proj,w,mapH,window.KU_DEM,{iso:[300,600,900,1200,1500,1800]}); fadeWest(ctx,proj,w,mapH,window.KU_DEM);
    const R=ringPath(proj,900);
    const s=overlay(st,w,h), g=s.append("g");
    g.append("path").attr("d",R.d).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","2 3").attr("stroke-opacity",.6);
    const trail=g.append("path").attr("fill","none").attr("stroke",RED).attr("stroke-width",mob?2.2:2.8).attr("stroke-linecap","round").attr("stroke-opacity",.9);
    const nodes=drawPlaces(g,proj,mob,{only:STOPS,mobHide:["vakuta","iwa"],size:11.5});
    const visited=g.append("g");
    const mk=g.append("g").attr("pointer-events","none");
    mk.append("circle").attr("class","pulse").attr("r",11).attr("fill","none").attr("stroke",RED).attr("stroke-width",1.2);
    mk.append("circle").attr("r",mob?5:6.5).attr("fill",RED).attr("stroke",C.paper).attr("stroke-width",1.6);
    const read=g.append("g").attr("transform",`translate(${mob?2:14},${mob?12:22})`);
    // franja de temps
    const x=d3.scaleLinear([0,END],[mob?6:14,w-(mob?6:14)]), y0=mapH+10, sh=mob?20:22;
    const gs=s.append("g");
    const segs=gs.selectAll("rect.sg").data(SCH).join("rect").attr("class","sg").attr("x",d=>x(d.a)).attr("y",y0).attr("width",d=>Math.max(1,x(d.b)-x(d.a))).attr("height",sh)
      .attr("fill",RED).attr("fill-opacity",(d,i)=>i%2?.22:.36);
    gs.selectAll("text.sl").data(SCH.filter(d=>x(d.b)-x(d.a)>(mob?30:44))).join("text").attr("class","sl").attr("x",d=>(x(d.a)+x(d.b))/2).attr("y",y0+sh/2+4)
      .attr("text-anchor","middle").attr("font-size",mob?10:11).attr("fill",C.ink).text(d=>{ const n=P[d.k].n; return (x(d.b)-x(d.a))<(mob?44:60)?n.slice(0,3)+".":n; });
    for(let yr=0;yr<=Math.floor(END);yr++){ gs.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",y0+sh).attr("y2",y0+sh+4).attr("stroke",C.muted);
      if(!mob||yr%2===0)V.t(gs,x(yr),y0+sh+16,yr===0?"0":`${yr} ${yr===1?"any":"anys"}`,{anchor:yr===0?"start":x(yr)>w-30?"end":"middle",size:V.FS.small,fill:C.muted}); }
    const cursor=gs.append("line").attr("y1",y0-4).attr("y2",y0+sh+4).attr("stroke",C.ink).attr("stroke-width",1.4);
    function where(Tt){
      let cs=SCH[0], i=0;
      for(i=0;i<SCH.length;i++){ cs=SCH[i]; if(Tt<cs.b+TRAVEL||i===SCH.length-1)break; }
      const from=R.at[cs.k], to=R.at[STOPS[(cs.i+1)%STOPS.length]];
      if(Tt<=cs.b) return {u:from,cs,held:true,since:Tt-cs.a,i:cs.i};
      const f=clamp((Tt-cs.b)/TRAVEL,0,1), span=((to-from)%1+1)%1;
      return {u:from+span*f,cs,held:false,i:cs.i};
    }
    box.__draw=Tt=>{
      const q=where(Tt), p=R.pos(q.u);
      mk.attr("transform",`translate(${p})`);
      const u0=R.at.dobu, span=Tt>=END-.001?1:((q.u-u0)%1+1)%1;
      const m=Math.max(4,Math.round(span*300)); trail.attr("d",span>.0005?d3.line()(d3.range(m+1).map(i=>R.pos(u0+span*i/m))):null);
      visited.selectAll("circle").data(SCH.filter(d=>d.a<=Tt&&!(d.i===0&&Tt<.001))).join("circle").attr("transform",d=>`translate(${proj(P[d.k].ll)})`).attr("r",mob?3.6:4.4).attr("fill",RED);
      cursor.attr("x1",x(Tt)).attr("x2",x(Tt));
      segs.attr("stroke",d=>d===q.cs&&q.held?C.ink:null).attr("stroke-width",1);
      read.selectAll("*").remove();
      const yr=Tt, nm=P[q.cs.k].n, hand=q.cs.i+1;
      const l1=Tt>=END-.001?"Ha fet la volta: torna a Dobu":(q.held?`A ${nm} · ${hand}a mà de ${STOPS.length}`:`Navegant cap a ${P[STOPS[(q.cs.i+1)%STOPS.length]].n}`);
      const l2=`${yr<1?MES(yr):f1(yr)+" anys"} des que va sortir de Dobu`;
      V.lines(read,0,0,[[l1,true],[l2]],{size:mob?11:12.5,halo:3});
    };
    box.__draw(T);
    if(!V.reduced){ const pu=mk.select(".pulse"); (function pulse(){ pu.attr("r",7).attr("stroke-opacity",.8).transition().duration(1400).ease(d3.easeCubicOut).attr("r",16).attr("stroke-opacity",0).on("end",pulse); })(); }
    // hover sobre la franja i els nodes
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{
      if(py>mapH){ const tt=x.invert(px), d=SCH.find(o=>tt>=o.a&&tt<=o.b+TRAVEL); if(!d){ tp.hide(); return; }
        tp.show(`<b>${P[d.k].n}</b> · el soci el té ${MES(d.hold)} (simulació)`); return; }
      const b=d3.least(SCH,o=>{ const q=proj(P[o.k].ll); return (q[0]-px)**2+(q[1]-py)**2; }), q=proj(P[b.k].ll);
      if((q[0]-px)**2+(q[1]-py)**2>(mob?26:22)**2){ tp.hide(); return; }
      tp.show(`<b>${P[b.k].n}</b> · ${b.i+1}a parada · el soci el té ${MES(b.hold)} (simulació)`); },()=>tp.hide());
  });
  function stop(){ playing=false; cancelAnimationFrame(raf); if(play)play.textContent="→ Reprodueix"; }
  function go(){
    if(playing){ stop(); return; }
    if(T>=END-.001)set(0);
    playing=true; if(play)play.textContent="Atura";
    const dur=15000*(1-T/END)+300, t0=performance.now(), Ts=T;
    const tick=now=>{ if(!playing)return; const f=clamp((now-t0)/dur,0,1); set(Ts+(END-Ts)*f); if(f<1)raf=requestAnimationFrame(tick); else stop(); };
    raf=requestAnimationFrame(tick);
  }
  if(play)play.addEventListener("click",go);
  if(rng)rng.addEventListener("input",()=>{ stop(); set(rng.value/1000*END); });
  V.onView(box,instant=>{ if(!instant)go(); },{threshold:.45});
})();

/* =====================================================================
   V3 · HOW-01 · COM ES FA UN REGAL QUE S'HA DE TORNAR (esquema)
   ===================================================================== */
(function regal(){
  const box=$("#reg-viz"), seg=$("#reg-seg"); if(!box)return;
  const lg=$("#reg-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:BLUE,t:"Braçalets",kind:"hollow"},{c:RED,t:"Collaret"},{c:C.ink2,t:"Altres regals (porcs, nyams, destrals)"},{c:C.yellow,t:"Deute obert",a:.6}]); }
  const VIS=[{t:.2,host:0,n:"Visita 1",d:"La flota de Dobu arriba a Sinaketa"},{t:1.1,host:1,n:"Visita 2",d:"Un any després, Sinaketa va a Dobu"},{t:1.95,host:0,n:"Visita 3",d:"Dobu torna a Sinaketa"}];
  // g: giver (0 Sinaketa, 1 Dobu); o: objecte (a: braçalets, n: collaret, f: menjar, x: destral); big
  const CASES=[
    {vis:2, debt:[[1,.2,1.1]], gifts:[
      {t:.2,g:0,o:"a",big:1,n:"vaga",d:"regal d'obertura: el de Sinaketa dona un bon parell de braçalets i diu que espera un collaret gran"},
      {t:1.1,g:1,o:"n",big:1,n:"yotile",d:"regal de tornada: un collaret equivalent, decidit per qui el torna"}]},
    {vis:3, debt:[[1,.2,1.95],[0,1.1,1.2]], gifts:[
      {t:.2,g:0,o:"a",big:1,n:"vaga",d:"regal d'obertura: un bon parell de braçalets"},
      {t:1.1,g:1,o:"n",big:0,m:.62,n:"basi",d:"regal intermedi: el de Dobu no té cap collaret prou bo i en dona un de petit, en senyal de bona fe"},
      {t:1.22,g:0,o:"a",big:0,m:.62,n:"basi tornat",d:"el basi també s'ha de tornar: el de Sinaketa hi correspon amb uns braçalets petits"},
      {t:1.95,g:1,o:"n",big:1,n:"kudu",d:"el regal que tanca el tracte: el collaret gran que equival a la vaga"}]},
    {vis:2, debt:[[1,.34,1.1]], gifts:[
      {t:.06,g:1,o:"f",big:1,m:.7,n:"pokala",d:"ofrena per demanar l'objecte famós: porcs, plàtans escollits, nyams o taro"},
      {t:.2,g:1,o:"x",big:1,m:.45,n:"kaributu",d:"regal per sol·licitar-lo, de més valor: una destral cerimonial o una espàtula de calç d'os de balena"},
      {t:.34,g:0,o:"a",big:1,m:.3,n:"vaga",d:"el de Sinaketa tria a qui dona els braçalets famosos entre tots els pretendents"},
      {t:1.1,g:1,o:"n",big:1,n:"yotile",d:"la tornada: un collaret a l'altura"}]}
  ];
  let ck=0;
  V.mount(box,(el,w)=>{
    const mob=w<600;
    const h=mob?440:330;
    el.innerHTML=""; const s=V.svg(el,w,h,"Esquema de dues o tres visites entre un soci de Sinaketa i un de Dobu, amb els regals que es fan: vaga, yotile, basi, kudu, pokala i kaributu.");
    const g=s.append("g");
    // orientació: escriptori, el temps va d'esquerra a dreta i els socis són files; mòbil, el temps baixa i els socis són columnes
    const tx=mob?d3.scaleLinear([0,2.15],[58,h-18]):d3.scaleLinear([0,2.15],[120,w-30]);
    const row=mob?[Math.round(w*.26),Math.round(w*.74)]:[92,h-70];
    const P2=(t,r)=>mob?[row[r],tx(t)]:[tx(t),row[r]];
    const L={vis:g.append("g"),rows:g.append("g"),debt:g.append("g"),gifts:g.append("g")};
    // socis
    ["Sinaketa","Dobu"].forEach((n,r)=>{
      if(mob){ V.lines(L.rows,row[r],18,[[n,true],["soci"]],{anchor:"middle",size:12,halo:3});
        L.rows.append("line").attr("x1",row[r]).attr("x2",row[r]).attr("y1",tx(0)).attr("y2",tx(2.15)).attr("stroke",C.hair).attr("stroke-width",1.2); }
      else { V.lines(L.rows,0,row[r]-2,[[n,true],["soci"]],{size:12.5,halo:3});
        L.rows.append("line").attr("x1",tx(0)).attr("x2",tx(2.15)).attr("y1",row[r]).attr("y2",row[r]).attr("stroke",C.hair).attr("stroke-width",1.2); } });
    const tp=V.tip(el);
    function render(k,instant){
      const cs=CASES[k], Tm=instant||V.reduced?0:1;
      L.vis.selectAll("*").remove(); L.debt.selectAll("*").remove(); L.gifts.selectAll("*").remove();
      // visites i hostatge
      VIS.slice(0,cs.vis).forEach(v=>{
        const a=P2(v.t-.09,v.host), b=P2(v.t+.16,v.host);
        if(mob) L.vis.append("rect").attr("x",a[0]-26).attr("y",a[1]).attr("width",52).attr("height",b[1]-a[1]).attr("rx",6).attr("fill",C.neutral);
        else L.vis.append("rect").attr("x",a[0]).attr("y",a[1]-24).attr("width",b[0]-a[0]).attr("height",48).attr("rx",6).attr("fill",C.neutral);
        const hp=P2(v.t+.035,v.host);
        if(mob){ V.t(L.vis,v.host===0?6:w-6,tx(v.t)-2,v.n,{anchor:v.host===0?"start":"end",size:11,weight:700,halo:2.5}); }
        else { V.t(L.vis,tx(v.t),22,v.n,{anchor:"middle",size:12,weight:700}); V.t(L.vis,tx(v.t),37,v.d,{anchor:"middle",size:11.5,fill:C.ink2});
          V.t(L.vis,hp[0],hp[1]+(v.host===0?-30:40),"hostatge: nyams, olles, estada",{anchor:"middle",size:11,italic:true,fill:C.muted,halo:2.5}); }
      });
      // deute obert
      cs.debt.forEach(([r,a,b])=>{ const p=P2(a,r), q=P2(b,r), off=mob?(r===0?-12:12):(r===0?13:-13);
        const rc=mob?L.debt.append("rect").attr("x",p[0]+off-3).attr("y",p[1]).attr("width",6).attr("height",0).attr("rx",3)
                    :L.debt.append("rect").attr("x",p[0]).attr("y",p[1]+off-3).attr("width",0).attr("height",6).attr("rx",3);
        rc.attr("fill",C.yellow).attr("fill-opacity",.6);
        if(mob)rc.transition().delay(Tm?500:0).duration(Tm?1200:0).attr("height",q[1]-p[1]); else rc.transition().delay(Tm?500:0).duration(Tm?1200:0).attr("width",q[0]-p[0]); });
      // regals
      cs.gifts.forEach((gf,i)=>{
        const a=P2(gf.t,gf.g), b=P2(gf.t,1-gf.g), gg=L.gifts.append("g").datum(gf).style("opacity",0);
        const col=gf.o==="a"?BLUE:gf.o==="n"?RED:C.ink2;
        const fm=gf.m==null?.5:gf.m, mid=[a[0]+(b[0]-a[0])*fm,a[1]+(b[1]-a[1])*fm];
        const dir=mob?Math.sign(b[0]-a[0]):Math.sign(b[1]-a[1]);
        const end=mob?[b[0]-dir*14,b[1]]:[b[0],b[1]-dir*14], st0=mob?[a[0]+dir*8,a[1]]:[a[0],a[1]+dir*8];
        gg.append("path").attr("d",`M${st0}L${end}`).attr("stroke",col).attr("stroke-width",gf.big?2:1.3).attr("fill","none");
        const ah=mob?`M${end[0]-dir*6},${end[1]-5}L${end[0]},${end[1]}L${end[0]-dir*6},${end[1]+5}`:`M${end[0]-5},${end[1]-dir*6}L${end[0]},${end[1]}L${end[0]+5},${end[1]-dir*6}`;
        gg.append("path").attr("d",ah).attr("stroke",col).attr("stroke-width",gf.big?2:1.3).attr("fill","none");
        const R0=gf.big?(mob?9:11):(mob?5.5:7);
        const gl=gg.append("g").attr("transform",`translate(${mid})`);
        if(gf.o==="a"){ gl.append("circle").attr("r",R0).attr("fill",C.paper).attr("stroke",BLUE).attr("stroke-width",gf.big?3.4:2.4); }
        else if(gf.o==="n"){ const nb=gf.big?13:9; d3.range(nb).forEach(j=>{ const an=2*Math.PI*j/nb; gl.append("circle").attr("cx",Math.cos(an)*R0).attr("cy",Math.sin(an)*R0).attr("r",gf.big?2.3:1.8).attr("fill",RED); }); }
        else if(gf.o==="f"){ gl.append("rect").attr("x",-R0*.8).attr("y",-R0*.8).attr("width",R0*1.6).attr("height",R0*1.6).attr("rx",3).attr("fill",C.ink2).attr("fill-opacity",.75); }
        else { gl.append("path").attr("d",`M0,${-R0}L${R0*.7},0L0,${R0}L${-R0*.7},0Z`).attr("fill",C.ink2); }
        const lx=mob?0:R0+6, ly=mob?-R0-6:4;
        V.t(gl,lx,ly,gf.n,{anchor:mob?"middle":"start",size:mob?11.5:12.5,weight:700,italic:true,halo:3});
        gg.append("circle").attr("cx",mid[0]).attr("cy",mid[1]).attr("r",Math.max(R0+8,20)).attr("fill","transparent").attr("class","hit")
          .on("pointerenter pointerdown",()=>{ V.focus(L.gifts.selectAll(":scope>g"),o=>o===gf); tp.show(`<b>${gf.n}</b> · ${gf.d}`); })
          .on("pointerleave",ev=>{ if(ev.pointerType==="mouse"){ tp.hide(); L.gifts.selectAll(":scope>g").interrupt().style("opacity",1); } });
        gg.transition().delay(Tm?300+i*650:0).duration(Tm?500:0).style("opacity",1);
      });
    }
    box.__render=render;
    render(ck,!el.__seen);
    V.onView(el,instant=>{ if(!instant)render(ck,false); });
  });
  if(seg)seg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    ck=+b.dataset.k; seg.querySelectorAll("button").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));
    if(box.__render)box.__render(ck,false); }));
})();

/* =====================================================================
   V4 · SCALE-01 · DEL REGAL PUR AL REGATEIG
   ===================================================================== */
(function espectre(){
  const box=$("#esp-viz"), seg=$("#esp-seg"); if(!box)return;
  const TY=[
    {n:"Regals purs",s:"Regal pur",x:"marit i muller; pares i fills",ab:1,z:"el pol generalitzat: el seu tipus ideal és el regal pur de Malinowski",e:"Entre marit i muller i de pares a fills. A les Trobriand és rar."},
    {n:"Pagaments habituals, tornats de manera irregular",s:"Pagament irregular",x:"la collita dels cunyats",z:"el llista com a pagament tornat de manera irregular, sense equivalència estricta",e:"La collita que un home rep cada any dels germans de la seva dona."},
    {n:"Pagaments per serveis",s:"Pagament per servei",x:"el mag dels horts",z:"entre els pols (Sahlins no el classifica un per un)",e:"Al mag dels horts, al constructor de canoes."},
    {n:"Regals tornats en forma equivalent",s:"Regal equivalent",x:"visites; amics",z:"reciprocitat equilibrada",e:"Presents entre pobles en visites que es tornaran; regals entre amics."},
    {n:"Béns a canvi de privilegis o títols",s:"Béns per privilegis",x:"una màgia; una dansa",z:"entre els pols (Sahlins no el classifica un per un)",e:"Pagar a l'oncle matern una màgia o un hort abans d'heretar-lo; el dret a una dansa."},
    {n:"Bescanvi cerimonial amb pagament diferit",s:"El kula",x:"sense regateig, amb temps",z:"reciprocitat equilibrada, sense regateig",e:"El kula, i el bescanvi de nyams per peix entre socis (wasi). No es regateja."},
    {n:"Comerç pur i simple",s:"Gimwali",x:"amb regateig",z:"cap al pol negatiu: regateig i bescanvi",e:"Plats de fusta, pintes i cistells a canvi de nyams o peix, amb regateig."}];
  let mode=0;
  V.mount(box,(el,w)=>{
    const mob=w<600, h=mob?520:228;
    el.innerHTML=""; const s=V.svg(el,w,h,"Escala amb els set tipus d'intercanvi que Malinowski va descriure a les Trobriand, del regal pur al comerç amb regateig; el kula és el sisè. Sahlins els agrupa en reciprocitat generalitzada, equilibrada i negativa.");
    const g=s.append("g");
    const pos=mob?d3.scalePoint(d3.range(7),[52,h-72]):d3.scalePoint(d3.range(7),[60,w-60]);
    const axis=mob?44:96;
    const XY=i=>mob?[axis,pos(i)]:[pos(i),axis];
    const Z=g.append("g"), Lg=g.append("g"), N=g.append("g");
    // eix
    if(mob){ Lg.append("line").attr("x1",axis).attr("x2",axis).attr("y1",pos(0)-26).attr("y2",pos(6)+16).attr("stroke",C.ink2).attr("stroke-width",1);
      V.t(Lg,4,18,"↑ Sense esperar res",{size:11.5,fill:C.ink2}); V.t(Lg,4,h-6,"↓ Regatejar",{size:11.5,fill:C.ink2}); }
    else { Lg.append("line").attr("x1",pos(0)-30).attr("x2",pos(6)+30).attr("y1",axis).attr("y2",axis).attr("stroke",C.ink2).attr("stroke-width",1);
      V.t(Lg,pos(0)-30,axis-46,"← Sense esperar res",{size:12,fill:C.ink2}); V.t(Lg,pos(6)+30,axis-46,"Regatejar →",{size:12,fill:C.ink2,anchor:"end"}); }
    // zones de Sahlins
    const zs=Z.append("g").style("opacity",0);
    { const gid="kz"+Math.random().toString(36).slice(2,7), lgd=zs.append("defs").append("linearGradient").attr("id",gid);
      if(mob)lgd.attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",1);
      [[0,.02],[.5,.08],[1,.16]].forEach(([o,a])=>lgd.append("stop").attr("offset",o).attr("stop-color",C.ink).attr("stop-opacity",a));
      const a=XY(0), b=XY(6);
      if(mob){ zs.append("rect").attr("x",4).attr("y",a[1]-24).attr("width",w-8).attr("height",b[1]-a[1]+48).attr("rx",8).attr("fill",`url(#${gid})`);
        [[0,"Reciprocitat generalitzada"],[3.5,"Reciprocitat equilibrada"],[6,"Reciprocitat negativa"]].forEach(([i,t])=>{ const yy=i===3.5?(pos(3)+pos(4))/2+4:pos(i)+30; V.t(zs,w-10,yy,t,{anchor:"end",size:11,weight:700,italic:true,fill:C.ink2,halo:2}); }); }
      else { zs.append("rect").attr("x",a[0]-40).attr("y",axis-28).attr("width",b[0]-a[0]+80).attr("height",h-axis+16).attr("rx",8).attr("fill",`url(#${gid})`);
        [[0,"start","Reciprocitat generalitzada"],[3.5,"middle","Reciprocitat equilibrada"],[6,"end","Reciprocitat negativa"]].forEach(([i,an,t])=>{ const xx=i===3.5?(pos(3)+pos(4))/2:pos(i)+(an==="start"?-34:34); V.t(zs,xx,h-6,t,{anchor:an,size:11.5,weight:700,fill:C.ink2}); }); } }
    // tipus
    const ns=N.selectAll("g").data(TY).join("g").attr("transform",(d,i)=>`translate(${XY(i)})`);
    ns.append("circle").attr("r",mob?13:16).attr("fill",(d,i)=>i===5?C.yellow:C.paper).attr("fill-opacity",(d,i)=>i===5?.75:1)
      .attr("stroke",(d,i)=>i===6?C.ink:i===5?C.ink:C.ink2).attr("stroke-width",(d,i)=>i>=5?1.6:1).attr("stroke-dasharray",(d,i)=>i===0?"3 2.5":null);
    ns.append("text").attr("text-anchor","middle").attr("y",5).attr("font-size",mob?12:13).attr("font-weight",700).attr("fill",C.ink).text((d,i)=>i+1);
    ns.each(function(d,i){ const sel=d3.select(this);
      if(mob){ V.lines(sel,22,-2,[[d.s,true],[d.x]],{size:11.5,halo:2.5}); }
      else { const words=d.s.split(" "); V.lines(sel,0,32,[[d.s,true]],{anchor:"middle",size:12.5,halo:2.5});
        const sub=d.x, wds=sub.split(" "), ln=[]; let cur="";
        wds.forEach(wd=>{ if((cur+" "+wd).trim().length>18){ ln.push([cur.trim()]); cur=wd; } else cur+=" "+wd; }); if(cur.trim())ln.push([cur.trim()]);
        V.lines(sel,0,49,ln.slice(0,3),{anchor:"middle",size:11,fill:C.ink2,halo:2}); } });
    const tp=V.tip(el);
    ns.append("circle").attr("r",mob?22:34).attr("fill","transparent").attr("class","hit");
    ns.on("pointerenter pointerdown",function(ev,d){ const i=TY.indexOf(d); V.focus(ns,o=>o===d);
      tp.show(`<b>${i+1}. ${d.n}</b> · ${mode===1?"Sahlins: "+d.z:d.e}${d.ab?" Mauss la va trobar inaplicable i el 1926 Malinowski la va abandonar.":""}`); })
      .on("pointerleave",ev=>{ if(ev.pointerType==="mouse"){ tp.hide(); V.focus(ns,null); } });
    box.__mode=(m,instant)=>{ mode=m; zs.interrupt().transition().duration(instant||V.reduced?0:600).style("opacity",m===1?1:0); };
    box.__mode(mode,true);
    V.onView(el,instant=>{ if(instant)return; ns.style("opacity",0).transition().delay((d,i)=>i*110).duration(500).style("opacity",1); });
  });
  if(seg)seg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    seg.querySelectorAll("button").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));
    if(box.__mode)box.__mode(+b.dataset.k,false); }));
})();

/* =====================================================================
   V5 · MAP-03 · ON VA BUSCAR MAUSS EL REGAL (sense relleu: mapa del món)
   ===================================================================== */
(function mauss(){
  const box=$("#mau-viz"); if(!box)return;
  const lg=$("#mau-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:RED,t:"Societats estudiades per etnògrafs",a:.55},{c:BLUE,t:"Drets antics (posició orientativa)",a:.55}]); }
  V.mount(box,(el,w)=>{
    const mob=w<600, h=Math.round(mob?w*.62:Math.min(w*.5,470));
    const st=stage(el,h);
    const proj=d3.geoEqualEarth().rotate([-160,0]).fitExtent([[2,4],[w-2,h-4]],{type:"Sphere"});
    const {c:cv,ctx}=mkCanvas(st,w,h,"Mapa del món amb els casos que compara Marcel Mauss a l'Assaig sobre el do: Samoa, els maoris, les Andaman, Nova Caledònia, les Trobriand, Fiji i la costa nord-oest d'Amèrica, i els drets romà, hindú, germànic, celta i xinès.");
    const pth=d3.geoPath(proj,ctx);
    ctx.beginPath(); pth({type:"Sphere"}); ctx.strokeStyle=C.hair; ctx.lineWidth=.8; ctx.stroke();
    V.world().then(W=>{ ctx.beginPath(); pth(W.land); ctx.fillStyle=C.land; ctx.fill(); ctx.strokeStyle=C.landEdge; ctx.lineWidth=.5; ctx.stroke(); }).catch(()=>{});
    const s=overlay(st,w,h), g=s.append("g");
    const R0=mob?6:9;
    const pts=D.mauss.map(d=>({d,p:proj(d.ll)}));
    const dots=g.selectAll("g").data(pts).join("g").attr("transform",o=>`translate(${o.p})`);
    dots.append("circle").attr("r",R0).attr("fill",o=>o.d.ty==="etno"?RED:BLUE).attr("fill-opacity",.45).style("mix-blend-mode",BLEND);
    dots.append("circle").attr("r",1.8).attr("fill",C.ink);
    const LB={"Samoa":["start",-1],"Maoris":["start",1],"Andaman":["end",1],"Nova Caledònia":["end",1],"Trobriand":["end",-1],"Fiji":["start",1],"Costa nord-oest":["end",-1],
      "Dret romà":["start",1],"Dret hindú":["end",1],"Dret germànic":["start",-1],"Dret celta":["end",-1],"Dret xinès":["start",-1]};
    const SHOWM=["Trobriand","Maoris","Costa nord-oest","Samoa","Dret romà","Dret xinès"];
    dots.each(function(o){ if(mob&&!SHOWM.includes(o.d.n))return; const [an,vy]=LB[o.d.n]||["start",1];
      V.t(d3.select(this),an==="start"?R0+3:-R0-3,vy<0?-5:12,o.d.n,{anchor:an,size:mob?10.5:12,weight:600,halo:2.6}); });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(pts,o=>(o.p[0]-px)**2+(o.p[1]-py)**2);
      if((b.p[0]-px)**2+(b.p[1]-py)**2>(R0*2.6)**2){ tp.hide(); V.focus(dots,null); return; }
      V.focus(dots,o=>o===b); tp.show(`<b>${b.d.n}</b>${b.d.n2?" ("+b.d.n2+")":""} · ${b.d.c} · ${b.d.t}`); },()=>{ tp.hide(); V.focus(dots,null); });
    V.onView(el,instant=>{ if(instant)return; dots.select("circle").attr("r",0).transition().delay((o,i)=>200+i*90).duration(600).attr("r",R0); });
  });
})();

/* =====================================================================
   V6 · LINK-03 · EL HAU, SEGONS TAMATI RANAIPIRI (esquema)
   ===================================================================== */
(function hau(){
  const box=$("#hau-viz"), seg=$("#hau-seg"); if(!box)return;
  let mode=0, api=null;
  V.mount(box,(el,w)=>{
    if(api)api.stop();
    const mob=w<520, h=mob?270:300;
    el.innerHTML=""; const s=V.svg(el,w,h,"Esquema del hau: A dona un taonga a B, B el dona a C, C torna alguna cosa a B, i B l'ha de tornar a A, perquè és el hau del regal d'A. Si B se'l queda, se'n pot seguir una desgràcia.");
    const g=s.append("g");
    const cy=h*.5, X=[w*.13,w*.5,w*.87];
    const N=[{k:"A",d:"fa el regal"},{k:"B",d:"el rep i el passa"},{k:"C",d:"el rep i torna alguna cosa"}];
    const arc=(x0,x1,up)=>{ const m=(x0+x1)/2, dy=(up?-1:1)*Math.min(70,Math.abs(x1-x0)*.42); return `M${x0},${cy+(up?-8:8)}Q${m},${cy+dy} ${x1},${cy+(up?-8:8)}`; };
    const ED=[{a:0,b:1,up:1,c:RED,n:"el taonga"},{a:1,b:2,up:1,c:RED,n:"el passa"},{a:2,b:1,up:0,c:BLUE,n:"el que torna: el hau"},{a:1,b:0,up:0,c:BLUE,n:"B l'ha de tornar"}];
    const es=g.selectAll("path.e").data(ED).join("path").attr("class","e").attr("d",e=>arc(X[e.a],X[e.b],e.up)).attr("fill","none").attr("stroke",e=>e.c).attr("stroke-width",1.6).attr("stroke-opacity",.55);
    const heads=g.selectAll("path.hd").data(ED).join("path").attr("class","hd").attr("fill","none").attr("stroke",e=>e.c).attr("stroke-width",1.6).attr("stroke-opacity",.8)
      .attr("d",(e,i)=>{ const p=es.nodes()[i], L=p.getTotalLength(), q=p.getPointAtLength(L-24), q0=p.getPointAtLength(L-31), an=Math.atan2(q.y-q0.y,q.x-q0.x), k=6;
        return `M${q.x-k*Math.cos(an-.5)},${q.y-k*Math.sin(an-.5)}L${q.x},${q.y}L${q.x-k*Math.cos(an+.5)},${q.y-k*Math.sin(an+.5)}`; });
    const el2=g.selectAll("g.el").data(ED).join("g").attr("class","el");
    el2.each(function(e){ const m=(X[e.a]+X[e.b])/2, dy=(e.up?-1:1)*Math.min(70,Math.abs(X[e.b]-X[e.a])*.42)/2;
      V.t(d3.select(this),m,cy+dy+(e.up?-8:18),e.n,{anchor:"middle",size:mob?11:12.5,weight:600,fill:C.ink,halo:3}); });
    const ns=g.selectAll("g.n").data(N).join("g").attr("class","n").attr("transform",(d,i)=>`translate(${X[i]},${cy})`);
    ns.append("circle").attr("r",mob?17:20).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.4);
    ns.append("text").attr("text-anchor","middle").attr("y",6).attr("font-size",mob?15:17).attr("font-weight",700).attr("fill",C.ink).text(d=>d.k);
    ns.each(function(d,i){ if(mob&&i!==1){ V.t(d3.select(this),0,mob?36:40,d.d,{anchor:"middle",size:10.5,fill:C.ink2,halo:2.5}); return; }
      V.t(d3.select(this),0,mob?36:42,d.d,{anchor:"middle",size:mob?10.5:12,fill:C.ink2,halo:2.5}); });
    const warn=g.append("g").style("opacity",0);
    V.lines(warn,X[1],h-30,[["Si B se'l queda: «em podria passar alguna desgràcia,"],["fins i tot la mort»"]],{anchor:"middle",size:mob?11:12.5,italic:true,fill:C.ink,halo:3});
    const cut=g.append("g").style("opacity",0);
    { const m=(X[0]+X[1])/2, y=cy+Math.min(70,Math.abs(X[1]-X[0])*.42)/2;
      cut.append("path").attr("d",`M${m-7},${y-9}L${m+7},${y+9}M${m+7},${y-9}L${m-7},${y+9}`).attr("stroke",C.ink).attr("stroke-width",2); }
    // partícula que fa el recorregut
    const tmp=es.nodes(), dot=g.append("circle").attr("r",mob?5:6).attr("stroke",C.paper).attr("stroke-width",1.4).attr("pointer-events","none");
    const PH=4, DUR=1500, PAUSE=900;
    api=V.loop(el,t=>{
      const cyc=PH*DUR+PAUSE, tt=V.reduced?DUR*1.5:t%cyc, ph=Math.min(PH-1,Math.floor(tt/DUR)), f=clamp((tt-ph*DUR)/DUR,0,1);
      if(mode===1&&ph===3){ dot.style("opacity",0); return; }
      if(tt>PH*DUR){ dot.style("opacity",0); return; }
      const p=tmp[ph], L=p.getTotalLength(), q=p.getPointAtLength(L*d3.easeCubicInOut(f));
      dot.style("opacity",1).attr("cx",q.x).attr("cy",q.y).attr("fill",ED[ph].c);
    });
    box.__mode=(m,instant)=>{ mode=m; const T=instant||V.reduced?0:500;
      es.filter((e,i)=>i===3).interrupt().transition().duration(T).attr("stroke-opacity",m?0.15:.55).attr("stroke-dasharray",m?"3 4":null);
      heads.filter((e,i)=>i===3).interrupt().transition().duration(T).attr("stroke-opacity",m?0:.8);
      el2.filter((e,i)=>i===3).interrupt().transition().duration(T).style("opacity",m?.25:1);
      warn.interrupt().transition().duration(T).style("opacity",m); cut.interrupt().transition().duration(T).style("opacity",m);
      ns.select("circle").attr("stroke-width",(d,i)=>m&&i===1?2.6:1.4); };
    box.__mode(mode,true);
  });
  if(seg)seg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    seg.querySelectorAll("button").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));
    if(box.__mode)box.__mode(+b.dataset.k,false); }));
})();

/* =====================================================================
   V7 · TIME-14 · UN SEGLE DE KULA, I UN SEGLE D'EXPLICAR-LO
   ===================================================================== */
(function segle(){
  const box=$("#seg-viz"); if(!box)return;
  const LN=[{n:"A les illes",c:RED},{n:"Les idees",c:BLUE},{n:"Mentrestant, al Canadà",c:C.ink2}];
  const lg=$("#seg-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,LN.map(l=>({c:l.c,t:l.n}))); }
  const EV=D.segle.slice().sort((a,b)=>a.y0-b.y0);
  V.mount(box,(el,w)=>{
    const mob=w<640;
    el.innerHTML="";
    const tp=V.tip(el);
    const fy=e=>e.y1?`${e.y0}–${e.y1}`:(e.y0===1946?"c. 1946":e.y0===1968?"c. 1968":`${e.y0}`);
    if(mob){
      const step=46, h=EV.length*step+16, s=V.svg(el,w,h,"Cronologia del kula i de les idees sobre el regal, del 1884 al 2025.");
      const g=s.append("g"), ax=64;
      g.append("line").attr("x1",ax).attr("x2",ax).attr("y1",8).attr("y2",h-8).attr("stroke",C.hair);
      const rows=g.selectAll("g").data(EV).join("g").attr("transform",(e,i)=>`translate(0,${20+i*step})`);
      rows.append("circle").attr("cx",ax).attr("cy",0).attr("r",e=>e.y1?6:5).attr("fill",e=>LN[e.l].c).attr("fill-opacity",e=>e.y1?.35:.9).attr("stroke",e=>LN[e.l].c);
      rows.each(function(e){ const sel=d3.select(this);
        V.t(sel,ax-12,4,e.y1?`${e.y0}–${String(e.y1).slice(2)}`:(e.y0===1946?"c. 1946":e.y0===1968?"c. 1968":String(e.y0)),{anchor:"end",size:11.5,fill:C.ink2});
        V.t(sel,ax+14,4,e.n,{size:12,weight:700,halo:2});
        V.t(sel,ax+14,19,LN[e.l].n,{size:10.5,fill:C.muted}); });
      rows.append("rect").attr("x",0).attr("y",-step/2).attr("width",w).attr("height",step).attr("fill","transparent").attr("class","hit")
        .on("pointerenter pointerdown",(ev,e)=>{ V.focus(rows,o=>o===e); tp.show(`<b>${fy(e)}</b> · ${e.t}`); })
        .on("pointerleave",ev=>{ if(ev.pointerType==="mouse"){ tp.hide(); V.focus(rows,null); } });
      V.onView(el,instant=>{ if(instant)return; rows.style("opacity",0).transition().delay((e,i)=>i*60).duration(400).style("opacity",1); });
      return;
    }
    const laneH=[112,112,64], top=30, h=top+d3.sum(laneH)+30;
    const s=V.svg(el,w,h,"Cronologia en tres carrils: el kula a les illes, les idees sobre el regal i la prohibició del potlatch al Canadà, del 1884 al 2025.");
    const g=s.append("g");
    const x=d3.scaleLinear([1880,2030],[150,w-20]);
    const yL=[top,top+laneH[0],top+laneH[0]+laneH[1]];
    [1900,1925,1950,1975,2000,2025].forEach(yr=>{ g.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",top-6).attr("y2",h-24).attr("stroke",C.grid);
      V.t(g,x(yr),h-8,String(yr),{anchor:"middle",size:V.FS.small,fill:C.muted}); });
    LN.forEach((l,i)=>{ V.lines(g,0,yL[i]+laneH[i]/2,[[l.n,true]],{size:12.5,fill:l.c===C.ink2?C.ink2:C.ink});
      g.append("rect").attr("x",0).attr("y",yL[i]+laneH[i]/2+8).attr("width",28).attr("height",3).attr("fill",l.c);
      g.append("line").attr("x1",x(1880)).attr("x2",x(2030)).attr("y1",yL[i]+laneH[i]/2).attr("y2",yL[i]+laneH[i]/2).attr("stroke",C.hair); });
    // etiquetes en nivells perquè no se solapin
    const tiers={};
    EV.forEach(e=>{ e.lab=e.n+(e.c?" (c.)":""); });
    const items=EV.map(e=>{ const cx=x(e.y0), lw=e.lab.length*6.3+6, end=cx+lw>w-4, x0=end?cx-lw:cx, x1=end?cx:cx+lw; const key=e.l; tiers[key]=tiers[key]||[[],[],[],[]];
      const offs=[-1,1,-2,2]; let ti=0; for(;ti<offs.length;ti++){ if(!tiers[key][ti].some(([a,b])=>x0<b+6&&x1>a-6))break; }
      ti=Math.min(ti,offs.length-1); tiers[key][ti].push([x0,x1]); return {e,cx,off:offs[ti],end}; });
    const evs=g.selectAll("g.ev").data(items).join("g").attr("class","ev");
    evs.each(function(it){ const e=it.e, sel=d3.select(this), cy=yL[e.l]+laneH[e.l]/2, col=LN[e.l].c;
      if(e.y1) sel.append("rect").attr("x",x(e.y0)).attr("y",cy-6).attr("width",Math.max(4,x(e.y1)-x(e.y0))).attr("height",12).attr("rx",6).attr("fill",col).attr("fill-opacity",.28).attr("stroke",col).attr("stroke-width",.8);
      else sel.append("circle").attr("cx",it.cx).attr("cy",cy).attr("r",5).attr("fill",col).attr("stroke",C.paper).attr("stroke-width",1.2);
      const ly=cy+it.off*(laneH[e.l]>70?22:16)+(it.off>0?6:0);
      sel.append("line").attr("x1",it.cx).attr("x2",it.cx).attr("y1",cy+(it.off<0?-6:6)).attr("y2",ly+(it.off<0?4:-11)).attr("stroke",C.ink2).attr("stroke-width",.6);
      V.t(sel,it.end?it.cx-2:it.cx+2,ly,e.lab,{size:11.5,weight:600,halo:2.5,anchor:it.end?"end":"start"});
      sel.append("rect").attr("x",it.end?it.cx-e.lab.length*6.3-10:it.cx-6).attr("y",Math.min(cy,ly)-14).attr("width",e.lab.length*6.3+16).attr("height",Math.abs(ly-cy)+24).attr("fill","transparent").attr("class","hit"); });
    evs.on("pointerenter pointerdown",(ev,it)=>{ V.focus(evs,o=>o===it); tp.show(`<b>${fy(it.e)}</b> · ${it.e.t}`); })
       .on("pointerleave",ev=>{ if(ev.pointerType==="mouse"){ tp.hide(); V.focus(evs,null); } });
    V.onView(el,instant=>{ if(instant)return; evs.style("opacity",0).transition().delay((it,i)=>i*70).duration(450).style("opacity",1); });
  });
})();

})();
