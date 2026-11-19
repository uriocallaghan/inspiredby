/* «Qui era realment Jesús?» · visualitzacions orgàniques (sistema infogràfic IBV)
   V1 (#viz-noms):    IB-41 Constel·lació de cercles d'aquarel·la (onomàstica jueva, Tal Ilan / Bauckham).
   V2 (#viz-escala):  IB-35 Escala comparativa logarítmica amb arcs de proporció (Natzaret → Roma).
   V3 (#viz-cos):     IB-38/IB-10 Bioarqueologia d'alçada real (Judea s. I) + comparador de trets.
   V4 (#s-cares):     Scrollytelling 1 · IB-25 Mapa Equal Earth + cinta cronològica (24 fites, 200–2001).
   V5 (#viz-enquesta):IB-42/IB-10 Dades empíriques YouGov (2020–2021) i estudi PLOS ONE (2018).
   V6 (#s-mirall):    Scrollytelling 2 · IB-55 Mapa conceptual sobre eixos («El pou de Tyrrell»).
   V7 (#viz-sorpreses):Taula interactiva filtrable de 12 contrastos verificats. */
(function(){
  if(!window.d3||!window.IBV||!window.JH)return;
  const V=IBV, C=V.C, D=window.JH;
  const f0=V.fmt(",.0f"), f1=V.fmt(",.1f"), f2=V.fmt(",.2f");
  const $=s=>document.querySelector(s);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=d3.easeCubicInOut;
  const dur=ms=>V.reduced?0:ms;

  const OUTS=new Map();
  document.addEventListener("pointerdown",ev=>{
    OUTS.forEach((fn,n)=>{ if(n.isConnected&&!n.contains(ev.target))fn(); });
  },true);
  const outside=(node,fn)=>OUTS.set(node,fn);

  function seg(fig,cb){
    const bs=[...fig.querySelectorAll(".seg button")];
    bs.forEach(b=>b.addEventListener("click",()=>{
      bs.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
      cb(b.dataset.k);
    }));
  }
  function lg(el,items){
    if(!el)return;
    el.innerHTML=items.map(i=>`<span class="lgi"><i class="${i.k||""}" style="${i.k==="ln"||i.k==="da"||i.k==="ho"?"border-color":"background"}:${i.c}"></i>${i.t}</span>`).join("");
  }
  function addWashGrad(defs,id,col,a0,a1){
    const rg=defs.append("radialGradient").attr("id",id).attr("cx","42%").attr("cy","38%").attr("r","64%");
    rg.append("stop").attr("offset",0).attr("stop-color",col).attr("stop-opacity",a0==null?.42:a0);
    rg.append("stop").attr("offset",.78).attr("stop-color",col).attr("stop-opacity",a1==null?.24:a1);
    rg.append("stop").attr("offset",1).attr("stop-color",col).attr("stop-opacity",.06);
    return `url(#${id})`;
  }

  /* =====================================================================
     V1 · IB-41 CONSTEL·LACIÓ DE CERCLES D'AQUAREL·LA (#viz-noms)
     Onomàstica jueva de Palestina (330 aC – 200 dC): Tal Ilan / Bauckham
     ===================================================================== */
  (function(){
    const fig=$("#f-noms"), el=$("#viz-noms"), rd=$("#noms-r");
    if(!el)return;
    let mode="homes";
    lg($("#noms-lg"),[
      {c:C.vermell,t:"Noms del cercle familiar o íntim de Jesús"},
      {c:C.blau,t:"Altres noms molt freqüents a Judea"},
      {c:C.muted,t:"Àrea proporcional als registres",k:"ho"}
    ]);

    const M=V.mount(el,(node,w)=>{
      const mob=w<640, h=mob?420:390;
      const ds=D.noms[mode];
      const items=ds.items.map(d=>({...d, pct:d.n/ds.total*100}));
      const s=V.svg(node,w,h,`Constel·lació dels noms jueus més comuns a Palestina del 330 aC al 200 dC (${mode==="homes"?"2.625 registres masculins, amb Jesús en sisena posició":"328 registres femenins, amb Maria en primera posició"}).`);
      const defs=s.append("defs");
      const uid="nm"+Math.random().toString(36).slice(2,6);
      const gWRed=addWashGrad(defs,uid+"r",C.vermell,.42,.22);
      const gWStar=addWashGrad(defs,uid+"s",C.vermell,.56,.34);
      const gWBlu=addWashGrad(defs,uid+"b",C.blau,.34,.16);

      // reservem un marge lliure a l'esquerra/dreta a escriptori perquè l'anotació no trepitgi mai cap cercle
      const padL=mob?10:150, padR=mob?10:150, padY=16;
      const root=d3.pack().size([Math.max(240,w-padL-padR), h-padY*2]).padding(mob?7:11)(
        d3.hierarchy({children:items}).sum(d=>d.n||0).sort((a,b)=>b.value-a.value)
      );
      const nodes=root.leaves();
      const g=s.append("g").attr("transform",`translate(${padL},${padY})`);

      const cell=g.selectAll("g.nm").data(nodes).join("g").attr("class","nm")
        .attr("transform",d=>`translate(${d.x},${d.y})`)
        .attr("tabindex","0")
        .attr("role","button")
        .attr("aria-label",d=>`${d.data.nom}, posició ${d.data.r}, ${d.data.n} registres, ${f1(d.data.pct)} per cent`)
        .style("cursor","pointer");

      cell.append("circle").attr("class","wash").attr("r",d=>d.r)
        .attr("fill",d=>d.data.star?gWStar:d.data.cercle?gWRed:gWBlu)
        .style("mix-blend-mode","multiply");

      cell.append("circle").attr("class","rim").attr("r",d=>d.r)
        .attr("fill","none")
        .attr("stroke",d=>d.data.star?C.vermell:d.data.cercle?V.alpha(C.vermell,.35):V.alpha(C.blau,.28))
        .attr("stroke-width",d=>d.data.star?1.6:.75);

      cell.each(function(d){
        const q=d3.select(this), r=d.r;
        const pctStr=f1(d.data.pct)+" %";
        if(r>=(mob?34:40)){
          V.t(q,0,-4,d.data.nom,{anchor:"middle",weight:700,size:d.data.star?(mob?13:15):(mob?12:13.5),fill:C.ink,halo:3});
          V.t(q,0,12,`${pctStr} (${d.data.n})`,{anchor:"middle",size:mob?11:11.5,fill:C.ink2,halo:2.5});
        } else if(r>=24){
          V.t(q,0,-1,d.data.nom,{anchor:"middle",weight:700,size:11.5,fill:C.ink,halo:3});
          V.t(q,0,12,pctStr,{anchor:"middle",size:11,fill:C.ink2,halo:2.5});
        } else {
          V.t(q,0,4,d.data.nom,{anchor:"middle",weight:600,size:11,fill:C.ink,halo:3});
        }
      });

      // anotació directa dins del marge blanc lateral (zero solapaments amb cap altre cercle)
      const star=nodes.find(n=>n.data.star);
      if(star&&!mob){
        const packW=Math.max(240,w-padL-padR);
        const goLeft=star.x<packW*.5;
        const gx=star.x+padL, gy=star.y+padY;
        const ax=goLeft?gx-star.r*.78:gx+star.r*.78;
        const ay=gy-star.r*.38;
        const tx=goLeft?Math.max(138, gx-star.r-34):Math.min(w-138, gx+star.r+34);
        const ty=clamp(gy-star.r*.42, 34, h-46);
        V.note(s,{
          x:ax, y:ay, tx, ty, kind:"elbow", dot:true,
          anchor:goLeft?"end":"start",
          lines:mode==="homes"
            ? [["#6 · Jesús (Yešūaʿ)",true],["99 registres · 3,8 % dels homes"]]
            : [["#1 · Maria (Mariam)",true],["70 registres · 21,3 % de les dones"]]
        });
      }

      const defText=mode==="homes"
        ? "<b>Homes (2.625 registres):</b> els sis primers noms concentren el <b>38,6 %</b> de tots els homes jueus documentats. Passa el cursor o toca qualsevol cercle."
        : "<b>Dones (328 registres):</b> només <b>Maria</b> i <b>Salomé</b> representen el <b>39,0 %</b> de totes les dones jueves registrades a l'època.";
      if(rd)rd.innerHTML=defText;

      const reset=()=>{
        cell.interrupt().transition().duration(dur(150)).style("opacity",1);
        cell.select(".rim").attr("stroke-width",d=>d.data.star?1.6:.75)
          .attr("stroke",d=>d.data.star?C.vermell:d.data.cercle?V.alpha(C.vermell,.35):V.alpha(C.blau,.28));
        if(rd)rd.innerHTML=defText;
      };
      const show=(target,d)=>{
        cell.interrupt().transition().duration(dur(140)).style("opacity",o=>o===d?1:.48);
        d3.select(target).raise().select(".rim").attr("stroke",C.ink).attr("stroke-width",1.6);
        if(rd)rd.innerHTML=`<b>#${d.data.r} · ${d.data.nom}</b> (<i>${d.data.orig}</i>): <b>${d.data.n}</b> registres de ${f0(ds.total)} (<b>${f1(d.data.pct)} %</b>). ${d.data.det}`;
      };
      outside(node,reset);
      cell.on("pointerenter pointerdown",(ev,d)=>show(ev.currentTarget,d))
          .on("focus",(ev,d)=>show(ev.currentTarget,d))
          .on("blur",reset)
          .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });

      V.onView(node,instant=>{
        if(instant)return;
        cell.attr("transform",d=>`translate(${d.x},${d.y}) scale(0.35)`).style("opacity",0)
          .transition().delay((d,i)=>i*45).duration(750).ease(ease)
          .attr("transform",d=>`translate(${d.x},${d.y}) scale(1)`).style("opacity",1);
      });
    });

    seg(fig,k=>{ mode=k; el.__seen=true; M.redraw(); });
  })();

  /* =====================================================================
     V2 · IB-35 ESCALA COMPARATIVA LOGARÍTMICA (#viz-escala)
     De Natzaret (~350 hab.) a Roma imperial (~900.000 hab.)
     Totes les etiquetes a sota de l'eix en 2 carrils; la part superior és 100 % neta per a l'arc.
     ===================================================================== */
  (function(){
    const el=$("#viz-escala"), rd=$("#escala-r");
    if(!el)return;
    let anchorId="natzaret";
    lg($("#escala-lg"),[
      {c:C.vermell,t:"Galilea (el món quotidià)"},
      {c:C.blau,t:"Jerusalem (el Temple)"},
      {c:C.groc,t:"Roma (el poder imperial)"}
    ]);
    const colOf=g=>g==="galilea"?C.vermell:g==="judea"?C.blau:C.groc;

    V.mount(el,(node,w)=>{
      const mob=w<640, h=mob?295:280, m={t:92, r:mob?26:46, b:108, l:mob?26:46};
      const s=V.svg(node,w,h,"Escala logarítmica de població del segle I: des dels ~350 habitants de Natzaret fins als ~900.000 de Roma imperial, amb rangs d'estimació arqueològica.");
      const defs=s.append("defs");
      const uid="sc"+Math.random().toString(36).slice(2,6);
      const washes={
        galilea:addWashGrad(defs,uid+"g",C.vermell,.42,.20),
        judea:addWashGrad(defs,uid+"j",C.blau,.38,.18),
        imperi:addWashGrad(defs,uid+"i",C.groc,.55,.28)
      };

      const x=d3.scaleLog().domain([150, 1400000]).range([m.l, w-m.r]);
      const r=d3.scaleSqrt().domain([300, 900000]).range([mob?8:10, mob?28:38]);
      const cy=m.t+26;

      // eix base i marques d'ordre de magnitud (escala logarítmica anunciada — P5)
      const gAx=s.append("g");
      gAx.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",cy).attr("y2",cy).attr("stroke",C.hair).attr("stroke-width",1);
      [200,1000,10000,100000,1000000].forEach(t=>{
        const tx=x(t);
        gAx.append("line").attr("x1",tx).attr("x2",tx).attr("y1",cy-4).attr("y2",cy+4).attr("stroke",C.muted).attr("stroke-width",.8);
        const lbl=t>=1000000?"1 M":t>=1000?(t/1000)+"k":String(t);
        V.t(gAx,tx,cy+17,lbl,{anchor:"middle",size:11,fill:C.muted});
      });
      V.t(gAx,m.l,h-10,mob?"Escala log. (×10) · Toca per fixar l'àncora":"Escala logarítmica (cada marca multiplica per 10) · Clica una ciutat per fixar l'àncora",{size:11,fill:C.muted,italic:true});

      const gArc=s.append("g"), gRange=s.append("g"), gNodes=s.append("g");

      D.ciutats.forEach(d=>{
        gRange.append("line").datum(d).attr("class","rng-bar")
          .attr("x1",x(d.lo)).attr("x2",x(d.hi)).attr("y1",cy).attr("y2",cy)
          .attr("stroke",colOf(d.g)).attr("stroke-width",3.2).attr("stroke-opacity",.35).attr("stroke-linecap","round");
      });

      const nds=gNodes.selectAll("g.ct").data(D.ciutats).join("g").attr("class","ct")
        .attr("transform",d=>`translate(${x(d.v)},${cy})`)
        .attr("tabindex","0")
        .attr("role","button")
        .attr("aria-label",d=>`${d.nom}, estimació central ${f0(d.v)} habitants, rang de ${f0(d.lo)} a ${f0(d.hi)}`)
        .style("cursor","pointer");

      nds.append("circle").attr("class","wsh").attr("r",d=>r(d.v))
        .attr("fill",d=>washes[d.g]).style("mix-blend-mode","multiply");
      nds.append("circle").attr("class","dot").attr("r",3.2).attr("fill",d=>d.g==="imperi"?C.ink:colOf(d.g));
      nds.append("circle").attr("class","ring").attr("r",d=>r(d.v))
        .attr("fill","none").attr("stroke",d=>d.id===anchorId?C.ink:"transparent").attr("stroke-width",1.5).attr("stroke-dasharray","3 2.5");

      // Totes les etiquetes sota l'eix en 2 carrils ordenats amb guies ultra-fines (zero encreuament amb l'arc superior!)
      const labCfg={
        natzaret:{dy:42,anc:"start",dx:-4,mob:true},
        cafarnaum:{dy:74,anc:"middle",dx:0,mob:true},
        tiberiades:{dy:42,anc:"end",dx:-6,mob:false},
        seforis:{dy:74,anc:"start",dx:4,mob:true},
        jerusalem:{dy:42,anc:"middle",dx:0,mob:true},
        pasqua:{dy:74,anc:"middle",dx:0,mob:false},
        roma:{dy:42,anc:"end",dx:4,mob:true}
      };
      nds.each(function(d){
        const q=d3.select(this), o=labCfg[d.id];
        if(mob&&!o.mob)return;
        q.append("line").attr("x1",0).attr("x2",0).attr("y1",r(d.v)+2).attr("y2",o.dy-12)
          .attr("stroke",C.hair).attr("stroke-width",.7);
        const shortNom=mob&&d.id==="jerusalem"?"Jerusalem":d.nom;
        V.t(q,o.dx,o.dy,shortNom,{anchor:o.anc,weight:d.id==="natzaret"||d.id==="roma"?700:600,size:mob?11:12,fill:C.ink,halo:3});
        const vStr=d.v>=100000?f0(d.v/1000)+"k":f0(d.v);
        V.t(q,o.dx,o.dy+13,"≈ "+vStr,{anchor:o.anc,size:11,fill:C.muted,halo:2.5});
      });

      function drawArc(target){
        gArc.selectAll("*").remove();
        const a=D.ciutats.find(c=>c.id===anchorId)||D.ciutats[0];
        const b=target||D.ciutats[D.ciutats.length-1];
        if(!b||a.id===b.id)return;
        const x0=x(a.v), x1=x(b.v), xm=(x0+x1)/2;
        const y0=cy-r(a.v)-3, y1=cy-r(b.v)-3;
        const yTop=Math.max(26, Math.min(y0,y1)-Math.min(58, 28+Math.abs(x1-x0)*.08));
        gArc.append("path").attr("d",`M${x0},${y0} Q${xm},${yTop} ${x1},${y1}`)
          .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.15).attr("stroke-dasharray","3 3");
        const ratio=b.v/a.v;
        const lbl=ratio>=1
          ? `×${ratio>=100?f0(ratio):f1(ratio)} més gran`
          : `÷${(1/ratio)>=100?f0(1/ratio):f1(1/ratio)} més petit`;
        const lx=clamp(xm, 68, w-68);
        V.t(gArc,lx,Math.max(16, (Math.min(y0,y1)+yTop)/2-14),lbl,{anchor:"middle",weight:700,size:12,fill:C.vermell,halo:3.5});
      }
      drawArc(D.ciutats.find(c=>c.id==="roma"));

      const defMsg=()=>`<b>Àncora: ${D.ciutats.find(c=>c.id===anchorId).nom}.</b> Passa per qualsevol altra població per mesurar la proporció exacta, o clica per canviar l'àncora.`;
      if(rd)rd.innerHTML=defMsg();

      const reset=()=>{
        nds.interrupt().transition().duration(dur(150)).style("opacity",1);
        nds.select(".ring").attr("stroke",o=>o.id===anchorId?C.ink:"transparent").attr("stroke-dasharray","3 2.5");
        drawArc(anchorId==="roma"?D.ciutats[0]:D.ciutats[D.ciutats.length-1]);
        if(rd)rd.innerHTML=defMsg();
      };
      const show=(target,d)=>{
        nds.interrupt().transition().duration(dur(140)).style("opacity",o=>o===d||o.id===anchorId?1:.48);
        d3.select(target).raise().select(".ring").attr("stroke",C.ink).attr("stroke-dasharray",d.id===anchorId?"3 2.5":null);
        drawArc(d);
        const a=D.ciutats.find(c=>c.id===anchorId);
        const ratio=d.v/a.v;
        const comp=d.id===a.id?"Àncora actual":(ratio>=1?`≈ ${ratio>=10?f0(ratio):f1(ratio)} vegades més gran que ${a.nom}`:`≈ ${1/ratio>=10?f0(1/ratio):f1(1/ratio)} vegades més petit que ${a.nom}`);
        if(rd)rd.innerHTML=`<b>${d.nom}</b> (rang estimat ${f0(d.lo)}–${f0(d.hi)} hab.) · ${comp}. ${d.det}`;
      };
      const setAnchor=d=>{
        anchorId=d.id;
        nds.select(".ring").attr("stroke",o=>o.id===anchorId?C.ink:"transparent").attr("stroke-dasharray","3 2.5");
        drawArc(anchorId==="roma"?D.ciutats[0]:D.ciutats[D.ciutats.length-1]);
        if(rd)rd.innerHTML=`<b>Nova àncora: ${d.nom}</b> (${f0(d.lo)}–${f0(d.hi)} hab. · ${d.font}). ${d.det}`;
      };
      outside(node,reset);

      nds.on("pointerenter",(ev,d)=>show(ev.currentTarget,d))
         .on("focus",(ev,d)=>show(ev.currentTarget,d))
         .on("blur",reset)
         .on("click",(ev,d)=>setAnchor(d))
         .on("keydown",(ev,d)=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); setAnchor(d); } })
         .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });

      V.onView(node,instant=>{
        if(instant)return;
        nds.style("opacity",0).transition().delay((d,i)=>i*65).duration(700).ease(ease).style("opacity",1);
      });
    });
  })();

  /* =====================================================================
     V3 · IB-38 / IB-10 ALÇADA BIOARQUEOLÒGICA + COMPARADOR (#viz-cos)
     Només mesures puntuals publicades (zero barres d'error sintètiques, zero fons pintat P1).
     ===================================================================== */
  (function(){
    const fig=$("#f-cos"), el=$("#viz-cos"), rd=$("#cos-r"), lgEl=$("#cos-lg");
    if(!el)return;
    let tab="ossos";

    const TRETS=[
      {t:"Alçada i constitució", w:"Sovint imaginat alt (~1,80 m) i estilitzat, seguint l'estàndard europeu i cinematogràfic.", h:"Mitjana masculina a la Judea del s. I: ~1,66 m (Nagar & Torge 2003; Taylor 2018), cos fibrós pel treball manual i les caminades."},
      {t:"Cabells i barba", w:"Cabells llargs fins a les espatlles, castany clar o ros, ratlla al mig i barba llarga cuidada.", h:"Cabells curts i foscos —Pau escriu que els cabells llargs en un home són «un deshonor» (1Co 11,14)— i barba curta natural."},
      {t:"Pell i ulls", w:"Pell molt blanca i ulls blaus o clars (fixats per Heinrich Hofmann, Warner Sallman i Robert Powell).", h:"Pell olivàcia o bruna del Llevant mediterrani, bronzejada pel sol, i ulls marrons foscos (Taylor 2018)."},
      {t:"Roba i calçat", w:"Túnica blanca impecable fins als turmells amb faixa o mantell net i teatral.", h:"Túnica curta de llana sense tenyir (chiton), mantell rectangular (himation) amb borles rituals (tzitzit, Mc 6,56) i sandàlies de cuir."}
    ];

    const M=V.mount(el,(node,w)=>{
      if(tab==="trets"){
        lg(lgEl,[
          {c:C.blau,t:"Imatge occidental habitual"},
          {c:C.vermell,t:"Evidència històrica del segle I"}
        ]);
        d3.select(node).selectAll("*").remove();
        const wrap=d3.select(node).append("div").attr("class","tr-grid");
        const cards=[];
        TRETS.forEach(tr=>{
          const card=wrap.append("div").attr("class","tr-card").attr("tabindex","0");
          card.append("div").attr("class","tr-h").text(tr.t);
          const p=card.append("div").attr("class","tr-pair");
          const a=p.append("div"); a.append("span").attr("class","tl w").text("Imatge occidental habitual"); a.append("p").text(tr.w);
          const b=p.append("div"); b.append("span").attr("class","tl h").text("Evidència del segle I"); b.append("p").text(tr.h);
          cards.push({node:card.node(), tr});
        });
        const defT="<b>Cap dels quatre evangelis no descriu la cara ni l'alçada de Jesús:</b> les reconstruccions es basen en ossaris de Judea, tèxtils de Masada i Qumran, i normes socials del segle I (Joan E. Taylor, 2018).";
        if(rd)rd.innerHTML=defT;
        const resetT=()=>{ wrap.classed("dimmed",false); cards.forEach(c=>c.node.classList.remove("is-hi")); if(rd)rd.innerHTML=defT; };
        outside(node,resetT);
        cards.forEach(c=>{
          const hi=()=>{ wrap.classed("dimmed",true); cards.forEach(o=>o.node.classList.toggle("is-hi",o===c)); if(rd)rd.innerHTML=`<b>${c.tr.t}:</b> ${c.tr.h}`; };
          c.node.addEventListener("pointerenter",hi);
          c.node.addEventListener("pointerdown",hi);
          c.node.addEventListener("focus",hi);
          c.node.addEventListener("blur",resetT);
          c.node.addEventListener("pointerleave",ev=>{ if(ev.pointerType==="mouse")resetT(); });
        });
        return;
      }

      lg(lgEl,[
        {c:C.vermell,t:"Homes jueus del segle I (valors publicats)"},
        {c:C.blau,t:"Dones adultes / excepció «Goliat»"},
        {c:C.vermell,t:"Mitjanes masculines (165–169 cm)",k:"da"}
      ]);
      d3.select(node).selectAll(".tr-grid").remove();
      const mob=w<640, h=mob?295:270, m={t:42, r:mob?16:36, b:38, l:mob?14:242};
      const s=V.svg(node,w,h,"Alçada publicada d'esquelets jueus de la Judea del segle I en centímetres: dones 147 cm, homes mitjana 166 cm, Yehohanan crucificat 167 cm, Jericó 169 cm i l'excepció Yeho'ezer «Goliat» amb 188,5 cm.");
      const defs=s.append("defs");
      const uid="cs"+Math.random().toString(36).slice(2,6);
      const gR=addWashGrad(defs,uid+"r",C.vermell,.46,.22);
      const gB=addWashGrad(defs,uid+"b",C.blau,.40,.18);

      const x=d3.scaleLinear().domain([138, mob?206:198]).range([m.l,w-m.r]);
      const y=d3.scalePoint().domain(D.estatura.map(d=>d.id)).range([m.t+22,h-m.b-16]).padding(.35);

      // P1: sense fons pintat — dues línies verticals discontínues fines per al rang verificat de mitjanes masculines (165–169 cm)
      [165,169].forEach(v=>{
        s.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",m.t).attr("y2",h-m.b)
          .attr("stroke",C.vermell).attr("stroke-width",.9).attr("stroke-dasharray","2 3").attr("stroke-opacity",.65);
      });
      s.append("line").attr("x1",x(165)).attr("x2",x(169)).attr("y1",m.t).attr("y2",m.t)
        .attr("stroke",C.vermell).attr("stroke-width",1.4);
      V.t(s,(x(165)+x(169))/2,m.t-9,"Mitjanes masculines (165–169 cm)",{anchor:"middle",size:11.5,fill:C.vermell,weight:600,halo:3});

      V.axisX(s,x,h-m.b,[140,150,160,170,180,190],v=>v+" cm",{grid:m.t});

      const rows=s.selectAll("g.st").data(D.estatura).join("g").attr("class","st")
        .attr("tabindex","0").attr("role","button")
        .attr("aria-label",d=>`${d.nom}: ${d.v%1?f1(d.v):f0(d.v)} centímetres`)
        .style("cursor","pointer");
      rows.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",d=>y(d.id)).attr("y2",d=>y(d.id))
        .attr("stroke",C.grid).attr("stroke-width",.6);

      rows.append("circle").attr("class","w").attr("cx",d=>x(d.v)).attr("cy",d=>y(d.id)).attr("r",mob?11:14)
        .attr("fill",d=>d.cat==="prota"?gR:gB).style("mix-blend-mode","multiply");
      rows.append("circle").attr("class","rim").attr("cx",d=>x(d.v)).attr("cy",d=>y(d.id)).attr("r",mob?11:14)
        .attr("fill","none").attr("stroke","transparent").attr("stroke-width",1.5);
      rows.append("circle").attr("cx",d=>x(d.v)).attr("cy",d=>y(d.id)).attr("r",3.6)
        .attr("fill",d=>d.cat==="prota"?C.vermell:C.blau).attr("stroke",C.paper).attr("stroke-width",1.2);

      rows.each(function(d){
        const q=d3.select(this), yy=y(d.id);
        if(!mob){
          V.t(q,m.l-12,yy+4,d.nom,{anchor:"end",weight:d.cat==="extrem"||d.id==="homes"?700:400,size:12.5,fill:C.ink});
        } else {
          V.t(q,m.l,yy-14,d.nom,{anchor:"start",weight:600,size:11,fill:C.ink,halo:3});
        }
        const valTxt=d.v%1?f1(d.v)+" cm":f0(d.v)+" cm";
        const leftLbl=mob&&d.v>180;
        V.t(q,leftLbl?x(d.v)-14:x(d.v)+14,yy+4,valTxt,{anchor:leftLbl?"end":"start",weight:700,size:11.5,fill:d.cat==="prota"?C.vermell:C.ink,halo:3});
      });

      if(!mob){
        const gol=D.estatura.find(d=>d.id==="goliat");
        V.note(s,{
          x:x(gol.v), y:y(gol.id)-14, tx:x(gol.v)-28, ty:m.t+28,
          kind:"curve", bend:-12, anchor:"end", dot:false,
          lines:[["188,5 cm a la Judea del s. I:",true],["tan inusual que la família es deia «Goliat»"]]
        });
      }

      const def="<b>Dades osteològiques reals:</b> un home adult mitjà de la Judea del segle I feia uns <b>166 cm</b>. Passa el cursor o toca qualsevol fila per veure l'estudi.";
      if(rd)rd.innerHTML=def;
      const reset=()=>{
        rows.interrupt().transition().duration(dur(140)).style("opacity",1);
        rows.select(".rim").attr("stroke","transparent");
        if(rd)rd.innerHTML=def;
      };
      const show=(target,d)=>{
        rows.interrupt().transition().duration(dur(140)).style("opacity",o=>o===d?1:.48);
        d3.select(target).raise().select(".rim").attr("stroke",C.ink);
        if(rd)rd.innerHTML=`<b>${d.nom} (${d.v%1?f1(d.v):f0(d.v)} cm · ${d.tipus})</b> · ${d.det} <i>(${d.font})</i>`;
      };
      outside(node,reset);
      rows.on("pointerenter pointerdown",(ev,d)=>show(ev.currentTarget,d))
          .on("focus",(ev,d)=>show(ev.currentTarget,d))
          .on("blur",reset)
          .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });

      V.onView(node,instant=>{
        if(instant)return;
        rows.style("opacity",0).transition().delay((d,i)=>i*80).duration(650).ease(ease).style("opacity",1);
      });
    });

    seg(fig,k=>{ tab=k; el.__seen=true; M.redraw(); });
  })();

  /* =====================================================================
     V4 · SCROLLYTELLING 1 · MAPA + CINTA ICONOGRÀFICA (#s-cares)
     IB-25 (mapa net Equal Earth amb clipPath estricte) + cinta temporal no lineal per trams (24 fites)
     ===================================================================== */
  (function(){
    const sec=$("#s-cares"), el=$("#cares"), rd=$("#cares-r");
    if(!sec||!el)return;
    let curPhase=0, worldData=null, drawFn=null;

    lg($("#cares-lg"),[
      {c:C.blau,t:"Imberbe i cabell curt (s. III–IV)"},
      {c:C.vermell,t:"Barbut / model bizantí i occidental"},
      {c:C.groc,t:"Inculturació global o model jueu"},
      {c:C.ink2,t:"Caricatura romana"}
    ]);

    const PHASE_META=[
      {t:"c. 200 – 359 dC · Un jove imberbe d'estil grecoromà", s:"Dura-Europos, les catacumbes de Roma i Britània: zero barba i cabells curts"},
      {t:"c. 375 – 711 dC · El gir imperial: barba, cabells llargs i tron", s:"De la catacumba de Commodil·la a Ravenna (on conviuen tots dos models) i el Sinaí"},
      {t:"s. IX – XV · De Taüll a la Xina, Etiòpia i la Carta de Lèntul", s:"Mentre cada cultura l'adapta, una falsificació medieval fixa el cànon europeu"},
      {t:"1495 – 1656 · El Renaixement europeu... i l'excepció de Rembrandt", s:"Leonardo i Dürer l'europeïtzen; a Amsterdam, Rembrandt retrata un model del natural"},
      {t:"1863 – 1940 · Racialització a Europa i estandardització a Chicago", s:"De l'Institut d'Eisenach (1939) als 500 milions de còpies de Warner Sallman (1940)"},
      {t:"1952 – avui · Hollywood, inculturació global i retorn a Judea", s:"Robert Powell fixa el cànon televisiu mentre Corea i l'arqueologia obren altres mirades"}
    ];

    const colT=t=>t==="imberbe"?C.blau:t==="barbut"?C.vermell:t==="global"?C.groc:C.ink2;
    const arcCol=t=>t==="imberbe"?C.blau:t==="barbut"?C.vermell:C.ink2;

    const M=V.mount(el,(node,w)=>{
      const mob=w<640, hMap=mob?220:290, hTime=mob?92:102, h=hMap+hTime;
      const s=V.svg(node,w,h,"Mapa mundial i cinta cronològica de 24 fites verificades de la representació visual de Jesús entre l'any 200 i el 2001.");
      const defs=s.append("defs");
      const uid="cr"+Math.random().toString(36).slice(2,6);
      const clipId=uid+"clip";
      defs.append("clipPath").attr("id",clipId).append("rect").attr("x",0).attr("y",0).attr("width",w).attr("height",hMap);
      const wash={
        imberbe:addWashGrad(defs,uid+"i",C.blau,.48,.22),
        barbut:addWashGrad(defs,uid+"b",C.vermell,.48,.22),
        global:addWashGrad(defs,uid+"g",C.groc,.62,.30),
        altre:addWashGrad(defs,uid+"a",C.ink2,.36,.16)
      };

      const gMapClip=s.append("g").attr("clip-path",`url(#${clipId})`);
      const gLand=gMapClip.append("g"), gArcs=gMapClip.append("g");
      const gPts=s.append("g"), gAnn=s.append("g");
      const gTime=s.append("g").attr("transform",`translate(0,${hMap+14})`);

      // Projecció plana neta Equal Earth enfocada a l'hemisferi nord/centre, retallada estrictament dins hMap
      const proj=d3.geoEqualEarth().center([18, 30]).scale(mob?w*.225:w*.245).translate([w*.52, hMap*.60]);
      const path=d3.geoPath(proj);

      function renderWorld(){
        gLand.selectAll("*").remove();
        if(!worldData)return;
        gLand.append("path").datum(worldData.land).attr("d",path).attr("fill",C.land).attr("stroke","none");
        gLand.append("path").datum(worldData.borders).attr("d",path).attr("fill","none").attr("stroke",C.paper).attr("stroke-width",.55);
      }
      if(worldData)renderWorld();
      else V.world().then(wd=>{ worldData=wd; renderWorld(); });

      const [jx,jy]=proj([35.3,32.7]);
      gMapClip.append("circle").attr("cx",jx).attr("cy",jy).attr("r",3).attr("fill",C.ink);
      if(!mob)V.t(gMapClip,jx+7,jy+4,"Judea (s. I)",{size:11,weight:700,fill:C.ink,halo:3});

      // Escala temporal no lineal per trams: separa amb claredat segles III-VII, Renaixement i 1889-2001!
      const x0=mob?18:28, x1=w-(mob?18:28), sp=x1-x0;
      const xTime=d3.scaleLinear()
        .domain([190, 720, 1440, 1880, 2010])
        .range([x0, x0+sp*.34, x0+sp*.54, x0+sp*.76, x1]);

      gTime.append("line").attr("x1",x0).attr("x2",x1).attr("y1",28).attr("y2",28).attr("stroke",C.hair).attr("stroke-width",1);
      (mob?[200,500,1100,1600,1940,2001]:[200,400,700,1100,1500,1900,1940,2001]).forEach(yr=>{
        const tx=xTime(yr);
        gTime.append("line").attr("x1",tx).attr("x2",tx).attr("y1",24).attr("y2",32).attr("stroke",C.muted).attr("stroke-width",.8);
        V.t(gTime,tx,46,String(yr),{anchor:"middle",size:11,fill:C.muted});
      });
      V.t(gTime,x0,70,mob?"← s. III imberbe · s. IV–XX barbut →":"← Segle III: imberbe i cabell curt · · · Segles IV–XX: barba i europeïtzació →",{size:11,fill:C.muted,italic:true});

      // Cercles al mapa (amb petita separació determinista per a les 5 fites de Roma) + punts a la cinta
      const items=D.iconografia.map((d,i)=>{
        const [bx,by]=proj([d.lon,d.lat]);
        const sc=mob?.75:1;
        const mx=bx+(d.ox||0)*sc, my=by+(d.oy||0)*sc;
        const tx=xTime(d.any);
        // lleuger desplaçament vertical alternat a la cinta quan dues fites són molt pròximes en anys
        const tyOff=(d.id==="eisenach"||d.id==="leonardo"||d.id==="priscila"||d.id==="pudenziana")?-6:0;
        return {...d, i, mx, my, tx, tyOff};
      });

      // Arcs subtils des de Judea (mai línia groga fina < 2 px: per a global/altre fem servir gris tinta discontinu!)
      const arcs=gArcs.selectAll("path.arc").data(items).join("path").attr("class","arc")
        .attr("d",d=>{
          const xm=(jx+d.mx)/2, ym=(jy+d.my)/2-Math.min(46,Math.hypot(d.mx-jx,d.my-jy)*.22);
          return `M${jx},${jy} Q${xm},${ym} ${d.mx},${d.my}`;
        })
        .attr("fill","none")
        .attr("stroke",d=>arcCol(d.tipus))
        .attr("stroke-width",.8)
        .attr("stroke-dasharray",d=>d.tipus==="global"||d.tipus==="altre"?"3 3":null)
        .attr("stroke-opacity",.22);

      const mPts=gPts.selectAll("g.mp").data(items).join("g").attr("class","mp")
        .attr("transform",d=>`translate(${d.mx},${d.my})`)
        .attr("tabindex","0").attr("role","button")
        .attr("aria-label",d=>`${d.nom}, ${d.data}, ${d.lloc}`)
        .style("cursor","pointer");
      mPts.append("circle").attr("class","w").attr("r",d=>d.star?(mob?14:20):(mob?8:11.5))
        .attr("fill",d=>wash[d.tipus]).style("mix-blend-mode","multiply");
      mPts.append("circle").attr("class","rim").attr("r",d=>d.star?(mob?14:20):(mob?8:11.5))
        .attr("fill","none").attr("stroke","transparent").attr("stroke-width",1.5);
      mPts.append("circle").attr("class","c").attr("r",d=>d.star?4:2.6)
        .attr("fill",d=>d.tipus==="global"?C.ink:colT(d.tipus)).attr("stroke",C.paper).attr("stroke-width",.9);

      const tPts=gTime.selectAll("g.tp").data(items).join("g").attr("class","tp")
        .attr("transform",d=>`translate(${d.tx},${28+d.tyOff})`)
        .attr("tabindex","0").attr("role","button")
        .attr("aria-label",d=>`${d.nom}, ${d.data}`)
        .style("cursor","pointer");
      tPts.append("circle").attr("class","tc").attr("r",d=>d.star?6.8:4.8)
        .attr("fill",d=>colT(d.tipus)).attr("fill-opacity",.72)
        .attr("stroke",d=>d.star?C.ink:C.paper).attr("stroke-width",d=>d.star?1.4:.8).style("mix-blend-mode","multiply");

      function updatePhase(ph){
        curPhase=ph;
        const meta=PHASE_META[ph]||PHASE_META[0];
        const tEl=$("#cares-t"), sEl=$("#cares-s");
        if(tEl)tEl.textContent=meta.t;
        if(sEl)sEl.textContent=meta.s;

        mPts.transition().duration(dur(360))
          .style("opacity",d=>d.fase===ph?1:d.fase<ph?.48:.18);
        mPts.select(".w").transition().duration(dur(360))
          .attr("r",d=>d.fase===ph?(d.star?(mob?16:23):(mob?11:15)):(d.star?(mob?11:14):(mob?6.5:8.5)));
        mPts.select(".rim").attr("stroke","transparent");
        arcs.transition().duration(dur(360))
          .attr("stroke-opacity",d=>d.fase===ph?.46:d.fase<ph?.12:0);
        tPts.transition().duration(dur(360))
          .style("opacity",d=>d.fase===ph?1:d.fase<ph?.52:.22)
          .attr("transform",d=>`translate(${d.tx},${(d.fase===ph?20:28)+d.tyOff})`);
        tPts.select(".tc").attr("stroke",d=>d.star?C.ink:C.paper).attr("stroke-width",d=>d.star?1.4:.8);

        gAnn.selectAll("*").remove();
        const hi=items.filter(d=>d.fase===ph);
        const picks=mob?hi.slice(-1):[hi[0], hi[hi.length-1]].filter((v,i,a)=>v&&a.indexOf(v)===i);
        picks.forEach((d,i)=>{
          const right=d.mx<w*.52;
          const lblTxt=`${d.nom} (${d.data})`;
          const estW=Math.min(220, lblTxt.length*6.4+16);
          const tx=right?clamp(d.mx+32, 16, Math.max(16, w-estW-8)):clamp(d.mx-32, Math.min(w-16, estW+8), w-16);
          const ty=clamp(d.my+(i===0?-30:30), 22, hMap-24);
          V.note(gAnn,{
            x:d.mx, y:d.my, tx, ty, kind:"elbow", anchor:right?"start":"end", dot:false,
            size:mob?11:12,
            lines:[[lblTxt,true],[d.lloc]]
          });
        });
        if(rd){
          const lead=hi[hi.length-1]||items[0];
          rd.innerHTML=`<b>${lead.nom} (${lead.data}, ${lead.lloc}):</b> ${lead.det}`;
        }
      }

      const focusItem=d=>{
        mPts.interrupt().transition().duration(dur(130)).style("opacity",o=>o===d?1:.48);
        mPts.filter(o=>o===d).raise().select(".rim").attr("stroke",C.ink);
        tPts.interrupt().transition().duration(dur(130)).style("opacity",o=>o===d?1:.48);
        tPts.filter(o=>o===d).raise().select(".tc").attr("stroke",C.ink).attr("stroke-width",1.5);
        arcs.interrupt().transition().duration(dur(130)).attr("stroke-opacity",o=>o===d?.8:.1);
        if(rd)rd.innerHTML=`<b>${d.nom} (${d.data} · ${d.lloc}):</b> ${d.det} <i>(${d.font})</i>`;
      };
      const resetHover=()=>updatePhase(curPhase);
      outside(node,resetHover);

      [mPts,tPts].forEach(sel=>{
        sel.on("pointerenter pointerdown",(ev,d)=>focusItem(d))
           .on("focus",(ev,d)=>focusItem(d))
           .on("blur",resetHover)
           .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")resetHover(); });
      });

      drawFn=updatePhase;
      updatePhase(curPhase);
    });

    if(window.IB&&IB.scrolly){
      IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), idx=>{
        curPhase=idx;
        if(drawFn)drawFn(idx);
      });
    }
    void M;
  })();

  /* =====================================================================
     V5 · DADES EMPÍRIQUES MODERNES (#viz-enquesta)
     Mode 1: Enquestes YouGov UK (2021) i EUA (2020)
     Mode 2: Estudi psicològic de correlació inversa (PLOS ONE, 2018)
     ===================================================================== */
  (function(){
    const fig=$("#f-enquesta"), el=$("#viz-enquesta"), rd=$("#enquesta-r");
    if(!el)return;
    let mode="yougov";
    const lgEl=$("#enquesta-lg");

    const M=V.mount(el,(node,w)=>{
      const mob=w<640;
      if(mode==="yougov"){
        lg(lgEl,[
          {c:C.vermell,t:"Imatge que solen veure (RU)"},
          {c:C.blau,t:"Acceptable al Regne Unit (2021)"},
          {c:C.groc,t:"Acceptable als EUA (2020)"}
        ]);
        const h=mob?340:320, m={t:56, r:mob?20:48, b:38, l:mob?12:168};
        const s=V.svg(node,w,h,"Enquestes YouGov al Regne Unit (2021) i als EUA (2020): el 58 % dels britànics solen veure un Jesús blanc i només el 22 % de l'Orient Mitjà, tot i que un 68 % (RU) i un 65 % (EUA) accepten la representació de l'Orient Mitjà.");
        const rows=D.yougov.veuVsAccepta;
        const x=d3.scaleLinear().domain([0,80]).range([m.l,w-m.r]);
        const y=d3.scalePoint().domain(rows.map(d=>d.k)).range([m.t+24,h-m.b-16]).padding(.35);

        V.axisX(s,x,h-m.b,[0,20,40,60,80],v=>v+" %",{grid:m.t});

        const gRows=s.selectAll("g.yg").data(rows).join("g").attr("class","yg")
          .attr("tabindex","0").attr("role","button")
          .attr("aria-label",d=>`${d.nom}: acceptable Regne Unit ${d.accUK} per cent, EUA ${d.accUS} per cent`)
          .style("cursor","pointer");
        gRows.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",d=>y(d.k)).attr("y2",d=>y(d.k))
          .attr("stroke",C.grid).attr("stroke-width",.6);

        gRows.filter(d=>d.veuUK!=null).append("line")
          .attr("x1",d=>x(d.veuUK)).attr("x2",d=>x(d.accUK)).attr("y1",d=>y(d.k)).attr("y2",d=>y(d.k))
          .attr("stroke",d=>d.k==="om"?C.blau:C.vermell).attr("stroke-width",2.5).attr("stroke-opacity",.35);

        // lleuger desplaçament vertical quan EUA i RU coincideixen o són a ≤3 punts
        const dyUS=d=>Math.abs((d.accUS||0)-d.accUK)<=3?4:0;
        const dyUK=d=>Math.abs((d.accUS||0)-d.accUK)<=3?-4:0;

        gRows.filter(d=>d.accUS!=null).append("circle").attr("class","dus")
          .attr("cx",d=>x(d.accUS)).attr("cy",d=>y(d.k)+dyUS(d)).attr("r",7.5)
          .attr("fill",C.groc).attr("fill-opacity",.82).attr("stroke",C.ink).attr("stroke-width",.75).style("mix-blend-mode","multiply");

        gRows.append("circle").attr("class","duk")
          .attr("cx",d=>x(d.accUK)).attr("cy",d=>y(d.k)+dyUK(d)).attr("r",8)
          .attr("fill",C.blau).attr("fill-opacity",.75).attr("stroke",C.paper).attr("stroke-width",1).style("mix-blend-mode","multiply");

        gRows.filter(d=>d.veuUK!=null).append("circle").attr("class","dve")
          .attr("cx",d=>x(d.veuUK)).attr("cy",d=>y(d.k)).attr("r",8.8)
          .attr("fill",C.vermell).attr("fill-opacity",.84).attr("stroke",C.paper).attr("stroke-width",1.2);

        gRows.each(function(d){
          const q=d3.select(this), yy=y(d.k);
          if(!mob){
            V.t(q,m.l-12,yy+4,d.nom,{anchor:"end",weight:d.k==="om"||d.k==="blanc"?700:400,size:12.5,fill:C.ink});
          } else {
            V.t(q,m.l,yy-15,d.nom,{anchor:"start",weight:600,size:11.5,fill:C.ink,halo:3});
          }
          if(d.veuUK!=null) V.t(q,x(d.veuUK),yy-13,d.veuUK+" %",{anchor:"middle",weight:700,size:11,fill:C.vermell,halo:3});
          // si el punt groc (EUA) és a la dreta del blau (RU), posem l'etiqueta blava a l'esquerra perquè no se solapi mai!
          const putLeft=d.accUS!=null&&d.accUS>d.accUK+2;
          V.t(q,putLeft?x(d.accUK)-11:x(d.accUK)+11,yy+dyUK(d)+4,d.accUK+" %",{anchor:putLeft?"end":"start",weight:600,size:11,fill:C.blau,halo:3});
        });

        // Anotació neta a la zona superior sobre la fila d'Orient Mitjà (zero solapament amb Negre / africà!)
        if(!mob){
          const om=rows.find(d=>d.k==="om");
          V.note(s,{
            x:x(45), y:y("om")-3, tx:x(45), ty:16,
            kind:"straight", anchor:"middle", dot:false,
            lines:[["Bretxa de +46 punts (Orient Mitjà):",true],["un 22 % el veu així al RU, però un 68 % ho accepta"]]
          });
        }

        const def="<b>Inèrcia visual (YouGov 2020–2021):</b> el <b>58 %</b> dels britànics solen veure Jesús com a blanc i només el <b>22 %</b> com a persona de l'Orient Mitjà, malgrat que aquesta és l'opció més acceptada tant al Regne Unit (<b>68 %</b>) com als EUA (<b>65 %</b>).";
        if(rd)rd.innerHTML=def;
        const reset=()=>{
          gRows.interrupt().transition().duration(dur(140)).style("opacity",1);
          gRows.select(".duk").attr("stroke",C.paper).attr("stroke-width",1);
          if(rd)rd.innerHTML=def;
        };
        const show=(target,d)=>{
          gRows.interrupt().transition().duration(dur(140)).style("opacity",o=>o===d?1:.48);
          d3.select(target).raise().select(".duk").attr("stroke",C.ink).attr("stroke-width",1.6);
          const extra=d.k==="blanc"?" (cau al 51 % entre joves de 18–24 anys i al 40 % entre persones de minories ètniques del Regne Unit)."
            :d.k==="om"?" (també l'opció més acceptada entre persones de minories ètniques britàniques: 60 %).":".";
          const usStr=d.accUS!=null?` · EUA acceptable: <b>${d.accUS} %</b>`:"";
          const veuStr=d.veuUK!=null?`Solen veure (RU): <b>${d.veuUK} %</b> · `:"";
          if(rd)rd.innerHTML=`<b>${d.nom}:</b> ${veuStr}RU acceptable: <b>${d.accUK} %</b>${usStr}${extra}`;
        };
        outside(node,reset);
        gRows.on("pointerenter pointerdown",(ev,d)=>show(ev.currentTarget,d))
             .on("focus",(ev,d)=>show(ev.currentTarget,d))
             .on("blur",reset)
             .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });

        V.onView(node,instant=>{
          if(instant)return;
          gRows.style("opacity",0).transition().delay((d,i)=>i*70).duration(650).ease(ease).style("opacity",1);
        });
      } else {
        // Mode 2: Jackson, Hester & Gray (PLOS ONE 2018) — estadístics t exactes amb cotes mínimes (>)
        lg(lgEl,[
          {c:C.vermell,t:"Projecció egocèntrica («s'assembla a mi»)"},
          {c:C.blau,t:"Projecció política (mínim entre trets)"},
          {c:C.ghost,t:"No significatiu (p = 0,36)"}
        ]);
        const h=mob?355:315, m={t:36, r:mob?16:44, b:40, l:mob?12:266};
        const s=V.svg(node,w,h,"Resultats estadístics de Jackson, Hester i Gray (PLOS ONE, 2018; n = 511 cristians EUA): força de projecció (valor t) de l'edat, l'atractiu i la ideologia política sobre el rostre mental de Déu i Jesús.");
        const rows=D.yougov.plos;
        const x=d3.scaleLinear().domain([0, mob?16.5:18.5]).range([m.l,w-m.r]);
        const y=d3.scalePoint().domain(rows.map(d=>d.nom)).range([m.t+22,h-m.b-14]).padding(.38);
        const colG=g=>g==="ego"?C.vermell:g==="pol"?C.blau:C.ghost;

        const gBg=s.append("g");
        V.axisX(gBg,x,h-m.b,mob?[0,4,8,12,16]:[0,2,4,6,8,10,12,14,16],v=>"t = "+v,{grid:m.t});
        // línia de llindar a sota de totes les etiquetes (lower)
        gBg.append("line").attr("x1",x(1.96)).attr("x2",x(1.96)).attr("y1",m.t).attr("y2",h-m.b)
          .attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","2 3").attr("stroke-opacity",.6);
        V.t(gBg,x(1.96)+4,m.t-8,"llindar no atzar (t ≈ 1,96 · p < 0,05)",{size:11,fill:C.ink2,italic:true,halo:3});

        const gRows=s.selectAll("g.pl").data(rows).join("g").attr("class","pl")
          .attr("tabindex","0").attr("role","button")
          .attr("aria-label",d=>`${d.nom}: t ${d.op} ${f2(d.t)}, ${d.p}`)
          .style("cursor","pointer");
        gRows.append("line").attr("x1",x(0)).attr("x2",d=>x(d.t)).attr("y1",d=>y(d.nom)).attr("y2",d=>y(d.nom))
          .attr("stroke",d=>colG(d.grup)).attr("stroke-width",3.2).attr("stroke-opacity",.45).attr("stroke-linecap","round");
        gRows.append("circle").attr("class","w").attr("cx",d=>x(d.t)).attr("cy",d=>y(d.nom)).attr("r",11)
          .attr("fill",d=>colG(d.grup)).attr("fill-opacity",.32).style("mix-blend-mode","multiply");
        gRows.append("circle").attr("class","rim").attr("cx",d=>x(d.t)).attr("cy",d=>y(d.nom)).attr("r",11)
          .attr("fill","none").attr("stroke","transparent").attr("stroke-width",1.5);
        gRows.append("circle").attr("cx",d=>x(d.t)).attr("cy",d=>y(d.nom)).attr("r",3.8)
          .attr("fill",d=>d.grup==="no"?C.muted:colG(d.grup)).attr("stroke",C.paper).attr("stroke-width",1);

        gRows.each(function(d){
          const q=d3.select(this), yy=y(d.nom);
          if(!mob){
            V.t(q,m.l-12,yy+4,d.nom,{anchor:"end",weight:d.t>3?600:400,size:12,fill:C.ink,halo:3.5});
          } else {
            V.t(q,m.l,yy-14,d.nom,{anchor:"start",weight:600,size:11,fill:C.ink,halo:4});
          }
          const lbl=`t ${d.op} ${f2(d.t)} (${d.p})`;
          const leftSide=mob&&d.t>8;
          V.t(q,leftSide?x(d.t)-14:x(d.t)+13,yy+4,lbl,{anchor:leftSide?"end":"start",size:11,fill:C.ink2,halo:3.5});
        });

        const def="<b>La prova del mirall (PLOS ONE, 2018):</b> com més alt és el valor <i>t</i>, més forta és la projecció (per sobre d'1,96 ja no és atzar). En 300 eleccions per persona (<i>n</i> = 511), cadascú hi projecta la seva edat, atractiu i política —però homes i dones dibuixen un rostre jove i masculí (molt influït per la imatge de Jesús).";
        if(rd)rd.innerHTML=def;
        const reset=()=>{
          gRows.interrupt().transition().duration(dur(140)).style("opacity",1);
          gRows.select(".rim").attr("stroke","transparent");
          if(rd)rd.innerHTML=def;
        };
        const show=(target,d)=>{
          gRows.interrupt().transition().duration(dur(140)).style("opacity",o=>o===d?1:.48);
          d3.select(target).raise().select(".rim").attr("stroke",C.ink);
          if(rd)rd.innerHTML=`<b>${d.nom}</b> (t ${d.op} ${f2(d.t)}, ${d.p}) · ${d.det}`;
        };
        outside(node,reset);
        gRows.on("pointerenter pointerdown",(ev,d)=>show(ev.currentTarget,d))
             .on("focus",(ev,d)=>show(ev.currentTarget,d))
             .on("blur",reset)
             .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });

        V.onView(node,instant=>{
          if(instant)return;
          gRows.style("opacity",0).transition().delay((d,i)=>i*70).duration(650).ease(ease).style("opacity",1);
        });
      }
    });

    seg(fig,k=>{ mode=k; el.__seen=true; M.redraw(); });
  })();

  /* =====================================================================
     V6 · SCROLLYTELLING 2 · IB-55 MAPA CONCEPTUAL SOBRE EIXOS (#s-mirall)
     «El pou de Tyrrell»: esquema historiogràfic sense solapaments ni línies grogues fines
     ===================================================================== */
  (function(){
    const sec=$("#s-mirall"), el=$("#mirall"), rd=$("#mirall-r");
    if(!sec||!el)return;
    let curStep=0, updFn=null;

    lg($("#mirall-lg"),[
      {c:C.vermell,t:"Consens històric del s. I"},
      {c:C.blau,t:"Projeccions europees i imperials"},
      {c:C.groc,t:"Iconografia i cultura moderna"}
    ]);

    const M=V.mount(el,(node,w)=>{
      const mob=w<640, h=mob?380:440, m={t:42, r:mob?22:48, b:46, l:mob?22:48};
      const s=V.svg(node,w,h,"Esquema historiogràfic en dos eixos que situa el Jesús jueu galileu del segle I davant les projeccions posteriors: Crist Emperador bizantí, Jesús liberal i ari europeu, icona blanca de Warner Sallman i els Jesús a la carta del segle XXI.");
      const defs=s.append("defs");
      const uid="mr"+Math.random().toString(36).slice(2,6);
      const fills={
        vermell:addWashGrad(defs,uid+"v",C.vermell,.42,.20),
        blau:addWashGrad(defs,uid+"b",C.blau,.34,.16),
        groc:addWashGrad(defs,uid+"g",C.groc,.54,.26),
        vermellClar:addWashGrad(defs,uid+"vc",C.vermellClar,.55,.26)
      };

      const x=d3.scaleLinear().domain([-1.15,1.15]).range([m.l,w-m.r]);
      const y=d3.scaleLinear().domain([-1.08,1.08]).range([h-m.b,m.t]);
      const cx=x(0), cy=y(0);

      const gAx=s.append("g");
      gAx.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",cy).attr("y2",cy)
        .attr("stroke",C.muted).attr("stroke-width",.8).attr("stroke-dasharray","3 4");
      gAx.append("line").attr("x1",cx).attr("x2",cx).attr("y1",m.t).attr("y2",h-m.b)
        .attr("stroke",C.muted).attr("stroke-width",.8).attr("stroke-dasharray","3 4");

      V.t(gAx,m.l,cy-8,mob?"← Judaisme s. I":"← Arrelat al judaisme del s. I",{anchor:"start",size:mob?11:12,fill:C.ink2,weight:600,halo:3});
      V.t(gAx,w-m.r,cy-8,mob?"Occidentalitzat →":"Desjudaïtzat / occidentalitzat →",{anchor:"end",size:mob?11:12,fill:C.ink2,weight:600,halo:3});
      V.t(gAx,cx,m.t-14,"↑ Apocalíptic, col·lectiu i polític",{anchor:"middle",size:mob?11:12,fill:C.ink2,weight:600,halo:3});
      V.t(gAx,cx,h-m.b+24,"↓ Espiritual, individual i privat",{anchor:"middle",size:mob?11:12,fill:C.ink2,weight:600,halo:3});

      const lineGen=d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveCatmullRom.alpha(.5));
      const trail=s.append("path").datum(D.mirall).attr("d",lineGen)
        .attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.85).attr("stroke-dasharray","2 4").attr("stroke-opacity",.35);

      const sc=mob?.72:1;
      const strokeBase=d=>d.c==="groc"?"transparent":(C[d.c]||C.vermell);
      const orbs=s.selectAll("g.orb").data(D.mirall).join("g").attr("class","orb")
        .attr("transform",d=>`translate(${x(d.x)},${y(d.y)})`)
        .attr("tabindex","0").attr("role","button")
        .attr("aria-label",d=>`${d.nom}, ${d.sub}`)
        .style("cursor","pointer");

      orbs.append("circle").attr("class","w").attr("r",d=>d.r*sc)
        .attr("fill",d=>fills[d.c]).style("mix-blend-mode","multiply");
      orbs.append("circle").attr("class","r").attr("r",d=>d.r*sc)
        .attr("fill","none").attr("stroke",strokeBase).attr("stroke-width",.85).attr("stroke-opacity",.55);
      orbs.append("circle").attr("r",2.8).attr("fill",C.ink);

      orbs.each(function(d){
        const q=d3.select(this);
        V.t(q,0,-5,d.nom,{anchor:"middle",weight:700,size:mob?11.5:13,fill:C.ink,halo:3.5});
        V.t(q,0,12,d.sub,{anchor:"middle",size:mob?11:11.5,fill:C.ink2,halo:3});
      });

      function applyStep(st){
        curStep=st;
        orbs.transition().duration(dur(360))
          .style("opacity",d=>d.fase===st?1:d.fase<st?.58:.24);
        orbs.select(".r").transition().duration(dur(360))
          .attr("stroke-width",d=>d.fase===st?1.6:.8)
          .attr("stroke",d=>d.fase===st?C.ink:strokeBase(d));
        trail.transition().duration(dur(360)).attr("stroke-opacity",st>0?.42:.12);
        const cur=D.mirall[st]||D.mirall[0];
        if(rd)rd.innerHTML=`<b>${cur.nom} (${cur.sub}):</b> ${cur.det}`;
      }

      const reset=()=>applyStep(curStep);
      const show=(target,d)=>{
        orbs.interrupt().transition().duration(dur(140)).style("opacity",o=>o===d?1:.48);
        d3.select(target).raise().select(".r").attr("stroke",C.ink).attr("stroke-width",1.6);
        if(rd)rd.innerHTML=`<b>${d.nom} (${d.sub}):</b> ${d.det}`;
      };
      outside(node,reset);
      orbs.on("pointerenter pointerdown",(ev,d)=>show(ev.currentTarget,d))
          .on("focus",(ev,d)=>show(ev.currentTarget,d))
          .on("blur",reset)
          .on("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });

      updFn=applyStep;
      applyStep(curStep);
    });

    if(window.IB&&IB.scrolly){
      IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), idx=>{
        curStep=idx;
        if(updFn)updFn(idx);
      });
    }
    void M;
  })();

  /* =====================================================================
     V7 · TAULA SEMÀNTICA INTERACTIVA DE 12 CONTRASTOS VERIFICATS (#viz-sorpreses)
     ===================================================================== */
  (function(){
    const fig=$("#f-sorpreses"), el=$("#viz-sorpreses"), rd=$("#sorpreses-r");
    if(!el)return;
    const DEG={
      solid:{t:"Consens sòlid",c:C.vermell},
      majoria:{t:"Majoria acadèmica",c:C.blau},
      debat:{t:"Debat obert",c:C.groc}
    };
    lg($("#sorpreses-lg"),[
      {c:C.vermell,t:"Consens sòlid"},
      {c:C.blau,t:"Majoria acadèmica"},
      {c:C.groc,t:"Debat obert"}
    ]);

    let activeFilter="tots";
    const summaryFor=k=>{
      if(k==="tots")return "<b>Dotze contrastos verificats:</b> 8 punts de consens històric sòlid, 3 de majoria acadèmica i 1 debat obert (l'alfabetització de Jesús). Filtra per grau d'acord o passa per cada fila.";
      const n=D.contrastos.filter(d=>d.deg===k).length;
      return `<b>Mostrant ${n} de 12 contrastos</b> (${DEG[k].t.toLowerCase()}). Passa o toca qualsevol fila per llegir-ne el detall.`;
    };

    const table=document.createElement("table");
    table.className="cx-table";
    table.innerHTML=`<caption>Dotze contrastos verificats entre la imatge occidental habitual i el consens històric sobre Jesús</caption>
      <thead><tr><th scope="col">Aspecte</th><th scope="col">Imatge occidental habitual</th><th scope="col">El que indica la història</th><th scope="col">Grau d'acord</th></tr></thead>`;
    const tbody=document.createElement("tbody");
    table.appendChild(tbody);
    el.appendChild(table);

    const rows=[];
    const reset=()=>{
      table.classList.remove("dimmed");
      rows.forEach(r=>r.classList.remove("is-hi"));
      if(rd)rd.innerHTML=summaryFor(activeFilter);
    };
    outside(el,reset);

    D.contrastos.forEach(d=>{
      const tr=document.createElement("tr");
      tr.dataset.deg=d.deg;
      tr.tabIndex=0;
      const g=DEG[d.deg];
      tr.innerHTML=`<th scope="row">${d.k}</th><td class="cx-myth">${d.myth}</td><td class="cx-hist">${d.hist}<span class="cx-src">${d.src}</span></td><td><span class="cx-deg"><i style="background:${g.c}"></i>${g.t}</span></td>`;
      const hi=()=>{
        table.classList.add("dimmed");
        rows.forEach(r=>r.classList.toggle("is-hi",r===tr));
        if(rd)rd.innerHTML=`<b>${d.k} (${g.t}):</b> ${d.hist} <i>(${d.src})</i>`;
      };
      tr.addEventListener("pointerenter",hi);
      tr.addEventListener("pointerdown",hi);
      tr.addEventListener("focus",hi);
      tr.addEventListener("blur",reset);
      tr.addEventListener("pointerleave",ev=>{ if(ev.pointerType==="mouse")reset(); });
      tbody.appendChild(tr);
      rows.push(tr);
    });

    if(rd)rd.innerHTML=summaryFor("tots");
    seg(fig,k=>{
      activeFilter=k;
      reset();
      rows.forEach(r=>{ r.hidden=!(k==="tots"||r.dataset.deg===k); });
      if(rd)rd.innerHTML=summaryFor(k);
    });
  })();
})();
