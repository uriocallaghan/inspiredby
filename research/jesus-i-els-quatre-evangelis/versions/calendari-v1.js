  /* ============ 1. Els dos calendaris (scrolly) ============ */
  (function(){
    const el=$("#temps"); if(!el)return;
    const G={vida:{c:C.vermell,t:"Vida de Jesús"},cartes:{c:C.blau,t:"Cartes de Pau"},escrits:{c:C.blauFosc,t:"Evangelis"},externes:{c:C.groc,t:"Fonts no cristianes"},canon:{c:C.ink2,t:"Cànon"}};
    const D=[
      {g:"vida",n:"Naixement",a:-6,b:-4,l:"≈ 6–4 aC",d:"Mateu el situa en vida d'Herodes el Gran, mort el 4 aC. L'any exacte no es coneix."},
      {g:"vida",n:"Joan bateja al Jordà",a:28,b:29,l:"≈ 28–29",d:"Lluc data la predicació de Joan el quinzè any de Tiberi."},
      {g:"vida",n:"Crucifixió",a:29,b:33,m:30,l:"≈ 30",d:"Execució romana sota Ponç Pilat. Ventall habitual: del 29 al 33."},
      {g:"cartes",n:"1 Tessalonicencs",a:48,b:51,l:"≈ 50",d:"El text cristià més antic que es conserva."},
      {g:"cartes",n:"Gàlates, Corintis, Filipencs, Filèmon, Romans",s:"Altres cartes de Pau",a:52,b:58,l:"anys 50",d:"Les altres cartes d'autoria àmpliament acceptada, a mitjan anys cinquanta."},
      {g:"escrits",n:"Destrucció del Temple",a:70,b:70,l:"70",d:"Els romans cremen el Temple de Jerusalem durant la guerra de Judea.",ev:1},
      {g:"escrits",n:"Marc",a:65,b:75,l:"≈ 65–75",d:"Es discuteix si s'escriu just abans o just després de la destrucció del Temple."},
      {g:"escrits",n:"Mateu",a:80,b:90,l:"≈ 80–90",d:"Fa servir Marc, segons la hipòtesi més acceptada."},
      {g:"escrits",n:"Lluc (i Fets)",s:"Lluc",a:80,b:100,l:"≈ 80–100",d:"Obra en dos volums amb els Fets dels Apòstols."},
      {g:"escrits",n:"Joan",a:90,b:110,l:"≈ 90–110",d:"Forma escrita conservada; pot haver tingut diverses etapes."},
      {g:"externes",n:"Josep, Antiguitats jueves",s:"Josep",a:93,b:94,l:"93–94",d:"Acabades el tretzè any de Domicià. Esmenta Jaume, «germà de Jesús, l'anomenat Crist»."},
      {g:"externes",n:"Tàcit, Annals",s:"Tàcit",a:105,b:120,l:"principi s. II",d:"Esmenta Crist, executat sota Tiberi per Pilat. Data aproximada."},
      {g:"canon",n:"Justí: «memòries dels apòstols»",s:"Justí",a:150,b:160,l:"mitjan s. II",d:"Explica que el diumenge es llegeixen les memòries dels apòstols, «que s'anomenen evangelis»."},
      {g:"canon",n:"Tacià, Diatèssaron",s:"Tacià",a:160,b:180,l:"2a meitat s. II",d:"Fon els quatre evangelis en una sola narració."},
      {g:"canon",n:"Ireneu: han de ser quatre",s:"Ireneu",a:178,b:182,l:"≈ 180",d:"Defensa que els evangelis són quatre, com els quatre vents."},
      {g:"canon",n:"Atanasi: 27 llibres",s:"Atanasi",a:367,b:367,l:"367",d:"Enumera els vint-i-set llibres del Nou Testament en una carta de Pasqua.",ev:1}
    ];
    const ORD=["vida","cartes","escrits","externes","canon","tot"];
    let state="vida", api=null;
    V.mount(el,(node,w)=>{
      const mob=w<640, rh=mob?19:27, gap=mob?8:14, top=30;
      const L=mob?0:150, R=w-(mob?6:10);
      let y=top; const groups=[];
      Object.keys(G).forEach(g=>{ groups.push({g,y}); D.filter(d=>d.g===g).forEach(d=>{ d.y=y; y+=rh; }); y+=gap; });
      const h=y+8;
      const s=V.svg(node,w,h,"Cronologia: la vida de Jesús (cap al 6 aC – cap al 30), les cartes de Pau (anys 50), els evangelis (del 65 al 110), Josep i Tàcit, i la formació del cànon fins al 367. Totes les dates són franges aproximades.");
      const xb=L+(R-L)*(mob?.78:.8);
      const x=d3.scaleLinear().domain([-10,120,380]).range([L,xb,R]).clamp(true);
      const ax=s.append("g");
      [-10,1,30,50,70,100].forEach(v=>{ ax.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",top-6).attr("y2",h-6).attr("stroke",C.grid);
        V.t(ax,x(v),top-12,v<0?`${-v} aC`:v===1?"1 dC":String(v),{size:11.5,anchor:"middle",fill:C.muted}); });
      [200,300].forEach(v=>{ ax.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",top-6).attr("y2",h-6).attr("stroke",C.grid); V.t(ax,x(v),top-12,String(v),{size:11.5,anchor:"middle",fill:C.muted}); });
      // ruptura d'escala
      const bk=ax.append("g").attr("transform",`translate(${xb+(x(130)-xb)/2},${top-12})`);
      bk.append("rect").attr("x",-5).attr("y",-6).attr("width",10).attr("height",h).attr("fill",C.paper);
      [-3,3].forEach(o=>bk.append("line").attr("x1",o-2).attr("x2",o+2).attr("y1",-2).attr("y2",8).attr("stroke",C.muted));
      // la creu
      const cr=s.append("g").attr("class","creu");
      cr.append("line").attr("x1",x(30)).attr("x2",x(30)).attr("y1",top-4).attr("y2",h-6).attr("stroke",C.vermell).attr("stroke-width",1).attr("stroke-dasharray","3 3");
      // a la vista final, un ram de línies surt de la creu cap a cada text: la distància en anys
      const tree=s.append("g").style("opacity",0), CR=D.find(d=>d.n==="Crucifixió");
      D.filter(d=>d.g!=="vida").forEach(d=>{ const x0=x(30), y0=CR.y+rh/2, x1=x(d.a)-2, y1=d.y+rh/2;
        d.br=tree.append("path").attr("d",`M${x0},${y0}C${x0},${(y0+y1)/2} ${x0+(x1-x0)*.25},${y1} ${x1},${y1}`).attr("fill","none").attr("stroke",V.alpha(C.vermell,.5)).attr("stroke-width",.9); });
      // grups
      const gl=s.append("g");
      if(!mob)groups.forEach(o=>V.t(gl,0,o.y+rh*.62,G[o.g].t,{size:12.5,italic:true,fill:C.ink2}));
      const rows=s.append("g").selectAll("g").data(D).join("g").attr("transform",d=>`translate(0,${d.y})`);
      rows.append("rect").attr("class","bar").attr("x",d=>x(d.a)-(d.ev?2:0)).attr("y",rh*.22).attr("height",rh*.56).attr("rx",1)
        .attr("width",d=>Math.max(d.ev?4:3,x(d.b)-x(d.a)+(d.ev?0:0))).attr("fill",d=>G[d.g].c);
      rows.filter(d=>d.m!=null).append("line").attr("x1",d=>x(d.m)).attr("x2",d=>x(d.m)).attr("y1",rh*.1).attr("y2",rh*.9).attr("stroke",C.ink).attr("stroke-width",1.5);
      rows.each(function(d){ const g=d3.select(this), name=mob?(d.s||d.n):d.n, lab=`${name} · ${d.l}`;
        const right=x(d.b)+6, wEst=lab.length*(mob?5.6:6.2);
        const anchor=right+wEst>R?"end":"start", xx=anchor==="end"?x(d.a)-6:right;
        d.lab=V.t(g,xx,rh*.68,lab,{size:mob?11.5:12.5,anchor,halo:true,fill:C.ink});
        const bw=d.lab.node().getComputedTextLength()||wEst;
        d.dist=V.t(g,anchor==="end"?xx-bw-8:xx+bw+8,rh*.68,"",{size:11.5,anchor,halo:true,fill:C.muted}); });
      const hit=s.append("rect").attr("x",0).attr("y",top-6).attr("width",w).attr("height",h-top).attr("fill","transparent").attr("class","hit");
      const guide=s.append("g").style("opacity",0);
      guide.append("line").attr("y1",top-6).attr("stroke",C.ink).attr("stroke-width",.8);
      const gtx=V.t(guide,0,top-12,"",{size:11.5,weight:700,anchor:"middle",halo:true});
      const tp=V.tip(node);
      let hov=null;
      function since(d){ const m=(d.a+d.b)/2; if(d.g==="vida")return ""; const k=Math.round(m-30); return `+${k} anys`; }
      function apply(dur){
        const st=ORD.indexOf(state);
        const vis=d=>state==="tot"||ORD.indexOf(d.g)<=st;
        const on=d=>hov?d===hov:(state==="tot"||d.g===state);
        rows.interrupt().transition().duration(dur).style("opacity",d=>!vis(d)?0:on(d)?1:.22);
        rows.select(".bar").attr("stroke",d=>hov===d?C.ink:null).attr("stroke-width",1.5);
        cr.transition().duration(dur).style("opacity",1);
        const tOn=state==="tot";
        if(tOn&&tree.style("opacity")==="0"&&!V.reduced){ tree.style("opacity",1); D.forEach(d=>{ if(!d.br)return; const L=d.br.node().getTotalLength(); d.br.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L).transition().delay(ORD.indexOf(d.g)*180).duration(900).ease(ease).attr("stroke-dashoffset",0); }); }
        else tree.transition().duration(dur).style("opacity",tOn?1:0);
        D.forEach(d=>{ if(d.br)d.br.attr("stroke",hov===d?C.vermell:V.alpha(C.vermell,hov?.15:.5)).attr("stroke-width",hov===d?1.8:.9); });
        D.forEach(d=>d.dist.text((state==="tot"&&!mob)||hov===d?since(d):""));
      }
      hit.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,hit.node());
        const st=ORD.indexOf(state); const cand=D.filter(d=>state==="tot"||ORD.indexOf(d.g)<=st);
        const d=d3.least(cand,d=>Math.abs(d.y+rh/2-my)); if(!d){return;}
        hov=d; apply(120);
        const mid=d.m!=null?d.m:(d.a+d.b)/2; guide.style("opacity",1).select("line").attr("x1",x(mid)).attr("x2",x(mid)).attr("y2",d.y+rh*.2);
        gtx.attr("x",x(mid)).text(d.l);
        tp.show(`<b>${d.n}</b><br>${d.l}${d.g!=="vida"?` · ${since(d)} després de la creu`:""}<br>${d.d}`,mx,d.y);
      }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ hov=null; guide.style("opacity",0); tp.hide(); apply(150) } outside(node,offH);
      api={set(k,first){ state=k; hov=null; guide.style("opacity",0); tp.hide(); apply(first?0:450);
        if(!first&&!V.reduced){ rows.filter(d=>d.g===k).select(".bar").attr("width",0).transition().duration(900).ease(ease).attr("width",d=>Math.max(d.ev?4:3,x(d.b)-x(d.a))); } }};
      api.set(state,true);
    });
    const sc=$("#s-temps");
    IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(i,step)=>{ state=step.dataset.s; if(api)api.set(state); });
  })();

