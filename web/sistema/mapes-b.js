/* Sistema infogràfic d'Inspired by Magazine · Mapes, segona tanda (IB-28 a IB-34).
   Cada bloc «IB-nn» és una peça completa. Fa servir assets/ib-viz.js (IBV),
   la geografia de world-atlas 2.0.2 i les dades reals de dades-mapes-b.js
   (NCEP/NCAR R1, gener i juliol 1991–2020; World Ocean Atlas 2023, superfície de l'Atlàntic). */
(function(){
"use strict";
if(!window.IBV||!window.d3)return;
const V=IBV, C=V.C, DB=window.IBDATA_MAPESB||null;
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const sgn=(v,d)=>Math.abs(v)<(d===0?.5:.05)?"0":V.signed(v,d==null?1:d);
const RAD=Math.PI/180, RE=6371;
const MESOS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const llFmt=(lon,lat)=>`${f0(Math.abs(lat))}° ${lat>=0?"N":"S"}, ${f0(Math.abs(lon))}° ${lon>=0?"E":"O"}`;

/* ---------- ajudants (els de sistema.js, més capes múltiples) ---------- */
function legend(n,fn){ const el=$(`[data-lg="${n}"]`); if(el&&!el.childElementCount)fn(el); }
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,draw):{redraw(){}}; }
function landMask(proj,w,h,feature){
  const c=document.createElement("canvas"); c.width=w; c.height=h; const x=c.getContext("2d",{willReadFrequently:true});
  x.fillStyle="#000"; x.beginPath(); d3.geoPath(proj,x)(feature); x.fill();
  const im=x.getImageData(0,0,w,h).data;
  return (px,py)=>{ px=Math.round(px); py=Math.round(py); if(px<0||py<0||px>=w||py>=h)return false; return im[(py*w+px)*4+3]>0; };
}
// buida el gràfic (menys el tooltip) i fixa l'alçada
function stage(el,h){ d3.select(el).selectAll(":scope>svg,:scope>canvas").remove(); el.style.height=h+"px"; if(getComputedStyle(el).position==="static")el.style.position="relative"; }
// svg a mida real; o.label → role=img, si no aria-hidden; o.abs → apilat a sobre
function mkSvg(el,w,h,o){ o=o||{};
  const s=d3.select(el).append("svg").attr("class","ibv").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`)
    .style("font-family",V.SANS).style("overflow",o.visible?"visible":"hidden").style("display","block");
  if(o.abs)s.style("position","absolute").style("left",0).style("top",0);
  if(o.label)s.attr("role","img").attr("aria-label",o.label); else s.attr("aria-hidden","true");
  return s; }
function mkCanvas(el,w,h,o){ o=o||{};
  const dpr=Math.min(2,window.devicePixelRatio||1), c=document.createElement("canvas");
  c.className="ibv"; c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  c.style.cssText=`width:${w}px;height:${h}px;display:block;position:absolute;left:0;top:0`;
  if(o.label){ c.setAttribute("role","img"); c.setAttribute("aria-label",o.label); } else c.setAttribute("aria-hidden","true");
  el.appendChild(c); const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); return {c,ctx,dpr}; }
function legendSteps(el,o){ // llegenda per franges
  const d=d3.select(el).append("div").attr("class","ibv-lg");
  if(o.title)d.append("div").attr("class","ibv-lg-t").text(o.title);
  const n=o.colors.length, cw=o.cw||16, s=d.append("svg").attr("width",cw*n).attr("height",40).style("overflow","visible");
  o.colors.forEach((c,i)=>s.append("rect").attr("x",i*cw).attr("width",cw-1).attr("height",8).attr("fill",c));
  o.edges.forEach((v,i)=>{ if(!o.show||o.show(v)) s.append("text").attr("x",(i+1)*cw-.5).attr("y",21).attr("text-anchor","middle").attr("font-size",V.FS.min).attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(o.f?o.f(v):v); });
  if(o.lo||o.hi){ const r=s.append("g").attr("transform","translate(0,36)").attr("font-size",V.FS.min).attr("fill",C.ink2);
    if(o.lo)r.append("text").text("← "+o.lo); if(o.hi)r.append("text").attr("x",cw*n).attr("text-anchor","end").text(o.hi+" →"); }
}
// hover: marca el valor apuntat sobre la llegenda de rampa (guia fins a l'escala)
function rampMark(n,v,min,max,txt){ const el=$(`[data-lg="${n}"]`), sv=el&&el.querySelector(".ibv-lg svg"); if(!sv)return;
  const s=d3.select(sv), w=+s.attr("width");
  let g=s.select("g.ibx-mk"); if(g.empty()){ g=s.append("g").attr("class","ibx-mk").attr("pointer-events","none"); g.append("line"); g.append("path"); g.append("text"); }
  const tx=s.selectAll(":scope>text").style("transition","opacity .15s");
  if(v==null){ g.style("display","none"); tx.style("opacity",null); return; }
  const x=Math.max(0,Math.min(w,(v-min)/(max-min)*w)); g.style("display",null);
  g.select("line").attr("x1",x).attr("x2",x).attr("y1",-2).attr("y2",11).attr("stroke",C.ink).attr("stroke-width",1.5);
  g.select("path").attr("d",`M${x-4},-7L${x+4},-7L${x},-2Z`).attr("fill",C.ink);
  g.select("text").attr("x",Math.max(16,Math.min(w-16,x))).attr("y",22).attr("text-anchor","middle").attr("font-size",11.5).attr("font-weight",700).attr("fill",C.ink).call(V.halo,4).style("font-variant-numeric","tabular-nums").text(txt);
  tx.style("opacity",.48); }
// hover: ressalta una franja de la llegenda per franges
function stepsMark(n,k,txt){ const el=$(`[data-lg="${n}"]`), sv=el&&el.querySelector(".ibv-lg svg"); if(!sv)return;
  const s=d3.select(sv), rs=s.selectAll(":scope>rect").style("transition","opacity .15s"), tx=s.selectAll(":scope>text").style("transition","opacity .15s");
  let g=s.select("g.ibx-mk"); if(g.empty()){ g=s.append("g").attr("class","ibx-mk").attr("pointer-events","none"); g.append("rect"); g.append("text"); }
  if(k==null){ g.style("display","none"); rs.style("opacity",null); tx.style("opacity",null); return; }
  const cw=+rs.attr("width")+1, x=k*cw; g.style("display",null); rs.style("opacity",(d,i)=>i===k?1:.5); tx.style("opacity",.48);
  g.select("rect").attr("x",x-1).attr("y",-2).attr("width",cw+1).attr("height",12).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
  g.select("text").attr("x",Math.max(16,Math.min(cw*rs.size()-16,x+cw/2))).attr("y",22).attr("text-anchor","middle").attr("font-size",11.5).attr("font-weight",700).attr("fill",C.ink).call(V.halo,4).style("font-variant-numeric","tabular-nums").text(txt); }
const ord=n=>n+"a";   // 1a, 2a… (femení)
function arrowHead(g,x,y,ang,o){ o=o||{}; const L=o.L||6;
  return g.append("path").attr("d",`M${x-L*Math.cos(ang-.45)},${y-L*Math.sin(ang-.45)}L${x},${y}L${x-L*Math.cos(ang+.45)},${y-L*Math.sin(ang+.45)}`)
    .attr("fill","none").attr("stroke",o.stroke||C.ink).attr("stroke-width",o.sw||1.1).attr("stroke-linejoin","round"); }
const textW=(s,size)=>s.length*(size||12.5)*.53;   // amplada aproximada (Source Sans)

/* ---------- geografia ---------- */
let W=null;                  // world-atlas 110m (IBV.world)
let W50=null, w50P=null;     // world-atlas 50m, només per a la lupa (IB-34)
function world50(){ if(!w50P)w50P=fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json").then(r=>r.json()).then(tp=>(W50={
  land:topojson.merge(tp,tp.objects.countries.geometries.filter(g=>g.properties.name!=="Antarctica")), borders:topojson.mesh(tp,tp.objects.countries,(a,b)=>a!==b)})).catch(()=>null); return w50P; }
const NOMS={"Fiji":"Fiji","Tanzania":"Tanzània","W. Sahara":"Sàhara Occidental","Canada":"Canadà","United States of America":"Estats Units","Kazakhstan":"Kazakhstan","Uzbekistan":"Uzbekistan","Papua New Guinea":"Papua Nova Guinea","Indonesia":"Indonèsia","Argentina":"Argentina","Chile":"Xile","Dem. Rep. Congo":"República Democràtica del Congo","Somalia":"Somàlia","Kenya":"Kenya","Sudan":"Sudan","Chad":"Txad","Haiti":"Haití","Dominican Rep.":"República Dominicana","Russia":"Rússia","Bahamas":"Bahames","Falkland Is.":"Illes Malvines","Norway":"Noruega","Greenland":"Groenlàndia","Fr. S. Antarctic Lands":"Terres Australs i Antàrtiques Franceses","Timor-Leste":"Timor Oriental","South Africa":"Sud-àfrica","Lesotho":"Lesotho","Mexico":"Mèxic","Uruguay":"Uruguai","Brazil":"Brasil","Bolivia":"Bolívia","Peru":"Perú","Colombia":"Colòmbia","Panama":"Panamà","Costa Rica":"Costa Rica","Nicaragua":"Nicaragua","Honduras":"Hondures","El Salvador":"El Salvador","Guatemala":"Guatemala","Belize":"Belize","Venezuela":"Veneçuela","Guyana":"Guyana","Suriname":"Surinam","France":"França","Ecuador":"Equador","Puerto Rico":"Puerto Rico","Jamaica":"Jamaica","Cuba":"Cuba","Zimbabwe":"Zimbàbue","Botswana":"Botswana","Namibia":"Namíbia","Senegal":"Senegal","Mali":"Mali","Mauritania":"Mauritània","Benin":"Benín","Niger":"Níger","Nigeria":"Nigèria","Cameroon":"Camerun","Togo":"Togo","Ghana":"Ghana","Côte d'Ivoire":"Costa d'Ivori","Guinea":"Guinea","Guinea-Bissau":"Guinea Bissau","Liberia":"Libèria","Sierra Leone":"Sierra Leone","Burkina Faso":"Burkina Faso","Central African Rep.":"República Centreafricana","Congo":"Congo","Gabon":"Gabon","Eq. Guinea":"Guinea Equatorial","Zambia":"Zàmbia","Malawi":"Malawi","Mozambique":"Moçambic","eSwatini":"Eswatini","Angola":"Angola","Burundi":"Burundi","Israel":"Israel","Lebanon":"Líban","Madagascar":"Madagascar","Palestine":"Palestina","Gambia":"Gàmbia","Tunisia":"Tunísia","Algeria":"Algèria","Jordan":"Jordània","United Arab Emirates":"Emirats Àrabs Units","Qatar":"Qatar","Kuwait":"Kuwait","Iraq":"Iraq","Oman":"Oman","Vanuatu":"Vanuatu","Cambodia":"Cambodja","Thailand":"Tailàndia","Laos":"Laos","Myanmar":"Myanmar","Vietnam":"Vietnam","North Korea":"Corea del Nord","South Korea":"Corea del Sud","Mongolia":"Mongòlia","India":"Índia","Bangladesh":"Bangladesh","Bhutan":"Bhutan","Nepal":"Nepal","Pakistan":"Pakistan","Afghanistan":"Afganistan","Tajikistan":"Tadjikistan","Kyrgyzstan":"Kirguizistan","Turkmenistan":"Turkmenistan","Iran":"Iran","Syria":"Síria","Armenia":"Armènia","Sweden":"Suècia","Belarus":"Belarús","Ukraine":"Ucraïna","Poland":"Polònia","Austria":"Àustria","Hungary":"Hongria","Moldova":"Moldàvia","Romania":"Romania","Lithuania":"Lituània","Latvia":"Letònia","Estonia":"Estònia","Germany":"Alemanya","Bulgaria":"Bulgària","Greece":"Grècia","Turkey":"Turquia","Albania":"Albània","Croatia":"Croàcia","Switzerland":"Suïssa","Luxembourg":"Luxemburg","Belgium":"Bèlgica","Netherlands":"Països Baixos","Portugal":"Portugal","Spain":"Espanya","Ireland":"Irlanda","New Caledonia":"Nova Caledònia","Solomon Is.":"Illes Salomó","New Zealand":"Nova Zelanda","Australia":"Austràlia","Sri Lanka":"Sri Lanka","China":"Xina","Taiwan":"Taiwan","Italy":"Itàlia","Denmark":"Dinamarca","United Kingdom":"Regne Unit","Iceland":"Islàndia","Azerbaijan":"Azerbaidjan","Georgia":"Geòrgia","Philippines":"Filipines","Malaysia":"Malàisia","Brunei":"Brunei","Slovenia":"Eslovènia","Finland":"Finlàndia","Slovakia":"Eslovàquia","Czechia":"Txèquia","Eritrea":"Eritrea","Japan":"Japó","Paraguay":"Paraguai","Yemen":"Iemen","Saudi Arabia":"Aràbia Saudita","Antarctica":"Antàrtida","N. Cyprus":"Xipre del Nord","Cyprus":"Xipre","Morocco":"Marroc","Egypt":"Egipte","Libya":"Líbia","Ethiopia":"Etiòpia","Djibouti":"Djibouti","Somaliland":"Somalilàndia","Uganda":"Uganda","Rwanda":"Ruanda","Bosnia and Herz.":"Bòsnia i Hercegovina","Macedonia":"Macedònia del Nord","Serbia":"Sèrbia","Montenegro":"Montenegro","Kosovo":"Kosovo","Trinidad and Tobago":"Trinitat i Tobago","S. Sudan":"Sudan del Sud"};
const nomCA=f=>NOMS[f.properties.name]||f.properties.name;
// troba el país que conté un punt (caixa ràpida + geoContains)
let NOANT=null; // terra sense l'Antàrtida (les còniques no la poden dibuixar)
const landNoAnt=()=>NOANT||(NOANT={type:"FeatureCollection",features:W.countries.features.filter(f=>f.properties.name!=="Antarctica")});
let FIND=null;
function findCountry(lon,lat){
  if(!FIND){ const fs=W.countries.features, bb=fs.map(f=>d3.geoBounds(f)); FIND={fs,bb}; }
  for(let i=0;i<FIND.fs.length;i++){ const b=FIND.bb[i];
    if(lat<b[0][1]-.01||lat>b[1][1]+.01)continue;
    const inLon=b[0][0]<=b[1][0]?(lon>=b[0][0]-.01&&lon<=b[1][0]+.01):(lon>=b[0][0]||lon<=b[1][0]);
    if(inLon&&d3.geoContains(FIND.fs[i],[lon,lat]))return FIND.fs[i]; }
  return null; }

/* ---------- dades NCEP (gener i juliol) ---------- */
const NC=DB&&DB.ncep;
// les dades venen en text compacte (2 caràcters per valor, "!" = sense dada); es descodifiquen la primera vegada que cal
function dec(str,n){ const A=DB.A, B=A.length, off=DB.off, map=new Int16Array(128).fill(-1); for(let i=0;i<B;i++)map[A.charCodeAt(i)]=i;
  const o=new Float32Array(n); let p=0; for(let k=0;k<n;k++){ const c=str.charCodeAt(p); if(c===33){ o[k]=NaN; p++; continue; } o[k]=(map[c]*B+map[str.charCodeAt(p+1)]-off)/10; p+=2; } return o; }
let NCJ=null, NCL=null, ANJ=null, ANL=null;
function ncInit(){ if(NCJ||!NC)return; NCJ=dec(NC.jan,73*144); NCL=dec(NC.jul,73*144); ANJ=zonalAnom(NCJ); ANL=zonalAnom(NCL); }
function zonalAnom(a){ const o=new Float32Array(a.length); for(let i=0;i<73;i++){ let m=0; for(let j=0;j<144;j++)m+=a[i*144+j]; m/=144; for(let j=0;j<144;j++)o[i*144+j]=a[i*144+j]-m; } return o; }
function ncAt(a,lon,lat){ // interpolació bilineal a la graella de 2,5°
  const x=(((lon%360)+360)%360)/2.5, y=Math.max(0,Math.min(72,(90-lat)/2.5));
  const x0=Math.floor(x)%144, y0=Math.min(71,Math.floor(y)), fx=x-Math.floor(x), fy=y-y0, x1=(x0+1)%144;
  return (a[y0*144+x0]*(1-fx)+a[y0*144+x1]*fx)*(1-fy)+(a[(y0+1)*144+x0]*(1-fx)+a[(y0+1)*144+x1]*fx)*fy; }
function ncNear(a,lon,lat){ const i=Math.round((90-lat)/2.5), j=Math.round((((lon%360)+360)%360)/2.5)%144; return a[Math.max(0,Math.min(72,i))*144+j]; }


/* =====================================================================
   IB-28 · CAMP DE VENT ANIMAT  (simulació + mapa real)
   ===================================================================== */
const SPD28=d3.scaleSequential(V.seqInterp(C.blau)).domain([-28,112]).clamp(true);
legend(28,el=>V.legendRamp(el,{scale:SPD28,min:0,max:110,ticks:[25,50,75,100],f:f0,title:"Velocitat del vent simulat (km/h)",lo:"Més fluix",hi:"Més fort"}));
// remolins: [lon, lat, radi (km), velocitat màxima (m/s), sentit (+1 antihorari), entrada (−) o sortida (+)]
const VX28=[[-27,58,760,22,1,-.22],[17,64,520,13,1,-.2],[-33,36,950,10,-1,.12]];
function wind28(lon,lat){ // vent simulat (u cap a l'est, v cap al nord), m/s
  let u=0,v=0;
  const a=(lon+75)*Math.PI/60, ph=50+7*Math.sin(a), sl=7*Math.PI/60*Math.cos(a)/Math.cos(lat*RAD), S=19*Math.exp(-(((lat-ph)/5.5)**2)), an=Math.atan(sl);
  u+=S*Math.cos(an)+6*Math.exp(-(((lat-52)/13)**2)); v+=S*Math.sin(an);
  const tr=Math.exp(-(((lat-17)/7)**2)); u-=8*tr; v-=2.4*tr;
  for(const c of VX28){ const k=Math.cos(c[1]*RAD)*111.2, dx=(lon-c[0])*k, dy=(lat-c[1])*111.2, r=Math.hypot(dx,dy)+1e-6, q=r/c[2], vt=c[3]*q*Math.exp(1-q);
    u+=vt*(-dy/r*c[4]+c[5]*dx/r); v+=vt*(dx/r*c[4]+c[5]*dy/r); }
  return [u*.57,v*.57]; }   // escalat perquè el màxim sigui d'uns 105 km/h
const DIRS=["del nord","del nord-est","de l'est","del sud-est","del sud","del sud-oest","de l'oest","del nord-oest"];
let PAUSE28=false;
const M28=piece(28,(el,w)=>{
  if(!W){ V.world().then(x=>{W=x;M28.redraw();}); return; }
  if(el._loop){ el._loop.stop(); el._loop=null; }
  const mob=w<640, h=Math.round(mob?Math.min(w*1.08,460):Math.min(w*.54,600));
  const box=mob?{lon:[-58,26],lat:[30,70]}:{lon:[-84,38],lat:[20,72]}, pts=[];
  for(let lo=box.lon[0];lo<=box.lon[1];lo+=2)pts.push([lo,box.lat[0]],[lo,box.lat[1]]);
  for(let la=box.lat[0];la<=box.lat[1];la+=2)pts.push([box.lon[0],la],[box.lon[1],la]);
  const proj=d3.geoConicConformal().parallels([35,65]).rotate([-(box.lon[0]+box.lon[1])/2,0]).fitSize([w,h],{type:"MultiPoint",coordinates:pts});
  const path=d3.geoPath(proj);
  stage(el,h);
  const bg=mkSvg(el,w,h,{abs:true,label:"Mapa de l'Atlàntic nord i Europa amb milers de partícules que segueixen un vent simulat: una franja ràpida de vents de l'oest que ondula, una borrasca que gira en sentit antihorari al sud d'Islàndia i un anticicló que gira en sentit horari més al sud. Simulació."});
  const {c:cnv,ctx}=mkCanvas(el,w,h);
  cnv.style.transition="opacity .15s";
  const fg=mkSvg(el,w,h,{abs:true});
  const base=bg.append("g").style("opacity",0);
  base.append("path").attr("d",path(d3.geoGraticule().step([10,10])())).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.6);
  base.append("path").attr("d",path(landNoAnt())).attr("fill",C.land);
  base.append("path").attr("d",path(W.borders)).attr("fill","none").attr("stroke","#fff").attr("stroke-width",.7);

  // partícules: el vent es precalcula una vegada en una reixa de la pantalla (px per fotograma i franja de velocitat),
  // i cada fotograma només fa una interpolació bilineal: cap projecció ni trigonometria dins del bucle
  const N=Math.min(mob?1700:3800,Math.round(w*h/(mob?80:115))), KT=mob?11:14, BINS=6;
  const pxDeg=proj.scale()*RAD, cstep=(mob?1.05:1.3)/11.5/pxDeg, rnd=V.rng(28);
  const G=6, GW=Math.ceil(w/G)+2, GH=Math.ceil(h/G)+2, VXg=new Float32Array(GW*GH), VYg=new Float32Array(GW*GH), SB=new Uint8Array(GW*GH);
  for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){ const x=gx*G, y=gy*G, ll=proj.invert([x,y]), q=gy*GW+gx; if(!ll)continue;
    const wv=wind28(ll[0],ll[1]), la=Math.min(84,ll[1]), p1=proj([ll[0]+wv[0]*cstep/Math.cos(la*RAD),la+wv[1]*cstep]);
    if(p1){ VXg[q]=p1[0]-x; VYg[q]=p1[1]-y; } SB[q]=Math.min(BINS-1,Math.floor(Math.hypot(wv[0],wv[1])*3.6/110*BINS)); }
  const XS=new Float32Array(N*KT), YS=new Float32Array(N*KT), HD=new Uint8Array(N), NN=new Uint8Array(N), AGE=new Uint16Array(N), MAX=new Uint16Array(N), PB=new Uint8Array(N);
  function spawn(i,pre){ const x=rnd()*w, y=rnd()*h; MAX[i]=60+(rnd()*120|0); AGE[i]=pre?(rnd()*MAX[i]|0):0; NN[i]=1; HD[i]=0; XS[i*KT]=x; YS[i*KT]=y; }
  for(let i=0;i<N;i++)spawn(i,true);
  function stepAll(n,dt){ const f=Math.min(3,dt/16.7);
    for(let i=0;i<n;i++){
      if(AGE[i]++>MAX[i]){ spawn(i,false); continue; }
      const o=i*KT+HD[i], x=XS[o], y=YS[o], fx=x/G, fy=y/G, gx=fx|0, gy=fy|0;
      if(x<0||y<0||gx>=GW-1||gy>=GH-1){ spawn(i,false); continue; }
      const ax=fx-gx, ay=fy-gy, q=gy*GW+gx;
      const vx=(VXg[q]*(1-ax)+VXg[q+1]*ax)*(1-ay)+(VXg[q+GW]*(1-ax)+VXg[q+GW+1]*ax)*ay;
      const vy=(VYg[q]*(1-ax)+VYg[q+1]*ax)*(1-ay)+(VYg[q+GW]*(1-ax)+VYg[q+GW+1]*ax)*ay;
      const nx=x+vx*f, ny=y+vy*f;
      if(nx<-8||nx>w+8||ny<-8||ny>h+8){ spawn(i,false); continue; }
      HD[i]=(HD[i]+1)%KT; XS[i*KT+HD[i]]=nx; YS[i*KT+HD[i]]=ny; if(NN[i]<KT)NN[i]++; PB[i]=SB[q]; } }
  const binCol=d3.range(BINS).map(b=>SPD28((b+.5)*110/BINS));
  const IDX=d3.range(BINS).map(()=>new Uint32Array(N)), CNT=new Uint32Array(BINS);
  function draw(n){
    ctx.clearRect(0,0,w,h); CNT.fill(0);
    for(let i=0;i<n;i++){ const b=PB[i]; IDX[b][CNT[b]++]=i; }
    ctx.lineCap="round";
    for(let k=0;k<KT-1;k++){ const al=.92*Math.pow(1-k/(KT-1),1.25); if(al<.02)continue;
      for(let b=0;b<BINS;b++){ const c=CNT[b], ix=IDX[b]; if(!c)continue;
        ctx.strokeStyle=binCol[b]; ctx.globalAlpha=al; ctx.lineWidth=b>=3?1.35:1.05; ctx.beginPath();
        for(let t=0;t<c;t++){ const i=ix[t]; if(NN[i]-1<=k)continue; const a=i*KT+(HD[i]-k+KT)%KT, bb=i*KT+(HD[i]-k-1+KT)%KT;
          ctx.moveTo(XS[a],YS[a]); ctx.lineTo(XS[bb],YS[bb]); }
        ctx.stroke(); } }
    ctx.globalAlpha=1; }

  // anotacions: centres dels remolins i el corrent en jet
  const ann=fg.append("g").style("opacity",0);
  const Lc=proj([VX28[0][0],VX28[0][1]]), Hc=proj([VX28[2][0],VX28[2][1]]);
  [[Lc,"B"],[Hc,"A"]].forEach(([p,t])=>V.t(ann,p[0],p[1]+6,t,{anchor:"middle",serif:true,weight:700,size:17,fill:C.ink,halo:true}));
  V.note(ann,{x:Lc[0]+9,y:Lc[1]-8,tx:Lc[0]+(mob?30:56),ty:Lc[1]-(mob?54:70),kind:"elbow",anchor:"start",lines:[["Borrasca",true],["gira en sentit antihorari"]],size:mob?12:12.5});
  V.note(ann,{x:Hc[0]+9,y:Hc[1]+4,tx:Hc[0]+(mob?28:60),ty:Hc[1]+(mob?50:60),kind:"elbow",anchor:"start",lines:[["Anticicló",true],["gira en sentit horari"]],size:mob?12:12.5});
  if(!mob){ const jl=-64, jp=proj([jl,50+7*Math.sin((jl+75)*Math.PI/60)]);
    V.note(ann,{x:jp[0],y:jp[1]+6,tx:jp[0]-30,ty:jp[1]+78,kind:"elbow",anchor:"end",lines:[["Corrent en jet",true],["la franja més ràpida, en blau fosc"]]}); }

  // estat de hover: línia de corrent que passa pel punt
  const hl=fg.append("g").attr("pointer-events","none"), tp=V.tip(el);
  // velocitats de tota la vista, per dir on és el punt respecte a la resta
  const SPS=[]; for(let gy=8;gy<h;gy+=h/24)for(let gx=8;gx<w;gx+=w/40){ const q=proj.invert([gx,gy]); if(q){ const v=wind28(q[0],q[1]); SPS.push(Math.hypot(v[0],v[1])); } } SPS.sort((a,b)=>a-b);
  const hit=fg.append("rect").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
  function trace(ll,dir,n){ const out=[ll.slice()]; let lo=ll[0], la=ll[1];
    for(let i=0;i<n;i++){ const wv=wind28(lo,la), s=Math.hypot(wv[0],wv[1])+1e-6, km=45*dir;
      la+=wv[1]/s*km/111.2; lo+=wv[0]/s*km/(111.2*Math.cos(la*RAD)); if(la>84)break; out.push([lo,la]); }
    return out; }
  V.hover(hit.node(),(ev,[px,py])=>{
    const ll=proj.invert([px,py]); if(!ll)return;
    const wv=wind28(ll[0],ll[1]), sp=Math.hypot(wv[0],wv[1]), to=(90-Math.atan2(wv[1],wv[0])/RAD+360)%360, from=(to+180)%360;
    const fw=trace(ll,1,mob?34:52).map(proj), bw=trace(ll,-1,mob?16:26).map(proj).reverse();
    const line=bw.concat(fw.slice(1)).filter(Boolean);
    hl.selectAll("*").remove();
    hl.append("path").attr("d",d3.line().curve(d3.curveBasis)(line)).attr("fill","none").attr("stroke","#fff").attr("stroke-width",4.5).attr("stroke-linecap","round");
    hl.append("path").attr("d",d3.line().curve(d3.curveBasis)(line)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4).attr("stroke-linecap","round");
    const e=line[line.length-1], e0=line[Math.max(0,line.length-3)]; arrowHead(hl,e[0],e[1],Math.atan2(e[1]-e0[1],e[0]-e0[0]),{L:7,sw:1.4});
    hl.append("circle").attr("cx",px).attr("cy",py).attr("r",12).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
    hl.append("circle").attr("cx",px).attr("cy",py).attr("r",4.5).attr("fill",SPD28(sp*3.6)).attr("stroke",C.ink).attr("stroke-width",1.5);
    const dir=DIRS[Math.round(from/45)%8], right=px<w-150;
    V.lines(hl,px+(right?18:-18),py-6,[[`${f0(sp*3.6)} km/h`,true],[`vent ${dir}`]],{anchor:right?"start":"end",halo:true,size:12.5});
    cnv.style.opacity=.55; ann.style("opacity",.5);
    rampMark(28,sp*3.6,0,110,f0(sp*3.6)+" km/h");
    const pc=Math.round(d3.bisect(SPS,sp)/SPS.length*100), pct=pc>=99?"entre els més forts del mapa":pc<=1?"entre els més fluixos del mapa":`més fort que el ${pc} % del mapa`;
    tp.show(`<b>Vent ${dir}</b> <span style="display:inline-block;transform:rotate(${to.toFixed(0)}deg)">↑</span><br>${f0(sp*3.6)} km/h (simulat)<br><span style="color:${C.muted}">${pct} · ${llFmt(ll[0],ll[1])}</span>`,px,py);
  },()=>{ hl.selectAll("*").remove(); cnv.style.opacity=1; ann.style("opacity",1); tp.hide(); rampMark(28,null); });

  // moviment
  if(V.reduced){ for(let k=0;k<KT;k++)stepAll(N,16.7); draw(N); base.style("opacity",1); ann.style("opacity",1); return; }
  let t0=null;
  V.onView(el,instant=>{
    t0=instant?-1e9:null;
    base.transition().duration(instant?0:700).style("opacity",1);
    ann.transition().delay(instant?0:1500).duration(instant?0:600).style("opacity",1);
    el._loop=V.loop(el,(t,dt)=>{ if(t0===null)t0=t; const n=Math.min(N,Math.round(N*Math.max(0,(t-t0))/1800));
      if(PAUSE28&&n>=N)return; stepAll(n,dt||16.7); draw(n); });
  });
});
(function(){ const b=$('[data-play="28"]'); if(!b)return; if(V.reduced){ b.hidden=true; return; }
  b.addEventListener("click",()=>{ PAUSE28=!PAUSE28; b.textContent=PAUSE28?"Reprodueix":"Atura"; b.setAttribute("aria-pressed",PAUSE28?"true":"false"); }); })();


/* =====================================================================
   IB-29 · MAPA BIVARIANT  (dades reals: NCEP/NCAR R1 + mapa real)
   ===================================================================== */
function mixBiv(i,j){ const n=d3.lab(C.neutral), r=d3.lab(C.vermell), b=d3.lab(C.blau), ti=i/2, tj=j/2, k=1-.33*ti*tj;
  return d3.lab(n.l+((r.l-n.l)*ti+(b.l-n.l)*tj)*k, n.a+(r.a-n.a)*ti+(b.a-n.a)*tj, n.b+(r.b-n.b)*ti+(b.b-n.b)*tj).formatHex(); }
const BIV=[0,1,2].map(i=>[0,1,2].map(j=>mixBiv(i,j)));   // i: temperatura (vermell), j: diferència (blau)
const CLT=["baixa","mitjana","alta"], CLA=["petita","mitjana","gran"];
const BV={hl:null,mark:null,S:null,cut:null};
let ST29=null;
function stats29(){ if(ST29)return ST29;
  const feats=W.countries.features.filter(f=>f.properties.name!=="Antarctica");
  // cada país es pinta amb un color-codi en una graella equirectangular de 0,5° i es llegeix al centre de cada cel·la de 2,5°
  const cw=720,ch=360, cv=document.createElement("canvas"); cv.width=cw; cv.height=ch;
  const x=cv.getContext("2d",{willReadFrequently:true}), pr=d3.geoEquirectangular().scale(cw/(2*Math.PI)).translate([cw/2,ch/2]), pa=d3.geoPath(pr,x);
  const code=k=>[k,(k*37)&255,(k*91+13)&255];
  feats.forEach((f,k)=>{ x.fillStyle=`rgb(${code(k+1)})`; x.beginPath(); pa(f); x.fill(); });
  const im=x.getImageData(0,0,cw,ch).data, acc=feats.map(()=>({n:0,sw:0,a:0,b:0}));
  for(let i=0;i<73;i++){ const lat=90-i*2.5, wt=Math.max(.04,Math.cos(lat*RAD));
    for(let j=0;j<144;j++){ let lon=j*2.5; if(lon>=180)lon-=360;
      const px=Math.min(cw-1,Math.round((lon+180)*2)), py=Math.min(ch-1,i*5), o=(py*cw+px)*4, k=im[o];
      if(!k||im[o+3]<255)continue; const c=code(k); if(im[o+1]!==c[1]||im[o+2]!==c[2]||k>feats.length)continue;
      const A=acc[k-1], jn=NCJ[i*144+j], jl=NCL[i*144+j]; A.n++; A.sw+=wt; A.a+=wt*(jn+jl)/2; A.b+=wt*Math.abs(jl-jn); } }
  const S=feats.map((f,k)=>{ const A=acc[k]; let mean,amp;
    if(A.n){ mean=A.a/A.sw; amp=A.b/A.sw; } else { const c=d3.geoCentroid(f), jn=ncAt(NCJ,c[0],c[1]), jl=ncAt(NCL,c[0],c[1]); mean=(jn+jl)/2; amp=Math.abs(jl-jn); }
    return {f,name:nomCA(f),mean,amp,cells:A.n,area:d3.geoArea(f),c:d3.geoCentroid(f)}; });
  const qm=d3.sort(S.map(d=>d.mean)), qa=d3.sort(S.map(d=>d.amp));
  const cut={m:[d3.quantileSorted(qm,1/3),d3.quantileSorted(qm,2/3)],a:[d3.quantileSorted(qa,1/3),d3.quantileSorted(qa,2/3)]};
  S.forEach(d=>{ d.i=d.mean<cut.m[0]?0:d.mean<cut.m[1]?1:2; d.j=d.amp<cut.a[0]?0:d.amp<cut.a[1]?1:2; });
  BV.cut=cut; ST29=S; return S; }
// llegenda: quadrat 3×3 girat 45°
function legend29(el){
  const cs=24, W0=250, H0=200, cx=W0/2, cy=H0-82;
  const wrap=d3.select(el).append("div").attr("class","ibv-lg ibx-biv");
  wrap.append("div").attr("class","ibv-lg-t").text("Cada país, segons dues variables");
  const s=wrap.append("svg").attr("width",W0).attr("height",H0).style("overflow","visible").attr("role","group").attr("aria-label","Llegenda bivariant: passa per una cel·la per ressaltar-ne els països");
  const P=(u,v)=>[cx+(u-v)*cs*Math.SQRT1_2,cy-(u+v)*cs*Math.SQRT1_2];
  const cells=[]; for(let i=0;i<3;i++)for(let j=0;j<3;j++)cells.push({i,j});
  const cg=s.append("g");
  const cp=cg.selectAll("path").data(cells).join("path")
    .attr("d",d=>"M"+[P(d.i,d.j),P(d.i+1,d.j),P(d.i+1,d.j+1),P(d.i,d.j+1)].join("L")+"Z")
    .attr("fill",d=>BIV[d.i][d.j]).attr("stroke","#fff").attr("stroke-width",1.2).attr("tabindex",0)
    .attr("aria-label",d=>`Temperatura ${CLT[d.i]}, diferència ${CLA[d.j]}`).style("cursor","pointer").style("outline","none");
  const mk=s.append("path").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6).attr("pointer-events","none").style("display","none");
  const t=(x,y,str,rot,o)=>{ const n=s.append("text").attr("transform",`translate(${x},${y}) rotate(${rot})`).attr("text-anchor",(o&&o.anchor)||"middle")
    .attr("font-size",(o&&o.size)||11.5).attr("fill",(o&&o.fill)||C.ink2).style("font-variant-numeric","tabular-nums").text(str); if(o&&o.bold)n.attr("font-weight",700); return n; };
  // eixos al llarg de les dues vores de baix
  const a1=P(1.5,0), a2=P(0,1.5), o=17*Math.SQRT1_2;
  t(a1[0]+o,a1[1]+o+4,"Temperatura →",-45,{fill:C.ink});
  t(a2[0]-o,a2[1]+o+4,"← Diferència",45,{fill:C.ink});
  const cut1=s.append("text").attr("x",cx).attr("y",H0-34).attr("text-anchor","middle").attr("font-size",11.5).attr("fill",C.muted).style("font-variant-numeric","tabular-nums");
  const cut2=s.append("text").attr("x",cx).attr("y",H0-20).attr("text-anchor","middle").attr("font-size",11.5).attr("fill",C.muted).style("font-variant-numeric","tabular-nums");
  const cap=s.append("text").attr("x",cx).attr("y",H0-2).attr("font-weight",700).attr("text-anchor","middle").attr("font-size",11.5).attr("fill",C.ink2).style("font-variant-numeric","tabular-nums");
  function ticks(){ if(!BV.cut||s.select(".tk").size())return; const g=s.append("g").attr("class","tk");
    const q=5*Math.SQRT1_2;
    BV.cut.m.forEach((v,k)=>{ const p=P(k+1,0); g.append("line").attr("x1",p[0]).attr("y1",p[1]).attr("x2",p[0]+q).attr("y2",p[1]+q).attr("stroke",C.muted); });
    BV.cut.a.forEach((v,k)=>{ const p=P(0,k+1); g.append("line").attr("x1",p[0]).attr("y1",p[1]).attr("x2",p[0]-q).attr("y2",p[1]+q).attr("stroke",C.muted); });
    cut1.text(`Temperatura: talls a ${f0(BV.cut.m[0])} i ${f0(BV.cut.m[1])} °C`); cut2.text(`Diferència: talls a ${f0(BV.cut.a[0])} i ${f0(BV.cut.a[1])} °C`); }
  BV.ticks=ticks;
  let pinned=null;
  const on=d=>{ const n=BV.S?BV.S.filter(x=>x.i===d.i&&x.j===d.j).length:0; cap.text(`${n} països en aquesta cel·la`);
    V.focus(cp,x=>x===d,{dim:.35}); if(BV.hl)BV.hl(d.i,d.j); };
  const off=()=>{ cap.text(""); V.focus(cp,null); if(BV.hl)BV.hl(null); };
  cp.on("pointerenter",(ev,d)=>{ if(ev.pointerType==="mouse")on(d); }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse"&&!pinned)off(); })
    .on("pointerdown",(ev,d)=>{ if(ev.pointerType==="mouse")return; if(pinned===d){ pinned=null; off(); } else { pinned=d; on(d); } })
    .on("focus",(ev,d)=>on(d)).on("blur",off);
  document.addEventListener("pointerdown",ev=>{ if(pinned&&ev.pointerType!=="mouse"&&!s.node().contains(ev.target)){ pinned=null; off(); } });
  BV.cap=t=>cap.text(t||"");
  BV.mark=(i,j)=>{ if(i==null){ mk.style("display","none"); return; } mk.style("display",null).attr("d","M"+[P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)].join("L")+"Z"); };
}
legend(29,legend29);
const M29=piece(29,(el,w)=>{
  if(!W||!NC){ if(!W)V.world().then(x=>{W=x;M29.redraw();}); return; }
  ncInit();
  const S=stats29(); BV.S=S; if(BV.ticks)BV.ticks();
  const mob=w<640, fc={type:"FeatureCollection",features:S.map(d=>d.f)};
  const proj=d3.geoEqualEarth().fitWidth(w,fc), path=d3.geoPath(proj), h=Math.ceil(path.bounds(fc)[1][1])+4;
  stage(el,h);
  const s=mkSvg(el,w,h,{label:"Mapa del món amb cada país pintat segons dues variables reals: la mitjana de la temperatura de gener i juliol i la diferència entre tots dos mesos. Els països tropicals surten en vermell (calents, amb poca diferència) i els de l'interior d'Àsia i del nord d'Amèrica en blau (grans diferències)."});
  const g=s.append("g");
  const cp=g.append("g").selectAll("path").data(S).join("path").attr("d",d=>path(d.f)).attr("stroke","#fff").attr("stroke-width",.5).attr("fill",C.land);
  const ol=g.append("path").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).attr("pointer-events","none");
  s.style("cursor","pointer");
  // anotacions calculades amb les dades
  const ann=g.append("g").style("opacity",0);
  const big=S.filter(d=>d.area>.03), A=d3.greatest(big,d=>d.amp), B=d3.greatest(S.filter(d=>d.i===2&&d.j===0),d=>d.area);
  const pa=proj(A.c), pb=proj(B.c);
  if(!mob)V.note(ann,{x:pa[0],y:pa[1],tx:mob?pa[0]-20:w-150,ty:mob?pa[1]+46:pa[1]+64,kind:"elbow",dot:true,anchor:mob?"end":"start",lines:[[A.name,true],[`${f0(A.amp)} °C de gener a juliol`]],size:mob?12:12.5});
  if(!mob)V.note(ann,{x:pb[0],y:pb[1],tx:pb[0]-60,ty:pb[1]+70,kind:"elbow",dot:true,anchor:"end",lines:[[B.name,true],[`${f0(B.mean)} °C de mitjana, ${f0(B.amp)} °C de diferència`]]});
  // interacció
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  BV.hl=(i,j)=>{ if(i==null){ V.focus(cp,null); ann.transition().duration(160).style("opacity",1); return; } ann.transition().duration(160).style("opacity",.5); V.focus(cp,d=>d.i===i&&d.j===j,{dim:.48}); };
  // hover: el país (o el més proper, per als petits) i el seu grup de la reixa
  const cen=S.map(d=>({d,p:proj(d.c)})), rkA=new Map(d3.sort(S,d=>-d.amp).map((d,k)=>[d,k+1])), rkM=new Map(d3.sort(S,d=>-d.mean).map((d,k)=>[d,k+1]));
  const hv=g.append("g").attr("pointer-events","none");
  let cur=null;
  function off(){ cur=null; ol.attr("d",null); hv.selectAll("*").remove(); tp.hide(); V.focus(cp,null); ann.interrupt().style("opacity",1); if(BV.mark)BV.mark(null); if(BV.cap)BV.cap(""); }
  V.hover(s.node(),(ev,[px,py])=>{
    let d=ev.target&&ev.target.__data__; if(!d||!d.f){ const q=d3.least(cen,c=>(c.p[0]-px)**2+(c.p[1]-py)**2); d=q&&Math.hypot(q.p[0]-px,q.p[1]-py)<24?q.d:null; }
    if(!d)return off();
    if(cur!==d){ cur=d; V.focus(cp,x=>x.i===d.i&&x.j===d.j,{dim:.48}); cp.filter(x=>x===d).raise(); ann.interrupt().style("opacity",.5);
      ol.attr("d",path(d.f)); if(BV.mark)BV.mark(d.i,d.j); if(BV.cap)BV.cap(`${d.name}: ${sgn(d.mean)} °C · ${f0(d.amp)} °C`);
      hv.selectAll("*").remove(); const c=proj(d.c), right=c[0]<w-170;
      hv.append("circle").attr("cx",c[0]).attr("cy",c[1]).attr("r",9).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
      hv.append("circle").attr("cx",c[0]).attr("cy",c[1]).attr("r",2.5).attr("fill",C.ink);
      const lx=Math.max(110,Math.min(w-110,c[0])), below=c[1]<h-46;
      V.lines(hv,lx,below?c[1]+26:c[1]-34,[[d.name,true],[`${sgn(d.mean)} °C · ${f0(d.amp)} °C de diferència`]],{anchor:"middle",halo:true,size:12.5}); }
    const [tx,ty]=d3.pointer(ev,el);
    tp.show(`<b>${d.name}</b><br>Mitjana de gener i juliol: ${sgn(d.mean)} °C <span style="color:${C.muted}">(la ${ord(rkM.get(d))} més alta de ${S.length})</span><br>Diferència entre tots dos: ${f1(d.amp)} °C <span style="color:${C.muted}">(la ${ord(rkA.get(d))} més gran)</span><br><span style="color:${C.muted}">Cel·la: temperatura ${CLT[d.i]} · diferència ${CLA[d.j]}</span>`,tx,ty);
  },off);
  V.onView(el,instant=>{
    cp.transition("in").delay(d=>instant?0:200+900*(proj(d.c)[0]/w)).duration(instant?0:700).ease(d3.easeCubicInOut).attr("fill",d=>BIV[d.i][d.j]);
    ann.transition().delay(instant?0:1600).duration(instant?0:500).style("opacity",1);
  });
});


/* =====================================================================
   IB-30 · DISTÀNCIA DES D'UN PUNT  (geometria real + mapa real)
   ===================================================================== */
const CITIES30=[["Barcelona",2.17,41.39],["Londres",-.13,51.51],["Reykjavík",-21.94,64.15],["Nova York",-74.01,40.71],["Ciutat de Mèxic",-99.13,19.43],["Los Angeles",-118.24,34.05],["Lima",-77.04,-12.05],["São Paulo",-46.63,-23.55],["Buenos Aires",-58.38,-34.6],["Dakar",-17.45,14.69],["Lagos",3.38,6.52],["Ciutat del Cap",18.42,-33.92],["Nairobi",36.82,-1.29],["El Caire",31.24,30.04],["Moscou",37.62,55.76],["Delhi",77.21,28.61],["Pequín",116.41,39.9],["Tòquio",139.69,35.68],["Singapur",103.82,1.35],["Sydney",151.21,-33.87],["Auckland",174.76,-36.85],["Honolulu",-157.86,21.31]];
const ST30={c:[2.17,41.39],name:"Barcelona"};
legend(30,el=>V.legendCat(el,[{c:C.vermell,t:"Centre del mapa",kind:"hollow"},{c:C.vermell,t:"Camí més curt fins a cada ciutat",kind:"line",w:1},{c:C.muted,t:"Anell cada 2.000 km",kind:"line",w:1,dash:"2 3"}]));
const M30=piece(30,(el,w)=>{
  if(!W){ V.world().then(x=>{W=x;M30.redraw();}); return; }
  const mob=w<640, side=w>=860, S=side?Math.min(600,Math.round(w*.58)):Math.min(w,560), h=S, cx=side?S/2:w/2, cy=S/2, R=S/2-(mob?16:22);
  const proj=d3.geoAzimuthalEquidistant().clipAngle(179.99).precision(.4).translate([cx,cy]).scale(R/Math.PI), path=d3.geoPath(proj);
  stage(el,h);
  const s=mkSvg(el,w,h,{label:"Mapa del món en projecció azimutal equidistant centrat en una ciutat: cada anell està 2.000 km més lluny i les línies rectes des del centre són el camí més curt fins a cada ciutat. Es pot recentrar en una altra ciutat o en qualsevol punt."}), g=s.append("g");
  g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",R).attr("fill","none").attr("stroke",C.hair);
  const land=g.append("path").attr("fill",C.land), bord=g.append("path").attr("fill","none").attr("stroke","#fff").attr("stroke-width",.6);
  const KMS=d3.range(2000,20001,2000), rk=d=>d/RE*R/Math.PI;
  const rings=g.append("g").selectAll("circle").data(KMS).join("circle").attr("cx",cx).attr("cy",cy).attr("r",0).attr("fill","none")
    .attr("stroke",d=>d%10000?C.muted:C.ink2).attr("stroke-width",d=>d%10000?.7:.9).attr("stroke-dasharray","2 3").attr("stroke-opacity",.75);
  const rl=g.append("g").style("opacity",0);
  KMS.filter(d=>d>2000&&d<20000&&(mob?d%4000===0:true)).forEach(d=>V.t(rl,cx,cy-rk(d)+4,f0(d)+(d===4000?" km":""),{anchor:"middle",size:11.5,fill:C.muted,halo:true}));
  const lines=g.append("g"), dots=g.append("g"), labs=g.append("g"), hov=g.append("g");
  const cen=g.append("g");
  cen.append("circle").attr("cx",cx).attr("cy",cy).attr("r",8).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1);
  cen.append("circle").attr("cx",cx).attr("cy",cy).attr("r",3.6).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1);
  const cenL=V.t(cen,cx,cy-14,"",{anchor:"middle",weight:700,size:13,fill:C.vermell,halo:true});
  // anotacions (escriptori)
  const ann=g.append("g").style("opacity",0);
  { const a=Math.PI*1.25, px=cx+R*Math.cos(a), py=cy-R*Math.sin(a);
    V.note(ann,{x:px,y:py,tx:px+(mob?18:26),ty:Math.min(h-24,py+(mob?44:56)),kind:"elbow",dot:true,anchor:"start",lines:[["La vora és un sol punt:",true],["l'antípoda, a 20.015 km"]],size:mob?11.5:12.5}); }
  // llista ordenada (escriptori ample)
  let list=null;
  if(side){ const x0=S+36, x1=w-8; list=s.append("g");
    list.append("text").attr("x",x0).attr("y",16).attr("font-size",13).attr("font-weight",700).attr("fill",C.ink).attr("class","lt");
    list.append("text").attr("x",x1).attr("y",16).attr("text-anchor","end").attr("font-size",11.5).attr("fill",C.muted).text("km");
    list.x0=x0; list.x1=x1; list.sc=d3.scaleLinear([0,20015],[x0+118,x1-52]);
    list.append("line").attr("x1",list.sc(0)).attr("x2",list.sc(20015)).attr("y1",30).attr("y2",30).attr("stroke",C.grid);
    [0,10000,20000].forEach(v=>V.t(list,list.sc(v),h-6,v?f0(v):"0",{anchor:"middle",size:11,fill:C.muted})); }
  let cur=ST30.c.slice(), focusName=null;
  const rowY=k=>44+k*((h-70)/(CITIES30.length-1));
  // geometria (només quan canvia el centre) i focus (només estils) separats: el hover no torna a projectar res
  function render(c,o){ o=o||{}; cur=c; proj.rotate([-c[0],-c[1]]);
    land.attr("d",path(W.land)); bord.attr("d",path(W.borders));
    const P=CITIES30.map(d=>({d,p:proj([d[1],d[2]]),km:d3.geoDistance(c,[d[1],d[2]])*RE})).filter(q=>q.km>30);
    lines.selectAll("line").data(P,q=>q.d[0]).join(en=>en.append("line").attr("stroke",C.vermell).style("transition","stroke-opacity .15s, stroke-width .15s"))
      .attr("x1",cx).attr("y1",cy).attr("x2",q=>o.grow==null?q.p[0]:cx+(q.p[0]-cx)*o.grow).attr("y2",q=>o.grow==null?q.p[1]:cy+(q.p[1]-cy)*o.grow);
    dots.selectAll("circle").data(P,q=>q.d[0]).join(en=>en.append("circle").attr("stroke","#fff").style("transition","opacity .15s")).attr("cx",q=>q.p[0]).attr("cy",q=>q.p[1]);
    cenL.text(ST30.name);
    labs.attr("visibility",o.fast?"hidden":null);
    if(!o.fast){
      // etiquetes radials sense solapaments
      const boxes=[[cx-46,cy-30,cx+46,cy+12]], L=[];
      P.slice().sort((a,b)=>a.km-b.km).forEach(q=>{ const dx=q.p[0]-cx, dy=q.p[1]-cy, r=Math.hypot(dx,dy)||1, ux=dx/r, uy=dy/r, right=ux>=-.15;
        const tw=textW(q.d[0],12), x=q.p[0]+ux*6+(right?2:-2), y=q.p[1]+uy*6+4, bx=right?[x,y-11,x+tw,y+3]:[x-tw,y-11,x,y+3];
        if(bx[0]<2||bx[2]>(side?S:w)-2||bx[1]<0||bx[3]>h)return;
        if(boxes.some(b=>!(bx[2]<b[0]||bx[0]>b[2]||bx[3]<b[1]||bx[1]>b[3])))return;
        boxes.push(bx); L.push({q,x,y,anchor:right?"start":"end"}); });
      labs.selectAll("text").data(L,l=>l.q.d[0]).join(en=>en.append("text").attr("font-size",12).attr("fill",C.ink).call(V.halo,3).style("transition","opacity .15s"))
        .attr("x",l=>l.x).attr("y",l=>l.y).attr("text-anchor",l=>l.anchor).text(l=>l.q.d[0]);
      if(list){ list.select(".lt").text("Distància des de "+ST30.name);
        const rows=list.selectAll("g.row").data(P,q=>q.d[0]).join(en=>{ const r=en.append("g").attr("class","row").style("cursor","pointer");
            r.append("line").attr("class","bar").attr("stroke",C.vermell).attr("stroke-width",1); r.append("circle").attr("r",2.6).attr("fill",C.ink);
            r.append("text").attr("class","nm").attr("x",list.x0).attr("font-size",12).attr("fill",C.ink);
            r.append("text").attr("class","km").attr("x",list.x1).attr("text-anchor","end").attr("font-size",12).attr("fill",C.ink2).style("font-variant-numeric","tabular-nums");
            r.append("rect").attr("x",list.x0).attr("width",list.x1-list.x0).attr("y",-12).attr("height",17).attr("fill","transparent");
            r.attr("transform",`translate(0,${rowY(CITIES30.length-1)})`);
            r.on("pointerenter",(ev,q)=>mark({d:q.d,p:proj([q.d[1],q.d[2]])})).on("pointerleave",()=>unmark()).on("click",(ev,q)=>go([q.d[1],q.d[2]],q.d[0]));
            return r; });
        rows.select(".nm").text(q=>q.d[0]); rows.select(".km").text(q=>f0(q.km));
        rows.select(".bar").attr("x1",list.sc(0)).attr("x2",q=>list.sc(q.km)).attr("y1",-4).attr("y2",-4);
        rows.select("circle").attr("cx",q=>list.sc(q.km)).attr("cy",-4);
        if(o.order){ const rk2=new Map(d3.sort(P,q=>q.km).map((q,k)=>[q.d[0],k]));
          rows.transition("ord").duration(o.instant?0:600).ease(d3.easeCubicInOut).attr("transform",q=>`translate(0,${rowY(rk2.get(q.d[0]))})`); } }
    }
    applyFocus();
  }
  function applyFocus(){ const F=focusName, on=q=>q.d[0]===F;
    lines.selectAll("line").style("stroke-width",q=>on(q)?2.2:.8).style("stroke-opacity",q=>F?(on(q)?1:.15):.5);
    dots.selectAll("circle").attr("r",q=>on(q)?4.6:2.6).attr("fill",q=>on(q)?C.vermell:C.ink).attr("stroke-width",q=>on(q)?1.4:.8).style("opacity",q=>F&&!on(q)?.25:1);
    if(F){ lines.selectAll("line").filter(on).raise(); dots.selectAll("circle").filter(on).raise(); }
    labs.selectAll("text").attr("font-weight",l=>l.q.d[0]===F?700:400).style("opacity",l=>F&&l.q.d[0]!==F?.25:1);
    if(list){ const rows=list.selectAll("g.row"); rows.select(".nm").attr("font-weight",q=>q.d[0]===F?700:400);
      rows.select(".bar").attr("stroke-opacity",q=>F&&q.d[0]!==F?.2:.55); rows.style("opacity",q=>F&&q.d[0]!==F?.45:1); } }
  function setBtns(){ document.querySelectorAll('[data-seg="30"] button').forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===ST30.name?"true":"false")); }
  function go(target,name){ const it=d3.geoInterpolate(cur,target); ST30.c=target; ST30.name=name; setBtns(); tp.hide(); hov.selectAll("*").remove();
    d3.select(el).interrupt("rc").transition("rc").duration(V.reduced?0:1300).ease(d3.easeCubicInOut).tween("rc",()=>t=>render(it(t),{fast:t<1})).on("end",()=>render(target,{order:true})); }
  el._go=go;
  // hover: recta fins al punt i distància; clic: recentra
  const tp=V.tip(el), hit=s.append("rect").attr("width",side?S:w).attr("height",h).attr("fill","transparent").style("cursor","pointer");
  function pick(px,py){ let best=null, bd=22; CITIES30.forEach(d=>{ const p=proj([d[1],d[2]]); const dd=Math.hypot(p[0]-px,p[1]-py); if(dd<bd&&d[0]!==ST30.name){ bd=dd; best={d,p}; } }); return best; }
  // estat de hover comú (mapa i llista): recta, anell de distància amb el valor, etiqueta directa i tooltip
  function mark(ci,pt){ const p=ci?ci.p:pt, ll=ci?[ci.d[1],ci.d[2]]:proj.invert(pt), km=d3.geoDistance(cur,ll)*RE, rr=rk(km);
    const nm=ci?ci.d[0]:"·"; if(focusName!==nm){ focusName=nm; applyFocus(); }
    hov.selectAll("*").remove();
    hov.append("circle").attr("cx",cx).attr("cy",cy).attr("r",rr).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-opacity",.7);
    hov.append("line").attr("x1",cx).attr("y1",cy).attr("x2",p[0]).attr("y2",p[1]).attr("stroke",C.ink).attr("stroke-width",1.5);
    hov.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",9).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
    if(!ci)hov.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",3.5).attr("fill",C.ink);
    // valor sobre l'escala (l'anell)
    { const dx=p[0]-cx, dy=p[1]-cy, r0=Math.hypot(dx,dy)||1, ox=cx-dx/r0*rr, oy=cy-dy/r0*rr;   // a l'altra banda de l'anell, lluny del tooltip
      hov.append("circle").attr("cx",ox).attr("cy",oy).attr("r",2.5).attr("fill",C.ink);
      V.t(hov,ox+(dx>0?-6:6),oy+(dy>0?-6:14),f0(km)+" km",{anchor:dx>0?"end":"start",weight:700,size:12,halo:4}); }
    // etiqueta directa
    let where, sub=""; if(ci)where=ci.d[0]; else { const f=findCountry(ll[0],ll[1]); where=f?nomCA(f):llFmt(ll[0],ll[1]); if(f)sub="<br>"+llFmt(ll[0],ll[1]); }
    const right=p[0]<(side?S:w)-130; V.lines(hov,p[0]+(right?14:-14),p[1]+(ci?16:-4),ci?[[f0(km)+" km",true]]:[[where,true],[f0(km)+" km"]],{anchor:right?"start":"end",halo:true,size:12.5});
    let ctx; if(ci){ const all=d3.sort(CITIES30.filter(d=>d[0]!==ST30.name).map(d=>d3.geoDistance(cur,[d[1],d[2]]))); ctx=`la ${ord(d3.bisectLeft(all,km/RE-1e-9)+1)} ciutat més propera de ${all.length}`; }
    else ctx=`${f0(km/20015*100)} % del camí fins a l'antípoda`;
    tp.show(`<b>${where}</b><br>a ${f0(km)} km de ${ST30.name}${sub}<br><span style="color:${C.muted}">${ctx} · clic o segon toc per centrar-hi el mapa</span>`,p[0],p[1]); }
  function unmark(){ hov.selectAll("*").remove(); tp.hide(); if(focusName){ focusName=null; applyFocus(); } }
  V.hover(hit.node(),(ev,[px,py])=>{ if(Math.hypot(px-cx,py-cy)>R)return unmark(); const ci=pick(px,py); mark(ci,ci?null:[px,py]); },unmark);
  // amb el dit, el primer toc fa de hover i un segon toc al mateix lloc recentra
  let tPrev=null, tLast=null;
  hit.on("pointerdown.tap",ev=>{ if(ev.pointerType==="mouse")return; const [px,py]=d3.pointer(ev), ci=pick(px,py); tPrev=tLast; tLast=ci?ci.d[0]:[px,py]; });
  const same=(a,b)=>a&&b&&(typeof a==="string"?a===b:typeof b!=="string"&&Math.hypot(a[0]-b[0],a[1]-b[1])<24);
  hit.on("click",ev=>{ const [px,py]=d3.pointer(ev); if(Math.hypot(px-cx,py-cy)>R)return; const ci=pick(px,py);
    if(ev.pointerType&&ev.pointerType!=="mouse"&&!same(tPrev,tLast))return;
    tPrev=tLast=null;
    if(ci)go([ci.d[1],ci.d[2]],ci.d[0]); else { const ll=proj.invert([px,py]); go(ll,llFmt(ll[0],ll[1])); } });
  setBtns();
  render(ST30.c,{order:true,instant:true});
  V.onView(el,instant=>{ if(instant){ rings.attr("r",rk); rl.style("opacity",1); ann.style("opacity",1); return; }
    land.style("opacity",0).transition().duration(700).style("opacity",1); bord.style("opacity",0).transition().duration(700).style("opacity",1);
    rings.transition().delay((d,i)=>150+i*70).duration(800).ease(d3.easeCubicOut).attr("r",rk);
    rl.transition().delay(900).duration(500).style("opacity",1);
    d3.select(el).transition("grow").delay(400).duration(1100).ease(d3.easeCubicInOut).tween("g",()=>t=>render(cur,{grow:t,fast:t<1}));
    labs.style("opacity",0).transition().delay(1200).duration(500).style("opacity",1);
    ann.transition().delay(1700).duration(500).style("opacity",1); });
});
document.querySelectorAll('[data-seg="30"] button').forEach(b=>b.addEventListener("click",()=>{ const el=$('[data-p="30"]'), d=CITIES30.find(c=>c[0]===b.dataset.k); if(!d)return;
  if(el&&el._go)el._go([d[1],d[2]],d[0]);
  else { ST30.c=[d[1],d[2]]; ST30.name=d[0]; document.querySelectorAll('[data-seg="30"] button').forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false")); } }));   // encara no dibuixat: es desa l'estat


/* =====================================================================
   IB-31 · ABANS I DESPRÉS  (dades reals: NCEP/NCAR R1 + mapa real)
   ===================================================================== */
const ED31=[-20,-16,-12,-8,-4,0,4,8,12,16,20], DIV31=V.div(22);
const COL31=d3.range(12).map(k=>DIV31(k===0?-22:k===11?22:(ED31[k-1]+ED31[k])/2));
const band31=v=>{ let k=0; while(k<11&&v>=ED31[k])k++; return k; };
legend(31,el=>legendSteps(el,{colors:COL31,edges:ED31,cw:16,show:v=>v%8===0||v===0,f:v=>sgn(v,0),title:"Temperatura respecte a la mitjana de la seva latitud (°C)",lo:"Més freda",hi:"Més calenta"}));
const NOTES31=[ // extrems llegits a les dades (vegeu research/cinta-transportadora/fonts.md)
  {m:0,lon:7.5,lat:67.5,t:"Mar de Noruega",dx:-1,dy:.9},{m:0,lon:82.5,lat:32.5,t:"Altiplà del Tibet",dx:1,dy:1},
  {m:1,lon:45,lat:32.5,t:"Iraq",dx:-1,dy:1},{m:1,lon:87.5,lat:35,t:"Altiplà del Tibet",dx:1,dy:1}];
let POS31=.5;
const M31=piece(31,(el,w)=>{
  if(!W||!NC){ if(!W)V.world().then(x=>{W=x;M31.redraw();}); return; }
  ncInit();
  const mob=w<640, proj=d3.geoEqualEarth().fitWidth(w,{type:"Sphere"}), path=d3.geoPath(proj), h=Math.ceil(path.bounds({type:"Sphere"})[1][1])+2;
  stage(el,h);
  // raster: Equal Earth és pseudocilíndrica (latitud = funció de y; longitud lineal en x dins de cada fila),
  // així que n'hi ha prou amb dues inversions per fila en lloc d'una per píxel
  const tx0=proj.translate()[0], RV=new Uint8Array(h), RL=new Float32Array(h), R0=new Float32Array(h), RD=new Float32Array(h);
  for(let y=0;y<h;y++){ const a=proj.invert([tx0,y+.5]), b=proj.invert([tx0+40,y+.5]); if(!a||!b)continue; const q=proj(a);
    if(!q||Math.abs(q[1]-(y+.5))>.6||Math.abs(a[1])>90)continue; RV[y]=1; RL[y]=a[1]; R0[y]=a[0]; RD[y]=(b[0]-a[0])/40; }
  const lonAt=(x,y)=>R0[y]+(x+.5-tx0)*RD[y];
  const inS=(x,y)=>{ y=Math.floor(y); if(y<0||y>=h||!RV[y])return false; const lo=lonAt(x,y); return lo>=-180&&lo<=180; };
  const imA=new ImageData(w,h), imB=new ImageData(w,h), rgb=COL31.map(c=>{ const q=d3.rgb(c); return [q.r,q.g,q.b]; });
  for(let y=0;y<h;y++){ if(!RV[y])continue; for(let x=0;x<w;x++){ const lo=lonAt(x,y); if(lo<-180||lo>180)continue; const ll=[lo,RL[y]];
    const o=(y*w+x)*4, a=rgb[band31(ncAt(ANJ,ll[0],ll[1]))], b=rgb[band31(ncAt(ANL,ll[0],ll[1]))];
    imA.data[o]=a[0]; imA.data[o+1]=a[1]; imA.data[o+2]=a[2]; imA.data[o+3]=255; imB.data[o]=b[0]; imB.data[o+1]=b[1]; imB.data[o+2]=b[2]; imB.data[o+3]=255; } }
  const mkL=(im,label)=>{ const o=document.createElement("canvas"); o.width=w; o.height=h; o.getContext("2d").putImageData(im,0,0);
    const L=mkCanvas(el,w,h,{label}); L.ctx.imageSmoothingEnabled=false; L.ctx.drawImage(o,0,0,w,h); return L.c; };
  const cB=mkL(imB,"Mapa del món de juliol: temperatura de l'aire respecte a la mitjana de la seva latitud. Dades reals NCEP/NCAR, 1991–2020.");
  cB.style.transition="opacity .15s";
  const cA=mkL(imA,"Mapa del món de gener: el mar de Noruega és fins a 26 °C més calent que la mitjana de la seva latitud i l'interior de Sibèria i el Tibet, molt més freds. Dades reals NCEP/NCAR, 1991–2020.");
  cA.style.transition="opacity .15s";
  const fg=mkSvg(el,w,h,{abs:true,visible:true});
  fg.append("path").attr("d",path(W.land)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-opacity",.55);
  fg.append("path").attr("d",path({type:"Sphere"})).attr("fill","none").attr("stroke",C.hair);
  const id="c31"+Math.random().toString(36).slice(2,7), defs=fg.append("defs");
  const clA=defs.append("clipPath").attr("id",id+"a").append("rect").attr("y",-40).attr("height",h+80), clB=defs.append("clipPath").attr("id",id+"b").append("rect").attr("y",-40).attr("height",h+80);
  const annA=fg.append("g").attr("clip-path",`url(#${id}a)`), annB=fg.append("g").attr("clip-path",`url(#${id}b)`);
  if(!mob)NOTES31.forEach(n=>{ const p=proj([n.lon,n.lat]), v=ncNear(n.m?ANL:ANJ,n.lon,n.lat);
    V.note(n.m?annB:annA,{x:p[0],y:p[1],tx:p[0]+n.dx*(mob?18:42),ty:p[1]+n.dy*(mob?26:44),kind:"elbow",dot:true,anchor:n.dx>0?"start":"end",
      lines:[[`${sgn(v)} °C`,true],[n.t+(n.m?", al juliol":", al gener")]],size:mob?11.5:12.5}); });
  // divisor
  const dv=fg.append("g").attr("class","ibx-handle").attr("tabindex",0).attr("role","slider").attr("aria-label","Divisor entre el mapa de gener i el de juliol")
    .attr("aria-valuemin",0).attr("aria-valuemax",100).style("cursor","ew-resize").style("outline","none");
  const dl=dv.append("line").attr("y1",0).attr("y2",h).attr("stroke",C.ink).attr("stroke-width",1.2);
  const hy=h/2, hc=dv.append("g");
  hc.append("circle").attr("r",15).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.2);
  hc.append("path").attr("d","M-4,-5L-9,0L-4,5M4,-5L9,0L4,5").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.3).attr("stroke-linejoin","round");
  const lA=V.t(fg,0,mob?16:20,"← Gener",{anchor:"end",weight:700,size:mob?13:14,halo:true}).attr("pointer-events","none"), lB=V.t(fg,0,mob?16:20,"Juliol →",{weight:700,size:mob?13:14,halo:true}).attr("pointer-events","none");
  function set(p){ POS31=Math.max(0,Math.min(1,p)); const x=Math.round(POS31*w);
    cA.style.clipPath=`inset(0 ${w-x}px 0 0)`; clA.attr("x",-60).attr("width",x+60); clB.attr("x",x).attr("width",w-x+60);
    dl.attr("x1",x).attr("x2",x); hc.attr("transform",`translate(${x},${hy})`);
    lA.attr("x",x-12).style("opacity",x>70?1:0); lB.attr("x",x+12).style("opacity",x<w-70?1:0);
    dv.attr("aria-valuenow",Math.round(POS31*100)).attr("aria-valuetext",`${Math.round(POS31*100)} % gener, ${Math.round((1-POS31)*100)} % juliol`); }
  set(POS31);
  // arrossegar (ratolí i dit), teclat i tooltip
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl); let drag=false;
  const hit=fg.insert("rect",".ibx-handle").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
  fg.style("touch-action","pan-y");
  fg.on("pointerdown.drag",ev=>{ const [px]=d3.pointer(ev,fg.node()); if(Math.abs(px-POS31*w)<28||ev.target.closest(".ibx-handle")){ drag=true; off31(); fg.node().setPointerCapture(ev.pointerId); set(px/w); ev.preventDefault(); } })
    .on("pointermove.drag",ev=>{ if(!drag)return; const [px]=d3.pointer(ev,fg.node()); set(px/w); })
    .on("pointerup.drag pointercancel.drag",()=>{ drag=false; });
  dv.on("keydown",ev=>{ const k=ev.key, st=ev.shiftKey?.1:.02;
    if(k==="ArrowLeft"||k==="ArrowDown")set(POS31-st); else if(k==="ArrowRight"||k==="ArrowUp")set(POS31+st); else if(k==="Home")set(0); else if(k==="End")set(1); else return; ev.preventDefault(); });
  // hover: la cel·la de 2,5° apuntada es pinta sencera i la resta s'apaga
  const hv=fg.insert("g",".ibx-handle").attr("pointer-events","none");
  function off31(){ hv.selectAll("*").remove(); tp.hide(); cA.style.opacity=""; cB.style.opacity=""; annA.style("opacity",null); annB.style("opacity",null); stepsMark(31,null); }
  V.hover(hit.node(),(ev,[px,py])=>{ if(drag)return; if(!inS(px,py))return off31(); const ll=proj.invert([px,py]); if(!ll)return off31();
    const i=Math.max(0,Math.min(72,Math.round((90-ll[1])/2.5))), j=Math.round((((ll[0]%360)+360)%360)/2.5)%144, q=i*144+j, left=px<POS31*w;
    const a=ANJ[q], b=ANL[q], v=left?a:b, T=left?NCJ[q]:NCL[q], k=band31(v), la=90-i*2.5, lo=j*2.5>180?j*2.5-360:j*2.5;
    const ring=[]; const la0=Math.max(-90,la-1.25), la1=Math.min(90,la+1.25);
    for(let t=0;t<=4;t++)ring.push([lo-1.25+t*.625,la1]); for(let t=0;t<=4;t++)ring.push([lo+1.25-t*.625,la0]);
    const pts=ring.map(proj);
    hv.selectAll("*").remove(); cA.style.opacity=.58; cB.style.opacity=.58; annA.style("opacity",.5); annB.style("opacity",.5);
    hv.append("path").attr("d","M"+pts.join("L")+"Z").attr("fill",COL31[k]).attr("stroke",C.ink).attr("stroke-width",1.5);
    const c=proj([lo,la]); hv.append("circle").attr("cx",c[0]).attr("cy",c[1]).attr("r",16).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
    const lft=c[0]>90; V.lines(hv,c[0]+(lft?-22:22),c[1]+18,[[`${sgn(v)} °C`,true],[left?"al gener":"al juliol"]],{anchor:lft?"end":"start",halo:true,size:12.5});
    stepsMark(31,k,sgn(v)+" °C");
    tp.show(`<b>${llFmt(lo,la)}</b><br>${left?"<b>":""}Gener: ${sgn(a)} °C${left?"</b>":""} · ${left?"":"<b>"}juliol: ${sgn(b)} °C${left?"":"</b>"}<br><span style="color:${C.muted}">respecte a la mitjana de la latitud.<br>${left?"Al gener":"Al juliol"} hi fa ${sgn(T)} °C; la mitjana de la latitud, ${sgn(T-v)} °C</span>`,px,py); },off31);
  V.onView(el,instant=>{ if(instant)return;
    d3.select(el).transition("sw").duration(1600).ease(d3.easeCubicInOut).tween("sw",()=>{ const i=d3.interpolate(.97,.5); return t=>set(i(t)); }); });
});


/* =====================================================================
   IB-32 · MAPA EN FRANJA  (dades reals: NCEP/NCAR R1 + mapa real)
   ===================================================================== */
const A32=[2.17,41.39], B32=[139.69,35.68];
const CITY32=[["Barcelona",2.17,41.39,1],["Lió",4.84,45.76,3],["Frankfurt",8.68,50.11,2],["Berlín",13.4,52.52,1],["Riga",24.11,56.95,3],["Sant Petersburg",30.31,59.94,1],["Arkhànguelsk",40.54,64.54,2],["Siktivkar",50.84,61.67,3],["Surgut",73.4,61.25,1],["Bratsk",101.63,56.15,2],["Kirensk",108.1,57.78,3],["Txità",113.5,52.03,1],["Blagoveixtxensk",127.53,50.26,2],["Vladivostok",131.89,43.12,1],["Tòquio",139.69,35.68,1]];
legend(32,el=>V.legendCat(el,[{c:C.blau,t:"Gener",kind:"line",w:2},{c:C.vermell,t:"Juliol",kind:"line",w:2}],{title:"Temperatura de l'aire al llarg del camí"}));
function gcRot(a,b){ const r0=[-a[0],-a[1]], p=d3.geoRotation([r0[0],r0[1],0])(b), be=Math.atan2(Math.tan(p[1]*RAD),Math.sin(p[0]*RAD))/RAD;
  for(const g of [be,-be]){ const q=d3.geoRotation([r0[0],r0[1],g])(b); if(Math.abs(q[1])<1e-6&&q[0]>0)return [r0[0],r0[1],g]; }
  return [r0[0],r0[1],be]; }
let PR32=null;
function prof32(){ if(PR32)return PR32;
  const tot=d3.geoDistance(A32,B32)*RE, it=d3.geoInterpolate(A32,B32), n=Math.round(tot/20), out=[];
  for(let k=0;k<=n;k++){ const ll=it(k/n), f=findCountry(ll[0],ll[1]); out.push({km:tot*k/n,ll,jan:ncAt(NCJ,ll[0],ll[1]),jul:ncAt(NCL,ll[0],ll[1]),cn:f?nomCA(f):null}); }
  const seg=[]; out.forEach((d,k)=>{ const l=seg[seg.length-1]; if(l&&l.cn===d.cn)l.k1=d.km; else seg.push({cn:d.cn,k0:d.km,k1:d.km}); });
  PR32={tot,pts:out,seg}; return PR32; }
let PLAY32=null;
const M32=piece(32,(el,w)=>{
  if(!W||!NC){ if(!W)V.world().then(x=>{W=x;M32.redraw();}); return; }
  ncInit();
  if(PLAY32){ PLAY32.stop(); PLAY32=null; }
  const D=prof32(), mob=w<640, ml=mob?30:42, mr=mob?12:58, rot=gcRot(A32,B32), sB=D.tot/RE;   // sB en radians
  const k=(w-ml-mr)/sB, hhDeg=mob?11:7.5, hh=hhDeg*RAD*k;
  const topH=mob?96:112, yc=topH+hh, sBot=yc+hh, bandY=sBot+28, pTop=bandY+(mob?40:42), ph=mob?132:170, h=Math.round(pTop+ph+26);
  const proj=d3.geoEquirectangular().rotate(rot).scale(k).translate([ml,yc]).clipExtent([[0,yc-hh],[w,sBot]]), path=d3.geoPath(proj);
  const X=km=>ml+km/RE*k;
  stage(el,h);
  const s=mkSvg(el,w,h,{label:`El camí més curt de Barcelona a Tòquio (${f0(D.tot)} km) desplegat en una franja recta, amb les ciutats que hi ha a prop i, a sota, la temperatura de l'aire al gener i al juliol al llarg del camí: al gener baixa per sota de −25 °C a Sibèria. Dades reals NCEP/NCAR, 1991–2020.`});
  const id="s32"+Math.random().toString(36).slice(2,7), defs=s.append("defs");
  const gr=defs.append("linearGradient").attr("id",id+"g").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",1);
  [[0,0],[.22,1],[.78,1],[1,0]].forEach(([o,a])=>gr.append("stop").attr("offset",o).attr("stop-color","#fff").attr("stop-opacity",a));
  defs.append("mask").attr("id",id+"m").append("rect").attr("x",0).attr("y",yc-hh).attr("width",w).attr("height",2*hh).attr("fill",`url(#${id}g)`);
  const rv=defs.append("clipPath").attr("id",id+"r").append("rect").attr("x",0).attr("y",-10).attr("height",h+20).attr("width",w);
  // franja
  const st=s.append("g").attr("mask",`url(#${id}m)`);
  st.append("path").attr("d",path(d3.geoGraticule().step([10,10])())).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.6);
  st.append("path").attr("d",path(W.land)).attr("fill",C.land);
  st.append("path").attr("d",path(W.borders)).attr("fill","none").attr("stroke","#fff").attr("stroke-width",.7);
  const rev=s.append("g").attr("clip-path",`url(#${id}r)`);
  rev.append("line").attr("x1",X(0)).attr("x2",X(D.tot)).attr("y1",yc).attr("y2",yc).attr("stroke",C.vermell).attr("stroke-width",2);
  // ciutats
  const cg=s.append("g"), CP=d3.sort(CITY32.filter(c=>!(mob&&c[3]>1)),c=>c[3]).map(c=>({c,p:proj([c[1],c[2]])})).filter(q=>q.p&&q.p[1]>=yc-hh&&q.p[1]<=sBot);
  const placed=CP.map(q=>[q.p[0]-3,q.p[1]-3,q.p[0]+3,q.p[1]+3,q]);   // els punts de les ciutats també ocupen lloc
  CP.forEach(({c,p})=>{
    const end=c[0]==="Tòquio", beg=c[0]==="Barcelona", up0=p[1]<yc-.5&&!beg&&!end, tw=textW(c[0],12);
    const lx=end?p[0]-tw:beg?p[0]-4:p[0]-tw/2;
    let ly=0, bx=null, ok=false;
    for(const up of (beg||end)?[false]:[up0,!up0]){ ly=up?p[1]-7:p[1]+15; bx=[lx-3,ly-11,lx+tw+3,ly+3];
      if(bx[1]<yc-hh-6||bx[3]>sBot+2)continue;
      if(!placed.some(b=>!(bx[2]<b[0]||bx[0]>b[2]||bx[3]<b[1]||bx[1]>b[3]))){ ok=true; break; } }
    const gg=cg.append("g").attr("class","cty").datum(p[0]);
    gg.append("circle").attr("cx",p[0]).attr("cy",p[1]).attr("r",c[3]===1?3:2.4).attr("fill",C.ink).attr("stroke","#fff").attr("stroke-width",1);
    if(ok&&(!mob||c[3]===1)){ placed.push(bx); V.t(gg,lx,ly,c[0],{size:12,weight:c[3]===1?700:400,halo:true,fill:c[3]===1?C.ink:C.ink2}); } });
  // escala de distància
  const kmStep=mob?2000:1000, ax=s.append("g");
  d3.range(0,D.tot-(mob?2600:1200),kmStep).forEach(v=>{ ax.append("line").attr("x1",X(v)).attr("x2",X(v)).attr("y1",sBot+2).attr("y2",sBot+6).attr("stroke",C.muted);
    V.t(ax,X(v),sBot+18,v===0?"0 km":f0(v),{anchor:v===0?"start":"middle",size:11.5,fill:C.muted}); });
  V.t(ax,X(D.tot),sBot+18,f0(D.tot)+" km",{anchor:"end",size:11.5,fill:C.ink2,weight:700});
  // franja de països
  const bg=s.append("g");
  D.seg.forEach(sg=>{ if(!sg.cn)return; const x0=X(sg.k0), x1=X(sg.k1+20);
    bg.append("rect").datum(sg.cn).attr("class","sg").attr("x",x0).attr("y",bandY).attr("width",Math.max(1,x1-x0-1)).attr("height",5).attr("fill",C.landEdge).style("transition","opacity .15s, fill .15s");
    const nm=sg.cn, tw=textW(nm,11.5); if(x1-x0>tw+6)V.t(bg,(x0+x1)/2,bandY+19,nm,{anchor:"middle",size:11.5,fill:C.ink2}).datum(sg.cn).attr("class","sg").style("transition","opacity .15s"); });
  // perfil de temperatura
  const y=d3.scaleLinear([-35,30],[pTop+ph,pTop]), pg=s.append("g");
  V.gridY(pg,y,0,w,[-30,-20,-10,0,10,20],v=>sgn(v,0),{zero:0,unit:" °C"});
  const ar=d3.area().x(d=>X(d.km)).y0(d=>y(d.jan)).y1(d=>y(d.jul)).curve(d3.curveMonotoneX), ln=key=>d3.line().x(d=>X(d.km)).y(d=>y(d[key])).curve(d3.curveMonotoneX);
  rev.append("path").attr("d",ar(D.pts)).attr("fill",C.ghost).attr("fill-opacity",.28);
  rev.append("path").attr("d",ln("jul")(D.pts)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",2);
  rev.append("path").attr("d",ln("jan")(D.pts)).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",2);
  const last=D.pts[D.pts.length-1];
  if(!mob){ V.t(rev,X(D.tot)+6,y(last.jul)+4,"Juliol",{size:12,weight:700,fill:C.vermell,halo:true}); V.t(rev,X(D.tot)+6,y(last.jan)+4,"Gener",{size:12,weight:700,fill:C.blau,halo:true}); }
  const mn=d3.least(D.pts,d=>d.jan), mx=d3.greatest(D.pts,d=>d.jul-d.jan);
  const ann=s.append("g").style("opacity",0);
  V.note(ann,{x:X(mn.km),y:y(mn.jan)+2,tx:X(mn.km)+(mob?-24:-46),ty:y(mn.jan)+(mob?20:16),kind:"elbow",dot:true,anchor:"end",lines:[[`${sgn(mn.jan)} °C al gener`,true],[mob?"el punt més fred":`el punt més fred, a ${f0(mn.km)} km`]],size:mob?11.5:12.5});
  if(!mob)V.note(ann,{x:X(mx.km),y:y(mx.jul)-2,tx:X(mx.km)+50,ty:pTop-2,kind:"elbow",dot:true,anchor:"start",lines:[[`${f0(mx.jul-mx.jan)} °C de diferència`,true],["entre gener i juliol"]]});
  // mini mapa de situació
  const gS=mob?78:104, gx=w-gS/2-2, gy=gS/2+4;
  const gp=d3.geoOrthographic().rotate([-72,-52]).translate([gx,gy]).scale(gS/2-1), gpath=d3.geoPath(gp), mg=s.append("g");
  mg.append("path").attr("d",gpath({type:"Sphere"})).attr("fill","none").attr("stroke",C.hair);
  mg.append("path").attr("d",gpath(d3.geoGraticule().step([30,30])())).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.5);
  mg.append("path").attr("d",gpath(W.land)).attr("fill",C.land);
  mg.append("path").attr("d",gpath({type:"LineString",coordinates:[A32,B32]})).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.6);
  const gdot=mg.append("circle").attr("r",3.6).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.2);
  // lectura (dalt a l'esquerra)
  const rd=s.append("g").attr("transform",`translate(0,${mob?16:20})`);
  const r1=V.t(rd,0,0,"Barcelona → Tòquio",{size:mob?13.5:15,weight:700}), r2=V.t(rd,0,mob?19:22,"",{size:12.5,fill:C.ink2}), r3=V.t(rd,0,mob?37:42,"",{size:12.5,fill:C.ink2});
  const r4=V.t(rd,0,mob?55:62,"",{size:12.5,fill:C.ink2});
  // estat
  const cur=s.append("g").style("display","none").attr("pointer-events","none");
  const gl=cur.append("line").attr("y1",yc-hh).attr("y2",pTop+ph).attr("stroke",C.ink).attr("stroke-width",.9);
  const gJ=cur.append("line").attr("x1",0).attr("stroke",C.blau).attr("stroke-width",.8).attr("stroke-dasharray","2 3"), gL=cur.append("line").attr("x1",0).attr("stroke",C.vermell).attr("stroke-width",.8).attr("stroke-dasharray","2 3");
  const aJ=V.t(cur,0,0,"",{size:11.5,weight:700,fill:C.blau,halo:4}), aL=V.t(cur,0,0,"",{size:11.5,weight:700,fill:C.vermell,halo:4});
  const aK=V.t(cur,0,sBot+18,"",{size:11.5,weight:700,halo:4,anchor:"middle"});
  const cr=cur.append("circle").attr("cy",yc).attr("r",11).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
  const cd=cur.append("circle").attr("cy",yc).attr("r",5).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.5);
  const dJ=cur.append("circle").attr("r",4.6).attr("fill",C.blau).attr("stroke","#fff").attr("stroke-width",1.4), dL=cur.append("circle").attr("r",4.6).attr("fill",C.vermell).attr("stroke","#fff").attr("stroke-width",1.4);
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const vJ=cur.append("text").attr("font-size",12).attr("font-weight",700).attr("fill",C.blau).call(V.halo,3).style("font-variant-numeric","tabular-nums");
  const vL=cur.append("text").attr("font-size",12).attr("font-weight",700).attr("fill",C.vermell).call(V.halo,3).style("font-variant-numeric","tabular-nums");
  function at(km){ const i=Math.max(0,Math.min(D.pts.length-1,Math.round(km/D.tot*(D.pts.length-1)))); return D.pts[i]; }
  function show(km){ if(km==null){ cur.style("display","none"); tp.hide(); if(ann.style("opacity")!=="0")ann.style("opacity",1); cg.selectAll(".cty").style("opacity",1); bg.selectAll(".sg").style("opacity",null).filter("rect").style("fill",null); ax.style("opacity",null);
      gdot.attr("transform",`translate(${gp(A32)})`); r2.text(`${f0(D.tot)} km pel camí més curt`).attr("font-weight",null); r3.text(mob?"Temperatura al llarg del camí":"Temperatura de l'aire al gener i al juliol al llarg del camí"); r4.text(""); return; }
    const d=at(km), x=X(d.km), right=x<w-90; ann.interrupt().style("opacity",.5);
    cur.style("display",null); gl.attr("x1",x).attr("x2",x); cd.attr("cx",x);
    dJ.attr("cx",x).attr("cy",y(d.jan)); dL.attr("cx",x).attr("cy",y(d.jul));
    vJ.attr("x",right?x+8:x-8).attr("text-anchor",right?"start":"end").attr("y",y(d.jan)+(d.jan<d.jul?14:-6)).text(sgn(d.jan)+" °C");
    vL.attr("x",right?x+8:x-8).attr("text-anchor",right?"start":"end").attr("y",y(d.jul)+(d.jan<d.jul?-6:14)).text(sgn(d.jul)+" °C");
    gdot.attr("transform",`translate(${gp(d.ll)})`);
    cg.selectAll(".cty").style("opacity",function(){ return Math.abs(d3.select(this).datum()-x)<30?1:.25; });
    bg.selectAll(".sg").style("opacity",c=>c===d.cn?1:.25).filter("rect").style("fill",c=>c===d.cn?C.ink2:null);
    gJ.attr("x2",x).attr("y1",y(d.jan)).attr("y2",y(d.jan)); gL.attr("x2",x).attr("y1",y(d.jul)).attr("y2",y(d.jul));
    aJ.attr("y",y(d.jan)+(d.jan<d.jul?14:-5)).text(sgn(d.jan)+" °C"); aL.attr("y",y(d.jul)+(d.jan<d.jul?-5:14)).text(sgn(d.jul)+" °C");
    cr.attr("cx",x); ax.style("opacity",.5); aK.attr("x",Math.max(30,Math.min(w-30,x))).text(f0(d.km)+" km");
    if(mob){ r2.text(`${d.cn||"Sobre el mar"} · ${f0(d.km)} km (${f0(d.km/D.tot*100)} %)`).attr("font-weight",700); r3.text(`Gener ${sgn(d.jan)} °C · juliol ${sgn(d.jul)} °C`); r4.text(`${f0(d.jul-d.jan)} °C de diferència`); return; }
    tp.show(`<b>${d.cn||"Sobre el mar"}</b><br>A ${f0(d.km)} km de Barcelona (${f0(d.km/D.tot*100)} % del camí)<br>Gener ${sgn(d.jan)} °C · juliol ${sgn(d.jul)} °C<br><span style="color:${C.muted}">${f0(d.jul-d.jan)} °C de diferència entre tots dos mesos</span>`,x,yc);
    r2.text(`A ${f0(d.km)} km de Barcelona${d.km>D.tot-15?" (arribada)":""}`);
    r3.text(d.cn?`Sobre ${d.cn}`:"Sobre el mar");
    r4.text(`${llFmt(d.ll[0],d.ll[1])}`); }
  show(null);
  const hit=s.append("rect").attr("x",0).attr("y",yc-hh).attr("width",w).attr("height",pTop+ph-(yc-hh)).attr("fill","transparent").style("cursor","crosshair");
  V.hover(hit.node(),(ev,[px])=>{ if(PLAY32){ PLAY32.stop(); PLAY32=null; } show(Math.max(0,Math.min(D.tot,(px-ml)/k*RE))); },()=>show(null));
  el._play=()=>{ if(PLAY32)PLAY32.stop(); if(V.reduced){ show(D.tot); return; }
    PLAY32=d3.timer(e=>{ const t=Math.min(1,e/9000); show(t*D.tot); if(t>=1){ PLAY32.stop(); PLAY32=null; } }); };
  V.onView(el,instant=>{ if(instant){ ann.style("opacity",1); return; }
    rv.attr("width",0).transition().duration(2200).ease(d3.easeCubicInOut).attr("width",w);
    cg.selectAll(".cty").style("opacity",0).transition().delay(function(){ return 2200*Math.max(0,d3.select(this).datum()-ml)/(w-ml); }).duration(300).style("opacity",1);
    ann.transition().delay(2300).duration(500).style("opacity",1); });
});
(function(){ const b=$('[data-play="32"]'); if(b)b.addEventListener("click",()=>{ const el=$('[data-p="32"]'); if(el&&el._play)el._play(); }); })();


/* =====================================================================
   IB-33 · HEXÀGONS EN EL TEMPS  (simulació a partir de dades reals de gener i juliol)
   ===================================================================== */
const DIV33=V.div(30);
legend(33,el=>{ V.legendRamp(el,{scale:DIV33,min:-30,max:30,ticks:[-30,-15,0,15,30],f:v=>sgn(v,0),title:"Temperatura de l'aire (°C)",lo:"Més freda",hi:"Més calenta"});
  V.legendCat(el,[{c:C.ink,t:"Línia de 0 °C",kind:"line",w:1.4}]); });
const T33=(d,m)=>d.M+(d.J-d.M)*Math.cos(2*Math.PI*m/12);   // m: 0 = gener, 6 = juliol
let MON33=0, PLAY33=null;
const M33=piece(33,(el,w)=>{
  if(!W||!NC){ if(!W)V.world().then(x=>{W=x;M33.redraw();}); return; }
  ncInit();
  if(PLAY33){ PLAY33.stop(); PLAY33=null; setPlay33(false); }
  const mob=w<640, proj=d3.geoEqualEarth().fitWidth(w,{type:"Sphere"}), tr=proj.translate();
  const yT=proj([0,84])[1], yB=proj([0,-57])[1]; proj.translate([tr[0],tr[1]-yT+4]); const h=Math.ceil(yB-yT+8), path=d3.geoPath(proj);
  stage(el,h);
  // canvas: tots els hexàgons (i la línia de 0 °C) · canvas de ressaltat: el grup apuntat · svg: text, notes i hover
  const {c:cH,ctx:xH}=mkCanvas(el,w,h,{label:"Mapa del món fet d'hexàgons sobre la terra, pintats segons la temperatura de l'aire de cada mes: al gener l'interior d'Amèrica del Nord i d'Àsia queda per sota de zero i al juliol el fred es retira cap a l'Àrtic. Gener i juliol són dades reals; els altres mesos, una interpolació."});
  cH.style.transition="opacity .15s";
  const {ctx:xG}=mkCanvas(el,w,h);
  const s=mkSvg(el,w,h,{abs:true});
  const g=s.append("g");
  const rh=mob?4.7:Math.max(5.2,w/200), dx=Math.sqrt(3)*rh, dy=1.5*rh, onLand=landMask(proj,w,h,W.land);
  const H=[], key=new Map();
  for(let r=0,y=rh;y<h;r++,y+=dy)for(let c=0,x=(r&1?dx/2:0)+dx/2;x<w;c++,x+=dx){ if(!onLand(x,y))continue; const ll=proj.invert([x,y]); if(!ll||ll[1]<-57)continue;
    const J=ncAt(NCJ,ll[0],ll[1]), L=ncAt(NCL,ll[0],ll[1]); const d={r,c,x,y,ll,J,L,M:(J+L)/2}; key.set(r*10000+c,d); H.push(d); }
  const hexD=(rr=>"M"+d3.range(6).map(k=>[rr*Math.cos((30+60*k)*RAD),rr*Math.sin((30+60*k)*RAD)].map(v=>v.toFixed(2)).join(",")).join("L")+"Z")(rh*.9);
  const HX=d3.range(6).map(k=>[rh*.9*Math.cos((30+60*k)*RAD),rh*.9*Math.sin((30+60*k)*RAD)]);
  H.forEach((d,i)=>d.i=i);
  // els hexàgons es pinten agrupats per color (franges de 0,25 °C): un sol fill per color
  const NB=361, COLS=d3.range(NB).map(k=>DIV33(-45+k*.25)), BK=new Int16Array(H.length), CB=new Int32Array(NB+1), ORD=new Int32Array(H.length);
  const bucket=v=>Math.max(0,Math.min(NB-1,Math.round((v+45)*4)));
  function hexes(ctx,list,m,scl){ ctx.clearRect(0,0,w,h); const n=list?list.length:H.length; CB.fill(0);
    for(let k=0;k<n;k++){ const d=list?list[k]:H[k], b=bucket(T33(d,m)); BK[d.i]=b; CB[b+1]++; }
    for(let b=0;b<NB;b++)CB[b+1]+=CB[b];
    const pos=CB.slice(); for(let k=0;k<n;k++){ const d=list?list[k]:H[k]; ORD[pos[BK[d.i]]++]=d.i; }
    for(let b=0;b<NB;b++){ const a0=CB[b], a1=CB[b+1]; if(a0===a1)continue; ctx.fillStyle=COLS[b]; ctx.beginPath();
      for(let k=a0;k<a1;k++){ const d=H[ORD[k]], sc=scl?scl(d):1; if(sc<=0)continue;
        ctx.moveTo(d.x+HX[0][0]*sc,d.y+HX[0][1]*sc); for(let e=1;e<6;e++)ctx.lineTo(d.x+HX[e][0]*sc,d.y+HX[e][1]*sc); ctx.closePath(); }
      ctx.fill(); } }
  const VX=d3.range(6).map(k=>[rh*Math.cos((30+60*k)*RAD),rh*Math.sin((30+60*k)*RAD)]);
  const nb=(d,dir)=>{ const odd=d.r&1; if(dir===0)return key.get(d.r*10000+d.c+1); if(dir===1)return key.get((d.r+1)*10000+d.c+(odd?1:0)); return key.get((d.r+1)*10000+d.c+(odd?0:-1)); };
  const EDGE=[[5,0],[0,1],[1,2]];
  let frostA=1;
  const mL=V.t(g,8,h-12,"",{serif:true,weight:600,size:mob?20:28,fill:C.ink,halo:true});
  // anotacions amb els valors reals
  const ann=g.append("g");
  const near=(lon,lat)=>d3.least(H,d=>(d.ll[0]-lon)**2+(d.ll[1]-lat)**2);
  const sib=near(122,63), amz=near(-63,-4);
  if(!mob)V.note(ann,{x:sib.x,y:sib.y,tx:w-(mob?96:112),ty:sib.y+(mob?44:56),kind:"elbow",dot:true,anchor:"start",lines:[["Interior de Sibèria",true],[`${sgn(sib.J,0)} °C al gener`],[`${sgn(sib.L,0)} °C al juliol`]],size:mob?11.5:12.5});
  if(!mob)V.note(ann,{x:amz.x,y:amz.y,tx:amz.x-70,ty:amz.y+62,kind:"elbow",dot:true,anchor:"end",lines:[["Amazònia: gairebé igual tot l'any",true],[`${f1(amz.J)} °C al gener, ${f1(amz.L)} °C al juliol`]]});
  const hvg=g.append("g").style("display","none").attr("pointer-events","none");
  const hring=hvg.append("circle").attr("r",rh*2.3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1);
  let entering=false;
  const hov=hvg.append("path").attr("d",hexD).attr("stroke",C.ink).attr("stroke-width",1.5).attr("vector-effect","non-scaling-stroke");
  const hlab=hvg.append("g");
  let HD=null;   // hexàgon apuntat (es refresca si el mes canvia)
  function drawBase(m,scl){ hexes(xH,null,m,scl); if(frostA<=0)return;
    xH.strokeStyle=C.ink; xH.lineWidth=1.4; xH.lineCap="round"; xH.globalAlpha=frostA; xH.beginPath();
    for(const d of H){ const a=T33(d,m)>=0; for(let dir=0;dir<3;dir++){ const n=nb(d,dir), e=EDGE[dir]; if(n&&(T33(n,m)>=0)!==a){ xH.moveTo(d.x+VX[e[0]][0],d.y+VX[e[0]][1]); xH.lineTo(d.x+VX[e[1]][0],d.y+VX[e[1]][1]); } } }
    xH.stroke(); xH.globalAlpha=1; }
  let GRP=null;   // hexàgons del grup ressaltat
  function paint(m){ MON33=m; const mi=Math.round(m)%12;
    if(!entering)drawBase(m); if(GRP)hexes(xG,GRP,m);
    mL.text(cap(MESOS[mi]));
    const r=$('[data-rng="33"]'); if(r&&+r.value!==mi){ r.value=mi; } if(r)r.setAttribute("aria-valuetext",MESOS[mi]+(mi===0||mi===6?" (dada real)":" (interpolat)"));
    const o=$('[data-v="33"]'); if(o)o.textContent=cap(MESOS[mi])+(mi===0||mi===6?" · dada real":" · interpolat");
    if(HD)hoverHex(HD); }
  el._paint=paint;
  // hover: hexàgon + corba de l'any al tooltip
  const tp=V.tip(el), dl=d3.Delaunay.from(H,d=>d.x,d=>d.y);
  let CN=false;   // país de cada hexàgon (es calcula el primer cop que cal)
  const country=()=>{ if(!CN){ H.forEach(d=>{ const f=findCountry(d.ll[0],d.ll[1]); d.cn=f?nomCA(f):null; }); CN=true; } };
  s.style("cursor","crosshair");
  function hoverHex(d,px,py){ const nw=HD!==d; HD=d; country(); const m=MON33, v=T33(d,m), mi=Math.round(m)%12;
    if(nw){ GRP=d.cn?H.filter(x=>x.cn===d.cn):[d]; hexes(xG,GRP,m); cH.style.opacity=.52; ann.style("opacity",.5); }
    hvg.style("display",null); hring.attr("cx",d.x).attr("cy",d.y); hov.attr("transform",`translate(${d.x},${d.y}) scale(1.45)`).attr("fill",DIV33(v));
    hlab.selectAll("*").remove(); const right=d.x<w-150;
    V.lines(hlab,d.x+(right?rh*2.3+6:-rh*2.3-6),d.y-4,[[`${sgn(v)} °C`,true],[d.cn||llFmt(d.ll[0],d.ll[1])]],{anchor:right?"start":"end",halo:true,size:12.5});
    rampMark(33,v,-30,30,sgn(v)+" °C");
    if(px==null)return;
    const sw=132, sh=40, ys=d3.scaleLinear([Math.min(d.J,d.L)-1,Math.max(d.J,d.L)+1],[sh-4,4]), xs=q=>4+q*(sw-8)/12;
    const cv=d3.range(0,12.01,.25).map(q=>[xs(q),ys(T33(d,q))]);
    const svgS=`<svg width="${sw}" height="${sh}" style="display:block;margin-top:4px;overflow:visible"><path d="M${cv.map(q=>q.map(u=>u.toFixed(1)).join(",")).join("L")}" fill="none" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="2 2"/>`+
      [0,6].map(q=>`<circle cx="${xs(q)}" cy="${ys(T33(d,q))}" r="3" fill="${q?C.vermell:C.blau}"/>`).join("")+
      `<circle cx="${xs(m%12)}" cy="${ys(T33(d,m))}" r="4" fill="none" stroke="${C.ink}" stroke-width="1.2"/></svg>`;
    const grp=d.cn?H.filter(x=>x.cn===d.cn):[d], gm=d3.mean(grp,x=>T33(x,mi));
    tp.show(`<b>${d.cn||llFmt(d.ll[0],d.ll[1])}</b><br>${cap(MESOS[mi])}: ${sgn(T33(d,mi))} °C${mi===0||mi===6?"":" <span style='color:"+C.muted+"'>(interpolat)</span>"}<br><span style="color:${C.muted}">Gener ${sgn(d.J)} · juliol ${sgn(d.L)} °C (reals)${d.cn&&grp.length>1?`<br>Mitjana dels ${grp.length} hexàgons del país: ${sgn(gm)} °C`:""}</span>${svgS}`,px,py); }
  function off33(){ HD=null; GRP=null; xG.clearRect(0,0,w,h); hvg.style("display","none"); tp.hide(); cH.style.opacity=""; ann.style("opacity",null); rampMark(33,null); }
  V.hover(s.node(),(ev,[px,py])=>{ const d=H[dl.find(px,py)]; if(!d||Math.hypot(d.x-px,d.y-py)>rh*2.2)return off33(); hoverHex(d,px,py); },off33);
  paint(MON33);
  V.onView(el,instant=>{ if(instant)return;
    // entrada: els hexàgons creixen en onada d'oest a est (canvas, un timer)
    entering=true; frostA=0; const DL=H.map(d=>100+1100*(d.x/w)+200*(d.y/h)), ease=d3.easeCubicOut;
    const tm=d3.timer(e=>{ frostA=Math.max(0,Math.min(1,(e-1500)/500)); drawBase(MON33,d=>{ const q=(e-DL[d.i])/600; return q<=0?0:q>=1?1:ease(q); });
      if(e>2000){ tm.stop(); entering=false; frostA=1; drawBase(MON33); } });
    ann.style("opacity",0).transition().delay(1700).duration(500).style("opacity",1); });
});
function setPlay33(on){ const b=$('[data-play="33"]'); if(b){ b.textContent=on?"Atura":"Reprodueix"; b.setAttribute("aria-pressed",on?"true":"false"); } }
(function(){ const el=$('[data-p="33"]'), r=$('[data-rng="33"]'), b=$('[data-play="33"]'); if(!el)return;
  if(r)r.addEventListener("input",()=>{ if(PLAY33){ PLAY33.stop(); PLAY33=null; setPlay33(false); } if(el._paint)el._paint(+r.value); else MON33=+r.value; });
  if(b)b.addEventListener("click",()=>{ if(PLAY33){ PLAY33.stop(); PLAY33=null; setPlay33(false); if(el._paint)el._paint(Math.round(MON33)%12); return; }
    if(!el._paint)return; if(V.reduced){ el._paint((Math.round(MON33)+1)%12); return; }
    const m0=Math.round(MON33)%12; setPlay33(true);
    PLAY33=d3.timer(e=>{ const m=m0+e/1000; if(m>=m0+12){ PLAY33.stop(); PLAY33=null; setPlay33(false); el._paint(m0); return; } el._paint(m%12); }); });
})();


/* =====================================================================
   IB-34 · MAPA D'ISOTERMES MARÍ  (dades reals: World Ocean Atlas 2023 + mapa real)
   Camp complet visible d'entrada: franges litogràfiques translúcides (blau a vermell),
   isotermes fines cada 2 °C que esculpeixen els fronts oceànics, isotermes principals cada 5 °C
   amb etiquetes directes i terra silenciosa a sobre (estil IB-28 / «Germany»).
   ===================================================================== */
const WO=DB&&DB.woa;
let WT=null, ZM34=null;   // temperatures (NaN = terra o sense dada) i mitjana de cada fila
function woInit(){ if(WT)return; WT=dec(WO.t,WO.nlat*WO.nlon); ZM34=d3.range(WO.nlat).map(i=>{ let s2=0,n=0; for(let j=0;j<WO.nlon;j++){ const v=WT[i*WO.nlon+j]; if(v===v){ s2+=v; n++; } } return n?s2/n:null; }); }
const woaT=(i,j)=>{ if(i<0||j<0||i>=WO.nlat||j>=WO.nlon)return null; const v=WT[i*WO.nlon+j]; return v===v?v:null; };
const woaAt=(lon,lat)=>woaT(Math.round(lat-WO.lat0),Math.round(lon-WO.lon0));
const DIV34=v=>V.div(16)(v-14);
legend(34,el=>{
  V.legendRamp(el,{scale:DIV34,min:-2,max:30,ticks:[0,7,14,21,28],f:v=>f0(v),title:"Temperatura del mar a la superfície (°C)",lo:"Aigua polar",hi:"Aigua tropical"});
  V.legendCat(el,[{c:C.blau,t:"Isoterma freda (≤ 10 °C)",kind:"line",w:1.2},{c:C.vermell,t:"Isoterma càlida (≥ 20 °C)",kind:"line",w:1.2},{c:C.muted,t:"Corba fina cada 2 °C",kind:"line",w:.6}]);
});
const M34=piece(34,(el,w)=>{
  if(!W||!WO){ if(!W)V.world().then(x=>{W=x;M34.redraw();}); return; }
  woInit();
  const mob=w<640, h=Math.round(mob?Math.min(w*1.1,440):Math.min(w*.58,580)), pts=[];
  for(let lo=-98;lo<=22;lo+=2)pts.push([lo,4],[lo,72]);
  for(let la=4;la<=72;la+=2)pts.push([-98,la],[22,la]);
  const proj=d3.geoConicConformal().parallels([15,55]).rotate([38,0]).fitSize([w,h],{type:"MultiPoint",coordinates:pts});
  stage(el,h);

  // Graella contínua per interpolar suavemente fins a la costa (la terra es pinta a sobre)
  const nx=WO.nlon, ny=WO.nlat; let gv=Float64Array.from(WT);
  for(let it=0;it<24;it++){
    const nv=gv.slice(); let miss=0;
    for(let i=0;i<ny;i++)for(let j=0;j<nx;j++){
      const q=i*nx+j; if(gv[q]===gv[q])continue; let s2=0,n=0;
      if(i>0&&gv[q-nx]===gv[q-nx]){ s2+=gv[q-nx]; n++; }
      if(i<ny-1&&gv[q+nx]===gv[q+nx]){ s2+=gv[q+nx]; n++; }
      if(j>0&&gv[q-1]===gv[q-1]){ s2+=gv[q-1]; n++; }
      if(j<nx-1&&gv[q+1]===gv[q+1]){ s2+=gv[q+1]; n++; }
      if(n)nv[q]=s2/n; else miss++;
    }
    gv=nv; if(!miss)break;
  }
  for(let q=0;q<gv.length;q++)if(gv[q]!==gv[q])gv[q]=-2;

  // 1. Canvas: franges litogràfiques translúcides (esglaons suaus de 2,5 °C mesclats amb blanc) + isotermes fines cada 2 °C + terra silenciosa a sobre
  const {c:cv,ctx}=mkCanvas(el,w,h,{label:"Mapa complet de la temperatura superficial de l'Atlàntic nord amb franges translúcides de blau a vermell i isotermes cada 2 °C i cada 5 °C. El corrent del Golf empeny aigua càlida cap a Europa mentre el corrent del Labrador baixa aigua polar per Terranova. Dades reals NOAA World Ocean Atlas 2023."});
  // Deixem el canvas en flux normal perquè la barra de lectura (.tip.ibv-dock) quedi netament a sota del mapa
  cv.style.position="relative"; el.style.height="";
  const sc=mob?2.5:2, fw=Math.ceil(w/sc), fh=Math.ceil(h/sc);
  const fc=document.createElement("canvas"); fc.width=fw; fc.height=fh;
  { const fx=fc.getContext("2d"), im=fx.createImageData(fw,fh), d=im.data;
    const bandRGB=v=>{
      const q=Math.round((v-14)/2.5)*2.5+14;
      const rgb=d3.rgb(DIV34(q));
      const a=Math.abs(q-14)<1.5?.25:.62;
      return [Math.round(255*(1-a)+rgb.r*a),Math.round(255*(1-a)+rgb.g*a),Math.round(255*(1-a)+rgb.b*a)];
    };
    for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
      const ll=proj.invert([(x+.5)*sc,(y+.5)*sc]); if(!ll)continue;
      const gx=ll[0]-WO.lon0, gy=ll[1]-WO.lat0, j0=Math.floor(gx), i0=Math.floor(gy);
      if(j0<0||i0<0||j0>=nx-1||i0>=ny-1)continue;
      const q=i0*nx+j0;
      if(WT[q]!==WT[q]&&WT[q+1]!==WT[q+1]&&WT[q+nx]!==WT[q+nx]&&WT[q+nx+1]!==WT[q+nx+1])continue;
      const ux=gx-j0, uy=gy-i0;
      const v=(gv[q]*(1-ux)+gv[q+1]*ux)*(1-uy)+(gv[q+nx]*(1-ux)+gv[q+nx+1]*ux)*uy;
      const rgb=bandRGB(v), o=(y*fw+x)*4;
      d[o]=rgb[0]; d[o+1]=rgb[1]; d[o+2]=rgb[2]; d[o+3]=255;
    }
    fx.putImageData(im,0,0);
  }

  // Màscara de terra per retallar les isotermes estrictament a l'oceà (també en el hover)
  const onL=landMask(proj,w,h,landNoAnt());
  function extractIso(ths){
    const out=[];
    d3.contours().size([nx,ny]).thresholds(ths)(gv).forEach(c=>{
      const segs=[];
      c.coordinates.forEach(poly=>poly.forEach(ring=>{
        let seg=[];
        ring.forEach(pt=>{
          const edge=pt[0]<=.05||pt[0]>=nx-1.05||pt[1]<=.05||pt[1]>=ny-1.05;
          if(edge){ if(seg.length>=2)segs.push(seg); seg=[]; return; }
          const p=proj([WO.lon0+pt[0]-.5,WO.lat0+pt[1]-.5]);
          if(p&&p[0]>=-10&&p[0]<=w+10&&p[1]>=-10&&p[1]<=h+10&&!onL(p[0],p[1]))seg.push(p);
          else { if(seg.length>=2)segs.push(seg); seg=[]; }
        });
        if(seg.length>=2)segs.push(seg);
      }));
      out.push({v:c.value,segs});
    });
    return out;
  }
  const MINOR=extractIso(d3.range(0,29,2).filter(v=>v%5!==0));
  const MAJOR=extractIso([0,5,10,15,20,25]);

  function paintCanvas(G){
    const pa=d3.geoPath(proj,ctx);
    ctx.clearRect(0,0,w,h);
    // Franges suaus d'aigua
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(fc,0,0,w,h);
    // Gratícula ultra-fina sobre el mar
    ctx.strokeStyle=V.alpha(C.ink,.08); ctx.lineWidth=.5;
    ctx.beginPath(); pa(d3.geoGraticule().step([10,10])()); ctx.stroke();
    // Isotermes fines cada 2 °C (esculpeixen els fronts oceànics)
    MINOR.forEach(item=>{
      ctx.strokeStyle=V.alpha(item.v<14?C.blau:C.vermell,.24);
      ctx.lineWidth=.6; ctx.lineJoin="round";
      item.segs.forEach(pts=>{
        ctx.beginPath(); pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
      });
    });
    // Isotermes principals cada 5 °C
    MAJOR.forEach(item=>{
      const col=item.v<=10?C.blau:(item.v>=20?C.vermell:C.ink2);
      ctx.strokeStyle=V.alpha(col,.82);
      ctx.lineWidth=mob?1:1.2; ctx.lineJoin="round";
      item.segs.forEach(pts=>{
        ctx.beginPath(); pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
      });
    });
    // Terra silenciosa a sobre (retalla nítidament costes i illes)
    ctx.fillStyle=C.land; ctx.beginPath(); pa(G.land); ctx.fill();
    ctx.strokeStyle="#fff"; ctx.lineWidth=.75; ctx.beginPath(); pa(G.borders); ctx.stroke();
    ctx.strokeStyle="#B5B3AC"; ctx.lineWidth=.75; ctx.beginPath(); pa(G.land); ctx.stroke();
  }
  paintCanvas(W50||{land:landNoAnt(),borders:W.borders});
  if(!W50) world50().then(x=>{ if(x&&el.contains(cv))paintCanvas(x); });

  // 2. Capa SVG: etiquetes d'isotermes principals + 3 anotacions quirúrgiques de mecanisme + hover
  const fg=mkSvg(el,w,h,{abs:true,visible:false});
  const gLab=fg.append("g").attr("pointer-events","none"), placedPts=[];
  MAJOR.forEach(item=>{
    const col=item.v<=10?C.blau:(item.v>=20?C.vermell:C.ink2);
    // Busquem punts nets dins l'oceà obert (lluny de terra, marges i altres etiquetes)
    const ranked=item.segs.filter(s=>s.length>=10).sort((a,b)=>b.length-a.length);
    let placed=0;
    for(const seg of ranked){
      if(placed>=(mob?1:2))break;
      const fracs=placed===0?[.5,.32,.68,.2,.8]:[.74,.24,.58];
      for(const f of fracs){
        const pt=seg[Math.floor(seg.length*f)];
        if(!pt||pt[0]<36||pt[0]>w-36||pt[1]<24||pt[1]>h-24||onL(pt[0],pt[1]))continue;
        if(placedPts.some(q=>Math.hypot(q[0]-pt[0],q[1]-pt[1])<34))continue;
        V.t(gLab,pt[0],pt[1]+3,`${item.v} °C`,{size:11,weight:700,fill:col,anchor:"middle",halo:3.4});
        placedPts.push(pt); placed++; break;
      }
    }
  });

  // 3 anotacions de mecanisme (estil IB-28)
  const ann=fg.append("g").attr("pointer-events","none");
  { let best=null;
    for(let i=0;i<WO.nlat;i++)for(let j=0;j<WO.nlon;j++){
      const v=woaT(i,j); if(v==null)continue;
      const lon=WO.lon0+j, lat=WO.lat0+i; if(lon<-98||lon>22||lat<4||lat>72)continue;
      if(!best||v>best.v)best={v,lon,lat};
    }
    const pGulf=proj([-54,41]), pLab=proj([-50,53]), pBest=proj([best.lon,best.lat]);
    V.note(ann,{x:pGulf[0],y:pGulf[1],tx:Math.min(w-115,pGulf[0]+(mob?32:64)),ty:pGulf[1]+(mob?22:32),kind:"elbow",dot:true,anchor:"start",size:mob?11.5:12.5,
      lines:[["Corrent del Golf",true],["aigua càlida empesa cap a Europa"]]});
    V.note(ann,{x:pLab[0],y:pLab[1],tx:Math.min(w-115,pLab[0]+(mob?24:56)),ty:Math.max(24,pLab[1]-(mob?22:32)),kind:"elbow",dot:true,anchor:"start",size:mob?11.5:12.5,
      lines:[["Corrent del Labrador",true],["aigua polar baixant per Terranova"]]});
    if(!mob){
      V.note(ann,{x:pBest[0],y:pBest[1],tx:pBest[0]+42,ty:Math.min(h-26,pBest[1]+46),kind:"elbow",dot:true,anchor:"start",size:12.5,
        lines:[[`${f1(best.v)} °C`,true],["l'aigua més càlida de la graella"]]});
    }
  }

  // Hover net: ressalta la isoterma més propera + puntet + lectura en 1 línia a sota
  const hv=fg.append("g").attr("pointer-events","none");
  const ALL_ISO=MAJOR.concat(MINOR);
  const hit=fg.insert("rect",":first-child").attr("width",w).attr("height",h).attr("fill","transparent").style("cursor","crosshair");
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  function off34(){ hv.selectAll("*").remove(); ann.style("opacity",1); rampMark(34,null); tp.hide(); }
  V.hover(hit.node(),(ev,[px,py])=>{
    const ll=proj.invert([px,py]);
    if(!ll||onL(px,py)){ off34(); return; }
    const v=woaAt(ll[0],ll[1]);
    if(v==null){ off34(); return; }
    ann.style("opacity",.5);
    hv.selectAll("*").remove();
    // Ressalta la isoterma de temperatura més propera al punt
    const near=d3.least(ALL_ISO,item=>Math.abs(item.v-v));
    if(near){
      const col=near.v<=10?C.blau:(near.v>=20?C.vermell:C.ink);
      const ln=d3.line().x(d=>d[0]).y(d=>d[1]);
      near.segs.forEach(seg=>{
        hv.append("path").attr("d",ln(seg)).attr("fill","none").attr("stroke",col).attr("stroke-width",1.8).attr("stroke-opacity",.95);
      });
    }
    const colP=v<14?C.blau:C.vermell;
    hv.append("circle").attr("cx",px).attr("cy",py).attr("r",5.5).attr("fill",V.alpha(colP,.28)).attr("stroke",C.ink).attr("stroke-width",1.3);
    hv.append("circle").attr("cx",px).attr("cy",py).attr("r",2.2).attr("fill",C.ink);
    const right=px<w*.65;
    V.t(hv,px+(right?10:-10),py-8,`${f1(v)} °C`,{anchor:right?"start":"end",size:12.5,weight:700,fill:colP,halo:3.4});
    rampMark(34,v,-2,30,f1(v)+" °C");
    const zi=Math.round(ll[1]-WO.lat0), zm=ZM34[zi];
    tp.show(`<b>${llFmt(ll[0],ll[1])}</b> · ${f1(v)} °C${zm==null?"":` (${sgn(v-zm)} °C vs mitjana de la latitud)`}`,px,py);
  },off34);

  V.onView(el,instant=>{
    if(instant)return;
    cv.style.opacity=0; gLab.style("opacity",0); ann.style("opacity",0);
    d3.select(cv).transition().duration(650).ease(d3.easeCubicOut).style("opacity",1);
    gLab.transition().delay(300).duration(450).style("opacity",1);
    ann.transition().delay(450).duration(450).style("opacity",1);
  });
});

})();
