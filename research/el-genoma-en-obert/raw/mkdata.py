#!/usr/bin/env python3
"""Prepara web/articles/el-genoma-en-obert/dades.js a partir de:
 - tree.json  (Nextstrain, dataset obert ncov_open_global_all-time, 2026-11-22)
 - agg.json / agg2.json (recomptes propis sobre metadata.tsv del mateix dataset obert)
"""
import json, collections, datetime, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
tree = json.load(open(os.path.join(HERE, 'tree.json')))
a1 = json.load(open(os.path.join(HERE, 'agg.json')))
a2 = json.load(open(os.path.join(HERE, 'agg2.json')))

# ---------- 1. arbre compacte ----------
nodes = []
def walk(x, parent):
    na = x.get('node_attrs', {})
    i = len(nodes)
    nodes.append({
        'p': parent,
        'd': round(na.get('num_date', {}).get('value', 0), 4),
        'v': na.get('div', 0),
        'r': na.get('region', {}).get('value', ''),
        'c': na.get('clade_membership', {}).get('value', ''),
        'n': x.get('name', '') if not x.get('children') else '',
        'co': na.get('country', {}).get('value', '') if not x.get('children') else '',
        'leaf': 0 if x.get('children') else 1,
    })
    for ch in x.get('children', []):
        walk(ch, i)
walk(tree['tree'], -1)

# y: ordre de les fulles; els interns, mitjana dels fills
kids = collections.defaultdict(list)
for i, n in enumerate(nodes):
    if n['p'] >= 0: kids[n['p']].append(i)
y = [0.0]*len(nodes); k = [0]
def setY(i):
    if not kids[i]:
        y[i] = k[0]; k[0] += 1; return y[i]
    vs = [setY(c) for c in kids[i]]
    y[i] = (min(vs)+max(vs))/2; return y[i]
setY(0)
nl = k[0]
REG = ['Asia','Europe','North America','South America','Africa','Oceania']
for i, n in enumerate(nodes):
    n['y'] = round(y[i]/max(1, nl-1), 4)
    n['r'] = REG.index(n['r']) if n['r'] in REG else -1
    del n['v']
order = sorted(range(len(nodes)), key=lambda i: nodes[i]['d'])
CLA = sorted({n['c'] for n in nodes}); COU = sorted({n['co'] for n in nodes})
ci = {c: i for i, c in enumerate(CLA)}; coi = {c: i for i, c in enumerate(COU)}
TREE = {
    'reg': REG, 'cla': CLA, 'cou': COU, 'nl': nl,
    'n': [[n['p'], n['d'], n['y'], n['r'], n['leaf'], ci[n['c']], n['n'], coi[n['co']]] for n in nodes],
    'updated': tree['meta'].get('updated'),
}

# ---------- 2. sèrie setmanal per regió ----------
wk = collections.defaultdict(lambda: collections.Counter())
for key, v in a2['wk_reg'].items():
    w, r = key.rsplit('|', 1)
    wk[w][r] += v
weeks = sorted(w for w in wk if '2020-01-01' <= w <= '2026-11-16')
SER = {'weeks': weeks, 'reg': REG, 'v': [[wk[w].get(r, 0) for r in REG] for w in weeks]}

# ---------- 3. països ----------
co = collections.Counter(); reg_of = {}
for key, v in a1['coll_month'].items():
    r, c, m = key.split('|')
    co[c] += v; reg_of[c] = r
# centroides: es prenen del mapa de topojson al navegador; aquí només nom, recompte i regió
CO = [[c, n, REG.index(reg_of[c]) if reg_of[c] in REG else -1] for c, n in co.most_common()]

# ---------- 4. retard col·lecta → publicació ----------
LAG = [[m, q[0], q[1], q[2]] for m, q in sorted(a2['lag_q'].items()) if '2020-01' <= m <= '2026-10' and q[0] >= 30]

TOT = a2['n']
out = {
    'tree': TREE, 'ser': SER, 'co': CO, 'lag': LAG, 'tot': TOT,
    'early': a2['early'][:40],
}
js = 'window.GEN_DATA=' + json.dumps(out, separators=(',', ':'), ensure_ascii=False) + ';\n'
dst = '/Users/uriocallaghan/Documents/Claude Code/InspiredBy Magazine/web/articles/el-genoma-en-obert/dades.js'
os.makedirs(os.path.dirname(dst), exist_ok=True)
open(dst, 'w').write(js)
print('nodes', len(nodes), 'fulles', nl, 'setmanes', len(weeks), 'països', len(CO), 'mesos lag', len(LAG), 'total', TOT)
print('mida', round(len(js)/1024), 'KB ->', dst)
