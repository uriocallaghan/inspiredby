/* «Jesús i els quatre evangelis» · visualitzacions (mapes a mapes.js)
   V1 (#temps): Scrollytelling cronològic IB-49 amb banda de memòria oral.
   V2 (#biblio): IB-51 barra que es trenca / unitats que volen (Ordre Bíblia ↔ Escriptura).
   V6 (#setmana): Zoom narratiu de l'última setmana de Marc + posició d'escenes als 4 llibres.
   V7a (#flux): IB-40 flux amb partícules en canvas (Marc + Q ↔ Sense Q).
   V7b (#corda): IB-46 diagrama de corda de les taules d'Eusebi.
   V8 (#flors): IB-45 flors de dades dels 4 evangelis (6 trets reals verificats). */
(function(){
  if(!window.d3||!window.IBV||!window.EVG)return;
  const V=IBV, C=V.C, E=window.EVG;
  const B=["Mc","Mt","Lc","Jn"], NOM={Mt:"Mateu",Mc:"Marc",Lc:"Lluc",Jn:"Joan"};
  const COL={Mc:C.vermell,Mt:C.blau,Lc:C.blauClar,Jn:C.groc};
  const f0=V.fmt(",.0f"), pc=v=>V.fmt(".0f")(v)+" %";
  const $=s=>document.querySelector(s);
  const OUTS=new Map();
  document.addEventListener("pointerdown",ev=>{ OUTS.forEach((fn,n)=>{ if(n.isConnected&&!n.contains(ev.target))fn(); }); },true);
  const outside=(node,fn)=>OUTS.set(node,fn);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=d3.easeCubicInOut;

  function seg(fig,cb){
    const bs=[...fig.querySelectorAll(".seg button")];
    bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(x=>x.setAttribute("aria-pressed",String(x===b))); cb(b.dataset.k); }));
  }
  function lg(el,items){
    if(!el)return;
    el.innerHTML=items.map(i=>`<span class="lgi"><i class="${i.k||""}" style="${i.k==="ln"||i.k==="da"||i.k==="ho"?"border-color":"background"}:${i.c}"></i>${i.t}</span>`).join("");
  }

  // càlcul exacte d'Eusebi (paraules per cànon, excloent cànon 0 = final llarg de Marc)
  const EUS={};
  ["Mt","Mc","Lc","Jn"].forEach(b=>{
    const secs=E.eus.secs[b].filter(s=>s[1]>0);
    const byC={}; let tot=0;
    secs.forEach(s=>{ const w=s[4]-s[3]; byC[s[1]]=(byC[s[1]]||0)+w; tot+=w; });
    const uniq=byC[10]||0;
    EUS[b]={tot,uniq,shared:tot-uniq,uniqPct:uniq/tot*100,sharedPct:(tot-uniq)/tot*100,byC};
  });

  /* =====================================================================
     V0 · OBERTURA: UNA SOLA VIDA, QUATRE RETRATS (#intro-viz)
     ===================================================================== */
  (function(){
    const el=$("#intro-viz"), rd=$("#intro-r"); if(!el)return;
    const EV=[
      {k:"Mc",n:"Marc",yr:"≈ 65–75",dt:"+40 anys",w:E.gnt.total.Mc,u:Math.round(EUS.Mc.uniqPct),c:C.vermell,
        sub:"El primer · breu i urgent",det:"El més antic i curt (11.085 paraules). Sense relat de naixement; el 94 % reapareix a Mateu i Lluc."},
      {k:"Mt",n:"Mateu",yr:"≈ 80–90",dt:"+55 anys",w:E.gnt.total.Mt,u:Math.round(EUS.Mt.uniqPct),c:C.blau,
        sub:"El mestre jueu · mags i Egipte",det:"Escriu per a lectors d'arrel jueva (18.329 paraules). Afegeix el Sermó de la Muntanya i el relat dels mags."},
      {k:"Lc",n:"Lluc",yr:"≈ 80–100",dt:"+58 anys",w:E.gnt.total.Lc,u:Math.round(EUS.Lc.uniqPct),c:C.blauClar,
        sub:"Pastors · bon samarità · Jerusalem",det:"El més llarg (19.446 paraules). Posa el focus en els pobres, les dones i el viatge cap a Jerusalem."},
      {k:"Jn",n:"Joan",yr:"≈ 90–110",dt:"+70 anys",w:E.gnt.total.Jn,u:Math.round(EUS.Jn.uniqPct),c:C.groc,
        sub:"76 % únic · filosòfic, sense paràboles",det:"El més tardà i diferent (15.438 paraules). Tres quartes parts no surten als altres tres evangelis."}
    ];
    lg($("#intro-lg"),[
      {c:C.vermell,t:"Vida de Jesús i Marc (1r)"},
      {c:C.blau,t:"Mateu i Lluc (sinòptics)"},
      {c:C.groc,t:"Joan (camí propi)"}
    ]);

    V.mount(el,(node,w)=>{
      const mob=w<680, tp=V.tip(node);
      const rSc=d3.scaleSqrt([0,20000],[0,mob?22:34]);
      const h=mob?380:330;
      const s=V.svg(node,w,h,"Esquema d'obertura: d'una sola vida sense textos propis (Jesús, ~6 aC – ~30 dC) en sorgeixen quatre evangelis escrits entre 40 i 70 anys després.");

      if(!mob){
        // ESCRIPTORI: Jesús a l'esquerra → 4 arcs radials cap a la dreta (ordre cronològic)
        const ox=118, oy=h/2;
        const gRings=s.append("g"), gArcs=s.append("g"), gNodes=s.append("g");

        // anells concèntrics de temps des de la creu (continguts estrictament dins 22..h-22)
        [{r:210,t:"+40 anys"},{r:360,t:"+55 anys"},{r:510,t:"+70 anys"}].forEach(a=>{
          if(ox+a.r>w-180)return;
          const maxAng=Math.asin(Math.min(.92,(oy-24)/a.r));
          const ang=Math.min(.62,maxAng);
          const xTop=ox+a.r*Math.cos(-ang), yTop=oy+a.r*Math.sin(-ang);
          const xBot=ox+a.r*Math.cos(ang), yBot=oy+a.r*Math.sin(ang);
          gRings.append("path").attr("d",`M${xTop},${yTop} A${a.r},${a.r} 0 0,1 ${xBot},${yBot}`)
            .attr("fill","none").attr("stroke",C.grid).attr("stroke-width",1).attr("stroke-dasharray","3 4");
          V.t(gRings,xTop,yTop-6,a.t,{anchor:"middle",size:11,fill:C.muted});
        });

        // posicions dels 4 evangelis: x segons distància temporal, y repartida netament
        const xMin=Math.min(w*.42,ox+230), xMax=Math.min(w-250,ox+520);
        const xPos=[xMin, xMin+(xMax-xMin)*.42, xMin+(xMax-xMin)*.52, xMax];
        const yPos=[56, 134, 214, 286];

        const items=EV.map((d,i)=>({...d,x:xPos[i],y:yPos[i],r:rSc(d.w)}));

        // arcs des de Jesús cap a cada evangeli
        const arcs=gArcs.selectAll("path.ia").data(items).join("path").attr("class","ia")
          .attr("d",d=>{ const mx=(ox+d.x)/2; return `M${ox},${oy} C${mx},${oy} ${mx},${d.y} ${d.x-d.r-2},${d.y}`; })
          .attr("fill","none").attr("stroke",d=>d.c===C.groc?C.grocFosc:d.c).attr("stroke-width",d=>d.k==="Mc"?2.2:1.8)
          .attr("stroke-opacity",.55).style("cursor","pointer");

        // origen: Jesús
        gNodes.append("circle").attr("cx",ox).attr("cy",oy).attr("r",26).attr("fill",V.alpha(C.vermell,.1)).attr("stroke",V.alpha(C.vermell,.35)).attr("stroke-dasharray","2 3");
        gNodes.append("circle").attr("cx",ox).attr("cy",oy).attr("r",7.5).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",2);
        V.lines(gNodes,ox,oy+42,[["Jesús de Natzaret",true,C.ink],["≈ 6 aC – ≈ 30 dC",false,C.ink2],["0 línies escrites",false,C.vermell]],{anchor:"middle",size:12,halo:3});

        // els 4 evangelis
        const gEv=gNodes.selectAll("g.iev").data(items).join("g").attr("class","iev").style("cursor","pointer");
        gEv.each(function(d){
          const g=d3.select(this);
          g.append("circle").attr("class","bg").attr("cx",d.x).attr("cy",d.y).attr("r",d.r)
            .attr("fill",V.alpha(d.c,d.c===C.groc?.72:.22)).attr("stroke",d.c===C.groc?"none":d.c).attr("stroke-width",1.3);
          // cercle interior proporcional al % exclusiu
          const ri=d.r*Math.sqrt(d.u/100);
          g.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",ri)
            .attr("fill",V.alpha(d.c,d.c===C.groc?.95:.55));
          V.t(g,d.x+d.r+12,d.y-4,`${d.n} · ${d.yr}`,{weight:700,size:13.5,fill:C.ink});
          V.t(g,d.x+d.r+12,d.y+12,`${d.sub} (${f0(d.w)} par.)`,{size:11.5,fill:C.ink2});
        });

        V.onView(node,instant=>{
          if(instant)return;
          arcs.each(function(d,i){ const len=this.getTotalLength(); d3.select(this).attr("stroke-dasharray",len+" "+len).attr("stroke-dashoffset",len)
            .transition().delay(i*120).duration(850).ease(ease).attr("stroke-dashoffset",0).on("end",function(){ d3.select(this).attr("stroke-dasharray",null); }); });
          gEv.style("opacity",0).transition().delay((d,i)=>250+i*120).duration(550).style("opacity",1);
        });

        const reset=()=>{ arcs.attr("stroke-opacity",.55).attr("stroke-width",d=>d.k==="Mc"?2.2:1.8); gEv.style("opacity",1); tp.hide(); };
        outside(node,reset);
        V.hover(s.node(),(ev,[px,py])=>{
          const d=d3.least(items,q=>Math.hypot(px-q.x,py-q.y));
          if(!d||Math.hypot(px-d.x,py-d.y)>d.r+95){ reset(); return; }
          arcs.attr("stroke-opacity",q=>q===d?1:.1).attr("stroke-width",q=>q===d?3:1.4);
          gEv.style("opacity",q=>q===d?1:.22);
          tp.show(`<b>Evangeli de ${d.n}</b> (${d.yr} · ${d.dt})<br>${d.det}`,clamp(d.x-10,10,w-260),clamp(d.y-d.r-48,8,h-70));
          if(rd) rd.innerHTML=`<b>${d.n} (${d.yr}):</b> ${d.det}`;
        },reset);
      } else {
        // MÒBIL: Jesús a dalt, 4 arcs verticals nets cap a cada evangeli
        const ox=w/2, oy=30;
        const gArcs=s.append("g"), gNodes=s.append("g");
        const items=EV.map((d,i)=>({...d,x:38,y:122+i*66,r:rSc(d.w)}));

        gNodes.append("circle").attr("cx",ox).attr("cy",oy).attr("r",6.5).attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.8);
        V.t(gNodes,ox,oy+22,"Jesús de Natzaret · ≈ 6 aC – ≈ 30 dC (0 línies escrites)",{anchor:"middle",weight:700,size:11.5,fill:C.ink});

        items.forEach(d=>{
          gArcs.append("path").attr("d",`M${ox},${oy+30} C${ox},${oy+56} ${d.x},${d.y-24} ${d.x},${d.y-d.r-2}`)
            .attr("fill","none").attr("stroke",d.c===C.groc?C.grocFosc:d.c).attr("stroke-width",1.4).attr("stroke-opacity",.45);
        });
        const gEv=gNodes.selectAll("g.iev").data(items).join("g").attr("class","iev").style("cursor","pointer");
        gEv.each(function(d){
          const g=d3.select(this);
          g.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",d.r)
            .attr("fill",V.alpha(d.c,d.c===C.groc?.72:.22)).attr("stroke",d.c===C.groc?"none":d.c).attr("stroke-width",1.2);
          g.append("circle").attr("cx",d.x).attr("cy",d.y).attr("r",d.r*Math.sqrt(d.u/100))
            .attr("fill",V.alpha(d.c,d.c===C.groc?.95:.55));
          V.t(g,d.x+d.r+12,d.y-3,`${d.n} · ${d.yr} (${d.dt})`,{weight:700,size:12.5,fill:C.ink});
          V.t(g,d.x+d.r+12,d.y+13,d.sub,{size:11.5,fill:C.ink2});
        });

        const reset=()=>{ gEv.style("opacity",1); tp.hide(); };
        outside(node,reset);
        V.hover(s.node(),(ev,[px,py])=>{
          const d=d3.least(items,q=>Math.abs(py-q.y));
          if(!d||Math.abs(py-d.y)>34){ reset(); return; }
          gEv.style("opacity",q=>q===d?1:.25);
          if(rd) rd.innerHTML=`<b>${d.n} (${d.yr}):</b> ${d.det}`;
        },reset);
      }

      if(rd) rd.innerHTML="<b>Quatre mirades:</b> el cercle interior més fosc mostra la part exclusiva de cada evangeli — molt petita a <b>Marc</b> (6 %) i enorme a <b>Joan</b> (76 %).";
    });
  })();

  /* =====================================================================
     V1 · LA VIDA, EL SILENCI I ELS LLIBRES (Scrollytelling IB-49 adaptat)
     ===================================================================== */
  (function(){
    const el=$("#temps"); if(!el)return;
    const G={
      vida:{c:C.vermell,t:"Vida de Jesús"},
      cartes:{c:C.blauClar,t:"Cartes de Pau"},
      escrits:{c:C.blau,t:"Els quatre evangelis"},
      externes:{c:C.groc,t:"Referències externes (jueva i romana)"},
      canon:{c:C.ink2,t:"Selecció dels 4 llibres"}
    };
    const D=[
      {g:"vida",n:"Naixement",a:-6,b:-4,l:"≈ 6–4 aC",d:"En vida d'Herodes el Gran (mort el 4 aC). L'any exacte no es coneix."},
      {g:"vida",n:"Baptisme al Jordà",a:28,b:29,l:"≈ 28–29",d:"Predicació de Joan Baptista el quinzè any de Tiberi (Lluc 3,1)."},
      {g:"vida",n:"Crucifixió a Jerusalem",a:29,b:33,m:30,l:"≈ 30",d:"Execució romana sota Ponç Pilat. Referència temporal de tot el gràfic."},
      {g:"cartes",n:"1 Tessalonicencs (Pau)",s:"1 Tessalonicencs",a:48,b:51,l:"≈ 50",d:"El text cristià més antic que conservem: uns 20 anys després de la creu."},
      {g:"cartes",n:"Corintis, Gàlates, Romans…",s:"Altres cartes de Pau",a:52,b:58,l:"anys 50",d:"Pau ja hi esmenta el darrer sopar, la mort i les aparicions."},
      {g:"escrits",n:"Evangeli de Marc",s:"Marc",a:65,b:75,l:"≈ 65–75",d:"El primer evangeli, escrit pels volts de la destrucció del Temple (any 70)."},
      {g:"escrits",n:"Evangeli de Mateu",s:"Mateu",a:80,b:90,l:"≈ 80–90",d:"Aprofita Marc i afegeix el relat de Betlem i grans discursos."},
      {g:"escrits",n:"Evangeli de Lluc",s:"Lluc",a:80,b:100,l:"≈ 80–100",d:"Primer volum d'una obra que continua als Fets dels Apòstols."},
      {g:"escrits",n:"Evangeli de Joan",s:"Joan",a:90,b:110,l:"≈ 90–110",d:"El més tardà i diferent: tres quartes parts no surten als altres tres."},
      {g:"externes",n:"Flavi Josep (historiador jueu)",s:"Flavi Josep (jueu)",a:93,b:94,l:"93–94",d:"Esmenta Jaume, «germà de Jesús, l'anomenat Crist»."},
      {g:"externes",n:"Tàcit (historiador romà)",s:"Tàcit (romà)",a:105,b:120,l:"s. II",d:"Esmenta Crist, executat sota Tiberi per ordre de Pilat."},
      {g:"canon",n:"Ireneu defensa que són quatre",s:"Ireneu",a:178,b:182,l:"≈ 180",d:"Compara els quatre evangelis amb els quatre vents."},
      {g:"canon",n:"Atanasi fixa els 27 llibres",s:"Atanasi",a:367,b:367,l:"367",d:"Primera llista exacta del Nou Testament actual.",ev:1}
    ];
    const STEP_GROUPS={
      vida:["vida"],
      oral:["vida"],
      cartes:["vida","cartes"],
      escrits:["vida","cartes","escrits"],
      externes:["vida","cartes","escrits","externes"],
      canon:["vida","cartes","escrits","externes","canon"]
    };
    lg($("#temps-lg"),Object.values(G).map(g=>({c:g.c,t:g.t})));
    let state="vida", api=null;

    V.mount(el,(node,w)=>{
      const mob=w<640, rh=mob?20:25, hdrH=mob?18:20, gap=mob?10:14, top=28;
      const L=mob?0:166, R=w-(mob?8:16);
      let y=top; const groups=[];
      Object.keys(G).forEach((g,gi)=>{
        const divY=gi>0?y-6:null;
        const hy=y+11;
        y+=hdrH;
        const rowsG=D.filter(d=>d.g===g);
        rowsG.forEach(d=>{ d.y=y+6; y+=rh; });
        groups.push({g,divY,hy,y0:hy-11,y1:y});
        y+=gap;
      });
      const h=y+22;
      const s=V.svg(node,w,h,"Cronologia dividida en cinc blocs: vida de Jesús, cartes de Pau, els quatre evangelis, referències externes (jueva i romana) i selecció dels quatre llibres.");

      // escala partida: -10..120 ocupa el 78 % de l'amplada; 120..380 ocupa el 22 %
      const split=L+(R-L)*.78;
      const x=yr=>yr<=120?L+(yr+10)/130*(split-L):split+(yr-120)/260*(R-split);

      // eix superior i graella
      const ticks=[-10,0,30,50,70,90,110,180,367];
      ticks.forEach(t=>{
        const xx=x(t);
        s.append("line").attr("x1",xx).attr("y1",20).attr("x2",xx).attr("y2",h-22)
          .attr("stroke",t===30?V.alpha(C.vermell,.45):C.grid).attr("stroke-width",t===30?1.2:.8)
          .attr("stroke-dasharray",t===30?"3 3":null);
        if(mob&&(t===-10||t===90||t===180))return;
        V.t(s,xx,14,t<0?Math.abs(t)+" aC":t===0?"0":t===30?"≈ 30":String(t),{anchor:"middle",size:11,fill:t===30?C.vermell:C.muted,weight:t===30?700:400});
      });
      // marca de tall d'escala a l'any 120
      const sx=x(120);
      s.append("line").attr("x1",sx-3).attr("y1",20).attr("x2",sx+3).attr("y2",h-22).attr("stroke",C.hair).attr("stroke-dasharray","2 3");
      if(!mob) V.t(s,sx+6,h-8,"escala comprimida ▶",{size:11,fill:C.muted});

      // banda de memòria oral (30 dC a 70 dC) amb onades suaus
      const gOral=s.append("g").attr("class","oral-band");
      const ox0=x(30), ox1=x(70);
      gOral.append("rect").attr("x",ox0).attr("y",20).attr("width",ox1-ox0).attr("height",h-42)
        .attr("fill",V.alpha(C.vermell,.045));
      const waves=d3.range(6).map(i=>{
        const wy=34+i*((h-68)/5);
        return gOral.append("path").attr("fill","none").attr("stroke",V.alpha(C.vermell,.18)).attr("stroke-width",1.1).attr("data-y",wy);
      });
      function drawWaves(phase){
        waves.forEach((wp,i)=>{
          const wy=+wp.attr("data-y"), pts=[];
          for(let k=0;k<=24;k++){ const u=k/24, px=ox0+(ox1-ox0)*u; pts.push([px,wy+Math.sin(u*Math.PI*3+phase+i*.9)*3.2]); }
          wp.attr("d",d3.line()(pts));
        });
      }
      drawWaves(0);
      const gOralLab=gOral.append("g");
      V.lines(gOralLab,(ox0+ox1)/2,top+(mob?96:88),[["Memòria oral",true,C.vermell],["20–40 anys de boca en boca",false,C.ink2]],{anchor:"middle",size:mob?11:11.5,halo:3.5});
      V.loop(node,(t)=>{ if(state==="oral"||state==="cartes"||state==="escrits") drawWaves(t*1.4); });

      // destrucció del Temple (any 70)
      const g70=s.append("g");
      g70.append("line").attr("x1",x(70)).attr("y1",20).attr("x2",x(70)).attr("y2",h-22).attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","2 3");
      V.t(g70,x(70)+4,h-8,mob?"70 · Temple":"70 · Destrucció del Temple",{size:11,fill:C.ink2,halo:2});

      // separadors i capçaleres de cada un dels 5 blocs
      const gHdrs=s.selectAll("g.ghdr").data(groups).join("g").attr("class","ghdr");
      gHdrs.each(function(gr){
        const g=d3.select(this), meta=G[gr.g];
        if(gr.divY!=null){
          g.append("line").attr("x1",0).attr("y1",gr.divY).attr("x2",R).attr("y2",gr.divY).attr("stroke",C.hair).attr("stroke-width",.8);
        }
        g.append("circle").attr("cx",5).attr("cy",gr.hy-3.5).attr("r",4).attr("fill",meta.c);
        V.t(g,14,gr.hy,meta.t,{size:mob?11.5:12,weight:700,fill:C.ink,halo:3});
      });

      // files
      const rows=s.selectAll("g.trow").data(D).join("g").attr("class","trow").style("cursor","pointer");
      rows.each(function(d){
        const g=d3.select(this), c=G[d.g].c, x1=x(d.a), x2=Math.max(x(d.b),x1+6), cy=d.y;
        if(!mob) V.t(g,L-10,cy+4,d.s||d.n,{anchor:"end",size:12,fill:C.ink2,weight:d.g==="escrits"||d.g==="vida"?600:400});
        if(d.ev){
          g.append("circle").attr("cx",x1).attr("cy",cy).attr("r",4.8).attr("fill",c);
        } else {
          g.append("rect").attr("class","bar").attr("x",x1).attr("y",cy-5).attr("width",x2-x1).attr("height",10).attr("rx",5)
            .attr("fill",c).attr("fill-opacity",c===C.groc?.88:.84);
        }
        const lx=x2+6, short=mob?(d.s||d.n)+" · "+d.l:d.l;
        const anc=lx>w-72?"end":"start", tx=lx>w-72?x1-6:lx;
        V.t(g,tx,cy+4,short,{anchor:anc,size:11.5,fill:C.ink,halo:3});
      });

      const gHv=s.append("g").attr("pointer-events","none");
      const tp=V.tip(node);

      function apply(st,anim){
        state=st;
        const allow=new Set(STEP_GROUPS[st]||STEP_GROUPS.canon);
        const dur=anim&&!V.reduced?450:0;
        rows.transition().duration(dur).style("opacity",d=>allow.has(d.g)?1:.22);
        gHdrs.transition().duration(dur).style("opacity",gr=>allow.has(gr.g)?1:.42);
        gOral.transition().duration(dur).style("opacity",st==="vida"?.05:st==="oral"?1:.42);
        gOralLab.transition().duration(dur).style("opacity",st==="oral"?1:0);
        g70.transition().duration(dur).style("opacity",st==="escrits"||st==="externes"||st==="canon"?1:.15);
      }

      const off=()=>{ gHv.selectAll("*").remove(); tp.hide(); apply(state,false); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const d=d3.least(D,q=>Math.abs(py-q.y));
        if(!d||Math.abs(py-d.y)>rh*.75){ off(); return; }
        rows.style("opacity",q=>q===d?1:.18);
        const mid=d.m!=null?d.m:(d.a+d.b)/2, xm=x(mid), diff=Math.round(mid-30);
        gHv.selectAll("*").remove();
        gHv.append("line").attr("x1",xm).attr("y1",20).attr("x2",xm).attr("y2",h-22).attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-dasharray","2 2");
        const delta=diff>0?`+${diff} anys després de la creu`:diff<0?`${Math.abs(diff)} anys abans de la creu`:"Referència (≈ 30 dC)";
        V.t(gHv,xm,h-8,delta,{anchor:xm>w-110?"end":xm<110?"start":"middle",size:11.5,weight:700,fill:C.ink,halo:3.5});
        tp.show(`<b>${d.n}</b> (${d.l})<br>${d.d}<br><span style="color:${C.muted}">${delta}</span>`,clamp(px+12,10,w-240),d.y-12);
      },off);

      api={go:st=>apply(st,true)};
      apply(state,false);
      V.onView(node,instant=>{
        if(instant)return;
        rows.selectAll("rect.bar").attr("width",0).transition().delay((d,i)=>i*35).duration(700).ease(ease).attr("width",d=>Math.max(x(d.b)-x(d.a),6));
      });
    });

    const sc=$("#s-temps");
    if(sc&&window.IB&&IB.scrolly) IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(idx,el)=>{ if(api&&el&&el.dataset.s)api.go(el.dataset.s); });
  })();

  /* =====================================================================
     V2 · ORDRE DE LA BÍBLIA ↔ ORDRE D'ESCRIPTURA (IB-51 unitats que volen)
     ===================================================================== */
  (function(){
    const fig=$("#f-biblio"), el=$("#biblio"), rd=$("#biblio-r"); if(!el)return;
    const BOOKS=[
      {k:"Mt",n:"Mateu",g:"ev",w:18329,bib:1,chr:9,yr:"≈ 80–90",c:C.blau},
      {k:"Mc",n:"Marc",g:"ev",w:11085,bib:2,chr:8,yr:"≈ 65–75",c:C.vermell},
      {k:"Lc",n:"Lluc",g:"ev",w:19446,bib:3,chr:10,yr:"≈ 80–100",c:C.blauClar},
      {k:"Jn",n:"Joan",g:"ev",w:15438,bib:4,chr:11,yr:"≈ 90–110",c:C.groc},
      {k:"Rm",n:"Romans",g:"pau",w:7055,bib:5,chr:7,yr:"≈ 57",c:C.ink2},
      {k:"1Co",n:"1 Corintis",g:"pau",w:6812,bib:6,chr:3,yr:"≈ 54",c:C.ink2},
      {k:"2Co",n:"2 Corintis",g:"pau",w:4473,bib:7,chr:4,yr:"≈ 55",c:C.ink2},
      {k:"Ga",n:"Gàlates",g:"pau",w:2226,bib:8,chr:2,yr:"≈ 53",c:C.ink2},
      {k:"Fl",n:"Filipencs",g:"pau",w:1626,bib:9,chr:5,yr:"≈ 55",c:C.ink2},
      {k:"1Te",n:"1 Tessalonicencs",g:"pau",w:1473,bib:10,chr:1,yr:"≈ 50",c:C.ink2},
      {k:"Flm",n:"Filèmon",g:"pau",w:334,bib:11,chr:6,yr:"≈ 55",c:C.ink2}
    ];
    // 1 unitat = 100 paraules gregues reals
    const UNITS=[];
    BOOKS.forEach(b=>{ const n=Math.max(3,Math.round(b.w/100)); b.nU=n; for(let i=0;i<n;i++)UNITS.push({id:b.k+"-"+i,b,i}); });
    let mode="biblia", updateMode=null;
    lg($("#biblio-lg"),[{c:C.ink2,t:"Cartes de Pau (anys 50)"},{c:C.vermell,t:"Marc (1r evangeli)"},{c:C.blau,t:"Mateu i Lluc"},{c:C.groc,t:"Joan (últim)"}]);

    V.mount(el,(node,w)=>{
      const mob=w<640, r=mob?2.2:3.1, step=r*2.45, rowH=mob?30:30, top=mob?46:36, left=mob?94:140, right=mob?58:84;
      const h=top+BOOKS.length*rowH+18;
      const s=V.svg(node,w,h,"Comparació entre l'ordre dels llibres a la Bíblia i l'ordre cronològic en què es van escriure. Cada punt són 100 paraules gregues.");
      const maxCols=Math.max(20,Math.floor((w-left-right)/step));
      const tp=V.tip(node);

      const posOf=(b,i,m)=>{
        const row=(m==="biblia"?b.bib:b.chr)-1;
        const cy=top+row*rowH;
        const col=i%maxCols, sub=Math.floor(i/maxCols);
        const rowsInBook=Math.ceil(b.nU/maxCols);
        const yOff=(sub-(rowsInBook-1)/2)*(step*.85);
        return [left+col*step, cy+yOff];
      };

      const gLabels=s.append("g"), gDots=s.append("g"), gNote=s.append("g");
      const labs=gLabels.selectAll("g.blab").data(BOOKS,d=>d.k).join("g").attr("class","blab").style("cursor","pointer");
      labs.append("text").attr("x",left-10).attr("y",4).attr("text-anchor","end").attr("font-size",mob?11.5:12.5)
        .attr("font-weight",d=>d.g==="ev"?700:500).attr("fill",d=>d.k==="Mc"?C.vermell:C.ink).text(d=>d.n);
      labs.append("text").attr("class","yr").attr("x",w-4).attr("y",4).attr("text-anchor","end").attr("font-size",11)
        .attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(d=>d.yr);

      const dots=gDots.selectAll("circle").data(UNITS,d=>d.id).join("circle")
        .attr("r",r).attr("fill",d=>d.b.c).attr("fill-opacity",d=>d.b.c===C.groc?.9:.82)
        .style("cursor","pointer");

      function place(m,anim){
        mode=m;
        const dur=anim&&!V.reduced?950:0;
        labs.transition().duration(dur).ease(ease).attr("transform",d=>`translate(0,${top+((m==="biblia"?d.bib:d.chr)-1)*rowH})`);
        if(!dur){
          dots.attr("cx",d=>posOf(d.b,d.i,m)[0]).attr("cy",d=>posOf(d.b,d.i,m)[1]);
        } else {
          dots.each(function(d){
            const c=d3.select(this), x0=+c.attr("cx"), y0=+c.attr("cy"), [x1,y1]=posOf(d.b,d.i,m);
            const mx=(x0+x1)/2+(y1>y0?28:-28), my=(y0+y1)/2;
            c.transition().delay(d.i*1.8).duration(dur).ease(ease)
              .attrTween("cx",()=>t=>(1-t)*(1-t)*x0+2*(1-t)*t*mx+t*t*x1)
              .attrTween("cy",()=>t=>(1-t)*(1-t)*y0+2*(1-t)*t*my+t*t*y1);
          });
        }
        gNote.selectAll("*").remove();
        V.t(gNote,left,14,m==="biblia"?(mob?"Ordre a la Bíblia (Mateu 1r)":"Ordre tradicional a la Bíblia (Mateu primer)"):(mob?"Ordre d'escriptura (Pau abans)":"Ordre real d'escriptura (les cartes de Pau arriben 20 anys abans que els evangelis)"),
          {size:mob?11.5:12.5,weight:700,fill:m==="biblia"?C.ink2:C.vermell});
        if(rd) rd.innerHTML=m==="biblia"
          ?"<b>Ordre de la Bíblia:</b> els quatre evangelis obren el Nou Testament (Mateu primer) i les cartes de Pau venen molt després."
          :"<b>Ordre cronològic real:</b> les cartes de Pau (anys 50) són les primeres; <b>Marc</b> (~65–75) és el primer evangeli i <b>Joan</b> (~90–110) tanca el cercle.";
      }

      const off=()=>{ dots.attr("fill-opacity",d=>d.b.c===C.groc?.9:.82); labs.style("opacity",1); tp.hide(); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const row=Math.round((py-top)/rowH);
        const b=BOOKS.find(q=>(mode==="biblia"?q.bib:q.chr)-1===row);
        if(!b||Math.abs(py-(top+row*rowH))>rowH*.55){ off(); return; }
        dots.attr("fill-opacity",d=>d.b===b?1:.14);
        labs.style("opacity",d=>d===b?1:.22);
        tp.show(`<b>${b.n}</b> · ${f0(b.w)} paraules gregues<br>Data probable: <b>${b.yr}</b><br><span style="color:${C.muted}">Posició a la Bíblia: #${b.bib} · Ordre d'escriptura: #${b.chr}</span>`,clamp(px+12,10,w-240),top+row*rowH-14);
      },off);

      updateMode=m=>place(m,true);
      place(mode,false);
      V.onView(node,instant=>{
        if(instant)return;
        dots.attr("r",0).transition().delay(d=>d.i*2).duration(500).ease(d3.easeCubicOut).attr("r",r);
      });
    });
    seg(fig,k=>{ mode=k; updateMode&&updateMode(k); });
  })();

  /* =====================================================================
     V6 · UNA SETMANA QUE S'HO MENJA TOT + ON CAU CADA ESCENA
     ===================================================================== */
  (function(){
    const fig=$("#f-setmana"), el=$("#setmana"), rd=$("#setmana-r"); if(!el)return;
    let view="zoom", redraw=null;

    V.mount(el,(node,w)=>{
      const mob=w<640, tp=V.tip(node);

      function renderZoom(){
        const h=mob?290:300, M={l:mob?12:24,r:mob?12:24};
        const s=V.svg(node,w,h,"L'Evangeli de Marc (11.085 paraules): 64 % resumeix més de 30 anys de vida i Galilea; 36 % (3.968 paraules) es dedica a una sola setmana a Jerusalem.");
        const W=w-M.l-M.r, tot=E.gnt.total.Mc, gal=E.gnt.marcDies[0].w, setm=tot-gal;
        const xTop=d3.scaleLinear([0,tot],[M.l,w-M.r]);

        // barra superior: tot Marc
        const y1=40, bh=34;
        V.t(s,M.l,y1-10,"Tot l'Evangeli de Marc (11.085 paraules gregues)",{size:12.5,weight:700,fill:C.ink});
        const rGal=s.append("rect").attr("x",M.l).attr("y",y1).attr("width",xTop(gal)-M.l).attr("height",bh)
          .attr("fill",C.land).attr("stroke",C.paper).attr("stroke-width",1.5).style("cursor","pointer");
        const rSet=s.append("rect").attr("x",xTop(gal)).attr("y",y1).attr("width",xTop(tot)-xTop(gal)).attr("height",bh)
          .attr("fill",C.vermell).attr("stroke",C.paper).attr("stroke-width",1.5).style("cursor","pointer");
        V.t(s,(M.l+xTop(gal))/2,y1+21,mob?"64 % · Galilea":"64 % · Baptisme i tota l'activitat a Galilea",{anchor:"middle",size:12,fill:C.ink,weight:600});
        V.t(s,(xTop(gal)+xTop(tot))/2,y1+21,"36 % · 1 setmana",{anchor:"middle",size:12,fill:C.paper,weight:700,halo:false});

        // trapezi lupa que expandeix el 36 % a tota l'amplada
        const y2=146;
        s.append("path").attr("d",`M${xTop(gal)},${y1+bh} C${xTop(gal)},${(y1+bh+y2)/2} ${M.l},${(y1+bh+y2)/2} ${M.l},${y2} L${w-M.r},${y2} C${w-M.r},${(y1+bh+y2)/2} ${xTop(tot)},${(y1+bh+y2)/2} ${xTop(tot)},${y1+bh} Z`)
          .attr("fill",V.alpha(C.vermell,.09));

        // barra inferior: els 7 trams de l'última setmana
        V.t(s,M.l,y2-10,mob?"Última setmana a Jerusalem (3.968 par., 36 %)":"Zoom sobre l'última setmana a Jerusalem (3.968 paraules, 36 % del llibre)",{size:mob?11.5:12.5,weight:700,fill:C.vermell});
        const dies=E.gnt.marcDies.slice(1);
        const xBot=d3.scaleLinear([0,setm],[M.l,w-M.r]);
        const cols=[C.vermellClar,C.vermellClar,C.blauClar,C.ghost,C.vermell,C.vermellFosc,C.groc];
        const names=["Arribada","L'endemà (Temple)","Al matí (debats)","2 dies abans","Últim sopar i detenció","Crucifixió (24 h)","Tomba oberta"];
        let acc=0;
        const segs=dies.map((d,i)=>{ const o={...d,label:names[i],c:cols[i],x0:xBot(acc),x1:xBot(acc+d.w),pct:d.w/tot*100}; acc+=d.w; return o; });

        const rects=s.selectAll("rect.sd").data(segs).join("rect").attr("class","sd")
          .attr("x",d=>d.x0).attr("y",y2).attr("width",d=>Math.max(2,d.x1-d.x0)).attr("height",bh+6)
          .attr("fill",d=>d.c).attr("stroke",C.paper).attr("stroke-width",1.5).style("cursor","pointer");

        // etiquetes clau sota la barra expandida
        const callouts=mob?[
          {i:2,y:y2+bh+24,t:"Debats al Temple (15 %)",s:"",anc:"start",tx:M.l},
          {i:4,y:y2+bh+44,t:"Últim sopar i detenció",s:"",anc:"middle"},
          {i:5,y:y2+bh+66,t:"Crucifixió (hores comptades)",s:"",anc:"end",tx:w-M.r}
        ]:[
          {i:2,y:y2+bh+26,t:"Debats al Temple",s:"1.625 paraules (15 %)"},
          {i:4,y:y2+bh+26,t:"Últim sopar i detenció",s:"1.012 paraules"},
          {i:5,y:y2+bh+58,t:"El dia de la crucifixió",s:"669 paraules · hores comptades"}
        ];
        callouts.forEach(co=>{
          const d=segs[co.i], mx=(d.x0+d.x1)/2;
          s.append("line").attr("x1",mx).attr("y1",y2+bh+6).attr("x2",mx).attr("y2",co.y-10).attr("stroke",C.ink2).attr("stroke-width",.9);
          const anc=co.anc||(mx>w-120?"end":mx<110?"start":"middle");
          V.lines(s,co.tx!=null?co.tx:mx,co.y,[[co.t,true,C.ink],[co.s,false,C.muted]],{anchor:anc,size:11.5,halo:3});
        });

        const off=()=>{ rects.style("opacity",1); tp.hide(); };
        outside(node,off);
        V.hover(s.node(),(ev,[px,py])=>{
          if(py>=y2-6&&py<=y2+bh+14){
            const d=segs.find(q=>px>=q.x0&&px<=q.x1);
            if(!d){ off(); return; }
            rects.style("opacity",q=>q===d?1:.25);
            tp.show(`<b>${d.label}</b> (Mc ${d.ref})<br><b>${f0(d.w)}</b> paraules (${d.pct.toFixed(1).replace(".",",")} % de tot Marc)`,clamp(px,10,w-220),y2-14);
            if(rd) rd.innerHTML=`<b>${d.label} (Marc ${d.ref}):</b> ${f0(d.w)} paraules gregues (${d.pct.toFixed(1).replace(".",",")} % de tot el llibre).`;
          } else if(py>=y1-6&&py<=y1+bh+6){
            rects.style("opacity",1);
            const inSet=px>=xTop(gal);
            tp.show(inSet?`<b>Última setmana a Jerusalem</b><br>3.968 paraules (35,8 % del llibre)`:`<b>Baptisme i activitat a Galilea</b><br>7.117 paraules (64,2 % del llibre)`,clamp(px,10,w-220),y1-14);
          } else off();
        },off);

        if(rd) rd.innerHTML="<b>Lupa de Marc:</b> tot i que Jesús viu més de trenta anys, Marc concentra el <b>36 %</b> del llibre en una sola setmana i el <b>15 %</b> en les últimes 24 hores.";
        lg($("#setmana-lg"),[{c:C.land,t:"Galilea (64 %)",k:"sq"},{c:C.vermell,t:"Última setmana (36 %)",k:"sq"}]);
        void rGal; void rSet;
      }

      function renderEscenes(){
        const h=mob?330:360, M={t:36,r:mob?16:150,b:30,l:mob?54:74};
        const s=V.svg(node,w,h,"Posició de nou escenes clau dins dels quatre evangelis (en percentatge del llibre). Destaca el gest al Temple: al principi a Joan (7 %) i al final als altres tres (66–79 %).");
        const books=["Mc","Mt","Lc","Jn"];
        const y=d3.scalePoint(books,[M.t,h-M.b]).padding(.25);
        const x=d3.scaleLinear([0,1],[M.l,w-M.r]);

        // barres base dels 4 llibres
        books.forEach(b=>{
          const yy=y(b);
          s.append("line").attr("x1",x(0)).attr("y1",yy).attr("x2",x(1)).attr("y2",yy).attr("stroke",C.hair).attr("stroke-width",2);
          V.t(s,M.l-10,yy+4,NOM[b],{anchor:"end",weight:700,size:12.5,fill:b==="Jn"?C.ink:C.ink});
        });
        [0,.25,.5,.75,1].forEach(p=>V.t(s,x(p),M.t-14,p===0?"Inici":p===1?"Final":Math.round(p*100)+" %",{anchor:"middle",size:11,fill:C.muted}));

        const esc=E.gnt.escenes;
        const line=d3.line().x(d=>x(d.p)).y(d=>y(d.b)).curve(d3.curveMonotoneY);
        const paths=s.selectAll("path.es").data(esc).join("path").attr("class","es")
          .attr("d",d=>line(books.map(b=>({b,p:d.pos[b]/E.gnt.total[b]}))))
          .attr("fill","none")
          .attr("stroke",d=>d.nom==="Gest al Temple"?C.vermell:C.blau)
          .attr("stroke-width",d=>d.nom==="Gest al Temple"?2.6:1.3)
          .attr("stroke-opacity",d=>d.nom==="Gest al Temple"?1:.42)
          .style("cursor","pointer");

        const dots=s.selectAll("g.ed").data(esc).join("g").attr("class","ed");
        dots.each(function(d){
          const g=d3.select(this), isT=d.nom==="Gest al Temple";
          books.forEach(b=>{
            g.append("circle").attr("cx",x(d.pos[b]/E.gnt.total[b])).attr("cy",y(b)).attr("r",isT?4.8:3.2)
              .attr("fill",isT?C.vermell:C.blau).attr("stroke",C.paper).attr("stroke-width",1.1);
          });
          if(!mob&&(isT||d.nom==="Baptisme"||d.nom==="Pa per a cinc mil"||d.nom==="Crucifixió")){
            if(d.nom==="Baptisme"){
              const px=x(d.pos.Mc/E.gnt.total.Mc);
              V.t(g,px,y("Mc")-14,d.nom,{anchor:"start",size:11,fill:C.ink2,halo:2.5});
            } else {
              const px=x(d.pos.Jn/E.gnt.total.Jn);
              V.t(g,px,y("Jn")+18,d.nom,{anchor:isT?"start":"middle",size:11,weight:isT?700:400,fill:isT?C.vermell:C.ink2,halo:2.5});
            }
          }
        });

        if(!mob){
          const t=esc.find(d=>d.nom==="Gest al Temple");
          V.note(s,{x:x(t.pos.Jn/E.gnt.total.Jn)+6,y:y("Jn")-8,tx:x(.32),ty:y("Lc")+22,kind:"curve",bend:-12,anchor:"start",
            lines:[["Gest al Temple",true],["A Joan passa al 7 % del llibre;"],["als altres tres, a l'última setmana"]]});
        }

        const off=()=>{ paths.attr("stroke-opacity",d=>d.nom==="Gest al Temple"?1:.42).attr("stroke-width",d=>d.nom==="Gest al Temple"?2.6:1.3); dots.style("opacity",1); tp.hide(); };
        outside(node,off);
        V.hover(s.node(),(ev,[px,py])=>{
          let best=null, bd=1e9;
          esc.forEach(d=>books.forEach(b=>{ const dist=Math.hypot(px-x(d.pos[b]/E.gnt.total[b]),py-y(b)); if(dist<bd){ bd=dist; best=d; } }));
          if(!best||bd>28){ off(); return; }
          paths.attr("stroke-opacity",d=>d===best?1:.1).attr("stroke-width",d=>d===best?2.8:1.1);
          dots.style("opacity",d=>d===best?1:.15);
          const det=books.map(b=>`${NOM[b]} ${Math.round(best.pos[b]/E.gnt.total[b]*100)} % (${best.ref[b]})`).join(" · ");
          tp.show(`<b>${best.nom}</b><br>${det}`,clamp(px+12,10,w-240),clamp(py-18,10,h-60));
          if(rd) rd.innerHTML=`<b>${best.nom}:</b> ${det}`;
        },off);

        if(rd) rd.innerHTML="<b>Comparació d'escenes:</b> passa per sobre de qualsevol línia. Observa en vermell el <b>Gest al Temple</b>, situat al principi de Joan (cap. 2) i al final de Marc, Mateu i Lluc.";
        lg($("#setmana-lg"),[{c:C.vermell,t:"Gest al Temple (gran diferència)",k:"ln"},{c:C.blau,t:"Altres escenes clau",k:"ln"}]);
      }

      redraw=()=>{ node.innerHTML=""; if(view==="zoom")renderZoom(); else renderEscenes(); };
      redraw();
    });
    seg(fig,k=>{ view=k; redraw&&redraw(); });
  })();

  /* =====================================================================
     V7a · COM VIATGEN LES HISTÒRIES (IB-40 Flux amb partícules en canvas)
     ===================================================================== */
  (function(){
    const fig=$("#f-flux"), el=$("#flux"), rd=$("#flux-r"), tog=$("#flux-toggle"); if(!el)return;
    let hyp="q", paused=V.reduced, activeIdx=-1, rebuild=null;
    if(tog) tog.textContent=paused?"Reprodueix el moviment":"Atura el moviment";

    // volums reals d'Eusebi (paraules)
    const LINKS_Q=[
      {s:0,t:0,w:EUS.Mt.byC[1]+EUS.Mt.byC[2]+EUS.Mt.byC[4]+EUS.Mt.byC[6],c:C.vermell,n:"De Marc cap a Mateu",ex:"Relat base: baptisme, Galilea, passió (~9.500 paraules)"},
      {s:0,t:1,w:EUS.Lc.byC[1]+EUS.Lc.byC[2]+EUS.Lc.byC[8],c:C.vermell,n:"De Marc cap a Lluc",ex:"Relat base: Galilea, paràboles, passió (~8.260 paraules)"},
      {s:1,t:0,w:EUS.Mt.byC[5],c:C.blau,n:"De Font Q cap a Mateu",ex:"Dites de Jesús: parenostre, benaurances (~3.650 paraules)"},
      {s:1,t:1,w:EUS.Lc.byC[5],c:C.blau,n:"De Font Q cap a Lluc",ex:"Mateixes dites que Mateu, absents de Marc (~3.770 paraules)"},
      {s:2,t:0,w:EUS.Mt.uniq+EUS.Mt.byC[3]+EUS.Mt.byC[7],c:C.ghost,n:"Material propi de Mateu",ex:"Mags, fugida a Egipte, Sermó de la Muntanya (~5.150 paraules)"},
      {s:2,t:1,w:EUS.Lc.uniq+EUS.Lc.byC[3]+EUS.Lc.byC[9],c:C.ghost,n:"Material propi de Lluc",ex:"Pastors, bon samarità, fill pròdig (~7.410 paraules)"},
      {s:2,t:2,w:EUS.Jn.tot,c:C.groc,n:"Tradició pròpia de Joan",ex:"76 % exclusiu: Canà, samaritana, Llàtzer (~15.420 paraules)"}
    ];
    const LINKS_F=[
      {s:0,t:0,w:EUS.Mt.byC[1]+EUS.Mt.byC[2]+EUS.Mt.byC[4]+EUS.Mt.byC[6],c:C.vermell,n:"De Marc cap a Mateu",ex:"Mateu fa servir gairebé tot Marc (~9.500 paraules)"},
      {s:0,t:1,w:EUS.Lc.byC[1]+EUS.Lc.byC[2]+EUS.Lc.byC[8],c:C.vermell,n:"De Marc cap a Lluc",ex:"Lluc també pren l'esquelet de Marc (~8.260 paraules)"},
      {s:1,t:1,w:EUS.Lc.byC[5],c:C.blau,n:"De Mateu cap a Lluc (sense Q)",ex:"Lluc llegeix directament Mateu: parenostre, benaurances (~3.770 paraules)"},
      {s:2,t:0,w:EUS.Mt.uniq+EUS.Mt.byC[5],c:C.ghost,n:"Fonts pròpies de Mateu",ex:"Material que Mateu escriu primer (~8.130 paraules)"},
      {s:2,t:1,w:EUS.Lc.uniq+EUS.Lc.byC[3]+EUS.Lc.byC[9],c:C.ghost,n:"Material propi de Lluc",ex:"Pastors, bon samarità, fill pròdig (~7.410 paraules)"},
      {s:2,t:2,w:EUS.Jn.tot,c:C.groc,n:"Tradició pròpia de Joan",ex:"76 % exclusiu: Canà, samaritana, Llàtzer (~15.420 paraules)"}
    ];

    lg($("#flux-lg"),[{c:C.vermell,t:"De Marc (1r evangeli)"},{c:C.blau,t:"Compartit Mateu–Lluc (Q o Mateu)"},{c:C.groc,t:"Joan (camí propi)"},{c:C.ghost,t:"Fonts pròpies"}]);

    V.mount(el,(node,w)=>{
      const mob=w<640, h=mob?330:380;
      d3.select(node).selectAll("svg.ibv").remove();
      const {ctx,c}=V.canvas(node,w,h,"Diagrama de flux amb partícules mostrant com el material de Marc i d'altres fonts nodreix Mateu, Lluc i Joan.");
      const s=d3.select(node).append("svg").attr("class","ibv").attr("width",w).attr("height",h)
        .style("position","absolute").style("left",0).style("top",0).attr("aria-hidden","true");
      const tp=V.tip(node);
      const r=V.rng(40);
      let links=[], particles=[], nodesL=[], nodesR=[];

      function layout(){
        s.selectAll("*").remove();
        const raw=hyp==="q"?LINKS_Q:LINKS_F;
        const padL=mob?86:145, padR=mob?86:145, x0=padL, x1=w-padR, bw=10;
        const srcNames=hyp==="q"?["Marc (1r)","Font Q (?)","Fonts pròpies"]:["Marc (1r)","Mateu (llegit)","Fonts pròpies"];
        const dstNames=["Mateu","Lluc","Joan"];
        const srcCol=[C.vermell,C.blau,C.ink2], dstCol=[C.blau,C.blauClar,C.groc];

        // calculem altures proporcionals
        const sTot=[0,0,0], dTot=[0,0,0];
        raw.forEach(l=>{ sTot[l.s]+=l.w; dTot[l.t]+=l.w; });
        const maxSum=Math.max(d3.sum(sTot),d3.sum(dTot));
        const avail=h-60, scale=avail/maxSum;

        let y=22; nodesL=sTot.map((v,i)=>{ const bh=Math.max(18,v*scale), o={i,n:srcNames[i],y0:y,y1:y+bh,cur:y,c:srcCol[i],v}; y+=bh+18; return o; });
        y=22; nodesR=dTot.map((v,i)=>{ const bh=Math.max(18,v*scale), o={i,n:dstNames[i],y0:y,y1:y+bh,cur:y,c:dstCol[i],v}; y+=bh+18; return o; });

        links=raw.map((l,idx)=>{
          const th=Math.max(4,l.w*scale);
          const sy0=nodesL[l.s].cur, sy1=sy0+th; nodesL[l.s].cur=sy1;
          const ty0=nodesR[l.t].cur, ty1=ty0+th; nodesR[l.t].cur=ty1;
          const mx=(x0+x1)/2;
          const pathD=`M${x0+bw},${sy0} C${mx},${sy0} ${mx},${ty0} ${x1-bw},${ty0} L${x1-bw},${ty1} C${mx},${ty1} ${mx},${sy1} ${x0+bw},${sy1} Z`;
          return {...l,idx,th,x0:x0+bw,x1:x1-bw,sy0,sy1,ty0,ty1,pathD};
        });

        // dibuixem cintes en SVG per hover precís
        const gRib=s.append("g");
        gRib.selectAll("path.fl").data(links).join("path").attr("class","fl")
          .attr("d",d=>d.pathD).attr("fill",d=>V.alpha(d.c,d.c===C.groc?.32:.18))
          .attr("stroke",d=>d.c===C.groc?"none":V.alpha(d.c,.3)).attr("stroke-width",.6).style("cursor","pointer");

        // nodes esquerra i dreta
        nodesL.forEach(n=>{
          s.append("rect").attr("x",x0).attr("y",n.y0).attr("width",bw).attr("height",n.y1-n.y0).attr("fill",n.c).attr("rx",2);
          V.t(s,x0-8,(n.y0+n.y1)/2+4,n.n,{anchor:"end",weight:700,size:mob?11.5:13,fill:C.ink});
        });
        nodesR.forEach(n=>{
          s.append("rect").attr("x",x1-bw).attr("y",n.y0).attr("width",bw).attr("height",n.y1-n.y0).attr("fill",n.c).attr("rx",2);
          V.t(s,x1+8,(n.y0+n.y1)/2+4,n.n,{anchor:"start",weight:700,size:mob?11.5:13,fill:C.ink});
        });

        // partícules per a cada flux
        particles=[];
        links.forEach(l=>{
          const nP=Math.max(8,Math.min(48,Math.round(l.w/450)));
          for(let k=0;k<nP;k++) particles.push({l,t:r(),v:.14+r()*.09,off:.1+r()*.8});
        });

        if(rd) rd.innerHTML=hyp==="q"
          ?"<b>Hipòtesi 1 (Marc + Font Q):</b> Mateu i Lluc treballen per separat, però tots dos tenen Marc i una col·lecció perduda de dites (Q) damunt la taula."
          :"<b>Hipòtesi 2 (Sense Q):</b> no cal imaginar cap document perdut; Lluc simplement va llegir tant Marc com Mateu abans d'escriure el seu evangeli.";
      }

      function drawParticles(dt){
        ctx.clearRect(0,0,w,h);
        const stepT=paused?0:Math.min(.05,dt);
        for(const p of particles){
          p.t=(p.t+p.v*stepT)%1;
          const l=p.l, u=p.t, iu=1-u;
          const sy=l.sy0+(l.sy1-l.sy0)*p.off, ty=l.ty0+(l.ty1-l.ty0)*p.off;
          const mx=(l.x0+l.x1)/2;
          // Bézier cúbica exacta
          const px=iu*iu*iu*l.x0+3*iu*iu*u*mx+3*iu*u*u*mx+u*u*u*l.x1;
          const py=iu*iu*iu*sy+3*iu*iu*u*sy+3*iu*u*u*ty+u*u*u*ty;
          const dim=activeIdx>=0&&l.idx!==activeIdx;
          ctx.fillStyle=V.alpha(l.c,dim?.1:(l.c===C.groc?.95:.85));
          ctx.beginPath(); ctx.arc(px,py,dim?1.5:2.2,0,Math.PI*2); ctx.fill();
        }
      }

      const off=()=>{ activeIdx=-1; s.selectAll("path.fl").attr("fill-opacity",1); tp.hide(); drawParticles(0); };
      outside(node,off);
      V.hover(s.node(),(ev,[px,py])=>{
        const hit=ev.target&&ev.target.__data__;
        if(!hit||hit.idx==null){ off(); return; }
        activeIdx=hit.idx;
        s.selectAll("path.fl").attr("fill-opacity",d=>d.idx===activeIdx?1:.18);
        tp.show(`<b>${hit.n}</b><br>${hit.ex}`,clamp(px+12,10,w-250),clamp(py-18,10,h-60));
        if(rd) rd.innerHTML=`<b>${hit.n}:</b> ${hit.ex}.`;
      },off);

      rebuild=layout;
      layout();
      drawParticles(0);
      V.loop(node,(t,dt)=>drawParticles(dt));
      void c;
    });

    seg(fig,k=>{ hyp=k; rebuild&&rebuild(); });
    if(tog) tog.addEventListener("click",()=>{ paused=!paused; tog.textContent=paused?"Reprodueix el moviment":"Atura el moviment"; });
  })();

  /* =====================================================================
     V7b · QUÈ COMPARTIEN ELS QUATRE EVANGELIS? (IB-46 Diagrama de corda)
     ===================================================================== */
  (function(){
    const el=$("#corda"), rd=$("#corda-r"); if(!el)return;
    const ORD=["Mc","Mt","Lc","Jn"];
    // matriu simètrica de material compartit entre parells (repartint els cànons de 3 o 4 entre les seves parelles)
    // + diagonal = material EXCLUSIU (cànon X) representat com un bucle/arc propi!
    // Per a IB-46 neta: 4 grups (Mc, Mt, Lc, Jn), on la matriu té els fluxos compartits reals (en paraules) i la diagonal és 0,
    // mentre que el % exclusiu es dibuixa com un arc exterior discontinu o etiqueta clara sobre cada evangeli!
    const MAT=ORD.map(()=>ORD.map(()=>0));
    const pairs={
      1:[["Mc","Mt"],["Mc","Lc"],["Mc","Jn"],["Mt","Lc"],["Mt","Jn"],["Lc","Jn"]],
      2:[["Mc","Mt"],["Mc","Lc"],["Mt","Lc"]],
      3:[["Mt","Lc"],["Mt","Jn"],["Lc","Jn"]],
      4:[["Mc","Mt"],["Mc","Jn"],["Mt","Jn"]],
      5:[["Mt","Lc"]],
      6:[["Mc","Mt"]],
      7:[["Mt","Jn"]],
      8:[["Mc","Lc"]],
      9:[["Lc","Jn"]]
    };
    ORD.forEach(b=>{
      Object.entries(EUS[b].byC).forEach(([c,w])=>{
        const ps=pairs[+c]; if(!ps)return;
        const rel=ps.filter(p=>p[0]===b||p[1]===b);
        rel.forEach(p=>{
          const other=p[0]===b?p[1]:p[0];
          MAT[ORD.indexOf(b)][ORD.indexOf(other)]+=Math.round(w/rel.length);
        });
      });
    });
    const EX={
      "Mc-Mt":"Relat base compartit: baptisme, miracles de Galilea, passió",
      "Mc-Lc":"Relat de Marc aprofitat per Lluc (~8.260 paraules en total)",
      "Mt-Lc":"Dites de Jesús sense Marc (Font Q): parenostre, benaurances",
      "Mc-Jn":"Només grans fites comunes: pa per a cinc mil, passió i tomba",
      "Mt-Jn":"Passió i pocs episodis paral·lels",
      "Lc-Jn":"Passió i alguns relats d'aparicions"
    };
    const keyP=(a,b)=>[a,b].sort((p,q)=>ORD.indexOf(p)-ORD.indexOf(q)).join("-");
    lg($("#corda-lg"),ORD.map(b=>({c:COL[b],t:`${NOM[b]} (${Math.round(EUS[b].uniqPct)} % exclusiu)`})));

    V.mount(el,(node,w)=>{
      const mob=w<640, S=Math.min(w,mob?320:520), h=S+(mob?32:20), cx=w/2, cy=h/2;
      const Ro=mob?Math.min(w*.26,92):S/2-74, Ri=Ro-(mob?11:16);
      const s=V.svg(node,w,h,"Diagrama de corda de les taules d'Eusebi: les cintes uneixen el material compartit entre Marc, Mateu, Lluc i Joan. Marc comparteix el 94 %; Joan té un 76 % de material exclusiu.");
      const g=s.append("g").attr("transform",`translate(${cx},${cy})`);
      const ch=d3.chord().padAngle(.07).sortSubgroups(d3.descending)(MAT);
      const arc=d3.arc().innerRadius(Ri).outerRadius(Ro);
      const rib=d3.ribbon().radius(Ri-2);
      const tp=V.tip(node);

      const ribs=g.append("g").selectAll("path").data(ch).join("path").attr("d",rib)
        .attr("fill",d=>V.alpha(COL[ORD[d.source.index]],COL[ORD[d.source.index]]===C.groc?.65:.38))
        .attr("stroke",d=>COL[ORD[d.source.index]]===C.groc?"none":V.alpha(COL[ORD[d.source.index]],.75))
        .attr("stroke-width",.6).style("cursor","pointer");

      const arcs=g.append("g").selectAll("path").data(ch.groups).join("path").attr("d",arc)
        .attr("fill",d=>COL[ORD[d.index]]).style("cursor","pointer");

      // etiquetes exteriors amb % compartit vs exclusiu
      ch.groups.forEach(gr=>{
        const b=ORD[gr.index], a=(gr.startAngle+gr.endAngle)/2, rr=Ro+(mob?10:18);
        const x=Math.sin(a)*rr, y=-Math.cos(a)*rr, sn=Math.sin(a), cs=Math.cos(a);
        const anc=sn>.25?"start":sn<-.25?"end":"middle", dy=cs>.6?-12:cs<-.6?12:-2;
        const sub=mob?`${Math.round(EUS[b].uniqPct)} % propi`:`${Math.round(EUS[b].sharedPct)} % compartit · ${Math.round(EUS[b].uniqPct)} % propi`;
        V.t(g,x,y+dy,NOM[b],{anchor:anc,weight:700,size:mob?12:13,fill:C.ink,halo:3});
        V.t(g,x,y+dy+14,sub,{anchor:anc,size:11,fill:C.ink2,halo:3});
      });

      V.onView(node,instant=>{
        if(instant)return;
        arcs.transition().duration(850).ease(ease).attrTween("d",d=>{ const i=d3.interpolate(d.startAngle,d.endAngle); return t=>arc({startAngle:d.startAngle,endAngle:i(t),innerRadius:Ri,outerRadius:Ro}); });
        ribs.attr("opacity",0).transition().delay((d,i)=>400+i*55).duration(850).ease(ease).attr("opacity",1);
      });

      const reset=()=>{ ribs.attr("opacity",1); arcs.attr("opacity",1).attr("stroke",null); tp.hide(); };
      outside(node,reset);
      V.hover(s.node(),(ev,[px,py])=>{
        const t=ev.target, d=t&&t.__data__;
        if(!d){ reset(); return; }
        if(d.source){
          const a=ORD[d.source.index], b=ORD[d.target.index], k=keyP(a,b);
          ribs.attr("opacity",q=>q===d?1:.08);
          arcs.attr("opacity",q=>q.index===d.source.index||q.index===d.target.index?1:.25);
          tp.show(`<b>${NOM[a]} ↔ ${NOM[b]}</b><br>${EX[k]||"Material paral·lel a les taules d'Eusebi"}`,clamp(px+12,10,w-240),clamp(py-18,10,h-60));
          if(rd) rd.innerHTML=`<b>${NOM[a]} i ${NOM[b]}:</b> ${EX[k]}.`;
        } else if(d.index!=null){
          const b=ORD[d.index];
          ribs.attr("opacity",q=>q.source.index===d.index||q.target.index===d.index?1:.08);
          arcs.attr("opacity",q=>q.index===d.index?1:.25).attr("stroke",q=>q.index===d.index?C.ink:null).attr("stroke-width",1.5);
          tp.show(`<b>${NOM[b]}</b> (${f0(EUS[b].tot)} paraules)<br><b>${Math.round(EUS[b].sharedPct)} %</b> compartit · <b>${Math.round(EUS[b].uniqPct)} %</b> exclusiu`,clamp(px+12,10,w-240),clamp(py-18,10,h-60));
          if(rd) rd.innerHTML=`<b>${NOM[b]}:</b> ${Math.round(EUS[b].sharedPct)} % del text té paral·lel en un altre evangeli; el ${Math.round(EUS[b].uniqPct)} % és exclusiu.`;
        }
      },reset);

      if(rd) rd.innerHTML="<b>El contrast clau:</b> gairebé tot <b>Marc</b> (94 %) es repeteix en altres evangelis, mentre que tres quartes parts de <b>Joan</b> (76 %) són completament úniques.";
    });
  })();

  /* =====================================================================
     V8 · QUATRE RETRATS D'UN MATEIX HOME (IB-45 Flors de dades)
     ===================================================================== */
  (function(){
    const el=$("#flors"), rd=$("#flors-r"); if(!el)return;
    const P=[
      {k:"words",t:"Extensió",u:"par.",max:19446,c:C.blau,fmt:v=>f0(v)+" par."},
      {k:"parab",t:"Paràboles",u:"",max:18,c:C.blau,fmt:v=>v+" vegades"},
      {k:"passio",t:"Última setmana",u:"%",max:41,c:C.vermell,fmt:v=>v.toFixed(0)+" %"},
      {k:"jer",t:"Jerusalem",u:"",max:31,c:C.vermell,fmt:v=>v+" mencions"},
      {k:"uniq",t:"Material exclusiu",u:"%",max:76,c:C.groc,fmt:v=>v.toFixed(0)+" %"},
      {k:"creure",t:"«Creure»",u:"",max:98,c:C.groc,fmt:v=>v+" vegades"}
    ];
    const DATA=["Mc","Mt","Lc","Jn"].map(b=>({
      b, n:NOM[b],
      words:E.gnt.total[b],
      parab:E.gnt.mots.find(m=>m.g==="παραβολή").pos[b].length,
      passio:E.gnt.passio[b]/E.gnt.total[b]*100,
      jer:E.llocs.find(l=>l.nom==="Jerusalem").n[b],
      uniq:EUS[b].uniqPct,
      creure:E.gnt.mots.find(m=>m.g==="πιστεύω").pos[b].length
    }));
    const petal=L=>{ const w=L*.38; return `M0,0C${w.toFixed(2)},${(-L*.3).toFixed(2)} ${(w*.85).toFixed(2)},${(-L*.82).toFixed(2)} 0,${(-L).toFixed(2)}C${(-w*.85).toFixed(2)},${(-L*.82).toFixed(2)} ${(-w).toFixed(2)},${(-L*.3).toFixed(2)} 0,0Z`; };
    const FILL=c=>V.alpha(c,c===C.groc?.74:.52), EDGE=c=>c===C.groc?"none":c;

    // clau visual de la flor dins de la llegenda (estil IB-45)
    (function(){
      const lgEl=$("#flors-lg"); if(!lgEl)return;
      lgEl.innerHTML="";
      const wrap=d3.select(lgEl).append("div").attr("class","ibv-lg");
      wrap.append("div").attr("class","ibv-lg-t").text("Clau dels sis pètals (cercle discontinu = màxim)");
      const W=236, H=114, cx=118, cy=58, Rk=32;
      const ks=wrap.append("svg").attr("width",W).attr("height",H).style("overflow","visible");
      ks.append("circle").attr("cx",cx).attr("cy",cy).attr("r",Rk).attr("fill","none").attr("stroke",C.hair).attr("stroke-dasharray","2 3");
      P.forEach((p,j)=>{
        const a=j*Math.PI/3, L=Rk*.85;
        ks.append("path").attr("transform",`translate(${cx},${cy}) rotate(${j*60})`).attr("d",petal(L))
          .attr("fill",FILL(p.c)).attr("stroke",EDGE(p.c)).attr("stroke-width",.8);
        const rr=Rk+8, x=cx+Math.sin(a)*rr, y=cy-Math.cos(a)*rr, sn=Math.sin(a), cs=Math.cos(a);
        ks.append("text").attr("x",x).attr("y",y+(cs>.5?-2:cs<-.5?9:4)).attr("text-anchor",sn>.25?"start":sn<-.25?"end":"middle")
          .attr("font-size",11).attr("fill",C.ink2).text(p.t);
      });
      ks.append("circle").attr("cx",cx).attr("cy",cy).attr("r",2).attr("fill",C.ink);
    })();

    V.mount(el,(node,w)=>{
      const mob=w<680, cols=mob?2:4, cell=w/cols, R=Math.min(cell*(mob?.35:.34),84);
      const rowH=2*R+(mob?66:72), rows=Math.ceil(4/cols), h=rows*rowH+16;
      const s=V.svg(node,w,h,"Quatre flors de dades: Marc, Mateu, Lluc i Joan. Cada flor té sis pètals amb dades reals verificades del text grec.");
      const tp=V.tip(node);
      const Lsc=p=>d3.scaleSqrt([0,p.max],[0,R]);
      const pos=i=>[(i%cols+.5)*cell, Math.floor(i/cols)*rowH+R+22];

      const fls=s.selectAll("g.fl").data(DATA).join("g").attr("class","fl")
        .attr("transform",(d,i)=>`translate(${pos(i)})`).style("cursor","pointer");

      // cercle guia del màxim (100 %) i cercle mitjà
      fls.append("circle").attr("r",R).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
      fls.append("circle").attr("r",R*.5).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.6);

      // pètals
      const pts=fls.selectAll("path.pt").data(d=>P.map((p,j)=>({p,j,val:d[p.k],b:d.b,n:d.n}))).join("path").attr("class","pt")
        .attr("transform",q=>`rotate(${q.j*60})`)
        .attr("d",q=>petal(Math.max(q.val>0?6:0,Lsc(q.p)(q.val))))
        .attr("fill",q=>FILL(q.p.c)).attr("stroke",q=>EDGE(q.p.c)).attr("stroke-width",.9).attr("stroke-linejoin","round");

      fls.append("circle").attr("r",2.5).attr("fill",C.ink);

      // nom de cada evangeli net a sota de la flor (zero solapaments)
      const SUB={Mc:"94 % compartit · 11.085 par.",Mt:"76 % compartit · 18.329 par.",Lc:"31× Jerusalem · 19.446 par.",Jn:"76 % exclusiu · 0 paràboles"};
      fls.each(function(d){
        const g=d3.select(this);
        V.t(g,0,R+22,d.n,{anchor:"middle",weight:700,size:mob?15:17,serif:true,fill:C.ink});
        V.t(g,0,R+38,SUB[d.b],{anchor:"middle",size:11,fill:C.muted});
      });

      const hvG=fls.append("g").attr("class","hvg").attr("pointer-events","none");

      V.onView(node,instant=>{
        if(instant)return;
        pts.attr("transform",q=>`rotate(${q.j*60-55}) scale(0.01)`)
          .transition().delay((q,i)=>i*45).duration(900).ease(d3.easeCubicOut)
          .attr("transform",q=>`rotate(${q.j*60}) scale(1)`);
      });

      // hover sincronitzat: passar per un pètal il·lumina el mateix tret a les 4 flors!
      function reset(){
        pts.attr("fill",q=>FILL(q.p.c)).attr("stroke",q=>EDGE(q.p.c)).attr("stroke-width",.9).style("opacity",1);
        hvG.selectAll("*").remove(); tp.hide();
      }
      outside(node,reset);
      V.hover(s.node(),(ev,[px,py])=>{
        const idx=d3.leastIndex(DATA,(d,i)=>{ const q=pos(i); return Math.hypot(px-q[0],py-q[1]); });
        if(idx<0){ reset(); return; }
        const c=pos(idx); if(Math.hypot(px-c[0],py-c[1])>R+28){ reset(); return; }
        let a=Math.atan2(px-c[0],-(py-c[1])); if(a<0)a+=2*Math.PI;
        const j=Math.round(a/(Math.PI/3))%6, tr=P[j], d=DATA[idx];
        pts.style("opacity",q=>q.j===j?1:.18)
          .attr("stroke",q=>q.j===j?C.ink:EDGE(q.p.c))
          .attr("stroke-width",q=>q.j===j?1.6:.9);
        hvG.selectAll("*").remove();
        fls.each(function(fd){
          const g=d3.select(this).select("g.hvg"), val=fd[tr.k], len=Lsc(tr)(val);
          const ang=j*Math.PI/3, rx=Math.sin(ang)*(len+10), ry=-Math.cos(ang)*(len+10);
          V.t(g,rx,ry+4,tr.fmt(val),{anchor:Math.sin(ang)>.2?"start":Math.sin(ang)<-.2?"end":"middle",weight:700,size:11.5,fill:C.ink,halo:3.5});
        });
        const comp=DATA.map(q=>`${q.n}: <b>${tr.fmt(q[tr.k])}</b>`).join(" · ");
        tp.show(`<b>${tr.t}</b> (${d.n}: ${tr.fmt(d[tr.k])})<br>${comp}`,clamp(px+12,10,w-250),clamp(py-18,10,h-60));
        if(rd) rd.innerHTML=`<b>${tr.t} als quatre evangelis:</b> ${comp}.`;
      },reset);

      if(rd) rd.innerHTML="<b>Passa per qualsevol pètal:</b> s'il·luminarà el mateix tret als quatre evangelis alhora. Observa com <b>Joan</b> dispara l'exclusivitat (76 %) i «creure» (98), però té 0 paràboles.";
    });
  })();
})();
