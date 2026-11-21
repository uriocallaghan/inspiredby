/* Reading progress + show-on-scroll-up navigation bar for article pages. */
(function(){
  var prog=document.getElementById('ibProgress');
  var bar=document.querySelector('.ib-article .ib-bar');
  if(!prog&&!bar)return;
  var ticking=false,lastY=Math.max(0,scrollY),dir=0,acc=0,hidden=false;
  function upd(){
    ticking=false;
    var d=document.documentElement,max=Math.max(0,d.scrollHeight-innerHeight);
    var y=Math.min(max,Math.max(0,scrollY));
    if(prog){
      var p=max>0?y/max:0;
      prog.style.transform='scaleX('+p.toFixed(4)+')';
    }
    if(bar){
      var hideAfter=(bar.offsetHeight||60)+4;
      if(y<=hideAfter){
        if(hidden){hidden=false;bar.classList.remove('ib-bar--hidden')}
        dir=0;acc=0;lastY=y;
      }else{
        var dy=y-lastY;
        lastY=y;
        if(dy){
          var nd=dy>0?1:-1;
          if(nd!==dir){dir=nd;acc=Math.abs(dy)}else{acc+=Math.abs(dy)}
          if(dir===1&&acc>=10&&!hidden){hidden=true;bar.classList.add('ib-bar--hidden')}
          else if(dir===-1&&acc>=24&&hidden){hidden=false;bar.classList.remove('ib-bar--hidden')}
        }
      }
    }
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(upd)}}
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  addEventListener('load',req);
  upd();
})();

/* Lectura enfocada: als paragrafs llargs del cos, les linies que encara son a la
   part baixa de la pantalla surten mes fluixes i s'encenen en pujar (mascara
   CSS; no parteix el text ni toca colors, aixi que el mode fosc no hi intervé). */
(function(){
  if(!document.querySelector('.ib-article'))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!('IntersectionObserver' in window))return;
  if(!(CSS.supports('mask-image','linear-gradient(#000,#000)')||CSS.supports('-webkit-mask-image','linear-gradient(#000,#000)')))return;
  var MIN_LINES=4,ZONE=.35,FLOOR=.25;
  var st=document.createElement('style');
  st.textContent='.ib-reveal{--rv:9999px;--rz:300px;-webkit-mask-image:linear-gradient(to bottom,#000 var(--rv),rgba(0,0,0,'+FLOOR+') calc(var(--rv) + var(--rz)));mask-image:linear-gradient(to bottom,#000 var(--rv),rgba(0,0,0,'+FLOOR+') calc(var(--rv) + var(--rz)))}@media print{.ib-reveal{-webkit-mask-image:none;mask-image:none}}';
  document.head.appendChild(st);
  var all=[],vis=new Set(),ticking=false;
  function pick(){
    var ps=document.querySelectorAll('section.col:not(.fn) > p:not([class]),section.col:not(.fn) > p.dl');
    ps.forEach(function(p){
      var lh=parseFloat(getComputedStyle(p).lineHeight)||28;
      var on=p.offsetHeight>=lh*MIN_LINES-2;
      p.classList.toggle('ib-reveal',on);
      if(on&&all.indexOf(p)<0){all.push(p);io.observe(p)}
    });
  }
  function upd(){
    ticking=false;
    var h=innerHeight,z=h*ZONE,d=document.documentElement;
    var end=d.scrollHeight-h-scrollY<4;
    vis.forEach(function(p){
      if(!p.classList.contains('ib-reveal'))return;
      var top=p.getBoundingClientRect().top;
      var rv=end?99999:Math.round(h-z-top);
      p.style.setProperty('--rv',rv+'px');
      p.style.setProperty('--rz',Math.round(z)+'px');
    });
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(upd)}}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){e.isIntersecting?vis.add(e.target):vis.delete(e.target)});req();
  },{rootMargin:'50% 0px'});
  function init(){pick();req()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  addEventListener('scroll',req,{passive:true});
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(init,150)});
  addEventListener('load',init);
})();

/* Register Service Worker for offline-first PWA support. */
if('serviceWorker' in navigator){
  addEventListener('load',function(){
    navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});
  });
}
