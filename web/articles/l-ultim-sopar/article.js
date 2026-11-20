/* «L'últim sopar de Leonardo» · 6 visualitzacions del sistema infogràfic (IBV + d3 7.9.0)
   V1 (#taula-viz):    Scrollytelling 1 · HOW-01 planta + alçat: els 13 comensals es mouen d'una taula a l'altra (4 passos).
   V2 (#textos-viz):   CASE-06 Matriu de signes (5 textos + Leonardo) amb fils cap als versicles que Leonardo agafa.
   V3 (#cenacolo-viz): MAP-15 Comparador Leonardo (1498) vs Giampietrino (c. 1515–1520) + 3 capes d'anàlisi.
   V4 (#cataleg-viz):  CASE-04 + TIME: 20 pictogrames de taula en planta sobre l'eix del temps (c. 500–1594, 3 lents).
   V5 (#mur-viz):      Scrollytelling 2 · HOW-01 tall de capes, mural real amb ferides, pla del 1943, PART 100 cel·les + cronologia.
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
     HOW-01 en planta + alçat. Els tretze comensals són sempre els mateixos
     cossos: en cada pas es mouen, s'aixequen o perden l'aurèola (no es redibuixa en sec).
     ========================================================================= */
  (function initTaula(){
    const sec = $("#s-taula"), el = $("#taula-viz"), rd = $("#taula-r");
    const tEl = $("#taula-t"), sEl = $("#taula-s");
    if(!sec || !el) return;
    lg($("#taula-lg"), [
      { c: C.ink, t: "Jesús" },
      { c: C.blue, t: "Deixebles" },
      { c: C.yellow, t: "Joan" },
      { c: C.red, t: "Judes Iscariot" }
    ]);

    // Identitats fixes (ordre del fris de Leonardo, d'esquerra a dreta)
    const IDS = D.cenacolo.personatges.map(p => p.id);           // 13
    const NOM = Object.fromEntries(D.cenacolo.personatges.map(p => [p.id, p.nom.split(" · ")[1]]));
    const colOf = id => id === "crist" ? C.ink : id === "joan" ? C.yellow : id === "judes" ? C.red : C.blue;
    const OTHERS = IDS.filter(id => !["crist", "joan", "judes"].includes(id));

    // Cada pas: posició del cap (x,y), angle del cos (graus, del cap cap als peus), postura i aurèola
    const R = (x, y, a) => ({ x, y, a, kind: "rec" });
    const S = (x, y, a) => ({ x, y, a, kind: "seat" });
    function place(slots, special){            // special: {crist: i, joan: j, judes: k} índex de seient
      const out = {}; let o = 0;
      slots.forEach((s, i) => {
        const id = Object.keys(special).find(k => special[k] === i) || OTHERS[o++];
        out[id] = s;
      });
      return out;
    }
    const L0 = place([
      R(-112, -86, -122), R(-56, -86, -122), R(0, -86, -122), R(52, -84, -122), R(108, -86, -122),
      R(-100, -38, -160), R(-100, 2, -160), R(-100, 42, -160), R(-100, 82, -160),
      R(100, -38, -20), R(100, 2, -20), R(100, 42, -20), R(100, 82, -20)
    ], { judes: 1, crist: 2, joan: 3 });
    const L1 = place(d3.range(13).map(i => {
      const a = (-88 + i * 176 / 12) * Math.PI / 180;
      const r = 118;
      return R(Math.sin(a) * r, 52 - Math.cos(a) * r, Math.atan2(-Math.cos(a), Math.sin(a)) * 180 / Math.PI - 14);
    }), { crist: 0, joan: 1, judes: 6 });
    const xs12 = d3.range(12).map(i => -206 + i * 412 / 11);
    const L2 = place([
      ...xs12.map(x => S(x, -46, -90)),
      S(0, 64, 90)
    ], { crist: 6, joan: 5, judes: 12 });
    L2.joan = S(xs12[5] + 10, -30, -40);       // Joan adormit sobre el pit de Jesús
    const xs13 = [-206, -176, -146, -104, -78, -50, 0, 50, 80, 110, 150, 180, 210];
    const L3 = {};
    IDS.forEach((id, i) => { L3[id] = S(xs13[i], id === "judes" ? -30 : -44, -90); });
    L3.joan = S(xs13[5], -40, -112);           // s'inclina cap a Pere
    L3.pere = S(xs13[4], -50, -70);
    const LAY = [L0, L1, L2, L3];
    const HALO = [false, false, true, false];  // aurèoles visibles només a la taula medieval

    const ROLE = [
      { crist: "Jesús, al lloc d'honor del divan central", joan: "Joan, «recolzat al pit de Jesús» (Jn 13,23): el veí de davant en un llit reclinat", judes: "Judes, a tocar de Jesús: pot rebre el bocí de la seva mà (Jn 13,26)", altre: "Deixeble reclinat sobre el colze esquerre, peus cap enfora (Jn 13,5)" },
      { crist: "Jesús a l'extrem esquerre del sigma, el lloc d'honor romà", joan: "Joan, al costat de Jesús", judes: "Judes, encara dins el semicercle", altre: "Deixeble reclinat al llit semicircular (stibadium)" },
      { crist: "Jesús al centre, amb aurèola", joan: "Joan adormit sobre el pit de Jesús, motiu medieval de Jn 13,23", judes: "Judes sol al costat de davant, sense aurèola", altre: "Apòstol assegut darrere la taula, amb aurèola" },
      { crist: "Jesús: centre del triangle i punt de fuga de la perspectiva", joan: "Joan s'aparta de Jesús i s'inclina cap a Pere", judes: "Judes, dins el grup però reculat a l'ombra, amb la bossa", altre: null }
    ];

    // Alçat: perfil d'una persona reclinada o asseguda
    function drawElev(gE, x0, base, kind, k){
      const s = v => v * k;
      const st = { fill: "none", stroke: C.ink2, "stroke-width": Math.max(3, 6 * k), "stroke-linecap": "round", "stroke-linejoin": "round" };
      const P = (d, o) => { const p = gE.append("path").attr("d", d); Object.entries(Object.assign({}, st, o || {})).forEach(([a, v]) => p.attr(a, v)); return p; };
      if(kind === "rec"){
        gE.append("rect").attr("x", x0).attr("y", base - s(16)).attr("width", s(150)).attr("height", s(16)).attr("rx", s(3))
          .attr("fill", C.land).attr("stroke", C.hair);
        gE.append("rect").attr("x", x0 - s(58)).attr("y", base - s(26)).attr("width", s(46)).attr("height", s(4)).attr("fill", C.ink2);
        gE.append("rect").attr("x", x0 - s(50)).attr("y", base - s(22)).attr("width", s(3)).attr("height", s(22)).attr("fill", C.ink2);
        gE.append("rect").attr("x", x0 - s(20)).attr("y", base - s(22)).attr("width", s(3)).attr("height", s(22)).attr("fill", C.ink2);
        gE.append("circle").attr("cx", x0 - s(40)).attr("cy", base - s(30)).attr("r", s(5)).attr("fill", C.ghost);
        P(`M${x0 + s(18)},${base - s(40)} L${x0 + s(70)},${base - s(24)} L${x0 + s(146)},${base - s(22)}`);
        P(`M${x0 + s(22)},${base - s(38)} L${x0 + s(26)},${base - s(18)} L${x0 + s(42)},${base - s(18)}`);
        P(`M${x0 + s(18)},${base - s(38)} L${x0 - s(10)},${base - s(32)}`, { "stroke-width": Math.max(2.4, 4.4 * k) });
        gE.append("circle").attr("cx", x0 + s(12)).attr("cy", base - s(50)).attr("r", s(8)).attr("fill", C.ink2);
      } else {
        // banc sota la figura i taula alta al davant (a la dreta)
        gE.append("rect").attr("x", x0 - s(14)).attr("y", base - s(26)).attr("width", s(52)).attr("height", s(5)).attr("fill", C.land).attr("stroke", C.hair);
        gE.append("rect").attr("x", x0 - s(10)).attr("y", base - s(21)).attr("width", s(4)).attr("height", s(21)).attr("fill", C.hair);
        gE.append("rect").attr("x", x0 + s(30)).attr("y", base - s(21)).attr("width", s(4)).attr("height", s(21)).attr("fill", C.hair);
        gE.append("rect").attr("x", x0 + s(46)).attr("y", base - s(44)).attr("width", s(84)).attr("height", s(5)).attr("fill", C.ink2);
        gE.append("rect").attr("x", x0 + s(54)).attr("y", base - s(39)).attr("width", s(4)).attr("height", s(39)).attr("fill", C.ink2);
        gE.append("rect").attr("x", x0 + s(118)).attr("y", base - s(39)).attr("width", s(4)).attr("height", s(39)).attr("fill", C.ink2);
        gE.append("circle").attr("cx", x0 + s(96)).attr("cy", base - s(49)).attr("r", s(5)).attr("fill", C.ghost);
        P(`M${x0 + s(14)},${base - s(72)} L${x0 + s(12)},${base - s(30)} L${x0 + s(50)},${base - s(30)} L${x0 + s(52)},${base - s(2)}`);
        P(`M${x0 + s(14)},${base - s(64)} L${x0 + s(40)},${base - s(52)} L${x0 + s(68)},${base - s(50)}`, { "stroke-width": Math.max(2.4, 4.4 * k) });
        gE.append("circle").attr("cx", x0 + s(16)).attr("cy", base - s(84)).attr("r", s(8)).attr("fill", C.ink2);
      }
    }

    let curStep = 0, updFn = null;

    V.mount(el, (node, w) => {
      const mob = w < 560;
      const hPlan = mob ? 212 : 380, hEl = mob ? 64 : 112;
      const h = hPlan + hEl;
      const s = V.svg(node, w, h, "Planta i alçat esquemàtics de com seien els tretze comensals: del triclinium reclinat de Jerusalem al fris de Leonardo.");
      const k = Math.min(w / 560, hPlan / 360);
      const cx = w / 2, cy = hPlan * 0.54;
      const sx = x => cx + x * k, sy = y => cy + y * k;

      const gFurn = s.append("g"), gLight = s.append("g"), gFood = s.append("g");
      const gFig = s.append("g"), gNote = s.append("g").style("pointer-events", "none");
      const gEl = s.append("g");
      // separació planta / alçat
      s.append("line").attr("x1", 0).attr("x2", w).attr("y1", hPlan + 4).attr("y2", hPlan + 4).attr("stroke", C.grid);
      V.t(s, 0, hPlan + 22, "Alçat", { size: 12, italic: true, fill: C.ink2 });
      V.t(s, 0, 14, "Planta", { size: 12, italic: true, fill: C.ink2 });

      // --- Figures (persistents) ---
      const figs = gFig.selectAll("g.fg").data(IDS).join("g").attr("class", "fg")
        .attr("tabindex", "0").attr("role", "button").style("cursor", "pointer");
      figs.append("circle").attr("class", "nimbus").attr("r", 13 * k)
        .attr("fill", V.alpha(C.yellow, .55)).attr("stroke", C.yellowDark).attr("stroke-width", .6);
      figs.append("ellipse").attr("class", "body")
        .attr("fill", id => colOf(id)).attr("fill-opacity", id => id === "joan" ? .7 : id === "crist" ? .3 : .34)
        .attr("stroke", id => id === "joan" ? C.yellowDark : colOf(id)).attr("stroke-width", .8)
        .style("mix-blend-mode", "multiply");
      figs.append("circle").attr("class", "head").attr("r", id => (id === "crist" ? 7.6 : 6.6) * k)
        .attr("fill", id => id === "joan" ? C.yellow : colOf(id)).attr("stroke", id => id === "joan" ? C.ink : "none").attr("stroke-width", .8);

      const bodyAttrs = st => st.kind === "rec"
        ? { cx: 26 * k, rx: 26 * k, ry: 8 * k }
        : { cx: 4 * k, rx: 6 * k, ry: 12 * k };
      function placeFigs(idx, animate){
        const L = LAY[idx];
        const sel = animate ? figs.transition("pos").duration(dur(1100)).ease(ease) : figs;
        sel.attr("transform", id => `translate(${sx(L[id].x)},${sy(L[id].y)}) rotate(${L[id].a})`);
        const b = figs.select("ellipse.body");
        (animate ? b.transition("pos").duration(dur(1100)).ease(ease) : b)
          .attr("cx", id => bodyAttrs(L[id]).cx).attr("rx", id => bodyAttrs(L[id]).rx).attr("ry", id => bodyAttrs(L[id]).ry);
        const nb = figs.select("circle.nimbus");
        (animate ? nb.transition("nim").duration(dur(800)) : nb)
          .attr("opacity", id => HALO[idx] && id !== "judes" ? 1 : 0);
      }

      // --- Mobles i menjar de cada pas ---
      const bread = (g, x, y, r) => g.append("ellipse").attr("cx", sx(x)).attr("cy", sy(y)).attr("rx", r * k).attr("ry", r * .72 * k)
        .attr("fill", C.yellowLight).attr("stroke", C.yellowDark).attr("stroke-width", .7);
      const cup = (g, x, y, r, glass) => g.append("circle").attr("cx", sx(x)).attr("cy", sy(y)).attr("r", r * k)
        .attr("fill", glass ? "none" : C.ghost).attr("stroke", glass ? C.blue : C.ink2).attr("stroke-width", glass ? 1 : .8).attr("stroke-opacity", glass ? .8 : 1);
      const fish = (g, x, y, len, rot) => {
        const f = g.append("g").attr("transform", `translate(${sx(x)},${sy(y)}) rotate(${rot || 0}) scale(${k})`);
        f.append("path").attr("d", `M${-len / 2},0 Q0,${-len * .32} ${len / 2},0 Q0,${len * .32} ${-len / 2},0 Z M${len / 2},0 L${len / 2 + 7},-5 L${len / 2 + 7},5 Z`)
          .attr("fill", C.blueLight).attr("stroke", C.blue).attr("stroke-width", .8 / k);
        return f;
      };
      const plate = (g, x, y, r) => g.append("circle").attr("cx", sx(x)).attr("cy", sy(y)).attr("r", r * k).attr("fill", "none").attr("stroke", C.ghost).attr("stroke-width", 1);
      const wine = (g, x, y, r) => g.append("circle").attr("cx", sx(x)).attr("cy", sy(y)).attr("r", r * k).attr("fill", C.redLight).attr("stroke", C.red).attr("stroke-width", .7);

      function furniture(idx){
        const gF = gFurn.append("g").attr("class", "st"), gM = gFood.append("g").attr("class", "st"), gL = gLight.append("g").attr("class", "st");
        const couch = { fill: C.land, stroke: C.hair };
        const ap = (g, tag, o) => { const n = g.append(tag); Object.entries(o).forEach(([a, v]) => n.attr(a, v)); return n; };
        if(idx === 0){
          ap(gF, "rect", Object.assign({ x: sx(-150), y: sy(-150), width: 300 * k, height: 78 * k, rx: 6 * k }, couch));
          ap(gF, "rect", Object.assign({ x: sx(-172), y: sy(-72), width: 78 * k, height: 186 * k, rx: 6 * k }, couch));
          ap(gF, "rect", Object.assign({ x: sx(94), y: sy(-72), width: 78 * k, height: 186 * k, rx: 6 * k }, couch));
          ap(gF, "rect", { x: sx(-70), y: sy(-58), width: 140 * k, height: 128 * k, rx: 3 * k, fill: "none", stroke: C.ink2, "stroke-width": 1 });
          plate(gM, 0, 6, 26); wine(gM, 0, 6, 15);
          bread(gM, -38, -30, 9); bread(gM, 36, 40, 9); bread(gM, 40, -28, 8);
          cup(gM, -44, 30, 6); cup(gM, -24, 50, 6); cup(gM, 50, 10, 6);
          if(!mob) V.t(gF, sx(0), sy(104), "costat obert per servir", { anchor: "middle", size: 11, italic: true, fill: C.muted });
        } else if(idx === 1){
          const arcO = d3.arc().innerRadius(100 * k).outerRadius(150 * k).startAngle(-Math.PI * .58).endAngle(Math.PI * .58);
          ap(gF, "path", Object.assign({ d: arcO(), transform: `translate(${sx(0)},${sy(52)})` }, couch));
          const arcT = d3.arc().innerRadius(0).outerRadius(92 * k).startAngle(-Math.PI * .5).endAngle(Math.PI * .5);
          ap(gF, "path", { d: arcT(), transform: `translate(${sx(0)},${sy(52)})`, fill: "none", stroke: C.ink2, "stroke-width": 1 });
          gM.append("ellipse").attr("cx", sx(0)).attr("cy", sy(14)).attr("rx", 46 * k).attr("ry", 24 * k).attr("fill", "none").attr("stroke", C.ink2).attr("stroke-width", .9);
          fish(gM, -14, 10, 30, -8); fish(gM, 16, 20, 30, 172);
          [[-56, 34], [-30, -14], [36, -12], [58, 34], [0, 42]].forEach(([x, y]) => bread(gM, x, y, 8));
        } else {
          const leo = idx === 3;
          const W = leo ? 470 : 450;
          ap(gF, "rect", { x: sx(-W / 2), y: sy(-24), width: W * k, height: 50 * k, rx: 2, fill: "none", stroke: C.ink2, "stroke-width": 1 });
          if(!leo){
            ap(gF, "rect", Object.assign({ x: sx(-W / 2 - 8), y: sy(-64), width: (W + 16) * k, height: 20 * k, rx: 3 }, couch));
            ap(gF, "rect", Object.assign({ x: sx(-22), y: sy(76), width: 44 * k, height: 16 * k, rx: 3 }, couch));
            d3.range(-180, 200, 72).forEach((x, i) => { plate(gM, x + 14, 2, 9); if(i % 2 === 0) bread(gM, x - 6, 8, 6); else cup(gM, x - 4, -6, 4.5); });
            plate(gM, -12, 2, 16); fish(gM, -12, 2, 22, 0);
            wine(gM, 34, -4, 6);
          } else {
            ap(gF, "rect", Object.assign({ x: sx(-W / 2 - 8), y: sy(-64), width: (W + 16) * k, height: 20 * k, rx: 3 }, couch));
            xs13.forEach((x, i) => {
              if(i === 6) return;
              plate(gM, x + 6, 0, 7.5);
              cup(gM, x - 8, -12, 3.8, true);
              if(i % 3 === 1) bread(gM, x + 4, 14, 5.5);
            });
            plate(gM, -128, 10, 12); fish(gM, -128, 10, 16, 20);
            plate(gM, 128, 10, 12); fish(gM, 128, 10, 16, -20);
            [[-122, 2], [-136, 14], [134, 2], [122, 15]].forEach(([x, y]) =>
              gM.append("circle").attr("cx", sx(x)).attr("cy", sy(y)).attr("r", 2.6 * k).attr("fill", C.yellow).attr("stroke", C.yellowDark).attr("stroke-width", .5));
            gM.append("rect").attr("x", sx(-104)).attr("y", sy(-4)).attr("width", 7 * k).attr("height", 4 * k).attr("fill", C.ghost)
              .attr("transform", `rotate(60,${sx(-100)},${sy(-2)})`);
            bread(gM, -12, 8, 5.5); cup(gM, 14, -10, 4, true);
            // perspectiva: les línies del sostre convergeixen al cap de Jesús
            const vx = sx(0), vy = sy(-44);
            [[-280, -170], [280, -170], [-280, 150], [280, 150], [-280, -10], [280, -10]].forEach(([x, y]) =>
              gL.append("line").attr("x1", sx(x)).attr("y1", sy(y)).attr("x2", vx).attr("y2", vy)
                .attr("stroke", C.red).attr("stroke-width", .7).attr("stroke-opacity", .55).attr("stroke-dasharray", "3 4"));
            // llum de les finestres reals (oest, a l'esquerra)
            d3.range(5).forEach(i => gL.append("line")
              .attr("x1", sx(-262)).attr("y1", sy(-112 + i * 30)).attr("x2", sx(-226)).attr("y2", sy(-92 + i * 30))
              .attr("stroke", C.yellow).attr("stroke-width", 7 * k).attr("stroke-opacity", .45).attr("stroke-linecap", "round"));
          }
        }
        return [gF, gM, gL];
      }

      function notes(idx){
        gNote.selectAll("*").remove();
        const sz = mob ? 11 : 12.5;
        const L = LAY[idx];
        if(idx === 0){
          V.note(gNote, { x: sx(L.joan.x + 4), y: sy(L.joan.y + 6), tx: sx(mob ? 40 : 186), ty: sy(mob ? 140 : -166), kind: "curve", bend: 14, size: sz, anchor: "start",
            lines: mob ? [["Joan al pit de Jesús", true]] : [["Joan al pit de Jesús", true], ["Jn 13,23: el veí de davant al divan"]] });
          if(!mob) V.note(gNote, { x: sx(-150), y: sy(-150), tx: sx(-262), ty: sy(-160), kind: "straight", size: sz, anchor: "start",
            lines: [["Triclinium", true], ["tres divans en U"]] });
        } else if(idx === 1){
          V.note(gNote, { x: sx(L.crist.x - 6), y: sy(L.crist.y), tx: sx(mob ? -170 : -250), ty: sy(mob ? -60 : -40), kind: "curve", bend: 10, size: sz, anchor: "start",
            lines: mob ? [["Jesús a l'extrem", true]] : [["Jesús a l'extrem esquerre", true], ["lloc d'honor del sigma"]] });
          V.note(gNote, { x: sx(0), y: sy(14), tx: sx(mob ? 46 : 150), ty: sy(mob ? 130 : 130), kind: "curve", bend: -16, size: sz, anchor: "start",
            lines: [["Pa i dos peixos", true]].concat(mob ? [] : [["mosaic de Sant'Apollinare Nuovo"]]) });
        } else if(idx === 2){
          V.note(gNote, { x: sx(L.judes.x + 10), y: sy(L.judes.y + 4), tx: sx(mob ? 60 : 90), ty: sy(mob ? 120 : 112), kind: "curve", bend: -12, size: sz, anchor: "start",
            lines: mob ? [["Judes, sol i sense aurèola", true]] : [["Judes, sol al davant", true], ["sense aurèola: Castagno, Ghirlandaio"]] });
          V.note(gNote, { x: sx(L.joan.x), y: sy(L.joan.y - 4), tx: sx(mob ? -60 : -130), ty: sy(mob ? -130 : -128), kind: "curve", bend: 12, size: sz, anchor: "end",
            lines: [["Joan adormit", true]].concat(mob ? [] : [["sobre el pit de Jesús"]]) });
        } else {
          V.note(gNote, { x: sx(0), y: sy(-52), tx: sx(mob ? 40 : 70), ty: sy(mob ? -132 : -142), kind: "curve", bend: -10, size: sz, anchor: "start",
            lines: mob ? [["Punt de fuga: Jesús", true]] : [["Totes les línies van a Jesús", true], ["el clau del punt de fuga, a la templa"]] });
          V.note(gNote, { x: sx(L.judes.x), y: sy(L.judes.y + 8), tx: sx(mob ? -60 : -70), ty: sy(mob ? 116 : 112), kind: "curve", bend: 14, size: sz, anchor: "end",
            lines: mob ? [["Judes, dins el grup", true]] : [["Judes, dins el grup", true], ["aïllat només per l'ombra"]] });
          if(!mob) V.note(gNote, { x: sx(-244), y: sy(-104), tx: sx(-268), ty: sy(-160), kind: "straight", size: sz, anchor: "start",
            lines: [["Llum de l'oest", true], ["com les finestres de la sala"]] });
        }
      }

      function elev(idx, animate){
        const old = gEl.selectAll("g.ev");
        if(animate) old.transition().duration(dur(300)).style("opacity", 0).remove(); else old.remove();
        const g = gEl.append("g").attr("class", "ev");
        const kE = mob ? .52 : 1, base = h - (mob ? 6 : 10);
        const kind = idx < 2 ? "rec" : "seat";
        drawElev(g, (mob ? 96 : 170), base, kind, kE);
        const txt = kind === "rec"
          ? [["Reclinat sobre el colze esquerre", true], ["taula baixa, mà dreta lliure per menjar"]]
          : [["Assegut en un banc", true], ["taula alta de cavallets, a l'europea"]];
        V.lines(g, mob ? 186 : 380, base - (mob ? 40 : 60), mob ? [txt[0]] : txt, { size: mob ? 11.5 : 12.5 });
        if(animate) g.style("opacity", 0).transition().delay(dur(200)).duration(dur(500)).style("opacity", 1);
      }

      function setReadout(idx){
        const et = D.etapesTaula[idx];
        if(rd) rd.innerHTML = `<b>${et.titol}:</b> ${et.detall}`;
      }

      function drawStep(idx, animate){
        const et = D.etapesTaula[idx] || D.etapesTaula[0];
        if(tEl) tEl.textContent = et.titol;
        if(sEl) sEl.textContent = et.sub;
        setReadout(idx);
        [gFurn, gFood, gLight].forEach(g => {
          const old = g.selectAll("g.st");
          if(animate) old.transition().duration(dur(400)).style("opacity", 0).remove(); else old.remove();
        });
        const fresh = furniture(idx);
        if(animate) fresh.forEach(g => g.style("opacity", 0).transition().delay(dur(350)).duration(dur(700)).style("opacity", 1));
        placeFigs(idx, animate);
        gNote.interrupt().style("opacity", animate ? 0 : 1);
        notes(idx);
        if(animate) gNote.transition().delay(dur(900)).duration(dur(400)).style("opacity", 1);
        elev(idx, animate);
      }

      // hover: quin comensal és
      const roleTxt = (id) => {
        const r = ROLE[curStep];
        if(id === "crist" || id === "joan" || id === "judes") return r[id];
        return r.altre || `${NOM[id]}: ${D.cenacolo.personatges.find(p => p.id === id).det}`;
      };
      const show = (ev, id) => {
        V.focus(figs, d => d === id);
        d3.select(ev.currentTarget).raise().select("circle.head").attr("stroke", C.ink).attr("stroke-width", 1.5);
        if(rd) rd.innerHTML = `<b>${curStep === 3 || ["crist", "joan", "judes"].includes(id) ? NOM[id] : "Deixeble"}:</b> ${roleTxt(id)}`;
      };
      const hide = () => {
        V.focus(figs, null);
        figs.select("circle.head").attr("stroke", id => id === "joan" ? C.ink : "none").attr("stroke-width", .8);
        setReadout(curStep);
      };
      outside(node, hide);
      figs.on("pointerenter pointerdown", show).on("focus", show).on("blur", hide)
          .on("pointerleave", ev => { if(ev.pointerType === "mouse") hide(); });

      updFn = i => { if(i === curStep) return; curStep = i; drawStep(i, true); };
      drawStep(curStep, false);
      V.onView(node, inst => {
        if(inst) return;
        figs.style("opacity", 0).transition("in").delay((d, i) => 120 + i * 45).duration(500).style("opacity", 1);
      });
    });

    if(window.IB && IB.scrolly){
      IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), idx => {
        if(updFn) updFn(idx); else curStep = idx;
      });
    }
  })();

  /* =========================================================================
     V2 · CASE-06 — MATRIU DE CINC TEXTOS + LEONARDO, AMB ELS FILS DEL MUNTATGE (#textos-viz)
     Cada cel·la és un signe (ple = hi és, buit = hi falta, mig = debat). Leonardo
     queda separat per catorze segles i uns fils vermells el lliguen als versicles que va agafar.
     ========================================================================= */
  (function initTextos(){
    const fig = $("#f-textos"), el = $("#textos-viz"), rd = $("#textos-r");
    if(!el) return;
    lg($("#textos-lg"), [
      { c: C.blue, t: "Hi és" },
      { c: C.red, t: "Hi falta o el contradiu" },
      { c: C.yellow, t: "Debat o síntesi" },
      { c: C.red, t: "Leonardo ho agafa d'aquí", k: "ln" }
    ]);

    let mode = "tot";
    const MOB_COL = { "1co": "1 Co", "mc": "Mc", "mt": "Mt", "lc": "Lc", "jn": "Jn", "leo": "Leo" };
    const MOB_ROW = { pasqua: "Pasqua", postura: "Postura", rentament: "Peus", eucaristia: "Pa i vi",
      anamnesis: "Memòria", judes: "Judes", plat: "Plat", pere_joan: "Pere/Joan", comensals: "Sala" };

    function glyph(g, x, y, st, r){
      if(st === "si"){
        g.append("circle").attr("cx", x).attr("cy", y).attr("r", r).attr("fill", C.blue).attr("fill-opacity", .85);
      } else if(st === "no"){
        g.append("circle").attr("cx", x).attr("cy", y).attr("r", r - .6).attr("fill", "none").attr("stroke", C.red).attr("stroke-width", 1.4);
        g.append("line").attr("x1", x - r * .62).attr("y1", y + r * .62).attr("x2", x + r * .62).attr("y2", y - r * .62).attr("stroke", C.red).attr("stroke-width", 1.4);
      } else {
        g.append("circle").attr("cx", x).attr("cy", y).attr("r", r - .6).attr("fill", "none").attr("stroke", C.yellowDark).attr("stroke-width", 1.2);
        g.append("path").attr("d", `M${x},${y - r + .6} A${r - .6},${r - .6} 0 0 0 ${x},${y + r - .6} Z`).attr("fill", C.yellow);
      }
    }

    const M = V.mount(el, (node, w) => {
      const mob = w < 640;
      const rows = D.textosVars.filter(r => mode === "tot" ? true : mode === "div" ? r.divergencia : r.fontLeo);
      const cols = D.textosCols;
      const ml = mob ? 70 : 168, mr = 6, mt = mob ? 54 : 70, mb = 22;
      const gap = mob ? 22 : 54;                                  // el salt de catorze segles
      const cw = (w - ml - mr - gap) / cols.length;
      const colX = ci => ml + ci * cw + (ci === 5 ? gap : 0);
      const ch = mob ? 40 : 46, cellH = mob ? 28 : 30;
      const h = mt + rows.length * ch + mb;
      const s = V.svg(node, w, h, "Matriu entre les cinc versions del Nou Testament i el mural de Leonardo en nou elements del sopar, amb fils que lliguen cada decisió de Leonardo al versicle d'on surt.");
      const g = s.append("g");

      // Capçaleres
      cols.forEach((col, ci) => {
        const x = colX(ci) + cw / 2;
        V.t(g, x, mt - (mob ? 26 : 34), mob ? MOB_COL[col.id] : col.nom, { anchor: "middle", size: mob ? 12 : 13.5, weight: 700, fill: col.id === "leo" ? C.red : C.ink, serif: !mob });
        V.t(g, x, mt - (mob ? 12 : 16), mob ? col.meta.replace(/^Pau · /, "").replace(" dC", "").replace("Milà · ", "") : col.meta, { anchor: "middle", size: 11, fill: C.muted });
      });
      // eix del temps fi sota les capçaleres dels textos i salt fins a Leonardo
      const yAx = mt - 6;
      g.append("line").attr("x1", colX(0) + 8).attr("x2", colX(4) + cw - 8).attr("y1", yAx).attr("y2", yAx).attr("stroke", C.hair);
      const bx = colX(5) - gap / 2;
      g.append("path").attr("d", `M${bx - 5},${yAx + 5} L${bx - 1},${yAx - 5} M${bx + 1},${yAx + 5} L${bx + 5},${yAx - 5}`).attr("stroke", C.muted).attr("fill", "none");
      if(!mob) V.t(g, bx, mt + rows.length * ch + 16, "1.400 anys", { anchor: "middle", size: 11, italic: true, fill: C.muted });
      g.append("line").attr("x1", bx).attr("x2", bx).attr("y1", mt).attr("y2", mt + rows.length * ch).attr("stroke", C.hair).attr("stroke-dasharray", "2 4");

      // Files
      const rowG = g.append("g").selectAll("g.rw").data(rows).join("g").attr("class", "rw")
        .attr("transform", (r, ri) => `translate(0,${mt + ri * ch})`);
      rowG.append("line").attr("x1", mob ? 0 : 8).attr("x2", w - mr).attr("y1", ch).attr("y2", ch).attr("stroke", C.grid);
      rowG.each(function(r){
        V.t(d3.select(this), ml - 10, ch / 2 + 4, mob ? MOB_ROW[r.id] : r.nom, { anchor: "end", size: mob ? 11 : 12.5, weight: 600, fill: C.ink });
      });

      // Fils de Leonardo (sota les cel·les)
      const gThreads = g.append("g").style("pointer-events", "none");
      const threads = [];
      rows.forEach((r, ri) => {
        if(!r.fontLeo) return;
        const yb = mt + ri * ch + ch / 2 + cellH / 2 - 2;
        const xL = colX(5) + (mob ? cw / 2 : 16);
        r.c.forEach((cell, ci) => {
          if(ci > 4 || cell.s !== "si") return;
          const xS = colX(ci) + (mob ? cw / 2 : 16);
          threads.push({ r, ci, d: `M${xL},${yb} C${xL - 20},${yb + 15} ${xS + 20},${yb + 15} ${xS},${yb}`, xS, yb });
        });
      });
      const thr = gThreads.selectAll("path").data(threads).join("path").attr("d", t => t.d)
        .attr("fill", "none").attr("stroke", C.red).attr("stroke-width", 1.3).attr("stroke-opacity", .7);
      gThreads.selectAll("circle").data(threads).join("circle").attr("cx", t => t.xS).attr("cy", t => t.yb).attr("r", 2.2).attr("fill", C.red);

      // Cel·les
      const cells = [];
      rows.forEach((r, ri) => r.c.forEach((cell, ci) => cells.push({ ri, ci, r, col: cols[ci], cell })));
      const cellG = g.append("g").selectAll("g.mc").data(cells).join("g").attr("class", "mc")
        .attr("transform", d => `translate(${colX(d.ci)},${mt + d.ri * ch + (ch - cellH) / 2})`)
        .attr("tabindex", "0").attr("role", "button")
        .attr("aria-label", d => `${d.r.nom}, ${d.col.nom}: ${d.cell.v}. ${d.cell.d}`)
        .style("cursor", "pointer");
      cellG.append("rect").attr("class", "hit").attr("x", 1).attr("y", 0).attr("width", cw - 2).attr("height", cellH)
        .attr("fill", "transparent").attr("stroke", "none").attr("rx", 3);
      cellG.each(function(d){
        const c = d3.select(this);
        const gx = mob ? cw / 2 : 16;
        glyph(c, gx, cellH / 2, d.cell.s, mob ? 6.5 : 6);
        if(!mob){
          const maxCh = Math.floor((cw - 32) / 6.1);
          const txt = d.cell.v.length > maxCh ? d.cell.v.slice(0, maxCh - 1) + "…" : d.cell.v;
          V.t(c, 28, cellH / 2 + 4, txt, { size: 11.5, fill: d.cell.s === "si" ? C.ink : C.ink2, weight: d.col.id === "leo" ? 600 : 400 });
        }
      });

      const defTxt = "<b>Cinc textos i un mural:</b> passa o toca una cel·la per llegir el versicle o la decisió de Leonardo. Els fils vermells marquen d'on va treure cada detall.";
      if(rd) rd.innerHTML = defTxt;
      const reset = () => {
        V.focus(cellG, null);
        thr.interrupt().attr("stroke-opacity", .7).attr("stroke-width", 1.3);
        cellG.select("rect.hit").attr("stroke", "none");
        if(rd) rd.innerHTML = defTxt;
      };
      const show = (ev, d) => {
        V.focus(cellG, o => o.ri === d.ri || o.ci === d.ci);
        cellG.select("rect.hit").attr("stroke", o => o === d ? C.ink : "none").attr("stroke-width", 1.4);
        thr.attr("stroke-opacity", t => t.r === d.r ? .95 : .25).attr("stroke-width", t => t.r === d.r ? 2 : 1.1);
        if(rd) rd.innerHTML = `<b>${d.col.nom} · ${d.r.nom}:</b> ${d.cell.d}`;
      };
      outside(node, reset);
      cellG.on("pointerenter pointerdown", show).on("focus", show).on("blur", reset)
           .on("pointerleave", ev => { if(ev.pointerType === "mouse") reset(); });

      V.onView(node, instant => {
        if(instant) return;
        cellG.style("opacity", 0).transition("in").delay(d => d.ci * 110 + d.ri * 30).duration(420).style("opacity", 1);
        thr.each(function(){
          const L = this.getTotalLength();
          d3.select(this).attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
            .transition("in").delay(900).duration(1100).ease(ease).attr("stroke-dashoffset", 0)
            .on("end", function(){ d3.select(this).attr("stroke-dasharray", null); });
        });
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
     V4 · CASE-04 + TIME — VINT TAULES EN PLANTA SOBRE MIL ANYS (#cataleg-viz)
     Cada obra és un pictograma de la seva taula vista des de dalt (forma, comensals
     i lloc de Judes). Els fils baixen fins a l'any exacte de l'eix. Esquema, no calc.
     ========================================================================= */
  (function initCataleg(){
    const fig = $("#f-cataleg"), el = $("#cataleg-viz"), rd = $("#cataleg-r");
    if(!el) return;

    const SHORT = { 1: "Ravenna", 2: "Rossano", 3: "Càpua", 4: "Seu d'Urgell", 5: "Giotto", 6: "Duccio", 7: "Lorenzetti",
      8: "Gaddi", 9: "Solsona", 10: "Castagno", 11: "Bouts", 12: "Huguet", 13: "Ghirlandaio", 14: "Rosselli",
      15: "Ghirlandaio", 16: "Perugino", 17: "Leonardo", 18: "Del Sarto", 19: "Veronese", 20: "Tintoretto" };
    const CATALA = new Set([4, 9, 12]);

    const VIEWS = {
      judes: { lg: [{ c: C.blue, t: "Judes dins el grup" }, { c: C.yellow, t: "Al davant, amb altres" }, { c: C.red, t: "Sol al davant" }],
        col: d => d.judes === "integrat" ? C.blue : d.judes === "al_davant" ? C.yellow : C.red },
      taula: { lg: [{ c: C.blue, t: "Reclinats" }, { c: C.yellow, t: "Asseguts" }, { c: C.red, t: "Fris o diagonal" }],
        col: d => d.postura === "reclinats" ? C.blue : d.postura === "asseguts" ? C.yellow : C.red },
      menu: { lg: [{ c: C.blue, t: "Peix o anguila" }, { c: C.red, t: "Anyell, garrí o banquet" }, { c: C.yellow, t: "Només pa i vi" }],
        col: d => /peix|anguila/.test(d.menu) ? C.blue : /anyell|garri|banquet/.test(d.menu) ? C.red : C.yellow }
    };
    let mode = "judes";
    const updateLg = () => lg($("#cataleg-lg"), VIEWS[mode].lg.concat([{ c: C.ink, t: "Jesús" }]));
    updateLg();

    // Geometria de cada taula en un requadre de mida u (centre 0,0). Torna {shape, seats:[{x,y,who}]}
    function layout(d, u){
      const S = []; const push = (x, y, who) => S.push({ x, y, who: who || "ap" });
      const row = (n, x0, x1, y) => d3.range(n).map(i => [n === 1 ? (x0 + x1) / 2 : x0 + i * (x1 - x0) / (n - 1), y]);
      let shape;
      const aill = d.judes === "aillat", dav = d.judes === "al_davant";
      if(d.taula === "sigma"){
        const R = u * .42, cy = u * .2;
        shape = `M${-R},${cy} A${R},${R} 0 0 1 ${R},${cy} Z`;
        const n = aill ? 12 : 13;
        d3.range(n).forEach(i => {
          const a = (-92 + i * 184 / (n - 1)) * Math.PI / 180;
          push(Math.sin(a) * (R + u * .09), cy - Math.cos(a) * (R + u * .09), i === 0 ? "j" : (!aill && i === 6 ? "ju" : "ap"));
        });
        if(aill) push(0, cy + u * .14, "ju");
      } else if(d.taula === "quadrada" || d.taula === "hexagonal"){
        const r = u * .26;
        if(d.taula === "quadrada") shape = `M${-r},${-r}H${r}V${r}H${-r}Z`;
        else shape = d3.line()(d3.range(6).map(i => [Math.cos(i * Math.PI / 3) * r * 1.15, Math.sin(i * Math.PI / 3) * r * 1.15])) + "Z";
        const o = r + u * .09;
        row(5, -r, r, -o).forEach(([x, y], i) => push(x, y, i === 2 ? "j" : "ap"));
        row(3, -r * .8, r * .8, o).forEach(([x, y], i) => push(x, y, i === 1 ? "ju" : "ap"));
        row(2, -r * .5, r * .5, 0).forEach(([, y]) => { push(-o, y - r * .45); push(-o, y + r * .2); });
        push(o, -r * .45); push(o, r * .2);
        S.length = 13;
      } else if(d.taula === "u"){
        const a = u * .44, b = u * .3, t = u * .07;
        shape = `M${-a},${-b * .5}H${a}V${b}H${a - t * 2}V${-b * .5 + t * 2}H${-a + t * 2}V${b}H${-a}Z`;
        row(8, -a + t, a - t, -b * .5 - u * .08).forEach(([x, y], i) => push(x, y, i === 3 ? "j" : "ap"));
        [[-a - u * .08, b * .05], [-a - u * .08, b * .55], [a + u * .08, b * .05], [a + u * .08, b * .55]].forEach(([x, y]) => push(x, y));
        push(0, b * .5, "ju");
      } else if(d.taula === "diagonal"){
        const a = u * .46;
        shape = `M${-a},${-u * .02}L${a},${-u * .24}L${a},${-u * .12}L${-a},${u * .1}Z`;
        d3.range(12).forEach(i => { const x = -a + u * .04 + i * (2 * a - u * .08) / 11; push(x, -u * .1 - (x + a) * .24 - u * .02 * 0 - u * .07, i === 5 ? "j" : "ap"); });
        push(-u * .1, u * .14, "ju");
      } else { // recta
        const a = u * .46;
        shape = `M${-a},${-u * .05}H${a}V${u * .09}H${-a}Z`;
        if(d.judes === "integrat"){
          row(13, -a + u * .02, a - u * .02, -u * .11).forEach(([x, y], i) => push(x, y, i === 6 ? "j" : i === 3 ? "ju" : "ap"));
        } else if(dav){
          row(9, -a + u * .04, a - u * .04, -u * .11).forEach(([x, y], i) => push(x, y, i === 4 ? "j" : "ap"));
          row(4, -a * .7, a * .7, u * .19).forEach(([x, y], i) => push(x, y, i === 1 ? "ju" : "ap"));
        } else {
          row(12, -a + u * .03, a - u * .03, -u * .11).forEach(([x, y], i) => push(x, y, i === 5 ? "j" : "ap"));
          push(0, u * .22, "ju");
        }
      }
      return { shape, seats: S };
    }

    const M = V.mount(el, (node, w) => {
      const mob = w < 640;
      const data = D.cataleg.slice().sort((a, b) => a.any - b.any);
      const n = data.length;
      let h, items;
      const cv = VIEWS[mode].col;
      if(!mob){
        const m = { l: 6, r: 6 };
        const slot = (w - m.l - m.r) / n;
        const u = Math.min(84, slot * 1.85);
        const yA = 20 + u / 2, yB = yA + u + 40;
        const yAxis = yB + u / 2 + 64;
        h = yAxis + 34;
        const x = d3.scaleLinear([500, 1220, 1600], [m.l + 18, m.l + (w - m.l - m.r) * .2, w - m.r - 18]);
        items = data.map((d, i) => ({ d, u, gx: m.l + (i + .5) * slot, gy: i % 2 ? yB : yA, ax: x(d.any), yAxis }));
        var s = V.svg(node, w, h, "Vint obres del Sant Sopar entre els segles VI i XVI, cadascuna dibuixada com un pla esquemàtic de la seva taula, sobre un eix del temps.");
        // eix del temps (escala partida)
        const gx = s.append("g");
        gx.append("line").attr("x1", x(500)).attr("x2", x(1600)).attr("y1", yAxis).attr("y2", yAxis).attr("stroke", C.ink2).attr("stroke-width", .8);
        const xb = x(1220);
        gx.append("path").attr("d", `M${xb - 6},${yAxis + 5} L${xb - 2},${yAxis - 5} M${xb + 2},${yAxis + 5} L${xb + 6},${yAxis - 5}`).attr("stroke", C.ink2).attr("fill", "none");
        [500, 800, 1100, 1300, 1400, 1500, 1600].forEach(t => {
          gx.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", yAxis).attr("y2", yAxis + 5).attr("stroke", C.ink2);
          V.t(gx, x(t), yAxis + 19, String(t), { anchor: "middle", size: 11.5, fill: C.muted });
        });
        V.t(gx, (x(500) + xb) / 2, yAxis - 8, "segles VI–XI, comprimits", { anchor: "middle", size: 11, italic: true, fill: C.muted });
        gx.append("line").attr("x1", x(1498)).attr("x2", x(1498)).attr("y1", yAxis - 4).attr("y2", yAxis + 4).attr("stroke", C.red).attr("stroke-width", 2);
      } else {
        const cols = 4, cwm = w / cols, u = Math.min(78, cwm - 10), rh = u + 44;
        h = Math.ceil(n / cols) * rh + 4;
        items = data.map((d, i) => ({ d, u, gx: (i % cols + .5) * cwm, gy: Math.floor(i / cols) * rh + u / 2 + 4 }));
        var s = V.svg(node, w, h, "Vint obres del Sant Sopar entre els segles VI i XVI, cadascuna dibuixada com un pla esquemàtic de la seva taula, en ordre cronològic.");
      }

      // fils fins a l'any
      const gStem = s.append("g");
      if(!mob){
        gStem.selectAll("path").data(items).join("path")
          .attr("d", p => { const y0 = p.gy + p.u * .5 + 32; return `M${p.gx},${y0} C${p.gx},${(y0 + p.yAxis) / 2} ${p.ax},${(y0 + p.yAxis) / 2} ${p.ax},${p.yAxis}`; })
          .attr("fill", "none").attr("stroke", p => p.d.id === 17 ? C.red : C.ghost).attr("stroke-width", p => p.d.id === 17 ? 1.2 : .7);
      }

      const gl = s.append("g").selectAll("g.ob").data(items).join("g").attr("class", "ob")
        .attr("transform", p => `translate(${p.gx},${p.gy})`)
        .attr("tabindex", "0").attr("role", "button")
        .attr("aria-label", p => `${p.d.artista}, ${p.d.obra} (${p.d.anyTxt}): ${p.d.detall}`)
        .style("cursor", "pointer");
      gl.append("rect").attr("class", "hit").attr("x", p => -p.u / 2).attr("y", p => -p.u / 2).attr("width", p => p.u).attr("height", p => p.u + 34)
        .attr("fill", "transparent").attr("stroke", "none").attr("rx", 4);
      gl.each(function(p){
        const g = d3.select(this), L = layout(p.d, p.u), c = cv(p.d);
        g.append("path").attr("class", "tb").attr("d", L.shape)
          .attr("fill", c).attr("fill-opacity", c === C.yellow ? .5 : .28).attr("stroke", c === C.yellow ? C.yellowDark : c).attr("stroke-width", 1)
          .style("mix-blend-mode", "multiply");
        const r = Math.max(2.2, p.u * .034);
        L.seats.forEach(st => {
          if(st.who === "ju"){
            g.append("circle").attr("class", "juh").attr("cx", st.x).attr("cy", st.y).attr("r", r * 2.6).attr("fill", C.red).attr("fill-opacity", mode === "judes" ? .22 : 0);
          }
          g.append("circle").attr("cx", st.x).attr("cy", st.y).attr("r", st.who === "ap" ? r : r * 1.25)
            .attr("fill", st.who === "j" ? C.ink : st.who === "ju" ? C.red : C.ink2).attr("fill-opacity", st.who === "ap" ? .55 : 1);
        });
        const yl = p.u / 2 + 14;
        V.t(g, 0, yl, SHORT[p.d.id], { anchor: "middle", size: 11.5, weight: p.d.id === 17 || CATALA.has(p.d.id) ? 700 : 500, fill: p.d.id === 17 ? C.red : C.ink });
        V.t(g, 0, yl + 14, p.d.anyTxt.replace("c. ", "c. "), { anchor: "middle", size: 11, fill: C.muted });
      });

      const defTxt = "<b>Vint obres verificades (c. 500–1594):</b> cada dibuix és la planta de la seva taula; el punt vermell és Judes i el negre, Jesús. Les tres obres catalanes tenen el nom en negreta. Passa o toca una obra.";
      if(rd) rd.innerHTML = defTxt;
      const reset = () => {
        V.focus(gl, null); V.focus(gStem.selectAll("path"), null);
        gl.select("rect.hit").attr("stroke", "none");
        if(rd) rd.innerHTML = defTxt;
      };
      const show = (ev, p) => {
        V.focus(gl, o => o === p);
        V.focus(gStem.selectAll("path"), o => o === p);
        d3.select(ev.currentTarget).raise().select("rect.hit").attr("stroke", C.ink).attr("stroke-width", 1.2);
        if(rd) rd.innerHTML = `<b>${p.d.artista} · ${p.d.obra} (${p.d.anyTxt}, ${p.d.lloc}):</b> ${p.d.detall}`;
      };
      outside(node, reset);
      gl.on("pointerenter pointerdown", show).on("focus", show).on("blur", reset)
        .on("pointerleave", ev => { if(ev.pointerType === "mouse") reset(); });

      // canvi de lent: els colors canvien suaument, el dibuix es queda
      node.__lens = k => {
        const f = VIEWS[k].col;
        gl.each(function(p){
          const c = f(p.d), g = d3.select(this);
          g.select("path.tb").transition().duration(dur(600)).ease(ease)
            .attr("fill", c).attr("fill-opacity", c === C.yellow ? .5 : .28).attr("stroke", c === C.yellow ? C.yellowDark : c);
          g.select("circle.juh").transition().duration(dur(600)).attr("fill-opacity", k === "judes" ? .22 : 0);
        });
      };

      V.onView(node, instant => {
        if(instant) return;
        gl.style("opacity", 0).transition("in").delay((p, i) => i * 55).duration(480).style("opacity", 1);
        gStem.selectAll("path").each(function(p, i){
          const L = this.getTotalLength();
          d3.select(this).attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
            .transition("in").delay(300 + i * 55).duration(900).ease(ease).attr("stroke-dashoffset", 0);
        });
      });
    });

    seg(fig, k => { mode = k; updateLg(); if(el.__lens) el.__lens(k); else M.redraw(); });
  })();

  /* =========================================================================
     V5 · SCROLLY 2 — LA PARET QUE MOR (#mur-viz)
     HOW-01 (tall de capes) + el mural real com a escenari de les ferides + pla del 1943
     + PART (100 cel·les) per al debat del percentatge. A sota, sempre, la cronologia 1495–1999.
     ========================================================================= */
  (function initMur(){
    const sec = $("#s-mur"), el = $("#mur-viz"), rd = $("#mur-r");
    const tEl = $("#mur-t"), sEl = $("#mur-s");
    if(!sec || !el) return;
    lg($("#mur-lg"), [
      { c: C.blue, t: "Fresc i rescats" },
      { c: C.red, t: "Pintura seca, ferides" },
      { c: C.yellow, t: "Testimonis del deteriorament" }
    ]);

    const STEPS = [
      { t: "1 · L'experiment de control: paret sud contra paret nord", s: "El mateix refectori va posar a prova dues tècniques contràries (1495–1498)", r: [1495, 1498] },
      { t: "2 · 1517–1566: es desfà abans de complir setanta anys", s: "Testimonis d'Antonio de Beatis (desembre de 1517) i Giorgio Vasari (maig de 1566)", r: [1517, 1566] },
      { t: "3 · 1652–1821: porta, raspades, quadra i inundació", s: "Les agressions i les repintades que van enterrar Leonardo", r: [1652, 1821] },
      { t: "4 · 1943: el sostre cau, el mural aguanta", s: "Sacs de sorra i bastides de Gino Chierici contra el bombardeig aliat", r: [1943, 1943] },
      { t: "5 · 1978–1999: què en queda, realment?", s: "Dues estimacions publicades de la pintura original que sobreviu", r: [1903, 1999] }
    ];
    const TCOL = d => d.tipus === "rescat" ? C.blue : d.tipus === "deteriorament" ? C.yellow : d.tipus === "creacio" ? C.ink : C.red;

    let curStep = 0, updFn = null;

    V.mount(el, (node, w) => {
      const mob = w < 560;
      const h = mob ? 290 : 480;
      const hT = mob ? 62 : 84;              // franja de la cronologia
      const hM = h - hT;                     // escenari
      const s = V.svg(node, w, h, "La paret de L'últim sopar en cinc moments: el tall de capes, els primers testimonis del deteriorament, les ferides de 1652 a 1821, el bombardeig de 1943 i el debat sobre el percentatge original.");
      const gStage = s.append("g"), gNote = s.append("g").style("pointer-events", "none");
      const gT = s.append("g").attr("transform", `translate(0,${hM})`);
      const R = V.rng(1498);

      /* ---------- cronologia fixa ---------- */
      const x = d3.scaleLinear([1490, 2005], [mob ? 10 : 16, w - (mob ? 10 : 16)]);
      const yAx = hT - 26;
      gT.append("line").attr("x1", x(1490)).attr("x2", x(2005)).attr("y1", yAx).attr("y2", yAx).attr("stroke", C.ink2).attr("stroke-width", .8);
      (mob ? [1500, 1600, 1700, 1800, 1900] : [1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000]).forEach(t => {
        gT.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", yAx).attr("y2", yAx + 4).attr("stroke", C.ink2);
        V.t(gT, x(t), yAx + 17, String(t), { anchor: "middle", size: 11, fill: C.muted });
      });
      const band = gT.append("rect").attr("y", yAx - 3).attr("height", 6).attr("rx", 3).attr("fill", C.ink).attr("fill-opacity", .9);
      const evs = gT.selectAll("g.ev").data(D.conservacio).join("g").attr("class", "ev")
        .attr("transform", d => `translate(${x(d.any)},${yAx - 16})`)
        .attr("tabindex", "0").attr("role", "button").attr("aria-label", d => `${d.anyTxt}: ${d.t}. ${d.d}`).style("cursor", "pointer");
      evs.append("circle").attr("r", mob ? 7 : 8.5).attr("fill", TCOL).attr("fill-opacity", d => d.tipus === "deteriorament" ? .6 : .35)
        .attr("stroke", d => d.tipus === "deteriorament" ? C.yellowDark : TCOL(d)).attr("stroke-width", .8).style("mix-blend-mode", "multiply");
      evs.append("circle").attr("r", 2.4).attr("fill", d => d.tipus === "deteriorament" ? C.ink : TCOL(d));
      const evLab = gT.append("g").style("pointer-events", "none");

      function timeline(idx, animate){
        const [a, b] = STEPS[idx].r;
        const x0 = x(a) - 4, x1 = x(b) + 4;
        (animate ? band.transition().duration(dur(900)).ease(ease) : band).attr("x", x0).attr("width", Math.max(8, x1 - x0));
        const inR = d => d.any >= a - 1 && d.any <= b + 1;
        evs.transition().duration(dur(400)).style("opacity", d => inR(d) ? 1 : .46);
        evLab.selectAll("*").remove();
        if(mob) return;
        const sel = D.conservacio.filter(inR);
        let lastX = -1e9, lvl = 0;
        sel.forEach(d => {
          const px = x(d.any);
          lvl = px - lastX < 46 ? lvl + 1 : 0; lastX = px;
          V.t(evLab, px, yAx - 30 - lvl * 13, String(d.any), { anchor: "middle", size: 11, weight: 700, fill: C.ink, halo: 3 });
        });
      }
      const showEv = (ev, d) => {
        V.focus(evs, o => o === d);
        if(rd) rd.innerHTML = `<b>${d.anyTxt} · ${d.t}:</b> ${d.d}`;
      };
      const hideEv = () => { timeline(curStep, false); stepReadout(curStep); };
      evs.on("pointerenter pointerdown", showEv).on("focus", showEv).on("blur", hideEv)
         .on("pointerleave", ev => { if(ev.pointerType === "mouse") hideEv(); });
      outside(node, hideEv);

      /* ---------- escenaris ---------- */
      const pw = w, ph = Math.round(pw * 586 / 1600);
      const py = mob ? 8 : 10;
      const P = (fx, fy) => [fx * pw, py + fy * ph];

      function photo(g, filter){
        const im = g.append("image").attr("href", "img/leonardo-cmp.jpg").attr("x", 0).attr("y", py).attr("width", pw).attr("height", ph)
          .attr("preserveAspectRatio", "none").style("transition", "filter 1.4s ease");
        if(filter) im.style("filter", filter);
        return im;
      }

      function stepStrata(g){
        const colW = mob ? (w - 18) / 2 : Math.min(190, w * .22);
        const xs = mob ? [0, colW + 18] : [w * .02, w * .47];
        const sc = mob ? (hM - 66) / 92 : 3.0;
        const yBase = hM - (mob ? 22 : 30);
        const wall = [{ k: "sud", layers: D.estratigrafia.sud, t: mob ? "Sud · Montorfano" : "Paret sud · Montorfano, buon fresco", c: C.blue },
                      { k: "nord", layers: D.estratigrafia.nord, t: mob ? "Nord · Leonardo" : "Paret nord · Leonardo, a secco", c: C.red }];
        wall.forEach((wl, wi) => {
          const x0 = xs[wi];
          let y = yBase;
          const tops = [];
          wl.layers.forEach((ly, li) => {
            const lh = ly.gruix * sc;
            const yt = y - lh;
            // vora superior ondulada (orgànica)
            const top = d3.range(0, 25).map(i => [x0 + i * colW / 24, yt + (li === wl.layers.length - 1 && wl.k === "nord" ? (R() - .5) * 3 : (R() - .5) * 1.6)]);
            const d = d3.line().curve(d3.curveBasis)(top) + `L${x0 + colW},${y}L${x0},${y}Z`;
            const isTop = li === wl.layers.length - 1;
            g.append("path").attr("d", d).attr("fill", ly.c).attr("fill-opacity", isTop ? .9 : .7).attr("stroke", "none");
            // textura de cada capa
            const tg = g.append("g").style("pointer-events", "none");
            if(li === 0){
              for(let yy = yt + 4; yy < y - 2; yy += 9) for(let xx = x0 + ((yy / 9 | 0) % 2) * 9; xx < x0 + colW - 16; xx += 18)
                tg.append("rect").attr("x", xx + 1).attr("y", yy).attr("width", 16).attr("height", 7).attr("fill", "none").attr("stroke", C.paper).attr("stroke-opacity", .7).attr("stroke-width", .7);
            } else if(ly.nom.startsWith("Arriccio") || ly.nom.startsWith("Intonaco")){
              const n = Math.round(colW * lh / (li === 1 ? 26 : 50));
              for(let i = 0; i < n; i++) tg.append("circle").attr("cx", x0 + 2 + R() * (colW - 4)).attr("cy", yt + 3 + R() * (lh - 6)).attr("r", li === 1 ? .9 + R() * 1.2 : .7)
                .attr("fill", C.ink2).attr("fill-opacity", .28);
            } else if(wl.k === "sud" && isTop){
              const n = Math.round(colW / 3);
              for(let i = 0; i < n; i++) tg.append("rect").attr("x", x0 + 2 + R() * (colW - 6)).attr("y", yt + 4 + R() * (lh - 8)).attr("width", 2.4).attr("height", 2.4)
                .attr("transform", function(){ return `rotate(45,${+this.getAttribute("x")},${+this.getAttribute("y")})`; })
                .attr("fill", C.paper).attr("fill-opacity", .55);
            }
            tops.push({ ly, yt, y, lh });
            y = yt;
          });
          // títol de la paret
          V.t(g, x0, y - (mob ? 34 : 34), wl.t, { size: mob ? 11.5 : 13.5, weight: 700, fill: wl.c === C.red ? C.red : C.blue });
          // etiquetes de capa
          tops.forEach((tp, li) => {
            const nom = mob ? tp.ly.nom.split(" (")[0].replace("Mur prim amb humitat de cuines", "Mur humit").replace("Carbonat de calci + magnesi i cola", "Carbonat i cola")
              .replace("Imprimatura de blanc de plom", "Blanc de plom").replace("Tremp d'ou i oli aplicats a secco", "Tremp i oli").replace("Carbonatació química", "Carbonatació") : tp.ly.nom;
            const dark = tp.ly.c === C.blue || tp.ly.c === C.red;
            if(mob){
              V.t(g, x0 + 5, tp.yt + Math.min(tp.lh / 2 + 4, 15), nom, { size: 11, weight: 600, fill: dark ? C.paper : C.ink });
            } else {
              const lx = x0 + colW + 10, ly = tp.yt + tp.lh / 2;
              g.append("line").attr("x1", x0 + colW - 6).attr("x2", lx - 2).attr("y1", ly).attr("y2", ly).attr("stroke", C.ink).attr("stroke-width", .7);
              const room = (wi === 0 ? xs[1] : w) - lx - 8, maxC = Math.max(14, Math.floor(room / 5.9));
              const wrap = str => { const out = [[]]; str.split(" ").forEach(wd => { const cur = out[out.length - 1]; if((cur.join(" ") + " " + wd).length > maxC && cur.length) out.push([wd]); else cur.push(wd); }); return out.map(l => l.join(" ")); };
              const ls = wrap(nom).map(t => [t, true]).concat(wrap(tp.ly.desc).map(t => [t]));
              V.lines(g, lx, ly - 2 - (ls.length - 2) * 6, ls, { size: 11.5, halo: true });
            }
          });
          // superfície: el fresc queda soldat; la pintura seca s'escata
          const surf = tops[tops.length - 1];
          if(wl.k === "nord"){
            const fl = g.append("g").attr("class", "flakes");
            d3.range(mob ? 9 : 14).forEach(i => {
              const fx = x0 + 8 + R() * (colW - 16), fy = surf.yt - 4 - R() * (mob ? 16 : 26), sz = 3 + R() * 5;
              fl.append("path").attr("d", `M${-sz},0 L${-sz * .2},${-sz * .6} L${sz},${-sz * .2} L${sz * .4},${sz * .5} Z`)
                .attr("transform", `translate(${fx},${fy}) rotate(${R() * 360})`).attr("fill", C.red).attr("fill-opacity", .85);
            });
            d3.range(5).forEach(() => {
              const cx0 = x0 + 10 + R() * (colW - 20);
              g.append("path").attr("d", `M${cx0},${surf.yt} l${R() * 4 - 2},${surf.lh * .4} l${R() * 4 - 2},${surf.lh * .55}`)
                .attr("stroke", C.paper).attr("stroke-width", 1.1).attr("fill", "none");
            });
          }
        });
        if(!mob){
          V.note(gNote, { x: xs[0] + colW * .5, y: yBase - D.estratigrafia.sud.reduce((a, l) => a + l.gruix, 0) * sc, tx: xs[0] + colW * .5 + 20, ty: 18, kind: "curve", bend: 10, anchor: "start", size: 12,
            lines: [["El pigment queda dins la pedra", true], ["la calç humida el tanca en calcita"]] });
          V.note(gNote, { x: xs[1] + colW * .5, y: yBase - D.estratigrafia.nord.reduce((a, l) => a + l.gruix, 0) * sc - 20, tx: xs[1] + colW * .5 + 24, ty: 18, kind: "curve", bend: 10, anchor: "start", size: 12,
            lines: [["La pintura s'aixeca a escates", true], ["no s'ha soldat a res"]] });
        }
        if(rd) stepReadout(0);
      }

      function stepWitness(g){
        photo(g, "grayscale(.55) contrast(.62) brightness(1.12) blur(.4px)");
        const sz = mob ? 11 : 12.5, yq = py + ph + (mob ? 26 : 34);
        V.note(gNote, { x: P(.24, .5)[0], y: P(.24, .5)[1], tx: mob ? 4 : P(.06, 0)[0], ty: yq, kind: "curve", bend: -16, anchor: "start", size: sz,
          lines: [["Desembre de 1517 · De Beatis", true], ["«incomincia ad guastarse»"]] });
        V.note(gNote, { x: P(.74, .4)[0], y: P(.74, .4)[1], tx: mob ? w - 4 : P(.94, 0)[0], ty: yq + (mob ? 42 : 0), kind: "curve", bend: 16, anchor: "end", size: sz,
          lines: [["Maig de 1566 · Vasari", true], ["«una macchia abbagliata»"]] });
        if(!mob) V.t(gNote, w / 2, yq + 50, "Foto actual, apagada: el mural ja era una taca quan Leonardo feia 48 anys que era mort", { anchor: "middle", size: 11, italic: true, fill: C.muted });
      }

      function stepWounds(g, animate){
        photo(g, "grayscale(.35) contrast(.85)");
        // tres caps que Mazza va respectar el 1770
        ["mateu", "tadeu", "simo"].forEach((id, i) => {
          const p = D.cenacolo.personatges.find(q => q.id === id);
          const [cx, cy] = P(p.x, p.y);
          const c = g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", mob ? 10 : 18).attr("fill", C.blue).attr("fill-opacity", .38)
            .attr("stroke", C.paper).attr("stroke-width", 2);
          if(animate) c.attr("r", 0).transition().delay(dur(500 + i * 160)).duration(dur(500)).attr("r", mob ? 10 : 18);
        });
        // la porta de 1652
        const d1652 = D.cenacolo.porta1652;
        const [x0] = P(d1652.x0, 0), [x1] = P(d1652.x1, 0), ys = P(0, d1652.ySide)[1], yt = P(0, d1652.yTop)[1], yb = py + ph;
        const door = g.append("path").attr("d", `M${x0},${yb} L${x0},${ys} Q${(x0 + x1) / 2},${yt - 14} ${x1},${ys} L${x1},${yb} Z`)
          .attr("fill", C.paper).attr("stroke", C.red).attr("stroke-width", 2).attr("stroke-dasharray", "6 4");
        if(animate) door.attr("fill-opacity", 0).transition().delay(dur(200)).duration(dur(800)).attr("fill-opacity", 1);
        V.t(gNote, (x0 + x1) / 2, yb - (mob ? 6 : 12), mob ? "Porta, 1652" : "Porta oberta el 1652", { anchor: "middle", size: mob ? 11 : 12.5, weight: 700, fill: C.red });
        if(!mob) V.t(gNote, (x0 + x1) / 2, yb + 18, "s'hi perden els peus de Jesús", { anchor: "middle", size: 11.5, fill: C.ink2 });
        const tad = D.cenacolo.personatges.find(q => q.id === "tadeu");
        const [tx, ty] = P(tad.x, tad.y);
        V.note(gNote, { x: tx, y: ty - (mob ? 10 : 18), tx: mob ? w - 4 : tx + 40, ty: mob ? py + ph + 34 : py + ph + 44, kind: "curve", bend: 14, anchor: "end", size: mob ? 11 : 12.5,
          lines: mob ? [["Mazza (1770) en salva tres", true]] : [["Mazza raspa i repinta (1770)", true], ["l'aturen: respecta Mateu, Tadeu i Simó"]] });
        if(!mob) V.lines(gNote, 4, py + ph + 38, [["1796–1800", true], ["quadra de les tropes franceses i inundació"], ["1821 · Barezzi intenta arrencar-lo"]], { size: 12, halo: true });
      }

      function stepBomb(g, animate){
        const x0 = w * (mob ? .06 : .14), x1 = w * (mob ? .94 : .86), y0 = hM * .3, y1 = hM * .68;
        const wallW = mob ? 5 : 7;
        // brúixola: nord a l'esquerra (el pla és girat)
        V.t(g, x0 - (mob ? 2 : 22), y0 - 30, "N ←", { size: 12, weight: 700, fill: C.ink2, anchor: mob ? "start" : "middle" });
        // sostre ensorrat: ratllat vermell
        const hatch = g.append("g").attr("clip-path", null);
        const cid = "mur-clip-" + Math.round(w);
        s.select("defs").remove();
        const defs = s.insert("defs", ":first-child");
        defs.append("clipPath").attr("id", cid).append("rect").attr("x", x0).attr("y", y0).attr("width", x1 - x0).attr("height", y1 - y0);
        hatch.attr("clip-path", `url(#${cid})`);
        for(let k = -(y1 - y0); k < x1 - x0; k += 9)
          hatch.append("line").attr("x1", x0 + k).attr("y1", y1).attr("x2", x0 + k + (y1 - y0)).attr("y2", y0).attr("stroke", C.red).attr("stroke-opacity", .28).attr("stroke-width", 1);
        // parets que aguanten: oest (llarga, a baix), nord (Leonardo) i sud (Montorfano)
        g.append("rect").attr("x", x0).attr("y", y1).attr("width", x1 - x0).attr("height", wallW).attr("fill", C.ink2);
        g.append("rect").attr("x", x0 - wallW).attr("y", y0).attr("width", wallW).attr("height", y1 - y0 + wallW).attr("fill", C.ink);
        g.append("rect").attr("x", x1).attr("y", y0).attr("width", wallW).attr("height", y1 - y0 + wallW).attr("fill", C.ink);
        g.append("rect").attr("x", x0 - 1.5).attr("y", y0 + 6).attr("width", 3).attr("height", y1 - y0 - 12).attr("fill", C.red);
        g.append("rect").attr("x", x1 - 1.5).attr("y", y0 + 6).attr("width", 3).attr("height", y1 - y0 - 12).attr("fill", C.blue);
        // paret est ensorrada: runa
        const rub = g.append("g");
        d3.range(mob ? 22 : 38).forEach(() => {
          const rx = x0 + R() * (x1 - x0), ry = y0 - 6 + (R() - .5) * 18 + (R() < .4 ? R() * 26 : 0);
          rub.append("rect").attr("x", rx).attr("y", ry).attr("width", 3 + R() * 7).attr("height", 2 + R() * 4)
            .attr("transform", `rotate(${R() * 90 - 45},${rx},${ry})`).attr("fill", C.ghost).attr("stroke", C.ink2).attr("stroke-width", .4);
        });
        // sacs de sorra davant les dues parets pintades
        const bags = g.append("g");
        [[x0 + 2, 1], [x1 - 2, -1]].forEach(([bx, dir]) => {
          for(let col = 0; col < (mob ? 2 : 3); col++) for(let yy = y0 + 6; yy < y1 - 8; yy += 9){
            const bx2 = bx + dir * (4 + col * 9) - (dir < 0 ? 8 : 0);
            bags.append("rect").attr("x", bx2).attr("y", yy + (col % 2) * 4).attr("width", 8).attr("height", 7.5).attr("rx", 2.5)
              .attr("fill", C.land).attr("stroke", C.ink2).attr("stroke-width", .6);
          }
        });
        if(animate){
          rub.style("opacity", 0).transition().delay(dur(300)).duration(dur(700)).style("opacity", 1);
          hatch.style("opacity", 0).transition().delay(dur(100)).duration(dur(900)).style("opacity", 1);
          bags.selectAll("rect").style("opacity", 0).transition().delay((d, i) => dur(600 + i * 6)).duration(dur(200)).style("opacity", 1);
        }
        const sz = mob ? 11 : 12.5;
        V.note(gNote, { x: x0 - 2, y: (y0 + y1) / 2, tx: mob ? 4 : x0 + 30, ty: y1 + (mob ? 30 : 40), kind: "curve", bend: 12, anchor: "start", size: sz,
          lines: mob ? [["Nord: L'últim sopar", true]] : [["Paret nord: L'últim sopar", true], ["protegida amb bastides i sacs de sorra"]] });
        V.note(gNote, { x: x1 + 2, y: (y0 + y1) / 2, tx: mob ? w - 4 : x1 - 30, ty: y1 + (mob ? 30 : 40), kind: "curve", bend: -12, anchor: "end", size: sz,
          lines: mob ? [["Sud: Crucifixió", true]] : [["Paret sud: Crucifixió de Montorfano", true], ["també queda dreta"]] });
        V.note(gNote, { x: (x0 + x1) / 2, y: y0 - 6, tx: (x0 + x1) / 2 + (mob ? 0 : 40), ty: y0 - (mob ? 34 : 44), kind: "curve", bend: 10, anchor: "middle", size: sz,
          lines: [["Sostre i paret est, a terra", true]].concat(mob ? [] : [["nit del 15 al 16 d'agost de 1943"]]) });
        if(!mob) V.t(gNote, x1 + wallW, y1 + 70, "Esquema del refectori, no a escala", { anchor: "end", size: 11, italic: true, fill: C.muted });
      }

      function stepPercent(g, animate){
        const pairs = [
          { lo: 18, hi: 20, c: C.red, t: "~18–20 % de superfície íntegra", who: "Carlo Bertelli · James Beck" },
          { lo: 50, hi: 50, c: C.blue, t: "Traces originals en fins a ~50 %", who: "Giuseppe Basile · Pietro Marani" }
        ];
        const cs = mob ? Math.min(12, (w - 30) / 20 - 1.5, (hM - 84) / 10 - 2) : Math.min(22, (w * .38) / 10 - 2);
        const gw = cs * 10 + 9 * 2;
        const gapX = mob ? 18 : Math.max(40, w * .08);
        const ox = (w - (gw * 2 + gapX)) / 2;
        const oy = mob ? 56 : 74;
        pairs.forEach((p, pi) => {
          const gx0 = ox + pi * (gw + gapX);
          V.lines(g, gx0, oy - (mob ? 38 : 44), mob ? [[p.t.replace("de superfície ", ""), true], [p.who.split(" · ").map(s => s.split(" ").pop()).join(" · ")]] : [[p.t, true], [p.who]], { size: mob ? 11 : 12.5, halo: false });
          const cells = g.append("g").selectAll("rect").data(d3.range(100)).join("rect")
            .attr("x", i => gx0 + (i % 10) * (cs + 2)).attr("y", i => oy + Math.floor(i / 10) * (cs + 2))
            .attr("width", cs).attr("height", cs).attr("rx", 1.5)
            .attr("fill", i => i < p.lo ? p.c : i < p.hi ? p.c : "none")
            .attr("fill-opacity", i => i < p.lo ? .85 : i < p.hi ? .35 : 0)
            .attr("stroke", i => i < p.hi ? "none" : C.hair).attr("stroke-width", .8);
          if(animate) cells.filter(i => i < p.hi).style("opacity", 0).transition().delay(i => dur(200 + i * 22)).duration(dur(200)).style("opacity", 1);
        });
        if(!mob) V.t(gNote, w / 2, oy + cs * 10 + 18 + 22, "Cada quadrat és un 1 % de la superfície del mural · proporció, no lloc", { anchor: "middle", size: 11, italic: true, fill: C.muted });
      }

      function stepReadout(idx){
        if(!rd) return;
        if(idx === 0){ rd.innerHTML = "<b>Experiment de control al mateix refectori:</b> el buon fresco de Montorfano va soldar el pigment dins la calç; els retrats Sforza que Leonardo hi va afegir a secco s'han esborrat igual que el Cenacolo."; return; }
        const [a, b] = STEPS[idx].r;
        const sel = D.conservacio.filter(d => d.any >= a - 1 && d.any <= b + 1);
        const last = idx === 4 ? D.conservacio[D.conservacio.length - 1] : sel[sel.length - 1];
        if(last) rd.innerHTML = `<b>${last.anyTxt} · ${last.t}:</b> ${last.d}`;
      }

      function drawStep(idx, animate){
        const st = STEPS[idx];
        if(tEl) tEl.textContent = st.t;
        if(sEl) sEl.textContent = st.s;
        const old = gStage.selectAll("g.sc");
        if(animate) old.transition().duration(dur(350)).style("opacity", 0).remove(); else old.remove();
        gNote.selectAll("*").remove();
        const g = gStage.append("g").attr("class", "sc");
        if(idx === 0) stepStrata(g);
        else if(idx === 1) stepWitness(g);
        else if(idx === 2) stepWounds(g, animate);
        else if(idx === 3) stepBomb(g, animate);
        else stepPercent(g, animate);
        if(animate){
          g.style("opacity", 0).transition().delay(dur(250)).duration(dur(600)).style("opacity", 1);
          gNote.style("opacity", 0).transition().delay(dur(700)).duration(dur(400)).style("opacity", 1);
        }
        timeline(idx, animate);
        stepReadout(idx);
      }

      updFn = i => { if(i === curStep) return; curStep = i; drawStep(i, true); };
      drawStep(curStep, false);
      V.onView(node, inst => {
        if(inst) return;
        evs.style("opacity", 0).transition("in").delay((d, i) => 200 + i * 60).duration(400).style("opacity", d => {
          const [a, b] = STEPS[curStep].r; return d.any >= a - 1 && d.any <= b + 1 ? 1 : .46; });
        gStage.select(".flakes").selectAll("path").each(function(){
          const t = d3.select(this).attr("transform");
          d3.select(this).attr("transform", t.replace(/translate\(([^,]+),([^)]+)\)/, (m, a, b) => `translate(${a},${+b + 22})`))
            .style("opacity", 0).transition("in").delay(400 + R() * 600).duration(1200).ease(d3.easeCubicOut).attr("transform", t).style("opacity", 1);
        });
      });
    });

    if(window.IB && IB.scrolly){
      IB.scrolly(sec.querySelector(".steps"), sec.querySelector(".graphic"), idx => {
        if(updFn) updFn(idx); else curStep = idx;
      });
    }
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
