/* Sistema infogràfic d'Inspired by Magazine · Distribució (peça del 22-11-2026): SPREAD-08, i la demostració del component C-09.
   Fa servir assets/ib-viz.js (IBV) i d3 7.9.0. */
(function(){
"use strict";
const V=IBV, C=V.C;
const $=s=>document.querySelector(s);
function piece(n,draw){ const el=$(`[data-p="${n}"]`); return el?V.mount(el,draw):{redraw(){}}; }
const ord=n=>n+(n===1||n===3?"r":n===2?"n":n===4?"t":"è");
const pct=v=>v<1?"<1 %":V.fmt(",.0f")(v)+" %";

/* =====================================================================
   C-09 · LECTURA AMB RAMPA  (demostració)
   ===================================================================== */
(function c9(){ const el=$('[data-c="9"]'); if(!el)return;
  const tp=V.tip(el), ip=V.seqInterp(C.blue);
  tp.show(`<b>Equip D</b> · acaba 3r en el 57 % de les temporades ${V.rampRead(.57,{interp:ip})}`);
})();

/* =====================================================================
   SPREAD-08 · ESCALA DE PROBABILITATS  (simulació amb dades d'exemple)
   Una fila per cas i una columna per cada resultat ordenat (posició, escons, ronda…). Cada cel·la diu
   la probabilitat d'aquell resultat; les que són gairebé zero no es dibuixen, i la forma d'escala que queda
   diu d'un cop d'ull qui ho té decidit i qui no. Un llindar (descens, majoria) parteix les columnes.
   Exemple: 3.000 temporades simulades d'una lliga de 16 equips, abans de començar i a mitja temporada.
   ===================================================================== */
const S8={n:16, sims:3000, drop:3,
  // força d'exemple de cada equip (escala arbitrària); els noms són genèrics
  force:[1.05,.92,.7,.66,.5,.42,.3,.24,.12,.05,-.05,-.12,-.22,-.3,-.42,-.55]};
S8.teams=S8.force.map((f,i)=>({i,n:"Equip "+String.fromCharCode(65+i),f}));
function s8sim(half){
  const r=V.rng(half?812:808), n=S8.n, F=S8.force;
  const pois=l=>{ let L=Math.exp(-l),k=0,p=1; do{ k++; p*=r(); }while(p>L); return k-1; };
  const games=[]; for(let h=0;h<n;h++)for(let a=0;a<n;a++)if(h!==a)games.push([h,a]);
  // ordre fix del calendari, perquè «la primera volta» sigui sempre la mateixa
  const r0=V.rng(31); for(let i=games.length-1;i>0;i--){ const j=Math.floor(r0()*(i+1)); [games[i],games[j]]=[games[j],games[i]]; }
  const play=(g,P,G)=>{ const d=F[g[0]]-F[g[1]]+.22, gh=pois(1.35*Math.exp(d/2)), ga=pois(1.1*Math.exp(-d/2));
    G[g[0]]+=gh-ga; G[g[1]]+=ga-gh; if(gh>ga)P[g[0]]+=3; else if(ga>gh)P[g[1]]+=3; else { P[g[0]]++; P[g[1]]++; } };
  const P0=new Array(n).fill(0), G0=new Array(n).fill(0), cut=half?games.length/2:0;
  for(let i=0;i<cut;i++)play(games[i],P0,G0);           // la primera volta «ja jugada», la mateixa a totes les simulacions
  const M=d3.range(n).map(()=>new Array(n).fill(0));
  for(let s=0;s<S8.sims;s++){
    const P=P0.slice(), G=G0.slice();
    for(let i=cut;i<games.length;i++)play(games[i],P,G);
    d3.range(n).sort((a,b)=>P[b]-P[a]||G[b]-G[a]||r()-.5).forEach((t,pos)=>M[t][pos]++);
  }
  return M.map((row,t)=>({t:S8.teams[t], p:row.map(c=>c/S8.sims*100), pts:P0[t], mean:d3.sum(row,(c,i)=>c*(i+1))/S8.sims}));
}
piece("spread-08",(el,w)=>{
  const mob=w<640, n=S8.n, left=mob?62:96, top=30, cw=Math.min(46,Math.floor((w-left-4)/n)), ch=mob?24:28, H=top+n*ch+30;
  const s=V.svg(el,w,H,"Probabilitat que cada equip d'una lliga simulada acabi en cada posició, de la primera a la setzena.");
  const tp=V.tip(el), ip=V.seqInterp(C.blue), ipR=V.seqInterp(C.red);
  if(!S8.res)S8.res=[s8sim(false),s8sim(true)];
  const k=el.__k||0;
  const g=s.append("g");
  const X=i=>left+i*cw;
  // capçalera de posicions i línies de columna
  d3.range(n).forEach(i=>{ g.append("line").attr("x1",X(i)).attr("x2",X(i)).attr("y1",top-6).attr("y2",top+n*ch).attr("stroke",C.grid).attr("stroke-width",.5);
    V.t(g,X(i)+cw/2,top-10,mob&&i%2&&i!==n-1?"":String(i+1),{size:V.FS.min,fill:C.muted,anchor:"middle"}); });
  V.t(g,left-8,top-10,"posició →",{size:V.FS.min,fill:C.muted,anchor:"end",italic:true});
  // llindar: descens
  const xd=X(n-S8.drop);
  g.append("line").attr("x1",xd).attr("x2",xd).attr("y1",top-20).attr("y2",top+n*ch+6).attr("stroke",C.ink).attr("stroke-width",1);
  V.t(g,xd+4,top+n*ch+20,"descens",{size:11.5,italic:true,fill:C.ink2});
  const rowsG=g.append("g");
  function render(k,anim){
    const res=S8.res[k].slice().sort((a,b)=>a.mean-b.mean);
    const rows=rowsG.selectAll("g.r").data(res,d=>d.t.n).join(en=>{ const r=en.append("g").attr("class","r");
        r.append("text").attr("class","nm").attr("x",left-8).attr("y",ch/2+4).attr("text-anchor","end").attr("font-size",mob?11.5:12.5).attr("fill",C.ink).text(d=>mob?d.t.n.replace("Equip ",""):d.t.n);
        return r; });
    rows.transition().duration(anim?700:0).ease(d3.easeCubicInOut).attr("transform",(d,i)=>`translate(0,${top+i*ch})`);
    rows.each(function(d){
      const cells=d.p.map((v,i)=>({d,i,v})).filter(c=>c.v>=.5);
      const cg=d3.select(this).selectAll("g.c").data(cells,c=>c.i).join(
        en=>{ const c=en.append("g").attr("class","c").attr("transform",c=>`translate(${X(c.i)},0)`).style("opacity",0);
          c.append("rect").attr("x",1).attr("y",1).attr("width",cw-2).attr("height",ch-2);
          c.append("text").attr("x",cw/2).attr("y",ch/2+4).attr("text-anchor","middle").attr("font-size",mob?10.5:11.5).style("font-variant-numeric","tabular-nums");
          return c; },
        up=>up, ex=>ex.transition().duration(anim?300:0).style("opacity",0).remove());
      cg.transition().duration(anim?500:0).delay(anim?180:0).style("opacity",1);
      cg.select("rect").attr("fill",c=>(c.i>=n-S8.drop?ipR:ip)(.12+.88*Math.sqrt(c.v/100)));
      cg.select("text").text(c=>cw>=17&&c.v>=1?Math.round(c.v):"").attr("fill",c=>c.v>45?C.paper:C.ink);
    });
    rowsG.selectAll("g.c rect").attr("stroke",null);
  }
  render(k,false);
  V.onView(el,done=>{ if(done)return; rowsG.selectAll("g.r").style("opacity",0).transition().duration(500).delay((d,i)=>i*45).style("opacity",1); });
  // hover: la cel·la apuntada en tinta, la fila al davant i la resta a 0,5
  const hit=s.append("rect").attr("x",left).attr("y",top).attr("width",n*cw).attr("height",n*ch).attr("fill","transparent").style("cursor","pointer");
  V.hover(hit.node(),(ev,[mx,my])=>{
    const ri=Math.max(0,Math.min(n-1,Math.floor((my-top)/ch))), ci=Math.max(0,Math.min(n-1,Math.floor((mx-left)/cw)));
    const res=S8.res[el.__k||0].slice().sort((a,b)=>a.mean-b.mean), d=res[ri], v=d.p[ci];
    V.focus(rowsG.selectAll("g.r"),r=>r===d);
    rowsG.selectAll("g.c rect").attr("stroke",c=>c.d===d&&c.i===ci?C.ink:null).attr("stroke-width",1.4);
    tp.show(`<b>${d.t.n}</b> · acaba ${ord(ci+1)} en el ${pct(v)} de les temporades ${V.rampRead(v/100,{interp:ci>=n-S8.drop?ipR:ip})}`);
  },()=>{ V.focus(rowsG.selectAll("g.r"),null); rowsG.selectAll("g.c rect").attr("stroke",null); tp.hide(); });
  // control: abans de començar · a mitja temporada
  d3.selectAll('[data-seg="spread-08"] button').on("click",function(){
    const kk=+this.dataset.k; if(kk===(el.__k||0))return; el.__k=kk;
    d3.selectAll('[data-seg="spread-08"] button').attr("aria-pressed",function(){ return +this.dataset.k===kk; });
    render(kk,!V.reduced);
  });
});
})();
