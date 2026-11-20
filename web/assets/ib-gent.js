/* Inspired by Magazine — figures humanes de silueta (component del sistema, abans dins de la maqueta de Stonehenge).
   Gent de perfil dibuixada com les figures d'una maqueta d'arquitectura: proporcions humanes, roba i cabell, i poses
   que són feines concretes (estirar una corda, palanca, picar amb un percussor, cavar amb un pic de banya…).
   Ús: IBGENT.drawSil(ctx, x, y, alçadaPx, pose, fase, dir, color, {pel, capa}) en canvas;
       IBGENT.silPaths(...) torna una llista de camins SVG (un per peça); IBGENT.POSES llista les poses.
   Requereix d3 7.9.0 i ib-viz.js. Documentació: research/sistema-infografic.md (components). */
(function(){
  "use strict";
  /* ---------- 4. Figures humanes (silueta plena, de perfil) ---------- */
  // Escriu la silueta com a formes tancades sobre qualsevol «context de camí» (canvas o d3.path), per omplir-la d'un sol cop.
  // x, y: peus; h: alçada en px; pose: "dret" | "camina" | "estira" | "palanca" | "mira"; ph: fase del pas; dir: 1 cap a la dreta, -1 cap a l'esquerra
  // Gent del Neolític de perfil, dibuixada com les figures d'una maqueta d'arquitectura: esquelet amb proporcions humanes
  // (cap = 1/8 de l'alçada), membres que s'afuen amb corbes suaus, túnica, capa i cabell. Cada pose és una feina de l'època.
  // o = {pel:"llarg"|"monyo"|"curt", capa:bool}
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
    ctx.fillStyle = col || IBV.C.ink; ctx.beginPath();
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

  window.IBGENT = {POSES, silhouette, drawSil, silPaths};
})();
