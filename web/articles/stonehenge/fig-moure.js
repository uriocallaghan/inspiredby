/* «Per què van aixecar Stonehenge?» · moure */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, S3 = window.SH3D, C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C);
  const {segBind, ctext, clamp} = window.SHA;
  const F0 = IBV.fmt(",.0f"), F1 = IBV.fmt(",.1f");

  /* =========================================================================
     V4 · QUANTA GENT CAL PER MOURE UNA PEDRA (PART-01 amb figures de línia)
     Escena obliqua en gravat: la pedra a escala sobre un trineu de roure, el camí (troncs fixos a UCL,
     carril de bigues greixades a la BBC) i tantes figures com persones donaria el ritme de l'experiment,
     repartides en cordes a banda i banda del camí. A sota, totes les pedres amb els dos ritmes.
     ========================================================================= */
  (function initMoure(){
    const el = document.getElementById("mou-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el), outN = fig.querySelector("#mou-n"), outS = fig.querySelector("#mou-s");
    const STONES = D.moure.pedres, RATES = D.moure.ritmes;
    // amplada de cada pedra estirada sobre el trineu (aproximada: secció dels pilars de la maqueta, 2,1 × 1,1 m;
    // Altar 4,9 × 1,0 × 0,5 m); la llargada i el gruix vénen de dades.js
    const WID = {blava: 1.2, altar: 1.0, sarsen: 2.1, p56: 2.1};
    const TONE = {blava: "blue", altar: "stone", sarsen: "fresh", p56: "fresh"};
    let cur = STONES.find(s => s.def) || STONES[0], rate = RATES[0];
    let W = 0, H = 0, ctx = null, t0 = performance.now(), mob = false, ppm = 10, hov = null, lastT = 0, svgApi = null;
    const now = () => performance.now();

    const setStone = k => { cur = STONES.find(s => s.id===k); t0 = now(); hov = null;
      fig.querySelectorAll(".seg.mou-p button").forEach(b => b.setAttribute("aria-pressed", b.dataset.k===k ? "true" : "false")); upd(); };
    segBind(fig.querySelector(".seg.mou-p"), "k", k => setStone(k));
    segBind(fig.querySelector(".seg.mou-r"), "k", k => { rate = RATES.find(r => r.id===k); t0 = now(); hov = null; upd(); });
    const nOf = (s, r) => Math.round(s.t*r.k);
    function upd(){
      const n = nOf(cur, rate);
      outN.textContent = `≈ ${F0(n)} persones`;
      outS.textContent = `${cur.nom}, ${F0(cur.t)} t · ${rate.sub}`;
      tp.show(`<b>${cur.nom}</b> · ${F0(n)} persones si cada tona en demana ${F1(rate.k)} (${rate.font})`);
      if(svgApi) svgApi.update();
      if(ctx) retarget();
      draw(lastT);
    }

    /* ---------- projecció obliqua: x al llarg del camí (cap a Stonehenge, a la dreta), y amunt, z en profunditat ---------- */
    const KX = .42, KZ = .6;
    let OX = 0, GY = 0;
    const P = (x, y, z) => [OX + (x + z*KX)*ppm, GY - (y + z*KZ)*ppm];
    const poly = pts => { ctx.beginPath(); pts.forEach((p,i) => { const q = P(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); };

    // disposició de les cordes per a una pedra i un ritme (la mateixa escala per a totes les tries)
    function layout(s, r){
      const n = nOf(s, r), per = mob ? 16 : 30, ropes = Math.max(1, Math.ceil(n/per)), perRope = Math.ceil(n/ropes);
      const gapZ = mob ? 1.2 : 1.9, gapX = mob ? .9 : 1.0, w = WID[s.id];
      const zs = d3.range(ropes).map(i => w/2 + (i - (ropes-1)/2)*gapZ);
      const x0 = s.l + 3.2;                               // on comencen les files de tiradors (davant del trineu)
      const crews = zs.map((z, i) => { const cnt = Math.min(perRope, n - i*perRope); return {i, z, cnt, x0: x0 + Math.abs(i - (ropes-1)/2)*gapZ*(mob ? .35 : .7) - (z - w/2)*KX*.75 + ((i*7)%3)*.3}; }).filter(c => c.cnt > 0);
      return {n, ropes, perRope, crews, gapX, w};
    }
    // escala fixa: la pitjor combinació (Pedra 56 amb el ritme més exigent) ha de cabre
    // enquadrament per a cada tria: pedra i persones sempre a la mateixa escala entre elles; la càmera s'hi acosta o s'allunya
    function viewFor(st, r){
      const L = layout(st, r), zMax = L.crews[L.crews.length-1].z, zMin = Math.min(-1.2, L.crews[0].z);
      const xR = d3.max(L.crews, c => c.x0 + (c.cnt - 1)*L.gapX + c.z*KX) + 2.6,   /* hi cap la punta de corda que queda a terra */ xL = Math.min(-1.8, zMin*KX - 1.5);
      const tall = Math.max(1.9, st.h + 1.05), dz = (zMax - zMin)*KZ;
      const pw = (W - 16)/(xR - xL), ph = (H - 48)/(dz + tall);
      const k = Math.min(pw, ph, mob ? 30 : 52);
      const ox = 8 - xL*k + Math.max(0, (W - 16 - (xR - xL)*k)/2);
      const used = (dz + tall)*k + 36, gy = H - 12 + zMin*KZ*k - Math.max(0, (H - used)/2);
      return {ppm: k, ox, gy};
    }
    let vFrom = null, vTo = null, vT = 0;
    function retarget(){ const v = viewFor(cur, rate); vFrom = vTo ? {ppm, ox: OX, gy: GY} : v; vTo = v; vT = now(); }
    function applyView(){
      if(!vTo) return; const u = IBV.reduced ? 1 : d3.easeCubicInOut(clamp((now() - vT)/850, 0, 1));
      ppm = vFrom.ppm + (vTo.ppm - vFrom.ppm)*u; OX = vFrom.ox + (vTo.ox - vFrom.ox)*u; GY = vFrom.gy + (vTo.gy - vFrom.gy)*u;
    }

    /* ---------- herba (verd vegetal) en coordenades del terra, que llisca quan avancen ---------- */
    const TUFT = (() => { const r = IBV.rng(31), out = []; for(let i=0;i<700;i++) out.push([r(), r(), .12 + r()*.18, r()]); return out; })();
    function grass(zA, zB, xA, xB, shift){
      ctx.beginPath();
      const span = xB - xA;
      TUFT.forEach(([u, v, hh, k]) => {
        const z = zA + v*(zB - zA); if(z > -1 && z < (cur ? WID[cur.id] + 1 : 3)) return;       // no sobre el camí
        let x = xA + (((u*span - shift) % span) + span) % span;
        const [sx, sy] = P(x, 0, z), h = hh*ppm*(1 + k*.4); if(k < Math.abs(z - 1)/Math.max(6, zB - 2)*.9) return;
        ctx.moveTo(sx - h*.5, sy); ctx.lineTo(sx - h*.8, sy - h*.75); ctx.moveTo(sx, sy); ctx.lineTo(sx + h*.1, sy - h); ctx.moveTo(sx + h*.5, sy); ctx.lineTo(sx + h*.9, sy - h*.7);
      });
      ctx.strokeStyle = IBV.alpha(C.vegetacioFosc, .55); ctx.lineWidth = .6; ctx.stroke();
    }

    /* ---------- camí: troncs fixos (UCL) o bigues greixades (BBC) ---------- */
    function track(w, xA, xB, shift){
      const zA = -.45, zB = w + .45, step = .95;
      if(rate.id === "ucl"){
        // troncs ajaguts de través, fixos al terra: el trineu hi llisca per sobre
        const r = .11;
        for(let x = xA + ((-shift % step) + step) % step; x < xB; x += step){
          const a = P(x, r, zA), b = P(x, r, zB), a2 = P(x, -r*.2, zA), e = P(x, 0, zA);
          ctx.beginPath(); ctx.moveTo(...P(x - r, 0, zA)); ctx.lineTo(...P(x - r, 0, zB)); ctx.lineTo(...P(x + r, 0, zB)); ctx.lineTo(...P(x + r, 0, zA)); ctx.closePath();
          ctx.fillStyle = S3.PAPER; ctx.fill();
          ctx.beginPath(); ctx.moveTo(...P(x - r, .02, zA)); ctx.lineTo(...P(x - r, .02, zB)); ctx.moveTo(...P(x + r, .02, zA)); ctx.lineTo(...P(x + r, .02, zB));
          ctx.strokeStyle = IBV.alpha(C.ink, .3); ctx.lineWidth = .55; ctx.stroke();
          // veta de la fusta
          ctx.beginPath(); ctx.moveTo(...P(x, .03, zA + .2)); ctx.lineTo(...P(x, .03, zB - .4)); ctx.strokeStyle = IBV.alpha(C.ink, .18); ctx.lineWidth = .45; ctx.stroke();
          // testa del tronc (cercle de creixement)
          ctx.beginPath(); ctx.ellipse(e[0], e[1] - r*ppm*.5, r*ppm*1.05, r*ppm*.8, 0, 0, Math.PI*2); ctx.fillStyle = S3.PAPER; ctx.fill(); ctx.strokeStyle = IBV.alpha(C.ink, .55); ctx.lineWidth = .6; ctx.stroke();
          ctx.beginPath(); ctx.arc(e[0], e[1] - r*ppm*.5, r*ppm*.35, 0, Math.PI*2); ctx.strokeStyle = IBV.alpha(C.ink, .25); ctx.lineWidth = .45; ctx.stroke();
          void a; void b; void a2;
        }
      } else {
        // carril de dues bigues longitudinals greixades sobre travesses
        for(let x = xA + ((-shift % (step*1.6)) + step*1.6) % (step*1.6); x < xB; x += step*1.6){
          poly([[x - .12, 0, zA], [x - .12, 0, zB], [x + .12, 0, zB], [x + .12, 0, zA]]);
          ctx.fillStyle = S3.PAPER; ctx.fill(); ctx.strokeStyle = IBV.alpha(C.ink, .35); ctx.lineWidth = .5; ctx.stroke();
        }
        [w*.18, w*.82].forEach(zc => {
          const hb = .18, wb = .16;
          poly([[xA, hb, zc - wb], [xB, hb, zc - wb], [xB, hb, zc + wb], [xA, hb, zc + wb]]); ctx.fillStyle = S3.PAPER; ctx.fill();
          poly([[xA, 0, zc - wb], [xB, 0, zc - wb], [xB, hb, zc - wb], [xA, hb, zc - wb]]); ctx.fillStyle = S3.PAPER; ctx.fill();
          ctx.strokeStyle = IBV.alpha(C.ink, .55); ctx.lineWidth = .6; ctx.stroke();
          // llustre del greix: una línia fina blava al cantell
          ctx.beginPath(); ctx.moveTo(...P(xA, hb, zc - wb*.2)); ctx.lineTo(...P(xB, hb, zc - wb*.2));
          ctx.strokeStyle = IBV.alpha(C.blau, .35); ctx.lineWidth = .6; ctx.stroke();
        });
      }
    }

    /* ---------- trineu de roure i pedra (acabat de sarsen picat, com la maqueta) ---------- */
    const PAL = {fresh: ["#FBFAF6", "#E7E4DC", "#CFCBC1"], stone: ["#F2F0EA", "#DCD8CE", "#BDB8AC"], blue: ["#EEF0F2", "#D6DBE2", "#B5BDC9"]};
    const DOTS = (() => { const r = IBV.rng(5), out = []; for(let i=0;i<260;i++) out.push([r(), r(), r()]); return out; })();
    function sledge(s, w, slide){
      const L = s.l + .7, xa = -.35 + slide, xb = xa + L, hR = .3;
      // patins (dues bigues) amb la punta de davant aixecada
      [-.05, w - .25].forEach(z0 => {
        const z1 = z0 + .3;
        const prof = [[xa, 0], [xb - .5, 0], [xb, .25], [xb + .25, .55], [xb + .1, .62], [xb - .2, hR], [xa, hR]];
        ctx.beginPath(); prof.forEach(([x,y],i) => { const q = P(x, y, z0); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
        ctx.fillStyle = S3.PAPER; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = .75; ctx.stroke();
        poly([[xa, hR, z0], [xb - .2, hR, z0], [xb - .2, hR, z1], [xa, hR, z1]]); ctx.fillStyle = S3.PAPER; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(...P(xa + .2, hR*.5, z0)); ctx.lineTo(...P(xb - .6, hR*.5, z0)); ctx.strokeStyle = IBV.alpha(C.ink, .2); ctx.lineWidth = .45; ctx.stroke();
      });
      // travessers
      for(let x = xa + .3; x < xb - .4; x += Math.max(.8, L/6)){
        poly([[x, hR, -.15], [x + .22, hR, -.15], [x + .22, hR, w + .15], [x, hR, w + .15]]);
        ctx.fillStyle = S3.PAPER; ctx.fill(); ctx.strokeStyle = IBV.alpha(C.ink, .7); ctx.lineWidth = .6; ctx.stroke();
      }
      return {xa, xb, top: hR + .22};
    }
    function stone(s, w, slide, base, hl){
      const l = s.l, h = s.h, x0 = .0 + slide, pal = PAL[TONE[s.id]], r = Math.min(.25, h*.3);
      const xL = x0, xR = x0 + l, y0 = base, y1 = base + h;
      // forma una mica orgànica: cantells arrodonits, punta de dalt més estreta (pedra picada, no pas un prisma)
      const near = [[xL + r*.6, y0, 0], [xR - r*.4, y0, 0], [xR, y0 + r, 0], [xR - r*.3, y1 - r*.2, 0], [xR - r*1.3, y1, 0], [xL + r*1.1, y1 - .02, 0], [xL, y1 - r*1.2, 0], [xL + .02, y0 + r*.8, 0]];
      const far = near.map(([x,y,z]) => [x, y, w]);
      const smooth = pts => { const Q = pts.map(p => P(...p)), n = Q.length; ctx.beginPath();
        const m = (a,b) => [(a[0]+b[0])/2, (a[1]+b[1])/2], s0 = m(Q[n-1], Q[0]); ctx.moveTo(...s0);
        for(let i=0;i<n;i++){ const a = Q[i], b = Q[(i+1)%n], mm = m(a,b); ctx.quadraticCurveTo(a[0], a[1], mm[0], mm[1]); } ctx.closePath(); };
      // silueta total (cara llunyana + cara propera units): casc convex dels punts
      const hull = d3.polygonHull(near.concat(far).map(p => P(...p)));
      const outline = () => { ctx.beginPath(); hull.forEach((q,i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); };
      // ombra al terra (llum del NO)
      ctx.beginPath(); [[xL, 0, -.2], [xR + .6, 0, -.2], [xR + 1.2, 0, w + .2], [xL + .3, 0, w + .4]].forEach((p,i) => { const q = P(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.closePath(); ctx.fillStyle = IBV.alpha(C.ink, .06); ctx.fill();
      // cos: degradat de la llum (part de dalt clara, de baix fosca)
      outline();
      const gT = P(xL, y1, w), gB = P(xL, y0, 0), g = ctx.createLinearGradient(gT[0], gT[1], gB[0], gB[1]);
      g.addColorStop(0, pal[0]); g.addColorStop(.45, pal[1]); g.addColorStop(1, pal[2]);
      ctx.fillStyle = hl ? S3.TINT : g; ctx.fill();
      // cara de dalt, una mica més clara
      smooth([[xL + r, y1 - .02, .15], [xR - r*1.3, y1, .15], [xR - r*.6, y1 - .02, w*.5], [xR - r*1.2, y1, w - .1], [xL + r*1.2, y1 - .02, w - .1], [xL + r*.4, y1 - .03, w*.5]]);
      ctx.fillStyle = IBV.alpha(hl ? "#fff" : pal[0], .8); ctx.fill();
      // cara de la testa (a l'ombra), suau
      ctx.save(); outline(); ctx.clip();
      const e0 = P(xR - r*.4, y0, 0), e1 = P(xR + .4, y0, w), ge = ctx.createLinearGradient(e0[0], e0[1], e1[0], e1[1]);
      ge.addColorStop(0, "rgba(0,0,0,0)"); ge.addColorStop(1, IBV.alpha(C.ink, .12));
      ctx.fillStyle = ge; ctx.fillRect(e0[0] - 2, P(0, y1 + .5, w)[1], e1[0] - e0[0] + 30, H);
      // cops de percussor (el picat amb maces de pedra)
      const [ax, ay] = P(xL, y0, 0), [bx, by] = P(xR, y1, w), nd = Math.round(clamp((bx - ax)*(ay - by)/90, 20, 260));
      for(let i=0;i<nd;i++){ const [u, v, k] = DOTS[i];
        ctx.beginPath(); ctx.arc(ax + u*(bx - ax), by + v*(ay - by), .45 + k*.6, 0, Math.PI*2);
        ctx.fillStyle = IBV.alpha(C.ink, .07 + k*.08); ctx.fill(); }
      ctx.restore();
      // aresta entre la cara de davant i la de dalt
      ctx.beginPath(); ctx.moveTo(...P(xL + r*1.1, y1 - .02, 0)); ctx.quadraticCurveTo(...P((xL + xR)/2, y1 + .03, 0), ...P(xR - r*1.3, y1, 0));
      ctx.strokeStyle = IBV.alpha(C.ink, .3); ctx.lineWidth = .55; ctx.stroke();
      outline(); ctx.strokeStyle = hl ? C.vermell : C.ink; ctx.lineWidth = hl ? 1.3 : .9; ctx.lineJoin = "round"; ctx.stroke();
      // cordes que lliguen la pedra al trineu
      [xL + l*.22, xL + l*.78].forEach(x => {
        ctx.beginPath(); ctx.moveTo(...P(x, base - .05, 0)); ctx.lineTo(...P(x + .05, y1 + .01, 0)); ctx.lineTo(...P(x + .1, y1 + .01, w));
        ctx.strokeStyle = IBV.alpha("#7A5A3A", .75); ctx.lineWidth = 1.1; ctx.stroke();
      });
      return {hull, front: [xR + .45, base + .15, w/2]};
    }

    /* ---------- dibuix ---------- */
    function draw(t){
      if(!ctx) return; lastT = t; applyView();
      ctx.clearRect(0, 0, W, H);
      const s = cur, Lay = layout(s, rate), w = Lay.w;
      const el = IBV.reduced ? 1e9 : now() - t0;
      const slideIn = IBV.reduced ? 0 : -(1 - d3.easeCubicOut(clamp(el/900, 0, 1)))*2.5;
      const shift = 0;   // escena quieta: la gent fa força, però no s'anima cap pas
      const xEnd = (W - OX)/ppm + 2, xStart = -OX/ppm - 4;
      const zMin = Lay.crews[0].z, zMax = Lay.crews[Lay.crews.length-1].z;
      grass(Math.min(-4, zMin - 2), Math.max(w + 4, zMax + 2), xStart, xEnd, shift);
      track(w, xStart, xEnd, shift);
      // persones que han d'aparèixer (d'una en una en entrar o canviar)
      const appear = IBV.reduced ? Lay.n : Math.min(Lay.n, Math.floor(el/5));
      // cordes i tiradors, de la més llunyana a la més propera; la pedra es dibuixa quan toca per profunditat
      const sl = sledge(s, w, slideIn);
      const st = {done: false};
      const drawStone = () => { if(st.done) return; st.done = true; st.res = stone(s, w, slideIn, sl.top, hov === "pedra"); };
      const crews = Lay.crews.slice().sort((a,b) => b.z - a.z);
      let idx0 = 0; const offs = {}; Lay.crews.forEach(c => { offs[c.i] = idx0; idx0 += c.cnt; });
      const front = [s.l + .45 + slideIn, sl.top + .3, w/2];
      crews.forEach(cw => {
        if(cw.z < w/2 && !st.done) drawStone();
        const dim = hov != null && hov !== "pedra" && hov !== cw.i;
        const a = dim ? .48 : 1;
        // persones quietes, totes estirant (sense pas animat): primer es calcula on té les mans cadascuna
        const hpx = 1.7*ppm*clamp(1 - (cw.z - w/2)*.014, .8, 1.15), xa = cw.x0;
        const ppl = d3.range(cw.cnt).map(k => {
          const id = offs[cw.i] + k;
          const rr = Math.abs(Math.sin(id*12.9898)*43758.5453) % 1, rr2 = Math.abs(Math.sin(id*78.233)*12345.678) % 1;
          const x = xa + k*Lay.gapX + (rr - .5)*.3, [sx, sy] = P(x, 0, cw.z + (k%2 ? .14 : -.14) + (rr2 - .5)*.1);
          const hh = hpx*(.88 + rr*.16), ph = rr*6.28, o = {pel: ["llarg","curt","monyo"][Math.floor(rr2*3)], capa: rr > .82};
          const hand = S3.silhouette(d3.path(), sx, sy, hh, "estira", ph, 1, o).hand;
          return {id, sx, sy, hh, ph, o, hand, x};
        });
        ppl.forEach(p => {
          if(p.id >= appear) return;
          const fresh = clamp((el - p.id*5)/350, 0, 1);
          const col = hov === cw.i ? C.vermell : IBV.alpha(C.ink, (.5 + .38*(1 - (cw.z - zMin)/Math.max(1, zMax - zMin)))*a*fresh);
          S3.drawSil(ctx, p.sx, p.sy, p.hh, "estira", p.ph, 1, col, p.o);
        });
        // corda de fibra: lligada al morro del trineu, passa per les mans de cada persona amb una mica de panxa
        // entre mans, i la punta sobrant cau a terra darrere de l'últim
        const nRope = Lay.crews.length, rk = nRope > 1 ? cw.i/(nRope - 1) : .5;
        const anc = P(s.l + .2 + slideIn, sl.top - .1, .1 + rk*(w - .2));
        const hands = ppl.filter(p => p.id < appear).map(p => p.hand);
        const thick = clamp(.04*ppm, .7, 2.2), rc = hov === cw.i ? C.vermell : IBV.alpha("#7A5A3A", .8*a);
        // punts de pas de la corda: ancoratge, mans (amb una panxa a mig camí de cada tram) i punta sobrant a terra;
        // una corba Catmull-Rom hi passa de manera contínua, com una corda de fibra tibant però feixuga
        const pts = [anc];
        let prev = anc;
        hands.forEach((h, i) => {
          const d = Math.hypot(h[0] - prev[0], h[1] - prev[1]), sag = i ? Math.min(d*.07, .1*ppm) : Math.min(d*.06, .45*ppm);
          if(!i && d > 3*ppm) [.33, .66].forEach(u => pts.push([prev[0] + (h[0] - prev[0])*u, prev[1] + (h[1] - prev[1])*u + sag*4*u*(1 - u)]));
          else pts.push([(prev[0] + h[0])/2, (prev[1] + h[1])/2 + sag]);
          pts.push(h); prev = h;
        });
        // la resta de la corda (la de qui encara no l'ha agafada, i la punta sobrant) és estesa a terra
        const rest = ppl.slice(hands.length), wig = k => Math.sin(k*2.3 + cw.i)*.12;
        if(rest.length){
          const x0 = hands.length ? ppl[hands.length - 1].x + .45 : Math.max(s.l + 1.4, rest[0].x - 1.2);
          if(!hands.length){ const m = P((s.l + x0)/2 + .3, 0, cw.z*.6); pts.push(m); }
          pts.push(P(x0, hands.length ? .3 : 0, cw.z + wig(0)));
          rest.forEach((p, k) => pts.push(P(p.x + .3, 0, cw.z + wig(k + 1))));
        }
        {
          // punta lliure: arrugada a terra darrere de l'últim
          const lx = ppl[ppl.length - 1].x;
          if(!rest.length) pts.push(P(lx + .55, .35, cw.z + .05));
          pts.push(P(lx + .9, 0, cw.z + .12), P(lx + 1.5, 0, cw.z - .12), P(lx + 1.9, 0, cw.z + .2), P(lx + 1.75, 0, cw.z + .45));
        }
        const line = d3.line().curve(d3.curveCatmullRom.alpha(.5)).context(ctx);
        const rope = () => { ctx.beginPath(); line(pts); };
        rope(); ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.strokeStyle = rc; ctx.lineWidth = hov === cw.i ? thick + .5 : thick; ctx.stroke();
        if(thick > 1.3){ rope(); ctx.setLineDash([1.2, 2.2]); ctx.strokeStyle = IBV.alpha("#E9DCC6", .7*a); ctx.lineWidth = thick*.45; ctx.stroke(); ctx.setLineDash([]); }
      });
      drawStone();
      // cotes en gravat: llargada i gruix de la pedra
      const base = sl.top, dimY = base + s.h + .25;
      const q0 = P(slideIn, dimY, w), q1 = P(s.l + slideIn, dimY, w);
      ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]);
      [q0, q1].forEach(q => { ctx.moveTo(q[0], q[1] - 3.5); ctx.lineTo(q[0], q[1] + 3.5); });
      ctx.strokeStyle = IBV.alpha(C.ink, .55); ctx.lineWidth = .6; ctx.stroke();
      ctext(ctx, q0[0], q0[1] - 10, mob ? `${F1(s.l)} m · ${F0(s.t)} t` : `${s.nom} · ${F1(s.l)} m · ${F0(s.t)} t`, {size: mob ? 10.5 : 11.5, weight: 600, fill: hov === "pedra" ? C.vermell : C.ink});
      // persona dreta a escala, al costat de la pedra (1,7 m)
      { const [px, py] = P(-1.1 + slideIn, 0, -.6); S3.drawSil(ctx, px, py, 1.7*ppm, "mira", 0, 1, IBV.alpha(C.ink, .9), {pel: "monyo", capa: true});
        ctext(ctx, px, py + 9, "1,7 m", {anchor: "middle", size: 10, fill: IBV.alpha(C.ink, .6)}); }
      // clau de lectura sobre les cordes
      if(appear > 0){
        const top = Lay.crews[Lay.crews.length-1], xm = top.x0 + (top.cnt - 1)*Lay.gapX;
        const b0 = P(top.x0 - .3, 2.3, top.z), b1 = P(xm + .3, 2.3, top.z);
        ctx.beginPath(); ctx.moveTo(b0[0], b0[1] + 4); ctx.lineTo(b0[0], b0[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo(b1[0], b1[1] + 4);
        ctx.strokeStyle = IBV.alpha(C.ink, .4); ctx.lineWidth = .6; ctx.stroke();
        ctext(ctx, b0[0], b0[1] - 9, `${F0(Math.min(appear, Lay.n))} persones · ${Lay.crews.length} ${Lay.crews.length === 1 ? "corda" : "cordes"}`, {size: mob ? 10.5 : 11.5, weight: 600});
      }
    }

    /* ---------- hover a l'escena: corda o pedra ---------- */
    function pick(px, py){
      const Lay = layout(cur, rate);
      let best = null, bd = 1e9;
      Lay.crews.forEach(cw => {
        const a = P(cw.x0 - .5, .85, cw.z), b = P(cw.x0 + (cw.cnt - 1)*Lay.gapX + .4, .85, cw.z);
        if(px < a[0] - 4 || px > b[0] + 4) return;
        const d = Math.abs(py - (a[1] + (b[1] - a[1])*(px - a[0])/Math.max(1, b[0] - a[0])));
        if(d < bd){ bd = d; best = cw; }
      });
      if(best && bd < Math.max(10, .9*ppm)) return {k: best.i, cw: best};
      const sx0 = P(0, 0, 0)[0], sx1 = P(cur.l, 0, WID[cur.id])[0], sy0 = P(0, 1.7 + cur.h, WID[cur.id])[1], sy1 = P(0, 0, 0)[1];
      if(px > sx0 && px < sx1 && py > sy0 && py < sy1 + 6) return {k: "pedra"};
      return null;
    }

    /* ---------- comparació: totes les pedres, els dos ritmes (SVG) ---------- */
    function compare(host){
      const box = d3.select(host).append("div").attr("class", "mou-cmp").style("margin-top", "14px");
      const ww = W, rowH = 26, m = {l: mob ? 92 : 150, r: 46, t: mob ? 36 : 22, b: 22}, hh = m.t + STONES.length*rowH + m.b;
      const svg = box.append("svg").attr("width", ww).attr("height", hh).attr("viewBox", `0 0 ${ww} ${hh}`).style("display", "block").style("overflow", "visible").style("font-family", IBV.SANS)
        .attr("role", "img").attr("aria-label", "Persones necessàries per a cada pedra amb els dos ritmes experimentals");
      const maxN = d3.max(STONES, s => d3.max(RATES, r => nOf(s, r)));
      const x = d3.scaleLinear().domain([0, maxN]).range([m.l, ww - m.r]).nice();
      const g = svg.append("g");
      g.append("text").attr("x", 0).attr("y", 10).attr("font-size", 11.5).attr("font-weight", 600).attr("fill", C.ink).text("Totes les pedres, amb els dos experiments");
      x.ticks(mob ? 3 : 6).forEach(v => {
        g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", m.t + 4).attr("y2", hh - m.b + 2).attr("stroke", IBV.alpha(C.ink, .08));
        g.append("text").attr("x", x(v)).attr("y", hh - 6).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", IBV.alpha(C.ink, .55)).text(F0(v));
      });
      const rows = g.selectAll("g.r").data(STONES).join("g").attr("class", "r").attr("transform", (d,i) => `translate(0,${m.t + i*rowH + rowH/2 + 4})`).style("cursor", "pointer");
      rows.append("rect").attr("x", 0).attr("y", -rowH/2).attr("width", ww).attr("height", rowH).attr("fill", "transparent");
      rows.append("text").attr("class", "nm").attr("x", 0).attr("y", 4).attr("font-size", mob ? 10.5 : 11.5).text(d => mob ? `${d.nom.replace("Rèplica de la p", "P").replace("Pedra de l'", "")} · ${F0(d.t)} t` : `${d.nom} · ${F0(d.t)} t`);
      rows.append("line").attr("class", "rg").attr("y1", 0).attr("y2", 0).attr("stroke-width", 1.2);
      RATES.forEach(r => rows.append("circle").attr("class", `d-${r.id}`).attr("cy", 0).attr("r", 4.2).attr("stroke-width", 1.2));
      rows.append("text").attr("class", "vl").attr("y", 4).attr("font-size", 10.5);
      const lg = g.append("g").attr("transform", mob ? "translate(4,28)" : `translate(${ww - m.r - 250},10)`);
      RATES.forEach((r, i) => { const gx = i*(mob ? 78 : 128);
        lg.append("circle").attr("cx", gx).attr("cy", -3.5).attr("r", 4).attr("fill", i ? S3.PAPER : C.vermell).attr("stroke", i ? C.ink : C.vermell).attr("stroke-width", 1.2);
        lg.append("text").attr("x", gx + 8).attr("y", 0).attr("font-size", 10.5).attr("fill", IBV.alpha(C.ink, .75)).text(mob ? r.font : `${r.font} · ${F1(r.k)}/t`); });
      rows.on("pointerenter", (ev, d) => { rows.style("opacity", q => q===d || q===cur ? 1 : .5); tp.show(`<b>${d.nom}</b> · ${RATES.map(r => `${F0(nOf(d, r))} persones (${r.font})`).join(" · ")}`); })
          .on("pointerleave", () => { rows.style("opacity", 1); upd(); })
          .on("click", (ev, d) => setStone(d.id));
      function update(){
        rows.select(".nm").attr("fill", d => d===cur ? C.vermell : C.ink).attr("font-weight", d => d===cur ? 700 : 400);
        rows.select(".rg").attr("x1", d => x(nOf(d, RATES[1]))).attr("x2", d => x(nOf(d, RATES[0]))).attr("stroke", d => d===cur ? IBV.alpha(C.vermell, .5) : IBV.alpha(C.ink, .25));
        RATES.forEach((r, i) => rows.select(`.d-${r.id}`).transition().duration(400).attr("cx", d => x(nOf(d, r)))
          .attr("fill", d => i ? S3.PAPER : (d===cur ? C.vermell : IBV.alpha(C.ink, .7)))
          .attr("stroke", d => i ? (d===cur ? C.vermell : IBV.alpha(C.ink, .7)) : (d===cur ? C.vermell : IBV.alpha(C.ink, .7)))
          .attr("r", d => d===cur && r===rate ? 5.6 : 4.2));
        const lo = d => nOf(d, rate) <= d3.min(RATES, r => nOf(d, r));
        rows.select(".vl").attr("x", d => x(nOf(d, rate)) + (lo(d) ? -9 : 9)).attr("text-anchor", d => lo(d) ? "end" : "start").attr("fill", d => d===cur ? C.vermell : IBV.alpha(C.ink, .6)).attr("font-weight", d => d===cur ? 700 : 400)
          .text(d => F0(nOf(d, rate)));
      }
      update();
      return {update};
    }

    IBV.mount(el, (container, w) => {
      W = w; mob = w < 600;
      H = mob ? 240 : 410; vTo = null; retarget(); applyView();
      ({ctx} = IBV.canvas(container, W, H, "Escena en perspectiva: una pedra a escala sobre un trineu de roure i tantes figures com persones caldrien per arrossegar-la, repartides en cordes a banda i banda del camí."));
      d3.select(container).selectAll(".mou-cmp").remove();
      svgApi = compare(container);
      const dock = container.querySelector(".tip.ibv-dock"); if(dock) container.appendChild(dock);
      const cv = container.querySelector("canvas.ibv");
      IBV.hover(cv, (ev, [px, py]) => {
        const p = pick(px, py), k = p ? p.k : null;
        if(k === hov) return; hov = k; cv.style.cursor = k != null ? "pointer" : "default";
        if(k === "pedra") tp.show(`<b>${cur.nom}</b> · ${F1(cur.l)} m de llarg · ${F0(cur.t)} t · trineu de roure sobre ${rate.id==="ucl" ? "troncs fixos" : "un carril greixat"}`);
        else if(p) tp.show(`<b>Corda ${p.cw.i + 1}</b> · ${F0(p.cw.cnt)} persones estirant`);
        else upd();
        draw(lastT);
      }, () => { hov = null; upd(); });
      upd(); t0 = now(); draw(0);
    });
    IBV.loop(el, t => draw(t));
  })();
})();
