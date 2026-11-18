/* «Una vida, quatre evangelis» · mapes
   Peces del sistema: mapa amb zoom per passos (com El Niño), IB-14 (anells proporcionals) per als llocs,
   IB-13 (trajectòries) per als itineraris i IB-24 (arcs de flux) per a la xarxa de Pau. */
(function(){
  if(!window.d3||!window.IBV||!window.EVG||!window.topojson)return;
  const V=IBV, C=V.C, E=window.EVG;
  const B=["Mt","Mc","Lc","Jn"], NOM={Mt:"Mateu",Mc:"Marc",Lc:"Lluc",Jn:"Joan"};
  const f0=V.fmt(",.0f");
  const $=s=>document.querySelector(s);
  const ease=d3.easeCubicInOut;
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
  // projecció que es pot animar entre dues vistes
  function zoomer(w,h,pad){ const p=d3.geoMercator(); return {p,fit(bx){ const q=d3.geoMercator().fitExtent([[pad,pad],[w-pad,h-pad]],bx); return {s:q.scale(),t:q.translate()}; },
    set(v){ p.scale(v.s).translate(v.t); }, lerp(a,b,k){ const s=a.s*Math.pow(b.s/a.s,k); // escala logarítmica, translació coherent amb el centre
      const ca=[(w/2-a.t[0])/a.s,(h/2-a.t[1])/a.s], cb=[(w/2-b.t[0])/b.s,(h/2-b.t[1])/b.s], c=[ca[0]+(cb[0]-ca[0])*k,ca[1]+(cb[1]-ca[1])*k];
      return {s,t:[w/2-c[0]*s,h/2-c[1]*s]}; }}; }
  let clipN=0;
  function clipG(s,x,y,w,h){ const id="evc"+(++clipN); s.append("clipPath").attr("id",id).append("rect").attr("x",x).attr("y",y).attr("width",w).attr("height",h); return s.append("g").attr("clip-path",`url(#${id})`); }
  function kmBar(g,p,x,y,km){ const a=p([35,32]), lon2=35+km/(111.32*Math.cos(32*Math.PI/180)), b=p([lon2,32]); const px=b[0]-a[0];
    g.append("path").attr("d",`M${x},${y-4}V${y}H${x+px}V${y-4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1);
    V.t(g,x+px+6,y+1,`${km} km`,{size:11.5,fill:C.ink2,halo:true}); }
  function routePath(pts,p,bend){ const P=pts.map(p); if(P.length===2&&bend){ const [a,b]=P, mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, dx=b[0]-a[0], dy=b[1]-a[1];
      return `M${a[0]},${a[1]}Q${mx-dy*bend},${my+dx*bend} ${b[0]},${b[1]}`; }
    return d3.line().curve(d3.curveCatmullRom.alpha(.5))(P); }
  function arrowDefs(s,id,col){ s.append("defs").append("marker").attr("id",id).attr("viewBox","0 0 10 10").attr("refX",8).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto")
    .append("path").attr("d","M0,1L9,5L0,9").attr("fill","none").attr("stroke",col).attr("stroke-width",1.6); }
  function drawIn(sel,dur,delay){ sel.each(function(){ const n=this, Ln=n.getTotalLength(); d3.select(n).attr("stroke-dasharray",`${Ln} ${Ln}`).attr("stroke-dashoffset",Ln)
      .transition().delay(delay||0).duration(V.reduced?0:dur).ease(ease).attr("stroke-dashoffset",0).on("end",function(){ d3.select(this).attr("stroke-dasharray",this.__dash||null); }); }); }

  /* ============ 1. El territori (scrolly) ============ */
  (function(){
    const el=$("#mapa"); if(!el)return;
    const VIEWS=[box(34.15,30.95,36.45,33.68),box(34.55,31.55,36.0,32.95),box(35.12,32.6,35.82,33.0),box(34.2,31.2,36.3,33.3),box(34.6,31.55,36.0,33.0),box(34.6,31.55,36.0,33.0)];
    const TIT=["El territori dels evangelis","Natzaret i Jerusalem","La riba nord del llac","Galilea i Judea al segle I","Marc: un sol viatge","Joan: quatre pujades"];
    const ON=[[],["Natzaret","Jerusalem"],["Cafarnaüm","Betsaida","Corazín","Tiberíades"],[],["Cafarnaüm","Jericó","Jerusalem"],["Cafarnaüm","Jerusalem"]];
    const REG=[{n:"Galilea",lat:32.86,lon:35.3,who:"A"},{n:"Samaria",lat:32.25,lon:35.17,who:"P"},{n:"Judea",lat:31.62,lon:35.0,who:"P"},{n:"Perea",lat:32.0,lon:35.72,who:"A"},{n:"Decàpolis",lat:32.62,lon:35.9,who:"D"},{n:"Fenícia",lat:33.4,lon:35.33,who:"D"}];
    const WAT=[{n:"Mar Mediterrani",lat:32.3,lon:34.45},{n:"Llac de Galilea",lat:32.8,lon:35.7,a:"start"},{n:"Mar Mort",lat:31.5,lon:35.6,a:"start"},{n:"Jordà",lat:32.3,lon:35.52,a:"end"}];
    let step=0, api=null;
    V.mount(el,(node,w)=>{
      const mob=w<640, h=Math.round(mob?Math.min(w*1.05,innerHeight*.43):Math.min(innerHeight-250,w*1.1));
      const s=V.svg(node,w,h,"Mapa de Galilea, Samaria i Judea al segle I amb els llocs dels evangelis. Natzaret és a uns 100 km de Jerusalem; l'activitat de Jesús es concentra a la riba nord del llac de Galilea; Marc narra un sol viatge a Jerusalem i Joan, quatre.").style("overflow","hidden");
      arrowDefs(s,"am-r",C.vermell); arrowDefs(s,"am-b",C.blau);
      const Z=zoomer(w,h,mob?10:24), path=d3.geoPath(Z.p);
      let cur=Z.fit(VIEWS[step]); Z.set(cur);
      const gL=s.append("path").attr("fill",C.land), gR=s.append("path").attr("fill","none").attr("stroke",C.blauClar).attr("stroke-width",1.4), gK=s.append("path").attr("fill",C.paper).attr("stroke",C.blauClar).attr("stroke-width",1);
      const over=s.append("g"), regs=s.append("g"), wat=s.append("g"), rts=s.append("g"), pls=s.append("g"), ann=s.append("g"), sc=s.append("g");
      // mapa de situació
      const ins=s.append("g").attr("transform",`translate(${w-(mob?116:180)},${mob?6:10})`);
      { const iw=mob?110:170, ih=mob?62:96, ip=d3.geoMercator().fitExtent([[0,0],[iw,ih]],box(-6,29,40,46)), ipath=d3.geoPath(ip);
        ins.append("rect").attr("width",iw).attr("height",ih).attr("fill",C.paper).attr("stroke",C.hair);
        ins.append("path").attr("d",ipath(MLAND)).attr("fill",C.land);
        const a=ip([34.15,33.68]), b=ip([36.45,30.95]); ins.append("rect").attr("x",a[0]-1).attr("y",a[1]-1).attr("width",b[0]-a[0]+2).attr("height",b[1]-a[1]+2).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.5);
        V.t(ins,ip([12.5,41.9])[0],ip([12.5,41.9])[1]-4,"Roma",{size:11,anchor:"middle",halo:true,fill:C.ink2});
        ins.append("circle").attr("cx",ip([12.48,41.9])[0]).attr("cy",ip([12.48,41.9])[1]).attr("r",2).attr("fill",C.ink2); }
      function geo(){ gL.attr("d",path(PLAND)); gK.attr("d",path(LAKES)); gR.attr("d",path(RIV)); }
      function labels(){
        regs.selectAll("*").remove(); wat.selectAll("*").remove(); pls.selectAll("*").remove(); sc.selectAll("*").remove();
        const inV=(lon,lat)=>{ const q=Z.p([lon,lat]); return q[0]>-20&&q[0]<w+20&&q[1]>-10&&q[1]<h+10; };
        REG.forEach(r=>{ if(!inV(r.lon,r.lat))return; const q=Z.p([r.lon,r.lat]);
          const col=step===3?(r.who==="A"?C.vermell:r.who==="P"?C.blau:null):null;
          V.t(regs,q[0],q[1],r.n,{size:mob?12:14,italic:true,anchor:"middle",fill:col?C.ink:C.ink2,halo:true,weight:col?700:400});
          if(col){ regs.append("rect").attr("x",q[0]-18).attr("y",q[1]+5).attr("width",36).attr("height",3).attr("fill",col);
            V.t(regs,q[0],q[1]+20,r.who==="A"?"Antipes":"Pilat",{size:11.5,anchor:"middle",fill:C.ink2,halo:true}); } });
        WAT.forEach(r=>{ if(!inV(r.lon,r.lat))return; const q=Z.p([r.lon,r.lat]); if(step===2&&r.n!=="Llac de Galilea")return; let x0=q[0], an=r.a||"middle"; if(an==="middle"&&x0<60){ x0=4; an="start"; } V.t(wat,x0,q[1],r.n,{size:mob?11.5:12.5,italic:true,anchor:an,fill:C.blau,halo:true}); });
        const on=new Set(ON[step]); if(mob&&step===4)on.delete("Betània"); if(mob&&step===3){ on.add("Jerusalem"); on.add("Tiberíades"); }
        E.llocs.forEach(d=>{ if(!inV(d.lon,d.lat))return; const q=Z.p([d.lon,d.lat]), hot=on.has(d.nom);
          if(step===2&&!hot&&d.nom!=="Natzaret")return;
          pls.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",hot?4.2:2.6).attr("fill",hot?C.ink:C.paper).attr("stroke",C.ink).attr("stroke-width",1);
          if(hot||(!mob&&step===0)){ const left=["Betània","Tiberíades","Sicar"].includes(d.nom), up=["Corazín"].includes(d.nom);
            V.t(pls,q[0]+(left?-7:7),q[1]+(up?-6:4),d.nom,{size:hot?(mob?12:13):11.5,weight:hot?700:400,anchor:left?"end":"start",halo:true,fill:hot?C.ink:C.ink2}); } });
        kmBar(sc,Z.p,mob?10:24,h-(mob?10:18),step===2?5:25);
      }
      function overlays(anim){
        rts.selectAll("*").remove(); ann.selectAll("*").remove();
        ins.transition().duration(300).style("opacity",step===0?1:0);
        const P=Z.p;
        if(step===1){ const a=P(ll("Natzaret")), b=P(ll("Jerusalem"));
          const ln=rts.append("line").attr("x1",a[0]).attr("y1",a[1]).attr("x2",b[0]).attr("y2",b[1]).attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-dasharray","4 3");
          V.t(ann,(a[0]+b[0])/2+8,(a[1]+b[1])/2,"≈ 100 km en línia recta",{size:12.5,weight:700,halo:true}); }
        if(step===2&&!mob){ const c=P(ll("Cafarnaüm")), n=P(ll("Natzaret"));
          V.note(ann,{x:c[0],y:c[1]+4,tx:c[0]-(mob?10:30),ty:c[1]+(mob?44:70),kind:"elbow",anchor:"end",lines:[["Cafarnaüm",true],["«a casa seva», segons Marc"]]});
          if(n[1]<h)V.t(ann,n[0],n[1]-10,"Natzaret, a 33 km",{size:11.5,anchor:"middle",halo:true}); }
        if(step===3&&!mob){ const t=P(ll("Tiberíades")), j=P(ll("Jerusalem"));
          V.note(ann,{x:t[0]+3,y:t[1],tx:t[0]+(mob?22:40),ty:t[1]-(mob?22:40),kind:"elbow",anchor:"start",lines:[["Tiberíades",true],["ciutat d'Antipes"]]});
          V.note(ann,{x:j[0]-3,y:j[1],tx:j[0]-(mob?20:40),ty:j[1]+(mob?28:50),kind:"elbow",anchor:"end",lines:[["Jerusalem",true],["on els evangelis situen Pilat per Pasqua"]]}); }
        if(step===4){ const pts=[ll("Cafarnaüm"),[35.6,32.62],[35.64,32.22],ll("Jericó"),ll("Betània"),ll("Jerusalem")];
          const pth=rts.append("path").attr("d",routePath(pts,P)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.4).attr("marker-end","url(#am-r)").attr("stroke-linecap","round");
          if(anim)drawIn(pth,1600);
          const q=P([35.66,32.3]); V.note(ann,{x:q[0]+2,y:q[1],tx:q[0]+(mob?14:30),ty:q[1]-(mob?6:10),kind:"straight",anchor:"start",lines:[["Mc 10,1",true],[mob?"altra banda":"a l'altra banda del Jordà"]]});
          const jc=P(ll("Jericó")); V.t(ann,jc[0]+8,jc[1]+16,"Mc 10,46",{size:11.5,fill:C.ink2,halo:true});
          V.t(ann,P(ll("Jerusalem"))[0]-10,P(ll("Jerusalem"))[1]+22,"≈ 140 km",{size:12.5,weight:700,anchor:"end",halo:true}); }
        if(step===5){ const F=[["2,13","Pasqua",.42,.3],["5,1","una festa",.2,.42],["7,10","les Cabanyes",-.04,.54],["12,12","Pasqua",-.26,.66]];
          const a=ll("Cafarnaüm"), b=ll("Jerusalem");
          F.forEach((f,i)=>{ const pth=rts.append("path").attr("d",routePath([[a[0],a[1]],b],P,f[2])).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2).attr("marker-end","url(#am-b)").style("opacity",.9);
            if(anim)drawIn(pth,800,i*450);
            const node=pth.node(), m=node.getPointAtLength(node.getTotalLength()*f[3]);
            const lab=ann.append("g").style("opacity",anim&&!V.reduced?0:1); lab.append("circle").attr("cx",m.x).attr("cy",m.y).attr("r",9).attr("fill",C.paper).attr("stroke",C.blau).attr("stroke-width",1.2);
            V.t(lab,m.x,m.y+4,String(i+1),{size:11.5,weight:700,anchor:"middle"});
            if(!mob)V.t(lab,m.x+(f[2]>0.1?-13:13),m.y+4,`Jn ${f[0]} · ${f[1]}`,{size:11.5,anchor:f[2]>0.1?"end":"start",halo:true});
            if(anim&&!V.reduced)lab.transition().delay(i*450+400).duration(300).style("opacity",1); }); }
      }
      let raf=0;
      api={go(k,inst){ const from=cur, to=Z.fit(VIEWS[k]); const prevStep=step; step=k;
        document.getElementById("mapa-t").textContent=TIT[k];
        cancelAnimationFrame(raf); rts.selectAll("*").remove(); ann.selectAll("*").remove();
        if(inst||V.reduced||prevStep===k){ cur=to; Z.set(cur); geo(); labels(); overlays(!inst); return; }
        let t0=null; const D=1100;
        const tick=now=>{ if(t0==null)t0=now; const kk=Math.min(1,(now-t0)/D); Z.set(Z.lerp(from,to,ease(kk))); geo();
          if(kk<1){ raf=requestAnimationFrame(tick); } else { cur=to; labels(); overlays(true); } };
        pls.selectAll("*").remove(); regs.selectAll("*").remove(); wat.selectAll("*").remove(); sc.selectAll("*").remove();
        raf=requestAnimationFrame(tick); }};
      api.go(step,true);
      // hover: el lloc més proper
      const tp=V.tip(node), ring=s.append("circle").attr("r",9).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).style("opacity",0);
      s.on("pointermove",ev=>{ const [mx,my]=d3.pointer(ev,s.node()); const d=d3.least(E.llocs,d=>{ const q=Z.p([d.lon,d.lat]); return Math.hypot(q[0]-mx,q[1]-my); });
        const q=Z.p([d.lon,d.lat]); if(Math.hypot(q[0]-mx,q[1]-my)>22){ ring.style("opacity",0); tp.hide(); return; }
        ring.style("opacity",1).attr("cx",q[0]).attr("cy",q[1]);
        tp.show(`<b>${d.nom}</b>${d.nota?`<br><i>${d.nota}</i>`:""}<br>${B.map(b=>`${b} ${d.n[b]}`).join(" · ")} mencions`,q[0],q[1]); })
        .on("pointerleave",()=>{ ring.style("opacity",0); tp.hide(); });
    });
    const sc=$("#s-mapa");
    IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(i,stepEl)=>{ const k=+stepEl.dataset.s; if(api)api.go(k); else step=k; });
  })();

  /* ============ 2. Quins llocs anomena cada evangeli ============ */
  (function(){
    const el=$("#llocs"); if(!el)return;
    const out=$("#llocs-r"), fig=$("#f-llocs");
    let mode="tots", api=null;
    const val=(d,m)=>m==="tots"?d3.sum(B,b=>d.n[b]):d.n[m];
    const MAX=d3.max(E.llocs,d=>val(d,"tots"));
    function msg(m){ const xs=E.llocs.filter(d=>val(d,m)>0).sort((a,b)=>val(b,m)-val(a,m));
      const reg=E.regions.Galilea, gal=m==="tots"?d3.sum(B,b=>reg[b]):reg[m];
      out.innerHTML=`${m==="tots"?"Els quatre evangelis":NOM[m]} anomena${m==="tots"?"n":""} <b>${xs.length}</b> d'aquestes poblacions. La que més: <b>${xs[0].nom}</b>, ${val(xs[0],m)} vegades. La regió de Galilea hi surt ${gal} vegades.`; }
    msg(mode);
    seg(fig,k=>{ mode=k; msg(k); api&&api(k); });
    V.mount(el,(node,w)=>{
      const mob=w<760, mw=mob?w:Math.round(w*.6), mh=Math.round(Math.min(mob?w*1.25:mw*1.2,mob?560:700));
      const rk=mob?{x:0,y:mh+16,w}:{x:mw+30,y:20,w:w-mw-30};
      const nR=mob?8:12, H=mob?mh+30+nR*24:mh;
      const s=V.svg(node,w,H,"Mapa amb un cercle per a cada població anomenada als evangelis, proporcional al nombre de mencions, i rànquing. Jerusalem és la més citada (66 vegades als quatre), sobretot a Lluc (31).");
      const p=d3.geoMercator().fitExtent([[6,6],[mw-6,mh-6]],box(34.7,31.6,35.95,33.62)), path=d3.geoPath(p);
      const mg=clipG(s,0,0,mw,mh);
      mg.append("path").attr("d",path(PLAND)).attr("fill",C.land);
      mg.append("path").attr("d",path(RIV)).attr("fill","none").attr("stroke",C.blauClar).attr("stroke-width",1.2);
      mg.append("path").attr("d",path(LAKES)).attr("fill",C.paper).attr("stroke",C.blauClar);
      const rs=d3.scaleSqrt([0,MAX],[0,mob?30:42]);
      const lgEl=$("#llocs-lg"); lgEl.innerHTML=""; V.legendSize(lgEl,{values:[5,20,60],r:rs,f:v=>String(v),title:"Mencions"});
      E.llocs.forEach(d=>{ [d.x,d.y]=p([d.lon,d.lat]); });
      const g=s.append("g");
      const dots=g.selectAll("g").data(E.llocs.slice().sort((a,b)=>val(b,"tots")-val(a,"tots"))).join("g").attr("transform",d=>`translate(${d.x},${d.y})`);
      dots.append("circle").attr("class","c").attr("fill",V.alpha(C.vermell,.42)).attr("stroke",C.vermell).attr("stroke-width",1);
      dots.append("circle").attr("r",1.6).attr("fill",C.ink);
      const lb=g.append("g");
      // rànquing
      const rkG=s.append("g").attr("transform",`translate(${rk.x},${rk.y})`);
      const bx=d3.scaleLinear([0,MAX],[0,rk.w-(mob?150:130)]);
      const rows=rkG.selectAll("g").data(E.llocs).join("g");
      rows.append("text").attr("class","n").attr("x",mob?100:96).attr("y",14).attr("text-anchor","end").attr("font-size",12.5).attr("font-family",V.SANS).text(d=>d.nom);
      rows.append("rect").attr("x",(mob?106:102)).attr("y",4).attr("height",12).attr("fill",C.vermell);
      rows.append("text").attr("class","v").attr("y",14).attr("font-size",12).attr("font-family",V.SANS).attr("fill",C.ink2);
      if(!mob)V.t(rkG,0,-4,"Mencions",{size:12.5,weight:700});
      const tp=V.tip(node), ring=g.append("circle").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).style("opacity",0);
      let hov=null;
      function set(m,inst){ const dur=inst||V.reduced?0:750;
        dots.select(".c").transition().duration(dur).ease(ease).attr("r",d=>rs(val(d,m)));
        lb.selectAll("*").remove();
        const J=E.llocs.find(d=>d.nom==="Jerusalem"), rJ=rs(val(J,m)), SKIP=new Set(["Corazín","Betsaida","Tiberíades","Naín"]);
        E.llocs.filter(d=>val(d,m)>=(mob?3:2)&&!SKIP.has(d.nom)).forEach(d=>{ const r=rs(val(d,m)), v=val(d,m);
          let xx=d.x+r+4, yy=d.y+4, an="start";
          if(d.nom==="Jerusalem"){ xx=d.x-r-4; an="end"; }
          if(d.nom==="Betània"){ xx=Math.max(xx,J.x+rJ+4); yy=J.y-6; }
          if(d.nom==="Betlem"){ xx=Math.max(xx,J.x+rJ+4); yy=Math.max(d.y+4,J.y+12); }
          V.t(lb,xx,yy,`${d.nom} ${v}`,{size:mob?11.5:12,anchor:an,halo:true,weight:v>=10?700:400}); });
        const sorted=E.llocs.slice().sort((a,b)=>val(b,m)-val(a,m)||a.nom.localeCompare(b.nom));
        const idx=new Map(sorted.map((d,i)=>[d,i]));
        rows.transition().duration(dur).ease(ease).attr("transform",d=>`translate(0,${idx.get(d)*24})`).style("opacity",d=>idx.get(d)<nR&&val(d,m)>0?1:0);
        rows.select("rect").transition().duration(dur).attr("width",d=>bx(val(d,m)));
        rows.select(".v").transition().duration(dur).attr("x",d=>(mob?106:102)+bx(val(d,m))+5).text(d=>val(d,m)); }
      api=k=>set(k,false); set(mode,true);
      function hover(d){ hov=d; dots.style("opacity",e=>!d||e===d?1:.3); rows.style("font-weight",e=>e===d?700:400);
        if(!d){ ring.style("opacity",0); tp.hide(); return; }
        ring.style("opacity",1).attr("cx",d.x).attr("cy",d.y).attr("r",rs(val(d,mode))+3);
        const refs=B.filter(b=>d.refs[b].length).map(b=>`${b} ${d.refs[b].join("; ")}`).join("<br>");
        tp.show(`<b>${d.nom}</b>${d.nota?` · <i>${d.nota}</i>`:""}<br>${B.map(b=>`${NOM[b]} ${d.n[b]}`).join(" · ")}<br><span style="color:#7A7A7A">${refs}</span>`,mob?d.x:d.x,d.y); }
      s.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,s.node());
        let d=null;
        if(mx<mw&&my<mh){ d=d3.least(E.llocs,e=>Math.hypot(e.x-mx,e.y-my)-rs(val(e,mode))); if(Math.hypot(d.x-mx,d.y-my)>Math.max(18,rs(val(d,mode))+8))d=null; }
        hover(d); }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")hover(null); });
      V.onView(node,inst=>{ if(inst)return; dots.select(".c").attr("r",0).transition().delay((d,i)=>i*60).duration(800).ease(d3.easeBackOut).attr("r",d=>rs(val(d,mode))); });
    });
  })();

  /* ============ 3. Dos itineraris cap a Betlem ============ */
  (function(){
    const el=$("#betlem"); if(!el)return;
    const out=$("#betlem-r"), fig=$("#f-betlem");
    const EG=[33.75,30.85];
    const R={Mt:{c:C.vermell,legs:[
        {pts:[[36.1,32.25],ll("Jerusalem"),ll("Betlem")],t:"Uns savis d'orient passen per Jerusalem i troben el nen a Betlem",r:"Mt 2,1–11",mags:1},
        {pts:[ll("Betlem"),[34.6,31.15],EG],t:"Josep fuig amb el nen i la mare a Egipte",r:"Mt 2,13–15",eg:1},
        {pts:[EG,[34.35,31.25],[34.85,31.95],[35.05,32.45],ll("Natzaret")],t:"Morts Herodes, té por del seu fill i s'instal·la a Natzaret, a Galilea",r:"Mt 2,19–23"}]},
      Lc:{c:C.blau,legs:[
        {pts:[ll("Natzaret"),[35.0,32.2],ll("Betlem")],t:"Josep i Maria pugen de Natzaret a Betlem per inscriure's en el cens",r:"Lc 2,1–7"},
        {pts:[ll("Betlem"),ll("Jerusalem")],t:"Presenten el nen al Temple de Jerusalem",r:"Lc 2,22–38",bend:.6},
        {pts:[ll("Jerusalem"),[35.42,32.2],ll("Natzaret")],t:"Tornen a Natzaret, a Galilea",r:"Lc 2,39"}]}};
    let mode="Mt", api=null;
    lg($("#betlem-lg"),[{c:C.vermell,t:"Mateu",k:"ln"},{c:C.blau,t:"Lluc",k:"ln"}]);
    seg(fig,k=>{ mode=k; api&&api(k); });
    V.mount(el,(node,w)=>{
      const mob=w<640, mh=Math.round(Math.min(w*(mob?1.15:.78),640)), th=96, H=mh+th;
      const s=V.svg(node,w,H,"Mapa amb els itineraris de la infància. Mateu: Betlem, fugida a Egipte i Natzaret. Lluc: de Natzaret a Betlem pel cens, el Temple de Jerusalem i tornada a Natzaret. A sota, Herodes mor el 4 aC i el cens de Quirini és del 6 dC.");
      arrowDefs(s,"ab-r",C.vermell); arrowDefs(s,"ab-b",C.blau); arrowDefs(s,"ab-g",C.muted);
      const p=d3.geoMercator().fitExtent([[8,8],[w-8,mh-8]],box(33.65,30.8,36.15,32.95)), path=d3.geoPath(p);
      const mg=clipG(s,0,0,w,mh);
      mg.append("path").attr("d",path(PLAND)).attr("fill",C.land);
      mg.append("path").attr("d",path(RIV)).attr("fill","none").attr("stroke",C.blauClar).attr("stroke-width",1.2);
      mg.append("path").attr("d",path(LAKES)).attr("fill",C.paper).attr("stroke",C.blauClar);
      const eg=p(EG); V.t(s,eg[0]+6,eg[1]+16,"cap a Egipte",{size:12.5,italic:true,fill:C.ink2,halo:true});
      const ori=p([36.1,32.25]); V.t(s,ori[0]-4,ori[1]-8,"d'orient",{size:12,italic:true,anchor:"end",fill:C.ink2,halo:true});
      const rg=s.append("g"), pg=s.append("g"), ng=s.append("g");
      ["Natzaret","Jerusalem","Betlem"].forEach(n=>{ const q=p(ll(n)); pg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",4).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.4);
        V.t(pg,q[0]+(n==="Betlem"?-8:8),q[1]+(n==="Betlem"?14:4),n,{size:13,weight:700,anchor:n==="Betlem"?"end":"start",halo:true}); });
      kmBar(pg,p,10,mh-12,25);
      // tensió de dates
      const tg=s.append("g").attr("transform",`translate(0,${mh+10})`);
      const tx=d3.scaleLinear([-9,10],[mob?14:40,w-(mob?14:40)]);
      tg.append("line").attr("x1",tx(-9)).attr("x2",tx(10)).attr("y1",30).attr("y2",30).attr("stroke",C.ink2);
      [-8,-4,1,6,10].forEach(v=>{ tg.append("line").attr("x1",tx(v)).attr("x2",tx(v)).attr("y1",30).attr("y2",34).attr("stroke",C.muted); V.t(tg,tx(v),48,v<0?`${-v} aC`:`${v} dC`,{size:11.5,anchor:"middle",fill:C.muted}); });
      tg.append("rect").attr("x",tx(-4)).attr("y",26).attr("width",tx(6)-tx(-4)).attr("height",8).attr("fill",C.grid);
      V.t(tg,(tx(-4)+tx(6))/2,22,"≈ 10 anys de distància",{size:12,anchor:"middle",weight:700,halo:true});
      tg.append("circle").attr("cx",tx(-4)).attr("cy",30).attr("r",5).attr("fill",C.vermell);
      tg.append("circle").attr("cx",tx(6)).attr("cy",30).attr("r",5).attr("fill",C.blau);
      V.lines(tg,tx(-4),66,[["Mor Herodes el Gran",true],[mob?"Mateu: ja ha nascut":"Mateu: Jesús ja ha nascut"]],{size:12,anchor:"middle",halo:true});
      V.lines(tg,tx(6),66,[["Cens de Quirini",true],[mob?"Lluc hi lliga el part":"Lluc hi lliga el naixement"]],{size:12,anchor:"middle",halo:true});
      let raf=0;
      function play(m,inst){ rg.selectAll("*").remove(); ng.selectAll("*").remove(); cancelAnimationFrame(raf);
        const ks=m==="tots"?["Mt","Lc"]:[m]; const lines=[]; let delay=0;
        ks.forEach(k=>{ R[k].legs.forEach((lgd,i)=>{ const col=lgd.mags?C.muted:R[k].c;
          const pth=rg.append("path").attr("d",routePath(lgd.pts,p,lgd.bend)).attr("fill","none").attr("stroke",col).attr("stroke-width",lgd.mags?1.4:2.4).attr("stroke-linecap","round")
            .attr("marker-end",`url(#${lgd.mags?"ab-g":k==="Mt"?"ab-r":"ab-b"})`);
          if(lgd.mags||lgd.eg){ pth.attr("stroke-dasharray","5 4"); pth.node().__dash="5 4"; }
          const d0=m==="tots"?0:delay;
          if(!inst)drawIn(pth,900,d0);
          const node=pth.node(), mid=node.getPointAtLength(node.getTotalLength()*(lgd.mags?.75:.5));
          const n=ng.append("g").style("opacity",inst||V.reduced?1:0);
          n.append("circle").attr("cx",mid.x).attr("cy",mid.y).attr("r",9).attr("fill",C.paper).attr("stroke",col).attr("stroke-width",1.3);
          V.t(n,mid.x,mid.y+4,String(i+1),{size:11.5,weight:700,anchor:"middle"});
          if(!inst&&!V.reduced)n.transition().delay(d0+700).duration(250).style("opacity",1);
          lines.push({k,i,t:lgd.t,r:lgd.r,d:d0}); delay+=1100; }); });
        const txt=()=>ks.map(k=>`<b>${NOM[k]}</b>: `+R[k].legs.map((lgd,i)=>`${i+1}. ${lgd.t} (${lgd.r})`).join(" ")).join("<br>");
        out.innerHTML=txt(); }
      api=k=>play(k,false); play(mode,true);
      V.onView(node,inst=>{ if(!inst)play(mode,false); });
    });
  })();

  /* ============ 4. La xarxa de Pau ============ */
  (function(){
    const el=$("#pau"); if(!el)return;
    const out=$("#pau-r"), fig=$("#f-pau");
    const P={Jerusalem:[35.235,31.778],Damasc:[36.292,33.513],Antioquia:[36.16,36.202],Tars:[34.893,36.917],Efes:[27.341,37.941],Corint:[22.879,37.906],"Cèncrees":[22.99,37.884],"Tessalònica":[22.935,40.64],Filips:[24.284,41.013],Roma:[12.483,41.893],"Aràbia":[36.2,30.5],"Galàcia":[32.86,39.93],"Hispània":[-4.0,40.2],"Síria i Cilícia":[36.75,36.75]};
    const VIEW={ga:box(30.5,29.6,39.5,38.2),cartes:box(11,35.2,37.5,42.6),pla:box(-9.5,30,38,45.5)};
    const TT={ga:["Pau segons Gàlates","El seu propi relat, amb els anys que hi dona"],cartes:["Les cartes i els seus destinataris","Mida de cada carta en paraules gregues"],pla:["El pla de Romans","Corint, Jerusalem, Roma i, després, Hispània"]};
    const GA=[{a:"Damasc",b:"Aràbia",t:"Després de la revelació, se'n va a Aràbia",r:"Ga 1,17",d:1},{a:"Aràbia",b:"Damasc",t:"Torna a Damasc",r:"Ga 1,17",d:1},{a:"Damasc",b:"Jerusalem",t:"Tres anys després, quinze dies amb Cefes; hi veu Jaume",r:"Ga 1,18–19"},{a:"Jerusalem",b:"Síria i Cilícia",t:"Va a les regions de Síria i Cilícia",r:"Ga 1,21",d:1},{a:"Síria i Cilícia",b:"Jerusalem",t:"Catorze anys després, torna a Jerusalem",r:"Ga 2,1"},{a:"Jerusalem",b:"Antioquia",t:"A Antioquia, s'enfronta amb Cefes",r:"Ga 2,11–14"}];
    const PLA=[{a:"Corint",b:"Jerusalem",t:"Porta a Jerusalem la col·lecta de Macedònia i Acaia",r:"Rm 15,25–26"},{a:"Jerusalem",b:"Roma",t:"Després vol passar per Roma",r:"Rm 15,23–24"},{a:"Roma",b:"Hispània",t:"i arribar a Hispània",r:"Rm 15,24.28",d:1}];
    const LET=[{c:"Tessalònica",w:1473,t:"1 Tessalonicencs"},{c:"Corint",w:6812+4473,t:"1 i 2 Corintis"},{c:"Filips",w:1626,t:"Filipencs"},{c:"Roma",w:7055,t:"Romans"},{c:"Galàcia",w:2226,t:"Gàlates",reg:1}];
    const km=(a,b)=>Math.round(d3.geoDistance(P[a],P[b])*6371/10)*10;
    let mode="ga", api=null;
    function msg(m){ if(m==="ga")out.innerHTML=GA.map((g,i)=>`${i+1}. ${g.t} (${g.r}).`).join(" ");
      if(m==="cartes")out.innerHTML=`Romans (${f0(7055)} paraules) és la més llarga; Filèmon (${f0(334)}), adreçada a una persona, la més curta. Pau escriu 1 Corintis des d'Efes (1Co 16,8), d'on envien salutacions Àquila i Prisca (1Co 16,19).`;
      if(m==="pla")out.innerHTML=`Corint–Jerusalem, ${f0(km("Corint","Jerusalem"))} km. Jerusalem–Roma, ${f0(km("Jerusalem","Roma"))} km. Pau no diu a quin lloc d'Hispània vol anar. ${PLA.map(g=>`${g.t} (${g.r}).`).join(" ")}`;
      document.getElementById("pau-t").textContent=TT[m][0]; document.getElementById("pau-s").textContent=TT[m][1]; }
    msg(mode);
    lg($("#pau-lg"),[{c:C.vermell,t:"Recorregut",k:"ln"},{c:C.blau,t:"Destinataris",k:""}]);
    seg(fig,k=>{ msg(k); api?api(k):(mode=k); });
    V.mount(el,(node,w)=>{
      const mob=w<640, h=Math.round(mob?w*.95:Math.min(w*.52,560));
      const s=V.svg(node,w,h,"Mapa de la Mediterrània oriental amb els viatges de Pau segons Gàlates, els destinataris de les seves cartes i el pla de Romans: Corint, Jerusalem, Roma i Hispània.").style("overflow","hidden");
      arrowDefs(s,"ap-r",C.vermell);
      const Z=zoomer(w,h,mob?14:30), path=d3.geoPath(Z.p);
      let cur=Z.fit(VIEW[mode]); Z.set(cur);
      const land=s.append("path").attr("fill",C.land), rg=s.append("g"), cg=s.append("g"), pg=s.append("g"), ag=s.append("g");
      const rw=d3.scaleSqrt([0,12000],[0,mob?24:38]);
      function base(){ land.attr("d",path(MLAND)); }
      const SHOW={ga:["Jerusalem","Damasc","Antioquia","Tars"],cartes:["Tessalònica","Corint","Filips","Roma","Efes","Jerusalem","Antioquia"],pla:["Corint","Jerusalem","Roma"]};
      const REGL={ga:["Aràbia","Síria i Cilícia"],cartes:["Galàcia"],pla:["Hispània"]};
      function marks(){ pg.selectAll("*").remove();
        SHOW[mode].forEach(n=>{ const q=Z.p(P[n]); pg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",3.2).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.3);
          const left=(["Jerusalem","Corint","Roma"].includes(n)&&mode!=="cartes")||n==="Tars";
          V.t(pg,q[0]+(left?-7:7),q[1]+(n==="Damasc"?-6:4),n,{size:mob?11.5:12.5,weight:700,anchor:left?"end":"start",halo:true}); });
        REGL[mode].forEach(n=>{ const q=Z.p(P[n]); V.t(pg,q[0]+(n==="Síria i Cilícia"?6:0),q[1]+4,n,{size:mob?12:13,italic:true,anchor:n==="Síria i Cilícia"?"start":"middle",fill:C.ink2,halo:true}); }); }
      let lp=null;
      function routes(anim){ rg.selectAll("*").remove(); cg.selectAll("*").remove(); ag.selectAll("*").remove(); if(lp){ lp.stop(); lp=null; }
        if(mode==="cartes"){
          LET.forEach((l,i)=>{ const q=Z.p(P[l.c]), r=rw(l.w);
            const c=cg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",anim&&!V.reduced?0:r).attr("fill",l.reg?"none":V.alpha(C.blau,.35)).attr("stroke",C.blau).attr("stroke-width",1.2).attr("stroke-dasharray",l.reg?"3 3":null);
            if(anim)c.transition().delay(i*150).duration(700).ease(d3.easeBackOut).attr("r",r);
            const below=["Corint","Roma"].includes(l.c);
            V.lines(ag,q[0],below?q[1]+r+14:q[1]-r-18,[[l.t,true],[`${f0(l.w)} paraules`]],{size:mob?11.5:12,anchor:"middle",halo:true}); });
          const ef=Z.p(P.Efes); V.note(ag,{x:ef[0],y:ef[1]+3,tx:ef[0]+(mob?10:20),ty:ef[1]+(mob?36:50),kind:"elbow",anchor:"start",lines:[["Efes",true],[mob?"escriu 1Co":"Pau escriu des d'aquí 1 Corintis"]]});
          return; }
        const L=mode==="ga"?GA:PLA, paths=[];
        L.forEach((g,i)=>{ const a=Z.p(P[g.a]), b=Z.p(P[g.b]); const dx=b[0]-a[0], dy=b[1]-a[1], bend=mode==="ga"?(i%2?.25:-.25):-.18;
          const d=`M${a[0]},${a[1]}Q${(a[0]+b[0])/2-dy*bend},${(a[1]+b[1])/2+dx*bend} ${b[0]},${b[1]}`;
          const pth=rg.append("path").attr("d",d).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2).attr("marker-end","url(#ap-r)").attr("stroke-linecap","round");
          if(g.d){ pth.attr("stroke-dasharray","5 4"); pth.node().__dash="5 4"; }
          if(anim)drawIn(pth,800,i*700); paths.push(pth.node());
          const m=pth.node().getPointAtLength(pth.node().getTotalLength()*.5);
          const n=ag.append("g").style("opacity",anim&&!V.reduced?0:1);
          n.append("circle").attr("cx",m.x).attr("cy",m.y).attr("r",9).attr("fill",C.paper).attr("stroke",C.vermell).attr("stroke-width",1.2);
          V.t(n,m.x,m.y+4,String(i+1),{size:11.5,weight:700,anchor:"middle"});
          if(mode==="pla"&&g.b!=="Hispània")V.t(n,m.x,m.y-14,`${f0(km(g.a,g.b))} km`,{size:12,weight:700,anchor:"middle",halo:true});
          if(anim&&!V.reduced)n.transition().delay(i*700+500).duration(250).style("opacity",1); });
        // un punt que recorre el viatge sencer
        const dot=rg.append("circle").attr("r",4).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.2).style("opacity",0);
        const lens=paths.map(n=>n.getTotalLength()), tot=d3.sum(lens);
        lp=V.loop(node,t=>{ if(V.reduced)return; const T=(t/ (mode==="ga"?9000:7000))%1, dd=T*tot; let acc=0;
          for(let i=0;i<paths.length;i++){ if(dd<=acc+lens[i]){ const q=paths[i].getPointAtLength(dd-acc); dot.style("opacity",t>L.length*700?1:0).attr("cx",q.x).attr("cy",q.y); break; } acc+=lens[i]; } }); }
      let raf=0;
      function go(m,inst){ const from=cur, to=Z.fit(VIEW[m]); mode=m; cancelAnimationFrame(raf);
        rg.selectAll("*").remove(); cg.selectAll("*").remove(); ag.selectAll("*").remove(); pg.selectAll("*").remove();
        if(inst||V.reduced){ cur=to; Z.set(cur); base(); marks(); routes(!inst); return; }
        let t0=null; const D=1100; const tick=now=>{ if(t0==null)t0=now; const k=Math.min(1,(now-t0)/D); Z.set(Z.lerp(from,to,ease(k))); base();
          if(k<1)raf=requestAnimationFrame(tick); else { cur=to; marks(); routes(true); } }; raf=requestAnimationFrame(tick); }
      api=k=>go(k,false); go(mode,true);
      V.onView(node,inst=>{ if(!inst)routes(true); });
      const tp=V.tip(node);
      s.on("pointermove",ev=>{ const [mx,my]=d3.pointer(ev,s.node()); const ns=SHOW[mode].concat(REGL[mode]);
        const n=d3.least(ns,n=>{ const q=Z.p(P[n]); return Math.hypot(q[0]-mx,q[1]-my); }); const q=Z.p(P[n]);
        if(Math.hypot(q[0]-mx,q[1]-my)>26){ tp.hide(); return; }
        const l=LET.find(e=>e.c===n);
        tp.show(`<b>${n}</b>${n!=="Jerusalem"&&!REGL[mode].includes(n)?`<br>${f0(km("Jerusalem",n))} km de Jerusalem`:""}${l&&mode==="cartes"?`<br>${l.t}: ${f0(l.w)} paraules`:""}`,q[0],q[1]); })
        .on("pointerleave",()=>tp.hide());
    });
  })();
})();
