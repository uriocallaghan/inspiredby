(async function () {
  const response = await fetch('dades.json');
  if (!response.ok) return;
  const { escenes, llibres, fites } = await response.json();
  function chart(id, records, render) {
    const fig = document.getElementById(id);
    const plot = fig.querySelector('.plot');
    const output = fig.querySelector('.readout');
    const tip = IBV.tip(plot);
    let scene = 0;
    let update;
    fig.querySelectorAll('.seg button').forEach((button, index, buttons) => {
      button.addEventListener('click', () => {
        scene = index;
        buttons.forEach((other, i) => other.setAttribute('aria-pressed', i === scene));
        output.textContent = escenes[scene].nota;
        update?.();
      });
    });
    IBV.mount(plot, (_, width) => {
      const chronological = id === 'temps';
      const left = chronological ? 122 : 72;
      const right = width - (chronological ? 24 : 54);
      const height = records.length * 38 + 42;
      const svg = IBV.svg(plot, width, height, fig.querySelector('.vh').textContent);
      const scale = d3.scaleLinear().domain(chronological ? [-9, 110] : [0, 1]).range([left, right]);
      const ticks = chronological ? [1, 30, 70, 100] : [0, 1];
      ticks.forEach(value => {
        const x = scale(value);
        svg.append('line').attr('x1', x).attr('x2', x).attr('y1', 23).attr('y2', height-8).attr('stroke', IBV.C.grid);
        IBV.t(svg, x, 14, chronological ? value+' dC' : value ? 'Final' : 'Inici', {size:11, anchor:'middle'});
      });
      const rows = svg.selectAll('.row').data(records).join('g').attr('class','row')
        .attr('transform', (_, i) => 'translate(0,'+(40+i*38)+')').attr('tabindex',0)
        .attr('role','button');
      rows.append('rect').attr('width',width).attr('height',37).attr('y',-18).attr('fill','transparent');
      rows.each(function (record) {
        const row = d3.select(this);
        IBV.t(row, 0, 4, record[0], {size:12.5, weight:600});
        row.append('line').attr('x1',left).attr('x2',right).attr('stroke',IBV.C.hair);
        if (!chronological) {
          for (let n=1; n<=record[1]; n++) {
            const x = scale((n-1)/(record[1]-1));
            row.append('line').attr('x1',x).attr('x2',x).attr('y1',-3).attr('y2',3).attr('stroke',IBV.C.ghost);
          }
        }
        row.append('circle').attr('class','mark').attr('r',5).attr('fill',IBV.C.vermell);
        row.append('text').attr('class','value').attr('y',-8).attr('font-size',11.5);
      });
      const point = (record,i) => render(record,i,scene);
      function reset() {
        tip.hide();
        rows.style('opacity',1).select('.mark').attr('r',5).attr('stroke','none');
      }
      update = () => {
        reset();
        rows.each(function(record,i) {
          const row=d3.select(this);
          const {position,label,detail}=point(record,i);
          const x=scale(position);
          row.attr('aria-label',record[0]+' · '+label+'. '+detail);
          row.select('.value').attr('text-anchor',x>right-35?'end':'start').attr('x',x).text(label);
          row.select('.mark').transition().duration(IBV.reduced?0:350).attr('cx',x);
        });
      };
      update();
      rows.each(function(record,i) {
        const self=this;
        function focus() {
          const {position,label,detail}=point(record,i);
          rows.style('opacity',function(){return this===self?1:.28});
          rows.select('.mark').attr('r',5).attr('stroke','none');
          d3.select(self).select('.mark').attr('r',6).attr('stroke',IBV.C.ink);
          tip.show('<b>'+record[0]+' · '+label+'</b><br>'+detail,scale(position),40+i*38);
        }
        function select() {
          focus();
          const {label,detail}=point(record,i);
          output.textContent=record[0]+' · '+label+'. '+detail;
        }
        IBV.hover(self,focus,reset);
        d3.select(self).on('focus',focus).on('blur',reset).on('click',select)
          .on('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}});
      });
      IBV.onView(svg.node(),instant=>{
        if(!instant) rows.select('.mark').attr('r',0).transition().duration(850).ease(d3.easeCubicInOut).attr('r',5);
      });
    });
  }
  chart('temps',fites,record=>({position:record[2],label:record[1],detail:record[3]}));
  chart('comparacio',llibres,(record,i,scene)=>{
    const ref=escenes[scene].refs[i];
    return {position:(parseInt(ref,10)-1)/(record[1]-1),label:ref,detail:escenes[scene].nota};
  });
})();
