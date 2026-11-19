/* «Una vida, quatre evangelis» · gràfics (sense els mapes, que són a mapes.js)
   Peces del sistema: IB-49 (temps profund) al calendari, IB-40 (flux) a la setmana de Marc,
   IB-50 (coordenades paral·leles) a les escenes, IB-11/IB-51 (unitats que es reagrupen) a la biblioteca,
   IB-18 (arcs d'enllaç) a les taules d'Eusebi, IB-20 (petits múltiples) al vocabulari. */
(function(){
  if(!window.d3||!window.IBV||!window.EVG)return;
  const V=IBV, C=V.C, E=window.EVG;
  const B=["Mt","Mc","Lc","Jn"], NOM={Mt:"Mateu",Mc:"Marc",Lc:"Lluc",Jn:"Joan"};
  const f0=V.fmt(",.0f"), pc=v=>V.fmt(".0f")(v*100)+" %";
  const $=s=>document.querySelector(s);
  // en tocar o clicar fora d'un gràfic, el seu estat de hover desapareix
  const OUTS=new Map();
  document.addEventListener("pointerdown",ev=>{ OUTS.forEach((fn,n)=>{ if(n.isConnected&&!n.contains(ev.target))fn(); }); },true);
  const outside=(node,fn)=>OUTS.set(node,fn);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=d3.easeCubicInOut;
  function seg(fig,cb){
    const bs=[...fig.querySelectorAll(".seg button")];
    bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(x=>x.setAttribute("aria-pressed",String(x===b))); cb(b.dataset.k); }));
  }
  function lg(el,items){ if(!el)return; el.innerHTML=items.map(i=>`<span class="lgi"><i class="${i.k||""}" style="${i.k==="ln"||i.k==="ho"?"border-color":"background"}:${i.c}"></i>${i.t}</span>`).join(""); }
  // capítol i verset aproximat a partir de la posició d'una paraula
  const CUM={}; B.forEach(b=>{ let s=0; CUM[b]=E.gnt.caps[b].map(n=>(s+=n)-n); });
  const chapOf=(b,i)=>d3.bisectRight(CUM[b],i);

  /* ============ 1. Els dos calendaris (scroll) ============
     v2: el món romà a dalt com a context; carrils que apareixen pas a pas; l'eix del temps s'eixampla
     a cada pas perquè el que es mostra ompli l'amplada. La v1 és a research/…/versions/calendari-v1.js */
  (function(){
    const el=$("#temps"); if(!el)return;
    const LANES=[
      {k:"mon",t:"El món romà",s:"emperadors i governants",c:C.ink2},
      {k:"vida",t:"Vida de Jesús",s:"",c:C.vermell},
      {k:"cartes",t:"Cartes de Pau",s:"els textos cristians més antics",c:C.blau},
      {k:"escrits",t:"Evangelis",s:"relats de la seva vida",c:C.blauFosc},
      {k:"externes",t:"Historiadors",s:"no cristians",c:C.groc},
      {k:"canon",t:"Cànon",s:"quins llibres compten",c:C.ink2}];
    const EMP=[["August",-27,14],["Tiberi",14,37],["Calígula",37,41],["Claudi",41,54],["Neró",54,68],["",68,69],["Vespasià",69,79],["Titus",79,81],["Domicià",81,96],["Nerva",96,98],["Trajà",98,117],["Adrià",117,138],["Antoní Pius",138,161],["Marc Aureli",161,180],["Constantí",306,337]];
    const D=[
      {g:"mon",n:"Herodes el Gran, rei de Judea",s:"Herodes el Gran",a:-37,b:-4,d:"Rei jueu que governa amb el vistiplau de Roma. Quan mor, el país es reparteix entre els seus fills."},
      {g:"mon",n:"Herodes Antipes, Galilea i Perea",s:"Antipes",a:-4,b:39,d:"Fill d'Herodes. Governa Galilea, la terra de Jesús, sota la supremacia romana."},
      {g:"mon",n:"Ponç Pilat, prefecte de Judea",s:"Pilat",a:26,b:36,d:"Governador romà de Judea. Sota el seu govern crucifiquen Jesús."},
      {g:"mon",n:"Incendi de Roma",s:"Incendi de Roma",a:64,b:64,ev:1,d:"Tàcit explica que Neró en va culpar els cristians."},
      {g:"mon",n:"Guerra dels jueus contra Roma",s:"Guerra jueva",a:66,b:73,d:"Acaba amb Jerusalem presa i el Temple cremat l'any 70."},
      {g:"vida",n:"Naixement",a:-6,b:-4,l:"≈ 6–4 aC",d:"Mateu el situa en vida d'Herodes el Gran, mort el 4 aC. L'any exacte no es coneix."},
      {g:"vida",n:"Joan bateja al Jordà",s:"Joan Baptista",a:28,b:29,l:"≈ 28–29",d:"Lluc data la predicació de Joan el quinzè any de Tiberi."},
      {g:"vida",n:"Crucifixió",a:29,b:33,m:30,l:"≈ 30",d:"Execució romana sota Ponç Pilat. Ventall habitual: del 29 al 33."},
      {g:"cartes",n:"1 Tessalonicencs",s:"1 Tessalonicencs",a:48,b:51,l:"≈ 50",d:"El text cristià més antic que es conserva."},
      {g:"cartes",n:"Gàlates, Corintis, Filipencs, Filèmon, Romans",s:"Altres cartes",a:52,b:58,l:"anys 50",d:"Les altres cartes d'autoria àmpliament acceptada, a mitjan anys cinquanta."},
      {g:"escrits",n:"Destrucció del Temple",s:"Temple",a:70,b:70,l:"70",ev:1,d:"Els romans cremen el Temple de Jerusalem durant la guerra de Judea."},
      {g:"escrits",n:"Marc",a:65,b:75,l:"≈ 65–75",d:"El primer evangeli. Es discuteix si s'escriu just abans o just després de la destrucció del Temple."},
      {g:"escrits",n:"Mateu",a:80,b:90,l:"≈ 80–90",d:"Fa servir Marc, segons la hipòtesi més acceptada."},
      {g:"escrits",n:"Lluc i Fets",s:"Lluc",a:80,b:100,l:"≈ 80–100",d:"Obra en dos volums amb els Fets dels Apòstols."},
      {g:"escrits",n:"Joan",a:90,b:110,l:"≈ 90–110",d:"Forma escrita conservada; pot haver tingut diverses etapes."},
      {g:"externes",n:"Josep, Antiguitats jueves",s:"Josep",a:93,b:94,l:"93–94",d:"Historiador jueu. Acaba l'obra el tretzè any de Domicià. Esmenta Jaume, «germà de Jesús, l'anomenat Crist»."},
      {g:"externes",n:"Tàcit, Annals",s:"Tàcit",a:105,b:120,l:"principi s. II",d:"Historiador romà. Esmenta Crist, executat sota Tiberi per Pilat. Data aproximada."},
      {g:"canon",n:"Justí: «memòries dels apòstols»",s:"Justí",a:150,b:160,l:"mitjan s. II",d:"Explica que el diumenge es llegeixen les memòries dels apòstols, «que s'anomenen evangelis»."},
      {g:"canon",n:"Tacià, Diatèssaron",s:"Tacià",a:160,b:180,l:"2a meitat s. II",d:"Fon els quatre evangelis en una sola narració."},
      {g:"canon",n:"Ireneu: han de ser quatre",s:"Ireneu",a:178,b:182,l:"≈ 180",d:"Defensa que els evangelis són quatre, com els quatre vents."},
      {g:"canon",n:"Atanasi: 27 llibres",s:"Atanasi",a:367,b:367,l:"367",ev:1,d:"Enumera els vint-i-set llibres del Nou Testament en una carta de Pasqua."}];
    const ORD=["mon","vida","cartes","escrits","externes","canon","tot"];
    // vista de cada pas: domini [d0,d1,d2] i fracció de l'amplada on cau d1 (si d1 és el mig, l'escala és lineal)
    const lin=(a,b)=>[a,(a+b)/2,b,.5];
    const VW={mon:lin(-40,45),vida:lin(-12,40),cartes:lin(-12,62),escrits:lin(-12,114),externes:lin(-12,124),canon:[-12,120,380,.74],tot:[-12,120,380,.74]};
    let state="mon", api=null;
    V.mount(el,(node,w)=>{
      const mob=w<640, LW=mob?0:158, L=LW+(mob?2:6), R=w-(mob?4:12), top=mob?18:24, sr=mob?14.5:21, lgap=mob?8:12, empH=mob?15:18;
      const font=`${mob?11:12.5}px ${V.SANS}`, mctx=document.createElement("canvas").getContext("2d"); mctx.font=font;
      const tw=t=>mctx.measureText(t).width;
      const lab=d=>d.g==="mon"?(mob?d.s:d.n):`${mob?(d.s||d.n):d.n} · ${d.l}`;
      function scaleOf(v){ const [a,m,b,f]=v; return d3.scaleLinear().domain([a,m,b]).range([L,L+(R-L)*f,R]).clamp(true); }
      // empaqueta cada carril en subfiles perquè barres i etiquetes no se solapin
      const inDom=(d,v)=>d.b>=v[0]&&d.a<=v[2];
      function pack(x,st){ const vis=new Set(ORD.slice(0,ORD.indexOf(st)+1)); if(st==="tot")ORD.forEach(k=>vis.add(k));
        const v=VW[st], Y={}; let y=top+empH+6; const lanes=[];
        LANES.forEach(ln=>{ const its=D.filter(d=>d.g===ln.k); const on=vis.has(ln.k)&&!(mob&&ln.k==="mon"&&ORD.indexOf(st)>1);
          const rows=[]; its.forEach(d=>{ if(!inDom(d,v)){ d.r=0; return; } const x0=x(d.a)-(d.ev?2:0), xe=Math.max(x(d.b),x0+3), lw=tw(lab(d))+10, x1=xe+lw;
            d.pos=x1<=R?"r":(xe-x0>=lw+4?"in":"l"); if(d.pos==="l"&&x0-lw<L)d.pos=xe-x0>40?"in":"l";
            const s0=d.pos==="l"?x0-lw:x0, s1=d.pos==="r"?x1:xe;
            let r=rows.findIndex(o=>o.every(q=>s1<q[0]-4||s0>q[1]+4)); if(r<0){ rows.push([]); r=rows.length-1; } rows[r].push([s0,s1]); d.r=r; });
          const hgt=on?Math.max(1,rows.length)*sr+(mob?14:0):0; ln.on=on;
          lanes.push({k:ln.k,y,on,h:hgt}); its.forEach(d=>{ Y[d.n]=y+(mob?14:0)+d.r*sr; }); if(on)y+=hgt+lgap; });
        return {Y,lanes,H:y}; }
      // alçada fixa: la de la vista final, perquè el gràfic no salti
      const HMAX=Math.max(...ORD.map(k=>pack(scaleOf(VW[k]),k).H))+6;
      const s=V.svg(node,w,pack(scaleOf(VW[state]),state).H+6,"Cronologia en dos calendaris: a dalt, els emperadors romans i els governants de Judea i Galilea; a sota, la vida de Jesús (cap al 6 aC – cap al 30), les cartes de Pau (anys 50), els evangelis (65–110), Josep i Tàcit, i el cànon fins al 367.");
      const gAx=s.append("g"), gEmp=s.append("g"), gLane=s.append("g"), gTree=s.append("g"), gRows=s.append("g"), gCross=s.append("g"), gHov=s.append("g");
      const cross=gCross.append("line").attr("stroke",C.vermell).attr("stroke-dasharray","3 3");
      const crossT=V.t(gCross,0,0,"la creu, ≈ 30",{size:11.5,fill:C.vermell,halo:true,weight:600});
      // emperadors: una franja contínua
      const emp=gEmp.selectAll("g").data(EMP).join("g");
      emp.append("rect").attr("height",empH).attr("fill",(d,i)=>i%2?C.grid:C.land).attr("stroke",C.paper).attr("stroke-width",1);
      emp.append("text").attr("font-family",V.SANS).attr("font-size",mob?11:11.5).attr("fill",C.ink2).attr("y",empH/2+4).attr("text-anchor","middle").text(d=>d[0]);
      const laneL=gLane.selectAll("g").data(LANES).join("g");
      if(!mob){ laneL.append("text").attr("class","t").attr("font-family",V.SANS).attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink).text(d=>d.t);
        laneL.append("text").attr("class","s").attr("font-family",V.SANS).attr("font-size",11.5).attr("font-style","italic").attr("fill",C.ink2).attr("dy",14).text(d=>d.s); }
      else laneL.append("text").attr("class","t").attr("font-family",V.SANS).attr("font-size",11.5).attr("font-weight",700).attr("fill",C.ink2).text(d=>d.t+(d.s?` · ${d.s}`:""));
      laneL.append("line").attr("stroke",C.hair);
      const rows=gRows.selectAll("g").data(D).join("g");
      rows.append("rect").attr("class","bar").attr("rx",1).attr("fill",d=>LANES.find(l=>l.k===d.g).c).style("opacity",d=>d.g==="mon"?.55:1);
      rows.filter(d=>d.m!=null).append("line").attr("class","mk").attr("stroke",C.ink).attr("stroke-width",1.5);
      rows.append("text").attr("class","lb").attr("font-family",V.SANS).attr("font-size",mob?11:12.5).attr("fill",C.ink).text(lab);
      rows.selectAll(".lb").each(function(){ V.halo(d3.select(this)); });
      rows.append("text").attr("class","ds").attr("font-family",V.SANS).attr("font-size",11.5).attr("fill",C.muted).each(function(){ V.halo(d3.select(this)); });
      const CR=D.find(d=>d.n==="Crucifixió");
      const br=gTree.selectAll("path").data(D.filter(d=>d.g!=="vida"&&d.g!=="mon")).join("path").attr("fill","none").attr("stroke",V.alpha(C.vermell,.5)).attr("stroke-width",.9);
      const since=d=>`+${Math.round((d.a+d.b)/2-30)} anys`;
      let cur={v:VW[state].slice(),P:pack(scaleOf(VW[state]),state),vis:{}}, hov=null;
      function visOf(st){ const o={}; const i=ORD.indexOf(st); LANES.forEach(l=>o[l.k]=st==="tot"||ORD.indexOf(l.k)<=i?1:0); return o; }
      cur.vis=visOf(state);
      function render(v,P,vis,treeK){ const x=scaleOf(v), H=P.H; s.attr("height",H+6).attr("viewBox",`0 0 ${w} ${H+6}`); hit.attr("height",H+6);
        // eix: anys que hi caben sense trepitjar-se
        gAx.selectAll("*").remove(); let last=-1e9;
        [-40,-30,-20,-10,1,10,20,30,40,50,60,70,80,90,100,110,120,200,300,367].forEach(t=>{ const xx=x(t); if(t<v[0]||t>v[2]||xx-last<(mob?30:36))return; last=xx;
          gAx.append("line").attr("x1",xx).attr("x2",xx).attr("y1",top-4).attr("y2",H).attr("stroke",C.grid);
          V.t(gAx,xx,top-8,t<0?`${-t} aC`:t===1?"1 dC":String(t),{size:11.5,anchor:"middle",fill:C.muted}); });
        if(v[1]!==(v[0]+v[2])/2){ const xb=x(v[1])+8; V.t(gAx,xb,top-8,"//",{size:11.5,anchor:"middle",fill:C.muted}); }
        emp.attr("transform",d=>`translate(${x(d[1])},${top})`).select("rect").attr("width",d=>Math.max(0,x(d[2])-x(d[1])));
        emp.select("text").attr("x",d=>(x(d[2])-x(d[1]))/2).style("opacity",d=>tw(d[0])+8<x(d[2])-x(d[1])?1:0);
        const ln=new Map(P.lanes.map(l=>[l.k,l]));
        laneL.attr("transform",d=>`translate(0,${ln.get(d.k).y})`).style("opacity",d=>vis[d.k]*(mob&&d.k==="mon"&&!ln.get(d.k).on?0:1));
        laneL.select(".t").attr("x",0).attr("y",mob?11:14); laneL.select(".s").attr("x",0).attr("y",14);
        laneL.select("line").attr("x1",0).attr("x2",R).attr("y1",-lgap/2).attr("y2",-lgap/2).style("opacity",(d,i)=>i?1:0);
        const dv=d=>{ const a=(v[2]-d.a), b=(d.b-v[0]); return Math.max(0,Math.min(1,Math.min(a,b)+1)); };
        rows.attr("transform",d=>`translate(0,${P.Y[d.n]})`).style("opacity",d=>vis[d.g]*dv(d)*(ln.get(d.g).on||!mob?1:0)*(hov&&hov!==d?.25:1));
        rows.select(".bar").attr("x",d=>x(d.a)-(d.ev?1.5:0)).attr("y",sr*.18).attr("height",sr*.62).attr("width",d=>Math.max(d.ev?3:3,x(d.b)-x(d.a)))
          .attr("stroke",d=>hov===d?C.ink:null).attr("stroke-width",1.5);
        rows.select(".mk").attr("x1",d=>x(d.m)).attr("x2",d=>x(d.m)).attr("y1",sr*.05).attr("y2",sr*.95);
        rows.select(".lb").attr("stroke",d=>d.pos==="in"?"none":C.paper).attr("fill",d=>d.pos!=="in"?C.ink:(d.g==="mon"||d.g==="externes"?C.ink:C.paper))
          .attr("x",d=>d.pos==="l"?x(d.a)-6:d.pos==="in"?x(d.a)+5:Math.max(x(d.b),x(d.a)+3)+6).attr("text-anchor",d=>d.pos==="l"?"end":"start").attr("y",sr*.68);
        const showD=d=>(state==="tot"&&!mob&&d.g!=="mon"&&d.g!=="vida")||hov===d;
        rows.select(".ds").text(d=>showD(d)&&d.g!=="vida"&&d.g!=="mon"?since(d):"").attr("text-anchor",d=>d.pos==="l"?"end":"start").attr("y",sr*.68)
          .attr("x",d=>d.pos==="l"?x(d.a)-6-tw(lab(d))-8:d.pos==="in"?Math.max(x(d.b),x(d.a)+3)+6:Math.max(x(d.b),x(d.a)+3)+6+tw(lab(d))+8);
        const cx=x(30), y0=P.Y[CR.n]+sr/2;
        cross.attr("x1",cx).attr("x2",cx).attr("y1",top+empH+2).attr("y2",H).style("opacity",vis.vida);
        crossT.attr("x",cx+4).attr("y",H-4).style("opacity",vis.vida&&!mob?1:0);
        br.attr("d",d=>{ const x1=x(d.a)-2, y1=P.Y[d.n]+sr/2; return `M${cx},${y0}C${cx},${(y0+y1)/2} ${cx+(x1-cx)*.25},${y1} ${x1},${y1}`; }).style("opacity",treeK)
          .attr("stroke",d=>hov===d?C.vermell:V.alpha(C.vermell,hov?.15:.5)).attr("stroke-width",d=>hov===d?1.8:.9);
      }
      let tm=null;
      function go(st,inst){ state=st; const tv=VW[st].slice(), tvis=visOf(st), tP=pack(scaleOf(tv),st);
        if(tm)tm.stop(); hov=null; tp.hide(); gHov.selectAll("*").remove();
        const v0=cur.v.slice(), vis0=Object.assign({},cur.vis), P0=cur.P, tr0=cur.tree||0, tr1=st==="tot"?1:0;
        const lerpP=k=>{ const Y={}; D.forEach(d=>Y[d.n]=P0.Y[d.n]+(tP.Y[d.n]-P0.Y[d.n])*k);
          return {Y,H:P0.H+(tP.H-P0.H)*k,lanes:tP.lanes.map(l=>{ const o=P0.lanes.find(q=>q.k===l.k); return Object.assign({},l,{y:o.y+(l.y-o.y)*k}); })}; };
        const fin=()=>{ cur={v:tv,P:tP,vis:tvis,tree:tr1}; render(tv,tP,tvis,tr1); };
        if(inst||V.reduced){ fin(); return; }
        // la franja nova creix des de l'esquerra
        tm=d3.timer(t=>{ const k=Math.min(1,t/1100), e=ease(k);
          const v=v0.map((a,i)=>a+(tv[i]-a)*e), vis={}; LANES.forEach(l=>vis[l.k]=vis0[l.k]+(tvis[l.k]-vis0[l.k])*e);
          cur={v,P:lerpP(e),vis,tree:tr0+(tr1-tr0)*e}; render(v,cur.P,vis,cur.tree);
          if(k>=1){ tm.stop(); fin(); } }); }
      const tp=V.tip(node);
      const hit=s.append("rect").attr("x",0).attr("y",0).attr("width",w).attr("height",HMAX).attr("fill","transparent").attr("class","hit");
      hit.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,hit.node()); const x=scaleOf(cur.v);
        if(my<top+empH&&my>top){ const e=EMP.find(e=>mx>=x(e[1])&&mx<x(e[2])); if(e&&e[0]){ hov=null; render(cur.v,cur.P,cur.vis,cur.tree); tp.show(`<b>${e[0]}</b><br>Emperador ${e[1]<0?-e[1]+" aC":e[1]}–${e[2]}`,mx,my); } else tp.hide(); return; }
        const cand=D.filter(d=>cur.vis[d.g]>.5);
        const d=d3.least(cand,d=>{ const y=cur.P.Y[d.n]+sr/2; const xa=x(d.a), xb=Math.max(x(d.b),xa+3); const dx=mx<xa?xa-mx:mx>xb?mx-xb:0; return Math.abs(y-my)*3+dx*.15; });
        if(!d||Math.abs(cur.P.Y[d.n]+sr/2-my)>sr){ offH(); return; }
        hov=d; render(cur.v,cur.P,cur.vis,cur.tree);
        tp.show(`<b>${d.n}</b><br>${d.l||(d.a<0?`${-d.a} aC`:d.a)+(d.b!==d.a?`–${d.b<0?-d.b+" aC":d.b}`:"")}${d.g!=="vida"&&d.g!=="mon"?` · ${since(d)} després de la creu`:""}<br>${d.d}`,mx,cur.P.Y[d.n]); })
        .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); });
      function offH(){ if(!hov&&!tp)return; hov=null; tp.hide(); render(cur.v,cur.P,cur.vis,cur.tree); }
      outside(node,offH);
      api={set(k,first){ go(k,first); }};
      api.set(state,true);
    });
    const sc=$("#s-temps");
    IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(i,step)=>{ state=step.dataset.s; if(api)api.set(state); });
  })();

  /* ============ 2. La setmana de Marc ============ */
  (function(){
    const el=$("#marc"); if(!el)return;
    const out=$("#marc-r");
    const S=E.gnt.marcDies.map(d=>Object.assign({},d));
    // el dissabte: el text el salta (15,42 → 16,1)
    S.splice(7,0,{ref:"15,42–16,1",nom:"Dissabte",w:0,start:S[7].start,sab:1});
    const end={"1,1":"10,52","11,1":"11,11","11,12":"11,19","11,20":"13,37","14,1":"14,11","14,12":"14,72","15,1":"15,47","16,1":"16,8"};
    const TOT=E.gnt.total.Mc;
    const col=d=>d.ref==="1,1"?C.ghost:(d.ref==="14,12"||d.ref==="15,1")?C.vermell:d.sab?C.paper:C.blau;
    const base=`Marc té <b>${f0(TOT)}</b> paraules gregues. Passa per cada tram.`;
    out.innerHTML=base;
    V.mount(el,(node,w)=>{
      const mob=w<640, H=mob?520:560, top=34, bot=H-14;
      const s=V.svg(node,w,H,"L'evangeli de Marc dividit pels seus marcadors de temps: l'activitat a Galilea ocupa el 64 % del text; la setmana a Jerusalem, el 36 %; del darrer sopar a la sepultura, el 15 %.");
      const cw=mob?Math.min(56,w*.16):110;
      const xL=mob?Math.min(104,w*.27):Math.max(230,w*.3), xR=w-cw-200;
      const xRight=mob?w-cw-78:xR;
      const SH={"Arribada":"Arribada","L’endemà":"L’endemà","Al matí":"Al matí","Dos dies abans de Pasqua":"2 dies abans","Primer dia dels Àzims":"Àzims","De bon matí":"De bon matí","Dissabte":"Dissabte","Passat el dissabte":"Diumenge"};
      V.t(s,xL+cw/2,top-14,"Temps narrat",{size:12.5,weight:700,anchor:"middle"});
      V.t(s,xRight+cw/2,top-14,"Paraules del text",{size:12.5,weight:700,anchor:"middle"});
      // temps narrat: Galilea alta (temps indeterminat), cada marcador una cel·la igual
      const nL=S.length-1, cell=(bot-top)*(mob?.075:.075), galH=(bot-top)-cell*nL;
      let yy=top; S.forEach((d,i)=>{ d.ly=yy; d.lh=i===0?galH:cell; yy+=d.lh; });
      const ys=d3.scaleLinear([0,TOT],[top,bot]);
      S.forEach(d=>{ d.ry=ys(d.start); d.rh=Math.max(d.sab?0:.8,ys(d.start+d.w)-ys(d.start)); });
      const g=s.append("g");
      const rib=g.append("g").selectAll("path").data(S.filter(d=>!d.sab)).join("path")
        .attr("fill",d=>V.alpha(d.ref==="1,1"?C.ink2:col(d),d.ref==="1,1"?.08:.16))
        .attr("d",d=>{ const x1=xL+cw, x2=xRight; const m=(x1+x2)/2;
          return `M${x1},${d.ly}C${m},${d.ly} ${m},${d.ry} ${x2},${d.ry}L${x2},${d.ry+d.rh}C${m},${d.ry+d.rh} ${m},${d.ly+d.lh} ${x1},${d.ly+d.lh}Z`; });
      const lb=g.append("g").selectAll("rect").data(S).join("rect").attr("x",xL).attr("y",d=>d.ly+.5).attr("width",cw).attr("height",d=>d.lh-1)
        .attr("fill",d=>d.sab?C.paper:col(d)).attr("stroke",d=>d.sab?C.ghost:null).attr("stroke-dasharray",d=>d.sab?"3 2":null);
      // trencament de la cel·la de Galilea: temps indeterminat
      const zz=g.append("g");
      [.45,.55].forEach(p=>zz.append("path").attr("d",`M${xL-3},${top+galH*p+4}L${xL+cw+3},${top+galH*p-4}`).attr("stroke",C.paper).attr("stroke-width",3));
      const rb=g.append("g").selectAll("rect").data(S.filter(d=>!d.sab)).join("rect").attr("x",xRight).attr("y",d=>d.ry).attr("width",cw).attr("height",d=>d.rh)
        .attr("fill",d=>col(d)).attr("stroke",C.paper).attr("stroke-width",.6);
      // etiquetes del temps narrat (esquerra)
      const tl=g.append("g");
      S.forEach((d,i)=>{ const yC=d.ly+d.lh/2+4;
        const t1=i===0?(mob?"Galilea":"Galilea i el camí"):(mob?(SH[d.nom]||d.nom):d.nom);
        V.t(tl,xL-8,yC-(i===0?8:0),t1,{size:mob?11.5:12.5,anchor:"end",weight:i===0?700:400});
        V.t(tl,xL-8,i===0?yC+8:yC+0,i===0?(mob?"temps incert":"temps sense precisar"):"",{size:11.5,anchor:"end",italic:true,fill:C.ink2});
        if(!mob||i===0){} });
      // etiquetes de text (dreta)
      const tr=g.append("g");
      const bigs=[{a:0,b:1,t:"Galilea i el camí",v:S[0].w},{a:1,b:S.length,t:"La setmana a Jerusalem",v:TOT-S[0].w},{a:5,b:7,t:"Del sopar a la sepultura",v:S[5].w+S[6].w}];
      const xb=xRight+cw+10;
      bigs.forEach((o,k)=>{ const yA=ys(S[o.a].start), yB=k===1?bot:ys(S[o.b-1].start+S[o.b-1].w);
        const xk=xb+(k===2?10:0);
        tr.append("path").attr("d",`M${xk},${yA+1}h4V${yB-1}h-4`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8);
        const ym=k===1?yA+16:(yA+yB)/2;
        V.lines(tr,xk+8,ym-6,[[pc(o.v/TOT),true],[mob?(k===0?"Galilea":k===1?"Jerusalem":"Sopar–creu"):o.t]],{size:mob?11.5:12.5,halo:true});
      });
      // hores del capítol 15
      const hr=[["15,25","tercera hora: el crucifiquen",E.gnt.marcHores["15,25"]],["15,33","sisena hora: la foscor",E.gnt.marcHores["15,33"]]];
      if(false)hr.forEach(([r,t,p])=>{ const yh=ys(p); tr.append("line").attr("x1",xRight-6).attr("x2",xRight).attr("y1",yh).attr("y2",yh).attr("stroke",C.ink);
        V.t(tr,xRight-9,yh+4,`${r} · ${t}`,{size:11.5,anchor:"end",fill:C.ink2,halo:true}); });
      const hl=g.append("g");
      function show(d){
        const on=e=>!d||e===d;
        rib.interrupt().transition().duration(150).style("opacity",e=>on(e)?1:.2);
        rb.interrupt().transition().duration(150).style("opacity",e=>on(e)?1:.3);
        lb.interrupt().transition().duration(150).style("opacity",e=>on(e)?1:.35);
        hl.selectAll("*").remove();
        if(!d){ out.innerHTML=base; return; }
        if(!d.sab)hl.append("rect").attr("x",xRight-.75).attr("y",d.ry-.75).attr("width",cw+1.5).attr("height",d.rh+1.5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
        hl.append("rect").attr("x",xL-.75).attr("y",d.ly-.25).attr("width",cw+1.5).attr("height",d.lh-.5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
        out.innerHTML=d.sab?`<b>El dissabte</b>: entre la sepultura (15,42–47) i «passat el dissabte» (16,1), el text no hi dedica cap paraula.`
          :`<b>Mc ${d.ref}–${end[d.ref]}</b> · ${d.ref==="1,1"?"Del baptisme a les portes de Jerusalem":d.nom}: <b>${f0(d.w)}</b> paraules, el ${pc(d.w/TOT)} del llibre.`;
      }
      const hit=s.append("rect").attr("x",0).attr("y",top).attr("width",w).attr("height",bot-top).attr("fill","transparent").attr("class","hit");
      hit.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,hit.node());
        const leftSide=mx<(xL+cw+xRight)/2;
        const d=leftSide?S.find(e=>my>=e.ly&&my<e.ly+e.lh):S.filter(e=>!e.sab).find(e=>my>=e.ry&&my<=e.ry+Math.max(e.rh,3));
        show(d||null); }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ show(null) } outside(node,offH);
      V.onView(node,inst=>{ if(inst)return;
        rib.style("opacity",0).transition().delay((e,i)=>200+i*120).duration(700).style("opacity",1);
        rb.attr("width",0).transition().delay((e,i)=>i*120).duration(700).ease(ease).attr("width",cw); });
    });
  })();

  /* ============ 3. On cau cada escena ============ */
  (function(){
    const el=$("#escenes"); if(!el)return;
    const out=$("#escenes-r"), fig=$("#f-escenes");
    const SC=E.gnt.escenes, TOT=E.gnt.total, MAXW=d3.max(B,b=>TOT[b]);
    let mode="pct", sel=SC.findIndex(d=>d.nom==="Gest al Temple"), draw=null;
    lg($("#escenes-lg"),[{c:C.vermell,t:"Escena ressaltada",k:"ln"},{c:C.ghost,t:"Les altres",k:"ln"}]);
    function text(i){ const d=SC[i]; out.innerHTML=`<b>${d.nom}</b> · `+B.map(b=>`${NOM[b]} ${d.ref[b]} (${pc(d.pos[b]/TOT[b])})`).join(" · "); }
    seg(fig,k=>{ mode=k; draw&&draw(true); });
    V.mount(el,(node,w)=>{
      const mob=w<640, L=mob?52:84, R=w-(mob?10:150), top=mob?20:96, rg=mob?62:74, H=top+rg*3+40;
      const s=V.svg(node,w,H,"Posició de nou escenes dins de cada evangeli. El gest al Temple cau cap al 66–79 % del llibre a Mateu, Marc i Lluc, i al 7 % a Joan.");
      const yb=b=>top+B.indexOf(b)*rg;
      const g=s.append("g"), lines=g.append("g"), dots=g.append("g"), labs=s.append("g");
      const axes=g.append("g");
      B.forEach(b=>{ V.t(s,L-12,yb(b)+4,NOM[b],{size:13,weight:700,anchor:"end"}); });
      const xp=d3.scaleLinear([0,1],[L,R]), xa=d3.scaleLinear([0,MAXW],[L,R]);
      const X=(b,p)=>mode==="pct"?xp(p/TOT[b]):xa(p);
      const lineGen=d3.line().curve(d3.curveMonotoneY);
      draw=function(anim){
        const dur=anim&&!V.reduced?900:0;
        axes.selectAll("*").remove();
        B.forEach(b=>{ const y=yb(b), x2=mode==="pct"?xp(1):xa(TOT[b]);
          axes.append("line").attr("x1",L).attr("x2",L).attr("y1",y).attr("y2",y).attr("stroke",C.ink2).attr("stroke-width",1.2).transition().duration(dur).attr("x2",x2);
          CUM[b].forEach((c,i)=>{ if(i===0)return; axes.append("line").attr("x1",X(b,c)).attr("x2",X(b,c)).attr("y1",y-3).attr("y2",y+3).attr("stroke",C.ink2).attr("stroke-width",.7).style("opacity",0).transition().duration(dur).style("opacity",1); });
          if(!mob)V.t(axes,x2+8,y+4,mode==="pct"?`${E.gnt.caps[b].length} cap.`:`${f0(TOT[b])} paraules`,{size:11.5,fill:C.muted}); });
        const ticks=mode==="pct"?[0,.25,.5,.75,1]:[0,5000,10000,15000];
        ticks.forEach(v=>{ const xx=mode==="pct"?xp(v):xa(v);
          axes.append("line").attr("x1",xx).attr("x2",xx).attr("y1",top-14).attr("y2",yb("Jn")+12).attr("stroke",C.grid).lower();
          V.t(axes,xx,yb("Jn")+28,mode==="pct"?(v===1?(mob?"100 %":"100 % del llibre"):V.fmt(".0f")(v*100)+" %"):(v?f0(v):"0")+(v===15000?" paraules":""),{size:11.5,anchor:"middle",fill:C.muted}); });
        const pts=d=>B.map(b=>[X(b,d.pos[b]),yb(b)]);
        lines.selectAll("path").data(SC).join("path").attr("fill","none").attr("stroke-linecap","round")
          .transition().duration(dur).ease(ease).attr("d",d=>lineGen(pts(d)));
        dots.selectAll("g").data(SC).join("g").each(function(d){ const g2=d3.select(this);
          g2.selectAll("circle").data(B).join("circle").attr("r",3.6).attr("stroke",C.paper).attr("stroke-width",1)
            .transition().duration(dur).ease(ease).attr("cx",b=>X(b,d.pos[b])).attr("cy",b=>yb(b)); });
        style();
      };
      function style(){
        lines.selectAll("path").attr("stroke",(d,i)=>i===sel?C.vermell:C.ghost).attr("stroke-width",(d,i)=>i===sel?2.6:1.2).style("opacity",(d,i)=>i===sel?1:.8);
        lines.selectAll("path").filter((d,i)=>i===sel).raise();
        dots.selectAll("g").attr("fill",(d,i)=>i===sel?C.vermell:C.ghost);
        dots.selectAll("g").filter((d,i)=>i===sel).raise().selectAll("circle").attr("r",4.6);
        dots.selectAll("g").filter((d,i)=>i!==sel).selectAll("circle").attr("r",3.4);
        labs.selectAll("*").remove();
        if(!mob){ // noms de totes les escenes a dalt, girats
          const xs=SC.map((d,i)=>({i,x:X("Mt",d.pos.Mt)})).sort((a,b)=>a.x-b.x); for(let k=1;k<xs.length;k++)xs[k].lx=Math.max(xs[k].x,(xs[k-1].lx||xs[k-1].x)+22); xs[0].lx=xs[0].x;
          const LX={}; xs.forEach(o=>LX[o.i]=o.lx);
          SC.forEach((d,i)=>{ const x0=X("Mt",d.pos.Mt), xx=LX[i]; if(Math.abs(xx-x0)>1)labs.append("path").attr("d",`M${x0},${top-4}L${xx},${top-12}`).attr("stroke",C.ghost).attr("fill","none");
            const t=labs.append("text").attr("transform",`translate(${xx+2},${top-14}) rotate(-38)`).text(d.nom)
            .attr("font-family",V.SANS).attr("font-size",12).attr("fill",i===sel?C.ink:C.muted).attr("font-weight",i===sel?700:400);
            V.halo(t); }); }
        const d=SC[sel], xj=X("Jn",d.pos.Jn);
        V.t(labs,xj+(xj<w/2?8:-8),yb("Jn")-10,`${NOM.Jn} ${d.ref.Jn}`,{size:12,weight:700,anchor:xj<w/2?"start":"end",halo:true});
        text(sel);
      }
      const hit=s.append("rect").attr("x",0).attr("y",0).attr("width",w).attr("height",H).attr("fill","transparent").attr("class","hit");
      const tp=V.tip(node);
      hit.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,hit.node());
        let best=null,bd=1e9; SC.forEach((d,i)=>B.forEach(b=>{ const dd=Math.hypot(X(b,d.pos[b])-mx,(yb(b)-my)*.5); if(dd<bd){bd=dd;best=[i,b];} }));
        if(best&&bd<60){ sel=best[0]; style(); const d=SC[sel]; tp.show(`<b>${d.nom}</b><br>${NOM[best[1]]} ${d.ref[best[1]]}: ${pc(d.pos[best[1]]/TOT[best[1]])} del llibre`,mx,my); }
      }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ tp.hide(); const t=SC.findIndex(d=>d.nom==="Gest al Temple"); if(sel!==t){ sel=t; style(); } } outside(node,offH);
      draw(false);
      V.onView(node,inst=>{ if(inst)return; lines.selectAll("path").each(function(){ const L2=this.getTotalLength(); d3.select(this).attr("stroke-dasharray",`${L2} ${L2}`).attr("stroke-dashoffset",L2).transition().delay(200).duration(1200).ease(ease).attr("stroke-dashoffset",0).on("end",function(){ d3.select(this).attr("stroke-dasharray",null); }); }); });
    });
  })();

  /* ============ 4. Aparicions ============ */
  (function(){
    const el=$("#aparicions"); if(!el)return;
    const out=$("#apar-r");
    const COLS=[{k:"Co",t:"1 Corintis 15",d:"≈ 54–55"},{k:"Mc",t:"Marc 16",d:"≈ 65–75"},{k:"Mt",t:"Mateu 28",d:"≈ 80–90"},{k:"Lc",t:"Lluc 24 · Fets 1",d:"≈ 80–100"},{k:"Jn",t:"Joan 20–21",d:"≈ 90–110"}];
    const J="J",Gal="G",N="N";
    const ROWS=[
      {w:"Maria Magdalena",c:{Mc:["o",J,"16,1–8: troba la tomba oberta"],Mt:["v",J,"28,1–10: Jesús li surt a trobar"],Lc:["o",J,"24,1–10: troba la tomba buida"],Jn:["v",J,"20,1–18: la crida pel nom"]}},
      {w:"Altres dones",c:{Mc:["o",J,"16,1: Maria, mare de Jaume, i Salomé"],Mt:["v",J,"28,1–10: «l'altra Maria»"],Lc:["o",J,"24,10: Joana, Maria, mare de Jaume, i altres"]}},
      {w:"Cefes (Pere)",c:{Co:["v",N,"15,5: «s'aparegué a Cefes»"],Mc:["p",Gal,"16,7: «digueu als deixebles i a Pere» que el veuran a Galilea"],Lc:["v",J,"24,34: «s'ha aparegut a Simó» (24,12: corre al sepulcre)"],Jn:["v",Gal,"21,1–19: vora el llac (20,3–10: corre al sepulcre)"]}},
      {w:"Els Dotze / els Onze",c:{Co:["v",N,"15,5: «després als Dotze»"],Mc:["p",Gal,"16,7: «allà el veureu»"],Mt:["v",Gal,"28,16–20: a una muntanya de Galilea"],Lc:["v",J,"24,33–49 i Ac 1,3–11: a Jerusalem"],Jn:["v",J,"20,19–29: a Jerusalem"]}},
      {w:"Dos deixebles, camí d'Emmaús",c:{Lc:["v",J,"24,13–35: el reconeixen quan parteix el pa"]}},
      {w:"Tomàs",c:{Jn:["v",J,"20,26–29"]}},
      {w:"Set deixebles al llac",c:{Jn:["v",Gal,"21,1–14"]}},
      {w:"Més de cinc-cents germans",c:{Co:["v",N,"15,6"]}},
      {w:"Jaume",c:{Co:["v",N,"15,7"]}},
      {w:"Tots els apòstols",c:{Co:["v",N,"15,7"]}},
      {w:"Pau",c:{Co:["v",N,"15,8: «l'últim de tots»"]}}
    ];
    const PC={J:C.vermell,G:C.blau,N:C.ink2}, PN={J:"Jerusalem o voltants",G:"Galilea",N:"lloc no especificat"};
    lg($("#apar-lg"),[{c:C.vermell,t:"Jerusalem"},{c:C.blau,t:"Galilea"},{c:C.ink2,t:"Sense lloc"},{c:C.ink,t:"Tomba buida o anunci, sense aparició",k:"ho"}]);
    const base="Pau no esmenta cap dona ni cap sepulcre. Marc no narra cap aparició: només l'anuncia. Passa per una fila o una columna.";
    out.innerHTML=base;
    V.mount(el,(node,w)=>{
      const mob=w<640, L=mob?104:240, top=mob?50:62, rh=mob?30:32, R=w-(mob?4:20);
      const cw=(R-L)/COLS.length, H=top+rh*ROWS.length+10;
      const s=V.svg(node,w,H,"Matriu de les aparicions de Jesús ressuscitat: qui el veu i on, segons 1 Corintis 15, Marc, Mateu, Lluc-Fets i Joan. Pau no esmenta dones; Marc no narra aparicions; Mateu i Joan les situen també a Galilea, Lluc només a Jerusalem.");
      const cx=i=>L+cw*(i+.5), cy=j=>top+rh*(j+.5);
      const grid=s.append("g");
      ROWS.forEach((r,j)=>grid.append("line").attr("x1",mob?0:L-230).attr("x2",R).attr("y1",cy(j)).attr("y2",cy(j)).attr("stroke",C.grid));
      const ch=s.append("g").selectAll("g").data(COLS).join("g").attr("transform",(d,i)=>`translate(${cx(i)},0)`);
      ch.each(function(d){ const g=d3.select(this);
        const SHT={Co:"1Co 15",Mc:"Mc 16",Mt:"Mt 28",Lc:"Lc 24",Jn:"Jn 20–21"};
        V.t(g,0,top-30,mob?SHT[d.k]:d.t,{size:mob?11.5:12.5,weight:700,anchor:"middle"});
        V.t(g,0,top-12,mob?d.d.replace("≈ ",""):d.d,{size:11,anchor:"middle",fill:C.muted}); });
      const rl=s.append("g").selectAll("text").data(ROWS).join("text").attr("x",L-12).attr("y",(d,j)=>cy(j)+4).attr("text-anchor","end").attr("font-family",V.SANS).attr("font-size",mob?11.5:13).attr("fill",C.ink).text(d=>mob&&d.w.length>17?d.w.replace("Dos deixebles, camí d'Emmaús","Emmaús").replace("Més de cinc-cents germans","Més de 500").replace("Els Dotze / els Onze","Dotze / Onze").replace("Set deixebles al llac","Set al llac"):d.w);
      const cells=[]; ROWS.forEach((r,j)=>COLS.forEach((c,i)=>{ if(r.c[c.k])cells.push({r,j,c,i,v:r.c[c.k]}); }));
      const cg=s.append("g").selectAll("g").data(cells).join("g").attr("transform",d=>`translate(${cx(d.i)},${cy(d.j)})`);
      const rr=mob?7.5:9;
      cg.append("circle").attr("r",rr).attr("fill",d=>d.v[0]==="v"?PC[d.v[1]]:C.paper).attr("stroke",d=>d.v[0]==="v"?C.paper:d.v[0]==="p"?PC[d.v[1]]:C.ink).attr("stroke-width",d=>d.v[0]==="v"?1:1.6).attr("stroke-dasharray",d=>d.v[0]==="p"?"2.5 2":null);
      const tp=V.tip(node);
      const hl=s.append("g");
      function show(d,mx,my){
        const on=e=>!d||(d.kind==="row"?e.j===d.j:d.kind==="col"?e.i===d.i:e===d);
        cg.interrupt().transition().duration(150).style("opacity",e=>on(e)?1:.18);
        rl.style("font-weight",(e,j)=>d&&(d.kind==="row"?d.j===j:d.j===j)?700:400);
        hl.selectAll("*").remove(); tp.hide();
        if(!d){ out.innerHTML=base; return; }
        if(d.kind==="cell"){ hl.append("circle").attr("cx",cx(d.i)).attr("cy",cy(d.j)).attr("r",rr+3.5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
          const kind=d.v[0]==="v"?"veu Jesús":d.v[0]==="p"?"rep la promesa que el veurà":"troba la tomba buida o rep l'anunci";
          out.innerHTML=`<b>${d.r.w}</b> · ${d.c.t}: ${kind} (${PN[d.v[1]]}). ${d.v[2]}.`;
          tp.show(`<b>${d.r.w}</b><br>${d.c.k==="Co"?"1Co":d.c.k} ${d.v[2]}`,mx,my); }
        else if(d.kind==="col"){ const n=cells.filter(e=>e.i===d.i&&e.v[0]==="v").length; out.innerHTML=`<b>${COLS[d.i].t}</b> · ${n} ${n===1?"aparició narrada":"aparicions narrades"}${n===0?": les dones fugen i callen (16,8)":""}.`; }
        else { const n=cells.filter(e=>e.j===d.j); out.innerHTML=`<b>${ROWS[d.j].w}</b> · surt a ${n.length===1?"un sol text":`${n.length} dels cinc textos`}.`; }
      }
      const hit=s.append("rect").attr("width",w).attr("height",H).attr("fill","transparent").attr("class","hit");
      hit.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,hit.node());
        const j=Math.floor((my-top)/rh), i=Math.floor((mx-L)/cw);
        if(my<top&&i>=0&&i<COLS.length)return show({kind:"col",i},mx,my);
        if(j<0||j>=ROWS.length)return show(null);
        if(mx<L)return show({kind:"row",j},mx,my);
        const c=cells.find(e=>e.i===i&&e.j===j); show(c?Object.assign({kind:"cell"},c):{kind:"row",j},mx,my);
      }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ show(null) } outside(node,offH);
      V.onView(node,inst=>{ if(inst)return; cg.attr("transform",d=>`translate(${cx(d.i)},${cy(d.j)}) scale(0)`).transition().delay(d=>d.i*160+d.j*40).duration(600).ease(d3.easeBackOut).attr("transform",d=>`translate(${cx(d.i)},${cy(d.j)}) scale(1)`); });
    });
  })();

  /* ============ 5. La biblioteca: ordre de la Bíblia i ordre d'escriptura ============ */
  (function(){
    const el=$("#biblio"); if(!el)return;
    const out=$("#biblio-r"), fig=$("#f-biblio");
    const NM={Mt:"Mateu",Mc:"Marc",Lc:"Lluc",Jn:"Joan",Ac:"Fets",Rm:"Romans","1Co":"1 Corintis","2Co":"2 Corintis",Ga:"Gàlates",Ef:"Efesis",Fl:"Filipencs",Col:"Colossencs","1Te":"1 Tessalonicencs","2Te":"2 Tessalonicencs","1Tm":"1 Timoteu","2Tm":"2 Timoteu",Tt:"Titus",Flm:"Filèmon",He:"Hebreus",Jm:"Jaume","1Pe":"1 Pere","2Pe":"2 Pere","1Jn":"1 Joan","2Jn":"2 Joan","3Jn":"3 Joan",Jud:"Judes",Ap:"Apocalipsi"};
    const DATE={"1Te":[48,51],Ga:[52,58],"1Co":[53,55],"2Co":[54,57],Fl:[52,58],Flm:[52,58],Rm:[55,58],Mc:[65,75],Mt:[80,90],Lc:[80,100],Jn:[90,110]};
    const PAUL=new Set(["1Te","Ga","1Co","2Co","Fl","Flm","Rm"]), GOS=new Set(B);
    const books=E.nt.map(([k,w],i)=>({k,w,i,n:Math.round(w/100),date:DATE[k]}));
    const col=b=>GOS.has(b.k)?C.vermell:PAUL.has(b.k)?C.blau:C.ghost;
    const dots=[]; books.forEach(b=>{ for(let j=0;j<b.n;j++)dots.push({b,j}); });
    let mode="biblia", api=null;
    lg($("#biblio-lg"),[{c:C.vermell,t:"Evangelis"},{c:C.blau,t:"Cartes de Pau d'autoria acceptada"},{c:C.ghost,t:"La resta"}]);
    const msg={biblia:`El Nou Testament té uns <b>${f0(d3.sum(E.nt,d=>d[1]))}</b> mots grecs. A la Bíblia, els evangelis van primer.`,
      data:"Per data probable, les cartes de Pau passen al davant: s'escriuen unes dues dècades abans que Marc."};
    out.innerHTML=msg.biblia;
    seg(fig,k=>{ mode=k; out.innerHTML=msg[k]; api&&api.go(k); });
    V.mount(el,(node,w)=>{
      const mob=w<640, sp=mob?4.2:6, r=mob?1.6:2.3, k=mob?3:4;
      // disposició «Bíblia»: llibres seguits en files
      const lay1=new Map(); { let x=0,y=0,rowH=0; const gap=mob?6:10, lineGap=mob?30:36, maxW=w;
        const H0=[]; books.forEach(b=>{ const cols=Math.ceil(b.n/k)||1, bw=cols*sp;
          if(x+bw>maxW){ x=0; y+=rowH+lineGap; rowH=0; }
          b.bx=x; b.by=y; b.bw=bw; rowH=Math.max(rowH,k*sp); x+=bw+gap; });
        books.forEach(b=>{ for(let j=0;j<b.n;j++){ lay1.set(b.k+"_"+j,[b.bx+Math.floor(j/k)*sp+sp/2,b.by+(j%k)*sp+sp/2+18]); } });
        books.H1=books[books.length-1].by+k*sp+48; }
      // disposició «data»: columnes dretes sobre un eix d'anys
      const H2=mob?330:400, base=H2-60, x=d3.scaleLinear([40,115],[mob?10:30,w-(mob?10:30)]);
      const dated=books.filter(b=>b.date).sort((a,b2)=>((a.date[0]+a.date[1])-(b2.date[0]+b2.date[1]))||a.i-b2.i);
      let prev=-1e9; const kk=mob?4:5;
      dated.forEach(b=>{ const m=(b.date[0]+b.date[1])/2, wd=kk*sp; let cx=Math.max(x(m)-wd/2,prev+(mob?3:5)); b.cx=cx; prev=cx+wd; });
      const shift=Math.max(0,prev-(w-4)); dated.forEach(b=>b.cx-=shift);
      const lay2=new Map(); books.forEach(b=>{ for(let j=0;j<b.n;j++){ if(b.date)lay2.set(b.k+"_"+j,[b.cx+(j%kk)*sp+sp/2,base-Math.floor(j/kk)*sp-sp/2]); else lay2.set(b.k+"_"+j,null); } });
      const H=Math.max(books.H1,H2);
      const {c,ctx}=V.canvas(node,w,H,"Punts que representen les paraules dels 27 llibres del Nou Testament, primer en l'ordre de la Bíblia i després col·locats per data probable d'escriptura: les cartes de Pau als anys 50, Marc cap al 70, Mateu i Lluc als 80–90, Joan cap al 100.");
      const s=d3.select(node).append("svg").attr("class","ibv").attr("width",w).attr("height",H).style("position","absolute").style("left",0).style("top",0);
      const lab=s.append("g"), ax=s.append("g");
      dots.forEach(d=>{ const p=lay1.get(d.b.k+"_"+d.j); d.x=d.x0=p[0]; d.y=d.y0=p[1]; d.a=1; });
      let hov=null;
      function paint(){ ctx.clearRect(0,0,w,H);
        dots.forEach(d=>{ if(d.a<=.01)return; ctx.globalAlpha=d.a*(hov&&d.b!==hov?.25:1); ctx.fillStyle=col(d.b); ctx.beginPath(); ctx.arc(d.x,d.y,r,0,6.2832); ctx.fill(); }); ctx.globalAlpha=1; }
      function labels(m){ lab.selectAll("*").remove(); ax.selectAll("*").remove();
        if(m==="biblia"){ books.forEach(b=>{ if(b.n<(mob?8:5)&&!GOS.has(b.k))return; V.t(lab,b.bx,b.by+12,b.k,{size:11.5,fill:GOS.has(b.k)||PAUL.has(b.k)?C.ink:C.muted,weight:GOS.has(b.k)?700:400}); }); }
        else { [50,70,90,110].forEach(v=>{ ax.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",base+6).attr("y2",base+12).attr("stroke",C.muted); V.t(ax,x(v),base+26,String(v),{size:11.5,anchor:"middle",fill:C.muted}); });
          ax.append("line").attr("x1",x(40)).attr("x2",x(115)).attr("y1",base+6).attr("y2",base+6).attr("stroke",C.ink);
          V.t(ax,x(30),base+44,"Mitjana de la franja de dates. Les cartes de Pau, en ordre aproximat.",{size:11.5,fill:C.muted});
          dated.forEach(b=>{ const top=base-Math.ceil(b.n/kk)*sp; if(PAUL.has(b.k)&&b.n<40&&mob)return;
            V.t(lab,b.cx+kk*sp/2,top-6,b.k,{size:11.5,anchor:"middle",weight:GOS.has(b.k)?700:400,halo:true}); });
          V.t(ax,x(30)+0,26,"Els altres 16 llibres: datació massa incerta",{size:11.5,italic:true,fill:C.muted}); } }
      let raf=0;
      function go(m,inst){ cancelAnimationFrame(raf);
        dots.forEach(d=>{ d.x0=d.x; d.y0=d.y; d.a0=d.a; const p=(m==="biblia"?lay1:lay2).get(d.b.k+"_"+d.j);
          if(p){ d.x1=p[0]; d.y1=p[1]; d.a1=1; } else { d.x1=d.x; d.y1=d.y; d.a1=0; }
          d.dl=(m==="data"?(d.b.date?(d.b.date[0]-40)*7:0):d.b.i*12)+Math.random()*120; });
        labels(m);
        const T=inst||V.reduced?0:1300; let t0=null;
        const step=now=>{ if(t0==null)t0=now; const t=now-t0;
          dots.forEach(d=>{ const p=T?clamp((t-d.dl)/(T-200),0,1):1, e=ease(p); d.x=d.x0+(d.x1-d.x0)*e; d.y=d.y0+(d.y1-d.y0)*e-Math.sin(Math.PI*e)*(m==="data"?30:0); d.a=d.a0+(d.a1-d.a0)*e; });
          paint(); if(T&&t<T+600)raf=requestAnimationFrame(step); };
        raf=requestAnimationFrame(step); }
      api={go};
      if(mode!=="biblia")go(mode,true); else { labels("biblia"); paint(); }
      const tp=V.tip(node);
      s.attr("class","ibv hit").on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,s.node());
        const d=d3.least(dots.filter(e=>e.a>.5),e=>Math.hypot(e.x-mx,e.y-my));
        if(!d||Math.hypot(d.x-mx,d.y-my)>16){ if(hov){hov=null;paint();tp.hide();} return; }
        if(hov!==d.b){ hov=d.b; paint(); }
        tp.show(`<b>${NM[d.b.k]}</b><br>${f0(d.b.w)} paraules${d.b.date?`<br>Escrit cap al ${d.b.date[0]}–${d.b.date[1]}`:""}`,mx,my);
      }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ hov=null; paint(); tp.hide() } outside(node,offH);
      V.onView(node,inst=>{ if(inst||mode!=="biblia")return; dots.forEach(d=>{ d.a=0; }); dots.forEach(d=>{ d.x0=d.x; d.y0=d.y; d.a0=0; });
        let t0=null; const st=now=>{ if(t0==null)t0=now; const t=now-t0; dots.forEach(d=>{ d.a=clamp((t-d.b.i*35-d.j*2)/300,0,1); }); paint(); if(t<2200)raf=requestAnimationFrame(st); }; raf=requestAnimationFrame(st); });
    });
  })();

  /* ============ 6. El paralític, paraula per paraula ============ */
  (function(){
    const el=$("#paralitic"); if(!el)return;
    const out=$("#par-r"), P=E.par;
    const ROWS=[{k:"Mt",t:"Mateu 9,1–8"},{k:"Mc",t:"Marc 2,1–12"},{k:"Lc",t:"Lluc 5,17–26"}];
    // l'incís «diu al paralític» de Mc 2,10 i paral·lels
    const strip=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^\p{L}]/gu,"");
    function inc(k,v,first,n){ const ws=P[k]; const i=ws.findIndex((x,ix)=>x[1]===v&&strip(x[0])===first&&ix>0); return d3.range(i,i+n); }
    const INC={Mc:inc("Mc",10,"λεγει",3),Mt:inc("Mt",6,"τοτε",4),Lc:inc("Lc",24,"ειπεν",3)};
    const mt=P.Mt.filter(x=>x[2]).length, lc=P.Lc.filter(x=>x[2]).length, mk=P.Mc.length, both=P.Mc.filter(x=>x[2]===3).length;
    const base=`<b>${mt}</b> de les ${P.Mt.length} paraules de Mateu (${pc(mt/P.Mt.length)}) i <b>${lc}</b> de les ${P.Lc.length} de Lluc (${pc(lc/P.Lc.length)}) són idèntiques a Marc i en el mateix ordre. ${both} paraules de Marc reapareixen a tots dos.`;
    out.innerHTML=base;
    lg($("#par-lg"),[{c:C.vermell,t:"Igual que a Marc, a Mateu i a Lluc",k:"sq"},{c:C.vermellClar,t:"Igual a un dels dos",k:"sq"},{c:C.ghost,t:"Pròpia",k:"sq"}]);
    const colOf=(k,x)=>k==="Mc"?(x[2]===3?C.vermell:x[2]?C.vermellClar:C.ghost):(x[2]?C.vermell:C.ghost);
    V.mount(el,(node,w)=>{
      const mob=w<640, sz=mob?7:9, gp=mob?2:3, st=sz+gp, per=Math.floor(w/st);
      let y=0; const cells=[];
      ROWS.forEach(r=>{ r.y=y; y+=22; const ws=P[r.k];
        ws.forEach((x,i)=>cells.push({r,i,x,cx:(i%per)*st,cy:y+Math.floor(i/per)*st,inc:INC[r.k].includes(i)}));
        y+=Math.ceil(ws.length/per)*st+(mob?22:26); });
      const H=y;
      const s=V.svg(node,w,H,`Les paraules gregues de la curació del paralític a Mateu, Marc i Lluc. ${mt} de les ${P.Mt.length} de Mateu i ${lc} de les ${P.Lc.length} de Lluc coincideixen amb Marc en el mateix ordre, inclòs l'incís «diu al paralític».`);
      ROWS.forEach(r=>{ V.t(s,0,r.y+13,r.t,{size:13,weight:700}); V.t(s,mob?110:130,r.y+13,`${P[r.k].length} paraules`,{size:11.5,fill:C.muted}); });
      const q=s.append("g").selectAll("rect").data(cells).join("rect").attr("x",d=>d.cx).attr("y",d=>d.cy).attr("width",sz).attr("height",sz).attr("fill",d=>colOf(d.r.k,d.x));
      const ib=s.append("g");
      ROWS.forEach(r=>{ const cs=cells.filter(d=>d.r===r&&d.inc); if(!cs.length)return;
        const x0=d3.min(cs,d=>d.cx)-2, x1=d3.max(cs,d=>d.cx)+sz+2, y0=d3.min(cs,d=>d.cy)-2, y1=d3.max(cs,d=>d.cy)+sz+2;
        ib.append("rect").attr("x",x0).attr("y",y0).attr("width",x1-x0).attr("height",y1-y0).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
        if(r.k==="Mc"){ const tx=x1+(x1<w-200?14:-14);
          V.note(ib,{x:x1,y:(y0+y1)/2,tx:x1<w-200?x1+20:x0-20,ty:y1+14,kind:"elbow",anchor:x1<w-200?"start":"end",lines:[["«—diu al paralític—»",true],["el mateix incís a tots tres"]]}); } });
      const hl=s.append("rect").attr("width",sz+3).attr("height",sz+3).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5).style("opacity",0);
      const tp=V.tip(node);
      const hit=s.append("rect").attr("width",w).attr("height",H).attr("fill","transparent").attr("class","hit");
      hit.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,hit.node());
        const d=d3.least(cells,d=>Math.hypot(d.cx+sz/2-mx,d.cy+sz/2-my)); if(!d||Math.hypot(d.cx+sz/2-mx,d.cy+sz/2-my)>st*1.2){ hl.style("opacity",0); tp.hide(); return; }
        hl.style("opacity",1).attr("x",d.cx-1.5).attr("y",d.cy-1.5);
        const v=`${NOM[d.r.k]} ${d.r.k==="Mt"?9:d.r.k==="Mc"?2:5},${d.x[1]}`;
        const why=d.r.k==="Mc"?(d.x[2]===3?"també a Mateu i a Lluc":d.x[2]===1?"també a Mateu":d.x[2]===2?"també a Lluc":"només a Marc"):(d.x[2]?"igual que a Marc":"pròpia");
        q.attr("opacity",e=>e.r===d.r&&e.x[1]===d.x[1]?1:.45);
        tp.show(`<b lang="grc">${d.x[0]}</b><br>${v} · ${why}`,mx,my);
      }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ hl.style("opacity",0); tp.hide(); q.attr("opacity",1) } outside(node,offH);
      V.onView(node,inst=>{ if(inst)return; q.style("opacity",0).transition().delay(d=>d.i*6+(d.r.k==="Mc"?0:400)).duration(250).style("opacity",1); ib.style("opacity",0).transition().delay(1900).duration(600).style("opacity",1); });
    });
  })();

  /* ============ 7. Les taules d'Eusebi ============ */
  (function(){
    const el=$("#eusebi"); if(!el)return;
    const out=$("#eus-r"), EU=E.eus, TOT=E.gnt.total;
    const NG={1:4,2:3,3:3,4:3,5:2,6:2,7:2,8:2,9:2,10:1,11:1,12:1,13:1,0:0};
    const CN=["","I","II","III","IV","V","VI","VII","VIII","IX","X","X","X","X"];
    const COL={4:C.vermell,3:C.blau,2:C.blauClar,1:C.ghost,0:C.paper};
    const S={}; B.forEach(b=>{ S[b]=EU.secs[b].filter(x=>!(b==="Mc"&&x[0]>233)).map(x=>({b,n:x[0],c:x[1],ref:x[2],a:x[3],z:x[4],g:NG[x[1]]})); });
    const share={}; B.forEach(b=>{ share[b]=d3.sum(S[b].filter(x=>x.g>1),x=>x.z-x.a)/TOT[b]; });
    const BI={Mt:1,Mc:2,Lc:3,Jn:4};
    function parallels(sec){ const res={}; EU.rows.forEach(r=>{ if(r[BI[sec.b]]===sec.n){ B.forEach(b=>{ if(b!==sec.b&&r[BI[b]]){ (res[b]=res[b]||new Set()).add(r[BI[b]]); } }); } }); return res; }
    lg($("#eus-lg"),[{c:C.vermell,t:"Als quatre",k:"sq"},{c:C.blau,t:"A tres",k:"sq"},{c:C.blauClar,t:"A dos",k:"sq"},{c:C.ghost,t:"Només en aquest",k:"sq"}]);
    const base=`Amb paral·lel en algun altre evangeli: ${B.map(b=>`${NOM[b]} <b>${pc(share[b])}</b>`).join(" · ")}. Passa per una secció per veure on són els seus paral·lels.`;
    out.innerHTML=base;
    V.mount(el,(node,w)=>{
      const mob=w<640, L=mob?0:70, R=w-(mob?0:110), rh=mob?16:20, gap=mob?64:70, top=mob?18:10;
      const H=top+B.length*rh+(B.length-1)*gap+20;
      const x=d3.scaleLinear([0,d3.max(B,b=>TOT[b])],[L,R]);
      const yb=b=>top+(mob?14:0)+B.indexOf(b)*(rh+gap);
      const {ctx}=V.canvas(node,w,H,`Els quatre evangelis dividits en les seccions d'Eusebi i acolorits segons quants evangelis comparteixen cada secció. Té paral·lel el ${pc(share.Mc)} de Marc, el ${pc(share.Mt)} de Mateu, el ${pc(share.Lc)} de Lluc i el ${pc(share.Jn)} de Joan.`);
      const s=d3.select(node).append("svg").attr("class","ibv").attr("width",w).attr("height",H).style("position","absolute").style("left",0).style("top",0);
      B.forEach(b=>{ const y=yb(b);
        if(mob)V.t(s,0,y-5,`${NOM[b]} · ${S[b].length} seccions · ${pc(share[b])} amb paral·lel`,{size:11.5,weight:600,halo:true});
        else { V.t(s,L-10,y+rh/2+4,NOM[b],{size:13,weight:700,anchor:"end"}); V.lines(s,x(TOT[b])+10,y+rh/2-3,[[pc(share[b]),true],[`${S[b].length} seccions`]],{size:11.5}); } });
      let prog=1;
      function paint(){ ctx.clearRect(0,0,w,H);
        B.forEach(b=>{ const y=yb(b); S[b].forEach(sc=>{ const x0=x(sc.a), x1=x(sc.z); const lim=L+(R-L)*prog; if(x0>lim)return;
          ctx.fillStyle=COL[sc.g]; ctx.fillRect(x0,y,Math.max(.6,Math.min(x1,lim)-x0-.5),rh); }); }); }
      paint();
      const ov=s.append("g");
      const tp=V.tip(node);
      function show(sc,mx,my){ ov.selectAll("*").remove(); tp.hide();
        if(!sc){ out.innerHTML=base; return; }
        const y=yb(sc.b), cx=(x(sc.a)+x(sc.z))/2;
        ov.append("rect").attr("x",x(sc.a)-1).attr("y",y-1).attr("width",x(sc.z)-x(sc.a)+1).attr("height",rh+2).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
        const P=parallels(sc), parts=[];
        Object.entries(P).forEach(([b,set])=>{ set.forEach(n=>{ const t=S[b].find(e=>e.n===n); if(!t)return; const y2=yb(b), cx2=(x(t.a)+x(t.z))/2;
          const ya=y2>y?y+rh:y, yb2=y2>y?y2:y2+rh, my2=(ya+yb2)/2;
          ov.append("path").attr("d",`M${cx},${ya}C${cx},${my2} ${cx2},${my2} ${cx2},${yb2}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).style("opacity",.8);
          ov.append("rect").attr("x",x(t.a)-1).attr("y",y2-1).attr("width",Math.max(2,x(t.z)-x(t.a)+1)).attr("height",rh+2).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
          parts.push(`${NOM[b]} ${t.ref}`); }); });
        const can=sc.c?`taula ${CN[sc.c]}`:"sense taula";
        out.innerHTML=`<b>${NOM[sc.b]} ${sc.ref}</b> · secció ${sc.n}, ${can}. ${parts.length?`Paral·lels: ${parts.join(" · ")}.`:"Sense paral·lel als altres evangelis."}`;
        tp.show(`<b>${NOM[sc.b]} ${sc.ref}</b><br>Secció ${sc.n} · ${can}<br>${parts.length?`${parts.length} paral·lel${parts.length>1?"s":""}`:"Pròpia"}`,mx,my);
      }
      s.attr("class","ibv hit").on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,s.node());
        const b=d3.least(B,b=>Math.abs(yb(b)+rh/2-my)); if(Math.abs(yb(b)+rh/2-my)>rh*1.4)return show(null);
        const wpos=x.invert(mx); const sc=S[b].find(e=>wpos>=e.a&&wpos<e.z); show(sc||null,mx,my);
      }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ show(null) } outside(node,offH);
      V.onView(node,inst=>{ if(inst)return; prog=0; const t=d3.timer(el2=>{ prog=Math.min(1,ease(el2/1400)); paint(); if(el2>1400)t.stop(); }); });
    });
  })();

  /* ============ 8. Dues hipòtesis ============ */
  (function(){
    const el=$("#hipo"); if(!el)return;
    const out=$("#hipo-r"), fig=$("#f-hipo"), TOT=E.gnt.total;
    const MSG={q:"<b>Hipòtesi de les dues fonts.</b> Mateu i Lluc copien Marc cadascun pel seu compte, i a més fan servir una col·lecció de dites perduda, Q. És la més estesa.",
      farrer:"<b>Sense Q.</b> Mateu reescriu Marc; després Lluc llegeix Marc i també Mateu. El material comú de Mateu i Lluc no necessita cap font perduda."};
    let mode="q", api=null;
    lg($("#hipo-lg"),[{c:C.vermell,t:"Marc, la font comuna"},{c:C.blau,t:"Els qui el fan servir"},{c:C.muted,t:"Q, hipotètica",k:"ho"}]);
    out.innerHTML=MSG.q;
    seg(fig,k=>{ mode=k; out.innerHTML=MSG[k]; api&&api(k); });
    V.mount(el,(node,w)=>{
      const mob=w<640, H=mob?330:380;
      const s=V.svg(node,w,H,"Esquema de dues hipòtesis sobre les fonts dels evangelis: Marc i Q com a fonts de Mateu i Lluc, o Marc com a font de Mateu i Lluc, i Mateu de Lluc. Joan, a part.");
      const r=d3.scaleSqrt([0,20000],[0,mob?44:58]);
      const N={Mc:{t:"Marc",w:TOT.Mc},Mt:{t:"Mateu",w:TOT.Mt},Lc:{t:"Lluc",w:TOT.Lc},Q:{t:"Q",w:null},Jn:{t:"Joan",w:TOT.Jn}};
      const cx=w*(mob?.42:.4);
      const POS={q:{Mc:[cx-w*.17,70],Q:[cx+w*.17,70],Mt:[cx-w*.17,H-80],Lc:[cx+w*.17,H-80],Jn:[w*(mob?.86:.85),H/2]},
        farrer:{Mc:[cx-w*.2,70],Q:[cx+w*.17,70],Mt:[cx+w*.0,H/2],Lc:[cx+w*.2,H-80],Jn:[w*(mob?.86:.85),H/2]}};
      const ED={q:[["Mc","Mt"],["Mc","Lc"],["Q","Mt"],["Q","Lc"]],farrer:[["Mc","Mt"],["Mc","Lc"],["Mt","Lc"]]};
      s.append("defs").append("marker").attr("id","arw").attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",7).attr("markerHeight",7).attr("orient","auto-start-reverse")
        .append("path").attr("d","M0,1L9,5L0,9").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
      const eg=s.append("g"), ng=s.append("g");
      const rad=k=>k==="Q"?(mob?26:32):r(N[k].w);
      const nodes=ng.selectAll("g").data(Object.keys(N)).join("g").attr("class","hit");
      nodes.append("circle").attr("r",rad).attr("fill",k=>k==="Q"?C.paper:k==="Jn"?C.paper:k==="Mc"?V.alpha(C.vermell,.85):V.alpha(C.blau,.8)).attr("stroke",k=>k==="Q"?C.muted:k==="Jn"?C.ink2:C.paper).attr("stroke-width",k=>k==="Q"||k==="Jn"?1.4:1).attr("stroke-dasharray",k=>k==="Q"?"4 3":null);
      nodes.each(function(k){ const g=d3.select(this);
        V.t(g,0,k==="Q"?5:4,N[k].t,{size:13,weight:700,anchor:"middle",halo:k!=="Q"&&k!=="Jn"?false:true,fill:k==="Q"||k==="Jn"?C.ink:C.paper});
        V.t(g,0,rad(k)+16,k==="Q"?(mob?"sense còpia":"cap còpia conservada"):`${f0(N[k].w)} paraules`,{size:11.5,anchor:"middle",fill:C.muted,halo:true}); });
      const jnote=V.t(s,0,0,"",{size:11.5,anchor:"middle",italic:true,fill:C.ink2,halo:true});
      function edgePath(a,b,P){ const [x1,y1]=P[a], [x2,y2]=P[b], d=Math.hypot(x2-x1,y2-y1), ux=(x2-x1)/d, uy=(y2-y1)/d;
        return `M${x1+ux*(rad(a)+4)},${y1+uy*(rad(a)+4)}L${x2-ux*(rad(b)+6)},${y2-uy*(rad(b)+6)}`; }
      function set(m,inst){ const P=POS[m], dur=inst||V.reduced?0:900;
        nodes.transition().duration(dur).ease(ease).attr("transform",k=>`translate(${P[k][0]},${P[k][1]})`).style("opacity",k=>k==="Q"&&m==="farrer"?0:1);
        const E2=eg.selectAll("path").data(ED[m],d=>d.join("-"));
        E2.exit().transition().duration(dur/2).style("opacity",0).remove();
        const en=E2.enter().append("path").attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4).attr("marker-end","url(#arw)").style("opacity",0).attr("d",d=>edgePath(d[0],d[1],P));
        en.merge(E2).attr("stroke-dasharray",d=>d[0]==="Q"?"4 3":null).transition().delay(dur*.4).duration(dur*.6).style("opacity",1).attr("d",d=>edgePath(d[0],d[1],P));
        jnote.attr("x",P.Jn[0]).attr("y",P.Jn[1]-rad("Jn")-12).text(mob?"a part":"relació discutida"); }
      api=k=>set(k,false); set(mode,true);
      nodes.on("pointerenter pointerdown",(ev,k)=>{ const t={Mc:"Marc: el més breu dels quatre. Totes dues hipòtesis el posen primer.",Mt:"Mateu: reaprofita gairebé tot Marc.",Lc:"Lluc: reaprofita una part de Marc i té molt material propi.",Q:"Q: una col·lecció de dites que explicaria el que Mateu i Lluc comparteixen sense Marc. No n'ha aparegut cap còpia.",Jn:"Joan: comparteix poc amb els altres tres. Si en coneixia algun, es discuteix."}[k];
        out.innerHTML=t; nodes.select("circle").attr("stroke-width",kk=>kk===k?2.4:(kk==="Q"||kk==="Jn"?1.4:1)).attr("stroke",kk=>kk===k?C.ink:(kk==="Q"?C.muted:kk==="Jn"?C.ink2:C.paper)); })
        .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); });
      function offH(){ out.innerHTML=MSG[mode]; nodes.select("circle").attr("stroke-width",kk=>kk==="Q"||kk==="Jn"?1.4:1).attr("stroke",kk=>kk==="Q"?C.muted:kk==="Jn"?C.ink2:C.paper); }
      outside(node,offH);
      s.on("pointerdown.bg",ev=>{ if(!ev.target.closest("g.hit"))offH(); });
      V.onView(node,inst=>{ if(inst)return; nodes.select("circle").attr("r",0).transition().duration(800).ease(d3.easeBackOut).attr("r",rad); });
    });
  })();

  /* ============ 9. Les paraules de cada evangelista ============ */
  (function(){
    const el=$("#mots"); if(!el)return;
    const out=$("#mots-r"), fig=$("#f-mots"), TOT=E.gnt.total, M=E.gnt.mots;
    const segEl=$("#mots-seg");
    segEl.innerHTML=M.map((m,i)=>`<button type="button" aria-pressed="${i===2}" data-k="${i}">${m.ca}</button>`).join("");
    let cur=2, api=null;
    const GR={"βασιλεία":"basileía","παραβολή":"parabolḗ","εὐθύς":"euthýs","πιστεύω":"pisteúō","κόσμος":"kósmos","Ἰουδαῖος":"Ioudaîos","ἀγαπάω":"agapáō"};
    function text(i){ const m=M[i]; const n=B.map(b=>m.pos[b].length); const top=B[d3.maxIndex(n)];
      out.innerHTML=`<b>«${m.ca}»</b> (<i>${GR[m.g]}</i>) · ${B.map(b=>`${NOM[b]} ${m.pos[b].length}`).join(" · ")}. Per cada 10.000 paraules, ${NOM[top]} la fa servir ${V.fmt(".0f")(m.pos[top].length/TOT[top]*1e4)} vegades.`; }
    text(cur);
    seg(fig,k=>{ cur=+k; text(cur); api&&api(); });
    V.mount(el,(node,w)=>{
      const mob=w<640, L=mob?0:70, R=w-(mob?0:120), rh=mob?30:34, gap=mob?30:22, top=mob?16:6;
      const H=top+B.length*(rh+gap);
      const x=d3.scaleLinear([0,d3.max(B,b=>TOT[b])],[L,R]);
      const yb=b=>top+B.indexOf(b)*(rh+gap)+(mob?14:0);
      const s=V.svg(node,w,H,"Aparicions d'una paraula al llarg de cada evangeli, amb una ratlla per aparició.");
      B.forEach(b=>{ const y=yb(b);
        s.append("line").attr("x1",L).attr("x2",x(TOT[b])).attr("y1",y+rh).attr("y2",y+rh).attr("stroke",C.ink2);
        CUM[b].forEach((c,i)=>{ if(i)s.append("line").attr("x1",x(c)).attr("x2",x(c)).attr("y1",y+rh).attr("y2",y+rh+3).attr("stroke",C.muted).attr("stroke-width",.6); });
        if(mob)V.t(s,0,y-4,NOM[b],{size:12,weight:700}); else V.t(s,L-10,y+rh-2,NOM[b],{size:13,weight:700,anchor:"end"}); });
      const tg=s.append("g"), cg=s.append("g");
      const tp=V.tip(node), hl=s.append("line").attr("stroke",C.ink).attr("stroke-width",2).style("opacity",0);
      function draw(inst){
        const m=M[cur], data=[]; B.forEach(b=>m.pos[b].forEach(p=>data.push({b,p,k:b+p})));
        const sel=tg.selectAll("line").data(data,d=>cur+"_"+d.k);
        sel.exit().transition().duration(200).style("opacity",0).remove();
        sel.enter().append("line").attr("x1",d=>x(d.p)).attr("x2",d=>x(d.p)).attr("y1",d=>yb(d.b)+rh).attr("y2",d=>yb(d.b)+rh)
          .attr("stroke",C.vermell).attr("stroke-width",mob?1:1.3).style("opacity",.85)
          .transition().delay(d=>inst||V.reduced?0:200+d.p/TOT[d.b]*700).duration(inst||V.reduced?0:400).attr("y2",d=>yb(d.b)+4);
        cg.selectAll("*").remove();
        const mx=d3.max(B,b=>m.pos[b].length);
        B.forEach(b=>{ const n=m.pos[b].length, rate=n/TOT[b]*1e4, y=yb(b);
          const tx=mob?w:x(TOT[b])+10;
          V.lines(cg,tx,y+(mob?-4:rh/2),mob?[[`${n} vegades`,n===mx]]:[[`${n} vegades`,n===mx],[`${V.fmt(".1f")(rate)} per 10.000`]],{size:mob?11.5:12.5,anchor:mob?"end":"start",halo:true}); });
      }
      api=()=>draw(false); draw(true);
      const hit=s.append("rect").attr("width",w).attr("height",H).attr("fill","transparent").attr("class","hit");
      hit.on("pointermove pointerdown",ev=>{ const [mx,my]=d3.pointer(ev,hit.node());
        const b=d3.least(B,b=>Math.abs(yb(b)+rh/2-my)); const ps=M[cur].pos[b]; if(!ps.length){ tp.hide(); hl.style("opacity",0); return; }
        const p=d3.least(ps,p=>Math.abs(x(p)-mx)); if(Math.abs(x(p)-mx)>24){ tp.hide(); hl.style("opacity",0); return; }
        hl.style("opacity",1).attr("x1",x(p)).attr("x2",x(p)).attr("y1",yb(b)).attr("y2",yb(b)+rh+5);
        tp.show(`<b>${NOM[b]}, capítol ${chapOf(b,p)}</b><br>«${M[cur].ca}» · ${ps.indexOf(p)+1}a de ${ps.length}`,mx,my);
      }).on("pointerleave",ev=>{ if(ev.pointerType==="mouse")offH(); }); function offH(){ tp.hide(); hl.style("opacity",0) } outside(node,offH);
    });
  })();
})();
