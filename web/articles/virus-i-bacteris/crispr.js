/* «La guerra invisible» — gràfics 2 (sistema infogràfic IBV):
   5. IB-38 sistemes de defensa en 21.738 genomes (cercles translúcids + distribució orgànica)
   6. IB-16 esquema orgànic animat del mecanisme CRISPR-Cas9 (scrollytelling)
   7. Simulació orgànica de colònia bacteriana amb memòria CRISPR + sèrie temporal IB-01
   8. IB-49 línia temporal editorial del CRISPR (1987–2023) */
(function(){
"use strict";
const V=window.IBV, H=window.VIB; if(!V||!H)return;
const C=V.C;
const {SSF,RM,clamp,lerp,ease,fmtN,txt,lead}=H;
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");

/* =====================================================================
   5. IB-38 SISTEMES DE DEFENSA EN 21.738 GENOMES (Tesson et al. 2022)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("def-viz"); if(!vizEl||!window.VIB_DATA)return;
  const seg=document.getElementById("defSeg"), title=document.getElementById("defTitle"), sub=document.getElementById("defSub"), lgEl=document.getElementById("def-lg");
  const N=VIB_DATA.nGen, DEF=VIB_DATA.def.slice(0,25), HIST=VIB_DATA.hist;
  const DORON=new Set(["Thoeris","Hachiman","Shedu","Gabija","Septu","Lamassu","Zorya","Kiwa","Druantia","Wadjet"]);
  const NAME={RM:"Restricció-modificació",Cas:"CRISPR-Cas",Retron:"Retrons",Rst_PARIS:"PARIS",dGTPase:"dGTPasa"};
  const DESC={
    RM:"Tisores que tallen l'ADN sense l'etiqueta química del bacteri",
    Cas:"Memòria adaptativa: guarda trossos de virus per reconèixer-los",
    CBASS:"Infecció avortiva, emparentat amb cGAS-STING humà",
    Retron:"Infecció avortiva",
    Abi2:"Família Abi, d'infecció avortiva",
    AbiEii:"Família Abi, d'infecció avortiva",
    AbiH:"Família Abi, d'infecció avortiva",
    Wadjet:"Descrit el 2018 · protegeix contra plasmidis",
    Zorya:"Descrit el 2018 · peces semblants al motor del flagel",
    Gabija:"Descrit el 2018 · el més freqüent dels sistemes nous"
  };

  /* Paleta estricta: CRISPR vermell (protagonista), RM blau, Doron 2018 groc, altres gris */
  const col=k=>k==="Cas"?C.vermell:k==="RM"?C.blau:DORON.has(k)?C.groc:C.ink2;
  const strokeCol=k=>k==="Cas"?C.vermell:k==="RM"?C.blau:DORON.has(k)?C.grocFosc:C.ink2;

  let view=0, redrawDef=null;
  function renderLegend(){
    if(!lgEl)return;
    lgEl.innerHTML="";
    if(view===0){
      V.legendCat(lgEl,[
        {c:C.vermell,t:"CRISPR-Cas (aprèn)"},
        {c:C.blau,t:"Restricció-modificació"},
        {c:C.groc,t:"Descrits el 2018 (Doron et al.)"},
        {c:C.ink2,t:"Altres sistemes",a:.45}
      ]);
    } else {
      V.legendCat(lgEl,[
        {c:C.vermell,t:"Sense cap sistema (0)"},
        {c:C.blau,t:"Distribució per genoma"},
        {c:C.ink,t:"Mitjana (5,2)",kind:"line",w:1.3,dash:"2 3"}
      ]);
    }
  }
  renderLegend();

  V.mount(vizEl,(el,W)=>{
    const mob=W<580;
    const tp=V.tip(el);

    function drawView(animate){
      d3.select(el).selectAll("svg.ibv").remove();
      tp.hide();
      if(view===0){
        title.textContent="Quins sistemes de defensa porten bacteris i arqueus";
        sub.textContent="Percentatge de genomes amb cada família (les 25 més freqüents de 60) · Cercles d'àrea proporcional";
        const ml=mob?108:164, mr=mob?42:56, mt=24, mb=28, rh=mob?20:22;
        const H=mt+DEF.length*rh+mb;
        const s=V.svg(el,W,H,"Percentatge de 21.738 genomes de bacteris i arqueus que porten cada família antiviral: restricció-modificació al 83 %, CRISPR-Cas al 39,2 %, Gabija al 15,3 %, i la resta per sota del 15 %.");
        const X=d3.scaleLinear([0,100],[ml,W-mr]);
        const rSc=d3.scaleSqrt([0,100],[3.2,mob?10.5:12.5]);
        const g=s.append("g");

        /* Eix X recessiu amb quadrícula fina vertical */
        [0,25,50,75,100].forEach(v=>{
          g.append("line").attr("x1",X(v)).attr("x2",X(v)).attr("y1",mt-4).attr("y2",H-mb)
            .attr("stroke",v===0?C.ink:C.grid).attr("stroke-width",v===0?.9:.65);
          V.t(g,X(v),mt-10,v+(v===100?" %":""),{size:11,fill:C.muted,anchor:"middle"});
        });

        const rows=g.selectAll("g.row").data(DEF).join("g").attr("class","row")
          .attr("transform",(d,i)=>`translate(0,${mt+i*rh+rh/2})`).style("cursor","pointer");

        rows.append("rect").attr("x",0).attr("y",-rh/2).attr("width",W).attr("height",rh).attr("fill","transparent");
        rows.append("line").attr("class","guide").attr("x1",X(0)).attr("x2",X(100)).attr("y1",0).attr("y2",0)
          .attr("stroke",C.grid).attr("stroke-width",.5).attr("stroke-opacity",.6);

        const stems=rows.append("line").attr("class","stem").attr("x1",X(0)).attr("x2",d=>animate?X(0):X(d[1])).attr("y1",0).attr("y2",0)
          .attr("stroke",d=>strokeCol(d[0])).attr("stroke-width",d=>d[0]==="Cas"||d[0]==="RM"?1.4:.9).attr("stroke-opacity",.75);

        const halos=rows.append("circle").attr("class","halo").attr("cx",d=>animate?X(0):X(d[1])).attr("cy",0)
          .attr("r",d=>animate?0:rSc(d[1])).attr("fill",d=>col(d[0]))
          .attr("fill-opacity",d=>DORON.has(d[0])?.44:d[0]==="Cas"||d[0]==="RM"?.32:.2)
          .style("mix-blend-mode","multiply");

        const cores=rows.append("circle").attr("class","core").attr("cx",d=>animate?X(0):X(d[1])).attr("cy",0)
          .attr("r",d=>d[0]==="Cas"||d[0]==="RM"?3:2.2).attr("fill",d=>strokeCol(d[0]));

        rows.each(function(d){
          const q=d3.select(this), key=d[0], isKey=key==="Cas"||key==="RM";
          V.t(q,ml-10,4,NAME[key]||key,{size:mob?11.5:12.5,weight:isKey?700:400,fill:key==="Cas"?C.vermell:key==="RM"?C.blau:C.ink,anchor:"end"});
          V.t(q,X(d[1])+rSc(d[1])+6,4,`${fmtN(d[1],d[1]<10?1:0)} %`,{size:11.5,weight:isKey?700:400,fill:C.ink2,anchor:"start"}).attr("class","val").style("opacity",animate?0:1);
        });

        /* Anotació editorial sobre CRISPR-Cas */
        const gNote=s.append("g").style("pointer-events","none");
        if(!mob){
          const yCas=mt+1*rh+rh/2;
          V.note(gNote,{x:X(39.18)+16,y:yCas,tx:X(58),ty:yCas+36,kind:"curve",anchor:"start",
            lines:[["CRISPR-Cas · 39,2 %",true,C.vermell],["l'única defensa que aprèn"]]});
        }

        if(animate&&!RM){
          stems.transition().duration(750).delay((d,i)=>i*18).ease(d3.easeCubicOut).attr("x2",d=>X(d[1]));
          halos.transition().duration(750).delay((d,i)=>i*18).ease(d3.easeCubicOut).attr("cx",d=>X(d[1])).attr("r",d=>rSc(d[1]));
          cores.transition().duration(750).delay((d,i)=>i*18).ease(d3.easeCubicOut).attr("cx",d=>X(d[1]));
          rows.selectAll(".val").transition().duration(320).delay((d,i)=>420+i*18).style("opacity",1);
          gNote.style("opacity",0).transition().delay(680).duration(420).style("opacity",1);
        }

        /* Hover suau (IBV.focus + contorn en tinta + dock) */
        const clear=()=>{
          V.focus(rows,null);
          halos.attr("stroke",null).attr("stroke-width",null);
          tp.hide();
        };
        rows.on("pointerenter",(ev,d)=>{
          V.focus(rows,x=>x[0]===d[0],{dim:.48});
          halos.attr("stroke",x=>x[0]===d[0]?C.ink:null).attr("stroke-width",x=>x[0]===d[0]?1.4:null);
          const extra=DESC[d[0]]||(DORON.has(d[0])?"Descrit el 2018 (Doron et al.)":"");
          tp.show(`<b>${NAME[d[0]]||d[0]}</b> · ${f1(d[1])} % (${f0(Math.round(d[1]/100*N))} genomes)${extra?"<br>"+extra:""}`);
        }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")clear(); });
        document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!el.contains(ev.target))clear(); });

      } else {
        title.textContent="Quants sistemes de defensa té cada genoma";
        sub.textContent="Distribució dels 21.738 genomes segons el nombre de sistemes antivirals (mitjana: 5,2; màxim: 57)";
        const H=mob?290:330, ml=mob?42:54, mr=mob?14:24, mt=mob?46:34, mb=44;
        const agg=HIST.filter(d=>d[0]<30).map(d=>[d[0],d[1]]);
        const rest=HIST.filter(d=>d[0]>=30).reduce((a,d)=>a+d[1],0);
        const data=agg.concat([[30,rest]]);
        const s=V.svg(el,W,H,"Distribució del nombre de sistemes antivirals per genoma en 21.738 bacteris i arqueus: 1.450 genomes no en tenen cap, la mitjana és 5,2 i el màxim arriba a 57.");
        const X=d3.scaleLinear([-0.6,30.6],[ml,W-mr]);
        const Y=d3.scaleLinear([0,3100],[H-mb,mt]);
        const rSc=d3.scaleSqrt([0,3000],[2.2,mob?7.5:10]);

        const g=s.append("g");
        V.gridY(g,Y,ml,W-mr,[0,1000,2000,3000],v=>f0(v),{zero:0,unit:" genomes"});
        V.axisX(g,X,H-mb,[0,5,10,15,20,25,30],v=>v===30?"30+":String(v));
        V.t(g,W-mr,H-6,"Sistemes antivirals per genoma →",{size:11.5,fill:C.ink2,anchor:"end"});

        /* Perfil suau d'aquarel·la sota els punts + fils fins i cercles translúcids (sense barres massisses!) */
        const area=d3.area().x(d=>X(d[0])).y0(Y(0)).y1(d=>Y(d[1])).curve(d3.curveMonotoneX);
        g.append("path").datum(data).attr("d",area).attr("fill",C.blau).attr("fill-opacity",.07);

        /* Línia puntejada de la mitjana (5,2) */
        const xMean=X(5.2);
        g.append("line").attr("x1",xMean).attr("x2",xMean).attr("y1",mt-4).attr("y2",Y(0))
          .attr("stroke",C.ink).attr("stroke-width",1.1).attr("stroke-dasharray","2 3");

        const items=g.selectAll("g.pt").data(data).join("g").attr("class","pt").style("cursor","pointer");
        const stems=items.append("line").attr("x1",d=>X(d[0])).attr("x2",d=>X(d[0])).attr("y1",Y(0)).attr("y2",d=>animate?Y(0):Y(d[1]))
          .attr("stroke",d=>d[0]===0?C.vermell:C.blau).attr("stroke-width",d=>d[0]===0?1.8:1.1).attr("stroke-opacity",.65);
        const halos=items.append("circle").attr("class","halo").attr("cx",d=>X(d[0])).attr("cy",d=>animate?Y(0):Y(d[1]))
          .attr("r",d=>animate?0:rSc(d[1])).attr("fill",d=>d[0]===0?C.vermell:C.blau).attr("fill-opacity",.28).style("mix-blend-mode","multiply");
        const cores=items.append("circle").attr("cx",d=>X(d[0])).attr("cy",d=>animate?Y(0):Y(d[1]))
          .attr("r",2.3).attr("fill",d=>d[0]===0?C.vermell:C.blau);
        items.append("rect").attr("x",d=>X(d[0])-(W-ml-mr)/62).attr("y",mt).attr("width",(W-ml-mr)/31).attr("height",H-mt-mb).attr("fill","transparent");

        const gNote=s.append("g").style("pointer-events","none");
        V.note(gNote,{x:X(0),y:Y(1450)-8,tx:X(0)+(mob?8:14),ty:mt+(mob?-10:4),kind:"elbow",anchor:"start",
          lines:[["1.450 genomes",true,C.vermell],["sense cap sistema"]]});
        V.note(gNote,{x:xMean,y:Y(2712),tx:X(mob?11:10),ty:Y(2712)-(mob?6:0),kind:"straight",anchor:"start",
          lines:[["Mitjana: 5,2",true,C.blau],["sistemes per genoma"]]});
        V.note(gNote,{x:X(30),y:Y(rest)-6,tx:X(30)-4,ty:Y(rest)-(mob?34:46),kind:"elbow",anchor:"end",
          lines:[[mob?"Màxim: 57":"Màxim: 57 sistemes",true],[mob?"":"(Desulfonema limicola)"]]});

        if(animate&&!RM){
          stems.transition().duration(750).delay((d,i)=>i*16).ease(d3.easeCubicOut).attr("y2",d=>Y(d[1]));
          halos.transition().duration(750).delay((d,i)=>i*16).ease(d3.easeCubicOut).attr("cy",d=>Y(d[1])).attr("r",d=>rSc(d[1]));
          cores.transition().duration(750).delay((d,i)=>i*16).ease(d3.easeCubicOut).attr("cy",d=>Y(d[1]));
          gNote.style("opacity",0).transition().delay(620).duration(400).style("opacity",1);
        }

        const clear=()=>{ V.focus(items,null); halos.attr("stroke",null); tp.hide(); };
        items.on("pointerenter",(ev,d)=>{
          V.focus(items,x=>x[0]===d[0],{dim:.48});
          halos.attr("stroke",x=>x[0]===d[0]?C.ink:null).attr("stroke-width",x=>x[0]===d[0]?1.4:null);
          tp.show(`<b>${d[0]===30?"30 o més":d[0]} ${d[0]===1?"sistema":"sistemes"}</b> · ${f0(d[1])} genomes (${f1(d[1]/N*100)} %)`);
        }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")clear(); });
        document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!el.contains(ev.target))clear(); });
      }
    }

    redrawDef=anim=>drawView(anim);
    V.onView(el,inst=>drawView(!inst));
    if(el.__seen)drawView(false);
  });

  seg.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    view=+b.dataset.v;
    [...seg.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    renderLegend();
    if(redrawDef)redrawDef(true);
  });
})();

/* =====================================================================
   6. IB-16 CRISPR PAS A PAS (SCROLLYTELLING ORGÀNIC)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("cr-viz"); if(!vizEl)return;
  const steps=document.getElementById("csteps"), graphic=document.getElementById("cgraphic");
  const nameEl=document.getElementById("cName"), subEl=document.getElementById("cSub"), lgEl=document.getElementById("cr-lg");
  if(lgEl)V.legendCat(lgEl,[
    {c:C.vermell,t:"ADN víric / espaiador nou"},
    {c:C.blau,t:"Cromosoma bacterià"},
    {c:C.groc,t:"Proteïnes Cas / Cas9"}
  ]);

  const NM=["L'arxiu CRISPR","Arriba un virus nou","Un retrat de l'invasor","Una memòria que s'hereta","Retrats en patrulla","El virus torna","La resposta del virus","Del bacteri al laboratori"];
  const TIPS=[
    "<b>Arxiu CRISPR</b> · Repeticions idèntiques (rombes grisos) separades per espaiadors de virus antics, al costat dels gens cas",
    "<b>Infecció nova</b> · L'ADN del virus (vermell) no coincideix amb cap espaiador guardat",
    "<b>Captura d'espaiador</b> · Cas1–Cas2 retallen un fragment al costat del PAM i l'enganxen al principi de l'arxiu",
    "<b>Memòria heretable</b> · En dividir-se el bacteri, les dues filles reben una còpia íntegra de l'arxiu",
    "<b>Patrulla de Cas9</b> · L'arxiu es copia en ARN guia; cada proteïna Cas9 en porta un i vigila la cèl·lula",
    "<b>Tall específic</b> · Cas9 detecta el PAM, comprova la coincidència amb la guia i talla l'ADN víric",
    "<b>Mutació d'escapament</b> · Una sola lletra canviada impedeix el reconeixement; el bacteri pot guardar un nou espaiador",
    "<b>Edició genètica</b> · Canviant les 20 lletres de l'ARN guia, Cas9 talla qualsevol ADN amb un PAM al costat"
  ];
  let st=0, t0=performance.now();
  /* Espaiadors antics estrictament dins la paleta (blaus clars, grocs suaus, grisos) */
  const OLD=[C.blauClar,C.grocClar,C.ghost,"#B6C6DF",C.land];
  const RED=C.vermell, MUT=C.vermellClar;
  const FW=800, FH=540;

  V.mount(vizEl,(el,W)=>{
    const mob=innerWidth<900;
    const H=mob?Math.round(clamp(Math.min(innerHeight*.38,W*.78),210,330)):Math.round(clamp(Math.min(innerHeight-240,W*.68),300,520));
    const {c:cv,ctx:c}=V.canvas(el,W,H,"Esquema del sistema immunitari CRISPR: l'arxiu d'espaiadors al cromosoma, la captura d'un fragment de virus per Cas1-Cas2, l'herència a les cèl·lules filles, les guies d'ARN a Cas9 i l'edició d'ADN humà.");
    const tp=V.tip(el);
    V.hover(cv,()=>{ tp.show(TIPS[st]); },()=>tp.hide());

    const K=Math.min(W/FW,H/FH), ox=(W-FW*K)/2, oy=(H-FH*K)/2;
    const X=x=>ox+x*K, Y=y=>oy+y*K;
    const fs=mob?11:12.5;

    function arrayAt(x0,y,k,spc,newA){
      const sw=46*k, rw=14*k, h=24*k; let x=x0;
      c.fillStyle=C.land; c.strokeStyle=C.hair; c.lineWidth=.8;
      c.fillRect(X(x),Y(y-h/2),26*k*K,h*K); c.strokeRect(X(x),Y(y-h/2),26*k*K,h*K); x+=30*k;
      const ent=(cl,a)=>{
        c.globalAlpha=a; c.fillStyle=C.ink2;
        c.beginPath(); c.moveTo(X(x),Y(y)); c.lineTo(X(x+rw/2),Y(y-h/2)); c.lineTo(X(x+rw),Y(y)); c.lineTo(X(x+rw/2),Y(y+h/2)); c.closePath(); c.fill();
        x+=rw+2*k; c.fillStyle=cl; c.fillRect(X(x),Y(y-h/2+2*k),sw*K,(h-4*k)*K);
        if(cl===MUT){ c.strokeStyle=C.vermell; c.lineWidth=.9; c.strokeRect(X(x),Y(y-h/2+2*k),sw*K,(h-4*k)*K); }
        x+=sw+2*k; c.globalAlpha=1;
      };
      spc.forEach((cl,i)=>ent(cl,i===0&&newA!=null?newA:1));
      c.fillStyle=C.ink2; c.beginPath(); c.moveTo(X(x),Y(y)); c.lineTo(X(x+rw/2),Y(y-h/2)); c.lineTo(X(x+rw),Y(y)); c.lineTo(X(x+rw/2),Y(y+h/2)); c.closePath(); c.fill();
      return {lead:[x0+13*k,y],first:[x0+30*k+rw+2*k+sw/2,y],end:x+rw};
    }
    function chromLine(x0,x1,y,k){
      c.strokeStyle=C.blau; c.lineWidth=Math.max(1,1.8*K*k);
      [-6,6].forEach(d=>{ c.beginPath(); c.moveTo(X(x0),Y(y+d*k)); c.lineTo(X(x1),Y(y+d*k)); c.stroke(); });
    }
    function casGenes(x0,y,k){
      const w=[28,30,40,26].map(v=>v*k); let x=x0;
      w.forEach((ww,i)=>{
        c.fillStyle=i===2?C.groc:C.grocClar; c.strokeStyle=C.grocFosc; c.lineWidth=.9;
        c.beginPath(); c.moveTo(X(x),Y(y-10*k)); c.lineTo(X(x+ww-6*k),Y(y-10*k)); c.lineTo(X(x+ww),Y(y));
        c.lineTo(X(x+ww-6*k),Y(y+10*k)); c.lineTo(X(x),Y(y+10*k)); c.closePath(); c.fill(); c.stroke();
        x+=ww+3*k;
      });
      return x;
    }
    function cellBox(x0,y0,x1,y1,a){
      c.save(); c.globalAlpha=a==null?1:a;
      c.fillStyle=V.alpha(C.blau,.05); c.strokeStyle=C.blau; c.lineWidth=Math.max(1.2,2.4*K);
      c.beginPath(); c.roundRect(X(x0),Y(y0),(x1-x0)*K,(y1-y0)*K,56*K); c.fill(); c.stroke(); c.restore();
    }
    function phageIcon(x,y,k,a,col){
      c.save(); c.globalAlpha=a==null?1:a; c.translate(X(x),Y(y)); c.scale(K*k,K*k);
      c.fillStyle=C.ink2; c.fillRect(-6,-46,12,46); c.fillStyle=C.ink; c.fillRect(-12,-6,24,7);
      c.strokeStyle=C.ink2; c.lineWidth=1.4; c.beginPath(); c.moveTo(-10,-3); c.lineTo(-24,-18); c.lineTo(-30,4); c.moveTo(10,-3); c.lineTo(24,-18); c.lineTo(30,4); c.stroke();
      c.beginPath(); c.moveTo(0,-46); c.lineTo(20,-56); c.lineTo(20,-90); c.lineTo(0,-100); c.lineTo(-20,-90); c.lineTo(-20,-56); c.closePath();
      c.fillStyle=col||V.alpha(C.vermell,.2); c.fill(); c.strokeStyle=C.ink; c.lineWidth=1.4; c.stroke(); c.restore();
    }
    function phageDNA(x0,x1,y,p0,p1,col,a,cut,mutX){
      c.save(); c.globalAlpha=a==null?1:a; c.lineCap="round";
      const segL=(xa,xb,cl,lw)=>{
        c.strokeStyle=cl; c.lineWidth=lw*K; c.beginPath();
        for(let x=xa;x<=xb;x+=4){ const yy=y+Math.sin(x*.06)*5; x===xa?c.moveTo(X(x),Y(yy)):c.lineTo(X(x),Y(yy)); } c.stroke();
      };
      const g=cut?cut*26:0;
      segL(x0,p0-g,col,2.6); segL(p1+g,x1,col,2.6);
      if(!cut||cut<1){ c.globalAlpha=(a==null?1:a)*(1-(cut||0)); segL(p0,p1,col,6.2); c.globalAlpha=a==null?1:a; }
      /* PAM en tinta negra (alt contrast, zero ocre) */
      c.fillStyle=C.ink; c.fillRect(X(p1+4+g),Y(y-8),12*K,16*K);
      if(mutX!=null){
        const mx=p0+(p1-p0)*mutX;
        c.fillStyle=C.paper; c.fillRect(X(mx-3.5),Y(y-6.5),7*K,13*K);
        c.strokeStyle=C.ink; c.lineWidth=1.4; c.strokeRect(X(mx-3.5),Y(y-6.5),7*K,13*K);
      }
      c.restore();
    }
    /* Cas9 i Cas1-Cas2: discs orgànics translúcids grocs (mai text en groc!) */
    function cas9(x,y,k,guide,a){
      c.save(); c.globalAlpha=a==null?1:a;
      c.fillStyle=V.alpha(C.groc,.36); c.strokeStyle=C.grocFosc; c.lineWidth=Math.max(1.1,1.6*K);
      c.beginPath(); c.ellipse(X(x),Y(y),34*K*k,24*K*k,0,0,6.2832); c.fill(); c.stroke();
      if(guide){
        c.strokeStyle=guide; c.lineWidth=Math.max(2,4.6*K*k); c.lineCap="round";
        c.beginPath(); c.moveTo(X(x-22*k),Y(y+6*k)); c.lineTo(X(x+22*k),Y(y+6*k)); c.stroke();
      }
      c.restore();
    }
    function cas12(x,y,k,a){
      c.save(); c.globalAlpha=a==null?1:a;
      c.fillStyle=V.alpha(C.groc,.48); c.strokeStyle=C.grocFosc; c.lineWidth=1;
      c.beginPath(); c.arc(X(x-9*k),Y(y),11*K*k,0,6.2832); c.fill(); c.stroke();
      c.beginPath(); c.arc(X(x+9*k),Y(y),11*K*k,0,6.2832); c.fill(); c.stroke();
      c.restore();
    }
    const LBL=(px,py,lines,tx,ty,al,a)=>{
      if(a<=0)return;
      lead(c,X(px),Y(py),X(tx),Y(ty),C.ink,a);
      txt(c,lines,X(tx)+(al==="right"?-4:al==="center"?0:4),Y(ty)+(ty<py?-4-(lines.length-1)*fs*1.28:fs),al,fs,a);
    };

    function draw(){
      const now=performance.now(), t=RM?99:(now-t0)/1000, la=k=>clamp((t-k)/.5,0,1);
      c.clearRect(0,0,W,H);
      const base=OLD.slice(0,4);

      if(st<=2||st===4||st===5||st===6){
        cellBox(30,108,770,515); chromLine(60,740,438,1); casGenes(90,438,1);
        let spc=base.slice(), newA=null;
        if(st===2){ const q=clamp((t-2.2)/1,0,1); if(q>0){ spc=[RED].concat(base); newA=q; } }
        if(st>=4)spc=[RED].concat(base);
        if(st===6&&t>4.2){ spc=[MUT,RED].concat(base); newA=clamp((t-4.2)/.8,0,1); }
        const ar=arrayAt(250,438,1,spc,newA);

        if(st===0){
          LBL(150,428,[["Gens cas",true,C.ink]],150,358,"center",la(.2));
          LBL(263,428,[["Líder",true]],250,318,"center",la(.4));
          LBL(287,426,[["Repetició",true]],330,242,"left",la(.6));
          LBL(ar.first[0]+110,426,[["Espaiadors: retrats",true],["de virus antics",false,C.ink2]],ar.first[0]+188,374,"left",la(.8));
        }
        if(st===1||st===2||st===5||st===6){
          const col=st===6?MUT:RED, inj=st===1?ease(clamp((t-.3)/1.4,0,1)):1;
          phageIcon(400,110,1,1,st===6?V.alpha(C.vermellClar,.45):V.alpha(C.vermell,.2));
          const cut=st===5?ease(clamp((t-3)/1,0,1)):0;
          if(inj>0)phageDNA(400-260*inj,400+260*inj,242,360,430,col,st===5?1-clamp((t-4.5)/1,0,1)*.7:st===2?1-clamp((t-3.6)/1,0,1)*.75:1,cut,st===6?.55:null);
        }
        if(st===1){
          LBL(470,242,[["ADN del virus",true,RED]],555,182,"left",la(1.6));
          LBL(500,428,[["Cap espaiador",true],["hi coincideix",false,C.ink2]],615,350,"left",la(2.2));
        }
        if(st===2){
          const g1=ease(clamp(t/1,0,1)), mv=ease(clamp((t-1)/1.3,0,1));
          const sx=lerp(560,395,g1), sy=lerp(322,242,g1), px=lerp(395,ar.lead[0]+30,mv), py=lerp(242,438,mv);
          cas12(mv>0?px:sx,mv>0?py-18:sy-18,1.1,clamp(1.6-(t-2.2),0,1));
          if(mv>0&&t<3.2){ c.save(); c.strokeStyle=RED; c.lineWidth=6.2*K; c.beginPath(); c.moveTo(X(px-34),Y(py)); c.lineTo(X(px+34),Y(py)); c.stroke(); c.restore(); }
          LBL(437,244,[["PAM",true,C.ink]],470,182,"left",la(.3));
          LBL(sx+12,sy-20,[["Cas1–Cas2",true,C.ink]],sx+60,162,"left",la(.3)*(1-mv));
          LBL(ar.first[0],428,[["Espaiador nou,",true,RED],["al principi de l'arxiu",false,C.ink2]],ar.first[0]+60,322,"left",la(3));
        }
        if(st===4){
          const tr=ease(clamp(t/1.2,0,1)), ct=ease(clamp((t-1.4)/1,0,1)), ld=ease(clamp((t-2.6)/1.4,0,1));
          const x0=280, x1=ar.end, pieces=spc.length, pw=(x1-x0)/pieces;
          for(let i=0;i<pieces;i++){
            const tx0=x0+i*pw, yy=388-ct*(30+i*8)-ld*(60+(i%2)*40), xx=lerp(tx0,180+i*120,ld), len=pw*.8*tr;
            c.strokeStyle=spc[i]; c.lineWidth=4.6*K; c.beginPath(); c.moveTo(X(xx),Y(yy)); c.lineTo(X(xx+len),Y(yy)); c.stroke();
            if(ld>0)cas9(xx+len/2,yy-4,1,null,ld);
          }
          LBL(330,386,[["ARN copiat de l'arxiu",true]],250,310,"right",la(.6)*(1-ld));
          LBL(240,298,[["Cas9 amb el seu",true,C.ink],["ARN guia",false,C.ink2]],140,182,"left",la(3));
        }
        if(st===5){
          const sc=ease(clamp((t-.8)/1.8,0,1)), cx=lerp(200,395,sc), cy=lerp(322,254,sc);
          cas9(cx,cy,1.1,RED,1);
          [1,2,3].forEach(i=>cas9(140+i*130,352+(i%2)*28,.9,OLD[i],.55));
          LBL(437,244,[["PAM",true,C.ink]],480,172,"left",la(.4));
          if(t>3)LBL(395,242,[["Coincideix: tall!",true,C.vermell]],555,322,"left",la(3));
        }
        if(st===6){
          const sc=ease(clamp((t-.5)/1.6,0,1)), cx=lerp(200,395,sc), cy=lerp(322,254,sc), pass=ease(clamp((t-2.4)/1.2,0,1));
          cas9(cx+pass*230,cy+pass*60,1.1,RED,1);
          LBL(398,244,[["Una lletra canviada",true,C.vermell]],300,164,"right",la(1));
          if(t>2.4)LBL(cx+pass*230,cy+pass*60-26,[["No coincideix:",true],["el virus s'escapa",false,C.ink2]],640,182,"left",la(2.6));
          if(t>4.2)LBL(ar.first[0],428,[["Nou espaiador,",true,C.vermell],["contra el mutant",false,C.ink2]],ar.first[0]+60,322,"left",la(4.4));
        }
      }
      if(st===3){
        const d=ease(clamp((t-.3)/1.8,0,1)), k=lerp(1,.84,d), spc=[RED].concat(base), gap=22*d, mid=312;
        if(d<.02)cellBox(30,108,770,515);
        else {
          const r=56*K*d, r0=56*K; c.save(); c.fillStyle=V.alpha(C.blau,.05); c.strokeStyle=C.blau; c.lineWidth=Math.max(1.2,2.4*K);
          [[108,mid-gap/2,[r0,r0,r,r]],[mid+gap/2,515,[r,r,r0,r0]]].forEach(([a,b,rr])=>{ c.beginPath(); c.roundRect(X(30),Y(a),740*K,(b-a)*K,rr); c.fill(); c.stroke(); });
          c.restore();
        }
        [lerp(438,210,d),lerp(438,418,d)].forEach(yc=>{ chromLine(60,740,yc,k); casGenes(90,yc,k); arrayAt(90+160*k,yc,k,spc); });
        if(d>=1){
          const ex=90+160*k+(30+5*64+14)*k, a=la(2.2);
          if(a>0){ lead(c,X(ex+4),Y(216),X(ex+40),Y(250),C.ink,a); lead(c,X(ex+4),Y(412),X(ex+40),Y(284),C.ink,a); txt(c,[["Les dues filles",true],["recorden el virus",false,C.ink2]],X(ex+46),Y(258),"left",fs,a); }
        }
      }
      if(st===7){
        /* P1: sense caixa grisa de fons — l'ADN humà es dibuixa directament sobre el paper blanc */
        const sc=ease(clamp((t-.4)/1.6,0,1)), cut=ease(clamp((t-2.4)/.8,0,1));
        const y=296; c.save(); c.lineCap="round"; const gx=cut*18;
        [[60,400-gx],[400+gx,740]].forEach(([a,b])=>{
          c.strokeStyle=C.ink; c.lineWidth=2.2*K;
          for(const off of [-8,8]){
            c.beginPath(); for(let x=a;x<=b;x+=4){ const yy=y+off*Math.cos(x*.05); x===a?c.moveTo(X(x),Y(yy)):c.lineTo(X(x),Y(yy)); } c.stroke();
          }
        }); c.restore();
        c.fillStyle=C.vermell; c.fillRect(X(432+gx),Y(y-10),14*K,20*K);
        cas9(lerp(170,405,sc),lerp(190,y-4,sc),1.3,C.blau,1);
        if(!mob||W>360){
          const G="GACCUGUUCAGCGAUAGCAC", T="GACCTGTTCAGCGATAGCAC", f=11.5;
          const bx=X(210), by=Y(428), cw=Math.min(15,(W-bx-44)/24);
          txt(c,[["ARN guia (20 lletres a mida, d'exemple)",false,C.blau]],bx,by-8,"left",f,la(1.4));
          c.save(); c.globalAlpha=la(1.4); c.font=`600 ${f}px ui-monospace,Menlo,monospace`; c.textAlign="center";
          for(let i=0;i<20;i++){ c.fillStyle=C.blau; c.fillText(G[i],bx+i*cw+cw/2,by+f+4); c.fillStyle=C.ink; c.fillText(T[i],bx+i*cw+cw/2,by+2*f+11); }
          c.fillStyle=C.vermell; c.fillText("PAM",bx+20*cw+cw*1.6,by+2*f+11);
          c.textAlign="right"; c.font=`${f}px ${SSF}`; c.fillStyle=C.blau; c.fillText("ARN",bx-6,by+f+4); c.fillStyle=C.ink; c.fillText("ADN",bx-6,by+2*f+11); c.restore();
        }
        LBL(300,y,[["ADN d'una cèl·lula humana",true]],120,152,"left",la(.2));
        LBL(439+gx,y-10,[["PAM",true,C.vermell]],520,162,"left",la(.8));
        if(t>2.6)LBL(400,y,[["Tall a mida",true,C.blau]],600,230,"left",la(2.8));
      }
    }

    if(el.__loop)el.__loop.stop();
    el.__loop=V.loop(el,draw);
  });

  if(window.IB&&IB.scrolly){
    IB.scrolly(steps,graphic,i=>{
      st=i; t0=performance.now();
      nameEl.textContent=NM[i];
      subEl.textContent=i===7?"Esquema · seqüència d'exemple":"Esquema del mecanisme immunitari bacterià";
    });
  }
})();

/* =====================================================================
   7. SIMULACIÓ DE LA MEMÒRIA CRISPR + SÈRIE TEMPORAL IB-01
   ===================================================================== */
(function(){
  const simEl=document.getElementById("sim-viz"), chEl=document.getElementById("simChart-viz");
  if(!simEl||!chEl)return;
  const btns=document.getElementById("simBtns"), cnt=document.getElementById("simCnt"), msg=document.getElementById("simMsg"), reset=document.getElementById("simReset"), lgEl=document.getElementById("sim-lg");

  /* Paleta estricta: Virus A vermell, Virus B groc, Mutant vermell clar, Anti-CRISPR tinta */
  const VC=[C.vermell,C.groc,C.vermellClar,C.ink];
  const VN=["virus A","virus B","el virus A mutant","el virus A amb anti-CRISPR"];
  const SPN=["Virus A","Virus B","A mutant"];
  const CHH=146, NS=240;

  if(lgEl)V.legendCat(lgEl,[
    {c:C.blau,t:"Bacteri viu",kind:"hollow"},
    {c:C.vermell,t:"Infectat / espaiador A"},
    {c:C.groc,t:"Espaiador B / tall CRISPR"},
    {c:C.vermellClar,t:"Espaiador mutant"}
  ]);

  let W=0, H=0, c=null, cc=null, CW=0, cols=0, rows=0, R=10;
  let cells=[], hist=[], fx=[], simT=0, lastSample=0, evt=null, hovIdx=-1, tp=null;

  function init(){
    cells=[];
    for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){
      cells.push({r,q,x:R+q*R*2+(r%2?R:0),y:R+r*R*1.75,st:1,sp:[],v:-1,tm:0,fl:0});
    }
    hist=[]; simT=0; lastSample=0; fx=[]; evt=null; hovIdx=-1;
    msg.textContent="La colònia encara no ha vist cap virus. Cap bacteri no té espaiadors.";
    updCnt();
  }
  const nb=i=>{
    const a=cells[i], o=a.r%2?[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]:[[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];
    const out=[]; o.forEach(([dr,dq])=>{ const r=a.r+dr, q=a.q+dq; if(r>=0&&r<rows&&q>=0&&q<cols)out.push(r*cols+q); }); return out;
  };
  const spOf=v=>v===3?0:v;
  function attack(i,v){
    const a=cells[i]; if(a.st!==1)return;
    const known=a.sp.includes(spOf(v)), E=evt&&evt.v===v?evt:null;
    if(known&&v!==3){ a.fl=1; if(E)E.res++; return; }
    if(Math.random()<(v===3?.07:.015))return;
    if(v!==3&&Math.random()<.035){ a.sp.unshift(spOf(v)); if(a.sp.length>4)a.sp.pop(); if(E)E.acq++; return; }
    a.st=2; a.v=v; a.tm=.55+Math.random()*.4; if(E)E.inf++;
  }
  function release(v,at){
    const alive=cells.map((a,i)=>a.st===1?i:-1).filter(i=>i>=0);
    if(!alive.length){ msg.textContent="No queda cap bacteri. Torna a començar."; return; }
    evt={v,res:0,acq:0,inf:0,dead:0,t:simT,known:alive.filter(i=>cells[i].sp.includes(spOf(v))).length/alive.length,n:alive.length};
    const seeds=at!=null?[at].concat(nb(at)):d3.range(4).map(()=>alive[Math.floor(Math.random()*alive.length)]);
    seeds.forEach(i=>attack(i,v));
    const p=Math.round(evt.known*100);
    msg.textContent=v===3?(evt.known>.3?`El ${p} % dels bacteris recorden el virus A, però aquest porta un anti-CRISPR que bloqueja la memòria.`:"Aquest virus A porta un anti-CRISPR: encara que el bacteri el recordi, no el pot tallar."):
      v===2?(cells.some(a=>a.sp.includes(0))?"El mutant té una lletra canviada: l'espaiador del virus A no el reconeix.":"Un mutant del virus A ataca la colònia."):
      evt.known>.5?`El ${p} % dels bacteris ja tenen un espaiador de ${VN[v]}. A veure què passa…`:`${VN[v][0].toUpperCase()+VN[v].slice(1)} ataca. Gairebé cap bacteri no el coneix.`;
    if(RM){ for(let k=0;k<80;k++)step(.05); drawColony(); drawChart(); }
  }
  function step(dt){
    simT+=dt;
    for(let i=0;i<cells.length;i++){
      const a=cells[i]; if(a.fl>0)a.fl=Math.max(0,a.fl-dt*1.4);
      if(a.st===2){
        a.tm-=dt;
        if(a.tm<=0){
          const v=a.v; a.st=0; a.sp=[]; a.v=-1; if(evt&&evt.v===v)evt.dead++;
          fx.push({x:a.x,y:a.y,t:0});
          nb(i).forEach(j=>{ if(Math.random()<.75)attack(j,v); });
          const n2=nb(i), j=n2[Math.floor(Math.random()*n2.length)];
          if(j!=null)nb(j).forEach(k=>{ if(Math.random()<.18)attack(k,v); });
        }
      }
    }
    for(let i=0;i<cells.length;i++){
      const a=cells[i]; if(a.st!==0)continue;
      const al=nb(i).filter(j=>cells[j].st===1);
      if(al.length&&Math.random()<dt*1.3*al.length/6){
        const m=cells[al[Math.floor(Math.random()*al.length)]];
        a.st=1; a.sp=m.sp.slice(); a.fl=0;
      }
    }
    fx.forEach(f=>f.t+=dt); fx=fx.filter(f=>f.t<.6);
    const infV=evt?cells.some(a=>a.st===2&&a.v===evt.v):false;
    if(evt&&!infV&&simT-evt.t>1){
      const e=evt; evt=null; const alive=cells.filter(a=>a.st===1).length;
      if(alive===0)msg.textContent="La colònia ha desaparegut. Torna a començar.";
      else if(e.v===3)msg.textContent=`L'anti-CRISPR ha desactivat la memòria: han mort ${e.dead} bacteris, fins i tot els que recordaven el virus A. N'han sobreviscut uns quants per sort o gràcies a altres defenses.`;
      else if(e.dead<5&&e.res>0)msg.textContent=`L'atac ha fracassat: ${e.res} bacteris han reconegut el virus i l'han tallat. La memòria funciona.`;
      else if(e.acq>0)msg.textContent=`Han mort ${e.dead} bacteris, però ${e.acq===1?"un ha sobreviscut i ha":e.acq+" han sobreviscut i han"} guardat un espaiador nou. Els seus descendents ja l'hereten. Torna-hi!`;
      else msg.textContent=`Han mort ${e.dead} bacteris i cap no ha guardat el virus. Prova-ho una altra vegada.`;
    }
    if(simT-lastSample>.25){
      lastSample=simT; const n=cells.length||1, f=k=>cells.filter(a=>a.st===1&&a.sp.includes(k)).length/n;
      hist.push([cells.filter(a=>a.st===1).length/n,f(0),f(1),f(2)]);
      if(hist.length>NS)hist.shift();
      updCnt();
    }
  }
  function updCnt(){
    const n=cells.length||1, al=cells.filter(a=>a.st===1).length, f=k=>cells.filter(a=>a.st===1&&a.sp.includes(k)).length;
    cnt.innerHTML=`<li><span><i style="background:${C.blau}"></i>Bacteris vius</span><b>${Math.round(al/n*100)} %</b></li>`+
      `<li><span><i style="background:${VC[0]}"></i>Recorden el virus A</span><b>${Math.round(f(0)/n*100)} %</b></li>`+
      `<li><span><i style="background:${VC[1]}"></i>Recorden el virus B</span><b>${Math.round(f(1)/n*100)} %</b></li>`+
      `<li><span><i style="background:${VC[2]}"></i>Recorden el mutant</span><b>${Math.round(f(2)/n*100)} %</b></li>`;
  }
  function drawColony(){
    if(!W||!c)return;
    c.clearRect(0,0,W,H); const r=R*.82;
    for(let idx=0;idx<cells.length;idx++){
      const a=cells[idx], isHov=idx===hovIdx;
      if(a.st===0){
        c.save(); c.setLineDash([2,2]); c.strokeStyle=isHov?C.ink:C.hair; c.lineWidth=isHov?1.2:.8;
        c.beginPath(); c.arc(a.x,a.y,r,0,6.2832); c.stroke(); c.restore(); continue;
      }
      c.save(); c.beginPath(); c.arc(a.x,a.y,r,0,6.2832); c.clip();
      c.fillStyle=a.st===2?V.alpha(C.vermell,.26):V.alpha(C.blau,.11); c.fillRect(a.x-r,a.y-r,2*r,2*r);
      a.sp.forEach((k,i)=>{ c.fillStyle=VC[k]; c.fillRect(a.x-r+2+i*(r*.55),a.y-r,r*.42,2*r); });
      c.restore();
      c.strokeStyle=isHov?C.ink:a.st===2?C.vermell:C.blau; c.lineWidth=isHov?1.8:a.st===2?1.7:1;
      c.beginPath(); c.arc(a.x,a.y,r,0,6.2832); c.stroke();
      if(a.fl>0){
        c.save(); c.strokeStyle=C.groc; c.globalAlpha=a.fl; c.lineWidth=2.8;
        c.beginPath(); c.arc(a.x,a.y,r+2.8,0,6.2832); c.stroke();
        c.strokeStyle=C.ink; c.globalAlpha=a.fl*.55; c.lineWidth=.8;
        c.beginPath(); c.arc(a.x,a.y,r+4.2,0,6.2832); c.stroke(); c.restore();
      }
    }
    for(const f of fx){
      c.fillStyle=C.vermell; c.globalAlpha=1-f.t/.6;
      for(let k=0;k<7;k++){ const an=k/7*6.2832, d=R*(.5+f.t*3); c.beginPath(); c.arc(f.x+Math.cos(an)*d,f.y+Math.sin(an)*d,1.5,0,6.2832); c.fill(); }
      c.globalAlpha=1;
    }
  }
  function drawChart(){
    if(!CW||!cc)return;
    const ml=36, mr=8, mt=12, mb=20, ph=CHH-mt-mb, pw=CW-ml-mr, Yc=v=>mt+ph*(1-v);
    cc.clearRect(0,0,CW,CHH);
    [0,.5,1].forEach(v=>{
      cc.strokeStyle=v===0?C.ink:C.grid; cc.lineWidth=v===0?.9:.7;
      cc.beginPath(); cc.moveTo(ml,Yc(v)+.5); cc.lineTo(CW-mr,Yc(v)+.5); cc.stroke();
      txt(cc,[[Math.round(v*100)+" %",false,C.muted]],ml-6,Yc(v)+4,"right",11,1,false);
    });
    const n=hist.length;
    if(n>1){
      [[1,VC[0],1.6],[2,C.groc,2.2],[3,VC[2],1.8],[0,C.blau,2]].forEach(([k,col,lw])=>{
        cc.strokeStyle=col; cc.lineWidth=lw; cc.lineJoin="round"; cc.beginPath();
        hist.forEach((h,i)=>{ const x=ml+i*(pw/(NS-1)), y=Yc(h[k]); i?cc.lineTo(x,y):cc.moveTo(x,y); });
        cc.stroke();
        const lx=ml+(n-1)*(pw/(NS-1)), ly=Yc(hist[n-1][k]);
        cc.fillStyle=col===C.groc?C.grocFosc:col; cc.beginPath(); cc.arc(lx,ly,2.6,0,6.2832); cc.fill();
      });
    }
    txt(cc,[["Evolució (últims 60 s) →",false,C.muted]],CW-mr,CHH-4,"right",11,1,false);
  }

  V.mount(simEl,(el,w)=>{
    W=w; const mob=w<560; R=mob?9.5:11;
    cols=Math.max(10,Math.floor((W-R)/(R*2))); rows=mob?14:16;
    H=Math.round(rows*R*1.75+R*1.2);
    const {c:cv,ctx}=V.canvas(el,W,H,"Simulació d'una colònia de bacteris: en alliberar un virus, els bacteris sense espaiador moren, alguns supervivents guarden un espaiador i transmeten la immunitat als seus descendents.");
    c=ctx;
    if(cells.length!==cols*rows)init();
    tp=V.tip(el);
    cv.style.cursor="pointer";
    V.hover(cv,(ev,[mx,my])=>{
      let bi=-1, bd=(R*1.4)**2;
      for(let i=0;i<cells.length;i++){ const d=(cells[i].x-mx)**2+(cells[i].y-my)**2; if(d<bd){ bd=d; bi=i; } }
      hovIdx=bi;
      if(bi<0){ tp.hide(); return; }
      const a=cells[bi];
      if(a.st===0)tp.show("<b>Lloc buit</b> · Un bacteri veí el reomplirà en dividir-se");
      else if(a.st===2)tp.show(`<b>Bacteri infectat</b> (${VN[a.v]}) · A punt de patir lisi`);
      else {
        const spTxt=a.sp.length?a.sp.map(k=>SPN[k]).join(", "):"cap (vulnerable)";
        tp.show(`<b>Bacteri viu</b> · Espaiadors: ${spTxt} · Clica per deixar-hi caure un virus A`);
      }
      if(RM)drawColony();
    },()=>{ hovIdx=-1; tp.hide(); if(RM)drawColony(); });
    cv.addEventListener("click",e=>{
      const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
      let bi=-1, bd=1e9;
      cells.forEach((a,i)=>{ const d=(a.x-mx)**2+(a.y-my)**2; if(d<bd){ bd=d; bi=i; } });
      if(bi>=0)release(0,bi);
    });
    if(el.__loop)el.__loop.stop();
    el.__loop=V.loop(el,(t,dt)=>{ if(!RM)step(Math.min(dt/1000,.05)); drawColony(); drawChart(); });
    drawColony();
  });

  V.mount(chEl,(el,w)=>{
    CW=w; const {ctx}=V.canvas(el,CW,CHH,"Evolució temporal del percentatge de bacteris vius i dels que recorden cada virus en els últims 60 segons.");
    cc=ctx; drawChart();
  });

  btns.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; release(+b.dataset.v); });
  reset.addEventListener("click",()=>{ init(); drawColony(); drawChart(); });
})();

/* =====================================================================
   8. IB-49 LÍNIA DEL TEMPS DEL CRISPR (1987–2023)
   ===================================================================== */
(function(){
  const vizEl=document.getElementById("tline-viz"); if(!vizEl)return;
  const card=document.getElementById("tlCard"), lgEl=document.getElementById("tline-lg");
  if(lgEl)V.legendCat(lgEl,[
    {c:C.blau,t:"Descobriment biològic (1987–2011)"},
    {c:C.vermell,t:"Eina i clínica (2012–2023)"}
  ]);

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
    [2023,"El primer medicament","El 15 de novembre, el Regne Unit autoritza el Casgevy, el primer medicament basat en CRISPR, per a l'anèmia falciforme i la beta-talassèmia que depèn de transfusions.","MHRA"]
  ];

  let sel=4, renderSel=null;
  function updCard(){
    const e=EV[sel];
    card.innerHTML=`<h3><span class="y">${e[0]}</span>${e[1]}</h3><p>${e[2]}</p><p class="tsrc">${e[3]}</p>`;
    if(renderSel)renderSel();
  }

  V.mount(vizEl,(el,W)=>{
    const mob=W<560, H=mob?108:118, ml=18, mr=18, y0=mob?60:66;
    const s=V.svg(el,W,H,"Línia del temps del CRISPR del 1987 al 2023: repeticions a E. coli, Mojica a Alacant, el nom CRISPR, l'origen víric dels espaiadors, la prova experimental, Cas9 com a eina, el Nobel del 2020 i el primer medicament el 2023.");
    s.attr("tabindex",0);
    const X=d3.scaleLinear([1985,2025],[ml,W-mr]);
    const g=s.append("g");

    /* Línia base fina i eix temporal IBV */
    g.append("line").attr("x1",X(1985)).attr("x2",X(2025)).attr("y1",y0).attr("y2",y0).attr("stroke",C.hair).attr("stroke-width",1);
    const ticks=mob?[1985,1995,2005,2015,2025]:d3.range(1985,2026,5);
    V.axisX(g,X,y0,ticks,y=>String(y));

    const gSel=g.append("g").style("pointer-events","none");
    const pts=g.append("g").selectAll("g.ev").data(EV).join("g").attr("class","ev").style("cursor","pointer");
    pts.each(function(e,i){
      const q=d3.select(this), x=X(e[0]), col=e[0]>=2012?C.vermell:C.blau;
      q.append("circle").attr("class","halo").attr("cx",x).attr("cy",y0).attr("r",mob?8:10.5)
        .attr("fill",col).attr("fill-opacity",.22).style("mix-blend-mode","multiply");
      q.append("circle").attr("class","core").attr("cx",x).attr("cy",y0).attr("r",mob?3:3.5)
        .attr("fill",col).attr("stroke","#fff").attr("stroke-width",1.2);
      q.append("rect").attr("x",x-11).attr("y",y0-28).attr("width",22).attr("height",46).attr("fill","transparent");
    });

    const tp=V.tip(el);
    renderSel=function(){
      const e=EV[sel], x=X(e[0]), col=e[0]>=2012?C.vermell:C.blau;
      gSel.selectAll("*").remove();
      gSel.append("line").attr("x1",x).attr("x2",x).attr("y1",y0-13).attr("y2",y0-32).attr("stroke",C.ink).attr("stroke-width",.9);
      V.t(gSel,clamp(x,26,W-26),y0-38,String(e[0]),{size:mob?13.5:15,weight:700,fill:col,anchor:"middle",halo:3.5});
      pts.each(function(d,i){
        const on=i===sel, q=d3.select(this);
        q.select(".halo").attr("r",on?(mob?12:15):(mob?8:10.5)).attr("fill-opacity",on?.34:.2);
        q.select(".core").attr("r",on?4.6:(mob?3:3.5)).attr("stroke",on?C.ink:"#fff").attr("stroke-width",on?1.6:1.2);
      });
    };

    pts.on("pointerenter",(ev,d)=>{
      V.focus(pts,x=>x[0]===d[0],{dim:.48});
      tp.show(`<b>${d[0]} · ${d[1]}</b> · Clica per llegir-ne el detall`);
    }).on("pointerleave",ev=>{
      if(ev.pointerType==="mouse"){ V.focus(pts,null); tp.hide(); }
    }).on("click",(ev,d)=>{
      sel=EV.indexOf(d); updCard();
      tp.show(`<b>${d[0]} · ${d[1]}</b>`);
    });
    s.on("keydown",e=>{
      if(e.key==="ArrowRight"){ sel=Math.min(EV.length-1,sel+1); updCard(); }
      if(e.key==="ArrowLeft"){ sel=Math.max(0,sel-1); updCard(); }
    });
    document.addEventListener("pointerdown",ev=>{ if(ev.pointerType!=="mouse"&&!el.contains(ev.target)){ V.focus(pts,null); tp.hide(); } });

    renderSel();
    V.onView(el,inst=>{
      if(inst)return;
      pts.style("opacity",0).transition().delay((d,i)=>i*35).duration(420).ease(d3.easeCubicOut).style("opacity",1);
    });
  });

  document.getElementById("tlPrev").addEventListener("click",()=>{ sel=Math.max(0,sel-1); updCard(); });
  document.getElementById("tlNext").addEventListener("click",()=>{ sel=Math.min(EV.length-1,sel+1); updCard(); });
  updCard();
})();
})();
