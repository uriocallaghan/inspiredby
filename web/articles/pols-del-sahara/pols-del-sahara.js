/* La pols que adoba l'Amazònia — gràfics fets amb codi (d3 + canvas).
   Dades i fonts: research/pols-del-sahara/ (fonts.md i CSV).
   Els mapes de partícules són esquemes: el recorregut segueix les latituds i altures mesurades
   (Tsamalis et al. 2013; Yu et al. 2015), i la quantitat de pols segueix els percentatges per estació de CALIPSO,
   repartits entre els mesos.
   Rendiment: les capes estàtiques (terra, llacs, diatomita, muntanyes, diatomea) es dibuixen en canvas fora de pantalla
   i només es tornen a dibuixar quan canvia la vista; a cada fotograma només es dibuixen les partícules. */
(function(){
"use strict";
var RM=!!(window.IB&&IB.reduced);
var C={ink:"#121212",ink2:"#4A4A4A",muted:"#7A7A7A",hair:"#DADADA",land:"#ECEBE8",landG:"#DCE5CF",sea:"#D9E4F0",border:"#FFFFFF",
  dust:"#B07434",dustRGB:"176,116,52",dry:"#9A6326",warm:"#C8442A",cold:"#2C5DA8",bio:"#4C8A2E",lake:"#9DBBDD",water:"#7C8C9C",diat:"#F6F3EA"};
var SANS='"Source Sans 3", "Helvetica Neue", Arial, sans-serif',SERIF='"Source Serif 4", Georgia, serif';
var DEG=Math.PI/180;
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,t){return a+(b-a)*t}
function sm(x){x=clamp(x,0,1);return x*x*(3-2*x)}
function mob(){return innerWidth<900}
function fmt(n,d){d=d||0;var s=Math.abs(n).toFixed(d).split(".");s[0]=s[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");return (n<0?"−":"")+s[0]+(s[1]?","+s[1]:"")}
function safe(f){try{return f()}catch(e){console.error(e)}}
function rnd(a,b){return a+Math.random()*(b-a)}
function tri(){return Math.random()+Math.random()-1}
/* interpolació lineal per nodes [[x,y],...] amb x creixent */
function pw(nodes,x){if(x<=nodes[0][0])return nodes[0][1];for(var i=1;i<nodes.length;i++){if(x<=nodes[i][0]){var a=nodes[i-1],b=nodes[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])}}return nodes[nodes.length-1][1]}
var vis={};
function watch(el,key,margin){if(!el)return;vis[key]=false;if(!("IntersectionObserver" in window)){vis[key]=true;return}
  new IntersectionObserver(function(es){es.forEach(function(e){vis[key]=e.isIntersecting})},{rootMargin:margin||"200px 0px"}).observe(el)}
var MES=["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"];
/* Yu et al. 2015 RSE, taula 1 (15°W i 75°W, % del flux anual) i Yu et al. 2015 GRL (deposició a l'Amazònia, Tg) */
var SEAS=[
 {n:"Hivern",m:"desembre–febrer",out:23,car:11,amz:"11,9 milions de tones"},
 {n:"Primavera",m:"març–maig",out:21,car:16,amz:"15,8 milions de tones"},
 {n:"Estiu",m:"juny–agost",out:46,car:61,amz:"gairebé gens"},
 {n:"Tardor",m:"setembre–novembre",out:10,car:12,amz:"gairebé gens"}];
function seasonOf(m){var k=Math.floor(m)%12;return k===11||k<2?0:k<5?1:k<8?2:3}
/* flux mensual relatiu: centres d'estació (gen, abr, jul, oct) amb el % de cada estació / 3 */
function fluxM(m){var c=[[-2.5,10/3],[0.5,23/3],[3.5,21/3],[6.5,46/3],[9.5,10/3],[12.5,23/3]];m=((m%12)+12)%12;return pw(c,m)}
/* grau d'estiu: 0 a mitjan gener, 1 a mitjan juliol */
function summer(m){var n=[[-.5,.08],[.5,0],[1.5,0],[2.5,.08],[3.5,.2],[4.5,.45],[5.5,.85],[6.5,1],[7.5,1],[8.5,.85],[9.5,.6],[10.5,.3],[11.5,.08],[12.5,0]];m=((m%12)+12)%12;return pw(n,m)}

/* ---------------- mapa base (equirectangular amb càmera) ---------------- */
var LAND=null,BORD=null;
function GeoMap(o){
  var m=this;m.wrap=o.wrap;m.cv=o.cv;m.ov=o.ov;m.ctx=m.cv.getContext("2d");
  m.base=document.createElement("canvas");m.baseG=o.green?document.createElement("canvas"):null;
  m.hz=document.createElement("canvas");m.dep=document.createElement("canvas");
  m.view=o.view.slice();m.tgt=o.view.slice();m.W=0;m.H=0;m.dpr=1;m.k=1;m.tx=0;m.ty=0;m.dirty=true;m.moving=false;m.ratio=o.ratio;
  m.labels=[];m.useDep=o.useDep!==false;
}
GeoMap.prototype.P=function(lon,lat){return [this.tx+this.k*lon*DEG,this.ty-this.k*lat*DEG]};
GeoMap.prototype.fit=function(){var v=this.view,k=Math.min(this.W/((v[1]-v[0])*DEG),this.H/((v[3]-v[2])*DEG));this.k=k;
  this.tx=this.W/2-k*(v[0]+v[1])/2*DEG;this.ty=this.H/2+k*(v[2]+v[3])/2*DEG;this.proj=d3.geoEquirectangular().scale(k).translate([this.tx,this.ty]);this.dirty=true};
GeoMap.prototype.layout=function(maxH){
  var W=this.wrap.clientWidth;if(W<10){this.W=0;return}
  var H=Math.round(Math.min(W*this.ratio(),maxH));this.W=W;this.H=H;this.dpr=Math.min(2,devicePixelRatio||1);
  [this.cv,this.base,this.baseG,this.hz,this.dep].forEach(function(c){if(!c)return;c.width=Math.round(W*this.dpr);c.height=Math.round(H*this.dpr)},this);
  this.cv.style.height=H+"px";this.fit();this.clearFx();this.placeLabels(true);
};
GeoMap.prototype.clearFx=function(){[this.hz,this.dep].forEach(function(c){c.getContext("2d").clearRect(0,0,c.width,c.height)})};
GeoMap.prototype.setView=function(v,now){this.tgt=v.slice();if(now||RM){this.view=v.slice();this.fit();this.clearFx();this.placeLabels()}};
GeoMap.prototype.viewKey=function(){return this.W+"x"+this.H+":"+this.view.map(function(v){return v.toFixed(3)}).join(",")};
GeoMap.prototype.ease=function(dt){var mv=false,k=Math.min(1,dt*2.4);for(var i=0;i<4;i++){var d=this.tgt[i]-this.view[i];if(Math.abs(d)>0.02){this.view[i]+=d*k;mv=true}else this.view[i]=this.tgt[i]}
  if(mv||this.moving){this.fit();this.placeLabels()}
  if(mv&&!this.moving)this.clearFx();this.moving=mv;return mv};
GeoMap.prototype.drawBase=function(){
  if(!this.W)return;var self=this;
  function paint(cv,green){var c=cv.getContext("2d");c.setTransform(self.dpr,0,0,self.dpr,0,0);c.clearRect(0,0,self.W,self.H);
    c.fillStyle=C.sea;c.fillRect(0,0,self.W,self.H);
    if(!LAND)return;var p=d3.geoPath(self.proj,c);
    if(green){var y0=self.P(0,30)[1],y1=self.P(0,10)[1],gr=c.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,C.land);gr.addColorStop(.35,C.landG);gr.addColorStop(1,C.landG);c.fillStyle=gr}else c.fillStyle=C.land;
    c.beginPath();p(LAND);c.fill();
    c.strokeStyle=C.border;c.lineWidth=.7;c.beginPath();p(BORD);c.stroke();
    /* equador */
    var a=self.P(-180,0),b=self.P(180,0);c.save();c.setLineDash([1,3]);c.strokeStyle=C.muted;c.globalAlpha=.6;c.lineWidth=.7;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.restore()}
  paint(this.base,false);if(this.baseG)paint(this.baseG,true);this.dirty=false;
};
GeoMap.prototype.fadeFx=function(dt,fade){
  var c=this.hz.getContext("2d");c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation="destination-out";
  c.fillStyle="rgba(0,0,0,"+(this.moving?1:clamp(fade*dt*60,0,1))+")";c.fillRect(0,0,this.hz.width,this.hz.height);c.globalCompositeOperation="source-over";
  if(!this.useDep)return;var d=this.dep.getContext("2d");d.setTransform(1,0,0,1,0,0);d.globalCompositeOperation="destination-out";d.fillStyle="rgba(0,0,0,"+(this.moving?1:clamp(.0035*dt*60,0,1))+")";d.fillRect(0,0,this.dep.width,this.dep.height);d.globalCompositeOperation="source-over";
};
GeoMap.prototype.compose=function(green){
  var c=this.ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.cv.width,this.cv.height);c.drawImage(this.base,0,0);
  if(this.baseG&&green>0.01){c.globalAlpha=green;c.drawImage(this.baseG,0,0);c.globalAlpha=1}
  if(this.useDep)c.drawImage(this.dep,0,0);c.drawImage(this.hz,0,0);c.setTransform(this.dpr,0,0,this.dpr,0,0);
};
/* etiquetes HTML: {lon,lat,html,cls,dx,dy,al,steps:[...] o fn} */
GeoMap.prototype.addLabel=function(L){var el=document.createElement("div");el.className="ann "+(L.cls||"")+(L.al==="r"?" r":L.al==="c"?" c":"");el.innerHTML=L.html;el.style.opacity=0;this.ov.appendChild(el);L.el=el;L.on=false;this.labels.push(L);return L};
/* la mida de les etiquetes es mesura només quan cal (canvi de mida, fonts carregades): llegir offsetWidth a cada fotograma força un recàlcul de l'estil */
GeoMap.prototype.placeLabels=function(force){if(!this.W)return;var W=this.W,H=this.H,K=clamp(W/900,.6,1.2);
  if(force||!this.measured){this.labels.forEach(function(L){L.w=L.el.offsetWidth;L.h=L.el.offsetHeight});this.measured=true}
  this.labels.forEach(function(L){var p=this.P(L.lon,L.lat),w=L.w,h=L.h,x=p[0]+(L.dx||0)*K,y=p[1]+(L.dy||0)*K;
    var X=L.al==="r"?x-w:L.al==="c"?x-w/2:x;X=clamp(X,2,Math.max(2,W-w-2));var Y=clamp(y-h/2,2,Math.max(2,H-h-2));L.el.style.transform="translate("+X.toFixed(1)+"px,"+Y.toFixed(1)+"px)";L.px=p;L.ax=x;L.ay=y},this)};
GeoMap.prototype.showLabels=function(step){this.labels.forEach(function(L){var on=L.steps.indexOf(step)>=0;if(on!==L.on){L.on=on;L.el.style.opacity=on?1:0}})};
GeoMap.prototype.leaders=function(c){c.strokeStyle=C.ink;c.lineWidth=.6;this.labels.forEach(function(L){if(!L.on||!L.lead||mob()&&L.cls&&L.cls.indexOf("hm")>=0)return;var h=(L.h||0)/2;c.globalAlpha=.7;c.beginPath();c.moveTo(L.px[0],L.px[1]);c.lineTo(L.ax,L.ay+(L.ay>L.px[1]?-h-2:h+2));c.stroke();c.globalAlpha=1})};
function polyPath(c,map,pts){c.beginPath();pts.forEach(function(q,i){var p=map.P(q[0],q[1]);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath()}
function scalePoly(pts,cx,cy,f){return pts.map(function(p){return [cx+(p[0]-cx)*f,cy+(p[1]-cy)*f]})}

/* camí suau (Catmull-Rom) amb amplada i velocitat */
function makePath(nodes){
  var out=[];for(var i=0;i<nodes.length-1;i++){var p0=nodes[Math.max(0,i-1)],p1=nodes[i],p2=nodes[i+1],p3=nodes[Math.min(nodes.length-1,i+2)];
    for(var j=0;j<12;j++){var t=j/12,t2=t*t,t3=t2*t;function cr(k){return .5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3)}
      out.push([cr(0),cr(1),lerp(p1[2],p2[2],t),lerp(p1[3],p2[3],t)])}}
  var l=nodes[nodes.length-1];out.push([l[0],l[1],l[2],l[3]]);
  var L=[0];for(i=1;i<out.length;i++)L.push(L[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
  function idx(s){var lo=0,hi=L.length-1;while(hi-lo>1){var md=(lo+hi)>>1;if(L[md]<=s)lo=md;else hi=md}return lo}
  return {total:L[L.length-1],sAt:function(n){var i=Math.min(out.length-1,n*12);return L[i]},
    at:function(s,q){s=clamp(s,0,L[L.length-1]-1e-6);var i=idx(s),a=out[i],b=out[i+1],t=(s-L[i])/Math.max(1e-9,L[i+1]-L[i]);
      var dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,w=lerp(a[2],b[2],t);
      return {lon:lerp(a[0],b[0],t)+(-dy/d)*q*w,lat:lerp(a[1],b[1],t)+(dx/d)*q*w,sp:lerp(a[3],b[3],t)}}};
}

/* ======================= 1. EL BODÉLÉ ======================= */
var B=null;
function initBodele(){
  var cv=document.getElementById("bcv");if(!cv)return;
  var map=new GeoMap({wrap:document.getElementById("bmap"),cv:cv,ov:document.getElementById("bov"),view:[-20,42,2,36],green:true,useDep:false,ratio:function(){return mob()?.72:.66}});
  /* Megatxad: contorn aproximat, escalat perquè faci ~361.000 km² (Armitage et al. 2015) */
  var MEGA=[[12.3,13.0],[12.6,14.4],[13.4,15.5],[14.5,16.4],[15.4,17.5],[16.3,18.5],[17.4,19.0],[18.6,18.9],[19.4,18.2],[19.7,17.1],[19.1,16.0],[18.3,15.1],[17.7,14.1],[17.1,12.9],[16.1,11.7],[15.0,11.0],[13.8,11.1],[12.9,11.8]];
  var CHAD=[[13.55,13.05],[13.7,13.55],[14.1,13.8],[14.45,13.6],[14.5,13.15],[14.2,12.9],[13.8,12.85]];
  var DIAT=[[16.5,17.5],[17.3,18.2],[18.3,18.05],[18.85,17.3],[18.4,16.45],[17.4,16.25],[16.7,16.7]];
  function area(pts){var ring=pts.concat([pts[0]]).map(function(p){return p.slice()});var f={type:"Polygon",coordinates:[ring]},a=d3.geoArea(f);if(a>2*Math.PI){ring.reverse();a=d3.geoArea({type:"Polygon",coordinates:[ring]})}return a*6371*6371}
  var cen=d3.polygonCentroid(MEGA),f=Math.sqrt(361000/area(MEGA));MEGA=scalePoly(MEGA,cen[0],cen[1],f);
  var chadC=[14.0,13.3];
  /* camí del vent: de l'harmattan al golf de Guinea i l'Atlàntic [lon,lat,amplada,velocitat] */
  var PATH=makePath([[29,24.5,4.2,.8],[24.5,21.6,2.6,1.1],[20.9,18.9,.75,2.3],[18.2,17.4,1.3,1.7],[14.5,14.6,2.0,1.15],[9.5,10.5,2.6,1],[4.5,6.6,3.0,1],[-1,4.6,3.2,1],[-10,4.4,3.4,1],[-19,5.0,3.8,1],[-36,4.5,5,1]]);
  var sGap=PATH.sAt(2),sBod=PATH.sAt(3),sD=PATH.sAt(4),sEnd=PATH.total;
  var STEPS=[
    {v:[-20,42,2,36],name:"Avui",val:"El Bodélé, al nord del Txad",green:0,lake:0,shrink:0,diat:.35,wind:0,dust:.25,reach:.05,ring:1},
    {v:[4,30,6,25],name:"Fa entre 11.500 i 5.000 anys",val:"El llac Megatxad: uns 361.000 km²",green:1,lake:1,shrink:0,diat:0,wind:0,dust:0,reach:0,ring:0},
    {v:[4,30,6,25],name:"Fa uns 1.000 anys",val:"El llac es retira; el Bodélé queda sec",green:.15,lake:1,shrink:1,diat:.6,wind:0,dust:0,reach:0,ring:0},
    {v:[11,25,12,22.5],name:"Avui",val:"Un fons de diatomita",green:0,lake:0,shrink:1,diat:1,wind:0,dust:0,reach:0,ring:0,inset:1},
    {v:[8,31,9,26.5],name:"Avui, de desembre a març",val:"L'harmattan s'accelera entre el Tibesti i l'Ennedi",green:0,lake:0,shrink:1,diat:1,wind:1,dust:1,reach:.08,ring:0},
    {v:[-38,32,-8,30],name:"Avui, de desembre a març",val:"La pols surt cap al golf de Guinea i l'Atlàntic",green:0,lake:0,shrink:1,diat:1,wind:.55,dust:1,reach:1,ring:0}];
  var st={green:0,lake:0,shrink:0,diat:.35,wind:0,dust:.25,reach:.05,ring:1,inset:0},tg=Object.assign({},st),step=-1;
  [{lon:17.6,lat:17.3,html:"<b>Bodélé</b>",dx:18,dy:20,lead:1,steps:[0,3,4,5]},
   {lon:18.6,lat:21.0,html:"<b>Tibesti</b>",dx:-46,dy:-14,al:"r",lead:1,steps:[3,4]},
   {lon:22.4,lat:17.0,html:"<b>Ennedi</b>",dx:30,dy:16,lead:1,steps:[3,4]},
   {lon:16.2,lat:15.2,html:"<b>Llac Megatxad</b>361.000 km², fins a 160 m de fondària",dx:-120,dy:28,al:"r",lead:1,steps:[1]},
   {lon:14.1,lat:13.3,html:"<b>Llac Txad</b>el que en queda avui",dx:-60,dy:30,al:"r",lead:1,steps:[2,3]},
   {lon:17.6,lat:17.2,html:"<b>Bodélé</b>sec fa uns mil anys",dx:46,dy:-34,lead:1,steps:[2]},
   {lon:18.0,lat:16.6,html:"<b>Diatomita</b>restes d'algues del llac",dx:40,dy:34,lead:1,steps:[3]},
   {lon:25.5,lat:23.0,html:"<b>Harmattan</b>vent del nord-est",dx:20,dy:-24,lead:1,steps:[4]},
   {lon:20.9,lat:18.9,html:"El vent s'accelera",dx:40,dy:-6,cls:"hm",steps:[4]},
   {lon:3,lat:3,html:"Golf de Guinea",al:"c",cls:"hm",steps:[5]},
   {lon:5,lat:25,html:"<b>Sàhara</b>",al:"c",steps:[0]},
   {lon:-9,lat:4.8,html:"La pols cap a Amèrica",dx:-10,dy:-26,al:"r",steps:[5]}].forEach(function(L){map.addLabel(L)});
  var wind=[],dust=[];
  function spW(p,init){p.s=init?Math.random()*sD:Math.random()*sGap*.6;p.q=tri();p.tr=[]}
  function spD(p){p.s=sBod+rnd(-.35,.45);p.q=rnd(-.75,.75);p.u=Math.pow(Math.random(),.55);p.a=0}
  function init(){wind=[];dust=[];var nw=mob()?70:120,nd=mob()?420:800;for(var i=0;i<nw;i++){var p={};spW(p,true);wind.push(p)}for(i=0;i<nd;i++){var d={};spD(d);d.s=lerp(d.s,sBod+1.2,Math.random());dust.push(d)}}
  function setStep(i){if(i===step)return;step=i;var S=STEPS[i];Object.keys(tg).forEach(function(k){tg[k]=S[k]||0});if(i!==3)st.inset=0;map.setView(S.v);map.showLabels(i);
    document.getElementById("bName").textContent=S.name;document.getElementById("bVal").textContent=S.val}
  function layout(){var gh=document.getElementById("bgraphic");map.layout(mob()?innerHeight*.36:Math.max(260,innerHeight-190));map.drawBase()}
  /* capes estàtiques en canvas fora de pantalla */
  var ovl=document.createElement("canvas"),ovlKey="",dCv=null,dKey="",pat=null,patKey="";
  /* diatomea ampliada: es dibuixa un sol cop per mida */
  function diatomCanvas(r){var key=r+"|"+map.dpr;if(dCv&&dKey===key)return dCv;dKey=key;
    var dpr=map.dpr,w=Math.max(2*r+20,136),h=2*r+20+22;dCv=document.createElement("canvas");dCv.width=Math.ceil(w*dpr);dCv.height=Math.ceil(h*dpr);dCv.cssW=w;dCv.cssH=h;
    var c=dCv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);var x=w/2,y=r+10;
    c.fillStyle="#fff";c.strokeStyle=C.ink;c.lineWidth=1;c.beginPath();c.arc(x,y,r+8,0,6.283);c.fill();c.stroke();
    c.strokeStyle=C.ink2;c.lineWidth=.8;c.beginPath();c.arc(x,y,r,0,6.283);c.stroke();c.beginPath();c.arc(x,y,r*.32,0,6.283);c.stroke();
    c.beginPath();for(var i=0;i<36;i++){var t=i/36*6.283;c.moveTo(x+Math.cos(t)*r*.36,y+Math.sin(t)*r*.36);c.lineTo(x+Math.cos(t)*r*.94,y+Math.sin(t)*r*.94)}c.stroke();
    c.fillStyle=C.ink2;c.beginPath();for(i=0;i<36;i++){var t2=(i+.5)/36*6.283,px=x+Math.cos(t2)*r*.7,py=y+Math.sin(t2)*r*.7;c.moveTo(px+.9,py);c.arc(px,py,.9,0,6.283)}c.fill();
    c.font="12px "+SANS;c.fillStyle=C.ink;c.textAlign="center";c.fillText("Una diatomea (esquema)",x,y+r+24);return dCv}
  /* trama de punts de la diatomita: un patró petit en lloc de milers de rectangles */
  function diatPattern(c,sp,ax,ay){var dpr=map.dpr,q=Math.max(1,Math.round(sp*dpr))/dpr,key=q+"|"+dpr;
    if(!pat||patKey!==key){patKey=key;var t=document.createElement("canvas");t.width=Math.round(q*dpr);t.height=Math.round(2*q*dpr);var tc=t.getContext("2d");tc.fillStyle="#D9D1BE";
      var d=Math.max(1,Math.round(.9*dpr));tc.fillRect(0,0,d,d);tc.fillRect(Math.round(q*dpr/2),Math.round(q*dpr),d,d);pat=c.createPattern(t,"repeat")}
    if(pat.setTransform&&window.DOMMatrix)pat.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,ax,ay]));return pat}
  function mountains(c,lon0,lon1,lat0,lat1){
    var n=0,s=clamp(map.k*DEG*.18,2.2,5.5);for(var la=lat1;la>=lat0;la-=.55){for(var lo=lon0+(n%2)*.3;lo<=lon1;lo+=.6){var dx=(lo-(lon0+lon1)/2)/((lon1-lon0)/2),dy=(la-(lat0+lat1)/2)/((lat1-lat0)/2);if(dx*dx+dy*dy>1)continue;
      var p=map.P(lo,la);c.moveTo(p[0]-s,p[1]+s*.55);c.lineTo(p[0],p[1]-s*.55);c.lineTo(p[0]+s,p[1]+s*.55)}n++}}
  /* llacs, diatomita, noms de països i muntanyes: només es redibuixen quan canvia la vista o l'estat */
  function drawOverlay(){
    var key=map.viewKey()+"|"+[st.lake,st.shrink,st.diat,st.reach].map(function(v){return v.toFixed(3)}).join(",");
    if(key===ovlKey)return;ovlKey=key;
    if(ovl.width!==map.cv.width||ovl.height!==map.cv.height){ovl.width=map.cv.width;ovl.height=map.cv.height}
    var c=ovl.getContext("2d");c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,ovl.width,ovl.height);c.setTransform(map.dpr,0,0,map.dpr,0,0);
    if(st.lake>.01){var ff=lerp(1,.16,sm(st.shrink));c.globalAlpha=st.lake*(1-.85*sm(st.shrink));polyPath(c,map,scalePoly(MEGA,chadC[0],chadC[1],ff));c.fillStyle=C.lake;c.fill();c.globalAlpha=1}
    var chadA=Math.max(sm(st.shrink),1-st.lake)*clamp(1-st.reach*.2,0,1);
    if(chadA>.01&&(st.shrink>.05||st.lake<.99)){c.globalAlpha=chadA;polyPath(c,map,CHAD);c.fillStyle=C.lake;c.fill();c.globalAlpha=1}
    if(st.diat>.01){c.globalAlpha=st.diat;polyPath(c,map,DIAT);c.fillStyle=C.diat;c.fill();
      var a0=map.P(16.4,18.3);c.fillStyle=diatPattern(c,clamp(map.k*DEG*.12,2.2,5),a0[0],a0[1]);c.fill();
      c.strokeStyle="#CFC7B4";c.lineWidth=.8;c.stroke();c.globalAlpha=1}
    c.font=Math.round(clamp(map.W/80,10,12.5))+"px "+SANS;c.fillStyle=C.muted;c.textAlign="center";c.globalAlpha=.85;
    [["Txad",20.8,13.4],["Níger",9.5,17.5],["Líbia",18,26.5],["Sudan",29,14],["Nigèria",8,9.6],["Algèria",3,28],["Mali",-2,18]].forEach(function(a){var q=map.P(a[1],a[2]);if(q[0]>24&&q[0]<map.W-24&&q[1]>14&&q[1]<map.H-10&&!(st.lake>.5&&a[0]==="Txad"))c.fillText(a[0],q[0],q[1])});c.globalAlpha=1;
    var mA=clamp(st.diat*1.2,0,1)*(1-st.lake*.6);
    if(mA>.02){c.globalAlpha=mA*.55;c.strokeStyle=C.ink2;c.lineWidth=.8;c.lineJoin="round";c.beginPath();mountains(c,16.4,20.6,19.4,22.6);mountains(c,21.2,23.8,15.9,18.4);c.stroke();c.globalAlpha=1}
  }
  function frame(dt,t){
    if(!map.W)return;for(var k in tg){st[k]+=(tg[k]-st[k])*Math.min(1,dt*(RM?20:2.2));if(Math.abs(tg[k]-st[k])<.002)st[k]=tg[k]}
    map.ease(dt);if(map.dirty){map.drawBase();ovlKey=""}
    map.fadeFx(dt,.085);
    /* partícules */
    var hz=map.hz.getContext("2d");hz.setTransform(map.dpr,0,0,map.dpr,0,0);
    var spd=(RM?.25:1)*3.2*clamp((map.view[1]-map.view[0])/24,.8,3.2),reachS=lerp(sD+1,sEnd,st.reach),ds=mob()?2:1.7;
    if(st.dust>.02){hz.fillStyle="rgba("+C.dustRGB+","+(.75*st.dust).toFixed(3)+")";
      for(var i=0;i<dust.length;i++){var d=dust[i],q=PATH.at(d.s,d.q);d.s+=q.sp*spd*dt*.55;if(d.s>lerp(sBod+1.2,reachS,d.u)||d.s>=sEnd-.01){spD(d);continue}var p=map.P(q.lon,q.lat);hz.fillRect(p[0]-ds/2,p[1]-ds/2,ds,ds)}}
    map.compose(st.green);var c=map.ctx;
    drawOverlay();c.setTransform(1,0,0,1,0,0);c.drawImage(ovl,0,0);c.setTransform(map.dpr,0,0,map.dpr,0,0);
    /* vent */
    if(st.wind>.02){c.strokeStyle=C.ink;c.lineCap="round";c.lineWidth=.8;c.globalAlpha=.42*st.wind;c.beginPath();
      for(i=0;i<wind.length;i++){var w=wind[i],q2=PATH.at(w.s,w.q);w.s+=q2.sp*spd*dt*.6;if(w.s>sD+(st.reach>.5?3:0)){spW(w);continue}var pp=map.P(q2.lon,q2.lat);w.tr.push(pp);if(w.tr.length>7)w.tr.shift();
        if(w.tr.length>2){c.moveTo(w.tr[0][0],w.tr[0][1]);for(var j=1;j<w.tr.length;j++)c.lineTo(w.tr[j][0],w.tr[j][1])}}c.stroke();c.globalAlpha=1}
    /* anell al Bodélé */
    if(st.ring>.02){var b=map.P(17.7,17.2),ph=RM?0:(t*.5)%1;c.strokeStyle=C.warm;c.lineWidth=1.3;c.globalAlpha=st.ring;c.beginPath();c.arc(b[0],b[1],7,0,6.283);c.stroke();
      c.globalAlpha=st.ring*(1-ph);c.beginPath();c.arc(b[0],b[1],7+16*ph,0,6.283);c.stroke();c.globalAlpha=1}
    /* diatomea ampliada (només al pas 4) */
    if(st.inset>.02&&map.W>300){var r=Math.round(Math.min(46,map.W*.07)),dc=diatomCanvas(r);c.globalAlpha=st.inset;c.drawImage(dc,map.W<600?4:map.W-dc.cssW-8,map.W<600?4:12,dc.cssW,dc.cssH);c.globalAlpha=1}
    map.leaders(c);
  }
  B={map:map,init:init,setStep:setStep,layout:layout,frame:frame};
  init();setStep(0);
  IB.scrolly(document.getElementById("bsteps"),document.getElementById("bgraphic"),function(i){setStep(i)});
}

/* ======================= 2. L'ATLÀNTIC ======================= */
var M=null;
function initAtlantic(){
  var cv=document.getElementById("mcv");if(!cv)return;
  var map=new GeoMap({wrap:document.getElementById("mmap"),cv:cv,ov:document.getElementById("mov"),view:[-60,35,-5,35],ratio:function(){return mob()?.7:.62}});
  var LON=[-17,-35,-50,-60,-70,-80,-90,-100];
  var WC=[6,3,1.5,-1,-3.5,-5,-6,-6],WH=[8,6.5,5.5,5,5,5,5,5],SC=[16.5,16,17,18,19.5,22,25,27.5],SH=[10.5,8.5,7,6.5,6,5.5,5.5,5];
  /* nodes precalculats (abans es creaven a cada partícula i a cada fotograma) */
  function nodes(arr){return LON.map(function(x,i){return [-x,arr[i]]})}
  var nWC=nodes(WC),nWH=nodes(WH),nSC=nodes(SC),nSH=nodes(SH);
  function latAt(lon,w,q){var x=-lon;return lerp(pw(nWC,x),pw(nSC,x),w)+q*lerp(pw(nWH,x),pw(nSH,x),w)}
  /* fonts de pols [lon,lat,pes a l'hivern,pes a l'estiu, punt de pas] */
  var SRC=[[17.8,17.0,.45,.12,[5,8.5]],[-10,20,.14,.3],[-3,22,.15,.25],[3,19,.15,.18],[8,24,.11,.15]];
  /* supervivència (Yu et al. 2015 RSE): 182 → 132 (35°W) → 43 (75°W) */
  function deathLon(){var u=Math.random();if(u>.725)return -17-(1-u)/(1-.725)*18;if(u>.237)return -35-(.725-u)/(.725-.237)*40;if(u>.05)return -75-(.237-u)/(.187)*25;return -130}
  var EU=makePath([[-1.5,27,2.6,1],[-1,33,3,1],[0.5,37.5,3.4,1],[1.8,41.5,3.6,1],[4,46,3.8,1]]);
  var AMZ=[[-75,-12],[-40,-12],[-40,-2],[-50,-2],[-50,8],[-75,8]];
  var STEPS=[
    {v:[-48,36,-6,34],m:5.5,lines:[1,0,0],amz:0,eu:0},
    {v:[-92,32,-16,36],m:6.5,lines:[1,1,1],amz:0,eu:0},
    {v:[-82,22,-20,24],m:1.5,lines:[0,0,0],amz:.5,eu:0},
    {v:[-82,-12,-18,16],m:2.5,lines:[0,0,0],amz:1,eu:0},
    {v:[-100,8,-2,38],m:6.5,lines:[0,0,1],amz:0,eu:0},
    {v:[-32,32,8,50],m:5.8,lines:[0,0,0],amz:0,eu:1},
    {v:[-100,42,-22,48],m:null,lines:[0,0,0],amz:.6,eu:.35}];
  var st={m:5.5,l0:1,l1:0,l2:0,amz:0,eu:0},tg={m:5.5,l0:1,l1:0,l2:0,amz:0,eu:0},step=-1,user=false,playing=false;
  [{lon:5,lat:23,html:"<b>Sàhara</b>",al:"c",steps:[0,1,6]},
   {lon:17.8,lat:17,html:"Bodélé",dx:10,dy:16,cls:"hm",lead:1,steps:[0]},
   {lon:-15,lat:31,html:"<b class='n'>182</b>milions de tones l'any",dx:8,dy:0,cls:"big",steps:[0,1]},
   {lon:-35,lat:31,html:"<b class='n'>132</b>a mig oceà",dx:8,dy:0,cls:"big",steps:[1]},
   {lon:-75,lat:31,html:"<b class='n'>43</b>al Carib",dx:8,dy:0,cls:"big",steps:[1,4]},
   {lon:-23.6,lat:15.6,html:"Cap Verd",dx:-8,dy:-14,al:"r",cls:"hm",steps:[0,1]},
   {lon:-59.5,lat:13.1,html:"Barbados",dx:8,dy:-12,cls:"hm",lead:1,steps:[1,4]},
   {lon:-52.3,lat:4.9,html:"<b>Caiena</b>més pols de gener a maig",dx:24,dy:-30,lead:1,steps:[2]},
   {lon:-62,lat:-4,html:"<b>Amazònia</b>",al:"c",steps:[2,6]},
   {lon:-60,lat:-3,html:"<b class='n'>≈28</b>milions de tones l'any (entre 8 i 48), de desembre a maig",cls:"big",al:"c",dy:18,steps:[3]},
   {lon:-81.5,lat:27.8,html:"Florida",dx:10,dy:-10,cls:"hm",steps:[4]},
   {lon:-91,lat:24.5,html:"Golf de Mèxic",al:"c",cls:"hm",steps:[4]},
   {lon:-72,lat:15,html:"Mar Carib",al:"c",cls:"hm",steps:[4,6]},
   {lon:1.6,lat:41.8,html:"<b>Catalunya</b>pols africana un de cada sis dies",dx:26,dy:-22,lead:1,steps:[5]},
   {lon:3,lat:30,html:"<b>Sàhara</b>",al:"c",steps:[5]}].forEach(function(L){map.addLabel(L)});
  var parts=[],eu=[],acc=0,accE=0,NMAX=0;
  function spawn(p){var w=summer(st.m),tot=0,i,r;for(i=0;i<SRC.length;i++)tot+=lerp(SRC[i][2],SRC[i][3],w);r=Math.random()*tot;
    for(i=0;i<SRC.length;i++){r-=lerp(SRC[i][2],SRC[i][3],w);if(r<=0)break}var s=SRC[Math.min(i,SRC.length-1)];
    p.src=s;p.lon=s[0]+rnd(-2.2,2.2);p.lat=s[1]+rnd(-1.8,1.8);p.q=tri()*.95;p.ph=Math.random()*6.283;p.dl=deathLon();p.live=true;p.sp=rnd(.85,1.15)}
  function init(){NMAX=mob()?1200:2600;parts=[];eu=[];acc=0;warm=false}
  function setStep(i){if(i===step)return;step=i;var S=STEPS[i];tg.l0=S.lines[0];tg.l1=S.lines[1];tg.l2=S.lines[2];tg.amz=S.amz;tg.eu=S.eu;
    /* el control lliscant segueix el mes de cada pas */
    if(S.m!==null){user=false;stop();tg.m=S.m;rng.value=S.m.toFixed(2)}else{tg.m=+rng.value}
    map.setView(S.v);map.showLabels(i)}
  var rng=document.getElementById("mRng"),playB=document.getElementById("mPlay");
  function stop(){playing=false;playB.textContent="Reprodueix"}
  rng.addEventListener("input",function(){user=true;stop();tg.m=+rng.value;st.m=tg.m});
  playB.addEventListener("click",function(){if(playing){stop();return}playing=true;user=true;playB.textContent="Pausa"});
  function readout(){var m=((st.m%12)+12)%12,S=SEAS[seasonOf(m)],nm=MES[Math.floor(m)];
    document.getElementById("mName").textContent=nm;
    document.getElementById("mVal").textContent=mob()?S.n+": surt el "+S.out+"% de la pols de l'any":S.n+": surt d'Àfrica el "+S.out+"% de la pols de l'any · a l'Amazònia en cau "+S.amz;
    rng.setAttribute("aria-valuetext",nm+" ("+S.n.toLowerCase()+")");
    document.getElementById("mSrc").textContent="Dades: Yu et al. 2015, satèl·lit CALIPSO (mitjana 2007–2013)"}
  var lastRead="",lastRng="";
  function layout(){map.layout(mob()?innerHeight*.36:Math.max(260,innerHeight-250));map.drawBase()}
  function meridian(c,lon,a,txt){if(a<.02)return;var p0=map.P(lon,-16),p1=map.P(lon,33);c.save();c.globalAlpha=a;c.setLineDash([3,3]);c.strokeStyle=C.ink;c.lineWidth=.9;c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);c.stroke();c.restore()}
  var warm=false;
  function sim(dt,draw){
    var w=summer(st.m),rate=fluxM(st.m)/(46/3)*(NMAX/6.5);acc+=rate*dt*(RM?.35:1);
    while(acc>=1&&parts.length<NMAX){acc-=1;var np={};spawn(np);parts.push(np)}if(acc>3)acc=0;
    var hz=null,dp=null;
    if(draw){hz=map.hz.getContext("2d");dp=map.dep.getContext("2d");hz.setTransform(map.dpr,0,0,map.dpr,0,0);dp.setTransform(map.dpr,0,0,map.dpr,0,0);
      hz.fillStyle="rgba("+C.dustRGB+",.62)";dp.fillStyle="rgba(154,99,38,.5)"}
    var spd=(RM?.3:1)*7.5*clamp((map.view[1]-map.view[0])/90,.75,1.3),alive=[],i,ds=mob()?2:1.6;
    var c17=lerp(pw(nWC,17),pw(nSC,17),w),h17=lerp(pw(nWH,17),pw(nSH,17),w);
    for(i=0;i<parts.length;i++){var p=parts[i];
      var ex=c17+p.q*h17,tl;
      if(p.lon>-17){var s=p.src,wp=s[4],ww=1-w;
        if(wp&&ww>.35&&p.lon>wp[0]){var tt=(s[0]-p.lon)/(s[0]-wp[0]);tl=lerp(s[1],wp[1]+p.q*2,sm(tt))}
        else{var a0=wp&&ww>.35?wp[0]:s[0],b0=wp&&ww>.35?wp[1]:s[1],t2=(a0-p.lon)/(a0+17);tl=lerp(b0,ex,sm(t2))}
        p.lon-=spd*.8*p.sp*dt}
      else{tl=latAt(p.lon,w,p.q)+.7*Math.sin(p.ph+p.lon*.12);p.lon-=spd*p.sp*dt}
      p.lat+=(tl-p.lat)*Math.min(1,dt*2.2);
      var dead=false,depo=true;
      if(p.lon<p.dl)dead=true;
      if(!dead&&p.lon<-49&&p.lat<8.5&&p.lat>-14&&Math.random()<dt*1.1)dead=true;/* pluja sobre Sud-amèrica */
      if(p.lon<-104||p.lat>47){dead=true;depo=false}
      if(dead){if(depo&&dp){var qd=map.P(p.lon,p.lat);dp.fillRect(qd[0]-1.1,qd[1]-1.1,2.2,2.2)}continue}
      if(hz){var q=map.P(p.lon,p.lat);hz.fillRect(q[0]-ds/2,q[1]-ds/2,ds,ds)}alive.push(p)}
    parts=alive;
    /* branca cap a Europa */
    if(st.eu>.03){accE+=st.eu*dt*(mob()?60:130)*(RM?.35:1);while(accE>=1){accE-=1;eu.push({s:rnd(0,.8),q:tri(),lim:rnd(EU.total*.5,EU.total),sp:rnd(.8,1.2)})}}
    var keep=[];for(i=0;i<eu.length;i++){var e=eu[i];e.s+=dt*spd*.5*e.sp;if(e.s>e.lim){if(dp){var qe0=EU.at(e.s,e.q),pd=map.P(qe0.lon,qe0.lat);dp.fillRect(pd[0]-.9,pd[1]-.9,1.8,1.8)}continue}
      if(hz){var qe=EU.at(e.s,e.q),pe=map.P(qe.lon,qe.lat);hz.fillRect(pe[0]-ds/2,pe[1]-ds/2,ds,ds)}keep.push(e)}eu=keep;
  }
  function frame(dt,t){
    if(!map.W)return;
    if(playing){tg.m=(tg.m+dt*.75)%12;st.m=tg.m;rng.value=tg.m.toFixed(2)}
    else{var dm=tg.m-st.m;if(Math.abs(dm)>6)dm-=12*Math.sign(dm);st.m=((st.m+dm*Math.min(1,dt*1.6))%12+12)%12;
      if(!user){var rv=st.m.toFixed(2);if(rv!==lastRng){lastRng=rv;rng.value=rv}}}
    ["l0","l1","l2","amz","eu"].forEach(function(k){st[k]+=(tg[k]-st[k])*Math.min(1,dt*(RM?20:2.5))});
    map.ease(dt);if(map.dirty)map.drawBase();map.fadeFx(dt,.06);
    if(!warm){warm=true;for(var k=0;k<260;k++)sim(.05,false)}
    sim(dt,true);
    map.compose(0);var c=map.ctx;
    /* conca amazònica (rectangle de Yu et al. 2015) */
    if(st.amz>.02){c.save();c.globalAlpha=st.amz;polyPath(c,map,AMZ);c.fillStyle="rgba(76,138,46,.07)";c.fill();c.setLineDash([4,3]);c.strokeStyle=C.bio;c.lineWidth=1.2;c.stroke();c.restore()}
    meridian(c,-15,st.l0);meridian(c,-35,st.l1);meridian(c,-75,st.l2);
    /* rètols de l'oceà */
    var fs=Math.round(clamp(map.W/70,10,14));c.font="italic "+fs+"px "+SERIF;c.fillStyle=C.water;c.textAlign="center";
    var oa=map.P(-40,24);if(oa[0]>40&&oa[0]<map.W-40&&oa[1]>10&&oa[1]<map.H-10)c.fillText("Oceà Atlàntic",oa[0],oa[1]);
    map.leaders(c);
    var r=MES[Math.floor(((st.m%12)+12)%12)];if(r!==lastRead){lastRead=r;readout()}
  }
  M={map:map,init:init,setStep:setStep,layout:layout,frame:frame};
  init();setStep(0);readout();
  IB.scrolly(document.getElementById("msteps"),document.getElementById("mgraphic"),function(i){setStep(i)});
}

/* ======================= 3. TALL DE LA CAPA D'AIRE ======================= */
var X=null;
function initSAL(){
  var cv=document.getElementById("sal");if(!cv)return;var ctx=cv.getContext("2d"),W=0,H=0,dpr=1;
  var seg=[].slice.call(document.querySelectorAll("#salSeg button")),out=document.getElementById("salOut"),playB=document.getElementById("salPlay");
  var cur=0,sv=0,playing=false,pt=0,parts=[];
  /* geometria (Tsamalis et al. 2013): [lon, km] — l'eix va de 92°O (esquerra) a 22°E (dreta) */
  var TOPW=[[-92,1.6],[-50,2],[-17,3],[22,3]],BOTW=[[-92,0],[22,0]];
  var TOPS=[[-92,2],[-75,2.6],[-50,3.6],[-30,4.8],[-17,5],[0,5.5],[22,5.5]],BOTS=[[-92,0],[-75,.25],[-50,.6],[-30,1],[-19,1],[-16,0],[22,0]];
  var SUMW=[0,.45,1,.55],DEST=[0,0,1,1];
  function geo(sv){var i=Math.floor(sv)%4,j=(i+1)%4,f=sm(sv-Math.floor(sv));return {w:lerp(SUMW[i],SUMW[j],f),d:lerp(DEST[i],DEST[j],f)}}
  function top(lon,w){return lerp(pw(TOPW,lon),pw(TOPS,lon),w)}
  function bot(lon,w){return lerp(pw(BOTW,lon),pw(BOTS,lon),w)}
  var L0=-92,L1=22,pad={l:34,r:12,t:16,b:30};
  function X_(lon){return pad.l+(lon-L0)/(L1-L0)*(W-pad.l-pad.r)}
  function Y_(z){return pad.t+(1-z/7)*(H-pad.t-pad.b)}
  function layout(){W=cv.parentElement.clientWidth;H=mob()?290:380;dpr=Math.min(2,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+"px";pad.l=mob()?28:36}
  function set(i){cur=i;seg.forEach(function(b,k){b.setAttribute("aria-pressed",k===i)});var S=SEAS[i];
    var txt=["La capa va de 0 a 3 km a la costa africana i baixa a 0–2 km prop de Sud-amèrica.",
      "Valors entre els de l'hivern i els de l'estiu. És quan més pols cau a l'Amazònia.",
      "D'1 a 5 km a la costa africana, amb aire net del mar per sota. Baixa fins a 0–2 km al golf de Mèxic.",
      "La capa torna a baixar i a anar cap al sud. És l'època amb menys pols."][i];
    out.innerHTML="<span class='big'>"+S.n+" <span style='font-family:var(--sans);font-size:15px;font-weight:400;color:var(--ink-2)'>("+S.m+")</span></span>"+txt+"<br>Surt d'Àfrica <b>el "+S.out+"%</b> de la pols de tot l'any. Del que arriba al Carib, <b>el "+S.car+"%</b> hi arriba en aquesta estació. A l'Amazònia en cau <b>"+S.amz+"</b>."}
  seg.forEach(function(b,k){b.addEventListener("click",function(){playing=false;playB.textContent="Reprodueix l'any";set(k)})});
  playB.addEventListener("click",function(){playing=!playing;playB.textContent=playing?"Pausa":"Reprodueix l'any";pt=0});
  function spawn(p,init){var g=geo(sv);p.lon=init?rnd(-90,20):rnd(-6,20);p.f=Math.random();p.fall=false;p.z=0;p.sp=rnd(.8,1.2);p.dl=-17-(Math.random()<.7?rnd(0,60):rnd(60,110))}
  function init(){parts=[];var n=mob()?260:520;for(var i=0;i<n;i++){var p={};spawn(p,true);parts.push(p)}}
  function cloud(x,y,s){ctx.beginPath();ctx.arc(x,y,s,Math.PI,0);ctx.arc(x+s*1.1,y,s*.75,Math.PI,0);ctx.arc(x-s*1.0,y,s*.65,Math.PI,0);ctx.closePath();ctx.fill()}
  function frame(dt,t){
    if(!W)return;
    if(playing){pt+=dt;if(pt>2.6){pt=0;set((cur+1)%4)}}
    var d=cur-sv;if(d<-2)d+=4;if(d>2)d-=4;sv=(sv+d*Math.min(1,dt*(RM?20:2.2))+4)%4;
    var g=geo(sv),w=g.w,de=g.d,c=ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
    var y0=Y_(0),fs=mob()?10.5:12;
    /* capa marina (sota la SAL, sobre l'oceà) */
    c.beginPath();for(var lon=L0;lon<=-17;lon+=1)c.lineTo(X_(lon),Y_(bot(lon,w)));c.lineTo(X_(-17),y0);c.lineTo(X_(L0),y0);c.closePath();c.fillStyle="rgba(44,93,168,.10)";c.fill();
    /* SAL */
    c.beginPath();for(lon=L0;lon<=L1;lon+=1)c.lineTo(X_(lon),Y_(top(lon,w)));for(lon=L1;lon>=L0;lon-=1)c.lineTo(X_(lon),Y_(bot(lon,w)));c.closePath();
    var gr=c.createLinearGradient(0,Y_(5.5),0,y0);gr.addColorStop(0,"rgba(200,68,42,.10)");gr.addColorStop(1,"rgba(176,116,52,.22)");c.fillStyle=gr;c.fill();
    c.strokeStyle="rgba(176,116,52,.75)";c.lineWidth=1;c.beginPath();for(lon=L0;lon<=L1;lon+=1)c.lineTo(X_(lon),Y_(top(lon,w)));c.stroke();
    if(w>.2){c.save();c.globalAlpha=sm((w-.2)/.4);c.setLineDash([4,3]);c.strokeStyle=C.ink2;c.beginPath();for(lon=L0;lon<=-8;lon+=1)c.lineTo(X_(lon),Y_(bot(lon,w)));c.stroke();c.restore()}
    /* cúmuls dels alisis (estiu) */
    if(w>.3){c.fillStyle="#fff";c.strokeStyle="#B9C6D8";c.lineWidth=1;c.globalAlpha=sm((w-.3)/.4);for(lon=-24;lon>-72;lon-=8){var zb=bot(lon,w);if(zb<.3)continue;var x=X_(lon),y=Y_(zb*.92);cloud(x,y,mob()?4:7);c.stroke()}c.globalAlpha=1}
    /* pluja sobre Sud-amèrica (hivern i primavera) */
    var rainA=1-de;
    if(rainA>.02){c.save();c.globalAlpha=rainA;c.fillStyle="#F3F5F8";c.strokeStyle="#B9C6D8";c.lineWidth=1;for(var k=0;k<5;k++){var xc=X_(-54-k*7.5),yc=Y_(2.9+(k%2)*.35);cloud(xc,yc,mob()?8:14);c.stroke()}
      /* totes les gotes en un sol camí (abans, un traç per gota) */
      c.strokeStyle="rgba(44,93,168,.55)";c.lineWidth=1;var off=RM?0:(t*90)%14;c.beginPath();for(var rx=X_(-86);rx<X_(-50);rx+=6){for(var ry=Y_(2.9)+off-14;ry<y0;ry+=14){c.moveTo(rx,ry);c.lineTo(rx-1.5,ry+6)}}c.stroke();c.restore()}
    /* terra */
    c.fillStyle="#E4DCC8";c.beginPath();c.moveTo(X_(-17),y0);for(lon=-17;lon<=L1;lon+=1)c.lineTo(X_(lon),Y_(.12+.18*sm((lon+17)/12)+.05*Math.sin(lon*.7)));c.lineTo(X_(L1),y0);c.closePath();c.fill();
    if(rainA>.02){c.globalAlpha=rainA;c.fillStyle="#DCE5CF";c.beginPath();c.moveTo(X_(-50),y0);c.lineTo(X_(-50),Y_(.06));c.lineTo(X_(L0),Y_(.1));c.lineTo(X_(L0),y0);c.closePath();c.fill();
      c.fillStyle=C.bio;c.beginPath();for(lon=-51;lon>L0;lon-=1.4){var tx=X_(lon),ty=Y_(.1);c.moveTo(tx+2.2,ty-2);c.arc(tx,ty-2,2.2,0,6.283)}c.fill();c.globalAlpha=1}
    if(de>.02){c.globalAlpha=de;c.fillStyle="#E4DCC8";[[-59.5,.6],[-61.5,.8],[-66,1],[-72.5,1.6],[-77,1.2],[-81.2,.7]].forEach(function(isl){var x=X_(isl[0]),s=isl[1]*(mob()?4:6);c.beginPath();c.moveTo(x-s,y0);c.quadraticCurveTo(x,y0-s*1.2,x+s,y0);c.fill()});c.globalAlpha=1}
    /* mar */
    c.strokeStyle=C.cold;c.globalAlpha=.6;c.lineWidth=1;c.beginPath();c.moveTo(X_(rainA>.5?-50:L0),y0);c.lineTo(X_(-17),y0);c.stroke();c.globalAlpha=1;
    c.strokeStyle=C.ink;c.lineWidth=1;c.beginPath();c.moveTo(pad.l,y0+.5);c.lineTo(W-pad.r,y0+.5);c.stroke();
    /* partícules */
    var spd=(RM?.3:1)*22;c.fillStyle="rgba("+C.dustRGB+",.8)";
    for(var i=0;i<parts.length;i++){var p=parts[i];var tp=top(p.lon,w),bt=bot(p.lon,w);
      if(!p.fall){p.lon-=spd*p.sp*dt*.6;p.z=bt+(tp-bt)*p.f;p.f=Math.max(0,p.f-dt*.012);
        if(p.lon<p.dl||(rainA>.5&&p.lon<-50&&Math.random()<dt*1.6)){p.fall=true}}
      else{p.lon-=spd*p.sp*dt*.25;p.z-=dt*(rainA>.5&&p.lon<-50?2.4:.45)}
      if(p.z<=0||p.lon<L0){spawn(p,false);continue}
      c.fillRect(X_(p.lon)-1,Y_(p.z)-1,2,2)}
    /* eixos */
    c.font=fs+"px "+SANS;c.fillStyle=C.muted;c.textAlign="right";for(var z=0;z<=6;z+=2){c.fillText(z+(z===6?" km":""),pad.l-5,Y_(z)+4)}
    c.textAlign="center";[[20,"20° E"],[0,"0°"],[-20,"20° O"],[-40,"40° O"],[-60,"60° O"],[-80,"80° O"]].forEach(function(a){c.fillText(a[1],X_(a[0]),H-10)});
    /* rètols */
    c.font="600 "+(fs+1)+"px "+SANS;c.fillStyle=C.ink;c.textAlign="center";
    var lx=mob()?-12:-30;c.fillText("Capa d'aire del Sàhara",X_(lx),Y_(top(lx,w))-(mob()?6:8));
    c.font=fs+"px "+SANS;c.fillStyle=C.ink2;c.fillText("calenta, seca i amb pols",X_(lx),Y_(top(lx,w))+(mob()?12:14));
    c.fillStyle=C.dry;c.fillText("Sàhara",X_(8),y0-6);c.fillStyle=C.ink2;c.fillText("costa africana",X_(-17),y0+14>H-22?y0-6:y0+14);
    if(w>.35){c.globalAlpha=sm((w-.35)/.3);c.fillStyle=C.cold;c.fillText("aire del mar, fresc i humit",X_(-30),Y_(Math.max(.25,bot(-30,w)*.35)));c.globalAlpha=1}
    if(rainA>.02){c.globalAlpha=rainA;c.fillStyle=C.bio;c.font="600 "+(fs)+"px "+SANS;c.fillText("Amazònia",X_(-70),y0-12);c.fillStyle=C.cold;c.font=fs+"px "+SANS;c.fillText("la pluja l'arrossega a terra",X_(-70),Y_(4.2));c.globalAlpha=1}
    if(de>.02){c.globalAlpha=de;c.fillStyle=C.ink2;c.font=fs+"px "+SANS;c.fillText("Antilles",X_(-64),y0-14);c.fillText("Florida i golf de Mèxic",X_(-84),Y_(2.6)-6);c.globalAlpha=1}
    c.fillStyle=C.muted;c.textAlign="center";c.font="italic "+fs+"px "+SERIF;c.fillText("← la pols viatja cap a l'oest",X_(-35),Y_(6.4));
  }
  X={layout:layout,frame:frame};layout();init();set(0);
}

/* ======================= 4. CAMIONS ======================= */
function initTrucks(){
  var svg=d3.select("#trucks");if(svg.empty())return;
  /* L'ordre segueix el mapa: la pols que cau a l'Amazònia (entre els 40–50° i els 75° oest) no forma part de la que arriba al Carib */
  var V=[{t:182e6,lab:"Surt d'Àfrica cada any (15° O)"},{t:132e6,lab:"Arriba a mig oceà (35° O)"},{t:27.7e6,lab:"Cau a l'Amazònia, abans d'arribar als 75° O",amz:1},{t:43e6,lab:"Una altra part arriba al Carib (75° O), sense la que ha caigut a l'Amazònia"},{t:22000,lab:"Fòsfor que cau a l'Amazònia",p:1}];
  var PER=500000,N=Math.ceil(182e6/PER),cur=0,timer=null,out=document.getElementById("tOut");
  var defs=svg.append("defs");
  var sym=defs.append("symbol").attr("id","trk").attr("viewBox","0 0 40 22");
  sym.append("rect").attr("x",0).attr("y",2).attr("width",26).attr("height",13).attr("rx",1);
  sym.append("path").attr("d","M27 6h6l4 4v5h-10z");
  sym.append("circle").attr("cx",6).attr("cy",18).attr("r",3);sym.append("circle").attr("cx",20).attr("cy",18).attr("r",3);sym.append("circle").attr("cx",32).attr("cy",18).attr("r",3);
  var clip=defs.append("clipPath").attr("id","tclip").append("rect").attr("x",0).attr("y",0).attr("height",22);
  var gG=svg.append("g"),gA=svg.append("g"),gN=svg.append("g");
  var cols,cw,ch;
  function layout(){var W=svg.node().parentNode.clientWidth;cols=W>=700?26:W>=480?20:14;cw=W/cols;ch=cw*.62;var rows=Math.ceil(N/cols);svg.attr("viewBox","0 0 "+W+" "+(rows*ch+4)).attr("height",rows*ch+4);
    var idx=d3.range(N);
    gG.selectAll("use").data(idx).join("use").attr("href","#trk").attr("x",function(i){return (i%cols)*cw+cw*.1}).attr("y",function(i){return Math.floor(i/cols)*ch+ch*.12}).attr("width",cw*.8).attr("height",cw*.8*22/40).attr("fill","#F1EFEA");
    gA.selectAll("use").data(idx).join("use").attr("href","#trk").attr("x",function(i){return (i%cols)*cw+cw*.1}).attr("y",function(i){return Math.floor(i/cols)*ch+ch*.12}).attr("width",cw*.8).attr("height",cw*.8*22/40);
    show(cur,true)}
  function show(i,now){cur=i;var v=V[i],n=v.t/PER,col=v.p?C.warm:v.amz?C.bio:C.dust;
    d3.selectAll("#tSeg button").attr("aria-pressed",function(d,k){return k===i});
    gA.selectAll("use").interrupt().transition().duration(now||RM?0:700).delay(function(d){return now||RM?0:Math.max(0,(N-d))*1.4}).attr("fill",col)
      .attr("opacity",function(d){return d<Math.floor(n)?1:0});
    /* icona parcial */
    gN.selectAll("*").remove();var fr=n-Math.floor(n),k=Math.floor(n);
    if(fr>0.001){var x=(k%cols)*cw+cw*.1,y=Math.floor(k/cols)*ch+ch*.12;clip.attr("width",40*fr);
      gN.append("svg").attr("x",x).attr("y",y).attr("width",cw*.8).attr("height",cw*.8*22/40).attr("viewBox","0 0 40 22").append("use").attr("href","#trk").attr("clip-path","url(#tclip)").attr("fill",col).attr("width",40).attr("height",22);
      if(v.p){/* lupa: una icona partida en 23 trossos, i un de pintat (880 de 20.000 camions) */
        var Wd=svg.node().parentNode.clientWidth,R=mob()?Math.min(98,Wd*.27):Math.min(96,Wd*.2),cx=Math.min(Wd-R-12,x+cw*.4+R*2.4),cy=Math.max(R+6,y+R*.9),ix=x+cw*.4,iy=y+cw*.22;
        var dx=cx-ix,dy=cy-iy,dd=Math.hypot(dx,dy)||1;
        gN.append("line").attr("x1",ix+dx/dd*cw*.55).attr("y1",iy+dy/dd*cw*.55).attr("x2",cx-dx/dd*R).attr("y2",cy-dy/dd*R).attr("stroke",C.ink2).attr("stroke-width",1);
        gN.append("circle").attr("cx",ix).attr("cy",iy).attr("r",cw*.47).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",1);
        gN.append("circle").attr("cx",cx).attr("cy",cy).attr("r",R).attr("fill","#fff").attr("stroke",C.ink2).attr("stroke-width",1.2);
        var bw=R*1.4,bh=bw*22/40,bx=cx-bw/2,by=cy-bh/2-8;
        gN.append("use").attr("href","#trk").attr("x",bx).attr("y",by).attr("width",bw).attr("height",bh).attr("fill","#E4DFD5");
        var gc=gN.append("svg").attr("x",bx).attr("y",by).attr("width",bw).attr("height",bh).attr("viewBox","0 0 40 22");
        gc.append("clipPath").attr("id","tclipP").append("rect").attr("x",0).attr("y",0).attr("width",40/22.7).attr("height",22);
        gc.append("use").attr("href","#trk").attr("width",40).attr("height",22).attr("fill",C.warm).attr("clip-path","url(#tclipP)");
        for(var sl=1;sl<23;sl++){var sx=bx+bw*sl/22.7;gN.append("line").attr("x1",sx).attr("x2",sx).attr("y1",by).attr("y2",by+bh).attr("stroke","#fff").attr("stroke-width",.8)}
        gN.append("text").attr("x",cx).attr("y",by+bh+16).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",mob()?11:12).attr("fill",C.ink).text("1 icona = 20.000 camions");
        gN.append("text").attr("x",cx).attr("y",by+bh+30).attr("text-anchor","middle").attr("font-family",SANS).attr("font-size",mob()?11:12).attr("font-weight",700).attr("fill",C.warm).text("Fòsfor: 880, una 23a part")}}
    var trucks=v.t/25,perDay=trucks/365.25;
    out.innerHTML="<span class='big'>"+(v.p?fmt(v.t)+" tones l'any":fmt(v.t/1e6,v.t<1e8&&v.t%1e6?1:0)+" milions de tones l'any")+"</span>"+v.lab+". Serien "+
      (v.p?"<b>880 camions</b> de 25 tones, uns <b>2 o 3 al dia</b>.":"<b>"+fmt(trucks/1e6,1)+" milions de camions</b> de 25 tones, uns <b>"+fmt(Math.round(perDay/100)*100)+" cada dia</b>.")}
  d3.selectAll("#tSeg button").on("click",function(){stopT();show(+this.dataset.i)});
  var pb=document.getElementById("tPlay");
  function stopT(){if(timer){clearInterval(timer);timer=null;pb.textContent="Reprodueix el viatge"}}
  pb.addEventListener("click",function(){if(timer){stopT();return}var i=0;show(0);pb.textContent="Pausa";timer=setInterval(function(){i++;if(i>4){stopT();return}show(i)},1900)});
  layout();addEventListener("resize",function(){safe(layout)});
}

/* ======================= 5. BALANÇ DE FÒSFOR ======================= */
function initBudget(){
  var svg=d3.select("#budget");if(svg.empty())return;
  var EST=[
    {n:"Prospero et al. 2020",d:"mesures a Caiena i model, 2002–2017",v:9,lo:8,hi:10},
    {n:"Swap et al. 1992",d:"mesures a l'Amazònia central, 1987",v:13,lo:9,hi:19},
    {n:"Model GEOS-Chem",d:"Ridley et al. 2012",v:17},
    {n:"Model WRF-Chem",d:"via Yu et al. 2015",v:19},
    {n:"Model GOCART",d:"via Yu et al. 2015",v:26},
    {n:"Satèl·lit CALIPSO",d:"Yu et al. 2015, 2007–2013",v:27.7,lo:8,hi:48,main:1},
    {n:"Satèl·lit MODIS",d:"Kaufman et al. 2005, inclou part de mar",v:50}];
  var rng=document.getElementById("bRng"),outD=document.getElementById("bOutD"),ver=document.getElementById("bVerdict"),tip=document.getElementById("bTip");
  var PF=1e12*780e-6/9.6e8;/* g P/ha per Tg */
  var gE=svg.append("g").attr("class","estm"),gB=svg.append("g").attr("font-family",SANS),W,x,xb,rowH,top2;
  function layout(){W=svg.node().parentNode.clientWidth;var m=mob(),lw=m?0:230;rowH=m?30:24;
    var h1=18+EST.length*rowH+30;top2=h1+28;var H=top2+(m?252:204);svg.attr("viewBox","0 0 "+W+" "+H).attr("height",H);
    x=d3.scaleLinear().domain([0,55]).range([lw+10,W-14]);
    gE.selectAll("*").remove();gB.selectAll("*").remove();
    gE.append("text").attr("x",0).attr("y",12).attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink).text("Estimacions publicades (milions de tones l'any)");
    x.ticks(m?5:11).forEach(function(t){gE.append("line").attr("x1",x(t)).attr("x2",x(t)).attr("y1",20).attr("y2",18+EST.length*rowH).attr("stroke",C.hair).attr("stroke-width",.6);
      gE.append("text").attr("x",x(t)).attr("y",18+EST.length*rowH+14).attr("text-anchor","middle").attr("font-size",11).attr("fill",C.muted).text(t)});
    var rows=gE.selectAll("g.row").data(EST).join("g").attr("class","row").attr("tabindex",0).attr("role","button").attr("aria-label",function(d){return d.n+": "+fmt(d.v,d.v%1?1:0)+" milions de tones"})
      .attr("transform",function(d,i){return "translate(0,"+(22+i*rowH)+")"});
    rows.append("rect").attr("x",0).attr("y",0).attr("width",W).attr("height",rowH).attr("fill","transparent");
    rows.append("text").attr("x",m?x(0):0).attr("y",m?10:rowH*.62).attr("font-size",m?11:12.5).attr("fill",C.ink2).attr("font-weight",function(d){return d.main?700:400})
      .text(function(d){return m?d.n:d.n}).append("tspan").attr("fill",C.muted).attr("font-weight",400).text(function(d){return m?"":" · "+d.d});
    var cy=m?rowH*.72:rowH*.5;
    rows.filter(function(d){return d.lo!=null}).append("line").attr("x1",function(d){return x(d.lo)}).attr("x2",function(d){return x(d.hi)}).attr("y1",cy).attr("y2",cy).attr("stroke",function(d){return d.main?C.dust:C.muted}).attr("stroke-width",2).attr("opacity",.6);
    rows.append("circle").attr("cx",function(d){return x(d.v)}).attr("cy",cy).attr("r",function(d){return d.main?6:4.5}).attr("fill",function(d){return d.main?C.dust:"#fff"}).attr("stroke",C.dust).attr("stroke-width",1.6);
    rows.append("text").attr("x",function(d){return x(d.v)+9}).attr("y",cy+4).attr("font-size",11.5).attr("fill",C.ink).text(function(d){return fmt(d.v,d.v%1?1:0)});
    rows.on("click",function(e,d){rng.value=d.v;upd()}).on("keydown",function(e,d){if(e.key==="Enter"||e.key===" "){e.preventDefault();rng.value=d.v;upd()}});
    gE.append("line").attr("class","cur").attr("y1",18).attr("y2",18+EST.length*rowH).attr("stroke",C.ink).attr("stroke-width",1.2).attr("stroke-dasharray","3,2");
    /* balanç */
    xb=d3.scaleLinear().domain([0,60]).range([m?8:lw+10,W-(m?14:90)]);
    var y0=top2;gB.append("text").attr("x",0).attr("y",y0).attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink).text("Fòsfor (grams per hectàrea i any)");
    var bt=y0+16,gh=m?182:140;xb.ticks(6).forEach(function(t){gB.append("line").attr("x1",xb(t)).attr("x2",xb(t)).attr("y1",bt).attr("y2",bt+gh).attr("stroke",C.hair).attr("stroke-width",.6);
      gB.append("text").attr("x",xb(t)).attr("y",bt+gh+14).attr("text-anchor","middle").attr("font-size",11).attr("fill",C.muted).text(t)});
    var dy=m?44:34,r1=bt+6,r2=r1+dy,r3=r2+dy,r4=r3+dy,bh=m?14:16;
    function lab(y,t,col,w){var e=gB.append("text").attr("x",m?xb(0):0).attr("y",m?y-4:y+bh*.75).attr("font-size",m?11.5:12.5).attr("fill",col||C.ink2).text(t);if(w)e.attr("font-weight",w)}
    lab(r1,"Entra amb la pols africana",C.ink,700);lab(r2,"Surt pels rius",C.ink);lab(r3,"Cau de l'aire, de totes les fonts",C.ink);lab(r4,"Recicla la selva (fulles que cauen)",C.ink2);
    var off=m?2:0;
    gB.append("rect").attr("class","inbar").attr("x",xb(0)).attr("y",r1+off).attr("height",bh).attr("fill",C.dust);
    gB.append("text").attr("class","inval").attr("y",r1+off+bh*.78).attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink);
    gB.append("rect").attr("x",xb(8)).attr("width",xb(40)-xb(8)).attr("y",r2+off).attr("height",bh).attr("fill",C.cold).attr("opacity",.28);
    gB.append("rect").attr("x",xb(8)).attr("width",1.5).attr("y",r2+off).attr("height",bh).attr("fill",C.cold);gB.append("rect").attr("x",xb(40)-1.5).attr("width",1.5).attr("y",r2+off).attr("height",bh).attr("fill",C.cold);
    gB.append("text").attr("x",xb(40)+6).attr("y",r2+off+bh*.78).attr("font-size",12.5).attr("fill",C.ink).text("8–40");
    /* deposició total des de l'aire (Vitousek i Sanford 1986, via Yu et al. 2015): fora d'escala */
    gB.append("rect").attr("x",xb(0)).attr("width",xb(60)-xb(0)).attr("y",r3+off).attr("height",bh).attr("fill",C.ink2).attr("opacity",.13);
    gB.append("text").attr("x",xb(60)+(m?-4:6)).attr("y",r3+off+bh*.78+(m?bh+2:0)).attr("text-anchor",m?"end":"start").attr("font-size",12).attr("fill",C.ink2).text("161–300 →");
    gB.append("text").attr("x",xb(60)-6).attr("y",r3+off+bh*.75).attr("text-anchor","end").attr("font-size",11).attr("fill",C.ink2).text(m?"pols, fum i partícules biològiques":"fora d'escala: pols, fum i partícules biològiques");
    gB.append("rect").attr("x",xb(0)).attr("width",xb(60)-xb(0)).attr("y",r4+off).attr("height",bh).attr("fill",C.bio).attr("opacity",.22);
    gB.append("text").attr("x",xb(60)+(m?-4:6)).attr("y",r4+off+bh*.78+(m?bh+2:0)).attr("text-anchor",m?"end":"start").attr("font-size",12).attr("fill",C.ink2).text("1.400–4.100 →");
    gB.append("text").attr("x",xb(60)-6).attr("y",r4+off+bh*.75).attr("text-anchor","end").attr("font-size",11).attr("fill",C.ink2).text(m?"de 60 a 180 vegades la pols":"fora d'escala: de 60 a 180 vegades la pols");
    upd(true)}
  function upd(now){var D=+rng.value,P=D*PF;outD.textContent=fmt(D,D%1?1:0)+" milions de tones";
    gE.select(".cur").attr("x1",x(D)).attr("x2",x(D));
    gB.select(".inbar").transition().duration(now||RM?0:300).attr("width",Math.max(0,xb(Math.min(P,60))-xb(0)));
    gB.select(".inval").attr("x",xb(Math.min(P,60))+6).text(fmt(P,P<10?1:0));
    var lo=P/40*100,hi=P/8*100,t,Dt=fmt(D,D%1?1:0);
    if(P<0.05)t="Sense pols africana, la selva perdria un dels seus ingressos de fòsfor nou, però no l'únic: el fum dels incendis d'Àfrica també n'hi porta. I del cel hi continuarien caient partícules biològiques i de fum, moltes de la mateixa selva.";
    else if(P<8)t="Amb "+Dt+" milions de tones, la pols aporta <b>"+fmt(P,1)+" grams</b> de fòsfor per hectàrea i any: menys que les pèrdues més petites. <b>Només pagaria una part de la comissió.</b>";
    else if(P<=40)t="Amb "+Dt+" milions de tones, la pols aporta <b>"+fmt(P,P<10?1:0)+" grams</b> per hectàrea i any. Equivaldria a <b>entre el "+fmt(lo)+"% i "+(hi>=100?"la totalitat":"el "+fmt(hi)+"%")+"</b> del que es perd pels rius, però seria una part petita del fòsfor que cau de l'aire.";
    else t="Amb "+Dt+" milions de tones, la pols aporta <b>"+fmt(P)+" grams</b> per hectàrea i any: <b>més que les pèrdues més altes.</b> És més del que mesuren la majoria d'estudis.";
    ver.innerHTML=t;rng.setAttribute("aria-valuetext",fmt(D,1)+" milions de tones; "+fmt(P,1)+" grams de fòsfor per hectàrea")}
  rng.addEventListener("input",function(){upd(true)});
  layout();addEventListener("resize",function(){safe(layout)});
}

/* ======================= 6. ANY A ANY ======================= */
function initYears(){
  var svg=d3.select("#years");if(svg.empty())return;var tip=document.getElementById("yTip");
  /* Yu et al. 2015 RSE, taula 2: [any, LDF, UDF, AVE] */
  var D={"15":[[2007,195.9,257.3,226.6],[2008,190.7,252.6,221.7],[2009,129.3,176.4,152.9],[2010,140.5,192.1,166.3],[2011,111.5,153.9,132.7],[2012,185.9,243.9,214.9],[2013,135.5,185.2,160.4]],
    "35":[[2007,134.8,215.5,175.2],[2008,100.8,164.4,132.6],[2009,83.4,141.3,112.4],[2010,101.8,161.0,131.4],[2011,78.8,132.2,105.5],[2012,114.8,188.3,151.6],[2013,85.3,142.3,113.8]],
    "75":[[2007,32.1,64.9,48.5],[2008,31.9,63.1,47.5],[2009,25.7,55.2,40.5],[2010,29.6,59.5,44.6],[2011,18.5,38.3,28.4],[2012,34.5,67.4,51.0],[2013,29.9,54.5,42.2]]};
  var SER=[{k:"15",n:"Surt d'Àfrica",s:"15° O",col:C.dry},{k:"35",n:"A mig oceà",s:"35° O",col:C.dust},{k:"75",n:"Arriba al Carib",s:"75° O",col:"#D2A574"}];
  var W,H,x,y,m;
  function layout(){W=svg.node().parentNode.clientWidth;m=mob();H=m?320:380;var mg={l:m?30:40,r:m?10:150,t:20,b:28};svg.attr("viewBox","0 0 "+W+" "+H).attr("height",H);svg.selectAll("*").remove();
    x=d3.scaleLinear().domain([2007,2013]).range([mg.l,W-mg.r]);y=d3.scaleLinear().domain([0,260]).range([H-mg.b,mg.t]);
    var g=svg.append("g").attr("font-family",SANS);
    y.ticks(5).forEach(function(t){g.append("line").attr("x1",mg.l).attr("x2",W-mg.r).attr("y1",y(t)).attr("y2",y(t)).attr("stroke",t?C.hair:C.ink).attr("stroke-width",t?.6:1);
      g.append("text").attr("x",mg.l-6).attr("y",y(t)+4).attr("text-anchor","end").attr("font-size",11).attr("fill",C.muted).text(t)});
    g.append("text").attr("x",mg.l-6).attr("y",mg.t-8).attr("text-anchor","start").attr("font-size",11.5).attr("fill",C.muted).text("milions de tones l'any");
    d3.range(2007,2014).forEach(function(yr){g.append("text").attr("x",x(yr)).attr("y",H-mg.b+18).attr("text-anchor","middle").attr("font-size",11.5).attr("fill",C.muted).text(m&&yr%2===0?"’"+String(yr).slice(2):yr)});
    SER.forEach(function(s){var d=D[s.k];
      g.append("path").attr("d",d3.area().x(function(r){return x(r[0])}).y0(function(r){return y(r[1])}).y1(function(r){return y(r[2])})(d)).attr("fill",s.col).attr("opacity",.16);
      g.append("path").attr("d",d3.line().x(function(r){return x(r[0])}).y(function(r){return y(r[3])})(d)).attr("fill","none").attr("stroke",s.col).attr("stroke-width",2.2);
      g.selectAll(null).data(d).join("circle").attr("cx",function(r){return x(r[0])}).attr("cy",function(r){return y(r[3])}).attr("r",3.2).attr("fill","#fff").attr("stroke",s.col).attr("stroke-width",1.6);
      var last=d[d.length-1];
      if(!m){g.append("text").attr("x",x(2013)+10).attr("y",y(last[3])+4).attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink).text(s.n).append("tspan").attr("x",x(2013)+10).attr("dy",15).attr("font-weight",400).attr("fill",C.muted).text(s.s+" · mitjana "+fmt(s.k==="15"?182:s.k==="35"?132:43))}
      else g.append("text").attr("x",x(2013)).attr("y",y(last[2])-6).attr("text-anchor","end").attr("font-size",11).attr("font-weight",700).attr("fill",C.ink).text(s.n)});
    /* anotacions */
    g.append("text").attr("x",x(2007)+6).attr("y",y(226.6)-10).attr("font-size",12).attr("fill",C.ink).text("2007: 227");
    g.append("text").attr("x",x(2011)).attr("y",y(28.4)+22).attr("text-anchor","middle").attr("font-size",12).attr("fill",C.ink).text("2011: l'any amb menys pols");
    var rule=g.append("line").attr("y1",mg.t).attr("y2",H-mg.b).attr("stroke",C.ink).attr("stroke-width",.8).attr("opacity",0);
    /* ratolí: passar; tàctil: tocar (el tooltip no s'amaga en aixecar el dit) */
    function at(e){var p=d3.pointer(e),yr=clamp(Math.round(x.invert(p[0])),2007,2013);showY(yr,p)}
    svg.attr("tabindex",0).on("pointermove",at).on("pointerdown",at).on("pointerleave",function(e){if(e.pointerType==="mouse"){rule.attr("opacity",0);tip.style.opacity=0}})
      .on("keydown",function(e){var cur=+(svg.attr("data-yr")||2006);if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();cur=clamp(cur+(e.key==="ArrowRight"?1:-1),2007,2013);showY(cur,[x(cur),mg.t+20])}});
    function showY(yr,p){svg.attr("data-yr",yr);rule.attr("x1",x(yr)).attr("x2",x(yr)).attr("opacity",.5);var i=yr-2007;
      tip.innerHTML="<b>"+yr+"</b><br>"+SER.map(function(s){var r=D[s.k][i];return s.n+" ("+s.s+"): <b>"+fmt(r[3])+"</b> <span style='color:var(--muted)'>("+fmt(r[1])+"–"+fmt(r[2])+")</span>"}).join("<br>");
      tip.style.opacity=1;var w=tip.offsetWidth;tip.style.transform="translate("+clamp(x(yr)+12,0,W-w)+"px,"+(mg.t+6)+"px)"}}
  layout();addEventListener("resize",function(){safe(layout)});
}

/* ======================= arrencada ======================= */
function layoutAll(){[B,M].forEach(function(o){if(o)safe(o.layout)});if(X)safe(X.layout)}
var last=performance.now();
function loop(now){requestAnimationFrame(loop);var dt=Math.min(.05,(now-last)/1000),t=now/1000;last=now;
  if(B&&vis.b)safe(function(){if(!B.map.W)B.layout();B.frame(dt,t)});
  if(M&&vis.m)safe(function(){if(!M.map.W)M.layout();M.frame(dt,t)});
  if(X&&vis.x)safe(function(){X.frame(dt,t)})}
function start(){
  safe(initBodele);safe(initAtlantic);safe(initSAL);safe(initTrucks);safe(initBudget);safe(initYears);
  watch(document.getElementById("bgraphic").parentNode,"b");watch(document.getElementById("mgraphic").parentNode,"m");watch(document.getElementById("sal"),"x","100px 0px");
  layoutAll();requestAnimationFrame(loop);
  var rt=null;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(layoutAll,120)});
  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json").then(function(r){return r.json()}).then(function(w){
    LAND=topojson.feature(w,w.objects.land);BORD=topojson.mesh(w,w.objects.countries,function(a,b){return a!==b});
    [B,M].forEach(function(o){if(o&&o.map.W){o.map.dirty=true}})}).catch(function(e){console.error("No s'ha pogut carregar el mapa",e)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){[B,M].forEach(function(o){if(o)o.map.placeLabels(true)})});
}
/* temps de lectura, amb el mateix càlcul que El Niño i el CO₂ (218 paraules per minut + temps per figura; sense metodologia ni fonts) */
function readingTime(){var n=[].slice.call(document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")).filter(function(e){return !e.closest(".fn")}).reduce(function(a,e){return a+(e.textContent.match(/[\p{L}\p{N}·'’]+/gu)||[]).length},0);
  var figs=document.querySelectorAll(".page canvas,#trucks,#budget,#years").length,sec=n/218*60;for(var i=0;i<figs;i++)sec+=Math.max(3,12-i);
  var el=document.getElementById("rt");if(el)el.textContent=Math.max(1,Math.round(sec/60))+" min de lectura"}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){start();safe(readingTime)});else{start();safe(readingTime)}
})();
