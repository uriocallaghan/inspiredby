/* «La guerra invisible» — gràfics 2 (sistema infogràfic IBV, gravat científic i aquarel·la editorial):
   5. PART-06 Constel·lació de cercles d'aquarel·la (d3.pack amb zoom) ↔ CASE-04 Distribució (21.738 genomes)
   6. HOW-01 Gravat molecular de precisió del mecanisme CRISPR-Cas9 (scrollytelling)
   7. Colònia bacteriana d'aquarel·la (càpsules + halos daurats) + sèrie temporal TIME-02 en directe
   8. TIME-15 Cronologia editorial del CRISPR (1987–2023) */
(function(){
"use strict";
const V=window.IBV, H=window.VIB; if(!V||!H)return;
const C=V.C;
const {SSF,RM,clamp,lerp,ease,fmtN,txt,lead,addWashGrad,canvasWash}=H;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");

/* =====================================================================
   5. PART-06 CONSTEL·LACIÓ D'AQUAREL·LA ↔ CASE-04 DISTRIBUCIÓ (21.738 GENOMES)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("def-viz"); if(!vizEl||!window.VIB_DATA)return;
  const seg=document.getElementById("defSeg"), title=document.getElementById("defTitle"), sub=document.getElementById("defSub"), lgEl=document.getElementById("def-lg");
  const N=VIB_DATA.nGen, DEF=VIB_DATA.def.slice(0,25), HIST=VIB_DATA.hist;
  const DORON=new Set(["Thoeris","Hachiman","Shedu","Gabija","Septu","Lamassu","Zorya","Kiwa","Druantia","Wadjet"]);
  const NAME={RM:"Restricció-modificació",Cas:"CRISPR-Cas",Retron:"Retrons",Rst_PARIS:"PARIS",dGTPase:"dGTPasa"};
  const SHORT={RM:"Restricció-mod.",Cas:"CRISPR-Cas",Retron:"Retrons",Rst_PARIS:"PARIS",dGTPase:"dGTPasa"};
  const DESC={
    RM:"Tisores que tallen l'ADN sense l'etiqueta química del bacteri",
    Cas:"Memòria adaptativa: guarda trossos de virus per reconèixer-los",
    CBASS:"Infecció avortiva, emparentat amb cGAS-STING humà",
    Retron:"Infecció avortiva",
    Abi2:"Família Abi, d'infecció avortiva",
    AbiEii:"Família Abi, d'infecció avortiva",
    AbiH:"Família Abi, d'infecció avortiva",
    Wadjet:"Descrit el 2018 · protegeix contra plasmidis",
    Zorya:"Descrit el 2018 · peces semblants al motor del flagel",
    Gabija:"Descrit el 2018 · el més freqüent dels sistemes nous"
  };

  /* Paleta estricta: CRISPR vermell (protagonista), RM blau, Doron 2018 groc, altres gris */
  const kindOf=k=>k==="Cas"?"cas":k==="RM"?"rm":DORON.has(k)?"dor":"oth";
  const strokeCol=k=>k==="Cas"?C.vermell:k==="RM"?C.blau:DORON.has(k)?C.grocFosc:C.ink2;

  let view=0, redrawDef=null, clearDef=null;
  document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!vizEl.contains(ev.target)&&clearDef)clearDef(); });

  function renderLegend(){
    if(!lgEl)return;
    lgEl.innerHTML="";
    if(view===0){
      V.legendCat(lgEl,[
        {c:C.vermell,t:"CRISPR-Cas (aprèn)"},
        {c:C.blau,t:"Restricció-modificació"},
        {c:C.groc,t:"Descrits el 2018 (Doron et al.)"},
        {c:C.ink2,t:"Altres sistemes",a:.45}
      ]);
    } else {
      V.legendCat(lgEl,[
        {c:C.vermell,t:"Sense cap sistema (0)"},
        {c:C.blau,t:"Distribució per genoma"},
        {c:C.ink,t:"Mitjana (5,2)",kind:"line",w:1.3,dash:"2 3"}
      ]);
    }
  }
  renderLegend();

  V.mount(vizEl,(el,W)=>{
    const mob=W<640;
    const tp=V.tip(el);

    function drawView(animate){
      d3.select(el).selectAll("svg.ibv").remove();
      tp.hide();
      const uid="df"+Math.random().toString(36).slice(2,6);

      if(view===0){
        /* ---- VISTA 0: PART-06 CONSTEL·LACIÓ DE CERCLES D'AQUAREL·LA (d3.pack + zoom) ---- */
        title.textContent="Quins sistemes de defensa porten bacteris i arqueus";
        sub.textContent="Percentatge de genomes amb cada família (25 més freqüents de 60) · Àrea proporcional · Clica un cercle per ampliar-lo";
        const H=mob?380:430;
        const padL=mob?8:156, padR=mob?8:156, padY=14;
        const packW=Math.max(240,W-padL-padR), packH=H-padY*2;

        const items=DEF.map(d=>({id:d[0],pct:d[1],n:Math.round(d[1]/100*N),k:kindOf(d[0]),name:NAME[d[0]]||d[0],sh:SHORT[d[0]]||d[0]}));
        const root=d3.pack().size([packW,packH]).padding(mob?5:9)(
          d3.hierarchy({children:items}).sum(d=>d.pct||0).sort((a,b)=>b.value-a.value)
        );
        const nodes=root.leaves();

        const s=V.svg(el,W,H,"Constel·lació de cercles d'aquarel·la amb les 25 famílies de sistemes de defensa més freqüents en 21.738 genomes: restricció-modificació al 83 %, CRISPR-Cas al 39,2 %, Gabija al 15,3 % i la resta per sota del 15 %.");
        const defs=s.append("defs");
        const gCas=addWashGrad(defs,uid+"cas",C.vermell,.52,.28,.06);
        const gRM =addWashGrad(defs,uid+"rm", C.blau,   .42,.21,.05);
        const gDor=addWashGrad(defs,uid+"dor",C.groc,   .54,.30,.07);
        const gOth=addWashGrad(defs,uid+"oth",C.ink2,   .24,.12,.03);
        const washOf=k=>k==="cas"?gCas:k==="rm"?gRM:k==="dor"?gDor:gOth;

        /* Clip suau per al zoom */
        defs.append("clipPath").attr("id",uid+"cl").append("rect").attr("x",0).attr("y",0).attr("width",W).attr("height",H);
        const gWrap=s.append("g").attr("clip-path",`url(#${uid}cl)`);
        /* Fons transparent clicable per desfer el zoom */
        gWrap.append("rect").attr("width",W).attr("height",H).attr("fill","transparent").style("cursor","default")
          .on("click",()=>{ if(zoomed)zoomTo(null); });

        const gPack=gWrap.append("g").attr("transform",`translate(${padL},${padY})`);
        const gNote=s.append("g").style("pointer-events","none");

        const cell=gPack.selectAll("g.df").data(nodes).join("g").attr("class","df")
          .attr("transform",d=>`translate(${d.x},${d.y})`)
          .attr("tabindex","0").attr("role","button")
          .attr("aria-label",d=>`${d.data.name}: ${f1(d.data.pct)} per cent dels genomes (${f0(d.data.n)})`)
          .style("cursor","pointer");

        cell.append("circle").attr("class","wash").attr("r",d=>d.r)
          .attr("fill",d=>washOf(d.data.k)).style("mix-blend-mode","multiply");
        cell.append("circle").attr("class","rim").attr("r",d=>d.r)
          .attr("fill","none")
          .attr("stroke",d=>d.data.k==="cas"?C.vermell:d.data.k==="rm"?C.blau:d.data.k==="dor"?V.alpha(C.grocFosc,.55):V.alpha(C.ink2,.28))
          .attr("stroke-width",d=>d.data.k==="cas"?1.6:d.data.k==="rm"?1.2:.75);

        /* Etiquetes horitzontals nítides dins els cercles */
        cell.each(function(d){
          const q=d3.select(this), r=d.r, pctStr=f1(d.data.pct)+" %";
          if(r>=(mob?36:44)){
            V.t(q,0,-5,d.data.sh,{anchor:"middle",weight:700,size:d.data.k==="cas"||d.data.k==="rm"?(mob?12.5:14):12.5,fill:C.ink,halo:3});
            V.t(q,0,12,pctStr,{anchor:"middle",size:mob?11:12,fill:C.ink2,halo:2.5});
          } else if(r>=(mob?22:26)){
            V.t(q,0,-2,d.data.sh,{anchor:"middle",weight:700,size:11.5,fill:C.ink,halo:3});
            V.t(q,0,11,pctStr,{anchor:"middle",size:11,fill:C.ink2,halo:2.5});
          } else if(r>=15){
            V.t(q,0,3.5,d.data.sh,{anchor:"middle",weight:600,size:11,fill:C.ink,halo:2.5});
          }
        });

        /* Anotacions editorials als marges blancs lliures (només a escriptori, zero solapament) */
        if(!mob){
          const nCas=nodes.find(n=>n.data.id==="Cas");
          const nRM =nodes.find(n=>n.data.id==="RM");
          if(nCas){
            const goLeft=nCas.x<packW*.5;
            const gx=nCas.x+padL, gy=nCas.y+padY;
            const ax=goLeft?gx-nCas.r*.78:gx+nCas.r*.78, ay=gy-nCas.r*.32;
            const tx=goLeft?Math.max(146,gx-nCas.r-26):Math.min(W-146,gx+nCas.r+26);
            const ty=clamp(gy-nCas.r*.38,34,H-44);
            V.note(gNote,{x:ax,y:ay,tx,ty,kind:"elbow",dot:true,anchor:goLeft?"end":"start",
              lines:[["CRISPR-Cas · 39,2 %",true,C.vermell],["l'única defensa que aprèn"]]});
          }
          if(nRM){
            const goLeft=nCas?(nCas.x>=packW*.5):(nRM.x<packW*.5);
            const gx=nRM.x+padL, gy=nRM.y+padY;
            const ax=goLeft?gx-nRM.r*.82:gx+nRM.r*.82, ay=gy+nRM.r*.22;
            const tx=goLeft?Math.max(146,gx-nRM.r-24):Math.min(W-146,gx+nRM.r+24);
            const ty=clamp(gy+nRM.r*.34,54,H-36);
            V.note(gNote,{x:ax,y:ay,tx,ty,kind:"elbow",dot:true,anchor:goLeft?"end":"start",
              lines:[["Restricció-modificació",true,C.blau],["83,0 % dels genomes"]]});
          }
        }

        /* Zoom suau en clicar (estil PART-06) */
        let zoomed=null;
        function zoomTo(d){
          zoomed=d;
          const durMs=RM?0:620;
          if(!d){
            gPack.transition().duration(durMs).ease(d3.easeCubicInOut).attr("transform",`translate(${padL},${padY})`);
            gNote.transition().duration(durMs).style("opacity",1);
            resetHv();
            return;
          }
          const k=clamp(Math.min(packW,packH)/(d.r*2.9),1.25,3.2);
          const tx=W/2-d.x*k, ty=H/2-d.y*k;
          gPack.transition().duration(durMs).ease(d3.easeCubicInOut).attr("transform",`translate(${tx},${ty}) scale(${k})`);
          gNote.transition().duration(durMs*.6).style("opacity",0);
          showTip(d,true);
        }

        function showTip(d,isZoom){
          const extra=DESC[d.data.id]||(DORON.has(d.data.id)?"Descrit el 2018 (Doron et al.)":"");
          tp.show(`<b>${d.data.name}</b> · ${f1(d.data.pct)} % (${f0(d.data.n)} genomes)${extra?"<br>"+extra:""}${isZoom?" · Clica fora per tornar":""}`);
        }
        function resetHv(){
          if(zoomed)return;
          cell.interrupt().transition().duration(RM?0:150).style("opacity",1);
          cell.select(".rim")
            .attr("stroke",d=>d.data.k==="cas"?C.vermell:d.data.k==="rm"?C.blau:d.data.k==="dor"?V.alpha(C.grocFosc,.55):V.alpha(C.ink2,.28))
            .attr("stroke-width",d=>d.data.k==="cas"?1.6:d.data.k==="rm"?1.2:.75);
          tp.hide();
        }
        clearDef=()=>{ if(zoomed)zoomTo(null); else resetHv(); };

        cell.on("pointerenter",(ev,d)=>{
          cell.interrupt().transition().duration(RM?0:140).style("opacity",o=>o===d?1:.48);
          d3.select(ev.currentTarget).raise().select(".rim").attr("stroke",C.ink).attr("stroke-width",1.6);
          showTip(d,!!zoomed);
        }).on("pointerleave",ev=>{
          if(ev.pointerType==="mouse"){
            if(zoomed){
              cell.interrupt().transition().duration(140).style("opacity",o=>o===zoomed?1:.48);
              showTip(zoomed,true);
            } else resetHv();
          }
        }).on("click",(ev,d)=>{
          ev.stopPropagation();
          zoomTo(zoomed===d?null:d);
        }).on("focus",(ev,d)=>{
          cell.style("opacity",o=>o===d?1:.48);
          d3.select(ev.currentTarget).raise().select(".rim").attr("stroke",C.ink).attr("stroke-width",1.6);
          showTip(d,!!zoomed);
        }).on("blur",()=>{ if(!zoomed)resetHv(); });

        if(animate&&!RM){
          cell.attr("transform",d=>`translate(${d.x},${d.y}) scale(0.32)`).style("opacity",0)
            .transition().delay((d,i)=>i*22).duration(680).ease(d3.easeCubicOut)
            .attr("transform",d=>`translate(${d.x},${d.y}) scale(1)`).style("opacity",1);
          gNote.style("opacity",0).transition().delay(580).duration(420).style("opacity",1);
        }

      } else {
        /* ---- VISTA 1: CASE-04 DISTRIBUCIÓ PER GENOMA AMB AQUAREL·LA ---- */
        title.textContent="Quants sistemes de defensa té cada genoma";
        sub.textContent="Distribució dels 21.738 genomes segons el nombre de sistemes antivirals (mitjana: 5,2; màxim: 57)";
        const H=mob?300:340, ml=mob?42:54, mr=mob?14:24, mt=mob?58:36, mb=44;
        const agg=HIST.filter(d=>d[0]<30).map(d=>[d[0],d[1]]);
        const rest=HIST.filter(d=>d[0]>=30).reduce((a,d)=>a+d[1],0);
        const data=agg.concat([[30,rest]]);
        const s=V.svg(el,W,H,"Distribució del nombre de sistemes antivirals per genoma en 21.738 bacteris i arqueus: 1.450 genomes no en tenen cap, la mitjana és 5,2 i el màxim arriba a 57.");
        const defs=s.append("defs");
        const gArea=defs.append("linearGradient").attr("id",uid+"ar").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",1);
        gArea.append("stop").attr("offset",0).attr("stop-color",C.blau).attr("stop-opacity",.20);
        gArea.append("stop").attr("offset",1).attr("stop-color",C.blau).attr("stop-opacity",.02);
        const gRed=addWashGrad(defs,uid+"hr",C.vermell,.52,.26,.06);
        const gBlu=addWashGrad(defs,uid+"hb",C.blau,.42,.20,.05);

        const X=d3.scaleLinear([-0.6,30.6],[ml,W-mr]);
        const Y=d3.scaleLinear([0,3100],[H-mb,mt]);
        const rSc=d3.scaleSqrt([0,3000],[2.6,mob?8.5:11.5]);

        const g=s.append("g");
        V.gridY(g,Y,ml,W-mr,[0,1000,2000,3000],v=>f0(v),{zero:0,unit:" genomes"});
        V.axisX(g,X,H-mb,[0,5,10,15,20,25,30],v=>v===30?"30+":String(v));
        V.t(g,W-mr,H-6,"Sistemes antivirals per genoma →",{size:11.5,fill:C.ink2,anchor:"end"});

        const area=d3.area().x(d=>X(d[0])).y0(Y(0)).y1(d=>Y(d[1])).curve(d3.curveMonotoneX);
        g.append("path").datum(data).attr("d",area).attr("fill",`url(#${uid}ar)`).style("mix-blend-mode","multiply");

        const xMean=X(5.2);
        g.append("line").attr("x1",xMean).attr("x2",xMean).attr("y1",mt-4).attr("y2",Y(0))
          .attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-dasharray","2 3");

        const items=g.selectAll("g.pt").data(data).join("g").attr("class","pt").style("cursor","pointer");
        const stems=items.append("line").attr("x1",d=>X(d[0])).attr("x2",d=>X(d[0])).attr("y1",Y(0)).attr("y2",d=>animate?Y(0):Y(d[1]))
          .attr("stroke",d=>d[0]===0?C.vermell:C.blau).attr("stroke-width",d=>d[0]===0?1.8:1.05).attr("stroke-opacity",.62);
        const halos=items.append("circle").attr("class","halo").attr("cx",d=>X(d[0])).attr("cy",d=>animate?Y(0):Y(d[1]))
          .attr("r",d=>animate?0:rSc(d[1])).attr("fill",d=>d[0]===0?gRed:gBlu).style("mix-blend-mode","multiply");
        const cores=items.append("circle").attr("cx",d=>X(d[0])).attr("cy",d=>animate?Y(0):Y(d[1]))
          .attr("r",2.4).attr("fill",d=>d[0]===0?C.vermell:C.blau);
        items.append("rect").attr("x",d=>X(d[0])-(W-ml-mr)/62).attr("y",mt).attr("width",(W-ml-mr)/31).attr("height",H-mt-mb).attr("fill","transparent");

        const gNote=s.append("g").style("pointer-events","none");
        V.note(gNote,{x:X(0),y:Y(1450)-8,tx:X(0)+(mob?6:14),ty:mob?16:mt+4,kind:"elbow",anchor:"start",
          lines:[["1.450 genomes",true,C.vermell],["sense cap sistema"]]});
        V.note(gNote,{x:xMean,y:Y(mob?2250:2712),tx:X(mob?14:10),ty:Y(mob?2250:2712),kind:"straight",anchor:"start",
          lines:[["Mitjana: 5,2",true,C.blau],[mob?"per genoma":"sistemes per genoma"]]});
        V.note(gNote,{x:X(30),y:Y(rest)-6,tx:X(30)-4,ty:Y(rest)-(mob?34:46),kind:"elbow",anchor:"end",
          lines:[[mob?"Màxim: 57":"Màxim: 57 sistemes",true],[mob?"":"(Desulfonema limicola)"]]});

        if(animate&&!RM){
          stems.transition().duration(750).delay((d,i)=>i*16).ease(d3.easeCubicOut).attr("y2",d=>Y(d[1]));
          halos.transition().duration(750).delay((d,i)=>i*16).ease(d3.easeCubicOut).attr("cy",d=>Y(d[1])).attr("r",d=>rSc(d[1]));
          cores.transition().duration(750).delay((d,i)=>i*16).ease(d3.easeCubicOut).attr("cy",d=>Y(d[1]));
          gNote.style("opacity",0).transition().delay(620).duration(400).style("opacity",1);
        }

        const clear=()=>{ V.focus(items,null); halos.attr("stroke",null); tp.hide(); };
        clearDef=clear;
        items.on("pointerenter pointerdown",(ev,d)=>{
          V.focus(items,x=>x[0]===d[0],{dim:.48});
          halos.attr("stroke",x=>x[0]===d[0]?C.ink:null).attr("stroke-width",x=>x[0]===d[0]?1.4:null);
          tp.show(`<b>${d[0]===30?"30 o més":d[0]} ${d[0]===1?"sistema":"sistemes"}</b> · ${f0(d[1])} genomes (${f1(d[1]/N*100)} %)`);
        }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")clear(); });
      }
    }

    redrawDef=anim=>drawView(anim);
    V.onView(el,inst=>drawView(!inst));
    if(el.__seen)drawView(false);
  });

  seg.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    view=+b.dataset.v;
    [...seg.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    renderLegend();
    if(redrawDef)redrawDef(true);
  });
})();

/* =====================================================================
   6. HOW-01 GRAVAT MOLECULAR DE PRECISIÓ — CRISPR PAS A PAS (SCROLLY)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("cr-viz"); if(!vizEl)return;
  const steps=document.getElementById("csteps"), graphic=document.getElementById("cgraphic");
  const nameEl=document.getElementById("cName"), subEl=document.getElementById("cSub"), lgEl=document.getElementById("cr-lg");
  if(lgEl)V.legendCat(lgEl,[
    {c:C.vermell,t:"ADN víric / espaiador nou"},
    {c:C.blau,t:"Cromosoma bacterià"},
    {c:C.groc,t:"Proteïnes Cas / Cas9"}
  ]);

  const NM=["L'arxiu CRISPR","Arriba un virus nou","Un retrat de l'invasor","Una memòria que s'hereta","Retrats en patrulla","El virus torna","La resposta del virus","Del bacteri al laboratori"];
  const TIPS=[
    "<b>Arxiu CRISPR</b> · Repeticions idèntiques (rombes grisos) separades per espaiadors de virus antics, al costat dels gens cas",
    "<b>Infecció nova</b> · L'ADN del virus (vermell) no coincideix amb cap espaiador guardat",
    "<b>Captura d'espaiador</b> · Cas1–Cas2 retallen un fragment al costat del PAM i l'enganxen al principi de l'arxiu",
    "<b>Memòria heretable</b> · En dividir-se el bacteri, les dues filles reben una còpia íntegra de l'arxiu",
    "<b>Patrulla de Cas9</b> · L'arxiu es copia en ARN guia; cada proteïna Cas9 en porta un i vigila la cèl·lula",
    "<b>Tall específic</b> · Cas9 detecta el PAM, comprova la coincidència amb la guia i talla l'ADN víric",
    "<b>Mutació d'escapament</b> · Una sola lletra canviada impedeix el reconeixement; el bacteri pot guardar un nou espaiador",
    "<b>Edició genètica</b> · Canviant les 20 lletres de l'ARN guia, Cas9 talla qualsevol ADN amb un PAM al costat"
  ];
  let st=0, t0=performance.now();
  const OLD=[C.blauClar,C.grocClar,C.ghost,"#B6C6DF",C.land];
  const RED=C.vermell, MUT=C.vermellClar;
  const FW=800, FH=540;

  V.mount(vizEl,(el,W)=>{
    const mob=innerWidth<900;
    const H=mob?Math.round(Math.max(205,Math.min(window.innerHeight*.29,245))):Math.round(clamp(Math.min(innerHeight-240,W*.68),300,520));
    const {c:cv,ctx:c}=V.canvas(el,W,H,"Gravat molecular del sistema immunitari CRISPR: l'arxiu d'espaiadors al cromosoma, la captura d'un fragment de virus per Cas1-Cas2, l'herència a les cèl·lules filles, les guies d'ARN a Cas9 i l'edició d'ADN humà.");
    const tp=V.tip(el);
    V.hover(cv,()=>{ tp.show(TIPS[st]); },()=>tp.hide());

    const K=Math.min(W/FW,H/FH), ox=(W-FW*K)/2, oy=(H-FH*K)/2;
    const X=x=>ox+x*K, Y=y=>oy+y*K;
    const fs=mob?11:12.5;

    /* Doble hèlix fina amb esglaons de parells de bases */
    function helix(x0,x1,y,amp,col,lw,alpha,stepB){
      c.save(); c.globalAlpha=alpha==null?1:alpha; c.lineCap="round";
      const sp=stepB||14;
      /* Esglaons de bases */
      c.strokeStyle=V.alpha(col,.32); c.lineWidth=Math.max(.65,.95*K);
      c.beginPath();
      for(let x=x0+4;x<=x1-4;x+=sp){
        const dy=Math.sin(x*.052)*amp;
        c.moveTo(X(x),Y(y-dy)); c.lineTo(X(x),Y(y+dy));
      }
      c.stroke();
      /* Dues cadenes de sucre-fosfat */
      [-1,1].forEach(sg=>{
        c.strokeStyle=sg===1?col:V.alpha(col,.68); c.lineWidth=Math.max(1,lw*K);
        c.beginPath();
        for(let x=x0;x<=x1;x+=4){
          const yy=y+sg*Math.sin(x*.052)*amp;
          x===x0?c.moveTo(X(x),Y(yy)):c.lineTo(X(x),Y(yy));
        }
        c.stroke();
      });
      c.restore();
    }

    function arrayAt(x0,y,k,spc,newA){
      const sw=46*k, rw=14*k, h=24*k; let x=x0;
      /* Líder */
      c.fillStyle=C.land; c.strokeStyle=C.ink2; c.lineWidth=.75;
      c.fillRect(X(x),Y(y-h/2),26*k*K,h*K); c.strokeRect(X(x),Y(y-h/2),26*k*K,h*K); x+=30*k;
      const diamond=(xx,a)=>{
        c.save(); c.globalAlpha=a;
        c.fillStyle=C.ink2;
        c.beginPath(); c.moveTo(X(xx),Y(y)); c.lineTo(X(xx+rw/2),Y(y-h/2)); c.lineTo(X(xx+rw),Y(y)); c.lineTo(X(xx+rw/2),Y(y+h/2)); c.closePath(); c.fill();
        c.strokeStyle=C.paper; c.lineWidth=.6;
        c.beginPath(); c.moveTo(X(xx+rw/2),Y(y-h/2+2*k)); c.lineTo(X(xx+rw/2),Y(y+h/2-2*k)); c.stroke();
        c.restore();
      };
      const ent=(cl,a)=>{
        diamond(x,a);
        x+=rw+2*k;
        c.save(); c.globalAlpha=a;
        if(cl===RED)canvasWash(c,X(x+sw/2),Y(y),26*k*K,RED,.26,.05);
        c.fillStyle=cl; c.fillRect(X(x),Y(y-h/2+2*k),sw*K,(h-4*k)*K);
        c.strokeStyle=cl===RED?C.vermellFosc:cl===MUT?C.vermell:V.alpha(C.ink2,.4); c.lineWidth=.8;
        c.strokeRect(X(x),Y(y-h/2+2*k),sw*K,(h-4*k)*K);
        c.restore();
        x+=sw+2*k;
      };
      spc.forEach((cl,i)=>ent(cl,i===0&&newA!=null?newA:1));
      diamond(x,1);
      return {lead:[x0+13*k,y],first:[x0+30*k+rw+2*k+sw/2,y],end:x+rw};
    }
    function chromLine(x0,x1,y,k){ helix(x0,x1,y,6*k,C.blau,1.65*k,1,16); }
    function casGenes(x0,y,k){
      const w=[28,30,40,26].map(v=>v*k); let x=x0;
      w.forEach((ww,i)=>{
        c.fillStyle=i===2?V.alpha(C.groc,.72):V.alpha(C.grocClar,.75);
        c.strokeStyle=C.grocFosc; c.lineWidth=.9;
        c.beginPath(); c.moveTo(X(x),Y(y-10*k)); c.lineTo(X(x+ww-6*k),Y(y-10*k)); c.lineTo(X(x+ww),Y(y));
        c.lineTo(X(x+ww-6*k),Y(y+10*k)); c.lineTo(X(x),Y(y+10*k)); c.closePath(); c.fill(); c.stroke();
        x+=ww+3*k;
      });
      return x;
    }
    function cellBox(x0,y0,x1,y1,a){
      c.save(); c.globalAlpha=a==null?1:a;
      const g=c.createRadialGradient(X((x0+x1)/2-90),Y((y0+y1)/2-60),20*K,X((x0+x1)/2),Y((y0+y1)/2),440*K);
      g.addColorStop(0,V.alpha(C.blau,.08)); g.addColorStop(1,V.alpha(C.blau,.02));
      c.fillStyle=g; c.strokeStyle=C.blau; c.lineWidth=Math.max(1.15,2.2*K);
      c.beginPath(); c.roundRect(X(x0),Y(y0),(x1-x0)*K,(y1-y0)*K,56*K); c.fill(); c.stroke();
      /* Doble membrana fina interior */
      c.strokeStyle=V.alpha(C.blau,.34); c.lineWidth=.8;
      c.beginPath(); c.roundRect(X(x0+7),Y(y0+7),(x1-x0-14)*K,(y1-y0-14)*K,50*K); c.stroke();
      c.restore();
    }
    function phageIcon(x,y,k,a,col){
      c.save(); c.globalAlpha=a==null?1:a; c.translate(X(x),Y(y)); c.scale(K*k,K*k);
      c.fillStyle=C.ink2; c.fillRect(-5.5,-46,11,46); c.fillStyle=C.ink; c.fillRect(-12,-6,24,7);
      c.strokeStyle=C.ink2; c.lineWidth=1.3; c.beginPath(); c.moveTo(-10,-3); c.lineTo(-24,-18); c.lineTo(-30,4); c.moveTo(10,-3); c.lineTo(24,-18); c.lineTo(30,4); c.stroke();
      c.beginPath(); c.moveTo(0,-46); c.lineTo(20,-56); c.lineTo(20,-90); c.lineTo(0,-100); c.lineTo(-20,-90); c.lineTo(-20,-56); c.closePath();
      c.fillStyle=col||V.alpha(C.vermell,.24); c.fill();
      c.strokeStyle=V.alpha(C.ink,.25); c.lineWidth=.7;
      c.beginPath(); c.moveTo(-20,-56); c.lineTo(0,-66); c.lineTo(20,-56); c.moveTo(-20,-90); c.lineTo(0,-80); c.lineTo(20,-90); c.moveTo(0,-66); c.lineTo(0,-80); c.stroke();
      c.strokeStyle=C.ink; c.lineWidth=1.35;
      c.beginPath(); c.moveTo(0,-46); c.lineTo(20,-56); c.lineTo(20,-90); c.lineTo(0,-100); c.lineTo(-20,-90); c.lineTo(-20,-56); c.closePath(); c.stroke();
      c.restore();
    }
    function phageDNA(x0,x1,y,p0,p1,col,a,cut,mutX){
      c.save(); c.globalAlpha=a==null?1:a;
      const g=cut?cut*28:0;
      helix(x0,p0-g,y,5.5,col,1.75,a,12);
      helix(p1+g,x1,y,5.5,col,1.75,a,12);
      if(!cut||cut<1){
        const fa=(a==null?1:a)*(1-(cut||0));
        helix(p0,p1,y,6.2,col,2.6,fa,10);
      }
      /* Marques de tisora / tall exacte al costat del PAM */
      if(cut&&cut>.05){
        const tx=X((p0+p1)/2), ty=Y(y);
        canvasWash(c,tx,ty,32*K*cut,C.groc,.42*(1-cut*.4),0);
        c.strokeStyle=C.ink; c.lineWidth=1.2; c.setLineDash([2.5,2.5]);
        c.beginPath(); c.moveTo(tx,ty-22*K); c.lineTo(tx,ty+22*K); c.stroke(); c.setLineDash([]);
      }
      /* PAM en tinta negra (alt contrast) */
      c.fillStyle=C.ink; c.fillRect(X(p1+4+g),Y(y-8.5),12*K,17*K);
      if(mutX!=null){
        const mx=p0+(p1-p0)*mutX;
        c.fillStyle=C.paper; c.fillRect(X(mx-4),Y(y-7),8*K,14*K);
        c.strokeStyle=C.ink; c.lineWidth=1.45; c.strokeRect(X(mx-4),Y(y-7),8*K,14*K);
      }
      c.restore();
    }
    /* Cas9 i Cas1-Cas2: aures d'aquarel·la daurada (radialGradient + multiply, bi-lobulades) */
    function cas9(x,y,k,guide,a){
      c.save(); c.globalAlpha=a==null?1:a;
      const rx=36*K*k, ry=25*K*k;
      canvasWash(c,X(x),Y(y),rx*1.38,C.groc,.36,.12);
      const cg=c.createRadialGradient(X(x-8*k),Y(y-6*k),3*K,X(x),Y(y),rx*1.1);
      cg.addColorStop(0,V.alpha(C.groc,.48)); cg.addColorStop(1,V.alpha(C.grocClar,.26));
      c.fillStyle=cg; c.strokeStyle=C.grocFosc; c.lineWidth=Math.max(1,1.4*K);
      /* Silueta bi-lobulada orgànica de Cas9 (lòbuls REC i NUC) */
      c.beginPath();
      c.ellipse(X(x-10*k),Y(y),rx*.72,ry*.92,-.15,0,6.2832);
      c.ellipse(X(x+11*k),Y(y),rx*.68,ry*.86,.15,0,6.2832);
      c.fill();
      c.beginPath(); c.ellipse(X(x),Y(y),rx,ry,0,0,6.2832); c.stroke();
      if(guide){
        /* ARN guia amb forquilla 3' característica */
        c.strokeStyle=guide; c.lineWidth=Math.max(2,4.2*K*k); c.lineCap="round";
        c.beginPath(); c.moveTo(X(x-24*k),Y(y+6*k)); c.lineTo(X(x+18*k),Y(y+6*k)); c.stroke();
        c.strokeStyle=C.ink2; c.lineWidth=Math.max(1.2,2.2*K*k);
        c.beginPath(); c.moveTo(X(x+18*k),Y(y+6*k)); c.quadraticCurveTo(X(x+28*k),Y(y+2*k),X(x+23*k),Y(y-8*k)); c.stroke();
      }
      c.restore();
    }
    function cas12(x,y,k,a){
      c.save(); c.globalAlpha=a==null?1:a;
      canvasWash(c,X(x),Y(y),32*K*k,C.groc,.42,.12);
      c.fillStyle=V.alpha(C.groc,.52); c.strokeStyle=C.grocFosc; c.lineWidth=1.05;
      c.beginPath(); c.arc(X(x-9*k),Y(y),11.5*K*k,0,6.2832); c.fill(); c.stroke();
      c.beginPath(); c.arc(X(x+9*k),Y(y),11.5*K*k,0,6.2832); c.fill(); c.stroke();
      c.restore();
    }
    const LBL=(px,py,lines,tx,ty,al,a)=>{
      if(a<=0)return;
      let lx=X(tx), ly=Y(ty), alg=al||"left", tw=0;
      lines.forEach(l=>{ if(!l||!l[0])return; c.font=`${l[1]?"700 ":""}${fs}px ${SSF}`; tw=Math.max(tw,c.measureText(l[0]).width); });
      if(alg==="left"&&lx+4+tw>W-8){
        if(lx-4-tw>=8){ alg="right"; }
        else { lx=Math.max(8,W-8-tw-4); }
      } else if(alg==="right"&&lx-4-tw<8){
        if(lx+4+tw<=W-8){ alg="left"; }
        else { lx=Math.min(W-8,8+tw+4); }
      } else if(alg==="center"){
        lx=clamp(lx,8+tw/2,W-8-tw/2);
      }
      const yOff=ty<py?-4-(lines.length-1)*fs*1.28:fs;
      const top=ly+yOff-fs, bot=ly+yOff+(lines.length-1)*fs*1.28+3;
      let sh=0;
      if(top<4) sh=4-top;
      else if(bot>H-4) sh=H-4-bot;
      lead(c,X(px),Y(py),lx,ly+sh,C.ink,a);
      txt(c,lines,lx+(alg==="right"?-4:alg==="center"?0:4),ly+yOff+sh,alg,fs,a);
    };

    function draw(){
      const now=performance.now(), t=RM?99:(now-t0)/1000, la=k=>clamp((t-k)/.5,0,1);
      c.clearRect(0,0,W,H);
      const base=OLD.slice(0,4);

      if(st<=2||st===4||st===5||st===6){
        cellBox(30,108,770,515); chromLine(60,740,438,1); casGenes(90,438,1);
        let spc=base.slice(), newA=null;
        if(st===2){ const q=clamp((t-2.2)/1,0,1); if(q>0){ spc=[RED].concat(base); newA=q; } }
        if(st>=4)spc=[RED].concat(base);
        if(st===6&&t>4.2){ spc=[MUT,RED].concat(base); newA=clamp((t-4.2)/.8,0,1); }
        const ar=arrayAt(250,438,1,spc,newA);

        if(st===0){
          LBL(150,428,[["Gens cas",true,C.ink]],150,358,"center",la(.2));
          LBL(263,428,[["Líder",true]],250,318,"center",la(.4));
          LBL(287,426,[["Repetició",true]],330,242,"left",la(.6));
          LBL(ar.first[0]+110,426,[["Espaiadors: retrats",true],["de virus antics",false,C.ink2]],ar.first[0]+188,374,"left",la(.8));
        }
        if(st===1||st===2||st===5||st===6){
          const col=st===6?MUT:RED, inj=st===1?ease(clamp((t-.3)/1.4,0,1)):1;
          phageIcon(400,110,1,1,st===6?V.alpha(C.vermellClar,.45):V.alpha(C.vermell,.24));
          const cut=st===5?ease(clamp((t-3)/1,0,1)):0;
          if(inj>0)phageDNA(400-260*inj,400+260*inj,242,360,430,col,st===5?1-clamp((t-4.5)/1,0,1)*.7:st===2?1-clamp((t-3.6)/1,0,1)*.75:1,cut,st===6?.55:null);
        }
        if(st===1){
          LBL(470,242,[["ADN del virus",true,RED]],555,182,"left",la(1.6));
          LBL(500,428,[["Cap espaiador",true],["hi coincideix",false,C.ink2]],615,350,"left",la(2.2));
        }
        if(st===2){
          const g1=ease(clamp(t/1,0,1)), mv=ease(clamp((t-1)/1.3,0,1));
          const sx=lerp(560,395,g1), sy=lerp(322,242,g1);
          /* Trajectòria corba fluida cap al principi de l'arxiu */
          const qx=(395+ar.lead[0]+30)/2-45, qy=(242+438)/2;
          const u=1-mv;
          const px=u*u*395+2*u*mv*qx+mv*mv*(ar.lead[0]+30);
          const py=u*u*242+2*u*mv*qy+mv*mv*438;
          cas12(mv>0?px:sx,mv>0?py-18:sy-18,1.1,clamp(1.6-(t-2.2),0,1));
          if(mv>0&&t<3.2){ c.save(); c.strokeStyle=RED; c.lineWidth=6.0*K; c.lineCap="round"; c.beginPath(); c.moveTo(X(px-32),Y(py)); c.lineTo(X(px+32),Y(py)); c.stroke(); c.restore(); }
          LBL(437,244,[["PAM",true,C.ink]],470,182,"left",la(.3));
          LBL(sx+12,sy-20,[["Cas1–Cas2",true,C.ink]],sx+60,162,"left",la(.3)*(1-mv));
          LBL(ar.first[0],428,[["Espaiador nou,",true,RED],["al principi de l'arxiu",false,C.ink2]],ar.first[0]+60,322,"left",la(3));
        }
        if(st===4){
          const tr=ease(clamp(t/1.2,0,1)), ct=ease(clamp((t-1.4)/1,0,1)), ld=ease(clamp((t-2.6)/1.4,0,1));
          const x0=280, x1=ar.end, pieces=spc.length, pw=(x1-x0)/pieces;
          for(let i=0;i<pieces;i++){
            const tx0=x0+i*pw, yy=388-ct*(30+i*8)-ld*(60+(i%2)*40), xx=lerp(tx0,180+i*120,ld), len=pw*.8*tr;
            if(ld>0)cas9(xx+len/2,yy-4,1,null,ld);
            c.strokeStyle=spc[i]; c.lineWidth=4.4*K; c.lineCap="round"; c.beginPath(); c.moveTo(X(xx),Y(yy)); c.lineTo(X(xx+len),Y(yy)); c.stroke();
          }
          LBL(330,386,[["ARN copiat de l'arxiu",true]],250,310,"right",la(.6)*(1-ld));
          LBL(240,298,[["Cas9 amb el seu",true,C.ink],["ARN guia",false,C.ink2]],140,182,"left",la(3));
        }
        if(st===5){
          const sc=ease(clamp((t-.8)/1.8,0,1)), cx=lerp(200,395,sc), cy=lerp(322,254,sc);
          cas9(cx,cy,1.12,RED,1);
          [1,2,3].forEach(i=>cas9(140+i*130,352+(i%2)*28,.9,OLD[i],.52));
          LBL(437,244,[["PAM",true,C.ink]],480,172,"left",la(.4));
          if(t>3)LBL(395,242,[["Coincideix: tall!",true,C.vermell]],555,322,"left",la(3));
        }
        if(st===6){
          const sc=ease(clamp((t-.5)/1.6,0,1)), cx=lerp(200,395,sc), cy=lerp(322,254,sc), pass=ease(clamp((t-2.4)/1.2,0,1));
          cas9(cx+pass*230,cy+pass*60,1.12,RED,1);
          LBL(398,244,[["Una lletra canviada",true,C.vermell]],300,164,"right",la(1));
          if(t>2.4)LBL(cx+pass*230,cy+pass*60-26,[["No coincideix:",true],["el virus s'escapa",false,C.ink2]],640,182,"left",la(2.6));
          if(t>4.2)LBL(ar.first[0],428,[["Nou espaiador,",true,C.vermell],["contra el mutant",false,C.ink2]],ar.first[0]+60,322,"left",la(4.4));
        }
      }
      if(st===3){
        const d=ease(clamp((t-.3)/1.8,0,1)), k=lerp(1,.84,d), spc=[RED].concat(base), gap=22*d, mid=312;
        if(d<.02)cellBox(30,108,770,515);
        else {
          const r=56*K*d, r0=56*K; c.save(); c.fillStyle=V.alpha(C.blau,.05); c.strokeStyle=C.blau; c.lineWidth=Math.max(1.15,2.2*K);
          [[108,mid-gap/2,[r0,r0,r,r]],[mid+gap/2,515,[r,r,r0,r0]]].forEach(([a,b,rr])=>{ c.beginPath(); c.roundRect(X(30),Y(a),740*K,(b-a)*K,rr); c.fill(); c.stroke(); });
          c.restore();
        }
        [lerp(438,210,d),lerp(438,418,d)].forEach(yc=>{ chromLine(60,740,yc,k); casGenes(90,yc,k); arrayAt(90+160*k,yc,k,spc); });
        if(d>=1){
          const ex=90+160*k+(30+5*64+14)*k, a=la(2.2);
          if(a>0){
            const l3=[["Les dues filles",true],["recorden el virus",false,C.ink2]];
            let tw3=0; l3.forEach(l=>{ c.font=`${l[1]?"700 ":""}${fs}px ${SSF}`; tw3=Math.max(tw3,c.measureText(l[0]).width); });
            const tx3=Math.min(X(ex+46),W-8-tw3), lx3=Math.min(X(ex+40),tx3-6);
            lead(c,X(ex+4),Y(216),lx3,Y(250),C.ink,a); lead(c,X(ex+4),Y(412),lx3,Y(284),C.ink,a);
            txt(c,l3,tx3,Y(258),"left",fs,a);
          }
        }
      }
      if(st===7){
        /* P1: ADN humà dibuixat com a doble hèlix fina amb esglaons directament sobre el paper blanc */
        const sc=ease(clamp((t-.4)/1.6,0,1)), cut=ease(clamp((t-2.4)/.8,0,1));
        const y=296, gx=cut*20;
        helix(60,400-gx,y,9,C.ink,1.95,1,14);
        helix(400+gx,740,y,9,C.ink,1.95,1,14);
        if(cut>.05){
          canvasWash(c,X(400),Y(y),36*K*cut,C.groc,.42*(1-cut*.35),0);
          c.save(); c.strokeStyle=C.blau; c.lineWidth=1.2; c.setLineDash([2.5,2.5]);
          c.beginPath(); c.moveTo(X(400),Y(y-26)); c.lineTo(X(400),Y(y+26)); c.stroke(); c.restore();
        }
        c.fillStyle=C.vermell; c.fillRect(X(432+gx),Y(y-10),14*K,20*K);
        cas9(lerp(170,405,sc),lerp(190,y-4,sc),1.32,C.blau,1);
        if(!mob||W>360){
          const G="GACCUGUUCAGCGAUAGCAC", T="GACCTGTTCAGCGATAGCAC", f=11.5;
          const bx=X(210), by=Y(428), cw=Math.min(15,(W-bx-44)/24);
          txt(c,[["ARN guia (20 lletres a mida, d'exemple)",false,C.blau]],bx,by-8,"left",f,la(1.4));
          c.save(); c.globalAlpha=la(1.4); c.font=`600 ${f}px ui-monospace,Menlo,monospace`; c.textAlign="center";
          for(let i=0;i<20;i++){
            const lx=bx+i*cw+cw/2;
            c.fillStyle=C.blau; c.fillText(G[i],lx,by+f+4);
            c.strokeStyle=C.hair; c.lineWidth=.7; c.beginPath(); c.moveTo(lx,by+f+6); c.lineTo(lx,by+f+11); c.stroke();
            c.fillStyle=C.ink; c.fillText(T[i],lx,by+2*f+12);
          }
          c.fillStyle=C.vermell; c.fillText("PAM",bx+20*cw+cw*1.6,by+2*f+12);
          c.textAlign="right"; c.font=`${f}px ${SSF}`; c.fillStyle=C.blau; c.fillText("ARN",bx-6,by+f+4); c.fillStyle=C.ink; c.fillText("ADN",bx-6,by+2*f+12); c.restore();
        }
        LBL(300,y,[["ADN d'una cèl·lula humana",true]],120,152,"left",la(.2));
        LBL(439+gx,y-10,[["PAM",true,C.vermell]],520,162,"left",la(.8));
        if(t>2.6)LBL(400,y,[["Tall a mida",true,C.blau]],600,230,"left",la(2.8));
      }
    }

    if(el.__loop)el.__loop.stop();
    el.__loop=V.loop(el,draw);
  });

  if(window.IB&&IB.scrolly){
    IB.scrolly(steps,graphic,i=>{
      st=i; t0=performance.now();
      nameEl.textContent=NM[i];
      subEl.textContent=i===7?"Esquema · seqüència d'exemple":"Esquema del mecanisme immunitari bacterià";
    });
  }
})();

/* =====================================================================
   7. COLÒNIA D'AQUAREL·LA (CÀPSULES + HALOS DAURATS) + TIME-02 EN DIRECTE
   ===================================================================== */
(function(){
  const simEl=document.getElementById("sim-viz"), chEl=document.getElementById("simChart-viz");
  if(!simEl||!chEl)return;
  const btns=document.getElementById("simBtns"), cnt=document.getElementById("simCnt"), msg=document.getElementById("simMsg"), reset=document.getElementById("simReset"), lgEl=document.getElementById("sim-lg");

  const VC=[C.vermell,C.groc,C.vermellClar,C.ink];
  const VN=["virus A","virus B","el virus A mutant","el virus A amb anti-CRISPR"];
  const SPN=["Virus A","Virus B","A mutant"];
  const CHH=152, NS=240;

  if(lgEl)V.legendCat(lgEl,[
    {c:C.blau,t:"Bacteri viu",kind:"hollow"},
    {c:C.vermell,t:"Infectat / espaiador A"},
    {c:C.groc,t:"Espaiador B / tall CRISPR"},
    {c:C.vermellClar,t:"Espaiador mutant"}
  ]);

  let W=0, H=0, c=null, cc=null, CW=0, cols=0, rows=0, R=10;
  let cells=[], hist=[], fx=[], simT=0, lastSample=0, evt=null, hovIdx=-1, tp=null;

  function init(){
    cells=[];
    const rr=V.rng(77);
    for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){
      cells.push({r,q,x:R+q*R*2+(r%2?R:0),y:R+r*R*1.75,ang:(rr()-.5)*.45,st:1,sp:[],v:-1,tm:0,fl:0});
    }
    hist=[]; simT=0; lastSample=0; fx=[]; evt=null; hovIdx=-1;
    msg.textContent="La colònia encara no ha vist cap virus. Cap bacteri no té espaiadors.";
    updCnt();
  }
  const nb=i=>{
    const a=cells[i], o=a.r%2?[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]:[[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];
    const out=[]; o.forEach(([dr,dq])=>{ const r=a.r+dr, q=a.q+dq; if(r>=0&&r<rows&&q>=0&&q<cols)out.push(r*cols+q); }); return out;
  };
  const spOf=v=>v===3?0:v;
  function attack(i,v){
    const a=cells[i]; if(a.st!==1)return;
    const known=a.sp.includes(spOf(v)), E=evt&&evt.v===v?evt:null;
    if(known&&v!==3){ a.fl=1; if(E)E.res++; return; }
    if(Math.random()<(v===3?.07:.015))return;
    if(v!==3&&Math.random()<.035){ a.sp.unshift(spOf(v)); if(a.sp.length>4)a.sp.pop(); if(E)E.acq++; return; }
    a.st=2; a.v=v; a.tm=.55+Math.random()*.4; if(E)E.inf++;
  }
  function release(v,at){
    const alive=cells.map((a,i)=>a.st===1?i:-1).filter(i=>i>=0);
    if(!alive.length){ msg.textContent="No queda cap bacteri. Torna a començar."; return; }
    evt={v,res:0,acq:0,inf:0,dead:0,t:simT,known:alive.filter(i=>cells[i].sp.includes(spOf(v))).length/alive.length,n:alive.length};
    const seeds=at!=null?[at].concat(nb(at)):d3.range(4).map(()=>alive[Math.floor(Math.random()*alive.length)]);
    seeds.forEach(i=>attack(i,v));
    const p=Math.round(evt.known*100);
    msg.textContent=v===3?(evt.known>.3?`El ${p} % dels bacteris recorden el virus A, però aquest porta un anti-CRISPR que bloqueja la memòria.`:"Aquest virus A porta un anti-CRISPR: encara que el bacteri el recordi, no el pot tallar."):
      v===2?(cells.some(a=>a.sp.includes(0))?"El mutant té una lletra canviada: l'espaiador del virus A no el reconeix.":"Un mutant del virus A ataca la colònia."):
      evt.known>.5?`El ${p} % dels bacteris ja tenen un espaiador de ${VN[v]}. A veure què passa…`:`${VN[v][0].toUpperCase()+VN[v].slice(1)} ataca. Gairebé cap bacteri no el coneix.`;
    if(RM){ for(let k=0;k<80;k++)step(.05); drawColony(); drawChart(); }
  }
  function step(dt){
    simT+=dt;
    for(let i=0;i<cells.length;i++){
      const a=cells[i]; if(a.fl>0)a.fl=Math.max(0,a.fl-dt*1.35);
      if(a.st===2){
        a.tm-=dt;
        if(a.tm<=0){
          const v=a.v; a.st=0; a.sp=[]; a.v=-1; if(evt&&evt.v===v)evt.dead++;
          fx.push({x:a.x,y:a.y,t:0});
          nb(i).forEach(j=>{ if(Math.random()<.75)attack(j,v); });
          const n2=nb(i), j=n2[Math.floor(Math.random()*n2.length)];
          if(j!=null)nb(j).forEach(k=>{ if(Math.random()<.18)attack(k,v); });
        }
      }
    }
    for(let i=0;i<cells.length;i++){
      const a=cells[i]; if(a.st!==0)continue;
      const al=nb(i).filter(j=>cells[j].st===1);
      if(al.length&&Math.random()<dt*1.3*al.length/6){
        const m=cells[al[Math.floor(Math.random()*al.length)]];
        a.st=1; a.sp=m.sp.slice(); a.fl=0;
      }
    }
    fx.forEach(f=>f.t+=dt); fx=fx.filter(f=>f.t<.65);
    const infV=evt?cells.some(a=>a.st===2&&a.v===evt.v):false;
    if(evt&&!infV&&simT-evt.t>1){
      const e=evt; evt=null; const alive=cells.filter(a=>a.st===1).length;
      if(alive===0)msg.textContent="La colònia ha desaparegut. Torna a començar.";
      else if(e.v===3)msg.textContent=`L'anti-CRISPR ha desactivat la memòria: han mort ${e.dead} bacteris, fins i tot els que recordaven el virus A. N'han sobreviscut uns quants per sort o gràcies a altres defenses.`;
      else if(e.dead<5&&e.res>0)msg.textContent=`L'atac ha fracassat: ${e.res} bacteris han reconegut el virus i l'han tallat. La memòria funciona.`;
      else if(e.acq>0)msg.textContent=`Han mort ${e.dead} bacteris, però ${e.acq===1?"un ha sobreviscut i ha":e.acq+" han sobreviscut i han"} guardat un espaiador nou. Els seus descendents ja l'hereten. Torna-hi!`;
      else msg.textContent=`Han mort ${e.dead} bacteris i cap no ha guardat el virus. Prova-ho una altra vegada.`;
    }
    if(simT-lastSample>.25){
      lastSample=simT; const n=cells.length||1, f=k=>cells.filter(a=>a.st===1&&a.sp.includes(k)).length/n;
      hist.push([cells.filter(a=>a.st===1).length/n,f(0),f(1),f(2)]);
      if(hist.length>NS)hist.shift();
      updCnt();
    }
  }
  function updCnt(){
    const n=cells.length||1, al=cells.filter(a=>a.st===1).length, f=k=>cells.filter(a=>a.st===1&&a.sp.includes(k)).length;
    cnt.innerHTML=`<li><span><i style="background:${C.blau}"></i>Bacteris vius</span><b>${Math.round(al/n*100)} %</b></li>`+
      `<li><span><i style="background:${VC[0]}"></i>Recorden el virus A</span><b>${Math.round(f(0)/n*100)} %</b></li>`+
      `<li><span><i style="background:${VC[1]}"></i>Recorden el virus B</span><b>${Math.round(f(1)/n*100)} %</b></li>`+
      `<li><span><i style="background:${VC[2]}"></i>Recorden el mutant</span><b>${Math.round(f(2)/n*100)} %</b></li>`;
  }
  function drawColony(){
    if(!W||!c)return;
    c.clearRect(0,0,W,H);
    const rx=R*.9, ry=R*.62;
    for(let idx=0;idx<cells.length;idx++){
      const a=cells[idx], isHov=idx===hovIdx;
      /* Halo daurat suau d'aquarel·la quan el bacteri talla un virus immune */
      if(a.fl>0){
        canvasWash(c,a.x,a.y,R*(1.45+(1-a.fl)*.55),C.groc,.55*a.fl,.16*a.fl);
      }
      c.save();
      c.translate(a.x,a.y); c.rotate(a.ang);
      if(a.st===0){
        c.setLineDash([2,2]); c.strokeStyle=isHov?C.ink:C.hair; c.lineWidth=isHov?1.2:.75;
        c.beginPath(); c.roundRect(-rx,-ry,rx*2,ry*2,ry); c.stroke();
        c.restore(); continue;
      }
      /* Càpsula bacteriana translúcida */
      c.beginPath(); c.roundRect(-rx,-ry,rx*2,ry*2,ry);
      c.fillStyle=a.st===2?V.alpha(C.vermell,.24):V.alpha(C.blau,.11);
      c.fill();
      /* Barres d'espaiadors interiors nítides (petit arxiu CRISPR dins la càpsula) */
      if(a.sp.length){
        c.save(); c.clip();
        const bw=Math.max(2.4,rx*.32), gap=1.4, xStart=-rx+3.2;
        for(let i=0;i<a.sp.length;i++){
          c.fillStyle=VC[a.sp[i]];
          c.fillRect(xStart+i*(bw+gap),-ry+2.2,bw,(ry-2.2)*2);
        }
        c.restore();
      }
      c.strokeStyle=isHov?C.ink:a.st===2?C.vermell:V.alpha(C.blau,.78);
      c.lineWidth=isHov?1.7:a.st===2?1.5:.95;
      c.beginPath(); c.roundRect(-rx,-ry,rx*2,ry*2,ry); c.stroke();
      if(a.fl>0){
        c.strokeStyle=C.grocFosc; c.globalAlpha=a.fl*.85; c.lineWidth=1.4;
        c.beginPath(); c.roundRect(-rx-2.2,-ry-2.2,(rx+2.2)*2,(ry+2.2)*2,ry+2.2); c.stroke();
      }
      c.restore();
    }
    /* Ràfegues suaus d'aquarel·la a la lisi */
    for(const f of fx){
      const p=f.t/.65;
      canvasWash(c,f.x,f.y,R*(.9+p*1.6),C.vermell,.26*(1-p),0);
      c.fillStyle=C.vermell; c.globalAlpha=(1-p)*.85;
      for(let k=0;k<6;k++){ const an=k/6*6.2832+p, d=R*(.4+p*1.8); c.beginPath(); c.arc(f.x+Math.cos(an)*d,f.y+Math.sin(an)*d,1.3,0,6.2832); c.fill(); }
      c.globalAlpha=1;
    }
  }
  function drawChart(){
    if(!CW||!cc)return;
    const ml=36, mr=38, mt=14, mb=22, ph=CHH-mt-mb, pw=CW-ml-mr, Yc=v=>mt+ph*(1-v);
    cc.clearRect(0,0,CW,CHH);
    [0,.5,1].forEach(v=>{
      cc.strokeStyle=v===0?C.ink:C.grid; cc.lineWidth=v===0?.9:.65;
      cc.beginPath(); cc.moveTo(ml,Yc(v)+.5); cc.lineTo(CW-mr,Yc(v)+.5); cc.stroke();
      txt(cc,[[Math.round(v*100)+" %",false,C.muted]],ml-6,Yc(v)+4,"right",11,1,false);
    });
    const n=hist.length;
    if(n>1){
      /* Bany d'aquarel·la sota la corba de bacteris vius (TIME-02) */
      const ag=cc.createLinearGradient(0,mt,0,Yc(0));
      ag.addColorStop(0,V.alpha(C.blau,.14)); ag.addColorStop(1,V.alpha(C.blau,.01));
      cc.fillStyle=ag; cc.beginPath(); cc.moveTo(ml,Yc(0));
      hist.forEach((h,i)=>{ cc.lineTo(ml+i*(pw/(NS-1)),Yc(h[0])); });
      cc.lineTo(ml+(n-1)*(pw/(NS-1)),Yc(0)); cc.closePath(); cc.fill();

      [[1,VC[0],1.6],[2,C.groc,2.3],[3,VC[2],1.7],[0,C.blau,2.1]].forEach(([k,col,lw])=>{
        cc.strokeStyle=col; cc.lineWidth=lw; cc.lineJoin="round"; cc.beginPath();
        hist.forEach((h,i)=>{ const x=ml+i*(pw/(NS-1)), y=Yc(h[k]); i?cc.lineTo(x,y):cc.moveTo(x,y); });
        cc.stroke();
        const lx=ml+(n-1)*(pw/(NS-1)), ly=Yc(hist[n-1][k]);
        cc.fillStyle=col===C.groc?C.grocFosc:col; cc.strokeStyle=C.paper; cc.lineWidth=1.2;
        cc.beginPath(); cc.arc(lx,ly,2.8,0,6.2832); cc.fill(); cc.stroke();
      });
      const lastAlive=Math.round(hist[n-1][0]*100);
      const lx=ml+(n-1)*(pw/(NS-1)), ly=Yc(hist[n-1][0]);
      txt(cc,[[lastAlive+" %",true,C.blau]],lx+6,clamp(ly+4,mt+10,Yc(0)-4),"left",11,1);
    }
    txt(cc,[["Evolució en directe (últims 60 s) →",false,C.muted]],CW-mr,CHH-4,"right",11,1,false);
  }

  V.mount(simEl,(el,w)=>{
    W=w; const mob=w<560; R=mob?9.5:11;
    cols=Math.max(10,Math.floor((W-R)/(R*2))); rows=mob?14:16;
    H=Math.round(rows*R*1.75+R*1.2);
    const {c:cv,ctx}=V.canvas(el,W,H,"Simulació d'una colònia de bacteris: en alliberar un virus, els bacteris sense espaiador moren, alguns supervivents guarden un espaiador i transmeten la immunitat als seus descendents.");
    c=ctx;
    if(cells.length!==cols*rows)init();
    tp=V.tip(el);
    cv.style.cursor="pointer";
    V.hover(cv,(ev,[mx,my])=>{
      let bi=-1, bd=(R*1.45)**2;
      for(let i=0;i<cells.length;i++){ const d=(cells[i].x-mx)**2+(cells[i].y-my)**2; if(d<bd){ bd=d; bi=i; } }
      hovIdx=bi;
      if(bi<0){ tp.hide(); return; }
      const a=cells[bi];
      if(a.st===0)tp.show("<b>Lloc buit</b> · Un bacteri veí el reomplirà en dividir-se");
      else if(a.st===2)tp.show(`<b>Bacteri infectat</b> (${VN[a.v]}) · A punt de patir lisi`);
      else {
        const spTxt=a.sp.length?a.sp.map(k=>SPN[k]).join(", "):"cap (vulnerable)";
        tp.show(`<b>Bacteri viu</b> · Espaiadors: ${spTxt} · Clica per deixar-hi caure un virus A`);
      }
      if(RM)drawColony();
    },()=>{ hovIdx=-1; tp.hide(); if(RM)drawColony(); });
    cv.addEventListener("click",e=>{
      const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
      let bi=-1, bd=1e9;
      cells.forEach((a,i)=>{ const d=(a.x-mx)**2+(a.y-my)**2; if(d<bd){ bd=d; bi=i; } });
      if(bi>=0)release(0,bi);
    });
    if(el.__loop)el.__loop.stop();
    el.__loop=V.loop(el,(t,dt)=>{ if(!RM)step(Math.min(dt/1000,.05)); drawColony(); drawChart(); });
    drawColony();
  });

  V.mount(chEl,(el,w)=>{
    CW=w; const {ctx}=V.canvas(el,CW,CHH,"Evolució temporal del percentatge de bacteris vius i dels que recorden cada virus en els últims 60 segons.");
    cc=ctx; drawChart();
  });

  btns.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; release(+b.dataset.v); });
  reset.addEventListener("click",()=>{ init(); drawColony(); drawChart(); });
})();

/* =====================================================================
   8. TIME-15 CRONOLOGIA EDITORIAL DEL CRISPR (1987–2023)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("tline-viz"); if(!vizEl)return;
  const card=document.getElementById("tlCard"), lgEl=document.getElementById("tline-lg");
  if(lgEl)V.legendCat(lgEl,[
    {c:C.blau,t:"Descobriment biològic (1987–2011)"},
    {c:C.vermell,t:"Eina i clínica (2012–2023)"}
  ]);

  const EV=[
    [1987,"Unes repeticions estranyes","Un equip japonès troba en l'ADN d'<i>E. coli</i> cinc repeticions de 29 lletres separades per trossos de 32. No en sap la funció.","Ishino et al., J Bacteriol"],
    [1993,"Mojica, a Alacant","En <i>Haloferax mediterranei</i>, un arqueu de les salines, Francisco Mojica i els seus col·legues de la Universitat d'Alacant hi troben 14 repeticions de 30 lletres, separades a intervals regulars.","Mojica, Juez i Rodríguez-Valera, Mol Microbiol","Mojica"],
    [2000,"Són a tot arreu","El grup de Mojica mostra que la mateixa família de repeticions apareix en molts arqueus i bacteris diferents.","Mojica et al., Mol Microbiol"],
    [2002,"Neix el nom CRISPR","Un grup de la Universitat d'Utrecht encunya la sigla i descobreix els gens <i>cas</i>, que sempre són al costat de l'arxiu.","Jansen et al., Mol Microbiol"],
    [2005,"Retrats de virus","Mojica, al febrer, i dos equips francesos poc després publiquen que els espaiadors venen de virus i plasmidis. Proposen que són una memòria immunitària.","Mojica et al., J Mol Evol; Pourcel et al. i Bolotin et al., Microbiology","Memòria viral"],
    [2007,"La prova, en un bacteri del iogurt","A l'empresa Danisco, <i>Streptococcus thermophilus</i> guarda espaiadors nous després d'un atac de fags i es torna resistent. Treure o afegir espaiadors canvia la resistència.","Barrangou et al., Science"],
    [2008,"Guies d'ARN contra ADN","L'arxiu es copia en petites guies d'ARN, i el que el sistema ataca és l'ADN de l'invasor.","Brouns et al.; Marraffini i Sontheimer, Science"],
    [2010,"Talls a l'ADN del virus","Es comprova que el sistema de <i>S. thermophilus</i> talla l'ADN dels fags i dels plasmidis, i que hi intervé la proteïna Cas9.","Garneau et al., Nature"],
    [2011,"La peça que faltava","L'equip d'Emmanuelle Charpentier, entre Viena i Umeå (Suècia), descobreix el tracrRNA, un segon ARN imprescindible en el sistema de Cas9 de <i>Streptococcus pyogenes</i>.","Deltcheva et al., Nature"],
    [2012,"Unes tisores programables","Charpentier i Jennifer Doudna demostren que Cas9 guiada per un sol ARN dissenyat a mida talla l'ADN que es vulgui. Gairebé alhora, l'equip de Virginijus Šikšnys, a Vílnius, publica que el complex de Cas9 amb el seu ARN talla ADN de manera específica.","Jinek et al., Science; Gasiunas et al., PNAS","Cas9 editor"],
    [2013,"Edició en cèl·lules humanes","Dos equips de Boston i Cambridge (EUA), el de Feng Zhang al Broad Institute i el de George Church a Harvard, editen gens en cèl·lules humanes amb CRISPR-Cas9.","Cong et al.; Mali et al., Science"],
    [2020,"El Nobel de Química","El 7 d'octubre, l'Acadèmia sueca premia Charpentier i Doudna «pel desenvolupament d'un mètode per editar genomes».","nobelprize.org","Nobel"],
    [2023,"El primer medicament","El 15 de novembre, el Regne Unit autoritza el Casgevy, el primer medicament basat en CRISPR, per a l'anèmia falciforme i la beta-talassèmia que depèn de transfusions.","MHRA","Casgevy"]
  ];

  let sel=4, renderSel=null, clearTl=null;
  document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!vizEl.contains(ev.target)&&clearTl)clearTl(); });
  function updCard(){
    const e=EV[sel];
    card.innerHTML=`<h3><span class="y">${e[0]}</span>${e[1]}</h3><p>${e[2]}</p><p class="tsrc">${e[3]}</p>`;
    if(renderSel)renderSel();
  }

  V.mount(vizEl,(el,W)=>{
    const vert=W<600;
    const tp=V.tip(el);
    const uid="tl"+Math.random().toString(36).slice(2,6);

    if(vert){
      /* Transposició vertical a mòbil (< 600 px) amb cercles d'aquarel·la radialGradient + multiply */
      const rowH=42, mt=10, mb=10, axX=54;
      const H=mt+EV.length*rowH+mb;
      const s=V.svg(el,W,H,"Línia del temps vertical del CRISPR del 1987 al 2023: toca qualsevol any per llegir-ne el detall a la fitxa inferior.");
      s.attr("tabindex",0);
      const defs=s.append("defs");
      const gBlu=addWashGrad(defs,uid+"b",C.blau,.44,.22,.05);
      const gRed=addWashGrad(defs,uid+"r",C.vermell,.5,.26,.06);

      const g=s.append("g");
      g.append("line").attr("x1",axX).attr("x2",axX).attr("y1",mt+rowH/2).attr("y2",H-mb-rowH/2).attr("stroke",C.hair).attr("stroke-width",1);

      const pts=g.append("g").selectAll("g.ev").data(EV).join("g").attr("class","ev").style("cursor","pointer");
      pts.each(function(e,i){
        const q=d3.select(this), cy=mt+i*rowH+rowH/2, isRed=e[0]>=2012, col=isRed?C.vermell:C.blau;
        q.append("rect").attr("x",0).attr("y",cy-rowH/2).attr("width",W).attr("height",rowH).attr("fill","transparent");
        if(i<EV.length-1)q.append("line").attr("x1",axX+16).attr("x2",W-4).attr("y1",cy+rowH/2).attr("y2",cy+rowH/2).attr("stroke",C.grid).attr("stroke-width",.55);
        q.append("circle").attr("class","halo").attr("cx",axX).attr("cy",cy).attr("r",9.5)
          .attr("fill",isRed?gRed:gBlu).style("mix-blend-mode","multiply");
        q.append("circle").attr("class","rim").attr("cx",axX).attr("cy",cy).attr("r",9.5)
          .attr("fill","none").attr("stroke",V.alpha(col,.35)).attr("stroke-width",.7);
        q.append("circle").attr("class","core").attr("cx",axX).attr("cy",cy).attr("r",3.2)
          .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.1);
        V.t(q,axX-14,cy+4,String(e[0]),{size:12,weight:700,fill:col,anchor:"end"}).attr("class","tyr");
        V.t(q,axX+16,cy+4,e[1],{size:12.5,weight:500,fill:C.ink2,anchor:"start"}).attr("class","ttl");
      });

      renderSel=function(){
        pts.each(function(d,i){
          const on=i===sel, q=d3.select(this), col=d[0]>=2012?C.vermell:C.blau;
          q.select(".halo").transition().duration(RM?0:180).attr("r",on?13.5:9.5);
          q.select(".rim").transition().duration(RM?0:180).attr("r",on?13.5:9.5).attr("stroke",on?C.ink:V.alpha(col,.35)).attr("stroke-width",on?1.3:.7);
          q.select(".core").attr("r",on?4.4:3.2).attr("stroke",on?C.ink:"#fff").attr("stroke-width",on?1.5:1.1);
          q.select(".ttl").attr("font-weight",on?700:500).attr("fill",on?C.ink:C.ink2);
        });
      };

      clearTl=()=>{ V.focus(pts,null); tp.hide(); };
      pts.on("click",(ev,d)=>{ sel=EV.indexOf(d); updCard(); });
      s.on("keydown",e=>{
        if(e.key==="ArrowDown"||e.key==="ArrowRight"){ sel=Math.min(EV.length-1,sel+1); updCard(); }
        if(e.key==="ArrowUp"||e.key==="ArrowLeft"){ sel=Math.max(0,sel-1); updCard(); }
      });

      renderSel();
      V.onView(el,inst=>{
        if(inst)return;
        pts.style("opacity",0).transition().delay((d,i)=>i*22).duration(360).ease(d3.easeCubicOut).style("opacity",1);
      });
      return;
    }

    /* Escriptori: cronologia editorial TIME-15 amb cercles d'aquarel·la i fites anotades */
    const H=148, ml=22, mr=22, y0=86;
    const s=V.svg(el,W,H,"Línia del temps del CRISPR del 1987 al 2023: repeticions a E. coli, Mojica a Alacant, el nom CRISPR, l'origen víric dels espaiadors, la prova experimental, Cas9 com a eina, el Nobel del 2020 i el primer medicament el 2023.");
    s.attr("tabindex",0);
    const defs=s.append("defs");
    const gBlu=addWashGrad(defs,uid+"b",C.blau,.46,.22,.05);
    const gRed=addWashGrad(defs,uid+"r",C.vermell,.52,.26,.06);

    const X=d3.scaleLinear([1985,2025],[ml,W-mr]);
    const g=s.append("g");

    /* Separador editorial entre fase biològica i eina/clínica (2011,5) */
    const xSplit=X(2011.5);
    g.append("line").attr("x1",xSplit).attr("x2",xSplit).attr("y1",20).attr("y2",y0+28)
      .attr("stroke",C.hair).attr("stroke-width",.8).attr("stroke-dasharray","2 3");
    V.t(g,xSplit-8,28,"← Descobriment biològic",{size:11,italic:true,fill:C.muted,anchor:"end"});
    V.t(g,xSplit+8,28,"Eina i clínica →",{size:11,italic:true,fill:C.muted,anchor:"start"});

    g.append("line").attr("x1",X(1985)).attr("x2",X(2025)).attr("y1",y0).attr("y2",y0).attr("stroke",C.hair).attr("stroke-width",.9);
    V.axisX(g,X,y0,d3.range(1985,2026,5),y=>String(y));

    /* Etiquetes subtils de fites clau a sota de l'eix */
    const gKey=g.append("g").style("pointer-events","none");
    EV.forEach(e=>{
      if(!e[4])return;
      const x=X(e[0]), col=e[0]>=2012?C.vermell:C.blau;
      V.t(gKey,clamp(x,34,W-34),y0+36,e[4],{size:11,weight:600,fill:col,anchor:"middle",halo:3});
    });

    const gSel=g.append("g").style("pointer-events","none");
    const pts=g.append("g").selectAll("g.ev").data(EV).join("g").attr("class","ev").style("cursor","pointer");
    pts.each(function(e){
      const q=d3.select(this), x=X(e[0]), isRed=e[0]>=2012, col=isRed?C.vermell:C.blau;
      const r0=e[4]?13.5:10;
      q.append("circle").attr("class","halo").attr("cx",x).attr("cy",y0).attr("r",r0)
        .attr("fill",isRed?gRed:gBlu).style("mix-blend-mode","multiply");
      q.append("circle").attr("class","rim").attr("cx",x).attr("cy",y0).attr("r",r0)
        .attr("fill","none").attr("stroke",V.alpha(col,.34)).attr("stroke-width",.75);
      q.append("circle").attr("class","core").attr("cx",x).attr("cy",y0).attr("r",3.4)
        .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.2);
      q.append("rect").attr("x",x-12).attr("y",y0-30).attr("width",24).attr("height",52).attr("fill","transparent");
    });

    renderSel=function(){
      const e=EV[sel], x=X(e[0]), col=e[0]>=2012?C.vermell:C.blau;
      gSel.selectAll("*").remove();
      gSel.append("line").attr("x1",x).attr("x2",x).attr("y1",y0-17).attr("y2",y0-36).attr("stroke",C.ink).attr("stroke-width",.9);
      V.t(gSel,clamp(x,44,W-44),y0-42,`${e[0]} · ${e[1]}`,{size:13,weight:700,fill:col,anchor:"middle",halo:4});
      pts.each(function(d,i){
        const on=i===sel, q=d3.select(this), c2=d[0]>=2012?C.vermell:C.blau, baseR=d[4]?13.5:10;
        q.select(".halo").transition().duration(RM?0:180).attr("r",on?17.5:baseR);
        q.select(".rim").transition().duration(RM?0:180).attr("r",on?17.5:baseR).attr("stroke",on?C.ink:V.alpha(c2,.34)).attr("stroke-width",on?1.4:.75);
        q.select(".core").attr("r",on?4.8:3.4).attr("stroke",on?C.ink:"#fff").attr("stroke-width",on?1.6:1.2);
      });
    };

    clearTl=()=>{ V.focus(pts,null); tp.hide(); };
    pts.on("pointerenter",(ev,d)=>{
      V.focus(pts,x=>x[0]===d[0],{dim:.48});
      tp.show(`<b>${d[0]} · ${d[1]}</b> · Clica per llegir-ne el detall`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType==="mouse"){ V.focus(pts,null); tp.hide(); }
    }).on("click",(ev,d)=>{
      sel=EV.indexOf(d); updCard();
      tp.show(`<b>${d[0]} · ${d[1]}</b>`);
    });
    s.on("keydown",e=>{
      if(e.key==="ArrowRight"){ sel=Math.min(EV.length-1,sel+1); updCard(); }
      if(e.key==="ArrowLeft"){ sel=Math.max(0,sel-1); updCard(); }
    });

    renderSel();
    V.onView(el,inst=>{
      if(inst)return;
      pts.style("opacity",0).transition().delay((d,i)=>i*30).duration(420).ease(d3.easeCubicOut).style("opacity",1);
    });
  });

  document.getElementById("tlPrev").addEventListener("click",()=>{ sel=Math.max(0,sel-1); updCard(); });
  document.getElementById("tlNext").addEventListener("click",()=>{ sel=Math.min(EV.length-1,sel+1); updCard(); });
  updCard();
})();
})();
