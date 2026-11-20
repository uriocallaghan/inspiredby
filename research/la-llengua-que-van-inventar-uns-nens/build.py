#!/usr/bin/env python3
"""Genera web/articles/la-llengua-que-van-inventar-uns-nens/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/la-llengua-que-van-inventar-uns-nens/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("De 25 a més de 400", "<b>Dades reals.</b> Matrícula d'alumnes sords a Managua: 25 el 1977, 100 el 1979 i més de 400 el 1983 (Senghas i Coppola, citant la tesi de Polich del 1998); per al 1983 es dibuixen 400 punts.[[sc2001#1]] Una altra font del mateix grup dona uns 50 alumnes al principi i més de 200 el 1981, i situa l'escola d'oficis el 1981 en lloc del 1980.[[sko2004#5]] Fites: ANSNIC (1986), Judy Kegl (1986–1987), lleis 675 (2009) i 763 (2011).[[coppola2020#2,coppola2020#3,ley675,coppola2020#4]] Abans del 1977 ja hi havia hagut escolarització oral per a pocs infants sords.[[polich#1]] Les línies que uneixen punts són un esquema de les converses, no dades."),
 ("On s'aprèn avui la llengua", "<b>Dades reals.</b> Els 24 municipis amb les 25 escoles públiques d'educació especial que llista Coppola (2020): Diriamba en té dues (una a la comunitat de Nuevo Amanecer) i la resta, una; Managua, en vermell, és on va néixer la llengua. S'estima que només hi va un 5 % dels infants sords del país.[[coppola2020#5]] Coordenades dels nuclis urbans a OpenStreetMap (Overpass, consulta del 20-11-2026). Relleu: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), mitjana per cel·les d'uns 2,7 km. Fronteres: Natural Earth 1:110 m; llacs: Natural Earth 1:10 m."),
 ("Els petits van més lluny que els grans", "<b>Dades reals</b> de Senghas i Coppola (2001): 24 signants, 13 de la primera cohort i 11 de la segona, en tres grups d'edat d'entrada de 8 persones. Les mitjanes del text són exactes (1,5, 1,3 i 0,7 modulacions per verb per edat; 0,63 i 0,88 usos de referència compartida per cohort; 194 i 234 morfemes per minut). Els valors de cada grup i cohort s'han llegit de les figures 2, 3b i 4 de l'article i són aproximats (±0,05 o ±10 morfemes). Diferències entre cohorts: referència compartida, significativa abans dels 6,5 anys i entre els 6,5 i els 10; modulacions en total, significativa abans dels 6,5 i marginal entre els 6,5 i els 10; velocitat, significativa només abans dels 6,5 anys; cap diferència després dels 10.[[sc2001#3,sc2001#4]]"),
 ("Rodolar cap avall", "<b>Proporcions reals</b> de Senghas, Kita i Özyürek (2004): proporció mitjana d'expressions amb manera i trajectòria que les fan alhora o en seqüència, per a 10 oients i 10 signants de cada cohort. Les proporcions dels oients surten només dels 5 que van fer alguna expressió amb manera i trajectòria, i les de la primera cohort, de 8 dels 10; en total, 70 expressions de tres escenes (el gat que s'enfila pel canaló per fora i per dins, i el que baixa rodolant), analitzades conjuntament. Una mateixa expressió pot fer servir tots dos recursos, per això les proporcions de cada grup poden sumar més de 100 %.[[sko2004#3,sko2004#7]] El 37 % del pas final correspon a totes les construccions A-B-A, no només a les de manera i trajectòria (15 casos).[[sko2004#4]] Cada punt és un 5 %. L'escena i els traços de les mans són un esquema inspirat en la figura 1 de l'article, no un calc."),
 ("Verbs mentals i creença falsa, 2001–2003", "<b>Dades reals</b> de la taula 1 de Pyers i Senghas (2009): mitjana de verbs mentals en les narracions i encerts en la prova de creença falsa (de 4 el 2001 i de 3 el 2003, convertits a percentatge). Cada pregunta tenia dues cartes per triar, de manera que triant a l'atzar s'encerta el 50 % (línia discontínua). Primera cohort, 8 persones (de 26,8 a 28,7 anys de mitjana); segona, 10 el 2001 i 10 el 2003 (8 de les mateixes i 2 de noves); el 2003 només 7 de la segona cohort van fer la prova de llenguatge. Mostres petites.[[ps2009#1,ps2009#2,ps2009#3]]"),
 ("Quatre llengües de signes nascudes en comunitats concretes", "<b>Dades reals</b> sobre un mapa del món en projecció Equal Earth (Natural Earth 1:110 m), sense relleu perquè és un mapa del món sencer. Nicaragua;[[sko2004#2]] Al-Sayyid;[[sandler2005#1]] Bengkala;[[winata1995,lutz2024]] Martha's Vineyard, que es va deixar de transmetre al segle XX.[[power2024,groce]] La posició és orientativa."),
 ("On va el verb", "<b>Dades reals</b>: les 158 clàusules de vuit signants de la segona generació d'Al-Sayyid que analitzen Sandler et al. (2005), 136 amb el predicat al final i 22 amb un altre ordre.[[sandler2005#2]] Cada quadrat és una clàusula. El verb al final és també l'ordre dels gestos sense parla en persones oients de llengües diferents.[[gm2008]]"),
]
METODE = ("Aquest article es basa sobretot en articles científics revisats per experts sobre la llengua de signes de Nicaragua i altres llengües de signes joves. La majoria s'han llegit en versió completa (versions acceptades o còpies dels autors quan la revista no és d'accés obert); d'alguns només s'ha llegit el resum, i del llibre de Laura Polich, la introducció i la fitxa de l'editorial. "
          "Les xifres dels gràfics són les publicades; quan s'han llegit d'una figura i no del text, es diu. Les mostres dels estudis són petites (de 3 a 40 persones) i les escenes animades (el pati, el gat que rodola) són esquemes. "
          "Les fonts no sempre coincideixen en les dates i la matrícula de les primeres escoles: es donen totes dues. El paper dels infants i el dels adolescents i joves en el naixement de la llengua és objecte de debat, i l'article presenta les dues lectures.")

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

desc = "Entre finals dels setanta i principis dels vuitanta, infants, adolescents i joves sords de Managua van fer néixer una llengua de signes nova a partir dels signes de casa. Què ens explica sobre el llenguatge i sobre ser sord."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>La llengua que va néixer en un pati de Managua · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="La llengua que va néixer en un pati de Managua">
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
<script src="relleu-nicaragua.js"></script>
<script src="llacs.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
