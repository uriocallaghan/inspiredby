#!/usr/bin/env python3
"""Genera web/articles/el-forat-de-l-ozo/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/el-forat-de-l-ozo/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Tres mil·límetres", "<b>Dades reals.</b> Gruix d'una capa d'ozó pur a 0 °C i 1 atmosfera: 1 unitat Dobson (DU) = 0,01 mm.[[nasadu]] La tercera barra és el «mínim» anual de la NASA: la mitjana dels valors mínims diaris entre el 21 de setembre i el 16 d'octubre, no el valor més baix mai mesurat; per exemple, el 2006 dona 98 DU, mentre que els globus de la NOAA van mesurar 92 DU sobre el pol Sud.[[nasaannual]][[nasa2026#2]] El valor més baix de la sèrie és el del 1994 (92,3 DU). Les barres es dibuixen aproximadament 20 vegades més grans que la mida real (14 vegades al mòbil), amb el regle a la mateixa escala."),
 ("Com el clor es menja l'ozó", "<b>Esquema</b>, no a escala. Altura del màxim d'ozó (uns 32 km),[[nasaozone#1]] cicle catalític del clor[[molina]][[epa]] i paper dels núvols estratosfèrics polars entre 10 i 20 km.[[solomon86#2]] Les partícules són il·lustratives."),
 ("Quaranta-set primaveres sobre l'Antàrtida", "<b>Dades reals.</b> Mitjana d'octubre de l'ozó total de la reanàlisi multisensor MSR-2 del KNMI (TEMIS), que combina els satèl·lits TOMS, SBUV, GOME, SCIAMACHY, OMI i GOME-2, a 0,5°; aquí s'ha fet la mitjana per cel·les d'1,5° de latitud per 3° de longitud al sud de 36° S.[[msr2]] La línia vermella és la isolínia de 220 DU, el llindar de la NASA.[[nasahole]] Les àrees citades als passos són les de la NASA (mitjana del 7 de setembre al 13 d'octubre), que és una altra manera de mesurar el forat.[[nasaannual]] Costes: Natural Earth 1:110 m. Projecció ortogràfica centrada al pol Sud (sense relleu: és un mapa d'un hemisferi)."),
 ("198 parts", "<b>Dades reals.</b> Data de ratificació, acceptació, aprovació, adhesió o successió de cada part, segons la Col·lecció de Tractats de l'ONU (consultada el 20-11-2026).[[untreaty#2]] Per a les successions (per exemple, estats sorgits de Iugoslàvia o de Txecoslovàquia), la data és la de la notificació. Noms en català. El mapa (Natural Earth 1:110 m, projecció Equal Earth) no mostra els estats més petits ni la Unió Europea; la cronologia els inclou tots."),
 ("El que diu l'aire", "<b>Dades reals.</b> Mitjana anual de les mitjanes mensuals globals de CFC-11 i CFC-12 del programa HATS de la NOAA (anys amb almenys 10 mesos; 1978–2025).[[hats]] Anotacions: final de la producció mundial de CFC el 2010[[montzka18]] i alentiment del 2013–2018.[[montzka18]][[montzka21]] La barra és l'índex de gasos que destrueixen l'ozó per a l'Antàrtida (ODGI-A) de la NOAA: 100 al màxim i 0 al nivell del 1980, que la NOAA situa cap al 2070; el valor de 71,6 correspon a principis del 2024.[[odgi]]"),
 ("El món que vam evitar", "<b>Dades reals i simulació.</b> Línia blava: ozó total mitjà anual entre 60° S i 60° N, en % respecte de la mitjana del 1979–1981, calculat per a aquest article amb les 564 mitjanes mensuals de la reanàlisi MSR-2 del KNMI (ponderades per l'àrea).[[msr2]] L'avaluació de 2022, amb una altra referència (1964–1980) i altres dades, dona un 2 % per sota el 2017–2020[[wmoes#3]] i el retorn al valor del 1980 cap al 2040 per a aquesta franja de latituds (cercle buit).[[wmoes#1]] El mínim del 1993 coincideix amb els anys posteriors a l'erupció del Pinatubo.[[twentyq#2]] Punts vermells: resultats de la simulació «sense Protocol» de Newman et al. (2009), que es refereixen a l'ozó mitjà de tot el planeta: −17 % el 2020 i −67 % el 2065 respecte del 1980; la línia discontínua només els uneix.[[newman]] Les dates de retorn per a l'Àrtic (cap al 2045) i l'Antàrtida (cap al 2066) no són mitjanes globals i no es dibuixen."),
 ("Cada octubre, un mapa", "<b>Dades reals.</b> El mapa és el mateix del gràfic 3 (MSR-2, mitjana d'octubre).[[msr2]] La sèrie és la de la NASA Ozone Watch: àrea mitjana del forat del 7 de setembre al 13 d'octubre (barres) i ozó mínim del 21 de setembre al 16 d'octubre (línia), a partir dels satèl·lits TOMS, OMI i OMPS; el 1995 no hi ha dades.[[nasaannual]] La barra discontínua del 2026 és l'estimació arrodonida que va publicar la NASA el novembre del 2026.[[nasa2026#1]]"),
]
METODE = ("Aquest article combina <b>dades reals</b> de la NASA (mida i profunditat del forat, 1979–2025), del KNMI neerlandès (camp d'ozó de cada octubre, 1979–2025), de la NOAA (CFC a l'aire, 1977–2026) i de la Col·lecció de Tractats de l'ONU (198 parts del Protocol), amb xifres d'articles revisats per experts i de les avaluacions científiques del Protocol. "
          "Les dues maneres de mesurar el forat (l'àrea mitjana de la NASA i el mapa de la mitjana mensual) no donen exactament els mateixos números. "
          "El tall de l'atmosfera és un esquema; en el gràfic del «món evitat», la línia blava és un càlcul propi amb dades reals i els punts vermells són resultats d'una simulació publicada. "
          "Les sèries de CFC són mitjanes anuals del 1978 al 2025. Les dades de la NASA Ozone Watch s'han consultat a través de l'Internet Archive perquè el servidor original no responia el 20-11-2026.")
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

desc = "Una capa de tres mil·límetres, un forat que ningú no veu i 198 parts que es van posar d'acord. Com vam començar a reparar l'ozó, per què encara cal paciència i què queda per fer."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Com vam començar a tancar el forat de l'ozó · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="Com vam començar a tancar el forat de l'ozó">
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
<script src="ozo-octubre.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
