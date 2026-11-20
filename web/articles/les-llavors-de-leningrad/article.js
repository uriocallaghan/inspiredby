/* «Els científics que van morir de gana entre sacs de llavors» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #f-viatges  MAP-11/MAP-03  Llocs de les expedicions de Vavílov (1916–1933), amb lliscant
   V2 #f-centres  MAP-03         Els set centres d'origen de Vavílov (esquema)
   V3 #f-col      PART-01        La col·lecció de Vavílov (250 quadrets)
   V4 #s-ciutat   MAP-01 + MAP-03 Leningrad: llocs del salvament (scrolly)
   V5 #f-racio    TIME-01 + CASE-01 Racions de pa i calories
   V6 #f-morts    SPREAD-01      Quants van morir? (mínims)
   V7 #s-volta    PART-06        Els 135 dipositants de Svalbard (scrolly)
   V8 #f-retorn   LINK-03        Anada i tornada d'Alep
   Colors: vermell = gana i pèrdua; blau = llavor guardada, aigua, còpia; groc = superfícies (centres, collita). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.LL_DATA;
const f0=V.fmt(",.0f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// en mode fosc, els cercles translúcids se sumen en clar (screen) en lloc d'enfosquir-se (multiply)
const DARK=!!(window.IBTheme&&IBTheme.dark), BLEND=DARK?"screen":"multiply";
const MESOS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const deMes=m=>(/^[aeiou]/.test(MESOS[m])?"d'":"de ")+MESOS[m];
const fDate=d=>`${d.getUTCDate()} ${deMes(d.getUTCMonth())} de ${d.getUTCFullYear()}`;

/* ---------- MAP-01 · relleu (copiat de web/sistema/mapes-b.js) ---------- */
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
  const sea=o.sea==null?0:o.sea, iso=o.iso||[300,600,900,1200];
  const fc=document.createElement("canvas"); fc.width=Math.ceil(w); fc.height=Math.ceil(h);
  const fx=fc.getContext("2d"), im=fx.createImageData(fc.width,fc.height), d=im.data;
  const kmLon=111.32*Math.cos(((D.lat1-D.ny*D.st/2)*Math.PI)/180), dd=D.st*1.12;
  for(let y=0;y<fc.height;y++)for(let x=0;x<fc.width;x++){
    const ll=proj.invert([x+.5,y+.5]); if(!ll)continue;
    const zz=z(ll[0],ll[1]); if(zz!==zz||zz<=sea)continue;
    const gx=(z(ll[0]+dd,ll[1])-z(ll[0]-dd,ll[1]))/(2*dd*kmLon), gy=(z(ll[0],ll[1]+dd)-z(ll[0],ll[1]-dd))/(2*dd*111.32);
    const shade=(gx!==gx||gy!==gy)?0:clamp((-gx+gy)*.65/98,-1,1)*15;
    const band=IB59_BANDS.find(q=>zz<q[0])[1];
    const i=(y*fc.width+x)*4; d[i]=clamp(band[0]+shade,0,255); d[i+1]=clamp(band[1]+shade,0,255); d[i+2]=clamp(band[2]+shade,0,255); d[i+3]=255;
  }
  fx.putImageData(im,0,0);
  ctx.save(); ctx.imageSmoothingEnabled=true; ctx.drawImage(fc,0,0,w,h);
  iso59(D,iso).forEach(c=>{ ctx.beginPath(); pth(c.geo); ctx.strokeStyle=V.alpha(C.ink,.14); ctx.lineWidth=.55; ctx.stroke(); });
  ctx.restore();
  ctx.beginPath(); iso59(D,[sea+.01]).forEach(c=>pth(c.geo));
  ctx.strokeStyle=IB59_COAST; ctx.lineWidth=.9; ctx.lineJoin="round"; ctx.stroke();
  if(o.rivers){ ctx.beginPath(); pth(o.rivers); ctx.strokeStyle=V.alpha(C.blue,.78); ctx.lineWidth=1.25; ctx.lineCap="round"; ctx.stroke(); }
  if(o.lakes){ ctx.beginPath(); pth(o.lakes); ctx.fillStyle=IB59_LAKE; ctx.fill(); ctx.strokeStyle=C.blue; ctx.lineWidth=.95; ctx.stroke(); }
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
  return d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
    .attr("aria-hidden","true").style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS);
}
function stage(el,h){ d3.select(el).selectAll(":scope>svg,:scope>canvas,:scope>.stage").remove(); const st=document.createElement("div"); st.className="stage"; st.style.cssText=`position:relative;height:${h}px`; el.insertBefore(st,el.firstChild); return st; }
function worldMap(g,proj,W){
  const p=d3.geoPath(proj);
  g.append("path").datum({type:"Sphere"}).attr("d",p).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.6);
  g.append("path").datum(W.land).attr("d",p).attr("fill",C.land).attr("stroke","none");
  g.append("path").datum(W.borders).attr("d",p).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.6);
}

/* =====================================================================
   V1 · MAP-11 / MAP-03 · CINC CONTINENTS (llocs de les expedicions)
   ===================================================================== */
(function viatges(){
  const box=$("#viatges-viz"), rng=$("#viatges-rng"), play=$("#viatges-play"), anyL=$("#viatges-any"); if(!box)return;
  const EXPY=[1916,1921,1924,1925,1926,1927,1929,1930,1932];
  const col=d3.scaleSequential(V.seqInterp(C.red)).domain([1912,1934]);
  const P=D.llocs.map(([y,n,x,yy])=>({y,n,ll:[x,yy]}));
  const lg=$("#viatges-lg"); if(lg){ lg.innerHTML=""; V.legendRamp(lg,{scale:col,min:1916,max:1933,ticks:[1916,1924,1933],f:d=>d,title:"Any de l'expedició",w:120}); }
  let year=1933, playing=false, raf=0;
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(w*(mob?.62:.5));
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Mapa del món amb els llocs de les grans expedicions de Vavílov entre el 1916 i el 1933: Iran i el Pamir, l'Afganistan, el Mediterrani, Etiòpia i el Iemen, la Xina, el Japó i Corea, Amèrica del Nord, Central i del Sud.");
    const proj=d3.geoEqualEarth().fitExtent([[2,2],[w-2,h-2]],{type:"Sphere"}).rotate([-20,0]);
    proj.fitExtent([[2,2],[w-2,h-2]],{type:"Sphere"});
    const gMap=s.append("g"), gPts=s.append("g"), gLab=s.append("g").attr("pointer-events","none");
    V.world().then(W=>{ worldMap(gMap,proj,W); });
    const len=proj([30.31,59.93]);
    gLab.append("circle").attr("cx",len[0]).attr("cy",len[1]).attr("r",3).attr("fill",C.blue);
    V.t(gLab,len[0]+6,len[1]-6,"Leningrad",{size:mob?11:12,weight:700,halo:3});
    const R=mob?4:6;
    const pts=gPts.selectAll("circle").data(P).join("circle").attr("cx",d=>proj(d.ll)[0]).attr("cy",d=>proj(d.ll)[1])
      .attr("r",R).attr("fill",d=>col(d.y)).attr("fill-opacity",.62).attr("stroke",d=>col(d.y)).attr("stroke-width",.8).style("mix-blend-mode",BLEND);
    // etiquetes de les grans regions (només escriptori)
    const REG=[["Afganistan, 1924",[66,33.5],"middle",18],["Mediterrani, 1926–27",[14,44],"middle",-14],["Abissínia, 1927",[38,10],"start",14],["Xina i Japó, 1929",[110,40],"middle",-16],["Amèrica, 1930–33",[-75,-22],"start",14]];
    if(!mob)REG.forEach(([t,ll,a,dy])=>{ const p=proj(ll); V.t(gLab,p[0]+(a==="start"?10:0),p[1]+dy,t,{anchor:a,size:11.5,fill:C.ink2,italic:true,halo:2.5}); });
    el.__set=(yr,instant)=>{ pts.interrupt().transition().duration(instant||V.reduced?0:380).attr("r",d=>d.y<=yr?R:0); };
    el.__set(year,true);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const vis=P.filter(d=>d.y<=year); const b=d3.least(vis,d=>{ const q=proj(d.ll); return (q[0]-px)**2+(q[1]-py)**2; });
      if(!b)return; const q=proj(b.ll); if((q[0]-px)**2+(q[1]-py)**2>900){ tp.hide(); V.focus(pts,null); return; }
      V.focus(pts,d=>d.y===b.y); tp.show(`<b>${b.n}</b> · expedició del ${b.y===1926?"1926–1927":b.y===1932?"1932–1933":b.y}: ${D.exp[b.y]}`); },()=>{ tp.hide(); V.focus(pts,null); });
    V.onView(el,instant=>{ if(instant)return; set(1916); setTimeout(start,500); },{threshold:.4});
  });
  function set(y){ year=y; rng.value=y; anyL.textContent=y; rng.setAttribute("aria-valuetext",String(y)); if(box.__set)box.__set(y); }
  function stop(){ playing=false; cancelAnimationFrame(raf); play.textContent="Reprodueix →"; }
  function start(){ if(year>=1933)set(1916); playing=true; play.textContent="Pausa"; let acc=0,last=0;
    const tick=now=>{ if(!playing)return; acc+=last?now-last:0; last=now; if(acc>700){ acc=0; const nx=EXPY.find(v=>v>year); if(!nx){ set(1933); stop(); return; } set(nx); } raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); }
  rng.addEventListener("input",()=>{ stop(); set(+rng.value); });
  play.addEventListener("click",()=>playing?stop():start());
})();

/* =====================================================================
   V2 · MAP-03 · ELS SET CENTRES D'ORIGEN DE VAVÍLOV (esquema)
   ===================================================================== */
(function centres(){
  const box=$("#centres-viz"); if(!box)return;
  const CEN=[
    {n:1,t:"Sud-asiàtic tropical",f:[["Índia",[78,21],1],["Indoxina i sud de la Xina",[104,18],.85],["Illes del sud-est asiàtic",[112,0],.8]]},
    {n:2,t:"Est-asiàtic",f:[["Xina",[112,34],1],["Japó",[137,36],.6]]},
    {n:3,t:"Sud-oest asiàtic",f:[["Caucas",[44,42],.6],["Àsia Menor, amb l'Iran, el nord de l'Afganistan i l'Àsia interior",[54,37],1],["Nord-oest de l'Índia, amb el sud de l'Afganistan, el Balutxistan i el Caixmir",[70,30],.7]]},
    {n:4,t:"Mediterrani",f:[["Mediterrani",[15,39],1]]},
    {n:5,t:"Abissini",f:[["Abissínia",[39,10],.8],["Iemen",[44.5,15],.45]]},
    {n:6,t:"Centreamericà",f:[["Sud de Mèxic",[-98,18],.75],["Amèrica Central",[-87,14],.65],["Antilles",[-72,19],.5]]},
    {n:7,t:"Andí",f:[["Andes (Perú, Bolívia, Equador)",[-73,-12],.9],["Xile (illa de Chiloé)",[-73.5,-42],.5],["Bogotà",[-74,4.7],.45]]}
  ];
  const lg=$("#centres-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.yellow,t:"Centre i focus (regió aproximada)",a:.6}]); }
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(w*(mob?.62:.5));
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Mapa del món amb els set centres on Vavílov (1940) creia que havien nascut les plantes cultivades: sud-asiàtic tropical, est-asiàtic, sud-oest asiàtic, mediterrani, abissini, centreamericà i andí. Segons ell, el 70 % de les espècies cultivades venen d'Àsia.");
    const proj=d3.geoEqualEarth().fitExtent([[2,2],[w-2,h-2]],{type:"Sphere"});
    const gMap=s.append("g"), g=s.append("g");
    V.world().then(W=>worldMap(gMap,proj,W));
    const R=w*(mob?.05:.042);
    const F=[]; CEN.forEach(c=>c.f.forEach(([t,ll,k])=>F.push({c,t,ll,k})));
    const circ=g.selectAll("circle.fc").data(F).join("circle").attr("class","fc").attr("cx",d=>proj(d.ll)[0]).attr("cy",d=>proj(d.ll)[1]).attr("r",0)
      .attr("fill",C.yellow).attr("fill-opacity",.5).style("mix-blend-mode",BLEND);
    g.selectAll("circle.dt").data(F).join("circle").attr("class","dt").attr("cx",d=>proj(d.ll)[0]).attr("cy",d=>proj(d.ll)[1]).attr("r",1.6).attr("fill",C.ink);
    // número de cada centre al seu primer focus
    CEN.forEach(c=>{ const p=proj(c.f[0][1]); const lab=mob?String(c.n):`${c.n}. ${c.t}`;
      const dx=c.n===6?-R:c.n===4?0:R*.2, a=c.n===6?"end":"middle", dy=c.n===4?-R*1.05:c.n===2?-R*1.1:c.n===7?R*1.6:R*1.25;
      V.t(g,p[0]+dx,p[1]+dy,lab,{anchor:a,size:mob?11.5:12.5,weight:700,halo:3}); });
    if(!mob){ V.lines(g,proj([150,-28])[0]-40,proj([150,-28])[1],[["~70 % de les espècies",true],["cultivades, d'Àsia;"],["~17 %, del Nou Món"],["(estimació de Vavílov, 1940)"]],{size:12,halo:3}); }
    V.onView(el,instant=>circ.transition().duration(instant?0:900).delay((d,i)=>instant?0:i*60).attr("r",d=>R*d.k));
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(F,d=>{ const q=proj(d.ll); return (q[0]-px)**2+(q[1]-py)**2; }); const q=proj(b.ll);
      if((q[0]-px)**2+(q[1]-py)**2>(R*1.4)**2){ tp.hide(); V.focus(circ,null); return; }
      V.focus(circ,d=>d.c===b.c); tp.show(`<b>Centre ${b.c.n}: ${b.c.t}</b> · focus: ${b.c.f.map(f=>f[0]).join(", ")}`); },()=>{ tp.hide(); V.focus(circ,null); });
  });
})();

/* =====================================================================
   V3 · PART-01 · LA COL·LECCIÓ DE VAVÍLOV (250 quadrets de 1.000 mostres)
   ===================================================================== */
(function col(){
  const box=$("#col-viz"); if(!box)return;
  const COLS=[C.yellow,C.red,C.redLight,C.blue,C.blueLight,C.yellowDark];
  const G=D.col.map((d,i)=>({t:d[0],n:d[1],c:COLS[i]})); const rest=D.colTotal-d3.sum(G,d=>d.n);
  G.push({t:"Altres conreus i plantes",n:rest,c:C.ghost});
  const lg=$("#col-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,G.map(g=>({c:g.c,t:`${g.t} (${f0(g.n*1000)})`,a:.85}))); }
  const cells=[]; G.forEach((g,gi)=>{ for(let k=0;k<g.n;k++)cells.push({g,gi}); });
  V.mount(box,(el,w)=>{
    const mob=w<640, cols=mob?15:25, gap=mob?2:3, sz=Math.min(mob?20:30,(w-(cols-1)*gap)/cols), rows=Math.ceil(cells.length/cols), h=rows*(sz+gap)+4;
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Reixa de 250 quadrets, cada un de 1.000 mostres: 36 de blat, 23 de lleguminoses, 23 de farratges, 18 d'hortalisses, 12 de fruiters, 10 de blat de moro i 128 d'altres conreus."), g=s.append("g");
    const x0=(w-(cols*(sz+gap)-gap))/2;
    const r=g.selectAll("rect").data(cells).join("rect").attr("x",(d,i)=>x0+(i%cols)*(sz+gap)).attr("y",(d,i)=>Math.floor(i/cols)*(sz+gap))
      .attr("width",sz).attr("height",sz).attr("rx",1.5).attr("fill",d=>d.g.c).attr("fill-opacity",0);
    V.onView(el,instant=>r.transition().duration(instant?0:500).delay((d,i)=>instant?0:i*5).attr("fill-opacity",d=>d.g.c===C.ghost?.55:.85));
    const tp=V.tip(el);
    r.on("pointerenter pointerdown",(ev,d)=>{ V.focus(r,o=>o.g===d.g); tp.show(`<b>${d.g.t}</b> · ${d.g.t.startsWith("Altres")?"la resta fins a 250.000":"més de "+f0(d.g.n*1000)} mostres a l'època de Vavílov`); })
     .on("pointerleave",ev=>{ if(ev.pointerType==="mouse"){ V.focus(r,null); tp.hide(); } });
  });
})();

/* =====================================================================
   V4 · MAP-01 + MAP-03 · LENINGRAD: EL SALVAMENT DE LA COL·LECCIÓ (scrolly)
   ===================================================================== */
(function ciutat(){
  const box=$("#ciutat-viz"), stepsEl=$("#s-ciutat .steps"); if(!box||!window.LEN_DEM)return;
  let cur=0;
  const LAKES={type:"MultiPolygon",coordinates:D.lakes.map(poly=>{ const f={type:"Polygon",coordinates:poly}; return d3.geoArea(f)>2*Math.PI?poly.map(r=>r.slice().reverse()):poly; })};
  const VIR=[30.3084,59.9318], PAV=[30.4328,59.6935], PUS=[30.3829,59.7189];
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.8,vh*.40):Math.min(w*.72,vh*.72));
    const st=stage(el,h);
    const proj=d3.geoMercator().fitExtent([[0,0],[w,h]],{type:"MultiPoint",coordinates:mob?[[29.6,59.45],[31.6,60.25]]:[[29.2,59.35],[32.4,60.75]]});
    const {ctx}=mkCanvas(st,w,h,"Mapa físic de la regió de Leningrad: la ciutat a la desembocadura del Neva, el golf de Finlàndia a l'oest, el llac Ladoga al nord-est i, al sud, Puixkin i Pavlovsk, a uns 25–30 km del centre.");
    relleu59(ctx,proj,w,h,window.LEN_DEM,{iso:[50,100,150],lakes:LAKES,rivers:{type:"MultiLineString",coordinates:D.rivers},fade:"nes",fadeK:.06});
    const s=overlay(st,w,h), g=s.append("g");
    [["Golf de Finlàndia",[mob?29.95:29.75,60.1]],["Llac Ladoga",[31.55,60.55]],["Neva",[30.82,59.9]]].forEach(([t,ll])=>{ const p=proj(ll); if(p[0]<50||p[0]>w-50||p[1]<10||p[1]>h-10)return;
      V.t(g,p[0],p[1],t,{italic:true,size:mob?11:12,fill:t==="Neva"?C.blue:C.muted,anchor:"middle",halo:2.5}); });
    // escala 20 km
    { const lat=59.4, a=proj([29.6,lat]), b=proj([29.6+20/(111.32*Math.cos(lat*Math.PI/180)),lat]), x=mob?8:14, y=h-(mob?8:14), px=b[0]-a[0];
      g.append("path").attr("d",`M${x},${y-4}V${y}H${x+px}V${y-4}`).attr("fill","none").attr("stroke",C.ink2); V.t(g,x+px+6,y+1,"20 km",{size:V.FS.small,fill:C.ink2,halo:true}); }
    const L={city:g.append("g"),pav:g.append("g"),siege:g.append("g"),evac:g.append("g"),sow:g.append("g"),pin:g.append("g")};
    const pv=proj(VIR), pp=proj(PAV), pu=proj(PUS);
    // l'institut
    L.pin.append("circle").attr("cx",pv[0]).attr("cy",pv[1]).attr("r",mob?9:13).attr("fill",C.blue).attr("fill-opacity",.28).style("mix-blend-mode",BLEND);
    L.pin.append("circle").attr("cx",pv[0]).attr("cy",pv[1]).attr("r",3.2).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",1.2);
    V.note(L.pin,{x:pv[0]-4,y:pv[1]-4,tx:pv[0]-(mob?30:60),ty:pv[1]-(mob?26:44),anchor:"end",lines:mob?[["VIR",true]]:[["VIR, plaça de Sant Isaac",true],["la seu de la col·lecció"]],size:mob?11.5:12.5});
    // Pavlovsk i Pushkin
    [[pu,"Puixkin","end",-7],[pp,"Pavlovsk","start",7]].forEach(([p,t,a,dx])=>{ L.pav.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",2.6).attr("fill",C.ink);
      V.t(L.pav,p[0]+dx,p[1]+4,t,{anchor:a,size:mob?11.5:12.5,weight:600,halo:3}); });
    const curve=(a,b,k)=>{ const mx=(a[0]+b[0])/2+(b[1]-a[1])*k, my=(a[1]+b[1])/2-(b[0]-a[0])*k; return `M${a[0]},${a[1]}Q${mx},${my} ${b[0]},${b[1]}`; };
    const rescue=L.pav.append("path").attr("d",curve(pp,pv,.25)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.6).attr("stroke-dasharray","5 4");
    if(!mob)V.lines(L.pav,pp[0]+14,pp[1]+22,[["Agost del 1941",true],["6.000 varietats de patata,"],["salvades sota el foc"]],{size:12,halo:3});
    // la ciutat encerclada
    L.siege.append("circle").attr("cx",pv[0]).attr("cy",pv[1]).attr("r",mob?24:40).attr("fill",C.red).attr("fill-opacity",DARK?.3:.16).style("mix-blend-mode",BLEND);
    V.t(L.siege,pv[0]+(mob?26:44),pv[1]+(mob?30:52),"Leningrad, encerclada",{size:mob?11.5:12.5,weight:700,halo:3,fill:C.red});
    // evacuació: el vagó i l'avió cap a Krasnoufimsk (fora del mapa, a l'est)
    const ex=[w-(mob?8:16),pv[1]-(mob?6:10)];
    L.evac.append("path").attr("d",curve(pv,ex,-.12)).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",1.4).attr("stroke-dasharray","2 4").attr("marker-end",null);
    L.evac.append("path").attr("d",`M${ex[0]-8},${ex[1]-5}L${ex[0]},${ex[1]}L${ex[0]-8},${ex[1]+5}`).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",1.4);
    V.lines(L.evac,ex[0]-4,ex[1]-(mob?30:44),mob?[["Krasnoufimsk →",true],["40.000 paquets"]]:[["Cap a Krasnoufimsk (Urals),",true],["a uns 1.600 km: una petita part i"],["40.000 paquets en avió"]],{size:mob?11:12,anchor:"end",halo:3});
    // les sembres als afores: un camp de cereals (vegetació en verd)
    const field=L.sow.append("g");
    const rnd=V.rng(1943), fx=pv[0]+(mob?-46:-110), fy=pv[1]+(mob?30:44);
    for(let i=0;i<(mob?30:60);i++){ const a=rnd()*Math.PI*2, r=Math.sqrt(rnd())*(mob?9:15);
      field.append("circle").attr("cx",fx+Math.cos(a)*r*1.5).attr("cy",fy+Math.sin(a)*r).attr("r",mob?1.4:2).attr("fill",C.green).attr("stroke",C.greenDark).attr("stroke-width",.5).attr("fill-opacity",.85); }
    V.lines(L.sow,fx,fy+(mob?20:30),mob?[["Sembres",true],["1942–1943"]]:[["Sembres de 1942 i 1943",true],["camps dels afores (situació aproximada)"]],{size:mob?11:12,anchor:"middle",halo:3});
    el.__set=(k,instant)=>{
      const T=instant||V.reduced?0:650, vis=(sel,on)=>sel.interrupt().transition().duration(T).style("opacity",on?1:0);
      vis(L.pav,k>=1); vis(L.siege,k>=2); vis(L.evac,k===3); vis(L.sow,k===4);
      if(k===1&&T){ const len=rescue.node().getTotalLength(); rescue.attr("stroke-dasharray",`${len}`).attr("stroke-dashoffset",len).transition().duration(1400).attr("stroke-dashoffset",0).on("end",()=>rescue.attr("stroke-dasharray","5 4")); }
    };
    el.__set(cur,true);
  });
  IB.scrolly(stepsEl,$("#s-ciutat .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V5 · TIME-01 + CASE-01 · PA DE CADA DIA (racions oficials)
   ===================================================================== */
(function racio(){
  const box=$("#racio-viz"); if(!box)return;
  const R=D.racions, COL=[C.red,C.ink2,C.blue,C.yellow], END=new Date(Date.UTC(1942,1,21));
  const rows=R.rows.map(r=>({d:new Date(r[0]+"T00:00:00Z"),v:r.slice(1)}));
  const lg=$("#racio-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,R.cats.map((t,i)=>({c:COL[i],t,kind:"line",w:i===3?3:2}))); }
  let sel=-1;
  V.mount(box,(el,w)=>{
    const mob=w<640, m={l:mob?36:48,r:mob?10:160,t:16,b:24}, hS=mob?240:300, hB=mob?150:118, h=hS+hB+20;
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Gràfic en esglaons de la ració oficial de pa a Leningrad del 18 de juliol de 1941 a l'11 de febrer de 1942: els treballadors manuals passen de 800 a 250 grams i la resta de 400–600 a 125 grams el 20 de novembre de 1941; després torna a pujar. A sota, les calories de la ració completa del 20 de novembre per categoria."), g=s.append("g");
    const x=d3.scaleUtc([new Date(Date.UTC(1941,6,10)),END],[m.l,w-m.r]), y=d3.scaleLinear([0,850],[hS-m.b,m.t]);
    [0,200,400,600,800].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,y(v)+4,v?f0(v)+(v===800?" g":""):"0",{anchor:"end",size:V.FS.small,fill:C.muted}); });
    const TK=[[1941,7,"ag."],[1941,9,"oct."],[1941,11,"des."],[1942,1,"febr."]];
    TK.forEach(([yy,mm,t])=>V.t(g,x(new Date(Date.UTC(yy,mm,1))),hS-6,mob&&mm===9?"":t+" "+(mm===7||yy===1942&&mm===1?yy:""),{anchor:"middle",size:V.FS.small,fill:C.muted}));
    // franja del mínim
    const n20=rows.find(r=>r.d.getUTCMonth()===10&&r.d.getUTCDate()===20), n25=rows.find(r=>r.d.getUTCMonth()===11);
    g.append("rect").attr("x",x(n20.d)).attr("width",x(n25.d)-x(n20.d)).attr("y",m.t).attr("height",hS-m.b-m.t).attr("fill",C.red).attr("fill-opacity",.07);
    const step=i=>{ const pts=[]; rows.forEach((r,k)=>{ pts.push([x(r.d),y(r.v[i])]); const nx=k<rows.length-1?rows[k+1].d:END; pts.push([x(nx),y(r.v[i])]); }); return d3.line()(pts); };
    // el groc (infants) va a sota i més gruixut perquè no tapi les línies que coincideixen
    const lines=g.append("g").selectAll("path").data([3,2,1,0]).join("path").attr("d",step).attr("fill","none")
      .attr("stroke",i=>COL[i]).attr("stroke-width",i=>i===3?6:2).attr("stroke-linejoin","round").attr("stroke-opacity",i=>i===3?.7:.92);
    // etiquetes directes a la dreta
    if(!mob){ const ly=R.cats.map((t,i)=>({i,y:y(rows[rows.length-1].v[i])}));
      ly.sort((a,b)=>a.y-b.y).forEach((o,k,arr)=>{ if(k&&o.y-arr[k-1].y<15)o.y=arr[k-1].y+15; });
      ly.forEach(o=>V.t(g,w-m.r+8,o.y+4,["Treballadors manuals","Oficinistes","Persones a càrrec","Infants (< 12 anys)"][o.i],{size:12,fill:C.ink,weight:600})); }
    V.note(g,{x:x(n20.d)+6,y:y(125)+2,tx:mob?x(n20.d)-8:x(n20.d)+60,ty:y(125)+(mob?34:40),kind:"straight",anchor:mob?"end":"start",lines:[["20 de novembre de 1941",true],["125 g; treballadors, 250 g"]],size:mob?11.5:12.5});
    // barres de calories del 20 de novembre
    const gB=g.append("g").attr("transform",`translate(0,${hS+14})`), xb=d3.scaleLinear([0,1200],[mob?m.l+70:m.l+150,w-m.r-(mob?40:0)]);
    V.t(gB,m.l,0,"Calories de la ració completa, 20 de novembre de 1941",{size:12,weight:600,fill:C.ink2});
    R.cats.forEach((t,i)=>{ const yy=16+i*(mob?32:24);
      V.t(gB,mob?m.l-30:m.l,yy+4,mob?["Manuals","Oficinistes","A càrrec","Infants"][i]:["Treballadors manuals","Oficinistes","Persones a càrrec","Infants (< 12 anys)"][i],{size:11.5,fill:C.ink});
      gB.append("line").attr("x1",xb(0)).attr("x2",xb(R.kcal20nov[i])).attr("y1",yy).attr("y2",yy).attr("stroke",COL[i]).attr("stroke-width",i===3?3:2);
      gB.append("circle").attr("cx",xb(R.kcal20nov[i])).attr("cy",yy).attr("r",4).attr("fill",COL[i]);
      V.t(gB,xb(R.kcal20nov[i])+8,yy+4,`${f0(R.kcal20nov[i])} kcal`,{size:11.5,fill:C.ink2}); });
    const focus=()=>lines.attr("stroke-opacity",i=>sel<0||sel===i?(i===3?.7:.92):.15);
    el.__sel=k=>{ sel=k; focus(); }; focus();
    const tp=V.tip(el), H=g.append("g").attr("pointer-events","none"), hit=s.append("rect").attr("width",w).attr("height",hS).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ const d=x.invert(px); let r=rows[0]; rows.forEach(q=>{ if(q.d<=d)r=q; });
      H.selectAll("*").remove(); H.append("line").attr("x1",x(r.d)).attr("x2",x(r.d)).attr("y1",m.t).attr("y2",hS-m.b).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
      r.v.forEach((v,i)=>{ if(sel>=0&&sel!==i)return; H.append("circle").attr("cx",x(r.d)).attr("cy",y(v)).attr("r",3.6).attr("fill",COL[i]).attr("stroke",C.paper).attr("stroke-width",1.2); });
      tp.show(`<b>Des del ${fDate(r.d)}</b> · ${R.cats.map((t,i)=>`${["manuals","oficinistes","persones a càrrec","infants"][i]} ${r.v[i]} g`).join(", ")}`);
    },()=>{ tp.hide(); H.selectAll("*").remove(); });
  });
  document.querySelectorAll("#racio-seg button").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("#racio-seg button").forEach(o=>o.setAttribute("aria-pressed",o===b)); if(box.__sel)box.__sel(+b.dataset.k); }));
})();

/* =====================================================================
   V6 · SPREAD-01 · QUANTS VAN MORIR? (tres mínims publicats)
   ===================================================================== */
(function morts(){
  const box=$("#morts-viz"); if(!box)return;
  const S=[
    {v:30,t:"Més de 30",s:"investigadors perduts la primera tardor: bombes, fam i front",f:"Loskutov (1999)",lab:"bombes, fam i front"},
    {v:20,t:"Més de 20",s:"científics i especialistes morts per salvar la col·lecció",f:"Loskutov (2021, 2025)"},
    {v:19,t:"Almenys 19",s:"botànics morts dins de l'institut amb menjar a l'abast",f:"Parkin (2024)"}
  ];
  V.mount(box,(el,w)=>{
    const mob=w<640, rh=mob?78:62, m={l:mob?8:300,r:mob?20:30,t:30,b:26}, h=m.t+S.length*rh+m.b;
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Tres xifres mínimes de treballadors de l'institut morts durant el setge: més de 30 (Loskutov 1999), més de 20 (Loskutov 2021) i almenys 19 (Parkin 2024)."), g=s.append("g");
    const x=d3.scaleLinear([0,45],[m.l,w-m.r]);
    [0,10,20,30,40].forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t-6).attr("y2",h-m.b).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8); V.t(g,x(v),h-8,v+(v===40?" persones":""),{anchor:"middle",size:V.FS.small,fill:C.muted}); });
    const gid="lm"+Math.random().toString(36).slice(2,6), df=s.append("defs").append("linearGradient").attr("id",gid);
    df.append("stop").attr("offset","0%").attr("stop-color",C.red).attr("stop-opacity",.5); df.append("stop").attr("offset","100%").attr("stop-color",C.red).attr("stop-opacity",0);
    const rows=g.selectAll("g.r").data(S).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${m.t+rh*(i+(mob?.62:.5))})`);
    rows.append("rect").attr("class","lens").attr("x",d=>x(d.v)).attr("y",-7).attr("height",14).attr("rx",7).attr("width",0).attr("fill",`url(#${gid})`);
    rows.append("circle").attr("cx",d=>x(d.v)).attr("r",5.5).attr("fill",C.red).attr("stroke",C.paper).attr("stroke-width",1.5);
    rows.append("text").attr("x",d=>x(d.v)-10).attr("y",4).attr("text-anchor","end").attr("font-size",13).attr("font-weight",700).attr("fill",C.ink).attr("font-family",V.SANS).text(d=>d.t).call(V.halo,3);
    rows.each(function(d){ const r=d3.select(this);
      if(mob){ const cut=d.s.lastIndexOf(" ",44); V.lines(r,m.l,-rh*.52,[[`${d.f}: ${d.s.slice(0,cut)}`],[d.s.slice(cut+1)]],{size:11,fill:C.ink2,halo:3}); }
      else { const cut=d.s.lastIndexOf(" ",34); V.lines(r,m.l-24,-10,[[d.f,true],[d.s.slice(0,cut)],[d.s.slice(cut+1)]],{anchor:"end",size:11.5}); } });
    rows.filter(d=>d.lab).append("text").attr("x",d=>x(d.v)+10).attr("y",-12).attr("font-size",11.5).attr("fill",C.red).attr("font-family",V.SANS).attr("font-style","italic").text(d=>d.lab).call(V.halo,3);
    V.onView(el,instant=>rows.select(".lens").transition().duration(instant?0:900).delay((d,i)=>instant?0:i*150).attr("width",d=>x(d.v+12)-x(d.v)));
    const tp=V.tip(el);
    rows.on("pointerenter pointerdown",(ev,d)=>{ V.focus(rows,o=>o===d); tp.show(`<b>${d.t}</b> · ${d.s} · ${d.f}`); }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse"){ V.focus(rows,null); tp.hide(); } });
  });
})();

/* =====================================================================
   V7 · PART-06 · QUI GUARDA LLAVORS A L'ÀRTIC (scrolly)
   ===================================================================== */
(function volta(){
  const box=$("#volta-viz"), stepsEl=$("#s-volta .steps"); if(!box)return;
  let cur=0;
  const P=D.dip.map(([a,code,n,tx,name])=>({a,code,n,tx,name,cc:code.slice(0,3)}));
  const ON=[()=>true,d=>d.n>=50000,d=>d.a==="ICARDA",d=>d.a==="VIR",d=>d.a==="PdeP"||d.code==="USA1005"];
  const lg=$("#volta-lg"); if(lg){ lg.innerHTML=""; V.legendSize(lg,{title:"Mostres guardades",values:[10000,100000],r:d3.scaleSqrt([0,190453],[0,40]),f:f0}); }
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800, S=Math.round(Math.min(w,mob?vh*.42:vh*.7));
    const h=S, st=stage(el,h);
    const root=d3.pack().size([S-4,S-4]).padding(1.5)(d3.hierarchy({children:P}).sum(d=>d.n).sort((a,b)=>b.value-a.value));
    const ox=(w-S)/2+2, oy=2;
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Constel·lació de 135 cercles, un per cada institució que ha dipositat llavors a la Volta de Svalbard, amb l'àrea proporcional a les mostres: des del CIMMYT, amb 190.453, fins a la Nació Cherokee, amb 9.");
    const g=s.append("g").attr("transform",`translate(${ox},${oy})`);
    const nodes=g.selectAll("circle").data(root.leaves()).join("circle").attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",d=>Math.max(1.4,d.r))
      .attr("fill",C.blue).attr("fill-opacity",.35).attr("stroke",C.blue).attr("stroke-width",.6).attr("stroke-opacity",.6).style("mix-blend-mode",BLEND);
    const gL=g.append("g").attr("pointer-events","none");
    const label=(d,lines,dir)=>{ const r=Math.max(2,d.r); const tx=d.x+(dir[0]||0), ty=d.y+(dir[1]||0);
      gL.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",r+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
      if(Math.hypot(dir[0]||0,dir[1]||0)>r+4)gL.append("line").attr("x1",d.x).attr("y1",d.y).attr("x2",tx).attr("y2",ty).attr("stroke",C.ink).attr("stroke-width",.8);
      V.lines(gL,tx+(dir[0]<0?-4:4),ty+(dir[1]<0?-14:10),lines,{size:mob?11:12.5,anchor:dir[0]<0?"end":"start",halo:3}); };
    el.__set=(k)=>{
      const on=ON[k]||ON[0];
      nodes.transition().duration(V.reduced?0:500).attr("fill-opacity",d=>k===0?.35:on(d.data)?.75:.12).attr("fill",d=>k>0&&on(d.data)?(k===4?C.red:C.blue):C.blue);
      gL.selectAll("*").remove();
      const L=root.leaves(), find=f=>L.filter(d=>f(d.data));
      // a mòbil, l'etiqueta va cap a dins del gràfic perquè no surti de la pantalla
      const side=d=>((d.x<S/2)!==mob)?[-(d.r+(mob?16:28)),0]:[d.r+(mob?16:28),0];
      if(k===1)find(d=>d.n>=100000).forEach(d=>V.t(gL,d.x,d.y+4,d.data.a,{anchor:"middle",size:mob?11:12.5,weight:700,halo:3}));
      if(k===2)find(ON[2]).forEach(d=>label(d,[[`ICARDA (${d.data.cc==="SYR"?"Síria":"Líban"})`,true],[`${f0(d.data.n)} mostres`]],side(d)));
      if(k===3)find(ON[3]).forEach(d=>label(d,[["VIR, Sant Petersburg",true],[`${f0(d.data.n)} mostres`]],side(d)));
      if(k===4)find(ON[4]).forEach((d,i)=>label(d,[[d.data.a==="PdeP"?"Parque de la Papa":"Nació Cherokee",true],[`${f0(d.data.n)} mostres`]],[side(d)[0],i?24:-24]));
    };
    el.__set(cur);
    const tp=V.tip(el);
    nodes.on("pointerenter pointerdown",(ev,d)=>{ tp.show(`<b>${d.data.name}</b> (${d.data.a}, ${d.data.cc}) · ${f0(d.data.n)} mostres de ${f0(d.data.tx)} tàxons`); })
      .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")tp.hide(); });
  });
  IB.scrolly(stepsEl,$("#s-volta .graphic"),i=>{ cur=i; if(box.__set)box.__set(i); });
})();

/* =====================================================================
   V8 · LINK-03 · ANADA I TORNADA D'ALEP (flux sobre eix de temps)
   ===================================================================== */
(function retorn(){
  const box=$("#retorn-viz"); if(!box)return;
  const F=[
    {a:2008,b:2014.9,v:116484,dir:1,t:"Còpies dipositades",s:"2008–2014",c:C.blue},
    {a:2015.7,b:2015.9,v:38073,dir:-1,t:"1a retirada",s:"setembre del 2015, al Líban i al Marroc",c:C.red},
    {a:2017.1,b:2017.7,v:20000,dir:1,t:"Llavors noves",s:"2017, més de 20.000",c:C.blue},
    {a:2017.75,b:2017.95,v:54354,dir:-1,t:"2a retirada",s:"2017",c:C.red}
  ];
  const lg=$("#retorn-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Cap a Svalbard",a:.5},{c:C.red,t:"De Svalbard cap a ICARDA",a:.5}]); }
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, h=mob?340:310, m={l:mob?10:120,r:mob?64:120};
    const st=stage(el,h);
    const yTop=mob?64:56, yBot=h-(mob?66:58), k=(mob?.00028:.00036);
    // eix trencat: 2008–2014 comprimit, 2015–2018 ampliat (es diu a l'eix)
    const W0=m.l, W1=w-m.r, xs=W0+(W1-W0)*(mob?.36:.34);
    const x=d3.scaleLinear([2007.6,2015.2,2018.1],[W0,xs,W1]);
    const {ctx}=mkCanvas(st,w,h,null);
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Flux de mostres de llavors entre ICARDA i la Volta de Svalbard: 116.484 dipositades del 2008 al 2014, 38.073 retirades el 2015, més de 20.000 tornades el 2017 i 54.354 retirades el 2017.");
    const g=s.append("g");
    [[yTop,"Volta de Svalbard (Noruega)",C.blue],[yBot,mob?"ICARDA (Alep, després Líban i Marroc)":"ICARDA: Alep (Síria), després el Líban i el Marroc",C.ink]].forEach(([yy,t,c])=>{
      g.append("line").attr("x1",x(2007.7)).attr("x2",x(2018.1)).attr("y1",yy).attr("y2",yy).attr("stroke",c).attr("stroke-width",1.4).attr("stroke-opacity",.7);
      V.t(g,x(2007.7),yy+(yy===yTop?-10:22),t,{size:mob?11.5:12.5,weight:700,fill:C.ink,halo:3}); });
    (mob?[2008,2014,2016,2018]:[2008,2010,2012,2014,2015,2016,2017,2018]).forEach(v=>V.t(g,x(v),h-6,v,{anchor:"middle",size:V.FS.small,fill:C.muted}));
    V.t(g,xs,h-20,"//",{anchor:"middle",size:11,fill:C.muted});
    const band=f=>{ const wv=f.v*k, x0=x(f.a), x1=x(f.b), y0=f.dir>0?yBot:yTop, y1=f.dir>0?yTop:yBot, ym=(y0+y1)/2;
      return `M${x0},${y0}C${x0},${ym} ${x1-wv},${ym} ${x1-wv},${y1}L${x1},${y1}C${x1},${ym} ${x0+wv},${ym} ${x0+wv},${y0}Z`; };
    F.forEach(f=>{ f.w=f.v*k; f.x0=x(f.a); f.x1=Math.max(x(f.b),f.x0+f.w+4); });
    g.insert("g",":first-child").selectAll("path").data(F).join("path").attr("d",band).attr("fill",f=>f.c).attr("fill-opacity",DARK?.34:.16).style("mix-blend-mode",BLEND);
    const ym=(yTop+yBot)/2, LB=[
      {x:(F[0].x0+F[0].x1)/2-8,y:ym+14,a:"end",t:[[f0(F[0].v),true],[mob?"dipositades":"còpies dipositades, 2008–2014"]]},
      {x:F[1].x0-6,y:yTop+30,a:"end",t:[[f0(F[1].v),true],[mob?"1a retirada":"1a retirada, set. 2015"]]},
      {x:F[2].x1+6,y:yBot-44,a:"start",t:[[`més de ${f0(F[2].v)}`,true],[mob?"tornen":"llavors noves, 2017"]]},
      {x:F[3].x1+6,y:yTop+30,a:"start",t:[[f0(F[3].v),true],[mob?"2a retirada":"2a retirada, 2017"]]}];
    LB.forEach(o=>V.lines(g,o.x,o.y,o.t,{size:mob?11:12,anchor:o.a,halo:3}));
    // partícules lentes
    const rnd=V.rng(2015);
    F.forEach(f=>{ f.P=d3.range(Math.round(f.v/(mob?2500:1400))).map(()=>({t:rnd(),o:rnd(),sp:(.8+rnd()*.5)/26000})); });
    const bez=(p0,p1,p2,p3,t)=>{ const u=1-t; return u*u*u*p0+3*u*u*t*p1+3*u*t*t*p2+t*t*t*p3; };
    el.__loop=V.loop(el,(t,dt)=>{ ctx.clearRect(0,0,w,h);
      F.forEach(f=>{ const y0=f.dir>0?yBot:yTop, y1=f.dir>0?yTop:yBot, ym=(y0+y1)/2; ctx.fillStyle=f.c;
        f.P.forEach(p=>{ p.t=(p.t+dt*p.sp)%1; const off=p.o*f.w;
          const px=bez(f.x0+off,f.x0+off,f.x1-f.w+off,f.x1-f.w+off,p.t), py=bez(y0,ym,ym,y1,p.t);
          ctx.globalAlpha=.7*Math.min(1,p.t/.08,(1-p.t)/.08); ctx.beginPath(); ctx.arc(px,py,mob?1:1.3,0,6.2832); ctx.fill(); }); });
      ctx.globalAlpha=1; });
  });
})();

})();
