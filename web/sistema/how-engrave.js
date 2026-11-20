/* HOW-02 · Engraved elevation · Alçat en gravat
   Un procés constructiu explicat pas a pas en alçat lateral a escala, com un gravat: tall del terreny, materials amb textura,
   la colla que fa la feina de cada pas i lupes de detall. Exemple: com es fa un arc de mig punt sobre un cindri.
   Bloc per copiar: canvia SCENE (geometria en metres) i STEPS (estat interpolable de cada pas). Requereix d3 7.9.0 i ib-viz.js;
   les figures humanes surten de assets/ib-gent.js (window.IBGENT) si hi és. */
(function(){
  "use strict";
  const el = document.querySelector('[data-p="how-02"]'); if(!el) return;
  const C = IBV.C, INK = C.ink, PAPER = C.paper;
  // figures humanes: component compartit si existeix; si no, còpia local de la mateixa silueta
  const GENT = window.IBGENT || (function(){
  const POSES = {
    //        inclinació, cama davant [angle, genoll], cama darrere, braç 1 [espatlla, colze], braç 2, cap, eina
    dret:    ph => ({lean:.03, L1:[.06,.03], L2:[-.07,.04], A1:[.08,.12], A2:[-.05,.1], head:.05}),
    mira:    ph => ({lean:-.02, L1:[.07,.02], L2:[-.06,.03], A1:[.04,.08], A2:[-.02,.1], head:-.25}),
    camina:  ph => { const sw = Math.sin(ph); return {lean:.07, L1:[.36*sw, Math.max(0,-sw)*.7 + .06], L2:[-.36*sw, Math.max(0,sw)*.7 + .06], A1:[-.38*sw, .3], A2:[.38*sw, .3], head:.08}; },
    porta:   ph => { const sw = Math.sin(ph); return {lean:.1, L1:[.3*sw, Math.max(0,-sw)*.6 + .06], L2:[-.3*sw, Math.max(0,sw)*.6 + .06], A1:[.05, 2.5], A2:[.3*sw, .3], head:.08, eina:"banya-espatlla"}; },
    estira:  ph => { const sw = Math.sin(ph)*.08; return {lean:.62, L1:[.55+sw, .55], L2:[-.42+sw, .08], A1:[.55, 2.0], A2:[.35, 2.2], head:.35}; },
    palanca: ph => ({lean:.75, L1:[.35, .4], L2:[-.38, .06], A1:[1.15, .12], A2:[1.0, .18], head:.3}),
    picar:   ph => { const u = (Math.sin(ph)+1)/2; return {lean:.38, L1:[1.35, 1.35], L2:[.05, 1.6], A1:[1.2 + 1.5*u, .35], A2:[1.1 + 1.5*u, .45], head:.25, eina:"maça"}; },
    cavar:   ph => { const u = (Math.sin(ph)+1)/2; return {lean:.5 + .2*(1-u), L1:[.4, .35], L2:[-.32, .05], A1:[.9 + 1.7*u, .35], A2:[.8 + 1.7*u, .45], head:.25, eina:"banya"}; }
  };
  function silhouette(p, x, y, h, pose, ph, dir, o){
    dir = dir||1; ph = ph||0; o = o||{};
    const flush = () => { if(p.__flush) p.__flush(); };
    const P = (POSES[pose] || POSES.dret)(ph);
    const dn = a => [Math.sin(a), -Math.cos(a)], up = a => [Math.sin(a), Math.cos(a)];
    const add = (q, v, k) => [q[0] + v[0]*k, q[1] + v[1]*k];
    // esquelet en coordenades locals (x endavant, y amunt, unitats d'alçada), amb el maluc a l'origen
    const hip = [0, 0];
    const leg = ([th, kb]) => { const knee = add(hip, dn(th), .245), ank = add(knee, dn(th - kb), .245);
      const toe = kb > 1.2 ? add(ank, dn(th - kb), .05) : [ank[0] + .075, ank[1] - .005]; return [hip, knee, ank, toe]; };
    const Lf = leg(P.L1), Lb = leg(P.L2);
    const lean = P.lean;
    const waist = add(hip, up(lean*.8), .1), chest = add(waist, up(lean), .13), sh = add(chest, up(lean*1.05), .06);
    const neckTop = add(sh, up(lean*.7 + .12 + P.head*.4), .065), head = add(neckTop, up(lean*.6 + P.head*.5 + .15), .052);
    const arm = ([th, el]) => { const elb = add(sh, dn(th), .165), wr = add(elb, dn(th + el), .15), hand = add(wr, dn(th + el), .035); return [sh, elb, wr, hand]; };
    const Af = arm(P.A1), Ab = arm(P.A2);
    // terra: el punt més baix (peu, genoll de qui està agenollat) toca y = 0
    const low = Math.min(...[Lf, Lb].flatMap(L => [L[2][1], L[3][1], L[1][1] + .03]));
    const S = q => [x + dir*q[0]*h, y - (q[1] - low)*h];
    // tub de gruix variable amb corbes suaves i puntes rodones (en coordenades de pantalla)
    const tube = (pts, ws) => {
      const Q = pts.map(S), n = Q.length, W = ws.map(w => w*h/2);
      const nrm = Q.map((q,i) => { const a = Q[Math.max(0,i-1)], b = Q[Math.min(n-1,i+1)], dx = b[0]-a[0], dy = b[1]-a[1], L = Math.hypot(dx,dy)||1; return [-dy/L, dx/L]; });
      const Lp = Q.map((q,i) => [q[0] + nrm[i][0]*W[i], q[1] + nrm[i][1]*W[i]]), Rp = Q.map((q,i) => [q[0] - nrm[i][0]*W[i], q[1] - nrm[i][1]*W[i]]);
      const curve = (pts2) => { for(let i=1;i<pts2.length-1;i++){ const a = pts2[i], b = pts2[i+1]; p.quadraticCurveTo(a[0], a[1], (a[0]+b[0])/2, (a[1]+b[1])/2); } p.lineTo(pts2[pts2.length-1][0], pts2[pts2.length-1][1]); };
      const capArc = (c, r, nv, tipv) => { const aN = Math.atan2(nv[1], nv[0]), tip = Math.atan2(tipv[1], tipv[0]);
        p.arc(c[0], c[1], Math.max(.3, r), aN, aN + Math.PI, Math.cos(aN + Math.PI/2 - tip) < 0); };
      p.moveTo(Lp[0][0], Lp[0][1]); curve(Lp);
      const dE = [Q[n-1][0]-Q[n-2][0], Q[n-1][1]-Q[n-2][1]]; capArc(Q[n-1], W[n-1], nrm[n-1], dE);
      curve(Rp.slice().reverse());
      const dS = [Q[0][0]-Q[1][0], Q[0][1]-Q[1][1]]; capArc(Q[0], W[0], [-nrm[0][0], -nrm[0][1]], dS);
      p.closePath(); flush();
    };
    const circle = (c, r) => { const q = S(c); p.moveTo(q[0] + r*h, q[1]); p.arc(q[0], q[1], r*h, 0, Math.PI*2); p.closePath(); flush(); };
    // cames: la del darrere primer
    tube(Lb, [.088, .058, .04, .026]); tube(Lf, [.088, .058, .04, .026]);
    // túnica fins al genoll, que segueix la direcció mitjana de les cuixes
    const thighDir = [(Lf[1][0] + Lb[1][0])/2, (Lf[1][1] + Lb[1][1])/2], tl = Math.hypot(...thighDir)||1;
    const hem = add(hip, [thighDir[0]/tl, thighDir[1]/tl], .17);
    // forma tancada i suau (punts de control amb corbes pel mig)
    const blob = pts => { const Q = pts.map(S), n = Q.length, mid = (a,b) => [(a[0]+b[0])/2, (a[1]+b[1])/2];
      const m0 = mid(Q[n-1], Q[0]); p.moveTo(m0[0], m0[1]);
      for(let i=0;i<n;i++){ const a = Q[i], b = Q[(i+1)%n], m = mid(a,b); p.quadraticCurveTo(a[0], a[1], m[0], m[1]); }
      p.closePath(); flush(); };
    const fw = [Math.cos(lean), -Math.sin(lean)];                          // endavant, perpendicular al tors
    const tdir = [thighDir[0]/tl, thighDir[1]/tl], fh = [-tdir[1], tdir[0]];  // perpendicular a la cuixa (vora de la túnica)
    const fhf = fh[0] < 0 ? [-fh[0], -fh[1]] : fh;
    if(o.capa) blob([add(sh, fw, -.02), add(chest, fw, -.085), add(waist, fw, -.09), add(add(hem, fhf, -.13), [0,-.04], 1), add(add(hem, fhf, -.04), [0,-.03], 1), add(waist, fw, -.03), add(chest, fw, -.02)]);
    blob([add(sh, fw, .045), add(chest, fw, .068), add(waist, fw, .058), add(hem, fhf, .1), add(hem, fhf, -.115), add(waist, fw, -.062), add(chest, fw, -.07), add(sh, fw, -.05), add(add(sh, up(lean), .015), fw, 0)]);
    // braç del darrere, coll, cap i cabells, braç del davant
    tube(Ab, [.056, .044, .034, .04]);
    tube([sh, neckTop], [.06, .05]);
    circle(head, .062);
    if(o.pel === "llarg") tube([add(head, [-.03, .045], 1), add(head, [-.07, -.02], 1), add(head, [-.075, -.11], 1)], [.075, .06, .035]);
    else if(o.pel === "monyo") circle(add(head, [-.066, .035], 1), .03);
    else circle(add(head, [-.012, .012], 1), .063);
    tube(Af, [.056, .044, .034, .04]);
    // eines de l'època
    const hand = Af[3], fd = (() => { const dx = Af[3][0]-Af[2][0], dy = Af[3][1]-Af[2][1], L = Math.hypot(dx,dy)||1; return [dx/L, dy/L]; })();
    if(P.eina === "maça") circle(add(hand, fd, .03), .05);                               // percussor de pedra
    if(P.eina === "banya"){ const t0 = add(hand, fd, -.1), t1 = add(hand, fd, .16), t2 = add(t1, [fd[1], -fd[0]], -.09);
      tube([t0, hand, t1], [.022, .02, .016]); tube([add(hand, fd, .1), t2], [.016, .008]); }  // pic de banya de cérvol
    if(P.eina === "banya-espatlla"){ const t0 = add(hand, [-.2, -.02], 1), t1 = add(hand, [.12, .04], 1);
      tube([t0, hand, t1], [.022, .02, .016]); tube([add(t1, [-.03, 0], 1), add(t1, [.03, .08], 1)], [.014, .008]); }
    return {hand: S(Af[3]), shoulder: S(sh), head: S(head)};
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

    return {drawSil, silhouette, POSES};
  })();

  /* ---------- escena (metres) i passos ---------- */
  const R0 = 2.0, R1 = 2.6, ZI = 2.4, PW = 1.0, NV = 13;      // radi interior i exterior de l'arc, alçada de les impostes, amplada dels pilars, dovelles
  const STEPS = [
    {k:"pilars", t:"1 · Els pilars pugen fins a les impostes", pier:1, cind:0, nv:0, key:0, desc:0, thr:0},
    {k:"cindri", t:"2 · El cindri: un arc de fusta provisional", pier:1, cind:1, nv:0, key:0, desc:0, thr:0},
    {k:"dovelles", t:"3 · Dovelles de banda a banda, alhora", pier:1, cind:1, nv:12, key:0, desc:0, thr:0},
    {k:"clau", t:"4 · La clau tanca l'arc", pier:1, cind:1, nv:12, key:1, desc:0, thr:0},
    {k:"descintrar", t:"5 · Es treuen les falques: l'arc s'aguanta sol", pier:1, cind:0, nv:12, key:1, desc:1, thr:1}
  ];
  const mix = (a, b, k) => d3.interpolateLab(a, b)(k);
  const LIT = mix(PAPER, INK, .02), SHD = mix(PAPER, INK, .19), STONE = mix(PAPER, "#B9AE98", .25);
  const SOIL = mix(PAPER, "#8C7A5E", .3), EARTH = mix(PAPER, "#B9AE98", .16), WOOD = mix(PAPER, "#8C7A5E", .2), ROPE = mix(INK, "#8C7A5E", .35);
  const TINT = mix(PAPER, C.red, .14), TINT1 = mix(PAPER, C.red, .3);
  const hd = document.querySelector('[data-hd="how-02"]');
  let ctx = null, W = 0, H = 0, cur = 0, S = Object.assign({}, STEPS[0], {pier:.25}), T = 0, tm = null, hov = null, items = [];
  const tp = IBV.tip(el);

  // carreus dels pilars (filades alternes) i dovelles: geometria fixa
  const rnd = IBV.rng(7);
  const COURSES = d3.range(8).map(i => ({z0:i*.3, z1:(i+1)*.3, split:.25 + rnd()*.5}));
  const VOUS = d3.range(NV).map(i => { const a0 = Math.PI - i*Math.PI/NV, a1 = Math.PI - (i+1)*Math.PI/NV; return {i, a0, a1, ord: Math.min(i, NV-1-i), key: i === (NV-1)/2}; });

  function render(){
    if(!ctx) return;
    const mob = W < 560;
    const m = Math.min((W - 12)/(mob ? 11.2 : 14.6), (H - 26)/7.6);
    const ox = W/2, gy = H - 16 - 1.35*m;
    const X = x => ox + x*m, Y = z => gy - z*m, P = (x,z) => [X(x), Y(z)];
    const xl = -ox/m, xr = (W-ox)/m, ph = T/420;
    ctx.save(); ctx.clearRect(0, 0, W, H); ctx.lineJoin = "round"; ctx.lineCap = "round";
    items = [];
    const poly = Q => { ctx.beginPath(); Q.forEach((q,i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); };
    const label = (x, y, lines, o) => { o = o||{}; ctx.save(); ctx.textBaseline = "middle"; ctx.textAlign = o.anchor === "middle" ? "center" : (o.anchor || "left");
      lines.forEach((t,i) => { ctx.font = `${i ? 400 : 700} ${i ? 11.5 : 12}px ${IBV.SANS}`; ctx.lineWidth = 3.2; ctx.strokeStyle = PAPER; ctx.strokeText(t, x, y + i*14); ctx.fillStyle = i ? C.ink2 : (o.fill || INK); ctx.fillText(t, x, y + i*14); });
      ctx.restore(); };
    const leader = (x0, y0, x1, y1, col) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.strokeStyle = IBV.alpha(col || INK, .55); ctx.lineWidth = .7; ctx.stroke();
      ctx.beginPath(); ctx.arc(x0, y0, 1.8, 0, 7); ctx.fillStyle = col || INK; ctx.fill(); };
    // bloc de pedra picada: degradat, cops d'escoda i contorn
    const block = (Q, o) => { o = o||{};
      const ys = Q.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys), g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, o.on ? TINT : LIT); g.addColorStop(1, o.on ? TINT1 : SHD);
      ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a; poly(Q); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip(); const r = IBV.rng(o.seed || 1), xs = Q.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
      ctx.beginPath(); for(let i = 0; i < (x1-x0)*(y1-y0)/90; i++){ const cx = x0 + r()*(x1-x0), cy = y0 + r()*(y1-y0), rr = .6 + r()*1.1; ctx.moveTo(cx + rr, cy); ctx.arc(cx, cy, rr, 0, 2.3); }
      ctx.strokeStyle = IBV.alpha(o.on ? C.redDark : INK, .15); ctx.lineWidth = .55; ctx.stroke(); ctx.restore();
      poly(Q); ctx.strokeStyle = o.on ? C.red : INK; ctx.lineWidth = o.on ? 1.3 : .9; ctx.stroke(); ctx.restore(); };
    const beam = (x0, z0, x1, z1, d, o) => { o = o||{}; const a = P(x0,z0), b = P(x1,z1), L = Math.hypot(b[0]-a[0], b[1]-a[1]), w = Math.max(2, d*m);
      ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a; ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(b[1]-a[1], b[0]-a[0]));
      ctx.beginPath(); ctx.roundRect(0, -w/2, L, w, Math.min(w/2, 3)); ctx.fillStyle = o.on ? TINT : WOOD; ctx.fill(); ctx.strokeStyle = o.on ? C.red : INK; ctx.lineWidth = .8; ctx.stroke();
      if(w > 3.5){ ctx.beginPath(); ctx.moveTo(w*.4, -w*.12); ctx.bezierCurveTo(L*.3, w*.1, L*.6, -w*.2, L - w*.4, w*.05); ctx.strokeStyle = IBV.alpha(INK, .25); ctx.lineWidth = .5; ctx.stroke(); }
      ctx.restore(); };
    const person = (x, z, pose, o) => { o = o||{}; ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a;
      const r = GENT.drawSil(ctx, X(x), Y(z), (o.h || 1.68)*m, pose, o.ph || 0, o.dir || 1, o.col || mix(INK, PAPER, o.back ? .42 : .05), {pel:o.pel || "curt", capa:o.capa});
      ctx.restore(); return r; };

    /* 1 · perfil llunyà i tall del terreny amb les fonamentacions */
    ctx.beginPath(); for(let x = xl; x <= xr; x += .4){ const z = 1.1 + .3*Math.sin(x*.33 + .6) + .15*Math.sin(x*.9); x === xl ? ctx.moveTo(X(x), Y(z)) : ctx.lineTo(X(x), Y(z)); }
    ctx.strokeStyle = IBV.alpha(INK, .12); ctx.lineWidth = .7; ctx.stroke();
    const zb = -1.3, gg = ctx.createLinearGradient(0, Y(0), 0, Y(zb));
    gg.addColorStop(0, EARTH); gg.addColorStop(.7, EARTH); gg.addColorStop(1, IBV.alpha(EARTH, 0));
    ctx.fillStyle = gg; ctx.fillRect(0, Y(0), W, Y(zb) - Y(0));
    ctx.beginPath(); ctx.moveTo(0, Y(0)); for(let x = xl; x <= xr + .3; x += .3) ctx.lineTo(X(x), Y(-.22 - .05*Math.sin(x*2.1))); ctx.lineTo(W, Y(0)); ctx.closePath(); ctx.fillStyle = SOIL; ctx.fill();
    const rs = IBV.rng(3); ctx.beginPath(); for(let i = 0; i < 70; i++){ const x = xl + rs()*(xr-xl), z = -.4 - rs()*.8, c = P(x,z), r = (.03 + rs()*.06)*m; ctx.moveTo(c[0] + r, c[1]); ctx.ellipse(c[0], c[1], r, r*.7, rs(), 0, 7); }
    ctx.fillStyle = IBV.alpha(INK, .22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(W, Y(0)); ctx.strokeStyle = INK; ctx.lineWidth = 1.05; ctx.stroke();
    // gespa (verd de la natura) a banda i banda
    ctx.beginPath(); for(let x = xl; x < xr; x += .12){ if(Math.abs(x) < 3.25 && Math.abs(x) > 1.75) continue; ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x+.12), Y(0)); }
    ctx.strokeStyle = C.green; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.beginPath(); const rt = IBV.rng(9); for(let x = xl; x < xr; x += .2 + rt()*.3){ if(Math.abs(x) < 3.25 && Math.abs(x) > 1.75) continue; const hh = (.08 + rt()*.12)*m, b0 = X(x), b1 = Y(0);
      ctx.moveTo(b0 - 2, b1); ctx.quadraticCurveTo(b0 - 2.5, b1 - hh*.5, b0 - 3.8, b1 - hh*.8); ctx.moveTo(b0, b1); ctx.lineTo(b0 + .5, b1 - hh); ctx.moveTo(b0 + 2, b1); ctx.quadraticCurveTo(b0 + 2.6, b1 - hh*.5, b0 + 3.8, b1 - hh*.7); }
    ctx.strokeStyle = C.greenDark; ctx.lineWidth = .7; ctx.stroke();

    /* 2 · pilars: fonament sota terra i filades fins a les impostes */
    [-1, 1].forEach(sd => {
      const xa = sd < 0 ? -(R1 + .35) : R0 - .25, xb = sd < 0 ? -(R0 - .25) : R1 + .35;
      const fq = [P(xa - .2, 0), P(xb + .2, 0), P(xb + .2, -.9), P(xa - .2, -.9)];
      block(fq, {seed: 5 + sd, a: .95});
      const hTop = ZI*S.pier;
      COURSES.forEach((c, i) => { if(c.z0 >= hTop - .01) return; const z1 = Math.min(c.z1, hTop), sp = xa + (i%2 ? c.split : 1 - c.split)*(xb - xa);
        block([P(xa, c.z0), P(sp, c.z0), P(sp, z1), P(xa, z1)], {seed: i*7 + sd, on: hov === "pilar"});
        block([P(sp, c.z0), P(xb, c.z0), P(xb, z1), P(sp, z1)], {seed: i*11 + sd, on: hov === "pilar"}); });
      if(S.pier > .98){ block([P(xa - .12, ZI - .02), P(xb + .12, ZI - .02), P(xb + .12, ZI + .16), P(xa - .12, ZI + .16)], {seed: 40 + sd, on: hov === "pilar"}); }
      items.push({k:"pilar", Q:[P(xa, 0), P(xb, 0), P(xb, ZI + .16), P(xa, ZI + .16)]});
    });
    const zs = ZI + .16;                                   // naixement de l'arc

    /* 3 · cindri: costelles, puntals i falques a la base dels puntals */
    const drop = .25*S.desc, cA = Math.max(S.cind, S.desc) * (1 - .4*S.desc);
    if(cA > .02){
      const zc = zs - drop, on = hov === "cindri";
      ctx.save(); ctx.globalAlpha = cA;
      // costella corbada (dues línies) amb el folre de taulons a sobre
      ctx.beginPath(); ctx.arc(X(0), Y(zc), (R0 - .04)*m, Math.PI, 2*Math.PI); ctx.arc(X(0), Y(zc), (R0 - .3)*m, 2*Math.PI, Math.PI, true); ctx.closePath();
      ctx.fillStyle = on ? TINT : WOOD; ctx.fill(); ctx.strokeStyle = on ? C.red : INK; ctx.lineWidth = .85; ctx.stroke();
      ctx.beginPath();
      for(let i = 0; i <= 26; i++){ const a = Math.PI*(1 + i/26), x0 = X(0) + Math.cos(a)*(R0-.04)*m, y0 = Y(zc) + Math.sin(a)*(R0-.04)*m, x1 = X(0) + Math.cos(a)*(R0-.3)*m, y1 = Y(zc) + Math.sin(a)*(R0-.3)*m; ctx.moveTo(x0, y0); ctx.lineTo(x0 + (x1-x0)*.25, y0 + (y1-y0)*.25); }
      ctx.strokeStyle = IBV.alpha(INK, .35); ctx.lineWidth = .5; ctx.stroke();
      // tirant, pendolo i tornapuntes
      beam(-R0 + .1, zc + .05, R0 - .1, zc + .05, .16, {on});
      beam(0, zc + .05, 0, zc + R0 - .3, .14, {on});
      [-1, 1].forEach(sd => { beam(sd*.05, zc + .3, sd*(R0 - .55)*Math.cos(Math.PI/4), zc + (R0 - .3)*Math.sin(Math.PI/4), .11, {on}); beam(sd*.9, zc + .05, sd*(R0 - .32)*Math.cos(Math.PI/7), zc + (R0 - .32)*Math.sin(Math.PI/7), .1, {on}); });
      // puntals fins a terra, amb un parell de falques a la base
      [-1, 1].forEach(sd => { const x = sd*(R0 - .35); beam(x, .28 - drop*.3, x, zc + .05, .2, {on});
        const fx = X(x), fy = Y(0), w = .5*m, h = .26*m, slide = S.desc*.35*m*sd;
        ctx.beginPath(); ctx.moveTo(fx - w/2, fy); ctx.lineTo(fx + w/2, fy); ctx.lineTo(fx - w/2, fy - h/2); ctx.closePath(); ctx.fillStyle = WOOD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx - w/2 + slide, fy - h/2 - drop*.3*m); ctx.lineTo(fx + w/2 + slide, fy - h/2 - drop*.3*m); ctx.lineTo(fx + w/2 + slide, fy - h - drop*.3*m*0); ctx.closePath(); ctx.fillStyle = mix(WOOD, PAPER, .3); ctx.fill(); ctx.stroke();
        items.push({k:"falques", Q:[[fx - w, fy], [fx + w, fy], [fx + w, fy - h - 4], [fx - w, fy - h - 4]]}); });
      items.push({k:"cindri", Q:d3.range(0, 1.0001, .05).map(t => P(-R0*Math.cos(Math.PI*t), zc + R0*Math.sin(Math.PI*t))).concat([P(R0, zc), P(-R0, zc)])});
      ctx.restore();
    }

    /* 4 · dovelles: de banda a banda, alhora; la clau al final */
    const placed = S.nv/2;
    VOUS.forEach(v => {
      let a = 0;
      if(v.key) a = S.key; else a = Math.max(0, Math.min(1, placed - v.ord));
      if(a <= .01) return;
      const lift = (1 - a)*1.2, cx = X(0), cy = Y(zs);
      const pt = (ang, r) => [cx + Math.cos(ang)*r*m, cy - Math.sin(ang)*r*m - lift*m];
      const Q = [pt(v.a0, R0), pt(v.a0, R1), pt(v.a1, R1), pt(v.a1, R0)];
      const on = hov === "dovella-" + v.i || (v.key && (cur === 3 || hov === "clau"));
      block(Q, {seed: 100 + v.i, on, a: Math.min(1, a*1.6)});
      items.push({k: v.key ? "clau" : "dovella-" + v.i, Q, v});
    });

    /* 5 · línia de pressions i empentes (pas 5) */
    if(S.thr > .02){
      ctx.save(); ctx.globalAlpha = S.thr;
      ctx.beginPath(); const Rm = (R0 + R1)/2;
      for(let t = 0; t <= 1.0001; t += .02){ const a = Math.PI*(1 - t), r = Rm + .12*Math.sin(Math.PI*t*2)*0, p = [X(0) + Math.cos(a)*r*m, Y(zs) - Math.sin(a)*r*m*.98]; t ? ctx.lineTo(...p) : ctx.moveTo(...p); }
      [-1, 1].forEach(sd => { ctx.moveTo(X(sd*Rm), Y(zs)); ctx.lineTo(X(sd*(Rm + .35)), Y(.15)); });
      ctx.strokeStyle = C.red; ctx.lineWidth = 1.6; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
      [-1, 1].forEach(sd => { const a = P(sd*(Rm + .35), .15), b = P(sd*(Rm + .55), -.35);
        ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); const an = Math.atan2(b[1]-a[1], b[0]-a[0]);
        ctx.lineTo(b[0] - 7*Math.cos(an - .45), b[1] - 7*Math.sin(an - .45)); ctx.moveTo(...b); ctx.lineTo(b[0] - 7*Math.cos(an + .45), b[1] - 7*Math.sin(an + .45));
        ctx.strokeStyle = C.red; ctx.lineWidth = 1.4; ctx.stroke(); });
      ctx.restore();
    }

    /* 6 · colla de cada pas */
    const k = cur;
    if(k === 0){ person(-5.4, 0, "porta", {ph, dir: 1, capa: true}); person(4.5, 0, "picar", {ph: ph*2, dir: -1, pel: "llarg"});
      block([P(3.55, 0), P(4.05, 0), P(4.05, .32), P(3.55, .32)], {seed: 77}); if(!mob) person(-4.2, 0, "mira", {dir: 1, back: true, pel: "monyo"}); }
    if(k === 1){ person(-5.2, 0, "porta", {ph, dir: 1}); person(4.6, 0, "mira", {dir: -1, pel: "monyo", capa: true}); person(-.8, 0, "picar", {ph: ph*2, dir: -1, h: 1.62}); }
    if(k === 2 || k === 3){
      // corriola a dalt d'un pal i una corda que puja la peça; dos picapedrers sobre els pilars
      const px = -4.3, pz = 5.9; beam(px, 0, px, pz, .16); beam(px, pz - .05, px + 1.1, pz - .05, .12);
      const pu = P(px + 1.0, pz - .2); ctx.beginPath(); ctx.arc(pu[0], pu[1], .14*m, 0, 7); ctx.fillStyle = WOOD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
      const hang = k === 3 ? [0, zs + R1 + .7 - S.key*.0] : [px + 1.0 + .15, 3.9 + .3*Math.sin(T/900)];
      const r = person(-5.6, 0, "estira", {ph, dir: -1});
      ctx.beginPath(); ctx.moveTo(...r.hand); ctx.lineTo(pu[0] - .12*m, pu[1]); ctx.moveTo(pu[0] + .1*m, pu[1] - .05*m);
      if(k === 3){ ctx.lineTo(X(0), Y(pz - .2)); ctx.lineTo(X(0), Y(zs + R1 + .05)); } else ctx.lineTo(X(hang[0]), Y(hang[1] + .45));
      ctx.strokeStyle = ROPE; ctx.lineWidth = 1.3; ctx.stroke();
      if(k === 2){ const hx = hang[0], hz = hang[1]; block([P(hx - .3, hz), P(hx + .3, hz), P(hx + .22, hz + .45), P(hx - .22, hz + .45)], {seed: 55}); }
      person(-R1 - .35 + .45, zs, "palanca", {dir: 1, h: 1.6}); person(R0 + .55, zs, "palanca", {dir: -1, h: 1.6, pel: "llarg"});
    }
    if(k === 3) beam(-4.3 + 1.0, 5.85, 0, 5.85, .1);
    if(k === 4){ person(-.75, 0, "picar", {ph: ph*2, dir: -1, h: 1.62}); person(.75, 0, "picar", {ph: ph*2 + 1.4, dir: 1, h: 1.62, pel: "llarg"});
      person(4.8, 0, "mira", {dir: -1, pel: "monyo", capa: true}); person(5.5, 0, "dret", {dir: -1, back: true, h: 1.55}); }
    // persona d'escala fixa
    const xs = Math.min(mob ? 4.6 : 6.6, xr - .7); if(k !== 4 || !mob){ person(-Math.min(mob ? 4.6 : 6.6, -xl - .7), 0, "dret", {dir: 1, col: INK, pel: "monyo"}); }

    /* 7 · rètols */
    const big = !mob;
    if(k === 0){ const a = P(-R1 - .35, 1.4); leader(a[0], a[1], a[0] - (big ? 60 : 20), a[1] - 40); label(a[0] - (big ? 64 : 24), a[1] - 44, big ? ["Pilars de carreus", "filades alternes, juntes trencades"] : ["Pilars"], {anchor:"end"});
      const f = P(R0 + .6, -.5); leader(f[0], f[1], f[0] + (big ? 40 : 18), f[1] + 18); label(f[0] + (big ? 44 : 22), f[1] + 18, ["Fonament"]); }
    if(k === 1){ const a = P(0, zs + R0*.7); leader(a[0], a[1], a[0] + (big ? 60 : 30), a[1] - 46); label(a[0] + (big ? 64 : 34), a[1] - 50, big ? ["Cindri", "costelles de fusta que fan de motlle"] : ["Cindri"]);
      const f = P(-(R0 - .35), .1); leader(f[0], f[1], f[0] + 34, f[1] - 30); label(f[0] + 38, f[1] - 34, big ? ["Falques", "permetran baixar-lo al final"] : ["Falques"]); }
    if(k === 2){ const v = VOUS[9], a = P(Math.cos((v.a0 + v.a1)/2)*R1, zs + Math.sin((v.a0 + v.a1)/2)*R1); leader(a[0], a[1], a[0] + (big ? 50 : 14), a[1] - 34); label(a[0] + (big ? 54 : 18), a[1] - 38, big ? ["Dovelles", "a parells, per no desequilibrar el cindri"] : ["A parells"]); }
    if(k === 3){ const a = P(.3, zs + R1 + .1); if(big){ leader(a[0], a[1], a[0] + 22, a[1] - 22, C.red); label(a[0] + 26, a[1] - 26, ["La clau", "l'última peça, al capdamunt"], {fill: C.red}); }
      else { const b = P(-.3, zs + R1 + .1); leader(b[0], b[1], b[0] - 10, b[1] - 34, C.red); label(b[0] - 13, b[1] - 40, ["La clau"], {fill: C.red, anchor: "end"}); } }
    if(k === 4){ const a = P(0, zs + (R0 + R1)/2); leader(a[0] + 2, a[1] + 2, a[0] + (big ? 70 : 30), a[1] - 40, C.red); label(a[0] + (big ? 74 : 34), a[1] - 44, big ? ["Línia de pressions", "l'arc treballa a compressió"] : ["Compressió"], {fill: C.red});
      const e = P(R1 + .2, .2); label(e[0] + 10, e[1] + 22, big ? ["Empenta lateral", "la reben els pilars"] : ["Empenta"], {fill: C.red}); }

    /* 8 · lupes de detall */
    const R = mob ? Math.min(50, W*.14) : Math.min(80, W*.08);
    const lupa = (jx, jy, cx, cy, draw, t) => { ctx.beginPath(); ctx.moveTo(jx, jy); const an = Math.atan2(jy - cy, jx - cx); ctx.lineTo(cx + R*Math.cos(an), cy + R*Math.sin(an));
      ctx.strokeStyle = IBV.alpha(C.red, .7); ctx.lineWidth = .8; ctx.stroke(); ctx.beginPath(); ctx.arc(jx, jy, 5, 0, 7); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = PAPER; ctx.fill(); ctx.clip(); draw(cx, cy, R/60); ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.strokeStyle = C.red; ctx.lineWidth = 1.1; ctx.stroke();
      t.forEach((s, i) => label(cx, cy + R + 13 + i*14, [s], {anchor: "middle", fill: i ? C.ink2 : INK})); };
    if(k === 3){
      lupa(X(0), Y(zs + R1 - .2), mob ? Math.min(W - R - 8, W - 62) : X(4.4), Y(zs + R1 - .2) + (mob ? R*.35 : 0), (cx, cy, s) => {
        // clau i dues dovelles: les juntes apunten al centre de l'arc
        const c0 = [cx, cy + 120*s], pt = (a, r) => [c0[0] + Math.cos(a)*r*s, c0[1] - Math.sin(a)*r*s];
        const segs = [[Math.PI*.66, Math.PI*.56], [Math.PI*.56, Math.PI*.44], [Math.PI*.44, Math.PI*.34]];
        segs.forEach(([a0, a1], i) => { const Q = [pt(a0, 82), pt(a0, 128), pt(a1, 128), pt(a1, 82)]; block(Q, {seed: 300 + i, on: i === 1}); });
        ctx.setLineDash([2, 3]); ctx.beginPath(); [Math.PI*.56, Math.PI*.44].forEach(a => { ctx.moveTo(...pt(a, 82)); ctx.lineTo(...pt(a, 22)); }); ctx.strokeStyle = C.ink2; ctx.lineWidth = .7; ctx.stroke(); ctx.setLineDash([]);
        const tipx = pt(Math.PI/2, 24); ctx.beginPath(); ctx.arc(tipx[0], tipx[1], 2, 0, 7); ctx.fillStyle = C.ink2; ctx.fill();
      }, big ? ["Juntes radials", "la clau fa de tascó"] : ["Juntes radials"]);
    }
    if(k === 4){
      const f = P(-(R0 - .35), .1);
      lupa(f[0], f[1], mob ? R + 8 : X(-4.6), Y(3.3), (cx, cy, s) => {
        // dues falques: es fa lliscar la de dalt i el puntal baixa
        const w = 70*s, h = 22*s, sl = S.desc*16*s, x0 = cx - w/2, y0 = cy + 18*s;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + w, y0); ctx.lineTo(x0, y0 - h); ctx.closePath(); ctx.fillStyle = WOOD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0 + sl, y0 - h + S.desc*4*s); ctx.lineTo(x0 + w + sl, y0 - h + S.desc*4*s); ctx.lineTo(x0 + w + sl, y0 - h - h + S.desc*4*s); ctx.closePath();
        ctx.fillStyle = mix(WOOD, PAPER, .3); ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 1.1; ctx.stroke();
        const px = cx + 6*s; ctx.beginPath(); ctx.rect(px - 8*s, y0 - h - h - 46*s + S.desc*4*s, 16*s, 46*s); ctx.fillStyle = WOOD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 48*s, y0 - h*1.5); ctx.lineTo(cx - 30*s, y0 - h*1.5); ctx.moveTo(cx - 34*s, y0 - h*1.5 - 4*s); ctx.lineTo(cx - 30*s, y0 - h*1.5); ctx.lineTo(cx - 34*s, y0 - h*1.5 + 4*s);
        ctx.moveTo(px + 16*s, y0 - h - 40*s); ctx.lineTo(px + 16*s, y0 - h - 22*s); ctx.moveTo(px + 12*s, y0 - h - 26*s); ctx.lineTo(px + 16*s, y0 - h - 22*s); ctx.lineTo(px + 20*s, y0 - h - 26*s);
        ctx.strokeStyle = C.ink2; ctx.lineWidth = .9; ctx.stroke();
      }, big ? ["Falques", "lliscar-les fa baixar el cindri"] : ["Falques"]);
    }
    ctx.restore();
    if(hd) hd.textContent = STEPS[cur].t;
  }

  const INFO = {
    pilar: "<b>Pilar</b> · carreus en filades alternes; aguanta el pes i l'empenta lateral de l'arc",
    cindri: "<b>Cindri</b> · arc provisional de fusta que fa de motlle mentre l'arc no està tancat",
    falques: "<b>Falques</b> · dues peces de fusta en tascó; en fer-les lliscar, el cindri baixa i es pot treure",
    clau: "<b>Clau</b> · l'última dovella, al capdamunt: tanca l'arc i el posa en compressió"
  };
  function pick(px, py){
    for(let i = items.length - 1; i >= 0; i--){ const it = items[i]; if(d3.polygonContains(it.Q, [px, py])) return it; }
    return null;
  }
  function go(i){
    const from = Object.assign({}, S), to = STEPS[i]; cur = i;
    document.querySelectorAll('[data-seg="how-02"] button').forEach(b => b.setAttribute("aria-pressed", +b.dataset.k === i ? "true" : "false"));
    if(tm) tm.stop();
    if(IBV.reduced || !ctx){ S = Object.assign({}, to); render(); return; }
    const it = d3.interpolateObject(from, to);
    tm = d3.timer(e => { const k = Math.min(1, e/1300); S = it(d3.easeCubicInOut(k)); if(k >= 1){ S = Object.assign({}, to); tm.stop(); tm = null; } render(); });
  }
  document.querySelectorAll('[data-seg="how-02"] button').forEach(b => b.addEventListener("click", () => go(+b.dataset.k)));
  IBV.mount(el, (container, w) => {
    W = w; const mm = (w - 12)/(w < 560 ? 11.2 : 14.6); H = Math.round(Math.max(280, Math.min(mm*7.6 + 26, 580)));
    const r = IBV.canvas(container, W, H, "Alçat lateral a escala de com es construeix un arc de mig punt: els pilars, el cindri de fusta, les dovelles col·locades de banda a banda, la clau i el descintrat.");
    ctx = r.ctx;
    IBV.hover(r.c, (ev, [px, py]) => { const it = pick(px, py); const k = it ? (it.k.startsWith("dovella") ? it.k : it.k) : null;
      if(k !== hov){ hov = k; render(); }
      if(!it) return tp.hide();
      if(it.k.startsWith("dovella")) tp.show(`<b>Dovella ${it.v.i + 1} de ${NV}</b> · es talla en tascó perquè les juntes apuntin al centre de l'arc`);
      else tp.show(INFO[it.k]); }, () => { hov = null; tp.hide(); render(); });
    render();
  });
  // entrada animada: els pilars pugen; després, el moviment lent de la feina mentre és a la vista
  IBV.onView(el, still => { if(still){ S = Object.assign({}, STEPS[0]); render(); return; } go(0); });
  IBV.loop(el, t => { T = t; if(!tm) render(); });
})();
