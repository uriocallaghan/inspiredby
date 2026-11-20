/* Sistema infogràfic d'Inspired by Magazine · Temps (peces noves): TIME-13 i TIME-14.
   Cada bloc «TIME-nn» és una peça completa que es pot copiar a un article i adaptar.
   Fa servir assets/ib-viz.js (IBV). Ve de «Per què van aixecar Stonehenge?» (fig-mon i fig-mirall). */
(function(){
"use strict";
const V=IBV, C=V.C;
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,draw):{redraw(){}}; }
const yr=y=>y<0?`${f0(-y)} aC`:y<1000?`${y} dC`:`${y}`;
const yrc=(y,c)=>(c?"c. ":"")+yr(y);   // «c.» quan la data és aproximada

/* =====================================================================
   TIME-13 · CRONOLOGIA AMB ICONES  (dades reals, dates aproximades)
   Una fila per cas amb una icona de línia que en diu el tipus, la durada en una barra, franges d'època,
   claudàtors que comparen intervals i una columna de mida (cercle d'àrea proporcional).
   Exemple: onze escriptures del món, de la primera inscripció coneguda a l'última (o fins avui).
   ===================================================================== */
const T13={
  types:{
    logo:{t:"logogràfica",d:"cada signe, una paraula o una idea"},
    logosil:{t:"logosil·làbica",d:"signes de paraula i de síl·laba barrejats"},
    sil:{t:"sil·labari",d:"cada signe, una síl·laba"},
    abjad:{t:"abjad",d:"només consonants"},
    alfa:{t:"alfabet",d:"consonants i vocals"},
    trets:{t:"alfabet de trets",d:"la forma de la lletra imita la boca"}
  },
  rows:[
    {n:"Cuneïforme",ca:1,l:"Mesopotàmia",ty:"logosil",a:-3200,b:75,s:600,sT:"~600 signes"},
    {n:"Jeroglífics egipcis",ca:1,l:"Egipte",ty:"logo",a:-3200,b:394,s:700,sT:"~700 signes"},
    {n:"Lineal B",ca:1,cb:1,l:"Creta i Grècia",ty:"sil",a:-1400,b:-1200,s:87,sT:"87–90 síl·labes"},
    {n:"Xinesa",ca:1,l:"Xina",ty:"logo",a:-1250,b:null,s:3500,sT:"~3.500 d'ús diari"},
    {n:"Fenícia",ca:1,cb:1,l:"Llevant",ty:"abjad",a:-1050,b:-50,fade:true,s:22,sT:"22 lletres"},
    {n:"Grega",ca:1,l:"Grècia",ty:"alfa",a:-800,b:null,s:24,sT:"24 lletres"},
    {n:"Llatina",ca:1,l:"Itàlia",ty:"alfa",a:-700,b:null,s:26,sT:"26 lletres",me:true},
    {n:"Maia",ca:1,cb:1,l:"Mesoamèrica",ty:"logosil",a:-300,b:1700,fade:true,s:800,sT:"~800 signes"},
    {n:"Rúnica",ca:1,cb:1,l:"Nord d'Europa",ty:"alfa",a:200,b:1600,fade:true,s:24,sT:"24 runes"},
    {n:"Àrab",l:"Aràbia",ty:"abjad",a:512,b:null,s:28,sT:"28 lletres"},
    {n:"Hangul",l:"Corea",ty:"trets",a:1443,b:null,s:24,sT:"24 lletres"}
  ]
};
// icones de línia, dibuixades en un quadre de 20 × 20
function icon13(g,ty,col){
  const P=d=>g.append("path").attr("d",d).attr("fill","none").attr("stroke",col).attr("stroke-width",1.1).attr("stroke-linecap","round").attr("stroke-linejoin","round");
  if(ty==="logo"){ P("M2,10C5,4 15,4 18,10C15,16 5,16 2,10Z"); g.append("circle").attr("cx",10).attr("cy",10).attr("r",2.6).attr("fill",col); }   // un ull
  else if(ty==="logosil"){ ["M3,4L7,6L3,8Z","M9,9L13,11L9,13Z","M3,13L7,15L3,17Z","M13,3L17,5L13,7Z","M13,14L17,16L13,18Z"].forEach(P); }          // falques
  else if(ty==="sil"){ P("M2,4H18V16H2Z"); P("M6,7V13M6,10H9M12,7L14,13L16,7"); }                                                                  // síl·laba en un quadre
  else if(ty==="abjad"){ P("M17,6C14,13 9,14 4,11"); g.append("circle").attr("cx",9).attr("cy",4).attr("r",1.1).attr("fill",col); P("M4,16H17"); }  // traç d'abjad
  else if(ty==="alfa"){ P("M4,17L10,3L16,17M6.5,11.5H13.5"); }                                                                                     // A
  else { P("M3,3H9V9H3"); P("M12,3V9M12,6H17"); P("M5,12H15V17H5Z"); }                                                                             // síl·laba hangul
}
piece("time-13",(el,w)=>{
  const mob=w<640, R=T13.rows, rowH=mob?44:40, left=mob?126:200, right=mob?54:110, top=40, bot=78;
  const H=top+R.length*rowH+bot;
  const s=V.svg(el,w,H,"Cronologia d'onze escriptures del món, de la cuneïforme (c. 3200 aC) al hangul (1443): quan van començar, quan es van deixar d'escriure i quants signes tenen.");
  const tp=V.tip(el);
  const x=d3.scaleLinear([-3400,2026],[left,w-right]);
  const g=s.append("g");
  // franges d'època (context): l'edat del bronze al Pròxim Orient i la impremta
  const bands=[{a:-3300,b:-1200,t:"Edat del bronze"}];
  bands.forEach(b=>{ g.append("rect").attr("x",x(b.a)).attr("y",top-8).attr("width",x(b.b)-x(b.a)).attr("height",R.length*rowH+8).attr("fill",V.alpha(C.ink,.035));
    V.t(g,x(b.a)+4,top-14,b.t,{size:11,italic:true,fill:C.muted}); });
  // eix
  const ticks=mob?[-3000,-1000,0,1000,2000]:[-3000,-2000,-1000,0,1000,2000];
  ticks.forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",top-4).attr("y2",top+R.length*rowH).attr("stroke",v===0?C.ghost:C.grid).attr("stroke-width",.6);
    V.t(g,x(v),top+R.length*rowH+16,v===0?"0":yr(v),{size:11.5,anchor:"middle",fill:C.muted}); });
  g.append("line").attr("x1",x(2026)).attr("x2",x(2026)).attr("y1",top-4).attr("y2",top+R.length*rowH+4).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
  V.t(g,x(2026),top-14,"avui",{size:11.5,anchor:"end",fill:C.ink2});
  // impremta (Gutenberg, c. 1450)
  g.append("line").attr("x1",x(1450)).attr("x2",x(1450)).attr("y1",top-4).attr("y2",top+R.length*rowH).attr("stroke",C.ink).attr("stroke-opacity",.35).attr("stroke-width",.7);
  if(!mob) V.t(g,x(1450)-4,top-14,"impremta",{size:11,italic:true,anchor:"end",fill:C.muted});
  const sz=d3.scaleSqrt([0,3500],[0,mob?11:15]);
  if(!mob) V.t(g,w-right/2,top-14,"signes",{size:11.5,anchor:"middle",fill:C.muted});
  const rows=g.selectAll("g.r").data(R).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${top+i*rowH+rowH/2})`);
  rows.each(function(d,i){
    const r=d3.select(this), alive=d.b==null, col=d.me?C.red:alive?C.blue:C.ink2, end=alive?2026:d.b;
    icon13(r.append("g").attr("transform",`translate(0,-10)`),d.ty,d.me?C.red:C.ink);
    V.t(r,26,-2,d.n,{size:12.5,weight:700,fill:d.me?C.red:C.ink});
    V.t(r,26,12,mob?T13.types[d.ty].t:`${d.l} · ${T13.types[d.ty].t}`,{size:11,fill:C.muted});
    // barra: plena si encara s'escriu (fins avui, amb fletxa), ratllada si es va deixar d'escriure; vora esvaïda si la data final és difusa
    const x0=x(d.a), x1=x(end), bh=9;
    const id="g13"+i;
    if(d.fade){ const lg=s.append("defs").append("linearGradient").attr("id",id).attr("x1",0).attr("x2",1);
      lg.append("stop").attr("offset",0).attr("stop-color",col).attr("stop-opacity",.42); lg.append("stop").attr("offset",.7).attr("stop-color",col).attr("stop-opacity",.42); lg.append("stop").attr("offset",1).attr("stop-color",col).attr("stop-opacity",0); }
    const bar=r.append("rect").attr("class","bar").attr("x",x0).attr("y",-bh/2).attr("height",bh).attr("rx",bh/2)
      .attr("width",el.__seen||V.reduced?Math.max(2,x1-x0):0)
      .attr("fill",d.fade?`url(#${id})`:V.alpha(col,alive?.85:.42)).attr("stroke",d.fade?"none":col).attr("stroke-width",.8);
    bar.datum(Object.assign({},d,{w:Math.max(2,x1-x0)}));
    if(alive) r.append("path").attr("d",`M${x1-1},${-bh/2-3}L${x1+5},0L${x1-1},${bh/2+3}`).attr("fill","none").attr("stroke",col).attr("stroke-width",1.1).attr("class","arrow").attr("opacity",el.__seen||V.reduced?1:0);
    const lab=alive?`des del ${yrc(d.a,d.ca).replace(" dC","")}`:`${yrc(d.a,d.ca)} – ${yrc(d.b,d.cb)}`;
    // rètol de dates: a l'esquerra si dura fins avui; si no, a la dreta, i a l'esquerra només si no hi cap
    const tw=lab.length*5.7, fitsR=x1+6+tw<w-right+(mob?10:0), fitsL=x0-6-tw>left;
    if(!fitsR&&!fitsL) V.t(r,x0,-9,lab,{size:11,fill:C.ink2,halo:true});      // no hi cap al costat: a sobre de la barra
    else { const onLeft=alive?fitsL:!fitsR;
      V.t(r,onLeft?x0-6:(alive?x1+10:x1+6),4,lab,{size:11,anchor:onLeft?"end":"start",fill:C.ink2,halo:true}); }
    r.append("circle").attr("cx",w-right/2).attr("cy",0).attr("r",Math.max(1.4,sz(d.s))).attr("fill",V.alpha(col,.16)).attr("stroke",col).attr("stroke-width",.9);
    if(!mob) V.t(r,w-right/2+18,4,f0(d.s),{size:11,fill:C.ink2});
  });
  // claudàtors: els jeroglífics van durar més que tot el temps que ens separa del naixement de Crist
  const by=top+R.length*rowH+34;
  function brk(a,b,y,txt,col,anc){ const p=d3.path(); p.moveTo(x(a),y-5); p.lineTo(x(a),y); p.lineTo(x(b),y); p.lineTo(x(b),y-5);
    g.append("path").attr("d",p.toString()).attr("fill","none").attr("stroke",col).attr("stroke-width",.9);
    V.lines(g,anc==="end"?x(b):anc==="start"?x(a):(x(a)+x(b))/2,y+15,txt,{size:11.5,anchor:anc||"middle",fill:col}); }
  brk(-3200,394,by,[[`${f0(394+3200)} anys`,true],["els jeroglífics, en ús"]],C.ink,"middle");
  brk(-700,2026,by+44,[[`${f0(2026+700)} anys`,true,C.red],[mob?"la llatina, fins avui":"la llatina, la que llegeixes ara"]],C.red,mob?"end":"middle");
  // entrada: les barres creixen d'esquerra a dreta
  V.onView(el,now=>{ if(now)return;
    rows.selectAll("rect.bar").transition().duration(1300).delay((d,i,n)=>R.indexOf(R.find(q=>q.n===d.n))*90).ease(d3.easeCubicOut).attr("width",d=>d.w);
    rows.selectAll("path.arrow").transition().delay(1300).duration(300).attr("opacity",1); });
  // hover per fila
  V.hover(s.node(),(ev,[mx,my])=>{ const i=Math.floor((my-top)/rowH);
    if(i<0||i>=R.length){ V.focus(rows,null); tp.hide(); return; }
    const d=R[i]; V.focus(rows,q=>q===d);
    tp.show(`<b>${d.n}</b> (${d.l}) · ${T13.types[d.ty].t}: ${T13.types[d.ty].d} · ${d.b==null?`des del ${yrc(d.a,d.ca)}`:`${yrc(d.a,d.ca)} – ${yrc(d.b,d.cb)}`} · ${d.sT}`);
  },()=>{ V.focus(rows,null); tp.hide(); });
  el.style.height=(H+44)+"px"; s.attr("height",H+44).attr("viewBox",`0 0 ${w} ${H+44}`);
});

/* =====================================================================
   TIME-14 · CARRILS D'ESTAT  (dades reals)
   A dalt, vinyetes del que la gent hi ha vist o hi ha fet; a sota, carrils amb l'estat físic i d'ús
   d'un objecte al llarg del temps (dret, caigut, tancat, refet). L'eix es trenca on no passa res.
   Exemple: la catedral de Notre-Dame de París, 1163–2024. En pantalla estreta, columna vertical.
   ===================================================================== */
const N14={
  events:[
    {y:1163,t:"Es comença la catedral",d:"primera pedra del cor, amb el bisbe Maurice de Sully",k:"obra"},
    {y:1345,t:"S'acaben les obres",d:"c. 1345, gairebé dos segles després",k:"obra"},
    {y:1786,t:"Es desmunta l'agulla",d:"entre 1786 i 1792; la primera, del segle XIII, era malmesa",k:"agulla"},
    {y:1793,t:"Temple de la Raó",d:"10 de novembre de 1793: la Revolució la fa temple laic",k:"us"},
    {y:1802,t:"Torna el culte",d:"després del Concordat de 1801",k:"us"},
    {y:1804,t:"Napoleó s'hi corona",d:"2 de desembre de 1804",k:"vist"},
    {y:1831,t:"La novel·la de Victor Hugo",d:"«Notre-Dame de Paris» desperta el desig de salvar-la",k:"vist"},
    {y:1844,t:"Restauració de Viollet-le-Duc",d:"1844–1864, amb Lassus",k:"obra"},
    {y:1859,t:"L'agulla nova",d:"de Viollet-le-Duc, inaugurada el 15 d'agost de 1859",k:"agulla"},
    {y:2019,t:"L'incendi",d:"15 d'abril de 2019: cauen l'agulla i la coberta",k:"foc"},
    {y:2024,t:"Reobertura",d:"7 de desembre de 2024, amb l'agulla i la coberta refetes",k:"obra"}
  ],
  vignettes:[{y:1163,k:"facana",t:"Una catedral gòtica"},{y:1793,k:"rao",t:"Temple de la Raó"},{y:1831,k:"llibre",t:"Novel·la de Hugo"},{y:1859,k:"agulla",t:"L'agulla nova"},{y:2019,k:"foc",t:"L'incendi"},{y:2024,k:"obert",t:"Reobertura"}],
  lanes:[
    {t:"L'agulla",seg:[[1230,1786,"dreta"],[1786,1859,"no"],[1859,2019,"dreta"],[2019,2024,"no"],[2024,2030,"dreta"]],ev:[[1786,"fora"],[2019,"cau"],[1859,"puja"],[2024,"puja"]]},
    {t:"La coberta de fusta",seg:[[1220,2019,"dreta"],[2019,2024,"no"],[2024,2030,"dreta"]],ev:[[2019,"cau"],[2024,"puja"]]},
    {t:"Culte catòlic",seg:[[1163,1793,"dreta"],[1793,1802,"no"],[1802,2019,"dreta"],[2019,2024,"no"],[2024,2030,"dreta"]],ev:[]},
    {t:"Obres",seg:[[1163,1345,"obra"],[1844,1864,"obra"],[2019,2024,"obra"]],ev:[]}
  ]
};
// vinyetes de línia (caixa de 44 × 36)
function vig14(g,k,col){
  const P=d=>g.append("path").attr("d",d).attr("fill","none").attr("stroke",col).attr("stroke-width",1).attr("stroke-linejoin","round").attr("stroke-linecap","round");
  if(k==="facana"){ P("M4,36V10H16V36M28,36V10H40V36M16,36V18H28V36"); P("M7,14H13M31,14H37"); g.append("circle").attr("cx",22).attr("cy",24).attr("r",4).attr("fill","none").attr("stroke",col); P("M18,36V30A4,4 0 0 1 26,30V36"); }
  else if(k==="rao"){ P("M10,36H34M14,36V26H30V36"); P("M22,26C17,20 21,15 22,10C24,15 28,19 22,26Z"); }
  else if(k==="llibre"){ P("M6,10C12,8 18,9 22,12C26,9 32,8 38,10V34C32,32 26,33 22,35C18,33 12,32 6,34Z"); P("M22,12V35"); P("M10,16H18M10,20H18M26,16H34M26,20H34"); }
  else if(k==="agulla"){ P("M22,2L18,26H26Z"); P("M14,26H30V36H14Z"); P("M19,18H25M20,12H24"); }
  else if(k==="foc"){ P("M8,36H36"); P("M14,36C8,28 14,20 16,14C18,20 22,22 22,16C26,22 30,26 28,36"); P("M22,36C19,32 21,28 22,26C24,30 26,32 24,36"); }
  else { P("M6,36H38M10,36V16A12,12 0 0 1 34,16V36"); P("M22,36V20M16,36V22A6,6 0 0 1 28,22V36"); }
}
piece("time-14",(el,w)=>{
  const tp=V.tip(el);
  const E=N14.events, K={obra:C.ink,agulla:C.blue,us:C.blue,vist:C.ink2,foc:C.red};
  if(w<700){
    // ---- vertical: una fila per fet, amb la vinyeta quan n'hi ha
    const rowH=58, top=14, H=top+E.length*rowH+10;
    const s=V.svg(el,w,H,"Notre-Dame de París, de 1163 a 2024: obres, l'agulla que es desmunta i es refà, la Revolució, l'incendi de 2019 i la reobertura.");
    const ax=58;
    s.append("line").attr("x1",ax).attr("x2",ax).attr("y1",top).attr("y2",H-10).attr("stroke",C.ink2).attr("stroke-width",.9);
    const rows=s.selectAll("g.r").data(E).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${top+i*rowH+12})`);
    rows.each(function(d,i){ const r=d3.select(this), col=K[d.k];
      V.t(r,ax-10,4,String(d.y),{size:12,anchor:"end",fill:C.ink2});
      r.append("circle").attr("cx",ax).attr("cy",0).attr("r",d.k==="foc"?5:4).attr("fill",d.k==="foc"?C.red:C.paper).attr("stroke",col).attr("stroke-width",1.4);
      const vg=N14.vignettes.find(v=>v.y===d.y), tx=ax+(vg?62:16);
      if(vg) vig14(r.append("g").attr("transform","translate("+(ax+12)+",-14) scale(.9)"),vg.k,d.k==="foc"?C.red:C.ink);
      V.t(r,tx,2,d.t,{size:12.5,weight:700,fill:d.k==="foc"?C.red:C.ink});
      const words=d.d.split(" "), lines=[[]]; let len=0; const maxC=Math.max(18,Math.floor((w-tx-4)/6.2));
      words.forEach(wd=>{ if(len+wd.length>maxC){ lines.push([]); len=0; } lines[lines.length-1].push(wd); len+=wd.length+1; });
      lines.slice(0,2).forEach((l,j)=>V.t(r,tx,17+j*14,l.join(" "),{size:11.5,fill:C.ink2}));
      // talls d'eix
      if(i>0&&d.y-E[i-1].y>300){ const yy=-rowH/2+4; r.append("path").attr("d",`M${ax-6},${yy+3}L${ax+6},${yy-1}M${ax-6},${yy+7}L${ax+6},${yy+3}`).attr("stroke",C.ink2).attr("stroke-width",.9);
        V.t(r,ax+10,yy+6,`${d.y-E[i-1].y} anys després`,{size:11,italic:true,fill:C.muted}); }
    });
    if(!V.reduced&&!el.__seen){ rows.attr("opacity",0); V.onView(el,now=>{ if(now){rows.attr("opacity",1);return;} rows.transition().delay((d,i)=>i*90).duration(500).attr("opacity",1); }); }
    V.hover(s.node(),(ev,[mx,my])=>{ const i=clamp(Math.floor((my-top)/rowH),0,E.length-1), d=E[i]; V.focus(rows,q=>q===d); tp.show(`<b>${d.y} · ${d.t}</b> · ${d.d}`); },()=>{ V.focus(rows,null); tp.hide(); });
    return;
  }
  // ---- horitzontal: vinyetes, eix trencat i carrils
  const L=N14.lanes, left=150, right=16, vigH=118, axY=vigH+26, laneTop=axY+34, laneH=36, H=laneTop+L.length*laneH+30;
  const s=V.svg(el,w,H,"Notre-Dame de París, de 1163 a 2024: a dalt, sis moments; a sota, l'estat de l'agulla, de la coberta, del culte i de les obres.");
  // eix trencat: 1150–1360 i 1770–2030
  const A=[1150,1360], B=[1770,2030], gap=26, span=(A[1]-A[0])+(B[1]-B[0]), uw=(w-left-right-gap)/span;
  const x=y=>y<=A[1]?left+(clamp(y,A[0],A[1])-A[0])*uw:left+(A[1]-A[0])*uw+gap+(clamp(y,B[0],B[1])-B[0])*uw;
  const g=s.append("g");
  g.append("line").attr("x1",x(A[0])).attr("x2",x(A[1])).attr("y1",axY).attr("y2",axY).attr("stroke",C.ink2).attr("stroke-width",.9);
  g.append("line").attr("x1",x(B[0])).attr("x2",x(B[1])).attr("y1",axY).attr("y2",axY).attr("stroke",C.ink2).attr("stroke-width",.9);
  const gx=x(A[1])+gap/2; g.append("path").attr("d",`M${gx-7},${axY+5}L${gx-1},${axY-5}M${gx+1},${axY+5}L${gx+7},${axY-5}`).attr("stroke",C.ink2).attr("stroke-width",.9);
  [1200,1300,1800,1850,1900,1950,2000].forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",axY).attr("y2",axY+4).attr("stroke",C.ink2).attr("stroke-width",.8);
    g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",laneTop-10).attr("y2",laneTop+L.length*laneH-8).attr("stroke",C.grid).attr("stroke-width",.6);
    V.t(g,x(v),axY+16,String(v),{size:11,anchor:"middle",fill:C.muted}); });
  V.t(g,0,14,"Què hi han vist i què hi han fet",{size:12.5,weight:700});
  V.t(g,0,laneTop-16,"Estat de la catedral",{size:12.5,weight:700});
  // vinyetes repartides a l'ample, unides a la seva data amb una línia en colze
  const VG=N14.vignettes, slot=(w-left-right)/VG.length;
  const vgs=g.selectAll("g.vg").data(VG).join("g").attr("class","vg");
  vgs.each(function(d,i){ const r=d3.select(this), cx=left+slot*(i+.5), col=d.k==="foc"?C.red:C.ink, ev=E.find(e=>e.y===d.y);
    vig14(r.append("g").attr("transform",`translate(${cx-22},26)`),d.k,col);
    r.append("line").attr("x1",cx-34).attr("x2",cx+34).attr("y1",63).attr("y2",63).attr("stroke",C.hair).attr("stroke-width",.8);
    V.t(r,cx,80,ev.t,{size:12,weight:700,anchor:"middle",fill:col});
    V.t(r,cx,95,String(d.y),{size:11.5,anchor:"middle",fill:C.ink2});
    r.append("path").attr("d",`M${cx},101V${axY-12}H${x(d.y)}V${axY-3}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-opacity",.3).attr("stroke-width",.7);
    r.append("circle").attr("cx",x(d.y)).attr("cy",axY).attr("r",3.6).attr("fill",d.k==="foc"?C.red:C.paper).attr("stroke",col).attr("stroke-width",1.3); });
  // carrils
  const lanes=g.selectAll("g.ln").data(L).join("g").attr("class","ln").attr("transform",(d,i)=>`translate(0,${laneTop+i*laneH})`);
  lanes.each(function(d){ const r=d3.select(this);
    V.t(r,0,4,d.t,{size:12,fill:C.ink});
    r.append("line").attr("x1",left).attr("x2",w-right).attr("y1",0).attr("y2",0).attr("stroke",C.grid).attr("stroke-width",.6);
    d.seg.forEach(([a,b,st])=>{
      // en el tall de l'eix, el tram queda partit
      const parts=[]; if(a<A[1])parts.push([a,Math.min(b,A[1])]); if(b>B[0])parts.push([Math.max(a,B[0]),b]); if(a>=A[1]&&b<=B[0])return;
      parts.forEach(([p,q])=>{ if(q<=p)return;
        const ln=r.append("line").attr("class","sg").attr("x1",x(p)).attr("x2",el.__seen||V.reduced?x(q):x(p)).attr("y1",0).attr("y2",0).datum({x2:x(q)});
        if(st==="dreta") ln.attr("stroke",d.t==="L'agulla"?C.blue:C.ink).attr("stroke-width",2.4).attr("stroke-linecap","round");
        else if(st==="obra") ln.attr("stroke",V.alpha(C.yellow,.95)).attr("stroke-width",7).attr("stroke-linecap","round");
        else ln.attr("stroke",C.ink2).attr("stroke-width",1).attr("stroke-dasharray","3 3"); });
    });
    d.ev.forEach(([y,k])=>{ const cx=x(y);
      if(k==="cau"){ r.append("path").attr("d",`M${cx-4},-4L${cx+4},4M${cx+4},-4L${cx-4},4`).attr("stroke",C.red).attr("stroke-width",1.6); }
      else if(k==="fora"){ r.append("circle").attr("cx",cx).attr("cy",0).attr("r",3).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.1); }
      else { r.append("path").attr("d",`M${cx-4},4L${cx},-5L${cx+4},4Z`).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",1.1); } });
  });
  // llegenda dels carrils
  const ly=H-8, lg=g.append("g");
  [[C.blue,2.4,null,"dreta · en ús"],[C.ink2,1,"3 3","no hi és · tancada"],[V.alpha(C.yellow,.95),7,null,"obres"]].reduce((xx,[c,sw,da,t])=>{
    lg.append("line").attr("x1",xx).attr("x2",xx+20).attr("y1",ly-4).attr("y2",ly-4).attr("stroke",c).attr("stroke-width",sw).attr("stroke-dasharray",da).attr("stroke-linecap","round");
    V.t(lg,xx+26,ly,t,{size:11.5,fill:C.ink2}); return xx+26+t.length*6.2+22; },left);
  lg.append("path").attr("d",`M${w-170},${ly-8}L${w-162},${ly}M${w-162},${ly-8}L${w-170},${ly}`).attr("stroke",C.red).attr("stroke-width",1.6);
  V.t(lg,w-156,ly,"cau o es crema",{size:11.5,fill:C.ink2});
  // entrada: els carrils es dibuixen
  V.onView(el,now=>{ if(now)return; g.selectAll("line.sg").transition().duration(1500).delay((d,i)=>i*60).ease(d3.easeCubicOut).attr("x2",d=>d.x2);
    vgs.attr("opacity",0).transition().delay((d,i)=>300+i*120).duration(500).attr("opacity",1); });
  // hover: el fet més proper en x
  const xs=E.map(e=>x(e.y));
  V.hover(s.node(),(ev,[mx,my])=>{
    let i=d3.leastIndex(xs,v=>Math.abs(v-mx)); const d=E[i];
    if(Math.abs(xs[i]-mx)>40){ V.focus(vgs,null); tp.hide(); return; }
    V.focus(vgs,q=>q.y===d.y);
    tp.show(`<b>${d.y} · ${d.t}</b> · ${d.d}`);
  },()=>{ V.focus(vgs,null); tp.hide(); });
});
})();
