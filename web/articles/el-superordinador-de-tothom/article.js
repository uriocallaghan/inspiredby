/* «El superordinador que no existia» — gràfics (d3 7.9.0 + IBV, sistema infogràfic IB).
   V1 #s-escala    SCALE-02          Quadrats d'escala: un milió de cases contra cent superordinadors (scrolly)
   V2 #f-feina     LINK-03 adaptat   El viatge d'una unitat de treball (esquema animat, canvas)
   V3 #f-temps     SCALE-04          Una dècima de segon, pas a pas (escala logarítmica)
   V4 #f-espiga    HOW-01            L'espiga que s'obre (esquema amb lliscant)
   V5 #f-historia  TIME-01           Els voluntaris contra el número u (sèrie anotada, log)
   V6 #f-qui       PART-01           Qui donava el 2002 (reixes d'unitats)
   V7 #f-punts     SPREAD-04         Una agulla en un paller de 2.000 milions (pols de punts, canvas)
   Colors: vermell = voluntaris i Folding@home; blau = superordinadors i institucions; groc = superfícies
   (la zona amagada de l'espiga), mai text. */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.SUP;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f"), f2=V.fmt(",.2f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const EIO=d3.easeCubicInOut;
const vh=()=>window.innerHeight||800;

/* ---------- ajudants ---------- */
function stage(el,h){ d3.select(el).selectAll(":scope>.stage").remove(); const st=document.createElement("div"); st.className="stage"; st.style.cssText=`position:relative;height:${h}px`; el.insertBefore(st,el.firstChild); return st; }
function mkCanvas(el,w,h,label){
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.className="ibv"; c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0`;
  if(label){ c.setAttribute("role","img"); c.setAttribute("aria-label",label); } else c.setAttribute("aria-hidden","true");
  el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx,dpr};
}
function overlay(el,w,h,label){
  const s=d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
    .style("position","absolute").style("left",0).style("top",0).style("overflow","visible").style("font-family",V.SANS);
  if(label)s.attr("role","img").attr("aria-label",label); else s.attr("aria-hidden","true");
  return s;
}
// separa etiquetes verticalment conservant l'ordre: items amb .y → .ly
function separate(items,gap,lo,hi){
  items.sort((a,b)=>a.y-b.y); items.forEach(o=>o.ly=o.y);
  for(let k=0;k<30;k++){ let mv=false;
    for(let i=1;i<items.length;i++){ const d=items[i].ly-items[i-1].ly; if(d<gap){ const s=(gap-d)/2; items[i].ly+=s; items[i-1].ly-=s; mv=true; } }
    items.forEach(o=>{ o.ly=clamp(o.ly,lo,hi); }); if(!mv)break; }
}
// segments (botons) d'una figura
function segs(id,cb){
  const g=$(id); if(!g)return; const bs=[...g.querySelectorAll("button")];
  bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(x=>x.setAttribute("aria-pressed",x===b?"true":"false")); cb(+b.dataset.k); }));
  const on=bs.find(b=>b.getAttribute("aria-pressed")==="true"); return on?+on.dataset.k:0;
}
// xifres grans en paraules (escala llarga catalana)
function words(n){
  if(n<1e3)return f0(n);
  if(n<1e6)return `${f0(n/1e3)} mil`;
  if(n<1e9){ const v=n/1e6; return `${v<10?f1(v):f0(v)} milions`; }
  if(n<1e12){ const v=n/1e9; return `${v<10?f1(v):f0(v)} mil milions`; }
  if(n<1e18){ const v=n/1e12; return `${v<10?f1(v):f0(v)} ${v<2?"bilió":"bilions"}`; }
  const v=n/1e18; return `${v<10?f1(v):f0(v)} ${v<2?"trilió":"trilions"}`;
}
const pf=v=>v>=1?`${v>=100?f0(v):f1(v)} petaflops`:`${f1(v*1000)} teraflops`;

/* =====================================================================
   V1 · SCALE-02 · QUADRATS D'ESCALA (scrolly)
   ===================================================================== */
(function escala(){
  const box=$("#escala-viz"), stepsEl=$("#s-escala .steps"); if(!box)return;
  const N=D.nov19;
  const Q=[
    {k:"summit",v:N.summit,t:"Summit",d:"el número u, novembre del 2019",c:C.blue},
    {k:"top10",v:N.top10,t:"Els 10 primers",d:"de la llista TOP500, junts",c:C.blue},
    {k:"top100",v:N.top100,t:"Els 100 primers",d:"de la llista TOP500, junts",c:C.blue},
    {k:"fah",v:N.fah,t:"Folding@home",d:"primavera del 2020, més d'un milió d'ordinadors",c:C.red},
    {k:"all",v:N.all,t:"Els 500",d:"tota la llista TOP500, junts",c:C.blue}];
  Q.forEach((q,i)=>q.i=i);
  const lg=$("#escala-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Superordinadors (TOP500, nov. 2019)",a:.35},{c:C.red,t:"Folding@home (primavera del 2020)",a:.5}]); }
  let cur=0, api=null;
  V.mount(box,(el,w)=>{
    const mob=w<640;
    const S=Math.round(mob?Math.min(w-8,vh()*.33):Math.min(470,w-290,vh()*.6));
    const lw=mob?0:Math.min(280,w-S-10), ox=mob?Math.round((w-S)/2):Math.max(2,Math.round((w-S-lw)/2)), oy=8, h=S+16;
    const st=stage(el,h);
    const s=overlay(st,w,h,"Quadrats niats a la cantonada, d'àrea proporcional a la potència de càlcul: Summit, el número u del novembre del 2019, fa 148,6 petaflops; els 10 primers superordinadors junts, 520; els 100 primers, 989; Folding@home la primavera del 2020, unes 1.010 en unitats equivalents x86, i els 500 de la llista, 1.647.");
    const g=s.append("g").attr("transform",`translate(${ox},${oy})`);
    const VMAX=N.all, side=d=>S*Math.sqrt(d.v/VMAX);
    // reixa: 1 quadradet = 1 petaflop, retallada al quadrat visible més gran
    const u=S*Math.sqrt(1/VMAX), cid="c-esc"+Math.random().toString(36).slice(2,7);
    const clip=g.append("defs").append("clipPath").attr("id",cid).append("rect").attr("x",0).attr("width",0).attr("y",S).attr("height",0);
    let gp=""; for(let a=u;a<S;a+=u)gp+=`M${a.toFixed(2)},0V${S}M0,${(S-a).toFixed(2)}H${S}`;
    const grid=g.append("g").attr("clip-path",`url(#${cid})`).append("path").attr("d",gp).attr("stroke",C.ink).attr("stroke-opacity",.07).attr("stroke-width",.5).attr("fill","none");
    const order=Q.slice().sort((a,b)=>b.v-a.v);
    const SQ=g.append("g").selectAll("rect").data(order).join("rect").attr("x",0).attr("y",S).attr("width",0).attr("height",0)
      .attr("fill",d=>V.alpha(d.c,d.k==="fah"?.16:.07)).attr("stroke",d=>d.c).attr("stroke-width",d=>d.k==="fah"?1.8:1)
      .attr("stroke-dasharray",d=>d.k==="all"?"5 3":null);
    const LB=g.append("g"), hv=g.append("g").style("pointer-events","none");
    const tp=V.tip(el);
    function labels(k,anim){
      LB.selectAll("*").remove();
      const vis=Q.filter(q=>q.i<=k), items=vis.map(d=>({d,y:S-side(d)}));
      if(!mob){
        separate(items,36,0,S-24);
        items.forEach(o=>{ const d=o.d, q=LB.append("g").attr("class","q").datum(d);
          q.append("path").attr("d",`M${side(d)},${o.y}H${S+10}${Math.abs(o.ly-o.y)>2?`L${S+16},${o.ly+3}`:""}H${S+20}`).attr("fill","none").attr("stroke",d.c).attr("stroke-width",.8).attr("stroke-dasharray","1.5 2.5");
          V.t(q,S+24,o.ly+7,`${d.v<200?f1(d.v):f0(d.v)} petaflops`,{size:13.5,weight:700,fill:d.k==="fah"?C.red:C.ink});
          V.t(q,S+24,o.ly+22,`${d.t}, ${d.d}`,{size:12,fill:C.ink2}); });
      } else {
        separate(items,30,2,S-30);
        items.forEach(o=>{ const d=o.d, q=LB.append("g").attr("class","q").datum(d), x=Math.max(side(d),96)-6;
          V.t(q,x,o.ly+15,`${d.v<200?f1(d.v):f0(d.v)} PF`,{size:12.5,weight:700,anchor:"end",halo:3,fill:d.k==="fah"?C.red:C.ink});
          V.t(q,x,o.ly+28,d.t,{size:11.5,anchor:"end",halo:3,fill:C.ink2}); });
      }
      if(anim&&!V.reduced)LB.selectAll(".q").style("opacity",0).transition().delay(450).duration(500).style("opacity",1);
    }
    function set(k,anim){
      cur=k; const T=anim&&!V.reduced?sel=>sel.transition().duration(900).ease(EIO):sel=>sel;
      const big=Q.filter(q=>q.i<=k).reduce((a,b)=>b.v>a.v?b:a);
      T(SQ).attr("y",d=>d.i<=k?S-side(d):S).attr("width",d=>d.i<=k?side(d):0).attr("height",d=>d.i<=k?side(d):0);
      T(clip).attr("y",S-side(big)).attr("width",side(big)).attr("height",side(big));
      labels(k,anim); hv.selectAll("*").remove(); tp.hide();
    }
    set(cur,false);
    api={set};
    // hover: el quadrat més petit que conté el punter s'encén; la resta s'apaga
    const hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
    V.hover(hit.node(),(ev,[px,py])=>{
      const lx=px-ox, ly=py-oy;
      let d=Q.filter(q=>q.i<=cur).sort((a,b)=>a.v-b.v).find(q=>lx>=-3&&lx<=side(q)+3&&ly>=S-side(q)-3&&ly<=S+3);
      if(!d&&!mob&&lx>S){ // apuntant a les etiquetes
        const ys=Q.filter(q=>q.i<=cur).map(q=>({q,y:S-side(q)})); d=ys.length?ys.reduce((a,b)=>Math.abs(b.y-ly)<Math.abs(a.y-ly)?b:a).q:null; }
      if(!d){ hv.selectAll("*").remove(); V.focus(SQ,null); tp.hide(); return; }
      V.focus(SQ,x=>x===d,.35);
      hv.selectAll("*").remove();
      hv.append("rect").attr("x",0).attr("y",S-side(d)).attr("width",side(d)).attr("height",side(d)).attr("fill","none").attr("stroke",d.k==="fah"?C.red:C.ink).attr("stroke-width",2.2);
      const r=d.v/N.summit;
      tp.show(`<b>${d.t}</b>: ${d.v<200?f1(d.v):f0(d.v)} petaflops · ${d.k==="summit"?"la referència":`${r<10?f1(r):f0(r)} vegades Summit`}${d.k==="fah"?` · ${d.v>N.top100?"més":"menys"} que els 100 primers junts`:""}`);
    },()=>{ hv.selectAll("*").remove(); V.focus(SQ,null); tp.hide(); });
  });
  IB.scrolly(stepsEl,$("#s-escala .graphic"),i=>{ cur=i; if(api)api.set(i,true); });
})();

/* =====================================================================
   V2 · LINK-03 adaptat · EL VIATGE D'UNA UNITAT DE TREBALL (esquema, canvas)
   ===================================================================== */
(function feina(){
  const box=$("#feina-viz"); if(!box)return;
  const lg=$("#feina-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Tros per calcular"},{c:C.red,t:"Resultat"},{c:C.ink2,t:"Forma de la proteïna encara per explorar",kind:"hollow"}]); }
  let mode=segs("#feina-seg",k=>{ mode=k; if(box.__reset)box.__reset(); });
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, h=mob?330:360;
    const st=stage(el,h);
    const {ctx}=mkCanvas(st,w,h,"Esquema animat: un servidor envia trossos del càlcul (punts blaus) a ordinadors de voluntaris; cada ordinador s'encén mentre calcula i torna el resultat (punt vermell) al mapa de formes de la proteïna, que es va omplint. Amb més ordinadors, el mapa s'omple molt més de pressa.");
    const s=overlay(st,w,h);
    // columnes
    const top=mob?40:44, bot=h-34;
    const xs=mob?28:Math.max(46,w*.07), fx0=mob?64:w*.2, fx1=mob?w-118:w*.66, mx=mob?w-56:w*.83, mr=mob?46:Math.min(110,w*.13);
    const my=(top+bot)/2;
    V.t(s,xs,top-20,"Servidor",{size:12.5,weight:700,anchor:"middle"});
    V.t(s,(fx0+fx1)/2,top-20,mob?"Ordinadors de voluntaris":"Ordinadors de voluntaris, quan descansen",{size:12.5,weight:700,anchor:"middle"});
    V.t(s,mx,top-20,mob?"Mapa":"Mapa de formes",{size:12.5,weight:700,anchor:"middle"});
    const cnt=V.t(s,(fx0+fx1)/2,h-10,"",{size:12,anchor:"middle",fill:C.ink2});
    const pct=V.t(s,mx,h-10,"",{size:12,anchor:"middle",fill:C.ink2});
    // mapa de formes: estats en espiral (model d'estats de Markov, esquema)
    const rnd=V.rng(7), NS=mob?26:38, states=[];
    for(let i=0;i<NS;i++){ const a=i*2.399, r=mr*Math.sqrt((i+.5)/NS)*.92; states.push({x:mx+r*Math.cos(a),y:my+r*Math.sin(a)*.95,f:0,r:mob?4:5}); }
    const links=[]; states.forEach((a,i)=>{ const near=states.map((b,j)=>({j,d:Math.hypot(a.x-b.x,a.y-b.y)})).filter(o=>o.j>i).sort((p,q)=>p.d-q.d).slice(0,2); near.forEach(o=>links.push([i,o.j])); });
    let homes=[], parts=[], done=0, acc=0, t0=0;
    function reset(){
      const n=mode===0?(mob?24:40):(mob?520:1400);
      const r2=V.rng(11+mode); homes=[];
      // les cases es reparteixen en una reixa amb una mica de soroll
      const W=fx1-fx0, H=bot-top, cols=Math.max(4,Math.round(Math.sqrt(n*W/H))), rows=Math.ceil(n/cols);
      for(let i=0;i<n;i++){ const c=i%cols, r=Math.floor(i/cols);
        homes.push({x:fx0+(c+.5)*W/cols+(r2()-.5)*W/cols*.6, y:top+(r+.5)*H/rows+(r2()-.5)*H/rows*.6, busy:0, dur:0}); }
      parts=[]; done=0; acc=0; states.forEach(q=>q.f=0);
    }
    el.__reset=reset; reset();
    const sx=xs, sy=my;
    const bez=(a,b,t,bend)=>{ const cx=(a[0]+b[0])/2, cy=Math.min(a[1],b[1])-bend; const u=1-t; return [u*u*a[0]+2*u*t*cx+t*t*b[0], u*u*a[1]+2*u*t*cy+t*t*b[1]]; };
    function frame(t,dt){
      dt=Math.min(dt,50);
      // repartiment: el servidor envia feina a les cases lliures (ritme limitat pel nombre de cases)
      const rate=homes.length*0.00045; acc+=dt*rate;
      while(acc>=1){ acc-=1; let hm=null; for(let k=0;k<6&&!hm;k++){ const c=homes[Math.floor(Math.random()*homes.length)]; if(!c.busy&&!c.out)hm=c; } if(!hm)continue; hm.out=1;
        parts.push({kind:0,a:[sx+10,sy],b:[hm.x,hm.y],t:0,sp:1/(700+Math.random()*500),hm}); }
      if(acc>1)acc=1;
      ctx.clearRect(0,0,w,h);
      // fils del mapa
      ctx.lineWidth=.8; ctx.strokeStyle=V.alpha(C.ink,.12);
      links.forEach(([i,j])=>{ ctx.beginPath(); ctx.moveTo(states[i].x,states[i].y); ctx.lineTo(states[j].x,states[j].y); ctx.stroke(); });
      // servidor
      ctx.fillStyle=V.alpha(C.blue,.12); ctx.strokeStyle=C.blue; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.rect(sx-12,sy-30,24,60); ctx.fill(); ctx.stroke();
      for(let k=0;k<5;k++){ ctx.beginPath(); ctx.moveTo(sx-8,sy-22+k*11); ctx.lineTo(sx+8,sy-22+k*11); ctx.stroke(); }
      // cases
      const hr=homes.length>300?1.6:3;
      homes.forEach(hm=>{
        if(hm.busy>0){ hm.busy-=dt; if(hm.busy<=0){ hm.busy=0; hm.out=0; const q=states[Math.floor(Math.random()*states.length)]; parts.push({kind:1,a:[hm.x,hm.y],b:[q.x,q.y],t:0,sp:1/(800+Math.random()*500),q}); } }
        ctx.fillStyle=hm.busy>0?V.alpha(C.red,.9):V.alpha(C.ink,.22);
        ctx.fillRect(hm.x-hr/2,hm.y-hr/2,hr,hr);
      });
      // partícules amb estela
      parts=parts.filter(p=>{ p.t+=dt*p.sp; if(p.t>=1){ if(p.kind===0){ p.hm.busy=2500+Math.random()*3500; } else { p.q.f=Math.min(1,p.q.f+(mob?.08:.05)); done++; } return false; }
        const col=p.kind===0?C.blue:C.red, bend=p.kind===0?18:22;
        for(let k=0;k<5;k++){ const tt=Math.max(0,p.t-k*.025), q=bez(p.a,p.b,tt,bend); ctx.fillStyle=V.alpha(col,.75-k*.14); ctx.beginPath(); ctx.arc(q[0],q[1],k?1.3:2.1,0,6.283); ctx.fill(); }
        return true; });
      // estats
      let fill=0;
      states.forEach(q=>{ fill+=q.f; ctx.beginPath(); ctx.arc(q.x,q.y,q.r,0,6.283);
        ctx.fillStyle=V.alpha(C.red,.12+.7*q.f); ctx.fill(); ctx.lineWidth=1; ctx.strokeStyle=q.f>0?C.red:V.alpha(C.ink,.45); ctx.stroke(); });
      const p=fill/states.length;
      cnt.text(`${f0(homes.length)} ordinadors · ${f0(done)} resultats rebuts`);
      pct.text(`${f0(p*100)} % explorat`);
      if(p>=.999){ t0+=dt; if(t0>2200){ t0=0; states.forEach(q=>q.f=0); done=0; } }
    }
    el.__loop=V.loop(el,frame);
    // hover: què és cada columna
    const tp=V.tip(el), hit=s.append("rect").attr("width",w).attr("height",h).attr("fill","transparent");
    V.hover(hit.node(),(ev,[px])=>{
      if(px<fx0-10)tp.show("<b>Servidor</b>: trosseja el problema en unitats de treball independents i les reparteix");
      else if(px<fx1+14)tp.show(`<b>${mode===0?"Febrer del 2020":"Primavera del 2020"}</b>: cada punt és un ordinador; s'encén en vermell mentre calcula el seu tros`);
      else tp.show("<b>Mapa de formes</b>: amb cada resultat, l'equip sap més formes de la proteïna i tria on calcular després");
    },()=>tp.hide());
  });
})();

/* =====================================================================
   V3 · SCALE-04 · UNA DÈCIMA DE SEGON, PAS A PAS (escala logarítmica)
   ===================================================================== */
(function temps(){
  const box=$("#temps-viz"); if(!box)return;
  const IT=[
    {v:4e-15,t:"Un pas",s:"4 femtosegons",d:"4 femtosegons, el que avança la simulació a cada càlcul"},
    {v:4e-8,t:"Una simulació de cerca",s:"40 nanosegons",d:"40 nanosegons, cada simulació de l'algorisme que busca formes noves (al núvol)"},
    {v:3e-6,t:"Un conjunt de dades habitual",s:"uns quants microsegons",d:"uns quants microsegons per proteïna, el que era normal"},
    {v:1e-3,t:"L'espiga",s:"més d'1 mil·lisegon",d:"més d'un mil·lisegon de simulació només per a l'espiga"},
    {v:.1,t:"Tot el virus",s:"0,1 segons",d:"una dècima de segon de les proteïnes del virus"}];
  const UN=[[1e-15,"femtosegon"],[1e-12,"picosegon"],[1e-9,"nanosegon"],[1e-6,"microsegon"],[1e-3,"mil·lisegon"],[1,"segon"]];
  let anchor=0;
  V.mount(box,(el,w)=>{
    const mob=w<600;
    const h=mob?470:290;
    const s=V.svg(el,w,h,"Escala logarítmica del temps simulat: un pas de 4 femtosegons, una simulació curta de 40 nanosegons, un conjunt de dades habitual d'uns quants microsegons, més d'un mil·lisegon per a l'espiga i una dècima de segon per a totes les proteïnes del virus. Del pas al total hi ha 25 bilions de passos.");
    const g=s.append("g");
    const R=v=>7+(Math.log10(v)+15)*(mob?1.5:2.6);
    // posició al llarg de l'eix (horitzontal en escriptori, vertical en mòbil)
    const a0=mob?34:40, a1=mob?h-40:w-60;
    const sc=d3.scaleLog([1e-15,1],[a0,a1]);
    const ax=mob?92:null, ay=mob?null:180;
    const P=v=>mob?[ax,sc(v)]:[sc(v),ay];
    // eix
    if(mob)g.append("line").attr("x1",ax).attr("x2",ax).attr("y1",a0).attr("y2",a1).attr("stroke",C.ink).attr("stroke-width",.8);
    else g.append("line").attr("x1",a0).attr("x2",a1).attr("y1",ay).attr("y2",ay).attr("stroke",C.ink).attr("stroke-width",.8);
    d3.range(-15,1).forEach(e=>{ const p=P(Math.pow(10,e)), maj=e%3===0;
      if(mob)g.append("line").attr("x1",ax-(maj?6:3)).attr("x2",ax).attr("y1",p[1]).attr("y2",p[1]).attr("stroke",C.ink).attr("stroke-width",.7);
      else g.append("line").attr("x1",p[0]).attr("x2",p[0]).attr("y1",ay).attr("y2",ay+(maj?6:3)).attr("stroke",C.ink).attr("stroke-width",.7); });
    UN.forEach(([v,n])=>{ const p=P(v);
      if(mob)V.t(g,ax-10,p[1]+4,{femtosegon:"fs",picosegon:"ps",nanosegon:"ns",microsegon:"µs","mil·lisegon":"ms",segon:"s"}[n],{size:11.5,anchor:"end",fill:C.muted});
      else V.t(g,p[0],ay+22,n,{size:11.5,anchor:"middle",fill:C.muted}); });
    // cercles
    const CI=g.append("g").selectAll("g").data(IT).join("g").attr("transform",d=>`translate(${P(d.v)})`).style("cursor","pointer");
    CI.append("circle").attr("r",d=>R(d.v)).attr("fill",(d,i)=>V.alpha(i===4?C.red:C.blue,.14)).attr("stroke",(d,i)=>i===4?C.red:C.blue).attr("stroke-width",1);
    CI.append("circle").attr("r",2.2).attr("fill",C.ink);
    // etiquetes
    const LB=g.append("g");
    IT.forEach((d,i)=>{ const p=P(d.v);
      if(mob){ V.t(LB,ax+R(d.v)+10,p[1]+1,d.t,{size:12.5,weight:700}); V.t(LB,ax+R(d.v)+10,p[1]+16,d.s,{size:11.5,fill:C.ink2}); }
      else { const hi=i%2===1, y=hi?ay-112:ay-70, anc=i===0?"start":i===4?"end":"middle";
        if(hi)LB.append("line").attr("x1",p[0]).attr("x2",p[0]).attr("y1",y+20).attr("y2",ay-R(d.v)).attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","1.5 2.5");
        V.t(LB,p[0],y,d.t,{size:12.5,weight:700,anchor:anc,halo:3}); V.t(LB,p[0],y+15,d.s,{size:11.5,fill:C.ink2,anchor:anc,halo:3}); }
    });
    // arc de proporció
    const AR=g.append("g").style("pointer-events","none");
    function arc(i,j,anim){
      AR.selectAll("*").remove(); if(i===j)return;
      const lo=Math.min(i,j), hi=Math.max(i,j), A=P(IT[lo].v), B=P(IT[hi].v), ratio=IT[hi].v/IT[lo].v;
      let d, lx, ly, anc;
      if(mob){ const x=ax-34-(hi-lo)*12; d=`M${ax-4},${A[1]}C${x},${A[1]} ${x},${B[1]} ${ax-4},${B[1]}`; lx=8; ly=(A[1]+B[1])/2; anc="start"; }
      else { const y=ay+60+(hi-lo)*6; d=`M${A[0]},${ay+4}C${A[0]},${y} ${B[0]},${y} ${B[0]},${ay+4}`; lx=(A[0]+B[0])/2; ly=y-2; anc="middle"; }
      const p=AR.append("path").attr("d",d).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.4);
      if(anim&&!V.reduced){ const L=p.node().getTotalLength(); p.attr("stroke-dasharray",L).attr("stroke-dashoffset",L).transition().duration(900).ease(EIO).attr("stroke-dashoffset",0); }
      const lab=`×${words(ratio)}`;
      if(mob)V.t(AR,4,14,`${IT[lo].t} → ${IT[hi].t.toLowerCase()}: ${lab}`,{size:12,weight:700,fill:C.red,halo:3});
      else V.t(AR,lx,ly+14,lab,{size:12.5,weight:700,fill:C.red,halo:3,anchor:anc});
    }
    const tp=V.tip(el);
    let hvI=-1;
    CI.on("click",(ev,d)=>{ anchor=IT.indexOf(d); arc(anchor,anchor===4?0:4,true); V.focus(CI,x=>x===d||IT.indexOf(x)===(anchor===4?0:4),.5); tp.show(`<b>${d.t}</b> fixat com a referència · passa per un altre cercle`); });
    V.hover(s.node(),(ev,[px,py])=>{
      const i=d3.minIndex(IT,d=>{ const p=P(d.v); return Math.hypot(px-p[0],py-p[1]); }), p=P(IT[i].v);
      if(Math.hypot(px-p[0],py-p[1])>Math.max(R(IT[i].v)+14,28)){ return; }
      if(i===hvI)return; hvI=i;
      V.focus(CI,x=>x===IT[i]||x===IT[anchor],.5);
      arc(anchor,i,false);
      const d=IT[i], r=d.v/IT[anchor].v;
      tp.show(`<b>${d.t}</b>: ${d.d}${i!==anchor?` · ${r>1?`hi caben ${words(r)} vegades «${IT[anchor].t.toLowerCase()}»`:`${words(1/r)} vegades més curt que «${IT[anchor].t.toLowerCase()}»`}`:""}`);
    },()=>{ hvI=-1; V.focus(CI,null); arc(0,4,false); tp.hide(); });
    V.onView(el,inst=>{ arc(0,4,!inst); if(!inst){ CI.style("opacity",0).transition().delay((d,i)=>i*160).duration(500).style("opacity",1); } },{threshold:.4});
  });
})();

/* =====================================================================
   V4 · HOW-01 · L'ESPIGA QUE S'OBRE (esquema amb lliscant)
   ===================================================================== */
(function espiga(){
  const box=$("#espiga-viz"), rng=$("#espiga-rng"), out=$("#espiga-out"); if(!box)return;
  const lg=$("#espiga-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Braç que s'obre",a:.4},{c:C.yellow,t:"Zona amagada",a:.9},{c:C.red,t:"Anticòs",kind:"line"}]); }
  let T=0, draw=null;
  const stateTxt=t=>t<.12?"Tancada, la forma més freqüent":t<.5?"Un braç aixecat, com a les fotografies de microscopi":t<.78?"Una obertura que només es va veure a les simulacions":"La zona amagada queda a la vista i un anticòs hi pot encaixar";
  V.mount(box,(el,w)=>{
    const mob=w<600, h=mob?300:360;
    const s=V.svg(el,w,h,"Esquema de l'espiga del coronavirus sobre la membrana del virus: un tronc i tres braços al capdamunt. En obrir-se un dels braços, apareix una zona que tancada quedava amagada, i un anticòs s'hi pot enganxar.");
    const cx=w/2-(mob?0:40), base=h-34, sc=mob?.78:1;
    const g=s.append("g").attr("transform",`translate(${cx},${base}) scale(${sc})`);
    // membrana
    g.append("path").attr("d",`M${-cx/sc+2},18 Q0,6 ${(w-cx)/sc-2},18 L${(w-cx)/sc-2},30 L${-cx/sc+2},30Z`).attr("fill",V.alpha(C.ink,.06)).attr("stroke",V.alpha(C.ink,.35)).attr("stroke-width",1);
    // tronc (part fixa de l'espiga)
    g.append("path").attr("d","M-26,12 C-30,-60 -46,-120 -50,-170 L50,-170 C46,-120 30,-60 26,12Z").attr("fill",V.alpha(C.ink,.12)).attr("stroke",C.ink2).attr("stroke-width",1.1);
    // braç del fons i braç esquerre (fixos)
    const blob="M-30,0 C-36,-28 -18,-52 0,-52 C18,-52 36,-28 30,0 C20,10 -20,10 -30,0Z";
    g.append("path").attr("d",blob).attr("transform","translate(0,-176) scale(1.05)").attr("fill",V.alpha(C.ink,.18)).attr("stroke",C.ink2).attr("stroke-width",1);
    g.append("path").attr("d",blob).attr("transform","translate(-44,-166) rotate(-12)").attr("fill",V.alpha(C.ink,.14)).attr("stroke",C.ink2).attr("stroke-width",1);
    // zona amagada (a la cara interior del braç dret, tapada pel braç del fons)
    const neck=g.append("path").attr("fill","none").attr("stroke",V.alpha(C.ink,.22)).attr("stroke-width",9).attr("stroke-linecap","round");
    const arm=g.append("g");
    const zone=arm.append("path").attr("d","M-26,-6 C-30,-20 -26,-34 -16,-38 C-10,-26 -12,-12 -26,-6Z").attr("fill",C.yellow).attr("stroke",C.yellowDark).attr("stroke-width",1);
    const armBody=arm.append("path").attr("d",blob).attr("fill",V.alpha(C.blue,.22)).attr("stroke",C.blue).attr("stroke-width",1.3);
    zone.raise();
    // anticòs (Y)
    const ab=g.append("g").attr("fill","none").attr("stroke",C.red).attr("stroke-width",3.2).attr("stroke-linecap","round");
    ab.append("path").attr("d","M0,0 L0,46 M0,0 L-18,-30 M0,0 L18,-30");
    ab.append("circle").attr("cx",-18).attr("cy",-30).attr("r",3).attr("fill",C.red);
    ab.append("circle").attr("cx",18).attr("cy",-30).attr("r",3).attr("fill",C.red);
    // etiquetes
    const L=s.append("g");
    const lab=(x,y,txt,o)=>V.t(L,cx+x*sc,base+y*sc,txt,Object.assign({size:12,fill:C.ink2,halo:3},o||{}));
    if(!mob){ lab(-150,-8,"Membrana del virus",{anchor:"end"}); lab(-70,-100,"Tronc",{anchor:"end"}); lab(-96,-200,"Braços que s'uneixen a la cèl·lula",{anchor:"end"}); }
    else { lab(-110,4,"Membrana",{anchor:"start"}); }
    const zl=lab(0,0,"Zona amagada",{weight:700,fill:C.ink});
    draw=function(t){
      T=t; const e=d3.easeCubicInOut(t);
      // el braç dret s'aixeca i gira cap enfora
      const tx=42+e*40, ty=-166-e*36, rot=12+e*58;
      arm.attr("transform",`translate(${tx},${ty}) rotate(${rot})`);
      neck.attr("d",`M34,-166 Q${34+e*10},${-176-e*20} ${tx-4},${ty-4}`);
      const zo=clamp((t-.55)/.25,0,1); zone.style("opacity",zo);
      // l'anticòs s'acosta quan la zona és visible
      const ao=clamp((t-.72)/.2,0,1);
      // punt de la zona en coordenades del grup
      const rr=rot*Math.PI/180, zx=-22, zy=-22, px=tx+zx*Math.cos(rr)-zy*Math.sin(rr), py=ty+zx*Math.sin(rr)+zy*Math.cos(rr);
      ab.style("opacity",ao).attr("transform",`translate(${px+40+(1-ao)*50},${py}) rotate(-90)`);
      zl.attr("x",cx+(px+(mob?-8:-18))*sc).attr("y",base+(py-24)*sc).attr("text-anchor","end").style("opacity",zo);
      if(out)out.innerHTML=`<b>${stateTxt(t)}</b>`;
      if(rng&&+rng.value!==Math.round(t*100))rng.value=Math.round(t*100);
    };
    draw(T);
    const tp=V.tip(el);
    V.hover(s.node(),(ev,[px,py])=>{
      const x=(px-cx)/sc, y=(py-base)/sc;
      if(y>4)tp.show("<b>Membrana</b> del virus");
      else if(y>-150&&Math.abs(x)<55)tp.show("<b>Tronc</b> de l'espiga, la part que la fixa al virus");
      else if(T>.55&&x>10)tp.show("<b>Zona amagada</b>: a les fotografies quedava tapada; a les simulacions apareix quan el braç s'obre del tot");
      else tp.show("<b>Braços</b>: s'uneixen a la cèl·lula; a les simulacions s'obren d'un en un, i la major part del temps estan tancats");
    },()=>tp.hide());
  });
  if(rng)rng.addEventListener("input",()=>{ if(box.__anim){ box.__anim.stop(); box.__anim=null; } if(draw)draw(+rng.value/100); });
  V.onView(box,inst=>{
    if(inst||!draw){ if(draw)draw(.85); return; }
    const t0=performance.now();
    box.__anim=d3.timer(el=>{ const p=Math.min(1,el/4200), v=p<.6?d3.easeCubicInOut(p/.6):1-.15*d3.easeCubicInOut((p-.6)/.4); if(draw)draw(v); if(p>=1){ box.__anim.stop(); box.__anim=null; } });
    void t0;
  },{threshold:.45});
})();

/* =====================================================================
   V5 · TIME-01 · ELS VOLUNTARIS CONTRA EL NÚMERO U (sèrie anotada, log)
   ===================================================================== */
(function historia(){
  const box=$("#historia-viz"); if(!box)return;
  const lg=$("#historia-lg"); if(lg){ lg.innerHTML=""; V.legendCat(lg,[{c:C.blue,t:"Número u de la llista TOP500",kind:"line"},{c:C.red,t:"Ordinadors voluntaris"}]); }
  const T1=D.top1, VO=D.vol, FH=D.fah;
  V.mount(box,(el,w)=>{
    const mob=w<640, h=mob?330:420;
    const m={t:24,r:mob?54:110,b:30,l:mob?40:58};
    const s=V.svg(el,w,h,"Gràfic de línies en escala logarítmica del 1997 al 2026: la potència del superordinador número u del món puja de 1 teraflop a més de 2.000 petaflops. Els punts vermells de la computació voluntària: SETI@home supera el número u el 2003, Folding@home arriba a 1 petaflop el 2007 i a 1 exaflop en unitats x86 el 2020, i després baixa fins a uns 21 petaflops el 2026.");
    const x=d3.scaleLinear([1997,2027],[m.l,w-m.r]), y=d3.scaleLog([.0007,4000],[h-m.b,m.t]);
    const g=s.append("g");
    // reixa i eixos
    [[.001,"1 teraflop"],[1,"1 petaflop"],[1000,"1 exaflop"]].forEach(([v,t])=>{ g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.grid);
      V.t(g,m.l-6,y(v)+4,mob?t.replace(" teraflop"," TF").replace(" petaflop"," PF").replace(" exaflop"," EF"):t,{size:11.5,anchor:"end",fill:C.muted}); });
    [.01,.1,10,100].forEach(v=>g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.grid).attr("stroke-dasharray","2 3"));
    d3.range(2000,2027,mob?10:5).forEach(yr=>V.t(g,x(yr),h-m.b+18,String(yr),{size:11.5,anchor:"middle",fill:C.muted}));
    g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",h-m.b).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.7);
    // número u (esglaons)
    const pts=T1.map(d=>[d[0],d[1]]); pts.push([2026.9,T1[T1.length-1][1]]);
    const line=d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveStepAfter);
    const pTop=g.append("path").attr("d",line(pts)).attr("fill","none").attr("stroke",C.blue).attr("stroke-width",2.2);
    // sèrie del web de Folding@home (2021–2026) i enllaç discontinu des del pic
    const fh=FH.map(d=>[d[0],d[1]]);
    const pk=VO.find(d=>d.v===1010);
    const lineF=d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX);
    const gap=g.append("path").attr("d",lineF([[pk.y,pk.v],fh[0]])).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.2).attr("stroke-dasharray","3 3");
    const pF=g.append("path").attr("d",lineF(fh)).attr("fill","none").attr("stroke",C.red).attr("stroke-width",1.6);
    const dots=g.append("g").selectAll("circle").data(VO).join("circle").attr("cx",d=>x(d.y)).attr("cy",d=>y(d.v)).attr("r",d=>d.v===1010?6:4.5)
      .attr("fill",V.alpha(C.red,.85)).attr("stroke",C.paper).attr("stroke-width",1.2);
    const last=fh[fh.length-1];
    g.append("circle").attr("cx",x(last[0])).attr("cy",y(last[1])).attr("r",3.5).attr("fill",C.red);
    // anotacions (≤ 3)
    const an=g.append("g");
    const seti=VO[1];
    V.note(an,{x:x(seti.y),y:y(seti.v)+6,tx:x(seti.y)+(mob?8:14),ty:y(seti.v)+(mob?46:56),kind:"elbow",anchor:"start",size:mob?11.5:12.5,lines:mob?[["2003: SETI@home",true],["supera el número u"]]:[["2003: SETI@home supera",true],["el superordinador més potent"]]});
    V.note(an,{x:x(pk.y)-6,y:y(pk.v),tx:x(pk.y)-(mob?30:40),ty:y(pk.v)-(mob?0:4),kind:"elbow",anchor:"end",size:mob?11.5:12.5,lines:[["Primavera del 2020:",true],["1 exaflop (x86)"]]});
    V.t(an,x(last[0])+7,y(last[1])+4,mob?"21 PF":"2026: 21 petaflops",{size:mob?11.5:12.5,weight:700,fill:C.red,halo:3});
    V.t(an,x(T1[T1.length-1][0])+(mob?-2:8),y(T1[T1.length-1][1])-8,mob?"":"Número u",{size:12,fill:C.blue,weight:700,halo:3,anchor:mob?"end":"start"});
    // hover per tota l'amplada
    const hv=g.append("g").style("pointer-events","none").style("display","none");
    const vl=hv.append("line").attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.8);
    const d1=hv.append("circle").attr("r",4).attr("fill",C.blue).attr("stroke",C.paper).attr("stroke-width",1.5);
    const d2=hv.append("circle").attr("r",5.5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
    const tp=V.tip(el), hit=s.append("rect").attr("x",m.l).attr("y",m.t).attr("width",w-m.l-m.r).attr("height",h-m.t-m.b).attr("fill","transparent").style("cursor","crosshair");
    V.hover(hit.node(),(ev,[px,py])=>{
      const yr=clamp(x.invert(px),1997.4,2026.9);
      const tk=T1.filter(d=>d[0]<=yr).pop()||T1[0];
      // punt voluntari més proper en pantalla
      const cand=VO.map(d=>({d,yv:d.y,v:d.v})).concat(FH.map(d=>({d:null,yv:d[0],v:d[1],fh:d})));
      const nb=cand.reduce((a,b)=>Math.hypot(x(b.yv)-px,(y(b.v)-py)*.6)<Math.hypot(x(a.yv)-px,(y(a.v)-py)*.6)?b:a);
      const near=Math.abs(x(nb.yv)-px)<28;
      hv.style("display",null); vl.attr("x1",px).attr("x2",px); d1.attr("cx",px).attr("cy",y(tk[1]));
      d2.style("display",near?null:"none").attr("cx",x(nb.yv)).attr("cy",y(nb.v));
      V.focus(dots,near&&nb.d?(q=>q===nb.d):null,.5);
      const top=`<b>${Math.floor(yr)}</b> · número u: ${tk[2]}, ${pf(tk[1])}`;
      let vol="";
      if(near){ if(nb.d)vol=`${nb.d.t}: ${nb.d.d}${nb.v>tk[1]?" · més que el número u":""}`;
        else { const f=nb.fh, mo=Math.round((f[0]-Math.floor(f[0]))*12); vol=`Folding@home, ${V.MES[clamp(mo,0,11)]}. ${Math.floor(f[0])}: ${pf(f[1])}, amb ${f0(f[2])} targetes gràfiques i ${f0(f[3])} processadors`; } }
      tp.show(vol?`${vol}<br>${top}`:top);
    },()=>{ hv.style("display","none"); V.focus(dots,null); tp.hide(); });
    // entrada: les línies es dibuixen
    V.onView(el,inst=>{
      if(inst)return;
      [pTop,pF,gap].forEach((p,i)=>{ const L=p.node().getTotalLength(); p.attr("stroke-dasharray",i===2?null:L).attr("stroke-dashoffset",i===2?null:L).style("opacity",i===2?0:1).transition().delay(i===1?1700:i===2?1500:0).duration(i===0?1800:900).ease(EIO).attr("stroke-dashoffset",0).style("opacity",1).on("end",function(){ if(i!==2)d3.select(this).attr("stroke-dasharray",null); }); });
      gap.attr("stroke-dasharray","3 3");
      dots.attr("r",0).transition().delay((d,i)=>600+i*260).duration(500).attr("r",d=>d.v===1010?6:4.5);
      an.style("opacity",0).transition().delay(2300).duration(600).style("opacity",1);
    },{threshold:.35});
  });
})();

/* =====================================================================
   V6 · PART-01 · QUI DONAVA EL 2002 (reixes d'unitats)
   ===================================================================== */
(function qui(){
  const box=$("#qui-viz"); if(!box)return;
  const G=[
    {t:"Sexe (enquesta de 95.000 participants)",a:93,la:"Homes, 93 %",lb:"La resta, 7 %"},
    {t:"Lloc (226 països)",a:50,la:"Estats Units, prop de la meitat",lb:"Fora dels EUA, prop de la meitat"}];
  V.mount(box,(el,w)=>{
    const mob=w<520, cell=mob?13:16, gw=cell*10, gapX=mob?0:Math.min(150,Math.max(60,w-2*gw-60));
    const h=mob?2*(gw+74):gw+62;
    const s=V.svg(el,w,h,"Dues reixes de cent punts. Dels 95.000 participants de SETI@home que van respondre l'enquesta del 2002, el 93 % eren homes. Els participants venien de 226 països, però prop de la meitat eren als Estats Units.");
    const all=[];
    G.forEach((gr,k)=>{
      const ox=mob?Math.round((w-gw)/2):Math.round((w-2*gw-gapX)/2)+k*(gw+gapX), oy=mob?k*(gw+78)+22:22;
      const gg=s.append("g").attr("transform",`translate(${ox},${oy})`);
      V.t(gg,0,-8,gr.t,{size:12.5,weight:700});
      d3.range(100).forEach(i=>{ const c=i%10, r=Math.floor(i/10), A=i<gr.a;
        const p=gg.append("circle").datum({k,A,i}).attr("cx",c*cell+cell/2).attr("cy",r*cell+cell/2).attr("r",cell*.36)
          .attr("fill",A?V.alpha(C.blue,.75):V.alpha(C.red,.8)); all.push(p.node()); });
      V.t(gg,0,gw+18,gr.la,{size:12,fill:C.blue,weight:700});
      V.t(gg,0,gw+34,gr.lb,{size:12,fill:C.red,weight:700});
    });
    const D3=d3.selectAll(all), tp=V.tip(el);
    V.hover(s.node(),(ev)=>{
      const d=ev.target&&ev.target.__data__; if(!d||d.k==null){ V.focus(D3,null); tp.hide(); return; }
      V.focus(D3,q=>q.k===d.k&&q.A===d.A,.3);
      const gr=G[d.k]; tp.show(`<b>${d.A?gr.la:gr.lb}</b> · ${gr.t.toLowerCase()}`);
    },()=>{ V.focus(D3,null); tp.hide(); });
    V.onView(el,inst=>{ if(inst)return; D3.attr("r",0).transition().delay(d=>d.k*700+d.i*9).duration(300).attr("r",cell*.36); },{threshold:.4});
  });
})();

/* =====================================================================
   V7 · SPREAD-04 · UNA AGULLA EN UN PALLER DE 2.000 MILIONS (pols de punts)
   ===================================================================== */
(function punts(){
  const box=$("#punts-viz"); if(!box)return;
  const PCS=2e9;
  const M=[
    {n:3e4,t:"Folding@home, febrer del 2020",d:"unes 30.000 màquines actives"},
    {n:1e6,t:"Folding@home, primavera del 2020",d:"més d'un milió d'aparells"},
    {n:7e5,t:"Projectes de BOINC, cap al 2018",d:"uns 700.000 aparells"},
    {n:5788+10991,t:"Folding@home, novembre del 2026",d:"unes 5.800 targetes gràfiques i 11.000 processadors"}];
  let mode=segs("#punts-seg",k=>{ mode=k; if(box.__set)box.__set(true); });
  V.mount(box,(el,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<640, per=mob?2e4:1e4, n=Math.round(PCS/per);
    const pitch=mob?1.15:1.32, cols=Math.floor((w-2)/pitch), rows=Math.ceil(n/cols), top=mob?44:30, h=Math.ceil(rows*pitch)+top+10;
    const sp=document.querySelector("#f-punts .vh span"); if(sp)sp.textContent=`Cada punt són ${f0(per)} ordinadors del món; en vermell, els que calculaven per a la ciència`;
    const st=stage(el,h);
    const {ctx}=mkCanvas(st,w,h,`${f0(n)} punts grisos, cada un de ${f0(per)} ordinadors dels més de 2.000 milions que hi ha al món. En vermell, els que calculaven per a la ciència: 100 punts la primavera del 2020 a Folding@home, 3 al febrer, 70 per als projectes de BOINC cap al 2018 i 2 el novembre del 2026.`);
    // fons: pols de punts d'1 px, dibuixat un sol cop en un canvas ocult
    const bg=document.createElement("canvas"), dpr=Math.min(2,window.devicePixelRatio||1); bg.width=Math.round(w*dpr); bg.height=Math.round(h*dpr);
    const bx=bg.getContext("2d"); bx.scale(dpr,dpr); bx.fillStyle=V.alpha(C.ink,.24);
    for(let i=0;i<n;i++){ const c=i%cols, r=Math.floor(i/cols); bx.fillRect(1+c*pitch,top+r*pitch,1,1); }
    const rnd=V.rng(2020), pos=d3.range(200).map(()=>[1+Math.floor(12+rnd()*(cols-24))*pitch,top+Math.floor(8+rnd()*(rows-16))*pitch]);
    const lab=overlay(st,w,h);
    const cnt=V.t(lab,0,16,"",{size:12.5,weight:700,fill:C.ink}), cnt2=V.t(lab,0,33,"",{size:12,fill:C.ink2});
    let red=0, t0=0;
    function set(anim){ red=Math.max(1,Math.round(M[mode].n/per)); t0=anim?performance.now():-1e9;
      const m=M[mode], frac=m.n/PCS, pc=`${frac>=1e-4?f2(frac*100):V.fmt(",.3f")(frac*100)} % dels ordinadors del món`, rp=`${f0(red)} ${red===1?"punt vermell":"punts vermells"} de ${f0(n)}`;
      if(mob){ cnt.text(rp); cnt2.text(`${m.d}: ${pc}`); } else { cnt.text(`${m.t}: ${rp} · ${m.d}, ${pc}`); cnt2.text(""); } }
    el.__set=set; set(false);
    function frame(){
      ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); ctx.drawImage(bg,0,0); ctx.setTransform(dpr,0,0,dpr,0,0);
      const k=clamp((performance.now()-t0)/1400,0,1), pulse=V.reduced?0:(1+Math.sin(performance.now()/420))/2;
      for(let i=0;i<red;i++){ const [px,py]=pos[i], a=clamp(k*1.6-i/red*.6,0,1);
        ctx.strokeStyle=V.alpha(C.red,.25+.35*pulse); ctx.lineWidth=1; ctx.beginPath(); ctx.arc(px+.5,py+.5,(mob?6:8)+pulse*3,0,6.283); ctx.stroke();
        ctx.fillStyle=V.alpha(C.red,a); ctx.fillRect(px-1.2,py-1.2,3.4,3.4); }
    }
    el.__loop=V.loop(el,frame);
    const tp=V.tip(el);
    V.hover(lab.node(),(ev,[px,py])=>{
      const i=d3.minIndex(pos.slice(0,red),p=>Math.hypot(p[0]-px,p[1]-py)), p=pos[i];
      if(p&&Math.hypot(p[0]-px,p[1]-py)<16)tp.show(`<b>${f0(per)} ordinadors</b> calculant per a la ciència · ${M[mode].t}`);
      else tp.show(`<b>${f0(per)} ordinadors</b> del món que no hi participaven`);
    },()=>tp.hide());
    V.onView(el,inst=>{ if(!inst)set(true); },{threshold:.3});
  });
})();

})();
