#!/usr/bin/env python3
"""Genera web/articles/el-mapa-del-colera/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/el-mapa-del-colera/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("La dada que va enganyar Farr", "<b>Dades reals.</b> Morts de còlera per 10.000 habitants als districtes de Londres el 1848–1849, agrupats per altura sobre la marea alta del Tàmesi (menys de 20 peus, 20–40, 40–60, 60–80, 80–100, un districte a 100 i Hampstead, a uns 350) i, a la segona vista, per l'origen de l'aigua (grups de Farr: Tàmesi per sobre de Battersea, New River i Lea, Tàmesi entre Battersea i Waterloo).[[farr#1,farr#2]] Àrea dels cercles proporcional a la taxa. El perfil del terreny és un esquema, no a escala."),
 ("El mapa de Snow, redibuixat", "<b>Dades reals.</b> Les 578 morts, les 13 bombes i els 528 trams de carrer del mapa de Snow, segons la digitalització de R. Dodson i W. Tobler (1992–1994) publicada al paquet R <i>HistData</i> (conjunt <code>Snow.deaths</code>; hi ha una versió corregida, <code>Snow.deaths2</code>, que no fem servir).[[histdata#1]] Les morts d'una mateixa casa estan apilades com al mapa original. La documentació del paquet diu que la unitat és de 100 m, però l'ajust amb les 8 bombes georeferenciades per R. Wilson dona 54,6 m per unitat, amb un error inferior a 7 m per bomba, i és l'escala que fem servir.[[wilson]] Distància a peu: càlcul propi pel camí més curt sobre la xarxa de carrers del mapa (trams units pels extrems, tolerància de 3 m); és una aproximació del que Snow va mesurar a mà.[[cic#1]] Les 503 morts a menys de 192 m de la bomba (en línia recta) i les 373 més properes a peu a la bomba de Broad Street són recomptes propis. El cercle de 210 iardes de Whitehead es dibuixa centrat a la bomba, a tocar de la cruïlla de Cambridge Street.[[cic#2]]"),
 ("Els que no en bevien", "<b>Dades reals</b> de Snow:[[snow1855#5]] taller de càpsules fulminants del 37 de Broad Street («uns dos-cents» treballadors, 18 morts a casa seva); workhouse de Poland Street (535 interns, 5 morts; «més de cent» si la mortalitat hagués estat la dels carrers del voltant, estimació del mateix Snow); cerveseria (més de 70 treballadors, cap cas greu). Per a la cerveseria no hi ha xifra alternativa."),
 ("L'epidèmia ja baixava", "<b>Dades reals.</b> Taula de Snow:[[snow1855#7]] atacs mortals (dia en què va començar la malaltia de qui després va morir, calculat restant la durada de la malaltia) i morts per dia, del 19 d'agost al 30 de setembre de 1854. 45 atacs de data desconeguda no hi surten (616 en total). El 8 de setembre es va treure la maneta.[[snow1855#3]]"),
 ("El gran experiment", "<b>Dades reals.</b> Preses d'aigua segons Snow;[[snow1855#9]] coordenades actuals de Thames Ditton i Hungerford (OpenStreetMap/Nominatim); la presa de Battersea Fields se situa a «mitja milla per sobre del pont de Vauxhall», com la descriu Snow (posició aproximada). Relleu: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), cel·les d'uns 250 m. Riu: eix del Tàmesi d'OpenStreetMap (© OpenStreetMap contributors, ODbL), simplificat a uns 30 m. Taula IX de Snow:[[snow1855#11]] morts per 10.000 cases en les set primeres setmanes de l'epidèmia de 1854 (Southwark &amp; Vauxhall: 1.263 en 40.046 cases; Lambeth: 98 en 26.107; resta de Londres: 1.422 en 256.423). Als quadres, la posició de cada mort és aleatòria; el nombre és el real. La proporció de cases de cada companyia al carrer il·lustratiu és la del total de cases (40.046 a 26.107). Les taxes són les que va imprimir Snow: amb les seves xifres, la de la resta de Londres surt 55,5 (ell en va imprimir 59). Part de les dades de les últimes setmanes les va calcular Snow per proporció.[[snow1855#12]] El punt de Thames Ditton és aproximat."),
 ("Al pas de la gent", "<b>Esquema.</b> Llocs que Snow cita com a destinacions del còlera en els set anys posteriors al 1817, des del delta del Ganges.[[snow1855#12]] Els punts són orientatius (capitals o illes actuals) i els arcs no són rutes històriques. Mapa: Natural Earth 1:110 M, projecció Equal Earth."),
 ("On és el còlera", "<b>Dades reals.</b> Casos de còlera notificats a l'OMS per país i any, 1950–2024 (Our World in Data, actualització del 18-08-2026).[[owid]] Cada cercle se situa al centre geomètric del país amb les fronteres actuals (Natural Earth 1:110 M; per exemple, les dades de 1950 de Bangladesh corresponen al Pakistan Oriental) i la seva àrea és proporcional als casos. La sèrie de l'OMS comença el 1949; el mapa, el 1950. Les notificacions són incompletes: l'estimació de recerca que cita l'OMS és d'entre 1,3 i 4 milions de casos reals l'any.[[who,ali]] Les anotacions de la sèrie marquen el país amb més casos aquells anys segons les mateixes dades."),
 ("Una tassa d'aigua amb sucre i sal", "<b>Dades reals</b>: letalitat del 3,6 % entre els 3.700 malalts del camp que va fer servir la rehidratació oral[[nalin]] i del 20–30 % (estimació) als camps que només tenien sèrum intravenós (1971).[[fontaine]] És una comparació entre camps diferents, no un assaig controlat. Els 3,6 morts es representen amb tres punts sencers i un de clar; els punts en vermell clar de la dreta representen el marge entre el 20 i el 30 %."),
]
METODE = ("Aquest article combina <b>fonts primàries del segle XIX</b> llegides senceres (el llibre de Snow del 1855, l'informe de la parròquia de St. James del 1855 i l'informe de Farr del 1852, tots digitalitzats per la Wellcome Collection) amb <b>dades digitalitzades</b> del mapa de Snow, articles revisats per experts i les estadístiques de l'OMS. "
          "Les distàncies a peu sobre el mapa de Snow i el recompte de 373 morts més properes a la bomba de Broad Street són un càlcul propi. "
          "El mapa de l'expansió del 1817 és un esquema; els quadres de cases i el tall de terreny de Farr són il·lustratius, però les xifres són reals. "
          "El nombre exacte de morts del brot no es coneix: Snow en va comptar 616 atacs mortals, el seu mapa original en situava 574 i la digitalització de Dodson i Tobler, 578. El mapa no va ser l'eina amb què Snow va trobar la bomba: el va dibuixar el desembre del 1854, quan ja tenia la conclusió.")

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

desc = "Londres, 1854: més de cinc-centes morts en deu dies al voltant d'una bomba del Soho. No el va aturar cap mapa: un metge que preguntava casa per casa, un capellà i una ciutat que no se'ls va creure."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>El mapa que no va aturar el còlera · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="El mapa que no va aturar el còlera">
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
<script src="relleu-londres.js"></script>
<script src="tamesi.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
