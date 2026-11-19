/* El calendari còsmic — gràfics fets amb codi (d3).
   Escala: l'edat de l'univers (Planck 2018: 13.787 milions d'anys) comprimida en un any de 365 dies.
   Dades i fonts: research/calendari-events.csv i research/validacio-calendari-cosmic.md */
(function(){
"use strict";
var T=13.787e9, YEAR=365*86400, SPY=T/YEAR;
var sec=function(ya){return ya/SPY};
var C={cos:"#2C5DA8",life:"#3F7F2A",hum:"#C8442A",ink:"#121212",ink2:"#4A4A4A",muted:"#7A7A7A",hair:"#DADADA",soft:"#F2F1EE"};
var SANS="'Source Sans 3', sans-serif",SERIF="'STIXGeneral', 'STIX Two Text', Georgia, serif";
var MESL=["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"];
var MD=[31,28,31,30,31,30,31,31,30,31,30,31],M0=[0];for(var i=1;i<12;i++)M0[i]=M0[i-1]+MD[i-1];

var EV=[
 ["bigbang",13.787e9,"Big Bang","cos"],["cmb",13.7866e9,"Primers àtoms","cos"],
 ["firststars",13.637e9,"Primeres estrelles","cos"],["firstgalaxies",13.507e9,"Primeres galàxies","cos"],
 ["milkyway",13.0e9,"Via Làctia","cos"],["sun",4.5673e9,"Neix el Sol","cos"],["moon",4.51e9,"Neix la Lluna","cos"],
 ["zircon",4.404e9,"Roques més antigues","life"],["luca",4.2e9,"Avantpassat comú de la vida","life"],
 ["life",3.48e9,"Primers fòssils de vida","life"],["goe",2.43e9,"L'aire s'omple d'oxigen","life"],
 ["eukaryotes",1.65e9,"Cèl·lules complexes","life"],["multicell",1.56e9,"Pluricel·lulars","life"],
 ["sex",1.047e9,"Reproducció sexual","life"],["snowball",7.17e8,"Terra bola de gel","life"],
 ["ediacara",5.74e8,"Primers animals grans","life"],["cambrian",5.388e8,"Explosió del Cambrià","life"],
 ["landplants",4.7e8,"Plantes a terra","life"],["landanimals",4.25e8,"Animals a terra","life"],
 ["tetrapods",3.95e8,"Vertebrats a terra","life"],["permian",2.51941e8,"Gran Mortaldat","life"],
 ["dinos",2.314e8,"Primers dinosaures","life"],["mammals",2.05e8,"Primers mamífers","life"],
 ["flowers",1.3e8,"Primeres flors","life"],["kpg",6.6043e7,"Asteroide de Chicxulub","life"],
 ["homochimp",7e6,"Humans i ximpanzés se separen","hum"],["tools",3.3e6,"Eines de pedra","hum"],
 ["homo",2.8e6,"Gènere Homo","hum"],["fire_use",1e6,"Ús del foc","hum"],["fire_make",4e5,"Encendre foc","hum"],
 ["sapiens",3.15e5,"Homo sapiens","hum"],["neander",4e4,"Últims neandertals","hum"],
 ["americas",2.2e4,"Humans a Amèrica","hum"],["agri",1.15e4,"Agricultura","hum"],["writing",5250,"Escriptura","hum"],
 ["christ",1995,"Cristianisme","hum"],["columbus",534,"Colom al Carib","hum"],["frrev",237,"Revolució Francesa","hum"],
 ["moonlanding",57,"Arribada a la Lluna","hum"]
].map(function(e){return {id:e[0],ya:e[1],s:sec(e[1]),lab:e[2],cat:e[3]}});
var BY={};EV.forEach(function(e){BY[e.id]=e});
EV.forEach(function(e){var t=YEAR-e.s,d=Math.floor(t/86400);e.doy=Math.min(364,d);e.tod=t-d*86400});

/* tons de fons segons l'etapa de cada dia */
function eraTint(doy){var s=(365-doy)*86400;
  if(s>BY.sun.s)return "#E3E9F3"; if(s>BY.life.s)return "#ECEBE7"; if(s>BY.ediacara.s)return "#E7EFE0"; return "#D7E7CC"}
function pad(n){return (n<10?"0":"")+n}
function clock(e,secs){var t=secs?Math.round(e.tod):Math.round(e.tod/60)*60,h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return h+":"+pad(m)+(secs?":"+pad(Math.floor(s)):"")}
function fmtS(s){return (s<1?IB.fmt(s,2):s<10?IB.fmt(s,1):IB.fmt(s,0))+" s"}

/* passos */
var STEPS=[
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
var HEAD={year:["Tot l'any","1 dia = 37,8 milions d'anys"],m0:["Gener","1 dia = 37,8 milions d'anys"],m8:["Setembre","1 dia = 37,8 milions d'anys"],m11:["Desembre","1 dia = 37,8 milions d'anys"],
  day:["31 de desembre","1 hora = 1,6 milions d'anys"],hour:["31 de desembre, l'última hora","1 minut = 26.200 anys"],min:["L'últim minut","1 segon = 437 anys"],sec:["Els últims 5 segons","1 segon = 437 anys"]};
/* jerarquia per als zooms: fill -> pare */
var PARENT={m0:"year",m8:"year",m11:"year",day:"m11",hour:"day",min:"hour",sec:"min"};

var svg=d3.select("#cal"),gbox=document.getElementById("calbox");
var W=0,H=0,mob=false,cur=null,curStep=-1,layers={},geo={};
var measure=document.createElement("canvas").getContext("2d");

function layout(){
  W=gbox.clientWidth;mob=innerWidth<900;
  H=Math.round(mob?Math.min(innerHeight*.46,W*1.05):Math.min(innerHeight*.62,W*.62,560));
  svg.attr("viewBox","0 0 "+W+" "+H).attr("height",H);
  svg.selectAll("*").remove();layers={};
  ["year","m0","m8","m11","day","hour","min","sec"].forEach(function(k){layers[k]=svg.append("g").attr("class","lv").attr("opacity",0).style("display","none")});
  buildYear();[0,8,11].forEach(buildMonth);buildDial("day",24,86400);buildDial("hour",60,3600);buildDial("min",60,60);buildSec();
  if(cur){show(cur,1);highlight()}
}

/* ---------- l'any sencer: 12 fulls de calendari ---------- */
function buildYear(){
  var g=layers.year,cols=mob?3:4,rows=12/cols,gx=mob?10:22,gy=mob?8:16,top=4;
  var mw=(W-gx*(cols-1))/cols,th=mob?14:18,mh=(H-top-gy*(rows-1))/rows;
  var cs=Math.min((mw)/7,(mh-th)/5.2),cell=cs-1.6;
  geo.year={months:[]};
  for(var m=0;m<12;m++){
    var c=m%cols,r=Math.floor(m/cols),x=c*(mw+gx),y=top+r*(mh+gy);
    geo.year.months[m]={x:x,y:y,w:mw,h:mh};
    g.append("text").attr("x",x).attr("y",y+th-5).attr("font-family",SANS).attr("font-weight",700).attr("font-size",mob?10.5:12.5).attr("fill",C.ink).text(MESL[m]);
    for(var d=0;d<MD[m];d++){var doy=M0[m]+d;
      g.append("rect").attr("class","day d"+doy).attr("x",x+(d%7)*cs).attr("y",y+th+Math.floor(d/7)*cs).attr("width",cell).attr("height",cell).attr("fill",eraTint(doy));}
  }
  geo.year.cs=cs;geo.year.th=th;
  g.append("g").attr("class","marks");
}
function yearCell(doy){var m=0;while(doy>=M0[m]+MD[m])m++;var d=doy-M0[m],o=geo.year.months[m],cs=geo.year.cs;return {x:o.x+(d%7)*cs,y:o.y+geo.year.th+Math.floor(d/7)*cs,w:cs-1.6}}

/* ---------- un mes, gran ---------- */
function buildMonth(m){
  var g=layers["m"+m],cols=7,rows=5,gap=mob?2:4,top=0;
  var cs=Math.min((W-gap*(cols-1))/cols,(H-top-gap*(rows-1))/rows),ox=(W-(cs*cols+gap*(cols-1)))/2;
  geo["m"+m]={cs:cs,gap:gap,ox:ox,top:top};
  for(var d=0;d<MD[m];d++){var doy=M0[m]+d,x=ox+(d%7)*(cs+gap),y=top+Math.floor(d/7)*(cs+gap);
    var cg=g.append("g").attr("class","mc mc"+doy);
    cg.append("rect").attr("x",x).attr("y",y).attr("width",cs).attr("height",cs).attr("fill",eraTint(doy));
    cg.append("text").attr("x",x+6).attr("y",y+(mob?13:17)).attr("font-family",SANS).attr("font-weight",600).attr("font-size",mob?10.5:13).attr("fill",C.ink2).text(d+1);
  }
  g.append("g").attr("class","marks");
}
function monthCell(m,d){var o=geo["m"+m];return {x:o.ox+(d%7)*(o.cs+o.gap),y:o.top+Math.floor(d/7)*(o.cs+o.gap),w:o.cs}}

/* ---------- rellotges: 24 hores, 60 minuts, 60 segons ---------- */
function dialGeo(){var R=Math.min(W*(mob?.34:.26),H*(mob?.38:.36));return {cx:W/2,cy:H/2+(mob?4:6),R:R}}
function buildDial(k,n,span){
  var g=layers[k],o=dialGeo();geo[k]={cx:o.cx,cy:o.cy,R:o.R,n:n,span:span};
  g.append("circle").attr("cx",o.cx).attr("cy",o.cy).attr("r",o.R).attr("fill",k==="day"?"#F4F6F1":"#FAF6F4").attr("stroke",C.ink).attr("stroke-width",1.2);
  for(var i=0;i<n;i++){var a=i/n*2*Math.PI,major=k==="day"?i%3===0:i%5===0,r0=o.R-(major?10:5);
    g.append("line").attr("x1",o.cx+Math.sin(a)*r0).attr("y1",o.cy-Math.cos(a)*r0).attr("x2",o.cx+Math.sin(a)*o.R).attr("y2",o.cy-Math.cos(a)*o.R).attr("stroke",C.ink).attr("stroke-width",major?1.1:.6);
    if(major){var rl=o.R-22,lab=k==="day"?String(i):k==="hour"?"23:"+pad(i):":"+pad(i);
      g.append("text").attr("x",o.cx+Math.sin(a)*rl).attr("y",o.cy-Math.cos(a)*rl+4).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",mob?9.5:11).attr("fill",C.muted).text(lab)}}
  g.append("text").attr("class","ctr1").attr("x",o.cx).attr("y",o.cy-4).attr("text-anchor","middle").attr("font-family",SERIF).attr("font-weight",600).attr("font-size",mob?20:30).attr("fill",C.ink);
  g.append("text").attr("class","ctr2").attr("x",o.cx).attr("y",o.cy+18).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",mob?10.5:12.5).attr("fill",C.ink2);
  g.append("path").attr("class","sweep").attr("fill",C.hum).attr("opacity",.13);
  g.append("g").attr("class","marks");
}
function dialAngle(k,s){var o=geo[k];return (1-s/o.span)*2*Math.PI}

/* ---------- els últims 5 segons ---------- */
function buildSec(){
  var g=layers.sec,x0=mob?8:30,x1=W-(mob?8:30),y=H*.72;geo.sec={x0:x0,x1:x1,y:y,span:5};
  g.append("rect").attr("x",x0).attr("y",y-18).attr("width",x1-x0).attr("height",18).attr("fill","#FAF6F4");
  g.append("line").attr("x1",x0).attr("x2",x1).attr("y1",y).attr("y2",y).attr("stroke",C.ink);
  for(var i=0;i<=50;i++){var x=x0+(x1-x0)*i/50,maj=i%10===0;
    g.append("line").attr("x1",x).attr("x2",x).attr("y1",y).attr("y2",y+(maj?8:4)).attr("stroke",C.ink).attr("stroke-width",maj?1:.5);
    if(maj)g.append("text").attr("x",x).attr("y",y+22).attr("text-anchor",i===0?"start":i===50?"end":"middle").attr("font-family",SANS).attr("font-size",mob?10.5:12).attr("fill",C.ink2).text(i===50?"24:00":"23:59:5"+(5+i/10))}
  var life=80/SPY,lx=x1-(x1-x0)*life/5;
  g.append("rect").attr("x",lx).attr("y",y-18).attr("width",x1-lx).attr("height",18).attr("fill",C.hum).attr("opacity",.35);
  g.append("text").attr("x",x1).attr("y",y+42).attr("text-anchor","end").attr("font-family",SANS).attr("font-size",mob?10.5:12).attr("fill",C.ink2).text("En vermell clar, una vida de 80 anys: "+IB.fmt(life,2)+" s");
  g.append("g").attr("class","marks");
}

/* ---------- etiquetes de cada pas ---------- */
function labelW(t,fs){measure.font="600 "+fs+"px "+SANS;return measure.measureText(t).width}
function highlight(){
  var st=STEPS[curStep];if(!st)return;var k=st.lv,g=layers[k],mk=g.select(".marks");mk.selectAll("*").remove();
  var fs=mob?10.5:13,fs2=fs-1.5,evs=st.ev.map(function(id){return BY[id]});
  if(k==="year"){
    g.selectAll("rect.day").attr("stroke",null);
    evs.forEach(function(e,i){var c=yearCell(e.doy);
      mk.append("rect").attr("x",c.x-1.5).attr("y",c.y-1.5).attr("width",c.w+3).attr("height",c.w+3).attr("fill",C[e.cat]).attr("stroke","#fff");
      mk.append("text").attr("x",c.x+c.w/2).attr("y",c.y+c.w/2+3.5).attr("text-anchor","middle").attr("font-family",SANS).attr("font-weight",700).attr("font-size",Math.min(10,c.w*.8)).attr("fill","#fff").text(i+1);
    });
    var list=d3.select("#calList").html("");
    evs.forEach(function(e,i){var d=e.doy-M0[monthOf(e.doy)]+1;list.append("li").html("<b style='background:"+C[e.cat]+"'>"+(i+1)+"</b>"+e.lab+" <span>"+d+" de "+MESL[monthOf(e.doy)].toLowerCase()+"</span>")});
    return;
  }
  d3.select("#calList").html("");
  if(/^m\d+$/.test(k)){
    var m=+k.slice(1),o=geo[k],byDay={};
    evs.forEach(function(e){(byDay[e.doy]=byDay[e.doy]||[]).push(e)});
    Object.keys(byDay).forEach(function(doy){var es=byDay[doy],d=doy-M0[m],c=monthCell(m,d);
      mk.append("rect").attr("x",c.x).attr("y",c.y).attr("width",c.w).attr("height",c.w).attr("fill",C[es[0].cat]);
      mk.append("text").attr("x",c.x+6).attr("y",c.y+(mob?13:17)).attr("font-family",SANS).attr("font-weight",700).attr("font-size",mob?10.5:13).attr("fill","#fff").text(d+1);
      if(!mob)es.forEach(function(e,j){wrap(mk,e.lab,c.x+6,c.y+38+j*(fs*2.6),c.w-10,fs,"#fff",600)});
      else mk.append("text").attr("x",c.x+c.w/2).attr("y",c.y+c.w*.68).attr("text-anchor","middle").attr("font-family",SANS).attr("font-weight",700).attr("font-size",15).attr("fill","#fff").text(es.map(function(e){return evs.indexOf(e)+1}).join(", "));
    });
    if(mob){var list=d3.select("#calList");evs.forEach(function(e,i){var d=e.doy-M0[m]+1;list.append("li").html("<b style='background:"+C[e.cat]+"'>"+(i+1)+"</b>"+e.lab+" <span>"+d+"</span>")})}
    return;
  }
  if(k==="sec"){
    var o2=geo.sec;
    evs.forEach(function(e,i){var x=o2.x1-(o2.x1-o2.x0)*e.s/5,ly=o2.y-34-i*(fs*2.9),anc=i===0?"start":"end",tx=anc==="end"?x-6:x+6;
      mk.append("polyline").attr("points",x+","+(o2.y-4)+" "+x+","+(ly+5)+" "+(anc==="end"?x-4:x+4)+","+(ly+5)).attr("fill","none").attr("stroke",C.hum).attr("stroke-width",1);
      mk.append("circle").attr("cx",x).attr("cy",o2.y).attr("r",4.5).attr("fill",C.hum).attr("stroke","#fff");
      mk.append("text").attr("x",tx).attr("y",ly-fs*.25).attr("text-anchor",anc).attr("font-family",SANS).attr("font-weight",600).attr("font-size",fs).attr("fill",C.ink).text(e.lab);
      mk.append("text").attr("x",tx).attr("y",ly+fs*1.05).attr("text-anchor",anc).attr("font-family",SANS).attr("font-size",fs2).attr("fill",C.hum).text("a "+fmtS(e.s)+" de mitjanit");
    });
    return;
  }
  /* rellotges */
  var o3=geo[k],last=evs[evs.length-1];
  g.select(".ctr1").text(k==="day"?"24 h":k==="hour"?"60 min":"60 s");
  g.select(".ctr2").text(k==="day"?"del 31 de desembre":k==="hour"?"de 23:00 a 24:00":"de 23:59 a 24:00");
  var a0=dialAngle(k,Math.min(o3.span,evs[0].s));
  g.select(".sweep").attr("d",d3.arc()({innerRadius:0,outerRadius:o3.R,startAngle:a0,endAngle:2*Math.PI})).attr("transform","translate("+o3.cx+","+o3.cy+")");
  var pts=evs.map(function(e){var a=dialAngle(k,e.s);return {e:e,a:a,x:o3.cx+Math.sin(a)*o3.R,y:o3.cy-Math.cos(a)*o3.R,right:Math.sin(a)>=0}});
  var gap=fs*2.7;
  [true,false].forEach(function(side){
    var ps=pts.filter(function(p){return p.right===side}).sort(function(p,q){return p.y-q.y});
    ps.forEach(function(p,i){p.ly=p.y;if(i&&p.ly<ps[i-1].ly+gap)p.ly=ps[i-1].ly+gap});
    var over=ps.length?ps[ps.length-1].ly-(H-fs*2):0;if(over>0)ps.forEach(function(p){p.ly-=over});
    for(var i=ps.length-2;i>=0;i--)if(ps[i].ly>ps[i+1].ly-gap)ps[i].ly=ps[i+1].ly-gap;
    ps.forEach(function(p){p.ly=Math.max(fs*1.2,p.ly)});
  });
  if(mob){var list=d3.select("#calList");
    pts.forEach(function(p,i){var e=p.e,col=C[e.cat],lr=o3.R+13;
      mk.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",4.5).attr("fill",col).attr("stroke","#fff");
      mk.append("circle").attr("cx",o3.cx+Math.sin(p.a)*lr).attr("cy",o3.cy-Math.cos(p.a)*lr).attr("r",7.5).attr("fill",col);
      mk.append("text").attr("x",o3.cx+Math.sin(p.a)*lr).attr("y",o3.cy-Math.cos(p.a)*lr+3.8).attr("text-anchor","middle").attr("font-family",SANS).attr("font-weight",700).attr("font-size",10.5).attr("fill","#fff").text(i+1);
      list.append("li").html("<b style='background:"+col+"'>"+(i+1)+"</b>"+e.lab+" <span>"+clock(e,e.s<600)+"</span>")});
    return}
  pts.forEach(function(p){var e=p.e,col=C[e.cat],dx=p.right?1:-1,ex=o3.cx+dx*(o3.R+(mob?14:26)),tx=ex+dx*5,anc=p.right?"start":"end";
    var r1=o3.R+5,sx=o3.cx+Math.sin(p.a)*r1,sy=o3.cy-Math.cos(p.a)*r1;
    mk.append("polyline").attr("points",sx+","+sy+" "+(ex-dx*8)+","+p.ly+" "+ex+","+p.ly).attr("fill","none").attr("stroke",col).attr("stroke-width",.9);
    mk.append("circle").attr("cx",p.x).attr("cy",p.y).attr("r",4.5).attr("fill",col).attr("stroke","#fff");
    mk.append("text").attr("x",tx).attr("y",p.ly-2).attr("text-anchor",anc).attr("font-family",SANS).attr("font-weight",600).attr("font-size",fs).attr("fill",C.ink).text(e.lab);
    mk.append("text").attr("x",tx).attr("y",p.ly+fs).attr("text-anchor",anc).attr("font-family",SANS).attr("font-size",fs2).attr("fill",col).text(clock(e,e.s<600));
  });
}
function monthOf(doy){var m=0;while(doy>=M0[m]+MD[m])m++;return m}
function wrap(g,txt,x,y,w,fs,col,wt){
  measure.font=wt+" "+fs+"px "+SANS;var words=txt.split(" "),line="",ln=0;
  words.forEach(function(wd,i){var t=line?line+" "+wd:wd;if(measure.measureText(t).width>w&&line){g.append("text").attr("x",x).attr("y",y+ln*fs*1.15).attr("font-family",SANS).attr("font-weight",wt).attr("font-size",fs).attr("fill",col).text(line);ln++;line=wd}else line=t});
  if(line)g.append("text").attr("x",x).attr("y",y+ln*fs*1.15).attr("font-family",SANS).attr("font-weight",wt).attr("font-size",fs).attr("fill",col).text(line);
}

/* ---------- zoom entre nivells ---------- */
function childRect(parent,child){ // on és el fill dins del pare (coordenades del pare)
  if(parent==="year"){var o=geo.year.months[+child.slice(1)];return {x:o.x,y:o.y,w:o.w,h:o.h}}
  if(parent==="m11"){var c=monthCell(11,30);return {x:c.x,y:c.y,w:c.w,h:c.w}}
  if(parent==="day"||parent==="hour"||parent==="min"){var o2=geo[parent],a=2*Math.PI*(1-1/o2.n/2),r=o2.R,s=Math.max(10,r*2*Math.PI/o2.n);
    return {x:o2.cx+Math.sin(a)*r-s/2,y:o2.cy-Math.cos(a)*r-s/2,w:s,h:s}}
  return {x:0,y:0,w:W,h:H};
}
function fitT(r){var k=Math.min(W/r.w,H/r.h);return {k:k,x:W/2-(r.x+r.w/2)*k,y:H/2-(r.y+r.h/2)*k}}
function tStr(t){return "translate("+t.x+","+t.y+") scale("+t.k+")"}
function show(k,op){Object.keys(layers).forEach(function(n){var on=n===k;layers[n].style("display",on?null:"none").attr("opacity",on?op:0).attr("transform",null)})}
var timer=null;
function goLevel(k){
  if(k===cur){return}
  var from=cur;cur=k;
  if(timer){timer.stop();timer=null;if(from)show(from,1)}
  if(!from||IB.reduced){show(k,1);return}
  var zoomIn=PARENT[k]===from,zoomOut=PARENT[from]===k;
  var A=layers[from],B=layers[k];
  Object.keys(layers).forEach(function(n){if(n!==from&&n!==k)layers[n].style("display","none")});
  A.style("display",null);B.style("display",null);
  if(!zoomIn&&!zoomOut){
    B.attr("opacity",0).attr("transform",null);
    timer=d3.timer(function(el){var t=Math.min(1,el/500);A.attr("opacity",1-t);B.attr("opacity",t);if(t>=1){timer.stop();show(k,1)}});return;
  }
  var par=zoomIn?from:k,ch=zoomIn?k:from,r=childRect(par,ch),f=fitT(r),inv={k:r.w/W,x:r.x+(r.w-W*r.w/W)/2,y:r.y+(r.h-H*r.w/W)/2};
  inv.k=Math.min(r.w/W,r.h/H);inv.x=r.x+(r.w-W*inv.k)/2;inv.y=r.y+(r.h-H*inv.k)/2;
  var P=zoomIn?A:B,Ch=zoomIn?B:A,dur=1100;
  timer=d3.timer(function(el){var t=Math.min(1,el/dur),e=d3.easeCubicInOut(t),z=zoomIn?e:1-e; // z: 0 = pare, 1 = fill
    var lk=Math.exp(Math.log(f.k)*z),pk={k:lk,x:f.x*(lk-1)/(f.k-1||1),y:f.y*(lk-1)/(f.k-1||1)};
    P.attr("transform",tStr(pk)).attr("opacity",Math.max(0,1-z*1.4));
    var ck={k:pk.k*inv.k,x:pk.x+pk.k*inv.x,y:pk.y+pk.k*inv.y};
    Ch.attr("transform",tStr(ck)).attr("opacity",Math.min(1,Math.max(0,(z-.35)*1.6)));
    if(t>=1){timer.stop();show(k,1)}
  });
}
function go(i){
  curStep=i;var st=STEPS[i];
  d3.select("#calName").text(HEAD[st.lv][0]);d3.select("#calSub").text(HEAD[st.lv][1]);
  goLevel(st.lv);highlight();
}

/* ---------- la teva vida ---------- */
function lifeFig(){
  var r=document.getElementById("lifeRange"),out=document.getElementById("lifeOut"),sv=d3.select("#life"),box=document.getElementById("lifebox");
  if(!r)return;
  function upd(){
    var yrs=+r.value,s=yrs/SPY,w=box.clientWidth,h=86;
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);sv.selectAll("*").remove();
    var x0=1,x1=w-1,bw=x1-x0;
    sv.append("text").attr("x",x0).attr("y",14).attr("font-family",SANS).attr("font-size",12).attr("fill",C.muted).text("L'últim segon de l'any");
    sv.append("rect").attr("x",x0).attr("y",24).attr("width",bw).attr("height",24).attr("fill",C.soft);
    for(var k=0;k<=10;k++){var x=x0+bw*k/10;sv.append("line").attr("x1",x).attr("x2",x).attr("y1",48).attr("y2",k%5===0?56:52).attr("stroke",C.ink).attr("stroke-width",k%5===0?1:.6);
      if(k%5===0)sv.append("text").attr("x",x).attr("y",72).attr("text-anchor",k===0?"start":k===10?"end":"middle").attr("font-family",SANS).attr("font-size",11.5).attr("fill",C.ink2).text(k===0?"23:59:59":k===10?"24:00":"mig segon")}
    sv.append("rect").attr("x",x1-bw*s).attr("y",24).attr("width",Math.max(1,bw*s)).attr("height",24).attr("fill",C.hum);
    out.innerHTML="<b>"+yrs+" "+(yrs===1?"any":"anys")+"</b> de vida ocupen <b>"+IB.fmt(s,s<.1?3:2)+" segons</b> del calendari còsmic.";
  }
  r.addEventListener("input",upd);addEventListener("resize",upd);upd();
}

/* ---------- l'any repartit ---------- */
function eraFig(){
  var sv=d3.select("#eras"),box=document.getElementById("erasbox");if(sv.empty())return;
  var B=[{a:T,b:BY.sun.ya,l:"Abans del Sol i de la Terra",c:"#9DB3D6"},
    {a:BY.sun.ya,b:BY.life.ya,l:"La Terra, sense vida coneguda",c:"#C9C6BD"},
    {a:BY.life.ya,b:BY.ediacara.ya,l:"Vida microscòpica",c:"#A9C98F"},
    {a:BY.ediacara.ya,b:BY.homochimp.ya,l:"Animals i plantes",c:C.life},
    {a:BY.homochimp.ya,b:0,l:"Llinatge humà",c:C.hum}];
  function upd(){
    var w=box.clientWidth,mobile=w<640,bh=mobile?40:56,h=mobile?bh+30+B.length*26:bh+92;
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);sv.selectAll("*").remove();
    B.forEach(function(b,i){
      var xa=w*(1-b.a/T),xb=w*(1-b.b/T),p=(b.a-b.b)/T*100,lab=b.l,pt=(p>=1?IB.fmt(p,0):IB.fmt(p,2))+" %";
      sv.append("rect").attr("x",xa).attr("y",0).attr("width",Math.max(2,xb-xa)).attr("height",bh).attr("fill",b.c);
      if(mobile){var ly=bh+26+i*26;sv.append("rect").attr("x",0).attr("y",ly-11).attr("width",12).attr("height",12).attr("fill",b.c);
        sv.append("text").attr("x",20).attr("y",ly).attr("font-family",SANS).attr("font-size",13.5).attr("fill",C.ink).text(lab+" · "+pt);return}
      if(xb-xa>150){sv.append("text").attr("x",xa+8).attr("y",bh+22).attr("font-family",SANS).attr("font-weight",600).attr("font-size",13.5).attr("fill",C.ink).text(lab);
        sv.append("text").attr("x",xa+8).attr("y",bh+40).attr("font-family",SANS).attr("font-size",13).attr("fill",C.ink2).text(pt);
        sv.append("line").attr("x1",xa+.5).attr("x2",xa+.5).attr("y1",0).attr("y2",bh+42).attr("stroke",C.ink).attr("stroke-width",.6)}
      else{var ty=bh+22+(i-3)*34;sv.append("line").attr("x1",xb-1).attr("x2",xb-1).attr("y1",bh).attr("y2",ty+20).attr("stroke",b.c);
        sv.append("text").attr("x",xb-8).attr("y",ty+4).attr("text-anchor","end").attr("font-family",SANS).attr("font-weight",600).attr("font-size",13.5).attr("fill",C.ink).text(lab);
        sv.append("text").attr("x",xb-8).attr("y",ty+21).attr("text-anchor","end").attr("font-family",SANS).attr("font-size",13).attr("fill",C.ink2).text(pt)}
    });
  }
  addEventListener("resize",upd);upd();
}

function init(){
  layout();
  IB.scrolly(document.getElementById("calsteps"),document.getElementById("calgraphic"),go);
  lifeFig();eraFig();
  var rt,lw=innerWidth;addEventListener("resize",function(){if(innerWidth===lw&&mob)return;lw=innerWidth;clearTimeout(rt);rt=setTimeout(layout,80)});
  if(document.fonts)document.fonts.ready.then(function(){layout()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
