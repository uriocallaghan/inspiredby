/* «Per què van aixecar Stonehenge?» · Maqueta de línia (peça nova, extensió 3D d'IB-16).
   Motor mínim de perspectiva en canvas 2D: blocs de pedra a escala real dibuixats com un gravat
   (cares en blanc de paper, arestes en tinta fina, ratllat a les cares d'ombra). Sense llibreries noves.
   Coordenades en metres: x = est, y = nord, z = amunt; origen al centre del cercle de sarsens.
   Reconstrucció esquemàtica: dimensions d'English Heritage; posicions de pedres blaves i forats aproximades. */
(function(){
  "use strict";
  const C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C); // per si el navegador té un ib-viz.js antic a la memòria cau
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
    const add = o => { o.rnd = [J(.16),J(.16),J(.16),J(.16),J(.1),J(.1),J(.1),J(.1)]; o.seed = 1 + S.length*7919; S.push(o); return o; };

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
  // Acabat de cada pedra segons English Heritage («Building Stonehenge», «Discover more about the Stones»):
  // sarsens i llindes desbastats a cops de percussor i allisats (més fi al costat NE i a les cares interiors dels trílits),
  // Pedra del Taló «bloc sense treballar», moltes pedres blaves naturals. Recent picats, els sarsens eren «molt més clars i blancs».
  const FINISH = {sarsen:"dressed", llinda:"dressed", trilit:"dressed", altar:"slab", station:"natural", blava:"blue", blava1:"blue"};
  const finishOf = s => s.id === "talo" ? "boulder" : s.id === "mat" ? "slab" : (FINISH[s.g] || "natural");
  const hash = (a, b, c) => { const x = Math.sin(a*127.1 + b*311.7 + c*74.7)*43758.5453; return (x - Math.floor(x))*2 - 1; };
  // secció: superel·lipse (p alt = rectangle de cantells arrodonits; p baix = còdol) amb ondulació de baixa freqüència
  function section(hw, ht, n, r, amp, p){
    const ph1 = r()*6.28, ph2 = r()*6.28, a1 = amp*(.6+r()*.8), a2 = amp*.5*(.5+r()), out = [];
    for(let i=0;i<n;i++){
      const t = (i+.5)/n*Math.PI*2, c = Math.cos(t), sn = Math.sin(t);
      const k = 1 + a1*Math.sin(2*t + ph1) + a2*Math.sin(3*t + ph2);
      out.push([Math.sign(c)*Math.pow(Math.abs(c), 2/p)*hw*k, Math.sign(sn)*Math.pow(Math.abs(sn), 2/p)*ht*k]);
    }
    return out;
  }
  // Retorna {rings:[[punt 3D]], caps:[...], fin, rough:[per columna]}; a = aparició (0..1)
  function solid(s, a){
    if(s.__c && s.__c.a === a) return s.__c.v;
    const r = IBV.rng(s.seed||1), R = [], fin = finishOf(s);
    const ca = Math.sin(s.rot*D2R), sa = Math.cos(s.rot*D2R), na = Math.cos(s.rot*D2R), nb = -Math.sin(s.rot*D2R);
    const radial = (() => { const L = Math.hypot(s.x, s.y)||1; return [s.x/L, s.y/L]; })();
    const bear = (Math.atan2(s.x, s.y)*R2D + 360) % 360, ne = Math.abs(((bear - AX) + 540) % 360 - 180) < 90;
    if(s.lintel){                                   // llindes: peces picades, corbes al cercle, cares interior i exterior treballades
      const n = 14, z0 = s.z0 + (1-a)*6, sec = section(s.t/2, s.h/2, n, r, .01, 4.6), NS = 7;
      for(let k=0;k<=NS;k++){
        const f = k/NS, end = k===0 || k===NS, sc = end ? .9 : 1;
        R.push(sec.map(([v,z],j) => {
          const e = (k%NS ? hash(s.seed, k, j)*.006 : 0);
          if(s.arc){ const b = s.arc[0] + (s.arc[1]-s.arc[0])*f, [x,y] = pol(s.arc[2] + v*sc + e, b); return [x, y, z0 + s.h/2 + z*sc]; }
          const u = (f-.5)*s.w; return [s.x + u*ca + (v*sc+e)*na, s.y + u*sa + (v*sc+e)*nb, z0 + s.h/2 + z*sc];
        }));
      }
      return (s.__c = {a, v:{rings:R, caps:[0, R.length-1], fin, rough:sec.map(() => 0)}}).v;
    }
    let n, p, amp, F, top, topZ, bulge, drift, lean = s.lean || [0,0];
    if(fin === "dressed"){ n = 16; p = 4.6; amp = .012; F = [0,.12,.3,.5,.7,.86,.95,.985,1]; top = .9; topZ = 0; bulge = 0; drift = 0; }
    else if(fin === "slab"){ n = 14; p = 4; amp = .03; F = [0,.55,.9,1]; top = .9; topZ = .03; bulge = .02; drift = .01; }
    else if(fin === "boulder"){ n = 16; p = 2.3; amp = .13; F = [0,.18,.4,.62,.8,.92,1]; top = .42; topZ = .3; bulge = .1; drift = .05; }
    else { n = 12; p = 2.9; amp = .07; F = [0,.3,.6,.82,.94,1]; top = .62; topZ = .06; bulge = .06; drift = .04;
      if(!s.lean) lean = [(r()-.5)*.3, (r()-.5)*.3]; }
    const sec = section(s.w/2, s.t/2, n, r, amp, p), tp = s.taper||1, H = s.h*a;
    // rugositat per columna: a les pedres picades, més fina a la cara interior i al costat NE
    const rough = sec.map(([u,v]) => {
      if(fin !== "dressed") return fin === "slab" ? .01 : .02;
      const dx = u*ca + v*na, dy = u*sa + v*nb, out = dx*radial[0] + dy*radial[1] > 0;
      return out ? (ne ? .012 : .04) : (s.g === "trilit" ? .004 : .012);
    });
    let dx = 0, dy = 0;
    F.forEach((f,i) => {
      const last = i === F.length-1;
      let sc = 1 - (1-tp)*f;
      if(fin === "dressed"){ if(i === F.length-2) sc *= .97; if(last) sc *= top; }
      else { sc *= 1 + (r()-.5)*bulge*2; if(last) sc *= top; else if(i === F.length-2) sc *= .88; dx += (r()-.5)*s.w*drift; dy += (r()-.5)*s.t*drift; }
      const zr = s.z0 + H*f;
      R.push(sec.map(([u,v],j) => {
        const e = (fin === "dressed" ? (i < F.length-2 ? hash(s.seed, i, j)*rough[j] : 0) : (last ? 0 : hash(s.seed, i, j)*amp*.25*Math.max(s.w, s.t)));
        const L = Math.hypot(u, v)||1, uu = (u + u/L*e)*sc + dx, vv = (v + v/L*e)*sc + dy;
        const zz = zr + (last ? (fin === "dressed" ? 0 : hash(s.seed, 99, j)*topZ*a) : 0);
        return [s.x + uu*ca + vv*na + lean[0]*f, s.y + uu*sa + vv*nb + lean[1]*f, zz];
      }));
    });
    return (s.__c = {a, v:{rings:R, caps:[R.length-1], fin, rough}}).v;
  }
  function faces(sd){
    if(sd.F) return sd.F;
    const R = sd.rings, out = [], cen = [0,0,0]; let n = 0;
    R.forEach(r => r.forEach(p => { cen[0]+=p[0]; cen[1]+=p[1]; cen[2]+=p[2]; n++; }));
    cen[0]/=n; cen[1]/=n; cen[2]/=n;
    const push = (pts, meta) => {
      let nx=0, ny=0, nz=0, mx=0, my=0, mz=0;
      for(let i=0;i<pts.length;i++){ const p=pts[i], q=pts[(i+1)%pts.length];
        nx += (p[1]-q[1])*(p[2]+q[2]); ny += (p[2]-q[2])*(p[0]+q[0]); nz += (p[0]-q[0])*(p[1]+q[1]); mx+=p[0]; my+=p[1]; mz+=p[2]; }
      mx/=pts.length; my/=pts.length; mz/=pts.length;
      const l = Math.hypot(nx,ny,nz)||1; nx/=l; ny/=l; nz/=l;
      // orienta cap enfora respecte a l'eix de la pedra (no al centre global, que pot quedar fora en peces corbes)
      const ref = meta.side ? meta.axis : cen;
      if(nx*(mx-ref[0]) + ny*(my-ref[1]) + nz*(mz-ref[2]) < 0){ nx=-nx; ny=-ny; nz=-nz; }
      out.push(Object.assign({pts, n:[nx,ny,nz], c:[mx,my,mz]}, meta));
    };
    const ringC = R.map(r => { const c=[0,0,0]; r.forEach(p=>{c[0]+=p[0];c[1]+=p[1];c[2]+=p[2];}); return c.map(v=>v/r.length); });
    const m = R[0].length;
    for(let i=0;i<R.length-1;i++) for(let j=0;j<m;j++){ const j1 = (j+1)%m;
      const ax = ringC[i].map((v,k) => (v + ringC[i+1][k])/2);
      push([R[i][j], R[i][j1], R[i+1][j1], R[i+1][j]], {side:true, i, j, axis:ax}); }
    sd.caps.forEach(k => push(R[k], {side:false, cap:k}));
    sd.m = m; sd.nr = R.length;
    return (sd.F = out);
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
  // Gent del Neolític de perfil: túnica fins al genoll, capa, cabell llarg o recollit, i a vegades un pic de banya de cérvol
  // (les eines amb què es va cavar el fossat). o = {pel:"llarg"|"monyo"|"curt", capa:bool, eina:"banya"|null, cos:0..1}
  function silhouette(p, x, y, h, pose, ph, dir, o){
    dir = dir||1; ph = ph||0; o = o||{};
    const flush = () => { if(p.__flush) p.__flush(); };   // cada peça s'omple sola: sense forats on se sobreposen
    const lean = pose==="estira" ? .5 : pose==="palanca" ? .8 : pose==="porta" ? .1 : pose==="camina" ? .07 : pose==="mira" ? -.03 : 0;
    const hipL = [0, .5], cl = Math.cos(lean), sl = Math.sin(lean);
    // punt del cos (x endavant, y amunt, en unitats d'alçada) girat al voltant del maluc segons la inclinació
    const B = (fx, fy) => { const dx = fx - hipL[0], dy = fy - hipL[1]; return [hipL[0] + dx*cl + dy*sl, hipL[1] - dx*sl + dy*cl]; };
    const S = q => [x + dir*q[0]*h, y - q[1]*h];
    const cap = (a, b, w0, w1) => {           // membre afuat amb puntes rodones
      const A = S(a), Bp = S(b), dx = Bp[0]-A[0], dy = Bp[1]-A[1], L = Math.hypot(dx,dy)||1e-6, nx = -dy/L, ny = dx/L, ang = Math.atan2(dy,dx);
      const r0 = w0*h/2, r1 = (w1==null?w0:w1)*h/2;
      p.moveTo(A[0]+nx*r0, A[1]+ny*r0); p.lineTo(Bp[0]+nx*r1, Bp[1]+ny*r1);
      p.arc(Bp[0], Bp[1], r1, ang+Math.PI/2, ang-Math.PI/2, true);
      p.lineTo(A[0]-nx*r0, A[1]-ny*r0); p.arc(A[0], A[1], r0, ang-Math.PI/2, ang+Math.PI/2, true); p.closePath(); flush();
    };
    const shape = pts => { const q = pts.map(S); p.moveTo(q[0][0], q[0][1]);
      for(let i=1;i<q.length;i++){ const a = q[i-1], b = q[i]; p.quadraticCurveTo(a[0], a[1], (a[0]+b[0])/2, (a[1]+b[1])/2); }
      p.lineTo(q[q.length-1][0], q[q.length-1][1]); p.closePath(); flush(); };
    const at = (o2, ang, len) => [o2[0] + Math.sin(ang)*len, o2[1] - Math.cos(ang)*len];   // angle des de la vertical cap avall, + endavant
    // cames (sota la túnica)
    let LA, LB;
    if(pose==="camina"){ const sw = Math.sin(ph)*.38; LA = [sw, Math.max(0, -sw)*.9 + .05]; LB = [-sw, Math.max(0, sw)*.9 + .05]; }
    else if(pose==="estira"){ const sw = Math.sin(ph)*.1; LA = [.45 + sw, .35]; LB = [-.35 + sw, .02]; }
    else if(pose==="palanca"){ LA = [.3, .15]; LB = [-.25, .02]; }
    else { LA = [.04, .02]; LB = [-.04, .02]; }
    const hipW = [0, .49];
    const leg = (th, kn) => { const knee = at(hipW, th, .25), foot = at(knee, th - kn, .245);
      cap(hipW, knee, .085, .065); cap(knee, foot, .062, .045); cap(foot, [foot[0] + .075, foot[1] + .005], .04, .03); };
    leg(LB[0], LB[1]); leg(LA[0], LA[1]);
    // túnica: espatlles, cintura i vora acampanada fins al genoll
    const kick = pose==="camina" ? Math.sin(ph)*.03 : 0;
    shape([B(.055,.815), B(.07,.7), B(.065,.58), B(.1+kick,.4), B(.04,.375), B(-.06,.37), B(-.11-kick,.39), B(-.075,.58), B(-.075,.72), B(-.05,.82)]);
    // capa sobre les espatlles
    if(o.capa) shape([B(-.02,.84), B(-.09,.8), B(-.13,.62), B(-.16-kick*1.5,.34), B(-.1,.33), B(-.07,.6), B(-.05,.76)]);
    // coll i cap
    cap(B(0,.78), B(.016,.9), .068, .058);
    cap(B(-.05,.8), B(.05,.8), .07, .07);      // espatlles: sense escletxes entre el coll i la túnica
    const hd = B(.018, .915);
    { const c = S(hd), rr = .066*h; p.moveTo(c[0]+rr, c[1]); p.arc(c[0], c[1], rr, 0, Math.PI*2); p.closePath(); flush();
      const nz = S(B(.08, .9)); p.moveTo(c[0] + dir*rr*.5, c[1]-rr*.35); p.lineTo(nz[0], nz[1]); p.lineTo(c[0] + dir*rr*.6, c[1]+rr*.35); p.closePath(); flush(); }
    // cabells
    if(o.pel === "llarg") shape([B(.02,.985), B(-.05,.975), B(-.085,.9), B(-.09,.78), B(-.05,.76), B(-.04,.86), B(0,.95)]);
    else if(o.pel === "monyo"){ const c = S(B(-.06, .95)); p.moveTo(c[0] + .035*h, c[1]); p.arc(c[0], c[1], .035*h, 0, Math.PI*2); p.closePath(); flush(); }
    // braços
    const sh = B(.005, .79);
    let A1, A2;
    if(pose==="camina"){ const sw = Math.sin(ph)*.45; A1 = [-sw, .2]; A2 = [sw, .2]; }
    else if(pose==="estira"){ A1 = [-.35, 2.3]; A2 = [-.2, 2.2]; }                    // braços plegats agafant la corda sobre l'espatlla
    else if(pose==="palanca"){ A1 = [.9 - lean*.2, .2]; A2 = [.75 - lean*.2, .25]; }
    else if(pose==="porta"){ A1 = [-.1, 2.5]; A2 = [.15, .1]; }                         // una mà aguanta l'eina sobre l'espatlla
    else if(pose==="mira"){ A1 = [.05, .1]; A2 = [-.12, .15]; }
    else { A1 = [.06, .08]; A2 = [-.05, .08]; }
    let hand1;
    [A2, A1].forEach(([th, el], k) => { const elb = at(sh, th + lean, .165), hand = at(elb, th + lean + el, .155);
      cap(sh, elb, .055, .045); cap(elb, hand, .044, .036); if(k===1) hand1 = hand; });
    // pic de banya de cérvol sobre l'espatlla
    if(o.eina === "banya" || pose === "porta"){
      const a0 = B(-.12, .88), a1 = B(.2, .97), b1 = B(.21, 1.04), b2 = B(.27, .99);
      cap(a0, a1, .022, .018); cap(a1, b1, .016, .01); cap(B(.12, .95), b2, .014, .009);
    }
    return {hand: S(hand1), shoulder: S(sh)};
  }
  function drawSil(ctx, x, y, h, pose, ph, dir, col, o){
    ctx.fillStyle = col || C.ink; ctx.beginPath();
    ctx.__flush = () => { ctx.fill(); ctx.beginPath(); };
    const r = silhouette(ctx, x, y, h, pose, ph, dir, o);
    ctx.__flush = null; return r;
  }
  // per a SVG: retorna una llista de camins (un per peça)
  function silPaths(x, y, h, pose, ph, dir, o){
    const out = []; let cur = d3.path();
    const w = {moveTo:(a,b)=>cur.moveTo(a,b), lineTo:(a,b)=>cur.lineTo(a,b), arc:(...a)=>cur.arc(...a), quadraticCurveTo:(...a)=>cur.quadraticCurveTo(...a), closePath:()=>cur.closePath(),
      __flush(){ out.push(cur.toString()); cur = d3.path(); }};
    const r = silhouette(w, x, y, h, pose, ph, dir, o); r.paths = out; return r;
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
  const TN = 40;
  const ramp = (from, to, k0, k1) => d3.range(TN+1).map(i => d3.interpolateLab(from, to)(k0 + i/TN*(k1-k0)));
  const PAL = {
    fresh: ramp(PAPER, C.ink, 0, .26),                                         // sarsen picat: «molt més clar i blanc» que avui
    stone: ramp(PAPER, C.ink, .05, .34),                                      // superfície natural (Taló, Station Stones, lloses)
    blue:  ramp(PAPER, d3.interpolateLab(C.ink, C.blau)(.4), .06, .38),       // pedres blaves: «tint blavós» quan són fresques
    on:    ramp(TINT, C.vermell, 0, .3)
  };
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
      const ALL = faces(it.sd), m = it.sd.m, nr = it.sd.nr, fin = it.sd.fin;
      const vis = f => f.n[0]*(cam.eye[0]-f.c[0]) + f.n[1]*(cam.eye[1]-f.c[1]) + f.n[2]*(cam.eye[2]-f.c[2]) > 0;
      const V = ALL.map(vis);
      const sideAt = (i,j) => i*m + ((j%m)+m)%m;
      const capIdx = k => { for(let q = (nr-1)*m; q < ALL.length; q++) if(ALL[q].cap === k) return q; return -1; };
      const pal = on ? PAL.on : fin === "blue" ? PAL.blue : fin === "dressed" ? PAL.fresh : PAL.stone;
      // to per vèrtex: normal mitjana de les cares veïnes (ombrejat suau, sense cantons)
      const shade = nrm => { const lit = nrm[0]*LIGHT[0] + nrm[1]*LIGHT[1] + nrm[2]*LIGHT[2]; return Math.max(0, Math.min(TN, Math.round((.86 - lit)*TN*.62))); };
      const colTone = j => { let x=0,y=0,z=0; for(let i=0;i<nr-1;i++){ const a1 = ALL[sideAt(i,j)].n, a2 = ALL[sideAt(i,j-1)].n; x+=a1[0]+a2[0]; y+=a1[1]+a2[1]; z+=a1[2]+a2[2]; } const l = Math.hypot(x,y,z)||1; return shade([x/l,y/l,z/l]); };
      const tones = []; for(let j=0;j<m;j++) tones.push(colTone(j));
      const bodyTop = s.lintel ? nr-1 : Math.max(1, nr-3);     // anells que es pinten com a franges verticals amb degradat
      // franges (columnes) visibles, de lluny a prop
      const cols = [];
      for(let j=0;j<m;j++){ const mid = Math.floor(bodyTop/2); if(!V[sideAt(mid,j)] && !V[sideAt(0,j)] && !V[sideAt(bodyTop-1,j)]) continue;
        const c = ALL[sideAt(mid,j)].c; cols.push({j, d:cam.dist(c)}); }
      cols.sort((p,q) => q.d - p.d);
      const strip = j => { const j1 = (j+1)%m, pts = []; for(let i=0;i<=bodyTop;i++) pts.push(PR[i][j]); for(let i=bodyTop;i>=0;i--) pts.push(PR[i][j1]); return pts; };
      for(const {j} of cols){
        const j1 = (j+1)%m, q = strip(j);
        const A = [(PR[0][j][0] + PR[bodyTop][j][0])/2, (PR[0][j][1] + PR[bodyTop][j][1])/2], B = [(PR[0][j1][0] + PR[bodyTop][j1][0])/2, (PR[0][j1][1] + PR[bodyTop][j1][1])/2];
        let fill;
        if(Math.hypot(B[0]-A[0], B[1]-A[1]) < .5) fill = pal[tones[j]];
        else { fill = ctx.createLinearGradient(A[0], A[1], B[0], B[1]); fill.addColorStop(0, pal[tones[j]]); fill.addColorStop(1, pal[tones[j1]]); }
        ctx.beginPath(); poly(ctx, q); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = fill; ctx.lineWidth = .9; ctx.stroke();
      }
      // corona: el cantell arrodonit i la tapa, cara per cara però amb el mateix tipus de to
      if(!s.lintel){
        const TF = [];
        for(let i=bodyTop;i<nr-1;i++) for(let j=0;j<m;j++){ const k = sideAt(i,j); if(V[k]) TF.push(k); }
        const cTop = capIdx(nr-1); if(cTop >= 0 && V[cTop]) TF.push(cTop);
        TF.sort((p,q) => cam.dist(ALL[q].c) - cam.dist(ALL[p].c));
        for(const k of TF){ const f = ALL[k], q = f.side ? [PR[f.i][f.j], PR[f.i][(f.j+1)%m], PR[f.i+1][(f.j+1)%m], PR[f.i+1][f.j]] : PR[f.cap];
          const c = pal[shade(f.n)]; ctx.beginPath(); poly(ctx, q); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = .9; ctx.stroke(); }
      } else {
        [0, nr-1].forEach(k => { const ci = capIdx(k); if(ci < 0 || !V[ci]) return; const c = pal[shade(ALL[ci].n)];
          ctx.beginPath(); poly(ctx, PR[k]); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = .9; ctx.stroke(); });
      }
      // marques del percussor: punts fins, més densos on la pedra és més rugosa
      if(!on && it.a > .9 && fin !== "blue"){
        const rr = IBV.rng((s.seed||1) + 13); ctx.beginPath();
        for(const {j} of cols){ const rough = it.sd.rough[j]; const q0 = PR[0][j], q1 = PR[0][(j+1)%m], q3 = PR[bodyTop][j];
          const w = Math.hypot(q1[0]-q0[0], q1[1]-q0[1]), h = Math.hypot(q3[0]-q0[0], q3[1]-q0[1]);
          const k = Math.min(14, Math.floor(w*h/(rough > .03 ? 40 : rough > .01 ? 110 : 260)));
          for(let t=0;t<k;t++){ const u = .1 + rr()*.8, v = .05 + rr()*.9, i = Math.min(bodyTop-1, Math.floor(v*bodyTop)), fv = v*bodyTop - i;
            const a0 = PR[i][j], a1 = PR[i][(j+1)%m], b0 = PR[i+1][j], b1 = PR[i+1][(j+1)%m];
            const x = (a0[0]*(1-u) + a1[0]*u)*(1-fv) + (b0[0]*(1-u) + b1[0]*u)*fv, y = (a0[1]*(1-u) + a1[1]*u)*(1-fv) + (b0[1]*(1-u) + b1[1]*u)*fv;
            const rad = .35 + rr()*.5; ctx.moveTo(x+rad, y); ctx.arc(x, y, rad, 0, 6.283); } }
        ctx.fillStyle = IBV.alpha(C.ink, .14); ctx.fill();
      }
      // contorn: arestes entre cares visibles i amagades (la silueta real)
      ctx.beginPath();
      for(let k=0;k<ALL.length;k++){
        const f = ALL[k]; if(!f.side || !V[k]) continue;
        const {i, j} = f, j1 = (j+1)%m, q = [PR[i][j], PR[i][j1], PR[i+1][j1], PR[i+1][j]];
        if(!V[sideAt(i, j-1)]){ ctx.moveTo(q[0][0],q[0][1]); ctx.lineTo(q[3][0],q[3][1]); }
        if(!V[sideAt(i, j+1)]){ ctx.moveTo(q[1][0],q[1][1]); ctx.lineTo(q[2][0],q[2][1]); }
        const up = i < nr-2 ? sideAt(i+1, j) : capIdx(nr-1);
        if(up < 0 || !V[up]){ ctx.moveTo(q[3][0],q[3][1]); ctx.lineTo(q[2][0],q[2][1]); }
        const dn = i > 0 ? sideAt(i-1, j) : capIdx(0);
        if(dn < 0 || !V[dn]){ ctx.moveTo(q[0][0],q[0][1]); ctx.lineTo(q[1][0],q[1][1]); }
      }
      // + el contorn exterior sencer (envolupant convexa), perquè cap tram de la vora quedi sense línia
      { const all = []; PR.forEach(r => r.forEach(v => all.push(v))); const hull = d3.polygonHull(all); if(hull) poly(ctx, hull); }
      ctx.strokeStyle = on ? C.vermell : IBV.alpha(C.ink,.8); ctx.lineWidth = on ? 1.3 : .75; ctx.stroke();
      // arestes marcades entre dues cares visibles que fan angle (capçal, extrems de les llindes, cantells)
      ctx.beginPath();
      const dot = (a,b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2], CREASE = Math.cos(42*D2R);
      for(let k=0;k<ALL.length;k++){
        const f = ALL[k]; if(!f.side || !V[k]) continue;
        const {i, j} = f, j1 = (j+1)%m, q = [PR[i][j], PR[i][j1], PR[i+1][j1], PR[i+1][j]];
        const rt = sideAt(i, j+1); if(V[rt] && dot(f.n, ALL[rt].n) < CREASE){ ctx.moveTo(q[1][0],q[1][1]); ctx.lineTo(q[2][0],q[2][1]); }
        const up = i < nr-2 ? sideAt(i+1, j) : capIdx(nr-1); if(up >= 0 && V[up] && dot(f.n, ALL[up].n) < CREASE){ ctx.moveTo(q[3][0],q[3][1]); ctx.lineTo(q[2][0],q[2][1]); }
        if(i === 0){ const c0 = capIdx(0); if(c0 >= 0 && V[c0] && dot(f.n, ALL[c0].n) < CREASE){ ctx.moveTo(q[0][0],q[0][1]); ctx.lineTo(q[1][0],q[1][1]); } }
      }
      ctx.strokeStyle = on ? C.vermell : IBV.alpha(C.ink,.5); ctx.lineWidth = .55; ctx.stroke();
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
    drawSil(ctx, f[0], f[1], h, pp.pose||"dret", ph, dir, IBV.alpha(C.ink, pp.a||.88), pp);
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

  window.SH3D = {TINT, AX, pol, buildModel, buildGround, camera, orbit, render, dragOrbit, drawPerson, silhouette, silPaths, drawSil, GROUPS, PAPER, D2R, R2D};
})();
