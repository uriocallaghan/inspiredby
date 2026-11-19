/* De què mor el món? — gràfics fets amb codi (d3).
   Dades: research/causes-mort.csv (IHME GBD 2023), poblacio-historica.csv (HYDE 3.3, Gapminder, ONU WPP 2024),
   natalitat-mortalitat.csv (ONU WPP 2024). Validació: research/validacio-de-que-mor-el-mon.md */
(function(){
"use strict";
var SANS="'Source Sans 3', sans-serif",SERIF="'STIXGeneral', 'STIX Two Text', Georgia, serif";
var K={ink:"#121212",ink2:"#4A4A4A",muted:"#7A7A7A",hair:"#DADADA",soft:"#E9E7E2",ncd:"#2C5DA8",inf:"#B07A1F",inj:"#C8442A",oth:"#9A9A96",
  /* colors de l'article original (2020) */ grey:"#B9B9B9",blue:"#50A0C1",red:"#EC370A",black:"#040404"};
var CAT={ncd:"Malalties no transmissibles",inf:"Infeccions, morts maternes i de nadons",inj:"Lesions i violència",oth:"Altres causes"};

/* ---------- 1. El món en 100 morts (GBD 2023) ---------- */
var TOTAL=60044438;
var G=[ // id, nom, persones (de 100), morts reals, categoria
 ["cardio","Malalties cardiovasculars",32,19139018,"ncd"],
 ["cancer","Càncers",18,10558585,"ncd"],
 ["resp","Malalties respiratòries cròniques",7,4154452,"ncd"],
 ["lri","Infeccions respiratòries",4,2501138,"inf"],
 ["digest","Malalties digestives",4,2416075,"ncd"],
 ["dement","Demència",4,2208098,"ncd"],
 ["diab","Diabetis",3,2003072,"ncd"],
 ["neo","Trastorns neonatals",3,1627962,"inf"],
 ["kidney","Malalties renals",3,1519732,"ncd"],
 ["road","Accidents de trànsit",2,1343047,"inj"],
 ["diarr","Diarrea",2,1107128,"inf"],
 ["tb","Tuberculosi",2,1010463,"inf"],
 ["covid","COVID-19",1,846983,"inf"],
 ["hiv","VIH/sida",1,833175,"inf"],
 ["suic","Suïcidi",1,767616,"inj"],
 ["malaria","Malària",1,669960,"inf"],
 ["viol","Homicidis, guerres i terrorisme",1,594726,"inj"],
 ["nature","Ofegaments, foc i desastres naturals",1,530387,"inj"],
 ["other","Altres causes",10,0,"oth"]
].map(function(g){return {id:g[0],n:g[1],p:g[2],d:g[3],cat:g[4]}});
G[G.length-1].d=TOTAL-G.slice(0,-1).reduce(function(a,g){return a+g.d},0);
var people=[];G.forEach(function(g,gi){for(var i=0;i<g.p;i++)people.push({g:g,gi:gi,k:i})});
var STEPS=[[],["cardio"],["cancer"],["resp","lri"],["digest","dement"],["diab","neo","kidney","road","diarr","tb","covid","hiv","suic","malaria","viol","nature","other"],["ALL"]];

var svg=d3.select("#pp"),box=document.getElementById("ppbox"),W=0,H=0,mob=false,step=0;
var PERSON="M-13,0a13,13 0 1,0 26,0a13,13 0 1,0 -26,0Z"; // punt rodó, com a l'article original
function gridS(){return Math.min(W/10,(H-(mob?48:80))/10,mob?21:30)}
function gridPos(i){var cols=10,s=gridS(),ox=(W-s*cols)/2,oy=(H-(s*10+(mob?42:76)))/2;return {x:ox+(i%cols+.5)*s,y:oy+(Math.floor(i/cols)+.5)*s,sc:s/29.5}}
function groupPos(){ // vista final: una fila (o dues, al mòbil) per grup
  var per=mob?16:32,lines=0,start={};G.forEach(function(g){start[g.id]=lines;lines+=Math.max(1,Math.ceil(g.p/per))});
  var pos={},lh=Math.min(28,(H-8)/lines),labW=mob?128:250,s=Math.min(lh*.82,(W-labW-(mob?50:60))/per),sc=s/29,rowY={};
  G.forEach(function(g){var y0=4+start[g.id]*lh+lh/2;rowY[g.id]=y0;for(var k=0;k<g.p;k++)pos[g.id+k]={x:labW+(k%per+.5)*s,y:y0+Math.floor(k/per)*lh,sc:sc}});
  return {pos:pos,lh:lh,labW:labW,s:s,per:per,rowY:rowY};
}
function layoutPP(){
  W=box.clientWidth;mob=innerWidth<900||W<600;H=mob?Math.round(Math.max(220,Math.min(innerHeight*.31,265))):Math.round(Math.min(innerHeight*.66,W*.72,600));
  svg.attr("viewBox","0 0 "+W+" "+H).attr("height",H);
  render(false);
}
function colorOf(p){
  var cur=STEPS[step],on=cur.indexOf(p.g.id)>=0,done=revealed(p.g.id);
  if(cur[0]==="ALL")return K.blue;
  if(on)return K.red;
  if(done)return K.blue;
  return K.grey;
}
function revealed(id){for(var s=1;s<step;s++)if(STEPS[s].indexOf(id)>=0)return true;return false}
function render(anim){
  if(!W)return;
  var all=STEPS[step][0]==="ALL",gp=all?groupPos():null;
  var sel=svg.selectAll("path.pp").data(people,function(p){return p.g.id+p.k});
  sel.enter().append("path").attr("class","pp").attr("d",PERSON).attr("fill",K.grey)
    .attr("transform",function(p,i){var q=gridPos(i);return "translate("+q.x+","+q.y+") scale("+q.sc+")"});
  var t=svg.selectAll("path.pp").transition().duration(anim&&!IB.reduced?850:0).delay(function(p,i){return anim&&!IB.reduced?(all?p.gi*28+p.k*6:i*4):0});
  t.attr("fill",colorOf).attr("transform",function(p,i){var q=all?gp.pos[p.g.id+p.k]:gridPos(i);return "translate("+q.x+","+q.y+") scale("+q.sc+")"});
  var labs=svg.selectAll("g.gl").data(all?G:[],function(g){return g.id});
  labs.exit().remove();
  var le=labs.enter().append("g").attr("class","gl").attr("opacity",0);
  le.append("text").attr("class","a");le.append("text").attr("class","b");
  le.merge(labs).each(function(g,gi){var y=gp.rowY[g.id]+4,el=d3.select(this);
    el.select(".a").attr("x",gp.labW-8).attr("y",y).attr("text-anchor","end").attr("font-family",SANS).attr("font-size",mob?11:13).attr("font-weight",600).attr("fill",K.ink).text(mob?short(g.n):g.n);
    el.select(".b").attr("x",gp.labW+Math.min(g.p,gp.per)*gp.s+8).attr("y",y).attr("font-family",SANS).attr("font-size",mob?11:12.5).attr("fill",K.ink2).text(g.p+(g.id==="viol"||g.id==="nature"?" (gairebé)":""));
  }).transition().delay(anim?600:0).duration(400).attr("opacity",1);
  var gh=document.getElementById("ppHead"),gs=gridS();gh.style.top=(all?H+(mob?4:8):(H-(gs*10+(mob?42:76)))/2+gs*10+(mob?6:12))+"px";
  var cur=STEPS[step],n=0;G.forEach(function(g){if(cur.indexOf(g.id)>=0)n+=g.p});
  var big=d3.select("#ppBig"),sub=d3.select("#ppSub");
  if(step===0){big.text("100 persones");sub.text("Una per cada 600.000 morts l'any")}
  else if(all){big.text("100 persones");sub.text("Agrupades per causa de mort")}
  else{big.text(n+(n===1?" persona":" persones"));sub.text(cur.map(function(id){return G.filter(function(g){return g.id===id})[0].n}).join(" · "))}
}
function short(n){var M={"Malalties cardiovasculars":"Cardiovasculars","Malalties respiratòries cròniques":"Respirat. cròniques","Infeccions respiratòries":"Infeccions respirat.","Malalties digestives":"Digestives","Trastorns neonatals":"Neonatals","Malalties renals":"Renals","Accidents de trànsit":"Trànsit","Homicidis, guerres i terrorisme":"Violència i guerres","Ofegaments, foc i desastres naturals":"Ofegaments, foc…"};return M[n]||n}


/* ---------- 1b. Les causes més petites, com a l'article original: càpsules amb un punt per mort ---------- */
function capsules(id,items){
  var sv=d3.select("#"+id);if(sv.empty())return;
  function draw(){
    var w=sv.node().parentNode.clientWidth,mobile=w<560,r=mobile?9:11,gap=mobile?4:5,pad=mobile?6:8,plus=mobile?26:44;
    var pills=items.map(function(it){var n=Math.max(1,Math.ceil(it.v));return {it:it,n:n,w:n*2*r+(n-1)*gap+2*pad}});
    var perRow=mobile?2:pills.length,rows=Math.ceil(pills.length/perRow),rowH=2*r+2*pad+58,h=rows*rowH+6;
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);sv.selectAll("*").remove();
    for(var rr=0;rr<rows;rr++){
      var ps=pills.slice(rr*perRow,rr*perRow+perRow),cell=Math.max.apply(null,pills.map(function(p){return p.w}))+30,tot=ps.length*cell+(ps.length-1)*plus,x0=(w-tot)/2,y=rr*rowH+4;
      ps.forEach(function(p,i){var cx=x0+i*(cell+plus)+cell/2,px=cx-p.w/2;
        sv.append("rect").attr("x",px).attr("y",y).attr("width",p.w).attr("height",2*r+2*pad).attr("rx",r+pad).attr("fill","#fff").attr("stroke",K.black).attr("stroke-width",2);
        for(var k=0;k<p.n;k++)dot(sv,px+pad+r+k*(2*r+gap),y+pad+r,r,Math.min(1,p.it.v-k));
        sv.append("text").attr("x",cx).attr("y",y+2*r+2*pad+22).attr("text-anchor","middle").attr("font-family",SANS).attr("font-weight",700).attr("font-size",mobile?12.5:14).attr("fill",K.ink).text(p.it.n);
        if(p.it.sub)sv.append("text").attr("x",cx).attr("y",y+2*r+2*pad+40).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",mobile?11.5:13).attr("fill",K.ink2).text(p.it.sub);
        if(i<ps.length-1)sv.append("text").attr("x",cx+cell/2+plus/2).attr("y",y+pad+r+6).attr("text-anchor","middle").attr("font-family",SANS).attr("font-weight",700).attr("font-size",18).attr("fill",K.ink).text("+");
      });
    }
  }
  draw();addEventListener("resize",draw);
}
/* un punt; si v < 1, només se n'omple la part proporcional (com un rellotge) */
function dot(sv,cx,cy,r,v){
  sv.append("circle").attr("cx",cx).attr("cy",cy).attr("r",r).attr("fill",v>=1?K.red:K.grey);
  if(v>0&&v<1)sv.append("path").attr("d",d3.arc()({innerRadius:0,outerRadius:r,startAngle:0,endAngle:v*2*Math.PI})).attr("transform","translate("+cx+","+cy+")").attr("fill",K.red);
}
/* suma de causes que no arriben a una persona: un sol punt i un claudàtor, com a l'original */
function bracket(id,items,total){
  var sv=d3.select("#"+id);if(sv.empty())return;
  function draw(){
    var w=sv.node().parentNode.clientWidth,mobile=w<560,r=mobile?12:15,hasWrap=mobile&&items.length>=3&&items.some(function(it){return it.n.length>12&&it.n.indexOf(" ")>0}),h=hasWrap?166:150,span=Math.min(w-40,mobile?320:520),x0=(w-span)/2,x1=x0+span,cy=r+10,by=cy+r+22;
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);sv.selectAll("*").remove();
    sv.append("circle").attr("cx",w/2).attr("cy",cy).attr("r",r+5).attr("fill","#fff").attr("stroke",K.black).attr("stroke-width",2);
    dot(sv,w/2,cy,r,total);
    sv.append("text").attr("x",w/2+r+14).attr("y",cy+5).attr("font-family",SANS).attr("font-size",mobile?12:13.5).attr("fill",K.ink2).text(IB.fmt(total,2)+" persones");
    sv.append("path").attr("d","M"+x0+","+(by+8)+"V"+by+"H"+x1+"V"+(by+8)).attr("fill","none").attr("stroke",K.black).attr("stroke-width",2);
    items.forEach(function(it,i){var x=items.length===1?w/2:x0+span*i/(items.length-1),anc=i===0?"start":i===items.length-1?"end":"middle";
      if(items.length>1&&i>0)sv.append("text").attr("x",x0+span*(i-.5)/(items.length-1)).attr("y",by+30).attr("text-anchor","middle").attr("font-family",SANS).attr("font-weight",700).attr("font-size",15).attr("fill",K.ink).text("+");
      var wrap=hasWrap&&it.n.length>12&&it.n.indexOf(" ")>0;
      if(wrap){
        var sp=it.n.indexOf(" "),p1=it.n.slice(0,sp),p2=it.n.slice(sp+1);
        var tx=sv.append("text").attr("x",x).attr("y",by+28).attr("text-anchor",anc).attr("font-family",SANS).attr("font-weight",700).attr("font-size",12.5).attr("fill",K.ink);
        tx.append("tspan").attr("x",x).text(p1);
        tx.append("tspan").attr("x",x).attr("dy",14).text(p2);
        sv.append("text").attr("x",x).attr("y",by+58).attr("text-anchor",anc).attr("font-family",SANS).attr("font-size",11.5).attr("fill",K.ink2).text(IB.fmt(it.v,2));
      } else {
        sv.append("text").attr("x",x).attr("y",by+30).attr("text-anchor",anc).attr("font-family",SANS).attr("font-weight",700).attr("font-size",mobile?12.5:14).attr("fill",K.ink).text(it.n);
        sv.append("text").attr("x",x).attr("y",by+(hasWrap?58:48)).attr("text-anchor",anc).attr("font-family",SANS).attr("font-size",mobile?11.5:13).attr("fill",K.ink2).text(IB.fmt(it.v,2));
      }
    });
  }
  draw();addEventListener("resize",draw);
}
function smallCauses(){
  var p=function(d){return d/TOTAL*100};
  capsules("cap3",[{n:"Diabetis",v:3},{n:"Trastorns neonatals",v:3},{n:"Malalties renals",v:3}]);
  capsules("cap2",[{n:"Accidents de trànsit",v:2},{n:"Diarrea",v:2},{n:"Tuberculosi",v:2}]);
  capsules("cap1",[{n:"COVID-19",v:1},{n:"VIH/sida",v:1},{n:"Suïcidi",v:1},{n:"Malària",v:1}]);
  bracket("capViol",[{n:"Homicidis",v:p(435674)},{n:"Guerres i terrorisme",v:p(159052)}],p(435674+159052));
  bracket("capNat",[{n:"Ofegaments",v:p(291140)},{n:"Foc",v:p(150653)},{n:"Desastres naturals",v:p(88594)}],p(291140+150653+88594));
  capsules("capRest",[{n:"Parkinson",v:p(426724),sub:IB.fmt(p(426724),2)},{n:"Meningitis",v:p(258798),sub:IB.fmt(p(258798),2)},{n:"Drogues",v:p(172508),sub:IB.fmt(p(172508),2)},{n:"Alcohol",v:p(171565),sub:IB.fmt(p(171565),2)},{n:"Enverinaments",v:p(69805),sub:IB.fmt(p(69805),2)}]);
}


/* ---------- 1c. Què ha canviat des del 2023 (fonts específiques, research/dades-2024-2026.csv) ---------- */
function warFig(){
  var sv=d3.select("#war"),bx=document.getElementById("warbox");if(sv.empty())return;
  var Y=[{y:2024,c:[155000,17700,14300]},{y:2025,c:[153600,14500,76500]}],cols=[K.blue,K.grey,K.red],labs=["Conflictes amb algun estat","Entre grups armats","Violència contra civils"];
  function draw(){
    var w=bx.clientWidth,mobile=w<560,lw=mobile?44:56,bh=mobile?34:42,h=2*bh+48+(mobile?54:28);
    var x=d3.scaleLinear().domain([0,260000]).range([0,w-lw-(mobile?70:90)]);
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);sv.selectAll("*").remove();
    Y.forEach(function(d,i){var y=i*(bh+16),acc=0;
      sv.append("text").attr("x",0).attr("y",y+bh/2+5).attr("font-family",SANS).attr("font-weight",700).attr("font-size",mobile?13:15).attr("fill",K.ink).text(d.y);
      d.c.forEach(function(v,j){sv.append("rect").attr("x",lw+x(acc)).attr("y",y).attr("width",Math.max(1,x(v)-1)).attr("height",bh).attr("fill",cols[j]);acc+=v});
      sv.append("text").attr("x",lw+x(acc)+8).attr("y",y+bh/2+5).attr("font-family",SANS).attr("font-weight",700).attr("font-size",mobile?13:15).attr("fill",K.ink).text(IB.fmt(acc));
    });
    var ly=2*(bh+16)+14,lx=lw;
    labs.forEach(function(l,j){
      if(mobile){var yy=ly+j*18;sv.append("rect").attr("x",lw).attr("y",yy).attr("width",11).attr("height",11).attr("fill",cols[j]);sv.append("text").attr("x",lw+17).attr("y",yy+10).attr("font-family",SANS).attr("font-size",12).attr("fill",K.ink2).text(l);return}
      sv.append("rect").attr("x",lx).attr("y",ly).attr("width",11).attr("height",11).attr("fill",cols[j]);
      var t=sv.append("text").attr("x",lx+17).attr("y",ly+10).attr("font-family",SANS).attr("font-size",12.5).attr("fill",K.ink2).text(l);
      lx+=17+t.node().getComputedTextLength()+22;
    });
  }
  draw();addEventListener("resize",draw);
}
function updList(){
  var el=document.getElementById("upd");if(!el)return;
  var R=[
    ["Tuberculosi","1,13 milions","2025",-4,"respecte al 2024","OMS, Global Tuberculosis Report 2026"],
    ["Sida","570.000","2025",-5,"respecte al 2024; la xifra més baixa en més de 30 anys","ONUSIDA, 2026"],
    ["Malària","610.000","2024",2,"respecte al 2023","OMS, World Malaria Report 2025"],
    ["Nadons durant el primer mes de vida","2,3 milions","2024",null,"17 de cada 1.000 nascuts vius","UN IGME, 2026"],
    ["Desastres naturals","16.600","2025",null,"xifra provisional; les morts per onades de calor hi són poc comptades","EM-DAT, 2026"],
    ["Totes les causes","63 milions","2025",null,"projecció de les Nacions Unides","ONU, World Population Prospects 2024"]];
  el.innerHTML=R.map(function(r){
    var ch=r[3]==null?"":'<span class="upd-c" style="color:'+(r[3]>0?K.red:K.blue)+'">'+(r[3]>0?"▲ +":"▼ −")+Math.abs(r[3])+" %</span> ";
    return '<div class="upd-row"><span class="upd-n">'+r[0]+'</span><span class="upd-v">'+r[1]+'</span><div class="upd-d"><span>'+ch+r[4]+'</span><span>'+r[2]+' · '+r[5]+'</span></div></div>';
  }).join("");
}

/* ---------- 2. La població mundial ---------- */
var POP=[[0,232],[100,237],[200,241],[300,228],[400,242],[500,253],[600,272],[700,278],[800,286],[900,311],[1000,323],[1100,398],[1200,445],[1300,456],[1400,442],[1500,503],[1600,516],[1700,595],[1710,618],[1720,648],[1730,671],[1740,702],[1750,753],[1760,788],[1770,828],[1780,901],[1790,942],[1800,983],[1810,1020],[1820,1090],[1830,1162],[1840,1220],[1850,1276],[1860,1298],[1870,1340],[1880,1415],[1890,1521],[1900,1627],[1910,1767],[1920,1895],[1930,2072],[1940,2292],[1950,2493],[1960,3015],[1970,3695],[1980,4448],[1990,5328],[2000,6172],[2010,7022],[2020,7887],[2021,7954],[2022,8021],[2023,8092],[2024,8162],[2025,8232],[2026,8301],[2030,8569],[2040,9177],[2050,9664],[2060,9989],[2070,10189],[2080,10283],[2084,10289],[2090,10272],[2100,10180]];
function popFig(){
  var sv=d3.select("#pop"),bx=document.getElementById("popbox"),tip=document.getElementById("popTip");if(sv.empty())return;
  var curHl=null;
  function hideTip(){if(curHl)curHl.attr("opacity",0);tip.style.opacity=0}
  document.addEventListener("pointerdown",function(ev){if(!bx.contains(ev.target))hideTip()});
  function draw(){
    var w=bx.clientWidth,mobile=w<600,h=mobile?300:420,m={l:mobile?42:52,r:mobile?14:24,t:28,b:30};
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);sv.selectAll("*").remove();
    var x=d3.scaleLinear().domain([0,2100]).range([m.l,w-m.r]),y=d3.scaleLinear().domain([0,11000]).range([h-m.b,m.t]);
    var est=POP.filter(function(d){return d[0]<=2023}),proj=POP.filter(function(d){return d[0]>=2023});
    y.ticks(5).forEach(function(v){sv.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",K.hair).attr("stroke-width",v?.6:1).attr("stroke",v?K.hair:K.ink);
      sv.append("text").attr("x",m.l-6).attr("y",y(v)+4).attr("text-anchor","end").attr("font-family",SANS).attr("font-size",11.5).attr("fill",K.muted).text(IB.fmt(v))});
    [0,500,1000,1500,1800,2000,2100].forEach(function(v){if(mobile&&(v===500||v===1500))return;
      var anc=v===2100?"end":v===0?"start":"middle";
      sv.append("text").attr("x",x(v)).attr("y",h-m.b+18).attr("text-anchor",anc).attr("font-family",SANS).attr("font-size",11.5).attr("fill",K.ink2).text(v)});
    sv.append("rect").attr("x",x(2023)).attr("y",m.t).attr("width",x(2100)-x(2023)).attr("height",h-m.b-m.t).attr("fill","#F6F5F2");
    sv.append("text").attr("x",mobile?w-m.r:x(2061)).attr("y",m.t+14).attr("text-anchor",mobile?"end":"middle").attr("font-family",SANS).attr("font-size",11).attr("fill",K.muted).text("Projecció ONU");
    var area=d3.area().x(function(d){return x(d[0])}).y0(y(0)).y1(function(d){return y(d[1])}).curve(d3.curveMonotoneX);
    var line=d3.line().x(function(d){return x(d[0])}).y(function(d){return y(d[1])}).curve(d3.curveMonotoneX);
    sv.append("path").attr("d",area(est)).attr("fill","#E5E6EA");
    var pe=sv.append("path").attr("d",line(est)).attr("fill","none").attr("stroke",K.black).attr("stroke-width",2.2);
    sv.append("path").attr("d",line(proj)).attr("fill","none").attr("stroke",K.black).attr("stroke-width",2).attr("stroke-dasharray","4 4");
    var ann=[[1804,1000,"1.000 milions","cap al 1804"],[1927,2000,"2.000 milions","1927"],[1974,4000,"4.000 milions","1974"],[2022,8000,"8.000 milions","2022"],[2084,10289,"Màxim previst: 10.300 milions","cap al 2084"]];
    ann.forEach(function(a,i){var ax=x(a[0]),ay=y(a[1]),left=i<4;var tx=left?ax-10:ax-8,anc="end";if(mobile&&(i===1||i===2))return;
      sv.append("circle").attr("cx",ax).attr("cy",ay).attr("r",3.5).attr("fill","#fff").attr("stroke",K.black).attr("stroke-width",1.5);
      sv.append("text").attr("x",tx).attr("y",left?ay+4:ay-22).attr("text-anchor",anc).attr("font-family",SANS).attr("font-weight",600).attr("font-size",mobile?11:12.5).attr("fill",K.ink).text(a[2]);
      sv.append("text").attr("x",tx).attr("y",left?ay+18:ay-8).attr("text-anchor",anc).attr("font-family",SANS).attr("font-size",mobile?11:11.5).attr("fill",K.ink2).text(a[3])});
    sv.append("text").attr("x",x(900)).attr("y",y(232)-14).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",mobile?11:12.5).attr("fill",K.ink2).text("Durant 1.700 anys, la població gairebé no creix");
    if(!IB.reduced&&!popFig.done){var L=pe.node().getTotalLength();pe.attr("stroke-dasharray",L+" "+L).attr("stroke-dashoffset",L).transition().duration(2200).ease(d3.easeCubicInOut).attr("stroke-dashoffset",0);popFig.done=true}
    var hl=sv.append("line").attr("y1",m.t).attr("y2",h-m.b).attr("stroke",K.ink).attr("stroke-width",.6).attr("opacity",0);
    curHl=hl;
    function showTip(ev){
      var px=d3.pointer(ev)[0],yr=x.invert(px),d=POP.reduce(function(a,b){return Math.abs(b[0]-yr)<Math.abs(a[0]-yr)?b:a});
      hl.attr("x1",x(d[0])).attr("x2",x(d[0])).attr("opacity",1);tip.style.opacity=1;
      tip.style.left=Math.min(w-170,Math.max(4,x(d[0])+10))+"px";
      tip.style.top=Math.max(4,y(d[1])-40)+"px";
      tip.innerHTML="<b>"+(d[0]<1?"Any 1":d[0])+"</b><br>"+IB.fmt(d[1])+" milions de persones"+(d[0]>2023?" (projecció)":"");
    }
    sv.append("rect").attr("x",m.l).attr("y",m.t).attr("width",w-m.l-m.r).attr("height",h-m.b-m.t).attr("fill","transparent").style("touch-action","pan-y")
      .on("pointermove pointerdown",showTip)
      .on("pointerleave",hideTip);
  }
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){draw();io.disconnect()}},{threshold:.3});io.observe(bx);
  addEventListener("resize",function(){if(popFig.done)draw()});
}

/* ---------- 3. Natalitat i mortalitat ---------- */
var BD=[[1950,36.8,19.4],[1951,36.5,19.0],[1952,37.7,18.3],[1953,36.9,17.9],[1954,37.3,17.4],[1955,37.1,17.0],[1956,36.4,16.6],[1957,37.2,16.4],[1958,35.9,16.0],[1959,34.4,17.1],[1960,34.0,18.1],[1961,32.9,16.3],[1962,35.9,14.7],[1963,37.5,14.7],[1964,35.9,14.3],[1965,35.3,14.5],[1966,34.4,14.1],[1967,33.7,13.7],[1968,34.4,13.4],[1969,33.8,13.2],[1970,33.6,13.0],[1971,32.8,13.1],[1972,32.1,12.4],[1973,31.5,12.1],[1974,30.7,11.9],[1975,29.7,11.7],[1976,29.3,11.5],[1977,28.6,11.2],[1978,28.5,11.0],[1979,28.6,10.8],[1980,28.7,10.6],[1981,28.6,10.5],[1982,28.9,10.3],[1983,28.1,10.3],[1984,28.1,10.1],[1985,28.0,10.0],[1986,28.1,9.8],[1987,28.0,9.6],[1988,27.4,9.6],[1989,27.2,9.4],[1990,26.9,9.3],[1991,25.5,9.2],[1992,24.8,9.1],[1993,24.3,9.1],[1994,23.8,9.2],[1995,23.4,8.9],[1996,23.0,8.8],[1997,22.6,8.7],[1998,22.3,8.6],[1999,22.0,8.6],[2000,22.0,8.5],[2001,21.6,8.4],[2002,21.4,8.3],[2003,21.1,8.3],[2004,21.0,8.2],[2005,20.8,8.1],[2006,20.8,8.0],[2007,20.7,7.9],[2008,20.7,7.9],[2009,20.6,7.8],[2010,20.4,7.7],[2011,20.2,7.7],[2012,20.3,7.6],[2013,19.9,7.6],[2014,19.7,7.5],[2015,19.3,7.5],[2016,19.2,7.5],[2017,18.8,7.5],[2018,18.2,7.5],[2019,17.7,7.5],[2020,17.1,8.1],[2021,16.8,8.8],[2022,16.5,7.8],[2023,16.3,7.6],[2025,16.1,7.7],[2030,15.6,7.9],[2035,15.2,8.3],[2040,14.8,8.7],[2045,14.3,9.1],[2050,13.7,9.5],[2055,13.2,9.9],[2060,12.8,10.2],[2065,12.5,10.5],[2070,12.3,10.8],[2075,12.0,11.1],[2080,11.7,11.4],[2085,11.4,11.6],[2090,11.2,11.7],[2095,11.0,11.9],[2100,10.8,12.1]];
function bdFig(){
  var sv=d3.select("#bd"),bx=document.getElementById("bdbox"),tip=document.getElementById("bdTip");if(sv.empty())return;
  var curHl=null;
  function hideTip(){if(curHl)curHl.attr("opacity",0);tip.style.opacity=0}
  document.addEventListener("pointerdown",function(ev){if(!bx.contains(ev.target))hideTip()});
  function draw(){
    var w=bx.clientWidth,mobile=w<600,h=mobile?280:360,m={l:mobile?36:40,r:mobile?14:24,t:18,b:30};
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);sv.selectAll("*").remove();
    var x=d3.scaleLinear().domain([1950,2100]).range([m.l,w-m.r]),y=d3.scaleLinear().domain([0,40]).range([h-m.b,m.t]);
    [0,10,20,30,40].forEach(function(v){sv.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",v?K.hair:K.ink).attr("stroke-width",v?.6:1);
      sv.append("text").attr("x",m.l-6).attr("y",y(v)+4).attr("text-anchor","end").attr("font-family",SANS).attr("font-size",11.5).attr("fill",K.muted).text(v+(v===40?" ‰":""))});
    (mobile?[1950,2000,2050,2100]:[1950,1975,2000,2025,2050,2075,2100]).forEach(function(v){
      var anc=v===2100?"end":v===1950?"start":"middle";
      sv.append("text").attr("x",x(v)).attr("y",h-m.b+18).attr("text-anchor",anc).attr("font-family",SANS).attr("font-size",11.5).attr("fill",K.ink2).text(v)});
    sv.append("rect").attr("x",x(2023)).attr("y",m.t).attr("width",x(2100)-x(2023)).attr("height",h-m.b-m.t).attr("fill","#F6F5F2");
    sv.append("text").attr("x",mobile?w-m.r:x(2062)).attr("y",m.t+14).attr("text-anchor",mobile?"end":"middle").attr("font-family",SANS).attr("font-size",11).attr("fill",K.muted).text("Projecció ONU");
    var gap=d3.area().x(function(d){return x(d[0])}).y0(function(d){return y(Math.min(d[1],d[2]))}).y1(function(d){return y(Math.max(d[1],d[2]))}).curve(d3.curveMonotoneX);
    sv.append("path").attr("d",gap(BD.filter(function(d){return d[0]<=2084}))).attr("fill",K.blue).attr("opacity",.14);
    var lb=d3.line().x(function(d){return x(d[0])}).y(function(d){return y(d[1])}).curve(d3.curveMonotoneX),ld=d3.line().x(function(d){return x(d[0])}).y(function(d){return y(d[2])}).curve(d3.curveMonotoneX);
    var e=BD.filter(function(d){return d[0]<=2023}),p=BD.filter(function(d){return d[0]>=2023});
    sv.append("path").attr("d",lb(e)).attr("fill","none").attr("stroke",K.blue).attr("stroke-width",2.2);
    sv.append("path").attr("d",lb(p)).attr("fill","none").attr("stroke",K.blue).attr("stroke-width",2).attr("stroke-dasharray","4 4");
    sv.append("path").attr("d",ld(e)).attr("fill","none").attr("stroke",K.red).attr("stroke-width",2.2);
    sv.append("path").attr("d",ld(p)).attr("fill","none").attr("stroke",K.red).attr("stroke-width",2).attr("stroke-dasharray","4 4");
    sv.append("text").attr("x",x(1958)).attr("y",y(38.6)).attr("font-family",SANS).attr("font-weight",600).attr("font-size",mobile?11.5:12.5).attr("fill",K.blue).text("Naixements per 1.000 habitants");
    sv.append("text").attr("x",x(1958)).attr("y",y(19.5)).attr("font-family",SANS).attr("font-weight",600).attr("font-size",mobile?11.5:12.5).attr("fill",K.red).text("Morts per 1.000 habitants");
    sv.append("text").attr("x",x(1990)).attr("y",y(17.6)).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",mobile?11.5:12).attr("fill",K.ink2).text("Creixement");
    sv.append("text").attr("x",mobile?w-m.r:x(2084)).attr("y",y(11.5)-12).attr("text-anchor",mobile?"end":"middle").attr("font-family",SANS).attr("font-size",11.5).attr("fill",K.ink2).text("Es creuen cap al 2084");
    sv.append("circle").attr("cx",x(2084)).attr("cy",y(11.5)).attr("r",3.5).attr("fill","#fff").attr("stroke",K.ink);
    sv.append("text").attr("x",x(2021)).attr("y",y(8.8)-8).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",11).attr("fill",K.ink2).text("COVID-19");
    var hl=sv.append("line").attr("y1",m.t).attr("y2",h-m.b).attr("stroke",K.ink).attr("stroke-width",.6).attr("opacity",0);
    curHl=hl;
    function showTip(ev){
      var yr=x.invert(d3.pointer(ev)[0]),d=BD.reduce(function(a,b){return Math.abs(b[0]-yr)<Math.abs(a[0]-yr)?b:a});
      hl.attr("x1",x(d[0])).attr("x2",x(d[0])).attr("opacity",1);tip.style.opacity=1;
      tip.style.left=Math.min(w-190,Math.max(4,x(d[0])+10))+"px";
      tip.style.top=Math.max(4,y(d[1])-10)+"px";
      tip.innerHTML="<b>"+d[0]+(d[0]>2023?" (projecció)":"")+"</b><br>Naixements: "+IB.fmt(d[1],1)+" ‰<br>Morts: "+IB.fmt(d[2],1)+" ‰";
    }
    sv.append("rect").attr("x",m.l).attr("y",m.t).attr("width",w-m.l-m.r).attr("height",h-m.b-m.t).attr("fill","transparent").style("touch-action","pan-y")
      .on("pointermove pointerdown",showTip)
      .on("pointerleave",hideTip);
  }
  draw();addEventListener("resize",draw);
}

/* ---------- 4. El que temem i el que ens mata ---------- */
var FEAR={2023:[["Infeccions respiratòries",2501138],["Suïcidi",767616],["Homicidis",435674],["Ofegaments",291140],["Meningitis",258798],["Drogues",172508],["Alcohol",171565],["Guerres i terrorisme",159052],["Desastres naturals",88594]],
  2019:[["Infeccions respiratòries",2549792],["Suïcidi",736949],["Homicidis",427605],["Ofegaments",297131],["Meningitis",280430],["Alcohol",156913],["Drogues",131278],["Guerres i terrorisme",96643],["Desastres naturals",9662]]};
var FEARHL={"Suïcidi":1,"Homicidis":1,"Meningitis":1,"Alcohol":1,"Guerres i terrorisme":1};
var FEARED={"Homicidis":1,"Guerres i terrorisme":1,"Desastres naturals":1};
function fearFig(){
  var sv=d3.select("#fear"),bx=document.getElementById("fearbox");if(sv.empty())return;var yr=2023;
  function draw(anim){
    var w=bx.clientWidth,mobile=w<600,rows=FEAR[yr].slice().sort(function(a,b){return b[1]-a[1]}),rowH=mobile?44:30,h=rows.length*rowH+8,lw=mobile?8:190;
    sv.attr("viewBox","0 0 "+w+" "+h).attr("height",h);
    var x=d3.scaleLinear().domain([0,2600000]).range([0,w-lw-(mobile?62:70)]);
    var r=sv.selectAll("g.r").data(rows,function(d){return d[0]});
    var en=r.enter().append("g").attr("class","r");en.append("text").attr("class","l");en.append("rect");en.append("text").attr("class","v");
    r.exit().remove();
    en.merge(r).transition().duration(anim?600:0).attr("transform",function(d,i){return "translate(0,"+(i*rowH+4)+")"}).each(function(d){
      var g=d3.select(this),hl=FEARHL[d[0]];
      if(mobile){
        g.select(".l").attr("x",lw).attr("y",14).attr("text-anchor","start").attr("font-family",SANS).attr("font-size",12).attr("font-weight",hl?700:600).attr("fill",K.ink).text(d[0]);
        g.select("rect").attr("x",lw).attr("y",21).attr("height",14).attr("fill",FEARED[d[0]]?K.red:K.blue).transition().duration(anim?600:0).attr("width",Math.max(1.5,x(d[1])));
        g.select(".v").attr("y",32).attr("font-family",SANS).attr("font-size",11.5).attr("fill",K.ink2).transition().duration(anim?600:0).attr("x",lw+Math.max(1.5,x(d[1]))+6).text(d[1]>=1e6?IB.fmt(d[1]/1e6,1)+" M":IB.fmt(Math.round(d[1]/1000))+" mil");
      } else {
        g.select(".l").attr("x",lw-10).attr("y",rowH/2+1).attr("text-anchor","end").attr("font-family",SANS).attr("font-size",13.5).attr("font-weight",hl?700:400).attr("fill",K.ink).text(d[0]);
        g.select("rect").attr("x",lw).attr("y",4).attr("height",rowH-10).attr("fill",FEARED[d[0]]?K.red:K.blue).transition().duration(anim?600:0).attr("width",Math.max(1.5,x(d[1])));
        g.select(".v").attr("y",rowH/2+1).attr("font-family",SANS).attr("font-size",12.5).attr("fill",K.ink2).transition().duration(anim?600:0).attr("x",lw+Math.max(1.5,x(d[1]))+6).text(d[1]>=1e6?IB.fmt(d[1]/1e6,1)+" M":IB.fmt(Math.round(d[1]/1000))+" mil");
      }
    });
  }
  d3.selectAll("#fearYr button").on("click",function(){yr=+this.dataset.y;d3.selectAll("#fearYr button").attr("aria-pressed",function(){return String(+this.dataset.y===yr)});draw(true)});
  draw(false);addEventListener("resize",function(){draw(false)});
}

/* ---------- 5. Mentre llegeixes ---------- */
function ticker(){
  var el=document.getElementById("tick");if(!el)return;var t0=performance.now(),PER_S=TOTAL/(365*86400);
  var rows=[["Malalties cardiovasculars",19139018],["Càncers",10558585],["Accidents de trànsit",1343047],["Suïcidi",767616],["Homicidis",435674],["Guerres i terrorisme",159052]];
  el.innerHTML='<p class="tk-big"><span id="tkAll">0</span> persones</p><p class="tk-sub">han mort al món des que has obert aquesta pàgina, fa <span id="tkT">0 s</span>. D\'aquestes, de mitjana:</p><ul class="tk-list">'+rows.map(function(r,i){return '<li><span>'+r[0]+'</span><b id="tk'+i+'">0</b></li>'}).join("")+'</ul>';
  function upd(){var s=(performance.now()-t0)/1000;document.getElementById("tkAll").textContent=IB.fmt(Math.floor(s*PER_S));
    document.getElementById("tkT").textContent=s<60?Math.floor(s)+" s":Math.floor(s/60)+" min "+Math.floor(s%60)+" s";
    rows.forEach(function(r,i){document.getElementById("tk"+i).textContent=IB.fmt(s*r[1]/(365*86400),1)});}
  upd();setInterval(upd,250);
}

function init(){
  layoutPP();
  IB.scrolly(document.getElementById("ppsteps"),document.getElementById("ppgraphic"),function(i){step=i;render(true)});
  smallCauses();warFig();updList();popFig();bdFig();fearFig();ticker();
  var lw=innerWidth,rt;addEventListener("resize",function(){if(innerWidth===lw&&mob)return;lw=innerWidth;clearTimeout(rt);rt=setTimeout(layoutPP,80)});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
