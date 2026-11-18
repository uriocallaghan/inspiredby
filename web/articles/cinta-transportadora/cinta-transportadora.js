/* La cinta transportadora de l'Atlàntic — gràfics.
   Dades a dades.js (window.CT_DATA): WOA23, RAPID, NCEP/NCAR, NGRIP, McManus et al. 2004. */
(function(){
"use strict";
const D=window.CT_DATA;
const RM=!!(window.IB&&IB.reduced);
const C={ink:"#121212",ink2:"#4A4A4A",muted:"#7A7A7A",hair:"#DADADA",land:"#ECEBE8",paper:"#FFFFFF",warm:"#C8442A",cold:"#2C5DA8",salt:"#16786C",deep:"#1F3F73",dry:"#9A6326"};
const safe=(f,...a)=>{try{return f(...a)}catch(e){console.error(e)}};
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const rgb=c=>`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
function ramp(stops){const st=stops.map(([v,h])=>[v,hx(h)]);return v=>{if(!(v>st[0][0]))return st[0][1];for(let i=1;i<st.length;i++)if(v<=st[i][0]){const a=st[i-1],b=st[i],t=(v-a[0])/(b[0]-a[0]);return[a[1][0]+(b[1][0]-a[1][0])*t,a[1][1]+(b[1][1]-a[1][1])*t,a[1][2]+(b[1][2]-a[1][2])*t]}return st[st.length-1][1]}}
const num=(v,d=1)=>v.toLocaleString("ca-ES",{minimumFractionDigits:d,maximumFractionDigits:d});
const sgn=(v,d=1)=>(v>0.05?"+":v<-0.05?"−":"")+num(Math.abs(v),d);
const DPR=()=>Math.min(2,window.devicePixelRatio||1);
const mob=()=>innerWidth<900;
const $=id=>document.getElementById(id);

/* --- equation of state: EOS-80 one-atmosphere (Millero & Poisson 1981). With potential temperature it gives potential density. --- */
function rho(S,T){
  const rw=999.842594+6.793952e-2*T-9.095290e-3*T*T+1.001685e-4*T**3-1.120083e-6*T**4+6.536332e-9*T**5;
  const A=0.824493-4.0899e-3*T+7.6438e-5*T*T-8.2467e-7*T**3+5.3875e-9*T**4;
  const B=-5.72466e-3+1.0227e-4*T-1.6546e-6*T*T;
  return rw+A*S+B*Math.pow(Math.max(S,0),1.5)+4.8314e-4*S*S;
}
const sig=(S,T)=>rho(S,T)-1000;

/* ramps */
const R_T=ramp([[-2,"#1F4A8E"],[3,"#4F7DBD"],[9,"#A9C3E2"],[15,"#E4E4E2"],[20,"#F0C3A6"],[24,"#E58B66"],[27,"#C8442A"],[30,"#8A2216"]]);
const R_S=ramp([[32,"#F1F5F3"],[33.5,"#D9EAE4"],[34.5,"#A9D2C7"],[35.2,"#6FB3A2"],[35.9,"#2F8C7B"],[36.6,"#16786C"],[37.3,"#0B4A42"]]);
const R_D=ramp([[20,"#F6F2EA"],[23,"#E6E4E0"],[25,"#C9D6E8"],[26.5,"#8FADD6"],[27.3,"#4F7DBD"],[27.7,"#2C5DA8"],[28.1,"#14284F"]]);
const R_SEC_S=ramp([[33.9,"#F4F7F5"],[34.3,"#E4EFEB"],[34.6,"#C2DDD5"],[34.8,"#8CC2B3"],[34.95,"#4FA290"],[35.1,"#2B8574"],[35.6,"#1B6B5E"],[36.6,"#0B4A42"]]);
const R_COL=ramp([[27.0,"#F2F4F7"],[27.55,"#D6E1EF"],[27.68,"#9DB6D8"],[27.8,"#5B86C2"],[27.88,"#2C5DA8"],[27.95,"#14284F"]]);
const R_AN=ramp([[-25,"#1F4A8E"],[-15,"#2C5DA8"],[-6,"#8FB3DA"],[-1,"#E4E4E2"],[1,"#E4E4E2"],[6,"#EDA27A"],[15,"#C8442A"],[25,"#7E1A16"]]);
function rampCSS(r,a,b){const s=[];for(let i=0;i<=12;i++){const v=a+(b-a)*i/12;s.push(`${rgb(r(v))} ${(i/12*100).toFixed(1)}%`)}return`linear-gradient(90deg,${s.join(",")})`}
function setRamp(el,title,r,a,b,la,lm,lb){el.innerHTML=`<span class="t">${title}</span><div class="bar" style="background:${rampCSS(r,a,b)}"></div><span>${la}</span><span>${lm}</span><span>${lb}</span>`}

/* visibility of heavy canvases */
const vis={};
const vio=new IntersectionObserver(es=>es.forEach(e=>{vis[e.target.id]=e.isIntersecting}),{rootMargin:"200px 0px"});

/* land outlines */
let LAND=null;
const landReady=[];
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json").then(r=>r.json()).then(w=>{LAND=topojson.feature(w,w.objects.land);landReady.forEach(f=>safe(f))}).catch(e=>console.warn("land",e));

/* WOA surface grid */
const SF=D.sfc;
function sfcAt(lon,lat){const i=Math.round((lat-SF.lat0)/SF.d),j=Math.round((((lon-SF.lon0)%360)+360)%360/SF.d)%SF.nlon;if(i<0||i>=SF.nlat)return null;const k=i*SF.nlon+j,t=SF.t[k],s=SF.s[k];return t==null||s==null?null:{t,s,g:sig(s,t)}}

/* ================= 1. DENSITY EXPLORER ================= */
const DEN=(function(){
  const svg=d3.select("#ts"),wrap=$("tsw"),col=$("colc"),cx=col.getContext("2d"),tip=$("tstip");
  const iT=$("dT"),iS=$("dS"),oT=$("dTv"),oS=$("dSv"),oR=$("dRho"),oG=$("dSig"),oV=$("dVer");
  const P=D.prof_labrador;const prof=P.d.map((d,i)=>({d,t:P.t[i],s:P.s[i],g:sig(P.s[i],P.t[i])}));
  const S0=31,S1=38,T0=-2,T1=30;
  let W=0,H=0,x,y,cw=0,ch=0,cur={t:27,s:36.15},target=null,yPar=0,yTarget=0,cloudCv=null;
  let M={l:40,r:44,t:10,b:34};
  function isoT(v,S){let a=-2.5,b=40;const fa=sig(S,a)-v,fb=sig(S,b)-v;if(fa*fb>0)return null;for(let k=0;k<40;k++){const m=(a+b)/2,fm=sig(S,m)-v;if((sig(S,a)-v)*fm<=0)b=m;else a=m}return(a+b)/2}
  function layout(){
    W=wrap.clientWidth;if(W<10)return;const m=mob();M=m?{l:30,r:34,t:8,b:30}:{l:40,r:44,t:10,b:34};H=Math.round(m?clamp(W*1.05,240,300):clamp(W*.78,260,430));
    svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
    x=d3.scaleLinear([S0,S1],[M.l,W-M.r]);y=d3.scaleLinear([T0,T1],[H-M.b,M.t]);
    // cloud of real surface water (canvas inside svg via foreignObject is messy: draw as image)
    const cv=document.createElement("canvas"),dp=DPR();cv.width=W*dp;cv.height=H*dp;const c=cv.getContext("2d");c.scale(dp,dp);c.fillStyle="rgba(122,122,122,.2)";
    for(let k=0;k<SF.t.length;k++){const t=SF.t[k],s=SF.s[k];if(t==null||s==null||s<S0||s>S1)continue;const jx=((Math.sin(k*12.9898)*43758.5453)%1)*.1-.05,jy=((Math.sin(k*78.233)*12345.678)%1)*.1-.05;const px=x(s+jx),py=y(t+jy);c.fillRect(px-.8,py-.8,1.6,1.6)}
    svg.append("image").attr("href",cv.toDataURL()).attr("x",0).attr("y",0).attr("width",W).attr("height",H);
    // isopycnals
    const g=svg.append("g");
    const levels=[20,21,22,23,24,25,26,27,27.5,28];const labLv=new Set([20,22,24,26,27,27.5,28]);
    levels.forEach(v=>{const pts=[];for(let S=S0;S<=S1+1e-6;S+=.05){const T=isoT(v,S);if(T!=null&&T>=T0-.01&&T<=T1+.01)pts.push([x(S),y(T)])}
      if(pts.length<2)return;g.append("path").attr("d",d3.line()(pts)).attr("fill","none").attr("stroke",v===27.5?"#B9B9B9":"#C9C9C9").attr("stroke-width",.8).attr("stroke-dasharray",v===27.5?"3 3":null);
      if(!labLv.has(v))return;const e=pts[pts.length-1];const lab=num(1000+v,v%1?1:0);g.append("text").attr("class","lab m").attr("x",e[0]+3).attr("y",e[1]+(e[1]<M.t+8?10:4)).attr("font-size",10.5).text(lab)});
    g.append("text").attr("class","lab m").attr("x",W-M.r+3).attr("y",M.t+2).attr("font-size",10.5).attr("dy","-0.1em").text("kg/m³");
    // axes
    const ax=svg.append("g").attr("class","ax");
    ax.append("g").attr("transform",`translate(0,${H-M.b})`).call(d3.axisBottom(x).ticks(m?4:7).tickSize(4).tickFormat(d=>num(d,0)));
    ax.append("g").attr("transform",`translate(${M.l},0)`).call(d3.axisLeft(y).tickValues([0,5,10,15,20,25,30]).tickSize(4).tickFormat(d=>d+" °"));
    ax.selectAll(".domain").attr("stroke",C.hair);
    svg.append("text").attr("class","lab m").attr("x",W-M.r).attr("y",H-4).attr("text-anchor","end").text("Salinitat →");
    if(!mob())svg.append("text").attr("class","lab m").attr("x",M.l+4).attr("y",M.t+10).text("↑ Més calenta");
    // freezing line
    const fz=[];for(let S=S0;S<=S1;S+=.5)fz.push([x(S),y(-0.0575*S+1.710523e-3*Math.pow(S,1.5)-2.154996e-4*S*S)]);
    svg.append("path").attr("d",d3.line()(fz)).attr("stroke",C.muted).attr("stroke-width",.6).attr("fill","none");
    if(!mob())svg.append("text").attr("class","lab m").attr("x",x(31.2)).attr("y",y(-1.7)-4).attr("font-size",10.5).text("es glaça");
    // labrador column
    svg.append("path").attr("d",d3.line()(prof.map(p=>[x(p.s),y(p.t)]))).attr("stroke",C.cold).attr("stroke-width",1.6).attr("fill","none");
    const tp=prof.reduce((a,b)=>b.t>a.t?b:a);
    svg.append("text").attr("class","lab").attr("x",x(tp.s)+6).attr("y",y(tp.t)-8).attr("fill",C.cold).attr("font-size",11).text(mob()?"Labrador":"Columna del Labrador");
    // parcel
    const gp=svg.append("g").attr("id","dpar");
    gp.append("line").attr("id","dpx").attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","2 3");
    gp.append("line").attr("id","dpy").attr("stroke",C.ink).attr("stroke-width",.6).attr("stroke-dasharray","2 3");
    gp.append("circle").attr("id","dpc").attr("r",7).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",2);
    gp.append("circle").attr("id","dpd").attr("r",3).attr("fill",C.ink);
    // column canvas
    cw=col.clientWidth;ch=Math.round(m?H:clamp(H*.86,220,380));CM.l=m?40:52;const dp2=DPR();col.width=cw*dp2;col.height=ch*dp2;col.style.height=ch+"px";
    yPar=yTarget=depthY(neutral(sig(cur.s,cur.t)).d);
    update(true);
  }
  // column geometry
  const CM={t:16,b:10,l:52};const NARROW=()=>cw<170;
  const dMax=3600;
  function depthY(d){return CM.t+(ch-CM.t-CM.b)*d/dMax}
  function neutral(g){
    if(g<prof[0].g)return{d:0,k:"float"};
    for(let i=1;i<prof.length;i++){if(prof[i].g>g){const a=prof[i-1],b=prof[i],f=(g-a.g)/(b.g-a.g);return{d:a.d+(b.d-a.d)*clamp(f,0,1),k:"mid"}}}
    return{d:prof[prof.length-1].d,k:"bottom"};
  }
  function drawCol(){
    if(!cw)return;const dp=DPR();cx.setTransform(dp,0,0,dp,0,0);cx.clearRect(0,0,cw,ch);
    const x0=CM.l,x1=cw-8;
    for(let i=0;i<prof.length-1;i++){const a=prof[i],b=prof[i+1];const ya=depthY(a.d),yb=depthY(b.d);const gr=cx.createLinearGradient(0,ya,0,yb);gr.addColorStop(0,rgb(R_COL(a.g)));gr.addColorStop(1,rgb(R_COL(b.g)));cx.fillStyle=gr;cx.fillRect(x0,ya,x1-x0,yb-ya+.5)}
    cx.fillStyle=C.ink;cx.fillRect(x0,CM.t-1,x1-x0,1);
    cx.font=(NARROW()?'10px':'11px')+' "Source Sans 3", Arial, sans-serif';cx.textAlign="right";cx.fillStyle=C.muted;
    (NARROW()?[0,1000,2000,3000]:[0,500,1000,1500,2000,2500,3000,3500]).forEach(d=>{const yy=depthY(d);cx.fillText(d===0?"0 m":IB.fmt(d)+" m",x0-6,yy+4);cx.fillRect(x0-3,yy,3,.6)});
    // density labels on column
    cx.textAlign="left";cx.font='10.5px "Source Sans 3", Arial, sans-serif';
    if(NARROW())cx.font='9.5px "Source Sans 3", Arial, sans-serif';
    [[0,"#121212"],[1500,"#FFFFFF"],[3400,"#FFFFFF"]].forEach(([d,colr])=>{const p=prof.reduce((a,b)=>Math.abs(b.d-d)<Math.abs(a.d-d)?b:a);cx.fillStyle=colr;cx.fillText(num(1000+p.g,2),Math.max(x0+3,x1-62),depthY(p.d)+(d===0?13:4))});
    // parcel
    const yp=yPar,xp=x0+(x1-x0)*(NARROW()?.72:.38),g=sig(cur.s,cur.t);
    cx.strokeStyle=C.ink;cx.lineWidth=.8;cx.setLineDash([2,3]);cx.beginPath();cx.moveTo(xp,CM.t);cx.lineTo(xp,yp);cx.stroke();cx.setLineDash([]);
    cx.beginPath();cx.arc(xp,yp,9,0,6.2832);cx.fillStyle=rgb(R_COL(g));cx.fill();cx.lineWidth=2;cx.strokeStyle=g>27.85?"#FFFFFF":C.ink;cx.stroke();
  }
  function fmtDepth(d){if(d<150)return IB.fmt(Math.round(d/10)*10);if(d<1000)return IB.fmt(Math.round(d/50)*50);return IB.fmt(Math.round(d/100)*100)}
  function update(instant){
    const g=sig(cur.s,cur.t),n=neutral(g);
    oT.textContent=num(cur.t,1)+" °C";oS.textContent=num(cur.s,2);
    oR.textContent=num(1000+g,1)+" kg/m³";
    const gs=prof[0].g;oG.textContent=(g-gs>0?"+":"−")+num(Math.abs(g-gs),2)+" respecte a la superfície del Labrador";
    let v;
    if(n.k==="float")v=g<26?"Molt més lleugera que l'aigua del Labrador: suraria a sobre i no s'enfonsaria gens.":"Una mica més lleugera que la superfície del Labrador: es quedaria a dalt.";
    else if(n.k==="bottom")v="Més densa que tota la columna: baixaria fins al fons, a més de 3.500 metres.";
    else if(n.d<120)v="Es barrejaria amb la capa de dalt, fins a uns "+fmtDepth(n.d)+" metres.";
    else v="Baixaria fins a uns "+fmtDepth(n.d)+" metres, on troba aigua de la seva mateixa densitat.";
    oV.textContent=v;
    yTarget=depthY(n.d);if(instant||RM)yPar=yTarget;
    if(x){const px=x(cur.s),py=y(cur.t);d3.select("#dpc").attr("cx",px).attr("cy",py);d3.select("#dpd").attr("cx",px).attr("cy",py);
      d3.select("#dpx").attr("x1",px).attr("x2",px).attr("y1",py).attr("y2",H-M.b);d3.select("#dpy").attr("x1",M.l).attr("x2",px).attr("y1",py).attr("y2",py)}
    iT.value=cur.t;iS.value=cur.s;
    iT.setAttribute("aria-valuetext",num(cur.t,1)+" °C");iS.setAttribute("aria-valuetext","salinitat "+num(cur.s,2));
  }
  function setPressed(btn){document.querySelectorAll("#dpre button").forEach(b=>b.setAttribute("aria-pressed",b===btn?"true":"false"))}
  iT.addEventListener("input",()=>{target=null;cur.t=+iT.value;setPressed(null);update()});
  iS.addEventListener("input",()=>{target=null;cur.s=+iS.value;setPressed(null);update()});
  document.querySelectorAll("#dpre button").forEach(b=>b.addEventListener("click",()=>{setPressed(b);target={t:+b.dataset.t,s:+b.dataset.s,t0:cur.t,s0:cur.s,st:performance.now()};if(RM){cur.t=target.t;cur.s=target.s;target=null;update()}}));
  // drag on the diagram
  const node=svg.node();let drag=false;
  function fromEv(e){const r=node.getBoundingClientRect(),sx=W/r.width;const px=(e.clientX-r.left)*sx,py=(e.clientY-r.top)*sx;return{s:clamp(x.invert(px),S0,S1),t:clamp(y.invert(py),-1.9,T1)}}
  node.addEventListener("pointerdown",e=>{if(!x)return;drag=true;node.setPointerCapture(e.pointerId);const p=fromEv(e);target=null;cur.s=+p.s.toFixed(2);cur.t=+p.t.toFixed(1);setPressed(null);update()});
  function showTip(e,p){const r=node.getBoundingClientRect();tip.textContent=`${num(p.t,1)} °C · salinitat ${num(p.s,2)} · ${num(1000+sig(p.s,p.t),1)} kg/m³`;tip.style.opacity=1;const tw=tip.offsetWidth;tip.style.transform=`translate(${clamp(e.clientX-r.left+12,0,r.width-tw)}px,${clamp(e.clientY-r.top-30,0,r.height-24)}px)`}
  node.addEventListener("pointermove",e=>{if(!x)return;const p=fromEv(e);if(drag){cur.s=+p.s.toFixed(2);cur.t=+p.t.toFixed(1);update();if(e.pointerType!=="mouse")showTip(e,p);return}showTip(e,p)});
  node.addEventListener("pointerdown",e=>{if(x&&e.pointerType!=="mouse")showTip(e,fromEv(e))});
  node.addEventListener("pointerup",()=>{drag=false});node.addEventListener("pointercancel",()=>{drag=false});
  node.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0});
  function frame(now,dt){
    if(target){const f=clamp((now-target.st)/700,0,1),e=ease(f);cur.t=+lerp(target.t0,target.t,e).toFixed(2);cur.s=+lerp(target.s0,target.s,e).toFixed(3);update();if(f>=1)target=null}
    const dy=yTarget-yPar;if(Math.abs(dy)>.3)yPar+=dy*Math.min(1,dt*3.2);else yPar=yTarget;
    drawCol();
  }
  return{layout,frame};
})();

/* ================= 2. GLOBE SCROLLY ================= */
const GLOBE=(function(){
  const cv=$("globe"),ctx=cv.getContext("2d"),wrap=$("gwrap"),ov=$("gov"),gbox=$("gbox"),graphic=$("ggraphic");
  const nameEl=$("gName"),subEl=$("gSub"),rampEl=$("gRamp");
  let W=0,H=0,R=0,proj=d3.geoOrthographic().clipAngle(90).precision(.4),path=d3.geoPath(proj,ctx);
  const grat=d3.geoGraticule10();
  // dots
  const dots=[];
  for(let i=0;i<SF.nlat;i++){const la=SF.lat0+i*SF.d,stp=Math.max(1,Math.round(1/Math.cos(la*Math.PI/180)));for(let j=0;j<SF.nlon;j++){if((j+i)%stp)continue;const k=i*SF.nlon+j,t=SF.t[k],s=SF.s[k];if(t==null||s==null)continue;dots.push({lon:SF.lon0+j*SF.d,lat:SF.lat0+i*SF.d,t,s,g:sig(s,t)})}}
  const NB=36;const LAY={
    t:{r:R_T,a:-2,b:30,name:"Temperatura del mar",sub:"Mitjana anual de la superfície",ramp:["Temperatura de la superfície","−2 °C","14 °C","30 °C"]},
    s:{r:R_S,a:32,b:37.5,name:"Salinitat del mar",sub:"Grams de sal per quilo d'aigua, aproximadament",ramp:["Salinitat de la superfície","32","34,8","37,5"]},
    g:{r:R_D,a:20,b:28.2,name:"Densitat de l'aigua",sub:"A la superfície, calculada amb la temperatura i la sal",ramp:["Densitat (kg/m³)","1.020","1.024","1.028"]}};
  for(const key in LAY){const L=LAY[key];L.bins=[];L.cols=[];for(let b=0;b<NB;b++){L.bins.push([]);L.cols.push(rgb(L.r(L.a+(L.b-L.a)*(b+.5)/NB)))}
    L.idx=dots.map(d=>{const v=key==="g"?d.g:d[key];return clamp(Math.floor((v-L.a)/(L.b-L.a)*NB),0,NB-1)})}
  // currents (schematic) — [lon,lat]
  const PATHS={
    gulf:{g:"warm",pts:[[-86,22.5],[-83.5,24],[-80.6,24.6],[-79.8,26.5],[-79.9,29],[-79.2,31.5],[-76.5,34],[-74.2,35.8],[-70,37.6],[-63,39.5],[-55,41.5],[-48,43.5],[-43,47],[-37,50],[-28,52.5],[-20,55],[-13,58],[-7,60.5],[-1,63],[4,65.5],[9,68.5],[14,71.2],[19,73]]},
    irm:{g:"north",pts:[[-37,50],[-33,54],[-30,58],[-31.5,61.5],[-36,63.5],[-40,61.5],[-43,59.8],[-47.5,60.8],[-51,63],[-53.5,65.5]]},
    nord:{g:"north",pts:[[-1,63],[-6,66],[-8,69.5],[-5,73],[0,75.5],[6,78],[10,79.5]]},
    trop:{g:"trop",pts:[[-10,-5],[-20,-6],[-30,-6.5],[-35,-5],[-40,-1.5],[-46,2],[-52,5.5],[-58,10],[-63,13],[-70,14.5],[-77,16],[-83,18],[-86,21],[-86,22.5]]},
    south:{g:"trop",pts:[[18,-35],[12,-31],[6,-26],[0,-20],[-6,-14],[-10,-9],[-10,-5]]},
    gyre:{g:"gyre",pts:[[-37,50],[-30,45],[-22,40],[-18,33],[-20,26],[-26,20],[-36,17],[-48,16],[-58,15],[-63,13]]},
    ov1:{g:"deep",pts:[[2,74],[-4,71],[-12,68.5],[-20,67],[-26,66],[-30,64.5],[-35,62.5],[-39,60.5],[-43,59],[-47,58.5],[-51,57.5],[-54,55],[-53,51.5],[-50,47.5],[-52,44],[-57,42],[-64,39.5],[-70,36.5],[-73.5,33],[-75,29],[-72.5,24.5],[-66,20.5],[-58,16],[-50,9],[-44,2.5],[-37,-4],[-34,-10],[-36,-18],[-40,-25],[-45,-32],[-50,-39],[-48,-46],[-38,-52],[-22,-56],[-5,-57],[12,-56],[28,-54]]},
    ov2:{g:"deep",pts:[[-6,61.5],[-11,60.5],[-17,60],[-23,59],[-28,58],[-32,58.5],[-35,60],[-38,60.5],[-41,59.6]]}};
  for(const k in PATHS){const P=PATHS[k];const dense=[];for(let i=0;i<P.pts.length-1;i++){const a=P.pts[i],b=P.pts[i+1],ip=d3.geoInterpolate(a,b),n=Math.max(2,Math.ceil(d3.geoDistance(a,b)/0.006));for(let s=0;s<n;s++)dense.push(ip(s/n))}dense.push(P.pts[P.pts.length-1]);P.d=dense;P.len=dense.length;
    const n=Math.max(4,Math.round(P.len/(P.g==="deep"?40:30)));P.parts=[];for(let i=0;i<n;i++)P.parts.push({u:i/n+Math.random()*.6/n})}
  const GC={warm:C.warm,north:C.warm,trop:C.warm,gyre:"#E08A6B",deep:"#1F4A8E"};
  const SINK=[["nord",-2,74.5],["irm",-37,61],["isl",-24,59.5],["lab",-53,57.5]];
  // steps
  const ST=[
    {v:[-30,14,1.0],lay:"t",cur:{},ann:[[-38,24,"tropic",0,0,"c"],[-35,63,"north",0,0,"c"],[-25,0,"<span style='color:#7C8C9C;font-style:italic'>Equador</span>",0,0,"c"]]},
    {v:[-52,33,1.55],lay:"t",cur:{warm:1,gyre:.5,trop:.6},ann:[[-79.8,26.5,"<b>Corrent del Golf</b>32 milions de m³/s",30,30,"l"],[-38,49.5,"<b>Corrent de l'Atlàntic Nord</b>",10,-46,"c"]]},
    {v:[-38,26,1.25],lay:"s",cur:{warm:1,gyre:.5,trop:.6},ann:[[-45,24.5,"smax",0,48,"c"],[-28,62,"snorth",30,-10,"l"]]},
    {v:[-36,47,1.45],lay:"t",cur:{warm:1,north:.8},heat:1,ann:[[-79.5,25.5,"tflor",-6,-26,"r"],[5.5,66.5,"tnor",14,6,"l"],[-29,55,"<b>La calor passa a l'aire</b>",0,-62,"c"]]},
    {v:[-34,50,1.4],lay:"g",cur:{warm:.9,north:.9},ann:[[-79.5,25.5,"gflor",10,40,"l"],[-1,74.5,"ggrs",20,-8,"l"]]},
    {v:[-28,62,2.0],lay:"g",cur:{warm:.6,north:.8,nord:1},sink:1,ann:[[-2,74.5,"<b>Mars nòrdics</b>",-14,-18,"r"],[-37,61,"<b>Mar d'Irminger</b>",-6,30,"r"],[-24,59.5,"<b>Conca d'Islàndia</b>",10,30,"l"],[-53,57.5,"<b>Mar del Labrador</b>",-10,-22,"r"]]},
    {v:[-40,18,1.0],lay:"t",cur:{warm:.35,north:.3,deep:1},sink:1,ann:[[-72,33,"<b>Aigua profunda de l'Atlàntic nord</b>1.500–4.000 m, cap al sud",-22,8,"r"],[-25,-56,"<b>Oceà Antàrtic</b>l'aigua torna a pujar",0,-30,"c"]]},
    {v:[-15,-8,.8],lay:"t",cur:{warm:.6,north:.4,trop:.6,deep:1},sink:1,ann:[[40,-48,"<b>Cap a l'Índic i el Pacífic</b>",0,-12,"c"]]}];
  const S={step:0,rot:[30,-14],sc:1,lay:"t",layF:1,layPrev:"t",cur:{warm:0,north:0,trop:0,gyre:0,deep:0,nord:0},sink:0,heat:0};
  const val=(key,lon,lat)=>{const p=sfcAt(lon,lat);return p?p[key]:null};
  function annText(s){
    if(s==="tropic"){const v=val("t",-45.5,10.5);return`<b>Uns ${num(v,0)} °C</b>als tròpics`}
    if(s==="north"){const v=val("t",-34.5,62.5);return`<b>Uns ${num(v,0)} °C</b>al sud d'Islàndia`}
    if(s==="smax"){return`<b>Fins a ${num(val("s",-45.5,24.5),1)}</b>l'aigua més salada de l'Atlàntic obert`}
    if(s==="snorth"){return`<b>${num(val("s",-26.5,62.5),1)}</b>encara salada al nord`}
    if(s==="tflor"){return`<b>${num(val("t",-79.5,25.5),0)} °C</b>davant de Florida`}
    if(s==="tnor"){return`<b>${num(val("t",5.5,66.5),0)} °C</b>davant de Noruega`}
    if(s==="gflor"){return`<b>${num(1000+val("g",-79.5,25.5),1)} kg/m³</b>davant de Florida`}
    if(s==="ggrs"){return`<b>${num(1000+val("g",-0.5,74.5),1)} kg/m³</b>mar de Groenlàndia, mitjana anual`}
    return s;
  }
  let anns=[];
  function buildAnn(i){
    anns.forEach(a=>{a.el.style.opacity=0;setTimeout(()=>a.el.remove(),450)});anns=[];
    (ST[i].ann||[]).forEach(([lon,lat,s,dx,dy,al])=>{const el=document.createElement("div");el.className="ann "+(al==="r"?"r":al==="c"?"c":"");el.innerHTML=annText(s);el.style.opacity=0;ov.appendChild(el);anns.push({el,lon,lat,dx,dy,al,lead:dx!==0||dy!==0});requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.opacity=1}))});
  }
  function goStep(i){S.step=i;const st=ST[i];if(st.lay!==S.lay){S.layPrev=S.lay;S.lay=st.lay;S.layF=RM?1:0}
    const L=LAY[S.lay];nameEl.textContent=L.name;subEl.textContent=L.sub;setRamp(rampEl,L.ramp[0],L.r,L.a,L.b,L.ramp[1],L.ramp[2],L.ramp[3]);buildAnn(i)}
  function layout(){
    const m=mob(),colW=graphic.clientWidth;let size;
    if(!m)size=Math.min(colW,innerHeight-190);else size=Math.min(colW,innerHeight*.38);
    size=Math.max(220,Math.floor(size));gbox.style.maxWidth=size+"px";wrap.style.width=size+"px";
    W=H=size;const dp=DPR();cv.width=W*dp;cv.height=H*dp;cv.style.height=H+"px";R=W/2-4;
  }
  let CEN=[0,0];
  function project(lon,lat){if(d3.geoDistance([lon,lat],CEN)>Math.PI/2-.02)return null;return proj([lon,lat])}
  function place(a){const p=project(a.lon,a.lat);if(!p){a.el.style.visibility="hidden";a.p=null;return}a.el.style.visibility="visible";a.p=p;
    const w=a.el.offsetWidth,h=a.el.offsetHeight,K=W/600;let X=p[0]+a.dx*K,Y=p[1]+a.dy*K;a.ax=X;a.ay=Y;X=a.al==="r"?X-w:a.al==="c"?X-w/2:X;a.el.style.transform=`translate(${clamp(X,2,W-w-2)}px,${clamp(Y-h/2,2,H-h-2)}px)`}
  function drawDots(key,alpha){const L=LAY[key];for(let b=0;b<NB;b++)L.bins[b].length=0;
    const c=CEN;const cl=c[0]*Math.PI/180,cp=c[1]*Math.PI/180,sinc=Math.sin(cp),cosc=Math.cos(cp);
    const rr=clamp(proj.scale()*0.0349*.31,.6,5);
    for(let i=0;i<dots.length;i++){const d=dots[i];const la=d.lat*Math.PI/180,lo=d.lon*Math.PI/180;const cosd=sinc*Math.sin(la)+cosc*Math.cos(la)*Math.cos(lo-cl);if(cosd<0.02)continue;const p=proj([d.lon,d.lat]);L.bins[L.idx[i]].push(p[0],p[1],rr*(.55+.45*cosd))}
    ctx.globalAlpha=alpha;for(let b=0;b<NB;b++){const a=L.bins[b];if(!a.length)continue;ctx.fillStyle=L.cols[b];ctx.beginPath();for(let k=0;k<a.length;k+=3){ctx.moveTo(a[k]+a[k+2],a[k+1]);ctx.arc(a[k],a[k+1],a[k+2],0,6.2832)}ctx.fill()}ctx.globalAlpha=1}
  function ptAt(P,u){const f=clamp(u,0,1)*(P.len-1),i=Math.floor(f),t=f-i,a=P.d[i],b=P.d[Math.min(i+1,P.len-1)];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
  function drawCurrents(dt,t){
    for(const k in PATHS){const P=PATHS[k];const al=S.cur[P.g==="north"&&k==="nord"?"nord":P.g]??0;const a=k==="nord"?Math.max(S.cur.nord,S.cur.north*.6):al;if(a<.02)continue;
      const col=GC[P.g],deep=P.g==="deep",spd=RM?0:(deep?9:12)/P.len;
      ctx.strokeStyle=col;ctx.lineCap="round";
      // faint guide
      ctx.globalAlpha=a*(deep?.4:.35);ctx.lineWidth=deep?1:1.1;ctx.setLineDash(deep?[3,4]:[]);ctx.beginPath();let pen=false;for(let i=0;i<P.len;i+=2){const q=project(P.d[i][0],P.d[i][1]);if(!q){pen=false;continue}pen?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);pen=true}ctx.stroke();ctx.setLineDash([]);
      const tl=(deep?20:16)/P.len;
      for(const p of P.parts){p.u+=dt*spd;if(p.u>1)p.u-=1;const fa=a*Math.min(1,p.u*8,(1-p.u)*8);if(fa<.02)continue;const seg=[];for(let s=0;s<=8;s++){const q=ptAt(P,p.u-tl*(1-s/8));seg.push(project(q[0],q[1]))}
        for(let pass=0;pass<2;pass++){ctx.strokeStyle=pass?col:"#FFFFFF";ctx.lineWidth=pass?(deep?2.2:2.6):(deep?4.6:5);for(let s=1;s<seg.length;s++){const a0=seg[s-1],a1=seg[s];if(!a0||!a1)continue;ctx.globalAlpha=fa*(pass?1:.8)*(s/(seg.length-1));ctx.beginPath();ctx.moveTo(a0[0],a0[1]);ctx.lineTo(a1[0],a1[1]);ctx.stroke()}}
        const hd=seg[seg.length-1];if(hd){ctx.globalAlpha=fa;ctx.fillStyle=col;ctx.beginPath();ctx.arc(hd[0],hd[1],deep?2.2:2.6,0,6.2832);ctx.fill()}}
    }
    ctx.globalAlpha=1;
  }
  function drawSink(t){if(S.sink<.02)return;for(const [id,lon,lat] of SINK){const p=project(lon,lat);if(!p)continue;const K=W/600;
    for(let i=0;i<3;i++){const f=((RM?.5:t*.45)+i/3)%1,r=(16*(1-f)+3)*K;ctx.globalAlpha=S.sink*(.15+.7*f);ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p[0],p[1],r,0,6.2832);ctx.stroke()}
    ctx.globalAlpha=S.sink;ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(p[0],p[1],2.6*K+.6,0,6.2832);ctx.fill()}ctx.globalAlpha=1}
  const HEATP=[...Array(26)].map((_,i)=>({u:.48+.5*((i*.618)%1),ph:(i*.37)%1,off:((i*.73)%1-.5)}));
  function drawHeat(t){if(S.heat<.02)return;const P=PATHS.gulf,K=W/600;ctx.strokeStyle=C.warm;ctx.lineWidth=1.2;
    for(const h of HEATP){const q=ptAt(P,h.u),p=project(q[0]+h.off*6,q[1]+h.off*2);if(!p)continue;const f=((RM?.4:t*.35)+h.ph)%1;const y0=p[1]-f*26*K;ctx.globalAlpha=S.heat*.75*Math.sin(f*Math.PI);ctx.beginPath();for(let s=0;s<=8;s++){const yy=y0-s*1.6*K,xx=p[0]+Math.sin(s*.9+f*8)*2.2*K;s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke()}ctx.globalAlpha=1}
  let lastT=0;
  function frame(now,dt){
    if(!W)return;const t=now/1000;
    const st=ST[S.step];const k=RM?1:Math.min(1,dt*2.2);
    S.rot[0]=lerp(S.rot[0],-st.v[0],k);S.rot[1]=lerp(S.rot[1],-st.v[1],k);S.sc=lerp(S.sc,st.v[2],k);
    for(const g of ["warm","north","trop","gyre","deep","nord"])S.cur[g]=lerp(S.cur[g],st.cur[g]||0,RM?1:Math.min(1,dt*2));
    S.sink=lerp(S.sink,st.sink||0,RM?1:Math.min(1,dt*2));S.heat=lerp(S.heat,st.heat||0,RM?1:Math.min(1,dt*2));
    S.layF=Math.min(1,S.layF+dt*1.4);
    proj.rotate([S.rot[0],S.rot[1]]).scale(R*S.sc).translate([W/2,H/2]);CEN=[-S.rot[0],-S.rot[1]];
    const dp=DPR();ctx.setTransform(dp,0,0,dp,0,0);ctx.clearRect(0,0,W,H);
    ctx.save();ctx.beginPath();path({type:"Sphere"});ctx.fillStyle="#FBFBFA";ctx.fill();ctx.clip();
    ctx.beginPath();path(grat);ctx.strokeStyle="#EFEFED";ctx.lineWidth=.6;ctx.stroke();
    if(LAND){ctx.beginPath();path(LAND);ctx.fillStyle=C.land;ctx.fill()}
    const dimF=1-Math.max(.3*S.cur.warm,.5*S.cur.deep,.2*S.sink);if(S.layF<1)drawDots(S.layPrev,(1-S.layF)*dimF);drawDots(S.lay,(S.layF<1?S.layF:1)*dimF);
    if(LAND){ctx.beginPath();path(LAND);ctx.strokeStyle="#D6D4CF";ctx.lineWidth=.5;ctx.stroke()}
    drawHeat(t);drawCurrents(dt,t);drawSink(t);
    ctx.restore();
    ctx.beginPath();path({type:"Sphere"});ctx.strokeStyle=C.hair;ctx.lineWidth=1;ctx.stroke();
    // leader lines
    for(const a of anns){place(a);if(a.p&&a.lead&&!mob()){ctx.strokeStyle=C.ink;ctx.globalAlpha=.7;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.p[0],a.p[1]);ctx.lineTo(a.ax,a.ay);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(a.p[0],a.p[1],1.8,0,6.2832);ctx.fill()}}
  }
  goStep(0);
  return{layout,frame,goStep};
})();

/* ================= 3. SECTION SCROLLY ================= */
const SEC=(function(){
  const cv=$("sec"),ctx=cv.getContext("2d"),wrap=$("xwrap"),ov=$("xov"),box=$("xbox"),graphic=$("xgraphic"),tip=$("xtip"),nameEl=$("xName"),rampEl=$("xRamp");
  const X=D.sec,LAT=X.lat,DEP=X.depth,NL=LAT.length,ND=DEP.length,DMAX=5500,EXP=.5;
  let W=0,H=0,M={l:44,r:10,t:8,b:26},img={},layer="t",prev="t",lf=1,step=0,arrows=0;
  const xs=lat=>M.l+(W-M.l-M.r)*(lat-LAT[0])/(LAT[NL-1]-LAT[0]);
  const ys=d=>M.t+(H-M.t-M.b)*Math.pow(d/DMAX,EXP);
  const inv=(px,py)=>[LAT[0]+(px-M.l)/(W-M.l-M.r)*(LAT[NL-1]-LAT[0]),DMAX*Math.pow(clamp((py-M.t)/(H-M.t-M.b),0,1),1/EXP)];
  function sample(arr,lat,d){const fi=(lat-LAT[0]),i=Math.floor(fi),ti=fi-i;if(i<0||i>=NL-1)return null;let k=0;while(k<ND-1&&DEP[k+1]<d)k++;if(k>=ND-1)return null;const tk=(d-DEP[k])/(DEP[k+1]-DEP[k]);
    const v00=arr[k][i],v01=arr[k][i+1],v10=arr[k+1][i],v11=arr[k+1][i+1];const q=[v00,v01,v10,v11];if(q.some(v=>v==null)){const nn=[[v00,(1-ti)*(1-tk)],[v01,ti*(1-tk)],[v10,(1-ti)*tk],[v11,ti*tk]].filter(a=>a[0]!=null);if(!nn.length||nn.reduce((s,a)=>s+a[1],0)<.35)return null;let s=0,w=0;nn.forEach(a=>{s+=a[0]*a[1];w+=a[1]});return s/w}
    return(v00*(1-ti)+v01*ti)*(1-tk)+(v10*(1-ti)+v11*ti)*tk}
  const LAYS={t:{a:X.t,r:R_T,name:"Temperatura",ramp:["Temperatura potencial","−1 °C","13 °C","27 °C"],lo:-1,hi:27},s:{a:X.s,r:R_SEC_S,name:"Salinitat",ramp:["Salinitat","33,9","35,25","36,6"],lo:33.9,hi:36.6}};
  function build(key){const L=LAYS[key],dp=1,w=Math.ceil(W),h=Math.ceil(H),oc=document.createElement("canvas");oc.width=w;oc.height=h;const c=oc.getContext("2d"),im=c.createImageData(w,h),dd=im.data;const st=2;
    for(let py=Math.floor(M.t);py<h-M.b;py+=st){const d=inv(0,py+st/2)[1];for(let px=Math.floor(M.l);px<w-M.r;px+=st){const lat=inv(px+st/2,0)[0];const v=sample(L.a,lat,d);let col;if(v==null)col=[201,197,188];else col=L.r(v);
      for(let yy=0;yy<st;yy++)for(let xx=0;xx<st;xx++){const o=((py+yy)*w+(px+xx))*4;if(px+xx>=w||py+yy>=h)continue;dd[o]=col[0];dd[o+1]=col[1];dd[o+2]=col[2];dd[o+3]=255}}}
    c.putImageData(im,0,0);return oc}
  // schematic arrows [lat,depth]
  const ARR=[{c:C.warm,w:2.4,p:[[-48,650],[-35,420],[-15,220],[5,130],[25,90],[45,80],[58,90],[61,140]]},
    {c:C.ink,w:2,p:[[61.5,180],[62,700],[60.5,1400],[56,2000]]},
    {c:C.cold,w:2.4,p:[[56,2000],[40,2300],[20,2500],[0,2600],[-20,2700],[-40,2900],[-50,3100]]},
    {c:C.ink,w:2,p:[[-50,3100],[-58,2200],[-60,1200],[-57,500],[-50,300]]},
    {c:C.deep,w:2,p:[[-64,4300],[-50,4900],[-30,5200],[-10,5250],[10,5200],[30,5150]]}];
  const ANNS=[
    [[10,60,"<b>Capa calenta</b>només uns centenars de metres",0,0,"c"],[0,3600,"<b>Aigua freda</b>de −1 a 4 °C",0,0,"c"]],
    [[12,2700,"<b>Aigua profunda de l'Atlàntic nord</b>uns 3 °C · salinitat 34,9–35,0",0,0,"c"],[57,2000,"<span>Surt del nord</span>",0,0,"c"],[35.5,600,"<b>Aigua mediterrània</b>surt per Gibraltar",0,0,"r"]],
    [[-24,820,"<b>Aigua intermèdia antàrtica</b>menys salada, uns 34,3",0,0,"c"],[-28,4700,"<b>Aigua de fons antàrtica</b>per sota de 0,5 °C",0,0,"c"],[12,2450,"<span>Aigua profunda de l'Atlàntic nord</span>",0,0,"c"]],
    [[18,40,"<b>Aigua calenta cap al nord</b>",0,0,"c"],[54,1250,"<b>S'enfonsa</b>",0,0,"r"],[15,2950,"<b>Torna cap al sud</b>",0,0,"c"],[-60,900,"<b>Torna a pujar</b>",0,0,"l"]]];
  let anns=[];
  function buildAnn(i){anns.forEach(a=>{a.el.style.opacity=0;setTimeout(()=>a.el.remove(),450)});anns=[];(ANNS[i]||[]).forEach(([lat,d,h,dx,dy,al])=>{const el=document.createElement("div");el.className="ann "+(al==="r"?"r":al==="c"?"c":"");el.innerHTML=h;el.style.opacity=0;ov.appendChild(el);const a={el,lat,d,al};anns.push(a);place(a);requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.opacity=1}))})}
  function place(a){if(!W)return;const w=a.el.offsetWidth,h=a.el.offsetHeight;let x=xs(a.lat),y=ys(a.d);x=a.al==="r"?x-w:a.al==="c"?x-w/2:x;a.el.style.transform=`translate(${clamp(x,2,W-w-2)}px,${clamp(y-h/2,2,H-h-2)}px)`;a.el.style.color=(layer==="s"&&a.d>1500&&a.d<3200)||(layer==="t"&&a.d<300)?C.ink:C.ink}
  function goStep(i){step=i;const L=i===0?"t":"s";if(L!==layer){prev=layer;layer=L;lf=RM?1:0}nameEl.textContent=LAYS[layer].name;const R=LAYS[layer];setRamp(rampEl,R.ramp[0],R.r,R.lo,R.hi,R.ramp[1],R.ramp[2],R.ramp[3]);buildAnn(i)}
  function layout(){const m=mob(),colW=graphic.clientWidth;let w=colW;if(!m){w=Math.min(colW,Math.floor((innerHeight-200)/.62))}box.style.maxWidth=Math.max(260,w)+"px";
    W=wrap.clientWidth;if(W<10)return;H=Math.round(m?clamp(W*.66,180,innerHeight*.36):W*.62);M=m?{l:36,r:6,t:6,b:22}:{l:46,r:10,t:8,b:26};
    const dp=DPR();cv.width=W*dp;cv.height=H*dp;cv.style.height=H+"px";img.t=build("t");img.s=build("s");anns.forEach(place)}
  function arrowPath(pts,off){ctx.beginPath();pts.forEach((q,i)=>{const x=xs(q[0]),y=ys(q[1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}
  function head(pts){const n=pts.length,a=pts[n-2],b=pts[n-1],x0=xs(a[0]),y0=ys(a[1]),x1=xs(b[0]),y1=ys(b[1]),an=Math.atan2(y1-y0,x1-x0),h=7;ctx.beginPath();ctx.moveTo(x1-h*Math.cos(an-.5),y1-h*Math.sin(an-.5));ctx.lineTo(x1,y1);ctx.lineTo(x1-h*Math.cos(an+.5),y1-h*Math.sin(an+.5));ctx.stroke()}
  function frame(now,dt){if(!W||!img.t)return;const t=now/1000;lf=Math.min(1,lf+dt*1.5);arrows=lerp(arrows,step===3?1:0,RM?1:Math.min(1,dt*2.5));
    const dp=DPR();ctx.setTransform(dp,0,0,dp,0,0);ctx.clearRect(0,0,W,H);
    ctx.drawImage(img[prev],0,0,W,H);if(lf<1){ctx.globalAlpha=lf}ctx.drawImage(img[layer],0,0,W,H);ctx.globalAlpha=1;
    // axes
    ctx.font=`${mob()?10:11}px "Source Sans 3", Arial, sans-serif`;ctx.fillStyle=C.muted;ctx.textAlign="right";
    [0,200,500,1000,2000,3000,4000,5000].forEach(d=>{if(mob()&&(d===200||d===3000))return;const y=ys(d);ctx.fillText(d===0?"0 m":IB.fmt(d),M.l-5,y+(d===0?8:4));ctx.fillRect(M.l-3,y,3,.7)});
    ctx.textAlign="center";[[-60,"60° S"],[-30,"30° S"],[0,"Equador"],[30,"30° N"],[60,"60° N"]].forEach(([la,s])=>{const x=xs(la);ctx.fillText(s,x,H-6);ctx.fillRect(x,H-M.b,.7,3)});
    {const xa=xs(37.5);ctx.save();ctx.font=`italic 10.5px "Source Serif 4", Georgia, serif`;ctx.textAlign="left";ctx.lineJoin="round";ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=3;ctx.strokeText("Açores",xa+4,M.t+12);ctx.fillStyle=C.ink;ctx.fillText("Açores",xa+4,M.t+12);ctx.restore()}
    ctx.textAlign="left";ctx.fillStyle=C.ink2;if(!mob()){ctx.fillText("← Antàrtida",M.l+2,H-M.b-6)}ctx.textAlign="right";if(!mob())ctx.fillText("Islàndia →",W-M.r-2,H-M.b-6);
    if(arrows>.02){ctx.save();ctx.globalAlpha=arrows;ctx.lineCap="round";ctx.lineJoin="round";for(const A of ARR){ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=A.w+3;ctx.setLineDash([]);arrowPath(A.p);ctx.strokeStyle=A.c;ctx.lineWidth=A.w;ctx.setLineDash([9,7]);ctx.lineDashOffset=-(RM?0:t*22);arrowPath(A.p);ctx.setLineDash([]);head(A.p)}ctx.restore()}
    anns.forEach(place);
  }
  const secTip=e=>{if(!W)return;const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;if(px<M.l||px>W-M.r||py<M.t||py>H-M.b){tip.style.opacity=0;return}const[lat,d]=inv(px,py);const t=sample(X.t,lat,d),s=sample(X.s,lat,d);if(t==null){tip.style.opacity=0;return}
    tip.textContent=`${num(Math.abs(lat),0)}° ${lat<0?"S":"N"} · ${IB.fmt(Math.round(d/10)*10)} m · ${num(t,1)} °C · salinitat ${num(s,2)}`;tip.style.opacity=1;const tw=tip.offsetWidth;tip.style.transform=`translate(${clamp(px+12,0,W-tw)}px,${clamp(py-30,0,H-24)}px)`};
  cv.addEventListener("pointermove",secTip);cv.addEventListener("pointerdown",secTip);
  cv.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0});
  goStep(0);
  return{layout,frame,goStep};
})();

/* ================= 4. FLOW UNITS ================= */
(function(){
  const box=$("units"),T=$("flowT"),cap=$("flowCap");
  const MODES={w:{t:"Aigua que es mou cada segon",cap:"Cada quadradet és 0,1 Sv (100.000 m³/s). Rius: Dai i Trenberth (2002). Cinta i corrent de Florida: mitjanes de RAPID, abril del 2004 a març del 2024.",rows:[["L'Amazones","0,21 Sv",2.1,"#8FB3DA"],["Tots els rius del món","1,18 Sv",11.8,"#5B86C2"],["La cinta de l'Atlàntic a 26,5° N","17,0 Sv",170,C.cold],["El corrent de Florida","31,7 Sv",317,C.deep]]},
    h:{t:"Energia que es mou cada segon",cap:"Cada quadradet és 10 terawatts (10 bilions de watts). Consum humà: més de 600 exajoules d'energia primària el 2025 (Energy Institute), uns 19 TW. Calor de l'Atlàntic: 1,2 PW a 26,5° N (Johns et al., 2023).",rows:[["Tota l'energia que consumeix la humanitat","19 TW",1.9,C.muted],["La calor que porta l'Atlàntic cap al nord","1.200 TW",120,C.warm]]}};
  let mode="w",shown=false;
  function render(animate){const M=MODES[mode];T.textContent=M.t;cap.textContent=M.cap;box.innerHTML="";
    M.rows.forEach(([n,v,u,col],ri)=>{const row=document.createElement("div");row.className="urow";row.innerHTML=`<div class="nm"><b>${n}</b><span>${v}</span></div><div class="ugrid"></div>`;const g=row.lastChild;const full=Math.floor(u+1e-9),fr=u-full;const n2=full+(fr>.05?1:0);
      for(let i=0;i<n2;i++){const el=document.createElement("i");el.style.background=col;if(i===full&&fr>.05){el.style.clipPath=`inset(0 ${(1-fr)*100}% 0 0)`}g.appendChild(el);const delay=animate&&!RM?ri*180+i*Math.min(9,1400/n2):0;if(animate&&!RM)setTimeout(()=>el.classList.add("on"),40+delay);else el.classList.add("on")}
      box.appendChild(row)})}
  document.querySelectorAll("#flowfig .btns button").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.k;document.querySelectorAll("#flowfig .btns button").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));render(true)}));
  render(false);box.querySelectorAll("i").forEach(i=>i.classList.remove("on"));
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting&&!shown){shown=true;render(true);o.disconnect()}}),{threshold:.35}).observe(box);
})();

/* ================= 5. WINTER MAP ================= */
const WIN=(function(){
  const cv=$("win"),ctx=cv.getContext("2d"),wrap=$("winw"),ov=$("winov"),tip=$("wintip"),T=$("winT");
  const N=D.ncep,LAT0=20,LAT1=80,K=Math.cos(50*Math.PI/180);let LON0=-170,LON1=75,CL=(LON0+LON1)/2;
  let W=0,H=0,month="jan",imgs={},cur=null,prevImg=null,fade=1;
  const raw=(l,p)=>[l*K,p];raw.invert=(x,y)=>[x/K,y];
  let proj=d3.geoProjection(raw).rotate([-CL,0]);
  setRamp($("winRamp"),"Respecte a la mitjana de la latitud",R_AN,-25,25,"−25 °C","0","+25 °C");
  function grid(key,lon,lat){const nl=N.nlat,nn=N.nlon,fi=(N.lat0-lat)/2.5,i=Math.floor(fi),ti=fi-i,fj=((lon%360)+360)%360/2.5,j=Math.floor(fj),tj=fj-j;const a=N[key];const g=(ii,jj)=>a[clamp(ii,0,nl-1)*nn+((jj%nn)+nn)%nn];
    return(g(i,j)*(1-tj)+g(i,j+1)*tj)*(1-ti)+(g(i+1,j)*(1-tj)+g(i+1,j+1)*tj)*ti}
  function build(m){const w=Math.ceil(W/2),h=Math.ceil(H/2),oc=document.createElement("canvas");oc.width=w;oc.height=h;const c=oc.getContext("2d"),im=c.createImageData(w,h),dd=im.data;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ll=proj.invert([x*2+1,y*2+1]);if(!ll)continue;let lon=ll[0],lat=ll[1];if(lat<LAT0-1||lat>LAT1+1)continue;const v=grid(m,lon,lat),col=R_AN(v),o=(y*w+x)*4;dd[o]=col[0];dd[o+1]=col[1];dd[o+2]=col[2];dd[o+3]=255}
    c.putImageData(im,0,0);return oc}
  const PL=[["Bergen",5.3,60.4,1,"r"],["Badia de Hudson",-85,60,0,"c"],["Labrador",-61,53.5,0,"c"],["Golf d'Alaska",-147,58,0,"c"],["Iakutsk",129.7,62,0,"c"],["Londres",-0.1,51.5,1,"r"],["Mar de Noruega",4,68.5,0,"c"]];
  let annEls=[];
  function anns(){annEls.forEach(e=>e.remove());annEls=[];PL.forEach(([n,lon,lat,dot,al])=>{if(lon>LON1||lon<LON0)return;if(mob()&&n==="Londres")return;const p=proj([lon,lat]);const el=document.createElement("div");el.className="ann c";const v=grid(month,lon,lat);el.innerHTML=`<b>${n}</b><span class="v">${sgn(v,0)} °C</span>`;ov.appendChild(el);const w=el.offsetWidth,h=el.offsetHeight;let X=p[0]-w/2,Y=p[1]-h/2;if(dot){X=p[0]+6;Y=p[1]-h/2;el.className="ann";}el.style.transform=`translate(${clamp(X,2,W-w-2)}px,${clamp(Y,2,H-h-2)}px)`;annEls.push(el)})}
  function layout(){W=wrap.clientWidth;if(W<10)return;if(mob()){LON0=-100;LON1=40}else{LON0=-170;LON1=75}CL=(LON0+LON1)/2;proj=d3.geoProjection(raw).rotate([-CL,0]);const ext=[[0,0],[W,0]];
    const sc=W/((LON1-LON0)*Math.PI/180*K);proj.scale(sc).translate([W/2,sc*(LAT1)*Math.PI/180]);H=Math.round(sc*(LAT1-LAT0)*Math.PI/180);
    const dp=DPR();cv.width=W*dp;cv.height=H*dp;cv.style.height=H+"px";imgs={};imgs.jan=build("jan");imgs.jul=build("jul");cur=imgs[month];prevImg=null;fade=1;anns();draw()}
  function draw(){if(!W)return;const dp=DPR();ctx.setTransform(dp,0,0,dp,0,0);ctx.clearRect(0,0,W,H);ctx.imageSmoothingEnabled=true;
    if(prevImg&&fade<1){ctx.drawImage(prevImg,0,0,W,H);ctx.globalAlpha=fade}ctx.drawImage(cur,0,0,W,H);ctx.globalAlpha=1;
    if(LAND){const p=d3.geoPath(proj,ctx);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();ctx.beginPath();p(LAND);ctx.strokeStyle="rgba(18,18,18,.55)";ctx.lineWidth=.6;ctx.stroke();ctx.restore()}
    ctx.font='10.5px "Source Sans 3", Arial, sans-serif';ctx.fillStyle="rgba(18,18,18,.55)";ctx.textAlign="left";[30,45,60,75].forEach(la=>{const p=proj([LON0+1,la]);ctx.fillText(la+"° N",4,p[1]+3)});
    PL.forEach(([n,lon,lat,dot])=>{if(!dot||(mob()&&n==="Londres"))return;const p=proj([lon,lat]);ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(p[0],p[1],2.4,0,6.2832);ctx.fill()})}
  function setMonth(m){if(m===month)return;prevImg=cur;month=m;cur=imgs[m];fade=RM?1:0;T.textContent=m==="jan"?"Al gener, respecte a la mitjana de la latitud":"Al juliol, respecte a la mitjana de la latitud";anns();
    const st=performance.now();const tick=now=>{fade=Math.min(1,(now-st)/600);draw();if(fade<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
  document.querySelectorAll("#winfig .btns button").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#winfig .btns button").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));setMonth(b.dataset.m)}));
  const winTip=e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const ll=proj.invert([x,y]);if(!ll){tip.style.opacity=0;return}const[lon,lat]=ll;if(lat<LAT0||lat>LAT1){tip.style.opacity=0;return}
    const a=grid(month,lon,lat),tt=grid(month+"T",lon,lat);tip.innerHTML=`${num(lat,0)}° N, ${num(Math.abs(lon),0)}° ${lon<0?"O":"E"}<br>${month==="jan"?"Gener":"Juliol"}: ${sgn(tt,0)} °C de mitjana<br><b>${sgn(a,0)} °C</b> respecte a la latitud`;tip.style.opacity=1;const tw=tip.offsetWidth;tip.style.transform=`translate(${clamp(x+12,0,W-tw)}px,${clamp(y-50,0,H-50)}px)`};
  cv.addEventListener("pointermove",winTip);cv.addEventListener("pointerdown",winTip);
  cv.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0});
  landReady.push(()=>draw());
  return{layout};
})();

/* ================= 6. PALEO ================= */
const PALEO=(function(){
  const svg=d3.select("#paleo"),wrap=$("paleow"),tip=$("ptip");
  const NG=D.ngrip.filter(d=>d[0]<=20000),PA=D.pa.filter(d=>d[0]<=20);
  function layout(){const W=wrap.clientWidth;if(W<10)return;const m=mob();const H=m?360:420;svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
    const M={l:m?40:56,r:m?10:24,t:24,b:42},gap=34,h1=(H-M.t-M.b-gap)*.5,h2=h1;
    const x=d3.scaleLinear([20000,0],[M.l,W-M.r]);
    const y1=d3.scaleLinear([-45,-33.5],[M.t+h1,M.t]);const y2=d3.scaleLinear([0.1,0.045],[M.t+h1+gap+h2,M.t+h1+gap]);
    const bands=[[17500,15000,m?"H1":"Heinrich 1"],[12896,11703,m?"DR":"Dryas recent"]];
    bands.forEach(([a,b,l])=>{svg.append("rect").attr("x",x(a)).attr("width",x(b)-x(a)).attr("y",M.t-14).attr("height",H-M.b-M.t+14).attr("fill","#2C5DA8").attr("opacity",.07);svg.append("text").attr("class","lab b").attr("x",(x(a)+x(b))/2).attr("y",M.t-4).attr("text-anchor","middle").attr("fill",C.cold).text(l)});
    svg.append("text").attr("class","lab m").attr("x",x(5800)).attr("y",M.t-4).attr("text-anchor","middle").text("Holocè");
    svg.append("text").attr("class","lab m").attr("x",x(14000)).attr("y",M.t-4).attr("text-anchor","middle").text(m?"B-A":"Bølling-Allerød");
    // axes
    const ax=svg.append("g").attr("class","ax");
    ax.append("g").attr("transform",`translate(0,${H-M.b})`).call(d3.axisBottom(x).tickValues([20000,15000,10000,5000,0]).tickSize(4).tickFormat(d=>d?IB.fmt(d):"Avui"));
    ax.append("g").attr("transform",`translate(${M.l},0)`).call(d3.axisLeft(y1).ticks(4).tickSize(4).tickFormat(d=>num(d,0)));
    ax.append("g").attr("transform",`translate(${M.l},0)`).call(d3.axisLeft(y2).tickValues([0.05,0.07,0.09]).tickSize(4).tickFormat(d=>num(d,2)));
    ax.selectAll(".domain").remove();
    svg.append("text").attr("class","lab m").attr("x",(M.l+W-M.r)/2).attr("y",H-4).attr("text-anchor","middle").text("anys enrere");
    svg.append("text").attr("class","lab b").attr("x",M.l+4).attr("y",M.t+12).text("Groenlàndia: més calent ↑");
    svg.append("text").attr("class","lab b").attr("x",M.l+4).attr("y",M.t+h1+gap+12).text("Cinta: més forta ↑");
    // production ratio line
    svg.append("line").attr("x1",M.l).attr("x2",W-M.r).attr("y1",y2(0.093)).attr("y2",y2(0.093)).attr("stroke",C.ink).attr("stroke-dasharray","3 3").attr("stroke-width",.8);
    svg.append("text").attr("class","lab").attr("x",W-M.r).attr("y",y2(0.093)+13).attr("text-anchor","end").attr("font-size",11).text("0,093: cinta aturada");
    // series
    const l1=svg.append("path").attr("d",d3.line().x(d=>x(d[0])).y(d=>y1(d[1])).curve(d3.curveMonotoneX)(NG)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.3);
    svg.append("g").selectAll("line").data(PA).join("line").attr("x1",d=>x(d[0]*1000)).attr("x2",d=>x(d[0]*1000)).attr("y1",d=>y2(d[1]-d[2])).attr("y2",d=>y2(d[1]+d[2])).attr("stroke",C.cold).attr("stroke-width",.8).attr("opacity",.5);
    const l2=svg.append("path").attr("d",d3.line().x(d=>x(d[0]*1000)).y(d=>y2(d[1]))(PA)).attr("fill","none").attr("stroke",C.cold).attr("stroke-width",1.6);
    svg.append("g").selectAll("circle").data(PA).join("circle").attr("cx",d=>x(d[0]*1000)).attr("cy",d=>y2(d[1])).attr("r",2).attr("fill",C.cold);
    // reveal animation
    [l1,l2].forEach(p=>{const L=p.node().getTotalLength();if(!RM&&!PALEO_SHOWN){p.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L)}});
    PALEO_PATHS=[l1,l2];
    // hover
    const cross=svg.append("line").attr("y1",M.t-14).attr("y2",H-M.b).attr("stroke",C.ink).attr("stroke-width",.6).attr("opacity",0);
    const pTip=e=>{const[px]=d3.pointer(e);if(px<M.l||px>W-M.r){cross.attr("opacity",0);tip.style.opacity=0;return}const a=x.invert(px);const n=NG.reduce((p,c)=>Math.abs(c[0]-a)<Math.abs(p[0]-a)?c:p);const q=PA.reduce((p,c)=>Math.abs(c[0]*1000-a)<Math.abs(p[0]*1000-a)?c:p);
      cross.attr("x1",px).attr("x2",px).attr("opacity",.6);tip.innerHTML=`<b>Fa ${IB.fmt(Math.round(a/100)*100)} anys</b><br>Gel (δ¹⁸O): ${num(n[1],1)} ‰<br>Fang (Pa/Th, fa ${IB.fmt(Math.round(q[0]*1000/10)*10)} anys): ${num(q[1],3)}`;tip.style.opacity=1;const r=wrap.getBoundingClientRect(),tw=tip.offsetWidth;tip.style.transform=`translate(${clamp(px+12,0,r.width-tw)}px,${M.t+10}px)`};
    svg.on("pointermove",pTip).on("pointerdown",pTip);
    svg.on("pointerleave",e=>{if(e.pointerType==="mouse"){cross.attr("opacity",0);tip.style.opacity=0}});
  }
  return{layout};
})();
var PALEO_SHOWN=false,PALEO_PATHS=[];
new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting&&!PALEO_SHOWN){PALEO_SHOWN=true;PALEO_PATHS.forEach(p=>p.transition().duration(RM?0:2600).ease(d3.easeCubicInOut).attr("stroke-dashoffset",0));o.disconnect()}}),{threshold:.4}).observe($("paleow"));

/* ================= 7. RAPID ================= */
const RAP=(function(){
  const svg=d3.select("#rapid"),wrap=$("rapidw"),tip=$("rtip");
  const R=D.rapid,n=R.moc.length,dates=R.moc.map((_,i)=>new Date(R.y0,R.m0-1+i,15));
  const SER={moc:{n:"Cinta total",c:C.ink,a:R.moc},gs:{n:"Corrent de Florida",c:C.warm,a:R.gs},ek:{n:"Vent (Ekman)",c:C.dry,a:R.ek},umo:{n:"Oceà obert, 0–1.100 m",c:C.cold,a:R.umo}};
  const on={moc:true,gs:false,ek:false,umo:false};
  const roll=a=>a.map((_,i)=>{if(i<6||i>n-7)return null;let s=0;for(let k=i-6;k<i+6;k++)s+=a[k];return s/12});
  for(const k in SER)SER[k].r=roll(SER[k].a);
  const mean=(a,i0,i1)=>{let s=0,c=0;for(let i=i0;i<i1;i++){s+=a[i];c++}return s/c};
  const iOf=(y,m)=>(y-R.y0)*12+(m-R.m0);
  const mAll=mean(R.moc,0,n),mA=mean(R.moc,0,iOf(2008,4)),mB=mean(R.moc,iOf(2008,4),n),m0910=mean(R.moc,iOf(2009,4),iOf(2010,4));
  let W=0,x,y,H=0;
  function layout(){W=wrap.clientWidth;if(W<10)return;const m=mob();H=m?300:380;svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);draw(false)}
  function draw(anim){svg.selectAll("*").remove();const m=mob(),M={l:m?30:40,r:m?8:16,t:16,b:26};
    const ks=Object.keys(on).filter(k=>on[k]);let lo=0,hi=30;ks.forEach(k=>{lo=Math.min(lo,d3.min(SER[k].a));hi=Math.max(hi,d3.max(SER[k].a))});lo=Math.floor(lo/5)*5;hi=Math.ceil(hi/5)*5;
    x=d3.scaleTime([new Date(2004,2,1),new Date(2024,3,1)],[M.l,W-M.r]);y=d3.scaleLinear([lo,hi],[H-M.b,M.t]);
    const ax=svg.append("g").attr("class","ax");
    ax.append("g").attr("transform",`translate(0,${H-M.b})`).call(d3.axisBottom(x).ticks(d3.timeYear.every(m?5:2)).tickSize(4).tickFormat(d3.timeFormat("%Y")));
    ax.append("g").attr("transform",`translate(${M.l},0)`).call(d3.axisLeft(y).ticks(6).tickSize(-(W-M.l-M.r)).tickFormat(d=>d));
    ax.selectAll(".domain").remove();ax.selectAll(".tick line").attr("stroke","#EEEEEC");
    svg.append("line").attr("x1",M.l).attr("x2",W-M.r).attr("y1",y(0)).attr("y2",y(0)).attr("stroke",C.muted).attr("stroke-width",.8);
    svg.append("text").attr("class","lab m").attr("x",M.l+2).attr("y",M.t-4).text("Sv (milions de m³/s)");
    if(on.moc){const g=svg.append("g");
      g.append("line").attr("x1",x(dates[0])).attr("x2",x(dates[iOf(2008,3)])).attr("y1",y(mA)).attr("y2",y(mA)).attr("stroke",C.ink).attr("stroke-dasharray","4 3").attr("stroke-width",.9);
      g.append("line").attr("x1",x(dates[iOf(2008,4)])).attr("x2",x(dates[n-1])).attr("y1",y(mB)).attr("y2",y(mB)).attr("stroke",C.ink).attr("stroke-dasharray","4 3").attr("stroke-width",.9);
      if(!m){g.append("text").attr("class","lab").attr("x",x(dates[2])).attr("y",y(mA)-26).text(`Abril 2004 – març 2008: ${num(mA,1)} Sv`);g.append("text").attr("class","lab").attr("x",x(dates[n-1])).attr("y",y(mB)-30).attr("text-anchor","end").text(`Abril 2008 – març 2024: ${num(mB,1)} Sv`)}
      const xd=x(dates[iOf(2010,1)]);g.append("line").attr("x1",xd).attr("x2",xd+(m?16:26)).attr("y1",y(8.4)).attr("y2",y(4)).attr("stroke",C.ink).attr("stroke-width",.6);
      g.append("text").attr("class","lab").attr("x",xd+(m?18:28)).attr("y",y(4)+4).text(m?"2009–10: −30 %":`Abril 2009 – març 2010: ${num(m0910,1)} Sv, un 30 % menys`)}
    ks.forEach(k=>{const S=SER[k];const g=svg.append("g");
      g.append("path").attr("d",d3.line().x((d,i)=>x(dates[i])).y(d=>y(d))(S.a)).attr("fill","none").attr("stroke",S.c).attr("stroke-width",.8).attr("opacity",.35);
      const p=g.append("path").attr("d",d3.line().defined(d=>d!=null).x((d,i)=>x(dates[i])).y(d=>y(d))(S.r)).attr("fill","none").attr("stroke",S.c).attr("stroke-width",2.2);
      const last=S.r.filter(v=>v!=null).pop();if(k!=="moc"||ks.length>1)g.append("text").attr("class","lab b").attr("x",W-M.r).attr("y",y(last)+(k==="ek"?-8:-8)).attr("text-anchor","end").attr("fill",S.c).text(S.n);
      if(anim&&!RM){const L=p.node().getTotalLength();p.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L).transition().duration(1400).attr("stroke-dashoffset",0)}});
    const cross=svg.append("line").attr("y1",M.t).attr("y2",H-M.b).attr("stroke",C.ink).attr("stroke-width",.6).attr("opacity",0);
    const MN=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
    const rTip=e=>{const[px]=d3.pointer(e);if(px<M.l||px>W-M.r){cross.attr("opacity",0);tip.style.opacity=0;return}const dt=x.invert(px);const i=clamp(Math.round((dt.getFullYear()-R.y0)*12+dt.getMonth()-(R.m0-1)),0,n-1);const xx=x(dates[i]);cross.attr("x1",xx).attr("x2",xx).attr("opacity",.6);
      tip.innerHTML=`<b>${MN[dates[i].getMonth()]} ${dates[i].getFullYear()}</b><br>`+ks.map(k=>`<span style="color:${SER[k].c}">${SER[k].n}: ${num(SER[k].a[i],1)} Sv</span>`).join("<br>");tip.style.opacity=1;const tw=tip.offsetWidth;tip.style.transform=`translate(${clamp(xx+12,0,W-tw)}px,${M.t+6}px)`};
    svg.on("pointermove",rTip).on("pointerdown",rTip);
    svg.on("pointerleave",e=>{if(e.pointerType==="mouse"){cross.attr("opacity",0);tip.style.opacity=0}});
  }
  document.querySelectorAll("#rbtn button").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.k;on[k]=!on[k];if(!Object.values(on).some(Boolean))on.moc=true;document.querySelectorAll("#rbtn button").forEach(o=>o.setAttribute("aria-pressed",on[o.dataset.k]?"true":"false"));draw(true)}));
  return{layout};
})();

/* ================= 8. STOMMEL ================= */
const STM=(function(){
  const svg=d3.select("#stom"),wrap=$("stw"),inp=$("stF"),play=$("stPlay"),stEl=$("stState"),txEl=$("stTxt");
  // nondimensional Stommel: q=1-x ; dx/dt = F - |q| x ; slider value v -> F = v - 0.08 (so 0 on the slider is net evaporation)
  const OFF=.08;let xs=0,F=0,x,y,W=0,H=0,trail=[],playing=null,dot,trailP,lastState="";
  const Fof=v=>v-OFF;
  function eq(F0){/* stable on-branch root */const r=[];if(F0<=.25){const d=Math.sqrt(1-4*Math.max(F0,-10));r.push((1-d)/2)}return r}
  function layout(){W=wrap.clientWidth;if(W<10)return;H=Math.round(clamp(W*.6,240,380));svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
    const M={l:30,r:14,t:14,b:30};x=d3.scaleLinear([0,.34],[M.l,W-M.r]);y=d3.scaleLinear([-.62,1.08],[H-M.b,M.t]);
    const on=[],un=[],off=[];for(let k=0;k<=400;k++){const xx=-.075+k/400*.575;on.push([xx*(1-xx)+OFF,1-xx])}for(let k=0;k<=200;k++){const xx=.5+k/200*.5;un.push([xx*(1-xx)+OFF,1-xx])}for(let k=0;k<=300;k++){const xx=1+k/300*.62;const f=xx*(xx-1)+OFF;if(f<=.34)off.push([f,1-xx])}
    const L=d3.line().x(d=>x(d[0])).y(d=>y(d[1]));
    svg.append("line").attr("x1",M.l).attr("x2",W-M.r).attr("y1",y(0)).attr("y2",y(0)).attr("stroke",C.hair);
    svg.append("text").attr("class","lab m").attr("x",W-M.r).attr("y",y(0)-5).attr("text-anchor","end").text("cinta aturada");
    svg.append("path").attr("d",L(on.filter(d=>d[0]<=.34))).attr("stroke",C.ink).attr("stroke-width",2.4).attr("fill","none");
    svg.append("path").attr("d",L(un)).attr("stroke",C.muted).attr("stroke-width",1.2).attr("stroke-dasharray","2 3").attr("fill","none");
    svg.append("path").attr("d",L(off)).attr("stroke",C.cold).attr("stroke-width",2.4).attr("fill","none");
    const tp=[.25+OFF,.5];svg.append("circle").attr("cx",x(tp[0])).attr("cy",y(tp[1])).attr("r",4).attr("fill",C.warm);
    svg.append("text").attr("class","lab b").attr("x",x(tp[0])-16).attr("y",y(tp[1])+4).attr("text-anchor","end").attr("fill",C.warm).text("Punt de no retorn");
    svg.append("circle").attr("cx",x(OFF)).attr("cy",y(0)).attr("r",4).attr("fill",C.cold);
    svg.append("text").attr("class","lab b").attr("x",x(OFF)+7).attr("y",y(0)+28).attr("fill",C.cold).text("Es torna a engegar");
    svg.append("text").attr("class","lab").attr("x",x(.005)).attr("y",y(.84)).text("Cinta en marxa");
    svg.append("text").attr("class","lab").attr("x",W-M.r).attr("y",y(-.45)).attr("text-anchor","end").attr("fill",C.cold).text(W<420?"Molt feble o del revés":"Cinta molt feble (fins i tot del revés)");
    svg.append("text").attr("class","lab m").attr("x",M.l).attr("y",H-8).text("← menys aigua dolça");
    svg.append("text").attr("class","lab m").attr("x",W-M.r).attr("y",H-8).attr("text-anchor","end").text("més aigua dolça →");
    svg.append("text").attr("class","lab m").attr("x",M.l-6).attr("y",M.t+4).attr("transform",`rotate(-90 ${M.l-14} ${M.t+4})`).attr("text-anchor","end").text("Intensitat de la cinta");
    trailP=svg.append("path").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).attr("opacity",.35);
    dot=svg.append("circle").attr("r",7.5).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",2.2);
    render();
  }
  function render(){if(!dot)return;const q=1-xs;dot.attr("cx",x(F+OFF)).attr("cy",y(q));trailP.attr("d",trail.length>1?d3.line().x(d=>x(d[0])).y(d=>y(d[1]))(trail):null);
    let s,t;if(q>.52){s="La cinta funciona";t=F>.2?"És a prop del punt de no retorn: una mica més d'aigua dolça i el cercle viciós de la sal es dispara.":"Amb més aigua dolça s'afebleix, però si l'aigua dolça disminueix, es recupera."}
    else if(q>0.05){s="Caient";t="Ha passat el punt de no retorn. Encara que no s'afegeixi més aigua dolça, la cinta s'afebleix sola."}
    else{s="La cinta s'ha aturat";t=F>0?"No n'hi ha prou de treure aigua dolça. Per tornar-la a engegar cal anar molt més enrere del punt on s'ha aturat.":"Ara sí: amb molt menys aigua dolça que abans, la cinta torna a arrencar."}
    if(s!==lastState||t!==txEl.textContent){stEl.textContent=s;txEl.textContent=t;lastState=s}
    const fv=+inp.value,vt=fv<.06?"menys aigua dolça que ara":fv<.1?"la quantitat d'ara":fv<.3?"més aigua dolça que ara":"molta més aigua dolça, més enllà del punt de no retorn";if(inp.getAttribute("aria-valuetext")!==vt)inp.setAttribute("aria-valuetext",vt)}
  function settle(){/* instant equilibrium for reduced motion */const q=1-xs;if(q>0&&F<=.25){xs=eq(F)[0]}else{const d=Math.sqrt(1+4*Math.max(F,0));xs=F<0?eq(F)[0]:(1+d)/2}}
  inp.addEventListener("input",()=>{stopPlay();F=Fof(+inp.value);if(RM)settle()});
  function stopPlay(){if(playing){playing=null;play.textContent="Reprodueix"}}
  play.addEventListener("click",()=>{if(playing){stopPlay();return}xs=eq(Fof(.08))[0];F=Fof(.08);trail=[];playing={t0:performance.now()};play.textContent="Atura"});
  const SCH=[[0,.08],[7,.345],[11,.345],[19,.0],[22,0],[25,.08]];
  function frame(now,dt){if(!W)return;if(playing){const s=(now-playing.t0)/1000;let v=SCH[SCH.length-1][1];for(let i=1;i<SCH.length;i++)if(s<=SCH[i][0]){const a=SCH[i-1],b=SCH[i];v=lerp(a[1],b[1],(s-a[0])/(b[0]-a[0]));break}F=Fof(Math.min(v,.34));inp.value=v.toFixed(3);if(s>SCH[SCH.length-1][0])stopPlay()}
    if(!RM){const k=Math.min(.05,dt)*2.6;for(let i=0;i<6;i++){xs+=k/6*(F-Math.abs(1-xs)*xs)*6}}else settle();
    xs=clamp(xs,-.2,1.7);
    if(playing||trail.length){const p=[F+OFF,1-xs];const l=trail[trail.length-1];if(!l||Math.hypot(l[0]-p[0],l[1]-p[1])>.004)trail.push(p);if(trail.length>500)trail.shift();if(!playing&&trail.length)trail.shift()}
    render()}
  F=Fof(+inp.value);xs=eq(F)[0];
  return{layout,frame};
})();

/* ================= 9. PROJECTIONS ================= */
const PJ=(function(){
  const svg=d3.select("#pj"),wrap=$("pjw"),inp=$("pjR"),big=$("pjBig"),txt=$("pjTxt"),list=$("pjList");
  const ROWS=[{n:"IPCC, emissions baixes",s:"SSP1-2.6",c:24,a:4,b:46},{n:"IPCC, emissions molt altes",s:"SSP5-8.5",c:39,a:17,b:55},{n:"Weijer et al. 2020",s:"restringit amb RAPID",a:34,b:45},{n:"Bonan et al. 2025",s:"qualsevol escenari",a:18,b:43},{n:"Portmann et al. 2026",s:"emissions intermèdies",c:51,a:43,b:59}];
  const BASE=17.0,COL=65;let x,W=0,H=0,mk;
  function layout(){W=wrap.clientWidth;if(W<10)return;const m=mob();const rh=m?44:34,M={l:m?8:190,r:12,t:20,b:26};H=M.t+M.b+rh*ROWS.length;svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
    x=d3.scaleLinear([0,90],[M.l,W-M.r]);
    const defs=svg.append("defs");const pt=defs.append("pattern").attr("id","hatch").attr("width",6).attr("height",6).attr("patternUnits","userSpaceOnUse").attr("patternTransform","rotate(45)");pt.append("line").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",6).attr("stroke",C.cold).attr("stroke-width",1.2).attr("opacity",.35);
    svg.append("rect").attr("x",x(COL)).attr("y",M.t-14).attr("width",x(90)-x(COL)).attr("height",H-M.t-M.b+14).attr("fill","url(#hatch)");
    svg.append("text").attr("class","lab b").attr("x",(x(COL)+x(90))/2).attr("y",M.t-4).attr("text-anchor","middle").attr("fill",C.cold).text("Col·lapse");
    const ax=svg.append("g").attr("class","ax").attr("transform",`translate(0,${H-M.b})`).call(d3.axisBottom(x).tickValues([0,20,40,60,80]).tickSize(-(H-M.t-M.b)).tickFormat(d=>d?"−"+d+" %":"0 %"));ax.select(".domain").remove();ax.selectAll(".tick line").attr("stroke","#EEEEEC");
    ROWS.forEach((r,i)=>{const yy=M.t+rh*i+rh/2+(m?6:0);const g=svg.append("g");
      if(m)g.append("text").attr("class","lab").attr("x",M.l).attr("y",yy-12).html(`<tspan font-weight="700">${r.n}</tspan> <tspan fill="${C.muted}">· ${r.s}</tspan>`);
      else{g.append("text").attr("class","lab b").attr("x",M.l-12).attr("y",yy-1).attr("text-anchor","end").text(r.n);g.append("text").attr("class","lab m").attr("x",M.l-12).attr("y",yy+12).attr("text-anchor","end").attr("font-size",11).text(r.s)}
      g.append("rect").attr("class","pjbar").attr("data-i",i).attr("x",x(r.a)).attr("width",x(r.b)-x(r.a)).attr("y",yy-5).attr("height",10).attr("rx",5).attr("fill",C.warm).attr("opacity",.3);
      if(r.c!=null)g.append("rect").attr("x",x(r.c)-1.2).attr("width",2.4).attr("y",yy-8).attr("height",16).attr("fill",C.warm)});
    mk=svg.append("g");mk.append("line").attr("y1",M.t-14).attr("y2",H-M.b).attr("stroke",C.ink).attr("stroke-width",1.4);
    inp.style.marginLeft=(M.l-8)+"px";inp.style.width=(x(90)-x(0)+16)+"px";
    const node=svg.node();let dg=false;const setFrom=e=>{const r=node.getBoundingClientRect();const v=Math.round(clamp(x.invert((e.clientX-r.left)*W/r.width),0,90));inp.value=v;update()};
    node.style.touchAction="pan-y";node.addEventListener("pointerdown",e=>{dg=true;setFrom(e)});node.addEventListener("pointermove",e=>{if(dg)setFrom(e)});addEventListener("pointerup",()=>{dg=false});
    update()}
  function update(){const v=+inp.value;inp.setAttribute("aria-valuetext","un "+v+" % més feble cap al 2100");if(!x)return;mk.attr("transform",`translate(${x(v)},0)`);
    svg.selectAll(".pjbar").attr("opacity",function(){const r=ROWS[+this.dataset.i];return v>=r.a&&v<=r.b?.75:.25});
    const sv=BASE*(1-v/100);big.innerHTML=`−${v} %<small>≈ ${num(sv,0)} Sv cap al 2100, des d'uns 17 avui</small>`;
    let t;if(v<15)t="Un afebliment així costaria de distingir de les oscil·lacions naturals: el 2009–2010 la cinta va caure un 30 % durant un any i després es va recuperar en part.";
    else if(v<=55)t="És el rang que projecten la majoria de models per al 2100. L'IPCC considera molt probable que la cinta s'afebleixi en tots els escenaris, però té poca confiança en la xifra exacta. Es notaria sobretot al nord de l'Atlàntic, que rebria menys calor de l'oceà.";
    else if(v<=59)t="Més enllà de les projeccions de l'IPCC i de la majoria d'estudis, però dins de l'estimació més alta d'aquesta llista, la de Portmann i col·legues (2026), que corregeix un biaix de la salinitat dels models.";
    else if(v<COL)t="Més enllà de totes aquestes estimacions per al 2100, però encara per sobre del llindar que diversos estudis fan servir per parlar de col·lapse.";
    else t="Zona de col·lapse: la cinta per sota d'uns 6 Sv. L'IPCC té confiança mitjana que no passarà abans del 2100. Si passés, molt probablement desplaçaria cap al sud el cinturó de pluges tropicals, afebliria els monsons de l'Àfrica i de l'Àsia, reforçaria els de l'hemisferi sud i assecaria Europa.";
    txt.textContent=t;const inc=ROWS.filter(r=>v>=r.a&&v<=r.b);list.innerHTML=inc.length?inc.map(r=>`<li>Dins del rang de: ${r.n} (${r.s}, ${r.a}–${r.b} %)</li>`).join(""):"<li>Fora del rang de totes aquestes estimacions</li>"}
  inp.addEventListener("input",update);
  return{layout};
})();

/* ================= 10. TIPPING TIMELINE ================= */
const TIP=(function(){
  const svg=d3.select("#tip"),wrap=$("tipw"),tip=$("tiptip");
  const ROWS=[
    {n:"Ditlevsen i Ditlevsen",y:"2023, corregit el 2025",a:2037,b:2109,c:2065,k:"r",d:"Senyals d'alerta estadístics en la temperatura del mar al sud de Groenlàndia (1870–2020). Punt de no retorn: 2065; interval de confiança del 95 %: 2037–2109."},
    {n:"van Westen et al.",y:"2025, emissions intermèdies",a:2026,b:2095,c:2063,k:"r",d:"Indicador físic basat en els fluxos de flotabilitat de l'Atlàntic nord, aplicat a 25 models (escenari SSP2-4.5). Inici del col·lapse cap al 2063, amb un rang del 2026 al 2095."},
    {n:"van Westen et al.",y:"2025, emissions molt altes",a:2023,b:2076,c:2055,k:"r",d:"El mateix indicador, amb l'escenari SSP5-8.5. Inici del col·lapse cap al 2055, amb un rang del 2023 al 2076."},
    {n:"Drijfhout et al.",y:"2025, simulacions fins al 2300 o el 2500",a:2100,b:2200,k:"after",d:"Models CMIP6 allargats més enllà del 2100: la cinta acaba per sota de 6 Sv en tots els que tenen emissions molt altes i en alguns amb emissions intermèdies o baixes. La convecció del nord s'atura abans, cap a mitjan segle."},
    {n:"Baker et al.",y:"2025, 34 models",a:2020,b:2100,k:"no",d:"Els vents de l'oceà Antàrtic mantenen una cinta afeblida fins i tot amb forçaments extrems: un col·lapse total és improbable aquest segle."},
    {n:"IPCC",y:"2021, sisè informe",a:2020,b:2100,k:"no",d:"Confiança mitjana que no hi haurà un col·lapse brusc abans del 2100. Confiança baixa en la magnitud de l'afebliment; els models tendeixen a ser massa estables."}];
  function layout(){const W=wrap.clientWidth;if(W<10)return;const m=mob(),rh=m?46:36,M={l:m?8:220,r:m?10:24,t:22,b:26},H=M.t+M.b+rh*ROWS.length;svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
    const x=d3.scaleLinear([2020,2200],[M.l,W-M.r]);
    const ax=svg.append("g").attr("class","ax").attr("transform",`translate(0,${H-M.b})`).call(d3.axisBottom(x).tickValues(m?[2050,2100,2150,2200]:[2025,2050,2075,2100,2125,2150,2175,2200]).tickSize(-(H-M.t-M.b)).tickFormat(d=>d));ax.select(".domain").remove();ax.selectAll(".tick line").attr("stroke","#EEEEEC");
    svg.append("line").attr("x1",x(2100)).attr("x2",x(2100)).attr("y1",M.t-10).attr("y2",H-M.b).attr("stroke",C.ink).attr("stroke-width",.8);
    svg.append("text").attr("class","lab").attr("x",x(2100)+4).attr("y",M.t-8).text("2100");
    svg.append("line").attr("x1",x(2026)).attr("x2",x(2026)).attr("y1",M.t-10).attr("y2",H-M.b).attr("stroke",C.warm).attr("stroke-width",1.2);
    svg.append("text").attr("class","lab").attr("x",x(2026)-4).attr("y",M.t-8).attr("text-anchor",m?"start":"end").attr("dx",m?8:0).attr("fill",C.warm).text("Avui");
    const defs=svg.append("defs");const pt=defs.append("pattern").attr("id","hatch2").attr("width",5).attr("height",5).attr("patternUnits","userSpaceOnUse").attr("patternTransform","rotate(45)");pt.append("line").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",5).attr("stroke",C.muted).attr("stroke-width",1).attr("opacity",.5);
    ROWS.forEach((r,i)=>{const yy=M.t+rh*i+rh/2+(m?7:0),g=svg.append("g").style("cursor","default");
      g.append("rect").attr("x",0).attr("y",yy-rh/2-(m?7:0)).attr("width",W).attr("height",rh).attr("fill","transparent");
      if(m)g.append("text").attr("class","lab").attr("x",M.l).attr("y",yy-11).html(`<tspan font-weight="700">${r.n}</tspan> <tspan fill="${C.muted}">· ${r.y}</tspan>`);
      else{g.append("text").attr("class","lab b").attr("x",M.l-12).attr("y",yy-1).attr("text-anchor","end").text(r.n);g.append("text").attr("class","lab m").attr("x",M.l-12).attr("y",yy+12).attr("text-anchor","end").attr("font-size",11).text(r.y)}
      if(r.k==="r"){g.append("rect").attr("x",x(r.a)).attr("width",Math.min(x(r.b),W-M.r)-x(r.a)).attr("y",yy-5).attr("height",10).attr("rx",5).attr("fill",C.cold).attr("opacity",.3);g.append("circle").attr("cx",x(r.c)).attr("cy",yy).attr("r",5).attr("fill",C.cold);if(!m)g.append("text").attr("class","lab").attr("x",x(r.c)).attr("y",yy-9).attr("text-anchor","middle").attr("font-size",11).text(r.c)}
      else if(r.k==="after"){g.append("rect").attr("x",x(r.a)).attr("width",x(r.b)-x(r.a)).attr("y",yy-5).attr("height",10).attr("fill",C.cold).attr("opacity",.18);g.append("text").attr("class","lab").attr("x",x(r.b)-6).attr("y",yy+4).attr("text-anchor","end").attr("font-size",11).attr("fill",C.deep).text("després del 2100")}
      else{g.append("rect").attr("x",x(r.a)).attr("width",x(r.b)-x(r.a)).attr("y",yy-5).attr("height",10).attr("fill","url(#hatch2)");g.append("text").attr("class","lab").attr("x",(x(r.a)+x(r.b))/2).attr("y",yy+4).attr("text-anchor","middle").attr("font-size",11).attr("fill",C.ink2).style("paint-order","stroke").attr("stroke","#fff").attr("stroke-width",3).text("col·lapse improbable")}
      g.on("pointerenter pointermove pointerdown",e=>{const[px,py]=d3.pointer(e,svg.node());tip.innerHTML=`<b>${r.n} (${r.y})</b><br>${r.d}`;tip.style.opacity=1;tip.style.whiteSpace="normal";const tw=tip.offsetWidth;tip.style.transform=`translate(${clamp(px+12,0,W-tw)}px,${clamp(yy+12,0,H)}px)`}).on("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0})});
  }
  return{layout};
})();

/* ================= wiring ================= */
["globe","sec","colc"].forEach(id=>vio.observe($(id)));
IB.scrolly($("gsteps"),$("ggraphic"),i=>safe(GLOBE.goStep,i));
IB.scrolly($("xsteps"),$("xgraphic"),i=>safe(SEC.goStep,i));
function layoutAll(){[DEN.layout,GLOBE.layout,SEC.layout,WIN.layout,PALEO.layout,RAP.layout,STM.layout,PJ.layout,TIP.layout].forEach(f=>safe(f))}
layoutAll();
let rz,lastW=innerWidth,lastH=innerHeight;
addEventListener("resize",()=>{if(innerWidth===lastW&&Math.abs(innerHeight-lastH)<120&&mob())return;lastW=innerWidth;lastH=innerHeight;clearTimeout(rz);rz=setTimeout(layoutAll,160)});
if(document.fonts)document.fonts.ready.then(()=>safe(layoutAll));
let lt=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-lt)/1000);lt=now;
  if(vis.colc)safe(DEN.frame,now,dt);
  if(vis.globe)safe(GLOBE.frame,now,dt);
  if(vis.sec)safe(SEC.frame,now,dt);
  safe(STM.frame,now,dt);
}
requestAnimationFrame(frame);

/* reading time (same rule as El Niño) */
(()=>{const n=[...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")].filter(e=>!e.closest(".fn")).reduce((a,e)=>a+(e.textContent.match(/[\p{L}\p{N}·'’]+/gu)||[]).length,0);
 const figs=document.querySelectorAll("canvas,figure svg").length;let sec=n/218*60;for(let i=0;i<figs;i++)sec+=Math.max(3,12-i);
 const el=$("rt");if(el)el.textContent=Math.max(1,Math.round(sec/60))+" min de lectura"})();
})();
