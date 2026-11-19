/* «Qui era realment Jesús?» · gràfics del nom, del calendari i de l'Alcorà (sistema IBV)
   V8  (#viz-nom):    cadena animada Yehōšūaʿ → Jesús + com es diu avui en 12 llengües.
   V9  (#viz-crono):  cronologia real 13 aC – 40 dC amb l'«any 1» de Dionís l'Exigu i commutador de calendari.
   V10 (#viz-alcora): punts unitaris de les vegades que s'anomena Jesús, Maria i Mahoma a l'Alcorà i al Nou Testament. */
(function(){
  if(!window.d3||!window.IBV||!window.JH)return;
  const V=IBV, C=V.C, D=window.JH;
  const $=s=>document.querySelector(s);
  const ease=d3.easeCubicInOut;
  const dur=ms=>V.reduced?0:ms;

  const OUTS=new Map();
  document.addEventListener("pointerdown",ev=>{ OUTS.forEach((fn,n)=>{ if(n.isConnected&&!n.contains(ev.target))fn(); }); },true);
  const outside=(node,fn)=>OUTS.set(node,fn);
  function seg(fig,cb){
    const bs=[...fig.querySelectorAll(".seg button")];
    bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(x=>x.setAttribute("aria-pressed",String(x===b))); cb(b.dataset.k); }));
  }
  function lg(el,items){
    if(!el)return;
    el.innerHTML=items.map(i=>`<span class="lgi"><i class="${i.k||""}" style="${i.k==="ln"||i.k==="da"||i.k==="ho"?"border-color":"background"}:${i.c}"></i>${i.t}</span>`).join("");
  }
  // interacció comuna: element apuntat amb contorn, la resta a 0,48, lectura fixa a sota
  function bindHover(sel,node,rd,def,html,onHi,onReset){
    const reset=()=>{ sel.interrupt().transition().duration(dur(140)).style("opacity",1); onReset&&onReset(); if(rd)rd.innerHTML=def; };
    const show=(t,d)=>{ sel.interrupt().transition().duration(dur(140)).style("opacity",o=>o===d?1:.48); d3.select(t).raise(); onHi&&onHi(t,d); if(rd)rd.innerHTML=html(d); };
    if(rd)rd.innerHTML=def;
    outside(node,reset);
    sel.attr("tabindex",0).attr("role","button").style("cursor","pointer")
      .on("pointerenter pointerdown",(ev,d)=>show(ev.currentTarget,d))
      .on("focus",(ev,d)=>show(ev.currentTarget,d))
      .on("blur",reset)
      .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });
    return reset;
  }

  /* =====================================================================
     V8 · EL VIATGE D'UN NOM (#viz-nom)
     ===================================================================== */
  (function(){
    const el=$("#viz-nom"), rd=$("#nom-r");
    if(!el)return;
    const CH=D.nom.cadena, AV=D.nom.avui;
    lg($("#nom-lg"),[{c:C.vermell,t:"El nom que duia al segle I"},{c:C.blau,t:"Adaptacions posteriors"}]);

    V.mount(el,(node,w)=>{
      const mob=w<640;
      const n=CH.length;
      // cadena: horitzontal a ordinador, vertical a mòbil
      const chainH=mob?n*74+10:212;
      const cols=mob?3:6, rowsAv=Math.ceil(AV.length/cols);
      const avTop=chainH+(mob?46:52), avRow=mob?66:70;
      const h=avTop+rowsAv*avRow+6;
      const s=V.svg(node,w,h,"Com el nom hebreu Yehoshua, escurçat en Yeshua, es va convertir en el grec Iesous, el llatí Iesus i, amb la lletra J, en Jesús; i com es diu avui en dotze llengües.");
      const pos=CH.map((d,i)=>mob?{x:34,y:30+i*74}:{x:(w/(n))*(i+.5),y:58});

      // traç que uneix les estacions (es dibuixa en entrar)
      const line=d3.line().curve(mob?d3.curveLinear:d3.curveBumpX);
      const path=s.append("path").attr("d",line(pos.map(p=>[p.x,p.y]))).attr("fill","none")
        .attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-opacity",.55);
      // etiquetes del canvi entre estacions
      const gChg=s.append("g");
      CH.forEach((d,i)=>{
        if(!i||!d.canvi)return;
        const a=pos[i-1], b=pos[i];
        if(mob) V.t(gChg,a.x+14,(a.y+b.y)/2+4,d.canvi,{size:11,italic:true,fill:C.ink2,halo:3});
        else V.t(gChg,(a.x+b.x)/2,a.y-27,d.canvi,{anchor:"middle",size:11,italic:true,fill:C.ink2,halo:3});
      });

      const st=s.selectAll("g.nst").data(CH).join("g").attr("class","nst")
        .attr("transform",(d,i)=>`translate(${pos[i].x},${pos[i].y})`)
        .attr("aria-label",d=>`${d.tr}: ${d.l}`);
      st.append("circle").attr("class","hit").attr("r",mob?30:44).attr("fill","transparent");
      st.append("circle").attr("class","wash").attr("r",mob?15:19)
        .attr("fill",d=>V.alpha(d.seg1?C.vermell:C.blau,.2)).style("mix-blend-mode","multiply");
      st.append("circle").attr("class","rim").attr("r",mob?15:19).attr("fill","none").attr("stroke","transparent").attr("stroke-width",1.5);
      st.append("circle").attr("r",3.4).attr("fill",d=>d.seg1?C.vermell:C.blau).attr("stroke",C.paper).attr("stroke-width",1.2);
      st.each(function(d){
        const g=d3.select(this);
        if(mob){
          V.t(g,30,-6,d.g,{size:d.g.length>8?17:20,serif:true,fill:C.ink,halo:3});
          V.t(g,30,13,`${d.tr} · ${d.l}`,{size:11.5,weight:700,fill:C.ink,halo:3});
          V.t(g,30,28,d.d,{size:11,fill:C.muted,halo:3});
        } else {
          V.t(g,0,46,d.g,{anchor:"middle",size:d.g.length>8?19:23,serif:true,fill:C.ink,halo:3});
          V.t(g,0,70,d.tr,{anchor:"middle",size:12.5,weight:700,fill:C.ink,halo:3});
          V.t(g,0,87,d.l,{anchor:"middle",size:11.5,fill:C.ink2,halo:3});
          V.t(g,0,103,d.d,{anchor:"middle",size:11,fill:C.muted,halo:3});
        }
      });

      // com es diu avui
      V.t(s,0,avTop-20,mob?"Com es diu avui":"Com es diu avui (Mateu 1,21 a les Bíblies de cada llengua; ʿĪsā, a l'Alcorà)",{size:12,weight:700,fill:C.ink});
      s.append("line").attr("x1",0).attr("x2",w).attr("y1",avTop-12).attr("y2",avTop-12).attr("stroke",C.hair).attr("stroke-width",.8);
      const cw=w/cols;
      const av=s.selectAll("g.nav").data(AV).join("g").attr("class","nav")
        .attr("transform",(d,i)=>`translate(${(i%cols)*cw+cw/2},${avTop+Math.floor(i/cols)*avRow+22})`)
        .attr("aria-label",d=>`${d.tr}, ${d.l}`);
      av.append("rect").attr("class","hit").attr("x",-cw/2+4).attr("y",-24).attr("width",cw-8).attr("height",avRow-6).attr("fill","transparent");
      av.append("rect").attr("class","rim").attr("x",-cw/2+6).attr("y",-24).attr("width",cw-12).attr("height",avRow-8).attr("fill","none").attr("stroke","transparent").attr("stroke-width",1.2);
      av.each(function(d){
        const g=d3.select(this);
        V.t(g,0,0,d.g,{anchor:"middle",size:mob?17:19,fill:d.k==="isa"?C.vermell:C.ink,halo:3});
        V.t(g,0,18,d.tr,{anchor:"middle",size:11.5,weight:700,fill:C.ink,halo:3});
        V.t(g,0,32,d.l,{anchor:"middle",size:11,fill:C.muted,halo:3});
      });

      const def="<b>Ningú no el va cridar mai «Jesús» en vida.</b> Passa el cursor o toca cada pas per veure què va canviar.";
      const html=d=>`<b>${d.tr} · ${d.l}</b> · ${d.det}`;
      const all=d3.selectAll([...st.nodes(),...av.nodes()]);
      bindHover(all,node,rd,def,html,
        t=>{ all.select(".rim").attr("stroke","transparent"); d3.select(t).select(".rim").attr("stroke",C.ink); },
        ()=>all.select(".rim").attr("stroke","transparent"));

      V.onView(node,instant=>{
        if(instant)return;
        const L=path.node().getTotalLength();
        path.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L)
          .transition().duration(1800).ease(d3.easeLinear).attr("stroke-dashoffset",0)
          .on("end",()=>path.attr("stroke-dasharray",null));
        st.style("opacity",0).transition().delay((d,i)=>i*300).duration(500).ease(ease).style("opacity",1);
        gChg.style("opacity",0).transition().delay(1500).duration(600).style("opacity",1);
        av.style("opacity",0).transition().delay((d,i)=>1900+i*60).duration(450).style("opacity",1);
        const dot=s.append("circle").attr("r",4.5).attr("fill",C.vermell).attr("cx",pos[0].x).attr("cy",pos[0].y);
        dot.transition().duration(1800).ease(d3.easeLinear)
          .attrTween("transform",()=>t=>{ const p=path.node().getPointAtLength(t*L); return `translate(${p.x-pos[0].x},${p.y-pos[0].y})`; })
          .on("end",()=>dot.transition().duration(400).style("opacity",0).remove());
      });
    });
  })();

  /* =====================================================================
     V9 · L'ANY 1 NO ÉS L'ANY QUE VA NÉIXER (#viz-crono)
     Anys astronòmics: 1 aC = 0, 4 aC = −3 (no hi ha any zero al calendari civil).
     ===================================================================== */
  (function(){
    const fig=$("#f-crono"), el=$("#viz-crono"), rd=$("#crono-r");
    if(!el)return;
    let mode="civil";
    const R=D.crono;
    const lab=y=>y<=0?`${1-y} aC`:`${y} dC`;
    lg($("#crono-lg"),[{c:C.vermell,t:"Jesús (dates probables)"},{c:C.ghost,t:"Governants i càrrecs"}]);

    const M=V.mount(el,(node,w)=>{
      const mob=w<640;
      const m={t:54,r:mob?12:26,b:40,l:mob?10:196};
      const rowH=mob?44:34, h=m.t+R.length*rowH+m.b;
      const s=V.svg(node,w,h,"Cronologia del 13 aC al 40 dC: Herodes el Gran mor el 4 aC, Jesús neix cap al 6–4 aC i mor cap al 30 dC sota Ponç Pilat; l'any 1 del calendari actual, calculat per Dionís l'Exigu el 525, cau uns anys després del naixement real.");
      const x=d3.scaleLinear().domain([-12,40]).range([m.l,w-m.r]);
      const y=i=>m.t+i*rowH+rowH/2+(mob?8:0);

      // eix: en mode «naixement» les etiquetes compten des de l'any probable del naixement (5 aC = any 1)
      const ticks=[-12,-4,0,1,10,20,30,40].filter(v=>!mob||[-12,0,1,20,40].includes(v)||v===30);
      const tickLbl=v=>mode==="civil"?lab(v):(v<-4||v===0||v===1?"":`any ${v+5}`);
      const gAx=s.append("g");
      ticks.forEach(v=>{
        if(v===0)return;
        gAx.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t-8).attr("y2",h-m.b).attr("stroke",C.grid).attr("stroke-width",.6);
        V.t(gAx,x(v),h-m.b+16,tickLbl(v),{anchor:"middle",size:11.5,fill:C.muted});
      });
      // l'any 1 de Dionís
      const x1=x(.5);
      s.append("line").attr("x1",x1).attr("x2",x1).attr("y1",m.t-22).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",1.2);
      const yr1=V.t(s,x1+6,m.t-26,mode==="civil"?"Any 1 de Dionís l'Exigu (calculat el 525)":"Comptant des del naixement real, aquí ja seria l'any 5, 6 o 7",{size:12,weight:700,fill:C.ink,halo:3});
      if(!mob) V.t(s,x1+6,m.t-12,"Entre l'1 aC i l'1 dC no hi ha any zero",{size:11,italic:true,fill:C.ink2,halo:3});

      const rows=s.selectAll("g.cr").data(R).join("g").attr("class","cr").attr("aria-label",d=>`${d.nom}: ${d.txt}`);
      rows.append("rect").attr("class","hit").attr("x",0).attr("width",w).attr("y",(d,i)=>y(i)-rowH/2).attr("height",rowH).attr("fill","transparent");
      rows.each(function(d,i){
        const g=d3.select(this), yy=y(i), jes=d.k==="jesus";
        const col=jes?C.vermell:C.ghost;
        if(mob) V.t(g,m.l,yy-11,d.nom,{size:11.5,weight:jes?700:600,fill:C.ink,halo:3});
        else V.t(g,m.l-12,yy+4,d.nom,{anchor:"end",size:12.5,weight:jes?700:400,fill:C.ink});
        if(d.vida) g.append("line").attr("x1",x(d.vida[0])).attr("x2",x(d.vida[1])).attr("y1",yy).attr("y2",yy)
          .attr("stroke",C.vermell).attr("stroke-width",1.2).attr("stroke-dasharray","2 3");
        (d.trams||[[d.a,d.b]]).forEach(([a,b])=>{
          const xa=x(Math.max(a,-12)), xb=x(Math.min(b,40));
          g.append("line").attr("class","bar").attr("x1",xa).attr("x2",xa).attr("data-x2",xb).attr("y1",yy).attr("y2",yy)
            .attr("stroke",col).attr("stroke-width",jes?9:7).attr("stroke-linecap","round");
          if(a<-12&&!mob) V.t(g,xa+2,yy-8,`des del ${lab(a)}`,{size:11,italic:true,fill:C.muted,halo:3});
        });
        (d.punts||[]).forEach(p=>{
          g.append("circle").attr("cx",x(p.v)).attr("cy",yy).attr("r",5.5)
            .attr("fill",p.buit?C.paper:C.vermell).attr("stroke",C.vermell).attr("stroke-width",1.6);
          V.t(g,x(p.v),yy-10,p.t,{anchor:"middle",size:11,weight:700,fill:C.ink,halo:3});
        });
        if(d.tv) V.t(g,x(d.tv[0]),yy+(mob?17:18),d.tv[1],{anchor:d.tv[2]||"middle",size:11,fill:C.ink2,halo:3});
      });
      rows.append("rect").attr("class","rim").attr("x",m.l-4).attr("width",w-m.l-m.r+8).attr("y",(d,i)=>y(i)-rowH/2+2).attr("height",rowH-4).attr("fill","none").attr("stroke","transparent").attr("stroke-width",1.2);

      const def=mode==="civil"
        ?"<b>Jesús va néixer uns quants anys «abans de Crist».</b> Herodes el Gran, que segons Mateu regnava quan va néixer, va morir el 4 aC. Passa el cursor per sobre de cada fila."
        :"<b>Si l'any 1 fos el del naixement real (cap al 6–4 aC), el 2026 seria aproximadament el 2030–2032.</b> Passa el cursor per sobre de cada fila.";
      bindHover(rows,node,rd,def,d=>`<b>${d.nom}</b> · ${d.txt} <i>(${d.font})</i>`,
        t=>{ rows.select(".rim").attr("stroke","transparent"); d3.select(t).select(".rim").attr("stroke",C.ink); },
        ()=>rows.select(".rim").attr("stroke","transparent"));

      const grow=instant=>rows.selectAll("line.bar").each(function(){ const l=d3.select(this); if(instant)l.attr("x2",l.attr("data-x2")); else l.transition().delay(150).duration(1100).ease(ease).attr("x2",l.attr("data-x2")); });
      V.onView(node,instant=>grow(instant));
    });
    seg(fig,k=>{ mode=k; M.redraw(); });
  })();

  /* =====================================================================
     V10 · QUANTES VEGADES SURT EL NOM (#viz-alcora)
     ===================================================================== */
  (function(){
    const el=$("#viz-alcora"), rd=$("#alcora-r");
    if(!el||!D.alcora)return;
    const A=D.alcora;
    lg($("#alcora-lg"),[{c:C.vermell,t:"Alcorà"},{c:C.blau,t:"Nou Testament"}]);
    V.mount(el,(node,w)=>{
      const mob=w<640;
      const lw=mob?0:220, r=mob?4.6:5.4, gap=mob?11:13.5;
      const perRow=Math.max(10,Math.floor((w-lw-10)/gap));
      const rowsOf=d=>Math.ceil(d.n/perRow);
      let yy=10; const lay=A.map(d=>{ const top=yy+(mob?20:6); const hh=rowsOf(d)*gap; yy=top+hh+(mob?14:18); return {d,top}; });
      const h=yy+4;
      const s=V.svg(node,w,h,A.map(d=>`${d.nom}: ${d.n} vegades`).join("; "));
      const g=s.selectAll("g.al").data(lay).join("g").attr("class","al").attr("aria-label",o=>`${o.d.nom}: ${o.d.n}`);
      g.append("rect").attr("class","hit").attr("x",0).attr("width",w).attr("y",o=>o.top-(mob?20:8)).attr("height",o=>rowsOf(o.d)*gap+(mob?24:12)).attr("fill","transparent");
      g.each(function(o){
        const q=d3.select(this), d=o.d, col=d.src==="alcora"?C.vermell:C.blau;
        if(mob) V.t(q,0,o.top-8,`${d.nom} · ${d.n}`,{size:11.5,weight:700,fill:C.ink,halo:3});
        else { V.t(q,lw-14,o.top+gap/2+3,d.nom,{anchor:"end",size:12.5,weight:600,fill:C.ink}); }
        const dots=q.selectAll("circle.u").data(d3.range(d.n)).join("circle").attr("class","u")
          .attr("cx",i=>lw+r+(i%perRow)*gap).attr("cy",i=>o.top+r+Math.floor(i/perRow)*gap).attr("r",r)
          .attr("fill",V.alpha(col,.62)).attr("stroke",col).attr("stroke-width",.8);
        if(!mob) V.t(q,lw+r+((d.n-1)%perRow)*gap+r+8,o.top+r+Math.floor((d.n-1)/perRow)*gap+4,String(d.n),{size:12,weight:700,fill:C.ink,halo:3});
        q.node().__dots=dots;
      });
      g.append("rect").attr("class","rim").attr("x",mob?-2:lw-6).attr("width",o=>Math.min(w-(mob?0:lw-6),(Math.min(o.d.n,perRow))*gap+12+(mob?0:24))).attr("y",o=>o.top-(mob?20:6)).attr("height",o=>rowsOf(o.d)*gap+(mob?24:10)).attr("fill","none").attr("stroke","transparent").attr("stroke-width",1.2);
      const def="<b>Cada punt és una vegada que el nom apareix escrit.</b> Passa el cursor per sobre de cada fila.";
      bindHover(g,node,rd,def,o=>`<b>${o.d.nom}: ${o.d.n}</b> · ${o.d.det} <i>(${o.d.font})</i>`,
        t=>{ g.select(".rim").attr("stroke","transparent"); d3.select(t).select(".rim").attr("stroke",C.ink); },
        ()=>g.select(".rim").attr("stroke","transparent"));
      V.onView(node,instant=>{
        if(instant)return;
        g.each(function(){ this.__dots.attr("r",0).transition().delay(i=>200+i*28).duration(320).ease(ease).attr("r",r); });
      });
    });
  })();
})();
