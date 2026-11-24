#!/usr/bin/env python3
"""Genera web/articles/el-cercle-del-kula/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1).
Abans de tornar-lo a executar, porta aquí els canvis que l'editor hagi fet des del CMS (AGENTS.md)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/el-cercle-del-kula/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("El cercle del kula", "<b>Dades reals i traçat esquemàtic.</b> Relleu MAP-01: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), cel·les de 0,008° (uns 900 m); el mar es deixa en blanc i el rang s'ha retallat a −60 m perquè les illes de corall baixes no es perdin. Posicions de les comunitats d'OpenStreetMap (consulta del 24-11-2026); la de Duau, al sud de Normanby, és orientativa. L'ordre de les comunitats i les branques del camí segueixen el mapa V i els capítols II i III de Malinowski;[[malinowski#12,malinowski#1]] la línia és un traçat esquemàtic, no una ruta de navegació. Les partícules indiquen el sentit, no quantitats. L'onada del 1918 és de Malinowski: 213 parells que To'uluwa porta de Kitava, 304 reunits a Sinaketa i 648 braçalets que la flota de Dobu s'endu de Sinaketa (304) i de Vakuta (344), segons el recompte que ell mateix va fer a la platja; l'àrea dels cercles és proporcional a aquests nombres. En un altre capítol, Malinowski parla d'«uns 800 parells» per a la mateixa expedició, i barreja parells i peces; el gràfic fa servir el recompte detallat.[[malinowski#9]] La llacuna de Sanaroa, on els de Sinaketa bussegen la petxina vermella.[[malinowski#7]]"),
 ("La vida d'un collaret", "<b>Simulació amb regles reals.</b> Un collaret imaginari surt de Dobu i fa la volta en el sentit de les agulles del rellotge passant per les comunitats del gràfic anterior. Cada soci el té entre dues setmanes i dos anys (Malinowski escriu que ningú no el retenia més d'un any o dos) i la volta sencera dura entre dos i deu anys, segons Malinowski.[[malinowski#3]] Els temps de cada parada són aleatoris dins d'aquests marges (llavor fixa) i ajustats perquè la volta duri uns sis anys, amb unes tres setmanes de navegació entre parades; per simplificar, hi ha un sol soci a cada comunitat. No reconstrueix el viatge de cap objecte real."),
 ("Com es fa un regal que s'ha de tornar", "<b>Esquema.</b> Els noms i la funció dels regals (vaga, yotile, basi, kudu, pokala i kaributu) i l'exemple d'un home de Sinaketa amb un soci de Dobu són de Malinowski;[[malinowski#6]] la regla que l'equivalència la decideix qui torna, també.[[malinowski#5]] L'hospitalitat a cada visita i el paper de les dones que l'organitzen, de Kuehling.[[kuehling21#7,kuehling25#1]] Els intervals són orientatius."),
 ("Del regal pur al regateig", "<b>Classificació real; posicions esquemàtiques.</b> Els set tipus d'intercanvi de les Trobriand i els exemples de cadascun són de Malinowski (1922, cap. VI).[[malinowski#10]] La lectura de Sahlins (1965, recollida el 1972) és una franja contínua de la reciprocitat generalitzada a la negativa: el seu tipus ideal de reciprocitat generalitzada és el regal pur de Malinowski, el regateig i el bescanvi són al pol negatiu, i la tornada equivalent (com la del kula) és equilibrada.[[sahlins#2]] Sahlins no classifica un per un els tipus 3 i 5. La classe 1 va marcada amb un traç discontinu: Mauss la va considerar inaplicable i el 1926 Malinowski li va donar la raó.[[mauss#6,malinowski1926]] L'ordre dels tipus és el de Malinowski; la distància entre ells no mesura res."),
 ("On va buscar Mauss el regal", "<b>Dades reals; posicions orientatives.</b> Mapa del món en projecció Equal Earth (sense relleu: és un mapa del món); terra de Natural Earth 1:110 m (world-atlas 2.0.2). Els casos són els de la taula de matèries de l'<i>Assaig sobre el do</i>; el text dels rètols, del mateix assaig.[[mauss#1]] Les societats estudiades per etnògrafs van en vermell; els drets antics, en blau, situats a la regió on es van escriure, sense cap punt precís."),
 ("El hau, segons Tamati Ranapiri", "<b>Esquema segons la lectura de Mauss</b> del text de Tamati Ranapiri (Mauss escriu «Ranaipiri»), recollit per Elsdon Best el 1909.[[mauss#4,sahlins69]] A, B i C són les tres persones del text. Sahlins en proposa una altra lectura: el que torna és el fruit del regal, no el seu esperit.[[sahlins69]]"),
 ("Un segle de kula, i un segle d'explicar-lo", "<b>Dades reals; les dates aproximades porten «(c.)».</b> Treball de camp de Malinowski a les Trobriand (1915–1918) i flota de Dobu del 1918;[[malinowski#9]] represa després de la guerra, Kibu Tokunuwesi (finals dels anys seixanta, es dibuixa el 1968), el mwali Lagim (2016) i l'onada del 2018;[[kuehling21#6,kuehling21#8,kuehling21#9]] el llibre de Malinowski (1922),[[malinowski]] l'assaig de Mauss (1925),[[mauss]] el diari (1967),[[geertz]] Sahlins (1972),[[sahlins]] Weiner (1976) i Kuehling (2025);[[kuehling25#3,kuehling25#1]] la prohibició del potlatch al Canadà (1884–1951) i les confiscacions del 1921.[[umista#1,umista#2]] La crítica de Mauss al regal pur i la rectificació de Malinowski (1926).[[malinowski1926]] La lectura de Sahlins sobre el hau (1969, recollida el 1972).[[sahlins69]] La represa del kula després de la guerra es dibuixa el 1946, sense data exacta a la font."),
]
METODE = ("Aquest article es basa en <b>fonts primàries</b> (el llibre de Malinowski del 1922 i l'assaig de Mauss del 1925, llegits sencers en edicions de domini públic, i la pàgina del centre cultural U'mista, del poble kwakwaka'wakw), en <b>etnografies recents revisades per experts</b> (Kuehling, 2021 i 2025, que recullen la veu de la gent de les illes) i en un clàssic de l'antropologia econòmica (Sahlins, 1972). "
          "Malinowski i Mauss escrivien amb el vocabulari del seu temps («indígenes», «salvatges», «tribus»); l'article no el fa servir i el tradueix. Les xifres del 1918 són les que va anotar Malinowski; les d'avui (més de 2.000 viatgers, més de mil objectes de cada tipus, almenys 10.000 persones) són estimacions de Kuehling. "
          "El mapa del cercle és un traçat esquemàtic sobre posicions reals; la vida d'un collaret és una simulació; el regal entre dos socis, l'espectre dels intercanvis i el hau són esquemes. La pàgina d'U'mista és la veu de la comunitat afectada per la prohibició del potlatch i es cita com a tal. "
          "No s'ha pogut consultar directament el llibre d'Annette Weiner (1976); el que se'n diu ve de Kuehling (2025). Les regles del kula es donen en passat quan venen de Malinowski (1922), perquè descriuen el que ell va veure a les Trobriand fa més d'un segle.")

order, uses, cnt = [], {}, [0]
def cite(m):
    keys = [k.strip() for k in m.group(1).split(",")]
    out, seen = [], set()
    for k in keys:
        key, _, j = k.partition("#"); j = int(j or 1)
        assert key in S, key
        assert j <= len(S[key][1]), k
        if key in seen: continue          # una mateixa font només surt una vegada a cada crida
        seen.add(key)
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
used = set()
for m in MK.finditer(open(os.path.join(HERE, "cos.html")).read() + "".join(t for _, t in GRAFICS)):
    for k in m.group(1).split(","):
        key, _, j = k.strip().partition("#"); used.add((key, int(j or 1)))
for key, (r, sup) in S.items():
    for j in range(1, len(sup) + 1):
        if (key, j) not in used: print("No citat:", key, j)

desc = "A les illes de l'est de Papua Nova Guinea, la gent navega dies per donar collarets i braçalets de petxina que s'han de fer passar. Un segle després, encara discutim per què."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>El cercle del kula · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="El cercle del kula">
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
<script src="relleu-massim.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
