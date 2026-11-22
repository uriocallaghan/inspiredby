/* Sistema infogràfic d'Inspired by Magazine · Mapes (peces del 22-11-2026): MAP-20 i MAP-21.
   Cada bloc «MAP-nn» és una peça completa que es pot copiar a un article i adaptar.
   Fa servir assets/ib-viz.js (IBV), d3 7.9.0, topojson-client i les dades de dades-map-new.js (window.IBNEW). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.IBNEW;
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f");
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,draw):{redraw(){}}; }

/* =====================================================================
   MAP-20 · GLOBUS AMB PARADES  (dades reals: Seed Portal de NordGen, 20-11-2026)
   Un globus gran, retallat per baix, amb un punt per cada N unitats repartit dins de cada país.
   Cada parada gira el globus fins a un lloc, l'encén en vermell, hi traça l'arc fins al destí i
   posa al costat una frase en serif. Les parades avancen soles (s'aturen en tocar) o amb els botons.
   Exemple: les mostres de llavors guardades a la Volta de Svalbard, pel país de la seu de qui les hi ha dut.
   ===================================================================== */
const M20={
  unit:500,                                   // mostres per punt
  dest:{ll:[15.49,78.24], t:"Volta de Svalbard"},
  stops:[
    {ids:[],   c:[5,38],    k:"Tot el món", q:`${f0(D.svTotal)} mostres de llavors de ${f0(D.svInst)} institucions, guardades dins una muntanya de l'Àrtic.`},
    {ids:[],   c:[15,62],   k:"Svalbard", dest:true, q:"La volta és a més de 100 metres dins la roca, a −18 °C. Cada caixa continua sent de qui l'hi ha portat."},
    {ids:["484"], c:[-95,24],  q:"Des de Mèxic, el centre internacional del blat de moro i el blat n'ha dipositat 190.453: més que ningú."},
    {ids:["608"], c:[118,14],  q:"A les Filipines, l'institut internacional de l'arròs n'hi ha portat 135.597."},
    {ids:["760","422"], c:[38,30], k:"Síria i el Líban", q:"Des d'Alep se'n van dipositar 116.484 entre el 2008 i el 2014. El 2015, amb la guerra, se'n van retirar 38.073 per tornar-les a sembrar al Líban i al Marroc."},
    {ids:["840"], c:[-98,36],  q:"Als Estats Units, el sistema nacional de germoplasma n'ha dipositat 156.950. La Nació Cherokee, nou."}
  ]
};
// punts repartits a l'atzar dins de cada país (àrea uniforme sobre l'esfera), un cop per pàgina
function m20dots(world){
  if(M20.pts)return M20.pts;
  const r=V.rng(20), out=[];
  world.countries.features.forEach(f=>{
    const d=D.svalbard[String(+f.id)]; if(!d)return;
    const n=Math.max(1,Math.round(d.v/M20.unit)), b=d3.geoBounds(f);
    let x0=b[0][0], x1=b[1][0]; if(x1<x0)x1+=360;
    const s0=Math.sin(b[0][1]*Math.PI/180), s1=Math.sin(b[1][1]*Math.PI/180);
    let got=0, tries=0;
    while(got<n&&tries<n*4000){ tries++;
      let lon=x0+r()*(x1-x0); if(lon>180)lon-=360;
      const lat=Math.asin(s0+r()*(s1-s0))*180/Math.PI;
      if(d3.geoContains(f,[lon,lat])){ out.push({id:String(+f.id),ll:[lon,lat]}); got++; }
    }
  });
  M20.feat=new Map(world.countries.features.filter(f=>D.svalbard[String(+f.id)]).map(f=>[String(+f.id),f]));
  return (M20.pts=out);
}
piece("map-20",(el,w)=>{
  const mob=w<640, H=mob?Math.round(w*1.02):Math.min(640,Math.round(w*.62));
  const R=mob?w*.56:Math.min(w*.37,H*.72), cx=mob?w/2:w-R*.92, cy=mob?R+14:R+26;
  d3.select(el).selectAll(".m20").remove();
  const wrap=d3.select(el).insert("div",":first-child").attr("class","m20");
  const {c:cv,ctx}=V.canvas(wrap.node(),w,H,"Globus amb les mostres de llavors dipositades a la Volta de Svalbard, un punt per cada 500 mostres, pel país de la seu de cada institució.");
  const q=wrap.append("div").attr("class","m20-q").attr("aria-live","polite");
  const qk=q.append("p").attr("class","m20-k"), qt=q.append("p").attr("class","m20-t");
  const pg=wrap.append("div").attr("class","m20-pg").attr("role","group").attr("aria-label","Parades");
  const tp=V.tip(el);
  V.world().then(world=>{
    const pts=m20dots(world);
    const proj=d3.geoOrthographic().scale(R).translate([cx,cy]).clipAngle(90).precision(.4);
    const path=d3.geoPath(proj,ctx), grat=d3.geoGraticule10();
    let stop=el.__stop||0, rot=el.__rot||M20.stops[stop].c.slice(), from=rot, to=rot, t0=0, tt=0, arcP=1, hov=null, auto=!V.reduced, last=0;
    const spin=1500;
    function draw(){
      proj.rotate([-rot[0],-rot[1]]);
      ctx.clearRect(0,0,w,H);
      ctx.beginPath(); path(grat); ctx.strokeStyle=C.grid; ctx.lineWidth=.5; ctx.stroke();
      ctx.beginPath(); path(world.land); ctx.fillStyle=C.land; ctx.fill();
      ctx.beginPath(); path(world.borders); ctx.strokeStyle=C.paper; ctx.lineWidth=.6; ctx.stroke();
      ctx.beginPath(); path({type:"Sphere"}); ctx.strokeStyle=C.hair; ctx.lineWidth=.8; ctx.stroke();
      const S=M20.stops[stop], on=new Set(S.ids), ctr=[rot[0],rot[1]], rr=mob?1.25:1.45;
      for(let pass=0;pass<2;pass++){       // primer el context, després el protagonista a sobre
        for(const p of pts){
          const act=on.has(p.id)||hov===p.id; if((pass===1)!==act)continue;
          if(d3.geoDistance(p.ll,ctr)>Math.PI/2-.02)continue;
          const xy=proj(p.ll);
          ctx.fillStyle=act?(hov===p.id&&!on.has(p.id)?C.ink:C.red):V.alpha(C.ink2,hov||on.size?.32:.55);
          ctx.beginPath(); ctx.arc(xy[0],xy[1],act?rr+.35:rr,0,2*Math.PI); ctx.fill();
        }
      }
      // arc del protagonista fins al destí (cercle màxim), que es dibuixa en arribar
      if(on.size&&arcP>0){
        const f=d3.geoCentroid(M20.feat.get(S.ids[0])), ip=d3.geoInterpolate(f,M20.dest.ll);
        const line={type:"LineString",coordinates:d3.range(0,arcP+.001,.02).map(ip)};
        ctx.beginPath(); path(line); ctx.strokeStyle=C.red; ctx.lineWidth=1.3; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
      }
      // destí
      if(d3.geoDistance(M20.dest.ll,ctr)<Math.PI/2-.02){
        const [x,y]=proj(M20.dest.ll);
        ctx.beginPath(); ctx.arc(x,y,4.5,0,2*Math.PI); ctx.strokeStyle=C.blue; ctx.lineWidth=1.6; ctx.stroke();
        ctx.beginPath(); ctx.arc(x,y,1.6,0,2*Math.PI); ctx.fillStyle=C.blue; ctx.fill();
        ctx.font=`${S.dest?700:400} 12.5px ${V.SANS}`; ctx.textAlign="left"; ctx.lineJoin="round";
        ctx.strokeStyle=C.paper; ctx.lineWidth=3; ctx.strokeText(M20.dest.t,x+8,y+4); ctx.fillStyle=C.ink; ctx.fillText(M20.dest.t,x+8,y+4);
      }
    }
    function texts(){
      const S=M20.stops[stop], n=S.ids.reduce((a,id)=>a+D.svalbard[id].v,0);
      qk.text(S.k||D.svalbard[S.ids[0]].n).append("span").text(S.ids.length?` · ${f0(n)} mostres`:"");
      qt.text(S.q);
      pg.selectAll("button.d").attr("aria-pressed",(d,i)=>i===stop);
    }
    function go(i,user){
      if(user)auto=false;
      stop=(i+M20.stops.length)%M20.stops.length; el.__stop=stop;
      from=rot.slice(); to=M20.stops[stop].c; t0=tt; arcP=V.reduced?1:0; hov=null; tp.hide();
      if(V.reduced){ rot=to.slice(); el.__rot=rot; }
      texts(); draw();
    }
    pg.append("button").attr("class","ar").attr("aria-label","Parada anterior").text("←").on("click",()=>go(stop-1,true));
    pg.selectAll("button.d").data(M20.stops).join("button").attr("class","d")
      .attr("aria-label",(d,i)=>`Parada ${i+1}: ${d.k||D.svalbard[d.ids[0]].n}`).on("click",(ev,d)=>go(M20.stops.indexOf(d),true));
    pg.append("button").attr("class","ar").attr("aria-label","Parada següent").text("→").on("click",()=>go(stop+1,true));
    texts(); draw();
    if(el.__loop)el.__loop.stop();
    el.__loop=V.loop(el,(t)=>{
      tt=t;
      const k=Math.min(1,(t-t0)/spin), e=d3.easeCubicInOut(k);
      if(k<1){ rot=[from[0]+(to[0]-from[0])*e, from[1]+(to[1]-from[1])*e]; el.__rot=rot; draw(); last=t; return; }
      if(arcP<1){ arcP=Math.min(1,arcP+.025); draw(); }
      if(auto&&t-t0>7500)go(stop+1,false);
    });
    // hover: el país apuntat es transforma (punts en tinta i més grans) i la resta s'atenua
    V.hover(cv,(ev,[x,y])=>{
      auto=false;
      const ll=proj.invert([x,y]); let id=null;
      if(ll&&d3.geoDistance(ll,[rot[0],rot[1]])<Math.PI/2) for(const [k,f] of M20.feat){ if(d3.geoContains(f,ll)){ id=k; break; } }
      if(id!==hov){ hov=id; draw(); }
      cv.style.cursor=id?"pointer":"default";
      if(id){ const d=D.svalbard[id]; tp.show(`<b>${d.n}</b> · ${f0(d.v)} mostres (${V.fmt(".1~%")(d.v/D.svTotal).replace(".",",")} del total)`); }
      else tp.hide();
    },()=>{ if(hov){ hov=null; draw(); } tp.hide(); });
  });
});

/* =====================================================================
   MAP-21 · MAPA I SÈRIE LLIGATS  (dades reals: casos de còlera notificats a l'OMS, 1949–2024, via Our World in Data)
   A dalt, un mapa pla de cercles translúcids (MAP-03); a sota, la sèrie del total amb barres i els pics anotats.
   Els dos parlen: passar per un any posa el mapa en aquell any; passar per un país en dibuixa la sèrie en vermell.
   ===================================================================== */
const M21={y0:1949, y1:2024};
M21.c=Object.entries(D.cholera).map(([id,d])=>{ const v=new Map(d.v.split(";").map(s=>s.split(":").map(Number))); return {id,n:d.n,v,tot:d3.sum(v.values())}; });
M21.years=d3.range(M21.y0,M21.y1+1).map(y=>({y,v:d3.sum(M21.c,c=>c.v.get(y)||0),top:d3.greatest(M21.c,c=>c.v.get(y)||0)}));
M21.maxY=d3.max(M21.c,c=>d3.max(c.v.values())); M21.maxT=d3.max(M21.c,c=>c.tot);
piece("map-21",(el,w)=>{
  const mob=w<640, gap=mob?30:26, barH=mob?150:170;
  const tp=V.tip(el), lg=document.querySelector('[data-lg="map-21"]');
  V.world().then(world=>{
    const feats=new Map(world.countries.features.map(f=>[String(+f.id),f]));
    // sense l'Antàrtida: el mapa es retalla a la terra habitada i deixa lloc a la sèrie
    const noAnt={type:"FeatureCollection",features:world.countries.features.filter(f=>+f.id!==10)};
    const proj=d3.geoEqualEarth().fitWidth(w-8,noAnt), path=d3.geoPath(proj), bb=path.bounds(noAnt);
    proj.translate([proj.translate()[0]+4-bb[0][0],proj.translate()[1]+4-bb[0][1]]);
    const mapH=Math.ceil(bb[1][1]-bb[0][1])+8, H=mapH+gap+barH+34;
    const s=V.svg(el,w,H,"Mapa i sèrie dels casos de còlera notificats a l'OMS entre el 1949 i el 2024: cercles per país i barres pel total de cada any.");
    const pts=M21.c.filter(c=>feats.has(c.id)).map(c=>{ const p=proj(d3.geoCentroid(feats.get(c.id))); return Object.assign(c,{x:p[0],y:p[1]}); });
    // ajustos de centroide per als països on el centre geomètric cau lluny de la gent (sense Alaska ni la Guaiana)
    const fix={"840":[-98,39],"250":[2.5,46.5]}; pts.forEach(c=>{ if(fix[c.id]){ const p=proj(fix[c.id]); c.x=p[0]; c.y=p[1]; } });
    const gm=s.append("g");
    gm.append("path").attr("d",path(noAnt)).attr("fill",C.land);
    gm.append("path").attr("d",path(world.borders)).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.6);
    const rMax=mob?26:44, rT=d3.scaleSqrt([0,M21.maxT],[0,rMax]), rY=d3.scaleSqrt([0,M21.maxY],[0,rMax*.8]);
    const big=gm.append("text").attr("x",mob?4:w*.02).attr("y",mapH-6).attr("font-family",V.SERIF).attr("font-size",mob?40:72)
      .attr("fill",C.ghost).attr("fill-opacity",.5).attr("letter-spacing","-0.02em");
    const gc=gm.append("g").style("mix-blend-mode","multiply");
    const cs=gc.selectAll("g").data(pts.sort((a,b)=>b.tot-a.tot),d=>d.id).join("g").attr("transform",d=>`translate(${d.x},${d.y})`);
    const disc=cs.append("circle").attr("fill",C.blue).attr("fill-opacity",.28).attr("stroke",C.blue).attr("stroke-width",.6).attr("stroke-opacity",.7).attr("r",0);
    cs.append("circle").attr("r",1.1).attr("fill",C.blue);
    // sèrie
    const gb=s.append("g").attr("transform",`translate(0,${mapH+gap})`);
    const x=d3.scaleBand(M21.years.map(d=>d.y),[0,w]).paddingInner(.22), ymax=d3.max(M21.years,d=>d.v), y=d3.scaleLinear([0,ymax*1.08],[barH,0]);
    const tk=y.ticks(3).filter(v=>v<=ymax*1.08), tl=tk[tk.length-1];
    V.gridY(gb,y,0,w,tk,v=>v?V.fmt(",~f")(v/1e6):"0",{unit:tl===1e6?" milió de casos":" milions de casos",zero:0});
    const bars=gb.append("g").selectAll("rect").data(M21.years).join("rect").attr("x",d=>x(d.y)).attr("width",x.bandwidth())
      .attr("y",barH).attr("height",0).attr("fill",C.blueLight);
    const cb=gb.append("g");                                    // sèrie del país apuntat
    [1950,1970,1990,2010,2024].forEach(v=>{ const cx=x(v)+x.bandwidth()/2, a=cx<18?"start":cx>w-18?"end":"middle";
      V.t(gb,a==="start"?0:a==="end"?w:cx,barH+16,v,{size:V.FS.small,fill:C.muted,anchor:a}); });
    // pics anotats: els tres anys més alts que no són veïns, amb el país que més en va notificar
    const peaks=[]; M21.years.slice().sort((a,b)=>b.v-a.v).forEach(d=>{ if(peaks.length<(mob?3:4)&&peaks.every(p=>Math.abs(p.y-d.y)>4))peaks.push(d); });
    const gn=gb.append("g").attr("opacity",0);
    peaks.forEach(d=>{ const px=x(d.y)+x.bandwidth()/2, edge=px>w-90;
      V.note(gn,{x:px,y:y(d.v)-2,tx:px+(edge?-14:14),ty:Math.max(10,y(d.v)-14),kind:"elbow",anchor:edge?"end":"start",size:11.5,
        lines:[[String(d.y),true],[d.top.n]]}); });
    function mapYear(yr){
      const isY=yr!=null;
      big.text(isY?yr:"1949–2024");
      disc.transition().duration(V.reduced?0:380).attr("r",d=>isY?rY(d.v.get(yr)||0):rT(d.tot));
      bars.attr("fill",d=>d.y===yr?C.blue:C.blueLight);
      if(lg){ lg.innerHTML=""; const rr=isY?rY:rT, vals=(isY?[1e4,1e5,1e6]:[1e5,1e6]).filter(v=>rr(v)>=(v>=1e6?9:15));
        V.legendSize(lg,{values:vals,r:rr,f:v=>v>=1e6?"1 M":v>=1e5?"100.000":"10.000",title:isY?`Casos el ${yr}`:"Casos, 1949–2024",stroke:C.blue}); }
    }
    function showCountry(c){
      cb.selectAll("rect").data(c?M21.years:[],d=>d.y).join("rect").attr("x",d=>x(d.y)).attr("width",x.bandwidth())
        .attr("y",d=>y(c.v.get(d.y)||0)).attr("height",d=>barH-y(c.v.get(d.y)||0)).attr("fill",C.red);
      cs.style("opacity",d=>!c||d===c?1:.5);
      disc.attr("fill",d=>d===c?C.red:C.blue).attr("stroke",d=>d===c?C.ink:C.blue).attr("stroke-width",d=>d===c?1.4:.6);
      cs.filter(d=>d===c).raise();
      gn.style("opacity",c?.5:1);
    }
    mapYear(null);
    V.onView(el,done=>{
      if(done){ disc.attr("r",d=>rT(d.tot)); bars.attr("y",d=>y(d.v)).attr("height",d=>barH-y(d.v)); gn.attr("opacity",1); return; }
      bars.transition().duration(900).delay((d,i)=>i*8).ease(V.EASE).attr("y",d=>y(d.v)).attr("height",d=>barH-y(d.v));
      disc.transition().duration(900).delay((d,i)=>200+i*4).ease(V.EASE).attr("r",d=>rT(d.tot));
      gn.transition().delay(1100).duration(400).attr("opacity",1);
    });
    // hover únic sobre tot el gràfic: a sota, l'any; a dalt, el país més proper
    const del=d3.Delaunay.from(pts,d=>d.x,d=>d.y);
    let curY=null, curC=null;
    const hit=s.append("rect").attr("width",w).attr("height",H).attr("fill","transparent").style("cursor","crosshair");
    V.hover(hit.node(),(ev,[mx,my])=>{
      if(my>mapH+gap/2){
        const yr=d3.least(M21.years,d=>Math.abs(x(d.y)+x.bandwidth()/2-mx)).y;
        if(curC){ curC=null; showCountry(null); }
        if(yr!==curY){ curY=yr; mapYear(yr); }
        const d=M21.years[yr-M21.y0];
        tp.show(`<b>${yr}</b> · ${f0(d.v)} casos notificats · ${d.top.n}, ${f0(d.top.v.get(yr))}`);
      } else {
        const c=pts[del.find(mx,my)], r=+(curY!=null?rY(c.v.get(curY)||0):rT(c.tot));
        if(Math.hypot(c.x-mx,c.y-my)>r+14){ if(curC){ curC=null; showCountry(null); } tp.hide(); return; }
        if(c!==curC){ curC=c; showCountry(c); }
        const v=curY!=null?(c.v.get(curY)||0):c.tot;
        tp.show(`<b>${c.n}</b> · ${f0(v)} casos ${curY!=null?"el "+curY:"entre el 1949 i el 2024"}${curY!=null&&!c.v.has(curY)?" (sense notificació)":""}`);
      }
    },()=>{ curY=null; curC=null; mapYear(null); showCountry(null); tp.hide(); });
  });
});
})();
