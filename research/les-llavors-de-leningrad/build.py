#!/usr/bin/env python3
"""Genera web/articles/les-llavors-de-leningrad/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/les-llavors-de-leningrad/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Cinc continents a la recerca de llavors", "<b>Dades reals.</b> Llocs i regions de les grans expedicions de Vavílov fora de la Unió Soviètica del 1916 al 1933, segons l'apèndix III de Loskutov (1999, p. 157); no s'hi inclouen les exploracions sistemàtiques dins de l'URSS del 1921 al 1940.[[loskutov1999#3]] Cada punt és un lloc o una regió citats a la llista, situat en coordenades aproximades (geocodificació de Nominatim, © col·laboradors d'OpenStreetMap, revisada a mà); no és l'itinerari ni l'ordre del viatge. Les estades del 1921 i del 1932–1933 al Canadà i als Estats Units eren, segons la mateixa font, visites de coneixement. Mapa: Natural Earth 1:110 m, projecció Equal Earth (sense relleu: mapa del món)."),
 ("On creia Vavílov que van néixer els conreus", "<b>Esquema.</b> Els set centres i els seus focus segons el text de Vavílov del 1940 citat per Loskutov (1999, p. 86–88), i la seva estimació de l'origen de les ~1.000 espècies cultivades (~70 % Àsia, ~17 % Nou Món).[[loskutov1999#4]] Els cercles marquen la regió descrita, no una frontera ni una mesura. És la teoria de Vavílov, no el consens actual.[[harlan,larson]] Mapa: Natural Earth 1:110 m, Equal Earth."),
 ("La col·lecció de Vavílov", "<b>Dades reals.</b> Mostres per grup de conreus a l'època de Vavílov (en milers, tal com les arrodoneix Loskutov: «més de» 36.000 de blat, «unes» 18.000 d'hortalisses, etc.) sobre un total de 250.000.[[loskutov1999#2]] «Altres conreus» és la diferència fins al total i, com que els altres grups són mínims, és un màxim."),
 ("Una ciutat encerclada i un institut ple de llavors", "<b>Dades reals.</b> Llocs del salvament de la col·lecció (Loskutov 1999, p. 113–115).[[loskutov1999#7,loskutov1999#8]] Les distàncies del mapa (uns 27 km del centre a Pavlovsk i uns 24 a Puixkin) són càlculs propis entre coordenades; Loskutov dona 45 km fins a Pavlovsk. La situació del camp de sembra és aproximada. Relleu: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), mitjana per cel·les d'uns 0,6 × 1,1 km; llacs i rius: Natural Earth 1:10 m. Coordenades dels llocs: Nominatim (© col·laboradors d'OpenStreetMap). No s'hi dibuixa la línia del front perquè canviava i no se n'ha verificat una traça."),
 ("Pa de cada dia", "<b>Dades reals.</b> Racions oficials de pa (grams per persona i dia) en cada data d'entrada en vigor, del 18-7-1941 a l'11-2-1942, per a les quatre categories de la cartilla (taula 2 de Vågerö et al. 2013, a partir de Pavlov 1965 i Jones 2008); la ració es manté fins al canvi següent. La taula hi afegeix una pujada el 22-2-1942 que no s'hi dibuixa, perquè altres fonts la daten en un altre moment. Calories de la ració completa del 20-11-1941 (taula 1).[[vagero2013#2]] Les racions no sempre es rebien senceres.[[sparen2004]] «Persones a càrrec» tradueix <i>dependants</i>."),
 ("Quants en van morir?", "<b>Dades reals</b>: tres xifres publicades, totes mínimes i amb criteris diferents. «Més de 30» investigadors perduts la primera tardor del setge per bombes, fam o al front;[[loskutov1999#12]] «més de 20» científics i especialistes morts per salvar la col·lecció;[[loskutov2021,loskutov2025#2]] «almenys 19» botànics morts dins de l'institut amb menjar a l'abast (Parkin 2024).[[childs2025#1]] La llentia s'obre cap amunt perquè cap font no dona un màxim."),
 ("Qui guarda llavors a l'Àrtic", "<b>Dades reals.</b> Els 135 dipositants i les mostres de cadascun segons la llista pública del Seed Portal de NordGen, consultada el 20-11-2026 (1.417.961 mostres).[[seedportal]] Àrea del cercle proporcional a les mostres; disposició per mida (esquemàtica). El país és el del codi de l'institut. «Centres internacionals» són els dotze dipositants que es presenten com a centres internacionals de recerca agrícola (CIMMYT, IRRI, ICRISAT, ICARDA ×2, World Vegetable Center, CIAT, IITA, AfricaRice, CIP, ILRI, ICBA): 773.102 mostres, el 54,5 %. Dipositants indígenes: Parque de la Papa i Nació Cherokee, 759 mostres (0,054 %)."),
 ("Anada i tornada", "<b>Dades reals</b>: 116.484 mostres dipositades (2008–2014), 38.073 retirades el setembre del 2015, més de 20.000 tornades el 2017 i 54.354 retirades el 2017.[[icarda#1,icarda#2]] Amplada de les bandes proporcional a les mostres; eix de temps trencat (2008–2014 comprimit); partícules il·lustratives."),
]
METODE = ("Aquest article es basa sobretot en la història del VIR escrita per un dels seus investigadors, I. G. Loskutov (1999, 2021, 2025), que fa servir els arxius de l'institut i les memòries dels supervivents, i en estudis epidemiològics del setge (Sparén et al. 2004; Vågerö et al. 2013). "
          "Cal llegir-lo amb prudència: el relat del setge es va construir sobretot a partir de fonts commemoratives soviètiques posteriors a la recuperació del nom de Vavílov (el volum col·lectiu de 1969, el llibre de Senin de 1979 i articles de memòria de 1991), i el llibre de Simon Parkin (2024), que coneixem a través de la ressenya de la London Review of Books, recrea diàlegs que el mateix autor demana llegir com a impressionistes. Els fets que només dona Parkin s'atribueixen al text. "
          "El nombre de treballadors del VIR morts durant el setge és incert i les fonts no compten el mateix: es donen les tres xifres principals. Moltes versions populars contenen detalls no verificables; s'han deixat fora. "
          "Les dades de la Volta de Svalbard són de la llista pública de dipositants del Seed Portal de NordGen i de les pàgines oficials de la Volta i d'ICARDA; els percentatges són càlculs propis. El mapa dels centres d'origen és un esquema d'una teoria superada en part; el de les expedicions situa els llocs citats, no els itineraris.")

order, uses, cnt = [], {}, [0]
def cite(m):
    keys = [k.strip() for k in m.group(1).split(",")]
    out = []; seen = set()
    for k in keys:
        key, _, j = k.partition("#"); j = int(j or 1)
        assert key in S, key
        assert j <= len(S[key][1]), k
        if key not in order: order.append(key)
        n = order.index(key) + 1
        if n in seen: continue
        seen.add(n)
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

desc = "Durant el setge de Leningrad, els botànics de l'institut de Vavílov van custodiar la seva gran col·lecció de llavors mentre morien de gana. Què hi ha de cert en la història, i què en queda avui a Svalbard."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Els científics que van morir de gana al costat de les llavors · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="Els científics que van morir de gana al costat de les llavors">
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
  <a href="../../"><img src="../../assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
<script src="../../assets/scrolly.js"></script>
<script src="../../assets/ib-viz.js"></script>
<script src="relleu-leningrad.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
