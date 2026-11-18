/* La gran migració de cada nit — gràfics.
   1. Tall de l'oceà de 24 h (scrolly, canvas)   2. Comparació de mida (SVG)
   3. Dades Malaspina per regions (SVG, d3)       4. Ecograma simulat (canvas)
   5. Bomba de carboni (scrolly, canvas)          6. Estimacions de carboni (SVG, d3) */
(function(){
"use strict";
const RM=!!(window.IB&&IB.reduced);
const $=id=>document.getElementById(id);
const C={ink:"#121212",ink2:"#4A4A4A",muted:"#7A7A7A",hair:"#DADADA",warm:"#C8442A",cold:"#2C5DA8",bio:"#4C8A2E",bioL:"#7DBE5A",mig:"#D9822B",migL:"#F0A852",res:"#8D99A6",snow:"#C9C3B8",poop:"#5A4A3A",deep:"#0E1B2C"};
const SSF='"Source Sans 3", "Helvetica Neue", Arial, sans-serif';
const D2R=Math.PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, sm=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const mob=()=>innerWidth<900;
const dprF=()=>Math.min(2,window.devicePixelRatio||1);
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const rgb=c=>`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
function ramp(st,v){if(v<=st[0][0])return st[0][1];for(let i=1;i<st.length;i++)if(v<=st[i][0]){const a=st[i-1],b=st[i],t=(v-a[0])/(b[0]-a[0]);return[lerp(a[1][0],b[1][0],t),lerp(a[1][1],b[1][1],t),lerp(a[1][2],b[1][2],t)]}return st[st.length-1][1]}
const fmt=(v,d)=>IB.fmt(v,d);
const hhmm=h=>{h=((h%24)+24)%24;let H=Math.floor(h),M=Math.round((h-H)*60);if(M===60){M=0;H=(H+1)%24}return String(H).padStart(2,"0")+":"+String(M).padStart(2,"0")};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const gauss=r=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
function fit(cv,w,h){const d=dprF();cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.height=h+"px";const c=cv.getContext("2d");c.setTransform(d,0,0,d,0,0);return c}
/* text with halo; o={al,fs,a,col,halo,bold} */
function txt(c,lines,x,y,o){o=o||{};const a=o.a==null?1:o.a;if(a<=.01)return;const fs=o.fs||12;c.save();c.globalAlpha=a;c.textAlign=o.al||"left";c.lineJoin="round";
  lines.forEach((l,i)=>{const s=typeof l==="string"?[l]:l;c.font=`${s[1]||o.bold?"600 ":""}${fs}px ${SSF}`;if(o.halo!==false){c.lineWidth=3.5;c.strokeStyle=o.halo||"rgba(255,255,255,.94)";c.strokeText(s[0],x,y+i*fs*1.3)}c.fillStyle=s[2]||o.col||C.ink;c.fillText(s[0],x,y+i*fs*1.3)});c.restore()}
function arrowV(c,x,y0,y1,col,lw){c.save();c.strokeStyle=col;c.lineWidth=lw||1.4;c.beginPath();c.moveTo(x,y0);c.lineTo(x,y1);c.stroke();const d=y1<y0?-1:1;c.beginPath();c.moveTo(x-5,y1-d*6);c.lineTo(x,y1);c.lineTo(x+5,y1-d*6);c.stroke();c.restore()}

/* visibility: animate only what is on screen */
const vis={};
const io=new IntersectionObserver(es=>es.forEach(e=>{vis[e.target.id]=e.isIntersecting}),{rootMargin:"250px 0px"});

/* ---------- light model (shared) ---------- */
// log10 of illuminance (lux) at the sea surface from the sun's elevation (degrees). Approximate:
// day 700 + 100000·sin(h); twilight interpolated in log: 0° ≈ 700 lx, −6° ≈ 3 lx, −12° ≈ 0.008 lx, −18° ≈ starlight 0.0008 lx.
const TW=[[-18,-3.1],[-12,-2.1],[-6,.48],[0,2.845]];
function lxSun(h){if(h>=0)return Math.log10(700+1e5*Math.sin(h*D2R));if(h<=-18)return -3.1;for(let i=1;i<TW.length;i++)if(h<=TW[i][0]){const a=TW[i-1],b=TW[i];return lerp(a[1],b[1],(h-a[0])/(b[0]-a[0]))}return 2.845}
const sunEl=(t,lat,dec)=>Math.asin(clamp(Math.sin(lat*D2R)*Math.sin(dec*D2R)+Math.cos(lat*D2R)*Math.cos(dec*D2R)*Math.cos((t-12)*15*D2R),-1,1))/D2R;
const addL=(a,b)=>Math.log10(Math.pow(10,a)+Math.pow(10,b));

/* =========================================================
   1. OCEAN CROSS-SECTION OVER 24 HOURS
   ========================================================= */
(function(){
const cv=$("ocean");if(!cv)return;io.observe(cv);
const graphic=$("ograph"),steps=$("osteps"),tEl=$("oTime"),sEl=$("oState"),rngEl=$("oRng"),outEl=$("oOut"),playB=$("oPlay");
let ctx,W=0,H=0,skyH=0,y0=0,ML=0,MR=0;const ZMAX=1100;
const yz=z=>y0+z/ZMAX*(H-y0-2);
// schedule (Bianchi & Mislan 2016): leave surface 21 min before sunrise, arrive 17 min after sunset; down 7.6 cm/s, up 6.5 cm/s
const SUNRISE=6,SUNSET=18,DEP=SUNRISE-21/60,ARR=SUNSET+17/60,VD=0.076*3600,VU=0.065*3600,DAYZ=450;
const KD=0.035*Math.LOG10E; // decades of light lost per metre
const surfL=t=>lxSun(sunEl(t,0,0));
const PREF=surfL(12)-KD*DAYZ; // light level at the layer at noon (the isolume shown in the last steps)
const r=rng(7);
let A=[],PH=[],stars=[];
function makeAnimals(){
  const n=mob()?560:1050;A=[];
  for(let i=0;i<n;i++){
    const q=r(),type=q<.42?0:q<.62?1:q<.84?2:q<.91?3:4;
    const mig=r()<.5;
    const dd=clamp(DAYZ+gauss(r)*55,320,640),nd=clamp(6+Math.pow(r(),1.5)*115,4,130);
    const tj=gauss(r)*.12;
    A.push({x:r(),type,mig,dd,nd,tj,rz:clamp(470+gauss(r)*110,330,820),w:r()*6.28,s:.7+r()*.6,z:null,xo:0});
  }
  PH=[];for(let i=0;i<(mob()?190:320);i++){PH.push({x:r(),z:clamp(18+Math.pow(r(),.8)*120+gauss(r)*8,3,160),w:r()*6.28})}
  stars=[];for(let i=0;i<40;i++)stars.push([r(),r()*.8,r()]);
}
function schedZ(a,t){ // depth of a migrant at time t (hours)
  const dist=a.dd-a.nd,durD=dist/VD,durU=dist/VU,dep=DEP+a.tj,arr=ARR+a.tj;
  if(t>=dep&&t<dep+durD)return a.nd+(t-dep)*VD;
  if(t>=dep+durD&&t<arr-durU)return a.dd;
  if(t>=arr-durU&&t<arr)return a.dd-(t-(arr-durU))*VU;
  return a.nd;
}
function layout(){
  W=cv.parentElement.clientWidth;if(W<10)return;const m=mob();
  H=Math.round(m?clamp(innerHeight*.31,190,300):clamp(innerHeight-250,380,780));H=Math.min(H,Math.round(W*(m?1.05:1)));
  skyH=Math.max(30,Math.round(H*.1));y0=skyH;ML=m?30:40;MR=m?6:10;ctx=fit(cv,W,H);
}
/* state */
// range steps loop through a stretch of the day; with reduced motion they show one fixed hour (rm) instead
const OS=[{t:12},{t:12,types:1},{t:12,pred:1},{range:[15.4,19.4],rm:17.3,arUp:1},{t:23,feed:1},{range:[4.5,8.2],rm:6.2,arDn:1},{t:23,res:1},{range:[10.5,19.6],rm:17,iso:1},{play:1}];
const S={t:12,step:0,mode:"static",target:12,from:0,to:0,hold:0,user:false,f:{types:0,pred:0,res:0,iso:0,feed:0,arUp:0,arDn:0}};
function goStep(i){
  const s=OS[i];S.step=i;S.user=false;
  if(s.range){if(RM){S.mode="static";S.t=S.target=s.rm}else{S.mode="range";S.from=s.range[0];S.to=s.range[1];S.t=S.from;S.hold=0}}
  else if(s.play){S.mode=RM?"static":"play";S.target=S.t}
  else{S.mode="static";S.target=s.t;if(RM)S.t=s.t}
  playB.textContent=S.mode==="play"?"Pausa":"Reprodueix";
}
rngEl.addEventListener("input",()=>{S.user=true;S.mode="static";S.t=S.target=+rngEl.value;playB.textContent="Reprodueix"});
playB.addEventListener("click",()=>{S.user=true;if(S.mode==="play"){S.mode="static";S.target=S.t;playB.textContent="Reprodueix"}else{S.mode="play";playB.textContent="Pausa"}});
const phaseName=t=>t>=5&&t<7.2?"Alba":t>=7.2&&t<11?"Matí":t>=11&&t<13?"Migdia":t>=13&&t<16.5?"Tarda":t>=16.5&&t<19.5?"Capvespre":"Nit";

/* drawing helpers */
const WATER=[[0,hx("#0A1422")],[.18,hx("#11223A")],[.36,hx("#1C3A60")],[.55,hx("#356592")],[.75,hx("#7FA7D0")],[1,hx("#DDE9F5")]];
const vAt=(L)=>clamp((L+4.5)/9.5,0,1);
const SKY=[[-18,hx("#141D2B")],[-8,hx("#2A3550")],[-2,hx("#E3A48A")],[2,hx("#EFC9AE")],[9,hx("#DCE7F2")],[90,hx("#D5E4F2")]];
function glyph(c,x,y,s,type){
  if(type===0){c.beginPath();c.arc(x,y,1.25*s,0,6.283);c.fill();if(s>1.4){c.lineWidth=.7;c.beginPath();c.moveTo(x-1*s,y-.6*s);c.lineTo(x-3.4*s,y-2.2*s);c.moveTo(x+1*s,y-.6*s);c.lineTo(x+3.4*s,y-2.2*s);c.stroke()}}
  else if(type===1){c.lineWidth=1.1*Math.max(1,s*.8);c.beginPath();c.moveTo(x-2.4*s,y+.4*s);c.quadraticCurveTo(x,y-1*s,x+2.4*s,y+.2*s);c.stroke()}
  else if(type===2){c.beginPath();c.ellipse(x,y,3.1*s,1.15*s,0,0,6.283);c.fill();c.beginPath();c.moveTo(x-2.7*s,y);c.lineTo(x-4.6*s,y-1.3*s);c.lineTo(x-4.6*s,y+1.3*s);c.closePath();c.fill()}
  else if(type===3){c.beginPath();c.moveTo(x-3*s,y);c.lineTo(x+1.4*s,y-1.2*s);c.lineTo(x+1.4*s,y+1.2*s);c.closePath();c.fill();c.lineWidth=.6;c.beginPath();c.moveTo(x+1.4*s,y);c.lineTo(x+3.6*s,y-.6*s);c.moveTo(x+1.4*s,y+.4*s);c.lineTo(x+3.6*s,y+.9*s);c.stroke()}
  else{c.lineWidth=.8;c.beginPath();c.arc(x,y,2*s,Math.PI,0);c.closePath();c.stroke();c.beginPath();c.moveTo(x-1*s,y);c.lineTo(x-1.2*s,y+2.6*s);c.moveTo(x+1*s,y);c.lineTo(x+1.2*s,y+2.6*s);c.stroke()}
}
function tuna(c,x,y,s,dir){c.save();c.translate(x,y);c.scale(dir*s,s);c.beginPath();c.moveTo(12,0);c.bezierCurveTo(6,-4.6,-6,-4.4,-10,-.6);c.lineTo(-15,-4.6);c.lineTo(-13.4,0);c.lineTo(-15,4.6);c.lineTo(-10,.6);c.bezierCurveTo(-6,4.4,6,4.6,12,0);c.fill();c.restore()}

let last=performance.now(),T0=last,meanZ=DAYZ;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;if(!W){layout();return}if(vis.ocean===false)return;const tt=RM?0:(now-T0)/1000;try{tick(dt,tt);draw(tt)}catch(e){console.error(e)}}
function tick(dt,tt){
  if(S.mode==="range"){if(S.hold>0){S.hold-=dt;if(S.hold<=0)S.t=S.from}else{S.t+=dt*(RM?2.4:.85);if(S.t>=S.to){S.t=S.to;S.hold=1.4}}}
  else if(S.mode==="play"){S.t=(S.t+dt*1.15)%24}
  else{let d=S.target-S.t;S.t+=d*Math.min(1,RM?1:dt*3.2);if(Math.abs(d)<.005)S.t=S.target}
  const st=OS[S.step]||{};const k=RM?1:Math.min(1,dt*3);for(const n in S.f)S.f[n]+=((st[n]&&!S.user?1:0)-S.f[n])*k;
  let sum=0,cnt=0;const ez=RM?1:Math.min(1,dt*(S.mode==="static"&&Math.abs(S.target-S.t)>.02?5:9));
  for(const a of A){const tz=a.mig?schedZ(a,S.t):a.rz;if(a.z==null)a.z=tz;a.z+=(tz-a.z)*ez;if(a.mig){sum+=a.z;cnt++}}
  meanZ=cnt?sum/cnt:0;
  if(!S.user||S.mode!=="static"){rngEl.value=S.t.toFixed(2)}
  const ts=hhmm(S.t);if(tEl.textContent!==ts){tEl.textContent=ts;outEl.textContent=ts;rngEl.setAttribute("aria-valuetext",ts)}
  const st2=`${phaseName(S.t)} · la capa que migra és a ${Math.round(meanZ/10)*10} m`;if(sEl.textContent!==st2)sEl.textContent=st2;
}
function draw(tt){
  const c=ctx,m=mob(),fs=m?10.5:12,t=S.t,el=sunEl(t,0,0),Ls=surfL(t);
  c.clearRect(0,0,W,H);
  // sky
  const gs=c.createLinearGradient(0,0,0,skyH);gs.addColorStop(0,rgb(ramp(SKY,el<0?el-5:el+4)));gs.addColorStop(1,rgb(ramp(SKY,el<0?el+1:el-3)));c.fillStyle=gs;c.fillRect(0,0,W,skyH);
  if(el<-6){c.fillStyle="#fff";for(const s of stars){c.globalAlpha=clamp((-el-6)/8,0,1)*(.35+.5*s[2]);c.fillRect(s[0]*W,s[1]*skyH,1.2,1.2)}c.globalAlpha=1}
  if(el>-4){const xs=ML+(t-6)/12*(W-ML-MR-20)+10,ys=skyH-4-Math.max(0,Math.sin(el*D2R))*(skyH-14);const yy=ys+(el<0?-el*1.5:0),rs=m?7:10;c.save();c.beginPath();c.rect(0,0,W,skyH);c.clip();if(el<15){const gl=c.createRadialGradient(xs,yy,rs*.6,xs,yy,rs*3.4);gl.addColorStop(0,"rgba(246,196,140,.55)");gl.addColorStop(1,"rgba(246,196,140,0)");c.fillStyle=gl;c.globalAlpha=clamp((15-el)/10,0,1);c.fillRect(xs-rs*4,yy-rs*4,rs*8,rs*8)}c.fillStyle=C.warm;c.globalAlpha=.92;c.beginPath();c.arc(xs,yy,rs,0,6.283);c.fill();c.restore()}
  // water: light fading with depth
  const g=c.createLinearGradient(0,y0,0,H);for(let i=0;i<=11;i++){const z=i*100;g.addColorStop(z/ZMAX,rgb(ramp(WATER,vAt(Ls-KD*z))))}
  c.fillStyle=g;c.fillRect(0,y0,W,H-y0);
  c.fillStyle=rgb(ramp(WATER,vAt(Ls)));c.fillRect(0,y0-1,W,1.5);
  // zones and depth scale
  const lab=z=>vAt(Ls-KD*z)>.6;
  c.save();c.setLineDash([2,4]);c.lineWidth=.8;[200,1000].forEach(z=>{c.strokeStyle=lab(z)?"rgba(18,18,18,.4)":"rgba(255,255,255,.35)";c.beginPath();c.moveTo(ML,yz(z));c.lineTo(W,yz(z));c.stroke()});c.restore();
  for(let z=0;z<=1000;z+=200){const y=yz(z),dk=lab(z+10);c.fillStyle=dk?C.ink2:"rgba(255,255,255,.75)";c.fillRect(ML-5,y,4,1);txt(c,[z===0?"0 m":String(z)],ML-8,y+(z===0?fs*.9:4),{al:"right",fs:fs-1,col:dk?C.ink2:"rgba(255,255,255,.8)",halo:false})}
  const zf=1-.85*Math.max(S.f.arUp,S.f.arDn);
  const zl=(s,z,a)=>{const dk=lab(z);txt(c,[[s,1]],W-MR-2,yz(z),{al:"right",fs:fs,col:dk?"rgba(18,18,18,.6)":"rgba(255,255,255,.72)",halo:dk?"rgba(255,255,255,.55)":"rgba(10,20,34,.6)",a:a==null?1:a})};
  zl("Zona il·luminada",m?120:100,zf);zl("Zona crepuscular",m?560:600,zf);if(!m||H>300)zl("Zona fosca",1070);
  // phytoplankton
  c.fillStyle=C.bioL;const fe=S.f.feed;for(const p of PH){const x=ML+p.x*(W-ML-MR)+Math.sin(tt*.2+p.w)*3,y=yz(p.z+Math.sin(tt*.3+p.w)*2);c.globalAlpha=.55+.35*fe;c.fillRect(x,y,1.6,1.6)}c.globalAlpha=1;
  // isolume
  if(S.f.iso>.01){const zi=(Ls-PREF)/KD,y=yz(clamp(zi,0,ZMAX));c.save();c.globalAlpha=S.f.iso;c.strokeStyle="#F2C29C";c.lineWidth=1.8;c.setLineDash([6,5]);c.lineDashOffset=RM?0:-tt*10;c.beginPath();c.moveTo(ML,y);c.lineTo(W-MR,y);c.stroke();c.restore();
    txt(c,[["Isoluma: la llum de la capa a migdia",1]],ML+8,zi<20?y+fs+6:y-7,{fs,col:"#F6D3B5",halo:"rgba(10,20,34,.7)",a:S.f.iso})}
  // predators (visual hunters near the surface)
  if(S.f.pred>.01){c.save();c.globalAlpha=S.f.pred*.85;c.fillStyle="#22303F";const sc=m?.8:1.05;[[.0,35,1],[.37,70,1],[.7,48,-1]].forEach(([o,z,d],i)=>{const u=((tt*.025*(i+2)+o)%1+1)%1,x=d>0?ML+u*(W-ML-MR):W-MR-u*(W-ML-MR);tuna(c,x,yz(z),sc,d)});c.restore();
    txt(c,[["Depredadors que",1],["cacen amb la vista",1]],ML+10,yz(130),{fs,a:S.f.pred,col:C.ink})}
  // animals
  const big=1+S.f.types*1.2,rs=S.f.res;
  for(const a of A){const x=ML+6+a.x*(W-ML-MR-12)+Math.sin(tt*.25*a.s+a.w)*5,y=yz(a.z+Math.sin(tt*.6*a.s+a.w)*4);
    const col=a.mig?C.migL:C.res;c.fillStyle=col;c.strokeStyle=col;c.globalAlpha=a.mig?(.9-rs*.35):(.55+rs*.45);glyph(c,x,y,(m?.85:1)*big*(a.mig?1:.9),a.type)}
  c.globalAlpha=1;
  // annotations
  const st=S.step,lx=ML+8;
  if(st===0&&!S.user){const y=yz(meanZ);txt(c,[["La capa d'animals",1],["de dia, a uns 450 m"]],lx,y-58,{fs:fs+1,col:"#fff",halo:"rgba(10,20,34,.6)"});c.strokeStyle="rgba(255,255,255,.7)";c.lineWidth=1;c.beginPath();c.moveTo(lx+20,y-38);c.lineTo(lx+40,y-14);c.stroke()}
  if(S.f.types>.02){const K=[[0,"Copèpodes"],[1,"Krill"],[2,"Peixos llanterna"],[3,"Calamars"],[4,"Meduses i sifonòfors"]];
    const cols=m?2:1,rows=Math.ceil(K.length/cols),colW=m?Math.min(150,(W-ML-MR-24)/2):150,rowH=fs+(m?7:9),bh=rows*rowH+10,bw=cols*colW+6,bx=ML+14,top=m?H-6-bh:Math.min(yz(835),H-6-bh);
    c.save();c.globalAlpha=S.f.types;c.fillStyle=m?"rgba(10,20,34,.72)":"rgba(10,20,34,.6)";c.fillRect(bx-8,top,bw,bh);
    K.forEach(([tp,n],i)=>{const col=Math.floor(i/rows),row=i%rows,x=bx+col*colW,y=top+rowH-1+row*rowH;c.fillStyle=C.migL;c.strokeStyle=C.migL;glyph(c,x+6,y-3,m?1.6:1.9,tp);txt(c,[n],x+20,y+1,{fs,col:"#fff",halo:false})});c.restore()}
  if(S.f.arUp>.02){const x=W*.5,yb=yz(meanZ)+14,ya=Math.max(yz(5),yb-90);c.save();c.globalAlpha=S.f.arUp;if(meanZ>40&&meanZ<440)arrowV(c,x,yb+40,yb-6,"#fff",1.5);c.restore();
    txt(c,[["Puja a 6,5 cm/s",1],["≈ 230 m per hora"]],x+14,yz(clamp(meanZ,60,440))+4,{fs,col:"#fff",halo:"rgba(10,20,34,.6)",a:S.f.arUp*(meanZ>40&&meanZ<440?1:.35)})}
  if(S.f.arDn>.02){const x=W*.5,yb=yz(meanZ);c.save();c.globalAlpha=S.f.arDn;if(meanZ>40&&meanZ<440)arrowV(c,x,yb-40,yb+6,"#fff",1.5);c.restore();
    txt(c,[["Baixa a 7,6 cm/s",1],["≈ 270 m per hora"]],x+14,yz(clamp(meanZ,60,440))+4,{fs,col:"#fff",halo:"rgba(10,20,34,.6)",a:S.f.arDn*(meanZ>40&&meanZ<440?1:.35)})}
  if(S.f.feed>.02){txt(c,[["Fitoplàncton i migradors,",1,C.bioL],["junts a la foscor",1,C.bioL]],lx,yz(165),{fs,a:S.f.feed,col:"#fff",halo:"rgba(10,20,34,.7)"})}
  if(S.f.res>.02){txt(c,[["Es queden a baix",1]],lx,yz(315),{fs:fs+1,col:"#C9D2DC",halo:"rgba(10,20,34,.7)",a:S.f.res});txt(c,[["Migren cada nit",1]],lx,yz(175),{fs:fs+1,col:C.migL,halo:"rgba(10,20,34,.7)",a:S.f.res})}
}
let started=false;
function init(){makeAnimals();layout();if(!started){started=true;IB.scrolly(steps,graphic,i=>goStep(i));requestAnimationFrame(frame)}}
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{const n=mob()?560:1050;if(A.length!==n)makeAnimals();layout()},150)});
init();
if(document.fonts)document.fonts.ready.then(layout);
})();

/* =========================================================
   2. SIZE COMPARISON
   ========================================================= */
(function(){
const sc=$("szCop"),sh=$("szHum"),out=$("szOut"),rg=$("szRng"),val=$("szVal");if(!sc)return;
const fig=$("sizefig");io.observe(fig);
const BODY=.005,DIST=500,RATIO=DIST/BODY,MAR=42.195;
const BCN=[41.3874,2.1686];
const CITIES=[["Girona",41.9794,2.8214],["Lleida",41.6176,.62],["Perpinyà",42.6887,2.8948],["Tolosa",43.6047,1.4442]];
function hav(a,b){const R=6371,dl=(b[0]-a[0])*D2R,dn=(b[1]-a[1])*D2R,s=Math.sin(dl/2)**2+Math.cos(a[0]*D2R)*Math.cos(b[0]*D2R)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(s))}
const CD=CITIES.map(([n,la,lo])=>({n,d:hav(BCN,[la,lo])}));
const NS="http://www.w3.org/2000/svg";
const el=(p,n,a)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
let ph=0,cop,trail,hum,hbar,CH=0,HW=0,KMAX=230,hx0=0,hx1=0;
function build(){
  const m=mob();sc.innerHTML="";sh.innerHTML="";
  const cw=sc.parentElement.clientWidth;CH=m?190:330;sc.setAttribute("viewBox",`0 0 ${cw} ${CH}`);sc.style.height=CH+"px";
  const top=14,bot=CH-16,colX=m?cw*.18:cw*.3,colW=m?44:56;
  const gd=el(sc,"defs",{});const lg=el(gd,"linearGradient",{id:"szg",x1:0,y1:0,x2:0,y2:1});el(lg,"stop",{offset:0,"stop-color":"#8DB2D8"});el(lg,"stop",{offset:1,"stop-color":"#0E1B2C"});
  el(sc,"rect",{x:colX,y:top,width:colW,height:bot-top,fill:"url(#szg)"});
  [["Superfície",top],["500 m",bot]].forEach(([s,y],i)=>{const t=el(sc,"text",{x:colX+colW+8,y:y+(i?0:9),"font-size":12,fill:C.ink2});t.textContent=s});
  const px=(bot-top)/RATIO;const note=el(sc,"text",{x:colX+colW+8,y:(top+bot)/2-6,"font-size":11.5,fill:C.muted});
  const ns=Math.round(1/px);note.innerHTML=`<tspan x="${colX+colW+8}" dy="0">A aquesta escala, el</tspan><tspan x="${colX+colW+8}" dy="14">copèpode seria ${fmt(ns)}</tspan><tspan x="${colX+colW+8}" dy="14">vegades més petit</tspan><tspan x="${colX+colW+8}" dy="14">que un píxel</tspan>`;
  if(m)note.setAttribute("display","none");
  trail=el(sc,"line",{x1:colX+colW/2,x2:colX+colW/2,y1:bot,y2:bot,stroke:C.migL,"stroke-width":2,"stroke-linecap":"round"});
  cop=el(sc,"circle",{cx:colX+colW/2,cy:bot,r:4.5,fill:C.mig,stroke:"#fff","stroke-width":1.5});
  sc._g={top,bot};
  // human track
  HW=sh.parentElement.clientWidth;const hh=m?120:132;sh.setAttribute("viewBox",`0 0 ${HW} ${hh}`);sh.style.height=hh+"px";
  hx0=8;hx1=HW-14;const ty=56;const X=k=>hx0+k/KMAX*(hx1-hx0);sh._X=X;
  el(sh,"line",{x1:hx0,x2:hx1,y1:ty,y2:ty,stroke:C.hair,"stroke-width":6,"stroke-linecap":"round"});
  hbar=el(sh,"line",{x1:hx0,x2:hx0,y1:ty,y2:ty,stroke:C.migL,"stroke-width":6,"stroke-linecap":"round"});
  for(let i=1;i*MAR<KMAX;i++){const x=X(i*MAR);el(sh,"line",{x1:x,x2:x,y1:ty-9,y2:ty+9,stroke:C.ink,"stroke-width":1});const t=el(sh,"text",{x,y:ty-14,"font-size":11,"text-anchor":"middle",fill:C.ink2});t.textContent=(m?"":"marató ")+i}
  CD.forEach((cd,i)=>{if(cd.d>KMAX)return;const x=X(cd.d);el(sh,"line",{x1:x,x2:x,y1:ty+5,y2:ty+18+(i%2)*14,stroke:C.muted,"stroke-width":.8});const t=el(sh,"text",{x,y:ty+29+(i%2)*14,"font-size":11,"text-anchor":"middle",fill:C.muted});t.textContent=cd.n+(m?"":" "+fmt(cd.d)+" km")});
  const t0=el(sh,"text",{x:hx0,y:ty+29+28,"font-size":11,fill:C.muted});t0.textContent="Barcelona";
  const ax=el(sh,"text",{x:hx1,y:hh-2,"font-size":11,"text-anchor":"end",fill:C.muted});ax.textContent=`${KMAX} km`;
  hum=el(sh,"circle",{cx:hx0,cy:ty,r:6,fill:C.mig,stroke:"#fff","stroke-width":2});
  sh._ty=ty;update();
}
function update(){
  const h=+rg.value,km=h*RATIO/1000,mar=km/MAR;val.textContent=fmt(h,2)+" m";rg.setAttribute("aria-valuetext",fmt(h,2)+" m");
  const n=Math.floor(mar),fr=mar-n;const mw=fr<.15?(n===1?"una marató":`${n} maratons`):fr>.85?`gairebé ${n+1} maratons`:(n===1?"més d'una marató":`més de ${n} maratons`);
  const near=CD.filter(c=>c.d<=km*1.04).sort((a,b)=>b.d-a.d)[0];
  out.innerHTML=`Com si caminessis <b>${fmt(km)} km</b> abans de sopar (${mw})${near?`, més que de Barcelona a ${near.n} en línia recta`:""}. I abans d'esmorzar, tornar.`;
  sh._km=km;
}
rg.addEventListener("input",update);
let lastT=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-lastT)/1000);lastT=now;if(!cop||vis.sizefig===false)return;
  ph=(ph+dt*(RM?0:.16))%2;let u=ph<1?sm(ph*1.15):1-sm((ph-1)*1.15);if(RM)u=1;
  const g=sc._g,y=lerp(g.bot,g.top,u);cop.setAttribute("cy",y);trail.setAttribute("y2",y);trail.setAttribute("y1",ph<1?g.bot:g.top);if(ph>=1)trail.setAttribute("y2",y);
  const X=sh._X,x=X(Math.min(sh._km,KMAX)*u);hum.setAttribute("cx",x);hbar.setAttribute("x2",X(Math.min(sh._km,KMAX)*(ph<1?u:1)));if(ph>=1)hbar.setAttribute("x1",x);else hbar.setAttribute("x1",hx0);}
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(build,150)});
build();requestAnimationFrame(frame);
})();

/* =========================================================
   3. MALASPINA DATA BY REGION (Klevjer et al. 2016, Table 1)
   ========================================================= */
(function(){
const svg=d3.select("#reg");if(svg.empty())return;const wrap=$("regwrap"),tip=$("regTip"),fig=$("regfig");io.observe(fig);
const D=[
 {n:"Pacífic oriental",d:348,ni:97,a:251,p:.91,k:12},
 {n:"Altres zones",d:478,ni:331,a:146,p:.35,k:36},
 {n:"Atlàntic nord",d:484,ni:319,a:165,p:.38,k:23},
 {n:"Pacífic occidental",d:520,ni:259,a:261,p:.62,k:22},
 {n:"Sud de l'Índic",d:591,ni:470,a:120,p:.20,k:12},
 {n:"Totes les zones",d:486,ni:303,a:183,p:.46,k:105,all:1}];
let mode="day",playing=null;
const btns=[...document.querySelectorAll("#regSeg button[data-v]")],playB=$("regPlay");
function setMode(v,anim){mode=v;btns.forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===v));move(anim!==false)}
btns.forEach(b=>b.addEventListener("click",()=>{stopPlay();setMode(b.dataset.v)}));
function stopPlay(){if(playing){clearInterval(playing);playing=null;playB.textContent="Reprodueix"}}
function startPlay(){stopPlay();let n=0;playB.textContent="Pausa";setMode(mode==="day"?"night":"day");playing=setInterval(()=>{n++;setMode(mode==="day"?"night":"day");if(n>=5)stopPlay()},1900)}
playB.addEventListener("click",()=>playing?stopPlay():startPlay());
let y,X,bw,marks,labs;
function build(){
  const m=mob(),W=wrap.clientWidth,H=m?400:460,mt=26,mb=m?92:84,ml=m?34:46,mr=6;
  svg.attr("viewBox",`0 0 ${W} ${H}`).style("height",H+"px");svg.selectAll("*").remove();
  y=d3.scaleLinear().domain([0,700]).range([mt,H-mb]);
  const gap=m?10:26;const cols=D.length;bw=(W-ml-mr-gap)/cols;X=i=>ml+i*bw+(D[i].all?gap:0)+bw/2;
  // Bianchi range band
  svg.append("rect").attr("x",ml).attr("width",W-ml-mr).attr("y",y(200)).attr("height",y(650)-y(200)).attr("fill","#F1F0EC");
  svg.append("text").attr("x",W-mr-4).attr("y",y(650)-6).attr("text-anchor","end").attr("font-size",m?10.5:11.5).attr("fill",C.muted).text(m?"200–650 m: interval mundial de dia":"Interval mundial de fondàries de dia: 200–650 m (Bianchi et al., 2013)");
  // axis
  [0,100,200,300,400,500,600,700].forEach(z=>{svg.append("line").attr("x1",ml).attr("x2",W-mr).attr("y1",y(z)).attr("y2",y(z)).attr("stroke",z===0?C.cold:C.hair).attr("stroke-width",z===0?1.4:.6);
    svg.append("text").attr("x",ml-6).attr("y",y(z)+4).attr("text-anchor","end").attr("font-size",m?10.5:11.5).attr("fill",C.muted).text(z===0?"0 m":z)});
  svg.append("text").attr("x",ml+4).attr("y",y(0)-7).attr("font-size",m?10.5:12).attr("fill",C.cold).attr("font-weight",600).text("Superfície");
  svg.append("line").attr("x1",X(5)-bw/2-gap/2).attr("x2",X(5)-bw/2-gap/2).attr("y1",y(0)).attr("y2",H-8).attr("stroke",C.hair);
  const g=svg.selectAll("g.col").data(D).join("g").attr("class","col");
  g.append("line").attr("x1",(d,i)=>X(i)).attr("x2",(d,i)=>X(i)).attr("y1",d=>y(d.ni)).attr("y2",d=>y(d.d)).attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","2 3");
  g.append("circle").attr("cx",(d,i)=>X(i)).attr("cy",d=>y(d.d)).attr("r",4).attr("fill",C.ink);
  g.append("circle").attr("cx",(d,i)=>X(i)).attr("cy",d=>y(d.ni)).attr("r",4).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.2);
  marks=g.append("circle").attr("cx",(d,i)=>X(i)).attr("cy",d=>y(mode==="day"?d.d:d.ni)).attr("r",m?8:10).attr("fill",C.mig).attr("fill-opacity",.85).attr("stroke","#fff").attr("stroke-width",1.5);
  labs=g.append("text").attr("x",(d,i)=>X(i)+(m?11:14)).attr("y",d=>y(mode==="day"?d.d:d.ni)+4).attr("font-size",m?10.5:12.5).attr("font-weight",600).attr("fill",C.ink).text(d=>(mode==="day"?d.d:d.ni)+(m?"":" m")).style("paint-order","stroke").attr("stroke","#fff").attr("stroke-width",3);
  // names + migrating proportion bar
  const by=H-mb+16;
  g.each(function(d,i){const gg=d3.select(this),x=X(i),w=Math.min(bw-10,m?50:96);
    const t=gg.append("text").attr("x",x).attr("y",by).attr("text-anchor","middle").attr("font-size",m?10.5:12.5).attr("font-weight",d.all?700:600).attr("fill",C.ink);
    const parts=d.n.split(" ");if(parts.length>1){t.append("tspan").attr("x",x).attr("dy",0).text(parts[0]);t.append("tspan").attr("x",x).attr("dy",m?12:14).text(parts.slice(1).join(" "))}else t.text(d.n);
    const yb=by+(m?24:30);gg.append("rect").attr("x",x-w/2).attr("y",yb).attr("width",w).attr("height",5).attr("fill",C.hair);
    gg.append("rect").attr("class","pb").attr("x",x-w/2).attr("y",yb).attr("width",0).attr("height",5).attr("fill",C.mig).attr("data-w",w*d.p);
    gg.append("text").attr("x",x).attr("y",yb+(m?17:19)).attr("text-anchor","middle").attr("font-size",m?10.5:12).attr("fill",C.ink2).text(Math.round(d.p*100)+(m?"%":"% migra"));
  });
  if(!m){svg.append("text").attr("x",X(0)+16).attr("y",y(160)).attr("font-size",12).attr("fill",C.ink2).call(t=>{t.append("tspan").attr("x",X(0)+16).text("Poc oxigen a fondària:");t.append("tspan").attr("x",X(0)+16).attr("dy",15).text("es queda més amunt,");t.append("tspan").attr("x",X(0)+16).attr("dy",15).text("però en puja gairebé tota")})}
  svg.append("text").attr("x",ml).attr("y",H-2).attr("font-size",m?10.5:11.5).attr("fill",C.muted).text("Proporció del senyal de la zona crepuscular que migra");
  // legend
  const lg=svg.append("g").attr("transform",`translate(${m?ml+70:ml+96},${y(0)-8})`).attr("font-size",m?10.5:11.5).attr("fill",C.ink2);
  lg.append("circle").attr("cx",0).attr("cy",-4).attr("r",3.5).attr("fill",C.ink);lg.append("text").attr("x",7).attr("y",0).text("de dia");
  lg.append("circle").attr("cx",m?52:60).attr("cy",-4).attr("r",3.5).attr("fill","#fff").attr("stroke",C.ink);lg.append("text").attr("x",m?59:67).attr("y",0).text("de nit");
  // hover targets
  g.append("rect").attr("x",(d,i)=>X(i)-bw/2).attr("width",bw).attr("y",0).attr("height",H).attr("fill","transparent").attr("tabindex",0).style("cursor","default")
   .on("pointerenter pointermove pointerdown focus",(e,d)=>{const i=D.indexOf(d);tip.innerHTML=`<b>${d.n}</b><br>De dia: ${d.d} m · de nit: ${d.ni} m<br>Amplitud: ${d.a} m · migra el ${Math.round(d.p*100)}%<br><span style="color:${C.muted}">${d.k} parells de mesures</span>`;tip.style.opacity=1;const tw=tip.offsetWidth;let x=X(i)+14;if(x+tw>W)x=X(i)-tw-14;tip.style.transform=`translate(${Math.max(0,x)}px,${y(Math.min(d.ni,d.d))-10}px)`})
   .on("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0}).on("blur",()=>{tip.style.opacity=0});
  grown=false;if(vis.regfig)grow();
}
let grown=false;function grow(){if(grown)return;grown=true;svg.selectAll("rect.pb").transition().duration(RM?0:1200).delay((d,i)=>i*90).attr("width",function(){return this.getAttribute("data-w")})}
// the number counts along with the moving dot, so label and position always agree
function move(anim){const dur=anim&&!RM?1100:0,suf=mob()?"":" m";marks.transition().duration(dur).ease(d3.easeCubicInOut).attr("cy",d=>y(mode==="day"?d.d:d.ni));
  labs.transition().duration(dur).ease(d3.easeCubicInOut).attr("y",d=>y(mode==="day"?d.d:d.ni)+4).tween("text",function(d){const el=this,a=parseInt(el.textContent,10),b=mode==="day"?d.d:d.ni,f=d3.interpolateNumber(isNaN(a)?b:a,b);return t=>{el.textContent=Math.round(f(t))+suf}})}
document.addEventListener("pointerdown",e=>{if(!wrap.contains(e.target))tip.style.opacity=0});
let auto=false;new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){grow();if(!auto&&!RM){auto=true;setTimeout(startPlay,900)}}}),{threshold:.5}).observe(fig);
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(build,150)});
build();
})();

/* =========================================================
   4. SIMULATED ECHOGRAM
   ========================================================= */
(function(){
const cv=$("echo");if(!cv)return;io.observe(cv);
const tip=$("echoTip"),note=$("echoNote"),btns=[...document.querySelectorAll("#echoSeg button")],replay=$("echoPlay");
const PRE={
 nova:{lat:0,dec:0,K:.035,day:450,hours:72,t0:12,moon:0,zMax:620,res:540,mf:.5,
   note:"Sense lluna, la nit és fosca del tot: la capa puja fins a la superfície i, de dia, baixa a uns 450 metres. A sota, la part que no migra."},
 plena:{lat:0,dec:0,K:.035,day:450,hours:72,t0:12,moon:1,zMax:620,res:540,mf:.5,
   note:"Amb lluna plena, la penombra que busquen els animals ja no arriba a la superfície. En aquest model, la capa passa la nit unes desenes de metres més avall i només s'acosta a la superfície quan la lluna és baixa, poc després de sortir o abans de pondre's."},
 nuvols:{lat:50,dec:20,K:.05,day:300,hours:48,t0:0,moon:0,clouds:1,zMax:440,res:380,mf:.5,
   note:"Latitud 50° N, a l'estiu. Primer, un dia clar. L'endemà, cada vegada que un núvol tapa el sol, la penombra puja uns metres i la capa la segueix. Quan el sol torna, baixa."},
 polar:{lat:79,dec:-23.4,K:.06,day:0,pref:-2.5,hours:144,t0:0,moon:2,zMax:200,res:0,mf:.85,
   note:"Svalbard, 79° N, al desembre: el sol no surt en tot el dia. La lluna plena no es pon i marca el ritme. Cada cicle dura 24,8 hores, i per això la pujada arriba cada dia una mica més tard que les marques de les 24 hores."}
};
let P="nova",DATA=null,W=0,H=0,ctx,plot={},img=null,rev=1,revT=0;
function moonL(p,t){ // log10 lux from the moon (0 if below horizon / new moon)
  if(!p.moon)return -9;
  let dec=0,illum=1,tr=0;
  tr=(24-p.t0)%24; // the full moon crosses the meridian around local midnight
  if(p.moon===2){dec=23;const tFull=p.hours/2;illum=.5*(1+Math.cos(2*Math.PI*(t-tFull)/708.7))}
  const H=(t-tr)*360/24.84;const s=Math.sin(p.lat*D2R)*Math.sin(dec*D2R)+Math.cos(p.lat*D2R)*Math.cos(dec*D2R)*Math.cos(H*D2R);
  if(s<=0)return -9;return Math.log10(.25*s*Math.pow(illum,3))}
function clouds(t){ // fraction of sunlight passing through clouds (second day only)
  if(t<24)return 1;const r=rng(11);let f=1;for(let k=0;k<26;k++){const c=24+5+r()*14,w=.08+r()*.35,a=.35+r()*.6;f*=1-a*Math.exp(-Math.pow((t-c)/w,2))}return clamp(f,.08,1)}
function simulate(p){
  const kd=p.K*Math.LOG10E,dt=1/30,n=Math.round(p.hours/dt)+1;
  const surf=t=>{const tt=p.t0+t;let L=lxSun(sunEl(tt%24,p.lat,p.dec));if(p.clouds)L+=Math.log10(clouds(t));return addL(L,moonL(p,t))};
  const pref=p.pref!=null?p.pref:lxSun(sunEl(12,p.lat,p.dec))-kd*p.day;
  const zmax=p.day||150,vu=.065*3600*dt,vd=.076*3600*dt;
  const tgt=t=>clamp((surf(t)-pref)/kd,4,zmax);
  let z=tgt(-24);for(let t=-24;t<0;t+=dt){const g=tgt(t);z+=clamp(g-z,-vu,vd)}
  const T=new Float32Array(n),L=new Float32Array(n),Z=new Float32Array(n);
  for(let i=0;i<n;i++){const t=i*dt,g=tgt(t);z+=clamp(g-z,-vu,vd);T[i]=t;L[i]=surf(t);Z[i]=z}
  return{T,L,Z,n,dt};
}
const CM=[[0,hx("#FFFFFF")],[.12,hx("#EAF0F6")],[.3,hx("#B7CDE5")],[.5,hx("#6E97C6")],[.7,hx("#2C5DA8")],[.86,hx("#1B315A")],[1,hx("#0E1B2C")]];
const LS=[[-3.2,hx("#16202F")],[-1.6,hx("#3C4B66")],[-.6,hx("#8796B0")],[1,hx("#C9B9A6")],[3,hx("#F1D3B6")],[5,hx("#F6E7CF")]];
function layout(){
  W=cv.parentElement.clientWidth;if(W<10)return;const m=mob();H=m?320:440;ctx=fit(cv,W,H);
  plot={x:m?34:46,y:24,w:0,h:0};plot.w=W-plot.x-8;plot.h=H-plot.y-(m?24:28);render()}
function render(){
  const p=PRE[P];DATA=simulate(p);const pw=Math.max(10,Math.round(plot.w)),phh=Math.max(10,Math.round(plot.h));
  const oc=document.createElement("canvas");oc.width=pw;oc.height=phh;const o=oc.getContext("2d");const id=o.createImageData(pw,phh),px=id.data;
  const sig=p.zMax*.05,sig2=p.zMax*.07,r=rng(5);const noise=new Float32Array(pw*phh);for(let i=0;i<noise.length;i++)noise[i]=r();
  for(let x=0;x<pw;x++){const i=Math.min(DATA.n-1,Math.round(x/pw*(DATA.n-1))),zl=DATA.Z[i];
    for(let yy=0;yy<phh;yy++){const z=yy/phh*p.zMax;
      let v=p.mf*Math.exp(-Math.pow((z-zl)/sig,2)/2)*1.05;
      if(zl<sig*1.2)v+=p.mf*.5*Math.exp(-Math.pow((z-zl*.6)/(sig*1.6),2)/2);
      if(p.res)v+=(1-p.mf)*1.2*Math.exp(-Math.pow((z-p.res)/sig2,2)/2);
      v+=.05*Math.exp(-z/(p.zMax*.15));
      const nz=(noise[yy*pw+x]+noise[yy*pw+Math.max(0,x-1)]+noise[Math.max(0,yy-1)*pw+x])/3;
      v=v*(.62+.75*nz)+.035*nz;
      const c=ramp(CM,clamp(v,0,1)),k=(yy*pw+x)*4;px[k]=c[0];px[k+1]=c[1];px[k+2]=c[2];px[k+3]=255}}
  o.putImageData(id,0,0);img=oc;
  rev=RM?1:0;revT=performance.now();note.textContent=p.note;
}
function draw(){
  if(!ctx||!img)return;const c=ctx,m=mob(),p=PRE[P],fs=m?10:11.5;c.clearRect(0,0,W,H);
  const X=t=>plot.x+t/p.hours*plot.w,Y=z=>plot.y+z/p.zMax*plot.h;
  // surface light strip
  const sh=10,sy=plot.y-sh-4;for(let x=0;x<plot.w;x+=2){const i=Math.round(x/plot.w*(DATA.n-1));c.fillStyle=rgb(ramp(LS,DATA.L[i]));c.fillRect(plot.x+x,sy,2.5,sh)}
  txt(c,["Llum en superfície"],plot.x,sy-4,{fs:fs-.5,col:C.muted,halo:false});
  // echogram reveal
  const rw=plot.w*rev;c.drawImage(img,0,0,Math.max(1,img.width*rev),img.height,plot.x,plot.y,Math.max(1,rw),plot.h);
  c.fillStyle="#F6F6F4";c.fillRect(plot.x+rw,plot.y,plot.w-rw,plot.h);
  if(rev<1){c.fillStyle=C.warm;c.fillRect(plot.x+rw-1,plot.y-2,1.5,plot.h+4)}
  // depth axis
  const stepZ=p.zMax>300?100:50;for(let z=0;z<=p.zMax;z+=stepZ){const y=Y(z);c.fillStyle=C.hair;c.fillRect(plot.x-4,y,4,1);txt(c,[z===0?"0 m":String(z)],plot.x-7,y+(z===0?fs*.8:4),{al:"right",fs,col:C.muted,halo:false})}
  // time axis
  const st=p.hours>96?12:6;for(let h=0;h<=p.hours;h+=st){const x=X(h),hr=(p.t0+h)%24;c.fillStyle=hr===0?C.ink2:C.hair;c.fillRect(x,plot.y+plot.h,1,hr===0?7:4);
    if(m&&hr!==0&&hr!==12)continue;txt(c,[hr===0?"0 h":hr+" h"],clamp(x,plot.x+8,W-14),plot.y+plot.h+(m?17:19),{al:"center",fs,col:hr===0?C.ink2:C.muted,halo:false,bold:hr===0})}
  // annotations after reveal
  if(rev>=1){const a=1;
    if(P==="nova"||P==="plena"){const i=Math.round((36-0)/DATA.dt);const zn=DATA.Z[Math.min(DATA.n-1,Math.round((12+24)/DATA.dt))];
      const xi=X(36);txt(c,[[P==="plena"?`Mitjanit amb lluna: ${Math.round(zn/5)*5} m`:"Mitjanit: a la superfície",1]],xi,Y(Math.max(zn,8))+(P==="plena"?28:30),{al:"center",fs:fs+.5,col:C.ink});
      txt(c,[["Migdia: capa a ~450 m",1,"#fff"]],X(24),Y(450)-16,{al:"center",fs:fs+.5,halo:"rgba(14,27,44,.55)"});
      if(!m)txt(c,[["No migren",1,"#fff"]],X(60),Y(p.res)+4,{al:"center",fs:fs+.5,halo:"rgba(14,27,44,.55)"})}
    if(P==="nuvols"){txt(c,[["Dia clar",1]],X(12),Y(60),{al:"center",fs:fs+.5});txt(c,[["Dia de núvols",1]],X(36),Y(60),{al:"center",fs:fs+.5})}
    if(P==="polar"){for(let d=1;d*24<p.hours;d++){const x=X(d*24);c.save();c.strokeStyle=C.warm;c.globalAlpha=.6;c.setLineDash([2,3]);c.beginPath();c.moveTo(x,plot.y);c.lineTo(x,plot.y+plot.h);c.stroke();c.restore()}
      txt(c,[["Línies: cada 24 h",1,C.warm]],X(24)+4,plot.y+plot.h-8,{fs});
      txt(c,[["Lluna plena",1]],X(72),Y(115),{al:"center",fs:fs+.5})}
    if(P==="polar")txt(c,[["Atenció: escala de 0 a 200 m",1,C.warm]],plot.x+plot.w-6,plot.y+fs+6,{al:"right",fs:fs+.5})
  }
}
function setP(v){P=v;btns.forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===v));render()}
btns.forEach(b=>b.addEventListener("click",()=>setP(b.dataset.v)));
replay.addEventListener("click",()=>{rev=RM?1:0;revT=performance.now()});
function hov(e){if(!DATA)return;const b=cv.getBoundingClientRect(),x=e.clientX-b.left,yv=e.clientY-b.top,p=PRE[P];
  if(x<plot.x||x>plot.x+plot.w||yv<plot.y-16||yv>plot.y+plot.h){tip.style.opacity=0;return}
  const i=Math.round((x-plot.x)/plot.w*(DATA.n-1)),t=DATA.T[i],tt=p.t0+t,L=DATA.L[i];
  const light=L>2.8?"sol":L>.4?"crepuscle":L>-1.6?"lluna":"fosc";
  tip.innerHTML=`<b>Dia ${Math.floor(tt/24)+1}, ${hhmm(tt)}</b><br>Capa que migra: ${Math.round(DATA.Z[i])} m<br><span style="color:${C.muted}">Llum en superfície: ${light}</span>`;
  tip.style.opacity=1;const tw=tip.offsetWidth;let tx=x+14;if(tx+tw>W)tx=x-tw-14;tip.style.transform=`translate(${Math.max(0,tx)}px,${Math.max(0,yv-50)}px)`}
// touch: a tap opens the tooltip and it stays until the next tap elsewhere
cv.addEventListener("pointermove",hov);cv.addEventListener("pointerdown",hov);
cv.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0});
document.addEventListener("pointerdown",e=>{if(e.target!==cv)tip.style.opacity=0});
let seen=false;new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!seen){seen=true;rev=RM?1:0;revT=performance.now()}}),{threshold:.4}).observe(cv);
function frame(now){requestAnimationFrame(frame);if(vis.echo===false)return;if(!W){layout();return}if(seen&&rev<1){rev=clamp((now-revT)/2600,0,1)}else if(!seen)rev=0;try{draw()}catch(e){console.error(e)}}
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(layout,150)});
layout();requestAnimationFrame(frame);
})();

/* =========================================================
   5. CARBON PUMP (scrolly)
   The time of day is set by the step, not by a free-running clock:
   steps 1–2 daytime surface, step 3 night → dawn descent (looped),
   steps 4–5 daytime with the migrants at depth releasing carbon.
   ========================================================= */
(function(){
const cv=$("carb");if(!cv)return;io.observe(cv);
const graphic=$("cgraph"),steps=$("csteps"),tEl=$("cTitle"),sEl=$("cSub");
let ctx,W=0,H=0,skyH=0,y0=0;const ZM=1100;
const yz=z=>y0+z/ZM*(H-y0-2);
const r=rng(3);
let PH=[],MG=[],snow=[],poop=[],co2=[],air=[];
const F={snow:0,mig:0,rel:0,seq:0,air:1,arr:0};
// migrant phase 0..1: .05–.42 night at the top, .42–.55 descent at dawn, .55–.92 day at depth
const DAY=.75;
const CS=[{air:1},{air:.6,snow:1},{air:.4,snow:.7,mig:1,arr:1,seg:[.16,.7],rmPh:.48},{air:.3,snow:.6,mig:1,rel:1},{air:.3,snow:.5,mig:1,rel:1,seq:1}];
let step=0,ph=DAY,hold=0,meanZ=0;
const nightF=p=>p<.42?1:p<.52?1-sm((p-.42)/.1):p<.92?0:sm((p-.92)/.08);
function init(){PH=[];for(let i=0;i<(mob()?150:260);i++)PH.push({x:r(),z:clamp(15+Math.pow(r(),.9)*110,4,150),w:r()*6.28});
  MG=[];for(let i=0;i<(mob()?34:56);i++)MG.push({x:.06+r()*.88,nd:10+r()*80,dd:360+r()*230,tj:r()*.03,type:r()<.5?2:r()<.6?1:3,gut:0,z:null,w:r()*6.28,em:r()});
  snow=[];poop=[];co2=[];air=[];if(RM)placeStatic()}
function layout(){W=cv.parentElement.clientWidth;if(W<10)return;const m=mob();H=Math.round(m?clamp(innerHeight*.31,190,300):clamp(innerHeight-230,380,760));H=Math.min(H,Math.round(W*(m?1.05:1)));skyH=Math.max(26,Math.round(H*.09));y0=skyH;ctx=fit(cv,W,H)}
function migZ(a,p){const u=((p-a.tj)%1+1)%1;
  if(u<.05)return lerp(a.dd,a.nd,sm(.5+u/.1));if(u<.42)return a.nd;if(u<.55)return lerp(a.nd,a.dd,sm((u-.42)/.13));if(u<.92)return a.dd;return lerp(a.dd,a.nd,sm((u-.92)/.13))}
// reduced motion: one still picture per step, with the particles laid out once
function placeStatic(){const q=rng(17);air=[];snow=[];co2=[];poop=[];
  for(let i=0;i<14;i++)air.push({x:q(),z:5+q()*90,a:.8});
  for(let i=0;i<110;i++){const z=30+Math.pow(q(),1.3)*850;snow.push({x:q(),z,a:clamp(1-z/950,.08,1),v:0,dec:0})}
  for(const a of MG){a.z=migZ(a,ph);a.gut=step>=2?1:0}
  if(CS[step].rel)for(const a of MG){if(q()<.6)co2.push({x:a.x+(q()-.5)*.01,z:a.z-10-q()*40,a:.4+q()*.5,v:0,dx:0});if(q()<.5)poop.push({x:a.x,z:a.z+20+q()*380,a:.9,v:0})}}
function setStep(i){step=i;const s=CS[i];
  if(s.seg){ph=RM?s.rmPh:s.seg[0];hold=0}else if(RM)ph=DAY;
  if(s.rel)for(const a of MG)a.gut=Math.max(a.gut,.8);
  if(RM){for(const k in F)F[k]=s[k]||0;placeStatic()}}
let last=performance.now(),T0=last;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;if(!W){layout();return}if(vis.carb===false)return;const tt=RM?0:(now-T0)/1000;try{tick(dt);draw(tt)}catch(e){console.error(e)}}
function tick(dt){
  const tg=CS[step];
  if(!RM){for(const k in F)F[k]+=((tg[k]||0)-F[k])*Math.min(1,dt*2.5);
    if(tg.seg){if(hold>0){hold-=dt;if(hold<=0)ph=tg.seg[0]}else{ph+=dt*.085;if(ph>=tg.seg[1]){ph=tg.seg[1];hold=1.6}}}
    else ph+=(DAY-ph)*Math.min(1,dt*1.5);
    const n=nightF(ph);
    // CO2 from the air into the sunlit layer
    if(r()<dt*6*F.air)air.push({x:r(),z:-skyH*.9/(H/ZM),v:30+r()*20,end:10+r()*90,a:1});
    for(const b of air){b.z+=b.v*dt;if(b.z>b.end)b.a-=dt*2}air=air.filter(b=>b.a>0);
    // marine snow: slow, mostly consumed on the way down
    if(r()<dt*9*F.snow)snow.push({x:r(),z:20+r()*80,v:16+r()*10,a:1,dec:.0012+r()*.0016});
    for(const s of snow){s.z+=s.v*dt;s.a-=s.dec*s.v*dt}snow=snow.filter(s=>s.a>0&&s.z<ZM);
    // migrants: fill up at the top at night, release CO2 and faecal pellets at depth by day
    for(const a of MG){const z=migZ(a,ph);a.z=a.z==null?z:a.z+(z-a.z)*Math.min(1,dt*6);
      if(a.z<130&&n>.5)a.gut=Math.min(1,a.gut+dt*.9);
      if(a.z>300&&n<.5&&a.gut>0){a.gut=Math.max(tg.rel?.35:0,a.gut-dt*.16);
        if(F.rel>.3&&r()<dt*.9*F.rel)co2.push({x:a.x,z:a.z,v:-(8+r()*8),a:1,dx:(r()-.5)*.01});
        if(F.rel>.3&&r()<dt*.5*F.rel)poop.push({x:a.x,z:a.z+6,v:70+r()*40,a:1})}}
    for(const b of co2){b.z+=b.v*dt;b.x+=b.dx*dt;b.a-=dt*.32}co2=co2.filter(b=>b.a>0);
    for(const p of poop){p.z+=p.v*dt;if(p.z>950)p.a-=dt*1.2}poop=poop.filter(p=>p.a>0&&p.z<ZM);
  }
  let sum=0;for(const a of MG)sum+=a.z||0;meanZ=MG.length?sum/MG.length:0;
  const n=F.mig>.05?nightF(ph):0;
  const ts=n>.5?"Nit":F.mig>.05&&ph>.42&&ph<.56?"Alba":"Dia";if(tEl.textContent!==ts)tEl.textContent=ts;
  const ss=step===2&&!RM?"De la nit a l'alba, en bucle":"";if(sEl.textContent!==ss)sEl.textContent=ss;
}
const WATER=[[0,hx("#DCE9F5")],[.12,hx("#9EBEDF")],[.3,hx("#4F7FB0")],[.55,hx("#1E3B63")],[.8,hx("#11223A")],[1,hx("#0A1422")]];
const mix=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function draw(tt){
  const c=ctx,m=mob(),fs=m?10.5:12,n=F.mig>.05?nightF(ph)*clamp(F.mig,0,1):0,night=n>.5;
  c.clearRect(0,0,W,H);
  c.fillStyle=rgb(mix(hx("#D8E6F3"),hx("#1C2638"),n));c.fillRect(0,0,W,skyH);
  txt(c,[["Aire",1]],8,skyH-8,{fs,col:night?"rgba(255,255,255,.7)":C.ink2,halo:false});
  const g=c.createLinearGradient(0,y0,0,H);WATER.forEach(([o,col])=>{g.addColorStop(o,rgb(mix(col,col.map(v=>v*.35+8),n)))});c.fillStyle=g;c.fillRect(0,y0,W,H-y0);
  // depth labels
  for(let z=0;z<=1000;z+=200){const y=yz(z),light=!night&&z<200;txt(c,[z===0?"0 m":z+" m"],4,y+(z===0?fs+2:4),{fs:fs-1,col:light?C.ink2:"rgba(255,255,255,.7)",halo:false})}
  // air CO2
  c.lineWidth=1;for(const b of air){const y=yz(b.z);c.globalAlpha=b.a*clamp(F.air,0,1);c.strokeStyle=night?"#E8EDF3":C.ink2;c.beginPath();c.arc(b.x*W,y,2.6,0,6.283);c.stroke()}c.globalAlpha=1;
  if(F.air>.5&&step===0){txt(c,[["CO₂ de l'aire",1]],W*.62,skyH-8,{fs,col:night?"#fff":C.ink,halo:false})}
  // phytoplankton
  c.fillStyle=night?C.bioL:C.bio;for(const p of PH){c.globalAlpha=.85;c.beginPath();c.arc(p.x*W+Math.sin(tt*.3+p.w)*3,yz(p.z),m?1.3:1.6,0,6.283);c.fill()}c.globalAlpha=1;
  // snow
  for(const s of snow){c.fillStyle=!night&&s.z<260?"#857C70":C.snow;c.globalAlpha=clamp(s.a,0,1)*clamp(F.snow,0,1);c.fillRect(s.x*W,yz(s.z),2.6,2.6)}c.globalAlpha=1;
  // faecal pellets (sink faster) and CO2 released at depth
  const ra=clamp(F.rel,0,1);
  c.fillStyle="#8A6E52";for(const p of poop){c.globalAlpha=p.a*ra;c.fillRect(p.x*W,yz(p.z),1.6,4)}c.globalAlpha=1;
  c.strokeStyle="#E8EDF3";for(const b of co2){c.globalAlpha=b.a*.9*ra;c.beginPath();c.arc(b.x*W,yz(b.z),2.4,0,6.283);c.stroke()}c.globalAlpha=1;
  // migrants with gut contents
  const s=m?1.5:1.9;for(const a of MG){if(a.z==null)continue;const x=a.x*W+Math.sin(tt*.4+a.w)*6,y=yz(a.z+Math.sin(tt*.7+a.w)*4);c.globalAlpha=clamp(F.mig,0,1)*.95;c.fillStyle=C.migL;c.strokeStyle=C.migL;glyphC(c,x,y,s,a.type);
    if(a.gut>.05){c.fillStyle=C.bioL;c.beginPath();c.arc(x,y,1.2+1.6*a.gut,0,6.283);c.fill()}}c.globalAlpha=1;
  // labels per step
  const lx=m?36:48;
  if(step===0)txt(c,[["El fitoplàncton",1,C.bio],["fixa el carboni",1,C.bio]],lx,yz(175),{fs:fs+1});
  if(F.snow>.3&&step===1){txt(c,[["Neu marina: de 10 a 100 m al dia.",1,"#fff"],["La major part es consumeix pel camí",0,"#fff"]],lx,yz(330),{fs,halo:"rgba(14,27,44,.6)"})}
  if(step===2){const top=meanZ<160;txt(c,[[top?"Mengen a dalt, de nit":"Baixen amb la panxa plena",1,C.migL]],lx,top?yz(185):yz(clamp(meanZ,250,600))-34,{fs:fs+1,halo:"rgba(14,27,44,.6)"});
    if(F.arr>.02){const xa=W-(m?22:34);c.save();c.globalAlpha=clamp(F.arr,0,1)*(top?.35:.9);arrowV(c,xa,yz(110),yz(420),"#fff",1.5);c.restore()}}
  if(step===3){txt(c,[["CO₂ que respiren",1,"#E8EDF3"],["Excrements que s'enfonsen de pressa",1,"#C9A783"]],lx,yz(680),{fs,halo:"rgba(14,27,44,.6)",a:ra})}
  if(F.seq>.02){const a=F.seq,xr=W-(m?8:14);c.save();c.globalAlpha=a;c.strokeStyle="#fff";c.lineWidth=1;
    const br=(z0,z1,lines)=>{const ya=yz(z0),yb=yz(z1);c.beginPath();c.moveTo(xr-5,ya);c.lineTo(xr,ya);c.lineTo(xr,yb);c.lineTo(xr-5,yb);c.stroke();txt(c,lines,xr-9,(ya+yb)/2-((lines.length-1)*fs*1.3)/2+4,{al:"right",fs,col:"#fff",halo:"rgba(14,27,44,.7)",a})};
    // Boyd et al. 2019: carbon left inside the winter mixed layer is re-exposed to the air within a year
    br(60,190,[["Capa de mescla d'hivern",1],"torna a tocar l'aire","en menys d'un any"]);br(380,600,[["Migradors, fins a 600 m",1],"fins a 250 anys"]);br(1000,1095,[["Per sota de 1.000 m",1],"segles"]);c.restore()}
}
function glyphC(c,x,y,s,type){if(type===1){c.lineWidth=1.4;c.beginPath();c.moveTo(x-3*s,y+.5*s);c.quadraticCurveTo(x,y-1.3*s,x+3*s,y+.3*s);c.stroke()}else if(type===2){c.beginPath();c.ellipse(x,y,3.4*s,1.4*s,0,0,6.283);c.fill();c.beginPath();c.moveTo(x-3*s,y);c.lineTo(x-5*s,y-1.5*s);c.lineTo(x-5*s,y+1.5*s);c.closePath();c.fill()}else{c.beginPath();c.moveTo(x-3.2*s,y);c.lineTo(x+1.6*s,y-1.4*s);c.lineTo(x+1.6*s,y+1.4*s);c.closePath();c.fill()}}
init();layout();IB.scrolly(steps,graphic,setStep);requestAnimationFrame(frame);
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{init();layout()},150)});
if(document.fonts)document.fonts.ready.then(layout);
})();

/* =========================================================
   6. CARBON ESTIMATES (published values)
   ========================================================= */
(function(){
const svg=d3.select("#est");if(svg.empty())return;const wrap=$("estwrap"),tip=$("estTip"),fig=$("estfig");
const R=[
 {n:"Zooplàncton migrador",s:"càlcul nostre, model del 2019",lo:null,c:1.04,hi:null,calc:1,t:"Càlcul nostre: el 16% de mitjana de l'exportació total del model (6,5 PgC l'any). El model no dona un interval global; els autors el presenten com un experiment de pensament."},
 {n:"Peixos",s:"recull d'estudis, 2021",lo:.3,c:1.5,hi:2.7,t:"1,5 ± 1,2 PgC l'any: un 16% (± 13%) del flux de carboni, entre excrements que s'enfonsen i transport nedant."},
 {n:"Migradors de la zona crepuscular",s:"recull d'estimacions, 2019",lo:.9,c:null,hi:3.6,t:"Interval de les estimacions globals publicades fins al 2019 per a la «bomba de migrants»."}];
let drawn=false;
function build(){
  const m=mob(),W=wrap.clientWidth,rowH=m?58:54,ml=m?8:196,mr=16,mt=38,H=mt+R.length*rowH+30;
  svg.attr("viewBox",`0 0 ${W} ${H}`).style("height",H+"px");svg.selectAll("*").remove();
  const x=d3.scaleLinear().domain([0,7]).range([ml,W-mr]);
  for(let v=0;v<=7;v++){svg.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",mt-8).attr("y2",H-24).attr("stroke",C.hair).attr("stroke-width",.6);svg.append("text").attr("x",x(v)).attr("y",H-8).attr("text-anchor","middle").attr("font-size",11.5).attr("fill",C.muted).text(v)}
  svg.append("text").attr("x",x(0)).attr("y",mt-18).attr("font-size",11.5).attr("fill",C.muted).text("Petagrams de carboni l'any");
  svg.append("line").attr("x1",x(6.5)).attr("x2",x(6.5)).attr("y1",mt-14).attr("y2",H-24).attr("stroke",C.ink).attr("stroke-dasharray","3 3");
  svg.append("text").attr("x",x(6.5)-6).attr("y",mt-18).attr("text-anchor","end").attr("font-size",m?10.5:12).attr("fill",C.ink).text(m?"Tot el carboni exportat: 6,5":"Tot el carboni exportat: 6,5 (model del 2019)");
  R.forEach((d,i)=>{const xe=x(d.hi!=null?d.hi:d.c),yc=mt+i*rowH+rowH/2+(m?8:0);const g=svg.append("g").attr("tabindex",0);
    const lab=g.append("text").attr("x",m?ml:ml-12).attr("y",m?yc-14:yc-2).attr("text-anchor",m?"start":"end").attr("font-size",m?12:13).attr("font-weight",600).attr("fill",C.ink).text(d.n);
    g.append("text").attr("x",m?ml+lab.node().getComputedTextLength()+6:ml-12).attr("y",m?yc-14:yc+13).attr("text-anchor",m?"start":"end").attr("font-size",m?11:12).attr("fill",C.muted).text(d.s);
    if(d.lo!=null)g.append("rect").attr("class","rb").attr("x",x(d.lo)).attr("y",yc-6).attr("height",12).attr("rx",6).attr("fill",C.mig).attr("fill-opacity",.35).attr("width",0).attr("data-w",x(d.hi)-x(d.lo));
    if(d.c!=null)g.append("circle").attr("class","rc").attr("cx",x(d.c)).attr("cy",yc).attr("r",0).attr("fill",C.mig);
    g.append("text").attr("x",xe+(d.calc?10:8)).attr("y",yc+4).attr("font-size",12).attr("fill",C.ink2).text(d.calc?`≈ ${fmt(d.c,1)}`:d.c!=null?`${fmt(d.c,1)} (${fmt(d.lo,1)}–${fmt(d.hi,1)})`:`${fmt(d.lo,1)}–${fmt(d.hi,1)}`);
    g.append("rect").attr("x",0).attr("y",yc-rowH/2).attr("width",W).attr("height",rowH).attr("fill","transparent")
     .on("pointerenter pointermove pointerdown focus",()=>{tip.innerHTML=`<b>${d.n}</b><br>${d.t}`;tip.style.opacity=1;const tw=tip.offsetWidth;tip.style.transform=`translate(${clamp(xe-tw/2,0,W-tw)}px,${yc+12}px)`}).on("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0}).on("blur",()=>tip.style.opacity=0);
  });
  drawn=false;if(vis.estfig)grow();
}
function grow(){if(drawn)return;drawn=true;svg.selectAll("rect.rb").transition().duration(RM?0:1100).delay((d,i)=>i*160).attr("width",function(){return this.getAttribute("data-w")});svg.selectAll("circle.rc").transition().duration(RM?0:500).delay(900).attr("r",5)}
new IntersectionObserver(es=>es.forEach(e=>{vis.estfig=e.isIntersecting;if(e.isIntersecting)grow()}),{threshold:.4}).observe(fig);
document.addEventListener("pointerdown",e=>{if(!wrap.contains(e.target))tip.style.opacity=0});
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(build,150)});
build();
})();

/* reading time (same rule as the other articles) */
(()=>{const n=[...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")].filter(e=>!e.closest(".fn")).reduce((a,e)=>a+(e.textContent.match(/[\p{L}\p{N}·'’]+/gu)||[]).length,0);
 const figs=document.querySelectorAll("canvas[role=img],svg[role=img]").length;let sec=n/218*60;for(let i=0;i<figs;i++)sec+=Math.max(3,12-i);
 const el=document.getElementById("rt");if(el)el.textContent=Math.max(1,Math.round(sec/60))+" min de lectura"})();

})();
