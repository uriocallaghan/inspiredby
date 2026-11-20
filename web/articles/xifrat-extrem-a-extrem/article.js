/* «El sobre que ningú no pot obrir» — gràfics de l'article (d3 7.9.0 + IBV).
   Peces del sistema: LINK-03 + HOW-01 (V1), LINK-01 (V2), LINK-04 (V3), SCALE-04 (V4), TIME-14 (V5), TIME-13 (V6), PART-01 (V7).
   Vegeu research/xifrat-extrem-a-extrem/pla-visual.md. Colors: vermell = text llegible, blau = xifrat, gris = context. */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.XIF_DATA||{};
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SUP={"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻"};
const p10=k=>"10"+String(k).split("").map(c=>SUP[c]).join("");
const sciTxt=v=>{ const k=Math.floor(Math.log10(v)+1e-9), m=v/Math.pow(10,k); return k<4?f0(v):`${f1(m)} × ${p10(k)}`; };
// alçada d'un gràfic enganxat (scrolly): a mòbil, dins del pressupost de la guia
function stickyH(w,desk){ return w<600?Math.round(Math.max(200,Math.min(window.innerHeight*.30,260))):desk; }

/* =====================================================================
   V1 · LINK-03 + HOW-01 · QUI POT LLEGIR EL TEU MISSATGE?  (esquema)
   Els missatges viatgen a poc a poc per cinc estacions. Vermell = text que es pot llegir;
   blau = xifrat. Cada pas del scroll canvia el mode: sense xifrar, xifrat en trànsit, d'extrem a extrem,
   metadades i els extrems.
   ===================================================================== */
(function cami(){
  const el=$("#cami-viz"); if(!el)return;
  const NODES=[
    {k:"a", t:"El mòbil de l'Anna"},
    {k:"w", t:"La wifi del bar"},
    {k:"o", t:"L'operador i internet"},
    {k:"s", t:"El servidor de l'app"},
    {k:"b", t:"El mòbil del Bernat"}
  ];
  // per a cada mode: qui llegeix (c = contingut, m = només metadades, 0 = res) i quins trams són en clar
  const MODES={
    clar:{read:["c","c","c","c","c"], plain:p=>true, tag:false},
    tls: {read:["c","0","0","c","c"], plain:p=>p<.18||Math.abs(p-3)<.2||p>3.82, tag:false},
    e2e: {read:["c","0","0","0","c"], plain:p=>p<.18||p>3.82, tag:false},
    meta:{read:["c","m","m","m","c"], plain:p=>p<.18||p>3.82, tag:true},
    ext: {read:["c","0","0","m","c"], plain:p=>p<.18||p>3.82, tag:false, ends:true}
  };
  const READ_TXT={c:"pot llegir el missatge", m:"veu qui, a qui i quan", 0:"només veu soroll xifrat"};
  let mode="clar", api=null;
  const lg=$("#cami-lg"); if(lg)V.legendCat(lg,[{c:C.red,t:"Es pot llegir"},{c:C.blue,t:"Va xifrat"}]);
  const N=56, T=26000;            // 56 missatges; cada un tarda 24 s a fer el camí sencer (moviment lent)
  const parts=d3.range(N).map(i=>({o:i/N+(V.rng(7+i)()-.5)*.02}));

  V.mount(el,(box,w)=>{
    if(el.__loop){ el.__loop.stop(); el.__loop=null; }
    const mob=w<600, h=stickyH(w,400);
    d3.select(box).selectAll("canvas,svg").remove();
    const {ctx}=V.canvas(box,w,h,"");
    const cv=box.querySelector("canvas.ibv"); cv.style.position="absolute"; cv.style.left="0"; cv.style.top="0"; cv.setAttribute("aria-hidden","true");
    const s=V.svg(box,w,h,"Esquema del camí d'un missatge entre dos mòbils, passant per la wifi, l'operador i el servidor de l'aplicació. Segons el tipus de xifrat, el text es pot llegir a totes les estacions, només als extrems i al servidor, o només als dos extrems.");
    s.style("position","relative");
    box.style.position="relative";
    // posicions de les estacions
    const pos=NODES.map((n,i)=>mob?{x:34,y:22+i*(h-44)/4}:{x:56+i*(w-112)/4,y:h*.42});
    const at=p=>{ const i=Math.min(3,Math.floor(p)), f=p-i; return {x:pos[i].x+(pos[i+1].x-pos[i].x)*f, y:pos[i].y+(pos[i+1].y-pos[i].y)*f}; };
    const g=s.append("g");
    // camí
    g.append("path").attr("d",d3.line()(pos.map(p=>[p.x,p.y]))).attr("fill","none").attr("stroke",C.ink).attr("stroke-opacity",.05).attr("stroke-width",mob?14:36).attr("stroke-linecap","round");
    g.append("path").attr("d",d3.line()(pos.map(p=>[p.x,p.y]))).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.8);
    const R=mob?13:30;
    const nodes=g.selectAll("g.nd").data(NODES).join("g").attr("class","nd").attr("transform",(d,i)=>`translate(${pos[i].x},${pos[i].y})`);
    nodes.append("circle").attr("class","bg").attr("r",R).attr("fill",C.ghost).attr("fill-opacity",.25).style("mix-blend-mode","multiply");
    nodes.append("circle").attr("class","ring").attr("r",R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-opacity",0);
    // icona d'ull: si la parada pot llegir
    const eye=nodes.append("g").attr("class","eye");
    eye.append("path").attr("d",`M${-R*.5},0Q0,${-R*.42} ${R*.5},0Q0,${R*.42} ${-R*.5},0Z`).attr("fill",C.paper).attr("stroke",C.ink).attr("stroke-width",.9);
    eye.append("circle").attr("r",R*.15).attr("fill",C.ink);
    const lab=nodes.append("g").attr("class","lab");
    if(mob){
      lab.each(function(d){ V.t(d3.select(this),R+12,-2,d.t,{size:12.5,weight:700}); V.t(d3.select(this),R+12,13,"",{size:11.5,fill:C.ink2}).attr("class","st"); });
    } else {
      lab.each(function(d,i){ const L=d3.select(this);
        V.t(L,0,R+22,d.t,{size:12.5,weight:700,anchor:"middle",halo:3});
        V.t(L,0,R+38,"",{size:12,fill:C.ink2,anchor:"middle",halo:3}).attr("class","st"); });
    }
    const gNote=g.append("g");
    const tp=V.tip(box);
    function apply(instant){
      const M=MODES[mode];
      nodes.each(function(d,i){
        const r=M.read[i], n=d3.select(this);
        n.select("circle.bg").transition().duration(instant?0:500)
          .attr("fill",r==="c"?C.red:r==="m"?C.redLight:C.blue).attr("fill-opacity",r==="c"?.32:r==="m"?.3:.16);
        n.select("circle.ring").transition().duration(instant?0:500).attr("stroke-opacity",M.ends&&(i===0||i===4)?1:0).attr("stroke-width",1.4);
        n.select("g.eye").transition().duration(instant?0:400).attr("opacity",r==="c"?1:r==="m"?.55:0);
        n.select("text.st").text(READ_TXT[r]);
      });
      gNote.selectAll("*").remove();
      if(mob)return;   // a mòbil, l'estat de cada parada ja és l'anotació
      const top=pos[0].y-R-34;
      const notes={
        clar:[2,"Com una postal","qualsevol que la toqui la pot llegir"],
        tls:[3,"Xifrat només de tram en tram","el servidor obre el sobre i el torna a tancar"],
        e2e:[2,"D'extrem a extrem","només els dos mòbils tenen la clau"],
        meta:[3,"El sobre porta adreça","el contingut és secret; el trànsit, no"],
        ext:[0,"El punt feble són els extrems","qui té el mòbil obert ho llegeix tot"]
      }[mode];
      const p=pos[notes[0]], anc=notes[0]===0?"start":notes[0]===4?"end":"middle";
      V.note(gNote,{x:p.x,y:p.y-R-4,tx:p.x+(anc==="start"?6:anc==="end"?-6:0),ty:top,kind:"straight",anchor:anc,lines:[[notes[1],true],[notes[2]]],valign:"bottom"});
    }
    api=apply;
    apply(true);
    // hover: què veu cada parada
    V.hover(s.node(),(ev,[mx,my])=>{
      const i=d3.leastIndex(pos,p=>Math.hypot(p.x-mx,p.y-my));
      if(Math.hypot(pos[i].x-mx,pos[i].y-my)>R+30){ V.focus(nodes,null); tp.hide(); return; }
      V.focus(nodes,(d,j)=>d===NODES[i]);
      tp.show(`<b>${NODES[i].t}</b> · ${READ_TXT[MODES[mode].read[i]]}`);
    },()=>{ V.focus(nodes,null); tp.hide(); });
    // partícules (canvas): cada missatge és un punt; vermell si es pot llegir en aquell tram, blau si va xifrat
    function frame(t){
      ctx.clearRect(0,0,w,h);
      const M=MODES[mode];
      for(const q of parts){
        const p=(((t/T)+q.o)%1+1)%1*4, xy=at(p), plain=M.plain(p);
        const jit=(q.o*997%1-.5)*(mob?10:30);
        const x=xy.x+(mob?jit:0), y=xy.y+(mob?0:jit);
        ctx.beginPath(); ctx.arc(x,y,mob?2.6:3.6,0,Math.PI*2);
        ctx.fillStyle=plain?V.alpha(C.red,.9):V.alpha(C.blue,.7); ctx.fill();
        if(M.tag&&!plain){ ctx.fillStyle=V.alpha(C.red,.85); if(mob)ctx.fillRect(x+4,y-1,6,2); else ctx.fillRect(x-1,y-10,2,6); }
      }
    }
    el.__loop=V.loop(el,frame);
  });
  const sc=$("#s-cami");
  if(sc) IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(i,st)=>{ mode=st.dataset.s; if(api)api(false); });
})();

/* =====================================================================
   V2 · LINK-01 · LA PINTURA QUE NO ES POT DESBARREJAR  (esquema de Diffie-Hellman)
   Cada pot és un grup de cercles translúcids que es barregen per multiplicació.
   ===================================================================== */
(function colors(){
  const el=$("#colors-viz"); if(!el)return;
  const Y=C.yellow, Rd=C.red, B=C.blue;
  const STEPS={
    public:[
      {id:"pA",c:0,r:0,k:[Y],t:"Color públic"},{id:"pE",c:1,r:0,k:[Y],t:"Color públic"},{id:"pB",c:2,r:0,k:[Y],t:"Color públic"}],
    secret:[
      {id:"pA",c:0,r:0,k:[Y],t:"Color públic"},{id:"pE",c:1,r:0,k:[Y],t:"Color públic"},{id:"pB",c:2,r:0,k:[Y],t:"Color públic"},
      {id:"sA",c:0,r:1,k:[Rd],t:"Secret de l'Anna",sec:1},{id:"sB",c:2,r:1,k:[B],t:"Secret del Bernat",sec:1}],
    send:[
      {id:"pA",c:0,r:0,k:[Y],t:"Color públic"},{id:"pE",c:1,r:0,k:[Y],t:"Color públic"},{id:"pB",c:2,r:0,k:[Y],t:"Color públic"},
      {id:"sA",c:0,r:1,k:[Rd],t:"Secret de l'Anna",sec:1},{id:"sB",c:2,r:1,k:[B],t:"Secret del Bernat",sec:1},
      {id:"mA",c:0,r:2,k:[Y,Rd],t:"Barreja de l'Anna"},{id:"mB",c:2,r:2,k:[Y,B],t:"Barreja del Bernat"},
      {id:"eA",c:1,r:1,k:[Y,Rd],t:"Còpia de l'Eva"},{id:"eB",c:1,r:2,k:[Y,B],t:"Còpia de l'Eva"}],
    final:[
      {id:"pA",c:0,r:0,k:[Y],t:"Color públic"},{id:"pE",c:1,r:0,k:[Y],t:"Color públic"},{id:"pB",c:2,r:0,k:[Y],t:"Color públic"},
      {id:"sA",c:0,r:1,k:[Rd],t:"Secret de l'Anna",sec:1},{id:"sB",c:2,r:1,k:[B],t:"Secret del Bernat",sec:1},
      {id:"mA",c:0,r:2,k:[Y,B],t:"Rep la del Bernat"},{id:"mB",c:2,r:2,k:[Y,Rd],t:"Rep la de l'Anna"},
      {id:"eA",c:1,r:1,k:[Y,Rd],t:"Còpia de l'Eva"},{id:"eB",c:1,r:2,k:[Y,B],t:"Còpia de l'Eva"},
      {id:"fA",c:0,r:3,k:[Y,B,Rd],t:"Clau comuna",hl:1},{id:"fB",c:2,r:3,k:[Y,Rd,B],t:"Clau comuna",hl:1}],
    eva:[
      {id:"pA",c:0,r:0,k:[Y],t:"Color públic"},{id:"pE",c:1,r:0,k:[Y],t:"Color públic"},{id:"pB",c:2,r:0,k:[Y],t:"Color públic"},
      {id:"sA",c:0,r:1,k:[Rd],t:"Secret de l'Anna",sec:1},{id:"sB",c:2,r:1,k:[B],t:"Secret del Bernat",sec:1},
      {id:"mA",c:0,r:2,k:[Y,B],t:"Rep la del Bernat"},{id:"mB",c:2,r:2,k:[Y,Rd],t:"Rep la de l'Anna"},
      {id:"eA",c:1,r:1,k:[Y,Rd],t:"Còpia de l'Eva"},{id:"eB",c:1,r:2,k:[Y,B],t:"Còpia de l'Eva"},
      {id:"fA",c:0,r:3,k:[Y,B,Rd],t:"Clau comuna",hl:1},{id:"fB",c:2,r:3,k:[Y,Rd,B],t:"Clau comuna",hl:1},
      {id:"fE",c:1,r:3,k:[Y,Rd,Y,B],t:"L'Eva: massa groc",bad:1}]
  };
  const NAMES={0:"Anna",1:"Eva escolta",2:"Bernat"};
  let step="public", api=null;
  V.mount(el,(box,w)=>{
    const mob=w<600, h=stickyH(w,430);
    const s=V.svg(box,w,h,"Esquema de l'intercanvi de claus de Diffie i Hellman amb pintures: l'Anna i el Bernat comparteixen un color públic, hi barregen cadascun un color secret, s'intercanvien les barreges i, afegint-hi el seu secret, obtenen el mateix color. L'Eva, que ho veu tot, no el pot reproduir.");
    const g=s.append("g");
    const top=mob?20:34, rowH=(h-top-(mob?6:14))/4;
    const cx=c=>w*(c===0?.18:c===1?.5:.82);
    const cy=r=>top+rowH*(r+.42);
    const pr=Math.min(mob?12:24,rowH*.3);
    // zona del canal públic
    g.append("rect").attr("x",cx(1)-w*.13).attr("y",top-4).attr("width",w*.26).attr("height",h-top-2).attr("fill","none")
      .attr("stroke",C.ghost).attr("stroke-dasharray","3 3");
    [0,1,2].forEach(c=>V.t(g,cx(c),top-(mob?6:14),NAMES[c],{size:mob?12:13,weight:700,anchor:"middle",fill:c===1?C.ink2:C.ink}));
    const gArr=g.append("g"), gPots=g.append("g"), gLab=g.append("g");
    const tp=V.tip(box);
    function potCircles(k){ const n=k.length, d=n===1?0:pr*.5; return k.map((c,i)=>({c,dx:n===1?0:d*Math.cos(-Math.PI/2+i*2*Math.PI/n),dy:n===1?0:d*Math.sin(-Math.PI/2+i*2*Math.PI/n)})); }
    function apply(instant){
      const L=STEPS[step], dur=instant||V.reduced?0:700;
      const pots=gPots.selectAll("g.pot").data(L,d=>d.id);
      pots.exit().transition().duration(dur/2).style("opacity",0).remove();
      const en=pots.enter().append("g").attr("class","pot").style("opacity",0)
        .attr("transform",d=>`translate(${cx(d.c)},${cy(d.r)})`);
      const all=en.merge(pots);
      all.each(function(d){
        const q=d3.select(this);
        const cs=q.selectAll("circle.ink").data(potCircles(d.k));
        cs.exit().remove();
        cs.enter().append("circle").attr("class","ink").attr("r",0).style("mix-blend-mode","multiply")
          .merge(cs).transition().duration(dur).attr("cx",c=>c.dx).attr("cy",c=>c.dy).attr("r",pr*(d.k.length>1?.78:.9))
          .attr("fill",c=>c.c).attr("fill-opacity",c=>c.c===Y?.62:.5);
        q.selectAll("circle.ring").remove();
        if(d.hl) q.insert("circle",":first-child").attr("class","ring").attr("r",pr*1.55).attr("fill",C.ink).attr("fill-opacity",.08);
      });
      all.transition().duration(dur).style("opacity",1).attr("transform",d=>`translate(${cx(d.c)},${cy(d.r)})`);
      gLab.selectAll("*").remove();
      L.forEach(d=>{ const lbl=mob?d.t.replace("Secret de l'Anna","Secret").replace("Secret del Bernat","Secret").replace("Barreja de l'Anna","Barreja").replace("Barreja del Bernat","Barreja").replace("Rep la del Bernat","Rebuda").replace("Rep la de l'Anna","Rebuda").replace("Còpia de l'Eva","Còpia").replace("Color públic","Públic").replace("L'Eva: massa groc","Massa groc"):d.t;
        V.t(gLab,cx(d.c),cy(d.r)+pr*(d.hl||d.bad?1.5:1.05)+12,lbl,{size:11.5,weight:d.hl?700:400,anchor:"middle",fill:d.sec?C.ink:C.ink2,italic:!!d.sec,halo:3}); });
      // fletxes de l'intercanvi
      gArr.selectAll("*").remove();
      if(step!=="public"&&step!=="secret"){
        const y=cy(2), a=cx(0)+pr*1.4, b=cx(2)-pr*1.4;
        const arr=(x1,x2,yy,bend)=>{ gArr.append("path").attr("d",`M${x1},${yy}Q${(x1+x2)/2},${yy+bend} ${x2},${yy}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.9).attr("stroke-dasharray","4 3");
          const dir=Math.sign(x2-x1); gArr.append("path").attr("d",`M${x2-dir*6},${yy-4}L${x2},${yy}L${x2-dir*6},${yy+4}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.9); };
        arr(a,b,y-pr*.2,-rowH*.55); arr(b,a,y+pr*.2,rowH*.5);
      }
    }
    api=apply; apply(true);
    V.hover(s.node(),(ev,[mx,my])=>{
      const L=STEPS[step], d=d3.least(L,q=>Math.hypot(cx(q.c)-mx,cy(q.r)-my));
      if(!d||Math.hypot(cx(d.c)-mx,cy(d.r)-my)>pr*2.2){ V.focus(gPots.selectAll("g.pot"),null); tp.hide(); return; }
      V.focus(gPots.selectAll("g.pot"),q=>q===d);
      const who={0:"L'Anna",1:"L'Eva",2:"El Bernat"}[d.c];
      const what=d.k.map(c=>c===Y?"groc":c===Rd?"vermell":"blau").join(" + ");
      tp.show(`<b>${d.t}</b> · ${who} té: ${what}${d.sec?" (no surt mai de casa)":""}`);
    },()=>{ V.focus(gPots.selectAll("g.pot"),null); tp.hide(); });
  });
  const sc=$("#s-colors");
  if(sc) IB.scrolly(sc.querySelector(".steps"),sc.querySelector(".graphic"),(i,st)=>{ step=st.dataset.s; if(api)api(false); });
})();

/* =====================================================================
   V3 · LINK-04 · EL RELLOTGE DE 23 HORES  (càlcul real amb nombres petits)
   p = 23, g = 5. Les potències de 5 salten pel rellotge sense ordre aparent.
   ===================================================================== */
(function rellotge(){
  const el=$("#rell-viz"); if(!el)return;
  const P=23, G=5;
  const pw=(b,e)=>{ let r=1; for(let i=0;i<e;i++)r=r*b%P; return r; };
  const seq=e=>d3.range(1,e+1).map(i=>pw(G,i));
  const st={a:6,b:15};
  const lg=$("#rell-lg"); if(lg)V.legendCat(lg,[{c:C.red,t:"Salts de l'Anna",kind:"line",w:1.4},{c:C.blue,t:"Salts del Bernat",kind:"line",w:1.4},{c:C.ink,t:"Clau comuna",a:.25}]);
  const ra=$("#rell-a"), rb=$("#rell-b"), oa=$("#rell-a-o"), ob=$("#rell-b-o"), out=$("#rell-calc");
  let api=null;
  function text(){
    const A=pw(G,st.a), B=pw(G,st.b), sA=pw(B,st.a), sB=pw(A,st.b);
    out.innerHTML=`<span class="r">Anna</span> (secret ${st.a}): 5<sup>${st.a}</sup> → posició <b>${A}</b>, i l'envia · `+
      `<span class="b">Bernat</span> (secret ${st.b}): 5<sup>${st.b}</sup> → posició <b>${B}</b>, i l'envia<br>`+
      `L'Anna salta ${st.a} vegades des del ${B}: <b>${sA}</b> · el Bernat salta ${st.b} vegades des del ${A}: <b>${sB}</b> · `+
      `<b>clau comuna: ${sA}</b>. L'Eva només ha vist el ${A} i el ${B}.`;
    oa.textContent=st.a; ob.textContent=st.b;
    ra.setAttribute("aria-valuetext",`Secret de l'Anna: ${st.a}, posició pública ${A}`);
    rb.setAttribute("aria-valuetext",`Secret del Bernat: ${st.b}, posició pública ${B}`);
  }
  V.mount(el,(box,w)=>{
    const mob=w<600, h=mob?Math.min(w,360):440;
    const s=V.svg(box,w,h,"Rellotge de 23 posicions amb els salts de les potències de 5: el camí de l'Anna en vermell, el del Bernat en blau i la clau comuna marcada en tinta. Els salts no segueixen cap ordre visible, i per això és difícil desfer-los.");
    const g=s.append("g").attr("transform",`translate(${w/2},${h/2})`);
    const Rr=Math.min(w,h)/2-(mob?30:44);
    const ang=k=>-Math.PI/2+k/P*2*Math.PI;
    const xy=(k,r)=>[Math.cos(ang(k))*(r||Rr),Math.sin(ang(k))*(r||Rr)];
    g.append("circle").attr("r",Rr).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.9);
    const ticks=g.selectAll("g.tk").data(d3.range(P)).join("g").attr("class","tk");
    ticks.append("circle").attr("cx",k=>xy(k)[0]).attr("cy",k=>xy(k)[1]).attr("r",2).attr("fill",C.ghost);
    ticks.each(function(k){ const [x,y]=xy(k,Rr+(mob?14:18)); V.t(d3.select(this),x,y+4,String(k),{size:mob?11:12,anchor:"middle",fill:C.muted}); });
    const gA=g.append("g"), gB=g.append("g"), gS=g.append("g");
    const tp=V.tip(box);
    function chords(gg,e,col,instant){
      gg.selectAll("*").remove();
      const pts=[1].concat(seq(e));   // de l'1 (5⁰) a 5^e
      const line=d3.line().curve(d3.curveCatmullRom.alpha(.5));
      for(let i=1;i<pts.length;i++){
        const a=xy(pts[i-1],Rr-4), b=xy(pts[i],Rr-4), m=[(a[0]+b[0])*.32,(a[1]+b[1])*.32];
        const p=gg.append("path").attr("d",line([a,m,b])).attr("fill","none").attr("stroke",col).attr("stroke-width",1.1)
          .attr("stroke-opacity",.25+.55*i/(pts.length-1));
        if(!instant&&!V.reduced){ const L=p.node().getTotalLength(); p.attr("stroke-dasharray",`${L} ${L}`).attr("stroke-dashoffset",L)
          .transition().delay(i*110).duration(260).ease(d3.easeCubicOut).attr("stroke-dashoffset",0); }
      }
      const end=pts[pts.length-1], [x,y]=xy(end);
      gg.append("circle").attr("cx",x).attr("cy",y).attr("r",mob?9:12).attr("fill",col).attr("fill-opacity",.35).style("mix-blend-mode","multiply");
      gg.append("circle").attr("cx",x).attr("cy",y).attr("r",3).attr("fill",col);
      return end;
    }
    function draw(instant){
      chords(gA,st.a,C.red,instant); chords(gB,st.b,C.blue,instant);
      const sh=pw(pw(G,st.b),st.a), [x,y]=xy(sh);
      gS.selectAll("*").remove();
      gS.append("circle").attr("cx",x).attr("cy",y).attr("r",mob?14:19).attr("fill",C.ink).attr("fill-opacity",.16).style("mix-blend-mode","multiply");
      const out=xy(sh,Rr*.55), anc=out[0]>0?"start":"end";
      V.note(gS,{x:x*0.93,y:y*0.93,tx:out[0],ty:out[1],kind:"straight",anchor:anc,lines:[["Clau comuna",true],[`posició ${sh}`]]});
      text();
    }
    api=draw;
    V.onView(el,now=>draw(now));
    V.hover(s.node(),(ev,[mx,my])=>{
      const x=mx-w/2, y=my-h/2, r=Math.hypot(x,y);
      if(r<Rr*.6||r>Rr+30){ tp.hide(); return; }
      let a=Math.atan2(y,x)+Math.PI/2; if(a<0)a+=2*Math.PI;
      const k=Math.round(a/(2*Math.PI)*P)%P;
      const e=d3.range(1,P).find(i=>pw(G,i)===k);
      tp.show(k===0?"<b>Posició 0</b> · les potències de 5 no hi passen mai":`<b>Posició ${k}</b> · s'hi arriba amb 5<sup>${e}</sup> (${e} salts)`);
    },()=>tp.hide());
  });
  const set=(k,v)=>{ st[k]=+v; if(api)api(false); else text(); };
  ra.addEventListener("input",()=>set("a",ra.value));
  rb.addEventListener("input",()=>set("b",rb.value));
  text();
})();

/* =====================================================================
   V4 · SCALE-04 · QUANTES CLAUS CAL PROVAR?  (dades reals i càlcul)
   Escala logarítmica de 10⁰ a 10⁸⁰: cada referència és un cercle translúcid.
   ===================================================================== */
(function claus(){
  const el=$("#claus-viz"); if(!el)return;
  const RATE=1e18;   // supòsit generós: un trilió de claus per segon
  const AGE_S=13.8e9*365.25*86400;   // edat de l'univers (Planck 2018) en segons
  const lg=$("#claus-lg"); if(lg)V.legendCat(lg,[{c:C.red,t:"Es pot trencar",a:.4},{c:C.blue,t:"Avui, fora d'abast",a:.4},{c:C.ink2,t:"Referència",a:.25}]);
  const ITEMS=(D.claus||[]).map(d=>Object.assign({},d,{k:Math.log10(d.v)}));
  function timeTxt(v){
    const sec=v/RATE;
    if(sec<1e-3)return "menys d'un mil·lisegon";
    if(sec<1)return f0(sec*1000)+" mil·lisegons";
    if(sec<120)return f0(sec)+" segons";
    if(sec<7200)return f0(sec/60)+" minuts";
    if(sec<86400*3)return f0(sec/3600)+" hores";
    const y=sec/(365.25*86400);
    if(y<2)return f0(sec/86400)+" dies";
    const ages=sec/AGE_S;
    if(ages<.01)return f0(y)+" anys";
    return `${sciTxt(y)} anys (${ages<1e4?f0(ages):sciTxt(ages)} vegades l'edat de l'univers)`;
  }
  V.mount(el,(box,w)=>{
    const mob=w<600;
    const h=mob?600:380;
    const s=V.svg(box,w,h,"Escala logarítmica del nombre de claus possibles: un PIN de quatre xifres té deu mil combinacions; una clau de 128 bits, 3,4 × 10³⁸; una de 256 bits, 1,2 × 10⁷⁷, a prop del nombre d'àtoms de l'univers observable.");
    const g=s.append("g");
    const tp=V.tip(box);
    const lo=0, hi=81;
    // a mòbil, l'eix és vertical (de dalt a baix); a escriptori, horitzontal
    const A=mob?d3.scaleLinear([lo,hi],[24,h-24]):d3.scaleLinear([lo,hi],[36,w-36]);
    const base=mob?62:h*.5;
    const P=k=>mob?[base,A(k)]:[A(k),base];
    // eix
    if(mob) g.append("line").attr("x1",base).attr("x2",base).attr("y1",A(lo)).attr("y2",A(hi)).attr("stroke",C.hair);
    else g.append("line").attr("x1",A(lo)).attr("x2",A(hi)).attr("y1",base).attr("y2",base).attr("stroke",C.hair);
    d3.range(0,81,10).forEach(k=>{ const [x,y]=P(k);
      if(mob){ g.append("line").attr("x1",x-4).attr("x2",x+4).attr("y1",y).attr("y2",y).attr("stroke",C.muted);
        V.t(g,x-10,y+4,k===0?"1":p10(k),{size:11.5,anchor:"end",fill:C.muted}); }
      else { g.append("line").attr("x1",x).attr("x2",x).attr("y1",y-4).attr("y2",y+4).attr("stroke",C.muted);
        V.t(g,x,y+20,k===0?"1":p10(k),{size:11.5,anchor:"middle",fill:C.muted}); } });
    if(!mob) V.t(g,A(lo),22,"Combinacions possibles, en escala logarítmica: cada marca multiplica per deu mil milions →",{size:11.5,anchor:"start",fill:C.muted});
    else V.t(g,base-10,12,"combinacions (escala log.) ↓",{size:11.5,anchor:"start",fill:C.muted});
    const rS=d3.scaleLinear([0,81],[mob?6:7,mob?18:34]);
    if(mob){ // etiquetes separades almenys 34 px, en ordre
      const gapL=34; let prev=-1e9;
      ITEMS.forEach(d=>{ d._ly=Math.max(P(d.k)[1],prev+gapL); prev=d._ly; });
      let nxt=h-26+gapL; for(let i=ITEMS.length-1;i>=0;i--){ ITEMS[i]._ly=Math.min(ITEMS[i]._ly,nxt-gapL); nxt=ITEMS[i]._ly; }
    }
    const pts=g.selectAll("g.pt").data(ITEMS).join("g").attr("class","pt").style("cursor","pointer");
    pts.each(function(d,i){
      const q=d3.select(this), [x,y]=P(d.k), col=d.ctx?C.ink2:d.broken?C.red:C.blue, r=rS(d.k);
      q.append("circle").attr("class","halo").attr("cx",x).attr("cy",y).attr("r",el.__seen||V.reduced?r:0).attr("fill",col).attr("fill-opacity",d.ctx?.14:.26).style("mix-blend-mode","multiply");
      q.append("circle").attr("cx",x).attr("cy",y).attr("r",3).attr("fill",col).attr("stroke",C.paper).attr("stroke-width",1);
      if(mob){
        const ly=d._ly;
        q.append("path").attr("d",`M${x+rS(d.k)*.6},${y}C${x+20},${y} ${x+12},${ly-4} ${x+26},${ly-4}`).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.7);
        V.t(q,x+30,ly-2,d.t,{size:12.5,weight:700,fill:C.ink,halo:3});
        V.t(q,x+30,ly+12,d.m,{size:11.5,fill:C.ink2,halo:3});
      } else {
        const up=!!d.up, yy=up?base-44-d.lv*36:base+58+d.lv*36;
        q.append("line").attr("x1",x).attr("x2",x).attr("y1",up?y-r-2:y+r+2).attr("y2",up?yy+6:yy-14).attr("stroke",C.hair).attr("stroke-width",.7);
        const anc=x<90?"start":x>w-120?"end":"middle";
        V.t(q,x,yy-(up?14:0),d.t,{size:12.5,weight:700,anchor:anc,halo:3});
        V.t(q,x,yy+(up?0:14),d.m,{size:11.5,fill:C.ink2,anchor:anc,halo:3});
      }
    });
    V.onView(el,now=>{ if(now)return;
      pts.select("circle.halo").transition().delay((d,i)=>i*160).duration(800).ease(d3.easeCubicOut).attr("r",d=>rS(d.k)); });
    V.hover(s.node(),(ev,[mx,my])=>{
      const d=d3.least(ITEMS,q=>{ const [x,y]=P(q.k); return mob?Math.abs(y-my):Math.abs(x-mx); });
      const [x,y]=P(d.k);
      if((mob?Math.abs(y-my):Math.abs(x-mx))>36){ V.focus(pts,null); tp.hide(); return; }
      V.focus(pts,q=>q===d);
      tp.show(d.ctx?`<b>${d.t}</b> · ${d.m}`:`<b>${d.t}</b> · ${sciTxt(d.v)} combinacions · provar-les totes a un trilió per segon: ${timeTxt(d.v)}`);
    },()=>{ V.focus(pts,null); tp.hide(); });
  });
})();

/* =====================================================================
   V5 · TIME-14 · EL DOBLE TRINQUET: QUÈ PERDS SI ET ROBEN UNA CLAU  (esquema de protocol)
   Dos carrils (Anna i Bernat), dotze missatges. Toca un missatge: l'atacant copia l'estat del mòbil
   just abans d'enviar-lo. Vermell = l'atacant el pot llegir; blau = continua protegit.
   ===================================================================== */
(function trinquet(){
  const el=$("#trinq-viz"); if(!el)return;
  const SEQ="AAABBABBBAAB".split("");
  const MSG=SEQ.map((who,i)=>({i,who,run:0}));
  let run=0; MSG.forEach((m,i)=>{ if(i>0&&m.who!==MSG[i-1].who)run++; m.run=run; });
  let mode="doble", stolen=4;
  const lg=$("#trinq-lg"); if(lg)V.legendCat(lg,[{c:C.red,t:"L'atacant el pot llegir",a:.6},{c:C.blue,t:"Continua protegit",a:.4}]);
  function exposed(m){
    if(mode==="una")return true;
    if(m.i<stolen)return false;                     // el passat queda protegit (les claus velles s'esborren)
    if(mode==="simple")return true;                 // sense renovar el secret, tot el futur cau
    const r0=MSG[stolen].run;                       // doble trinquet: la tanda en curs i la resposta següent
    return m.run===r0||m.run===r0+1;
  }
  let api=null;
  V.mount(el,(box,w)=>{
    const mob=w<600, n=MSG.length;
    const ml=mob?58:96, mr=mob?12:30, top=mob?34:40, lane=mob?62:74, h=top+lane*2+(mob?64:66);
    const s=V.svg(box,w,h,"Dues files de missatges entre l'Anna i el Bernat. Si algú copia l'estat del mòbil en un moment donat, amb una sola clau fixa ho pot llegir tot; amb una clau nova per missatge, tot el que ve després; amb el doble trinquet de Signal, només uns quants missatges fins que la conversa es cura sola.");
    const g=s.append("g");
    const x=d3.scalePoint(d3.range(n),[ml+10,w-mr-10]);
    const ly=who=>top+(who==="A"?lane*.5:lane*1.5);
    V.t(g,8,ly("A")+4,"Anna",{size:12.5,weight:700}); V.t(g,8,ly("B")+4,"Bernat",{size:12.5,weight:700});
    ["A","B"].forEach(k=>g.append("line").attr("x1",ml).attr("x2",w-mr).attr("y1",ly(k)).attr("y2",ly(k)).attr("stroke",C.grid));
    // canvis de torn = renovació Diffie-Hellman (la «roda gran» del trinquet)
    const gT=g.append("g");
    MSG.forEach((m,i)=>{ if(i>0&&m.run!==MSG[i-1].run){ const xx=(x(i)+x(i-1))/2;
      gT.append("line").attr("x1",xx).attr("x2",xx).attr("y1",top-6).attr("y2",top+lane*2+4).attr("stroke",C.ghost).attr("stroke-dasharray","2 3"); } });
    if(!mob) V.t(g,(x(2)+x(3))/2,top-12,"nova clau Diffie-Hellman a cada torn",{size:11.5,italic:true,fill:C.muted,anchor:"start"});
    const gL=g.append("g");
    const R=mob?8:11;
    const dots=g.selectAll("g.m").data(MSG).join("g").attr("class","m").style("cursor","pointer")
      .attr("transform",d=>`translate(${x(d.i)},${ly(d.who)})`);
    dots.append("circle").attr("class","f").attr("r",R).style("mix-blend-mode","multiply");
    dots.append("circle").attr("class","c").attr("r",2.4);
    dots.append("rect").attr("x",-R).attr("y",-R).attr("width",2*R).attr("height",2*R).attr("fill","transparent");
    const thief=g.append("g").attr("class","thief");
    const tp=V.tip(box);
    function apply(instant){
      const dur=instant||V.reduced?0:450;
      dots.select("circle.f").transition().duration(dur).delay(d=>instant?0:Math.abs(d.i-stolen)*40)
        .attr("fill",d=>exposed(d)?C.red:C.blue).attr("fill-opacity",d=>exposed(d)?.55:.3);
      dots.select("circle.c").transition().duration(dur).attr("fill",d=>exposed(d)?C.red:C.blue);
      thief.selectAll("*").remove();
      const xx=x(stolen), yy=ly(MSG[stolen].who);
      dots.select("circle.f").attr("stroke",d=>d.i===stolen?C.ink:null).attr("stroke-width",d=>d.i===stolen?1.5:null);
      const nExp=MSG.filter(exposed).length;
      gL.selectAll("*").remove();
      V.t(gL,ml,h-6,`Llegibles per a l'atacant: ${nExp} de ${n}`,{size:12.5,weight:700,fill:C.red});
      if(!mob) V.t(gL,w-mr,h-6,"Toca un missatge per triar quan es roba la clau",{size:11.5,anchor:"end",fill:C.muted});
      const below=MSG[stolen].who==="B";
      V.note(thief,{x:xx,y:yy+(below?R+6:-R-6),tx:xx+(xx>w*.6?-8:8),ty:below?top+lane*2+12:top-2,kind:"straight",anchor:xx>w*.6?"end":"start",
        lines:[[mob?"Robatori":"Aquí copien el mòbil",true]],valign:below?"top":"bottom"});
    }
    api=apply; apply(!!el.__seen||V.reduced);
    V.onView(el,now=>{ if(!now)apply(false); });
    dots.on("click",(ev,d)=>{ stolen=d.i; apply(false); });
    V.hover(s.node(),(ev,[mx,my])=>{
      const d=d3.least(MSG,q=>Math.hypot(x(q.i)-mx,ly(q.who)-my));
      if(Math.hypot(x(d.i)-mx,ly(d.who)-my)>R+16){ V.focus(dots,null); tp.hide(); return; }
      V.focus(dots,q=>q===d);
      tp.show(`<b>Missatge ${d.i+1}</b> de ${d.who==="A"?"l'Anna":"el Bernat"} · ${exposed(d)?"l'atacant el pot llegir":"protegit"}`);
      if(ev.type==="pointerdown"&&ev.pointerType!=="mouse"){ stolen=d.i; apply(false); }
    },()=>{ V.focus(dots,null); tp.hide(); });
  });
  document.querySelectorAll("#trinq-seg button").forEach(b=>b.addEventListener("click",()=>{
    mode=b.dataset.k; document.querySelectorAll("#trinq-seg button").forEach(q=>q.setAttribute("aria-pressed",q===b?"true":"false"));
    if(api)api(false);
  }));
})();

/* =====================================================================
   V6 · TIME-13 · QUANT TEMPS AGUANTA UN SECRET  (dates reals)
   Una fila per xifrat: barra des que es fa servir fins que es trenca (vermell) o fins avui (blau, amb fletxa).
   L'eix és partit: abans del 1500, comprimit.
   ===================================================================== */
(function vides(){
  const el=$("#vides-viz"); if(!el)return;
  const R=D.vides||[];
  const TY={ma:"a mà, amb paper",maq:"màquina",ord:"ordinador"};
  const lg=$("#vides-lg"); if(lg)V.legendCat(lg,[{c:C.red,t:"Trencat",a:.5},{c:C.blue,t:"Encara resisteix",a:.5}]);
  const yr=y=>y<0?`${f0(-y)} aC`:`${y}`;
  V.mount(el,(box,w)=>{
    const mob=w<600, rowH=mob?46:38, left=mob?8:190, right=mob?14:40, top=34, bot=34;
    const H=top+R.length*rowH+bot;
    const s=V.svg(box,w,H,"Cronologia de deu sistemes de xifrat, de la xifra de Cèsar al protocol de Signal: quan es van començar a fer servir i quan es van trencar. Els de paper i les màquines van caure; els matemàtics moderns encara resisteixen.");
    const g=s.append("g"), tp=V.tip(box);
    const x0=mob?left:left, x1=w-right, split=1500, xs=x0+(x1-x0)*.24;
    const x=y=>y<split?x0+(y+100)/(split+100)*(xs-x0):xs+(y-split)/(2026-split)*(x1-xs);
    // eix partit
    const ticks=mob?[0,1000,1600,1800,1900,2000]:[0,500,1000,1500,1600,1700,1800,1900,2000];
    ticks.forEach(v=>{ g.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",top-6).attr("y2",top+R.length*rowH).attr("stroke",C.grid).attr("stroke-width",.6);
      V.t(g,x(v),top-12,v===0?"any 0":String(v),{size:11.5,anchor:"middle",fill:C.muted}); });
    g.append("path").attr("d",`M${xs-3},${top+R.length*rowH+4}l3,-6l3,6`).attr("fill","none").attr("stroke",C.muted);
    V.t(g,(x0+xs)/2,top+R.length*rowH+20,"escala comprimida",{size:11,italic:true,anchor:"middle",fill:C.muted});
    g.append("line").attr("x1",x(2026)).attr("x2",x(2026)).attr("y1",top-6).attr("y2",top+R.length*rowH).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
    const rows=g.selectAll("g.r").data(R).join("g").attr("class","r").attr("transform",(d,i)=>`translate(0,${top+i*rowH+rowH*(mob?.66:.5)})`);
    rows.each(function(d){
      const r=d3.select(this), alive=d.b==null, col=alive?C.blue:C.red, xa=x(d.a), xb=x(alive?2026:d.b);
      if(mob) V.t(r,xa<w*.55?xa:xb,-12,d.n,{size:12,weight:700,anchor:xa<w*.55?"start":"end",halo:3});
      else { V.t(r,8,-1,d.n,{size:12.5,weight:700}); V.t(r,8,13,TY[d.ty],{size:11,fill:C.muted}); }
      const bw=Math.max(4,xb-xa);
      r.append("rect").attr("class","bar").attr("x",xa).attr("y",-4.5).attr("height",9).attr("rx",4.5)
        .attr("width",el.__seen||V.reduced?bw:0).datum(Object.assign({},d,{bw}))
        .attr("fill",V.alpha(col,alive?.55:.42)).attr("stroke",col).attr("stroke-width",.8);
      if(alive) r.append("path").attr("class","arrow").attr("d",`M${xb-1},-8L${xb+5},0L${xb-1},8`).attr("fill","none").attr("stroke",col).attr("stroke-width",1.1).attr("opacity",el.__seen||V.reduced?1:0);
      else r.append("circle").attr("class","arrow").attr("cx",xb).attr("cy",0).attr("r",3.2).attr("fill",C.red).attr("opacity",el.__seen||V.reduced?1:0);
      if(!mob){ const lab=alive?`des del ${yr(d.a)}`:`${d.bT}`, onR=xb+10+lab.length*5.6<w-right+30;
        V.t(r,onR?xb+(alive?10:8):xa-6,4,lab,{size:11.5,anchor:onR?"start":"end",fill:C.ink2,halo:3}); }
    });
    V.onView(el,now=>{ if(now)return;
      rows.selectAll("rect.bar").transition().duration(1100).delay(d=>R.findIndex(q=>q.n===d.n)*90).ease(d3.easeCubicOut).attr("width",d=>d.bw);
      rows.selectAll(".arrow").transition().delay((d,i)=>1100).duration(300).attr("opacity",1); });
    V.hover(s.node(),(ev,[mx,my])=>{ const i=Math.floor((my-top)/rowH);
      if(i<0||i>=R.length){ V.focus(rows,null); tp.hide(); return; }
      const d=R[i]; V.focus(rows,q=>q===d);
      tp.show(`<b>${d.n}</b> (${d.aT}) · ${d.b==null?"encara resisteix":d.bT}`);
    },()=>{ V.focus(rows,null); tp.hide(); });
  });
})();

/* =====================================================================
   V7 · PART-01 · L'EFECTE DESANIMADOR  (dades reals: Penney, 2016)
   100 cercles = les visites de maig de 2013 a 48 articles sensibles de la Wikipedia.
   Després de Snowden, en desapareixen 34 (995.085 de 2.960.778); sense l'article atípic, 25.
   ===================================================================== */
(function penney(){
  const el=$("#pen-viz"); if(!el)return;
  const TOT=2960778, DROP=995085;
  const VIEWS={abans:{gone:0,t:`Maig de 2013: ${f0(TOT)} visites al mes`},
    despres:{gone:Math.round(DROP/TOT*100),t:`Després de Snowden: ${f0(DROP)} visites menys al mes (−${f0(DROP/TOT*100)} %)`},
    sense:{gone:25,t:"Sense l'article atípic (Hamas): −25 %"}};
  let mode="abans", api=null;
  const lg=$("#pen-lg"); if(lg)V.legendCat(lg,[{c:C.blue,t:"Visites que es mantenen",a:.5},{c:C.red,t:"Visites que desapareixen",a:.5}]);
  V.mount(el,(box,w)=>{
    const mob=w<600, cols=mob?10:20, gap=mob?Math.min(31,(w-24)/cols):Math.min(30,(w-24)/cols), r=gap*.36;
    const rows=Math.ceil(100/cols), h=rows*gap+46;
    const s=V.svg(box,w,h,"Cent cercles representen les visites mensuals de maig de 2013 a 48 articles de la Wikipedia sobre terrorisme. Després de les revelacions de Snowden en desapareixen 34, i 25 si es descompta un article atípic.");
    const g=s.append("g"), ox=(w-(cols-1)*gap)/2;
    const lab=V.t(g,ox-r,16,"",{size:12.5,weight:700});
    const dots=g.selectAll("circle").data(d3.range(100)).join("circle")
      .attr("cx",i=>ox+(i%cols)*gap).attr("cy",i=>40+Math.floor(i/cols)*gap).attr("r",el.__seen||V.reduced?r:0)
      .attr("fill",C.blue).attr("fill-opacity",.45).style("mix-blend-mode","multiply");
    function apply(instant){
      const v=VIEWS[mode], first=100-v.gone, dur=instant||V.reduced?0:650;
      lab.text(v.t);
      dots.transition().duration(dur).delay(i=>instant?0:Math.max(0,i-first)*14)
        .attr("fill",i=>i>=first?C.red:C.blue).attr("fill-opacity",i=>i>=first?.22:.45)
        .attr("r",i=>i>=first?r*.72:r);
    }
    api=apply;
    V.onView(el,now=>{ if(now){ dots.attr("r",r); apply(true); return; }
      dots.transition().duration(700).delay(i=>i*6).attr("r",r).on("end",(d,i)=>{ if(i===99)apply(true); }); });
    const tp=V.tip(box);
    V.hover(s.node(),()=>{ const v=VIEWS[mode]; tp.show(`<b>${v.t}</b> · cada cercle, ${f0(TOT/100)} visites de maig de 2013`); },()=>tp.hide());
  });
  document.querySelectorAll("#pen-seg button").forEach(b=>b.addEventListener("click",()=>{
    mode=b.dataset.k; document.querySelectorAll("#pen-seg button").forEach(q=>q.setAttribute("aria-pressed",q===b?"true":"false"));
    if(api)api(false);
  }));
})();

})();
