#!/usr/bin/env python3
"""Genera web/articles/navegar-sense-mapa/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/navegar-sense-mapa/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Com es va poblar el triangle polinesi", "<b>Dades reals.</b> Mapa d'oceà en projecció Natural Earth centrada a 165° O (sense relleu: és un oceà); terra de Natural Earth 1:50 m (world-atlas 2.0.2). Cercles plens: dates de radiocarboni o urani-tori. Tonga, 2838 ± 8 anys abans del 1950, és a dir, cap al 888 aC;[[burley]] Societat 1025–1120 (primera fase) i, a la segona fase, Hawaiʻi 1219–1266, Marqueses 1200–1277, Rapa Nui 1200–1253, Aotearoa 1230–1282 i Mangareva 1108–1275 (rang ample), segons la cronologia curta de Wilmshurst et al.[[wilmshurst#2]] Altres estudis proposen arribades més antigues a les illes Cook i a Hawaiʻi.[[sear,athens]] Cercles buits: illes sense data pròpia en aquestes fonts, situades en l'ordre del model genòmic (Samoa, Rarotonga, Tuamotu i Australs occidentals al segle XII, Raivavae).[[ioannidis21]] Contacte amerindi: cap al 1200 (2020) o 1250–1430 (genomes antics de Rapa Nui, 2024).[[ioannidis20,moreno]] Les distàncies del triangle són de cercle màxim, calculades per a l'article entre Oʻahu, l'illa del Nord d'Aotearoa i Rapa Nui (coordenades d'OpenStreetMap). Els arcs del camí genòmic indiquen l'ordre, no la ruta exacta."),
 ("De Maui a Tahití sense instruments", "<b>Dades reals, traça aproximada.</b> Ruta d'anada digitalitzada punt a punt del mapa del viatge de 1976 publicat per la Polynesian Voyaging Society (reixa de 10° × 10°, precisió d'uns 0,3°), amb l'inici a la badia de Honolua i el final a Papeʻete (OpenStreetMap). La PVS no diu d'on surt la traça; el vaixell d'escorta Meotai anotava la posició real.[[thompson2019]] Només tres dates són conegudes: l'1 de maig, l'1 de juny (Mataiva) i el 4 de juny (Tahití);[[finney1992#2]] l'animació avança a velocitat constant. La distància en línia recta (uns 4.350 km) i la de la traça (uns 4.800 km) són càlculs propis; la PVS en dona unes 2.300 milles.[[pvs2007#1]]"),
 ("Una muralla d'illes enmig del mar", "<b>Posicions reals i un model.</b> 138 atols i illes de la Polinèsia Francesa i voltants (OpenStreetMap, consulta Overpass del 20-11-2026, etiquetes <code>natural=atoll</code> i <code>place=island</code> amb nom). Al voltant de cadascun es dibuixen els abasts orientatius que dona la Polynesian Voyaging Society: atol visible a 7–10 milles (es dibuixa a 8), noio unes 40 i manu-o-Kū unes 120;[[pvsland#2,pvsland#3]] es prenen com a milles nàutiques (1.852 m). És un càlcul propi: s'apliquen els mateixos radis a totes les illes, també a les altes (que es veuen de més lluny), i en la realitat depenen del temps, de l'alçada de l'observador i, en el cas dels ocells, de la cria."),
 ("Per on surten les estrelles", "<b>Dades reals i càlcul.</b> Les 32 cases i els noms hawaians de la brúixola que va dissenyar Nainoa Thompson a finals dels anys setanta, inspirada en la de Mau;[[pvscourse#1,pvscourse#2]] la brúixola carolina de Mau s'organitza al voltant d'Altair i reparteix les posicions a parts iguals.[[holton]] Declinacions J2000 de XHIP, la compilació ampliada del catàleg Hipparcos.[[hipparcos]] L'azimut de sortida es calcula amb cos A = sin δ / cos φ (δ, declinació; φ, latitud), sense refracció; la posta és simètrica. La precessió des del 1976 mou les declinacions menys d'un terç de grau. Les estrelles que no surten ni es ponen a la latitud triada no es dibuixen."),
 ("Què sent un navegant", "<b>Simulació (esquema, no a escala).</b> Crestes d'onada sinusoidals que avancen lentament; la interferència de dues onades i els moviments de la canoa (capcineig, balanç i tirabuixó) segons la guia de la PVS;[[pvscourse#4]] la reflexió aigües amunt i el creuament de trens d'onades a sotavent d'una illa segons Genz et al. (2009), amb les distàncies anotades.[[genz#1]] Les formes de les ones no són un model físic."),
 ("Dues maneres de veure el mateix viatge", "<b>Esquema.</b> Un viatge imaginari entre dues illes amb una illa de referència a un costat i vuit punts d'estrella, seguint la descripció de l'etak de Gladwin (1970) tal com la cita Riesenberg (1975)[[riesenberg#1]] i la interpretació d'Edwin Hutchins.[[hutchins]] No representa cap ruta real."),
 ("Llegir el mapa de Tupaia", "<b>Dades reals, interpretació discutida.</b> Rumbs de les Marqueses a Oʻahu mesurats per Eckstein i Schwarz sobre la còpia de Georg Forster del primer esbós (335°) i la còpia de Banks de la versió final (338°), i el rumb real en un mapa Mercator (330°).[[eckstein#2]] L'esquema de l'esquerra il·lustra la seva lectura amb <i>avatea</i> i no reprodueix el mapa. Di Piazza i Pearthree en discuteixen la base;[[dipiazza]] els autors hi van respondre i van publicar correccions.[[ecksteinresp]]"),
 ("Dos-cents cinquanta anys de debat i renaixement", "<b>Dades reals.</b> 1769–1770, mapa de Tupaia;[[eckstein#1]] 1947, Kon-Tiki;[[finney1975#3]] 1956, Sharp;[[sharp1956]] 1973, simulació de Levison, Ward i Webb;[[finney1975#2]] 1975, avarada de Hōkūleʻa;[[pbs2017#2]] 1976, Tahití;[[finney1992#2]] 1978, Eddie ʻAikau; 1979, Mau comença a ensenyar Nainoa; 1980, Nainoa navega a Tahití;[[nainoa1980#1,nainoa1980#2,nainoa1980#5]] 2007, <i>pwo</i> a Satawal;[[pvs2007#3]] 2010, mort de Mau;[[pvsmau#2]] 2014–2017, Mālama Honua;[[pbs2017#1]] 2020–2021, genòmica;[[ioannidis20,ioannidis21]] 2022, Lehua Kamalu;[[natgeo2022]] 2026, primer <i>pwo</i> a Hawaiʻi.[[hnn2026]]"),
]
METODE = ("Aquest article combina <b>fonts primàries</b> (els relats i les guies de la Polynesian Voyaging Society, escrits pels mateixos navegants i investigadors del projecte), <b>articles revisats per experts</b> sobre la cronologia del poblament, la genòmica i la navegació, i <b>dades obertes</b> (catàleg Hipparcos, OpenStreetMap, Natural Earth). "
          "Els relats de la PVS són testimonis de part i es citen com a tals; quan les xifres de la PVS i d'altres fonts no coincideixen (per exemple, la distància del viatge, entre 2.300 i 2.500 milles segons la pàgina), l'article dona la distància en línia recta calculada. "
          "La cronologia del poblament i el contacte amb Amèrica encara es discuteixen i l'article ho diu. La brúixola estel·lar és un càlcul astronòmic exacte per a cada latitud; la ruta de 1976 és una traça digitalitzada; el gràfic de les onades i el de l'etak són esquemes.")
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

desc = "El 1976, una canoa hawaiana va arribar a Tahití sense instruments, guiada per un navegant d'una illa de 600 habitants. Com es troba una illa llegint estrelles, onades i ocells."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Navegar sense mapa · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="Navegar sense mapa">
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

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js" integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js" integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67" crossorigin="anonymous"></script>
<script src="../../assets/scrolly.js"></script>
<script src="../../assets/ib-viz.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
