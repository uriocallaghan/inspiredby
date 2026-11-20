#!/usr/bin/env python3
"""Reordena web/sistema/index.html per famílies (research/sistema-codis.json).
Es pot tornar a executar: agafa les seccions que ja hi ha i hi afegeix els fragments de web/sistema/_frag/<codi>.html."""
import json, re, os, html
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(R, 'web/sistema/index.html')
J = json.load(open(os.path.join(R, 'research/sistema-codis.json')))
s = open(P, encoding='utf-8').read()
A0 = s.index('  <h2 class="part" id="peces">'); B0 = s.index('  <div class="fn">')
secs = {}
for chunk in re.split(r'(?=<section class="pc" id=")', s[A0:B0])[1:]:
    m = re.match(r'<section class="pc" id="([a-z]+-\d\d)">', chunk)
    end = chunk.rfind('</section>')
    if m and end > 0: secs[m.group(1)] = '  ' + chunk[:end + len('</section>')]
FR = os.path.join(R, 'web/sistema/_frag')
for f in sorted(os.listdir(FR)) if os.path.isdir(FR) else []:
    if f.endswith('.html'):
        t = open(os.path.join(FR, f), encoding='utf-8').read().strip()
        t = re.sub(r'^\s*', '  ', t, count=1)
        secs[f[:-5]] = t if t.endswith('</section>') else t
fams = J['families']; pcs = J['pieces']
def title(p): return f'{p["en"]}<small> · {p["ca"]}</small>'
out = []; toc = []; missing = []
for F in fams:
    fid = 'fam-' + F['prefix'].lower()
    out.append(f'\n  <h3 class="fam" id="{fid}"><span class="fam-c">{F["prefix"]}</span>{F["ca"]}<span class="fam-q">{F["question"]}</span></h3>\n')
    toc.append(f'    <li class="fam"><a href="#{fid}"><b>{F["prefix"]}</b>{F["ca"]}</a></li>')
    for p in [p for p in pcs if p['family'] == F['prefix']]:
        k = p['code'].lower(); sec = secs.get(k)
        if not sec: missing.append(p['code']); continue
        sec = re.sub(r'<span class="pc-n">[^<]*</span><h4>.*?</h4>', f'<span class="pc-n">{p["code"]}</span><h4>{title(p)}</h4>', sec, count=1, flags=re.S)
        out.append(sec + '\n')
        toc.append(f'    <li><a href="#{k}"><b>{p["code"]}</b>{p["en"]}</a></li>')
n = len(pcs) - len(missing)
a = s.index('  <h2 class="part" id="peces">'); b = s.index('  <div class="fn">')
famnav = '<nav class="famnav" aria-label="Famílies">' + ''.join(f'<a href="#fam-{F["prefix"].lower()}">{F["prefix"]}</a>' for F in fams) + '</nav>'
head = ('  <h2 class="part" id="peces">Peces</h2>\n'
        f'  <p class="part-d">{n} maneres de mostrar dades, ordenades en vuit famílies segons la pregunta que responen: quan (<code>TIME</code>), on (<code>MAP</code>), com de gran (<code>SCALE</code>), com es distribueix (<code>SPREAD</code>), de què està fet (<code>PART</code>), què connecta amb què (<code>LINK</code>), com funciona (<code>HOW</code>) i com es comparen molts casos (<code>CASE</code>). Dins de cada família van de la més bàsica a la més creativa. Al pla visual, cita-les pel codi («V2 · MAP-01 + MAP-11»). Les que porten dades reals ho diuen al peu; la resta fan servir dades d\'exemple.</p>\n'
        f'  {famnav}\n')
s = s[:a] + head + ''.join(out) + '\n' + s[b:]
t0 = s.index('  <ol class="toc"'); t1 = s.index('</ol>', t0) + 5
s = s[:t0] + '  <ol class="toc" aria-label="Contingut">\n    <li class="fam"><a href="#principis">Principis</a></li>\n    <li><a href="#colors">Colors</a> · <a href="#tipografia">Tipografia</a></li>\n    <li><a href="#components">Components C-01 a C-08</a></li>\n' + '\n'.join(toc) + '\n  </ol>' + s[t1:]
# scripts nous: qualsevol .js de web/sistema que no estigui carregat
js = [f for f in sorted(os.listdir(os.path.join(R, 'web/sistema'))) if f.endswith('.js') and not f.startswith('_') and f'src="{f}"' not in s]
if js:
    i = s.index('<script src="../assets/ib.js"></script>')
    s = s[:i] + ''.join(f'<script src="{f}"></script>\n' for f in js) + s[i:]
open(P, 'w', encoding='utf-8').write(s)
print(n, 'peces;', 'falten:', ' '.join(missing) or 'cap', '; scripts nous:', ' '.join(js) or 'cap')
