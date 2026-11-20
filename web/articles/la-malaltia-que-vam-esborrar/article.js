/* «La malaltia que vam esborrar» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-mil     MAP-03 + MAP-12  Mil anys abans de la vacuna (scrolly)
   V3 #f-casos   TIME-04          Casos notificats 1967–1977 (dades reals)
   V4 #s-setge   MAP-03           Països amb verola endèmica (scrolly, dades reals)
   V5 #f-anell   MAP-16           Vacunació massiva o en anell (simulació)
   V6 #s-merca   MAP-01 + MAP-03  Somàlia, 1977 (scrolly, relleu)
   V7 #f-mans    SCALE-02         Dosis i persones (dades reals)
   V8 #f-agulla  HOW-01 + PART-01 L'agulla bifurcada
   Colors: vermell = la malaltia; blau = la protecció; groc només en superfícies. */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.VE_DATA;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
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

/* ---------- món ---------- */
// projecció Equal Earth ajustada a l'amplada, retallant els pols (de 56° S a 76° N)
function worldProj(w,maxH,pad){
  pad=pad==null?6:pad;
  const pts=[]; for(let lon=-180;lon<=180;lon+=5){ pts.push([lon,-56],[lon,76]); }
  const p=d3.geoEqualEarth().fitWidth(w-pad*2,{type:"MultiPoint",coordinates:pts});
  const b=d3.geoPath(p).bounds({type:"MultiPoint",coordinates:pts});
  const h=Math.round(Math.min(maxH,b[1][1]-b[0][1]+pad*2));
  p.translate([p.translate()[0]-b[0][0]+pad, p.translate()[1]-b[0][1]+pad-((b[1][1]-b[0][1]+pad*2)-h)/2]);
  return {p,h};
}
function drawLand(g,path,W,fill){
  g.append("path").datum(W.land).attr("d",path).attr("fill",fill||C.land);
  g.append("path").datum(W.borders).attr("d",path).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.6);
}
// punt amb cercle translúcid
function dot(g,p,o){ o=o||{};
  const q=g.append("g").attr("transform",`translate(${p[0]},${p[1]})`);
  q.append("circle").attr("r",o.r||14).attr("fill",o.c||C.red).attr("fill-opacity",o.a==null?.26:o.a).style("mix-blend-mode",BLEND);
  q.append("circle").attr("r",2.6).attr("fill",C.ink);
  return q; }

/* =====================================================================
   V1 · MAP-03 + MAP-12 · MIL ANYS ABANS DE LA VACUNA (scrolly)
   ===================================================================== */
(function mil(){
  const box=$("#mil-viz"), stepsEl=$("#s-mil .steps"); if(!box)return;
  let cur=0;
  const PL={
    omei:{ll:[103.33,29.54],t:"Muntanya Emei",s:"pel nas, segons la tradició"},
    bengala:{ll:[88.36,22.57],t:"Bengala",s:"la tika, a la pell"},
    garamant:{ll:[13.0,25.5],t:"Àfrica",s:"origen d'Onesimus, discutit"},
    boston:{ll:[-71.06,42.36],t:"Boston, 1721",s:""},
    istanbul:{ll:[28.98,41.01],t:"Constantinoble",s:""},
    londres:{ll:[-0.13,51.51],t:"Londres, 1721",s:""},
    berkeley:{ll:[-2.46,51.69],t:"Berkeley, 1796",s:"Jenner"},
    coruna:{ll:[-8.41,43.35],t:"La Corunya",s:"30-11-1803"},
    tenerife:{ll:[-16.25,28.47],t:"Canàries",s:""},
    caracas:{ll:[-66.91,10.51],t:"Caracas",s:""},
    mexic:{ll:[-99.15,19.32],t:"Mèxic",s:""},
    manila:{ll:[120.98,14.59],t:"Manila",s:""},
    macau:{ll:[113.55,22.18],t:"Macau i Canton",s:"1805"},
    bogota:{ll:[-74.08,4.65],t:"Bogotà",s:""},
    quito:{ll:[-78.51,-0.22],t:"Quito",s:""},
    lima:{ll:[-77.03,-12.05],t:"Lima",s:""},
    cocha:{ll:[-66.16,-17.39],t:"Cochabamba",s:"mort de Salvany, 1810"}
  };
  const STEP=[
    {pts:["omei"],arcs:[]},
    {pts:["omei","bengala"],arcs:[]},
    {pts:["garamant","boston"],arcs:[["garamant","boston","red"]]},
    {pts:["istanbul","londres","boston"],arcs:[["istanbul","londres","red"]]},
    {pts:["berkeley"],arcs:[]},
    {pts:["coruna","tenerife","caracas","mexic","manila","macau","bogota","quito","lima","cocha"],
     arcs:[["coruna","tenerife","blue"],["tenerife","caracas","blue"],["caracas","mexic","blue"],["mexic","manila","blue"],["manila","macau","blue"],["caracas","bogota","blue"],["bogota","quito","blue"],["quito","lima","blue"],["lima","cocha","blue"]]}
  ];
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, vh=window.innerHeight||800;
    const {p,h}=worldProj(w,mob?Math.min(w*.62,vh*.4):Math.min(w*.56,vh*.7));
    const st=stage(el,h), path=d3.geoPath(p); st.style.overflow="hidden";
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Mapa del món amb els llocs on es va practicar la variolació (Xina, Índia, Àfrica, Imperi otomà), la seva arribada a Londres i Boston el 1721, el descobriment de la vacuna a Berkeley el 1796 i la ruta de l'expedició Balmis-Salvany entre el 1803 i el 1810.");
    const gl=s.append("g"), ga=s.append("g"), gp=s.append("g");
    const {ctx}=mkCanvas(st,w,h,null); ctx.canvas.style.pointerEvents="none";
    V.world().then(W=>{ drawLand(gl,path,W); el.__set&&el.__set(cur,true); });
    const P=k=>p(PL[k].ll);
    // arcs (cercle màxim) com a llistes de punts projectats, tallant on el mapa es parteix
    function arcPts(a,b){ const it=d3.geoInterpolate(PL[a].ll,PL[b].ll), out=[]; let seg=[];
      for(let i=0;i<=80;i++){ const q=p(it(i/80)); if(seg.length&&Math.abs(q[0]-seg[seg.length-1][0])>w/3){ out.push(seg); seg=[]; } seg.push(q); }
      out.push(seg); return out; }
    const line=d3.line().curve(d3.curveCatmullRom.alpha(.5));
    let parts=[];
    el.__set=(k,instant)=>{
      const T=instant||V.reduced?0:700;
      const all=new Set(STEP.slice(0,k+1).flatMap(s=>s.pts)), now=new Set(STEP[k].pts);
      gp.selectAll("*").remove(); ga.selectAll("*").remove(); parts=[];
      all.forEach(key=>{ const q=P(key), on=now.has(key);
        const d=dot(gp,q,{r:on?(mob?10:15):6,c:key==="berkeley"?C.blue:(k===5&&on?C.blue:C.red),a:on?.3:.16});
        d.style("opacity",on?1:.55);
        if(on&&(!mob||["omei","bengala","boston","londres","istanbul","berkeley","coruna","manila","cocha","garamant"].includes(key))){
          const L=PL[key], left=q[0]>w*.72, dx=left?-12:12;
          V.t(gp,q[0]+dx,q[1]-3,L.t,{anchor:left?"end":"start",size:mob?11.5:12.5,weight:700,halo:3});
          if(L.s&&!mob)V.t(gp,q[0]+dx,q[1]+12,L.s,{anchor:left?"end":"start",size:11.5,fill:C.ink2,halo:3});
        }
      });
      STEP[k].arcs.forEach(([a,b,c])=>{ arcPts(a,b).forEach(seg=>{ if(seg.length<2)return;
        const pa=ga.append("path").attr("d",line(seg)).attr("fill","none").attr("stroke",c==="blue"?C.blue:C.red).attr("stroke-width",1.3).attr("stroke-opacity",.75).attr("stroke-dasharray","4 3");
        if(T){ const L=pa.node().getTotalLength(); pa.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L).transition().duration(1400).ease(d3.easeCubicOut).attr("stroke-dashoffset",0).on("end",function(){ d3.select(this).attr("stroke-dasharray","4 3"); }); }
        const n=Math.max(2,Math.round(seg.length/12)); for(let i=0;i<n;i++)parts.push({seg,t:i/n,c:c==="blue"?C.blue:C.red}); }); });
      if(k===5&&!mob){ const q=p([-42,19.5]), t=p([-40,4]); V.note(ga,{x:q[0],y:q[1]+3,tx:t[0],ty:t[1],anchor:"start",lines:[["Una cadena de nens",true],["la vacuna passava de braç a braç"]],size:12}); }
      if(k===3&&!mob){ const q=P("londres"); V.note(ga,{x:q[0]-2,y:q[1]-6,tx:q[0]-40,ty:q[1]-34,anchor:"end",lines:[["Mary Wortley Montagu",true],["la porta de Constantinoble"]],size:12}); }
    };
    el.__loop=V.loop(el,(t,dt)=>{ ctx.clearRect(0,0,w,h);
      for(const q of parts){ q.t=(q.t+dt/26000)%1; const f=q.t*(q.seg.length-1), i=Math.floor(f), u=f-i, a=q.seg[i], b=q.seg[Math.min(i+1,q.seg.length-1)];
        ctx.fillStyle=q.c; ctx.globalAlpha=.8*Math.min(1,q.t/.08,(1-q.t)/.08); ctx.beginPath(); ctx.arc(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,mob?1.6:2.1,0,6.2832); ctx.fill(); }
      ctx.globalAlpha=1; });
    el.__set(cur,true);
  });
  IB.scrolly(stepsEl,$("#s-mil .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V3 · TIME-04 · EL RIU DELS CASOS NOTIFICATS, 1967–1977 (dades reals)
   ===================================================================== */
(function casos(){
  const box=$("#casos-viz"); if(!box)return;
  const K=[["India","Índia",C.red],["Bangladesh","Bangladesh",C.redLight],["Pakistan","Pakistan",C.redDark],["Indonesia","Indonèsia",C.yellow],["Brazil","Brasil",C.blueLight],["Ethiopia","Etiòpia",C.blue],["Somalia","Somàlia",C.blueDark],["Resta","Resta del món",C.ghost]];
  const Y=D.cases.yrs, rows=Y.map((y,i)=>Object.assign({y},...K.map(([k])=>({[k]:D.cases.ser[k][i]||0}))));
  const st=d3.stack().keys(K.map(k=>k[0])).order(d3.stackOrderNone).offset(d3.stackOffsetNone)(rows);
  let mode="notificats", api=null;
  const lg=$("#casos-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,K.map(([k,t,c])=>({c,t,a:.85}))); }
  document.querySelectorAll('#f-casos .seg button').forEach(b=>b.addEventListener("click",()=>{ document.querySelectorAll('#f-casos .seg button').forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; api&&api.redraw(); }));
  api=V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, h=mob?330:400, m={t:26,r:mob?10:120,b:26,l:mob?44:58};
    const s=V.svg(el,w,h,"Gràfic de corrent apilat dels casos de verola notificats cada any entre el 1967 i el 1977 per país. El total baixa de 122.000 el 1967 a 33.000 el 1970, puja fins a 218.000 el 1974, quan es buscaven casos casa per casa a l'Índia, i cau a 954 el 1976 i 3.234 el 1977, tots a Somàlia."), g=s.append("g");
    const x=d3.scaleLinear([1967,1977],[m.l,w-m.r]);
    const big=mode==="estimats", yMax=big?15e6:240000;
    const y=d3.scaleLinear([0,yMax],[h-m.b,m.t]);
    const tks=big?[0,5e6,10e6,15e6]:[0,50000,100000,150000,200000];
    tks.forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,y(v)+4,big?(v?`${f0(v/1e6)} M`:"0"):(v>=1000?`${f0(v/1000)}.000`:"0"),{anchor:"end",size:V.FS.small,fill:C.muted}); });
    V.t(g,m.l,m.t-10,big?"Casos (milions)":"Casos notificats a l'OMS",{size:V.FS.small,fill:C.muted});
    [1967,1969,1971,1973,1975,1977].forEach(v=>V.t(g,x(v),h-6,v,{anchor:v===1967?"start":v===1977?"end":"middle",size:V.FS.small,fill:C.muted}));
    const area=d3.area().x((d,i)=>x(Y[i])).y0(d=>y(d[0])).y1(d=>y(d[1])).curve(d3.curveMonotoneX);
    const layers=g.append("g").selectAll("path").data(st).join("path").attr("fill",(d,i)=>K[i][2]).attr("fill-opacity",.82).attr("d",area);
    if(big){
      // estimació de Fenner per al 1967: 10–15 milions de casos reals (franja)
      g.append("rect").attr("x",x(1967)).attr("width",Math.max(14,(x(1968)-x(1967))*.45)).attr("y",y(15e6)).attr("height",y(10e6)-y(15e6)).attr("fill",C.red).attr("fill-opacity",.22).style("mix-blend-mode",BLEND);
      g.append("rect").attr("x",x(1967)).attr("width",Math.max(14,(x(1968)-x(1967))*.45)).attr("y",y(10e6)).attr("height",y(0)-y(10e6)).attr("fill",C.red).attr("fill-opacity",.1).style("mix-blend-mode",BLEND);
      V.note(g,{x:x(1967)+Math.max(14,(x(1968)-x(1967))*.45)+3,y:y(12.5e6),tx:x(1967)+(mob?50:90),ty:y(12.5e6)+(mob?30:10),kind:"straight",anchor:"start",lines:[["10–15 milions de casos reals el 1967",true],["estimació de l'OMS; en van arribar a notificar 122.000"]],size:mob?11.5:12.5});
      V.note(g,{x:x(1974),y:y(218326)-3,tx:x(1974)-(mob?20:40),ty:y(3e6),kind:"straight",anchor:"end",lines:[["El pic del 1974 hi és",true],["arran de terra"]],size:mob?11.5:12});
    } else if(!mob){
      V.note(g,{x:x(1974),y:y(218326)-2,tx:x(1974)-60,ty:y(232000),kind:"straight",anchor:"end",lines:[["218.326 casos el 1974",true],["epidèmies a l'Índia i el primer any sencer de cerques poble per poble"]],size:12.5});
      V.note(g,{x:x(1976)+2,y:y(954)-2,tx:x(1976)-10,ty:y(60000),kind:"straight",anchor:"end",lines:[["954 casos el 1976",true],["tots a Etiòpia i Somàlia"]],size:12});
      // etiquetes directes a les capes gruixudes
      st.forEach((L,i)=>{ const j=d3.maxIndex(L,d=>d[1]-d[0]), th=L[j][1]-L[j][0]; if(y(0)-y(th)<16)return; V.t(g,x(Y[j]),y((L[j][0]+L[j][1])/2)+4,K[i][1],{anchor:"middle",size:11.5,weight:600,halo:2.5}); });
    }
    const cur=g.append("line").attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2").style("opacity",0);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ const yr=clamp(Math.round(x.invert(px)),1967,1977), i=yr-1967;
      cur.attr("x1",x(yr)).attr("x2",x(yr)).style("opacity",1);
      const top=K.map(([k,t])=>[t,D.cases.ser[k][i]]).filter(d=>d[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3).map(d=>`${d[0]} ${f0(d[1])}`).join(", ")+(D.cases.ser.Bangladesh[i]==null?" · Bangladesh: sense dada":"");
      tp.show(`<b>${yr}: ${f0(D.cases.world[i])} casos notificats</b> · ${top}`); },()=>{ tp.hide(); cur.style("opacity",0); });
    V.onView(el,instant=>{ if(instant)return; layers.attr("transform",`translate(0,${h})`).transition().duration(900).delay((d,i)=>i*60).attr("transform","translate(0,0)"); });
  });
})();

/* =====================================================================
   V4 · MAP-03 · EL CERCLE ES VA ESTRÈNYER: PAÏSOS AMB VEROLA ENDÈMICA (scrolly, dades reals)
   ===================================================================== */
(function setge(){
  const box=$("#setge-viz"), stepsEl=$("#s-setge .steps"); if(!box)return;
  const KEYS=["1967","1972","1973","1975","1976","1977"], N=[31,10,6,4,1,1];
  const E=D.endemic, all=new Set(E["1967"].concat(E["1972"],E["1977"]));
  let cur=0;
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const {p,h}=worldProj(w,mob?Math.min(w*.62,vh*.4):Math.min(w*.56,vh*.7));
    const st=stage(el,h), path=d3.geoPath(p); st.style.overflow="hidden";
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Mapa del món amb els països on la verola era endèmica: 31 el 1967, 10 el 1972, 6 el 1973, 4 el 1975, només Etiòpia el 1976 i només Somàlia el 1977.");
    const gl=s.append("g"), gn=s.append("g");
    let C3=null;
    V.world().then(W=>{
      gl.append("path").datum(W.land).attr("d",path).attr("fill",C.land);
      C3=gl.append("g").selectAll("path").data(W.countries.features.filter(f=>all.has(String(f.id).padStart(3,"0")))).join("path").attr("d",path).attr("fill",C.land);
      gl.append("path").datum(W.borders).attr("d",path).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.6);
      el.__set(cur,true);
    });
    el.__set=(k,instant)=>{
      const T=instant||V.reduced?0:800, now=new Set(E[KEYS[k]]), was=new Set(KEYS.slice(0,k).flatMap(q=>E[q]));
      if(C3)C3.transition().duration(T).attr("fill",f=>{ const id=String(f.id).padStart(3,"0"); return now.has(id)?C.red:was.has(id)||E["1967"].includes(id)&&k>0?"#C9C6C0":C.land; })
        .attr("fill-opacity",f=>now.has(String(f.id).padStart(3,"0"))?.85:1);
      gn.selectAll("*").remove();
      const x0=mob?8:14, y0=mob?h-46:h-70;
      V.t(gn,x0,y0,`${N[k]} ${N[k]===1?"país":"països"}`,{size:mob?20:30,weight:700,serif:true,fill:C.red,halo:4});
      V.t(gn,x0,y0+(mob?18:24),k===0?"amb verola endèmica el gener del 1967":k===4?"amb verola endèmica a l'inici del 1976":k===5?"el 1977: l'últim focus del món":`amb verola endèmica a l'inici del ${KEYS[k]}`,{size:mob?11.5:13,fill:C.ink2,halo:3});
      if(k>0)V.t(gn,x0,y0+(mob?33:42),"en gris, els que ja se n'havien lliurat",{size:11.5,fill:C.muted,halo:3});
      if(k===3&&!mob){ const q=p([90.79,22.14]); V.note(gn,{x:q[0]+2,y:q[1]+2,tx:q[0]+40,ty:q[1]+56,anchor:"start",lines:[["Illa de Bhola, 16-10-1975",true],["Rahima Banu, 3 anys: l'últim"],["cas natural de verola major"]],size:12}); }
      if(k===5){ const q=p([44.77,1.71]); gn.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",3).attr("fill",C.ink);
        V.note(gn,mob?{x:q[0]-2,y:q[1]-2,tx:q[0]-14,ty:q[1]-44,anchor:"end",lines:[["Merca, 26-10-1977",true],["l'últim cas natural"]],size:11.5}:{x:q[0]+2,y:q[1]+2,tx:q[0]+44,ty:q[1]+50,anchor:"start",lines:[["Merca, 26-10-1977",true],["l'últim cas natural del món"]],size:12}); }
    };
    el.__set(cur,true);
  });
  IB.scrolly(stepsEl,$("#s-setge .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V5 · MAP-16 · VACUNAR-HO TOT O VACUNAR EN ANELL? (simulació)
   ===================================================================== */
(function anell(){
  const box=$("#anell-viz"), rng=$("#anell-rng"), play=$("#anell-play"), out=$("#anell-out");
  if(!box)return;
  let mode="massiva", cov=+rng.value, running=false, api=null;
  const BASE=.4, P_INF=.05, JUMP=.02, INF_DAYS=14, DETECT=5, RAD=2;
  const lg=$("#anell-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Vacunat",a:.45},{c:C.red,t:"Malalt ara",a:.9},{c:C.redDark,t:"Ja ha passat la malaltia",a:.45},{c:C.yellow,t:"Anell de vacunació",a:.8}]); }
  document.querySelectorAll('#f-anell .seg button').forEach(b=>b.addEventListener("click",()=>{ document.querySelectorAll('#f-anell .seg button').forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k;
    $("#anell-rngw").style.display=mode==="massiva"?"":"none"; box.__reset&&box.__reset(); start(); }));
  rng.addEventListener("input",()=>{ cov=+rng.value; $("#anell-n").textContent=`${cov} %`; rng.setAttribute("aria-valuetext",`${cov} % de cobertura`); box.__reset&&box.__reset(); });
  function start(){ running=true; play.textContent="Pausa"; }
  play.addEventListener("click",()=>{ if(running){ running=false; play.textContent="Continua →"; return; } if(box.__done)box.__reset(); start(); });
  api=V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, R=mob?8.5:10.5, dx=R*Math.sqrt(3), cols=Math.floor((w-R)/dx), rows=mob?22:24, h=Math.round(rows*R*1.5+R*1.2);
    const st=stage(el,h), {ctx}=mkCanvas(st,w,h,"Simulació d'un brot de verola en una quadrícula de pobles: amb vacunació massiva el brot s'atura si la cobertura és prou alta; amb vigilància i contenció s'atura vacunant només els anells al voltant dels casos detectats.");
    const cells=[]; for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push({r,c,x:R+c*dx+(r%2?dx/2:0),y:R+r*R*1.5});
    const idx=(r,c)=>(r<0||c<0||r>=rows||c>=cols)?-1:r*cols+c;
    const ax=(c,r)=>{ const xx=c-(r-(r&1))/2; return [xx,r,-xx-r]; };
    const hd=(o,q)=>{ const a=ax(o.c,o.r), b=ax(q.c,q.r); return Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]),Math.abs(a[2]-b[2])); };
    // contactes: els pobles a dues caselles o menys (18 veïns)
    cells.forEach(o=>{ o.nb=[]; for(let dr=-2;dr<=2;dr++)for(let dc=-3;dc<=3;dc++){ const i=idx(o.r+dr,o.c+dc); if(i>=0&&i!==idx(o.r,o.c)&&hd(o,cells[i])<=2)o.nb.push(i); } });
    const ring=o=>cells.filter(q=>hd(o,q)<=RAD);
    const hexP=new Path2D(); d3.range(6).forEach(i=>{ const a=Math.PI/180*(60*i-30), px=(R-.9)*Math.cos(a), py=(R-.9)*Math.sin(a); i?hexP.lineTo(px,py):hexP.moveTo(px,py); }); hexP.closePath();
    let S, rnd;
    function reset(){ rnd=V.rng(1967); S={day:0,cases:0,doses:0,acc:0};
      const c=mode==="massiva"?cov/100:BASE;
      cells.forEach(o=>{ o.st=rnd()<c?"V":"S"; o.t=0; o.det=false; o.flash=0; });
      if(mode==="massiva")S.doses=Math.round((cov/100-BASE)*cells.length);
      // tres brots inicials, sempre als mateixos llocs
      [[.3,.35],[.65,.6],[.5,.15]].forEach(([fr,fc])=>{ const o=cells[idx(Math.floor(rows*fr),Math.floor(cols*fc))]; o.st="I"; o.t=0; S.cases++; });
      el.__done=false; draw(); }
    function step(){ S.day++;
      const newI=[];
      cells.forEach(o=>{ if(o.st!=="I")return; const k=o.det?.15:1;
        o.nb.forEach(i=>{ const q=cells[i]; if(q.st==="S"&&rnd()<P_INF*k)newI.push(q); });
        // de tant en tant, un viatge porta el contagi lluny
        if(rnd()<JUMP*k){ const q=cells[Math.floor(rnd()*cells.length)]; if(q.st==="S")newI.push(q); } });
      cells.forEach(o=>{ if(o.st==="I"){ o.t++; if(mode==="anell"&&!o.det&&o.t>=DETECT){ o.det=true; ring(o).forEach(q=>{ if(q.st==="S"){ q.st="V"; S.doses++; q.flash=8; } }); }
        if(o.t>=INF_DAYS)o.st="R"; } if(o.flash>0)o.flash--; });
      newI.forEach(q=>{ if(q.st==="S"){ q.st="I"; q.t=0; S.cases++; } });
      if(!cells.some(o=>o.st==="I")){ el.__done=true; running=false; play.textContent="Torna a començar →"; } }
    function draw(){ ctx.clearRect(0,0,w,h);
      for(const o of cells){ ctx.save(); ctx.translate(o.x,o.y);
        if(o.flash>0){ ctx.fillStyle=V.alpha(C.yellow,.85); ctx.fill(hexP); }
        else if(o.st==="S"){ ctx.strokeStyle=V.alpha(C.ink,.18); ctx.lineWidth=.6; ctx.stroke(hexP); }
        else { ctx.fillStyle=o.st==="V"?V.alpha(C.blue,.4):o.st==="I"?V.alpha(C.red,.9):V.alpha(C.redDark,.42); ctx.fill(hexP); }
        ctx.restore(); }
      out.innerHTML=`<span><b>Dia ${S.day}</b> · ${f0(S.cases)} pobles amb casos · ${f0(S.doses)} vacunacions noves${el.__done?" · <b>el brot s'ha aturat</b>":""}</span>`; }
    el.__reset=()=>{ reset(); };
    reset();
    el.__loop=V.loop(el,(t,dt)=>{ if(!running)return; S.acc+=dt; while(S.acc>110){ S.acc-=110; if(running)step(); } draw(); });
  });
  V.onView(box,instant=>{ if(!instant)start(); },{threshold:.5});
})();

/* =====================================================================
   V6 · MAP-01 + MAP-03 · ELS ÚLTIMS METRES: SOMÀLIA, 1977 (scrolly)
   ===================================================================== */
(function merca(){
  const box=$("#merca-viz"), stepsEl=$("#s-merca .steps"); if(!box||!window.SO_DEM)return;
  let cur=0;
  const CITY=[["Merca",[44.770,1.715],"start",9,12,true],["Mogadiscio",[45.342,2.035],"start",8,-6],["Baidoa",[43.644,3.120],"start",8,4],["Kismaayo",[42.541,-0.360],"start",8,4],["Jilib",[42.776,0.494],"end",-8,4],["Afgooye",[44.997,2.235],"end",-8,-6]];
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.95,vh*.42):Math.min(w*.8,vh*.74));
    const st=stage(el,h);
    const proj=d3.geoMercator().fitExtent([[mob?2:10,mob?4:10],[w-(mob?2:10),h-(mob?4:10)]],{type:"MultiPoint",coordinates:[[41.2,-0.9],[46.6,4.9]]});
    const {ctx}=mkCanvas(st,w,h,"Mapa físic del sud de Somàlia amb els rius Jubba i Shabeelle, les ciutats de Merca, Mogadiscio, Baidoa i Kismaayo, i l'últim brot de verola natural del món, el 1977.");
    relleu59(ctx,proj,w,h,window.SO_DEM,{iso:[200,400,600,800,1000],fade:"nso"});
    const pth=d3.geoPath(proj,ctx);
    ctx.beginPath(); (window.SO_RIVERS||[]).forEach(r=>pth({type:"LineString",coordinates:r.c})); ctx.strokeStyle=V.alpha(C.blue,.78); ctx.lineWidth=1.25; ctx.lineCap="round"; ctx.stroke();
    V.world().then(W=>{ ctx.save(); ctx.setLineDash([3,3]); ctx.strokeStyle=V.alpha(C.ink2,.55); ctx.lineWidth=.8; ctx.beginPath(); pth(W.borders); ctx.stroke(); ctx.restore(); }).catch(()=>{});
    const s=overlay(st,w,h), g=s.append("g");
    [["Oceà Índic",[45.9,0.6]],["Etiòpia",[42.3,4.6]],["Kenya",[41.4,1.2]],["Jubba",[42.55,1.9]],["Shabeelle",[45.75,3.7]]].forEach(([t,ll])=>{ const q=proj(ll); V.t(g,q[0],q[1],t,{italic:true,size:mob?11:12,fill:t==="Jubba"||t==="Shabeelle"?C.blue:C.muted,anchor:"middle",halo:2.5}); });
    scaleBar(g,proj,41.3,-1.0,100,mob?8:14,h-(mob?8:14));
    const L={a:g.append("g"),b:g.append("g"),c:g.append("g"),d:g.append("g"),e:g.append("g")};
    CITY.forEach(([n,ll,a,dx,dy,big])=>{ if(mob&&(n==="Afgooye"||n==="Jilib"))return; const q=proj(ll);
      g.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",big?3.4:2.4).attr("fill",C.ink).attr("stroke",C.paper).attr("stroke-width",1.1);
      V.t(g,q[0]+dx,q[1]+dy,n,{anchor:a,size:big?13:11.5,weight:big?700:500,halo:3}); });
    const mq=proj([44.770,1.715]), bq=proj([43.644,3.120]);
    // a) entre els dos rius
    V.note(L.a,{x:bq[0]-10,y:bq[1]+18,tx:bq[0]-(mob?10:60),ty:bq[1]+(mob?60:90),anchor:mob?"start":"end",lines:mob?[["3.229 casos el 1977",true],["sobretot a la regió de Bay"]]:[["3.229 casos en 947 brots",true],["la majoria a la regió de Bay,"],["entre el Jubba i el Shabeelle"]],size:mob?11.5:12.5});
    // b) escala del territori d'un grup nòmada (70 × 35 km), no localitzat
    { const kx=a=>proj([41.4+a/(111.32*Math.cos(4.4*Math.PI/180)),4.4])[0]-proj([41.4,4.4])[0], ky=b=>proj([41.4,4.4])[1]-proj([41.4,4.4+b/111.32])[1];
      const x0=mob?10:20, y0=mob?16:28; L.b.append("rect").attr("x",x0).attr("y",y0+16).attr("width",kx(70)).attr("height",ky(35)).attr("fill",C.red).attr("fill-opacity",.16).attr("stroke",C.red).attr("stroke-width",.8).attr("stroke-dasharray","3 2").style("mix-blend-mode",BLEND);
      V.t(L.b,x0,y0+6,"El territori d'un sol grup de nòmades: 70 × 35 km",{size:mob?11:12,weight:700,halo:3});
      V.t(L.b,x0,y0+24+ky(35)+6,"46 persones, 19 casos en cinc mesos",{size:mob?11:11.5,fill:C.ink2,halo:3}); }
    // c) 90 km al voltant de Merca
    { const r=proj([44.770,1.715+90/111.32])[1]; L.c.append("circle").attr("cx",mq[0]).attr("cy",mq[1]).attr("r",Math.abs(mq[1]-r)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.1).attr("stroke-dasharray","5 4");
      V.note(L.c,{x:mq[0]-Math.abs(mq[1]-r)*.7,y:mq[1]-Math.abs(mq[1]-r)*.7,tx:mq[0]-Math.abs(mq[1]-r)*.7-(mob?6:30),ty:mq[1]-Math.abs(mq[1]-r)-(mob?8:20),anchor:"end",lines:[["A uns 90 km de Merca",true],["l'encampament d'on venien dos malalts"]],size:mob?11:12}); }
    // d) Merca: els vacunats
    { const Rv=d3.scaleSqrt([0,54777],[0,mob?26:44]);
      L.d.append("circle").attr("cx",mq[0]).attr("cy",mq[1]).attr("r",Rv(54777)).attr("fill",C.blue).attr("fill-opacity",.3).style("mix-blend-mode",BLEND);
      L.d.append("circle").attr("cx",mq[0]).attr("cy",mq[1]).attr("r",Rv(30000)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
      L.d.append("circle").attr("cx",mq[0]).attr("cy",mq[1]).attr("r",3.6).attr("fill",C.red);
      V.note(L.d,{x:mq[0]+Rv(54777)*.7,y:mq[1]+Rv(54777)*.7,tx:mq[0]+(mob?20:60),ty:mq[1]+(mob?44:90),anchor:mob?"end":"start",lines:mob?[["54.777 vacunats",true],["en dues setmanes"]]:[["54.777 persones vacunades",true],["en dues setmanes, en una ciutat"],["de 30.000 habitants (cercle puntejat)"]],size:mob?11:12}); }
    // e) certificació
    V.t(L.e,mob?10:20,mob?20:34,"26 d'octubre de 1979",{size:mob?14:18,weight:700,serif:true,fill:C.blue,halo:4});
    V.t(L.e,mob?10:20,mob?36:54,"dos anys sense cap cas: l'Àfrica, certificada",{size:mob?11.5:12.5,fill:C.ink2,halo:3});
    el.__set=(k,instant)=>{ const T=instant||V.reduced?0:600;
      Object.entries(L).forEach(([key,sel],i)=>sel.interrupt().transition().duration(T).style("opacity",i===k||(key==="d"&&k===4)?1:0)); };
    el.__set(cur,true);
  });
  IB.scrolly(stepsEl,$("#s-merca .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V7 · SCALE-02 · LES MANS I LES DOSIS (quadrats niats, dades reals)
   ===================================================================== */
(function mans(){
  const box=$("#mans-viz"); if(!box)return;
  const M={
    dosis:[{v:1400e6,t:"URSS",s:"més de 1.400 milions de dosis, en acords bilaterals (1958–1979)",c:C.red},{v:407e6,t:"Fons de l'OMS",s:"407 milions de 27 països (més del 60 % soviètiques)",c:C.yellow},{v:190e6,t:"Estats Units",s:"més de 190 milions, sobretot a l'Àfrica occidental i central",c:C.blue}],
    persones:[{v:130000,t:"Índia",s:"més de 130.000 treballadors en les cerques casa per casa",c:C.red},{v:12000,t:"Bangladesh",s:"12.000 persones dedicades a l'eradicació el 1975",c:C.yellow},{v:687,t:"OMS",s:"687 persones de 73 països, en tot el programa",c:C.blue}]
  };
  let mode="dosis", api=null;
  document.querySelectorAll('#f-mans .seg button').forEach(b=>b.addEventListener("click",()=>{ document.querySelectorAll('#f-mans .seg button').forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; api&&api.redraw(); }));
  api=V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, side=mob?Math.min(w-20,300):Math.min(380,w*.45), h=side+(mob?150:40);
    const s=V.svg(el,w,h,mode==="dosis"?"Quadrats niats d'àrea proporcional a les dosis de vacuna donades: més de 1.400 milions de la URSS, 407 milions del fons de l'OMS i més de 190 milions dels Estats Units.":"Quadrats niats d'àrea proporcional a les persones: més de 130.000 treballadors a l'Índia, 12.000 a Bangladesh i 687 persones de l'OMS de 73 països."), g=s.append("g");
    const it=M[mode], sc=d3.scaleSqrt([0,it[0].v],[0,side]), x0=mob?10:Math.max(10,w*.08), y0=h-(mob?140:20);
    // cada quadrat té el paper a sota perquè els colors no es barregin
    const gq=g.selectAll("g.q").data(it).join("g").attr("class","q");
    const under=gq.append("rect").attr("x",x0).attr("y",y0).attr("width",0).attr("height",0).attr("fill",C.paper);
    const sq=gq.append("rect").attr("x",x0).attr("y",y0).attr("width",0).attr("height",0).attr("fill",d=>d.c).attr("fill-opacity",d=>d.c===C.yellow?.5:.3).attr("stroke",d=>d.c===C.yellow?C.yellowDark:d.c).attr("stroke-width",.9);
    const grow=instant=>[under,sq].forEach(sel=>sel.transition().duration(instant?0:900).delay((d,i)=>instant?0:i*250).attr("y",d=>y0-sc(d.v)).attr("width",d=>sc(d.v)).attr("height",d=>sc(d.v)));
    V.onView(el,grow); if(el.__seen)grow(true);
    const lx=mob?x0:x0+side+30;
    it.forEach((d,i)=>{ const yy=mob?y0+24+i*40:y0-side+20+i*64;
      V.t(g,lx,yy,d.t,{size:mob?13:15,weight:700,fill:d.c===C.yellow?C.ink:d.c,serif:true,halo:3});
      V.t(g,lx,yy+(mob?15:19),d.s,{size:mob?11.5:12.5,fill:C.ink2,halo:3});
      if(!mob){ const sx=x0+sc(d.v), sy=y0-sc(d.v); g.append("path").attr("d",`M${sx},${sy}L${lx-8},${yy-4}`).attr("stroke",C.hair).attr("stroke-width",.8).attr("fill","none"); } });
  });
})();

/* =====================================================================
   V8 · HOW-01 + PART-01 · UNA AGULLA DE DUES PUNTES
   ===================================================================== */
(function agulla(){
  const box=$("#agulla-viz"); if(!box)return;
  let mode="antic", api=null;
  document.querySelectorAll('#f-agulla .seg button').forEach(b=>b.addEventListener("click",()=>{ document.querySelectorAll('#f-agulla .seg button').forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; box.__set&&box.__set(); }));
  api=V.mount(box,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, LW=mob?w-16:Math.min(460,w*.44), kmm=LW/52;
    const cols=mob?20:25, gx=mob?8:LW+70, gw=mob?w-16:w-gx-10, gap=gw/cols, rows=400/cols, gh=rows*gap;
    const topH=mob?250:0, h=mob?topH+gh+60:Math.max(370,gh+70);
    const s=V.svg(el,w,h,"Dibuix d'una agulla bifurcada de 5 cm, amb un detall ampliat de les dues puntes i la gota de vacuna entre elles, i una reixa de 400 punts: amb la mateixa quantitat de vacuna, el mètode antic en vacunava 100 i l'agulla bifurcada, 400."), g=s.append("g");
    // 1. l'agulla sencera, a escala (50 mm)
    const ny=mob?26:44, ng=g.append("g").attr("transform",`translate(8,${ny})`), L=50*kmm, tl=4*kmm;
    ng.append("rect").attr("x",0).attr("y",-1.5).attr("width",L-tl).attr("height",3).attr("rx",1.5).attr("fill",C.ink2);
    ng.append("path").attr("d",`M${L-tl},-1.5L${L},-${kmm*.9}L${L},-${kmm*.45}L${L-tl*.55},0L${L},${kmm*.45}L${L},${kmm*.9}L${L-tl},1.5Z`).attr("fill",C.ink2);
    ng.append("path").attr("d",`M0,14V18H${L}V14`).attr("fill","none").attr("stroke",C.muted).attr("stroke-width",.8);
    V.t(ng,L/2,32,"50 mm, a escala",{anchor:"middle",size:11.5,fill:C.muted});
    // marc del detall
    ng.append("circle").attr("cx",L-tl*.5).attr("cy",0).attr("r",tl*.9).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
    // 2. detall ampliat de les puntes (×8)
    const Z=mob?6:8, T=tl*Z/2.2, dg=g.append("g").attr("transform",`translate(${mob?8+T*1.1:LW*.5-60},${mob?140:205})`);
    dg.append("rect").attr("x",-T*1.1).attr("y",-7).attr("width",T*1.1).attr("height",14).attr("fill",C.ink2);
    dg.append("path").attr("d",`M0,-7L${T},-${T*.42}L${T},-${T*.22}L${T*.42},0L${T},${T*.22}L${T},${T*.42}L0,7Z`).attr("fill",C.ink2);
    // la gota entre les puntes
    dg.append("path").attr("d",`M${T*.46},0C${T*.6},-${T*.24} ${T*1.02},-${T*.26} ${T*1.04},0C${T*1.02},${T*.26} ${T*.6},${T*.24} ${T*.46},0Z`).attr("fill",C.blue).attr("fill-opacity",.55);
    dg.append("ellipse").attr("cx",T*.8).attr("cy",-T*.08).attr("rx",T*.08).attr("ry",T*.04).attr("fill",C.paper).attr("fill-opacity",.8);
    V.t(dg,-T*1.1,T*.62,"Detall ampliat",{size:11.5,fill:C.muted,italic:true});
    V.note(dg,{x:T*.9,y:T*.16,tx:T*1.25,ty:T*.62,anchor:"start",lines:[["0,0025 ml de vacuna",true],["retinguda entre les puntes"]],size:mob?11.5:12});
    V.note(dg,{x:T*.98,y:-T*.4,tx:T*1.25,ty:-T*.62,anchor:"start",lines:[["15 punxades",true],["a la part alta del braç"]],size:mob?11.5:12});
    // 3. la reixa
    const gy=mob?topH+24:44, r=Math.max(2.2,gap*.33);
    V.t(g,gx,gy-14,"Vacunacions amb la mateixa quantitat de vacuna",{size:12,weight:600,fill:C.ink2});
    const dots=g.append("g").selectAll("circle").data(d3.range(400)).join("circle").attr("cx",i=>gx+(i%cols)*gap+gap/2).attr("cy",i=>gy+Math.floor(i/cols)*gap+gap/2).attr("r",r);
    const lab=g.append("g");
    el.__set=()=>{ const n=mode==="antic"?100:400;
      dots.transition().duration(V.reduced?0:500).delay(i=>V.reduced?0:(i<100?0:(i-100)*2)).attr("fill",i=>i<n?C.blue:"none").attr("fill-opacity",.6).attr("stroke",i=>i<n?C.blue:C.ghost).attr("stroke-width",.7);
      lab.selectAll("*").remove(); V.t(lab,gx,gy+gh+20,mode==="antic"?"100 vacunacions, a 0,01 ml cadascuna":"400 vacunacions, a 0,0025 ml cadascuna: quatre vegades més",{size:mob?12:13,weight:700,halo:3}); };
    el.__set();
  });
})();

})();
