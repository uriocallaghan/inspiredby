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

/* Register Service Worker for offline-first PWA support. */
if('serviceWorker' in navigator){
  addEventListener('load',function(){
    navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});
  });
}
