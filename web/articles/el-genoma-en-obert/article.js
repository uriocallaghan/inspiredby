/* «El genoma que es va publicar en una nit» · gràfics
   Peces del sistema infogràfic (research/sistema-infografic.md i web/sistema/):
   V1 TIME-14 (carrils d'estat, adaptada a hores) · V2 LINK-03 (flux amb partícules)
   V3 peça nova «arbre que creix» (vegeu pla-visual.md) · V4 TIME-04 (corrent apilat)
   V5 MAP-03 (cercles translúcids, mapa del món sense relleu) · V6 TIME-13 (cronologia amb icones)
   V7 TIME-01 + SPREAD-01 (sèrie anotada amb franja) · V8 CASE-02 (halteres)
   Colors: blau = dades compartides · vermell = el que les dades fan possible · groc = decisió humana. */
(function () {
  const V = window.IBV, C = V.C, D = window.GEN_DATA;
  if (!V || !D) return;
  const BLEND = (window.IBTheme && window.IBTheme.dark) ? "screen" : "multiply";
  const f0 = V.fmt(",.0f"), f1 = V.fmt(",.1f");
  const EIO = d3.easeCubicInOut;
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const textW = (t, s, w) => (String(t).length * s * (w >= 600 ? .56 : .52));
  // talla un text en línies que càpiguen en maxPx (aproximat, com a la resta del sistema)
  function wrap(txt, maxPx, size, weight) {
    const out = []; let cur = "";
    String(txt).split(/\s+/).forEach(word => {
      const test = cur ? cur + " " + word : word;
      if (cur && textW(test, size, weight || 400) > maxPx) { out.push(cur); cur = word; } else cur = test;
    });
    if (cur) out.push(cur);
    return out;
  }
  const REG = D.tree.reg;
  const REGCA = { "Asia": "Àsia", "Europe": "Europa", "North America": "Amèrica del Nord", "South America": "Amèrica del Sud", "Africa": "Àfrica", "Oceania": "Oceania" };
  // sis continents: els tres colors de la revista i els seus tons (mai verd: no és natura)
  const RCOL = [C.blue, C.red, C.yellowDark, C.blueLight, C.redLight, C.ink2];
  const MESOS = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];
  const decDate = v => { const y = Math.floor(v), d0 = Date.UTC(y, 0, 1), d1 = Date.UTC(y + 1, 0, 1); return new Date(d0 + (v - y) * (d1 - d0)); };
  const diaMes = dt => `${dt.getUTCDate()} de ${MESOS[dt.getUTCMonth()]} del ${dt.getUTCFullYear()}`;

  /* =====================================================================
     V1 · #s-dies · TIME-14 adaptada: carrils d'estat amb hores
     ===================================================================== */
  (function () {
    const host = $("#dies-viz"); if (!host) return;
    const T = s => Date.parse(s);
    const LANES = [
      { k: "lab", t: "El laboratori de Xangai" },
      { k: "db", t: "Les bases de dades" },
      { k: "world", t: "La resta del món" }
    ];
    // hour:true → hora documentada; hour:false → només se'n coneix el dia (es dibuixa al migdia, cercle buit)
    const EV = [
      { l: 0, t: T("2020-01-03T02:00Z"), hour: false, s: 0, lab: "Arriba la mostra", d: "El laboratori rep una mostra d'una persona ingressada a Wuhan; aquell dia la Xina ha notificat a l'OMS 44 persones amb pneumònia de causa desconeguda." },
      { l: 0, t: T("2020-01-04T18:00Z"), hour: true, s: 1, lab: "S'assembla al SARS", d: "Les 2.00 del 5 de gener a Xangai: Chen Yan-Mei avisa Zhang Yong-Zhen que el virus està emparentat amb el del SARS." },
      { l: 1, t: T("2020-01-05T12:00Z"), hour: false, s: 1, lab: "La seqüència puja a GenBank", d: "El registre MN908947 s'envia des de Xangai. Dipositat no vol dir públic." },
      { l: 0, t: T("2020-01-07T12:00Z"), hour: false, s: 2, lab: "Article enviat a Nature", d: "Nature rep l'article que descriu el genoma el 7 de gener." },
      { l: 2, t: T("2020-01-09T12:00Z"), hour: false, s: 2, lab: "L'OMS: és un coronavirus nou", d: "L'OMS informa que les autoritats xineses han determinat que el brot el causa un coronavirus nou." },
      { l: 1, t: T("2020-01-11T01:05Z"), hour: true, s: 3, key: true, lab: "01.05 UTC: el text, al fòrum", d: "Holmes penja la seqüència a virological.org i convida qualsevol a descarregar-la i analitzar-la." },
      { l: 2, t: T("2020-01-11T12:00Z"), hour: false, s: 5, lab: "L'OMS ha rebut les seqüències", d: "L'OMS diu que ha rebut les seqüències i que espera que es facin públiques aviat." },
      { l: 1, t: T("2020-01-12T12:00Z"), hour: false, s: 5, lab: "Cinc genomes més, i GenBank obre", d: "Andrew Rambaut avisa al fòrum que s'han dipositat cinc genomes més a GISAID; GenBank allibera el registre MN908947." },
      { l: 2, t: T("2020-01-13T12:00Z"), hour: false, s: 6, lab: "Tailàndia confirma un cas; primera PCR", d: "Tailàndia notifica el primer cas confirmat fora de la Xina i l'OMS publica el primer protocol de PCR, el que li ha fet arribar l'equip de Berlín." },
      { l: 1, t: T("2020-01-14T00:36Z"), hour: true, s: 6, lab: "Primera anàlisi a Nextstrain", d: "L'equip de Nextstrain penja una primera anàlisi filogenètica, amb sis genomes i el codi obert." }
    ];
    const BARS = [
      { l: 0, a: T("2020-01-03T02:00Z"), b: T("2020-01-04T18:00Z"), s: 1, t: "40 hores de feina", c: C.yellow },
      { l: 1, a: T("2020-01-05T12:00Z"), b: T("2020-01-11T01:05Z"), s: 2, t: "dipositat, però no visible", c: C.ghost }
    ];
    const T0 = T("2020-01-03T00:00Z"), T1 = T("2020-01-14T18:00Z");
    const CLOCKS = [["Xangai", 8], ["Sydney", 11], ["Nova York", -5]];
    let step = 0, api = null;

    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 700, h = mob ? Math.min(380, Math.round(window.innerHeight * .48)) : 520;
      const m = { t: mob ? 42 : 34, r: mob ? 10 : 16, b: 44, l: mob ? 10 : 150 };
      const CLKH = mob ? 92 : 118;   // banda de baix reservada als tres rellotges
      const s = V.svg(el, w, h, "Cronologia del 3 al 14 de gener del 2020 en hora universal, en tres carrils: el laboratori de Xangai, les bases de dades i la resta del món. El punt clau és l'11 de gener a les 01.05 UTC, quan la seqüència es fa pública.");
      const x = d3.scaleTime([T0, T1], [m.l, w - m.r]);
      const laneY = i => m.t + (h - m.t - m.b - CLKH) * (i + .5) / 3;
      const g = s.append("g");
      // carrils
      LANES.forEach((L, i) => {
        const y = laneY(i);
        g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y).attr("y2", y)
          .attr("stroke", C.grid).attr("stroke-width", 1);
        if (mob) wrap(L.t, w - m.l - m.r, 11, 600).forEach((ln, k) => V.t(g, m.l, y - 26 + k * 13, ln, { size: 11, fill: C.muted, weight: 600, halo: 3 }));
        else wrap(L.t, m.l - 22, 12.5, 600).forEach((ln, k) => V.t(g, m.l - 14, y + 4 - (wrap(L.t, m.l - 22, 12.5, 600).length - 1) * 7 + k * 14, ln, { anchor: "end", size: 12.5, fill: C.muted, weight: 600 }));
      });
      // eix de dies
      const days = d3.timeDay.every(1).range(new Date(T0), new Date(T1));
      days.forEach(dt => {
        const px = x(dt);
        g.append("line").attr("x1", px).attr("x2", px).attr("y1", m.t - 10).attr("y2", h - m.b + 4)
          .attr("stroke", C.grid).attr("stroke-width", .6).attr("stroke-dasharray", "2 3");
        const n = dt.getUTCDate();
        if (!mob || n % 2 === 1) V.t(g, px, h - m.b + 20, n, { anchor: "middle", size: mob ? 11 : 12, fill: C.muted });
      });
      V.t(g, m.l, h - m.b + 38, "gener del 2020 · hora universal (UTC)", { size: mob ? 11 : 12, fill: C.muted });

      const bg = g.append("g"), eg = g.append("g"), cg = g.append("g"), lg = g.append("g");
      // barres de durada
      const bars = bg.selectAll("g").data(BARS).join("g").attr("opacity", 0);
      bars.append("rect").attr("x", d => x(d.a)).attr("y", d => laneY(d.l) - 5).attr("width", d => Math.max(2, x(d.b) - x(d.a)))
        .attr("height", 10).attr("rx", 5).attr("fill", d => V.alpha(d.c, .55)).style("mix-blend-mode", BLEND);
      bars.each(function (d) {
        const cx = (x(d.a) + x(d.b)) / 2, tw = textW(d.t, mob ? 11 : 12, 400);
        // al mòbil, l'etiqueta de la barra va damunt la línia: a sota hi van les dels esdeveniments
        V.t(d3.select(this), clamp(cx, m.l + tw / 2, w - m.r - tw / 2), laneY(d.l) + (mob ? -10 : 24), d.t,
          { anchor: "middle", size: mob ? 11 : 12, fill: C.ink2, halo: 3 });
      });
      // esdeveniments
      const ev = eg.selectAll("g").data(EV).join("g").attr("opacity", 0).style("cursor", "pointer");
      ev.append("circle").attr("cx", d => x(d.t)).attr("cy", d => laneY(d.l)).attr("r", d => d.key ? 7 : 5)
        .attr("fill", d => d.key ? C.red : (d.hour ? C.blue : "#fff"))
        .attr("stroke", d => d.key ? C.red : C.blue).attr("stroke-width", 1.4);
      ev.append("circle").attr("cx", d => x(d.t)).attr("cy", d => laneY(d.l)).attr("r", 16).attr("fill", "transparent");
      // etiquetes: a l'ordinador van a la primera ranura lliure del seu carril; al mòbil només es veu la del pas actual
      const occupat = {};
      ev.each(function (d, i) {
        const lg2 = d3.select(this).append("g").attr("class", "lbl");
        if (mob) {
          const lns = wrap(d.lab, w - m.l - m.r - 24, 11, d.key ? 700 : 400).slice(0, 2);
          const anc = x(d.t) > (m.l + w - m.r) / 2 ? "end" : "start";
          lns.forEach((ln, k) => V.t(lg2, x(d.t) + (anc === "end" ? -10 : 10), laneY(d.l) + 17 + k * 13, ln,
            { anchor: anc, size: 11, weight: d.key ? 700 : 400, fill: d.key ? C.red : C.ink, halo: 3 }));
        } else {
          const tw = textW(d.lab, 12.5, d.key ? 700 : 400);
          const anc = x(d.t) + tw > w - m.r ? "end" : "start";
          const a = anc === "end" ? x(d.t) - tw - 10 : x(d.t) + 8, b = a + tw + 10;
          // ranura lliure: amunt, avall, i un segon nivell a cada banda
          const slots = [-19, 21, -37, 39];
          let k = 0;
          while (k < slots.length - 1 && (occupat[d.l + "|" + slots[k]] || -1e9) > a) k++;
          occupat[d.l + "|" + slots[k]] = b;
          V.t(lg2, anc === "end" ? x(d.t) - 9 : x(d.t) + 9, laneY(d.l) + slots[k] + (slots[k] < 0 ? 0 : 4), d.lab,
            { anchor: anc, size: 12.5, weight: d.key ? 700 : 400, fill: d.key ? C.red : C.ink, halo: 3 });
        }
      });
      // tres rellotges al moment de la publicació
      const kx = x(T("2020-01-11T01:05Z")), ky = laneY(1);
      const R0 = mob ? 16 : 21, GAP = mob ? 86 : 118;
      const clkY = h - m.b - CLKH / 2 - (mob ? 6 : 8);
      const clkX0 = clamp(kx, m.l + GAP + R0, w - m.r - GAP - R0);
      const clocks = cg.attr("opacity", 0).selectAll("g").data(CLOCKS).join("g")
        .attr("transform", (d, i) => `translate(${clkX0 + (i - 1) * GAP},${clkY})`);
      clocks.each(function (d) {
        const gg = d3.select(this), R = R0;
        const hUTC = 1 + 5 / 60 + d[1], hh = ((hUTC % 24) + 24) % 24, day = hUTC < 0 ? 10 : 11;
        gg.append("circle").attr("r", R).attr("fill", "#fff").attr("stroke", C.hair).attr("stroke-width", 1);
        for (let k = 0; k < 12; k++) {
          const a = k * Math.PI / 6;
          gg.append("line").attr("x1", Math.sin(a) * (R - 3)).attr("y1", -Math.cos(a) * (R - 3))
            .attr("x2", Math.sin(a) * (R - 1)).attr("y2", -Math.cos(a) * (R - 1)).attr("stroke", C.ghost).attr("stroke-width", .8);
        }
        const ah = (hh % 12) * Math.PI / 6 + (5 / 60) * Math.PI / 6, am = (5 / 60) * 2 * Math.PI;
        gg.append("line").attr("x1", 0).attr("y1", 0).attr("x2", Math.sin(ah) * R * .5).attr("y2", -Math.cos(ah) * R * .5)
          .attr("stroke", C.ink).attr("stroke-width", 2).attr("stroke-linecap", "round");
        gg.append("line").attr("x1", 0).attr("y1", 0).attr("x2", Math.sin(am) * R * .78).attr("y2", -Math.cos(am) * R * .78)
          .attr("stroke", C.red).attr("stroke-width", 1.4).attr("stroke-linecap", "round");
        V.t(gg, 0, R + (mob ? 13 : 15), d[0], { anchor: "middle", size: mob ? 11 : 12, weight: 600 });
        const hs = String(Math.floor(hh)).padStart(2, "0") + ".05";
        V.t(gg, 0, R + (mob ? 25 : 29), `${hs} del dia ${day}`, { anchor: "middle", size: mob ? 11 : 11.5, fill: C.muted });
      });
      cg.insert("path", ":first-child").attr("d", `M${kx},${ky + 9}V${clkY - R0 - 26}H${clkX0}`)
        .attr("fill", "none").attr("stroke", C.red).attr("stroke-width", .9).attr("stroke-dasharray", "2 3");

      const tp = V.tip(el);
      V.hover(s.node(), (e, [px, py]) => {
        const near = d3.least(EV.filter(d => d.s <= step), d => Math.hypot(x(d.t) - px, laneY(d.l) - py));
        if (!near || Math.hypot(x(near.t) - px, laneY(near.l) - py) > 40) { tp.hide(); V.focus(ev, null); return; }
        V.focus(ev, d => d === near, { dim: .35 });
        const dt = new Date(near.t);
        const when = near.hour
          ? `${dt.getUTCDate()} de gener, ${String(dt.getUTCHours()).padStart(2, "0")}.${String(dt.getUTCMinutes()).padStart(2, "0")} UTC`
          : `${dt.getUTCDate()} de gener`;
        tp.show(`<b>${when}</b> · ${near.d}`);
      }, () => { tp.hide(); V.focus(ev, null); });

      function show(k, anim) {
        step = k;
        const dur = anim && !V.reduced ? 520 : 0;
        ev.transition().duration(dur).attr("opacity", d => d.s <= k ? 1 : 0);
        ev.selectAll("g.lbl").transition().duration(dur).attr("opacity", function (d) {
          const e = d3.select(this.parentNode).datum();
          return mob ? (e.s === k ? 1 : 0) : (e.s <= k ? 1 : 0);
        });
        bars.transition().duration(dur).attr("opacity", d => d.s <= k ? 1 : 0);
        cg.transition().duration(dur).attr("opacity", k === 4 ? 1 : 0);
      }
      api = show; show(step, false);
      V.onView(el, () => { show(step, true); });
      V.legendCat($("#dies-lg"), [
        { c: C.blue, t: "hora documentada" }, { c: C.blue, t: "només se'n sap el dia", kind: "hollow" },
        { c: C.red, t: "el moment de la publicació" }
      ]);
    });
    const sec = $("#s-dies");
    if (sec && window.IB && IB.scrolly) IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), i => { if (api) api(i, true); });
  })();

  /* =====================================================================
     V2 · #s-llavor · LINK-03: flux amb partícules (esquema amb dates reals)
     ===================================================================== */
  (function () {
    const host = $("#llavor-viz"); if (!host) return;
    const OUT = [
      { t: "Detectar", s: "Una PCR sense tenir el virus", d: "23 de gener del 2020", c: C.red, step: 1 },
      { t: "Vacunar", s: "Antigen dissenyat en un dia", d: "16 de març del 2020: primera dosi", c: C.red, step: 2 },
      { t: "Classificar", s: "Un nom i un lloc a l'arbre", d: "Febrer del 2020: SARS-CoV-2", c: C.blue, step: 3 },
      { t: "Seguir", s: "Variants i camins d'entrada", d: "Desembre del 2020: la variant Alfa", c: C.blue, step: 4 }
    ];
    let step = 0, api = null;
    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 700, h = mob ? Math.min(360, Math.round(window.innerHeight * .46)) : 460;
      const s = V.svg(el, w, h, "Esquema: d'un fitxer amb el genoma del virus, de 30.473 lletres, surten quatre camins amb la seva data: detectar, vacunar, classificar i seguir.");
      const m = { t: 20, r: mob ? 8 : 16, b: 20, l: mob ? 8 : 16 };
      const x0 = m.l + (mob ? 44 : 96), x1 = w - m.r - (mob ? 8 : 24);
      const cy = (m.t + h - m.b) / 2;
      const ys = OUT.map((d, i) => m.t + 16 + (h - m.t - m.b - 32) * (i + .5) / OUT.length);
      const paths = OUT.map((d, i) => `M${x0},${cy}C${(x0 + x1) / 2},${cy} ${(x0 + x1) / 2},${ys[i]} ${x1 - (mob ? 170 : 232)},${ys[i]}`);
      const fg = s.append("g"), ng = s.append("g");
      // fils
      const strokes = fg.selectAll("path").data(OUT).join("path").attr("d", (d, i) => paths[i])
        .attr("fill", "none").attr("stroke", d => V.alpha(d.c, .3)).attr("stroke-width", mob ? 7 : 11)
        .attr("stroke-linecap", "round").style("mix-blend-mode", BLEND);
      // node d'origen
      const og = ng.append("g");
      og.append("rect").attr("x", m.l).attr("y", cy - (mob ? 24 : 30)).attr("width", mob ? 42 : 92).attr("height", mob ? 48 : 60)
        .attr("rx", 5).attr("fill", V.alpha(C.yellow, .3)).attr("stroke", C.yellowDark).attr("stroke-width", 1);
      V.t(og, m.l + (mob ? 21 : 46), cy - (mob ? 4 : 6), "30.473", { anchor: "middle", size: mob ? 12 : 15, weight: 700 });
      V.t(og, m.l + (mob ? 21 : 46), cy + (mob ? 11 : 12), "lletres", { anchor: "middle", size: mob ? 11 : 12.5, fill: C.ink2 });
      if (!mob) V.t(og, m.l + 46, cy + 30, "el genoma", { anchor: "middle", size: 12, fill: C.muted });
      // nodes d'arribada
      const outs = ng.selectAll("g.o").data(OUT).join("g").attr("class", "o")
        .attr("transform", (d, i) => `translate(${x1 - (mob ? 170 : 232)},${ys[i]})`);
      outs.append("circle").attr("r", mob ? 5 : 6).attr("fill", d => d.c);
      const LW2 = w - (x1 - (mob ? 170 : 232)) - (mob ? 16 : 20);
      outs.each(function (d) {
        const gg = d3.select(this);
        V.t(gg, mob ? 11 : 14, mob ? -4 : -3, d.t, { size: mob ? 12 : 14, weight: 700, halo: 3 });
        let yy = mob ? 9 : 12;
        wrap(d.s, LW2, mob ? 11 : 12.5).forEach(ln => { V.t(gg, mob ? 11 : 14, yy, ln, { size: mob ? 11 : 12.5, fill: C.ink2, halo: 3 }); yy += 13; });
        wrap(d.d, LW2, mob ? 11 : 12).forEach(ln => { V.t(gg, mob ? 11 : 14, yy + 2, ln, { size: mob ? 11 : 12, fill: C.muted, halo: 3 }); yy += 13; });
      });
      // partícules
      const cv = V.canvas(el, w, h, "");
      Object.assign(cv.c.style, { position: "absolute", left: "0px", top: "0px", pointerEvents: "none" });
      el.style.position = "relative";
      el.insertBefore(cv.c, el.firstChild);
      const nodes = paths.map(p => { const n = document.createElementNS("http://www.w3.org/2000/svg", "path"); n.setAttribute("d", p); return n; });
      const lens = nodes.map(n => n.getTotalLength());
      const parts = [];
      OUT.forEach((d, i) => { for (let k = 0; k < (mob ? 7 : 11); k++) parts.push({ i, u: Math.random(), v: .00035 + Math.random() * .0004 }); });
      const loop = V.loop(el, (t, dt) => {
        const ctx = cv.ctx; ctx.clearRect(0, 0, w, h);
        parts.forEach(p => {
          p.u += p.v * dt; if (p.u > 1) p.u -= 1;
          const on = OUT[p.i].step <= step || step === 0;
          const pt = nodes[p.i].getPointAtLength(p.u * lens[p.i]);
          ctx.globalAlpha = on ? .85 : .18;
          ctx.fillStyle = OUT[p.i].c;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, mob ? 1.7 : 2.1, 0, 7); ctx.fill();
        });
        ctx.globalAlpha = 1;
      });
      host._stop = () => loop.stop();
      function show(k) {
        step = k;
        strokes.transition().duration(V.reduced ? 0 : 420)
          .attr("stroke", d => V.alpha(d.c, k === 0 || d.step === k ? .42 : .14))
          .attr("stroke-width", d => (d.step === k ? (mob ? 10 : 15) : (mob ? 7 : 11)));
        outs.transition().duration(V.reduced ? 0 : 420).style("opacity", d => k === 0 || d.step === k ? 1 : .46);
      }
      api = show; show(0);
      V.legendCat($("#llavor-lg"), [{ c: C.yellow, t: "el fitxer" }, { c: C.red, t: "actuar (provar, vacunar)" }, { c: C.blue, t: "entendre (classificar, seguir)" }]);
    });
    const sec = $("#s-llavor");
    if (sec && window.IB && IB.scrolly) IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), i => { if (api) api(i); });
  })();

  /* =====================================================================
     V3 · #f-arbre · peça nova: arbre filogenètic que creix amb el temps
     ===================================================================== */
  (function () {
    const host = $("#arbre-viz"); if (!host) return;
    const N = D.tree.n, CLA = D.tree.cla, COU = D.tree.cou;
    const t0 = 2019.9, t1 = d3.max(N, d => d[1]);
    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 700, h = mob ? 360 : 520;
      const m = { t: 14, r: mob ? 10 : 18, b: 34, l: mob ? 10 : 14 };
      const wrap = document.createElement("div"); wrap.className = "stage"; wrap.style.position = "relative"; el.appendChild(wrap);
      const { ctx } = V.canvas(wrap, w, h, "Arbre filogenètic de 3.078 genomes de SARS-CoV-2 publicats a les bases obertes, del desembre del 2019 al novembre del 2026. Cada branca és un camí de còpies del virus; el color diu de quin continent és la mostra.");
      const sv = V.svg(wrap, w, 26, ""); sv.style("position", "absolute").style("left", "0px").style("top", (h - 26) + "px").style("pointer-events", "none");
      const x = d3.scaleLinear([t0, t1], [m.l, w - m.r]);
      const y = d3.scaleLinear([0, 1], [m.t, h - m.b]);
      let cut = t0;
      function axis() {
        sv.selectAll("*").remove();
        const g = sv.append("g");
        d3.range(2020, Math.floor(t1) + 1).forEach(yr => {
          const px = x(yr); if (px < m.l - 1 || px > w - m.r + 1) return;
          g.append("line").attr("x1", px).attr("x2", px).attr("y1", 0).attr("y2", 4).attr("stroke", C.ghost).attr("stroke-width", .8);
          V.t(g, px, 17, yr, { anchor: "middle", size: mob ? 11 : 12, fill: C.muted });
        });
      }
      axis();
      const leafPos = [];
      function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = .7; ctx.lineCap = "round";
        leafPos.length = 0;
        for (let i = 1; i < N.length; i++) {
          const n = N[i], p = N[n[0]];
          if (n[1] > cut) continue;
          const col = n[3] >= 0 ? RCOL[n[3]] : C.ghost;
          const px = x(p[1]), nx = x(n[1]), py = y(p[2]), ny = y(n[2]);
          ctx.strokeStyle = V.alpha(col, n[4] ? .72 : .4);
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, ny); ctx.lineTo(nx, ny); ctx.stroke();
          if (n[4]) {
            ctx.fillStyle = V.alpha(col, .8);
            ctx.beginPath(); ctx.arc(nx, ny, 1.5, 0, 7); ctx.fill();
            leafPos.push([nx, ny, i]);
          }
        }
        // vora dreta: la data on som
        if (cut < t1 - .01) {
          ctx.strokeStyle = V.alpha(C.ink, .25); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x(cut), m.t); ctx.lineTo(x(cut), h - m.b); ctx.stroke();
        }
      }
      draw();
      // controls
      const row = document.createElement("div"); row.className = "ctlrow"; el.appendChild(row);
      const btn = document.createElement("button"); btn.className = "playb"; btn.type = "button"; btn.textContent = "Reprodueix";
      const wrapR = document.createElement("div"); wrapR.className = "rng-wrap";
      const lbl = document.createElement("label"); lbl.htmlFor = "arbre-rng"; lbl.textContent = "Data";
      const rng = document.createElement("input"); rng.type = "range"; rng.className = "rng"; rng.id = "arbre-rng";
      rng.min = 0; rng.max = 1000; rng.step = 1; rng.value = 1000;
      const out = document.createElement("span"); out.className = "out";
      wrapR.append(lbl, rng); row.append(btn, wrapR, out);
      const nLeaves = D.tree.n.filter(d => d[4]).length;
      function setCut(v, fromRange) {
        cut = v;
        if (!fromRange) rng.value = Math.round((v - t0) / (t1 - t0) * 1000);
        const shown = N.filter(d => d[4] && d[1] <= cut).length;
        out.innerHTML = `<b>${diaMes(decDate(cut))}</b> · ${f0(shown)} de ${f0(nLeaves)} genomes`;
        draw();
      }
      rng.addEventListener("input", () => { stop(); setCut(t0 + (t1 - t0) * (+rng.value / 1000), true); });
      let raf = 0, playing = false;
      function stop() { playing = false; btn.textContent = "Reprodueix"; if (raf) cancelAnimationFrame(raf), raf = 0; }
      function play() {
        if (playing) { stop(); return; }
        playing = true; btn.textContent = "Atura";
        let v = cut >= t1 - .01 ? t0 : cut, last = 0;
        const tick = now => {
          if (!playing) return;
          const dt = last ? Math.min(60, now - last) : 16; last = now;
          v += (t1 - t0) * dt / 9000;
          if (v >= t1) { v = t1; setCut(v); stop(); return; }
          setCut(v); raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
      btn.addEventListener("click", play);
      setCut(t1);
      V.onView(el, instant => { if (instant || V.reduced) { setCut(t1); return; } setCut(t0); play(); });
      // hover
      const tp = V.tip(el);
      V.hover(wrap, (e, [px, py]) => {
        let best = null, bd = 1e9;
        for (let k = 0; k < leafPos.length; k++) {
          const d = (leafPos[k][0] - px) ** 2 + (leafPos[k][1] - py) ** 2;
          if (d < bd) { bd = d; best = leafPos[k]; }
        }
        if (!best || bd > 900) { tp.hide(); return; }
        const n = N[best[2]], nom = n[6] || "(sense nom)", pais = COU[n[7]] || "";
        tp.show(`<b>${nom}</b> · ${pais ? pais + " · " : ""}${diaMes(decDate(n[1]))}<br>Clade ${CLA[n[5]]} · ${REGCA[REG[n[3]]] || ""}`);
      }, () => tp.hide());
      V.legendCat($("#arbre-lg"), REG.map((r, i) => ({ c: RCOL[i], t: REGCA[r] || r, kind: "line" })));
    });
  })();

  /* =====================================================================
     V4 · #f-corba · TIME-04: corrent apilat de genomes per setmana
     ===================================================================== */
  (function () {
    const host = $("#corba-viz"); if (!host) return;
    const W = D.ser.weeks, VAL = D.ser.v;
    const rows = W.map((wk, i) => { const o = { t: Date.parse(wk + "T00:00Z") }; REG.forEach((r, j) => o[r] = VAL[i][j]); return o; });
    const tot = rows.map(r => d3.sum(REG, k => r[k]));
    let mode = 0;
    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 700, h = mob ? 300 : 420, m = { t: 18, r: mob ? 8 : 14, b: 30, l: mob ? 8 : 14 };
      const seg = document.createElement("div"); seg.className = "seg"; el.appendChild(seg);
      const s = V.svg(el, w, h, "Genomes de SARS-CoV-2 publicats cada setmana a les bases obertes, del 2020 al 2026, apilats per continent. El pic de mitjan 2023 és un dipòsit tardà de mostres europees antigues, i la corba cau després.");
      const x = d3.scaleTime([rows[0].t, rows[rows.length - 1].t], [m.l, w - m.r]);
      const keys = REG.slice();
      const stackFor = md => d3.stack().keys(keys).order(d3.stackOrderNone)
        .offset(md === 1 ? d3.stackOffsetExpand : d3.stackOffsetNone)(rows);
      const yFor = (md, st) => md === 1 ? d3.scaleLinear([0, 1], [h - m.b, m.t])
        : d3.scaleLinear([0, d3.max(st, a => d3.max(a, p => p[1]))], [h - m.b, m.t]).nice();
      const area = y => d3.area().x((p, i) => x(rows[i].t)).y0(p => y(p[0])).y1(p => y(p[1])).curve(d3.curveLinear);
      const axG = s.append("g"), pg = s.append("g"), hg = s.append("g"), ng = s.append("g");
      let st = stackFor(mode), y = yFor(mode, st);
      const paths = pg.selectAll("path").data(st, d => d.key).join("path")
        .attr("fill", d => V.alpha(RCOL[keys.indexOf(d.key)], .75)).attr("stroke", "#fff").attr("stroke-width", .6)
        .attr("d", area(y));
      function axis(md, y) {
        axG.selectAll("*").remove();
        const g = axG.append("g");
        if (md === 1) V.gridY(g, y, m.l, w - m.r, [0, .25, .5, .75, 1], v => f0(v * 100), { zero: 0, unit: " %" });
        else V.gridY(g, y, m.l, w - m.r, y.ticks(mob ? 3 : 5), v => v >= 1000 ? f0(v / 1000) + " k" : f0(v), { zero: 0, unit: "" });
        g.selectAll("line").lower();
        d3.range(2020, 2027).forEach(yr => {
          const px = x(Date.UTC(yr, 0, 1)); if (px < m.l || px > w - m.r) return;
          V.t(g, px, h - m.b + 18, yr, { anchor: "middle", size: mob ? 11 : 12, fill: C.muted });
          g.append("line").attr("x1", px).attr("x2", px).attr("y1", h - m.b).attr("y2", h - m.b + 4).attr("stroke", C.ghost).attr("stroke-width", .8);
        });
      }
      function anota(md, st, y) {
        ng.selectAll("*").remove(); if (md === 1) return;
        let bi = 0; tot.forEach((v, i) => { if (v > tot[bi]) bi = i; });
        const px = x(rows[bi].t), py = y(d3.max(st, a => a[bi][1]));
        V.note(ng, {
          x: px, y: py, tx: px - (mob ? 20 : 40), ty: Math.max(m.t + 24, py - (mob ? 26 : 40)),
          kind: "elbow", anchor: "end", dot: true, size: mob ? 11.5 : 12.5,
          lines: [[`El pic no és cap onada`, true], [`${f0(tot[bi])} genomes el ${diaMes(new Date(rows[bi].t))},`], [`la majoria mostres europees d'anys enrere`]]
        });
      }
      axis(mode, y); anota(mode, st, y);
      V.onView(el, instant => {
        if (instant || V.reduced) return;
        const flat = st.map(a => a.map(p => [y.domain()[0], y.domain()[0]]));
        paths.attr("d", (d, i) => area(y)(flat[i])).transition().delay((d, i) => i * 70).duration(1100).ease(EIO).attr("d", area(y));
      });
      [["Recompte", 0], ["Part de cada continent", 1]].forEach(([t, k]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = t;
        b.className = k === mode ? "on" : ""; b.setAttribute("aria-pressed", k === mode);
        b.addEventListener("click", () => {
          mode = k; seg.querySelectorAll("button").forEach((o, i) => { o.className = i === k ? "on" : ""; o.setAttribute("aria-pressed", i === k); });
          st = stackFor(mode); y = yFor(mode, st);
          paths.data(st, d => d.key).transition().duration(V.reduced ? 0 : 900).ease(EIO).attr("d", area(y));
          setTimeout(() => { axis(mode, y); anota(mode, st, y); }, V.reduced ? 0 : 200);
        });
        seg.appendChild(b);
      });
      const tp = V.tip(el);
      V.hover(s.node(), (e, [px, py]) => {
        if (px < m.l || px > w - m.r) { leave(); return; }
        const i = clamp(d3.bisectCenter(rows.map(r => r.t), x.invert(px).getTime()), 0, rows.length - 1);
        const X = x(rows[i].t);
        const a = st.find(q => py <= y(q[i][0]) + 1 && py >= y(q[i][1]) - 1) || d3.least(st, q => Math.abs((y(q[i][0]) + y(q[i][1])) / 2 - py));
        V.focus(paths, q => q.key === a.key, { dim: .25 });
        hg.selectAll("*").remove();
        hg.append("line").attr("x1", X).attr("x2", X).attr("y1", m.t).attr("y2", h - m.b)
          .attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-dasharray", "2 2");
        const v = rows[i][a.key], t2 = tot[i];
        tp.show(`<b>${diaMes(new Date(rows[i].t))}</b> · ${f0(t2)} genomes<br>${REGCA[a.key]}: ${f0(v)} (${f1(t2 ? v / t2 * 100 : 0)} %)`);
      }, leave);
      function leave() { hg.selectAll("*").remove(); V.focus(paths, null); tp.hide(); }
      V.legendCat($("#corba-lg"), REG.map((r, i) => ({ c: RCOL[i], t: REGCA[r] || r, a: .75 })));
    });
  })();

  /* =====================================================================
     V5 · #f-mapa · MAP-03: cercles translúcids sobre el món (sense relleu)
     ===================================================================== */
  (function () {
    const host = $("#mapa-viz"); if (!host) return;
    const CO = D.co.filter(d => d[3]);
    const TOT = d3.sum(D.co, d => d[1]);
    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 700;
      const proj = d3.geoEqualEarth().rotate([-10, 0]);
      const h = Math.round(w * (mob ? .56 : .48));
      proj.fitExtent([[6, 6], [w - 6, h - 6]], { type: "Sphere" });
      const s = V.svg(el, w, h, "Mapa del món amb un cercle per país, proporcional als genomes publicats a les bases obertes. Els cercles més grans són els Estats Units, el Regne Unit i Alemanya.");
      const path = d3.geoPath(proj);
      const gLand = s.append("g"), gC = s.append("g"), gL = s.append("g");
      const r = d3.scaleSqrt([0, d3.max(CO, d => d[1])], [0, mob ? 30 : 46]);
      V.world().then(W => {
        gLand.append("path").attr("d", path(W.land)).attr("fill", C.land).attr("stroke", "none");
        gLand.append("path").attr("d", path(W.borders)).attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", .5);
        const pts = CO.map(d => ({ n: d[0], v: d[1], reg: d[2], p: proj(d[3]) })).filter(d => d.p);
        const cs = gC.selectAll("circle").data(pts.sort((a, b) => b.v - a.v)).join("circle")
          .attr("cx", d => d.p[0]).attr("cy", d => d.p[1])
          .attr("fill", d => V.alpha(d.reg >= 0 ? RCOL[d.reg] : C.ink2, BLEND === "screen" ? .72 : .5))
          .attr("stroke", d => d.reg >= 0 ? RCOL[d.reg] : C.ink2).attr("stroke-width", BLEND === "screen" ? 1 : .7)
          .style("mix-blend-mode", BLEND).attr("r", 0);
        const NOM = { "USA": "Estats Units", "United Kingdom": "Regne Unit", "Germany": "Alemanya", "Denmark": "Dinamarca", "Switzerland": "Suïssa", "France": "França", "Japan": "Japó", "Brazil": "Brasil", "Mexico": "Mèxic", "Iceland": "Islàndia", "Slovakia": "Eslovàquia", "South Africa": "Sud-àfrica", "New Zealand": "Nova Zelanda", "Australia": "Austràlia", "Argentina": "Argentina", "China": "Xina", "Kenya": "Kenya", "Thailand": "Tailàndia", "India": "Índia", "Spain": "Espanya", "Italy": "Itàlia", "Canada": "Canadà", "Bahrain": "Bahrain", "Vietnam": "Vietnam", "Russia": "Rússia", "Sweden": "Suècia", "Netherlands": "Països Baixos", "Belgium": "Bèlgica", "Austria": "Àustria", "Poland": "Polònia", "Portugal": "Portugal", "Norway": "Noruega", "Finland": "Finlàndia", "Ireland": "Irlanda", "Turkey": "Turquia", "Israel": "Israel", "Indonesia": "Indonèsia", "Nigeria": "Nigèria", "Egypt": "Egipte", "Morocco": "Marroc", "Chile": "Xile", "Peru": "Perú", "Colombia": "Colòmbia", "Ecuador": "Equador", "South Korea": "Corea del Sud", "Singapore": "Singapur", "Luxembourg": "Luxemburg", "Czech Republic": "Txèquia", "Hungary": "Hongria", "Greece": "Grècia" };
        const nomCa = n => NOM[n] || n;
        V.onView(el, instant => {
          cs.transition().duration(instant || V.reduced ? 0 : 900).delay((d, i) => instant || V.reduced ? 0 : Math.min(600, i * 6))
            .ease(EIO).attr("r", d => r(d.v));
        });
        // etiquetes dels tres primers
        // els tres més grans. Al mòbil no hi caben les anotacions: van en una llista a la cantonada buida.
        if (mob) {
          pts.slice(0, 3).forEach((d, i) => V.t(gL, 6, 15 + i * 15,
            `${nomCa(d.n)} · ${f1(d.v / 1e6)} M · ${f1(d.v / TOT * 100)} %`, { size: 11.5, weight: 600, halo: 3 }));
        } else {
          const DIR = [[-1, -1], [-1, 1], [1, -1]];
          pts.slice(0, 3).forEach((d, i) => {
            const [sx, sy] = DIR[i], rr = r(d.v);
            V.note(gL, {
              x: d.p[0] + sx * rr * .7, y: d.p[1] + sy * rr * .7,
              tx: d.p[0] + sx * (rr + 26), ty: d.p[1] + sy * (rr + 26),
              kind: "elbow", anchor: sx < 0 ? "end" : "start", size: 12.5,
              valign: sy < 0 ? "bottom" : "top",
              lines: [[nomCa(d.n), true], [`${f0(d.v)} genomes · ${f1(d.v / TOT * 100)} %`]]
            });
          });
        }
        const tp = V.tip(el);
        V.hover(s.node(), (e, [px, py]) => {
          const best = d3.least(pts, d => { const dd = Math.hypot(d.p[0] - px, d.p[1] - py); return dd > Math.max(9, r(d.v)) ? 1e9 : dd - r(d.v); });
          if (!best || Math.hypot(best.p[0] - px, best.p[1] - py) > Math.max(9, r(best.v))) { tp.hide(); V.focus(cs, null); return; }
          V.focus(cs, d => d === best, { dim: .3 });
          tp.show(`<b>${nomCa(best.n)}</b> · ${f0(best.v)} genomes en obert (${f1(best.v / TOT * 100)} % del total)`);
        }, () => { tp.hide(); V.focus(cs, null); });
      });
      const lgN = V.legendSize($("#mapa-lg"), { values: [10000, 500000, 3500000], r: v => r(v), f: v => v >= 1e6 ? f1(v / 1e6) + " M" : f0(v / 1000) + " k", title: "genomes en obert" });
      if (lgN) lgN.style.paddingLeft = "16px";
    });
  })();

  /* =====================================================================
     V6 · #f-normes · TIME-13: cronologia amb icones (eix trencat)
     ===================================================================== */
  (function () {
    const host = $("#normes-viz"); if (!host) return;
    const F = [
      { y: 1665, t: "Comencen les Philosophical Transactions", d: "El primer número de la revista de la Royal Society, que encara es publica: publicar és regalar una troballa i quedar-se'n el nom.", k: "doc", c: C.ink2 },
      { y: 1996, t: "Els principis de Bermuda", d: "Els centres del genoma humà acorden alliberar cada dia tot fragment muntat de més d'1 kb, com a domini públic i abans de publicar-ne cap article.", k: "doc", c: C.blue, big: true },
      { y: 1997, t: "Es reafirmen", d: "La segona reunió de les Bermudes confirma l'alliberament ràpid i l'accés públic.", k: "doc", c: C.blue },
      { y: 2006, t: "Indonèsia s'atura", d: "Deixa de compartir mostres de grip aviària: s'havien patentat versions de mostres cedides, sense consentiment dels països d'origen.", k: "stop", c: C.red },
      { y: 2007, t: "Resposta de l'OMS", d: "L'Assemblea Mundial de la Salut aprova una resolució sobre compartir virus i accedir a les vacunes.", k: "doc", c: C.yellowDark },
      { y: 2008, t: "Neix GISAID", d: "Una base de dades d'accés amb condicions: qui baixa dades s'identifica i reconeix els laboratoris d'origen.", k: "db", c: C.yellowDark },
      { y: 2009, t: "Toronto, i la grip A(H1N1)", d: "Un taller proposa estendre l'alliberament previ a qualsevol conjunt de referència; el primer genoma del virus nou es comparteix el 25 d'abril.", k: "doc", c: C.blue },
      { y: 2015, t: "Norma per a emergències", d: "En una consulta de l'OMS a Ginebra, finançadors, revistes i agències fixen que, en una emergència, compartir de pressa ha de ser la norma i que les revistes no ho poden penalitzar.", k: "doc", c: C.blue },
      { y: 2018, t: "Nextstrain", d: "Es descriu l'eina oberta que segueix l'evolució dels patògens en temps real.", k: "db", c: C.blue },
      { y: 2020, t: "L'11 de gener", d: "La seqüència del SARS-CoV-2 es fa pública en un fòrum, amb permís per descarregar-la i analitzar-la.", k: "key", c: C.red, big: true },
      { y: 2021, t: "Els llinatges tenen nom", d: "Una eina oberta posa nom als llinatges del virus a partir del seu genoma.", k: "db", c: C.blue }
    ];
    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 760;
      if (mob) {
        // mòbil: llista vertical, amb l'alçada de cada entrada segons el text
        const xr = 20, maxw = w - xr - 24;
        const blocs = F.map(d => ({ d, ln: wrap(d.d, maxw, 11.5), tl: wrap(`${d.y} · ${d.t}`, maxw, 12.5, 700) }));
        let y = 20; const ys = blocs.map(b => { const y0 = y; y += b.tl.length * 15 + b.ln.length * 14 + 16; return y0; });
        const h = y + 6, s = V.svg(el, w, h, "Cronologia de les normes de compartició de dades, del 1665 al 2021.");
        const g = s.append("g");
        g.append("line").attr("x1", xr).attr("x2", xr).attr("y1", ys[0]).attr("y2", ys[ys.length - 1]).attr("stroke", C.grid).attr("stroke-width", 1);
        blocs.forEach((b, i) => {
          const gg = g.append("g"), y0 = ys[i];
          gg.append("circle").attr("cx", xr).attr("cy", y0 - 4).attr("r", b.d.big ? 6 : 4.5).attr("fill", b.d.c);
          b.tl.forEach((ln, k) => V.t(gg, xr + 14, y0 + k * 15, ln, { size: 12.5, weight: 700 }));
          b.ln.forEach((ln, k) => V.t(gg, xr + 14, y0 + b.tl.length * 15 + k * 14, ln, { size: 11.5, fill: C.ink2 }));
        });
        return;
      }
      const m = { t: 24, r: 20, b: 46, l: 20 };
      const gap = 56, xBreak = m.l + 86;
      const x = d3.scaleLinear([1996, 2021], [xBreak + gap, w - m.r - 54]);
      const px = d => d.y < 1900 ? m.l + 30 : x(d.y);
      // carrils: s'assignen de dalt a baix evitant que les etiquetes es trepitgin
      const LW = 150, lanes = [];
      const order = F.map((d, i) => i).sort((a, b) => px(F[a]) - px(F[b]));
      const laneOf = new Array(F.length).fill(0), right = [];
      order.forEach(i => {
        const left = px(F[i]) - LW / 2;
        let k = 0; while (right[k] != null && right[k] > left - 12) k++;
        laneOf[i] = k; right[k] = px(F[i]) + LW / 2;
      });
      const nLanes = Math.max(...laneOf) + 1, LH = 50;
      const h = m.t + nLanes * LH + 46 + m.b;
      const baseY = h - m.b;
      const s2 = V.svg(el, w, h, "Cronologia de les normes de compartició de dades: 1665, les Philosophical Transactions; 1996, els principis de Bermuda; 2006-2007, la crisi de la grip aviària; 2008, GISAID; 2015, les normes de l'OMS; 2020, l'11 de gener.");
      const g = s2.append("g");
      g.append("line").attr("x1", m.l).attr("x2", xBreak).attr("y1", baseY).attr("y2", baseY).attr("stroke", C.hair).attr("stroke-width", 1);
      g.append("line").attr("x1", xBreak + gap).attr("x2", w - m.r).attr("y1", baseY).attr("y2", baseY).attr("stroke", C.hair).attr("stroke-width", 1);
      [0, 1].forEach(k => {
        const bx = xBreak + 16 + k * 16;
        g.append("line").attr("x1", bx).attr("x2", bx + 10).attr("y1", baseY + 6).attr("y2", baseY - 6).attr("stroke", C.ghost).attr("stroke-width", 1);
      });
      const items = g.selectAll("g.it").data(F).join("g").attr("class", "it").style("cursor", "pointer");
      items.each(function (d, i) {
        const gg = d3.select(this), X = px(d), yTop = m.t + laneOf[i] * LH;
        gg.append("line").attr("x1", X).attr("x2", X).attr("y1", baseY - 6).attr("y2", yTop + 8).attr("stroke", C.grid).attr("stroke-width", .8);
        gg.append("circle").attr("cx", X).attr("cy", baseY).attr("r", d.big ? 6 : 4).attr("fill", d.c);
        const cx = clamp(X, m.l + LW / 2, w - m.r - LW / 2);
        V.t(gg, cx, yTop, d.y, { anchor: "middle", size: 12.5, weight: 700, fill: d.c === C.yellowDark ? C.ink : d.c, halo: 3 });
        wrap(d.t, LW, 12).forEach((ln, k) => V.t(gg, cx, yTop + 15 + k * 14, ln, { anchor: "middle", size: 12, fill: C.ink, halo: 3 }));
        gg.append("rect").attr("x", X - 20).attr("y", yTop - 14).attr("width", 40).attr("height", baseY - yTop + 20).attr("fill", "transparent");
      });
      const tp = V.tip(el);
      V.hover(s2.node(), (e, [mx, my]) => {
        const best = d3.least(F, d => Math.abs(px(d) - mx));
        if (!best || Math.abs(px(best) - mx) > 34) { tp.hide(); V.focus(items, null); return; }
        V.focus(items, d => d === best, { dim: .35 });
        tp.show(`<b>${best.y} · ${best.t}</b> · ${best.d}`);
      }, () => { tp.hide(); V.focus(items, null); });
      V.onView(el, instant => {
        if (instant || V.reduced) return;
        items.style("opacity", 0).transition().delay((d, i) => i * 90).duration(420).style("opacity", 1);
      });
    });
  })();

  /* =====================================================================
     V7 · #f-retard · TIME-01 + franja: dies de la mostra a la publicació
     ===================================================================== */
  (function () {
    const host = $("#retard-viz"); if (!host) return;
    const L = D.lag.map(d => ({ m: d[0], n: d[1], p50: d[2], p90: d[3], t: Date.parse(d[0] + "-15T00:00Z") }));
    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 700, h = mob ? 300 : 400, m = { t: 22, r: mob ? 10 : 16, b: 30, l: mob ? 34 : 44 };
      const s = V.svg(el, w, h, "Dies entre la recollida de la mostra i la publicació del genoma, mes a mes: la mediana va de 15 dies el març del 2020 a 295 el juliol del 2023, sempre molt per sobre de l'alliberament diari que demanava l'acord de Bermuda.");
      const x = d3.scaleTime([L[0].t, L[L.length - 1].t], [m.l, w - m.r]);
      const y = d3.scaleLog([1, 420], [h - m.b, m.t]).clamp(true);
      const g = s.append("g");
      V.gridY(g, y, m.l, w - m.r, [1, 7, 30, 90, 365], v => v === 1 ? "1 dia" : v === 365 ? "1 any" : f0(v) + " dies", { zero: null });
      d3.range(2020, 2027).forEach(yr => {
        const X = x(Date.UTC(yr, 0, 1)); if (X < m.l || X > w - m.r) return;
        V.t(g, X, h - m.b + 18, yr, { anchor: "middle", size: mob ? 11 : 12, fill: C.muted });
      });
      const band = d3.area().x(d => x(d.t)).y0(d => y(d.p50)).y1(d => y(d.p90)).curve(d3.curveMonotoneX);
      const line = d3.line().x(d => x(d.t)).y(d => y(d.p50)).curve(d3.curveMonotoneX);
      [[1, "Bermuda: alliberament diari", C.yellowDark], [21, "L'objectiu de 21 dies", C.ink2]].forEach(([v, t, c]) => {
        g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y(v)).attr("y2", y(v))
          .attr("stroke", c).attr("stroke-width", 1).attr("stroke-dasharray", "4 3");
        V.t(g, mob && v === 21 ? m.l + 4 : w - m.r, y(v) + (mob && v === 21 ? 13 : -5), t,
          { anchor: mob && v === 21 ? "start" : "end", size: mob ? 11 : 12, fill: c === C.yellowDark ? C.ink2 : c, halo: 3 });
      });
      const bp = g.append("path").attr("d", band(L)).attr("fill", V.alpha(C.blue, BLEND === "screen" ? .4 : .22)).style("mix-blend-mode", BLEND);
      const lp = g.append("path").attr("d", line(L)).attr("fill", "none").attr("stroke", C.blue).attr("stroke-width", 2);
      const hg = g.append("g");
      V.onView(el, instant => {
        if (instant || V.reduced) return;
        const len = lp.node().getTotalLength();
        lp.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len)
          .transition().duration(1500).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0).on("end", () => lp.attr("stroke-dasharray", null));
        bp.style("opacity", 0).transition().delay(500).duration(800).style("opacity", 1);
      });
      const tp = V.tip(el);
      V.hover(s.node(), (e, [px]) => {
        if (px < m.l || px > w - m.r) { hg.selectAll("*").remove(); tp.hide(); return; }
        const i = clamp(d3.bisectCenter(L.map(d => d.t), x.invert(px).getTime()), 0, L.length - 1), d = L[i];
        hg.selectAll("*").remove();
        hg.append("line").attr("x1", x(d.t)).attr("x2", x(d.t)).attr("y1", m.t).attr("y2", h - m.b)
          .attr("stroke", C.ink).attr("stroke-width", .7).attr("stroke-dasharray", "2 2");
        hg.append("circle").attr("cx", x(d.t)).attr("cy", y(d.p50)).attr("r", 4).attr("fill", C.blue);
        const [yr, mo] = d.m.split("-");
        tp.show(`<b>${MESOS[+mo - 1]} del ${yr}</b> · mediana ${f0(d.p50)} dies; 1 de cada 10 passa de ${f0(d.p90)}<br>${f0(d.n)} genomes`);
      }, () => { hg.selectAll("*").remove(); tp.hide(); });
      V.legendCat($("#retard-lg"), [{ c: C.blue, t: "mediana", kind: "line" }, { c: C.blue, t: "fins al percentil 90", a: BLEND === "screen" ? .4 : .22 }]);
    });
  })();

  /* =====================================================================
     V8 · #f-desigual · CASE-02: halteres
     ===================================================================== */
  (function () {
    const host = $("#desigual-viz"); if (!host) return;
    const R = [
      { t: "Països que van seqüenciar més del 0,5 % dels seus casos", a: 78, b: 42, u: "% dels països" },
      { t: "Genomes publicats en menys de 21 dies", a: 25, b: 5, u: "% dels genomes" }
    ];
    V.mount(host, (el, w) => {
      el.innerHTML = "";
      const mob = w < 700, h = mob ? 212 : 208, m = { t: 26, r: mob ? 16 : 30, b: 30, l: mob ? 16 : 30 };
      const s = V.svg(el, w, h, "Dues comparacions entre països de renda alta i de renda baixa i mitjana: el 78 % contra el 42 % van seqüenciar més del 0,5 % dels casos, i el 25 % contra el 5 % dels genomes es van publicar en menys de 21 dies.");
      const x = d3.scaleLinear([0, 100], [m.l, w - m.r]);
      const g = s.append("g");
      V.axisX(g, x, h - m.b + 4, [0, 25, 50, 75, 100], v => f0(v) + (v === 100 ? " %" : ""), { tick: true });
      const rows = g.selectAll("g.r").data(R).join("g").attr("class", "r")
        .attr("transform", (d, i) => `translate(0,${m.t + 16 + i * (mob ? 74 : 78)})`);
      rows.each(function (d) {
        const gg = d3.select(this);
        wrap(d.t, w - m.l - m.r, mob ? 12 : 13, 600).forEach((ln, k) => V.t(gg, m.l, -26 + k * 15, ln, { size: mob ? 12 : 13, weight: 600 }));
        gg.append("line").attr("class", "bar").attr("x1", x(d.b)).attr("x2", x(d.b)).attr("y1", 0).attr("y2", 0)
          .attr("stroke", C.ghost).attr("stroke-width", 3);
        gg.append("circle").attr("class", "lo").attr("cx", x(d.b)).attr("cy", 0).attr("r", mob ? 7 : 8).attr("fill", C.blueLight).attr("stroke", C.blue).attr("stroke-width", 1);
        gg.append("circle").attr("class", "hi").attr("cx", x(d.b)).attr("cy", 0).attr("r", mob ? 7 : 8).attr("fill", C.blue);
      });
      function place(anim) {
        const dur = anim && !V.reduced ? 1000 : 0;
        rows.each(function (d) {
          const gg = d3.select(this);
          gg.select("line.bar").transition().duration(dur).ease(EIO).attr("x1", x(d.b)).attr("x2", x(d.a));
          gg.select("circle.hi").transition().duration(dur).ease(EIO).attr("cx", x(d.a));
          gg.selectAll("text.vl").remove();
        });
        setTimeout(() => {
          rows.each(function (d) {
            const gg = d3.select(this);
            gg.append("text").attr("class", "vl").attr("x", x(d.a)).attr("y", mob ? 22 : 24).attr("text-anchor", "middle")
              .attr("font-family", '"Source Sans 3",sans-serif').attr("font-size", mob ? 12 : 13).attr("font-weight", 700).attr("fill", C.blue)
              .text(f0(d.a) + " %");
            gg.append("text").attr("class", "vl").attr("x", x(d.b)).attr("y", mob ? 22 : 24).attr("text-anchor", "middle")
              .attr("font-family", '"Source Sans 3",sans-serif').attr("font-size", mob ? 12 : 13).attr("font-weight", 700).attr("fill", C.ink2)
              .text(f0(d.b) + " %");
          });
        }, dur);
      }
      V.onView(el, instant => place(!instant));
      const tp = V.tip(el);
      V.hover(s.node(), (e, [px, py]) => {
        const i = clamp(Math.floor((py - m.t) / (mob ? 74 : 78)), 0, R.length - 1), d = R[i];
        tp.show(`<b>${d.t}</b> · renda alta ${f0(d.a)} ${d.u.replace("% ", "% ")} · renda baixa i mitjana ${f0(d.b)} %`);
      }, () => tp.hide());
      V.legendCat($("#desigual-lg"), [{ c: C.blue, t: "països de renda alta" }, { c: C.blueLight, t: "renda baixa i mitjana" }]);
    });
  })();
})();
