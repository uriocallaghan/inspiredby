/* Mostrari del sistema infogràfic d'Inspired by Magazine.
   Cada bloc «IB-nn» és una peça completa que es pot copiar a un article i adaptar-la.
   Fa servir assets/ib-viz.js (IBV) i les dades reals de dades.js (ONI i CO₂). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.IBDATA;
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const sgn=(v,d)=>Math.abs(v)<1e-9?"0":V.signed(v,d==null?1:d);
const sig=x=>1/(1+Math.exp(-x));
function legend(n,fn){ const el=$(`[data-lg="${n}"]`); if(el&&!el.childElementCount)fn(el); }
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,(e,w)=>{ if(draw(e,w)!==false)enter(e,w); }):{redraw(){}}; }
/* Entrada animada comuna: les línies es dibuixen, els cercles creixen, la resta apareix d'esquerra a dreta,
   el text arriba al final. Només la primera vegada que el gràfic es veu (IBV.onView). */
function enter(el,W){
  if(el.__seen||V.reduced)return;
  const svg=d3.select(el).select("svg.ibv"), cv=el.querySelector("canvas.ibv");
  const ok=n=>!n.closest("defs")&&n.style.display!=="none";
  const lines=svg.selectAll("path").filter(function(){ return ok(this)&&this.getAttribute("fill")==="none"&&!this.getAttribute("stroke-dasharray")&&!this.closest(".ibv-note"); });
  const dots=svg.selectAll("circle").filter(function(){ const f=this.getAttribute("fill"); return ok(this)&&+this.getAttribute("r")>0&&!this.closest(".ibv-note"); });
  const shapes=svg.selectAll("rect,path").filter(function(){ const f=this.getAttribute("fill"); return ok(this)&&f&&f!=="none"&&f!=="transparent"; });
  const texts=svg.selectAll("text,.ibv-note");
  const xp=n=>{ try{ const b=n.getBBox(); return Math.max(0,Math.min(1,(b.x+b.width/2)/W)); }catch(e){ return 0; } };
  lines.each(function(){ const l=this.getTotalLength(); d3.select(this).attr("stroke-dasharray",`${l} ${l}`).attr("stroke-dashoffset",l); });
  dots.each(function(){ this.__r=+this.getAttribute("r"); this.__x=xp(this); }).attr("r",0);
  shapes.each(function(){ this.__x=xp(this); }).style("opacity",0);
  texts.style("opacity",0); if(cv)cv.style.opacity=0;
  V.onView(el,inst=>{
    const T=inst?0:1, nl=lines.size(), sq=svg.attr("data-enter")==="seq", span=sq?2600:900;
    lines.transition().delay((d,i)=>T*Math.min(span,i*(span/Math.max(1,nl)))).duration(T*(sq?520:1300)).ease(d3.easeCubicInOut).attr("stroke-dashoffset",0)
      .on("end",function(){ d3.select(this).attr("stroke-dasharray",null).attr("stroke-dashoffset",null); });
    dots.transition().delay(function(){ return T*(80+this.__x*900); }).duration(T*650).ease(d3.easeBackOut.overshoot(1.4)).attr("r",function(){ return this.__r; });
    shapes.transition().delay(function(){ return T*(60+this.__x*800); }).duration(T*700).ease(d3.easeCubicOut).style("opacity",1);
    texts.transition().delay(T*750).duration(T*600).style("opacity",1);
    if(cv){ cv.style.transition=inst?"none":"opacity 1.4s ease .1s"; requestAnimationFrame(()=>cv.style.opacity=1); }
  });
}
function layer(el,w,h,label){ // canvas a sota (molts punts) + svg a sobre (eixos, text)
  d3.select(el).selectAll("canvas.ibv,svg.ibv").remove(); el.style.height=h+"px";
  const {ctx}=V.canvas(el,w,h,label);
  const s=V.svg(el,w,h,""); s.attr("aria-hidden","true").attr("role",null).style("position","absolute").style("left",0).style("top",0);
  return {ctx,s};
}
function landMask(proj,w,h,feature){ // màscara ràpida de terra: es pinta en un canvas i es llegeix el píxel
  const c=document.createElement("canvas"); c.width=w; c.height=h; const x=c.getContext("2d");
  x.fillStyle="#000"; x.beginPath(); d3.geoPath(proj,x)(feature); x.fill();
  const im=x.getImageData(0,0,w,h).data;
  return (px,py)=>{ px=Math.round(px); py=Math.round(py); if(px<0||py<0||px>=w||py>=h)return false; return im[(py*w+px)*4+3]>0; };
}
function legendSteps(el,o){ // llegenda per franges (IB-15)
  const d=d3.select(el).append("div").attr("class","ibv-lg");
  if(o.title)d.append("div").attr("class","ibv-lg-t").text(o.title);
  const n=o.colors.length, cw=o.cw||24, s=d.append("svg").attr("width",cw*n).attr("height",26).style("overflow","visible");
  o.colors.forEach((c,i)=>s.append("rect").attr("x",i*cw).attr("width",cw-1).attr("height",8).attr("fill",c));
  o.thresholds.forEach((v,i)=>{ if(i===0)return; s.append("text").attr("x",i*cw-.5).attr("y",21).attr("text-anchor","middle").attr("font-size",V.FS.min).attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(o.f?o.f(v):v); });
}

/* ---------- hover comú: sempre s'ha de saber què apuntes ---------- */
function hv(g){ return g.append("g").attr("class","hv").style("pointer-events","none"); }
// píndola sobre l'eix: fons de tinta, valor en blanc i negreta
function pill(g,x,y,txt,o){ o=o||{}; const gg=g.append("g");
  const t=gg.append("text").attr("x",x).attr("y",y).attr("text-anchor",o.anchor||"middle").attr("dy","0.35em").attr("font-size",11.5).attr("font-weight",700).attr("fill","#fff").style("font-variant-numeric","tabular-nums").text(txt);
  const b=t.node().getBBox(); gg.insert("rect","text").attr("x",b.x-5).attr("y",b.y-2.5).attr("width",b.width+10).attr("height",b.height+5).attr("rx",2).attr("fill",o.fill||C.ink); return gg; }
// anell de ressaltat amb halo blanc
function ring(g,x,y,r,c){ g.append("circle").attr("cx",x).attr("cy",y).attr("r",r).attr("fill","none").attr("stroke","#fff").attr("stroke-width",4);
  return g.append("circle").attr("cx",x).attr("cy",y).attr("r",r).attr("fill","none").attr("stroke",c||C.ink).attr("stroke-width",1.6); }
function guide(g,x1,y1,x2,y2){ return g.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2.5"); }
// apaga la resta: on(d)=true es queda a 1
function dim(sel,on,lo){ sel.interrupt().transition().duration(150).style("opacity",on?function(d,i){ return on.call(this,d,i)?1:(lo==null?.18:lo); }:1); }
function hitRect(s,w,h,cur){ return s.append("rect").attr("class","hit").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor",cur||"crosshair"); }

/* ---------- dades derivades (ONI i CO₂, reals) ---------- */
const ONI_YEARS=Object.keys(D.oni).map(Number).sort((a,b)=>a-b);
const ONI_PTS=[]; ONI_YEARS.forEach(y=>D.oni[y].forEach((v,k)=>ONI_PTS.push({y,k,v,t:y+k/12+1/24})));
const NOW=2026, NOWV=D.oni[NOW], NOWK=NOWV.length-1;
const SEASON=["des–feb","gen–març","feb–abr","març–maig","abr–juny","maig–jul","juny–ag","jul–set","ag–oct","set–nov","oct–des","nov–gen"];
const CO2=[]; Object.keys(D.co2).map(Number).sort((a,b)=>a-b).forEach(y=>D.co2[y].forEach((v,k)=>{ if(v!=null)CO2.push({y,k,v,t:y+k/12}); }));

/* =====================================================================
   COMPONENTS
   ===================================================================== */
(function c1(){ const el=$('[data-c="1"]'); if(!el)return;
  const hd=d3.select(el).append("div").attr("class","vh");
  const l=hd.append("div"); l.append("strong").text("Concentració de CO₂"); l.append("span").text("Mauna Loa, mitjana mensual · setembre del 2026: 426,1 ppm");
  V.legendCat(hd.append("div").attr("class","lgs").node(),[{c:C.ghost,t:"Altres anys",kind:"line",w:1},{c:C.vermell,t:"2026",kind:"line",w:2.2}]);
  const box=el.appendChild(document.createElement("div"));
  V.mount(box,(b,w)=>{ const h=70,s=V.svg(b,w,h,"Exemple de capçalera amb un gràfic petit"); const g=s.append("g");
    const x=d3.scalePoint(d3.range(12),[0,w]), yrs=d3.range(2016,2027), all=yrs.flatMap(y=>D.co2[y].filter(v=>v!=null));
    const y=d3.scaleLinear(d3.extent(all),[h-4,4]);
    yrs.forEach(yr=>{ const a=D.co2[yr].map((v,k)=>[k,v]).filter(d=>d[1]!=null);
      g.append("path").attr("d",d3.line(d=>x(d[0]),d=>y(d[1])).curve(d3.curveMonotoneX)(a)).attr("fill","none").attr("stroke",yr===2026?C.vermell:C.ghost).attr("stroke-width",yr===2026?2.2:1); }); });
})();
legendRampDemo();
function legendRampDemo(){ const el=$('[data-c="2"]'); if(!el)return;
  const w=d3.select(el).append("div").style("display","flex").style("gap","28px").style("flex-wrap","wrap").node();
  V.legendRamp(w,{scale:V.div(2.5),min:-2.5,max:2.5,ticks:[-2,-1,0,1,2],f:v=>sgn(v,0),title:"Temperatura respecte al normal (°C)",lo:"Més freda",hi:"Més calenta"});
  V.legendRamp(w,{scale:V.seq(C.blau,[0,20]),min:0,max:20,ticks:[5,10,15],title:"Anys per cel·la",lo:"Pocs",hi:"Molts",w:150});
}
(function c3(){ const el=$('[data-c="3"]'); if(!el)return;
  V.legendSize(el,{title:"Esdeveniments per setmana",values:[100,500,1000],r:d3.scaleSqrt([0,1200],[0,30]),f:f0});
})();
(function c4(){ const el=$('[data-c="4"]'); if(!el)return;
  const w=d3.select(el).append("div").style("display","flex").style("gap","34px").style("flex-wrap","wrap").node();
  V.legendCat(w,[{c:C.vermell,t:"Categoria 1"},{c:C.blau,t:"Categoria 2"},{c:C.groc,t:"Categoria 3"}],{title:"Punt"});
  V.legendCat(w,[{c:C.ink,t:"Mitjana",kind:"line",w:1.6},{c:C.ghost,t:"Cada any",kind:"line",w:1},{c:C.ink2,t:"Llindar",kind:"line",w:1.4,dash:"1.5 3.5"}],{title:"Línia"});
  V.legendCat(w,[{c:C.vermell,t:"1 anell = 1 cas",kind:"ring"},{c:C.ink,t:"Cas destacat",kind:"hollow"}],{title:"Anell i cercle buit"});
})();
(function c5(){ const el=$('[data-c="5"]'); if(!el)return;
  V.mount(el,(e,w)=>{ const h=250,s=V.svg(e,w,h,"Exemples d'anotació: colze, fletxa corba, caixa discontínua i llindar puntejat"), g=s.append("g"), r=V.rng(5);
    for(let i=0;i<160;i++){ const x=w*.08+r()*w*.55, y=60+r()*150; g.append("circle").attr("cx",x).attr("cy",y).attr("r",2).attr("fill",C.blau).attr("fill-opacity",.25); }
    V.rule(g,0,w,215); V.t(g,4,209,"Zona baixa ▼",{italic:true,size:12,fill:C.ink2,halo:true});
    V.box(g,w*.42,62,w*.22,70);
    V.note(g,{x:w*.64,y:80,tx:w*.72,ty:40,kind:"elbow",lines:[["Caixa discontínua",true],["assenyala una zona"]]});
    g.append("circle").attr("cx",w*.2).attr("cy",120).attr("r",4).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
    V.note(g,{x:w*.2,y:116,tx:w*.06,ty:36,kind:"elbow",anchor:"start",lines:[["Colze",true],["per a un punt concret"]]});
    V.note(g,{x:w*.6,y:170,tx:w*.8,ty:160,kind:"curve",bend:-14,lines:[["Fletxa corba",true],["per a un canvi"]]});
  });
})();
(function c6(){ const el=$('[data-c="6"]'); if(!el)return;
  V.mount(el,(e,w)=>{ const h=200,s=V.svg(e,w,h,"Exemple d'eixos: quadrícula horitzontal clara, zero en tinta"), g=s.append("g");
    const x=d3.scaleLinear([1990,2026],[28,w-6]), y=d3.scaleLinear([-1.5,2.5],[h-28,12]);
    V.gridY(g,y,0,w,[-1,0,1,2],v=>sgn(v,0),{zero:0,unit:" °C"});
    V.axisX(g,x,h-28,[1990,2000,2010,2020],d=>d);
    const a=ONI_PTS.filter(d=>d.y>=1990);
    g.append("path").attr("d",d3.line(d=>x(d.t),d=>y(d.v))(a)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
  });
})();
(function c7(){ const el=$('[data-c="7"]'); if(!el)return;
  el.innerHTML=`<div class="ctl"><div class="lbl"><span>Intensitat</span><span id="c7v">+1,0 °C</span></div>
  <input class="rng" type="range" min="-2" max="2" step=".1" value="1" aria-label="Intensitat" aria-valuetext="+1,0 °C">
  <div class="lbl"><span>La Niña</span><span>Neutral</span><span>El Niño</span></div></div>
  <div class="ctlbar"><div class="seg" role="group" aria-label="Vista"><button aria-pressed="true">Mapa</button><button aria-pressed="false">Tall</button><button aria-pressed="false">Sèrie</button></div><button class="playb">Reprodueix</button></div>`;
  const r=el.querySelector(".rng"); r.addEventListener("input",()=>{ const t=sgn(+r.value)+" °C"; el.querySelector("#c7v").textContent=t; r.setAttribute("aria-valuetext",t); });
  el.querySelectorAll(".seg button").forEach(b=>b.addEventListener("click",()=>el.querySelectorAll(".seg button").forEach(o=>o.setAttribute("aria-pressed",o===b))));
})();
(function c8(){ const el=$('[data-c="8"]'); if(!el)return;
  V.mount(el,(e,w)=>{ const h=150,s=V.svg(e,w,h,"Exemple de tooltip"), g=s.append("g");
    const a=ONI_PTS.filter(d=>d.y>=2015), x=d3.scaleLinear(d3.extent(a,d=>d.t),[0,w]), y=d3.scaleLinear([-1.8,2.8],[h-6,6]);
    g.append("path").attr("d",d3.line(d=>x(d.t),d=>y(d.v))(a)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
    const p=a.find(d=>d.y===2015&&d.k===10); g.append("line").attr("x1",x(p.t)).attr("x2",x(p.t)).attr("y1",0).attr("y2",h).attr("stroke",C.ink).attr("stroke-width",.6);
    g.append("circle").attr("cx",x(p.t)).attr("cy",y(p.v)).attr("r",3.5).attr("fill",C.ink).attr("stroke","#fff");
    const tp=V.tip(e); tp.show(`<b>${V.MES[p.k]} ${p.y}</b><br>ONI ${sgn(p.v)} °C`,x(p.t),y(p.v)+70);
  });
})();

/* =====================================================================
   IB-01 · FEIX D'ANYS  (dades reals: ONI)
   ===================================================================== */
legend(1,el=>V.legendCat(el,[{c:C.ghost,t:"Cada any, 1950–2025",kind:"line",w:1},{c:C.ink,t:"1997",kind:"line",w:1.4},{c:C.vermell,t:"2026",kind:"line",w:2.2}]));
piece(1,(el,w)=>{
  const mob=w<640, h=mob?330:430, m={t:16,r:mob?54:120,b:28,l:30};
  const s=V.svg(el,w,h,"Una línia gris per a cada any del 1950 al 2025 amb l'anomalia de la zona Niño 3.4 mes a mes. El 1997 en negre i el 2026 en vermell, que arriba a +2,5 °C a agost–octubre."), g=s.append("g");
  const x=d3.scalePoint(d3.range(12),[m.l,w-m.r]), y=d3.scaleLinear([-2.6,3.1],[h-m.b,m.t]);
  V.gridY(g,y,0,w-m.r+(mob?6:14),[-2,-1,0,1,2,3],v=>sgn(v,0),{zero:0,unit:" °C"});
  V.rule(g,m.l,x(11),y(.5),{stroke:C.muted}); V.rule(g,m.l,x(11),y(-.5),{stroke:C.muted});
  if(!mob){ V.t(g,x(11)+10,y(.5)+4,"Llindar d'El Niño",{italic:true,size:12,fill:C.ink2}); V.t(g,x(11)+10,y(-.5)+4,"Llindar de La Niña",{italic:true,size:12,fill:C.ink2}); V.t(g,x(11)+10,y(0)+4,"Normal",{italic:true,size:12,fill:C.ink2}); }
  g.selectAll("text.mx").data(d3.range(12)).join("text").attr("x",x).attr("y",h-8).attr("text-anchor","middle").attr("font-size",V.FS.small).attr("fill",C.muted).text(k=>mob?V.MES1[k]:V.MES[k]);
  const line=d3.line().x((d,i)=>x(i)).y(d=>y(d)).curve(d3.curveMonotoneX);
  const ctx=g.append("g");
  ONI_YEARS.filter(yr=>yr<NOW&&yr!==1997).forEach(yr=>ctx.append("path").datum(yr).attr("d",line(D.oni[yr])).attr("fill","none").attr("stroke",C.ghost).attr("stroke-width",1).attr("stroke-opacity",.6));
  g.append("path").attr("d",line(D.oni[1997])).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
  if(mob)V.t(g,x(11),y(D.oni[1997][11])+16,"1997",{anchor:"end",weight:700,size:12,halo:true}); else V.t(g,x(11)+5,y(D.oni[1997][11])+4,"1997",{weight:700,size:12,halo:true});
  const hl=g.append("path").attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1.4).style("display","none");
  g.append("path").attr("d",line(NOWV)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.4);
  g.append("circle").attr("cx",x(NOWK)).attr("cy",y(NOWV[NOWK])).attr("r",3.6).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.2);
  V.lines(g,mob?x(NOWK)-8:x(NOWK)+8,y(NOWV[NOWK])-(mob?22:6),[["2026",true,C.vermell],[sgn(NOWV[NOWK])+" °C, "+SEASON[NOWK]]],{halo:true,size:12.5,anchor:mob?"end":"start"});
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h);
  V.hover(hit.node(),(ev,[px,py])=>{
    const k=d3.leastIndex(d3.range(12),i=>Math.abs(x(i)-px));
    const best=d3.least(ONI_YEARS.filter(yr=>D.oni[yr][k]!=null),yr=>Math.abs(y(D.oni[yr][k])-py)), v=D.oni[best][k];
    const rank=1+ONI_YEARS.filter(yr=>D.oni[yr][k]!=null&&D.oni[yr][k]>v).length, n=ONI_YEARS.filter(yr=>D.oni[yr][k]!=null).length;
    hl.attr("d",line(D.oni[best])).attr("stroke",best===NOW?C.vermell:C.ink).attr("stroke-width",2.4).style("display",null).raise(); ctx.style("opacity",.35);
    H.selectAll("*").remove(); H.raise();
    guide(H,x(k),m.t,x(k),h-m.b); guide(H,0,y(v),x(k),y(v));
    ring(H,x(k),y(v),5); H.append("circle").attr("cx",x(k)).attr("cy",y(v)).attr("r",3).attr("fill",C.ink);
    V.t(H,x(k)+(x(k)>w*.7?-10:10),y(v)-10,`${best} · ${sgn(v)} °C`,{anchor:x(k)>w*.7?"end":"start",weight:700,size:13,halo:true});
    pill(H,x(k),h-8,mob?V.MES1[k]:V.MES[k]); pill(H,14,y(v),sgn(v));
    tp.show(`<b>${best}</b><br>${SEASON[k]}: ${sgn(v)} °C<br>${rank}a posició de ${n} anys en aquest mes`,x(k),y(v));
  },()=>{ tp.hide(); hl.style("display","none"); ctx.style("opacity",1); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-02 · ÍNDEX DE PULSACIONS  (dades reals: ONI)
   ===================================================================== */
legend(2,el=>V.legendCat(el,[{c:C.vermell,t:"El Niño (≥ +0,5 °C)"},{c:C.blau,t:"La Niña (≤ −0,5 °C)"},{c:C.ghost,t:"Neutral"}]));
const EPIS=(function(){ const out=[]; let cur=null;
  ONI_PTS.forEach(p=>{ const s=p.v>=.5?1:p.v<=-.5?-1:0;
    if(s&&cur&&cur.s===s){cur.e=p; if(Math.abs(p.v)>Math.abs(cur.pk.v))cur.pk=p;}
    else{ if(cur)out.push(cur); cur=s?{s,b:p,e:p,pk:p}:null; } });
  if(cur)out.push(cur); return out; })();
piece(2,(el,w)=>{
  const mob=w<640, h=mob?240:300, m={t:24,r:4,b:26,l:30};
  const s=V.svg(el,w,h,"Barres mensuals de l'índex ONI del 1950 al 2026: vermelles per sobre de +0,5 °C (El Niño), blaves per sota de −0,5 °C (La Niña). Els episodis més forts porten l'any."), g=s.append("g");
  const x=d3.scaleLinear([1950,2027],[m.l,w-m.r]), y=d3.scaleLinear([-2.4,3.0],[h-m.b,m.t]);
  V.gridY(g,y,0,w,[-2,-1,0,1,2,3],v=>sgn(v,0),{zero:0,unit:" °C"});
  const bw=Math.max(.7,(x(1951)-x(1950))/12*.92), P={w:"",c:"",g:""};
  ONI_PTS.forEach(p=>{ const X=x(p.t).toFixed(1), seg=`M${X},${y(0).toFixed(1)}V${y(p.v).toFixed(1)}`; if(p.v>=.5)P.w+=seg; else if(p.v<=-.5)P.c+=seg; else P.g+=seg; });
  [["g",C.ghost],["w",C.vermell],["c",C.blau]].forEach(([k,c])=>g.append("path").attr("d",P[k]).attr("stroke",c).attr("stroke-width",bw).attr("fill","none").attr("shape-rendering","crispEdges"));
  g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(0)).attr("y2",y(0)).attr("stroke",C.ink);
  V.axisX(g,x,h-m.b,mob?[1960,1980,2000,2020]:[1950,1960,1970,1980,1990,2000,2010,2020],d=>d,{tick:false});
  // etiquetes dels episodis més forts, sense que se solapin
  const pick=(sgnv,n)=>EPIS.filter(e=>e.s===sgnv).sort((a,b)=>Math.abs(b.pk.v)-Math.abs(a.pk.v)).slice(0,n);
  const lab=pick(1,mob?3:6).concat(pick(-1,mob?2:3)), placed=[];
  lab.forEach(e=>{ const X=x(e.pk.t); if(placed.some(p=>p.s===e.s&&Math.abs(p.x-X)<(mob?44:58)))return; placed.push({s:e.s,x:X});
    const txt=e.b.y===e.e.y?`${e.b.y}`:`${e.b.y}–${String(e.e.y).slice(2)}`;
    V.t(g,X,e.s>0?y(e.pk.v)-7:y(e.pk.v)+15,txt,{anchor:"middle",size:mob?11.5:12,weight:600,halo:true}); });
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h), base=g.selectAll("path").filter(function(){ return this.getAttribute("shape-rendering")==="crispEdges"; });
  V.hover(hit.node(),(ev,[px])=>{ const t=x.invert(px), p=d3.least(ONI_PTS,d=>Math.abs(d.t-t)), ep=EPIS.find(e=>e.b.t<=p.t&&p.t<=e.e.t);
    H.selectAll("*").remove(); base.style("opacity",.3);
    if(ep){ let d=""; ONI_PTS.forEach(q=>{ if(q.t>=ep.b.t&&q.t<=ep.e.t)d+=`M${x(q.t).toFixed(1)},${y(0).toFixed(1)}V${y(q.v).toFixed(1)}`; });
      H.append("path").attr("d",d).attr("stroke",ep.s>0?C.vermell:C.blau).attr("stroke-width",bw+.6).attr("shape-rendering","crispEdges");
      const X=x(ep.pk.t), lab=`${ep.s>0?"El Niño":"La Niña"} ${ep.b.y===ep.e.y?ep.b.y:ep.b.y+"–"+String(ep.e.y).slice(2)}`;
      V.t(H,X,ep.s>0?m.t-8:h-m.b+14,lab,{anchor:X>w*.85?"end":X<w*.15?"start":"middle",weight:700,size:12.5,halo:true}); }
    guide(H,x(p.t),m.t,x(p.t),h-m.b); ring(H,x(p.t),y(p.v),4.5); pill(H,14,y(p.v),sgn(p.v)); pill(H,x(p.t),h-m.b+14,`${V.MES[p.k]} ${p.y}`);
    const dur=ep?Math.round((ep.e.t-ep.b.t)*12)+1:0;
    tp.show(`<b>${SEASON[p.k]} ${p.y}</b><br>${sgn(p.v)} °C${ep?`<br>${ep.s>0?"El Niño":"La Niña"} de ${dur} mesos, pic ${sgn(ep.pk.v)} °C`:"<br>Neutral"}`,x(p.t),y(p.v));
  },()=>{ tp.hide(); H.selectAll("*").remove(); base.style("opacity",1); });
});

/* =====================================================================
   IB-03 · FRANJA DE DISTRIBUCIÓ  (dades reals: ONI)
   ===================================================================== */
const B0=-2.75, BW=.25, NB=24;
const DIST=d3.range(12).map(k=>{ const vals=ONI_YEARS.filter(y=>y<NOW&&D.oni[y][k]!=null).map(y=>({y,v:D.oni[y][k]}));
  const c=new Array(NB).fill(0); vals.forEach(d=>c[Math.max(0,Math.min(NB-1,Math.floor((d.v-B0)/BW)))]++);
  return {k,c,med:d3.median(vals,d=>d.v),max:d3.greatest(vals,d=>d.v),min:d3.least(vals,d=>d.v)}; });
const MAXC=d3.max(DIST,d=>d3.max(d.c)), SEQ3=V.seq(C.blau,[-MAXC*.08,MAXC*1.45]);
legend(3,el=>{ V.legendRamp(el,{scale:SEQ3,min:0,max:MAXC,ticks:[5,10,15].filter(v=>v<MAXC),title:"Anys per cel·la",lo:"Pocs",hi:"Molts",w:140});
  V.legendCat(el,[{c:C.ink,t:"Mediana 1950–2025",kind:"line",w:1.6},{c:C.vermell,t:"2026",kind:"line",w:2.2}]); });
piece(3,(el,w)=>{
  const mob=w<640, h=mob?340:420, m={t:14,r:6,b:28,l:30};
  const s=V.svg(el,w,h,"Per a cada mes, la distribució de l'anomalia de la zona Niño 3.4 entre el 1950 i el 2025 en cel·les violeta; la mediana en negre i el 2026 en vermell."), g=s.append("g");
  const x=d3.scaleBand(d3.range(12),[m.l,w-m.r]).paddingInner(mob?.12:.22), y=d3.scaleLinear([B0,B0+NB*BW],[h-m.b,m.t]);
  V.gridY(g,y,0,w,[-2,-1,0,1,2],v=>sgn(v,0),{zero:0,unit:" °C"});
  DIST.forEach(d=>d.c.forEach((n,i)=>{ if(!n)return; g.append("rect").datum({k:d.k,i,n}).attr("class","c3").attr("x",x(d.k)).attr("width",x.bandwidth()).attr("y",y(B0+(i+1)*BW)+.5).attr("height",Math.max(0,y(B0)-y(B0+BW)-1)).attr("fill",SEQ3(n)); }));
  const cx=k=>x(k)+x.bandwidth()/2;
  g.append("path").attr("d",d3.line((d,i)=>cx(i),d=>y(d.med)).curve(d3.curveMonotoneX)(DIST)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6);
  DIST.forEach(d=>g.append("circle").attr("cx",cx(d.k)).attr("cy",y(d.med)).attr("r",2.6).attr("fill",C.ink).attr("stroke","#fff"));
  g.append("path").attr("d",d3.line((d,i)=>cx(i),d=>y(d)).curve(d3.curveMonotoneX)(NOWV)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.2);
  NOWV.forEach((v,i)=>g.append("circle").attr("cx",cx(i)).attr("cy",y(v)).attr("r",2.6).attr("fill",C.vermell).attr("stroke","#fff"));
  g.selectAll("text.mx").data(d3.range(12)).join("text").attr("x",cx).attr("y",h-8).attr("text-anchor","middle").attr("font-size",V.FS.small).attr("fill",C.muted).text(k=>mob?V.MES1[k]:V.MES[k]);
  const win=g.append("g");
  function setWin(k){ win.selectAll("*").remove(); const d=DIST[k], x0=x(k)-3, x1=x(k)+x.bandwidth()+3, right=k<(mob?6:8);
    win.append("rect").attr("x",x0).attr("y",m.t-6).attr("width",x1-x0).attr("height",h-m.b-m.t+12).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
    const ax=right?x1+6:x0-6, an=right?"start":"end";
    const rows=[[d.max.v,`màx. ${sgn(d.max.v)} (${d.max.y})`],[d.med,`mediana ${sgn(d.med)}`],[d.min.v,`mín. ${sgn(d.min.v)} (${d.min.y})`]];
    rows.forEach(([v,tx],i)=>{ win.append("line").attr("x1",right?x1:x0).attr("x2",right?x1+4:x0-4).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.ink);
      V.t(win,ax,y(v)+4,tx,{anchor:an,size:12,weight:i===1?700:400,halo:true}); });
    V.t(win,(x0+x1)/2,m.t-10,SEASON[k],{anchor:"middle",size:11.5,weight:600,halo:true});
  }
  setWin(NOWK);
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h), cells=g.selectAll("rect.c3");
  V.hover(hit.node(),(ev,[px,py])=>{ const k=Math.max(0,Math.min(11,Math.floor((px-m.l)/x.step()))); setWin(k);
    dim(cells,d=>d.k===k,.25); H.selectAll("*").remove(); H.raise();
    const bi=Math.max(0,Math.min(NB-1,Math.floor((y.invert(py)-B0)/BW))), n=DIST[k].c[bi], lo=B0+bi*BW;
    if(n){ H.append("rect").attr("x",x(k)-1).attr("width",x.bandwidth()+2).attr("y",y(lo+BW)-.5).attr("height",y(lo)-y(lo+BW)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6);
      pill(H,14,y(lo+BW/2),`${sgn(lo,2)} a ${sgn(lo+BW,2)}`,{anchor:"start"}); }
    pill(H,x(k)+x.bandwidth()/2,h-8,mob?V.MES1[k]:V.MES[k]);
    tp.show(`<b>${SEASON[k]}</b><br>${n?`${n} ${n===1?"any":"anys"} entre ${sgn(lo,2)} i ${sgn(lo+BW,2)} °C`:"Cap any en aquesta cel·la"}<br>Mediana ${sgn(DIST[k].med)} °C`,px,py);
  },()=>{ setWin(NOWK); dim(cells,null); tp.hide(); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-04 · FILES DE BOMBOLLES  (dades d'exemple)
   ===================================================================== */
const ROWS4=(function(){ const r=V.rng(41), out=[];
  for(let y=2014;y<=2026;y++){ const c=31+V.gauss(r)*2.4, sd=3.4+r()*2.2, amp=360+r()*780+(y===2024?380:0), wk=[];
    for(let k=1;k<=52;k++){ if(y===2026&&k>46)break; let v=amp*Math.exp(-(((k-c)/sd)**2))*(.7+.6*r()); if(r()<.72)v+=6+r()*55; if(v>4)wk.push({y,k,v}); }
    const mx=d3.greatest(wk,d=>d.v); mx.max=true; out.push({y,wk}); }
  return out; })();
const R4=d3.scaleSqrt([0,1200],[0,30]);
legend(4,el=>{ V.legendSize(el,{title:"Esdeveniments per setmana",values:[100,500,1000],r:R4,f:f0});
  V.legendCat(el,[{c:C.groc,t:"Cada setmana",a:.6},{c:C.vermell,t:"Setmana màxima de l'any",a:.6}]); });
piece(4,(el,w)=>{
  const mob=w<640, rh=mob?38:44, h=ROWS4.length*rh+48, m={t:34,l:mob?40:54,r:10};
  const s=V.svg(el,w,h,"Una fila per any del 2014 al 2026; cada setmana és un cercle translúcid d'àrea proporcional al nombre d'esdeveniments. La superposició ressalta la temporada alta (setmanes 28–36). Dades d'exemple."), g=s.append("g");
  const x=d3.scaleLinear([1,52],[m.l+10,w-m.r-10]);
  // marques de mes netes a dalt, sense línies verticals sorolloses que tallin les bombolles (estil «Incendios en Perú» i «Major quakes»)
  V.MES.forEach((t,i)=>{ const X=x(1+i*52/12); g.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t-10).attr("y2",m.t-5).attr("stroke",C.hair).attr("stroke-width",.8);
    if(!mob||i%2===0)V.t(g,X+3,m.t-14,t,{size:V.FS.small,fill:C.muted}); });
  ROWS4.forEach((row,i)=>{ const cy=m.t+rh*(i+.58);
    g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",cy).attr("y2",cy).attr("stroke",C.grid).attr("stroke-width",.6);
    V.t(g,0,cy+4,row.y,{size:12,weight:600,fill:C.ink2,serif:true});
    row.wk.slice().sort((a,b)=>b.v-a.v).forEach(d=>{
      const r=R4(d.v)*(mob?.82:1);
      g.append("circle").datum({i,d}).attr("class","b4").attr("cx",x(d.k)).attr("cy",cy).attr("r",r)
        .attr("fill",d.max?C.vermell:C.groc).attr("fill-opacity",d.max?.42:.36)
        .attr("stroke",d.max?C.vermell:"none").attr("stroke-width",d.max?.65:0).attr("stroke-opacity",.65)
        .style("mix-blend-mode","multiply");
    }); });
  // anotació editorial corba estil Reuters («Major quakes»)
  const peakRow=ROWS4.find(r=>r.y===2024)||ROWS4[0], pk=peakRow.wk.find(d=>d.max), pi=ROWS4.indexOf(peakRow);
  if(!mob&&pk){ const py=m.t+rh*(pi+.58), pr=R4(pk.v);
    V.note(g,{x:x(pk.k)+pr*.7,y:py-pr*.7,tx:x(pk.k)+pr+26,ty:py-pr-14,kind:"curve",bend:12,anchor:"start",
      lines:[[`${f0(pk.v)} esdeveniments`,true],["màxim de la sèrie (2024)"]],size:12}); }
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h,"pointer"), bub=g.selectAll("circle.b4");
  V.hover(hit.node(),(ev,[px,py])=>{ const i=Math.max(0,Math.min(ROWS4.length-1,Math.floor((py-m.t)/rh))), row=ROWS4[i], k=Math.round(x.invert(px)), d=d3.least(row.wk,d=>Math.abs(d.k-k));
    if(!d)return; const cy=m.t+rh*(i+.58), tot=d3.sum(row.wk,q=>q.v), rk=1+row.wk.filter(q=>q.v>d.v).length, rr=R4(d.v)*(mob?.82:1);
    dim(bub,o=>o.i===i,.14); H.selectAll("*").remove(); H.raise();
    guide(H,x(d.k),m.t-6,x(d.k),cy); ring(H,x(d.k),cy,Math.max(4,rr)+2);
    pill(H,x(d.k),m.t-14,`setmana ${d.k}`); pill(H,0,cy,row.y,{anchor:"start"});
    V.t(H,x(d.k)+Math.max(4,rr)+8,cy+4,f0(d.v),{weight:700,size:13,halo:true});
    tp.show(`<b>${row.y}, setmana ${d.k}</b><br>${f0(d.v)} esdeveniments<br>${rk}a setmana de l'any · ${f1(d.v/tot*100)} % del total`,x(d.k),cy);
  },()=>{ tp.hide(); dim(bub,null); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-05 · ESPIRAL ANUAL  (dades reals: CO₂ Mauna Loa)
   ===================================================================== */
const SEQ5=V.seq(C.blau,[1930,2025]);
legend(5,el=>{ V.legendRamp(el,{scale:SEQ5,min:1958,max:2025,ticks:[1970,1990,2010],f:d=>d,title:"Any",w:150});
  V.legendCat(el,[{c:C.vermell,t:"2026",kind:"line",w:2.2}]); });
piece(5,(el,w)=>{
  const mob=w<640, S=Math.min(w,mob?w:600), h=S, cx=w/2, cy=h/2, R=S/2-24;
  const s=V.svg(el,w,h,"Espiral de la concentració mensual de CO₂ a Mauna Loa del 1958 al 2026: cada volta és un any i el radi creix de 315 a 432 ppm."), g=s.append("g"); s.attr("data-enter","seq");
  const r=d3.scaleLinear([300,436],[R*.1,R]), A=k=>k/12*2*Math.PI, P=(k,v)=>[cx+r(v)*Math.sin(A(k)),cy-r(v)*Math.cos(A(k))];
  [320,360,400,430].forEach(v=>{ g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",r(v)).attr("fill","none").attr("stroke",C.grid); });
  d3.range(12).forEach(k=>{ const [x2,y2]=[cx+R*Math.sin(A(k)),cy-R*Math.cos(A(k))]; g.append("line").attr("x1",cx).attr("y1",cy).attr("x2",x2).attr("y2",y2).attr("stroke",C.grid);
    const [lx,ly]=[cx+(R+13)*Math.sin(A(k)),cy-(R+13)*Math.cos(A(k))]; V.t(g,lx,ly+4,V.MES1[k],{anchor:"middle",size:V.FS.small,fill:C.muted}); });
  const sp=d3.line().curve(d3.curveCatmullRom.alpha(.5));
  d3.groups(CO2,d=>d.y).forEach(([yr,ms])=>{ const nx=CO2.find(d=>d.y===yr+1&&d.k===0), pts=ms.concat(nx?[nx]:[]).map(d=>P(d.k,d.v));
    g.append("path").datum(yr).attr("class","y5").attr("d",sp(pts)).attr("fill","none").attr("stroke",yr>=NOW?C.vermell:SEQ5(yr)).attr("stroke-width",yr>=NOW?2.2:1).attr("stroke-linecap","round"); });
  [320,360,400,430].forEach((v,i)=>V.t(g,cx+4,cy-r(v)+12,f0(v)+(i===3?" ppm":""),{size:V.FS.small,fill:C.muted,halo:true}));
  const last=CO2[CO2.length-1], first=CO2[0], mx=d3.greatest(CO2.filter(d=>d.y===NOW),d=>d.v);
  const [fx,fy]=P(first.k,first.v); V.note(g,{x:fx,y:fy,tx:fx+(mob?30:44),ty:fy+(mob?26:34),kind:"straight",anchor:"start",lines:[["1958",true],[f1(first.v)+" ppm"]],size:12});
  const [mx1,my1]=P(mx.k,mx.v); V.note(g,{x:mx1,y:my1,tx:mob?mx1-8:mx1+40,ty:my1+(mob?46:30),kind:"straight",anchor:mob?"end":"start",dot:true,lines:[[`${V.MES[mx.k]} 2026`,true,C.vermell],[f1(mx.v)+" ppm"]],size:12});
  const pts=CO2.map(d=>({d,p:P(d.k,d.v)})), tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h), yrs=g.selectAll("path.y5");
  V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(pts,o=>(o.p[0]-px)**2+(o.p[1]-py)**2), yr=b.d.y;
    dim(yrs,d=>d===yr,.12); yrs.filter(d=>d===yr).raise().attr("stroke-width",2.6).attr("stroke",yr>=NOW?C.vermell:C.ink);
    yrs.filter(d=>d!==yr).attr("stroke-width",d=>d>=NOW?2.2:1).attr("stroke",d=>d>=NOW?C.vermell:SEQ5(d));
    H.selectAll("*").remove(); H.raise(); guide(H,cx,cy,b.p[0],b.p[1]); ring(H,b.p[0],b.p[1],5);
    const lp=[cx+(R+13)*Math.sin(A(b.d.k)),cy-(R+13)*Math.cos(A(b.d.k))]; pill(H,lp[0],lp[1],V.MES1[b.d.k]);
    const yv=D.co2[yr].filter(v=>v!=null); V.lines(H,cx,cy-6,[[String(yr),true],[f1(d3.mean(yv))+" ppm de mitjana"]],{anchor:"middle",size:13,halo:true});
    const prev=CO2.find(q=>q.y===yr-1&&q.k===b.d.k);
    tp.show(`<b>${V.MES[b.d.k]} ${yr}</b><br>${f1(b.d.v)} ppm${prev?`<br>${sgn(b.d.v-prev.v,2)} ppm respecte a ${V.MES[b.d.k]} ${yr-1}`:""}`,b.p[0],b.p[1]);
  },()=>{ tp.hide(); dim(yrs,null); yrs.attr("stroke-width",d=>d>=NOW?2.2:1).attr("stroke",d=>d>=NOW?C.vermell:SEQ5(d)); H.selectAll("*").remove(); });
  void last;
});

/* =====================================================================
   IB-06 · ROSA HORÀRIA  (dades d'exemple)
   ===================================================================== */
const ROSE=(function(){ const r=V.rng(6);
  const a=d3.range(24).map(h=>Math.min(100,8+82*Math.exp(-(((h-20.5)/2.6)**2))+38*Math.exp(-(((h-13.5)/1.4)**2))+r()*8));
  const b=d3.range(24).map(h=>Math.min(100,5+86*Math.exp(-(((h-11.5)/3.1)**2))+r()*8));
  return [{n:"Espais públics",c:C.vermell,v:a},{n:"Espais de treball",c:C.blau,v:b}]; })();
legend(6,el=>V.legendCat(el,ROSE.map(d=>({c:d.c,t:d.n,a:.5}))));
piece(6,(el,w)=>{
  const mob=w<640, S=Math.min(w,mob?360:460), cx=w/2, cy=S/2, R=S/2-28;
  const miniR=mob?58:84, subH=miniR*2+46, h=S+subH+18;
  const s=V.svg(el,w,h,"Rosa de 24 hores amb l'ocupació de dos tipus d'espai, amb retícula polar fina, gradients radials translúcids i descomposició en petits múltiples a sota. Dades d'exemple."), g=s.append("g").attr("transform",`translate(${cx},${cy})`);
  const id="r6"+Math.random().toString(36).slice(2,6), defs=s.append("defs");
  ROSE.forEach((sr,si)=>{ const rg=defs.append("radialGradient").attr("id",id+"g"+si).attr("gradientUnits","userSpaceOnUse").attr("cx",0).attr("cy",0).attr("r",R);
    rg.append("stop").attr("offset",0).attr("stop-color",sr.c).attr("stop-opacity",.06);
    rg.append("stop").attr("offset",.65).attr("stop-color",sr.c).attr("stop-opacity",.3);
    rg.append("stop").attr("offset",1).attr("stop-color",sr.c).attr("stop-opacity",.52); });
  const r=d3.scaleSqrt([0,100],[0,R]), A=h=>h/24*2*Math.PI;
  // retícula polar finíssima de 24 hores (estil «Typology demand»)
  V.polarGrid(g,0,0,R,8,24,{stroke:C.grid,outer:C.hair});
  d3.range(0,24,3).forEach(hh=>{
    V.t(g,(R+15)*Math.sin(A(hh)),-(R+15)*Math.cos(A(hh))+4,hh+" h",{anchor:"middle",size:V.FS.small,fill:hh%6===0?C.ink2:C.muted,weight:hh%6===0?600:400}); });
  const arc=d3.arc().innerRadius(0);
  ROSE.forEach((sr,si)=>sr.v.forEach((v,hh)=>g.append("path").datum({si,hh,v}).attr("class","w6").attr("d",arc({outerRadius:r(v),startAngle:A(hh),endAngle:A(hh+1)})).attr("fill",`url(#${id}g${si})`).attr("stroke",sr.c).attr("stroke-width",.8).attr("stroke-opacity",.85).attr("stroke-linejoin","round").style("mix-blend-mode","multiply")));
  [25,50,100].forEach(v=>V.t(g,3,-r(v)+12,v+" %",{size:V.FS.min,fill:C.muted,halo:true}));
  // descomposició en petits múltiples a sota (estil «Typology demand»): cada sèrie sola
  const rM=d3.scaleSqrt([0,100],[0,miniR]);
  ROSE.forEach((sr,si)=>{
    const mx=cx+(si===0?-(miniR+(mob?24:46)):(miniR+(mob?24:46))), my=S+miniR+16;
    const mg=s.append("g").attr("transform",`translate(${mx},${my})`);
    V.polarGrid(mg,0,0,miniR,4,12,{stroke:C.grid,outer:C.hair});
    sr.v.forEach((v,hh)=>mg.append("path").attr("d",arc({outerRadius:rM(v),startAngle:A(hh),endAngle:A(hh+1)})).attr("fill",sr.c).attr("fill-opacity",.34).attr("stroke",sr.c).attr("stroke-width",.7));
    V.t(mg,0,miniR+18,sr.n,{anchor:"middle",size:12,weight:600,fill:C.ink2});
  });
  const tp=V.tip(el), H=hv(g), hit=s.append("rect").attr("width",w).attr("height",S).attr("fill","transparent").style("cursor","pointer"), wd=g.selectAll("path.w6");
  V.hover(hit.node(),(ev,[px,py])=>{ let a=Math.atan2(px-cx,-(py-cy)); if(a<0)a+=2*Math.PI; const hh=Math.floor(a/(2*Math.PI)*24)%24;
    wd.interrupt().style("opacity",d=>d.hh===hh?1:.2).attr("stroke-width",d=>d.hh===hh?1.8:.8);
    wd.filter(d=>d.hh===hh).raise();
    H.selectAll("*").remove(); H.raise(); const am=A(hh+.5);
    guide(H,0,0,(R+2)*Math.sin(am),-(R+2)*Math.cos(am));
    let lastY=null; ROSE.map((sr,si)=>({sr,si,v:sr.v[hh]})).sort((p,q)=>q.v-p.v).forEach((o)=>{ const rr=r(o.v), X=(rr+10)*Math.sin(am); let Y=-(rr+10)*Math.cos(am)+4;
      H.append("circle").attr("cx",rr*Math.sin(am)).attr("cy",-rr*Math.cos(am)).attr("r",3.5).attr("fill",o.sr.c).attr("stroke","#fff").attr("stroke-width",1.5);
      if(lastY!=null&&Math.abs(Y-lastY)<15)Y=lastY+(Math.cos(am)>0?15:-15)*(Y>=lastY?1:-1);
      if(lastY!=null&&Math.abs(Y-lastY)<15)Y=lastY+15;
      lastY=Y; V.t(H,X+(Math.sin(am)>=0?4:-4),Y,`${f0(o.v)} % ${o.sr.n.split(" ")[1]}`,{anchor:Math.sin(am)>=0?"start":"end",weight:700,size:13,halo:4}); });
    pill(H,(R+15)*Math.sin(am),-(R+15)*Math.cos(am),`${hh}–${hh+1} h`);
    const lead=ROSE[0].v[hh]>ROSE[1].v[hh]?ROSE[0]:ROSE[1];
    tp.show(`<b>De ${hh} a ${hh+1} h</b><br>${ROSE.map(d=>`${d.n}: ${f0(d.v[hh])} %`).join("<br>")}<br>Més ple: ${lead.n.toLowerCase()}`,px,py);
  },()=>{ tp.hide(); wd.style("opacity",1).attr("stroke-width",.8); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-07 · NÚVOL AMB PROTAGONISTES  (dades d'exemple)
   ===================================================================== */
const CLOUD=(function(){ const r=V.rng(7), out=[];
  for(let i=0;i<4200;i++){ let lx; do{ lx=1+(-Math.log(1-r()))/1.15; }while(lx>4.4); const sd=1.25/(.55+.38*lx); const v=Math.max(1,Math.min(9.8,5.6+.38*(lx-1)+V.gauss(r)*sd)); out.push({n:Math.round(10**lx),v}); }
  return out; })();
const STARS=[{n:22000,v:7.9,t:"El més votat"},{n:12400,v:4.3,t:"Molt popular, mal valorat"},{n:2300,v:2.6,t:"El pitjor amb molts vots"},{n:12,v:9.7,t:"Pocs vots, nota perfecta"},{n:780,v:1.9,t:"El cas més extrem"}];
legend(7,el=>V.legendCat(el,[{c:C.vermell,t:"Cada cas (4.200)",a:.35},{c:C.ink,t:"Cas comentat",kind:"hollow"}]));
piece(7,(el,w)=>{
  const mob=w<640, h=mob?360:440, m={t:12,r:mob?8:20,b:40,l:30};
  const {ctx,s}=layer(el,w,h,"Núvol de 4.200 casos: valoració mitjana segons el nombre de valoracions (escala logarítmica). Cinc casos extrems porten nom. Dades d'exemple.");
  const x=d3.scaleLog([10,30000],[m.l,w-m.r]), y=d3.scaleLinear([1,10],[h-m.b,m.t]), g=s.append("g");
  V.gridY(g,y,0,w,[2,4,6,8,10],d=>d);
  ctx.fillStyle=V.alpha(C.vermell,.2); CLOUD.forEach(d=>{ ctx.beginPath(); ctx.arc(x(d.n),y(d.v),mob?1.6:2.1,0,7); ctx.fill(); });
  const tk=mob?[10,100,1000,10000]:[10,20,30,100,200,300,1000,10000];
  tk.forEach(v=>{ const big=[10,100,1000,10000].includes(v); g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",h-m.b).attr("y2",h-m.b+4).attr("stroke",C.muted);
    V.t(g,x(v),h-m.b+16,f0(v),{anchor:"middle",size:big?12:V.FS.small,weight:big?700:400,fill:big?C.ink2:C.muted}); });
  V.t(g,(m.l+w-m.r)/2,h-4,"Nombre de valoracions (escala logarítmica)",{anchor:"middle",size:12,fill:C.ink2});
  STARS.forEach(d=>{ const X=x(d.n), Y=y(d.v), left=X>w*.7; g.append("circle").attr("cx",X).attr("cy",Y).attr("r",4).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.2);
    if(mob&&d.t.length>18&&d.n<1000)return; V.t(g,left?X-8:X+8,Y+4,d.t,{anchor:left?"end":"start",italic:true,size:mob?12:13,halo:true}); });
  const all=CLOUD.concat(STARS), dl=d3.Delaunay.from(all,d=>x(d.n),d=>y(d.v)), tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h), cv=el.querySelector("canvas.ibv");
  s.attr("aria-hidden",null);
  V.hover(hit.node(),(ev,[px,py])=>{ const d=all[dl.find(px,py)], X=x(d.n), Y=y(d.v), above=CLOUD.filter(q=>q.v>d.v).length;
    cv.style.transition="opacity .15s"; cv.style.opacity=.35; H.selectAll("*").remove(); H.raise();
    guide(H,X,Y,X,h-m.b); guide(H,0,Y,X,Y);
    H.append("circle").attr("cx",X).attr("cy",Y).attr("r",4.5).attr("fill",C.vermell); ring(H,X,Y,7);
    pill(H,X,h-m.b+16,f0(d.n)); pill(H,14,Y,f1(d.v));
    V.t(H,X+(X>w*.7?-12:12),Y-10,d.t||`${f0(d.n)} vots · ${f1(d.v)}`,{anchor:X>w*.7?"end":"start",weight:700,size:13,italic:!!d.t,halo:true});
    tp.show(`<b>${d.t||"Un cas"}</b><br>${f0(d.n)} valoracions · nota ${f1(d.v)}<br>Millor que el ${f0(100-above/CLOUD.length*100)} % dels casos`,X,Y);
  },()=>{ tp.hide(); cv.style.opacity=1; H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-08 · POLS DE PUNTS  (dades d'exemple)
   ===================================================================== */
const DUST=(function(){ const r=V.rng(8), out=[], cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  for(let i=0;i<60000;i++){ const u=r(); let x,y;
    if(u<.32){ x=38+V.gauss(r)*7; y=33+V.gauss(r)*6+(x-38)*.35; }
    else if(u<.8){ x=60+V.gauss(r)*8; y=60+V.gauss(r)*8+(x-60)*.5; }
    else { x=70+r()*30; y=x-3+V.gauss(r)*5; if(r()<.4)x=Math.round(x/5)*5; if(r()<.4)y=Math.round(y/5)*5; if(r()<.06){x=99+r();y=99+r();} }
    out.push([cl(x,10,100),cl(y,20,100)]); }
  return out; })();
legend(8,el=>V.legendCat(el,[{c:C.blau,t:"1 punt = 1 observació",a:.6}]));
piece(8,(el,w)=>{
  const mob=w<640, h=mob?360:470, m={t:30,r:mob?40:48,b:40,l:6};
  const {ctx,s}=layer(el,w,h,"Seixanta mil punts: la participació i el resultat de cada observació. A dalt a la dreta apareixen línies als valors acabats en 0 i en 5. Dades d'exemple.");
  const x=d3.scaleLinear([10,100],[m.l,w-m.r]), y=d3.scaleLinear([20,100],[h-m.b,m.t]), g=s.append("g");
  ctx.fillStyle=V.alpha(C.blau,mob?.09:.07); const n=mob?30000:60000, sz=mob?1.2:1.3;
  for(let i=0;i<n;i++){ const d=DUST[i]; ctx.fillRect(x(d[0])-sz/2,y(d[1])-sz/2,sz,sz); }
  d3.range(20,101,10).forEach(v=>{ g.append("line").attr("x1",w-m.r+8).attr("x2",w).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.ink).attr("stroke-width",.8); V.t(g,w,y(v)-4,v,{anchor:"end",size:12.5,fill:C.ink}); });
  d3.range(10,101,10).forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",h-m.b+6).attr("y2",h-m.b+14).attr("stroke",C.ink).attr("stroke-width",.8);
    if(!mob||v%20===0)V.t(g,x(v),h-m.b+28,v,{anchor:"middle",size:12.5}); });
  V.t(g,w,12,"Resultat, %",{anchor:"end",size:12,weight:700}); V.t(g,(m.l+w-m.r)/2,h-1,"Participació, %",{anchor:"middle",size:12,weight:700});
  V.box(g,x(67),y(100)-4,x(100)-x(67)+4,y(66)-y(100)+4);
  V.lines(g,x(mob?14:28),y(mob?96:94),[["→ Línies als valors acabats en 0 i en 5",true],["Un punt sol no ho mostra;"],["seixanta mil, sí."]],{halo:true,size:mob?12:13});
  const GRID=new Map(); for(let i=0;i<n;i++){ const d=DUST[i], k=Math.floor(d[0])*1000+Math.floor(d[1]); GRID.set(k,(GRID.get(k)||0)+1); }
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h);
  V.hover(hit.node(),(ev,[px,py])=>{ const vx=Math.max(10,Math.min(99.99,x.invert(px))), vy=Math.max(20,Math.min(99.99,y.invert(py))), cx0=Math.floor(vx), cy0=Math.floor(vy), cnt=GRID.get(cx0*1000+cy0)||0;
    H.selectAll("*").remove(); H.raise(); guide(H,px,py,px,h-m.b); guide(H,px,py,w-m.r,py);
    H.append("rect").attr("x",x(cx0)).attr("y",y(cy0+1)).attr("width",Math.max(3,x(cx0+1)-x(cx0))).attr("height",Math.max(3,y(cy0)-y(cy0+1))).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
    V.box(H,x(cx0-2),y(cy0+3),x(cx0+3)-x(cx0-2),y(cy0-2)-y(cy0+3));
    pill(H,px,h-m.b+28,f0(vx)+" %"); pill(H,w-4,py,f0(vy),{anchor:"end"});
    V.t(H,px+(px>w*.7?-10:10),py-10,`${f0(cnt)} punts`,{anchor:px>w*.7?"end":"start",weight:700,size:13,halo:true});
    tp.show(`<b>Participació ${f0(cx0)} %, resultat ${f0(cy0)} %</b><br>${f0(cnt)} observacions en aquesta cel·la d'1 × 1`,px,py);
  },()=>{ tp.hide(); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-09 · MOSAIC HEXAGONAL  (dades d'exemple)
   ===================================================================== */
const HEXP=(function(){ const r=V.rng(9), out=[], cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  for(let i=0;i<34000;i++){ const sp=cl(88+V.gauss(r)*13,42,121), an=cl(12+V.gauss(r)*24,-50,60);
    let v=-.55+.95*Math.exp(-(((an-16)/7)**2))*sig((sp-74)/6)+2.4*Math.exp(-(((an-28)/6.5)**2))*sig((sp-99)/2.6)+(an>45?-.25:0)+(an<8?.18*sig((sp-96)/4):0)+V.gauss(r)*.35;
    out.push({sp,an,v}); }
  const mu=d3.mean(out,d=>d.v); out.forEach(d=>d.v-=mu); return out; })();
const DIV9=V.div(1.6);
legend(9,el=>V.legendRamp(el,{scale:DIV9,min:-1.6,max:1.6,ticks:[0],f:()=>"mitjana",title:"Valor respecte a la mitjana",lo:"Per sota",hi:"Per sobre",w:170}));
piece(9,(el,w)=>{
  const mob=w<640, h=mob?420:540, m={t:12,r:8,b:40,l:34};
  const {ctx,s}=layer(el,w,h,"Mosaic d'hexàgons: el valor mitjà segons la velocitat i l'angle. El màxim es concentra amb velocitat alta i un angle d'uns 25 a 30 graus. Dades d'exemple."), g=s.append("g"), cv=el.querySelector("canvas.ibv");
  const x=d3.scaleLinear([40,122],[m.l,w-m.r]), y=d3.scaleLinear([-52,62],[h-m.b,m.t]);
  [40,60,80,100,120].forEach(v=>g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.grid));
  V.gridY(g,y,0,w,[-50,-25,0,25,50],v=>sgn(v,0).replace("+",""),{unit:"°"});
  const hr=mob?5.2:7.2, dx=hr*Math.sqrt(3), dy=hr*1.5, bins=new Map();
  HEXP.forEach(d=>{ const px=x(d.sp), py=y(d.an), row=Math.round(py/dy), col=Math.round((px-(row&1?dx/2:0))/dx), key=row*10000+col;
    let b=bins.get(key); if(!b){b={row,col,s:0,n:0};bins.set(key,b);} b.s+=d.v; b.n++; });
  const hex=d3.range(6).map(i=>{ const a=Math.PI/3*i+Math.PI/6; return [(hr-.55)*Math.cos(a),(hr-.55)*Math.sin(a)]; });
  const hp="M"+hex.join("L")+"Z", hg=d3.select(cv);
  bins.forEach(b=>{ if(b.n<5)return; const cx=b.col*dx+(b.row&1?dx/2:0), cy=b.row*dy; ctx.fillStyle=DIV9(b.s/b.n); ctx.beginPath(); hex.forEach((p,i)=>i?ctx.lineTo(cx+p[0],cy+p[1]):ctx.moveTo(cx+p[0],cy+p[1])); ctx.closePath(); ctx.fill(); });
  [[50,"Massa amunt ▲",56],[25,"Alt",37],[10,"Zona bona",17.5],[null,"Massa avall ▼",3]].forEach(([v,t,ly])=>{ if(v!=null)V.rule(g,m.l,w-m.r,y(v)); V.t(g,m.l+6,y(ly)+4,t,{italic:true,size:mob?12.5:14,fill:C.ink2,halo:true}); });
  V.axisX(g,x,h-m.b,[40,60,80,100,120],d=>d===40?"40 km/h":d,{tick:false});
  V.t(g,(m.l+w-m.r)/2,h-2,"Velocitat",{anchor:"middle",size:12.5,weight:700});
  V.note(g,{x:x(108),y:y(30),tx:x(mob?96:104),ty:y(mob?47:44),kind:"straight",anchor:mob?"end":"start",lines:[["El punt òptim",true]],size:mob?12.5:14});
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h), zone=a=>a>=50?"Massa amunt":a>=25?"Alt":a>=10?"Zona bona":"Massa avall";
  V.hover(hit.node(),(ev,[px,py])=>{ const row=Math.round(py/dy), col=Math.round((px-(row&1?dx/2:0))/dx), b=bins.get(row*10000+col);
    H.selectAll("*").remove(); if(!b||b.n<5){ hg.style("opacity",1); return tp.hide(); }
    const cx=b.col*dx+(b.row&1?dx/2:0), cy=b.row*dy, v=b.s/b.n, sp=x.invert(cx), an=y.invert(cy);
    hg.style("opacity",.45); H.raise();
    H.append("path").attr("d",hp).attr("transform",`translate(${cx},${cy}) scale(1.9)`).attr("fill",DIV9(v)).attr("stroke","#fff").attr("stroke-width",1.5);
    H.append("path").attr("d",hp).attr("transform",`translate(${cx},${cy}) scale(1.9)`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9);
    guide(H,cx,cy,cx,h-m.b); guide(H,0,cy,cx,cy);
    pill(H,cx,h-m.b+16,f0(sp)+" km/h"); pill(H,16,cy,f0(an)+"°");
    V.t(H,cx+(cx>w*.75?-20:20),cy-14,`${sgn(v,2)} · ${zone(an)}`,{anchor:cx>w*.75?"end":"start",weight:700,size:13,halo:true});
    tp.show(`<b>${f0(sp)} km/h · ${f0(an)}°</b><br>${sgn(v,2)} respecte a la mitjana<br>${f0(b.n)} casos · ${zone(an).toLowerCase()}`,cx,cy);
  },()=>{ tp.hide(); hg.style("opacity",1); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-10 · ESCALA AMB LLINDAR  (esquema amb valors d'El Niño)
   ===================================================================== */
legend(10,el=>V.legendCat(el,[{c:"#B5B5B5",t:"Núvols (esquema)"},{c:C.ink,t:"Lloc, temperatura habitual",kind:"hollow"}]));
piece(10,(el,w)=>{
  const mob=w<640, h=mob?300:320, m={l:10,r:10}, bar=h-108;
  const {ctx,s}=layer(el,w,h,"Escala de la temperatura del mar de 31 a 19 °C. Entre 26 i 28 °C hi ha el llindar a partir del qual es formen torres de núvols. Costa del Perú ≈ 21 °C, Indonèsia ≈ 30 °C; la zona Niño 3.4 ha passat de 26,8 a 29,2 °C el 2026."), g=s.append("g"), cv=el.querySelector("canvas.ibv");
  const x=d3.scaleLinear([31,19],[m.l,w-m.r]), col=t=>V.div(4.5)(t-26.8);
  ctx.fillStyle="#F3F2F0"; ctx.fillRect(x(28),40,x(26)-x(28),bar-40);
  [26,28].forEach(v=>g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",40).attr("y2",bar).attr("stroke",C.ghost).attr("stroke-dasharray","3 3"));
  V.lines(g,x(27),18,[["Llindar",true],["entre 26 i 28 °C"]],{anchor:"middle",size:12,halo:true});
  const r=V.rng(10), H=bar-46; for(let i=0;i<(mob?900:1500);i++){ const T=19+r()*12, p=sig((T-27)*1.7); if(r()>p*.9+.08)continue; const yy=bar-6-r()*(.12+.88*p)*H*(.35+.65*r());
    ctx.fillStyle="#B5B5B5"; ctx.beginPath(); ctx.arc(x(T),yy,mob?.9:1.1,0,7); ctx.fill(); }
  for(let T=19;T<31;T+=.05){ ctx.fillStyle=col(T); ctx.fillRect(x(T+.05),bar,Math.abs(x(T)-x(T+.05))+.6,10); }
  d3.range(20,31,2).forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",bar+10).attr("y2",bar+14).attr("stroke",C.muted); V.t(g,x(v),bar+26,v+" °C",{anchor:"middle",size:V.FS.small,fill:C.muted}); });
  if(!mob)V.t(g,(m.l+w-m.r)/2,bar+42,"← Més calenta · Temperatura de l'aigua del mar · Més freda →",{anchor:"middle",size:11.5,fill:C.muted});
  V.lines(g,x(30.9),54,[["Torres de núvols",true],["de més de 15 km"],["i pluja forta"]],{size:12,halo:true});
  V.lines(g,x(19.1),bar-48,[["Aigua més freda",true],["núvols baixos,"],["poca pluja"]],{size:12,anchor:"end",halo:true});
  // l'arc del canvi
  const a=x(26.8), b=x(29.2), top=bar-(mob?34:44);
  g.append("path").attr("d",`M${a},${bar-4}Q${(a+b)/2},${top-20} ${b},${bar-4}`).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.4);
  g.append("path").attr("d",`M${b+5},${bar-12}L${b},${bar-4}L${b-6},${bar-10}`).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.4);
  V.t(g,(a+b)/2,top-14,"El Niño 2026",{anchor:"middle",size:12,weight:700,fill:C.vermell,halo:true});
  const MK=[], marks=[[30,"Indonèsia","≈ 30 °C",C.vermell,0],[29.2,"Niño 3.4, 2026","29,2 °C",C.vermell,1],[26.8,"Niño 3.4, normal","26,8 °C",C.ink,0],[21,"Costa del Perú","≈ 21 °C",C.blau,0]];
  marks.forEach(([T,n,v,c,row])=>{ const X=x(T), Y=bar+(mob?38:56)+row*30, an=X>w*.85?"end":mob||X<w*.15?"start":"middle";
    g.append("path").attr("d",`M${X},${bar+12}L${X},${Y-12}`).attr("stroke",c).attr("stroke-width",.8);
    g.append("path").attr("d",`M${X-4},${bar+18}L${X},${bar+11}L${X+4},${bar+18}Z`).attr("fill",c);
    MK.push({T,n,v,c,X,Y});
    V.lines(g,X,Y,[[n,true],[v]],{anchor:an,size:mob?11.5:12,halo:true}); });
  const tp=V.tip(el), Hh=hv(g), hit=hitRect(s,w,h);
  V.hover(hit.node(),(ev,[px])=>{ const T=Math.max(19,Math.min(31,x.invert(px))), mk=d3.least(MK,q=>Math.abs(q.X-px)), near=mk&&Math.abs(mk.X-px)<14, TT=near?mk.T:T, X=x(TT);
    const st=TT>=28?"per sobre del llindar: torres de núvols i pluja forta":TT>=26?"dins del llindar: pot començar a ploure fort":"per sota del llindar: núvols baixos, poca pluja";
    Hh.selectAll("*").remove(); Hh.raise();
    guide(Hh,X,34,X,bar+12); Hh.append("rect").attr("x",X-1.5).attr("y",bar-3).attr("width",3).attr("height",16).attr("fill",C.ink);
    pill(Hh,X,bar+26,f1(TT)+" °C");
    if(near){ Hh.append("circle").attr("cx",mk.X).attr("cy",mk.Y-4).attr("r",0); V.lines(Hh,mk.X,mk.Y,[[mk.n,true],[mk.v]],{anchor:mk.X>w*.85?"end":(mob||mk.X<w*.15)?"start":"middle",size:mob?11.5:12,halo:4}); }
    tp.show(`<b>${near?mk.n+": ":""}${f1(TT)} °C</b><br>${st[0].toUpperCase()+st.slice(1)}`,X,bar-20);
  },()=>{ tp.hide(); Hh.selectAll("*").remove(); });
});

/* =====================================================================
   IB-11 · REIXA D'UNITATS  (dades d'exemple)
   ===================================================================== */
const UNITS=[{n:41,t:"Grup A"},{n:27,t:"Grup B"},{n:18,t:"Grup C"},{n:9,t:"Grup D"},{n:5,t:"Grup E"}].map((d,i)=>Object.assign(d,{c:V.CAT6[i]}));
legend(11,el=>V.legendCat(el,UNITS.map(d=>({c:d.c,t:`${d.t} · ${d.n} %`}))));
let mode11=0;
const M11=piece(11,(el,w)=>{
  const mob=w<640, rows=5, cols=20+ (UNITS.length-1)*1.5, cell=Math.min(30,(w-4)/(cols)), r=cell*.36, h=rows*cell+80;
  const s=V.svg(el,w,h,"Cent punts, un per cada 1 %, repartits en cinc grups: 41, 27, 18, 9 i 5 %. Dades d'exemple."), g=s.append("g").attr("transform","translate(2,58)");
  const dots=[]; let col=0;
  UNITS.forEach((u,gi)=>{ for(let i=0;i<u.n;i++)dots.push({gi,i,c:u.c}); });
  function pos(mode){ const out=[]; let start=0, gcol=0;
    UNITS.forEach((u,gi)=>{ const nc=Math.ceil(u.n/rows); for(let i=0;i<u.n;i++){ const k=mode===0?start+i:i; const cc=mode===0?Math.floor(k/rows):gcol+Math.floor(i/rows), rr=k%rows; out.push([cc*cell+cell/2,rr*cell+cell/2]); }
      start+=u.n; gcol+=nc+1.5; u.x0=(gcol-nc-1.5)*cell; u.w=nc*cell; });
    return out; }
  const P0=pos(0), P1=pos(1);
  const sel=g.selectAll("circle").data(dots).join("circle").attr("r",r).attr("fill",d=>d.c);
  const lab=g.append("g");
  function update(mode,anim){ const P=mode?P1:P0; mode11=mode;
    (anim&&!V.reduced?sel.transition().duration(700).delay((d,i)=>i*4):sel).attr("cx",(d,i)=>P[i][0]).attr("cy",(d,i)=>P[i][1]);
    lab.selectAll("*").remove();
    if(mode){ UNITS.forEach(u=>{ const X=u.x0; V.t(lab,X,-24,u.n+" %",{size:mob?16:20,weight:600,serif:true}); if(!mob||u.n>=9)V.t(lab,X,-8,u.t,{size:mob?11:12,fill:C.ink2}); }); }
    else V.t(lab,0,-12,"100 punts = 100 %",{size:12,fill:C.ink2});
    lab.style("opacity",0).transition().delay(anim?500:0).duration(anim?300:0).style("opacity",1); }
  update(mode11,false);
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h,"pointer");
  V.hover(hit.node(),(ev,[px,py])=>{ const P=mode11?P1:P0, i=d3.leastIndex(P,p=>(p[0]+2-px)**2+(p[1]+58-py)**2), d=dots[i], u=UNITS[d.gi];
    sel.interrupt().style("opacity",q=>q.gi===d.gi?1:.18).attr("r",q=>q.gi===d.gi?r*1.15:r);
    H.selectAll("*").remove(); H.raise(); const gp=P.filter((p,j)=>dots[j].gi===d.gi), x0=d3.min(gp,p=>p[0])-cell/2, x1=d3.max(gp,p=>p[0])+cell/2, y0=d3.min(gp,p=>p[1])-cell/2, y1=d3.max(gp,p=>p[1])+cell/2;
    if(mode11){ H.append("rect").attr("x",x0-3).attr("y",y0-3).attr("width",x1-x0+6).attr("height",y1-y0+6).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2); }
    pill(H,(x0+x1)/2,y1+14,`${u.t} · ${u.n} %`);
    tp.show(`<b>${u.t}</b><br>${u.n} de cada 100<br>${u.n>=25?"Gairebé 1 de cada "+Math.round(100/u.n):"1 de cada "+Math.round(100/u.n)}`,P[i][0]+2,P[i][1]+58);
  },()=>{ tp.hide(); sel.style("opacity",1).attr("r",r); H.selectAll("*").remove(); });
  el._update=update;
});
document.querySelectorAll('[data-seg="11"] button').forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll('[data-seg="11"] button').forEach(o=>o.setAttribute("aria-pressed",o===b));
  const el=$('[data-p="11"]'); el._update&&el._update(+b.dataset.k,true); }));
void M11;

/* =====================================================================
   IB-12 · CAMP DE PUNTS SOBRE MAPA  (simulació + mapa real)
   ===================================================================== */
let W=null;
const DIV12=V.div(2.5);
legend(12,el=>V.legendRamp(el,{scale:DIV12,min:-2.5,max:2.5,ticks:[-2,-1,0,1,2],f:v=>sgn(v,0),title:"Temperatura respecte al normal (°C)",lo:"Més freda",hi:"Més calenta"}));
function field12(lon,lat){ const L=lon<0?lon+360:lon;
  return 2.5*Math.exp(-(((L-262)/30)**2))*Math.exp(-((lat/(7+.09*Math.max(0,282-L)))**2))+1.1*Math.exp(-(((L-279)/5)**2)-(((lat+5)/7)**2))
    -.85*Math.exp(-(((L-150)/16)**2)-(((lat-9)/9)**2))-.5*Math.exp(-(((L-160)/14)**2)-(((lat+14)/8)**2))+.18*Math.sin(L/9)*Math.cos(lat/7); }
const M12=piece(12,(el,w)=>{
  if(!W){ V.world().then(x=>{W=x;M12.redraw();}); return false; }
  const mob=w<640, h=Math.round(w*(mob?.62:.4));
  const {ctx,s}=layer(el,w,h,"Mapa del Pacífic tropical amb una trama de punts: una llengua d'aigua més calenta que el normal s'estén des de la costa del Perú cap a l'oest per l'equador; a l'oest, l'aigua és una mica més freda. Simulació."), g=s.append("g"), cv=el.querySelector("canvas.ibv");
  const proj=d3.geoEquirectangular().rotate([160,0]).fitSize([w,h],{type:"MultiPoint",coordinates:mob?[[125,-26],[-72,26]]:[[100,-33],[-68,33]]});
  const path=d3.geoPath(proj), id="cl12"+Math.random().toString(36).slice(2,6);
  s.append("defs").append("clipPath").attr("id",id).append("rect").attr("width",w).attr("height",h); g.attr("clip-path",`url(#${id})`);
  g.append("path").attr("d",path(W.land)).attr("fill",C.land); g.append("path").attr("d",path(W.borders)).attr("fill","none").attr("stroke","#fff").attr("stroke-width",.7);
  const eq=proj([0,0])[1]; g.append("line").attr("x1",0).attr("x2",w).attr("y1",eq).attr("y2",eq).attr("stroke",C.ghost).attr("stroke-dasharray","2 4");
  const onLand=landMask(proj,w,h,W.land), sp=Math.max(mob?6:7,w/(mob?62:120)), dg=d3.select(cv);
  for(let j=0,yy=sp/2;yy<h;j++,yy+=sp*.866)for(let xx=(j&1?sp/2:0)+sp/4;xx<w;xx+=sp){
    if(onLand(xx,yy))continue; const ll=proj.invert([xx,yy]), v=field12(ll[0],ll[1]); if(Math.abs(v)<.15)continue;
    ctx.fillStyle=DIV12(v); ctx.beginPath(); ctx.arc(xx,yy,sp*.5*Math.min(1,.32+Math.abs(v)/2.2),0,7); ctx.fill(); }
  V.t(g,proj([-150,22])[0],proj([-150,22])[1],"Oceà Pacífic",{anchor:"middle",italic:true,size:mob?12:13.5,fill:C.ink2,halo:true});
  V.t(g,proj([-170,0])[0],eq-5,"Equador",{italic:true,size:11.5,fill:C.muted,halo:true});
  [[[134,-24],"Austràlia"],[[114,-1.5],"Indonèsia"],[[-75,-9],"Perú"],[[-103,24],"Mèxic"]].forEach(([ll,t])=>{ const p=proj(ll); if(p[0]>20&&p[0]<w-20&&p[1]>10&&p[1]<h-10)V.t(g,p[0],p[1],t,{anchor:"middle",size:11.5,fill:C.muted}); });
  const pk=proj([-96,-1]); V.note(g,{x:pk[0],y:pk[1],tx:pk[0]-(mob?40:70),ty:pk[1]-(mob?44:70),kind:"elbow",dot:true,anchor:"end",lines:[["Llengua d'aigua calenta",true],["fins a +2,5 °C"]],size:mob?12:12.5});
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h);
  V.hover(hit.node(),(ev,[px,py])=>{ H.selectAll("*").remove(); if(onLand(px,py)){ dg.style("opacity",1); return tp.hide(); }
    const ll=proj.invert([px,py]), v=field12(ll[0],ll[1]); dg.style("opacity",.5); H.raise();
    H.append("line").attr("x1",0).attr("x2",w).attr("y1",py).attr("y2",py).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","2 3");
    H.append("line").attr("x1",px).attr("x2",px).attr("y1",0).attr("y2",h).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","2 3");
    H.append("circle").attr("cx",px).attr("cy",py).attr("r",7).attr("fill",DIV12(v)).attr("stroke","#fff").attr("stroke-width",2); ring(H,px,py,9);
    pill(H,px,h-10,`${f0(Math.abs(ll[0]))}° ${ll[0]>=0?"E":"O"}`); pill(H,4,py,`${f0(Math.abs(ll[1]))}° ${ll[1]>=0?"N":"S"}`,{anchor:"start"});
    V.t(H,px+(px>w*.75?-16:16),py-12,`${sgn(v)} °C`,{anchor:px>w*.75?"end":"start",weight:700,size:14,halo:true});
    tp.show(`<b>${sgn(v)} °C respecte al normal</b><br>${f0(Math.abs(ll[1]))}° ${ll[1]>=0?"N":"S"}, ${f0(Math.abs(ll[0]))}° ${ll[0]>=0?"E":"O"} · simulació`,px,py);
  },()=>{ tp.hide(); dg.style("opacity",1); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-13 · TRAJECTÒRIES  (simulació + mapa real)
   ===================================================================== */
const TRACKS=(function(){ const r=V.rng(13), out=[];
  for(let i=0;i<260;i++){ let lon=-180+r()*360, lat=-64-r()*2.4; const tr=[[lon,lat]];
    for(let s=0;s<320;s++){ let dlon, dlat=V.gauss(r)*.2;
      if(lat<-62.5){ dlon=-(.35+r()*.45); if(lon>-60&&lon<-20){ dlat+=.3+r()*.15; dlon*=.3; } else dlat+=.01; }
      else { dlon=.55+r()*.7; dlat+=.045+(lon>-60&&lon<-15?.09:0)+V.gauss(r)*.12; }
      lon+=dlon/Math.cos(lat*Math.PI/180)*.6; lat+=dlat; if(lon>180)lon-=360; if(lon<-180)lon+=360; tr.push([lon,lat]); if(lat>-46)break; }
    out.push(tr); }
  return out; })();
const HL13=TRACKS.reduce((a,b)=>b.length>a.length&&b[0][0]>40&&b[0][0]<120?b:a,TRACKS[0]);
legend(13,el=>V.legendCat(el,[{c:C.blau,t:"Un recorregut",kind:"line",w:1},{c:C.vermell,t:"Recorregut comentat",kind:"line",w:2}]));
const M13=piece(13,(el,w)=>{
  if(!W){ V.world().then(x=>{W=x;M13.redraw();}); return false; }
  const mob=w<640, S=Math.min(w,mob?w:640), h=S;
  const s=V.svg(el,w,h,"Globus vist des del pol sud amb 150 recorreguts simulats: a prop de la costa antàrtica van cap a l'oest, surten cap al nord pel mar de Weddell i més enfora giren cap a l'est. Simulació."), g=s.append("g");
  const proj=d3.geoOrthographic().rotate([-20,90]).clipAngle(50).fitExtent([[(w-S)/2+18,18],[(w+S)/2-18,S-18]],{type:"Sphere"}), path=d3.geoPath(proj);
  g.append("path").attr("d",path({type:"Sphere"})).attr("fill","none").attr("stroke",C.hair);
  g.append("path").attr("d",path(d3.geoGraticule().step([30,10])())).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.6);
  g.append("path").attr("d",path(W.land)).attr("fill",C.land);
  const tg=g.append("g"), paths=TRACKS.map(tr=>tg.append("path").attr("d",path({type:"LineString",coordinates:tr})).attr("fill","none").attr("stroke",tr===HL13?C.vermell:C.blau).attr("stroke-width",tr===HL13?2:.52).attr("stroke-opacity",tr===HL13?1:.22).attr("stroke-linecap","round"));
  paths.find((p,i)=>TRACKS[i]===HL13).raise();
  const a=proj(HL13[0]), b=proj(HL13[HL13.length-1]);
  g.append("circle").attr("cx",a[0]).attr("cy",a[1]).attr("r",3.2).attr("fill",C.vermell).attr("stroke","#fff");
  g.append("circle").attr("cx",b[0]).attr("cy",b[1]).attr("r",3.2).attr("fill","#fff").attr("stroke",C.vermell).attr("stroke-width",1.4);
  V.t(g,a[0]+6,a[1]+14,"Inici",{size:12,weight:700,halo:true}); V.t(g,b[0]+7,b[1]+4,"Final",{size:12,weight:700,halo:true});
  const c=proj([0,-90]); V.t(g,c[0],c[1]+4,"Antàrtida",{anchor:"middle",italic:true,size:mob?12.5:14,fill:C.ink2});
  [[[-35,-50],"Oceà Atlàntic"],[[80,-48],"Oceà Índic"],[[-140,-50],"Oceà Pacífic"]].forEach(([ll,t])=>{ const p=proj(ll); if(p)V.t(g,p[0],p[1],t,{anchor:"middle",italic:true,size:11.5,fill:C.muted,halo:true}); });
  const wd=proj([-42,-60]); V.note(g,{x:wd[0],y:wd[1],tx:wd[0]+(mob?30:-30),ty:wd[1]-(mob?62:84),kind:"elbow",anchor:mob?"start":"end",lines:[["Corredor de sortida",true],["gairebé tots surten per aquí"]],size:mob?11.5:12.5});
  if(!mob){ const cs=proj([120,-66]); V.lines(g,cs[0]+6,cs[1]+30,[["A prop de la costa,",false],["cap a l'oest"]],{italic:true,size:12,fill:C.ink2,halo:true});
    const os=proj([150,-53]); V.lines(g,os[0],os[1],[["Més enfora,",false],["cap a l'est"]],{italic:true,size:12,fill:C.ink2,halo:true}); }
  el._paths=paths;
  const smp=[]; TRACKS.forEach((tr,ti)=>{ for(let j=0;j<tr.length;j+=3){ const p=proj(tr[j]); if(p)smp.push([p[0],p[1],ti,j]); } });
  const dl=d3.Delaunay.from(smp,d=>d[0],d=>d[1]), tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h,"pointer");
  V.hover(hit.node(),(ev,[px,py])=>{ const q=smp[dl.find(px,py)]; if(Math.hypot(q[0]-px,q[1]-py)>24){ tg.style("opacity",1); H.selectAll("*").remove(); return tp.hide(); }
    const tr=TRACKS[q[2]]; tg.style("opacity",.15); H.selectAll("*").remove(); H.raise();
    H.append("path").attr("d",path({type:"LineString",coordinates:tr})).attr("fill","none").attr("stroke","#fff").attr("stroke-width",5).attr("stroke-linecap","round");
    H.append("path").attr("d",path({type:"LineString",coordinates:tr})).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.8).attr("stroke-linecap","round");
    const s0=proj(tr[0]), s1=proj(tr[tr.length-1]); H.append("circle").attr("cx",s0[0]).attr("cy",s0[1]).attr("r",3.5).attr("fill",C.ink);
    H.append("circle").attr("cx",s1[0]).attr("cy",s1[1]).attr("r",3.5).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.5);
    ring(H,q[0],q[1],5); const ll=tr[q[3]];
    pill(H,q[0],q[1]-16,`${f0(Math.abs(ll[1]))}° S`);
    tp.show(`<b>Recorregut ${q[2]+1} de ${TRACKS.length}</b><br>${tr.length} passos · surt a ${f0(Math.abs(tr[0][1]))}° S i acaba a ${f0(Math.abs(tr[tr.length-1][1]))}° S`,q[0],q[1]);
  },()=>{ tp.hide(); tg.style("opacity",1); H.selectAll("*").remove(); });
});
document.querySelector('[data-play="13"]').addEventListener("click",()=>{ const el=$('[data-p="13"]'); if(!el._paths)return;
  el._paths.forEach(p=>{ const L=p.node().getTotalLength(); p.interrupt().attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L)
    .transition().duration(V.reduced?0:5200).ease(d3.easeLinear).attr("stroke-dashoffset",0).on("end",()=>p.attr("stroke-dasharray",null)); }); });

/* =====================================================================
   IB-14 · ANELLS PROPORCIONALS  (dades d'exemple + mapa real)
   ===================================================================== */
const CAT14=[{c:C.vermell,t:"Categoria A"},{c:C.blau,t:"Categoria B"},{c:C.groc,t:"Categoria C"}];
const R14=d3.scaleSqrt([0,30],[0,34]);
legend(14,el=>{ V.legendCat(el,CAT14.map(d=>({c:d.c,t:d.t,a:.45})).concat([{c:C.landEdge,t:"Ruta (blanc sobre terra)",kind:"line",w:2.2}]));
  V.legendSize(el,{title:"Casos per lloc",values:[1,10,25],r:R14,f:f0,stroke:C.ink2}); });
const SITES=(function(){ const r=V.rng(14), out=[]; const hot=[[13,30.5],[10,18],[24,13.5],[29,15],[14,26],[3,22],[-5,16],[30,24]];
  for(let i=0;i<60;i++){ const hc=hot[Math.floor(r()*hot.length)], big=r()<.12;
    out.push({lon:hc[0]+V.gauss(r)*(big?2:4.5),lat:hc[1]+V.gauss(r)*(big?1.5:3),n:big?10+Math.floor(r()*16):1+Math.floor(r()**2.2*6),k:r()<.45?0:r()<.55?1:2}); }
  return out; })();
const M14=piece(14,(el,w)=>{
  if(!W){ V.world().then(x=>{W=x;M14.redraw();}); return false; }
  const mob=w<640, h=Math.round(mob?w*.95:Math.min(620,w*.6)), k=mob?.65:1;
  const s=V.svg(el,w,h,"Mapa del nord d'Àfrica amb cercles translúcids proporcionals (àrea = nombre de casos) sobre rutes blanques gruixudes. Dades d'exemple."), g=s.append("g");
  const proj=d3.geoMercator().fitExtent([[6,6],[w-6,h-6]],{type:"MultiPoint",coordinates:[[-18,4],[42,37]]}), path=d3.geoPath(proj);
  const id="cl14"+Math.random().toString(36).slice(2,6), defs=s.append("defs"); defs.append("clipPath").attr("id",id).append("rect").attr("width",w).attr("height",h); g.attr("clip-path",`url(#${id})`);
  CAT14.forEach((c,i)=>{ const rg=defs.append("radialGradient").attr("id",id+"g"+i);
    [[0,.52],[.58,.38],[.88,.2],[1,.06]].forEach(([o,a])=>rg.append("stop").attr("offset",o).attr("stop-color",c.c).attr("stop-opacity",a)); });
  g.append("path").attr("d",path(W.land)).attr("fill",C.land); g.append("path").attr("d",path(W.borders)).attr("fill","none").attr("stroke","#fff").attr("stroke-width",.8);
  // rutes en blanc gruixut a sota dels cercles translúcids
  const routes=[[[-17,14.7],[-10,17],[-3,22],[2,28],[3,36.7]],[[-16,12.5],[-6,13],[2,13.5],[8,16],[12,23],[13.2,32.8]],[[32.5,15.6],[25,19],[19,25],[15,29],[13.2,32.8]],[[38.7,9],[33,15.6],[31.5,22],[31.2,30]]];
  const ln=d3.line().curve(d3.curveBasis), rt=g.append("g");
  routes.forEach(r=>{ const pts=r.map(p=>proj(p)); rt.append("path").attr("d",ln(pts)).attr("fill","none").attr("stroke","#FFFFFF").attr("stroke-width",mob?3:4.5).attr("stroke-linecap","round").attr("stroke-opacity",.92); });
  [[[-2,17.5],"Mali"],[[9,17.5],"Níger"],[[18.5,15],"Txad"],[[18,27],"Líbia"],[[2.5,27.5],"Algèria"],[[29.5,13],"Sudan"],[[29.5,26.5],"Egipte"],[[8,9.5],"Nigèria"],[[-10.5,20.5],"Mauritània"]]
    .forEach(([ll,t])=>{ const p=proj(ll); V.t(g,p[0],p[1],t,{anchor:"middle",size:mob?11:11.5,fill:C.muted}); });
  const rr=d=>Math.max(3.5,R14(d.n)*k), bl=g.append("g");
  SITES.slice().sort((a,b)=>b.n-a.n).forEach(d=>{ const p=proj([d.lon,d.lat]), sg=bl.append("g").datum(d).attr("class","s14");
    sg.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",rr(d)).attr("fill",`url(#${id}g${d.k})`).style("mix-blend-mode","multiply");
    sg.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",1.5).attr("fill",d3.lab(CAT14[d.k].c).darker(.8)); });
  const big=d3.greatest(SITES,d=>d.n), bp=proj([big.lon,big.lat]), br=rr(big);
  V.note(g,{x:bp[0]+br*.7,y:bp[1]-br*.7,tx:bp[0]+br+(mob?14:34),ty:bp[1]-br-(mob?10:22),kind:"curve",bend:10,anchor:"start",lines:[[`${big.n} casos`,true],["en un sol lloc"]],size:12});
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h,"pointer"), pts=SITES.map(d=>({d,p:proj([d.lon,d.lat])})), sites=bl.selectAll("g.s14"), tot=d3.sum(SITES,d=>d.n);
  V.hover(hit.node(),(ev,[px,py])=>{ const b=d3.least(pts,o=>Math.hypot(o.p[0]-px,o.p[1]-py)-rr(o.d)*.6), r0=rr(b.d);
    if(Math.hypot(b.p[0]-px,b.p[1]-py)>r0+14){ sites.style("opacity",1); rt.style("opacity",1); H.selectAll("*").remove(); return tp.hide(); }
    sites.style("opacity",d=>d===b.d?1:d.k===b.d.k?.45:.15); rt.style("opacity",.3); sites.filter(d=>d===b.d).raise();
    H.selectAll("*").remove(); H.raise(); ring(H,b.p[0],b.p[1],r0+3);
    const right=b.p[0]<w*.7; V.t(H,b.p[0]+(right?r0+10:-r0-10),b.p[1]+5,`${b.d.n} ${b.d.n===1?"cas":"casos"}`,{anchor:right?"start":"end",weight:700,size:14,halo:4});
    pill(H,b.p[0],b.p[1]-r0-16,CAT14[b.d.k].t);
    const same=SITES.filter(d=>d.k===b.d.k);
    tp.show(`<b>${CAT14[b.d.k].t}</b><br>${b.d.n} ${b.d.n===1?"cas":"casos"} en aquest lloc<br>${f1(b.d.n/tot*100)} % de tots els casos · ${same.length} llocs d'aquesta categoria`,b.p[0],b.p[1]);
  },()=>{ tp.hide(); sites.style("opacity",1); rt.style("opacity",1); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-15 · ISOLÍNIES SOBRE CAMP  (simulació + mapa real)
   ===================================================================== */
const R15=d3.scaleSqrt([150,2600],[.5,1]);
const TEMP_T=[14,16,18,20,22,24,26,28];
legend(15,el=>{ V.legendSize(el,{title:"Pluja anual (mm)",values:[300,1000,2400],r:v=>R15(v)*9,f:v=>f0(v),stroke:C.blau});
  V.legendCat(el,[{c:C.ink,t:"Temperatura mitjana (°C)",kind:"line",w:.9}]); });
function rain15(lon,lat){ return 110*Math.sin(lon/1.7+lat/2.3)+80*Math.cos(lat/1.3-lon/3.1)+220+1600*Math.exp(-(((lat+12.5)/5)**2))*sig((lon-122)/4)+1100*Math.exp(-(((lon-154)/3.6)**2))*Math.exp(-(((lat+25)/11)**2))
  +800*Math.exp(-(((lon-115.5)/3)**2)-(((lat+34)/3)**2))+900*Math.exp(-(((lon-146)/2.2)**2)-(((lat+42)/2)**2))+300*Math.exp(-(((lon-146)/4)**2)-(((lat+37)/3)**2))
  -120*Math.exp(-(((lon-136)/9)**2)-(((lat+26)/6)**2))+70*Math.sin(lon/2.3)*Math.cos(lat/1.9); }
function temp15(lon,lat){ return .7*Math.sin(lon/2.1)*Math.cos(lat/1.8)+.5*Math.sin((lon+lat)/3.3)+29-.55*(-lat-12)+2.4*Math.exp(-(((lon-128)/12)**2)-(((lat+23)/7)**2))-1.8*Math.exp(-(((lon-148.5)/2.5)**2)-(((lat+36.5)/2.5)**2))
  -1.4*sig((lon-151)/1.2)-1.1*sig((116-lon)/1.5)+.5*Math.sin(lon/3.1); }
const M15=piece(15,(el,w)=>{
  if(!W){ V.world().then(x=>{W=x;M15.redraw();}); return false; }
  const mob=w<640, h=Math.round(mob?w*.92:Math.min(560,w*.58));
  const aus=W.countries.features.find(f=>f.id==="036");
  const {ctx,s}=layer(el,w,h,"Mapa d'Austràlia fet de punts: com més gran i més blau el punt, més pluja; plou molt al nord tropical, a la costa est i al sud-oest, i gairebé gens a l'interior. Les línies fines són la temperatura mitjana, que baixa cap al sud. Simulació."), g=s.append("g"), cv=el.querySelector("canvas.ibv");
  const proj=d3.geoMercator().fitExtent([[10,10],[w-10,h-10]],aus), path=d3.geoPath(proj);
  const id="cl15"+Math.random().toString(36).slice(2,6); s.append("defs").append("clipPath").attr("id",id).append("path").attr("d",path(aus));
  g.append("path").attr("d",path(aus)).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",1);
  const onL=landMask(proj,w,h,aus), sp=Math.max(mob?5.5:7,w/(mob?64:118)), dg=d3.select(cv), DOTS=[];
  for(let j=0,yy=sp/2;yy<h;j++,yy+=sp*.866)for(let xx=(j&1?sp/2:0)+sp/4;xx<w;xx+=sp){ if(!onL(xx,yy))continue;
    const ll=proj.invert([xx,yy]), rv=rain15(ll[0],ll[1]), r=sp*.5*R15(Math.max(150,rv)), c=V.seqInterp(C.blau)(.35+.6*Math.min(1,Math.max(0,(rv-200)/2000)));
    DOTS.push({x:xx,y:yy,rv,tv:temp15(ll[0],ll[1])}); ctx.fillStyle=c; ctx.beginPath(); ctx.arc(xx,yy,r,0,7); ctx.fill(); }
  const st=mob?4:5, nx=Math.ceil(w/st), ny=Math.ceil(h/st), T=new Float64Array(nx*ny);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const ll=proj.invert([(i+.5)*st,(j+.5)*st]); T[j*nx+i]=temp15(ll[0],ll[1]); }
  const gp=d3.geoPath(d3.geoIdentity().scale(st)), cg=g.append("g").attr("clip-path",`url(#${id})`);
  const tc=d3.contours().size([nx,ny]).thresholds(TEMP_T)(T);
  tc.forEach(c=>cg.append("path").attr("d",gp(c)).attr("fill","none").attr("stroke","#fff").attr("stroke-width",3).attr("stroke-opacity",.9).attr("stroke-linejoin","round"));
  tc.forEach(c=>cg.append("path").datum(c.value).attr("class","t15").attr("d",gp(c)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-linejoin","round"));
  const lg=g.append("g"), placed=[];
  tc.forEach(c=>{ const cand=[]; c.coordinates.forEach(poly=>poly.forEach(rg=>{ for(let i=0;i<rg.length;i+=5){ const p=[rg[i][0]*st,rg[i][1]*st];
      if(p[0]<24||p[1]<24||p[0]>w-24||p[1]>h-24)continue; if(!onL(p[0],p[1]))continue; cand.push({rg,i,p}); } }));
    if(!cand.length)return; const best=cand[Math.floor(cand.length*.5)];
    if(placed.some(q=>Math.hypot(q[0]-best.p[0],q[1]-best.p[1])<46))return; placed.push(best.p);
    const q=best.rg[Math.min(best.rg.length-1,best.i+3)], a0=Math.atan2(q[1]*st-best.p[1],q[0]*st-best.p[0])*180/Math.PI, a=a0>90?a0-180:a0<-90?a0+180:a0;
    lg.append("text").attr("transform",`translate(${best.p[0]},${best.p[1]}) rotate(${a})`).attr("dy","0.35em").attr("text-anchor","middle").attr("font-size",11).attr("font-weight",600).attr("fill",C.ink).text(c.value+" °C")
      .attr("stroke","#fff").attr("stroke-width",5).attr("paint-order","stroke"); });
  [[[130.8,-12.4],"Darwin"],[[133.9,-23.7],"Alice Springs"],[[153,-27.5],"Brisbane"],[[151.2,-33.9],"Sydney"],[[145,-37.8],"Melbourne"],[[138.6,-34.9],"Adelaida"],[[115.9,-31.95],"Perth"]].forEach(([ll,t])=>{ const p=proj(ll), left=ll[0]>149;
    g.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",3.2).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.3);
    V.t(g,p[0]+(left?-7:7),p[1]+4,t,{anchor:left?"end":"start",size:mob?11.5:12.5,weight:600,halo:4}); });
  if(!mob){ const n1=proj([132,-17]); V.t(g,n1[0],n1[1],"Tròpics humits",{anchor:"middle",italic:true,size:13,fill:C.ink2,halo:4});
    const n2=proj([127,-26.5]); V.t(g,n2[0],n2[1],"Interior sec",{anchor:"middle",italic:true,size:13,fill:C.ink2,halo:4}); }
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h), dl=d3.Delaunay.from(DOTS,d=>d.x,d=>d.y), iso=cg.selectAll("path.t15");
  V.hover(hit.node(),(ev,[px,py])=>{ H.selectAll("*").remove(); if(!DOTS.length)return; const d=DOTS[dl.find(px,py)];
    if(Math.hypot(d.x-px,d.y-py)>sp*2){ dg.style("opacity",1); iso.style("opacity",1); return tp.hide(); }
    const near=tc.reduce((a,c)=>Math.abs(c.value-d.tv)<Math.abs(a.value-d.tv)?c:a,tc[0]);
    dg.style("opacity",.35); iso.style("opacity",v=>v===near.value?1:.25).attr("stroke-width",v=>v===near.value?2:1); H.raise();
    const r=sp*.5*R15(Math.max(150,d.rv)); H.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",r*1.6).attr("fill",V.seqInterp(C.blau)(.35+.6*Math.min(1,Math.max(0,(d.rv-200)/2000)))).attr("stroke","#fff").attr("stroke-width",1.5);
    ring(H,d.x,d.y,r*1.6+4);
    V.lines(H,d.x+(d.x>w*.7?-16:16),d.y-6,[[`${f0(Math.round(d.rv/10)*10)} mm`,true],[`${f1(d.tv)} °C`]],{anchor:d.x>w*.7?"end":"start",size:13,halo:4});
    const pct=DOTS.filter(q=>q.rv<d.rv).length/DOTS.length*100;
    tp.show(`<b>Simulació</b><br>Pluja: ${f0(Math.round(d.rv/10)*10)} mm l'any · més que el ${f0(pct)} % del país<br>Temperatura: ${f1(d.tv)} °C · isoterma de ${near.value} °C`,d.x,d.y);
  },()=>{ tp.hide(); dg.style("opacity",1); iso.style("opacity",1).attr("stroke-width",1); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-16 · TALL  (esquema)
   ===================================================================== */
const ST16={"-1":{dw:.66,de:.08,ts:6,wind:1.25,conv:.1,up:1,ew:-1.2,lbl:"Alisis molt forts"},"0":{dw:.56,de:.16,ts:4,wind:1,conv:.13,up:.75,ew:.2,lbl:"Alisis"},"1":{dw:.4,de:.34,ts:1,wind:.35,conv:.5,up:.08,ew:2.4,lbl:"Alisis febles"}};
legend(16,el=>V.legendRamp(el,{scale:V.div(3),min:-3,max:3,ticks:[0],f:()=>"normal",title:"Temperatura de l'aigua",lo:"Més freda",hi:"Més calenta",w:150}));
let st16=Object.assign({},ST16["0"]);
const M16=piece(16,(el,w)=>{
  const mob=w<640, h=mob?260:310;
  const s=V.svg(el,w,h,"Tall esquemàtic del Pacífic equatorial, d'Indonèsia al Perú: una capa d'aigua calenta més gruixuda a l'oest, la termoclina i l'aigua freda a sota. Amb El Niño la capa calenta s'aplana i arriba a l'est."), g=s.append("g");
  const lw=Math.max(34,w*.07), x0=lw, x1=w-lw, yS=mob?78:92, yB=h-10, D=yB-yS, div=V.div(3);
  const id="g16"+Math.random().toString(36).slice(2,6), defs=s.append("defs");
  const gw=defs.append("linearGradient").attr("id",id+"w"); const gc=defs.append("linearGradient").attr("id",id+"c").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",1);
  gc.append("stop").attr("offset",0).attr("stop-color","#DCE5F1"); gc.append("stop").attr("offset",1).attr("stop-color","#BFD0E7");
  const layer=g.append("g"), top=g.append("g");
  let render=function(p){ layer.selectAll("*").remove(); top.selectAll("*").remove(); gw.selectAll("*").remove();
    gw.append("stop").attr("offset",0).attr("stop-color",div(2.6)); gw.append("stop").attr("offset",.55).attr("stop-color",div(1.6+p.ew*.3)); gw.append("stop").attr("offset",1).attr("stop-color",div(p.ew));
    const surf=xx=>yS-p.ts+(xx-x0)/(x1-x0)*2*p.ts;
    const th=d3.range(0,1.0001,.05).map(f=>[x0+f*(x1-x0),yS+D*(p.dw+(p.de-p.dw)*(f*f*(3-2*f)))]);
    layer.append("rect").attr("x",x0).attr("y",yS-p.ts).attr("width",x1-x0).attr("height",yB-yS+p.ts).attr("fill",`url(#${id}c)`);
    const warm=d3.line().curve(d3.curveMonotoneX)([[x0,surf(x0)],[x1,surf(x1)]].concat(th.slice().reverse()));
    layer.append("path").attr("d",warm+"Z").attr("fill",`url(#${id}w)`);
    layer.append("path").attr("d",d3.line().curve(d3.curveMonotoneX)(th)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9);
    layer.append("rect").attr("x",0).attr("y",yS-18).attr("width",x0).attr("height",yB-yS+18).attr("fill",C.land);
    layer.append("rect").attr("x",x1).attr("y",yS-24).attr("width",w-x1).attr("height",yB-yS+24).attr("fill",C.land);
    V.t(top,x0/2,yS-24,"Indonèsia",{anchor:"middle",italic:true,size:11.5,fill:C.ink2});
    V.t(top,x1+(w-x1)/2,yS-30,"Perú",{anchor:"middle",italic:true,size:11.5,fill:C.ink2});
    const mid=th[10]; V.t(top,mid[0],mid[1]-6,"Termoclina",{anchor:"middle",italic:true,size:12,halo:true});
    V.t(top,x0+12,yS+18,"Aigua calenta",{size:12.5,weight:700,halo:true});
    V.t(top,(x0+x1)/2,yB-12,"Aigua freda",{anchor:"middle",size:12.5,weight:700,fill:C.blau,halo:true});
    // vent
    const wl=(x1-x0)*.42*p.wind, wy=yS-(mob?40:48), wx=(x0+x1)*.55;
    top.append("path").attr("d",`M${wx+wl/2},${wy}L${wx-wl/2},${wy}`).attr("stroke",C.ink).attr("stroke-width",1.4);
    top.append("path").attr("d",`M${wx-wl/2+7},${wy-5}L${wx-wl/2},${wy}L${wx-wl/2+7},${wy+5}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
    V.t(top,wx,wy-8,p.lbl,{anchor:"middle",size:12,weight:600,halo:true});
    // cumulonimbus on l'aigua és més calenta: bolets de núvol units, base plana, enclusa a dalt i pluja fina
    const cxv=x0+(x1-x0)*p.conv+24, cb=surf(cxv)-16, sc=(mob?.62:.9)*(.55+.45*Math.min(1,p.wind+.3)), cg16=top.append("g").attr("transform",`translate(${cxv},${cb}) scale(${sc})`);
    const PF=[[-26,-9,11],[-12,-13,14],[6,-14,15],[22,-9,11],[-18,-28,12],[0,-33,16],[17,-27,12],[-9,-50,13],[8,-52,14],[-2,-66,12]];
    const ANV=`M-34,-72 Q-8,-86 30,-80 Q44,-78 52,-71 Q20,-70 6,-64 Q-14,-68 -34,-72Z`, cid=id+"cb";
    const cp=cg16.append("clipPath").attr("id",cid); cp.append("rect").attr("x",-80).attr("y",-120).attr("width",160).attr("height",120);
    const body=cg16.append("g").attr("clip-path",`url(#${cid})`);
    body.append("path").attr("d",ANV).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1.8/sc);
    PF.forEach(([x,y,r])=>body.append("circle").attr("cx",x).attr("cy",y).attr("r",r).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1.8/sc));
    body.append("path").attr("d",ANV).attr("fill","#fff");
    PF.forEach(([x,y,r])=>body.append("circle").attr("cx",x).attr("cy",y).attr("r",r).attr("fill","#fff"));
    PF.filter(f=>f[1]<-20).forEach(([x,y,r])=>body.append("path").attr("d",`M${x-r*.7},${y+r*.25} A${r},${r} 0 0 1 ${x+r*.55},${y-r*.55}`).attr("fill","none").attr("stroke","#E6E6E6").attr("stroke-width",1/sc));
    cg16.append("line").attr("x1",-36).attr("x2",33).attr("y1",0).attr("y2",0).attr("stroke",C.ink2).attr("stroke-width",.9/sc);
    for(let i=0;i<9;i++){ const xx=-30+i*7.5; cg16.append("line").attr("x1",xx).attr("x2",xx-4).attr("y1",3).attr("y2",14+((i*7)%5)).attr("stroke",C.blau).attr("stroke-width",.9/sc).attr("stroke-linecap","round"); }
    V.t(top,cxv+42*sc+6,cb-50*sc,"Torre de tempesta",{size:12,weight:600,halo:true}); V.t(top,cxv+42*sc+6,cb-50*sc+14,"i pluja forta",{size:12,halo:true});
    // aigua freda que puja a l'est
    if(p.up>.15){ const ux=x1-(x1-x0)*.07; for(let i=0;i<3;i++){ const xx=ux-i*16, yb=yS+D*.62, yt=yS+10;
      top.append("path").attr("d",`M${xx},${yb}C${xx},${(yb+yt)/2} ${xx+6},${yt+12} ${xx+8},${yt}`).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",1.2).attr("stroke-opacity",p.up);
      top.append("path").attr("d",`M${xx+3},${yt+6}L${xx+8},${yt}L${xx+11},${yt+7}`).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",1.2).attr("stroke-opacity",p.up); }
      if(!mob||p.up>.5)V.t(top,ux-38,yS+D*.72,"L'aigua freda puja",{anchor:"end",italic:true,size:12,fill:C.blau,halo:true}); }
  }
  let G16=null;
  const _r=render; render=function(p){ _r(p); const th=d3.range(0,1.0001,.05).map(f=>[x0+f*(x1-x0),yS+D*(p.dw+(p.de-p.dw)*(f*f*(3-2*f)))]); G16={p,th}; };
  render(st16); el._render=render;
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h,"pointer");
  const INFO={air:["L'aire","Els alisis bufen d'est a oest i amunteguen l'aigua calenta a l'oest."],warm:["Aigua calenta","La capa de dalt, escalfada pel sol. On és més gruixuda, l'aire puja i plou."],cold:["Aigua freda","Sota la termoclina l'aigua és freda i rica en nutrients."],land:["Terra","Indonèsia a l'oest i el Perú a l'est."]};
  V.hover(hit.node(),(ev,[px,py])=>{ if(!G16)return; const p=G16.p, f=Math.max(0,Math.min(1,(px-x0)/(x1-x0))), tY=yS+D*(p.dw+(p.de-p.dw)*(f*f*(3-2*f)));
    const k=px<x0||px>x1?"land":py<yS-p.ts?"air":py<tY?"warm":"cold";
    H.selectAll("*").remove(); H.raise();
    if(k==="warm"||k==="cold"){ const surf=xx=>yS-p.ts+(xx-x0)/(x1-x0)*2*p.ts;
      const poly=k==="warm"?[[x0,surf(x0)],[x1,surf(x1)]].concat(G16.th.slice().reverse()):G16.th.concat([[x1,yB],[x0,yB]]);
      H.append("path").attr("d",d3.line()(poly)+"Z").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",2);
      guide(H,px,surf(px),px,tY); pill(H,px,k==="warm"?(surf(px)+tY)/2:(tY+yB)/2,k==="warm"?`capa calenta: ${f0((tY-surf(px))/D*100)} % de la fondària`:`aigua freda des del ${f0((tY-yS)/D*100)} %`); }
    else if(k==="air"){ H.append("rect").attr("x",x0).attr("y",4).attr("width",x1-x0).attr("height",Math.max(0,yS-p.ts-6)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2).attr("stroke-dasharray","3 3"); }
    else { const L=px<x0; H.append("rect").attr("x",L?0:x1).attr("y",yS-(L?18:24)).attr("width",L?x0:w-x1).attr("height",yB-yS+(L?18:24)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6); }
    tp.show(`<b>${INFO[k][0]}</b><br>${INFO[k][1]}`,px,py);
  },()=>{ tp.hide(); H.selectAll("*").remove(); });
});
document.querySelectorAll('[data-seg="16"] button').forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll('[data-seg="16"] button').forEach(o=>o.setAttribute("aria-pressed",o===b));
  const el=$('[data-p="16"]'), from=Object.assign({},st16), to=ST16[b.dataset.k], it=d3.interpolate(from,to);
  if(V.reduced){ st16=Object.assign({},to); el._render(st16); return; }
  const tm=d3.timer(e=>{ const t=d3.easeCubicInOut(Math.min(1,e/900)); st16=Object.assign(it(t),{lbl:to.lbl}); el._render(st16); if(t>=1)tm.stop(); }); }));
void M16;

/* =====================================================================
   IB-17 · ESCLAT RADIAL  (dades d'exemple)
   ===================================================================== */
const BURST=(function(){ const r=V.rng(17), out=[]; const N=[38,34], gap=.16, span=(2*Math.PI-2*gap);
  let a0=-Math.PI*.5+gap/2; N.forEach((n,k)=>{ const arc=span*n/(N[0]+N[1]); for(let i=0;i<n;i++){ const t=(i+.5)/n, d=.34+.62*(.5+.5*Math.sin(t*Math.PI*3+k))*(.6+.4*r()); out.push({a:a0+t*arc,d:Math.min(1,d+.08*r()),k,s:r(),bend:(r()-.5)*.5}); } a0+=arc+gap; });
  return out; })();
const LAB17=[{i:5,t:"Teledetecció"},{i:17,t:"Computació al núvol"},{i:30,t:"Models predictius"},{i:47,t:"Inventaris de camp"},{i:63,t:"Al·lometria"},{i:56,t:"Ecologia del paisatge"}];
legend(17,el=>V.legendCat(el,[{c:C.blau,t:"Tecnologia"},{c:C.groc,t:"Ecologia"}]));
piece(17,(el,w)=>{
  const mob=w<640, R=mob?w*.31:Math.min(230,w*.22), h=mob?Math.round(R*2.58+18+3*19+14):600, cx=w/2, cy=mob?R*1.3+10:h/2+4;
  const s=V.svg(el,w,h,"Setanta-dos elements que surten d'un mateix centre com una dent de lleó: a l'esquerra els de tecnologia, a la dreta els d'ecologia; com més lluny del centre, més valor. Sis porten nom. Dades d'exemple."), g=s.append("g");
  const P=d=>[cx+Math.cos(d.a)*d.d*R,cy+Math.sin(d.a)*d.d*R];
  const stem=d=>{ const p=P(d), m=[(cx+p[0])/2,(cy+p[1])/2], L=Math.hypot(p[0]-cx,p[1]-cy), nx=-(p[1]-cy)/L, ny=(p[0]-cx)/L, b=d.bend*L*.35; return `M${cx},${cy}Q${m[0]+nx*b},${m[1]+ny*b} ${p[0]},${p[1]}`; };
  [.25,.5,.75,1].forEach(v=>{ g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",v*R).attr("fill","none").attr("stroke",v===1?C.hair:C.grid).attr("stroke-dasharray",v===1?null:"1.5 3"); });
  [.5,1].forEach(v=>V.t(g,cx+v*R*Math.cos(-Math.PI/4)+4,cy+v*R*Math.sin(-Math.PI/4)-2,f0(v*100),{size:V.FS.min,fill:C.muted,halo:true}));
  // arcs de categoria a fora, amb el nom corbat
  const ar=R*1.12, defs=s.append("defs"), uid="a17"+Math.random().toString(36).slice(2,6);
  [0,1].forEach(k=>{ const ds=BURST.filter(d=>d.k===k), a1=d3.min(ds,d=>d.a)-.03, a2=d3.max(ds,d=>d.a)+.03, big=a2-a1>Math.PI?1:0;
    const pa=`M${cx+ar*Math.cos(a1)},${cy+ar*Math.sin(a1)}A${ar},${ar} 0 ${big} 1 ${cx+ar*Math.cos(a2)},${cy+ar*Math.sin(a2)}`;
    g.append("path").attr("d",pa).attr("fill","none").attr("stroke",k?C.groc:C.blau).attr("stroke-width",2.5).attr("stroke-linecap","round");
    const lr=ar+9, pid=uid+k, mid=(a1+a2)/2, flip=Math.sin(mid)>0;
    const lp=flip?`M${cx+lr*Math.cos(a2)},${cy+lr*Math.sin(a2)}A${lr},${lr} 0 ${big} 0 ${cx+lr*Math.cos(a1)},${cy+lr*Math.sin(a1)}`:`M${cx+lr*Math.cos(a1)},${cy+lr*Math.sin(a1)}A${lr},${lr} 0 ${big} 1 ${cx+lr*Math.cos(a2)},${cy+lr*Math.sin(a2)}`;
    defs.append("path").attr("id",pid).attr("d",lp);
    g.append("text").attr("font-size",12).attr("font-weight",700).attr("fill",C.ink2).attr("dy",flip?"0.9em":"-0.2em").append("textPath").attr("href","#"+pid).attr("startOffset","50%").attr("text-anchor","middle").text(`${k?"Ecologia":"Tecnologia"} · ${ds.length}`); });
  const sg=g.append("g"), dg=g.append("g");
  BURST.forEach(d=>sg.append("path").datum(d).attr("class","sp17").attr("d",stem(d)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-opacity",.45));
  const rad=d=>(mob?3.4:4.6)+d.s*(mob?2.6:4);
  BURST.forEach(d=>{ const p=P(d); dg.append("circle").datum(d).attr("class","d17").attr("cx",p[0]).attr("cy",p[1]).attr("r",rad(d)).attr("fill",d.k?C.groc:C.blau).attr("stroke","#fff").attr("stroke-width",1.5); });
  g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",mob?16:20).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",.8);
  V.t(g,cx,cy+(mob?5:6),String(BURST.length),{anchor:"middle",serif:true,weight:600,size:mob?15:18});
  // etiquetes en dues columnes, alineades al marge, amb guia puntejada
  const L=(mob?LAB17.filter((l,i)=>i%2===0):LAB17).map(l=>{ const d=BURST[l.i], p=P(d); return {l,d,p,right:p[0]>=cx}; });
  if(mob){ L.forEach((o,i)=>{ g.append("circle").attr("cx",o.p[0]).attr("cy",o.p[1]).attr("r",rad(o.d)+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8);
      const bx=o.p[0]+(o.right?1:-1)*(rad(o.d)+9), by=o.p[1]-rad(o.d)-6; g.append("circle").attr("cx",bx).attr("cy",by).attr("r",7).attr("fill",C.ink);
      g.append("text").attr("x",bx).attr("y",by).attr("dy","0.35em").attr("text-anchor","middle").attr("font-size",10).attr("font-weight",700).attr("fill","#fff").text(i+1);
      const ly=cy+R*1.28+8+i*19; g.append("circle").attr("cx",14).attr("cy",ly-4).attr("r",7).attr("fill",C.ink);
      g.append("text").attr("x",14).attr("y",ly-4).attr("dy","0.35em").attr("text-anchor","middle").attr("font-size",10).attr("font-weight",700).attr("fill","#fff").text(i+1);
      V.t(g,28,ly,o.l.t,{size:12.5,weight:700}); V.t(g,w-2,ly,`${o.d.k?"Ecologia":"Tecnologia"} · ${f0(o.d.d*100)}`,{anchor:"end",size:11.5,fill:C.muted}); }); }
  else [true,false].forEach(side=>{ const col=L.filter(o=>o.right===side).sort((a,b)=>a.p[1]-b.p[1]); let last=-1e9;
    col.forEach(o=>{ let ly=Math.max(o.p[1],last+34); last=ly; const ex=side?cx+R*1.32:cx-R*1.32, tw=o.l.t.length*(mob?6.4:7.2), x2=side?Math.min(w-2,ex+tw+6):Math.max(2,ex-tw-6);
      g.append("path").attr("d",`M${o.p[0]},${o.p[1]}L${ex},${ly}L${x2},${ly}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.7).attr("stroke-dasharray","1.2 2.4");
      g.append("circle").attr("cx",o.p[0]).attr("cy",o.p[1]).attr("r",rad(o.d)+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8);
      V.t(g,side?ex+2:ex-2,ly-5,o.l.t,{anchor:side?"start":"end",size:mob?11.5:13,weight:700,halo:true});
      V.t(g,side?ex+2:ex-2,ly+13,`${o.d.k?"Ecologia":"Tecnologia"} · ${f0(o.d.d*100)}`,{anchor:side?"start":"end",size:11,fill:C.muted,halo:true}); }); });
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h,"pointer"), dl=d3.Delaunay.from(BURST,d=>P(d)[0],d=>P(d)[1]), dots=dg.selectAll("circle.d17"), spk=sg.selectAll("path.sp17");
  V.hover(hit.node(),(ev,[px,py])=>{ const i=dl.find(px,py), d=BURST[i], p=P(d); if(Math.hypot(p[0]-px,p[1]-py)>30){ dots.style("opacity",1); spk.style("opacity",1); H.selectAll("*").remove(); return tp.hide(); }
    dots.style("opacity",q=>q===d?1:q.k===d.k?.4:.12); spk.style("opacity",q=>q===d?0:.15);
    H.selectAll("*").remove(); H.raise();
    H.append("path").attr("d",stem(d)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6);
    H.append("circle").attr("cx",cx).attr("cy",cy).attr("r",d.d*R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
    H.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",rad(d)*1.35).attr("fill",d.k?C.groc:C.blau).attr("stroke","#fff").attr("stroke-width",2);
    ring(H,p[0],p[1],rad(d)*1.35+4);
    const lab=LAB17.find(l=>BURST[l.i]===d), nm=lab?lab.t:`Element ${i+1}`, right=p[0]>=cx;
    V.t(H,p[0]+(right?16:-16),p[1]+4,nm,{anchor:right?"start":"end",weight:700,size:13,halo:4});
    pill(H,cx+d.d*R*Math.cos(-Math.PI/4),cy+d.d*R*Math.sin(-Math.PI/4),f0(d.d*100));
    const rank=1+BURST.filter(q=>q.d>d.d).length;
    tp.show(`<b>${nm}</b><br>${d.k?"Ecologia":"Tecnologia"} · ${f0(d.d*100)} de 100<br>${rank}r més lluny de ${BURST.length}`,p[0],p[1]);
  },()=>{ tp.hide(); dots.style("opacity",1); spk.style("opacity",1); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-18 · ARCS D'ENLLAÇ  (dades d'exemple)
   ===================================================================== */
const L18=["Riba","Bosc","Llac","Prat","Jardí botànic","Verd urbà","Ecologia"], R18=["Cultura","Contemplació","Circuit esportiu","Galeria d'art","Laboratori","Biblioteca","Granja","Pavellons","Centre de recerca","Centre de residus"];
const LINKS18=(function(){ const r=V.rng(18), out=[]; L18.forEach((l,i)=>{ const n=2+Math.floor(r()*3), used=new Set(); for(let k=0;k<n;k++){ const j=Math.floor(r()*R18.length); if(used.has(j))continue; used.add(j); out.push({i,j}); } }); return out; })();
legend(18,el=>V.legendCat(el,[{c:C.blau,t:"Enllaç",kind:"line",w:1},{c:C.blau,t:"Element",kind:"hollow"}]));
piece(18,(el,w)=>{
  const mob=w<640, h=mob?400:430, xl=mob?w*.36:w*.33, xr=mob?w*.64:w*.67, t0=36, t1=h-14;
  const s=V.svg(el,w,h,"Set elements a l'esquerra units amb corbes a deu elements a la dreta. Passa per sobre d'un element per veure'n els enllaços. Dades d'exemple."), g=s.append("g");
  const yl=d3.scalePoint(L18,[t0+20,t1-20]), yr=d3.scalePoint(R18,[t0,t1]);
  V.t(g,xl,14,"Origen",{anchor:"end",size:12,weight:700,fill:C.muted}); V.t(g,xr,14,"Destinació",{size:12,weight:700,fill:C.muted});
  const lk=g.append("g").selectAll("path").data(LINKS18).join("path").attr("d",d=>{ const a=[xl,yl(L18[d.i])], b=[xr,yr(R18[d.j])], m=(b[0]-a[0])*.55; return `M${a[0]},${a[1]}C${a[0]+m},${a[1]} ${b[0]-m},${b[1]} ${b[0]},${b[1]}`; })
    .attr("fill","none").attr("stroke",C.blau).attr("stroke-width",1).attr("stroke-opacity",.55);
  const nl=L18.map((t,i)=>({side:0,i,t,x:xl,y:yl(t)})), nr=R18.map((t,j)=>({side:1,i:j,t,x:xr,y:yr(t)})), nodes=nl.concat(nr);
  const ng=g.append("g"); nodes.forEach(n=>{ const G=ng.append("g").datum(n).attr("class","n18"); G.append("circle").attr("cx",n.x).attr("cy",n.y).attr("r",3.2).attr("fill","#fff").attr("stroke",C.blau).attr("stroke-width",1.3);
    V.t(G,n.side?n.x+9:n.x-9,n.y+4,n.t,{anchor:n.side?"start":"end",size:mob?12:13}); });
  const tp=V.tip(el), hit=hitRect(s,w,h,"pointer"), ns=ng.selectAll("g.n18");
  V.hover(hit.node(),(ev,[px,py])=>{ const n=d3.least(nodes,o=>(o.side?Math.max(0,o.x-px):Math.max(0,px-o.x))*.2+Math.abs(o.y-py)+Math.abs(px-o.x)*.05);
    if(!n)return; const on=d=>n.side?d.j===n.i:d.i===n.i, ls=LINKS18.filter(on), peers=new Set(ls.map(d=>n.side?"0:"+d.i:"1:"+d.j));
    lk.interrupt().attr("stroke-opacity",d=>on(d)?1:.06).attr("stroke-width",d=>on(d)?2:1); lk.filter(on).raise();
    ns.style("opacity",o=>o===n||peers.has(o.side+":"+o.i)?1:.25);
    ns.select("text").attr("font-weight",o=>o===n?700:peers.has(o.side+":"+o.i)?600:400);
    ns.select("circle").attr("fill",o=>o===n?C.blau:"#fff").attr("r",o=>o===n?5:3.2);
    tp.show(`<b>${n.t}</b><br>${ls.length} ${ls.length===1?"enllaç":"enllaços"} ${n.side?"des de":"cap a"}:<br>${[...peers].map(k=>{ const [sd,i]=k.split(":"); return (+sd?R18:L18)[+i]; }).join(", ")}`,n.x+(n.side?40:-40),n.y);
  },()=>{ tp.hide(); lk.attr("stroke-opacity",.55).attr("stroke-width",1); ns.style("opacity",1); ns.select("text").attr("font-weight",400); ns.select("circle").attr("fill","#fff").attr("r",3.2); });
});

/* =====================================================================
   IB-19 · TOPOGRAFIA DE DENSITAT  (dades d'exemple)
   ===================================================================== */
const CL19=[[.12,.62,.035,160],[.25,.42,.05,260],[.38,.58,.04,200],[.5,.36,.045,240],[.6,.6,.05,280],[.74,.44,.04,180],[.88,.6,.03,120]];
legend(19,el=>V.legendCat(el,[{c:C.vermell,t:"Corba de densitat",kind:"line",w:1},{c:C.blau,t:"Observació (núvol de punts)",a:.4}]));
piece(19,(el,w)=>{
  const mob=w<640, h=mob?360:460, r=V.rng(19), pts=[];
  CL19.forEach(([cx,cy,sd,n])=>{ for(let i=0;i<n;i++)pts.push([w*cx+V.gauss(r)*sd*w*(mob?1.3:1),h*cy+V.gauss(r)*sd*w*(mob?1.3:1)]); });
  const {ctx,s}=layer(el,w,h,"Corbes de nivell de la densitat de 1.440 observacions: set nuclis en diagonal, alguns fosos entre ells. Dades d'exemple."), g=s.append("g"), cv=el.querySelector("canvas.ibv"); s.attr("data-enter","seq");
  const cs=d3.contourDensity().x(d=>d[0]).y(d=>d[1]).size([w,h]).bandwidth(mob?14:20).thresholds(34)(pts), ip=V.seqInterp(C.vermell), gp=d3.geoPath();
  const cl=g.append("g");
  if(cs[0]) cl.append("path").attr("d",gp(cs[0])).attr("fill",V.alpha(C.vermell,.045)).attr("stroke","none");
  cs.forEach((c,i)=>cl.append("path").datum(i).attr("d",gp(c)).attr("fill","none").attr("stroke",i===0?d3.lab(C.vermell).darker(.3):ip(.2+.75*i/cs.length)).attr("stroke-width",i===0?1.35:.55));
  V.cloud(ctx,pts,C.blau,{r:.85,alpha:.18});
  const a=CL19[2], b=CL19[3], mx=w*(a[0]+b[0])/2, my=h*(a[1]+b[1])/2;
  V.note(g,{x:mx,y:my,tx:mx+(mob?10:30),ty:mob?24:30,kind:"elbow",anchor:"start",lines:[["Dos nuclis que es fonen",true],["les corbes s'uneixen"]],size:12.5});
  V.note(g,{x:w*CL19[6][0],y:h*CL19[6][1],tx:w*CL19[6][0]-(mob?20:30),ty:h-16,kind:"elbow",anchor:"end",lines:[["Un nucli aïllat",true]],size:12.5});
  const tp=V.tip(el), H=hv(g), hit=hitRect(s,w,h), lv=cl.selectAll("path");
  const inside=(c,p)=>c.coordinates.some(poly=>d3.polygonContains(poly[0],p)&&!poly.slice(1).some(hole=>d3.polygonContains(hole,p)));
  V.hover(hit.node(),(ev,[px,py])=>{ let k=-1; for(let i=cs.length-1;i>=0;i--){ if(inside(cs[i],[px,py])){ k=i; break; } }
    H.selectAll("*").remove(); if(k<0){ lv.style("opacity",1); return tp.hide(); }
    lv.style("opacity",i=>i===k?1:i<k?.35:.15); H.raise();
    H.append("path").attr("d",gp(cs[k])).attr("fill",V.alpha(C.vermell,.08)).attr("stroke",C.ink).attr("stroke-width",1.8);
    const n=pts.filter(p=>inside(cs[k],p)).length;
    H.append("circle").attr("cx",px).attr("cy",py).attr("r",3).attr("fill",C.ink);
    pill(H,px,py-16,`nivell ${k+1} de ${cs.length}`);
    tp.show(`<b>Nivell ${k+1} de ${cs.length}</b><br>${n} observacions dins d'aquesta corba<br>${k>cs.length*.6?"A prop d'un nucli":k>cs.length*.25?"Entre nuclis":"A la perifèria"}`,px,py);
  },()=>{ tp.hide(); lv.style("opacity",1); H.selectAll("*").remove(); });
});

/* =====================================================================
   IB-20 · PETITS MÚLTIPLES POLARS  (dades reals: CO₂ Mauna Loa, estil Parcs nacionals dels EUA)
   ===================================================================== */
const DEC=[1960,1970,1980,1990,2000,2010,2020].map(d0=>{ const yrs=d3.range(d0,d0+10).filter(y=>D.co2[y]&&D.co2[y].every(v=>v!=null));
  const lines=yrs.map(y=>{ const m=d3.mean(D.co2[y]); return D.co2[y].map(v=>v-m); });
  const mean=d3.range(12).map(k=>d3.mean(lines,l=>l[k]));
  return {d0,yrs,y1:d3.max(yrs),lines,mean,amp:d3.max(mean)-d3.min(mean)}; });
legend(20,el=>V.legendCat(el,[{c:C.blauClar,t:"Cada any de la dècada",kind:"line",w:1},{c:C.vermell,t:"Cicle mitjà de la dècada",kind:"line",w:2.2}]));
piece(20,(el,w)=>{
  const mob=w<640, cols=mob?2:4, gap=mob?18:28, cw=(w-gap*(cols-1))/cols, R=Math.min(cw*.4,mob?64:84), rowH=R*2+70, rows=Math.ceil(DEC.length/cols), h=rows*rowH+12;
  const s=V.svg(el,w,h,"Set petits múltiples polars, un per dècada del 1960 al 2025, amb el cicle anual del CO₂ a Mauna Loa sobre anells concèntrics finíssims."), g=s.append("g");
  const rSc=d3.scaleLinear([-4.6,4.6],[R*.2,R]), A=k=>k/12*2*Math.PI, tp=V.tip(el);
  const radLine=d3.lineRadial().angle((v,k)=>A(k)).radius(v=>rSc(v)).curve(d3.curveCatmullRomClosed.alpha(.5));
  const panels=[]; DEC.forEach((d,i)=>{
    const c=i%cols, rr=Math.floor(i/cols), cx=c*(cw+gap)+cw/2, cy=rr*rowH+R+22;
    const p=g.append("g").attr("transform",`translate(${cx},${cy})`);
    // 10 anells concèntrics ultra-fins estil «Parcs nacionals dels EUA»
    V.polarGrid(p,0,0,R,9,12,{rIn:R*.2,stroke:C.grid,outer:C.hair});
    p.append("circle").attr("r",rSc(0)).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
    d3.range(12).forEach(k=>{ if(mob&&k%3!==0)return;
      p.append("text").attr("x",(R+10)*Math.sin(A(k))).attr("y",-(R+10)*Math.cos(A(k))+3.5).attr("text-anchor","middle").attr("font-size",10.5).attr("fill",C.muted).text(V.MES1[k]); });
    // traces suaus de cada any + llaç orgànic de la mitjana
    d.lines.forEach(l=>p.append("path").attr("d",radLine(l)).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",.7).attr("stroke-opacity",.24));
    p.append("path").attr("d",radLine(d.mean)).attr("fill",V.alpha(C.vermell,.08)).attr("stroke",C.vermell).attr("stroke-width",2.1);
    V.t(p,0,R+32,`${d.d0}–${d.y1}`,{anchor:"middle",serif:true,size:15,weight:600,fill:C.ink});
    V.t(p,0,R+47,`amplitud ${f1(d.amp)} ppm`,{anchor:"middle",size:11,fill:C.muted});
    panels.push(p);
    const H=hv(p), hit=p.append("circle").attr("r",R+14).attr("fill","transparent").style("cursor","crosshair");
    V.hover(hit.node(),(ev,[px,py])=>{
      let a=Math.atan2(px,-py); if(a<0)a+=2*Math.PI; const k=Math.round(a/(2*Math.PI)*12)%12;
      panels.forEach(q=>q.style("opacity",q===p?1:.25)); H.selectAll("*").remove(); H.raise();
      const rm=rSc(d.mean[k]), x2=rm*Math.sin(A(k)), y2=-rm*Math.cos(A(k));
      guide(H,0,0,R*Math.sin(A(k)),-R*Math.cos(A(k)));
      H.append("circle").attr("cx",x2).attr("cy",y2).attr("r",3.8).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.4);
      V.t(H,x2+(x2>=0?8:-8),y2+4,`${sgn(d.mean[k])} ppm`,{anchor:x2>=0?"start":"end",weight:700,size:12,halo:3});
      tp.show(`<b>${V.MES[k]} · ${d.d0}–${d.y1}</b><br>Mitjana: <b>${sgn(d.mean[k])} ppm</b> respecte al valor anual`,cx+x2,cy+y2);
    },()=>{ tp.hide(); panels.forEach(q=>q.style("opacity",1)); H.selectAll("*").remove(); });
  });
});

})();
