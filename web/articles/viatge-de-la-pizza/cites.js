/* Cites de l'article: navegació suau entre el text i les notes al peu. */
(function(){
  const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  let anim=0;
  function scrollToEl(el,done){
    const r=el.getBoundingClientRect();
    const target=Math.max(0,window.scrollY+r.top-window.innerHeight*.32);
    const start=window.scrollY, dist=target-start;
    if(reduced||Math.abs(dist)<4){ window.scrollTo(0,target); done&&done(); return; }
    const dur=Math.min(1400,Math.max(500,Math.abs(dist)*.12));
    cancelAnimationFrame(anim); let t0=null;
    const stop=()=>{ cancelAnimationFrame(anim); window.removeEventListener("wheel",stop); window.removeEventListener("touchstart",stop); };
    window.addEventListener("wheel",stop,{passive:true}); window.addEventListener("touchstart",stop,{passive:true});
    const step=now=>{ if(t0==null)t0=now; const p=Math.min(1,(now-t0)/dur);
      const tg=Math.max(0,window.scrollY+el.getBoundingClientRect().top-window.innerHeight*.32);
      window.scrollTo(0,start+(tg-start)*ease(p));
      if(p<1)anim=requestAnimationFrame(step); else { stop(); setTimeout(()=>{ const r2=el.getBoundingClientRect(); if(Math.abs(r2.top-window.innerHeight*.32)>40)window.scrollTo(0,window.scrollY+r2.top-window.innerHeight*.32); done&&done(); },60); } };
    anim=requestAnimationFrame(step);
  }
  function flash(el,cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function go(hash,push){
    const el=document.getElementById(hash.slice(1)); if(!el)return false;
    if(push)history.pushState(null,"",hash);
    scrollToEl(el,()=>{
      if(el.tagName==="LI"){ document.querySelectorAll("ol.nts li.on,ol.fts li.on").forEach(n=>n!==el&&n.classList.remove("on")); flash(el,"on"); const b=el.querySelector("a.bk"); if(b)b.focus({preventScroll:true}); }
      else { const a=el.matches("a")?el:el.querySelector("a"); if(a){ flash(a,"flash"); a.focus({preventScroll:true}); } }
    });
    return true;
  }
  document.addEventListener("click",ev=>{
    const a=ev.target.closest("sup.nr a, ol.nts a.bk, ol.nts a.fr");
    if(!a||ev.metaKey||ev.ctrlKey||ev.shiftKey)return;
    const h=a.getAttribute("href"); if(!h||h[0]!=="#")return;
    if(go(h,true))ev.preventDefault();
  });
  window.addEventListener("popstate",()=>{ if(location.hash)go(location.hash,false); });

  const pop=document.createElement("div"); pop.className="npop"; pop.setAttribute("aria-hidden","true"); document.body.appendChild(pop);
  let hideT=0;
  document.addEventListener("pointerover",ev=>{
    if(ev.pointerType!=="mouse")return;
    const a=ev.target.closest&&ev.target.closest("sup.nr a"); if(!a)return;
    const li=document.getElementById(a.getAttribute("href").slice(1)); if(!li)return;
    const c=li.cloneNode(true); c.querySelectorAll("a.bk").forEach(n=>n.remove());
    pop.innerHTML=`<b>Nota ${a.textContent}</b> · ${c.innerHTML}<span class="k">Clica per anar a la llista de notes</span>`;
    const r=a.getBoundingClientRect(), W=document.documentElement.clientWidth;
    pop.style.left="0px"; pop.style.top="0px"; pop.classList.add("on");
    const pw=pop.offsetWidth, ph=pop.offsetHeight;
    let L=Math.min(W-pw-12,Math.max(12,r.left+window.scrollX-pw/2)); let T=r.top+window.scrollY-ph-10;
    if(r.top-ph-10<0)T=r.bottom+window.scrollY+10;
    pop.style.left=L+"px"; pop.style.top=T+"px"; clearTimeout(hideT);
  });
  document.addEventListener("pointerout",ev=>{ if(ev.target.closest&&ev.target.closest("sup.nr a")){ hideT=setTimeout(()=>pop.classList.remove("on"),80); } });
})();
