/* «La guerra invisible» — gràfics 2: sistemes de defensa, CRISPR pas a pas, simulació de la memòria, línia del temps. */
(function(){
"use strict";
const V=window.VIB;if(!V)return;
const {C,SSF,RM,mob,clamp,lerp,ease,sm,safe,setup,txt,lead,VIS,vio,onFrame,onLayout,fmtN}=V;

/* ================= 1. defence systems (real data, Tesson et al. 2022) ================= */
(function(){
  const svg=d3.select("#def");if(svg.empty()||!window.VIB_DATA)return;
  const box=document.getElementById("defBox"),tip=document.getElementById("defTip"),seg=document.getElementById("defSeg"),title=document.getElementById("defTitle");
  vio.observe(document.getElementById("def"));
  const N=VIB_DATA.nGen,DEF=VIB_DATA.def.slice(0,25),HIST=VIB_DATA.hist;
  const DORON=new Set(["Thoeris","Hachiman","Shedu","Gabija","Septu","Lamassu","Zorya","Kiwa","Druantia","Wadjet"]);
  const NAME={RM:"Restricció-modificació",Cas:"CRISPR-Cas",Retron:"Retrons",Rst_PARIS:"PARIS",dGTPase:"dGTPasa"};
  const DESC={RM:"Tisores que tallen l'ADN que no porta l'etiqueta química del bacteri.",Cas:"Memòria adaptativa: guarda trossos de virus per reconèixer-los.",CBASS:"Infecció avortiva. Emparentat amb la via d'alarma cGAS-STING de les cèl·lules humanes.",Retron:"Infecció avortiva.",Abi2:"Sistema de la família Abi, d'infecció avortiva.",AbiEii:"Sistema de la família Abi, d'infecció avortiva.",AbiH:"Sistema de la família Abi, d'infecció avortiva.",Wadjet:"Descrit el 2018. Protegeix contra plasmidis, no contra fags.",Zorya:"Descrit el 2018. Fa servir peces semblants al motor del flagel.",Gabija:"Descrit el 2018. El més freqüent dels sistemes nous."};
  const col=k=>k==="RM"||k==="Cas"?C.ink:DORON.has(k)?C.wet:"#ADADAD";
  let view=0,W=0,started=false,grown=0;
  function draw(anim){W=box.clientWidth;if(!W)return;const lg=document.querySelector("#defBox + .legend");if(lg)lg.style.visibility=view?"hidden":"visible";const M=mob(),fs=M?11:12.5;svg.selectAll("*").remove();
    if(view===0){title.textContent="Quins sistemes de defensa porten bacteris i arqueus";
      const lw=M?96:150,rh=M?17:19,H=DEF.length*rh+30;svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);
      const x=d3.scaleLinear().domain([0,100]).range([lw,W-(M?36:48)]);
      const g=svg.append("g").attr("font-family",SSF).attr("font-size",fs);
      [0,25,50,75,100].forEach(v=>{g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",0).attr("y2",H-22).attr("stroke",C.hair);g.append("text").attr("x",x(v)).attr("y",H-6).attr("text-anchor","middle").attr("fill",C.muted).text(v+"%")});
      const rows=g.selectAll("g.r").data(DEF).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${i*rh+2})`);
      rows.append("rect").attr("x",0).attr("y",0).attr("width",W).attr("height",rh).attr("fill","transparent");
      rows.append("text").attr("x",lw-8).attr("y",rh*.68).attr("text-anchor","end").attr("fill",C.ink).attr("font-weight",d=>d[0]==="RM"||d[0]==="Cas"?700:400).text(d=>NAME[d[0]]||d[0]);
      const bars=rows.append("rect").attr("class","bar").attr("x",x(0)).attr("y",3).attr("height",rh-6).attr("fill",d=>col(d[0])).attr("width",d=>anim?0:x(d[1])-x(0));
      const lab=rows.append("text").attr("class","v").attr("y",rh*.68).attr("fill",C.ink2).attr("font-variant-numeric","tabular-nums").text(d=>fmtN(d[1],d[1]<10?1:0)+"%").attr("x",d=>x(d[1])+5).attr("opacity",anim?0:1);
      if(anim){bars.transition().duration(RM?0:900).delay((d,i)=>RM?0:i*35).attr("width",d=>x(d[1])-x(0));lab.transition().duration(RM?0:300).delay((d,i)=>RM?0:600+i*35).attr("opacity",1)}
      rows.on("pointerenter pointermove pointerdown",(e,d)=>{const r=box.getBoundingClientRect();tip.innerHTML=`<b>${NAME[d[0]]||d[0]}</b><br>${fmtN(d[1],1)}% dels genomes (${fmtN(Math.round(d[1]/100*N),0)} de ${fmtN(N,0)})${DESC[d[0]]?"<br>"+DESC[d[0]]:DORON.has(d[0])?"<br>Descrit el 2018 (Doron et al.).":""}`;tip.style.opacity=1;const tw=tip.offsetWidth;let tx=e.clientX-r.left+12;if(tx+tw>W)tx=e.clientX-r.left-tw-12;tip.style.transform=`translate(${Math.max(0,tx)}px,${e.clientY-r.top-tip.offsetHeight-8}px)`}).on("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0});
    } else {title.textContent="Quants sistemes de defensa té cada genoma";
      const H=M?300:340,ml=M?44:60,mr=M?8:20,mt=M?44:24,mb=40;svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);
      const agg=HIST.filter(d=>d[0]<30).map(d=>[d[0],d[1]]);const rest=HIST.filter(d=>d[0]>=30).reduce((a,d)=>a+d[1],0);
      const x=d3.scaleBand().domain(d3.range(0,31)).range([ml,W-mr]).padding(.12),y=d3.scaleLinear().domain([0,3000]).range([H-mb,mt]);
      const g=svg.append("g").attr("font-family",SSF).attr("font-size",fs);
      [0,1000,2000,3000].forEach(v=>{g.append("line").attr("x1",ml).attr("x2",W-mr).attr("y1",y(v)).attr("y2",y(v)).attr("stroke",C.hair);g.append("text").attr("x",ml-6).attr("y",y(v)+4).attr("text-anchor","end").attr("fill",C.muted).text(fmtN(v,0))});
      const data=agg.concat([[30,rest]]);
      const b=g.selectAll("rect.h").data(data).join("rect").attr("class","h").attr("x",d=>x(d[0])).attr("width",x.bandwidth()).attr("fill",d=>d[0]===0?C.warm:d[0]===5?C.wet:C.ink2).attr("y",d=>anim?y(0):y(d[1])).attr("height",d=>anim?0:y(0)-y(d[1]));
      if(anim)b.transition().duration(RM?0:800).delay((d,i)=>RM?0:i*20).attr("y",d=>y(d[1])).attr("height",d=>y(0)-y(d[1]));
      [0,5,10,15,20,25].forEach(v=>g.append("text").attr("x",x(v)+x.bandwidth()/2).attr("y",H-mb+15).attr("text-anchor","middle").attr("fill",C.muted).text(v));
      g.append("text").attr("x",x(30)+x.bandwidth()/2).attr("y",H-mb+15).attr("text-anchor","middle").attr("fill",C.muted).text("30+");
      g.append("text").attr("x",W-mr).attr("y",H-6).attr("text-anchor","end").attr("fill",C.ink2).text("Sistemes antivirals per genoma →");
      g.append("text").attr("x",ml).attr("y",14).attr("fill",C.ink2).text("Nombre de genomes");
      const ann=(xx,yy,l1,l2,c1,al)=>{const t=g.append("text").attr("x",xx).attr("y",yy).attr("text-anchor",al||"start");t.append("tspan").attr("font-weight",600).attr("fill",c1||C.ink).text(l1);t.append("tspan").attr("x",xx).attr("dy","1.25em").attr("fill",C.ink2).text(l2)};
      if(M){/* phone: labels above the bars and to the right, so they never touch */
        g.append("line").attr("x1",x(0)+x.bandwidth()/2).attr("x2",x(0)+x.bandwidth()/2).attr("y1",y(1450)-3).attr("y2",mt-4).attr("stroke",C.warm);
        g.append("text").attr("x",x(0)+x.bandwidth()/2+4).attr("y",mt-8).attr("font-weight",600).attr("fill",C.warm).text("1.450 genomes sense cap sistema");
        g.append("line").attr("x1",x(5)+x.bandwidth()).attr("x2",x(9)).attr("y1",y(2712)).attr("y2",y(2712)).attr("stroke",C.wet);
        g.append("text").attr("x",x(9)+4).attr("y",y(2712)+4).attr("font-weight",600).attr("fill",C.wet).text("Mitjana: 5,2")}
      else{g.append("line").attr("x1",x(0)+x.bandwidth()/2).attr("x2",x(0)+x.bandwidth()/2).attr("y1",y(1450)-3).attr("y2",y(2620)).attr("stroke",C.warm);ann(x(0),y(2700)-8,"1.450 genomes","sense cap sistema",C.warm);
        ann(x(5)+x.bandwidth()+6,y(2712)-6,"Mitjana: 5,2","sistemes per genoma",C.wet)}
      ann(x(30)+x.bandwidth(),y(rest)-34,M?"Màxim: 57":"El màxim: 57 sistemes",M?"":"(Desulfonema limicola)",C.ink,"end");
      b.on("pointerenter pointermove pointerdown",(e,d)=>{const r=box.getBoundingClientRect();tip.innerHTML=`<b>${d[0]===30?"30 o més":d[0]} ${d[0]===1?"sistema":"sistemes"}</b><br>${fmtN(d[1],0)} genomes (${fmtN(d[1]/N*100,1)}%)`;tip.style.opacity=1;let tx=e.clientX-r.left+12;if(tx+tip.offsetWidth>W)tx-=tip.offsetWidth+24;tip.style.transform=`translate(${Math.max(0,tx)}px,${Math.max(0,e.clientY-r.top-tip.offsetHeight-8)}px)`}).on("pointerleave",e=>{if(e.pointerType==="mouse")tip.style.opacity=0});
    }
  }
  document.addEventListener("pointerdown",e=>{if(!box.contains(e.target))tip.style.opacity=0});
  seg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;view=+b.dataset.v;[...seg.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)));tip.style.opacity=0;draw(true)});
  onLayout(()=>{if(started)draw(false)});
  onFrame(()=>{if(!started&&VIS.def){started=true;draw(true)}});
  draw(false);svg.selectAll("rect.bar").attr("width",0);svg.selectAll("text.v").attr("opacity",0);
})();

/* ================= 2. CRISPR scrolly (schematic) ================= */
(function(){
  const cv=document.getElementById("cr");if(!cv)return;
  const steps=document.getElementById("csteps"),graphic=document.getElementById("cgraphic"),nameEl=document.getElementById("cName"),subEl=document.getElementById("cSub");
  vio.observe(cv);
  const FW=800,FH=560;let W=0,H=0,c,K=1,ox=0,oy=0;
  function layout(){W=cv.parentElement.clientWidth;if(!W)return;H=mob()?Math.round(clamp(Math.min(innerHeight*.38,W*.8),210,340)):Math.round(clamp(Math.min(innerHeight-230,W*.72),300,560));c=setup(cv,W,H);K=Math.min(W/FW,H/FH);ox=(W-FW*K)/2;oy=(H-FH*K)/2}
  onLayout(layout);layout();
  const X=x=>ox+x*K,Y=y=>oy+y*K;
  const NM=["L'arxiu CRISPR","Arriba un virus nou","Un retrat de l'invasor","Una memòria que s'hereta","Retrats en patrulla","El virus torna","La resposta del virus","Del bacteri al laboratori"];
  let st=0,t0=performance.now();
  const OLD=["#9DB0C8","#C9B79C","#A9C3A0","#C6A9B6","#B9B9B9"];
  const RED=C.warm,MUT="#E08A6E";
  function fs(){return mob()?10.5:12.5}
  /* array: list of spacer colors starting at the leader; drawn at (x0,y) with scale k */
  function arrayAt(x0,y,k,spc,newA,label){const sw=46*k,rw=14*k,h=24*k;let x=x0;
    c.fillStyle="#D7D2C8";c.fillRect(X(x),Y(y-h/2),X(x+26*k)-X(x),h*K);x+=30*k;
    const ent=(cl,a)=>{c.globalAlpha=a;c.fillStyle="#8C8C8C";c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(x+rw/2),Y(y-h/2));c.lineTo(X(x+rw),Y(y));c.lineTo(X(x+rw/2),Y(y+h/2));c.closePath();c.fill();x+=rw+2*k;c.fillStyle=cl;c.fillRect(X(x),Y(y-h/2+2*k),sw*K,(h-4*k)*K);x+=sw+2*k;c.globalAlpha=1};
    spc.forEach((cl,i)=>ent(cl,i===0&&newA!=null?newA:1));
    c.fillStyle="#8C8C8C";c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(x+rw/2),Y(y-h/2));c.lineTo(X(x+rw),Y(y));c.lineTo(X(x+rw/2),Y(y+h/2));c.closePath();c.fill();
    return {lead:[x0+13*k,y],first:[x0+30*k+rw+2*k+sw/2,y],end:x+rw}}
  function chromLine(x0,x1,y,k){c.strokeStyle=C.cold;c.lineWidth=Math.max(1,2*K*k);[-6,6].forEach(d=>{c.beginPath();c.moveTo(X(x0),Y(y+d*k));c.lineTo(X(x1),Y(y+d*k));c.stroke()})}
  function casGenes(x0,y,k){const w=[28,30,40,26].map(v=>v*k);let x=x0;w.forEach((ww,i)=>{c.fillStyle=i===2?C.wet:"#7FB3AB";c.beginPath();c.moveTo(X(x),Y(y-10*k));c.lineTo(X(x+ww-6*k),Y(y-10*k));c.lineTo(X(x+ww),Y(y));c.lineTo(X(x+ww-6*k),Y(y+10*k));c.lineTo(X(x),Y(y+10*k));c.closePath();c.fill();x+=ww+3*k});return x}
  function cellBox(x0,y0,x1,y1,a){c.save();c.globalAlpha=a==null?1:a;c.fillStyle=C.cyto;c.strokeStyle=C.cold;c.lineWidth=Math.max(1.5,3*K);c.beginPath();c.roundRect(X(x0),Y(y0),(x1-x0)*K,(y1-y0)*K,60*K);c.fill();c.stroke();c.restore()}
  function phageIcon(x,y,k,a,col){c.save();c.globalAlpha=a==null?1:a;c.translate(X(x),Y(y));c.scale(K*k,K*k);c.fillStyle="#5C5C5C";c.fillRect(-6,-46,12,46);c.fillStyle="#3E3E3E";c.fillRect(-12,-6,24,7);c.strokeStyle=C.ink2;c.lineWidth=1.5;c.beginPath();c.moveTo(-10,-3);c.lineTo(-24,-18);c.lineTo(-30,4);c.moveTo(10,-3);c.lineTo(24,-18);c.lineTo(30,4);c.stroke();
    c.beginPath();c.moveTo(0,-46);c.lineTo(20,-56);c.lineTo(20,-90);c.lineTo(0,-100);c.lineTo(-20,-90);c.lineTo(-20,-56);c.closePath();c.fillStyle=col||"#E9D4CC";c.fill();c.strokeStyle=C.ink;c.lineWidth=1.6;c.stroke();c.restore()}
  /* phage DNA: wavy line from x0 to x1 at y, with protospacer [p0,p1] highlighted and PAM after it */
  function phageDNA(x0,x1,y,p0,p1,col,a,cut,mutX){c.save();c.globalAlpha=a==null?1:a;c.lineCap="round";const seg=(xa,xb,cl,lw)=>{c.strokeStyle=cl;c.lineWidth=lw*K;c.beginPath();for(let x=xa;x<=xb;x+=4){const yy=y+Math.sin(x*.06)*5;x===xa?c.moveTo(X(x),Y(yy)):c.lineTo(X(x),Y(yy))}c.stroke()};
    const g=cut?cut*26:0;seg(x0,p0-g,col,3);seg(p1+g,x1,col,3);if(!cut||cut<1){c.globalAlpha=(a==null?1:a)*(1-(cut||0));seg(p0,p1,col,7);c.globalAlpha=a==null?1:a}
    c.fillStyle=C.dry;c.fillRect(X(p1+4+g),Y(y-8),12*K,16*K);
    if(mutX!=null){const mx=p0+(p1-p0)*mutX;c.fillStyle="#fff";c.fillRect(X(mx-3),Y(y-6),6*K,12*K);c.strokeStyle=C.ink;c.lineWidth=1.4;c.strokeRect(X(mx-3),Y(y-6),6*K,12*K)}
    c.restore()}
  function cas9(x,y,k,guide,a){c.save();c.globalAlpha=a==null?1:a;c.fillStyle="rgba(22,120,108,.28)";c.strokeStyle=C.wet;c.lineWidth=Math.max(1.2,2*K);c.beginPath();c.ellipse(X(x),Y(y),34*K*k,24*K*k,0,0,6.2832);c.fill();c.stroke();
    if(guide){c.strokeStyle=guide;c.lineWidth=Math.max(2,5*K*k);c.beginPath();c.moveTo(X(x-22*k),Y(y+6*k));c.lineTo(X(x+22*k),Y(y+6*k));c.stroke()}c.restore()}
  function cas12(x,y,k,a){c.save();c.globalAlpha=a==null?1:a;c.fillStyle="rgba(22,120,108,.5)";c.beginPath();c.arc(X(x-9*k),Y(y),11*K*k,0,6.2832);c.arc(X(x+9*k),Y(y),11*K*k,0,6.2832);c.fill();c.restore()}
  const LBL=(px,py,lines,tx,ty,al,a)=>{if(a<=0)return;const f=fs();lead(c,X(px),Y(py),X(tx),Y(ty),C.ink2,a);txt(c,lines,X(tx)+(al==="right"?-4:al==="center"?0:4),Y(ty)+(ty<py?-4-(lines.length-1)*f*1.25:f),al,f,a)};
  function draw(now){if(!W||!c)return;const t=RM?99:(now-t0)/1000,M=mob();c.clearRect(0,0,W,H);
    const la=k=>clamp((t-k)/.5,0,1);
    const base=OLD.slice(0,4);
    if(st<=2||st===4||st===5||st===6){
      cellBox(30,110,770,530);chromLine(60,740,450,1);const gx=casGenes(90,450,1);
      let spc=base.slice(),newA=null;
      if(st===2){const q=clamp((t-2.2)/1,0,1);if(q>0){spc=[RED].concat(base);newA=q}}
      if(st>=4)spc=[RED].concat(base);
      if(st===6&&t>4.2){spc=[MUT,RED].concat(base);newA=clamp((t-4.2)/.8,0,1)}
      const ar=arrayAt(250,450,1,spc,newA);
      if(st===0){LBL(150,440,[["Gens cas",true,C.wet]],150,370,"center",la(.2));LBL(263,440,[["Líder",true]],250,330,"center",la(.4));LBL(287,438,[["Repetició",true]],330,250,"left",la(.6));
        LBL(ar.first[0]+110,438,[["Espaiadors: retrats",true],["de virus antics",false,C.ink2]],ar.first[0]+190,385,"left",la(.8))}
      /* phage + injected DNA */
      if(st===1||st===2||st===5||st===6){const col=st===6?MUT:RED;const inj=st===1?ease(clamp((t-.3)/1.4,0,1)):1;phageIcon(400,112,1,1,st===6?"#F3D2C6":"#E9D4CC");
        const cut=st===5?ease(clamp((t-3)/1,0,1)):0;
        if(inj>0)phageDNA(400-260*inj,400+260*inj,250,360,430,col,st===5?1-clamp((t-4.5)/1,0,1)*.7:st===2?1-clamp((t-3.6)/1,0,1)*.75:1,cut,st===6?.55:null)}
      if(st===1){LBL(470,250,[["ADN del virus",true,RED]],560,190,"left",la(1.6));LBL(500,440,[["Cap espaiador",true],["hi coincideix",false,C.ink2]],620,360,"left",la(2.2))}
      if(st===2){/* Cas1-Cas2 grabs protospacer and carries it to the leader end */
        const g1=ease(clamp(t/1,0,1)),mv=ease(clamp((t-1)/1.3,0,1));const sx=lerp(560,395,g1),sy=lerp(330,250,g1);const px=lerp(395,ar.lead[0]+30,mv),py=lerp(250,450,mv);
        cas12(mv>0?px:sx,mv>0?py-18:sy-18,1.1,clamp(1.6-(t-2.2),0,1)*1);
        if(mv>0&&t<3.2){c.save();c.strokeStyle=RED;c.lineWidth=7*K;c.beginPath();c.moveTo(X(px-34),Y(py));c.lineTo(X(px+34),Y(py));c.stroke();c.restore()}
        LBL(437,252,[["PAM",true,C.dry]],470,190,"left",la(.3));LBL(sx+12,sy-20,[["Cas1–Cas2",true,C.wet]],sx+60,170,"left",la(.3)*(1-mv));
        LBL(ar.first[0],440,[["Espaiador nou,",true,RED],["al principi de l'arxiu",false,C.ink2]],ar.first[0]+60,330,"left",la(3))}
      if(st===4){/* transcription: long RNA, cut into guides, loaded on Cas9 */
        const tr=ease(clamp(t/1.2,0,1)),ct=ease(clamp((t-1.4)/1,0,1)),ld=ease(clamp((t-2.6)/1.4,0,1));
        const x0=280,x1=ar.end;const pieces=spc.length;const pw=(x1-x0)/pieces;
        for(let i=0;i<pieces;i++){const tx0=x0+i*pw,yy=400-ct*(30+i*8)-ld*(60+ (i%2)*40);const xx=lerp(tx0,180+i*120,ld);const len=pw*.8*tr;
          c.strokeStyle=spc[i];c.lineWidth=5*K;c.beginPath();c.moveTo(X(xx),Y(yy));c.lineTo(X(xx+len),Y(yy));c.stroke();
          if(ld>0)cas9(xx+len/2,yy-4,1,null,ld)}
        LBL(330,398,[["ARN copiat de l'arxiu",true]],250,320,"right",la(.6)*(1-ld));LBL(180+60,400-30-60-ld*0,[["Cas9 amb el seu",true,C.wet],["ARN guia",false,C.ink2]],140,190,"left",la(3))}
      if(st===5){/* Cas9 with red guide scans and cuts */
        const sc=ease(clamp((t-.8)/1.8,0,1));const cx=lerp(200,395,sc),cy=lerp(330,262,sc);cas9(cx,cy,1.1,RED,1);[1,2,3].forEach(i=>cas9(140+i*130,360+(i%2)*30,.9,OLD[i],.6));
        LBL(437,252,[["PAM",true,C.dry]],480,180,"left",la(.4));if(t>3)LBL(395,250,[["Coincideix: tall!",true,C.wet]],560,330,"left",la(3));}
      if(st===6){const sc=ease(clamp((t-.5)/1.6,0,1));const cx=lerp(200,395,sc),cy=lerp(330,262,sc),pass=ease(clamp((t-2.4)/1.2,0,1));cas9(cx+pass*230,cy+pass*60,1.1,RED,1);
        LBL(398,252,[["Una lletra canviada",true,MUT]],300,170,"right",la(1));if(t>2.4)LBL(cx+pass*230,cy+pass*60-26,[["No coincideix:",true],["el virus s'escapa",false,C.ink2]],640,190,"left",la(2.6));
        if(t>4.2)LBL(ar.first[0],440,[["Nou espaiador,",true,MUT],["contra el mutant",false,C.ink2]],ar.first[0]+60,330,"left",la(4.4))}
    }
    if(st===3){/* division: the cell pinches in two; both daughters carry the whole archive */
      const d=ease(clamp((t-.3)/1.8,0,1)),k=lerp(1,.84,d),spc=[RED].concat(base),gap=22*d,mid=320;
      if(d<.02)cellBox(30,110,770,530);
      else{const r=60*K*d,r0=60*K;c.save();c.fillStyle=C.cyto;c.strokeStyle=C.cold;c.lineWidth=Math.max(1.5,3*K);
        [[110,mid-gap/2,[r0,r0,r,r]],[mid+gap/2,530,[r,r,r0,r0]]].forEach(([a,b,rr])=>{c.beginPath();c.roundRect(X(30),Y(a),740*K,(b-a)*K,rr);c.fill();c.stroke()});c.restore()}
      [lerp(450,215,d),lerp(450,430,d)].forEach(yc=>{chromLine(60,740,yc,k);casGenes(90,yc,k);arrayAt(90+160*k,yc,k,spc)});
      if(d>=1){const ex=90+160*k+(30+5*64+14)*k,a=la(2.2);if(a>0){lead(c,X(ex+4),Y(222),X(ex+40),Y(255),C.ink2,a);lead(c,X(ex+4),Y(423),X(ex+40),Y(290),C.ink2,a);txt(c,[["Les dues filles",true],["recorden el virus",false,C.ink2]],X(ex+46),Y(262),"left",fs(),a)}}
    }
    if(st===7){/* the tool: Cas9 + single guide cutting human DNA */
      const sc=ease(clamp((t-.4)/1.6,0,1)),cut=ease(clamp((t-2.4)/.8,0,1));
      c.fillStyle="#F6F4F1";c.fillRect(X(30),Y(130),740*K,380*K);
      const y=330;c.save();c.lineCap="round";const gx=cut*18;[[60,400-gx],[400+gx,740]].forEach(([a,b])=>{c.strokeStyle=C.ink;c.lineWidth=2.4*K;for(const off of[-8,8]){c.beginPath();for(let x=a;x<=b;x+=4){const yy=y+off*Math.cos(x*.05);x===a?c.moveTo(X(x),Y(yy)):c.lineTo(X(x),Y(yy))}c.stroke()}});c.restore();
      c.fillStyle=C.dry;c.fillRect(X(432+gx),Y(y-10),14*K,20*K);
      cas9(lerp(170,405,sc),lerp(220,y-4,sc),1.3,C.wet,1);
      /* letters */
      if(!M||W>380){const G="GACCUGUUCAGCGAUAGCAC",T="GACCTGTTCAGCGATAGCAC";const f=fs()-1;const bx=X(220),by=Y(450),cw=Math.min(15,(W-bx-40)/24);
        txt(c,[["ARN guia (20 lletres a mida, d'exemple)",false,C.wet]],bx,by-6,"left",f,la(1.4));
        c.save();c.globalAlpha=la(1.4);c.font=`600 ${f}px ui-monospace,Menlo,monospace`;c.textAlign="center";for(let i=0;i<20;i++){c.fillStyle=C.wet;c.fillText(G[i],bx+i*cw+cw/2,by+f+4);c.fillStyle=C.ink;c.fillText(T[i],bx+i*cw+cw/2,by+2*f+10)}c.fillStyle=C.dry;c.fillText("PAM",bx+20*cw+cw*1.6,by+2*f+10);c.textAlign="right";c.font=`${f}px ${SSF}`;c.fillStyle=C.wet;c.fillText("ARN",bx-6,by+f+4);c.fillStyle=C.ink;c.fillText("ADN",bx-6,by+2*f+10);c.restore()}
      LBL(300,y,[["ADN d'una cèl·lula humana",true]],120,180,"left",la(.2));LBL(439+gx,y-10,[["PAM",true,C.dry]],520,190,"left",la(.8));if(t>2.6)LBL(400,y,[["Tall a mida",true,C.wet]],600,260,"left",la(2.8));
    }
  }
  IB.scrolly(steps,graphic,i=>{st=i;t0=performance.now();nameEl.textContent=NM[i];subEl.textContent=i===7?"Esquema · seqüència d'exemple":"Esquema"});
  onFrame(now=>{if(VIS.cr===false)return;safe(draw,now)});
})();

/* ================= 3. CRISPR memory simulation (simplified model) ================= */
(function(){
  const cv=document.getElementById("sim");if(!cv)return;
  const ch=document.getElementById("simChart"),btns=document.getElementById("simBtns"),cnt=document.getElementById("simCnt"),msg=document.getElementById("simMsg"),reset=document.getElementById("simReset");
  vio.observe(cv);
  /* spacer colours (palette only): A = red, B = ochre, mutant = light red. The anti-CRISPR virus is A with a blocker, so it leaves no new colour. */
  const VC=[C.warm,C.dry,C.warmL,C.ink2],VN=["virus A","virus B","el virus A mutant","el virus A amb anti-CRISPR"],CHH=140,NS=240;
  let W=0,H=0,c,cc,CW=0,cols=0,rows=0,R=10,cells=[],hist=[],fx=[],simT=0,lastSample=0,evt=null;
  function layout(){W=cv.parentElement.clientWidth;if(!W)return;const M=mob();R=M?9.5:11;cols=Math.max(10,Math.floor((W-R)/(R*2)));rows=M?14:16;H=Math.round(rows*R*1.75+R*1.2);c=setup(cv,W,H);CW=ch.clientWidth||W;cc=setup(ch,CW,CHH);if(cells.length!==cols*rows)init()}
  function init(){cells=[];for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){cells.push({r,q,x:R+q*R*2+(r%2?R:0),y:R+r*R*1.75,st:1,sp:[],v:-1,tm:0,fl:0})}hist=[];simT=0;lastSample=0;fx=[];evt=null;msg.textContent="La colònia encara no ha vist cap virus. Cap bacteri no té espaiadors.";updCnt()}
  onLayout(layout);layout();
  const nb=i=>{const a=cells[i],o=a.r%2?[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]:[[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];const out=[];o.forEach(([dr,dq])=>{const r=a.r+dr,q=a.q+dq;if(r>=0&&r<rows&&q>=0&&q<cols)out.push(r*cols+q)});return out};
  const spOf=v=>v===3?0:v; /* the anti-CRISPR virus has the same sequence as A */
  function attack(i,v){const a=cells[i];if(a.st!==1)return;
    const known=a.sp.includes(spOf(v));
    const E=evt&&evt.v===v?evt:null;if(known&&v!==3){a.fl=1;if(E)E.res++;return}
    if(Math.random()<(v===3?.07:.015))return; /* survives by chance or thanks to other defences */
    if(v!==3&&Math.random()<.035){a.sp.unshift(spOf(v));if(a.sp.length>4)a.sp.pop();if(E)E.acq++;return}
    a.st=2;a.v=v;a.tm=.55+Math.random()*.4;if(E)E.inf++}
  function release(v,at){const alive=cells.map((a,i)=>a.st===1?i:-1).filter(i=>i>=0);if(!alive.length){msg.textContent="No queda cap bacteri. Torna a començar.";return}
    evt={v,res:0,acq:0,inf:0,dead:0,t:simT,known:alive.filter(i=>cells[i].sp.includes(spOf(v))).length/alive.length,n:alive.length};
    let seeds=[];if(at!=null){seeds=[at].concat(nb(at))}else{for(let k=0;k<4;k++)seeds.push(alive[Math.floor(Math.random()*alive.length)])}
    seeds.forEach(i=>attack(i,v));
    const p=Math.round(evt.known*100);
    msg.textContent=v===3?(evt.known>.3?`El ${p}% dels bacteris recorden el virus A, però aquest porta un anti-CRISPR que bloqueja la memòria.`:"Aquest virus A porta un anti-CRISPR: encara que el bacteri el recordi, no el pot tallar."):
      v===2?(cells.some(a=>a.sp.includes(0))?"El mutant té una lletra canviada: l'espaiador del virus A no el reconeix.":"Un mutant del virus A ataca la colònia."):
      evt.known>.5?`El ${p}% dels bacteris ja tenen un espaiador de ${VN[v]}. A veure què passa…`:`${VN[v][0].toUpperCase()+VN[v].slice(1)} ataca. Gairebé cap bacteri no el coneix.`}
  function step(dt){simT+=dt;
    for(let i=0;i<cells.length;i++){const a=cells[i];if(a.fl>0)a.fl=Math.max(0,a.fl-dt*1.4);
      if(a.st===2){a.tm-=dt;if(a.tm<=0){const v=a.v;a.st=0;a.sp=[];a.v=-1;if(evt&&evt.v===v)evt.dead++;fx.push({x:a.x,y:a.y,t:0});nb(i).forEach(j=>{if(Math.random()<.75)attack(j,v)});
        /* a few phages travel a bit further */const n2=nb(i);const j=n2[Math.floor(Math.random()*n2.length)];if(j!=null)nb(j).forEach(k=>{if(Math.random()<.18)attack(k,v)})}}}
    /* regrowth: empty cells are refilled by dividing neighbours, which pass on their spacers */
    for(let i=0;i<cells.length;i++){const a=cells[i];if(a.st!==0)continue;const al=nb(i).filter(j=>cells[j].st===1);if(al.length&&Math.random()<dt*1.3*al.length/6){const m=cells[al[Math.floor(Math.random()*al.length)]];a.st=1;a.sp=m.sp.slice();a.fl=0}}
    fx.forEach(f=>f.t+=dt);fx=fx.filter(f=>f.t<.6);
    const infV=evt?cells.some(a=>a.st===2&&a.v===evt.v):false;if(evt&&!infV&&simT-evt.t>1){const e=evt;evt=null;const alive=cells.filter(a=>a.st===1).length;
      if(alive===0)msg.textContent="La colònia ha desaparegut. Torna a començar.";
      else if(e.v===3)msg.textContent=`L'anti-CRISPR ha desactivat la memòria: han mort ${e.dead} bacteris, fins i tot els que recordaven el virus A. N'han sobreviscut uns quants per sort o gràcies a altres defenses.`;
      else if(e.dead<5&&e.res>0)msg.textContent=`L'atac ha fracassat: ${e.res} bacteris han reconegut el virus i l'han tallat. La memòria funciona.`;
      else if(e.acq>0)msg.textContent=`Han mort ${e.dead} bacteris, però ${e.acq===1?"un ha sobreviscut i ha":e.acq+" han sobreviscut i han"} guardat un espaiador nou. Els seus descendents ja l'hereten. Torna-hi!`;
      else msg.textContent=`Han mort ${e.dead} bacteris i cap no ha guardat el virus. Prova-ho una altra vegada.`}
    if(simT-lastSample>.25){lastSample=simT;const n=cells.length,f=k=>cells.filter(a=>a.st===1&&a.sp.includes(k)).length/n;hist.push([cells.filter(a=>a.st===1).length/n,f(0),f(1),f(2)]);if(hist.length>NS)hist.shift();updCnt()}}
  function updCnt(){const n=cells.length||1,al=cells.filter(a=>a.st===1).length,f=k=>cells.filter(a=>a.st===1&&a.sp.includes(k)).length;
    cnt.innerHTML=`<li><span><i style="background:${C.cold}"></i>Bacteris vius</span><b>${Math.round(al/n*100)}%</b></li><li><span><i style="background:${VC[0]}"></i>Recorden el virus A</span><b>${Math.round(f(0)/n*100)}%</b></li><li><span><i style="background:${VC[1]}"></i>Recorden el virus B</span><b>${Math.round(f(1)/n*100)}%</b></li><li><span><i style="background:${VC[2]}"></i>Recorden el mutant</span><b>${Math.round(f(2)/n*100)}%</b></li>`}
  function draw(){if(!W||!c)return;c.clearRect(0,0,W,H);const r=R*.82;
    for(const a of cells){if(a.st===0){c.strokeStyle="#D4D4D2";c.lineWidth=1;c.beginPath();c.arc(a.x,a.y,r,0,6.2832);c.stroke();continue}
      c.save();c.beginPath();c.arc(a.x,a.y,r,0,6.2832);c.clip();c.fillStyle=a.st===2?"#F6DCD3":C.cyto;c.fillRect(a.x-r,a.y-r,2*r,2*r);
      a.sp.forEach((k,i)=>{c.fillStyle=VC[k];c.fillRect(a.x-r+2+i*(r*.55),a.y-r,r*.42,2*r)});c.restore();
      c.strokeStyle=a.st===2?C.warm:C.cold;c.lineWidth=a.st===2?2:1.1;c.beginPath();c.arc(a.x,a.y,r,0,6.2832);c.stroke();
      if(a.fl>0){c.strokeStyle=C.wet;c.globalAlpha=a.fl;c.lineWidth=2.4;c.beginPath();c.arc(a.x,a.y,r+3,0,6.2832);c.stroke();c.globalAlpha=1}}
    for(const f of fx){c.fillStyle=C.warm;c.globalAlpha=1-f.t/.6;for(let k=0;k<7;k++){const an=k/7*6.2832;const d=R*(.5+f.t*3.2);c.beginPath();c.arc(f.x+Math.cos(an)*d,f.y+Math.sin(an)*d,1.6,0,6.2832);c.fill()}c.globalAlpha=1}
    /* time series: fixed 60 s window, 0-100 % */
    if(cc){const ml=34,mt=10,mb=20,ph=CHH-mt-mb,pw=CW-ml-4,Yc=v=>mt+ph*(1-v);cc.clearRect(0,0,CW,CHH);
      [0,.5,1].forEach(v=>{cc.strokeStyle=v?C.hair:"#BDBDBD";cc.lineWidth=1;cc.beginPath();cc.moveTo(ml,Yc(v)+.5);cc.lineTo(CW,Yc(v)+.5);cc.stroke();txt(cc,[[Math.round(v*100)+"%",false,C.muted]],ml-5,Yc(v)+4,"right",10.5,1,false)});
      const n=hist.length;if(n>1){[[1,VC[0],1.6],[2,VC[1],1.6],[3,C.warmL,2],[0,C.cold,2.2]].forEach(([k,col,lw])=>{cc.strokeStyle=col;cc.lineWidth=lw;cc.beginPath();hist.forEach((h,i)=>{const x=ml+i*(pw/(NS-1)),y=Yc(h[k]);i?cc.lineTo(x,y):cc.moveTo(x,y)});cc.stroke()})}
      txt(cc,[["Últims 60 segons →",false,C.muted]],CW,CHH-4,"right",10.5,1,false)}}
  btns.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;release(+b.dataset.v)});
  cv.addEventListener("click",e=>{const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let bi=-1,bd=1e9;cells.forEach((a,i)=>{const d=(a.x-mx)**2+(a.y-my)**2;if(d<bd){bd=d;bi=i}});if(bi>=0)release(0,bi)});
  reset.addEventListener("click",()=>{init()});
  onFrame((now,dt)=>{if(!VIS.sim)return;step(Math.min(dt,.05));draw()});
})();

/* ================= 4. timeline ================= */
(function(){
  const svg=d3.select("#tline");if(svg.empty())return;const card=document.getElementById("tlCard");
  const EV=[
   [1987,"Unes repeticions estranyes","Un equip japonès troba en l'ADN d'<i>E. coli</i> cinc repeticions de 29 lletres separades per trossos de 32. No en sap la funció.","Ishino et al., J Bacteriol"],
   [1993,"Mojica, a Alacant","En <i>Haloferax mediterranei</i>, un arqueu de les salines, Francisco Mojica i els seus col·legues de la Universitat d'Alacant hi troben 14 repeticions de 30 lletres, separades a intervals regulars.","Mojica, Juez i Rodríguez-Valera, Mol Microbiol"],
   [2000,"Són a tot arreu","El grup de Mojica mostra que la mateixa família de repeticions apareix en molts arqueus i bacteris diferents.","Mojica et al., Mol Microbiol"],
   [2002,"Neix el nom CRISPR","Un grup de la Universitat d'Utrecht encunya la sigla i descobreix els gens <i>cas</i>, que sempre són al costat de l'arxiu.","Jansen et al., Mol Microbiol"],
   [2005,"Retrats de virus","Mojica, al febrer, i dos equips francesos poc després publiquen que els espaiadors venen de virus i plasmidis. Proposen que són una memòria immunitària.","Mojica et al., J Mol Evol; Pourcel et al. i Bolotin et al., Microbiology"],
   [2007,"La prova, en un bacteri del iogurt","A l'empresa Danisco, <i>Streptococcus thermophilus</i> guarda espaiadors nous després d'un atac de fags i es torna resistent. Treure o afegir espaiadors canvia la resistència.","Barrangou et al., Science"],
   [2008,"Guies d'ARN contra ADN","L'arxiu es copia en petites guies d'ARN, i el que el sistema ataca és l'ADN de l'invasor.","Brouns et al.; Marraffini i Sontheimer, Science"],
   [2010,"Talls a l'ADN del virus","Es comprova que el sistema de <i>S. thermophilus</i> talla l'ADN dels fags i dels plasmidis, i que hi intervé la proteïna Cas9.","Garneau et al., Nature"],
   [2011,"La peça que faltava","L'equip d'Emmanuelle Charpentier, entre Viena i Umeå (Suècia), descobreix el tracrRNA, un segon ARN imprescindible en el sistema de Cas9 de <i>Streptococcus pyogenes</i>.","Deltcheva et al., Nature"],
   [2012,"Unes tisores programables","Charpentier i Jennifer Doudna demostren que Cas9 guiada per un sol ARN dissenyat a mida talla l'ADN que es vulgui. Gairebé alhora, l'equip de Virginijus Šikšnys, a Vílnius, publica que el complex de Cas9 amb el seu ARN talla ADN de manera específica.","Jinek et al., Science; Gasiunas et al., PNAS"],
   [2013,"Edició en cèl·lules humanes","Dos equips de Boston i Cambridge (EUA), el de Feng Zhang al Broad Institute i el de George Church a Harvard, editen gens en cèl·lules humanes amb CRISPR-Cas9.","Cong et al.; Mali et al., Science"],
   [2020,"El Nobel de Química","El 7 d'octubre, l'Acadèmia sueca premia Charpentier i Doudna «pel desenvolupament d'un mètode per editar genomes».","nobelprize.org"],
   [2023,"El primer medicament","El 15 de novembre, el Regne Unit autoritza el Casgevy, el primer medicament basat en CRISPR, per a l'anèmia falciforme i la beta-talassèmia que depèn de transfusions.","MHRA"]];
  let sel=4,W=0;
  function draw(){W=svg.node().parentElement.clientWidth;if(!W)return;const M=mob(),H=M?92:104,ml=14,mr=14,y0=M?50:56;svg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H);svg.selectAll("*").remove();
    const x=d3.scaleLinear().domain([1985,2025]).range([ml,W-mr]);const g=svg.append("g").attr("font-family",SSF);
    g.append("line").attr("x1",x(1985)).attr("x2",x(2025)).attr("y1",y0).attr("y2",y0).attr("stroke",C.ink).attr("stroke-width",1);
    for(let yr=1985;yr<=2025;yr+=5){g.append("line").attr("x1",x(yr)).attr("x2",x(yr)).attr("y1",y0).attr("y2",y0+5).attr("stroke",C.ink);g.append("text").attr("x",x(yr)).attr("y",y0+20).attr("text-anchor","middle").attr("font-size",M?10.5:12).attr("fill",C.muted).text(M&&yr%10?"":yr)}
    EV.forEach((e,i)=>{const on=i===sel,gx=g.append("g").style("cursor","pointer").on("click",()=>{sel=i;upd()});
      const off=0;
      gx.append("circle").attr("cx",x(e[0])).attr("cy",y0+off).attr("r",on?7:M?3.6:5.5).attr("fill",on?C.warm:i>=11?C.wet:C.ink).attr("stroke","#fff").attr("stroke-width",2);
      gx.append("rect").attr("x",x(e[0])-9).attr("y",y0-24).attr("width",18).attr("height",36).attr("fill","transparent");
      if(on){gx.append("line").attr("x1",x(e[0])).attr("x2",x(e[0])).attr("y1",y0-10).attr("y2",y0-26).attr("stroke",C.warm);gx.append("text").attr("x",clamp(x(e[0]),20,W-20)).attr("y",y0-31).attr("text-anchor","middle").attr("font-size",M?13:15).attr("font-weight",700).attr("fill",C.warm).text(e[0])}});
  }
  function upd(){draw();const e=EV[sel];card.innerHTML=`<h3><span class="y">${e[0]}</span>${e[1]}</h3><p>${e[2]}</p><p class="src">${e[3]}</p>`}
  document.getElementById("tlPrev").addEventListener("click",()=>{sel=Math.max(0,sel-1);upd()});
  document.getElementById("tlNext").addEventListener("click",()=>{sel=Math.min(EV.length-1,sel+1);upd()});
  svg.attr("tabindex",0).on("keydown",e=>{if(e.key==="ArrowRight"){sel=Math.min(EV.length-1,sel+1);upd()}if(e.key==="ArrowLeft"){sel=Math.max(0,sel-1);upd()}});
  onLayout(upd);upd();
})();
})();
