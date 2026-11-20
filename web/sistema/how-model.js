/* Sistema infogràfic d'Inspired by Magazine · HOW-03 · Line model / Maqueta de línia.
   Bloc complet que es pot copiar a un article: un monument de pedra en perspectiva, girable, dibuixat com un gravat.
   Demo: el recinte de taula de Talatí de Dalt (Maó, Menorca), santuari postalaiòtic dels segles VI–V aC.
   Fa servir assets/ib-viz.js (IBV), assets/ib-gent.js (IBGENT) i assets/ib-3d.js (IB3D).
   Fonts i què és esquemàtic: research/sistema/taula-fonts.md. */
(function(){
"use strict";
const V = IBV, C = V.C, E = window.IB3D, D2R = Math.PI/180;
const el = document.querySelector('[data-p="how-03"]'); if(!el || !E) return;
const fig = el.closest(".pc"), tp = V.tip(el);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v)), ease = d3.easeCubicInOut;

/* ---------- 1. Dades del monument (metres; x = est, y = nord; la taula al centre) ---------- */
// Verificat: capitell de fins a 4 × 1,5 m (Enciclopèdia Catalana); recinte en ferradura amb façana de grans lloses i porta
// adintellada, pilastres adossades al mur interior (Univ. d'Alacant); columna perimetral caiguda recolzada a la taula, al costat
// dret (Juan Benejam i Pons 2005); estructures de combustió dins dels recintes. Esquemàtic: alçada del suport (3 m, dins del
// rang habitual de 2–3 m), mides del recinte, nombre de pilastres, orientació, mides del talaiot.
const M = [], WALLS = [];
const rnd = V.rng(23); let seed = 1;
const add = o => { o.seed = (seed += 7919); M.push(o); return o; };
// la taula: pedra de suport i capitell, amb la cara ampla cap a la porta (sud)
add({id:"taula", g:"taula", nom:"La taula", x:0, y:0, rot:90, w:2.3, t:.42, h:3.0, z0:0, taper:.97, fin:"dressed", pal:"lime"});
add({id:"taula", g:"taula", nom:"La taula", x:0, y:0, rot:90, w:4.0, t:1.5, h:.55, z0:3.0, slab:true, fin:"dressed", pal:"lime"});
// columna perimetral caiguda, recolzada en diagonal a l'extrem dret del capitell
add({id:"columna", g:"columna", nom:"Columna caiguda", x:3.95, y:1.55, rot:125, w:.95, t:.55, h:3.05, z0:0, taper:.92, fin:"slab", pal:"lime", lean:[-1.85,-1.3]});
// recinte en ferradura: mur de paret seca (conservat baix) obert al sud
const CX = 0, CY = .9, RR = 6.6, A0 = -24, A1 = 204;
{ const pts = []; for(let a = A0; a <= A1; a += 9) pts.push([CX + RR*Math.cos(a*D2R), CY + RR*Math.sin(a*D2R)]);
  WALLS.push({id:"recinte", g:"recinte", nom:"Recinte en ferradura", pts, h:1.35, t:1.3, seed:11}); }
// pilastres adossades a la cara interior del mur
for(let i=0;i<7;i++){ const a = 12 + i*26, r = RR - .65 - .3, x = CX + r*Math.cos(a*D2R), y = CY + r*Math.sin(a*D2R);
  if(Math.hypot(x - 3.95, y - 1.55) < 1.2) continue;
  add({id:"pil"+i, g:"pilastra", nom:"Pilastra adossada", x, y, rot:90 - a, w:.55, t:.75, h:2.1 + rnd()*.25, z0:0, taper:.95, fin:"slab", pal:"lime"}); }
// façana plana de grans lloses i porta adintellada al centre
{ const yF = CY + RR*Math.sin(A0*D2R) - .2, xE = CX + RR*Math.cos(A0*D2R) + .3;
  const xs = [-xE+.5, -xE+1.75, -2.6, -1.4, 1.4, 2.6, xE-1.75, xE-.5];
  xs.forEach((x,i) => add({id:"facana", g:"facana", nom:"Façana de grans lloses", x, y:yF + Math.abs(x)*.05, rot:90, w:1.15, t:.45, h:1.9 + rnd()*.35, z0:0, taper:.95, fin:"slab", pal:"lime"}));
  [-.72, .72].forEach(x => add({id:"porta", g:"porta", nom:"Porta adintellada", x, y:yF, rot:90, w:.55, t:.55, h:1.85, z0:0, taper:.98, fin:"slab", pal:"lime"}));
  add({id:"porta", g:"porta", nom:"Porta adintellada", x:0, y:yF, rot:90, w:2.3, t:.6, h:.45, z0:1.85, slab:true, fin:"slab", pal:"lime"});
  M.yF = yF; }
// talaiot (posició i mides esquemàtiques): terrasses de paret seca
const TX = -24, TY = 21;
[[6.2,0],[5.4,1.5],[4.6,3.0]].forEach(([r,z],k) => { const pts = []; for(let a=0;a<360;a+=12) pts.push([TX + r*Math.cos(a*D2R), TY + r*Math.sin(a*D2R)]);
  WALLS.push({id:"talaiot", g:"talaiot", nom:"Talaiot", pts, closed:true, h:1.5, t:k === 2 ? r*1.02 : Math.min(r, 3.2), z0:z, seed:40+k}); });
// vegetació: ullastres i mates de màquia, fora del recinte (verd: natura)
const TREES = [], TUFTS = [];
{ const rr = V.rng(5), free = (x,y) => Math.hypot(x - CX, y - CY) > RR + 2.2 && Math.hypot(x - TX, y - TY) > 8 && !(Math.abs(x) < 3 && y < 0);
  let k = 0; while(TREES.length < 10 && k++ < 400){ const a = rr()*6.283, d = 11 + rr()*12, x = Math.cos(a)*d, y = Math.sin(a)*d + 2; if(!free(x,y)) continue;
    TREES.push({x, y, h:3.0 + rr()*1.4, r:1.2 + rr()*.6, seed:100 + TREES.length}); }
  k = 0; while(TREES.filter(t => t.bush).length < 26 && k++ < 800){ const a = rr()*6.283, d = 9 + rr()*15, x = Math.cos(a)*d, y = Math.sin(a)*d + 1; if(!free(x,y)) continue;
    TREES.push({x, y, h:.8 + rr()*.4, r:.5 + rr()*.35, bush:true, seed:300 + k}); }
  for(let i=0;i<700;i++){ const a = rr()*6.283, d = Math.sqrt(rr())*26, x = Math.cos(a)*d, y = Math.sin(a)*d + 1; if(!free(x,y)) continue; TUFTS.push([x, y, .16 + rr()*.2]); } }
const LAWN = d3.range(80).map(i => { const a = i/80*6.283; return [Math.cos(a)*27, Math.sin(a)*27 + 2]; });
// la llar de foc (estructura de combustió) dins del recinte
const HEARTH = {x:-2.6, y:-.7, r:.55};
const GROUPS = {
  taula:"Pedra de suport i capitell, llisos i amb els caires vius · capitell de fins a 4 × 1,5 m",
  columna:"Una columna del recinte, caiguda, que encara es recolza en equilibri a la taula",
  recinte:"Paret de pedra mitjana en forma de ferradura, segles VI–V aC · conservada baixa",
  pilastra:"Pilastra adossada al mur: fa de contrafort i crea petites capelles (esquemàtica)",
  facana:"Façana plana de grans lloses",
  porta:"Porta principal adintellada",
  talaiot:"Talaiot del poblat, torre de vigilància de c. 900–800 aC (mides esquemàtiques)"
};
// gent del període postalaiòtic: dos miren la taula, un cuida el foc, un altre entra per la porta
const PEOPLE = [
  {x:-.7, y:-2.4, pose:"mira", az:0, h:1.6, pel:"llarg", capa:true},
  {x:.55, y:-2.9, pose:"mira", az:10, h:1.68, pel:"curt"},
  {x:-2.05, y:-1.35, pose:"dret", az:-60, h:1.62, pel:"monyo"},
  {x:0, y:-6, pose:"camina", az:0, h:1.66, pel:"curt", capa:true, walk:true, k:.3}
];

/* ---------- 2. Vistes, càmera i dibuix ---------- */
const VIEWS = {
  porta: {el:24, dist:22, tz:1.2, fov:40},
  dalt:  {el:68, dist:31, tz:0, fov:40},
  terra: {el:5, dist:15, tz:1.7, fov:44}
};
let view = Object.assign({}, VIEWS.porta), az = 196, auto = !V.reduced, hoverId = null, W = 0, H = 0, ctx = null, hits = [], drag = false, tween = null;

function groundExtra(c, cam){
  // llar: anell de pedres i foc (groc i vermell, el color de la història)
  const ring = d3.range(11).map(i => { const a = i/11*6.283; return cam.p([HEARTH.x + HEARTH.r*Math.cos(a), HEARTH.y + HEARTH.r*Math.sin(a), 0]); });
  if(ring.some(v => !v)) return;
  c.beginPath(); ring.forEach((q,i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fillStyle = V.alpha(C.ink, .08); c.fill();
  c.beginPath(); ring.forEach(q => { c.moveTo(q[0]+2.4, q[1]); c.ellipse(q[0], q[1], 2.4, 1.6, 0, 0, 6.283); }); c.fillStyle = E.pals().lime[8]; c.fill(); c.strokeStyle = V.alpha(C.ink, .7); c.lineWidth = .6; c.stroke();
  const b = cam.p([HEARTH.x, HEARTH.y, 0]), t = cam.p([HEARTH.x, HEARTH.y, .7]); if(!b || !t) return;
  const hh = b[1] - t[1], now = V.reduced ? 0 : performance.now()/1000;
  const g = c.createRadialGradient(b[0], b[1] - hh*.3, 0, b[0], b[1] - hh*.3, hh*1.6); g.addColorStop(0, V.alpha(C.yellow, .35)); g.addColorStop(1, V.alpha(C.yellow, 0));
  c.fillStyle = g; c.beginPath(); c.arc(b[0], b[1] - hh*.3, hh*1.6, 0, 6.283); c.fill();
  [[C.yellow, 1, 0], [C.red, .62, 1.7]].forEach(([col, k, ph]) => {
    const fl = 1 + .12*Math.sin(now*7 + ph) + .06*Math.sin(now*13 + ph), w = hh*.32*k, hgt = hh*k*fl;
    c.beginPath(); c.moveTo(b[0] - w, b[1] - 1); c.quadraticCurveTo(b[0] - w*.9, b[1] - hgt*.55, b[0] + w*.15*Math.sin(now*5 + ph), b[1] - hgt);
    c.quadraticCurveTo(b[0] + w*.9, b[1] - hgt*.55, b[0] + w, b[1] - 1); c.closePath(); c.fillStyle = V.alpha(col, .9); c.fill(); });
}
function ctext(c, x, y, s, o){ o = o||{};
  c.save(); c.font = `${o.weight||400} ${o.size||12.5}px ${V.SANS}`; c.textAlign = o.anchor||"left"; c.textBaseline = "middle";
  c.lineJoin = "round"; c.lineWidth = 3.2; c.strokeStyle = (getComputedStyle(document.documentElement).getPropertyValue("--paper")||"").trim() || "#fff"; c.strokeText(s, x, y);
  c.fillStyle = o.fill||C.ink; c.fillText(s, x, y); c.restore(); }
function labels(cam){
  const mob = W < 600;
  const L3 = (P, txt, dx, dy) => {
    const q = cam.p(P); if(!q || q[0] < 10 || q[0] > W-10 || q[1] < 12 || q[1] > H-10) return;
    const right = dx >= 0; ctx.font = `700 12.5px ${V.SANS}`; const tw = Math.max(...txt.map(t => ctx.measureText(t).width)) + 6;
    const tx = right ? clamp(q[0]+dx, 6, W-6-tw) : clamp(q[0]+dx, 6+tw, W-6), ty = clamp(q[1]+dy, 14, H-14);
    ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0], ty); ctx.lineTo(tx, ty); ctx.strokeStyle = C.ink; ctx.lineWidth = .8; ctx.stroke();
    ctx.beginPath(); ctx.arc(q[0], q[1], 1.8, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
    ctext(ctx, tx + (right?4:-4), ty-7, txt[0], {weight:700, anchor:right?"left":"right"});
    if(txt[1]) ctext(ctx, tx + (right?4:-4), ty+8, txt[1], {anchor:right?"left":"right", fill:C.ink2});
  };
  L3([-.9, 0, 3.6], ["La taula", "capitell de fins a 4 × 1,5 m"], mob ? -24 : -90, -40);
  L3([3.4, 1.15, 1.6], ["Columna caiguda", "recolzada a la taula"], mob ? 22 : 70, -46);
  if(!mob || view.el > 40) L3([CX + RR*Math.cos(150*D2R), CY + RR*Math.sin(150*D2R), 1.35], ["Recinte en ferradura", "segles VI–V aC"], mob ? -16 : -60, -28);
  L3([HEARTH.x, HEARTH.y, .5], ["Foc", "estructura de combustió"], mob ? -30 : -70, 34);
  if(!mob) L3([TX, TY, 4.6], ["Talaiot", "c. 900–800 aC"], 50, -22);
}
function draw(){
  if(!ctx) return;
  const v = view, now = V.reduced ? 0 : performance.now();
  PEOPLE.forEach(pp => { if(!pp.walk) return; const d = ((now/1000*.55) % 9); pp.y = -12.5 + d; pp.x = .05*Math.sin(d); });
  const cam = E.camera(Object.assign(E.orbit(az, v.el, v.dist, [0, .4, v.tz]), {fov:v.fov, cy: v.el > 60 ? .5 : .43}), W, H);
  hits = E.render(ctx, W, H, cam, M, {
    walls:WALLS, trees:TREES, tufts:TUFTS, lawn:LAWN, center:[0,2,0], fadeR:.62,
    lawnFill:d3.interpolateLab("#FFFFFF", C.greenLight)(.55), people:PEOPLE, t:now, groundExtra,
    highlight: hoverId ? (s => s.id === hoverId) : null, wallPal:"lime"
  });
  labels(cam);
}

V.mount(el, (container, w) => {
  W = w; H = Math.round(clamp(w*.6, 340, 600));
  ({ctx} = V.canvas(container, W, H, "Maqueta de línia del recinte de taula de Talatí de Dalt (Menorca): la taula amb el capitell, una columna caiguda que s'hi recolza, el recinte de paret seca en ferradura amb pilastres, la façana de grans lloses, un foc, gent del període postalaiòtic, ullastres i un talaiot al fons. Es pot girar arrossegant."));
  const cv = container.querySelector("canvas.ibv");
  E.dragOrbit(cv, dx => { auto = false; drag = true; az += dx*.35; hoverId = null; tp.hide(); draw(); }, () => { drag = false; });
  cv.addEventListener("pointermove", ev => {
    if(drag) return;
    const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    let best = null, bd = 30*30;
    for(const h of hits){ const d = (h.x-x)**2 + (h.y-y)**2; if(d < bd || (best && d < bd*1.4 && h.d < best.d - 4)){ bd = Math.min(bd, d); best = h; } }
    const id = best ? best.s.id : null;
    if(id !== hoverId){ hoverId = id; draw(); }
    if(best){ tp.show(`<b>${best.s.nom}</b> · ${GROUPS[best.s.g]}`); auto = false; } else tp.hide();
  });
  cv.addEventListener("pointerleave", () => { hoverId = null; tp.hide(); draw(); });
  draw();
});
fig && fig.querySelectorAll('[data-seg="how-03"] button').forEach(b => b.addEventListener("click", () => {
  fig.querySelectorAll('[data-seg="how-03"] button').forEach(o => o.setAttribute("aria-pressed", o === b));
  const from = Object.assign({}, view), to = VIEWS[b.dataset.k];
  if(V.reduced){ view = Object.assign({}, to); draw(); return; }
  tween = {from, to, t0:performance.now()};
}));
V.loop(el, (t, dt) => {
  if(tween){ const k = clamp((performance.now() - tween.t0)/1100, 0, 1), e = ease(k);
    for(const key of ["el","dist","tz","fov"]) view[key] = tween.from[key] + (tween.to[key] - tween.from[key])*e;
    if(k >= 1) tween = null; draw(); return; }
  if(!drag){ if(auto) az += dt*.003; draw(); }
});
})();
