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
      add({id:"l"+(i+1), g:"llinda", nom:"Llinda del cercle", ph:[2,9], x, y, rot:bm+90, w:chord+.9, t:1.0, h:.8, z0:4.1, lintel:true, arc:[b0+.35, b1-.35, RS]});
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
    // traces d'arqueòleg (hachures) radials sobre el talús i el pendent del fossat
    [["bank",47.8,50.4],["ditch",53.2,56.5]].forEach(([k,r0,r1]) => {
      const hach = [];
      for(let b=0;b<360;b+=1.6){ if((b > gapNE[0] && b < gapNE[1]) || (b > 157 && b < 163)) continue;
        const L = (Math.round(b/1.6)%2) ? .55 : 1, [x0,y0] = pol(r0,b), [x1,y1] = pol(r0+(r1-r0)*L,b);
        hach.push([[x0,y0,0],[x1,y1,0]]); }
      G.push({k, ph:[1,9], hach});
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

  /* ---------- 2. Geometria: cada pedra és una pila d'anells (secció amb cantells arrodonits) ---------- */
  // Secció octogonal: rectangle de hw × ht amb els cantells tallats, com un bloc de sarsen picat.
  function section(hw, ht, k, rr){
    const c = Math.min(hw, ht)*k, P = [[-hw+c,-ht],[hw-c,-ht],[hw,-ht+c],[hw,ht-c],[hw-c,ht],[-hw+c,ht],[-hw,ht-c],[-hw,-ht+c]];
    return P.map((q,i) => [q[0] + rr[i%rr.length]*hw*.25, q[1] + rr[(i+3)%rr.length]*ht*.3]);
  }
  // Retorna {rings:[[punt 3D]], caps:[índexs d'anell amb tapa]}; a = aparició (0..1)
  function solid(s, a){
    if(s.__c && s.__c.a === a) return s.__c.v;
    const rr = s.rnd, R = [];
    if(s.arc){                                   // llinda corba del cercle: la secció (radial × alçada) es passeja per l'arc
      const z0 = s.z0 + (1-a)*6, sec = section(s.t/2, s.h/2, .3, rr);
      for(let k=0;k<=4;k++){ const b = s.arc[0] + (s.arc[1]-s.arc[0])*k/4;
        R.push(sec.map(([dr,dz]) => { const [x,y] = pol(s.arc[2]+dr, b); return [x, y, z0 + s.h/2 + dz + (k%4?rr[k]*.04:0)]; })); }
      return (s.__c = {a, v:{rings:R, caps:[0, R.length-1]}}).v;
    }
    const ca = Math.sin(s.rot*D2R), sa = Math.cos(s.rot*D2R), na = Math.cos(s.rot*D2R), nb = -Math.sin(s.rot*D2R);
    if(s.lintel){                                // llinda recta d'un trílit: secció vertical (gruix × alçada) al llarg de l'amplada
      const z0 = s.z0 + (1-a)*6, sec = section(s.t/2, s.h/2, .3, rr);
      [-1,0,1].forEach(k => { const u = k*s.w/2;
        R.push(sec.map(([v,dz]) => [s.x + u*ca + v*na, s.y + u*sa + v*nb, z0 + s.h/2 + dz + (k?0:.05)])); });
      return (s.__c = {a, v:{rings:R, caps:[0, R.length-1]}}).v;
    }
    const sec = section(s.w/2, s.t/2, .34, rr), tp = s.taper||1, lean = s.lean||[0,0], H = s.h*a;
    const F = [0, .5, .9, 1], SC = [1, 1-(1-tp)*.45, tp, tp*.88];
    F.forEach((f,i) => {
      const z = s.z0 + H*f, sc = SC[i], cut = i===3;
      R.push(sec.map(([u,v],j) => {
        const uu = u*sc*(cut ? 1 : 1+rr[(j+i)%8]*.05), vv = v*(cut ? sc*.9 : (1+sc)/2);
        const zz = z + (cut ? rr[j%8]*.16*a : i===2 ? rr[(j+2)%8]*.08*a : 0);
        return [s.x + uu*ca + vv*na + lean[0]*f, s.y + uu*sa + vv*nb + lean[1]*f, zz];
      }));
    });
    return (s.__c = {a, v:{rings:R, caps:[R.length-1]}}).v;
  }
  // cares: quads entre anells consecutius + tapes; normal de Newell orientada cap enfora
  function faces(sd){
    const R = sd.rings, out = [], cen = [0,0,0]; let n = 0;
    R.forEach(r => r.forEach(p => { cen[0]+=p[0]; cen[1]+=p[1]; cen[2]+=p[2]; n++; }));
    cen[0]/=n; cen[1]/=n; cen[2]/=n;
    const push = (pts, side) => {
      let nx=0, ny=0, nz=0, mx=0, my=0, mz=0;
      for(let i=0;i<pts.length;i++){ const p=pts[i], q=pts[(i+1)%pts.length];
        nx += (p[1]-q[1])*(p[2]+q[2]); ny += (p[2]-q[2])*(p[0]+q[0]); nz += (p[0]-q[0])*(p[1]+q[1]); mx+=p[0]; my+=p[1]; mz+=p[2]; }
      mx/=pts.length; my/=pts.length; mz/=pts.length;
      const l = Math.hypot(nx,ny,nz)||1; nx/=l; ny/=l; nz/=l;
      if(nx*(mx-cen[0]) + ny*(my-cen[1]) + nz*(mz-cen[2]) < 0){ nx=-nx; ny=-ny; nz=-nz; }
      out.push({pts, n:[nx,ny,nz], c:[mx,my,mz], side});
    };
    for(let i=0;i<R.length-1;i++) for(let j=0;j<R[i].length;j++){ const j1 = (j+1)%R[i].length;
      push([R[i][j], R[i][j1], R[i+1][j1], R[i+1][j]], true); }
    sd.caps.forEach(k => push(R[k], false));
    return out;
  }

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
      dist(P){ return Math.hypot(P[0]-eye[0], P[1]-eye[1], P[2]-eye[2]); },
      // retalla un polígon 3D contra el pla proper (Sutherland–Hodgman) i el projecta
      clip(pts){ const NZ = 1.2, cz = P => (P[0]-eye[0])*f[0]+(P[1]-eye[1])*f[1]+(P[2]-eye[2])*f[2], out = [];
        for(let i=0;i<pts.length;i++){ const A = pts[i], B = pts[(i+1)%pts.length], za = cz(A), zb = cz(B);
          if(za >= NZ) out.push(A);
          if((za >= NZ) !== (zb >= NZ)){ const t = (NZ-za)/(zb-za); out.push([A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t, A[2]+(B[2]-A[2])*t]); } }
        return out.map(P => this.p(P)).filter(Boolean); }
    };
  }
  // òrbita: azimut des d'on mirem (graus), elevació (graus), distància (m)
  function orbit(az, el, dist, tz, tgt){
    const t = tgt||[0,0,tz==null?2:tz];
    const ce = Math.cos(el*D2R);
    return {eye:[t[0]+dist*ce*Math.sin(az*D2R), t[1]+dist*ce*Math.cos(az*D2R), t[2]+dist*Math.sin(el*D2R)], target:t};
  }

  /* ---------- 4. Figures humanes (silueta plena, de perfil) ---------- */
  // Escriu la silueta com a formes tancades sobre qualsevol «context de camí» (canvas o d3.path), per omplir-la d'un sol cop.
  // x, y: peus; h: alçada en px; pose: "dret" | "camina" | "estira" | "palanca" | "mira"; ph: fase del pas; dir: 1 cap a la dreta, -1 cap a l'esquerra
  function silhouette(p, x, y, h, pose, ph, dir){
    dir = dir||1; ph = ph||0;
    const cap = (a, b, w) => {             // càpsula: segment gruixut amb puntes rodones
      const dx = b[0]-a[0], dy = b[1]-a[1], L = Math.hypot(dx,dy)||1e-6, nx = -dy/L*w/2, ny = dx/L*w/2, ang = Math.atan2(dy,dx);
      p.moveTo(a[0]+nx, a[1]+ny); p.lineTo(b[0]+nx, b[1]+ny);
      p.arc(b[0], b[1], w/2, ang+Math.PI/2, ang-Math.PI/2, true);
      p.lineTo(a[0]-nx, a[1]-ny);
      p.arc(a[0], a[1], w/2, ang-Math.PI/2, ang+Math.PI/2, true);
      p.closePath();
    };
    const P = (fx, fy) => [x + dir*fx*h, y - fy*h];
    const at = (o, ang, len) => [o[0] + dir*Math.sin(ang)*len*h, o[1] - Math.cos(ang)*len*h]; // ang des de la vertical, cap endavant +
    const lean = pose==="estira" ? .42 : pose==="palanca" ? .75 : pose==="camina" ? .06 : pose==="mira" ? -.04 : 0;
    const hip = P(0, .5), neck = at(hip, lean, .33), head = at(hip, lean, .45);
    // cames
    let lA, lB;
    if(pose==="camina"){ const sw = Math.sin(ph)*.42; lA = [sw, -sw*.6+.1]; lB = [-sw, sw*.6+.1]; }
    else if(pose==="estira"){ const sw = Math.sin(ph)*.12; lA = [.42+sw, .25]; lB = [-.28+sw, .05]; }
    else if(pose==="palanca"){ lA = [.25, .1]; lB = [-.2, .05]; }
    else { lA = [.05, .02]; lB = [-.05, .02]; }
    const leg = (th, kn) => { const knee = at(hip, Math.PI - th, .26), foot = at(knee, Math.PI - th + kn, .25);
      cap(hip, knee, .085*h); cap(knee, foot, .07*h); cap(foot, [foot[0] + dir*.07*h, foot[1]], .045*h); };
    leg(lB[0], lB[1]); leg(lA[0], lA[1]);
    // tors (més ample a les espatlles) i cap
    cap(hip, at(hip, lean, .16), .13*h); cap(at(hip, lean, .14), neck, .15*h);
    p.moveTo(head[0] + .065*h, head[1]); p.arc(head[0], head[1], .065*h, 0, Math.PI*2); p.closePath();
    // braços
    const sh = at(hip, lean, .3);
    let a1, a2;
    if(pose==="camina"){ const sw = Math.sin(ph)*.5; a1 = [Math.PI - sw, .25]; a2 = [Math.PI + sw, .25]; }
    else if(pose==="estira"){ a1 = [Math.PI*.82 + lean, -.9]; a2 = [Math.PI*.9 + lean, -1.0]; }
    else if(pose==="palanca"){ a1 = [Math.PI*.62 + lean*.3, .2]; a2 = [Math.PI*.7 + lean*.3, .15]; }
    else if(pose==="mira"){ a1 = [Math.PI*.95, .1]; a2 = [Math.PI*1.08, -.3]; }
    else { a1 = [Math.PI*.97, .08]; a2 = [Math.PI*1.03, .08]; }
    [a2, a1].forEach(([th, el]) => { const elb = at(sh, th, .17), hand = at(elb, th + el, .16); cap(sh, elb, .055*h); cap(elb, hand, .048*h); });
    return {hand: at(at(sh, a1[0], .17), a1[0]+a1[1], .16), shoulder: sh};
  }
  function drawSil(ctx, x, y, h, pose, ph, dir, col){
    ctx.beginPath(); const r = silhouette(ctx, x, y, h, pose, ph, dir);
    ctx.fillStyle = col || C.ink; ctx.fill(); return r;
  }

  const VEG = {c:null};
  // mates d'herba repartides pel prat (deterministes), [x, y, alçada en m]
  const TUFTS = (() => { const r = IBV.rng(77), out = [];
    for(let i=0;i<900;i++){ const rr = Math.sqrt(r())*88, b = r()*360, [x,y] = pol(rr, b);
      if(rr > 46 && rr < 58 && !(b > AX-9 && b < AX+9)) continue;     // ni al talús ni al fossat (creta remoguda)
      out.push([x, y, .22 + r()*.25]); }
    return out; })();

  /* ---------- 5. Dibuix ---------- */
  const LIGHT = (()=>{ const v=[-.45,.5,.95]; const l=Math.hypot(...v); return v.map(x=>x/l); })(); // llum del NO, uns 55° d'alçada
  const TONES = d3.range(17).map(i => d3.interpolateLab(PAPER, C.ink)(i/16*.27));        // aiguada de grisos càlids
  const TONES_ON = d3.range(17).map(i => d3.interpolateLab(TINT, C.vermell)(i/16*.25));
  const poly = (ctx, q) => { ctx.moveTo(q[0][0], q[0][1]); for(let i=1;i<q.length;i++) ctx.lineTo(q[i][0], q[i][1]); ctx.closePath(); };
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

    // prat de la plana de Salisbury (verd vegetal), en una capa a part que s'esvaeix cap a les vores com una maqueta
    if(st.grass !== false){
      const cv = ctx.canvas; if(!VEG.c) VEG.c = document.createElement("canvas");
      if(VEG.c.width !== cv.width || VEG.c.height !== cv.height){ VEG.c.width = cv.width; VEG.c.height = cv.height; }
      const g = VEG.c.getContext("2d"); g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,cv.width,cv.height); g.setTransform(ctx.getTransform());
      g.lineJoin = "round"; g.lineCap = "round";
      const lawn = []; for(let i=0;i<120;i++){ const b = i/120*360; lawn.push([...pol(47, b), 0]); }
      const q = cam.clip(lawn);
      if(q.length > 2){ g.beginPath(); poly(g, q); g.fillStyle = d3.interpolateLab(C.vegetacioClar, C.vegetacio)(.22); g.fill();
        g.strokeStyle = IBV.alpha(C.vegetacioFosc, .55); g.lineWidth = .7; g.stroke(); }
      g.beginPath();
      for(const t of TUFTS){
        const a = cam.p([t[0], t[1], 0]); if(!a || a[2] < 4) continue;
        const b = cam.p([t[0], t[1], t[2]]); if(!b) continue;
        const hh = a[1] - b[1]; if(hh < 1.2) continue;
        const sx = hh*.45;
        g.moveTo(a[0]-sx, a[1]); g.lineTo(a[0]-sx*1.5, a[1]-hh*.8);
        g.moveTo(a[0], a[1]); g.lineTo(a[0]+sx*.2, a[1]-hh);
        g.moveTo(a[0]+sx, a[1]); g.lineTo(a[0]+sx*1.6, a[1]-hh*.75);
      }
      g.strokeStyle = IBV.alpha(C.vegetacioFosc, .6); g.lineWidth = .65; g.stroke();
      // vora esvaïda: màscara radial centrada al monument
      const o = cam.p([0,0,0]) || [w/2, h/2], R = Math.max(w, h)*.55;
      const gr = g.createRadialGradient(o[0], o[1], R*.3, o[0], o[1], R);
      gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.globalCompositeOperation = "destination-in"; g.fillStyle = gr; g.fillRect(-10, -10, w+20, h+20);
      // i cap a les vores del quadre: sense cap tall recte
      g.globalCompositeOperation = "destination-out";
      const edge = (x0,y0,x1,y1,rx,ry,rw,rh) => { const lg = g.createLinearGradient(x0,y0,x1,y1); lg.addColorStop(0,"rgba(0,0,0,0)"); lg.addColorStop(1,"rgba(0,0,0,1)"); g.fillStyle = lg; g.fillRect(rx,ry,rw,rh); };
      const fb = Math.min(140, h*.3), fs = Math.min(120, w*.12);
      edge(0,h-fb,0,h, -5,h-fb,w+10,fb+5); edge(0,fb*.7,0,0, -5,-5,w+10,fb*.7+5); edge(fs,0,0,0, -5,-5,fs+5,h+10); edge(w-fs,0,w,0, w-fs,-5,fs+5,h+10);
      g.globalCompositeOperation = "source-over";
      ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(VEG.c, 0, 0); ctx.restore();
    }

    // passadís de llum sobre el terra
    if(st.beam){
      const b = st.beam.az*D2R, ex = Math.sin(b), ey = Math.cos(b), nx = Math.cos(b), ny = -Math.sin(b), wd = st.beam.w||2.4;
      const P = []; for(let d=-24; d<=400; d+=8) P.push(d);
      ctx.fillStyle = IBV.alpha(C.groc, st.beam.a||.32);
      for(let i=0;i<P.length-1;i++){
        const q = [[P[i],-wd],[P[i+1],-wd],[P[i+1],wd],[P[i],wd]].map(([d,o]) => cam.p([d*ex+o*nx, d*ey+o*ny, .02]));
        if(q.some(v=>!v)) continue;
        ctx.beginPath(); poly(ctx, q); ctx.fill();
      }
    }

    // terra: fossat i talús amb traces d'arqueòleg (hachures), forats i Avinguda
    ground.forEach(gd => {
      if(!st.all && (phase < gd.ph[0] || phase > gd.ph[1])) return;
      const ga = st.groundAppear ? st.groundAppear(gd) : 1; if(ga<=0) return;
      ctx.globalAlpha = ga;
      if(gd.hach){
        ctx.beginPath();
        gd.hach.forEach(([A,B]) => { const a = cam.p(A), b = cam.p(B); if(a && b){ ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); } });
        ctx.strokeStyle = IBV.alpha(C.ink, gd.k==="ditch" ? .32 : .2); ctx.lineWidth = .5; ctx.stroke();
      } else if(gd.pts){
        ctx.beginPath(); let on=false;
        gd.pts.forEach(P => { const q = cam.p(P); if(q){ on?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); on=true; } else on=false; });
        ctx.strokeStyle = gd.k==="avenue" ? IBV.alpha(C.ink,.4) : gd.k==="bank" ? IBV.alpha(C.ink,.28) : IBV.alpha(C.ink,.55);
        ctx.lineWidth = gd.k==="ditch" ? .8 : .6;
        ctx.stroke();
      } else {
        const n=12, pts=[];
        for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; const q = cam.p([gd.c[0]+gd.r*Math.cos(a), gd.c[1]+gd.r*Math.sin(a), 0]); if(!q) return; pts.push(q); }
        ctx.beginPath(); poly(ctx, pts);
        ctx.fillStyle = IBV.alpha(C.ink, gd.k==="yz" ? .06 : .1); ctx.fill();
        ctx.strokeStyle = IBV.alpha(C.ink, gd.k==="yz"?.4:.5); ctx.lineWidth = .55; ctx.stroke();
        if(st.holeFill && gd.k==="hole"){ ctx.fillStyle = st.holeFill; ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    });
    if(st.groundExtra) st.groundExtra(ctx, cam);

    // blocs visibles
    const items = [];
    for(const s of model){
      if(!st.all && (phase < s.ph[0] || phase > s.ph[1])) continue;
      const a = appear(s); if(a<=0.001) continue;
      const sd = solid(s, a);
      items.push({s, sd, a, d:cam.dist([s.arc ? pol(s.arc[2], (s.arc[0]+s.arc[1])/2)[0] : s.x, s.arc ? pol(s.arc[2], (s.arc[0]+s.arc[1])/2)[1] : s.y, s.z0 + s.h/2]) - (s.lintel ? 1.1 : 0)});
    }
    // ombres projectades (una sola taca per a totes: no s'enfosqueixen on se sobreposen)
    if(st.shadows !== false){
      ctx.beginPath();
      const kx = -LIGHT[0]/LIGHT[2], ky = -LIGHT[1]/LIGHT[2];
      for(const it of items){
        const pts = []; let bad = false;
        const add = q => { const g = cam.p(q); if(!g || g[2] < 3) bad = true; else pts.push(g); };
        for(const r of it.sd.rings) for(const q of r) add([q[0] + kx*q[2], q[1] + ky*q[2], .01]);
        if(!it.s.lintel) for(const q of it.sd.rings[0]) add([q[0], q[1], .01]);
        if(bad) continue;
        const hull = pts.length > 2 && d3.polygonHull(pts);
        if(hull){ const hh = d3.polygonArea(hull) < 0 ? hull : hull.slice().reverse(); poly(ctx, hh); }
      }
      ctx.fillStyle = IBV.alpha(C.ink, .045); ctx.fill("nonzero");
    }
    // persones: entren a l'ordenació de profunditat amb les pedres
    const people = (st.people||[]).concat(st.person ? [{x:st.person[0], y:st.person[1], pose:"dret", az:AX+200}] : []);
    people.forEach(pp => items.push({person:pp, d:cam.dist([pp.x, pp.y, .9]) - .3}));
    items.sort((p,q) => q.d - p.d);

    const hits = [];
    for(const it of items){
      if(it.person){ drawPerson3(ctx, cam, it.person, st.t||0); continue; }
      const s = it.s, R = it.sd.rings;
      const PR = R.map(r => r.map(q => cam.p(q)));
      if(PR.some(r => r.some(v => !v))) continue;
      const on = hl && hl(s), dim = hl && !on && st.dimOthers;
      ctx.globalAlpha = (s.lintel ? Math.min(1, it.a*1.4) : 1) * (dim ? .5 : 1);
      const F = faces(it.sd).filter(f => f.n[0]*(cam.eye[0]-f.c[0]) + f.n[1]*(cam.eye[1]-f.c[1]) + f.n[2]*(cam.eye[2]-f.c[2]) > 0);
      F.forEach(f => f.d = cam.dist(f.c)); F.sort((p,q) => q.d - p.d);
      const T = on ? TONES_ON : TONES;
      for(const f of F){
        const q = f.pts.map(v => cam.p(v)); if(q.some(v=>!v)) continue;
        const lit = f.n[0]*LIGHT[0] + f.n[1]*LIGHT[1] + f.n[2]*LIGHT[2];
        const tone = Math.max(0, Math.min(16, Math.round((.78 - lit)*11)));
        ctx.beginPath(); poly(ctx, q); ctx.fillStyle = T[tone]; ctx.fill();
        if(f.side){ ctx.beginPath(); ctx.moveTo(q[1][0],q[1][1]); ctx.lineTo(q[2][0],q[2][1]); ctx.strokeStyle = IBV.alpha(on ? C.vermell : C.ink, .12); ctx.lineWidth = .45; ctx.stroke(); }
        // ratllat fi només a les cares de més ombra i prou grans
        if(f.side && tone >= 9){
          const wpx = Math.hypot(q[1][0]-q[0][0], q[1][1]-q[0][1]), n = Math.min(10, Math.floor(wpx/4.5));
          if(n > 1){ ctx.beginPath();
            for(let i=1;i<n;i++){ const t = i/n; ctx.moveTo(q[0][0]+(q[1][0]-q[0][0])*t, q[0][1]+(q[1][1]-q[0][1])*t); ctx.lineTo(q[3][0]+(q[2][0]-q[3][0])*t, q[3][1]+(q[2][1]-q[3][1])*t); }
            ctx.strokeStyle = IBV.alpha(on ? C.vermell : C.ink, .13); ctx.lineWidth = .45; ctx.stroke(); }
        }
      }
      // esquerdes i vetes de la pedra (sarsens i trílits, deterministes)
      if(!s.lintel && s.h > 2.5 && R.length >= 3 && it.a > .9){
        for(let k=0;k<2;k++){
          const j = Math.floor((s.rnd[k] + .5)*8) % 8, j1 = (j+1)%8, u = .3 + (s.rnd[k+2]+.5)*.4;
          const fc = F.find(f => f.side && f.pts[0] === R[0][j]); if(!fc) continue;
          const top = 1 + Math.floor((s.rnd[k+4]+.5)*2);
          ctx.beginPath();
          for(let i=0;i<=top;i++){ const A = R[i][j], B = R[i][j1], wob = i ? s.rnd[(i+k)%8]*.3 : 0;
            const q = cam.p([A[0]+(B[0]-A[0])*(u+wob*.3), A[1]+(B[1]-A[1])*(u+wob*.3), A[2]+(B[2]-A[2])*u]); if(!q) break;
            i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
          ctx.strokeStyle = IBV.alpha(C.ink, .38); ctx.lineWidth = .5; ctx.stroke();
        }
      }
      // contorn exterior més marcat (silueta)
      const all = []; PR.forEach(r => r.forEach(v => all.push(v)));
      const hull = d3.polygonHull(all);
      if(hull){ ctx.beginPath(); poly(ctx, hull); ctx.strokeStyle = on ? C.vermell : IBV.alpha(C.ink,.88); ctx.lineWidth = on ? 1.4 : .8; ctx.stroke(); }
      ctx.globalAlpha = 1;
      const top = PR[s.lintel ? Math.floor(PR.length/2) : PR.length-1];
      const tx = d3.mean(top, v=>v[0]), ty = d3.mean(top, v=>v[1]);
      hits.push({s, x:tx, y:ty + (s.lintel ? 0 : (d3.mean(PR[0], v=>v[1]) - ty)*.35), d:it.d});
    }
    return hits;
  }

  // persona en 3D: es projecten els peus i el cap i es dibuixa la silueta a aquella alçada
  function drawPerson3(ctx, cam, pp, t){
    const f = cam.p([pp.x, pp.y, 0]), hd = cam.p([pp.x, pp.y, pp.h||1.7]);
    if(!f || !hd) return;
    const h = Math.hypot(hd[0]-f[0], hd[1]-f[1]); if(h < 2) return;
    // cap a on mira, a la pantalla
    const ahead = cam.p([pp.x + Math.sin((pp.az||0)*D2R), pp.y + Math.cos((pp.az||0)*D2R), 0]);
    const dir = ahead && ahead[0] < f[0] ? -1 : 1;
    const ph = pp.pose === "camina" ? (t/420 + (pp.k||0)) : 0;
    drawSil(ctx, f[0], f[1], h, pp.pose||"dret", ph, dir, IBV.alpha(C.ink, pp.a||.9));
  }
  function drawPerson(ctx, cam, at){ drawPerson3(ctx, cam, {x:at[0], y:at[1], pose:"dret", az:AX+200}, 0); }

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

  window.SH3D = {TINT, AX, pol, buildModel, buildGround, camera, orbit, render, dragOrbit, drawPerson, silhouette, drawSil, GROUPS, PAPER, D2R, R2D};
})();
