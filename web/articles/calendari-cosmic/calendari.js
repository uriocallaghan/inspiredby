/* El calendari còsmic — làmines astronòmiques amb el sistema infogràfic d'Inspired by Magazine (IBV).
   Escala: l'edat de l'univers (Planck 2018/2020: 13.787 milions d'anys) comprimida en un any de 365 dies.
   Peces aplicades:
   - Scrollytelling: TIME-10 (anell astronòmic anual), TIME-07 (calendaris mensuals d'alta precisió),
     TIME-12 (rellotges astronòmics 24 h / 60 min / 60 s) i SCALE-04 (escala final de 5 segons).
   - L'any repartit: SCALE-02 (quadrats d'escala amb aquarel·la), TIME-15 (temps profund logarítmic, vertical a mòbil)
     i PART-06 (constel·lació de cercles d'aquarel·la).
   - La teva vida: SCALE-04 (escala comparativa de l'últim segon amb arcs de proporció ×N).
   Dades i fonts: research/calendari-events.csv i research/validacio-calendari-cosmic.md */
(function(){
"use strict";

const V=window.IBV, C=V.C;
const T=13.787e9, YEAR=365*86400, SPY=T/YEAR;
const sec=ya=>ya/SPY;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f"), f2=V.fmt(",.2f"), f3=V.fmt(",.3f");
const EIO=d3.easeCubicInOut;

/* Paleta estricta de 3 colors (vermell, blau, groc) + grisos. Mai text en groc. */
const CAT_COL={cos:C.blau, life:C.groc, hum:C.vermell};
const CAT_STROKE={cos:C.blau, life:C.grocFosc, hum:C.vermell};
const CAT_BADGE_TXT={cos:"#fff", life:C.ink, hum:"#fff"};
const CAT_NAME={cos:"Univers", life:"Terra i vida", hum:"Humans"};

const MESL=["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"];
const MD=[31,28,31,30,31,30,31,31,30,31,30,31], M0=[0];
for(let i=1;i<12;i++)M0[i]=M0[i-1]+MD[i-1];
const deMes=m=>/^[ao]/i.test(MESL[m])?"d'"+MESL[m].toLowerCase():"de "+MESL[m].toLowerCase();

const EV=[
 ["bigbang",13.787e9,"Big Bang","cos",1],["cmb",13.7866e9,"Primers àtoms","cos",3],
 ["firststars",13.637e9,"Primeres estrelles","cos",2],["firstgalaxies",13.507e9,"Primeres galàxies","cos",3],
 ["milkyway",13.0e9,"Via Làctia","cos",2],["sun",4.5673e9,"Neix el Sol","cos",1],["moon",4.51e9,"Neix la Lluna","cos",3],
 ["zircon",4.404e9,"Roques més antigues","life",3],["luca",4.2e9,"Avantpassat comú de la vida","life",3],
 ["life",3.48e9,"Primers fòssils de vida","life",1],["goe",2.43e9,"L'aire s'omple d'oxigen","life",2],
 ["eukaryotes",1.65e9,"Cèl·lules complexes","life",2],["multicell",1.56e9,"Pluricel·lulars","life",3],
 ["sex",1.047e9,"Reproducció sexual","life",2],["snowball",7.17e8,"Terra bola de gel","life",3],
 ["ediacara",5.74e8,"Primers animals grans","life",2],["cambrian",5.388e8,"Explosió del Cambrià","life",1],
 ["landplants",4.7e8,"Plantes a terra","life",3],["landanimals",4.25e8,"Animals a terra","life",3],
 ["tetrapods",3.95e8,"Vertebrats a terra","life",2],["permian",2.51941e8,"Gran Mortaldat","life",2],
 ["dinos",2.314e8,"Primers dinosaures","life",2],["mammals",2.05e8,"Primers mamífers","life",3],
 ["flowers",1.3e8,"Primeres flors","life",2],["kpg",6.6043e7,"Asteroide de Chicxulub","life",1],
 ["homochimp",7e6,"Humans i ximpanzés se separen","hum",1],["tools",3.3e6,"Eines de pedra","hum",2],
 ["homo",2.8e6,"Gènere Homo","hum",3],["fire_use",1e6,"Ús del foc","hum",2],["fire_make",4e5,"Encendre foc","hum",3],
 ["sapiens",3.15e5,"Homo sapiens","hum",1],["neander",4e4,"Últims neandertals","hum",2],
 ["americas",2.2e4,"Humans a Amèrica","hum",2],["agri",1.15e4,"Agricultura","hum",1],["writing",5250,"Escriptura","hum",1],
 ["christ",1995,"Cristianisme","hum",2],["columbus",534,"Colom al Carib","hum",2],["frrev",237,"Revolució Francesa","hum",2],
 ["moonlanding",57,"Arribada a la Lluna","hum",1]
].map(e=>{
  const s=sec(e[1]), t=YEAR-s, d=Math.floor(t/86400);
  return {id:e[0],ya:e[1],s,lab:e[2],cat:e[3],pri:e[4],doy:Math.min(364,d),tod:t-d*86400};
});
const BY={}; EV.forEach(e=>{ BY[e.id]=e; });
const EV_BY_DOY={}; EV.forEach(e=>{ (EV_BY_DOY[e.doy]=EV_BY_DOY[e.doy]||[]).push(e); });

const measure=document.createElement("canvas").getContext("2d");
function textW(str,size,wt){ measure.font=(wt||400)+" "+(size||12)+"px "+V.SANS; return measure.measureText(str).width; }
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pad(n){ return (n<10?"0":"")+n; }
function monthOf(doy){ let m=0; while(m<11&&doy>=M0[m]+MD[m])m++; return m; }
function clock(e,secs){ const t=secs?Math.round(e.tod):Math.round(e.tod/60)*60, h=Math.floor(t/3600), m=Math.floor(t%3600/60), s=t%60; return h+":"+pad(m)+(secs?":"+pad(Math.floor(s)):""); }
function fmtS(s){ return (s<.1?f3(s):s<1?f2(s):s<10?f1(s):f0(s))+" s"; }
function fmtAge(ya){
  if(ya>=1e6){
    const m=ya/1e6;
    const s=m>=100?f0(m):f1(m);
    return `fa ${s} ${s==="1"?"milió":"milions"} d'anys`;
  }
  if(ya>=1000) return `fa ${f0(ya)} anys`;
  return `fa ${f0(ya)} anys (${2026-Math.round(ya)})`;
}
function fmtCosmic(e){
  if(e.s<60) return `31 de desembre · a ${fmtS(e.s)} de mitjanit`;
  if(e.s<86400) return `31 de desembre · ${clock(e,e.s<600)}`;
  const m=monthOf(e.doy), d=e.doy-M0[m]+1;
  return `${d} ${deMes(m)}`;
}
function fmtRatio(a,b){
  if(a>=b){ const r=a/b; return "×"+(r>=10?f0(r):f1(r)); }
  const r=b/a; return "÷"+(r>=10?f0(r):f1(r));
}
function eraTint(doy){
  const s=(365-doy)*86400;
  if(doy===364) return V.alpha(C.vermell,.20);
  if(s>BY.sun.s) return V.alpha(C.blau,.10);
  if(s>BY.life.s) return V.alpha(C.ghost,.28);
  if(s>BY.ediacara.s) return V.alpha(C.groc,.18);
  return V.alpha(C.groc,.42);
}
function eraName(doy){
  const s=(365-doy)*86400;
  if(doy===364) return "Últim dia · animals, plantes i llinatge humà";
  if(s>BY.sun.s) return "Abans del Sol i de la Terra";
  if(s>BY.life.s) return "La Terra, sense vida coneguda";
  if(s>BY.ediacara.s) return "Vida microscòpica";
  return "Animals i plantes";
}

let gradSeq=0;
function addWashGrad(defs,col,a0,a1,a2){
  const id="ccw"+(++gradSeq);
  const rg=defs.append("radialGradient").attr("id",id).attr("cx","42%").attr("cy","38%").attr("r","64%");
  rg.append("stop").attr("offset",0).attr("stop-color",col).attr("stop-opacity",a0==null?.42:a0);
  rg.append("stop").attr("offset",.76).attr("stop-color",col).attr("stop-opacity",a1==null?.22:a1);
  rg.append("stop").attr("offset",1).attr("stop-color",col).attr("stop-opacity",a2==null?.04:a2);
  return `url(#${id})`;
}

function separate(items,gap,lo,hi){
  const a=items.slice().sort((p,q)=>p.y-q.y);
  let G=a.map(d=>({it:[d],c:d.y}));
  const top=g=>g.c-(g.it.length-1)*gap/2;
  let again=true, guard=0;
  while(again&&guard++<200){
    again=false;
    for(let i=1;i<G.length;i++){
      const A=G[i-1], B=G[i];
      if(top(B)<top(A)+A.it.length*gap-.01){
        const it=A.it.concat(B.it);
        G.splice(i-1,2,{it,c:d3.mean(it,d=>d.y)});
        again=true; break;
      }
    }
    G.forEach(g=>{
      const t=top(g), b=t+(g.it.length-1)*gap;
      if(t<lo)g.c+=lo-t; else if(b>hi)g.c-=b-hi;
    });
  }
  G.forEach(g=>g.it.forEach((d,i)=>{ d.ly=top(g)+i*gap; }));
  return items;
}

/* =====================================================================
   1. SCROLLYTELLING · L'ANY CÒSMIC PAS A PAS
      TIME-10 (anell astronòmic anual) + TIME-07 (mesos) + TIME-12 (rellotges) + SCALE-04 (5 s)
   ===================================================================== */
const STEPS=[
 {lv:"year",ev:["bigbang"]},
 {lv:"m0",ev:["bigbang","cmb","firststars","firstgalaxies","milkyway"]},
 {lv:"m8",ev:["sun","moon","zircon","luca","life"]},
 {lv:"year",ev:["goe","eukaryotes","multicell","sex"]},
 {lv:"m11",ev:["snowball","ediacara","cambrian","landplants","landanimals","tetrapods"]},
 {lv:"m11",ev:["permian","dinos","mammals","flowers","kpg"]},
 {lv:"day",ev:["homochimp","tools","homo","fire_use"]},
 {lv:"hour",ev:["fire_make","sapiens","neander"]},
 {lv:"min",ev:["americas","agri","writing"]},
 {lv:"sec",ev:["christ","columbus","frrev","moonlanding"]}
];
const HEAD={
  year:["Tot l'any","1 dia = 37,8 milions d'anys"],
  m0:["Gener","1 dia = 37,8 milions d'anys"],
  m8:["Setembre","1 dia = 37,8 milions d'anys"],
  m11:["Desembre","1 dia = 37,8 milions d'anys"],
  day:["31 de desembre","1 hora = 1,6 milions d'anys"],
  hour:["31 de desembre, l'última hora","1 minut = 26.200 anys"],
  min:["L'últim minut","1 segon = 437 anys"],
  sec:["Els últims 5 segons","1 segon = 437 anys"]
};
const PARENT={m0:"year",m8:"year",m11:"year",day:"m11",hour:"day",min:"hour",sec:"min"};

function initScrolly(){
  const plot=document.getElementById("calplot"), lg=document.getElementById("calLg");
  if(!plot)return;
  if(lg&&!lg.childElementCount){
    V.legendCat(lg,[
      {c:C.blau,t:"Univers"},
      {c:C.groc,t:"Terra i vida"},
      {c:C.vermell,t:"Humans"}
    ]);
  }
  const tp=V.tip(plot);
  let W=0, H=0, mob=false, cur=null, curStep=0, svg=null, layers={}, geo={}, timer=null, wash={};

  function draw(el,w){
    W=w; mob=innerWidth<900||w<600;
    H=mob?Math.round(Math.max(204,Math.min(innerHeight*.28,244))):Math.round(Math.min(innerHeight*.60,W*.64,540));
    svg=V.svg(el,W,H,"Làmina astronòmica interactiva de l'any còsmic: anell circular anual, gener, setembre, desembre, rellotges del 31 de desembre, última hora, últim minut i últims cinc segons.");
    const defs=svg.append("defs");
    wash={
      cos:addWashGrad(defs,C.blau,.40,.20,.03),
      life:addWashGrad(defs,C.groc,.52,.28,.04),
      hum:addWashGrad(defs,C.vermell,.46,.24,.03),
      cosHi:addWashGrad(defs,C.blau,.58,.30,.04),
      lifeHi:addWashGrad(defs,C.groc,.72,.38,.05),
      humHi:addWashGrad(defs,C.vermell,.62,.32,.04),
      sweep:addWashGrad(defs,C.vermell,.24,.12,.03),
      eraCos:addWashGrad(defs,C.blau,.22,.12,.06),
      eraEarth:addWashGrad(defs,C.ghost,.46,.28,.14),
      eraMicro:addWashGrad(defs,C.grocClar,.56,.34,.16),
      eraAnim:addWashGrad(defs,C.groc,.62,.40,.20),
      eraHum:addWashGrad(defs,C.vermell,.76,.56,.30)
    };
    layers={}; geo={};
    ["year","m0","m8","m11","day","hour","min","sec"].forEach(k=>{
      layers[k]=svg.append("g").attr("class","lv lv-"+k).attr("opacity",0).style("display","none");
    });
    buildYear();
    [0,8,11].forEach(buildMonth);
    buildDial("day",24,86400);
    buildDial("hour",60,3600);
    buildDial("min",60,60);
    buildSec();
    bindHover();
    const st=STEPS[curStep]||STEPS[0];
    cur=st.lv;
    show(cur,1);
    highlight(true);
    V.onView(el,inst=>{
      if(inst)return;
      const g=layers[cur];
      if(g)g.attr("opacity",0).transition().duration(750).ease(EIO).attr("opacity",1);
    });
  }

  /* ---------- TIME-10: Anell astronòmic de l'any còsmic (1 gen a dalt, 12 h) ---------- */
  function buildYear(){
    const g=layers.year;
    const cx=W/2, cy=H/2+(mob?2:2);
    const R=mob?Math.min(W*.32,H*.34):Math.min(W*.245,H*.39);
    const rIn=R*.71, rMid=(rIn+R)/2;

    // Retícula polar finíssima (0,5 px)
    V.polarGrid(g,cx,cy,R,4,12,{stroke:C.grid,outer:C.hair,rIn:R*.24});

    // Arcs d'aquarel·la translúcids (multiply) per les grans eres
    const aSun=(YEAR-BY.sun.s)/YEAR*2*Math.PI;
    const aLife=(YEAR-BY.life.s)/YEAR*2*Math.PI;
    const aAnim=(YEAR-BY.ediacara.s)/YEAR*2*Math.PI;
    const aDec31=364/365*2*Math.PI;
    const ERAS=[
      {id:"univ",  a0:0,      a1:aSun,     fill:wash.eraCos,   stroke:C.blau,     sop:.42},
      {id:"earth", a0:aSun,   a1:aLife,    fill:wash.eraEarth, stroke:C.ink2,     sop:.28},
      {id:"micro", a0:aLife,  a1:aAnim,    fill:wash.eraMicro, stroke:C.grocFosc, sop:.34},
      {id:"anim",  a0:aAnim,  a1:aDec31,   fill:wash.eraAnim,  stroke:C.grocFosc, sop:.48},
      {id:"dec31", a0:aDec31, a1:2*Math.PI,fill:wash.eraHum,   stroke:C.vermell,  sop:.85}
    ];
    const arcGen=d3.arc().innerRadius(rIn).outerRadius(R);
    const rimArc=d3.arc().innerRadius(R).outerRadius(R);
    const eraG=g.append("g").attr("transform",`translate(${cx},${cy})`);
    ERAS.forEach(er=>{
      eraG.append("path").attr("d",arcGen({startAngle:er.a0,endAngle:er.a1}))
        .attr("fill",er.fill).style("mix-blend-mode","multiply");
      eraG.append("path").attr("d",rimArc({startAngle:er.a0,endAngle:er.a1}))
        .attr("fill","none").attr("stroke",er.stroke).attr("stroke-width",er.id==="dec31"?2.2:1.25).attr("stroke-opacity",er.sop);
    });

    // Vores de gravat (anell interior i exterior)
    g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",rIn).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.6);
    g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.75).attr("stroke-opacity",.75);

    // 365 marques radials finíssimes de dies (en un sol path SVG per màxima lleugeresa)
    let dayPath="", monthPath="";
    const monthStarts=new Set(M0);
    for(let d=0;d<365;d++){
      const a=d/365*2*Math.PI, sn=Math.sin(a), cs=-Math.cos(a);
      if(monthStarts.has(d)){
        const r0=rIn, r1=R+(mob?5.5:7.5);
        monthPath+=`M${(cx+sn*r0).toFixed(1)},${(cy+cs*r0).toFixed(1)}L${(cx+sn*r1).toFixed(1)},${(cy+cs*r1).toFixed(1)}`;
      } else {
        const r0=R, r1=R+(mob?2.5:3.8);
        dayPath+=`M${(cx+sn*r0).toFixed(1)},${(cy+cs*r0).toFixed(1)}L${(cx+sn*r1).toFixed(1)},${(cy+cs*r1).toFixed(1)}`;
      }
    }
    g.append("path").attr("d",dayPath).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.45);
    g.append("path").attr("d",monthPath).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.7).attr("stroke-opacity",.65);

    // Meridià de mitjanit (00:00 / 24:00 a dalt)
    g.append("line").attr("x1",cx).attr("x2",cx).attr("y1",cy-R-(mob?8:10)).attr("y2",cy-rIn+3)
      .attr("stroke",C.vermell).attr("stroke-width",1.15);

    // Etiquetes dels 12 mesos a l'exterior de l'anell
    for(let m=0;m<12;m++){
      const a=(M0[m]+MD[m]/2)/365*2*Math.PI;
      const rl=R+(mob?13:18);
      const lx=cx+Math.sin(a)*rl, ly=cy-Math.cos(a)*rl+3.8;
      V.t(g,lx,ly,mob?V.MES1[m]:V.MES[m],{anchor:"middle",size:mob?11:11.5,weight:m===0||m===8||m===11?600:400,fill:m===11?C.ink:C.muted});
    }

    // Tots els 39 fets reals com a perles translúcides sobre l'anell
    const doyCount={}, doySeen={};
    EV.forEach(e=>{ doyCount[e.doy]=(doyCount[e.doy]||0)+1; });
    const pearls=EV.map(e=>{
      const a=clamp((YEAR-e.s)/YEAR,0,.9999)*2*Math.PI;
      const cnt=doyCount[e.doy], idx=doySeen[e.doy]=(doySeen[e.doy]||0);
      doySeen[e.doy]++;
      const rad=cnt===1?rMid:rIn+4+(R-rIn-8)*(idx/Math.max(1,cnt-1));
      return {e,a,r:rad,x:cx+Math.sin(a)*rad,y:cy-Math.cos(a)*rad,right:Math.sin(a)>=0};
    });
    const pearlById={}; pearls.forEach(p=>{ pearlById[p.e.id]=p; });
    geo.year={cx,cy,R,rIn,rMid,pearls,pearlById};

    const pG=g.append("g").attr("class","pearls");
    pearls.forEach(p=>{
      pG.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",mob?4:5.5)
        .attr("fill",wash[p.e.cat]).style("mix-blend-mode","multiply");
      pG.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",mob?1.6:2.1)
        .attr("fill",CAT_COL[p.e.cat]).attr("stroke","#fff").attr("stroke-width",.55);
    });

    // Cambra central astronòmica
    V.t(g,cx,cy-(mob?3:5),"365 dies",{anchor:"middle",serif:true,weight:600,size:mob?17:25,fill:C.ink,halo:3.5}).attr("class","ctr1");
    V.t(g,cx,cy+(mob?12:15),"13.787 Ma",{anchor:"middle",size:mob?11:12,fill:C.ink2,halo:2.5}).attr("class","ctr2");

    g.append("g").attr("class","marks");
    g.append("g").attr("class","hv").style("pointer-events","none");
  }

  /* ---------- TIME-07: Calendari mensual tipogràfic d'alta precisió ---------- */
  function buildMonth(m){
    const g=layers["m"+m], cols=7, rows=5, gap=mob?3:5, top=4;
    const cs=Math.min((W-gap*(cols-1))/cols,(H-top-gap*(rows-1))/rows);
    const ox=(W-(cs*cols+gap*(cols-1)))/2;
    const cells=[];
    geo["m"+m]={m,cs,gap,ox,top,cells};
    for(let d=0;d<MD[m];d++){
      const doy=M0[m]+d, x=ox+(d%7)*(cs+gap), y=top+Math.floor(d/7)*(cs+gap);
      cells.push({doy,m,d:d+1,x,y,w:cs});
      const cg=g.append("g").attr("class","mc mc"+doy);
      cg.append("rect").attr("x",x).attr("y",y).attr("width",cs).attr("height",cs).attr("rx",1.5)
        .attr("fill",eraTint(doy)).attr("stroke",C.hair).attr("stroke-width",.5);
      V.t(cg,x+6,y+(mob?14:17),d+1,{size:mob?11:12.5,weight:600,fill:C.muted});
      if(EV_BY_DOY[doy]){
        const e0=EV_BY_DOY[doy][0];
        cg.append("circle").attr("cx",x+cs-8).attr("cy",y+10).attr("r",mob?2:2.6)
          .attr("fill",CAT_COL[e0.cat]).attr("fill-opacity",.5);
      }
    }
    g.append("g").attr("class","marks");
    g.append("g").attr("class","hv").style("pointer-events","none");
  }
  function monthCell(m,d){
    const o=geo["m"+m];
    return {x:o.ox+(d%7)*(o.cs+o.gap),y:o.top+Math.floor(d/7)*(o.cs+o.gap),w:o.cs};
  }

  /* ---------- TIME-12: Rellotges astronòmics sobre paper (24 h, 60 min, 60 s) ---------- */
  function dialGeo(){
    const R=Math.min(W*(mob?.33:.245),H*(mob?.37:.39));
    return {cx:W/2,cy:H/2+(mob?2:4),R};
  }
  function buildDial(k,n,span){
    const g=layers[k], o=dialGeo();
    geo[k]={cx:o.cx,cy:o.cy,R:o.R,n,span,pts:[]};
    // Retícula polar ultra-fina (0,5 px, sense fons pintat, P1)
    V.polarGrid(g,o.cx,o.cy,o.R,4,k==="day"?24:12,{stroke:C.grid,outer:C.hair,rIn:o.R*.26});
    g.append("circle").attr("cx",o.cx).attr("cy",o.cy).attr("r",o.R-5.5).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.45);
    g.append("circle").attr("cx",o.cx).attr("cy",o.cy).attr("r",o.R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.85);
    for(let i=0;i<n;i++){
      const a=i/n*2*Math.PI, major=k==="day"?i%3===0:i%5===0, r0=o.R-(major?9.5:4.5);
      g.append("line")
        .attr("x1",o.cx+Math.sin(a)*r0).attr("y1",o.cy-Math.cos(a)*r0)
        .attr("x2",o.cx+Math.sin(a)*o.R).attr("y2",o.cy-Math.cos(a)*o.R)
        .attr("stroke",major?C.ink2:C.hair).attr("stroke-width",major?1.0:.5);
      if(major&&(k!=="hour"&&k!=="min"||!mob||i%15===0)&&(k!=="day"||!mob||i%6===0)){
        const rl=o.R-(mob?19:22), lab=k==="day"?(i+" h"):k==="hour"?"23:"+pad(i):":"+pad(i);
        V.t(g,o.cx+Math.sin(a)*rl,o.cy-Math.cos(a)*rl+4,lab,{anchor:"middle",size:11,fill:C.muted});
      }
    }
    g.append("path").attr("class","sweep").attr("fill",wash.sweep).style("mix-blend-mode","multiply");
    g.append("path").attr("class","rim-arc").attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.9);
    V.t(g,o.cx,o.cy-4,"",{anchor:"middle",serif:true,weight:600,size:mob?21:30,fill:C.ink,halo:4}).attr("class","ctr1");
    V.t(g,o.cx,o.cy+16,"",{anchor:"middle",size:mob?11:12.5,fill:C.ink2,halo:3}).attr("class","ctr2");
    g.append("g").attr("class","marks");
    g.append("g").attr("class","hv").style("pointer-events","none");
  }
  function dialAngle(k,s){ const o=geo[k]; return (1-s/o.span)*2*Math.PI; }

  /* ---------- SCALE-04: Escala final dels últims 5 segons amb arcs de compressió ---------- */
  function buildSec(){
    const g=layers.sec, x0=mob?14:36, x1=W-(mob?14:36), y=H*(mob?.62:.72);
    geo.sec={x0,x1,y,span:5,pts:[]};
    g.append("line").attr("x1",x0).attr("x2",x1).attr("y1",y).attr("y2",y).attr("stroke",C.ink).attr("stroke-width",1);
    for(let i=0;i<=50;i++){
      const x=x0+(x1-x0)*i/50, maj=i%10===0;
      g.append("line").attr("x1",x).attr("x2",x).attr("y1",y).attr("y2",y+(maj?8:4))
        .attr("stroke",maj?C.ink:C.hair).attr("stroke-width",maj?.95:.5);
      if(maj&&(!mob||i===0||i===20||i===40||i===50)){
        const anc=i===0?"start":i===50?"end":"middle";
        V.t(g,x,y+21,i===50?"24:00":"23:59:5"+(5+i/10),{anchor:anc,size:11.5,fill:i===50?C.ink:C.muted,weight:i===50?700:400});
      }
    }
    const life=80/SPY, lx=x1-(x1-x0)*life/5;
    g.append("rect").attr("x",lx).attr("y",y-12).attr("width",Math.max(2.5,x1-lx)).attr("height",12)
      .attr("fill",C.vermell).attr("fill-opacity",.30).style("mix-blend-mode","multiply");
    g.append("line").attr("x1",lx).attr("x2",x1).attr("y1",y).attr("y2",y).attr("stroke",C.vermell).attr("stroke-width",2.4);
    V.note(g,{
      x:(lx+x1)/2, y:y+2, tx:x1-(mob?68:58), ty:y+(mob?46:44), kind:"curve", bend:mob?-10:-12, anchor:"end", size:11.5,
      lines:[["Una vida de 80 anys",true],[f2(life)+" s abans de mitjanit"]]
    });
    g.append("g").attr("class","marks");
    g.append("g").attr("class","hv").style("pointer-events","none");
  }

  /* ---------- Etiquetes i marques del pas actiu ---------- */
  function highlight(instant){
    const st=STEPS[curStep]; if(!st||!svg)return;
    const k=st.lv, g=layers[k], mk=g.select(".marks");
    mk.selectAll("*").remove();
    g.select(".hv").selectAll("*").remove();
    tp.hide();
    const evs=st.ev.map(id=>BY[id]);
    const list=d3.select("#calList").html("");

    /* Anell astronòmic anual (TIME-10) */
    if(k==="year"){
      const o=geo.year, fs=mob?11.5:12.5;
      const pts=evs.map(e=>{
        const p=o.pearlById[e.id];
        return {e,a:p.a,x:p.x,y:p.y,right:p.e.id==="bigbang"?true:p.right};
      });
      o.activePts=pts;

      if(mob){
        const lr=o.R+19, minAng=21/lr;
        const bPts=pts.map((p,i)=>({p,i,ba:p.a})).sort((a,b)=>a.ba-b.ba);
        for(let pass=0;pass<8;pass++){
          for(let j=1;j<bPts.length;j++){
            const diff=bPts[j].ba-bPts[j-1].ba;
            if(diff<minAng){
              const push=(minAng-diff)/2;
              bPts[j-1].ba-=push; bPts[j].ba+=push;
            }
          }
        }
        bPts.sort((a,b)=>a.i-b.i).forEach(({p,i,ba})=>{
          const e=p.e, col=CAT_COL[e.cat];
          const bx=o.cx+Math.sin(ba)*lr, by=o.cy-Math.cos(ba)*lr;
          const eg=mk.append("g").datum(p).attr("class","emk");
          eg.append("line").attr("x1",o.cx+Math.sin(p.a)*o.rIn).attr("y1",o.cy-Math.cos(p.a)*o.rIn)
            .attr("x2",p.x).attr("y2",p.y).attr("stroke",CAT_STROKE[e.cat]).attr("stroke-width",.8).attr("stroke-opacity",.65);
          eg.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",10)
            .attr("fill",wash[e.cat+"Hi"]).style("mix-blend-mode","multiply");
          eg.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",3.4)
            .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.1);
          eg.append("circle").attr("cx",bx).attr("cy",by).attr("r",8.5).attr("fill",col);
          V.t(eg,bx,by+3.6,i+1,{anchor:"middle",size:11,weight:700,fill:CAT_BADGE_TXT[e.cat]});
          const m=monthOf(e.doy), d=e.doy-M0[m]+1;
          list.append("li").html(`<b style="background:${col};color:${CAT_BADGE_TXT[e.cat]}">${i+1}</b>${e.lab} <span>${d} ${deMes(m)}</span>`);
        });
      } else {
        // Desktop: anotacions radials quirúrgiques separades als marges laterals
        const gap=40;
        [true,false].forEach(side=>{
          const ps=pts.filter(p=>p.right===side);
          if(ps.length)separate(ps,gap,30,H-30);
        });
        pts.forEach(p=>{
          const e=p.e, col=CAT_COL[e.cat], dx=p.right?1:-1;
          const sx=o.cx+Math.sin(p.a)*(o.R+8), sy=o.cy-Math.cos(p.a)*(o.R+8);
          const ex=o.cx+dx*(o.R+36), tx=ex+dx*6, anc=p.right?"start":"end";
          const eg=mk.append("g").datum(p).attr("class","emk");
          eg.append("line").attr("x1",o.cx+Math.sin(p.a)*o.rIn).attr("y1",o.cy-Math.cos(p.a)*o.rIn)
            .attr("x2",sx).attr("y2",sy).attr("stroke",CAT_STROKE[e.cat]).attr("stroke-width",.8).attr("stroke-opacity",.6);
          eg.append("polyline").attr("points",`${sx},${sy} ${ex-dx*10},${p.ly} ${ex},${p.ly}`)
            .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.75);
          eg.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",14)
            .attr("fill",wash[e.cat+"Hi"]).style("mix-blend-mode","multiply");
          eg.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",4)
            .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.3);
          const m=monthOf(e.doy), d=e.doy-M0[m]+1;
          V.t(eg,tx,p.ly-2,e.lab,{anchor:anc,size:fs,weight:700,fill:C.ink,halo:3});
          V.t(eg,tx,p.ly+13,`${d} ${deMes(m)} · ${fmtAge(e.ya)}`,{anchor:anc,size:11.5,fill:C.ink2,halo:3});
        });
        // Anotació contextual subtil del 31 de desembre al pas 0 (Big Bang)
        if(curStep===0){
          const aH=364.8/365*2*Math.PI;
          const hx=o.cx+Math.sin(aH)*(o.R+6), hy=o.cy-Math.cos(aH)*(o.R+6);
          V.note(mk,{
            x:hx, y:hy, tx:o.cx-o.R-36, ty:Math.max(44,o.cy-o.R*.72), kind:"elbow", anchor:"end", size:11.5, stroke:C.vermell,
            lines:[["31 de desembre",true,C.vermell],["Els humans arriben a les 19:33"]]
          });
          // Etiqueta d'era: Abans del Sol (67 %)
          const aMid=122/365*2*Math.PI;
          const ex=o.cx+Math.sin(aMid)*(o.R+34), ey=o.cy-Math.cos(aMid)*(o.R+34);
          V.t(mk,ex,ey,"Abans del Sol · 67 %",{anchor:"start",size:11.5,italic:true,fill:C.ink2,halo:3});
        }
      }
      if(!instant&&!V.reduced)mk.style("opacity",0).transition().duration(420).style("opacity",1);
      return;
    }

    /* Calendaris mensuals (TIME-07 amb halos d'aquarel·la) */
    if(/^m\d+$/.test(k)){
      const m=+k.slice(1), byDay={};
      evs.forEach(e=>{ (byDay[e.doy]=byDay[e.doy]||[]).push(e); });
      Object.keys(byDay).forEach(doyKey=>{
        const doy=+doyKey, es=byDay[doy], d=doy-M0[m], c=monthCell(m,d);
        const col=CAT_COL[es[0].cat], stCol=CAT_STROKE[es[0].cat];
        const eg=mk.append("g").datum(es[0]).attr("class","emk");
        // Halo d'aquarel·la translúcid multiply sobre el dia
        eg.append("circle").attr("cx",c.x+c.w/2).attr("cy",c.y+c.w/2).attr("r",c.w*.62)
          .attr("fill",wash[es[0].cat+"Hi"]).style("mix-blend-mode","multiply");
        eg.append("rect").attr("x",c.x).attr("y",c.y).attr("width",c.w).attr("height",2.5).attr("fill",stCol);
        eg.append("rect").attr("x",c.x).attr("y",c.y).attr("width",c.w).attr("height",c.w).attr("rx",1.5)
          .attr("fill","none").attr("stroke",stCol).attr("stroke-width",.95);
        V.t(eg,c.x+6,c.y+(mob?14:17),d+1,{size:mob?11:12.5,weight:700,fill:C.ink,halo:2});
        if(!mob&&c.w>=68){
          es.forEach((e,j)=>{ wrapText(eg,e.lab,c.x+6,c.y+34+j*28,c.w-10,11.5,C.ink,600); });
        } else {
          const idxStr=es.map(e=>evs.indexOf(e)+1).join(",");
          eg.append("circle").attr("cx",c.x+c.w/2).attr("cy",c.y+c.w*.62).attr("r",9).attr("fill",col).attr("stroke",stCol).attr("stroke-width",.7);
          V.t(eg,c.x+c.w/2,c.y+c.w*.62+3.8,idxStr,{anchor:"middle",size:11,weight:700,fill:CAT_BADGE_TXT[es[0].cat]});
        }
      });
      if(mob||geo[k].cs<68){
        evs.forEach((e,i)=>{
          const d=e.doy-M0[m]+1, col=CAT_COL[e.cat];
          list.append("li").html(`<b style="background:${col};color:${CAT_BADGE_TXT[e.cat]}">${i+1}</b>${e.lab} <span>${d} ${deMes(m)}</span>`);
        });
      }
      if(!instant&&!V.reduced)mk.style("opacity",0).transition().duration(420).style("opacity",1);
      return;
    }

    /* Últims 5 segons (SCALE-04 amb arcs de compressió temporal) */
    if(k==="sec"){
      const o=geo.sec, fs=mob?11.5:12.5;
      const pts=evs.map((e,i)=>{
        const x=o.x1-(o.x1-o.x0)*e.s/5;
        return {e,x,y:o.y,i};
      });
      o.pts=pts;
      // Arcs de compressió temporal cap a mitjanit
      pts.forEach((p,i)=>{
        const span=Math.max(4,o.x1-p.x), mx=(p.x+o.x1)/2;
        const ah=Math.min(o.y-16,Math.max(12,span*.14+i*4));
        mk.append("path").attr("d",`M${p.x},${o.y-2} Q${mx},${o.y-2-ah} ${o.x1},${o.y-2}`)
          .attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",.85).attr("stroke-opacity",.35)
          .attr("stroke-dasharray",i===0?"3 3":null);
      });
      pts.forEach((p,i)=>{
        const e=p.e, ly=o.y-(mob?28:36)-i*(mob?28:38);
        const anc=p.x<o.x0+120?"start":"end", tx=anc==="end"?p.x-8:p.x+8;
        const eg=mk.append("g").datum(p).attr("class","emk");
        eg.append("path").attr("d",`M${p.x},${o.y-5}V${ly+4}H${tx+(anc==="end"?3:-3)}`)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.75);
        eg.append("circle").attr("class","halo").attr("cx",p.x).attr("cy",o.y).attr("r",mob?9:12)
          .attr("fill",wash.humHi).style("mix-blend-mode","multiply");
        eg.append("circle").attr("class","core").attr("cx",p.x).attr("cy",o.y).attr("r",3.6)
          .attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.2);
        V.t(eg,tx,ly-1,e.lab,{anchor:anc,size:fs,weight:700,fill:C.ink,halo:3});
        V.t(eg,tx,ly+13,`a ${fmtS(e.s)} de mitjanit`,{anchor:anc,size:11.5,fill:C.ink2,halo:3});
      });
      if(!instant&&!V.reduced)mk.style("opacity",0).transition().duration(420).style("opacity",1);
      return;
    }

    /* Rellotges astronòmics: day, hour, min (TIME-12) */
    const o=geo[k], fs=mob?11.5:12.5;
    g.select(".ctr1").text(k==="day"?"24 h":k==="hour"?"60 min":"60 s");
    g.select(".ctr2").text(k==="day"?"del 31 de desembre":k==="hour"?"de 23:00 a 24:00":"de 23:59 a 24:00");
    const a0=dialAngle(k,Math.min(o.span,evs[0].s));
    g.select(".sweep").attr("d",d3.arc()({innerRadius:o.R*.26,outerRadius:o.R,startAngle:a0,endAngle:2*Math.PI}))
      .attr("transform",`translate(${o.cx},${o.cy})`);
    g.select(".rim-arc").attr("d",d3.arc()({innerRadius:o.R,outerRadius:o.R,startAngle:a0,endAngle:2*Math.PI}))
      .attr("transform",`translate(${o.cx},${o.cy})`);
    const pts=evs.map(e=>{
      const a=dialAngle(k,e.s);
      return {e,a,x:o.cx+Math.sin(a)*o.R,y:o.cy-Math.cos(a)*o.R,right:Math.sin(a)>=0};
    });
    o.pts=pts;
    if(mob){
      const lr=o.R+16, minAng=21/lr;
      const bPts=pts.map((p,i)=>({p,i,ba:p.a})).sort((a,b)=>a.ba-b.ba);
      for(let pass=0;pass<8;pass++){
        for(let j=1;j<bPts.length;j++){
          const diff=bPts[j].ba-bPts[j-1].ba;
          if(diff<minAng){
            const push=(minAng-diff)/2;
            bPts[j-1].ba-=push; bPts[j].ba+=push;
          }
        }
      }
      bPts.sort((a,b)=>a.i-b.i).forEach(({p,i,ba})=>{
        const e=p.e, col=CAT_COL[e.cat];
        const bx=o.cx+Math.sin(ba)*lr, by=o.cy-Math.cos(ba)*lr;
        const eg=mk.append("g").datum(p).attr("class","emk");
        eg.append("line").attr("x1",o.cx+Math.sin(p.a)*o.R*.26).attr("y1",o.cy-Math.cos(p.a)*o.R*.26)
          .attr("x2",p.x).attr("y2",p.y).attr("stroke",CAT_STROKE[e.cat]).attr("stroke-width",.65).attr("stroke-opacity",.5);
        if(Math.abs(ba-p.a)>.03){
          eg.append("line").attr("x1",p.x).attr("y1",p.y).attr("x2",bx).attr("y2",by)
            .attr("stroke",CAT_STROKE[e.cat]).attr("stroke-width",.8).attr("stroke-opacity",.65);
        }
        eg.append("circle").attr("class","halo").attr("cx",p.x).attr("cy",p.y).attr("r",9.5)
          .attr("fill",wash[e.cat+"Hi"]).style("mix-blend-mode","multiply");
        eg.append("circle").attr("class","core").attr("cx",p.x).attr("cy",p.y).attr("r",3.5)
          .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.1);
        eg.append("circle").attr("cx",bx).attr("cy",by).attr("r",8.5).attr("fill",col);
        V.t(eg,bx,by+3.6,i+1,{anchor:"middle",size:11,weight:700,fill:CAT_BADGE_TXT[e.cat]});
        list.append("li").html(`<b style="background:${col};color:${CAT_BADGE_TXT[e.cat]}">${i+1}</b>${e.lab} <span>${clock(e,e.s<600)}</span>`);
      });
    } else {
      const gap=36;
      [true,false].forEach(side=>{
        const ps=pts.filter(p=>p.right===side);
        if(ps.length)separate(ps,gap,24,H-24);
      });
      pts.forEach(p=>{
        const e=p.e, col=CAT_COL[e.cat], dx=p.right?1:-1;
        const ex=o.cx+dx*(o.R+28), tx=ex+dx*6, anc=p.right?"start":"end";
        const sx=o.cx+Math.sin(p.a)*(o.R+5), sy=o.cy-Math.cos(p.a)*(o.R+5);
        const eg=mk.append("g").datum(p).attr("class","emk");
        eg.append("line").attr("x1",o.cx+Math.sin(p.a)*o.R*.26).attr("y1",o.cy-Math.cos(p.a)*o.R*.26)
          .attr("x2",p.x).attr("y2",p.y).attr("stroke",CAT_STROKE[e.cat]).attr("stroke-width",.7).attr("stroke-opacity",.45);
        eg.append("polyline").attr("points",`${sx},${sy} ${ex-dx*10},${p.ly} ${ex},${p.ly}`)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.75);
        eg.append("circle").attr("class","halo").attr("cx",p.x).attr("cy",p.y).attr("r",12.5)
          .attr("fill",wash[e.cat+"Hi"]).style("mix-blend-mode","multiply");
        eg.append("circle").attr("class","core").attr("cx",p.x).attr("cy",p.y).attr("r",3.8)
          .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.2);
        V.t(eg,tx,p.ly-2,e.lab,{anchor:anc,size:fs,weight:700,fill:C.ink,halo:3});
        V.t(eg,tx,p.ly+13,clock(e,e.s<600),{anchor:anc,size:11.5,fill:C.ink2,halo:3});
      });
    }
    if(!instant&&!V.reduced)mk.style("opacity",0).transition().duration(420).style("opacity",1);
  }

  /* ---------- Hover interactiu (IBV.hover + IBV.focus + .ibv-dock) ---------- */
  function bindHover(){
    svg.style("cursor","crosshair");
    function clearHv(){
      if(!cur||!layers[cur])return;
      layers[cur].select(".hv").selectAll("*").remove();
      V.focus(layers[cur].selectAll(".emk"),null);
      tp.hide();
    }
    V.hover(svg.node(),(ev,[px,py])=>{
      if(!cur||!layers[cur])return;
      const g=layers[cur], hv=g.select(".hv");

      /* Hover sobre l'anell astronòmic anual (TIME-10) */
      if(cur==="year"){
        const o=geo.year;
        const dist=Math.hypot(px-o.cx,py-o.cy);
        if(dist<o.rIn*.35||dist>o.R+36){ clearHv(); return; }
        const nearest=d3.least(o.pearls,p=>Math.hypot(p.x-px,p.y-py));
        const nd=nearest?Math.hypot(nearest.x-px,nearest.y-py):1e9;
        hv.selectAll("*").remove();
        if(nearest&&nd<(mob?26:18)){
          const e=nearest.e;
          hv.append("line").attr("x1",o.cx).attr("y1",o.cy).attr("x2",o.cx+Math.sin(nearest.a)*(o.R+8)).attr("y2",o.cy-Math.cos(nearest.a)*(o.R+8))
            .attr("stroke",C.ink).attr("stroke-width",.75).attr("stroke-dasharray","2 3");
          hv.append("circle").attr("cx",nearest.x).attr("cy",nearest.y).attr("r",6.2)
            .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
          V.focus(g.selectAll(".emk"),d=>d&&d.e&&d.e.id===e.id,{dim:.48});
          tp.show(`<b>${e.lab}</b> · ${fmtCosmic(e)}<br>${fmtAge(e.ya)} · ${CAT_NAME[e.cat]}`);
        } else {
          const a=(Math.atan2(px-o.cx,-(py-o.cy))+2*Math.PI)%(2*Math.PI);
          const doy=Math.min(364,Math.floor(a/(2*Math.PI)*365));
          const m=monthOf(doy), d=doy-M0[m]+1;
          hv.append("line").attr("x1",o.cx+Math.sin(a)*o.rIn).attr("y1",o.cy-Math.cos(a)*o.rIn)
            .attr("x2",o.cx+Math.sin(a)*(o.R+7)).attr("y2",o.cy-Math.cos(a)*(o.R+7))
            .attr("stroke",C.ink).attr("stroke-width",1.1);
          V.focus(g.selectAll(".emk"),null);
          const evs=EV_BY_DOY[doy];
          if(evs&&evs.length){
            tp.show(`<b>${d} ${deMes(m)}</b> · ${evs.map(e=>e.lab).join(", ")}<br>${fmtAge(evs[0].ya)}`);
          } else {
            tp.show(`<b>${d} ${deMes(m)}</b> · ${eraName(doy)}`);
          }
        }
        return;
      }

      /* Hover sobre calendaris mensuals (TIME-07) */
      if(/^m\d+$/.test(cur)){
        const cells=geo[cur].cells||[];
        const hit=cells.find(c=>px>=c.x-1&&px<=c.x+c.w+1&&py>=c.y-1&&py<=c.y+c.w+1);
        if(!hit){ clearHv(); return; }
        hv.selectAll("*").remove();
        hv.append("rect").attr("x",hit.x-.5).attr("y",hit.y-.5).attr("width",hit.w+1).attr("height",hit.w+1).attr("rx",1.5)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
        const evs=EV_BY_DOY[hit.doy];
        if(evs&&evs.length){
          const e0=evs[0];
          V.focus(g.selectAll(".emk"),d=>d&&d.doy===hit.doy,{dim:.48});
          tp.show(`<b>${hit.d} ${deMes(hit.m)}</b> · ${evs.map(e=>e.lab).join(", ")}<br>${fmtAge(e0.ya)} · ${CAT_NAME[e0.cat]}`);
        } else {
          V.focus(g.selectAll(".emk"),null);
          tp.show(`<b>${hit.d} ${deMes(hit.m)}</b> · ${eraName(hit.doy)}`);
        }
        return;
      }

      /* Hover sobre els últims 5 segons */
      if(cur==="sec"){
        const o=geo.sec, pts=o.pts||[];
        if(!pts.length||px<o.x0-16||px>o.x1+16){ clearHv(); return; }
        const best=d3.least(pts,p=>Math.abs(p.x-px));
        if(!best||Math.abs(best.x-px)>44){ clearHv(); return; }
        hv.selectAll("*").remove();
        V.focus(g.selectAll(".emk"),d=>d===best,{dim:.48});
        hv.append("line").attr("x1",best.x).attr("x2",best.x).attr("y1",20).attr("y2",o.y+10)
          .attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
        hv.append("circle").attr("cx",best.x).attr("cy",o.y).attr("r",6.5)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
        tp.show(`<b>${best.e.lab}</b> · a ${fmtS(best.e.s)} de mitjanit<br>${fmtAge(best.e.ya)}`);
        return;
      }

      /* Hover sobre rellotges astronòmics (TIME-12) */
      const o=geo[cur], pts=o.pts||[];
      if(!pts.length){ clearHv(); return; }
      const best=d3.least(pts,p=>Math.hypot(p.x-px,p.y-py));
      const dist=best?Math.hypot(best.x-px,best.y-py):1e9;
      if(!best||dist>Math.max(48,o.R*.65)){ clearHv(); return; }
      hv.selectAll("*").remove();
      V.focus(g.selectAll(".emk"),d=>d===best,{dim:.48});
      hv.append("line").attr("x1",o.cx).attr("y1",o.cy).attr("x2",best.x).attr("y2",best.y)
        .attr("stroke",C.ink).attr("stroke-width",.75).attr("stroke-dasharray","2 3");
      hv.append("circle").attr("cx",best.x).attr("cy",best.y).attr("r",6.8)
        .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
      tp.show(`<b>${best.e.lab}</b> · 31 de desembre, ${clock(best.e,best.e.s<600)}<br>${fmtAge(best.e.ya)}`);
    },clearHv);
  }

  function wrapText(g,txt,x,y,maxW,fs,col,wt){
    const words=txt.split(" ");
    let line="", ln=0;
    words.forEach(wd=>{
      const test=line?line+" "+wd:wd;
      if(textW(test,fs,wt)>maxW&&line){
        V.t(g,x,y+ln*fs*1.2,line,{size:fs,weight:wt,fill:col,halo:2});
        ln++; line=wd;
      } else line=test;
    });
    if(line)V.t(g,x,y+ln*fs*1.2,line,{size:fs,weight:wt,fill:col,halo:2});
  }

  /* ---------- Transicions de zoom entre nivells ---------- */
  function childRect(parent,child){
    if(parent==="year"){
      const o=geo.year, m=+child.slice(1);
      const a=(M0[m]+MD[m]/2)/365*2*Math.PI, s=Math.max(24,o.R*.32);
      return {x:o.cx+Math.sin(a)*o.rMid-s/2,y:o.cy-Math.cos(a)*o.rMid-s/2,w:s,h:s};
    }
    if(parent==="m11"){ const c=monthCell(11,30); return {x:c.x,y:c.y,w:c.w,h:c.w}; }
    if(parent==="day"||parent==="hour"||parent==="min"){
      const o=geo[parent], a=2*Math.PI*(1-1/o.n/2), r=o.R, s=Math.max(12,r*2*Math.PI/o.n);
      return {x:o.cx+Math.sin(a)*r-s/2,y:o.cy-Math.cos(a)*r-s/2,w:s,h:s};
    }
    return {x:0,y:0,w:W,h:H};
  }
  function fitT(r){ const k=Math.min(W/r.w,H/r.h); return {k,x:W/2-(r.x+r.w/2)*k,y:H/2-(r.y+r.h/2)*k}; }
  function tStr(t){ return `translate(${t.x},${t.y}) scale(${t.k})`; }
  function show(k,op){
    Object.keys(layers).forEach(n=>{
      const on=n===k;
      layers[n].style("display",on?null:"none").attr("opacity",on?op:0).attr("transform",null);
    });
  }
  function goLevel(k){
    if(!svg||k===cur)return;
    const from=cur; cur=k;
    if(timer){ timer.stop(); timer=null; if(from)show(from,1); }
    if(!from||V.reduced){ show(k,1); return; }
    const zoomIn=PARENT[k]===from, zoomOut=PARENT[from]===k;
    const A=layers[from], B=layers[k];
    Object.keys(layers).forEach(n=>{ if(n!==from&&n!==k)layers[n].style("display","none"); });
    A.style("display",null); B.style("display",null);
    if(!zoomIn&&!zoomOut){
      B.attr("opacity",0).attr("transform",null);
      timer=d3.timer(el=>{
        const t=Math.min(1,el/460);
        A.attr("opacity",1-t); B.attr("opacity",t);
        if(t>=1){ timer.stop(); timer=null; show(k,1); }
      });
      return;
    }
    const par=zoomIn?from:k, ch=zoomIn?k:from, r=childRect(par,ch), f=fitT(r);
    const ik=Math.min(r.w/W,r.h/H), inv={k:ik,x:r.x+(r.w-W*ik)/2,y:r.y+(r.h-H*ik)/2};
    const P=zoomIn?A:B, Ch=zoomIn?B:A, dur=1000;
    timer=d3.timer(el=>{
      const t=Math.min(1,el/dur), e=EIO(t), z=zoomIn?e:1-e;
      const lk=Math.exp(Math.log(f.k)*z), pk={k:lk,x:f.x*(lk-1)/(f.k-1||1),y:f.y*(lk-1)/(f.k-1||1)};
      P.attr("transform",tStr(pk)).attr("opacity",Math.max(0,1-z*1.4));
      const ck={k:pk.k*inv.k,x:pk.x+pk.k*inv.x,y:pk.y+pk.k*inv.y};
      Ch.attr("transform",tStr(ck)).attr("opacity",Math.min(1,Math.max(0,(z-.35)*1.6)));
      if(t>=1){ timer.stop(); timer=null; show(k,1); }
    });
  }

  function go(i){
    curStep=i;
    const st=STEPS[i];
    d3.select("#calName").text(HEAD[st.lv][0]);
    d3.select("#calSub").text(HEAD[st.lv][1]);
    goLevel(st.lv);
    highlight(false);
  }

  V.mount(plot,draw);
  if(window.IB&&IB.scrolly){
    IB.scrolly(document.getElementById("calsteps"),document.getElementById("calgraphic"),go);
  }
}

/* =====================================================================
   2. L'ANY REPARTIT · SCALE-02 (QUADRATS) · TIME-15 (TEMPS PROFUND) · PART-06 (CONSTEL·LACIÓ)
   ===================================================================== */
function initEras(){
  const box=document.getElementById("erasbox"), lg=document.getElementById("erasLg");
  const titleEl=document.getElementById("erasTitle"), subEl=document.getElementById("erasSub");
  if(!box)return;
  let mode="area";

  const NEST=[
    {id:"univ",  a:T,              b:BY.sun.ya,       l:"Tot l'any (des del Big Bang)",     slice:"Abans del Sol i de la Terra: 67 %", col:C.blau,     a0:.22, a1:.11, stroke:C.blau,     sw:1.1},
    {id:"earth", a:BY.sun.ya,      b:BY.life.ya,      l:"Des del Sol i la Terra",           slice:"Terra sense vida coneguda: 8 %",    col:C.ghost,    a0:.44, a1:.26, stroke:C.ink2,     sw:.85},
    {id:"life",  a:BY.life.ya,     b:BY.ediacara.ya,  l:"Des dels primers fòssils de vida", slice:"Vida microscòpica: 21 %",           col:C.grocClar, a0:.52, a1:.28, stroke:C.grocFosc, sw:1},
    {id:"anim",  a:BY.ediacara.ya, b:BY.homochimp.ya, l:"Animals i plantes",                slice:"Animals i plantes: 4 %",            col:C.groc,     a0:.62, a1:.38, stroke:C.grocFosc, sw:1.1},
    {id:"hum",   a:BY.homochimp.ya,b:0,               l:"Llinatge humà",                    slice:"Llinatge humà: 0,05 %",             col:C.vermell,  a0:.92, a1:.75, stroke:C.vermell,  sw:1}
  ];

  /* 5 etapes disjuntes que sumen 100 % de l'any còsmic (per a PART-06 Constel·lació) */
  const SLICES=[
    {id:"univ",  dur:T-BY.sun.ya,              l:"Abans del Sol",       sub:"i de la Terra",   days:"244 dies",    col:C.blau,     a0:.38, a1:.20, stroke:C.blau},
    {id:"micro", dur:BY.life.ya-BY.ediacara.ya,l:"Vida microscòpica",   sub:"cèl·lules simples",days:"77 dies",    col:C.grocClar, a0:.62, a1:.38, stroke:C.grocFosc},
    {id:"earth", dur:BY.sun.ya-BY.life.ya,     l:"Terra sense vida",    sub:"coneguda",        days:"29 dies",     col:C.ghost,    a0:.52, a1:.30, stroke:C.ink2},
    {id:"anim",  dur:BY.ediacara.ya-BY.homochimp.ya, l:"Animals i plantes", sub:"vida complexa", days:"15 dies",   col:C.groc,     a0:.66, a1:.40, stroke:C.grocFosc},
    {id:"hum",   dur:BY.homochimp.ya,          l:"Llinatge humà",       sub:"7 milions d'anys",days:"4 h 27 min",  col:C.vermell,  a0:.85, a1:.60, stroke:C.vermell}
  ];

  function updateHeader(){
    if(lg)lg.innerHTML="";
    if(mode==="area"){
      if(titleEl)titleEl.textContent="L'any repartit per àrea";
      if(subEl)subEl.textContent="Cada quadrat mostra el temps des d'aquell llindar fins avui · 1 quadradet = 1 dia còsmic (37,8 Ma)";
      if(lg)V.legendCat(lg,[
        {c:C.blau,t:"Abans del Sol",a:.35},
        {c:C.ghost,t:"Terra sense vida"},
        {c:C.groc,t:"Vida",a:.65},
        {c:C.vermell,t:"Humans"}
      ]);
    } else if(mode==="log"){
      if(titleEl)titleEl.textContent="Temps profund: els 39 fets en escala logarítmica";
      if(subEl)subEl.textContent="Cada salt de l'eix és 10 vegades més a prop d'avui, del Big Bang fins a l'arribada a la Lluna";
      if(lg)V.legendCat(lg,[
        {c:C.blau,t:"Univers"},
        {c:C.groc,t:"Terra i vida"},
        {c:C.vermell,t:"Humans"}
      ]);
    } else {
      if(titleEl)titleEl.textContent="Constel·lació d'eres: el pes real de cada etapa";
      if(subEl)subEl.textContent="Àrea proporcional a la durada de cada etapa dins els 13.787 milions d'anys de l'univers";
      if(lg)V.legendCat(lg,[
        {c:C.blau,t:"Abans del Sol",a:.45},
        {c:C.ghost,t:"Terra sense vida"},
        {c:C.groc,t:"Vida",a:.65},
        {c:C.vermell,t:"Humans"}
      ]);
    }
  }

  /* ---------- SCALE-02: Quadrats niats d'àrea proporcional amb banys d'aquarel·la ---------- */
  function drawArea(el,w){
    const mob=w<640;
    const S=Math.round(mob?Math.min(w-8,360):Math.min(420,w-360));
    const ox=mob?Math.round((w-S)/2):Math.max(4,Math.round((w-S-350)/2));
    const topPad=mob?16:18, botPad=mob?146:54;
    const H=topPad+S+botPad;
    const s=V.svg(el,w,H,"Quadrats niats d'àrea proporcional a cada etapa de l'any còsmic: abans del Sol ocupa el 67 %, la Terra sense vida el 8 %, la vida microscòpica el 21 %, animals i plantes el 4 % i el llinatge humà un quadrat vermell diminut del 0,05 %.");
    const defs=s.append("defs");
    const grads={};
    NEST.forEach(d=>{ grads[d.id]=addWashGrad(defs,d.col,d.a0,d.a1,.06); });

    const g=s.append("g").attr("transform",`translate(${ox},${topPad})`);
    const side=d=>S*Math.sqrt(d.a/T);

    // Reixa subtil de 365 dies (1 quadradet = 1 dia còsmic)
    const u=S/Math.sqrt(365), cid="c43"+(++gradSeq);
    defs.append("clipPath").attr("id",cid).append("rect").attr("width",S).attr("height",S);
    const grid=g.append("g").attr("clip-path",`url(#${cid})`).attr("stroke",C.ink).attr("stroke-opacity",.06).attr("stroke-width",.5);
    let gp="";
    for(let a=u;a<S;a+=u)gp+=`M${a.toFixed(1)},0V${S}M0,${(S-a).toFixed(1)}H${S}`;
    grid.append("path").attr("d",gp);

    const sqG=g.append("g");
    const SQ=sqG.selectAll("rect.sq").data(NEST).join("rect").attr("class","sq")
      .attr("x",0)
      .attr("fill",d=>grads[d.id]).style("mix-blend-mode","multiply")
      .attr("stroke",d=>d.stroke).attr("stroke-width",d=>d.sw)
      .style("cursor","pointer");
    const placeSq=(sel,f)=>sel
      .attr("y",d=>S-Math.max(d.id==="hum"?3.2:0,side(d)*f(d)))
      .attr("width",d=>Math.max(d.id==="hum"?3.2:0,side(d)*f(d)))
      .attr("height",d=>Math.max(d.id==="hum"?3.2:0,side(d)*f(d)));
    placeSq(SQ,()=>1);

    const lbG=g.append("g");
    const main4=NEST.slice(0,4).map(d=>({d,y:S-side(d)}));
    if(!mob){
      separate(main4,42,4,S-34);
      main4.forEach(o=>{
        const d=o.d, q=lbG.append("g").datum(d).attr("class","q-lbl").style("cursor","pointer");
        const pctTot=d.a/T*100;
        q.append("path").attr("d",`M${side(d)},${o.y}H${S+12}${Math.abs(o.ly-o.y)>2?`L${S+20},${o.ly+4}`:""}H${S+26}`)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","1.5 2.5");
        V.t(q,S+32,o.ly+6,`${d.l} (${pctTot>=10?f0(pctTot):f1(pctTot)} %)`,{size:12.5,weight:700,fill:C.ink,halo:3});
        V.t(q,S+32,o.ly+21,d.slice,{size:12,fill:C.ink2,halo:3});
      });
      const hSide=Math.max(3.2,side(NEST[4]));
      V.note(lbG,{
        x:hSide+2, y:S-hSide/2, tx:Math.min(S-8,118), ty:S+28, kind:"curve", bend:16, anchor:"start", size:12.5, stroke:C.vermell,
        lines:[["Llinatge humà · 0,05 %",true,C.vermell],["7 milions d'anys en una cantonada"]]
      });
    } else {
      const hSide=Math.max(3.2,side(NEST[4]));
      V.note(lbG,{
        x:hSide+2, y:S-hSide/2, tx:Math.min(S-6,84), ty:S+22, kind:"curve", bend:12, anchor:"start", size:11.5, stroke:C.vermell,
        lines:[["Llinatge humà · 0,05 %",true,C.vermell]]
      });
      NEST.slice(0,4).forEach((d,i)=>{
        const y0=S+54+i*22;
        const q=lbG.append("g").datum(d).attr("class","q-lbl");
        q.append("rect").attr("x",0).attr("y",y0-9).attr("width",10).attr("height",10)
          .attr("fill",V.alpha(d.col,.45)).attr("stroke",d.stroke).attr("stroke-width",.9);
        V.t(q,16,y0,d.slice,{size:12,weight:600,fill:C.ink});
      });
    }

    const hl=g.append("rect").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6).style("pointer-events","none").style("display","none");
    const tp=V.tip(el);
    function setHv(d){
      if(!d){ hl.style("display","none"); V.focus(SQ,null); V.focus(lbG.selectAll(".q-lbl"),null); tp.hide(); return; }
      const sd=Math.max(d.id==="hum"?3.2:0,side(d));
      hl.style("display",null).attr("x",0).attr("y",S-sd).attr("width",sd).attr("height",sd);
      V.focus(SQ,x=>x===d,{dim:.48});
      V.focus(lbG.selectAll(".q-lbl"),x=>x===d,{dim:.48});
      const pctTot=d.a/T*100, pctStr=(pctTot>=1?f1(pctTot):f2(pctTot))+" %";
      tp.show(`<b>${d.l}</b> · ${pctStr} de l'any (${fmtAge(d.a)})<br>${d.slice}`);
    }
    V.hover(s.node(),(ev,[px,py])=>{
      const rx=px-ox, ry=py-topPad;
      if(rx>=-6&&rx<=S+6&&ry>=-6&&ry<=S+6){
        let hit=null;
        for(let i=NEST.length-1;i>=0;i--){
          const sd=Math.max(NEST[i].id==="hum"?16:0,side(NEST[i]));
          if(rx<=sd&&ry>=S-sd){ hit=NEST[i]; break; }
        }
        setHv(hit);
      } else {
        const tgt=d3.select(ev.target).datum();
        setHv(tgt&&tgt.id?tgt:null);
      }
    },()=>setHv(null));

    V.onView(el,inst=>{
      if(inst)return;
      placeSq(SQ,()=>0);
      SQ.transition().delay((d,i)=>i*110).duration(750).ease(EIO)
        .attr("y",d=>S-Math.max(d.id==="hum"?3.2:0,side(d)))
        .attr("width",d=>Math.max(d.id==="hum"?3.2:0,side(d)))
        .attr("height",d=>Math.max(d.id==="hum"?3.2:0,side(d)));
      lbG.style("opacity",0).transition().delay(520).duration(450).style("opacity",1);
    });
  }

  /* ---------- TIME-15: Temps profund logarítmic (vertical a mòbil w < 600) ---------- */
  function drawLog(el,w){
    const mob=w<600;
    const fmtTick=v=>{
      if(v>=1e9) return f0(v/1e9)+" mil M";
      if(v>=1e6) return f0(v/1e6)+" M";
      return f0(v);
    };
    const BANDS=[
      {from:1.45e10,     to:BY.sun.ya,       lab:"Abans del Sol",    col:C.blau,     op:.065},
      {from:BY.sun.ya,   to:BY.ediacara.ya,  lab:"Vida microscòpica",col:C.grocClar, op:.14},
      {from:BY.ediacara.ya,to:BY.homochimp.ya,lab:"Animals i plantes",col:C.groc,    op:.11},
      {from:BY.homochimp.ya,to:40,           lab:"Humans",           col:C.vermell,  op:.075}
    ];

    if(mob){
      const m={t:22,b:34,l:64,r:8}, axisX=m.l, H=520;
      const s=V.svg(el,w,H,"Línia del temps logarítmica vertical amb els 39 esdeveniments reals del calendari còsmic, des del Big Bang fa 13.787 milions d'anys fins a l'arribada a la Lluna fa 57 anys.");
      const defs=s.append("defs");
      const wG={cos:addWashGrad(defs,C.blau,.45,.22,.03), life:addWashGrad(defs,C.groc,.58,.30,.04), hum:addWashGrad(defs,C.vermell,.52,.26,.03)};
      const g=s.append("g");
      const y=d3.scaleLog([1.45e10,40],[m.t,H-m.b]);

      // Franges d'era en aquarel·la suau
      const bG=g.append("g");
      BANDS.forEach(b=>{
        const y0=y(b.from), y1=y(b.to);
        bG.append("rect").attr("x",axisX).attr("y",y0).attr("width",w-m.r-axisX).attr("height",Math.max(1,y1-y0))
          .attr("fill",b.col).attr("fill-opacity",b.op).style("mix-blend-mode","multiply");
      });

      const gridG=g.append("g"), axG=g.append("g");
      const ticks=d3.range(2,11).map(k=>Math.pow(10,k)).filter(v=>Math.round(Math.log10(v))%2===0);
      ticks.forEach(v=>{
        const Y=y(v);
        gridG.append("line").attr("x1",axisX).attr("x2",w-m.r).attr("y1",Y).attr("y2",Y).attr("stroke",C.grid).attr("stroke-width",.6);
        axG.append("line").attr("x1",axisX-4).attr("x2",axisX).attr("y1",Y).attr("y2",Y).attr("stroke",C.muted);
        V.t(axG,axisX-8,Y+3.5,fmtTick(v),{size:11,fill:C.muted,anchor:"end"});
      });
      g.append("line").attr("x1",axisX).attr("x2",axisX).attr("y1",m.t-4).attr("y2",H-m.b+4).attr("stroke",C.ink).attr("stroke-width",1);
      V.t(axG,w-m.r,H-10,"anys enrere · escala logarítmica (×10)",{size:11,fill:C.ink2,anchor:"end",italic:true});

      const lay={}, chosen=[];
      const pri=EV.slice().sort((a,b)=>a.pri-b.pri||b.ya-a.ya);
      const minGap=21;
      pri.forEach(e=>{
        const Y=y(e.ya);
        const ok=chosen.every(p=>Math.abs(p.y-Y)>=minGap*.78);
        if(ok&&chosen.length<20){
          const item={e,y:Y,ly:Y};
          chosen.push(item); lay[e.id]={Y,item};
        } else {
          lay[e.id]={Y,item:null};
        }
      });
      separate(chosen,minGap,m.t+4,H-m.b-4);

      const evG=g.append("g"), hvG=g.append("g").style("pointer-events","none");
      const evs=evG.selectAll("g.ev").data(EV,d=>d.id).join("g").attr("class","ev");
      const tx=axisX+18, maxLabW=w-m.r-tx;

      evs.each(function(d){
        const L=lay[d.id], hasL=!!L.item, q=d3.select(this);
        if(hasL){
          const ly=L.item.ly;
          q.append("path").attr("class","st")
            .attr("d",`M${axisX+4},${L.Y}L${axisX+12},${ly}H${tx-3}`)
            .attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.65);
        }
        q.append("circle").attr("class","halo").attr("cx",axisX).attr("cy",L.Y).attr("r",hasL?8:5)
          .attr("fill",wG[d.cat]).style("mix-blend-mode","multiply");
        q.append("circle").attr("class","dt").attr("cx",axisX).attr("cy",L.Y).attr("r",hasL?3.2:2.2)
          .attr("fill",CAT_COL[d.cat]).attr("stroke",CAT_STROKE[d.cat]).attr("stroke-width",.9);
        if(hasL){
          const ly=L.item.ly, lb=q.append("g").attr("class","lb");
          const agShort=d.ya>=1e9?f1(d.ya/1e9)+" mil M":d.ya>=1e6?(d.ya>=1e8?f0(d.ya/1e6):f1(d.ya/1e6))+" M":f0(d.ya)+" a";
          const nmW=textW(d.lab,11.5,700), agW=textW(" · "+agShort,11,400);
          V.t(lb,tx,ly+3.5,d.lab,{anchor:"start",size:11.5,weight:700,fill:C.ink,halo:3});
          if(nmW+agW<=maxLabW){
            V.t(lb,tx+nmW+2,ly+3.5," · "+agShort,{anchor:"start",size:11,fill:C.muted,halo:3});
          }
        }
      });

      const tp=V.tip(el);
      s.style("cursor","crosshair");
      let curE=null;
      function leave(){
        if(!curE)return;
        curE=null; hvG.selectAll("*").remove(); V.focus(evs,null); tp.hide();
      }
      V.hover(s.node(),(ev,[px,py])=>{
        if(py<m.t-14||py>H-m.b+14){ leave(); return; }
        const best=d3.least(EV,e=>Math.abs(lay[e.id].Y-py));
        if(!best||Math.abs(lay[best.id].Y-py)>28){ leave(); return; }
        if(curE===best)return;
        curE=best;
        const L=lay[best.id], Y=L.Y;
        V.focus(evs,d=>d===best,{dim:.48});
        evs.filter(d=>d===best).raise();
        hvG.selectAll("*").remove();
        hvG.append("line").attr("x1",axisX-6).attr("x2",w-m.r).attr("y1",Y).attr("y2",Y)
          .attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
        hvG.append("circle").attr("cx",axisX).attr("cy",Y).attr("r",5.5)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
        if(!L.item){
          V.t(hvG,tx,clamp(Y-8,m.t+8,H-m.b-8),best.lab,{anchor:"start",size:12,weight:700,fill:C.ink,halo:3.5});
        }
        tp.show(`<b>${best.lab}</b> · ${fmtAge(best.ya)}<br>${fmtCosmic(best)} · ${CAT_NAME[best.cat]}`);
      },leave);

      V.onView(el,inst=>{
        if(inst)return;
        evs.select(".dt").attr("r",0).transition().delay((d,i)=>i*18).duration(320)
          .attr("r",d=>lay[d.id].item?3.2:2.2);
        evs.select(".lb").style("opacity",0).transition().delay((d,i)=>220+i*18).duration(320).style("opacity",1);
      });
      return;
    }

    /* Desktop: eix logarítmic horitzontal amb franges d'era en aquarel·la */
    const lanes=5, laneH=36;
    const m={t:34,l:14,r:14}, axisY=m.t+lanes*laneH+22, H=axisY+52;
    const s=V.svg(el,w,H,"Línia del temps logarítmica amb els 39 esdeveniments reals del calendari còsmic, des del Big Bang fa 13.787 milions d'anys fins a l'arribada a la Lluna fa 57 anys.");
    const defs=s.append("defs");
    const wG={cos:addWashGrad(defs,C.blau,.45,.22,.03), life:addWashGrad(defs,C.groc,.58,.30,.04), hum:addWashGrad(defs,C.vermell,.52,.26,.03)};
    const g=s.append("g");
    const x=d3.scaleLog([1.45e10,40],[m.l,w-m.r]);

    // Franges d'era en aquarel·la suau (multiply)
    const bandG=g.append("g");
    BANDS.forEach(b=>{
      const x0=x(b.from), x1=x(b.to), bw=Math.max(1,x1-x0);
      bandG.append("rect").attr("x",x0).attr("y",m.t-14).attr("width",bw).attr("height",axisY-(m.t-14))
        .attr("fill",b.col).attr("fill-opacity",b.op).style("mix-blend-mode","multiply");
      if(bw>68){
        V.t(bandG,x0+bw/2,m.t-20,b.lab,{anchor:"middle",size:11,italic:true,fill:C.ink2});
      }
    });

    const gridG=g.append("g"), axG=g.append("g");
    const ticks=d3.range(2,11).map(k=>Math.pow(10,k));
    ticks.forEach(v=>{
      const X=x(v);
      gridG.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t-10).attr("y2",axisY).attr("stroke",C.grid).attr("stroke-width",.6);
      axG.append("line").attr("x1",X).attr("x2",X).attr("y1",axisY).attr("y2",axisY+4).attr("stroke",C.muted);
      const lbl=fmtTick(v), tw=textW(lbl,11);
      V.t(axG,clamp(X,m.l+tw/2,w-m.r-tw/2),axisY+17,lbl,{size:11,fill:C.muted,anchor:"middle"});
    });
    g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",axisY).attr("y2",axisY).attr("stroke",C.ink).attr("stroke-width",1);
    V.t(axG,w-m.r,axisY+36,"anys enrere · escala logarítmica: cada marca, 10 vegades més a prop d'avui",{size:11.5,fill:C.ink2,anchor:"end",italic:true});

    const placed=[], lay={};
    const pri=EV.slice().sort((a,b)=>a.pri-b.pri||a.ya-b.ya);
    const laneY=k=>axisY-22-k*laneH;
    pri.forEach(e=>{
      const X=x(e.ya), nm=e.lab, ag=fmtAge(e.ya);
      const tw=Math.max(textW(nm,12,700),textW(ag,11))+8;
      let anc="start", b0=X-2, b1=X+tw;
      if(b1>w-m.r){ anc="end"; b0=X-tw; b1=X+2; }
      if(b0<m.l-2){ lay[e.id]={X,lane:-1}; return; }
      for(let k=0;k<lanes;k++){
        let ok=true;
        for(const p of placed){
          if(p.lane===k&&!(b1+6<p.b0||b0-6>p.b1)){ ok=false; break; }
          if(p.lane<k&&X>=p.b0-3&&X<=p.b1+3){ ok=false; break; }
          if(p.lane>k&&p.X>=b0-3&&p.X<=b1+3){ ok=false; break; }
          if(Math.abs(p.X-X)<3&&p.lane!==k){ ok=false; break; }
        }
        if(ok){ placed.push({X,lane:k,b0,b1}); lay[e.id]={X,lane:k,anc,nm,ag}; return; }
      }
      lay[e.id]={X,lane:-1};
    });

    const evG=g.append("g"), hvG=g.append("g").style("pointer-events","none");
    const evs=evG.selectAll("g.ev").data(EV,d=>d.id).join("g").attr("class","ev")
      .attr("transform",d=>`translate(${lay[d.id].X},0)`);
    evs.append("line").attr("class","st").attr("y1",axisY-4)
      .attr("y2",d=>lay[d.id].lane>=0?laneY(lay[d.id].lane)-10:axisY-4)
      .attr("stroke",C.ink2).attr("stroke-width",.65);
    evs.append("circle").attr("class","halo").attr("cy",axisY).attr("r",d=>lay[d.id].lane>=0?8.5:5)
      .attr("fill",d=>wG[d.cat]).style("mix-blend-mode","multiply");
    evs.append("circle").attr("class","dt").attr("cy",axisY).attr("r",d=>lay[d.id].lane>=0?3.2:2.2)
      .attr("fill",d=>CAT_COL[d.cat]).attr("stroke",d=>CAT_STROKE[d.cat]).attr("stroke-width",.9);
    evs.each(function(d){
      const L=lay[d.id]; if(L.lane<0)return;
      const q=d3.select(this).append("g").attr("class","lb"), dx=L.anc==="start"?4:-4, Y=laneY(L.lane);
      V.t(q,dx,Y,L.nm,{anchor:L.anc,size:12,weight:700,fill:C.ink,halo:3});
      V.t(q,dx,Y+12.5,L.ag,{anchor:L.anc,size:11,fill:C.muted,halo:3});
    });

    const tp=V.tip(el);
    s.style("cursor","crosshair");
    let curE=null;
    function leave(){
      if(!curE)return;
      curE=null; hvG.selectAll("*").remove(); V.focus(evs,null); tp.hide();
    }
    V.hover(s.node(),(ev,[px])=>{
      const best=d3.least(EV,e=>Math.abs(lay[e.id].X-px));
      if(!best||Math.abs(lay[best.id].X-px)>28){ leave(); return; }
      if(curE===best)return;
      curE=best;
      const L=lay[best.id], X=L.X;
      V.focus(evs,d=>d===best,{dim:.48});
      evs.filter(d=>d===best).raise();
      hvG.selectAll("*").remove();
      hvG.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t-10).attr("y2",axisY+6)
        .attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
      hvG.append("circle").attr("cx",X).attr("cy",axisY).attr("r",5.5)
        .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
      if(L.lane<0){
        const anc=X>w-150?"end":"start", tx=X+(anc==="end"?-8:8);
        V.t(hvG,tx,axisY-18,best.lab,{anchor:anc,size:12,weight:700,fill:C.ink,halo:3.5});
      }
      tp.show(`<b>${best.lab}</b> · ${fmtAge(best.ya)}<br>${fmtCosmic(best)} · ${CAT_NAME[best.cat]}`);
    },leave);

    V.onView(el,inst=>{
      if(inst)return;
      evs.select(".st").attr("y2",axisY-4).transition().delay((d,i)=>150+i*22).duration(420).ease(EIO)
        .attr("y2",d=>lay[d.id].lane>=0?laneY(lay[d.id].lane)-10:axisY-4);
      evs.select(".dt").attr("r",0).transition().delay((d,i)=>i*22).duration(340)
        .attr("r",d=>lay[d.id].lane>=0?3.2:2.2);
      evs.select(".lb").style("opacity",0).transition().delay((d,i)=>280+i*22).duration(340).style("opacity",1);
    });
  }

  /* ---------- PART-06: Constel·lació de cercles d'aquarel·la (d3.pack) ---------- */
  function drawPack(el,w){
    const mob=w<600;
    const H=mob?380:410;
    const s=V.svg(el,w,H,"Constel·lació de cercles d'aquarel·la d'àrea proporcional a cada etapa de l'univers: abans del Sol ocupa el 66,9 %, la vida microscòpica el 21,1 %, la Terra sense vida el 7,9 %, animals i plantes el 4,1 % i el llinatge humà un punt vermell diminut del 0,05 %.");
    const defs=s.append("defs");
    const grads={};
    SLICES.forEach(d=>{ grads[d.id]=addWashGrad(defs,d.col,d.a0,d.a1,.05); });

    const padL=mob?10:120, padR=mob?10:120, padT=mob?16:18, padB=mob?64:24;
    const packW=Math.max(240,w-padL-padR), packH=H-padT-padB;
    const root=d3.pack().size([packW,packH]).padding(mob?8:12)(
      d3.hierarchy({children:SLICES}).sum(d=>d.dur||0).sort((a,b)=>b.value-a.value)
    );
    const nodes=root.leaves();
    const g=s.append("g").attr("transform",`translate(${padL},${padT})`);

    const cell=g.selectAll("g.pk").data(nodes).join("g").attr("class","pk")
      .attr("transform",d=>`translate(${d.x},${d.y})`)
      .style("cursor","pointer");

    cell.append("circle").attr("class","wash")
      .attr("r",d=>Math.max(d.data.id==="hum"?4.2:0,d.r))
      .attr("fill",d=>grads[d.data.id])
      .style("mix-blend-mode","multiply");

    cell.append("circle").attr("class","rim")
      .attr("r",d=>Math.max(d.data.id==="hum"?4.2:0,d.r))
      .attr("fill","none")
      .attr("stroke",d=>d.data.stroke)
      .attr("stroke-width",d=>d.data.id==="hum"?1.4:.9)
      .attr("stroke-opacity",d=>d.data.id==="hum"?.9:.42);

    // Etiquetes horitzontals netes dins els cercles grans (mai text corbat)
    cell.each(function(d){
      const q=d3.select(this), r=d.r, pct=d.data.dur/T*100;
      const pctStr=(pct>=10?f1(pct):pct>=1?f1(pct):f2(pct))+" %";
      if(r>=(mob?42:54)){
        V.t(q,0,-10,d.data.l,{anchor:"middle",weight:700,size:mob?12.5:15,fill:C.ink,halo:3});
        V.t(q,0,8,pctStr,{anchor:"middle",serif:true,weight:600,size:mob?16:20,fill:C.ink,halo:3});
        V.t(q,0,24,d.data.days,{anchor:"middle",size:mob?11:12,fill:C.ink2,halo:2.5});
      } else if(r>=(mob?28:34)){
        V.t(q,0,-4,d.data.l,{anchor:"middle",weight:700,size:11.5,fill:C.ink,halo:3});
        V.t(q,0,11,pctStr,{anchor:"middle",size:11.5,fill:C.ink2,halo:2.5});
      }
    });

    // Anotacions quirúrgiques per als cercles petits (Animals i plantes + el puntet microscòpic humà)
    const noteG=s.append("g");
    const animN=nodes.find(n=>n.data.id==="anim");
    const humN=nodes.find(n=>n.data.id==="hum");
    if(animN&&animN.r<(mob?28:34)){
      const ax=animN.x+padL, ay=animN.y+padT;
      const goLeft=ax<w*.5;
      const tx=mob?clamp(ax+(goLeft?-24:24),10,w-10):(goLeft?Math.max(120,ax-animN.r-34):Math.min(w-120,ax+animN.r+34));
      const ty=mob?clamp(ay-animN.r-18,22,H-78):clamp(ay-animN.r-8,30,H-54);
      V.note(noteG,{
        x:ax+(goLeft?-animN.r*.7:animN.r*.7), y:ay-animN.r*.3, tx, ty, kind:"elbow", dot:false,
        anchor:goLeft?"end":"start", size:mob?11.5:12,
        lines:[["Animals i plantes · 4,1 %",true],["15 dies de l'any"]]
      });
    }
    if(humN){
      const hx=humN.x+padL, hy=humN.y+padT;
      const goLeft=hx<w*.5;
      const tx=mob?w/2:(goLeft?Math.max(120,hx-46):Math.min(w-120,hx+46));
      const ty=mob?H-30:clamp(hy+28,44,H-34);
      V.note(noteG,{
        x:hx, y:hy+(mob?6:0), tx, ty, kind:"curve", bend:mob?12:(goLeft?-16:16),
        anchor:mob?"middle":(goLeft?"end":"start"), size:mob?12:12.5, stroke:C.vermell,
        lines:[["Llinatge humà · 0,05 %",true,C.vermell],["4 h 27 min · 7 milions d'anys"]]
      });
    }

    const tp=V.tip(el);
    function reset(){
      V.focus(cell,null);
      cell.select(".rim").attr("stroke",d=>d.data.stroke).attr("stroke-width",d=>d.data.id==="hum"?1.4:.9).attr("stroke-opacity",d=>d.data.id==="hum"?.9:.42);
      tp.hide();
    }
    V.hover(s.node(),(ev,[px,py])=>{
      const rx=px-padL, ry=py-padT;
      const hit=d3.least(nodes,n=>{
        const d=Math.hypot(n.x-rx,n.y-ry), rad=Math.max(n.r,22);
        return d<=rad?d-n.r:1e9;
      });
      const hitDist=hit?Math.hypot(hit.x-rx,hit.y-ry):1e9;
      if(!hit||hitDist>Math.max(hit.r+8,26)){ reset(); return; }
      V.focus(cell,d=>d===hit,{dim:.48});
      cell.select(".rim")
        .attr("stroke",d=>d===hit?C.ink:d.data.stroke)
        .attr("stroke-width",d=>d===hit?1.6:(d.data.id==="hum"?1.4:.9))
        .attr("stroke-opacity",d=>d===hit?1:.42);
      const pct=hit.data.dur/T*100, pctStr=(pct>=1?f1(pct):f2(pct))+" %";
      const maStr=hit.data.dur>=1e9?f1(hit.data.dur/1e9)+" mil Ma":f0(hit.data.dur/1e6)+" Ma";
      tp.show(`<b>${hit.data.l}</b> · ${pctStr} de l'any (${hit.data.days})<br>${maStr} de durada`);
    },reset);

    V.onView(el,inst=>{
      if(inst)return;
      cell.attr("transform",d=>`translate(${d.x},${d.y}) scale(0.35)`).style("opacity",0)
        .transition().delay((d,i)=>i*70).duration(720).ease(EIO)
        .attr("transform",d=>`translate(${d.x},${d.y}) scale(1)`).style("opacity",1);
      noteG.style("opacity",0).transition().delay(480).duration(420).style("opacity",1);
    });
  }

  updateHeader();
  const mounted=V.mount(box,(el,w)=>{
    if(mode==="area")drawArea(el,w);
    else if(mode==="log")drawLog(el,w);
    else drawPack(el,w);
  });

  document.querySelectorAll("[data-eras]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const next=btn.dataset.eras;
      if(next===mode)return;
      mode=next;
      document.querySelectorAll("[data-eras]").forEach(b=>b.setAttribute("aria-pressed",b===btn?"true":"false"));
      updateHeader();
      box.__seen=false;
      mounted.redraw();
    });
  });
}

/* =====================================================================
   3. LA TEVA VIDA, AL CALENDARI · SCALE-04 ESCALA COMPARATIVA AMB ARCS ×N
   ===================================================================== */
function initLife(){
  const rng=document.getElementById("lifeRange"), out=document.getElementById("lifeOut");
  const valEl=document.getElementById("lifeVal"), box=document.getElementById("lifebox"), lg=document.getElementById("lifeLg");
  if(!rng||!box)return;
  if(lg&&!lg.childElementCount){
    V.legendCat(lg,[
      {c:C.vermell,t:"La teva vida"},
      {c:C.blau,t:"Fites històriques"},
      {c:C.ink2,t:"Arcs de proporció (×N)",kind:"line",dash:"3 3"}
    ]);
  }
  const HIST=[BY.frrev,BY.moonlanding];
  let W=0, H=214, mob=false, x=null, axisY=136, svg=null, dynG=null, hvG=null, tp=null, wash={};

  function draw(el,w){
    W=w; mob=w<540;
    H=mob?236:218; axisY=mob?134:140;
    const ml=mob?8:14, mr=mob?8:14;
    svg=V.svg(el,w,H,"Escala comparativa de l'últim segon de l'any còsmic (437 anys), amb la durada d'una vida humana en vermell i arcs de proporció exacta respecte a la Lluna, la Revolució Francesa i el segon sencer.");
    const defs=svg.append("defs");
    wash={
      red:addWashGrad(defs,C.vermell,.52,.26,.04),
      blue:addWashGrad(defs,C.blau,.44,.22,.03),
      ink:addWashGrad(defs,C.ink2,.28,.14,.02)
    };
    x=d3.scaleLinear([1,0],[ml,w-mr]);
    const g=svg.append("g");

    // Eix d'alta precisió sobre paper (P1)
    g.append("line").attr("x1",ml).attr("x2",w-mr).attr("y1",axisY).attr("y2",axisY).attr("stroke",C.ink).attr("stroke-width",1);
    for(let k=0;k<=10;k++){
      const sVal=1-k/10, xx=x(sVal), maj=k%5===0;
      g.append("line").attr("x1",xx).attr("x2",xx).attr("y1",axisY).attr("y2",axisY+(maj?8:4))
        .attr("stroke",maj?C.ink:C.hair).attr("stroke-width",maj?.95:.55);
      if(maj){
        const anc=k===0?"start":k===10?"end":"middle";
        const lbl=k===0?"23:59:59":k===10?"24:00":"mig segon";
        V.t(g,xx,axisY+21,lbl,{anchor:anc,size:11.5,fill:k===10?C.ink:C.muted,weight:k===10?700:400});
      }
    }

    // Punt d'inici del segon (437 anys)
    g.append("circle").attr("cx",x(1)).attr("cy",axisY).attr("r",8).attr("fill",wash.ink).style("mix-blend-mode","multiply");
    g.append("circle").attr("cx",x(1)).attr("cy",axisY).attr("r",2.6).attr("fill",C.ink2).attr("stroke","#fff").attr("stroke-width",1);

    // Fites històriques reals dins de l'últim segon amb halos d'aquarel·la
    const histG=g.append("g");
    HIST.forEach((e,i)=>{
      const ex=x(e.s), yr=2026-Math.round(e.ya);
      const q=histG.append("g").datum(e).attr("class","h-mk");
      q.append("circle").attr("cx",ex).attr("cy",axisY).attr("r",11)
        .attr("fill",wash.blue).style("mix-blend-mode","multiply");
      q.append("circle").attr("cx",ex).attr("cy",axisY).attr("r",3.3)
        .attr("fill",C.blau).attr("stroke","#fff").attr("stroke-width",1.1);
      const ly=axisY+(mob?(i===0?42:74):42);
      const anc=i===0?"middle":"end", tx=i===0?ex:Math.min(w-mr-4,ex-4);
      q.append("line").attr("x1",ex).attr("x2",ex).attr("y1",axisY+5).attr("y2",ly-11)
        .attr("stroke",C.blau).attr("stroke-width",.7).attr("stroke-opacity",.7);
      V.t(q,tx,ly,`${e.lab} (${yr})`,{anchor:anc,size:11.5,weight:600,fill:C.ink,halo:3});
      V.t(q,tx,ly+13,`fa ${f0(e.ya)} a · ${f2(e.s)} s`,{anchor:anc,size:11,fill:C.muted,halo:3});
    });

    dynG=g.append("g");
    hvG=g.append("g").style("pointer-events","none");
    tp=V.tip(el);
    renderLife(false);

    V.onView(el,inst=>{
      if(inst)return;
      dynG.style("opacity",0).transition().duration(650).ease(EIO).style("opacity",1);
    });

    svg.style("cursor","crosshair");
    V.hover(svg.node(),(ev,[px])=>{
      if(px<ml-6||px>w-mr+6){ hvG.selectAll("*").remove(); tp.hide(); return; }
      const sVal=clamp(x.invert(px),0,1), xx=x(sVal), ya=Math.max(1,Math.round(sVal*SPY)), yr=2026-ya;
      const yrs=+rng.value;
      hvG.selectAll("*").remove();
      hvG.append("line").attr("x1",xx).attr("x2",xx).attr("y1",18).attr("y2",axisY+8)
        .attr("stroke",C.ink).attr("stroke-width",.75).attr("stroke-dasharray","2 2");
      hvG.append("circle").attr("cx",xx).attr("cy",axisY).attr("r",4.2)
        .attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.5);
      tp.show(`<b>Any ${yr}</b> (fa ${f0(ya)} a · ${f2(sVal)} s)<br>${fmtRatio(ya,yrs)} respecte a ${yrs} ${yrs===1?"any":"anys"}`);
    },()=>{ hvG.selectAll("*").remove(); tp.hide(); });
  }

  function renderLife(anim){
    const yrs=+rng.value, sVal=yrs/SPY;
    const sStr=sVal<.1?f3(sVal):f2(sVal);
    if(valEl)valEl.textContent=`${yrs} ${yrs===1?"any":"anys"}`;
    rng.setAttribute("aria-valuetext",`${yrs} ${yrs===1?"any":"anys"}, ${sStr} segons de l'any còsmic`);
    const nSec=SPY/yrs, nRev=BY.frrev.ya/yrs, nMoon=yrs/BY.moonlanding.ya;
    const moonTxt=yrs>=BY.moonlanding.ya?`<b>${f1(nMoon)}×</b> el temps des de la Lluna`:`<b>${f1(1/nMoon)}</b> vegades menys que el temps des de la Lluna`;
    if(out)out.innerHTML=`<b>${yrs} ${yrs===1?"any":"anys"}</b> ocupen <b>${sStr} segons</b>: caben <b>${f1(nSec)}</b> vegades en l'últim segon i són ${moonTxt}.`;
    if(!dynG||!x)return;

    const xA=x(sVal), xB=x(0), xStart=x(1), xRev=x(BY.frrev.s), xMoon=x(BY.moonlanding.s);
    const span=Math.max(2.5,xB-xA), mx=(xA+xB)/2;
    dynG.selectAll("*").remove();

    // 1. Arc exterior (nivell 3): el segon sencer (437 anys) comparat amb la teva vida
    const h3=mob?104:112;
    const mx3=(xStart+xB)/2;
    dynG.append("path").attr("d",`M${xStart},${axisY-2} Q${mx3},${axisY-2-h3*1.75} ${xB},${axisY-2}`)
      .attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.8).attr("stroke-opacity",.45).attr("stroke-dasharray","3 3");
    V.t(dynG,mx3,axisY-h3*.88-6,`1 segon (437 a) = ${fmtRatio(SPY,yrs)} la teva vida`,{anchor:"middle",size:11.5,fill:C.ink2,halo:3.5});

    // 2. Arc intermedi (nivell 2): comparació amb la Revolució Francesa (237 a)
    if(!mob&&Math.abs(xA-xRev)>26){
      const h2=64, mx2=(xRev+xA)/2;
      dynG.append("path").attr("d",`M${xRev},${axisY-2} Q${mx2},${axisY-2-h2*1.7} ${xA},${axisY-2}`)
        .attr("fill","none").attr("stroke",C.blau).attr("stroke-width",1.05).attr("stroke-opacity",.65);
      V.t(dynG,clamp(mx2,90,W-90),axisY-h2*.86-5,`Rev. Francesa · ${fmtRatio(BY.frrev.ya,yrs)}`,{anchor:"middle",size:11,weight:600,fill:C.blau,halo:3.5});
    }

    // 3. Arc subtil cap a la Lluna (57 a) quan hi ha separació suficient a escriptori
    if(!mob&&Math.abs(xA-xMoon)>34){
      const hM=22, mxM=(xMoon+xA)/2;
      dynG.append("path").attr("d",`M${xMoon},${axisY-2} Q${mxM},${axisY-2-hM*1.7} ${xA},${axisY-2}`)
        .attr("fill","none").attr("stroke",C.blau).attr("stroke-width",.9).attr("stroke-opacity",.55).attr("stroke-dasharray","2 2");
    }

    // 4. Cinta translúcida i arc protagonista de la teva vida (vermell)
    const h1=Math.min(mob?50:54,Math.max(24,span*.38));
    dynG.append("rect").attr("x",xA).attr("y",axisY-11).attr("width",span).attr("height",11)
      .attr("fill",C.vermell).attr("fill-opacity",.26).style("mix-blend-mode","multiply");
    dynG.append("line").attr("x1",xA).attr("x2",xB).attr("y1",axisY).attr("y2",axisY)
      .attr("stroke",C.vermell).attr("stroke-width",2.5);
    dynG.append("path").attr("d",`M${xA},${axisY-2} Q${mx},${axisY-2-h1*1.7} ${xB},${axisY-2}`)
      .attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.8).attr("stroke-opacity",.95);

    // Halo d'aquarel·la al punt d'inici de la teva vida
    dynG.append("circle").attr("cx",xA).attr("cy",axisY).attr("r",11)
      .attr("fill",wash.red).style("mix-blend-mode","multiply");
    dynG.append("circle").attr("cx",xA).attr("cy",axisY).attr("r",3.6)
      .attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.2);

    const topY=Math.max(46,axisY-h1*.88-18);
    const lx=clamp(mx,78,W-78);
    V.t(dynG,lx,topY,`${yrs} ${yrs===1?"any":"anys"} · ${sStr} s`,{anchor:"middle",size:13,weight:700,fill:C.vermell,halo:3.5});
    V.t(dynG,lx,topY+14,`${f1(sVal*100)} % del segon · ${fmtRatio(yrs,BY.moonlanding.ya)} Lluna`,{anchor:"middle",size:11,fill:C.ink2,halo:3});
    void anim;
  }

  rng.addEventListener("input",()=>renderLife(true));
  V.mount(box,draw);
}

function init(){
  initScrolly();
  initEras();
  initLife();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
})();
