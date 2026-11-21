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

/* Lectura enfocada: als paragrafs llargs del cos, les paraules que encara son a
   la part baixa de la pantalla surten mes fluixes i s'encenen una a una, en
   ordre de lectura, a mesura que pugen. Cada paraula va en un <span> i en canvia
   nomes l'opacitat (no colors), aixi que el mode fosc no hi intervé. */
(function(){
  if(!document.querySelector('.ib-article'))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!('IntersectionObserver' in window))return;
  var MIN_LINES=4,ZONE=.24,FLOOR=.12;
  var st=document.createElement('style');
  st.textContent='.ib-w{transition:opacity .12s linear}@media print{.ib-w{opacity:1!important}}';
  document.head.appendChild(st);
  var paras=[],vis=new Set(),ticking=false;
  function wrap(node){
    for(var c=node.firstChild;c;){
      var nx=c.nextSibling;
      if(c.nodeType===3){
        var parts=c.nodeValue.split(/(\s+)/);
        if(parts.length>1||c.nodeValue.trim()){
          var f=document.createDocumentFragment();
          parts.forEach(function(t){
            if(!t)return;
            if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}
            var sp=document.createElement('span');sp.className='ib-w';sp.textContent=t;f.appendChild(sp);
          });
          node.replaceChild(f,c);
        }
      }else if(c.nodeType===1&&!/^(SVG|CANVAS|IMG|BR)$/i.test(c.nodeName)){wrap(c)}
      c=nx;
    }
  }
  function measure(p){
    var r=p.getBoundingClientRect(),lh=p._lh;
    p._ws=Array.prototype.map.call(p.querySelectorAll('.ib-w'),function(w){
      var q=w.getBoundingClientRect();
      var line=Math.floor((q.top+q.height/2-r.top)/lh);
      var fx=r.width?(q.left+q.width/2-r.left)/r.width:0;
      return {el:w,y:(line+.15+.7*fx)*lh,o:-1};
    });
  }
  function pick(){
    document.querySelectorAll('section.col:not(.fn) > p:not([class]),section.col:not(.fn) > p.dl').forEach(function(p){
      var lh=parseFloat(getComputedStyle(p).lineHeight)||28;p._lh=lh;
      if(!p._ib){
        if(p.offsetHeight<lh*MIN_LINES-2)return;
        p._ib=1;wrap(p);paras.push(p);io.observe(p);
      }
    });
    paras.forEach(measure);
  }
  function upd(){
    ticking=false;
    var h=innerHeight,z=h*ZONE,start=h-z,d=document.documentElement;
    var end=d.scrollHeight-h-scrollY<4;
    vis.forEach(function(p){
      var top=p.getBoundingClientRect().top,ws=p._ws||[];
      for(var i=0;i<ws.length;i++){
        var w=ws[i],t=end?0:Math.min(1,Math.max(0,(top+w.y-start)/z));
        t=t*t*(3-2*t);
        var o=Math.round((1-t*(1-FLOOR))*40)/40;
        if(o!==w.o){w.o=o;w.el.style.opacity=o===1?'':o}
      }
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
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
})();

/* Register Service Worker for offline-first PWA support. */
if('serviceWorker' in navigator){
  addEventListener('load',function(){
    navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});
  });
}
