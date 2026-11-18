/* Minimal scrollytelling helper shared by the articles.
   IB.scrolly(stepsEl, graphicEl, onStep): calls onStep(index, stepEl) when the active step changes.
   The active step is the last one whose top has passed a probe line (mid-screen on desktop,
   below the sticky graphic on mobile). */
window.IB=window.IB||{};
IB.scrolly=function(stepsEl,graphicEl,onStep){
  var steps=[].slice.call(stepsEl.querySelectorAll('.step')),cur=-1,ticking=false;
  function probeY(){
    if(innerWidth>=900)return innerHeight*.55;
    var b=graphicEl?Math.max(0,graphicEl.getBoundingClientRect().bottom):0;
    return b+(innerHeight-b)*.45;
  }
  function upd(){
    ticking=false;
    var y=probeY(),idx=0;
    for(var i=0;i<steps.length;i++){if(steps[i].getBoundingClientRect().top<y)idx=i}
    if(idx!==cur){
      if(cur>=0)steps[cur].classList.remove('on');
      cur=idx;steps[cur].classList.add('on');
      onStep(cur,steps[cur]);
    }
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(upd)}}
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  upd();
  return {refresh:function(){cur=-1;upd()}};
};
IB.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
IB.fmt=function(n,d){return n.toLocaleString('ca-ES',{maximumFractionDigits:d==null?0:d,minimumFractionDigits:d||0})};
