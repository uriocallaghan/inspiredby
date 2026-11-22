#!/usr/bin/env python3
"""Genera web/articles/el-mapa-d-haiti/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/el-mapa-d-haiti/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Una illa, una falla i pocs carrers als mapes d'internet", "<b>Dades reals.</b> Relleu: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), mitjana per cel·les d'uns 1,3 km; frontera: Natural Earth 1:110 m. Epicentre, hora i fondària de l'USGS.[[usgs#1]] La traça de la falla d'Enriquillo–Plantain Garden és aproximada i només orientativa; la ruptura real va ser en una falla secundària.[[calais#1]] Persones: comptatge propi de persones diferents que van editar nodes o vies d'OSM dins la caixa −74,5…−71,6° E, 17,9…20,1° N (inclou una franja de la República Dominicana), entre el 12-01-2009 i el 12-01-2010 (58) i en els 31 dies posteriors al sisme (621).[[ohsome#1]] Chapman en compta 605 entre el 12 de gener i l'11 de febrer, amb alguns robots i importacions.[[chapman#2]]"),
 ("Un mes dibuixant Port-au-Prince", "<b>Dades reals.</b> Totes les versions de les vies (<code>highway=*</code>) dins la caixa −72,42…−72,22° E, 18,48…18,62° N entre el 31-12-2009 i el 13-02-2010, extretes de l'historial complet d'OSM. Per a cada via, el moment de la primera aparició i la geometria de l'última versió; simplificades a uns 4 m i arrodonides a 0,0001° (uns 11 m). Les 295 vies anteriors al sisme van en blau; 15.167 en total. Una via partida en dues compta com a nova. La sèrie de dalt són els km de vies a les 00 h UTC de cada dia; la de baix, les persones diferents que editen Haití cada dia (mateixa caixa que el gràfic anterior).[[ohsome#2]] Relleu: Mapzen Terrain Tiles, cel·les d'uns 130 m. Hora local = UTC − 5."),
 ("4636: d'un SMS a un equip de rescat", "<b>Esquema de flux amb xifres reals</b>: 80.000 missatges processats i 45.000 informes únics i útils.[[munro#3]] Els ≈35.000 restants són la diferència (repetits o sense acció). El bloc central, la feina de traducció i localització, és un pas intermedi sense xifres pròpies. Les partícules són il·lustratives."),
 ("Cada desastre, més mans", "<b>Dades reals.</b> Persones diferents que van editar nodes o vies d'OSM cada dia UTC dins de quatre caixes: Haití (−74,5…−71,6° E, 17,9…20,1° N), Visayas orientals per al tifó Haiyan (122,0…126,2° E, 9,5…12,8° N), Nepal (80,0…88,2° E, 26,3…30,5° N) i sud-est de Turquia i nord de Síria (35,5…40,5° E, 36,0…38,5° N). Dia 0: 12-01-2010, 08-11-2013, 25-04-2015 i 06-02-2023. A la dreta, persones diferents en els 31 dies posteriors. Les caixes inclouen zones no afectades i no són de la mateixa mida.[[ohsome#3]]"),
 ("Com s'organitza una multitud sense cap", "<b>Simulació.</b> Reprodueix el mecanisme del Tasking Manager:[[tm#1]] la zona es divideix en tasques (hexàgons sobre la terra de l'àrea de Port-au-Prince); cada persona en bloqueja una de lliure, la dibuixa (entre 1,2 i 3,8 hores simulades) i l'allibera; una de cada vuit persones valida tasques ja dibuixades (entre 0,5 i 1,5 hores). Els temps i les persones són inventats; no és una reconstrucció del que va passar a Haití."),
]
METODE = ("Aquest article combina <b>dades reals calculades per a l'article</b> a partir de l'historial complet d'OpenStreetMap (consultat amb l'API ohsome de HeiGIT el 20-11-2026) amb xifres publicades en articles revisats per experts, informes i pàgines oficials. "
          "Els comptatges propis de persones són persones diferents amb almenys una edició dins d'una caixa geogràfica; no distingeixen robots ni importacions, i les caixes inclouen zones veïnes. "
          "El flux de la Missió 4636 és un esquema amb xifres reals; el gràfic del Tasking Manager és una simulació; el mapa conceptual és un esquema amb anys reals. "
          "Les fonts són sobretot d'autors i institucions de fora d'Haití; la veu haitiana hi és a la novel·la de Roumain i a la xifra oficial de morts del govern d'Haití (citada a través de The Irish Times). El nombre de morts del terratrèmol es desconeix: la forquilla de l'article va de l'estimació d'una enquesta a les llars de Port-au-Prince (158.679) a la xifra oficial del govern haitià (més de 316.000).")

order, uses, cnt = [], {}, [0]
def cite(m):
    keys = [k.strip() for k in m.group(1).split(",")]
    out = []
    for k in keys:
        key, _, j = k.partition("#"); j = int(j or 1)
        assert key in S, key
        assert j <= len(S[key][1]), k
        if key not in order: order.append(key)
        n = order.index(key) + 1
        cnt[0] += 1; cid = f"c{cnt[0]}"
        uses.setdefault(key, []).append(cid)
        out.append(f'<a href="#font-{n}" id="{cid}" data-c="u{n}-{j}">{n}</a>')
    return '<sup class="nr">' + ",".join(out) + "</sup>"
MK = re.compile(r"\[\[([^\]]+)\]\]")
body = MK.sub(cite, body)
gr = []
for i, (t, txt) in enumerate(GRAFICS, 1):
    gr.append(f'    <li id="g-{i}"><b class="gt"><a class="bk" href="#gc-{i}" aria-label="Torna al gràfic">↑</a> {t}</b>{MK.sub(cite, txt)}</li>')
fts = []
for key in order:
    n = order.index(key) + 1; ref, sup = S[key]
    us = "; ".join(f'<span id="u{n}-{j}">{s}</span>' for j, s in enumerate(sup, 1))
    fts.append(f'    <li id="font-{n}"><a class="bk" href="#{uses[key][0]}" aria-label="Torna al text">↑</a> {ref}<span class="us">Hi recolza: {us}.</span></li>')
unused = [k for k in S if k not in order]
if unused: print("Fonts sense cap cita:", unused)

desc = "Quan un terratrèmol va destruir Port-au-Prince el 2010, la ciutat gairebé no sortia als mapes d'internet. En un mes, sis-centes persones la van dibuixar carrer a carrer per ajudar els serveis de rescat."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Qui va dibuixar el mapa d'Haití? · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="Qui va dibuixar el mapa d'Haití?">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="cover.jpg">
<link rel="manifest" href="../../manifest.webmanifest">
<meta name="theme-color" content="#FCFCFA">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Inspired by">
<link rel="icon" sizes="192x192" href="../../assets/icon192.png">
<link rel="apple-touch-icon" sizes="180x180" href="../../assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=STIX+Two+Text:ital,wght@0,400;0,500;1,400&display=swap">
<link rel="stylesheet" href="../../assets/ib.css">
<link rel="stylesheet" href="../../assets/article.css">
<link rel="stylesheet" href="article.css">
</head>
<body class="ib-article">
<header class="ib-bar">
  <a href="../../" aria-label="Inspired by Magazine"><img src="../../assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</header>
<div class="ib-progress" aria-hidden="true"><span id="ibProgress"></span></div>

<main class="page">
'''
fonts = f'''
<section class="col fn" id="fonts">
  <h2>Dades i fonts</h2>
  <h3>Metodologia</h3>
  <p>{METODE}</p>

  <h3>Els gràfics</h3>
  <ul class="gfs">
{chr(10).join(gr)}
  </ul>

  <h3>Fonts</h3>
  <p class="nt-i">Cada número del text porta a la seva font. La fletxa (↑) et torna al punt on llegies.</p>
  <ol class="fts">
{chr(10).join(fts)}
  </ol>
</section>
</main>

<footer class="ib-foot">
  <p class="ib-foot-id"><a href="../../">Inspired by Magazine</a><span>© 2026</span></p>
  <a class="ib-foot-link" href="../../per-penjar/">Articles per penjar</a>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js" integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js" integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67" crossorigin="anonymous"></script>
<script src="../../assets/scrolly.js"></script>
<script src="../../assets/ib-viz.js"></script>
<script src="relleu-haiti.js"></script>
<script src="relleu-pap.js"></script>
<script src="pap-carrers.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
