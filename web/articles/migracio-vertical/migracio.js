/* La gran migració de cada nit — atles oceanogràfic (sistema infogràfic IBV).
   1. Tall de l'oceà 24 h (HOW-01 gravat lluminós + MAP-19 esteles + TIME-11/TIME-12 rellotge polar 24 h)
   2. Comparació del copèpode (HOW-01 columna 500 m + SCALE-04 cinta d'arcs de proporció)
   3. Dades Malaspina per regions (MAP-03 atles Equal Earth + CASE-03/CASE-04 profunditat dia · nit)
   4. Ecograma simulat (CASE-06 matriu acústica monocroma blava + SPREAD-06 isolínies blanques + perfil vertical)
   5. Bomba de carboni (LINK-03 flux vertical d'aquarel·la + ~1.000 micro-traços lents + horitzons de segrest)
   6. Estimacions de carboni (CASE-04 cercles d'aquarel·la amb bigotis d'incertesa + SCALE-01 llindar 6,5 PgC/any) */
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

  /* Helper d'aquarel·la radial (com el-jesus-historic/article.js) per a cercles multiply */
  function addWashGrad(defs, id, col, a0, a1) {
    const rg = defs.append("radialGradient").attr("id", id).attr("cx", "42%").attr("cy", "38%").attr("r", "64%");
    rg.append("stop").attr("offset", 0).attr("stop-color", col).attr("stop-opacity", a0 == null ? 0.44 : a0);
    rg.append("stop").attr("offset", 0.76).attr("stop-color", col).attr("stop-opacity", a1 == null ? 0.24 : a1);
    rg.append("stop").attr("offset", 1).attr("stop-color", col).attr("stop-opacity", 0.05);
    return `url(#${id})`;
  }

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
        ctx.strokeStyle = o.halo || "rgba(252,252,250,0.92)";
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
     1. TALL DE L'OCEÀ DE 24 HORES
        HOW-01 gravat lluminós + MAP-19 esteles verticals + TIME-11/TIME-12 rellotge polar
     ========================================================= */
  (function () {
    const stack = $("oStack"), plotEl = $("oPlot");
    if (!stack || !plotEl) return;
    const graphic = $("ograph"), steps = $("osteps");
    const tEl = $("oTime"), sEl = $("oState"), rngEl = $("oRng"), outEl = $("oOut"), playB = $("oPlay");
    const lgdEl = $("oLgd");
    const ARIA = "Tall de l'oceà de la superfície fins a 1.100 metres al llarg d'un dia, amb rellotge polar de 24 hores. De dia, la capa d'animals és a uns 450 metres, a la zona crepuscular. Al capvespre puja fins als primers cent metres, on passa la nit menjant, i abans de l'alba torna a baixar.";

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

    // Perfil de pols de migració 24 h per a la rosa polar TIME-11 (0 = fons, 1 = superfície)
    const PULSE24 = d3.range(0, 24).map(h => {
      const dist = DAYZ - 55, durD = dist / VD, durU = dist / VU;
      let z;
      if (h >= DEP && h < DEP + durD) z = 55 + (h - DEP) * VD;
      else if (h >= DEP + durD && h < ARR - durU) z = DAYZ;
      else if (h >= ARR - durU && h < ARR) z = DAYZ - (h - (ARR - durU)) * VU;
      else z = 55;
      return { h, v: clamp(1 - (z - 55) / (DAYZ - 55), 0.14, 1) };
    });

    const r = IBV.rng(7);
    let A = [], PH = [];
    function makeAnimals() {
      const n = mob() ? 920 : 1820;
      A = [];
      for (let i = 0; i < n; i++) {
        const q = r(), type = q < 0.42 ? 0 : q < 0.62 ? 1 : q < 0.84 ? 2 : q < 0.91 ? 3 : 4;
        const mig = r() < 0.5;
        const dd = clamp(DAYZ + IBV.gauss(r) * 58, 300, 660);
        const nd = clamp(8 + Math.pow(r(), 1.45) * 118, 4, 138);
        const tj = IBV.gauss(r) * 0.14;
        A.push({
          x: r(), type, mig, dd, nd, tj,
          rz: clamp(475 + IBV.gauss(r) * 115, 320, 840),
          w: r() * 6.283, s: 0.65 + r() * 0.55,
          z: null, pz: null, vz: 0
        });
      }
      PH = [];
      for (let i = 0; i < (mob() ? 220 : 420); i++) {
        PH.push({ x: r(), z: clamp(14 + Math.pow(r(), 0.8) * 130 + IBV.gauss(r) * 8, 3, 170), w: r() * 6.283 });
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
        for (const a of A) { a.z = a.mig ? schedZ(a, S.t) : a.rz; a.pz = a.z; a.vz = 0; }
        draw(0);
        updateClockSvg();
      }
    }

    if (rngEl) {
      rngEl.addEventListener("input", () => {
        S.user = true; S.mode = "static"; S.t = S.target = +rngEl.value;
        if (playB) playB.textContent = "Reprodueix";
        if (RM) {
          for (const a of A) { a.z = a.mig ? schedZ(a, S.t) : a.rz; a.pz = a.z; a.vz = 0; }
          draw(0);
          updateClockSvg();
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

    let ctx = null, cvNode = null, overSvg = null, clockHand = null, clockTip = null, clockPulse = null, clockR = 0;
    let W = 0, H = 0, skyH = 0, y0 = 0, ML = 0, MR = 0;
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

    /* Rellotge polar 24 h prominent (TIME-11 + TIME-12 sobre IBV.polarGrid, mitjanit a dalt) */
    function buildClockSvg() {
      if (!overSvg) return;
      overSvg.selectAll("*").remove();
      clockHand = null; clockTip = null; clockPulse = null;
      const m = mob() || W < 600;
      if (m && W < 310) return;

      clockR = m ? 27 : 52;
      const cx = W - MR - clockR - (m ? 14 : 24);
      const cy = y0 + clockR + (m ? 16 : 26);

      const defs = overSvg.append("defs");
      const uid = "clk" + Math.random().toString(36).slice(2, 6);
      const roseGrad = addWashGrad(defs, uid + "r", C.vermell, 0.42, 0.16);

      const g = overSvg.append("g").attr("transform", `translate(${cx},${cy})`);

      // Halo suau translúcid de paper (sense caixa ni vora dura)
      g.append("circle").attr("r", clockR + (m ? 11 : 16))
        .attr("fill", "rgba(252,252,250,0.82)");

      // Sectors dia (baix: 6 h → 18 h en groc suau) i nit (dalt: 18 h → 6 h en blau suau)
      const arcNight = d3.arc().innerRadius(0).outerRadius(clockR).startAngle(-Math.PI / 2).endAngle(Math.PI / 2);
      const arcDay = d3.arc().innerRadius(0).outerRadius(clockR).startAngle(Math.PI / 2).endAngle(Math.PI * 1.5);
      g.append("path").attr("d", arcNight()).attr("fill", IBV.alpha(C.blau, 0.10));
      g.append("path").attr("d", arcDay()).attr("fill", IBV.alpha(C.groc, 0.16));

      // Retícula polar finíssima (0,5 px) amb IBV.polarGrid
      IBV.polarGrid(g, 0, 0, clockR, 4, 12, { outer: C.hair, stroke: C.grid });

      // Rosa horària TIME-11 del pols de migració cap a la superfície (mitjanit a dalt)
      const rPulse = d3.scaleSqrt([0, 1], [clockR * 0.16, clockR * 0.94]);
      const radialLine = d3.lineRadial()
        .angle(d => (d.h / 24) * 2 * Math.PI)
        .radius(d => rPulse(d.v))
        .curve(d3.curveCardinalClosed.tension(0.35));

      g.append("path")
        .datum(PULSE24)
        .attr("d", radialLine)
        .attr("fill", roseGrad)
        .style("mix-blend-mode", "multiply")
        .attr("stroke", C.vermell)
        .attr("stroke-width", 1.1)
        .attr("stroke-opacity", 0.72);

      // Etiquetes horàries (mitjanit a dalt, sentit horari)
      const off = m ? 6 : 9;
      IBV.t(g, 0, -clockR - off + 2, "0 h", { size: IBV.FS.min, anchor: "middle", fill: C.ink, weight: 600, halo: 2.5 });
      IBV.t(g, 0, clockR + off + 5, "12 h", { size: IBV.FS.min, anchor: "middle", fill: C.ink2, halo: 2.5 });
      if (!m) {
        IBV.t(g, clockR + off - 2, 4, "6 h", { size: IBV.FS.min, anchor: "start", fill: C.muted, halo: 2.5 });
        IBV.t(g, -clockR - off + 2, 4, "18 h", { size: IBV.FS.min, anchor: "end", fill: C.muted, halo: 2.5 });
        IBV.t(g, 0, clockR + 28, "Pols 24 h (a dalt de nit)", { size: IBV.FS.min, anchor: "middle", fill: C.ink2, italic: true, halo: 2.5 });
      }

      // Agulla en temps real TIME-12
      clockPulse = g.append("circle").attr("r", 4).attr("fill", "none")
        .attr("stroke", C.vermell).attr("stroke-width", 1).attr("opacity", 0);
      clockHand = g.append("line").attr("x1", 0).attr("y1", 0)
        .attr("stroke", C.vermell).attr("stroke-width", m ? 1.5 : 1.8).attr("stroke-linecap", "round");
      clockTip = g.append("circle").attr("r", m ? 2.4 : 3.2)
        .attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.2);
      g.append("circle").attr("r", 2.2).attr("fill", C.ink);

      updateClockSvg();
    }

    function updateClockSvg() {
      if (!clockHand || !clockTip) return;
      const ang = (S.t / 24) * 2 * Math.PI - Math.PI / 2;
      const len = clockR - 2;
      const hx = Math.cos(ang) * len, hy = Math.sin(ang) * len;
      clockHand.attr("x2", hx).attr("y2", hy);
      clockTip.attr("cx", hx).attr("cy", hy);
      if (clockPulse) {
        const isTransit = (S.t > 16.5 && S.t < 19.2) || (S.t > 5.0 && S.t < 7.6);
        if (isTransit && !RM) {
          const p = (performance.now() % 1400) / 1400;
          clockPulse.attr("cx", hx).attr("cy", hy).attr("r", 3.5 + p * 8).attr("opacity", (1 - p) * 0.65);
        } else {
          clockPulse.attr("opacity", 0);
        }
      }
    }

    function tick(dt) {
      if (S.mode === "range") {
        if (S.hold > 0) { S.hold -= dt; if (S.hold <= 0) S.t = S.from; }
        else { S.t += dt * (RM ? 2.4 : 0.62); if (S.t >= S.to) { S.t = S.to; S.hold = 1.6; } }
      } else if (S.mode === "play") {
        S.t = (S.t + dt * 0.72) % 24;
      } else {
        const d = S.target - S.t;
        S.t += d * Math.min(1, RM ? 1 : dt * 2.8);
        if (Math.abs(d) < 0.005) S.t = S.target;
      }
      const st = OS[S.step] || {};
      const k = RM ? 1 : Math.min(1, dt * 3);
      for (const n in S.f) S.f[n] += (((st[n] && !S.user) ? 1 : 0) - S.f[n]) * k;

      let sum = 0, cnt = 0;
      const ez = RM ? 1 : Math.min(1, dt * (S.mode === "static" && Math.abs(S.target - S.t) > 0.02 ? 4.2 : 7.5));
      for (const a of A) {
        const tz = a.mig ? schedZ(a, S.t) : a.rz;
        if (a.z == null) { a.z = tz; a.pz = tz; }
        a.pz = a.z;
        a.z += (tz - a.z) * ez;
        const instV = dt > 0.001 ? (a.z - a.pz) / dt : 0;
        a.vz = a.vz * 0.82 + instV * 0.18;
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
      updateClockSvg();
    }

    function draw(tt) {
      if (!ctx || !W) return;
      const c = ctx, m = mob() || W < 600, fs = m ? 11 : 12.5, t = S.t, el = sunEl(t, 0, 0), Ls = surfL(t);
      const dayF = sm((el + 6) / 24);
      c.clearRect(0, 0, W, H);

      // 1. Franja del cel (aquarel·la suau sobre paper blanc, sense caixa fosca)
      const skyG = c.createLinearGradient(0, 0, 0, skyH);
      skyG.addColorStop(0, IBV.alpha(dayF > 0.25 ? C.groc : C.blauFosc, dayF > 0.25 ? 0.07 * dayF : 0.08 * (1 - dayF)));
      skyG.addColorStop(1, "rgba(252,252,250,0)");
      c.fillStyle = skyG;
      c.fillRect(ML, 0, W - ML - MR, skyH);

      // Sol minimalista (groc / vermell al capvespre)
      if (el > -4) {
        const xs = ML + ((t - 6) / 12) * (W - ML - MR - (m ? 68 : 130)) + 16;
        const ys = skyH - 5 - Math.max(0, Math.sin(el * D2R)) * (skyH - 14);
        const yy = ys + (el < 0 ? -el * 1.4 : 0), rs = m ? 5.5 : 8;
        c.save();
        c.beginPath(); c.rect(ML, 0, W - ML - MR, skyH); c.clip();
        const gl = c.createRadialGradient(xs, yy, rs * 0.4, xs, yy, rs * 3.5);
        gl.addColorStop(0, IBV.alpha(C.groc, 0.44));
        gl.addColorStop(1, IBV.alpha(C.groc, 0));
        c.fillStyle = gl;
        c.beginPath(); c.arc(xs, yy, rs * 3.5, 0, 6.283); c.fill();
        c.fillStyle = el < 10 ? C.vermell : C.groc;
        c.beginPath(); c.arc(xs, yy, rs, 0, 6.283); c.fill();
        c.restore();
      }

      // 2. Columna d'aigua (HOW-01): gravat oceànic lluminós d'aquarel·la blava sobre paper blanc
      const wg = c.createLinearGradient(0, y0, 0, H);
      const topA = lerp(0.10, 0.012, dayF);
      const midA = lerp(0.16, 0.085, dayF);
      const botA = lerp(0.26, 0.20, dayF);
      wg.addColorStop(0, IBV.alpha(C.blau, topA));
      wg.addColorStop(0.18, IBV.alpha(C.blau, lerp(topA, midA, 0.45)));
      wg.addColorStop(0.55, IBV.alpha(C.blau, midA));
      wg.addColorStop(1, IBV.alpha(C.blauFosc, botA));
      c.fillStyle = wg;
      c.fillRect(ML, y0, W - ML - MR, H - y0);

      // Feixos subtils de llum solar penetrant la zona il·luminada de dia
      if (dayF > 0.05) {
        const sunW = c.createLinearGradient(0, y0, 0, yz(240));
        sunW.addColorStop(0, IBV.alpha(C.groc, 0.14 * dayF));
        sunW.addColorStop(0.65, IBV.alpha(C.grocClar, 0.05 * dayF));
        sunW.addColorStop(1, IBV.alpha(C.groc, 0));
        c.fillStyle = sunW;
        c.fillRect(ML, y0, W - ML - MR, yz(240) - y0);
      }

      // Línia de superfície en blau fi amb micro-ondulació
      c.strokeStyle = C.blau; c.lineWidth = 1.2;
      c.beginPath();
      for (let x = ML; x <= W - MR; x += 12) {
        const wy = y0 + Math.sin(x * 0.045 + tt * 0.7) * 0.8;
        if (x === ML) c.moveTo(x, wy); else c.lineTo(x, wy);
      }
      c.stroke();

      // 3. Línies batimètriques finíssimes (0,5 px a 200 m / 450 m / 1.000 m i tics recessius)
      c.save();
      const depths = [0, 200, 450, 700, 1000];
      depths.forEach(z => {
        const y = yz(z);
        const isKey = z === 200 || z === 450 || z === 1000;
        c.strokeStyle = z === 450 ? IBV.alpha(C.vermell, 0.34) : isKey ? C.ink2 : C.grid;
        c.lineWidth = 0.5;
        c.setLineDash(z === 450 ? [4, 4] : isKey && z > 0 ? [2, 4] : []);
        c.beginPath(); c.moveTo(ML, y); c.lineTo(W - MR, y); c.stroke();
        if (z === 700 && m) return;
        cTxt(c, [z === 0 ? "0 m" : String(z)], ML - 6, y + (z === 0 ? fs * 0.85 : 4), {
          al: "right", fs: IBV.FS.min, col: z === 450 ? C.vermell : C.muted, halo: false
        });
      });
      c.restore();

      const zf = 1 - 0.85 * Math.max(S.f.arUp, S.f.arDn);
      const zl = (s, z, a) => cTxt(c, [s], W - MR - 6, yz(z), {
        al: "right", fs: m ? 11 : 12, col: C.ink2, italic: true, a: a == null ? 1 : a
      });
      zl("Zona crepuscular", m ? 590 : 620, zf);
      if (!m || H > 220) zl("Zona fosca", 1068, 0.9);
      if (!m) cTxt(c, ["Zona il·luminada"], ML + 10, yz(105), { fs: 12, col: C.ink2, italic: true, a: zf * (1 - S.f.pred * 0.8) });

      // 4. Núvol orgànic de fitoplàncton (IBV.cloud en blau)
      const phPts = [];
      for (let i = 0; i < PH.length; i++) {
        const p = PH[i];
        phPts.push([
          ML + 4 + p.x * (W - ML - MR - 8) + Math.sin(tt * 0.10 + p.w) * 3,
          yz(p.z + Math.sin(tt * 0.14 + p.w) * 2),
          m ? 1.2 : 1.5
        ]);
      }
      IBV.cloud(c, phPts, C.blau, { alpha: 0.24 + 0.34 * S.f.feed });

      // 5. Ona d'isoluma daurada nítida (groc fosc ≥ 2 px + halo daurat suau)
      if (S.f.iso > 0.01) {
        const zi = (Ls - PREF) / KD, y = yz(clamp(zi, 0, ZMAX));
        c.save();
        c.globalAlpha = S.f.iso;
        // Bany d'aquarel·la daurada sota la línia
        const ig = c.createLinearGradient(0, y - 10, 0, y + 10);
        ig.addColorStop(0, IBV.alpha(C.groc, 0));
        ig.addColorStop(0.5, IBV.alpha(C.groc, 0.26));
        ig.addColorStop(1, IBV.alpha(C.groc, 0));
        c.fillStyle = ig;
        c.fillRect(ML, y - 10, W - ML - MR, 20);

        c.strokeStyle = C.grocFosc;
        c.lineWidth = 2.2;
        c.setLineDash([7, 4]);
        c.lineDashOffset = RM ? 0 : -tt * 7;
        c.beginPath();
        for (let x = ML; x <= W - MR; x += 10) {
          const wy = y + Math.sin(x * 0.028 + tt * 0.9) * 2.2;
          if (x === ML) c.moveTo(x, wy); else c.lineTo(x, wy);
        }
        c.stroke();
        c.restore();
        cTxt(c, [["Isoluma: la llum de la capa a migdia", 1]], ML + 10, zi < 40 ? y + fs + 8 : y - 10, {
          fs, col: C.ink, a: S.f.iso
        });
      }

      // 6. Depredadors visuals prop de la superfície (blau fosc)
      if (S.f.pred > 0.01) {
        c.save();
        c.globalAlpha = S.f.pred * 0.82;
        c.fillStyle = C.blauFosc;
        const sc = m ? 0.8 : 1.05;
        [[0.0, 38, 1], [0.37, 74, 1], [0.7, 52, -1]].forEach(([o, z, d], i) => {
          const u = ((tt * 0.014 * (i + 2) + o) % 1 + 1) % 1;
          const x = d > 0 ? ML + u * (W - ML - MR) : W - MR - u * (W - ML - MR);
          tuna(c, x, yz(z), sc, d);
        });
        c.restore();
        cTxt(c, [["Depredadors que", 1], ["cacen amb la vista", 0]], ML + 10, yz(135), {
          fs, a: S.f.pred, col: C.ink
        });
      }

      // 7. ~1.800 partícules orgàniques lentes amb estela vertical subtil (estil MAP-19)
      const rs = S.f.res;
      const plotW = W - ML - MR - 12;
      if (S.f.types < 0.05) {
        const resPts = [], migPts = [];
        const rad = m ? 1.25 : 1.55;

        // Esteles verticals subtils per als migradors en moviment (MAP-19)
        c.save();
        c.lineCap = "round";
        c.strokeStyle = IBV.alpha(C.vermell, 0.24 - rs * 0.10);
        c.lineWidth = m ? 0.85 : 1.05;
        c.beginPath();
        let hasTrails = false;

        for (let i = 0; i < A.length; i++) {
          const a = A[i];
          const x = ML + 6 + a.x * plotW + Math.sin(tt * 0.11 * a.s + a.w) * 4;
          const y = yz(a.z + Math.sin(tt * 0.22 * a.s + a.w) * 3.5);
          if (a.mig) {
            migPts.push([x, y, rad * (0.75 + 0.35 * a.s)]);
            const wake = clamp(a.vz * 0.11, -14, 14);
            if (Math.abs(wake) > 1.2) {
              c.moveTo(x, y);
              c.lineTo(x, y - wake);
              hasTrails = true;
            }
          } else {
            resPts.push([x, y, rad * 0.8]);
          }
        }
        if (hasTrails) c.stroke();
        c.restore();

        IBV.cloud(c, resPts, C.muted, { alpha: 0.20 + rs * 0.38 });
        IBV.cloud(c, migPts, C.vermell, { alpha: 0.42 - rs * 0.16 });
      } else {
        const big = 1 + S.f.types * 1.1;
        const stepSkip = m ? 2 : 2;
        for (let i = 0; i < A.length; i += stepSkip) {
          const a = A[i];
          const x = ML + 6 + a.x * plotW + Math.sin(tt * 0.11 * a.s + a.w) * 4;
          const y = yz(a.z + Math.sin(tt * 0.22 * a.s + a.w) * 3.5);
          const col = a.mig ? C.vermell : C.muted;
          c.fillStyle = col; c.strokeStyle = col;
          c.globalAlpha = a.mig ? (0.68 - rs * 0.24) : (0.30 + rs * 0.38);
          glyph(c, x, y, (m ? 0.85 : 1) * big * (a.mig ? 1 : 0.9), a.type);
        }
        c.globalAlpha = 1;
      }

      // 8. Anotacions editorials dins del gràfic (P4)
      const st = S.step, lx = ML + 10;
      if (st === 0 && !S.user) {
        const y = yz(meanZ);
        cTxt(c, [["La capa d'animals", 1], ["de dia, a uns 450 m", 0]], lx, y - 54, { fs, col: C.ink });
        c.strokeStyle = C.ink; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(lx + 18, y - 32); c.lineTo(lx + 36, y - 12); c.stroke();
      }
      if (S.f.types > 0.02) {
        const K = [[0, "Copèpodes"], [1, "Krill"], [2, "Peixos llanterna"], [3, "Calamars"], [4, "Meduses i sifonòfors"]];
        const cols = m ? 2 : 1, rows = Math.ceil(K.length / cols);
        const colW = m ? Math.min(156, (W - ML - MR - 16) / 2) : 165;
        const rowH = fs + (m ? 6 : 8), bh = rows * rowH + 6;
        const bx = ML + 12, top = m ? H - 8 - bh : Math.min(yz(810), H - 10 - bh);
        c.save(); c.globalAlpha = S.f.types;
        K.forEach(([tpk, n], i) => {
          const col = Math.floor(i / rows), row = i % rows;
          const x = bx + col * colW, y = top + rowH - 1 + row * rowH;
          c.fillStyle = C.vermell; c.strokeStyle = C.vermell;
          glyph(c, x + 6, y - 3, m ? 1.5 : 1.8, tpk);
          cTxt(c, [n], x + 20, y + 1, { fs: m ? 11 : 12, col: C.ink });
        });
        c.restore();
      }
      if (S.f.arUp > 0.02) {
        const x = W * 0.44, yb = yz(meanZ) + 12;
        c.save(); c.globalAlpha = S.f.arUp;
        if (meanZ > 45 && meanZ < 440) arrowV(c, x, yb + 38, yb - 6, C.vermell, 1.4);
        c.restore();
        cTxt(c, [["Puja a 6,5 cm/s", 1, C.vermell], ["≈ 230 m per hora", 0, C.ink]], x + 14, yz(clamp(meanZ, 70, 440)) + 4, {
          fs, a: S.f.arUp * (meanZ > 45 && meanZ < 440 ? 1 : 0.45)
        });
      }
      if (S.f.arDn > 0.02) {
        const x = W * 0.44, yb = yz(meanZ);
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

      // 9. Guia de hover horitzontal
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
        : Math.min(Math.round(clamp(window.innerHeight - 255, 390, 660)), Math.round(W * 0.92));
      skyH = Math.max(24, Math.round(H * 0.09));
      y0 = skyH; ML = m ? 34 : 42; MR = m ? 6 : 10;

      const built = IBV.canvas(el, W, H, ARIA);
      cvNode = built.c; ctx = built.ctx;
      cvNode.style.cursor = "crosshair";

      d3.select(el).selectAll("svg.ibv-over").remove();
      overSvg = d3.select(el).append("svg").attr("class", "ibv-over ibv-pe-none")
        .attr("width", W).attr("height", H).attr("viewBox", `0 0 ${W} ${H}`)
        .style("font-family", IBV.SANS);
      buildClockSvg();

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
     2. COMPARACIÓ DEL COPÈPODE (HOW-01 columna 500 m + SCALE-04 arcs de proporció)
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
        { c: C.vermell, t: "La teva escala (×100.000)", kind: "dot", a: 0.55 },
        { c: C.blau, t: "Ciutats des de Barcelona", kind: "dot", a: 0.35 }
      ]);
    }

    const tp = IBV.tip(humWrap);
    let ph = 0, km = 170, anchorCity = null;
    let copDot = null, copTrail = null, copTop = 18, copBot = 250;
    let updateHumSlider = null;

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
      if (updateHumSlider) updateHumSlider();
      if (RM) syncCop(1, 0.99);
    }

    function syncCop(u, phase) {
      if (copDot && copTrail) {
        const y = lerp(copBot, copTop, u);
        copDot.attr("cy", y);
        copTrail.attr("y1", phase < 1 ? copBot : copTop).attr("y2", y);
      }
    }

    /* Columna d'aigua 500 m (gravat d'escala HOW-01 + silueta del copèpode) */
    IBV.mount(copWrap, (el, w) => {
      const m = mob(), h = m ? 196 : 310;
      const s = IBV.svg(el, w, h, "Una columna d'aigua de 500 metres. El copèpode, de 5 mil·límetres, la recorre de baix a dalt cada vespre.");
      copTop = 18; copBot = h - 18;
      const colX = m ? 16 : 24, colW = m ? 44 : 52;
      const gid = "szBlue" + Math.random().toString(36).slice(2, 6);
      const gr = s.append("defs").append("linearGradient").attr("id", gid).attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);
      gr.append("stop").attr("offset", 0).attr("stop-color", IBV.alpha(C.blau, 0.04));
      gr.append("stop").attr("offset", 0.45).attr("stop-color", IBV.alpha(C.blau, 0.14));
      gr.append("stop").attr("offset", 1).attr("stop-color", IBV.alpha(C.blauFosc, 0.25));

      s.append("rect").attr("x", colX).attr("y", copTop).attr("width", colW).attr("height", copBot - copTop).attr("fill", `url(#${gid})`);
      // Marques batimètriques fines cada 100 m
      for (let z = 0; z <= 500; z += 100) {
        const yy = lerp(copTop, copBot, z / 500);
        s.append("line").attr("x1", colX).attr("x2", colX + colW).attr("y1", yy).attr("y2", yy)
          .attr("stroke", z === 0 ? C.blau : IBV.alpha(C.ink2, 0.35))
          .attr("stroke-width", z === 0 ? 1.3 : 0.5)
          .attr("stroke-dasharray", z === 0 || z === 500 ? null : "2 3");
      }

      IBV.t(s, colX + colW + 10, copTop + 4, "0 m · Superfície", { size: IBV.FS.small, fill: C.blau, weight: 600 });
      IBV.t(s, colX + colW + 10, copBot + 3, "500 m", { size: IBV.FS.small, fill: C.muted });

      // Petit gravat ampliat del copèpode (antenes característiques)
      const cx = colX + colW + 32, cy = (copTop + copBot) * 0.42;
      const cg = s.append("g").attr("transform", `translate(${cx},${cy})`);
      cg.append("ellipse").attr("rx", 3.5).attr("ry", 7).attr("fill", IBV.alpha(C.vermell, 0.22)).attr("stroke", C.vermell).attr("stroke-width", 0.9);
      cg.append("path").attr("d", "M-2,-5 Q-12,-11 -20,-6 M2,-5 Q12,-11 20,-6 M-1.5,7 L-3.5,13 M1.5,7 L3.5,13")
        .attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 0.85).attr("stroke-linecap", "round");
      IBV.t(s, cx + 26, cy + 3, "5 mm", { size: IBV.FS.min, fill: C.vermell, weight: 700 });

      const px = (copBot - copTop) / RATIO;
      const ns = Math.round(1 / px);
      IBV.lines(s, colX + colW + 10, cy + 28, [
        ["A aquesta escala,", false],
        [`${fmt0(ns)} vegades més`, true],
        ["petit que un píxel", false]
      ], { size: IBV.FS.min, fill: C.muted });

      copTrail = s.append("line").attr("x1", colX + colW / 2).attr("x2", colX + colW / 2)
        .attr("y1", copBot).attr("y2", copBot).attr("stroke", IBV.alpha(C.vermell, 0.45))
        .attr("stroke-width", 2.2).attr("stroke-linecap", "round");
      copDot = s.append("circle").attr("cx", colX + colW / 2).attr("cy", copBot)
        .attr("r", 4.5).attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.5);
      syncCop(RM ? 1 : 0, RM ? 0.99 : 0);
    });

    /* Cinta comparativa SCALE-04 amb cercles d'aquarel·la multiply i arcs corbats de raó exacta */
    IBV.mount(humWrap, (el, w) => {
      const vert = w < 520;
      const h = vert ? 310 : 194;
      const s = IBV.svg(el, w, h, "Cinta comparativa SCALE-04 de la distància a escala humana, amb cercles d'aquarel·la i arcs de proporció amb maratons i ciutats des de Barcelona.");
      const defs = s.append("defs");
      const uid = "sz" + Math.random().toString(36).slice(2, 6);
      const washRed = addWashGrad(defs, uid + "r", C.vermell, 0.48, 0.22);
      const washBlu = addWashGrad(defs, uid + "b", C.blau, 0.36, 0.16);

      const rDist = d3.scaleSqrt([0, KMAX], [7, vert ? 18 : 22]);

      if (vert) {
        // Transposició vertical neta per a mòbil (guia-mobil.md §3 · SCALE-04)
        const axX = 64, mt = 24, mb = 22;
        const Y = d3.scaleLinear([0, KMAX], [mt, h - mb]);

        // Espina vertical ultra-fina
        s.append("line").attr("x1", axX).attr("x2", axX).attr("y1", Y(0)).attr("y2", Y(KMAX))
          .attr("stroke", C.hair).attr("stroke-width", 0.9);
        [0, 50, 100, 150, 200, 250].forEach(v => {
          s.append("line").attr("x1", axX - 5).attr("x2", axX).attr("y1", Y(v)).attr("y2", Y(v)).attr("stroke", C.muted).attr("stroke-width", 0.7);
          IBV.t(s, axX - 8, Y(v) + 4, v === 250 ? "250 km" : String(v), { size: IBV.FS.min, anchor: "end", fill: C.muted });
        });
        IBV.t(s, axX + 12, Y(0) + 4, "Barcelona · 0 km", { size: IBV.FS.min, fill: C.ink, weight: 600 });

        // Fites de maratons
        for (let i = 1; i * MAR < KMAX; i++) {
          const y = Y(i * MAR);
          s.append("line").attr("x1", axX - 3).attr("x2", axX + 4).attr("y1", y).attr("y2", y).attr("stroke", C.ink2).attr("stroke-width", 0.8);
        }

        // Arc de proporció dinàmic (a la dreta de l'espina)
        const arcPath = s.append("path").attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 1.35);
        const arcBadge = IBV.t(s, axX + 44, Y(85), "", { size: IBV.FS.min, weight: 700, fill: C.vermell, halo: 3 });

        // Ciutats (cercles d'aquarel·la multiply)
        const cityG = s.append("g").selectAll("g.city").data(CD).join("g").attr("class", "city hit");
        cityG.append("circle").attr("class", "cwash").attr("cx", axX).attr("cy", d => Y(d.d)).attr("r", d => rDist(d.d))
          .attr("fill", washBlu).style("mix-blend-mode", "multiply");
        cityG.append("circle").attr("cx", axX).attr("cy", d => Y(d.d)).attr("r", 2.5).attr("fill", C.blau);
        cityG.each(function (d) {
          IBV.t(d3.select(this), axX + rDist(d.d) + 8, Y(d.d) + 4, `${d.n} · ${fmt0(d.d)} km`, {
            size: IBV.FS.small, fill: C.ink2, halo: 2.5
          });
        });

        // Cercle actiu "Tu" en vermell d'aquarel·la
        const youG = s.append("g").attr("class", "you");
        const youWash = youG.append("circle").attr("cx", axX).attr("fill", washRed).style("mix-blend-mode", "multiply");
        const youRim = youG.append("circle").attr("cx", axX).attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 1.3);
        const youDot = youG.append("circle").attr("cx", axX).attr("r", 3.5).attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.3);
        const youLbl = IBV.t(youG, w - 6, Y(km), "", { size: IBV.FS.small, anchor: "end", weight: 700, fill: C.vermell, halo: 3 });

        function drawVertArc(yA, yB, txt, col) {
          const midY = (yA + yB) / 2;
          const bend = Math.min(w - axX - 24, 34 + Math.abs(yB - yA) * 0.24);
          arcPath.attr("d", `M${axX},${yA} Q${axX + bend},${midY} ${axX},${yB}`).attr("stroke", col || C.vermell);
          arcBadge.attr("x", Math.min(w - 8, axX + bend * 0.56 + 6)).attr("y", midY + 4)
            .attr("text-anchor", "start").attr("fill", col || C.vermell).text(txt);
        }

        updateHumSlider = () => {
          const dNow = clamp(km, 0, KMAX);
          const yy = Y(dNow), rr = rDist(dNow);
          youWash.attr("cy", yy).attr("r", rr);
          youRim.attr("cy", yy).attr("r", rr);
          youDot.attr("cy", yy);
          youLbl.attr("y", yy + 4).text(`Tu · ${fmt0(km)} km`);
          drawVertArc(Y(0), yy, `${fmt1(km / MAR)} maratons`, C.vermell);
        };
        updateHumSlider();

        IBV.hover(s.node(), (_ev, [, my]) => {
          const near = d3.least(CD, c => Math.abs(Y(c.d) - my));
          if (near && Math.abs(Y(near.d) - my) < 28) {
            IBV.focus(cityG, d => d === near);
            const ratio = km / near.d;
            const ratioStr = ratio >= 1 ? `×${fmt2(ratio)}` : `÷${fmt2(1 / ratio)}`;
            drawVertArc(Y(clamp(km, 0, KMAX)), Y(near.d), ratioStr, C.ink);
            tp.show(`<b>Barcelona → ${near.n}</b> (${fmt0(near.d)} km)<br>La teva escala (${fmt0(km)} km) és <b>${ratioStr}</b> aquesta distància`);
          } else {
            IBV.focus(cityG, null);
            updateHumSlider();
            tp.hide();
          }
        }, () => {
          IBV.focus(cityG, null);
          updateHumSlider();
          tp.hide();
        });
        return;
      }

      // Escriptori: cinta horitzontal SCALE-04 amb cercles d'aquarel·la i arcs corbats de proporció
      const ml = 16, mr = 24, ty = 104;
      const X = d3.scaleLinear([0, KMAX], [ml, w - mr]);

      // Eix inferior recessiu
      IBV.axisX(s, X, h - 24, [0, 50, 100, 150, 200, 250], v => v === 250 ? "250 km" : String(v));

      // Espina horitzontal ultra-fina (0,7 px)
      s.append("line").attr("x1", X(0)).attr("x2", X(KMAX)).attr("y1", ty).attr("y2", ty)
        .attr("stroke", C.hair).attr("stroke-width", 1);

      // Fites de maratons (gravades en l'espina)
      for (let i = 1; i * MAR < KMAX; i++) {
        const x = X(i * MAR);
        s.append("line").attr("x1", x).attr("x2", x).attr("y1", ty - 7).attr("y2", ty + 7)
          .attr("stroke", C.ink2).attr("stroke-width", 0.8);
        IBV.t(s, x, ty + 20, `${i}M`, { size: IBV.FS.min, anchor: "middle", fill: C.muted });
      }
      IBV.t(s, X(0), ty - 14, "Barcelona", { size: IBV.FS.small, fill: C.ink, weight: 600 });
      s.append("circle").attr("cx", X(0)).attr("cy", ty).attr("r", 3).attr("fill", C.ink);

      // Capa d'arcs de proporció SCALE-04 (per sobre de l'espina)
      const arcG = s.append("g").attr("class", "ib35-arcs");
      const mainArc = arcG.append("path").attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 1.35);
      const mainArcTxt = IBV.t(arcG, X(85), ty - 56, "", { size: IBV.FS.small, anchor: "middle", weight: 700, fill: C.vermell, halo: 3.5 });
      const hoverArc = arcG.append("path").attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.3).attr("stroke-dasharray", "4 3").style("opacity", 0);
      const hoverArcTxt = IBV.t(arcG, X(100), ty - 72, "", { size: IBV.FS.small, anchor: "middle", weight: 700, fill: C.ink, halo: 3.5 }).style("opacity", 0);

      // Ciutats com a cercles d'aquarel·la multiply (SCALE-04)
      const cityG = s.append("g").selectAll("g.city").data(CD).join("g").attr("class", "city hit");
      cityG.append("circle").attr("class", "cwash")
        .attr("cx", d => X(d.d)).attr("cy", ty).attr("r", 0)
        .attr("fill", washBlu).style("mix-blend-mode", "multiply");
      cityG.append("circle").attr("class", "crim")
        .attr("cx", d => X(d.d)).attr("cy", ty).attr("r", 0)
        .attr("fill", "none").attr("stroke", IBV.alpha(C.blau, 0.35)).attr("stroke-width", 0.75);
      cityG.append("circle")
        .attr("cx", d => X(d.d)).attr("cy", ty).attr("r", 2.6).attr("fill", C.blau);

      cityG.each(function (d, i) {
        const gg = d3.select(this), x = X(d.d), dy = ty + 38 + (i % 2) * 15;
        gg.append("line").attr("x1", x).attr("x2", x).attr("y1", ty + 6).attr("y2", dy - 11)
          .attr("stroke", C.muted).attr("stroke-width", 0.6);
        IBV.t(gg, x, dy, `${d.n} · ${fmt0(d.d)} km`, {
          size: IBV.FS.min, anchor: x > w - 80 ? "end" : "middle", fill: C.ink2, halo: 2.5
        });
      });

      // Cercle d'aquarel·la actiu «Tu»
      const youG = s.append("g").attr("class", "you");
      const youWash = youG.append("circle").attr("cy", ty).attr("fill", washRed).style("mix-blend-mode", "multiply");
      const youRim = youG.append("circle").attr("cy", ty).attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 1.4);
      const youDot = youG.append("circle").attr("cy", ty).attr("r", 4.2).attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.5);

      function drawArcBetween(pathSel, txtSel, x1, x2, lift, label) {
        const xm = (x1 + x2) / 2;
        const ym = ty - lift;
        pathSel.attr("d", `M${x1},${ty} Q${xm},${ym} ${x2},${ty}`);
        txtSel.attr("x", clamp(xm, ml + 44, w - mr - 44)).attr("y", ty - lift * 0.56 - 4).text(label);
      }

      updateHumSlider = () => {
        const dNow = clamp(km, 0, KMAX);
        const xu = X(dNow), rr = rDist(dNow);
        youWash.attr("cx", xu).attr("r", rr);
        youRim.attr("cx", xu).attr("r", rr);
        youDot.attr("cx", xu);
        const lift = clamp(48 + Math.abs(xu - X(0)) * 0.14, 52, 84);
        drawArcBetween(mainArc, mainArcTxt, X(0), xu, lift, `${fmt0(km)} km · ${fmt1(km / MAR)} maratons`);
      };
      updateHumSlider();

      IBV.onView(el, instant => {
        const dur = instant ? 0 : IBV.DUR;
        cityG.select(".cwash").transition().duration(dur).delay((_, i) => instant ? 0 : i * 75).ease(IBV.EASE).attr("r", d => rDist(d.d));
        cityG.select(".crim").transition().duration(dur).delay((_, i) => instant ? 0 : i * 75).ease(IBV.EASE).attr("r", d => rDist(d.d));
      });

      // Clic per fixar àncora; hover per veure la raó exacta amb arc SCALE-04
      cityG.on("click", (_ev, d) => {
        anchorCity = anchorCity === d ? null : d;
        cityG.select(".crim")
          .attr("stroke", c => c === anchorCity ? C.ink : IBV.alpha(C.blau, 0.35))
          .attr("stroke-width", c => c === anchorCity ? 1.6 : 0.75);
      });

      IBV.hover(s.node(), (_ev, [mx]) => {
        const near = d3.least(CD, c => Math.abs(X(c.d) - mx));
        const hitCity = near && Math.abs(X(near.d) - mx) < 34;
        if (hitCity) {
          IBV.focus(cityG, d => d === near);
          cityG.select(".crim").attr("stroke", d => d === near || d === anchorCity ? C.ink : IBV.alpha(C.blau, 0.35))
            .attr("stroke-width", d => d === near || d === anchorCity ? 1.5 : 0.75);
          const refD = anchorCity && anchorCity !== near ? anchorCity.d : km;
          const refName = anchorCity && anchorCity !== near ? anchorCity.n : "La teva escala";
          const xRef = X(clamp(refD, 0, KMAX));
          const xTgt = X(near.d);
          const ratio = refD / near.d;
          const ratioStr = ratio >= 1 ? `×${fmt2(ratio)}` : `÷${fmt2(1 / ratio)}`;
          const lift = clamp(54 + Math.abs(xTgt - xRef) * 0.22, 54, 92);
          mainArc.style("opacity", 0.28); mainArcTxt.style("opacity", 0.28);
          hoverArc.style("opacity", 1); hoverArcTxt.style("opacity", 1);
          drawArcBetween(hoverArc, hoverArcTxt, xRef, xTgt, lift, `${ratioStr} (${refName} vs ${near.n})`);
          tp.show(`<b>Barcelona → ${near.n}</b> · ${fmt0(near.d)} km (${fmt1(near.d / MAR)} maratons)<br>${refName} (${fmt0(refD)} km) és <b>${ratioStr}</b> · clic per fixar àncora`);
        } else {
          const dKm = clamp(X.invert(mx), 0, KMAX);
          IBV.focus(cityG, null);
          mainArc.style("opacity", 1); mainArcTxt.style("opacity", 1);
          hoverArc.style("opacity", 0); hoverArcTxt.style("opacity", 0);
          tp.show(`<b>${fmt0(dKm)} km</b> · ${fmt1(dKm / MAR)} maratons<br>La teva escala: ${fmt0(km)} km (×100.000 la teva alçada)`);
        }
      }, () => {
        IBV.focus(cityG, null);
        cityG.select(".crim").attr("stroke", d => d === anchorCity ? C.ink : IBV.alpha(C.blau, 0.35))
          .attr("stroke-width", d => d === anchorCity ? 1.6 : 0.75);
        mainArc.style("opacity", 1); mainArcTxt.style("opacity", 1);
        hoverArc.style("opacity", 0); hoverArcTxt.style("opacity", 0);
        tp.hide();
      });
    });

    rg.addEventListener("input", updateText);
    updateText();

    // Bucle contemplatiu (~20 s anada i tornada)
    IBV.loop($("sizefig"), (_t, dtMs) => {
      if (RM) { syncCop(1, 0.99); return; }
      ph = (ph + (dtMs / 1000) * 0.10) % 2;
      const u = ph < 1 ? sm(ph * 1.12) : 1 - sm((ph - 1) * 1.12);
      syncCop(u, ph);
    });
  })();

  /* =========================================================
     3. DADES MALASPINA PER REGIONS
        Doble vista .seg: «Atles oceànic» (MAP-03) + «Profunditat dia · nit» (CASE-03/CASE-04)
     ========================================================= */
  (function () {
    const wrap = $("regwrap"), fig = $("regfig"), lgdEl = $("regLgd");
    const viewSeg = $("regView"), subSeg = $("regSeg");
    if (!wrap || !fig) return;

    // Dades reals: Klevjer et al., 2016 (taula 1, expedició Malaspina 2010–2011)
    const D = [
      { n: "Pacífic oriental", s: ["Pacífic", "oriental"], d: 348, ni: 97, a: 251, p: 0.91, k: 12, lon: -112, lat: 10 },
      { n: "Altres zones", s: ["Altres", "zones"], d: 478, ni: 331, a: 146, p: 0.35, k: 36, lon: -20, lat: -22 },
      { n: "Atlàntic nord", s: ["Atlàntic", "nord"], d: 484, ni: 319, a: 165, p: 0.38, k: 23, lon: -38, lat: 24 },
      { n: "Pacífic occidental", s: ["Pacífic", "occidental"], d: 520, ni: 259, a: 261, p: 0.62, k: 22, lon: 155, lat: 14 },
      { n: "Sud de l'Índic", s: ["Sud de", "l'Índic"], d: 591, ni: 470, a: 120, p: 0.20, k: 12, lon: 80, lat: -28 },
      { n: "Totes les zones", s: ["Totes", "les zones"], d: 486, ni: 303, a: 183, p: 0.46, k: 105, all: 1 }
    ];
    const GEO_D = D.filter(d => !d.all);
    // Ruta esquemàtica dels trams oceànics de la Malaspina (Hespérides)
    const ROUTE = [[-38, 24], [-20, -22], [80, -28], [155, 14], [-112, 10]];

    const tp = IBV.tip(wrap);
    const viewBtns = viewSeg ? [...viewSeg.querySelectorAll("button[data-view]")] : [];
    const btns = subSeg ? [...subSeg.querySelectorAll("button[data-v]")] : [];
    const playB = $("regPlay");

    let view = "atlas", mode = "day", playing = null, moveFn = null, worldData = null;

    function updateLegend() {
      if (!lgdEl) return;
      lgdEl.innerHTML = "";
      if (view === "atlas") {
        const rLg = d3.scaleSqrt([0, 1], [6, 20]);
        IBV.legendSize(lgdEl, {
          values: [0.2, 0.5, 0.9],
          r: v => rLg(v),
          f: v => `${Math.round(v * 100)} %`,
          title: "% de biomassa que migra",
          stroke: C.vermell
        });
      } else {
        IBV.legendCat(lgdEl, [
          { c: C.ink, t: "De dia", kind: "dot" },
          { c: C.ink, t: "De nit", kind: "hollow" },
          { c: C.vermell, t: "Capa activa (% que migra)", kind: "dot", a: 0.45 }
        ]);
      }
    }

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

    const M = IBV.mount(wrap, (el, w) => {
      updateLegend();
      if (subSeg) subSeg.hidden = view !== "depth";

      const ARIA = "Dades de l'expedició Malaspina (Klevjer et al., 2016) en cinc regions oceàniques. Pacífic oriental: 348 m de dia, 97 m de nit, migra el 91 %. Sud de l'Índic: 591 i 470 m, migra el 20 %. Mitjana global: 486 i 303 m, migra el 46 %.";

      /* ---- VISTA 1: ATLES OCEÀNIC (MAP-03 Equal Earth + cercles d'aquarel·la multiply) ---- */
      if (view === "atlas") {
        moveFn = null;
        const narrow = w < 600;
        const h = narrow ? Math.round(clamp(w * 0.64, 230, 320)) : Math.round(clamp(w * 0.50, 380, 500));
        const s = IBV.svg(el, w, h, ARIA);
        const defs = s.append("defs");
        const uid = "at" + Math.random().toString(36).slice(2, 6);
        const washRed = addWashGrad(defs, uid + "r", C.vermell, 0.50, 0.24);
        const washHi = addWashGrad(defs, uid + "h", C.vermell, 0.64, 0.34);

        const proj = d3.geoEqualEarth().fitExtent([[narrow ? 4 : 12, narrow ? 10 : 14], [w - (narrow ? 4 : 12), h - (narrow ? 14 : 24)]], { type: "Sphere" });
        const path = d3.geoPath(proj);
        const rMap = d3.scaleSqrt([0, 1], [narrow ? 9 : 14, narrow ? 30 : 48]);

        // Gratícula finíssima i esfera subtil (aigua = paper blanc P1)
        const mapG = s.append("g").attr("class", "ib25-map");
        mapG.append("path").datum(d3.geoGraticule10()).attr("d", path)
          .attr("fill", "none").attr("stroke", C.grid).attr("stroke-width", 0.45);
        mapG.append("path").datum({ type: "Sphere" }).attr("d", path)
          .attr("fill", "none").attr("stroke", C.hair).attr("stroke-width", 0.6);

        const landG = mapG.append("g");
        const drawLand = wd => {
          landG.selectAll("*").remove();
          landG.append("path").datum(wd.land).attr("d", path).attr("fill", C.land);
          landG.append("path").datum(wd.borders).attr("d", path)
            .attr("fill", "none").attr("stroke", C.paper).attr("stroke-width", 0.5);
        };
        if (worldData) {
          drawLand(worldData);
        } else if (window.topojson) {
          IBV.world().then(wd => { worldData = wd; drawLand(wd); }).catch(() => {});
        }

        // Ruta subtil de l'expedició Malaspina
        const routeLine = { type: "LineString", coordinates: ROUTE };
        s.append("path").datum(routeLine).attr("d", path)
          .attr("fill", "none").attr("stroke", C.blau).attr("stroke-opacity", 0.34)
          .attr("stroke-width", 1).attr("stroke-dasharray", "3 3");

        // Cercles d'aquarel·la MAP-03 proporcionals al % migrador
        const pts = GEO_D.map(d => {
          const [px, py] = proj([d.lon, d.lat]);
          return Object.assign({}, d, { px, py, r: rMap(d.p) });
        });

        const grp = s.append("g").selectAll("g.mp").data(pts).join("g").attr("class", "mp hit")
          .attr("transform", d => `translate(${d.px},${d.py})`);

        grp.append("circle").attr("class", "mw")
          .attr("r", 0)
          .attr("fill", d => d.p > 0.7 ? washHi : washRed)
          .style("mix-blend-mode", "multiply");
        grp.append("circle").attr("class", "mr")
          .attr("r", 0)
          .attr("fill", "none")
          .attr("stroke", IBV.alpha(C.vermell, 0.42))
          .attr("stroke-width", 0.85);
        grp.append("circle").attr("class", "mc")
          .attr("r", 0)
          .attr("fill", C.vermell)
          .attr("stroke", C.paper).attr("stroke-width", 1.2);

        // Etiquetes directes netes dins del mapa
        grp.each(function (d) {
          const g = d3.select(this);
          const pct = `${Math.round(d.p * 100)} %`;
          if (!narrow || d.p >= 0.6 || d.p <= 0.22) {
            IBV.t(g, 0, -d.r - 5, d.n, { size: narrow ? IBV.FS.min : IBV.FS.small, anchor: "middle", weight: 700, fill: C.ink, halo: 3 });
          }
          IBV.t(g, 0, 4, pct, { size: narrow ? IBV.FS.min : IBV.FS.label, anchor: "middle", weight: 700, fill: C.ink, halo: 3 });
        });

        // Fletxes corbes IBV.note als extrems (Pacífic oriental vs Sud de l'Índic)
        if (!narrow) {
          const ep = pts.find(d => d.n === "Pacífic oriental");
          const si = pts.find(d => d.n === "Sud de l'Índic");
          if (ep) {
            IBV.note(s, {
              x: ep.px - ep.r * 0.72, y: ep.py + ep.r * 0.55,
              tx: Math.max(12, ep.px - ep.r - 22), ty: Math.min(h - 42, ep.py + ep.r + 36),
              kind: "curve", bend: -16, anchor: "start",
              lines: [["Màxim: 91 % migra", true, C.vermell], ["Aigua pobra en oxigen · dia a 348 m", false, C.ink2]]
            });
          }
          if (si) {
            IBV.note(s, {
              x: si.px + si.r * 0.75, y: si.py + si.r * 0.45,
              tx: Math.min(w - 14, si.px + si.r + 28), ty: Math.min(h - 38, si.py + si.r + 26),
              kind: "curve", bend: 14, anchor: "end",
              lines: [["Mínim: 20 % migra", true, C.ink], ["Aigua clara · dia a 591 m", false, C.ink2]]
            });
          }
        }

        // Referència discreta de la mitjana global
        IBV.t(s, narrow ? 8 : 16, h - 6, "Mitjana Malaspina (105 parells): migra el 46 % · dia 486 m → nit 303 m", {
          size: IBV.FS.min, fill: C.muted, italic: true
        });

        IBV.onView(el, instant => {
          const dur = instant ? 0 : IBV.DUR;
          grp.select(".mw").transition().duration(dur).delay((_, i) => instant ? 0 : i * 85).ease(IBV.EASE).attr("r", d => d.r);
          grp.select(".mr").transition().duration(dur).delay((_, i) => instant ? 0 : i * 85).ease(IBV.EASE).attr("r", d => d.r);
          grp.select(".mc").transition().duration(dur * 0.6).delay((_, i) => instant ? 0 : 120 + i * 85).attr("r", 3);
        });

        IBV.hover(s.node(), (_ev, [mx, my]) => {
          const near = d3.least(pts, d => Math.hypot(d.px - mx, d.py - my));
          if (!near || Math.hypot(near.px - mx, near.py - my) > Math.max(near.r + 22, 44)) {
            IBV.focus(grp, null);
            grp.select(".mr").attr("stroke", IBV.alpha(C.vermell, 0.42)).attr("stroke-width", 0.85);
            tp.hide();
            return;
          }
          IBV.focus(grp, d => d === near);
          grp.select(".mr").attr("stroke", d => d === near ? C.ink : IBV.alpha(C.vermell, 0.42))
            .attr("stroke-width", d => d === near ? 1.6 : 0.85);
          grp.filter(d => d === near).raise();
          tp.show(`<b>${near.n}</b> · migra el <b>${Math.round(near.p * 100)} %</b><br>Dia ${near.d} m → Nit ${near.ni} m (amplitud ${near.a} m · ${near.k} parells)`);
        }, () => {
          IBV.focus(grp, null);
          grp.select(".mr").attr("stroke", IBV.alpha(C.vermell, 0.42)).attr("stroke-width", 0.85);
          tp.hide();
        });
        return;
      }

      /* ---- VISTA 2: PROFUNDITAT DIA · NIT (CASE-03 / CASE-04 amb cercles d'aquarel·la) ---- */
      const m = mob(), narrow = w < 600;
      if (narrow) {
        const ml = 8, mr = 14, mt = 44, mb = 28, rowH = 62, gap = 14;
        const h = mt + D.length * rowH + gap + mb;
        const s = IBV.svg(el, w, h, ARIA);
        const defs = s.append("defs");
        const washRed = addWashGrad(defs, "rgm" + Math.random().toString(36).slice(2, 6), C.vermell, 0.46, 0.22);
        const x = d3.scaleLinear([0, 700], [ml, w - mr]);
        const rowY = i => mt + i * rowH + (D[i].all ? gap : 0);
        const rRow = d3.scaleSqrt([0, 1], [7, 17]);

        s.append("rect").attr("x", x(200)).attr("width", x(650) - x(200))
          .attr("y", mt - 6).attr("height", h - mb - (mt - 6))
          .attr("fill", C.neutral).attr("fill-opacity", 0.55);
        IBV.t(s, w - mr, mt - 12, "200–650 m: interval mundial de dia", { size: IBV.FS.min, anchor: "end", fill: C.muted, italic: true });
        IBV.t(s, ml, mt - 24, "0 m · Superfície", { size: IBV.FS.small, fill: C.blau, weight: 600 });

        for (let z = 0; z <= 700; z += 100) {
          s.append("line").attr("x1", x(z)).attr("x2", x(z)).attr("y1", mt - 6).attr("y2", h - mb)
            .attr("stroke", z === 0 ? C.blau : C.grid).attr("stroke-width", z === 0 ? 1.3 : 0.6);
        }
        const ax = IBV.axisX(s, x, h - mb, [0, 200, 400, 600, 700], v => v === 700 ? "700 m" : String(v), { tick: false });
        ax.selectAll("text").filter((_, i, n) => i === 0).attr("text-anchor", "start");
        ax.selectAll("text").filter((_, i, n) => i === n.length - 1).attr("text-anchor", "end").attr("x", w - 4);

        const sepY = rowY(5) - gap / 2;
        s.append("line").attr("x1", ml).attr("x2", w - mr).attr("y1", sepY).attr("y2", sepY).attr("stroke", C.hair).attr("stroke-width", 0.9);

        const vGuide = s.append("line").attr("y1", mt - 6).attr("y2", h - mb)
          .attr("stroke", C.ink).attr("stroke-width", 0.7).attr("stroke-dasharray", "2 3").style("opacity", 0);

        const rows = s.append("g").selectAll("g.col").data(D).join("g").attr("class", "col hit");
        const ycOf = (_, i) => rowY(i) + 38;

        rows.append("line").attr("x1", x(0)).attr("x2", x(700)).attr("y1", ycOf).attr("y2", ycOf)
          .attr("stroke", C.hair).attr("stroke-width", 0.55);
        rows.each(function (d, i) {
          const gg = d3.select(this), ty = rowY(i) + 15;
          IBV.t(gg, ml, ty, d.n, { size: IBV.FS.label, fill: C.ink, weight: d.all ? 700 : 600 });
          IBV.t(gg, w - mr, ty, `migra el ${Math.round(d.p * 100)} %`, { size: IBV.FS.small, anchor: "end", fill: C.vermell, weight: 600 });
        });

        // Cinta d'amplitud translúcida + tija discontínua
        const ribbons = rows.append("line")
          .attr("x1", d => x(d.d)).attr("x2", d => x(d.d)).attr("y1", ycOf).attr("y2", ycOf)
          .attr("stroke", IBV.alpha(C.blau, 0.20)).attr("stroke-width", 6).attr("stroke-linecap", "round");
        const stems = rows.append("line")
          .attr("x1", d => x(d.d)).attr("x2", d => x(d.d)).attr("y1", ycOf).attr("y2", ycOf)
          .attr("stroke", C.ink2).attr("stroke-width", 1).attr("stroke-dasharray", "2 3");

        rows.append("circle").attr("cx", d => x(d.d)).attr("cy", ycOf).attr("r", 3.5).attr("fill", C.ink);
        rows.append("circle").attr("cx", d => x(d.ni)).attr("cy", ycOf).attr("r", 3.5).attr("fill", C.paper).attr("stroke", C.ink).attr("stroke-width", 1.2);

        const halos = rows.append("circle").attr("class", "reg-halo")
          .attr("cx", d => x(mode === "day" ? d.d : d.ni)).attr("cy", ycOf).attr("r", 0)
          .attr("fill", washRed).style("mix-blend-mode", "multiply");
        const cores = rows.append("circle").attr("class", "reg-core")
          .attr("cx", d => x(mode === "day" ? d.d : d.ni)).attr("cy", ycOf).attr("r", 0)
          .attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.2);

        const labPos = d => {
          const v = mode === "day" ? d.d : d.ni;
          const leftSide = v > 500;
          return { x: x(v) + (leftSide ? -(rRow(d.p) + 6) : (rRow(d.p) + 6)), anchor: leftSide ? "end" : "start" };
        };
        const labs = rows.append("text")
          .attr("x", d => labPos(d).x).attr("y", (_, i) => ycOf(_, i) + 4)
          .attr("text-anchor", d => labPos(d).anchor).attr("font-size", IBV.FS.min).attr("font-weight", 600).attr("fill", C.ink)
          .style("font-variant-numeric", "tabular-nums")
          .text(d => `${mode === "day" ? d.d : d.ni} m`);
        IBV.halo(labs, 3);

        moveFn = anim => {
          const dur = anim && !RM ? 1050 : 0;
          halos.transition().duration(dur).ease(d3.easeCubicInOut).attr("cx", d => x(mode === "day" ? d.d : d.ni));
          cores.transition().duration(dur).ease(d3.easeCubicInOut).attr("cx", d => x(mode === "day" ? d.d : d.ni));
          labs.attr("text-anchor", d => labPos(d).anchor).transition().duration(dur).ease(d3.easeCubicInOut)
            .attr("x", d => labPos(d).x)
            .tween("text", function (d) {
              const node = this, a = parseInt(node.textContent, 10), b = mode === "day" ? d.d : d.ni;
              const interp = d3.interpolateNumber(isNaN(a) ? b : a, b);
              return t => { node.textContent = Math.round(interp(t)) + " m"; };
            });
        };

        IBV.onView(el, instant => {
          const dur = instant ? 0 : IBV.DUR;
          ribbons.transition().duration(dur).ease(IBV.EASE).attr("x1", d => x(d.ni));
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
          rows.select("circle.reg-halo").attr("stroke", dd => dd === d ? C.ink : "none").attr("stroke-width", 1.5);
          rows.filter(dd => dd === d).raise();
          const cx = x(mode === "day" ? d.d : d.ni);
          vGuide.attr("x1", cx).attr("x2", cx).style("opacity", 0.7);
          tp.show(`<b>${d.n}</b> · Dia ${d.d} m → Nit ${d.ni} m<br>Amplitud ${d.a} m · migra el ${Math.round(d.p * 100)} % (${d.k} parells)`);
        }, () => {
          IBV.focus(rows, null); rows.select("circle.reg-halo").attr("stroke", "none");
          vGuide.style("opacity", 0); tp.hide();
        });
        return;
      }

      // Escriptori: columnes verticals de profunditat (CASE-03 / CASE-04 amb cercles d'aquarel·la)
      const h = m ? 420 : 470;
      const mt = 32, mb = 78, ml = 8, gx0 = 48, mr = 14;
      const s = IBV.svg(el, w, h, ARIA);
      const defs = s.append("defs");
      const washRed = addWashGrad(defs, "rgd" + Math.random().toString(36).slice(2, 6), C.vermell, 0.48, 0.22);

      const y = d3.scaleLinear([0, 700], [mt, h - mb]);
      const gap = 26;
      const bw = (w - gx0 - mr - gap) / D.length;
      const X = i => gx0 + i * bw + (D[i].all ? gap : 0) + bw / 2;
      const rCol = d3.scaleSqrt([0, 1], [8, 25]);

      s.append("rect").attr("x", ml).attr("width", w - ml - mr).attr("y", y(200)).attr("height", y(650) - y(200))
        .attr("fill", C.neutral).attr("fill-opacity", 0.52);
      IBV.t(s, w - mr - 4, y(650) - 6, "Interval mundial de fondàries de dia: 200–650 m (Bianchi et al., 2013)", {
        size: IBV.FS.min, anchor: "end", fill: C.muted, italic: true
      });

      IBV.gridY(s, y, ml, w - mr, [700, 600, 500, 400, 300, 200, 100, 0], v => String(v), { unit: " m" });
      s.append("line").attr("x1", ml).attr("x2", w - mr).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.blau).attr("stroke-width", 1.3);
      IBV.t(s, ml + 34, y(0) - 4, "· Superfície", { size: IBV.FS.small, fill: C.blau, weight: 600 });

      const sepX = X(5) - bw / 2 - gap / 2;
      s.append("line").attr("x1", sepX).attr("x2", sepX).attr("y1", y(0)).attr("y2", h - 10).attr("stroke", C.hair).attr("stroke-width", 0.9);

      const hGuide = s.append("line").attr("x1", ml).attr("x2", w - mr)
        .attr("stroke", C.ink).attr("stroke-width", 0.7).attr("stroke-dasharray", "2 3").style("opacity", 0);

      const cols = s.append("g").selectAll("g.col").data(D).join("g").attr("class", "col hit");

      const ribbons = cols.append("line")
        .attr("x1", (_, i) => X(i)).attr("x2", (_, i) => X(i))
        .attr("y1", d => y(d.d)).attr("y2", d => y(d.d))
        .attr("stroke", IBV.alpha(C.blau, 0.18)).attr("stroke-width", 8).attr("stroke-linecap", "round");
      const stems = cols.append("line")
        .attr("x1", (_, i) => X(i)).attr("x2", (_, i) => X(i))
        .attr("y1", d => y(d.d)).attr("y2", d => y(d.d))
        .attr("stroke", C.ink2).attr("stroke-width", 1).attr("stroke-dasharray", "2 3");

      cols.append("circle").attr("cx", (_, i) => X(i)).attr("cy", d => y(d.d)).attr("r", 3.5).attr("fill", C.ink);
      cols.append("circle").attr("cx", (_, i) => X(i)).attr("cy", d => y(d.ni)).attr("r", 3.5).attr("fill", C.paper).attr("stroke", C.ink).attr("stroke-width", 1.2);

      const halos = cols.append("circle").attr("class", "reg-halo")
        .attr("cx", (_, i) => X(i)).attr("cy", d => y(mode === "day" ? d.d : d.ni)).attr("r", 0)
        .attr("fill", washRed).style("mix-blend-mode", "multiply");
      const cores = cols.append("circle").attr("class", "reg-core")
        .attr("cx", (_, i) => X(i)).attr("cy", d => y(mode === "day" ? d.d : d.ni)).attr("r", 0)
        .attr("fill", C.vermell).attr("stroke", C.paper).attr("stroke-width", 1.2);

      const labs = cols.append("text")
        .attr("x", (_, i) => X(i) + 14)
        .attr("y", d => y(mode === "day" ? d.d : d.ni) + 4)
        .attr("text-anchor", "start").attr("font-size", IBV.FS.label).attr("font-weight", 600).attr("fill", C.ink)
        .style("font-variant-numeric", "tabular-nums")
        .text(d => (mode === "day" ? d.d : d.ni) + " m");
      IBV.halo(labs, 3);

      const by = h - mb + 18;
      cols.each(function (d, i) {
        const gg = d3.select(this), x = X(i);
        IBV.lines(gg, x, by, d.s.map(t => [t, !!d.all]), {
          size: IBV.FS.label, anchor: "middle", fill: C.ink, weight: d.all ? 700 : 600
        });
        IBV.t(gg, x, by + 42, `${Math.round(d.p * 100)} %`, {
          size: IBV.FS.small, anchor: "middle", fill: C.vermell, weight: 600
        });
      });

      IBV.note(s, {
        x: X(0) + rCol(D[0].p) * 0.7, y: y(215),
        tx: X(0) + 44, ty: y(148),
        kind: "curve", bend: -12,
        lines: [["Poc oxigen a fondària", true], ["es queda més amunt,", false], ["però en puja el 91 %", false]]
      });

      moveFn = anim => {
        const dur = anim && !RM ? 1050 : 0;
        halos.transition().duration(dur).ease(d3.easeCubicInOut).attr("cy", d => y(mode === "day" ? d.d : d.ni));
        cores.transition().duration(dur).ease(d3.easeCubicInOut).attr("cy", d => y(mode === "day" ? d.d : d.ni));
        labs.transition().duration(dur).ease(d3.easeCubicInOut)
          .attr("y", d => y(mode === "day" ? d.d : d.ni) + 4)
          .tween("text", function (d) {
            const node = this, a = parseInt(node.textContent, 10), b = mode === "day" ? d.d : d.ni;
            const interp = d3.interpolateNumber(isNaN(a) ? b : a, b);
            return t => { node.textContent = Math.round(interp(t)) + " m"; };
          });
      };

      IBV.onView(el, instant => {
        const dur = instant ? 0 : IBV.DUR;
        ribbons.transition().duration(dur).ease(IBV.EASE).attr("y1", d => y(d.ni));
        stems.transition().duration(dur).ease(IBV.EASE).attr("y1", d => y(d.ni));
        halos.transition().duration(dur).delay((_, i) => instant ? 0 : i * 70).ease(IBV.EASE).attr("r", d => rCol(d.p));
        cores.transition().duration(dur).delay((_, i) => instant ? 0 : i * 70).ease(IBV.EASE).attr("r", 3.4);
      });

      IBV.hover(s.node(), (_ev, [mx]) => {
        const idx = d3.leastIndex(D, (_, i) => Math.abs(X(i) - mx));
        if (idx == null || idx < 0) return;
        const d = D[idx];
        IBV.focus(cols, dd => dd === d);
        cols.select("circle.reg-halo").attr("stroke", dd => dd === d ? C.ink : "none").attr("stroke-width", 1.5);
        cols.filter(dd => dd === d).raise();
        const cy = y(mode === "day" ? d.d : d.ni);
        hGuide.attr("y1", cy).attr("y2", cy).style("opacity", 0.7);
        tp.show(`<b>${d.n}</b> · Dia ${d.d} m → Nit ${d.ni} m<br>Amplitud ${d.a} m · migra el ${Math.round(d.p * 100)} % (${d.k} parells)`);
      }, () => {
        IBV.focus(cols, null); cols.select("circle.reg-halo").attr("stroke", "none");
        hGuide.style("opacity", 0); tp.hide();
      });
    });

    viewBtns.forEach(b => b.addEventListener("click", () => {
      stopPlay();
      view = b.dataset.view;
      viewBtns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      wrap.__seen = true;
      M.redraw();
    }));
  })();

  /* =========================================================
     4. ECOGRAMA SIMULAT
        CASE-06 matriu acústica monocroma blava + SPREAD-06 isolínies blanques + perfil vertical
     ========================================================= */
  (function () {
    const stack = $("echoStack"), wrap = $("echowrap"), lgdEl = $("echoLgd");
    const note = $("echoNote"), replay = $("echoPlay");
    const btns = [...document.querySelectorAll("#echoSeg button")];
    if (!stack || !wrap) return;

    const ARIA = "Ecograma simulat amb isolínies de densitat acústica: el temps d'esquerra a dreta i la fondària de dalt a baix. La capa d'animals puja de nit i baixa de dia. Es pot triar entre lluna nova, lluna plena, un dia de núvols i la nit polar.";
    const blueSeq = d3.scaleSequential(d3.piecewise(d3.interpolateLab, ["#FFFFFF", "#EDF3FA", C.blauClar, C.blau, C.blauFosc])).domain([0, 1]).clamp(true);
    const lightSeq = d3.scaleLinear().domain([-3.2, -1.2, 0.8, 3.0, 5.0])
      .range([C.blauFosc, C.blau, C.blauClar, C.grocClar, C.groc]).clamp(true);

    if (lgdEl) {
      IBV.legendRamp(lgdEl, {
        scale: blueSeq, min: 0, max: 1, ticks: [0, 1],
        f: v => (v === 0 ? "0" : "Màx"),
        title: "Densitat d'eco simulada (isolínies blanques)", lo: "Pocs animals", hi: "Més densitat", w: 170
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

    function densityAt(p, zl, z) {
      const sig = p.zMax * 0.052, sig2 = p.zMax * 0.072;
      let v = p.mf * Math.exp(-Math.pow((z - zl) / sig, 2) / 2) * 1.12;
      if (zl < sig * 1.2) v += p.mf * 0.45 * Math.exp(-Math.pow((z - zl * 0.6) / (sig * 1.6), 2) / 2);
      if (p.res) v += (1 - p.mf) * 1.12 * Math.exp(-Math.pow((z - p.res) / sig2, 2) / 2);
      v += 0.025 * Math.exp(-z / (p.zMax * 0.14));
      return clamp(v, 0, 1);
    }

    const LUT = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
      const col = d3.rgb(blueSeq(i / 255));
      LUT[i * 3] = col.r; LUT[i * 3 + 1] = col.g; LUT[i * 3 + 2] = col.b;
    }

    const tp = IBV.tip(wrap);
    let P = "nova", DATA = null, W = 0, H = 0, ctx = null, overSvg = null, plot = {};
    let img = null, rev = 1, revT = 0, loopH = null, hLine = null, hDot = null, hProf = null, hProfFill = null;

    function buildOffscreen() {
      const p = PRE[P];
      DATA = simulate(p);
      const pw = Math.max(10, Math.round(plot.w)), phh = Math.max(10, Math.round(plot.h));
      const oc = document.createElement("canvas");
      oc.width = pw; oc.height = phh;
      const o = oc.getContext("2d");
      const id = o.createImageData(pw, phh), px = id.data;
      const r = IBV.rng(5);
      const noise = new Float32Array(pw * phh);
      for (let i = 0; i < noise.length; i++) noise[i] = r();

      for (let x = 0; x < pw; x++) {
        const i = Math.min(DATA.n - 1, Math.round((x / pw) * (DATA.n - 1)));
        const zl = DATA.Z[i];
        for (let yy = 0; yy < phh; yy++) {
          const z = (yy / phh) * p.zMax;
          let v = densityAt(p, zl, z);
          const nz = (noise[yy * pw + x] + noise[yy * pw + Math.max(0, x - 1)] + noise[Math.max(0, yy - 1) * pw + x]) / 3;
          v = v * (0.72 + 0.56 * nz);
          const idx = Math.min(255, Math.max(0, Math.round(clamp(v, 0, 1) * 255))) * 3;
          const k = (yy * pw + x) * 4;
          px[k] = LUT[idx]; px[k + 1] = LUT[idx + 1]; px[k + 2] = LUT[idx + 2]; px[k + 3] = 255;
        }
      }
      o.putImageData(id, 0, 0);

      // Reixa blanca subtil estil CASE-06 (fils blancs de 0,7 px)
      o.save();
      o.strokeStyle = "rgba(255,255,255,0.28)";
      o.lineWidth = 0.7;
      const stepZ = p.zMax > 300 ? 100 : 50;
      for (let z = stepZ; z < p.zMax; z += stepZ) {
        const yy = Math.round((z / p.zMax) * phh) + 0.5;
        o.beginPath(); o.moveTo(0, yy); o.lineTo(pw, yy); o.stroke();
      }
      const stepH = p.hours > 96 ? 24 : 12;
      for (let h = stepH; h < p.hours; h += stepH) {
        const xx = Math.round((h / p.hours) * pw) + 0.5;
        o.beginPath(); o.moveTo(xx, 0); o.lineTo(xx, phh); o.stroke();
      }
      o.restore();

      // Isolínies blanques SPREAD-06 sobre el camp acústic suau (d3.contours)
      const gw = 132, gh = 66;
      const grid = new Float32Array(gw * gh);
      for (let gy = 0; gy < gh; gy++) {
        const z = (gy / (gh - 1)) * p.zMax;
        for (let gx = 0; gx < gw; gx++) {
          const i = Math.min(DATA.n - 1, Math.round((gx / (gw - 1)) * (DATA.n - 1)));
          grid[gy * gw + gx] = densityAt(p, DATA.Z[i], z);
        }
      }
      const contours = d3.contours().size([gw, gh]).smooth(true).thresholds([0.22, 0.42, 0.62, 0.80])(grid);
      o.save();
      o.scale(pw / gw, phh / gh);
      const cPath = d3.geoPath(null, o);
      contours.forEach((ct, ci) => {
        o.beginPath();
        cPath(ct);
        o.strokeStyle = `rgba(255,255,255,${0.58 + ci * 0.11})`;
        o.lineWidth = (0.75 + ci * 0.12) * (gw / pw);
        o.stroke();
      });
      o.restore();

      img = oc;
      if (note) note.textContent = p.note;
    }

    function drawOverlay() {
      if (!overSvg || !DATA) return;
      const m = mob(), p = PRE[P];
      overSvg.selectAll("*").remove();
      const X = d3.scaleLinear([0, p.hours], [plot.x, plot.x + plot.w]);
      const Y = d3.scaleLinear([0, p.zMax], [plot.y, plot.y + plot.h]);

      IBV.t(overSvg, plot.x, plot.y - 18, "Llum en superfície (groc = dia · blau fosc = nit)", {
        size: IBV.FS.min, fill: C.muted
      });

      const stepZ = p.zMax > 300 ? 100 : 50;
      for (let z = 0; z <= p.zMax; z += stepZ) {
        overSvg.append("line").attr("x1", plot.x).attr("x2", plot.x + plot.w)
          .attr("y1", Y(z)).attr("y2", Y(z))
          .attr("stroke", z === 0 ? C.blau : C.grid).attr("stroke-width", z === 0 ? 1.2 : 0.5)
          .attr("stroke-opacity", z === 0 ? 1 : 0.45);
        IBV.t(overSvg, plot.x - 7, Y(z) + 4, z === 0 ? "0 m" : String(z), {
          size: IBV.FS.small, anchor: "end", fill: C.muted
        });
      }

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

      const annG = overSvg.append("g").attr("class", "echo-ann");
      if (P === "nova" || P === "plena") {
        const zn = DATA.Z[Math.min(DATA.n - 1, Math.round(36 / DATA.dt))];
        IBV.note(annG, {
          x: X(36), y: Y(Math.max(zn, 10)),
          tx: X(36) + (m ? -12 : 16), ty: Y(Math.max(zn, 10)) + (P === "plena" ? 56 : 52),
          kind: "curve", bend: m ? -10 : 12, dot: true, anchor: m ? "end" : "start",
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

      // Guia interactiva i perfil vertical instantani en hover
      hProfFill = overSvg.append("path").attr("fill", IBV.alpha(C.vermell, 0.22)).style("opacity", 0);
      hProf = overSvg.append("path").attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 1.6).style("opacity", 0);
      hLine = overSvg.append("line").attr("y1", plot.y).attr("y2", plot.y + plot.h)
        .attr("stroke", C.ink).attr("stroke-width", 0.9).attr("stroke-dasharray", "2 2").style("opacity", 0);
      hDot = overSvg.append("circle").attr("r", 4.5).attr("fill", C.vermell)
        .attr("stroke", C.paper).attr("stroke-width", 1.5).style("opacity", 0);
    }

    function drawCanvas() {
      if (!ctx || !img || !DATA) return;
      const c = ctx;
      c.clearRect(0, 0, W, H);
      // Franja solar superior
      const sh = 9, sy = plot.y - sh - 5;
      for (let x = 0; x < plot.w; x += 2) {
        const i = Math.round((x / plot.w) * (DATA.n - 1));
        c.fillStyle = lightSeq(DATA.L[i]);
        c.fillRect(plot.x + x, sy, 2.5, sh);
      }
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
      W = w; H = m ? 320 : 430;
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

      const hideHover = () => {
        if (hLine) hLine.style("opacity", 0);
        if (hDot) hDot.style("opacity", 0);
        if (hProf) hProf.style("opacity", 0);
        if (hProfFill) hProfFill.style("opacity", 0);
        tp.hide();
      };

      IBV.hover(overSvg.node(), (_ev, [mx, my]) => {
        if (!DATA || mx < plot.x || mx > plot.x + plot.w || my < plot.y - 16 || my > plot.y + plot.h) {
          hideHover(); return;
        }
        const p = PRE[P];
        const i = Math.round(((mx - plot.x) / plot.w) * (DATA.n - 1));
        const t = DATA.T[i], tt = p.t0 + t, L = DATA.L[i], z = DATA.Z[i];
        const light = L > 2.8 ? "sol" : L > 0.4 ? "crepuscle" : L > -1.6 ? "lluna" : "fosc";
        const cy = plot.y + (z / p.zMax) * plot.h;
        if (hLine) hLine.attr("x1", mx).attr("x2", mx).style("opacity", 0.8);
        if (hDot) hDot.attr("cx", mx).attr("cy", cy).style("opacity", 1);

        // Perfil vertical acústic instantani projectat a dreta o esquerra del cursor
        const dir = mx > plot.x + plot.w - 58 ? -1 : 1;
        const profW = m ? 32 : 46;
        const pts = [];
        for (let s = 0; s <= 48; s++) {
          const zz = (s / 48) * p.zMax;
          const v = densityAt(p, z, zz);
          pts.push([mx + dir * v * profW, plot.y + (zz / p.zMax) * plot.h]);
        }
        const dLine = "M" + pts.map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join("L");
        const dArea = `${dLine}L${mx.toFixed(1)},${(plot.y + plot.h).toFixed(1)}L${mx.toFixed(1)},${plot.y.toFixed(1)}Z`;
        if (hProf) hProf.attr("d", dLine).style("opacity", 0.92);
        if (hProfFill) hProfFill.attr("d", dArea).style("opacity", 1);

        tp.show(`<b>Dia ${Math.floor(tt / 24) + 1}, ${hhmm(tt)}</b> · perfil vertical actiu<br>Capa a ${fmt0(z)} m · llum en superfície: ${light}`);
      }, hideHover);

      IBV.onView(el, instant => startReveal(instant));
    });
  })();

  /* =========================================================
     5. BOMBA DE CARBONI (LINK-03 flux vertical d'aquarel·la + ~1.000 micro-traços lents)
     ========================================================= */
  (function () {
    const stack = $("cStack"), plotEl = $("cPlot"), lgdEl = $("cLgd");
    if (!stack || !plotEl) return;
    const graphic = $("cgraph"), steps = $("csteps"), tEl = $("cTitle"), sEl = $("cSub");
    const ARIA = "Flux vertical d'aquarel·la de la bomba biològica: el fitoplàncton fixa CO₂ a la superfície; la neu marina passiva s'atenua aviat; els migradors injecten carboni sota la termoclina (400–600 m) i els excrements s'enfonsen cap a l'oceà profund.";

    if (lgdEl) {
      IBV.legendCat(lgdEl, [
        { c: C.blau, t: "Fitoplàncton", kind: "dot", a: 0.7 },
        { c: C.muted, t: "Neu marina passiva", kind: "dot", a: 0.55 },
        { c: C.vermell, t: "Injecció dels migradors", kind: "dot", a: 0.75 },
        { c: C.blauFosc, t: "Excrements profunds", kind: "dot", a: 0.85 },
        { c: C.ink, t: "CO₂ respirat", kind: "hollow" }
      ]);
    }

    const tp = IBV.tip(plotEl);
    const ZM = 1100, DAY = 0.75;
    const r = IBV.rng(3);
    let PH = [], SNOW_STR = [], MIG_STR = [], POOP_STR = [], co2 = [], air = [];
    const F = { snow: 0, mig: 0, rel: 0, seq: 0, air: 1, arr: 0 };
    const CS = [
      { air: 1, sub: "El fitoplàncton fixa el CO₂ a la zona il·luminada" },
      { air: 0.6, snow: 1, sub: "Neu marina passiva: s'enfonsa a 10–100 m/dia i es consumeix aviat" },
      { air: 0.4, snow: 0.75, mig: 1, arr: 1, seg: [0.16, 0.7], rmPh: 0.48, sub: "Injecció activa dels migradors sota la termoclina" },
      { air: 0.3, snow: 0.65, mig: 1, rel: 1, sub: "Respiració de CO₂ i excrements ràpids a la zona crepuscular" },
      { air: 0.3, snow: 0.55, mig: 1, rel: 1, seq: 1, sub: "Horitzons de segrest del carboni (Boyd et al., 2019)" }
    ];
    let step = 0, ph = DAY, hold = 0, hoverZ = null;
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
      const m = mob();
      PH = [];
      for (let i = 0; i < (m ? 180 : 300); i++) {
        PH.push({ x: r(), z: clamp(12 + Math.pow(r(), 0.9) * 125, 4, 165), w: r() * 6.283 });
      }
      // ~1.000 micro-traços lents (~25–30 s de recorregut vertical complet, estil LINK-03 / MAP-19)
      SNOW_STR = [];
      const nSnow = m ? 260 : 480;
      for (let i = 0; i < nSnow; i++) {
        SNOW_STR.push({
          u: r(), // posició normalitzada dins la banda esquerra (0..1)
          z: 18 + r() * 980,
          v: 28 + r() * 14, // ~25–38 s per recórrer 1.000 m
          len: 3.5 + r() * 4.5,
          w: r() * 6.283
        });
      }
      MIG_STR = [];
      const nMig = m ? 150 : 300;
      for (let i = 0; i < nMig; i++) {
        MIG_STR.push({
          u: r(),
          nd: 16 + r() * 88,
          dd: 350 + r() * 260,
          tj: r() * 0.04,
          z: null, pz: null, vz: 0,
          w: r() * 6.283
        });
      }
      POOP_STR = [];
      const nPoop = m ? 140 : 260;
      for (let i = 0; i < nPoop; i++) {
        POOP_STR.push({
          u: r(),
          z0: 360 + r() * 210,
          z: 360 + r() * 720,
          v: 36 + r() * 16, // ~20–28 s de 400 m a 1.100 m
          len: 6 + r() * 6
        });
      }
      co2 = []; air = [];
      for (let i = 0; i < 18; i++) air.push({ x: r(), z: -30 + r() * 110, v: 18 + r() * 12, end: 18 + r() * 90, a: 0.7 });
      for (let i = 0; i < 42; i++) co2.push({ u: r(), z: 360 + r() * 250, v: -(5 + r() * 5), a: r(), dx: (r() - 0.5) * 0.008 });
    }
    initParticles();

    let ctx = null, cvNode = null, overSvg = null, W = 0, H = 0, skyH = 0, y0 = 0, ML = 0, MR = 0;
    const yz = z => y0 + (z / ZM) * (H - y0 - 4);
    const zy = y => clamp((y - y0) / (H - y0 - 4) * ZM, 0, ZM);

    function drawOverlayNotes() {
      if (!overSvg || !W) return;
      overSvg.selectAll("*").remove();
      const m = mob() || W < 600;
      const plotW = W - ML - MR;
      const xLeft = ML + plotW * 0.27;
      const xRight = ML + plotW * 0.68;

      // Horitzons de segrest nítids (sempre subtilment presents; destacats al pas 4)
      const seqAlpha = step === 4 ? 1 : 0.38;
      const xr = W - MR - 6;
      const hG = overSvg.append("g").attr("opacity", seqAlpha);
      const drawHorizon = (z, lbl, sub, col) => {
        const yy = yz(z);
        hG.append("line").attr("x1", ML).attr("x2", W - MR).attr("y1", yy).attr("y2", yy)
          .attr("stroke", col).attr("stroke-width", step === 4 ? 0.9 : 0.5).attr("stroke-dasharray", "3 4");
        if (step === 4) {
          IBV.t(hG, xr, yy - 5, `${lbl} · ${sub}`, { size: m ? IBV.FS.min : IBV.FS.small, anchor: "end", weight: 700, fill: col, halo: 3 });
        }
      };
      drawHorizon(200, "Termoclina (200 m)", "mesos", C.ink2);
      drawHorizon(600, "Zona crepuscular (600 m)", "dècades · fins a 250 anys", C.vermell);
      drawHorizon(1000, "Oceà profund (> 1.000 m)", "segles", C.blauFosc);

      // Anotacions IBV.note per pas
      if (step === 0) {
        IBV.note(overSvg, {
          x: ML + plotW * 0.45, y: yz(85),
          tx: ML + plotW * 0.56, ty: yz(250),
          kind: "curve", bend: 14, dot: true,
          lines: [["El fitoplàncton fixa el CO₂", true, C.blau], ["a la zona il·luminada", false, C.ink]]
        });
      } else if (step === 1) {
        IBV.note(overSvg, {
          x: xLeft + 24, y: yz(340),
          tx: xLeft + (m ? 46 : 72), ty: yz(420),
          kind: "curve", bend: 14, dot: true,
          lines: [["Neu marina passiva", true, C.ink], ["S'atenua molt abans dels 400 m", false, C.ink2]]
        });
      } else if (step === 2) {
        IBV.note(overSvg, {
          x: xRight - 22, y: yz(310),
          tx: Math.max(ML + 12, xRight - (m ? 68 : 130)), ty: yz(245),
          kind: "curve", bend: -14, dot: true, anchor: "end",
          lines: [["Drecera activa", true, C.vermell], ["Creua la termoclina cada alba", false, C.ink]]
        });
      } else if (step === 3) {
        IBV.note(overSvg, {
          x: xRight - 14, y: yz(520),
          tx: Math.max(ML + 12, xRight - (m ? 64 : 120)), ty: yz(690),
          kind: "curve", bend: -14, dot: true, anchor: "end",
          lines: [["Alliberament en profunditat", true, C.blauFosc], ["CO₂ respirat i excrements ràpids", false, C.ink2]]
        });
      }
    }

    function setStep(i) {
      step = i;
      const s = CS[i] || CS[0];
      if (s.seg) { ph = RM ? s.rmPh : s.seg[0]; hold = 0; }
      else if (RM) ph = DAY;
      if (RM) {
        for (const k in F) F[k] = s[k] || 0;
        for (const a of MIG_STR) { a.z = migZ(a, ph); a.pz = a.z; a.vz = 0; }
        draw(0);
      }
      drawOverlayNotes();
    }

    function tick(dt) {
      const tg = CS[step] || CS[0];
      if (!RM) {
        for (const k in F) F[k] += ((tg[k] || 0) - F[k]) * Math.min(1, dt * 2.4);
        if (tg.seg) {
          if (hold > 0) { hold -= dt; if (hold <= 0) ph = tg.seg[0]; }
          else { ph += dt * 0.055; if (ph >= tg.seg[1]) { ph = tg.seg[1]; hold = 1.8; } }
        } else {
          ph += (DAY - ph) * Math.min(1, dt * 1.4);
        }

        for (const b of air) {
          b.z += b.v * dt;
          if (b.z > b.end) { b.z = -24; b.x = r(); }
        }
        for (const s of SNOW_STR) {
          s.z += s.v * dt;
          if (s.z > ZM) { s.z = 16 + r() * 40; s.u = r(); }
        }
        for (const a of MIG_STR) {
          const z = migZ(a, ph);
          if (a.z == null) { a.z = z; a.pz = z; }
          a.pz = a.z;
          a.z += (z - a.z) * Math.min(1, dt * 4.5);
          const iv = dt > 0.001 ? (a.z - a.pz) / dt : 0;
          a.vz = a.vz * 0.82 + iv * 0.18;
        }
        for (const p of POOP_STR) {
          p.z += p.v * dt;
          if (p.z > ZM) { p.z = p.z0; p.u = r(); }
        }
        for (const b of co2) {
          b.z += b.v * dt;
          b.a -= dt * 0.16;
          if (b.a <= 0 || b.z < 260) { b.z = 380 + r() * 230; b.u = r(); b.a = 0.85; }
        }
      }
      const n = F.mig > 0.05 ? nightF(ph) : 0;
      const ts = n > 0.5 ? "Nit" : F.mig > 0.05 && ph > 0.42 && ph < 0.56 ? "Alba" : "Dia";
      if (tEl && tEl.textContent !== ts) tEl.textContent = ts;
      if (sEl && sEl.textContent !== tg.sub) sEl.textContent = tg.sub;
    }

    function draw(tt) {
      if (!ctx || !W) return;
      const c = ctx, m = mob() || W < 600, fs = m ? 11 : 12.5;
      const n = F.mig > 0.05 ? nightF(ph) * clamp(F.mig, 0, 1) : 0;
      const plotW = W - ML - MR;
      c.clearRect(0, 0, W, H);

      // Cel clar (paper blanc + bany suau)
      const sg = c.createLinearGradient(0, 0, 0, skyH);
      sg.addColorStop(0, IBV.alpha(n > 0.5 ? C.blauFosc : C.groc, n > 0.5 ? 0.08 : 0.05));
      sg.addColorStop(1, "rgba(252,252,250,0)");
      c.fillStyle = sg;
      c.fillRect(ML, 0, plotW, skyH);
      cTxt(c, [["Aire · CO₂", 1]], ML + 6, skyH - 6, { fs: IBV.FS.min, col: C.ink2, halo: false });

      // Columna d'aigua suau sobre paper blanc
      const wg = c.createLinearGradient(0, y0, 0, H);
      wg.addColorStop(0, IBV.alpha(C.blau, lerp(0.015, 0.09, n)));
      wg.addColorStop(0.5, IBV.alpha(C.blau, lerp(0.07, 0.14, n)));
      wg.addColorStop(1, IBV.alpha(C.blauFosc, lerp(0.16, 0.22, n)));
      c.fillStyle = wg;
      c.fillRect(ML, y0, plotW, H - y0);

      c.strokeStyle = C.blau; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(ML, y0); c.lineTo(W - MR, y0); c.stroke();

      // Eix de fondària (0,5 px)
      for (let z = 0; z <= 1000; z += 200) {
        const y = yz(z);
        c.strokeStyle = C.grid; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(ML, y); c.lineTo(W - MR, y); c.stroke();
        cTxt(c, [z === 0 ? "0 m" : String(z)], ML - 6, y + (z === 0 ? fs * 0.85 : 4), {
          al: "right", fs: IBV.FS.min, col: C.muted, halo: false
        });
      }

      // 1. BANDES VERTICALS D'AQUAREL·LA LINK-03 (multiply)
      const xLeft = ML + plotW * 0.27;
      const xRight = ML + plotW * 0.68;

      c.save();
      c.globalCompositeOperation = "multiply";

      // Banda esquerra: Neu marina passiva (ampla a dalt, s'estreny fortament cap avall)
      if (F.snow > 0.02) {
        const swTop = plotW * 0.18, swBot = plotW * 0.035;
        const gSnow = c.createLinearGradient(0, yz(40), 0, yz(960));
        gSnow.addColorStop(0, IBV.alpha(C.muted, 0.24 * F.snow));
        gSnow.addColorStop(0.45, IBV.alpha(C.muted, 0.12 * F.snow));
        gSnow.addColorStop(1, IBV.alpha(C.muted, 0.03 * F.snow));
        c.fillStyle = gSnow;
        c.beginPath();
        c.moveTo(xLeft - swTop, yz(40));
        c.bezierCurveTo(xLeft - swTop * 0.6, yz(360), xLeft - swBot * 1.4, yz(640), xLeft - swBot, yz(1040));
        c.lineTo(xLeft + swBot, yz(1040));
        c.bezierCurveTo(xLeft + swBot * 1.4, yz(640), xLeft + swTop * 0.6, yz(360), xLeft + swTop, yz(40));
        c.closePath();
        c.fill();
      }

      // Banda dreta: Injecció activa dels migradors (vermell → blau fosc sota la termoclina)
      if (F.mig > 0.02) {
        const mw = plotW * 0.14;
        const gMig = c.createLinearGradient(0, yz(40), 0, yz(1060));
        gMig.addColorStop(0, IBV.alpha(C.vermell, 0.18 * F.mig));
        gMig.addColorStop(0.45, IBV.alpha(C.vermell, 0.22 * F.mig));
        gMig.addColorStop(0.65, IBV.alpha(C.blauFosc, (0.14 + 0.14 * F.rel) * F.mig));
        gMig.addColorStop(1, IBV.alpha(C.blauFosc, (0.06 + 0.14 * F.rel) * F.mig));
        c.fillStyle = gMig;
        c.beginPath();
        c.moveTo(xRight - mw * 0.9, yz(40));
        c.bezierCurveTo(xRight - mw * 1.15, yz(340), xRight - mw * 1.15, yz(580), xRight - mw * 0.65, yz(1060));
        c.lineTo(xRight + mw * 0.65, yz(1060));
        c.bezierCurveTo(xRight + mw * 1.15, yz(580), xRight + mw * 1.15, yz(340), xRight + mw * 0.9, yz(40));
        c.closePath();
        c.fill();
      }
      c.restore();

      // 2. CO₂ de l'aire i fitoplàncton (blau)
      c.lineWidth = 0.9; c.strokeStyle = C.ink2;
      for (const b of air) {
        c.globalAlpha = clamp(F.air, 0, 1) * 0.7;
        c.beginPath(); c.arc(ML + b.x * plotW, yz(b.z), 2.3, 0, 6.283); c.stroke();
      }
      c.globalAlpha = 1;

      const phPts = PH.map(p => [ML + 4 + p.x * (plotW - 8) + Math.sin(tt * 0.16 + p.w) * 3, yz(p.z), m ? 1.3 : 1.6]);
      IBV.cloud(c, phPts, C.blau, { alpha: 0.36 });

      // 3. ~1.000 MICRO-TRAÇOS LENTS (LINK-03 / MAP-19)
      // 3a. Micro-traços de neu marina passiva (banda esquerra, s'esvaeixen amb la profunditat)
      if (F.snow > 0.02) {
        c.save();
        c.lineCap = "round";
        for (let i = 0; i < SNOW_STR.length; i++) {
          const s = SNOW_STR[i];
          const frac = clamp(s.z / 1000, 0, 1);
          const halfW = lerp(plotW * 0.17, plotW * 0.035, Math.pow(frac, 0.72));
          const x = xLeft + (s.u - 0.5) * 2 * halfW + Math.sin(tt * 0.25 + s.w) * 2;
          const y = yz(s.z);
          const fade = Math.pow(1 - frac, 1.35) * F.snow * 0.62;
          if (fade < 0.03) continue;
          c.strokeStyle = IBV.alpha(C.muted, fade);
          c.lineWidth = 1.05;
          c.beginPath(); c.moveTo(x, y - s.len); c.lineTo(x, y); c.stroke();
        }
        c.restore();
      }

      // 3b. Micro-traços dels migradors actius (banda dreta, vermell)
      if (F.mig > 0.02) {
        c.save();
        c.lineCap = "round";
        const mw = plotW * 0.135;
        for (let i = 0; i < MIG_STR.length; i++) {
          const a = MIG_STR[i];
          if (a.z == null) continue;
          const x = xRight + (a.u - 0.5) * 2 * mw + Math.sin(tt * 0.18 + a.w) * 3.5;
          const y = yz(a.z + Math.sin(tt * 0.3 + a.w) * 3);
          const wake = clamp(a.vz * 0.14, -14, 14);
          c.strokeStyle = IBV.alpha(C.vermell, 0.52 * F.mig);
          c.lineWidth = 1.25;
          c.beginPath();
          c.moveTo(x, y - (Math.abs(wake) > 1.5 ? wake : 3.5));
          c.lineTo(x, y);
          c.stroke();
        }
        c.restore();
      }

      // 3c. Micro-traços d'excrements ràpids (blau fosc) i anells de CO₂ respirat (tinta)
      if (F.rel > 0.02) {
        c.save();
        c.lineCap = "round";
        const pw = plotW * 0.11;
        for (let i = 0; i < POOP_STR.length; i++) {
          const p = POOP_STR[i];
          const frac = clamp((p.z - 360) / 740, 0, 1);
          const x = xRight + (p.u - 0.5) * 2 * pw * (1 - 0.35 * frac);
          const y = yz(p.z);
          c.strokeStyle = IBV.alpha(C.blauFosc, (0.68 - 0.25 * frac) * F.rel);
          c.lineWidth = 1.3;
          c.beginPath(); c.moveTo(x, y - p.len); c.lineTo(x, y); c.stroke();
        }
        c.strokeStyle = C.ink; c.lineWidth = 0.85;
        for (let i = 0; i < co2.length; i++) {
          const b = co2[i];
          const x = xRight + (b.u - 0.5) * 2 * pw;
          c.globalAlpha = clamp(b.a, 0, 1) * F.rel * 0.65;
          c.beginPath(); c.arc(x, yz(b.z), 2.3, 0, 6.283); c.stroke();
        }
        c.restore();
      }

      // Títols discrets de les dues vies (a dalt de cada banda)
      if (F.snow > 0.25) cTxt(c, [["Neu marina", 1, C.ink2]], xLeft, yz(62), { al: "middle", fs: IBV.FS.min, a: F.snow });
      if (F.mig > 0.25) cTxt(c, [["Migradors", 1, C.vermell]], xRight, yz(62), { al: "middle", fs: IBV.FS.min, a: F.mig });

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
      H = m ? Math.round(Math.max(205, Math.min(window.innerHeight * 0.29, 245)))
        : Math.min(Math.round(clamp(window.innerHeight - 245, 390, 650)), Math.round(W * 0.92));
      skyH = Math.max(24, Math.round(H * 0.085));
      y0 = skyH; ML = m ? 34 : 42; MR = m ? 6 : 10;

      const built = IBV.canvas(el, W, H, ARIA);
      cvNode = built.c; ctx = built.ctx;
      cvNode.style.cursor = "crosshair";

      d3.select(el).selectAll("svg.ibv-over").remove();
      overSvg = d3.select(el).append("svg").attr("class", "ibv-over ibv-pe-none")
        .attr("width", W).attr("height", H).attr("viewBox", `0 0 ${W} ${H}`)
        .style("font-family", IBV.SANS);
      drawOverlayNotes();

      IBV.hover(cvNode, (_ev, [, y]) => {
        if (y < y0) { hoverZ = null; tp.hide(); return; }
        hoverZ = zy(y);
        const seqTxt = hoverZ < 200 ? "Capa de mescla: el CO₂ torna a l'aire en mesos (< 1 any)" :
          hoverZ < 1000 ? "Zona crepuscular: segrest de dècades fins a ~250 anys (Boyd et al., 2019)" :
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
     6. ESTIMACIONS DE CARBONI
        CASE-04 cercles d'aquarel·la amb bigotis d'incertesa + SCALE-01 llindar 6,5 PgC/any
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
        { c: C.vermell, t: "Estimació publicada (àrea proporcional + incertesa)", kind: "dot", a: 0.55 },
        { c: C.blau, t: "Càlcul nostre (model)", kind: "hollow" },
        { c: C.ink, t: "Llindar total (6,5 PgC/any)", kind: "line", dash: "2 3", w: 1.4 }
      ]);
    }

    const tp = IBV.tip(wrap);

    IBV.mount(wrap, (el, w) => {
      const narrow = w < 600;
      const rowH = narrow ? 78 : 70, ml = narrow ? 8 : 212, mr = narrow ? 10 : 20, mt = 52;
      const h = mt + R.length * rowH + 34;
      const s = IBV.svg(el, w, h, "Estimacions del carboni que transporten cap avall els animals en petagrams de carboni l'any, comparades amb el llindar d'exportació total de 6,5 PgC/any.");
      const defs = s.append("defs");
      const uid = "es" + Math.random().toString(36).slice(2, 6);
      const washRed = addWashGrad(defs, uid + "r", C.vermell, 0.48, 0.22);
      const washBlu = addWashGrad(defs, uid + "b", C.blau, 0.36, 0.14);

      const x = d3.scaleLinear([0, 7], [ml, w - mr]);
      const rVal = d3.scaleSqrt([0, 4], [9, narrow ? 20 : 26]);

      // SCALE-01 Zona de llindar (6,5–7,0 PgC/any) en gris pàl·lid neutre
      s.append("rect").attr("x", x(6.5)).attr("width", x(7) - x(6.5))
        .attr("y", mt - 14).attr("height", h - 26 - (mt - 14))
        .attr("fill", C.neutral).attr("fill-opacity", 0.65);

      // Quadrícula vertical recessiva + zero en tinta
      for (let v = 0; v <= 7; v++) {
        s.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", mt - 8).attr("y2", h - 26)
          .attr("stroke", v === 0 ? C.ink : C.grid).attr("stroke-width", v === 0 ? 1 : 0.65);
      }
      const ax = IBV.axisX(s, x, h - 26, [0, 1, 2, 3, 4, 5, 6, 7], v => (v === 7 ? "7 PgC/any" : String(v)), { tick: false });
      ax.selectAll("text").filter((_, i, n) => i === n.length - 1).attr("text-anchor", "end").attr("x", w - 2);

      // Línia puntejada de llindar SCALE-01 (6,5 PgC/any)
      s.append("line").attr("x1", x(6.5)).attr("x2", x(6.5)).attr("y1", mt - 18).attr("y2", h - 26)
        .attr("stroke", C.ink).attr("stroke-width", 1.35).attr("stroke-dasharray", "1.5 3.5").attr("stroke-linecap", "round");
      IBV.t(s, x(6.5) - 6, mt - 22, narrow ? "Exportació total: 6,5 PgC/any" : "Llindar d'exportació total de l'oceà: 6,5 PgC/any (model del 2019)", {
        size: IBV.FS.small, anchor: "end", fill: C.ink, weight: 600, italic: !narrow
      });

      const rows = s.append("g").selectAll("g.erow").data(R).join("g").attr("class", "erow hit");

      rows.each(function (d, i) {
        const g = d3.select(this);
        const yc = mt + i * rowH + rowH / 2 + (narrow ? 12 : 0);
        const mid = d.c != null ? d.c : (d.lo + d.hi) / 2;
        const xe = x(d.hi != null ? d.hi : d.c);

        // Fil guia ultra-fi (0,55 px)
        g.append("line").attr("x1", x(0)).attr("x2", x(7)).attr("y1", yc).attr("y2", yc)
          .attr("stroke", C.hair).attr("stroke-width", 0.55);

        if (narrow) {
          IBV.t(g, ml, yc - 22, d.n, { size: IBV.FS.label, weight: 600, fill: C.ink });
          IBV.t(g, ml, yc - 8, d.s, { size: IBV.FS.min, fill: C.muted });
        } else {
          IBV.t(g, ml - 16, yc - 2, d.n, { size: IBV.FS.label, weight: 600, anchor: "end", fill: C.ink });
          IBV.t(g, ml - 16, yc + 14, d.s, { size: IBV.FS.small, anchor: "end", fill: C.muted });
        }

        // Bigotis fins d'incertesa + bany suau translúcid
        if (d.lo != null) {
          const xMid = x((d.lo + d.hi) / 2);
          g.append("line").attr("class", "ewhisk")
            .attr("x1", xMid).attr("x2", xMid).attr("y1", yc).attr("y2", yc)
            .attr("stroke", C.vermell).attr("stroke-width", 1.25)
            .attr("data-x1", x(d.lo)).attr("data-x2", x(d.hi));
          g.append("rect").attr("class", "eband")
            .attr("x", xMid).attr("y", yc - 4.5).attr("height", 9).attr("rx", 4.5).attr("width", 0)
            .attr("fill", C.vermell).attr("fill-opacity", 0.14)
            .style("mix-blend-mode", "multiply")
            .attr("data-x", x(d.lo)).attr("data-w", x(d.hi) - x(d.lo));
          [d.lo, d.hi].forEach(val => {
            g.append("line").attr("class", "ecap")
              .attr("x1", x(val)).attr("x2", x(val)).attr("y1", yc).attr("y2", yc)
              .attr("stroke", C.vermell).attr("stroke-width", 1.2)
              .attr("data-y1", yc - 5).attr("data-y2", yc + 5);
          });
        }

        // Cercle d'aquarel·la multiply proporcional al valor central/punt mitjà (CASE-04)
        const rad = rVal(mid);
        g.append("circle").attr("class", "ewash")
          .attr("cx", x(mid)).attr("cy", yc).attr("r", 0).attr("data-r", rad)
          .attr("fill", d.calc ? washBlu : washRed)
          .style("mix-blend-mode", "multiply");
        g.append("circle").attr("class", "erim")
          .attr("cx", x(mid)).attr("cy", yc).attr("r", 0).attr("data-r", rad)
          .attr("fill", "none")
          .attr("stroke", d.calc ? C.blau : IBV.alpha(C.vermell, 0.45))
          .attr("stroke-width", d.calc ? 1.2 : 0.85)
          .attr("stroke-dasharray", d.calc ? "3 2.5" : null);

        if (d.c != null) {
          g.append("circle").attr("class", "ecore").attr("cx", x(d.c)).attr("cy", yc).attr("r", 0)
            .attr("fill", d.calc ? C.paper : C.vermell)
            .attr("stroke", d.calc ? C.blau : C.paper).attr("stroke-width", d.calc ? 2 : 1.3);
        }

        const valStr = d.calc ? `≈ ${fmt1(d.c)}` : d.c != null ? `${fmt1(d.c)} (${fmt1(d.lo)}–${fmt1(d.hi)})` : `${fmt1(d.lo)}–${fmt1(d.hi)}`;
        IBV.t(g, xe + (d.hi != null ? 10 : rad + 8), yc + 4, valStr, { size: IBV.FS.small, fill: C.ink, weight: 600, halo: 3 });
      });

      // Anotació corba comparant els migradors amb el llindar de 6,5 PgC/any (desktop)
      if (!narrow) {
        const yLast = mt + 2 * rowH + rowH / 2;
        IBV.note(s, {
          x: x(6.5) - 3, y: yLast - 14,
          tx: x(5.15), ty: yLast - 46,
          kind: "curve", bend: -12, anchor: "end",
          lines: [["Fins a més de la meitat", true, C.ink], ["del total de 6,5 PgC/any", false, C.ink2]]
        });
      }

      IBV.onView(el, instant => {
        const dur = instant ? 0 : IBV.DUR;
        rows.selectAll("line.ewhisk").transition().duration(dur).delay((_, i) => instant ? 0 : i * 110).ease(IBV.EASE)
          .attr("x1", function () { return +this.getAttribute("data-x1"); })
          .attr("x2", function () { return +this.getAttribute("data-x2"); });
        rows.selectAll("rect.eband").transition().duration(dur).delay((_, i) => instant ? 0 : i * 110).ease(IBV.EASE)
          .attr("x", function () { return +this.getAttribute("data-x"); })
          .attr("width", function () { return +this.getAttribute("data-w"); });
        rows.selectAll("line.ecap").transition().duration(dur * 0.5).delay(instant ? 0 : 420)
          .attr("y1", function () { return +this.getAttribute("data-y1"); })
          .attr("y2", function () { return +this.getAttribute("data-y2"); });
        rows.selectAll("circle.ewash").transition().duration(dur * 0.8).delay((_, i) => instant ? 0 : 180 + i * 110).ease(IBV.EASE)
          .attr("r", function () { return +this.getAttribute("data-r"); });
        rows.selectAll("circle.erim").transition().duration(dur * 0.8).delay((_, i) => instant ? 0 : 180 + i * 110).ease(IBV.EASE)
          .attr("r", function () { return +this.getAttribute("data-r"); });
        rows.selectAll("circle.ecore").transition().duration(dur * 0.6).delay(instant ? 0 : 320).attr("r", 4.2);
      });

      IBV.hover(s.node(), (_ev, [, my]) => {
        if (my < mt - 6 || my > h - 24) { IBV.focus(rows, null); tp.hide(); return; }
        const idx = clamp(Math.floor((my - mt) / rowH), 0, R.length - 1);
        const d = R[idx];
        IBV.focus(rows, dd => dd === d);
        rows.selectAll("circle.erim").attr("stroke", dd => dd === d ? C.ink : (dd.calc ? C.blau : IBV.alpha(C.vermell, 0.45)))
          .attr("stroke-width", dd => dd === d ? 1.6 : (dd.calc ? 1.2 : 0.85));
        rows.filter(dd => dd === d).raise();
        tp.show(`<b>${d.n}</b> (${d.s})<br>${d.t}`);
      }, () => {
        IBV.focus(rows, null);
        rows.selectAll("circle.erim").attr("stroke", dd => dd.calc ? C.blau : IBV.alpha(C.vermell, 0.45))
          .attr("stroke-width", dd => dd.calc ? 1.2 : 0.85);
        tp.hide();
      });
    });
  })();

  /* Temps de lectura */
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
