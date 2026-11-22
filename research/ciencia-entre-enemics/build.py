#!/usr/bin/env python3
"""Genera web/articles/ciencia-entre-enemics/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/ciencia-entre-enemics/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Un continent congelat", "<b>Dades reals.</b> Terra: Natural Earth 1:50 m (world-atlas 2.0.2), projecció azimutal d'àrees iguals centrada al pol Sud, sense relleu perquè és un continent sencer i les tessel·les de relleu (Mercator) no arriben al pol. Paral·lel 60° S: àrea del Tractat.[[tractat#6]] Bases de l'Any Geofísic: taula de Wilson (1961) publicada per la NOAA, un punt per base, agrupades per país (no a la seva posició).[[noaaigy]] Sectors: meridians de les fonts oficials (Argentina 25°–74° O, Xile 53°–90° O, Regne Unit 20°–80° O, Austràlia 45°–160° E menys 136°–142° E, França 136°–142° E, Nova Zelanda 160° E–150° O).[[arg,chl,bat#1,aat,taaf,nzl]] Noruega no defineix meridians ni l'extensió cap al pol: el sector es dibuixa entre els límits dels veïns (20° O i 45° E) fins al pol, amb vora discontínua, i això és una suposició; el 1958 els Estats Units consideraven sense reclamar la zona cap al pol.[[nor,frus#2]] Estacions: recompte propi del fitxer de COMNAP del novembre del 2024; s'hi corregeix el signe de la latitud d'una pista d'aterratge xinesa (Zhongshan) i s'exclou l'illa Macquarie, fora de l'àrea del Tractat.[[comnap#1]]"),
 ("82 estacions, 29 banderes", "<b>Dades reals.</b> Recompte propi de les 82 instal·lacions de tipus «estació» al sud del 60° S del fitxer de COMNAP (novembre del 2024): país operador, any de fundació, temporada i capacitat màxima declarada. Inclou 9 estacions tancades temporalment (totes d'estiu). L'àrea del cercle és proporcional a la població màxima d'estiu; sis estacions no la declaren (cercle buit); les 76 que la declaren sumen 5.037 persones.[[comnap#1,comnap#2]]"),
 ("58 països; per votar, cal fer ciència (i que els altres hi consentin)", "<b>Dades reals.</b> Dates d'entrada en vigor o d'adhesió i d'estatus consultiu dels 58 països, de la llista oficial de la Secretaria del Tractat Antàrtic consultada el 20-11-2026. Per als dotze signataris i Polònia, la data és la d'entrada en vigor del Tractat (23-06-1961). Els noms segueixen la llista actual (Rússia per l'URSS; Txèquia s'hi compta des del 1993). L'estatus consultiu requereix recerca substancial i el consens de les parts consultives.[[atsparts#1,atsparts#2,tractat#8,ferrada]]"),
 ("3.623 metres de gel compartit", "<b>Dades reals.</b> Temperatura reconstruïda (diferència respecte a l'actual, a partir del deuteri; 3.311 mesures fins als 3.310 m, dibuixades 1 de cada 3) i CO₂ de les bombolles (283 mesures, edat del gas) de Vostok, cronologia GT4.[[vostokdata,petit#3]] La columna de gel és un esquema a escala de profunditat amb el color de la temperatura de cada tram; per sota dels 3.310 m el registre probablement està alterat i no es dibuixa.[[petit#2]] CO₂ del 2025: mitjana anual de Mauna Loa.[[mlo]]"),
 ("Del CERN dels dotze al CERN de 25 membres i 11 associats", "<b>Dades reals.</b> Cronologia oficial d'estats membres i associats del CERN (Iugoslàvia fins al 1961, Espanya del 1961 al 1969 i des del 1983, Txecoslovàquia del 1992 al 1993).[[cern#2]] Fets marcats: acord amb l'URSS (1967),[[courier]] proposta del web (1989) i programari del web al domini públic (1993),[[web#1,web#2]] fi de la cooperació amb Rússia (2024).[[cernru]]"),
 ("298 visitants, 26 països, una sola casa", "<b>Dades reals.</b> Persones que han visitat l'Estació Espacial Internacional per país, segons la NASA (consulta del 20-11-2026). Un punt per persona, dins d'un cercle per país d'àrea proporcional.[[issvis]]"),
 ("Un anell de 133 metres a Jordània", "<b>Esquema amb membres reals.</b> Els vuit membres de SESAME, Alemanya (associada) i els 19 observadors, segons la seva pàgina oficial.[[sesame#2]] Cada membre està unit a l'anell central, que representa el Consell on seuen tots; les línies no representen relacions bilaterals. L'anell evoca l'anell d'emmagatzematge de 133 m.[[sesame#1]]"),
]
METODE = ("Aquest article combina documents oficials (el text del Tractat Antàrtic i del Protocol de Madrid, decrets i pàgines governamentals sobre les reclamacions, resolucions de l'ONU), bases de dades públiques (la llista de parts del Tractat, el catàleg d'estacions de COMNAP, les dades del nucli de Vostok de la NOAA, les llistes del CERN, de la NASA i de SESAME) i articles revisats per experts. "
          "Tots els gràfics són de dades reals (els recomptes d'estacions són propis, a partir del fitxer de COMNAP), menys l'anell de SESAME, que és un esquema amb membres reals, i la columna de gel de Vostok, que és un esquema a escala. "
          "Les xifres de població de les estacions són màximes declarades, no la població d'hivern. L'article distingeix entre el que diu el Tractat i el que se'n diu sovint (per exemple, que la prohibició minera «caduca» el 2048, que és fals).")

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

desc = "En plena guerra freda, els rivals van congelar les disputes sobre l'Antàrtida i la van reservar a la pau i a la ciència. Del Tractat al CERN, l'estació espacial i SESAME: què aconsegueix la ciència entre enemics, i què no."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Ciència entre enemics · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="Ciència entre enemics">
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
<script src="antartida.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
