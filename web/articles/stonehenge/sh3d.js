/* «Per què van aixecar Stonehenge?» · Maqueta de línia (peça nova, extensió 3D d'IB-16).
   Motor mínim de perspectiva en canvas 2D: blocs de pedra a escala real dibuixats com un gravat
   (cares en blanc de paper, arestes en tinta fina, ratllat a les cares d'ombra). Sense llibreries noves.
   Coordenades en metres: x = est, y = nord, z = amunt; origen al centre del cercle de sarsens.
   Reconstrucció esquemàtica: dimensions d'English Heritage; posicions de pedres blaves i forats aproximades. */
(function(){
  "use strict";
  const C = IBV.C;
  const PAPER = (getComputedStyle(document.documentElement).getPropertyValue("--paper") || "").trim() || "white"; // paper de la pàgina (article.css)
  const TINT = d3.interpolateLab(PAPER, C.vermell)(.14);   // to molt clar del vermell per a la pedra apuntada
  const AX = 49;                         // azimut de l'eix solsticial (Ruggles 1997: 49° / 229°)
  const R2D = 180/Math.PI, D2R = Math.PI/180;
  const pol = (r, b) => [r*Math.sin(b*D2R), r*Math.cos(b*D2R)];

  /* ---------- 1. El model: llista de blocs ---------- */
  // bloc: {id, g (grup), nom, ph:[desDe, finsA] fases, x, y, rot (azimut de la cara ampla), w, t, h, z0, taper, lean, rnd}
  function buildModel(){
    const S = [];
    const rnd = IBV.rng(51);
    const J = k => (rnd()-.5)*k;
    const add = o => { o.rnd = [J(.16),J(.16),J(.16),J(.16),J(.1),J(.1),J(.1),J(.1)]; S.push(o); return o; };

    // Cercle de sarsens: 30 pilars (pedra 11 més petita) i 30 llindes contínues
    const RS = 15.0;
    for(let i=0;i<30;i++){
      const b = AX + 6 + i*12, [x,y] = pol(RS,b), n = i+1, small = n===11;
      add({id:"s"+n, g:"sarsen", nom:`Sarsen ${n} del cercle`, ph:[2,9], x, y, rot:b+90, w:small?1.3:2.1, t:1.1, h:small?3.2:4.1, z0:0, taper:.9});
    }
    for(let i=0;i<30;i++){
      const b0 = AX + 6 + i*12, b1 = b0 + 12, bm = b0 + 6, [x,y] = pol(RS,bm);
      const chord = 2*RS*Math.sin(6*D2R);
      add({id:"l"+(i+1), g:"llinda", nom:"Llinda del cercle", ph:[2,9], x, y, rot:bm+90, w:chord+.9, t:1.0, h:.8, z0:4.1, taper:.97, lintel:true});
    }
    // Cinc trílits en ferradura oberta al NE; alçades sobre terra 6,0 · 6,5 · 7,3 · 6,5 · 6,0 m
    const TRI = [
      {n:"51–52", off:-108, r:7.0, h:6.0},
      {n:"53–54", off:-54, r:6.5, h:6.5},
      {n:"55–56 (Gran Trílit)", off:0, r:6.0, h:7.0},
      {n:"57–58", off:54, r:6.5, h:6.5},
      {n:"59–60", off:108, r:7.0, h:6.0}
    ];
    TRI.forEach((tr,k) => {
      const b = AX + 180 + tr.off, [cx,cy] = pol(tr.r,b), tx = Math.cos(b*D2R), ty = -Math.sin(b*D2R); // tangent
      const id = "t"+k, nom = `Trílit ${tr.n}`;
      [-1,1].forEach(s => add({id, g:"trilit", nom, ph:[2,9], x:cx+s*1.3*tx, y:cy+s*1.3*ty, rot:b+90, w:2.2, t:1.25, h:tr.h, z0:0, taper:.86}));
      add({id, g:"trilit", nom, ph:[2,9], x:cx, y:cy, rot:b+90, w:5.0, t:1.1, h:1.0, z0:tr.h, taper:.96, lintel:true});
    });
    // Pedra de l'Altar (jacent, 4,9 × 1,0 × 0,5 m) davant del Gran Trílit
    { const [x,y] = pol(4.1, AX+180); add({id:"altar", g:"altar", nom:"Pedra de l'Altar · 6 t, d'Escòcia", ph:[2,9], x, y, rot:AX+90, w:4.9, t:1.0, h:.5, z0:0, taper:.95}); }
    // Pedra del Taló (fora, sobre l'Avinguda), Pedra de la Matança (jacent a l'entrada) i quatre Station Stones
    { const [x,y] = pol(79, AX+1.6); add({id:"talo", g:"talo", nom:"Pedra del Taló", ph:[2,9], x, y, rot:AX+90, w:2.4, t:2.1, h:4.9, z0:0, taper:.62, lean:[-.35,-.35]}); }
    { const [x,y] = pol(48, AX-4); add({id:"mat", g:"talo", nom:"Pedra de la Matança (jacent)", ph:[2,9], x, y, rot:AX, w:6.4, t:2.0, h:.7, z0:0, taper:.95}); }
    [[16.5,40.8],[-16.5,40.8],[-16.5,-40.8],[16.5,-40.8]].forEach(([u,v],k) => {
      const ua = AX*D2R, x = u*Math.sin(ua) + v*Math.cos(ua), y = u*Math.cos(ua) - v*Math.sin(ua);
      add({id:"st"+k, g:"station", nom:`Station Stone ${91+k}`, ph:[2,9], x, y, rot:AX, w:1.2, t:.9, h:k%2?1.2:2.6, z0:0, taper:.8});
    });
    // Pedres blaves: a l'inici als forats Aubrey (fase 1), després doble arc Q/R (fases 2–3), al final cercle i ferradura (fases 4–5)
    for(let i=0;i<56;i++){
      const b = AX + 3.2 + i*360/56, [x,y] = pol(44,b);
      add({id:"ab"+i, g:"blava1", nom:"Pedra blava en un forat Aubrey (fase 1, hipòtesi)", ph:[1,1], x, y, rot:b+90, w:.9, t:.6, h:1.7+J(.5), z0:0, taper:.8});
    }
    for(let i=0;i<34;i++){
      const b = AX + 32 + i*(296/33);
      [12.6,10.8].forEach((r,j) => { const [x,y] = pol(r,b);
        add({id:"q"+i+j, g:"blava", nom:"Pedra blava del doble arc Q/R", ph:[2,3], x, y, rot:b+90, w:.9, t:.6, h:1.8+J(.4), z0:0, taper:.8}); });
    }
    for(let i=0;i<60;i++){
      const b = AX + 3 + i*6, [x,y] = pol(12.2,b);
      add({id:"bc"+i, g:"blava", nom:"Pedra blava del cercle (de Gal·les)", ph:[4,9], x, y, rot:b+90, w:.95, t:.6, h:1.9+J(.5), z0:0, taper:.78});
    }
    for(let i=0;i<19;i++){
      const a = -120 + i*240/18, b = AX + 180 + a, r = 4.9 + 1.0*Math.cos(a*D2R);
      const [x,y] = pol(r,b);
      add({id:"bh"+i, g:"blava", nom:"Pedra blava de la ferradura", ph:[4,9], x, y, rot:b+90, w:.75, t:.55, h:1.9 + .5*Math.cos(a*D2R) + J(.3), z0:0, taper:.82});
    }
    return S;
  }

  /* Elements de terra (polilínies a z = 0) */
  function buildGround(){
    const G = [];
    const circ = (r, from, to, n) => { const p=[]; for(let i=0;i<=n;i++){ const b=from+(to-from)*i/n; p.push([...pol(r,b),0]); } return p; };
    const gapNE = [AX-9, AX+9];
    // fossat (dues línies) i talús, oberts a l'entrada NE i a l'entrada petita del sud
    [[56.5,"ditch"],[53.2,"ditch"],[50.4,"bank"],[47.8,"bank"]].forEach(([r,k]) => {
      G.push({k, ph:[1,9], pts:circ(r, gapNE[1], 157, 70)});
      G.push({k, ph:[1,9], pts:circ(r, 163, 360+gapNE[0], 90)});
    });
    // forats Aubrey (56)
    for(let i=0;i<56;i++){ const b = AX+3.2+i*360/56, [x,y]=pol(44,b); G.push({k:"hole", ph:[1,9], c:[x,y,0], r:.55}); }
    // forats Y (30) i Z (29), fase 5
    for(let i=0;i<30;i++){ const b=AX+6+i*12, [x,y]=pol(27,b); G.push({k:"yz", ph:[5,9], c:[x,y,0], r:.9}); }
    for(let i=0;i<29;i++){ const b=AX+12+i*12, [x,y]=pol(19.6,b); G.push({k:"yz", ph:[5,9], c:[x,y,0], r:.8}); }
    // Avinguda: dos talussos paral·lels cap al NE (fase 3); el primer tram recte d'uns 530 m
    const ua = AX*D2R, ex = Math.sin(ua), ey = Math.cos(ua), nx = Math.cos(ua), ny = -Math.sin(ua);
    [-1,1].forEach(s => [6,15].forEach(o => {
      const p=[]; for(let d=54; d<=560; d+=13) p.push([d*ex + s*o*nx, d*ey + s*o*ny, 0]);
      G.push({k:"avenue", ph:[3,9], pts:p});
    }));
    return G;
  }

  /* ---------- 2. Geometria de cada bloc ---------- */
  function verts(s, a){ // a: factor d'aparició 0..1 (les pedres surten de terra, les llindes baixen)
    const ca = Math.sin(s.rot*D2R), sa = Math.cos(s.rot*D2R);   // direcció de l'amplada (azimut rot)
    const na = Math.cos(s.rot*D2R), nb = -Math.sin(s.rot*D2R);  // normal
    const hw = s.w/2, ht = s.t/2, tp = s.taper||1, r = s.rnd;
    const h = s.lintel ? s.h : s.h*a, z0 = s.lintel ? s.z0 + (1-a)*6 : s.z0;
    const lean = s.lean||[0,0];
    const P = [];
    const corner = (u,v,z,k,top) => {
      const sx = top ? tp : 1;
      const uu = u*sx + (top ? r[k%4]*.6 : 0), vv = v*(top ? (tp+1)/2 : 1);
      return [s.x + uu*ca + vv*na + (top?lean[0]:0), s.y + uu*sa + vv*nb + (top?lean[1]:0), z];
    };
    const B = [[-hw,-ht],[hw,-ht],[hw,ht],[-hw,ht]];
    B.forEach((q,k) => P.push(corner(q[0],q[1],z0,k,false)));
    B.forEach((q,k) => P.push(corner(q[0],q[1],z0+h+(s.lintel?0:r[4+k]*a),k,true)));
    return P;
  }
  // cares: bottom 0-1-2-3, top 4-5-6-7, laterals
  const FACES = [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];

  /* ---------- 3. Càmera i projecció ---------- */
  function camera(o, w, h){
    const eye = o.eye, tg = o.target;
    let f = [tg[0]-eye[0], tg[1]-eye[1], tg[2]-eye[2]]; const fl = Math.hypot(...f); f = f.map(v=>v/fl);
    let r = [f[1], -f[0], 0]; const rl = Math.hypot(...r)||1; r = r.map(v=>v/rl);
    const u = [r[1]*f[2]-r[2]*f[1], r[2]*f[0]-r[0]*f[2], r[0]*f[1]-r[1]*f[0]];
    const foc = (h/2)/Math.tan((o.fov||40)*D2R/2);
    const cx = w/2, cy = h*(o.cy==null?.5:o.cy);
    const near = o.near||.6;
    return {
      eye, f, r, u, foc,
      p(P){ const d0=P[0]-eye[0], d1=P[1]-eye[1], d2=P[2]-eye[2];
        const zc = d0*f[0]+d1*f[1]+d2*f[2]; if(zc<near) return null;
        return [cx + foc*(d0*r[0]+d1*r[1]+d2*r[2])/zc, cy - foc*(d0*u[0]+d1*u[1]+d2*u[2])/zc, zc]; },
      dist(P){ return Math.hypot(P[0]-eye[0], P[1]-eye[1], P[2]-eye[2]); }
    };
  }
  // òrbita: azimut des d'on mirem (graus), elevació (graus), distància (m)
  function orbit(az, el, dist, tz, tgt){
    const t = tgt||[0,0,tz==null?2:tz];
    const ce = Math.cos(el*D2R);
    return {eye:[t[0]+dist*ce*Math.sin(az*D2R), t[1]+dist*ce*Math.cos(az*D2R), t[2]+dist*Math.sin(el*D2R)], target:t};
  }

  /* ---------- 4. Dibuix ---------- */
  const LIGHT = (()=>{ const v=[-.55,.62,.56]; const l=Math.hypot(...v); return v.map(x=>x/l); })(); // llum del NO
  function render(ctx, w, h, cam, model, ground, st){
    st = st||{};
    const phase = st.phase==null?9:st.phase;
    const appear = st.appear||(()=>1);
    const hl = st.highlight||null;
    ctx.clearRect(0,0,w,h);
    ctx.lineJoin = "round"; ctx.lineCap = "round";

    // horitzó i cel (Sol/Lluna) al fons
    if(st.horizon){
      ctx.beginPath(); let on=false;
      for(let b=0;b<=360;b+=2){ const q = cam.p([cam.eye[0]+4000*Math.sin(b*D2R), cam.eye[1]+4000*Math.cos(b*D2R), 0]);
        if(q){ on?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); on=true; } else on=false; }
      ctx.strokeStyle = IBV.alpha(C.ink,.35); ctx.lineWidth = .7; ctx.stroke();
    }
    if(st.sky) st.sky.forEach(o => {
      const D = 3000, al = o.alt*D2R;
      const q = cam.p([cam.eye[0]+D*Math.cos(al)*Math.sin(o.az*D2R), cam.eye[1]+D*Math.cos(al)*Math.cos(o.az*D2R), D*Math.sin(al)]);
      if(!q) return;
      const R = o.r||Math.max(9, cam.foc*Math.tan(.27*D2R)*6);
      const g = ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],R*3.2);
      g.addColorStop(0, IBV.alpha(o.c,.42)); g.addColorStop(1, IBV.alpha(o.c,0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q[0],q[1],R*3.2,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(q[0],q[1],R,0,7); ctx.fillStyle = o.c; ctx.globalAlpha = .9; ctx.fill(); ctx.globalAlpha = 1;
      o.screen = q;
    });

    // passadís de llum sobre el terra (banda groga translúcida al llarg d'un azimut, passant pel centre)
    if(st.beam){
      const b = st.beam.az*D2R, ex = Math.sin(b), ey = Math.cos(b), nx = Math.cos(b), ny = -Math.sin(b), wd = st.beam.w||2.4;
      const P = []; for(let d=-24; d<=400; d+=8) P.push(d);
      ctx.fillStyle = IBV.alpha(C.groc, st.beam.a||.32);
      for(let i=0;i<P.length-1;i++){
        const q = [[P[i],-wd],[P[i+1],-wd],[P[i+1],wd],[P[i],wd]].map(([d,o]) => cam.p([d*ex+o*nx, d*ey+o*ny, .02]));
        if(q.some(v=>!v)) continue;
        ctx.beginPath(); q.forEach((v,k)=>k?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath(); ctx.fill();
      }
    }

    // terra: fossat, talús, forats, Avinguda
    ground.forEach(gd => {
      if(!st.all && (phase < gd.ph[0] || phase > gd.ph[1])) return;
      const ga = st.groundAppear ? st.groundAppear(gd) : 1; if(ga<=0) return;
      ctx.globalAlpha = ga;
      if(gd.pts){
        ctx.beginPath(); let on=false;
        gd.pts.forEach(P => { const q = cam.p(P); if(q){ on?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); on=true; } else on=false; });
        ctx.strokeStyle = gd.k==="avenue" ? IBV.alpha(C.ink,.45) : gd.k==="bank" ? IBV.alpha(C.ink,.3) : IBV.alpha(C.ink,.55);
        ctx.lineWidth = gd.k==="ditch" ? .8 : .6;
        ctx.setLineDash(gd.k==="bank" ? [2,3] : []);
        ctx.stroke(); ctx.setLineDash([]);
      } else {
        // petita el·lipse projectada
        const n=10, pts=[];
        for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; const q = cam.p([gd.c[0]+gd.r*Math.cos(a), gd.c[1]+gd.r*Math.sin(a), 0]); if(!q) return; pts.push(q); }
        ctx.beginPath(); pts.forEach((q,k)=>k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath();
        ctx.strokeStyle = IBV.alpha(C.ink, gd.k==="yz"?.42:.55); ctx.lineWidth = .6; ctx.stroke();
        if(st.holeFill && gd.k==="hole"){ ctx.fillStyle = st.holeFill; ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    });
    if(st.groundExtra) st.groundExtra(ctx, cam);

    // blocs ordenats de lluny a prop
    const items = [];
    for(const s of model){
      if(!st.all && (phase < s.ph[0] || phase > s.ph[1])) continue;
      const a = appear(s); if(a<=0.001) continue;
      const V = verts(s, a);
      const cz = [s.x, s.y, s.z0 + s.h/2];
      items.push({s, V, a, d:cam.dist(cz) - (s.lintel ? .9 : 0)});
    }
    items.sort((p,q) => q.d - p.d);
    const hits = [];
    for(const it of items){
      const P = it.V.map(v => cam.p(v));
      if(P.some(v=>!v)) continue;
      const on = hl && hl(it.s);
      const dim = hl && !on && st.dimOthers;
      ctx.globalAlpha = (it.s.lintel ? Math.min(1, it.a*1.4) : 1) * (dim ? .5 : 1);
      for(const F of FACES){
        // normal de la cara al món
        const A = it.V[F[0]], B = it.V[F[1]], Cc = it.V[F[2]];
        const u1 = [B[0]-A[0],B[1]-A[1],B[2]-A[2]], u2 = [Cc[0]-A[0],Cc[1]-A[1],Cc[2]-A[2]];
        let n = [u1[1]*u2[2]-u1[2]*u2[1], u1[2]*u2[0]-u1[0]*u2[2], u1[0]*u2[1]-u1[1]*u2[0]];
        const nl = Math.hypot(...n)||1; n = n.map(v=>-v/nl); // el marc (amplada, normal) és levogir: girem la normal cap enfora
        const toEye = [cam.eye[0]-A[0], cam.eye[1]-A[1], cam.eye[2]-A[2]];
        if(n[0]*toEye[0]+n[1]*toEye[1]+n[2]*toEye[2] <= 0) continue; // cara d'esquena
        const q = F.map(k => P[k]);
        ctx.beginPath(); q.forEach((v,k)=>k?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
        ctx.fillStyle = on ? TINT : PAPER; ctx.fill();
        // ratllat d'ombra a les cares que no miren la llum
        const lit = n[0]*LIGHT[0]+n[1]*LIGHT[1]+n[2]*LIGHT[2];
        const isTop = F[0]===4;
        if(!isTop && lit < .35){
          const dark = Math.min(1, (.35-lit)/1.1);
          const wpx = Math.hypot(q[1][0]-q[0][0], q[1][1]-q[0][1]);
          const nL = Math.min(22, Math.round(wpx/ (4.2 - dark*1.6)) );
          if(nL>1){
            ctx.beginPath();
            for(let i=1;i<nL;i++){ const tt=i/nL;
              ctx.moveTo(q[0][0]+(q[1][0]-q[0][0])*tt, q[0][1]+(q[1][1]-q[0][1])*tt);
              ctx.lineTo(q[3][0]+(q[2][0]-q[3][0])*tt, q[3][1]+(q[2][1]-q[3][1])*tt); }
            ctx.strokeStyle = IBV.alpha(on ? C.vermell : C.ink, .08 + dark*.24); ctx.lineWidth = .5; ctx.stroke();
          }
        }
        ctx.beginPath(); q.forEach((v,k)=>k?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
        ctx.strokeStyle = on ? C.vermell : IBV.alpha(C.ink,.86); ctx.lineWidth = on ? 1.3 : .7; ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // punt de contacte per al hover: centre de la cara de dalt
      const tq = [4,5,6,7].map(k=>P[k]);
      hits.push({s:it.s, x:(tq[0][0]+tq[2][0])/2, y:(tq[0][1]+tq[2][1])/2 + (P[0][1]-tq[0][1])*.35, d:it.d});
    }
    if(st.person) drawPerson(ctx, cam, st.person);
    return hits;
  }

  // persona d'1,7 m en línia (escala)
  function drawPerson(ctx, cam, at){
    const [x,y] = at, P = z => cam.p([x,y,z]);
    const f = P(0), hip = P(.95), neck = P(1.45), head = P(1.62);
    if(!f||!hip||!neck||!head) return;
    const s = Math.abs(f[1]-head[1])/1.62;
    ctx.strokeStyle = C.ink; ctx.lineWidth = .9; ctx.beginPath();
    ctx.moveTo(hip[0]-.18*s, f[1]); ctx.lineTo(hip[0], hip[1]); ctx.lineTo(hip[0]+.18*s, f[1]);
    ctx.moveTo(hip[0], hip[1]); ctx.lineTo(neck[0], neck[1]);
    ctx.moveTo(neck[0]-.3*s, neck[1]+.55*s); ctx.lineTo(neck[0], neck[1]+.05*s); ctx.lineTo(neck[0]+.3*s, neck[1]+.55*s);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(head[0], head[1]+.02*s, Math.max(1.2,.11*s), 0, 7); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  }

  /* ---------- 5. Arrossegar per girar (horitzontal; la pàgina continua fent scroll en vertical) ---------- */
  function dragOrbit(el, onDrag, onEnd){
    let x0=null, id=null, moved=false;
    el.style.touchAction = "pan-y"; el.style.cursor = "grab";
    el.addEventListener("pointerdown", e => { x0=e.clientX; id=e.pointerId; moved=false; el.style.cursor="grabbing"; });
    el.addEventListener("pointermove", e => { if(x0==null||e.pointerId!==id) return; const dx=e.clientX-x0; if(Math.abs(dx)>2){ moved=true; onDrag(dx); x0=e.clientX; } });
    const end = () => { if(x0!=null){ x0=null; el.style.cursor="grab"; onEnd&&onEnd(moved); } };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end); el.addEventListener("pointerleave", end);
  }

  const GROUPS = {
    sarsen:"Sarsen del cercle · uns 25 t, de West Woods (25 km)",
    llinda:"Llinda del cercle · encaixada amb caixa i metxa i encadellat",
    trilit:"Trílit de sarsen",
    altar:"Pedra de l'Altar · 6 t, del nord d'Escòcia (≥ 750 km)",
    talo:"Pedra exterior de l'entrada",
    station:"Station Stone · rectangle solar i lunar",
    blava:"Pedra blava · 2–4 t, dels turons Preseli (Gal·les, ~230 km)",
    blava1:"Pedra blava en un forat Aubrey (fase 1, hipòtesi)"
  };

  window.SH3D = {TINT, AX, pol, buildModel, buildGround, camera, orbit, render, dragOrbit, drawPerson, GROUPS, PAPER, D2R, R2D};
})();
