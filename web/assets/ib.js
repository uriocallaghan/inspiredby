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

/* Lectura enfocada: als paragrafs llargs del cos, cada linia que encara es a la
   part baixa de la pantalla surt mes fluixa i s'encén en pujar. Una mascara CSS
   amb un to pla per linia (cap degradat dins la linia); no parteix el text ni
   toca colors, aixi que el mode fosc no hi intervé. */
(function(){
  if(!document.querySelector('.ib-article'))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!('IntersectionObserver' in window))return;
  var MK=CSS.supports('mask-image','linear-gradient(#000,#000)')?'maskImage':CSS.supports('-webkit-mask-image','linear-gradient(#000,#000)')?'webkitMaskImage':null;
  if(!MK)return;
  var MIN_LINES=4,ZONE=.22,FLOOR=.28;
  var st=document.createElement('style');
  st.textContent='@media print{.ib-reveal{-webkit-mask-image:none!important;mask-image:none!important}}';
  document.head.appendChild(st);
  var all=[],vis=new Set(),ticking=false;
  function pick(){
    document.querySelectorAll('section.col:not(.fn) > p:not([class]),section.col:not(.fn) > p.dl').forEach(function(p){
      var lh=parseFloat(getComputedStyle(p).lineHeight)||28;
      p._lh=lh;
      var on=p.offsetHeight>=lh*MIN_LINES-2;
      p.classList.toggle('ib-reveal',on);
      if(!on){p.style[MK]='';p._m=''}
      if(on&&all.indexOf(p)<0){all.push(p);io.observe(p)}
    });
  }
  function upd(){
    ticking=false;
    var h=innerHeight,z=h*ZONE,start=h-z,d=document.documentElement;
    var end=d.scrollHeight-h-scrollY<4;
    vis.forEach(function(p){
      if(!p.classList.contains('ib-reveal'))return;
      var r=p.getBoundingClientRect(),lh=p._lh,n=Math.max(1,Math.round(r.height/lh)),stops=[],dim=false;
      for(var i=0;i<n;i++){
        var y=r.top+(i+.5)*lh,t=end?0:Math.min(1,Math.max(0,(y-start)/z));
        t=t*t*(3-2*t);
        var o=Math.round((1-t*(1-FLOOR))*50)/50;if(o<1)dim=true;
        var y0=i*lh,y1=i===n-1?r.height+lh:(i+1)*lh;
        stops.push('rgba(0,0,0,'+o+') '+y0.toFixed(1)+'px','rgba(0,0,0,'+o+') '+y1.toFixed(1)+'px');
      }
      var m=dim?'linear-gradient(to bottom,'+stops.join(',')+')':'';
      if(m!==p._m){p._m=m;p.style[MK]=m}
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
