/* «Per què van aixecar Stonehenge?» · gent */
(function(){
  "use strict";
  const S3 = window.SH3D, C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C);
  const {segBind, clamp} = window.SHA;
  const D2R = Math.PI/180, R2D = 180/Math.PI, AX = S3.AX;
  const STONE = "#E4DFD5", STONE2 = "#CFC8BA";

  /* =========================================================================
     V9 · QUI HI HAVIA (PART-01 + TIME-10)
     Tres vistes: els morts del recinte (planta de la fase 1 amb els 56 forats Aubrey i el forat 7),
     el canvi d'ascendència (cent persones que canvien de color sobre una línia de temps)
     i l'any dels porcs (espiral de dos anys amb els parts i els sacrificis d'hivern).
     ========================================================================= */
  (function initGent(){
    const el = document.getElementById("gent-viz"); if(!el) return;
    const fig = el.closest("figure"), tp = IBV.tip(el);
    let tab = "morts", W = 0, svg = null, timers = [], mob = false;
    segBind(fig.querySelector(".seg"), "k", k => { tab = k; render(); });
    const stopAll = () => { timers.forEach(t => t.stop()); timers = []; };
    function render(){
      if(!svg) return;
      stopAll();
      svg.selectAll("*").remove(); svg.on("click.g", null);
      const h = ({morts:hMorts, adn:hAdn, porc:hPorc})[tab]();
      svg.attr("height", h).attr("viewBox", `0 0 ${W} ${h}`);
      ({morts, adn, porc})[tab](h);
      if(mob){ const bb = svg.node().getBBox(), hh = Math.ceil(bb.y + bb.height + 14); svg.attr("height", hh).attr("viewBox", `0 0 ${W} ${hh}`); }
    }
    const hMorts = () => mob ? 900 : Math.round(clamp(W*.5, 440, 560));
    const hAdn = () => mob ? 780 : Math.round(clamp(W*.47, 450, 540));
    const hPorc = () => mob ? 820 : Math.round(clamp(W*.47, 440, 530));

    // figura humana del Neolític (la mateixa de la maqueta), com a grup SVG
    const PEL = ["llarg","curt","monyo"];
    function person(g, x, y, hh, o){
      o = o||{};
      const r = S3.silPaths(x, y, hh, o.pose||"dret", o.ph||0, o.dir||1, {pel:o.pel||"curt", capa:!!o.capa});
      const gg = g.append("g").attr("fill", o.fill||C.ink);
      r.paths.forEach(d => gg.append("path").attr("d", d));
      return gg;
    }
    // porc de perfil (porc domèstic neolític: llom alt, morro llarg)
    function pig(g, x, y, s, fill, dir){
      dir = dir||1;
      const k = (px,py) => [x + dir*px*s, y + py*s];
      const p = d3.path(), M = (a,b) => p.moveTo(...k(a,b)), Q = (a,b,c,d) => { const [x1,y1] = k(a,b), [x2,y2] = k(c,d); p.quadraticCurveTo(x1,y1,x2,y2); }, L = (a,b) => p.lineTo(...k(a,b));
      M(-1,-.15); Q(-1.02,-.62,-.4,-.66); Q(.25,-.72,.62,-.5); Q(.82,-.42,1.02,-.3); L(1.12,-.22); Q(1.16,-.12,1.08,-.08); Q(.8,-.04,.6,.05);
      L(.55,.05); L(.55,.42); L(.42,.42); L(.42,.12); L(-.55,.12); L(-.6,.42); L(-.73,.42); L(-.74,.08); Q(-1.0,.05,-1,-.15); p.closePath();
      // orella
      M(.5,-.58); L(.62,-.82); L(.72,-.52); p.closePath();
      const n = g.append("path").attr("d", p.toString()).attr("fill", fill||C.ink);
      g.append("path").attr("d", (() => { const q = d3.path(); const a = k(-.98,-.32), b = k(-1.18,-.42), c = k(-1.12,-.22); q.moveTo(...a); q.quadraticCurveTo(...b, ...c); return q.toString(); })())
        .attr("fill","none").attr("stroke", fill||C.ink).attr("stroke-width", Math.max(.6, s*.06)).attr("stroke-linecap","round");
      return n;
    }

    /* ------------------------------------------------------------------ ELS MORTS */
    function morts(h){
      const R = mob ? (W-24)/2/1.0 : Math.min(h*.45, W*.25);   // R = radi exterior del fossat (57 m)
      const cx = mob ? W/2 : R + 26, cy = mob ? R + 34 : h/2 + 6, k = R/57.5;
      const P = (r,b) => [cx + r*k*Math.sin(b*D2R), cy - r*k*Math.cos(b*D2R)];
      const g = svg.append("g");
      const arcP = (r, b0, b1) => { const n = Math.ceil(Math.abs(b1-b0)/2); return d3.range(n+1).map(i => P(r, b0 + (b1-b0)*i/n)); };
      const line = d3.line();
      // fossat i talús amb les dues entrades (NE i S)
      const segs = [[AX+9, 157],[163, 360+AX-9]];
      segs.forEach(([b0,b1]) => {
        [[56.5,.75,C.ink],[53.2,.6,C.ink],[50.4,.5,IBV.alpha(C.ink,.5)],[47.8,.5,IBV.alpha(C.ink,.5)]].forEach(([r,wd,col]) =>
          g.append("path").attr("d", line(arcP(r,b0,b1))).attr("fill","none").attr("stroke",col).attr("stroke-width",wd));
        for(let b=b0+.8;b<b1;b+=2.2){ const [x0,y0] = P(53.2,b), [x1,y1] = P(53.2 + ((Math.round(b/2.2)%2)?1.8:3.3), b);
          g.append("line").attr("x1",x0).attr("y1",y0).attr("x2",x1).attr("y2",y1).attr("stroke",IBV.alpha(C.ink,.35)).attr("stroke-width",.5); }
      });
      // el cercle de sarsens que vindrà després (c. 2500 aC), en fantasma per donar escala
      g.append("circle").attr("cx",cx).attr("cy",cy).attr("r",15*k).attr("fill","none").attr("stroke",C.ghost).attr("stroke-width",.8).attr("stroke-dasharray","2 3");
      if(!mob) IBV.t(g, cx, cy+4, "aquí, 500 anys després, els sarsens", {size:11, anchor:"middle", fill:C.muted, italic:true});
      // els 56 forats Aubrey, amb les cremacions (punts: fragments d'os cremat; posicions il·lustratives)
      const rnd = IBV.rng(11), holes = [];
      for(let i=0;i<56;i++){ const b = AX+3.2+i*360/56, [x,y] = P(44,b); holes.push({i, n:i+1, b, x, y}); }
      const hg = g.append("g");
      holes.forEach(d => {
        const a = (d.b)*D2R;
        hg.append("ellipse").datum(d).attr("class","hole").attr("cx",d.x).attr("cy",d.y).attr("rx",Math.max(2.4,.9*k)).attr("ry",Math.max(2.4,.9*k))
          .attr("fill", d.n===7 ? IBV.alpha(C.vermell,.18) : STONE).attr("stroke", d.n===7 ? C.vermell : IBV.alpha(C.ink,.7)).attr("stroke-width", d.n===7 ? 1.3 : .6);
      });
      // 240 dipòsits (150 segurs, 90 possibles): als forats, al fossat i al talús
      const deps = [];
      for(let i=0;i<240;i++){
        const u = rnd(), ring = u < .55 ? 44 : u < .8 ? 54.8 : u < .95 ? 49 : 40 + rnd()*8;
        let b = rnd()*360; if(ring === 54.8 || ring === 49){ if(b > AX-10 && b < AX+10) b += 20; if(b > 155 && b < 165) b += 12; }
        if(ring === 44){ const hi = Math.floor(rnd()*56); b = holes[hi].b + (rnd()-.5)*2.2; }
        const r = ring + (rnd()-.5)*(ring===44?1.6:2.2), [x,y] = P(r, b);
        deps.push({x, y, k:i < 150 ? "min" : "max", i});
      }
      const dg = g.append("g");
      const dots = dg.selectAll("g").data(deps).join("g").attr("transform", d => `translate(${d.x},${d.y})`);
      dots.append("circle").attr("r", d => d.k==="min" ? 1.6 : 1.5).attr("fill", d => d.k==="min" ? C.ink2 : "none").attr("stroke", d => d.k==="max" ? IBV.alpha(C.ink,.5) : "none").attr("stroke-width",.6);
      // entrades i orientació
      const ne = P(62, AX); IBV.t(g, ne[0], ne[1], "entrada NE", {size:11, anchor:"middle", fill:C.muted, halo:true});
      const s = P(62, 160); IBV.t(g, s[0], s[1]+4, "entrada S", {size:11, anchor:"middle", fill:C.muted, halo:true});
      const h7 = holes[6];
      // escala
      { const x0 = mob ? 14 : cx - R, y0 = mob ? cy + R + 22 : h - 14; g.append("path").attr("d",`M${x0},${y0-4}V${y0}H${x0+50*k}V${y0-4}`).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7);
        IBV.t(g, x0+50*k+6, y0+2, "50 m", {size:11, fill:C.muted}); }

      // columna de la dreta (o a sota): tres blocs
      const bx = mob ? 14 : cx + R + 54, bw = W - bx - 10;
      let by = mob ? cy + R + 58 : Math.max(26, cy - 196);
      const B = svg.append("g");
      // 1. quants
      IBV.t(B, bx, by+26, "150–240", {serif:true, size:mob?34:40});
      IBV.lines(B, bx + (mob?136:160), by+8, [["persones cremades",true],["c. 3000–2500 aC: el cementiri més gran"],["del Neolític britànic; homes i dones","",C.ink2],["en proporcions semblants","",C.ink2]], {size:12});
      { const lg = B.append("g").attr("transform",`translate(${bx},${by+76})`);
        [[C.ink2,"un dipòsit (150, estimació mínima)"],[null,"fins a 240"]].forEach(([f,t],i) => { const xx = i*(mob?200:210);
          lg.append("circle").attr("cx",xx+3).attr("cy",0).attr("r",1.8).attr("fill",f||"none").attr("stroke",f?"none":IBV.alpha(C.ink,.5)).attr("stroke-width",.6);
          IBV.t(lg, xx+10, 0, t, {size:11.5, fill:C.ink2, base:"middle"}); }); }
      by += mob ? 112 : 124;
      // 2. el forat Aubrey 7: 27 persones, 22 adults i 5 infants o joves
      const b2 = B.append("g").attr("class","b7");
      IBV.lines(b2, bx, by, [["El forat Aubrey 7 · 27 persones",true,C.vermell],["com a mínim 22 adults i 5 infants o joves (Willis et al., 2016)","",C.ink2]], {size:12});
      const ph = mob ? 34 : 44, pw = Math.min(21, (bw-4)/14);
      const crowd = b2.append("g");
      for(let i=0;i<27;i++){ const col = i%14, row = Math.floor(i/14), child = i >= 22, hh = child ? ph*.62 : ph*(.9 + IBV.rng(i+5)()*.12);
        person(crowd, bx + 6 + col*pw, by + 40 + ph + row*(ph+8), hh, {pel:PEL[i%3], capa:i%4===1, dir:i%5===2?-1:1, pose:i%7===3?"mira":"dret", fill:C.vermell}); }
      by += 40 + 2*(ph+8) + 18;
      // 3. els 25 analitzats
      const b3 = B.append("g");
      IBV.lines(b3, bx, by, [["25 analitzades · 10 de lluny",true,C.blau],["l'estronci dels ossos encaixa amb l'oest de Gal·les,","",C.ink2],["la terra de les pedres blaves (Snoeck et al., 2018)","",C.ink2]], {size:12});
      const crowd3 = b3.append("g");
      for(let i=0;i<25;i++){ const col = i%13, row = Math.floor(i/13), far = i < 10;
        person(crowd3, bx + 6 + col*pw*1.06, by + 54 + ph + row*(ph+8), ph*(.9 + IBV.rng(i+40)()*.12), {pel:PEL[(i+1)%3], capa:i%3===0, dir:far?-1:1, fill:far ? C.blau : "#B4B4B4"}); }
      { const ay = by + 54 + ph*.55, ax = bx + 6 + 10*pw*1.06 - 4;
        IBV.t(b3, bx + 6, by + 54 + 2*(ph+8) + 16, "← cap a l'oest: compatibles amb Gal·les", {size:11.5, fill:C.blau}); }

      // nota del forat 7 sobre la planta
      IBV.note(g, {x:h7.x+4, y:h7.y, tx:mob ? cx + R*.42 : h7.x + 38, ty:mob ? h7.y + 40 : h7.y + 52, kind:"curve", bend:12, anchor:"start", stroke:C.vermell, fill:C.vermell, size:12, lines:[["Forat 7",true],["27 persones"]]});
      IBV.note(g, {x:cx - 44*k*.7 - 2, y:cy - 44*k*.7 - 2, tx:mob ? 12 : cx - R*.98, ty:mob ? 14 : cy - R - 4, kind:"curve", bend:-14, anchor:"start", size:12, lines:[["56 forats Aubrey",true],["un cercle de 88 m"]]});

      IBV.onView(svg.node(), inst => { if(inst) return;
        dots.attr("opacity",0).transition().delay(d => 200 + d.i*5).duration(400).attr("opacity",1);
        crowd.selectAll("g").attr("opacity",0).transition().delay((d,i) => 500 + i*45).duration(300).attr("opacity",1);
        crowd3.selectAll("g").attr("opacity",0).transition().delay((d,i) => 1200 + i*45).duration(300).attr("opacity",1);
      });
      IBV.hover(svg.node(), (ev,[x,y]) => {
        let best = null, bd = 1e9; holes.forEach(d => { const dd = Math.hypot(d.x-x, d.y-y); if(dd < bd){ bd = dd; best = d; } });
        if(bd < Math.max(7, 2*k)){ IBV.focus(hg.selectAll("ellipse"), q => q === best);
          tp.show(best.n === 7 ? "<b>Forat Aubrey 7</b> · excavat el 2008: ossos cremats de com a mínim 27 persones, 22 adults i 5 infants o joves" : `<b>Forat Aubrey ${best.n}</b> · un dels 56 forats del cercle de 88 m, c. 3000 aC; molts van rebre cremacions`); return; }
        IBV.focus(hg.selectAll("ellipse"), null);
        const r = Math.hypot(x-cx, y-cy)/k;
        if(x < cx + R + 10 && r > 46 && r < 58) tp.show("<b>Fossat i talús</b> · també s'hi van enterrar cremacions, a més dels forats Aubrey");
        else if(x > bx - 10) tp.show(y < by - 40 ? "<b>Forat Aubrey 7</b> · com a mínim 27 persones: 22 adults i 5 infants o joves (Willis et al., 2016)" : "<b>25 cremats analitzats</b> · 10 tenen un estronci de fora de la creta de Wessex, compatible amb l'oest de Gal·les");
        else tp.hide();
      }, () => { IBV.focus(hg.selectAll("ellipse"), null); tp.hide(); });
    }

    /* ------------------------------------------------------------------ ELS NOUVINGUTS */
    function adn(h){
      const g = svg.append("g");
      const cols = mob ? 10 : 20, rows = 100/cols, gx = mob ? 14 : 18;
      const cw = Math.min(mob ? (W-28)/cols : (W*.66)/cols, 40), ph = mob ? cw*1.35 : Math.min(cw*1.45, 54), rh = ph + 8;
      const gy = 70;
      const title = IBV.t(g, gx, 20, "", {weight:700, size:mob?13:14});
      const sub = IBV.t(g, gx, 38, "", {size:12.5, fill:C.ink2});
      const rr = IBV.rng(21), order = d3.shuffler(rr)(d3.range(100));
      const keep = new Set(order.slice(0, 10));
      const archer = order.slice(10).find(i => i % cols >= cols - 3 && i < cols*2);
      const P = d3.range(100).map(i => ({i, x:gx + (i%cols + .5)*cw, y:gy + Math.floor(i/cols)*rh + ph, rank:order.indexOf(i), keep:keep.has(i), archer:i===archer}));
      const pg = g.append("g");
      const ppl = P.map(d => person(pg, d.x, d.y, ph*(.86 + rr()*.16), {pel:PEL[d.i%3], capa:(d.i*7)%5===0 || d.archer, dir:(d.i*13)%4===0?-1:1, pose:(d.i*11)%9===0?"mira":"dret"}).datum(d));
      const sel = pg.selectAll(":scope > g");
      const gridB = gy + rows*rh + 6;
      // l'Arquer d'Amesbury
      const A = P[archer];
      const arch = g.append("g").attr("opacity",0);
      arch.append("circle").attr("cx",A.x).attr("cy",A.y - ph*.5).attr("r",ph*.62).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.9);
      IBV.note(arch, {x:A.x + ph*.5, y:A.y - ph*.9, tx: mob ? W - 14 : W*.66 + 64, ty: mob ? gy - 8 : gy + 40, kind:"curve", bend:-16, anchor: mob ? "end" : "start", size:12,
        lines: mob ? [["L'Arquer d'Amesbury",true],["infància als Alps"]] : [["L'Arquer d'Amesbury",true],["va créixer als Alps i el van enterrar","",C.ink2],["a 5 km de les pedres, amb l'or més","",C.ink2],["antic datat de Gran Bretanya","",C.ink2]]});
      // línia de temps
      const ty = gridB + (mob ? 64 : 72), tx0 = gx, tx1 = mob ? W - 14 : W*.66 + gx;
      const x = d3.scaleLinear().domain([-4200, -1800]).range([tx0, tx1]);
      const tl = g.append("g");
      // franja d'ascendència: groc (neolítics) → vermell (Vas Campaniforme)
      const defs = svg.append("defs"), gid = "adn-g" + Math.round(Math.random()*1e6);
      const lgd = defs.append("linearGradient").attr("id",gid).attr("x1",x(-2450)).attr("x2",x(-2050)).attr("gradientUnits","userSpaceOnUse");
      lgd.append("stop").attr("offset",0).attr("stop-color",C.groc); lgd.append("stop").attr("offset",1).attr("stop-color",C.vermell);
      tl.append("rect").attr("x",x(-4000)).attr("y",ty-16).attr("width",x(-2450)-x(-4000)).attr("height",10).attr("fill",C.groc);
      tl.append("rect").attr("x",x(-2450)).attr("y",ty-16).attr("width",x(-2050)-x(-2450)).attr("height",10).attr("fill",`url(#${gid})`);
      tl.append("rect").attr("x",x(-2050)).attr("y",ty-16).attr("width",x(-1800)-x(-2050)).attr("height",9*.9).attr("fill",C.vermell);
      tl.append("rect").attr("x",x(-2050)).attr("y",ty-16+9).attr("width",x(-1800)-x(-2050)).attr("height",1).attr("fill",C.groc);
      tl.append("line").attr("x1",tx0).attr("x2",tx1).attr("y1",ty).attr("y2",ty).attr("stroke",C.ink).attr("stroke-width",.8);
      (mob ? [-4000,-3000,-2000] : [-4000,-3500,-3000,-2500,-2000]).forEach(v => { tl.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",ty).attr("y2",ty+4).attr("stroke",C.ink).attr("stroke-width",.8);
        IBV.t(tl, x(v), ty+16, `${IBV.fmt(",.0f")(-v)} aC`, {size:11, anchor:"middle", fill:C.muted}); });
      const EV = [
        {a:-4000, t:"arriben els pagesos", t2:"d'Anatòlia i l'Egeu"},
        {a:-3000, t:"fossat i forats Aubrey", t2:"primeres cremacions"},
        {a:-2500, t:"els sarsens", t2:""},
        {a:-2450, t:"Vas Campaniforme", t2:"arriben del continent", up:true},
        {a:-2200, t:"pedres blaves", t2:"reordenades", up:true, hi:true}
      ];
      EV.forEach((e,i) => { if(mob && (e.a === -3000 || e.a === -2200)) return;
        const yy = e.up ? ty - (e.hi ? 50 : 26) : ty + 34, an = e.a > -2400 ? "start" : e.a < -3900 ? "start" : "middle";
        tl.append("line").attr("x1",x(e.a)).attr("x2",x(e.a)).attr("y1",e.up?ty-18:ty+4).attr("y2",e.up?yy+4:yy-12).attr("stroke",C.ink).attr("stroke-width",.6);
        IBV.lines(tl, x(e.a) + (an==="start"?-2:0), e.up ? yy-14 : yy, [[e.t,true],[e.t2,"",C.ink2]].filter(q=>q[0]), {size:11.5, anchor:an}); });
      const cur = tl.append("path").attr("fill",C.ink);
      // llegenda a la dreta
      if(!mob){
        const lx = W*.66 + 64, l = svg.append("g");
        IBV.lines(l, lx+16, gy+150, [["Els constructors",true],["descendents dels pagesos arribats","",C.ink2],["d'Anatòlia i l'Egeu cap al 4000 aC","",C.ink2],["(Brace et al., 2019)","",C.ink2]], {size:12});
        l.append("circle").attr("cx",lx+5).attr("cy",gy+146).attr("r",5).attr("fill",C.groc);
        IBV.lines(l, lx+16, gy+226, [["Els nouvinguts",true],["grups del Vas Campaniforme: en pocs","",C.ink2],["segles, ~90 % de l'ascendència de","",C.ink2],["l'illa (Olalde et al., 2018)","",C.ink2]], {size:12});
        l.append("circle").attr("cx",lx+5).attr("cy",gy+222).attr("r",5).attr("fill",C.vermell);
      }
      let st = IBV.reduced ? 1 : 0;
      const set = (s, inst) => {
        st = s;
        title.text(s ? (mob ? "Cap al 2000 aC: ~90 % d'ascendència nova" : "Cap al 2000 aC: ~90 de cada 100 parts de l'ascendència són noves") : "Cap al 2500 aC, mentre s'alcen els sarsens");
        sub.text(s ? (mob ? "ja no són els besnéts dels qui van cavar el fossat" : "els que reordenen les pedres blaves ja no són els besnéts dels qui van cavar el fossat") : (mob ? "cent figures = l'ascendència de l'illa" : "cent figures = l'ascendència de la gent de Gran Bretanya"));
        sel.interrupt().transition().duration(inst ? 0 : 500).delay(d => inst ? 0 : (s ? d.rank : 99-d.rank)*14)
          .attr("fill", d => s && !d.keep ? C.vermell : C.groc);
        arch.transition().duration(inst?0:400).delay(inst?0:s?1500:0).attr("opacity", s ? 1 : 0);
        const cx = x(s ? -2000 : -2500);
        cur.interrupt().transition().duration(inst?0:1400).ease(d3.easeCubicInOut).attr("d", `M${cx-5},${ty-24}L${cx+5},${ty-24}L${cx},${ty-17}Z`);
        if(inst) cur.attr("d", `M${cx-5},${ty-24}L${cx+5},${ty-24}L${cx},${ty-17}Z`);
      };
      sel.attr("fill", C.groc);
      set(st, true);
      IBV.onView(svg.node(), inst => { if(inst || IBV.reduced) return;
        sel.attr("opacity",0).transition().delay(d => d.i*8).duration(300).attr("opacity",1);
        const t = d3.interval(() => set(st ? 0 : 1), 4200); timers.push(t);
      });
      if(IBV.onView === undefined) set(1, true);
      svg.on("click.g", () => set(st ? 0 : 1));
      IBV.hover(svg.node(), (ev,[px,py]) => {
        if(py > gridB){ const a = Math.round(x.invert(px)/50)*50; tp.show(a < -2450 ? `<b>${IBV.fmt(",.0f")(-a)} aC</b> · ascendència dels pagesos neolítics` : a < -2050 ? `<b>${IBV.fmt(",.0f")(-a)} aC</b> · arriben els grups del Vas Campaniforme: la substitució es fa en pocs segles` : `<b>${IBV.fmt(",.0f")(-a)} aC</b> · ~90 % de l'ascendència ja és nova`); return; }
        let best = null, bd = 1e9; P.forEach(d => { const dd = Math.hypot(d.x-px, d.y-ph*.5-py); if(dd < bd){ bd = dd; best = d; } });
        if(bd > cw){ tp.hide(); IBV.focus(sel, null); return; }
        IBV.focus(sel, d => d === best);
        tp.show(best.archer && st ? "<b>L'Arquer d'Amesbury</b> · c. 2470–2300 aC, infància als Alps (Fitzpatrick, 2011)" : st ? (best.keep ? "<b>Ascendència neolítica</b> · la que sobreviu, ~10 %" : "<b>Ascendència nova</b> · dels grups del Vas Campaniforme, ~90 %") : "<b>Ascendència neolítica</b> · la gent que va aixecar els sarsens");
      }, () => { tp.hide(); IBV.focus(sel, null); });
    }

    /* ------------------------------------------------------------------ L'ANY DEL PORC */
    function porc(h){
      const R = mob ? (W-96)/2 : Math.min(h*.4, W*.22), cx = mob ? W/2 : R + 70, cy = mob ? R + 64 : h/2 + 6;
      const g = svg.append("g").attr("transform",`translate(${cx},${cy})`);
      // espiral de dos anys: comença l'1 de març del primer any (any 1 a dins, any 2 a fora)
      const r0 = R*.42, r1 = R*.95, T = 24;
      const rad = m => r0 + (r1-r0)*(m/T);                 // m: mesos des de l'1 de gener de l'any 1
      const ang = m => (m % 12)/12*Math.PI*2;              // 0 = 1 de gener a dalt
      const pt = (m, dr) => { const r = rad(m) + (dr||0), a = ang(m); return [r*Math.sin(a), -r*Math.cos(a)]; };
      // sectors d'hivern (des–feb) i de primavera (mar–mai), suaus
      const sector = (m0, m1) => d3.arc()({innerRadius:r0 - 18, outerRadius:r1 + 18, startAngle:m0/12*Math.PI*2, endAngle:m1/12*Math.PI*2});
      g.append("path").attr("d", sector(-1, 2)).attr("fill", IBV.alpha(C.blau,.07));
      // mesos
      IBV.MES.forEach((t,i) => { const a = (i+.5)/12*Math.PI*2, rr = r1 + 34;
        IBV.t(g, rr*Math.sin(a), -rr*Math.cos(a)+4, t, {size:11.5, anchor:"middle", fill:C.muted}); });
      for(let i=0;i<12;i++){ const a = i/12*Math.PI*2; g.append("line").attr("x1",(r0-18)*Math.sin(a)).attr("y1",-(r0-18)*Math.cos(a)).attr("x2",(r1+22)*Math.sin(a)).attr("y2",-(r1+22)*Math.cos(a)).attr("stroke",C.grid).attr("stroke-width",.7); }
      IBV.t(g, 0, -(r1+52), "hivern", {size:11.5, anchor:"middle", fill:C.blau, italic:true});
      // l'espiral (temps)
      const sp = d3.range(0, T+.01, .1).map(m => pt(m));
      g.append("path").attr("d", d3.line()(sp)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",.7).attr("stroke-dasharray","2 2.5");
      // vida dels porcs: neixen a la primavera (mar–mai de l'any 1)
      const life1 = d3.range(3.5, 12.6, .1).map(m => pt(m)), life2 = d3.range(12.6, 21.9+.01, .1).map(m => pt(m));
      const p1 = g.append("path").attr("d", d3.line()(life1)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1.6).attr("stroke-linecap","round");
      const p2 = g.append("path").attr("d", d3.line()(life2)).attr("fill","none").attr("stroke",C.ink).attr("stroke-width",1).attr("stroke-linecap","round");
      // naixements
      const born = g.append("path").attr("d", d3.line()(d3.range(2, 5.01, .1).map(m => pt(m)))).attr("fill","none").attr("stroke",C.blau).attr("stroke-width",7).attr("stroke-linecap","round").attr("opacity",.85);
      // sacrificis: primer hivern (la majoria) i segon any (també a l'hivern)
      const kill1 = g.append("path").attr("d", d3.line()(d3.range(10.8, 13.6, .1).map(m => pt(m)))).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",10).attr("stroke-linecap","round");
      const kill2 = g.append("path").attr("d", d3.line()(d3.range(22.6, 24.0, .1).map(m => pt(m)))).attr("fill","none").attr("stroke",C.vermell).attr("stroke-width",4).attr("stroke-linecap","round").attr("opacity",.8);
      // solstici d'hivern (21 de desembre)
      const ms = 11 + 20/31, as = ang(ms);
      g.append("line").attr("x1",(r0-26)*Math.sin(as)).attr("y1",-(r0-26)*Math.cos(as)).attr("x2",(r1+24)*Math.sin(as)).attr("y2",-(r1+24)*Math.cos(as)).attr("stroke",C.ink).attr("stroke-width",.8).attr("stroke-dasharray","4 3");
      { const sx = (r0-36)*Math.sin(as), sy = -(r0-36)*Math.cos(as);
        g.append("circle").attr("cx",sx).attr("cy",sy).attr("r",6).attr("fill",C.groc);
        d3.range(8).forEach(i => { const a = i/8*Math.PI*2; g.append("line").attr("x1",sx+8.5*Math.cos(a)).attr("y1",sy+8.5*Math.sin(a)).attr("x2",sx+11.5*Math.cos(a)).attr("y2",sy+11.5*Math.sin(a)).attr("stroke",C.grocFosc).attr("stroke-width",1.2).attr("stroke-linecap","round"); }); }
      // porcs: un ramat al primer hivern, uns quants al segon (nombres il·lustratius)
      const herd = g.append("g");
      [[11.6,0],[12.0,-7],[12.3,8],[12.7,-1],[11.9,13],[12.9,10],[11.3,-10],[12.5,-14]].forEach(([m,dr],i) => { const [x,y] = pt(m, dr); pig(herd, x-4, y+3, mob?8:10, C.vermell, i%2?1:-1); });
      [[23.1,4],[23.5,-6]].forEach(([m,dr],i) => { const [x,y] = pt(m, dr); pig(herd, x-4, y+3, mob?8:10, C.vermell, -1); });
      // el porc que fa la volta
      const walker = g.append("g");
      // anotacions
      const nb = pt(3.2), nk = pt(12.2), n2 = pt(23.3);
      const big = mob ? 12 : 12.5;
      if(!mob){
      IBV.note(g, {x:nb[0]+6, y:nb[1], tx:R*(mob?.3:.62), ty:R*(mob?1.12:1.18), kind:"curve", bend:10, anchor:"start", stroke:C.blau, fill:C.blau, size:big, lines:[["Neixen a la primavera",true],["a granges d'arreu de l'illa"]]});
      IBV.note(g, {x:nk[0]-12, y:nk[1]+2, tx:-R*(mob?.98:1.42), ty:-R*(mob?1.12:.5), kind:"curve", bend:-14, anchor:"start", stroke:C.vermell, fill:C.vermell, size:big, lines:[["La majoria es mengen",true],["al primer hivern, amb uns nou mesos"]]});
      IBV.note(g, {x:n2[0]+6, y:n2[1]-2, tx:R*(mob?.42:.62), ty:-R*(mob?1.14:1.1), kind:"curve", bend:12, anchor:"start", size:big, lines:[["Un altre grup, al segon any",true],["gairebé sempre també a l'hivern"]]});
      }
      IBV.t(g, 0, 20, "any 1", {anchor:"middle", size:11.5, fill:C.muted, italic:true});
      { const [x,y] = pt(18.5, 14); IBV.t(g, x, y, "any 2", {anchor:"middle", size:11.5, fill:C.muted, italic:true, halo:true}); }
      { const sx = (r0-36)*Math.sin(as), sy = -(r0-36)*Math.cos(as); IBV.t(g, sx+14, sy+22, "solstici d'hivern", {size:11.5, fill:C.ink2, halo:true}); }

      // columna de dades
      const bx = mob ? 14 : cx + R + 120;
      let by = mob ? cy + R + 60 : Math.max(40, cy - 150);
      const B = svg.append("g");
      if(mob){
        [[C.blau,"Neixen a la primavera","a granges d'arreu de l'illa"],[C.vermell,"La majoria es mengen al primer hivern","amb uns nou mesos"],[C.ink,"Un altre grup, al segon any","gairebé sempre també a l'hivern"]].forEach(([col,a,b2],i) => {
          B.append("line").attr("x1",bx).attr("x2",bx+16).attr("y1",by+i*38-4).attr("y2",by+i*38-4).attr("stroke",col).attr("stroke-width",i===2?1.4:5).attr("stroke-linecap","round");
          IBV.lines(B, bx+24, by+i*38, [[a,true,col===C.ink?C.ink:col],[b2,"",C.ink2]], {size:12}); });
        by += 128;
      }
      IBV.t(B, bx, by+30, "385", {serif:true, size:mob?34:40});
      IBV.lines(B, bx + (mob?72:84), by+12, [["mandíbules i 447 maxil·lars",true],["de porc als abocadors de Durrington","",C.ink2],["Walls: les restes de grans banquets","",C.ink2]], {size:12});
      by += mob ? 70 : 80;
      IBV.t(B, bx, by+30, "131", {serif:true, size:mob?34:40});
      IBV.lines(B, bx + (mob?72:84), by+12, [["porcs analitzats amb isòtops",true],["gairebé cap criat a Wessex: venien","",C.ink2],["de Gal·les, del nord d'Anglaterra","",C.ink2],["i potser d'Escòcia (Madgwick et al., 2019)","",C.ink2]], {size:12});
      by += mob ? 86 : 96;
      if(!mob){ IBV.lines(B, bx, by+12, [["Un calendari escrit en dents",true],["Pel desgast de les dents se sap l'edat i l'estació","",C.ink2],["en què es van sacrificar (Wright et al., 2014;","",C.ink2],["English Heritage). Si naixien a la primavera,","",C.ink2],["la gran festa era a mitjan hivern, al solstici.","",C.ink2]], {size:12}); }
      // animació: un garrí neix i recorre la seva vida fins al primer hivern
      if(!IBV.reduced){
        const L1 = p1.node().getTotalLength();
        const tm = d3.timer(e => { const k = (e/7000)%1, q = p1.node().getPointAtLength(L1*k); walker.selectAll("*").remove(); pig(walker, q[0]===undefined?q.x:q.x, q.y+3, 6.5*(.6+.4*k), C.ink, 1); });
        timers.push(tm);
      }
      IBV.onView(svg.node(), inst => { if(inst) return;
        [born, p1, kill1, p2, kill2].forEach((p,i) => { const Ln = p.node().getTotalLength(); p.attr("stroke-dasharray",`${Ln} ${Ln}`).attr("stroke-dashoffset",Ln).transition().delay(200+i*450).duration(800).ease(d3.easeCubicOut).attr("stroke-dashoffset",0).on("end",()=>p.attr("stroke-dasharray",null)); });
        herd.attr("opacity",0).transition().delay(1500).duration(600).attr("opacity",1);
      });
      IBV.hover(svg.node(), (ev,[x,y]) => {
        if(x > bx - 10 && !mob || (mob && y > cy + R + 50)){ tp.show("<b>Banquets a Durrington Walls</b> · c. 2800–2400 aC, a 3 km de Stonehenge, on vivien els constructors"); return; }
        const dx = x-cx, dy = y-cy, r = Math.hypot(dx,dy); if(r > r1 + 40 || r < r0 - 30){ tp.hide(); return; }
        const m = Math.floor(((Math.atan2(dx, -dy)*R2D + 360) % 360)/30);
        tp.show(`<b>${IBV.MES[m]}</b> · ${m>=2&&m<=4?"temporada de parts: neixen els garrins":m===11||m<=1?"temporada de banquets: sacrificis al voltant del solstici d'hivern":"els porcs creixen a les granges de tota l'illa"}`);
      }, () => tp.hide());
    }

    IBV.mount(el, (container, w) => {
      W = w; mob = w < 640;
      svg = IBV.svg(container, W, 400, "Tres vistes de la gent de Stonehenge: les persones cremades als forats Aubrey, el canvi d'ascendència del Vas Campaniforme i l'any dels porcs dels banquets.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      render();
    });
  })();
})();
