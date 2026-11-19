/* Sistema infogràfic d'Inspired by Magazine · Formes inesperades (segona tanda): IB-45 a IB-54.
   Cada bloc «IB-nn» és una peça completa que es pot copiar a un article i adaptar.
   Fa servir assets/ib-viz.js (IBV), dades.js (ONI real, per a IB-53) i dades-creatives-b.js (IB-49). */
(function(){
"use strict";
const V=IBV, C=V.C, D=window.IBDATA||{}, DB=window.IBDATA_CREATIVESB||{};
const $=s=>document.querySelector(s);
const f0=V.fmt(",.0f"), f1=V.fmt(",.1f");
const sgn=(v,d)=>Math.abs(v)<1e-9?"0":V.signed(v,d==null?1:d);
const pct=v=>f0(v*100)+" %";
const EIO=d3.easeCubicInOut;
const DOT=c=>`<span style="color:${c}">●</span>`;
function legend(n,fn){ const el=$(`[data-lg="${n}"]`); if(el&&!el.childElementCount)fn(el); }
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,draw):{redraw(){}}; }
function layer(el,w,h,label){ // canvas a sota (molts punts) + svg a sobre (eixos, text)
  d3.select(el).selectAll("canvas.ibv,svg.ibv").remove(); el.style.height=h+"px";
  const {ctx}=V.canvas(el,w,h,label);
  const s=V.svg(el,w,h,""); s.attr("aria-hidden","true").attr("role",null).style("position","absolute").style("left",0).style("top",0);
  return {ctx,s};
}
// entrada: un sol observador per gràfic encara que es redibuixi abans de veure'l
function entry(el,cb){ if(el.__io){ el.__io.disconnect(); el.__io=null; } el.__io=V.onView(el,cb)||null; }
// botons de segment i «Reprodueix»
function seg(n,cb){ const bs=document.querySelectorAll(`[data-seg="${n}"] button`);
  bs.forEach(b=>b.addEventListener("click",()=>{ bs.forEach(o=>o.setAttribute("aria-pressed",o===b)); cb(b.dataset.k,b); })); }
function setSeg(n,k){ document.querySelectorAll(`[data-seg="${n}"] button`).forEach(o=>o.setAttribute("aria-pressed",o.dataset.k===String(k))); }
const _m=document.createElement("canvas").getContext("2d");
const _tw=new Map(); // amplades de text memoritzades (es recalculen quan carreguen les fonts)
function textW(s,size,weight){ const k=s+"|"+size+"|"+(weight||400); let v=_tw.get(k); if(v==null){ _m.font=`${weight||400} ${size}px ${V.SANS}`; v=_m.measureText(s).width; _tw.set(k,v); } return v; }
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>_tw.clear());
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// treu l'estat de hover de cop (abans d'una transició de posició, que si no l'interromp a mig camí)
const unfocus=sel=>sel.interrupt().style("opacity",null);

/* =====================================================================
   IB-45 · FLORS DE DADES  (dades d'exemple)
   Una flor per ciutat, un pètal per indicador: llargada = valor (àrea proporcional), color = tipus.
   ===================================================================== */
const T45=[{t:"Economia",c:C.vermell},{t:"Serveis",c:C.blau},{t:"Entorn",c:C.groc}];
const EDGE=c=>c===C.groc?"none":c, FILL=c=>V.alpha(c,c===C.groc?.7:.5); // el groc no fa línies fines: pètal groc sense contorn i més opac
const V45=[{k:"hab",t:"Habitatge",ty:0},{k:"feina",t:"Feina",ty:0},{k:"trans",t:"Transport",ty:1},{k:"salut",t:"Salut",ty:1},{k:"aire",t:"Aire",ty:2},{k:"verd",t:"Verd",ty:2}];
const F45=(function(){ const r=V.rng(45);
  return d3.range(24).map(i=>{ const eco=r(), srv=.3+.7*r(), o={id:i,n:"Ciutat "+(i+1)};
    const val=(b,s)=>Math.round(clamp(18+70*b+V.gauss(r)*s,6,99));
    o.hab=val(eco,9); o.feina=val(eco,12); o.trans=val(srv,10); o.salut=val(srv*.6+.4*r(),9);
    o.aire=val(1-eco*.75,10); o.verd=val(1-eco*.6,12);
    if(i===2){ o.hab=95; o.feina=90; o.aire=12; o.verd=16; }
    o.tot=d3.mean(V45,v=>o[v.k]); return o; }); })();
let order45="id";
function petal(L){ const w=L*.36; return `M0,0C${w.toFixed(2)},${(-L*.3).toFixed(2)} ${(w*.85).toFixed(2)},${(-L*.82).toFixed(2)} 0,${(-L).toFixed(2)}C${(-w*.85).toFixed(2)},${(-L*.82).toFixed(2)} ${(-w).toFixed(2)},${(-L*.3).toFixed(2)} 0,0Z`; }
legend(45,el=>{
  const d=d3.select(el).append("div").attr("class","ibv-lg");
  d.append("div").attr("class","ibv-lg-t").text("Cada pètal, un indicador (0–100)");
  const W=196,H=112,cx=98,cy=58,L=d3.scaleSqrt([0,100],[0,34]), s=d.append("svg").attr("width",W).attr("height",H).style("overflow","visible");
  V45.forEach((v,j)=>{ const a=j*60*Math.PI/180, val=[80,70,75,60,85,70][j];
    s.append("path").attr("transform",`translate(${cx},${cy}) rotate(${j*60})`).attr("d",petal(L(val))).attr("fill",FILL(T45[v.ty].c)).attr("stroke",EDGE(T45[v.ty].c)).attr("stroke-width",.8);
    const rr=L(val)+7, x=cx+Math.sin(a)*rr, y=cy-Math.cos(a)*rr, sn=Math.sin(a);
    s.append("text").attr("x",x+(Math.abs(sn)>.3?sn*2:0)).attr("y",y+(Math.cos(a)>.5?-1:Math.cos(a)<-.5?9:4)).attr("text-anchor",sn>.3?"start":sn<-.3?"end":"middle")
      .attr("font-size",11).attr("fill",C.ink2).text(v.t); });
  s.append("circle").attr("cx",cx).attr("cy",cy).attr("r",2).attr("fill",C.ink);
  V.legendCat(el,T45.map(t=>({c:t.c,t:t.t,a:.6})),{title:"Tipus"});
});
const M45=piece(45,(el,w)=>{
  const mob=w<640, cols=mob?4:8, cell=w/cols, R=Math.min(cell*(mob?.4:.36),58), top=mob?58:62, rowH=2*R+(mob?28:34), rows=Math.ceil(F45.length/cols), h=top+rows*rowH;
  const s=V.svg(el,w,h,"Vint-i-quatre flors, una per ciutat. Cada flor té sis pètals, un per indicador: la llargada és el valor i el color, el tipus (economia, serveis, entorn). La Ciutat 3 té els pètals d'economia molt llargs i els d'entorn molt curts. Dades d'exemple."), g=s.append("g");
  const L=d3.scaleSqrt([0,100],[0,R]);
  const idx=()=>{ const a=F45.slice(); if(order45!=="id")a.sort((p,q)=>q[order45]-p[order45]||p.id-q.id); const m={}; a.forEach((d,i)=>m[d.id]=i); return m; };
  const pos=i=>[(i%cols+.5)*cell, top+Math.floor(i/cols)*rowH+R+4];
  let I=idx();
  const fl=g.selectAll("g.ibx-fl").data(F45,d=>d.id).join("g").attr("class","ibx-fl").attr("transform",d=>`translate(${pos(I[d.id])})`);
  fl.append("circle").attr("r",R).attr("fill","none").attr("stroke",C.hair).attr("stroke-width",.6).attr("stroke-dasharray","1.5 3");
  const inner=fl.append("g").attr("class","in");
  const pts=inner.selectAll("path.pt").data(d=>V45.map((v,j)=>({v,j,val:d[v.k],c:T45[v.ty].c}))).join("path").attr("class","pt").attr("transform",p=>`rotate(${p.j*60})`);
  pts.attr("d",p=>petal(L(p.val))).attr("fill",p=>FILL(p.c)).attr("stroke",p=>EDGE(p.c)).attr("stroke-width",.8).attr("stroke-linejoin","round");
  inner.append("circle").attr("r",2).attr("fill",C.ink);
  fl.append("text").attr("class","nm").attr("y",R+17).attr("text-anchor","middle").attr("font-size",11.5).attr("fill",C.muted).style("font-variant-numeric","tabular-nums").text(d=>d.n);
  const vals=inner.append("g").attr("class","vals");
  const ng=s.append("g");
  function drawNote(anim){
    ng.selectAll("*").remove(); let d, lines;
    if(order45==="id"){ d=F45[2]; lines=[[d.n,true],["molta feina i habitatge, poc aire"]]; }
    else { d=F45.find(q=>I[q.id]===0); const vv=V45.find(v=>v.k===order45);
      lines=[[d.n,true],[order45==="tot"?`la mitjana més alta: ${f0(d.tot)}`:`la primera en ${vv.t.toLowerCase()}: ${d[order45]}`]]; }
    const p=pos(I[d.id]), fs=mob?12:12.5, lw=d3.max(lines,l=>textW(l[0],fs,l[1]?700:400)), off=Math.min(R+10,cell*.5), right=p[0]+off+lw+6<w;
    const a=V.note(ng,{x:p[0],y:p[1]-R-3,tx:right?p[0]+off:p[0]-off,ty:mob?22:24,kind:"elbow",anchor:right?"start":"end",lines,size:fs});
    if(anim&&!V.reduced)a.style("opacity",0).transition().duration(400).style("opacity",1);
  }
  drawNote(false);
  // entrada: els pètals s'obren girant des del centre
  entry(el,instant=>{ if(instant)return;
    pts.attr("transform",p=>`rotate(${p.j*60-70}) scale(0.01)`).transition().delay(function(p){ const d=d3.select(this.parentNode).datum(); return I[d.id]*28+p.j*55; })
      .duration(950).ease(d3.easeCubicOut).attr("transform",p=>`rotate(${p.j*60}) scale(1)`);
    ng.style("opacity",0).transition().delay(1300).duration(500).style("opacity",1); });
  // hover: la flor creix i passa al davant; el pètal apuntat es contorneja en tinta, amb una guia fins a l'escala (cercle = 100)
  const tp=V.tip(el); let cur=null, curJ=-1; s.style("cursor","pointer");
  const MEAN45={}; V45.forEach(v=>MEAN45[v.k]=d3.mean(F45,q=>q[v.k]));
  const rank45=(d,k)=>1+F45.filter(q=>q[k]>d[k]).length;
  function on(d,j){ if(cur===d&&curJ===j)return; if(cur!==d){ off(); cur=d; V.focus(fl,q=>q===d); ng.transition().duration(160).style("opacity",.5);
      fl.filter(q=>q===d).raise().select("g.in").interrupt().transition().duration(160).attr("transform","scale(1.32)");
      fl.filter(q=>q===d).select("text.nm").transition().duration(160).style("opacity",0); }
    curJ=j; const n=fl.filter(q=>q===d), k=1.32;
    n.selectAll("path.pt").interrupt("hv").transition("hv").duration(140).attr("stroke",p=>p.j===j?C.ink:EDGE(p.c)).attr("stroke-width",p=>p.j===j?1.5/k:.8).attr("fill",p=>p.j===j?V.alpha(p.c,.9):FILL(p.c));
    n.selectAll("path.pt").filter(p=>p.j===j).each(function(){ this.parentNode.insertBefore(this,this.parentNode.querySelector(":scope>circle")); }); // al davant dels altres pètals, sota l'escala
    const vg=n.select("g.vals"); vg.selectAll("*").remove();
    // escala: anells de 25 en 25 i guia radial pel pètal apuntat, amb el valor sobre l'escala
    [25,50,75,100].forEach(v=>vg.append("circle").attr("r",L(v)).attr("fill","none").attr("stroke",v===100?C.ink2:C.hair).attr("stroke-width",(v===100?.8:.6)/k).attr("stroke-dasharray",v===100?null:"2 3"));
    const a=j*Math.PI/3, sx=Math.sin(a), sy=-Math.cos(a), val=d[V45[j].k];
    vg.append("line").attr("x1",0).attr("y1",0).attr("x2",sx*L(100)).attr("y2",sy*L(100)).attr("stroke",C.ink).attr("stroke-width",.8/k).attr("stroke-dasharray","2 2");
    vg.append("circle").attr("cx",sx*L(val)).attr("cy",sy*L(val)).attr("r",2.4/k).attr("fill",C.ink);
    V.t(vg,sx*(L(100)+6),sy*(L(100)+6)+4/k,"100",{size:11/k,fill:C.muted,anchor:sx>.3?"start":sx<-.3?"end":"middle",halo:2/k});
    V45.forEach((v,i)=>{ if(i===j)return; const b=i*Math.PI/3, rr=L(d[v.k])+6, sn=Math.sin(b);
      V.t(vg,Math.sin(b)*rr,-Math.cos(b)*rr+4/k,d[v.k],{size:11/k,anchor:sn>.3?"start":sn<-.3?"end":"middle",fill:C.ink2,halo:2/k}); });
    const rr=L(val)+7/k;
    V.t(vg,sx*rr,sy*rr+(sy>.6?11/k:sy<-.6?-1/k:5/k),val,{size:14/k,weight:700,anchor:sx>.3?"start":sx<-.3?"end":"middle",halo:3/k});
    V.t(vg,0,-L(100)-8/k,d.n,{size:12.5/k,weight:700,anchor:"middle",halo:3/k}); }
  function off(){ if(!cur)return; const n=fl.filter(q=>q===cur);
    n.select("g.in").interrupt().transition().duration(160).attr("transform","scale(1)");
    n.selectAll("path.pt").interrupt("hv").transition("hv").duration(140).attr("stroke",p=>EDGE(p.c)).attr("stroke-width",.8).attr("fill",p=>FILL(p.c));
    n.select("g.vals").selectAll("*").remove(); n.select("text.nm").transition().duration(160).style("opacity",1); cur=null; curJ=-1; V.focus(fl,null); ng.transition().duration(160).style("opacity",1); tp.hide(); }
  V.hover(s.node(),(ev,[px,py])=>{
    const d=d3.least(F45,q=>{ const p=pos(I[q.id]); return Math.hypot(px-p[0],(py-p[1])*.8); }), p=d&&pos(I[d.id]);
    if(!d||Math.abs(px-p[0])>cell/2||Math.abs(py-p[1])>rowH/2+6){ off(); return; }
    let a=Math.atan2(px-p[0],-(py-p[1])); if(a<0)a+=2*Math.PI; const j=Math.round(a/(Math.PI/3))%6;
    on(d,j); const v=V45[j], val=d[v.k];
    tp.show(`<b>${d.n}</b> · ${DOT(T45[v.ty].c)} ${v.t}<br><b>${val}</b> de 100 · posició ${rank45(d,v.k)} de 24<br>Mitjana de les 24 en ${v.t.toLowerCase()}: ${f0(MEAN45[v.k])} · mitjana de ${d.n}: ${f0(d.tot)}`,p[0]+R*1.3,p[1]-R*.4); },off);
  el._sort=()=>{ off(); unfocus(fl); I=idx(); ng.selectAll("*").transition().duration(200).style("opacity",0).remove();
    fl.transition().delay(d=>V.reduced?0:I[d.id]*14).duration(V.reduced?0:950).ease(EIO).attr("transform",d=>`translate(${pos(I[d.id])})`);
    setTimeout(()=>drawNote(true),V.reduced?0:1300); };
});
seg(45,k=>{ order45=k; const el=$('[data-p="45"]'); el&&el._sort&&el._sort(); });
void M45;

/* =====================================================================
   IB-46 · XARXA CIRCULAR AMB ONES  (dades d'exemple · estil «Letter traffic»)
   Anell finíssim amb nodes translúcids, dues ones exteriors suaus (sortides en vermell,
   entrades en blau) i fils Bézier interiors delicats amb tiges de puntets als fluxos clau.
   ===================================================================== */
const N46=["Nord","Nord-est","Est","Litoral","Sud-est","Sud","Sud-oest","Oest","Ponent","Centre"];
const MAT46=(function(){ const r=V.rng(46);
  return N46.map((a,i)=>N46.map((b,j)=>{
    if(i===j)return 0;
    const base=r()<.38?0:Math.round((4+r()*24)*(j===9?2.4:1)*(i===0||i===3?1.5:1)*(j===3&&i===9?2.1:1));
    return base;
  }));
})();
legend(46,el=>V.legendCat(el,[
  {c:C.vermell,a:.35,t:"Ona exterior: sortides"},
  {c:C.blau,a:.35,t:"Ona exterior: entrades"},
  {c:C.ink2,t:"Fils interiors: flux directe",kind:"line",w:1}
]));
const M46=piece(46,(el,w)=>{
  const mob=w<640, S=Math.min(w,mob?w:620), h=mob?Math.round(S*1.02):Math.round(S*.92), cx=w/2, cy=h/2;
  const R=S/2-(mob?72:102), Wmax=mob?34:54;
  el.style.height="";
  const s=V.svg(el,w,h,"Xarxa circular híbrida de deu regions. Al voltant d'un cercle finíssim, dues ones translúcides mostren el volum de sortides (vermell) i entrades (blau); a dins, fils corbats delicats uneixen cada parell de regions. Dades d'exemple.");
  const g=s.append("g").attr("transform",`translate(${cx},${cy})`);
  const n=N46.length, ang=i=>i*(2*Math.PI/n)-Math.PI/2;
  const outs=N46.map((_,i)=>d3.sum(MAT46[i])), ins=N46.map((_,i)=>d3.sum(MAT46,r=>r[i]));
  const maxW=Math.max(d3.max(outs),d3.max(ins));
  const rW=d3.scaleLinear([0,maxW],[0,Wmax]);
  const rNode=d3.scaleSqrt([0,maxW*2],[mob?4:5,mob?10:13]);

  // 1. Dues ones translúcides exteriors (sortides en vermell, entrades en blau, mix-blend-mode: multiply)
  const wavePts=(arr)=>{
    const pts=[];
    for(let i=0;i<n;i++){
      const a0=ang(i), aMid=ang(i)+Math.PI/n;
      pts.push([a0+Math.PI/2,R+rW(arr[i])]);
      pts.push([aMid+Math.PI/2,R+rW(Math.min(arr[i],arr[(i+1)%n])*.18)]);
    }
    return pts;
  };
  const areaR=d3.areaRadial().angle(d=>d[0]).innerRadius(R).outerRadius(d=>d[1]).curve(d3.curveCardinalClosed.tension(.45));
  const gWaves=g.append("g");
  gWaves.append("path").datum(wavePts(ins)).attr("d",areaR).attr("fill",C.blau).attr("fill-opacity",.24).style("mix-blend-mode","multiply");
  gWaves.append("path").datum(wavePts(outs)).attr("d",areaR).attr("fill",C.vermell).attr("fill-opacity",.24).style("mix-blend-mode","multiply");

  // 2. Anell finíssim de referència
  g.append("circle").attr("r",R).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9).attr("stroke-opacity",.72);

  // 3. Fils Bézier interiors delicats (+ seqüència de puntets als 3 fluxos més forts)
  const links=[];
  for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(MAT46[i][j]>0)links.push({i,j,v:MAT46[i][j]});
  const maxL=d3.max(links,d=>d.v)||1;
  const wL=d3.scaleLinear([1,maxL],[.45,1.8]);
  const ptOn=(i,rad)=>[Math.cos(ang(i))*rad,Math.sin(ang(i))*rad];
  const linkPath=d=>{
    const [x0,y0]=ptOn(d.i,R), [x1,y1]=ptOn(d.j,R);
    // lleugera desviació del centre perquè anada i tornada no se solapin exactament
    const off=d.i<d.j?.14:-.14, mx=(x0+x1)*off, my=(y0+y1)*off;
    return `M${x0},${y0}Q${mx},${my} ${x1},${y1}`;
  };
  const gLinks=g.append("g");
  const Lpaths=gLinks.selectAll("path").data(links).join("path").attr("d",linkPath)
    .attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",d=>wL(d.v)).attr("stroke-opacity",d=>.14+.28*(d.v/maxL));

  // Puntets delicats sobre els 3 fluxos principals (picada d'ullet a les tiges de «Letter traffic»)
  const top3=links.slice().sort((a,b)=>b.v-a.v).slice(0,3);
  const gBeads=g.append("g").style("pointer-events","none");
  top3.forEach((d,ti)=>{
    const [x0,y0]=ptOn(d.i,R), [x1,y1]=ptOn(d.j,R);
    const off=d.i<d.j?.14:-.14, mx=(x0+x1)*off, my=(y0+y1)*off;
    const col=ti===0?C.vermell:ti===1?C.blau:C.grocFosc;
    for(let k=1;k<=6;k++){
      const t=k/10, u=1-t;
      const bx=u*u*x0+2*u*t*mx+t*t*x1, by=u*u*y0+2*u*t*my+t*t*y1;
      gBeads.append("circle").attr("cx",bx).attr("cy",by).attr("r",2.3).attr("fill",col).attr("fill-opacity",.75).attr("stroke","#fff").attr("stroke-width",.6);
    }
  });

  // 4. Nodes translúcids sobre l'anell + etiquetes netes fora les ones
  const gNodes=g.append("g");
  const nodes=gNodes.selectAll("g.nd").data(N46.map((t,i)=>({i,t,out:outs[i],inn:ins[i],tot:outs[i]+ins[i]}))).join("g").attr("class","nd").style("cursor","pointer");
  nodes.each(function(d){
    const q=d3.select(this), a=ang(d.i), [x,y]=ptOn(d.i,R), rad=rNode(d.tot);
    q.append("circle").attr("cx",x).attr("cy",y).attr("r",rad).attr("fill",C.ink2).attr("fill-opacity",.26).style("mix-blend-mode","multiply");
    q.append("circle").attr("cx",x).attr("cy",y).attr("r",2.4).attr("fill",C.ink);
    const rr=R+Math.max(rW(d.out),rW(d.inn))+(mob?14:18), lx=Math.cos(a)*rr, ly=Math.sin(a)*rr;
    const cs=Math.cos(a), sn=Math.sin(a);
    const anc=cs>.22?"start":cs<-.22?"end":"middle", dy=sn<-.7?-4:sn>.7?12:4;
    q.append("line").attr("x1",Math.cos(a)*(R+rad+1)).attr("y1",Math.sin(a)*(R+rad+1)).attr("x2",Math.cos(a)*(rr-5)).attr("y2",Math.sin(a)*(rr-5))
      .attr("stroke",C.hair).attr("stroke-width",.6);
    V.t(q,lx,ly+dy,d.t,{anchor:anc,weight:600,size:mob?11:12,fill:C.ink,halo:3});
    q.append("circle").attr("cx",x).attr("cy",y).attr("r",Math.max(18,rad+6)).attr("fill","transparent");
  });

  // Hover suau: ressalta sortides en vermell i entrades en blau del node apuntat + lectura en 1 línia a sota
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const reset=()=>{
    Lpaths.interrupt().transition().duration(150).attr("stroke",C.ink2).attr("stroke-opacity",d=>.14+.28*(d.v/maxL)).attr("stroke-width",d=>wL(d.v));
    nodes.interrupt().transition().duration(150).style("opacity",1);
    gWaves.transition().duration(150).style("opacity",1);
    gBeads.transition().duration(150).style("opacity",1);
    tp.hide();
  };
  nodes.on("mouseenter",(ev,d)=>{
    nodes.interrupt().transition().duration(150).style("opacity",o=>o===d||MAT46[d.i][o.i]>0||MAT46[o.i][d.i]>0?1:.48);
    gWaves.transition().duration(150).style("opacity",.55);
    gBeads.transition().duration(150).style("opacity",.35);
    Lpaths.interrupt().transition().duration(150)
      .attr("stroke",l=>l.i===d.i?C.vermell:l.j===d.i?C.blau:C.ink2)
      .attr("stroke-opacity",l=>l.i===d.i||l.j===d.i?.85:.08)
      .attr("stroke-width",l=>l.i===d.i||l.j===d.i?Math.max(1.3,wL(l.v)*1.3):wL(l.v));
    tp.show(`<b>${d.t}</b> · Surten <b>${d.out}</b> (vermell) · Entren <b>${d.inn}</b> (blau) · Saldo ${sgn(d.inn-d.out,0)}`,cx,cy);
  }).on("mouseleave",reset);

  entry(el,instant=>{
    if(instant)return;
    gWaves.style("opacity",0).transition().duration(650).ease(EIO).style("opacity",1);
    gLinks.style("opacity",0).transition().delay(250).duration(650).ease(EIO).style("opacity",1);
    gBeads.style("opacity",0).transition().delay(500).duration(450).style("opacity",1);
  });
});
void M46;

/* =====================================================================
   IB-47 · CORRENT APILAT  (dades d'exemple)
   Streamgraph de cinc sèries; tres maneres d'apilar amb morph animat.
   ===================================================================== */
const K47=["A","B","C","D","E"].map((k,i)=>({k,t:"Tipus "+k,c:V.CAT6[i]}));
const Y47=d3.range(1970,2027);
const R47=(function(){ const r=V.rng(47);
  const pk=[[[1976,6,34],[2004,9,22]],[[1989,5,58],[2019,6,26]],[[1998,8,40]],[[1983,4,18],[2012,5,44]],[[2022,4,36],[1972,5,14]]];
  const noise=K47.map(()=>{ let v=0; return Y47.map(()=>(v=v*.7+V.gauss(r)*2.2)); });
  return Y47.map((y,i)=>{ const o={y}; K47.forEach((s,j)=>{ o[s.k]=Math.max(1.5,6+d3.sum(pk[j],p=>p[2]*Math.exp(-(((y-p[0])/p[1])**2)))+noise[j][i]); }); return o; }); })();
const ORD47=(function(){ const st=d3.stack().keys(K47.map(d=>d.k))(R47); return d3.stackOrderInsideOut(st).map(i=>K47[i]); })();
let mode47=0;
legend(47,el=>V.legendCat(el,K47.map(d=>({c:d.c,t:d.t,a:.75}))));
const M47=piece(47,(el,w)=>{
  const mob=w<640, h=mob?310:420, m={t:mob?40:30,r:mob?6:14,b:26,l:mob?6:14};
  const s=V.svg(el,w,h,"Corrent de cinc sèries del 1970 al 2026, apilades al voltant d'un eix central. El Tipus B té un gran pic a finals dels anys vuitanta i el Tipus E creix al final. Dades d'exemple."), g=s.append("g");
  const x=d3.scaleLinear([1970,2026],[m.l,w-m.r]);
  const keys=ORD47.map(d=>d.k), offs=[d3.stackOffsetSilhouette,d3.stackOffsetNone,d3.stackOffsetExpand];
  const stackFor=md=>d3.stack().keys(keys).order(d3.stackOrderNone).offset(offs[md])(R47);
  const yFor=(md,st)=>{ if(md===2)return d3.scaleLinear([0,1],[h-m.b,m.t]);
    const lo=d3.min(st,a=>d3.min(a,p=>p[0])), hi=d3.max(st,a=>d3.max(a,p=>p[1]));
    if(md===0){ const M=Math.max(-lo,hi)*1.02; return d3.scaleLinear([-M,M],[h-m.b,m.t]); } return d3.scaleLinear([0,hi],[h-m.b,m.t]).nice(); };
  const areaFor=y=>d3.area().x((p,i)=>x(Y47[i])).y0(p=>y(p[0])).y1(p=>y(p[1])).curve(d3.curveBasis);
  const axG=g.append("g"), pg=g.append("g"), lg=g.append("g"), ng=g.append("g"), hg=g.append("g");
  V.axisX(g,x,h-m.b+2,mob?[1980,2000,2020]:[1970,1980,1990,2000,2010,2020],d=>d,{tick:false});
  let st=stackFor(mode47), y=yFor(mode47,st);
  const paths=pg.selectAll("path").data(st,d=>d.key).join("path").attr("d",areaFor(y))
    .attr("fill",d=>V.alpha(K47.find(k=>k.k===d.key).c,.72)).attr("stroke","#fff").attr("stroke-width",.7);
  function axis(md,y,anim){
    axG.selectAll("*").interrupt().remove(); const a=axG.append("g");
    if(md===0){ const L=y(0)-y(25), X=m.l+2, Y=Math.max(4,m.t-22);
      a.append("path").attr("d",`M${X+5},${Y}H${X}V${Y+L}H${X+5}`).attr("fill","none").attr("stroke",C.ink2).attr("stroke-width",.9);
      V.t(a,X+9,Y+L/2+4,"25 unitats",{size:11.5,fill:C.ink2,halo:true});
      a.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(0)).attr("y2",y(0)).attr("stroke",C.ghost).attr("stroke-dasharray","2 4"); }
    else if(md===1){ V.gridY(a,y,0,w,y.ticks(4).filter(v=>v>0).concat([0]).sort((p,q)=>p-q),f0,{zero:0,unit:" unitats",right:false}); }
    else V.gridY(a,y,0,w,[0,.25,.5,.75,1],v=>f0(v*100),{zero:0,unit:" %"});
    a.selectAll("line").lower();
    if(anim&&!V.reduced)a.style("opacity",0).transition().delay(500).duration(500).style("opacity",1);
  }
  function labels(md,st,y,anim){
    lg.selectAll("*").interrupt().remove();
    st.forEach(a=>{ let best=-1,bt=0; a.forEach((p,i)=>{ if(i<4||i>a.length-5)return; const th=y(p[0])-y(p[1]); if(th>bt){bt=th;best=i;} });
      if(bt<(mob?15:17))return; const p=a[best], tx=x(Y47[best]), ty=(y(p[0])+y(p[1]))/2+4, k=K47.find(q=>q.k===a.key);
      const tw=textW(k.t,12,700); const ax=clamp(tx,m.l+tw/2+2,w-m.r-tw/2-2);
      V.t(lg,ax,ty,k.t,{anchor:"middle",weight:700,size:12,halo:2.5}); });
    if(anim&&!V.reduced)lg.style("opacity",0).transition().delay(800).duration(450).style("opacity",1); else lg.style("opacity",1);
  }
  function note(md,st,y,anim){
    ng.selectAll("*").remove(); const a=st.find(q=>q.key==="B"); let bi=0; R47.forEach((r,i)=>{ if(r.B>R47[bi].B)bi=i; });
    const p=a[bi], px=x(Y47[bi]), py=y(p[1]), up=Math.max(18,py-(mob?34:44));
    V.note(ng,{x:px,y:py,tx:px+(mob?16:26),ty:up,kind:"elbow",anchor:"start",dot:true,size:mob?12:12.5,lines:[[`El pic del Tipus B, ${Y47[bi]}`,true],[`${f0(R47[bi].B)} unitats, el ${pct(R47[bi].B/d3.sum(K47,k=>R47[bi][k.k]))} del total`]]});
    if(anim&&!V.reduced)ng.style("opacity",0).transition().delay(900).duration(450).style("opacity",1); else ng.style("opacity",1);
  }
  axis(mode47,y,false); labels(mode47,st,y,false); note(mode47,st,y,false);
  // entrada: el corrent creix des de l'eix
  entry(el,instant=>{ if(instant)return;
    const flat=st.map(a=>a.map(()=>[0,0]));
    const y0=mode47===0?y:d3.scaleLinear([0,1],[h-m.b,h-m.b]);
    paths.attr("d",(d,i)=>areaFor(y0)(flat[i])).transition().delay((d,i)=>i*90).duration(1300).ease(EIO).attr("d",areaFor(y));
    lg.style("opacity",0).transition().delay(1300).duration(500).style("opacity",1);
    ng.style("opacity",0).transition().delay(1600).duration(500).style("opacity",1); });
  el._mode=md=>{ mode47=md; st=stackFor(md); y=yFor(md,st); leave(); unfocus(paths);
    paths.data(st,d=>d.key).transition().duration(V.reduced?0:1100).ease(EIO).attr("d",areaFor(y));
    lg.selectAll("*").transition().duration(200).style("opacity",0);
    ng.selectAll("*").transition().duration(200).style("opacity",0);
    setTimeout(()=>{ axis(md,y,true); labels(md,st,y,true); note(md,st,y,true); },V.reduced?0:250); };
  // hover: la capa apuntada (o la més propera) es contorneja i passa al davant; la resta s'apaga.
  // Guia vertical fins a l'eix amb l'any en negreta, el gruix de la capa marcat en tinta i el valor escrit al costat.
  const tp=V.tip(el), MEANK={}; K47.forEach(k=>MEANK[k.k]=d3.mean(R47,r=>r[k.k])); s.style("cursor","crosshair");
  let curK=null;
  const plain=()=>paths.attr("stroke","#fff").attr("stroke-width",.7);
  V.hover(s.node(),(ev,[px,py])=>{ if(px<m.l-4||px>w-m.r+4||py>h-4){ leave(); return; }
    const i=clamp(Math.round(x.invert(px))-1970,0,Y47.length-1), X=x(Y47[i]);
    const a=st.find(q=>py<=y(q[i][0])+1&&py>=y(q[i][1])-1)||d3.least(st,q=>Math.abs((y(q[i][0])+y(q[i][1]))/2-py));
    if(curK!==a.key){ if(curK===null){ lg.transition("hv").duration(150).style("opacity",.5); ng.transition("hv").duration(150).style("opacity",.5); }
      curK=a.key; V.focus(paths,q=>q.key===a.key,{dim:.2}); plain(); paths.filter(q=>q.key===a.key).raise().attr("stroke",C.ink).attr("stroke-width",1.5); }
    const k=K47.find(q=>q.k===a.key), v=R47[i][a.key], tot=d3.sum(K47,q=>R47[i][q.k]), y0=y(a[i][0]), y1=y(a[i][1]), ym=(y0+y1)/2;
    hg.selectAll("*").remove();
    hg.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t-6).attr("y2",h-m.b+2).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
    hg.append("line").attr("x1",X).attr("x2",X).attr("y1",y0).attr("y2",y1).attr("stroke",C.ink).attr("stroke-width",2.6).attr("stroke-linecap","butt");
    [y0,y1].forEach(yy=>hg.append("line").attr("x1",X-4).attr("x2",X+4).attr("y1",yy).attr("y2",yy).attr("stroke",C.ink).attr("stroke-width",1.2));
    const yw=textW(String(Y47[i]),11.5,700)/2+4;
    hg.append("rect").attr("x",X-yw).attr("y",h-m.b+5).attr("width",2*yw).attr("height",16).attr("fill","#fff");
    V.t(hg,X,h-m.b+18,Y47[i],{anchor:"middle",size:11.5,weight:700});
    const lbl=mode47===2?`${k.t} · ${pct(v/tot)}`:`${k.t} · ${f0(v)}`, lw=textW(lbl,12.5,700), right=X+10+lw<w-m.r;
    V.t(hg,right?X+9:X-9,ym+4,lbl,{anchor:right?"start":"end",weight:700,size:12.5,halo:3});
    const dm=v-MEANK[a.key];
    tp.show(`<b>${k.t}</b> · ${Y47[i]}<br><b>${f0(v)}</b> unitats · ${pct(v/tot)} del total (${f0(tot)})<br>${dm>=0?"+":"−"}${f0(Math.abs(dm))} respecte a la seva mitjana 1970–2026`,X,Math.min(ym,h-80)); },leave);
  function leave(){ if(curK===null&&!hg.node().childElementCount)return; curK=null; hg.selectAll("*").remove(); V.focus(paths,null); plain(); tp.hide(); lg.transition("hv").duration(150).style("opacity",1); ng.transition("hv").duration(150).style("opacity",1); }
});
seg(47,k=>{ const el=$('[data-p="47"]'); if(el&&el._mode)el._mode(+k); else mode47=+k; }); // si encara no s'ha dibuixat, es dibuixarà directament en aquest mode
void M47;

/* =====================================================================
   IB-48 · UN DIA EN UN MINUT  (dades d'exemple)
   Rellotge de 24 h: una agulla fa la volta en 60 s i cada esdeveniment apareix a la seva hora.
   ===================================================================== */
const G48=[{t:"Grup A",c:C.vermell},{t:"Grup B",c:C.blau},{t:"Grup C",c:C.groc}];
const E48=(function(){ const r=V.rng(48), out=[], N=[430,300,190];
  const prof=[h=>.14+Math.exp(-(((h-8.3)/1.2)**2))+.85*Math.exp(-(((h-18.6)/1.5)**2)),
    h=>.1+Math.exp(-(((h-13.2)/2.4)**2)),
    h=>{ const d=Math.min(Math.abs(h-2),24-Math.abs(h-2)); return .1+Math.exp(-((d/2.3)**2)); }];
  prof.forEach((p,gi)=>{ let n=0; while(n<N[gi]){ const hh=r()*24; if(r()*1.2<p(hh)){ out.push({g:gi,t:hh*60,r:r(),h:Math.floor(hh)}); n++; } } });
  return out.sort((a,b)=>a.t-b.t); })();
const T48=E48.map(e=>e.t);
const HOUR48=d3.range(24).map(h=>E48.map((e,i)=>e.h===h?i:-1).filter(i=>i>=0));
const S48={T:0,play:false,done:false,hov:-1,hovG:-1};
legend(48,el=>V.legendCat(el,G48.map(g=>({c:g.c,t:g.t})).concat([{t:"1 punt = 1 esdeveniment",kind:"none"}])));
function btn48(){ const b=$('[data-play="48"]'); if(b)b.textContent=S48.play?"Pausa":S48.done?"Torna a començar":"Reprodueix"; }
const M48=piece(48,(el,w)=>{
  if(el._lp){ el._lp.stop(); el._lp=null; } S48.hov=-1; S48.hovG=-1;
  const mob=w<640, S=mob?w:Math.min(560,w*.56), top=mob?72:0, h=top+S, cx=mob?w/2:S/2, cy=top+S/2, R=S/2-(mob?36:38);
  const band=[[.79,.99],[.56,.76],[.3,.52]].map(b=>[b[0]*R,b[1]*R]);
  const {ctx,s}=layer(el,w,h,"Rellotge de 24 hores amb mitjanit a dalt. Cada punt és un esdeveniment a la seva hora: el Grup A té dos pics, cap a les 8 i cap a les 18 h; el Grup B, al migdia; el Grup C, de matinada. Dades d'exemple.");
  const g=s.append("g");
  const ang=t=>t/1440*2*Math.PI;
  // esfera: hores i anells
  for(let hh=0;hh<24;hh++){ const a=ang(hh*60), big=hh%6===0;
    g.append("line").attr("x1",cx+Math.sin(a)*(R+3)).attr("y1",cy-Math.cos(a)*(R+3)).attr("x2",cx+Math.sin(a)*(R+(big?10:6))).attr("y2",cy-Math.cos(a)*(R+(big?10:6))).attr("stroke",big?C.ink2:C.ghost).attr("stroke-width",big?1:.8);
    if(big||(!mob&&hh%3===0)){ const rr=R+14, sn=Math.sin(a), cs=Math.cos(a); V.t(g,cx+sn*rr,cy-cs*rr+(cs>.7?-2:cs<-.7?11:4),hh+" h",{anchor:sn>.3?"start":sn<-.3?"end":"middle",size:11.5,fill:big?C.ink2:C.muted}); } }
  band.forEach(b=>g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",(b[0]+b[1])/2).attr("fill","none").attr("stroke",C.grid).attr("stroke-width",.6));
  if(!mob){ G48.forEach((gr,i)=>V.t(g,cx-6,cy-(band[i][0]+band[i][1])/2+4,gr.t,{size:11,fill:C.muted,italic:true,halo:2.5,anchor:"end"})); }
  const hand=g.append("line").attr("x1",cx).attr("y1",cy).attr("stroke",C.ink).attr("stroke-width",1.3).attr("stroke-linecap","round");
  g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",3).attr("fill",C.ink);
  const clk=V.t(g,cx,cy+(mob?-2:-4),"00:00",{anchor:"middle",serif:true,weight:600,size:mob?24:32,halo:4});
  const sub=g.append("g");
  const peak=g.append("g");
  // comptadors
  const cnt=[], hist=[];
  const HB=E48.reduce((a,e)=>{ a[e.g][e.h]++; return a; },G48.map(()=>new Array(24).fill(0)));
  const hmax=d3.max(HB,a=>d3.max(a));
  G48.forEach((gr,i)=>{
    if(mob){ const X=(i+.5)*w/3; g.append("circle").attr("cx",X-textW(gr.t,12,700)/2-8).attr("cy",14).attr("r",4.5).attr("fill",gr.c);
      V.t(g,X,18,gr.t,{anchor:"middle",weight:700,size:12}); cnt.push(V.t(g,X,46,"0",{anchor:"middle",serif:true,weight:600,size:24})); }
    else { const X=S+48, Y=cy-128+i*96, HW=Math.min(240,w-X-10);
      g.append("circle").attr("cx",X+5).attr("cy",Y-4).attr("r",5).attr("fill",gr.c);
      V.t(g,X+16,Y,gr.t,{weight:700,size:13});
      cnt.push(V.t(g,X,Y+36,"0",{serif:true,weight:600,size:34}));
      const bw=HW/24, hs=d3.scaleLinear([0,hmax],[0,30]);
      const hg=g.append("g").attr("transform",`translate(${X+96},${Y+38})`);
      hg.append("line").attr("x2",HW-96).attr("stroke",C.hair);
      hist.push(d3.range(24).map(k=>hg.append("rect").attr("x",k*(HW-96)/24+.5).attr("width",Math.max(1,(HW-96)/24-1.2)).attr("y",0).attr("height",0).attr("fill",V.alpha(gr.c,.75))));
      hist[i].hs=hs; [0,12].forEach(k=>V.t(hg,k*(HW-96)/24,13,k+" h",{size:11,fill:C.muted})); } });
  if(!mob)V.t(g,S+48,cy+168,"Esdeveniments fins a l'hora de l'agulla; a la dreta, per hora",{size:11.5,fill:C.muted});
  function frame(t,dt){
    if(S48.play){ S48.T=Math.min(1440,S48.T+dt*.024); if(S48.T>=1440){ S48.play=false; S48.done=true; btn48(); drawPeak(true); } }
    render(); }
  // Lleuger: la geometria de cada punt es calcula una sola vegada; els punts ja assentats es pinten en un canvas
  // fora de pantalla i cada fotograma només fa drawImage + els punts nous (i els de l'hora apuntada, en hover).
  const rd=mob?1.9:2.4, P48=E48.map(e=>{ const a=ang(e.t)-Math.PI/2, b=band[e.g], rr=b[0]+e.r*(b[1]-b[0]); return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]; });
  const COLA=G48.map(gr=>[V.alpha(gr.c,.6),V.alpha(gr.c,.95),V.alpha(gr.c,.18)]);
  const dpr=Math.min(2,window.devicePixelRatio||1), oc=document.createElement("canvas"); oc.width=w*dpr; oc.height=h*dpr; const octx=oc.getContext("2d"); octx.scale(dpr,dpr);
  let ns=0, lastN=-1, lastM=-1, lastHov="";
  const counts=[0,0,0], hc=G48.map(()=>new Array(24).fill(0)), shownC=[-1,-1,-1], shownH=G48.map(()=>new Array(24).fill(-1));
  const dot=(c,i,r)=>{ c.beginPath(); c.arc(P48[i][0],P48[i][1],r,0,2*Math.PI); c.fill(); };
  function render(){ const T=S48.T, n=d3.bisectRight(T48,T), hov=S48.hov>=0;
    if(n<lastN){ ns=0; octx.clearRect(0,0,w,h); counts.fill(0); hc.forEach(a=>a.fill(0)); lastN=0; }
    if(lastN<0)lastN=0;
    for(let i=lastN;i<n;i++){ counts[E48[i].g]++; hc[E48[i].g][E48[i].h]++; }
    while(ns<n&&(S48.done||T-E48[ns].t>=40)){ octx.fillStyle=COLA[E48[ns].g][0]; dot(octx,ns,rd); ns++; }
    ctx.clearRect(0,0,w,h);
    ctx.beginPath(); ctx.arc(cx,cy,R+3,-Math.PI/2,-Math.PI/2+ang(T)); ctx.strokeStyle=C.ink; ctx.lineWidth=1.4; ctx.stroke();
    ctx.globalAlpha=hov?.25:1; ctx.drawImage(oc,0,0,w,h); ctx.globalAlpha=1;
    for(let i=ns;i<n;i++){ const e=E48[i], age=T-e.t, dim=hov&&(e.h!==S48.hov||(S48.hovG>=0&&e.g!==S48.hovG));
      if(age<36&&!dim&&!V.reduced){ const q=age/36; ctx.beginPath(); ctx.arc(P48[i][0],P48[i][1],rd+q*11,0,2*Math.PI); ctx.strokeStyle=V.alpha(G48[e.g].c,.6*(1-q)); ctx.lineWidth=2; ctx.stroke(); }
      ctx.fillStyle=COLA[e.g][dim?2:1]; dot(ctx,i,age<12&&!V.reduced?rd*1.6:rd); }
    if(hov){ const L=HOUR48[S48.hov]; ctx.strokeStyle=C.ink; ctx.lineWidth=.8;
      for(let j=0;j<L.length;j++){ const i=L[j]; if(i>=n)break; const e=E48[i]; if(S48.hovG>=0&&e.g!==S48.hovG)continue; ctx.fillStyle=G48[e.g].c; dot(ctx,i,rd*1.45); ctx.stroke(); } }
    const a=ang(T); hand.attr("x2",cx+Math.sin(a)*(R+8)).attr("y2",cy-Math.cos(a)*(R+8));
    const mm=T>=1440?1440:Math.floor(T); if(mm!==lastM){ lastM=mm; clk.text(T>=1440?"24:00":`${String(Math.floor(mm/60)).padStart(2,"0")}:${String(mm%60).padStart(2,"0")}`); }
    const hk=S48.hov+"/"+S48.hovG;
    if(n!==lastN||hk!==lastHov){
      cnt.forEach((c,i)=>{ if(shownC[i]!==counts[i]){ shownC[i]=counts[i]; c.text(f0(counts[i])); } });
      hist.forEach((hb,i)=>hb.forEach((r,k)=>{ if(shownH[i][k]!==hc[i][k]){ shownH[i][k]=hc[i][k]; const v=hb.hs(hc[i][k]); r.attr("y",-v).attr("height",v); } }));
      if(hk!==lastHov)hist.forEach((hb,i)=>hb.forEach((r,k)=>{ const on=S48.hov===k&&(S48.hovG<0||S48.hovG===i); r.attr("stroke",on?C.ink:null).attr("stroke-width",on?1.5:null).attr("opacity",hov&&!on?.25:1); }));
      if(hov)hoverMarks(); lastHov=hk; }
    lastN=n;
  }
  function drawPeak(anim){ peak.selectAll("*").remove(); sub.selectAll("*").remove(); if(!S48.done)return;
    const tot=d3.range(24).map(k=>d3.sum(HB,a=>a[k])), pk=d3.maxIndex(tot), a0=ang(pk*60), a1=ang(pk*60+60);
    peak.append("path").attr("transform",`translate(${cx},${cy})`).attr("d",d3.arc().innerRadius(R+5).outerRadius(R+8).startAngle(a0).endAngle(a1)()).attr("fill",C.ink);
    V.lines(sub,cx,cy+(mob?16:20),[["Hora punta",true],[`${pk}–${pk+1} h · ${tot[pk]}`]],{anchor:"middle",size:mob?11.5:12.5,halo:3});
    if(anim&&!V.reduced){ peak.style("opacity",0).transition().duration(500).style("opacity",1); sub.style("opacity",0).transition().duration(500).style("opacity",1); } }
  if(V.reduced){ S48.T=1440; S48.done=true; }
  drawPeak(false); render(); btn48();
  el._lp=V.loop(el,frame);
  entry(el,instant=>{ if(instant||S48.T>0||S48.play)return; S48.play=true; btn48(); });
  // hover: una hora (i un grup, segons l'anell): el sector es contorneja en tinta, els seus punts creixen i la resta s'apaga;
  // guies radials fins a l'escala d'hores amb l'hora en negreta i el recompte escrit al costat.
  const tp=V.tip(el), hv=g.append("g"), hit=s.append("circle").attr("cx",cx).attr("cy",cy).attr("r",R+22).attr("fill","transparent").style("cursor","pointer");
  function countsAt(hh){ const n=d3.bisectRight(T48,S48.T), c=[0,0,0]; for(let i=0;i<n;i++)if(E48[i].h===hh)c[E48[i].g]++; return c; }
  function hoverMarks(){ hv.selectAll("*").remove(); const hh=S48.hov; if(hh<0)return;
    const a0=ang(hh*60), a1=ang(hh*60+60), am=(a0+a1)/2, gi=S48.hovG, ri=gi>=0?band[gi][0]-2:band[2][0]-4, ro=gi>=0?band[gi][1]+2:band[0][1]+4;
    hv.append("path").attr("transform",`translate(${cx},${cy})`).attr("d",d3.arc().innerRadius(ri).outerRadius(ro).startAngle(a0).endAngle(a1)()).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.5);
    [a0,a1].forEach(a=>hv.append("line").attr("x1",cx+Math.sin(a)*ro).attr("y1",cy-Math.cos(a)*ro).attr("x2",cx+Math.sin(a)*(R+10)).attr("y2",cy-Math.cos(a)*(R+10)).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2"));
    const c=countsAt(hh), n=gi>=0?c[gi]:d3.sum(c), sn=Math.sin(am), cs=Math.cos(am), rr=R+(mob?16:22), lbl=`${hh}–${hh+1} h · ${n}`;
    const anc=sn>.3?"start":sn<-.3?"end":"middle", X=clamp(cx+sn*rr,anc==="end"?textW(lbl,12.5,700)+2:anc==="middle"?textW(lbl,12.5,700)/2+2:2,anc==="start"?w-textW(lbl,12.5,700)-2:w);
    V.t(hv,X,cy-cs*rr+(cs>.7?-4:cs<-.7?13:4),lbl,{anchor:anc,weight:700,size:12.5,halo:4}); }
  V.hover(hit.node(),(ev,[px,py])=>{ const dx=px-cx, dy=py-cy, r=Math.hypot(dx,dy); if(r<band[2][0]-8){ leave48(); return; }
    let a=Math.atan2(dx,-dy); if(a<0)a+=2*Math.PI; const hh=Math.floor(a/(2*Math.PI)*24)%24;
    const gi=band.findIndex(b=>r>=b[0]-6&&r<=b[1]+6); S48.hov=hh; S48.hovG=gi;
    const c=countsAt(hh), tot=d3.bisectRight(T48,S48.T), sum=d3.sum(c), so=S48.T<(hh+1)*60?" (fins ara)":"";
    const head=gi>=0?`<b>${G48[gi].t}</b> · de ${hh} a ${hh+1} h${so}<br><b>${c[gi]}</b> esdeveniments · ${pct(sum?c[gi]/sum:0)} dels d'aquesta hora`:`<b>De ${hh} a ${hh+1} h</b>${so}<br><b>${sum}</b> esdeveniments · ${pct(tot?sum/tot:0)} dels que porta el dia`;
    tp.show(head+"<br>"+G48.map((gr,i)=>`${DOT(gr.c)} ${gr.t}: ${c[i]}`).join(" · "),px,py); render(); },leave48);
  function leave48(){ if(S48.hov<0)return; S48.hov=-1; S48.hovG=-1; hv.selectAll("*").remove(); tp.hide(); render(); }
});
(function(){ const b=$('[data-play="48"]'); if(!b)return; b.addEventListener("click",()=>{
  if(V.reduced){ S48.T=1440; S48.done=true; }
  else if(S48.play)S48.play=false;
  else { if(S48.done||S48.T>=1440){ S48.T=0; S48.done=false; M48.redraw(); } S48.play=true; }
  btn48(); }); })();

/* =====================================================================
   IB-49 · TEMPS PROFUND  (dades reals: research/calendari-events.csv)
   Línia del temps logarítmica o lineal, amb zoom cap a avui.
   ===================================================================== */
const EV49=(DB.temps||[]).slice().sort((a,b)=>b.a-a.a);
const S49={log:true,L:1.45e10};
const LMAX=1.45e10, LMIN=2000;
function age49(a,approx){ const p=approx?"≈ ":"";
  if(a<1000)return "l'any "+(2026-Math.round(a));
  if(a>=1e6){ const m=a/1e6, r1=Math.round(m*10)/10, s=m>=1000||(m>=10&&m<100)?f0(m):(r1%1===0?f0(r1):f1(r1));
    return `fa ${p}${s} ${s==="1"?"milió":"milions"} d'anys`; }
  return `fa ${p}${f0(Number(a.toPrecision(3)))} anys`; }
function tick49(v){ if(v===0)return "avui"; if(v>=1e6){ const m=v/1e6; return f0(m)+(m===1?" milió":" milions"); } return f0(v); }
const sl2v=x=>Math.pow(10,Math.log10(LMAX)+(Math.log10(LMIN)-Math.log10(LMAX))*x/1000);
const v2sl=v=>(Math.log10(v)-Math.log10(LMAX))/(Math.log10(LMIN)-Math.log10(LMAX))*1000;
const M49=piece(49,(el,w)=>{
  const mob=w<640, lanes=mob?6:5, laneH=mob?33:35, m={t:34,l:mob?4:8,r:mob?4:8}, axisY=m.t+lanes*laneH+18, h=axisY+46;
  const s=V.svg(el,w,h,"Línia del temps des del Big Bang, fa 13.787 milions d'anys, fins avui, en escala logarítmica: cada salt de l'eix és deu vegades més a prop d'avui, i així hi caben la formació de la Terra, la primera vida, l'impacte de Chicxulub, Homo sapiens i l'agricultura."), g=s.append("g");
  const gridG=g.append("g"), axG=g.append("g"), evG=g.append("g"), ntG=g.append("g"), hlG=g.append("g");
  g.append("line").attr("x1",m.l).attr("x2",w-m.r).attr("y1",axisY).attr("y2",axisY).attr("stroke",C.ink).attr("stroke-width",1);
  const mkX=()=>S49.log?d3.scaleLog([S49.L,25],[m.l,w-m.r]):d3.scaleLinear([S49.L,0],[m.l,w-m.r]);
  const nameOf=e=>e.s||e.t;
  function layout(x){ const placed=[], out={};
    const vis=EV49.filter(e=>e.a<=S49.L*1.0001);
    const pri=vis.slice().sort((a,b)=>a.p-b.p||a.a-b.a); // per prioritat i, dins de cada una, de dreta a esquerra
    pri.forEach(e=>{ const X=x(e.a), nm=nameOf(e), ag=age49(e.a,e.u), tw=Math.max(textW(nm,12.5,700),textW(ag,11.5))+6;
      let anc="start", b0=X-2, b1=X+tw; if(b1>w-m.r){ anc="end"; b0=X-tw; b1=X+2; }
      if(b0<m.l-2){ out[e.id]={X,lane:-1}; return; }
      for(let k=0;k<lanes;k++){ let ok=true;
        for(const p of placed){ if(p.lane===k&&!(b1+6<p.b0||b0-6>p.b1)){ok=false;break;}
          if(p.lane<k&&X>=p.b0-3&&X<=p.b1+3){ok=false;break;}
          if(p.lane>k&&p.X>=b0-3&&p.X<=b1+3){ok=false;break;}
          if(Math.abs(p.X-X)<3&&p.lane!==k){ ok=false; break; } }
        if(ok){ placed.push({X,lane:k,b0,b1}); out[e.id]={X,lane:k,anc,nm,ag}; return; } }
      out[e.id]={X,lane:-1}; });
    vis.forEach(e=>{ if(!out[e.id])out[e.id]={X:x(e.a),lane:-1}; });
    return out; }
  const laneY=k=>axisY-22-k*laneH;
  function axis(x){ axG.selectAll("*").remove(); gridG.selectAll("*").remove();
    let tv; if(S49.log){ tv=d3.range(1,11).map(k=>Math.pow(10,k)).filter(v=>v<=S49.L&&v>=25); if(mob&&tv.length>5)tv=tv.filter(v=>Math.round(Math.log10(v))%3===0); }
    else { tv=x.ticks(mob?3:6); }
    tv.forEach(v=>{ const X=x(v); if(X<m.l-1||X>w-m.r+1)return;
      gridG.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t-6).attr("y2",axisY).attr("stroke",C.grid).attr("stroke-width",.7);
      axG.append("line").attr("x1",X).attr("x2",X).attr("y1",axisY).attr("y2",axisY+4).attr("stroke",C.muted);
      const tw=textW(tick49(v),11.5); V.t(axG,clamp(X,m.l+tw/2,w-m.r-tw/2),axisY+17,tick49(v),{size:11.5,fill:C.muted,anchor:"middle"}); });
    V.t(axG,w-m.r,axisY+36,S49.log?(mob?"anys enrere · escala logarítmica":"anys enrere · escala logarítmica: cada marca, 10 vegades més a prop d'avui"):"anys enrere · escala lineal",{size:11.5,fill:C.ink2,anchor:"end",italic:true}); }
  function note(x,anim){ ntG.selectAll("*").remove(); if(S49.log)return;
    const sap=EV49.find(e=>e.id==="sapiens"); if(!sap||sap.a>S49.L)return;
    const px=x(0)-x(sap.a), X=x(0)-1;
    const txt=px<1?"menys d'un píxel":`${f0(px)} ${Math.round(px)===1?"píxel":"píxels"}`;
    V.note(ntG,{x:X,y:axisY-3,tx:X-(mob?14:22),ty:14,kind:"elbow",anchor:"end",size:mob?12:12.5,lines:[["D'Homo sapiens fins avui",true],[txt+" en aquesta escala"]]});
    if(anim&&!V.reduced)ntG.style("opacity",0).transition().delay(700).duration(400).style("opacity",1); else ntG.style("opacity",1); }
  let x=mkX(), lay=layout(x);
  const evs=evG.selectAll("g.ev").data(EV49,d=>d.id).join("g").attr("class","ev");
  evs.append("line").attr("class","st").attr("stroke",C.ink2).attr("stroke-width",.7);
  evs.append("circle").attr("class","dt").attr("cy",axisY).attr("fill","#fff").attr("stroke",C.ink).attr("stroke-width",1.2);
  const lbl=evs.append("g").attr("class","lb");
  lbl.append("text").attr("class","n").attr("font-size",12.5).attr("font-weight",700).attr("fill",C.ink);
  lbl.append("text").attr("class","a").attr("font-size",11.5).attr("fill",C.muted).style("font-variant-numeric","tabular-nums");
  lbl.selectAll("text").call(V.halo,3);
  function place(sel,lay,dur){
    const T=dur?sel.transition().duration(dur).ease(EIO):sel;
    T.attr("transform",d=>`translate(${lay[d.id]?lay[d.id].X:-999},0)`).attr("opacity",d=>lay[d.id]&&lay[d.id].X>=m.l-1&&lay[d.id].X<=w-m.r+1?1:0);
    const st=dur?sel.select("line.st").transition().duration(dur).ease(EIO):sel.select("line.st");
    st.attr("y1",axisY-4).attr("y2",d=>{ const L=lay[d.id]; return L&&L.lane>=0?laneY(L.lane)-11:axisY-4; });
    sel.select("circle.dt").attr("r",d=>{ const L=lay[d.id]; return L&&L.lane>=0?3.6:2.4; }).attr("stroke",d=>{ const L=lay[d.id]; return L&&L.lane>=0?C.ink:C.muted; });
    sel.select("g.lb").each(function(d){ const L=lay[d.id], gg=d3.select(this);
      if(!L||L.lane<0){ gg.attr("display","none"); return; }
      const dx=L.anc==="start"?4:-4, Y=laneY(L.lane);
      gg.attr("display",null).attr("text-anchor",L.anc);
      gg.select("text.n").attr("x",dx).attr("y",Y).text(L.nm);
      gg.select("text.a").attr("x",dx).attr("y",Y+13).text(L.ag); });
  }
  axis(x); place(evs,lay,0); note(x,false);
  function update(anim){ x=mkX(); const nl=layout(x); hlG.selectAll("*").remove(); tp.hide(); unfocus(evs); cur49=null;
    if(anim&&!V.reduced){ evs.select("g.lb").interrupt().transition().duration(150).style("opacity",0);
      evs.interrupt().transition().duration(1000).ease(EIO).attr("transform",d=>`translate(${nl[d.id]?nl[d.id].X:-999},0)`).attr("opacity",d=>nl[d.id]?1:0);
      evs.select("line.st").interrupt().transition().duration(1000).ease(EIO).attr("y2",axisY-4);
      axG.transition().duration(200).style("opacity",0); gridG.transition().duration(200).style("opacity",0);
      setTimeout(()=>{ lay=nl; axis(x); place(evs,lay,0); axG.style("opacity",1); gridG.style("opacity",0).transition().duration(300).style("opacity",1);
        evs.select("line.st").attr("y2",axisY-4).transition().duration(450).attr("y2",d=>{ const L=lay[d.id]; return L&&L.lane>=0?laneY(L.lane)-11:axisY-4; });
        evs.select("g.lb").style("opacity",0).transition().delay(250).duration(350).style("opacity",1); },1020);
      note(x,true); }
    else { lay=nl; axis(x); place(evs,lay,0); evs.select("g.lb").style("opacity",1); note(x,false); } }
  el._update=update;
  // entrada: els fets apareixen del més antic al més recent
  entry(el,instant=>{ if(instant)return;
    evs.select("line.st").attr("y2",axisY-4).transition().delay((d,i)=>200+i*70).duration(500).ease(EIO).attr("y2",d=>{ const L=lay[d.id]; return L&&L.lane>=0?laneY(L.lane)-11:axisY-4; });
    evs.select("circle.dt").attr("r",0).transition().delay((d,i)=>i*70).duration(400).attr("r",d=>{ const L=lay[d.id]; return L&&L.lane>=0?3.6:2.4; });
    evs.select("g.lb").style("opacity",0).transition().delay((d,i)=>450+i*70).duration(400).style("opacity",1); });
  // hover: el fet més proper (zona de 30 px). El punt s'omple en tinta, la tija s'engruixeix, la resta s'apaga;
  // guia fins a l'eix amb l'edat escrita en negreta sobre l'eix i etiqueta directa si el fet no en tenia.
  const tp=V.tip(el); s.style("cursor","crosshair"); let cur49=null;
  const MESOS=["de gener","de febrer","de març","d'abril","de maig","de juny","de juliol","d'agost","de setembre","d'octubre","de novembre","de desembre"];
  const DM=[31,28,31,30,31,30,31,31,30,31,30,31], TU=13.787e9;
  function cal(a){ const sb=a/TU*31536000; // segons abans de mitjanit del 31 de desembre
    if(sb<60)return `el 31 de desembre, ${f1(sb).replace(/,0$/,"")} s abans de mitjanit`;
    if(sb<3600)return `el 31 de desembre, ${f0(Math.floor(sb/60))} min ${f0(Math.round(sb%60))} s abans de mitjanit`;
    let t=31536000-sb, d=Math.floor(t/86400), mo=0; const hh=Math.floor((t%86400)/3600), mm=Math.floor((t%3600)/60);
    while(d>=DM[mo]){ d-=DM[mo]; mo++; } return `el ${d+1} ${MESOS[mo]}, a les ${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`; }
  V.hover(s.node(),(ev,[px,py])=>{
    const vis=EV49.filter(e=>{ const L=lay[e.id]; return L&&L.X>=m.l-1&&L.X<=w-m.r+1; });
    let best=null;
    vis.forEach(e=>{ const L=lay[e.id]; if(L.lane<0)return; const Y=laneY(L.lane), tw=Math.max(textW(L.nm,12.5,700),textW(L.ag,11.5)), b0=L.anc==="start"?L.X:L.X-tw, b1=L.anc==="start"?L.X+tw:L.X;
      if(py>Y-14&&py<Y+16&&px>=b0-4&&px<=b1+4)best=e; });
    if(!best){ best=d3.least(vis,e=>Math.abs(lay[e.id].X-px)); if(best&&Math.abs(lay[best.id].X-px)>30)best=null; }
    if(!best){ leave49(); return; }
    const L=lay[best.id];
    if(cur49!==best){ cur49=best; hlG.selectAll("*").remove(); V.focus(evs,d=>d===best,{dim:.22}); evs.filter(d=>d===best).raise();
      const top=L.lane>=0?laneY(L.lane)-11:axisY-4;
      hlG.append("line").attr("x1",L.X).attr("x2",L.X).attr("y1",axisY+4).attr("y2",axisY+6).attr("stroke",C.ink);
      if(L.lane>=0)hlG.append("line").attr("x1",L.X).attr("x2",L.X).attr("y1",axisY-4).attr("y2",top).attr("stroke",C.ink).attr("stroke-width",1.5);
      hlG.append("circle").attr("cx",L.X).attr("cy",axisY).attr("r",5).attr("fill",C.ink).attr("stroke","#fff").attr("stroke-width",1.5);
      // valor sobre l'eix
      const at=best.a<1000?String(2026-Math.round(best.a)):age49(best.a,best.u).replace(/^fa /,""), aw=textW(at,11.5,700)/2+5, AX=clamp(L.X,m.l+aw,w-m.r-aw);
      hlG.append("rect").attr("x",AX-aw).attr("y",axisY+5).attr("width",2*aw).attr("height",17).attr("fill","#fff");
      V.t(hlG,AX,axisY+18,at,{anchor:"middle",size:11.5,weight:700});
      // etiqueta directa per als fets que no en tenien
      if(L.lane<0){ const nm=best.s||best.t, tw=Math.max(textW(nm,12.5,700),textW(age49(best.a,best.u),11.5)), right=L.X+8+tw<w-m.r, Y=axisY-28;
        hlG.append("line").attr("x1",L.X).attr("x2",L.X).attr("y1",axisY-4).attr("y2",Y-12).attr("stroke",C.ink).attr("stroke-width",1.5);
        V.lines(hlG,right?L.X+5:L.X-5,Y-1,[[nm,true],[age49(best.a,best.u)]],{anchor:right?"start":"end",size:12.5,halo:4}); } }
    const prec=v=>v>=1e6?`${IBV.fmt(",.3~f")(v/1e6)} milions d'anys`:age49(v).replace(/^fa /,""), ia=prec(best.hi), ib=prec(best.lo), rng=best.a>=1000&&ia!==ib?`<br>Interval: entre ${ia} i ${ib}`:"";
    tp.show(`<b>${best.t}</b><br><b>${age49(best.a,best.u)}</b>${rng}<br>Si la història de l'univers fos un any: ${cal(best.a)}<br><span style="color:${C.muted}">${best.src}</span>`,L.X,Math.min(py,axisY-30)); },leave49);
  function leave49(){ if(!cur49)return; cur49=null; hlG.selectAll("*").remove(); V.focus(evs,null); tp.hide(); }
  // zoom amb Ctrl + roda o amb pessic al trackpad
  s.on("wheel.ibx",ev=>{ if(!(ev.ctrlKey||ev.metaKey))return; ev.preventDefault();
    const r=$('[data-rng="49"]'); if(!r)return; r.value=clamp(+r.value+ev.deltaY*(ev.ctrlKey&&Math.abs(ev.deltaY)<10?-6:-1.2),0,1000); r.dispatchEvent(new Event("input")); });
});
seg(49,k=>{ S49.log=k==="log"; const el=$('[data-p="49"]'); el&&el._update&&el._update(true); });
(function(){ const r=$('[data-rng="49"]'); if(!r)return; const out=$('[data-out="49"]');
  const lab=()=>{ const t=S49.L>=1.379e10?"Des del Big Bang":`Des de ${age49(S49.L).replace(/^fa /,"fa ")}`; r.setAttribute("aria-valuetext",t); if(out)out.textContent=t; };
  r.value=v2sl(S49.L); lab();
  r.addEventListener("input",()=>{ S49.L=sl2v(+r.value); lab(); const el=$('[data-p="49"]'); el&&el._update&&el._update(false); }); })();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>M49.redraw());

/* =====================================================================
   IB-50 · COORDENADES PARAL·LELES  (dades d'exemple)
   500 línies translúcides; arrossegant sobre un eix es filtra (brush).
   ===================================================================== */
const D50=[{k:"m2",t:"Superfície",s:"Mida",u:"m²",dom:[20,220]},{k:"edat",t:"Antiguitat",s:"Edat",u:"anys",dom:[0,100]},{k:"preu",t:"Preu",u:"€/m²",dom:[1000,7000]},
  {k:"dist",t:"Distància",u:"km",dom:[0,30]},{k:"val",t:"Valoració",u:"0–10",dom:[0,10]},{k:"cons",t:"Consum",u:"kWh/m²",dom:[20,300]}];
const G50=[{t:"Barri A",c:C.vermell},{t:"Barri B",c:C.blau},{t:"Barri C",c:C.ink2}];
const R50=(function(){ const r=V.rng(50); return d3.range(500).map(i=>{ const g=r()<.3?0:r()<.55?1:2;
  const dist=clamp(g===0?1+Math.abs(V.gauss(r))*2.5:g===1?6+r()*8:12+r()*16,0,30);
  const preu=clamp(6400-dist*170+V.gauss(r)*520-(g===2?400:0),1000,7000);
  const m2=clamp(48+dist*3.6+V.gauss(r)*22+(g===2?20:0),20,220);
  const edat=clamp(g===0?55+V.gauss(r)*22:g===1?35+V.gauss(r)*18:14+Math.abs(V.gauss(r))*14,0,100);
  const val=clamp(4+preu/1600+V.gauss(r)*1.1,0,10);
  const cons=clamp(50+edat*1.9+V.gauss(r)*30,20,300);
  return {id:i,n:"Habitatge "+(i+1),g,m2,edat,preu,dist,val,cons}; }); })();
const B50={};
const fmt50={m2:f0,edat:f0,preu:v=>f0(Math.round(v/10)*10),dist:f1,val:f1,cons:f0};
legend(50,el=>V.legendCat(el,G50.map(d=>({c:d.c,t:d.t,kind:"line",w:2})).concat([{c:C.ghost,t:"Fora del filtre",kind:"line",w:2}])));
function count50(){ const n=R50.filter(pass50).length, o=$('[data-out="50"]'); if(o)o.textContent=Object.keys(B50).length?`${f0(n)} de ${f0(R50.length)} habitatges passen pels filtres`:`${f0(R50.length)} habitatges · arrossega sobre un eix per filtrar`; }
function pass50(d){ for(const k in B50){ const b=B50[k]; if(d[k]<b[0]||d[k]>b[1])return false; } return true; }
const M50=piece(50,(el,w)=>{
  const mob=w<640, h=mob?380:480, m={t:46,b:mob?24:64,l:mob?14:26,r:mob?14:26};
  const {ctx,s}=layer(el,w,h,"Coordenades paral·leles de 500 habitatges amb sis variables: superfície, antiguitat, preu, distància al centre, valoració i consum. Els habitatges més cars són a prop del centre i tenen més valoració. Dades d'exemple.");
  const x=d3.scalePoint(D50.map(d=>d.k),[m.l,w-m.r]), Y={}; D50.forEach(d=>Y[d.k]=d3.scaleLinear(d.dom,[h-m.b,m.t]));
  const xs=D50.map(d=>x(d.k));
  const tp=V.tip(el);
  function curve(c,d){ D50.forEach((a,i)=>{ const X=xs[i], yv=Y[a.k](d[a.k]); if(i===0)c.moveTo(X,yv); else { const X0=xs[i-1], y0=Y[D50[i-1].k](d[D50[i-1].k]), mx=(X0+X)/2; c.bezierCurveTo(mx,y0,mx,yv,X,yv); } }); }
  // Lleuger: cada capa (fora del filtre i un barri per capa) es pinta un cop en un canvas fora de pantalla quan canvia el filtre;
  // el hover només recompon les capes amb una altra opacitat (4 drawImage), sense tornar a traçar les 500 corbes.
  let prog=1, hov=null;
  const dpr=Math.min(2,window.devicePixelRatio||1), mk=()=>{ const c=document.createElement("canvas"); c.width=w*dpr; c.height=h*dpr; const x2=c.getContext("2d"); x2.scale(dpr,dpr); return x2; };
  const LAY=[mk()].concat(G50.map(mk));
  function build(){ const any=Object.keys(B50).length;
    LAY.forEach(c=>c.clearRect(0,0,w,h));
    const gc=LAY[0]; gc.lineWidth=.7; gc.strokeStyle=V.alpha(C.ghost,.32);
    if(any){ gc.beginPath(); R50.forEach(d=>{ if(!pass50(d))curve(gc,d); }); gc.stroke(); }
    G50.forEach((gr,gi)=>{ const c=LAY[gi+1]; c.beginPath(); R50.forEach(d=>{ if(d.g===gi&&(!any||pass50(d)))curve(c,d); }); c.strokeStyle=V.alpha(gr.c,any?.5:.26); c.lineWidth=any?.9:.75; c.stroke(); }); }
  function compose(){ ctx.clearRect(0,0,w,h); ctx.save(); ctx.beginPath(); ctx.rect(0,0,m.l+(w-m.l)*prog,h); ctx.clip();
    LAY.forEach((c,i)=>{ ctx.globalAlpha=hov?(i===0?.45:hov.g===i-1?1:.3):1; ctx.drawImage(c.canvas,0,0,w,h); }); ctx.globalAlpha=1; ctx.restore(); }
  function render(){ build(); compose(); }
  const g=s.append("g");
  // eixos
  D50.forEach((a,i)=>{ const X=xs[i], ax=g.append("g");
    ax.append("line").attr("x1",X).attr("x2",X).attr("y1",m.t).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.9);
    const anc=i===0?"start":i===D50.length-1?"end":"middle", dx=i===0?-m.l+2:i===D50.length-1?m.r-2:0;
    V.t(ax,X+dx,m.t-24,mob&&a.s?a.s:a.t,{anchor:anc,weight:700,size:mob?11.5:12.5});
    V.t(ax,X+dx,m.t-10,a.u,{anchor:anc,size:11,fill:C.muted});
    const tks=[a.dom[0],(a.dom[0]+a.dom[1])/2,a.dom[1]];
    tks.forEach((v,j)=>{ ax.append("line").attr("x1",X-3).attr("x2",X).attr("y1",Y[a.k](v)).attr("y2",Y[a.k](v)).attr("stroke",C.ink);
      if(!mob||j!==1)V.t(ax,i===D50.length-1?X-5:X+5,Y[a.k](v)+(j===0?-5:j===2?13:4),fmt50[a.k](v),{size:11,fill:C.muted,anchor:i===D50.length-1?"end":"start",halo:2.5}); }); });
  const hl=g.append("g"), bg=g.append("g"), ng=g.append("g");
  // nota
  if(!mob){ const X=xs[3]-(xs[3]-xs[2])*.18, Yp=Y.dist(1.5)-2;
    V.note(ng,{x:X,y:Yp,tx:xs[2]+8,ty:h-28,kind:"elbow",anchor:"start",dot:true,lines:[["Cars i a prop del centre",true],["les línies vermelles baixen de cop entre preu i distància"]]}); }
  // pinzells
  D50.forEach((a,i)=>{ const X=xs[i];
    const br=d3.brushY().extent([[X-12,m.t-2],[X+12,h-m.b+2]]).on("start brush end",ev=>{
      if(ev.selection){ const [y0,y1]=ev.selection; B50[a.k]=[Y[a.k].invert(y1),Y[a.k].invert(y0)]; } else delete B50[a.k];
      hov=null; render(); count50(); hl.selectAll("*").remove(); tp.hide(); });
    const bgi=bg.append("g").call(br);
    bgi.select(".selection").attr("fill",C.ink).attr("fill-opacity",.05).attr("stroke",C.ink).attr("stroke-width",1).attr("shape-rendering","crispEdges");
    if(B50[a.k])bgi.call(br.move,[Y[a.k](B50[a.k][1]),Y[a.k](B50[a.k][0])]);
    el["_br"+i]=()=>bgi.call(br.move,null); });
  render(); count50();
  // entrada: les línies es dibuixen d'esquerra a dreta
  entry(el,instant=>{ if(instant)return; prog=0; render(); ng.style("opacity",0);
    const t=d3.timer(e=>{ prog=Math.min(1,EIO(e/1600)); compose(); if(prog>=1){ t.stop(); ng.transition().duration(500).style("opacity",1); } }); });
  // hover: la línia més propera (zona de 14 px) en tinta i al davant; el seu barri es manté i la resta s'apaga;
  // el valor escrit en negreta sobre cada eix i el nom al costat del punter.
  s.style("cursor","crosshair");
  const pctl=(k,v)=>R50.filter(q=>q[k]<v).length/R50.length;
  function sAt(t){ let lo=0,hi=1; for(let k=0;k<14;k++){ const mid=(lo+hi)/2, xv=1.5*mid-1.5*mid*mid+mid*mid*mid; if(xv<t)lo=mid; else hi=mid; } return (lo+hi)/2; }
  function leave50(){ if(!hov)return; hov=null; hl.selectAll("*").remove(); tp.hide(); compose(); }
  V.hover(s.node(),(ev,[px,py])=>{ if(px<xs[0]-8||px>xs[xs.length-1]+8){ leave50(); return; }
    px=clamp(px,xs[0],xs[xs.length-1]); let i=0; while(i<xs.length-2&&px>xs[i+1])i++;
    const t=(px-xs[i])/(xs[i+1]-xs[i]), sv=sAt(t), f=3*sv*sv-2*sv*sv*sv, a=D50[i].k, b=D50[i+1].k, any=Object.keys(B50).length;
    let best=null,bd=14,by=0; R50.forEach(d=>{ if(any&&!pass50(d))return; const yy=Y[a](d[a])+(Y[b](d[b])-Y[a](d[a]))*f, dd=Math.abs(yy-py); if(dd<bd){bd=dd;best=d;by=yy;} });
    if(!best){ leave50(); return; }
    if(hov!==best){ hov=best; compose(); hl.selectAll("*").remove();
      const p=d3.path(); curve(p,best);
      hl.append("path").attr("d",p.toString()).attr("fill","none").attr("stroke","#fff").attr("stroke-width",4.5);
      hl.append("path").attr("d",p.toString()).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.8);
      D50.forEach((d,j)=>{ const X=xs[j], yv=Y[d.k](best[d.k]), last=j===D50.length-1, tx=fmt50[d.k](best[d.k]), tw=textW(tx,11.5,700)+6;
        hl.append("line").attr("x1",X-6).attr("x2",X+6).attr("y1",yv).attr("y2",yv).attr("stroke",C.ink).attr("stroke-width",1.5);
        hl.append("rect").attr("x",last?X-8-tw:X+6).attr("y",yv-17).attr("width",tw).attr("height",15).attr("fill","#fff");
        V.t(hl,last?X-11:X+9,yv-6,tx,{size:11.5,weight:700,anchor:last?"end":"start"});
        hl.append("circle").attr("cx",X).attr("cy",yv).attr("r",3.4).attr("fill",G50[best.g].c).attr("stroke",C.ink).attr("stroke-width",1); }); }
    hl.selectAll(".ibx-nm").remove();
    const nw=textW(best.n,12.5,700), right=px+12+nw<w;
    V.t(hl,right?px+10:px-10,by+18,best.n,{anchor:right?"start":"end",weight:700,size:12.5,halo:4}).attr("class","ibx-nm");
    tp.show(`<b>${best.n}</b> · ${DOT(G50[best.g].c)} ${G50[best.g].t}<br><b>${fmt50.preu(best.preu)} €/m²</b> · ${f0(best.m2)} m² · ${f1(best.dist)} km del centre<br>Més car que el ${pct(pctl("preu",best.preu))} dels habitatges · valoració ${f1(best.val)}`,px,by); },leave50);
});
(function(){ const b=$('[data-reset="50"]'); if(!b)return; b.addEventListener("click",()=>{ const el=$('[data-p="50"]'); if(!el)return; D50.forEach((a,i)=>el["_br"+i]&&el["_br"+i]()); Object.keys(B50).forEach(k=>delete B50[k]); count50(); }); })();
void M50;

/* =====================================================================
   IB-51 · BARRA QUE ES TRENCA  (dades d'exemple)
   Un total sòlid que es trenca en unitats que volen a agrupar-se.
   ===================================================================== */
const G51=[{t:"Grup A",n:96},{t:"Grup B",n:62},{t:"Grup C",n:41},{t:"Grup D",n:26},{t:"Grup E",n:15}].map((d,i)=>Object.assign(d,{c:V.CAT6[i]}));
const TOT51=d3.sum(G51,d=>d.n);
const U51=(function(){ const r=V.rng(51), out=[]; let k=0; G51.forEach((gr,gi)=>{ for(let i=0;i<gr.n;i++)out.push({k:k++,gi,i,lift:40+r()*90,jit:r()}); }); return out; })();
let mode51=1, touched51=false;
legend(51,el=>V.legendCat(el,G51.map(d=>({c:d.c,t:d.t})).concat([{t:"1 quadradet = 1 unitat",kind:"none"}])));
const M51=piece(51,(el,w)=>{
  const mob=w<640, h=mob?270:370;
  const s=V.svg(el,w,h,`Una barra amb un total de ${TOT51} unitats es trenca en ${TOT51} quadradets que s'agrupen en cinc grups: ${G51.map(d=>d.n).join(", ")}. Dades d'exemple.`), g=s.append("g");
  const lay={};
  // 0 · sencera
  (function(){ const cols=60, rows=4, cell=Math.min(15,(w-4)/cols), x0=(w-cols*cell)/2, y0=h/2-rows*cell/2+10;
    lay[0]={u:U51.map(u=>({x:x0+Math.floor(u.k/rows)*cell,y:y0+(u.k%rows)*cell,s:cell+.6,c:C.ink2,rx:0})),x0,y0,W:cols*cell,H:rows*cell}; })();
  // 1 · per grup: columnes de quadradets
  (function(){ const per=6, gap=mob?2:2.6, cell=Math.min(16,(w-4)/(G51.length*per+(G51.length-1)*gap)), W=(G51.length*per+(G51.length-1)*gap)*cell, x0=(w-W)/2, base=h-34;
    const cols=G51.map((gr,gi)=>x0+gi*(per+gap)*cell);
    lay[1]={u:U51.map(u=>({x:cols[u.gi]+(u.i%per)*cell+cell*.09,y:base-(Math.floor(u.i/per)+1)*cell+cell*.09,s:cell*.82,c:G51[u.gi].c,rx:1})),cols,cell,per,base}; })();
  // 2 · reixa
  (function(){ const cols=20, rows=Math.ceil(TOT51/cols), cell=Math.min(17,(w-4)/cols,(h-40)/rows), x0=mob?(w-cols*cell)/2:Math.max(0,w/2-cols*cell/2-90), y0=(h-rows*cell)/2+6;
    lay[2]={u:U51.map(u=>({x:x0+(u.k%cols)*cell+cell*.09,y:y0+Math.floor(u.k/cols)*cell+cell*.09,s:cell*.82,c:G51[u.gi].c,rx:1})),x0,y0,cell,cols}; })();
  const us=g.append("g").selectAll("rect").data(U51).join("rect").attr("class","ibx-u");
  const lab=g.append("g");
  function set(md){ us.attr("x",u=>lay[md].u[u.k].x).attr("y",u=>lay[md].u[u.k].y).attr("width",u=>lay[md].u[u.k].s).attr("height",u=>lay[md].u[u.k].s).attr("rx",u=>lay[md].u[u.k].rx).attr("fill",u=>lay[md].u[u.k].c); }
  function labels(md,anim){ lab.selectAll("*").remove(); const L=lay[md];
    if(md===0){ V.t(lab,L.x0,L.y0-16,f0(TOT51),{serif:true,weight:600,size:mob?24:30});
      V.t(lab,L.x0+textW(f0(TOT51),mob?24:30,600)+8,L.y0-16,"unitats en total, en una sola barra",{size:mob?12:13,fill:C.ink2});
      V.note(lab,{x:L.x0+L.W*.8,y:L.y0+L.H+2,tx:L.x0+L.W*.8-20,ty:L.y0+L.H+40,kind:"elbow",anchor:"end",size:mob?12:12.5,lines:[["Què hi ha dins?",true],["toca «Per grup» per trencar-la"]]}); }
    else if(md===1){ G51.forEach((gr,gi)=>{ const X=L.cols[gi], top=L.base-Math.ceil(gr.n/L.per)*L.cell;
        V.t(lab,X,top-(mob?20:22),f0(gr.n),{serif:true,weight:600,size:mob?16:20});
        V.t(lab,X,top-6,pct(gr.n/TOT51),{size:11.5,fill:C.muted});
        V.t(lab,X,L.base+16,gr.t,{size:mob?11.5:12.5,weight:700}); });
      lab.append("line").attr("x1",L.cols[0]-4).attr("x2",L.cols[G51.length-1]+L.per*L.cell+4).attr("y1",L.base+1).attr("y2",L.base+1).attr("stroke",C.ink); }
    else { if(!mob){ let k=0; G51.forEach(gr=>{ const r0=Math.floor(k/L.cols), r1=Math.floor((k+gr.n-1)/L.cols), Ym=L.y0+((r0+r1+1)/2)*L.cell, X=L.x0+L.cols*L.cell+14;
        lab.append("line").attr("x1",X-8).attr("x2",X-4).attr("y1",Ym).attr("y2",Ym).attr("stroke",C.ink2);
        V.t(lab,X,Ym+4,`${gr.t} · ${gr.n} (${pct(gr.n/TOT51)})`,{size:12.5}); k+=gr.n; }); }
      V.t(lab,L.x0,L.y0-10,`${TOT51} unitats en una reixa de ${L.cols} columnes`,{size:12,fill:C.ink2}); }
    if(anim&&!V.reduced)lab.style("opacity",0).transition().delay(950).duration(450).style("opacity",1); else lab.style("opacity",1); }
  function fly(from,to){ const A=lay[from].u, B=lay[to].u;
    us.interrupt().transition().delay(u=>from===0?Math.floor(u.k/4)*9+u.jit*120:to===0?(TOT51-u.k)*2+u.jit*80:u.gi*70+u.jit*160).duration(950).ease(EIO)
      .attrTween("x",u=>{ const a=A[u.k],b=B[u.k],c=(a.x+b.x)/2+(u.jit-.5)*40; return t=>(1-t)*(1-t)*a.x+2*(1-t)*t*c+t*t*b.x; })
      .attrTween("y",u=>{ const a=A[u.k],b=B[u.k],c=Math.min(a.y,b.y)-u.lift; return t=>(1-t)*(1-t)*a.y+2*(1-t)*t*c+t*t*b.y; })
      .attr("width",u=>B[u.k].s).attr("height",u=>B[u.k].s).attr("rx",u=>B[u.k].rx).attr("fill",u=>B[u.k].c); }
  set(mode51); labels(mode51,false);
  el._go=md=>{ if(md===mode51)return; leave51(); const from=mode51; mode51=md; tp.hide(); unfocus(us);
    if(V.reduced){ set(md); labels(md,false); return; } fly(from,md); labels(md,true); };
  // entrada: la barra creix sencera i després es trenca
  entry(el,instant=>{ if(instant||touched51)return; mode51=0; setSeg(51,0); set(0); labels(0,false);
    const id="cl51"+Math.random().toString(36).slice(2,7), L=lay[0];
    const cp=s.append("defs").append("clipPath").attr("id",id).append("rect").attr("x",L.x0-2).attr("y",0).attr("height",h).attr("width",0);
    g.attr("clip-path",`url(#${id})`); lab.style("opacity",0);
    cp.transition().duration(900).ease(EIO).attr("width",L.W+4).on("end",()=>{ g.attr("clip-path",null); lab.transition().duration(300).style("opacity",1);
      setTimeout(()=>{ if(mode51===0&&!touched51){ setSeg(51,1); el._go(1); } },1400); }); });
  // hover: el quadradet més proper es contorneja en tinta i passa al davant; el seu grup es ressalta i la resta s'apaga.
  // Guia fins a l'escala (sota la barra, al costat de la columna o de la reixa) amb el valor en negreta i etiqueta directa.
  const tp=V.tip(el), hv=g.append("g").style("pointer-events","none"); s.style("cursor","pointer"); let curU=null;
  const first=G51.map((gr,gi)=>U51.find(u=>u.gi===gi).k);
  function leave51(){ if(!curU)return; curU=null; hv.selectAll("*").remove(); V.focus(us,null); us.attr("stroke",null).attr("stroke-width",null); lab.transition().duration(160).style("opacity",1); tp.hide(); }
  V.hover(s.node(),(ev,[px,py])=>{ const P=lay[mode51].u, u=d3.least(U51,q=>{ const p=P[q.k]; return Math.hypot(px-(p.x+p.s/2),py-(p.y+p.s/2)); });
    const p=u&&P[u.k]; if(!u||Math.hypot(px-(p.x+p.s/2),py-(p.y+p.s/2))>Math.max(14,p.s*1.6)){ leave51(); return; }
    const gr=G51[u.gi];
    if(curU!==u){ curU=u; hv.selectAll("*").remove(); V.focus(us,q=>q.gi===u.gi,{dim:.48}); lab.transition().duration(160).style("opacity",.5);
      us.attr("stroke",null).attr("stroke-width",null); us.filter(q=>q===u).raise().attr("stroke",C.ink).attr("stroke-width",1.5);
      if(mode51===0){ const L=lay[0], c0=first[u.gi], c1=c0+gr.n-1, X0=L.x0+Math.floor(c0/4)*(L.W/60), X1=L.x0+(Math.floor(c1/4)+1)*(L.W/60), Yb=L.y0+L.H+8;
        hv.append("path").attr("d",`M${X0},${Yb-4}V${Yb}H${X1}V${Yb-4}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
        const lb=`${gr.t} · ${gr.n} de ${TOT51}`, lw=textW(lb,12.5,700), Xm=clamp((X0+X1)/2,lw/2+2,w-lw/2-2);
        V.t(hv,Xm,Yb+16,lb,{anchor:"middle",weight:700,size:12.5,halo:4});
        hv.append("line").attr("x1",p.x+p.s/2).attr("x2",p.x+p.s/2).attr("y1",p.y+p.s).attr("y2",Yb).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2"); }
      else if(mode51===1){ const L=lay[1], row=Math.floor(u.i/L.per), upto=Math.min(gr.n,(row+1)*L.per), X0=L.cols[0]-8, Yr=p.y+p.s/2;
        hv.append("line").attr("x1",X0).attr("x2",p.x).attr("y1",Yr).attr("y2",Yr).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
        V.t(hv,X0-3,Yr+4,f0(upto),{anchor:"end",weight:700,size:11.5,halo:3});
        const X=L.cols[u.gi], top=L.base-Math.ceil(gr.n/L.per)*L.cell, lb=`${gr.t} · ${gr.n} (${pct(gr.n/TOT51)})`, lw=textW(lb,12.5,700);
        V.t(hv,clamp(X,2,w-lw-2),top-8,lb,{weight:700,size:12.5,halo:4}); }
      else { const L=lay[2], r0=Math.floor(first[u.gi]/L.cols), r1=Math.floor((first[u.gi]+gr.n-1)/L.cols), Xr=L.x0+L.cols*L.cell+6;
        const lb=`${gr.t} · ${gr.n} (${pct(gr.n/TOT51)})`, lw=textW(lb,12.5,700);
        if(Xr+14+lw<w){ hv.append("path").attr("d",`M${Xr},${L.y0+r0*L.cell+2}h4V${L.y0+(r1+1)*L.cell-2}h-4`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.2);
          hv.append("line").attr("x1",p.x+p.s).attr("x2",Xr).attr("y1",p.y+p.s/2).attr("y2",p.y+p.s/2).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
          V.t(hv,Xr+10,L.y0+((r0+r1+1)/2)*L.cell+4,lb,{weight:700,size:12.5,halo:4}); }
        else V.t(hv,L.x0,L.y0-10,lb,{weight:700,size:12.5,halo:4}); } }
    const pos=u.i+1;
    tp.show(`<b>${gr.t}</b><br><b>${gr.n}</b> de ${TOT51} unitats · ${pct(gr.n/TOT51)} del total<br>Aquest quadradet: el número ${pos} del grup`,p.x+p.s/2,p.y); },leave51);
});
seg(51,k=>{ touched51=true; const el=$('[data-p="51"]'); if(el&&el._go)el._go(+k); else mode51=+k; });
void M51;

/* =====================================================================
   IB-52 · MENTRE LLEGEIXES  (taxes d'exemple)
   Comptadors que pugen en temps real des que la peça és a la vista.
   ===================================================================== */
const R52=[{t:"Tipus A",r:2.4},{t:"Tipus B",r:1.1},{t:"Tipus C",r:.42},{t:"Tipus D",r:.12}].map((d,i)=>Object.assign(d,{c:V.CAT6[i]}));
const S52={T:0,play:true,hov:-1,hovK:-1};
function reset52(){ S52.T=0; S52.rng=V.rng(52); S52.ev=R52.map(()=>[]); S52.next=R52.map((d,i)=>-Math.log(1-S52.rng())/d.r); S52.cell=R52.map(()=>14); }
function step52(T){ R52.forEach((d,i)=>{ while(S52.next[i]<=T){ S52.ev[i].push(S52.next[i]); S52.next[i]+=-Math.log(1-S52.rng())/d.r; } }); }
reset52();
if(V.reduced){ S52.T=60; step52(60); }
legend(52,el=>V.legendCat(el,R52.map(d=>({c:d.c,t:`${d.t} · ${f1(d.r)} per segon`})).concat([{t:"1 punt = 1 esdeveniment",kind:"none"}])));
function btn52(){ const b=$('[data-play="52"]'); if(b)b.textContent=S52.play?"Pausa":"Continua"; }
const M52=piece(52,(el,w)=>{
  if(el._lp){ el._lp.stop(); el._lp=null; } S52.hov=-1;
  const mob=w<640, top=mob?54:46, rowH=mob?96:72, h=top+R52.length*rowH, LW=mob?0:230, fx=mob?0:LW, fw=w-fx-2, fh=mob?44:48, NR=5;
  const {ctx,s}=layer(el,w,h,"Quatre comptadors que pugen en temps real mentre la peça és a la vista, cadascun amb la seva taxa per segon; cada esdeveniment afegeix un punt a la seva fila. Taxes d'exemple.");
  const g=s.append("g");
  const elapsed=V.t(g,0,18,"",{size:mob?12:12.5,fill:C.ink2});
  const cnt=[], fy=[];
  R52.forEach((d,i)=>{ const Y=top+i*rowH;
    g.append("line").attr("x1",0).attr("x2",w).attr("y1",Y).attr("y2",Y).attr("stroke",C.grid);
    if(mob){ g.append("circle").attr("cx",5).attr("cy",Y+15).attr("r",4.5).attr("fill",d.c);
      V.t(g,15,Y+19,d.t,{weight:700,size:12.5}); V.t(g,15+textW(d.t,12.5,700)+8,Y+19,`${f1(d.r)} per segon`,{size:11.5,fill:C.muted});
      cnt.push(V.t(g,w,Y+22,"0",{anchor:"end",serif:true,weight:600,size:22})); fy.push(Y+36); }
    else { g.append("circle").attr("cx",5).attr("cy",Y+20).attr("r",5).attr("fill",d.c);
      V.t(g,16,Y+24,d.t,{weight:700,size:13}); V.t(g,16,Y+41,`${f1(d.r)} per segon`,{size:11.5,fill:C.muted});
      cnt.push(V.t(g,LW-24,Y+44,"0",{anchor:"end",serif:true,weight:600,size:30})); fy.push(Y+(rowH-fh)/2+2); } });
  const ng=g.append("g"), hv=g.append("g").style("pointer-events","none");
  if(!mob)V.note(ng,{x:fx+6,y:fy[0]+3,tx:fx+80,ty:24,kind:"elbow",anchor:"start",size:12.5,lines:[["Cada punt, un esdeveniment",true],["apareix just quan passa; la fila es comprimeix per fer-hi lloc"]]});
  function fmtT(T){ const s0=Math.floor(T), mm=Math.floor(s0/60), ss=s0%60; return mm?`${mm} min ${String(ss).padStart(2,"0")} s`:`${ss} s`; }
  // Lleuger: els punts assentats de cada fila es pinten un sol cop en un canvas fora de pantalla (es refà només quan la fila
  // es comprimeix); cada fotograma fa un drawImage per fila + els punts que acaben d'arribar. El DOM només es toca quan canvia.
  const dpr=Math.min(2,window.devicePixelRatio||1), oc=document.createElement("canvas"); oc.width=w*dpr; oc.height=h*dpr; const octx=oc.getContext("2d"); octx.scale(dpr,dpr);
  const RC=R52.map(()=>({cq:-1,ns:0})), shown=R52.map(()=>-1), COL52=R52.map(d=>V.alpha(d.c,.62));
  let lastS=-1, lastHov=-2, lastMark="";
  function render(){ ctx.clearRect(0,0,w,h); const T=S52.T, hov=S52.hov;
    R52.forEach((d,i)=>{ const ev=S52.ev[i], n=ev.length, cols=Math.max(1,Math.ceil((n+1)/NR)), tgt=Math.min(14,fh/NR,fw/cols);
      S52.cell[i]=V.reduced?tgt:S52.cell[i]+(tgt-S52.cell[i])*.08; const cq=Math.round(S52.cell[i]*4)/4, c=cq, rr=Math.max(.6,c*.36), dim=hov>=0&&hov!==i, rc=RC[i];
      if(rc.cq!==cq||rc.ns>n){ rc.cq=cq; rc.ns=0; octx.clearRect(fx-2,fy[i]-2,w-fx+2,fh+16); }
      octx.fillStyle=COL52[i]; octx.beginPath(); let any=false;
      while(rc.ns<n&&(V.reduced||T-ev[rc.ns]>=1.2)){ const k=rc.ns, X=fx+Math.floor(k/NR)*c+c/2, Y=fy[i]+(k%NR)*c+c/2; octx.moveTo(X+rr,Y); octx.arc(X,Y,rr,0,2*Math.PI); rc.ns++; any=true; }
      if(any)octx.fill();
      ctx.globalAlpha=dim?.52:1; const sy=Math.max(0,fy[i]-2); ctx.drawImage(oc,(fx-2)*dpr,sy*dpr,(w-fx+2)*dpr,(fh+16)*dpr,fx-2,sy,w-fx+2,fh+16); ctx.globalAlpha=1;
      if(!V.reduced)for(let k=rc.ns;k<n;k++){ const q=(T-ev[k])/1.2, X=fx+Math.floor(k/NR)*c+c/2, Y=fy[i]+(k%NR)*c+c/2;
        ctx.beginPath(); ctx.arc(X,Y,rr*(1+1.6*(1-q)),0,2*Math.PI); ctx.fillStyle=V.alpha(d.c,dim?.45:.95); ctx.fill();
        ctx.beginPath(); ctx.arc(X,Y,rr+q*14,0,2*Math.PI); ctx.strokeStyle=V.alpha(d.c,(dim?.28:.6)*(1-q)); ctx.lineWidth=2; ctx.stroke(); }
      if(shown[i]!==n){ shown[i]=n; cnt[i].text(f0(n)); }
      if(lastHov!==hov)cnt[i].attr("opacity",dim?.52:1);
      if(hov===i&&n){ const k=clamp(S52.hovK<0?n-1:S52.hovK,0,n-1), X=fx+Math.floor(k/NR)*c+c/2, Y=fy[i]+(k%NR)*c+c/2, age=T-ev[k];
        ctx.beginPath(); ctx.arc(X,Y,rr*1.6,0,2*Math.PI); ctx.fillStyle=d.c; ctx.fill(); ctx.strokeStyle=C.ink; ctx.lineWidth=1.5; ctx.stroke();
        const mk=i+"/"+k+"/"+Math.floor(age)+"/"+X.toFixed(1); if(mk!==lastMark){ lastMark=mk; hvMark(i,k,X,Y,rr,age); } } });
    if(hov<0&&lastMark){ lastMark=""; hv.selectAll("*").remove(); } else if(hov>=0&&S52.tp&&S52.play&&Math.floor(T)!==lastS)tip52();
    lastHov=hov;
    const sec=Math.floor(T); if(sec!==lastS){ lastS=sec; elapsed.text(V.reduced?"Així seria després d'un minut a la vista":`Fa ${fmtT(T)} que tens aquesta peça a la vista`); } }
  el._lp=V.loop(el,(t,dt)=>{ if(S52.play&&!V.reduced){ S52.T+=dt/1000; step52(S52.T); } render(); });
  render();
  entry(el,instant=>{ if(instant)return; ng.style("opacity",0).transition().delay(2500).duration(600).style("opacity",1); });
  // hover: la fila es ressalta i la resta s'apaga; el punt apuntat (o l'últim) es contorneja en tinta,
  // amb una guia fins al comptador de la fila i el número d'esdeveniment escrit al costat.
  const tp=V.tip(el); s.style("cursor","pointer");
  function hvMark(i,k,X,Y,rr,age){ hv.selectAll("*").remove(); const cx0=mob?w-34:LW-20, cy0=mob?top+i*rowH+16:top+i*rowH+36;
    hv.append("path").attr("d",mob?`M${X},${Y-rr-2}V${cy0+10}H${cx0}`:`M${X-rr-2},${Y}H${fx-6}L${cx0+4},${cy0}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
    const lb=`n.º ${f0(k+1)} · fa ${age<60?f0(Math.floor(age))+" s":fmtT(age)}`, lw=textW(lb,12.5,700), right=X+rr+8+lw<w;
    V.t(hv,right?X+rr+7:X-rr-7,Y-rr-5,lb,{anchor:right?"start":"end",weight:700,size:12.5,halo:4}); }
  V.hover(s.node(),(ev,[px,py])=>{ const i=Math.floor((py-top)/rowH); if(i<0||i>=R52.length){ S52.hov=-1; S52.hovK=-1; hv.selectAll("*").remove(); tp.hide(); return; }
    const d=R52[i], n=S52.ev[i].length, c=S52.cell[i];
    let k=-1; if(px>=fx&&n){ const col=Math.floor((px-fx)/c), row=clamp(Math.floor((py-fy[i])/c),0,NR-1); k=col*NR+row; if(k>=n)k=-1; }
    S52.hov=i; S52.hovK=k; S52.tp=[px,py]; ng.style("opacity",.5); tip52(); },()=>{ S52.hov=-1; S52.hovK=-1; hv.selectAll("*").remove(); ng.style("opacity",1); tp.hide(); });
  function tip52(){ const i=S52.hov; if(i<0||!S52.tp)return; const d=R52[i], n=S52.ev[i].length, tot=d3.sum(S52.ev,e=>e.length);
    tp.show(`<b>${d.t}</b><br><b>${f0(n)}</b> esdeveniments des que mires la peça · ${pct(tot?n/tot:0)} de tots<br>${f1(d.r)} per segon · ${f0(d.r*3600)} per hora`,S52.tp[0],S52.tp[1]); }
});
(function(){ const b=$('[data-play="52"]'); if(b)b.addEventListener("click",()=>{ S52.play=!S52.play; btn52(); });
  const z=$('[data-reset="52"]'); if(z)z.addEventListener("click",()=>{ reset52(); if(V.reduced){ S52.T=60; step52(60); } }); btn52(); })();
void M52;

/* =====================================================================
   IB-53 · ANELL DE L'ANY  (dades reals: ONI)
   12 sectors (mesos) amb una barra fina per any; creixen des d'un anell que és el zero.
   ===================================================================== */
const SEASON=["des–feb","gen–març","feb–abr","març–maig","abr–juny","maig–jul","juny–ag","jul–set","ag–oct","set–nov","oct–des","nov–gen"];
const B53=(function(){ const o=D.oni||{}, out=[]; Object.keys(o).map(Number).sort((a,b)=>a-b).forEach(y=>o[y].forEach((v,k)=>{ if(v!=null)out.push({y,k,v}); })); return out; })();
const YRS53=d3.range(d3.min(B53,d=>d.y)||1950,(d3.max(B53,d=>d.y)||2026)+1);
const RANK53=(function(){ const r={}; d3.range(12).forEach(k=>{ B53.filter(d=>d.k===k).sort((a,b)=>a.v-b.v).forEach((d,i)=>r[d.y+"-"+k]=i); }); return r; })();
const MEAN53=d3.range(12).map(k=>d3.mean(B53.filter(d=>d.k===k),d=>Math.abs(d.v)));
let sort53=0;
const DIV53=V.div(2.5);
legend(53,el=>V.legendRamp(el,{scale:DIV53,min:-2.5,max:2.5,ticks:[-2,-1,0,1,2],f:v=>sgn(v,0),title:"Anomalia (°C) · cap enfora, El Niño",lo:"La Niña",hi:"El Niño"}));
const M53=piece(53,(el,w)=>{
  const mob=w<640, S=Math.min(w,mob?w:660), h=S+(mob?0:40), cx=w/2, cy=S/2+(mob?0:40), R=S/2-(mob?24:34), r0=R*.56, k=(R-r0)/2.75;
  // Lleuger: les ~920 barres i els anells van en un canvas; l'SVG només porta text, notes i la capa de hover.
  const {ctx,s}=layer(el,w,h,"Anell amb dotze sectors, un per mes, i una barra per any del 1950 al 2026 a cada sector. Les barres creixen cap enfora quan l'anomalia és càlida (El Niño) i cap endins quan és freda (La Niña). Les més llargues són entre novembre i gener.");
  const cv=ctx.canvas; cv.style.transition="opacity 150ms";
  const g=s.append("g").attr("transform",`translate(${cx},${cy})`);
  const GAP=mob?.26:.2, SEC=(2*Math.PI-GAP)/12, gin=.025, NY=YRS53.length;
  const angOf=d=>{ const p=sort53?RANK53[d.y+"-"+d.k]:(d.y-YRS53[0]); return GAP/2+d.k*SEC+gin+(p+.5)/NY*(SEC-2*gin); };
  const sw=Math.max(.55,(SEC-2*gin)/NY*r0*.78);
  // índex precalculat per al hover: mes × posició → barra (per any i per valor)
  const BY=d3.range(12).map(()=>[[],[]]); B53.forEach(d=>{ BY[d.k][0][d.y-YRS53[0]]=d; BY[d.k][1][RANK53[d.y+"-"+d.k]]=d; });
  const COL=B53.map(d=>DIV53(d.v)); // color de cada barra, calculat una sola vegada
  B53.forEach(d=>{ d._a=angOf(d); d._g=1; });
  function paint(){ ctx.clearRect(0,0,w,h); ctx.save(); ctx.translate(cx,cy);
    ctx.lineWidth=.7; ctx.strokeStyle=C.grid; [-2,-1,1,2].forEach(v=>{ ctx.beginPath(); ctx.arc(0,0,r0+v*k,0,2*Math.PI); ctx.stroke(); });
    ctx.setLineDash([1.5,3.5]); ctx.lineCap="round"; ctx.lineWidth=.9; ctx.strokeStyle=C.ghost; [-.5,.5].forEach(v=>{ ctx.beginPath(); ctx.arc(0,0,r0+v*k,0,2*Math.PI); ctx.stroke(); });
    ctx.setLineDash([]); ctx.lineCap="butt"; ctx.lineWidth=sw;
    for(let i=0;i<B53.length;i++){ const d=B53[i]; if(d._g<=0)continue; const sx=Math.sin(d._a), sy=-Math.cos(d._a), re=r0+d.v*k*d._g;
      ctx.beginPath(); ctx.moveTo(sx*r0,sy*r0); ctx.lineTo(sx*re,sy*re); ctx.strokeStyle=COL[i]; ctx.stroke(); }
    ctx.lineWidth=.9; ctx.strokeStyle=C.ink; ctx.beginPath(); ctx.arc(0,0,r0,0,2*Math.PI); ctx.stroke(); ctx.restore(); }
  const ref=g.append("g");
  [-2,-1,0,1,2].forEach(v=>{ if(mob&&Math.abs(v)===1)return; V.t(ref,0,-(r0+v*k)+4,v===0?"0":sgn(v,0)+(v===2?" °C":""),{anchor:"middle",size:11,fill:v===0?C.ink:C.muted,halo:2.5}); });
  // mesos
  const ml=g.append("g");
  d3.range(12).forEach(m=>{ const a=GAP/2+(m+.5)*SEC, rr=R+(mob?12:16);
    V.t(ml,Math.sin(a)*rr,-Math.cos(a)*rr+4,V.MES[m],{anchor:"middle",size:mob?11.5:12.5,fill:C.ink2});
    const a0=GAP/2+m*SEC+gin, a1=GAP/2+(m+1)*SEC-gin;
    ml.append("path").attr("d",d3.arc().innerRadius(R+2).outerRadius(R+2.6).startAngle(a0).endAngle(a1)()).attr("fill",C.hair); });
  // centre
  const ctr=g.append("g");
  function center(d){ ctr.selectAll("*").remove();
    if(d){ V.t(ctr,0,-6,d.y,{anchor:"middle",serif:true,weight:600,size:mob?24:32});
      V.t(ctr,0,mob?13:18,`${SEASON[d.k]} · ${sgn(d.v)} °C`,{anchor:"middle",size:mob?12:13,weight:700});
      if(!mob)V.t(ctr,0,36,d.v>=.5?"El Niño":d.v<=-.5?"La Niña":"neutral",{anchor:"middle",size:12,italic:true,fill:C.ink2}); return; }
    const km=d3.maxIndex(MEAN53);
    V.lines(ctr,0,mob?-10:-14,[["Més forts a l'hivern",true],[`${SEASON[km]}: ${f1(MEAN53[km])} °C`+(mob?"":" de mitjana")],[`${SEASON[d3.minIndex(MEAN53)]}: ${f1(d3.min(MEAN53))} °C`]],{anchor:"middle",size:mob?11.5:12.5}); }
  center(null);
  // nota (escriptori): el rècord
  const nt=g.append("g"), top=B53.reduce((a,b)=>b.v>a.v?b:a,B53[0]);
  if(!mob){ const a=angOf(top), px=Math.sin(a)*(r0+top.v*k), py=-Math.cos(a)*(r0+top.v*k);
    V.note(nt,{x:px,y:py-3,tx:px+26,ty:-R-52,kind:"elbow",anchor:"start",lines:[[`Rècord: ${top.y}, ${SEASON[top.k]}`,true],[`${sgn(top.v)} °C`]]}); }
  nt.style("opacity",sort53?0:1);
  const hy=g.append("g"), guide=g.append("g");
  let tm=null; const run=(dur,fn,end)=>{ if(tm)tm.stop(); tm=d3.timer(e=>{ const done=fn(e); paint(); if(done||e>dur){ tm.stop(); tm=null; end&&end(); } }); };
  paint();
  // entrada: les barres creixen des de l'anell fent la volta (un sol canvas animat amb d3.timer)
  entry(el,instant=>{ if(instant)return; const T=1500, D=650;
    B53.forEach(d=>{ d._dl=(d.k*NY+(d.y-YRS53[0]))/(12*NY)*T; d._g=0; });
    run(T+D+50,e=>{ B53.forEach(d=>{ d._g=d3.easeCubicOut(clamp((e-d._dl)/D,0,1)); }); return e>T+D; },()=>{ B53.forEach(d=>d._g=1); paint(); });
    nt.style("opacity",0).transition().delay(2100).duration(500).style("opacity",sort53?0:1);
    ctr.style("opacity",0).transition().delay(1800).duration(500).style("opacity",1); });
  el._sort=()=>{ leave53(); center(null);
    B53.forEach(d=>{ d._a0=d._a; d._a1=angOf(d); });
    if(V.reduced){ B53.forEach(d=>d._a=d._a1); paint(); }
    else run(1100+11*40+50,e=>{ B53.forEach(d=>{ const t=EIO(clamp((e-d.k*40)/1100,0,1)); d._a=d._a0+(d._a1-d._a0)*t; }); return false; },()=>{ B53.forEach(d=>d._a=d._a1); paint(); });
    nt.transition().duration(300).style("opacity",sort53?0:1); };
  // hover: barra trobada amb un índex precalculat (O(1)); el canvas s'apaga per CSS i l'any sencer es redibuixa a la capa SVG.
  const tp=V.tip(el); s.style("cursor","crosshair"); let cur53=null, curY=null;
  const N53=d3.range(12).map(m=>B53.filter(q=>q.k===m).length), RANKV=d=>N53[d.k]-RANK53[d.y+"-"+d.k];
  function leave53(){ if(!cur53)return; cur53=null; curY=null; guide.selectAll("*").remove(); hy.selectAll("*").remove(); cv.style.opacity=1; center(null); nt.style("opacity",sort53?0:1); tp.hide(); }
  V.hover(s.node(),(ev,[px,py])=>{ if(tm)return; const dx=px-cx, dy=py-cy, rr=Math.hypot(dx,dy); let a=Math.atan2(dx,-dy); if(a<0)a+=2*Math.PI;
    const m=Math.floor((a-GAP/2)/SEC); if(rr<(mob?30:44)||rr>R+24||m<0||m>11){ leave53(); return; }
    const arr=BY[m][sort53], n=arr.length; let pIdx=clamp(Math.round((a-GAP/2-m*SEC-gin)/(SEC-2*gin)*NY-.5),0,NY-1);
    if(sort53)pIdx=clamp(pIdx,0,N53[m]-1); let d=arr[pIdx]; for(let j=1;!d&&j<NY;j++)d=arr[pIdx-j]||arr[pIdx+j];
    if(!d||!n){ leave53(); return; }
    const aa=d._a, re=r0+d.v*k, sx=Math.sin(aa), sy=-Math.cos(aa);
    if(cur53!==d){ cur53=d; cv.style.opacity=.2; nt.style("opacity",0); center(d);
      if(curY!==d.y){ curY=d.y; hy.selectAll("*").remove();
        B53.forEach((q,i)=>{ if(q.y!==d.y)return; const qx=Math.sin(q._a), qy=-Math.cos(q._a);
          hy.append("line").attr("x1",qx*r0).attr("y1",qy*r0).attr("x2",qx*(r0+q.v*k)).attr("y2",qy*(r0+q.v*k)).attr("stroke",COL[i]).attr("stroke-width",Math.max(1.6,sw*1.8)); });
        hy.append("circle").attr("r",r0).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9); }
      const ri=mob?36:50, ro=Math.max(re,r0)+4;
      guide.selectAll("*").remove();
      guide.append("circle").attr("r",re).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 3");
      const vt=sgn(d.v)+" °C", vw=textW(vt,11.5,700)/2+4;
      guide.append("rect").attr("x",-vw).attr("y",-re-9).attr("width",2*vw).attr("height",16).attr("fill","#fff");
      V.t(guide,0,-re+4,vt,{anchor:"middle",weight:700,size:11.5});
      guide.append("line").attr("x1",sx*Math.min(re,r0)).attr("y1",sy*Math.min(re,r0)).attr("x2",sx*ri).attr("y2",sy*ri).attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2");
      guide.append("line").attr("x1",sx*r0).attr("y1",sy*r0).attr("x2",sx*re).attr("y2",sy*re).attr("stroke","#fff").attr("stroke-width",Math.max(4,sw*3.6));
      guide.append("line").attr("x1",sx*r0).attr("y1",sy*r0).attr("x2",sx*re).attr("y2",sy*re).attr("stroke",C.ink).attr("stroke-width",Math.max(2,sw*2.4));
      guide.append("circle").attr("cx",sx*ro).attr("cy",sy*ro).attr("r",2.4).attr("fill",C.ink);
      const lb=`${d.y} · ${vt}`, lr=ro+8, tp0=Math.abs(sx)<.25, anc=tp0?(sx>=0?"start":"end"):sx>.25?"start":"end";
      V.t(guide,sx*lr+(tp0?(sx>=0?8:-8):0),sy*lr+(tp0?4:sy>.6?11:sy<-.6?-2:4),lb,{anchor:anc,weight:700,size:12.5,halo:4}); }
    tp.show(`<b>${SEASON[d.k]} ${d.y}</b><br><b>${sgn(d.v)} °C</b> · ${d.v>=.5?"El Niño":d.v<=-.5?"La Niña":"neutral"}<br>Posició ${RANKV(d)} de ${N53[d.k]} en ${SEASON[d.k]} · mitjana en valor absolut: ${f1(MEAN53[d.k])} °C`,px,py); },leave53);
});
seg(53,k=>{ sort53=+k; const el=$('[data-p="53"]'); el&&el._sort&&el._sort(); });
void M53;

/* =====================================================================
   IB-54 · BOMBOLLES EN MOVIMENT  (dades d'exemple)
   Dispersió animada en el temps, amb l'any gran al fons i l'estela del recorregut.
   ===================================================================== */
const G54=[{t:"Grup A",c:C.vermell},{t:"Grup B",c:C.blau},{t:"Grup C",c:C.groc},{t:"Grup D",c:C.blauClar}];
const Y54=d3.range(1980,2027);
const P54=(function(){ const r=V.rng(54);
  return d3.range(30).map(i=>{ const g=i%4; let lx=2.75+r()*1.25+(g===0?.55:g===1?.25:g===3?-.15:0); const gr=.004+r()*.026+(i===6?.03:0);
    let pop=1.5+Math.pow(r(),2.4)*150, ly=0; const pg=.002+r()*.02, off=V.gauss(r)*3, shock=r()<.15?1988+Math.floor(r()*15):0;
    const vals=Y54.map((y,k)=>{ if(k){ lx=Math.min(5.2,lx+gr+V.gauss(r)*.012-(shock&&y>=shock&&y<shock+4?.07:0)); pop*=1+pg; }
      const target=clamp(38+11.5*(lx-2.6)+off,36,86); ly=k?ly+(target-ly)*.35+V.gauss(r)*.25:target;
      return {x:Math.pow(10,lx),y:ly,p:pop}; });
    return {id:i,n:"Lloc "+(i+1),g,vals}; }).sort((a,b)=>b.vals[b.vals.length-1].p-a.vals[a.vals.length-1].p); })();
const S54={yr:V.reduced?2026:1980,play:false,hov:null};
const STAR54=P54.reduce((a,b)=>Math.log(b.vals[b.vals.length-1].x/b.vals[0].x)>Math.log(a.vals[a.vals.length-1].x/a.vals[0].x)?b:a,P54[0]);
function at54(e,yr){ const t=clamp(yr,1980,2026)-1980, i=Math.min(Math.floor(t),Y54.length-2), f=t-i, a=e.vals[i], b=e.vals[i+1];
  return {x:Math.pow(10,Math.log10(a.x)+(Math.log10(b.x)-Math.log10(a.x))*f),y:a.y+(b.y-a.y)*f,p:a.p+(b.p-a.p)*f}; }
legend(54,el=>{ V.legendCat(el,G54.map(d=>({c:d.c,t:d.t,a:.6})));
  V.legendSize(el,{title:"Població (milions)",values:[10,50,150],r:d3.scaleSqrt([0,200],[0,36]),f:f0}); });
function ui54(){ const r=$('[data-rng="54"]'), b=$('[data-play="54"]'), o=$('[data-out="54"]'), y=Math.floor(S54.yr+1e-6);
  if(r){ r.value=y; r.setAttribute("aria-valuetext",String(y)); } if(o)o.textContent=y; if(b)b.textContent=S54.play?"Pausa":"Reprodueix"; }
const M54=piece(54,(el,w)=>{
  if(el._lp){ el._lp.stop(); el._lp=null; } S54.hov=null;
  const mob=w<640, h=mob?360:480, m={t:14,r:mob?10:20,b:40,l:mob?30:44};
  const s=V.svg(el,w,h,"Dispersió de trenta bombolles, una per lloc, que es mouen del 1980 al 2026: a la dreta, més ingressos per persona; amunt, més esperança de vida. Amb el temps la majoria es desplacen cap amunt i a la dreta. Dades d'exemple."), g=s.append("g");
  const x=d3.scaleLog([300,200000],[m.l,w-m.r]), y=d3.scaleLinear([34,85],[h-m.b,m.t]), r=d3.scaleSqrt([0,200],[0,mob?24:36]);
  const yrT=V.t(g,w-m.r-4,h-m.b-14,"1980",{anchor:"end",serif:true,weight:600,size:mob?84:168,fill:C.grid});
  V.gridY(g,y,m.l-(mob?30:44),w-m.r,[40,50,60,70,80],f0,{unit:" anys"});
  V.axisX(g,x,h-m.b,mob?[1000,10000,100000]:[500,1000,5000,10000,50000,100000],v=>f0(v)+(v===100000?" €":""));
  V.t(g,w-m.r,h-4,"Ingressos per persona · escala logarítmica",{anchor:"end",size:11.5,fill:C.ink2,italic:true});
  const tr=g.append("g"), bg=g.append("g"), lb=g.append("g"), ng=g.append("g"), hg=g.append("g").style("pointer-events","none");
  const bub=bg.selectAll("circle").data(P54,d=>d.id).join("circle").attr("fill",d=>V.alpha(G54[d.g].c,.55)).attr("stroke",d=>G54[d.g].c===C.groc?"#fff":d3.color(G54[d.g].c).darker(.5)).attr("stroke-width",.8).attr("r",0);
  const named=P54.filter(d=>d!==STAR54).slice(0,2);
  const tp=V.tip(el);
  let grow=V.reduced||el.__seen?1:0;
  // Lleuger: només es toca el DOM quan alguna cosa ha canviat (any, creixement, hover); etiquetes i nota es creen un cop
  // i es mouen amb translate; l'estela es refà només quan canvia l'any sencer o la bombolla apuntada.
  const LBL=named.map(d=>V.t(lb,0,0,d.n,{italic:true,size:12,fill:C.ink2,halo:true}));
  let lastKey="", lastYr=-1, noteKey="", trailKey="";
  function render(){ const yr=S54.yr, key=yr.toFixed(4)+"/"+grow+"/"+(S54.hov?S54.hov.id:"");
    if(key===lastKey)return; lastKey=key;
    const yi=Math.floor(yr+1e-6); if(yi!==lastYr){ lastYr=yi; yrT.text(yi); }
    bub.each(function(d){ const p=at54(d,yr); d._p=p; this.setAttribute("cx",x(p.x).toFixed(1)); this.setAttribute("cy",y(p.y).toFixed(1)); this.setAttribute("r",(r(p.p)*grow).toFixed(1)); });
    lb.style("display",grow<1?"none":null); ng.style("display",grow<1||S54.hov?"none":null);
    if(grow<1)return;
    named.forEach((d,i)=>{ const X=x(d._p.x), Y=y(d._p.y), rr=r(d._p.p), right=X+rr+4+textW(d.n,12)<w-m.r;
      LBL[i].attr("x",(right?X+rr+4:X-rr-4).toFixed(1)).attr("y",(Y+4).toFixed(1)).attr("text-anchor",right?"start":"end"); });
    const e=STAR54; if(e&&!S54.hov){ const X=x(e._p.x), Y=y(e._p.y), rr=r(e._p.p), left=X>w*.55, nk=left+"/"+Math.round(rr);
      if(nk!==noteKey){ noteKey=nk; ng.selectAll("*").remove(); const dx=(left?-1:1)*(mob?34:60);
        V.note(ng,{x:(left?-rr:rr)*.7,y:-rr*.7,tx:dx,ty:-(mob?44:60),kind:"elbow",anchor:left?"end":"start",size:mob?11.5:12.5,lines:[[e.n,true],["el que més ha crescut"]]}); }
      ng.attr("transform",`translate(${X.toFixed(1)},${Math.max(Y,m.t+20+(mob?44:60)).toFixed(1)})`); }
    hg.selectAll("*").remove(); lb.style("opacity",S54.hov?.25:1);
    if(S54.hov){ const tk=S54.hov.id+"/"+yi; if(tk!==trailKey){ trailKey=tk; trail(S54.hov); } marks(S54.hov); tip54(S54.hov); }
    else if(trailKey){ trailKey=""; tr.selectAll("*").remove(); } }
  // marques de hover: contorn en tinta, guies fins als dos eixos amb el valor en negreta sobre l'eix i el nom al costat
  function marks(d){ const p=d._p, X=x(p.x), Y=y(p.y), rr=r(p.p)*grow;
    hg.append("line").attr("x1",X).attr("x2",X).attr("y1",Y+rr).attr("y2",h-m.b).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
    hg.append("line").attr("x1",m.l-(mob?30:44)+2).attr("x2",X-rr).attr("y1",Y).attr("y2",Y).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","2 2");
    hg.append("circle").attr("cx",X).attr("cy",Y).attr("r",rr).attr("fill",V.alpha(G54[d.g].c,.85)).attr("stroke",C.ink).attr("stroke-width",1.5);
    const xt=f0(Math.round(p.x/10)*10)+" €", xw=textW(xt,11.5,700)/2+4, XA=clamp(X,m.l+xw,w-m.r-xw);
    hg.append("rect").attr("x",XA-xw).attr("y",h-m.b+3).attr("width",2*xw).attr("height",17).attr("fill","#fff");
    V.t(hg,XA,h-m.b+16,xt,{anchor:"middle",weight:700,size:11.5});
    const yt=f1(p.y), yw=textW(yt,11.5,700)+6, X0=m.l-(mob?30:44);
    hg.append("rect").attr("x",X0).attr("y",Y-10).attr("width",yw).attr("height",17).attr("fill","#fff");
    V.t(hg,X0+1,Y+4,yt,{weight:700,size:11.5});
    const right=X+rr+6+textW(d.n,12.5,700)<w-m.r;
    V.t(hg,right?X+rr+5:X-rr-5,Y-Math.min(rr,10)-4,d.n,{anchor:right?"start":"end",weight:700,size:12.5,halo:4}); }
  function tip54(d){ const p=d._p; if(!p)return; const yr=S54.yr, rk=1+P54.filter(q=>q._p&&q._p.x>p.x).length;
    tp.show(`<b>${d.n}</b> · ${G54[d.g].t} · ${Math.floor(yr+1e-6)}<br><b>${f0(Math.round(p.x/10)*10)} €</b> per persona · <b>${f1(p.y)} anys</b><br>Població: ${f1(p.p)} milions · posició ${rk} de ${P54.length} en ingressos`,x(p.x),y(p.y)-r(p.p)*grow); }
  function trail(d){ tr.selectAll("*").remove(); const ys=Y54.filter(v=>v<=S54.yr); if(!ys.length)return;
    const pts=ys.map(v=>at54(d,v)).concat([at54(d,S54.yr)]);
    tr.append("path").attr("d",d3.line(p=>x(p.x),p=>y(p.y)).curve(d3.curveCatmullRom)(pts)).attr("fill","none").attr("stroke",G54[d.g].c).attr("stroke-width",2);
    ys.forEach((v,i)=>{ const p=pts[i]; tr.append("circle").attr("cx",x(p.x)).attr("cy",y(p.y)).attr("r",v%10===0?2.6:1.4).attr("fill",G54[d.g].c);
      if(v%10===0&&v!==Math.floor(S54.yr))V.t(tr,x(p.x)+5,y(p.y)-5,v,{size:11,fill:C.ink2,halo:true}); }); }
  function frame(t,dt){ if(S54.play){ S54.yr=Math.min(2026,S54.yr+dt/1000*4.2); if(S54.yr>=2026){ S54.play=false; } ui54(); } render(); }
  render(); ui54();
  el._lp=V.loop(el,frame);
  // entrada: les bombolles creixen al 1980 i el temps comença a córrer
  entry(el,instant=>{ if(instant){ grow=1; render(); return; }
    const t0=performance.now(); const tm=d3.timer(()=>{ const q=Math.min(1,(performance.now()-t0)/900); grow=d3.easeCubicOut(q); render(); if(q>=1){ tm.stop(); setTimeout(()=>{ if(S54.yr<=1980){ S54.play=true; ui54(); } },500); } }); });
  // hover: estela del recorregut
  s.style("cursor","pointer");
  V.hover(s.node(),(ev,[px,py])=>{ let best=null,bd=1e9;
    P54.forEach(d=>{ if(!d._p)return; const rr=r(d._p.p)*grow, dd=Math.hypot(x(d._p.x)-px,y(d._p.y)-py)-rr; if(dd<12&&dd<bd){bd=dd;best=d;} });
    if(!best){ if(S54.hov){ S54.hov=null; tr.selectAll("*").remove(); hg.selectAll("*").remove(); V.focus(bub,null); tp.hide(); render(); } return; }
    if(S54.hov!==best){ S54.hov=best; V.focus(bub,d=>d===best,{dim:.2}); } render(); },
  ()=>{ S54.hov=null; tr.selectAll("*").remove(); hg.selectAll("*").remove(); V.focus(bub,null); tp.hide(); render(); });
});
(function(){ const r=$('[data-rng="54"]'), b=$('[data-play="54"]');
  if(r)r.addEventListener("input",()=>{ S54.play=false; S54.yr=+r.value; ui54(); });
  if(b)b.addEventListener("click",()=>{ if(V.reduced){ S54.yr=2026; ui54(); return; } if(S54.play){ S54.play=false; } else { if(S54.yr>=2026)S54.yr=1980; S54.play=true; } ui54(); });
  ui54(); })();
void M54;

/* =====================================================================
   IB-55 · MAPA CONCEPTUAL SOBRE EIX  (esquema · estil «Design Futures»)
   Grans cercles monocroms translúcids `multiply` solapats al llarg d'un eix discontinu
   bipolar per cartografiar disciplines, escoles o conceptes propers.
   ===================================================================== */
const N55=[
  {id:"art",  t:"Art",                 x:.27, y:.58, r:.35, lx:.16, ly:.56, a:.11, stroke:false, d:"Exploració estètica i simbòlica sense restriccions funcionals."},
  {id:"dis",  t:"Disseny",             x:.58, y:.34, r:.31, lx:.64, ly:.15, a:.11, stroke:false, d:"Creació d'objectes, sistemes i experiències amb intenció."},
  {id:"est",  t:"Estratègia",          x:.73, y:.52, r:.26, lx:.84, ly:.54, a:.11, stroke:false, d:"Decisió a llarg termini sota restriccions reals de recursos."},
  {id:"spec", t:"Disseny\nespeculatiu",x:.48, y:.41, r:.21, lx:.54, ly:.29, a:.14, stroke:false, d:"Proposa escenaris alternatius per debatre cap a on anem."},
  {id:"crit", t:"Disseny\ncrític",     x:.42, y:.31, r:.10, lx:.42, ly:.31, a:.22, stroke:false, d:"Qüestiona normes socials i tecnològiques a través del disseny."},
  {id:"scifi",t:"Ciència-\nficció",    x:.38, y:.68, r:.13, lx:.37, ly:.74, a:.18, stroke:false, d:"Narrativa que imagina futurs possibles a partir de la ciència."},
  {id:"dfic", t:"Ficció de\ndisseny",  x:.47, y:.47, r:.065,lx:.47, ly:.47, a:.28, stroke:false, d:"Prototips d'objectes d'un món futur per fer-lo tangible."},
  {id:"ft",   t:"Pensament\nde futurs",x:.56, y:.66, r:.16, lx:.59, ly:.77, a:.16, stroke:true,  d:"Prospectiva sistemàtica per anticipar tendències i riscos."},
  {id:"dt",   t:"Design\nthinking",    x:.66, y:.52, r:.125,lx:.70, ly:.42, a:.18, stroke:true,  d:"Mètode iteratiu per resoldre problemes complexos centrats en l'usuari."},
  {id:"dfut", t:"Futurs del\ndisseny", x:.60, y:.52, r:.052,lx:.60, ly:.52, a:.30, stroke:false, d:"Intersecció entre especulació, estratègia i prospectiva."}
];
const M55=piece(55,(el,w)=>{
  const mob=w<640, h=mob?Math.round(w*.86):Math.min(500,Math.round(w*.54));
  const padX=mob?10:28, uW=w-padX*2, uH=h-20, baseR=Math.min(uW*.62,uH*.98);
  el.style.height="";
  const s=V.svg(el,w,h,"Mapa conceptual de cercles translúcids blaus solapats al llarg d'un eix horitzontal de més obert (Art) a més pautat (Estratègia). Les interseccions s'enfosqueixen soles. Esquema conceptual.");
  const g=s.append("g");
  const px=d=>padX+d.x*uW, py=d=>10+d.y*uH, pr=d=>d.r*baseR;
  const axisY=10+.50*uH;

  // 1. Cercles translúcids monocroms blaus amb multiply
  const gC=g.append("g");
  const cs=gC.selectAll("circle").data(N55).join("circle")
    .attr("cx",px).attr("cy",py).attr("r",pr)
    .attr("fill",C.blau).attr("fill-opacity",d=>d.a)
    .attr("stroke",d=>d.stroke?C.blauFosc:"none").attr("stroke-width",d=>d.stroke?1:0).attr("stroke-opacity",.55)
    .style("mix-blend-mode","multiply").style("cursor","pointer");

  // 2. Eix discontinu bipolar horitzontal
  const gAx=g.append("g").style("pointer-events","none");
  gAx.append("line").attr("x1",padX+6).attr("x2",w-padX-6).attr("y1",axisY).attr("y2",axisY)
    .attr("stroke",C.blauFosc).attr("stroke-width",.9).attr("stroke-opacity",.55).attr("stroke-dasharray","3 3");
  gAx.append("path").attr("d",`M${padX+11},${axisY-3.5}L${padX+4},${axisY}L${padX+11},${axisY+3.5}M${w-padX-11},${axisY-3.5}L${w-padX-4},${axisY}L${w-padX-11},${axisY+3.5}`)
    .attr("fill","none").attr("stroke",C.blauFosc).attr("stroke-width",1);
  V.t(gAx,padX+6,axisY-8,"Obert · exploratori",{size:11,fill:C.muted,anchor:"start",halo:3});
  V.t(gAx,w-padX-6,axisY-8,"Pautat · aplicat",{size:11,fill:C.muted,anchor:"end",halo:3});

  // 3. Etiquetes netes dins de cada cercle
  const gL=g.append("g").style("pointer-events","none");
  const lbs=gL.selectAll("g.lb").data(N55).join("g").attr("class","lb")
    .attr("transform",d=>`translate(${padX+d.lx*uW},${10+d.ly*uH})`);
  lbs.each(function(d){
    if(mob&&(d.id==="dfic"||d.id==="dfut"||d.id==="crit"))return;
    const parts=d.t.split("\n"), isBig=d.r>=.25;
    const fs=isBig?(mob?13:15):(mob?11:12);
    const q=d3.select(this);
    parts.forEach((line,i)=>V.t(q,0,(i-(parts.length-1)/2)*(fs+2)+4,line,{size:fs,weight:isBig?600:500,fill:C.ink,anchor:"middle",halo:2.5}));
  });

  // Hover suau: ressalta el cercle apuntat i els que hi solapen + lectura en 1 línia a sota
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const overlap=(a,b)=>a===b||Math.hypot(px(a)-px(b),py(a)-py(b))<pr(a)+pr(b)-4;
  const reset=()=>{
    cs.interrupt().transition().duration(150).style("opacity",1).attr("stroke",d=>d.stroke?C.blauFosc:"none").attr("stroke-width",d=>d.stroke?1:0);
    lbs.interrupt().transition().duration(150).style("opacity",1);
    tp.hide();
  };
  cs.on("mouseenter",(ev,d)=>{
    cs.interrupt().transition().duration(150)
      .style("opacity",o=>overlap(d,o)?1:.46)
      .attr("stroke",o=>o===d?C.ink:(o.stroke?C.blauFosc:"none"))
      .attr("stroke-width",o=>o===d?1.5:(o.stroke?1:0));
    lbs.interrupt().transition().duration(150).style("opacity",o=>overlap(d,o)?1:.48);
    tp.show(`<b>${d.t.replace("\n"," ")}</b> · ${d.d}`,px(d),py(d));
  }).on("mouseleave",reset);

  entry(el,instant=>{
    if(instant)return;
    gC.style("opacity",0).transition().duration(600).ease(d3.easeCubicOut).style("opacity",1);
    lbs.style("opacity",0).transition().delay(250).duration(450).style("opacity",1);
  });
});
void M55;

/* =====================================================================
   IB-56 · MATRIU MONOCROMA MULTIVARIANT  (dades d'exemple · estil «NBA heatmap»)
   18 perfils × 12 indicadors en una sola rampa blava amb fils blancs fins i cercles
   d'accent sobre els tres valors més alts.
   ===================================================================== */
const COLS56=["Velocitat","Precisió","Resistència","Abast","Visió","Ritme","Equilibri","Tàctica","Pressió","Control","Impuls","Síntesi"];
const ROWS56=["Perfil 01","Perfil 02","Perfil 03","Perfil 04","Perfil 05","Perfil 06","Perfil 07","Perfil 08","Perfil 09","Perfil 10","Perfil 11","Perfil 12","Perfil 13","Perfil 14","Perfil 15","Perfil 16","Perfil 17","Perfil 18"];
const DATA56=(function(){
  const r=V.rng(56), cells=[];
  ROWS56.forEach((rn,ri)=>{
    // Cada perfil té un o dos punts forts recognoscibles (especialistes)
    const fav1=(ri*3)%COLS56.length, fav2=(ri*5+4)%COLS56.length;
    COLS56.forEach((cn,ci)=>{
      let v=22+r()*44;
      if(ci===fav1)v+=28+r()*12;
      else if(ci===fav2)v+=16+r()*14;
      v=Math.round(clamp(v,5,99));
      cells.push({ri,ci,rn,cn,v});
    });
  });
  return cells;
})();
const SEQ56=V.seq(C.blau,[0,100]);
legend(56,el=>V.legendRamp(el,{scale:SEQ56,min:0,max:100,ticks:[0,25,50,75,100],f:f0,title:"Índex normalitzat (0–100)",lo:"Baix",hi:"Màxim"}));
const M56=piece(56,(el,w)=>{
  const mob=w<640, ml=mob?66:88, mr=mob?8:16, mt=mob?78:90, mb=16;
  const cw=(w-ml-mr)/COLS56.length, ch=mob?19:22, h=mt+ROWS56.length*ch+mb;
  el.style.height="";
  const s=V.svg(el,w,h,"Matriu monocroma blava de 18 perfils per 12 indicadors (216 cel·les separades per fils blancs fins). Els tons més foscos revelen a l'instant en quin indicador destaca cada perfil. Dades d'exemple.");
  const g=s.append("g");

  // Capçaleres superiors verticals/inclinades
  const gTop=g.append("g");
  COLS56.forEach((cn,ci)=>{
    const cx=ml+(ci+.5)*cw;
    gTop.append("text").attr("transform",`translate(${cx},${mt-8}) rotate(-45)`)
      .attr("text-anchor","start").attr("font-size",mob?11:11.5).attr("fill",C.ink2).text(cn);
  });
  // Noms de fila a l'esquerra
  const gRow=g.append("g");
  ROWS56.forEach((rn,ri)=>V.t(gRow,ml-8,mt+(ri+.5)*ch+4,rn,{size:mob?11:11.5,fill:C.ink2,anchor:"end"}));

  // Cel·les monocromes blaves amb separació blanca fina (0,9 px)
  const gCells=g.append("g");
  const rects=gCells.selectAll("rect").data(DATA56).join("rect")
    .attr("x",d=>ml+d.ci*cw+.5).attr("y",d=>mt+d.ri*ch+.5)
    .attr("width",Math.max(2,cw-1)).attr("height",Math.max(2,ch-1))
    .attr("rx",1).attr("fill",d=>SEQ56(d.v)).style("cursor","pointer");

  // Cercles subtils d'accent sobre els 3 màxims globals (picada d'ullet a les anomalies encerclades)
  const top3=DATA56.slice().sort((a,b)=>b.v-a.v).slice(0,3);
  const gTop3=g.append("g").style("pointer-events","none");
  top3.forEach(d=>{
    gTop3.append("circle").attr("cx",ml+(d.ci+.5)*cw).attr("cy",mt+(d.ri+.5)*ch).attr("r",Math.min(cw,ch)*.28)
      .attr("fill","none").attr("stroke","#fff").attr("stroke-width",1.3);
  });

  const hv=g.append("g").style("pointer-events","none");
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const reset=()=>{ rects.interrupt().transition().duration(120).style("opacity",1); hv.selectAll("*").remove(); tp.hide(); };
  rects.on("mouseenter",(ev,d)=>{
    rects.interrupt().transition().duration(120).style("opacity",o=>o.ri===d.ri||o.ci===d.ci?1:.5);
    hv.selectAll("*").remove();
    hv.append("rect").attr("x",ml+d.ci*cw+.5).attr("y",mt+d.ri*ch+.5).attr("width",Math.max(2,cw-1)).attr("height",Math.max(2,ch-1))
      .attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6);
    const colMean=d3.mean(DATA56.filter(o=>o.ci===d.ci),o=>o.v);
    tp.show(`<b>${d.rn}</b> · ${d.cn}: <b>${d.v}/100</b> (mitjana de la columna: ${f0(colMean)})`,ml+d.ci*cw,mt+d.ri*ch);
  }).on("mouseleave",reset);

  entry(el,instant=>{
    if(instant)return;
    rects.style("opacity",0).transition().delay(d=>d.ri*18+d.ci*12).duration(320).style("opacity",1);
  });
});
void M56;

/* =====================================================================
   IB-57 · RADAR ORGÀNIC SOBRE DISCOS SUAUS  (dades d'exemple · estil «Member Behaviour / Usability»)
   Corba orgànica tancada (`curveCardinalClosed`) sobre 4 discos translúcids sense vora
   (mai anells negres tipus diana). Comparador entre dos perfils.
   ===================================================================== */
const AX57=["Claredat","Rigor","Profunditat","Ritme","Originalitat","Síntesi"];
const PROF57=[
  {id:"a",t:"Assaig visual",c:C.vermell,v:[88,82,74,90,85,78]},
  {id:"b",t:"Informe tècnic",c:C.blau,  v:[64,95,91,48,42,70]}
];
let mode57="all";
legend(57,el=>V.legendCat(el,[
  {c:C.vermell,a:.45,t:"Assaig visual"},
  {c:C.blau,a:.45,t:"Informe tècnic"},
  {c:C.vermell,a:.18,t:"Discos guia: 25 · 50 · 75 · 100"}
]));
const M57=piece(57,(el,w)=>{
  const mob=w<640, S=Math.min(w,mob?w:480), h=mob?Math.round(S*.95):420, cx=w/2, cy=h/2+4;
  const R=Math.min(w/2-(mob?64:90),h/2-(mob?38:44));
  el.style.height="";
  const s=V.svg(el,w,h,"Radar orgànic de sis dimensions (Claredat, Rigor, Profunditat, Ritme, Originalitat i Síntesi) dibuixat amb corbes suaus tancades sobre quatre discos translúcids sense vores dures. Dades d'exemple.");
  const g=s.append("g").attr("transform",`translate(${cx},${cy})`);
  const n=AX57.length, ang=i=>i*(2*Math.PI/n)-Math.PI/2;
  const rS=d3.scaleLinear([0,100],[0,R]);

  // 1. Quatre discos translúcids suaus sense vora (més rics al centre, eteris cap enfora — zero dianes de línies negres!)
  const tiers=[{v:100,a:.06},{v:75,a:.08},{v:50,a:.11},{v:25,a:.15}];
  const discCol=mode57==="b"?C.blau:C.vermell;
  const gDiscs=g.append("g");
  tiers.forEach(t=>{
    gDiscs.append("circle").attr("r",rS(t.v)).attr("fill",discCol).attr("fill-opacity",t.a);
  });

  // 2. Radis finíssims i etiquetes dels 6 eixos
  const gAx=g.append("g");
  AX57.forEach((lbl,i)=>{
    const a=ang(i), x1=Math.cos(a)*R, y1=Math.sin(a)*R;
    gAx.append("line").attr("x1",0).attr("y1",0).attr("x2",x1).attr("y2",y1)
      .attr("stroke",discCol).attr("stroke-width",.55).attr("stroke-opacity",.35);
    const lx=Math.cos(a)*(R+(mob?18:24)), ly=Math.sin(a)*(R+(mob?16:20));
    const anc=Math.cos(a)>.25?"start":Math.cos(a)<-.25?"end":"middle";
    const dy=Math.sin(a)<-.6?-4:Math.sin(a)>.6?11:4;
    V.t(gAx,lx,ly+dy,lbl,{size:mob?11.5:12.5,weight:600,fill:C.ink,anchor:anc});
  });

  // 3. Corbes orgàniques tancades (curveCardinalClosed) + vèrtexs interactius
  const lineR=d3.lineRadial().angle((d,i)=>i*(2*Math.PI/n)).radius(d=>rS(d)).curve(d3.curveCardinalClosed.tension(.35));
  const vis=mode57==="all"?PROF57:PROF57.filter(p=>p.id===mode57);
  const gShapes=g.append("g");
  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const hv=g.append("g").style("pointer-events","none");

  vis.forEach(p=>{
    const gp=gShapes.append("g");
    gp.append("path").datum(p.v).attr("d",lineR)
      .attr("fill",p.c).attr("fill-opacity",.22).attr("stroke",p.c).attr("stroke-width",1.8)
      .style("mix-blend-mode","multiply");
    p.v.forEach((val,i)=>{
      const a=ang(i), vx=Math.cos(a)*rS(val), vy=Math.sin(a)*rS(val);
      gp.append("circle").attr("cx",vx).attr("cy",vy).attr("r",3.8)
        .attr("fill",p.c).attr("stroke","#fff").attr("stroke-width",1.4).style("cursor","pointer")
        .on("mouseenter",()=>{
          hv.selectAll("*").remove();
          hv.append("circle").attr("cx",vx).attr("cy",vy).attr("r",6.5).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.4);
          V.t(hv,vx+(vx>=0?10:-10),vy-8,`${val}`,{size:12.5,weight:700,fill:p.c,anchor:vx>=0?"start":"end",halo:3.5});
          tp.show(`<b>${p.t}</b> · ${AX57[i]}: <b>${val}</b> / 100`,cx+vx,cy+vy);
        })
        .on("mouseleave",()=>{ hv.selectAll("*").remove(); tp.hide(); });
    });
  });

  entry(el,instant=>{
    if(instant)return;
    gShapes.attr("transform","scale(0.1)").style("opacity",0)
      .transition().duration(750).ease(d3.easeCubicOut).attr("transform","scale(1)").style("opacity",1);
  });
});
seg(57,k=>{ mode57=k; M57.redraw(); });
void M57;

/* =====================================================================
   IB-58 · RUSC RADIAL D'HEXÀGONS  (dades d'exemple · estil «Performance hex-cluster»)
   Composició orgànica en rusc des del centre cap enfora: 127 hexàgons iguals sense vores
   dures, agrupats en 4 anells radials de color (groc nucli → vermell → blau → blau clar).
   ===================================================================== */
const LAY58=[
  {id:"fidel", t:"Nucli fidel",      n:19, c:C.groc,     tc:C.ink},
  {id:"comp",  t:"Lectura completa", n:26, c:C.vermell,  tc:C.vermell},
  {id:"obert", t:"Obertura activa",  n:42, c:C.blau,     tc:C.blau},
  {id:"abast", t:"Abast total",      n:40, c:C.blauClar, tc:C.ink2}
];
const HEX58=(function(){
  // Genera 127 cel·les hexagonals en coordenades axials (radi 6) ordenades per distància al centre
  const pts=[], rMax=6, rnd=V.rng(58);
  for(let q=-rMax;q<=rMax;q++)for(let r=-rMax;r<=rMax;r++){
    const s=-q-r;
    if(Math.abs(s)<=rMax){
      const x=Math.sqrt(3)*(q+r/2), y=1.5*r;
      const dist=Math.hypot(x,y)+(rnd()-.5)*.55; // lleugera irregularitat orgànica al contorn de cada capa
      pts.push({q,r,x,y,dist});
    }
  }
  pts.sort((a,b)=>a.dist-b.dist);
  let acc=0, gi=0;
  pts.forEach((p,idx)=>{
    while(gi<LAY58.length-1&&idx>=acc+LAY58[gi].n){ acc+=LAY58[gi].n; gi++; }
    p.g=LAY58[gi]; p.idx=idx;
  });
  return pts;
})();
legend(58,el=>V.legendCat(el,LAY58.map(l=>({c:l.c,t:`${l.t} (${f0(l.n/HEX58.length*100)} %)`}))));
const M58=piece(58,(el,w)=>{
  const mob=w<640, h=mob?360:400, cx=w/2, cy=h/2;
  const R=mob?Math.min(11.5,(w-48)/24):15.5;
  el.style.height="";
  const s=V.svg(el,w,h,"Rusc radial de 127 hexàgons iguals agrupats del centre cap enfora en quatre nivells d'implicació: nucli fidel (groc), lectura completa (vermell), obertura activa (blau) i abast total (blau clar). Dades d'exemple.");
  const g=s.append("g").attr("transform",`translate(${cx},${cy})`);
  // Polígon hexagonal punta-amunt amb petit marge blanc (1,4 px)
  const hr=R*.88;
  const hexD="M"+d3.range(6).map(k=>{ const a=Math.PI/3*k-Math.PI/6; return `${(Math.cos(a)*hr).toFixed(2)},${(Math.sin(a)*hr).toFixed(2)}`; }).join("L")+"Z";

  const cells=g.append("g").selectAll("path").data(HEX58).join("path")
    .attr("d",hexD)
    .attr("transform",d=>`translate(${(d.x*R).toFixed(1)},${(d.y*R).toFixed(1)})`)
    .attr("fill",d=>d.g.c).attr("fill-opacity",d=>d.g.id==="abast"?.65:.88)
    .style("cursor","pointer");

  // Etiquetes laterals netes (escriptori) connectades a cada capa
  const gAn=g.append("g").style("pointer-events","none");
  if(!mob){
    const specs=[
      {l:LAY58[0],px:0,py:0,tx:R*13.5,ty:-R*6.5,anc:"start"},
      {l:LAY58[1],px:R*4.5,py:R*1.5,tx:R*13.5,ty:R*1.5,anc:"start"},
      {l:LAY58[2],px:-R*6.8,py:-R*3.5,tx:-R*13.5,ty:-R*4.5,anc:"end"},
      {l:LAY58[3],px:-R*9.5,py:R*3.5,tx:-R*13.5,ty:R*4.8,anc:"end"}
    ];
    specs.forEach(sp=>{
      const pct=f0(sp.l.n/HEX58.length*100);
      V.note(gAn,{x:sp.px,y:sp.py,tx:sp.tx,ty:sp.ty,kind:"elbow",anchor:sp.anc,size:12,
        lines:[[sp.l.t,true,sp.l.tc],[`${sp.l.n} unitats · ${pct} %`]]});
    });
  }

  const tp=V.tip(el);
  const tipEl=el.querySelector(":scope>.tip"); if(tipEl)el.appendChild(tipEl);
  const reset=()=>{ cells.interrupt().transition().duration(140).style("opacity",1); gAn.transition().duration(140).style("opacity",1); tp.hide(); };
  cells.on("mouseenter",(ev,d)=>{
    cells.interrupt().transition().duration(140).style("opacity",o=>o.g===d.g?1:.45);
    gAn.transition().duration(140).style("opacity",.55);
    tp.show(`<b>${d.g.t}</b> · ${d.g.n} de ${HEX58.length} unitats (${f1(d.g.n/HEX58.length*100)} %)`,cx+d.x*R,cy+d.y*R);
  }).on("mouseleave",reset);

  entry(el,instant=>{
    if(instant)return;
    cells.style("opacity",0).transition().delay(d=>d.idx*6).duration(380).ease(d3.easeCubicOut).style("opacity",1);
    gAn.style("opacity",0).transition().delay(700).duration(450).style("opacity",1);
  });
});
void M58;

})();
