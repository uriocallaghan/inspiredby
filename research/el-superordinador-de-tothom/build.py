#!/usr/bin/env python3
"""Genera web/articles/el-superordinador-de-tothom/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/el-superordinador-de-tothom/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Un milió d'ordinadors contra cent superordinadors", "<b>Dades reals, no del tot comparables.</b> Rendiment Linpack (R<sub>max</sub>) de la llista TOP500 de novembre del 2019, l'última abans del pic: Summit, 148,6 petaflops; sumes pròpies dels 10, 100 i 500 primers: 520, 989 i 1.647 petaflops.[[top500#1]] Folding@home: 1,01 exaflops, l'estimació conservadora de l'equip per a la primavera del 2020, comptant els aparells que van treballar en una finestra de tres dies i en unitats equivalents x86, com diu l'article.[[zim#3,zim#11]] Amb les mateixes hipòtesis en unitats natives en sortirien uns 0,53 exaflops (càlcul propi), a l'altura dels deu primers. El TOP500 mesura una prova estàndard de doble precisió que una feina trossejada com la de Folding@home no pot fer. La comparació amb els cent primers és la del mateix equip.[[zim#4]] Quadrats d'àrea proporcional; reixa d'1 petaflop."),
 ("El viatge d'una unitat de treball", "<b>Esquema animat.</b> Il·lustra el mètode: el problema es divideix en simulacions independents (unitats de treball) que cada ordinador calcula pel seu compte i retorna, i els resultats s'acumulen en un model d'estats de Markov que decideix on calcular després.[[zim#1,zim#6,zim#7]] El nombre de punts (40 i 1.400 en escriptori, 24 i 520 en mòbil), els temps i el mapa són il·lustratius; només la proporció entre el febrer (unes 30.000 màquines) i la primavera del 2020 (més d'un milió) inspira la diferència de ritme.[[zim#2]]"),
 ("Una dècima de segon, sumada pas a pas", "<b>Dades reals.</b> Pas de temps de 4 fs; 40 ns és la durada de cada simulació de l'algorisme adaptatiu que buscava l'obertura de l'espiga, que es va fer al núvol (Microsoft Azure) i no als ordinadors voluntaris;[[zim#5]] conjunts de dades habituals d'«uns quants microsegons» (dibuixat a 3 µs, valor orientatiu), més d'1 ms de simulació per a l'espiga i 0,1 s sumant totes les simulacions.[[zim#7,zim#8]] Escala logarítmica; la mida dels cercles creix amb la posició i no representa cap valor. Les proporcions (per exemple, 25 bilions de passos de 4 fs en 0,1 s) són càlculs propis."),
 ("L'espiga que s'obre", "<b>Esquema, no a escala.</b> Basat en el que van predir les simulacions: l'espiga s'obre molt més que a les imatges de criomicroscòpia electrònica, un sol domini d'unió cada vegada; l'estat tancat és el més probable, i l'obertura deixa a la vista epítops amagats, com el de l'anticòs CR3022.[[zim#9]] Els «braços» són els dominis d'unió al receptor (RBD). Formes, angles i posició de l'anticòs són il·lustratius."),
 ("Els voluntaris contra el número u", "<b>Dades reals, no del tot comparables.</b> Línia blava: rendiment R<sub>max</sub> del número u de cada llista TOP500, del juny del 1997 al novembre del 2026.[[top500#2]] Punts vermells: SETI@home, mitjana del juliol del 2001 al juny del 2002 (27,36 teraflops)[[seti02#2]] i estiu del 2003 (més de 54 teraflops, xifra de les estadístiques del projecte citada per Benkler);[[benkler#2]] Folding@home, 1 petaflop el 16-9-2007;[[gwr]] els projectes de BOINC, 93 petaflops de mitjana cap al 2018;[[anderson#1]] Folding@home, 1,01 exaflops la primavera del 2020, en unitats equivalents x86 (uns 0,53 en natives, càlcul propi).[[zim#3,zim#11]] Línia vermella: potència en «TFLOPS equivalents x86» del web de Folding@home (còpies de l'Internet Archive del maig del 2021 al juliol del 2026 i consulta del 24-11-2026), la mateixa unitat de l'estimació del 2020.[[fahos#2]] S'han tret quatre còpies del 2022 (agost–desembre) idèntiques a la del maig, que semblen d'una API aturada. El web compta els aparells actius en una finestra més llarga, i entre la primavera del 2020 i el maig del 2021 no hi ha còpies útils (línia discontínua). El TOP500 mesura una prova estàndard i les xarxes voluntàries s'estimen comptant aparells: és una comparació d'ordre de magnitud."),
 ("Qui donava el 2002", "<b>Dades reals d'una enquesta voluntària.</b> SETI@home, juliol del 2002: participants de 226 països, «aproximadament la meitat» als Estats Units (dibuixat com a 50 %); el 93 % de les 95.000 persones que van respondre l'enquesta del web eren homes.[[seti02#3]] La mostra de l'enquesta no és aleatòria."),
 ("Una agulla en un paller de 2.000 milions", "<b>Dades reals i càlcul propi.</b> Més de 2.000 milions d'ordinadors de taula i portàtils al món (es dibuixen 2.000 milions);[[anderson#2]] Folding@home: unes 30.000 màquines actives el febrer del 2020 i més d'un milió la primavera (es dibuixa un milió);[[zim#2]] els projectes de BOINC, uns 700.000 aparells cap al 2018;[[anderson#1]] Folding@home, novembre del 2026: 5.788 targetes gràfiques i 10.991 processadors actius, comptats com a aparells separats (un mateix ordinador en pot tenir de tots dos).[[fahos#1]] Cada punt, 10.000 ordinadors en escriptori i 20.000 en mòbil; els punts vermells s'arrodoneixen i en surt sempre almenys un. La posició dels punts vermells és a l'atzar."),
]
METODE = ("Aquest article es basa sobretot en <b>articles revisats per experts</b> de l'equip de Folding@home (Zimmerman et al. 2021; Voelz et al. 2023), del COVID Moonshot (Boby et al. 2023) i de SETI@home i BOINC (Anderson et al. 2002, 2020 i 2025), en les <b>llistes oficials del TOP500</b> i en <b>dades obertes</b> de les estadístiques de Folding@home, recuperades de l'Internet Archive. "
          "Les xifres de potència de Folding@home són estimacions de l'equip a partir del nombre i el tipus d'aparells, en unitats equivalents x86, no una mesura estàndard com la del TOP500. L'article dona l'estimació conservadora publicada (1,01 exaflops), no les xifres més altes que van circular aquells dies, i no diu que Folding@home superés els 500 superordinadors junts. En unitats natives, la mateixa estimació seria d'uns 0,53 exaflops. "
          "Les explicacions sobre per què la gent dona (Benkler, Mauss, Andreoni) són marcs teòrics; les dades de motivació concretes vénen de les observacions dels mateixos equips i d'una enquesta voluntària de SETI@home del 2002. "
          "El flux de les unitats de treball i l'espiga són esquemes; la resta de gràfics són dades reals o càlculs propis a partir de dades reals.")

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

desc = "La primavera del 2020, més d'un milió d'ordinadors van calcular junts per estudiar el coronavirus i van formar la xarxa de càlcul més gran que s'havia muntat mai. Per què tanta gent regala la força de la seva màquina?"
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>El superordinador que no existia · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="El superordinador que no existia">
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
