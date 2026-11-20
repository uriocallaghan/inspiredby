/* «L'últim sopar de Leonardo» · 6 visualitzacions del sistema infogràfic (IBV + d3 7.9.0)
   V1 (#taula-viz):    Scrollytelling 1 · HOW-01/planta arquitectònica de l'evolució de la taula (4 passos).
   V2 (#textos-viz):   CASE-06 Matriu textual comparativa (6 textos × 9 variables bíbliques i històriques).
   V3 (#cenacolo-viz): MAP-15 Comparador Leonardo (1498) vs Giampietrino (c. 1515–1520) + 3 capes d'anàlisi.
   V4 (#cataleg-viz):  CASE-04 Filera de cercles translúcids (20 obres reals, c. 500–1594, 3 vistes).
   V5 (#mur-viz):      Scrollytelling 2 · HOW-01 Tall estratigràfic comparat + cronologia 1495–1999.
   V6 (#mites-viz):    Taula semàntica interactiva filtrable de mites vs proves materials. */
(function(){
  "use strict";
  if(!window.d3 || !window.IBV || !window.SOPAR_DADES) return;
  const V = IBV, C = V.C, D = window.SOPAR_DADES;
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = d3.easeCubicInOut;
  const dur = ms => V.reduced ? 0 : ms;

  const OUTS = new Map();
  document.addEventListener("pointerdown", ev => {
    OUTS.forEach((fn, n) => { if(n.isConnected && !n.contains(ev.target)) fn(); });
  }, true);
  const outside = (node, fn) => OUTS.set(node, fn);

  function seg(root, cb){
    const bs = [...root.querySelectorAll(".seg button")];
    bs.forEach(b => b.addEventListener("click", () => {
      bs.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      cb(b.dataset.k, b);
    }));
  }
  function lg(el, items){
    if(!el) return;
    el.innerHTML = items.map(i => `<span class="lgi"><i class="${i.k || ""}" style="${(i.k === "ln" || i.k === "da" || i.k === "ho") ? "border-color" : "background"}:${i.c}"></i>${i.t}</span>`).join("");
  }
  function colHex(name){
    return name === "vermell" ? C.vermell : name === "blau" ? C.blau : name === "groc" ? C.groc : C.ink;
  }

  /* =========================================================================
     V1 · SCROLLY 1 — DEL TRICLINIUM AL FRIS DE MILÀ (#taula-viz)
     ========================================================================= */
  (function initTaula(){
    const sec = $("#s-taula"), el = $("#taula-viz"), rd = $("#taula-r");
    const tEl = $("#taula-t"), sEl = $("#taula-s");
    if(!sec || !el) return;
    lg($("#taula-lg"), [
      { c: C.ink, t: "Jesús" },
      { c: C.blau, t: "Deixebles integrats" },
      { c: C.groc, t: "Joan" },
      { c: C.vermell, t: "Judes Iscariot" }
    ]);

    let curStep = 0;
    let updFn = null;

    const M = V.mount(el, (node, w) => {
      const mob = w < 560;
      const h = mob ? 320 : 410;
      const s = V.svg(node, w, h, "Planta esquemàtica en quatre etapes de l'evolució de la comensalitat: del triclinium reclinat de Jerusalem al fris integrat de Leonardo.");
      const g = s.append("g");
      const cx = w / 2, cy = h * 0.52;

      function drawStep(idx){
        curStep = idx;
        const et = D.etapesTaula[idx] || D.etapesTaula[0];
        if(tEl) tEl.textContent = et.titol;
        if(sEl) sEl.textContent = et.sub;
        if(rd) rd.innerHTML = `<b>${et.titol}:</b> ${et.detall}`;

        g.selectAll("*").remove();
        const k = Math.min(w / 540, h / 370);
        const sx = x => cx + x * k;
        const sy = y => cy + y * k;
        const sg = g.append("g");

        if(idx === 0){
          // 1. TRICLINIUM DE JERUSALEM (U rectangular amb 3 llits i cossos reclinats obliquament)
          sg.append("rect").attr("x", sx(-88)).attr("y", sy(-64)).attr("width", 176 * k).attr("height", 132 * k)
            .attr("rx", 4).attr("fill", C.land).attr("stroke", C.hair).attr("stroke-width", 1);
          [
            [-172, -96, 70, 198],
            [-100, -148, 200, 70],
            [102, -96, 70, 198]
          ].forEach(([x,y,rw,rh]) => {
            sg.append("rect").attr("x", sx(x)).attr("y", sy(y)).attr("width", rw * k).attr("height", rh * k)
              .attr("rx", 6).attr("fill", "none").attr("stroke", C.ghost).attr("stroke-width", 1.2).attr("stroke-dasharray", "3 3");
          });
          [[-60,-38],[60,-38],[-60,38],[60,38],[0,-44]].forEach(([vx,vy]) => {
            sg.append("circle").attr("cx", sx(vx)).attr("cy", sy(vy)).attr("r", 5.5 * k)
              .attr("fill", V.alpha(C.blau, .22)).attr("stroke", C.ink2).attr("stroke-width", .8);
          });
          V.t(sg, sx(0), sy(0), "Plat comú +", { anchor: "middle", size: 11, fill: C.ink2 });
          V.t(sg, sx(0), sy(16), "pedra calcària", { anchor: "middle", size: 11, fill: C.muted });

          const seats = [
            { x:-62, y:-92, ang: -120, c: C.blau },
            { x:-28, y:-92, ang: -120, c: C.vermell },
            { x:  6, y:-92, ang: -120, c: C.ink, star: true },
            { x: 40, y:-92, ang: -120, c: C.groc },
            { x: 74, y:-92, ang: -120, c: C.blau },
            { x:-114, y:-48, ang: -175, c: C.blau },
            { x:-114, y: -8, ang: -175, c: C.blau },
            { x:-114, y: 32, ang: -175, c: C.blau },
            { x:-114, y: 72, ang: -175, c: C.blau },
            { x: 114, y:-48, ang: -35, c: C.blau },
            { x: 114, y: -8, ang: -35, c: C.blau },
            { x: 114, y: 32, ang: -35, c: C.blau },
            { x: 114, y: 72, ang: -35, c: C.blau }
          ];
          seats.forEach(p => {
            const rad = p.ang * Math.PI / 180;
            const fx = p.x + Math.cos(rad) * 34, fy = p.y + Math.sin(rad) * 34;
            sg.append("line").attr("x1", sx(p.x)).attr("y1", sy(p.y)).attr("x2", sx(fx)).attr("y2", sy(fy))
              .attr("stroke", p.c).attr("stroke-width", 4.2 * k).attr("stroke-opacity", .35).attr("stroke-linecap", "round");
            sg.append("circle").attr("cx", sx(p.x)).attr("cy", sy(p.y)).attr("r", (p.star ? 10 : 8) * k)
              .attr("fill", p.c).attr("fill-opacity", p.c === C.groc ? .72 : .42).style("mix-blend-mode", "multiply");
            sg.append("circle").attr("cx", sx(p.x)).attr("cy", sy(p.y)).attr("r", 3).attr("fill", p.c === C.groc ? C.ink : p.c);
          });
          V.note(sg, { x: sx(40), y: sy(-96), tx: mob ? sx(20) : sx(92), ty: sy(-154), kind: "elbow", anchor: mob ? "middle" : "start", size: mob ? 11 : 12,
            lines: mob ? [["Joan al pit (Jn 13,23)", true]] : [["Joan al pit (Jn 13,23)", true], ["Colze esquerre → mà dreta lliure"]] });
          V.note(sg, { x: sx(-148), y: sy(72), tx: sx(-152), ty: sy(126), kind: "elbow", anchor: "start", size: mob ? 11 : 12,
            lines: mob ? [["Peus cap enfora (Jn 13,5)", true]] : [["Peus cap enfora", true], ["Espai per al rentament (Jn 13,5)"]] });
        }
        else if(idx === 1){
          // 2. STIBADIUM / SIGMA DE RAVENNA (s. VI)
          const R_out = 132 * k, R_in = 78 * k;
          const arcGen = d3.arc().innerRadius(R_in).outerRadius(R_out).startAngle(-Math.PI * 0.56).endAngle(Math.PI * 0.56);
          sg.append("path").attr("d", arcGen()).attr("transform", `translate(${cx},${cy})`)
            .attr("fill", C.land).attr("stroke", C.hair).attr("stroke-width", 1);
          sg.append("ellipse").attr("cx", sx(0)).attr("cy", sy(-12)).attr("rx", 42 * k).attr("ry", 24 * k)
            .attr("fill", V.alpha(C.blau, .16)).attr("stroke", C.blau).attr("stroke-width", 1);
          [-18, 18].forEach(px => {
            sg.append("ellipse").attr("cx", sx(px)).attr("cy", sy(-12)).attr("rx", 11 * k).attr("ry", 4.5 * k).attr("fill", C.blau).attr("fill-opacity", .48);
          });
          V.t(sg, sx(0), sy(26), mob ? "2 peixos + pans (s. VI)" : "2 peixos + pans (Sant'Apollinare)", { anchor: "middle", size: 11.5, fill: C.ink2 });
          for(let i = 0; i < 13; i++){
            const a = -Math.PI * 0.52 + (i / 12) * Math.PI * 1.04;
            const px = Math.sin(a) * 144, py = -Math.cos(a) * 144;
            const isJes = i === 0, isJud = i === 6;
            const col = isJes ? C.ink : isJud ? C.vermell : C.blau;
            sg.append("line").attr("x1", sx(px)).attr("y1", sy(py)).attr("x2", sx(Math.sin(a)*176)).attr("y2", sy(-Math.cos(a)*176))
              .attr("stroke", col).attr("stroke-width", 4 * k).attr("stroke-opacity", .32).attr("stroke-linecap", "round");
            sg.append("circle").attr("cx", sx(px)).attr("cy", sy(py)).attr("r", (isJes ? 11 : 8.5) * k)
              .attr("fill", col).attr("fill-opacity", .40).style("mix-blend-mode", "multiply");
            sg.append("circle").attr("cx", sx(px)).attr("cy", sy(py)).attr("r", 3).attr("fill", col);
          }
          V.note(sg, { x: sx(-144), y: sy(12), tx: mob ? sx(-132) : sx(-190), ty: sy(118), kind: "elbow", anchor: "start", size: mob ? 11 : 12,
            lines: mob ? [["Jesús a l'extrem esquerre", true]] : [["Jesús a l'extrem esquerre", true], ["Lloc d'honor del sigma romà"]] });
          V.note(sg, { x: sx(0), y: sy(-144), tx: mob ? sx(12) : sx(34), ty: sy(-174), kind: "elbow", anchor: "start", size: mob ? 11 : 12,
            lines: mob ? [["Judes dins la corba", true]] : [["Judes integrat a la corba", true], ["Encara no l'han expulsat al davant"]] });
        }
        else if(idx === 2){
          // 3. TAULA RECTA MEDIEVAL I S. XV (Judes exiliat al davant)
          sg.append("rect").attr("x", sx(-210)).attr("y", sy(-28)).attr("width", 420 * k).attr("height", 60 * k)
            .attr("rx", 2).attr("fill", C.land).attr("stroke", C.hair).attr("stroke-width", 1.1);
          for(let i = 0; i < 12; i++){
            const px = -190 + i * (380 / 11);
            const isJes = i === 5, isJoan = i === 6;
            const col = isJes ? C.ink : isJoan ? C.groc : C.blau;
            sg.append("circle").attr("cx", sx(px)).attr("cy", sy(-52)).attr("r", (isJes ? 12 : 9.5) * k)
              .attr("fill", col).attr("fill-opacity", col === C.groc ? .65 : .36).style("mix-blend-mode", "multiply");
            sg.append("circle").attr("cx", sx(px)).attr("cy", sy(-52)).attr("r", 3).attr("fill", col === C.groc ? C.ink : col);
          }
          sg.append("circle").attr("cx", sx(-18)).attr("cy", sy(66)).attr("r", 15 * k)
            .attr("fill", C.vermell).attr("fill-opacity", .38).style("mix-blend-mode", "multiply");
          sg.append("circle").attr("cx", sx(-18)).attr("cy", sy(66)).attr("r", 4).attr("fill", C.vermell);
          V.t(sg, sx(0), sy(6), mob ? "Taula de cavallets" : "Taula rectangular de cavallets · Postura erecta", { anchor: "middle", size: 11.5, fill: C.ink2 });
          V.note(sg, { x: sx(-18), y: sy(74), tx: mob ? sx(-8) : sx(38), ty: sy(122), kind: "elbow", anchor: "start", size: mob ? 11 : 12,
            lines: mob ? [["Judes exiliat sol al davant", true]] : [["Judes exiliat sol al davant", true], ["Castagno (1447), Ghirlandaio (1480), Seu d'Urgell"]] });
          V.note(sg, { x: sx(-16), y: sy(-58), tx: sx(-16), ty: sy(-132), kind: "straight", anchor: "middle", size: mob ? 11 : 12,
            lines: mob ? [["Els 12 al costat llunyà", true]] : [["Els 12 al costat llunyà", true], ["Separats per aurèoles daurades"]] });
        }
        else {
          // 4. FRIS DE LEONARDO A MILÀ (1495–1498): 3+3 | Crist | 3+3 + finestres oest + clau
          const vp = [0, -76];
          [[-240,-160],[240,-160],[-240,145],[240,145]].forEach(([rx,ry]) => {
            sg.append("line").attr("x1", sx(rx)).attr("y1", sy(ry)).attr("x2", sx(vp[0])).attr("y2", sy(vp[1]))
              .attr("stroke", C.hair).attr("stroke-width", .8);
          });
          sg.append("line").attr("x1", sx(-236)).attr("y1", sy(-90)).attr("x2", sx(-236)).attr("y2", sy(70))
            .attr("stroke", C.groc).attr("stroke-width", 4);
          V.t(sg, sx(-226), sy(-102), "Llum real (oest)", { anchor: "start", size: 11, fill: C.ink2 });
          sg.append("rect").attr("x", sx(-220)).attr("y", sy(2)).attr("width", 440 * k).attr("height", 44 * k)
            .attr("fill", C.land).attr("stroke", C.ink2).attr("stroke-width", 1);
          const xs = [-198,-168,-138, -98,-72,-44, 0, 46,74,102, 142,172,202];
          xs.forEach((px, i) => {
            const isJes = i === 6, isJud = i === 3, isJoan = i === 5;
            const py = isJud ? -10 : -24;
            const col = isJes ? C.ink : isJud ? C.vermell : isJoan ? C.groc : C.blau;
            sg.append("circle").attr("cx", sx(px)).attr("cy", sy(py)).attr("r", (isJes ? 12 : isJud ? 13 : 9) * k)
              .attr("fill", col).attr("fill-opacity", col === C.groc ? .65 : .38).style("mix-blend-mode", "multiply");
            sg.append("circle").attr("cx", sx(px)).attr("cy", sy(py)).attr("r", 3).attr("fill", col === C.groc ? C.ink : col);
          });
          sg.append("circle").attr("cx", sx(vp[0])).attr("cy", sy(vp[1])).attr("r", 3.5).attr("fill", C.vermell);
          V.note(sg, { x: sx(0), y: sy(-76), tx: mob ? sx(12) : sx(46), ty: sy(-136), kind: "elbow", anchor: "start", size: mob ? 11 : 12,
            lines: mob ? [["Clau a la templa de Crist", true]] : [["Clau a la templa dreta de Crist", true], ["Punt de fuga real del refectori"]] });
          V.note(sg, { x: sx(-98), y: sy(-8), tx: sx(-82), ty: sy(108), kind: "elbow", anchor: "start", size: mob ? 11 : 12,
            lines: mob ? [["Judes dins la 2a tríada", true]] : [["Judes dins la 2a tríada", true], ["Sense aurèoles: aïllat per ombra i posició"]] });
        }

        if(!V.reduced){
          sg.style("opacity", 0).transition().duration(380).ease(ease).style("opacity", 1);
        }
      }

      updFn = drawStep;
      drawStep(curStep);
    });

    if(window.IB && IB.scrolly){
      IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), idx => {
        curStep = idx;
        if(updFn) updFn(idx);
      });
    }
    void M;
  })();

  /* =========================================================================
     V2 · CASE-06 ADAPTAT — MATRIU COMPARATIVA TEXTUAL (#textos-viz)
     ========================================================================= */
  (function initTextos(){
    const fig = $("#f-textos"), el = $("#textos-viz"), rd = $("#textos-r");
    if(!el) return;
    lg($("#textos-lg"), [
      { c: C.blau, t: "Present / explícit", k: "sq" },
      { c: C.vermell, t: "Absent o contradicció clau", k: "sq" },
      { c: C.groc, t: "Debat textual o síntesi", k: "sq" }
    ]);

    let mode = "tot";
    const fillOf = s => s === "si" ? V.alpha(C.blau, .22) : s === "no" ? V.alpha(C.vermell, .24) : V.alpha(C.groc, .42);
    const strokeOf = s => s === "si" ? C.blau : s === "no" ? C.vermell : C.grocFosc;

    const M = V.mount(el, (node, w) => {
      const mob = w < 640;
      const rows = D.textosVars.filter(r =>
        mode === "tot" ? true : mode === "div" ? r.divergencia : r.fontLeo
      );
      const cols = D.textosCols;
      const ml = mob ? 88 : 168, mr = 8, mt = mob ? 48 : 62, mb = 16;
      const cw = (w - ml - mr) / cols.length;
      const ch = mob ? 36 : 42;
      const h = mt + rows.length * ch + mb;

      const s = V.svg(node, w, h, "Matriu comparativa entre les cinc versions del Nou Testament i el mural de Leonardo en nou variables històriques i textuals.");
      const g = s.append("g");

      const MOB_COL = { "1co":"1Co", "mc":"Mc", "mt":"Mt", "lc":"Lc", "jn":"Jn", "leo":"Leo" };
      const MOB_ROW = {
        pasqua:"Pasqua", postura:"Postura", rentament:"Peus", eucaristia:"Pa i vi",
        anamnesis:"Memòria", judes:"Judes", plat:"Plat", pere_joan:"Pere/Joan", comensals:"Sala"
      };

      // Capçaleres de columna
      cols.forEach((col, ci) => {
        const cx = ml + (ci + .5) * cw;
        V.t(g, cx, mt - (mob ? 14 : 24), mob ? MOB_COL[col.id] : col.nom, {
          anchor: "middle", size: mob ? 11.5 : 12.5, weight: 700, fill: col.id === "leo" ? C.vermell : C.ink
        });
        if(!mob){
          V.t(g, cx, mt - 8, col.meta, { anchor: "middle", size: 11, fill: C.muted });
        }
      });

      // Noms de fila
      rows.forEach((r, ri) => {
        V.t(g, ml - 8, mt + (ri + .5) * ch + 4, mob ? MOB_ROW[r.id] : r.nom, {
          anchor: "end", size: mob ? 11 : 12.5, weight: 600, fill: C.ink
        });
      });

      // Cel·les estil CASE-06 (fils blancs fins, text sempre en tinta per a alt contrast WCAG)
      const cellsData = [];
      rows.forEach((r, ri) => {
        r.c.forEach((cell, ci) => {
          cellsData.push({ ri, ci, r, col: cols[ci], cell });
        });
      });

      const cellG = g.append("g").selectAll("g.mc").data(cellsData).join("g").attr("class", "mc")
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", d => `${d.r.nom}, ${d.col.nom}: ${d.cell.v}. ${d.cell.d}`)
        .style("cursor", "pointer");

      cellG.append("rect")
        .attr("x", d => ml + d.ci * cw + 1)
        .attr("y", d => mt + d.ri * ch + 1)
        .attr("width", Math.max(4, cw - 2))
        .attr("height", ch - 2)
        .attr("rx", 2)
        .attr("fill", d => fillOf(d.cell.s));

      cellG.append("text")
        .attr("x", d => ml + (d.ci + .5) * cw)
        .attr("y", d => mt + (d.ri + .5) * ch + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", mob ? 10.5 : 11.5)
        .attr("font-weight", 600)
        .attr("fill", C.ink)
        .text(d => {
          if(mob){
            if(cw < 48) return d.cell.s === "si" ? "Sí" : d.cell.s === "no" ? "No" : "?";
            return d.cell.v.length > 9 ? d.cell.v.slice(0, 8) + "…" : d.cell.v;
          }
          return d.cell.v;
        });

      const hv = g.append("g").style("pointer-events", "none");
      const defTxt = "<b>Cinc textos, una sola taula:</b> passa o toca qualsevol cel·la per llegir el versicle grec o la decisió de Leonardo.";
      if(rd) rd.innerHTML = defTxt;

      const reset = () => {
        cellG.interrupt().transition().duration(120).style("opacity", 1);
        hv.selectAll("*").remove();
        if(rd) rd.innerHTML = defTxt;
      };
      const show = (d) => {
        cellG.interrupt().transition().duration(120).style("opacity", o => (o.ri === d.ri || o.ci === d.ci) ? 1 : .48);
        hv.selectAll("*").remove();
        hv.append("rect")
          .attr("x", ml + d.ci * cw + 1).attr("y", mt + d.ri * ch + 1)
          .attr("width", Math.max(4, cw - 2)).attr("height", ch - 2).attr("rx", 2)
          .attr("fill", "none").attr("stroke", strokeOf(d.cell.s)).attr("stroke-width", 1.8);
        if(rd) rd.innerHTML = `<b>${d.col.nom} · ${d.r.nom}:</b> ${d.cell.d}`;
      };

      outside(node, reset);
      cellG.on("pointerenter pointerdown", (ev, d) => show(d))
           .on("focus", (ev, d) => show(d))
           .on("blur", reset)
           .on("pointerleave", ev => { if(ev.pointerType === "mouse") reset(); });

      V.onView(node, instant => {
        if(instant) return;
        cellG.style("opacity", 0).transition().delay(d => d.ri * 28 + d.ci * 18).duration(340).style("opacity", 1);
      });
    });

    seg(fig, k => { mode = k; el.__seen = true; M.redraw(); });
  })();

  /* =========================================================================
     V3 · MAP-15 ADAPTAT — COMPARADOR LEONARDO VS GIAMPIETRINO (#cenacolo-viz)
     ========================================================================= */
  (function initCenacolo(){
    const fig = $("#f-cenacolo"), stage = $("#cmp-stage"), svgEl = $("#cmp-svg");
    const wrap = stage ? stage.parentElement : null;
    const leoImg = $("#cmp-leo"), handle = $("#cmp-handle"), rd = $("#cenacolo-r");
    const btnLeo = $("#cmp-b-leo"), btnMid = $("#cmp-b-mid"), btnGiam = $("#cmp-b-giam");
    if(!fig || !stage || !wrap || !svgEl || !handle) return;

    lg($("#cenacolo-lg"), [
      { c: C.vermell, t: "Traïció i ferida de 1652" },
      { c: C.blau, t: "Apòstols i proves" },
      { c: C.groc, t: "Perspectiva i menú" }
    ]);

    let split = 0.5;
    let layer = "geo";
    let drag = false;
    let seen = false;

    const svg = d3.select(svgEl).attr("viewBox", "0 0 1600 586");
    const gOverlay = svg.append("g");
    const gDivider = svg.append("g").style("pointer-events", "none");
    const divLine = gDivider.append("line").attr("y1", 0).attr("y2", 586).attr("stroke", "#FFFFFF").attr("stroke-width", 2.2).attr("stroke-opacity", .92);
    const divLineInk = gDivider.append("line").attr("y1", 0).attr("y2", 586).attr("stroke", C.ink).attr("stroke-width", 1).attr("stroke-dasharray", "4 4");

    function setSplit(p){
      split = clamp(p, 0, 1);
      const pct = (split * 100).toFixed(2) + "%";
      stage.style.setProperty("--cmp-split", pct);
      if(leoImg) leoImg.style.clipPath = `inset(0 ${(100 - split * 100).toFixed(2)}% 0 0)`;
      const sx = split * 1600;
      divLine.attr("x1", sx).attr("x2", sx);
      divLineInk.attr("x1", sx).attr("x2", sx);
      handle.style.left = pct;
      handle.setAttribute("aria-valuenow", Math.round(split * 100));
      handle.setAttribute("aria-valuetext", `${Math.round(split * 100)} % mural de Leonardo, ${Math.round((1 - split) * 100)} % còpia de Giampietrino`);
    }

    function drawOverlay(){
      gOverlay.selectAll("*").remove();
      const vpX = D.cenacolo.vp.x * 1600, vpY = D.cenacolo.vp.y * 586;

      if(layer === "geo"){
        // Línies de perspectiva convergint al forat del clau
        const rays = [
          [0, 48], [1600, 48], [0, 282], [1600, 282],
          [216, 586], [544, 586], [1104, 586], [1448, 586]
        ];
        rays.forEach(([rx, ry]) => {
          gOverlay.append("line").attr("x1", rx).attr("y1", ry).attr("x2", vpX).attr("y2", vpY)
            .attr("stroke", C.groc).attr("stroke-width", 2.2).attr("stroke-opacity", .85).attr("stroke-dasharray", "8 6");
        });
        // Contorn de la porta oberta el 1652
        const d1652 = D.cenacolo.porta1652;
        const x0 = d1652.x0 * 1600, x1 = d1652.x1 * 1600, yt = d1652.yTop * 586, ys = d1652.ySide * 586;
        gOverlay.append("path")
          .attr("d", `M${x0},586 L${x0},${ys} Q${(x0+x1)/2},${yt - 18} ${x1},${ys} L${x1},586`)
          .attr("fill", "none").attr("stroke", C.vermell).attr("stroke-width", 3).attr("stroke-dasharray", "8 5");
        const narrow = stage.clientWidth < 600;
        V.t(gOverlay, (x0+x1)/2, narrow ? 558 : ys - 12, narrow ? "Porta 1652 (peus amputats)" : "Porta oberta el 1652 (destrueix els peus de Crist)", {
          anchor: "middle", size: narrow ? 26 : 22, weight: 700, fill: C.ink, halo: 6
        });
        // Clau a la templa de Crist
        gOverlay.append("circle").attr("cx", vpX).attr("cy", vpY).attr("r", 10)
          .attr("fill", C.vermell).attr("stroke", "#FFFFFF").attr("stroke-width", 3);
        V.t(gOverlay, vpX, narrow ? vpY - 36 : vpY - 22, narrow ? "Clau (punt de fuga)" : "Clau del punt de fuga", { anchor: "middle", size: narrow ? 25 : 21, weight: 700, fill: C.ink, halo: 6 });
        if(rd) rd.innerHTML = "<b>Geometria del refectori:</b> arrossega la cortina cap a l'esquerra sobre la porta del 1652 per revelar els peus de Crist a la còpia de Giampietrino.";
      }
      else if(layer === "triades"){
        const pts = D.cenacolo.personatges;
        const nodes = gOverlay.selectAll("g.ap").data(pts).join("g").attr("class", "ap")
          .attr("transform", d => `translate(${d.x * 1600},${d.y * 586})`)
          .attr("tabindex", "0").attr("role", "button")
          .attr("aria-label", d => `${d.nom}: ${d.det}`)
          .style("cursor", "pointer");
        nodes.append("circle").attr("r", 24).attr("fill", d => colHex(d.col)).attr("fill-opacity", .42).attr("stroke", "#FFFFFF").attr("stroke-width", 2.5);
        nodes.append("circle").attr("r", 7).attr("fill", d => d.col === "groc" ? C.ink : colHex(d.col));
        nodes.append("text").attr("y", -30).attr("text-anchor", "middle").attr("font-size", 19).attr("font-weight", 700)
          .attr("fill", C.ink).attr("stroke", "#FFFFFF").attr("stroke-width", 5).attr("paint-order", "stroke")
          .text(d => d.nom.split(" · ")[0]);

        const reset = () => {
          nodes.style("opacity", 1);
          if(rd) rd.innerHTML = "<b>Quatre tríades (3+3 | Crist | 3+3):</b> passa o toca qualsevol punt numerat per identificar l'apòstol i el seu gest.";
        };
        const show = d => {
          nodes.style("opacity", o => o === d ? 1 : .48);
          if(rd) rd.innerHTML = `<b>${d.nom}:</b> ${d.det}`;
        };
        reset();
        nodes.on("pointerenter pointerdown", (ev, d) => { ev.stopPropagation(); show(d); })
             .on("focus", (ev, d) => show(d))
             .on("blur", reset)
             .on("pointerleave", ev => { if(ev.pointerType === "mouse") reset(); });
      }
      else {
        const pts = D.cenacolo.pistes;
        const nodes = gOverlay.selectAll("g.pk").data(pts).join("g").attr("class", "pk")
          .attr("transform", d => `translate(${d.x * 1600},${d.y * 586})`)
          .attr("tabindex", "0").attr("role", "button")
          .attr("aria-label", d => `${d.nom}: ${d.det}`)
          .style("cursor", "pointer");
        nodes.append("circle").attr("r", 22).attr("fill", d => colHex(d.col)).attr("fill-opacity", .55).attr("stroke", "#FFFFFF").attr("stroke-width", 2.5);
        nodes.append("text").attr("y", 7).attr("text-anchor", "middle").attr("font-size", 20).attr("font-weight", 700)
          .attr("fill", d => d.col === "groc" ? C.ink : "#FFFFFF")
          .text((d, i) => String(i + 1));

        const shortLbl = {
          ganivet: { t: "Ganivet", dx: -28, dy: -24, anc: "end" },
          saler: { t: "Saler", dx: 26, dy: 30, anc: "start" },
          peus: { t: "Peus (1652)", dx: 0, dy: -32, anc: "middle" },
          vidre: { t: "Gots de vidre", dx: 26, dy: -26, anc: "start" },
          estovalles: { t: "Nus estovalles", dx: -26, dy: -24, anc: "end" }
        };
        nodes.each(function(d){
          const cfg = shortLbl[d.id];
          if(!cfg) return;
          d3.select(this).append("text").attr("x", cfg.dx).attr("y", cfg.dy).attr("text-anchor", cfg.anc)
            .attr("font-size", 19).attr("font-weight", 700).attr("fill", C.ink)
            .attr("stroke", "#FFFFFF").attr("stroke-width", 5).attr("paint-order", "stroke")
            .text(cfg.t);
        });

        const reset = () => {
          nodes.style("opacity", 1);
          if(rd) rd.innerHTML = "<b>7 pistes forenses sobre la taula:</b> passa o toca qualsevol número per comparar l'original degradat amb la còpia de Giampietrino.";
        };
        const show = (d, i) => {
          nodes.style("opacity", o => o === d ? 1 : .48);
          if(rd) rd.innerHTML = `<b>#${i + 1} · ${d.nom}:</b> ${d.det}`;
        };
        reset();
        nodes.on("pointerenter pointerdown", (ev, d) => { ev.stopPropagation(); show(d, pts.indexOf(d)); })
             .on("focus", (ev, d) => show(d, pts.indexOf(d)))
             .on("blur", reset)
             .on("pointerleave", ev => { if(ev.pointerType === "mouse") reset(); });
      }
    }

    const fracFromEv = ev => {
      const r = stage.getBoundingClientRect();
      return (ev.clientX - r.left) / Math.max(1, r.width);
    };
    wrap.addEventListener("pointerdown", ev => {
      if(ev.target.closest(".ap, .pk")) return;
      drag = true;
      wrap.setPointerCapture(ev.pointerId);
      setSplit(fracFromEv(ev));
    });
    wrap.addEventListener("pointermove", ev => { if(drag) setSplit(fracFromEv(ev)); });
    wrap.addEventListener("pointerup", () => { drag = false; });
    wrap.addEventListener("pointercancel", () => { drag = false; });

    handle.addEventListener("keydown", ev => {
      const step = ev.shiftKey ? .1 : .025;
      if(ev.key === "ArrowLeft" || ev.key === "ArrowDown") { setSplit(split - step); ev.preventDefault(); }
      else if(ev.key === "ArrowRight" || ev.key === "ArrowUp") { setSplit(split + step); ev.preventDefault(); }
      else if(ev.key === "Home") { setSplit(0); ev.preventDefault(); }
      else if(ev.key === "End") { setSplit(1); ev.preventDefault(); }
    });

    if(btnLeo) btnLeo.addEventListener("click", () => setSplit(1));
    if(btnMid) btnMid.addEventListener("click", () => setSplit(.5));
    if(btnGiam) btnGiam.addEventListener("click", () => setSplit(0));

    seg(fig, k => { layer = k; drawOverlay(); });
    drawOverlay();
    setSplit(.5);

    V.onView(stage, instant => {
      if(instant || seen) return;
      seen = true;
      d3.select(stage).transition("sw").duration(1400).ease(ease).tween("sw", () => {
        const ip = d3.interpolate(.92, .48);
        return t => setSplit(ip(t));
      });
    });
  })();

  /* =========================================================================
     V4 · CASE-04 ADAPTAT — CATÀLEG CRONOLÒGIC DE 20 OBRES REALS (#cataleg-viz)
     ========================================================================= */
  (function initCataleg(){
    const fig = $("#f-cataleg"), el = $("#cataleg-viz"), rd = $("#cataleg-r");
    if(!el) return;

    const VIEWS = {
      taula: {
        lg: [
          { c: C.blau, t: "Reclinats (sigma / stibadium)" },
          { c: C.groc, t: "Asseguts (taula recta, U o quadrada)" },
          { c: C.vermell, t: "Fris integrat o diagonal" }
        ],
        groups: [
          { k: "reclinats", t: "Reclinats (sigma)", test: d => d.postura === "reclinats", c: C.blau },
          { k: "asseguts",  t: "Asseguts (recta / U)", test: d => d.postura === "asseguts", c: C.groc },
          { k: "ruptura",   t: "Fris o diagonal", test: d => d.postura === "fris" || d.postura === "moviment", c: C.vermell }
        ]
      },
      judes: {
        lg: [
          { c: C.blau, t: "Integrat dins el grup" },
          { c: C.groc, t: "Al davant amb altres apòstols" },
          { c: C.vermell, t: "Aïllat sol davant Crist" }
        ],
        groups: [
          { k: "integrat",  t: "Integrat al costat", test: d => d.judes === "integrat", c: C.blau },
          { k: "al_davant", t: "Al davant (en grup)", test: d => d.judes === "al_davant", c: C.groc },
          { k: "aillat",    t: "Aïllat sol al davant", test: d => d.judes === "aillat", c: C.vermell }
        ]
      },
      menu: {
        lg: [
          { c: C.blau, t: "Peix o anguila" },
          { c: C.vermell, t: "Anyell, garrí o banquet" },
          { c: C.groc, t: "Pa, vi, bol o hòstia" }
        ],
        groups: [
          { k: "peix",   t: "Peix / anguila", test: d => d.menu === "peix" || d.menu === "peix_anyell" || d.menu === "anguila", c: C.blau },
          { k: "anyell", t: "Anyell / garrí / banquet", test: d => d.menu === "anyell" || d.menu === "garri_anyell" || d.menu === "banquet", c: C.vermell },
          { k: "pavi",   t: "Pa, vi, bol o hòstia", test: d => d.menu === "pa_vi" || d.menu === "pavi_bol" || d.menu === "pavi_hostia", c: C.groc }
        ]
      }
    };

    let mode = "judes";
    function updateLg(){ lg($("#cataleg-lg"), VIEWS[mode].lg); }
    updateLg();

    const M = V.mount(el, (node, w) => {
      const mob = w < 640;
      const cfg = VIEWS[mode];
      const rowH = mob ? 68 : 76;
      const m = { t: 38, r: mob ? 18 : 28, b: 44, l: mob ? 124 : 168 };
      const h = m.t + cfg.groups.length * rowH + m.b;
      const s = V.svg(node, w, h, "Cronologia interactiva de vint obres històriques del Sant Sopar entre els segles VI i XVI classificades per postura, posició de Judes i menú.");
      const g = s.append("g");

      // Escala partida neta: 500–1220 comprimit, 1220–1600 detallat (on hi ha 17 de les 20 obres!)
      const x = d3.scaleLinear([500, 1220, 1600], [m.l, m.l + (w - m.l - m.r) * .22, w - m.r]);
      const cy = i => m.t + (i + .5) * rowH;

      const ticks = mob ? [520, 1100, 1300, 1450, 1590] : [520, 1080, 1250, 1350, 1450, 1500, 1590];
      ticks.forEach(t => {
        const tx = x(t);
        g.append("line").attr("x1", tx).attr("x2", tx).attr("y1", m.t - 10).attr("y2", h - m.b)
          .attr("stroke", t === 1498 ? C.vermell : C.grid).attr("stroke-width", .8);
        V.t(g, tx, h - m.b + 18, String(t), { anchor: "middle", size: 11, fill: C.muted });
      });

      const items = [];
      cfg.groups.forEach((gr, gi) => {
        const y0 = cy(gi);
        g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y0).attr("y2", y0)
          .attr("stroke", C.hair).attr("stroke-width", .7);
        V.t(g, m.l - 12, y0 + 4, gr.t, { anchor: "end", size: mob ? 11 : 12.5, weight: 600, fill: C.ink });

        const list = D.cataleg.filter(gr.test);
        list.forEach((d, k) => {
          // petita separació vertical determinista si dos anys estan molt junts
          const closePrev = k > 0 && Math.abs(x(d.any) - x(list[k-1].any)) < 18;
          const dy = closePrev ? (k % 2 === 0 ? -12 : 12) : 0;
          items.push({ d, gi, cx: x(d.any), cy: y0 + dy, c: gr.c });
        });
      });

      const dots = g.append("g").selectAll("g.ob").data(items).join("g").attr("class", "ob")
        .attr("transform", p => `translate(${p.cx},${p.cy})`)
        .attr("tabindex", "0").attr("role", "button")
        .attr("aria-label", p => `${p.d.obra} (${p.d.anyTxt}): ${p.d.detall}`)
        .style("cursor", "pointer");

      dots.append("circle").attr("class", "halo-c").attr("r", mob ? 9.5 : 12)
        .attr("fill", p => p.c).attr("fill-opacity", p => p.c === C.groc ? .52 : .34)
        .attr("stroke", p => p.d.id === 17 ? C.ink : p.c === C.groc ? C.grocFosc : p.c)
        .attr("stroke-width", p => p.d.id === 17 ? 1.8 : .8)
        .style("mix-blend-mode", "multiply");
      dots.append("circle").attr("r", 2.6).attr("fill", p => p.c === C.groc ? C.ink : p.c);

      // Etiquetes quirúrgiques només per a 4 fites clau (zero encavalcaments)
      const marks = [
        { id: 1, txt: "Ravenna (s. VI)", dx: 8, dy: -16, anc: "start" },
        { id: 4, txt: "Seu d'Urgell (1248)", dx: -4, dy: -18, anc: "middle" },
        { id: 9, txt: "Solsona (1440)", dx: -8, dy: 24, anc: "end" },
        { id: 17, txt: "Leonardo (1498)", dx: 6, dy: -20, anc: "start" },
        { id: 19, txt: "Veronese (1573)", dx: -6, dy: 24, anc: "end" }
      ];
      const gAnn = g.append("g").style("pointer-events", "none");
      if(!mob){
        marks.forEach(mk => {
          const it = items.find(p => p.d.id === mk.id);
          if(!it) return;
          V.t(gAnn, clamp(it.cx + mk.dx, m.l + 12, w - m.r - 12), it.cy + mk.dy, mk.txt, {
            anchor: mk.anc, size: 11.5, weight: mk.id === 17 ? 700 : 600, fill: C.ink, halo: 3
          });
        });
      }

      const defTxt = "<b>20 obres verificades (c. 500–1594):</b> inclou tres obres catalanes (Seu d'Urgell MEV, Solsona MDCS i Jaume Huguet MNAC). Passa o toca qualsevol cercle.";
      if(rd) rd.innerHTML = defTxt;

      const reset = () => {
        dots.interrupt().transition().duration(140).style("opacity", 1);
        gAnn.transition().duration(140).style("opacity", 1);
        if(rd) rd.innerHTML = defTxt;
      };
      const show = (target, p) => {
        dots.interrupt().transition().duration(140).style("opacity", o => o === p ? 1 : .48);
        d3.select(target).raise();
        gAnn.transition().duration(140).style("opacity", .5);
        if(rd) rd.innerHTML = `<b>${p.d.artista} · ${p.d.obra} (${p.d.anyTxt}, ${p.d.lloc}):</b> ${p.d.detall}`;
      };

      outside(node, reset);
      dots.on("pointerenter pointerdown", (ev, p) => show(ev.currentTarget, p))
          .on("focus", (ev, p) => show(ev.currentTarget, p))
          .on("blur", reset)
          .on("pointerleave", ev => { if(ev.pointerType === "mouse") reset(); });

      V.onView(node, instant => {
        if(instant) return;
        dots.style("opacity", 0).transition().delay((d, i) => i * 28).duration(420).style("opacity", 1);
      });
    });

    seg(fig, k => { mode = k; updateLg(); el.__seen = true; M.redraw(); });
  })();

  /* =========================================================================
     V5 · SCROLLY 2 — TALL ESTRATIGRÀFIC I CRONOLOGIA DE FERIDES (#mur-viz)
     ========================================================================= */
  (function initMur(){
    const sec = $("#s-mur"), el = $("#mur-viz"), rd = $("#mur-r");
    const tEl = $("#mur-t"), sEl = $("#mur-s");
    if(!sec || !el) return;
    lg($("#mur-lg"), [
      { c: C.blau, t: "Buon fresco (paret sud) i rescats" },
      { c: C.vermell, t: "A secco (paret nord), ferides i repintades" },
      { c: C.groc, t: "Imprimació de plom / debat original" }
    ]);

    let curStep = 0;
    let updFn = null;

    const STEPS_META = [
      { t: "1 · L'experiment de control: paret sud vs. paret nord", s: "El mateix refectori va posar a prova dues tècniques contràries (1495–1498)" },
      { t: "2 · 1517–1566: el col·lapse abans de complir setanta anys", s: "Testimonis oculars d'Antonio de Beatis (des. 1517) i Giorgio Vasari (maig 1566)" },
      { t: "3 · 1652–1821: porta, raspades, quadra i inundació", s: "Les agressions físiques i les repintades que van enterrar Leonardo" },
      { t: "4 · 1943: una bomba a tres passes de la paret nord", s: "Els sacs de sorra de Gino Chierici salven el mur quan el sostre cau" },
      { t: "5 · 1978–1999: vint-i-un anys de bisturí i el debat del % original", s: "Del ~18–20 % íntegre (Bertelli/Beck) al ~50 % global (Basile/Marani)" }
    ];

    const M = V.mount(el, (node, w) => {
      const mob = w < 560;
      const h = mob ? 350 : 420;
      const s = V.svg(node, w, h, "Comparativa química entre el fresc de Montorfano a la paret sud i la pintura seca de Leonardo a la paret nord, seguida de la cronologia de conservació de 1495 a 1999.");
      const g = s.append("g");

      function drawStep(idx){
        curStep = idx;
        const meta = STEPS_META[idx] || STEPS_META[0];
        if(tEl) tEl.textContent = meta.t;
        if(sEl) sEl.textContent = meta.s;
        g.selectAll("*").remove();

        if(idx === 0){
          // TALL ESTRATIGRÀFIC COMPARAT (HOW-01)
          const pad = mob ? 6 : 28, gap = mob ? 10 : 36;
          const cw = (w - pad * 2 - gap) / 2;
          const xSud = pad, xNord = pad + cw + gap;
          const yBase = 48;

          V.t(g, xSud, yBase - 14, mob ? "Sud · Montorfano" : "Paret sud · Montorfano (1495)", { size: mob ? 11.5 : 14, weight: 700, fill: C.blau });
          V.t(g, xNord, yBase - 14, mob ? "Nord · Leonardo" : "Paret nord · Leonardo (1495–1498)", { size: mob ? 11.5 : 14, weight: 700, fill: C.vermell });

          const shortL = s => {
            if(!mob) return s;
            return s.replace(" (paret sud)", "").replace(" (morter gruixut)", "").replace(" (morter base)", "")
              .replace(" (calç fresca)", "").replace(" química", "").replace("Imprimatura de blanc de plom", "Blanc de plom")
              .replace("Mur prim amb humitat de cuines", "Mur humit (cuines)")
              .replace("Carbonat de calci + magnesi i cola", "Carbonat + cola")
              .replace("Tremp d'ou i oli aplicats a secco", "Tremp i oli a secco");
          };

          let ys = yBase;
          D.estratigrafia.sud.forEach(ly => {
            const lh = ly.gruix * (mob ? 2.4 : 2.9);
            g.append("rect").attr("x", xSud).attr("y", ys).attr("width", cw).attr("height", lh - 2)
              .attr("fill", ly.c).attr("fill-opacity", ly.c === C.blau ? .82 : .55);
            V.t(g, xSud + 7, ys + 17, shortL(ly.nom), { size: mob ? 11 : 12, weight: 700, fill: ly.c === C.blau ? "#FFFFFF" : C.ink });
            if(!mob && lh > 42){
              V.t(g, xSud + 7, ys + 34, ly.desc, { size: 11, fill: ly.c === C.blau ? "#FFFFFF" : C.ink2 });
            }
            ys += lh;
          });

          let yn = yBase;
          D.estratigrafia.nord.forEach(ly => {
            const lh = ly.gruix * (mob ? 2.4 : 2.9);
            g.append("rect").attr("x", xNord).attr("y", yn).attr("width", cw).attr("height", lh - 2)
              .attr("fill", ly.c).attr("fill-opacity", ly.c === C.vermell ? .85 : .68);
            V.t(g, xNord + 7, yn + 17, shortL(ly.nom), { size: mob ? 11 : 12, weight: 700, fill: ly.c === C.vermell ? "#FFFFFF" : C.ink });
            if(!mob && lh > 40){
              V.t(g, xNord + 7, yn + 34, ly.desc, { size: 11, fill: ly.c === C.vermell ? "#FFFFFF" : C.ink2 });
            }
            yn += lh;
          });

          if(rd) rd.innerHTML = "<b>Experiment de control al mateix refectori:</b> el buon fresco de Montorfano a la paret sud va soldar el pigment dins la calç; els retrats Sforza afegits a secco per Leonardo s'hi van esborrar igual que el Cenacolo.";
        } else {
          // CRONOLOGIA QUALITATIVA DE 3 CARRILS (1495–1999, zero dades inventades)
          const hasDebat = idx === 4;
          const m = { t: 42, r: mob ? 18 : 32, b: hasDebat ? 118 : 48, l: mob ? 96 : 148 };
          const x = d3.scaleLinear([1490, 2005], [m.l, w - m.r]);
          const tracks = [
            { k: "rescat",   t: mob ? "Rescats" : "Rescats científics",  c: C.blau,    match: d => d.tipus === "rescat" || d.tipus === "creacio" },
            { k: "testimoni",t: mob ? "Testimonis" : "Testimonis oculars", c: C.groc,   match: d => d.tipus === "deteriorament" },
            { k: "ferida",   t: mob ? "Ferides" : "Ferides i repintades", c: C.vermell, match: d => d.tipus === "ferida" || d.tipus === "repintada" }
          ];
          const rowH = (h - m.t - m.b) / tracks.length;
          const cy = i => m.t + (i + .5) * rowH;

          const ticks = mob ? [1500, 1650, 1800, 1920, 1999] : [1500, 1600, 1700, 1800, 1900, 1999];
          ticks.forEach(t => {
            const tx = x(t);
            g.append("line").attr("x1", tx).attr("x2", tx).attr("y1", m.t - 8).attr("y2", h - m.b)
              .attr("stroke", t === 1943 ? C.vermell : C.grid).attr("stroke-width", .8);
            V.t(g, tx, h - m.b + 18, String(t), { anchor: "middle", size: 11, fill: C.muted });
          });

          tracks.forEach((tr, i) => {
            const y0 = cy(i);
            g.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y0).attr("y2", y0)
              .attr("stroke", C.hair).attr("stroke-width", .7);
            V.t(g, m.l - 10, y0 + 4, tr.t, { anchor: "end", size: mob ? 11 : 12.5, weight: 600, fill: C.ink });
          });

          const cutYear = idx === 1 ? 1570 : idx === 2 ? 1830 : idx === 3 ? 1945 : 2005;
          const pts = D.conservacio.filter(d => d.any <= cutYear).map(d => {
            const ti = tracks.findIndex(tr => tr.match(d));
            return { d, ti, cx: x(d.any), cy: cy(ti), c: tracks[ti].c };
          });

          const evNodes = g.selectAll("g.ev").data(pts).join("g").attr("class", "ev")
            .attr("transform", p => `translate(${p.cx},${p.cy})`)
            .attr("tabindex", "0").attr("role", "button")
            .attr("aria-label", p => `${p.d.anyTxt}: ${p.d.t}. ${p.d.d}`)
            .style("cursor", "pointer");

          evNodes.append("circle").attr("r", mob ? 9.5 : 12).attr("fill", p => p.c)
            .attr("fill-opacity", p => p.c === C.groc ? .52 : .36)
            .attr("stroke", p => p.c === C.groc ? C.grocFosc : p.c).attr("stroke-width", .9)
            .style("mix-blend-mode", "multiply");
          evNodes.append("circle").attr("r", 3).attr("fill", p => p.c === C.groc ? C.ink : p.c);

          // Al pas final (idx === 4), comparem honestament les dues estimacions reals publicades de pintura original
          if(hasDebat){
            const bx0 = m.l, bw = w - m.l - m.r, by = h - 68;
            V.t(g, bx0, by - 14, mob ? "Debat sobre % original supervivent:" : "Debat obert sobre la superfície original supervivent (fonts publicades):", {
              size: mob ? 11 : 12, weight: 700, fill: C.ink
            });
            g.append("rect").attr("x", bx0).attr("y", by).attr("width", bw).attr("height", 14)
              .attr("rx", 2).attr("fill", C.land);
            g.append("rect").attr("x", bx0).attr("y", by).attr("width", bw * 0.50).attr("height", 14)
              .attr("rx", 2).attr("fill", V.alpha(C.blau, .32));
            g.append("rect").attr("x", bx0).attr("y", by).attr("width", bw * 0.20).attr("height", 14)
              .attr("rx", 2).attr("fill", C.vermell).attr("fill-opacity", .72);
            V.t(g, bx0 + bw * 0.20, by + 29, mob ? "~18–20 % íntegre" : "~18–20 % íntegre (Bertelli / Beck)", {
              anchor: "middle", size: 11, weight: 600, fill: C.vermell
            });
            V.t(g, bx0 + bw * 0.50, by + 29, mob ? "~50 % traces" : "~50 % traces (Basile / Marani)", {
              anchor: mob ? "start" : "middle", size: 11, weight: 600, fill: C.blau
            });
          }

          // Anotació del darrer esdeveniment del pas
          const last = pts[pts.length - 1];
          if(last){
            const mobTitle = last.d.t.replace("Restauració de Pinin Brambilla Barcilon", "Brambilla Barcilon (21 anys)")
              .replace("Primer col·lapse documentat (De Beatis)", "De Beatis: «incomincia»")
              .replace("Giorgio Vasari: «una macchia abbagliata»", "Vasari: «macchia abbagliata»")
              .replace("Intent fallit d'arrencada (Stefano Barezzi)", "Intent d'strappo (Barezzi)")
              .replace("Bombardeig aliat de la RAF", "Bombardeig RAF (1943)");
            V.note(g, {
              x: last.cx, y: last.cy,
              tx: last.cx > w * .62 ? last.cx - 18 : last.cx + 18,
              ty: clamp(last.cy - 24, m.t + 10, h - m.b - 28),
              kind: "elbow", anchor: last.cx > w * .62 ? "end" : "start",
              size: mob ? 11 : 12,
              lines: [[last.d.anyTxt, true], [mob ? mobTitle : last.d.t]]
            });
            if(rd) rd.innerHTML = `<b>${last.d.anyTxt} · ${last.d.t}:</b> ${last.d.d}`;
          }

          const showEv = (target, p) => {
            evNodes.style("opacity", o => o === p ? 1 : .48);
            d3.select(target).raise();
            if(rd) rd.innerHTML = `<b>${p.d.anyTxt} · ${p.d.t}:</b> ${p.d.d}`;
          };
          const resetEv = () => {
            evNodes.style("opacity", 1);
            if(last && rd) rd.innerHTML = `<b>${last.d.anyTxt} · ${last.d.t}:</b> ${last.d.d}`;
          };
          evNodes.on("pointerenter pointerdown", (ev, p) => showEv(ev.currentTarget, p))
                 .on("focus", (ev, p) => showEv(ev.currentTarget, p))
                 .on("blur", resetEv)
                 .on("pointerleave", ev => { if(ev.pointerType === "mouse") resetEv(); });
        }
      }

      updFn = drawStep;
      drawStep(curStep);
    });

    if(window.IB && IB.scrolly){
      IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), idx => {
        curStep = idx;
        if(updFn) updFn(idx);
      });
    }
    void M;
  })();

  /* =========================================================================
     V6 · TAULA SEMÀNTICA INTERACTIVA DE MITES VS PROVES (#mites-viz)
     ========================================================================= */
  (function initMites(){
    const fig = $("#f-mites"), el = $("#mites-viz"), rd = $("#mites-r");
    if(!el) return;

    const CAT = {
      esoteric: { t: "Mite esotèric", c: C.vermell },
      art:      { t: "Gir iconogràfic", c: C.groc },
      historic: { t: "Mite històric", c: C.blau }
    };
    lg($("#mites-lg"), [
      { c: C.vermell, t: "Mite esotèric modern" },
      { c: C.blau, t: "Llegenda històrica" },
      { c: C.groc, t: "Cas català sorprenent" }
    ]);

    let filter = "tots";
    const summaryFor = k => {
      if(k === "tots") return "<b>Sis contrastos verificats:</b> passa o toca qualsevol fila per llegir la prova material i arxivística completa.";
      const n = D.mites.filter(d => k === "esoteric" ? d.cat === "esoteric" : d.cat !== "esoteric").length;
      return `<b>Mostrant ${n} de 6 contrastos.</b> Passa o toca qualsevol fila per llegir-ne el detall.`;
    };

    const table = document.createElement("table");
    table.className = "cx-table";
    table.innerHTML = `<caption>Contrast entre mites moderns sobre L'últim sopar i les proves documentals i materials</caption>
      <thead><tr><th scope="col">Detall</th><th scope="col">Mite popular</th><th scope="col">Prova material i documental</th><th scope="col">Tipus</th></tr></thead>`;
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    el.appendChild(table);

    const rows = [];
    const reset = () => {
      table.classList.remove("dimmed");
      rows.forEach(r => r.classList.remove("is-hi"));
      if(rd) rd.innerHTML = summaryFor(filter);
    };
    outside(el, reset);

    D.mites.forEach(d => {
      const tr = document.createElement("tr");
      tr.dataset.cat = d.cat;
      tr.tabIndex = 0;
      const g = CAT[d.cat];
      tr.innerHTML = `<th scope="row">${d.k}</th><td class="cx-myth">${d.mite}</td><td class="cx-hist">${d.real}<span class="cx-src">${d.src}</span></td><td><span class="cx-deg"><i style="background:${g.c}"></i>${g.t}</span></td>`;
      const hi = () => {
        table.classList.add("dimmed");
        rows.forEach(r => r.classList.toggle("is-hi", r === tr));
        if(rd) rd.innerHTML = `<b>${d.k}:</b> ${d.real} <i>(${d.src})</i>`;
      };
      tr.addEventListener("pointerenter", hi);
      tr.addEventListener("pointerdown", hi);
      tr.addEventListener("focus", hi);
      tr.addEventListener("blur", reset);
      tr.addEventListener("pointerleave", ev => { if(ev.pointerType === "mouse") reset(); });
      tbody.appendChild(tr);
      rows.push(tr);
    });

    if(rd) rd.innerHTML = summaryFor("tots");
    seg(fig, k => {
      filter = k;
      reset();
      rows.forEach(r => {
        const show = k === "tots" || (k === "esoteric" ? r.dataset.cat === "esoteric" : r.dataset.cat !== "esoteric");
        r.hidden = !show;
      });
      if(rd) rd.innerHTML = summaryFor(k);
    });
  })();
})();
