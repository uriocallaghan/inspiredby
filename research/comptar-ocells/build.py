#!/usr/bin/env python3
"""Genera web/articles/comptar-ocells/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/comptar-ocells/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Els cercles del recompte de Nadal", "<b>Dades reals.</b> Centre dels 3.138 cercles inscrits a la temporada 126 (2025–26) a la capa pública d'Audubon (només codi, nom i coordenades);[[arcgis]] cada cercle es dibuixa amb el seu diàmetre real de 24,1 km.[[dunn#1]] Al mapa hi ha cercles inscrits que aquell any no van fer el recompte: se'n van completar 2.701.[[s126]] Projecció Equal Earth; terra de Natural Earth 1:110 m.[[ne]] Sense relleu, perquè és un continent sencer. Queden fora del marc els cercles de Guam, de les illes Marianes del Nord i de Shemya, a les Aleutianes (sis en total)."),
 ("Tres maneres de comptar, a la mateixa escala", "<b>Esquema a escala</b> amb les mides dels protocols: cercle de 24,1 km de diàmetre del recompte de Nadal;[[dunn#1]] ruta d'uns 39,2 km del Breeding Bird Survey, amb 50 parades cada 800 m i un radi d'observació de 400 m;[[bbs]] itinerari de 3 km del SOCC en sis trams de 500 m.[[socc#2]] La forma de la ruta i de l'itinerari és il·lustrativa: les rutes reals segueixen carreteres i camins."),
 ("Cada any, més observacions", "<b>Dades reals.</b> Registres d'eBird per any d'observació (2002–2025) a l'eBird Observation Dataset publicat a GBIF, segons la faceta per any de l'API de GBIF consultada el 24-11-2026.[[gbifeod#1]] Un registre és una espècie en una llista. Cada registre va a l'any de l'observació, no al de l'entrada: el conjunt inclou observacions anteriors a eBird que s'hi han entrat després (n'hi ha, per exemple, 2,8 milions del 1996), i per això el 2002 ja en té 4,7 milions. GBIF no inclou les espècies sensibles i rep les dades amb un cert retard, per això el total és inferior al que dona el Cornell Lab (més de 2.000 milions d'observacions el 2025).[[cornell]]"),
 ("On és l'oreneta vulgar cada mes", "<b>Dades reals, càlcul propi.</b> Per a cada mes (de tots els anys junts) i cada cel·la geohash de tres caràcters (1,4° × 1,4°), registres d'oreneta vulgar (<i>Hirundo rustica</i>) dividits pels registres de totes les espècies a la mateixa cel·la i el mateix mes, a l'eBird Observation Dataset de GBIF (API de mapes v2, consultada el 24-11-2026).[[gbifeod#2]] Només es dibuixen les cel·les amb 100 registres o més aquell mes. És una proporció de registres, no de llistes ni d'ocells: depèn també de quantes espècies hi ha a cada lloc. Projecció Equal Earth sense relleu (continent sencer); terra de Natural Earth.[[ne]]"),
 ("La cursa cap al nord", "<b>Dades reals sobre un esquema.</b> Desplaçaments equivalents cap al nord entre el 1990 i el 2008 calculats amb 9.490 comunitats d'ocells i 2.130 de papallones d'Europa: temperatura, 249 km; papallones, 114 km; ocells, 37 km.[[devictor]] Les fletxes surten d'un punt arbitrari al centre d'Europa i només en mostren la llargada, a l'escala del mapa (projecció cònica conforme). Terra de Natural Earth.[[ne]]"),
 ("Qui ha perdut ocells i qui n'ha guanyat", "<b>Dades reals.</b> Canvi net en milions d'ocells reproductors entre el 1970 i el 2017 per bioma de cria, amb l'interval de credibilitat del 95 % i el canvi en percentatge (taula 1 de Rosenberg et al. 2019).[[rosenberg#1]] Noms dels biomes traduïts: «Forest Generalist» és «Generalistes de bosc» i «Habitat Generalist», «Generalistes d'hàbitat». Una espècie compta en un sol bioma."),
 ("Els itineraris del SOCC", "<b>Dades reals.</b> Els 644 itineraris dissenyats del SOCC, amb la traça simplificada a 8 punts i si tenen col·laborador actiu (436) o no (208), segons la llista pública del web del SOCC consultada el 24-11-2026.[[soccapi]] Relleu: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), mitjana per cel·les d'uns 1,2 km.[[mapzen]] El mapa inclou terres d'Aragó, d'Andorra i de la Catalunya del Nord, sense itineraris."),
 ("Com estan els ocells de cada hàbitat a Catalunya", "<b>Dades reals.</b> Indicadors multiespècie del SOCC per a cinc grups d'hàbitat, 2002–2024, amb l'interval de confiança del 95 % (2002 = 100); calculats per l'ICO seguint Soldaat et al. (2016).[[soccind]] El verd marca l'únic indicador d'ocells de bosc; el vermell, el que més baixa. El percentatge de cada gràfic és l'índex del 2024 menys 100; el web del SOCC dona el canvi de la tendència de tota la sèrie (per exemple, −42,4 % per als secans i −16,1 % per a les zones humides), que pot diferir en un punt."),
]
METODE = ("Aquest article combina <b>dades reals descarregades per a l'article</b> (els cercles del recompte de Nadal d'Audubon, els registres d'eBird publicats a GBIF, i els itineraris i indicadors del SOCC), <b>articles revisats per experts</b> i <b>informes i pàgines oficials</b> dels programes. "
          "Les xifres de participació del recompte de Nadal surten dels resums anuals d'Audubon; no hi ha una sèrie oberta de participants per a cada any, i per això el text només dona els anys documentats. "
          "El mapa de l'oreneta és un càlcul propi: una proporció de registres que corregeix, en part, que hi hagi més o menys gent observant a cada lloc. "
          "Les distàncies del desplaçament cap al nord són les que publiquen els estudis; la fletxa de la cursa és un esquema. Les diferències entre fonts (per exemple, 89 o «unes 90» espècies el primer recompte) es resolen a favor de la font més específica. Les dades d'eBird tenen biaixos coneguts (més observadors en uns llocs que en uns altres, esforç variable, llistes incompletes); el mapa de l'oreneta només en corregeix una part.")
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
used=set()
for m in MK.finditer(open(os.path.join(HERE,"cos.html")).read()+"".join(t for _,t in GRAFICS)):
    for k in m.group(1).split(","):
        key,_,j=k.strip().partition("#"); used.add((key,int(j or 1)))
for key,(r,sup) in S.items():
    for j in range(1,len(sup)+1):
        if (key,j) not in used: print("No citat:",key,j)

desc = "Des del 1900, cada Nadal milers de persones surten a comptar ocells. Un segle de llibretes de voluntaris s'ha convertit en una de les millors maneres de veure com canvia el món."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Comptar ocells · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="Comptar ocells">
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

<footer class="ib-foot"></footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js" integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js" integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67" crossorigin="anonymous"></script>
<script src="../../assets/scrolly.js"></script>
<script src="../../assets/ib-viz.js"></script>
<script src="relleu-cat.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
