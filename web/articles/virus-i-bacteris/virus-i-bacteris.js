/* «La guerra invisible» — gràfics 1: escala, cicle d'infecció, virus a l'oceà, curtcircuit viral.
   Helpers compartits a window.VIB (els fa servir crispr.js). */
(function(){
"use strict";
const C={ink:"#121212",ink2:"#4A4A4A",muted:"#7A7A7A",hair:"#DADADA",land:"#ECEBE8",warm:"#C8442A",warmL:"#EFB9A8",cold:"#2C5DA8",coldL:"#86A9D6",dry:"#9A6326",wet:"#16786C",bio:"#4C8A2E",paper:"#FFFFFF",cyto:"#EEF3F9",env:"#2C5DA8",uv:"#7A4C9A"};
const SSF='"Source Sans 3","Helvetica Neue",Arial,sans-serif';
const RM=!!(window.IB&&IB.reduced);
const mob=()=>innerWidth<900;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ease=t=>{t=clamp(t,0,1);return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}, sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const safe=(f,...a)=>{try{return f(...a)}catch(e){console.error(e)}};
let dpr=Math.min(2,devicePixelRatio||1);
function setup(cv,w,h){dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.height=h+"px";const c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);return c}
/* multi-line label: lines = [[text,bold,color],...] */
function txt(c,lines,x,y,al,fs,a,halo){c.save();c.globalAlpha=a==null?1:a;c.textAlign=al||"left";c.textBaseline="alphabetic";
  lines.forEach((l,i)=>{if(!l||l[0]==null||l[0]==="")return;c.font=`${l[1]?"600 ":""}${fs}px ${SSF}`;const yy=y+i*fs*1.25;if(halo!==false){c.lineWidth=3.2;c.strokeStyle="rgba(255,255,255,.92)";c.lineJoin="round";c.strokeText(l[0],x,yy)}c.fillStyle=l[2]||C.ink;c.fillText(l[0],x,yy)});c.restore()}
function lead(c,x0,y0,x1,y1,col,a){c.save();c.globalAlpha=a==null?1:a;c.strokeStyle=col||C.ink2;c.lineWidth=.8;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.fillStyle=col||C.ink2;c.beginPath();c.arc(x0,y0,1.8,0,6.2832);c.fill();c.restore()}
const fmtN=(v,d)=>(window.IB&&IB.fmt)?IB.fmt(v,d):v.toFixed(d||0);
/* visibility + one animation loop */
const VIS={};const vio=new IntersectionObserver(es=>es.forEach(e=>{VIS[e.target.id]=e.isIntersecting}),{rootMargin:"120px 0px"});
const FR=[];function onFrame(f){FR.push(f)}
let T0=performance.now(),lastT=T0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.1,(now-lastT)/1000);lastT=now;for(const f of FR){try{f(now,dt)}catch(e){console.error(e)}}}
requestAnimationFrame(loop);
const LAY=[];function onLayout(f){LAY.push(f)}
function relayout(){LAY.forEach(f=>safe(f))}
let rzT,lastW=innerWidth;addEventListener("resize",()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(innerWidth===lastW&&mob())return;lastW=innerWidth;relayout()},160)});
if(document.fonts)document.fonts.ready.then(relayout);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(relayout,60)});
window.VIB={C,SSF,RM,mob,clamp,lerp,ease,sm,safe,setup,txt,lead,VIS,vio,onFrame,onLayout,relayout,fmtN};

/* ================= drawing of phages (units: nm, y up; s = px per nm) ================= */
/* T4: x,y = screen position of the bottom of the baseplate. o: {k:contraction 0..1, legs:0..1 spread, empty, a:alpha, rot} */
function drawT4(c,x,y,s,o){o=o||{};const k=o.k||0,legs=o.legs==null?0:o.legs,al=o.a==null?1:o.a;
  c.save();c.globalAlpha=al;c.translate(x,y);if(o.rot)c.rotate(o.rot);c.scale(s,s);c.lineJoin="round";c.lineCap="round";
  const bpH=27,bpW=52,shL=lerp(92.5,42,k),shW=lerp(24,33,k),neck=8,hL=115,hW=85,tube=92.5;
  const lw=Math.max(.6/s,1.1);
  /* long tail fibres (6, side view shows 3 per side merged into 2+1) */
  const fib=(dir,depth)=>{const bx=dir*bpW*.42,by=-bpH*.55;
    /* folded: knee up along the sheath; spread: knee out, tip on surface */
    const kx=lerp(dir*36,dir*(70+depth*8),legs),ky=lerp(-bpH-58,-56+depth*4,legs);
    const tx=lerp(dir*(18+depth*6),dir*(118+depth*14),legs),ty=lerp(-6,0,legs);
    c.beginPath();c.moveTo(bx,by);c.lineTo(kx,ky);c.lineTo(tx,ty);c.stroke()};
  c.strokeStyle=C.ink2;c.lineWidth=lw*1.2;
  fib(-1,0);fib(1,0);c.globalAlpha=al*.55;fib(-1,1);fib(1,1);c.globalAlpha=al;
  /* inner tube protruding below the baseplate when contracted */
  if(k>0){const p=tube-shL-0;c.fillStyle=C.ink2;c.fillRect(-4.5,-bpH*.2,9,p*k/(k||1)*1+bpH*.2)}
  /* baseplate: hexagonal dome -> star (flatter, wider) */
  const w2=lerp(bpW,bpW*1.25,k)/2,h2=lerp(bpH,bpH*.7,k);
  c.fillStyle="#3E3E3E";c.beginPath();c.moveTo(-w2,0);c.lineTo(w2,0);c.lineTo(w2*.72,-h2);c.lineTo(-w2*.72,-h2);c.closePath();c.fill();
  /* sheath with rings */
  const sy=-h2,sTop=sy-shL;c.fillStyle="#5C5C5C";c.fillRect(-shW/2,sTop,shW,shL);
  c.strokeStyle="rgba(255,255,255,.45)";c.lineWidth=lw*.7;const nR=Math.max(4,Math.round(shL/4.1));for(let i=1;i<nR;i++){const yy=sTop+i*shL/nR;c.beginPath();c.moveTo(-shW/2,yy);c.lineTo(shW/2,yy);c.stroke()}
  /* neck + collar */
  const nTop=sTop-neck;c.fillStyle="#4A4A4A";c.fillRect(-8,nTop,16,neck);c.fillRect(-17,nTop+2,34,2.6);
  /* head: elongated icosahedron (115 x 85) */
  const hb=nTop,ht=hb-hL,sh=hW/2;c.beginPath();c.moveTo(0,hb+2);c.lineTo(sh,hb-20);c.lineTo(sh,ht+20);c.lineTo(0,ht);c.lineTo(-sh,ht+20);c.lineTo(-sh,hb-20);c.closePath();
  c.fillStyle=o.empty?"#F4F1EE":"#E9D4CC";c.fill();c.strokeStyle=C.ink;c.lineWidth=lw*1.3;c.stroke();
  c.strokeStyle="rgba(0,0,0,.18)";c.lineWidth=lw*.8;c.beginPath();c.moveTo(-sh,hb-20);c.lineTo(0,hb-34);c.lineTo(sh,hb-20);c.moveTo(-sh,ht+20);c.lineTo(0,ht+34);c.lineTo(sh,ht+20);c.moveTo(0,hb-34);c.lineTo(0,ht+34);c.stroke();
  if(!o.empty){/* DNA spooled inside the head */c.strokeStyle=C.warm;c.globalAlpha=al*.7;c.lineWidth=lw*1.1;const my=(hb+ht)/2;for(let r=8;r<=32;r+=6){c.beginPath();c.ellipse(0,my,r,r*1.32,0,0,6.2832);c.stroke()}}
  c.restore();
  return {head:[x,y-(h2+shL+neck+hL/2)*s],headTop:y-(h2+shL+neck+hL)*s,sheath:[x,y-(h2+shL/2)*s],base:[x,y-h2*s/2],fib:[x+(legs?95:40)*s,y-(legs?30:60)*s]};
}
/* tiny progeny T4 (no fibres), centred at x,y */
function miniT4(c,x,y,s,rot,a){c.save();c.globalAlpha=a==null?1:a;c.translate(x,y);c.rotate(rot||0);c.scale(s,s);
  c.fillStyle="#5C5C5C";c.fillRect(-12,10,24,80);c.fillStyle="#3E3E3E";c.fillRect(-20,88,40,14);
  c.beginPath();c.moveTo(0,12);c.lineTo(42,-8);c.lineTo(42,-82);c.lineTo(0,-103);c.lineTo(-42,-82);c.lineTo(-42,-8);c.closePath();c.fillStyle="#E9D4CC";c.fill();c.strokeStyle=C.ink;c.lineWidth=Math.max(1/s,6);c.stroke();c.restore()}
function miniHead(c,x,y,s,rot,a,fill){c.save();c.globalAlpha=a==null?1:a;c.translate(x,y);c.rotate(rot||0);c.scale(s,s);c.beginPath();c.moveTo(0,57);c.lineTo(42,37);c.lineTo(42,-37);c.lineTo(0,-57);c.lineTo(-42,-37);c.lineTo(-42,37);c.closePath();c.fillStyle=fill||"#F4F1EE";c.fill();c.strokeStyle=C.ink;c.lineWidth=Math.max(1/s,6);c.stroke();c.restore()}
function miniTail(c,x,y,s,rot,a){c.save();c.globalAlpha=a==null?1:a;c.translate(x,y);c.rotate(rot||0);c.scale(s,s);c.fillStyle="#5C5C5C";c.fillRect(-12,-46,24,80);c.fillStyle="#3E3E3E";c.fillRect(-20,32,40,14);c.restore()}
/* lambda: head ~60 nm, flexible tail 135 nm. x,y = tail tip */
function drawLambda(c,x,y,s,o){o=o||{};c.save();c.globalAlpha=o.a==null?1:o.a;c.translate(x,y);if(o.rot)c.rotate(o.rot);c.scale(s,s);c.lineCap="round";
  const lw=Math.max(.6/s,1.1),bend=o.bend==null?8:o.bend;
  c.strokeStyle="#5C5C5C";c.lineWidth=9;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(bend,-68,0,-135);c.stroke();
  c.strokeStyle=C.ink2;c.lineWidth=lw*1.4;c.beginPath();c.moveTo(0,0);c.lineTo(0,18);c.stroke();
  const cy=-135-30,r=30;c.beginPath();for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;const px=Math.cos(a)*r,py=cy+Math.sin(a)*r;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();
  c.fillStyle=o.empty?"#F4F1EE":"#E9D4CC";c.fill();c.strokeStyle=C.ink;c.lineWidth=lw*1.3;c.stroke();c.restore()}
function miniLambda(c,x,y,s,rot,a){drawLambda(c,x,y,s,{rot,a,bend:10})}

/* ================= 1. scale figure ================= */
(function(){
  const cv=document.getElementById("scale");if(!cv)return;
  const rng=document.getElementById("scRng"),seg=document.getElementById("scSeg"),nameEl=document.getElementById("scName"),valEl=document.getElementById("scVal"),play=document.getElementById("scPlay");
  vio.observe(cv);
  const P=[{n:"Un òvul humà",W:300,c:[40,30]},{n:"Una cèl·lula humana",W:44,c:[-6,3]},{n:"Un glòbul vermell",W:14,c:[2.6,.8]},{n:"Un bacteri",W:3.2,c:[.1,-.25]},{n:"Un fag sobre un bacteri",W:.62,c:[.25,.1]}];
  const L0=Math.log10(P[0].W),L1=Math.log10(P[P.length-1].W);
  seg.innerHTML=P.map((p,i)=>`<button type="button" data-i="${i}" aria-pressed="${i?"false":"true"}">${["Òvul","Cèl·lula humana","Glòbul vermell","Bacteri","Fag"][i]}</button>`).join("");
  let W=0,H=0,c,z=0,anim=null,auto=false,dirty=true;
  function layout(){W=cv.parentElement.clientWidth;if(!W)return;H=Math.round(clamp(W*(mob()?.82:.5),260,mob()?420:520));c=setup(cv,W,H);dirty=true}
  onLayout(layout);layout();
  function cam(zz){const L=lerp(L0,L1,zz);let i=0;while(i<P.length-2&&L<Math.log10(P[i+1].W))i++;const a=Math.log10(P[i].W),b=Math.log10(P[i+1].W),t=clamp((L-a)/(b-a),0,1),te=sm(t);
    return {W:Math.pow(10,L),x:lerp(P[i].c[0],P[i+1].c[0],te),y:lerp(P[i].c[1],P[i+1].c[1],te),near:t<.5?i:i+1}}
  /* deterministic blob for the HeLa cell */
  const blob=[];for(let i=0;i<64;i++){const a=i/64*6.2832;blob.push([a,1+.06*Math.sin(3*a+.6)+.04*Math.sin(5*a+1.9)+.03*Math.sin(8*a)])}
  function niceBar(w){const cand=[100,50,20,10,5,2,1,.5,.2,.1,.05,.02];for(const v of cand)if(v<=w/4.2)return v;return .01}
  const fmtL=v=>v>=1?fmtN(v,0)+" µm":fmtN(v*1000,0)+" nm";
  function draw(){if(!W||!c)return;const k=cam(z),s=W/k.W,X=x=>W/2+(x-k.x)*s,Y=y=>H/2-(y-k.y)*s,R=r=>r*s,fs=mob()?11:12.5;
    c.clearRect(0,0,W,H);
    /* oocyte */
    const oc=[75,40],orr=60;if(R(orr)>3){c.fillStyle="#F7F1EA";c.beginPath();c.arc(X(oc[0]),Y(oc[1]),R(orr),0,6.2832);c.fill();c.strokeStyle="#D9CBB8";c.lineWidth=Math.max(1,R(6));c.stroke();c.fillStyle="#EFE4D6";c.beginPath();c.arc(X(oc[0]+12),Y(oc[1]+8),R(13),0,6.2832);c.fill()}
    /* HeLa */
    const hc=[-14,6],hr=10;if(R(hr)>2){c.beginPath();blob.forEach(([a,f],i)=>{const px=X(hc[0]+Math.cos(a)*hr*f),py=Y(hc[1]+Math.sin(a)*hr*f);i?c.lineTo(px,py):c.moveTo(px,py)});c.closePath();c.fillStyle="#F3EDE5";c.fill();c.strokeStyle="#C9B9A4";c.lineWidth=Math.max(.8,R(.25));c.stroke();c.fillStyle="#E6DACB";c.beginPath();c.arc(X(hc[0]-1.5),Y(hc[1]+1),R(4.2),0,6.2832);c.fill()}
    /* red blood cell */
    const rc=[5.2,1.5],rr=3.75;if(R(rr)>1){c.fillStyle="#E6B3A7";c.beginPath();c.arc(X(rc[0]),Y(rc[1]),R(rr),0,6.2832);c.fill();c.fillStyle="#EFCDC4";c.beginPath();c.arc(X(rc[0]),Y(rc[1]),R(rr*.5),0,6.2832);c.fill()}
    const sNm=s/1000;
    /* E. coli capsule: 2 x 1 µm, top surface at y=0 */
    if(R(1)>.6){c.beginPath();const r=.5,cx=0,cy=-.5;c.moveTo(X(cx-.5),Y(cy+r));c.lineTo(X(cx+.5),Y(cy+r));c.arc(X(cx+.5),Y(cy),R(r),-Math.PI/2,Math.PI/2);c.lineTo(X(cx-.5),Y(cy-r));c.arc(X(cx-.5),Y(cy),R(r),Math.PI/2,Math.PI*1.5);c.closePath();c.fillStyle=C.cyto;c.fill();c.strokeStyle=sNm*30>4?C.coldL:C.cold;c.lineWidth=Math.max(1,R(.03));c.stroke()}
    /* T4 at x=0.25 on the surface */
    if(sNm*245>2.5){drawT4(c,X(.25),Y(0),sNm,{legs:1,k:0})}else if(R(1)>.6){c.fillStyle=C.ink;c.fillRect(X(.25)-.6,Y(0)-Math.max(1.5,sNm*245),1.2,Math.max(1.5,sNm*245))}
    /* labels */
    const lab=(px,py,lines,tx,ty,al,a)=>{if(a<=0)return;lead(c,px,py,tx,ty,C.ink2,a);txt(c,lines,tx+(al==="right"?-4:4),ty+(ty<py?-4:fs),al,fs,a)};
    const vis=(sz)=>clamp((sz-18)/30,0,1)*clamp((W*1.6-sz)/(W*.6),0,1);
    let a=vis(R(120));if(a>0){const px=X(oc[0]+orr*.7),py=Y(oc[1]+orr*.7);lab(px,py,[["Òvul humà",true],["120 µm",false,C.ink2]],Math.min(W-10,px+30),Math.max(30,py-24),px+30>W-80?"right":"left",a)}
    a=vis(R(20));if(a>0){const px=X(hc[0]-hr*.7),py=Y(hc[1]+hr*.7);lab(px,py,[["Cèl·lula humana",true],["en cultiu (HeLa), ~20 µm",false,C.ink2]],Math.max(10,px-24),Math.max(30,py-22),"left",a)}
    a=vis(R(7.5));if(a>0){const px=X(rc[0]+rr*.7),py=Y(rc[1]+rr*.7);lab(px,py,[["Glòbul vermell",true],["7–8 µm",false,C.ink2]],Math.min(W-10,px+20),Math.max(30,py-22),px+20>W-120?"right":"left",a)}
    a=vis(R(2));if(a>0){const px=X(-.8),py=Y(-.85);lab(px,py,[["Bacteri E. coli",true],["2 µm de llarg, 1 µm d'ample",false,C.ink2]],Math.max(10,px-10),Math.min(H-34,py+26),"left",a)}
    a=vis(sNm*245);if(a>0){const px=X(.25)+sNm*45,py=Y(0)-sNm*190;lab(px,py,[["Fag T4",true],["uns 0,2 µm d'alt",false,C.ink2]],Math.min(W-10,px+36),Math.max(30,py-16),"left",a)}
    /* scale bar */
    const bv=niceBar(k.W),bw=bv*s,bx=14,by=H-16;c.fillStyle=C.ink;c.fillRect(bx,by,bw,2);c.fillRect(bx,by-4,1.2,6);c.fillRect(bx+bw-1.2,by-4,1.2,6);txt(c,[[fmtL(bv),true]],bx,by-8,"left",fs,1);
    nameEl.textContent=P[k.near].n;valEl.textContent="Amplada de la imatge: "+fmtL(k.W);
    [...seg.children].forEach((b,i)=>b.setAttribute("aria-pressed",String(i===k.near)));
  }
  function setZ(v){z=clamp(v,0,1);rng.value=Math.round(z*1000);const k=cam(z);rng.setAttribute("aria-valuetext",P[k.near].n+", amplada de la imatge "+fmtL(k.W));dirty=true}
  rng.addEventListener("input",()=>{anim=null;setZ(+rng.value/1000)});
  const zOf=i=>(Math.log10(P[i].W)-L0)/(L1-L0);
  seg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const to=zOf(+b.dataset.i);if(RM){setZ(to);return}anim={from:z,to,t0:performance.now(),dur:1400}});
  play.addEventListener("click",()=>{if(RM){setZ(z<.5?1:0);return}anim={from:0,to:1,t0:performance.now(),dur:7000}});
  onFrame(now=>{if(!auto&&VIS.scale&&cv.getBoundingClientRect().top<innerHeight*.55){auto=true;if(!RM)anim={from:0,to:1,t0:now+500,dur:7000}}
    if(anim){const p=clamp((now-anim.t0)/anim.dur,0,1);setZ(lerp(anim.from,anim.to,ease(p)));if(p>=1)anim=null}
    if(dirty&&VIS.scale!==false){dirty=false;draw()}});
  addEventListener("resize",()=>{dirty=true});
})();

/* ================= 2. infection scrolly ================= */
(function(){
  const cv=document.getElementById("inf");if(!cv)return;
  const steps=document.getElementById("isteps"),graphic=document.getElementById("igraphic"),nameEl=document.getElementById("iName"),clockEl=document.getElementById("iClock"),seg=document.getElementById("iSeg"),playB=document.getElementById("iPlay");
  vio.observe(cv);
  let W=0,H=0,c;
  function layout(){W=cv.parentElement.clientWidth;if(!W)return;H=mob()?Math.round(clamp(innerHeight*.4,220,360)):Math.round(clamp(Math.min(innerHeight-210,W*.78),320,600));c=setup(cv,W,H)}
  onLayout(layout);layout();
  /* scenes */
  const SC=[
   {n:"El fag T4",cam:[0,170,600],dur:1},
   {n:"L'aterratge",cam:[0,90,560],dur:2.4},
   {n:"La injecció",cam:[0,10,640],dur:3.2},
   {n:"El segrest",cam:[0,-420,3000],dur:3},
   {n:"La fàbrica",cam:[0,-470,2900],dur:6},
   {n:"L'esclat",cam:[0,-470,4600],dur:4.5},
   {n:"El fag lambda s'amaga",cam:[0,-420,3000],dur:4},
   {n:"Un passatger que viatja gratis",cam:[0,-500,6200],dur:5},
   {n:"Despertar: torna el cicle lític",cam:[0,-420,4900],dur:6}];
  const clockTxt=[null,"Minut 0","Inici de la infecció","Primers minuts","Minut 15: primer fag complet","Cap al minut 30",null,null,null];
  let scene=0,sceneT0=performance.now(),mode="scroll",playSeq=null,camC={x:0,y:150,w:520},camFrom=null,camT0=0;
  /* progeny positions inside the cell (capsule centred at (0,-500), 2000 x 1000 nm) */
  function rnd(seed){let a=seed;return()=>{a=(a*16807)%2147483647;return(a-1)/2147483646}}
  const PG=[];{const r=rnd(11);while(PG.length<120){const x=(r()*2-1)*900,y=-500+(r()*2-1)*400;const dx=Math.max(0,Math.abs(x)-500);if(dx*dx+(y+500)*(y+500)>420*420)continue;PG.push({x,y,rot:(r()-.5)*Math.PI*2,vx:x/900,vy:(y+500)/400})}}
  const FRAG=[];{for(let i=0;i<18;i++){const a=i/18*6.2832;FRAG.push({a})}}
  const lamPG=[];{const r=rnd(5);while(lamPG.length<60){const x=(r()*2-1)*900,y=-500+(r()*2-1)*400;const dx=Math.max(0,Math.abs(x)-500);if(dx*dx+(y+500)*(y+500)>420*420)continue;lamPG.push({x,y,rot:(r()-.5)*Math.PI*2})}}
  function setScene(i,keepMode){if(i===scene&&!keepMode)return;camFrom={...camC};camT0=performance.now();scene=i;sceneT0=performance.now();nameEl.textContent=SC[i].n;clockEl.textContent=clockTxt[i]||(i>=6?"":"");}
  /* geometry helpers */
  let s=1,cx=0,cy=0;const X=x=>W/2+(x-cx)*s,Y=y=>H/2-(y-cy)*s;
  function capsule(x0,y0,len,r,shrink){/* centred at x0,y0; total length len (nm), radius r; shrink= waist 0..1 for division */
    const hl=len/2-r;c.beginPath();if(!shrink){c.moveTo(X(x0-hl),Y(y0+r));c.lineTo(X(x0+hl),Y(y0+r));c.arc(X(x0+hl),Y(y0),r*s,-Math.PI/2,Math.PI/2);c.lineTo(X(x0-hl),Y(y0-r));c.arc(X(x0-hl),Y(y0),r*s,Math.PI/2,Math.PI*1.5);c.closePath();return}
    const N=80;const pts=[];for(let i=0;i<=N;i++){const t=i/N;const xx=x0-len/2+t*len;const u=(xx-x0)/(len/2);let hw=r;const ax=Math.abs(xx-x0)-hl;if(ax>0)hw=Math.sqrt(Math.max(0,r*r-ax*ax));hw*=1-shrink*Math.exp(-Math.pow(u/.12,2));pts.push([xx,hw])}
    c.moveTo(X(pts[0][0]),Y(y0));pts.forEach(p=>c.lineTo(X(p[0]),Y(y0+p[1])));for(let i=pts.length-1;i>=0;i--)c.lineTo(X(pts[i][0]),Y(y0-pts[i][1]));c.closePath()}
  function cell(x0,y0,len,shrink,alpha){c.save();c.globalAlpha=alpha==null?1:alpha;capsule(x0,y0,len,500,shrink);c.fillStyle=C.cyto;c.fill();c.strokeStyle=C.cold;c.lineWidth=Math.max(1.3,7*s);c.stroke();
    if(30*s>3&&!shrink){capsule(x0,y0,len-60,470);c.strokeStyle="rgba(44,93,168,.55)";c.lineWidth=Math.max(1,7*s);c.stroke();c.setLineDash([Math.max(2,6*s),Math.max(2,5*s)]);capsule(x0,y0,len-32,484);c.strokeStyle="rgba(44,93,168,.35)";c.lineWidth=Math.max(.8,4*s);c.stroke();c.setLineDash([])}
    c.restore()}
  /* chromosome loop */
  function chromo(x0,y0,sc,col,alpha,frag,pro){c.save();c.globalAlpha=alpha==null?1:alpha;c.strokeStyle=col||C.cold;c.lineWidth=Math.max(1.4,10*s);c.lineCap="round";
    const N=140,pt=i=>{const a=i/N*6.2832;const rx=560*sc,ry=230*sc;const w=1+.08*Math.sin(5*a)+.05*Math.sin(9*a+1);return[x0+Math.cos(a)*rx*w,y0+Math.sin(a)*ry*w]};
    if(frag){for(let i=0;i<N;i+=7){if(((i*37)%11)/11<frag)continue;c.beginPath();for(let j=0;j<=5;j++){const p=pt(i+j);j?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]))}c.stroke()}}
    else{c.beginPath();for(let i=0;i<=N;i++){const p=pt(i);i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]))}c.stroke()}
    if(pro){c.strokeStyle=C.warm;c.lineWidth=Math.max(2,14*s);c.beginPath();const i0=Math.round(N*.18),i1=Math.round(N*.18+N*.06*pro);for(let i=i0;i<=i1;i++){const p=pt(i);i===i0?c.moveTo(X(p[0]),Y(p[1])):c.lineTo(X(p[0]),Y(p[1]))}c.stroke()}
    c.restore();return pt(Math.round(N*.21))}
  function coil(x0,y0,r,a,seed,alpha){c.save();c.globalAlpha=alpha==null?1:alpha;c.strokeStyle=C.warm;c.lineWidth=Math.max(1.2,8*s);c.beginPath();for(let i=0;i<=90;i++){const u=i/90*6.2832;const px=x0+r*Math.sin(3*u+seed)*Math.cos(.5*u),py=y0+r*.7*Math.sin(4*u+seed*1.3);i?c.lineTo(X(px),Y(py)):c.moveTo(X(px),Y(py))}c.stroke();c.restore()}
  function label(px,py,lines,tx,ty,al,a){if(a<=0)return;const fs=mob()?10.5:12.5,n=lines.length;
    /* keep the whole text block inside the canvas */
    const y0=ty+(ty<py?-4-(n-1)*fs*1.25:fs),top=y0-fs,bot=y0+(n-1)*fs*1.25+3;let sh=0;if(top<4)sh=4-top;else if(bot>H-22)sh=H-22-bot;ty+=sh;
    let tw=0;lines.forEach(l=>{c.font=`${l[1]?"600 ":""}${fs}px ${SSF}`;tw=Math.max(tw,c.measureText(l[0]).width)});if(al==="left"&&tx+4+tw>W-4)tx=W-8-tw;if(al==="right"&&tx-4-tw<4)tx=tw+8;
    lead(c,px,py,tx,ty,C.ink2,a);txt(c,lines,tx+(al==="right"?-4:al==="center"?0:4),y0+sh,al,fs,a)}
  function draw(now){if(!W||!c)return;const t=RM?99:(now-sceneT0)/1000,p=clamp(t/SC[scene].dur,0,1),fs=mob()?10.5:12.5,M=mob();
    /* camera */
    const tg=SC[scene].cam;const ct=camFrom&&!RM?ease((now-camT0)/1100):1;const cf=camFrom||{x:tg[0],y:tg[1],w:tg[2]};
    camC={x:lerp(cf.x,tg[0],ct),y:lerp(cf.y,tg[1],ct),w:Math.exp(lerp(Math.log(cf.w),Math.log(tg[2]),ct))};if(ct>=1)camFrom=null;
    const vw=camC.w*(M?1.05:1);s=W/vw;cx=camC.x;cy=camC.y;
    c.clearRect(0,0,W,H);
    const sc=scene;
    if(sc<=5){
      /* ---- lytic (T4) ---- */
      const burst=sc===5?ease(clamp((t-1.2)/2.2,0,1)):0;
      if(burst<1)cell(0,-500,2000,0,1-burst);
      /* host chromosome */
      if(sc<=4){const frag=sc===3?ease(p)*.85:sc===4?.9:0;chromo(0,-560,1,C.cold,sc>=3?1-.55*(sc===3?ease(p):1):1,frag)}
      /* T4 on/above the surface */
      let land=sc===0?0:sc===1?ease(clamp(t/1.6,0,1)):1,legs=sc===0?0:sc===1?ease(clamp((t-.6)/1.4,0,1)):1,k=sc<2?0:sc===2?ease(clamp(t/1.2,0,1)):1;
      const py=lerp(140,0,land),bob=sc===0&&!RM?Math.sin(now/700)*4:0;
      const emptyHead=sc>=3||(sc===2&&t>2.6);
      const g=drawT4(c,X(0),Y(py+bob),s,{k,legs,empty:emptyHead,a:sc===5?1-burst:1});
      /* DNA injection */
      if(sc===2){const q=clamp((t-1)/1.8,0,1);if(q>0){c.save();c.strokeStyle=C.warm;c.lineWidth=Math.max(1.6,3*s);c.beginPath();const L=q*360;c.moveTo(X(0),Y(-20));for(let d=0;d<=L;d+=6){const yy=-20-d*.55,xx=Math.sin(d*.05)*(18+d*.12);c.lineTo(X(xx),Y(yy))}c.stroke();c.restore()}}
      if(sc>=3&&sc<=4){coil(-40,-170,120,1,0,1)}
      if(sc===4||sc===5){/* replication + assembly */
        const nCopies=sc===4?Math.floor(lerp(1,7,clamp(t/2.5,0,1))):7;for(let i=1;i<nCopies;i++){coil(-700+i*190,-470+((i*53)%140)-70,90,1,i*1.7,sc===5?1-burst:.9)}
        const nParts=sc===4?Math.floor(lerp(0,26,clamp((t-.5)/2,0,1))):0;for(let i=0;i<nParts;i++){const pp=PG[(i*7)%120];const f=i%2?miniHead:miniTail;f(c,X(pp.x*.9+60),Y(pp.y+40),s*.95,pp.rot+1,.5)}
        const nDone=sc===4?Math.floor(120*clamp((t-1.6)/4,0,1)*.55):Math.floor(lerp(66,120,clamp(t/1.1,0,1)));
        for(let i=0;i<nDone;i++){const pp=PG[i];let x=pp.x,y=pp.y,a=1;if(sc===5){const f=burst*620+(RM?0:Math.min(60,Math.max(0,t-3.4)*12));x+=pp.vx*f;y+=pp.vy*f*1.3+(pp.vy>0?1:-1)*f*.25;a=1}miniT4(c,X(x),Y(y),s*.95,pp.rot,a)}
        if(sc===4)clockEl.textContent=t<1.6?"Abans del minut 15":"Minut "+Math.round(15+nDone/8)+" · "+nDone+" fags";if(sc===5)clockEl.textContent=burst>0?"Cap al minut 30: lisi":"Minut "+Math.round(15+nDone/8)+" · "+nDone+" fags";
        if(sc===5&&burst>0){/* membrane fragments */c.save();c.strokeStyle=C.cold;c.lineWidth=Math.max(1.3,7*s);c.globalAlpha=1-burst*.8;FRAG.forEach((f,i)=>{const a0=f.a,a1=a0+.25;const d=burst*500;const ox=Math.cos(a0+.12)*d,oy=Math.sin(a0+.12)*d*.7;c.beginPath();for(let j=0;j<=6;j++){const a=a0+(a1-a0)*j/6;const xx=Math.cos(a)*1000*.98+ox,yy=-500+Math.sin(a)*500*.98+oy;j?c.lineTo(X(xx),Y(yy)):c.moveTo(X(xx),Y(yy))}c.stroke()});c.restore()}
      }
      /* annotations */
      const la=k=>clamp((t-k)/.5,0,1);
      if(sc===0){const hx=X(0),M2=M;
        label(hx+42*s,Y(140+27+92.5+8+75),[["Cap · 115 × 85 nm",true],["guarda l'ADN: unes 169.000 lletres",false,C.ink2]],hx+(M2?60:110)*s+20,Y(140+27+92.5+8+100),"left",la(.1));
        label(hx+13*s,Y(140+27+45),[["Cua amb beina · 92,5 nm",true]],hx-(M2?60:120)*s-20,Y(140+27+70),"right",la(.3));
        label(hx+26*s,Y(140+10),[["Placa basal",true]],hx+(M2?60:110)*s+16,Y(140+40),"left",la(.5));
        label(hx-38*s,Y(140+70),[["Sis fibres · 145 nm",true],["els sensors",false,C.ink2]],hx-(M2?60:120)*s-20,Y(140+-10),"right",la(.7));
        label(W*.5+(M?70:150)*s,Y(-4),[["Paret del bacteri",true,C.cold]],W*.5+(M?110:190)*s,Y(60),"left",la(.9));
      }
      if(sc===1){label(X(110),Y(2),[["Les fibres reconeixen",true],["una molècula de la paret",false,C.ink2]],X(150),Y(120),"left",la(1.6));label(X(-30),Y(15),[["La placa passa",true],["d'hexàgon a estrella",false,C.ink2]],X(-140),Y(110),"right",la(2))}
      if(sc===2){label(X(15),Y(27+35),[["La beina es contrau",true],["de 92,5 a 42 nm",false,C.ink2]],X(140),Y(160),"left",la(1));label(X(5),Y(-80),[["L'ADN del fag",true,C.warm],["entra a la cèl·lula",false,C.ink2]],X(-120),Y(-170),"right",la(1.6))}
      if(sc===3){label(X(-40),Y(-170),[["ADN del fag",true,C.warm]],X(-500),Y(-90),"right",la(.4));label(X(350),Y(-640),[["ADN del bacteri,",true,C.cold],["trossejat",false,C.ink2]],X(780),Y(-980),"left",la(1.2))}
      if(sc===4&&t>1.6){label(X(PG[0].x),Y(PG[0].y),[["Fags nous",true],["muntats a dins",false,C.ink2]],X(PG[0].x)+(X(PG[0].x)>W/2?-50:50),Y(-1080),X(PG[0].x)>W/2?"right":"left",la(1.8))}
      if(sc===5&&burst>.6)txt(c,[["Un centenar llarg de fags nous",true],["a punt per infectar altres bacteris",false,C.ink2]],W/2,M?18:28,"center",fs,clamp((burst-.6)/.3,0,1));
    } else {
      /* ---- lysogenic (lambda) ---- */
      if(sc===6){cell(0,-500,2000,0,1);const ins=ease(clamp((t-1.2)/2.2,0,1));const tip=chromo(0,-560,1,C.cold,1,0,ins);
        drawLambda(c,X(150),Y(0),s,{empty:t>1.2});
        if(t<3.4){const q=clamp((t-.4)/1.6,0,1);c.save();c.strokeStyle=C.warm;c.lineWidth=Math.max(1.6,8*s);c.globalAlpha=1-ins;c.beginPath();c.moveTo(X(150),Y(-30));const ex=lerp(150,tip[0],q),ey=lerp(-30,tip[1],q);c.quadraticCurveTo(X(lerp(150,ex,.5)+120),Y(lerp(-30,ey,.5)),X(ex),Y(ey));c.stroke();c.restore()}
        const la=clamp((t-3)/.6,0,1);label(X(tip[0]),Y(tip[1]),[["Pròfag",true,C.warm],["l'ADN del virus, dins del cromosoma",false,C.ink2]],X(tip[0])+(M?20:60),Y(-1150),"left",la);
        label(X(150),Y(150),[["Fag lambda",true]],X(150)+(M?40:80),Y(330),"left",clamp(t/.5,0,1)*(1-la*.0));
      }
      if(sc===7){/* growth then division */
        const g=ease(clamp(t/2,0,1)),d=ease(clamp((t-2)/1.8,0,1)),sep=ease(clamp((t-3.6)/1.2,0,1));
        if(sep<=0){const len=lerp(2000,4000,g);cell(0,-500,len,d*.98,1);chromo(-len/4*g*1.0,-560,1,C.cold,1,0,1);if(g>.3)chromo(len/4,-560,1,C.cold,clamp((g-.3)/.4,0,1),0,1)}
        else{const off=lerp(1000,1150,sep);[-1,1].forEach(sg=>{cell(sg*off,-500,2000,0,1);chromo(sg*off,-560,1,C.cold,1,0,1)})}
        label(X((sep>0?1150:1000)+139),Y(-337),[["Les dues filles",true],["hereten el pròfag",false,C.ink2]],X(1700),Y(-1250),"left",clamp((t-4.2)/.5,0,1));
        clockEl.textContent=sep>0?"1 generació després":"";
      }
      if(sc===8){/* induction in the left cell */
        const uv=clamp(t/1.2,0,1),ex=ease(clamp((t-1.2)/1.2,0,1)),rep=clamp((t-2.4)/2,0,1),burst=ease(clamp((t-4.4)/1.4,0,1));
        cell(1150,-500,2000,0,1);chromo(1150,-560,1,C.cold,1,0,1);
        if(burst<1)cell(-1150,-500,2000,0,1-burst);
        chromo(-1150,-560,1,C.cold,1-burst,0,1-ex);
        /* UV rays */
        if(t<3){c.save();c.strokeStyle=C.uv;c.lineWidth=2;c.globalAlpha=Math.sin(Math.min(1,uv)*Math.PI)*(t<3?1:0);for(let i=0;i<4;i++){const x0=-1700+i*300,y0=900;c.beginPath();c.moveTo(X(x0),Y(y0));for(let j=1;j<=6;j++){c.lineTo(X(x0+j*45+(j%2?40:-40)),Y(y0-j*170))}c.stroke()}c.restore()}
        if(ex>0&&burst<1){coil(-1150-300,-420,90,1,0,ex*(1-burst))}
        const nL=Math.floor(60*rep);for(let i=0;i<nL;i++){const q=lamPG[i];let x=q.x-1150,y=q.y;if(burst>0){const f=burst*1000;x+=q.x/900*f;y+=(q.y+500)/400*f}miniLambda(c,X(x),Y(y),s*.9,q.rot,1)}
        if(burst>0){c.save();c.strokeStyle=C.cold;c.lineWidth=Math.max(1.3,7*s);c.globalAlpha=1-burst*.8;FRAG.forEach(f=>{const a0=f.a,a1=a0+.25,d=burst*500,ox=Math.cos(a0+.12)*d,oy=Math.sin(a0+.12)*d*.7;c.beginPath();for(let j=0;j<=6;j++){const a=a0+(a1-a0)*j/6,xx=-1150+Math.cos(a)*1000*.98+ox,yy=-500+Math.sin(a)*500*.98+oy;j?c.lineTo(X(xx),Y(yy)):c.moveTo(X(xx),Y(yy))}c.stroke()});c.restore()}
        label(X(-1500),Y(400),[["Llum ultraviolada",true,C.uv]],X(-1500),Y(850),"left",clamp(t/.4,0,1)*(t<3.2?1:clamp((4-t)/.8,0,1)));
        label(X(-1450),Y(-420),[["El pròfag se separa",true,C.warm],["i es multiplica",false,C.ink2]],X(-200),Y(-1250),"left",clamp((t-1.6)/.5,0,1)*(1-burst));
        label(X(1150+400),Y(-300),[["Aquest bacteri no ha patit cap dany:",false,C.ink2],["el pròfag continua adormit",false,C.ink2]],X(1150),Y(320),"center",clamp((t-2)/.5,0,1));
        clockEl.textContent=burst>0?"Lisi":ex>0?"Dany a l'ADN":"";
      }
    }
    /* scale bar (nm) */
    const cand=[2000,1000,500,200,100,50],bv=cand.find(v=>v*s<=W/4.5)||50,bw=bv*s,bx=12,by=H-12;c.fillStyle=C.ink;c.fillRect(bx,by,bw,2);c.fillRect(bx,by-4,1.2,6);c.fillRect(bx+bw-1.2,by-4,1.2,6);txt(c,[[(bv>=1000?fmtN(bv/1000,0)+" µm":bv+" nm"),true]],bx,by-7,"left",fs,1);
  }
  /* play mode */
  const SEQ={lit:[[0,1.8],[1,2.8],[2,3.4],[3,2.6],[4,6.2],[5,4.4]],lis:[[6,4.4],[7,5.4],[8,6.4]]};
  function setMode(m){[...seg.children].forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.c===m)));playSeq={m,t0:performance.now(),i:-1}}
  seg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;setMode(b.dataset.c)});
  playB.addEventListener("click",()=>{const cur=[...seg.children].find(b=>b.getAttribute("aria-pressed")==="true");setMode(cur?cur.dataset.c:"lit")});
  function runPlay(now){if(!playSeq)return;const seq=SEQ[playSeq.m];let tt=(now-playSeq.t0)/1000,i=0;while(i<seq.length-1&&tt>seq[i][1]){tt-=seq[i][1];i++}
    if(i!==playSeq.i){playSeq.i=i;setScene(seq[i][0],true)}
    if(i===seq.length-1&&tt>seq[i][1]+1.5){playSeq=null}}
  const stepEls=[...steps.querySelectorAll(".step")];
  IB.scrolly(steps,graphic,i=>{playSeq=null;[...seg.children].forEach(b=>b.setAttribute("aria-pressed","false"));if(i<=8)setScene(i,true);else{setMode("lit")}});
  onFrame(now=>{if(VIS.inf===false)return;runPlay(now);safe(draw,now)});
})();

/* ================= 3. sea scatter (real data) ================= */
(function(){
  const cv=document.getElementById("sea");if(!cv||!window.VIB_DATA)return;
  const D=VIB_DATA.sea,ST=VIB_DATA.seaStudies,tip=document.getElementById("seaTip"),box=document.getElementById("seaBox"),seg=document.getElementById("seaSeg"),nEl=document.getElementById("seaN");
  vio.observe(cv);
  const band=d=>d<100?0:d<1000?1:2,BC=[C.cold,C.coldL,C.dry];
  const P=D.map(r=>({b:r[0],v:r[1],d:r[2],s:r[3],k:band(r[2])}));
  /* draw order: deep first, shallow on top; random within band so studies mix */
  const order=P.map((p,i)=>i).sort((a,b)=>(P[b].k-P[a].k)||(((a*2654435761)>>>0)%997-((b*2654435761)>>>0)%997));
  const med=[0,1,2].map(k=>{const q=P.filter(p=>p.k===k);const m=a=>{a=a.slice().sort((x,y)=>x-y);return a[a.length>>1]};return{b:m(q.map(p=>p.b)),v:m(q.map(p=>p.v)),n:q.length}});
  let W=0,H=0,c,filt="all",shown=0,a0=null,dirty=true,qt=null,X,Y,hov=-1;
  const m={l:62,r:24,t:16,b:44};
  /* pooled log-log least-squares fit of the 5,508 corrected records (own calculation): log10 V = 2.7732 + 0.7010 log10 B, r² = 0.62 */
  const TR0=2.7732,TR1=.7010;
  function layout(){W=cv.parentElement.clientWidth;if(!W)return;H=Math.round(clamp(W*(mob()?1.05:.6),300,560));c=setup(cv,W,H);const M=mob();m.l=M?44:62;m.r=M?10:24;
    X=d3.scaleLinear().domain([3.6,7.4]).range([m.l,W-m.r]);Y=d3.scaleLinear().domain([5,8.9]).range([H-m.b,m.t]);
    qt=d3.quadtree().x(i=>X(P[i].b)).y(i=>Y(P[i].v)).addAll(P.map((p,i)=>i));dirty=true}
  onLayout(layout);layout();
  const lab10=e=>({4:"10.000",5:"100.000",6:"1 milió",7:"10 milions",8:"100 milions",9:"1.000 milions"}[e]||"");
  function draw(){if(!W||!c)return;const M=mob(),fs=M?10.5:12;c.clearRect(0,0,W,H);
    c.font=`${fs}px ${SSF}`;c.fillStyle=C.muted;c.strokeStyle=C.hair;c.lineWidth=1;
    for(let e=4;e<=7;e++){const x=X(e);c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke();c.textAlign="center";c.fillText(M&&e===4?"10 mil":lab10(e),x,H-m.b+16)}
    for(let e=5;e<=8;e++){const y=Y(e);c.beginPath();c.moveTo(m.l,y);c.lineTo(W-m.r,y);c.stroke();c.textAlign="right";c.fillText(M?({5:"100 mil",6:"1 M",7:"10 M",8:"100 M"}[e]):lab10(e),m.l-6,y+4)}
    txt(c,[["Bacteris per mil·lilitre →",false,C.ink2]],W-m.r,H-8,"right",fs,1,false);
    txt(c,[["↑ Virus per mil·lilitre",false,C.ink2]],m.l+4,m.t+fs,"left",fs,1);
    /* ratio lines */
    c.save();c.beginPath();c.rect(m.l,m.t,W-m.l-m.r,H-m.t-m.b);c.clip();
    [[0,"1 virus per bacteri"],[1,"10 per bacteri"],[2,"100 per bacteri"]].forEach(([r,l])=>{c.setLineDash([4,4]);c.strokeStyle=C.muted;c.lineWidth=1;c.beginPath();c.moveTo(X(3.6),Y(3.6+r));c.lineTo(X(7.4),Y(7.4+r));c.stroke();c.setLineDash([])});
    /* points */
    const n=Math.floor(shown);const rad=M?1.3:1.7;
    for(let j=0;j<n;j++){const i=order[j],p=P[i];const on=filt==="all"||+filt===p.k;c.globalAlpha=on?.5:.06;c.fillStyle=BC[p.k];c.beginPath();c.arc(X(p.b),Y(p.v),rad,0,6.2832);c.fill()}
    c.globalAlpha=1;
    /* pooled trend (own calculation) */
    if(shown>=P.length){c.strokeStyle=C.ink;c.lineWidth=1.6;c.beginPath();c.moveTo(X(3.9),Y(TR0+TR1*3.9));c.lineTo(X(7.2),Y(TR0+TR1*7.2));c.stroke()}
    c.restore();
    /* ratio labels at the edge */
    [[0,"1 per bacteri"],[1,"10 per bacteri"],[2,"100 per bacteri"]].forEach(([r,l])=>{let xe=Math.min(7.4,8.9-r-.08);const x=X(xe),y=Y(xe+r);c.save();c.translate(Math.min(x,W-m.r)-4,Math.max(y,m.t)+(xe<7.4?14:-4));const ang=Math.atan2(Y(1)-Y(0),X(1)-X(0));c.rotate(ang);txt(c,[[l,false,C.ink2]],0,0,"right",fs-1,1);c.restore()});
    if(shown>=P.length){/* medians */
      med.forEach((md,k)=>{if(filt!=="all"&&+filt!==k)return;const x=X(md.b),y=Y(md.v);c.fillStyle="#fff";c.beginPath();c.arc(x,y,6,0,6.2832);c.fill();c.strokeStyle=C.ink;c.lineWidth=2;c.stroke();c.fillStyle=BC[k];c.beginPath();c.arc(x,y,3.6,0,6.2832);c.fill()});
      const md=med[0];if(filt==="all"||filt==="0"){const x=X(md.b),y=Y(md.v);lead(c,x-4,y-5,x-(M?16:40),y-(M?46:64),C.ink2,1);txt(c,[["Mediana, 0–100 m",true],[M?"6,8 M virus · 540.000 bact.":"6,8 M de virus · 540.000 bacteris",false,C.ink2]],x-(M?12:36),y-(M?52:70)-12,"right",fs,1)}
      const m2=med[2];if(filt==="all"||filt==="2"){const x=X(m2.b),y=Y(m2.v);if(M){lead(c,x-3,y-5,x-10,y-58,C.ink2,1);txt(c,[["Mediana, més de 1.000 m",true],["36 virus per bacteri",false,C.ink2]],x-24,y-58-fs*1.25-4,"left",fs,1)}else{lead(c,x-5,y+4,x-26,y+52,C.ink2,1);txt(c,[["Mediana, més de 1.000 m",true],["36 virus per bacteri",false,C.ink2]],x-22,y+52+fs+2,"left",fs,1)}}
      if(!M||W>420){const xe=6.3,y=Y(TR0+TR1*xe);txt(c,[["Tendència de totes",true],["les mesures (càlcul propi)",false,C.ink2]],X(xe)+6,y+22,"left",fs,1)}
    }
    if(hov>=0){const p=P[hov];c.strokeStyle=C.ink;c.lineWidth=1.5;c.beginPath();c.arc(X(p.b),Y(p.v),4.5,0,6.2832);c.stroke()}
  }
  function showTip(i,mx,my){if(i<0){tip.style.opacity=0;return}const p=P[i],B=Math.pow(10,p.b),V=Math.pow(10,p.v);
    const f=v=>v>=1e6?fmtN(v/1e6,1)+" milions":fmtN(Math.round(v/100)*100,0);
    tip.innerHTML=`<b>${ST[p.s]}</b><br>${fmtN(p.d,p.d<10?1:0)} m de fondària<br>${f(V)} virus/ml<br>${f(B)} bacteris/ml<br>${fmtN(V/B,V/B<10?1:0)} virus per bacteri`;
    tip.style.opacity=1;const tw=tip.offsetWidth,th=tip.offsetHeight;let x=mx+14,y=my-th-10;if(x+tw>W)x=mx-tw-14;if(y<0)y=my+14;tip.style.transform=`translate(${Math.max(0,x)}px,${y}px)`}
  function pick(e){const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=-1,bd=14;qt.visit((nd,x0,y0,x1,y1)=>{if(!nd.length){do{const i=nd.data;const p=P[i];if(filt!=="all"&&+filt!==p.k)continue;const d=Math.hypot(X(p.b)-mx,Y(p.v)-my);if(d<bd){bd=d;best=i}}while(nd=nd.next)}return x0>mx+bd||x1<mx-bd||y0>my+bd||y1<my-bd});hov=best;showTip(best,mx,my);dirty=true}
  cv.addEventListener("pointermove",pick);cv.addEventListener("pointerdown",pick);cv.addEventListener("pointerleave",e=>{if(e.pointerType!=="mouse")return;hov=-1;showTip(-1);dirty=true});
  /* touch: a tap elsewhere closes the tooltip */
  document.addEventListener("pointerdown",e=>{if(e.target!==cv&&hov>=0){hov=-1;showTip(-1);dirty=true}});
  seg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;filt=b.dataset.d;[...seg.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    nEl.textContent=filt==="all"?"Totes les fondàries":({0:"0–100 m",1:"100–1.000 m",2:"Més de 1.000 m"}[filt])+" · "+fmtN(med[+filt].n,0)+" mostres";hov=-1;showTip(-1);dirty=true});
  onFrame(now=>{if(VIS.sea&&a0===null){a0=now;if(RM)shown=P.length}
    if(a0!==null&&shown<P.length){shown=Math.min(P.length,P.length*ease((now-a0)/2200));dirty=true}
    if(dirty&&VIS.sea!==false){dirty=false;draw()}});
})();

/* ================= 4. viral shunt (schematic; direction of change after Weitz et al. 2015) ================= */
(function(){
  const cv=document.getElementById("shunt");if(!cv)return;const seg=document.getElementById("shSeg");vio.observe(cv);
  let W=0,H=0,c,vir=1,virA=1;
  /* node positions in a 1000 x 390 frame (desktop) or 400 x 560 (mobile) */
  const ND={fito:{n:["Algues","microscòpiques"],d:[140,100],m:[78,72]},zoo:{n:["Zooplàncton","i protists"],d:[500,100],m:[322,72]},peix:{n:["Peixos"],d:[860,100],m:[322,262]},dom:{n:["Matèria orgànica","dissolta"],d:[300,300],m:[78,448]},bac:{n:["Bacteris"],d:[700,300],m:[322,448]}};
  /* illustrative fluxes [without viruses, with viruses]; v = flux caused by viral lysis */
  const ED=[{a:"fito",b:"zoo",f:[60,46],bend:-26},{a:"zoo",b:"peix",f:[24,17],bend:-26},{a:"fito",b:"dom",f:[30,30],bend:22},{a:"dom",b:"bac",f:[30,68],bend:34},{a:"bac",b:"zoo",f:[22,14],bend:22},
    {a:"fito",b:"dom",f:[0,22],bend:-58,v:1},{a:"bac",b:"dom",f:[0,24],bend:74,v:1}];
  let F={w:1000,h:390},S=1,O=[0,0];
  function layout(){W=cv.parentElement.clientWidth;if(!W)return;const M=mob();F=M?{w:400,h:560}:{w:1000,h:390};S=W/F.w;if(M&&S>1.25){S=1.25;O=[(W-F.w*S)/2,0]}else O=[0,0];H=Math.round(F.h*S);c=setup(cv,W,H)}
  onLayout(layout);layout();
  const pos=k=>{const p=mob()?ND[k].m:ND[k].d;return[O[0]+p[0]*S,O[1]+p[1]*S]};
  function curve(e){const a=pos(e.a),b=pos(e.b);const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;const nx=-dy/L,ny=dx/L;const bd=e.bend*S*(mob()?.8:1);return[a,[mx+nx*bd,my+ny*bd],b]}
  const qp=(q,t)=>{const u=1-t;return[u*u*q[0][0]+2*u*t*q[1][0]+t*t*q[2][0],u*u*q[0][1]+2*u*t*q[1][1]+t*t*q[2][1]]};
  const flux=e=>lerp(e.f[0],e.f[1],virA);
  /* particles: packets of carbon that leave the algae and follow the edges with probability proportional to flux */
  const parts=[];function choose(node){const out=ED.map((e,i)=>({e,i})).filter(o=>o.e.a===node);let tot=0;const ws=out.map(o=>{const w=flux(o.e);tot+=w;return w});
    /* part of what reaches each node stays there (respiration, growth): */const keep=node==="zoo"?28:node==="bac"?22:node==="dom"?0:0;tot+=keep;
    if(tot<=0)return -1;let r=Math.random()*tot;for(let k=0;k<out.length;k++){r-=ws[k];if(r<=0)return out[k].i}return -1}
  let emit=0;
  function step(dt){virA+=(vir-virA)*Math.min(1,dt*2.5);emit+=dt*(RM?0:lerp(8,9.5,virA));while(emit>1){emit--;const i=choose("fito");if(i>=0)parts.push({e:i,t:0,sp:.3+Math.random()*.12})}
    for(let k=parts.length-1;k>=0;k--){const p=parts[k];p.t+=dt*p.sp;if(p.t>=1){const nd=ED[p.e].b;if(nd==="peix"){parts.splice(k,1);continue}const ni=choose(nd);if(ni<0){parts.splice(k,1);continue}p.e=ni;p.t=0}}
    if(parts.length>600)parts.splice(0,parts.length-600)}
  const NR=()=>34*Math.min(1.15,Math.max(.8,S*1.1));
  function icon(k,x,y){c.save();c.translate(x,y);const r=NR()*.78;c.lineWidth=1.6;
    if(k==="fito"){c.strokeStyle=C.bio;c.fillStyle="rgba(76,138,46,.18)";[[-10,-4,9],[8,-8,7],[4,10,8],[-8,12,5]].forEach(([a,b,rr])=>{c.beginPath();c.arc(a*r/22,b*r/22,rr*r/22,0,6.2832);c.fill();c.stroke()})}
    if(k==="zoo"){c.strokeStyle=C.ink2;c.fillStyle="rgba(0,0,0,.06)";c.beginPath();c.ellipse(0,0,16*r/22,9*r/22,-.3,0,6.2832);c.fill();c.stroke();c.beginPath();c.moveTo(-10*r/22,-6*r/22);c.lineTo(-22*r/22,-18*r/22);c.moveTo(-6*r/22,-8*r/22);c.lineTo(-12*r/22,-22*r/22);c.moveTo(14*r/22,4*r/22);c.lineTo(22*r/22,12*r/22);c.stroke()}
    if(k==="peix"){c.strokeStyle=C.ink2;c.fillStyle="rgba(0,0,0,.06)";c.beginPath();c.moveTo(-20*r/22,0);c.quadraticCurveTo(0,-14*r/22,18*r/22,0);c.quadraticCurveTo(0,14*r/22,-20*r/22,0);c.moveTo(-20*r/22,0);c.lineTo(-30*r/22,-9*r/22);c.lineTo(-30*r/22,9*r/22);c.closePath();c.fill();c.stroke()}
    if(k==="dom"){c.fillStyle=C.bio;for(let i=0;i<22;i++){const a=i*2.4,rr=(i%7+2)*2.6*r/22;c.globalAlpha=.55;c.beginPath();c.arc(Math.cos(a)*rr,Math.sin(a)*rr*.7,1.8,0,6.2832);c.fill()}}
    if(k==="bac"){c.fillStyle=C.cyto;c.strokeStyle=C.cold;[[-8,-6,.3],[8,4,-.5],[-2,10,1.2]].forEach(([a,b,ro])=>{c.save();c.translate(a*r/22,b*r/22);c.rotate(ro);c.beginPath();c.roundRect(-11*r/22,-5*r/22,22*r/22,10*r/22,5*r/22);c.fill();c.stroke();c.restore()})}
    c.restore()}
  /* notes that say which way each flux changes when viruses are present */
  const NOTES=[{e:1,t:.5,d:[0,-20],m:[-14,0],al:"center",mal:"right",l:[["↓ Menys carboni","arriba als peixos"]]},
    {e:3,t:.5,d:[0,34],m:[0,30],al:"center",mal:"center",l:[["↑ Més carboni es recicla","entre els microbis"]]},
    {n:"fito",d:[0,-50],m:[0,-40],al:"center",mal:"center",l:[["↑ Les algues","produeixen més"]]}];
  function draw(){if(!W||!c)return;const M=mob(),fs=M?11:12.5,nr=NR();c.clearRect(0,0,W,H);
    const ws=Math.max(.7,Math.min(1.15,S*1.1))*(M?.85:1);
    ED.forEach((e,i)=>{const w=flux(e);if(w<=.3)return;const q=curve(e);c.save();c.globalAlpha=e.v?Math.min(1,virA*1.2):1;c.strokeStyle=e.v?"rgba(200,68,42,.35)":"#E2E0DA";c.lineWidth=Math.max(1.5,w*.42*ws);c.lineCap="butt";c.beginPath();c.moveTo(...q[0]);c.quadraticCurveTo(...q[1],...q[2]);c.stroke();
      const pt=qp(q,.6),pn=qp(q,.64),ang=Math.atan2(pn[1]-pt[1],pn[0]-pt[0]);c.fillStyle=e.v?C.warm:"#A9A69E";c.translate(pt[0],pt[1]);c.rotate(ang);const ah=Math.max(5,w*.24*ws);c.beginPath();c.moveTo(ah*1.3,0);c.lineTo(-ah*.7,-ah);c.lineTo(-ah*.7,ah);c.closePath();c.fill();c.restore();
      if(e.v){const vp=qp(q,e.b==="dom"&&e.a==="bac"?.24:.38);miniT4(c,vp[0],vp[1],.17*Math.max(.8,S),.5,Math.min(1,virA*1.2))}});
    for(const p of parts){const e=ED[p.e];const q=curve(e),xy=qp(q,p.t);c.fillStyle=e.v?C.warm:C.bio;c.globalAlpha=e.v?.9*virA+.1:.8;c.beginPath();c.arc(xy[0],xy[1],2.6,0,6.2832);c.fill()}c.globalAlpha=1;
    Object.keys(ND).forEach(k=>{const [x,y]=pos(k);c.fillStyle="#fff";c.beginPath();c.arc(x,y,nr,0,6.2832);c.fill();c.strokeStyle=C.hair;c.lineWidth=1;c.stroke();icon(k,x,y);txt(c,ND[k].n.map((l,i)=>[l,i===0]),x,y+nr+fs+3,"center",fs,1)});
    if(virA>.05){const q=curve(ED[6]),vp=qp(q,.5);txt(c,[["Curtcircuit viral",true,C.warm],["els virus fan esclatar",false,C.ink2],["algues i bacteris",false,C.ink2]],vp[0],vp[1]-(M?44:40),"center",fs,Math.min(1,virA*1.2))}
    /* change notes, shown with viruses */
    if(virA>.05)NOTES.forEach(nt=>{let x,y;if(nt.e!=null){const p=qp(curve(ED[nt.e]),nt.t);x=p[0];y=p[1]}else{[x,y]=pos(nt.n)}const o=M?nt.m:nt.d;const al=M?nt.mal:nt.al;
      txt(c,[[nt.l[0][0],true,C.warm],[nt.l[0][1],false,C.ink2]],x+o[0]*S,y+o[1]*S-(o[1]<0?fs*1.25:0),al,fs,Math.min(1,virA*1.2))});
    txt(c,[["● paquet de carboni",false,C.bio]],W-6,H-6,"right",fs-1,1);
  }
  seg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;vir=+b.dataset.v;[...seg.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)))});
  let warm=false;
  onFrame((now,dt)=>{if(!VIS.shunt)return;if(!warm){warm=true;for(let i=0;i<300;i++)step(1/30)}step(RM?0:dt);if(RM)virA=vir;draw()});
})();

/* ================= reading time ================= */
(()=>{const n=[...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")].filter(e=>!e.closest(".fn")).reduce((a,e)=>a+(e.textContent.match(/[\p{L}\p{N}·'’]+/gu)||[]).length,0);
 const figs=document.querySelectorAll("canvas[role=img],svg[role=img]").length;let sec=n/218*60;for(let i=0;i<figs;i++)sec+=Math.max(3,12-i);
 const el=document.getElementById("rt");if(el)el.textContent=Math.max(1,Math.round(sec/60))+" min de lectura"})();
})();
