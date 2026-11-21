/* /guidelines: demos visuals, línia de decisions i punts per decidir. Sense llibreries. */
(function(){
  "use strict";
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const C = { ink:"#121212", ink2:"#4A4A4A", muted:"#7A7A7A", ghost:"#C9C9C9", hair:"#DADADA", land:"#ECEBE8", red:"#C8442A", blue:"#2C5DA8", yel:"#F5C518" };
  const store = { get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };
  const pressed = (group, btn) => group.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));

  /* ---------- Anatomia d'un article ---------- */
  const ANAT = {
    cap: ["Capçalera", "Títol, una entradeta que planteja la pregunta i una línia amb els minuts de lectura i l'enllaç «Dades i fonts ↓». Cap llista d'autors ni de fonts aquí dalt."],
    dl:  ["Primer paràgraf", "Comença amb una història o una imatge concreta (els pescadors del Perú, un duel de cançons inuit), amb caplletra. Res de frases generals sobre «el món d'avui»."],
    scr: ["Secció de scroll", "El gràfic queda enganxat i els passos de text van passant al costat (a sota al mòbil). Cada pas canvia el gràfic: una capa, un zoom, una anotació. Mínim dues per article."],
    fig: ["Figura interactiva", "Un gràfic del sistema infogràfic, animat en entrar i amb hover. El peu només diu què és (dades reals, esquema o simulació) i enllaça a les seves fonts."],
    nt:  ["Nota lateral", "Curiositats i matisos en cursiva, al marge del text. Mai fonts: les fonts són a «Dades i fonts»."],
    gl:  ["Paraules clau", "Un glossari curt al final amb els termes que el lector pot no conèixer."],
    fn:  ["Dades i fonts", "Una sola secció al final, amb tres parts: Metodologia (què és dada real i què és esquema), Els gràfics (l'explicació completa de cada gràfic) i Fonts (numerades per ordre d'aparició, cadascuna amb «Hi recolza:» i la fletxa ↑ per tornar al text)."]
  };
  const anat = document.querySelector(".anat-pg");
  const showAnat = k => { document.getElementById("anat-t").textContent = ANAT[k][0]; document.getElementById("anat-p").textContent = ANAT[k][1]; anat.querySelectorAll(".ap").forEach(b => b.classList.toggle("on", b.dataset.k === k)); };
  anat.addEventListener("click", e => { const b = e.target.closest(".ap"); if (b) showAnat(b.dataset.k); });
  anat.addEventListener("pointerover", e => { const b = e.target.closest(".ap"); if (b && e.pointerType === "mouse") showAnat(b.dataset.k); });
  showAnat("cap");

  /* ---------- Recorregut d'una cita ---------- */
  const cf = document.getElementById("citeflow");
  let cfMode = "ara", cfT0 = performance.now();
  function drawCite(){
    cf.innerHTML = "";
    const cols = cfMode === "abans"
      ? [{x:20, t:"Text", s:"…65 espècies.¹"}, {x:240, t:"Notes", s:"1. Revisió comparada… [7]"}, {x:460, t:"Fonts", s:"7. Winkler & Bryant (2021)"}]
      : [{x:20, t:"Text", s:"…65 espècies.⁷"}, {x:460, t:"Dades i fonts", s:"7. Winkler & Bryant (2021)"}];
    cols.forEach(c => {
      el("rect", {x:c.x, y:60, width:160, height:62, rx:3, fill:"none", stroke:C.ink, "stroke-width":1}, cf);
      const t = el("text", {x:c.x+12, y:50, class:"nt"}, cf); t.textContent = c.t;
      const s = el("text", {x:c.x+12, y:96, class:"ns"}, cf); s.textContent = c.s;
    });
    const hops = cfMode === "abans" ? [[180,91,240,91],[400,91,460,91]] : [[180,80,460,80]];
    hops.forEach((h,i) => {
      el("path", {d:`M${h[0]},${h[1]} L${h[2]-6},${h[3]}`, stroke:C.red, "stroke-width":1.2, fill:"none"}, cf);
      el("path", {d:`M${h[2]-8},${h[3]-4} L${h[2]},${h[3]} L${h[2]-8},${h[3]+4}`, stroke:C.red, "stroke-width":1.2, fill:"none"}, cf);
      const l = el("text", {x:(h[0]+h[2])/2, y:h[1]-8, "text-anchor":"middle", class:"ni"}, cf); l.textContent = `clic ${i+1}`;
    });
    if (cfMode === "ara") {
      el("path", {d:"M460,104 C380,150 260,150 186,108", stroke:C.ink, "stroke-width":.9, fill:"none", "stroke-dasharray":"3 3"}, cf);
      const b = el("text", {x:320, y:158, "text-anchor":"middle", class:"ni"}, cf); b.textContent = "↑ torna on llegies";
    }
    const r = el("text", {x:320, y:196, "text-anchor":"middle", class:"nt"}, cf);
    r.textContent = cfMode === "abans" ? "Dos salts, i la tornada només fins a la nota" : "Un salt, i la tornada fins al número exacte";
    r.setAttribute("fill", cfMode === "abans" ? C.red : C.ink);
    el("circle", {id:"cf-dot", r:5, fill:C.red, cx:180, cy:hops[0][1]}, cf);
  }
  function animCite(now){
    const d = document.getElementById("cf-dot");
    if (d) {
      const pts = cfMode === "abans" ? [[180,91],[240,91],[400,91],[460,91]] : [[180,80],[460,80]];
      const per = 4200, p = ((now - cfT0) % per) / per;
      let x, y;
      if (cfMode === "abans") {
        // text → nota (0–0.35), pausa, nota → font (0.5–0.85)
        const seg = p < .35 ? [0, p/.35] : p < .5 ? [1, 0] : p < .85 ? [1, (p-.5)/.35] : [1, 1];
        const a = seg[0] === 0 ? pts[0] : pts[2], b = seg[0] === 0 ? pts[1] : pts[3];
        if (p >= .35 && p < .5) { x = 320; y = 91; } else { x = a[0] + (b[0]-a[0])*seg[1]; y = a[1]; }
      } else {
        const q = p < .45 ? p/.45 : p < .55 ? 1 : p < 1 ? 1 - (p-.55)/.45 : 0;
        x = pts[0][0] + (pts[1][0]-pts[0][0])*q; y = 80 + (p >= .55 ? Math.sin(Math.PI*(p-.55)/.45)*46 : 0);
      }
      d.setAttribute("cx", x); d.setAttribute("cy", y);
    }
    if (!reduced) requestAnimationFrame(animCite);
  }
  const cfSeg = cf.previousElementSibling;
  cfSeg.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; pressed(cfSeg, b); cfMode = b.dataset.c; cfT0 = performance.now(); drawCite(); });
  drawCite(); if (!reduced) requestAnimationFrame(animCite);

  /* Demo de cita viva */
  const dc = document.querySelector(".demo-cite");
  dc.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a) return; e.preventDefault();
    const li = document.getElementById("dc-f"), sup = document.getElementById("dc-c");
    const toFont = a.id === "dc-c";
    li.classList.toggle("on", toFont); sup.classList.toggle("on", !toFont);
    (toFont ? li.querySelector("a.bk") : sup).focus({preventScroll:true});
  });

  /* ---------- Formes: sí i no ---------- */
  const forms = document.getElementById("forms");
  const FORMS = [
    ["y", "Cercles translúcids", "d'àrea proporcional, que se sumen on se solapen.", g => { [[60,60,34,C.red],[100,52,26,C.red],[150,66,40,C.blue],[200,48,18,C.blue]].forEach(c => el("circle",{cx:c[0],cy:c[1],r:c[2],fill:c[3],"fill-opacity":.28,style:"mix-blend-mode:multiply"},g)); }],
    ["n", "Anells concèntrics", "tipus diana per marcar llocs o quantitats.", g => { [[70,60],[170,60]].forEach(p => [10,20,30,40].forEach(r => el("circle",{cx:p[0],cy:p[1],r,fill:"none",stroke:C.ink,"stroke-width":1},g))); }],
    ["y", "Mapa pla i net", "amb la costa recognoscible i tota la informació visible d'entrada.", g => { el("path",{d:"M30,40 C60,22 110,28 140,40 C170,52 200,40 225,52 L220,92 C180,100 120,96 80,90 C55,86 36,80 30,70 Z",fill:C.land},g); [[80,60,12],[150,70,18],[190,60,8]].forEach(c => el("circle",{cx:c[0],cy:c[1],r:c[2],fill:C.red,"fill-opacity":.32},g)); }],
    ["n", "Mapa inclinat amb agulles", "pseudo-3D, crestes abstractes o lupes que amaguen dades.", g => { el("path",{d:"M40,96 L200,96 L230,60 L80,60 Z",fill:C.land},g); [[90,84,40],[140,80,62],[180,74,30],[120,72,22]].forEach(s => el("rect",{x:s[0]-2,y:s[1]-s[2],width:4,height:s[2],fill:C.red},g)); }],
    ["y", "Totes les dades, petites", "punts translúcids: la forma de la distribució apareix sola.", g => { let s=7; const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;}; for(let i=0;i<260;i++){ const x=30+rnd()*200, y=100-Math.pow(rnd(),.7)*70*(1-Math.abs(x-130)/130); el("circle",{cx:x,cy:y,r:1.6,fill:C.blue,"fill-opacity":.35},g);} }],
    ["n", "Barres massisses de mitjanes", "que amaguen les dades darrere d'un rectangle.", g => { [[40,50],[90,70],[140,40],[190,60]].forEach(b => el("rect",{x:b[0],y:100-b[1],width:34,height:b[1],fill:C.ink2},g)); el("line",{x1:30,y1:100,x2:236,y2:100,stroke:C.ink,"stroke-width":1},g); }],
    ["y", "Anotat on passa", "títol en negreta i una línia de detall, amb una guia fina.", g => { el("path",{d:"M20,90 C70,86 100,80 130,60 C150,46 170,30 230,24",stroke:C.red,"stroke-width":2,fill:"none"},g); el("path",{d:"M172,34 L172,62 L150,62",stroke:C.ink,"stroke-width":.8,fill:"none"},g); const t=el("text",{x:96,y:76,"font-family":"Source Sans 3, sans-serif","font-size":12,"font-weight":700,fill:C.ink},g); t.textContent="L'any 2026"; const u=el("text",{x:96,y:90,"font-family":"Source Sans 3, sans-serif","font-size":11.5,fill:C.ink2},g); u.textContent="el més calent"; }],
    ["n", "Panell amb fons i ombra", "i una llegenda llunyana que obliga a anar i tornar.", g => { el("rect",{x:24,y:16,width:200,height:88,rx:6,fill:"#E4E4E4"},g); el("rect",{x:20,y:12,width:200,height:88,rx:6,fill:"#F0F0F0",stroke:"#BBB"},g); [[40,60],[80,40],[120,70],[160,30]].forEach((b,i)=>el("rect",{x:b[0],y:100-b[1]-6,width:20,height:b[1],fill:[C.ink2,C.ghost,C.muted,"#999"][i]},g)); }]
  ];
  FORMS.forEach(f => {
    const d = document.createElement("div"); d.className = "fm " + f[0];
    const s = el("svg", {viewBox:"0 0 250 112", role:"img", "aria-label": (f[0]==="y"?"Sí: ":"No: ") + f[1]}); d.appendChild(s); f[3](s);
    const p = document.createElement("p"); p.innerHTML = `<b>${f[0]==="y"?"Sí":"No"}.</b> ${f[1]}, ${f[2]}`; d.appendChild(p);
    forms.appendChild(d);
  });

  /* ---------- Hover ---------- */
  const hov = document.getElementById("hov"), dock = document.getElementById("hov-d");
  let dim = 0.5;
  (function(){
    let s = 11; const rnd = () => { s = (s*16807) % 2147483647; return s/2147483647; };
    const g = el("g", {}, hov);
    el("line", {x1:20, y1:200, x2:620, y2:200, stroke:C.hair, "stroke-width":1}, hov);
    const dots = [];
    for (let i = 0; i < 90; i++) {
      const x = 30 + rnd()*580, v = 20 + rnd()*80 + Math.sin(x/90)*18;
      const c = el("circle", {cx:x, cy:Math.max(16, 196 - v*1.45), r:4 + rnd()*7, fill: i % 4 === 0 ? C.red : C.blue, "fill-opacity":.42, stroke:C.ink, "stroke-width":0}, g);
      c.dataset.v = v.toFixed(1).replace(".", ","); c.dataset.n = i + 1; dots.push(c);
    }
    const on = c => { dots.forEach(d => { d.style.opacity = d === c ? 1 : dim; d.setAttribute("stroke-width", d === c ? 1.5 : 0); }); c.parentNode.appendChild(c); dock.textContent = `Punt ${c.dataset.n} · ${c.dataset.v}`; };
    const off = () => { dots.forEach(d => { d.style.opacity = 1; d.setAttribute("stroke-width", 0); }); dock.textContent = "Apunta un punt"; };
    hov.addEventListener("pointerover", e => { if (e.target.tagName === "circle") on(e.target); });
    hov.addEventListener("pointerleave", off);
    hov.addEventListener("click", e => { if (e.target.tagName === "circle") on(e.target); else off(); });
    const seg = hov.previousElementSibling;
    seg.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; pressed(seg, b); dim = +b.dataset.o; on(dots[17]); });
  })();

  /* ---------- Moviment ---------- */
  (function(){
    const cv = document.getElementById("flow"), ctx = cv.getContext("2d");
    let W = 0, H = 170, dur = 25, last = performance.now(), visible = true;
    const N = 70, parts = Array.from({length:N}, (_, i) => ({p: i/N, o: (Math.sin(i*12.9898)*43758.5453 % 1 + 1) % 1}));
    const pt = (p, o) => { const x = 10 + p*(W-20); const y = H/2 + Math.sin(p*Math.PI*2.2)*H*.26 + (o-.5)*34; return [x, y]; };
    function size(){ const r = window.devicePixelRatio || 1; W = cv.clientWidth; cv.width = W*r; cv.height = H*r; ctx.setTransform(r,0,0,r,0,0); }
    function frame(now){
      const dt = Math.min(.05, (now - last)/1000); last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.beginPath();
      for (let p = 0; p <= 1.001; p += .01) { const [x, y] = pt(p, .5); p ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      parts.forEach(q => {
        if (!reduced) q.p = (q.p + dt/dur) % 1;
        for (let k = 0; k < 8; k++) { const pp = q.p - k*.004; if (pp < 0) continue; const [x, y] = pt(pp, q.o); ctx.fillStyle = `rgba(44,93,168,${.55*(1-k/8)})`; ctx.fillRect(x-1, y-1, 2, 2); }
      });
      if (!reduced && visible) requestAnimationFrame(frame);
    }
    size(); window.addEventListener("resize", () => { size(); if (reduced) frame(performance.now()); });
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !visible && !reduced) { visible = true; last = performance.now(); requestAnimationFrame(frame); } visible = v; }).observe(cv);
    requestAnimationFrame(frame);
    const seg = cv.previousElementSibling;
    seg.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; pressed(seg, b); dur = +b.dataset.v; });
  })();

  /* ---------- Decisions preses ---------- */
  const TL = [
    ["21-11-2026", "<b>Lectura enfocada</b>: als paràgrafs llargs del cos (4 línies o més), les paraules que encara són al 24 % inferior de la pantalla surten més fluixes (fins a 0,12) i s'encenen una a una, en ordre de lectura, en pujar (cap degradat al damunt). És sistema: ho fa <code>assets/ib.js</code> a tots els articles, sense tocar-los. No s'aplica a l'scrolly, als peus de gràfic ni a «Dades i fonts», ni amb «reduir el moviment»."],
    ["21-11-2026", "<b>El temps de lectura es calcula, no s'escriu</b>: com Medium, unes 265 paraules per minut (la mitjana d'un adult, segons la seva pàgina d'ajuda), sense ajust per gràfics. Compta el cos de l'article, sense peus de gràfic ni «Dades i fonts». És una estimació; la referència científica (Brysbaert, 2019) dona 238 par/min en anglès. El calcula <code>sync-home.mjs</code>."],
    ["21-11-2026", "<b>El tema el decideix el dispositiu</b>: la web es veu en clar o en fosc segons el dispositiu, sense botó de sol/lluna a la barra."],
    ["21-11-2026", "<b>La descripció de portada és curta, s'entén sola i diu només la idea central</b>: sense eufemismes («quan la terra va tremolar»), sense referents que només s'expliquen dins i sense detalls (orígens, xifres secundàries, noms). Un desconegut, sense el títol ni l'article, ha de saber què passa."],
    ["21-11-2026", "<b>Text lleuger i ferm</b>: cap nom propi que no torni (només els protagonistes), cap paràgraf o gràfic que existeixi només per justificar l'altre, una idea una sola vegada, i cap matís de revisor dins el text. Si no es pot afirmar, no es posa; si la incertesa és el tema, es diu una vegada i al principi. Les discrepàncies entre fonts van a «Dades i fonts»."],
    ["20-11-2026", "<b>Miniatures de portada: sempre degradats</b>, mai il·lustracions de l'article. Si no n'hi ha de nous, es repeteix el d'un article antic perquè no es noti."],
    ["17-11-2026", "<b>La portada no es toca</b>: Helvetica Neue LT Pro i l'aspecte original. <b>Res d'«AI slop»</b>: cap rètol decoratiu, índex numerat, «Pròximament» ni text de farciment."],
    ["18-11-2026", "<b>Només tres colors</b>: vermell, blau i groc, amb els seus tons. Mai text en groc."],
    ["19-11-2026", "<b>Cercles translúcids, mai anells concèntrics</b> tipus diana."],
    ["19-11-2026", "<b>Mapes plans i nets</b>: res de mapes inclinats, agulles, crestes abstractes ni lupes que amaguin dades."],
    ["19-11-2026", "<b>Els mapes regionals van en relleu</b> (MAP-01, l'estil dels evangelis); els del món, en terra plana."],
    ["19-11-2026", "<b>Partícules lentes</b>: un recorregut de 20–35 segons."],
    ["19-11-2026", "<b>Hover clar</b>: l'element apuntat es destaca, la resta a 0,46–0,55 (mai a 0,15), lectura en una línia a sota."],
    ["19-11-2026", "<b>Models de referència</b>: el camp de vent (MAP-19) i el calendari de calor (TIME-07)."],
    ["20-11-2026", "<b>El verd és el quart color, el de la natura</b>: per dibuixar vegetació i, com a categoria, només si la categoria és natura viva (bosc, conreus, espais naturals). Mai per a text."],
    ["20-11-2026", "<b>El sistema s'ordena per l'ús</b>: vuit famílies amb codis en anglès (<code>TIME</code>, <code>MAP</code>, <code>SCALE</code>, <code>SPREAD</code>, <code>PART</code>, <code>LINK</code>, <code>HOW</code>, <code>CASE</code>), de la peça més bàsica a la més creativa, en una sola pàgina amb enllaços a cada secció. Els noms de les peces, en anglès i en català."],
    ["20-11-2026", "<b>Cites d'un sol clic</b>: el número porta directament a la font; l'entradeta i els peus de gràfic només enllacen a «Dades i fonts»."],
    ["20-11-2026", "<b>Persones d'època: l'obra real, no un dibuix inventat</b>. En escenes històriques es mostra la pintura, el fresc o el mosaic d'època (amb font i llicència) i la informació va al gràfic. La figura «Voyager» (<code>IBVOY</code>) és una estètica moderna: només per a temes contemporanis."],
    ["20-11-2026", "<b>Títols dels articles menys apretats</b>: el h1 en STIXGeneral passa d'un espaiat de −0,068 em a −0,04 em; tancat, però amb les lletres separades."],
    ["20-11-2026", "<b>Mode fosc a tota la web</b>: segueix el tema del sistema. Els articles s'escriuen només en clar; <code>assets/ib-theme.js</code> tradueix tots els colors, i cada article nou l'ha de carregar el primer al <code>&lt;head&gt;</code> (<code>check.mjs</code> ho exigeix)."],
    ["20-11-2026", "<b>Articles per penjar</b>: els articles a mig fer (<code>\"draft\": true</code> a <code>articles.json</code>) no surten a la portada; es llisten a la pàgina «Articles per penjar», enllaçada des del peu. Només passen a la portada quan l'editor ho diu."],
    ["20-11-2026", "<b>Peu de pàgina brutalment mínim</b>, igual a tota la web: una sola fila en sans serif, a una sola mida (13 px), alineada amb la línia superior. A l'esquerra «Inspired by Magazine» i l'any; a la dreta «Articles per penjar». Sense logo, sense lema i sense llista d'articles."],
    ["20-11-2026", "<b>Cap missatge que doni peu al racisme o a un neocolonialisme condescendent</b>. Mai «un X de [país]» com a rètol d'una persona; les persones, amb nom i com a subjecte de la frase; país o regió, no «l'Àfrica»; persones, no «casos» ni «propagadors»; cap història de rescat. Es revisa sobretot la descripció de portada, l'entradeta, el títol i els intertítols. Guia: <code>research/guia-representacio.md</code>."],
    ["Sense data", "<b>Mirada antropològica i transcultural</b> en tot tema humà. <b>Res inventat</b>: cada xifra amb font primària verificada. <b>Es publica des de <code>main</code></b>, a Netlify, sense publicar a mà."]
];
  document.getElementById("tl").innerHTML = TL.map(t => `<li><span class="d">${t[0]}</span><span class="x">${t[1]}</span></li>`).join("");

  /* ---------- Per decidir ---------- */
  const DEC = [
    { id:"anells", t:"Anells concèntrics: la peça MAP-04 encara en fa servir",
      why:"Vas decidir que mai anells concèntrics, però al sistema encara hi ha una peça i una eina que en dibuixen.",
      q:[["Cercles translúcids, MAI anells concèntrics (decisió de l'editor, 19-11-2026)", "research/sistema-infografic.md, §1"],
         ["MAP-04 · Anells proporcionals: un anell per cas (o 1 anell = N)… · IBV.rings: anells concèntrics finíssims", "research/sistema-infografic.md, §4 i §5"]],
      o:["Treure MAP-04 i IBV.rings del sistema", "Refer MAP-04 amb cercles translúcids d'àrea proporcional", "Mantenir MAP-04 com a excepció (un anell per cas no és una diana)"] },
    { id:"hover", t:"Quant s'apaga la resta en el hover",
      why:"La regla general diu 0,46–0,55, però algunes peces i el brief antic diuen molt menys.",
      q:[["La resta s'atenua suaument a 0,46–0,55 — mai a 0,15", "research/sistema-infografic.md, §4"],
         ["LINK-02: en passar-hi, la resta a 0,08 · MAP-19: les partícules baixen a 0,3 · IBV.focus: la resta baixa a 0,15", "research/sistema-infografic.md, §5, i research/brief-peces-noves.md"]],
      o:["0,46–0,55 a totes les peces sense excepció", "0,46–0,55 en general, però més fort on hi ha milers d'elements (LINK-02, MAP-19)"] },
    { id:"particules", t:"Velocitat de les partícules a MAP-12",
      why:"La norma general demana partícules lentes, però la fitxa d'MAP-12 sembla dir el contrari.",
      q:[["Partícules lentes i contemplatives: recorregut complet en ~20–35 segons", "research/sistema-infografic.md, §1"],
         ["MAP-12 · Arcs de flux: partícules més ràpides que llegibles, mai al revés", "research/sistema-infografic.md, §5"]],
      o:["Lentes a tot arreu, també a MAP-12", "MAP-12 pot anar més ràpid perquè el sentit del flux es llegeixi"] },
    { id:"model", t:"El model de qualitat no segueix les normes actuals",
      why:"Les guies diuen que el model és «El Niño i La Niña», però aquest article fa servir colors que ara estan prohibits (ocre, verd mar, verd) i no té el sistema de cites nou.",
      q:[["Model de referència: «El Niño i La Niña». Llegeix-lo sencer abans de començar", "research/guia-estil-articles.md"],
         ["Els articles anteriors fan servir --dry, --wet i --bio. Es queden en aquells articles; en els nous, no", "research/sistema-infografic.md, §2"]],
      o:["Actualitzar El Niño perquè compleixi les normes i continuï sent el model", "Canviar de model per un article recent (p. ex. Per què riem o Stonehenge)", "Mantenir El Niño com a model de redacció i gràfics, i un article recent com a model de colors i cites"] },
    { id:"antics", t:"Vuit articles antics no tenen les cites noves",
      why:"Calendari còsmic, la cinta transportadora, De què mor el món, El Niño, la migració vertical, On va el CO₂, la pols del Sàhara i Virus i bacteris tenen un paràgraf «Fonts» final i cap número de cita al text. En la majoria, els peus de gràfic expliquen les fonts, i dos (Calendari còsmic i De què mor el món) les llisten a l'entradeta.",
      q:[["Cada número del text porta directament a la seva font… L'entradeta i els peus de gràfic no expliquen fonts", "AGENTS.md"]],
      o:["Convertir-los tots al sistema nou (cal posar números de cita al text)", "Només treure les fonts dels peus i de l'entradeta i enllaçar a «Fonts»", "Deixar-los com estan: són d'abans de la norma"] },
    { id:"colors", t:"Colors fora de la paleta en set articles",
      why:"La comprovació automàtica avisa a set articles. Molts són grisos o tons de terra i pedra (permesos, però el control no els distingeix). Els que surten clarament de la paleta són el taronja i el blau cel de De què mor el món (#B07A1F, #EC370A, #50A0C1) i el vermell i el blau diferents de la cinta transportadora (#D85A3F, #1E498C).",
      q:[["Només vermell, blau i groc (i els seus tons), grisos i terra", "AGENTS.md"],
         ["Els articles anteriors fan servir --dry, --wet i --bio. Es queden en aquells articles", "research/sistema-infografic.md, §2"]],
      o:["Passar els colors clarament fora de paleta als tres colors, i ensenyar al control a acceptar grisos i terres", "Deixar els articles antics com estan i només ajustar el control"] },
    { id:"representacio", t:"Quins canvis de la revisió de representació s'apliquen",
      why:"Els 23 articles anteriors s'han llegit amb la guia nova (21-11-2026) i hi ha 9 troballes altes i moltes de mitjanes, escrites a research/revisio-representacio-articles.md. Encara no s'ha canviat cap article. Els 12 de la portada són els que més es llegeixen.",
      q:[["Cap missatge que pugui donar peu al racisme ni a un neocolonialisme condescendent… sobretot a la descripció de portada, l'entradeta, el títol i els intertítols", "AGENTS.md"],
         ["Quatre lectors independents han llegit els 23 articles; cada proposta és un punt de partida i les que afegeixen informació duen «cal verificar»", "research/revisio-representacio-articles.md"]],
      o:["Aplicar totes les altes i mitjanes, primer als 12 de la portada", "Aplicar només les altes, primer als 12 de la portada", "Aplicar només els canvis a descripcions, titulars i entradetes", "Aplicar-ho només abans de publicar els articles de «per penjar»"] },
    { id:"termesoficials", t:"Termes oficials que la guia de representació prohibeix: «tribu» i «països en desenvolupament»",
      why:"Dos articles fan servir el nom legal d'una cosa: «tribu» (els cherokees són una tribu reconeguda pel govern dels Estats Units) i «països en desenvolupament» (és el terme de l'article 5 del Protocol de Montreal). La guia els prohibeix sense excepcions.",
      q:[["Cap «tribu», «primitiu», «ancestral»… ni «països en vies de desenvolupament» (diem el nom del país o «països de renda baixa»)", "research/guia-representacio.md, §1.7"]],
      o:["Mantenir la prohibició sense excepcions i reescriure aquestes frases", "Permetre'ls només com a terme oficial: entre cometes, amb la font i dient que és el nom legal", "Permetre'ls sempre que siguin el terme oficial"] },
    { id:"peumobil", t:"El peu dels gràfics al mòbil",
      why:"Per guanyar espai, la guia de mòbil diu que s'amagui el peu dins de les seccions de scroll. Però el peu és on es diu si són dades reals, un esquema o una simulació.",
      q:[["Amaga .graphic .src en mòbil dins dels .scrolly si no hi cap", "research/guia-mobil.md, §2"],
         ["P9 · Dada, simulació o esquema, sempre dit: el peu diu què és", "research/sistema-infografic.md, §1"]],
      o:["El peu sempre visible, també al mòbil (és una sola línia)", "Es pot amagar al mòbil dins del scroll"] }
  ];
  const saved = store.get("ib-guidelines-dec") || {};
  const wrap = document.getElementById("dec");
  wrap.innerHTML = DEC.map(d => `<div class="dc" id="d-${d.id}"><h3>${d.t}</h3><p class="why">${d.why}</p>${d.q.map(q => `<blockquote>«${q[0]}»<cite>${q[1]}</cite></blockquote>`).join("")}<div class="opts" role="radiogroup" aria-label="${d.t}">${d.o.map((o,i) => `<label class="${saved[d.id]&&saved[d.id].o===i?"on":""}"><input type="radio" name="${d.id}" value="${i}" ${saved[d.id]&&saved[d.id].o===i?"checked":""}> ${o}</label>`).join("")}</div><textarea aria-label="Nota sobre: ${d.t}" placeholder="Nota (opcional)">${(saved[d.id]&&saved[d.id].n)||""}</textarea></div>`).join("");
  const nPend = () => { const n = DEC.filter(d => !(saved[d.id] && saved[d.id].o != null)).length; document.getElementById("nPend").textContent = n; };
  wrap.addEventListener("change", e => {
    if (e.target.type !== "radio") return; const id = e.target.name;
    saved[id] = Object.assign(saved[id] || {}, {o: +e.target.value}); store.set("ib-guidelines-dec", saved);
    e.target.closest(".opts").querySelectorAll("label").forEach(l => l.classList.toggle("on", l.contains(e.target))); nPend();
  });
  wrap.addEventListener("input", e => { if (e.target.tagName !== "TEXTAREA") return; const id = e.target.closest(".dc").id.slice(2); saved[id] = Object.assign(saved[id] || {}, {n: e.target.value}); store.set("ib-guidelines-dec", saved); });
  nPend();
  document.getElementById("copy").addEventListener("click", async () => {
    const lines = ["Decisions sobre les guidelines d'Inspired by:"];
    DEC.forEach(d => { const s = saved[d.id] || {}; lines.push(`- ${d.t}: ${s.o != null ? d.o[s.o] : "(sense decidir)"}${s.n ? ` — Nota: ${s.n}` : ""}`); });
    const txt = lines.join("\n"), out = document.getElementById("copied");
    try { await navigator.clipboard.writeText(txt); out.textContent = "Copiat. Enganxa-ho a Claude."; }
    catch (e) { out.textContent = "No s'ha pogut copiar automàticament; selecciona el text de sota."; const pre = document.createElement("pre"); pre.textContent = txt; pre.style.cssText = "white-space:pre-wrap;font-family:var(--sans);font-size:13px;width:100%"; out.after(pre); }
  });
})();
