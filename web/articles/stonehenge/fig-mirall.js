/* «Per què van aixecar Stonehenge?» · mirall */
(function(){
  "use strict";
  const D = window.STONEHENGE_DADES, S3 = window.SH3D, C = Object.assign({vegetacio:"#A6C06A", vegetacioClar:"#DCE8B5", vegetacioFosc:"#6F8A3C"}, IBV.C);
  const PAPER = S3.PAPER;

  /* =========================================================================
     V12 · CADA SEGLE S'INVENTA EL SEU STONEHENGE (IB-38, filera cronològica)
     A dalt, sis lectures amb una vinyeta de línia cadascuna; al mig, l'eix trencat;
     a baix, l'estat físic de les pedres i del lloc carril per carril (dret, caigut, redreçat).
     Totes les dates surten de D.mirall i de research/stonehenge/fonts-v2.md (§15–16).
     ========================================================================= */
  (function initMirall(){
    const el = document.getElementById("mir-viz"); if(!el) return;
    const tp = IBV.tip(el);
    const E = D.mirall.slice().sort((p,q) => p.any - q.any);
    const byY = y => E.find(d => d.any === y);
    const INK = C.ink, MUT = C.muted, BL = C.blau, VR = C.vermell;

    // vinyetes de línia per a cada lectura (coordenades locals, ~64 × 50, origen a baix al centre)
    const VIG = {
      1136(g){ // Merlí: les pedres volen per sobre del mar des d'Irlanda
        for(let k=0;k<2;k++) g.append("path").attr("d", `M-34,${-4-k*5}` + d3.range(8).map(i=>`q4,-3 8,0`).join("")).attr("fill","none").attr("stroke",BL).attr("stroke-width",.8).attr("stroke-opacity",k?.45:.85);
        g.append("path").attr("d","M-30,-30Q-6,-58 22,-34").attr("fill","none").attr("stroke",INK).attr("stroke-width",.7).attr("stroke-dasharray","2 2.5");
        g.append("path").attr("d","M18,-38l5,4l-6,2").attr("fill","none").attr("stroke",INK).attr("stroke-width",.7);
        tril(g, -5, -36, 1, {rot:-14});
        g.append("path").attr("d","M-8,-46l-2,-4M0,-48v-5M8,-46l2,-4").attr("stroke",C.groc).attr("stroke-width",1.1).attr("stroke-linecap","round");
      },
      1655(g){ // Inigo Jones: planta de temple regular, hexàgon dins un cercle
        g.append("circle").attr("cy",-26).attr("r",23).attr("fill","none").attr("stroke",INK).attr("stroke-width",.7);
        const hex = d3.range(6).map(i => [Math.cos((i*60-90)*Math.PI/180)*17, -26+Math.sin((i*60-90)*Math.PI/180)*17]);
        g.append("path").attr("d", `M${hex[0]}L${hex[2]}L${hex[4]}ZM${hex[1]}L${hex[3]}L${hex[5]}Z`).attr("fill","none").attr("stroke",MUT).attr("stroke-width",.5).attr("stroke-dasharray","1.5 1.5");
        hex.forEach(([x,y],i) => g.append("rect").attr("x",-4).attr("y",-2).attr("width",8).attr("height",4).attr("transform",`translate(${x},${y}) rotate(${i*60})`).attr("fill",PAPER).attr("stroke",INK).attr("stroke-width",.8));
        g.append("circle").attr("cy",-26).attr("r",1.4).attr("fill",INK);
      },
      1740(g){ // Stukeley: un druida amb túnica i bastó davant d'un trílit
        tril(g, 12, -2, 1.15, {});
        g.append("path").attr("d","M-16,-1C-17,-14 -15,-26 -12,-31C-10,-34 -6,-34 -4,-31C-1,-26 1,-14 0,-1Z").attr("fill",INK);
        g.append("circle").attr("cx",-8).attr("cy",-37).attr("r",3.6).attr("fill",INK);
        g.append("path").attr("d","M-9,-34q-1,6 1,11").attr("stroke",PAPER).attr("stroke-width",.9).attr("fill","none");
        g.append("line").attr("x1",-21).attr("x2",-19).attr("y1",-44).attr("y2",-1).attr("stroke",INK).attr("stroke-width",1.1).attr("stroke-linecap","round");
        g.append("path").attr("d","M-13,-28l-7,3").attr("stroke",INK).attr("stroke-width",2).attr("stroke-linecap","round");
      },
      1963(g){ // Hawkins: una targeta perforada i línies d'alineació
        g.append("path").attr("d","M-30,-46h56v34h-60v-30z").attr("fill",PAPER).attr("stroke",INK).attr("stroke-width",.8);
        for(let r=0;r<5;r++) for(let c=0;c<12;c++) if(((r*7+c*5)%4)===0) g.append("rect").attr("x",-26+c*4.4).attr("y",-41+r*5.6).attr("width",1.8).attr("height",3.2).attr("fill",INK);
        d3.range(-2,3).forEach(i => g.append("line").attr("x1",-4).attr("y1",-2).attr("x2",-4+Math.sin(i*.42)*44).attr("y2",-2-Math.cos(i*.42)*6).attr("stroke",C.groc).attr("stroke-width",.9));
        g.append("circle").attr("cx",-4).attr("cy",-2).attr("r",1.6).attr("fill",VR);
      },
      1998(g){ // Parker Pearson i Ramilisonina: fusta per als vius, pedra per als morts
        const w = [-18,-24], s = [16,-24];
        d3.range(14).forEach(i => { const a = i/14*Math.PI*2; g.append("circle").attr("cx",w[0]+Math.cos(a)*12).attr("cy",w[1]+Math.sin(a)*12).attr("r",1.5).attr("fill",C.ink2); });
        d3.range(10).forEach(i => { const a = i/10*Math.PI*2; g.append("rect").attr("x",-2.2).attr("y",-1.3).attr("width",4.4).attr("height",2.6).attr("transform",`translate(${s[0]+Math.cos(a)*11},${s[1]+Math.sin(a)*11}) rotate(${a*180/Math.PI+90})`).attr("fill",PAPER).attr("stroke",INK).attr("stroke-width",.7); });
        g.append("path").attr("d","M-6,-6C0,2 4,-12 8,-2").attr("fill","none").attr("stroke",BL).attr("stroke-width",1);
        IBV.t(g, w[0], -40, "fusta", {size:9.5, anchor:"middle", fill:MUT});
        IBV.t(g, s[0], -40, "pedra", {size:9.5, anchor:"middle", fill:MUT});
      },
      2024(g){ // Clarke et al.: l'Altar ve del nord d'Escòcia, a 750 km o més
        g.append("circle").attr("cx",-14).attr("cy",-52).attr("r",2.2).attr("fill",VR);
        IBV.t(g, -10, -49, "nord d'Escòcia", {size:9, fill:MUT});
        g.append("path").attr("d","M-14,-49C-16,-34 -8,-22 -2,-11").attr("fill","none").attr("stroke",VR).attr("stroke-width",1.1).attr("stroke-dasharray","3 2");
        g.append("path").attr("d","M-6,-14l4,4l1,-6").attr("fill","none").attr("stroke",VR).attr("stroke-width",1.1);
        IBV.t(g, -4, -28, "≥ 750 km", {size:9, fill:VR});
        g.append("path").attr("d","M-16,-1l1,-5h30l2,5z").attr("fill",PAPER).attr("stroke",INK).attr("stroke-width",.8);
        tril(g, 22, -1, .8, {});
      }
    };
    const ANYS = Object.keys(VIG).map(Number);

    // un trílit o una pedra sola en línia fina (base al punt x,y)
    function tril(g, x, y, s, o){
      o = o||{};
      const t = g.append("g").attr("transform", `translate(${x},${y}) rotate(${o.rot||0}) scale(${s})`);
      const st = o.col || INK, fl = PAPER, sw = .8/s;
      if(o.state === "caigut"){
        t.append("rect").attr("x",-11).attr("y",-4).attr("width",14).attr("height",4).attr("transform","rotate(-4)").attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
        t.append("rect").attr("x",1).attr("y",-4.2).attr("width",13).attr("height",4).attr("transform","rotate(7 7 -2)").attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
        t.append("rect").attr("x",-6).attr("y",-6.5).attr("width",11).attr("height",3).attr("transform","rotate(-16 0 -5)").attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
        return t;
      }
      if(o.state === "pedra" || o.state === "pedraInc" || o.state === "pedraCau"){
        const rot = o.state === "pedraInc" ? 13 : 0;
        if(o.state === "pedraCau") t.append("rect").attr("x",-7).attr("y",-4).attr("width",14).attr("height",4).attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
        else t.append("rect").attr("x",-2.5).attr("y",-15).attr("width",5).attr("height",15).attr("rx",.6).attr("transform",`rotate(${rot} 0 0)`).attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
        return t;
      }
      t.append("rect").attr("x",-7).attr("y",-15).attr("width",5).attr("height",15).attr("rx",.6).attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
      t.append("rect").attr("x",2).attr("y",-15).attr("width",5).attr("height",15).attr("rx",.6).attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
      t.append("rect").attr("x",-8.5).attr("y",-18.5).attr("width",17).attr("height",3.5).attr("rx",.6).attr("fill",fl).attr("stroke",st).attr("stroke-width",sw);
      return t;
    }
    // una grua de fusta (restauracions del segle XX)
    function grua(g, x, y, s){
      const t = g.append("g").attr("transform", `translate(${x},${y}) scale(${s})`);
      t.append("path").attr("d","M-8,0L-2,-22L4,0M-2,-22L12,-12M12,-12v6").attr("fill","none").attr("stroke",INK).attr("stroke-width",.8/s);
      t.append("rect").attr("x",9.5).attr("y",-6).attr("width",5).attr("height",6).attr("fill",PAPER).attr("stroke",INK).attr("stroke-width",.8/s);
      return t;
    }

    // Carrils de l'estat físic i de l'accés (cada segment i cada fita, amb la seva font)
    const LANES = [
      {nom:"Trílit 57–58", segs:[[1100,1797,"dret"],[1797,1958,"caigut"],[1958,2035,"dret"]],
        ev:[{y:1797, g:"caigut", d:byY(1797)}, {y:1958, g:"dret", d:byY(1958), t:"1958–59"}]},
      {nom:"Pedra 56, la més alta", segs:[[1901,2035,"dret"]], pre:{y:1901, g:"pedraInc"},
        ev:[{y:1901, g:"pedra", d:byY(1901)}]},
      {nom:"Pedra 22 i la seva llinda", segs:[[1100,1900,"dret"],[1900,1958,"caigut"],[1958,2035,"dret"]],
        ev:[{y:1900, g:"caigut", t:"1900", d:{any:1900, anyTxt:"Desembre del 1900", curt:"Cau la pedra 22", det:"Cau un sarsen del cercle i la llinda que aguantava es parteix en dos (English Heritage)"}},
            {y:1958, g:"dret", d:{any:1958, anyTxt:"1958", curt:"Torna a pujar la pedra 22", det:"Es redreça amb les obres del 1958–59 (arxiu d'Historic England)"}}]},
      {nom:"Un sarsen del cercle exterior", segs:[[1100,1963,"dret"],[1963,1964,"caigut"],[1964,2035,"dret"]],
        ev:[{y:1963, g:"pedraCau", txt:"1963 · el vent el tomba; 1964, redreçat", d:{any:1963, anyTxt:"10 de març del 1963", curt:"El vent tomba un sarsen", det:"Una ventada fa caure un pilar del cercle exterior (English Heritage)"}},
            {y:1964, g:"pedra", d:byY(1964), lab:false}]},
      {nom:"Pedres 1, 2, 6, 7, 29 i 30", segs:[], ev:[{y:1919, g:"grua", d:byY(1919), t:"1919–20"}]},
      {nom:"De qui és", own:true, segs:[[1100,1918,"privat"],[1918,2035,"nacio"]],
        ev:[{y:1918, g:"punt", d:byY(1918)}, {y:1986, g:"punt", d:byY(1986)}]},
      {nom:"Qui hi pot entrar al solstici", segs:[], ev:[{y:1985, g:"punt", d:byY(1985), red:true, left:true}, {y:2000, g:"punt", d:byY(2000)}]}
    ];

    IBV.mount(el, (container, w) => {
      d3.select(container).selectAll("svg.ibv").remove();
      if(w < 960) drawMob(container, w); else drawDesk(container, w);
    });

    /* ---------------- escriptori: filera horitzontal amb carrils ---------------- */
    function drawDesk(container, w){
      const padL = 10, lab = 178, xA = padL + lab;            // columna de noms dels carrils
      const xb0 = xA + (w - xA)*.17;                           // final del tram comprimit (1100–1790)
      const x = d3.scaleLinear().domain([1100,1790,2035]).range([xA+4, xb0, w-14]).clamp(true);
      const vigH = 84, txtH = 74, topY = 22, yVig = topY + vigH, yTxt = yVig + 16;
      const yI = yTxt + txtH + 40, laneH = 46, y0L = yI + 54;
      const H = y0L + LANES.length*laneH + 30;
      const svg = IBV.svg(container, w, H, "Filera cronològica de 1136 a 2026: a dalt, sis maneres d'explicar Stonehenge; a baix, quan van caure i es van redreçar les pedres, de qui ha estat i qui hi pot entrar.");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      const g = svg.append("g"), hit = [];

      // quadrícula fina d'anys a tota l'alçada dels carrils
      const grid = g.append("g").attr("class","grid");
      [1200,1300,1400,1500,1600,1700].forEach(v => grid.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",yI-3).attr("y2",yI+3).attr("stroke",INK).attr("stroke-width",.6));
      [1800,1850,1900,1950,2000].forEach(v => grid.append("line").attr("x1",x(v)).attr("x2",x(v)).attr("y1",yI+20).attr("y2",H-22).attr("stroke",INK).attr("stroke-opacity",.09).attr("stroke-width",.6));
      [1200,1400,1600].forEach(v => IBV.t(grid, x(v), yI+17, String(v), {size:11, anchor:"middle", fill:MUT}));
      [1800,1850,1900,1950,2000].forEach(v => { IBV.t(grid, x(v), yI+17, String(v), {size:11, anchor:"middle", fill:MUT}); IBV.t(grid, x(v), H-8, String(v), {size:11, anchor:"middle", fill:MUT}); });

      // eix trencat: dos trams i un tall doble
      const ax = g.append("g");
      const xg0 = x(1785), xg1 = x(1795);
      ax.append("line").attr("x1",x(1100)).attr("x2",xg0-3).attr("y1",yI).attr("y2",yI).attr("stroke",INK).attr("stroke-width",.9);
      ax.append("line").attr("x1",xg1+3).attr("x2",x(2035)).attr("y1",yI).attr("y2",yI).attr("stroke",INK).attr("stroke-width",.9);
      const xm = (xg0+xg1)/2;
      ax.append("path").attr("d",`M${xm-6},${yI+6}L${xm-2},${yI-6}M${xm+2},${yI+6}L${xm+6},${yI-6}`).attr("stroke",INK).attr("stroke-width",.9);
      IBV.t(g, padL, topY-6, "Què s'hi ha vist", {weight:700, size:12.5});
      IBV.t(g, padL, y0L-20, "Què s'hi ha fet", {weight:700, size:12.5});

      // les sis lectures: vinyetes repartides a tot l'ample, unides a la seva data amb una línia en colze
      const slots = ANYS.length, sw = (w - xA + lab*.55) / slots, sx0 = padL + lab*.45;
      const lect = g.selectAll("g.lect").data(ANYS.map(a => byY(a))).join("g").attr("class","lect").style("cursor","pointer");
      lect.each(function(d, i){
        const s = d3.select(this), cx = sx0 + sw*(i+.5), px = x(d.any), key = !!d.clau;
        const yb = yTxt + txtH + 4, yk = yI - 14 - (i%2)*6;
        s.append("path").attr("d", `M${cx},${yb}V${yk}H${px}V${yI-5}`).attr("fill","none").attr("stroke",INK).attr("stroke-opacity",.35).attr("stroke-width",.6);
        s.append("circle").attr("cx",px).attr("cy",yI).attr("r",key?5:3.8).attr("fill",key?VR:INK);
        const vg = s.append("g").attr("transform",`translate(${cx},${yVig-4}) scale(1.35)`);
        vg.append("line").attr("x1",-36).attr("x2",36).attr("y1",0).attr("y2",0).attr("stroke",INK).attr("stroke-opacity",.25).attr("stroke-width",.5);
        VIG[d.any](vg);
        IBV.t(s, cx, yTxt, d.curt, {size:12.5, weight:700, anchor:"middle", fill:key?VR:INK, halo:true});
        IBV.t(s, cx, yTxt+15, String(d.anyTxt||d.any), {size:11.5, anchor:"middle", fill:MUT, halo:true});
        wrap(d.det, Math.max(18, Math.floor((sw-14)/5.6))).slice(0,4).forEach((l,k) => IBV.t(s, cx, yTxt+30+k*13, l, {size:10.5, anchor:"middle", fill:MUT, halo:true}));
        hit.push({x:cx, y:yVig-24, d, sel:this}); hit.push({x:px, y:yI-4, d, sel:this});
      });

      // carrils de l'estat físic
      const lanes = g.selectAll("g.lane").data(LANES).join("g").attr("class","lane").style("cursor","pointer");
      lanes.each(function(L, li){
        const s = d3.select(this), yL = y0L + li*laneH + laneH/2;
        IBV.t(s, padL, yL+4, L.nom, {size:11.5, fill:INK});
        s.append("line").attr("x1",xA-8).attr("x2",x(2035)).attr("y1",yL+9).attr("y2",yL+9).attr("stroke",INK).attr("stroke-opacity",.07);
        L.segs.forEach(([a,b,k]) => {
          const ln = s.append("line").attr("class","seg").attr("x1",x(a)).attr("x2",x(a)).attr("y1",yL).attr("y2",yL).attr("data-x2",x(b)).attr("stroke-linecap","round");
          if(k==="dret") ln.attr("stroke",INK).attr("stroke-width",1.6);
          else if(k==="caigut") ln.attr("stroke",MUT).attr("stroke-width",1.1).attr("stroke-dasharray","3 3");
          else if(k==="privat") ln.attr("stroke",MUT).attr("stroke-width",1);
          else if(k==="nacio") ln.attr("stroke",BL).attr("stroke-width",2.2);
          ln.attr("x2", x(b));
        });
        if(L.own){ IBV.t(s, (x(1100)+x(1790))/2, yL-6, "terres privades", {size:10, anchor:"middle", fill:MUT, italic:true, halo:true}); }
        if(L.pre) tril(s, x(L.pre.y)-26, yL+10, 1.3, {state:L.pre.g, col:MUT});
        if(L.pre) IBV.t(s, x(L.pre.y)-36, yL+4, "inclinada", {size:10, anchor:"end", fill:MUT, italic:true, halo:true});
        L.ev.forEach((e, k) => {
          const px = x(e.y), d = e.d;
          if(e.g === "punt") s.append("circle").attr("cx",px).attr("cy",yL).attr("r",4.2).attr("fill",PAPER).attr("stroke",e.red?VR:BL).attr("stroke-width",1.7);
          else if(e.g === "grua"){ grua(s, px-2, yL+10, 1.25); tril(s, px+22, yL+10, 1.2, {state:"pedra"}); }
          else tril(s, px + (e.g==="caigut"||e.g==="pedraCau" ? 14 : 13), yL+10, e.g==="caigut"?1.15:1.3, {state:e.g==="dret"?undefined:e.g, col:e.g==="caigut"||e.g==="pedraCau"?MUT:INK});
          if(e.g !== "punt" && e.g !== "grua") s.append("circle").attr("cx",px).attr("cy",yL).attr("r",2.4).attr("fill",e.g==="caigut"||e.g==="pedraCau"?MUT:BL);
          if(e.lab !== false){
            const lx = px + (e.g==="punt" ? 9 : e.g==="grua" ? 36 : 30);
            const str = e.txt || (e.left ? `${d.curt} · ${e.t || d.anyTxt || d.any}` : `${e.t || d.anyTxt || d.any} · ${d.curt}`);
            const n = IBV.t(s, e.left ? px-9 : lx, yL+4, str, {size:11, anchor:e.left?"end":"start", fill:e.red?VR:INK, weight:d.clau?700:400});
            let bb = n.node().getBBox();
            if(bb.x + bb.width > w - 2){ n.attr("x", px - 9).attr("text-anchor","end"); bb = n.node().getBBox(); }
            s.insert("rect", () => n.node()).attr("x",bb.x-4).attr("y",bb.y-1).attr("width",bb.width+8).attr("height",bb.height+2).attr("fill",PAPER);
          }
          hit.push({x:px, y:yL, d, sel:this});
        });
      });

      // xifres d'avui al final del darrer carril
      const yLast = y0L + (LANES.length-1)*laneH + laneH/2;
      IBV.t(g, w-14, yLast+20, "2025: unes 25.000 persones al solstici d'estiu · 1.253.397 visites en tot l'any", {size:10.5, anchor:"end", fill:MUT, halo:true});

      const all = g.selectAll("g.lect, g.lane");
      IBV.onView(container, inst => {
        if(inst) return;
        lect.attr("opacity",0).attr("transform","translate(0,8)").transition().delay((d,i)=>200+i*110).duration(600).ease(d3.easeCubicOut).attr("opacity",1).attr("transform",null);
        lanes.attr("opacity",0).transition().delay((d,i)=>500+i*90).duration(500).attr("opacity",1);
        lanes.selectAll("line.seg").each(function(){ const n = d3.select(this), x2 = +n.attr("data-x2"); n.attr("x2", n.attr("x1")).transition().delay(700).duration(1400).ease(d3.easeCubicInOut).attr("x2", x2); });
      });
      bindHover(svg, all, hit);
    }

    /* ---------------- mòbil: columna vertical, una fila per fet ---------------- */
    function drawMob(container, w){
      const extra = [
        {any:1900, tipus:"baix", anyTxt:"Desembre del 1900", curt:"Cau la pedra 22", det:"Cau un sarsen del cercle i la llinda que aguantava es parteix en dos", g:"caigut"},
        {any:1963.1, tipus:"baix", anyTxt:"10 de març del 1963", curt:"El vent tomba un sarsen", det:"Una ventada fa caure un pilar del cercle exterior", g:"pedraCau"}
      ];
      const GL = {1797:"caigut", 1901:"pedra", 1918:"punt", 1919:"grua", 1958:"dret", 1964:"pedra", 1985:"punt", 1986:"punt", 2000:"punt"};
      const R = E.concat(extra).sort((p,q) => p.any - q.any);
      const ax = 40, cx = ax + 8, tx = ax + 82, tw = w - tx - 2, chars = Math.max(18, Math.floor(tw/6.1));
      let y = 34; const rows = [];
      R.forEach((d, i) => {
        if(i){ const gap = Math.floor(d.any) - Math.floor(R[i-1].any); if(gap >= 60){ rows.push({gap, y}); y += 34; } }
        const up = d.tipus === "dalt", lines = wrap(d.det, chars);
        const h = Math.max(up ? 74 : 46, 30 + lines.length*13);
        rows.push({d, y, h, lines, up, g:d.g || GL[d.any]}); y += h + 8;
      });
      const H = y + 30;
      const svg = IBV.svg(container, w, H, "Filera cronològica vertical de 1136 a 2026: lectures de Stonehenge (vermell i negre) i intervencions físiques (blau).");
      container.appendChild(container.querySelector(".tip.ibv-dock"));
      const g = svg.append("g"), hit = [];
      IBV.t(g, 0, 14, "Vermell i negre: què s'hi ha vist · Blau: què s'hi ha fet", {size:11, fill:MUT});
      // eix vertical trencat als salts llargs
      let yS = 26;
      rows.filter(r => r.gap).forEach(r => {
        g.append("line").attr("x1",ax).attr("x2",ax).attr("y1",yS).attr("y2",r.y+6).attr("stroke",INK).attr("stroke-width",.9);
        g.append("path").attr("d",`M${ax-6},${r.y+12}L${ax+6},${r.y+8}M${ax-6},${r.y+18}L${ax+6},${r.y+14}`).attr("stroke",INK).attr("stroke-width",.9);
        IBV.t(g, ax+12, r.y+17, `${r.gap} anys després`, {size:10.5, fill:MUT, italic:true});
        yS = r.y + 22;
      });
      g.append("line").attr("x1",ax).attr("x2",ax).attr("y1",yS).attr("y2",H-20).attr("stroke",INK).attr("stroke-width",.9);
      const fr = g.selectAll("g.r").data(rows.filter(r => r.d)).join("g").attr("class","r");
      fr.each(function(r){
        const s = d3.select(this), d = r.d, key = !!d.clau, y0 = r.y + 14;
        IBV.t(s, ax-7, y0+4, String(Math.floor(d.any)), {size:11.5, anchor:"end", fill:MUT});
        if(r.up){
          s.append("circle").attr("cx",ax).attr("cy",y0).attr("r",key?5:3.8).attr("fill",key?VR:INK);
          const vg = s.append("g").attr("transform",`translate(${cx+34},${r.y+64}) scale(.86)`);
          VIG[d.any](vg);
        } else {
          const gg = r.g;
          if(gg === "punt") s.append("circle").attr("cx",ax).attr("cy",y0).attr("r",4.2).attr("fill",PAPER).attr("stroke",d.any===1985?VR:BL).attr("stroke-width",1.7);
          else s.append("circle").attr("cx",ax).attr("cy",y0).attr("r",3.2).attr("fill",gg==="caigut"||gg==="pedraCau"?MUT:BL);
          if(gg === "grua"){ grua(s, cx+22, r.y+40, 1.05); tril(s, cx+44, r.y+40, 1, {state:"pedra"}); }
          else if(gg && gg !== "punt") tril(s, cx+34, r.y+40, 1.15, {state:gg==="dret"?undefined:gg, col:gg==="caigut"||gg==="pedraCau"?MUT:INK});
        }
        IBV.t(s, tx, y0+4, d.curt, {size:12.5, weight:700, fill:r.up&&key?VR:(d.any===1985?VR:INK)});
        const sub = d.anyTxt && d.anyTxt !== String(Math.floor(d.any)) ? 15 : 0;
        if(sub) IBV.t(s, tx, y0+19, d.anyTxt, {size:11, fill:MUT});
        r.lines.forEach((l,k) => IBV.t(s, tx, y0+19+sub+k*13, l, {size:11, fill:MUT}));
        hit.push({x:w/2, y:y0+10, d, sel:this});
      });
      IBV.t(g, 0, H-4, "2025: unes 25.000 persones al solstici · 1.253.397 visites", {size:10.5, fill:MUT});
      IBV.onView(container, inst => { if(inst) return; fr.attr("opacity",0).transition().delay((d,i)=>i*60).duration(450).attr("opacity",1); });
      bindHover(svg, fr, hit);
    }

    function bindHover(svg, groups, hit){
      const dl = d3.Delaunay.from(hit, h => h.x, h => h.y);
      IBV.hover(svg.node(), (ev,[px,py]) => {
        const h = hit[dl.find(px,py)]; if(Math.hypot(h.x-px, h.y-py) > 120){ IBV.focus(groups, null); tp.hide(); return; }
        const on = d3.select(h.sel).datum(); IBV.focus(groups, q => q === on);
        tp.show(`<b>${h.d.anyTxt||Math.floor(h.d.any)} · ${h.d.curt}</b> · ${h.d.det}`);
      }, () => { IBV.focus(groups, null); tp.hide(); });
    }

    function wrap(str, n){
      const out = []; let cur = "";
      String(str).split(" ").forEach(wd => { if((cur + " " + wd).trim().length > n){ if(cur) out.push(cur); cur = wd; } else cur = (cur + " " + wd).trim(); });
      if(cur) out.push(cur); return out;
    }
  })();
})();
