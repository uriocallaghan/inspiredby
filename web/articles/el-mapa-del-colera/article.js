/* «El mapa que va aturar el còlera» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-soho        MAP-03 + MAP-14  El mapa de Snow redibuixat (sense relleu: escala de carrer)
   V2 #f-dies        TIME-01          Atacs i morts per dia (taula de Snow)
   V3 #f-excepcions  PART-01          Els que no bevien de la bomba
   V4 #s-experiment  MAP-01 + PART-01 El gran experiment del sud de Londres
   V5 #f-farr        HOW-01 + CASE-04 La llei de l'elevació de Farr
   V6 #f-mon         MAP-03 + TIME-01 Casos notificats a l'OMS, 1950–2024
   V7 #f-ruta        MAP-12           L'expansió del 1817 segons Snow (esquema)
   V8 #f-sro         PART-01          Rehidratació oral als camps de refugiats del 1971
   Colors: vermell = el còlera i l'aigua contaminada; blau = l'aigua neta i el que protegeix; groc només en superfícies. */
(function(){
"use strict";
const V=IBV, C=V.C;
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

const DD=window.CH_DATA, MU=DD.mPerUnit, BS=6;   // índex de la bomba de Broad Street
const PUMPS=DD.pumps.map((p,i)=>({x:p[0],y:p[1],l:p[2],i}));
const DEATHS=DD.deaths.map(d=>({x:d[0],y:d[1],kw:d[2],mw:d[3],ke:d[4],bs:d[5]}));
const SEGS=DD.segs.map(s=>({x0:s[0],y0:s[1],x1:s[2],y1:s[3],kw:s[4],bs:s[5]}));
const PNAME={"Oxford Market":"Oxford Market","Castle St E":"Castle Street East","Oxford St #1":"Oxford Street (1)","Oxford St #2":"Oxford Street (2)","Gt Marlborough":"Great Marlborough Street","Crown Chapel":"Crown Chapel","Broad St":"Broad Street","Warwick":"Warwick Street","Briddle St":"Bridle Street","So Soho":"Soho (sud)","Dean St":"Dean Street","Coventry St":"Coventry Street","Vigo St":"Vigo Street"};
const MESOS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const deMes=m=>(/^[aeiou]/.test(MESOS[m])?"d'":"de ")+MESOS[m];
const fD=s=>{ const d=new Date(s+"T00:00:00Z"); return `${d.getUTCDate()} ${deMes(d.getUTCMonth())}`; };

/* =====================================================================
   V1 · MAP-03 + MAP-14 · EL MAPA DE SNOW, REDIBUIXAT (scrolly, sense relleu: escala de carrer)
   ===================================================================== */
(function soho(){
  const box=$("#soho-viz"), stepsEl=$("#s-soho .steps"); if(!box)return;
  let cur=0;
  const xs=SEGS.flatMap(s=>[s.x0,s.x1]), ys=SEGS.flatMap(s=>[s.y0,s.y1]);
  const X0=d3.min(xs), X1=d3.max(xs), Y0=d3.min(ys), Y1=d3.max(ys);
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800;
    const h=Math.round(mob?Math.min(w*.96,vh*.42):Math.min(w*.92,vh*.76));
    const st=stage(el,h);
    const pad=mob?6:14, k=Math.min((w-2*pad)/(X1-X0),(h-2*pad)/(Y1-Y0));
    const ox=(w-k*(X1-X0))/2, oy=(h-k*(Y1-Y0))/2;
    const P=(x,y)=>[ox+(x-X0)*k, h-oy-(y-Y0)*k];
    const s=overlay(st,w,h); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","El mapa de John Snow redibuixat amb les seves dades: els carrers del Soho de Londres, les 13 bombes d'aigua i les 578 morts de còlera, concentrades al voltant de la bomba de Broad Street.");
    const g=s.append("g");
    const L={terr:g.append("g"), str:g.append("g"), circ:g.append("g"), dth:g.append("g"), pmp:g.append("g"), lab:g.append("g")};
    // territori de Broad Street (carrers més a prop a peu d'aquesta bomba que de cap altra)
    L.terr.selectAll("line").data(SEGS.filter(d=>d.kw===BS)).join("line")
      .attr("x1",d=>P(d.x0,d.y0)[0]).attr("y1",d=>P(d.x0,d.y0)[1]).attr("x2",d=>P(d.x1,d.y1)[0]).attr("y2",d=>P(d.x1,d.y1)[1])
      .attr("stroke",C.yellow).attr("stroke-opacity",.55).attr("stroke-width",mob?4:7).attr("stroke-linecap","round");
    L.str.selectAll("line").data(SEGS).join("line")
      .attr("x1",d=>P(d.x0,d.y0)[0]).attr("y1",d=>P(d.x0,d.y0)[1]).attr("x2",d=>P(d.x1,d.y1)[0]).attr("y2",d=>P(d.x1,d.y1)[1])
      .attr("stroke",C.ink).attr("stroke-opacity",.32).attr("stroke-width",mob?.6:.8).attr("stroke-linecap","round");
    const pb=P(PUMPS[BS].x,PUMPS[BS].y), rC=192/MU*k;   // 210 iardes = 192 m (Whitehead)
    L.circ.append("circle").attr("cx",pb[0]).attr("cy",pb[1]).attr("r",rC).attr("fill",C.red).attr("fill-opacity",.06).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","3 3");
    if(!mob)V.note(L.circ,{x:pb[0]+rC*.71,y:pb[1]-rC*.71,tx:pb[0]+rC*.71+40,ty:pb[1]-rC-24,kind:"curve",anchor:"start",lines:[["210 iardes (192 m)",true],["el cercle de Whitehead"]],size:12});
    const rd=mob?1.6:2.3;
    const dsel=L.dth.selectAll("circle").data(DEATHS).join("circle").attr("cx",d=>P(d.x,d.y)[0]).attr("cy",d=>P(d.x,d.y)[1]).attr("r",rd)
      .attr("fill",C.red).attr("fill-opacity",.62).style("mix-blend-mode",BLEND);
    L.pmp.selectAll("circle").data(PUMPS).join("circle").attr("cx",d=>P(d.x,d.y)[0]).attr("cy",d=>P(d.x,d.y)[1])
      .attr("r",d=>d.i===BS?(mob?5:7):(mob?3.4:4.6)).attr("fill",d=>d.i===BS?C.red:C.blue).attr("stroke",C.paper).attr("stroke-width",1.4);
    V.t(L.lab,pb[0]+(mob?7:10),pb[1]+(mob?16:20),"Bomba de Broad Street",{size:mob?11.5:13,weight:700,halo:3.4});
    // escala gràfica (100 m)
    { const px=100/MU*k, x=mob?8:16, y=h-(mob?8:14);
      L.lab.append("path").attr("d",`M${x},${y-4}V${y}H${x+px}V${y-4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1);
      V.t(L.lab,x+px+6,y+1,"100 m",{size:V.FS.small,fill:C.ink2,halo:true}); }
    const info=L.lab.append("g");
    el.__set=(kk,instant)=>{
      const T=instant||V.reduced?0:700;
      const vis=(sel,on)=>sel.interrupt().transition().duration(T).style("opacity",on?1:0);
      vis(L.terr,kk>=3); vis(L.circ,kk===2); vis(L.dth,kk>=1);
      dsel.interrupt().transition().duration(T).delay((d,i)=>T&&kk===1?Math.min(900,i*1.6):0)
        .attr("r",kk>=1?rd:0).attr("fill",d=>kk>=3&&d.kw!==BS?C.ink2:C.red).attr("fill-opacity",d=>kk>=3&&d.kw!==BS?.45:.62);
      info.selectAll("*").remove();
      const tx=mob?8:16, ty=mob?14:24;
      const lines=[[["13 bombes públiques",true],["on el barri anava a buscar aigua"]],
        [[`${f0(DEATHS.length)} morts`,true,C.red],["19 d'agost – 30 de setembre de 1854"]],
        [[`${f0(DEATHS.filter(d=>Math.hypot((d.x-PUMPS[BS].x)*MU,(d.y-PUMPS[BS].y)*MU)<=192).length)} morts`,true,C.red],["a menys de 192 m de la bomba"]],
        [[`${f0(DEATHS.filter(d=>d.kw===BS).length)} de ${f0(DEATHS.length)} morts`,true,C.red],["més a prop d'aquesta bomba que de cap"],["altra, pel carrer (recompte propi)"]]][kk];
      if(lines)V.lines(info,tx,ty,lines,{size:mob?11.5:13,halo:3.4});
    };
    el.__set(cur,true);
    // hover: la mort o la bomba més propera
    const tp=V.tip(el), H=s.append("g").attr("pointer-events","none"), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{
      const all=PUMPS.map(p=>({p,xy:P(p.x,p.y),pump:true})).concat(cur>=1?DEATHS.map(d=>({d,xy:P(d.x,d.y)})):[]);
      const b=d3.least(all,o=>(o.xy[0]-px)**2+(o.xy[1]-py)**2); H.selectAll("*").remove();
      if(!b||(b.xy[0]-px)**2+(b.xy[1]-py)**2>900){ tp.hide(); return; }
      H.append("circle").attr("cx",b.xy[0]).attr("cy",b.xy[1]).attr("r",b.pump?9:5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
      if(b.pump){ const n=DEATHS.filter(d=>d.kw===b.p.i).length; tp.show(`<b>Bomba de ${PNAME[b.p.l]}</b> · segons el nostre càlcul, ${f0(n)} morts vivien més a prop d'aquesta bomba que de cap altra, pel carrer`); }
      else tp.show(`<b>Una mort</b> · segons el nostre càlcul, a ${f0(b.d.bs)} m pel carrer de la bomba de Broad Street · bomba més propera pel carrer: ${PNAME[PUMPS[b.d.kw].l]}`);
    },()=>{ tp.hide(); H.selectAll("*").remove(); });
    V.onView(el,instant=>{ if(instant)return; st.style.opacity=0; d3.select(st).transition().duration(800).style("opacity",1); });
  });
  IB.scrolly(stepsEl,$("#s-soho .graphic"),i=>{ cur=i; if(box.__set)box.__set(i,false); });
})();

/* =====================================================================
   V2 · TIME-01 · L'EPIDÈMIA JA BAIXAVA (taula diària de Snow)
   ===================================================================== */
(function dies(){
  const box=$("#dies-viz"); if(!box)return;
  const rows=DD.dates.filter(r=>r[0]).map(r=>({d:r[0],a:r[1],m:r[2],t:Date.parse(r[0]+"T00:00:00Z")}));
  let mode="a";
  document.querySelectorAll('[data-seg="dies"] button').forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll('[data-seg="dies"] button').forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; if(box.__upd)box.__upd(); }));
  V.mount(box,(el,w)=>{
    const mob=w<640, h=mob?300:360, m={l:mob?30:40,r:mob?8:16,t:24,b:30};
    const s=V.svg(el,w,h,"Atacs mortals i morts de còlera per dia al voltant de Broad Street, del 19 d'agost al 30 de setembre de 1854: l'epidèmia esclata la nit del 31 d'agost, arriba al màxim l'1 de setembre (143 atacs) i ja baixava quan es va treure la maneta de la bomba, el 8 de setembre."), g=s.append("g");
    const x=d3.scaleBand(rows.map(r=>r.d),[m.l,w-m.r]).paddingInner(.22), y=d3.scaleLinear([0,150],[h-m.b,m.t]);
    [0,50,100,150].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,y(v)+4,f0(v),{anchor:"end",size:V.FS.small,fill:C.muted}); });
    const i8=rows.findIndex(r=>r.d==="1854-09-08");
    g.append("rect").attr("x",x(rows[i8].d)-x.step()*x.paddingInner()/2).attr("width",w-m.r-x(rows[i8].d)).attr("y",m.t).attr("height",h-m.b-m.t).attr("fill",C.blue).attr("fill-opacity",.06);
    const bars=g.append("g").selectAll("rect").data(rows).join("rect").attr("x",r=>x(r.d)).attr("width",x.bandwidth()).attr("y",y(0)).attr("height",0).attr("rx",1)
      .attr("fill",C.red).attr("fill-opacity",r=>r.t<rows[i8].t?.85:.55);
    const xr=x(rows[i8].d)+x.bandwidth()/2;
    g.append("line").attr("x1",xr).attr("x2",xr).attr("y1",m.t-6).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","3 2");
    V.lines(g,xr+6,m.t+4,[["8 de setembre",true],["es treu la maneta"],["de la bomba"]],{size:mob?11:12,halo:3});
    ["1854-08-19","1854-09-01","1854-09-15","1854-09-30"].forEach(d=>V.t(g,x(d)+x.bandwidth()/2,h-10,fD(d).replace(" de setembre"," set.").replace(" d'agost"," ag."),{anchor:d==="1854-08-19"?"start":d==="1854-09-30"?"end":"middle",size:V.FS.small,fill:C.muted}));
    const note=g.append("g");
    el.__upd=(instant)=>{
      const k=mode==="a"?"a":"m";
      bars.transition().duration(instant?0:700).delay((r,i)=>instant?0:i*12).attr("y",r=>y(r[k])).attr("height",r=>y(0)-y(r[k]));
      note.selectAll("*").remove();
      const pk=d3.greatest(rows,r=>r[k]), px=x(pk.d)+x.bandwidth()/2;
      V.note(note,{x:px-x.bandwidth()/2-2,y:y(pk[k])+6,tx:px-(mob?24:46),ty:y(pk[k])+(mob?20:14),anchor:"end",
        lines:[[`${pk[k]} ${k==="a"?"atacs":"morts"}`,true],[fD(pk.d)]],size:mob?11:12});
    };
    el.__upd(true);
    V.onView(el,instant=>{ if(!instant){ bars.attr("y",y(0)).attr("height",0); el.__upd(false); } });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ const i=Math.max(0,Math.min(rows.length-1,Math.floor((px-m.l)/x.step()))), r=rows[i];
      V.focus(bars,q=>q===r); tp.show(`<b>${fD(r.d)} de 1854</b> · ${r.a} atacs mortals · ${r.m} morts${r.t>=rows[i8].t?" · ja sense la maneta":""}`); },
      ()=>{ tp.hide(); V.focus(bars,null); });
  });
})();

/* =====================================================================
   V3 · PART-01 · ELS QUE NO EN BEVIEN (reixes d'unitats, Snow 1855)
   ===================================================================== */
(function excep(){
  const box=$("#excep-viz"); if(!box)return;
  let what="real";
  document.querySelectorAll('[data-seg="excep"] button').forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll('[data-seg="excep"] button').forEach(o=>o.setAttribute("aria-pressed",o===b)); what=b.dataset.k; if(box.__upd)box.__upd(); }));
  const G=[
    {t:"Taller de càpsules fulminants",s:"37 Broad Street · bevien de la bomba",n:200,d:18,e:18,src:"uns 200 treballadors · 18 morts"},
    {t:"Workhouse de Poland Street",s:"tenia pou propi",n:535,d:5,e:100,src:"535 interns · 5 morts (més de 100 amb la mortalitat dels carrers del voltant, segons Snow)"},
    {t:"Cerveseria de Broad Street",s:"pou propi i cervesa",n:70,d:0,e:0,src:"més de 70 treballadors · cap cas greu"}
  ];
  V.mount(box,(el,w)=>{
    const mob=w<640, cols=mob?1:3, gw=mob?w:(w-40)/3, cell=mob?9:Math.min(11,gw/24), per=Math.floor(gw/cell);
    let yy=0; const pos=[];
    G.forEach((gr,i)=>{ const rows=Math.ceil(gr.n/per); pos.push({x:mob?0:i*(gw+20),y:mob?yy:0,rows}); if(mob)yy+=56+rows*cell+26; });
    const h=mob?yy:56+d3.max(pos,p=>p.rows)*cell+20;
    const s=V.svg(el,w,h,"Tres reixes de persones: al taller de càpsules fulminants, on bevien de la bomba, van morir 18 de 200 treballadors; al workhouse de Poland Street, amb pou propi, 5 de 535 interns; a la cerveseria, cap dels més de 70 treballadors."), g=s.append("g");
    const grids=G.map((gr,i)=>{ const p=pos[i], gg=g.append("g").attr("transform",`translate(${p.x},${p.y})`).datum(gr);
      V.t(gg,0,16,gr.t,{size:mob?13:14,weight:700,serif:true}); V.t(gg,0,34,gr.s,{size:12,fill:C.ink2});
      const cnt=V.t(gg,0,52,"",{size:12.5,weight:700,fill:C.red});
      const dots=gg.append("g").selectAll("circle").data(d3.range(gr.n)).join("circle")
        .attr("cx",j=>(j%per)*cell+cell/2).attr("cy",j=>60+Math.floor(j/per)*cell+cell/2).attr("r",cell*.36).attr("fill",C.ghost).attr("fill-opacity",.9);
      return {gr,dots,cnt}; });
    el.__upd=(instant)=>grids.forEach(({gr,dots,cnt})=>{ const n=what==="real"?gr.d:gr.e;
      dots.transition().duration(instant?0:600).delay(j=>instant?0:Math.min(500,j*2)).attr("fill",j=>j<n?C.red:C.ghost);
      cnt.text(what==="real"?(gr.d?`${f0(gr.d)} morts`:"cap cas greu"):(gr.t.startsWith("Workhouse")?"més de 100 morts (estimació de Snow)":gr.t.startsWith("Taller")?`${gr.d} morts (ja en bevien)`:"sense xifra alternativa")); });
    el.__upd(true);
    V.onView(el,instant=>{ if(!instant){ grids.forEach(o=>o.dots.attr("fill",C.ghost)); el.__upd(false); } });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const i=mob?pos.findIndex((p,j)=>py>=p.y&&(j===pos.length-1||py<pos[j+1].y)):Math.min(2,Math.floor(px/(gw+20)));
      const gr=G[Math.max(0,i)]; V.focus(g.selectAll(":scope>g"),d=>d===gr); tp.show(`<b>${gr.t}</b> · ${gr.src}`); },()=>{ tp.hide(); V.focus(g.selectAll(":scope>g"),null); });
  });
})();

/* =====================================================================
   V4 · MAP-01 + PART-01 · EL GRAN EXPERIMENT (scrolly)
   ===================================================================== */
(function experiment(){
  const box=$("#exp-viz"), stepsEl=$("#s-experiment .steps"); if(!box||!window.LON_DEM)return;
  let cur=0;
  const SITES=[
    {n:"Thames Ditton",s:"presa de Lambeth des del 1852",ll:[-0.3291,51.3891],c:C.blue,a:"start"},
    {n:"Battersea Fields",s:"presa de Southwark & Vauxhall",ll:[-0.1385,51.4845],c:C.red,a:"end"},
    {n:"Hungerford Market",s:"presa de Lambeth fins al 1852",ll:[-0.1200,51.5060],c:C.ink2,a:"start"},
    {n:"Soho",s:"Broad Street",ll:[-0.1357,51.5136],c:C.ink,a:"end",small:true}
  ];
  const GR=[{t:"Southwark & Vauxhall",v:315,c:C.red,s:"40.046 cases · 1.263 morts"},{t:"Lambeth",v:37,c:C.blue,s:"26.107 cases · 98 morts"},{t:"Resta de Londres",v:59,c:C.ink2,s:"256.423 cases · 1.422 morts"}];
  V.mount(box,(el,w)=>{
    const mob=w<640, vh=window.innerHeight||800, h=Math.round(mob?Math.min(w*.95,vh*.42):Math.min(w*.72,vh*.72));
    const st=stage(el,h);
    // capa mapa
    const mapL=document.createElement("div"); mapL.style.cssText=`position:absolute;inset:0;transition:opacity .6s`; st.appendChild(mapL);
    const proj=d3.geoMercator().fitExtent([[6,6],[w-6,h-6]],{type:"MultiPoint",coordinates:[[-0.40,51.37],[-0.06,51.545]]});
    const {ctx:rc}=mkCanvas(mapL,w,h,"Mapa físic del Tàmesi entre Thames Ditton i Londres amb les preses d'aigua de les dues companyies.");
    relleu59(rc,proj,w,h,window.LON_DEM,{iso:[25,50,75,100,125],fade:"neso",fadeK:.08});
    const pth=d3.geoPath(proj,rc); rc.beginPath(); pth(window.CH_THAMES); rc.strokeStyle=V.alpha(C.blue,.8); rc.lineWidth=mob?2:2.6; rc.lineCap="round"; rc.stroke();
    const ms=overlay(mapL,w,h), mg=ms.append("g");
    const arrow=mg.append("g").style("opacity",0);
    { const a=proj(SITES[2].ll), b=proj(SITES[0].ll);
      arrow.append("path").attr("d",`M${a[0]},${a[1]+6}Q${(a[0]+b[0])/2-60},${(a[1]+b[1])/2-40} ${b[0]+8},${b[1]-8}`).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",1.4).attr("stroke-dasharray","5 4");
      V.lines(arrow,(a[0]+b[0])/2-(mob?40:90),(a[1]+b[1])/2-(mob?20:40),[["1852",true,C.blue],["Lambeth se'n va"],["riu amunt"]],{size:mob?11:12.5,anchor:"end",halo:3}); }
    SITES.forEach(sx=>{ if(mob&&sx.small)return; const p=proj(sx.ll), an=mob&&sx.n==="Hungerford Market"?"end":sx.a, dx=an==="end"?-9:9, dy=mob&&sx.n==="Hungerford Market"?-12:0;
      mg.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",sx.small?3:5.5).attr("fill",sx.c).attr("stroke",C.paper).attr("stroke-width",1.4);
      V.t(mg,p[0]+dx,p[1]-2+dy,sx.n,{anchor:an,size:mob?11.5:13,weight:700,halo:3.4});
      if(!mob||!sx.small)V.t(mg,p[0]+dx,p[1]+13+dy,sx.s,{anchor:an,size:mob?10.5:11.5,fill:C.ink2,halo:3}); });
    { const p=proj([-0.205,51.462]); V.t(mg,p[0],p[1]+16,"Tàmesi",{italic:true,size:12.5,fill:C.blue,halo:2.5}); }
    scaleBar(mg,proj,-0.40,51.38,5,mob?8:16,h-(mob?8:14));
    // capa cases
    const hsL=document.createElement("div"); hsL.style.cssText=`position:absolute;inset:0;opacity:0;transition:opacity .6s`; st.appendChild(hsL);
    const {ctx:hc}=mkCanvas(hsL,w,h,"Cases de Londres: les canonades de les dues companyies passaven pels mateixos carrers; per cada 10.000 cases, 315 morts a les de Southwark & Vauxhall, 37 a les de Lambeth i 59 a la resta de Londres.");
    const hs=overlay(hsL,w,h), hg=hs.append("g");
    const rnd=V.rng(1854);
    function drawStreet(){ hc.clearRect(0,0,w,h); hg.selectAll("*").remove();
      const cols=mob?14:28, rows=mob?9:10, cw=(w-20)/cols, ch=Math.min(cw*1.05,(h-80)/rows);
      for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){ const sv=rnd()<40046/(40046+26107);
        hc.fillStyle=V.alpha(sv?C.red:C.blue,.55); hc.fillRect(10+c*cw+cw*.14,40+r*ch+ch*.18,cw*.72,ch*.64); }
        hc.fillStyle=V.alpha(C.ink,.08); }
      V.lines(hg,10,18,[["Dues companyies, els mateixos carrers",true],["Cada quadrat és una casa: vermell, Southwark & Vauxhall; blau, Lambeth"]],{size:mob?11:12.5,halo:3}); }
    function drawGrids(){ hc.clearRect(0,0,w,h); hg.selectAll("*").remove();
      const n=3, gap=mob?10:28, side=Math.min((w-gap*(n-1))/n,h-70), cell=side/100, top=46;
      GR.forEach((gr,i)=>{ const x0=i*(side+gap)+(w-(side*n+gap*(n-1)))/2;
        hc.fillStyle=V.alpha(C.ink,.07); hc.fillRect(x0,top,side,side);
        const r2=V.rng(31+i), picks=new Set(); while(picks.size<gr.v)picks.add(Math.floor(r2()*10000));
        hc.fillStyle=gr.c; picks.forEach(j=>{ const cx=x0+(j%100+.5)*cell, cy=top+(Math.floor(j/100)+.5)*cell; hc.beginPath(); hc.arc(cx,cy,Math.max(1,cell*.9),0,6.2832); hc.fill(); });
        V.t(hg,x0,16,gr.t,{size:mob?11:13,weight:700}); V.t(hg,x0,34,`${gr.v} morts per 10.000 cases`,{size:mob?10.5:12,fill:gr.c===C.ink2?C.ink2:gr.c,weight:600});
        if(!mob)V.t(hg,x0,top+side+16,gr.s,{size:11.5,fill:C.muted}); }); }
    el.__set=(kk)=>{
      mapL.style.opacity=kk<=1?1:0; hsL.style.opacity=kk>=2?1:0; arrow.transition().duration(500).style("opacity",kk===1?1:0);
      if(kk===2)drawStreet(); if(kk>=3)drawGrids();
    };
    el.__set(cur);
  });
  IB.scrolly(stepsEl,$("#s-experiment .graphic"),i=>{ cur=i; if(box.__set)box.__set(i); });
})();

/* =====================================================================
   V5 · HOW-01 + CASE-04 · LA DADA QUE VA ENGANYAR FARR
   ===================================================================== */
(function farr(){
  const box=$("#farr-viz"); if(!box)return;
  let mode="alt";
  document.querySelectorAll('[data-seg="farr"] button').forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll('[data-seg="farr"] button').forEach(o=>o.setAttribute("aria-pressed",o===b)); mode=b.dataset.k; if(box.__upd)box.__upd(); }));
  const ALT=[{t:"Menys de 20 peus",ft:10,v:102},{t:"20–40 peus",ft:30,v:65},{t:"40–60 peus",ft:50,v:34},{t:"60–80 peus",ft:70,v:27},{t:"80–100 peus",ft:90,v:22},{t:"Un districte a 100 peus",ft:100,v:17},{t:"Hampstead, uns 350 peus",ft:350,v:7}];
  const AIG=[{t:"Tàmesi per sobre de Battersea",v:15,c:C.blue},{t:"New River i el Lea",v:48,c:C.blueLight},{t:"Tàmesi entre Battersea i Waterloo",v:123,c:C.red}];
  V.mount(box,(el,w)=>{
    const mob=w<640, h=mob?360:400, m={l:mob?6:20,r:mob?6:20,t:30,b:mob?70:60};
    const s=V.svg(el,w,h,"Llei de l'elevació de William Farr (1852): a Londres, les morts de còlera per 10.000 habitants baixen de 102 als districtes de menys de 20 peus d'altura fins a 7 a Hampstead. Però les mateixes taules mostren que la mortalitat depenia molt més de l'aigua: 15 per 10.000 amb aigua presa riu amunt de Battersea i 123 amb aigua presa entre Battersea i Waterloo."), g=s.append("g");
    const n=ALT.length, x=d3.scaleBand(d3.range(n),[m.l,w-m.r]).paddingInner(.08), R=d3.scaleSqrt([0,125],[0,mob?26:44]);
    const base=h-m.b, step=(mob?18:24);
    // terreny en terrasses (esquema)
    const terr=g.append("path").attr("fill",C.land).attr("stroke",C.hair);
    const terrD=d3.range(n).map(i=>{ const top=base-12-i*step-(i===n-1?step*1.6:0); return {i,top}; });
    let dpath=`M${m.l},${h-12}`; terrD.forEach(t=>{ dpath+=`L${x(t.i)},${t.top}L${x(t.i)+x.step()},${t.top}`; }); dpath+=`L${w-m.r},${h-12}Z`;
    terr.attr("d",dpath);
    const river=g.append("g"); V.t(river,m.l+6,base+2,"Tàmesi",{italic:true,size:11.5,fill:C.blue,halo:2.5});
    const cap=g.append("g");
    const circ=g.append("g").selectAll("g").data(ALT).join("g");
    circ.append("circle").attr("fill",C.red).attr("fill-opacity",.38).style("mix-blend-mode",BLEND);
    circ.append("text").attr("class","v").attr("text-anchor","middle").attr("font-size",mob?12:14).attr("font-weight",700).attr("font-family",V.SANS).attr("fill",C.ink);
    circ.append("text").attr("class","l").attr("text-anchor","middle").attr("font-size",mob?10.5:11.5).attr("font-family",V.SANS).attr("fill",C.ink2);
    const ag=g.append("g").selectAll("g").data(AIG).join("g").style("opacity",0);
    ag.append("circle").attr("fill",d=>d.c).attr("fill-opacity",.4).style("mix-blend-mode",BLEND);
    ag.append("text").attr("class","v").attr("text-anchor","middle").attr("font-size",mob?13:15).attr("font-weight",700).attr("font-family",V.SANS).attr("fill",C.ink).text(d=>d.v);
    ag.append("text").attr("class","l").attr("text-anchor","middle").attr("font-size",mob?10.5:12).attr("font-family",V.SANS).attr("fill",C.ink2);
    el.__upd=(instant)=>{
      const T=instant?0:750, alt=mode==="alt";
      terr.transition().duration(T).style("opacity",alt?1:.25); river.transition().duration(T).style("opacity",alt?1:.25);
      circ.transition().duration(T).style("opacity",alt?1:0).attr("transform",(d,i)=>`translate(${x(i)+x.bandwidth()/2},${terrD[i].top-R(d.v)-6})`);
      circ.select("circle").transition().duration(T).attr("r",d=>R(d.v));
      circ.select("text.v").attr("y",5).text(d=>d.v);
      circ.select("text.l").attr("y",d=>R(d.v)+20+(mob?0:0)).each(function(d,i){ const t=d3.select(this); t.text(null);
        const parts=mob?[d.t.replace("Un districte a ","").replace("Hampstead, uns ","Hampstead ").replace("Menys de ","<")]:[d.t];
        parts.forEach(p=>t.append("tspan").attr("x",0).text(p)); }).style("display","none");
      const aw=(w-m.l-m.r)/3;
      ag.transition().duration(T).style("opacity",alt?0:1).attr("transform",(d,i)=>`translate(${m.l+aw*(i+.5)},${h/2-10})`);
      ag.select("circle").transition().duration(T).attr("r",d=>R(d.v)*1.25);
      ag.select("text.v").attr("y",5);
      ag.select("text.l").attr("y",d=>R(d.v)*1.25+18).each(function(d){ const t=d3.select(this); t.selectAll("*").remove();
        const ws=d.t.split(" "), half=Math.ceil(ws.length/2); [ws.slice(0,half).join(" "),ws.slice(half).join(" ")].forEach((p,j)=>t.append("tspan").attr("x",0).attr("dy",j?14:0).text(p)); });
      cap.selectAll("*").remove();
      V.lines(cap,m.l,16,alt?[["Morts per 10.000 habitants, segons l'altura del barri",true]]:[["Morts per 10.000 habitants, segons d'on venia l'aigua",true]],{size:mob?12:13});
      if(alt){ d3.range(n).forEach(i=>V.t(cap,x(i)+x.bandwidth()/2,h-(mob?40:30),mob?["<20","20–40","40–60","60–80","80–100","100","~350"][i]:ALT[i].t.replace("Un districte a ","").replace("Hampstead, uns ","Hampstead, ~"),{anchor:"middle",size:mob?10.5:11.5,fill:C.ink2}));
        V.t(cap,m.l,h-(mob?20:10),mob?"Altura sobre la marea alta del Tàmesi (peus)":"Altura del districte sobre la marea alta del Tàmesi (1 peu = 0,30 m) →",{size:V.FS.small,fill:C.muted}); }
    };
    el.__upd(true);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{ if(mode==="alt"){ const i=Math.max(0,Math.min(n-1,Math.floor((px-m.l)/x.step()))), d=ALT[i]; V.focus(circ,q=>q===d); tp.show(`<b>${d.t}</b> · ${d.v} morts per 10.000 habitants (1848–1849)`); }
      else { const i=Math.max(0,Math.min(2,Math.floor((px-m.l)/((w-m.l-m.r)/3)))), d=AIG[i]; V.focus(ag,q=>q===d); tp.show(`<b>${d.t}</b> · ${d.v} morts per 10.000 habitants (mitjana dels districtes)`); } },
      ()=>{ tp.hide(); V.focus(circ,null); V.focus(ag,null); });
  });
})();

/* =====================================================================
   V6 · MAP-03 + TIME-01 · EL CÒLERA AVUI (casos notificats a l'OMS, 1950–2024)
   ===================================================================== */
(function mon(){
  const box=$("#mon-viz"), ser=$("#mon-ser"), rng=$("#mon-rng"), play=$("#mon-play"), lab=$("#mon-any"); if(!box)return;
  const W=DD.world, YRS=W.years.filter(y=>y>=1950); let year=2024, playing=false, timer=0;
  const CO=DD.countries;
  const R=d3.scaleSqrt([0,1000000],[0,38]);
  let DN=null; try{ DN=new Intl.DisplayNames(["ca"],{type:"region"}); }catch(e){}
  const cname=o=>{ try{ return (DN&&o.a2&&DN.of(o.a2))||o.n; }catch(e){ return o.n; } };
  const lg=$("#mon-lg"); if(lg){ lg.innerHTML=""; V.legendSize(lg,{title:"Casos notificats en un any",values:[50000,500000],r:R,f:f0}); }
  let mapApi=null;
  V.mount(box,(el,w)=>{
    const mob=w<640, h=Math.round(w*(mob?.62:.5));
    d3.select(el).selectAll("svg").remove();
    const s=V.svg(el,w,h,"Mapa del món amb un cercle per país, d'àrea proporcional als casos de còlera notificats a l'OMS l'any triat.");
    const proj=d3.geoEqualEarth().fitExtent([[2,2],[w-2,h-2]],{type:"Sphere"}), pth=d3.geoPath(proj);
    const gL=s.append("g"), gC=s.append("g"), gT=s.append("g");
    V.world().then(Wd=>{
      gL.append("path").datum(Wd.land).attr("d",pth).attr("fill",C.land);
      gL.append("path").datum(Wd.borders).attr("d",pth).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.5);
      const cen={}; Wd.countries.features.forEach(f=>{ cen[f.id]=pth.centroid(f); });
      const items=Object.entries(CO).map(([id,o])=>({id,o,xy:cen[id]})).filter(d=>d.xy&&isFinite(d.xy[0]));
      const cs=gC.selectAll("circle").data(items,d=>d.id).join("circle").attr("cx",d=>d.xy[0]).attr("cy",d=>d.xy[1]).attr("r",0)
        .attr("fill",C.red).attr("fill-opacity",BLEND==="screen"?.72:.42).attr("stroke",C.red).attr("stroke-width",.6).attr("stroke-opacity",.7).style("mix-blend-mode",BLEND);
      el.__draw=(yy,instant)=>{ const k=mob?.7:1;
        cs.transition().duration(instant?0:450).attr("r",d=>R(d.o.c[yy]||0)*k);
        gT.selectAll("*").remove();
        const top=items.filter(d=>d.o.c[yy]).sort((a,b)=>b.o.c[yy]-a.o.c[yy]).slice(0,mob?1:3);
        top.forEach(d=>V.t(gT,d.xy[0]+R(d.o.c[yy])*k*.7+4,d.xy[1]-R(d.o.c[yy])*k*.7,`${cname(d.o)} · ${f0(d.o.c[yy])}`,{size:mob?11:12,weight:700,halo:3.2}));
        V.t(gT,mob?6:12,mob?16:26,yy,{size:mob?18:26,weight:600,serif:true,fill:C.ink});
      };
      el.__draw(year,true);
      const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
      V.hover(hit.node(),(ev,[px,py])=>{ const c=items.filter(d=>d.o.c[year]); const b=d3.least(c,d=>(d.xy[0]-px)**2+(d.xy[1]-py)**2);
        if(!b||Math.hypot(b.xy[0]-px,b.xy[1]-py)>Math.max(14,R(b.o.c[year])*(mob?.7:1)+6)){ tp.hide(); return; }
        tp.show(`<b>${cname(b.o)}, ${year}</b> · ${f0(b.o.c[year])} casos notificats`); },()=>tp.hide());
    });
  });
  V.mount(ser,(el,w)=>{
    d3.select(el).selectAll("svg").remove();
    const mob=w<640, h=mob?150:170, m={l:mob?34:44,r:mob?8:16,t:22,b:22};
    const s=V.svg(el,w,h,"Casos de còlera notificats a l'OMS cada any al món, de 1950 a 2024."), g=s.append("g");
    const x=d3.scaleLinear([1950,2024],[m.l,w-m.r]), y=d3.scaleLinear([0,1300000],[h-m.b,m.t]);
    [0,500000,1000000].forEach(v=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?C.grid:C.ink).attr("stroke-width",v?.6:.8);
      V.t(g,m.l-6,y(v)+4,v?`${f1(v/1e6)} M`:"0",{anchor:"end",size:V.FS.small,fill:C.muted}); });
    const pts=YRS.map(yy=>({y:yy,v:W.cases[W.years.indexOf(yy)]}));
    g.append("path").datum(pts).attr("d",d3.area().x(d=>x(d.y)).y0(y(0)).y1(d=>y(d.v)).curve(d3.curveMonotoneX)).attr("fill",V.alpha(C.red,.14));
    g.append("path").datum(pts).attr("d",d3.line().x(d=>x(d.y)).y(d=>y(d.v)).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",2);
    [1960,1980,2000,2024].forEach(v=>V.t(g,x(v),h-6,v,{anchor:v===2024?"end":"middle",size:V.FS.small,fill:C.muted}));
    V.t(g,m.l,12,"Casos notificats al món cada any",{size:12,weight:600,fill:C.ink2});
    if(!mob){ [[1991,"Perú, 1991"],[2011,"Haití, 2011"],[2017,"Iemen, 2017"]].forEach(([yy,t])=>{ const v=W.cases[W.years.indexOf(yy)];
      V.note(g,{x:x(yy),y:y(v)-3,tx:x(yy)-(yy===2017?10:8),ty:y(v)-14,kind:"straight",anchor:"end",lines:[[t,true]],size:11.5}); }); }
    const cur=g.append("line").attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","2 2");
    el.__cur=yy=>cur.attr("x1",x(yy)).attr("x2",x(yy)); el.__cur(year);
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
    V.hover(hit.node(),(ev,[px])=>{ const yy=Math.round(Math.max(1950,Math.min(2024,x.invert(px)))); const i=W.years.indexOf(yy);
      tp.show(`<b>${yy}</b> · ${f0(W.cases[i])} casos i ${f0(W.deaths[i])} morts notificats`); if(ev.type==="pointerdown"){ stop(); set(yy); } },()=>tp.hide());
  });
  function set(yy){ year=yy; rng.value=yy; rng.setAttribute("aria-valuetext",String(yy)); if(box.__draw)box.__draw(yy); if(ser.__cur)ser.__cur(yy); }
  function stop(){ playing=false; clearInterval(timer); play.textContent="Reprodueix →"; }
  rng.addEventListener("input",()=>{ stop(); set(+rng.value); });
  play.addEventListener("click",()=>{ if(playing)return stop(); if(year>=2024)set(1950); playing=true; play.textContent="Pausa";
    timer=setInterval(()=>{ if(year>=2024){ stop(); return; } set(year+1); },V.reduced?50:420); });
})();

/* =====================================================================
   V7 · MAP-12 · AL PAS DE LA GENT (1817–1824, esquema sobre llocs reals)
   ===================================================================== */
(function ruta(){
  const box=$("#ruta-viz"); if(!box)return;
  const SRC={n:"Delta del Ganges",ll:[89.0,22.3]};
  const DST=[{n:"Xina",ll:[113.3,23.1],dir:"cap a l'est"},{n:"Filipines",ll:[120.98,14.6],dir:"cap a l'est"},{n:"Maurici",ll:[57.55,-20.2],dir:"cap al sud"},{n:"Borbó (la Reunió)",ll:[55.5,-21.1],dir:"cap al sud"},{n:"Pèrsia",ll:[51.4,35.7],dir:"cap al nord-oest"},{n:"Turquia (Imperi otomà)",ll:[35.0,38.5],dir:"cap al nord-oest"}];
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, h=Math.round(w*(mob?.82:.52));
    const st=stage(el,h);
    const proj=d3.geoEqualEarth().rotate([-80,0]).fitExtent([[4,4],[w-4,h-4]],{type:"MultiPoint",coordinates:[[28,44],[128,44],[28,-26],[128,-26]]}), pth=d3.geoPath(proj);
    const s=overlay(st,w,h); s.style("overflow","hidden"); s.attr("role","img").attr("aria-hidden",null).attr("aria-label","Esquema de l'expansió del còlera des del delta del Ganges el 1817: en set anys va arribar a la Xina i les Filipines, a Maurici i Borbó i a Pèrsia i Turquia.");
    const gL=s.append("g"), gA=s.append("g"), gT=s.append("g");
    const arcs=DST.map(d=>{ const a=proj(SRC.ll), b=proj(d.ll), mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy);
      const c=[mx-dy*.18, my+dx*.18]; return {d,a,b,c,L}; });
    V.world().then(Wd=>{ gL.append("path").datum(Wd.land).attr("d",pth).attr("fill",C.land); gL.append("path").datum(Wd.borders).attr("d",pth).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.5); }).catch(()=>{});
    arcs.forEach(o=>gA.append("path").attr("d",`M${o.a[0]},${o.a[1]}Q${o.c[0]},${o.c[1]} ${o.b[0]},${o.b[1]}`).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1).attr("stroke-opacity",.55));
    const sp=proj(SRC.ll); gT.append("circle").attr("cx",sp[0]).attr("cy",sp[1]).attr("r",mob?7:10).attr("fill",C.red).attr("fill-opacity",.4).style("mix-blend-mode",BLEND);
    gT.append("circle").attr("cx",sp[0]).attr("cy",sp[1]).attr("r",2.6).attr("fill",C.ink);
    V.lines(gT,sp[0]+8,sp[1]+18,[["Delta del Ganges",true],["1817"]],{size:mob?11.5:12.5,halo:3.2});
    arcs.forEach(o=>{ gT.append("circle").attr("cx",o.b[0]).attr("cy",o.b[1]).attr("r",3).attr("fill",C.ink);
      const left=o.b[0]<sp[0]; const tx=V.t(gT,o.b[0]+(left?-7:7),o.b[1]+(o.d.n.startsWith("Borbó")?14:-5),mob?o.d.n.replace(" (Imperi otomà)","").replace(" (la Reunió)",""):o.d.n,{anchor:left?"end":"start",size:mob?11:12.5,weight:600,halo:3});
      const bb=tx.node().getBBox(); if(bb.x<2)tx.attr("text-anchor","start").attr("x",o.b[0]+7); else if(bb.x+bb.width>w-2)tx.attr("text-anchor","end").attr("x",o.b[0]-7).attr("y",o.b[1]+16); });
    const {ctx}=mkCanvas(st,w,h,null); st.insertBefore(st.lastChild,s.node());
    const P=arcs.flatMap(o=>d3.range(mob?10:16).map(i=>({o,t:i/(mob?10:16),sp:(.8+Math.random()*.4)/26000})));
    el.__loop=V.loop(el,(t,dt)=>{ ctx.clearRect(0,0,w,h); ctx.fillStyle=C.red;
      for(const p of P){ p.t=(p.t+dt*p.sp)%1; const u=1-p.t, o=p.o;
        const x=u*u*o.a[0]+2*u*p.t*o.c[0]+p.t*p.t*o.b[0], y=u*u*o.a[1]+2*u*p.t*o.c[1]+p.t*p.t*o.b[1];
        ctx.globalAlpha=.85*Math.min(1,p.t/.08,(1-p.t)/.08); ctx.beginPath(); ctx.arc(x,y,mob?1.4:1.8,0,6.2832); ctx.fill(); }
      ctx.globalAlpha=1; });
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(arcs,o=>(o.b[0]-px)**2+(o.b[1]-py)**2);
      tp.show(`<b>${b.d.n}</b> · un dels llocs on, segons Snow, el còlera va arribar ${b.d.dir} en els set anys següents al 1817`); },()=>tp.hide());
  });
})();

/* =====================================================================
   V8 · PART-01 · UNA TASSA D'AIGUA AMB SUCRE I SAL (camps de refugiats, 1971)
   ===================================================================== */
(function sro(){
  const box=$("#sro-viz"); if(!box)return;
  const G=[{t:"Amb solució de rehidratació oral",s:"el camp de Mahalanabis · 3,6 morts de cada 100 (3.700 malalts)",d:3,r:1,c:C.blue},{t:"Només amb sèrum a la vena",s:"altres camps · entre 20 i 30 morts de cada 100 (estimació)",d:20,r:10,c:C.red}];
  V.mount(box,(el,w)=>{
    const mob=w<640, gw=mob?w:(w-40)/2, cell=Math.min(mob?26:30,gw/10), side=cell*10, h=mob?(side+60)*2+20:side+70;
    const s=V.svg(el,w,h,"Dues reixes de 100 persones amb còlera: amb rehidratació oral en van morir unes 3; als camps que només tenien sèrum intravenós, entre 20 i 30."), g=s.append("g");
    const grs=G.map((gr,i)=>{ const x0=mob?(w-side)/2:i*(gw+40)+(gw-side)/2, y0=mob?i*(side+80):0, gg=g.append("g").attr("transform",`translate(${x0},${y0})`).datum(gr);
      V.t(gg,0,16,gr.t,{size:mob?13:14,weight:700,serif:true}); V.t(gg,0,34,gr.s,{size:mob?11:12,fill:C.ink2});
      const dots=gg.append("g").selectAll("circle").data(d3.range(100)).join("circle").attr("cx",j=>(j%10+.5)*cell).attr("cy",j=>46+(Math.floor(j/10)+.5)*cell).attr("r",cell*.36).attr("fill",C.ghost);
      return {gr,dots}; });
    V.onView(el,instant=>grs.forEach(({gr,dots})=>dots.transition().duration(instant?0:500).delay(j=>instant?0:j*8)
      .attr("fill",j=>j<gr.d?C.red:(j<gr.d+gr.r?C.redLight:C.ghost)).attr("fill-opacity",j=>j<gr.d+gr.r?.9:.7)));
  });
})();

})();
