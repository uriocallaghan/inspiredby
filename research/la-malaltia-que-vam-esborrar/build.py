#!/usr/bin/env python3
"""Genera web/articles/la-malaltia-que-vam-esborrar/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/la-malaltia-que-vam-esborrar/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Mil anys abans de la vacuna", "<b>Llocs i dates documentats; rutes esquemàtiques.</b> Variolació a la Xina segons la tradició (muntanya Emei; primeres descripcions escrites cap al 1500), a l'Índia (Bengala), a l'Àfrica i a Constantinoble; Boston i Londres el 1721; Berkeley el 1796.[[fen-hist#1,boylston#2]] El punt d'Onesimus se situa al sud de l'actual Líbia, segons Boylston, però el seu origen es discuteix (altres autors el fan de l'Àfrica occidental).[[boylston#1,pbs#1]] Ruta de l'expedició Balmis: la Corunya, Canàries, Caracas, Mèxic, Manila i Macau.[[fen-hist#7,tuells#1,tuells23#1,csic#1]] Els arcs segueixen el cercle màxim entre parades i no reprodueixen la derrota real dels vaixells. Mapa: Natural Earth (world-atlas 1:110 m), projecció Equal Earth."),
 ("El riu dels casos notificats", "<b>Dades reals.</b> Casos de verola notificats a l'OMS per país i any, 1967–1977 (OMS, 1988, recopilat per Our World in Data).[[owid#1]] Capes: Índia, Bangladesh, Pakistan, Indonèsia, Brasil, Etiòpia, Somàlia i la resta del món (total mundial menys aquests set). La sèrie no té dada de Bangladesh (aleshores Pakistan Oriental) per al 1970: no és un zero. Fenner hi documenta almenys 1.403 casos detectats entre gener i maig d'aquell any, que no hi són sumats.[[fen-sud#3]] La cronologia de Fenner et al. dona totals mundials diferents per a alguns anys, fins a un 20 % més alts (1969: 54.199 en lloc de 45.291).[[fen-cron#2]] Les cerques poble per poble a l'Índia van començar a la tardor del 1973.[[fen-cron#6]] L'opció «casos reals» afegeix l'estimació de 10–15 milions de casos el 1967.[[fen-epi#2]]"),
 ("Vacunar-ho tot o vacunar en anell?", "<b>Simulació d'una sola tirada, amb una llavor aleatòria fixa.</b> Una quadrícula hexagonal de pobles. Cada poble malalt pot contagiar cada dia els pobles no vacunats a dues caselles o menys (probabilitat 0,05 per poble i dia, durant 14 dies) i, amb una probabilitat de 0,02 al dia, un poble qualsevol de la quadrícula (un viatge). Totes dues estratègies parteixen d'un 40 % de pobles vacunats i dels mateixos tres brots. Vacunació massiva: es vacuna a l'atzar fins a la cobertura triada. Vigilància i contenció: cada cas es detecta sempre al cinquè dia, el seu contagi es redueix al 15 % (aïllament) i es vacunen els pobles a dues caselles. A la realitat, trobar els casos era la part difícil, i les dues estratègies es combinaven.[[fen-prog#3,fen-prog#4,fen-prog#11]] Els valors són inventats per il·lustrar el mecanisme."),
 ("El cercle es va estrènyer", "<b>Dades reals.</b> Països amb verola endèmica a l'inici del 1967, 1972, 1973, 1975 i 1976 i el 1977, segons la cronologia de Fenner et al.[[fen-cron#1,fen-cron#2,fen-cron#3,fen-cron#4]] Etiòpia inclou l'actual Eritrea, i el Sudan, l'actual Sudan del Sud. Últim cas del Pakistan, 16 d'octubre de 1974.[[fen-som#8]] Últim cas natural de verola major: Rahima Banu, illa de Bhola.[[fen-sud#2]] Mapa: Natural Earth (world-atlas 1:110 m), projecció Equal Earth."),
 ("Els últims metres", "<b>Dades reals.</b> Relleu: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), mitjana per cel·les d'uns 2,8 km. Rius Jubba i Shabeelle: Natural Earth 1:10 m. Casos, brots, grup nòmada (46 persones segons la llegenda del mapa de l'informe i 44 segons el text; dibuixat com a escala, no localitzat), cercle de 90 km al voltant de Merca i vacunacions a Merca (àrea proporcional; el cercle puntejat és la població de 30.000 habitants).[[fen-som#1,fen-som#2,fen-som#3,fen-som#4]] El 1977 es van notificar 3.234 casos al món: 3.229 a Somàlia i 5 a Kenya.[[owid#1]] Certificació de l'Àfrica.[[fen-cert#2]]"),
]
METODE = ("La font principal és la història oficial de l'eradicació publicada per l'OMS (Fenner et al., 1988), llegida sencera; les pàgines citades són les impreses. "
          "Els casos per país són les notificacions a l'OMS, que abans del programa eren només l'1–2 % dels casos reals. "
          "Els mapes de països endèmics segueixen la cronologia anual del llibre. El gràfic de vacunació en anell és una simulació d'una sola tirada i ho diu al peu. "
          "El nom d'Ali Maow Maalin s'escriu de maneres diferents segons la font (Maalin a l'OMS, Mo'allim al <i>Boston Globe</i>, Moallim a la BBC); l'article fa servir la de l'OMS. Les seves paraules vénen de les entrevistes del <i>Boston Globe</i> (2006) i de la BBC (2008), traduïdes de l'anglès, i el <i>Globe</i> data la seva malaltia el 1979, un error. Quan les fonts no coincideixen, ho diem aquí i no al text: els totals mundials de casos (la cronologia de Fenner dona fins a un 20 % més de casos que la sèrie de l'OMS de 1988), el nombre de nens de l'expedició Balmis (20 segons Fenner, 22 segons la Gazeta de Madrid del 1806), l'origen d'Onesimus (sud de l'actual Líbia o Àfrica occidental), la mida del grup nòmada de Somàlia (44 o 46) i la composició de la Comissió Global (22 científics de 20 països segons Fenner; altres materials de l'OMS parlen de 19 nacions).")

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

desc = "Deu anys van separar 10–15 milions de malalts l'any de l'últim cas natural de verola. Com es fa desaparèixer una malaltia? Un saber de la Xina, l'Índia i l'Àfrica i milers de vacunadors."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>La malaltia que vam esborrar · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="La malaltia que vam esborrar">
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
<script src="relleu-somalia.js"></script>
<script src="rius-somalia.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
