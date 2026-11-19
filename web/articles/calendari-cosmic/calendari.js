/* El calendari còsmic — visualitzacions amb el sistema infogràfic d'Inspired by Magazine (IBV).
   Escala: l'edat de l'univers (Planck 2018/2020: 13.787 milions d'anys) comprimida en un any de 365 dies.
   Peces aplicades: IB-37 (calendari anual i mensual tipogràfic), IB-48 (rellotges de l'últim dia/hora/minut),
   IB-43 (quadrats d'escala niats), IB-49 (temps profund logarítmic) i IB-35 (escala comparativa de l'últim segon).
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
    const s=m>=100?f0(m):m>=10?f1(m):f1(m);
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
function eraTint(doy){
  const s=(365-doy)*86400;
  if(doy===364) return V.alpha(C.vermell,.24);
  if(s>BY.sun.s) return V.alpha(C.blau,.12);
  if(s>BY.life.s) return V.alpha(C.ghost,.30);
  if(s>BY.ediacara.s) return V.alpha(C.groc,.22);
  return V.alpha(C.groc,.48);
}
function eraName(doy){
  const s=(365-doy)*86400;
  if(doy===364) return "Últim dia · animals, plantes i llinatge humà";
  if(s>BY.sun.s) return "Abans del Sol i de la Terra";
  if(s>BY.life.s) return "La Terra, sense vida coneguda";
  if(s>BY.ediacara.s) return "Vida microscòpica";
  return "Animals i plantes";
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
   1. SCROLLYTELLING · L'ANY CÒSMIC PAS A PAS (IB-37 + IB-48)
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
  let W=0, H=0, mob=false, cur=null, curStep=0, svg=null, layers={}, geo={}, timer=null;

  function draw(el,w){
    W=w; mob=innerWidth<900||w<520;
    H=Math.round(mob?Math.min(innerHeight*.44,Math.max(290,W*.96)):Math.min(innerHeight*.60,W*.64,540));
    svg=V.svg(el,W,H,"Línia del temps interactiva de l'any còsmic: tot l'any, gener, setembre, desembre, el 31 de desembre, l'última hora, l'últim minut i els últims cinc segons.");
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
      if(g)g.attr("opacity",0).transition().duration(700).ease(EIO).attr("opacity",1);
    });
  }

  /* ---------- IB-37: l'any sencer en 12 fulls tipogràfics ---------- */
  function buildYear(){
    const g=layers.year, cols=mob?3:4, rows=12/cols, gx=mob?12:24, gy=mob?10:18, top=6;
    const mw=(W-gx*(cols-1))/cols, th=mob?18:22, mh=(H-top-gy*(rows-1))/rows;
    const cs=Math.min(mw/7,(mh-th)/5.2), cell=Math.max(4,cs-1.8);
    geo.year={months:[],cs,th,cell};
    const cells=[];
    for(let m=0;m<12;m++){
      const c=m%cols, r=Math.floor(m/cols), x=c*(mw+gx), y=top+r*(mh+gy);
      geo.year.months[m]={x,y,w:mw,h:mh};
      V.t(g,x,y+th-7,MESL[m],{size:mob?11:12.5,weight:700,fill:C.ink});
      g.append("line").attr("x1",x).attr("x2",x+7*cs-1.8).attr("y1",y+th-3).attr("y2",y+th-3).attr("stroke",C.hair).attr("stroke-width",.55);
      for(let d=0;d<MD[m];d++){
        const doy=M0[m]+d, cx=x+(d%7)*cs, cy=y+th+Math.floor(d/7)*cs;
        cells.push({doy,m,d:d+1,x:cx,y:cy,w:cell});
        g.append("rect").attr("class","day d"+doy).attr("x",cx).attr("y",cy).attr("width",cell).attr("height",cell).attr("rx",1)
          .attr("fill",eraTint(doy));
        if(EV_BY_DOY[doy]){
          const e0=EV_BY_DOY[doy][0];
          g.append("circle").attr("cx",cx+cell/2).attr("cy",cy+cell/2).attr("r",Math.min(2,cell*.2))
            .attr("fill",CAT_STROKE[e0.cat]).attr("fill-opacity",.65).style("pointer-events","none");
        }
      }
    }
    geo.year.cells=cells;
    g.append("g").attr("class","marks");
    g.append("g").attr("class","hv").style("pointer-events","none");
  }
  function yearCell(doy){
    const m=monthOf(doy), d=doy-M0[m], o=geo.year.months[m], cs=geo.year.cs;
    return {x:o.x+(d%7)*cs,y:o.y+geo.year.th+Math.floor(d/7)*cs,w:geo.year.cell};
  }

  /* ---------- IB-37: un mes ampliat amb precisió tipogràfica ---------- */
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
        .attr("fill",eraTint(doy)).attr("stroke",C.hair).attr("stroke-width",.55);
      V.t(cg,x+6,y+(mob?14:17),d+1,{size:mob?11:12.5,weight:600,fill:C.muted});
    }
    g.append("g").attr("class","marks");
    g.append("g").attr("class","hv").style("pointer-events","none");
  }
  function monthCell(m,d){
    const o=geo["m"+m];
    return {x:o.ox+(d%7)*(o.cs+o.gap),y:o.top+Math.floor(d/7)*(o.cs+o.gap),w:o.cs};
  }

  /* ---------- IB-48: rellotges orgànics sobre paper (24 h, 60 min, 60 s) ---------- */
  function dialGeo(){
    const R=Math.min(W*(mob?.33:.25),H*(mob?.37:.38));
    return {cx:W/2,cy:H/2+(mob?2:4),R};
  }
  function buildDial(k,n,span){
    const g=layers[k], o=dialGeo();
    geo[k]={cx:o.cx,cy:o.cy,R:o.R,n,span,pts:[]};
    // retícula polar ultra-fina (sense fons pintat, P1)
    V.polarGrid(g,o.cx,o.cy,o.R,3,k==="day"?24:12,{stroke:C.grid,outer:C.hair,rIn:o.R*.28});
    g.append("circle").attr("cx",o.cx).attr("cy",o.cy).attr("r",o.R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.85);
    for(let i=0;i<n;i++){
      const a=i/n*2*Math.PI, major=k==="day"?i%3===0:i%5===0, r0=o.R-(major?9:4.5);
      g.append("line")
        .attr("x1",o.cx+Math.sin(a)*r0).attr("y1",o.cy-Math.cos(a)*r0)
        .attr("x2",o.cx+Math.sin(a)*o.R).attr("y2",o.cy-Math.cos(a)*o.R)
        .attr("stroke",major?C.ink2:C.hair).attr("stroke-width",major?1.05:.55);
      if(major&&(k!=="hour"&&k!=="min"||!mob||i%15===0)&&(k!=="day"||!mob||i%6===0)){
        const rl=o.R-(mob?19:21), lab=k==="day"?(i+" h"):k==="hour"?"23:"+pad(i):":"+pad(i);
        V.t(g,o.cx+Math.sin(a)*rl,o.cy-Math.cos(a)*rl+4,lab,{anchor:"middle",size:11,fill:C.muted});
      }
    }
    g.append("path").attr("class","sweep").attr("fill",C.vermell).attr("fill-opacity",.13).style("mix-blend-mode","multiply");
    g.append("path").attr("class","rim-arc").attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.8);
    V.t(g,o.cx,o.cy-4,"",{anchor:"middle",serif:true,weight:600,size:mob?22:30,fill:C.ink,halo:4}).attr("class","ctr1");
    V.t(g,o.cx,o.cy+16,"",{anchor:"middle",size:mob?11:12.5,fill:C.ink2,halo:3}).attr("class","ctr2");
    g.append("g").attr("class","marks");
    g.append("g").attr("class","hv").style("pointer-events","none");
  }
  function dialAngle(k,s){ const o=geo[k]; return (1-s/o.span)*2*Math.PI; }

  /* ---------- Els últims 5 segons (gravat lineal net sobre paper) ---------- */
  function buildSec(){
    const g=layers.sec, x0=mob?14:34, x1=W-(mob?14:34), y=H*.72;
    geo.sec={x0,x1,y,span:5,pts:[]};
    g.append("line").attr("x1",x0).attr("x2",x1).attr("y1",y).attr("y2",y).attr("stroke",C.ink).attr("stroke-width",1);
    for(let i=0;i<=50;i++){
      const x=x0+(x1-x0)*i/50, maj=i%10===0;
      g.append("line").attr("x1",x).attr("x2",x).attr("y1",y).attr("y2",y+(maj?8:4))
        .attr("stroke",maj?C.ink:C.hair).attr("stroke-width",maj?.95:.55);
      if(maj&&(!mob||i===0||i===20||i===40||i===50)){
        const anc=i===0?"start":i===50?"end":"middle";
        V.t(g,x,y+22,i===50?"24:00":"23:59:5"+(5+i/10),{anchor:anc,size:11.5,fill:i===50?C.ink:C.muted,weight:i===50?700:400});
      }
    }
    const life=80/SPY, lx=x1-(x1-x0)*life/5;
    g.append("rect").attr("x",lx).attr("y",y-12).attr("width",Math.max(2,x1-lx)).attr("height",12)
      .attr("fill",C.vermell).attr("fill-opacity",.28).style("mix-blend-mode","multiply");
    g.append("line").attr("x1",lx).attr("x2",x1).attr("y1",y).attr("y2",y).attr("stroke",C.vermell).attr("stroke-width",2.2);
    V.note(g,{
      x:(lx+x1)/2, y:y+2, tx:x1-(mob?28:58), ty:y+42, kind:"curve", bend:-12, anchor:"end", size:11.5,
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

    if(k==="year"){
      evs.forEach((e,i)=>{
        const c=yearCell(e.doy), col=CAT_COL[e.cat], stCol=CAT_STROKE[e.cat];
        const eg=mk.append("g").datum(e).attr("class","emk");
        eg.append("circle").attr("cx",c.x+c.w/2).attr("cy",c.y+c.w/2).attr("r",Math.max(8,c.w*.95))
          .attr("fill",col).attr("fill-opacity",.28).style("mix-blend-mode","multiply");
        eg.append("rect").attr("x",c.x-1).attr("y",c.y-1).attr("width",c.w+2).attr("height",c.w+2).attr("rx",1.5)
          .attr("fill",col).attr("stroke",stCol).attr("stroke-width",.9);
        V.t(eg,c.x+c.w/2,c.y+c.w/2+3.6,i+1,{anchor:"middle",size:11,weight:700,fill:CAT_BADGE_TXT[e.cat]});
        const m=monthOf(e.doy), d=e.doy-M0[m]+1;
        list.append("li").html(`<b style="background:${col};color:${CAT_BADGE_TXT[e.cat]}">${i+1}</b>${e.lab} <span>${d} ${deMes(m)}</span>`);
      });
      if(!instant&&!V.reduced)mk.style("opacity",0).transition().duration(420).style("opacity",1);
      return;
    }

    if(/^m\d+$/.test(k)){
      const m=+k.slice(1), byDay={};
      evs.forEach(e=>{ (byDay[e.doy]=byDay[e.doy]||[]).push(e); });
      Object.keys(byDay).forEach(doyKey=>{
        const doy=+doyKey, es=byDay[doy], d=doy-M0[m], c=monthCell(m,d);
        const col=CAT_COL[es[0].cat], stCol=CAT_STROKE[es[0].cat];
        const eg=mk.append("g").datum(es[0]).attr("class","emk");
        eg.append("rect").attr("x",c.x).attr("y",c.y).attr("width",c.w).attr("height",c.w).attr("rx",1.5)
          .attr("fill",col).attr("fill-opacity",es[0].cat==="life"?.36:.18).style("mix-blend-mode","multiply");
        eg.append("rect").attr("x",c.x).attr("y",c.y).attr("width",c.w).attr("height",3).attr("fill",stCol);
        eg.append("rect").attr("x",c.x).attr("y",c.y).attr("width",c.w).attr("height",c.w).attr("rx",1.5)
          .attr("fill","none").attr("stroke",stCol).attr("stroke-width",.9);
        V.t(eg,c.x+6,c.y+(mob?14:17),d+1,{size:mob?11:12.5,weight:700,fill:C.ink});
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

    if(k==="sec"){
      const o=geo.sec, fs=mob?11.5:12.5;
      const pts=evs.map((e,i)=>{
        const x=o.x1-(o.x1-o.x0)*e.s/5;
        return {e,x,y:o.y,i};
      });
      o.pts=pts;
      pts.forEach((p,i)=>{
        const e=p.e, ly=o.y-34-i*(mob?34:38);
        const anc=p.x<o.x0+120?"start":"end", tx=anc==="end"?p.x-8:p.x+8;
        const eg=mk.append("g").datum(p).attr("class","emk");
        eg.append("path").attr("d",`M${p.x},${o.y-5}V${ly+4}H${tx+(anc==="end"?3:-3)}`)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.75);
        eg.append("circle").attr("class","halo").attr("cx",p.x).attr("cy",o.y).attr("r",9)
          .attr("fill",C.vermell).attr("fill-opacity",.25).style("mix-blend-mode","multiply");
        eg.append("circle").attr("class","core").attr("cx",p.x).attr("cy",o.y).attr("r",3.5)
          .attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.2);
        V.t(eg,tx,ly-1,e.lab,{anchor:anc,size:fs,weight:700,fill:C.ink,halo:3});
        V.t(eg,tx,ly+13,`a ${fmtS(e.s)} de mitjanit`,{anchor:anc,size:11.5,fill:C.ink2,halo:3});
      });
      if(!instant&&!V.reduced)mk.style("opacity",0).transition().duration(420).style("opacity",1);
      return;
    }

    /* Rellotges: day, hour, min */
    const o=geo[k], fs=mob?11.5:12.5;
    g.select(".ctr1").text(k==="day"?"24 h":k==="hour"?"60 min":"60 s");
    g.select(".ctr2").text(k==="day"?"del 31 de desembre":k==="hour"?"de 23:00 a 24:00":"de 23:59 a 24:00");
    const a0=dialAngle(k,Math.min(o.span,evs[0].s));
    g.select(".sweep").attr("d",d3.arc()({innerRadius:0,outerRadius:o.R,startAngle:a0,endAngle:2*Math.PI}))
      .attr("transform",`translate(${o.cx},${o.cy})`);
    g.select(".rim-arc").attr("d",d3.arc()({innerRadius:o.R,outerRadius:o.R,startAngle:a0,endAngle:2*Math.PI}))
      .attr("transform",`translate(${o.cx},${o.cy})`);
    const pts=evs.map(e=>{
      const a=dialAngle(k,e.s);
      return {e,a,x:o.cx+Math.sin(a)*o.R,y:o.cy-Math.cos(a)*o.R,right:Math.sin(a)>=0};
    });
    o.pts=pts;
    if(mob){
      pts.forEach((p,i)=>{
        const e=p.e, col=CAT_COL[e.cat], lr=o.R+16;
        const bx=o.cx+Math.sin(p.a)*lr, by=o.cy-Math.cos(p.a)*lr;
        const eg=mk.append("g").datum(p).attr("class","emk");
        eg.append("circle").attr("class","halo").attr("cx",p.x).attr("cy",p.y).attr("r",8)
          .attr("fill",col).attr("fill-opacity",.28).style("mix-blend-mode","multiply");
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
        eg.append("polyline").attr("points",`${sx},${sy} ${ex-dx*10},${p.ly} ${ex},${p.ly}`)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.75);
        eg.append("circle").attr("class","halo").attr("cx",p.x).attr("cy",p.y).attr("r",10)
          .attr("fill",col).attr("fill-opacity",.26).style("mix-blend-mode","multiply");
        eg.append("circle").attr("class","core").attr("cx",p.x).attr("cy",p.y).attr("r",3.6)
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
      if(cur==="year"||/^m\d+$/.test(cur)){
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
          const names=evs.map(e=>e.lab).join(", ");
          tp.show(`<b>${hit.d} ${deMes(hit.m)}</b> · ${names}<br>${fmtAge(e0.ya)} · ${CAT_NAME[e0.cat]}`);
        } else {
          V.focus(g.selectAll(".emk"),null);
          tp.show(`<b>${hit.d} ${deMes(hit.m)}</b> · ${eraName(hit.doy)}`);
        }
        return;
      }
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
      /* Rellotges */
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
    if(parent==="year"){ const o=geo.year.months[+child.slice(1)]; return {x:o.x,y:o.y,w:o.w,h:o.h}; }
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
    const P=zoomIn?A:B, Ch=zoomIn?B:A, dur=1050;
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
   2. L'ANY REPARTIT · IB-43 (QUADRATS D'ESCALA) + IB-49 (TEMPS PROFUND)
   ===================================================================== */
function initEras(){
  const box=document.getElementById("erasbox"), lg=document.getElementById("erasLg");
  const titleEl=document.getElementById("erasTitle"), subEl=document.getElementById("erasSub");
  if(!box)return;
  let mode="area";

  const NEST=[
    {id:"univ",  a:T,              b:BY.sun.ya,       l:"Tot l'any (des del Big Bang)",       slice:"Abans del Sol i de la Terra: 67 %", fill:V.alpha(C.blau,.11), stroke:C.blau,     sw:1.1},
    {id:"earth", a:BY.sun.ya,      b:BY.life.ya,      l:"Des del Sol i la Terra",             slice:"Terra sense vida coneguda: 8 %",    fill:V.alpha(C.ghost,.28),stroke:C.ink2,     sw:.85},
    {id:"life",  a:BY.life.ya,     b:BY.ediacara.ya,  l:"Des dels primers fòssils de vida",   slice:"Vida microscòpica: 21 %",           fill:V.alpha(C.groc,.20), stroke:C.grocFosc, sw:1},
    {id:"anim",  a:BY.ediacara.ya, b:BY.homochimp.ya, l:"Animals i plantes",                  slice:"Animals i plantes: 4 %",            fill:V.alpha(C.groc,.46), stroke:C.grocFosc, sw:1.1},
    {id:"hum",   a:BY.homochimp.ya,b:0,               l:"Llinatge humà",                      slice:"Llinatge humà: 0,05 %",             fill:C.vermell,           stroke:C.vermell,  sw:1}
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
    } else {
      if(titleEl)titleEl.textContent="Temps profund: els 39 fets en escala logarítmica";
      if(subEl)subEl.textContent="Cada salt de l'eix és 10 vegades més a prop d'avui, del Big Bang fins a l'arribada a la Lluna";
      if(lg)V.legendCat(lg,[
        {c:C.blau,t:"Univers"},
        {c:C.groc,t:"Terra i vida"},
        {c:C.vermell,t:"Humans"}
      ]);
    }
  }

  function drawArea(el,w){
    const mob=w<640;
    const S=Math.round(mob?Math.min(w-8,360):Math.min(420,w-360));
    const ox=mob?Math.round((w-S)/2):Math.max(4,Math.round((w-S-350)/2));
    const topPad=mob?16:18, botPad=mob?146:54;
    const H=topPad+S+botPad;
    const s=V.svg(el,w,H,"Quadrats niats d'àrea proporcional a cada etapa de l'any còsmic: abans del Sol ocupa el 67 %, la Terra sense vida el 8 %, la vida microscòpica el 21 %, animals i plantes el 4 % i el llinatge humà un quadrat vermell diminut del 0,05 %.");
    const g=s.append("g").attr("transform",`translate(${ox},${topPad})`);
    const side=d=>S*Math.sqrt(d.a/T);

    // Reixa subtil de 365 dies (1 quadradet = 1 dia còsmic)
    const u=S/Math.sqrt(365), cid="c43"+Math.random().toString(36).slice(2,6);
    g.append("defs").append("clipPath").attr("id",cid).append("rect").attr("width",S).attr("height",S);
    const grid=g.append("g").attr("clip-path",`url(#${cid})`).attr("stroke",C.ink).attr("stroke-opacity",.065).attr("stroke-width",.55);
    let gp="";
    for(let a=u;a<S;a+=u)gp+=`M${a.toFixed(1)},0V${S}M0,${(S-a).toFixed(1)}H${S}`;
    grid.append("path").attr("d",gp);

    const sqG=g.append("g");
    const SQ=sqG.selectAll("rect.sq").data(NEST).join("rect").attr("class","sq")
      .attr("x",0)
      .attr("fill",d=>d.fill).attr("stroke",d=>d.stroke).attr("stroke-width",d=>d.sw)
      .style("cursor","pointer");
    const placeSq=(sel,f)=>sel
      .attr("y",d=>S-Math.max(d.id==="hum"?3:0,side(d)*f(d)))
      .attr("width",d=>Math.max(d.id==="hum"?3:0,side(d)*f(d)))
      .attr("height",d=>Math.max(d.id==="hum"?3:0,side(d)*f(d)));
    placeSq(SQ,()=>1);

    // Etiquetes directes separades
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
      // Anotació quirúrgica al diminut quadrat humà
      const hSide=Math.max(3,side(NEST[4]));
      V.note(lbG,{
        x:hSide+2, y:S-hSide/2, tx:Math.min(S-8,118), ty:S+28, kind:"curve", bend:16, anchor:"start", size:12.5,
        lines:[["Llinatge humà · 0,05 %",true],["7 milions d'anys en una cantonada"]]
      });
    } else {
      // Mòbil: llista compacta i neta sota el quadrat, + fletxa al quadrat humà
      const hSide=Math.max(3,side(NEST[4]));
      V.note(lbG,{
        x:hSide+2, y:S-hSide/2, tx:Math.min(S-6,84), ty:S+22, kind:"curve", bend:12, anchor:"start", size:11.5,
        lines:[["Llinatge humà · 0,05 %",true]]
      });
      NEST.slice(0,4).forEach((d,i)=>{
        const y0=S+54+i*22;
        const q=lbG.append("g").datum(d).attr("class","q-lbl");
        q.append("rect").attr("x",0).attr("y",y0-9).attr("width",10).attr("height",10).attr("fill",d.fill).attr("stroke",d.stroke).attr("stroke-width",.9);
        V.t(q,16,y0,`${d.slice}`,{size:12,weight:600,fill:C.ink});
      });
    }

    const hl=g.append("rect").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6).style("pointer-events","none").style("display","none");
    const tp=V.tip(el);
    function setHv(d){
      if(!d){ hl.style("display","none"); V.focus(SQ,null); V.focus(lbG.selectAll(".q-lbl"),null); tp.hide(); return; }
      const sd=Math.max(d.id==="hum"?3:0,side(d));
      hl.style("display",null).attr("x",0).attr("y",S-sd).attr("width",sd).attr("height",sd);
      V.focus(SQ,x=>x===d,{dim:.48});
      V.focus(lbG.selectAll(".q-lbl"),x=>x===d,{dim:.48});
      const pctTot=d.a/T*100, pctStr=(pctTot>=1?f1(pctTot):f2(pctTot))+" %";
      tp.show(`<b>${d.l}</b> · ${pctStr} de l'any (${fmtAge(d.a)})<br>${d.slice}`);
    }
    V.hover(s.node(),(ev,[px,py])=>{
      const rx=px-ox, ry=py-topPad;
      if(rx>=-6&&rx<=S+6&&ry>=-6&&ry<=S+6){
        // cerca del quadrat més petit que conté el punter
        let hit=null;
        for(let i=NEST.length-1;i>=0;i--){
          const sd=Math.max(NEST[i].id==="hum"?14:0,side(NEST[i]));
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
        .attr("y",d=>S-Math.max(d.id==="hum"?3:0,side(d)))
        .attr("width",d=>Math.max(d.id==="hum"?3:0,side(d)))
        .attr("height",d=>Math.max(d.id==="hum"?3:0,side(d)));
      lbG.style("opacity",0).transition().delay(520).duration(450).style("opacity",1);
    });
  }

  function drawLog(el,w){
    const mob=w<640, lanes=mob?5:5, laneH=mob?34:36;
    const m={t:26,l:mob?10:14,r:mob?10:14}, axisY=m.t+lanes*laneH+22, H=axisY+52;
    const s=V.svg(el,w,H,"Línia del temps logarítmica amb els 39 esdeveniments reals del calendari còsmic, des del Big Bang fa 13.787 milions d'anys fins a l'arribada a la Lluna fa 57 anys.");
    const g=s.append("g");
    const x=d3.scaleLog([1.45e10,40],[m.l,w-m.r]);

    // Quadrícula logarítmica
    const gridG=g.append("g"), axG=g.append("g");
    const ticks=d3.range(2,11).map(k=>Math.pow(10,k)).filter(v=>!mob||Math.round(Math.log10(v))%2===0);
    const fmtTick=v=>{
      if(v>=1e9) return f0(v/1e9)+" mil M";
      if(v>=1e6) return f0(v/1e6)+" M";
      return f0(v);
    };
    ticks.forEach(v=>{
      const X=x(v);
      gridG.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t-4).attr("y2",axisY).attr("stroke",C.grid).attr("stroke-width",.65);
      axG.append("line").attr("x1",X).attr("x2",X).attr("y1",axisY).attr("y2",axisY+4).attr("stroke",C.muted);
      const lbl=fmtTick(v), tw=textW(lbl,11);
      V.t(axG,clamp(X,m.l+tw/2,w-m.r-tw/2),axisY+17,lbl,{size:11,fill:C.muted,anchor:"middle"});
    });
    g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",axisY).attr("y2",axisY).attr("stroke",C.ink).attr("stroke-width",1);
    V.t(axG,w-m.r,axisY+36,mob?"anys enrere · escala logarítmica (×10)":"anys enrere · escala logarítmica: cada marca, 10 vegades més a prop d'avui",{size:11.5,fill:C.ink2,anchor:"end",italic:true});

    // Col·locació d'etiquetes en carrils sense solapaments (prioritat -> dreta a esquerra)
    const placed=[], lay={};
    const pri=EV.slice().sort((a,b)=>a.pri-b.pri||a.ya-b.ya);
    const laneY=k=>axisY-22-k*laneH;
    pri.forEach(e=>{
      const X=x(e.ya), nm=e.lab, ag=fmtAge(e.ya);
      const tw=Math.max(textW(nm,mob?11.5:12,700),textW(ag,11))+8;
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
    evs.append("circle").attr("class","halo").attr("cy",axisY).attr("r",d=>lay[d.id].lane>=0?7:4.5)
      .attr("fill",d=>CAT_COL[d.cat]).attr("fill-opacity",.26).style("mix-blend-mode","multiply");
    evs.append("circle").attr("class","dt").attr("cy",axisY).attr("r",d=>lay[d.id].lane>=0?3.1:2.2)
      .attr("fill",d=>CAT_COL[d.cat]).attr("stroke",d=>CAT_STROKE[d.cat]).attr("stroke-width",.9);
    evs.each(function(d){
      const L=lay[d.id]; if(L.lane<0)return;
      const q=d3.select(this).append("g").attr("class","lb"), dx=L.anc==="start"?4:-4, Y=laneY(L.lane);
      V.t(q,dx,Y,L.nm,{anchor:L.anc,size:mob?11.5:12,weight:700,fill:C.ink,halo:3});
      V.t(q,dx,Y+12.5,L.ag,{anchor:L.anc,size:11,fill:C.muted,halo:3});
    });

    // Hover: el fet més proper
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
      hvG.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t).attr("y2",axisY+6)
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
      evs.select(".st").attr("y2",axisY-4).transition().delay((d,i)=>150+i*25).duration(450).ease(EIO)
        .attr("y2",d=>lay[d.id].lane>=0?laneY(lay[d.id].lane)-10:axisY-4);
      evs.select(".dt").attr("r",0).transition().delay((d,i)=>i*25).duration(360)
        .attr("r",d=>lay[d.id].lane>=0?3.1:2.2);
      evs.select(".lb").style("opacity",0).transition().delay((d,i)=>300+i*25).duration(350).style("opacity",1);
    });
  }

  updateHeader();
  const mounted=V.mount(box,(el,w)=>{
    if(mode==="area")drawArea(el,w); else drawLog(el,w);
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
   3. LA TEVA VIDA, AL CALENDARI · IB-35 ESCALA DE L'ÚLTIM SEGON
   ===================================================================== */
function initLife(){
  const rng=document.getElementById("lifeRange"), out=document.getElementById("lifeOut");
  const valEl=document.getElementById("lifeVal"), box=document.getElementById("lifebox"), lg=document.getElementById("lifeLg");
  if(!rng||!box)return;
  if(lg&&!lg.childElementCount){
    V.legendCat(lg,[
      {c:C.vermell,t:"La teva vida"},
      {c:C.blau,t:"Fites històriques"}
    ]);
  }
  const HIST=[BY.frrev,BY.moonlanding];
  let W=0, H=168, x=null, axisY=108, svg=null, dynG=null, hvG=null, tp=null;

  function draw(el,w){
    W=w; const mob=w<520;
    H=mob?202:174; axisY=mob?104:108;
    const ml=mob?8:12, mr=mob?8:12;
    svg=V.svg(el,w,H,"L'últim segon de l'any còsmic (437 anys), amb la durada d'una vida humana marcada en vermell al final i comparada amb la Revolució Francesa i l'arribada a la Lluna.");
    x=d3.scaleLinear([1,0],[ml,w-mr]);
    const g=svg.append("g");

    // Eix net sobre paper (P1: sense fons gris)
    g.append("line").attr("x1",ml).attr("x2",w-mr).attr("y1",axisY).attr("y2",axisY).attr("stroke",C.ink).attr("stroke-width",1);
    for(let k=0;k<=10;k++){
      const sVal=1-k/10, xx=x(sVal), maj=k%5===0;
      g.append("line").attr("x1",xx).attr("x2",xx).attr("y1",axisY).attr("y2",axisY+(maj?8:4))
        .attr("stroke",maj?C.ink:C.hair).attr("stroke-width",maj?.95:.6);
      if(maj){
        const anc=k===0?"start":k===10?"end":"middle";
        const lbl=k===0?"23:59:59":k===10?"24:00":"mig segon";
        V.t(g,xx,axisY+22,lbl,{anchor:anc,size:11.5,fill:k===10?C.ink:C.muted,weight:k===10?700:400});
      }
    }

    // Fites històriques reals dins de l'últim segon
    const histG=g.append("g");
    HIST.forEach((e,i)=>{
      const ex=x(e.s), yr=2026-Math.round(e.ya);
      const q=histG.append("g").datum(e).attr("class","h-mk");
      q.append("circle").attr("cx",ex).attr("cy",axisY).attr("r",8)
        .attr("fill",C.blau).attr("fill-opacity",.22).style("mix-blend-mode","multiply");
      q.append("circle").attr("cx",ex).attr("cy",axisY).attr("r",3.1)
        .attr("fill",C.blau).attr("stroke","#fff").attr("stroke-width",1.1);
      const ly=axisY+(mob?(i===0?42:74):42);
      const anc=i===0?"middle":"end", tx=i===0?ex:Math.min(w-mr-4,ex-4);
      q.append("line").attr("x1",ex).attr("x2",ex).attr("y1",axisY+5).attr("y2",ly-11)
        .attr("stroke",C.blau).attr("stroke-width",.7).attr("stroke-opacity",.75);
      V.t(q,tx,ly,`${e.lab} (${yr})`,{anchor:anc,size:11.5,weight:600,fill:C.ink,halo:3});
      V.t(q,tx,ly+13,`a ${f2(e.s)} s de mitjanit`,{anchor:anc,size:11,fill:C.muted,halo:3});
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
      const sVal=clamp(x.invert(px),0,1), xx=x(sVal), ya=Math.round(sVal*SPY), yr=2026-ya;
      hvG.selectAll("*").remove();
      hvG.append("line").attr("x1",xx).attr("x2",xx).attr("y1",18).attr("y2",axisY+8)
        .attr("stroke",C.ink).attr("stroke-width",.75).attr("stroke-dasharray","2 2");
      hvG.append("circle").attr("cx",xx).attr("cy",axisY).attr("r",4)
        .attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.5);
      tp.show(`<b>Any ${yr}</b> (fa ${f0(ya)} anys) · a ${f2(sVal)} s de mitjanit`);
    },()=>{ hvG.selectAll("*").remove(); tp.hide(); });
  }

  function renderLife(anim){
    const yrs=+rng.value, sVal=yrs/SPY;
    const sStr=sVal<.1?f3(sVal):f2(sVal);
    if(valEl)valEl.textContent=`${yrs} ${yrs===1?"any":"anys"}`;
    rng.setAttribute("aria-valuetext",`${yrs} ${yrs===1?"any":"anys"}, ${sStr} segons de l'any còsmic`);
    if(out)out.innerHTML=`<b>${yrs} ${yrs===1?"any":"anys"}</b> de vida ocupen <b>${sStr} segons</b> del calendari còsmic.`;
    if(!dynG||!x)return;

    const xA=x(sVal), xB=x(0), span=Math.max(2,xB-xA), mx=(xA+xB)/2;
    const arcH=Math.min(axisY-34,Math.max(24,span*.42));
    const arcPath=`M${xA},${axisY-2} Q${mx},${axisY-2-arcH*1.65} ${xB},${axisY-2}`;

    dynG.selectAll("*").remove();
    // Cinta translúcida sobre l'eix
    dynG.append("rect").attr("x",xA).attr("y",axisY-11).attr("width",span).attr("height",11)
      .attr("fill",C.vermell).attr("fill-opacity",.26).style("mix-blend-mode","multiply");
    dynG.append("line").attr("x1",xA).attr("x2",xB).attr("y1",axisY).attr("y2",axisY)
      .attr("stroke",C.vermell).attr("stroke-width",2.4);
    // Arc comparatiu estil IB-35
    dynG.append("path").attr("d",arcPath).attr("fill","none")
      .attr("stroke",C.vermell).attr("stroke-width",1.6).attr("stroke-opacity",.9);
    // Cercle translúcid d'inici de vida
    dynG.append("circle").attr("cx",xA).attr("cy",axisY).attr("r",8)
      .attr("fill",C.vermell).attr("fill-opacity",.25).style("mix-blend-mode","multiply");
    dynG.append("circle").attr("cx",xA).attr("cy",axisY).attr("r",3.4)
      .attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.2);
    // Etiqueta neta sobre l'arc, sempre dins de l'amplada
    const topY=Math.max(20,axisY-arcH*.88-20);
    const lx=clamp(mx,76,W-76);
    V.t(dynG,lx,topY,`${yrs} ${yrs===1?"any":"anys"} · ${sStr} s`,{anchor:"middle",size:13,weight:700,fill:C.vermell,halo:3.5});
    V.t(dynG,lx,topY+15,`${f1(sVal*100)} % de l'últim segon`,{anchor:"middle",size:11.5,fill:C.ink2,halo:3});
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
