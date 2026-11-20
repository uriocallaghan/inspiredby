/* Inspired by Magazine — motor de maqueta de línia (component del sistema, peça HOW-03).
   Perspectiva en canvas 2D per dibuixar arquitectura de pedra com un gravat: pedres amb secció orgànica i ombrejat
   suau, contorn de tinta (silueta + envolupant + arestes marcades), ombres projectades, murs de paret seca,
   vegetació en verd (només natura), gent de silueta (IBGENT) i ordenació per profunditat.
   Coordenades en metres: x = est, y = nord, z = amunt. Les dades del model les dona qui el fa servir.
   Requereix d3 7.9.0, ib-viz.js i ib-gent.js. Documentació: research/sistema-infografic.md (HOW-03). */
(function(){
  "use strict";
  const C = IBV.C, D2R = Math.PI/180, R2D = 180/Math.PI;
  const paper = () => (getComputedStyle(document.documentElement).getPropertyValue("--paper") || "").trim() || "#FFFFFF";
  const hash = (a, b, c) => { const x = Math.sin(a*127.1 + b*311.7 + c*74.7)*43758.5453; return (x - Math.floor(x))*2 - 1; };
  const poly = (ctx, q) => { ctx.moveTo(q[0][0], q[0][1]); for(let i=1;i<q.length;i++) ctx.lineTo(q[i][0], q[i][1]); ctx.closePath(); };

  /* ---------- 1. Càmera ---------- */
  function camera(o, w, h){
    const eye = o.eye, tg = o.target;
    let f = [tg[0]-eye[0], tg[1]-eye[1], tg[2]-eye[2]]; const fl = Math.hypot(...f); f = f.map(v => v/fl);
    let r = [f[1], -f[0], 0]; const rl = Math.hypot(...r)||1; r = r.map(v => v/rl);
    const u = [r[1]*f[2]-r[2]*f[1], r[2]*f[0]-r[0]*f[2], r[0]*f[1]-r[1]*f[0]];
    const foc = (h/2)/Math.tan((o.fov||40)*D2R/2), cx = w/2, cy = h*(o.cy==null ? .5 : o.cy), near = o.near||.6;
    return {
      eye, f, r, u, foc,
      p(P){ const d0 = P[0]-eye[0], d1 = P[1]-eye[1], d2 = P[2]-eye[2], zc = d0*f[0]+d1*f[1]+d2*f[2]; if(zc < near) return null;
        return [cx + foc*(d0*r[0]+d1*r[1]+d2*r[2])/zc, cy - foc*(d0*u[0]+d1*u[1]+d2*u[2])/zc, zc]; },
      dist(P){ return Math.hypot(P[0]-eye[0], P[1]-eye[1], P[2]-eye[2]); },
      // retalla un polígon contra el pla proper i el projecta
      clip(pts){ const NZ = 1.2, cz = P => (P[0]-eye[0])*f[0]+(P[1]-eye[1])*f[1]+(P[2]-eye[2])*f[2], out = [];
        for(let i=0;i<pts.length;i++){ const A = pts[i], B = pts[(i+1)%pts.length], za = cz(A), zb = cz(B);
          if(za >= NZ) out.push(A);
          if((za >= NZ) !== (zb >= NZ)){ const t = (NZ-za)/(zb-za); out.push([A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t, A[2]+(B[2]-A[2])*t]); } }
        return out.map(P => this.p(P)).filter(Boolean); }
    };
  }
  // azimut des d'on mirem (graus, 0 = des del nord), elevació (graus), distància (m), punt mirat
  function orbit(az, el, dist, tgt){
    const t = tgt||[0,0,1.5], ce = Math.cos(el*D2R);
    return {eye:[t[0]+dist*ce*Math.sin(az*D2R), t[1]+dist*ce*Math.cos(az*D2R), t[2]+dist*Math.sin(el*D2R)], target:t};
  }

  /* ---------- 2. Pedres: pila d'anells de secció superel·lipse ---------- */
  // pedra: {id, g, nom, x, y, rot (azimut de la cara ampla), w, t, h, z0, taper, lean:[dx,dy] (el cap es desplaça),
  //         fin: "dressed" (picada, cantells vius) | "slab" (llosa) | "natural" | "boulder", slab:true (bloc horitzontal: capitell, llinda), seed}
  function section(hw, ht, n, r, amp, p){
    const ph1 = r()*6.28, ph2 = r()*6.28, a1 = amp*(.6+r()*.8), a2 = amp*.5*(.5+r()), out = [];
    for(let i=0;i<n;i++){ const t = (i+.5)/n*Math.PI*2, c = Math.cos(t), sn = Math.sin(t), k = 1 + a1*Math.sin(2*t + ph1) + a2*Math.sin(3*t + ph2);
      out.push([Math.sign(c)*Math.pow(Math.abs(c), 2/p)*hw*k, Math.sign(sn)*Math.pow(Math.abs(sn), 2/p)*ht*k]); }
    return out;
  }
  function solid(s, a){
    if(s.__c && s.__c.a === a) return s.__c.v;
    const r = IBV.rng(s.seed||7), R = [], fin = s.fin||"natural";
    const ca = Math.sin(s.rot*D2R), sa = Math.cos(s.rot*D2R), na = Math.cos(s.rot*D2R), nb = -Math.sin(s.rot*D2R);
    if(s.slab){                                       // bloc horitzontal: anells al llarg de l'amplada
      const n = 14, z0 = s.z0 + (1-a)*4, sec = section(s.t/2, s.h/2, n, r, .008, 5), NS = 7;
      for(let k=0;k<=NS;k++){ const f = k/NS, sc = (k===0 || k===NS) ? .93 : 1, u = (f-.5)*s.w;
        R.push(sec.map(([v,z],j) => { const e = k%NS ? hash(s.seed, k, j)*.005 : 0; return [s.x + u*ca + (v*sc+e)*na, s.y + u*sa + (v*sc+e)*nb, z0 + s.h/2 + z*sc]; })); }
      return (s.__c = {a, v:{rings:R, caps:[0, R.length-1], fin, rough:sec.map(() => .006)}}).v;
    }
    let n, p, amp, F, top, topZ, bulge, drift, lean = s.lean||[0,0];
    if(fin === "dressed"){ n = 16; p = 5; amp = .01; F = [0,.12,.3,.5,.7,.86,.95,.985,1]; top = .92; topZ = 0; bulge = 0; drift = 0; }
    else if(fin === "slab"){ n = 14; p = 4; amp = .03; F = [0,.55,.9,1]; top = .9; topZ = .03; bulge = .02; drift = .01; }
    else if(fin === "boulder"){ n = 16; p = 2.3; amp = .13; F = [0,.18,.4,.62,.8,.92,1]; top = .42; topZ = .3; bulge = .1; drift = .05; }
    else { n = 12; p = 3.2; amp = .06; F = [0,.3,.6,.82,.94,1]; top = .7; topZ = .05; bulge = .05; drift = .03; }
    if(s.p) p = s.p; if(s.amp != null) amp = s.amp;
    const sec = section(s.w/2, s.t/2, n, r, amp, p), tp = s.taper||1, H = s.h*a, rough = s.rough==null ? (fin === "dressed" ? .008 : .02) : s.rough;
    let dx = 0, dy = 0;
    F.forEach((f,i) => {
      const last = i === F.length-1; let sc = 1 - (1-tp)*f;
      if(fin === "dressed"){ if(i === F.length-2) sc *= .97; if(last) sc *= top; }
      else { sc *= 1 + (r()-.5)*bulge*2; if(last) sc *= top; else if(i === F.length-2) sc *= .88; dx += (r()-.5)*s.w*drift; dy += (r()-.5)*s.t*drift; }
      const zr = s.z0 + H*f;
      R.push(sec.map(([u,v],j) => {
        const e = fin === "dressed" ? (i < F.length-2 ? hash(s.seed, i, j)*rough : 0) : (last ? 0 : hash(s.seed, i, j)*amp*.25*Math.max(s.w, s.t));
        const L = Math.hypot(u, v)||1, uu = (u + u/L*e)*sc + dx, vv = (v + v/L*e)*sc + dy;
        return [s.x + uu*ca + vv*na + lean[0]*f, s.y + uu*sa + vv*nb + lean[1]*f, zr + (last && fin !== "dressed" ? hash(s.seed, 99, j)*topZ*a : 0)];
      }));
    });
    return (s.__c = {a, v:{rings:R, caps:[R.length-1], fin, rough:sec.map(() => rough)}}).v;
  }
  function faces(sd){
    if(sd.F) return sd.F;
    const R = sd.rings, out = [], cen = [0,0,0]; let n = 0;
    R.forEach(r => r.forEach(p => { cen[0]+=p[0]; cen[1]+=p[1]; cen[2]+=p[2]; n++; })); cen[0]/=n; cen[1]/=n; cen[2]/=n;
    const push = (pts, meta) => {
      let nx=0, ny=0, nz=0, mx=0, my=0, mz=0;
      for(let i=0;i<pts.length;i++){ const p = pts[i], q = pts[(i+1)%pts.length];
        nx += (p[1]-q[1])*(p[2]+q[2]); ny += (p[2]-q[2])*(p[0]+q[0]); nz += (p[0]-q[0])*(p[1]+q[1]); mx+=p[0]; my+=p[1]; mz+=p[2]; }
      mx/=pts.length; my/=pts.length; mz/=pts.length; const l = Math.hypot(nx,ny,nz)||1; nx/=l; ny/=l; nz/=l;
      const ref = meta.side ? meta.axis : cen;
      if(nx*(mx-ref[0]) + ny*(my-ref[1]) + nz*(mz-ref[2]) < 0){ nx=-nx; ny=-ny; nz=-nz; }
      out.push(Object.assign({pts, n:[nx,ny,nz], c:[mx,my,mz]}, meta));
    };
    const ringC = R.map(r => { const c = [0,0,0]; r.forEach(p => { c[0]+=p[0]; c[1]+=p[1]; c[2]+=p[2]; }); return c.map(v => v/r.length); });
    const m = R[0].length;
    for(let i=0;i<R.length-1;i++) for(let j=0;j<m;j++){ const j1 = (j+1)%m, ax = ringC[i].map((v,k) => (v + ringC[i+1][k])/2);
      push([R[i][j], R[i][j1], R[i+1][j1], R[i+1][j]], {side:true, i, j, axis:ax}); }
    sd.caps.forEach(k => push(R[k], {side:false, cap:k}));
    sd.m = m; sd.nr = R.length;
    return (sd.F = out);
  }

  /* ---------- 3. Murs de paret seca: trams prismàtics amb filades ---------- */
  // mur: {id, g, nom, pts:[[x,y]...] (eix), h, t (gruix), z0 (base), seed, closed}
  function wallSegs(wl){
    if(wl.__s) return wl.__s;
    const out = [], P = wl.pts, n = wl.closed ? P.length : P.length-1;
    for(let i=0;i<n;i++){
      const A0 = P[i], B0 = P[(i+1)%P.length], dx = B0[0]-A0[0], dy = B0[1]-A0[1], L = Math.hypot(dx,dy)||1, nx = -dy/L*wl.t/2, ny = dx/L*wl.t/2, ex = dx/L*.04, ey = dy/L*.04, A = [A0[0]-ex, A0[1]-ey], B = [B0[0]+ex, B0[1]+ey];
      const hA = wl.h*(1 + hash(wl.seed||3, i, 1)*.12), hB = wl.h*(1 + hash(wl.seed||3, i+1, 1)*.12);
      out.push({w:wl, i, L, last:i === n-1, z0:wl.z0||0, base:[[A[0]+nx,A[1]+ny],[B[0]+nx,B[1]+ny],[B[0]-nx,B[1]-ny],[A[0]-nx,A[1]-ny]], hA, hB, c:[(A[0]+B[0])/2, (A[1]+B[1])/2, (wl.z0||0) + wl.h/2]});
    }
    return (wl.__s = out);
  }

  /* ---------- 4. Vegetació (verd: només natura) ---------- */
  // arbre: {x, y, h (alçada), r (radi de copa), seed}; mata: {x, y, r, h, seed, bush:true}
  function drawTree(ctx, cam, tr, LIGHT){
    const base = cam.p([tr.x, tr.y, 0]), topP = cam.p([tr.x, tr.y, tr.h]); if(!base || !topP || base[2] < Math.max(9, tr.r*4)) return;   // massa a prop de la càmera: no tapa la maqueta
    // escala en píxels per metre en horitzontal (a la copa), perquè des de dalt la copa no s'aixafi
    const cz0 = tr.bush ? tr.h*.5 : tr.h - tr.r*.75, c0 = cam.p([tr.x, tr.y, cz0]), side = cam.p([tr.x + cam.r[0], tr.y + cam.r[1], cz0]); if(!c0 || !side) return;
    const sc = Math.hypot(side[0]-c0[0], side[1]-c0[1]); if(sc < .5) return;
    const rr = IBV.rng(tr.seed||5), R = tr.r*sc;
    if(!tr.bush){ // tronc tortuós d'ullastre
      const cr = cam.p([tr.x, tr.y, tr.h - tr.r*.9]);
      ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.bezierCurveTo(base[0] + R*.25, base[1] - (base[1]-cr[1])*.4, cr[0] - R*.3, cr[1] + (base[1]-cr[1])*.3, cr[0], cr[1]);
      ctx.strokeStyle = IBV.alpha(C.ink2, .8); ctx.lineWidth = Math.max(1, sc*.13); ctx.stroke(); }
    const cz = tr.bush ? tr.h*.5 : tr.h - tr.r*.75, c = cam.p([tr.x, tr.y, cz]); if(!c) return;
    // copa: núvol de lòbuls, clar a la llum (NO) i fosc a l'ombra
    const lobes = []; const nl = tr.bush ? 5 : 9;
    for(let i=0;i<nl;i++){ const a = rr()*6.28, d = (tr.bush ? .45 : .55)*R*Math.sqrt(rr()); lobes.push([c[0] + Math.cos(a)*d*1.2, c[1] + Math.sin(a)*d*.7 - (tr.bush ? 0 : R*.08), R*(.42 + rr()*.25)]); }
    lobes.sort((p,q) => p[1]-q[1]);
    const crown = () => { ctx.beginPath(); lobes.forEach(([x,y,r]) => { ctx.moveTo(x+r, y); ctx.arc(x, y, r, 0, 6.283); }); };
    crown(); ctx.strokeStyle = IBV.alpha(C.greenDark, .95); ctx.lineWidth = 1.5; ctx.stroke();          // contorn exterior (el farciment tapa els interiors)
    crown(); ctx.fillStyle = d3.interpolateLab(C.greenLight, C.green)(.5); ctx.fill();
    // llum i ombra a la copa
    ctx.save(); ctx.beginPath(); lobes.forEach(([x,y,r]) => { ctx.moveTo(x+r, y); ctx.arc(x, y, r, 0, 6.283); }); ctx.clip();
    const g = ctx.createLinearGradient(c[0] - R, c[1] - R, c[0] + R, c[1] + R);
    g.addColorStop(0, IBV.alpha(C.greenLight, .75)); g.addColorStop(.5, IBV.alpha(C.green, 0)); g.addColorStop(1, IBV.alpha(C.greenDark, .45));
    ctx.fillStyle = g; ctx.fillRect(c[0]-R*2, c[1]-R*2, R*4, R*4);
    ctx.beginPath(); for(let i=0;i<(tr.bush ? 8 : 22);i++){ const a = rr()*6.28, d = R*.85*Math.sqrt(rr()), x = c[0] + Math.cos(a)*d*1.2, y = c[1] + Math.sin(a)*d*.7;
      ctx.moveTo(x - 1.6, y); ctx.quadraticCurveTo(x, y - 1.6, x + 1.6, y); }
    ctx.strokeStyle = IBV.alpha(C.greenDark, .55); ctx.lineWidth = .55; ctx.stroke();
    ctx.restore();
  }

  /* ---------- 5. Dibuix ---------- */
  const TN = 40;
  let PALS = null, PAL_PAPER = null;
  function pals(){
    const P = paper(); if(PALS && PAL_PAPER === P) return PALS;
    const ramp = (from, to, k0, k1) => d3.range(TN+1).map(i => d3.interpolateLab(from, to)(k0 + i/TN*(k1-k0)));
    const tint = d3.interpolateLab(P, C.red)(.14), warm = d3.interpolateLab(C.ink, "#8C7A5E")(.55);
    PAL_PAPER = P;
    return (PALS = {
      fresh: ramp(P, C.ink, 0, .26),                          // pedra acabada de picar
      stone: ramp(P, C.ink, .05, .34),                        // pedra natural
      lime:  ramp(P, warm, .04, .42),                         // calcària càlida (Menorca)
      blue:  ramp(P, d3.interpolateLab(C.ink, C.blue)(.4), .06, .38),
      on:    ramp(tint, C.red, 0, .3), tint
    });
  }
  const VEG = {c:null};
  // st: {light:[x,y,z], highlight:fn, dimOthers, lawn:[[x,y]...], tufts:[[x,y,h]...], trees:[...], walls:[...], ground:[{pts, w, a, fill}],
  //      people:[{x,y,pose,az,h,pel,capa,k}], t, groundExtra:fn(ctx,cam), pal:"fresh"|"lime"..., shadows}
  function render(ctx, w, h, cam, model, st){
    st = st||{};
    const PAL = pals(), LIGHT = (() => { const v = st.light||[-.45,.5,.95], l = Math.hypot(...v); return v.map(x => x/l); })();
    const hl = st.highlight||null, appear = st.appear||(() => 1);
    ctx.clearRect(0, 0, w, h); ctx.lineJoin = "round"; ctx.lineCap = "round";

    // terra amb vegetació, en una capa que s'esvaeix cap a les vores com una maqueta
    if(st.lawn || st.tufts){
      const cv = ctx.canvas; if(!VEG.c) VEG.c = document.createElement("canvas");
      if(VEG.c.width !== cv.width || VEG.c.height !== cv.height){ VEG.c.width = cv.width; VEG.c.height = cv.height; }
      const g = VEG.c.getContext("2d"); g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,cv.width,cv.height); g.setTransform(ctx.getTransform());
      g.lineJoin = "round"; g.lineCap = "round";
      if(st.lawn){ const q = cam.clip(st.lawn.map(p => [p[0], p[1], 0]));
        if(q.length > 2){ g.beginPath(); poly(g, q); g.fillStyle = st.lawnFill || d3.interpolateLab(C.greenLight, C.green)(.18); g.fill(); } }
      if(st.tufts){ g.beginPath();
        for(const t of st.tufts){ const a = cam.p([t[0], t[1], 0]); if(!a || a[2] < 3) continue; const b = cam.p([t[0], t[1], t[2]]); if(!b) continue;
          const hh = a[1]-b[1]; if(hh < 1.2) continue; const sx = hh*.45;
          g.moveTo(a[0]-sx, a[1]); g.lineTo(a[0]-sx*1.5, a[1]-hh*.8); g.moveTo(a[0], a[1]); g.lineTo(a[0]+sx*.2, a[1]-hh); g.moveTo(a[0]+sx, a[1]); g.lineTo(a[0]+sx*1.6, a[1]-hh*.75); }
        g.strokeStyle = IBV.alpha(C.greenDark, .6); g.lineWidth = .65; g.stroke(); }
      const o = cam.p(st.center||[0,0,0]) || [w/2, h/2], R = Math.max(w, h)*(st.fadeR||.55);
      const gr = g.createRadialGradient(o[0], o[1], R*.3, o[0], o[1], R); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.globalCompositeOperation = "destination-in"; g.fillStyle = gr; g.fillRect(-10, -10, w+20, h+20);
      g.globalCompositeOperation = "destination-out";
      const edge = (x0,y0,x1,y1,rx,ry,rw,rh) => { const lg = g.createLinearGradient(x0,y0,x1,y1); lg.addColorStop(0,"rgba(0,0,0,0)"); lg.addColorStop(1,"rgba(0,0,0,1)"); g.fillStyle = lg; g.fillRect(rx,ry,rw,rh); };
      const fb = Math.min(120, h*.25), fs = Math.min(110, w*.1);
      edge(0,h-fb,0,h, -5,h-fb,w+10,fb+5); edge(0,fb*.7,0,0, -5,-5,w+10,fb*.7+5); edge(fs,0,0,0, -5,-5,fs+5,h+10); edge(w-fs,0,w,0, w-fs,-5,fs+5,h+10);
      g.globalCompositeOperation = "source-over";
      ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(VEG.c, 0, 0); ctx.restore();
    }
    // línies i taques de terra
    (st.ground||[]).forEach(gd => {
      const q = gd.closed ? cam.clip(gd.pts.map(p => [p[0], p[1], p[2]||0])) : gd.pts.map(p => cam.p([p[0], p[1], p[2]||0]));
      if(q.some(v => !v) || q.length < 2) return;
      ctx.beginPath(); gd.closed ? poly(ctx, q) : q.forEach((v,i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]));
      if(gd.fill){ ctx.fillStyle = gd.fill; ctx.fill(); }
      if(gd.w !== 0){ ctx.strokeStyle = IBV.alpha(gd.c||C.ink, gd.a==null ? .4 : gd.a); ctx.lineWidth = gd.w||.6; if(gd.dash) ctx.setLineDash(gd.dash); ctx.stroke(); ctx.setLineDash([]); }
    });
    if(st.groundExtra) st.groundExtra(ctx, cam);

    // elements que s'ordenen per profunditat: pedres, trams de mur, arbres i persones
    const items = [];
    for(const s of model){ const a = appear(s); if(a <= .001) continue; const sd = solid(s, a);
      items.push({s, sd, a, d:cam.dist([s.x + (s.lean ? s.lean[0]/2 : 0), s.y + (s.lean ? s.lean[1]/2 : 0), s.z0 + s.h/2]) - (s.slab ? .9 : 0) + (s.depthBias||0)}); }
    (st.walls||[]).forEach(wl => wallSegs(wl).forEach(sg => items.push({seg:sg, d:cam.dist(sg.c) + .2})));
    (st.trees||[]).forEach(tr => items.push({tree:tr, d:cam.dist([tr.x, tr.y, tr.h*.5]) - tr.r*.3}));
    (st.people||[]).forEach(pp => items.push({person:pp, d:cam.dist([pp.x, pp.y, .9]) - .3}));

    // ombres projectades (una sola taca: no s'enfosqueix on se sobreposa)
    if(st.shadows !== false){
      ctx.beginPath(); const kx = -LIGHT[0]/LIGHT[2], ky = -LIGHT[1]/LIGHT[2];
      const shade = pts3 => { const pts = []; for(const q of pts3){ const g = cam.p([q[0] + kx*q[2], q[1] + ky*q[2], .01]); if(!g || g[2] < 2) return; pts.push(g); }
        const hull = pts.length > 2 && d3.polygonHull(pts); if(hull){ poly(ctx, d3.polygonArea(hull) < 0 ? hull : hull.slice().reverse()); } };
      for(const it of items){
        if(it.sd){ const all = []; it.sd.rings.forEach(r => r.forEach(q => all.push(q))); if(!it.s.slab) it.sd.rings[0].forEach(q => all.push([q[0], q[1], 0])); shade(all); }
        else if(it.seg){ const sg = it.seg, all = []; sg.base.forEach((b,k) => { const hh = k===0||k===3 ? sg.hA : sg.hB; all.push([b[0], b[1], sg.z0], [b[0], b[1], sg.z0 + hh]); }); shade(all); }
        else if(it.tree && !it.tree.bush && cam.dist([it.tree.x, it.tree.y, 0]) > Math.max(9, it.tree.r*4)){ const tr = it.tree, all = []; for(let k=0;k<10;k++){ const a = k/10*6.283; all.push([tr.x + Math.cos(a)*tr.r, tr.y + Math.sin(a)*tr.r, tr.h - tr.r*.75]); } shade(all); }
      }
      ctx.fillStyle = IBV.alpha(C.ink, .05); ctx.fill("nonzero");
    }
    items.sort((p,q) => q.d - p.d);

    const hits = [];
    const shadeN = nrm => { const lit = nrm[0]*LIGHT[0] + nrm[1]*LIGHT[1] + nrm[2]*LIGHT[2]; return Math.max(0, Math.min(TN, Math.round((.86 - lit)*TN*.62))); };
    for(const it of items){
      if(it.person){ drawPerson3(ctx, cam, it.person, st.t||0); continue; }
      if(it.tree){ drawTree(ctx, cam, it.tree, LIGHT); continue; }
      if(it.seg){ drawWallSeg(ctx, cam, it.seg, PAL[st.wallPal||"lime"], shadeN, hl, hits); continue; }
      const s = it.s, R = it.sd.rings, PR = R.map(r => r.map(q => cam.p(q)));
      if(PR.some(r => r.some(v => !v))) continue;
      const on = hl && hl(s), dim = hl && !on && st.dimOthers;
      ctx.globalAlpha = (s.slab ? Math.min(1, it.a*1.4) : 1) * (dim ? .5 : 1);
      const ALL = faces(it.sd), m = it.sd.m, nr = it.sd.nr, fin = it.sd.fin;
      const V = ALL.map(f => f.n[0]*(cam.eye[0]-f.c[0]) + f.n[1]*(cam.eye[1]-f.c[1]) + f.n[2]*(cam.eye[2]-f.c[2]) > 0);
      const sideAt = (i,j) => i*m + ((j%m)+m)%m;
      const capIdx = k => { for(let q = (nr-1)*m; q < ALL.length; q++) if(ALL[q].cap === k) return q; return -1; };
      const pal = on ? PAL.on : PAL[s.pal || st.pal || (fin === "dressed" ? "fresh" : "stone")];
      const colTone = j => { let x=0,y=0,z=0; for(let i=0;i<nr-1;i++){ const a1 = ALL[sideAt(i,j)].n, a2 = ALL[sideAt(i,j-1)].n; x+=a1[0]+a2[0]; y+=a1[1]+a2[1]; z+=a1[2]+a2[2]; } const l = Math.hypot(x,y,z)||1; return shadeN([x/l,y/l,z/l]); };
      const tones = []; for(let j=0;j<m;j++) tones.push(colTone(j));
      const bodyTop = s.slab ? nr-1 : Math.max(1, nr-3);
      const cols = [];
      for(let j=0;j<m;j++){ const mid = Math.floor(bodyTop/2); if(!V[sideAt(mid,j)] && !V[sideAt(0,j)] && !V[sideAt(bodyTop-1,j)]) continue; cols.push({j, d:cam.dist(ALL[sideAt(mid,j)].c)}); }
      cols.sort((p,q) => q.d - p.d);
      const strip = j => { const j1 = (j+1)%m, pts = []; for(let i=0;i<=bodyTop;i++) pts.push(PR[i][j]); for(let i=bodyTop;i>=0;i--) pts.push(PR[i][j1]); return pts; };
      for(const {j} of cols){
        const j1 = (j+1)%m, q = strip(j);
        const A = [(PR[0][j][0] + PR[bodyTop][j][0])/2, (PR[0][j][1] + PR[bodyTop][j][1])/2], B = [(PR[0][j1][0] + PR[bodyTop][j1][0])/2, (PR[0][j1][1] + PR[bodyTop][j1][1])/2];
        let fill; if(Math.hypot(B[0]-A[0], B[1]-A[1]) < .5) fill = pal[tones[j]];
        else { fill = ctx.createLinearGradient(A[0], A[1], B[0], B[1]); fill.addColorStop(0, pal[tones[j]]); fill.addColorStop(1, pal[tones[j1]]); }
        ctx.beginPath(); poly(ctx, q); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = fill; ctx.lineWidth = .9; ctx.stroke();
      }
      if(!s.slab){
        const TF = []; for(let i=bodyTop;i<nr-1;i++) for(let j=0;j<m;j++){ const k = sideAt(i,j); if(V[k]) TF.push(k); }
        const cTop = capIdx(nr-1); if(cTop >= 0 && V[cTop]) TF.push(cTop);
        TF.sort((p,q) => cam.dist(ALL[q].c) - cam.dist(ALL[p].c));
        for(const k of TF){ const f = ALL[k], q = f.side ? [PR[f.i][f.j], PR[f.i][(f.j+1)%m], PR[f.i+1][(f.j+1)%m], PR[f.i+1][f.j]] : PR[f.cap];
          const c = pal[shadeN(f.n)]; ctx.beginPath(); poly(ctx, q); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = .9; ctx.stroke(); }
      } else {
        [0, nr-1].forEach(k => { const ci = capIdx(k); if(ci < 0 || !V[ci]) return; const c = pal[shadeN(ALL[ci].n)]; ctx.beginPath(); poly(ctx, PR[k]); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = .9; ctx.stroke(); });
      }
      // marques de treball: punts fins
      if(!on && it.a > .9){
        const rr = IBV.rng((s.seed||1) + 13); ctx.beginPath();
        for(const {j} of cols){ const rough = it.sd.rough[j], q0 = PR[0][j], q1 = PR[0][(j+1)%m], q3 = PR[bodyTop][j];
          const ww = Math.hypot(q1[0]-q0[0], q1[1]-q0[1]), hh = Math.hypot(q3[0]-q0[0], q3[1]-q0[1]);
          const k = Math.min(14, Math.floor(ww*hh/(rough > .03 ? 40 : rough > .01 ? 110 : 260)));
          for(let t=0;t<k;t++){ const u = .1 + rr()*.8, v = .05 + rr()*.9, i = Math.min(bodyTop-1, Math.floor(v*bodyTop)), fv = v*bodyTop - i;
            const a0 = PR[i][j], a1 = PR[i][(j+1)%m], b0 = PR[i+1][j], b1 = PR[i+1][(j+1)%m];
            const x = (a0[0]*(1-u) + a1[0]*u)*(1-fv) + (b0[0]*(1-u) + b1[0]*u)*fv, y = (a0[1]*(1-u) + a1[1]*u)*(1-fv) + (b0[1]*(1-u) + b1[1]*u)*fv;
            const rad = .35 + rr()*.5; ctx.moveTo(x+rad, y); ctx.arc(x, y, rad, 0, 6.283); } }
        ctx.fillStyle = IBV.alpha(C.ink, .14); ctx.fill();
      }
      // contorn: silueta real + envolupant
      ctx.beginPath();
      for(let k=0;k<ALL.length;k++){ const f = ALL[k]; if(!f.side || !V[k]) continue;
        const {i, j} = f, j1 = (j+1)%m, q = [PR[i][j], PR[i][j1], PR[i+1][j1], PR[i+1][j]];
        if(!V[sideAt(i, j-1)]){ ctx.moveTo(q[0][0],q[0][1]); ctx.lineTo(q[3][0],q[3][1]); }
        if(!V[sideAt(i, j+1)]){ ctx.moveTo(q[1][0],q[1][1]); ctx.lineTo(q[2][0],q[2][1]); }
        const up = i < nr-2 ? sideAt(i+1, j) : capIdx(nr-1); if(up < 0 || !V[up]){ ctx.moveTo(q[3][0],q[3][1]); ctx.lineTo(q[2][0],q[2][1]); }
        const dn = i > 0 ? sideAt(i-1, j) : capIdx(0); if(dn < 0 || !V[dn]){ ctx.moveTo(q[0][0],q[0][1]); ctx.lineTo(q[1][0],q[1][1]); } }
      { const all = []; PR.forEach(r => r.forEach(v => all.push(v))); const hull = d3.polygonHull(all); if(hull) poly(ctx, hull); }
      ctx.strokeStyle = on ? C.red : IBV.alpha(C.ink, .8); ctx.lineWidth = on ? 1.3 : .75; ctx.stroke();
      // arestes marcades
      ctx.beginPath(); const dot = (a,b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2], CREASE = Math.cos(42*D2R);
      for(let k=0;k<ALL.length;k++){ const f = ALL[k]; if(!f.side || !V[k]) continue;
        const {i, j} = f, j1 = (j+1)%m, q = [PR[i][j], PR[i][j1], PR[i+1][j1], PR[i+1][j]];
        const rt = sideAt(i, j+1); if(V[rt] && dot(f.n, ALL[rt].n) < CREASE){ ctx.moveTo(q[1][0],q[1][1]); ctx.lineTo(q[2][0],q[2][1]); }
        const up = i < nr-2 ? sideAt(i+1, j) : capIdx(nr-1); if(up >= 0 && V[up] && dot(f.n, ALL[up].n) < CREASE){ ctx.moveTo(q[3][0],q[3][1]); ctx.lineTo(q[2][0],q[2][1]); }
        if(i === 0){ const c0 = capIdx(0); if(c0 >= 0 && V[c0] && dot(f.n, ALL[c0].n) < CREASE){ ctx.moveTo(q[0][0],q[0][1]); ctx.lineTo(q[1][0],q[1][1]); } } }
      ctx.strokeStyle = on ? C.red : IBV.alpha(C.ink, .5); ctx.lineWidth = .55; ctx.stroke();
      ctx.globalAlpha = 1;
      const top = PR[s.slab ? Math.floor(PR.length/2) : PR.length-1];
      hits.push({s, x:d3.mean(top, v => v[0]), y:d3.mean(top, v => v[1]), d:it.d});
    }
    return hits;
  }
  // tram de mur de paret seca: cares visibles amb filades de pedres irregulars
  function drawWallSeg(ctx, cam, sg, pal, shadeN, hl, hits){
    const b = sg.base, z0 = sg.w.z0||0, H = [sg.hA, sg.hB, sg.hB, sg.hA];
    const B3 = b.map(p => [p[0], p[1], z0]), T3 = b.map((p,k) => [p[0], p[1], z0 + H[k]]);
    const PB = B3.map(q => cam.p(q)), PT = T3.map(q => cam.p(q)); if(PB.some(v => !v) || PT.some(v => !v)) return;
    const on = hl && hl(sg.w), rr = IBV.rng((sg.w.seed||3)*31 + sg.i);
    const fcs = [];
    for(let k=0;k<4;k++){ const k1 = (k+1)%4, A = B3[k], Bq = B3[k1], nx = Bq[1]-A[1], ny = -(Bq[0]-A[0]), cx = (A[0]+Bq[0])/2, cy = (A[1]+Bq[1])/2;
      const cxx = (b[0][0]+b[1][0]+b[2][0]+b[3][0])/4, cyy = (b[0][1]+b[1][1]+b[2][1]+b[3][1])/4, s = nx*(cx-cxx) + ny*(cy-cyy) < 0 ? -1 : 1, L = Math.hypot(nx,ny)||1;
      const n = [s*nx/L, s*ny/L, 0], c = [cx, cy, z0 + (H[k]+H[k1])/4];
      const isEnd = k === 1 || k === 3, openEnd = !sg.w.closed && ((k === 3 && sg.i === 0) || (k === 1 && sg.last));
      if(isEnd && !openEnd) continue;
      if(n[0]*(cam.eye[0]-c[0]) + n[1]*(cam.eye[1]-c[1]) + n[2]*(cam.eye[2]-c[2]) > 0) fcs.push({k, k1, n, d:cam.dist(c), end:isEnd}); }
    fcs.sort((p,q) => q.d - p.d);
    const pl = on ? pals().on : pal;
    fcs.forEach(f => {
      const q = [PB[f.k], PB[f.k1], PT[f.k1], PT[f.k]], tone = pl[shadeN(f.n)];
      ctx.beginPath(); poly(ctx, q); ctx.fillStyle = tone; ctx.fill(); ctx.strokeStyle = tone; ctx.lineWidth = .6; ctx.stroke();
      // filades: línies horitzontals ondulades i junts verticals alternats (pedres de mida mitjana)
      const len = Math.hypot(b[f.k1][0]-b[f.k][0], b[f.k1][1]-b[f.k][1]); if(len < .4) return;
      ctx.save(); ctx.beginPath(); poly(ctx, q); ctx.clip(); ctx.beginPath();
      const rows = Math.max(2, Math.round(Math.max(H[f.k], H[f.k1])/.42));
      const at = (u, v) => { const x0 = PB[f.k][0] + (PB[f.k1][0]-PB[f.k][0])*u, y0 = PB[f.k][1] + (PB[f.k1][1]-PB[f.k][1])*u, x1 = PT[f.k][0] + (PT[f.k1][0]-PT[f.k][0])*u, y1 = PT[f.k][1] + (PT[f.k1][1]-PT[f.k][1])*u; return [x0 + (x1-x0)*v, y0 + (y1-y0)*v]; };
      for(let r=1;r<rows;r++){ const v = r/rows; let first = true; for(let u=0;u<=1.001;u+=1/Math.max(2, Math.round(len/.3))){ const p = at(u, v + (rr()-.5)*.06/rows*3); first ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); first = false; } }
      for(let r=0;r<rows;r++){ let u = rr()*.5/Math.max(1,len); while(u < 1){ u += (.45 + rr()*.55)/len; if(u >= 1) break; const a = at(u, r/rows), c = at(u + (rr()-.5)*.08/len, (r+1)/rows); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); } }
      ctx.strokeStyle = IBV.alpha(C.ink, .3); ctx.lineWidth = .5; ctx.stroke(); ctx.restore();
    });
    // capçal del mur
    const tq = PT; ctx.beginPath(); poly(ctx, tq); ctx.fillStyle = pl[4]; ctx.fill(); ctx.strokeStyle = pl[4]; ctx.lineWidth = .6; ctx.stroke();
    // contorn: peu i vores llargues del capçal (sense les juntes entre trams)
    ctx.beginPath(); fcs.forEach(f => { if(f.end) return; ctx.moveTo(PB[f.k][0], PB[f.k][1]); ctx.lineTo(PB[f.k1][0], PB[f.k1][1]); });
    ctx.moveTo(tq[0][0], tq[0][1]); ctx.lineTo(tq[1][0], tq[1][1]); ctx.moveTo(tq[2][0], tq[2][1]); ctx.lineTo(tq[3][0], tq[3][1]);
    if(!sg.w.closed && sg.i === 0){ ctx.moveTo(tq[3][0], tq[3][1]); ctx.lineTo(tq[0][0], tq[0][1]); }
    if(!sg.w.closed && sg.last){ ctx.moveTo(tq[1][0], tq[1][1]); ctx.lineTo(tq[2][0], tq[2][1]); }
    fcs.forEach(f => { if(!f.end) return; ctx.moveTo(PB[f.k][0], PB[f.k][1]); ctx.lineTo(PT[f.k][0], PT[f.k][1]); ctx.moveTo(PB[f.k1][0], PB[f.k1][1]); ctx.lineTo(PT[f.k1][0], PT[f.k1][1]); });
    ctx.strokeStyle = on ? C.red : IBV.alpha(C.ink, .72); ctx.lineWidth = on ? 1.1 : .7; ctx.stroke();
    hits.push({s:sg.w, x:(tq[0][0]+tq[1][0]+tq[2][0]+tq[3][0])/4, y:(tq[0][1]+tq[1][1]+tq[2][1]+tq[3][1])/4, d:cam.dist(sg.c)});
  }
  // persona: es projecten els peus i el cap i es dibuixa la silueta (IBGENT) a aquella alçada
  function drawPerson3(ctx, cam, pp, t){
    const f = cam.p([pp.x, pp.y, pp.z||0]), hd = cam.p([pp.x, pp.y, (pp.z||0) + (pp.h||1.7)]); if(!f || !hd) return;
    const h = Math.hypot(hd[0]-f[0], hd[1]-f[1]); if(h < 2) return;
    const ahead = cam.p([pp.x + Math.sin((pp.az||0)*D2R), pp.y + Math.cos((pp.az||0)*D2R), pp.z||0]), dir = ahead && ahead[0] < f[0] ? -1 : 1;
    const ph = (pp.pose === "camina" || pp.pose === "porta") ? t/420 + (pp.k||0) : (pp.pose === "picar" || pp.pose === "cavar") ? t/260 + (pp.k||0) : pp.pose === "estira" ? t/600 + (pp.k||0) : 0;
    return IBGENT.drawSil(ctx, f[0], f[1], h, pp.pose||"dret", ph, dir, IBV.alpha(C.ink, pp.a||.88), pp);
  }
  // arrossegar per girar: la maqueta segueix el dit; la pàgina continua fent scroll en vertical
  function dragOrbit(el, onDrag, onEnd){
    let x0 = null, id = null, moved = false;
    el.style.touchAction = "pan-y"; el.style.cursor = "grab";
    el.addEventListener("pointerdown", e => { x0 = e.clientX; id = e.pointerId; moved = false; el.style.cursor = "grabbing"; });
    el.addEventListener("pointermove", e => { if(x0 == null || e.pointerId !== id) return; const dx = e.clientX - x0; if(Math.abs(dx) > 2){ moved = true; onDrag(dx); x0 = e.clientX; } });
    const end = () => { if(x0 != null){ x0 = null; el.style.cursor = "grab"; onEnd && onEnd(moved); } };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end); el.addEventListener("pointerleave", end);
  }

  window.IB3D = {camera, orbit, render, dragOrbit, drawPerson3, solid, pals, D2R, R2D};
})();
