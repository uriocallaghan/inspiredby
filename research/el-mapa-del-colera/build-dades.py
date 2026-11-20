#!/usr/bin/env python3
"""Prepara web/articles/el-mapa-del-colera/dades.js a partir de raw/.
Xarxa de carrers: els trams del mapa de Snow (HistData) units pels extrems (tolerància 0,06 unitats ≈ 3 m).
Distància a peu: Dijkstra des de cada bomba; cada mort i cada bomba s'enganxen al punt més proper d'un tram."""
import csv, json, math, heapq, collections, os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw")
M_PER_UNIT = 54.6   # calibració amb les bombes georeferenciades per R. Wilson (SnowGIS 2011)
st = collections.defaultdict(list)
for r in csv.DictReader(open(f"{R}/Snow.streets.csv")): st[int(r["street"])].append((float(r["x"]), float(r["y"])))
pumps = [(float(r["x"]), float(r["y"]), r["label"]) for r in csv.DictReader(open(f"{R}/Snow.pumps.csv"))]
deaths = [(float(r["x"]), float(r["y"])) for r in csv.DictReader(open(f"{R}/Snow.deaths.csv"))]
dates = [r for r in csv.DictReader(open(f"{R}/Snow.dates.csv"))]
# nodes
TOL = 0.06; nodes = []; key = {}
def nid(p):
    k = (round(p[0] / TOL), round(p[1] / TOL))
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            kk = (k[0] + dx, k[1] + dy)
            if kk in key and math.dist(nodes[key[kk]], p) <= TOL: return key[kk]
    nodes.append(p); key[k] = len(nodes) - 1; return len(nodes) - 1
segs = []  # (a,b) node ids for each consecutive pair
for s, pts in st.items():
    ids = [nid(p) for p in pts]
    for i in range(len(ids) - 1):
        if ids[i] != ids[i + 1]: segs.append((ids[i], ids[i + 1], s))
# afegeix interseccions en T: si un extrem cau sobre un altre tram, parteix el tram
def proj(p, a, b):
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy
    t = 0 if L == 0 else max(0, min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / L))
    q = (ax + t * dx, ay + t * dy); return t, q, math.dist(p, q)
changed = True
while changed:
    changed = False
    deg = collections.Counter([a for a, b, s in segs] + [b for a, b, s in segs])
    for n, d in deg.items():
        if d != 1: continue
        p = nodes[n]
        for i, (a, b, s) in enumerate(segs):
            if n in (a, b): continue
            t, q, dd = proj(p, nodes[a], nodes[b])
            if dd < 0.12 and 0.02 < t < 0.98:
                segs[i] = (a, n, s); segs.append((n, b, s)); changed = True; break
        if changed: break
adj = collections.defaultdict(list)
for a, b, s in segs:
    w = math.dist(nodes[a], nodes[b]); adj[a].append((b, w)); adj[b].append((a, w))
def attach(p):  # punt → (seg idx, t, q, dist)
    best = None
    for i, (a, b, s) in enumerate(segs):
        t, q, dd = proj(p, nodes[a], nodes[b])
        if best is None or dd < best[3]: best = (i, t, q, dd)
    return best
def dijkstra(src):
    i, t, q, d0 = attach(src); a, b, _ = segs[i]; L = math.dist(nodes[a], nodes[b])
    dist = {a: d0 + t * L, b: d0 + (1 - t) * L}; pq = [(dist[a], a), (dist[b], b)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, 1e9): continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist.get(v, 1e9): dist[v] = nd; heapq.heappush(pq, (nd, v))
    return dist
D = [dijkstra((x, y)) for x, y, _ in pumps]
def walk(p, k):
    i, t, q, d0 = attach(p); a, b, _ = segs[i]; L = math.dist(nodes[a], nodes[b])
    return d0 + min(D[k].get(a, 1e9) + t * L, D[k].get(b, 1e9) + (1 - t) * L)
dw = []
for p in deaths:
    w = [walk(p, k) for k in range(len(pumps))]; e = [math.dist(p, pp[:2]) for pp in pumps]
    kw = min(range(len(w)), key=w.__getitem__); ke = min(range(len(e)), key=e.__getitem__)
    dw.append([round(p[0], 3), round(p[1], 3), kw, round(w[kw] * M_PER_UNIT), ke, round(w[6] * M_PER_UNIT)])
segout = []
for a, b, s in segs:
    m = ((nodes[a][0] + nodes[b][0]) / 2, (nodes[a][1] + nodes[b][1]) / 2)
    w = [min(D[k].get(a, 1e9), D[k].get(b, 1e9)) + math.dist(nodes[a], nodes[b]) / 2 for k in range(len(pumps))]
    kw = min(range(len(w)), key=w.__getitem__)
    segout.append([round(nodes[a][0], 3), round(nodes[a][1], 3), round(nodes[b][0], 3), round(nodes[b][1], 3), kw, round(w[6] * M_PER_UNIT)])
near_bs_walk = sum(1 for d in dw if d[2] == 6); near_bs_eucl = sum(1 for d in dw if d[4] == 6)
unreach = sum(1 for d in dw if d[3] > 1e7)
print("nodes", len(nodes), "segs", len(segs), "deaths", len(deaths), "nearest Broad St walking", near_bs_walk, "euclid", near_bs_eucl, "unreach", unreach)
# casos al món (OMS via OWID): només països (codi ISO de 3 lletres)
cases = collections.defaultdict(dict); world = {}
for r in csv.DictReader(open(f"{R}/owid-cases.csv")):
    y = int(r["year"]); v = float(r["cholera_reported_cases"])
    if r["entity"] == "World": world[y] = v
    elif r["code"] and len(r["code"]) == 3: cases[r["code"]][y] = int(v)
deathsW = {}
for r in csv.DictReader(open(f"{R}/owid-deaths.csv")):
    if r["entity"] == "World": deathsW[int(r["year"])] = float(r["cholera_deaths"])
iso = json.load(open(f"{R}/iso-num.json"))
out = {"mPerUnit": M_PER_UNIT, "pumps": [[round(x, 3), round(y, 3), l] for x, y, l in pumps], "deaths": dw, "segs": segout,
       "dates": [[r["date"], int(r["attacks"]), int(r["deaths"])] for r in dates],
       "world": {"years": sorted(world), "cases": [int(world[y]) for y in sorted(world)], "deaths": [int(deathsW.get(y, 0)) for y in sorted(world)]},
       "countries": {iso[c]: {"iso": c, "c": cases[c]} for c in cases if c in iso}}
missing = [c for c in cases if c not in iso]; print("iso sense codi numèric:", missing)
names = {}
for r in csv.DictReader(open(f"{R}/owid-cases.csv")):
    if r["code"] in cases: names[r["code"]] = r["entity"]
iso2 = {r["alpha-3"]: r["alpha-2"] for r in csv.DictReader(open(f"{R}/iso.csv"))}
for k, v in out["countries"].items(): v["n"] = names[v["iso"]]; v["a2"] = iso2.get(v["iso"], "")
js = "/* «El mapa que va aturar el còlera» · dades reals.\n   Mapa de Snow (1855) digitalitzat per W. Tobler, paquet R HistData (M. Friendly): carrers, 13 bombes, 578 morts i taula diària.\n   deaths: [x, y, bomba més propera a peu, metres a peu fins a ella, bomba més propera en línia recta, metres a peu fins a Broad Street] (càlcul propi).\n   segs: [x0,y0,x1,y1, bomba més propera a peu, metres a peu fins a Broad Street]. 1 unitat = 54,6 m (calibrat amb SnowGIS de R. Wilson).\n   world/countries: casos de còlera notificats a l'OMS (Our World in Data, actualitzat el 18-08-2026). */\nwindow.CH_DATA=" + json.dumps(out, separators=(",", ":"), ensure_ascii=False) + ";\n"
open(os.path.join(os.path.dirname(R), "../../web/articles/el-mapa-del-colera/dades.js"), "w").write(js)
print("bytes", len(js))
