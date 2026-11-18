/* Reading progress for article pages (fixed 2px line under the browser chrome). */
(function(){
  var bar=document.getElementById('ibProgress');
  if(!bar)return;
  var ticking=false;
  function upd(){
    ticking=false;
    var d=document.documentElement,max=d.scrollHeight-innerHeight;
    var p=max>0?Math.min(1,Math.max(0,scrollY/max)):0;
    bar.style.transform='scaleX('+p.toFixed(4)+')';
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(upd)}}
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  addEventListener('load',req);
  upd();
})();
