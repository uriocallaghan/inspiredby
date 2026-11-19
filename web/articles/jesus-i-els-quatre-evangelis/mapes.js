/* «Jesús i els quatre evangelis» · mapes
   Base comuna: relleu real NASA SRTM (IB-26 crestes) + costes Natural Earth.
   Peces: V3 (#mapa) scrollytelling IB-26 + IB-13 + mini-mapa Mediterrani;
          V4 (#pujada) IB-32 franja + IB-16 perfil interactiu;
          V5 (#betlem) IB-31 comparador abans/després amb divisor arrossegable (Mateu vs Lluc). */
(function(){
  if(!window.d3||!window.IBV||!window.EVG||!window.topojson||!window.EVG_DEM)return;
  const V=IBV, C=V.C, E=window.EVG, DM=window.EVG_DEM;
  const B=["Mt","Mc","Lc","Jn"], NOM={Mt:"Mateu",Mc:"Marc",Lc:"Lluc",Jn:"Joan"};
  const f0=V.fmt(",.0f");
  const $=s=>document.querySelector(s);
  const OUTS=new Map();
  document.addEventListener("pointerdown",ev=>{ OUTS.forEach((fn,n)=>{ if(n.isConnected&&!n.contains(ev.target))fn(); }); },true);
  const outside=(node,fn)=>OUTS.set(node,fn);
  const ease=d3.easeCubicInOut, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function wind(fc){ (fc.features||[fc]).forEach(f=>{ const g=f.geometry; if(!g)return;
      const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
      polys.forEach(rings=>{ if(d3.geoArea({type:"Polygon",coordinates:[rings[0]]})>2*Math.PI)rings.forEach(r=>r.reverse()); }); }); return fc; }
  const PLAND=wind(topojson.feature(E.geoP,E.geoP.objects.land)), LAKES=wind(topojson.feature(E.geoP,E.geoP.objects.lakes)), RIV=topojson.feature(E.geoP,E.geoP.objects.rivers);
  const MLAND=wind(topojson.feature(E.geoM,E.geoM.objects.land));
  const box=(a,b,c,d)=>({type:"MultiPoint",coordinates:[[a,b],[c,d]]});
  function lg(el,items){ if(!el)return; el.innerHTML=items.map(i=>`<span class="lgi"><i class="${i.k||""}" style="${i.k==="ln"||i.k==="da"||i.k==="ho"?"border-color":"background"}:${i.c}"></i>${i.t}</span>`).join(""); }
  const L=Object.fromEntries(E.llocs.map(d=>[d.nom,d]));
  const ll=n=>[L[n].lon,L[n].lat];
  const kmBetween=(a,b)=>d3.geoDistance(a,b)*6371;

  /* ---------- motor de relleu SRTM ---------- */
  let ELV=null;
  function dem(){ if(ELV)return ELV; const s=atob(DM.b64), n=s.length, a=new Float32Array(n), k=(DM.mx-DM.mn)/254; for(let i=0;i<n;i++)a[i]=s.charCodeAt(i)*k+DM.mn; return (ELV=a); }
  function elev(lon,lat){ const a=dem(), fx=(lon-DM.lon0)/DM.st-.5, fy=(DM.lat1-lat)/DM.st-.5;
    if(fx<0||fy<0||fx>DM.nx-1||fy>DM.ny-1)return 0;
    const i=Math.floor(fx), j=Math.floor(fy), u=fx-i, v=fy-j, nx=DM.nx, i1=Math.min(i+1,nx-1), j1=Math.min(j+1,DM.ny-1);
    return (a[j*nx+i]*(1-u)+a[j*nx+i1]*u)*(1-v)+(a[j1*nx+i]*(1-u)+a[j1*nx+i1]*u)*v; }
  const MK={lon0:33.6,lat1:34.1,st:.004,nx:950,ny:950}; let MASK=null;
  function mask(){ if(MASK)return MASK; const cv=document.createElement("canvas"); cv.width=MK.nx; cv.height=MK.ny; const x=cv.getContext("2d");
    const pr=d3.geoIdentity().reflectY(true).scale(1/MK.st).translate([-MK.lon0/MK.st,MK.lat1/MK.st]), pth=d3.geoPath(pr,x);
    x.fillStyle="#f00"; x.beginPath(); pth(PLAND); x.fill(); x.fillStyle="#0f0"; x.beginPath(); pth(LAKES); x.fill();
    const d=x.getImageData(0,0,MK.nx,MK.ny).data, m=new Uint8Array(MK.nx*MK.ny);
    for(let i=0;i<m.length;i++)m[i]=d[i*4+1]>128?2:d[i*4]>128?1:0; return (MASK=m); }
  function kind(lon,lat){ const i=Math.floor((lon-MK.lon0)/MK.st), j=Math.floor((MK.lat1-lat)/MK.st); if(i<0||j<0||i>=MK.nx||j>=MK.ny)return 0; return mask()[j*MK.nx+i]; }
  const LAKEZ={gal:-212,mort:-415};
  const zOf=(lon,lat)=>{ if(lon>36.95)return null; const k=kind(lon,lat); if(k===2)return lat>32.4?LAKEZ.gal:LAKEZ.mort; return k?elev(lon,lat):null; };

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
            ctx.strokeStyle=kd===2?(o.lake||C.blau):kd===1?(o.low||V.alpha(C.blau,.45)):(o.ink||V.alpha(C.ink,.48)); ctx.lineWidth=kd===2?(o.lw||.75)*1.3:(o.lw||.75); }
          ctx.lineTo(r[k][0],r[k][1]); }
        if(cur>=0)ctx.stroke(); } }
    if(o.fadeEast){ const a=p([36.15,32])[0], b=p([36.9,32])[0]; if(a<w){ ctx.save(); ctx.globalCompositeOperation="destination-out"; const g=ctx.createLinearGradient(a,0,b,0); g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,1)"); ctx.fillStyle=g; ctx.fillRect(a,-10,w-a+10,h+20); ctx.restore(); } } }

  const lift=(p,vex)=>(lon,lat)=>{ const q=p([lon,lat]), z=zOf(lon,lat); return [q[0],q[1]-(z==null?0:z)*vex]; };
  function zoomer(w,h,pad,make){ make=make||(()=>d3.geoMercator()); const p=make();
    return {p,fit(bx,pd){ const q=make().fitExtent([[pd==null?pad:pd,pd==null?pad:pd],[w-(pd==null?pad:pd),h-(pd==null?pad:pd)]],bx); return {s:q.scale(),t:q.translate()}; },
    set(v){ p.scale(v.s).translate(v.t); }, lerp(a,b,k){ const s=a.s*Math.pow(b.s/a.s,k);
      const ca=[(w/2-a.t[0])/a.s,(h/2-a.t[1])/a.s], cb=[(w/2-b.t[0])/b.s,(h/2-b.t[1])/b.s], c=[ca[0]+(cb[0]-ca[0])*k,ca[1]+(cb[1]-ca[1])*k];
      return {s,t:[w/2-c[0]*s,h/2-c[1]*s]}; }}; }
  function layered(node,w,h,label){ d3.select(node).selectAll("svg.ibv").remove(); const {ctx,c}=V.canvas(node,w,h,label); c.classList.add("fade"); const s=d3.select(node).append("svg").attr("class","ibv").attr("width",w).attr("height",h)
      .style("position","absolute").style("left",0).style("top",0).style("overflow","hidden").attr("aria-hidden","true"); return {ctx,s}; }
  function kmBar(g,p,x,y,km){ const a=p([35,32]), lon2=35+km/(111.32*Math.cos(32*Math.PI/180)), b=p([lon2,32]); const px=b[0]-a[0];
    g.append("path").attr("d",`M${x},${y-4}V${y}H${x+px}V${y-4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1);
    V.t(g,x+px+6,y+1,`${km} km`,{size:11.5,fill:C.ink2,halo:true}); }
  function curve(P,bend){ if(P.length===2&&bend){ const [a,b]=P, mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, dx=b[0]-a[0], dy=b[1]-a[1];
      return `M${a[0]},${a[1]}Q${mx-dy*bend},${my+dx*bend} ${b[0]},${b[1]}`; } return d3.line().curve(d3.curveCatmullRom.alpha(.5))(P); }
  function drawAnim(path,dur,delay){ const n=path.node(); if(!n||V.reduced)return; const len=n.getTotalLength();
    path.attr("stroke-dasharray",len+" "+len).attr("stroke-dashoffset",len).transition().delay(delay||0).duration(dur||1000).ease(ease).attr("stroke-dashoffset",0).on("end",()=>path.attr("stroke-dasharray",null)); }

  /* =====================================================================
     V3 · EL TERRITORI DELS EVANGELIS (Scrollytelling IB-26 + IB-13 + Mini-mapa)
     ===================================================================== */
  (function(){
    const el=$("#mapa"); if(!el)return;
    let step=0, api=null, raf=0;
    const META=[
      {t:"El territori dels evangelis",s:"Relleu real (NASA SRTM). En blau, la vall del Jordà per sota del nivell del mar",lg:[{c:C.blau,t:"Sota el nivell del mar",k:"ln"}]},
      {t:"Natzaret i el llac de Galilea",s:"Un poble petit de muntanya i els pobles de pescadors on Jesús passa la major part de la seva vida pública",lg:[{c:C.vermell,t:"Llocs de Galilea"}]},
      {t:"Dos governants, una frontera invisible",s:"Galilea i Perea (Herodes Antipes) al nord; Judea i Jerusalem (Ponç Pilat, Roma) al sud",lg:[{c:C.blau,t:"Herodes Antipes",k:"ln"},{c:C.vermell,t:"Ponç Pilat (Roma)",k:"ln"}]},
      {t:"L'únic viatge de Marc (~140 km)",s:"Tot el relat de Marc camina cap a una sola pujada a Jerusalem per Pasqua",lg:[{c:C.vermell,t:"Viatge de Marc",k:"ln"}]},
      {t:"Les quatre pujades de Joan",s:"Tres Pasqües diferents: d'aquí surt la idea que Jesús va predicar uns tres anys",lg:[{c:C.grocFosc,t:"Anades i vingudes (Joan)",k:"ln"},{c:C.ghost,t:"Viatge únic (Marc)",k:"ln"}]}
    ];
    const VIEW=[
      box(34.2,30.9,36.2,33.5),
      box(35.0,32.55,35.85,33.15),
      box(34.3,31.2,36.1,33.3),
      box(34.5,31.45,35.95,33.1),
      box(34.4,31.45,35.95,33.15)
    ];
    const SHOW=[
      ["Natzaret","Cafarnaüm","Jericó","Jerusalem","Betlem"],
      ["Natzaret","Canà","Cafarnaüm","Betsaida","Tiberíades","Corazín"],
      ["Natzaret","Cafarnaüm","Jericó","Jerusalem","Betlem"],
      ["Cafarnaüm","Natzaret","Jericó","Betània","Jerusalem"],
      ["Canà","Cafarnaüm","Sicar","Jerusalem","Betània"]
    ];
    const MARC_R=[ll("Cafarnaüm"),[35.58,32.45],[35.56,32.1],ll("Jericó"),ll("Betània"),ll("Jerusalem")];
    const JOAN_R=[
      [ll("Canà"),[35.28,32.35],ll("Jerusalem")],
      [ll("Jerusalem"),ll("Sicar"),ll("Canà")],
      [ll("Cafarnaüm"),[35.42,32.25],ll("Jerusalem")],
      [ll("Betània"),ll("Jerusalem")]
    ];

    V.mount(el,(node,w)=>{
      const mob=w<640, h=mob?Math.min(Math.round(window.innerHeight*.44),330):Math.min(540,Math.round(w*.74));
      const {ctx,s}=layered(node,w,h,"Mapa en relleu del territori de Jesús: Galilea, Samaria, Judea, la vall del Jordà i Jerusalem.");
      const zm=zoomer(w,h,mob?14:24), tp=V.tip(node);
      const gMap=s.append("g"), gRoute=s.append("g"), gPts=s.append("g"), gNote=s.append("g"), gInset=s.append("g"), gScale=s.append("g"), gHv=s.append("g");
      let curV=zm.fit(VIEW[step]);

      function drawMiniMed(){
        gInset.selectAll("*").remove();
        if(step!==0||mob)return;
        const mw=156, mh=86, mx=10, my=10;
        const gi=gInset.append("g").attr("transform",`translate(${mx},${my})`);
        gi.append("rect").attr("width",mw).attr("height",mh).attr("fill",V.alpha(C.paper,.92)).attr("stroke",C.hair).attr("stroke-width",.8);
        const mp=d3.geoMercator().fitExtent([[6,6],[mw-6,mh-16]],box(9,29,38,44));
        const pth=d3.geoPath(mp);
        gi.append("path").attr("d",pth(MLAND)).attr("fill",C.land).attr("stroke",C.landEdge).attr("stroke-width",.5);
        // quadre de situació de Palestina
        const a=mp([34.2,33.5]), b=mp([36.2,30.9]);
        gi.append("rect").attr("x",a[0]-2).attr("y",a[1]-2).attr("width",Math.max(8,b[0]-a[0]+4)).attr("height",Math.max(10,b[1]-a[1]+4))
          .attr("fill",V.alpha(C.vermell,.22)).attr("stroke",C.vermell).attr("stroke-width",1.2);
        const roma=mp([12.49,41.9]), aten=mp([23.72,37.98]);
        gi.append("circle").attr("cx",roma[0]).attr("cy",roma[1]).attr("r",2).attr("fill",C.ink2);
        V.t(gi,roma[0]+4,roma[1]+3,"Roma",{size:11,fill:C.ink2,halo:2});
        gi.append("circle").attr("cx",aten[0]).attr("cy",aten[1]).attr("r",1.8).attr("fill",C.muted);
        V.t(gi,aten[0]-3,aten[1]-4,"Grècia",{size:11,fill:C.muted,anchor:"end",halo:2});
        V.t(gi,6,mh-5,"Situació al Mediterrani",{size:11,fill:C.muted});
      }

      function render(v,isEnd){
        zm.set(v); const p=zm.p, vex=(step===1?.011:.0085)*(mob?.75:1), lf=lift(p,vex);
        ridges(ctx,p,w,h,{row:mob?4.4:4.8,vex,sx:mob?3.5:3,fadeEast:true});
        gMap.selectAll("*").remove(); gRoute.selectAll("*").remove(); gPts.selectAll("*").remove(); gNote.selectAll("*").remove(); gScale.selectAll("*").remove();

        // riu Jordà
        const rPath=d3.geoPath(p);
        gMap.append("path").attr("d",rPath(RIV)).attr("fill","none").attr("stroke",V.alpha(C.blau,.55)).attr("stroke-width",1.1);

        // etiquetes d'aigua i regions
        if(step!==1){
          const mm=p([34.55,32.25]); V.t(gMap,mm[0],mm[1],"Mar Mediterrani",{size:mob?11:12,italic:true,fill:C.muted,anchor:"middle",halo:true});
          const ds=lf(35.5,31.45); V.t(gMap,ds[0]+6,ds[1],"Mar Mort (−415 m)",{size:11,italic:true,fill:C.blau,halo:true});
        }
        const lgPt=lf(35.62,32.81);
        V.t(gMap,lgPt[0]+(step===1?12:8),lgPt[1]+4,"Llac de Galilea",{size:11.5,italic:true,fill:C.blau,halo:true});
        if(step===1) V.t(gMap,lgPt[0]+12,lgPt[1]+17,"−212 m",{size:11,fill:C.blau,halo:true});

        // pas 2: dos governants
        if(step===2){
          const a1=lf(34.7,32.48), a2=lf(35.7,32.48);
          gMap.append("line").attr("x1",a1[0]).attr("y1",a1[1]).attr("x2",a2[0]).attr("y2",a2[1])
            .attr("stroke",C.ink2).attr("stroke-width",1.1).attr("stroke-dasharray","4 4");
          const g1=lf(35.35,32.98), g2=lf(35.15,31.52);
          V.lines(gNote,g1[0],g1[1],[["GALILEA · Herodes Antipes",true,C.blau],["Príncep jueu aliat de Roma",false,C.ink2]],{anchor:"middle",size:mob?11.5:12.5,halo:3.5});
          V.lines(gNote,g2[0],g2[1]+18,[["JUDEA · Ponç Pilat",true,C.vermell],["Prefecte romà directe (26–36 dC)",false,C.ink2]],{anchor:"middle",size:mob?11.5:12.5,halo:3.5});
        }

        // pas 3 i 4: rutes
        if(step===3||step===4){
          const ptsM=MARC_R.map(q=>lf(q[0],q[1]));
          const pm=gRoute.append("path").attr("d",curve(ptsM)).attr("fill","none")
            .attr("stroke",step===3?C.vermell:C.ghost).attr("stroke-width",step===3?2.4:1.4)
            .attr("stroke-dasharray",step===4?"4 3":null);
          if(step===3&&isEnd) drawAnim(pm,1100);
        }
        if(step===4){
          JOAN_R.forEach((segPts,idx)=>{
            const pts=segPts.map(q=>lf(q[0],q[1]));
            const bend=idx===0?-.14:idx===1?.18:idx===2?.08:-.15;
            const pj=gRoute.append("path").attr("d",curve(pts,pts.length===2?bend:0)).attr("fill","none")
              .attr("stroke",C.grocFosc).attr("stroke-width",2.2).attr("stroke-opacity",.85);
            if(isEnd) drawAnim(pj,900,idx*240);
          });
          if(!mob){
            const jn=lf(35.02,32.15);
            V.lines(gNote,jn[0]-12,jn[1],[["Joan narra 3 Pasqües",true,C.ink],["Anades i vingudes → ≈ 3 anys",false,C.ink2]],{anchor:"end",size:12,halo:3.5});
          }
        }

        // ciutats visibles
        const show=new Set(SHOW[step]);
        const visible=E.llocs.filter(d=>show.has(d.nom));
        visible.forEach(d=>{
          const q=lf(d.lon,d.lat);
          const isKey=(d.nom==="Jerusalem"&&(step===0||step>=2))||(d.nom==="Natzaret"&&step===1)||(d.nom==="Cafarnaüm"&&(step===1||step===3));
          const col=step===4?C.grocFosc:(isKey?C.vermell:C.ink);
          gPts.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",isKey?4.8:3.3)
            .attr("fill",col).attr("stroke",C.paper).attr("stroke-width",1.3);
          const leftSide=d.nom==="Natzaret"||d.nom==="Canà"||d.nom==="Betlem"||d.nom==="Sicar"||d.nom==="Jerusalem";
          const dx=leftSide?-9:9, dy=d.nom==="Betlem"?10:d.nom==="Betània"?12:3;
          V.t(gPts,q[0]+dx,q[1]+dy,d.nom,{anchor:leftSide?"end":"start",weight:isKey?700:500,size:mob?11.5:12.5,fill:isKey?C.ink:C.ink2,halo:3.5});
        });

        drawMiniMed();
        kmBar(gScale,p,12,h-12,step===1?15:40);
      }

      function go(st){
        step=st; const m=META[step];
        const tEl=$("#mapa-t"), sEl=$("#mapa-s"), lgEl=$("#mapa-lg");
        if(tEl)tEl.textContent=m.t; if(sEl)sEl.textContent=m.s; lg(lgEl,m.lg);
        const target=zm.fit(VIEW[step]);
        cancelAnimationFrame(raf);
        if(V.reduced){ curV=target; render(curV,true); return; }
        const from=curV, t0=performance.now(), dur=750;
        const tick=now=>{ const k=clamp((now-t0)/dur,0,1); curV=zm.lerp(from,target,ease(k)); render(curV,k>=1); if(k<1)raf=requestAnimationFrame(tick); };
        raf=requestAnimationFrame(tick);
      }

      // hover sobre poblacions
      const off=()=>{ gHv.selectAll("*").remove(); tp.hide(); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const p=zm.p, vex=(step===1?.011:.0085)*(mob?.75:1), lf=lift(p,vex);
        const d=d3.least(E.llocs,q=>{ const xy=lf(q.lon,q.lat); return Math.hypot(px-xy[0],py-xy[1]); });
        if(!d){ off(); return; }
        const xy=lf(d.lon,d.lat); if(Math.hypot(px-xy[0],py-xy[1])>(mob?36:28)){ off(); return; }
        gHv.selectAll("*").remove();
        gHv.append("circle").attr("cx",xy[0]).attr("cy",xy[1]).attr("r",10).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.5);
        const z=Math.round(zOf(d.lon,d.lat)||0), tot=d3.sum(B,b=>d.n[b]);
        const det=B.filter(b=>d.n[b]>0).map(b=>`${NOM[b]} ${d.n[b]}`).join(" · ");
        tp.show(`<b>${d.nom}</b> · ${z>=0?"+":""}${f0(z)} m<br>Anomenat <b>${tot}</b> ${tot===1?"vegada":"vegades"} als evangelis${det?`<br><span style="color:${C.muted}">${det}</span>`:""}${d.nota?`<br><i>${d.nota}</i>`:""}`,xy[0]+14,xy[1]-10);
      },off);

      api={go};
      render(curV,true);
      const m=META[step]; lg($("#mapa-lg"),m.lg);
    });

    const sc=$("#s-mapa");
    if(sc&&window.IB&&IB.scrolly) IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(idx,el)=>{ const k=el&&el.dataset.s!=null?+el.dataset.s:idx; if(!isNaN(k)&&api)api.go(k); });
  })();

  /* =====================================================================
     V4 · PUJAR A JERUSALEM (IB-32 franja + IB-16 perfil interactiu)
     ===================================================================== */
  (function(){
    const el=$("#pujada"); if(!el)return;
    const WAYS=[
      {nom:"Cafarnaüm",lon:35.575,lat:32.881,nota:"Riba nord del llac de Galilea"},
      {nom:"Vall del Jordà",lon:35.57,lat:32.42,nota:"Tram pla sota el nivell del mar"},
      {nom:"Jericó",lon:35.444,lat:31.871,nota:"Comença la pujada forta cap a Judea"},
      {nom:"Betània",lon:35.262,lat:31.771,nota:"Vessant oriental del Mont de les Oliveres"},
      {nom:"Jerusalem",lon:35.235,lat:31.778,nota:"Ciutat del Temple (+764 m)"}
    ];
    // mostregem la ruta en 160 punts amb alçades reals SRTM
    const PTS=[]; let dist=0;
    for(let i=0;i<WAYS.length-1;i++){
      const a=WAYS[i], b=WAYS[i+1], segKm=kmBetween([a.lon,a.lat],[b.lon,b.lat]), steps=40;
      for(let j=0;j<steps;j++){
        const u=j/steps, lon=a.lon+(b.lon-a.lon)*u, lat=a.lat+(b.lat-a.lat)*u;
        PTS.push({km:dist+segKm*u, lon, lat, z:elev(lon,lat)});
      }
      dist+=segKm;
    }
    const last=WAYS[WAYS.length-1]; PTS.push({km:dist,lon:last.lon,lat:last.lat,z:elev(last.lon,last.lat)});
    // distància de cada fita
    let acc=0; WAYS[0].km=0;
    for(let i=1;i<WAYS.length;i++){ acc+=kmBetween([WAYS[i-1].lon,WAYS[i-1].lat],[WAYS[i].lon,WAYS[i].lat]); WAYS[i].km=acc; }
    const TOTKM=dist;

    const rng=$("#pujada-rng"), btn=$("#pujada-play"), rd=$("#pujada-r");
    let frac=1, playing=false, raf=0, drawPos=null;

    V.mount(el,(node,w)=>{
      const mob=w<640, h=mob?250:290, M={t:26,r:mob?20:36,b:44,l:mob?46:54};
      const s=V.svg(node,w,h,"Perfil topogràfic del camí de Cafarnaüm a Jerusalem: baixa per la vall del Jordà a −213 m fins a Jericó i puja gairebé 1.000 metres fins a Jerusalem (+764 m).");
      const x=d3.scaleLinear([0,TOTKM],[M.l,w-M.r]);
      const y=d3.scaleLinear([-320,960],[h-M.b,M.t]);

      // quadrícula horitzontal
      V.gridY(s,y,M.l,w-M.r,[-200,0,200,400,600,800],v=>v===0?"0 m (nivell del mar)":(v>0?"+":"")+v+" m",{zero:true});
      // franja sota el nivell del mar
      s.append("rect").attr("x",M.l).attr("y",y(0)).attr("width",w-M.l-M.r).attr("height",h-M.b-y(0))
        .attr("fill",V.alpha(C.blau,.08));

      // àrea i línia del perfil
      const area=d3.area().x(d=>x(d.km)).y0(y(0)).y1(d=>y(d.z)).curve(d3.curveMonotoneX);
      const line=d3.line().x(d=>x(d.km)).y(d=>y(d.z)).curve(d3.curveMonotoneX);

      // àrea gris suau sobre zero i blau sota zero via clipPaths
      const id="pj"+Math.random().toString(36).slice(2,6), defs=s.append("defs");
      defs.append("clipPath").attr("id",id+"hi").append("rect").attr("x",M.l).attr("y",M.t).attr("width",w-M.l-M.r).attr("height",y(0)-M.t);
      defs.append("clipPath").attr("id",id+"lo").append("rect").attr("x",M.l).attr("y",y(0)).attr("width",w-M.l-M.r).attr("height",h-M.b-y(0));
      s.append("path").datum(PTS).attr("d",area).attr("clip-path",`url(#${id}hi)`).attr("fill",V.alpha(C.land,.85));
      s.append("path").datum(PTS).attr("d",area).attr("clip-path",`url(#${id}lo)`).attr("fill",V.alpha(C.blau,.22));

      const pBase=s.append("path").datum(PTS).attr("d",line).attr("fill","none").attr("stroke",C.ghost).attr("stroke-width",1.5);
      const pActive=s.append("path").datum(PTS).attr("d",line).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.5);

      // anotació de la pujada forta
      const jer=WAYS[2], jrs=WAYS[4];
      if(!mob){
        V.note(s,{x:x((jer.km+jrs.km)/2),y:y(320),tx:x(jer.km)-14,ty:y(680),kind:"elbow",anchor:"end",
          lines:[["+977 m en 23 km",true],["Com pujar a Montserrat des del mar"]]});
      }

      // fites
      WAYS.forEach((d,i)=>{
        if(mob&&d.nom==="Betània")return;
        const z=elev(d.lon,d.lat), cx=x(d.km), cy=y(z);
        s.append("line").attr("x1",cx).attr("y1",cy).attr("x2",cx).attr("y2",h-M.b).attr("stroke",C.hair).attr("stroke-dasharray","2 2");
        s.append("circle").attr("cx",cx).attr("cy",cy).attr("r",i===0||i===4?4.5:3.2).attr("fill",i===4?C.vermell:C.ink).attr("stroke",C.paper).attr("stroke-width",1.2);
        if(mob&&d.nom==="Jericó"){
          V.lines(s,cx-6,cy-22,[["Jericó",true,C.ink],[`${Math.round(z)} m`,false,C.blau]],{anchor:"end",size:11,halo:3});
          return;
        }
        const anc=i===0?"start":i===4?"end":"middle";
        V.t(s,cx,h-M.b+16,d.nom,{anchor:anc,weight:i===0||i===4?700:500,size:11.5,fill:C.ink});
        V.t(s,cx,h-M.b+30,`${z>=0?"+":""}${Math.round(z)} m`,{anchor:anc,size:11,fill:z<0?C.blau:C.muted});
      });

      // indicador dinàmic del viatger
      const hv=s.append("g").attr("pointer-events","none");
      const vLine=hv.append("line").attr("y1",M.t).attr("y2",h-M.b).attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-dasharray","2 2");
      const vDot=hv.append("circle").attr("r",5.5).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.8);
      const vLab=V.t(hv,0,0,"",{weight:700,size:12,fill:C.ink,halo:3.5});
      const tp=V.tip(node);

      drawPos=function(f){
        frac=clamp(f,0,1);
        const idx=Math.round(frac*(PTS.length-1)), pt=PTS[idx];
        const cx=x(pt.km), cy=y(pt.z);
        const len=pActive.node().getTotalLength();
        pActive.attr("stroke-dasharray",`${len*frac} ${len}`);
        vLine.attr("x1",cx).attr("x2",cx);
        vDot.attr("cx",cx).attr("cy",cy);
        const right=cx<w-120;
        vLab.attr("x",cx+(right?10:-10)).attr("y",cy-10).attr("text-anchor",right?"start":"end")
          .text(`${Math.round(pt.km)} km · ${pt.z>=0?"+":""}${Math.round(pt.z)} m`);
        // fita més propera
        const near=d3.least(WAYS,q=>Math.abs(q.km-pt.km));
        if(rng){ rng.value=Math.round(frac*100); rng.setAttribute("aria-valuetext",`${Math.round(pt.km)} km, prop de ${near.nom}, alçada ${Math.round(pt.z)} metres`); }
        if(rd) rd.innerHTML=`<b>Km ${Math.round(pt.km)} de ${Math.round(TOTKM)}</b> · Alçada: <b>${pt.z>=0?"+":""}${Math.round(pt.z)} m</b>${Math.abs(near.km-pt.km)<14?` — prop de <b>${near.nom}</b> (${near.nota})`:""}`;
      };

      V.onView(node,instant=>{
        if(instant){ drawPos(1); return; }
        const t0=performance.now(), dur=1200;
        const stepA=now=>{ const k=clamp((now-t0)/dur,0,1); drawPos(ease(k)); if(k<1)requestAnimationFrame(stepA); };
        requestAnimationFrame(stepA);
      });

      const hit=s.append("rect").attr("x",M.l).attr("y",M.t).attr("width",w-M.l-M.r).attr("height",h-M.t-M.b).attr("fill","transparent").style("cursor","crosshair");
      V.hover(hit.node(),(ev,[px])=>{
        if(playing)stopPlay();
        const f=clamp((px-M.l)/(w-M.l-M.r),0,1); drawPos(f);
        const pt=PTS[Math.round(f*(PTS.length-1))];
        tp.show(`<b>Km ${Math.round(pt.km)}</b> · ${pt.z>=0?"+":""}${Math.round(pt.z)} m`,x(pt.km),y(pt.z)-16);
      },()=>tp.hide());
      void pBase;
    });

    function stopPlay(){ playing=false; cancelAnimationFrame(raf); if(btn)btn.textContent="Recorre el camí"; }
    if(rng) rng.addEventListener("input",()=>{ if(playing)stopPlay(); drawPos&&drawPos(+rng.value/100); });
    if(btn) btn.addEventListener("click",()=>{
      if(playing){ stopPlay(); return; }
      playing=true; btn.textContent="Atura";
      const start=frac>=.99?0:frac, t0=performance.now(), dur=3800*(1-start);
      const tick=now=>{ if(!playing)return; const k=clamp((now-t0)/Math.max(100,dur),0,1); drawPos&&drawPos(start+(1-start)*k); if(k<1)raf=requestAnimationFrame(tick); else stopPlay(); };
      raf=requestAnimationFrame(tick);
    });
  })();

  /* =====================================================================
     V5 · DOS CAMINS A BETLEM (IB-31 Abans i després amb divisor arrossegable)
     ===================================================================== */
  (function(){
    const el=$("#betlem"); if(!el)return;
    const rd=$("#betlem-r");
    let pos=.5;

    V.mount(el,(node,w)=>{
      const mob=w<640, mapH=mob?310:390, barH=62, h=mapH+barH;
      const {ctx,s}=layered(node,w,mapH,"Comparador interactiu entre el relat del naixement de Mateu (esquerra) i el de Lluc (dreta) sobre el relleu real.");
      // ampliem l'SVG per incloure la barra temporal de 10 anys a sota
      s.attr("height",h).style("position","relative").style("margin-top",(-mapH)+"px");
      const p=d3.geoMercator().fitExtent([[mob?16:36,mob?18:24],[w-(mob?16:36),mapH-(mob?18:24)]],box(33.9,31.1,36.1,33.05));
      const vex=mob?.006:.0075, lf=lift(p,vex);
      ridges(ctx,p,w,mapH,{row:mob?4.6:5,vex,sx:mob?3.5:3,fadeEast:true});

      const id="b31"+Math.random().toString(36).slice(2,6), defs=s.append("defs");
      const clL=defs.append("clipPath").attr("id",id+"l").append("rect").attr("y",0).attr("height",mapH);
      const clR=defs.append("clipPath").attr("id",id+"r").append("rect").attr("y",0).attr("height",mapH);

      // fletxes
      const mkArrow=(aid,col)=>defs.append("marker").attr("id",aid).attr("viewBox","0 -4 8 8").attr("refX",6).attr("refY",0).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto")
        .append("path").attr("d","M0,-3.5L7,0L0,3.5").attr("fill","none").attr("stroke",col).attr("stroke-width",1.4);
      mkArrow(id+"am",C.vermell); mkArrow(id+"al",C.blau);

      const nat=lf(L.Natzaret.lon,L.Natzaret.lat), bet=lf(L.Betlem.lon,L.Betlem.lat), jer=lf(L.Jerusalem.lon,L.Jerusalem.lat);
      const egi=p([34.25,31.22]); // direcció Egipte (SO)

      // CAPA ESQUERRA: MATEU (vermell)
      const gM=s.append("g").attr("clip-path",`url(#${id}l)`);
      // Betlem -> Egipte -> Natzaret
      gM.append("path").attr("d",curve([bet,egi],-.16)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.4).attr("marker-end",`url(#${id}am)`);
      gM.append("path").attr("d",curve([egi,[p([34.7,32.0])[0],p([34.7,32.0])[1]],nat])).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.2).attr("stroke-dasharray","5 4").attr("marker-end",`url(#${id}am)`);
      [[bet,"1. Betlem","Casa familiar · Mags",true],[egi,"2. Fugida a Egipte","Per por d'Herodes el Gran",false],[nat,"3. Natzaret","S'hi instal·len en tornar",false]].forEach(([pt,t1,t2,hi])=>{
        gM.append("circle").attr("cx",pt[0]).attr("cy",pt[1]).attr("r",hi?5.2:3.8).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.3);
        const dx=pt===egi?10:10;
        V.lines(gM,pt[0]+dx,pt[1]+(pt===bet?4:-4),[[t1,true,C.ink],[t2,false,C.ink2]],{size:mob?11:12,halo:3.5});
      });

      // CAPA DRETA: LLUC (blau)
      const gL=s.append("g").attr("clip-path",`url(#${id}r)`);
      // Natzaret -> Betlem -> Jerusalem -> Natzaret
      gL.append("path").attr("d",curve([nat,bet],.18)).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2.4).attr("marker-end",`url(#${id}al)`);
      gL.append("path").attr("d",curve([bet,jer,nat],0)).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2.1).attr("stroke-dasharray","5 4").attr("marker-end",`url(#${id}al)`);
      [[nat,"1. Natzaret","Ja hi viuen Maria i Josep",true],[bet,"2. Betlem","Viatgen pel cens · Pastors",true],[jer,"3. Jerusalem","Temple · Tornen a Natzaret",false]].forEach(([pt,t1,t2,hi])=>{
        gL.append("circle").attr("cx",pt[0]).attr("cy",pt[1]).attr("r",hi?5.2:3.8).attr("fill",C.blau).attr("stroke",C.paper).attr("stroke-width",1.3);
        const anc=pt===bet?"end":"start", dx=pt===bet?-10:10;
        V.lines(gL,pt[0]+dx,pt[1]+(pt===jer?-12:4),[[t1,true,C.ink],[t2,false,C.ink2]],{anchor:anc,size:mob?11:12,halo:3.5});
      });

      // divisor interactiu (IB-31)
      const dv=s.append("g").attr("class","ibx-handle").attr("tabindex",0).attr("role","slider")
        .attr("aria-label","Divisor entre el relat de Mateu i el de Lluc")
        .attr("aria-valuemin",0).attr("aria-valuemax",100).style("cursor","ew-resize").style("outline","none");
      const dl=dv.append("line").attr("y1",0).attr("y2",mapH).attr("stroke",C.ink).attr("stroke-width",1.3);
      const hc=dv.append("g");
      hc.append("circle").attr("r",16).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.3);
      hc.append("path").attr("d","M-4,-5L-9,0L-4,5M4,-5L9,0L4,5").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.3).attr("stroke-linejoin","round");
      const labL=V.t(s,0,20,"◀ Mateu (mags i Egipte)",{anchor:"end",weight:700,size:mob?12:13.5,fill:C.vermell,halo:3.5}).attr("pointer-events","none");
      const labR=V.t(s,0,20,"Lluc (cens i pastors) ▶",{anchor:"start",weight:700,size:mob?12:13.5,fill:C.blau,halo:3.5}).attr("pointer-events","none");

      // barra inferior: la bretxa de 10 anys
      const gb=s.append("g").attr("transform",`translate(0,${mapH+14})`);
      const x0=mob?16:60, x1=w-(mob?16:60), tx=d3.scaleLinear([-8,10],[x0,x1]);
      gb.append("line").attr("x1",x0).attr("y1",16).attr("x2",x1).attr("y2",16).attr("stroke",C.hair).attr("stroke-width",1.2);
      gb.append("line").attr("x1",tx(-4)).attr("y1",16).attr("x2",tx(6)).attr("y2",16).attr("stroke",C.ink).attr("stroke-width",2.2);
      gb.append("circle").attr("cx",tx(-4)).attr("cy",16).attr("r",5).attr("fill",C.vermell);
      gb.append("circle").attr("cx",tx(6)).attr("cy",16).attr("r",5).attr("fill",C.blau);
      V.t(gb,tx(-4),6,"4 aC · Mor Herodes (Mateu)",{anchor:"middle",size:mob?11:12,weight:700,fill:C.vermell});
      V.t(gb,tx(6),6,"6 dC · Cens de Quirini (Lluc)",{anchor:"middle",size:mob?11:12,weight:700,fill:C.blau});
      V.t(gb,tx(1),34,"10 anys de diferència entre les dues dates",{anchor:"middle",size:mob?11:12,fill:C.ink2});

      function set(f){
        pos=clamp(f,0,1); const x=Math.round(pos*w);
        clL.attr("x",0).attr("width",x); clR.attr("x",x).attr("width",w-x);
        dl.attr("x1",x).attr("x2",x); hc.attr("transform",`translate(${x},${mapH/2})`);
        labL.attr("x",x-12).style("opacity",x>120?1:0); labR.attr("x",x+12).style("opacity",x<w-120?1:0);
        dv.attr("aria-valuenow",Math.round(pos*100))
          .attr("aria-valuetext",`${Math.round(pos*100)} % Mateu, ${Math.round((1-pos)*100)} % Lluc`);
        if(rd) rd.innerHTML=pos>.68
          ?"<b>Relat de Mateu:</b> casa a Betlem, mags d'Orient, fugida a Egipte per escapar d'Herodes el Gran (mort el 4 aC) i instal·lació a Natzaret."
          :pos<.32
          ?"<b>Relat de Lluc:</b> casa a Natzaret, viatge a Betlem pel cens de Quirini (6 dC), menjadora, pastors, Temple de Jerusalem i retorn a Natzaret."
          :"<b>Comparació oberta:</b> arrossega el divisor cap a l'esquerra o cap a la dreta (o fes servir les fletxes del teclat) per aïllar cada relat.";
      }
      set(pos);

      let drag=false;
      s.style("touch-action","pan-y");
      const hit=s.insert("rect",".ibx-handle").attr("width",w).attr("height",mapH).attr("fill","transparent").style("cursor","ew-resize");
      const startDrag=ev=>{ const [px]=d3.pointer(ev,s.node()); drag=true; s.node().setPointerCapture&&s.node().setPointerCapture(ev.pointerId); set(px/w); ev.preventDefault(); };
      hit.on("pointerdown",startDrag); dv.on("pointerdown",startDrag);
      s.on("pointermove",ev=>{ if(!drag)return; const [px]=d3.pointer(ev,s.node()); set(px/w); })
       .on("pointerup pointercancel",()=>{ drag=false; });
      dv.on("keydown",ev=>{ const k=ev.key, st=ev.shiftKey?.12:.04;
        if(k==="ArrowLeft"||k==="ArrowDown")set(pos-st); else if(k==="ArrowRight"||k==="ArrowUp")set(pos+st); else if(k==="Home")set(0); else if(k==="End")set(1); else return; ev.preventDefault(); });

      V.onView(node,instant=>{
        if(instant){ set(.5); return; }
        const t0=performance.now(), dur=1000;
        const sw=now=>{ const k=clamp((now-t0)/dur,0,1); set(.15+.35*ease(k)); if(k<1)requestAnimationFrame(sw); };
        requestAnimationFrame(sw);
      });
    });
  })();
})();
