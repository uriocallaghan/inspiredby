/* «Per què riem?» — visualitzacions del sistema infogràfic IB (d3 7.9.0 + IBV).
   Totes les figures segueixen P1–P10: fons de paper blanc, paleta vermell/blau/groc,
   mai text en groc, cercles translúcids multiply, hover suau (≥ 0,48) i lectura fixa (.ibv-dock). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.RIEM_DATA;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);

/* =====================================================================
   FIGURA 1 · PART-01 / PART-04 · 1.200 RIALLES AL CARRER (Provine, 1993)
   100 unitats translúcides (1 cercle = 12 rialles) que volen entre 3 vistes.
   ===================================================================== */
(function provineFig(){
  const el=$("#provine-viz"), lg=$("#provine-lg");
  if(!el)return;
  let mode="humor";
  const VIEWS={
    humor:{
      groups:[
        {k:"humor", n:18, c:C.vermell, t:"Després d'un comentari graciós (< 20 %)", s:"Menys d'1 de cada 5 rialles segueix un acudit o una frase enginyosa"},
        {k:"banal", n:82, c:C.blau,    t:"Després de frases quotidianes (> 80 %)", s:"«On has estat?», «Ja ens veurem», «N'estàs segur?»"}
      ]
    },
    rol:{
      groups:[
        {k:"parlant", n:59, c:C.vermell, t:"Qui parla (~59 % · +46 % més)", s:"El parlant riu molt més que qui l'escolta (dones parlants +127 % davant homes)"},
        {k:"oient",   n:41, c:C.blau,    t:"Qui escolta (~41 %)", s:"L'audiència acompanya o respon a la senyalització del parlant"}
      ]
    },
    puntuacio:{
      groups:[
        {k:"pausa", n:99, c:C.blau,    t:"En pauses entre frases (99,3 %)", s:"1.192 de 1.200 casos respecten l'estructura de la frase com un signe de puntuació"},
        {k:"talla", n:1,  c:C.vermell, t:"Talla una frase (0,7 %)", s:"Només 8 interrupcions en 1.200 episodis — i sempre del mateix parlant"}
      ]
    }
  };
  const dots=d3.range(100).map(i=>({i}));
  let updateView=null, clearFocus=null;
  document.addEventListener("pointerdown", ev=>{
    if(clearFocus && !el.contains(ev.target)) clearFocus();
  });

  function renderLegend(v){
    lg.innerHTML="";
    V.legendCat(lg, v.groups.map(g=>({c:g.c, t:g.t, a:.62})));
  }

  V.mount(el,(box,w)=>{
    const mob=w<640, h=mob?330:300;
    const s=V.svg(box,w,h,"Cent cercles translúcids representen els 1.200 episodis naturals de rialla enregistrats per Provine (1993): menys del 20 % segueixen humor, el parlant riu un 46 % més que l'oient i el 99,3 % cauen en pauses entre frases.");
    const g=s.append("g");
    const gLabels=g.append("g");
    const gDots=g.append("g");
    const tp=V.tip(box);

    const circles=gDots.selectAll("circle").data(dots,d=>d.i).join("circle")
      .attr("r",0).style("mix-blend-mode","multiply").style("cursor","pointer");

    function layout(m, instant){
      const v=VIEWS[m];
      renderLegend(v);
      const gs=v.groups;
      let idx=0;
      const r=mob?7.5:9.2, gap=mob?18.5:23;
      const topY=mob?58:62;
      const colsA=mob?10:10;
      const groupGap=mob?28:48;
      // Col·loquem els dos blocs costat a costat (escriptori) o apilats (mòbil)
      const coords=[];
      if(!mob){
        // Blocs proporcionals en columnes centrades
        const totalCols=20;
        const c1=Math.max(2, Math.min(18, Math.round(gs[0].n/5)));
        const c2=Math.max(2, totalCols-c1);
        const colsPer=[c1, c2];
        const blockW=colsPer.map(c=>(c-1)*gap+r*2);
        const totalW=blockW[0]+groupGap+blockW[1];
        const xStart=Math.max(16,(w-totalW)/2)+r;
        const xs=[xStart, xStart+blockW[0]+groupGap];
        gs.forEach((gr,gi)=>{
          const cols=colsPer[gi];
          const rows=Math.ceil(gr.n/cols);
          const ox=xs[gi];
          const oy=topY+((10-Math.min(10,rows))*gap)*0.15;
          for(let k=0;k<gr.n;k++){
            const col=k%cols, row=Math.floor(k/cols);
            coords[idx]={x:ox+col*gap, y:oy+row*gap, c:gr.c, g:gr, gi};
            idx++;
          }
          gr._cx=ox+(Math.min(gr.n,cols)-1)*gap/2;
          gr._x0=ox-r; gr._y0=oy-24;
        });
      } else {
        let curY=topY;
        const ox=Math.max(18,(w-(colsA-1)*gap)/2);
        gs.forEach((gr,gi)=>{
          const rows=Math.ceil(gr.n/colsA);
          gr._x0=ox-r; gr._y0=curY-18;
          for(let k=0;k<gr.n;k++){
            const col=k%colsA, row=Math.floor(k/colsA);
            coords[idx]={x:ox+col*gap, y:curY+row*gap, c:gr.c, g:gr, gi};
            idx++;
          }
          curY+=rows*gap+44;
        });
      }
      dots.forEach((d,i)=>Object.assign(d, coords[i]));
      const dur=instant||V.reduced?0:760;
      circles.transition().duration(dur).delay((d,i)=>instant||V.reduced?0:(i%10)*18)
        .ease(d3.easeCubicInOut)
        .attr("cx",d=>d.x).attr("cy",d=>d.y).attr("r",r)
        .attr("fill",d=>d.c).attr("fill-opacity",d=>d.c===C.vermell?.52:.38);

      gLabels.selectAll("*").remove();
      gs.forEach(gr=>{
        const pctTxt=m==="humor"?(gr.k==="humor"?"< 20 %":"> 80 %"):
                     m==="puntuacio"?(gr.k==="pausa"?"99,3 % (1.192)":"0,7 % (8 casos)"):
                     (gr.k==="parlant"?"~59 % (+46 % més)":"~41 %");
        V.t(gLabels, Math.max(8,gr._x0), gr._y0, `${pctTxt} · ${gr.k==="humor"?"Humor":gr.k==="banal"?"Frases banals":gr.k==="parlant"?"Qui parla":gr.k==="oient"?"Qui escolta":gr.k==="pausa"?"En pauses":"Interromp frase"}`,
          {size:mob?12:13, weight:700, fill:gr.c===C.vermell?C.vermell:C.ink, halo:true});
      });
    }

    clearFocus=()=>{
      V.focus(circles,null);
      circles.attr("stroke",null);
      tp.hide();
    };
    circles.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(circles, x=>x.gi===d.gi, {dim:.48});
      circles.attr("stroke",x=>x.i===d.i?C.ink:null).attr("stroke-width",x=>x.i===d.i?1.5:0);
      tp.show(`<b>${d.g.t}</b><br>${d.g.s}`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      clearFocus();
    });

    updateView=(m,inst)=>{ mode=m; layout(m,inst); };
    V.onView(box, inst=>layout(mode, inst));
  });

  document.querySelectorAll("#f-provine .seg button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("#f-provine .seg button").forEach(b=>b.setAttribute("aria-pressed",b===btn));
      if(updateView)updateView(btn.dataset.k,false);
    });
  });
})();

/* =====================================================================
   SCROLLY 1 · FILOGÈNIA ACÚSTICA I RESPIRACIÓ COMPARADA (Davila-Ross 2009)
   ===================================================================== */
(function evolucioScrolly(){
  const el=$("#evo-viz"), lg=$("#evo-lg"), sc=$("#s-evolucio");
  if(!el||!sc)return;
  let stepKey="animals", loopCtrl=null;

  const HEADS={
    animals:["Almenys 65 espècies vocalitzen jugant","Des dels xiulets ultrasònics de 50 kHz de les rates fins als grans simis"],
    avantpassat:["Un avantpassat rialler fa 10–16 milions d'anys","L'arbre acústic de Davila-Ross et al. (2009) calca la genètica dels homínids"],
    panteix:["El panteix del ximpanzé: entra aire, surt aire","La locomoció quadrúpede lliga la respiració al moviment"],
    egressiu:["Seqüències egressives cada cop més llargues","El bipedisme allibera el tòrax i converteix la rialla humana en 100 % egressiva"],
    cadencia:["El metrònom humà: ~75 ms cada ~210 ms","Ràfegues vocàliques nítides en una sola exhalació (Provine & Yong, 1991)"]
  };
  V.legendCat(lg,[
    {c:C.vermell, t:"Humà (100 % egressiu)"},
    {c:C.blau,    t:"Grans simis (mixt / panteix)"},
    {c:C.groc,    t:"Vocalitzacions de joc en altres mamífers"}
  ]);

  let redrawStep=null, clearFocus=null;
  document.addEventListener("pointerdown", ev=>{
    if(clearFocus && !el.contains(ev.target)) clearFocus();
  });

  V.mount(el,(box,w)=>{
    if(loopCtrl){ loopCtrl.stop(); loopCtrl=null; }
    const mob=w<600;
    const h=mob?Math.round(Math.max(210,Math.min(window.innerHeight*0.30,250))):440;
    const s=V.svg(box,w,h,"Arbre filogenètic acústic de la rialla en orangutans, goril·les, bonobos, ximpanzés i humans (10 a 16 milions d'anys) i esquema del flux respiratori comparat.");
    const gTree=s.append("g"), gWave=s.append("g");
    const tp=V.tip(box);

    const topH=mob?Math.round(h*0.57):248;
    const ml=mob?16:36, mr=mob?102:150;
    const xMa=d3.scaleLinear([16,0],[ml,w-mr]);
    const species=D.hominids;
    const ySp=d3.scalePoint(species.map(d=>d.id),[mob?18:34, topH-(mob?14:16)]);
    const rEgr=d3.scaleSqrt([0,14],[0, mob?12:22]);

    // Eix temporal (milions d'anys)
    V.axisX(gTree, xMa, topH-2, mob?[16,10,6,0]:[16,14,10,6,2,0], d=>d===0?"Avui":`−${d} Ma`, {tick:true});
    // Tronc comú i branques filogenètiques exactes (Pan se separa d'Homo fa ~6 Ma; bonobo/ximpanzé fa ~2 Ma)
    const yRoot=(ySp("ora")+ySp("hum"))/2;
    const yGorHum=(ySp("gor")+ySp("hum"))/2;
    const yPanHum=(ySp("bon")+ySp("hum"))/2;
    const yPan=(ySp("bon")+ySp("xim"))/2;
    const branches=[
      {id:"ora", d:`M${xMa(14)},${yRoot} L${xMa(14)},${ySp("ora")} L${xMa(0)},${ySp("ora")}`},
      {id:"gor", d:`M${xMa(9)},${yGorHum} L${xMa(9)},${ySp("gor")} L${xMa(0)},${ySp("gor")}`},
      {id:"bon", d:`M${xMa(6)},${yPanHum} L${xMa(6)},${yPan} L${xMa(2)},${yPan} L${xMa(2)},${ySp("bon")} L${xMa(0)},${ySp("bon")}`},
      {id:"xim", d:`M${xMa(6)},${yPanHum} L${xMa(6)},${yPan} L${xMa(2)},${yPan} L${xMa(2)},${ySp("xim")} L${xMa(0)},${ySp("xim")}`},
      {id:"hum", d:`M${xMa(6)},${yPanHum} L${xMa(6)},${ySp("hum")} L${xMa(0)},${ySp("hum")}`}
    ];
    // Tronc basal
    gTree.append("line").attr("class","evo-stem").attr("x1",xMa(16)).attr("x2",xMa(14)).attr("y1",yRoot).attr("y2",yRoot).attr("stroke",C.ink2).attr("stroke-width",1.6);
    gTree.append("line").attr("class","evo-stem").attr("x1",xMa(14)).attr("x2",xMa(9)).attr("y1",yRoot).attr("y2",yGorHum).attr("stroke",C.ink2).attr("stroke-width",1.5);
    gTree.append("line").attr("class","evo-stem").attr("x1",xMa(9)).attr("x2",xMa(6)).attr("y1",yGorHum).attr("y2",yPanHum).attr("stroke",C.ink2).attr("stroke-width",1.5);

    const brSel=gTree.selectAll("path.br").data(branches).join("path").attr("class","br")
      .attr("d",b=>b.d)
      .attr("fill","none").attr("stroke",b=>b.id==="hum"?C.vermell:C.blau).attr("stroke-width",b=>b.id==="hum"?2.2:1.4);

    // Node arrel (65 espècies / avantpassat 10-16 Ma)
    const rootDot=gTree.append("circle").attr("cx",xMa(15.2)).attr("cy",yRoot).attr("r",mob?10:18)
      .attr("fill",C.groc).attr("fill-opacity",.45).style("mix-blend-mode","multiply");
    gTree.append("circle").attr("cx",xMa(15.2)).attr("cy",yRoot).attr("r",3.5).attr("fill",C.ink);
    const rootNote=V.lines(
      gTree,
      mob?ml:xMa(15.2)+8,
      mob?topH-34:yRoot-34,
      [["≥ 65 espècies",true],["vocalitzacions de joc"]],
      {size:mob?11:11.5, halo:true}
    );

    // Nodes finals per espècie (cercles translúcids d'àrea proporcional a la màxima seqüència egressiva)
    const nodes=gTree.selectAll("g.sp").data(species).join("g").attr("class","sp").style("cursor","pointer");
    nodes.each(function(d){
      const q=d3.select(this), x=xMa(0), y=ySp(d.id), isH=d.id==="hum";
      const rad=isH?(mob?13:24):rEgr(d.maxEgr);
      q.append("circle").attr("class","aura").attr("cx",x).attr("cy",y).attr("r",rad)
        .attr("fill",isH?C.vermell:C.blau).attr("fill-opacity",isH?.32:.24).style("mix-blend-mode","multiply");
      q.append("circle").attr("cx",x).attr("cy",y).attr("r",3.2).attr("fill",isH?C.vermell:C.blau).attr("stroke","#fff").attr("stroke-width",1.1);
      V.t(q, x+(mob?10:14), y+4, d.nom, {size:mob?11.5:13, weight:isH?700:600, fill:isH?C.vermell:C.ink, halo:true});
      if(!mob){
        V.t(q, x+88, y+4, isH?"100 % egressiu":`màx. ${f1(d.maxEgr)} s`, {size:11.5, fill:C.muted});
      }
      q.append("rect").attr("x",x-24).attr("y",y-16).attr("width",mr+20).attr("height",32).attr("fill","transparent");
    });

    clearFocus=()=>{ V.focus(nodes,null); tp.hide(); };
    nodes.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(nodes, x=>x.id===d.id, {dim:.48});
      tp.show(`<b>${d.nom}</b> (${d.llat})<br>${d.mode} — ${d.desc}`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      clearFocus();
    });

    // Banda inferior: esquema animat de respiració (panteix ximpanzé vs. ha-ha-ha humà)
    const wTop=topH+(mob?26:32), wH=Math.max(36, h-wTop-(mob?6:14)), wMid=wTop+wH*.54;
    gWave.append("line").attr("x1",ml).attr("x2",w-14).attr("y1",wMid).attr("y2",wMid).attr("stroke",C.hair).attr("stroke-width",1);
    const waveTitle=V.t(gWave, ml, wTop+(mob?4:6), "Flux d'aire: panteix del ximpanzé (← inspira · espira →)", {size:mob?11:12, weight:700, fill:C.ink});
    const wavePath=gWave.append("path").attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2);
    const waveFill=gWave.append("path").attr("fill",C.blau).attr("fill-opacity",.12);
    const waveCap=V.t(gWave, w-14, wTop+6, "", {size:11.5, fill:C.muted, anchor:"end"});

    function drawWave(phase, mode){
      const x0=ml, x1=w-14, N=140, pts=[];
      const isHum=(mode==="egressiu"||mode==="cadencia");
      for(let i=0;i<=N;i++){
        const u=i/N, x=x0+(x1-x0)*u;
        let yv=0;
        if(isHum){
          // Ràfegues egressives ~75 ms cada ~210 ms (només per sobre de la línia base: aire cap enfora)
          const cyc=((u*5.5 - phase) % 1 + 1) % 1;
          const burst=cyc<0.36 ? Math.sin((cyc/0.36)*Math.PI) : 0;
          const env=0.55+0.45*Math.sin(u*Math.PI);
          yv = -burst * env * (wH*.38);
        } else {
          // Panteix alternant (exhala amunt, inhala avall)
          const cyc=(u*5.0 - phase)*Math.PI*2;
          const env=0.65+0.35*Math.sin(u*Math.PI);
          yv = -Math.sin(cyc)*env*(wH*.34);
        }
        pts.push([x, wMid+yv]);
      }
      const lineGen=d3.line()(pts);
      wavePath.attr("d",lineGen).attr("stroke",isHum?C.vermell:C.blau);
      waveFill.attr("d",lineGen+` L${x1},${wMid} L${x0},${wMid} Z`).attr("fill",isHum?C.vermell:C.blau).attr("fill-opacity",isHum?.16:.11);
    }

    function applyStep(k){
      stepKey=k;
      const hd=HEADS[k]||HEADS.animals;
      $("#evo-t").textContent=hd[0]; $("#evo-s").textContent=hd[1];
      const isHum=(k==="egressiu"||k==="cadencia");
      waveTitle.text(
        mob ? (isHum?"Flux humà: només exhalació (~75 ms / ~210 ms)":"Ximpanzé: panteix (espira ↑ · inspira ↓)")
            : (isHum?"Flux d'aire humà: només exhalació (ràfegues de ~75 ms cada ~210 ms)":"Flux d'aire en ximpanzés: panteix alternant (espira ↑ · inspira ↓)")
      );
      waveCap.text(mob?"":(isHum?"Exclusivament egressiu":"Alternança in / out"));
      nodes.style("opacity",d=>{
        if(k==="panteix")return d.id==="xim"||d.id==="bon"?1:.5;
        if(k==="egressiu"||k==="cadencia")return d.id==="hum"||d.id==="gor"||d.id==="bon"?1:.5;
        return 1;
      });
      brSel.style("opacity",b=>{
        if(k==="panteix")return b.id==="xim"?1:.48;
        if(k==="cadencia")return b.id==="hum"?1:.48;
        return 1;
      });
      rootDot.attr("fill-opacity",k==="animals"?.65:.3);
      drawWave(0, k);
    }

    applyStep(stepKey);
    // Bucle molt lent i contemplatiu (~22 s per cicle complet)
    loopCtrl=V.loop(box, t=>{
      const ph=(t/22000)*4;
      drawWave(ph, stepKey);
    });
    redrawStep=applyStep;
  });

  IB.scrolly(sc.querySelector(".steps"), sc.querySelector(".graphic"), (i, st)=>{
    const k=st.dataset.s||"animals";
    stepKey=k;
    if(redrawStep)redrawStep(k);
  });
})();

/* =====================================================================
   FIGURA 2 · HOW-01 · TALL CEREBRAL I MORFOLOGIA ACÚSTICA INTERACTIVA
   ===================================================================== */
(function acusticaFig(){
  const el=$("#acustica-viz"), lg=$("#acustica-lg"), rng=$("#acustica-rng"), playBtn=$("#acustica-play");
  if(!el)return;
  let spont=0.90, playing=!V.reduced, loopCtrl=null;

  V.legendCat(lg,[
    {c:C.vermell, t:"Via espontània (subcortical + opioides)"},
    {c:C.blau,    t:"Via voluntària (escorça motora)"},
    {c:C.groc,    t:"Nuclis d'alliberament d'opioides (PET, 2017)"}
  ]);

  const REGIONS=[
    {id:"mot", nom:"Escorça motora", x:0.50, y:0.20, via:"vol", desc:"Controla la parla i la rialla voluntària o educada (Wild et al., 2003)."},
    {id:"pmot",nom:"Àrea premotora mirall", x:0.35, y:0.27, via:"vol", desc:"S'activa automàticament en sentir riure algú altre (Warren et al., 2006)."},
    {id:"caud",nom:"Nucli caudat i tàlem", x:0.49, y:0.48, via:"pet", desc:"Zones amb alliberament directe d'opioides endògens mesurat per PET (Manninen et al., 2017)."},
    {id:"ins", nom:"Ínsula anterior", x:0.34, y:0.52, via:"pet", desc:"Integra l'estat corporal i allibera opioides durant la rialla social (Manninen et al., 2017)."},
    {id:"amig",nom:"Amígdala", x:0.44, y:0.62, via:"esp", desc:"Disparador emocional subcortical de la rialla genuïna."},
    {id:"pag", nom:"Tronc encefàlic (PAG)", x:0.55, y:0.77, via:"esp", desc:"Coordina el diafragma, la laringe i el patró rítmic involuntari."}
  ];

  let refreshState=null, clearFocus=null;
  document.addEventListener("pointerdown", ev=>{
    if(clearFocus && !el.contains(ev.target)) clearFocus();
  });

  V.mount(el,(box,w)=>{
    if(loopCtrl){ loopCtrl.stop(); loopCtrl=null; }
    const narrow=w<600, mob=w<700, h=narrow?520:(mob?460:340);
    const s=V.svg(box,w,h,"Esquema de les dues vies neurals de la rialla (espontània subcortical amb alliberament d'opioides al tàlem, nucli caudat i ínsula, enfront de la via voluntària de l'escorça motora) i ona acústica interactiva.");
    const tp=V.tip(box);

    // Zona 1: tall cerebral esquemàtic
    const bx=mob?w/2:w*0.27, by=mob?120:166, bsc=mob?Math.min(w*0.44,165):Math.min(w*0.24,185);
    const gBrain=s.append("g").attr("transform",`translate(${bx-bsc},${by-bsc*0.78})`);
    const BW=bsc*2, BH=bsc*1.56;

    // Silueta neta de perfil cerebral (sense fons pintat, només traç fi i massa molt tènue)
    const skullPath=`M${BW*.18},${BH*.62} C${BW*.10},${BH*.48} ${BW*.14},${BH*.16} ${BW*.42},${BH*.08} C${BW*.70},${BH*.02} ${BW*.92},${BH*.20} ${BW*.89},${BH*.46} C${BW*.87},${BH*.64} ${BW*.74},${BH*.72} ${BW*.63},${BH*.72} C${BW*.60},${BH*.82} ${BW*.58},${BH*.92} ${BW*.55},${BH*.98} L${BW*.47},${BH*.96} C${BW*.48},${BH*.84} ${BW*.49},${BH*.76} ${BW*.46},${BH*.71} C${BW*.33},${BH*.73} ${BW*.22},${BH*.68} ${BW*.18},${BH*.62} Z`;
    gBrain.append("path").attr("d",skullPath).attr("fill",C.land).attr("fill-opacity",.55).attr("stroke",C.ink2).attr("stroke-width",1.1);
    // Cerebel discret
    gBrain.append("path").attr("d",`M${BW*.63},${BH*.72} C${BW*.76},${BH*.71} ${BW*.82},${BH*.83} ${BW*.68},${BH*.88} C${BW*.61},${BH*.89} ${BW*.58},${BH*.82} ${BW*.60},${BH*.75}`)
      .attr("fill","none").attr("stroke",C.muted).attr("stroke-width",.9);

    // Connexions de les dues vies
    const pathVol=gBrain.append("path").attr("d",`M${BW*.50},${BH*.20} Q${BW*.56},${BH*.45} ${BW*.55},${BH*.77}`)
      .attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2.2).attr("stroke-dasharray","4 3");
    const pathEsp=gBrain.append("path").attr("d",`M${BW*.34},${BH*.52} Q${BW*.46},${BH*.52} ${BW*.49},${BH*.48} M${BW*.44},${BH*.62} Q${BW*.50},${BH*.66} ${BW*.55},${BH*.77} M${BW*.49},${BH*.48} Q${BW*.53},${BH*.61} ${BW*.55},${BH*.77}`)
      .attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.2);

    const regNodes=gBrain.selectAll("g.rg").data(REGIONS).join("g").attr("class","rg").style("cursor","pointer");
    regNodes.each(function(d){
      const q=d3.select(this), x=BW*d.x, y=BH*d.y;
      const col=d.via==="vol"?C.blau:d.via==="pet"?C.groc:C.vermell;
      q.append("circle").attr("class","halo").attr("cx",x).attr("cy",y).attr("r",d.via==="pet"?17:13)
        .attr("fill",col).attr("fill-opacity",d.via==="pet"?.48:.32).style("mix-blend-mode","multiply");
      q.append("circle").attr("cx",x).attr("cy",y).attr("r",3.8).attr("fill",d.via==="pet"?C.vermell:col).attr("stroke","#fff").attr("stroke-width",1.2);
      const tx=d.x<0.42?x-10:x+10, anc=d.x<0.42?"end":"start";
      if(!mob || d.id==="mot" || d.id==="caud" || d.id==="pag"){
        V.t(q, tx, y+4, d.nom, {size:11.5, weight:600, anchor:anc, fill:C.ink, halo:true});
      }
      q.append("circle").attr("cx",x).attr("cy",y).attr("r",18).attr("fill","transparent");
    });

    clearFocus=()=>{ V.focus(regNodes,null); tp.hide(); };
    regNodes.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(regNodes, x=>x.id===d.id, {dim:.5});
      tp.show(`<b>${d.nom}</b><br>${d.desc}`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      clearFocus();
    });

    // Zona 2: perfil acústic en temps real (morfologia espontània vs. voluntària)
    const ax0=mob?14:w*0.56, ax1=w-14;
    const ay0=mob?264:44, ay1=narrow?392:(mob?425:278);
    const gAc=s.append("g");
    const acTitle=V.t(gAc, ax0, ay0-14, "", {size:13, weight:700, fill:C.ink});
    const acSub=V.t(gAc, ax0, ay0+4, "", {size:11.5, fill:C.muted});

    const waveMid=(ay0+ay1)/2+16;
    gAc.append("line").attr("x1",ax0).attr("x2",ax1).attr("y1",waveMid).attr("y2",waveMid).attr("stroke",C.grid);
    const acPath=gAc.append("path").attr("fill","none").attr("stroke-width",2);
    const acBursts=gAc.append("g");
    const metY=narrow?418:(ay1+24);
    const metG=gAc.append("g");

    function updateVisuals(tMs){
      const sp=spont; // 0 = voluntària, 1 = espontània
      pathEsp.attr("stroke-opacity", 0.35 + sp*0.65).attr("stroke-width", 1.4 + sp*1.6);
      pathVol.attr("stroke-opacity", 0.35 + (1-sp)*0.65).attr("stroke-width", 1.4 + (1-sp)*1.6);
      regNodes.each(function(d){
        const active=(d.via==="vol"?(1-sp):sp);
        d3.select(this).select(".halo").attr("fill-opacity", 0.16 + active*0.42);
      });

      const col=sp>=0.5?C.vermell:C.blau;
      acTitle.text(sp>=0.5?"Perfil acústic: rialla espontània":"Perfil acústic: rialla voluntària (social)").attr("fill",col);
      // Valors orientatius dins dels rangs reals (Wood et al. 2017 & Lavan et al. 2016)
      const f0Est=Math.round(290 + sp*135);
      const noteMs=Math.round(105 - sp*30);
      const cadence=(3.6 + sp*1.2).toFixed(1).replace(".",",");
      acSub.text(`To fonamental ~${f0Est} Hz · notes ~${noteMs} ms · ${cadence} notes/s`);

      const N=120, pts=[], ph=(tMs/14000)*3;
      const bursts=Math.round(4 + sp*2);
      const burstPts=[];
      for(let i=0;i<=N;i++){
        const u=i/N, x=ax0+(ax1-ax0)*u;
        const cyc=((u*bursts - ph)%1 + 1)%1;
        const duty=0.52 - sp*0.18;
        const env=Math.sin(u*Math.PI);
        let amp=0;
        if(cyc<duty){
          const local=Math.sin((cyc/duty)*Math.PI);
          const hf=Math.sin(u*(38+sp*28))*0.35 + 0.65;
          amp=local*env*hf*(mob?42:54)*(0.65+0.35*sp);
        }
        pts.push([x, waveMid - amp]);
        if(i>0 && i<N && Math.abs(cyc-duty*0.5)<0.025){
          burstPts.push({x, amp});
        }
      }
      acPath.attr("d",d3.line()(pts)).attr("stroke",col);
      acBursts.selectAll("circle").data(burstPts).join("circle")
        .attr("cx",d=>d.x).attr("cy",waveMid).attr("r",d=>Math.max(5, d.amp*0.36))
        .attr("fill",col).attr("fill-opacity",.22).style("mix-blend-mode","multiply");

      metG.selectAll("*").remove();
      const pills=[
        ["Control conscient", sp>=.5?"Baix (involuntari)":"Alt (deliberat)"],
        ["Alliberament d'opioides", sp>=.5?"Alt (PET 2017)":"Baix"],
        ["Variabilitat del to", sp>=.5?"Alta i aguda":"Uniforme i suau"]
      ];
      if(narrow){
        pills.forEach((p,i)=>{
          const ry=metY+i*32;
          metG.append("line").attr("x1",ax0).attr("x2",ax1).attr("y1",ry-14).attr("y2",ry-14).attr("stroke",C.grid).attr("stroke-width",.7);
          V.t(metG, ax0, ry+3, p[0], {size:11.5, fill:C.muted});
          V.t(metG, ax1, ry+3, p[1], {size:12, weight:600, fill:C.ink, anchor:"end"});
        });
      } else {
        const stepX=(ax1-ax0)/pills.length;
        pills.forEach((p,i)=>{
          V.t(metG, ax0+i*stepX, metY-4, p[0], {size:11, fill:C.muted});
          V.t(metG, ax0+i*stepX, metY+12, p[1], {size:12, weight:600, fill:C.ink});
        });
      }
    }

    refreshState=()=>updateVisuals(0);
    updateVisuals(0);
    let acc=0;
    loopCtrl=V.loop(box,(t,dt)=>{
      if(playing){ acc+=dt; updateVisuals(acc); }
    });
  });

  function setSpont(val){
    spont=val/100;
    rng.value=val;
    rng.setAttribute("aria-valuetext", `${val} %, ${val>=50?"rialla espontània":"rialla voluntària"}`);
    document.querySelectorAll("#f-acustica .seg button").forEach(b=>{
      b.setAttribute("aria-pressed", (b.dataset.k==="espontania") === (val>=50));
    });
    if(refreshState)refreshState();
  }
  rng.addEventListener("input",()=>setSpont(+rng.value));
  document.querySelectorAll("#f-acustica .seg button").forEach(b=>{
    b.addEventListener("click",()=>setSpont(b.dataset.k==="espontania"?90:15));
  });
  playBtn.textContent=playing?"Atura l'ona":"Reprodueix l'ona";
  playBtn.addEventListener("click",()=>{
    playing=!playing;
    playBtn.textContent=playing?"Atura l'ona":"Reprodueix l'ona";
  });
})();

/* =====================================================================
   SCROLLY 2 · EL SOSTRE DEL DESPARASITAT I EL COR DE RIALLES (Dunbar)
   ===================================================================== */
(function groomingScrolly(){
  const el=$("#grm-viz"), lg=$("#grm-lg"), sc=$("#s-grooming");
  if(!el||!sc)return;
  let stepKey="sostre", loopCtrl=null;

  const HEADS={
    sostre:["El sostre del 20 % en primats","El desparasitat físic 1 a 1 escala amb la mida del grup fins a esgotar el dia"],
    bretxa:["La bretxa humana: 150 persones exigeixen massa temps","Mantenir 150 vincles mà a mà requeriria més del 40 % del temps despert"],
    cor:["El multiplicador de la rialla: 3 o 4 persones alhora","Riure en grup redueix a un terç el temps necessari per alliberar endorfines"],
    contagi:["Un cor sincronitzat abans que ho decideixis","Escoltar una rialla activa l'escorça premotora facial de qui la sent"]
  };
  V.legendCat(lg,[
    {c:C.blau,    t:"Desparasitat 1 a 1 (tacte)", kind:"line", w:2},
    {c:C.vermell, t:"Amb rialla en grup (×3)", kind:"line", w:2.2},
    {c:C.ink2,    t:"Límit pràctic (~20 % del dia)", kind:"line", w:1.4, dash:"2 3"}
  ]);

  let redrawStep=null, clearFocus=null;
  document.addEventListener("pointerdown", ev=>{
    if(clearFocus && !el.contains(ev.target)) clearFocus();
  });

  V.mount(el,(box,w)=>{
    if(loopCtrl){ loopCtrl.stop(); loopCtrl=null; }
    const mob=w<600;
    const h=mob?Math.round(Math.max(210,Math.min(window.innerHeight*0.30,250))):410;
    const m={t:mob?16:24,r:mob?14:20,b:mob?30:34,l:mob?34:38};
    const s=V.svg(box,w,h,"Relació entre mida del grup social i percentatge del temps diürn necessari per cohesionar-lo: el desparasitat 1 a 1 topa amb el sostre del 20 % cap als 50 individus; la rialla en grups de 3 a 4 persones multiplica l'abast per tres.");
    const g=s.append("g"), gCont=s.append("g");
    const tp=V.tip(box);

    const x=d3.scaleLinear([0,160],[m.l,w-m.r]);
    const y=d3.scaleLinear([0,46],[h-m.b,m.t]);
    V.gridY(g,y,0,w-m.r,[0,10,20,30,40],v=>v,{zero:0,unit:" % del dia"});
    V.axisX(g,x,h-m.b,mob?[0,50,100,150]:[0,25,50,75,100,125,150],d=>d,{tick:true});
    V.t(g, w-m.r, h-(mob?4:6), "Mida del grup (individus)", {size:11, fill:C.muted, anchor:"end"});

    // Zona de sostre 20%
    V.rule(g, m.l, w-m.r, y(20), {stroke:C.ink2});
    V.t(g, m.l+6, y(20)-6, mob?"Sostre primats (~20 % del dia)":"Sostre pràctic en primats (~20 % del temps actiu)", {size:mob?11:11.5, italic:true, fill:C.ink2, halo:true});

    // Corba 1 a 1 (0,28 % per individu: 70 -> 19,6 %, 150 -> 42,0 %)
    const pts1=d3.range(0,156,5).map(n=>[n, n*0.28]);
    const pts3=d3.range(0,156,5).map(n=>[n, n*0.28/3]);
    const lineGen=d3.line(d=>x(d[0]), d=>y(d[1])).curve(d3.curveMonotoneX);

    const l1Safe=g.append("path").attr("d",lineGen(pts1.filter(d=>d[0]<=70))).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2.2);
    const l1Over=g.append("path").attr("d",lineGen(pts1.filter(d=>d[0]>=70))).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",1.8).attr("stroke-dasharray","5 4");
    const l3=g.append("path").attr("d",lineGen(pts3)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2.5);

    // Punts fita reals/esquemàtics
    const ptsG=g.selectAll("g.ms").data(D.grooming.milestones).join("g").attr("class","ms").style("cursor","pointer");
    ptsG.each(function(d){
      const q=d3.select(this), px=x(d.grup), py=y(d.groomPct);
      q.append("circle").attr("cx",px).attr("cy",py).attr("r",12).attr("fill",d.grup>100?C.vermell:C.blau).attr("fill-opacity",.24).style("mix-blend-mode","multiply");
      q.append("circle").attr("cx",px).attr("cy",py).attr("r",3.6).attr("fill",d.grup>100?C.vermell:C.blau).attr("stroke","#fff").attr("stroke-width",1.2);
      q.append("circle").attr("cx",px).attr("cy",py).attr("r",18).attr("fill","transparent");
    });
    const noteGap=V.note(g,{x:x(150),y:y(42),tx:x(mob?108:112),ty:y(mob?37:41),kind:"straight",anchor:"end",lines:[["150 individus",true],["~42 % del dia mà a mà"]],size:mob?11:11.5});
    const noteLaugh=V.note(g,{x:x(150),y:y(14),tx:x(mob?108:116),ty:y(mob?8:9),kind:"elbow",anchor:"end",lines:[["Amb rialla en grup (×3)",true],["baixa a ~14 % del dia"]],size:mob?11:11.5});

    clearFocus=()=>{ V.focus(ptsG,null); tp.hide(); };
    ptsG.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(ptsG, p=>p.grup===d.grup, {dim:.48});
      tp.show(`<b>${d.nom}</b><br>Grup ~${d.grup} individus · ~${f1(d.groomPct)} % del dia en desparasitat 1 a 1`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      clearFocus();
    });

    // Capa de contagi (pas 4): 4 cercles translúcids d'un grup de rialla natural
    const cx=x(mob?96:105), cy=y(mob?22:26), scG=mob?0.68:1;
    const groupPts=[
      {dx:-36*scG, dy:-8*scG,  c:C.vermell, r:28*scG, t:"Parlant"},
      {dx:18*scG,  dy:-26*scG, c:C.blau,    r:24*scG, t:"Oient 1"},
      {dx:30*scG,  dy:20*scG,  c:C.groc,    r:24*scG, t:"Oient 2"},
      {dx:-10*scG, dy:30*scG,  c:C.blau,    r:22*scG, t:"Oient 3"}
    ];
    const gPulses=gCont.selectAll("circle.pl").data(groupPts).join("circle").attr("class","pl")
      .attr("cx",d=>cx+d.dx).attr("cy",d=>cy+d.dy).attr("r",d=>d.r)
      .attr("fill",d=>d.c).attr("fill-opacity",.32).style("mix-blend-mode","multiply");
    groupPts.forEach(d=>{
      gCont.append("circle").attr("cx",cx+d.dx).attr("cy",cy+d.dy).attr("r",3.2).attr("fill",d.c===C.groc?C.ink:d.c);
    });
    if(mob){
      const ltx=Math.max(8, Math.min(w-8, w-10));
      V.t(gCont, ltx, m.t+8, "Cor natural: 3–4 persones", {size:11.5, weight:700, anchor:"end", halo:true});
      V.t(gCont, ltx, m.t+21, "(Dezecache & Dunbar, 2012)", {size:11, fill:C.muted, anchor:"end", halo:true});
    } else {
      V.t(gCont, cx, cy-58, "Cor natural: 3–4 persones (Dezecache & Dunbar, 2012)", {size:12, weight:700, anchor:"middle", halo:true});
    }

    function applyStep(k){
      stepKey=k;
      const hd=HEADS[k]||HEADS.sostre;
      $("#grm-t").textContent=hd[0]; $("#grm-s").textContent=hd[1];
      l1Safe.transition().duration(450).style("opacity", k==="contagi"?.48:1);
      l1Over.transition().duration(450).style("opacity", k==="sostre"?0:(k==="contagi"?.48:1));
      l3.transition().duration(450).style("opacity", (k==="cor"||k==="contagi")?1:0);
      noteGap.transition().duration(450).style("opacity", (k==="bretxa"||k==="cor")?1:0);
      noteLaugh.transition().duration(450).style("opacity", k==="cor"?1:0);
      ptsG.transition().duration(450).style("opacity", d=>k==="sostre"?(d.grup<=75?1:0):(k==="contagi"?.48:1));
      gCont.transition().duration(450).style("opacity", k==="contagi"?1:0);
    }

    applyStep(stepKey);
    // Polsació molt lenta i serena al pas de contagi (~10 s)
    loopCtrl=V.loop(box, t=>{
      if(stepKey!=="contagi")return;
      gPulses.attr("r",(d,i)=>d.r + Math.sin(t/1600 - i*0.8)*5.5);
    });
    redrawStep=applyStep;
  });

  IB.scrolly(sc.querySelector(".steps"), sc.querySelector(".graphic"), (i,st)=>{
    const k=st.dataset.s||"sostre";
    stepKey=k;
    if(redrawStep)redrawStep(k);
  });
})();

/* =====================================================================
   FIGURA 3 · DADES TRANSCULTURALS (Bryant 2016/2018) + LINK-05 (Wood 2017)
   ===================================================================== */
(function culturesFig(){
  const el=$("#cultures-viz"), lg=$("#cultures-lg");
  if(!el)return;
  V.legendCat(lg,[
    {c:C.vermell, t:"Amics vs. desconeguts (24 societats) · Recompensa"},
    {c:C.blau,    t:"Espontània vs. voluntària (21 societats) · Afiliació"},
    {c:C.groc,    t:"Dominància"}
  ]);

  let clearFocus=null;
  document.addEventListener("pointerdown", ev=>{
    if(clearFocus && !el.contains(ev.target)) clearFocus();
  });

  V.mount(el,(box,w)=>{
    const narrow=w<600, mob=w<720, h=mob?500:310;
    const s=V.svg(box,w,h,"A l'esquerra, rangs de precisió per sobre de l'atzar en 24 societats (53–67 %) i 21 societats (56–69 %) de Bryant et al. A la dreta, mapa conceptual de les tres funcions socials de la rialla: recompensa, afiliació i dominància (Wood et al., 2017).");
    const tp=V.tip(box);

    // ---- Panell A: Dades reals transculturals (Bryant 2016 & 2018) ----
    const ax0=mob?14:16, ax1=mob?w-14:w*0.48;
    const gL=s.append("g");
    V.t(gL, ax0, 18, narrow?"Proves transculturals (precisió)":"Proves transculturals reals (precisió d'encert)", {size:13, weight:700, fill:C.ink});
    const xP=d3.scaleLinear([42,76],[ax0+6,ax1-10]);
    const yRows=[86, 166];
    V.axisX(gL, xP, 212, [45,50,55,60,65,70,75], d=>d+" %", {tick:true});
    // Línia vertical d'atzar (50 %)
    gL.append("line").attr("x1",xP(50)).attr("x2",xP(50)).attr("y1",36).attr("y2",212).attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-dasharray","2 3");
    V.t(gL, xP(50)+4, 46, "Atzar (50 %)", {size:11, italic:true, fill:C.ink2});

    const rows=gL.selectAll("g.cc").data(D.crossCultural).join("g").attr("class","cc").style("cursor","pointer");
    rows.each(function(d,i){
      const q=d3.select(this), yy=yRows[i], col=i===0?C.vermell:C.blau;
      const rowTitle=narrow?`${d.pregunta} · ${d.societats} soc.`:`${d.pregunta} · ${d.societats} societats (N = ${f0(d.n)})`;
      const rowSub=narrow?`${d.estudi}, ${d.any} (N = ${f0(d.n)})`:`${d.estudi}, ${d.any}`;
      V.t(q, ax0+6, yy-24, rowTitle, {size:narrow?12:12.5, weight:700, fill:C.ink});
      V.t(q, ax0+6, yy-9, rowSub, {size:narrow?11:11.5, fill:C.muted});
      // Franja de rang entre societats (translúcida)
      q.append("line").attr("x1",xP(d.min)).attr("x2",xP(d.max)).attr("y1",yy+10).attr("y2",yy+10)
        .attr("stroke",col).attr("stroke-width",10).attr("stroke-linecap","round").attr("stroke-opacity",.32);
      q.append("circle").attr("cx",xP(d.min)).attr("cy",yy+10).attr("r",4.2).attr("fill",col);
      q.append("circle").attr("cx",xP(d.max)).attr("cy",yy+10).attr("r",4.2).attr("fill",col);
      q.append("circle").attr("cx",xP(d.mid)).attr("cy",yy+10).attr("r",11).attr("fill",col).attr("fill-opacity",.28).style("mix-blend-mode","multiply");
      q.append("circle").attr("cx",xP(d.mid)).attr("cy",yy+10).attr("r",4.5).attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.3);
      V.t(q, xP(d.max)+8, yy+14, `${d.min}–${d.max} %`, {size:12, weight:700, fill:col});
      q.append("rect").attr("x",ax0).attr("y",yy-32).attr("width",ax1-ax0).attr("height",64).attr("fill","transparent");
    });

    rows.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(rows, x=>x.id===d.id, {dim:.48});
      tp.show(`<b>${d.estudi} (${d.any})</b><br>${d.detall}`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      V.focus(rows,null); tp.hide();
    });

    // ---- Panell B: LINK-05 Mapa conceptual de cercles translúcids (Wood et al., 2017) ----
    const bx0=mob?14:w*0.54, bx1=w-14;
    const by0=mob?274:28, by1=mob?480:280;
    const bcx=(bx0+bx1)/2, bcy=(by0+by1)/2+8;
    const gR=s.append("g");
    V.t(gR, bx0, by0-10, "Tres funcions socials (Wood et al., 2017)", {size:13, weight:700, fill:C.ink});

    // Eixos discontinus bipolars
    gR.append("line").attr("x1",bx0+16).attr("x2",bx1-16).attr("y1",bcy).attr("y2",bcy).attr("stroke",C.hair).attr("stroke-dasharray","3 3");
    gR.append("line").attr("x1",bcx).attr("x2",bcx).attr("y1",by0+18).attr("y2",by1-14).attr("stroke",C.hair).attr("stroke-dasharray","3 3");
    V.t(gR, bx0+16, bcy-5, "← Espontània", {size:11, fill:C.muted});
    V.t(gR, bx1-16, bcy-5, "Voluntària →", {size:11, fill:C.muted, anchor:"end"});
    V.t(gR, bcx, by0+12, "↑ Inclusiva", {size:11, fill:C.muted, anchor:"middle"});
    V.t(gR, bcx, by1-2, "↓ Jeràrquica", {size:11, fill:C.muted, anchor:"middle"});

    const spanX=(bx1-bx0)*0.27, spanY=(by1-by0)*0.28;
    const nodes=gR.selectAll("g.fn3").data(D.wood395.types).join("g").attr("class","fn3").style("cursor","pointer");
    nodes.each(function(d){
      const q=d3.select(this), cx=bcx+d.x*spanX, cy=bcy-d.y*spanY;
      const rr=mob?d.r*0.82:d.r;
      q.append("circle").attr("cx",cx).attr("cy",cy).attr("r",rr)
        .attr("fill",d.col).attr("fill-opacity",d.col===C.groc?.42:.30).style("mix-blend-mode","multiply");
      // Mai text en groc: totes les etiquetes en tinta #121212 amb halo blanc
      V.t(q, cx, cy+4, d.nom, {size:13, weight:700, anchor:"middle", fill:C.ink, halo:true});
    });

    clearFocus=()=>{ V.focus(rows,null); V.focus(nodes,null); tp.hide(); };
    nodes.on("pointerenter pointerdown",(ev,d)=>{
      V.focus(nodes, x=>x.id===d.id, {dim:.48});
      tp.show(`<b>Rialla de ${d.nom.toLowerCase()}</b><br>${d.funcio} (${d.trets}).`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType!=="mouse")return;
      V.focus(nodes,null); tp.hide();
    });

    V.onView(box, inst=>{
      if(inst)return;
      nodes.style("opacity",0).transition().delay((d,i)=>i*140).duration(650).ease(d3.easeCubicOut).style("opacity",1);
    });
  });
})();

/* =====================================================================
   FIGURA 4 · MAP-03 · MAPA ETNOGRÀFIC DELS USOS RITUALS I POLÍTICS DEL RIURE
   ===================================================================== */
(function etnografiaFig(){
  const el=$("#etno-viz"), lg=$("#etno-lg");
  if(!el||!D.ethnoSites)return;
  let filter="tots", applyFilter=null, clearFocus=null;
  document.addEventListener("pointerdown", ev=>{
    if(clearFocus && !el.contains(ev.target)) clearFocus();
  });
  const CAT={
    conflicte:{c:C.vermell, t:"Resolució de conflictes"},
    poder:    {c:C.blau,    t:"Inversió del poder i el sagrat"},
    etiqueta: {c:C.groc,    t:"Etiqueta i contagi social"}
  };
  V.legendCat(lg,[
    {c:C.vermell, t:CAT.conflicte.t},
    {c:C.blau,    t:CAT.poder.t},
    {c:C.groc,    t:CAT.etiqueta.t}
  ]);

  V.mount(el,(box,w)=>{
    const mob=w<640, h=Math.round(Math.min(mob?270:430, w*0.52));
    const s=V.svg(box,w,h,"Mapa mundial en projecció Equal Earth amb sis casos antropològics i històrics del riure: duels de cançons inuit, sanankuya a Mali, pallassos sagrats als EUA, Carnaval medieval a Europa, brot de Kashasha a Tanzània i terewarai al Japó.");
    const gMap=s.append("g"), gPts=s.append("g");
    const tp=V.tip(box);

    V.world().then(world=>{
      gMap.selectAll("*").remove(); gPts.selectAll("*").remove();
      const proj=d3.geoEqualEarth().fitExtent([[6,10],[w-6,h-10]], {type:"Sphere"});
      const path=d3.geoPath(proj);
      gMap.append("path").datum(world.land).attr("d",path).attr("fill",C.land);
      gMap.append("path").datum(world.borders).attr("d",path).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.6);

      const sites=gPts.selectAll("g.es").data(D.ethnoSites).join("g").attr("class","es").style("cursor","pointer");
      sites.each(function(d){
        const q=d3.select(this), p=proj([d.lon,d.lat]);
        if(!p)return;
        const [x,y]=p, col=CAT[d.cat].c;
        const rad=mob?14:21;
        q.append("circle").attr("class","halo").attr("cx",x).attr("cy",y).attr("r",rad)
          .attr("fill",col).attr("fill-opacity",d.cat==="etiqueta"?.44:.30).style("mix-blend-mode","multiply");
        q.append("circle").attr("class","core").attr("cx",x).attr("cy",y).attr("r",3.8)
          .attr("fill",d.cat==="etiqueta"?C.ink:col).attr("stroke","#fff").attr("stroke-width",1.3);
        const showLab=!mob || d.id==="inuit" || d.id==="sanankuya" || d.id==="pueblo" || d.id==="japo";
        if(showLab){
          const tx=Math.max(10, Math.min(w-10, x+(mob?d.dx*.7:d.dx)));
          const ty=Math.max(16, Math.min(h-8, y+(mob?d.dy*.75:d.dy)));
          const anc=tx<95?"start":tx>w-95?"end":d.anc;
          V.t(q, tx, ty, d.nom.split(" (")[0], {size:mob?11:12, weight:700, anchor:anc, fill:C.ink, halo:true});
        }
        q.append("circle").attr("cx",x).attr("cy",y).attr("r",24).attr("fill","transparent");
      });

      clearFocus=()=>{
        if(applyFilter)applyFilter(filter);
        sites.select(".core").attr("r",3.8);
        tp.hide();
      };
      sites.on("pointerenter pointerdown",(ev,d)=>{
        V.focus(sites, x=>x.id===d.id, {dim:.48});
        sites.select(".core").attr("r",x=>x.id===d.id?5.2:3.8);
        tp.show(`<b>${d.nom}</b> (${d.lloc})<br>${d.resum}`);
      }).on("pointerleave",ev=>{
        if(ev.pointerType!=="mouse")return;
        clearFocus();
      });

      applyFilter=k=>{
        filter=k;
        if(k==="tots") V.focus(sites, null);
        else V.focus(sites, d=>d.cat===k, {dim:.48});
      };
      applyFilter(filter);
    });
  });

  document.querySelectorAll("#f-etnografia .seg button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("#f-etnografia .seg button").forEach(b=>b.setAttribute("aria-pressed",b===btn));
      filter=btn.dataset.k;
      if(applyFilter)applyFilter(filter);
    });
  });
})();

})();
