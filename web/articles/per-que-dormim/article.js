/* «Per què dormim?» — visualitzacions del sistema infogràfic IB (d3 7.9.0 + IBV).
   Fons de paper blanc, paleta vermell/blau/groc, mai text en groc,
   cercles translúcids multiply, hover suau (≥ 0,48) i lectura fixa (.ibv-dock). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.DORMIM_DATA;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);

/* =====================================================================
   FIGURA 1 · IB-38 / IB-07 · 83 MAMÍFERS (+ EXTRES SALVATGES)
   ===================================================================== */
(function animalsFig(){
  const el=$("#animals-viz"), lg=$("#animals-lg");
  if(!el)return;
  let mode="tots";
  const ALL=D.mammals.concat(D.extras);
  const GRP_INFO={
    primat:  {t:"Primats", c:C.vermell},
    herbivor:{t:"Grans herbívors i altres herbívors", c:C.blau},
    carnivor:{t:"Carnívors", c:C.groc},
    mari:    {t:"Marins i aus en vol", c:C.blauFosc},
    altre:   {t:"Altres mamífers", c:C.ghost}
  };
  V.legendCat(lg,[
    {c:C.vermell,  t:"Primats (humà destacat)"},
    {c:C.blau,     t:"Herbívors"},
    {c:C.groc,     t:"Carnívors"},
    {c:C.blauFosc, t:"Marins i aus en vol"},
    {c:C.ghost,    t:"Altres mamífers"}
  ]);

  let redrawMode=null;
  V.mount(el,(box,w)=>{
    const mob=w<640, h=mob?380:400, m={t:28,r:mob?16:30,b:34,l:mob?36:44};
    const s=V.svg(box,w,h,"Comparació de les hores diàries de son de 83 mamífers (Savage & West, 2007) i espècies salvatges destacades, de 0,69 h la fregata en vol i 2,0 h l'elefant salvatge fins a 19,9 h el ratpenat marró petit; els humans dormen menys que cap altre primat però amb més proporció de REM.");
    const gAxes=s.append("g"), gPts=s.append("g"), gAnn=s.append("g");
    const tp=V.tip(box);

    // Determinista per evitar salts en redibuixar
    const rnd=V.rng(2026);
    ALL.forEach(d=>{ d._j=(rnd()-0.5)*2; });

    function draw(mMode, instant){
      gAxes.selectAll("*").remove();
      gAnn.selectAll("*").remove();
      const dur=instant||V.reduced?0:680;
      let list, xScale, yPos, rVal;

      if(mMode==="tots"){
        list=ALL;
        xScale=d3.scaleLinear([0,21],[m.l,w-m.r]);
        const rows=["primat","herbivor","carnivor","mari","altre"];
        const rLab={primat:"Primats",herbivor:"Herbívors",carnivor:"Carnívors",mari:"Marins i aus",altre:"Altres"};
        const yRow=d3.scalePoint(rows,[m.t+24, h-m.b-22]);
        V.axisX(gAxes, xScale, h-m.b, mob?[0,5,10,15,20]:[0,2,4,6,8,10,12,14,16,18,20], d=>d+" h", {tick:true, grid:m.t});
        rows.forEach(rk=>{
          gAxes.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",yRow(rk)).attr("y2",yRow(rk)).attr("stroke",C.grid).attr("stroke-width",.7);
          V.t(gAxes, m.l, yRow(rk)-12, rLab[rk], {size:11.5, weight:600, fill:rk==="primat"?C.vermell:C.ink2, halo:true});
        });
        yPos=d=>yRow(d.grp) + d._j*(mob?9:12);
        rVal=d=>d.en==="Human"?(mob?9:11):(d.hl?(mob?6.5:8):(mob?4.5:5.5));
        // Anotacions clau (sense solapaments ni a escriptori ni a 390 px)
        const picks=[
          {en:"Great frigatebird (in flight)", dx:14, dy:22, anc:"start", l:[["Fregata en vol",true],["0,69 h/dia"]]},
          {en:"African elephant (wild)", dx:8, dy:20, anc:"start", l:[["Elefant salvatge",true],["2,0 h/dia"]]},
          {en:"Human", dx:mob?-4:-10, dy:mob?22:-20, anc:mob?"middle":"end", l:[["Humà · 8,0 h",true],["el primat més breu"]]},
          {en:"Little brown bat", dx:-8, dy:-20, anc:"end", l:[["Ratpenat marró",true],["19,9 h/dia"]]}
        ];
        picks.forEach(pk=>{
          if(mob && pk.en==="African elephant (wild)")return;
          const d=list.find(x=>x.en===pk.en); if(!d)return;
          const px=xScale(d.tot), py=yPos(d);
          V.note(gAnn,{x:px,y:py,tx:px+pk.dx,ty:py+pk.dy,kind:"straight",anchor:pk.anc,lines:pk.l,size:11.5});
        });
      } else if(mMode==="primats"){
        list=D.mammals.filter(d=>d.grp==="primat").sort((a,b)=>a.tot-b.tot);
        xScale=d3.scaleLinear([5.5,18.5],[m.l+74, w-m.r]);
        const yP=d3.scalePoint(list.map(d=>d.en),[m.t+10, h-m.b-12]);
        V.axisX(gAxes, xScale, h-m.b, [6,8,10,12,14,16,18], d=>d+" h", {tick:true, grid:m.t});
        // Predicció evolutiva humana (9,55 h, Samson & Nunn 2015)
        gAxes.append("line").attr("x1",xScale(9.55)).attr("x2",xScale(9.55)).attr("y1",m.t).attr("y2",h-m.b)
          .attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-dasharray","2 3");
        V.t(gAxes, xScale(9.55)+5, m.t+12, "Predicció humana: 9,55 h (Samson & Nunn, 2015)", {size:11.5, italic:true, fill:C.ink2, halo:true});
        list.forEach(d=>{
          const yy=yP(d.en), isH=d.en==="Human";
          gAxes.append("line").attr("x1",m.l+74).attr("x2",xScale(d.tot)).attr("y1",yy).attr("y2",yy)
            .attr("stroke",isH?C.vermell:C.hair).attr("stroke-width",isH?1.8:.9);
          V.t(gAxes, m.l+68, yy+4, d.ca, {size:mob?11:12, weight:isH?700:400, fill:isH?C.vermell:C.ink2, anchor:"end"});
        });
        yPos=d=>yP(d.en);
        rVal=d=>d.en==="Human"?10:7;
      } else {
        // Hores totals vs. % de REM (totes les espècies amb remPct real)
        list=ALL.filter(d=>d.remPct!=null);
        xScale=d3.scaleLinear([0,21],[m.l,w-m.r]);
        const yRem=d3.scaleLinear([0,62],[h-m.b,m.t]);
        V.gridY(gAxes, yRem, 0, w-m.r, [0,15,30,45,60], v=>v, {zero:0, unit:" % REM"});
        V.axisX(gAxes, xScale, h-m.b, [0,5,10,15,20], d=>d+" h totals", {tick:true});
        yPos=d=>yRem(d.remPct);
        rVal=d=>d.en==="Human"?11:(d.grp==="primat"?7.5:5.5);
        // Anotacions clau REM
        const remPicks=[
          {en:"Human", dx:12, dy:-18, anc:"start", l:[["Humà",true],["8,0 h · 23,8 % REM"]]},
          {en:"Chimpanzee", dx:10, dy:16, anc:"start", l:[["Ximpanzé",true],["9,7 h · 14,4 % REM"]]},
          {en:"Platypus", dx:-12, dy:10, anc:"end", l:[["Ornitorrinc",true],["14,0 h · 57,1 % REM"]]},
          {en:"Giant armadillo", dx:-12, dy:-14, anc:"end", l:[["Armadillo gegant",true],["18,1 h · 33,7 % REM"]]}
        ];
        remPicks.forEach(pk=>{
          if(mob && pk.en==="Chimpanzee")return;
          const d=list.find(x=>x.en===pk.en); if(!d)return;
          V.note(gAnn,{x:xScale(d.tot),y:yRem(d.remPct),tx:xScale(d.tot)+pk.dx,ty:yRem(d.remPct)+pk.dy,kind:"straight",anchor:pk.anc,lines:pk.l,size:11.5});
        });
      }

      const sel=gPts.selectAll("circle.sp").data(list, d=>d.en);
      sel.exit().transition().duration(dur/2).attr("r",0).remove();
      const ent=sel.enter().append("circle").attr("class","sp").attr("r",0)
        .style("mix-blend-mode","multiply").style("cursor","pointer");
      const allDots=ent.merge(sel);

      allDots.transition().duration(dur).ease(d3.easeCubicInOut)
        .attr("cx",d=>xScale(d.tot)).attr("cy",d=>yPos(d)).attr("r",d=>rVal(d))
        .attr("fill",d=>d.en==="Human"?C.vermell:(GRP_INFO[d.grp]?GRP_INFO[d.grp].c:C.ghost))
        .attr("fill-opacity",d=>d.en==="Human"?.72:(d.grp==="primat"?.46:(d.grp==="carnivor"?.52:.34)))
        .attr("stroke",d=>d.en==="Human"?C.ink:null).attr("stroke-width",d=>d.en==="Human"?1.6:0);

      allDots.on("pointerenter pointerdown",(ev,d)=>{
        V.focus(allDots, x=>x.en===d.en, {dim:.48});
        allDots.attr("stroke",x=>x.en===d.en?C.ink:(x.en==="Human"?C.ink:null))
               .attr("stroke-width",x=>x.en===d.en?1.8:(x.en==="Human"?1.4:0));
        const remTxt=d.rem!=null?` · REM: ${f1(d.rem)} h (${f1(d.remPct)} %)`: "";
        const srcTxt=d.src?` (${d.src})`:"";
        tp.show(`<b>${d.ca}</b> (${d.ord})<br>${f1(d.tot)} h/dia${remTxt}${srcTxt}`);
      }).on("pointerleave",ev=>{
        if(ev.pointerType!=="mouse")return;
        V.focus(allDots,null);
        allDots.attr("stroke",x=>x.en==="Human"?C.ink:null).attr("stroke-width",x=>x.en==="Human"?1.6:0);
        tp.hide();
      });
    }

    redrawMode=(mMode,inst)=>{ mode=mMode; draw(mMode,inst); };
    V.onView(box, inst=>draw(mode,inst));
  });

  document.querySelectorAll("#f-animals .seg button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("#f-animals .seg button").forEach(b=>b.setAttribute("aria-pressed",b===btn));
      if(redrawMode)redrawMode(btn.dataset.k,false);
    });
  });
})();

/* =====================================================================
   FIGURA 2 · SIMULADOR INTERACTIU DEL MODEL DE BORBÉLY (36 HORES)
   ===================================================================== */
(function borbelyFig(){
  const el=$("#borbely-viz"), lg=$("#borbely-lg"), rng=$("#borbely-rng");
  if(!el)return;
  let scen="normal", curH=23;

  V.legendCat(lg,[
    {c:C.vermell, t:"Procés S (pressió d'adenosina)", kind:"line", w:2.2},
    {c:C.blau,    t:"Procés C (alerta circadiana)", kind:"line", w:2.2},
    {c:C.groc,    t:"Llum solar (supressió de melatonina)"}
  ]);

  // Calcula Procés S (0..100) i Procés C (0..100) de t=7h fins a t=43h (36 h)
  function simCurves(sc){
    const pts=[];
    let S=14;
    for(let t=7; t<=43; t+=0.5){
      const hod=((t%24)+24)%24;
      const asleep=(sc!=="blanc") && (t>=23 && t<=31);
      // Procés C: mínim cap a les 04:30, pic cap a les 17:00, petita davallada postprandial a les 14:30
      const Cval = 48 + 26*Math.sin((hod - 10.5)/24*Math.PI*2) - 5*Math.exp(-Math.pow((hod-14.5)/1.6,2));
      // Procés S: puja exponencialment despert, baixa dormint
      if(t>7){
        if(asleep){
          S = S * Math.exp(-0.5/4.2) + 8*(1-Math.exp(-0.5/4.2));
        } else {
          S = S + (100 - S)*(1 - Math.exp(-0.5/18.2));
        }
      }
      // Efecte cafè a les 17:00: emmascara temporalment la percepció d'adenosina (no l'elimina!)
      let Sperc=S;
      if(sc==="cafe" && t>=17 && t<=26){
        const dt=t-17;
        const mask=24*Math.exp(-Math.pow((dt-1.8)/3.8,2));
        Sperc=Math.max(12, S - mask);
      }
      pts.push({t, hod, S, Sperc, C:Cval, asleep});
    }
    return pts;
  }

  let updateView=null;
  V.mount(el,(box,w)=>{
    const mob=w<640, h=mob?290:330, m={t:24,r:18,b:34,l:38};
    const s=V.svg(box,w,h,"Simulador del model de dos processos de Borbély al llarg de 36 hores: la pressió d'adenosina (vermell) puja mentre estem desperts i baixa dormint; el ritme circadià (blau) oscil·la cada 24 hores.");
    const g=s.append("g"), gDyn=s.append("g"), gCur=s.append("g");
    const tp=V.tip(box);

    const x=d3.scaleLinear([7,43],[m.l,w-m.r]);
    const y=d3.scaleLinear([0,100],[h-m.b,m.t]);

    // Franja solar subtil a la part superior (07–20 i 31–43)
    [[7,20],[31,43]].forEach(([a,b])=>{
      g.append("rect").attr("x",x(a)).attr("y",m.t).attr("width",x(b)-x(a)).attr("height",6).attr("fill",C.groc).attr("fill-opacity",.45);
    });
    V.gridY(g, y, 0, w-m.r, [0,25,50,75,100], v=>v, {unit:" %"});
    V.axisX(g, x, h-m.b, mob?[7,15,23,31,39]:[7,11,15,19,23,27,31,35,39,43], t=>{
      const hh=Math.floor(((t%24)+24)%24);
      return (hh<10?"0":"")+hh+":00";
    }, {tick:true});

    const lineS=d3.line(d=>x(d.t), d=>y(d.S)).curve(d3.curveMonotoneX);
    const lineSp=d3.line(d=>x(d.t), d=>y(d.Sperc)).curve(d3.curveMonotoneX);
    const lineC=d3.line(d=>x(d.t), d=>y(d.C)).curve(d3.curveMonotoneX);

    function render(sc, hour){
      gDyn.selectAll("*").remove();
      const pts=simCurves(sc);

      // Zona de son (si n'hi ha)
      if(sc!=="blanc"){
        gDyn.append("rect").attr("x",x(23)).attr("y",m.t+6).attr("width",x(31)-x(23)).attr("height",h-m.b-m.t-6)
          .attr("fill",C.blau).attr("fill-opacity",.07);
        V.t(gDyn, x(27), m.t+20, "Son nocturn (8 h)", {size:11.5, italic:true, fill:C.blau, anchor:"middle", halo:true});
      } else {
        V.note(gDyn,{x:x(31),y:y(72),tx:x(34.5),ty:y(88),kind:"elbow",anchor:"start",lines:[["Segona alenada (07:00)",true],["el rellotge C puja malgrat 24 h despert"]],size:11.5});
      }

      if(sc==="cafe"){
        // Adenosina real acumulada (puntejada) vs percebuda (sòlida)
        gDyn.append("path").attr("d",lineS(pts)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.4).attr("stroke-dasharray","4 3").attr("stroke-opacity",.7);
        gDyn.append("path").attr("d",lineSp(pts)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.4);
        V.note(gDyn,{x:x(19),y:y(48),tx:x(21),ty:y(28),kind:"straight",anchor:"start",lines:[["Cafè 17:00",true],["bloqueja receptors però no elimina adenosina"]],size:11.5});
      } else {
        gDyn.append("path").attr("d",lineS(pts)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.4);
      }
      gDyn.append("path").attr("d",lineC(pts)).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2.2);

      // Cursor vertical interactiu
      gCur.selectAll("*").remove();
      const p=d3.least(pts, d=>Math.abs(d.t-hour));
      const px=x(p.t), sVal=sc==="cafe"?p.Sperc:p.S;
      gCur.append("line").attr("x1",px).attr("x2",px).attr("y1",m.t+6).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-dasharray","2 2.5");
      // Segment vertical de la distància (pressió neta de son)
      gCur.append("line").attr("x1",px).attr("x2",px).attr("y1",y(sVal)).attr("y2",y(p.C)).attr("stroke",sVal>p.C?C.vermell:C.blau).attr("stroke-width",3).attr("stroke-opacity",.45);
      gCur.append("circle").attr("cx",px).attr("cy",y(sVal)).attr("r",4.5).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.3);
      gCur.append("circle").attr("cx",px).attr("cy",y(p.C)).attr("r",4.5).attr("fill",C.blau).attr("stroke","#fff").attr("stroke-width",1.3);

      const hh=Math.floor(((p.t%24)+24)%24), mm=(p.t%1)?30:0;
      const hStr=`${hh<10?"0":""}${hh}:${mm?"30":"00"}`;
      const diff=Math.round(sVal - p.C);
      const estat=p.asleep?"Dormint: l'adenosina es neteja":
                  diff>22?"Somnolència alta (S supera molt C)":
                  diff>5?"Inici de pressió de son":
                  "Alerta estable (C compensa S)";
      tp.show(`<b>${hStr}</b> · Adenosina ${Math.round(p.S)} % · Circadià ${Math.round(p.C)} %<br>${estat}`);
    }

    // Hover directe sobre el gràfic mou el cursor
    const hit=s.append("rect").attr("class","hit").attr("x",m.l).attr("y",m.t).attr("width",w-m.l-m.r).attr("height",h-m.t-m.b).attr("fill","transparent").style("cursor","crosshair");
    V.hover(hit.node(), (ev,[px])=>{
      const hh=Math.round(Math.max(7,Math.min(43,x.invert(px)))*2)/2;
      curH=hh; rng.value=hh;
      const h24=Math.floor(((hh%24)+24)%24), mm=(hh%1)?30:0;
      rng.setAttribute("aria-valuetext",`${h24<10?"0":""}${h24}:${mm?"30":"00"}`);
      render(scen,curH);
    }, ()=>{});

    updateView=()=>render(scen,curH);
    render(scen,curH);
  });

  rng.addEventListener("input",()=>{
    curH=+rng.value;
    const h24=Math.floor(((curH%24)+24)%24), mm=(curH%1)?30:0;
    rng.setAttribute("aria-valuetext",`${h24<10?"0":""}${h24}:${mm?"30":"00"}`);
    if(updateView)updateView();
  });
  document.querySelectorAll("#f-borbely .seg button").forEach(b=>{
    b.addEventListener("click",()=>{
      document.querySelectorAll("#f-borbely .seg button").forEach(o=>o.setAttribute("aria-pressed",o===b));
      scen=b.dataset.k;
      if(updateView)updateView();
    });
  });
})();

/* =====================================================================
   SCROLLY 1 · 8 HORES PER DINS: HIPNOGRAMA + ONES EEG ANIMADES
   ===================================================================== */
(function nitScrolly(){
  const el=$("#nit-viz"), lg=$("#nit-lg"), sc=$("#s-nit");
  if(!el||!sc)return;
  let stepKey="n1", loopCtrl=null;

  // Fases: 0=Vigília, 1=REM, 2=N1, 3=N2, 4=N3 (profund)
  const HYP=[
    [0,0],[0.12,2],[0.28,3],[0.55,4],[1.22,4],[1.38,3],[1.52,1],[1.68,1],
    [1.76,3],[2.05,4],[2.62,4],[2.85,3],[3.02,1],[3.30,1],
    [3.42,3],[3.80,4],[4.05,4],[4.35,3],[4.58,1],[4.98,1],
    [5.12,3],[5.75,3],[6.00,1],[6.52,1],
    [6.68,3],[7.15,3],[7.30,1],[7.82,1],[7.92,2],[8.0,0]
  ];
  const HEADS={
    n1:["Minuts 0–15: la transició N1","Les ones ràpides de vigília s'alenteixen mentre es tanquen les portes sensorials"],
    n2:["Fase N2 (~50 % de la nit): fusos de son","Esclats de 12–14 Hz transfereixen records de l'hipocamp a l'escorça"],
    n3:["Fase N3 (primera meitat): ones lentes delta","Recalibratge sinàptic, polsos de líquid cefaloraquidi i reparació cel·lular"],
    rem:["Fase REM (segona meitat): el son paradoxal","Activitat cerebral intensa, somnis vívids i atonia muscular protectora"],
    tot:["Quatre o cinc cicles asimètrics","Retallar a 6 hores amputa sobretot l'últim gran bloc de son REM"]
  };
  V.legendCat(lg,[
    {c:C.blau,    t:"Son profund N3 (ones lentes)"},
    {c:C.vermell, t:"Son REM (somnis i atonia)"},
    {c:C.ink2,    t:"N1 / N2 / Vigília", kind:"line", w:1.8}
  ]);

  let redrawStep=null;
  V.mount(el,(box,w)=>{
    if(loopCtrl){ loopCtrl.stop(); loopCtrl=null; }
    const mob=w<640, h=mob?340:425, m={t:18,r:16,b:18,l:mob?50:62};
    const s=V.svg(box,w,h,"Hipnograma esquemàtic de 8 hores de son humà amb cinc cicles ultradians: el son profund N3 predomina a la primera meitat de la nit i el son REM s'allarga a les darreres hores; a sota, l'ona elèctrica EEG de la fase activa.");
    const gHyp=s.append("g"), gEEG=s.append("g");
    const tp=V.tip(box);

    const hypH=mob?198:248;
    const x=d3.scaleLinear([0,8],[m.l,w-m.r]);
    const y=d3.scaleLinear([0,4],[m.t+10, hypH]);
    const stNames=["Vigília","REM","N1","N2","N3"];

    stNames.forEach((nm,i)=>{
      gHyp.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(i)).attr("y2",y(i)).attr("stroke",C.grid);
      V.t(gHyp, m.l-8, y(i)+4, nm, {size:11.5, weight:i===1||i===4?700:400, fill:i===1?C.vermell:i===4?C.blau:C.muted, anchor:"end"});
    });
    V.axisX(gHyp, x, hypH+12, [0,1,2,3,4,5,6,7,8], d=>d+" h", {tick:true});

    // Blocs translúcids per destacar N3 (blau) i REM (vermell)
    const n3Blocks=[[0.55,1.22],[2.05,2.62],[3.80,4.05]];
    const remBlocks=[[1.52,1.68],[3.02,3.30],[4.58,4.98],[6.00,6.52],[7.30,7.82]];

    const bN3=gHyp.selectAll("rect.n3").data(n3Blocks).join("rect").attr("class","n3")
      .attr("x",d=>x(d[0])).attr("y",y(4)-14).attr("width",d=>x(d[1])-x(d[0])).attr("height",26)
      .attr("rx",4).attr("fill",C.blau).attr("fill-opacity",.28).style("mix-blend-mode","multiply");
    const bREM=gHyp.selectAll("rect.rem").data(remBlocks).join("rect").attr("class","rem")
      .attr("x",d=>x(d[0])).attr("y",y(1)-14).attr("width",d=>x(d[1])-x(d[0])).attr("height",26)
      .attr("rx",4).attr("fill",C.vermell).attr("fill-opacity",.30).style("mix-blend-mode","multiply");

    // Línia d'hipnograma escalonada suau
    const hypPath=gHyp.append("path").attr("d",d3.line(d=>x(d[0]),d=>y(d[1])).curve(d3.curveStepAfter)(HYP))
      .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",2);

    // Tall de les 6 hores (es mostra al pas final "tot")
    const cut6=gHyp.append("g").style("opacity",0);
    cut6.append("line").attr("x1",x(6)).attr("x2",x(6)).attr("y1",m.t).attr("y2",hypH+12).attr("stroke",C.vermell).attr("stroke-width",1.4).attr("stroke-dasharray","3 3");
    cut6.append("rect").attr("x",x(6)).attr("y",m.t).attr("width",x(8)-x(6)).attr("height",hypH-m.t+12).attr("fill",C.vermell).attr("fill-opacity",.06);
    V.t(cut6, x(6)-6, m.t+14, "Tall a 6 h → perds el REM final", {size:11.5, weight:700, fill:C.vermell, anchor:"end", halo:true});

    // Hover sobre l'hipnograma
    const hvLine=gHyp.append("line").attr("y1",m.t).attr("y2",hypH+12).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2").style("display","none");
    const hit=gHyp.append("rect").attr("class","hit").attr("x",m.l).attr("y",m.t).attr("width",w-m.l-m.r).attr("height",hypH-m.t+12).attr("fill","transparent").style("cursor","crosshair");
    V.hover(hit.node(), (ev,[px])=>{
      const hr=Math.max(0,Math.min(8,x.invert(px)));
      let st=0;
      for(let i=0;i<HYP.length;i++){ if(HYP[i][0]<=hr)st=HYP[i][1]; }
      hvLine.attr("x1",x(hr)).attr("x2",x(hr)).style("display",null);
      const desc=["Vigília / microdespertar","Son REM (somnis i atonia muscular)","N1 (transició lleugera)","N2 (fusos de son i memòria)","N3 (ones lentes profundes)"][st];
      tp.show(`<b>Hora ${f1(hr)} de la nit</b><br>${desc}`);
    }, ()=>{ hvLine.style("display","none"); tp.hide(); });

    // Banda inferior: ona EEG animada (molt serena)
    const eTop=hypH+48, eH=h-eTop-14, eMid=eTop+eH*.54;
    gEEG.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",eMid).attr("y2",eMid).attr("stroke",C.grid);
    const eegTitle=V.t(gEEG, m.l, eTop-4, "", {size:12, weight:700, fill:C.ink});
    const eegPath=gEEG.append("path").attr("fill","none").attr("stroke-width",1.8);

    function drawEEG(phase, k){
      const N=180, pts=[], x0=m.l, x1=w-m.r;
      const col=k==="n3"?C.blau:k==="rem"?C.vermell:C.ink;
      for(let i=0;i<=N;i++){
        const u=i/N, xx=x0+(x1-x0)*u;
        let yv=0;
        if(k==="n3"){
          // Ones delta lentes, grans i sincronitzades (0,5–4 Hz)
          yv=Math.sin((u*4.2 - phase)*Math.PI*2)*(eH*.38) + Math.sin((u*8.4 - phase*1.4)*Math.PI*2)*(eH*.09);
        } else if(k==="n2"){
          // Base moderada amb dos esclats de «fusos de son» (12–14 Hz)
          const sp1=Math.exp(-Math.pow((u-0.30)/0.07,2)), sp2=Math.exp(-Math.pow((u-0.72)/0.07,2));
          yv=Math.sin((u*7 - phase)*Math.PI*2)*(eH*.12) + (sp1+sp2)*Math.sin((u*42 - phase*3)*Math.PI*2)*(eH*.30);
        } else if(k==="rem"){
          // Ones ràpides, irregulars i de baixa amplitud (semblants a la vigília)
          yv=(Math.sin((u*28 - phase*2.2)*Math.PI*2)*0.5 + Math.sin((u*43 - phase*3.1)*Math.PI*2)*0.35 + Math.sin((u*17 + phase)*Math.PI*2)*0.25)*(eH*.22);
        } else {
          // N1 / transició theta suau
          yv=(Math.sin((u*11 - phase*1.4)*Math.PI*2)*0.65 + Math.sin((u*23 - phase*2)*Math.PI*2)*0.25)*(eH*.18);
        }
        pts.push([xx, eMid+yv]);
      }
      eegPath.attr("d",d3.line()(pts)).attr("stroke",col);
    }

    function applyStep(k){
      stepKey=k;
      const hd=HEADS[k]||HEADS.n1;
      $("#nit-t").textContent=hd[0]; $("#nit-s").textContent=hd[1];
      bN3.transition().duration(400).attr("fill-opacity", k==="n3"||k==="tot"?.44:.14);
      bREM.transition().duration(400).attr("fill-opacity", k==="rem"||k==="tot"?.44:.14);
      cut6.transition().duration(400).style("opacity", k==="tot"?1:0);
      eegTitle.text(
        k==="n3"?"Senyal EEG en N3: ones delta lentes i de gran amplitud (0,5–4 Hz)":
        k==="n2"?"Senyal EEG en N2: base suau amb esclats de «fusos de son» (12–14 Hz)":
        k==="rem"?"Senyal EEG en REM: activitat ràpida i desincronitzada (com despert)":
        k==="tot"?"Senyal EEG: alternança cíclica de ritmes durant 8 hores":
        "Senyal EEG en N1: transició d'ones alfa a ones theta (4–7 Hz)"
      );
      drawEEG(0, k);
    }

    applyStep(stepKey);
    loopCtrl=V.loop(box, t=>{
      drawEEG((t/16000)*2, stepKey);
    });
    redrawStep=applyStep;
  });

  IB.scrolly(sc.querySelector(".steps"), sc.querySelector(".graphic"), (i,st)=>{
    const k=st.dataset.s||"n1";
    stepKey=k;
    if(redrawStep)redrawStep(k);
  });
})();

/* =====================================================================
   SCROLLY 2 · IB-06 · RELLOTGE DE 24 HORES PREINDUSTRIAL I SENTINELLA
   ===================================================================== */
(function antroScrolly(){
  const el=$("#antro-viz"), lg=$("#ant-lg"), sc=$("#s-antropologia");
  if(!el||!sc)return;
  let stepKey="mite";

  const HEADS={
    mite:["Ni deu hores, ni a la posta de sol","Hadza, san i tsimané s'adormen 3,3 h després de la posta i dormen ~6,4 h reals"],
    fred:["Sincronitzats amb el mínim de temperatura","S'adormen quan refresca i es lleven al punt més fred (53–56 min més a l'hivern)"],
    bifasic:["Dos patrons humans: continu als tròpics, bifàsic a l'hivern europeu","El son humà s'adapta a la durada de la nit i a la cultura"],
    sentinella:["L'efecte sentinella: 99,8 % de la nit coberta","33 hadza amb cronotips diferents per edat: només 18 min tots adormits en 20 dies"]
  };
  V.legendCat(lg,[
    {c:C.blau,    t:"Son preindustrial (Yetish et al., 2015)"},
    {c:C.vermell, t:"Vigília nocturna / cronotips (Samson et al., 2017)"},
    {c:C.groc,    t:"Llum solar"}
  ]);

  let redrawStep=null;
  V.mount(el,(box,w)=>{
    const mob=w<640, h=mob?350:430;
    const s=V.svg(box,w,h,"Rellotge polar de 24 hores amb mitjanit a dalt que mostra l'horari real de son dels hadza, san i tsimané (inici 3,3 h després de la posta, despertar al mínim tèrmic), el contrast amb el son bifàsic europeu i el solapament dels 33 cronotips hadza (99,8 % de la nit amb algú despert).");
    const cx=w/2, cy=h/2+4, R=Math.min(w*0.38, h*0.40);
    const tp=V.tip(box);

    // Retícula polar finíssima (mitjanit = 0 rad a dalt, sentit horari)
    V.polarGrid(s, cx, cy, R, 4, 24, {rIn:R*0.26});
    const ang=hr=>(hr/24)*Math.PI*2;
    const arc=(r0,r1,h0,h1)=>d3.arc().innerRadius(r0).outerRadius(r1).startAngle(ang(h0)).endAngle(ang(h1)).cornerRadius(3)();

    // Etiquetes horàries al perímetre
    [0,3,6,9,12,15,18,21].forEach(hh=>{
      const a=ang(hh), lr=R+16;
      const lbl=hh===0?"00:00":hh===6?"06:00":hh===12?"12:00":hh===18?"18:00":`${hh<10?"0":""}${hh}h`;
      V.t(s, cx+lr*Math.sin(a), cy-lr*Math.cos(a)+4, lbl, {size:11, weight:hh%6===0?700:400, fill:hh%6===0?C.ink:C.muted, anchor:"middle"});
    });

    const gC=s.append("g").attr("transform",`translate(${cx},${cy})`);
    // Arc de llum solar (06:15 – 18:15)
    gC.append("path").attr("d",arc(R*0.92, R*1.0, 6.25, 18.25)).attr("fill",C.groc).attr("fill-opacity",.45);
    // Arc de vespre vora el foc (18:15 – 21:35, +3,3 h després de la posta)
    const gFire=gC.append("path").attr("d",arc(R*0.72, R*0.88, 18.25, 21.55))
      .attr("fill",C.vermell).attr("fill-opacity",.26).style("mix-blend-mode","multiply").style("cursor","pointer");
    // Arc de son principal preindustrial (~21:35 – 05:45, període ~7,7 h / son real 6,4 h)
    const gSleep=gC.append("path").attr("d",arc(R*0.66, R*0.88, 21.55, 29.75))
      .attr("fill",C.blau).attr("fill-opacity",.36).style("mix-blend-mode","multiply").style("cursor","pointer");

    // Capa 2: Mínim tèrmic (~05:45) + hivern (+55 min)
    const gCold=gC.append("g").style("opacity",0);
    const aCold=ang(5.75);
    gCold.append("line").attr("x1",R*0.30*Math.sin(aCold)).attr("y1",-R*0.30*Math.cos(aCold))
      .attr("x2",R*0.95*Math.sin(aCold)).attr("y2",-R*0.95*Math.cos(aCold))
      .attr("stroke",C.blauFosc).attr("stroke-width",1.8).attr("stroke-dasharray","3 2");
    gCold.append("circle").attr("cx",R*0.88*Math.sin(aCold)).attr("cy",-R*0.88*Math.cos(aCold)).attr("r",6).attr("fill",C.blauFosc);
    V.t(gCold, R*0.58*Math.sin(aCold)+8, -R*0.58*Math.cos(aCold), "Mínim tèrmic", {size:11.5, weight:700, fill:C.blauFosc, halo:true});
    // Franja extra d'hivern (+53–56 min)
    gCold.append("path").attr("d",arc(R*0.66, R*0.88, 20.65, 21.55)).attr("fill",C.blauFosc).attr("fill-opacity",.32);

    // Capa 3: Son bifàsic europeu (anell interior: 21:00–01:00 + 02:00–06:00)
    const gBip=gC.append("g").style("opacity",0);
    gBip.append("path").attr("d",arc(R*0.42, R*0.58, 21.0, 25.0)).attr("fill",C.vermell).attr("fill-opacity",.30).style("mix-blend-mode","multiply");
    gBip.append("path").attr("d",arc(R*0.42, R*0.58, 26.0, 30.0)).attr("fill",C.vermell).attr("fill-opacity",.30).style("mix-blend-mode","multiply");
    V.t(gBip, 0, -R*0.50+4, "Vigília ~1 h", {size:11, weight:700, fill:C.vermell, anchor:"middle", halo:true});

    // Capa 4: Efecte sentinella (33 adults hadza esglaonats per cronotip d'edat, Samson et al. 2017)
    const gSent=gC.append("g").style("opacity",0);
    const rnd=V.rng(2017);
    const hadza=d3.range(18).map(i=>{
      // De més grans (matiners: 20:30–04:30) a més joves (nocturns: 23:45–07:30)
      const frac=i/17;
      const start=20.4 + frac*3.3 + (rnd()-0.5)*0.4;
      const dur=6.2 + (rnd()-0.5)*1.1;
      return {i, age:Math.round(60 - frac*40), start, end:start+dur};
    });
    const rMin=R*0.30, rMax=R*0.86;
    const sentPaths=gSent.selectAll("path.hz").data(hadza).join("path").attr("class","hz")
      .attr("d",(d,i)=>{
        const r0=rMin + (rMax-rMin)*(i/hadza.length);
        const r1=r0 + (rMax-rMin)/hadza.length - 1.5;
        return arc(r0,r1,d.start,d.end);
      })
      .attr("fill",d=>d.age>45?C.blau:d.age<30?C.vermell:C.blauClar)
      .attr("fill-opacity",.52).style("cursor","pointer");

    sentPaths.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(sentPaths, x=>x.i===d.i, {dim:.48});
      const fmtH=v=>{ const h24=Math.floor(((v%24)+24)%24), mn=Math.round((v%1)*60)%60; return `${h24<10?"0":""}${h24}:${mn<10?"0":""}${mn}`; };
      tp.show(`<b>Cronotip orientatiu (~${d.age} anys)</b><br>Son ${fmtH(d.start)} – ${fmtH(d.end)} · El solapament cobreix el 99,8 % de la nit`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      V.focus(sentPaths,null); tp.hide();
    });

    // Etiqueta central
    const cNum=V.t(gC, 0, -4, "6,4 h", {size:mob?20:24, weight:700, serif:true, anchor:"middle", fill:C.ink});
    const cSub=V.t(gC, 0, 14, "son real mitjà", {size:11.5, anchor:"middle", fill:C.muted});

    gFire.on("pointerenter pointerdown",()=>tp.show("<b>Vespre vora el foc (+3,3 h)</b><br>Hadza, san i tsimané s'adormen entre 2,5 i 4,4 h després de la posta (Yetish et al., 2015)."))
         .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")tp.hide(); });
    gSleep.on("pointerenter pointerdown",()=>tp.show("<b>Son nocturn preindustrial</b><br>5,7–7,1 h de son real (mitjana 6,4 h); eficiència 81–86 %; insomni regular 1,5–2,5 %."))
         .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")tp.hide(); });

    function applyStep(k){
      stepKey=k;
      const hd=HEADS[k]||HEADS.mite;
      $("#ant-t").textContent=hd[0]; $("#ant-s").textContent=hd[1];
      gSleep.transition().duration(450).style("opacity", k==="sentinella"?0:1);
      gFire.transition().duration(450).style("opacity", k==="sentinella"?0:1);
      gCold.transition().duration(450).style("opacity", k==="fred"?1:0);
      gBip.transition().duration(450).style("opacity", k==="bifasic"?1:0);
      gSent.transition().duration(450).style("opacity", k==="sentinella"?1:0);
      if(k==="mite"){ cNum.text("6,4 h").attr("fill",C.blau); cSub.text("mitjana real"); }
      else if(k==="fred"){ cNum.text("+53–56 m").attr("fill",C.blauFosc); cSub.text("més a l'hivern"); }
      else if(k==="bifasic"){ cNum.text("1r + 2n").attr("fill",C.vermell); cSub.text("son hivernal"); }
      else { cNum.text("99,8 %").attr("fill",C.vermell); cSub.text("algú despert"); }
    }
    applyStep(stepKey);
    redrawStep=applyStep;
  });

  IB.scrolly(sc.querySelector(".steps"), sc.querySelector(".graphic"), (i,st)=>{
    const k=st.dataset.s||"mite";
    stepKey=k;
    if(redrawStep)redrawStep(k);
  });
})();

/* =====================================================================
   FIGURA 3 · SON AL LLARG DE LA VIDA (NSF 2015) + PRIVACIÓ 14 DIES (2003)
   ===================================================================== */
(function vidaFig(){
  const el=$("#vida-viz"), lg=$("#vida-lg");
  if(!el)return;
  let mode="edat";

  let redraw=null;
  V.mount(el,(box,w)=>{
    const mob=w<640, h=mob?320:360, m={t:24,r:mob?16:34,b:44,l:38};
    const s=V.svg(box,w,h,"A la primera vista, hores de son recomanades per franja d'edat segons la National Sleep Foundation (de 14–17 h en nadons a 7–8 h en majors de 65 anys). A la segona vista, acumulació de lapses d'atenció durant 14 dies dormint 4, 6 o 8 hores segons el model de Van Dongen et al. (2003).");
    const g=s.append("g");
    const tp=V.tip(box);

    function draw(mMode){
      g.selectAll("*").remove();
      lg.innerHTML="";
      if(mMode==="edat"){
        V.legendCat(lg,[
          {c:C.blau,    t:"Rang recomanat (NSF, 2015)"},
          {c:C.blauClar,t:"Pot ser apropiat", a:.55},
          {c:C.vermell, t:"Pic de cronotip nocturn (~20 anys)"}
        ]);
        const data=D.nsf;
        const x=d3.scaleBand(data.map(d=>d.id),[m.l,w-m.r]).padding(0.28);
        const y=d3.scaleLinear([4,20],[h-m.b,m.t]);
        V.gridY(g,y,0,w-m.r,[4,8,12,16,20],v=>v,{unit:" h/dia"});

        // Bandes suaus d'àrea + punts centrals
        const areaOk=d3.area().x(d=>x(d.id)+x.bandwidth()/2).y0(d=>y(d.okMin)).y1(d=>y(d.okMax)).curve(d3.curveMonotoneX);
        const areaRec=d3.area().x(d=>x(d.id)+x.bandwidth()/2).y0(d=>y(d.min)).y1(d=>y(d.max)).curve(d3.curveMonotoneX);
        g.append("path").attr("d",areaOk(data)).attr("fill",C.blauClar).attr("fill-opacity",.22);
        g.append("path").attr("d",areaRec(data)).attr("fill",C.blau).attr("fill-opacity",.28).style("mix-blend-mode","multiply");

        const items=g.selectAll("g.ag").data(data).join("g").attr("class","ag").style("cursor","pointer");
        items.each(function(d){
          const q=d3.select(this), cx=x(d.id)+x.bandwidth()/2, isPeak=d.id==="ado"||d.id==="jov";
          q.append("line").attr("x1",cx).attr("x2",cx).attr("y1",y(d.min)).attr("y2",y(d.max))
            .attr("stroke",d.id==="jov"?C.vermell:C.blau).attr("stroke-width",5).attr("stroke-linecap","round").attr("stroke-opacity",.75);
          q.append("circle").attr("cx",cx).attr("cy",y(d.mid)).attr("r",4).attr("fill",d.id==="jov"?C.vermell:C.ink).attr("stroke","#fff").attr("stroke-width",1.2);
          V.t(q, cx, h-m.b+16, mob?d.age.replace(" mesos","m").replace(" anys","a"):d.lbl, {size:11, anchor:"middle", fill:d.id==="jov"?C.vermell:C.ink2, weight:d.id==="jov"?700:400});
          if(!mob)V.t(q, cx, h-m.b+30, d.age, {size:11, anchor:"middle", fill:C.muted});
          q.append("rect").attr("x",x(d.id)-4).attr("y",m.t).attr("width",x.bandwidth()+8).attr("height",h-m.t-m.b).attr("fill","transparent");
        });

        const jovX=x("jov")+x.bandwidth()/2;
        V.note(g,{x:jovX,y:y(9),tx:jovX-10,ty:y(15.5),kind:"elbow",anchor:"end",lines:[["Cap als 20 anys",true],["pic més nocturn del cronotip (Roenneberg, 2004)"]],size:11.5});

        items.on("pointerenter pointerdown",(ev,d)=>{
          V.focus(items, p=>p.id===d.id, {dim:.48});
          tp.show(`<b>${d.lbl} (${d.age})</b><br>Recomanat: ${d.min}–${d.max} h/dia · Acceptable: ${d.okMin}–${d.okMax} h`);
        }).on("pointerleave",ev=>{
          if(ev.pointerType!=="mouse")return;
          V.focus(items,null); tp.hide();
        });
      } else {
        // Esquema fidel a Van Dongen et al. (2003, SLEEP): 14 dies a 4 h, 6 h, 8 h vs somnolència subjectiva
        V.legendCat(lg,[
          {c:C.vermell, t:"4 h/nit (lapses PVT)", kind:"line", w:2.4},
          {c:C.blau,    t:"6 h/nit (lapses PVT)", kind:"line", w:2.2},
          {c:C.ink2,    t:"8 h/nit (estable)", kind:"line", w:1.6},
          {c:C.vermellClar, t:"Somnolència percebuda (escala qualitativa)", kind:"line", w:1.8, dash:"4 3"}
        ]);
        const days=d3.range(1,15);
        // Lapses PVT orientatius fidels a la Fig. 2 de Van Dongen et al. (2003):
        // 8h ~estable (~1-2), 6h arriba ~10-11 (= 1 nit 24h TSD), 4h arriba ~16-18 (= 2 nits 48h TSD)
        const s8=days.map(d=>[d, 1.3 + (d-1)*0.07]);
        const s6=days.map(d=>[d, 1.4 + (d-1)*0.68]);
        const s4=days.map(d=>[d, 1.5 + (d-1)*1.18]);
        // Somnolència subjectiva (6h): puja ràpid els primers 3 dies i s'estanca!
        const subj6=days.map(d=>[d, 1.8 + 3.4*(1 - Math.exp(-(d-1)/2.2))]);

        const x=d3.scaleLinear([1,14],[m.l,w-m.r]);
        const y=d3.scaleLinear([0,20],[h-m.b,m.t]);
        V.gridY(g,y,0,w-m.r,[0,5,10,15,20],v=>v,{zero:0,unit:" lapses PVT"});
        V.axisX(g,x,h-m.b,[1,3,5,7,10,12,14],d=>"Dia "+d,{tick:true});

        // Llindars de privació total (24 h ≈ 10 lapses; 48 h ≈ 17 lapses)
        V.rule(g, m.l, w-m.r, y(10.2), {stroke:C.blau});
        V.t(g, m.l+6, y(10.2)-5, "Equivalent a 1 nit sencera sense dormir (24 h)", {size:11, italic:true, fill:C.blau, halo:true});
        V.rule(g, m.l, w-m.r, y(16.8), {stroke:C.vermell});
        V.t(g, m.l+6, y(16.8)-5, "Equivalent a 2 nits sense dormir (48 h)", {size:11, italic:true, fill:C.vermell, halo:true});

        const ln=d3.line(d=>x(d[0]), d=>y(d[1])).curve(d3.curveMonotoneX);
        g.append("path").attr("d",ln(s8)).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1.6);
        g.append("path").attr("d",ln(subj6)).attr("fill","none").attr("stroke",C.vermellClar).attr("stroke-width",2).attr("stroke-dasharray","4 3");
        g.append("path").attr("d",ln(s6)).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2.3);
        g.append("path").attr("d",ln(s4)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.5);

        V.t(g, x(14)-4, y(s4[13][1])-8, "4 h/nit", {size:12, weight:700, fill:C.vermell, anchor:"end", halo:true});
        V.t(g, x(14)-4, y(s6[13][1])-8, "6 h/nit", {size:12, weight:700, fill:C.blau, anchor:"end", halo:true});
        V.t(g, x(14)-4, y(subj6[13][1])-8, "Sensació subjectiva (s'estanca)", {size:11.5, italic:true, fill:C.ink2, anchor:"end", halo:true});
        V.t(g, x(14)-4, y(s8[13][1])-7, "8 h/nit", {size:11.5, fill:C.muted, anchor:"end", halo:true});

        // Hover vertical per dia
        const hvL=g.append("line").attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2").style("display","none");
        const hit=g.append("rect").attr("class","hit").attr("x",m.l).attr("y",m.t).attr("width",w-m.l-m.r).attr("height",h-m.t-m.b).attr("fill","transparent").style("cursor","crosshair");
        V.hover(hit.node(), (ev,[px])=>{
          const d=Math.round(Math.max(1,Math.min(14,x.invert(px))));
          hvL.attr("x1",x(d)).attr("x2",x(d)).style("display",null);
          tp.show(`<b>Dia ${d} de restricció</b> (esquema Van Dongen et al., 2003)<br>4 h: ~${f1(s4[d-1][1])} lapses · 6 h: ~${f1(s6[d-1][1])} · 8 h: ~${f1(s8[d-1][1])}`);
        }, ()=>{ hvL.style("display","none"); tp.hide(); });
      }
    }

    redraw=mMode=>{ mode=mMode; draw(mMode); };
    V.onView(box, ()=>draw(mode));
  });

  document.querySelectorAll("#f-vida .seg button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("#f-vida .seg button").forEach(b=>b.setAttribute("aria-pressed",b===btn));
      if(redraw)redraw(btn.dataset.k);
    });
  });
})();

/* =====================================================================
   FIGURA 4 · IB-42 PENDENTS · DIA VS. FOC ENTRE ELS JU/'HOANSI (Wiessner 2014)
   ===================================================================== */
(function focFig(){
  const el=$("#foc-viz"), lg=$("#foc-lg");
  if(!el||!D.wiessner)return;
  V.legendCat(lg,[
    {c:C.vermell, t:"Es dispara de nit vora el foc", kind:"line", w:2.6},
    {c:C.blau,    t:"Baixa de nit", kind:"line", w:2}
  ]);

  V.mount(el,(box,w)=>{
    const mob=w<640, h=mob?300:340;
    const xL=mob?w*0.38:w*0.30, xR=mob?w*0.64:w*0.70;
    const m={t:34,b:22};
    const s=V.svg(box,w,h,"Gràfic de pendents (IB-42) amb les 174 converses reals dels ju/'hoansi (Wiessner, 2014): les històries i mites passen del 6 % de dia al 81 % vora el foc de nit, mentre queixes (34 % a 7 %) i economia (31 % a 4 %) s'enfonsen.");
    const g=s.append("g");
    const tp=V.tip(box);

    const y=d3.scaleLinear([0,88],[h-m.b,m.t]);
    // Columnes verticals subtils
    [xL,xR].forEach(xx=>g.append("line").attr("x1",xx).attr("x2",xx).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.hair));
    V.t(g, xL, 18, mob?"De dia":"De dia (llum del sol)", {size:mob?12:13, weight:700, anchor:"middle", fill:C.ink});
    V.t(g, xR, 18, mob?"Vora el foc":"De nit (vora el foc)", {size:mob?12:13, weight:700, anchor:"middle", fill:C.vermell});

    const mobNm={stories:"Històries", complaints:"Queixes", economic:"Economia", other:"Bromes/altres"};
    const items=g.selectAll("g.sl").data(D.wiessner).join("g").attr("class","sl").style("cursor","pointer");
    items.each(function(d){
      const q=d3.select(this), isUp=d.dir==="up", col=isUp?C.vermell:C.blau;
      const y1=y(d.day), y2=y(d.night);
      q.append("line").attr("x1",xL).attr("x2",xR).attr("y1",y1).attr("y2",y2)
        .attr("stroke",col).attr("stroke-width",isUp?3:1.9).attr("stroke-opacity",isUp?.9:.68);
      q.append("circle").attr("cx",xL).attr("cy",y1).attr("r",isUp?6:4.2).attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.2);
      q.append("circle").attr("cx",xR).attr("cy",y2).attr("r",isUp?8:4.2).attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.3);
      if(isUp){
        q.append("circle").attr("cx",xR).attr("cy",y2).attr("r",18).attr("fill",C.vermell).attr("fill-opacity",.22).style("mix-blend-mode","multiply");
      }
      // Etiquetes esquerra i dreta separades verticalment
      const lyL=d.id==="complaints"?y1-14:d.id==="economic"?y1+2:d.id==="other"?y1+18:y1+4;
      const lyR=d.id==="other"?y2-13:d.id==="complaints"?y2+2:d.id==="economic"?y2+16:y2+4;
      const shortNm=mob?mobNm[d.id]:d.nom;
      V.t(q, xL-10, lyL, `${d.day} % · ${shortNm}`, {size:mob?11:12, weight:isUp?700:400, anchor:"end", fill:isUp?C.vermell:C.ink2, halo:true});
      V.t(q, xR+10, lyR, `${d.night} %${isUp?(mob?" · Històries":" · Històries i mites"):""}`, {size:mob?11:12.5, weight:isUp?700:600, anchor:"start", fill:isUp?C.vermell:C.ink2, halo:true});
      q.append("line").attr("x1",xL).attr("x2",xR).attr("y1",y1).attr("y2",y2).attr("stroke","transparent").attr("stroke-width",18);
    });

    items.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(items, x=>x.id===d.id, {dim:.48});
      tp.show(`<b>${d.nom}</b> (${d.day} % dia → ${d.night} % nit)<br>${d.detall}`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      V.focus(items,null); tp.hide();
    });
  });
})();

/* =====================================================================
   FIGURA 5 · IB-25 · ATLES ETNOGRÀFIC DE LES CULTURES DEL SON
   ===================================================================== */
(function culturesSonFig(){
  const el=$("#cson-viz"), lg=$("#cson-lg");
  if(!el||!D.sleepCultures)return;
  let filter="tots", applyFilter=null;
  const CAT={
    social:{c:C.vermell, t:"Son compartit, foc i sentinella"},
    temps: {c:C.blau,    t:"Horaris culturals i son en públic"},
    somnis:{c:C.groc,    t:"Narració comunitària dels somnis"}
  };
  V.legendCat(lg,[
    {c:C.vermell, t:CAT.social.t},
    {c:C.blau,    t:CAT.temps.t},
    {c:C.groc,    t:CAT.somnis.t}
  ]);

  V.mount(el,(box,w)=>{
    const mob=w<640, h=Math.round(Math.min(mob?270:430, w*0.52));
    const s=V.svg(box,w,h,"Mapa mundial en projecció Equal Earth amb set estudis antropològics i històrics del son: ju/'hoansi, hadza, Egipte, Europa preindustrial, Japó (inemuri), tsimané i comunitats americanes de narració de somnis.");
    const gMap=s.append("g"), gPts=s.append("g");
    const tp=V.tip(box);

    V.world().then(world=>{
      gMap.selectAll("*").remove(); gPts.selectAll("*").remove();
      const proj=d3.geoEqualEarth().fitExtent([[6,10],[w-6,h-10]], {type:"Sphere"});
      const path=d3.geoPath(proj);
      gMap.append("path").datum(world.land).attr("d",path).attr("fill",C.land);
      gMap.append("path").datum(world.borders).attr("d",path).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.6);

      const sites=gPts.selectAll("g.sc").data(D.sleepCultures).join("g").attr("class","sc").style("cursor","pointer");
      sites.each(function(d){
        const q=d3.select(this), p=proj([d.lon,d.lat]);
        if(!p)return;
        const [x,y]=p, col=CAT[d.cat].c;
        const rad=mob?13:20;
        q.append("circle").attr("class","halo").attr("cx",x).attr("cy",y).attr("r",rad)
          .attr("fill",col).attr("fill-opacity",d.cat==="somnis"?.46:.30).style("mix-blend-mode","multiply");
        q.append("circle").attr("class","core").attr("cx",x).attr("cy",y).attr("r",3.8)
          .attr("fill",d.cat==="somnis"?C.ink:col).attr("stroke","#fff").attr("stroke-width",1.3);
        const showLab=!mob || d.id==="europa" || d.id==="japo" || d.id==="juhoansi" || d.id==="somnis";
        if(showLab){
          const tx=Math.max(10, Math.min(w-10, x+(mob?d.dx*.7:d.dx)));
          const ty=Math.max(16, Math.min(h-8, y+(mob?d.dy*.75:d.dy)));
          const anc=tx<95?"start":tx>w-95?"end":d.anc;
          V.t(q, tx, ty, d.nom.split(" (")[0], {size:mob?11:12, weight:700, anchor:anc, fill:C.ink, halo:true});
        }
        q.append("circle").attr("cx",x).attr("cy",y).attr("r",24).attr("fill","transparent");
      });

      sites.on("pointerenter pointerdown",(ev,d)=>{
        V.focus(sites, x=>x.id===d.id, {dim:.48});
        sites.select(".core").attr("r",x=>x.id===d.id?5.2:3.8);
        tp.show(`<b>${d.nom}</b> (${d.lloc})<br>${d.resum}`);
      }).on("pointerleave",ev=>{
        if(ev.pointerType!=="mouse")return;
        if(applyFilter)applyFilter(filter);
        sites.select(".core").attr("r",3.8);
        tp.hide();
      });

      applyFilter=k=>{
        filter=k;
        if(k==="tots") V.focus(sites, null);
        else V.focus(sites, d=>d.cat===k, {dim:.48});
      };
      applyFilter(filter);
    });
  });

  document.querySelectorAll("#f-cultures-son .seg button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("#f-cultures-son .seg button").forEach(b=>b.setAttribute("aria-pressed",b===btn));
      filter=btn.dataset.k;
      if(applyFilter)applyFilter(filter);
    });
  });
})();

})();
