#!/usr/bin/env python3
"""Genera web/articles/el-genoma-en-obert/index.html a partir de cos.html (text amb marques [[font#n]]) i fonts.py.
Les cites es numeren per ordre d'aparició (cites d'un sol clic, guia d'estil §1)."""
import re, os, html
from fonts import S
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../web/articles/el-genoma-en-obert/index.html")
body = open(os.path.join(HERE, "cos.html")).read()

GRAFICS = [
 ("Dotze dies de gener del 2020", "<b>Dades reals.</b> Cada vinyeta surt d'una font datada: l'arribada de la mostra, les 40 hores de feina, l'avís de Chen Yan-Mei a les 2 de la matinada del 5 de gener (hora de Xangai, que és la que dona la font: a l'eix, en hora universal, són les 18 h del dia 4), la pujada a l'NCBI i la trucada de l'11 de gener, del reportatge de <i>Nature</i> amb les paraules de Zhang Yong-Zhen;[[natura10#1,natura10#2,natura10#3,natura10#4]] les 44 persones ingressades a Wuhan, del comunicat de l'OMS del 5 de gener;[[don]] la data d'enviament (5 de gener) i d'alliberament (12 de gener) del registre MN908947, de GenBank i de les metadades del conjunt obert;[[genbank#2,genbank#3]] l'hora exacta del missatge del fòrum (11-01-2020, 01.05.33 UTC), de l'API de virological.org;[[virological#2]] els cinc genomes a GISAID i la primera anàlisi filogenètica, dels missatges del mateix fil;[[virological#6,virological#7]] el protocol de PCR a l'OMS el 13 de gener, de l'article de Corman et al.;[[corman#5]] i les dates de l'OMS, de la seva cronologia oficial.[[oms#2,oms#3,oms#4]] L'<b>inici de la barra de les 40 hores és un càlcul propi</b> (40 hores abans de l'avís); la font dona la durada, no l'hora d'inici. Les hores locals del dia 11 es calculen a partir de l'hora UTC (Xangai UTC+8, Sydney UTC+11, Nova York UTC−5). L'alçada dels carrils i la posició vertical de les vinyetes són esquemàtiques. Corman et al. parlen de quatre genomes dipositats a GISAID el 12 de gener i el missatge d'Andrew Rambaut en diu cinc; es dona la xifra del missatge."),
 ("Què surt d'un sol fitxer", "<b>Esquema amb dates reals.</b> El node d'origen és el genoma publicat l'11 de gener (MN908947.1), de 30.473 bases.[[genbank#1]] Les quatre branques, amb la seva data: el protocol de PCR, dissenyat sense material del virus, que arriba a l'OMS el 13-01-2020 i es publica el 23;[[corman#1,corman#4,corman#5]] les mutacions estabilitzadores posades a l'espícula en menys de 24 hores i el primer assaig en humans 66 dies després;[[corbett#1,corbett#2]] la classificació i el nom del virus pel comitè internacional de taxonomia i la nomenclatura de llinatges;[[gorbalenya,otoole]] i el seguiment de variants i de les introduccions en un territori.[[volz,deng]] Les partícules que circulen pels fils són il·lustratives: no representen cap flux mesurat."),
 ("L'arbre del virus, any per any", "<b>Dades reals.</b> Arbre filogenètic de la construcció oberta de Nextstrain <code>ncov_open_global_all-time</code> (construcció del 22-11-2026, descarregada el 24-11-2026): 5.979 nodes, 3.078 dels quals són genomes, triats per Nextstrain per representar la diversitat global des de l'inici de la pandèmia.[[nextstrain#1]] <b>No és l'arbre de tots els genomes</b>: és la mostra que Nextstrain publica, i per això Àsia hi surt més representada que en el recompte total. L'eix horitzontal és la data (inferida per Nextstrain quan la mostra no en porta); la posició vertical és l'ordre de les fulles a l'arbre i no té unitats. Color segons el continent del genoma; el clade és el que assigna Nextstrain."),
 ("Genomes publicats cada setmana", "<b>Dades reals</b>, comptatge propi. Genomes de SARS-CoV-2 de les metadades del conjunt obert de Nextstrain (dades d'INSDC/GenBank; fitxer del 22-11-2026), agrupats per la setmana en què es van publicar (<code>date_submitted</code>) i pel continent de la mostra: 9.445.676 genomes en 358 setmanes.[[nextstrain#2]] S'hi inclouen els registres amb hoste humà o sense hoste declarat. Les dues vistes són el recompte i la part de cada continent. <b>El pic de la setmana del 19-06-2023</b> (280.247 genomes) no és una onada: 270.808 són mostres europees recollides molt abans, dipositades totes alhora, amb una mitjana de 268 a 295 dies entre la recollida i la publicació (comptatge propi). No hi són els genomes compartits només a GISAID.[[brito#4]]"),
 ("D'on vénen els genomes oberts", "<b>Dades reals</b>, comptatge propi. Dels 9.445.676 genomes, els 9.414.376 que porten país i data de recollida, repartits pel país de la mostra (133 països); els Estats Units i el Regne Unit en sumen el 74,9 %.[[nextstrain#2,nextstrain#3]] Mapa del món en projecció Equal Earth; terra de Natural Earth 1:110 m (world-atlas 2.0.2). <b>Sense relleu</b>: és un mapa del món a escala de països i el relleu no hi aporta res. Àrea del cercle proporcional al recompte. El mapa <b>no</b> mostra quants genomes ha seqüenciat cada país, sinó quants n'hi ha a les bases obertes.[[brito#4,chen]]"),
 ("Com es va construir la norma", "<b>Dades reals.</b> Cada fita amb el seu document: 1665, el primer número de les <i>Philosophical Transactions</i>;[[ptrans]] 1996, els principis de Bermuda (domini públic i alliberament diari dels fragments de més d'1 kb), i 1997, la seva reafirmació en la segona reunió;[[bermuda96#1,bermuda96#2,bermuda96#6]] 2006–2007, Indonèsia retira les mostres d'A(H5N1) i l'Assemblea Mundial de la Salut aprova una resolució;[[fidler#1,fidler#4]] 2008, GISAID comença a funcionar amb accés amb condicions;[[elbe#1,elbe#4]] 2009, la proposta del taller de Toronto i el primer genoma complet de la grip A(H1N1) compartit el 25 d'abril;[[toronto,elbe#6]] 2015, la consulta de l'OMS a Ginebra;[[modjarrad#1]] 2018, la descripció de Nextstrain;[[hadfield]] 2020, l'11 de gener;[[virological#2]] 2021, la nomenclatura de llinatges.[[otoole]] La posició vertical i l'eix, amb el tall entre 1665 i 1996, són esquemàtics."),
 ("Quant es triga a compartir", "<b>Dades reals</b>, comptatge propi. Per cada genoma del conjunt obert amb data de recollida completa i data de publicació, els dies entre totes dues (només valors entre 0 i 400 dies: els genomes amb un retard més gran queden fora del càlcul, i el percentil 90 més alt de la sèrie és de 380 dies, el juliol del 2023); per mes de publicació, la mediana i el percentil 90, amb els mesos amb menys de 30 genomes exclosos (81 mesos; la mediana va de 15 dies el març del 2020 a 295 el juliol del 2023).[[nextstrain#2]] Les dues línies de referència són <b>d'una altra cosa</b> i serveixen de contrast: l'acord de Bermuda parla d'alliberar cada dia el que s'acaba de muntar,[[bermuda96#2]] i Brito et al. proposen 21 dies entre la recollida de la mostra i la publicació del genoma.[[brito#3]]"),
 ("La mateixa norma, dues realitats", "<b>Dades reals</b> publicades. Els dos indicadors són de Brito et al. (2022), que analitza 8.947.455 genomes compartits a GISAID durant els dos primers anys de pandèmia: la part dels països que van seqüenciar més del 0,5 % dels seus casos (78 % dels de renda alta, 42 % dels de renda baixa i mitjana) i la part dels genomes publicats en menys de 21 dies (25 % i 5 %).[[brito#1,brito#2,brito#4]]"),
]
METODE = ("Aquest article combina <b>dades pròpies</b> calculades sobre el conjunt obert de Nextstrain (metadades i arbre de <code>ncov_open_global_all-time</code>, amb dades d'INSDC/GenBank; fitxers del 22-11-2026, descarregats el 24-11-2026) amb <b>fonts primàries datades</b> (el missatge original de virological.org i la seva hora exacta, el registre de GenBank, la cronologia oficial de l'OMS, l'acta de la reunió de les Bermudes de 1996) i <b>articles revisats per experts</b>. "
          "Els comptatges propis són de genomes amb data de recollida i de publicació, i es diu a cada gràfic quins registres s'han exclòs. "
          "<b>Un límit important:</b> les bases obertes no contenen tots els genomes del món. Fins al juny del 2022 se n'havien compartit més d'11,3 milions a GISAID i més de 5,5 milions a les bases obertes;[[brito#4]] per això totes les xifres pròpies són del que hi ha en obert, i les comparacions entre països de renda alta i baixa es prenen d'estudis publicats que sí que van tenir accés a GISAID. "
          "<b>Les mides del genoma.</b> El fitxer publicat l'11 de gener del 2020 (MN908947.1) tenia 30.473 bases; la correcció del 17 de gener, que és la versió de referència, en té 29.903.[[genbank#1]] L'article dona «unes trenta mil lletres» quan parla del fitxer d'aquell dia. "
          "<b>Les dues dates del missatge.</b> Les fonts donen el 10 i l'11 de gener perquè el missatge és de les 01.05 UTC: l'article dona l'hora universal i les hores locals. Per la mateixa raó, l'equip de la vacuna compta 66 dies des del 10 de gener. "
          "<b>Què no hi surt.</b> El gener del 2020, el laboratori de Zhang Yong-Zhen va rebre una ordre governamental de «rectificació» i durant un temps no va poder estudiar el virus; ell diu que no va ser un càstig, sinó que els van demanar actualitzar els protocols de bioseguretat després d'unes obres, i que a finals de gener ja tornaven a seqüenciar coronavirus.[[natura10#7]] L'abril del 2024, <i>Nature</i> va explicar que havia acampat davant del seu laboratori després que el tanquessin, en una disputa amb el Centre Clínic de Salut Pública de Xangai que, segons la mateixa notícia, es va acabar resolent.[[nature2024#1,nature2024#2]] Cap font llegida no lliga aquests dos fets amb el fet d'haver compartit la seqüència, i per això l'article no els presenta com el preu que en va pagar.")

order, uses, cnt = [], {}, [0]
def cite(m):
    # una marca pot citar diverses afirmacions d'una mateixa font: es mostra un sol número
    # i data-c les llista totes (cites.js les subratlla totes).
    grup = {}
    for k in [k.strip() for k in m.group(1).split(",")]:
        key, _, j = k.partition("#"); j = int(j or 1)
        assert key in S, key
        assert j <= len(S[key][1]), k
        grup.setdefault(key, []).append(j)
    out = []
    for key, js in grup.items():
        if key not in order: order.append(key)
        n = order.index(key) + 1
        cnt[0] += 1; cid = f"c{cnt[0]}"
        uses.setdefault(key, []).append(cid)
        tgt = " ".join(f"u{n}-{j}" for j in js)
        out.append(f'<a href="#font-{n}" id="{cid}" data-c="{tgt}">{n}</a>')
    return '<sup class="nr">' + ",".join(out) + "</sup>"
MK = re.compile(r"\[\[([^\]]+)\]\]")
body = MK.sub(cite, body)
gr = []
for i, (t, txt) in enumerate(GRAFICS, 1):
    gr.append(f'    <li id="g-{i}"><b class="gt"><a class="bk" href="#gc-{i}" aria-label="Torna al gràfic">↑</a> {t}</b>{MK.sub(cite, txt)}</li>')
METODE_H = MK.sub(cite, METODE)
fts = []
for key in order:
    n = order.index(key) + 1; ref, sup = S[key]
    us = "; ".join(f'<span id="u{n}-{j}">{s}</span>' for j, s in enumerate(sup, 1))
    fts.append(f'    <li id="font-{n}"><a class="bk" href="#{uses[key][0]}" aria-label="Torna al text">↑</a> {ref}<span class="us">Hi recolza: {us}.</span></li>')
unused = [k for k in S if k not in order]
if unused: print("Fonts sense cap cita:", unused)
used = set()
for m in MK.finditer(open(os.path.join(HERE, "cos.html")).read() + "".join(t for _, t in GRAFICS) + METODE):
    for k in m.group(1).split(","):
        key, _, j = k.strip().partition("#"); used.add((key, int(j or 1)))
for key, (r, sup) in S.items():
    for j in range(1, len(sup)+1):
        if (key, j) not in used: print("No citat:", key, j)

desc = "L'11 de gener del 2020, un equip de Xangai va penjar en obert el genoma d'un virus nou, i dos dies després ja hi havia el protocol d'una prova per detectar-lo. És la història de com la ciència va aprendre a compartir les dades abans de publicar-les."
head = f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<script src="../../assets/ib-theme.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>El genoma que es va publicar en una nit · Inspired by Magazine</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="El genoma que es va publicar en una nit">
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
  <p>{METODE_H}</p>

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
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(OUT, "w").write(head + body + fonts)
print("fonts:", len(order), "cites:", cnt[0])
