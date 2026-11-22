/* Reading progress + navigation bar for article pages.
   HIDE_BAR=false: the bar stays visible so it never covers sticky graphics
   (editor decision, 22-11-2026); set to true to restore hide-on-scroll-down. */
var HIDE_BAR=false;
(function(){
  var prog=document.getElementById('ibProgress');
  var bar=HIDE_BAR?document.querySelector('.ib-article .ib-bar'):null;
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

/* Register Service Worker for offline-first PWA support. */
if('serviceWorker' in navigator){
  addEventListener('load',function(){
    navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});
  });
}

/* Card descriptions: no line holding a single word. If the last line of a
   description has only one word, tighten that paragraph a little (letter-
   spacing up to -0.025em and word-spacing up to -0.12em, in small steps
   together) until the word moves up and the paragraph is one line shorter.
   If that is not enough, leave it as it was. */
(function(){
  var ps=document.querySelectorAll('.ib-card-desc');
  if(!ps.length)return;
  var STEPS=20,LS=0.025,WS=0.12;
  function orphan(p){
    var t=p.firstChild;
    if(!t||t.nodeType!==3)return false;
    var s=t.data.replace(/\s+$/,''),i=s.lastIndexOf(' ');
    if(i<1)return false;
    var j=s.lastIndexOf(' ',i-1)+1,r=document.createRange();
    r.setStart(t,j);r.setEnd(t,i);var a=r.getBoundingClientRect();
    r.setStart(t,i+1);r.setEnd(t,s.length);var b=r.getBoundingClientRect();
    return b.top-a.top>2;
  }
  function set(p,k){
    p.style.letterSpacing=k?(-LS*k/STEPS).toFixed(4)+'em':'';
    p.style.wordSpacing=k?(-WS*k/STEPS).toFixed(4)+'em':'';
  }
  function fit(){
    for(var n=0;n<ps.length;n++){
      var p=ps[n],k=0;set(p,0);
      if(!orphan(p))continue;
      while(k<STEPS){set(p,++k);if(!orphan(p))break}
      if(orphan(p))set(p,0);
    }
  }
  var w=innerWidth,tm;
  addEventListener('resize',function(){if(innerWidth===w)return;w=innerWidth;clearTimeout(tm);tm=setTimeout(fit,120)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);else addEventListener('load',fit);
})();
