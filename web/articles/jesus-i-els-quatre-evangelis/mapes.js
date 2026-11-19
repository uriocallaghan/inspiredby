/* «Una vida, quatre evangelis» · mapes
   Base comuna: el relleu real (SRTM) dibuixat com a IB-26 (mapa de crestes): una línia per latitud que s'aixeca amb l'alçada.
   Peces: IB-26 al territori i als itineraris, IB-32 (mapa en franja) a la pujada a Jerusalem,
   IB-25 (mapa de pics) als llocs anomenats i IB-30 (distància des d'un punt) a la xarxa de Pau. */
(function(){
  if(!window.d3||!window.IBV||!window.EVG||!window.topojson||!window.EVG_DEM)return;
  const V=IBV, C=V.C, E=window.EVG, DM=window.EVG_DEM;
  const B=["Mt","Mc","Lc","Jn"], NOM={Mt:"Mateu",Mc:"Marc",Lc:"Lluc",Jn:"Joan"};
  const f0=V.fmt(",.0f");
  const $=s=>document.querySelector(s);
  // en tocar o clicar fora d'un gràfic, el seu estat de hover desapareix
  const OUTS=new Map();
  document.addEventListener("pointerdown",ev=>{ OUTS.forEach((fn,n)=>{ if(n.isConnected&&!n.contains(ev.target))fn(); }); },true);
  const outside=(node,fn)=>OUTS.set(node,fn);
  const ease=d3.easeCubicInOut, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  // les dades venen amb l'anell exterior en sentit antihorari: d3-geo el vol horari
  function wind(fc){ (fc.features||[fc]).forEach(f=>{ const g=f.geometry; if(!g)return;
      const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
      polys.forEach(rings=>{ if(d3.geoArea({type:"Polygon",coordinates:[rings[0]]})>2*Math.PI)rings.forEach(r=>r.reverse()); }); }); return fc; }
  const PLAND=wind(topojson.feature(E.geoP,E.geoP.objects.land)), LAKES=wind(topojson.feature(E.geoP,E.geoP.objects.lakes)), RIV=topojson.feature(E.geoP,E.geoP.objects.rivers);
  const MLAND=wind(topojson.feature(E.geoM,E.geoM.objects.land));
  const box=(a,b,c,d)=>({type:"MultiPoint",coordinates:[[a,b],[c,d]]});
  function seg(fig,cb){ const bs=[...fig.querySelectorAll(".seg button")];
    bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(x=>x.setAttribute("aria-pressed",String(x===b))); cb(b.dataset.k); })); }
  function lg(el,items){ if(!el)return; el.innerHTML=items.map(i=>`<span class="lgi"><i class="${i.k||""}" style="${i.k==="ln"||i.k==="ho"?"border-color":"background"}:${i.c}"></i>${i.t}</span>`).join(""); }
  const L=Object.fromEntries(E.llocs.map(d=>[d.nom,d]));
  const ll=n=>[L[n].lon,L[n].lat];
  const kmBetween=(a,b)=>d3.geoDistance(a,b)*6371;
  const pathKm=pts=>d3.sum(pts.slice(1),(p,i)=>kmBetween(pts[i],p));

  /* ---------- relleu ---------- */
  let ELV=null;
  function dem(){ if(ELV)return ELV; const s=atob(DM.b64), n=s.length, a=new Float32Array(n), k=(DM.mx-DM.mn)/254; for(let i=0;i<n;i++)a[i]=s.charCodeAt(i)*k+DM.mn; return (ELV=a); }
  function elev(lon,lat){ const a=dem(), fx=(lon-DM.lon0)/DM.st-.5, fy=(DM.lat1-lat)/DM.st-.5;
    if(fx<0||fy<0||fx>DM.nx-1||fy>DM.ny-1)return 0;
    const i=Math.floor(fx), j=Math.floor(fy), u=fx-i, v=fy-j, nx=DM.nx, i1=Math.min(i+1,nx-1), j1=Math.min(j+1,DM.ny-1);
    return (a[j*nx+i]*(1-u)+a[j*nx+i1]*u)*(1-v)+(a[j1*nx+i]*(1-u)+a[j1*nx+i1]*u)*v; }
  // màscara terra / llac rasteritzada una sola vegada (0 mar, 1 terra, 2 llac)
  const MK={lon0:33.6,lat1:34.1,st:.004,nx:950,ny:950}; let MASK=null;
  function mask(){ if(MASK)return MASK; const cv=document.createElement("canvas"); cv.width=MK.nx; cv.height=MK.ny; const x=cv.getContext("2d");
    const pr=d3.geoIdentity().reflectY(true).scale(1/MK.st).translate([-MK.lon0/MK.st,MK.lat1/MK.st]), pth=d3.geoPath(pr,x);
    x.fillStyle="#f00"; x.beginPath(); pth(PLAND); x.fill(); x.fillStyle="#0f0"; x.beginPath(); pth(LAKES); x.fill();
    const d=x.getImageData(0,0,MK.nx,MK.ny).data, m=new Uint8Array(MK.nx*MK.ny);
    for(let i=0;i<m.length;i++)m[i]=d[i*4+1]>128?2:d[i*4]>128?1:0; return (MASK=m); }
  function kind(lon,lat){ const i=Math.floor((lon-MK.lon0)/MK.st), j=Math.floor((MK.lat1-lat)/MK.st); if(i<0||j<0||i>=MK.nx||j>=MK.ny)return 0; return mask()[j*MK.nx+i]; }
  const LAKEZ={gal:-212,mort:-415};
  const zOf=(lon,lat)=>{ if(lon>36.95)return null; const k=kind(lon,lat); if(k===2)return lat>32.4?LAKEZ.gal:LAKEZ.mort; return k?elev(lon,lat):null; };
  // IB-26: una línia per fila de pantalla; les del sud tapen les del nord
  function ridges(ctx,p,w,h,o){
    const row=o.row, vex=o.vex, sx=o.sx||3; ctx.clearRect(0,0,w,h); ctx.lineJoin="round";
    const xs=d3.range(-sx,w+2*sx,sx), lons=xs.map(x=>p.invert([x,0])[0]);
    const deep=430*vex+2, extra=Math.ceil(2000*vex/row)*row;
    for(let y=-extra; y<=h+deep; y+=row){
      const lat=p.invert([w/2,y])[1]; let run=null; const runs=[];
      for(let k=0;k<xs.length;k++){ const z=zOf(lons[k],lat);
        if(z==null){ if(run){ runs.push(run); run=null; } continue; }
        const kd=kind(lons[k],lat)===2?2:z<0?1:0; (run=run||[]).push([xs[k],y-z*vex,kd]); }
      if(run)runs.push(run);
      for(const r of runs){ if(r.length<2)continue;
        ctx.fillStyle=C.paper; ctx.beginPath(); ctx.moveTo(r[0][0],r[0][1]); for(const q of r)ctx.lineTo(q[0],q[1]); ctx.lineTo(r[r.length-1][0],y+deep); ctx.lineTo(r[0][0],y+deep); ctx.closePath(); ctx.fill();
        let cur=-1; for(let k=1;k<r.length;k++){ const kd=Math.min(r[k][2],r[k-1][2])===2?2:(r[k][2]||r[k-1][2]);
          if(kd!==cur){ if(cur>=0)ctx.stroke(); cur=kd; ctx.beginPath(); ctx.moveTo(r[k-1][0],r[k-1][1]);
            ctx.strokeStyle=kd===2?(o.lake||C.blau):kd===1?(o.low||V.alpha(C.blau,.5)):(o.ink||V.alpha(C.ink,.5)); ctx.lineWidth=kd===2?(o.lw||.75)*1.3:(o.lw||.75); }
          ctx.lineTo(r[k][0],r[k][1]); }
        if(cur>=0)ctx.stroke(); } }
    if(o.fadeEast){ const a=p([36.15,32])[0], b=p([36.9,32])[0]; if(a<w){ ctx.save(); ctx.globalCompositeOperation="destination-out"; const g=ctx.createLinearGradient(a,0,b,0); g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,1)"); ctx.fillStyle=g; ctx.fillRect(a,-10,w-a+10,h+20); ctx.restore(); } } }
  // posició aixecada sobre el relleu
  const lift=(p,vex)=>(lon,lat)=>{ const q=p([lon,lat]), z=zOf(lon,lat); return [q[0],q[1]-(z==null?0:z)*vex]; };

  function zoomer(w,h,pad,make){ make=make||(()=>d3.geoMercator()); const p=make();
    return {p,fit(bx,pd){ const q=make().fitExtent([[pd==null?pad:pd,pd==null?pad:pd],[w-(pd==null?pad:pd),h-(pd==null?pad:pd)]],bx); return {s:q.scale(),t:q.translate()}; },
    set(v){ p.scale(v.s).translate(v.t); }, lerp(a,b,k){ const s=a.s*Math.pow(b.s/a.s,k);
      const ca=[(w/2-a.t[0])/a.s,(h/2-a.t[1])/a.s], cb=[(w/2-b.t[0])/b.s,(h/2-b.t[1])/b.s], c=[ca[0]+(cb[0]-ca[0])*k,ca[1]+(cb[1]-ca[1])*k];
      return {s,t:[w/2-c[0]*s,h/2-c[1]*s]}; }}; }
  function layered(node,w,h,label){ const {ctx,c}=V.canvas(node,w,h,label); c.classList.add("fade"); const s=d3.select(node).append("svg").attr("class","ibv").attr("width",w).attr("height",h)
      .style("position","absolute").style("left",0).style("top",0).style("overflow","hidden").attr("aria-hidden","true"); return {ctx,s}; }
  function kmBar(g,p,x,y,km){ const a=p([35,32]), lon2=35+km/(111.32*Math.cos(32*Math.PI/180)), b=p([lon2,32]); const px=b[0]-a[0];
    g.append("path").attr("d",`M${x},${y-4}V${y}H${x+px}V${y-4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1);
    V.t(g,x+px+6,y+1,`${km} km`,{size:11.5,fill:C.ink2,halo:true}); }
  function curve(P,bend){ if(P.length===2&&bend){ const [a,b]=P, mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, dx=b[0]-a[0], dy=b[1]-a[1];
      return `M${a[0]},${a[1]}Q${mx-dy*bend},${my+dx*bend} ${b[0]},${b[1]}`; }
    return d3.line().curve(d3.curveCatmullRom.alpha(.5))(P); }
  function arrowDefs(s,id,col){ s.append("defs").append("marker").attr("id",id).attr("viewBox","0 0 10 10").attr("refX",8).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto")
    .append("path").attr("d","M0,1L9,5L0,9").attr("fill","none").attr("stroke",col).attr("stroke-width",1.6); }
  function drawIn(sel,dur,delay){ sel.each(function(){ const n=this, Ln=n.getTotalLength(); d3.select(n).attr("stroke-dasharray",`${Ln} ${Ln}`).attr("stroke-dashoffset",Ln)
      .transition().delay(delay||0).duration(V.reduced?0:dur).ease(ease).attr("stroke-dashoffset",0).on("end",function(){ d3.select(this).attr("stroke-dasharray",this.__dash||null); }); }); }
  function place(g,q,name,o){ o=o||{}; g.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",o.r||3.4).attr("fill",o.hot?C.ink:C.paper).attr("stroke",C.ink).attr("stroke-width",1.2);
    if(name)V.t(g,q[0]+(o.left?-7:7),q[1]+(o.dy||4),name,{size:o.size||12.5,weight:o.hot?700:400,anchor:o.left?"end":"start",halo:true,fill:o.hot?C.ink:C.ink2}); }

  /* el camí de Marc, de Cafarnaüm a Jerusalem (esquema: punts de pas del text, no un camí reconstruït) */
  const MARC=[ll("Cafarnaüm"),[35.53,32.83],[35.545,32.7],[35.58,32.52],[35.62,32.25],[35.56,32.02],ll("Jericó"),[35.36,31.82],ll("Betània"),ll("Jerusalem")];

  /* ============ 1. El territori (scroll, IB-26) ============ */
  (function(){
    const el=$("#mapa"); if(!el)return;
    const VIEWS=[box(34.25,30.95,36.55,33.62),box(34.6,31.5,36.0,32.95),box(35.18,32.62,35.78,32.98),box(34.3,31.2,36.3,33.3),box(34.75,31.55,35.95,33.0),box(34.75,31.55,35.95,33.0)];
    const TIT=["El territori dels evangelis","Natzaret i Jerusalem","La riba nord del llac","Galilea i Judea al segle I","Marc: un sol viatge","Joan: quatre pujades"];
    const ON=[["Jerusalem","Natzaret","Cafarnaüm"],["Natzaret","Jerusalem"],["Cafarnaüm","Betsaida","Corazín","Tiberíades"],[],["Cafarnaüm","Jericó","Jerusalem"],["Cafarnaüm","Jerusalem"]];
    const REG=[{n:"Galilea",lat:32.88,lon:35.25,who:"A"},{n:"Samaria",lat:32.25,lon:35.12,who:"P"},{n:"Judea",lat:31.55,lon:34.95,who:"P"},{n:"Perea",lat:32.0,lon:35.8,who:"A"},{n:"Decàpolis",lat:32.62,lon:35.95,who:"D"},{n:"Fenícia",lat:33.4,lon:35.3,who:"D"}];
    let step=0, api=null;
    lg($("#mapa-lg"),[{c:C.ink,t:"Relleu",k:"ln"},{c:C.blau,t:"Aigua i terra sota el nivell del mar",k:"ln"}]);
    V.mount(el,(node,w)=>{
      const mob=w<640, h=Math.round(mob?Math.min(w*1.08,innerHeight*.44):Math.min(innerHeight-250,w*1.1));
      const {ctx,s}=layered(node,w,h,"Mapa del relleu de Galilea, Samaria i Judea dibuixat amb línies que s'aixequen amb l'alçada. El Jordà corre per una fossa sota el nivell del mar, del llac de Galilea (−212 m) al mar Mort (−415 m). Natzaret és a uns 100 km de Jerusalem; Marc narra un sol viatge a Jerusalem i Joan, quatre.");
      arrowDefs(s,"am-r",C.vermell); arrowDefs(s,"am-b",C.blau);
      const Z=zoomer(w,h,mob?8:20), path=d3.geoPath(Z.p);
      const S0=Z.fit(VIEWS[0]).s;
      const RS=()=>{ const r=mob?4.6:6; return {row:r,vex:r*2.7/1000*Math.pow(Z.p.scale()/S0,.6),sx:mob?2.5:3,fadeEast:true}; };
      let cur=Z.fit(VIEWS[step]); Z.set(cur);
      const over=s.append("g"), regs=s.append("g"), rts=s.append("g"), pls=s.append("g"), ann=s.append("g"), sc=s.append("g");
      const ins=s.append("g").attr("transform",`translate(${w-(mob?112:176)},${mob?4:8})`);
      { const iw=mob?108:168, ih=mob?60:94, ip=d3.geoMercator().fitExtent([[0,0],[iw,ih]],box(-6,29,40,46)), ipath=d3.geoPath(ip);
        ins.append("rect").attr("width",iw).attr("height",ih).attr("fill",C.paper).attr("stroke",C.hair);
        ins.append("path").attr("d",ipath(MLAND)).attr("fill",C.land);
        const a=ip([34.25,33.62]), b=ip([36.55,30.95]); ins.append("rect").attr("x",a[0]-1).attr("y",a[1]-1).attr("width",b[0]-a[0]+2).attr("height",b[1]-a[1]+2).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.5);
        const r=ip([12.48,41.9]); ins.append("circle").attr("cx",r[0]).attr("cy",r[1]).attr("r",2).attr("fill",C.ink2); V.t(ins,r[0],r[1]-5,"Roma",{size:11,anchor:"middle",halo:true,fill:C.ink2}); }
      function geo(){ ridges(ctx,Z.p,w,h,RS()); }
      const P3=()=>lift(Z.p,RS().vex);
      function labels(){
        regs.selectAll("*").remove(); pls.selectAll("*").remove(); sc.selectAll("*").remove();
        const P=P3(), inV=q=>q[0]>6&&q[0]<w-6&&q[1]>8&&q[1]<h-6;
        REG.forEach(r=>{ const q=P(r.lon,r.lat); if(!inV(q)||step===2)return;
          const col=step===3?(r.who==="A"?C.vermell:r.who==="P"?C.blau:null):null;
          V.t(regs,q[0],q[1],r.n,{size:mob?12:14,italic:true,anchor:"middle",fill:col?C.ink:C.ink2,halo:true,weight:col?700:400});
          if(col){ regs.append("rect").attr("x",q[0]-18).attr("y",q[1]+5).attr("width",36).attr("height",3).attr("fill",col);
            V.t(regs,q[0],q[1]+20,r.who==="A"?"Antipes":"Pilat",{size:11.5,anchor:"middle",fill:C.ink2,halo:true}); } });
        if(step===0&&!mob){ const ds=Z.p([35.52,31.45]), lk=Z.p([35.6,32.83]);
          V.note(regs,{x:ds[0]+4,y:ds[1],tx:ds[0]+40,ty:ds[1]+26,kind:"elbow",anchor:"start",lines:[["Mar Mort",true],["−415 m: el punt més baix"]]});
          V.note(regs,{x:lk[0]+6,y:lk[1],tx:lk[0]+46,ty:lk[1]-20,kind:"elbow",anchor:"start",lines:[["Llac de Galilea",true],["−212 m"]]});
          const sea=Z.p([34.55,32.3]); V.t(regs,sea[0],sea[1],"Mar Mediterrani",{size:13,italic:true,anchor:"middle",fill:C.ink2,halo:true}); }
        const on=new Set(ON[step]); if(mob&&step===3){ on.add("Jerusalem"); on.add("Tiberíades"); }
        E.llocs.forEach(d=>{ const q=P(d.lon,d.lat); if(!inV(q))return; const hot=on.has(d.nom);
          if(step===2&&!hot&&d.nom!=="Natzaret")return;
          const left=["Betània","Tiberíades","Sicar","Tir","Sidó"].includes(d.nom)||(step===4&&d.nom==="Jerusalem");
          place(pls,q,hot||(!mob&&step===0&&["Betlem","Jericó","Tir","Sidó","Cesarea de Filip"].includes(d.nom))?d.nom:null,{hot,left,r:hot?4:2.8,size:hot?(mob?12:13):11.5}); });
        kmBar(sc,Z.p,mob?10:20,h-(mob?10:16),step===2?5:25);
      }
      function overlays(anim){
        rts.selectAll("*").remove(); ann.selectAll("*").remove();
        ins.transition().duration(300).style("opacity",step===0?1:0);
        const P=P3();
        if(step===1){ const a=P(...ll("Natzaret")), b=P(...ll("Jerusalem"));
          rts.append("line").attr("x1",a[0]).attr("y1",a[1]).attr("x2",b[0]).attr("y2",b[1]).attr("stroke",C.ink).attr("stroke-width",1.2).attr("stroke-dasharray","4 3");
          V.t(ann,(a[0]+b[0])/2+8,(a[1]+b[1])/2,"≈ 100 km en línia recta",{size:12.5,weight:700,halo:true});
          V.t(ann,a[0]+8,a[1]+18,`${f0(zOf(...ll("Natzaret")))} m`,{size:11.5,fill:C.ink2,halo:true}); V.t(ann,b[0]+8,b[1]+18,`${f0(zOf(...ll("Jerusalem")))} m`,{size:11.5,fill:C.ink2,halo:true}); }
        if(step===2){ const lk=P(35.59,32.8); V.t(ann,lk[0],lk[1],"Llac de Galilea",{size:mob?12.5:14,italic:true,anchor:"middle",fill:C.blau,halo:true}); V.t(ann,lk[0],lk[1]+16,"−212 m",{size:11.5,anchor:"middle",fill:C.blau,halo:true}); }
        if(step===2&&!mob){ const c=P(...ll("Cafarnaüm")), n=P(...ll("Natzaret"));
          V.note(ann,{x:c[0],y:c[1]+4,tx:c[0]-30,ty:c[1]+70,kind:"elbow",anchor:"end",lines:[["Cafarnaüm",true],["«a casa seva», segons Marc"]]});
          if(n[1]<h)V.t(ann,n[0],n[1]-10,"Natzaret, a 33 km",{size:11.5,anchor:"middle",halo:true}); }
        if(step===3&&!mob){ const t=P(...ll("Tiberíades")), j=P(...ll("Jerusalem"));
          place(ann,t,null,{hot:true}); place(ann,j,null,{hot:true});
          V.note(ann,{x:t[0]+3,y:t[1],tx:t[0]+40,ty:t[1]-40,kind:"elbow",anchor:"start",lines:[["Tiberíades",true],["ciutat d'Antipes"]]});
          V.note(ann,{x:j[0]-3,y:j[1],tx:j[0]-40,ty:j[1]+50,kind:"elbow",anchor:"end",lines:[["Jerusalem",true],["on els evangelis situen Pilat per Pasqua"]]}); }
        if(step===4){ const pts=MARC.map(q=>P(q[0],q[1]));
          const pth=rts.append("path").attr("d",curve(pts)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.6).attr("marker-end","url(#am-r)").attr("stroke-linecap","round");
          if(anim)drawIn(pth,1600);
          const q=P(35.66,32.3); V.note(ann,{x:q[0]+2,y:q[1],tx:q[0]+(mob?14:30),ty:q[1]-(mob?6:10),kind:"straight",anchor:"start",lines:[["Mc 10,1",true],[mob?"altra banda":"a l'altra banda del Jordà"]]});
          const jc=P(...ll("Jericó")); V.t(ann,jc[0]+8,jc[1]+16,"Mc 10,46",{size:11.5,fill:C.ink2,halo:true});
          const je=P(...ll("Jerusalem")); V.t(ann,je[0]-10,je[1]+(mob?-14:22),`≈ ${f0(Math.round(pathKm(MARC)/10)*10)} km`,{size:12.5,weight:700,anchor:"end",halo:true}); }
        if(step===5){ const F=[["2,13","Pasqua",.42,.3],["5,1","una festa",.2,.42],["7,10","les Cabanyes",-.04,.54],["12,12","Pasqua",-.26,.66]];
          const a=P(...ll("Cafarnaüm")), b=P(...ll("Jerusalem"));
          F.forEach((f,i)=>{ const pth=rts.append("path").attr("d",curve([a,b],f[2])).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2.2).attr("marker-end","url(#am-b)");
            if(anim)drawIn(pth,800,i*450);
            const node=pth.node(), m=node.getPointAtLength(node.getTotalLength()*f[3]);
            const lab=ann.append("g").style("opacity",anim&&!V.reduced?0:1); lab.append("circle").attr("cx",m.x).attr("cy",m.y).attr("r",9).attr("fill",C.paper).attr("stroke",C.blau).attr("stroke-width",1.2);
            V.t(lab,m.x,m.y+4,String(i+1),{size:11.5,weight:700,anchor:"middle"});
            if(!mob)V.t(lab,m.x+(f[2]>0.1?-13:13),m.y+4,`Jn ${f[0]} · ${f[1]}`,{size:11.5,anchor:f[2]>0.1?"end":"start",halo:true});
            if(anim&&!V.reduced)lab.transition().delay(i*450+400).duration(300).style("opacity",1); }); }
      }
      let raf=0;
      api={go(k,inst){ const from=cur, to=Z.fit(VIEWS[k]); const prev=step; step=k;
        document.getElementById("mapa-t").textContent=TIT[k];
        cancelAnimationFrame(raf); rts.selectAll("*").remove(); ann.selectAll("*").remove();
        if(inst||V.reduced||prev===k){ cur=to; Z.set(cur); geo(); labels(); overlays(!inst); return; }
        pls.selectAll("*").remove(); regs.selectAll("*").remove(); sc.selectAll("*").remove();
        let t0=null; const D=1200;
        const tick=now=>{ if(t0==null)t0=now; const kk=Math.min(1,(now-t0)/D); Z.set(Z.lerp(from,to,ease(kk))); geo();
          if(kk<1)raf=requestAnimationFrame(tick); else { cur=to; labels(); overlays(true); } };
        raf=requestAnimationFrame(tick); }};
      api.go(step,true);
      const tp=V.tip(node), ring=s.append("circle").attr("r",9).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).style("opacity",0);
      d3.select(node).on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,node); const P=P3();
        const d=d3.least(E.llocs,d=>{ const q=P(d.lon,d.lat); return Math.hypot(q[0]-mx,q[1]-my); }); const q=P(d.lon,d.lat);
        if(Math.hypot(q[0]-mx,q[1]-my)>22){ ring.style("opacity",0); tp.hide(); return; }
        ring.style("opacity",1).attr("cx",q[0]).attr("cy",q[1]);
        tp.show(`<b>${d.nom}</b> · ${f0(zOf(d.lon,d.lat))} m${d.nota?`<br><i>${d.nota}</i>`:""}<br>Mencions: ${B.map(b=>`${b} ${d.n[b]}`).join(" · ")}`,q[0],q[1]); }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ ring.style("opacity",0); tp.hide() } outside(node,offH);
    });
    const sc=$("#s-mapa");
    IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(i,stepEl)=>{ const k=+stepEl.dataset.s; if(api)api.go(k); else step=k; });
  })();


  /* ============ 2. La pujada a Jerusalem (IB-32) ============ */
  (function(){
    const el=$("#pujada"); if(!el)return;
    const out=$("#pujada-r");
    // mostres cada 0,5 km al llarg del camí
    const S=[]; let acc=0;
    for(let i=0;i<MARC.length-1;i++){ const a=MARC[i], b=MARC[i+1], d=kmBetween(a,b), ip=d3.geoInterpolate(a,b), n=Math.max(1,Math.round(d/.5));
      for(let k=(i?1:0);k<=n;k++){ const t=k/n, q=ip(t); S.push({km:acc+d*t,lon:q[0],lat:q[1],z:zOf(q[0],q[1])??elev(q[0],q[1])}); } acc+=d; }
    const TOT=acc, jer=S[S.length-1], jri=S.reduce((m,d)=>Math.abs(d.lat-31.871)+Math.abs(d.lon-35.444)<Math.abs(m.lat-31.871)+Math.abs(m.lon-35.444)?d:m,S[0]);
    const low=d3.least(S,d=>d.z), climb=jer.z-jri.z, climbKm=jer.km-jri.km;
    const base=`De Jericó (${f0(jri.z)} m) a Jerusalem (${f0(jer.z)} m): <b>${f0(Math.round(climb/10)*10)} m de pujada en uns ${f0(Math.round(climbKm))} km</b>. Passa el dit o el ratolí pel perfil.`;
    out.innerHTML=base;
    V.mount(el,(node,w)=>{
      const mob=w<640, mmW=mob?0:Math.min(260,w*.26), gx=mmW?mmW+34:0, H=mob?300:340, top=24, bot=H-40;
      const s=V.svg(node,w,H,`Perfil d'alçada del camí de Marc de Cafarnaüm a Jerusalem, uns ${f0(TOT)} km: baixa per la vall del Jordà fins a ${f0(low.z)} m i puja ${f0(climb)} m de Jericó a Jerusalem en uns ${f0(climbKm)} km.`).style("position","relative");
      const x=d3.scaleLinear([0,TOT],[gx+(mob?46:52),w-(mob?8:20)]), y=d3.scaleLinear([-450,900],[bot,top]);
      // eix
      [-400,0,400,800].forEach(v=>{ s.append("line").attr("x1",x(0)).attr("x2",x(TOT)).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v===0?C.ink:C.grid).attr("stroke-width",v===0?1:1);
        V.t(s,x(0)-6,y(v)+4,(v>0?"+":v<0?"−":"")+f0(Math.abs(v))+(v===800?" m":""),{size:11.5,anchor:"end",fill:C.muted}); });
      V.t(s,x(TOT),y(0)-5,"nivell del mar",{size:11.5,anchor:"end",italic:true,fill:C.ink2,halo:true});
      d3.range(0,TOT,20).forEach(v=>{ V.t(s,x(v),bot+18,v?f0(v):"0 km",{size:11.5,anchor:"middle",fill:C.muted}); });
      const area=d3.area().x(d=>x(d.km)).y0(y(-450)).y1(d=>y(d.z)).curve(d3.curveMonotoneX), line=area.lineY1();
      const cid="pj"+Math.random().toString(36).slice(2,7);
      s.append("clipPath").attr("id",cid).append("rect").attr("x",x(0)).attr("y",0).attr("width",0).attr("height",H);
      const g=s.append("g").attr("clip-path",`url(#${cid})`);
      g.append("path").attr("d",area(S)).attr("fill",C.land);
      // sota el nivell del mar: la fossa del Jordà
      const bel=d3.area().x(d=>x(d.km)).y0(y(0)).y1(d=>y(Math.min(0,d.z))).curve(d3.curveMonotoneX);
      g.append("path").attr("d",bel(S)).attr("fill",V.alpha(C.blau,.22));
      g.append("path").attr("d",line(S)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6);
      const an=s.append("g").style("opacity",0);
      const pk=[[S[0],"Cafarnaüm","start"],[jri,"Jericó","end"],[jer,"Jerusalem","end"]];
      pk.forEach(([d,n,a])=>{ an.append("circle").attr("cx",x(d.km)).attr("cy",y(d.z)).attr("r",3.5).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.3);
        V.lines(an,x(d.km)+(a==="start"?6:-6),y(d.z)-(n==="Jerusalem"?10:22),[[n,true],[`${f0(d.z)} m`]],{size:12,anchor:a,halo:true}); });
      V.t(an,x(low.km),y(low.z)+18,mob?"vall del Jordà":"la vall del Jordà, sota el nivell del mar",{size:11.5,anchor:"middle",italic:true,fill:C.blau,halo:true});
      const xa=x(jri.km), xb=x(jer.km);
      an.append("path").attr("d",`M${xa},${y(jer.z)}H${xb}`).attr("stroke",C.vermell).attr("stroke-width",1).attr("stroke-dasharray","3 3");
      an.append("path").attr("d",`M${xa},${y(jri.z)}V${y(jer.z)}`).attr("stroke",C.vermell).attr("stroke-width",1.4);
      V.lines(an,xa-6,(y(jri.z)+y(jer.z))/2,[[`+${f0(Math.round(climb/10)*10)} m`,true,C.vermell],[`en ${f0(Math.round(climbKm))} km`]],{size:12.5,anchor:"end",halo:true});
      // minimapa de situació (IB-32): sempre visible
      let mm=null;
      if(mmW){ const mh=H-30, mp=d3.geoMercator().fitExtent([[4,8],[mmW-4,mh]],box(34.85,31.6,35.95,32.95));
        d3.select(node).selectAll("canvas.ibv").remove();
        const cv=d3.select(node).insert("canvas","svg").attr("class","ibv fade").attr("width",mmW*2).attr("height",H*2).style("position","absolute").style("left",0).style("top",0).style("width",mmW+"px").style("height",H+"px").node();
        const cx=cv.getContext("2d"); cx.scale(2,2); ridges(cx,mp,mmW,H,{row:4,vex:4*2.6/1000,sx:2,lw:.6,ink:V.alpha(C.ink,.45)});
        const P=lift(mp,4*2.6/1000);
        const mg=s.append("g");
        mg.append("path").attr("d",curve(MARC.map(q=>P(q[0],q[1])))).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2);
        ["Cafarnaüm","Jericó","Jerusalem"].forEach(n=>place(mg,P(...ll(n)),n,{r:3,size:11.5,left:n==="Jerusalem"}));
        mm={dot:mg.append("circle").attr("r",5).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.5).style("opacity",0),P}; }
      const cross=s.append("g").style("opacity",0);
      cross.append("line").attr("y1",top).attr("y2",bot).attr("stroke",C.ink).attr("stroke-width",.8);
      const cdot=cross.append("circle").attr("r",4.5).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.5);
      const ctx1=V.t(cross,0,bot+32,"",{size:12,weight:700,anchor:"middle",halo:true});
      function at(d){ cross.style("opacity",1).attr("transform",`translate(${x(d.km)},0)`); cdot.attr("cy",y(d.z)); ctx1.text(`${f0(d.km)} km · ${f0(d.z)} m`);
        if(mm){ const q=mm.P(d.lon,d.lat); mm.dot.style("opacity",1).attr("cx",q[0]).attr("cy",q[1]); } }
      const hit=s.append("rect").attr("x",x(0)).attr("y",0).attr("width",x(TOT)-x(0)).attr("height",H).attr("fill","transparent").attr("class","hit");
      hit.on("pointermove pointerdown",ev=>{ const km=x.invert(d3.pointer(ev,s.node())[0]); const d=d3.least(S,d=>Math.abs(d.km-km)); at(d);
        out.innerHTML=`Quilòmetre <b>${f0(d.km)}</b> · <b>${f0(d.z)} m</b> ${d.z<0?"sota":"sobre"} el nivell del mar.`; }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ cross.style("opacity",0); if(mm)mm.dot.style("opacity",0); out.innerHTML=base } outside(node,offH);
      const clipR=s.select(`#${cid} rect`);
      V.onView(node,inst=>{ const full=x(TOT)-x(0)+2;
        if(inst){ clipR.attr("width",full); an.style("opacity",1); return; }
        clipR.transition().duration(2600).ease(d3.easeSinInOut).attr("width",full).tween("walk",()=>t=>{ const km=TOT*d3.easeSinInOut(t); const d=d3.least(S,e=>Math.abs(e.km-km)); at(d); })
          .on("end",()=>{ cross.transition().duration(300).style("opacity",0); if(mm)mm.dot.transition().duration(300).style("opacity",0); an.transition().duration(500).style("opacity",1); }); });
    });
  })();

  /* ============ 3. Quins llocs anomena cada evangeli (IB-25, mapa de pics) ============ */
  (function(){
    const el=$("#llocs"); if(!el)return;
    const out=$("#llocs-r"), fig=$("#f-llocs");
    let mode="tots", api=null;
    const val=(d,m)=>m==="tots"?d3.sum(B,b=>d.n[b]):d.n[m];
    const MAX=d3.max(E.llocs,d=>val(d,"tots"));
    function msg(m){ const xs=E.llocs.filter(d=>val(d,m)>0).sort((a,b)=>val(b,m)-val(a,m));
      const reg=E.regions.Galilea, gal=m==="tots"?d3.sum(B,b=>reg[b]):reg[m];
      out.innerHTML=`${m==="tots"?"Els quatre evangelis anomenen":NOM[m]+" anomena"} <b>${xs.length}</b> d'aquestes poblacions. La que més: <b>${xs[0].nom}</b>, ${val(xs[0],m)} vegades. La regió de Galilea hi surt ${gal} vegades.`; }
    msg(mode);
    lg($("#llocs-lg"),[{c:C.vermell,t:"Alçada del pic: mencions al text",k:"sq"}]);
    seg(fig,k=>{ mode=k; msg(k); api&&api(k); });
    V.mount(el,(node,w)=>{
      const mob=w<760, mw=mob?w:Math.round(w*.62), tilt=.58;
      const Hm=mob?140:230, top=Hm+14, maxH=mob?540:800;
      const proj=d3.geoMercator().fitSize([mw-12,(maxH-top-24)/tilt],box(34.85,31.6,35.95,33.62));
      { const b=d3.geoPath(proj).bounds(box(34.85,31.6,35.95,33.62)); proj.translate([proj.translate()[0]+(mw-(b[1][0]-b[0][0]))/2-b[0][0],proj.translate()[1]]); }
      const ya=proj([0,33.62])[1], yb=proj([0,31.6])[1], mh=Math.round(top+(yb-ya)*tilt+24);
      const T=q=>[q[0],top+(q[1]-ya)*tilt];
      const rk={x:mob?0:mw+30,y:mob?mh+10:30,w:mob?w:w-mw-30}, nR=mob?8:12, H=mob?mh+20+nR*24:Math.max(mh,30+nR*24);
      const s=V.svg(node,w,H,"Mapa inclinat de Palestina amb un pic a cada població, d'alçada proporcional a les vegades que l'anomenen els evangelis. Jerusalem és la més citada: 66 vegades als quatre, 31 a Lluc.").style("position","relative");
      const path=d3.geoPath(proj);
      d3.select(node).selectAll("canvas.ibv").remove();
      { const cv=d3.select(node).insert("canvas",":first-child").attr("class","ibv fade").style("position","absolute").style("left",0).style("top",0).style("width",mw+"px").style("height",mh+"px").node();
        const dpr=Math.min(2,window.devicePixelRatio||1); cv.width=mw*dpr; cv.height=mh*dpr; const x=cv.getContext("2d");
        x.setTransform(dpr,0,0,dpr*tilt,0,dpr*(top-ya*tilt)); const pth=d3.geoPath(proj,x);
        x.fillStyle=C.land; x.beginPath(); pth(PLAND); x.fill();
        x.strokeStyle=C.blauClar; x.lineWidth=1.2; x.beginPath(); pth(RIV); x.stroke();
        x.fillStyle=C.paper; x.beginPath(); pth(LAKES); x.fill(); x.lineWidth=1; x.stroke(); }
      [["Galilea",35.25,32.85],["Samaria",35.15,32.25],["Judea",34.95,31.75]].forEach(([n,lon,lat])=>{ const q=T(proj([lon,lat])); V.t(s,q[0],q[1],n,{size:mob?12:13.5,italic:true,anchor:"middle",fill:C.ink2,halo:true}); });
      const sea=T(proj([34.88,32.6])); if(!mob)V.t(s,sea[0]+8,sea[1],"Mediterrani",{size:12.5,italic:true,fill:C.ink2,halo:true});
      E.llocs.forEach(d=>{ const q=T(proj([d.lon,d.lat])); d.x=q[0]; d.y=q[1]; d.h=0; });
      const HS=d3.scaleLinear([0,MAX],[0,Hm]), bw=mob?9:13;
      const P=E.llocs.slice().sort((a,b)=>a.y-b.y);
      const face=(d,h,side)=>{ const b=Math.min(bw,3+h*.4), f=b*.32; return side?`M${d.x},${d.y+f}L${d.x},${d.y-h}L${d.x+b/2},${d.y}Z`:`M${d.x-b/2},${d.y}L${d.x},${d.y-h}L${d.x},${d.y+f}Z`; };
      const pk=s.append("g").selectAll("g").data(P).join("g");
      pk.append("path").attr("class","a").attr("fill",V.alpha(C.vermell,.45));
      pk.append("path").attr("class","b").attr("fill",C.vermell);
      pk.append("ellipse").attr("cx",d=>d.x).attr("cy",d=>d.y).attr("rx",2.2).attr("ry",1.3).attr("fill",C.ink);
      function drawH(){ pk.select(".a").attr("d",d=>face(d,d.h,0)); pk.select(".b").attr("d",d=>face(d,d.h,1)); }
      const labs=s.append("g"), ref=s.append("g");
      { const rh=HS(20), rx=mob?14:22, ry=top+30, rd={x:rx,y:ry};
        ref.append("path").attr("d",face(rd,rh,0)).attr("fill",V.alpha(C.ink2,.35)); ref.append("path").attr("d",face(rd,rh,1)).attr("fill",C.ink2);
        ref.append("line").attr("x1",rx+bw).attr("x2",rx+bw+6).attr("y1",ry-rh).attr("y2",ry-rh).attr("stroke",C.ink).attr("stroke-width",.8);
        V.t(ref,rx+bw+9,ry-rh+4,"20 mencions",{size:11.5,fill:C.ink2,halo:true,italic:true}); }
      function drawLabels(m){ labs.selectAll("*").remove();
        const boxes=[], fsz=mob?11.5:12.5, cand=E.llocs.filter(d=>val(d,m)>0).sort((a,b)=>val(b,m)-val(a,m)).slice(0,mob?4:7);
        const hitB=b=>boxes.some(o=>b.x0<o.x1&&b.x1>o.x0&&b.y0<o.y1&&b.y1>o.y0)||b.x0<2||b.x1>mw-2;
        cand.forEach(d=>{ const ht=HS(val(d,m)), tx=d.x, ty=d.y-ht, L1=d.nom, L2=`${val(d,m)}`; const tw=Math.max(L1.length,4)*fsz*.58+8; let pl=null;
          for(let up=0;up<180&&!pl;up+=12)for(const right of [d.x<mw*.6,!(d.x<mw*.6)]){ const x=tx+(right?8:-8), y=ty-4-up;
            const b={x0:right?x:x-tw,x1:right?x+tw:x,y0:y-fsz*1.1,y1:y+fsz*1.4}; if(!hitB(b)){ pl={x,y,right,b}; break; } }
          if(!pl)return; boxes.push(pl.b);
          labs.append("path").attr("d",`M${tx},${ty}L${pl.x},${pl.y+fsz*.25}`).attr("stroke",C.ink).attr("stroke-width",.8).attr("fill","none");
          V.lines(labs,pl.x+(pl.right?2:-2),pl.y,[[`${L1} ${L2}`,true]],{anchor:pl.right?"start":"end",size:fsz,halo:true}); }); }
      // rànquing
      const rkG=s.append("g").attr("transform",`translate(${rk.x},${rk.y})`);
      const bx=d3.scaleLinear([0,MAX],[0,rk.w-(mob?150:130)]);
      const rows=rkG.selectAll("g").data(E.llocs).join("g");
      rows.append("text").attr("x",mob?100:96).attr("y",14).attr("text-anchor","end").attr("font-size",12.5).attr("font-family",V.SANS).text(d=>d.nom);
      rows.append("rect").attr("x",mob?106:102).attr("y",4).attr("height",12).attr("fill",C.vermell);
      rows.append("text").attr("class","v").attr("y",14).attr("font-size",12).attr("font-family",V.SANS).attr("fill",C.ink2);
      if(!mob)V.t(rkG,0,-10,"Mencions",{size:12.5,weight:700});
      let tm=null;
      function set(m,inst){ const dur=inst||V.reduced?0:900;
        if(tm)tm.stop(); P.forEach(d=>{ d.h0=d.h; d.h1=Math.max(val(d,m)?3:0,HS(val(d,m))); d.dl=dur?(d.x/mw)*400:0; });
        if(!dur){ P.forEach(d=>d.h=d.h1); drawH(); } else tm=d3.timer(t=>{ P.forEach(d=>{ const q=clamp((t-d.dl)/dur,0,1); d.h=d.h0+(d.h1-d.h0)*ease(q); }); drawH(); if(t>dur+450)tm.stop(); });
        labs.style("opacity",0); setTimeout(()=>{ drawLabels(m); labs.transition().duration(300).style("opacity",1); },dur?dur*.8:0);
        const sorted=E.llocs.slice().sort((a,b)=>val(b,m)-val(a,m)||a.nom.localeCompare(b.nom)), idx=new Map(sorted.map((d,i)=>[d,i]));
        rows.transition().duration(dur).ease(ease).attr("transform",d=>`translate(0,${idx.get(d)*24})`).style("opacity",d=>idx.get(d)<nR&&val(d,m)>0?1:0);
        rows.select("rect").transition().duration(dur).attr("width",d=>bx(val(d,m)));
        rows.select(".v").transition().duration(dur).attr("x",d=>(mob?106:102)+bx(val(d,m))+5).text(d=>val(d,m)); }
      api=k=>set(k,false);
      drawH();
      V.onView(node,inst=>set(mode,inst));
      const tp=V.tip(node), ring=s.append("ellipse").attr("rx",9).attr("ry",5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).style("opacity",0);
      function hover(d){ pk.style("opacity",e=>!d||e===d?1:.25); rows.style("font-weight",e=>e===d?700:400); labs.style("opacity",d?.25:1);
        if(!d){ ring.style("opacity",0); tp.hide(); return; }
        ring.style("opacity",1).attr("cx",d.x).attr("cy",d.y);
        const refs=B.filter(b=>d.refs[b].length).map(b=>`${b} ${d.refs[b].join("; ")}`).join("<br>");
        tp.show(`<b>${d.nom}: ${val(d,mode)} ${mode==="tots"?"mencions":"a "+NOM[mode]}</b>${d.nota?` · <i>${d.nota}</i>`:""}<br>${B.map(b=>`${NOM[b]} ${d.n[b]}`).join(" · ")}<br><span style="color:#7A7A7A">${refs}</span>`,d.x,d.y-d.h); }
      s.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,s.node()); let d=null;
        if(mx<mw&&my<mh){ d=d3.least(E.llocs,e=>Math.min(Math.hypot(e.x-mx,e.y-my),Math.abs(e.x-mx)+(my<e.y&&my>e.y-e.h?0:99))); if(Math.min(Math.hypot(d.x-mx,d.y-my),Math.abs(d.x-mx)+(my<d.y&&my>d.y-d.h?0:99))>16)d=null; }
        else if(mx>=rk.x&&my>=rk.y){ const i=Math.floor((my-rk.y)/24); const sorted=E.llocs.slice().sort((a,b)=>val(b,mode)-val(a,mode)||a.nom.localeCompare(b.nom)); d=sorted[i]&&i<nR?sorted[i]:null; }
        hover(d); }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ hover(null) } outside(node,offH);
    });
  })();

  /* ============ 4. Dos itineraris cap a Betlem (petits múltiples sobre relleu) ============ */
  (function(){
    const el=$("#betlem"); if(!el)return;
    const out=$("#betlem-r"), fig=$("#f-betlem");
    const EG=[33.85,30.95];
    const R={Mt:{c:C.vermell,t:"Segons Mateu",legs:[
        {pts:[[36.2,32.15],ll("Jerusalem"),ll("Betlem")],t:"uns savis d'orient passen per Jerusalem i arriben a Betlem",r:"Mt 2,1–11",mags:1},
        {pts:[ll("Betlem"),[34.62,31.2],EG],t:"la família fuig a Egipte",r:"Mt 2,13–15",eg:1},
        {pts:[EG,[34.35,31.3],[34.85,31.95],[35.05,32.45],ll("Natzaret")],t:"mort Herodes, s'instal·len a Natzaret",r:"Mt 2,19–23"}]},
      Lc:{c:C.blau,t:"Segons Lluc",legs:[
        {pts:[ll("Natzaret"),[35.1,32.3],[35.12,31.95],ll("Betlem")],t:"de Natzaret a Betlem per inscriure's al cens",r:"Lc 2,1–7"},
        {pts:[ll("Betlem"),ll("Jerusalem")],t:"presenten el nen al Temple de Jerusalem",r:"Lc 2,22–38",bend:.6},
        {pts:[ll("Jerusalem"),[35.5,31.95],[35.56,32.4],ll("Natzaret")],t:"tornen a Natzaret",r:"Lc 2,39"}]}};
    const km=lgd=>Math.round(pathKm(lgd.pts)/5)*5;
    function txt(){ out.innerHTML=["Mt","Lc"].map(k=>`<b>${NOM[k]}</b>: `+R[k].legs.map((lgd,i)=>`${i+1}. ${lgd.t[0].toUpperCase()+lgd.t.slice(1)} (${lgd.r}${lgd.eg||lgd.mags?"":`, ≈ ${km(lgd)} km`}).`).join(" ")).join("<br>"); }
    txt();
    let play=null;
    V.mount(el,(node,w)=>{
      const mob=w<640, gap=mob?8:28, pw=Math.floor((w-gap)/2);
      const bx=box(33.8,30.85,36.2,32.95), mp=d3.geoMercator().fitWidth(pw,bx), mh=Math.round(d3.geoPath(mp).bounds(bx)[1][1]+4);
      const tlH=96, top=24, H=top+mh+tlH;
      const {ctx,s}=layered(node,w,H,"Dos mapes de relleu, l'un al costat de l'altre. Mateu: Betlem, fugida a Egipte i Natzaret. Lluc: de Natzaret a Betlem pel cens, el Temple de Jerusalem i tornada a Natzaret. A sota, Herodes mor el 4 aC i el cens de Quirini és del 6 dC.");
      s.style("overflow","visible");
      arrowDefs(s,"ab-r",C.vermell); arrowDefs(s,"ab-b",C.blau); arrowDefs(s,"ab-g",C.muted);
      const RS={row:mob?3.2:4.2,vex:(mob?3.2:4.2)*2.6/1000,sx:mob?2:2.5,lw:mob?.55:.7,ink:V.alpha(C.ink,.42),low:V.alpha(C.blau,.45),fadeEast:true};
      const panels=["Mt","Lc"].map((k,i)=>({k,x0:i*(pw+gap)}));
      // dibuixa el relleu una vegada a cada panell
      const off=document.createElement("canvas"), dpr=Math.min(2,window.devicePixelRatio||1); off.width=pw*dpr; off.height=mh*dpr; const ox=off.getContext("2d"); ox.scale(dpr,dpr);
      const pp=d3.geoMercator().fitWidth(pw,bx); ridges(ox,pp,pw,mh,RS);
      panels.forEach(p=>ctx.drawImage(off,p.x0,top,pw,mh));
      const P=lift(pp,RS.vex);
      const rgs={};
      panels.forEach(p=>{ const g=s.append("g").attr("transform",`translate(${p.x0},${top})`); p.g=g;
        V.t(s,p.x0,14,R[p.k].t,{size:13.5,weight:700,fill:C.ink});
        const eg=pp(EG); V.t(g,eg[0]+4,eg[1]+16,mob?"Egipte":"cap a Egipte",{size:mob?11.5:12.5,italic:true,fill:C.ink2,halo:true});
        if(p.k==="Mt"){ const o=pp([36.2,32.15]); V.t(g,o[0]-3,o[1]-8,"d'orient",{size:11.5,italic:true,anchor:"end",fill:C.ink2,halo:true}); }
        p.rg=g.append("g"); p.ng=g.append("g"); p.pg=g.append("g");
        ["Natzaret","Jerusalem","Betlem"].forEach(n=>place(p.pg,P(...ll(n)),n,{hot:true,r:3.6,left:n==="Betlem",dy:n==="Betlem"?14:n==="Jerusalem"?-4:4,size:mob?11.5:12.5}));
        });
      // tensió de dates
      const tg=s.append("g").attr("transform",`translate(0,${top+mh+8})`);
      const tx=d3.scaleLinear([-9,10],[mob?14:60,w-(mob?14:60)]);
      tg.append("line").attr("x1",tx(-9)).attr("x2",tx(10)).attr("y1",30).attr("y2",30).attr("stroke",C.ink2);
      [-8,-4,1,6,10].forEach(v=>{ tg.append("line").attr("x1",tx(v)).attr("x2",tx(v)).attr("y1",30).attr("y2",34).attr("stroke",C.muted); V.t(tg,tx(v),48,v<0?`${-v} aC`:`${v} dC`,{size:11.5,anchor:"middle",fill:C.muted}); });
      tg.append("rect").attr("x",tx(-4)).attr("y",26).attr("width",tx(6)-tx(-4)).attr("height",8).attr("fill",C.grid);
      V.t(tg,(tx(-4)+tx(6))/2,20,"≈ 10 anys de distància",{size:12,anchor:"middle",weight:700,halo:true});
      tg.append("circle").attr("cx",tx(-4)).attr("cy",30).attr("r",5).attr("fill",C.vermell);
      tg.append("circle").attr("cx",tx(6)).attr("cy",30).attr("r",5).attr("fill",C.blau);
      V.lines(tg,tx(-4),66,[["Mor Herodes el Gran",true],[mob?"Mateu: ja ha nascut":"Mateu: Jesús ja ha nascut"]],{size:12,anchor:"middle",halo:true});
      V.lines(tg,tx(6),66,[["Cens de Quirini",true],[mob?"Lluc hi lliga el part":"Lluc hi lliga el naixement"]],{size:12,anchor:"middle",halo:true});
      function draw(anim){
        panels.forEach(p=>{ p.rg.selectAll("*").remove(); p.ng.selectAll("*").remove(); let delay=0; const col=R[p.k].c;
          R[p.k].legs.forEach((lgd,i)=>{ const c2=lgd.mags?C.muted:col;
            const pts=lgd.pts.map(q=>P(q[0],q[1]));
            const pth=p.rg.append("path").attr("d",curve(pts,lgd.bend)).attr("fill","none").attr("stroke",c2).attr("stroke-width",lgd.mags?1.4:2.6).attr("stroke-linecap","round")
              .attr("marker-end",`url(#${lgd.mags?"ab-g":p.k==="Mt"?"ab-r":"ab-b"})`);
            if(lgd.mags||lgd.eg){ pth.attr("stroke-dasharray","5 4"); pth.node().__dash="5 4"; }
            if(anim)drawIn(pth,1000,delay);
            const node=pth.node(), mid=node.getPointAtLength(node.getTotalLength()*(lgd.mags?.72:.5));
            const n=p.ng.append("g").style("opacity",anim&&!V.reduced?0:1);
            n.append("circle").attr("cx",mid.x).attr("cy",mid.y).attr("r",9).attr("fill",C.paper).attr("stroke",c2).attr("stroke-width",1.3);
            V.t(n,mid.x,mid.y+4,String(i+1),{size:11.5,weight:700,anchor:"middle"});
            if(!mob&&!lgd.mags&&!lgd.eg)V.t(n,mid.x+12,mid.y+4,`${km(lgd)} km`,{size:11.5,fill:C.ink2,halo:true});
            if(anim&&!V.reduced)n.transition().delay(delay+800).duration(250).style("opacity",1);
            delay+=1100; }); });
      }
      play=()=>draw(true);
      draw(false);
      V.onView(node,inst=>{ if(!inst)draw(true); });
    });
    const pb=fig.querySelector(".playb"); if(pb)pb.addEventListener("click",()=>play&&play());
  })();

  /* ============ 5. La xarxa de Pau (IB-30: distància des de Jerusalem) ============ */
  (function(){
    const el=$("#pau"); if(!el)return;
    const out=$("#pau-r"), fig=$("#f-pau");
    const J=[35.235,31.778];
    const P={Jerusalem:J,Damasc:[36.292,33.513],Antioquia:[36.16,36.202],Tars:[34.893,36.917],Efes:[27.341,37.941],Corint:[22.879,37.906],"Tessalònica":[22.935,40.64],Filips:[24.284,41.013],Roma:[12.483,41.893],"Aràbia":[36.4,30.6],"Galàcia":[32.86,39.93],"Hispània":[-3.7,40.4],"Síria i Cilícia":[36.75,36.75]};
    const FIT={ga:["Jerusalem","Damasc","Antioquia","Tars","Aràbia"],cartes:["Roma","Tessalònica","Filips","Corint","Efes","Galàcia","Jerusalem"],pla:["Hispània","Roma","Corint","Jerusalem"]};
    const RING={ga:100,cartes:500,pla:500};
    const TT={ga:["Pau segons Gàlates","El seu propi relat, amb els anys que hi dona. Cercles cada 100 km des de Jerusalem"],cartes:["Les cartes i els seus destinataris","Cada cercle, 500 km des de Jerusalem. Mida de cada carta en paraules gregues"],pla:["El pla de Romans","Corint, Jerusalem, Roma i, després, Hispània"]};
    const GA=[{a:"Damasc",b:"Aràbia",t:"Després de la revelació, se'n va a Aràbia",r:"Ga 1,17",d:1},{a:"Aràbia",b:"Damasc",t:"Torna a Damasc",r:"Ga 1,17",d:1},{a:"Damasc",b:"Jerusalem",t:"Tres anys després, quinze dies amb Cefes; hi veu Jaume",r:"Ga 1,18–19"},{a:"Jerusalem",b:"Síria i Cilícia",t:"Va a les regions de Síria i Cilícia",r:"Ga 1,21",d:1},{a:"Síria i Cilícia",b:"Jerusalem",t:"Catorze anys després, torna a Jerusalem",r:"Ga 2,1"},{a:"Jerusalem",b:"Antioquia",t:"A Antioquia, s'enfronta amb Cefes",r:"Ga 2,11–14"}];
    const PLA=[{a:"Corint",b:"Jerusalem",t:"Porta a Jerusalem la col·lecta de Macedònia i Acaia",r:"Rm 15,25–26"},{a:"Jerusalem",b:"Roma",t:"Després vol passar per Roma",r:"Rm 15,23–24"},{a:"Roma",b:"Hispània",t:"i arribar a Hispània",r:"Rm 15,24.28",d:1}];
    const LET=[{c:"Tessalònica",w:1473,t:"1 Tessalonicencs"},{c:"Corint",w:6812+4473,t:"1 i 2 Corintis"},{c:"Filips",w:1626,t:"Filipencs"},{c:"Roma",w:7055,t:"Romans"},{c:"Galàcia",w:2226,t:"Gàlates",reg:1}];
    const km=(a,b)=>Math.round(kmBetween(P[a],P[b])/10)*10;
    let mode="ga", api=null;
    function msg(m){ if(m==="ga")out.innerHTML=GA.map((g,i)=>`${i+1}. ${g.t} (${g.r}).`).join(" ");
      if(m==="cartes")out.innerHTML=`Corint és a ${f0(km("Jerusalem","Corint"))} km de Jerusalem; Roma, a ${f0(km("Jerusalem","Roma"))}. Romans (${f0(7055)} paraules) és la carta més llarga; Filèmon (${f0(334)}), adreçada a una persona, la més curta. Pau escriu 1 Corintis des d'Efes (1Co 16,8).`;
      if(m==="pla")out.innerHTML=`${PLA.map((g,i)=>`${i+1}. ${g.t} (${g.r}).`).join(" ")} Pau no diu a quin lloc d'Hispània vol anar.`;
      document.getElementById("pau-t").textContent=TT[m][0]; document.getElementById("pau-s").textContent=TT[m][1]; }
    msg(mode);
    lg($("#pau-lg"),[{c:C.vermell,t:"Recorregut",k:"ln"},{c:C.blau,t:"Destinataris de les cartes"}]);
    seg(fig,k=>{ msg(k); api?api(k):(mode=k); });
    V.mount(el,(node,w)=>{
      const mob=w<640, h=Math.round(mob?w*1.0:Math.min(w*.55,580));
      const s=V.svg(node,w,h,"Mapa centrat a Jerusalem amb cercles de distància: els viatges de Pau segons Gàlates, els destinataris de les seves cartes (fins a Roma, a 2.300 km) i el pla de Romans fins a Hispània.").style("overflow","hidden");
      arrowDefs(s,"ap-r",C.vermell);
      const make=()=>d3.geoAzimuthalEquidistant().rotate([-J[0],-J[1]]).clipAngle(60);
      const Z=zoomer(w,h,mob?26:46,make), path=d3.geoPath(Z.p);
      const fitM=m=>Z.fit({type:"MultiPoint",coordinates:FIT[m].map(n=>P[n])});
      let cur=fitM(mode); Z.set(cur);
      const rgG=s.append("g"), land=s.append("path").attr("fill",C.land), ringG=s.append("g"), rg=s.append("g"), cg=s.append("g"), pg=s.append("g"), ag=s.append("g");
      const rw=d3.scaleSqrt([0,12000],[0,mob?24:38]);
      function base(){ land.attr("d",path(MLAND));
        ringG.selectAll("*").remove(); const c=Z.p(J), kmPx=Z.p.scale()/6371, step=RING[mode];
        for(let r=step;r*kmPx<Math.hypot(w,h);r+=step){ const R=r*kmPx; const big=(r%(step*5)===0)||(mode!=="ga"&&r%1000===0);
          ringG.append("circle").attr("cx",c[0]).attr("cy",c[1]).attr("r",R).attr("fill","none").attr("stroke",big?C.ink2:C.ghost).attr("stroke-width",big?.9:.8).attr("stroke-dasharray","2 3");
          const a=-2.35, lx=c[0]+R*Math.cos(a), ly=c[1]+R*Math.sin(a);
          if(lx>10&&ly>10&&lx<w-10&&ly<h-10)V.t(ringG,lx,ly,`${f0(r)} km`,{size:11.5,anchor:"middle",fill:big?C.ink2:C.muted,halo:true}); } }
      const SHOW={ga:["Jerusalem","Damasc","Antioquia","Tars"],cartes:["Tessalònica","Corint","Filips","Roma","Efes","Jerusalem","Antioquia"],pla:["Corint","Jerusalem","Roma"]};
      const REGL={ga:["Aràbia","Síria i Cilícia"],cartes:["Galàcia"],pla:["Hispània"]};
      function marks(){ pg.selectAll("*").remove();
        SHOW[mode].forEach(n=>{ const q=Z.p(P[n]); const left=(["Jerusalem","Corint","Roma"].includes(n)&&mode!=="cartes")||n==="Tars"||(mode==="cartes"&&n==="Efes");
          place(pg,q,n,{hot:n==="Jerusalem",left,r:3.4,dy:n==="Damasc"?-6:4,size:mob?11.5:12.5}); pg.selectAll("text").attr("font-weight",700).attr("fill",C.ink); });
        REGL[mode].forEach(n=>{ const q=Z.p(P[n]); V.t(pg,q[0]+(n==="Síria i Cilícia"?6:0),q[1]+4,n,{size:mob?12:13,italic:true,anchor:n==="Síria i Cilícia"?"start":"middle",fill:C.ink2,halo:true}); }); }
      let lp=null;
      function routes(anim){ rg.selectAll("*").remove(); cg.selectAll("*").remove(); ag.selectAll("*").remove(); if(lp){ lp.stop(); lp=null; }
        if(mode==="cartes"){ const c=Z.p(J);
          LET.forEach((l,i)=>{ const q=Z.p(P[l.c]), r=rw(l.w);
            rg.append("line").attr("x1",c[0]).attr("y1",c[1]).attr("x2",q[0]).attr("y2",q[1]).attr("stroke",C.blau).attr("stroke-width",.9).attr("stroke-dasharray","1 3").style("opacity",.8);
            const cc=cg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",anim&&!V.reduced?0:r).attr("fill",l.reg?"none":V.alpha(C.blau,.35)).attr("stroke",C.blau).attr("stroke-width",1.2).attr("stroke-dasharray",l.reg?"3 3":null);
            if(anim)cc.transition().delay(i*150).duration(700).ease(d3.easeBackOut).attr("r",r);
            const below=["Corint","Roma","Galàcia"].includes(l.c);
            V.lines(ag,q[0],below?q[1]+r+14:q[1]-r-18,[[l.t,true],[`${f0(l.w)} paraules`]],{size:mob?11.5:12,anchor:"middle",halo:true}); });
          return; }
        const Lg=mode==="ga"?GA:PLA, paths=[];
        Lg.forEach((g,i)=>{ const a=Z.p(P[g.a]), b=Z.p(P[g.b]); const bend=mode==="ga"?-.2:-.16;
          const pth=rg.append("path").attr("d",curve([a,b],bend)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.2).attr("marker-end","url(#ap-r)").attr("stroke-linecap","round");
          if(g.d){ pth.attr("stroke-dasharray","5 4"); pth.node().__dash="5 4"; }
          if(anim)drawIn(pth,800,i*700); paths.push(pth.node());
          const m=pth.node().getPointAtLength(pth.node().getTotalLength()*.5);
          const n=ag.append("g").style("opacity",anim&&!V.reduced?0:1);
          n.append("circle").attr("cx",m.x).attr("cy",m.y).attr("r",9).attr("fill",C.paper).attr("stroke",C.vermell).attr("stroke-width",1.2);
          V.t(n,m.x,m.y+4,String(i+1),{size:11.5,weight:700,anchor:"middle"});
          if(mode==="pla"&&g.b!=="Hispània")V.t(n,m.x,m.y-14,`${f0(km(g.a,g.b))} km`,{size:12,weight:700,anchor:"middle",halo:true});
          if(anim&&!V.reduced)n.transition().delay(i*700+500).duration(250).style("opacity",1); });
        const dot=rg.append("circle").attr("r",4.2).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.3).style("opacity",0);
        const lens=paths.map(n=>n.getTotalLength()), tot=d3.sum(lens), t0=Lg.length*700+800;
        lp=V.loop(node,t=>{ if(V.reduced||t<t0)return; const T=((t-t0)/(mode==="ga"?9000:7000))%1, dd=T*tot; let acc=0;
          for(let i=0;i<paths.length;i++){ if(dd<=acc+lens[i]){ const q=paths[i].getPointAtLength(dd-acc); dot.style("opacity",1).attr("cx",q.x).attr("cy",q.y); break; } acc+=lens[i]; } }); }
      let raf=0;
      function go(m,inst){ const from=cur; mode=m; const to=fitM(m); cancelAnimationFrame(raf);
        rg.selectAll("*").remove(); cg.selectAll("*").remove(); ag.selectAll("*").remove(); pg.selectAll("*").remove();
        if(inst||V.reduced){ cur=to; Z.set(cur); base(); marks(); routes(!inst); return; }
        let t0=null; const D=1100; const tick=now=>{ if(t0==null)t0=now; const k=Math.min(1,(now-t0)/D); Z.set(Z.lerp(from,to,ease(k))); base();
          if(k<1)raf=requestAnimationFrame(tick); else { cur=to; marks(); routes(true); } }; raf=requestAnimationFrame(tick); }
      api=k=>go(k,false); go(mode,true);
      V.onView(node,inst=>{ if(!inst)routes(true); });
      const tp=V.tip(node), ring=s.append("circle").attr("r",9).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).style("opacity",0);
      s.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,s.node()); const ns=SHOW[mode].concat(REGL[mode]);
        const n=d3.least(ns,n=>{ const q=Z.p(P[n]); return Math.hypot(q[0]-mx,q[1]-my); }); const q=Z.p(P[n]);
        if(Math.hypot(q[0]-mx,q[1]-my)>26){ tp.hide(); ring.style("opacity",0); return; }
        ring.style("opacity",1).attr("cx",q[0]).attr("cy",q[1]);
        const l=LET.find(e=>e.c===n);
        tp.show(`<b>${n}</b>${n!=="Jerusalem"?`<br>${f0(km("Jerusalem",n))} km de Jerusalem en línia recta`:""}${l&&mode==="cartes"?`<br>${l.t}: ${f0(l.w)} paraules`:""}`,q[0],q[1]); }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ tp.hide(); ring.style("opacity",0) } outside(node,offH);
    });
  })();
})();
