/* Inspired by Magazine — sistema infogràfic (IBV).
   Peces comunes per als gràfics dels articles: colors, escales, text amb halo,
   anotacions, llegendes, tooltip que funciona amb el dit i redibuix en canviar l'amplada.
   Requereix d3 7.9.0. Documentació: research/sistema-infografic.md · Mostrari: /sistema/ */
(function(){
  "use strict";

  /* ---------- 1. Colors ---------- */
  const C={
    paper:"#FFFFFF",              // el fons de la pàgina; els gràfics no en pinten cap altre
    ink:"#121212", ink2:"#4A4A4A", muted:"#7A7A7A",
    hair:"#DADADA", grid:"#EAEAEA", ghost:"#C9C9C9",
    land:"#ECEBE8", landEdge:"#D3D1CC", neutral:"#ECE9E4",
    // Els tres colors de la revista, en aquest ordre. Validats per a daltonisme (ΔE ≥ 18 entre tots tres).
    // El groc té poc contrast sobre blanc: mai text en groc, només superfícies, punts o línies de 2 px o més.
    vermell:"#C8442A", blau:"#2C5DA8", groc:"#F5C518",
    // tons clars i foscos dels mateixos colors (per a una 4a–6a categoria o per a context de color)
    vermellClar:"#E9A391", blauClar:"#9DB6DD", grocClar:"#FBE38E",
    vermellFosc:"#7A2312", blauFosc:"#173A70", grocFosc:"#E0A800"
  };
  C.warm=C.vermell; C.cold=C.blau;
  // Noms antics (ja no formen part de la paleta): es mantenen perquè el codi vell no es trenqui.
  C.ocre=C.groc; C.mar=C.blauClar; C.violeta=C.blauFosc; C.verd=C.grocFosc;
  const CAT=[C.vermell,C.blau,C.groc];
  // Si calen més de tres categories: primer grisos per al que és secundari; si no, aquests tons.
  const CAT6=[C.vermell,C.blau,C.groc,C.vermellClar,C.blauClar,C.ink2];
  // Rampa de calor groc → vermell (per a intensitats: foc, calor, densitat)
  const HEAT=["#FFF8DC",C.grocClar,C.groc,"#D9702A",C.vermell,C.vermellFosc];
  const heatInterp=d3.piecewise(d3.interpolateLab,HEAT);
  function heat(domain){ return d3.scaleSequential(heatInterp).domain(domain||[0,1]).clamp(true); }

  // rampa divergent fred–neutre–calent, la d'El Niño
  const DIV=["#173A70",C.blau,"#9FB6DA",C.neutral,"#E8AB98",C.vermell,"#7A2312"];
  const divInterp=d3.piecewise(d3.interpolateLab,DIV);
  function div(max,min){ if(min==null)min=-max; return d3.scaleDiverging(divInterp).domain([min,0,max]).clamp(true); }
  // rampa seqüencial d'un sol to: gairebé blanc → to → to fosc
  function seqInterp(hue){ return d3.piecewise(d3.interpolateLab,["#F6F4F0",hue,d3.lab(hue).darker(1.5).formatHex()]); }
  function seq(hue,domain){ return d3.scaleSequential(seqInterp(hue)).domain(domain||[0,1]).clamp(true); }
  function alpha(hex,a){ const c=d3.color(hex); c.opacity=a; return c.formatRgb(); }

  /* ---------- 2. Tipografia i números ---------- */
  const SANS='"Source Sans 3","Helvetica Neue",Arial,sans-serif';
  const SERIF='"Source Serif 4",Georgia,serif';
  const FS={label:12.5, small:11.5, min:11, title:22};   // px reals a la pantalla; mai per sota d'11
  const loc=d3.formatLocale({decimal:",",thousands:".",grouping:[3],currency:[""," €"],minus:"−"});
  const fmt=spec=>loc.format(spec);
  const MES=["gen","feb","març","abr","maig","juny","jul","ag","set","oct","nov","des"];
  const MES1=["G","F","M","A","M","J","J","A","S","O","N","D"];
  function signed(v,d){ const s=loc.format(`.${d==null?1:d}f`)(Math.abs(v)); return (v>0?"+":v<0?"−":"±")+s; }

  /* ---------- 3. Atzar repetible (per a esquemes i dades d'exemple) ---------- */
  function rng(seed){ let a=seed>>>0||1; return function(){ a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296; }; }
  function gauss(r){ let u=0,v=0; while(!u)u=r(); while(!v)v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

  /* ---------- 4. Muntatge: SVG a mida real i redibuix en canviar l'amplada ---------- */
  // draw(el, w) ha de buidar i tornar a dibuixar el gràfic. La mida del text és real (no s'escala).
  // Lleuger: no dibuixa res fins que el gràfic és a menys de 800 px de la pantalla.
  function mount(el,draw){
    let last=0, raf=0, ready=false;
    const run=()=>{ if(!ready)return; const w=Math.round(el.clientWidth); if(!w||w===last)return; last=w; draw(el,w); };
    const start=()=>{ if(ready)return; ready=true; run();
      if("ResizeObserver" in window) new ResizeObserver(()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(run); }).observe(el); };
    if("IntersectionObserver" in window){ const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); start(); } },{rootMargin:"800px 0px"}); io.observe(el); }
    else start();
    return { redraw(){ last=0; run(); }, start };
  }
  function svg(el,w,h,label){
    d3.select(el).selectAll("svg.ibv").remove();
    const s=d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h)
      .attr("viewBox",`0 0 ${w} ${h}`).attr("role","img").attr("aria-label",label||"")
      .style("font-family",SANS).style("overflow","visible");
    return s;
  }
  function canvas(el,w,h,label){
    d3.select(el).selectAll("canvas.ibv").remove();
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const c=d3.select(el).append("canvas").attr("class","ibv").attr("width",w*dpr).attr("height",h*dpr)
      .attr("role","img").attr("aria-label",label||"").style("width",w+"px").style("height",h+"px").style("display","block").node();
    const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx};
  }

  /* ---------- 5. Text ---------- */
  // t(g,x,y,"text",{size,weight,anchor,fill,halo,italic,serif,base})
  function t(g,x,y,str,o){
    o=o||{};
    const n=g.append("text").attr("x",x).attr("y",y).text(str)
      .attr("font-size",o.size||FS.label).attr("font-weight",o.weight||400)
      .attr("text-anchor",o.anchor||"start").attr("fill",o.fill||C.ink)
      .attr("font-family",o.serif?SERIF:SANS).style("font-variant-numeric","tabular-nums");
    if(o.italic)n.attr("font-style","italic");
    if(o.base)n.attr("dominant-baseline",o.base);
    if(o.halo!==false&&o.halo!==undefined)halo(n,o.halo===true?3:o.halo);
    return n;
  }
  function halo(sel,wd){ return sel.attr("stroke",C.paper).attr("stroke-width",wd||3).attr("stroke-linejoin","round").attr("paint-order","stroke"); }
  // diverses línies: lines=[["Títol",true],["text normal"]]
  function lines(g,x,y,arr,o){
    o=o||{}; const lh=(o.size||FS.label)*1.28;
    arr.forEach((l,i)=>t(g,x,y+i*lh,l[0],Object.assign({},o,{weight:l[1]?700:(o.weight||400),fill:l[2]||o.fill})));
    return arr.length*lh;
  }

  /* ---------- 6. Anotacions ---------- */
  // note(g,{x,y,tx,ty,lines:[["Títol",true],["detall"]],anchor,kind:"elbow"|"straight"|"curve",dot})
  function note(g,o){
    const a=g.append("g").attr("class","ibv-note");
    const k=o.kind||"elbow";
    let d;
    if(k==="curve"){ const mx=(o.x+o.tx)/2+(o.bend==null?18:o.bend), my=(o.y+o.ty)/2-(o.bend==null?10:o.bend*.5); d=`M${o.tx},${o.ty}Q${mx},${my} ${o.x},${o.y}`; }
    else if(k==="straight") d=`M${o.x},${o.y}L${o.tx},${o.ty}`;
    else d=`M${o.x},${o.y}L${o.x},${o.ty}L${o.tx},${o.ty}`;
    a.append("path").attr("d",d).attr("fill","none").attr("stroke",o.stroke||C.ink).attr("stroke-width",.8)
      .attr("marker-end",k==="curve"?null:null);
    if(k==="curve"){ // punta de fletxa petita a l'extrem del dada
      const ang=Math.atan2(o.y-((o.y+o.ty)/2-(o.bend==null?10:o.bend*.5)),o.x-((o.x+o.tx)/2+(o.bend==null?18:o.bend)));
      const L=5; a.append("path").attr("d",`M${o.x-L*Math.cos(ang-0.45)},${o.y-L*Math.sin(ang-0.45)}L${o.x},${o.y}L${o.x-L*Math.cos(ang+0.45)},${o.y-L*Math.sin(ang+0.45)}`)
        .attr("fill","none").attr("stroke",o.stroke||C.ink).attr("stroke-width",.8);
    }
    if(o.dot)a.append("circle").attr("cx",o.x).attr("cy",o.y).attr("r",2.2).attr("fill",o.stroke||C.ink);
    const anc=o.anchor||(o.tx>=o.x?"start":"end"), off=anc==="start"?4:anc==="end"?-4:0;
    const lh=(o.size||FS.label)*1.28, n=o.lines.length;
    const y0=o.valign==="top"?o.ty+lh*.8:o.valign==="bottom"?o.ty-lh*(n-1)-4:o.ty-lh*(n-1)/2+4;
    lines(a,o.tx+(k==="elbow"?off:off),y0,o.lines,{anchor:anc,halo:true,size:o.size,italic:o.italic,fill:o.fill});
    return a;
  }
  // caixa discontínua per assenyalar una zona (com «Fair and square?»)
  function box(g,x,y,w,h,o){ o=o||{}; return g.append("rect").attr("x",x).attr("y",y).attr("width",w).attr("height",h)
    .attr("fill","none").attr("stroke",o.stroke||C.ink).attr("stroke-width",1).attr("stroke-dasharray","4 3"); }
  // línia de llindar puntejada amb nom de zona en cursiva
  function rule(g,x1,x2,y,o){ o=o||{}; g.append("line").attr("x1",x1).attr("x2",x2).attr("y1",y).attr("y2",y)
    .attr("stroke",o.stroke||C.ink2).attr("stroke-width",1.4).attr("stroke-dasharray","1.5 3.5").attr("stroke-linecap","round"); }

  /* ---------- 7. Eixos i quadrícula (recessius) ---------- */
  // gridY: línies fines i valor a l'esquerra, a sobre de la línia. unit només al primer valor superior.
  function gridY(g,y,x0,x1,ticks,f,o){
    o=o||{}; const gg=g.append("g").attr("class","ibv-grid");
    ticks.forEach((v,i)=>{
      gg.append("line").attr("x1",x0).attr("x2",x1).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v===o.zero?C.ink:C.grid).attr("stroke-width",v===o.zero?1:1);
      t(gg,o.right?x1:x0,y(v)-4,f(v)+(i===ticks.length-1&&o.unit?o.unit:""),{size:FS.small,fill:C.muted,anchor:o.right?"end":"start"});
    });
    return gg;
  }
  function axisX(g,x,y0,ticks,f,o){
    o=o||{}; const gg=g.append("g").attr("class","ibv-axis");
    ticks.forEach(v=>{
      if(o.tick!==false)gg.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",y0).attr("y2",y0+4).attr("stroke",C.muted);
      if(o.grid)gg.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",o.grid).attr("y2",y0).attr("stroke",C.grid);
      t(gg,x(v),y0+16,f(v),{size:FS.small,fill:C.muted,anchor:"middle"});
    });
    return gg;
  }

  /* ---------- 8. Llegendes (HTML, es posen a la capçalera del gràfic) ---------- */
  function legendRamp(el,o){
    // o:{interp|scale, min, max, ticks:[v], f, title, lo:"Més fred", hi:"Més calent", w}
    const w=o.w||170, h=8, d=d3.select(el).append("div").attr("class","ibv-lg");
    if(o.title)d.append("div").attr("class","ibv-lg-t").text(o.title);
    const s=d.append("svg").attr("width",w).attr("height",h+30).style("overflow","visible");
    const id="g"+Math.random().toString(36).slice(2,8), gr=s.append("defs").append("linearGradient").attr("id",id);
    const sc=o.scale; d3.range(0,1.0001,.1).forEach(p=>gr.append("stop").attr("offset",p).attr("stop-color",sc(o.min+(o.max-o.min)*p)));
    s.append("rect").attr("width",w).attr("height",h).attr("fill",`url(#${id})`);
    const x=d3.scaleLinear([o.min,o.max],[0,w]);
    (o.ticks||[]).forEach(v=>{ s.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",0).attr("y2",h+3).attr("stroke",v===0?C.ink:C.paper).attr("stroke-width",v===0?1:1);
      s.append("text").attr("x",x(v)).attr("y",h+14).attr("text-anchor","middle").attr("font-size",FS.min).attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(o.f?o.f(v):v); });
    if(o.lo||o.hi){ const r=s.append("g").attr("transform",`translate(0,${h+27})`).attr("font-size",FS.min).attr("fill",C.ink2);
      if(o.lo)r.append("text").text("← "+o.lo); if(o.hi)r.append("text").attr("x",w).attr("text-anchor","end").text(o.hi+" →"); }
    return d.node();
  }
  function legendSize(el,o){
    // o:{values:[v], r:scale, f, title, stroke}
    const d=d3.select(el).append("div").attr("class","ibv-lg");
    if(o.title)d.append("div").attr("class","ibv-lg-t").text(o.title);
    const R=o.values.map(o.r), gap=10, W=d3.sum(R,r=>2*r)+gap*(R.length-1), H=2*d3.max(R)+2;
    const s=d.append("svg").attr("width",W+2).attr("height",H).style("overflow","visible");
    let x=1; R.forEach((r,i)=>{ const cx=x+r, cy=H-1-r;
      s.append("circle").attr("cx",cx).attr("cy",cy).attr("r",r).attr("fill","none").attr("stroke",o.stroke||C.muted).attr("stroke-dasharray","3 2.5");
      s.append("text").attr("x",cx).attr("y",cy+4).attr("text-anchor","middle").attr("font-size",FS.min).attr("fill",C.ink2).attr("font-style","italic").style("font-variant-numeric","tabular-nums").text(o.f?o.f(o.values[i]):o.values[i]);
      x+=2*r+gap; });
    return d.node();
  }
  function legendCat(el,items,o){
    // items:[{c:color,t:"text",kind:"dot"|"line"|"ring"|"hollow"}]
    o=o||{}; const d=d3.select(el).append("div").attr("class","ibv-lg ibv-lg-cat");
    if(o.title)d.append("div").attr("class","ibv-lg-t").text(o.title);
    items.forEach(it=>{ const s=d.append("span"); const k=it.kind||"dot";
      if(k==="none"){ s.append("span").style("color",C.muted).text(it.t); return; }
      const sv=s.append("svg").attr("width",k==="line"?18:12).attr("height",12).style("vertical-align","-1px").style("margin-right","6px");
      if(k==="line")sv.append("line").attr("x1",0).attr("x2",18).attr("y1",6).attr("y2",6).attr("stroke",it.c).attr("stroke-width",it.w||2).attr("stroke-dasharray",it.dash||null);
      else if(k==="ring"){[5.5,3.5,1.5].forEach(r=>sv.append("circle").attr("cx",6).attr("cy",6).attr("r",r).attr("fill","none").attr("stroke",it.c).attr("stroke-width",.9));}
      else if(k==="hollow")sv.append("circle").attr("cx",6).attr("cy",6).attr("r",4.5).attr("fill","none").attr("stroke",it.c).attr("stroke-width",1.2);
      else sv.append("circle").attr("cx",6).attr("cy",6).attr("r",5).attr("fill",it.c).attr("fill-opacity",it.a==null?1:it.a);
      s.append("span").text(it.t); });
    return d.node();
  }

  /* ---------- 9. Lectura de hover (fixa sota el gràfic, mai tapant el cursor) ---------- */
  // const tp=IBV.tip(container); IBV.hover(targetNode, (ev,[x,y])=>{ ...tp.show(html,x,y) }, ()=>tp.hide())
  function tip(el){
    if(getComputedStyle(el).position==="static")el.style.position="relative";
    let n=el.querySelector(":scope>.tip.ibv-dock");
    if(!n){
      n=document.createElement("div");
      n.className="tip ibv-dock";
      n.setAttribute("aria-live","polite");
      el.appendChild(n);
    } else {
      el.appendChild(n);
    }
    return {
      show(html){
        if(n.nextSibling)el.appendChild(n);
        // condensa qualsevol tooltip llarg de diverses línies en una sola línia concisa (màx. 2 peces)
        const parts=String(html).split(/<br\s*\/?>/i).map(s=>s.trim()).filter(Boolean).slice(0,2);
        n.innerHTML=parts.join(" · ");
        n.style.opacity=1;
      },
      hide(){ n.style.opacity=0; }
    };
  }
  function hover(target,onMove,onLeave){
    const sel=d3.select(target);
    const pt=ev=>d3.pointer(ev,target);
    sel.on("pointermove.ibv",ev=>onMove(ev,pt(ev)))
       .on("pointerdown.ibv",ev=>onMove(ev,pt(ev)))
       .on("pointerleave.ibv",ev=>{ if(ev.pointerType==="mouse")onLeave&&onLeave(ev); });
    // en pantalla tàctil, un toc fora del gràfic el tanca
    document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!target.contains(ev.target))onLeave&&onLeave(ev); });
    sel.style("touch-action","pan-y");
  }

  /* ---------- 10. Mapes ---------- */
  let worldP=null;
  function world(){ // countries-110m: prou per a mapes de context i lleuger
    if(!worldP)worldP=fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json").then(r=>r.json()).then(tp=>({
      land:topojson.feature(tp,tp.objects.land), countries:topojson.feature(tp,tp.objects.countries),
      borders:topojson.mesh(tp,tp.objects.countries,(a,b)=>a!==b) }));
    return worldP;
  }

  const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 11. Moviment ---------- */
  const DUR=900, EASE=d3.easeCubicOut;
  // onView(el, cb): crida cb() la primera vegada que el gràfic entra a la pantalla (entrada animada).
  // Desa el.__seen=true perquè els redibuixos per canvi d'amplada no tornin a animar.
  function onView(el,cb,o){
    o=o||{};
    if(el.__seen||reduced||!("IntersectionObserver" in window)){ el.__seen=true; cb(true); return; }
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ io.disconnect(); el.__seen=true; cb(false); } }),{threshold:o.threshold==null?.3:o.threshold});
    io.observe(el); return io;
  }
  // loop(el, frame): bucle requestAnimationFrame que només corre quan el gràfic és visible. frame(t ms, dt ms).
  // Retorna {stop()}. Amb reduced motion crida frame una sola vegada.
  function loop(el,frame){
    if(reduced){ frame(0,0); return {stop(){}}; }
    let on=false, raf=0, last=0, t=0, dead=false;
    const tick=now=>{ raf=0; if(!on||dead)return; const dt=last?Math.min(64,now-last):16; last=now; t+=dt; frame(t,dt); raf=requestAnimationFrame(tick); };
    const io=("IntersectionObserver" in window)?new IntersectionObserver(es=>{ on=es[0].isIntersecting; last=0; if(on&&!raf)raf=requestAnimationFrame(tick); }):null;
    if(io)io.observe(el); else { on=true; raf=requestAnimationFrame(tick); }
    return {stop(){ dead=true; if(io)io.disconnect(); if(raf)cancelAnimationFrame(raf); }};
  }
  // focus(sel, isOn): estat de hover suau (decisió de l'editor): el context baixa només fins a ~0,48–0,50 perquè no desaparegui mai.
  function focus(sel,isOn,o){ o=o||{}; const lo=Math.max(.46,o.dim==null?.5:o.dim); sel.interrupt().transition().duration(160).style("opacity",d=>isOn==null||isOn(d)?1:lo); }

  /* ---------- 12. Primitives orgàniques (anells, retícula polar, núvol de punts) ---------- */
  // rings(g,cx,cy,n,step,color,o): anells concèntrics ultra-fins (1 anell = N casos, estil «A sea of sand and sickness»).
  function rings(g,cx,cy,n,step,color,o){
    o=o||{}; const rg=g.append("g").attr("class","ibv-rings");
    const r0=o.r0==null?1.4:o.r0, maxN=o.max||40, count=Math.min(maxN,Math.max(1,Math.round(n)));
    rg.append("circle").attr("cx",cx).attr("cy",cy).attr("r",r0).attr("fill",color).attr("fill-opacity",o.dotAlpha==null?.85:o.dotAlpha);
    for(let i=1;i<=count;i++){
      rg.append("circle").attr("cx",cx).attr("cy",cy).attr("r",r0+i*(step||1.8)).attr("fill","none")
        .attr("stroke",color).attr("stroke-width",o.sw||.65).attr("stroke-opacity",o.alpha==null?.62:o.alpha);
    }
    return rg;
  }
  // polarGrid(g,cx,cy,R,ringCount,spokeCount,o): retícula polar finíssima (estil «Typology demand» i «Parcs nacionals»).
  function polarGrid(g,cx,cy,R,ringCount,spokeCount,o){
    o=o||{}; const pg=g.append("g").attr("class","ibv-pgrid").attr("transform",`translate(${cx},${cy})`);
    const nr=ringCount||8, ns=spokeCount||12, rIn=o.rIn||0;
    for(let i=1;i<=nr;i++){
      const rr=rIn+(R-rIn)*(i/nr);
      pg.append("circle").attr("r",rr).attr("fill","none").attr("stroke",i===nr?(o.outer||C.hair):(o.stroke||C.grid)).attr("stroke-width",i===nr?.75:.5);
    }
    for(let j=0;j<ns;j++){
      const a=j/ns*2*Math.PI;
      pg.append("line").attr("x1",rIn*Math.sin(a)).attr("y1",-rIn*Math.cos(a)).attr("x2",R*Math.sin(a)).attr("y2",-R*Math.cos(a))
        .attr("stroke",o.stroke||C.grid).attr("stroke-width",.5);
    }
    return pg;
  }
  // cloud(ctx,pts,color,o): boira orgànica de punts en canvas (estil «Fair and square?» i «Building strategy»).
  function cloud(ctx,pts,color,o){
    o=o||{}; const r=o.r||1.1, a=o.alpha==null?.12:o.alpha;
    ctx.save(); ctx.fillStyle=alpha(color,a);
    for(let i=0;i<pts.length;i++){
      const p=pts[i], pr=p[2]!=null?p[2]:r;
      ctx.beginPath(); ctx.arc(p[0],p[1],pr,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  window.IBV={C,CAT,CAT6,DIV,div,seq,seqInterp,heat,heatInterp,HEAT,alpha,SANS,SERIF,FS,fmt,loc,signed,MES,MES1,rng,gauss,
    mount,svg,canvas,t,halo,lines,note,box,rule,gridY,axisX,legendRamp,legendSize,legendCat,tip,hover,world,reduced,
    DUR,EASE,onView,loop,focus,rings,polarGrid,cloud};
})();
