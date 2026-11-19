/* On va el CO2 que emetem — gràfics de l'article.
   Dades: dades.js (Global Carbon Budget 2026, NOAA GML, NOAA CPC). */
(function(){
"use strict";
const D=window.CO2DATA, CC=3.664;
const RM=window.IB&&IB.reduced;
const COL={ink:"#121212",ink2:"#4A4A4A",muted:"#7A7A7A",hair:"#DADADA",land:"#ECEBE8",soil:"#E3DED5",warm:"#C8442A",cold:"#2C5DA8",dry:"#9A6326",bio:"#4C8A2E",sea:"#E4ECF6",sea2:"#CFDCEE",sea3:"#B5C8E2",paper:"#FFFFFF"};
const SSF='"Source Sans 3", "Helvetica Neue", Arial, sans-serif', SERIF='"STIXGeneral", "STIX Two Text", Georgia, serif';
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const mob=()=>innerWidth<900;
const nf=(v,d=1)=>IB.fmt(v,d);
const pct=v=>Math.round(v*100)+"%";
const safe=(f,...a)=>{try{return f(...a)}catch(e){console.error(e)}};
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const MONTHS=["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"];
const MSH=["gen","feb","mar","abr","mai","jun","jul","ago","set","oct","nov","des"];

/* ---------- derived data (GtCO2) ---------- */
const ROWS=D.G.map(r=>{const F=(r[1]-r[6])*CC,U=r[2]*CC;return{y:r[0],F,U,E:F+U,A:r[3]*CC,O:r[4]*CC,L:r[5]*CC,B:r[7]*CC}});
const BY={};ROWS.forEach(r=>BY[r.y]=r);
const LAST=2026, LASTREAL=2025;
const ONI=y=>{const i=y-D.ONI0;return i>=0&&i<D.ONI.length?D.ONI[i]:null};

/* =====================================================================
   1. SCROLLY A — un any d'emissions, punt a punt
   ===================================================================== */
const A={cv:document.getElementById("aCv"),step:0,W:0,H:0,dpr:1,parts:[],trees:[],t0:performance.now(),stepT:0};
A.ctx=A.cv.getContext("2d");
(function initA(){
  const r=BY[LASTREAL];
  // 1 punt = 0,1 Gt. Fòssil 38,40 → 384; ús del sòl 4,35 → 43 (43,5); destins 160 + 117 + 133 + 17 = 427.
  const nF=Math.round(r.F*10),nU=Math.floor(r.U*10+1e-9);
  const nO=Math.round(r.O*10),nL=Math.round(r.L*10),nB=Math.round(r.B*10),nA=nF+nU-nO-nL-nB;
  A.n={F:nF,U:nU,A:nA,O:nO,L:nL,B:nB,N:nF+nU};
  const R=rng(7),dest=[];
  for(let i=0;i<nA;i++)dest.push("A");for(let i=0;i<nO;i++)dest.push("O");for(let i=0;i<nL;i++)dest.push("L");for(let i=0;i<nB;i++)dest.push("B");
  for(let i=dest.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[dest[i],dest[j]]=[dest[j],dest[i]]}
  for(let i=0;i<A.n.N;i++)A.parts.push({o:i<nF?"F":"U",d:dest[i],u:R(),v:R(),ou:R(),ov:R(),ph:R()*6.28,x:0,y:0,sx:0,sy:0,tx:0,ty:0,al:0,tal:0,col:COL.ink,delay:0,moving:false,k:i});
  const T=rng(3);for(let i=0;i<10;i++)A.trees.push({u:(i+.5)/10+(T()-.5)*.04,h:.8+T()*.45,r:.85+T()*.3,c:T()<.5});
})();
function geoA(){const W=A.W,H=A.H,g={};
  g.y0=H*.57;g.shore=W*.53;
  g.air=[W*.05,H*.11,W*.74,H*.44];
  g.box=[W*.78,H*.07,W*.965,H*.33];
  g.ocean=[W*.58,g.y0+H*.05,W*.97,H*.95];
  g.fac=[W*.05,W*.19];g.patch=[W*.205,W*.28];g.forest=[W*.30,W*.495];
  g.soil=[W*.30,g.y0+H*.07,W*.495,g.y0+H*.25];
  const ch=[];for(let k=0;k<3;k++)ch.push([lerp(g.fac[0],g.fac[1],.2+.3*k),g.y0-H*(.16+.02*(k%2))]);g.chim=ch;
  g.treeR=Math.max(6,(g.forest[1]-g.forest[0])/10*.72);
  g.treeXY=A.trees.map(t=>{const x=lerp(g.forest[0],g.forest[1],t.u),h=H*.10*t.h;return[x,g.y0-h,g.treeR*t.r,h,t.c]});
  A.g=g}
function srcA(p){const g=A.g;if(p.o==="F"){const c=g.chim[p.k%3];return[c[0]+(p.u-.5)*4,c[1]-2]}return[lerp(g.patch[0],g.patch[1],.25+.5*p.u),g.y0-6]}
function posA(p,where){const g=A.g;
  if(where==="air")return[lerp(g.air[0],g.air[2],p.u),lerp(g.air[1],g.air[3],p.v)];
  if(where==="O")return[lerp(g.ocean[0],g.ocean[2],p.ou),lerp(g.ocean[1],g.ocean[3],Math.pow(p.ov,1.5))];
  if(where==="L"){if(p.ov<.55){const t=g.treeXY[Math.floor(p.ou*g.treeXY.length)%g.treeXY.length],a=p.ov/.55*6.28,rr=t[2]*.75*Math.sqrt(p.u);return[t[0]+Math.cos(a)*rr,t[1]-t[2]*.4+Math.sin(a)*rr*.85]}
    return[lerp(g.soil[0],g.soil[2],p.ou),lerp(g.soil[1],g.soil[3],(p.ov-.55)/.45)]}
  if(where==="B"){const b=g.box,m=10;return[lerp(b[0]+m,b[2]-m,p.ou),lerp(b[1]+m+14,b[3]-m,p.ov)]}
}
function targetsA(s,first){
  const N=A.parts.length;
  A.parts.forEach((p,i)=>{
    const hidden=s===0||(s===1&&p.o==="U");
    const placed=(s>=4&&p.d==="O")||(s>=5&&p.d==="L")||(s>=7&&p.d==="B");
    let pos,where;
    if(hidden){pos=srcA(p);where="src"}else{where=placed?p.d:"air";pos=posA(p,where)}
    const changed=p.where!==where;
    p.tx=pos[0];p.ty=pos[1];
    if(changed){
      if(p.where==null||first||RM){p.x=p.tx;p.y=p.ty;if(where!=="src"&&p.where==null&&!first){}}
      else{p.sx=p.x;p.sy=p.y;p.moving=true;p.mt=0;
        if(p.where==="src"){p.delay=(p.o==="F"?i/A.n.F:(i-A.n.F)/Math.max(1,A.n.U))*1.4;p.dur=1.6+p.v*.6}
        else{p.delay=p.u*.7;p.dur=1.2+p.v*.5}}
      p.where=where}
    let col=p.o==="F"?COL.ink:COL.dry;
    if(p.d==="O"&&s>=4)col=COL.cold;if(p.d==="L"&&s>=5)col=COL.bio;if(p.d==="B"&&s>=7)col=COL.muted;if(p.d==="A"&&s>=6)col=COL.warm;
    p.col=col;
    let al=hidden?0:1;if(s===6&&p.d!=="A")al=.35;if(s===8)al=.18;
    p.tal=al;
    if(first||RM){p.al=al;if(!p.moving){p.x=p.tx;p.y=p.ty}}
  });
}
const A_TXT=[
 ()=>["Emissions del 2025",`${A.n.N} punts · 1 punt = 0,1 Gt de CO₂`],
 ()=>["Combustibles fòssils i ciment",`${A.n.F} punts · ${nf(BY[LASTREAL].F)} Gt de CO₂`],
 ()=>["+ Canvi d'ús del sòl",`${A.n.U} punts més · ${nf(BY[LASTREAL].E)} Gt de CO₂ en total`],
 ()=>["Si tot es quedés a l'aire",`+${nf(BY[LASTREAL].E/CC/2.124)} ppm en un any`],
 ()=>["Oceà",`${A.n.O} punts · ${nf(BY[LASTREAL].O)} Gt · ${pct(BY[LASTREAL].O/BY[LASTREAL].E)}`],
 ()=>["Terra",`${A.n.L} punts · ${nf(BY[LASTREAL].L)} Gt · ${pct(BY[LASTREAL].L/BY[LASTREAL].E)}`],
 ()=>["Es queda a l'aire",`${A.n.A} punts · ${nf(BY[LASTREAL].A)} Gt · ${pct(BY[LASTREAL].A/BY[LASTREAL].E)} → +${nf(BY[LASTREAL].A/CC/2.124)} ppm`],
 ()=>["Desquadrament",`${A.n.B} punts · ${nf(BY[LASTREAL].B)} Gt · ${pct(BY[LASTREAL].B/BY[LASTREAL].E)}`],
 ()=>["El 2025 i la mitjana 2016–2025",`Part que es queda a l'aire: ${pct(BY[LASTREAL].A/BY[LASTREAL].E)} i ${pct(DEC.A)}`]
];
const DEC=(()=>{let E=0,a=0,o=0,l=0,b=0;for(let y=2016;y<=2025;y++){const r=BY[y];E+=r.E;a+=r.A;o+=r.O;l+=r.L;b+=r.B}return{A:a/E,O:o/E,L:l/E,B:b/E}})();
function layoutA(){
  const gr=document.getElementById("aGraphic"),box=document.getElementById("aBox");
  const colW=gr.clientWidth;if(colW<10)return;
  const m=mob();let w=Math.min(colW,760),h;
  if(m){h=Math.min(w*.74,innerHeight*.34)}else{h=Math.min(w*.74,innerHeight-210);if(h<w*.55){w=Math.min(colW,(innerHeight-210)/.62);h=Math.min(w*.74,innerHeight-210)}}
  box.style.maxWidth=Math.round(w)+"px";
  A.W=Math.round(box.clientWidth);A.H=Math.round(Math.max(200,h));A.dpr=Math.min(2,devicePixelRatio||1);
  A.cv.width=A.W*A.dpr;A.cv.height=A.H*A.dpr;A.cv.style.height=A.H+"px";
  geoA();A.parts.forEach(p=>p.where=null);targetsA(A.step,true)}
function sceneA(c,t){
  const g=A.g,W=A.W,H=A.H,m=mob(),fs=m?10.5:12.5;
  // ocean
  const og=c.createLinearGradient(0,g.y0,0,H);og.addColorStop(0,COL.sea);og.addColorStop(1,COL.sea3);
  c.fillStyle=og;c.beginPath();c.moveTo(g.shore-W*.03,g.y0);c.lineTo(W,g.y0);c.lineTo(W,H);c.lineTo(g.shore-W*.03,H);c.fill();
  // land
  c.fillStyle=COL.soil;c.beginPath();c.moveTo(0,g.y0);c.lineTo(g.shore-W*.06,g.y0);c.bezierCurveTo(g.shore-W*.02,g.y0+H*.02,g.shore,g.y0+H*.2,g.shore+W*.05,H);c.lineTo(0,H);c.closePath();c.fill();
  c.strokeStyle="#B9B2A6";c.lineWidth=1;c.beginPath();c.moveTo(0,g.y0);c.lineTo(g.shore-W*.06,g.y0);c.stroke();
  // sea surface line with gentle waves
  c.strokeStyle=COL.cold;c.globalAlpha=.5;c.lineWidth=1;c.beginPath();for(let x=g.shore-W*.045;x<=W;x+=4){const y=g.y0+Math.sin(x*.05+(RM?0:t*1.2))*1.2;x===g.shore-W*.045?c.moveTo(x,y):c.lineTo(x,y)}c.stroke();c.globalAlpha=1;
  // factory
  const fy=g.y0,fx0=g.fac[0],fx1=g.fac[1],fh=H*.07;
  c.fillStyle="#BDB8B0";c.fillRect(fx0,fy-fh,fx1-fx0,fh);
  c.beginPath();for(let k=0;k<4;k++){const a=lerp(fx0,fx1,k/4),b=lerp(fx0,fx1,(k+1)/4);c.moveTo(a,fy-fh);c.lineTo(b,fy-fh-H*.025);c.lineTo(b,fy-fh)}c.fill();
  g.chim.forEach(([x,y])=>{c.fillStyle="#8E8A84";c.fillRect(x-3,y,6,fy-fh-y)});
  // cleared patch: stumps + flame
  c.strokeStyle=COL.dry;c.lineWidth=2;for(let k=0;k<4;k++){const x=lerp(g.patch[0],g.patch[1],.15+.23*k);c.beginPath();c.moveTo(x,g.y0);c.lineTo(x,g.y0-5);c.stroke()}
  {const x=lerp(g.patch[0],g.patch[1],.55),fl=RM?0:Math.sin(t*7)*1.2;c.fillStyle=COL.dry;c.globalAlpha=.85;c.beginPath();c.moveTo(x-5,g.y0-1);c.quadraticCurveTo(x-6,g.y0-9,x+fl,g.y0-15);c.quadraticCurveTo(x+6,g.y0-9,x+5,g.y0-1);c.fill();c.globalAlpha=1}
  // trees
  c.fillStyle="#D6CFC2";c.fillRect(0,g.y0+1,g.shore-W*.06,H*.035);
  g.treeXY.forEach(([x,y,r,h,cc])=>{c.strokeStyle="#7D6A52";c.lineWidth=1.6;c.beginPath();c.moveTo(x,g.y0);c.lineTo(x,y);c.stroke();c.fillStyle=cc?"#9DBB8B":"#AFC79F";c.beginPath();c.ellipse(x,y-r*.35,r,r*1.12,0,0,6.283);c.fill()});
  // region labels
  c.font=`italic ${fs+1}px ${SERIF}`;c.fillStyle=COL.muted;c.textAlign="left";
  c.fillText("Atmosfera",8,fs+4);
  c.fillStyle="#6E86AC";c.textAlign="right";c.fillText("Oceà",W-8,H-8);
  c.fillStyle="#8A7D68";c.textAlign="left";c.fillText("Terra",8,H-8);
  if(!m||W>360){c.font=`${fs-1}px ${SSF}`;c.fillStyle=COL.ink2;c.textAlign="center";
    c.fillText("Fàbriques",(g.fac[0]+g.fac[1])/2,g.y0+fs+4);c.fillText("Tala",(g.patch[0]+g.patch[1])/2,g.y0+fs+4);c.fillText("Bosc",(g.forest[0]+g.forest[1])/2,g.y0+fs+4)}
}
function drawA(now){
  if(!A.W)return;const c=A.ctx,t=(now-A.t0)/1000,dt=Math.min(.05,(now-(A.last||now))/1000);A.last=now;A.stepT+=dt;
  c.setTransform(A.dpr,0,0,A.dpr,0,0);c.clearRect(0,0,A.W,A.H);
  sceneA(c,t);
  const g=A.g,s=A.step,m=mob();
  // imbalance box
  if(s>=7){const b=g.box;c.save();c.setLineDash([3,3]);c.strokeStyle=COL.muted;c.lineWidth=1;c.strokeRect(b[0],b[1],b[2]-b[0],b[3]-b[1]);c.restore();
    c.font=`600 ${m?10:12}px ${SSF}`;c.fillStyle=COL.muted;c.textAlign="left";c.fillText(m?"Desquadr.":"Desquadrament",b[0]+6,b[1]+(m?12:15))}
  // particles
  const r=m?1.9:2.4;
  for(const p of A.parts){
    if(p.moving){p.mt+=dt;const q=clamp((p.mt-p.delay)/p.dur,0,1),e=ease(q);
      if(p.where!=="src"&&p.sx!==undefined&&q>0&&p.al<p.tal)p.al=Math.min(p.tal,p.al+dt*3);
      const lift=(p.where==="air"&&(p.sy>A.g.y0-A.H*.25))?-A.H*.12*Math.sin(Math.PI*e):0;
      p.x=lerp(p.sx,p.tx,e);p.y=lerp(p.sy,p.ty,e)+lift;if(q>=1)p.moving=false}
    else{p.x+=(p.tx-p.x)*.2;p.y+=(p.ty-p.y)*.2}
    if(!p.moving||p.where==="src")p.al+=(p.tal-p.al)*Math.min(1,dt*5);
    if(p.al<.02)continue;
    let jx=0,jy=0;if(!RM&&!p.moving){const amp=p.where==="air"?2.6:p.where==="O"?1.4:p.where==="B"?1:.5;jx=Math.sin(t*.7+p.ph)*amp;jy=Math.cos(t*.55+p.ph*1.3)*amp*.7}
    c.globalAlpha=p.al;
    if(p.col===COL.muted){c.strokeStyle=COL.muted;c.lineWidth=1;c.beginPath();c.arc(p.x+jx,p.y+jy,r,0,6.283);c.stroke()}
    else{c.fillStyle=p.col;c.beginPath();c.arc(p.x+jx,p.y+jy,r,0,6.283);c.fill()}
  }
  c.globalAlpha=1;
  // counts on regions
  const lab=(txt,x,y,col,al)=>{if(al<=0)return;c.save();c.globalAlpha=al;c.font=`700 ${m?11:13}px ${SSF}`;c.fillStyle=col;c.textAlign="center";c.lineJoin="round";c.strokeStyle="#fff";c.lineWidth=4;c.strokeText(txt,x,y);c.fillText(txt,x,y);c.restore()};
  const R=BY[LASTREAL];
  if(s>=4&&s<8)lab(`${nf(R.O)} Gt`,(g.ocean[0]+g.ocean[2])/2,g.ocean[1]+A.H*.2,COL.cold,1);
  if(s>=5&&s<8)lab(`${nf(R.L)} Gt`,(g.soil[0]+g.soil[2])/2,g.soil[3]+(m?14:18),COL.bio,1);
  if(s>=6&&s<8)lab(`${nf(R.A)} Gt`,(g.air[0]+g.air[2])/2,g.air[1]-(m?3:6),COL.warm,1);
  if(s===3)lab(`${nf(R.E)} Gt → +${nf(R.E/CC/2.124)} ppm`,(g.air[0]+g.air[2])/2,g.air[1]-(m?3:6),COL.ink,1);
  if(s>=1&&s<=2&&!m){c.font=`${12}px ${SSF}`;c.fillStyle=COL.ink2;c.textAlign="left"}
  if(s===8)summaryA(c,Math.min(1,A.stepT*2.5));
}
function summaryA(c,al){
  const W=A.W,H=A.H,m=mob(),fs=m?10.5:12.5;
  const R=BY[LASTREAL],y25={A:R.A/R.E,O:R.O/R.E,L:R.L/R.E,B:R.B/R.E};
  const x0=m?10:W*.08,x1=W-(m?10:W*.08),bh=m?16:22,y1=H*.15+fs*2,y2=y1+bh+fs*3.4;
  c.save();c.globalAlpha=al*.9;c.fillStyle="#fff";c.fillRect(x0-8,y1-fs*2.6,x1-x0+16,y2+bh+fs*2.2-(y1-fs*2.6));c.restore();
  c.save();c.globalAlpha=al;
  [[y1,"2025",y25],[y2,"Mitjana 2016–2025",DEC]].forEach(([y,name,s])=>{
    c.font=`700 ${fs}px ${SSF}`;c.fillStyle=COL.ink;c.textAlign="left";c.fillText(name,x0,y-6);
    let x=x0;[["A",COL.warm,"aire"],["O",COL.cold,"oceà"],["L",COL.bio,"terra"],["B",COL.muted,""]].forEach(([k,col,n])=>{const w=(x1-x0)*s[k];
      if(k==="B"){c.save();c.setLineDash([2,2]);c.strokeStyle=col;c.strokeRect(x+.5,y+.5,w-1,bh-1);c.restore()}else{c.fillStyle=col;c.fillRect(x,y,w-1,bh)}
      if(k!=="B"&&w>34){c.font=`600 ${fs}px ${SSF}`;c.fillStyle="#fff";c.textAlign="left";c.fillText(pct(s[k]),x+5,y+bh/2+fs*.36)}
      if(k!=="B"&&w>90&&!m){c.font=`${fs-1}px ${SSF}`;c.fillStyle=COL.ink2;c.fillText(n,x+2,y+bh+fs+2)}
      x+=w});
  });
  c.restore();
}
function onStepA(i){A.step=i;A.stepT=0;targetsA(i,false);const t=A_TXT[i]();document.getElementById("aTitle").textContent=t[0];document.getElementById("aVal").textContent=t[1]}

/* =====================================================================
   2. SCROLLY B — com absorbeixen el mar i la terra
   ===================================================================== */
const B={cv:document.getElementById("bCv"),step:0,W:0,H:0,dpr:1,parts:[],t0:performance.now(),stepT:0};
B.ctx=B.cv.getContext("2d");
const B_TXT=[
 ["Dissolució","Hi entren més molècules de les que en surten"],
 ["Química del carbonat","CO₂ + H₂O + CO₃²⁻ → 2 HCO₃⁻"],
 ["Cap al fons","El carboni hi queda de dècades a mil·lennis"],
 ["Bomba biològica","Sobretot carboni natural"],
 ["Fotosíntesi","Efecte del CO₂: unes 12 Gt l'any (2016–2025)"],
 ["La terra dona i pren",`2025: ${nf(BY[LASTREAL].U)} Gt per tala, ${nf(BY[LASTREAL].L)} Gt absorbides`]
];
function geoB(){const W=B.W,H=B.H,g={},f=B.f==null?0:B.f;g.y0=H*lerp(.36,.52,f);g.shore=W*lerp(.40,.66,f);g.mix=g.y0+H*.13;g.bot=H*.97;g.ox0=g.shore+W*.06;
  const tx0=W*.06,tx1=g.shore-W*lerp(.17,.2,f),K=[1,1.15,.95,1.1,.9];g.trees=K.map((k,i)=>[lerp(tx0,tx1,i/4),k*lerp(1,1.2,f)]);
  g.fire=[g.shore-W*lerp(.15,.17,f),g.shore-W*lerp(.09,.1,f)];g.tr=Math.max(10,W*lerp(.03,.042,f));B.g=g}
function layoutB(){
  const gr=document.getElementById("bGraphic"),box=document.getElementById("bBox");const colW=gr.clientWidth;if(colW<10)return;
  const m=mob();let w=Math.min(colW,760),h;
  if(m){h=Math.min(w*.78,innerHeight*.36)}else{h=Math.min(w*.72,innerHeight-190)}
  box.style.maxWidth=Math.round(w)+"px";B.W=Math.round(box.clientWidth);B.H=Math.round(Math.max(200,h));B.dpr=Math.min(2,devicePixelRatio||1);
  B.cv.width=B.W*B.dpr;B.cv.height=B.H*B.dpr;B.cv.style.height=B.H+"px";geoB();initB(B.step)}
function initB(s){const R=rng(11+s),g=B.g,W=B.W,H=B.H;B.parts=[];B.R=R;
  const n=s<=1?110:s===2?110:s===3?70:70;
  for(let i=0;i<n;i++){const p={ph:R()*6.28,age:R()*5,life:3+R()*3};spawnB(p,s,true);B.parts.push(p)}}
function spawnB(p,s,initial){const g=B.g,W=B.W,H=B.H,R=B.R;p.age=initial?R()*p.life:0;p.state=0;
  if(s<=1){p.x=lerp(g.ox0,W-6,R());p.y=lerp(H*.05,g.y0-4,R());p.vx=(R()-.5)*6;p.vy=8+R()*10;p.kind="air";p.enter=R()<.64}
  else if(s===2){p.u=R();p.d=R();p.kind="loop";p.v=.035+R()*.03}
  else if(s===3){p.x=lerp(g.ox0,W-6,R());p.y=initial?lerp(g.y0+4,H-6,R()):lerp(g.y0+4,g.mix,R()*.5);p.vy=10+R()*9;p.kind="snow"}
  else if(s===4){const resp=R()<.38;p.kind=resp?"resp":"photo";const t=g.trees[Math.floor(R()*g.trees.length)];
    if(resp){p.x=lerp(W*.02,g.shore-W*.06,R());p.y=g.y0+3;p.tx=p.x+(R()-.5)*20;p.ty=lerp(H*.04,g.y0*.6,R())}
    else{p.x=lerp(W*.01,g.shore-W*.02,R());p.y=lerp(H*.03,g.y0*.45,R());p.tx=t[0]+(R()-.5)*g.tr*1.4;p.ty=g.y0-H*.13*t[1]-g.tr*.3+(R()-.5)*g.tr}
    p.sx=p.x;p.sy=p.y;p.life=2.5+R()*2}
  else{const fire=R()<.26;p.kind=fire?"fire":"photo";
    if(fire){p.x=lerp(g.fire[0],g.fire[1],R());p.y=g.y0-4;p.tx=p.x+(R()-.3)*40;p.ty=lerp(H*.03,g.y0*.5,R())}
    else{const t=g.trees[Math.floor(R()*g.trees.length)];p.x=lerp(W*.01,g.shore-W*.02,R());p.y=lerp(H*.03,g.y0*.45,R());p.tx=t[0]+(R()-.5)*g.tr*1.4;p.ty=g.y0-H*.13*t[1]-g.tr*.3+(R()-.5)*g.tr}
    p.sx=p.x;p.sy=p.y;p.life=2.5+R()*2}
}
function sceneB(c,t,s){
  const g=B.g,W=B.W,H=B.H,m=mob(),fs=m?10.5:12.5,ocean=s<=3;
  // ocean
  const og=c.createLinearGradient(0,g.y0,0,H);og.addColorStop(0,"#DCE6F2");og.addColorStop(.25,COL.sea2);og.addColorStop(1,"#9FB6D6");
  c.fillStyle=og;c.beginPath();c.moveTo(g.shore-W*.05,g.y0);c.lineTo(W,g.y0);c.lineTo(W,H);c.lineTo(g.shore-W*.05,H);c.fill();
  c.save();c.setLineDash([2,4]);c.strokeStyle="#7F97BC";c.globalAlpha=.7;c.beginPath();c.moveTo(g.ox0-W*.02,g.mix);c.lineTo(W,g.mix);c.stroke();c.restore();
  // land
  c.fillStyle=COL.soil;c.beginPath();c.moveTo(0,g.y0);c.lineTo(g.shore-W*.08,g.y0);c.bezierCurveTo(g.shore-W*.03,g.y0+H*.05,g.shore,g.y0+H*.3,g.shore+W*.08,H);c.lineTo(0,H);c.closePath();c.fill();
  c.strokeStyle="#B9B2A6";c.lineWidth=1;c.beginPath();c.moveTo(0,g.y0);c.lineTo(g.shore-W*.08,g.y0);c.stroke();
  // trees
  const fade=ocean?.55:1;c.globalAlpha=fade;
  g.trees.forEach(([x,k])=>{const h=H*.13*k,y=g.y0-h;c.strokeStyle="#7D6A52";c.lineWidth=2;c.beginPath();c.moveTo(x,g.y0);c.lineTo(x,y);c.stroke();
    c.strokeStyle="#A39274";c.lineWidth=1;c.beginPath();c.moveTo(x,g.y0);c.lineTo(x-10,g.y0+12);c.moveTo(x,g.y0);c.lineTo(x+9,g.y0+14);c.moveTo(x,g.y0+3);c.lineTo(x+2,g.y0+18);c.stroke();
    c.fillStyle="#9DBB8B";c.beginPath();c.ellipse(x,y-g.tr*.3,g.tr*1.05,g.tr*1.15,0,0,6.283);c.fill()});
  // stumps + fire
  c.strokeStyle=COL.dry;c.lineWidth=2;for(let k=0;k<3;k++){const x=lerp(g.fire[0],g.fire[1],.2+.3*k);c.beginPath();c.moveTo(x,g.y0);c.lineTo(x,g.y0-5);c.stroke()}
  if(s===5){const x=(g.fire[0]+g.fire[1])/2,fl=RM?0:Math.sin(t*7)*1.5;c.fillStyle=COL.dry;c.beginPath();c.moveTo(x-7,g.y0-1);c.quadraticCurveTo(x-8,g.y0-12,x+fl,g.y0-21);c.quadraticCurveTo(x+8,g.y0-12,x+7,g.y0-1);c.fill()}
  c.globalAlpha=1;
  // sea surface
  c.strokeStyle=COL.cold;c.globalAlpha=.6;c.lineWidth=1;c.beginPath();for(let x=g.shore-W*.075;x<=W;x+=4){const y=g.y0+Math.sin(x*.05+(RM?0:t*1.2))*1.3;x===g.shore-W*.075?c.moveTo(x,y):c.lineTo(x,y)}c.stroke();c.globalAlpha=1;
  // labels
  c.font=`italic ${fs+1}px ${SERIF}`;c.textAlign="left";c.fillStyle=COL.muted;c.fillText("Atmosfera",8,fs+4);
  if(!(m&&s===2)){c.textAlign="right";c.fillStyle="#5E78A3";c.fillText("Superfície",W-8,g.y0+fs+6);c.fillText("Oceà profund",W-8,H-10)}
}
function txtB(c,lines,x,y,al,fs,col){c.save();c.textAlign=al;c.lineJoin="round";lines.forEach((l,i)=>{c.font=`${l[1]?"700 ":""}${fs}px ${SSF}`;c.strokeStyle="#fff";c.lineWidth=4;c.strokeText(l[0],x,y+i*fs*1.25);c.fillStyle=l[2]||col||COL.ink;c.fillText(l[0],x,y+i*fs*1.25)});c.restore()}
function arrowB(c,x0,y0,x1,y1,col,lw,hh){c.strokeStyle=col;c.fillStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();const a=Math.atan2(y1-y0,x1-x0),h=hh||6;c.beginPath();c.moveTo(x1,y1);c.lineTo(x1-h*Math.cos(a-.5),y1-h*Math.sin(a-.5));c.lineTo(x1-h*Math.cos(a+.5),y1-h*Math.sin(a+.5));c.closePath();c.fill()}
function loopPos(u,d){const g=B.g,W=B.W,H=B.H;const x0=g.ox0+W*.03,x1=W-W*.04,yT=g.y0+H*.045,yB=H*.92;
  const cx=(x0+x1)/2,cy=(yT+yB)/2,k=1-d*.42,rx=(x1-x0)/2*k,ry=(yB-yT)/2*(1-d*.5),th=-Math.PI/2+2*Math.PI*u,c=Math.cos(th),s=Math.sin(th),e=.5;
  return[cx+rx*Math.sign(c)*Math.pow(Math.abs(c),e),cy+ry*Math.sign(s)*Math.pow(Math.abs(s),e)]}
function drawB(now){
  if(!B.W)return;const c=B.ctx,t=RM?0:(now-B.t0)/1000,dt=Math.min(.05,(now-(B.last||now))/1000);B.last=now;B.stepT+=dt;
  B.ft=B.step>=4?1:0;if(B.f==null)B.f=B.ft;B.f+=(B.ft-B.f)*(RM?1:Math.min(1,dt*3));geoB();
  const s=B.step,g=B.g,W=B.W,H=B.H,m=mob(),fs=m?10.5:12.5,sp=RM?0:1;
  c.setTransform(B.dpr,0,0,B.dpr,0,0);c.clearRect(0,0,W,H);sceneB(c,t,s);
  const fa=Math.min(1,B.stepT*2);
  // overlays per step
  if(s===2){c.save();c.globalAlpha=.55*fa;c.strokeStyle=COL.cold;c.setLineDash([5,5]);c.lineWidth=1.2;c.beginPath();for(let u=0;u<=1.001;u+=.004){const p=loopPos(u,.5);u?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.stroke();c.restore();
    c.save();c.globalAlpha=fa;[.1,.35,.6,.85].forEach(u=>{const p1=loopPos(u-.025,.5),p2=loopPos(u,.5);arrowB(c,p1[0],p1[1],p2[0],p2[1],COL.cold,1.6,9)});const ax=g.ox0+W*.015;arrowB(c,ax,g.y0-H*.2,ax,g.y0+H*.035,COL.cold,3);txtB(c,[["CO₂ de l'aire",true,COL.cold]],ax-8,g.y0-H*.2+fs,"right",fs);c.restore()}
  // particles
  for(const p of B.parts){
    p.age+=dt*sp;let x,y,col=COL.ink,al=1;
    if(p.kind==="air"){
      if(p.state===0){p.y+=p.vy*dt*sp*(m?1:1.3);p.x+=p.vx*dt*sp;if(p.y>=g.y0){if(p.enter){p.state=1;p.vy*=.25}else{p.state=2;p.vy=-p.vy*.8}}}
      else if(p.state===1){p.y+=p.vy*dt*sp*.6;p.x+=Math.sin(t+p.ph)*dt*sp*4;if(p.y>g.mix-4)p.vy=-Math.abs(p.vy)*.5;if(p.y<g.y0+3)p.vy=Math.abs(p.vy)}
      else{p.y+=p.vy*dt*sp;}
      x=p.x;y=p.y;col=p.state===1?"#1F4A8E":COL.ink;al=p.state===2?clamp(1-(g.y0-p.y)/(H*.2),0,1):1;
      if(p.age>p.life*2.2||(p.state===2&&al<=0))spawnB(p,s,false);
      if(s===1&&p.state===1)col="#5E86C4";
    }else if(p.kind==="loop"){p.u+=p.v*dt*sp*.5;const q=loopPos(p.u,p.d);x=q[0]+Math.sin(t*.8+p.ph)*2;y=q[1]+Math.cos(t*.6+p.ph)*2;col=COL.cold}
    else if(p.kind==="snow"){p.y+=p.vy*dt*sp*(p.y<g.mix?.5:1);x=p.x+Math.sin(t*.9+p.ph)*2;y=p.y;col="#6B7F3A";if(p.y>H-4)spawnB(p,s,false)}
    else{const q=clamp(p.age/p.life,0,1),e=ease(q);x=lerp(p.sx,p.tx,e)+Math.sin(t+p.ph)*1.5;y=lerp(p.sy,p.ty,e);
      col=p.kind==="photo"?(q>.85?COL.bio:COL.ink):p.kind==="fire"?COL.dry:COL.ink2;al=q>.9?1-(q-.9)/.1:q<.08?q/.08:1;if(q>=1)spawnB(p,s,false)}
    c.globalAlpha=al*fa;c.fillStyle=col;c.beginPath();c.arc(x,y,m?1.9:2.3,0,6.283);c.fill()}
  c.globalAlpha=1;
  // phytoplankton at surface
  if(s===3){const R=rng(5);c.fillStyle=COL.bio;for(let i=0;i<70;i++){const x=lerp(g.ox0,W-6,R()),y=lerp(g.y0+3,g.mix-3,R())+Math.sin(t+i)*1.2;c.globalAlpha=.75*fa;c.beginPath();c.ellipse(x,y,2.6,1.4,i,0,6.283);c.fill()}c.globalAlpha=1}
  // annotations
  c.globalAlpha=fa;
  if(s===0){const x=g.ox0+(W-g.ox0)*.5;arrowB(c,x-16,g.y0-H*.2,x-16,g.y0+H*.06,COL.cold,3);arrowB(c,x+16,g.y0+H*.03,x+16,g.y0-H*.12,COL.ink2,1.4);
    txtB(c,[["Entren",true,COL.cold]],x-24,g.y0-H*.2+fs,"right",fs+1);txtB(c,[["Surten",true,COL.ink2]],x+24,g.y0-H*.12+fs,"left",fs+1);
    }
  if(s===1){const cx=g.ox0+(W-g.ox0)*.45,cy=g.mix+(H-g.mix)*.38,rr=Math.min(W*(m?.3:.26),(H-g.mix)*(m?.46:.42));
    c.save();c.fillStyle="#fff";c.globalAlpha=.94*fa;c.beginPath();c.arc(cx,cy,rr,0,6.283);c.fill();c.globalAlpha=fa;c.strokeStyle=COL.cold;c.lineWidth=1;c.stroke();c.restore();
    c.save();c.strokeStyle=COL.cold;c.globalAlpha=.5*fa;c.beginPath();c.moveTo(cx-rr*.5,cy-rr*.87);c.lineTo(cx-rr*.25,g.y0+H*.06);c.stroke();c.restore();
    const f2=m?11:Math.min(16,rr*.13);txtB(c,[["CO₂ + H₂O + CO₃²⁻",true,COL.ink],["→ 2 HCO₃⁻",true,COL.cold]],cx,cy-rr*.32,"center",f2);
    if(!m)txtB(c,[["el carbonat es torna bicarbonat",false,COL.ink2]],cx,cy+rr*.14,"center",f2-2);
    txtB(c,m?[["pH: −0,1",true,COL.warm]]:[["pH: −0,1 unitats",true,COL.warm],["des de la Revolució Industrial",false,COL.warm]],cx,cy+rr*(m?.36:.44),"center",f2-1)}
  if(s===2){const p=loopPos(.25,.5);txtB(c,[["L'aigua freda s'enfonsa",true,COL.cold],["i s'emporta el carboni",false,COL.ink2]],p[0]-12,p[1]-fs*.6,"right",fs);
    const q=loopPos(.5,0);txtB(c,[["Dècades a mil·lennis al fons",true,COL.ink]],q[0],q[1]+fs*1.3,"center",fs);
    const r=loopPos(.0,0);txtB(c,[["A la superfície, cap als pols",false,COL.ink2]],r[0],r[1]-fs*.6,"center",fs)}
  if(s===3){txtB(c,[["Plàncton",true,COL.bio]],g.ox0+6,g.y0-8,"left",fs);txtB(c,[["Neu marina que s'enfonsa",true,COL.bio]],W-8,g.mix+(H-g.mix)*.55,"right",fs)}
  if(s===4){const t0=g.trees[1];txtB(c,[["Fotosíntesi",true,COL.bio],["més CO₂, més creixement",false,COL.ink2]],t0[0]+g.tr*1.4,g.y0-H*.2,"left",fs);
    txtB(c,[["Respiració del sòl",true,COL.ink2]],W*.02,g.y0+fs+10,"left",fs)}
  if(s===5){txtB(c,[[`Tala i incendis: ${nf(BY[LASTREAL].U)} Gt`,true,COL.dry]],(g.fire[0]+g.fire[1])/2,g.y0+fs+8,"center",fs);
    txtB(c,[[`Absorció: ${nf(BY[LASTREAL].L)} Gt`,true,COL.bio]],8,fs*2.6+8,"left",fs)}
  c.globalAlpha=1;
}
function onStepB(i){B.step=i;B.stepT=0;if(B.W)initB(i);document.getElementById("bTitle").textContent=B_TXT[i][0];document.getElementById("bVal").textContent=B_TXT[i][1]}

/* =====================================================================
   3. KEELING — corba sencera i ampliació
   ===================================================================== */
const K={svg:d3.select("#kSvg"),tip:document.getElementById("kTip"),w0:2022.75,span:4};
K.data=D.M.map((v,i)=>{const mi=D.M0[1]-1+i,y=D.M0[0]+Math.floor(mi/12),m=mi%12;return{t:y+(m+.5)/12,y,m,v,d:D.MD[i]}});
K.tmin=K.data[0].t-.04;K.tmax=K.data[K.data.length-1].t+.04;
const KMAX=K.data.reduce((a,b)=>b.v>a.v?b:a);
function layoutK(){
  const wrap=document.getElementById("kWrap"),W=wrap.clientWidth;if(!W)return;const m=mob();
  const ml=m?34:44,mr=m?18:20,oh=m?110:140,gap=m?44:52,dh=m?230:300,top=16,H=top+oh+gap+dh+28;
  K.W=W;K.ml=ml;K.mr=mr;K.oh=oh;K.dh=dh;K.top=top;K.dy=top+oh+gap;
  const svg=K.svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
  K.xo=d3.scaleLinear([K.tmin,K.tmax],[ml,W-mr]);K.yo=d3.scaleLinear([310,440],[top+oh,top]);
  const go=svg.append("g");
  go.append("g").attr("class","axis").attr("transform",`translate(0,${top+oh})`).call(d3.axisBottom(K.xo).tickValues([1960,1970,1980,1990,2000,2010,2020]).tickFormat(d3.format("d")).tickSize(4)).call(a=>a.select(".domain").remove());
  go.append("g").attr("class","axis").attr("transform",`translate(${ml},0)`).call(d3.axisLeft(K.yo).tickValues([320,360,400,440]).tickSize(-(W-ml-mr))).call(a=>{a.select(".domain").remove();a.selectAll("line").attr("stroke",COL.hair).attr("stroke-width",.6)});
  go.append("path").datum(K.data).attr("fill","none").attr("stroke",COL.ink).attr("stroke-width",1).attr("d",d3.line(d=>K.xo(d.t),d=>K.yo(d.v)));
  const f=K.data[0];
  go.append("text").attr("class","lbl halo").attr("x",K.xo(f.t)+4).attr("y",K.yo(f.v)-8).text(`${nf(f.v)} ppm`);
  go.append("text").attr("class","lbl m halo").attr("x",K.xo(f.t)+4).attr("y",K.yo(f.v)-8-(m?14:16)).text(m?"març 1958":"març del 1958");
  const lx=K.xo(K.tmax-4.4);
  go.append("text").attr("class","lbl b halo").attr("x",lx).attr("y",K.yo(KMAX.v)+2).attr("text-anchor","end").text(`${nf(KMAX.v)} ppm →`);
  go.append("text").attr("class","lbl m halo").attr("x",lx).attr("y",K.yo(KMAX.v)+(m?14:16)).attr("text-anchor","end").text(`${MONTHS[KMAX.m]} del ${KMAX.y}`);
  go.append("text").attr("class","lbl m").attr("x",ml+2).attr("y",top-4).style("font-size",m?"10.5px":"11.5px").text("ppm");
  // window
  K.win=go.append("rect").attr("y",top).attr("height",oh).attr("fill",COL.warm).attr("fill-opacity",.12).attr("stroke",COL.warm).attr("stroke-width",1.2).style("cursor","grab").attr("tabindex",0).attr("role","slider").attr("aria-label","Finestra de l'ampliació; fes servir les fletxes");
  K.winLab=go.append("text").attr("class","lbl b").attr("y",top+oh+(m?30:34)).attr("text-anchor","middle").attr("fill",COL.warm).style("fill",COL.warm);
  // connector lines
  K.c1=svg.append("line").attr("stroke",COL.warm).attr("stroke-opacity",.45);K.c2=svg.append("line").attr("stroke",COL.warm).attr("stroke-opacity",.45);
  // detail
  K.gd=svg.append("g");K.gx=K.gd.append("g").attr("class","axis");K.gy=K.gd.append("g").attr("class","axis");
  K.gmk=K.gd.append("rect").attr("fill",COL.hair).attr("opacity",.45);
  K.gmkT=K.gd.append("text").attr("class","lbl m").style("font-size","11px");
  K.pd=K.gd.append("path").attr("fill","none").attr("stroke",COL.muted).attr("stroke-width",1.4).attr("stroke-dasharray","3 3");
  K.pv=K.gd.append("path").attr("fill","none").attr("stroke",COL.ink).attr("stroke-width",1.8);
  K.dots=K.gd.append("g");K.labs=K.gd.append("g");
  K.hl=K.gd.append("line").attr("stroke",COL.ink).attr("stroke-width",.7).attr("opacity",0);
  K.hit=K.gd.append("rect").attr("x",ml).attr("y",K.dy).attr("width",W-ml-mr).attr("height",dh).attr("fill","transparent");
  // interactions
  const drag=d3.drag().on("start",function(e){K.dx=K.xo.invert(e.x)-K.w0;d3.select(this).style("cursor","grabbing")}).on("drag",e=>{setK(K.xo.invert(e.x)-K.dx)}).on("end",function(){d3.select(this).style("cursor","grab")});
  K.win.call(drag);
  go.append("rect").attr("x",ml).attr("y",top).attr("width",W-ml-mr).attr("height",oh).attr("fill","transparent").lower().on("click",e=>{const[x]=d3.pointer(e);setK(K.xo.invert(x)-K.span/2)});
  K.win.on("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();setK(K.w0+(e.key==="ArrowLeft"?-1:1)*(e.shiftKey?5:1))}});
  K.hit.on("pointermove",e=>{const[x]=d3.pointer(e);hoverK(x)}).on("pointerdown",e=>{const[x]=d3.pointer(e);hoverK(x)}).on("pointerleave",e=>{if(e.pointerType==="mouse"){K.hl.attr("opacity",0);K.tip.style.opacity=0}});
  setK(K.w0,true);
}
function setK(w0,instant){
  w0=clamp(w0,K.tmin,K.tmax-K.span);K.w0=w0;const W=K.W,m=mob(),ml=K.ml,mr=K.mr,dy=K.dy,dh=K.dh;
  K.win.attr("x",K.xo(w0)).attr("width",K.xo(w0+K.span)-K.xo(w0)).attr("aria-valuetext",`${Math.floor(w0)}–${Math.floor(w0+K.span)}`);
  K.winLab.attr("x",clamp((K.xo(w0)+K.xo(w0+K.span))/2,ml+30,W-mr-30)).text(`${Math.floor(w0+.04)}–${Math.floor(w0+K.span-.04)}`);
  K.c1.attr("x1",K.xo(w0)).attr("y1",K.top+K.oh).attr("x2",ml).attr("y2",dy-4);
  K.c2.attr("x1",K.xo(w0+K.span)).attr("y1",K.top+K.oh).attr("x2",W-mr).attr("y2",dy-4);
  const sub=K.data.filter(d=>d.t>=w0-.05&&d.t<=w0+K.span+.05);K.sub=sub;
  const lo=d3.min(sub,d=>Math.min(d.v,d.d)),hi=d3.max(sub,d=>Math.max(d.v,d.d));
  K.xd=d3.scaleLinear([w0,w0+K.span],[ml,W-mr]);K.yd=d3.scaleLinear([Math.floor(lo-1),Math.ceil(hi+1.2)],[dy+dh,dy+14]);
  const yrs=d3.range(Math.ceil(w0),Math.floor(w0+K.span)+1);
  K.gx.attr("transform",`translate(0,${dy+dh})`).call(d3.axisBottom(K.xd).tickValues(yrs).tickFormat(d3.format("d")).tickSize(5)).call(a=>a.select(".domain").attr("stroke",COL.hair));
  K.gy.attr("transform",`translate(${ml},0)`).call(d3.axisLeft(K.yd).ticks(m?4:6).tickFormat(d=>nf(d,0)).tickSize(-(W-ml-mr))).call(a=>{a.select(".domain").remove();a.selectAll("line").attr("stroke",COL.hair).attr("stroke-width",.6)});
  const mk0=2022+11/12,mk1=2023+6.13/12,a0=Math.max(mk0,w0),a1=Math.min(mk1,w0+K.span);
  if(a1>a0){K.gmk.attr("x",K.xd(a0)).attr("width",K.xd(a1)-K.xd(a0)).attr("y",dy+14).attr("height",dh-14).attr("opacity",.45);K.gmkT.attr("x",K.xd((a0+a1)/2)).attr("y",dy+dh-6).attr("text-anchor","middle").text(m?"Maunakea":"mesures a Maunakea")}else{K.gmk.attr("opacity",0);K.gmkT.text("")}
  const ln=d3.line(d=>K.xd(d.t),d=>K.yd(d.v)),lnd=d3.line(d=>K.xd(d.t),d=>K.yd(d.d));
  K.pv.attr("d",ln(sub));K.pd.attr("d",lnd(sub));
  K.dots.selectAll("circle").data(sub,d=>d.t).join("circle").attr("r",m?2:2.6).attr("cx",d=>K.xd(d.t)).attr("cy",d=>K.yd(d.v)).attr("fill",d=>d.m===4?COL.warm:(d.m===8||d.m===9)?COL.bio:COL.ink);
  // max/min labels for each year
  const labs=[];yrs.concat([Math.floor(w0)]).forEach(y=>{const ys=sub.filter(d=>d.y===y);if(ys.length<10)return;const mx=ys.reduce((a,b)=>b.v>a.v?b:a),mn=ys.reduce((a,b)=>b.v<a.v?b:a);labs.push({d:mx,t:MSH[mx.m],c:COL.warm,up:true},{d:mn,t:MSH[mn.m],c:COL.bio,up:false})});
  const uniq=[...new Map(labs.map(l=>[l.d.t,l])).values()];
  K.labs.selectAll(".ex").remove();
  K.labs.selectAll("text.mm").data(uniq,l=>l.d.t).join("text").attr("class","lbl b halo mm").attr("text-anchor","middle").attr("x",l=>K.xd(l.d.t)).attr("y",l=>K.yd(l.d.v)+(l.up?-9:17)).style("fill",l=>l.c).text(l=>l.t);
  // explanatory labels (desktop)
  let ys0=null;for(const y of yrs){const q=sub.filter(d=>d.y===y);if(q.length>=12&&q.reduce((a,b)=>b.v>a.v?b:a).m===4){ys0=q;break}}
  if(ys0&&!m){const mx=ys0.reduce((a,b)=>b.v>a.v?b:a),mn=ys0.reduce((a,b)=>b.v<a.v?b:a);
    K.labs.append("text").attr("class","lbl ex halo").attr("x",K.xd(mx.t)+10).attr("y",K.yd(mx.v)-22).style("fill",COL.warm).text("màxim cap al maig, abans que el nord reverdeixi");
    K.labs.append("text").attr("class","lbl ex halo").attr("x",K.xd(mn.t)+10).attr("y",K.yd(mn.v)+30).style("fill",COL.bio).text("mínim a la tardor, després de l'estiu de creixement")}
  d3.selectAll("#kSeg button").attr("aria-pressed",function(){return String(Math.abs(+this.dataset.y-w0)<.05)});
}
function hoverK(x){const t=K.xd.invert(x);let best=null,bd=1e9;K.sub.forEach(d=>{const dd=Math.abs(d.t-t);if(dd<bd){bd=dd;best=d}});if(!best)return;
  K.hl.attr("x1",K.xd(best.t)).attr("x2",K.xd(best.t)).attr("y1",K.dy+14).attr("y2",K.dy+K.dh).attr("opacity",1);
  K.tip.innerHTML=`<b>${MONTHS[best.m]} ${best.y}</b>: ${nf(best.v,2)} ppm<br><span style="color:${COL.muted}">sense cicle estacional: ${nf(best.d,2)}</span>`;K.tip.style.opacity=1;
  const w=K.tip.offsetWidth;K.tip.style.transform=`translate(${clamp(K.xd(best.t)-w/2,0,K.W-w)}px,${K.dy-34}px)`}
document.querySelectorAll("#kSeg button").forEach(b=>b.addEventListener("click",()=>setK(+b.dataset.y)));

/* =====================================================================
   4. ANY A ANY — fonts i embornals amb El Niño
   ===================================================================== */
const Y={svg:d3.select("#ySvg"),tip:document.getElementById("yTip"),sel:2025,hov:null};
Y.rows=ROWS.filter(r=>r.y>=1959);
const ONIRAMP=d3.scaleLinear([-1.6,-.5,0,.5,1.6],["#1F4A8E","#8FB3DA","#E4E4E2","#EDA27A","#C8442A"]).clamp(true);
const NOTES={
 1983:"El Niño molt fort del 1982–83.",
 1987:"El Niño del 1986–88. L'aire es va quedar el 76% de les emissions, el màxim de la sèrie.",
 1991:"Al juny va esclatar el Pinatubo, a les Filipines. Probablement la terra va absorbir més del que reprodueixen els models: d'aquí el gran desquadrament.",
 1992:"L'any després del Pinatubo, l'aire només es va quedar el 19%. Els models no ho reprodueixen: el desquadrament és molt gran.",
 1997:"Comença El Niño del 1997–98, un dels més forts del segle XX. Grans incendis a Indonèsia.",
 1998:"El Niño va tocar sostre a finals del 1997 (ONI +2,4), però el CO₂ es va disparar el 1998: va pujar 2,8 ppm.",
 2015:"El Niño fort del 2015–16. Incendis de torberes al sud-est asiàtic.",
 2016:"El Niño va tocar sostre a l'hivern del 2015 al 2016. El CO₂ mundial va pujar gairebé tant com el 2015: 2,8 ppm. A Mauna Loa, 3,0 ppm, el rècord fins aleshores.",
 2023:"Arriba El Niño. Sequera a l'Amazònia i incendis rècord al Canadà.",
 2024:"El Niño va durar fins a la primavera. Rècord de creixement del CO₂ mundial: 3,8 ppm. Les barres passen la línia: els models probablement sobreestimen l'absorció de la terra.",
 2025:"Recuperació: l'embornal terrestre més gran del registre.",
 2026:"Projecció. L'embornal terrestre es calcula com la resta dels altres termes, sense desquadrament. Comença un El Niño fort; l'efecte sobre el CO₂ es notarà sobretot el 2027."
};
function layoutY(){
  const wrap=document.getElementById("yWrap"),W=wrap.clientWidth;if(!W)return;const m=mob();
  const ml=m?28:36,mr=4,top=14,ch=m?210:300,sh=m?10:13,gap=8,H=top+ch+gap+sh+26;
  Y.W=W;Y.H=H;Y.ml=ml;Y.top=top;Y.ch=ch;
  const svg=Y.svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
  Y.x=d3.scaleBand(Y.rows.map(r=>r.y),[ml,W-mr]).paddingInner(m?.12:.18);
  Y.yy=d3.scaleLinear([0,52],[top+ch,top]);
  svg.append("g").attr("class","axis").attr("transform",`translate(${ml},0)`).call(d3.axisLeft(Y.yy).tickValues([0,10,20,30,40,50]).tickSize(-(W-ml-mr))).call(a=>{a.select(".domain").remove();a.selectAll("line").attr("stroke",COL.hair).attr("stroke-width",.6)});
  svg.append("text").attr("class","lbl m").attr("x",ml).attr("y",top-3).style("font-size",m?"10.5px":"11.5px").text("Gt de CO₂");
  const g=svg.append("g");
  Y.bars=g.selectAll("g.yb").data(Y.rows).join("g").attr("class","yb");
  Y.bars.each(function(r){const s=d3.select(this),x=Y.x(r.y),w=Y.x.bandwidth();let y0=0;
    [["L",COL.bio],["O",COL.cold],["A",COL.warm]].forEach(([k,c])=>{const v=Math.max(0,r[k]);s.append("rect").attr("x",x).attr("width",w).attr("y",Y.yy(y0+v)).attr("height",Math.max(0,Y.yy(y0)-Y.yy(y0+v))).attr("fill",c).attr("opacity",r.y===LAST?.45:1);y0+=v});
    s.append("rect").attr("class","oni").attr("x",x).attr("width",w).attr("y",top+ch+gap).attr("height",sh).attr("fill",ONIRAMP(ONI(r.y)));
  });
  // emissions step line
  const pts=[];Y.rows.forEach(r=>{const x=Y.x(r.y),w=Y.x.bandwidth(),p=Y.x.step()*Y.x.paddingInner()/2;pts.push([x-p,Y.yy(r.E)],[x+w+p,Y.yy(r.E)])});
  g.append("path").attr("d",d3.line()(pts)).attr("fill","none").attr("stroke",COL.ink).attr("stroke-width",1.6);
  // axis years
  const ax=svg.append("g").attr("class","axis");
  [1960,1970,1980,1990,2000,2010,2020].forEach(y=>{ax.append("text").attr("x",Y.x(y)+Y.x.bandwidth()/2).attr("y",top+ch+gap+sh+15).attr("text-anchor","middle").text(y)});
  if(!m){svg.append("text").attr("class","lbl m").attr("x",W-mr).attr("y",top+ch+gap+sh+15).attr("text-anchor","end").style("font-size","11px").text("")}
  // labels
  const lr=BY[1987];if(!m)svg.append("text").attr("class","lbl halo").attr("x",Y.x(1962)).attr("y",Y.yy(BY[1962].E)-10).text("Emissions");
  // selection marker
  Y.selR=g.append("rect").attr("fill","none").attr("stroke",COL.ink).attr("stroke-width",1.3).attr("pointer-events","none");
  Y.selT=svg.append("text").attr("class","lbl b halo").attr("text-anchor","middle");
  Y.hovR=g.append("rect").attr("fill",COL.ink).attr("opacity",0).attr("pointer-events","none");
  svg.on("pointermove",e=>hoverY(e)).on("pointerdown",e=>{const y=yearAt(e);if(y){selectY(y)}}).on("pointerleave",e=>{if(e.pointerType==="mouse"){Y.tip.style.opacity=0;Y.hovR.attr("opacity",0)}});
  selectY(Y.sel);
}
function yearAt(e){const[x]=d3.pointer(e,Y.svg.node());const st=Y.x.step(),i=Math.floor((x-Y.x.range()[0]+st*Y.x.paddingInner()/2)/st);const r=Y.rows[clamp(i,0,Y.rows.length-1)];return r&&r.y}
function hoverY(e){const y=yearAt(e);if(!y)return;const r=BY[y];const x=Y.x(y)+Y.x.bandwidth()/2;
  Y.hovR.attr("x",Y.x(y)-1).attr("width",Y.x.bandwidth()+2).attr("y",Y.top).attr("height",Y.ch).attr("opacity",.06);
  Y.tip.innerHTML=`<b>${y}${y===LAST?" (projecció)":""}</b> · a l'aire ${pct(r.A/r.E)}`;Y.tip.style.opacity=1;const w=Y.tip.offsetWidth;Y.tip.style.transform=`translate(${clamp(x-w/2,0,Y.W-w)}px,${Y.yy(Math.max(r.E,r.A+r.O+r.L))-36}px)`}
function selectY(y){Y.sel=y;const r=BY[y],x=Y.x(y),w=Y.x.bandwidth(),top=Math.max(r.E,r.A+r.O+r.L);
  Y.selR.attr("x",x-1.5).attr("width",w+3).attr("y",Y.yy(top)-2).attr("height",Y.yy(0)-Y.yy(top)+4);
  Y.selT.attr("x",clamp(x+w/2,20,Y.W-20)).attr("y",Y.yy(top)-8).text(y);
  const o=ONI(y);
  const row=(n,v,c,dash)=>{const p=v/r.E;return`<div class="yp-row"><span>${n}</span><span class="bar"><i style="width:${clamp(Math.abs(p),0,1)*100}%;background:${dash?"repeating-linear-gradient(90deg,#7A7A7A 0 3px,transparent 3px 5px)":c}"></i></span><span class="v">${v<0?"−":""}${nf(Math.abs(v))} Gt · ${v<0?"−":""}${Math.round(Math.abs(p)*100)}%</span></div>`};
  document.getElementById("yPanel").innerHTML=`<h3>${y}${y===LAST?" · projecció":""}</h3><p class="em">Emissions: ${nf(r.E)} Gt de CO₂${o!=null?` · índex ONI mitjà de l'any: ${o>0?"+":o<0?"−":""}${nf(Math.abs(o),2)}`:""}</p><div class="yp-rows">${row("Es queda a l'aire",r.A,COL.warm)}${row("Oceà",r.O,COL.cold)}${row("Terra",r.L,COL.bio)}${y===LAST?"":row("Desquadrament",r.B,COL.muted,true)}</div>${NOTES[y]?`<p class="yp-note">${NOTES[y]}</p>`:""}`;
  d3.selectAll("#ySeg button").attr("aria-pressed",function(){return String(+this.dataset.y===y)});
}
document.querySelectorAll("#ySeg button").forEach(b=>b.addEventListener("click",()=>selectY(+b.dataset.y)));
document.getElementById("ySvg").addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();selectY(clamp(Y.sel+(e.key==="ArrowLeft"?-1:1),1959,LAST))}});

/* =====================================================================
   5. DES DEL 1850 — fonts i destins, anual o acumulat
   ===================================================================== */
const Hh={svg:d3.select("#hSvg"),tip:document.getElementById("hTip"),cum:0};
(function(){let c={F:0,U:0,A:0,O:0,L:0,B:0};Hh.rows=ROWS.map(r=>{["F","U","A","O","L","B"].forEach(k=>c[k]+=r[k]);return{y:r.y,a:r,c:{...c}}})})();
function layoutH(){
  const wrap=document.getElementById("hWrap"),W=wrap.clientWidth;if(!W)return;const m=mob();
  const ml=m?38:52,mr=m?8:120,top=12,ch=m?300:420,H=top+ch+28;Hh.W=W;Hh.ml=ml;Hh.mr=mr;Hh.top=top;Hh.ch=ch;
  const svg=Hh.svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
  Hh.x=d3.scaleLinear([1850,LAST+1],[ml,W-mr]);
  Hh.gy=svg.append("g").attr("class","axis");
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${top+ch})`).call(d3.axisBottom(Hh.x).tickValues(m?[1850,1900,1950,2000]:[1850,1875,1900,1925,1950,1975,2000,2025]).tickFormat(d3.format("d")).tickSize(4)).call(a=>a.select(".domain").remove());
  Hh.areas=svg.append("g");Hh.zero=svg.append("line").attr("stroke",COL.ink).attr("stroke-width",.8);
  Hh.proj=svg.append("rect").attr("fill","#fff").attr("opacity",.55);
  Hh.ann=svg.append("g");Hh.labs=svg.append("g");
  Hh.hl=svg.append("line").attr("stroke",COL.ink).attr("stroke-width",.7).attr("opacity",0);
  svg.append("rect").attr("x",ml).attr("y",top).attr("width",W-ml-mr).attr("height",ch).attr("fill","transparent")
    .on("pointermove",e=>hoverH(e)).on("pointerdown",e=>hoverH(e)).on("pointerleave",e=>{if(e.pointerType==="mouse"){Hh.tip.style.opacity=0;Hh.hl.attr("opacity",0)}});
  drawH(true);
}
const HKEYS=[["F",COL.ink,1],["U",COL.dry,1],["A",COL.warm,-1],["O",COL.cold,-1],["L",COL.bio,-1]];
function stackH(cum){const out={};const get=(d,k)=>(cum?d.c[k]:d.a[k]);
  let up=Hh.rows.map(()=>0),dn=Hh.rows.map(()=>0);
  HKEYS.forEach(([k,,s])=>{out[k]=Hh.rows.map((d,i)=>{const v=Math.max(0,get(d,k));if(s>0){const a=up[i];up[i]+=v;return[a,up[i]]}const a=dn[i];dn[i]-=v;return[a,dn[i]]})});return out}
function drawH(instant){
  const cum=Hh.cum,m=mob(),W=Hh.W,ml=Hh.ml,mr=Hh.mr,top=Hh.top,ch=Hh.ch;
  const st=stackH(cum);const maxUp=d3.max(Hh.rows,(d,i)=>st.U[i][1]),minDn=d3.min(Hh.rows,(d,i)=>st.L[i][1]);
  const lim=cum?3200:55;Hh.y=d3.scaleLinear([-lim,lim],[top+ch,top]);
  const ticks=cum?[-3000,-2000,-1000,0,1000,2000,3000]:[-50,-25,0,25,50];
  Hh.gy.attr("transform",`translate(${ml},0)`).transition().duration(instant||RM?0:700).call(d3.axisLeft(Hh.y).tickValues(ticks).tickFormat(v=>nf(Math.abs(v),0)).tickSize(-(W-ml-mr))).on("end",function(){}).selection().call(a=>{a.select(".domain").remove();a.selectAll("line").attr("stroke",COL.hair).attr("stroke-width",.6)});
  Hh.zero.attr("x1",ml).attr("x2",W-mr).attr("y1",Hh.y(0)).attr("y2",Hh.y(0));
  const area=k=>d3.area().x((d,i)=>Hh.x(d.y+.5)).y0((d,i)=>Hh.y(st[k][i][0])).y1((d,i)=>Hh.y(st[k][i][1])).curve(d3.curveLinear);
  const sel=Hh.areas.selectAll("path").data(HKEYS,d=>d[0]).join("path").attr("fill",d=>d[1]).attr("opacity",.92);
  (instant||RM?sel:sel.transition().duration(700)).attr("d",d=>area(d[0])(Hh.rows));
  Hh.proj.attr("x",Hh.x(LAST)).attr("width",Hh.x(LAST+1)-Hh.x(LAST)).attr("y",top).attr("height",ch);
  // labels on the right
  Hh.labs.selectAll("*").remove();Hh.ann.selectAll("*").remove();
  const i25=Hh.rows.findIndex(d=>d.y===LASTREAL),r25=Hh.rows[i25];
  if(!m){const xl=W-mr+8;
    const items=[["F","Fòssil i ciment",COL.ink],["U","Ús del sòl",COL.dry],["A","Atmosfera",COL.warm],["O","Oceà",COL.cold],["L","Terra",COL.bio]];
    const tot=cum?r25.c.F+r25.c.U:0;
    let ys=items.map(([k,n,c])=>({k,n,c,y:Hh.y((st[k][i25][0]+st[k][i25][1])/2)}));
    // de-overlap
    for(let it=0;it<20;it++){for(let j=1;j<ys.length;j++){if(ys[j].y-ys[j-1].y<36){const d=(36-(ys[j].y-ys[j-1].y))/2;ys[j].y+=d;ys[j-1].y-=d}}}
    ys.forEach(o=>{const v=cum?r25.c[o.k]:r25.a[o.k];const t=Hh.labs.append("text").attr("class","lbl").attr("x",xl).attr("y",o.y-2).style("fill",o.c).style("font-weight",700).text(o.n);
      Hh.labs.append("text").attr("class","lbl m").attr("x",xl).attr("y",o.y+14).text(cum&&["A","O","L"].includes(o.k)?`${nf(v,0)} Gt · ${pct(v/tot)}`:`${nf(v,cum?0:1)} Gt`)});
    Hh.labs.append("text").attr("class","lbl m").attr("x",xl).attr("y",top+8).style("font-size","11px").text(cum?"Total 1850–2025":"El 2025");
  }
  Hh.ann.append("text").attr("class","lbl b halo").attr("x",ml+6).attr("y",Hh.y(cum?2500:46)).text("Emissions ↑");
  Hh.ann.append("text").attr("class","lbl b halo").attr("x",ml+6).attr("y",Hh.y(cum?-2500:-46)).text("On van ↓");
  if(!cum&&!m){const x=Hh.x(1900),y=Hh.y(BY[1900].E+2);Hh.ann.append("line").attr("x1",x).attr("x2",x).attr("y1",y).attr("y2",Hh.y(BY[1900].E+11)).attr("stroke",COL.ink).attr("stroke-width",.6);
    Hh.ann.append("text").attr("class","lbl halo").attr("x",x-4).attr("y",Hh.y(BY[1900].E+17)).text("Fins a mitjan segle XX,");Hh.ann.append("text").attr("class","lbl halo").attr("x",x-4).attr("y",Hh.y(BY[1900].E+17)+15).text("la tala emetia més que els fòssils")}
  if(!cum&&!m){const x=Hh.x(1959);Hh.ann.append("text").attr("class","lbl m halo").attr("x",x+4).attr("y",Hh.y(-38)).style("font-size","11px").text("Des del 1959: CO₂ de l'aire mesurat directament");Hh.ann.append("line").attr("x1",x).attr("x2",x).attr("y1",Hh.y(-31)).attr("y2",Hh.y(-40)).attr("stroke",COL.muted).attr("stroke-width",.6)}
  if(m){Hh.ann.append("text").attr("class","lbl m halo").attr("x",W-mr).attr("y",Hh.y(cum?-2850:-52)).attr("text-anchor","end").style("font-size","10.5px").text(cum?`Atmosfera ${pct(r25.c.A/(r25.c.F+r25.c.U))} · Oceà ${pct(r25.c.O/(r25.c.F+r25.c.U))} · Terra ${pct(r25.c.L/(r25.c.F+r25.c.U))}`:"")}
  d3.selectAll("#hSeg button").attr("aria-pressed",function(){return String(+this.dataset.v===cum)});
}
function hoverH(e){const[x]=d3.pointer(e,Hh.svg.node());const y=clamp(Math.floor(Hh.x.invert(x)),1850,LAST);const d=Hh.rows.find(r=>r.y===y);if(!d)return;
  const v=Hh.cum?d.c:d.a,xx=Hh.x(y+.5);Hh.hl.attr("x1",xx).attr("x2",xx).attr("y1",Hh.top).attr("y2",Hh.top+Hh.ch).attr("opacity",1);
  const E=v.F+v.U,dg=Hh.cum?0:1,row=(n,val,c)=>`<span style="color:${c}">■</span> ${n}: ${nf(val,dg)}`;
  Hh.tip.innerHTML=`<b>${Hh.cum?"1850–"+y:y}${y===LAST?" (projecció)":""}</b> · Gt de CO₂<br>${row("Fòssil i ciment",v.F,COL.ink)}<br>${row("Ús del sòl",v.U,COL.dry)}<br>${row("Atmosfera",v.A,COL.warm)}<br>${row("Oceà",v.O,COL.cold)}<br>${row("Terra",v.L,COL.bio)}<br><span style="color:${COL.muted}">Desquadrament: ${nf(v.B,dg)}</span>`;
  Hh.tip.style.opacity=1;const w=Hh.tip.offsetWidth,h=Hh.tip.offsetHeight;let tx=xx+14;if(tx+w>Hh.W)tx=xx-w-14;Hh.tip.style.transform=`translate(${clamp(tx,0,Hh.W-w)}px,${Hh.top+6}px)`}
document.querySelectorAll("#hSeg button").forEach(b=>b.addEventListener("click",()=>{Hh.cum=+b.dataset.v;Hh.tip.style.opacity=0;Hh.hl.attr("opacity",0);drawH(false)}));

/* =====================================================================
   6. PERSISTÈNCIA — resposta a un pols (Joos et al. 2013, taula 5)
   ===================================================================== */
const IRF={atm:[.2173,[.2240,.2824,.2763],[394.4,36.54,4.304]],oce:[60.29,[-26.48,-17.45,-16.35],[390.5,100.5,4.551]],lnd:[17.07,[332.1,-334.1,-15.09],[74.76,70.31,6.139]]};
const fit=(c,t)=>c[0]+c[1].reduce((s,a,i)=>s+a*Math.exp(-t/c[2][i]),0);
function partsAt(t){const a=100*fit(IRF.atm,t),o=clamp(fit(IRF.oce,t),0,100-a);return{a,o,l:Math.max(0,100-a-o)}}
const P={svg:d3.select("#pSvg"),t:100,rng:document.getElementById("pRng")};
const BANDS=[["Fotosíntesi i respiració a terra",1,100,COL.bio],["Dissolució a l'oceà",10,1000,COL.cold],["Reacció amb els carbonats del fons",1000,1e4,"#6F8FC0"],["Meteorització de les roques",1e4,1e6,COL.dry]];
function layoutP(){
  const wrap=document.getElementById("pWrap"),W=wrap.clientWidth;if(!W)return;const m=mob();
  const ml=m?34:44,mr=m?24:30,top=12,ch=m?200:260,bh=m?14:16,bg=m?20:22,H=top+ch+34+BANDS.length*bg+10;P.W=W;P.ml=ml;P.top=top;P.ch=ch;
  const svg=P.svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
  P.x=d3.scaleSymlog().constant(1).domain([0,1e6]).range([ml,W-mr]);P.y=d3.scaleLinear([0,100],[top+ch,top]);
  svg.append("g").attr("class","axis").attr("transform",`translate(${ml},0)`).call(d3.axisLeft(P.y).tickValues([0,25,50,75,100]).tickFormat(v=>v+"%").tickSize(-(W-ml-mr))).call(a=>{a.select(".domain").remove();a.selectAll("line").attr("stroke",COL.hair).attr("stroke-width",.6)});
  const tv=m?[0,1,10,100,1e3,1e4,1e5,1e6]:[0,1,10,100,1e3,1e4,1e5,1e6];
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${top+ch})`).call(d3.axisBottom(P.x).tickValues(tv).tickFormat(v=>m&&v>=1e4?(v>=1e6?"1 milió":(v/1e3)+" mil"):nf(v,0)).tickSize(4)).call(a=>a.select(".domain").remove());
  svg.append("text").attr("class","lbl m").attr("x",W-mr).attr("y",top+ch+30).attr("text-anchor","end").style("font-size",m?"10.5px":"11.5px").text("anys després de l'emissió");
  const ts=[];for(let t=0;t<=1000;t+=t<10?.25:t<100?1:5)ts.push(t);P.ts=ts;
  const pts=ts.map(t=>({t,...partsAt(t)}));
  const ar=(f0,f1,c)=>svg.append("path").datum(pts).attr("fill",c).attr("opacity",.9).attr("d",d3.area().x(d=>P.x(d.t)).y0(d=>P.y(f0(d))).y1(d=>P.y(f1(d))));
  ar(d=>0,d=>d.a,COL.warm);ar(d=>d.a,d=>d.a+d.o,COL.cold);ar(d=>d.a+d.o,d=>100,COL.bio);
  svg.append("path").datum(pts).attr("fill","none").attr("stroke",COL.ink).attr("stroke-width",1.4).attr("d",d3.line(d=>P.x(d.t),d=>P.y(d.a)));
  // end of model
  const x1k=P.x(1000);
  const pat=svg.append("defs").append("pattern").attr("id","pHatch").attr("width",7).attr("height",7).attr("patternUnits","userSpaceOnUse").attr("patternTransform","rotate(45)");
  pat.append("line").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",7).attr("stroke",COL.hair).attr("stroke-width",1.4);
  svg.append("rect").attr("x",x1k).attr("y",top).attr("width",W-mr-x1k).attr("height",ch).attr("fill","url(#pHatch)");
  const xm=(x1k+W-mr)/2;
  svg.append("text").attr("class","lbl b halo").attr("x",xm).attr("y",top+ch*.45).attr("text-anchor","middle").style("fill",COL.ink2).text("Fora del model");
  svg.append("text").attr("class","lbl halo").attr("x",xm).attr("y",top+ch*.45+(m?14:17)).attr("text-anchor","middle").style("fill",COL.ink2).text(m?"carbonats i roques":"carbonats i roques retiren la resta");
  svg.append("line").attr("x1",x1k).attr("x2",x1k).attr("y1",top).attr("y2",top+ch).attr("stroke",COL.ink).attr("stroke-dasharray","3 3").attr("stroke-width",.8);
  svg.append("text").attr("class","lbl m").attr("x",x1k+6).attr("y",top+14).text(m?"fi del model":"Aquí s'acaba el model");
  // area labels
  const lab=(t,yv,txt,col)=>svg.append("text").attr("class","lbl b").attr("x",P.x(t)).attr("y",P.y(yv)).attr("text-anchor","middle").style("fill",col).text(txt);
  const tl=m?450:300,pl=partsAt(tl);lab(tl,pl.a/2,"Aire","#fff");lab(tl,pl.a+pl.o/2,"Oceà","#fff");lab(tl,pl.a+pl.o+pl.l/2+(m?-1:0),"Terra","#fff");
  // key points
  [[20,"20 anys"],[100,"100 anys"]].forEach(([t,n])=>{const v=partsAt(t).a;svg.append("circle").attr("cx",P.x(t)).attr("cy",P.y(v)).attr("r",3).attr("fill",COL.ink)})
  // bands
  BANDS.forEach(([n,a,b,c],i)=>{const y=top+ch+38+i*bg;svg.append("rect").attr("x",P.x(a)).attr("width",P.x(b)-P.x(a)).attr("y",y).attr("height",bh*.55).attr("fill",c).attr("opacity",.75).attr("rx",2);
    const tx=P.x(a)+(P.x(b)-P.x(a))/2,anchor="middle";svg.append("text").attr("class","lbl").attr("x",clamp(tx,ml+60,W-mr-60)).attr("y",y-3).attr("text-anchor",anchor).style("font-size",m?"10.5px":"12px").text(n)});
  // marker
  P.mk=svg.append("line").attr("y1",top).attr("y2",top+ch).attr("stroke",COL.ink).attr("stroke-width",1.2);
  P.dot=svg.append("circle").attr("r",4.5).attr("fill",COL.ink).attr("stroke","#fff").attr("stroke-width",1.5);
  P.lb=svg.append("text").attr("class","lbl b halo");
  setP(P.t);
}
function setP(t){P.t=t;const p=partsAt(t),x=P.x(t);if(!P.mk)return;P.mk.attr("x1",x).attr("x2",x);P.dot.attr("cx",x).attr("cy",P.y(p.a));
  const right=x<P.W*.6;P.lb.attr("x",x+(right?8:-8)).attr("y",mob()?Math.min(P.top+P.ch-6,P.y(p.a)+18):Math.max(P.top+12,P.y(p.a)-10)).attr("text-anchor",right?"start":"end").text(`${Math.round(p.a)}% a l'aire`);
  const yrs=t===1?"1 any":t===0?"0 anys":`${nf(t,t<10&&t%1?1:0)} anys`;
  P.rng.setAttribute("aria-valuetext",`${yrs}: ${Math.round(p.a)}% a l'aire`);
  document.getElementById("pOut").innerHTML=`Al cap de <b>${yrs}</b>: a l'aire <b style="color:${COL.warm}">${Math.round(p.a)}%</b> · a l'oceà <b style="color:${COL.cold}">${Math.round(p.o)}%</b> · a la terra <b style="color:${COL.bio}">${Math.round(p.l)}%</b>`}
const tOf=v=>{if(v<=0)return 0;const t=Math.pow(10,v/100);return t<10?Math.round(t*2)/2:t<100?Math.round(t):Math.round(t/5)*5};
P.rng.addEventListener("input",()=>setP(tOf(+P.rng.value)));

/* =====================================================================
   wiring
   ===================================================================== */
const vis={};const io=new IntersectionObserver(es=>es.forEach(e=>{vis[e.target.id]=e.isIntersecting}),{rootMargin:"200px 0px"});
["aCv","bCv"].forEach(id=>io.observe(document.getElementById(id)));
function layoutAll(){[layoutA,layoutB,layoutK,layoutY,layoutH,layoutP].forEach(f=>safe(f))}
layoutAll();
IB.scrolly(document.getElementById("aSteps"),document.getElementById("aGraphic"),i=>safe(onStepA,i));
IB.scrolly(document.getElementById("bSteps"),document.getElementById("bGraphic"),i=>safe(onStepB,i));
let rz,lastW=document.documentElement.clientWidth,lastH=innerHeight;
addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{const w=document.documentElement.clientWidth;if(w===lastW&&Math.abs(innerHeight-lastH)<120&&mob())return;lastW=w;lastH=innerHeight;layoutAll()},160)});
if(document.fonts)document.fonts.ready.then(()=>layoutAll());
function frame(now){requestAnimationFrame(frame);if(vis.aCv)safe(drawA,now);else A.last=now;if(vis.bCv)safe(drawB,now);else B.last=now}
requestAnimationFrame(frame);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){A.last=B.last=performance.now()}});

/* reading time */
(()=>{const n=[...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")].filter(e=>!e.closest(".fn")).reduce((a,e)=>a+(e.textContent.match(/[\p{L}\p{N}·'’]+/gu)||[]).length,0);
 const figs=document.querySelectorAll("canvas,figure svg").length;let sec=n/218*60;for(let i=0;i<figs;i++)sec+=Math.max(3,12-i);
 const el=document.getElementById("rt");if(el)el.textContent=Math.max(1,Math.round(sec/60))+" min de lectura"})();
})();
