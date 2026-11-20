/* «Jesús i els quatre evangelis» · visualitzacions orgàniques (mapes a mapes.js)
   Inspirades directament en les 11 referències de l'editor (núvols de punts, topografia de densitat,
   bombolles translúcides multiply, anells concèntrics, corrents trenats i roses polars concèntriques).
   V0 (#intro-viz): 64.298 paraules en 4 núvols topogràfics (Building Strategy + Fair and square?).
   V1 (#temps): Scrollytelling cronològic amb 5 blocs, bombolles translúcides (Major quakes) i boira oral.
   V2 (#biblio): Eixam orgànic de 887 punts que volen en arc (Ordre Bíblia – Escriptura).
   V6 (#setmana): Els 233 episodis de Marc i els 1.162 dels 4 evangelis (Incendios en Perú + Major quakes).
   V7a (#flux): Corrents trenats fins amb partícules en canvas (Iceberg alley + LINK-03).
   V7b (#corda): Topografia orgànica de densitat de tots els 1.162 fragments d'Eusebi (Building Strategy).
   V8 (#flors): Quatre roses polars sobre 10 anells concèntrics (Typology demand + Parcs nacionals). */
(function(){
  if(!window.d3||!window.IBV||!window.EVG)return;
  const V=IBV, C=V.C, E=window.EVG;
  const B=["Mc","Mt","Lc","Jn"], NOM={Mt:"Mateu",Mc:"Marc",Lc:"Lluc",Jn:"Joan"};
  const COL={Mc:C.vermell,Mt:C.blau,Lc:C.blauClar,Jn:C.groc};
  const f0=V.fmt(",.0f");
  const $=s=>document.querySelector(s);
  const OUTS=new Map();
  document.addEventListener("pointerdown",ev=>{ OUTS.forEach((fn,n)=>{ if(n.isConnected&&!n.contains(ev.target))fn(); }); },true);
  const outside=(node,fn)=>OUTS.set(node,fn);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=d3.easeCubicInOut;

  function seg(fig,cb){
    const bs=[...fig.querySelectorAll(".seg button")];
    bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(x=>x.setAttribute("aria-pressed",String(x===b))); cb(b.dataset.k); }));
  }
  function lg(el,items){
    if(!el)return;
    el.innerHTML=items.map(i=>`<span class="lgi"><i class="${i.k||""}" style="${i.k==="ln"||i.k==="da"||i.k==="ho"?"border-color":"background"}:${i.c}"></i>${i.t}</span>`).join("");
  }
  function layerCS(node,w,h,label){
    d3.select(node).selectAll("svg.ibv").remove();
    const {ctx,c}=V.canvas(node,w,h,label);
    const s=d3.select(node).append("svg").attr("class","ibv").attr("width",w).attr("height",h)
      .style("position","absolute").style("left",0).style("top",0).style("overflow","visible").attr("aria-hidden","true");
    return {ctx,c,s};
  }

  // càlcul exacte d'Eusebi (paraules per cànon, excloent cànon 0 = final llarg de Marc)
  const EUS={};
  ["Mt","Mc","Lc","Jn"].forEach(b=>{
    const secs=E.eus.secs[b].filter(s=>s[1]>0);
    const byC={}; let tot=0;
    secs.forEach(s=>{ const w=s[4]-s[3]; byC[s[1]]=(byC[s[1]]||0)+w; tot+=w; });
    const uniq=byC[10]||0;
    EUS[b]={tot,uniq,shared:tot-uniq,uniqPct:uniq/tot*100,sharedPct:(tot-uniq)/tot*100,byC,secs};
  });

  /* =====================================================================
     V0 · UNA SOLA VIDA, QUATRE LLIBRES: 64.298 PARAULES (#intro-viz)
     Tires d'unitats reals (1 traç = 100 paraules gregues SBLGNT), ordenades
     cronològicament i dividides entre material compartit i exclusiu (Eusebi).
     ===================================================================== */
  (function(){
    const el=$("#intro-viz"), rd=$("#intro-r"); if(!el)return;
    const EV=[
      {k:"Mc",n:"Marc",yr:"≈ 65–75",dt:"+40 anys",w:E.gnt.total.Mc,sh:EUS.Mc.shared,un:EUS.Mc.uniq,u:Math.round(EUS.Mc.uniqPct),c:C.vermell,
        det:"El més breu i antic (11.085 paraules). El 94 % del text reapareix a Mateu o Lluc; només un 6 % és exclusiu seu."},
      {k:"Mt",n:"Mateu",yr:"≈ 80–90",dt:"+55 anys",w:E.gnt.total.Mt,sh:EUS.Mt.shared,un:EUS.Mt.uniq,u:Math.round(EUS.Mt.uniqPct),c:C.blau,
        det:"18.329 paraules. Aprofita gairebé tot Marc i hi afegeix un 24 % de material propi, com els mags, Egipte i el Sermó de la Muntanya."},
      {k:"Lc",n:"Lluc",yr:"≈ 80–100",dt:"+58 anys",w:E.gnt.total.Lc,sh:EUS.Lc.shared,un:EUS.Lc.uniq,u:Math.round(EUS.Lc.uniqPct),c:C.blauClar,
        det:"El més llarg (19.446 paraules). Un 34 % és exclusiu: els pastors, el bon samarità, el fill pròdig i els deixebles d'Emmaús."},
      {k:"Jn",n:"Joan",yr:"≈ 90–110",dt:"+70 anys",w:E.gnt.total.Jn,sh:EUS.Jn.shared,un:EUS.Jn.uniq,u:Math.round(EUS.Jn.uniqPct),c:C.groc,
        det:"15.438 paraules i una veu pròpia: el 76 % del text (tres quartes parts) no surt a cap dels altres tres evangelis."}
    ];
    const MAX_U=Math.round(d3.max(EV,d=>d.w)/100); // 194 unitats (Lluc)
    lg($("#intro-lg"),[
      {c:"#D6D2CB",t:"Material compartit amb altres evangelis",k:"sq"},
      {c:C.vermell,t:"Propi de Marc",k:"sq"},
      {c:C.blau,t:"Propi de Mateu",k:"sq"},
      {c:C.blauClar,t:"Propi de Lluc",k:"sq"},
      {c:C.groc,t:"Propi de Joan",k:"sq"}
    ]);

    V.mount(el,(node,w)=>{
      const mob=w<600;
      const m={t:mob?14:18,r:mob?10:116,b:34,l:mob?8:150};
      const bw=Math.max(120,w-m.l-m.r);
      const jesusH=mob?46:42, rowH=mob?60:62, barH=mob?20:24;
      const h=m.t+jesusH+EV.length*rowH+m.b;
      const s=V.svg(node,w,h,"Comparativa de les 64.298 paraules gregues dels quatre evangelis (1 traç = 100 paraules) enfront de les 0 paraules escrites per Jesús de Natzaret, separant el material compartit del material exclusiu de cada llibre.");
      const g=s.append("g");

      const x=d3.scaleLinear([0,MAX_U],[m.l,m.l+bw]);
      const step=bw/MAX_U;

      // eix inferior net en paraules
      const axY=m.t+jesusH+EV.length*rowH+6;
      const ticks=mob?[0,50,100,150,194]:[0,50,100,150,194];
      ticks.forEach(u=>{
        const xx=x(u);
        g.append("line").attr("x1",xx).attr("x2",xx).attr("y1",m.t+jesusH-6).attr("y2",axY-4)
          .attr("stroke",u===0?C.ink2:C.grid).attr("stroke-width",u===0?1:.7).attr("stroke-dasharray",u===0?null:"2 3");
        const lbl=u===0?"0":u===194?"19.446":f0(u*100);
        if(!mob||u!==194) V.t(g,xx,axY+12,lbl,{anchor:u===0?"start":u===194?"end":"middle",size:11,fill:C.muted});
      });
      V.t(g,m.l+bw,axY+26,"paraules gregues (SBLGNT)",{anchor:"end",size:11,fill:C.muted});

      // fila 0: Jesús (0 paraules escrites) — el buit que ho explica tot
      const jy=m.t+14;
      if(mob){
        V.t(g,m.l,jy,"Jesús",{anchor:"start",serif:true,weight:600,size:15,fill:C.ink});
        V.t(g,m.l+46,jy,"≈ 6 aC – ≈ 30 dC",{anchor:"start",size:11,fill:C.muted});
        g.append("circle").attr("cx",m.l+4).attr("cy",jy+17).attr("r",4).attr("fill",C.vermell);
        g.append("line").attr("x1",m.l+12).attr("x2",m.l+140).attr("y1",jy+17).attr("y2",jy+17)
          .attr("stroke",C.vermell).attr("stroke-width",.8).attr("stroke-dasharray","2 4").attr("stroke-opacity",.55);
        V.t(g,m.l+16,jy+13,"0 paraules escrites",{anchor:"start",size:11.5,weight:600,fill:C.vermell});
      } else {
        V.t(g,m.l-12,jy+1,"Jesús",{anchor:"end",serif:true,weight:600,size:16,fill:C.ink});
        V.t(g,m.l-12,jy+15,"≈ 6 aC – ≈ 30 dC",{anchor:"end",size:11,fill:C.muted});
        g.append("circle").attr("cx",m.l).attr("cy",jy+2).attr("r",4).attr("fill",C.vermell);
        g.append("line").attr("x1",m.l+8).attr("x2",m.l+220).attr("y1",jy+2).attr("y2",jy+2)
          .attr("stroke",C.vermell).attr("stroke-width",.8).attr("stroke-dasharray","2 4").attr("stroke-opacity",.55);
        V.t(g,m.l+12,jy-4,"0 paraules escrites",{anchor:"start",size:12,weight:600,fill:C.vermell});
      }
      g.append("line").attr("x1",0).attr("x2",w).attr("y1",m.t+jesusH-4).attr("y2",m.t+jesusH-4)
        .attr("stroke",C.hair).attr("stroke-width",.8);

      // files dels 4 evangelis (1 traç vertical fi = 100 paraules)
      const rows=g.append("g").selectAll("g.evr").data(EV).join("g").attr("class","evr").style("cursor","pointer");
      const gapW=Math.max(.55,step*.26), tickW=Math.max(1.05,step-gapW);

      rows.each(function(d,i){
        const rg=d3.select(this);
        const y0=mob?(m.t+jesusH+i*rowH+26):(m.t+jesusH+i*rowH+(rowH-barH)/2);
        const nTot=Math.round(d.w/100);
        const nUn=Math.max(1,Math.round(nTot*d.u/100));
        const nSh=nTot-nUn;

        // etiqueta (a sobre de la fila en mòbil, a l'esquerra en desktop)
        if(mob){
          V.t(rg,m.l,y0-8,`${d.n} `, {anchor:"start",serif:true,weight:600,size:15,fill:C.ink});
          V.t(rg,m.l+54,y0-8,d.yr,{anchor:"start",size:11,fill:C.muted});
          V.t(rg,w-m.r,y0-8,`${f0(d.w)} · ${d.u} % propi`,{anchor:"end",size:11,weight:600,fill:d.k==="Jn"?C.ink2:d.c});
        } else {
          V.t(rg,m.l-12,y0+barH/2-1,d.n,{anchor:"end",serif:true,weight:600,size:17,fill:C.ink});
          V.t(rg,m.l-12,y0+barH/2+13,d.yr,{anchor:"end",size:11,fill:C.muted});
        }

        // fons de hit invisible per a tota la fila
        rg.append("rect").attr("x",0).attr("y",mob?y0-22:y0-10).attr("width",w).attr("height",mob?rowH:barH+20).attr("fill","transparent");

        // traços unitaris (1 traç = 100 paraules): esquerra compartit, dreta exclusiu
        const bg=rg.append("g").attr("class","bars");
        for(let k=0;k<nTot;k++){
          const isUn=k>=nSh;
          bg.append("rect")
            .attr("class",isUn?"u-un":"u-sh")
            .attr("x",x(k)).attr("y",y0)
            .attr("width",tickW).attr("height",barH)
            .attr("rx",.4)
            .attr("fill",isUn?d.c:"#D6D2CB");
        }

        // separador fi entre compartit i exclusiu
        if(nSh>0&&nUn>0){
          rg.append("line").attr("x1",x(nSh)-gapW/2).attr("x2",x(nSh)-gapW/2).attr("y1",y0-3).attr("y2",y0+barH+3)
            .attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-opacity",.45);
        }

        // anotació directa de % propi al costat en desktop
        if(!mob){
          const xEnd=x(nTot)+8;
          V.t(rg,xEnd,y0+barH/2-1,`${f0(d.w)}`,{anchor:"start",size:13,weight:700,fill:C.ink});
          V.t(rg,xEnd,y0+barH/2+13,`${d.u} % propi`,{anchor:"start",size:11,weight:600,fill:d.k==="Jn"?C.ink2:d.c});
        }
      });

      // animació d'entrada neta (escombrat d'esquerra a dreta)
      V.onView(node,instant=>{
        if(instant)return;
        rows.each(function(d,i){
          const rects=d3.select(this).selectAll("g.bars rect");
          rects.attr("opacity",0).transition().delay((q,k)=>i*90+k*2.4).duration(240).attr("opacity",1);
        });
      });

      const defMsg="<b>D'un cop d'ull:</b> <b>Marc</b>, <b>Mateu</b> i <b>Lluc</b> comparteixen la major part del relat (gris), mentre que <b>Joan</b> és un 76 % exclusiu (groc).";
      if(rd) rd.innerHTML=defMsg;

      let cur=null;
      const reset=()=>{
        cur=null;
        rows.transition().duration(140).style("opacity",1);
        if(rd) rd.innerHTML=defMsg;
      };
      outside(node,reset);
      V.hover(s.node(),(ev,[px,py])=>{
        const idx=Math.floor((py-(m.t+jesusH))/rowH);
        if(idx<0||idx>=EV.length){ if(cur)reset(); return; }
        const d=EV[idx];
        if(cur===d)return;
        cur=d;
        rows.transition().duration(140).style("opacity",q=>q===d?1:.5);
        if(rd) rd.innerHTML=`<b>${d.n} (${d.yr} · ${d.dt}):</b> ${d.det}`;
      },reset);
    });
  })();

  /* =====================================================================
     V1 · LES ONES DEL TEMPS (Scrollytelling: Major quakes + boira oral)
     5 blocs clarament separats, bombolles translúcides (àrea = paraules reals)
     ===================================================================== */
  (function(){
    const el=$("#temps"); if(!el)return;
    const G={
      vida:{c:C.vermell,t:"Vida de Jesús"},
      cartes:{c:C.blauClar,t:"Cartes de Pau"},
      escrits:{c:C.blau,t:"Els quatre evangelis"},
      externes:{c:C.grocFosc,t:"Referències externes (jueva i romana)"},
      canon:{c:C.ink2,t:"Selecció dels 4 llibres"}
    };
    const D=[
      {g:"vida",n:"Naixement",a:-6,b:-4,m:-5,w:900,l:"≈ 6–4 aC",d:"En vida d'Herodes el Gran (mort el 4 aC). L'any exacte no es coneix."},
      {g:"vida",n:"Baptisme al Jordà",a:28,b:29,m:28.5,w:900,l:"≈ 28–29",d:"Predicació de Joan Baptista el quinzè any de Tiberi (Lluc 3,1)."},
      {g:"vida",n:"Crucifixió a Jerusalem",a:29,b:33,m:30,w:4200,l:"≈ 30",d:"Execució romana sota Ponç Pilat. Referència 0 de tot el gràfic.",key:1},
      {g:"cartes",n:"1 Tessalonicencs (Pau)",s:"1 Tessalonicencs",a:48,b:51,m:50,w:1473,l:"≈ 50",d:"El text cristià més antic conservat (1.473 paraules): uns 20 anys després de la creu."},
      {g:"cartes",n:"Corintis, Gàlates, Romans…",s:"Altres cartes de Pau",a:52,b:58,m:55,w:22526,l:"anys 50",d:"Les altres sis cartes autèntiques de Pau (~22.500 paraules). Ja esmenten el sopar i la creu."},
      {g:"escrits",n:"Evangeli de Marc",s:"Marc",a:65,b:75,m:70,w:11085,l:"≈ 65–75",d:"Primer evangeli (11.085 paraules), pels volts de la destrucció del Temple (any 70)."},
      {g:"escrits",n:"Evangeli de Mateu",s:"Mateu",a:80,b:90,m:85,w:18329,l:"≈ 80–90",d:"18.329 paraules. Aprofita Marc i afegeix el relat de Betlem i grans discursos."},
      {g:"escrits",n:"Evangeli de Lluc",s:"Lluc",a:80,b:100,m:88,w:19446,l:"≈ 80–100",d:"El més llarg (19.446 paraules), primer volum junt amb els Fets dels Apòstols."},
      {g:"escrits",n:"Evangeli de Joan",s:"Joan",a:90,b:110,m:98,w:15438,l:"≈ 90–110",d:"15.438 paraules. El més tardà i diferent: tres quartes parts no surten als altres tres."},
      {g:"externes",n:"Flavi Josep (historiador jueu)",s:"Flavi Josep (jueu)",a:93,b:94,m:93.5,w:700,l:"93–94",d:"Esmenta Jaume, «germà de Jesús, l'anomenat Crist»."},
      {g:"externes",n:"Tàcit (historiador romà)",s:"Tàcit (romà)",a:105,b:120,m:112,w:700,l:"s. II",d:"Esmenta Crist, executat sota Tiberi per ordre de Pilat."},
      {g:"canon",n:"Ireneu defensa que són quatre",s:"Ireneu",a:178,b:182,m:180,w:800,l:"≈ 180",d:"Compara els quatre evangelis amb els quatre vents."},
      {g:"canon",n:"Atanasi fixa els 27 llibres",s:"Atanasi",a:367,b:367,m:367,w:800,l:"367",d:"Primera llista exacta del Nou Testament actual."}
    ];
    const STEP_GROUPS={
      vida:["vida"], oral:["vida"], cartes:["vida","cartes"],
      escrits:["vida","cartes","escrits"], externes:["vida","cartes","escrits","externes"],
      canon:["vida","cartes","escrits","externes","canon"]
    };
    const MOB_LABELS={
      vida:new Set(["Naixement","Crucifixió a Jerusalem"]),
      oral:new Set(["Crucifixió a Jerusalem"]),
      cartes:new Set(["1 Tessalonicencs (Pau)"]),
      escrits:new Set(["Evangeli de Marc","Evangeli de Joan"]),
      externes:new Set(["Flavi Josep (historiador jueu)","Tàcit (historiador romà)"]),
      canon:new Set(["Ireneu defensa que són quatre","Atanasi fixa els 27 llibres"])
    };
    lg($("#temps-lg"),Object.values(G).map(g=>({c:g.c===C.grocFosc?C.groc:g.c,t:g.t})));
    let state="vida", api=null;

    V.mount(el,(node,w)=>{
      const mob=w<600, rh=mob?11:29, hdrH=mob?12:20, gap=mob?4:15, top=mob?20:28;
      const L=mob?0:166, R=w-(mob?8:18);
      let y=top; const groups=[];
      Object.keys(G).forEach((g,gi)=>{
        const divY=gi>0?y-(mob?2:6):null, hy=y+(mob?9:11); y+=hdrH;
        D.filter(d=>d.g===g).forEach(d=>{ d.y=y+(mob?5.5:6); y+=rh; });
        groups.push({g,divY,hy}); y+=gap;
      });
      const h=y+(mob?10:24);
      const {ctx,s}=layerCS(node,w,h,"Cronologia orgànica en cinc blocs ancorada a la crucifixió (≈ 30 dC), amb boira de punts de memòria oral i bombolles proporcionals a l'extensió de cada text.");
      const split=L+(R-L)*.78;
      const x=yr=>yr<=120?L+(yr+10)/130*(split-L):split+(yr-120)/260*(R-split);
      const rSc=d3.scaleSqrt([0,24000],[mob?2.4:3.5,mob?6.5:24]);

      // eix superior net (estil «Major quakes»)
      const ticks=[-10,0,30,50,70,90,110,180,367];
      ticks.forEach(t=>{
        const xx=x(t);
        s.append("line").attr("x1",xx).attr("y1",mob?16:20).attr("x2",xx).attr("y2",h-(mob?14:22))
          .attr("stroke",t===30?C.vermell:C.grid).attr("stroke-width",t===30?1:.55)
          .attr("stroke-opacity",t===30?.65:.7);
        if(mob&&(t===-10||t===90||t===180))return;
        V.t(s,xx,mob?12:14,t<0?Math.abs(t)+" aC":t===0?"0":t===30?"0 · ≈30 dC":String(t),{anchor:mob&&t===367?"end":"middle",size:11,fill:t===30?C.vermell:C.muted,weight:t===30?700:400});
      });
      const sx=x(120);
      s.append("line").attr("x1",sx-3).attr("y1",mob?16:20).attr("x2",sx+3).attr("y2",h-(mob?14:22)).attr("stroke",C.hair).attr("stroke-dasharray","2 3");
      if(!mob) V.t(s,sx+6,h-8,"escala comprimida →",{size:11,fill:C.muted});

      // boira orgànica de memòria oral en canvas (1.100 punts diminuts d'1 px, més densos prop del 30 dC)
      const rng=V.rng(30), ox0=x(30), ox1=x(72);
      const mist=d3.range(mob?420:1100).map(()=>{
        const u=Math.pow(rng(),1.35);
        return {x:ox0+u*(ox1-ox0), y:(mob?18:24)+rng()*(h-(mob?34:50)), r:.8+rng()*.55, ph:rng()*6.28, sp:.25+rng()*.35, a:.22*(1-u*.65)};
      });
      function drawMist(t){
        ctx.clearRect(0,0,w,h);
        const mult=state==="vida"?.08:state==="oral"?1.15:.48;
        for(const p of mist){
          const dx=V.reduced?0:Math.sin(t*.00028*p.sp+p.ph)*2.8;
          ctx.fillStyle=V.alpha(C.vermell,p.a*mult);
          ctx.beginPath(); ctx.arc(p.x+dx,p.y,p.r,0,6.283); ctx.fill();
        }
      }
      drawMist(0);
      V.loop(node,(t)=>{ if(state==="oral"||state==="cartes"||state==="escrits")drawMist(t); });

      const gOralLab=s.append("g").attr("pointer-events","none");
      V.lines(gOralLab,(ox0+ox1)/2,top+(mob?62:88),[["Memòria oral",true,C.vermell],["20–40 anys de boca en boca",false,C.ink2]],{anchor:"middle",size:mob?11:11.5,halo:3.5});

      const g70=s.append("g");
      g70.append("line").attr("x1",x(70)).attr("y1",mob?16:20).attr("x2",x(70)).attr("y2",h-(mob?14:22)).attr("stroke",C.ink2).attr("stroke-width",.8).attr("stroke-dasharray","2 3");
      V.t(g70,x(70)+4,h-(mob?4:8),mob?"70 · Temple":"70 · Destrucció del Temple",{size:11,fill:C.ink2,halo:2.5});

      // separadors i capçaleres dels 5 blocs
      const gHdrs=s.selectAll("g.ghdr").data(groups).join("g").attr("class","ghdr");
      gHdrs.each(function(gr){
        const g=d3.select(this), meta=G[gr.g];
        if(gr.divY!=null) g.append("line").attr("x1",0).attr("y1",gr.divY).attr("x2",R).attr("y2",gr.divY).attr("stroke",C.hair).attr("stroke-width",.7);
        g.append("circle").attr("cx",5).attr("cy",gr.hy-3.5).attr("r",mob?3:3.8).attr("fill",meta.c===C.grocFosc?C.groc:meta.c);
        V.t(g,13,gr.hy,meta.t,{size:mob?11:12,weight:700,fill:C.ink,halo:3});
      });

      // files: fil finíssim + bombolla translúcida (àrea = paraules) + bigoti del marge de dates
      const rows=s.selectAll("g.trow").data(D).join("g").attr("class","trow").style("cursor","pointer");
      rows.each(function(d){
        const g=d3.select(this), col=G[d.g].c, x1=x(d.a), x2=x(d.b), xm=x(d.m), cy=d.y, rad=rSc(d.w);
        g.append("line").attr("x1",L).attr("y1",cy).attr("x2",R).attr("y2",cy).attr("stroke",C.grid).attr("stroke-width",.5);
        if(!mob) V.t(g,L-10,cy+4,d.s||d.n,{anchor:"end",size:12,fill:C.ink2,weight:d.g==="escrits"||d.g==="vida"?600:400});
        // bigoti del marge de dates
        if(x2-x1>2){
          g.append("line").attr("x1",x1).attr("y1",cy).attr("x2",x2).attr("y2",cy).attr("stroke",col).attr("stroke-width",1.4).attr("stroke-opacity",.65);
        }
        // bombolla translúcida (estil «Major quakes»)
        g.append("circle").attr("class","bub").attr("cx",xm).attr("cy",cy).attr("r",rad)
          .attr("fill",d.g==="externes"?C.groc:col).attr("fill-opacity",d.g==="externes"?.42:.2)
          .attr("stroke",col).attr("stroke-width",.8).attr("stroke-opacity",.75)
          .style("mix-blend-mode","multiply");
        g.append("circle").attr("cx",xm).attr("cy",cy).attr("r",d.key?2.8:1.8).attr("fill",col);
        const lx=Math.max(x2,xm+rad)+(mob?5:7), short=mob?(d.s||d.n)+" · "+d.l:d.l;
        const forceStart=mob&&d.n.startsWith("Tàcit");
        const anc=forceStart?"start":(lx>w-(mob?98:74)?"end":"start");
        const tx=anc==="end"?Math.min(x1,xm-rad)-(mob?5:7):lx;
        V.t(g,tx,cy+3.5,short,{anchor:anc,size:11,fill:C.ink,halo:3}).attr("class","tlab");
      });

      const gHv=s.append("g").attr("pointer-events","none"), tp=V.tip(node);
      function apply(st,anim){
        state=st; const allow=new Set(STEP_GROUPS[st]||STEP_GROUPS.canon), dur=anim&&!V.reduced?450:0;
        const mLab=MOB_LABELS[st]||MOB_LABELS.canon;
        rows.transition().duration(dur).style("opacity",d=>allow.has(d.g)?1:.2);
        if(mob) rows.selectAll(".tlab").transition().duration(dur).style("opacity",d=>mLab.has(d.n)?1:0);
        gHdrs.transition().duration(dur).style("opacity",gr=>allow.has(gr.g)?1:.42);
        gOralLab.transition().duration(dur).style("opacity",st==="oral"?1:0);
        g70.transition().duration(dur).style("opacity",st==="escrits"||st==="externes"||st==="canon"?1:.15);
        drawMist(0);
      }

      const off=()=>{ gHv.selectAll("*").remove(); tp.hide(); apply(state,false); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const d=d3.least(D,q=>Math.abs(py-q.y));
        if(!d||Math.abs(py-d.y)>(mob?16:rh*.75)){ off(); return; }
        rows.style("opacity",q=>q===d?1:.48);
        if(mob) rows.selectAll(".tlab").style("opacity",q=>q===d?1:0);
        const xm=x(d.m), diff=Math.round(d.m-30);
        gHv.selectAll("*").remove();
        gHv.append("line").attr("x1",xm).attr("y1",mob?16:20).attr("x2",xm).attr("y2",h-(mob?14:22)).attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","2 2");
        gHv.append("circle").attr("cx",xm).attr("cy",d.y).attr("r",rSc(d.w)+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.3);
        const delta=diff>0?`+${diff} anys després de la creu`:diff<0?`${Math.abs(diff)} anys abans de la creu`:"Referència 0 (≈ 30 dC)";
        V.t(gHv,xm,h-(mob?4:8),delta,{anchor:xm>w-110?"end":xm<110?"start":"middle",size:11.5,weight:700,fill:C.ink,halo:3.5});
        tp.show(`<b>${d.n}</b> (${d.l})<br>${d.d}`);
      },off);

      api={go:st=>apply(st,true)};
      apply(state,false);
      V.onView(node,instant=>{
        if(instant)return;
        rows.selectAll("circle.bub").attr("r",0).transition().delay((d,i)=>i*35).duration(750).ease(d3.easeCubicOut).attr("r",d=>rSc(d.w));
      });
    });

    const sc=$("#s-temps");
    if(sc&&window.IB&&IB.scrolly) IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(idx,el)=>{ if(api&&el&&el.dataset.s)api.go(el.dataset.s); });
  })();

  /* =====================================================================
     V2 · POLS DE PARAULES: ORDRE DE LA BÍBLIA – ESCRIPTURA (Eixam orgànic)
     ===================================================================== */
  (function(){
    const fig=$("#f-biblio"), el=$("#biblio"), rd=$("#biblio-r"); if(!el)return;
    const BOOKS=[
      {k:"Mt",n:"Mateu",g:"ev",w:18329,bib:1,chr:9,yr:"≈ 80–90",c:C.blau},
      {k:"Mc",n:"Marc",g:"ev",w:11085,bib:2,chr:8,yr:"≈ 65–75",c:C.vermell},
      {k:"Lc",n:"Lluc",g:"ev",w:19446,bib:3,chr:10,yr:"≈ 80–100",c:C.blauClar},
      {k:"Jn",n:"Joan",g:"ev",w:15438,bib:4,chr:11,yr:"≈ 90–110",c:C.grocFosc},
      {k:"Rm",n:"Romans",g:"pau",w:7055,bib:5,chr:7,yr:"≈ 57",c:C.ink2},
      {k:"1Co",n:"1 Corintis",g:"pau",w:6812,bib:6,chr:3,yr:"≈ 54",c:C.ink2},
      {k:"2Co",n:"2 Corintis",g:"pau",w:4473,bib:7,chr:4,yr:"≈ 55",c:C.ink2},
      {k:"Ga",n:"Gàlates",g:"pau",w:2226,bib:8,chr:2,yr:"≈ 53",c:C.ink2},
      {k:"Fl",n:"Filipencs",g:"pau",w:1626,bib:9,chr:5,yr:"≈ 55",c:C.ink2},
      {k:"1Te",n:"1 Tessalonicencs",g:"pau",w:1473,bib:10,chr:1,yr:"≈ 50",c:C.ink2},
      {k:"Flm",n:"Filèmon",g:"pau",w:334,bib:11,chr:6,yr:"≈ 55",c:C.ink2}
    ];
    const rng=V.rng(51), UNITS=[];
    BOOKS.forEach(b=>{
      const n=Math.max(4,Math.round(b.w/100)); b.nU=n;
      for(let i=0;i<n;i++){
        // distribució orgànica en cinta gaussiana (mai graella rígida d'Excel!)
        const u=(i+.5)/n, jy=V.gauss(rng)*3.4, jx=V.gauss(rng)*2.2;
        UNITS.push({id:b.k+"-"+i,b,i,u,jx,jy,r:1.5+rng()*.9});
      }
    });
    let mode="biblia", updateMode=null;
    lg($("#biblio-lg"),[{c:C.ink2,t:"Cartes de Pau (anys 50)"},{c:C.vermell,t:"Marc (1r evangeli)"},{c:C.blau,t:"Mateu i Lluc"},{c:C.groc,t:"Joan (últim)"}]);

    V.mount(el,(node,w)=>{
      const mob=w<600, rowH=mob?42:32, top=mob?44:38, left=mob?8:142, right=mob?8:84;
      const maxLen=w-left-right-12, h=top+BOOKS.length*rowH+16;
      const {ctx,s}=layerCS(node,w,h,"Eixam orgànic de 887 punts (1 punt = 100 paraules gregues) que volen en arc entre l'ordre de la Bíblia i l'ordre cronològic real.");
      

      const posOf=(d,m)=>{
        const row=(m==="biblia"?d.b.bib:d.b.chr)-1;
        const len=Math.max(12,(d.b.w/19446)*maxLen);
        return [left+d.u*len+d.jx, top+row*rowH+(mob?10:0)+clamp(d.jy,mob?-5:-8,mob?5:8)];
      };
      // estat d'animació en canvas per a 887 punts a 60 fps
      UNITS.forEach(d=>{ const p=posOf(d,mode); d.x=p[0]; d.y=p[1]; d.x0=p[0]; d.y0=p[1]; d.x1=p[0]; d.y1=p[1]; });

      // fils base + etiquetes en SVG
      const gGuides=s.append("g"), gLabels=s.append("g"), gNote=s.append("g");
      BOOKS.forEach((_,i)=>gGuides.append("line").attr("x1",left).attr("x2",w-right).attr("y1",top+i*rowH+(mob?10:0)).attr("y2",top+i*rowH+(mob?10:0)).attr("stroke",C.grid).attr("stroke-width",.55));
      const labs=gLabels.selectAll("g.blab").data(BOOKS,d=>d.k).join("g").attr("class","blab").style("cursor","pointer");
      if(mob){
        labs.append("text").attr("x",left).attr("y",-4).attr("text-anchor","start").attr("font-size",11.5)
          .attr("font-weight",d=>d.g==="ev"?700:500).attr("fill",d=>d.k==="Mc"?C.vermell:C.ink).text(d=>d.n);
        labs.append("text").attr("x",w-right).attr("y",-4).attr("text-anchor","end").attr("font-size",11).attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(d=>d.yr);
      } else {
        labs.append("text").attr("x",left-10).attr("y",4).attr("text-anchor","end").attr("font-size",12.5)
          .attr("font-weight",d=>d.g==="ev"?700:500).attr("fill",d=>d.k==="Mc"?C.vermell:C.ink).text(d=>d.n);
        labs.append("text").attr("x",w-4).attr("y",4).attr("text-anchor","end").attr("font-size",11).attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(d=>d.yr);
      }

      let hovB=null, raf=0;
      function renderDots(){
        ctx.clearRect(0,0,w,h);
        for(const d of UNITS){
          const a=hovB==null?(d.b.k==="Jn"?.72:.46):(hovB===d.b?.9:.24);
          ctx.fillStyle=V.alpha(d.b.k==="Jn"?C.grocFosc:d.b.c,a);
          ctx.beginPath(); ctx.arc(d.x,d.y,mob?d.r*.82:d.r,0,6.283); ctx.fill();
        }
      }

      function place(m,anim){
        mode=m;
        const dur=anim&&!V.reduced?920:0;
        labs.transition().duration(dur).ease(ease).attr("transform",d=>`translate(0,${top+((m==="biblia"?d.bib:d.chr)-1)*rowH})`);
        UNITS.forEach(d=>{ d.x0=d.x; d.y0=d.y; const p=posOf(d,m); d.x1=p[0]; d.y1=p[1]; });
        cancelAnimationFrame(raf);
        if(!dur){ UNITS.forEach(d=>{ d.x=d.x1; d.y=d.y1; }); renderDots(); }
        else {
          const t0=performance.now();
          const tick=now=>{
            const k=clamp((now-t0)/dur,0,1);
            for(const d of UNITS){
              const tk=clamp((k-d.u*.16)/.84,0,1), ek=ease(tk), iu=1-ek;
              const mx=(d.x0+d.x1)/2+(d.y1>d.y0?34:-34), my=(d.y0+d.y1)/2;
              d.x=iu*iu*d.x0+2*iu*ek*mx+ek*ek*d.x1;
              d.y=iu*iu*d.y0+2*iu*ek*my+ek*ek*d.y1;
            }
            renderDots();
            if(k<1)raf=requestAnimationFrame(tick);
          };
          raf=requestAnimationFrame(tick);
        }
        gNote.selectAll("*").remove();
        V.t(gNote,left,14,m==="biblia"?(mob?"Ordre a la Bíblia (Mateu 1r)":"Ordre tradicional a la Bíblia (Mateu primer)"):(mob?"Ordre d'escriptura (Pau abans)":"Ordre real d'escriptura (les cartes de Pau arriben 20 anys abans que els evangelis)"),
          {size:mob?11.5:12.5,weight:700,fill:m==="biblia"?C.ink2:C.vermell});
        if(rd) rd.innerHTML=m==="biblia"
          ?"<b>Ordre de la Bíblia:</b> els quatre evangelis obren el Nou Testament (Mateu primer) i les cartes de Pau venen molt després."
          :"<b>Ordre cronològic real:</b> les cartes de Pau (anys 50) són les primeres; <b>Marc</b> (~65–75) és el primer evangeli i <b>Joan</b> (~90–110) tanca el cercle.";
      }

      const off=()=>{ hovB=null; labs.style("opacity",1); renderDots(); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const row=Math.round((py-top)/rowH);
        const b=BOOKS.find(q=>(mode==="biblia"?q.bib:q.chr)-1===row);
        if(!b||Math.abs(py-(top+row*rowH))>rowH*.55){ off(); return; }
        hovB=b; labs.style("opacity",d=>d===b?1:.5); renderDots();
        if(rd) rd.innerHTML=`<b>${b.n}</b> (${b.yr}) · <b>${f0(b.w)} paraules gregues</b> · Posició a la Bíblia #${b.bib}, ordre d'escriptura #${b.chr}.`;
      },off);

      updateMode=m=>place(m,true);
      place(mode,false);
    });
    seg(fig,k=>{ mode=k; updateMode&&updateMode(k); });
  })();

  /* =====================================================================
     V6 · ELS 233 EPISODIS DE MARC + ELS 1.162 DELS 4 EVANGELIS
     (Incendios en Perú + Major quakes: zero barres apilades!)
     ===================================================================== */
  (function(){
    const fig=$("#f-setmana"), el=$("#setmana"), rd=$("#setmana-r"); if(!el)return;
    let view="zoom", redraw=null;

    V.mount(el,(node,w)=>{
      const mob=w<640;

      function renderMark(){
        const h=mob?260:290, M={l:mob?16:30,r:mob?16:30};
        const s=V.svg(node,w,h,"Tots els 233 episodis reals de Marc com a cercles translúcids sobre un fil del temps: la calma de Galilea (capítols 1–10) explota en vermell a l'última setmana a Jerusalem (36 % del llibre).");
        const secs=EUS.Mc.secs, tot=E.gnt.total.Mc, cut=7117; // Mc 11,1 entrada a Jerusalem
        const x=d3.scaleLinear([0,tot],[M.l,w-M.r]);
        const rSc=d3.scaleSqrt([0,420],[2.2,mob?24:36]);
        const cy=mob?138:152;

        // fil base finíssim + frontera de l'última setmana
        s.append("line").attr("x1",M.l).attr("x2",w-M.r).attr("y1",cy).attr("y2",cy).attr("stroke",C.hair).attr("stroke-width",.7);
        s.append("line").attr("x1",x(cut)).attr("x2",x(cut)).attr("y1",32).attr("y2",h-36).attr("stroke",C.vermell).attr("stroke-width",1).attr("stroke-dasharray","3 3");
        V.t(s,M.l,24,mob?"Galilea · 64 % (cap. 1–10)":"Baptisme i anys a Galilea · 64 % del llibre (capítols 1–10)",{size:mob?11:12,fill:C.ink2,weight:600});
        V.t(s,w-M.r,24,mob?"1 setmana · 36 % (cap. 11–16)":"Una sola setmana a Jerusalem · 36 % (capítols 11–16)",{anchor:"end",size:mob?11:12,fill:C.vermell,weight:700});

        // tots els 233 episodis reals (àrea = paraules gregues, estil «Incendios en Perú» + «Major quakes»)
        const data=secs.map(d=>({num:d[0],can:d[1],ref:d[2],a:d[3],b:d[4],w:d[4]-d[3],mid:(d[3]+d[4])/2,pw:d[3]>=cut}));
        const bubs=s.append("g").selectAll("circle").data(data.slice().sort((a,b)=>b.w-a.w)).join("circle")
          .attr("cx",d=>x(d.mid)).attr("cy",cy).attr("r",d=>rSc(d.w))
          .attr("fill",d=>d.pw?C.vermell:C.blau).attr("fill-opacity",d=>d.pw?.28:.2)
          .attr("stroke",d=>d.pw?C.vermell:C.blau).attr("stroke-width",.55).attr("stroke-opacity",.55)
          .style("mix-blend-mode","multiply").style("cursor","pointer");

        // anotacions corbes estil Reuters als pics clau
        if(!mob){
          const pkGal=d3.greatest(data.filter(d=>!d.pw),d=>d.w);
          const pkPas=d3.greatest(data.filter(d=>d.pw),d=>d.w);
          if(pkGal) V.note(s,{x:x(pkGal.mid),y:cy-rSc(pkGal.w)-2,tx:x(pkGal.mid)-36,ty:56,kind:"curve",bend:-12,anchor:"end",
            lines:[[`Mc ${pkGal.ref}`,true],[`${pkGal.w} paraules (episodi llarg a Galilea)`]],size:11.5});
          if(pkPas) V.note(s,{x:x(pkPas.mid),y:cy-rSc(pkPas.w)-2,tx:x(pkPas.mid)-58,ty:56,kind:"curve",bend:-14,anchor:"end",
            lines:[[`Última setmana · Mc ${pkPas.ref}`,true,C.vermell],[`${pkPas.w} paraules · la càmera s'alenteix`]],size:11.5});
        }
        // fites inferiors
        [{p:127,t:"Baptisme"},{p:5125,t:"«Ets el Messies»"},{p:7117,t:"Entrada Jerusalem"},{p:10565,t:"Crucifixió"}].forEach((m,i)=>{
          if(mob&&i===1)return;
          const xx=x(m.p);
          s.append("line").attr("x1",xx).attr("x2",xx).attr("y1",cy+4).attr("y2",h-26).attr("stroke",C.grid).attr("stroke-width",.6);
          V.t(s,xx,h-12,m.t,{anchor:i===0?"start":i===3?"end":"middle",size:11,fill:i>=2?C.vermell:C.muted,weight:i>=2?600:400});
        });

        // llegenda de mida estil «Incendios en Perú»
        const lgEl=$("#setmana-lg"); if(lgEl){ lgEl.innerHTML=""; V.legendSize(lgEl,{title:"Paraules per episodi",values:[50,200,400],r:rSc,f:f0}); }

        const gHv=s.append("g").attr("pointer-events","none");
        const off=()=>{ bubs.style("opacity",1); gHv.selectAll("*").remove(); };
        outside(node,off);
        V.hover(s.node(),(ev,[px])=>{
          const d=d3.least(data,q=>Math.abs(x(q.mid)-px));
          if(!d||Math.abs(x(d.mid)-px)>28){ off(); return; }
          bubs.style("opacity",q=>q===d?1:.48);
          gHv.selectAll("*").remove();
          const cx0=x(d.mid), rr=rSc(d.w);
          gHv.append("circle").attr("cx",cx0).attr("cy",cy).attr("r",rr+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
          const lbl=`Mc ${d.ref} · ${d.w} par.`;
          const pillW=lbl.length*6.8+16, px0=clamp(cx0,M.l+pillW/2,w-M.r-pillW/2), py0=Math.max(42,cy-rr-22);
          gHv.append("rect").attr("x",px0-pillW/2).attr("y",py0-11).attr("width",pillW).attr("height",20).attr("rx",3).attr("fill",d.pw?C.vermell:C.ink);
          V.t(gHv,px0,py0+3,lbl,{anchor:"middle",size:11.5,weight:700,fill:C.paper});
          if(rd) rd.innerHTML=`<b>Marc ${d.ref}</b> (secció ${d.num} de 233): <b>${d.w} paraules</b> — ${d.pw?"dins l'última setmana a Jerusalem (36 % del llibre)":"abans d'arribar a Jerusalem"}.`;
        },off);

        V.onView(node,instant=>{ if(instant)return; bubs.attr("r",0).transition().delay((d,i)=>i*2).duration(700).ease(d3.easeCubicOut).attr("r",d=>rSc(d.w)); });
        if(rd) rd.innerHTML="<b>Tots els 233 episodis de Marc:</b> cada cercle és una secció real. Passa el cursor per veure com la narració s'alenteix de cop en entrar a Jerusalem (en vermell).";
      }

      function renderAll4(){
        const h=mob?385:430, M={t:mob?58:54,r:mob?16:36,b:38,l:mob?52:74};
        const s=V.svg(node,w,h,"Tots els 1.162 episodis reals dels quatre evangelis dibuixats com quatre files de bombolles translúcides, amb arcs connectant setze episodis clau.");
        const books=["Mc","Mt","Lc","Jn"];
        const y=d3.scalePoint(books,[M.t+22,h-M.b-14]).padding(.18);
        const x=d3.scaleLinear([0,1],[M.l,w-M.r]);
        const rSc=d3.scaleSqrt([0,480],[1.6,mob?13:18]);

        // busca la posició real exacta en paraules gregues dins les seccions d'Eusebi
        function secAt(b,tc,tv){
          let last=null;
          for(const sec of EUS[b].secs){
            const m=sec[2].match(/^(\d+),(\d+)/); if(!m)continue;
            const c=+m[1], v=+m[2];
            if(c>tc||(c===tc&&v>tv)) return last||sec;
            last=sec;
            if(c===tc&&v===tv) return sec;
          }
          return last;
        }
        const baseMap=new Map(E.gnt.escenes.map(e=>[e.nom,e]));
        const extraDefs=[
          ["Guarició del paralític",{Mc:[2,1],Mt:[9,1],Lc:[5,17]}],
          ["Paràbola del sembrador",{Mc:[4,1],Mt:[13,1],Lc:[8,4]}],
          ["Tempesta calmada",{Mc:[4,35],Mt:[8,23],Lc:[8,22]}],
          ["Transfiguració",{Mc:[9,2],Mt:[17,1],Lc:[9,28]}],
          ["Unció d'una dona",{Mc:[14,3],Mt:[26,6],Lc:[7,36],Jn:[12,1]}],
          ["Negació de Pere",{Mc:[14,66],Mt:[26,69],Lc:[22,54],Jn:[18,15]}],
          ["Davant Ponç Pilat",{Mc:[15,1],Mt:[27,1],Lc:[23,1],Jn:[18,28]}]
        ];
        const extras=extraDefs.map(([nom,refs])=>{
          const pos={}, ref={};
          Object.keys(refs).forEach(b=>{
            const [c,v]=refs[b], sec=secAt(b,c,v);
            pos[b]=sec?sec[3]:0; ref[b]=`${c},${v}`;
          });
          return {nom,pos,ref};
        });
        const order=[
          "Baptisme","Guarició del paralític","Paràbola del sembrador","Tempesta calmada",
          "Pa per a cinc mil","Pere: «Ets el Messies»","Transfiguració","Entrada a Jerusalem",
          "Gest al Temple","Unció d'una dona","Darrer sopar","Detenció",
          "Negació de Pere","Davant Ponç Pilat","Crucifixió","Tomba oberta"
        ];
        const byNom=new Map([...baseMap,...extras.map(e=>[e.nom,e])]);
        const esc=order.map(n=>byNom.get(n)).filter(Boolean).map(d=>{
          const bs=books.filter(b=>d.pos[b]!=null);
          return {...d,books:bs,all4:bs.length===4,isT:d.nom==="Gest al Temple",isU:d.nom==="Unció d'una dona"};
        });

        // 4 files de bombolles (totes les 1.162 seccions reals!)
        books.forEach(b=>{
          const yy=y(b), tot=E.gnt.total[b], col=b==="Jn"?C.grocFosc:b==="Mc"?C.vermell:C.blau;
          s.append("line").attr("x1",x(0)).attr("y1",yy).attr("x2",x(1)).attr("y2",yy).attr("stroke",C.grid).attr("stroke-width",.6);
          V.t(s,M.l-10,yy+4,NOM[b],{anchor:"end",weight:700,size:12.5,fill:C.ink});
          EUS[b].secs.forEach(d=>{
            const pw=(d[3]+d[4])/2/tot, ww=d[4]-d[3];
            s.append("circle").attr("cx",x(pw)).attr("cy",yy).attr("r",rSc(ww))
              .attr("fill",b==="Jn"?C.groc:col).attr("fill-opacity",.15).style("mix-blend-mode","multiply").attr("pointer-events","none");
          });
        });
        [0,.25,.5,.75,1].forEach(p=>V.t(s,x(p),14,p===0?"Inici":p===1?"Final":Math.round(p*100)+" %",{anchor:"middle",size:11,fill:C.muted}));

        // arcs d'episodis compartits (16 episodis: 12 als quatre evangelis, 4 només als sinòptics)
        const line=d3.line().x(d=>x(d.p)).y(d=>y(d.b)).curve(d3.curveMonotoneY);
        const colOf=d=>d.isT?C.vermell:d.isU?C.blau:C.ink2;
        const baseOp=d=>d.isT?1:d.isU?.82:d.all4?.42:.34;
        const baseW=d=>d.isT?2.2:d.isU?1.7:1.05;

        const gArc=s.append("g"), gDot=s.append("g"), gAnn=s.append("g"), gHv=s.append("g").attr("pointer-events","none");
        const paths=gArc.selectAll("path.es").data(esc).join("path").attr("class","es")
          .attr("d",d=>line(d.books.map(b=>({b,p:d.pos[b]/E.gnt.total[b]}))))
          .attr("fill","none").attr("stroke",colOf)
          .attr("stroke-width",baseW).attr("stroke-opacity",baseOp)
          .attr("stroke-dasharray",d=>d.all4?null:"3 3")
          .style("cursor","pointer");

        const dots=gDot.selectAll("g.ed").data(esc).join("g").attr("class","ed").style("cursor","pointer");
        dots.each(function(d){
          const g=d3.select(this), col=d.isT?C.vermell:d.isU?C.blau:C.ink;
          d.books.forEach(b=>g.append("circle").attr("cx",x(d.pos[b]/E.gnt.total[b])).attr("cy",y(b)).attr("r",d.isT?4.2:d.isU?3.6:2.6)
            .attr("fill",col).attr("stroke",C.paper).attr("stroke-width",1.1));
        });

        // anotacions fixes mínimes (s'apaguen suaument en fer hover per no tapar mai l'episodi seleccionat)
        if(!mob){
          const t=esc.find(d=>d.isT), u=esc.find(d=>d.isU), bap=esc.find(d=>d.nom==="Baptisme"), cru=esc.find(d=>d.nom==="Crucifixió");
          if(bap) V.t(gAnn,x(bap.pos.Mc/E.gnt.total.Mc),y("Mc")-16,"Baptisme",{anchor:"start",size:11,fill:C.ink2,halo:2.5});
          if(cru) V.t(gAnn,x(cru.pos.Jn/E.gnt.total.Jn),y("Jn")+22,"Crucifixió",{anchor:"middle",size:11,fill:C.ink2,halo:2.5});
          if(t){
            V.t(gAnn,x(t.pos.Jn/E.gnt.total.Jn),y("Jn")+22,"Gest al Temple",{anchor:"start",size:11,weight:700,fill:C.vermell,halo:2.5});
            V.note(gAnn,{x:x(t.pos.Jn/E.gnt.total.Jn)+8,y:y("Jn")-6,tx:x(.27),ty:y("Lc")+22,kind:"curve",bend:-10,anchor:"start",
              lines:[["Gest al Temple",true,C.vermell],["Al 7 % de Joan; al final als altres tres"]],size:11.5});
          }
          if(u){
            V.note(gAnn,{x:x(u.pos.Lc/E.gnt.total.Lc),y:y("Lc")-8,tx:x(.20),ty:y("Mt")+18,kind:"curve",bend:10,anchor:"end",
              lines:[["Unció d'una dona",true,C.blau],["Al 29 % de Lluc; al final a Marc i Mateu"]],size:11});
          }
        }

        // mostregem punts al llarg de cada corba per poder fer hover còmodament sobre tota la línia, no només als 4 punts
        const samples=[];
        paths.each(function(d){
          const L=this.getTotalLength(), N=24;
          for(let i=0;i<=N;i++){ const pt=this.getPointAtLength(L*i/N); samples.push({d,x:pt.x,y:pt.y}); }
        });

        let cur=null;
        const defMsg="<b>Setze episodis clau sobre els 1.162 passatges reals:</b> passa el cursor per qualsevol línia o punt per veure el nom de l'episodi i on cau exactament a cada evangeli.";
        const off=()=>{
          cur=null;
          paths.attr("stroke-opacity",baseOp).attr("stroke-width",baseW);
          dots.style("opacity",1);
          gAnn.style("opacity",1);
          gHv.selectAll("*").remove();
          if(rd) rd.innerHTML=defMsg;
        };
        outside(node,off);

        V.hover(s.node(),(ev,[px,py])=>{
          let best=null, bd=1e9;
          for(const sp of samples){
            const dist=Math.hypot(px-sp.x,py-sp.y);
            if(dist<bd){ bd=dist; best=sp.d; }
          }
          if(!best||bd>22){ if(cur)off(); return; }
          if(cur===best)return;
          cur=best;

          const col=best.isT?C.vermell:best.isU?C.blau:C.ink;
          paths.attr("stroke-opacity",d=>d===best?1:.22).attr("stroke-width",d=>d===best?2.8:1);
          paths.filter(d=>d===best).raise();
          dots.style("opacity",d=>d===best?1:.42);
          gAnn.style("opacity",.2);
          gHv.selectAll("*").remove();

          // píndola clara amb el nom de l'episodi separada dels tics superiors
          const topX=x(best.pos.Mc/E.gnt.total.Mc);
          const tag=best.all4?best.nom:`${best.nom} · només sinòptics`;
          const pillW=tag.length*6.6+18, pillX=clamp(topX,M.l+pillW/2,w-M.r-pillW/2), pillY=34;
          gHv.append("line").attr("x1",topX).attr("x2",topX).attr("y1",pillY+10).attr("y2",y("Mc")-6)
            .attr("stroke",col).attr("stroke-width",1.1).attr("stroke-dasharray","2 2");
          gHv.append("rect").attr("x",pillX-pillW/2).attr("y",pillY-11).attr("width",pillW).attr("height",21).attr("rx",3)
            .attr("fill",col);
          V.t(gHv,pillX,pillY+3.5,tag,{anchor:"middle",size:12,weight:700,fill:C.paper});

          // punts ressaltats + etiqueta directa «% · cap,v» al costat de CADA evangeli
          best.books.forEach(b=>{
            const bx=x(best.pos[b]/E.gnt.total[b]), by=y(b), pct=Math.round(best.pos[b]/E.gnt.total[b]*100);
            gHv.append("circle").attr("cx",bx).attr("cy",by).attr("r",6.5).attr("fill",C.paper).attr("stroke",col).attr("stroke-width",2);
            gHv.append("circle").attr("cx",bx).attr("cy",by).attr("r",3).attr("fill",col);
            const right=bx<w-M.r-(mob?78:95);
            const txt=mob?`${pct} %`:`${pct} % · ${best.ref[b]}`;
            V.t(gHv,bx+(right?11:-11),by+4,txt,{anchor:right?"start":"end",size:11.5,weight:700,fill:col,halo:3.5});
          });
          if(!best.all4){
            const lx=x(best.pos.Lc/E.gnt.total.Lc);
            V.t(gHv,clamp(lx,M.l+45,w-M.r-45),y("Jn")+4,"absent a Joan",{anchor:"middle",size:11,italic:true,fill:C.muted,halo:3});
          }

          const det=best.books.map(b=>`${NOM[b]} ${Math.round(best.pos[b]/E.gnt.total[b]*100)} % (${best.ref[b]})`).join(" · ");
          if(rd) rd.innerHTML=`<b>${best.nom}${best.all4?"":" (només als sinòptics)"}:</b> ${det}`;
        },off);

        lg($("#setmana-lg"),[
          {c:C.vermell,t:"Gest al Temple (gran salt a Joan)",k:"ln"},
          {c:C.blau,t:"Unció d'una dona (gran salt a Lluc)",k:"ln"},
          {c:C.ink2,t:"Als 4 evangelis",k:"ln"},
          {c:C.ink2,t:"Només als 3 sinòptics",k:"da"}
        ]);
        if(rd) rd.innerHTML=defMsg;
      }

      redraw=()=>{ node.innerHTML=""; if(view==="zoom")renderMark(); else renderAll4(); };
      redraw();
    });
    seg(fig,k=>{ view=k; redraw&&redraw(); });
  })();

  /* =====================================================================
     V7a · CORRENTS TRENATS DE PARAULES (Iceberg alley + LINK-03 en canvas)
     ===================================================================== */
  (function(){
    const fig=$("#f-flux"), el=$("#flux"), rd=$("#flux-r"), tog=$("#flux-toggle"); if(!el)return;
    let hyp="q", paused=V.reduced, activeIdx=-1, rebuild=null;
    if(tog) tog.textContent=paused?"Reprodueix el moviment":"Atura el moviment";

    const LINKS_Q=[
      {s:0,t:0,w:EUS.Mt.byC[1]+EUS.Mt.byC[2]+EUS.Mt.byC[4]+EUS.Mt.byC[6],c:C.vermell,n:"De Marc cap a Mateu",ex:"Relat base: baptisme, Galilea, passió (~9.500 paraules)"},
      {s:0,t:1,w:EUS.Lc.byC[1]+EUS.Lc.byC[2]+EUS.Lc.byC[8],c:C.vermell,n:"De Marc cap a Lluc",ex:"Relat base: Galilea, paràboles, passió (~8.260 paraules)"},
      {s:1,t:0,w:EUS.Mt.byC[5],c:C.blau,n:"De Font Q cap a Mateu",ex:"Dites de Jesús: parenostre, benaurances (~3.650 paraules)"},
      {s:1,t:1,w:EUS.Lc.byC[5],c:C.blau,n:"De Font Q cap a Lluc",ex:"Mateixes dites que Mateu, absents de Marc (~3.770 paraules)"},
      {s:2,t:0,w:EUS.Mt.uniq+EUS.Mt.byC[3]+EUS.Mt.byC[7],c:C.ink2,n:"Material propi de Mateu",ex:"Mags, fugida a Egipte, Sermó de la Muntanya (~5.150 paraules)"},
      {s:2,t:1,w:EUS.Lc.uniq+EUS.Lc.byC[3]+EUS.Lc.byC[9],c:C.ink2,n:"Material propi de Lluc",ex:"Pastors, bon samarità, fill pròdig (~7.410 paraules)"},
      {s:2,t:2,w:EUS.Jn.tot,c:C.grocFosc,n:"Tradició pròpia de Joan",ex:"76 % exclusiu: Canà, samaritana, Llàtzer (~15.420 paraules)"}
    ];
    const LINKS_F=[
      {s:0,t:0,w:EUS.Mt.byC[1]+EUS.Mt.byC[2]+EUS.Mt.byC[4]+EUS.Mt.byC[6],c:C.vermell,n:"De Marc cap a Mateu",ex:"Mateu fa servir gairebé tot Marc (~9.500 paraules)"},
      {s:0,t:1,w:EUS.Lc.byC[1]+EUS.Lc.byC[2]+EUS.Lc.byC[8],c:C.vermell,n:"De Marc cap a Lluc",ex:"Lluc també pren l'esquelet de Marc (~8.260 paraules)"},
      {s:1,t:1,w:EUS.Lc.byC[5],c:C.blau,n:"De Mateu cap a Lluc (sense Q)",ex:"Lluc llegeix directament Mateu: parenostre, benaurances (~3.770 paraules)"},
      {s:2,t:0,w:EUS.Mt.uniq+EUS.Mt.byC[5],c:C.ink2,n:"Fonts pròpies de Mateu",ex:"Material que Mateu escriu primer (~8.130 paraules)"},
      {s:2,t:1,w:EUS.Lc.uniq+EUS.Lc.byC[3]+EUS.Lc.byC[9],c:C.ink2,n:"Material propi de Lluc",ex:"Pastors, bon samarità, fill pròdig (~7.410 paraules)"},
      {s:2,t:2,w:EUS.Jn.tot,c:C.grocFosc,n:"Tradició pròpia de Joan",ex:"76 % exclusiu: Canà, samaritana, Llàtzer (~15.420 paraules)"}
    ];
    lg($("#flux-lg"),[{c:C.vermell,t:"De Marc (1r evangeli)",k:"ln"},{c:C.blau,t:"Compartit Mateu–Lluc (Q o Mateu)",k:"ln"},{c:C.grocFosc,t:"Joan (camí propi)",k:"ln"},{c:C.ink2,t:"Fonts pròpies",k:"ln"}]);

    V.mount(el,(node,w)=>{
      const vert=w<600, mob=w<640, h=vert?456:380;
      const {ctx,s}=layerCS(node,w,h,"Corrents trenats de partícules que mostren com el material de Marc i d'altres fonts nodreix Mateu, Lluc i Joan.");
      const r=V.rng(40);
      let links=[], particles=[];

      function layout(){
        s.selectAll("*").remove();
        const raw=hyp==="q"?LINKS_Q:LINKS_F;
        const srcNames=hyp==="q"?["Marc (1r)","Font Q (?)","Fonts pròpies"]:["Marc (1r)","Mateu (llegit)","Fonts pròpies"];
        const dstNames=["Mateu","Lluc","Joan"];
        const srcCol=[C.vermell,C.blau,C.ink2], dstCol=[C.blau,C.blauClar,C.grocFosc];

        const sTot=[0,0,0], dTot=[0,0,0];
        raw.forEach(l=>{ sTot[l.s]+=l.w; dTot[l.t]+=l.w; });

        if(vert){
          // TRANSPOSICIÓ VERTICAL (dalt → baix) a mòbil (< 600 px)
          const padX=10, gapX=14, y0=54, y1=h-40;
          const avail=w-padX*2-gapX*2;
          const scS=avail/d3.sum(sTot), scD=avail/d3.sum(dTot);
          let x=padX;
          const nodesT=sTot.map((v,i)=>{ const bw=Math.max(24,v*scS), o={i,n:srcNames[i],x0:x,x1:x+bw,cur:x,c:srcCol[i]}; x+=bw+gapX; return o; });
          x=padX;
          const nodesB=dTot.map((v,i)=>{ const bw=Math.max(24,v*scD), o={i,n:dstNames[i],x0:x,x1:x+bw,cur:x,c:dstCol[i]}; x+=bw+gapX; return o; });

          const my=(y0+y1)/2;
          links=raw.map((l,idx)=>{
            const sNode=nodesT[l.s], dNode=nodesB[l.t];
            const sw=(l.w/sTot[l.s])*(sNode.x1-sNode.x0);
            const dw=(l.w/dTot[l.t])*(dNode.x1-dNode.x0);
            const sx0=sNode.cur, sx1=sx0+sw; sNode.cur=sx1;
            const tx0=dNode.cur, tx1=tx0+dw; dNode.cur=tx1;
            const pathD=`M${sx0},${y0} C${sx0},${my} ${tx0},${my} ${tx0},${y1} L${tx1},${y1} C${tx1},${my} ${sx1},${my} ${sx1},${y0} Z`;
            return {...l,idx,vert:true,th:Math.max(sw,dw),y0,y1,sx0,sx1,tx0,tx1,pathD};
          });

          const gThreads=s.append("g");
          links.forEach(l=>{
            const nStr=Math.max(3,Math.min(14,Math.round(l.th/5)));
            for(let k=0;k<nStr;k++){
              const u=(k+.5)/nStr, sx=l.sx0+(l.sx1-l.sx0)*u, tx=l.tx0+(l.tx1-l.tx0)*u;
              gThreads.append("path").datum(l).attr("class","ft")
                .attr("d",`M${sx},${l.y0} C${sx},${my} ${tx},${my} ${tx},${l.y1}`)
                .attr("fill","none").attr("stroke",l.c).attr("stroke-width",.6).attr("stroke-opacity",.3);
            }
            gThreads.append("path").datum(l).attr("class","fhit").attr("d",l.pathD)
              .attr("fill",V.alpha(l.c,.04)).style("cursor","pointer");
          });

          // nodes superiors (fonts)
          V.t(s,padX,14,"Fonts d'origen ↓",{anchor:"start",size:11,fill:C.muted});
          nodesT.forEach((n,i)=>{
            s.append("line").attr("x1",n.x0+2).attr("x2",n.x1-2).attr("y1",y0).attr("y2",y0).attr("stroke",n.c).attr("stroke-width",3).attr("stroke-linecap","round");
            const anc=i===0?"start":i===2?"end":"middle";
            const tx=i===0?n.x0:i===2?n.x1:(n.x0+n.x1)/2;
            V.t(s,tx,y0-12,n.n,{anchor:anc,weight:700,size:11.5,fill:C.ink});
          });
          // nodes inferiors (evangelis)
          nodesB.forEach((n,i)=>{
            s.append("line").attr("x1",n.x0+2).attr("x2",n.x1-2).attr("y1",y1).attr("y2",y1).attr("stroke",n.c).attr("stroke-width",3).attr("stroke-linecap","round");
            const anc=i===0?"start":i===2?"end":"middle";
            const tx=i===0?n.x0:i===2?n.x1:(n.x0+n.x1)/2;
            V.t(s,tx,y1+18,n.n,{anchor:anc,weight:700,size:12,fill:C.ink});
          });
          V.t(s,padX,h-6,"Evangelis resultants",{anchor:"start",size:11,fill:C.muted});
        } else {
          const padL=mob?92:152, padR=mob?82:136, x0=padL, x1=w-padR;
          const scale=(h-64)/Math.max(d3.sum(sTot),d3.sum(dTot));
          let y=24; const nodesL=sTot.map((v,i)=>{ const bh=Math.max(22,v*scale), o={i,n:srcNames[i],y0:y,y1:y+bh,cur:y,c:srcCol[i]}; y+=bh+18; return o; });
          y=24; const nodesR=dTot.map((v,i)=>{ const bh=Math.max(22,v*scale), o={i,n:dstNames[i],y0:y,y1:y+bh,cur:y,c:dstCol[i]}; y+=bh+18; return o; });

          links=raw.map((l,idx)=>{
            const th=Math.max(6,l.w*scale);
            const sy0=nodesL[l.s].cur, sy1=sy0+th; nodesL[l.s].cur=sy1;
            const ty0=nodesR[l.t].cur, ty1=ty0+th; nodesR[l.t].cur=ty1;
            const mx=(x0+x1)/2;
            const pathD=`M${x0},${sy0} C${mx},${sy0} ${mx},${ty0} ${x1},${ty0} L${x1},${ty1} C${mx},${ty1} ${mx},${sy1} ${x0},${sy1} Z`;
            return {...l,idx,vert:false,th,x0,x1,sy0,sy1,ty0,ty1,pathD};
          });

          // fils trenats ultra-fins (estil «Iceberg alley») dins cada corrent + àrea de hover invisible
          const gThreads=s.append("g");
          links.forEach(l=>{
            const nStr=Math.max(3,Math.min(14,Math.round(l.th/4)));
            const mx=(l.x0+l.x1)/2;
            for(let k=0;k<nStr;k++){
              const u=(k+.5)/nStr, sy=l.sy0+(l.sy1-l.sy0)*u, ty=l.ty0+(l.ty1-l.ty0)*u;
              gThreads.append("path").datum(l).attr("class","ft")
                .attr("d",`M${l.x0},${sy} C${mx},${sy} ${mx},${ty} ${l.x1},${ty}`)
                .attr("fill","none").attr("stroke",l.c).attr("stroke-width",.55).attr("stroke-opacity",.28);
            }
            gThreads.append("path").datum(l).attr("class","fhit").attr("d",l.pathD)
              .attr("fill",V.alpha(l.c,.03)).style("cursor","pointer");
          });

          // nodes en anells/cercles fins a esquerra i dreta
          nodesL.forEach(n=>{
            const cy=(n.y0+n.y1)/2;
            s.append("line").attr("x1",x0).attr("x2",x0).attr("y1",n.y0+2).attr("y2",n.y1-2).attr("stroke",n.c).attr("stroke-width",2.4).attr("stroke-linecap","round");
            V.t(s,x0-10,cy+4,n.n,{anchor:"end",weight:700,size:13,fill:C.ink});
          });
          nodesR.forEach(n=>{
            const cy=(n.y0+n.y1)/2;
            s.append("line").attr("x1",x1).attr("x2",x1).attr("y1",n.y0+2).attr("y2",n.y1-2).attr("stroke",n.c).attr("stroke-width",2.4).attr("stroke-linecap","round");
            V.t(s,x1+10,cy+4,n.n,{anchor:"start",weight:700,size:13,fill:C.ink});
          });
        }

        particles=[];
        links.forEach(l=>{
          const nP=Math.max(14,Math.min(72,Math.round(l.w/280)));
          for(let k=0;k<nP;k++) particles.push({l,t:r(),v:.025+r()*.018,off:.08+r()*.84,sz:1.1+r()*.8});
        });
        if(rd) rd.innerHTML=hyp==="q"
          ?"<b>Hipòtesi 1 (Marc + Font Q):</b> Mateu i Lluc treballen per separat, però tots dos tenen Marc i una col·lecció perduda de dites (Q) damunt la taula."
          :"<b>Hipòtesi 2 (Sense Q):</b> no cal imaginar cap document perdut; Lluc simplement va llegir tant Marc com Mateu abans d'escriure el seu evangeli.";
      }

      function drawParticles(dt){
        ctx.clearRect(0,0,w,h);
        const stepT=paused?0:Math.min(.05,dt*.001);
        for(const p of particles){
          p.t=(p.t+p.v*stepT)%1;
          const l=p.l, u=p.t, iu=1-u;
          let px, py;
          if(l.vert){
            const my=(l.y0+l.y1)/2, sx=l.sx0+(l.sx1-l.sx0)*p.off, tx=l.tx0+(l.tx1-l.tx0)*p.off;
            px=iu*iu*iu*sx+3*iu*iu*u*sx+3*iu*u*u*tx+u*u*u*tx;
            py=iu*iu*iu*l.y0+3*iu*iu*u*my+3*iu*u*u*my+u*u*u*l.y1;
          } else {
            const mx=(l.x0+l.x1)/2, sy=l.sy0+(l.sy1-l.sy0)*p.off, ty=l.ty0+(l.ty1-l.ty0)*p.off;
            px=iu*iu*iu*l.x0+3*iu*iu*u*mx+3*iu*u*u*mx+u*u*u*l.x1;
            py=iu*iu*iu*sy+3*iu*iu*u*sy+3*iu*u*u*ty+u*u*u*ty;
          }
          const dim=activeIdx>=0&&l.idx!==activeIdx;
          ctx.fillStyle=V.alpha(l.c,dim?.26:.72);
          ctx.beginPath(); ctx.arc(px,py,dim?1.1:p.sz,0,6.283); ctx.fill();
        }
      }

      const off=()=>{ activeIdx=-1; s.selectAll(".ft").attr("stroke-opacity",.28).attr("stroke-width",.55); drawParticles(0); };
      outside(node,off);
      V.hover(s.node(),(ev)=>{
        const hit=ev.target&&ev.target.__data__;
        if(!hit||hit.idx==null){ off(); return; }
        activeIdx=hit.idx;
        s.selectAll(".ft").attr("stroke-opacity",d=>d.idx===activeIdx?.65:.14).attr("stroke-width",d=>d.idx===activeIdx?.9:.5);
        if(rd) rd.innerHTML=`<b>${hit.n}:</b> ${hit.ex}.`;
      },off);

      rebuild=layout; layout(); drawParticles(0);
      V.loop(node,(t,dt)=>drawParticles(dt));
    });
    seg(fig,k=>{ hyp=k; rebuild&&rebuild(); });
    if(tog) tog.addEventListener("click",()=>{ paused=!paused; tog.textContent=paused?"Reprodueix el moviment":"Atura el moviment"; });
  })();

  /* =====================================================================
     V7b · TOPOGRAFIA ORGÀNICA DELS 1.162 FRAGMENTS D'EUSEBI (#corda)
     (Directament inspirada en «Building Strategy» i «Fair and square?»)
     ===================================================================== */
  (function(){
    const el=$("#corda"), rd=$("#corda-r"); if(!el)return;
    // definició dels 10 cànons d'Eusebi -> quins evangelis comparteixen cada passatge
    const CAN_MEM={1:["Mc","Mt","Lc","Jn"],2:["Mc","Mt","Lc"],3:["Mt","Lc","Jn"],4:["Mc","Mt","Jn"],5:["Mt","Lc"],6:["Mc","Mt"],7:["Mt","Jn"],8:["Mc","Lc"],9:["Lc","Jn"]};
    const ISLANDS=[
      {k:"syn",n:"Gran pont sinòptic (Marc + Mateu + Lluc)",c:C.vermell,match:d=>d.can===2||d.can===6||d.can===8,
        ex:"Relat compartit per Marc, Mateu i Lluc: baptisme, miracles de Galilea, paràboles i passió."},
      {k:"q",n:"Illa de la Font Q (només Mateu + Lluc)",c:C.blau,match:d=>d.can===5,
        ex:"Dites de Jesús absents de Marc: el parenostre, les benaurances, l'estimar els enemics."},
      {k:"all4",n:"Nucli comú als quatre evangelis",c:C.ink,match:d=>d.can===1||d.can===3||d.can===4,
        ex:"Els moments que narren tots quatre: pa per a cinc mil, entrada a Jerusalem, crucifixió i tomba oberta."},
      {k:"jn",n:"Arxipèlag exclusiu de Joan (76 % del llibre)",c:C.grocFosc,match:d=>d.b==="Jn"&&(d.can===10||d.can===7||d.can===9),
        ex:"Casament de Canà, la dona samaritana, resurrecció de Llàtzer i llargs discursos del «Jo soc»."},
      {k:"mt",n:"Halo exclusiu de Mateu (24 %)",c:C.blau,match:d=>d.b==="Mt"&&d.can===10,
        ex:"Mags d'Orient, fugida a Egipte, gran part del Sermó de la Muntanya."},
      {k:"lc",n:"Halo exclusiu de Lluc (34 %)",c:C.blauClar,match:d=>d.b==="Lc"&&d.can===10,
        ex:"Anunciació, pastors, bon samarità, fill pròdig, Zaqueu i deixebles d'Emmaús."},
      {k:"mc",n:"Nucli exclusiu de Marc (només 6 %)",c:C.vermell,match:d=>d.b==="Mc"&&d.can===10,
        ex:"Només unes poques escenes curtes (com la llavor que creix sola): gairebé tot Marc és als altres!"}
    ];
    lg($("#corda-lg"),[
      {c:C.vermell,t:"Compartit amb Marc (sinòptics)"},
      {c:C.blau,t:"Mateu + Lluc (Font Q) i propis"},
      {c:C.groc,t:"Joan (76 % exclusiu)"},
      {c:C.ink,t:"Comú als 4 evangelis"}
    ]);

    V.mount(el,(node,w)=>{
      const mob=w<640, h=mob?420:510;
      const {ctx,s}=layerCS(node,w,h,"Topografia de densitat dels 1.162 fragments d'Eusebi: cada punt és un passatge real atret pels evangelis que el contenen.");
      const r=V.rng(1162);

      // 4 pols gravitacionals ben equilibrats
      const POLES={
        Mc:[w*(mob?.22:.22), h*(mob?.24:.24)],
        Mt:[w*(mob?.50:.47), h*(mob?.20:.22)],
        Lc:[w*(mob?.36:.35), h*(mob?.74:.76)],
        Jn:[w*(mob?.80:.80), h*(mob?.50:.50)]
      };

      // col·loquem TOTS els 1.162 fragments reals d'Eusebi per atracció gravitacional!
      const ALL=[];
      ["Mc","Mt","Lc","Jn"].forEach(b=>{
        EUS[b].secs.forEach(sec=>{
          const can=sec[1], ww=sec[4]-sec[3];
          let mem=can===10?[b]:CAN_MEM[can];
          if(!mem)return;
          let gx=0, gy=0;
          mem.forEach(m=>{ gx+=POLES[m][0]; gy+=POLES[m][1]; });
          gx/=mem.length; gy/=mem.length;
          // empenyem lleugerament cap enfora els exclusius (cànon 10) per separar els halos
          if(can===10){
            const cx=w*.46, cy=h*.5, dx=gx-cx, dy=gy-cy, dn=Math.hypot(dx,dy)||1;
            const push=b==="Jn"?(mob?14:32):(mob?10:22);
            gx+=dx/dn*push; gy+=dy/dn*push;
          }
          const sd=can===10?(b==="Jn"?(mob?24:40):(mob?16:26)):(mob?15:24);
          const px=clamp(gx+V.gauss(r)*sd, 18, w-18);
          const py=clamp(gy+V.gauss(r)*sd*.88, 22, h-22);
          const col=can===1?C.ink:(can===5?C.blau:(b==="Jn"&&can===10?C.grocFosc:(mem.includes("Mc")?C.vermell:(b==="Lc"?C.blauClar:C.blau))));
          const isl=ISLANDS.find(q=>q.match({b,can}))||ISLANDS[0];
          ALL.push({b,num:sec[0],can,ref:sec[2],w:ww,x:px,y:py,r:clamp(Math.sqrt(ww)/7.2,1.1,4.6),col,isl});
        });
      });

      // corbes de nivell topogràfiques sobre tot el camp (estil «Building strategy»)
      const gp=d3.geoPath(), gTopo=s.append("g"), gAnn=s.append("g");
      const cs=d3.contourDensity().x(d=>d.x).y(d=>d.y).size([w,h]).bandwidth(mob?14:21).thresholds(24)(ALL);
      const ip=V.seqInterp(C.blau);
      if(cs[0]) gTopo.append("path").attr("d",gp(cs[0])).attr("fill",V.alpha(C.blau,.03)).attr("stroke","none");
      cs.forEach((c,i)=>gTopo.append("path").attr("d",gp(c)).attr("fill","none")
        .attr("stroke",i===0?C.ink2:ip(.22+.7*i/cs.length))
        .attr("stroke-width",i===0?1.1:.5).attr("stroke-opacity",i===0?.45:.42));

      // pols dels 4 evangelis + etiquetes de les illes clau
      Object.entries(POLES).forEach(([b,[px,py]])=>{
        const col=b==="Jn"?C.grocFosc:COL[b];
        gAnn.append("circle").attr("cx",px).attr("cy",py).attr("r",3.5).attr("fill",col).attr("stroke",C.paper).attr("stroke-width",1.3);
        const dy=b==="Lc"?22:-16;
        V.t(gAnn,px,py+dy,NOM[b],{anchor:"middle",serif:true,weight:700,size:mob?14:17,fill:C.ink,halo:3.5});
      });

      // anotacions directes sobre les illes emergents
      const qPts=ALL.filter(d=>d.isl.k==="q"), synPts=ALL.filter(d=>d.isl.k==="syn"), jnPts=ALL.filter(d=>d.isl.k==="jn"), allPts=ALL.filter(d=>d.isl.k==="all4");
      const cent=arr=>[d3.mean(arr,d=>d.x),d3.mean(arr,d=>d.y)];
      const cQ=cent(qPts), cS=cent(synPts), cJ=cent(jnPts), cA=cent(allPts);

      if(!mob){
        V.note(gAnn,{x:cS[0],y:cS[1],tx:34,ty:h*.48,kind:"curve",bend:-14,anchor:"start",
          lines:[["Pont sinòptic",true,C.vermell],["Marc + Mateu + Lluc"],["(94 % de Marc hi viu)"]],size:12});
        V.note(gAnn,{x:cQ[0],y:cQ[1],tx:w*.56,ty:h-28,kind:"curve",bend:14,anchor:"start",
          lines:[["Illa de la Font Q",true,C.blau],["Només Mateu i Lluc (sense Marc)"]],size:12});
        V.note(gAnn,{x:cJ[0],y:cJ[1]+34,tx:w-20,ty:h-36,kind:"curve",bend:10,anchor:"end",
          lines:[["Arxipèlag de Joan",true],["76 % de fragments exclusius"]],size:12});
        V.t(gAnn,cA[0],cA[1]+4,"Comú als 4",{anchor:"middle",weight:700,size:11.5,fill:C.ink,halo:3.5});
      } else {
        V.t(gAnn,cS[0],cS[1],"Pont sinòptic",{anchor:"middle",weight:700,size:11,fill:C.vermell,halo:3});
        V.t(gAnn,cQ[0],cQ[1]+16,"Illa Q (Mt+Lc)",{anchor:"middle",weight:700,size:11,fill:C.blau,halo:3});
        V.t(gAnn,cJ[0],cJ[1]+34,"Joan 76 % propi",{anchor:"middle",weight:700,size:11,fill:C.ink,halo:3});
      }

      function drawCloud(focusIsl){
        ctx.clearRect(0,0,w,h);
        for(const d of ALL){
          const on=focusIsl==null||d.isl===focusIsl;
          ctx.fillStyle=V.alpha(d.col,on?(focusIsl?.78:.44):.2);
          ctx.beginPath(); ctx.arc(d.x,d.y,on&&focusIsl?d.r*1.18:d.r,0,6.283); ctx.fill();
        }
      }
      drawCloud(null);

      // hover per proximitat amb d3.Delaunay sobre tots els 1.162 punts!
      const del=d3.Delaunay.from(ALL,d=>d.x,d=>d.y), gHv=s.append("g").attr("pointer-events","none");
      const reset=()=>{ drawCloud(null); gHv.selectAll("*").remove(); };
      outside(node,reset);
      V.hover(s.node(),(ev,[px,py])=>{
        const idx=del.find(px,py), d=ALL[idx];
        if(!d||Math.hypot(px-d.x,py-d.y)>32){ reset(); return; }
        drawCloud(d.isl);
        const grp=ALL.filter(q=>q.isl===d.isl), totW=d3.sum(grp,q=>q.w);
        gHv.selectAll("*").remove();
        gHv.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",d.r+4).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
        if(rd) rd.innerHTML=`<b>${d.isl.n}</b> (${grp.length} fragments · ${f0(totW)} par. · ex. ${NOM[d.b]} ${d.ref}): ${d.isl.ex}`;
      },reset);

      V.onView(node,instant=>{ if(instant)return; gTopo.style("opacity",0).transition().duration(950).ease(ease).style("opacity",1); });
      if(rd) rd.innerHTML="<b>Del caos a l'estructura:</b> tots els <b>1.162 fragments</b> dels evangelis s'ordenen sols en tres grans mons: el pont sinòptic (vermell), l'illa de la Font Q (blau) i l'arxipèlag aïllat de Joan (groc).";
    });
  })();

  /* =====================================================================
     V8 · QUATRE ROSES POLARS CONCÈNTRIQUES (#flors)
     (Directament inspirada en «Typology demand» + «Parcs nacionals dels EUA»)
     ===================================================================== */
  (function(){
    const el=$("#flors"), rd=$("#flors-r"); if(!el)return;
    const P=[
      {k:"words",t:"Extensió",max:19446,c:C.blau,fmt:v=>f0(v)+" par."},
      {k:"parab",t:"Paràboles",max:18,c:C.blau,fmt:v=>v+" vegades"},
      {k:"passio",t:"Última setmana",max:41,c:C.vermell,fmt:v=>v.toFixed(0)+" %"},
      {k:"jer",t:"Jerusalem",max:31,c:C.vermell,fmt:v=>v+" mencions"},
      {k:"uniq",t:"Material exclusiu",max:76,c:C.groc,fmt:v=>v.toFixed(0)+" %"},
      {k:"creure",t:"«Creure»",max:98,c:C.groc,fmt:v=>v+" vegades"}
    ];
    const DATA=["Mc","Mt","Lc","Jn"].map((b,idx)=>({
      b, idx, n:NOM[b],
      words:E.gnt.total[b],
      parab:E.gnt.mots.find(m=>m.g==="παραβολή").pos[b].length,
      passio:E.gnt.passio[b]/E.gnt.total[b]*100,
      jer:E.llocs.find(l=>l.nom==="Jerusalem").n[b],
      uniq:EUS[b].uniqPct,
      creure:E.gnt.mots.find(m=>m.g==="πιστεύω").pos[b].length
    }));
    const SUB={Mc:"94 % compartit · 11.085 par.",Mt:"76 % compartit · 18.329 par.",Lc:"31× Jerusalem · 19.446 par.",Jn:"76 % exclusiu · 0 paràboles"};

    // clau visual de la rosa polar a la llegenda
    (function(){
      const lgEl=$("#flors-lg"); if(!lgEl)return;
      lgEl.innerHTML="";
      const wrap=d3.select(lgEl).append("div").attr("class","ibv-lg");
      wrap.append("div").attr("class","ibv-lg-t").text("Clau dels sis sectors (anell exterior = màxim)");
      const W=244, H=118, cx=122, cy=60, Rk=33;
      const ks=wrap.append("svg").attr("width",W).attr("height",H).style("overflow","visible");
      V.polarGrid(ks,cx,cy,Rk,4,6,{stroke:C.grid,outer:C.hair});
      const arc=d3.arc().innerRadius(0);
      P.forEach((p,j)=>{
        const a0=(j-.5)*Math.PI/3, a1=(j+.5)*Math.PI/3, am=j*Math.PI/3;
        ks.append("path").attr("transform",`translate(${cx},${cy})`).attr("d",arc({outerRadius:Rk*.82,startAngle:a0,endAngle:a1}))
          .attr("fill",V.alpha(p.c,p.c===C.groc?.55:.32)).attr("stroke",p.c===C.groc?C.grocFosc:p.c).attr("stroke-width",.7);
        const rr=Rk+8, x=cx+Math.sin(am)*rr, y=cy-Math.cos(am)*rr, sn=Math.sin(am), cs=Math.cos(am);
        ks.append("text").attr("x",x).attr("y",y+(cs>.5?-2:cs<-.5?9:4)).attr("text-anchor",sn>.25?"start":sn<-.25?"end":"middle")
          .attr("font-size",11).attr("fill",C.ink2).text(p.t);
      });
    })();

    V.mount(el,(node,w)=>{
      const mob=w<680, cols=mob?2:4, cell=w/cols, R=Math.min(cell*(mob?.37:.36),88);
      const rowH=2*R+(mob?66:72), rows=Math.ceil(4/cols), h=rows*rowH+16;
      const s=V.svg(node,w,h,"Quatre roses polars concèntriques: Marc, Mateu, Lluc i Joan. Cada sector mesura una dada real del text grec sobre deu anells concèntrics.");
      const id="f8"+Math.random().toString(36).slice(2,6), defs=s.append("defs");
      // gradients radials translúcids (estil «Typology demand»)
      [C.blau,C.vermell,C.groc].forEach((c,i)=>{
        const rg=defs.append("radialGradient").attr("id",id+"g"+i).attr("gradientUnits","userSpaceOnUse").attr("cx",0).attr("cy",0).attr("r",R);
        rg.append("stop").attr("offset",0).attr("stop-color",c).attr("stop-opacity",.08);
        rg.append("stop").attr("offset",.65).attr("stop-color",c).attr("stop-opacity",c===C.groc?.48:.32);
        rg.append("stop").attr("offset",1).attr("stop-color",c).attr("stop-opacity",c===C.groc?.72:.55);
      });
      const gradOf=c=>c===C.blau?`url(#${id}g0)`:c===C.vermell?`url(#${id}g1)`:`url(#${id}g2)`;
      const Lsc=p=>d3.scaleSqrt([0,p.max],[0,R]);
      const pos=i=>[(i%cols+.5)*cell, Math.floor(i/cols)*rowH+R+20];
      const arc=d3.arc().innerRadius(0);
      const radLoop=d3.lineRadial().angle(d=>d.j*Math.PI/3).radius(d=>Math.max(4,Lsc(d.p)(d.val))).curve(d3.curveCatmullRomClosed.alpha(.5));

      const fls=s.selectAll("g.fl").data(DATA).join("g").attr("class","fl")
        .attr("transform",(d,i)=>`translate(${pos(i)})`).style("cursor","pointer");

      // 9 anells concèntrics ultra-fins + 6 radis (estil «Parcs nacionals» + «Typology demand»)
      fls.each(function(d){
        const g=d3.select(this);
        V.polarGrid(g,0,0,R,9,6,{stroke:C.grid,outer:C.hair});
        // sectors radials translúcids amb gradient
        const ptsData=P.map((p,j)=>({p,j,val:d[p.k],b:d.b,n:d.n}));
        g.selectAll("path.w8").data(ptsData).join("path").attr("class","w8")
          .attr("d",q=>arc({outerRadius:Math.max(q.val>0?5:0,Lsc(q.p)(q.val)),startAngle:(q.j-.46)*Math.PI/3,endAngle:(q.j+.46)*Math.PI/3}))
          .attr("fill",q=>gradOf(q.p.c))
          .attr("stroke",q=>q.p.c===C.groc?C.grocFosc:q.p.c).attr("stroke-width",.8).attr("stroke-opacity",.78)
          .style("mix-blend-mode","multiply");
        // llaç orgànic tancat suau (estil «Parcs nacionals»)
        g.append("path").attr("class","lp8").attr("d",radLoop(ptsData))
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-opacity",.5);
        g.append("circle").attr("r",2.2).attr("fill",C.ink);
        V.t(g,0,R+24,d.n,{anchor:"middle",weight:700,size:mob?15:17,serif:true,fill:C.ink});
        V.t(g,0,R+40,SUB[d.b],{anchor:"middle",size:11,fill:C.muted});
      });

      const hvG=fls.append("g").attr("class","hvg").attr("pointer-events","none");
      const wedges=fls.selectAll("path.w8");

      V.onView(node,instant=>{
        if(instant)return;
        wedges.attr("transform","scale(0.01)").transition().delay((q,i)=>i*35).duration(850).ease(d3.easeCubicOut).attr("transform","scale(1)");
      });

      function reset(){ wedges.style("opacity",1).attr("stroke-width",.8); hvG.selectAll("*").remove(); }
      outside(node,reset);
      V.hover(s.node(),(ev,[px,py])=>{
        const idx=d3.leastIndex(DATA,d=>{ const q=pos(d.idx); return Math.hypot(px-q[0],py-q[1]); });
        if(idx<0){ reset(); return; }
        const c=pos(idx); if(Math.hypot(px-c[0],py-c[1])>R+28){ reset(); return; }
        let a=Math.atan2(px-c[0],-(py-c[1])); if(a<0)a+=2*Math.PI;
        const j=Math.round(a/(Math.PI/3))%6, tr=P[j];
        wedges.style("opacity",q=>q.j===j?1:.48).attr("stroke-width",q=>q.j===j?1.6:.8);
        hvG.selectAll("*").remove();
        fls.each(function(fd){
          const g=d3.select(this).select("g.hvg"), val=fd[tr.k], len=Lsc(tr)(val), ang=j*Math.PI/3;
          g.append("line").attr("x1",0).attr("y1",0).attr("x2",Math.sin(ang)*R).attr("y2",-Math.cos(ang)*R).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
          const rx=Math.sin(ang)*(len+10), ry=-Math.cos(ang)*(len+10);
          const [cx]=pos(fd.idx), colIdx=fd.idx%cols;
          const cellL=Math.max(4,colIdx*cell+4), cellR=Math.min(w-4,(colIdx+1)*cell-4);
          const txt=tr.fmt(val), estW=txt.length*6.4+4;
          let anc=Math.sin(ang)>.2?"start":Math.sin(ang)<-.2?"end":"middle";
          let ax=cx+rx;
          if(anc==="start"&&ax+estW>cellR){ ax=cellR; anc="end"; }
          else if(anc==="end"&&ax-estW<cellL){ ax=cellL; anc="start"; }
          else if(anc==="middle"){ ax=clamp(ax,cellL+estW/2,cellR-estW/2); }
          ax=clamp(ax,4,w-4);
          V.t(g,ax-cx,ry+4,txt,{anchor:anc,weight:700,size:11.5,fill:C.ink,halo:3.5});
        });
        const comp=DATA.map(q=>`${q.n}: <b>${tr.fmt(q[tr.k])}</b>`).join(" · ");
        if(rd) rd.innerHTML=`<b>${tr.t} als quatre evangelis:</b> ${comp}.`;
      },reset);

      if(rd) rd.innerHTML="<b>Passa per qualsevol sector:</b> s'il·luminarà el mateix tret als quatre evangelis alhora. Mira com la silueta polar de <b>Joan</b> és l'invers de la dels sinòptics.";
    });
  })();

  /* =====================================================================
     WOW #1 · ON POSA LA CÀMERA CADA EVANGELI? (#llocs-const)
     15 poblacions reals en cercles translúcids multiply (sense anells!)
     ===================================================================== */
  (function(){
    const el=$("#llocs-const"), rd=$("#llocs-const-r"); if(!el)return;
    const BOOKS=["Mc","Mt","Lc","Jn"];
    const BCOL={Mc:C.vermell,Mt:C.blau,Lc:C.blauClar,Jn:C.groc};
    const TOWNS=E.llocs.map(d=>({...d,tot:d3.sum(BOOKS,b=>d.n[b])})).sort((a,b)=>b.tot-a.tot);
    const rMax=31;
    const rLeg=d3.scaleSqrt([0,rMax],[0,26]);
    const lgEl=$("#llocs-const-lg");
    if(lgEl){ lgEl.innerHTML=""; V.legendSize(lgEl,{title:"Mencions al text grec",values:[5,15,30],r:rLeg,f:f0}); }

    V.mount(el,(node,w)=>{
      const mob=w<640, top=mob?58:64, left=mob?108:156, right=mob?20:44, rh=mob?30:34;
      const h=top+TOWNS.length*rh+24;
      const s=V.svg(node,w,h,"Les quinze poblacions anomenades als quatre evangelis: cada cercle translúcid té l'àrea proporcional a les mencions en el text grec original.");
      const x=d3.scalePoint(BOOKS,[left+36,w-right-30]).padding(.15);
      const rSc=d3.scaleSqrt([0,rMax],[0,mob?20:30]);
      

      // capçaleres de columna (els 4 evangelis) + fils verticals ultra-fins
      BOOKS.forEach(b=>{
        const cx=x(b);
        s.append("line").attr("x1",cx).attr("x2",cx).attr("y1",top-24).attr("y2",h-14).attr("stroke",C.grid).attr("stroke-width",.55);
        V.t(s,cx,top-34,NOM[b],{anchor:"middle",weight:700,size:mob?12:13.5,fill:b==="Mc"?C.vermell:C.ink});
      });

      const rows=s.selectAll("g.lrow").data(TOWNS).join("g").attr("class","lrow").style("cursor","pointer");
      rows.each(function(d,i){
        const g=d3.select(this), cy=top+i*rh+14;
        g.append("line").attr("x1",left).attr("x2",w-right).attr("y1",cy).attr("y2",cy).attr("stroke",C.grid).attr("stroke-width",.5);
        V.t(g,left-10,cy+4,d.nom,{anchor:"end",weight:i<3?700:500,size:mob?11.5:12.5,fill:i<3?C.ink:C.ink2});
        BOOKS.forEach(b=>{
          const v=d.n[b]; if(!v)return;
          const cx=x(b), rad=Math.max(3.5,rSc(v)), col=BCOL[b];
          g.append("circle").attr("class","lcir").datum({d,b,v,rad}).attr("cx",cx).attr("cy",cy).attr("r",rad)
            .attr("fill",col).attr("fill-opacity",b==="Jn"?.62:.38)
            .style("mix-blend-mode","multiply");
          g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",1.8).attr("fill",b==="Jn"?C.grocFosc:col);
          if(v>=10||(d.nom==="Canà"&&b==="Jn")||(d.nom==="Betlem"&&b==="Mt")){
            V.t(g,cx,cy+4,String(v),{anchor:"middle",weight:700,size:11.5,fill:C.ink,halo:3});
          }
        });
      });

      if(!mob){
        V.note(s,{x:x("Lc")+rSc(31)*.75,y:top+14-rSc(31)*.4,tx:x("Jn")+24,ty:top+18,kind:"curve",bend:10,anchor:"start",
          lines:[["31 vegades a Lluc",true],["el centre de gravetat"]],size:11.5});
      }

      const gHv=s.append("g").attr("pointer-events","none");
      const off=()=>{ rows.style("opacity",1); gHv.selectAll("*").remove(); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const i=Math.round((py-top-14)/rh), d=TOWNS[i];
        if(!d||Math.abs(py-(top+i*rh+14))>rh*.6){ off(); return; }
        rows.style("opacity",q=>q===d?1:.48);
        const cy=top+i*rh+14;
        gHv.selectAll("*").remove();
        BOOKS.forEach(b=>{
          const v=d.n[b]; if(!v)return;
          const rad=Math.max(3.5,rSc(v));
          gHv.append("circle").attr("cx",x(b)).attr("cy",cy).attr("r",rad+2.5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
          if(rad>=11) V.t(gHv,x(b),cy+4,String(v),{anchor:"middle",weight:700,size:12,fill:C.ink,halo:3.5});
          else V.t(gHv,x(b)+rad+6,cy+4,String(v),{anchor:"start",weight:700,size:11.5,fill:C.ink,halo:3.5});
        });
        const det=BOOKS.map(b=>`${NOM[b]}: <b>${d.n[b]}</b>`).join(" · ");
        const refs=BOOKS.filter(b=>d.refs[b]&&d.refs[b].length).slice(0,2).map(b=>`${NOM[b]} ${d.refs[b].slice(0,3).join(", ")}${d.refs[b].length>3?"…":""}`).join(" | ");
        if(rd) rd.innerHTML=`<b>${d.nom} (${d.tot} mencions):</b> ${det}${refs?` — ${refs}`:""}${d.nota?` · <i>${d.nota}</i>`:""}.`;
      },off);

      V.onView(node,instant=>{
        if(instant)return;
        s.selectAll("circle.lcir").attr("r",0).transition().delay((d,i)=>i*14).duration(650).ease(d3.easeCubicOut).attr("r",d=>d.rad);
      });
      if(rd) rd.innerHTML="<b>El mapa invisible de les paraules:</b> Lluc concentra el focus a <b>Jerusalem (31)</b>; només <b>Joan</b> anomena Canà (4) i Sicar (1); <b>Marc</b> no anomena mai Betlem.";
    });
  })();

  /* =====================================================================
     WOW #2 · QUI VEU JESÚS RESSUSCITAT, I ON? (#aparicions-orb)
     Constel·lació cronològica de fils de seda i cercles translúcids
     ===================================================================== */
  (function(){
    const el=$("#aparicions-orb"), rd=$("#aparicions-orb-r"); if(!el)return;
    const COLS=[
      {k:"Pau",n:"Pau (1Co 15)",yr:"≈ 55"},
      {k:"Mc",n:"Marc 16,1–8",yr:"≈ 70"},
      {k:"Mt",n:"Mateu 28",yr:"≈ 85"},
      {k:"Lc",n:"Lluc 24 + Fets",yr:"≈ 90"},
      {k:"Jn",n:"Joan 20–21",yr:"≈ 100"}
    ];
    // lloc: J = Jerusalem (vermell), G = Galilea (blau), X = Sense lloc / Damasc (groc), T = Només tomba buida (puntejat)
    const WIT=[
      {n:"Dones a la tomba",e:{Mc:"T",Mt:"J",Lc:"T",Jn:"T"},det:"A Pau no hi surten. A Marc original només troben la tomba oberta i fugen espantades."},
      {n:"Maria Magdalena",e:{Mc:"T",Mt:"J",Lc:"T",Jn:"J"},det:"A Joan 20 és la primera persona que veu i reconeix Jesús ressuscitat, al jardí del sepulcre."},
      {n:"Pere (Cefes)",e:{Pau:"X",Lc:"J",Jn:"G"},det:"És el primer de la llista de Pau (≈ 55). Lluc ho esmenta de passada; Joan ho situa al llac de Galilea."},
      {n:"Els deixebles (Jerusalem)",e:{Pau:"X",Lc:"J",Jn:"J"},det:"Lluc reté totes les aparicions a Jerusalem i rodalia (Emmaús). Joan n'hi situa dues."},
      {n:"Els deixebles (Galilea)",e:{Mt:"G",Jn:"G"},det:"Mateu i Joan porten Jesús ressuscitat de tornada a Galilea (la muntanya i la riba del llac)."},
      {n:"Tomàs",e:{Jn:"J"},det:"Només apareix en aquest paper a Joan 20,24–29, vuit dies després a Jerusalem."},
      {n:"Més de 500 i Pau",e:{Pau:"X"},det:"Només Pau (1Co 15,6–8) parla de més de cinc-cents germans alhora, de Jaume i de la seva pròpia visió."}
    ];
    const LCOL={J:C.vermell,G:C.blau,X:C.groc,T:C.ink2};
    const LTXT={J:"Aparició a Jerusalem",G:"Aparició a Galilea",X:"Sense lloc especificat",T:"Només tomba buida (sense veure Jesús)"};
    lg($("#aparicions-orb-lg"),[
      {c:C.vermell,t:"A Jerusalem"},
      {c:C.blau,t:"A Galilea"},
      {c:C.groc,t:"Sense lloc (Pau)"},
      {c:C.ink2,t:"Només tomba buida",k:"ho"}
    ]);

    V.mount(el,(node,w)=>{
      const mob=w<600, top=48, left=mob?8:188, right=mob?8:36, rh=mob?50:44;
      const h=top+WIT.length*rh+38;
      const s=V.svg(node,w,h,"Constel·lació cronològica de qui veu Jesús ressuscitat i on, des de la carta de Pau (≈ 55) fins a l'Evangeli de Joan (≈ 100).");
      const x=d3.scalePoint(COLS.map(c=>c.k),[left+(mob?22:24),w-right-(mob?22:24)]).padding(.12);
      

      // columnes cronològiques
      COLS.forEach(c=>{
        const cx=x(c.k);
        s.append("line").attr("x1",cx).attr("x2",cx).attr("y1",top-8).attr("y2",h-26).attr("stroke",C.grid).attr("stroke-width",.6);
        V.t(s,cx,top-26,mob?c.k:c.n,{anchor:"middle",weight:700,size:mob?11.5:12.5,fill:C.ink});
        V.t(s,cx,top-12,c.yr,{anchor:"middle",size:11,fill:C.muted});
      });

      const rows=s.selectAll("g.arow").data(WIT).join("g").attr("class","arow").style("cursor","pointer");
      rows.each(function(d,i){
        const g=d3.select(this), cy=mob?(top+i*rh+30):(top+i*rh+16);
        g.append("line").attr("x1",left).attr("x2",w-right).attr("y1",cy).attr("y2",cy).attr("stroke",C.grid).attr("stroke-width",.5);
        if(mob) V.t(g,left,top+i*rh+12,d.n,{anchor:"start",weight:600,size:11.5,fill:C.ink});
        else V.t(g,left-10,cy+4,d.n,{anchor:"end",weight:600,size:12.5,fill:C.ink});

        // fils de seda que uneixen les aparicions d'un mateix testimoni al llarg del temps
        const keys=COLS.map(c=>c.k).filter(k=>d.e[k]);
        if(keys.length>1){
          g.append("line").attr("x1",x(keys[0])).attr("x2",x(keys[keys.length-1])).attr("y1",cy).attr("y2",cy)
            .attr("stroke",C.ink2).attr("stroke-width",1.1).attr("stroke-opacity",.3);
        }

        keys.forEach(k=>{
          const tpK=d.e[k], cx=x(k), col=LCOL[tpK];
          if(tpK==="T"){
            g.append("circle").attr("class","abub").attr("cx",cx).attr("cy",cy).attr("r",mob?8:11)
              .attr("fill",C.paper).attr("stroke",C.ink2).attr("stroke-width",1.2).attr("stroke-dasharray","2.5 2.5");
          } else {
            // cercle translúcid suau + puntet central (zero anells!)
            g.append("circle").attr("class","abub").attr("cx",cx).attr("cy",cy).attr("r",mob?11:15)
              .attr("fill",col).attr("fill-opacity",tpK==="X"?.55:.32).style("mix-blend-mode","multiply");
            g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",2.8).attr("fill",tpK==="X"?C.grocFosc:col);
          }
        });
      });

      if(!mob){
        V.note(s,{x:x("Mc"),y:top+16+14,tx:x("Mc")+30,ty:h-12,kind:"curve",bend:-10,anchor:"start",
          lines:[["Marc 16,8: ningú no veu Jesús",true]],size:11.5});
      }

      const off=()=>{ rows.style("opacity",1); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const i=mob?Math.floor((py-top)/rh):Math.round((py-top-16)/rh), d=WIT[i];
        if(!d||(mob?(py<top||py>top+WIT.length*rh):Math.abs(py-(top+i*rh+16))>rh*.58)){ off(); return; }
        rows.style("opacity",q=>q===d?1:.48);
        if(rd) rd.innerHTML=`<b>${d.n}:</b> ${d.det}`;
      },off);

      V.onView(node,instant=>{
        if(instant)return;
        s.selectAll("circle.abub").attr("transform","scale(0.1)").style("transform-box","fill-box").style("transform-origin","center")
          .transition().delay((d,i)=>i*30).duration(650).ease(d3.easeCubicOut).attr("transform","scale(1)");
      });
      if(rd) rd.innerHTML="<b>De Pau a Joan:</b> a la carta més antiga (Pau) no hi ha tomba ni dones; a Marc original només hi ha la tomba buida; Lluc concentra les aparicions a <b>Jerusalem</b>, mentre Mateu i Joan les porten a <b>Galilea</b>.";
    });
  })();

  /* =====================================================================
     WOW #3 · L'ADN VERBAL: 597 APARICIONS DE SET PARAULES CLAU (#ritme-mots)
     Cercles translúcids multiply + ones de densitat kernel al llarg dels 4 llibres
     ===================================================================== */
  (function(){
    const fig=$("#f-ritme-mots"), el=$("#ritme-mots"), segEl=$("#ritme-mots-seg"), rd=$("#ritme-mots-r");
    if(!el||!segEl)return;
    const ORDER=["εὐθύς","παραβολή","βασιλεία","πιστεύω","κόσμος","ἀγαπάω","Ἰουδαῖος"];
    const MOTS=ORDER.map(g=>E.gnt.mots.find(m=>m.g===g)).filter(Boolean);
    const NOTES={
      "εὐθύς":"<b>Marc té pressa:</b> «de seguida» hi surt <b>42 vegades</b> — més del triple que als altres tres evangelis junts (12)!",
      "παραβολή":"<b>Zero paràboles a Joan:</b> mentre Marc (13), Mateu (17) i Lluc (18) n'estan plens, Joan no fa servir la paraula ni una sola vegada.",
      "βασιλεία":"<b>El «Regne» és el cor dels sinòptics:</b> 55 vegades a Mateu, 46 a Lluc i 20 a Marc; a Joan només 5.",
      "πιστεύω":"<b>El verb de Joan:</b> «creure» hi esclata <b>98 vegades</b>, davant de només 9 a 11 vegades als altres tres llibres.",
      "κόσμος":"<b>Una mirada còsmica:</b> Joan repeteix «món» <b>78 vegades</b>; Marc només 2 i Lluc 3.",
      "ἀγαπάω":"<b>Estimar al comiat:</b> Joan concentra la majoria de les seves <b>37 aparicions</b> als discursos de l'últim sopar.",
      "Ἰουδαῖος":"<b>Distància històrica:</b> Joan escriu més tard i fa servir el terme grec <i>Ioudaîos</i> («jueu») <b>71 vegades</b>, en contrast amb 5 o 6 als sinòptics."
    };
    const BOOKS=["Mc","Mt","Lc","Jn"];
    const BCOL={Mc:C.vermell,Mt:C.blau,Lc:C.blauClar,Jn:C.groc};
    let curM=MOTS[0], drawWord=null;

    // botons de les 7 paraules
    segEl.innerHTML=MOTS.map((m,i)=>`<button type="button" aria-pressed="${i===0?"true":"false"}" data-k="${m.g}">«${m.ca}»</button>`).join("");
    lg($("#ritme-mots-lg"),[{c:C.vermell,t:"Marc"},{c:C.blau,t:"Mateu i Lluc"},{c:C.groc,t:"Joan"}]);

    // funció de densitat kernel suau (Gaussian KDE sobre [0..1])
    function kde(vals,bins,bw){
      const out=[];
      for(let i=0;i<=bins;i++){
        const u=i/bins; let s=0;
        for(let j=0;j<vals.length;j++){ const d=(u-vals[j])/bw; s+=Math.exp(-.5*d*d); }
        out.push([u,s]);
      }
      return out;
    }

    V.mount(el,(node,w)=>{
      const mob=w<640, top=24, left=mob?58:84, right=mob?54:72, rowH=mob?68:76;
      const h=top+BOOKS.length*rowH+26;
      const s=V.svg(node,w,h,"Aparicions de set paraules clau al text grec original dels quatre evangelis, dibuixades com a cercles translúcids i corbes de densitat.");
      const x=d3.scaleLinear([0,1],[left,w-right]);
      

      // eix inferior 0 % → 100 % del llibre
      [0,.25,.5,.75,1].forEach(p=>V.t(s,x(p),h-8,p===0?"Inici":p===1?"Final":Math.round(p*100)+" %",{anchor:"middle",size:11,fill:C.muted}));

      const gRows=s.append("g");
      const gHv=s.append("g").attr("pointer-events","none");

      drawWord=function(m,anim){
        curM=m; gRows.selectAll("*").remove(); gHv.selectAll("*").remove();
        // calculem densitat màxima comuna entre els 4 llibres per comparar honestament
        const kdes=BOOKS.map(b=>{
          const tot=E.gnt.total[b], vals=m.pos[b].map(p=>p/tot);
          return {b,vals,curve:kde(vals,80,.035)};
        });
        const maxD=Math.max(2.5,d3.max(kdes,k=>d3.max(k.curve,p=>p[1]))||1);

        kdes.forEach((k,i)=>{
          const b=k.b, baseY=top+(i+1)*rowH-14, col=BCOL[b], strokeCol=b==="Jn"?C.grocFosc:col;
          const g=gRows.append("g").attr("class","mrow");
          g.append("line").attr("x1",left).attr("x2",w-right).attr("y1",baseY).attr("y2",baseY).attr("stroke",C.hair).attr("stroke-width",.6);
          V.t(g,left-10,baseY-2,NOM[b],{anchor:"end",weight:700,size:mob?12:13,fill:C.ink});
          const cnt=k.vals.length;
          V.t(g,w-right+12,baseY-2,cnt===0?"0×":`${cnt}×`,{anchor:"start",weight:700,size:mob?12.5:14,fill:cnt===0?C.ghost:(b==="Mc"?C.vermell:C.ink)});

          // ona suau de densitat
          if(cnt>0){
            const ySc=d3.scaleLinear([0,maxD],[baseY,baseY-(rowH-24)]);
            const area=d3.area().x(p=>x(p[0])).y0(baseY).y1(p=>ySc(p[1])).curve(d3.curveBasis);
            const line=d3.line().x(p=>x(p[0])).y(p=>ySc(p[1])).curve(d3.curveBasis);
            g.append("path").datum(k.curve).attr("d",area).attr("fill",col).attr("fill-opacity",b==="Jn"?.26:.13);
            g.append("path").datum(k.curve).attr("d",line).attr("fill","none").attr("stroke",strokeCol).attr("stroke-width",1.15).attr("stroke-opacity",.72);
          }

          // cada aparició real és un cercle translúcid multiply sobre el fil!
          const cs=g.selectAll("circle.mdot").data(k.vals).join("circle").attr("class","mdot")
            .attr("cx",u=>x(u)).attr("cy",baseY).attr("r",mob?4.2:5.4)
            .attr("fill",col).attr("fill-opacity",b==="Jn"?.55:.36).style("mix-blend-mode","multiply");
          if(anim&&!V.reduced){
            cs.attr("r",0).transition().delay((_,j)=>j*6).duration(420).ease(d3.easeCubicOut).attr("r",mob?4.2:5.4);
          }
        });
        if(rd) rd.innerHTML=NOTES[m.g]||`<b>«${m.ca}» (${m.g}):</b> distribució real als quatre evangelis.`;
      };

      const off=()=>{ gHv.selectAll("*").remove(); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const i=Math.floor((py-top)/rowH);
        if(i<0||i>=BOOKS.length||px<left||px>w-right){ off(); return; }
        const b=BOOKS[i], baseY=top+(i+1)*rowH-14, u=clamp((px-left)/(w-right-left),0,1);
        const tot=E.gnt.total[b], vals=curM.pos[b].map(p=>p/tot);
        const near=vals.filter(v=>Math.abs(v-u)<.04).length;
        gHv.selectAll("*").remove();
        gHv.append("line").attr("x1",px).attr("x2",px).attr("y1",top).attr("y2",h-22).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
        V.t(gHv,px,baseY-rowH+26,`${NOM[b]} · ${curM.pos[b].length}×`,{anchor:px>w-140?"end":"start",weight:700,size:11.5,fill:C.ink,halo:3.5});
        if(rd) rd.innerHTML=`<b>«${curM.ca}» (<i lang="el">${curM.g}</i>) a ${NOM[b]}:</b> ${curM.pos[b].length} vegades en total · punt ${Math.round(u*100)} % del llibre (${near} aparicions en aquest tram).`;
      },off);

      drawWord(curM,false);
      V.onView(node,instant=>{ if(!instant)drawWord(curM,true); });
    });

    seg(fig,k=>{ const m=MOTS.find(q=>q.g===k); if(m&&drawWord)drawWord(m,true); });
  })();
})();
