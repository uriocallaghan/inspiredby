(async function () {
  const response = await fetch('dades.json');
  if (!response.ok) return;
  const data = await response.json();
  const colors = { vida: IBV.C.vermell, cartes: IBV.C.blau, escrits: IBV.C.ink2, cànon: IBV.C.groc };
  const el = selector => document.querySelector(selector);
  const fmt = year => year < 0 ? `${Math.abs(year)} aC` : `${year} dC`;

  function captionTip(container, title, text) {
    const tip = IBV.tip(container);
    tip.show(`<b>${title}</b><br>${text}`, 16, 16);
    return tip;
  }

  function timeline() {
    const fig = el('#temps');
    if (!fig) return;
    const plot = fig.querySelector('.plot');
    const output = fig.querySelector('.readout');
    const tip = IBV.tip(plot);
    let group = 'vida';
    let redraw;
    const buttons = [...fig.querySelectorAll('[data-group]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      group = button.dataset.group;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      redraw?.();
    }));
    IBV.mount(plot, (_, width) => {
      redraw = draw;
      function draw() {
        const records = group === 'tots' ? data.fites : data.fites.filter(item => item.grup === group);
        const narrow = width < 560;
        const left = narrow ? 105 : 155;
        const right = width - 24;
        const height = records.length * 42 + 60;
        const svg = IBV.svg(plot, width, height, 'Cronologia de la vida de Jesús i la formació dels escrits');
        const max = group === 'cànon' || group === 'tots' ? 370 : 112;
        const min = group === 'vida' ? -8 : 0;
        const x = d3.scaleLinear().domain([min, max]).range([left, right]);
        const ticks = max === 370 ? [0, 100, 200, 300, 367] : min < 0 ? [-5, 1, 25, 50, 75, 100] : [1, 25, 50, 75, 100];
        ticks.forEach(value => {
          svg.append('line').attr('x1', x(value)).attr('x2', x(value)).attr('y1', 24).attr('y2', height - 10).attr('stroke', IBV.C.grid);
          IBV.t(svg, x(value), 15, fmt(value), { size: 11, anchor: 'middle' });
        });
        const rows = svg.selectAll('.time-row').data(records).join('g').attr('class', 'time-row')
          .attr('transform', (_, i) => `translate(0,${53 + i * 42})`)
          .attr('tabindex', 0).attr('role', 'button');
        rows.append('line').attr('x1', left).attr('x2', right).attr('stroke', IBV.C.hair);
        rows.append('rect').attr('class', 'range').attr('x', d => x(d.start)).attr('width', d => Math.max(4, x(d.end) - x(d.start)))
          .attr('y', -5).attr('height', 10).attr('rx', 5).attr('fill', d => colors[d.grup]).attr('opacity', 0.85);
        IBV.t(rows, 0, 4, d => d.nom, { size: narrow ? 11.5 : 12.5, weight: 600 });
        IBV.t(rows, d => x((d.start + d.end) / 2), -10, d => d.label, { size: 11.5, anchor: 'middle' });
        rows.append('rect').attr('x', 0).attr('y', -18).attr('width', width).attr('height', 41).attr('fill', 'transparent');
        const guide = svg.append('line').attr('stroke', IBV.C.ink).attr('stroke-width', 0.8).attr('y1', 24).attr('y2', height - 10).style('display', 'none');
        const direct = svg.append('text').attr('font', '700 11.5px "Source Sans 3"').attr('fill', IBV.C.ink).attr('text-anchor', 'middle');
        function reset() {
          tip.hide();
          rows.style('opacity', 1).select('.range').attr('stroke', null).attr('height', 10);
          guide.style('display', 'none');
          direct.text('');
        }
        function focus(event, record) {
          const node = this;
          const px = x((record.start + record.end) / 2);
          rows.style('opacity', function () { return this === node ? 1 : 0.2; });
          d3.select(node).raise().select('.range').attr('stroke', IBV.C.ink).attr('stroke-width', 1.5).attr('height', 12).attr('y', -6);
          guide.style('display', null).attr('x1', px).attr('x2', px);
          direct.attr('x', px).attr('y', height - 1).text(record.label);
          tip.show(`<b>${record.nom}</b><br>${record.detail}`, px, 30 + records.indexOf(record) * 42);
          output.textContent = `${record.nom} · ${record.label}. ${record.detail}`;
        }
        rows.each(function (record) {
          const row = d3.select(this);
          IBV.hover(this, () => focus.call(this, null, record), reset);
          row.on('focus', e => focus.call(this, e, record)).on('blur', reset)
            .on('click', e => focus.call(this, e, record))
            .on('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus.call(this, e, record); } });
        });
        IBV.onView(svg.node(), instant => {
          if (!instant) rows.select('.range').attr('width', 0).transition().duration(850).ease(d3.easeCubicInOut)
            .attr('width', d => Math.max(4, x(d.end) - x(d.start)));
        });
      }
      draw();
    });
    const scrolly = el('#temps-scroll');
    if (scrolly) IB.scrolly(scrolly.querySelector('.steps'), plot, (_, step) => {
      const button = buttons.find(item => item.dataset.group === step.dataset.group);
      button?.click();
    });
  }

  function sceneComparison() {
    const fig = el('#comparacio');
    if (!fig) return;
    const plot = fig.querySelector('.plot');
    const output = fig.querySelector('.readout');
    let scene = 0;
    let update;
    const buttons = [...fig.querySelectorAll('.seg button')];
    buttons.forEach((button, i) => button.addEventListener('click', () => {
      scene = i;
      buttons.forEach((item, n) => item.setAttribute('aria-pressed', String(n === i)));
      output.textContent = data.escenes[i].nota;
      update?.();
    }));
    IBV.mount(plot, (_, width) => {
      const height = 255;
      const left = width < 520 ? 62 : 84;
      const right = width - 24;
      const top = 54;
      const svg = IBV.svg(plot, width, height, 'Posició de quatre escenes dins dels quatre evangelis');
      const tip = IBV.tip(plot);
      const x = d3.scaleLinear().domain([0, 1]).range([left, right]);
      [0, 0.25, 0.5, 0.75, 1].forEach(v => {
        svg.append('line').attr('x1', x(v)).attr('x2', x(v)).attr('y1', 30).attr('y2', top + 3 * 48 + 14).attr('stroke', IBV.C.grid);
        IBV.t(svg, x(v), 17, v === 0 ? 'Inici' : v === 1 ? 'Final' : `${v * 100}%`, { size: 11, anchor: 'middle' });
      });
      const rows = svg.selectAll('.scene-row').data(data.llibres).join('g').attr('class', 'scene-row')
        .attr('transform', (_, i) => `translate(0,${top + i * 48})`).attr('tabindex', 0).attr('role', 'button');
      IBV.t(rows, 0, 4, d => d[0], { size: 12.5, weight: 600 });
      rows.append('line').attr('x1', left).attr('x2', right).attr('stroke', IBV.C.hair).attr('stroke-width', 2);
      rows.append('line').attr('class', 'scene-guide').attr('x1', left).attr('x2', left).attr('stroke', IBV.C.vermell).attr('stroke-width', 4);
      rows.append('circle').attr('class', 'scene-dot').attr('r', 6).attr('fill', IBV.C.vermell);
      rows.append('rect').attr('x', left - 9).attr('y', -15).attr('width', right - left + 18).attr('height', 30).attr('fill', 'transparent');
      const values = rows.append('text').attr('class', 'scene-ref').attr('y', -11).attr('font', '600 12px "Source Sans 3"').attr('fill', IBV.C.ink);
      function reset() {
        tip.hide();
        rows.style('opacity', 1).selectAll('circle').attr('r', 6).attr('stroke', null);
      }
      function focus(event, d, i) {
        const p = (parseInt(data.escenes[scene].refs[i], 10) - 1) / (d[1] - 1);
        rows.style('opacity', function () { return this === event?.currentTarget || this === rows.nodes()[i] ? 1 : 0.18; });
        d3.select(rows.nodes()[i]).raise().select('circle').attr('r', 8).attr('stroke', IBV.C.ink).attr('stroke-width', 1.5);
        tip.show(`<b>${d[0]} · ${data.escenes[scene].refs[i]}</b><br>${data.escenes[scene].nota}`, x(p), top + i * 48);
        output.textContent = `${d[0]} · ${data.escenes[scene].refs[i]}. ${data.escenes[scene].nota}`;
      }
      update = () => {
        reset();
        rows.each(function (d, i) {
          const p = (parseInt(data.escenes[scene].refs[i], 10) - 1) / (d[1] - 1);
          d3.select(this).select('.scene-guide').transition().duration(IBV.reduced ? 0 : 500).attr('x2', x(p));
          d3.select(this).select('.scene-dot').transition().duration(IBV.reduced ? 0 : 500).attr('cx', x(p));
          values.filter((_, n) => n === i).attr('x', x(p)).attr('text-anchor', p > 0.82 ? 'end' : 'start').text(data.escenes[scene].refs[i]);
        });
      };
      rows.each(function (d, i) {
        IBV.hover(this, e => focus(e, d, i), reset);
        d3.select(this).on('focus', e => focus(e, d, i)).on('blur', reset).on('click', e => focus(e, d, i));
      });
      update();
      IBV.onView(svg.node(), instant => {
        if (!instant) rows.select('.scene-dot').attr('cx', left).transition().duration(800).ease(d3.easeCubicInOut)
          .attr('cx', (_, i) => x((parseInt(data.escenes[scene].refs[i], 10) - 1) / (data.llibres[i][1] - 1)));
      });
    });
  }

  function infancyMatrix() {
    const fig = el('#infancia');
    if (!fig) return;
    const plot = fig.querySelector('.plot');
    const output = fig.querySelector('.readout');
    IBV.mount(plot, (_, width) => {
      const names = ['Mateu', 'Marc', 'Lluc', 'Joan'];
      const rowH = 45;
      const height = 30 + data.infancia.length * rowH;
      const labelW = Math.min(220, width * 0.35);
      const cellW = (width - labelW) / 4;
      const svg = IBV.svg(plot, width, height, 'Comparació de les històries d’infància dels quatre evangelis');
      names.forEach((name, i) => IBV.t(svg, labelW + cellW * (i + 0.5), 15, name, { size: 12, weight: 700, anchor: 'middle' }));
      const rows = svg.selectAll('.matrix-row').data(data.infancia).join('g').attr('class', 'matrix-row')
        .attr('transform', (_, i) => `translate(0,${30 + i * rowH})`).attr('tabindex', 0).attr('role', 'button');
      IBV.t(rows, 0, 14, d => d.nom, { size: 12.5, weight: 600 });
      rows.selectAll('.cell').data(d => names.map(name => ({ name, value: d[name.toLocaleLowerCase('ca')] }))).join('rect')
        .attr('class', 'cell').attr('x', (d, i) => labelW + i * cellW + 5).attr('width', Math.max(8, cellW - 10)).attr('y', 0).attr('height', 27)
        .attr('fill', d => d.value.startsWith('No') ? IBV.C.grid : d.value === 'Present' ? IBV.C.vermell : IBV.C.blau)
        .attr('opacity', d => d.value.startsWith('No') ? 0.38 : 0.78);
      function select(event, d) {
        rows.style('opacity', function () { return this === event.currentTarget ? 1 : 0.22; });
        rows.selectAll('.cell').attr('stroke', null);
        d3.select(this).selectAll('.cell').attr('stroke', IBV.C.ink).attr('stroke-width', 1);
        output.textContent = `${d.nom}: Mateu — ${d.mateu}; Marc — ${d.marc}; Lluc — ${d.lluc}; Joan — ${d.joan}.`;
      }
      rows.each(function (d) {
        const row = d3.select(this);
        row.on('mouseenter', e => select.call(this, e, d)).on('mouseleave', () => rows.style('opacity', 1).selectAll('.cell').attr('stroke', null))
          .on('focus', e => select.call(this, e, d)).on('click', e => select.call(this, e, d));
      });
      IBV.onView(svg.node(), instant => {
        if (!instant) rows.style('opacity', 0).transition().duration(700).delay((_, i) => i * 70).style('opacity', 1);
      });
    });
  }

  function geography() {
    const fig = el('#geografia');
    if (!fig) return;
    const plot = fig.querySelector('.plot');
    const output = fig.querySelector('.readout');
    let mode = 'vida';
    let draw;
    fig.querySelectorAll('[data-map]').forEach(button => button.addEventListener('click', () => {
      mode = button.dataset.map;
      fig.querySelectorAll('[data-map]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      draw?.();
    }));
    IBV.mount(plot, (_, width) => {
      draw = () => {
        const height = width < 520 ? 390 : 430;
        const svg = IBV.svg(plot, width, height, 'Mapa esquemàtic dels llocs i recorreguts de Jesús i les primeres comunitats');
        const tip = IBV.tip(plot);
        const shown = mode === 'vida' ? data.ciutats.filter(d => ['Natzaret', 'Jordà', 'Cafarnaüm', 'Jerusalem'].includes(d.nom)) : data.ciutats.filter(d => ['Jerusalem', 'Antioquia', 'Corint', 'Roma'].includes(d.nom));
        const path = mode === 'vida'
          ? [{ x: .22, y: .24 }, { x: .34, y: .39 }, { x: .64, y: .34 }, { x: .60, y: .79 }]
          : [{ x: .60, y: .79 }, { x: .84, y: .25 }, { x: .18, y: .70 }, { x: .11, y: .13 }];
        const line = d3.line().x(d => 25 + d.x * (width - 50)).y(d => 28 + d.y * (height - 56)).curve(d3.curveCatmullRom);
        const route = svg.append('path').attr('d', line(path)).attr('fill', 'none').attr('stroke', mode === 'vida' ? IBV.C.vermell : IBV.C.blau).attr('stroke-width', 2.2)
          .attr('stroke-dasharray', '5 5');
        const nodes = svg.selectAll('.map-node').data(shown).join('g').attr('class', 'map-node')
          .attr('transform', d => `translate(${25 + d.x * (width - 50)},${28 + d.y * (height - 56)})`).attr('tabindex', 0).attr('role', 'button');
        nodes.append('circle').attr('r', 8).attr('fill', mode === 'vida' ? IBV.C.vermell : IBV.C.blau).attr('stroke', IBV.C.ink).attr('stroke-width', 1);
        IBV.t(nodes, 13, 4, d => d.nom, { size: 12.5, weight: 700 });
        function reset() { tip.hide(); nodes.style('opacity', 1).select('circle').attr('r', 8); route.attr('opacity', 1); }
        nodes.each(function (d) {
          const focus = () => {
            nodes.style('opacity', n => n === d ? 1 : 0.2);
            nodes.select('circle').attr('r', n => n === d ? 10 : 8);
            route.attr('opacity', 0.18);
            output.textContent = `${d.nom}: ${d.nota}.`;
            tip.show(`<b>${d.nom}</b><br>${d.nota}`, 25 + d.x * (width - 50), 28 + d.y * (height - 56));
          };
          IBV.hover(this, focus, reset);
          d3.select(this).on('focus', focus).on('blur', reset).on('click', focus);
        });
        IBV.onView(svg.node(), instant => {
          if (!instant) route.attr('stroke-dashoffset', 300).transition().duration(1200).attr('stroke-dashoffset', 0);
        });
      };
      draw();
    });
  }

  function evidence() {
    const fig = el('#evidencia');
    if (!fig) return;
    const plot = fig.querySelector('.plot');
    const output = fig.querySelector('.readout');
    const tip = IBV.tip(plot);
    IBV.mount(plot, (_, width) => {
      const groups = ['més ferma', 'debatuda', 'de fe'];
      const x = d3.scalePoint().domain(groups).range(width < 560 ? [65, width - 90] : [120, width - 130]);
      const colorsByGroup = { 'més ferma': IBV.C.vermell, debatuda: IBV.C.blau, 'de fe': IBV.C.groc };
      const height = 410;
      const svg = IBV.svg(plot, width, height, 'Grau de certesa de les afirmacions sobre Jesús');
      groups.forEach(group => {
        const color = colorsByGroup[group];
        IBV.t(svg, x(group), 24, group, { size: 13, weight: 700, anchor: 'middle' });
        svg.append('line').attr('x1', x(group)).attr('x2', x(group)).attr('y1', 52).attr('y2', height - 20).attr('stroke', IBV.C.grid);
        IBV.t(svg, x(group), height - 2, group === 'més ferma' ? 'contrastable' : group === 'debatuda' ? 'reconstrucció' : 'creença', { size: 11, italic: true, anchor: 'middle' });
        const items = data.evidencia.filter(d => d.grau === group);
        const shortLabels = {
          'Jesús va existir i va ser crucificat': 'Existència i crucifixió',
          'Va anunciar el Regne de Déu': 'Regne de Déu',
          'Va ser considerat guaridor i exorcista': 'Guaridor i exorcista',
          'Va rebre el baptisme de Joan': 'Baptisme de Joan',
          'Data exacta del naixement': 'Data del naixement',
          'Nombres, discursos i ordre de les escenes': 'Discursos i ordre',
          'Què va passar després de la mort': 'Després de la mort'
        };
        svg.selectAll(`.claim-${group.replace(/\\s/g, '')}`).data(items).join('g').attr('class', 'claim')
          .attr('transform', (_, i) => `translate(${x(group)},${65 + i * 80})`).attr('tabindex', 0).attr('role', 'button')
          .call(nodes => {
            nodes.append('circle').attr('r', 7).attr('fill', color).attr('stroke', IBV.C.ink);
            IBV.t(nodes, 0, -14, d => width < 560 ? shortLabels[d.nom] : d.nom, { size: width < 560 ? 11 : 12, anchor: 'middle', weight: 600 });
            nodes.each(function (d) {
              const node = this;
              const focus = () => {
                svg.selectAll('.claim').style('opacity', function () { return this === node ? 1 : 0.17; }).select('circle').attr('r', function () { return this.parentNode === node ? 10 : 7; });
                tip.show(`<b>${d.nom}</b><br>${d.text}<br><i>${d.refs}</i>`, x(group), 65 + items.indexOf(d) * 80);
                output.textContent = `${d.nom} — ${d.text} Referències: ${d.refs}.`;
              };
              IBV.hover(this, focus, () => { tip.hide(); svg.selectAll('.claim').style('opacity', 1).select('circle').attr('r', 7); });
              d3.select(this).on('focus', focus).on('click', focus);
            });
          });
      });
      IBV.onView(svg.node(), instant => {
        if (!instant) svg.selectAll('.claim circle').attr('r', 0).transition().duration(750).delay((_, i) => i * 90).attr('r', 7);
      });
    });
  }

  function sources() {
    const fig = el('#fonts-diagrama');
    if (!fig) return;
    const plot = fig.querySelector('.plot');
    const output = fig.querySelector('.readout');
    IBV.mount(plot, (_, width) => {
      const height = width < 560 ? 440 : 400;
      const svg = IBV.svg(plot, width, height, 'Diagrama de les relacions literàries entre els evangelis sinòptics');
      const tip = IBV.tip(plot);
      const byName = new Map(data.fonts.map(d => [d.nom, d]));
      const edges = [['Tradició oral','Marc'],['Tradició oral','Q (hipòtesi)'],['Marc','Mateu'],['Marc','Lluc'],['Q (hipòtesi)','Mateu'],['Q (hipòtesi)','Lluc'],['Tradició oral','Joan']];
      const pos = d => [d.x * (width - 40) + 20, d.y * (height - 70) + 20];
      const paths = svg.selectAll('.source-edge').data(edges).join('path').attr('class','source-edge').attr('fill','none')
        .attr('stroke', d => d[1] === 'Joan' ? IBV.C.ghost : IBV.C.blau).attr('stroke-width', d => d[1] === 'Joan' ? 1 : 1.5)
        .attr('stroke-dasharray', d => d.includes('Q (hipòtesi)') || d[1] === 'Joan' ? '5 4' : null)
        .attr('d', d => { const [x1,y1]=pos(byName.get(d[0])); const [x2,y2]=pos(byName.get(d[1])); return `M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`; });
      const nodes = svg.selectAll('.source-node').data(data.fonts).join('g').attr('class','source-node')
        .attr('transform', d => `translate(${pos(d)})`).attr('tabindex',0).attr('role','button');
      nodes.append('circle').attr('r', d => d.nom.includes('Q') ? 11 : 9).attr('fill', d => d.nom.includes('Q') ? 'white' : d.nom === 'Tradició oral' ? IBV.C.groc : IBV.C.vermell)
        .attr('stroke', IBV.C.ink).attr('stroke-width', 1.2);
      IBV.t(nodes, 0, 26, d => d.nom, { size: 12.5, weight: 700, anchor: 'middle' });
      nodes.each(function(d){
        const focus=()=>{
          nodes.style('opacity', n => n === d || edges.some(e => e.includes(d.nom) && e.includes(n.nom)) ? 1 : .15);
          paths.attr('opacity', e => e.includes(d.nom) ? 1 : .12).attr('stroke-width', e => e.includes(d.nom) ? 3 : 1);
          output.textContent = `${d.nom}: ${d.tip}.`;
          tip.show(`<b>${d.nom}</b><br>${d.tip}`, ...pos(d));
        };
        IBV.hover(this,focus,()=>{tip.hide();nodes.style('opacity',1);paths.attr('opacity',1).attr('stroke-width',1.5);});
        d3.select(this).on('focus',focus).on('click',focus);
      });
      IBV.onView(svg.node(), instant => {
        if (!instant) paths.attr('stroke-dashoffset', 180).transition().duration(1000).attr('stroke-dashoffset', 0);
      });
    });
  }

  timeline();
  geography();
  infancyMatrix();
  sceneComparison();
  evidence();
  sources();
  const active = document.querySelector('#temps .readout');
  if (active) active.textContent = 'Vida de Jesús · 6 aC–33 dC. Canvia de cronologia per veure quan s’escriuen les cartes, els evangelis i el cànon.';
})();
