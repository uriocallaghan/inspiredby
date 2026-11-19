/* La gran migració de cada nit — visualitzacions amb el sistema infogràfic IBV.
   1. Tall de l'oceà 24 h (IB-16 + IB-06 + IBV.cloud, scrolly)
   2. Escala del copèpode (IB-16 + IB-10 + IB-35)
   3. Dades Malaspina per regions (IB-42 + IB-38, dades reals Klevjer et al. 2016)
   4. Ecograma simulat (IB-37/IB-56 + IB-03, model d'isoluma)
   5. Bomba de carboni (IB-16 + IB-40, scrolly)
   6. Estimacions de carboni (IB-10 + IB-38, dades publicades) */
(function () {
  "use strict";
  if (!window.IBV || !window.d3) return;

  const C = IBV.C;
  const RM = IBV.reduced;
  const $ = id => document.getElementById(id);
  const D2R = Math.PI / 180;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const mob = () => window.innerWidth < 900;
  const fmt0 = IBV.fmt(",.0f");
  const fmt1 = IBV.fmt(",.1f");
  const fmt2 = IBV.fmt(",.2f");
  const hhmm = h => {
    h = ((h % 24) + 24) % 24;
    let H = Math.floor(h), M = Math.round((h - H) * 60);
    if (M === 60) { M = 0; H = (H + 1) % 24; }
    return String(H).padStart(2, "0") + ":" + String(M).padStart(2, "0");
  };

  /* Helper per a text en canvas amb halo blanc (P6, mínim 11 px) */
  function cTxt(ctx, lines, x, y, o) {
    o = o || {};
    const a = o.a == null ? 1 : o.a;
    if (a <= 0.01) return;
    const fs = Math.max(IBV.FS.min, o.fs || IBV.FS.label);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = o.al || "left";
    ctx.lineJoin = "round";
    lines.forEach((l, i) => {
      const s = typeof l === "string" ? [l] : l;
      const w = s[1] || o.bold ? "700 " : "400 ";
      const it = o.italic ? "italic " : "";
      ctx.font = `${it}${w}${fs}px ${IBV.SANS}`;
      const yy = y + i * fs * 1.28;
      if (o.halo !== false) {
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = o.halo || "rgba(255,255,255,0.92)";
        ctx.strokeText(s[0], x, yy);
      }
      ctx.fillStyle = s[2] || o.col || C.ink;
      ctx.fillText(s[0], x, yy);
    });
    ctx.restore();
  }

  function arrowV(ctx, x, y0, y1, col, lw) {
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = lw || 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    const d = y1 < y0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(x - 4.5, y1 - d * 5.5);
    ctx.lineTo(x, y1);
    ctx.lineTo(x + 4.5, y1 - d * 5.5);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- Model de llum compartit ---------- */
  const TW = [[-18, -3.1], [-12, -2.1], [-6, 0.48], [0, 2.845]];
  function lxSun(h) {
    if (h >= 0) return Math.log10(700 + 1e5 * Math.sin(h * D2R));
    if (h <= -18) return -3.1;
    for (let i = 1; i < TW.length; i++) {
      if (h <= TW[i][0]) {
        const a = TW[i - 1], b = TW[i];
        return lerp(a[1], b[1], (h - a[0]) / (b[0] - a[0]));
      }
    }
    return 2.845;
  }
  const sunEl = (t, lat, dec) =>
    Math.asin(clamp(
      Math.sin(lat * D2R) * Math.sin(dec * D2R) +
      Math.cos(lat * D2R) * Math.cos(dec * D2R) * Math.cos((t - 12) * 15 * D2R),
      -1, 1
    )) / D2R;
  const addL = (a, b) => Math.log10(Math.pow(10, a) + Math.pow(10, b));

  /* =========================================================
     1. TALL DE L'OCEÀ DE 24 HORES (IB-16 + IB-06 + IBV.cloud)
     ========================================================= */
  (function () {
    const stack = $("oStack"), plotEl = $("oPlot");
    if (!stack || !plotEl) return;
    const graphic = $("ograph"), steps = $("osteps");
    const tEl = $("oTime"), sEl = $("oState"), rngEl = $("oRng"), outEl = $("oOut"), playB = $("oPlay");
    const lgdEl = $("oLgd");
    const ARIA = "Tall de l'oceà de la superfície fins a 1.100 metres al llarg d'un dia. De dia, la capa d'animals és a uns 450 metres, a la zona crepuscular. Al capvespre puja fins als primers cent metres, on passa la nit menjant, i abans de l'alba torna a baixar.";

    if (lgdEl) {
      IBV.legendCat(lgdEl, [
        { c: C.vermell, t: "Migradors", kind: "dot", a: 0.72 },
        { c: C.muted, t: "Es queden", kind: "dot", a: 0.55 },
        { c: C.blau, t: "Fitoplàncton", kind: "dot", a: 0.65 },
        { c: C.grocFosc, t: "Isoluma", kind: "line", dash: "4 3", w: 2 }
      ]);
    }

    const tp = IBV.tip(plotEl);
    const ZMAX = 1100;
    const SUNRISE = 6, SUNSET = 18, DEP = SUNRISE - 21 / 60, ARR = SUNSET + 17 / 60;
    const VD = 0.076 * 3600, VU = 0.065 * 3600, DAYZ = 450;
    const KD = 0.035 * Math.LOG10E;
    const surfL = t => lxSun(sunEl(t, 0, 0));
    const PREF = surfL(12) - KD * DAYZ;

    const r = IBV.rng(7);
    let A = [], PH = [];
    function makeAnimals() {
      const n = mob() ? 520 : 980;
      A = [];
      for (let i = 0; i < n; i++) {
        const q = r(), type = q < 0.42 ? 0 : q < 0.62 ? 1 : q < 0.84 ? 2 : q < 0.91 ? 3 : 4;
        const mig = r() < 0.5;
        const dd = clamp(DAYZ + IBV.gauss(r) * 55, 320, 640);
        const nd = clamp(6 + Math.pow(r(), 1.5) * 115, 4, 130);
        const tj = IBV.gauss(r) * 0.12;
        A.push({
          x: r(), type, mig, dd, nd, tj,
          rz: clamp(470 + IBV.gauss(r) * 110, 330, 820),
          w: r() * 6.283, s: 0.65 + r() * 0.55, z: null
        });
      }
      PH = [];
      for (let i = 0; i < (mob() ? 180 : 320); i++) {
        PH.push({ x: r(), z: clamp(16 + Math.pow(r(), 0.8) * 125 + IBV.gauss(r) * 8, 3, 165), w: r() * 6.283 });
      }
    }
    makeAnimals();

    function schedZ(a, t) {
      const dist = a.dd - a.nd, durD = dist / VD, durU = dist / VU;
      const dep = DEP + a.tj, arr = ARR + a.tj;
      if (t >= dep && t < dep + durD) return a.nd + (t - dep) * VD;
      if (t >= dep + durD && t < arr - durU) return a.dd;
      if (t >= arr - durU && t < arr) return a.dd - (t - (arr - durU)) * VU;
      return a.nd;
    }

    const OS = [
      { t: 12 }, { t: 12, types: 1 }, { t: 12, pred: 1 },
      { range: [15.4, 19.4], rm: 17.3, arUp: 1 },
      { t: 23, feed: 1 },
      { range: [4.5, 8.2], rm: 6.2, arDn: 1 },
      { t: 23, res: 1 },
      { range: [10.5, 19.6], rm: 17, iso: 1 },
      { play: 1 }
    ];
    const S = {
      t: 12, step: 0, mode: "static", target: 12, from: 0, to: 0, hold: 0, user: false,
      f: { types: 0, pred: 0, res: 0, iso: 0, feed: 0, arUp: 0, arDn: 0 }
    };

    function goStep(i) {
      const s = OS[i] || OS[0];
      S.step = i; S.user = false;
      if (s.range) {
        if (RM) { S.mode = "static"; S.t = S.target = s.rm; }
        else { S.mode = "range"; S.from = s.range[0]; S.to = s.range[1]; S.t = S.from; S.hold = 0; }
      } else if (s.play) {
        S.mode = RM ? "static" : "play"; S.target = S.t;
      } else {
        S.mode = "static"; S.target = s.t; if (RM) S.t = s.t;
      }
      if (playB) playB.textContent = S.mode === "play" ? "Pausa" : "Reprodueix";
      if (RM) {
        for (const k in S.f) S.f[k] = s[k] ? 1 : 0;
        for (const a of A) a.z = a.mig ? schedZ(a, S.t) : a.rz;
        draw(0);
      }
    }

    if (rngEl) {
      rngEl.addEventListener("input", () => {
        S.user = true; S.mode = "static"; S.t = S.target = +rngEl.value;
        if (playB) playB.textContent = "Reprodueix";
        if (RM) {
          for (const a of A) a.z = a.mig ? schedZ(a, S.t) : a.rz;
          draw(0);
        }
      });
    }
    if (playB) {
      playB.addEventListener("click", () => {
        S.user = true;
        if (S.mode === "play") { S.mode = "static"; S.target = S.t; playB.textContent = "Reprodueix"; }
        else { S.mode = "play"; playB.textContent = "Pausa"; }
      });
    }

    const phaseName = t =>
      t >= 5 && t < 7.2 ? "Alba" :
      t >= 7.2 && t < 11 ? "Matí" :
      t >= 11 && t < 13 ? "Migdia" :
      t >= 13 && t < 16.5 ? "Tarda" :
      t >= 16.5 && t < 19.5 ? "Capvespre" : "Nit";

    let ctx = null, cvNode = null, W = 0, H = 0, skyH = 0, y0 = 0, ML = 0, MR = 0;
    let meanZ = DAYZ, hoverZ = null;
    const yz = z => y0 + (z / ZMAX) * (H - y0 - 4);
    const zy = y => clamp((y - y0) / (H - y0 - 4) * ZMAX, 0, ZMAX);

    function glyph(c, x, y, s, type) {
      if (type === 0) {
        c.beginPath(); c.arc(x, y, 1.3 * s, 0, 6.283); c.fill();
        if (s > 1.35) {
          c.lineWidth = 0.7; c.beginPath();
          c.moveTo(x - s, y - 0.6 * s); c.lineTo(x - 3.2 * s, y - 2.1 * s);
          c.moveTo(x + s, y - 0.6 * s); c.lineTo(x + 3.2 * s, y - 2.1 * s);
          c.stroke();
        }
      } else if (type === 1) {
        c.lineWidth = 1.1 * Math.max(1, s * 0.8);
        c.beginPath(); c.moveTo(x - 2.4 * s, y + 0.4 * s); c.quadraticCurveTo(x, y - s, x + 2.4 * s, y + 0.2 * s); c.stroke();
      } else if (type === 2) {
        c.beginPath(); c.ellipse(x, y, 3.0 * s, 1.15 * s, 0, 0, 6.283); c.fill();
        c.beginPath(); c.moveTo(x - 2.6 * s, y); c.lineTo(x - 4.4 * s, y - 1.3 * s); c.lineTo(x - 4.4 * s, y + 1.3 * s); c.closePath(); c.fill();
      } else if (type === 3) {
        c.beginPath(); c.moveTo(x - 2.9 * s, y); c.lineTo(x + 1.4 * s, y - 1.2 * s); c.lineTo(x + 1.4 * s, y + 1.2 * s); c.closePath(); c.fill();
        c.lineWidth = 0.6; c.beginPath();
        c.moveTo(x + 1.4 * s, y); c.lineTo(x + 3.4 * s, y - 0.5 * s);
        c.moveTo(x + 1.4 * s, y + 0.4 * s); c.lineTo(x + 3.4 * s, y + 0.9 * s);
        c.stroke();
      } else {
        c.lineWidth = 0.8;
        c.beginPath(); c.arc(x, y, 2 * s, Math.PI, 0); c.closePath(); c.stroke();
        c.beginPath(); c.moveTo(x - s, y); c.lineTo(x - 1.2 * s, y + 2.4 * s);
        c.moveTo(x + s, y); c.lineTo(x + 1.2 * s, y + 2.4 * s); c.stroke();
      }
    }

    function tuna(c, x, y, s, dir) {
      c.save(); c.translate(x, y); c.scale(dir * s, s);
      c.beginPath();
      c.moveTo(12, 0); c.bezierCurveTo(6, -4.5, -6, -4.3, -10, -0.6);
      c.lineTo(-15, -4.5); c.lineTo(-13.4, 0); c.lineTo(-15, 4.5);
      c.lineTo(-10, 0.6); c.bezierCurveTo(-6, 4.3, 6, 4.5, 12, 0);
      c.fill(); c.restore();
    }

    /* Mini dial horari 24 h (IB-06): mitjanit a dalt, migdia a baix */
    function drawDial(c, cx, cy, R, hour) {
      c.save();
      c.translate(cx, cy);
      // Fons suau paper translúcid per llegibilitat sense caixa dura
      c.beginPath(); c.arc(0, 0, R + 3, 0, 6.283);
      c.fillStyle = "rgba(255,255,255,0.82)"; c.fill();
      // Arc de dia (6 h → 18 h, part inferior) en groc suau; nit (18 h → 6 h, part superior) en blau suau
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, 0, Math.PI, false); c.closePath();
      c.fillStyle = IBV.alpha(C.groc, 0.22); c.fill();
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, Math.PI, 2 * Math.PI, false); c.closePath();
      c.fillStyle = IBV.alpha(C.blau, 0.14); c.fill();
      // Retícula polar ultra-fina (0,5 px)
      c.strokeStyle = C.hair; c.lineWidth = 0.6;
      c.beginPath(); c.arc(0, 0, R, 0, 6.283); c.stroke();
      c.beginPath(); c.arc(0, 0, R * 0.5, 0, 6.283); c.stroke();
      [0, 6, 12, 18].forEach(h => {
        const a = (h / 24) * 2 * Math.PI - Math.PI / 2;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R, Math.sin(a) * R); c.stroke();
      });
      // Agulla de l'hora actual
      const ang = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      c.strokeStyle = C.vermell; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ang) * (R - 2), Math.sin(ang) * (R - 2)); c.stroke();
      c.fillStyle = C.vermell;
      c.beginPath(); c.arc(Math.cos(ang) * (R - 2), Math.sin(ang) * (R - 2), 2.4, 0, 6.283); c.fill();
      c.fillStyle = C.ink;
      c.beginPath(); c.arc(0, 0, 1.8, 0, 6.283); c.fill();
      // Marques 0h i 12h
      c.font = `600 11px ${IBV.SANS}`; c.fillStyle = C.muted; c.textAlign = "center";
      c.fillText("0h", 0, -R - 4);
      c.fillText("12h", 0, R + 11);
      c.restore();
    }

    function tick(dt) {
      if (S.mode === "range") {
        if (S.hold > 0) { S.hold -= dt; if (S.hold <= 0) S.t = S.from; }
        else { S.t += dt * (RM ? 2.4 : 0.72); if (S.t >= S.to) { S.t = S.to; S.hold = 1.6; } }
      } else if (S.mode === "play") {
        S.t = (S.t + dt * 0.85) % 24;
      } else {
        const d = S.target - S.t;
        S.t += d * Math.min(1, RM ? 1 : dt * 3.0);
        if (Math.abs(d) < 0.005) S.t = S.target;
      }
      const st = OS[S.step] || {};
      const k = RM ? 1 : Math.min(1, dt * 3);
      for (const n in S.f) S.f[n] += (((st[n] && !S.user) ? 1 : 0) - S.f[n]) * k;

      let sum = 0, cnt = 0;
      const ez = RM ? 1 : Math.min(1, dt * (S.mode === "static" && Math.abs(S.target - S.t) > 0.02 ? 4.5 : 8));
      for (const a of A) {
        const tz = a.mig ? schedZ(a, S.t) : a.rz;
        if (a.z == null) a.z = tz;
        a.z += (tz - a.z) * ez;
        if (a.mig) { sum += a.z; cnt++; }
      }
      meanZ = cnt ? sum / cnt : 0;

      if ((!S.user || S.mode !== "static") && rngEl) rngEl.value = S.t.toFixed(2);
      const ts = hhmm(S.t);
      if (tEl && tEl.textContent !== ts) {
        tEl.textContent = ts;
        if (outEl) outEl.textContent = ts;
        if (rngEl) rngEl.setAttribute("aria-valuetext", ts);
      }
      const st2 = `${phaseName(S.t)} · la capa que migra és a ${Math.round(meanZ / 10) * 10} m`;
      if (sEl && sEl.textContent !== st2) sEl.textContent = st2;
    }

    function draw(tt) {
      if (!ctx || !W) return;
      const c = ctx, m = mob(), fs = m ? 11 : 12.5, t = S.t, el = sunEl(t, 0, 0), Ls = surfL(t);
      const dayF = sm((el + 6) / 24); // 0 nit, 1 dia ple
      c.clearRect(0, 0, W, H);

      // 1. Franja del cel (paper blanc + bany solar suau de dia o blau pàl·lid de nit, MAI caixa negra)
      const skyG = c.createLinearGradient(0, 0, 0, skyH);
      skyG.addColorStop(0, IBV.alpha(dayF > 0.25 ? C.groc : C.blauFosc, dayF > 0.25 ? 0.06 * dayF : 0.08 * (1 - dayF)));
      skyG.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = skyG;
      c.fillRect(ML, 0, W - ML - MR, skyH);

      // Sol minimalista (groc/vermell) quan és sobre l'horitzó
      if (el > -4) {
        const xs = ML + ((t - 6) / 12) * (W - ML - MR - (m ? 60 : 90)) + 16;
        const ys = skyH - 5 - Math.max(0, Math.sin(el * D2R)) * (skyH - 15);
        const yy = ys + (el < 0 ? -el * 1.4 : 0), rs = m ? 6 : 8.5;
        c.save();
        c.beginPath(); c.rect(ML, 0, W - ML - MR, skyH); c.clip();
        const gl = c.createRadialGradient(xs, yy, rs * 0.5, xs, yy, rs * 3.2);
        gl.addColorStop(0, IBV.alpha(C.groc, 0.42));
        gl.addColorStop(1, IBV.alpha(C.groc, 0));
        c.fillStyle = gl;
        c.beginPath(); c.arc(xs, yy, rs * 3.2, 0, 6.283); c.fill();
        c.fillStyle = el < 10 ? C.vermell : C.groc;
        c.beginPath(); c.arc(xs, yy, rs, 0, 6.283); c.fill();
        c.restore();
      }

      // 2. Columna d'aigua (IB-16): degradat suau de la rampa blava sobre paper blanc (P1)
      const wg = c.createLinearGradient(0, y0, 0, H);
      const topA = lerp(0.11, 0.015, dayF);
      const midA = lerp(0.18, 0.09, dayF);
      const botA = lerp(0.28, 0.22, dayF);
      wg.addColorStop(0, IBV.alpha(C.blau, topA));
      wg.addColorStop(0.18, IBV.alpha(C.blau, lerp(topA, midA, 0.45)));
      wg.addColorStop(0.55, IBV.alpha(C.blau, midA));
      wg.addColorStop(1, IBV.alpha(C.blauFosc, botA));
      c.fillStyle = wg;
      c.fillRect(ML, y0, W - ML - MR, H - y0);

      // Halo de llum solar que penetra la zona il·luminada de dia
      if (dayF > 0.05) {
        const sunW = c.createLinearGradient(0, y0, 0, yz(220));
        sunW.addColorStop(0, IBV.alpha(C.groc, 0.13 * dayF));
        sunW.addColorStop(1, IBV.alpha(C.groc, 0));
        c.fillStyle = sunW;
        c.fillRect(ML, y0, W - ML - MR, yz(220) - y0);
      }

      // Línia de superfície en blau
      c.strokeStyle = C.blau; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(ML, y0); c.lineTo(W - MR, y0); c.stroke();

      // 3. Eix de fondària i zones (recessius, mínim 11 px)
      c.save();
      for (let z = 0; z <= 1000; z += 200) {
        const y = yz(z);
        const isZone = z === 200 || z === 1000;
        c.strokeStyle = isZone ? C.ink2 : C.grid;
        c.lineWidth = isZone ? 0.9 : 0.6;
        c.setLineDash(isZone ? [2, 4] : []);
        c.beginPath(); c.moveTo(ML, y); c.lineTo(W - MR, y); c.stroke();
        cTxt(c, [z === 0 ? "0 m" : String(z)], ML - 6, y + (z === 0 ? fs * 0.85 : 4), {
          al: "right", fs: IBV.FS.small, col: C.muted, halo: false
        });
      }
      c.restore();

      const zf = 1 - 0.85 * Math.max(S.f.arUp, S.f.arDn);
      const zl = (s, z, a) => cTxt(c, [s], W - MR - 6, yz(z), {
        al: "right", fs: m ? 11 : 12, col: C.ink2, italic: true, a: a == null ? 1 : a
      });
      zl("Zona il·luminada", m ? 120 : 105, zf);
      zl("Zona crepuscular", m ? 560 : 600, zf);
      if (!m || H > 280) zl("Zona fosca", 1068, 0.9);

      // 4. Núvol orgànic de fitoplàncton (IBV.cloud en blau)
      const phPts = [];
      for (let i = 0; i < PH.length; i++) {
        const p = PH[i];
        phPts.push([
          ML + 4 + p.x * (W - ML - MR - 8) + Math.sin(tt * 0.14 + p.w) * 3.5,
          yz(p.z + Math.sin(tt * 0.2 + p.w) * 2),
          m ? 1.3 : 1.6
        ]);
      }
      IBV.cloud(c, phPts, C.blau, { alpha: 0.26 + 0.34 * S.f.feed });

      // 5. Isoluma (groc fosc gruixut ≥ 2 px + etiqueta en tinta amb halo)
      if (S.f.iso > 0.01) {
        const zi = (Ls - PREF) / KD, y = yz(clamp(zi, 0, ZMAX));
        c.save();
        c.globalAlpha = S.f.iso;
        c.strokeStyle = C.grocFosc;
        c.lineWidth = 2.2;
        c.setLineDash([6, 4]);
        c.lineDashOffset = RM ? 0 : -tt * 8;
        c.beginPath(); c.moveTo(ML, y); c.lineTo(W - MR, y); c.stroke();
        c.restore();
        cTxt(c, [["Isoluma: la llum de la capa a migdia", 1]], ML + 10, zi < 35 ? y + fs + 6 : y - 8, {
          fs, col: C.ink, a: S.f.iso
        });
      }

      // 6. Depredadors visuals prop de la superfície (blau fosc)
      if (S.f.pred > 0.01) {
        c.save();
        c.globalAlpha = S.f.pred * 0.8;
        c.fillStyle = C.blauFosc;
        const sc = m ? 0.8 : 1.05;
        [[0.0, 38, 1], [0.37, 74, 1], [0.7, 52, -1]].forEach(([o, z, d], i) => {
          const u = ((tt * 0.018 * (i + 2) + o) % 1 + 1) % 1;
          const x = d > 0 ? ML + u * (W - ML - MR) : W - MR - u * (W - ML - MR);
          tuna(c, x, yz(z), sc, d);
        });
        c.restore();
        cTxt(c, [["Depredadors que", 1], ["cacen amb la vista", 0]], ML + 10, yz(135), {
          fs, a: S.f.pred, col: C.ink
        });
      }

      // 7. Animals: núvol orgànic en canvas (IBV.cloud quan són petits; siluetes al pas "Qui hi ha")
      const rs = S.f.res;
      if (S.f.types < 0.05) {
        const migPts = [], resPts = [];
        const rad = m ? 1.5 : 1.9;
        for (let i = 0; i < A.length; i++) {
          const a = A[i];
          const x = ML + 6 + a.x * (W - ML - MR - 12) + Math.sin(tt * 0.16 * a.s + a.w) * 5;
          const y = yz(a.z + Math.sin(tt * 0.35 * a.s + a.w) * 4);
          if (a.mig) migPts.push([x, y, rad * (0.8 + 0.35 * a.s)]);
          else resPts.push([x, y, rad * 0.85]);
        }
        IBV.cloud(c, resPts, C.muted, { alpha: 0.25 + rs * 0.42 });
        IBV.cloud(c, migPts, C.vermell, { alpha: 0.56 - rs * 0.22 });
      } else {
        const big = 1 + S.f.types * 1.15;
        for (let i = 0; i < A.length; i++) {
          const a = A[i];
          const x = ML + 6 + a.x * (W - ML - MR - 12) + Math.sin(tt * 0.16 * a.s + a.w) * 5;
          const y = yz(a.z + Math.sin(tt * 0.35 * a.s + a.w) * 4);
          const col = a.mig ? C.vermell : C.muted;
          c.fillStyle = col; c.strokeStyle = col;
          c.globalAlpha = a.mig ? (0.72 - rs * 0.25) : (0.35 + rs * 0.4);
          glyph(c, x, y, (m ? 0.85 : 1) * big * (a.mig ? 1 : 0.9), a.type);
        }
        c.globalAlpha = 1;
      }

      // 8. Anotacions editorials dins del gràfic (P4, sense caixes fosques)
      const st = S.step, lx = ML + 10;
      if (st === 0 && !S.user) {
        const y = yz(meanZ);
        cTxt(c, [["La capa d'animals", 1], ["de dia, a uns 450 m", 0]], lx, y - 56, { fs, col: C.ink });
        c.strokeStyle = C.ink; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(lx + 18, y - 34); c.lineTo(lx + 36, y - 14); c.stroke();
      }
      if (S.f.types > 0.02) {
        const K = [[0, "Copèpodes"], [1, "Krill"], [2, "Peixos llanterna"], [3, "Calamars"], [4, "Meduses i sifonòfors"]];
        const cols = m ? 2 : 1, rows = Math.ceil(K.length / cols);
        const colW = m ? Math.min(156, (W - ML - MR - 16) / 2) : 165;
        const rowH = fs + (m ? 6 : 8), bh = rows * rowH + 6;
        const bx = ML + 12, top = m ? H - 8 - bh : Math.min(yz(810), H - 10 - bh);
        c.save(); c.globalAlpha = S.f.types;
        K.forEach(([tp, n], i) => {
          const col = Math.floor(i / rows), row = i % rows;
          const x = bx + col * colW, y = top + rowH - 1 + row * rowH;
          c.fillStyle = C.vermell; c.strokeStyle = C.vermell;
          glyph(c, x + 6, y - 3, m ? 1.5 : 1.8, tp);
          cTxt(c, [n], x + 20, y + 1, { fs: m ? 11 : 12, col: C.ink });
        });
        c.restore();
      }
      if (S.f.arUp > 0.02) {
        const x = W * 0.5, yb = yz(meanZ) + 12;
        c.save(); c.globalAlpha = S.f.arUp;
        if (meanZ > 45 && meanZ < 440) arrowV(c, x, yb + 38, yb - 6, C.vermell, 1.4);
        c.restore();
        cTxt(c, [["Puja a 6,5 cm/s", 1, C.vermell], ["≈ 230 m per hora", 0, C.ink]], x + 14, yz(clamp(meanZ, 70, 440)) + 4, {
          fs, a: S.f.arUp * (meanZ > 45 && meanZ < 440 ? 1 : 0.45)
        });
      }
      if (S.f.arDn > 0.02) {
        const x = W * 0.5, yb = yz(meanZ);
        c.save(); c.globalAlpha = S.f.arDn;
        if (meanZ > 45 && meanZ < 440) arrowV(c, x, yb - 38, yb + 6, C.vermell, 1.4);
        c.restore();
        cTxt(c, [["Baixa a 7,6 cm/s", 1, C.vermell], ["≈ 270 m per hora", 0, C.ink]], x + 14, yz(clamp(meanZ, 70, 440)) + 4, {
          fs, a: S.f.arDn * (meanZ > 45 && meanZ < 440 ? 1 : 0.45)
        });
      }
      if (S.f.feed > 0.02) {
        cTxt(c, [["Fitoplàncton i migradors,", 1, C.blau], ["junts a la foscor", 0, C.ink]], lx, yz(172), {
          fs, a: S.f.feed
        });
      }
      if (S.f.res > 0.02) {
        cTxt(c, [["Es queden a baix (~50 %)", 1, C.ink2]], lx, yz(325), { fs, a: S.f.res });
        cTxt(c, [["Migren cada nit", 1, C.vermell]], lx, yz(175), { fs, a: S.f.res });
      }

      // 9. Mini dial horari 24 h (IB-06) a la cantonada superior dreta
      if (!m || W >= 320) {
        const R = m ? 19 : 26;
        drawDial(c, W - MR - R - 8, y0 + R + 16, R, S.t);
      }

      // 10. Guia de hover horitzontal
      if (hoverZ != null) {
        const hy = yz(hoverZ);
        c.save();
        c.strokeStyle = C.ink; c.lineWidth = 0.8; c.setLineDash([3, 3]);
        c.beginPath(); c.moveTo(ML, hy); c.lineTo(W - MR, hy); c.stroke();
        c.restore();
      }
    }

    let loopHandle = null;
    IBV.mount(stack, (el, w) => {
      const m = mob() || w < 600;
      W = w;
      H = m ? Math.round(Math.max(195, Math.min(window.innerHeight * 0.27, 230)))
        : Math.min(Math.round(clamp(window.innerHeight - 260, 380, 680)), Math.round(W * 0.95));
      skyH = Math.max(26, Math.round(H * 0.095));
      y0 = skyH; ML = m ? 34 : 42; MR = m ? 6 : 10;
      const built = IBV.canvas(el, W, H, ARIA);
      cvNode = built.c; ctx = built.ctx;
      cvNode.style.cursor = "crosshair";

      IBV.hover(cvNode, (_ev, [, y]) => {
        if (y < y0) { hoverZ = null; tp.hide(); return; }
        hoverZ = zy(y);
        const zone = hoverZ < 200 ? "Zona il·luminada" : hoverZ < 1000 ? "Zona crepuscular" : "Zona fosca";
        const distLayer = Math.abs(hoverZ - meanZ);
        const extra = distLayer < 65 ? "dins la capa migradora" : `capa migradora a ${Math.round(meanZ / 10) * 10} m`;
        tp.show(`<b>${fmt0(hoverZ)} m · ${zone}</b><br>${hhmm(S.t)} (${phaseName(S.t)}) · ${extra}`);
        if (RM) draw(0);
      }, () => {
        hoverZ = null; tp.hide();
        if (RM) draw(0);
      });

      if (loopHandle) loopHandle.stop();
      loopHandle = IBV.loop(el, (tMs, dtMs) => {
        tick(dtMs / 1000);
        draw(tMs / 1000);
      });
    });

    if (window.IB && IB.scrolly && steps && graphic) {
      IB.scrolly(steps, graphic, i => goStep(i));
    }
  })();

  /* =========================================================
     2. COMPARACIÓ D'ESCALA DEL COPÈPODE (IB-16 + IB-10 + IB-35)
     ========================================================= */
  (function () {
    const copWrap = $("szCopWrap"), humWrap = $("szHumWrap");
    const out = $("szOut"), rg = $("szRng"), val = $("szVal"), lgd = $("szLgd");
    if (!copWrap || !humWrap) return;

    const BODY = 0.005, DIST = 500, RATIO = DIST / BODY, MAR = 42.195, KMAX = 270;
    const BCN = [41.3874, 2.1686];
    const CITIES = [
      ["Girona", 41.9794, 2.8214],
      ["Lleida", 41.6176, 0.62],
      ["Perpinyà", 42.6887, 2.8948],
      ["Tolosa", 43.6047, 1.4442]
    ];
    function hav(a, b) {
      const R = 6371, dl = (b[0] - a[0]) * D2R, dn = (b[1] - a[1]) * D2R;
      const s = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * D2R) * Math.cos(b[0] * D2R) * Math.sin(dn / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s));
    }
    const CD = CITIES.map(([n, la, lo]) => ({ n, d: hav(BCN, [la, lo]) }));

    if (lgd) {
      IBV.legendCat(lgd, [
        { c: C.vermell, t: "Recorregut d'anada", kind: "dot", a: 0.78 },
        { c: C.blau, t: "Ciutats des de Barcelona (línia recta)", kind: "dot", a: 0.35 }
      ]);
    }

    const tp = IBV.tip(humWrap);
    let ph = 0, km = 170;
    let copDot = null, copTrail = null, copTop = 16, copBot = 240;
    let humDot = null, humBar = null, humX = null, humBaseX = 8;

    function updateText() {
      const h = +rg.value;
      km = h * RATIO / 1000;
      const mar = km / MAR;
      val.textContent = fmt2(h) + " m";
      rg.setAttribute("aria-valuetext", fmt2(h) + " m");
      const n = Math.floor(mar), fr = mar - n;
      const mw = fr < 0.15 ? (n === 1 ? "una marató" : `${n} maratons`) :
        fr > 0.85 ? `gairebé ${n + 1} maratons` :
        (n === 1 ? "més d'una marató" : `més de ${n} maratons`);
      const near = CD.filter(c => c.d <= km * 1.04).sort((a, b) => b.d - a.d)[0];
      out.innerHTML = `Com si caminessis <b>${fmt0(km)} km</b> abans de sopar (${mw})${near ? `, més que de Barcelona a ${near.n} en línia recta` : ""}. I abans d'esmorzar, tornar.`;
      if (RM) syncAnim(1, 0.99);
    }

    function syncAnim(u, phase) {
      if (copDot && copTrail) {
        const y = lerp(copBot, copTop, u);
        copDot.attr("cy", y);
        copTrail.attr("y1", phase < 1 ? copBot : copTop).attr("y2", y);
      }
      if (humDot && humBar && humX) {
        const dNow = Math.min(km, KMAX);
        const x = humX(dNow * u);
        humDot.attr("cx", x);
        if (phase < 1) humBar.attr("x1", humBaseX).attr("x2", x);
        else humBar.attr("x1", x).attr("x2", humX(dNow));
      }
    }

    /* Columna d'aigua 500 m (IB-16) */
    IBV.mount(copWrap, (el, w) => {
      const m = mob(), h = m ? 184 : 290;
      const s = IBV.svg(el, w, h, "Una columna d'aigua de 500 metres. El copèpode, de 5 mil·límetres, la recorre de baix a dalt cada vespre.");
      copTop = 16; copBot = h - 18;
      const colX = m ? 18 : 26, colW = m ? 44 : 52;
      const gid = "szBlue" + Math.random().toString(36).slice(2, 6);
      const gr = s.append("defs").append("linearGradient").attr("id", gid).attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);
      gr.append("stop").attr("offset", 0).attr("stop-color", IBV.alpha(C.blau, 0.05));
      gr.append("stop").attr("offset", 0.45).attr("stop-color", IBV.alpha(C.blau, 0.16));
      gr.append("stop").attr("offset", 1).attr("stop-color", IBV.alpha(C.blauFosc, 0.28));

      s.append("rect").attr("x", colX).attr("y", copTop).attr("width", colW).attr("height", copBot - copTop).attr("fill", `url(#${gid})`);
      s.append("line").attr("x1", colX).attr("x2", colX + colW).attr("y1", copTop).attr("y2", copTop).attr("stroke", C.blau).attr("stroke-width", 1.2);
      s.append("line").attr("x1", colX).attr("x2", colX + colW).attr("y1", copBot).attr("y2", copBot).attr("stroke", C.hair).attr("stroke-width", 0.8);

      IBV.t(s, colX + colW + 10, copTop + 4, "0 m · Superfície", { size: IBV.FS.small, fill: C.blau, weight: 600 });
      IBV.t(s, colX + colW + 10, copBot + 3, "500 m", { size: IBV.FS.small, fill: C.muted });

      const px = (copBot - copTop) / RATIO;
      const ns = Math.round(1 / px);
      IBV.lines(s, colX + colW + 10, (copTop + copBot) / 2 - 14, [
        ["A aquesta escala,", false],
        [`${fmt0(ns)} vegades més`, true],
        ["petit que un píxel", false]
      ], { size: IBV.FS.small, fill: C.muted });

      copTrail = s.append("line").attr("x1", colX + colW / 2).attr("x2", colX + colW / 2)
        .attr("y1", copBot).attr("y2", copBot).attr("stroke", IBV.alpha(C.vermell, 0.55))
        .attr("stroke-width", 2.2).attr("stroke-linecap", "round");
      copDot = s.append("circle").attr("cx", colX + colW / 2).attr("cy", copBot)
        .attr("r", 4.5).attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.5);
      syncAnim(RM ? 1 : 0, RM ? 0.99 : 0);
    });

    /* Escala humana amb maratons i ciutats (IB-10 + IB-35) */
    IBV.mount(humWrap, (el, w) => {
      const m = mob(), h = m ? 128 : 138;
      const s = IBV.svg(el, w, h, "La mateixa distància a escala humana, comparada amb maratons i amb distàncies en línia recta des de Barcelona.");
      const ml = 10, mr = m ? 18 : 22, ty = 52;
      humBaseX = ml;
      const X = d3.scaleLinear([0, KMAX], [ml, w - mr]);
      humX = X;

      // Eix x suau al peu
      const ax = IBV.axisX(s, X, h - 22, [0, 50, 100, 150, 200, 250], v => v === 250 ? "250 km" : String(v));
      if (m) ax.selectAll("text").filter((_, i, n) => i === n.length - 1).attr("text-anchor", "end").attr("x", w - 4);

      // Pista base fina + barra activa translúcida
      s.append("line").attr("x1", X(0)).attr("x2", X(KMAX)).attr("y1", ty).attr("y2", ty)
        .attr("stroke", C.hair).attr("stroke-width", 4).attr("stroke-linecap", "round");
      humBar = s.append("line").attr("x1", X(0)).attr("x2", X(0)).attr("y1", ty).attr("y2", ty)
        .attr("stroke", IBV.alpha(C.vermell, 0.35)).attr("stroke-width", 6).attr("stroke-linecap", "round");

      // Fites de maratons
      for (let i = 1; i * MAR < KMAX; i++) {
        const x = X(i * MAR);
        s.append("line").attr("x1", x).attr("x2", x).attr("y1", ty - 10).attr("y2", ty + 10)
          .attr("stroke", C.ink2).attr("stroke-width", 0.9);
        IBV.t(s, x, ty - 16, (m ? "M" : "marató ") + i, { size: IBV.FS.min, anchor: "middle", fill: C.muted });
      }

      // Ciutats com a cercles translúcids multiply en blau (IB-35)
      const rCity = d3.scaleSqrt([0, KMAX], [5, m ? 8.5 : 10]);
      const cityG = s.append("g").selectAll("g.city").data(CD).join("g").attr("class", "city hit");
      cityG.append("circle")
        .attr("cx", d => X(d.d)).attr("cy", ty)
        .attr("r", d => rCity(d.d))
        .attr("fill", C.blau).attr("fill-opacity", 0.24)
        .style("mix-blend-mode", "multiply");
      cityG.append("circle")
        .attr("cx", d => X(d.d)).attr("cy", ty)
        .attr("r", 2.2).attr("fill", C.blau);

      cityG.each(function (d, i) {
        const gg = d3.select(this), x = X(d.d), dy = ty + 24 + (i % 2) * 14;
        const nearRight = x > w - (m ? 46 : 72);
        gg.append("line").attr("x1", x).attr("x2", x).attr("y1", ty + 4).attr("y2", dy - 10)
          .attr("stroke", C.muted).attr("stroke-width", 0.7);
        IBV.t(gg, nearRight ? Math.min(x + 4, w - 4) : x, dy, m ? d.n : `${d.n} · ${fmt0(d.d)} km`, {
          size: IBV.FS.min, anchor: nearRight ? "end" : "middle", fill: C.ink2, halo: true
        });
      });

      IBV.t(s, X(0), ty - 16, "Barcelona", { size: IBV.FS.min, fill: C.ink, weight: 600 });

      // Punt mòbil vermell
      humDot = s.append("circle").attr("cx", X(0)).attr("cy", ty)
        .attr("r", 6).attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.8);

      // Hover amb focus suau i lectura al dock
      const guide = s.append("line").attr("y1", ty - 16).attr("y2", h - 22)
        .attr("stroke", C.ink).attr("stroke-width", 0.8).attr("stroke-dasharray", "2 2").style("opacity", 0);

      IBV.hover(s.node(), (_ev, [mx]) => {
        const dKm = clamp(X.invert(mx), 0, KMAX);
        const near = d3.least(CD, c => Math.abs(X(c.d) - mx));
        const hitCity = near && Math.abs(X(near.d) - mx) < 26;
        if (hitCity) {
          IBV.focus(cityG, d => d === near);
          cityG.select("circle").attr("stroke", d => d === near ? C.ink : "none").attr("stroke-width", 1.4);
          guide.attr("x1", X(near.d)).attr("x2", X(near.d)).style("opacity", 0.7);
          tp.show(`<b>Barcelona → ${near.n}</b><br>${fmt0(near.d)} km en línia recta (${fmt1(near.d / MAR)} maratons)`);
        } else {
          IBV.focus(cityG, null);
          cityG.select("circle").attr("stroke", "none");
          guide.attr("x1", X(dKm)).attr("x2", X(dKm)).style("opacity", 0.5);
          tp.show(`<b>${fmt0(dKm)} km</b><br>${fmt1(dKm / MAR)} maratons · la teva escala: ${fmt0(km)} km`);
        }
      }, () => {
        IBV.focus(cityG, null);
        cityG.select("circle").attr("stroke", "none");
        guide.style("opacity", 0);
        tp.hide();
      });

      syncAnim(RM ? 1 : 0, RM ? 0.99 : 0);
    });

    rg.addEventListener("input", updateText);
    updateText();

    // Bucle contemplatiu (~16 s anada i tornada)
    IBV.loop($("sizefig"), (_t, dtMs) => {
      if (RM) { syncAnim(1, 0.99); return; }
      ph = (ph + (dtMs / 1000) * 0.125) % 2;
      const u = ph < 1 ? sm(ph * 1.12) : 1 - sm((ph - 1) * 1.12);
      syncAnim(u, ph);
    });
  })();

  /* =========================================================
     3. DADES MALASPINA PER REGIONS (IB-42 + IB-38)
     ========================================================= */
  (function () {
    const wrap = $("regwrap"), fig = $("regfig"), lgdEl = $("regLgd");
    if (!wrap || !fig) return;

    const D = [
      { n: "Pacífic oriental", s: ["Pacífic", "oriental"], d: 348, ni: 97, a: 251, p: 0.91, k: 12 },
      { n: "Altres zones", s: ["Altres", "zones"], d: 478, ni: 331, a: 146, p: 0.35, k: 36 },
      { n: "Atlàntic nord", s: ["Atlàntic", "nord"], d: 484, ni: 319, a: 165, p: 0.38, k: 23 },
      { n: "Pacífic occidental", s: ["Pacífic", "occidental"], d: 520, ni: 259, a: 261, p: 0.62, k: 22 },
      { n: "Sud de l'Índic", s: ["Sud de", "l'Índic"], d: 591, ni: 470, a: 120, p: 0.20, k: 12 },
      { n: "Totes les zones", s: ["Totes", "les zones"], d: 486, ni: 303, a: 183, p: 0.46, k: 105, all: 1 }
    ];

    const rScale = d3.scaleSqrt([0, 1], [6, 21]);
    if (lgdEl) {
      IBV.legendCat(lgdEl, [
        { c: C.ink, t: "De dia", kind: "dot" },
        { c: C.ink, t: "De nit", kind: "hollow" },
        { c: C.vermell, t: "Posició activa", kind: "dot", a: 0.42 }
      ]);
      IBV.legendSize(lgdEl, {
        values: [0.2, 0.5, 0.9],
        r: v => rScale(v) * 0.72,
        f: v => `${Math.round(v * 100)}%`,
        title: "Proporció que migra"
      });
    }

    const tp = IBV.tip(wrap);
    const btns = [...document.querySelectorAll("#regSeg button[data-v]")], playB = $("regPlay");
    let mode = "day", playing = null, moveFn = null;

    function setMode(v, anim) {
      mode = v;
      btns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
      if (moveFn) moveFn(anim !== false);
    }
    function stopPlay() {
      if (playing) { clearInterval(playing); playing = null; if (playB) playB.textContent = "Reprodueix"; }
    }
    function startPlay() {
      stopPlay();
      let n = 0;
      if (playB) playB.textContent = "Pausa";
      setMode(mode === "day" ? "night" : "day");
      playing = setInterval(() => {
        n++;
        setMode(mode === "day" ? "night" : "day");
        if (n >= 5) stopPlay();
      }, 2100);
    }
    btns.forEach(b => b.addEventListener("click", () => { stopPlay(); setMode(b.dataset.v); }));
    if (playB) playB.addEventListener("click", () => (playing ? stopPlay() : startPlay()));

    IBV.mount(wrap, (el, w) => {
      const m = mob(), narrow = w < 600;
      const ARIA = "Fondària mitjana de la capa de dia i de nit en cinc regions de l'expedició Malaspina. Pacífic oriental: 348 m de dia, 97 m de nit, migra el 91%. Sud de l'Índic: 591 i 470 m, 20%. Totes les zones: 486 i 303 m, 46%.";

      if (narrow) {
        const ml = 8, mr = 14, mt = 44, mb = 28, rowH = 62, gap = 14;
        const h = mt + D.length * rowH + gap + mb;
        const s = IBV.svg(el, w, h, ARIA);
        const x = d3.scaleLinear([0, 700], [ml, w - mr]);
        const rowY = i => mt + i * rowH + (D[i].all ? gap : 0);
        const rRow = d3.scaleSqrt([0, 1], [6, 15]);

        // Franja mundial de dia (200–650 m)
        s.append("rect")
          .attr("x", x(200)).attr("width", x(650) - x(200))
          .attr("y", mt - 6).attr("height", h - mb - (mt - 6))
          .attr("fill", C.neutral).attr("fill-opacity", 0.55);
        IBV.t(s, w - mr, mt - 12, "200–650 m: interval mundial de dia", {
          size: IBV.FS.min, anchor: "end", fill: C.muted, italic: true
        });
        IBV.t(s, ml, mt - 24, "0 m · Superfície", { size: IBV.FS.small, fill: C.blau, weight: 600 });

        // Quadrícula vertical recessiva + línia de superfície en blau
        for (let z = 0; z <= 700; z += 100) {
          s.append("line").attr("x1", x(z)).attr("x2", x(z))
            .attr("y1", mt - 6).attr("y2", h - mb)
            .attr("stroke", z === 0 ? C.blau : C.grid)
            .attr("stroke-width", z === 0 ? 1.3 : 0.7);
        }
        const ax = IBV.axisX(s, x, h - mb, [0, 200, 400, 600, 700], v => v === 700 ? "700 m" : String(v), { tick: false });
        ax.selectAll("text").filter((_, i, n) => i === 0).attr("text-anchor", "start");
        ax.selectAll("text").filter((_, i, n) => i === n.length - 1).attr("text-anchor", "end").attr("x", w - 4);

        // Separador per a «Totes les zones»
        const sepY = rowY(5) - gap / 2;
        s.append("line").attr("x1", ml).attr("x2", w - mr).attr("y1", sepY).attr("y2", sepY)
          .attr("stroke", C.hair).attr("stroke-width", 0.9);

        // Guia vertical de hover
        const vGuide = s.append("line").attr("y1", mt - 6).attr("y2", h - mb)
          .attr("stroke", C.ink).attr("stroke-width", 0.7).attr("stroke-dasharray", "2 3").style("opacity", 0);

        const rows = s.append("g").selectAll("g.col").data(D).join("g").attr("class", "col hit");
        const ycOf = (_, i) => rowY(i) + 38;

        rows.append("line")
          .attr("x1", x(0)).attr("x2", x(700))
          .attr("y1", ycOf).attr("y2", ycOf)
          .attr("stroke", C.hair).attr("stroke-width", 0.6);

        rows.each(function (d, i) {
          const gg = d3.select(this), ty = rowY(i) + 15;
          IBV.t(gg, ml, ty, d.n, { size: IBV.FS.label, fill: C.ink, weight: d.all ? 700 : 600 });
          IBV.t(gg, w - mr, ty, `migra el ${Math.round(d.p * 100)} %`, {
            size: IBV.FS.small, anchor: "end", fill: C.vermell, weight: 600
          });
        });

        const stems = rows.append("line")
          .attr("x1", d => x(d.d)).attr("x2", d => x(d.d))
          .attr("y1", ycOf).attr("y2", ycOf)
          .attr("stroke", C.ink2).attr("stroke-width", 1).attr("stroke-dasharray", "2 3");

        rows.append("circle").attr("cx", d => x(d.d)).attr("cy", ycOf).attr("r", 3.5).attr("fill", C.ink);
        rows.append("circle").attr("cx", d => x(d.ni)).attr("cy", ycOf).attr("r", 3.5)
          .attr("fill", C.paper).attr("stroke", C.ink).attr("stroke-width", 1.2);

        const halos = rows.append("circle")
          .attr("class", "reg-halo")
          .attr("cx", d => x(mode === "day" ? d.d : d.ni))
          .attr("cy", ycOf).attr("r", 0)
          .attr("fill", C.vermell).attr("fill-opacity", 0.34)
          .style("mix-blend-mode", "multiply");

        const cores = rows.append("circle")
          .attr("class", "reg-core")
          .attr("cx", d => x(mode === "day" ? d.d : d.ni))
          .attr("cy", ycOf).attr("r", 0)
          .attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.2);

        const labPos = d => {
          const v = mode === "day" ? d.d : d.ni;
          const leftSide = v > 500;
          return { x: x(v) + (leftSide ? -(rRow(d.p) + 6) : (rRow(d.p) + 6)), anchor: leftSide ? "end" : "start" };
        };

        const labs = rows.append("text")
          .attr("x", d => labPos(d).x)
          .attr("y", (_, i) => ycOf(_, i) + 4)
          .attr("text-anchor", d => labPos(d).anchor)
          .attr("font-size", IBV.FS.min).attr("font-weight", 600).attr("fill", C.ink)
          .style("font-variant-numeric", "tabular-nums")
          .text(d => `${mode === "day" ? d.d : d.ni} m`);
        IBV.halo(labs, 3);

        moveFn = anim => {
          const dur = anim && !RM ? 1050 : 0;
          halos.transition().duration(dur).ease(d3.easeCubicInOut).attr("cx", d => x(mode === "day" ? d.d : d.ni));
          cores.transition().duration(dur).ease(d3.easeCubicInOut).attr("cx", d => x(mode === "day" ? d.d : d.ni));
          labs.attr("text-anchor", d => labPos(d).anchor)
            .transition().duration(dur).ease(d3.easeCubicInOut)
            .attr("x", d => labPos(d).x)
            .tween("text", function (d) {
              const node = this, a = parseInt(node.textContent, 10), b = mode === "day" ? d.d : d.ni;
              const interp = d3.interpolateNumber(isNaN(a) ? b : a, b);
              return t => { node.textContent = Math.round(interp(t)) + " m"; };
            });
        };

        IBV.onView(el, instant => {
          const dur = instant ? 0 : IBV.DUR;
          stems.transition().duration(dur).ease(IBV.EASE).attr("x1", d => x(d.ni));
          halos.transition().duration(dur).delay((_, i) => instant ? 0 : i * 70).ease(IBV.EASE).attr("r", d => rRow(d.p));
          cores.transition().duration(dur).delay((_, i) => instant ? 0 : i * 70).ease(IBV.EASE).attr("r", 3.4);
        });

        IBV.hover(s.node(), (_ev, [, my]) => {
          if (my < mt - 6 || my > h - mb) {
            IBV.focus(rows, null); rows.select("circle.reg-halo").attr("stroke", "none");
            vGuide.style("opacity", 0); tp.hide(); return;
          }
          const idx = d3.leastIndex(D, (_, i) => Math.abs(ycOf(_, i) - my));
          if (idx == null || idx < 0) return;
          const d = D[idx];
          IBV.focus(rows, dd => dd === d);
          rows.select("circle.reg-halo")
            .attr("stroke", dd => dd === d ? C.ink : "none")
            .attr("stroke-width", 1.5);
          rows.filter(dd => dd === d).raise();
          const cx = x(mode === "day" ? d.d : d.ni);
          vGuide.attr("x1", cx).attr("x2", cx).style("opacity", 0.7);
          tp.show(`<b>${d.n}</b> · Dia ${d.d} m → Nit ${d.ni} m<br>Amplitud ${d.a} m · migra el ${Math.round(d.p * 100)} % (${d.k} parells)`);
        }, () => {
          IBV.focus(rows, null);
          rows.select("circle.reg-halo").attr("stroke", "none");
          vGuide.style("opacity", 0);
          tp.hide();
        });
        return;
      }

      const h = m ? 410 : 460;
      const mt = 30, mb = m ? 74 : 76, ml = 8, gx0 = m ? 34 : 46, mr = 10;
      const s = IBV.svg(el, w, h, ARIA);

      const y = d3.scaleLinear([0, 700], [mt, h - mb]);
      const gap = m ? 10 : 24;
      const bw = (w - gx0 - mr - gap) / D.length;
      const X = i => gx0 + i * bw + (D[i].all ? gap : 0) + bw / 2;
      const rCol = d3.scaleSqrt([0, 1], [5.5, m ? 14 : 21]);

      // Franja mundial de dia (Bianchi et al., 2013): 200–650 m
      s.append("rect")
        .attr("x", ml).attr("width", w - ml - mr)
        .attr("y", y(200)).attr("height", y(650) - y(200))
        .attr("fill", C.neutral).attr("fill-opacity", 0.55);
      IBV.t(s, w - mr - 4, y(650) - 6, m ? "200–650 m: interval mundial de dia" : "Interval mundial de fondàries de dia: 200–650 m (Bianchi et al., 2013)", {
        size: IBV.FS.min, anchor: "end", fill: C.muted, italic: true
      });

      // Quadrícula horitzontal recessiva amb IBV.gridY (0 m = superfície)
      IBV.gridY(s, y, ml, w - mr, [700, 600, 500, 400, 300, 200, 100, 0], v => String(v), { unit: " m" });
      s.append("line").attr("x1", ml).attr("x2", w - mr).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.blau).attr("stroke-width", 1.3);
      IBV.t(s, ml + 34, y(0) - 4, "· Superfície", { size: IBV.FS.small, fill: C.blau, weight: 600 });

      // Separador per a «Totes les zones»
      const sepX = X(5) - bw / 2 - gap / 2;
      s.append("line").attr("x1", sepX).attr("x2", sepX).attr("y1", y(0)).attr("y2", h - 10)
        .attr("stroke", C.hair).attr("stroke-width", 0.9);

      // Guia de hover horitzontal
      const hGuide = s.append("line").attr("x1", ml).attr("x2", w - mr)
        .attr("stroke", C.ink).attr("stroke-width", 0.7).attr("stroke-dasharray", "2 3").style("opacity", 0);

      // Columnes per regió
      const cols = s.append("g").selectAll("g.col").data(D).join("g").attr("class", "col hit");

      const stems = cols.append("line")
        .attr("x1", (_, i) => X(i)).attr("x2", (_, i) => X(i))
        .attr("y1", d => y(d.d)).attr("y2", d => y(d.d))
        .attr("stroke", C.ink2).attr("stroke-width", 1).attr("stroke-dasharray", "2 3");

      cols.append("circle").attr("cx", (_, i) => X(i)).attr("cy", d => y(d.d)).attr("r", 3.5).attr("fill", C.ink);
      cols.append("circle").attr("cx", (_, i) => X(i)).attr("cy", d => y(d.ni)).attr("r", 3.5)
        .attr("fill", C.paper).attr("stroke", C.ink).attr("stroke-width", 1.2);

      // Cercle translúcid multiply proporcional al % que migra (IB-38)
      const halos = cols.append("circle")
        .attr("class", "reg-halo")
        .attr("cx", (_, i) => X(i))
        .attr("cy", d => y(mode === "day" ? d.d : d.ni))
        .attr("r", 0)
        .attr("fill", C.vermell).attr("fill-opacity", 0.34)
        .style("mix-blend-mode", "multiply");

      const cores = cols.append("circle")
        .attr("class", "reg-core")
        .attr("cx", (_, i) => X(i))
        .attr("cy", d => y(mode === "day" ? d.d : d.ni))
        .attr("r", 0)
        .attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.2);

      const labs = cols.append("text")
        .attr("x", (_, i) => X(i) + (m ? 0 : 12))
        .attr("y", d => y(mode === "day" ? d.d : d.ni) + (m ? -rCol(d.p) - 5 : 4))
        .attr("text-anchor", m ? "middle" : "start")
        .attr("font-size", m ? IBV.FS.min : IBV.FS.label)
        .attr("font-weight", 600).attr("fill", C.ink)
        .style("font-variant-numeric", "tabular-nums")
        .text(d => (mode === "day" ? d.d : d.ni) + (m ? "" : " m"));
      IBV.halo(labs, 3);

      // Noms de regió i % que migra al peu
      const by = h - mb + 18;
      cols.each(function (d, i) {
        const gg = d3.select(this), x = X(i);
        IBV.lines(gg, x, by, d.s.map(t => [t, !!d.all]), {
          size: m ? IBV.FS.min : IBV.FS.label, anchor: "middle", fill: C.ink, weight: d.all ? 700 : 600
        });
        IBV.t(gg, x, by + (m ? 38 : 42), `${Math.round(d.p * 100)} %`, {
          size: IBV.FS.small, anchor: "middle", fill: C.vermell, weight: 600
        });
      });

      // Anotació editorial quirúrgica (desktop)
      if (!m) {
        IBV.note(s, {
          x: X(0) + rCol(D[0].p) * 0.7, y: y(215),
          tx: X(0) + 42, ty: y(150),
          kind: "curve", bend: -12,
          lines: [["Poc oxigen a fondària", true], ["es queda més amunt,", false], ["però en puja el 91 %", false]]
        });
      }

      // Moviment suau entre dia i nit
      moveFn = anim => {
        const dur = anim && !RM ? 1050 : 0, suf = m ? "" : " m";
        halos.transition().duration(dur).ease(d3.easeCubicInOut).attr("cy", d => y(mode === "day" ? d.d : d.ni));
        cores.transition().duration(dur).ease(d3.easeCubicInOut).attr("cy", d => y(mode === "day" ? d.d : d.ni));
        labs.transition().duration(dur).ease(d3.easeCubicInOut)
          .attr("y", d => y(mode === "day" ? d.d : d.ni) + (m ? -rCol(d.p) - 5 : 4))
          .tween("text", function (d) {
            const node = this, a = parseInt(node.textContent, 10), b = mode === "day" ? d.d : d.ni;
            const interp = d3.interpolateNumber(isNaN(a) ? b : a, b);
            return t => { node.textContent = Math.round(interp(t)) + suf; };
          });
      };

      // Entrada animada (IBV.onView)
      IBV.onView(el, instant => {
        const dur = instant ? 0 : IBV.DUR;
        stems.transition().duration(dur).ease(IBV.EASE).attr("y1", d => y(d.ni));
        halos.transition().duration(dur).delay((_, i) => instant ? 0 : i * 70).ease(IBV.EASE).attr("r", d => rCol(d.p));
        cores.transition().duration(dur).delay((_, i) => instant ? 0 : i * 70).ease(IBV.EASE).attr("r", 3.4);
      });

      // Hover amb IBV.hover + IBV.focus + IBV.tip dock
      IBV.hover(s.node(), (_ev, [mx]) => {
        const idx = d3.leastIndex(D, (_, i) => Math.abs(X(i) - mx));
        if (idx == null || idx < 0) return;
        const d = D[idx];
        IBV.focus(cols, dd => dd === d);
        cols.select("circle.reg-halo")
          .attr("stroke", dd => dd === d ? C.ink : "none")
          .attr("stroke-width", 1.5);
        cols.filter(dd => dd === d).raise();
        const cy = y(mode === "day" ? d.d : d.ni);
        hGuide.attr("y1", cy).attr("y2", cy).style("opacity", 0.7);
        tp.show(`<b>${d.n}</b> · Dia ${d.d} m → Nit ${d.ni} m<br>Amplitud ${d.a} m · migra el ${Math.round(d.p * 100)} % (${d.k} parells)`);
      }, () => {
        IBV.focus(cols, null);
        cols.select("circle.reg-halo").attr("stroke", "none");
        hGuide.style("opacity", 0);
        tp.hide();
      });
    });
  })();

  /* =========================================================
     4. ECOGRAMA SIMULAT (IB-37 / IB-56 + IB-03)
     ========================================================= */
  (function () {
    const stack = $("echoStack"), wrap = $("echowrap"), lgdEl = $("echoLgd");
    const note = $("echoNote"), replay = $("echoPlay");
    const btns = [...document.querySelectorAll("#echoSeg button")];
    if (!stack || !wrap) return;

    const ARIA = "Ecograma simulat: el temps d'esquerra a dreta i la fondària de dalt a baix. La capa d'animals puja de nit i baixa de dia. Es pot triar entre lluna nova, lluna plena, un dia de núvols i la nit polar.";
    const blueSeq = d3.scaleSequential(d3.piecewise(d3.interpolateLab, ["#FFFFFF", "#E6EEF8", C.blauClar, C.blau, C.blauFosc])).domain([0, 1]).clamp(true);
    const lightSeq = d3.scaleLinear().domain([-3.2, -1.2, 0.8, 3.0, 5.0])
      .range([C.blauFosc, C.blau, C.blauClar, C.grocClar, C.groc]).clamp(true);

    if (lgdEl) {
      IBV.legendRamp(lgdEl, {
        scale: blueSeq, min: 0, max: 1, ticks: [0, 1],
        f: v => (v === 0 ? "0" : "Màx"),
        title: "Densitat d'eco simulada", lo: "Pocs animals", hi: "Més densitat", w: 160
      });
    }

    const PRE = {
      nova: {
        lat: 0, dec: 0, K: 0.035, day: 450, hours: 72, t0: 12, moon: 0, zMax: 620, res: 540, mf: 0.5,
        note: "Sense lluna, la nit és fosca del tot: la capa puja fins a la superfície i, de dia, baixa a uns 450 metres. A sota, la part que no migra."
      },
      plena: {
        lat: 0, dec: 0, K: 0.035, day: 450, hours: 72, t0: 12, moon: 1, zMax: 620, res: 540, mf: 0.5,
        note: "Amb lluna plena, la penombra que busquen els animals ja no arriba a la superfície. En aquest model, la capa passa la nit unes desenes de metres més avall i només s'acosta a la superfície quan la lluna és baixa, poc després de sortir o abans de pondre's."
      },
      nuvols: {
        lat: 50, dec: 20, K: 0.05, day: 300, hours: 48, t0: 0, moon: 0, clouds: 1, zMax: 440, res: 380, mf: 0.5,
        note: "Latitud 50° N, a l'estiu. Primer, un dia clar. L'endemà, cada vegada que un núvol tapa el sol, la penombra puja uns metres i la capa la segueix. Quan el sol torna, baixa."
      },
      polar: {
        lat: 79, dec: -23.4, K: 0.06, day: 0, pref: -2.5, hours: 144, t0: 0, moon: 2, zMax: 200, res: 0, mf: 0.85,
        note: "Svalbard, 79° N, al desembre: el sol no surt en tot el dia. La lluna plena no es pon i marca el ritme. Cada cicle dura 24,8 hores, i per això la pujada arriba cada dia una mica més tard que les marques de les 24 hores."
      }
    };

    function moonL(p, t) {
      if (!p.moon) return -9;
      let dec = 0, illum = 1;
      const tr = (24 - p.t0) % 24;
      if (p.moon === 2) { dec = 23; const tFull = p.hours / 2; illum = 0.5 * (1 + Math.cos(2 * Math.PI * (t - tFull) / 708.7)); }
      const H = (t - tr) * 360 / 24.84;
      const s = Math.sin(p.lat * D2R) * Math.sin(dec * D2R) + Math.cos(p.lat * D2R) * Math.cos(dec * D2R) * Math.cos(H * D2R);
      if (s <= 0) return -9;
      return Math.log10(0.25 * s * Math.pow(illum, 3));
    }

    function clouds(t) {
      if (t < 24) return 1;
      const r = IBV.rng(11);
      let f = 1;
      for (let k = 0; k < 26; k++) {
        const c = 24 + 5 + r() * 14, w = 0.08 + r() * 0.35, a = 0.35 + r() * 0.6;
        f *= 1 - a * Math.exp(-Math.pow((t - c) / w, 2));
      }
      return clamp(f, 0.08, 1);
    }

    function simulate(p) {
      const kd = p.K * Math.LOG10E, dt = 1 / 30, n = Math.round(p.hours / dt) + 1;
      const surf = t => {
        const tt = p.t0 + t;
        let L = lxSun(sunEl(tt % 24, p.lat, p.dec));
        if (p.clouds) L += Math.log10(clouds(t));
        return addL(L, moonL(p, t));
      };
      const pref = p.pref != null ? p.pref : lxSun(sunEl(12, p.lat, p.dec)) - kd * p.day;
      const zmax = p.day || 150, vu = 0.065 * 3600 * dt, vd = 0.076 * 3600 * dt;
      const tgt = t => clamp((surf(t) - pref) / kd, 4, zmax);
      let z = tgt(-24);
      for (let t = -24; t < 0; t += dt) z += clamp(tgt(t) - z, -vu, vd);
      const T = new Float32Array(n), L = new Float32Array(n), Z = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i * dt;
        z += clamp(tgt(t) - z, -vu, vd);
        T[i] = t; L[i] = surf(t); Z[i] = z;
      }
      return { T, L, Z, n, dt };
    }

    // Taula precalculada RGB de la rampa blava sobre blanc per a rendiment instantani
    const LUT = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
      const col = d3.rgb(blueSeq(i / 255));
      LUT[i * 3] = col.r; LUT[i * 3 + 1] = col.g; LUT[i * 3 + 2] = col.b;
    }

    const tp = IBV.tip(wrap);
    let P = "nova", DATA = null, W = 0, H = 0, ctx = null, overSvg = null, plot = {};
    let img = null, rev = 1, revT = 0, loopH = null, hLine = null, hDot = null;

    function buildOffscreen() {
      const p = PRE[P];
      DATA = simulate(p);
      const pw = Math.max(10, Math.round(plot.w)), phh = Math.max(10, Math.round(plot.h));
      const oc = document.createElement("canvas");
      oc.width = pw; oc.height = phh;
      const o = oc.getContext("2d");
      const id = o.createImageData(pw, phh), px = id.data;
      const sig = p.zMax * 0.052, sig2 = p.zMax * 0.072, r = IBV.rng(5);
      const noise = new Float32Array(pw * phh);
      for (let i = 0; i < noise.length; i++) noise[i] = r();

      for (let x = 0; x < pw; x++) {
        const i = Math.min(DATA.n - 1, Math.round((x / pw) * (DATA.n - 1)));
        const zl = DATA.Z[i];
        for (let yy = 0; yy < phh; yy++) {
          const z = (yy / phh) * p.zMax;
          let v = p.mf * Math.exp(-Math.pow((z - zl) / sig, 2) / 2) * 1.08;
          if (zl < sig * 1.2) v += p.mf * 0.45 * Math.exp(-Math.pow((z - zl * 0.6) / (sig * 1.6), 2) / 2);
          if (p.res) v += (1 - p.mf) * 1.12 * Math.exp(-Math.pow((z - p.res) / sig2, 2) / 2);
          v += 0.03 * Math.exp(-z / (p.zMax * 0.14));
          const nz = (noise[yy * pw + x] + noise[yy * pw + Math.max(0, x - 1)] + noise[Math.max(0, yy - 1) * pw + x]) / 3;
          v = v * (0.64 + 0.72 * nz);
          const idx = Math.min(255, Math.max(0, Math.round(clamp(v, 0, 1) * 255))) * 3;
          const k = (yy * pw + x) * 4;
          px[k] = LUT[idx]; px[k + 1] = LUT[idx + 1]; px[k + 2] = LUT[idx + 2]; px[k + 3] = 255;
        }
      }
      o.putImageData(id, 0, 0);
      img = oc;
      if (note) note.textContent = p.note;
    }

    function drawOverlay() {
      if (!overSvg || !DATA) return;
      const m = mob(), p = PRE[P];
      overSvg.selectAll("*").remove();
      const X = d3.scaleLinear([0, p.hours], [plot.x, plot.x + plot.w]);
      const Y = d3.scaleLinear([0, p.zMax], [plot.y, plot.y + plot.h]);

      // Etiqueta de la banda de llum
      IBV.t(overSvg, plot.x, plot.y - 18, "Llum en superfície (groc = dia · blau fosc = nit)", {
        size: IBV.FS.min, fill: C.muted
      });

      // Eix de fondària
      const stepZ = p.zMax > 300 ? 100 : 50;
      for (let z = 0; z <= p.zMax; z += stepZ) {
        overSvg.append("line").attr("x1", plot.x).attr("x2", plot.x + plot.w)
          .attr("y1", Y(z)).attr("y2", Y(z))
          .attr("stroke", z === 0 ? C.blau : C.grid).attr("stroke-width", z === 0 ? 1.1 : 0.6)
          .attr("stroke-opacity", z === 0 ? 1 : 0.55);
        IBV.t(overSvg, plot.x - 7, Y(z) + 4, z === 0 ? "0 m" : String(z), {
          size: IBV.FS.small, anchor: "end", fill: C.muted
        });
      }

      // Eix de temps
      const narrow = W < 600;
      const st = p.hours > 96 ? (narrow ? 24 : 12) : 6;
      for (let h = 0; h <= p.hours; h += st) {
        const x = X(h), hr = (p.t0 + h) % 24;
        overSvg.append("line").attr("x1", x).attr("x2", x)
          .attr("y1", plot.y + plot.h).attr("y2", plot.y + plot.h + (hr === 0 ? 6 : 4))
          .attr("stroke", hr === 0 ? C.ink2 : C.hair);
        if (m && hr !== 0 && hr !== 12) continue;
        const lbl = p.hours > 96 && narrow ? `${h} h` : (hr === 0 ? "0 h" : hr + " h");
        const isLast = h === p.hours && narrow;
        IBV.t(overSvg, isLast ? W - 4 : clamp(x, plot.x + 12, W - 14), plot.y + plot.h + 18, lbl, {
          size: IBV.FS.small, anchor: isLast ? "end" : "middle", fill: hr === 0 ? C.ink : C.muted, weight: hr === 0 ? 600 : 400
        });
      }

      // Anotacions per escenari (IBV.note)
      const annG = overSvg.append("g").attr("class", "echo-ann");
      if (P === "nova" || P === "plena") {
        const zn = DATA.Z[Math.min(DATA.n - 1, Math.round(36 / DATA.dt))];
        IBV.note(annG, {
          x: X(36), y: Y(Math.max(zn, 10)),
          tx: X(36) + (m ? -12 : 16), ty: Y(Math.max(zn, 10)) + (P === "plena" ? 56 : 52),
          kind: "straight", dot: true, anchor: m ? "end" : "start",
          lines: [[P === "plena" ? `Mitjanit amb lluna: ~${Math.round(zn / 5) * 5} m` : "Mitjanit: a la superfície", true]]
        });
        IBV.t(annG, X(24), Y(450) - 18, "Migdia: ~450 m", { size: IBV.FS.small, weight: 700, anchor: "middle", halo: true });
        if (!m) IBV.t(annG, X(60), Y(p.res) + 22, "Part que no migra", { size: IBV.FS.small, anchor: "middle", fill: C.ink2, italic: true, halo: true });
      } else if (P === "nuvols") {
        IBV.t(annG, X(12), Y(55), "Dia clar", { size: IBV.FS.label, weight: 700, anchor: "middle", halo: true });
        IBV.t(annG, X(36), Y(55), "Dia de núvols", { size: IBV.FS.label, weight: 700, anchor: "middle", fill: C.vermell, halo: true });
      } else if (P === "polar") {
        for (let d = 1; d * 24 < p.hours; d++) {
          overSvg.append("line").attr("x1", X(d * 24)).attr("x2", X(d * 24))
            .attr("y1", plot.y).attr("y2", plot.y + plot.h)
            .attr("stroke", C.vermell).attr("stroke-opacity", 0.55).attr("stroke-dasharray", "3 3");
        }
        IBV.t(annG, X(24) + 5, plot.y + plot.h - 10, "Marques cada 24 h (cicle lunar: 24,8 h)", {
          size: IBV.FS.small, weight: 600, fill: C.vermell, halo: true
        });
        IBV.t(annG, plot.x + plot.w - 6, plot.y + 16, "Atenció: escala 0–200 m", {
          size: IBV.FS.small, weight: 700, anchor: "end", fill: C.vermell, halo: true
        });
      }

      // Guia interactiva de hover
      hLine = overSvg.append("line").attr("y1", plot.y).attr("y2", plot.y + plot.h)
        .attr("stroke", C.ink).attr("stroke-width", 0.9).attr("stroke-dasharray", "2 2").style("opacity", 0);
      hDot = overSvg.append("circle").attr("r", 4.5).attr("fill", C.vermell)
        .attr("stroke", C.paper).attr("stroke-width", 1.5).style("opacity", 0);
    }

    function drawCanvas() {
      if (!ctx || !img || !DATA) return;
      const c = ctx;
      c.clearRect(0, 0, W, H);
      // Banda de llum en superfície (paleta estricta blauFosc → blauClar → groc)
      const sh = 9, sy = plot.y - sh - 5;
      for (let x = 0; x < plot.w; x += 2) {
        const i = Math.round((x / plot.w) * (DATA.n - 1));
        c.fillStyle = lightSeq(DATA.L[i]);
        c.fillRect(plot.x + x, sy, 2.5, sh);
      }
      // Ecograma revelat sobre paper blanc (sense caixa grisa a la part pendent)
      const rw = plot.w * rev;
      if (rw > 1) {
        c.drawImage(img, 0, 0, Math.max(1, img.width * rev), img.height, plot.x, plot.y, rw, plot.h);
      }
      if (rev > 0 && rev < 1) {
        c.fillStyle = C.vermell;
        c.fillRect(plot.x + rw - 1, plot.y - 2, 1.5, plot.h + 4);
      }
    }

    function startReveal(instant) {
      if (loopH) { loopH.stop(); loopH = null; }
      if (instant || RM) { rev = 1; drawCanvas(); return; }
      rev = 0; revT = performance.now();
      loopH = IBV.loop(stack, () => {
        rev = clamp((performance.now() - revT) / 2200, 0, 1);
        drawCanvas();
        if (rev >= 1 && loopH) { loopH.stop(); loopH = null; }
      });
    }

    function setP(v) {
      P = v;
      btns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
      buildOffscreen();
      drawOverlay();
      startReveal(false);
    }
    btns.forEach(b => b.addEventListener("click", () => setP(b.dataset.v)));
    if (replay) replay.addEventListener("click", () => startReveal(false));

    IBV.mount(stack, (el, w) => {
      const m = mob();
      W = w; H = m ? 320 : 420;
      plot = { x: m ? 38 : 48, y: 36, w: 0, h: 0 };
      plot.w = W - plot.x - 10;
      plot.h = H - plot.y - 28;

      const built = IBV.canvas(el, W, H, ARIA);
      ctx = built.ctx;
      d3.select(el).selectAll("svg.ibv-over").remove();
      overSvg = d3.select(el).append("svg").attr("class", "ibv-over")
        .attr("width", W).attr("height", H).attr("viewBox", `0 0 ${W} ${H}`)
        .style("font-family", IBV.SANS).style("cursor", "crosshair");

      buildOffscreen();
      drawOverlay();

      IBV.hover(overSvg.node(), (_ev, [mx, my]) => {
        if (!DATA || mx < plot.x || mx > plot.x + plot.w || my < plot.y - 16 || my > plot.y + plot.h) {
          if (hLine) hLine.style("opacity", 0);
          if (hDot) hDot.style("opacity", 0);
          tp.hide();
          return;
        }
        const p = PRE[P];
        const i = Math.round(((mx - plot.x) / plot.w) * (DATA.n - 1));
        const t = DATA.T[i], tt = p.t0 + t, L = DATA.L[i], z = DATA.Z[i];
        const light = L > 2.8 ? "sol" : L > 0.4 ? "crepuscle" : L > -1.6 ? "lluna" : "fosc";
        const cy = plot.y + (z / p.zMax) * plot.h;
        if (hLine) hLine.attr("x1", mx).attr("x2", mx).style("opacity", 0.8);
        if (hDot) hDot.attr("cx", mx).attr("cy", cy).style("opacity", 1);
        tp.show(`<b>Dia ${Math.floor(tt / 24) + 1}, ${hhmm(tt)}</b><br>Capa a ${fmt0(z)} m · llum en superfície: ${light}`);
      }, () => {
        if (hLine) hLine.style("opacity", 0);
        if (hDot) hDot.style("opacity", 0);
        tp.hide();
      });

      IBV.onView(el, instant => startReveal(instant));
    });
  })();

  /* =========================================================
     5. BOMBA DE CARBONI (IB-16 + IB-40, scrolly)
     ========================================================= */
  (function () {
    const stack = $("cStack"), plotEl = $("cPlot"), lgdEl = $("cLgd");
    if (!stack || !plotEl) return;
    const graphic = $("cgraph"), steps = $("csteps"), tEl = $("cTitle"), sEl = $("cSub");
    const ARIA = "Esquema de la bomba biològica: el fitoplàncton absorbeix CO₂ a la superfície; la neu marina s'enfonsa lentament; els animals migradors mengen a dalt de nit i baixen abans de l'alba; de dia respiren CO₂ i deixen excrements a centenars de metres de fondària.";

    if (lgdEl) {
      IBV.legendCat(lgdEl, [
        { c: C.blau, t: "Fitoplàncton", kind: "dot", a: 0.7 },
        { c: C.vermell, t: "Migradors", kind: "dot", a: 0.85 },
        { c: C.muted, t: "Neu marina", kind: "dot", a: 0.55 },
        { c: C.blauFosc, t: "Excrements", kind: "dot", a: 0.85 },
        { c: C.ink, t: "CO₂", kind: "hollow" }
      ]);
    }

    const tp = IBV.tip(plotEl);
    const ZM = 1100, DAY = 0.75;
    const r = IBV.rng(3);
    let PH = [], MG = [], snow = [], poop = [], co2 = [], air = [];
    const F = { snow: 0, mig: 0, rel: 0, seq: 0, air: 1, arr: 0 };
    const CS = [
      { air: 1, sub: "El fitoplàncton fixa el CO₂ a la zona il·luminada" },
      { air: 0.6, snow: 1, sub: "La neu marina s'enfonsa a 10–100 m al dia" },
      { air: 0.4, snow: 0.7, mig: 1, arr: 1, seg: [0.16, 0.7], rmPh: 0.48, sub: "De la nit a l'alba, en bucle" },
      { air: 0.3, snow: 0.6, mig: 1, rel: 1, sub: "Respiració i excrements a la zona crepuscular" },
      { air: 0.3, snow: 0.5, mig: 1, rel: 1, seq: 1, sub: "Temps de segrest segons la fondària (Boyd et al., 2019)" }
    ];
    let step = 0, ph = DAY, hold = 0, meanZ = 0, hoverZ = null;
    const nightF = p => p < 0.42 ? 1 : p < 0.52 ? 1 - sm((p - 0.42) / 0.1) : p < 0.92 ? 0 : sm((p - 0.92) / 0.08);

    function migZ(a, p) {
      const u = ((p - a.tj) % 1 + 1) % 1;
      if (u < 0.05) return lerp(a.dd, a.nd, sm(0.5 + u / 0.1));
      if (u < 0.42) return a.nd;
      if (u < 0.55) return lerp(a.nd, a.dd, sm((u - 0.42) / 0.13));
      if (u < 0.92) return a.dd;
      return lerp(a.dd, a.nd, sm((u - 0.92) / 0.13));
    }

    function initParticles() {
      PH = [];
      for (let i = 0; i < (mob() ? 150 : 250); i++) {
        PH.push({ x: r(), z: clamp(14 + Math.pow(r(), 0.9) * 115, 4, 155), w: r() * 6.283 });
      }
      MG = [];
      for (let i = 0; i < (mob() ? 32 : 52); i++) {
        MG.push({ x: 0.06 + r() * 0.88, nd: 10 + r() * 80, dd: 360 + r() * 230, tj: r() * 0.03, type: r() < 0.5 ? 2 : r() < 0.6 ? 1 : 3, gut: 0, z: null, w: r() * 6.283 });
      }
      snow = []; poop = []; co2 = []; air = [];
      if (RM) placeStatic();
    }

    function placeStatic() {
      const q = IBV.rng(17);
      air = []; snow = []; co2 = []; poop = [];
      for (let i = 0; i < 14; i++) air.push({ x: q(), z: 5 + q() * 90, a: 0.8 });
      for (let i = 0; i < 100; i++) {
        const z = 30 + Math.pow(q(), 1.3) * 850;
        snow.push({ x: q(), z, a: clamp(1 - z / 950, 0.1, 1), v: 0, dec: 0 });
      }
      for (const a of MG) { a.z = migZ(a, ph); a.gut = step >= 2 ? 1 : 0; }
      if (CS[step].rel) {
        for (const a of MG) {
          if (q() < 0.6) co2.push({ x: a.x + (q() - 0.5) * 0.01, z: a.z - 10 - q() * 40, a: 0.45 + q() * 0.45, v: 0, dx: 0 });
          if (q() < 0.5) poop.push({ x: a.x, z: a.z + 20 + q() * 380, a: 0.85, v: 0 });
        }
      }
    }
    initParticles();

    let ctx = null, cvNode = null, W = 0, H = 0, skyH = 0, y0 = 0, ML = 0, MR = 0;
    const yz = z => y0 + (z / ZM) * (H - y0 - 4);
    const zy = y => clamp((y - y0) / (H - y0 - 4) * ZM, 0, ZM);

    function setStep(i) {
      step = i;
      const s = CS[i] || CS[0];
      if (s.seg) { ph = RM ? s.rmPh : s.seg[0]; hold = 0; }
      else if (RM) ph = DAY;
      if (s.rel) for (const a of MG) a.gut = Math.max(a.gut, 0.8);
      if (RM) { for (const k in F) F[k] = s[k] || 0; placeStatic(); draw(0); }
    }

    function glyphC(c, x, y, s, type) {
      if (type === 1) {
        c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 3 * s, y + 0.5 * s); c.quadraticCurveTo(x, y - 1.3 * s, x + 3 * s, y + 0.3 * s); c.stroke();
      } else if (type === 2) {
        c.beginPath(); c.ellipse(x, y, 3.2 * s, 1.35 * s, 0, 0, 6.283); c.fill();
        c.beginPath(); c.moveTo(x - 2.8 * s, y); c.lineTo(x - 4.8 * s, y - 1.4 * s); c.lineTo(x - 4.8 * s, y + 1.4 * s); c.closePath(); c.fill();
      } else {
        c.beginPath(); c.moveTo(x - 3 * s, y); c.lineTo(x + 1.5 * s, y - 1.3 * s); c.lineTo(x + 1.5 * s, y + 1.3 * s); c.closePath(); c.fill();
      }
    }

    function tick(dt) {
      const tg = CS[step] || CS[0];
      if (!RM) {
        for (const k in F) F[k] += ((tg[k] || 0) - F[k]) * Math.min(1, dt * 2.4);
        if (tg.seg) {
          if (hold > 0) { hold -= dt; if (hold <= 0) ph = tg.seg[0]; }
          else { ph += dt * 0.068; if (ph >= tg.seg[1]) { ph = tg.seg[1]; hold = 1.8; } }
        } else {
          ph += (DAY - ph) * Math.min(1, dt * 1.4);
        }
        const n = nightF(ph);
        if (r() < dt * 5 * F.air) air.push({ x: r(), z: -skyH * 0.85 / ((H - y0) / ZM), v: 24 + r() * 16, end: 12 + r() * 88, a: 1 });
        for (const b of air) { b.z += b.v * dt; if (b.z > b.end) b.a -= dt * 1.8; }
        air = air.filter(b => b.a > 0);

        if (r() < dt * 7 * F.snow) snow.push({ x: r(), z: 20 + r() * 80, v: 14 + r() * 8, a: 1, dec: 0.0012 + r() * 0.0015 });
        for (const s of snow) { s.z += s.v * dt; s.a -= s.dec * s.v * dt; }
        snow = snow.filter(s => s.a > 0 && s.z < ZM);

        for (const a of MG) {
          const z = migZ(a, ph);
          a.z = a.z == null ? z : a.z + (z - a.z) * Math.min(1, dt * 5);
          if (a.z < 130 && n > 0.5) a.gut = Math.min(1, a.gut + dt * 0.85);
          if (a.z > 300 && n < 0.5 && a.gut > 0) {
            a.gut = Math.max(tg.rel ? 0.35 : 0, a.gut - dt * 0.14);
            if (F.rel > 0.3 && r() < dt * 0.8 * F.rel) co2.push({ x: a.x, z: a.z, v: -(7 + r() * 7), a: 1, dx: (r() - 0.5) * 0.01 });
            if (F.rel > 0.3 && r() < dt * 0.45 * F.rel) poop.push({ x: a.x, z: a.z + 6, v: 58 + r() * 34, a: 1 });
          }
        }
        for (const b of co2) { b.z += b.v * dt; b.x += b.dx * dt; b.a -= dt * 0.28; }
        co2 = co2.filter(b => b.a > 0);
        for (const p of poop) { p.z += p.v * dt; if (p.z > 950) p.a -= dt * 1.1; }
        poop = poop.filter(p => p.a > 0 && p.z < ZM);
      }
      let sum = 0; for (const a of MG) sum += a.z || 0;
      meanZ = MG.length ? sum / MG.length : 0;
      const n = F.mig > 0.05 ? nightF(ph) : 0;
      const ts = n > 0.5 ? "Nit" : F.mig > 0.05 && ph > 0.42 && ph < 0.56 ? "Alba" : "Dia";
      if (tEl && tEl.textContent !== ts) tEl.textContent = ts;
      if (sEl && sEl.textContent !== tg.sub) sEl.textContent = tg.sub;
    }

    function draw(tt) {
      if (!ctx || !W) return;
      const c = ctx, m = mob(), fs = m ? 11 : 12.5;
      const n = F.mig > 0.05 ? nightF(ph) * clamp(F.mig, 0, 1) : 0;
      c.clearRect(0, 0, W, H);

      // Cel clar (paper blanc + bany suau, sense caixa fosca)
      const sg = c.createLinearGradient(0, 0, 0, skyH);
      sg.addColorStop(0, IBV.alpha(n > 0.5 ? C.blauFosc : C.groc, n > 0.5 ? 0.09 : 0.05));
      sg.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = sg;
      c.fillRect(ML, 0, W - ML - MR, skyH);
      cTxt(c, [["Aire", 1]], ML + 6, skyH - 7, { fs: IBV.FS.small, col: C.ink2, halo: false });

      // Columna d'aigua (IB-16: rampa blava suau sobre paper blanc)
      const wg = c.createLinearGradient(0, y0, 0, H);
      wg.addColorStop(0, IBV.alpha(C.blau, lerp(0.02, 0.11, n)));
      wg.addColorStop(0.5, IBV.alpha(C.blau, lerp(0.10, 0.18, n)));
      wg.addColorStop(1, IBV.alpha(C.blauFosc, lerp(0.22, 0.28, n)));
      c.fillStyle = wg;
      c.fillRect(ML, y0, W - ML - MR, H - y0);

      c.strokeStyle = C.blau; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(ML, y0); c.lineTo(W - MR, y0); c.stroke();

      // Eix de fondària
      for (let z = 0; z <= 1000; z += 200) {
        const y = yz(z);
        c.strokeStyle = C.grid; c.lineWidth = 0.6;
        c.beginPath(); c.moveTo(ML, y); c.lineTo(W - MR, y); c.stroke();
        cTxt(c, [z === 0 ? "0 m" : String(z)], ML - 6, y + (z === 0 ? fs * 0.85 : 4), {
          al: "right", fs: IBV.FS.small, col: C.muted, halo: false
        });
      }

      // CO₂ de l'aire (cercles buits en tinta)
      c.lineWidth = 1; c.strokeStyle = C.ink2;
      for (const b of air) {
        c.globalAlpha = b.a * clamp(F.air, 0, 1) * 0.85;
        c.beginPath(); c.arc(ML + b.x * (W - ML - MR), yz(b.z), 2.5, 0, 6.283); c.stroke();
      }
      c.globalAlpha = 1;
      if (F.air > 0.5 && step === 0) cTxt(c, [["CO₂ de l'aire", 1]], W * 0.6, skyH - 7, { fs: IBV.FS.small, col: C.ink });

      // Fitoplàncton (núvol orgànic en blau)
      const phPts = PH.map(p => [ML + 4 + p.x * (W - ML - MR - 8) + Math.sin(tt * 0.2 + p.w) * 3, yz(p.z), m ? 1.4 : 1.7]);
      IBV.cloud(c, phPts, C.blau, { alpha: 0.42 });

      // Neu marina (gris suau)
      c.fillStyle = C.muted;
      for (const s of snow) {
        c.globalAlpha = clamp(s.a, 0, 1) * clamp(F.snow, 0, 1) * 0.65;
        c.beginPath(); c.arc(ML + s.x * (W - ML - MR), yz(s.z), 1.5, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;

      // Excrements (blau fosc, enfonsament ràpid) i CO₂ respirat (cercles buits en tinta)
      const ra = clamp(F.rel, 0, 1);
      c.fillStyle = C.blauFosc;
      for (const p of poop) {
        c.globalAlpha = p.a * ra * 0.8;
        c.fillRect(ML + p.x * (W - ML - MR), yz(p.z), 1.6, 4.5);
      }
      c.strokeStyle = C.ink; c.lineWidth = 0.9;
      for (const b of co2) {
        c.globalAlpha = b.a * ra * 0.75;
        c.beginPath(); c.arc(ML + b.x * (W - ML - MR), yz(b.z), 2.4, 0, 6.283); c.stroke();
      }
      c.globalAlpha = 1;

      // Migradors en vermell amb puntet blau a la panxa
      const s = m ? 1.4 : 1.8;
      for (const a of MG) {
        if (a.z == null) continue;
        const x = ML + a.x * (W - ML - MR) + Math.sin(tt * 0.25 + a.w) * 5;
        const y = yz(a.z + Math.sin(tt * 0.45 + a.w) * 4);
        c.globalAlpha = clamp(F.mig, 0, 1) * 0.88;
        c.fillStyle = C.vermell; c.strokeStyle = C.vermell;
        glyphC(c, x, y, s, a.type);
        if (a.gut > 0.05) {
          c.fillStyle = C.blau;
          c.beginPath(); c.arc(x, y, 1.2 + 1.5 * a.gut, 0, 6.283); c.fill();
        }
      }
      c.globalAlpha = 1;

      // Anotacions per pas (tinta sobre paper/blau suau, amb halo blanc)
      const lx = ML + 12;
      if (step === 0) cTxt(c, [["El fitoplàncton", 1, C.blau], ["fixa el carboni", 0, C.ink]], lx, yz(175), { fs });
      if (F.snow > 0.3 && step === 1) cTxt(c, [["Neu marina: 10–100 m/dia", 1], ["La major part es consumeix pel camí", 0, C.ink2]], lx, yz(330), { fs });
      if (step === 2) {
        const top = meanZ < 160;
        cTxt(c, [[top ? "Mengen a dalt, de nit" : "Baixen amb la panxa plena", 1, C.vermell]], lx, top ? yz(185) : yz(clamp(meanZ, 250, 600)) - 32, { fs });
        if (F.arr > 0.02) {
          c.save(); c.globalAlpha = clamp(F.arr, 0, 1) * (top ? 0.35 : 0.85);
          arrowV(c, W - MR - (m ? 18 : 28), yz(110), yz(420), C.vermell, 1.4);
          c.restore();
        }
      }
      if (step === 3) {
        cTxt(c, [["CO₂ que respiren", 1, C.ink], ["Excrements que s'enfonsen de pressa", 1, C.blauFosc]], lx, yz(685), { fs, a: ra });
      }
      if (F.seq > 0.02) {
        const a = F.seq, xr = W - MR - 8;
        c.save(); c.globalAlpha = a; c.strokeStyle = C.ink; c.lineWidth = 1;
        const br = (z0, z1, lines) => {
          const ya = yz(z0), yb = yz(z1);
          c.beginPath(); c.moveTo(xr - 5, ya); c.lineTo(xr, ya); c.lineTo(xr, yb); c.lineTo(xr - 5, yb); c.stroke();
          cTxt(c, lines, xr - 9, (ya + yb) / 2 - ((lines.length - 1) * fs * 1.25) / 2 + 4, { al: "right", fs: m ? 11 : 12, col: C.ink, a });
        };
        br(60, 190, [["Capa de mescla d'hivern", 1], ["< 1 any a l'oceà", 0, C.ink2]]);
        br(380, 600, [["Migradors, fins a 600 m", 1], ["fins a 250 anys", 0, C.vermell]]);
        br(980, 1085, [["Per sota de 1.000 m", 1], ["segles", 0, C.blauFosc]]);
        c.restore();
      }

      if (hoverZ != null) {
        const hy = yz(hoverZ);
        c.save(); c.strokeStyle = C.ink; c.lineWidth = 0.8; c.setLineDash([3, 3]);
        c.beginPath(); c.moveTo(ML, hy); c.lineTo(W - MR, hy); c.stroke(); c.restore();
      }
    }

    let loopHandle = null;
    IBV.mount(stack, (el, w) => {
      const m = mob() || w < 600;
      W = w;
      H = m ? Math.round(Math.max(210, Math.min(window.innerHeight * 0.30, 250)))
        : Math.min(Math.round(clamp(window.innerHeight - 240, 380, 660)), Math.round(W * 0.95));
      skyH = Math.max(24, Math.round(H * 0.09));
      y0 = skyH; ML = m ? 34 : 42; MR = m ? 6 : 10;

      const built = IBV.canvas(el, W, H, ARIA);
      cvNode = built.c; ctx = built.ctx;
      cvNode.style.cursor = "crosshair";

      IBV.hover(cvNode, (_ev, [, y]) => {
        if (y < y0) { hoverZ = null; tp.hide(); return; }
        hoverZ = zy(y);
        const seqTxt = hoverZ < 200 ? "Capa de mescla: el CO₂ torna a l'aire en menys d'un any" :
          hoverZ < 1000 ? "Zona crepuscular: segrest fins a ~250 anys (Boyd et al., 2019)" :
          "Oceà profund (> 1.000 m): carboni segrestat durant segles";
        tp.show(`<b>${fmt0(hoverZ)} m</b><br>${seqTxt}`);
        if (RM) draw(0);
      }, () => {
        hoverZ = null; tp.hide();
        if (RM) draw(0);
      });

      if (loopHandle) loopHandle.stop();
      loopHandle = IBV.loop(el, (tMs, dtMs) => {
        tick(dtMs / 1000);
        draw(tMs / 1000);
      });
    });

    if (window.IB && IB.scrolly && steps && graphic) {
      IB.scrolly(steps, graphic, setStep);
    }
  })();

  /* =========================================================
     6. ESTIMACIONS DE CARBONI (IB-10 + IB-38)
     ========================================================= */
  (function () {
    const wrap = $("estwrap"), lgdEl = $("estLgd");
    if (!wrap) return;

    const R = [
      { n: "Zooplàncton migrador", s: "càlcul nostre, model del 2019", lo: null, c: 1.04, hi: null, calc: 1,
        t: "16 % de mitjana de l'exportació total del model (6,5 PgC/any), sense interval global." },
      { n: "Peixos", s: "recull d'estudis, 2021", lo: 0.3, c: 1.5, hi: 2.7,
        t: "1,5 ± 1,2 PgC/any (3 %–29 % del flux), entre excrements i transport nedant." },
      { n: "Migradors de la zona crepuscular", s: "recull d'estimacions, 2019", lo: 0.9, c: null, hi: 3.6,
        t: "Interval de les estimacions globals publicades fins al 2019 per a la bomba de migrants." }
    ];

    if (lgdEl) {
      IBV.legendCat(lgdEl, [
        { c: C.vermell, t: "Estimació publicada (i interval)", kind: "dot", a: 0.65 },
        { c: C.blau, t: "Càlcul nostre (model)", kind: "hollow" },
        { c: C.ink, t: "Exportació total (6,5)", kind: "line", dash: "3 3", w: 1.3 }
      ]);
    }

    const tp = IBV.tip(wrap);

    IBV.mount(wrap, (el, w) => {
      const m = mob(), rowH = m ? 66 : 58, ml = m ? 8 : 206, mr = m ? 10 : 18, mt = 44;
      const h = mt + R.length * rowH + 34;
      const s = IBV.svg(el, w, h, "Estimacions del carboni que transporten cap avall els animals, en petagrams de carboni l'any. Zooplàncton migrador: ≈ 1,0 (càlcul nostre). Peixos: 1,5 (0,3–2,7). Migradors de la zona crepuscular: 0,9–3,6. Exportació total del model del 2019: 6,5.");

      const x = d3.scaleLinear([0, 7], [ml, w - mr]);

      // Quadrícula vertical recessiva + zero en tinta
      for (let v = 0; v <= 7; v++) {
        s.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", mt - 6).attr("y2", h - 26)
          .attr("stroke", v === 0 ? C.ink : C.grid).attr("stroke-width", v === 0 ? 1 : 0.8);
      }
      const ax = IBV.axisX(s, x, h - 26, [0, 1, 2, 3, 4, 5, 6, 7], v => (v === 7 ? "7 PgC/any" : String(v)), { tick: false });
      ax.selectAll("text").filter((_, i, n) => i === n.length - 1).attr("text-anchor", "end").attr("x", w - 2);

      // Llindar de referència: 6,5 PgC/any (model del 2019)
      s.append("line").attr("x1", x(6.5)).attr("x2", x(6.5)).attr("y1", mt - 14).attr("y2", h - 26)
        .attr("stroke", C.ink).attr("stroke-width", 1.2).attr("stroke-dasharray", "3 3");
      IBV.t(s, x(6.5) - 6, mt - 18, m ? "Exportació total: 6,5 PgC/any" : "Tot el carboni exportat: 6,5 PgC/any (model del 2019)", {
        size: IBV.FS.small, anchor: "end", fill: C.ink, weight: 600
      });

      const rows = s.append("g").selectAll("g.erow").data(R).join("g").attr("class", "erow hit");

      rows.each(function (d, i) {
        const g = d3.select(this);
        const yc = mt + i * rowH + rowH / 2 + (m ? 10 : 0);
        const xe = x(d.hi != null ? d.hi : d.c);

        // Fil guia horitzontal finíssim (0,6 px)
        g.append("line").attr("x1", x(0)).attr("x2", x(7)).attr("y1", yc).attr("y2", yc)
          .attr("stroke", C.hair).attr("stroke-width", 0.6);

        // Etiqueta de la sèrie
        if (m) {
          IBV.t(g, ml, yc - 17, d.n, { size: IBV.FS.label, weight: 600, fill: C.ink });
          IBV.t(g, ml, yc - 4, d.s, { size: IBV.FS.min, fill: C.muted });
        } else {
          IBV.t(g, ml - 14, yc - 2, d.n, { size: IBV.FS.label, weight: 600, anchor: "end", fill: C.ink });
          IBV.t(g, ml - 14, yc + 13, d.s, { size: IBV.FS.small, anchor: "end", fill: C.muted });
        }

        // Banda translúcida multiply per a l'interval
        if (d.lo != null) {
          const xMid = x((d.lo + d.hi) / 2);
          g.append("rect").attr("class", "eband")
            .attr("x", xMid).attr("y", yc - 7).attr("height", 14).attr("rx", 7).attr("width", 0)
            .attr("fill", C.vermell).attr("fill-opacity", 0.24)
            .style("mix-blend-mode", "multiply")
            .attr("data-x", x(d.lo)).attr("data-w", x(d.hi) - x(d.lo));
          [d.lo, d.hi].forEach(val => {
            g.append("circle").attr("class", "eend").attr("cx", x(val)).attr("cy", yc).attr("r", 0)
              .attr("fill", C.vermell).attr("fill-opacity", 0.55);
          });
        }

        // Punt central: cercle translúcid multiply vermell (publicat) o anell blau (càlcul nostre)
        if (d.c != null) {
          if (d.calc) {
            g.append("circle").attr("class", "ecore").attr("cx", x(d.c)).attr("cy", yc).attr("r", 0)
              .attr("fill", C.paper).attr("stroke", C.blau).attr("stroke-width", 2.2);
          } else {
            g.append("circle").attr("class", "ehalo").attr("cx", x(d.c)).attr("cy", yc).attr("r", 0)
              .attr("fill", C.vermell).attr("fill-opacity", 0.35).style("mix-blend-mode", "multiply");
            g.append("circle").attr("class", "ecore").attr("cx", x(d.c)).attr("cy", yc).attr("r", 0)
              .attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.3);
          }
        }

        // Valor directe a la dreta
        const valStr = d.calc ? `≈ ${fmt1(d.c)}` : d.c != null ? `${fmt1(d.c)} (${fmt1(d.lo)}–${fmt1(d.hi)})` : `${fmt1(d.lo)}–${fmt1(d.hi)}`;
        IBV.t(g, xe + 12, yc + 4, valStr, { size: IBV.FS.small, fill: C.ink2, weight: 600, halo: true });
      });

      // Entrada animada (IBV.onView)
      IBV.onView(el, instant => {
        const dur = instant ? 0 : IBV.DUR;
        rows.selectAll("rect.eband").transition().duration(dur).delay((_, i) => instant ? 0 : i * 120).ease(IBV.EASE)
          .attr("x", function () { return +this.getAttribute("data-x"); })
          .attr("width", function () { return +this.getAttribute("data-w"); });
        rows.selectAll("circle.eend").transition().duration(dur * 0.6).delay(instant ? 0 : 400).attr("r", 2.6);
        rows.selectAll("circle.ehalo").transition().duration(dur * 0.7).delay(instant ? 0 : 300).attr("r", 11);
        rows.selectAll("circle.ecore").transition().duration(dur * 0.6).delay(instant ? 0 : 350).attr("r", 5);
      });

      // Hover amb focus suau (0,48) i lectura al dock
      IBV.hover(s.node(), (_ev, [, my]) => {
        const idx = clamp(Math.floor((my - mt) / rowH), 0, R.length - 1);
        if (my < mt - 6 || my > h - 24) { IBV.focus(rows, null); tp.hide(); return; }
        const d = R[idx];
        IBV.focus(rows, dd => dd === d);
        rows.selectAll("rect.eband").attr("stroke", dd => dd === d ? C.ink : "none").attr("stroke-width", 1.2);
        rows.filter(dd => dd === d).raise();
        tp.show(`<b>${d.n}</b> (${d.s})<br>${d.t}`);
      }, () => {
        IBV.focus(rows, null);
        rows.selectAll("rect.eband").attr("stroke", "none");
        tp.hide();
      });
    });
  })();

  /* Temps de lectura (mateixa regla que la resta d'articles) */
  (() => {
    const n = [...document.querySelectorAll("h1,h2,.dek,p,li,dt,dd,figcaption")]
      .filter(e => !e.closest(".fn"))
      .reduce((a, e) => a + (e.textContent.match(/[\p{L}\p{N}·'’]+/gu) || []).length, 0);
    const figs = document.querySelectorAll("canvas[role=img],svg[role=img]").length;
    let sec = (n / 218) * 60;
    for (let i = 0; i < figs; i++) sec += Math.max(3, 12 - i);
    const el = $("rt");
    if (el) el.textContent = Math.max(1, Math.round(sec / 60)) + " min de lectura";
  })();
})();
