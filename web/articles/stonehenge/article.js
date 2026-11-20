/* «Per què van aixecar Stonehenge?» · part A: maqueta de línia, paisatge doble, mapa de procedències,
   quanta gent cal per moure una pedra i com s'alça un trílit.
   Paleta estricta: vermell #C8442A, blau #2C5DA8, groc #F5C518 i grisos. Mai text en groc, mai fons pintats,
   hover suau (IBV.focus ≥ 0,46) i lectura d'una línia sota el gràfic (IBV.tip). */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, L = window.SH_LOCAL, S3 = window.SH3D, C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C);
  const F0 = IBV.fmt(",.0f"), F1 = IBV.fmt(",.1f");
  const D2R = Math.PI/180;
  const MODEL = S3.buildModel(), GROUND = S3.buildGround();
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const ease = d3.easeCubicInOut;

  // botons de segment (.seg): aria-pressed i retorn del valor
  function segBind(root, attr, cb){
    if(!root) return;
    root.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      root.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x===b ? "true" : "false"));
      cb(b.dataset[attr], b);
    }));
  }
  // text amb halo al canvas
  function ctext(ctx, x, y, str, o){
    o = o||{};
    ctx.save();
    ctx.font = `${o.italic?"italic ":""}${o.weight||400} ${o.size||12.5}px ${IBV.SANS}`;
    ctx.textAlign = o.anchor==="middle" ? "center" : (o.anchor||"left"); ctx.textBaseline = "middle";
    ctx.lineJoin = "round"; ctx.lineWidth = 3.2; ctx.strokeStyle = S3.PAPER; ctx.strokeText(str, x, y);
    ctx.fillStyle = o.fill||C.ink; ctx.fillText(str, x, y);
    ctx.restore();
  }
  window.SHA = {segBind, ctext, MODEL, GROUND, clamp};

  /* ---------- MAP-01 · Mapa físic en relleu (bloc copiat de web/sistema/mapes-b.js) ---------- */
  const IB59_BANDS=[[200,[243,242,239]],[500,[235,233,228]],[800,[226,223,216]],[1500,[216,212,204]],[2200,[206,202,193]],[Infinity,[196,191,182]]];
  const IB59_COAST="#ABA8A1";
  function dem59(D){
    if(D.__dec)return D.__dec;
    const s=atob(D.b64), a=new Float32Array(s.length), k=(D.mx-D.mn)/254;
    for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i)*k+D.mn;
    const z=(lon,lat)=>{ const fx=(lon-D.lon0)/D.st-.5, fy=(D.lat1-lat)/D.st-.5;
      if(fx<0||fy<0||fx>D.nx-1||fy>D.ny-1)return NaN;
      const i=Math.floor(fx), j=Math.floor(fy), u=fx-i, v=fy-j, i1=Math.min(i+1,D.nx-1), j1=Math.min(j+1,D.ny-1);
      return (a[j*D.nx+i]*(1-u)+a[j*D.nx+i1]*u)*(1-v)+(a[j1*D.nx+i]*(1-u)+a[j1*D.nx+i1]*u)*v; };
    return (D.__dec={z,grid:a,D});
  }
  function iso59(D,th){
    const {grid}=dem59(D), out=[];
    for(const c of d3.contours().size([D.nx,D.ny]).thresholds(th)(grid)){
      const lines=[];
      for(const poly of c.coordinates)for(const ring of poly){
        let seg=[];
        for(const [gx,gy] of ring){
          if(gx<=.05||gx>=D.nx-1.05||gy<=.05||gy>=D.ny-1.05){ if(seg.length>1)lines.push(seg); seg=[]; }
          else seg.push([D.lon0+(gx+.5)*D.st, D.lat1-(gy+.5)*D.st]);
        }
        if(seg.length>1)lines.push(seg);
      }
      out.push({v:c.value,geo:{type:"MultiLineString",coordinates:lines}});
    }
    return out;
  }
  function relleu59(ctx,proj,w,h,D,o){
    o=o||{};
    const {z}=dem59(D), pth=d3.geoPath(proj,ctx);
    const land=o.land||null, sea=o.sea==null?0:o.sea;
    const iso=o.iso||(D.mx>1500?[500,1000,1500,2000,2500,3000]:[300,600,900,1200]);
    const sc=o.res||1, fw=Math.ceil(w/sc), fh=Math.ceil(h/sc);
    const fc=document.createElement("canvas"); fc.width=fw; fc.height=fh;
    const fx=fc.getContext("2d"), im=fx.createImageData(fw,fh), d=im.data;
    const kmLon=111.32*Math.cos(((D.lat1-D.ny*D.st/2)*Math.PI)/180), dd=D.st*1.12, sat=o.slope||98;
    for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
      const ll=proj.invert([(x+.5)*sc,(y+.5)*sc]); if(!ll)continue;
      const zz=z(ll[0],ll[1]); if(zz!==zz)continue;
      if(!land&&zz<=sea)continue;
      const gx=(z(ll[0]+dd,ll[1])-z(ll[0]-dd,ll[1]))/(2*dd*kmLon), gy=(z(ll[0],ll[1]+dd)-z(ll[0],ll[1]-dd))/(2*dd*111.32);
      const shade=(gx!==gx||gy!==gy)?0:clamp((-gx+gy)*.65/sat,-1,1)*15;
      const band=IB59_BANDS.find(q=>zz<q[0])[1];
      const i=(y*fw+x)*4; d[i]=clamp(band[0]+shade,0,255); d[i+1]=clamp(band[1]+shade,0,255); d[i+2]=clamp(band[2]+shade,0,255); d[i+3]=255;
    }
    fx.putImageData(im,0,0);
    ctx.save();
    if(land){ ctx.beginPath(); pth(land); ctx.clip(); }
    ctx.imageSmoothingEnabled=true; ctx.drawImage(fc,0,0,w,h);
    iso59(D,iso).forEach(c=>{ ctx.beginPath(); pth(c.geo); ctx.strokeStyle=IBV.alpha(C.ink,o.isoA||.14); ctx.lineWidth=.55; ctx.stroke(); });
    ctx.restore();
    if(o.coast!==false){
      ctx.beginPath();
      if(land)pth(land); else iso59(D,[sea+.01]).forEach(c=>pth(c.geo));
      ctx.strokeStyle=IB59_COAST; ctx.lineWidth=.9; ctx.lineJoin="round"; ctx.stroke();
    }
    if(o.rivers){ ctx.beginPath(); pth(o.rivers); ctx.strokeStyle=IBV.alpha(C.blau,.78); ctx.lineWidth=o.riverW||1.25; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke(); }
    if(o.fade){
      const a=proj([D.lon0,D.lat1]), b=proj([D.lon0+D.nx*D.st,D.lat1-D.ny*D.st]);
      const x0=Math.max(0,Math.min(a[0],b[0])), x1=Math.min(w,Math.max(a[0],b[0])), y0=Math.max(0,Math.min(a[1],b[1])), y1=Math.min(h,Math.max(a[1],b[1]));
      const Lf=Math.min(x1-x0,y1-y0)*(o.fadeK||.09);
      ctx.save(); ctx.globalCompositeOperation="destination-out";
      const side=(gx0,gy0,gx1,gy1,rx,ry,rw,rh)=>{ const g=ctx.createLinearGradient(gx0,gy0,gx1,gy1); g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,1)"); ctx.fillStyle=g; ctx.fillRect(rx,ry,rw,rh); };
      if(o.fade.includes("e"))side(x1-Lf,0,x1,0,x1-Lf,-2,w-x1+Lf+2,h+4);
      if(o.fade.includes("o"))side(x0+Lf,0,x0,0,-2,-2,x0+Lf+2,h+4);
      if(o.fade.includes("n"))side(0,y0+Lf,0,y0,-2,-2,w+4,y0+Lf+2);
      if(o.fade.includes("s"))side(0,y1-Lf,0,y1,-2,y1-Lf,w+4,h-y1+Lf+2);
      ctx.restore();
    }
  }
  let ukP = null;
  function ukWorld(){
    if(!ukP) ukP = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json")
      .then(r => { if(!r.ok) throw new Error("50m"); return r.json(); })
      .then(tp => ({land: topojson.feature(tp, tp.objects.land)}))
      .catch(() => IBV.world());
    return ukP;
  }

  /* =========================================================================
     V1 · MAQUETA DE LÍNIA (peça nova: HOW-01 en 3D)
     ========================================================================= */
  (function initMaqueta(){
    const el = document.getElementById("maq-viz"); if(!el) return;
    const fig = el.closest("figure");
    const tp = IBV.tip(el);
    const VIEWS = {
      avinguda: {el:19, dist:54, tz:1.2, fov:36},
      dalt:     {el:76, dist:72, tz:0,   fov:36},
      terra:    {el:2.5, dist:31, tz:3.4, fov:58}
    };
    let view = Object.assign({}, VIEWS.avinguda), az = S3.AX + 22, auto = !IBV.reduced, hoverId = null;
    // Escena de la fase 4 (c. 2200–2000 aC), quan es van tornar a plantar les pedres blaves (reconstrucció):
    // una colla arrossega una pedra blava sobre un trineu cap al cercle, algú la pica amb un percussor de pedra,
    // un altre cava el forat on anirà amb un pic de banya de cérvol, i un grup mira cap al Gran Trílit.
    const PEOPLE = [];
    { const D = S3.D2R, P2 = S3.pol, rr = IBV.rng(9), PEL = ["llarg","curt","monyo"];
      const [sx,sy] = P2(23, S3.AX+20), [tx,ty] = P2(16.5, S3.AX+2), L = Math.hypot(tx-sx, ty-sy), ux = (tx-sx)/L, uy = (ty-sy)/L, nx = uy, ny = -ux;
      const az = Math.atan2(ux, uy)/D, front = [sx + ux*1.25, sy + uy*1.25, .55];
      for(let i=0;i<6;i++){ const row = Math.floor(i/2), side = i%2 ? 1 : -1, d = 3.2 + row*1.5, o = side*.75;
        PEOPLE.push({x:sx + ux*d + nx*o, y:sy + uy*d + ny*o, pose:"estira", az, k:i*1.3, h:1.55 + rr()*.18, pel:PEL[i%3], capa:i===5, rope:front}); }
      // qui pica la pedra, agenollat al costat del trineu
      PEOPLE.push({x:sx - nx*1.4 - ux*.6, y:sy - ny*1.4 - uy*.6, pose:"picar", az:Math.atan2(nx, ny)/D, k:.4, h:1.62, pel:"curt"});
      // qui cava el forat del cercle de pedres blaves
      { const [hx,hy] = P2(12.9, S3.AX+27); PEOPLE.push({x:hx, y:hy, pose:"cavar", az:S3.AX+207, k:1.1, h:1.66, pel:"llarg"}); }
      // gent que mira cap al Gran Trílit, davant de l'Altar
      [[2.6,S3.AX+150],[2.9,S3.AX+200],[3.4,S3.AX+172]].forEach(([r,b],i) => { const [x,y] = P2(r,b); PEOPLE.push({x, y, pose:"mira", az:S3.AX+180, h:1.56 + i*.06, pel:["llarg","curt","monyo"][i], capa:i!==1}); });
      // algú que arriba per l'entrada amb un pic a l'espatlla
      { const [wx,wy] = P2(19, S3.AX-6); PEOPLE.push({x:wx, y:wy, pose:"porta", az:S3.AX+180, k:.7, h:1.68, pel:"curt", capa:true}); }
      }
    let W = 0, H = 0, ctx = null, hits = [], drag = false, tween = null, lastT = 0;
    segBind(fig.querySelector(".seg"), "k", k => {
      const from = Object.assign({}, view), to = VIEWS[k];
      if(IBV.reduced){ view = Object.assign({}, to); draw(); return; }
      tween = {from, to, t0: performance.now()};
    });
    const pressed = () => fig.querySelector(".seg button[aria-pressed=true]");
    const isTerra = () => (pressed()||{}).dataset && pressed().dataset.k === "terra";

    function labels(cam){
      const mob = W < 600;
      const L3 = (P, txt, dx, dy, o) => {
        const q = cam.p(P); if(!q || q[0]<10 || q[0]>W-10 || q[1]<12 || q[1]>H-10) return;
        const tx = clamp(q[0]+dx, 6, W-6), ty = clamp(q[1]+dy, 12, H-12);
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0], ty); ctx.lineTo(tx, ty);
        ctx.strokeStyle = C.ink; ctx.lineWidth = .8; ctx.stroke();
        ctx.beginPath(); ctx.arc(q[0], q[1], 1.8, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
        o = o||{};
        const right = dx >= 0;
        ctext(ctx, tx + (right?4:-4), ty-7, txt[0], {weight:700, anchor:right?"left":"right"});
        if(txt[1]) ctext(ctx, tx + (right?4:-4), ty+8, txt[1], {anchor:right?"left":"right", fill:C.ink2});
      };
      const gt = S3.pol(6.0, S3.AX+180);
      L3([gt[0], gt[1], 8.4], ["Gran Trílit", "uns 7 m sobre terra"], mob?36:-70, -34);
      if(!mob){
        const ab = S3.pol(44, S3.AX+3.2+20*360/56);
        L3([ab[0], ab[1], 0], ["56 forats Aubrey", "el primer cementiri"], 40, 26);
      }
      const ht = S3.pol(79, S3.AX+1.6);
      L3([ht[0], ht[1], 5.0], ["Pedra del Taló", "on surt el sol a l'estiu"], mob?-30:46, -30);
      const pp = S3.pol(23, S3.AX+20);
      L3([pp[0], pp[1], 1.1], ["Arrossegant una pedra blava", "fase 4, reconstrucció"], mob?-20:-150, 40);
    }

    function draw(){
      if(!ctx) return;
      const v = view, now = IBV.reduced ? 0 : performance.now();
      PEOPLE.forEach(pp => { if(!pp.walk) return; const w = pp.walk, d = 8 + ((w.d0 - 8 + 17 - now/1000*.5) % 17 + 17) % 17;
        pp.x = d*w.ex + w.o*w.nx; pp.y = d*w.ey + w.o*w.ny; });
      const camO = Object.assign(S3.orbit(az, v.el, v.dist, v.tz), {fov:v.fov, cy: v.el>60 ? .5 : v.el<5 ? .56 : .5});
      const cam = S3.camera(camO, W, H);
      hits = S3.render(ctx, W, H, cam, MODEL, GROUND, {
        phase: 4, people: PEOPLE, t: performance.now(), horizon: v.el < 8,
        highlight: hoverId ? (s => s.id === hoverId) : null
      });
      labels(cam);
    }

    IBV.mount(el, (container, w) => {
      W = w; H = Math.round(clamp(w*.6, 330, 600));
      ({ctx} = IBV.canvas(container, W, H, "Recreació en línia de Stonehenge cap al 2200 aC: el cercle de 30 sarsens amb llindes, cinc trílits en ferradura, les pedres blaves, l'Altar, la Pedra del Taló i el fossat circular amb els 56 forats Aubrey. Es pot girar arrossegant."));
      const cv = container.querySelector("canvas.ibv");
      container.appendChild(container.querySelector(".tip.ibv-dock") || document.createElement("div"));
      S3.dragOrbit(cv, dx => { auto = false; drag = true; az += dx*.35; hoverId = null; tp.hide(); draw(); }, () => { drag = false; });
      cv.addEventListener("pointermove", ev => {
        if(drag) return;
        const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
        let best = null, bd = 26*26;
        for(const h of hits){ const d = (h.x-x)**2 + (h.y-y)**2; if(d < bd || (best && d < bd*1.4 && h.d < best.d - 4)){ bd = Math.min(bd, d); best = h; } }
        const id = best ? best.s.id : null;
        if(id !== hoverId){ hoverId = id; draw(); }
        if(best){ const s = best.s; tp.show(`<b>${s.nom}</b> · ${S3.GROUPS[s.g]}`); auto = false; }
        else tp.hide();
      });
      cv.addEventListener("pointerleave", () => { hoverId = null; tp.hide(); draw(); });
      draw();
    });
    IBV.loop(el, (t, dt) => {
      if(tween){
        const k = clamp((performance.now()-tween.t0)/1100, 0, 1), e = ease(k);
        for(const key of ["el","dist","tz","fov"]) view[key] = tween.from[key] + (tween.to[key]-tween.from[key])*e;
        if(k >= 1) tween = null;
        draw(); return;
      }
      if(!drag){ if(auto) az += dt*.003; draw(); }
    });
  })();

  /* =========================================================================
     V2 · PAISATGE DOBLE: FUSTA PER ALS VIUS, PEDRA PER ALS AVANTPASSATS (MAP-01 + MAP-11)
     ========================================================================= */
  /* Vegetació d'avui (OpenStreetMap) en verd vegetal: boscos amb capçades, rengleres d'arbres i arbres sols.
     Es dibuixa en una capa a part que s'esvaeix a les vores, igual que el relleu. */
  function drawVeg(ctx, proj, w, h){
    const V = window.SH_VEG, oc = document.createElement("canvas"), dpr = ctx.getTransform().a;
    oc.width = Math.round(w*dpr); oc.height = Math.round(h*dpr);
    const g = oc.getContext("2d"); g.scale(dpr, dpr);
    const P = p => proj(p);
    const mPx = Math.abs(proj([-1.8262,51.1789])[1] - proj([-1.8262,51.1789+1/111.2])[1]) / 1000;
    const R0 = Math.max(2.8, 11*mPx), rnd = IBV.rng(4);
    const crowns = [];
    // boscos: taca clara amb contorn i capçades a dins
    V.woods.forEach(poly => {
      const q = poly.map(P);
      g.beginPath(); q.forEach((v,i) => i ? g.lineTo(v[0],v[1]) : g.moveTo(v[0],v[1])); g.closePath();
      g.fillStyle = IBV.alpha(C.vegetacioClar, .95); g.fill(); g.strokeStyle = IBV.alpha(C.vegetacioFosc, .5); g.lineWidth = .6; g.stroke();
      const xs = d3.extent(q, v=>v[0]), ys = d3.extent(q, v=>v[1]), step = Math.max(R0*1.6, 4.5);
      for(let y = ys[0]; y < ys[1]; y += step*.86) for(let x = xs[0] + ((Math.round(y/step))%2)*step/2; x < xs[1]; x += step){
        const px = x + (rnd()-.5)*step*.5, py = y + (rnd()-.5)*step*.5;
        if(d3.polygonContains(q, [px, py])) crowns.push([px, py, R0*(.75 + rnd()*.5)]);
      }
    });
    // rengleres i arbres sols
    V.rows.forEach(line => { const q = line.map(P);
      for(let i=0;i<q.length-1;i++){ const L2 = Math.hypot(q[i+1][0]-q[i][0], q[i+1][1]-q[i][1]), n = Math.max(1, Math.floor(L2/(R0*2)));
        for(let k=0;k<n;k++){ const t = k/n; crowns.push([q[i][0]+(q[i+1][0]-q[i][0])*t, q[i][1]+(q[i+1][1]-q[i][1])*t, R0*(.7+rnd()*.4)]); } } });
    V.trees.forEach(t => { const p = P(t); crowns.push([p[0], p[1], R0*(.8+rnd()*.5)]); });
    crowns.sort((a,b) => a[1]-b[1]);
    // capçades: cercle verd amb vora fosca i ombra suau cap al SE, com en una maqueta
    g.beginPath(); crowns.forEach(([x,y,r]) => { g.moveTo(x+r*.35+r, y+r*.35); g.arc(x+r*.35, y+r*.35, r, 0, 6.283); });
    g.fillStyle = IBV.alpha(C.ink, .08); g.fill();
    crowns.forEach(([x,y,r]) => { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fillStyle = C.vegetacio; g.fill(); g.strokeStyle = IBV.alpha(C.vegetacioFosc, .9); g.lineWidth = .55; g.stroke(); });
    // vores esvaïdes
    g.globalCompositeOperation = "destination-out";
    const edge = (x0,y0,x1,y1,rx,ry,rw,rh) => { const lg = g.createLinearGradient(x0,y0,x1,y1); lg.addColorStop(0,"rgba(0,0,0,0)"); lg.addColorStop(1,"rgba(0,0,0,1)"); g.fillStyle = lg; g.fillRect(rx,ry,rw,rh); };
    const f = Math.min(w,h)*.08;
    edge(0,f,0,0,-2,-2,w+4,f+2); edge(0,h-f,0,h,-2,h-f,w+4,f+2); edge(f,0,0,0,-2,-2,f+2,h+4); edge(w-f,0,w,0,w-f,-2,f+2,h+4);
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(oc, 0, 0); ctx.restore();
    // el riu, per sobre dels arbres de ribera
    ctx.beginPath(); d3.geoPath(proj, ctx)({type:"LineString", coordinates:L.avon});
    ctx.strokeStyle = IBV.alpha(C.blau,.78); ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
  }

  (function initPaisatge(){
    const el = document.getElementById("pai-viz"); if(!el || !window.SHL_DEM) return;
    const fig = el.closest("figure"), btn = fig.querySelector(".playb"), tp = IBV.tip(el);
    const SITES = [
      {id:"sh", nom:"Stonehenge", sub:"pedra · avantpassats", lon:-1.8262, lat:51.1789, c:C.vermell, r:55, k:"pedra", det:"Cercle de pedra sobre la carena seca; cementiri de cremacions"},
      {id:"dw", nom:"Durrington Walls", sub:"fusta · vius", lon:-1.7875, lat:51.1920, c:C.groc, r:240, k:"fusta", det:"Recinte de ~500 m amb cercles de pals de roure, cases i restes de banquets d'hivern"},
      {id:"bh", nom:"Bluestonehenge", sub:"vora el riu", lon:-1.7978, lat:51.1715, c:C.blau, r:12, k:"riu", det:"Petit cercle de pedres blaves al final de l'Avinguda, arran de l'Avon"},
      {id:"bm", nom:"Blick Mead", sub:"font mesolítica", lon:-1.7878, lat:51.1774, c:C.ink2, r:0, k:"meso", det:"Campament de caçadors-recol·lectors mil·lennis anteriors al monument"},
      {id:"mp", nom:"Pals mesolítics", sub:"c. 8500–7000 aC", lon:-1.8287, lat:51.18045, c:C.ink2, r:0, k:"meso", det:"Forats de grans pals de pi a l'antic aparcament, uns 5.000 anys abans del fossat"}
    ];
    const AV = [[-1.8250,51.17945],[-1.8212,51.1815],[-1.8197,51.18235],[-1.8118,51.1819],[-1.8091,51.1816],[-1.8066,51.1812],[-1.8049,51.1806],[-1.8030,51.1793]];
    const AV2 = [[-1.8030,51.1793],[-1.8008,51.1760],[-1.7978,51.1715]];
    // camí de la processó: DW → riu (OSM) → Bluestonehenge → Avinguda → Stonehenge
    const near = (pts, p) => d3.minIndex(pts, q => (q[0]-p[0])**2 + (q[1]-p[1])**2);
    const i0 = near(L.avon, [-1.7823,51.1905]), i1 = near(L.avon, [-1.7975,51.1713]);
    const ROUTE = [[-1.7850,51.1915], ...L.avon.slice(i0, i1+1), ...AV2.slice().reverse().slice(1), ...AV.slice().reverse(), [-1.8262,51.1789]];
    let anim = null;

    IBV.mount(el, (container, w) => {
      const mob = w < 600, H = Math.round(clamp(w*.62, 320, 560));
      const proj = d3.geoMercator().fitExtent([[6,6],[w-6,H-6]], {type:"MultiPoint", coordinates:[[-1.865,51.163],[-1.770,51.198]]});
      d3.select(container).selectAll("*").remove();
      const {ctx} = IBV.canvas(container, w, H, "");
      relleu59(ctx, proj, w, H, window.SHL_DEM, {iso:d3.range(60,150,10), slope:30, coast:false, fade:"neso", fadeK:.06,
        rivers:{type:"LineString", coordinates:L.avon}, riverW:1.6});
      if(window.SH_VEG) drawVeg(ctx, proj, w, H);
      const svg = IBV.svg(container, w, H, "Mapa físic del paisatge de Stonehenge: Durrington Walls (fusta) al nord-est vora el riu Avon, l'Avinguda que puja des del riu fins a Stonehenge (pedra) i els pals mesolítics.");
      svg.style("position","absolute").style("left",0).style("top",0);
      const P = p => proj(p), line = d3.line().x(d=>P(d)[0]).y(d=>P(d)[1]).curve(d3.curveCatmullRom.alpha(.5));
      const mPx = Math.abs(proj([-1.8262,51.1789])[1] - proj([-1.8262,51.1789+1/111.2])[1]) / 1000; // px per metre
      const g = svg.append("g");
      // Avinguda: contorn real (OSM) i tram final aproximat
      L.avinguda.forEach(poly => g.append("path").attr("d", d3.line()(poly.map(P))).attr("fill", IBV.alpha(C.ink,.06)).attr("stroke", C.ink).attr("stroke-width",.7));
      g.append("path").attr("d", line(AV2)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","3 3");
      // Woodhenge (OSM)
      g.append("path").attr("d", d3.line()(L.woodhenge.map(P))+"Z").attr("fill", IBV.alpha(C.groc,.5)).attr("stroke", C.ink).attr("stroke-width",.6);
      // el camí de la processó (latent)
      const routeP = g.append("path").attr("d", line(ROUTE)).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",1.6).attr("stroke-opacity",.0);
      // llocs
      const sg = g.selectAll("g.site").data(SITES).join("g").attr("class","site").attr("transform", d => `translate(${P([d.lon,d.lat])})`).style("cursor","pointer");
      sg.filter(d=>d.r>0).append("circle").attr("r", d => Math.max(4, d.r*mPx)).attr("fill", d => IBV.alpha(d.c, d.k==="fusta"?.38:.32)).style("mix-blend-mode","multiply");
      sg.append("circle").attr("r", 2.4).attr("fill", d => d.k==="meso" ? "none" : C.ink).attr("stroke", C.ink).attr("stroke-width",.9);
      // anotacions
      const pSH = P([-1.8262,51.1789]), pDW = P([-1.7875,51.1920]), pBH = P([-1.7978,51.1715]), pMP = P([-1.8287,51.18045]);
      if(mob) IBV.note(g, {x:pSH[0], y:pSH[1]-5, tx:pSH[0]+6, ty:pSH[1]-46, kind:"elbow", anchor:"start", lines:[["Stonehenge",true],["pedra, avantpassats"]]});
      else IBV.note(g, {x:pSH[0]-6, y:pSH[1]+4, tx:pSH[0]-30, ty:pSH[1]+56, kind:"elbow", anchor:"start", lines:[["Stonehenge",true],["pedra per als avantpassats"]]});
      IBV.note(g, {x:pDW[0]+4, y:pDW[1]-8, tx:pDW[0]+(mob?-8:-40), ty:pDW[1]-(mob?28:46), kind:"elbow", anchor:"end", lines:[["Durrington Walls i Woodhenge",true],["fusta per als vius"]]});
      IBV.note(g, {x:pBH[0], y:pBH[1]+4, tx:pBH[0]-(mob?4:26), ty:pBH[1]+(mob?30:40), kind:"elbow", anchor:"end", lines:[["Bluestonehenge",true],["l'Avinguda neix al riu"]]});
      if(!mob) IBV.note(g, {x:pMP[0], y:pMP[1]-3, tx:pMP[0]-20, ty:pMP[1]-36, kind:"elbow", anchor:"end", lines:[["Pals mesolítics",true],["c. 8500–7000 aC"]]});
      const pAv = P(AV[4]);
      IBV.t(g, pAv[0], pAv[1]-12, "L'Avinguda", {italic:true, size:12.5, anchor:"middle", fill:C.ink2, halo:true});
      const pRv = P(L.avon[near(L.avon,[-1.7748,51.1830])]);
      IBV.t(g, pRv[0]+(mob?-8:8), pRv[1], "riu Avon", {italic:true, size:12.5, fill:C.blau, halo:true, anchor:mob?"end":"start"});
      // escala d'1 km
      const sx = w-22-1000*mPx, sy = H-16;
      g.append("path").attr("d",`M${sx},${sy-4}V${sy}H${sx+1000*mPx}V${sy-4}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.8);
      IBV.t(g, sx+500*mPx, sy-8, "1 km", {size:11.5, anchor:"middle", fill:C.ink2, halo:true});
      // hover
      const dl = d3.Delaunay.from(SITES, d => P([d.lon,d.lat])[0], d => P([d.lon,d.lat])[1]);
      IBV.hover(svg.node(), (ev,[x,y]) => {
        const i = dl.find(x,y), d = SITES[i], p = P([d.lon,d.lat]);
        if(Math.hypot(p[0]-x,p[1]-y) > 46){ IBV.focus(sg, null); tp.hide(); return; }
        IBV.focus(sg, s => s===d);
        tp.show(`<b>${d.nom}</b> · ${d.det}`);
      }, () => { IBV.focus(sg, null); tp.hide(); });
      // processó
      const walker = g.append("circle").attr("r",4.2).attr("fill",C.vermell).attr("stroke",S3.PAPER).attr("stroke-width",1.5).style("opacity",0);
      const len = routeP.node().getTotalLength();
      const run = () => {
        if(anim) anim.stop();
        routeP.attr("stroke-opacity",.85).attr("stroke-dasharray",`0 ${len}`);
        walker.style("opacity",1);
        if(IBV.reduced){ routeP.attr("stroke-dasharray",null); const e = routeP.node().getPointAtLength(len); walker.attr("cx",e.x).attr("cy",e.y); return; }
        const T = 24000;
        anim = d3.timer(el2 => {
          const k = Math.min(1, el2/T), L2 = len*d3.easeSinInOut(k), p = routeP.node().getPointAtLength(L2);
          routeP.attr("stroke-dasharray",`${L2} ${len}`); walker.attr("cx",p.x).attr("cy",p.y);
          if(k >= 1){ anim.stop(); anim = null; }
        });
      };
      if(btn){ btn.onclick = run; }
      IBV.onView(container, instant => { if(!instant) setTimeout(run, 600); else run(); });
    });
  })();

  /* =========================================================================
     V3 · SCROLLY: UN MAPA DE PEDRA DE TOTA UNA ILLA (MAP-01 + MAP-11 + MAP-03)
     ========================================================================= */
  (function initPedres(){
    const el = document.getElementById("pedres-viz"); if(!el) return;
    const sec = document.getElementById("s-pedres"), tp = IBV.tip(el);
    const tEl = document.getElementById("pedres-t"), sEl = document.getElementById("pedres-s");
    IBV.legendCat(document.getElementById("pedres-lg"), [
      {c:C.vermell, t:"El que es mou en aquest pas", kind:"line"},
      {c:C.ghost, t:"Pas anterior", kind:"line"}
    ]);
    const SH = [D.stonehenge.lon, D.stonehenge.lat];
    const O = D.orígens;
    const STEPS = [
      {k:"sarsen", ids:["sarsen"], t:"Els gegants de West Woods", s:"50 dels 52 sarsens, d'un bosc a 25 km (Nash et al., 2020)"},
      {k:"gales", ids:["bluestones"], t:"Vuitanta pedres de Gal·les", s:"Turons Preseli, uns 230 km en línia recta"},
      {k:"altar", ids:["altar"], t:"L'Altar ve de l'altra punta de l'illa", s:"Conca Orcadiana, com a mínim 750 km (Clarke et al., 2024)"},
      {k:"feast", ids:["cremats","porcs"], t:"També viatjaven els morts i els porcs", s:"10 de 25 cremats i quasi tots els porcs dels banquets eren de fora"},
      {k:"illa", ids:O.map(o=>o.id), t:"Tota una illa en un sol cercle", s:"L'únic dels ~900 cercles britànics fet amb pedres portades de lluny"}
    ];
    let cur = 0, st = null;
    function apply(i){
      cur = i; const S = STEPS[i];
      tEl.textContent = S.t; sEl.textContent = S.s;
      if(!st) return;
      const seen = new Set(STEPS.slice(0,i).flatMap(s=>s.ids)), on = new Set(S.ids);
      st.routes.transition().duration(IBV.reduced?0:700)
        .attr("stroke", d => on.has(d.id) ? C.vermell : C.ghost)
        .attr("stroke-width", d => on.has(d.id) ? 1.7 : 1)
        .attr("stroke-opacity", d => on.has(d.id) ? .9 : seen.has(d.id) ? .9 : 0);
      st.dots.transition().duration(IBV.reduced?0:700)
        .attr("opacity", d => on.has(d.id) ? 1 : seen.has(d.id) ? .55 : 0);
      st.labels.transition().duration(IBV.reduced?0:500).style("opacity", d => on.has(d.id) ? 1 : 0);
      st.on = on;
    }
    IBV.mount(el, (container, w) => {
      const mob = w < 520;
      const H = Math.round(clamp(Math.min(innerHeight*(innerWidth<900?.46:.74), w*1.25), 300, 760));
      d3.select(container).selectAll("svg,canvas").remove();
      const proj = d3.geoTransverseMercator().rotate([2.5,-54.5])
        .fitExtent([[mob?6:16, 8],[w-(mob?6:16), H-8]], {type:"MultiPoint", coordinates:[[-5.6,50.3],[0.6,50.8],[-3.2,59.2],[-6.2,57.5]]});
      const {ctx} = IBV.canvas(container, w, H, "");
      const svg = IBV.svg(container, w, H, "Mapa físic de Gran Bretanya amb els camins de les pedres de Stonehenge: sarsens de West Woods (25 km), pedres blaves dels turons Preseli a Gal·les (230 km), la Pedra de l'Altar del nord-est d'Escòcia (750 km o més), i l'origen de morts cremats i porcs dels banquets.");
      svg.style("position","absolute").style("left",0).style("top",0);
      const pc = d3.select(container).append("canvas").attr("width",w*2).attr("height",H*2).style("width",w+"px").style("height",H+"px")
        .style("position","absolute").style("left",0).style("top",0).style("pointer-events","none").node();
      const pctx = pc.getContext("2d"); pctx.scale(2,2);
      ukWorld().then(wd => {
        relleu59(ctx, proj, w, H, window.SH_DEM, {land: wd.land, iso:[300,600,900], fade:""});
      });
      const P = p => proj(p), path = d3.geoPath(proj);
      const R = O.map(o => ({...o, line:{type:"LineString", coordinates:[[o.lon,o.lat],SH]}}));
      const g = svg.append("g");
      const routes = g.selectAll("path.r").data(R).join("path").attr("class","r").attr("fill","none")
        .attr("d", d => path(d.line)).attr("stroke", C.ghost).attr("stroke-opacity",0).attr("stroke-linecap","round");
      const dots = g.selectAll("g.o").data(R).join("g").attr("class","o").attr("transform", d => `translate(${P([d.lon,d.lat])})`).attr("opacity",0);
      const rS = d3.scaleSqrt().domain([0,850]).range([0, mob?20:30]);
      dots.append("circle").attr("r", d => rS(d.dist)).attr("fill", IBV.alpha(C.vermell,.22)).style("mix-blend-mode","multiply");
      dots.append("circle").attr("r", 2.6).attr("fill", C.ink);
      const sh = P(SH);
      g.append("circle").attr("cx",sh[0]).attr("cy",sh[1]).attr("r",4.5).attr("fill",C.vermell).attr("stroke",S3.PAPER).attr("stroke-width",1.5);
      IBV.t(g, sh[0]+8, sh[1]+16, "Stonehenge", {weight:700, halo:true});
      const labels = g.selectAll("g.lb").data(R).join("g").attr("class","lb").style("opacity",0);
      labels.each(function(d){
        const p = P([d.lon,d.lat]), left = p[0] > w*.55;
        IBV.note(d3.select(this), {x:p[0], y:p[1], tx:p[0]+(left?-16:16), ty:p[1]-(d.id==="porcs"?26:18), kind:"elbow", anchor:left?"end":"start", lines:[[d.curt,true],[d.pes]]});
      });
      st = {routes, dots, labels, on:new Set()};
      apply(cur);
      // hover sobre els orígens
      const dl = d3.Delaunay.from(R, d => P([d.lon,d.lat])[0], d => P([d.lon,d.lat])[1]);
      IBV.hover(svg.node(), (ev,[x,y]) => {
        const d = R[dl.find(x,y)], p = P([d.lon,d.lat]);
        if(Math.hypot(p[0]-x,p[1]-y) > 40 || +d3.select(dots.nodes()[R.indexOf(d)]).attr("opacity") === 0){ tp.hide(); return; }
        tp.show(`<b>${d.nom}</b> · ${d.detall}`);
      }, () => tp.hide());
      // partícules lentes sobre els camins actius (~25 s de recorregut)
      const parts = d3.range(160).map((_,i) => ({r:i%R.length, t:Math.random()}));
      const lens = routes.nodes().map(n => n.getTotalLength());
      if(st.loop) st.loop.stop();
      st.loop = IBV.loop(container, (t, dt) => {
        pctx.clearRect(0,0,w,H);
        if(IBV.reduced) return;
        parts.forEach(p => {
          const d = R[p.r]; if(!st.on.has(d.id)) return;
          p.t = (p.t + dt/25000) % 1;
          const n = routes.nodes()[p.r], q = n.getPointAtLength(lens[p.r]*p.t);
          pctx.beginPath(); pctx.arc(q.x, q.y, 1.6, 0, 7); pctx.fillStyle = IBV.alpha(C.vermell, .75*Math.sin(Math.PI*p.t)); pctx.fill();
        });
      });
    });
    IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), i => apply(i));
  })();

})();
