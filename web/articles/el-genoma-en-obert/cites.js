/* Cites de l'article (data-c pot llistar diverses afirmacions d'una mateixa font, separades per espais): cada número del text baixa animadament fins a la seva font a «Dades i fonts»,
   i la fletxa (↑) de la font torna exactament al número des d'on hi has arribat.
   L'enllaç dels peus de gràfic porta a l'explicació completa del gràfic, i la seva fletxa torna al gràfic.
   En ordinador, passar per sobre d'un número mostra què s'hi recolza i la font, sense moure's. */
(function(){
  const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const off=()=>window.innerHeight*.32;
  let anim=0;
  function scrollToEl(el,done){
    const target=Math.max(0,window.scrollY+el.getBoundingClientRect().top-off());
    const start=window.scrollY, dist=target-start;
    if(reduced||Math.abs(dist)<4){ window.scrollTo(0,target); done&&done(); return; }
    const dur=Math.min(1500,Math.max(550,Math.abs(dist)*.12));
    cancelAnimationFrame(anim); let t0=null;
    const stop=()=>{ cancelAnimationFrame(anim); window.removeEventListener("wheel",stop); window.removeEventListener("touchstart",stop); };
    window.addEventListener("wheel",stop,{passive:true}); window.addEventListener("touchstart",stop,{passive:true});
    const step=now=>{ if(t0==null)t0=now; const p=Math.min(1,(now-t0)/dur);
      // els gràfics es dibuixen en passar i canvien l'alçada: el destí es recalcula a cada fotograma
      const tg=Math.max(0,window.scrollY+el.getBoundingClientRect().top-off());
      window.scrollTo(0,start+(tg-start)*ease(p));
      if(p<1)anim=requestAnimationFrame(step); else { stop(); setTimeout(()=>{ const r2=el.getBoundingClientRect(); if(Math.abs(r2.top-off())>40)window.scrollTo(0,window.scrollY+r2.top-off()); done&&done(); },60); } };
    anim=requestAnimationFrame(step);
  }
  function flash(el,cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function go(hash,push,from){
    const el=document.getElementById(decodeURIComponent(hash.slice(1))); if(!el)return false;
    // la fletxa de la font o del gràfic torna al lloc exacte des d'on s'ha clicat
    if(from&&from.id&&el.tagName==="LI"){ const b=el.querySelector("a.bk"); if(b)b.setAttribute("href","#"+from.id); }
    if(push)history.pushState(null,"",hash);
    scrollToEl(el,()=>{
      if(el.tagName==="LI"){
        document.querySelectorAll(".fn li.on").forEach(n=>n!==el&&n.classList.remove("on"));
        el.querySelectorAll(".us span.on").forEach(n=>n.classList.remove("on"));
        (from&&from.dataset.c?from.dataset.c.split(/\s+/):[]).forEach(id=>{ const u=document.getElementById(id); if(u&&el.contains(u))u.classList.add("on"); });
        flash(el,"on"); const b=el.querySelector("a.bk"); if(b)b.focus({preventScroll:true});
      } else if(el.id==="fonts"){ /* entradeta → secció */ }
      else { const a=el.matches("a")?el:(el.querySelector("a.gs")||el.querySelector("a")); if(a){ flash(a,"flash"); a.focus({preventScroll:true}); } }
    });
    return true;
  }
  document.addEventListener("click",ev=>{
    const a=ev.target.closest("sup.nr a, .fn a.bk, a.gs, a.dl-f");
    if(!a||ev.metaKey||ev.ctrlKey||ev.shiftKey)return;
    const h=a.getAttribute("href"); if(!h||h[0]!=="#")return;
    if(go(h,true,a))ev.preventDefault();
  });
  window.addEventListener("popstate",()=>{ if(location.hash)go(location.hash,false); });

  // vista prèvia en passar el ratolí: què s'hi recolza i la referència
  const pop=document.createElement("div"); pop.className="npop"; pop.setAttribute("aria-hidden","true"); document.body.appendChild(pop);
  let hideT=0;
  document.addEventListener("pointerover",ev=>{
    if(ev.pointerType!=="mouse")return;
    const a=ev.target.closest&&ev.target.closest("sup.nr a"); if(!a)return;
    const li=document.getElementById(a.getAttribute("href").slice(1)); if(!li)return;
    const c=li.cloneNode(true); c.querySelectorAll("a.bk,.us").forEach(n=>n.remove());
    const us=(a.dataset.c?a.dataset.c.split(/\s+/):[]).map(id=>document.getElementById(id)).filter(Boolean);
    pop.innerHTML=(us.length?`<span class="q">${us.map(u=>u.innerHTML).join(" ")}</span>`:"")+`<b>${a.textContent.replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[ch])}</b> · ${c.innerHTML}<span class="k">Clica per anar a la font</span>`;
    const r=a.getBoundingClientRect(), W=document.documentElement.clientWidth;
    pop.style.left="0px"; pop.style.top="0px"; pop.classList.add("on");
    const pw=pop.offsetWidth, ph=pop.offsetHeight;
    const L=Math.min(W-pw-12,Math.max(12,r.left+window.scrollX-pw/2)); let T=r.top+window.scrollY-ph-10;
    if(r.top-ph-10<0)T=r.bottom+window.scrollY+10;
    pop.style.left=L+"px"; pop.style.top=T+"px"; clearTimeout(hideT);
  });
  document.addEventListener("pointerout",ev=>{ if(ev.target.closest&&ev.target.closest("sup.nr a")){ hideT=setTimeout(()=>pop.classList.remove("on"),80); } });
})();
