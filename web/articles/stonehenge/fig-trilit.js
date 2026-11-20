/* «Per què van aixecar Stonehenge?» · trilit */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, L = window.SH_LOCAL, S3 = window.SH3D, C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C);
  const {segBind, ctext, MODEL, GROUND, clamp} = window.SHA;
  const F0 = IBV.fmt(",.0f"), F1 = IBV.fmt(",.1f");
  const D2R = Math.PI/180, R2D = 180/Math.PI, AX = S3.AX;
  const ease = d3.easeCubicInOut;
  const yr = y => y < 0 ? `${F0(-y)} aC` : `${y}`;

  /* =========================================================================
     V5 · SCROLLY: COM S'ALÇA UN TRÍLIT (IB-16, alçat en gravat)
     ========================================================================= */
  (function initTrilit(){
    const el = document.getElementById("tri-viz"); if(!el) return;
    const sec = document.getElementById("s-trilit");
    const tEl = document.getElementById("tri-t");
    // estat interpolable: a1 = angle del primer pilar (0 ajagut, 90 dret), b1 = alçada del peu, a2 = segon pilar (visibilitat),
    // crib = pisos de la torre de troncs, lz = alçada de la llinda, det = detall dels encaixos, k* = visibilitat de cada colla
    const ST = [
      {cx:-3.2, a1:0,  b1:1.4,  a2:0, crib:0,  lz:-1,  det:0, kDig:1, kLev:0, kRope:0, kCrib:0, kFin:0, t:"1 · La fossa i la rampa"},
      {cx:-4.6, a1:30, b1:.1,   a2:0, crib:0,  lz:-1,  det:0, kDig:0, kLev:1, kRope:0, kCrib:0, kFin:0, t:"2 · El pilar bascula dins la fossa"},
      {cx:-3.6, a1:90, b1:-1.8, a2:1, crib:0,  lz:-1,  det:0, kDig:0, kLev:0, kRope:1, kCrib:0, kFin:0, t:"3 · Cordes i un bastidor en A el redrecen"},
      {cx:.5, a1:90, b1:-1.8, a2:1, crib:12, lz:6.6, det:0, kDig:0, kLev:0, kRope:0, kCrib:1, kFin:0, t:"4 · La llinda puja sobre una torre de troncs"},
      {cx:.5, a1:90, b1:-1.8, a2:1, crib:0,  lz:7.1, det:1, kDig:0, kLev:0, kRope:0, kCrib:0, kFin:1, t:"5 · Encaixos de fuster en pedra"}
    ];
    const LEN = 8.9, WD = 2.0, X1 = -.7, X2 = 1.7, DEPTH = 1.8, LW = 5.2, LH = 1.0;
    const PAPER = S3.PAPER, INK = C.ink;
    const mix = (a, b, k) => d3.interpolateLab(a, b)(k);
    const LIT = mix(PAPER, INK, .015), SHD = mix(PAPER, INK, .2), CHALK = mix(PAPER, "#B9AE98", .2), SOIL = mix(PAPER, "#8C7A5E", .32);
    const WOOD = mix(PAPER, "#8C7A5E", .18), ROPE = mix(INK, "#8C7A5E", .35);
    const TINT0 = S3.TINT, TINT1 = mix(S3.TINT, C.vermell, .3);
    let cur = 0, S = Object.assign({}, ST[0]), ctx = null, W = 0, H = 0, tm = null, T = 0, live = null, inView = false;

    /* ---------- formes locals de les pedres (u al llarg, v a través), fixes per a cada pedra ---------- */
    function outline(len, wd, seed, o){
      o = o||{}; const r = IBV.rng(seed), pts = [], amp = o.amp||.05, tap = o.taper||0;
      const vAt = (u, side) => side ? wd - (u/len)*tap*wd/2 : (u/len)*tap*wd/2;
      const edge = (n, f) => { for(let i=0;i<n;i++) pts.push(f(i/n)); };
      const jit = () => (r()-.5)*2*amp;
      const nL = Math.round(len/.45), nW = Math.round(wd/.4);
      edge(nL, k => [.12 + k*(len-.24), vAt(.12 + k*(len-.24), 0) + jit()*.8]);                 // cara de sota
      if(o.tenon){ const c = wd/2; pts.push([len-.1, vAt(len,0)+.15], [len, c-.42], [len+.2, c-.3], [len+.24, c], [len+.2, c+.3], [len, c+.42], [len-.1, vAt(len,1)-.15]); }
      else edge(nW, k => [len + jit()*.7 - (k>0&&k<1?0:.02), vAt(len,0) + .12 + k*(wd-.24 - tap*wd)]);
      edge(nL, k => [len-.12 - k*(len-.24), vAt(len-.12 - k*(len-.24), 1) + jit()*.8]);         // cara de dalt
      edge(nW, k => [jit()*.6, wd-.12 - k*(wd-.24)]);                                            // peu
      return pts;
    }
    function marks(len, wd, seed, n){ const r = IBV.rng(seed); return d3.range(n).map(() => [.2 + r()*(len-.4), .15 + r()*(wd-.3), .5 + r()*.8, r()*6.28]); }
    const PIL1 = {o:outline(LEN, WD, 11, {tenon:true, taper:.12}), mk:marks(LEN, WD, 12, 150)};
    const PIL2 = {o:outline(LEN, WD, 21, {tenon:true, taper:.1}),  mk:marks(LEN, WD, 22, 150)};
    const LIN  = {o:outline(LW, LH, 31, {amp:.035}), mk:marks(LW, LH, 32, 60)};

    // transformació d'un pilar que gira sobre el peu: a = 0 ajagut (cap a l'esquerra), 90 dret
    function pillarT(a, x, b){
      const th = (180-a)*D2R, dir = [Math.cos(th), Math.sin(th)], perp = [-Math.sin(th), Math.cos(th)];
      return (u,v) => [x + u*dir[0] + (v-WD/2)*perp[0], b + u*dir[1] + (v-WD/2)*perp[1]];
    }

    function render(){
      if(!ctx) return;
      const mob = W < 520, m = Math.min((W-16)/(mob?14.8:18.5), (H-24)/11.2);
      const ox = W/2 - (mob ? clamp(S.cx, -2.6, .5) : S.cx)*m, gy = H - 14 - (DEPTH+.55)*m;
      const X = x => ox + x*m, Y = z => gy - z*m, P = q => [X(q[0]), Y(q[1])];
      const xl = (0-ox)/m, xr = (W-ox)/m;                         // límits de l'escena en metres
      ctx.save(); ctx.clearRect(0, 0, W, H); ctx.lineJoin = "round"; ctx.lineCap = "round";

      const smooth = Q => { const n = Q.length, mid = (a,b) => [(a[0]+b[0])/2, (a[1]+b[1])/2], m0 = mid(Q[n-1], Q[0]);
        ctx.moveTo(m0[0], m0[1]); for(let i=0;i<n;i++){ const a = Q[i], b = Q[(i+1)%n], md = mid(a,b); ctx.quadraticCurveTo(a[0], a[1], md[0], md[1]); } ctx.closePath(); };

      /* ---- pedra picada: degradat suau, cops de percussor, contorn net ---- */
      function stone(F, shape, len, wd, on, alpha){
        const Q = shape.o.map(q => P(F(q[0], q[1])));
        ctx.save(); ctx.globalAlpha = alpha==null ? 1 : alpha;
        const A = P(F(len/2, 0)), B = P(F(len/2, wd)), litA = (A[0]+A[1]) < (B[0]+B[1]);
        const g = ctx.createLinearGradient(...(litA ? A : B), ...(litA ? B : A));
        g.addColorStop(0, on ? TINT0 : LIT); g.addColorStop(.55, on ? mix(TINT0, TINT1, .5) : mix(LIT, SHD, .45)); g.addColorStop(1, on ? TINT1 : SHD);
        ctx.beginPath(); smooth(Q); ctx.fillStyle = g; ctx.fill();
        ctx.save(); ctx.clip();
        // cops de percussor: petites cassoletes amb la vora fosca al costat de l'ombra
        ctx.strokeStyle = IBV.alpha(on ? C.vermellFosc : INK, .16); ctx.lineWidth = .6;
        const rr = Math.max(.8, .032*m);
        ctx.beginPath();
        shape.mk.forEach(([u,v,s,a]) => { const c = P(F(u,v)); ctx.moveTo(c[0] + rr*s*Math.cos(a), c[1] + rr*s*Math.sin(a)); ctx.arc(c[0], c[1], rr*s, a, a + 2.2); });
        ctx.stroke();
        // vora il·luminada i vora d'ombra (volum)
        ctx.lineWidth = Math.max(2, .09*m); ctx.strokeStyle = IBV.alpha(INK, .06); ctx.beginPath(); smooth(Q.map(q => [q[0] + (litA?1:-1)*1.2, q[1] + (litA?1:-1)*1.2])); ctx.stroke();
        ctx.restore();
        ctx.beginPath(); smooth(Q); ctx.strokeStyle = on ? C.vermell : INK; ctx.lineWidth = on ? 1.4 : 1.05; ctx.stroke();
        ctx.restore();
        return Q;
      }
      /* ---- fusta: tronc vist de llarg (amb veta) o de punta (amb anells) ---- */
      function beam(x0, z0, x1, z1, d, o){
        o = o||{}; const a = P([x0,z0]), b = P([x1,z1]), L = Math.hypot(b[0]-a[0], b[1]-a[1]), w = Math.max(2.2, d*m);
        ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(b[1]-a[1], b[0]-a[0]));
        ctx.beginPath(); ctx.roundRect(0, -w/2, L, w, w/2); ctx.fillStyle = WOOD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
        if(w > 4){ ctx.beginPath(); const r = IBV.rng(Math.round(x0*10+z0*7));
          for(let i=0;i<2;i++){ const yy = (r()-.5)*w*.5; ctx.moveTo(w*.6 + r()*L*.1, yy); ctx.bezierCurveTo(L*.35, yy + (r()-.5)*w*.3, L*.65, yy + (r()-.5)*w*.3, L - w*.6 - r()*L*.1, yy); }
          ctx.strokeStyle = IBV.alpha(INK, .28); ctx.lineWidth = .5; ctx.stroke(); }
        if(o.end){ ctx.beginPath(); ctx.ellipse(L, 0, w*.22, w/2, 0, 0, 7); ctx.fillStyle = mix(WOOD, PAPER, .5); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke(); }
        ctx.restore();
      }
      function logEnd(x, z, d){
        const c = P([x,z]), r = d*m/2;
        ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 7); ctx.fillStyle = mix(WOOD, PAPER, .35); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
        ctx.beginPath(); [.62, .32].forEach(k => { ctx.moveTo(c[0] + r*k, c[1]); ctx.arc(c[0], c[1], r*k, 0, 7); });
        ctx.strokeStyle = IBV.alpha(INK, .3); ctx.lineWidth = .5; ctx.stroke();
      }
      /* ---- corda de fibra vegetal: traç amb torsió ---- */
      function rope(pts, sag){
        const Q = pts.map(P);
        ctx.beginPath(); ctx.moveTo(Q[0][0], Q[0][1]);
        for(let i=1;i<Q.length;i++){ const a = Q[i-1], b = Q[i]; ctx.quadraticCurveTo((a[0]+b[0])/2, (a[1]+b[1])/2 + (sag||0)*m, b[0], b[1]); }
        ctx.strokeStyle = ROPE; ctx.lineWidth = Math.max(1.4, .07*m); ctx.stroke();
        ctx.setLineDash([1.2, 2.2]); ctx.strokeStyle = IBV.alpha(PAPER, .8); ctx.lineWidth = .6; ctx.stroke(); ctx.setLineDash([]);
      }
      const person = (x, pose, o) => { o = o||{};
        ctx.save(); ctx.globalAlpha = o.a==null ? 1 : o.a;
        const r = S3.drawSil(ctx, X(x), Y(o.z||0), (o.h||1.7)*m, pose, o.ph||0, o.dir||1, o.col || mix(INK, PAPER, o.back ? .42 : .06), {pel:o.pel||"curt", capa:o.capa});
        ctx.restore(); return r; };
      const label = (x, y, lines, o) => { o = o||{};
        lines.forEach((t,i) => ctext(ctx, x, y + i*14, t, {size: i ? 11.5 : 12, weight: i ? 400 : 700, anchor:o.anchor||"start", fill: i ? C.ink2 : (o.fill||INK)})); };
      const leader = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.strokeStyle = IBV.alpha(INK, .55); ctx.lineWidth = .7; ctx.stroke();
        ctx.beginPath(); ctx.arc(x0, y0, 1.8, 0, 7); ctx.fillStyle = INK; ctx.fill(); };

      /* ---- 1. fons: el perfil suau de la plana i mates d'herba llunyanes ---- */
      ctx.beginPath();
      for(let x = xl; x <= xr; x += .5){ const z = .9 + .35*Math.sin(x*.21 + 1) + .2*Math.sin(x*.53); x === xl ? ctx.moveTo(X(x), Y(z)) : ctx.lineTo(X(x), Y(z)); }
      ctx.strokeStyle = IBV.alpha(INK, .13); ctx.lineWidth = .7; ctx.stroke();

      /* ---- 2. tall del terreny: terra vegetal, creta amb bandes de sílex, i les fosses ---- */
      const a2v = S.a2 > .02, pit1 = [[X1-3.3,0],[X1-.9,-DEPTH],[X1+1.1,-DEPTH],[X1+1.1,0]], pit2 = [[X2-1.1,0],[X2-1.1,-DEPTH],[X2+1.1,-DEPTH],[X2+1.1,0]];
      const zb = -DEPTH - .55;
      const groundPath = () => { ctx.beginPath(); ctx.moveTo(X(xl-1), Y(0));
        [pit1].concat(a2v ? [pit2] : []).forEach(pt => pt.forEach(q => ctx.lineTo(X(q[0]), Y(q[1]))));
        ctx.lineTo(X(xr+1), Y(0)); ctx.lineTo(X(xr+1), Y(zb)); ctx.lineTo(X(xl-1), Y(zb)); ctx.closePath(); };
      ctx.save(); groundPath(); ctx.clip();
      const gg = ctx.createLinearGradient(0, Y(0), 0, Y(zb));
      gg.addColorStop(0, CHALK); gg.addColorStop(.75, CHALK); gg.addColorStop(1, IBV.alpha(CHALK, 0));
      ctx.fillStyle = gg; ctx.fillRect(0, Y(0), W, Y(zb)-Y(0));
      // terra vegetal fosca, prima, amb vora ondulada
      ctx.beginPath(); ctx.moveTo(0, Y(0));
      for(let x = xl; x <= xr+.3; x += .3) ctx.lineTo(X(x), Y(-.28 - .06*Math.sin(x*2.3) - .04*Math.sin(x*5.1)));
      ctx.lineTo(W, Y(0)); ctx.closePath(); ctx.fillStyle = SOIL; ctx.fill();
      // estrats i nòduls de sílex (il·lustratius)
      const rs = IBV.rng(5); ctx.beginPath();
      [-.85, -1.45, -2.05].forEach(z0 => { for(let x = xl; x < xr; x += .9 + rs()*1.4){ const zz = z0 + (rs()-.5)*.12, c = P([x, zz]), w = (.06 + rs()*.08)*m, h = w*(.45 + rs()*.3);
        ctx.moveTo(c[0]+w, c[1]); ctx.ellipse(c[0], c[1], w, h, rs()*.6-.3, 0, 7); } });
      ctx.fillStyle = IBV.alpha(INK, .32); ctx.fill();
      ctx.beginPath(); [-.6, -1.15, -1.75].forEach(z0 => { ctx.moveTo(X(xl), Y(z0)); for(let x = xl; x <= xr; x += .6) ctx.lineTo(X(x), Y(z0 + .03*Math.sin(x*1.7))); });
      ctx.strokeStyle = IBV.alpha(INK, .1); ctx.lineWidth = .6; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      // contorn del tall
      ctx.beginPath(); ctx.moveTo(X(xl-1), Y(0)); [pit1].concat(a2v ? [pit2] : []).forEach(pt => pt.forEach(q => ctx.lineTo(X(q[0]), Y(q[1])))); ctx.lineTo(X(xr+1), Y(0));
      ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
      // gespa (verd vegetal) i mates, fora de les fosses
      const cut = [[X1-3.3, X1+1.1]].concat(a2v ? [[X2-1.1, X2+1.1]] : []), open = x => !cut.some(([a,b]) => x > a-.05 && x < b+.05);
      ctx.beginPath(); for(let x = xl; x < xr; x += .1){ if(!open(x)) continue; ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x+.1), Y(0)); }
      ctx.strokeStyle = C.vegetacio; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); const rt = IBV.rng(3);
      for(let x = xl; x < xr; x += .16 + rt()*.25){ if(!open(x)) continue; const hh = (.1 + rt()*.14)*m, b0 = X(x), b1 = Y(0);
        ctx.moveTo(b0-2, b1); ctx.quadraticCurveTo(b0-2.5, b1-hh*.5, b0-4, b1-hh*.8); ctx.moveTo(b0, b1); ctx.lineTo(b0+.6, b1-hh); ctx.moveTo(b0+2, b1); ctx.quadraticCurveTo(b0+2.6, b1-hh*.5, b0+4, b1-hh*.75); }
      ctx.strokeStyle = C.vegetacioFosc; ctx.lineWidth = .7; ctx.stroke();
      // runa de creta excavada, amuntegada a l'esquerra de la rampa
      if(S.kDig > .02 || S.a1 < 80){ const rp = IBV.rng(8); ctx.save(); ctx.globalAlpha = S.a1 < 80 ? 1 : 0;
        ctx.beginPath(); ctx.moveTo(X(X1+1.6), Y(0)); ctx.quadraticCurveTo(X(X1+2.5), Y(.85), X(X1+3.6), Y(0)); ctx.closePath();
        ctx.fillStyle = CHALK; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
        ctx.beginPath(); for(let i=0;i<22;i++){ const x = X1+1.8 + rp()*1.6, z = rp()*.55*(1 - Math.abs(x - (X1+2.6))/1.1), c = P([x, Math.max(.05, z)]), rr = (.04 + rp()*.06)*m; ctx.moveTo(c[0]+rr, c[1]); ctx.arc(c[0], c[1], rr, 0, 7); }
        ctx.strokeStyle = IBV.alpha(INK, .35); ctx.lineWidth = .5; ctx.stroke(); ctx.restore(); }

      /* ---- 3. trineu i carrils (passos 1–2) ---- */
      if(S.a1 < 40){ const k = 1 - S.a1/40;
        ctx.save(); ctx.globalAlpha = k;
        for(let x = X1-LEN-3.4; x < X1-3.2; x += .9) logEnd(x, .14, .28);
        beam(X1-LEN-3.6, .36, X1-3.3, .36, .14);
        if(S.a1 < 6) beam(X1-LEN-.6, .53, X1-.2, .53, .22, {end:true});
        ctx.restore(); }

      /* ---- 4. estaques a la paret de la fossa ---- */
      if(S.a1 < 85){ const k = clamp((85 - S.a1)/30, 0, 1); ctx.save(); ctx.globalAlpha = k;
        [0,1,2].forEach(i => beam(X1+1.0 - i*.05, -DEPTH, X1+1.0 - i*.05, 1.7 + i*.3, .12 - i*.015));
        ctx.restore(); }

      /* ---- 5. torre de troncs (pas 4): pisos alterns de troncs de llarg i de punta ---- */
      const cribW = 7.0, cx = (X1+X2)/2;
      if(S.crib > .3){
        const n = S.crib, full = Math.floor(n), fr = n - full;
        for(let i = 0; i < Math.ceil(n); i++){
          const z = i*.55, a = i < full ? 1 : fr; ctx.save(); ctx.globalAlpha = a;
          if(i%2===0) beam(cx-cribW/2, z+.27, cx+cribW/2, z+.27, .5, {end:true});
          else [-cribW/2+.35, -1.2, 1.2, cribW/2-.35].forEach(o => logEnd(cx+o, z+.27, .52));
          ctx.restore();
        }
      }

      /* ---- 6. pilars ---- */
      const onP = cur===1 || cur===2;
      if(a2v){ stone(pillarT(90, X2, -DEPTH), PIL2, LEN, WD, false, S.a2); }
      const F1 = pillarT(S.a1, X1, S.b1);
      stone(F1, PIL1, LEN, WD, onP);
      // pedres i creta picades al voltant dels peus drets
      if(S.a1 >= 80){ const k = clamp((S.a1-80)/10, 0, 1), rp = IBV.rng(17); ctx.save(); ctx.globalAlpha = k;
        [[X1, pit1], [X2, pit2]].forEach(([xc, pit], j) => { if(j && !a2v) return;
          const L0 = j ? X2-1.1 : X1-.9, R0 = (j ? X2 : X1) + 1.1;
          ctx.beginPath(); ctx.moveTo(X(j ? L0 : X1-3.3), Y(0)); ctx.lineTo(X(L0), Y(-DEPTH)); ctx.lineTo(X(R0), Y(-DEPTH)); ctx.lineTo(X(R0), Y(0)); ctx.closePath();
          ctx.save(); ctx.clip(); ctx.fillStyle = mix(CHALK, INK, .06); ctx.fillRect(0, 0, W, H);
          ctx.beginPath(); for(let i=0;i<70;i++){ const x = (j ? L0 : X1-3.3) + rp()*(R0 - (j ? L0 : X1-3.3)), z = -rp()*DEPTH, c = P([x,z]), rr = (.05 + rp()*.13)*m;
            if(Math.abs(x - xc) < WD/2 + .05) continue; ctx.moveTo(c[0]+rr, c[1]); ctx.ellipse(c[0], c[1], rr, rr*.75, rp(), 0, 7); }
          ctx.fillStyle = IBV.alpha(PAPER, .9); ctx.fill(); ctx.strokeStyle = IBV.alpha(INK, .55); ctx.lineWidth = .6; ctx.stroke(); ctx.restore(); });
        ctx.restore();
        stone(pillarT(90, X1, -DEPTH), PIL1, LEN, WD, onP);           // el pilar torna a quedar per sobre del rebliment
        if(a2v) stone(pillarT(90, X2, -DEPTH), PIL2, LEN, WD, false, S.a2);
      }

      /* ---- 7. llinda ---- */
      if(S.lz > .2){
        const z = S.lz, FL = (u,v) => [cx - LW/2 + u, z + v];
        stone(FL, LIN, LW, LH, cur>=3);
        if(S.det > .5){ ctx.save(); ctx.globalAlpha = (S.det-.5)*2; ctx.setLineDash([3, 2.5]); ctx.strokeStyle = C.vermell; ctx.lineWidth = 1;
          [X1, X2].forEach(px => { ctx.beginPath(); ctx.ellipse(X(px), Y(z+.12), .26*m, .2*m, 0, Math.PI, 2*Math.PI); ctx.stroke(); });
          ctx.restore(); }
      }

      /* ---- 8. colles de gent, cadascuna amb la feina del seu pas ---- */
      const ph = T/420;
      // pas 1: cavar la fossa amb pics de banya de cérvol i treure la creta en cistells
      if(S.kDig > .02){ const a = S.kDig;
        person(X1+.1, "cavar", {z:-DEPTH, ph:ph*1.5, a, dir:-1, pel:"llarg"});
        person(X1-2.0, "cavar", {z:-DEPTH*1.3/2.4, ph:ph*1.5+1.7, a, dir:1, h:1.62});
        if(!mob) person(X1+4.4, "porta", {ph:ph, a, dir:1, capa:true, h:1.66});
        [0,1].forEach(i => person(xl + .7 + i*.9, "dret", {ph:0, a:a*.95, dir:1, back:i===1, h:1.6+i*.06, pel:["llarg","monyo"][i]}));
      }
      // pas 2: palanques a la cua i contrapès que corre per sobre de la pedra
      if(S.kLev > .02){ const a = S.kLev, tail = P(F1(LEN, WD/2));
        const cwU = 3.6 - 2.3*clamp(S.a1/30, 0, 1), base = F1(cwU, 0), base2 = F1(cwU+1.4, 0);
        ctx.save(); ctx.globalAlpha = a;
        beam(base[0], base[1]+.05, base2[0], base2[1]+.05, .18);
        const rp = IBV.rng(4); for(let i=0;i<9;i++){ const u = cwU + .15 + rp()*1.1, q = F1(u, -.25 - (i%3)*.3), c = P(q), rr = (.16 + rp()*.08)*m;
          ctx.beginPath(); ctx.ellipse(c[0], c[1], rr, rr*.8, rp(), 0, 7); ctx.fillStyle = mix(PAPER, INK, .1); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke(); }
        ctx.restore();
        const tq = F1(LEN-.2, WD/2), hx = X1 - LEN*Math.cos(S.a1*D2R) - 1.3;
        ctx.save(); ctx.globalAlpha = a; rope([tq, [hx - 3*.9 - .3, 1.05]], .1); ctx.restore();
        [0,1,2,3].forEach(i => person(hx - i*.9, "estira", {a, dir:-1, back:i%2===1, ph:ph+i, h:1.6+i%2*.07, pel:["curt","llarg","monyo"][i%3]}));
      }
      // pas 3: bastidor en A, cordes i dues files de gent estirant; dos homes piquen el rebliment
      if(S.kRope > .02){ const a = S.kRope, top = F1(LEN, WD/2), apex = [X1-3.8, 6.6];
        ctx.save(); ctx.globalAlpha = a;
        beam(apex[0]-1.7, 0, apex[0]+.05, apex[1]+.2, .26); beam(apex[0]+1.5, 0, apex[0]-.05, apex[1]+.2, .26);
        beam(apex[0]-1.1, 2.3, apex[0]+1.0, 2.3, .14);
        const ap = P(apex); ctx.beginPath(); for(let i=0;i<4;i++){ ctx.moveTo(ap[0]-5, ap[1]-3+i*2.2); ctx.lineTo(ap[0]+5, ap[1]-1+i*2.2); } ctx.strokeStyle = ROPE; ctx.lineWidth = 1; ctx.stroke();
        const nRow = mob ? 4 : 5, x0 = apex[0]-2.4;
        rope([F1(LEN-.25, WD), apex, [x0 - nRow*.85, 1.15]], .08);
        rope([F1(LEN*.7, WD), [x0 - nRow*.85 + .3, 1.0]], .15);
        ctx.restore();
        for(let i=0;i<nRow;i++){ person(x0 - i*.85 + .42, "estira", {a:a*.9, dir:-1, back:true, h:1.52 + (i*7%3)*.05, ph:ph+i, pel:["llarg","curt","monyo"][i%3]}); }
        for(let i=0;i<nRow;i++){ person(x0 - i*.85, "estira", {a, dir:-1, h:1.62 + (i*5%3)*.05, ph:ph+i*1.3, pel:["curt","monyo","llarg"][i%3], capa:i===2}); }
        person(X1-2.5, "picar", {a, dir:1, ph:ph*2+1.4, h:1.6, pel:"llarg"});
      }
      // pas 4: dues persones a dalt de la torre fan pujar la llinda amb palanques; una altra porta troncs
      if(S.kCrib > .02 && S.crib > 1){ const a = S.kCrib, zt = Math.floor(S.crib)*.55;
        [-1, 1].forEach(sd => { const x = cx + sd*(cribW/2 - .4), r = person(x, "palanca", {a, z:zt, dir:-sd, h:1.62});
          ctx.save(); ctx.globalAlpha = a; const e = P([cx + sd*(LW/2 - .3), S.lz + .05]);
          ctx.beginPath(); ctx.moveTo(r.hand[0] + sd*.4*m, r.hand[1] + .3*m); ctx.lineTo(e[0], e[1]); ctx.strokeStyle = mix(WOOD, INK, .5); ctx.lineWidth = Math.max(1.6, .1*m); ctx.stroke(); ctx.restore(); });
        person(cx - cribW/2 - 1.6, "porta", {a, ph, dir:1, capa:true}); person(cx + cribW/2 + 1.4, "mira", {a, dir:-1, back:true, pel:"monyo"});
      }
      // pas 5: algú mira el trílit acabat
      if(S.kFin > .02){ person(X1-3.4, "mira", {a:S.kFin, dir:1, pel:"monyo", capa:true}); person(X1-4.3, "dret", {a:S.kFin, dir:1, back:true, h:1.55, pel:"llarg"}); }

      // persona d'escala, sempre al mateix lloc
      const xs = Math.min(mob ? 5.0 : 6.4, xr - .9); person(xs, "dret", {dir:-1, pel:"monyo", capa:true, col:INK});
      ctext(ctx, X(xs), Y(-.5), "1,7 m", {size:11.5, anchor:"middle", fill:C.ink2});

      /* ---- 9. rètols de cada pas ---- */
      const big = !mob;
      if(cur===0 && S.kDig > .9){
        const r0 = P([X1-1.6, -1.05]);
        if(big){ leader(r0[0], r0[1], r0[0]-60, Y(-DEPTH-.3)); label(r0[0]-64, Y(-DEPTH-.3)+2, ["Fossa amb rampa", "paret inclinada per on baixarà el peu"], {anchor:"end"}); }
        else { const q = P([X1+1.25, -DEPTH+.2]); label(q[0]+4, q[1], ["Fossa amb rampa"]); }
        const r1 = P([X1+1.0, 1.6]);
        if(big){ leader(r1[0], r1[1], r1[0]+30, r1[1]-34); label(r1[0]+34, r1[1]-34, ["Estaques", "protegeixen la paret vertical"]); }
        else { leader(r1[0], r1[1], r1[0]-14, Y(3.3)); label(r1[0]-16, Y(3.3)-4, ["Estaques"], {anchor:"end"}); }
        if(big){ const r2 = P([X1-LEN*.55, .4]); leader(r2[0], r2[1], r2[0], Y(3.4)); label(r2[0], Y(3.4)-8, ["Pilar sobre el trineu", "uns 20 t, 6–7 m de llarg amb la part enterrada"], {anchor:"middle"}); }
      }
      if(cur===1 && S.kLev > .9){
        const q = P(F1(2.0, -.9)); leader(q[0], q[1], q[0] + 30, q[1] - 40); label(q[0] + 34, q[1] - 44, ["Contrapès", "el 1994 en van fer servir sis tones"], {anchor:"start"});
        if(big){ const q2 = P([X1 - LEN*Math.cos(S.a1*D2R) - 2.6, 1.0]); label(q2[0], Y(3.0), ["Cordes", "frenen la pedra mentre bascula"], {anchor:"middle"}); }
      }
      if(cur===2 && S.kRope > .9){
        const ap = P([X1-3.8, 6.6]); if(big){ leader(ap[0]-4, ap[1]-2, ap[0]-40, ap[1]-26); label(ap[0]-44, ap[1]-30, ["Bastidor en A", "fa de politja sense roda"], {anchor:"end"}); }
        else { leader(ap[0]+3, ap[1]-3, ap[0]+16, ap[1]-22); label(ap[0]+19, ap[1]-26, ["Bastidor en A", "fa de politja sense roda"]); }
        if(big){ const q = P([X1-3.8-2.4-2.2, 3.2]); label(q[0], q[1], ["Cordes de fibra vegetal", "una colla estira des de lluny"], {anchor:"middle"}); }
        const pk = P([X1-1.4, -1.0]); leader(pk[0], pk[1], pk[0] - (big?60:30), Y(-DEPTH-.25)); label(pk[0] - (big?64:34), Y(-DEPTH-.25)+2, ["Pedres i creta picades", "fixen el peu"], {anchor:"end"});
      }
      if(cur===3 && S.kCrib > .9){
        const q = P([cx - cribW/2, 2.4]); leader(q[0], q[1], q[0] - (big?46:14), q[1] - 40); label(q[0] - (big?50:18), q[1] - 40, ["Torre de troncs", "un pis cada cop, amb palanques"], {anchor:"end"});
        const l = P([cx, S.lz + LH]); label(l[0], l[1] - 12, ["Llinda · fins a 10 t"], {anchor:"middle", fill:C.vermell});
      }
      if(S.det > .5){
        ctx.save(); ctx.globalAlpha = (S.det-.5)*2;
        // cota: uns 7 m sobre terra
        const xd = X2 + WD/2 + .55; ctx.beginPath(); ctx.moveTo(X(xd), Y(0)); ctx.lineTo(X(xd), Y(7.1+LH));
        [0, 7.1+LH].forEach(z => { ctx.moveTo(X(xd)-4, Y(z)); ctx.lineTo(X(xd)+4, Y(z)); });
        ctx.strokeStyle = IBV.alpha(INK, .6); ctx.lineWidth = .7; ctx.stroke();
        ctext(ctx, X(xd)+7, Y(4.2), "~7 m", {size:11.5, fill:C.ink2});
        ctext(ctx, X(xd)+7, Y(-1), "peu enterrat", {size:11.5, fill:C.ink2});
        insets(X, Y, m, mob);
        ctx.restore();
      }
      ctx.restore();
      tEl.textContent = ST[cur].t;
    }

    /* ---------- detall dels encaixos en dues lupes ---------- */
    function insets(X, Y, m, mob){
      const R = mob ? Math.min(56, W*.15) : Math.min(96, W*.085), z = 7.1;
      const spots = [
        {jx:X(X1), jy:Y(z), cx: mob ? R + 6 : X(X1) - 4.6*m, cy: Y(z) + (mob ? 1.5 : .6)*m, t:["Metxa i caixa", "el pilar entra a la llinda"], draw:tenon},
        {jx:X((X1+X2)/2 + LW/2), jy:Y(z + LH/2), cx: mob ? W - R - 6 : X(X2) + 4.6*m, cy: Y(z) + (mob ? 1.5 : .6)*m, t:["Encadellat", "entre llindes del cercle"], draw:groove}
      ];
      spots.forEach(sp => {
        ctx.beginPath(); ctx.moveTo(sp.jx, sp.jy); const a = Math.atan2(sp.jy - sp.cy, sp.jx - sp.cx); ctx.lineTo(sp.cx + R*Math.cos(a), sp.cy + R*Math.sin(a));
        ctx.strokeStyle = IBV.alpha(C.vermell, .7); ctx.lineWidth = .8; ctx.stroke();
        ctx.beginPath(); ctx.arc(sp.jx, sp.jy, 5, 0, 7); ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(sp.cx, sp.cy, R, 0, 7); ctx.fillStyle = PAPER; ctx.fill(); ctx.clip();
        sp.draw(sp.cx, sp.cy, R); ctx.restore();
        ctx.beginPath(); ctx.arc(sp.cx, sp.cy, R, 0, 7); ctx.strokeStyle = C.vermell; ctx.lineWidth = 1.1; ctx.stroke();
        sp.t.forEach((t,i) => ctext(ctx, sp.cx, sp.cy + R + 14 + i*14, t, {size: i ? 11.5 : 12, weight: i ? 400 : 700, anchor:"middle", fill: i ? C.ink2 : INK}));
      });
    }
    // bloc axonomètric senzill: cara frontal, cara superior i lateral, amb el degradat de la pedra
    function box(x, y, w, h, d, o){
      o = o||{}; const dx = d*.7, dy = -d*.45;
      const face = (pts, col) => { ctx.beginPath(); pts.forEach((q,i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke(); };
      face([[x,y],[x+w,y],[x+w+dx,y+dy],[x+dx,y+dy]], o.top || LIT);
      face([[x+w,y],[x+w+dx,y+dy],[x+w+dx,y+h+dy],[x+w,y+h]], SHD);
      face([[x,y],[x+w,y],[x+w,y+h],[x,y+h]], mix(LIT, SHD, .4));
    }
    function tenon(cx, cy, R){
      const s = R/60, lift = (Math.sin(T/700)+1)/2*8*s;
      // pilar a sota amb la metxa
      box(cx-28*s, cy+12*s, 44*s, 60*s, 26*s);
      const tx = cx-6*s+9*s*.7, ty = cy+12*s-26*s*.45/2;
      ctx.beginPath(); ctx.ellipse(tx, ty-5*s, 9*s, 5*s, 0, 0, 7); ctx.fillStyle = mix(LIT, SHD, .3); ctx.fill(); ctx.strokeStyle = C.vermell; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx-9*s, ty-5*s); ctx.lineTo(tx-9*s, ty); ctx.ellipse(tx, ty, 9*s, 5*s, 0, Math.PI, 0, true); ctx.lineTo(tx+9*s, ty-5*s); ctx.stroke();
      // llinda a dalt, aixecada, amb la caixa en línia discontínua
      const ly = cy - 34*s - lift;
      box(cx-48*s, ly, 84*s, 22*s, 26*s);
      ctx.setLineDash([2.5, 2]); ctx.beginPath(); ctx.ellipse(tx, ly+22*s-13*s*.45, 10*s, 5.5*s, 0, 0, 7); ctx.strokeStyle = C.vermell; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(tx+18*s, ly+30*s); ctx.lineTo(tx+18*s, ty-12*s); ctx.moveTo(tx+15*s, ty-15*s); ctx.lineTo(tx+18*s, ty-11*s); ctx.lineTo(tx+21*s, ty-15*s);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = .8; ctx.stroke();
    }
    function groove(cx, cy, R){
      const s = R/60, gap = (Math.sin(T/700)+1)/2*7*s + 3*s;
      // dues llindes vistes de dalt: una amb llengüeta en V i l'altra amb la ranura
      const y0 = cy-14*s, h = 28*s;
      const left = [[cx-62*s, y0],[cx-gap/2-8*s, y0],[cx-gap/2, y0+h/2],[cx-gap/2-8*s, y0+h],[cx-62*s, y0+h]];
      const right = [[cx+62*s, y0],[cx+gap/2, y0],[cx+gap/2-8*s, y0+h/2],[cx+gap/2, y0+h],[cx+62*s, y0+h]];
      [left, right].forEach((Q, i) => { ctx.beginPath(); Q.forEach((q,k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
        const g = ctx.createLinearGradient(0, y0, 0, y0+h); g.addColorStop(0, LIT); g.addColorStop(1, SHD); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(cx-gap/2-8*s, y0); ctx.lineTo(cx-gap/2, y0+h/2); ctx.lineTo(cx-gap/2-8*s, y0+h); ctx.moveTo(cx+gap/2, y0); ctx.lineTo(cx+gap/2-8*s, y0+h/2); ctx.lineTo(cx+gap/2, y0+h);
      ctx.strokeStyle = C.vermell; ctx.lineWidth = 1.3; ctx.stroke();
      ctext(ctx, cx, y0 + h + 14*s, "vist des de dalt", {size:10.5, anchor:"middle", fill:C.muted});
    }

    function go(i){
      const from = Object.assign({}, S), to = ST[i]; cur = i;
      if(tm) tm.stop();
      if(IBV.reduced || !ctx){ S = Object.assign({}, to); render(); return; }
      const it = d3.interpolateObject(from, to);
      tm = d3.timer(e => { const k = Math.min(1, e/1300); S = it(ease(k)); if(k>=1){ S = Object.assign({}, to); tm.stop(); tm = null; } if(!live) render(); });
    }
    // moviment lent de la feina (picar, cavar, estirar) mentre el gràfic és a la vista
    function loop(){ if(live) return; const t0 = performance.now() - T; live = d3.timer(() => { T = performance.now() - t0; render(); if(!inView){ live.stop(); live = null; } }); }
    IBV.mount(el, (container, w) => {
      const mm = (w-16)/(w < 520 ? 14.8 : 18.5);
      W = w; H = Math.round(clamp(Math.min(mm*11.4 + 30, innerHeight*(innerWidth<900?.62:.8)), 300, 660));
      ({ctx} = IBV.canvas(container, W, H, "Alçat lateral a escala de com s'alçava un trílit: la fossa amb rampa cavada a la creta, el pilar que bascula des del trineu, les cordes i el bastidor en A que el redrecen, la torre de troncs per pujar la llinda i els encaixos de metxa i caixa i d'encadellat."));
      render();
    });
    if(!IBV.reduced && "IntersectionObserver" in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; if(inView) loop(); }).observe(el);
    IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), i => go(i));
  })();
})();
